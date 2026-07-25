import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilBell, cilLockLocked, cilPeople } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import admin from './../../assets/images/avatars/admin.png'
import { useAuth } from '../../contexts/AuthContext'

const ROLE_COLORS = { owner: 'warning', admin: 'info', analyst: 'success', viewer: 'secondary' }

const AppHeaderDropdown = () => {
  const { profile, activeOrg, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={admin} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          {profile?.full_name || profile?.email}
          {role && (
            <CBadge color={ROLE_COLORS[role]} className="ms-2">
              {role}
            </CBadge>
          )}
        </CDropdownHeader>
        {activeOrg && (
          <CDropdownItem disabled className="text-body-secondary small">
            {activeOrg.name}
          </CDropdownItem>
        )}
        <CDropdownDivider />
        <CDropdownItem href="#/alerts">
          <CIcon icon={cilBell} className="me-2" />
          Alerts
        </CDropdownItem>
        <CDropdownItem href="#/team">
          <CIcon icon={cilPeople} className="me-2" />
          Team
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={handleLogout} style={{ cursor: 'pointer' }}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Sign out
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
