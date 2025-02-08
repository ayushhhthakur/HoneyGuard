import React, { useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import API_URL from '../../config/api.js'
import axios from 'axios'

import {
  CRow,
  CCol,
  CWidgetStatsA,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine } from '@coreui/react-chartjs'

const REFRESH_INTERVAL = 30000; // 30 seconds

const WidgetsDropdown = (props) => {
  const [tokenCount, setTokenCount] = useState(null)
  const [logsCount, setLogsCount] = useState(null)
  const [tokenStats, setTokenStats] = useState({ labels: [], values: [] })
  const [activityStats, setActivityStats] = useState({ labels: [], suspicious: [], normal: [], values: [] })

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      // Fetch token count
      const tokenCountResponse = await axios.get(`${API_URL}/tokens/count`)
      if (tokenCountResponse.data.success) {
        setTokenCount(tokenCountResponse.data.data)
      }

      // Fetch logs count
      const logsCountResponse = await axios.get(`${API_URL}/logs/count`)
      if (logsCountResponse.data.success) {
        setLogsCount(logsCountResponse.data.data)
      }

      // Fetch token stats
      const tokenStatsResponse = await axios.get(`${API_URL}/api/stats/tokens`)
      if (tokenStatsResponse.data.success) {
        setTokenStats(tokenStatsResponse.data.data)
      }

      // Fetch activity stats
      const activityStatsResponse = await axios.get(`${API_URL}/api/stats/activity`)
      if (activityStatsResponse.data.success) {
        setActivityStats(activityStatsResponse.data.data)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Set up polling for real-time updates
  useEffect(() => {
    const intervalId = setInterval(fetchAllData, REFRESH_INTERVAL)
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId)
  }, [fetchAllData])

  // Helper function to get the latest 7 days of data
  const getLatestData = (data, count = 7) => {
    if (!data || !Array.isArray(data)) return new Array(count).fill(0)
    return data.slice(-count)
  }

  // Format date for tooltips
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    })
  }

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: {
          size: 12,
        },
        bodyFont: {
          size: 11,
        },
        padding: 8,
        cornerRadius: 4,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawTicks: false,
        },
        ticks: {
          display: true,
          font: {
            size: 9,
          },
          callback: function(value) {
            const label = this.getLabelForValue(value)
            return formatDate(label)
          },
        },
      },
      y: {
        min: 0,
        grid: {
          color: 'rgba(255,255,255,0.1)',
          drawBorder: false,
        },
        ticks: {
          display: true,
          font: {
            size: 9,
          },
          maxTicksLimit: 5,
        },
      },
    },
  }

  return (
    <CRow className={props.className} xs={{ gutter: 4 }}>
      <CCol sm={6}>
        <CWidgetStatsA
          color="info"
          value={tokenCount || '0'}
          title="Total Tokens"
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: getLatestData(tokenStats.labels),
                datasets: [
                  {
                    label: 'Tokens',
                    backgroundColor: 'rgba(255,255,255,.1)',
                    borderColor: 'rgba(255,255,255,.85)',
                    pointBackgroundColor: '#fff',
                    pointBorderColor: 'rgba(255,255,255,.85)',
                    data: getLatestData(tokenStats.values),
                    fill: true,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                ...baseChartOptions,
                elements: {
                  line: {
                    borderWidth: 2,
                  },
                  point: {
                    radius: 3,
                    hitRadius: 10,
                    hoverRadius: 5,
                    borderWidth: 2,
                  },
                },
                plugins: {
                  ...baseChartOptions.plugins,
                  tooltip: {
                    ...baseChartOptions.plugins.tooltip,
                    callbacks: {
                      title: (context) => formatDate(context[0].label),
                      label: (context) => `Tokens: ${context.raw}`,
                    },
                  },
                },
              }}
            />
          }
        />
      </CCol>

      <CCol sm={6}>
        <CWidgetStatsA
          color="warning"
          value={logsCount || '0'}
          title="Total Activities"
          chart={
            <CChartLine
              className="mt-3 mx-3"
              style={{ height: '70px' }}
              data={{
                labels: getLatestData(activityStats.labels),
                datasets: [
                  {
                    label: 'Activities',
                    backgroundColor: 'rgba(255,255,255,.1)',
                    borderColor: 'rgba(255,255,255,.85)',
                    pointBackgroundColor: '#fff',
                    pointBorderColor: 'rgba(255,255,255,.85)',
                    data: getLatestData(activityStats.values),
                    fill: true,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                ...baseChartOptions,
                elements: {
                  line: {
                    borderWidth: 2,
                  },
                  point: {
                    radius: 3,
                    hitRadius: 10,
                    hoverRadius: 5,
                    borderWidth: 2,
                  },
                },
                plugins: {
                  ...baseChartOptions.plugins,
                  tooltip: {
                    ...baseChartOptions.plugins.tooltip,
                    callbacks: {
                      title: (context) => formatDate(context[0].label),
                      label: (context) => `Activities: ${context.raw}`,
                    },
                  },
                },
              }}
            />
          }
        />
      </CCol>
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}

export default WidgetsDropdown
