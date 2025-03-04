import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { FaArrowLeft, FaArrowRight, FaCheck, FaSpinner } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

// Validation schemas for each step
const stepValidationSchemas = [
  // Step 1: Insurance Type
  Yup.object().shape({
    insuranceType: Yup.string().required('Please select an insurance type')
  }),
  
  // Step 2: Incident Details
  Yup.object().shape({
    incidentDate: Yup.date().required('Incident date is required').max(new Date(), 'Date cannot be in the future'),
    incidentDescription: Yup.string().required('Please describe what happened').min(20, 'Description must be at least 20 characters')
  }),
  
  // Step 3: Policy Information
  Yup.object().shape({
    policyNumber: Yup.string().required('Policy number is required'),
    policyProvider: Yup.string().required('Insurance provider is required'),
    policyHolderName: Yup.string().required('Policy holder name is required')
  }),
  
  // Step 4: Claim Details
  Yup.object().shape({
    claimAmount: Yup.number().required('Claim amount is required').positive('Amount must be positive'),
    hasDocumentation: Yup.boolean(),
    additionalNotes: Yup.string()
  })
]

function NewClaim() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedClaim, setGeneratedClaim] = useState(null)
  const [policies, setPolicies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  
  // Fetch user's policies for the dropdown
  useEffect(() => {
    const fetchPolicies = async () => {
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Please log in to create a new claim')
        navigate('/login')
        return
      }
      
      try {
        setIsLoading(true)
        const token = localStorage.getItem('token')
        
        const response = await fetch('http://localhost:8000/api/policies/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setPolicies(data)
        } else {
          console.error(`Error fetching policies: ${response.status}`)
          toast.error('Failed to load your policies. Please try again.')
        }
      } catch (error) {
        console.error('Error fetching policies:', error)
        toast.error('Failed to load your policies. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPolicies()
  }, [navigate])
  
  const steps = [
    'Insurance Type',
    'Incident Details',
    'Policy Information',
    'Claim Details',
    'Review & Submit'
  ]
  
  const initialValues = {
    // Step 1
    insuranceType: '',
    
    // Step 2
    incidentDate: '',
    incidentDescription: '',
    
    // Step 3
    policyNumber: '',
    policyProvider: '',
    policyHolderName: '',
    
    // Step 4
    claimAmount: '',
    hasDocumentation: false,
    additionalNotes: ''
  }
  
  const handleNext = (values, actions) => {
    if (currentStep < steps.length - 2) {
      setCurrentStep(currentStep + 1)
      actions.setTouched({})
    } else if (currentStep === steps.length - 2) {
      // Generate claim with AI
      generateClaim(values)
    }
  }
  
  const handleBack = () => {
    setCurrentStep(Math.max(0, currentStep - 1))
  }
  
  const generateClaim = async (values) => {
    setIsGenerating(true)
    
    try {
      // Simulate API call to AI service
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock AI-generated claim
      const generatedText = `
        INSURANCE CLAIM REQUEST
        
        CLAIMANT: ${values.policyHolderName}
        POLICY NUMBER: ${values.policyNumber}
        INSURANCE PROVIDER: ${values.policyProvider}
        CLAIM TYPE: ${values.insuranceType}
        DATE OF INCIDENT: ${new Date(values.incidentDate).toLocaleDateString()}
        CLAIM AMOUNT: $${parseFloat(values.claimAmount).toFixed(2)}
        
        INCIDENT DESCRIPTION:
        ${values.incidentDescription}
        
        COVERAGE ANALYSIS:
        Based on the information provided, this incident appears to be covered under your ${values.insuranceType} policy. The described event falls within the standard coverage parameters for this type of insurance.
        
        CLAIM JUSTIFICATION:
        The claim amount of $${parseFloat(values.claimAmount).toFixed(2)} is justified based on the nature and extent of the incident described. This amount represents the estimated cost to address the damages or losses incurred.
        
        NEXT STEPS:
        1. Your claim will be reviewed by a claims adjuster at ${values.policyProvider}
        2. You may be contacted for additional information or documentation
        3. Once approved, payment will be processed according to your policy terms
        
        ${values.additionalNotes ? `ADDITIONAL NOTES: ${values.additionalNotes}` : ''}
      `
      
      setGeneratedClaim(generatedText)
      setCurrentStep(currentStep + 1)
    } catch (error) {
      console.error('Error generating claim:', error)
      toast.error('Failed to generate claim. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }
  
  const handleSubmit = async (values) => {
    try {
      // Get authentication token
      const token = localStorage.getItem('token')
      
      // Get the selected policy from values.policyNumber
      const selectedPolicy = policies.find(p => p.policy_number === values.policyNumber)
      if (!selectedPolicy) {
        toast.error('Please select a valid policy')
        return
      }
      
      // Prepare data in the format expected by the backend
      const claimData = {
        treatment: values.insuranceType,  // Using insuranceType as treatment
        treatment_date: new Date(values.incidentDate).toISOString(),  // API expects treatment_date
        cause: values.incidentDescription, // API expects cause for incident_description
        policy: selectedPolicy.id  // The policy ID
      }
      
      // Send to backend
      const response = await fetch('http://localhost:8000/api/claims/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(claimData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to submit claim')
      }
      
      // Get the response data
      const responseData = await response.json()
      
      toast.success('Claim submitted successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error submitting claim:', error)
      toast.error(error.message || 'Failed to submit claim. Please try again.')
    }
  }
  
  const renderStepContent = (step, formikProps) => {
    const { values, errors, touched } = formikProps
    
    switch (step) {
      case 0:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Insurance Type</h2>
            <div className="form-group">
              <label className="form-label">What type of insurance claim are you filing?</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                {['Auto Insurance', 'Home Insurance', 'Health Insurance', 'Life Insurance', 'Travel Insurance', 'Other'].map((type) => (
                  <div key={type} className="relative">
                    <Field
                      type="radio"
                      name="insuranceType"
                      id={`type-${type}`}
                      value={type}
                      className="sr-only"
                    />
                    <label
                      htmlFor={`type-${type}`}
                      className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                        values.insuranceType === type
                          ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-500'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
              {touched.insuranceType && errors.insuranceType && (
                <div className="form-error">{errors.insuranceType}</div>
              )}
            </div>
          </div>
        )
      
      case 1:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Incident Details</h2>
            <div className="form-group">
              <label htmlFor="incidentDate" className="form-label">When did the incident occur?</label>
              <Field
                type="date"
                name="incidentDate"
                id="incidentDate"
                className="input"
                max={new Date().toISOString().split('T')[0]}
              />
              <ErrorMessage name="incidentDate" component="div" className="form-error" />
            </div>
            
            <div className="form-group">
              <label htmlFor="incidentDescription" className="form-label">Describe what happened</label>
              <Field
                as="textarea"
                name="incidentDescription"
                id="incidentDescription"
                rows="5"
                className="input"
                placeholder="Please provide a detailed description of the incident..."
              />
              <ErrorMessage name="incidentDescription" component="div" className="form-error" />
            </div>
          </div>
        )
      
      case 2:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Policy Information</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <FaSpinner className="animate-spin text-primary-600 mr-2" />
                <span>Loading your policies...</span>
              </div>
            ) : policies.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-2">You don't have any policies yet.</p>
                <p className="text-sm">Please contact your insurance provider or administrator.</p>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="policyNumber" className="form-label">Select Your Policy</label>
                  <Field
                    as="select"
                    name="policyNumber"
                    id="policyNumber"
                    className="input"
                  >
                    <option value="">-- Select a policy --</option>
                    {policies.map((policy) => (
                      <option key={policy.id} value={policy.policy_number}>
                        {policy.policy_number} - {Object.keys(policy.coverage_details)[0] || 'Insurance Policy'}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage name="policyNumber" component="div" className="form-error" />
                </div>
                
                {values.policyNumber && (
                  <div className="bg-gray-50 rounded-lg p-4 mt-4">
                    <h3 className="font-medium text-gray-700 mb-2">Selected Policy Details</h3>
                    {policies
                      .filter(p => p.policy_number === values.policyNumber)
                      .map(policy => (
                        <div key={policy.id} className="text-sm">
                          <p><span className="font-medium">Coverage:</span> {Object.entries(policy.coverage_details).map(([key, val]) => `${key}: ${val}`).join(', ')}</p>
                          <p><span className="font-medium">Valid until:</span> {new Date(policy.end_date).toLocaleDateString()}</p>
                        </div>
                      ))
                    }
                  </div>
                )}
                
                {/* These fields will be automatically filled based on the selected policy */}
                <Field type="hidden" name="policyProvider" value="Insurance Provider" />
                <Field type="hidden" name="policyHolderName" value="Policy Holder" />
              </>
            )}
          </div>
        )
      
      case 3:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Claim Details</h2>
            <div className="form-group">
              <label htmlFor="claimAmount" className="form-label">Estimated Claim Amount ($)</label>
              <Field
                type="number"
                name="claimAmount"
                id="claimAmount"
                className="input"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              <ErrorMessage name="claimAmount" component="div" className="form-error" />
            </div>
            
            <div className="form-group">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Field
                    type="checkbox"
                    name="hasDocumentation"
                    id="hasDocumentation"
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="hasDocumentation" className="text-gray-700">
                    I have documentation to support this claim (receipts, photos, reports)
                  </label>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="additionalNotes" className="form-label">Additional Notes (Optional)</label>
              <Field
                as="textarea"
                name="additionalNotes"
                id="additionalNotes"
                rows="3"
                className="input"
                placeholder="Any other information you'd like to include..."
              />
            </div>
          </div>
        )
      
      case 4:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Review Your Claim</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 whitespace-pre-line font-mono text-sm">
              {generatedClaim}
            </div>
            <div className="form-group">
              <p className="text-gray-700 mb-4">
                Please review the AI-generated claim above. If everything looks correct, click "Submit Claim" to proceed.
              </p>
              <button
                type="submit"
                className="btn btn-primary w-full"
              >
                Submit Claim
              </button>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">File a New Claim</h1>
        
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 text-center text-xs font-medium ${
                  index <= currentStep ? 'text-primary-600' : 'text-gray-500'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <Formik
          initialValues={initialValues}
          validationSchema={currentStep < steps.length - 1 ? stepValidationSchemas[currentStep] : null}
          onSubmit={currentStep === steps.length - 1 ? handleSubmit : handleNext}
        >
          {(formikProps) => (
            <Form>
              <div className="card">
                {renderStepContent(currentStep, formikProps)}
                
                {currentStep < steps.length - 1 && (
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="btn btn-outline flex items-center"
                      disabled={currentStep === 0}
                    >
                      <FaArrowLeft className="mr-2" />
                      Back
                    </button>
                    
                    <button
                      type="submit"
                      className="btn btn-primary flex items-center"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" />
                          Generating...
                        </>
                      ) : currentStep === steps.length - 2 ? (
                        <>
                          <FaCheck className="mr-2" />
                          Generate Claim
                        </>
                      ) : (
                        <>
                          Next
                          <FaArrowRight className="ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default NewClaim