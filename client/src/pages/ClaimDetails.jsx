import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaDownload, FaPrint, FaEnvelope, FaVideo, FaCheckCircle, FaSpinner, FaExclamationTriangle } from 'react-icons/fa'

function ClaimDetails() {
  const { id } = useParams()
  const [claim, setClaim] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Fetch claim details from the API
    const fetchClaimDetails = async () => {
      try {
        setIsLoading(true)
        
        // Get the token from localStorage
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('No authentication token found')
          setIsLoading(false)
          return
        }
        
        const response = await fetch(`http://localhost:8000/api/claims/${id}/detail/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        
        const claimData = await response.json()
        
        // Transform API data to match the component's expected format
        const transformedClaim = {
          id: claimData.id,
          type: 'Auto Insurance', // This would come from the policy type
          date: new Date(claimData.created_at).toISOString().split('T')[0],
          status: claimData.status,
          amount: 1250.00, // This would be calculated or come from a separate field
          description: claimData.treatment,
          policyNumber: claimData.policy_number,
          policyProvider: claimData.policy_provider,
          policyHolderName: claimData.policy_holder_name,
          incidentDate: new Date(claimData.incident_date).toISOString().split('T')[0],
          incidentDescription: claimData.incident_description,
          claimDetails: claimData.claim_details,
          timeline: claimData.timeline
        }
        
        setClaim(transformedClaim)
      } catch (error) {
        console.error('Error fetching claim details:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchClaimDetails()
  }, [id])
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-500" />
      case 'pending':
        return <FaSpinner className="text-yellow-500" />
      case 'rejected':
        return <FaExclamationTriangle className="text-red-500" />
      default:
        return null
    }
  }
  
  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved'
      case 'pending':
        return 'Pending'
      case 'rejected':
        return 'Rejected'
      default:
        return status
    }
  }
  
  const getStatusClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-16">
          <FaSpinner className="animate-spin text-primary-600 text-2xl" />
          <span className="ml-2">Loading claim details...</span>
        </div>
      </div>
    )
  }
  
  if (!claim) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Not Found</h2>
          <p className="text-gray-600 mb-4">
            The claim you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <FaArrowLeft className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claim #{claim.id}</h1>
          <p className="text-gray-600">{claim.type} - {new Date(claim.date).toLocaleDateString()}</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(claim.status)}`}>
            {getStatusIcon(claim.status)}
            <span className="ml-2">{getStatusText(claim.status)}</span>
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Claim Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Policy Number</h3>
                  <p className="mt-1 text-sm text-gray-900">{claim.policyNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Insurance Provider</h3>
                  <p className="mt-1 text-sm text-gray-900">{claim.policyProvider}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Policy Holder</h3>
                  <p className="mt-1 text-sm text-gray-900">{claim.policyHolderName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Claim Amount</h3>
                  <p className="mt-1 text-sm text-gray-900">${claim.amount.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Incident Date</h3>
                  <p className="mt-1 text-sm text-gray-900">{new Date(claim.incidentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submission Date</h3>
                  <p className="mt-1 text-sm text-gray-900">{new Date(claim.date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Incident Description</h3>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{claim.incidentDescription}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Claim Details</h3>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{claim.claimDetails}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Claim Timeline</h2>
              
              <div className="flow-root">
                <ul className="-mb-8">
                  {claim.timeline.map((event, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index !== claim.timeline.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center ring-8 ring-white">
                              <span className="text-primary-600 text-sm font-medium">{index + 1}</span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900">{event.action}</p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <p>{new Date(event.date).toLocaleDateString()}</p>
                              <p className="text-xs">{event.actor}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              
              <div className="space-y-3">
                <button className="btn btn-outline w-full flex items-center justify-center">
                  <FaDownload className="mr-2" />
                  Download Claim
                </button>
                <button className="btn btn-outline w-full flex items-center justify-center">
                  <FaPrint className="mr-2" />
                  Print Claim
                </button>
                <button className="btn btn-outline w-full flex items-center justify-center">
                  <FaEnvelope className="mr-2" />
                  Email Claim
                </button>
                <button className="btn btn-primary w-full flex items-center justify-center">
                  <FaVideo className="mr-2" />
                  Video Consultation
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
              
              <p className="text-sm text-gray-600 mb-4">
                If you have questions about your claim or need assistance, our support team is here to help.
              </p>
              
              <div className="space-y-3">
                <button className="btn btn-outline w-full">
                  Contact Support
                </button>
                <button className="btn btn-outline w-full">
                  FAQ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ClaimDetails