import { membershipsRepository } from '../repositories/memberships.repository.js';

export const getMe = async (profile, userId) => {
  const memberships = await membershipsRepository.listForUser(userId);
  return {
    profile,
    organizations: memberships.map((m) => ({ ...m.organizations, role: m.role })),
  };
};

export default { getMe };
