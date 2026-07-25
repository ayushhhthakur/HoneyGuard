import React from 'react'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBuilding, cilPlus } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const ROLE_COLORS = { owner: 'warning', admin: 'info', analyst: 'success', viewer: 'secondary' }

const OrgSwitcher = () => {
  const { organizations, activeOrg, switchOrg } = useAuth()
  const navigate = useNavigate()

  if (!activeOrg) return null

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle caret={false} className="d-flex align-items-center gap-2">
        <CIcon icon={cilBuilding} />
        <span className="d-none d-md-inline">{activeOrg.name}</span>
        <CBadge color={ROLE_COLORS[activeOrg.role]}>{activeOrg.role}</CBadge>
      </CDropdownToggle>
      <CDropdownMenu>
        {organizations.map((org) => (
          <CDropdownItem
            key={org.id}
            active={org.id === activeOrg.id}
            style={{ cursor: 'pointer' }}
            onClick={() => switchOrg(org.id)}
          >
            {org.name} <CBadge color={ROLE_COLORS[org.role]}>{org.role}</CBadge>
          </CDropdownItem>
        ))}
        <CDropdownItem style={{ cursor: 'pointer' }} onClick={() => navigate('/create-org')}>
          <CIcon icon={cilPlus} className="me-2" />
          New organization
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default OrgSwitcher
