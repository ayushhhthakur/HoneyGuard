import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  CBadge,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import API_URL from '../../config/api'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'

const SEVERITY_COLORS = { low: 'secondary', medium: 'info', high: 'warning', critical: 'danger' }
const STATUS_COLORS = { open: 'danger', acknowledged: 'warning', resolved: 'success' }

const Alerts = () => {
  const { activeOrg, isAtLeast } = useAuth()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('open')

  const canResolve = isAtLeast('analyst')

  const load = useCallback(async () => {
    if (!activeOrg) return
    setLoading(true)
    try {
      const { data } = await axios.get(`${API_URL}/alerts`, {
        params: statusFilter === 'all' ? {} : { status: statusFilter },
      })
      setAlerts(data.data)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load alerts')
    } finally {
      setLoading(false)
    }
  }, [activeOrg, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  // Live updates: any INSERT on alerts for this org pops a toast and
  // prepends the row, so a fresh honeytoken trip shows up instantly without
  // a refresh.
  useEffect(() => {
    if (!activeOrg) return
    const channel = supabase
      .channel(`alerts-${activeOrg.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts', filter: `org_id=eq.${activeOrg.id}` },
        (payload) => {
          toast.warn(`🚨 New alert: ${payload.new.message}`)
          setAlerts((prev) => (statusFilter === 'all' || statusFilter === payload.new.status ? [payload.new, ...prev] : prev))
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'alerts', filter: `org_id=eq.${activeOrg.id}` },
        (payload) => {
          setAlerts((prev) => prev.map((a) => (a.id === payload.new.id ? payload.new : a)))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeOrg, statusFilter])

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/alerts/${id}`, { status })
      toast.success(`Alert marked ${status}`)
      setAlerts((prev) => (statusFilter === 'all' ? prev.map((a) => (a.id === id ? { ...a, status } : a)) : prev.filter((a) => a.id !== id)))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update alert')
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <strong>Alerts</strong>
            <CButtonGroup>
              {['open', 'acknowledged', 'resolved', 'all'].map((s) => (
                <CButton
                  key={s}
                  color={statusFilter === s ? 'warning' : 'secondary'}
                  variant={statusFilter === s ? undefined : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </CButton>
              ))}
            </CButtonGroup>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <CSpinner color="warning" />
            ) : alerts.length === 0 ? (
              <p className="text-body-secondary mb-0">No alerts here.</p>
            ) : (
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Message</CTableHeaderCell>
                    <CTableHeaderCell>Token</CTableHeaderCell>
                    <CTableHeaderCell>Severity</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Time</CTableHeaderCell>
                    {canResolve && <CTableHeaderCell></CTableHeaderCell>}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {alerts.map((a) => (
                    <CTableRow key={a.id}>
                      <CTableDataCell>{a.message}</CTableDataCell>
                      <CTableDataCell>
                        <code>{a.token}</code>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={SEVERITY_COLORS[a.severity]}>{a.severity}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={STATUS_COLORS[a.status]}>{a.status}</CBadge>
                      </CTableDataCell>
                      <CTableDataCell>{new Date(a.created_at).toLocaleString()}</CTableDataCell>
                      {canResolve && (
                        <CTableDataCell>
                          {a.status !== 'resolved' && (
                            <CButtonGroup size="sm">
                              {a.status === 'open' && (
                                <CButton color="warning" variant="outline" onClick={() => updateStatus(a.id, 'acknowledged')}>
                                  Acknowledge
                                </CButton>
                              )}
                              <CButton color="success" variant="outline" onClick={() => updateStatus(a.id, 'resolved')}>
                                Resolve
                              </CButton>
                            </CButtonGroup>
                          )}
                        </CTableDataCell>
                      )}
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Alerts
