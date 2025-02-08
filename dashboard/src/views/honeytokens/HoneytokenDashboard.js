import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CBadge,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBell, cilShieldAlt } from '@coreui/icons';

const HoneytokenDashboard = () => {
  const [honeytokens, setHoneytokens] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateHoneytoken = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/generate-honeytoken`);
      setHoneytokens([...honeytokens, response.data.patient]);
      toast.success('New honeytoken generated successfully!', {
        position: "top-right",
        icon: "🎯"
      });
    } catch (err) {
      toast.error('Failed to generate honeytoken', {
        position: "top-right",
        icon: "⚠️"
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessLogs = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/access-logs`);
      const newLogs = response.data;
      
      // Check for new access attempts
      if (accessLogs.length > 0 && newLogs.length > accessLogs.length) {
        const newAttempts = newLogs.slice(0, newLogs.length - accessLogs.length);
        newAttempts.forEach(log => {
          toast.warning(
            `New access attempt detected!\nIP: ${log.ip_address}`,
            {
              position: "top-right",
              icon: "🚨",
              autoClose: false,
              closeOnClick: true
            }
          );
        });
      }
      
      setAccessLogs(newLogs);
    } catch (err) {
      console.error('Failed to fetch access logs:', err);
      toast.error('Failed to fetch access logs', {
        position: "top-right",
        icon: "⚠️"
      });
    }
  };

  useEffect(() => {
    fetchAccessLogs();
    const interval = setInterval(fetchAccessLogs, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (timestamp) => {
    const now = new Date();
    const accessTime = new Date(timestamp);
    const hoursDiff = (now - accessTime) / (1000 * 60 * 60);

    if (hoursDiff < 1) {
      return <CBadge color="danger">Recent</CBadge>;
    } else if (hoursDiff < 24) {
      return <CBadge color="warning">Today</CBadge>;
    } else {
      return <CBadge color="info">Old</CBadge>;
    }
  };

  return (
    <>
      <ToastContainer />
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <div>
                <CIcon icon={cilShieldAlt} className="me-2" />
                <strong>Healthcare Honeytoken Management</strong>
              </div>
              <CButton
                color="primary"
                onClick={generateHoneytoken}
                disabled={loading}
              >
                {loading ? (
                  <CSpinner size="sm" />
                ) : (
                  <>
                    <CIcon icon={cilBell} className="me-2" />
                    Generate New Honeytoken
                  </>
                )}
              </CButton>
            </CCardHeader>
            <CCardBody>
              <h4>Active Honeytokens</h4>
              <CTable hover responsive className="mb-4">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Patient ID</CTableHeaderCell>
                    <CTableHeaderCell>Name</CTableHeaderCell>
                    <CTableHeaderCell>Insurance Number</CTableHeaderCell>
                    <CTableHeaderCell>Tracking URL</CTableHeaderCell>
                    <CTableHeaderCell>Created At</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {honeytokens.map((token) => (
                    <CTableRow key={token.id}>
                      <CTableDataCell>{token.id}</CTableDataCell>
                      <CTableDataCell>{token.name}</CTableDataCell>
                      <CTableDataCell>{token.insurance_number}</CTableDataCell>
                      <CTableDataCell>
                        <a href={token.tracking_url} target="_blank" rel="noopener noreferrer">
                          {token.tracking_url}
                        </a>
                      </CTableDataCell>
                      <CTableDataCell>
                        {new Date(token.created_at).toLocaleString()}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>

              <h4>Access Logs</h4>
              <CTable hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>Timestamp</CTableHeaderCell>
                    <CTableHeaderCell>Patient ID</CTableHeaderCell>
                    <CTableHeaderCell>IP Address</CTableHeaderCell>
                    <CTableHeaderCell>User Agent</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {accessLogs.map((log) => (
                    <CTableRow key={log.id}>
                      <CTableDataCell>
                        {getStatusBadge(log.timestamp)}
                      </CTableDataCell>
                      <CTableDataCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </CTableDataCell>
                      <CTableDataCell>{log.patient_id}</CTableDataCell>
                      <CTableDataCell>{log.ip_address}</CTableDataCell>
                      <CTableDataCell>{log.user_agent}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default HoneytokenDashboard;