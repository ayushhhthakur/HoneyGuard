import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeClosed } from '@coreui/icons'
import { useAuth } from '../../../contexts/AuthContext'

const ForgotPassword = () => {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Unable to send reset email')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5}>
            <CCard className="p-4">
              <CCardBody>
                <h1>Reset password</h1>
                <p className="text-body-secondary">
                  Enter your account email and we&apos;ll send you a reset link.
                </p>
                {error && <CAlert color="danger">{error}</CAlert>}
                {sent ? (
                  <CAlert color="success">
                    If an account exists for that email, a reset link is on its way.
                  </CAlert>
                ) : (
                  <CForm onSubmit={handleSubmit}>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilEnvelopeClosed} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </CInputGroup>
                    <CButton color="primary" type="submit" disabled={submitting}>
                      {submitting ? <CSpinner size="sm" /> : 'Send reset link'}
                    </CButton>
                  </CForm>
                )}
                <p className="text-body-secondary text-center mt-3 mb-0">
                  <Link to="/login">Back to login</Link>
                </p>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default ForgotPassword
