import { axios, API_URL } from "./client";

export const orgsApi = {
  listMine: () => axios.get(`${API_URL}/orgs`),
  create: (name) => axios.post(`${API_URL}/orgs`, { name }),
  listMembers: (orgId) => axios.get(`${API_URL}/orgs/${orgId}/members`),
  changeMemberRole: (orgId, userId, role) =>
    axios.patch(`${API_URL}/orgs/${orgId}/members/${userId}`, { role }),
  removeMember: (orgId, userId) =>
    axios.delete(`${API_URL}/orgs/${orgId}/members/${userId}`),
  listInvites: (orgId) => axios.get(`${API_URL}/orgs/${orgId}/invites`),
  createInvite: (orgId, email, role) =>
    axios.post(`${API_URL}/orgs/${orgId}/invites`, { email, role }),
  revokeInvite: (orgId, inviteId) =>
    axios.delete(`${API_URL}/orgs/${orgId}/invites/${inviteId}`),
  acceptInvite: (token) =>
    axios.post(`${API_URL}/orgs/invites/accept`, { token }),
};

export default orgsApi;
