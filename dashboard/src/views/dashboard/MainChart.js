import React, { useEffect, useRef } from 'react'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

const MainChart = () => {
  const chartRef = useRef(null)

  useEffect(() => {
    const handleColorSchemeChange = () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y.grid.borderColor = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          chartRef.current.update()
        })
      }
    }

    document.documentElement.addEventListener('ColorSchemeChange', handleColorSchemeChange)
    return () => {
      document.documentElement.removeEventListener('ColorSchemeChange', handleColorSchemeChange)
    }
  }, [chartRef])

  // Static data
  const chartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    visits: [65, 59, 84, 84, 79, 82, 88],
    uniqueVisitors: [45, 39, 64, 64, 59, 62, 68],
    avgTime: [35, 38, 42, 40, 43, 41, 44]
  }

  return (
    <CChartLine
      ref={chartRef}
      style={{ height: '300px', marginTop: '40px' }}
      data={{
        labels: chartData.labels,
        datasets: [
          {
            label: 'Total Visits',
            backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
            borderColor: getStyle('--cui-info'),
            pointHoverBackgroundColor: getStyle('--cui-info'),
            borderWidth: 2,
            data: chartData.visits,
            fill: true,
          },
          {
            label: 'Unique Visitors',
            backgroundColor: 'transparent',
            borderColor: getStyle('--cui-success'),
            pointHoverBackgroundColor: getStyle('--cui-success'),
            borderWidth: 2,
            data: chartData.uniqueVisitors,
          },
          {
            label: 'Average Time',
            backgroundColor: 'transparent',
            borderColor: getStyle('--cui-danger'),
            pointHoverBackgroundColor: getStyle('--cui-danger'),
            borderWidth: 1,
            borderDash: [8, 5],
            data: chartData.avgTime,
          },
        ],
      }}
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || ''
                if (label) {
                  label += ': '
                }
                if (context.dataset.label === 'Average Time') {
                  label += context.parsed.y + ' min'
                } else {
                  label += context.parsed.y
                }
                return label
              }
            }
          },
        },
        scales: {
          x: {
            grid: {
              color: getStyle('--cui-border-color-translucent'),
              drawOnChartArea: false,
            },
            ticks: {
              color: getStyle('--cui-body-color'),
            },
          },
          y: {
            beginAtZero: true,
            border: {
              color: getStyle('--cui-border-color-translucent'),
            },
            grid: {
              color: getStyle('--cui-border-color-translucent'),
            },
            ticks: {
              color: getStyle('--cui-body-color'),
              maxTicksLimit: 5,
              callback: function(value) {
                return value.toLocaleString()
              }
            },
          },
        },
        elements: {
          line: {
            tension: 0.4,
          },
          point: {
            radius: 2,
            hitRadius: 10,
            hoverRadius: 4,
            hoverBorderWidth: 3,
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
      }}
    />
  )
}

export default MainChart
