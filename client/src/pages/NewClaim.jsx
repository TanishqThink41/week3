import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { FaArrowLeft, FaArrowRight, FaCheck, FaSpinner } from 'react-icons/fa'

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
  const navigate = useNavigate()
  
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
      // Simulate API call to submit claim
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real app, you would submit to your backend here
      console.log('Claim submitted:', { ...values, generatedClaim })
      
      toast.success('Claim submitted successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error submitting claim:', error)
      toast.error('Failed to submit claim. Please try again.')
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
            <div className="form-group">
              <label htmlFor="policyNumber" className="form-label">Policy Number</label>
              <Field
                type="text"
                name="policyNumber"
                id="policyNumber"
                className="input"
                placeholder="e.g., POL-123456789"
              />
              <ErrorMessage name="policyNumber" component="div" className="form-error" />
            </div>
            
            <div className="form-group">
              <label htmlFor="policyProvider" className="form-label">Insurance Provider</label>
              <Field
                type="text"
                name="policyProvider"
                id="policyProvider"
                className="input"
                placeholder="e.g., State Farm, Allstate, etc."
              />
              <ErrorMessage name="policyProvider" component="div" className="form-error" />
            </div>
            
            <div className="form-group">
              <label htmlFor="policyHolderName" className="form-label">Policy Holder Name</label>
              <Field
                type="text"
                name="policyHolderName"
                id="policyHolderName"
                className="input"
                placeholder="Full name as it appears on your policy"
              />
              <ErrorMessage name="policyHolderName" component="div" className="form-error" />
            </div>
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