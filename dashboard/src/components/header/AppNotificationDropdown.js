import React from 'react'
import { useNotifications } from '../../contexts/NotificationContext'
import {
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell } from '@coreui/icons'

const AppNotificationDropdown = () => {
  const { notifications } = useNotifications()

  return (
    <CDropdown>
      <CDropdownToggle className="py-0" caret={false} tag="div">
        <div className="position-relative d-inline-flex">
          <CIcon icon={cilBell} size="lg" className="text-gray-500" />
          {notifications.alerts > 0 && (
            <CBadge
              color="danger"
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
              }}
            >
              {notifications.alerts}
            </CBadge>
          )}
        </div>
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownHeader className="bg-light fw-semibold py-2">
          {notifications.alerts} open alert{notifications.alerts === 1 ? '' : 's'}
        </CDropdownHeader>
        {notifications.recent.length === 0 ? (
          <CDropdownItem disabled>Nothing to see here.</CDropdownItem>
        ) : (
          notifications.recent.map((a) => (
            <CDropdownItem key={a.id} href="#/alerts">
              <CIcon icon={cilBell} className="me-2" />
              {a.message}
            </CDropdownItem>
          ))
        )}
        <CDropdownDivider />
        <CDropdownItem href="#/alerts" className="text-center fw-semibold">
          View all alerts
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppNotificationDropdown
