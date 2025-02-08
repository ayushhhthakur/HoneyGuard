import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../../config/api.js'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CAlert,
  CBadge,
  CRow,
  CCol,
  CListGroup,
  CListGroupItem,
  CLink,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCopy } from '@coreui/icons';

const TrackToken = () => {
  const { token } = useParams();
  const [tokenData, setTokenData] = useState(null);
  const [stats, setStats] = useState([]); // Ensure it's always an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Replace the hardcoded URLs with API_URL
    const fetchTokenData = async () => {
      try {
        const tokenResponse = await axios.get(`${API_URL}/tokens/id/${token}`);
        if (tokenResponse.data.success) {
          setTokenData(tokenResponse.data.data);
        } else {
          setError(tokenResponse.data.error || 'Failed to fetch token data');
        }

        // Fetch token logs
        const logsResponse = await axios.get(`${API_URL}/tokens/${token}/logs`);
        if (logsResponse.data.success) {
          setStats(Array.isArray(logsResponse.data.data) ? logsResponse.data.data : []);
        } else {
          setError(logsResponse.data.error || 'Failed to fetch token logs');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
  }, [token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status) => {
    const statusColors = {
      success: 'success',
      error: 'danger',
      warning: 'warning',
      info: 'info',
    };
    return statusColors[status.toLowerCase()] || 'info';
  };

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  }, []);

  if (loading) {
    return (
      <div className="text-center p-3">
        <CSpinner color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <CAlert color="danger" className="mb-4">
        {error}
      </CAlert>
    );
  }

  return (
    <CRow>
      {/* Token Metadata Card */}
      <CCol xs={12} className="mb-4">
        <CCard>
          <CCardHeader>
            <h4 className="mb-0">Token Information</h4>
          </CCardHeader>
          <CCardBody>
            <CListGroup flush>
              <CListGroupItem>
                <div className="d-flex justify-content-between align-items-center">
                  <strong>Token:</strong>
                  <div className="d-flex align-items-center">
                    <CLink className="me-2">
                      {token}
                    </CLink>
                  </div>
                </div>
              </CListGroupItem>

              {tokenData?.category === 'image' && (
                <>
                  <CListGroupItem>
                    <div className="d-flex justify-content-between align-items-center">
                      <strong>Image URL:</strong>
                      <div className="d-flex align-items-center">
                        <CLink href={`https://honeyguard.onrender.com/image/${token}`} target="_blank" className="me-2">
                          View Image
                        </CLink>
                        <button
                          onClick={() => copyToClipboard(tokenData.imageurl)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <CIcon icon={cilCopy} />
                        </button>
                      </div>
                    </div>
                  </CListGroupItem>
                  <CListGroupItem>
                    <div className="d-flex justify-content-between">
                      <strong>Filename:</strong>
                      <span>{tokenData?.filename}</span>
                    </div>
                  </CListGroupItem>
                  <CListGroupItem>
                    <div className="d-flex justify-content-between">
                      <strong>Mimetype:</strong>
                      <span>{tokenData?.mimetype}</span>
                    </div>
                  </CListGroupItem>
                  <CListGroupItem>
                    <div className="d-flex justify-content-between">
                      <strong>Size:</strong>
                      <span>{tokenData?.size} bytes</span>
                    </div>
                  </CListGroupItem>
                </>
              )}

              {tokenData?.category === 'aws' && (
                <>
                  <CListGroupItem>
                    <div className="d-flex justify-content-between">
                      <strong>AWS Region:</strong>
                      <span>{tokenData?.metadata?.region || 'N/A'}</span>
                    </div>
                  </CListGroupItem>
                  <CListGroupItem>
                    <div className="d-flex justify-content-between">
                      <strong>AWS Service:</strong>
                      <span>{tokenData?.metadata?.service || 'N/A'}</span>
                    </div>
                  </CListGroupItem>
                </>
              )}

              {tokenData?.category === 'financial' && (
                <CListGroupItem>
                  <div className="d-flex justify-content-between">
                    <strong>Financial Type:</strong>
                    <span>{tokenData?.metadata?.type || 'N/A'}</span>
                  </div>
                </CListGroupItem>
              )}

              {tokenData?.category === 'healthcare' && (
                <>
                  <CListGroupItem>
                    <div className="d-flex justify-content-between">
                      <strong>Healthcare System:</strong>
                      <span>{tokenData?.metadata?.system || 'N/A'}</span>
                    </div>
                  </CListGroupItem>
                  <CListGroupItem>
                    <div className="d-flex justify-content-between">
                      <strong>Patient ID Format:</strong>
                      <span>{tokenData?.metadata?.patientIdFormat || 'N/A'}</span>
                    </div>
                  </CListGroupItem>
                </>
              )}

              <CListGroupItem>
                <div className="d-flex justify-content-between align-items-center">
                  <strong>Status:</strong>
                  <CBadge color={tokenData?.is_active ? 'success' : 'danger'}>
                    {tokenData?.is_active ? 'Active' : 'Inactive'}
                  </CBadge>
                </div>
              </CListGroupItem>

              <CListGroupItem>
                <div className="d-flex justify-content-between">
                  <strong>Created At:</strong>
                  <span>{formatDate(tokenData?.created_at)}</span>
                </div>
              </CListGroupItem>
            </CListGroup>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Token Logs Card */}
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <h4 className="mb-0">Token Activity Logs</h4>
          </CCardHeader>
          <CCardBody>
            {stats.length === 0 ? (
              <CAlert color="info" className="mb-0">
                No logs found for this token.
              </CAlert>
            ) : (
              <CTable hover responsive align="middle" className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Timestamp</CTableHeaderCell>
                    <CTableHeaderCell>Event</CTableHeaderCell>
                    <CTableHeaderCell>Status</CTableHeaderCell>
                    <CTableHeaderCell>IP Address</CTableHeaderCell>
                    <CTableHeaderCell>OS</CTableHeaderCell>
                    <CTableHeaderCell>Browser</CTableHeaderCell>
                    <CTableHeaderCell>Device</CTableHeaderCell>
                    <CTableHeaderCell>Country</CTableHeaderCell>
                    <CTableHeaderCell>Region</CTableHeaderCell>
                    <CTableHeaderCell>City</CTableHeaderCell>
                    <CTableHeaderCell>Timezone</CTableHeaderCell>
                    <CTableHeaderCell>ISP</CTableHeaderCell>
                    <CTableHeaderCell>Token</CTableHeaderCell>
                    <CTableHeaderCell>User Agent</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {stats.map((stat, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell>{formatDate(stat.timestamp)}</CTableDataCell>
                      <CTableDataCell>{stat.event}</CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={getStatusColor(stat.status)}>
                          {stat.status}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>{stat.ip_address}</CTableDataCell>
                      <CTableDataCell>{stat.os}</CTableDataCell>
                      <CTableDataCell>{stat.browser}</CTableDataCell>
                      <CTableDataCell>{stat.device}</CTableDataCell>
                      <CTableDataCell>{stat.country}</CTableDataCell>
                      <CTableDataCell>{stat.region}</CTableDataCell>
                      <CTableDataCell>{stat.city}</CTableDataCell>
                      <CTableDataCell>{stat.timezone}</CTableDataCell>
                      <CTableDataCell>{stat.isp}</CTableDataCell>
                      <CTableDataCell>{stat.token}</CTableDataCell>
                      <CTableDataCell>{stat.user_agent}</CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default TrackToken;
