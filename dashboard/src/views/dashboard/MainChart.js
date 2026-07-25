import React, { useEffect, useRef, useState, useCallback } from 'react'
import axios from 'axios'
import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import API_URL from '../../config/api'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'

const MainChart = () => {
  const chartRef = useRef(null)
  const { activeOrg } = useAuth()
  const [tokenStats, setTokenStats] = useState({ labels: [], values: [] })
  const [activityStats, setActivityStats] = useState({ labels: [], values: [] })

  const load = useCallback(async () => {
    if (!activeOrg) return
    try {
      const [tokensRes, activityRes] = await Promise.all([
        axios.get(`${API_URL}/stats/tokens`),
        axios.get(`${API_URL}/stats/activity`),
      ])
      if (tokensRes.data.success) setTokenStats(tokensRes.data.data)
      if (activityRes.data.success) setActivityStats(activityRes.data.data)
    } catch (err) {
      console.error('Failed to load chart data:', err)
    }
  }, [activeOrg])

  useEffect(() => {
    load()
  }, [load])

  // Live-refresh the chart whenever a new log or token lands for this org,
  // instead of polling — Supabase Realtime pushes it to us.
  useEffect(() => {
    if (!activeOrg) return
    const channel = supabase
      .channel(`main-chart-${activeOrg.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'token_logs', filter: `org_id=eq.${activeOrg.id}` }, load)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tokens', filter: `org_id=eq.${activeOrg.id}` }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [activeOrg, load])

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

  // Merge both series onto a shared date axis so the chart doesn't break
  // when tokens and activity were logged on different days.
  const labels = Array.from(new Set([...tokenStats.labels, ...activityStats.labels])).sort()
  const tokensByDate = Object.fromEntries(tokenStats.labels.map((l, i) => [l, tokenStats.values[i]]))
  const activityByDate = Object.fromEntries(activityStats.labels.map((l, i) => [l, activityStats.values[i]]))

  const noData = labels.length === 0

  return (
    <div style={{ position: 'relative' }}>
      {noData && (
        <div
          className="text-body-secondary text-center"
          style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          No activity yet — deploy a honeytoken to start seeing data here.
        </div>
      )}
      <CChartLine
        ref={chartRef}
        style={{ height: '300px', marginTop: '40px', opacity: noData ? 0.15 : 1 }}
        data={{
          labels,
          datasets: [
            {
              label: 'Tokens Created',
              backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
              borderColor: getStyle('--cui-info'),
              pointHoverBackgroundColor: getStyle('--cui-info'),
              borderWidth: 2,
              data: labels.map((d) => tokensByDate[d] || 0),
              fill: true,
            },
            {
              label: 'Honeytoken Activity',
              backgroundColor: 'transparent',
              borderColor: getStyle('--cui-warning'),
              pointHoverBackgroundColor: getStyle('--cui-warning'),
              borderWidth: 2,
              data: labels.map((d) => activityByDate[d] || 0),
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
                precision: 0,
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
            intersect: false,
          },
        }}
      />
    </div>
  )
}

export default MainChart
