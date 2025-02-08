import React, { useState } from 'react'
import classNames from 'classnames'
import './Dashboard.css'

import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCol,
  CProgress,
  CRow,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CBadge,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
  cilReload,
  cilCalendar,
  cilArrowTop,
  cilArrowBottom,
  cilPeople,
  cilUser,
  cilSpeedometer,
  cilChart,
  cilOptions,
} from '@coreui/icons'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('Month')
  const [selectedCard, setSelectedCard] = useState(null)

  // Static progress data with enhanced information
  const progressData = [
    { 
      title: 'Total Visits',
      value: '29,703',
      unit: 'Users',
      percent: 40,
      color: 'success',
      trend: '+12.5%',
      trendUp: true,
      icon: cilPeople,
      details: 'Total number of visitors this period'
    },
    { 
      title: 'Unique Visitors',
      value: '24,093',
      unit: 'Users',
      percent: 20,
      color: 'info',
      trend: '+5.8%',
      trendUp: true,
      icon: cilUser,
      details: 'Number of unique visitors'
    },
    { 
      title: 'Page Views',
      value: '78,706',
      unit: 'Views',
      percent: 60,
      color: 'warning',
      trend: '-2.4%',
      trendUp: false,
      icon: cilChart,
      details: 'Total page views across all sessions'
    },
    { 
      title: 'Performance',
      value: '94.2',
      unit: 'Score',
      percent: 80,
      color: 'danger',
      trend: '+8.1%',
      trendUp: true,
      icon: cilSpeedometer,
      details: 'Overall system performance score'
    },
    { 
      title: 'Bounce Rate',
      value: '40.15',
      unit: '%',
      percent: 40.15,
      color: 'primary',
      trend: '-1.5%',
      trendUp: false,
      icon: cilOptions,
      details: 'Percentage of visitors who navigate away after one page'
    },
  ]

  const handleRefresh = () => {
    console.log('Refresh clicked')
  }

  const handleTimeRangeChange = (range) => {
    setTimeRange(range)
  }

  const handleDownload = () => {
    console.log('Download clicked')
  }

  const handleCardClick = (index) => {
    setSelectedCard(selectedCard === index ? null : index)
  }

  return (
    <>
      <WidgetsDropdown className="mb-4" />
      <CCard className="mb-4 shadow-sm">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0 d-flex align-items-center">
                <CIcon icon={cilChart} className="me-2" />
                Traffic
              </h4>
              <div className="small text-body-secondary">Real-time Analytics</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButtonGroup className="float-end">
                <CTooltip content="Refresh Data">
                  <CButton 
                    color="primary"
                    onClick={handleRefresh}
                    className="me-2 btn-icon"
                  >
                    <CIcon icon={cilReload} />
                  </CButton>
                </CTooltip>
                <CTooltip content="Download Report">
                  <CButton 
                    color="primary"
                    onClick={handleDownload}
                    className="me-2 btn-icon"
                  >
                    <CIcon icon={cilCloudDownload} />
                  </CButton>
                </CTooltip>
                <CDropdown>
                  <CDropdownToggle color="secondary" className="d-flex align-items-center">
                    <CIcon icon={cilCalendar} className="me-2" />
                    {timeRange}
                  </CDropdownToggle>
                  <CDropdownMenu>
                    {['Day', 'Week', 'Month', 'Year'].map((range) => (
                      <CDropdownItem 
                        key={range}
                        onClick={() => handleTimeRangeChange(range)}
                        active={range === timeRange}
                      >
                        {range}
                      </CDropdownItem>
                    ))}
                  </CDropdownMenu>
                </CDropdown>
              </CButtonGroup>
            </CCol>
          </CRow>
          <MainChart key={timeRange} />
        </CCardBody>
        <CCardFooter className="bg-transparent">
          <CRow
            xs={{ cols: 1, gutter: 4 }}
            sm={{ cols: 2 }}
            lg={{ cols: 4 }}
            xl={{ cols: 5 }}
            className="mb-2 text-center"
          >
            {progressData.map((item, index) => (
              <CCol
                className={classNames({
                  'd-none d-xl-block': index === progressData.length - 1,
                })}
                key={index}
              >
                <div 
                  className={`stat-card p-3 rounded ${selectedCard === index ? 'selected' : ''}`}
                  onClick={() => handleCardClick(index)}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="text-body-secondary d-flex align-items-center">
                      <CIcon icon={item.icon} className="me-2" />
                      {item.title}
                    </div>
                    <CTooltip content={item.details}>
                      <CBadge color={item.color} shape="rounded-pill" className="trend-badge">
                        <CIcon 
                          icon={item.trendUp ? cilArrowTop : cilArrowBottom} 
                          className="me-1"
                          size="sm"
                        />
                        {item.trend}
                      </CBadge>
                    </CTooltip>
                  </div>
                  <div className="fw-bold fs-4 mb-2">
                    {item.value}
                    <span className="fs-6 ms-1 text-body-secondary">{item.unit}</span>
                  </div>
                  <CProgress 
                    thin 
                    className="mt-2 progress-animated" 
                    color={item.color}
                    value={item.percent}
                    animated
                  />
                  {selectedCard === index && (
                    <div className="card-details mt-3 text-start small">
                      <div className="text-body-secondary">{item.details}</div>
                      <div className="mt-2">
                        <strong>Last updated:</strong> {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </div>
              </CCol>
            ))}
          </CRow>
        </CCardFooter>
      </CCard>
    </>
  )
}

export default Dashboard
