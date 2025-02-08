import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CFormInput,
  CFormSelect,
  CButton,
  CBadge,
  CSpinner,
  CAlert,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilFilter,
  cilSearch,
  cilCloudDownload,
  cilWarning,
  cilInfo,
  cilBug,
  cilCheckCircle,
  cilX,
  cilCalendar,
} from '@coreui/icons'
import { format } from 'date-fns'
import API_URL from '../../../config/api.js'

const Logs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const logLevels = {
    info: { color: 'info', icon: cilInfo },
    warning: { color: 'warning', icon: cilWarning },
    error: { color: 'danger', icon: cilBug },
    success: { color: 'success', icon: cilCheckCircle },
  }

  const timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
  ]

  useEffect(() => {
    fetchLogs()
    // Set up polling for real-time updates
    const interval = setInterval(fetchLogs, 30000)
    return () => clearInterval(interval)
  }, [selectedTimeRange, selectedLevel])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/logs`, {
        params: {
          timeRange: selectedTimeRange,
          level: selectedLevel !== 'all' ? selectedLevel : undefined,
        },
      })
      if (response.data.success) {
        setLogs(response.data.data)
      } else {
        setError(response.data.error || 'Failed to fetch logs')
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching logs')
    } finally {
      setLoading(false)
    }
  }

  const exportLogs = () => {
    const filteredLogs = getFilteredLogs()
    const csv = [
      ['Timestamp', 'Level', 'Message', 'Source', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        log.level,
        `"${log.message.replace(/"/g, '""')}"`,
        log.source,
        log.ip_address,
      ].join(',')),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const getFilteredLogs = () => {
    return logs.filter(log => {
      const matchesSearch = searchTerm === '' ||
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ip_address.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel

      return matchesSearch && matchesLevel
    })
  }

  const renderLogIcon = (level) => {
    const logLevel = logLevels[level] || { color: 'secondary', icon: cilX }
    return <CIcon icon={logLevel.icon} className={`text-${logLevel.color} me-2`} />
  }

  return (
    <CCard className="shadow-sm">
      <CCardHeader className="bg-light">
        <CRow className="align-items-center">
          <CCol>
            <h4 className="mb-0">System Logs</h4>
          </CCol>
          <CCol xs="auto">
            <CButton 
              color="primary" 
              variant="outline" 
              onClick={exportLogs}
              className="me-2"
            >
              <CIcon icon={cilCloudDownload} className="me-2" />
              Export
            </CButton>
          </CCol>
        </CRow>
      </CCardHeader>

      <CCardBody>
        <CRow className="mb-4 g-3">
          <CCol md={4}>
            <div className="search-box position-relative">
              <CFormInput
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-5"
              />
              <CIcon 
                icon={cilSearch} 
                className="position-absolute text-muted"
                style={{ left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </CCol>

          <CCol md={3}>
            <CFormSelect
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="all">All Levels</option>
              {Object.keys(logLevels).map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol md={3}>
            <CFormSelect
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </CFormSelect>
          </CCol>

          <CCol md={2}>
            <CDropdown className="w-100">
              <CDropdownToggle color="light" className="w-100">
                <CIcon icon={cilFilter} className="me-2" />
                Filters
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem>Filter by Source</CDropdownItem>
                <CDropdownItem>Filter by IP</CDropdownItem>
                <CDropdownItem>Custom Range</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CCol>
        </CRow>

        {loading && (
          <div className="text-center py-5">
            <CSpinner color="primary" />
          </div>
        )}

        {error && (
          <CAlert color="danger" className="mb-4">
            {error}
          </CAlert>
        )}

        {!loading && !error && getFilteredLogs().length === 0 && (
          <CAlert color="info" className="text-center">
            No logs found matching your criteria
          </CAlert>
        )}

        <div className="timeline-wrapper">
          {!loading &&
            !error &&
            getFilteredLogs().map((log, index) => (
              <div
                key={index}
                className="timeline-item p-3 mb-3 border rounded bg-white position-relative"
                style={{
                  marginLeft: '20px',
                  borderLeft: `4px solid var(--cui-${logLevels[log.level]?.color || 'secondary'}) !important`,
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    {renderLogIcon(log.level)}
                    <CBadge color={logLevels[log.level]?.color || 'secondary'} className="me-2">
                      {log.level.toUpperCase()}
                    </CBadge>
                    <small className="text-muted">
                      <CIcon icon={cilCalendar} className="me-1" />
                      {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                    </small>
                  </div>
                  <div>
                    <CBadge color="light" className="text-dark me-2">
                      {log.source}
                    </CBadge>
                    <CBadge color="light" className="text-dark">
                      {log.ip_address}
                    </CBadge>
                  </div>
                </div>
                <div className="ms-4 text-dark">{log.message}</div>
              </div>
            ))}
        </div>
      </CCardBody>

      <style>
        {`
          .timeline-wrapper {
            position: relative;
          }
          
          .timeline-item {
            transition: all 0.3s ease;
          }
          
          .timeline-item:hover {
            transform: translateX(5px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          
          .search-box input:focus {
            box-shadow: 0 0 0 0.25rem rgba(50, 31, 219, 0.25);
            border-color: #321fdb;
          }
        `}
      </style>
    </CCard>
  )
}

export default Logs