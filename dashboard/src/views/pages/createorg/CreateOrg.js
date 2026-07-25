import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormText,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilShieldAlt } from '@coreui/icons'
import { useAuth } from '../../../contexts/AuthContext'

const CreateOrg = () => {
  const { createOrganization, logout } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await createOrganization(name)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Unable to create organization')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={7} lg={6} xl={5}>
            <CCard className="p-4">
              <CCardBody className="text-center">
                <CIcon icon={cilShieldAlt} size="3xl" className="mb-3 text-warning" />
                <h1>Set up your organization</h1>
                <p className="text-body-secondary">
                  Every honeytoken, alert, and teammate lives inside an organization. You&apos;ll be
                  its owner and can invite your team afterwards from the Team page.
                </p>
                {error && <CAlert color="danger">{error}</CAlert>}
                <CForm onSubmit={handleSubmit} className="text-start">
                  <CFormInput
                    className="mb-1"
                    placeholder="e.g. Zenovia Security Team"
                    label="Organization name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <CFormText className="mb-3">You can rename this later.</CFormText>
                  <div className="d-grid">
                    <CButton color="warning" type="submit" disabled={submitting}>
                      {submitting ? <CSpinner size="sm" /> : 'Create organization'}
                    </CButton>
                  </div>
                </CForm>
                <CButton color="link" className="mt-3" onClick={logout}>
                  Sign out
                </CButton>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default CreateOrg
