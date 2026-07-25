import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CAlert, CButton, CCard, CCardBody, CCol, CContainer, CRow, CSpinner } from '@coreui/react'
import { useAuth } from '../../../contexts/AuthContext'

const AcceptInvite = () => {
  const { session, loading: authLoading, acceptInvite } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('pending') // pending | working | success | error
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!session) return // guest view below handles this
    if (!token) {
      setStatus('error')
      setMessage('This invite link is missing its token.')
      return
    }

    setStatus('working')
    acceptInvite(token)
      .then((org) => {
        setStatus('success')
        setMessage(`You've joined ${org.name}.`)
        setTimeout(() => navigate('/dashboard', { replace: true }), 1800)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.response?.data?.error || err.message || 'Unable to accept this invite')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, session, token])

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5}>
            <CCard className="p-4">
              <CCardBody className="text-center">
                <h1>Team invite</h1>
                {!session && !authLoading && (
                  <>
                    <p className="text-body-secondary">Sign in (or create an account) with the email this invite was sent to, then come back to this link.</p>
                    <Link to={`/login?redirect=/accept-invite?token=${token}`}>
                      <CButton color="primary">Go to login</CButton>
                    </Link>
                  </>
                )}
                {(authLoading || status === 'working') && <CSpinner color="warning" />}
                {status === 'success' && <CAlert color="success">{message}</CAlert>}
                {status === 'error' && <CAlert color="danger">{message}</CAlert>}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default AcceptInvite
