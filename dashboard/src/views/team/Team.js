import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUserPlus, cilTrash } from '@coreui/icons'
import API_URL from '../../config/api'
import { useAuth } from '../../contexts/AuthContext'

const ROLE_COLORS = { owner: 'warning', admin: 'info', analyst: 'success', viewer: 'secondary' }

const Team = () => {
  const { activeOrg, isAtLeast, profile } = useAuth()
  const [members, setMembers] = useState([])
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteModal, setInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('viewer')
  const [submitting, setSubmitting] = useState(false)

  const canManage = isAtLeast('admin')

  const load = useCallback(async () => {
    if (!activeOrg) return
    setLoading(true)
    try {
      const [membersRes, invitesRes] = await Promise.all([
        axios.get(`${API_URL}/orgs/${activeOrg.id}/members`),
        canManage
          ? axios.get(`${API_URL}/orgs/${activeOrg.id}/invites`)
          : Promise.resolve({ data: { data: [] } }),
      ])
      setMembers(membersRes.data.data)
      setInvites(invitesRes.data.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load team')
    } finally {
      setLoading(false)
    }
  }, [activeOrg, canManage])

  useEffect(() => {
    load()
  }, [load])

  const handleInvite = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post(`${API_URL}/orgs/${activeOrg.id}/invites`, { email: inviteEmail, role: inviteRole })
      toast.success(`Invite sent to ${inviteEmail}`)
      setInviteModal(false)
      setInviteEmail('')
      setInviteRole('viewer')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRoleChange = async (userId, role) => {
    try {
      await axios.patch(`${API_URL}/orgs/${activeOrg.id}/members/${userId}`, { role })
      toast.success('Role updated')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role')
    }
  }

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove this member from the organization?')) return
    try {
      await axios.delete(`${API_URL}/orgs/${activeOrg.id}/members/${userId}`)
      toast.success('Member removed')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove member')
    }
  }

  const handleRevokeInvite = async (inviteId) => {
    try {
      await axios.delete(`${API_URL}/orgs/${activeOrg.id}/invites/${inviteId}`)
      toast.success('Invite revoked')
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to revoke invite')
    }
  }

  if (!activeOrg) return <CSpinner color="warning" />

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{activeOrg.name}</strong> — Team members
            </div>
            {canManage && (
              <CButton color="warning" size="sm" onClick={() => setInviteModal(true)}>
                <CIcon icon={cilUserPlus} className="me-1" /> Invite teammate
              </CButton>
            )}
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <CSpinner color="warning" />
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Joined</CTableHeaderCell>
                    {canManage && <CTableHeaderCell></CTableHeaderCell>}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {members.map((m) => (
                    <CTableRow key={m.id}>
                      <CTableDataCell>{m.profiles?.full_name || '—'}</CTableDataCell>
                      <CTableDataCell>{m.profiles?.email}</CTableDataCell>
                      <CTableDataCell>
                        {canManage && m.profiles?.id !== profile?.id ? (
                          <CFormSelect
                            size="sm"
                            value={m.role}
                            style={{ width: 130 }}
                            onChange={(e) => handleRoleChange(m.profiles.id, e.target.value)}
                          >
                            <option value="viewer">Viewer</option>
                            <option value="analyst">Analyst</option>
                            <option value="admin">Admin</option>
                            <option value="owner">Owner</option>
                          </CFormSelect>
                        ) : (
                          <CBadge color={ROLE_COLORS[m.role]}>{m.role}</CBadge>
                        )}
                      </CTableDataCell>
                      <CTableDataCell>{new Date(m.created_at).toLocaleDateString()}</CTableDataCell>
                      {canManage && (
                        <CTableDataCell>
                          {m.profiles?.id !== profile?.id && (
                            <CButton color="danger" variant="ghost" size="sm" onClick={() => handleRemove(m.profiles.id)}>
                              <CIcon icon={cilTrash} />
                            </CButton>
                          )}
                        </CTableDataCell>
                      )}
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>

        {canManage && invites.length > 0 && (
          <CCard>
            <CCardHeader>Pending invites</CCardHeader>
            <CCardBody>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Email</CTableHeaderCell>
                    <CTableHeaderCell>Role</CTableHeaderCell>
                    <CTableHeaderCell>Expires</CTableHeaderCell>
                    <CTableHeaderCell></CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {invites.map((inv) => (
                    <CTableRow key={inv.id}>
                      <CTableDataCell>{inv.email}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={ROLE_COLORS[inv.role]}>{inv.role}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>{new Date(inv.expires_at).toLocaleDateString()}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="danger" variant="ghost" size="sm" onClick={() => handleRevokeInvite(inv.id)}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        )}
      </CCol>

      <CModal visible={inviteModal} onClose={() => setInviteModal(false)}>
        <CModalHeader>
          <CModalTitle>Invite a teammate</CModalTitle>
        </CModalHeader>
        <CForm onSubmit={handleInvite}>
          <CModalBody>
            <CFormInput
              className="mb-3"
              type="email"
              label="Email"
              placeholder="teammate@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <CFormSelect label="Role" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              <option value="viewer">Viewer — read-only</option>
              <option value="analyst">Analyst — manage tokens, resolve alerts</option>
              <option value="admin">Admin — manage team & everything else</option>
            </CFormSelect>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setInviteModal(false)}>
              Cancel
            </CButton>
            <CButton color="warning" type="submit" disabled={submitting}>
              {submitting ? <CSpinner size="sm" /> : 'Send invite'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </CRow>
  )
}

export default Team
