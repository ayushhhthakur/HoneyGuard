import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  CBadge,
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
  CTooltip,
  CButton,
} from '@coreui/react'
import API_URL from '../../config/api'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'

const Fingerprints = () => {
  const { activeOrg } = useAuth()
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeOrg) return
    setLoading(true)
    axios
      .get(`${API_URL}/fingerprints`)
      .then(({ data }) => setRows(data.data))
      .catch((err) => toast.error(err.response?.data?.error || 'Failed to load fingerprints'))
      .finally(() => setLoading(false))
  }, [activeOrg])

  useEffect(() => {
    if (!activeOrg) return
    const channel = supabase
      .channel(`fingerprints-${activeOrg.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'device_fingerprints', filter: `org_id=eq.${activeOrg.id}` },
        (payload) => setRows((prev) => [payload.new, ...prev]),
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [activeOrg])

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Device fingerprints</strong>{' '}
            <span className="text-body-secondary">— deep client signals captured when a honeytoken is touched</span>
          </CCardHeader>
          <CCardBody>
            {loading ? (
              <CSpinner color="warning" />
            ) : rows.length === 0 ? (
              <p className="text-body-secondary mb-0">
                No fingerprints captured yet. They show up here as soon as someone opens a honeytoken
                that embeds the collector script (<code>/fp.js</code>).
              </p>
            ) : (
              <CTable hover responsive small>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Token</CTableHeaderCell>
                    <CTableHeaderCell>IP</CTableHeaderCell>
                    <CTableHeaderCell>Platform</CTableHeaderCell>
                    <CTableHeaderCell>Screen</CTableHeaderCell>
                    <CTableHeaderCell>Timezone</CTableHeaderCell>
                    <CTableHeaderCell>Fonts</CTableHeaderCell>
                    <CTableHeaderCell>Flags</CTableHeaderCell>
                    <CTableHeaderCell>Time</CTableHeaderCell>
                    <CTableHeaderCell>Preview</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {rows.map((r) => (
                    <CTableRow key={r.id}>
                      <CTableDataCell>
                        <code>{r.token}</code>
                      </CTableDataCell>
                      <CTableDataCell>{r.ip_address}</CTableDataCell>
                      <CTableDataCell>{r.platform}</CTableDataCell>
                      <CTableDataCell>
                        {r.screen_resolution} @{r.pixel_ratio}x
                      </CTableDataCell>
                      <CTableDataCell>{r.timezone}</CTableDataCell>
                      <CTableDataCell>
                        <CTooltip content={(r.fonts || []).join(', ') || 'none detected'}>
                          <span>{(r.fonts || []).length} detected</span>
                        </CTooltip>
                      </CTableDataCell>
                      <CTableDataCell>
                        {r.webdriver && <CBadge color="danger" className="me-1">webdriver</CBadge>}
                        {r.incognito_guess && <CBadge color="secondary">private?</CBadge>}
                      </CTableDataCell>
                      <CTableDataCell>{new Date(r.created_at).toLocaleString()}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" variant="outline" size="sm" onClick={() => navigate(`/fingerprints/${r.id}`)}>
                          View details
                        </CButton>
                      </CTableDataCell>
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

export default Fingerprints
