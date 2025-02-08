import React from 'react'
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
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
  cilEnvelopeClosed,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useNotifications } from '../../contexts/NotificationContext'

const AppMessagesDropdown = () => {
  const { notifications } = useNotifications()

  return (
    <CDropdown>
      <CDropdownToggle 
        className="py-0" 
        caret={false}
        tag="div"
      >
        <div className="position-relative d-inline-flex">
          <CIcon icon={cilEnvelopeClosed} size="lg" className="text-gray-500" />
          {notifications.messages > 0 && (
            <CBadge 
              color="warning" 
              shape="rounded-circle"
              className="position-absolute"
              style={{ 
                padding: '0.4rem 0.45rem',
                fontSize: '0.75rem',
                top: '-8px',
                right: '-12px',
                minWidth: '1.2rem',
                height: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'none'  // Remove any transform
              }}
            >
              {notifications.messages}
            </CBadge>
          )}
        </div>
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">You have 4 new notifications</CDropdownHeader>
        <CDropdownItem href="#">
          <CIcon icon={cilBell} className="me-2" />
          Updates
          <CBadge color="info" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilEnvelopeClosed} className="me-2" />
          Messages
          <CBadge color="success" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilTask} className="me-2" />
          Tasks
          <CBadge color="danger" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilCommentSquare} className="me-2" />
          Comments
          <CBadge color="warning" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
        <CDropdownItem href="#">
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilCreditCard} className="me-2" />
          Payments
          <CBadge color="secondary" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilFile} className="me-2" />
          Projects
          <CBadge color="primary" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem href="#">
          <CIcon icon={cilLockLocked} className="me-2" />
          Lock Account
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppMessagesDropdown
