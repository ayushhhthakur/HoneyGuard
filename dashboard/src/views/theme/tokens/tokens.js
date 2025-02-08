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
          { value: 's3', label: 'S3' },
          { value: 'ec2', label: 'EC2' },
          { value: 'lambda', label: 'Lambda' },
          { value: 'dynamodb', label: 'DynamoDB' }
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
          { value: 'credit_card', label: 'Credit Card' },
          { value: 'bank_account', label: 'Bank Account' },
          { value: 'api_key', label: 'Payment Gateway API Key' },
          { value: 'crypto', label: 'Cryptocurrency' }
        ]
      },
      {
        type: 'select',
        name: 'transactionType',
        label: 'Transaction Type',
        required: true,
        options: [
          { value: 'payment', label: 'Payment Processing' },
          { value: 'refund', label: 'Refund Processing' },
          { value: 'subscription', label: 'Subscription Management' }
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
          { value: 'ehr', label: 'Electronic Health Records' },
          { value: 'pms', label: 'Patient Management System' },
          { value: 'lab', label: 'Laboratory System' },
          { value: 'imaging', label: 'Medical Imaging' }
        ]
      },
      {
        type: 'text',
        name: 'patientIdFormat',
        label: 'Patient ID Format',
        placeholder: 'Enter patient ID format (e.g., MRN-####)',
        required: true
      },
      {
        type: 'select',
        name: 'accessLevel',
        label: 'Access Level',
        required: true,
        options: [
          { value: 'read', label: 'Read Only' },
          { value: 'write', label: 'Read/Write' },
          { value: 'admin', label: 'Administrative' }
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

  const renderPreview = () => (
    <CCard>
      <CCardHeader>Token Preview</CCardHeader>
      <CCardBody>
        <div className="preview-section">
          <h5>Basic Information</h5>
          <p><strong>Name:</strong> {tokenName}</p>
          <p><strong>Category:</strong> {categories.find(c => c.value === selectedCategory)?.label}</p>
          <p><strong>Description:</strong> {description}</p>

          <h5 className="mt-4">Configuration</h5>
          {Object.entries(dynamicFields).map(([key, value]) => (
            <p key={key}><strong>{key}:</strong> {value instanceof File ? value.name : value}</p>
          ))}
        </div>
      </CCardBody>
    </CCard>
  )

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
      if (!selectedCategory) {
        throw new Error('Category is required')
      }
      if (!tokenName || !description) {
        throw new Error('Token name and description are required')
      }

      const fields = categoryFields[selectedCategory] || []
      fields.forEach(field => {
        if (field.required && !dynamicFields[field.name]) {
          throw new Error(`${field.label} is required`)
        }
      })

      const formData = new FormData()
      formData.append('tokenName', tokenName)
      formData.append('description', description)
      formData.append('category', selectedCategory)

      Object.entries(dynamicFields).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value)
        } else {
          formData.append(key, String(value))
        }
      })

      const response = await axios.post(`${API_URL}/generate-token`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        const generatedToken = response.data.token
        setToken(generatedToken)
        if (response.data.imageUrl) {
          setImageUrl(response.data.imageUrl)
        }
        
        // Enhanced success toast
        toast.success(
          <div className="d-flex align-items-center">
            <CIcon 
              icon={cilMoney} 
              className="me-2 text-success" 
              style={{ width: '20px', height: '20px' }}
            />
            <div>
              <strong>Success!</strong>
              <div className="text-sm">Token generated successfully</div>
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            style: {
              background: '#fff',
              borderLeft: '4px solid #2eb85c',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            },
          }
        )
        
        // Navigate after a short delay to allow toast to be seen
        setTimeout(() => {
          navigate(`/utils/track/${generatedToken}`)
        }, 1000)
      } else {
        setError(response.data.error || 'Failed to generate token')
        // Enhanced error toast
        toast.error(
          <div className="d-flex align-items-center">
            <CIcon 
              icon={cilMedicalCross} 
              className="me-2 text-danger" 
              style={{ width: '20px', height: '20px' }}
            />
            <div>
              <strong>Error!</strong>
              <div className="text-sm">{response.data.error || 'Failed to generate token'}</div>
            </div>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            style: {
              background: '#fff',
              borderLeft: '4px solid #e55353',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            },
          }
        )
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to generate token'
      setError(errorMessage)
      // Enhanced error toast for caught errors
      toast.error(
        <div className="d-flex align-items-center">
          <CIcon 
            icon={cilPlus} 
            className="me-2 text-danger" 
            style={{ width: '20px', height: '20px' }}
          />
          <div>
            <strong>Error!</strong>
            <div className="text-sm">{errorMessage}</div>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          style: {
            background: '#fff',
            borderLeft: '4px solid #e55353',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
        }
      )
    } finally {
      setLoading(false)
    }
  }

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
