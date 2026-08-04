import { ok, created } from '../core/ApiResponse.js';
import { getClientIp } from '../services/metadata.service.js';
import * as orgService from '../services/organization.service.js';

const actorOf = (req) => ({ id: req.user.id, email: req.user.email });

export const listMine = async (req, res) => ok(res, await orgService.listMyOrganizations(req.user.id));

export const create = async (req, res) =>
  created(res, await orgService.createOrganization({ actor: actorOf(req), name: req.body.name }));

export const listMembers = async (req, res) =>
  ok(res, await orgService.listMembers({ orgId: req.params.orgId, actor: actorOf(req) }));

export const changeMemberRole = async (req, res) =>
  ok(
    res,
    await orgService.changeMemberRole({
      orgId: req.params.orgId,
      actor: actorOf(req),
      targetUserId: req.params.userId,
      role: req.body.role,
      ipAddress: getClientIp(req),
    })
  );

export const removeMember = async (req, res) =>
  ok(
    res,
    await orgService.removeMember({
      orgId: req.params.orgId,
      actor: actorOf(req),
      targetUserId: req.params.userId,
      ipAddress: getClientIp(req),
    })
  );

export const listInvites = async (req, res) =>
  ok(res, await orgService.listPendingInvites({ orgId: req.params.orgId, actor: actorOf(req) }));

export const createInvite = async (req, res) =>
  created(
    res,
    await orgService.createInvite({
      orgId: req.params.orgId,
      actor: actorOf(req),
      email: req.body.email,
      role: req.body.role,
      ipAddress: getClientIp(req),
    })
  );

export const revokeInvite = async (req, res) =>
  ok(
    res,
    await orgService.revokeInvite({
      orgId: req.params.orgId,
      actor: actorOf(req),
      inviteId: req.params.inviteId,
      ipAddress: getClientIp(req),
    })
  );

export const acceptInvite = async (req, res) =>
  ok(res, await orgService.acceptInvite({ actor: actorOf(req), token: req.body.token, ipAddress: getClientIp(req) }));

export default {
  listMine,
  create,
  listMembers,
  changeMemberRole,
  removeMember,
  listInvites,
  createInvite,
  revokeInvite,
  acceptInvite,
};
