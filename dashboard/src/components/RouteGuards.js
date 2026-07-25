import React from 'react'
import PropTypes from 'prop-types'
import { Navigate, useLocation } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import { useAuth } from '../contexts/AuthContext'

const FullscreenSpinner = () => (
  <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
    <CSpinner color="warning" />
  </div>
)

export const ProtectedRoute = ({ children }) => {
  const { session, loading, organizations } = useAuth()
  const location = useLocation()

  if (loading) return <FullscreenSpinner />
  if (!session) return <Navigate to="/login" state={{ from: location }} replace />
  if (organizations.length === 0 && location.pathname !== '/create-org') {
    return <Navigate to="/create-org" replace />
  }
  return children
}

export const RequireRole = ({ roles, children }) => {
  const { role } = useAuth()
  if (!role || !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}

export const GuestOnlyRoute = ({ children }) => {
  const { session, loading } = useAuth()
  if (loading) return <FullscreenSpinner />
  if (session) return <Navigate to="/dashboard" replace />
  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
}

RequireRole.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
}

GuestOnlyRoute.propTypes = {
  children: PropTypes.node.isRequired,
}
