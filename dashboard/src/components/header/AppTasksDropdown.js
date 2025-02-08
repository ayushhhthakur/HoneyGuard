import React from 'react'
import { useNotifications } from '../../contexts/NotificationContext'
import {
  CBadge,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilList } from '@coreui/icons'

const AppTasksDropdown = () => {
  const { notifications } = useNotifications()

  return (
    <CDropdown>
      <CDropdownToggle 
        className="py-0" 
        caret={false}
        tag="div"
      >
        <div className="position-relative d-inline-flex">
          <CIcon icon={cilList} size="lg" className="text-gray-500" />
          {notifications.tasks > 0 && (
            <CBadge 
              color="info" 
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
                justifyContent: 'center'
              }}
            >
              {notifications.tasks}
            </CBadge>
          )}
        </div>
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownHeader className="bg-light fw-semibold py-2">
          You have {notifications.tasks} tasks
        </CDropdownHeader>
        <CDropdownItem>
          <CIcon icon={cilList} className="me-2" />
          New Task
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppTasksDropdown
