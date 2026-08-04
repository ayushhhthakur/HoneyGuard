import { organizationsRepository } from '../repositories/organizations.repository.js';
import { membershipsRepository } from '../repositories/memberships.repository.js';
import { invitesRepository } from '../repositories/invites.repository.js';
import { seedDefaultCategories } from './category.service.js';
import { recordAudit } from './audit.service.js';
import { ROLES, ROLE_RANK, AUDIT_ACTIONS } from '../config/constants.js';
import { BadRequestError, ForbiddenError, NotFoundError, ConflictError } from '../core/errors.js';
import { sanitizeText, sanitizeEmail, sanitizeSlugSegment } from '../core/sanitize.js';

export const listMyOrganizations = async (userId) => {
  const rows = await membershipsRepository.listForUser(userId);
  return rows.map((m) => ({ ...m.organizations, role: m.role }));
};

export const createOrganization = async ({ actor, name }) => {
  const cleanName = sanitizeText(name, { maxLength: 120 });
  if (!cleanName) throw new BadRequestError('Organization name is required');

  const baseSlug = sanitizeSlugSegment(cleanName) || 'org';
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const clash = await organizationsRepository.findBySlug(slug);
    if (!clash) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const org = await organizationsRepository.create({ name: cleanName, slug, created_by: actor.id });

  try {
    await membershipsRepository.create({ org_id: org.id, user_id: actor.id, role: ROLES.OWNER });
  } catch (error) {
    await organizationsRepository.deleteById(org.id);
    throw error;
  }

  await seedDefaultCategories(org.id, actor.id);

  recordAudit({ orgId: org.id, actorId: actor.id, action: AUDIT_ACTIONS.ORG_CREATED, targetType: 'organization', targetId: org.id });

  return { ...org, role: ROLES.OWNER };
};

const getMembershipOrThrow = async (orgId, userId) => {
  const membership = await membershipsRepository.findForUserInOrg(orgId, userId);
  if (!membership) throw new ForbiddenError('You are not a member of this organization');
  return membership;
};

const assertMinRole = (membership, minRole) => {
  if (ROLE_RANK[membership.role] < ROLE_RANK[minRole]) {
    throw new ForbiddenError(`Requires at least the '${minRole}' role`);
  }
};

export const listMembers = async ({ orgId, actor }) => {
  await getMembershipOrThrow(orgId, actor.id);
  return membershipsRepository.listForOrg(orgId);
};

export const changeMemberRole = async ({ orgId, actor, targetUserId, role, ipAddress }) => {
  const actingMembership = await getMembershipOrThrow(orgId, actor.id);
  assertMinRole(actingMembership, ROLES.ADMIN);

  if (!Object.values(ROLES).includes(role)) throw new BadRequestError('Invalid role');

  const targetMembership = await membershipsRepository.findForUserInOrg(orgId, targetUserId);
  const involvesOwnerTier = role === ROLES.OWNER || targetMembership?.role === ROLES.OWNER;
  if (involvesOwnerTier && actingMembership.role !== ROLES.OWNER) {
    throw new ForbiddenError('Only an owner can manage owner-level access');
  }

  const updated = await membershipsRepository.updateRole(orgId, targetUserId, role);

  recordAudit({
    orgId,
    actorId: actor.id,
    action: AUDIT_ACTIONS.MEMBER_ROLE_CHANGED,
    targetType: 'user',
    targetId: targetUserId,
    metadata: { newRole: role, previousRole: targetMembership?.role },
    ipAddress,
  });

  return updated;
};

export const removeMember = async ({ orgId, actor, targetUserId, ipAddress }) => {
  const actingMembership = await getMembershipOrThrow(orgId, actor.id);
  assertMinRole(actingMembership, ROLES.ADMIN);

  const target = await membershipsRepository.findForUserInOrg(orgId, targetUserId);
  if (target?.role === ROLES.OWNER) {
    const ownerCount = await membershipsRepository.countOwners(orgId);
    if (ownerCount <= 1) throw new BadRequestError('Cannot remove the last owner of an organization');
  }

  await membershipsRepository.remove(orgId, targetUserId);

  recordAudit({
    orgId,
    actorId: actor.id,
    action: AUDIT_ACTIONS.MEMBER_REMOVED,
    targetType: 'user',
    targetId: targetUserId,
    ipAddress,
  });

  return { message: 'Member removed' };
};

export const listPendingInvites = async ({ orgId, actor }) => {
  const membership = await getMembershipOrThrow(orgId, actor.id);
  assertMinRole(membership, ROLES.ADMIN);
  return invitesRepository.listPendingForOrg(orgId);
};

export const createInvite = async ({ orgId, actor, email, role, ipAddress }) => {
  const membership = await getMembershipOrThrow(orgId, actor.id);
  assertMinRole(membership, ROLES.ADMIN);

  const cleanEmail = sanitizeEmail(email);
  if (!cleanEmail.includes('@')) throw new BadRequestError('A valid email is required');
  if (![ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER].includes(role)) throw new BadRequestError('Invalid role');
  if (role === ROLES.ADMIN && membership.role !== ROLES.OWNER) {
    throw new ForbiddenError('Only an owner can invite someone as admin');
  }

  try {
    const invite = await invitesRepository.create({ org_id: orgId, email: cleanEmail, role, invited_by: actor.id });

    recordAudit({
      orgId,
      actorId: actor.id,
      action: AUDIT_ACTIONS.INVITE_CREATED,
      targetType: 'invite',
      targetId: invite.id,
      metadata: { email: cleanEmail, role },
      ipAddress,
    });

    return invite;
  } catch (error) {
    if (error.details?.dbCode === '23505') throw new ConflictError('There is already a pending invite for this email');
    throw error;
  }
};

export const revokeInvite = async ({ orgId, actor, inviteId, ipAddress }) => {
  const membership = await getMembershipOrThrow(orgId, actor.id);
  assertMinRole(membership, ROLES.ADMIN);

  await invitesRepository.revokeInOrg(orgId, inviteId);

  recordAudit({
    orgId,
    actorId: actor.id,
    action: AUDIT_ACTIONS.INVITE_REVOKED,
    targetType: 'invite',
    targetId: inviteId,
    ipAddress,
  });

  return { message: 'Invite revoked' };
};

export const acceptInvite = async ({ actor, token, ipAddress }) => {
  const invite = await invitesRepository.findPendingByToken(token);
  if (!invite) throw new NotFoundError('Invite not found or already used');

  if (new Date(invite.expires_at) < new Date()) {
    await invitesRepository.updateStatus(invite.id, { status: 'expired' });
    throw new BadRequestError('This invite has expired');
  }
  if (invite.email.toLowerCase() !== actor.email.toLowerCase()) {
    throw new ForbiddenError('This invite was sent to a different email address');
  }

  await membershipsRepository.upsert({ org_id: invite.org_id, user_id: actor.id, role: invite.role });
  await invitesRepository.updateStatus(invite.id, { status: 'accepted', accepted_at: new Date().toISOString() });

  recordAudit({
    orgId: invite.org_id,
    actorId: actor.id,
    action: AUDIT_ACTIONS.INVITE_ACCEPTED,
    targetType: 'invite',
    targetId: invite.id,
    ipAddress,
  });

  const org = await organizationsRepository.findById(invite.org_id);
  return { ...org, role: invite.role };
};

export default {
  listMyOrganizations,
  createOrganization,
  listMembers,
  changeMemberRole,
  removeMember,
  listPendingInvites,
  createInvite,
  revokeInvite,
  acceptInvite,
};
