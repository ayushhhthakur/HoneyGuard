import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { cilCloudUpload, cilCheckCircle, cilXCircle, cilSync, cilArrowRight, cilArrowLeft, cilHeart, cilMoney, cilPlus, cilMedicalCross } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CButton,
  CContainer,
  CRow,
  CCol,
  CAlert,
  CSpinner,
  CProgress,
  CProgressBar,
  CBadge,
} from '@coreui/react'
import API_URL from '../../../config/api.js'
import { useNavigate } from 'react-router-dom'

const Tokens = () => {
  const navigate = useNavigate()
  const [token, setToken] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [tokenName, setTokenName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const [dynamicFields, setDynamicFields] = useState({})
  const [currentTheme, setCurrentTheme] = useState(document.documentElement.getAttribute('data-coreui-theme'));
  const fileInputRef = useRef(null)

  const categories = [
    { value: 'image', label: 'Image Token', icon: cilCloudUpload, description: 'Secure tokens for image-based assets' },
    { value: 'aws', label: 'AWS Token', icon: cilSync, description: 'Tokens for AWS service authentication' },
    { value: 'financial', label: 'Financial Token', icon: cilMoney, description: 'Secure financial transaction tokens' },
    { value: 'healthcare', label: 'Healthcare Token', icon: cilMedicalCross, description: 'HIPAA-compliant healthcare tokens' }
  ]

  const categoryFields = {
    image: [
      {
        type: 'file',
        name: 'file',
        label: 'Upload Image',
        accept: 'image/*',
        required: true
      }
    ],
    aws: [
      {
        type: 'select',
        name: 'awsRegion',
        label: 'AWS Region',
        required: true,
        options: [
          { value: 'us-east-1', label: 'US East (N. Virginia)' },
          { value: 'us-west-2', label: 'US West (Oregon)' },
          { value: 'eu-west-1', label: 'EU (Ireland)' },
          { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)' }
        ]
      },
      {
        type: 'select',
        name: 'awsService',
        label: 'AWS Service',
        required: true,
        options: [
          { value: 's3', label: 'S3' }
        ]
      }
    ],
    financial: [
      {
        type: 'select',
        name: 'financialType',
        label: 'Financial Type',
        required: true,
        options: [
          { value: 'standard', label: 'Standard Access' },
          { value: 'premium', label: 'Premium Access' },
          { value: 'admin', label: 'Admin Access' }
        ]
      },
      {
        type: 'select',
        name: 'transactionType',
        label: 'Transaction Type',
        required: true,
        options: [
          { value: 'all', label: 'All Transactions' },
          { value: 'view', label: 'View Only' },
          { value: 'create', label: 'Create Only' },
          { value: 'manage', label: 'Full Management' }
        ]
      }
    ],
    healthcare: [
      {
        type: 'select',
        name: 'healthcareSystem',
        label: 'Healthcare System',
        required: true,
        options: [
          { value: 'ehr', label: 'Electronic Health Records (EHR)' },
          { value: 'pms', label: 'Patient Management System (PMS)' },
          { value: 'lab', label: 'Laboratory Information System (LIS)' },
          { value: 'imaging', label: 'Medical Imaging (PACS)' }
        ]
      },
      {
        type: 'text',
        name: 'patientIdFormat',
        label: 'Patient ID Format',
        placeholder: 'e.g., MRN-####, PAT-###-##',
        required: true,
        helpText: 'Use # for digits, e.g., MRN-#### will generate IDs like MRN-1234'
      },
      {
        type: 'select',
        name: 'accessLevel',
        label: 'Access Level',
        required: true,
        options: [
          { value: 'read', label: 'Read Only (View Records)' },
          { value: 'write', label: 'Read/Write (Modify Records)' },
          { value: 'admin', label: 'Administrative (Full Access)' }
        ]
      }
    ]
  }

  const getProgress = () => {
    if (!selectedCategory) return 25
    if (!tokenName || !description) return 50
    if (Object.keys(dynamicFields).length === 0) return 75
    return 100
  }

  const renderCategorySelection = () => (
    <CRow className="g-4">
      {categories.map((category) => (
        <CCol key={category.value} xs={12} md={6}>
          <CCard 
            className={`h-100 category-card ${selectedCategory === category.value ? 'selected' : ''}`}
            onClick={() => setSelectedCategory(category.value)}
            style={{
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: selectedCategory === category.value ? 'scale(1.02)' : 'scale(1)',
              border: selectedCategory === category.value ? '2px solid #321fdb' : '1px solid #ebedef'
            }}
          >
            <CCardBody className="d-flex flex-column align-items-center p-4">
              <div className="mb-3">
                <CIcon 
                  icon={category.icon} 
                  size="3xl"
                  className={selectedCategory === category.value ? 'text-primary' : 'text-muted'}
                />
              </div>
              <h4 className="mb-2">{category.label}</h4>
              <p className="text-muted text-center mb-0">{category.description}</p>
              {selectedCategory === category.value && (
                <CBadge color="primary" className="mt-3">Selected</CBadge>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      ))}
    </CRow>
  )

  const renderBasicInfo = () => (
    <CCard>
      <CCardBody>
        <div className="mb-4">
          <CFormLabel>Token Name</CFormLabel>
          <CFormInput
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="Enter a descriptive name for your token"
            required
            className="mb-3"
          />
          <CFormLabel>Description</CFormLabel>
          <CFormInput
            type="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the purpose of this token"
            required
          />
        </div>
      </CCardBody>
    </CCard>
  )

  const renderDynamicFields = () => (
    <CCard>
      <CCardBody>
        {categoryFields[selectedCategory]?.map(field => renderField(field))}
      </CCardBody>
    </CCard>
  )

  const getThemeStyles = () => {
    const isDarkMode = currentTheme === 'dark';
    return {
      previewSection: {
        backgroundColor: isDarkMode ? '#27293d' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#333333',
        padding: '20px',
        borderRadius: '8px',
        border: `1px solid ${isDarkMode ? '#2f2f45' : '#ebedef'}`
      },
      heading: {
        color: isDarkMode ? '#ffffff' : '#333333',
        borderBottom: `1px solid ${isDarkMode ? '#2f2f45' : '#ebedef'}`,
        paddingBottom: '10px',
        marginBottom: '15px'
      },
      label: {
        color: isDarkMode ? '#a0aec0' : '#666666',
        fontWeight: 'bold',
        marginRight: '8px'
      },
      value: {
        color: isDarkMode ? '#ffffff' : '#333333'
      },
      configSection: {
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: `1px solid ${isDarkMode ? '#2f2f45' : '#ebedef'}`
      }
    };
  };

  const renderPreview = () => {
    const styles = getThemeStyles();
    
    return (
      <CCard>
        <CCardHeader style={styles.heading}>Token Preview</CCardHeader>
        <CCardBody>
          <div style={styles.previewSection}>
            <h5 style={styles.heading}>Basic Information</h5>
            <p>
              <span style={styles.label}>Name:</span>
              <span style={styles.value}>{tokenName}</span>
            </p>
            <p>
              <span style={styles.label}>Category:</span>
              <span style={styles.value}>
                {categories.find(c => c.value === selectedCategory)?.label}
              </span>
            </p>
            <p>
              <span style={styles.label}>Description:</span>
              <span style={styles.value}>{description}</span>
            </p>

            <div style={styles.configSection}>
              <h5 style={styles.heading}>Configuration</h5>
              {Object.entries(dynamicFields).map(([key, value]) => (
                <p key={key}>
                  <span style={styles.label}>{key}:</span>
                  <span style={styles.value}>
                    {value instanceof File ? value.name : value}
                  </span>
                </p>
              ))}
            </div>
          </div>
        </CCardBody>
      </CCard>
    );
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'file':
        return (
          <div key={field.name} className="mb-3">
            <CFormLabel>{field.label}</CFormLabel>
            <CFormInput
              type="file"
              accept={field.accept}
              onChange={(e) => {
                handleFieldChange(field.name, e.target.files[0])
              }}
              ref={fileInputRef}
              required={field.required}
            />
          </div>
        )
      case 'select':
        return (
          <div key={field.name} className="mb-3">
            <CFormLabel>{field.label}</CFormLabel>
            <CFormSelect
              value={dynamicFields[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              required={field.required}
            >
              <option value="">Select {field.label}</option>
              {field.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </CFormSelect>
          </div>
        )
      case 'text':
        return (
          <div key={field.name} className="mb-3">
            <CFormLabel>{field.label}</CFormLabel>
            <CFormInput
              type="text"
              value={dynamicFields[field.name] || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
            {field.helpText && (
              <div className="form-text text-muted">{field.helpText}</div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  const handleFieldChange = (name, value) => {
    setDynamicFields(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h4 className="mb-4">Select Token Category</h4>
            {renderCategorySelection()}
          </>
        )
      case 2:
        return (
          <>
            <h4 className="mb-4">Basic Information</h4>
            {renderBasicInfo()}
          </>
        )
      case 3:
        return (
          <>
            <h4 className="mb-4">Configure Token</h4>
            {renderDynamicFields()}
          </>
        )
      case 4:
        return (
          <>
            <h4 className="mb-4">Review & Create</h4>
            {renderPreview()}
          </>
        )
      default:
        return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let response

      if (selectedCategory === 'healthcare') {
        response = await axios.post(`${API_URL}/generate-healthcare-token`, {
          system: dynamicFields.healthcareSystem,
          patientIdFormat: dynamicFields.patientIdFormat,
          accessLevel: dynamicFields.accessLevel
        })
      } else if (selectedCategory === 'aws') {
        // ... existing AWS token generation
      } else if (selectedCategory === 'financial') {
        const formData = new FormData();
        formData.append('tokenName', tokenName);
        formData.append('description', description);
        formData.append('category', 'financial');
        formData.append('financialType', dynamicFields.financialType || 'standard');
        formData.append('transactionType', dynamicFields.transactionType || 'all');

        response = await axios.post(`${API_URL}/generate-token`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data.success) {
          // Store token and credentials in session storage
          sessionStorage.setItem('financial_credentials', JSON.stringify({
            token: response.data.token,
            credentials: response.data.credentials
          }));

          // Show success message with credentials
          toast.success(
            <div>
              <strong>Financial Token Generated Successfully!</strong>
              <p>Keep these credentials safe:</p>
              <div className="credential-box">
                <p><strong>Username:</strong> {response.data.credentials.username}</p>
                <p><strong>Password:</strong> {response.data.credentials.password}</p>
                <p><strong>Token:</strong> {response.data.token}</p>
                <p><strong>API Base URL:</strong> {`${API_URL}/finance`}</p>
              </div>
              <hr/>
              <div className="warning-box">
                <p>⚠️ IMPORTANT:</p>
                <ul>
                  <li>Save these credentials immediately</li>
                  <li>They will not be shown again</li>
                  <li>Keep them secure and confidential</li>
                </ul>
              </div>
            </div>,
            {
              autoClose: false,
              closeOnClick: false,
              draggable: false,
              className: 'financial-toast'
            }
          );

          // Add custom styles for the toast
          const style = document.createElement('style');
          style.textContent = `
            .financial-toast {
              background: #fff;
              color: #333;
              max-width: 500px !important;
              width: 100%;
            }
            .credential-box {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              margin: 10px 0;
              border-left: 4px solid #321fdb;
            }
            .credential-box p {
              margin: 5px 0;
              font-family: monospace;
              word-break: break-all;
            }
            .warning-box {
              background: #fff3cd;
              color: #856404;
              padding: 10px;
              border-radius: 5px;
              margin-top: 10px;
            }
            .warning-box ul {
              margin: 5px 0;
              padding-left: 20px;
            }
          `;
          document.head.appendChild(style);
        }
      } else {
        // ... existing image token generation
      }

      if (response.data.success) {
        setToken(response.data.token)
        
        // Check if credentials exist and have required fields before showing toast
        const credentials = response.data.credentials || {};
        const hasCredentials = credentials && 
          (credentials.username || credentials.password || credentials.endpoint);

        if (hasCredentials) {
          // Show credentials in a success toast
          toast.success(
            <div>
              <strong>Token Generated Successfully!</strong>
              <p>Credentials:</p>
              {credentials.username && <p>Username: {credentials.username}</p>}
              {credentials.password && <p>Password: {credentials.password}</p>}
              {credentials.endpoint && <p>API Endpoint: {credentials.endpoint}</p>}
              <p>Token: {response.data.token}</p>
              <hr/>
              <p className="text-warning">⚠️ Save these credentials now. They won't be shown again!</p>
            </div>,
            {
              autoClose: false,
              closeOnClick: false
            }
          );
        } else {
          // Show simple success message if no credentials
          toast.success(
            <div>
              <strong>Token Generated Successfully!</strong>
              <p>Your token: {response.data.token}</p>
            </div>
          );
        }
        
        navigate('/tokens/logs')
      } else {
        throw new Error(response.data.message || 'Failed to generate token')
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'An error occurred while generating the token')
      toast.error('Failed to generate token: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  // Theme observer setup
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-coreui-theme') {
          const newTheme = document.documentElement.getAttribute('data-coreui-theme');
          setCurrentTheme(newTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-coreui-theme']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <CContainer className="tokens-container">
      <CCard className="mb-4 border-0 shadow-sm">
        <CCardBody>
          <h2 className="mb-4">Create New Token</h2>
          
          <CProgress className="mb-4" height={8}>
            <CProgressBar value={getProgress()} />
          </CProgress>

          <div className="step-indicators d-flex justify-content-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div 
                key={step}
                className={`step-indicator ${currentStep >= step ? 'active' : ''}`}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                <div 
                  className="step-number"
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    background: currentStep >= step ? '#321fdb' : '#ebedef',
                    color: currentStep >= step ? 'white' : '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    marginBottom: '8px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {step}
                </div>
                <div className="step-label text-muted">
                  {step === 1 ? 'Category' : 
                   step === 2 ? 'Basic Info' : 
                   step === 3 ? 'Configure' : 'Review'}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {renderStepContent()}

            {selectedCategory === 'financial' && (
              <div className="dynamic-fields">
                <div className="mb-3">
                  <label>Financial Type</label>
                  <select
                    className="form-select"
                    value={dynamicFields.financialType || 'standard'}
                    onChange={(e) => handleFieldChange('financialType', e.target.value)}
                  >
                    <option value="standard">Standard Access</option>
                    <option value="premium">Premium Access</option>
                    <option value="admin">Admin Access</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label>Transaction Type</label>
                  <select
                    className="form-select"
                    value={dynamicFields.transactionType || 'all'}
                    onChange={(e) => handleFieldChange('transactionType', e.target.value)}
                  >
                    <option value="all">All Transactions</option>
                    <option value="view">View Only</option>
                    <option value="create">Create Only</option>
                    <option value="manage">Full Management</option>
                  </select>
                </div>
                <div className="alert alert-info">
                  <strong>Note:</strong> Generated credentials will be shown only once. Make sure to save them securely.
                </div>
              </div>
            )}

            <div className="d-flex justify-content-between mt-4">
              {currentStep > 1 && (
                <CButton 
                  color="light"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="d-flex align-items-center"
                >
                  <CIcon icon={cilArrowLeft} className="me-2" />
                  Back
                </CButton>
              )}
              
              {currentStep < 4 ? (
                <CButton 
                  color="primary"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={
                    (currentStep === 1 && !selectedCategory) ||
                    (currentStep === 2 && (!tokenName || !description))
                  }
                  className="d-flex align-items-center ms-auto"
                >
                  Next
                  <CIcon icon={cilArrowRight} className="ms-2" />
                </CButton>
              ) : (
                <CButton 
                  color="primary"
                  type="submit"
                  disabled={loading}
                  className="ms-auto"
                >
                  {loading ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Creating Token...
                    </>
                  ) : (
                    'Create Token'
                  )}
                </CButton>
              )}
            </div>
          </form>
        </CCardBody>
      </CCard>

      {token && (
        <CAlert color="success" className="d-flex align-items-center mt-4">
          <CIcon icon={cilMoney} className="flex-shrink-0 me-2" />
          <div>
            Token created successfully! Your token is: <strong>{token}</strong>
          </div>
        </CAlert>
      )}

      {error && (
        <CAlert color="danger" className="d-flex align-items-center mt-4">
          <CIcon icon={cilPlus} className="flex-shrink-0 me-2" />
          <div>{error}</div>
        </CAlert>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          minWidth: '300px',
        }}
      />

      <style>
        {`
          .category-card:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          
          .preview-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
          }
          
          .step-indicator::after {
            content: '';
            position: absolute;
            top: 15px;
            left: 50%;
            width: 100%;
            height: 2px;
            background: #ebedef;
            z-index: -1;
          }
          
          .step-indicator:last-child::after {
            display: none;
          }
          
          .step-indicator.active::after {
            background: #321fdb;
          }
        `}
      </style>
    </CContainer>
  )
}

export default Tokens
