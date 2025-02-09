import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../../../config/api.js";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CListGroup,
  CListGroupItem,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell
} from "@coreui/react";

const Stats = () => {
  const { token } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/tokens/${token}/stats`);
        if (response.data.success) {
          setStats(response.data.data);
        } else {
          setError(response.data.error || 'Failed to fetch stats');
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        setError(error.message || 'An error occurred while fetching stats');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

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

  if (!stats) {
    return (
      <CAlert color="info" className="mb-4">
        No statistics available for this token.
      </CAlert>
    );
  }

  return (
    <CCard>
      <CCardHeader>
        <h4>Token Statistics</h4>
      </CCardHeader>
      <CCardBody>
        <CListGroup flush>
          <CListGroupItem>
            <strong>Total Accesses:</strong> {stats.total_accesses}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Successful Accesses:</strong> {stats.successful_accesses}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Failed Accesses:</strong> {stats.failed_accesses}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Unique Visitors:</strong> {stats.unique_visitors}
          </CListGroupItem>
          <CListGroupItem>
            <strong>Latest Access:</strong> {stats.latest_access ? new Date(stats.latest_access).toLocaleString() : 'N/A'}
          </CListGroupItem>
        </CListGroup>

        {stats.logs && stats.logs.length > 0 && (
          <>
            <h5 className="mt-4">Access Logs</h5>
            <CTable striped hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Timestamp</CTableHeaderCell>
                  <CTableHeaderCell>IP Address</CTableHeaderCell>
                  <CTableHeaderCell>Location</CTableHeaderCell>
                  <CTableHeaderCell>Browser</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {stats.logs.map((log, index) => (
                  <CTableRow key={index}>
                    <CTableDataCell>{new Date(log.timestamp).toLocaleString()}</CTableDataCell>
                    <CTableDataCell>{log.ip_address}</CTableDataCell>
                    <CTableDataCell>{`${log.city}, ${log.country}`}</CTableDataCell>
                    <CTableDataCell>{log.browser}</CTableDataCell>
                    <CTableDataCell>{log.status}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </>
        )}
      </CCardBody>
    </CCard>
  );
};

export default Stats;
