import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import './Dashboard.css'

import { CButton, CCard, CCardBody, CCardFooter, CCol, CRow, CSpinner, CTooltip } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilReload, cilChart, cilFingerprint, cilBell, cilPeople, cilDevices } from '@coreui/icons'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import API_URL from '../../config/api'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'

const Dashboard = () => {
  const { activeOrg } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!activeOrg) return
    try {
      const { data } = await axios.get(`${API_URL}/stats/summary`)
      setSummary(data.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load dashboard summary')
    } finally {
      setLoading(false)
    }
  }, [activeOrg])

  useEffect(() => {
    load()
  }, [load])

  // Live counters: bump the relevant tile instantly instead of waiting for
  // the next poll, whenever a token/log/alert/fingerprint lands for this org.
  useEffect(() => {
    if (!activeOrg) return
    const channel = supabase
      .channel(`dashboard-${activeOrg.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tokens', filter: `org_id=eq.${activeOrg.id}` }, () =>
        setSummary((s) => (s ? { ...s, total_tokens: s.total_tokens + 1 } : s)),
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'token_logs', filter: `org_id=eq.${activeOrg.id}` }, () =>
        setSummary((s) => (s ? { ...s, total_logs: s.total_logs + 1 } : s)),
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts', filter: `org_id=eq.${activeOrg.id}` }, () =>
        setSummary((s) => (s ? { ...s, open_alerts: s.open_alerts + 1 } : s)),
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [activeOrg])

  const tiles = summary
    ? [
        { title: 'Total Tokens', value: summary.total_tokens, icon: cilFingerprint, color: 'info', href: '#/utils/Tokens' },
        { title: 'Total Log Events', value: summary.total_logs, icon: cilChart, color: 'success', href: '#/utils/logs' },
        { title: 'Open Alerts', value: summary.open_alerts, icon: cilBell, color: summary.open_alerts > 0 ? 'danger' : 'secondary', href: '#/alerts' },
        { title: 'Recent Unique Attackers', value: summary.unique_attackers_recent, icon: cilPeople, color: 'warning', href: '#/utils/maps' },
      ]
    : []

  return (
    <>
      <WidgetsDropdown className="mb-4" />

      {loading ? (
        <div className="text-center py-4">
          <CSpinner color="warning" />
        </div>
      ) : (
        <CRow className="mb-4 g-4">
          {tiles.map((tile) => (
            <CCol sm={6} lg={3} key={tile.title}>
              <a href={tile.href} className="text-decoration-none">
                <CCard className="h-100 shadow-sm">
                  <CCardBody className="d-flex align-items-center justify-content-between">
                    <div>
                      <div className="text-body-secondary small">{tile.title}</div>
                      <div className="fs-3 fw-bold">{tile.value}</div>
                    </div>
                    <CIcon icon={tile.icon} size="xl" className={`text-${tile.color}`} />
                  </CCardBody>
                </CCard>
              </a>
            </CCol>
          ))}
        </CRow>
      )}

      <CCard className="mb-4 shadow-sm">
        <CCardBody>
          <CRow>
            <CCol sm={8}>
              <h4 id="traffic" className="card-title mb-0 d-flex align-items-center">
                <CIcon icon={cilChart} className="me-2" />
                Honeytoken activity
              </h4>
              <div className="small text-body-secondary">Live — updates as tokens are created and triggered</div>
            </CCol>
            <CCol sm={4} className="d-none d-md-block text-end">
              <CTooltip content="Refresh now">
                <CButton color="primary" variant="outline" onClick={load}>
                  <CIcon icon={cilReload} />
                </CButton>
              </CTooltip>
            </CCol>
          </CRow>
          <MainChart />
        </CCardBody>
        <CCardFooter className="bg-transparent d-flex justify-content-between text-body-secondary small">
          <span>
            <CIcon icon={cilDevices} className="me-1" />
            Want deeper attacker signal? Check the{' '}
            <a href="#/fingerprints">Fingerprints</a> page.
          </span>
          <span>Organization: {activeOrg?.name}</span>
        </CCardFooter>
      </CCard>
    </>
  )
}

export default Dashboard
