import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CListGroup,
  CListGroupItem,
  CRow,
  CSpinner,
} from '@coreui/react'
import API_URL from '../../config/api'
import { useAuth } from '../../contexts/AuthContext'

const SectionItem = ({ label, value }) => (
  <CListGroupItem className="d-flex justify-content-between gap-3 align-items-start">
    <strong>{label}</strong>
    <span className="text-end text-break">{value ?? 'N/A'}</span>
  </CListGroupItem>
)

const FingerprintDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { activeOrg } = useAuth()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!activeOrg || !id) return

    setLoading(true)
    axios
      .get(`${API_URL}/fingerprints/${id}`)
      .then(({ data }) => {
        if (data.success) setRecord(data.data)
        else setError(data.error || 'Fingerprint not found')
      })
      .catch((err) => setError(err.response?.data?.error || err.message || 'Failed to load fingerprint'))
      .finally(() => setLoading(false))
  }, [activeOrg, id])

  if (loading) {
    return (
      <div className="text-center p-4">
        <CSpinner color="warning" />
      </div>
    )
  }

  if (error) {
    return <CAlert color="danger">{error}</CAlert>
  }

  if (!record) {
    return <CAlert color="info">No fingerprint data available.</CAlert>
  }

  const rawEntries = Object.entries(record.raw || {})
    .filter(([key]) => !['fingerprintHash', 'canvasHash', 'webglHash', 'webglVendor', 'webglRenderer', 'audioHash'].includes(key))
    .slice(0, 50)

  return (
    <CRow className="g-3">
      <CCol xs={12} className="d-flex justify-content-between align-items-center">
        <div>
          <h3 className="mb-1">Fingerprint Details</h3>
          <div className="text-body-secondary">Deep client signals for token <code>{record.token}</code></div>
        </div>
        <CButton color="light" onClick={() => navigate('/fingerprints')}>
          Back to list
        </CButton>
      </CCol>

      <CCol lg={6}>
        <CCard className="h-100">
          <CCardHeader>
            <strong>Identity</strong>
          </CCardHeader>
          <CCardBody className="p-0">
            <CListGroup flush>
              <SectionItem label="Token" value={<code>{record.token}</code>} />
              <SectionItem label="IP Address" value={record.ip_address} />
              <SectionItem label="User Agent" value={record.user_agent} />
              <SectionItem label="Created At" value={new Date(record.created_at).toLocaleString()} />
              <SectionItem label="Flag" value={record.webdriver ? <CBadge color="danger">webdriver</CBadge> : <CBadge color="success">clean</CBadge>} />
              <SectionItem label="Private Mode" value={record.incognito_guess ? <CBadge color="secondary">possible</CBadge> : <CBadge color="success">no signal</CBadge>} />
            </CListGroup>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg={6}>
        <CCard className="h-100">
          <CCardHeader>
            <strong>Device & Rendering</strong>
          </CCardHeader>
          <CCardBody className="p-0">
            <CListGroup flush>
              <SectionItem label="Platform" value={record.platform} />
              <SectionItem label="Screen" value={record.screen_resolution} />
              <SectionItem label="Color Depth" value={record.color_depth} />
              <SectionItem label="Pixel Ratio" value={record.pixel_ratio} />
              <SectionItem label="Timezone" value={record.timezone} />
              <SectionItem label="Languages" value={(record.languages || []).join(', ')} />
              <SectionItem label="Hardware Concurrency" value={record.hardware_concurrency} />
              <SectionItem label="Device Memory" value={record.device_memory} />
            </CListGroup>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg={6}>
        <CCard className="h-100">
          <CCardHeader>
            <strong>Fingerprint Hashes</strong>
          </CCardHeader>
          <CCardBody className="p-0">
            <CListGroup flush>
              <SectionItem label="Fingerprint Hash" value={<code>{record.fingerprint_hash}</code>} />
              <SectionItem label="Canvas" value={<code>{record.canvas_hash}</code>} />
              <SectionItem label="WebGL" value={<code>{record.webgl_hash}</code>} />
              <SectionItem label="Vendor" value={record.webgl_vendor} />
              <SectionItem label="Renderer" value={record.webgl_renderer} />
              <SectionItem label="Audio" value={<code>{record.audio_hash}</code>} />
            </CListGroup>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol lg={6}>
        <CCard className="h-100">
          <CCardHeader>
            <strong>Browser Signals</strong>
          </CCardHeader>
          <CCardBody className="p-0">
            <CListGroup flush>
              <SectionItem label="Fonts" value={(record.fonts || []).join(', ') || 'none'} />
              <SectionItem label="Plugins" value={(record.plugins || []).join(', ') || 'none'} />
              <SectionItem label="Cookies Enabled" value={String(record.cookies_enabled)} />
              <SectionItem label="Do Not Track" value={record.do_not_track} />
              <SectionItem label="Touch Support" value={String(record.touch_support)} />
              <SectionItem label="Raw Payload Keys" value={Object.keys(record.raw || {}).length} />
            </CListGroup>
          </CCardBody>
        </CCard>
      </CCol>

      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <strong>Raw Payload</strong>
          </CCardHeader>
          <CCardBody>
            <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(Object.fromEntries(rawEntries), null, 2)}
            </pre>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default FingerprintDetail