import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTable,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableHead,
  CTableDataCell,
  CSpinner,
  CAlert,
  CButtonGroup,
  CLink,
  CBadge,
  CButton,
  CFormInput,
  CFormSelect,
  CRow,
  CCol,
  CTooltip,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { 
  cilCopy, 
  cilTrash, 
  cilPencil, 
  cilSearch,
  cilFilter,
  cilSortAscending,
  cilSortDescending,
  cilOptions,
  cilChartLine,
} from "@coreui/icons";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';
import API_URL from '../../../config/api.js';
import { toast } from 'react-toastify';

const Track = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    fetchTokens();
    // Check system preference for dark mode
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeQuery.matches);
    
    const darkModeHandler = (e) => setIsDarkMode(e.matches);
    darkModeQuery.addListener(darkModeHandler);
    
    return () => darkModeQuery.removeListener(darkModeHandler);
  }, []);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/tokens`);
      if (response.data.success) {
        setTokens(response.data.data);
      } else {
        setError(response.data.error || "Failed to fetch tokens");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching tokens");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedAndFilteredTokens = () => {
    return tokens
      .filter(token => {
        const matchesSearch = 
          token.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
          token.tokenName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" || token.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const direction = sortDirection === "asc" ? 1 : -1;
        if (sortField === "created_at") {
          return direction * (new Date(a.created_at) - new Date(b.created_at));
        }
        return direction * (a[sortField] < b[sortField] ? -1 : 1);
      });
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return <CIcon icon={cilOptions} />;
    return <CIcon icon={sortDirection === "asc" ? cilSortAscending : cilSortDescending} />;
  };

  const handleDeleteToken = async (token) => {
    if (!window.confirm("Are you sure you want to delete this token?")) {
      return;
    }
    try {
      const response = await axios.delete(`${API_URL}/tokens/${token}`);
      if (response.data.success) {
        setTokens(prevTokens => prevTokens.filter(t => t.token !== token));
      } else {
        setError(response.data.error || "Failed to delete token");
      }
    } catch (err) {
      setError(err.message || "An error occurred while deleting token");
      console.error(err);
    }
  };

  return (
    <div className={`track-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <CCard className="border-0 shadow-sm">
        <CCardHeader className="bg-transparent border-bottom-0">
          <CRow className="align-items-center">
            <CCol>
              <h4 className="mb-0">Active Tokens</h4>
            </CCol>
            <CCol xs="auto">
              <CButton 
                color="primary" 
                onClick={() => navigate('/utils/tokens')}
                className="d-flex align-items-center"
              >
                <CIcon icon={cilPencil} className="me-2" />
                Create New Token
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>

        <CCardBody>
          <CRow className="mb-4 g-3">
            <CCol md={6}>
              <div className="search-container">
                <CFormInput
                  type="text"
                  placeholder="Search tokens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <CIcon icon={cilSearch} className="search-icon" />
              </div>
            </CCol>
            <CCol md={3}>
              <CFormSelect
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="image">Image Token</option>
                <option value="aws">AWS Token</option>
                <option value="financial">Financial Token</option>
                <option value="healthcare">Healthcare Token</option>
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CDropdown className="w-100">
                <CDropdownToggle color="light" className="w-100">
                  <CIcon icon={cilFilter} className="me-2" />
                  More Filters
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem>Active Tokens</CDropdownItem>
                  <CDropdownItem>Inactive Tokens</CDropdownItem>
                  <CDropdownItem>Custom Date Range</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CCol>
          </CRow>

          {loading && (
            <div className="text-center py-5">
              <CSpinner color="primary" />
            </div>
          )}

          {error && (
            <CAlert color="danger" className="mb-4">
              {error}
            </CAlert>
          )}

          {!loading && !error && getSortedAndFilteredTokens().length === 0 && (
            <CAlert color="info" className="text-center">
              No tokens found matching your criteria
            </CAlert>
          )}

          {!loading && !error && getSortedAndFilteredTokens().length > 0 && (
            <div className="table-responsive">
              <CTable hover align="middle" className="mb-0 token-table">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell onClick={() => handleSort("token")} className="sortable-header">
                      Token {renderSortIcon("token")}
                    </CTableHeaderCell>
                    <CTableHeaderCell onClick={() => handleSort("category")} className="sortable-header">
                      Category {renderSortIcon("category")}
                    </CTableHeaderCell>
                    <CTableHeaderCell onClick={() => handleSort("tokenName")} className="sortable-header">
                      Token Name {renderSortIcon("tokenName")}
                    </CTableHeaderCell>
                    <CTableHeaderCell onClick={() => handleSort("is_active")} className="sortable-header">
                      Status {renderSortIcon("is_active")}
                    </CTableHeaderCell>
                    <CTableHeaderCell>Analytics</CTableHeaderCell>
                    <CTableHeaderCell>Actions</CTableHeaderCell>
                    <CTableHeaderCell onClick={() => handleSort("created_at")} className="sortable-header">
                      Created At {renderSortIcon("created_at")}
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {getSortedAndFilteredTokens().map((token) => (
                    <CTableRow key={token.token} className="token-row">
                      <CTableDataCell>
                        <CTooltip content="Click to copy token">
                          <div
                            onClick={() => handleCopy(token.token)}
                            className="token-cell"
                          >
                            {token.token.substring(0, 15)}...
                            <CIcon icon={cilCopy} className="ms-2" />
                          </div>
                        </CTooltip>
                      </CTableDataCell>

                      <CTableDataCell>
                        {token.category === 'image' ? (
                          <CTooltip content="View image">
                            <CLink 
                              href={token.imageurl} 
                              target="_blank"
                              className="category-link"
                            >
                              View Image
                            </CLink>
                          </CTooltip>
                        ) : (
                          <CBadge 
                            color="info" 
                            className="category-badge"
                            shape="rounded-pill"
                          >
                            {token.category.toUpperCase()}
                          </CBadge>
                        )}
                      </CTableDataCell>

                      <CTableDataCell>{token.tokenName}</CTableDataCell>

                      <CTableDataCell>
                        <CBadge 
                          color={token.is_active ? "success" : "danger"}
                          className="status-badge"
                          shape="rounded-pill"
                        >
                          {token.is_active ? "Active" : "Inactive"}
                        </CBadge>
                      </CTableDataCell>

                      <CTableDataCell>
                        <CButton 
                          color="light" 
                          variant="ghost"
                          onClick={() => navigate(`/utils/track/${token.token}`)}
                          className="analytics-button"
                        >
                          <CIcon icon={cilChartLine} className="me-2" />
                          View Logs
                        </CButton>
                      </CTableDataCell>

                      <CTableDataCell>
                        <CButtonGroup>
                          <CTooltip content="Delete token">
                            <CButton 
                              color="danger" 
                              variant="ghost"
                              onClick={() => handleDeleteToken(token.token)}
                              className="action-button"
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </CTooltip>
                        </CButtonGroup>
                      </CTableDataCell>

                      <CTableDataCell>
                        {format(new Date(token.created_at), 'MMM dd, yyyy HH:mm')}
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CCardBody>
      </CCard>

      <style>
        {`
          .track-container {
            transition: all 0.3s ease;
          }
          
          .dark-mode {
            background-color: var(--cui-dark);
            color: var(--cui-light);
          }
          
          .dark-mode .card {
            background-color: var(--cui-gray-900);
            border-color: var(--cui-gray-800);
          }
          
          .dark-mode .table {
            color: var(--cui-light);
          }
          
          .search-container {
            position: relative;
          }
          
          .search-icon {
            position: absolute;
            right: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--cui-gray-500);
          }
          
          .token-row {
            transition: all 0.2s ease;
          }
          
          .token-row:hover {
            background-color: var(--cui-gray-100);
            transform: translateX(5px);
          }
          
          .dark-mode .token-row:hover {
            background-color: var(--cui-gray-800);
          }
          
          .token-cell {
            cursor: pointer;
            display: flex;
            align-items: center;
          }
          
          .category-badge {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }
          
          .status-badge {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }
          
          .analytics-button {
            transition: all 0.2s ease;
          }
          
          .analytics-button:hover {
            transform: translateY(-2px);
          }
          
          .action-button {
            transition: all 0.2s ease;
          }
          
          .action-button:hover {
            transform: scale(1.1);
          }
          
          .sortable-header {
            cursor: pointer;
            user-select: none;
            transition: all 0.2s ease;
          }
          
          .sortable-header:hover {
            background-color: var(--cui-gray-100);
          }
          
          .dark-mode .sortable-header:hover {
            background-color: var(--cui-gray-800);
          }
        `}
      </style>
    </div>
  );
};

export default Track;
