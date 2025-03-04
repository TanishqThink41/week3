import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaPlus, FaFileAlt, FaCheckCircle, FaSpinner, FaExclamationTriangle, FaShieldAlt, FaHistory, FaFileMedical } from 'react-icons/fa'

function Dashboard() {
  const [userData, setUserData] = useState({
    claims: [],
    policies: [],
    medicalHistory: []
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch user's data from the API
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        
        // Get the token from localStorage
        const token = localStorage.getItem('token')
        if (!token) {
          console.error('No authentication token found')
          setIsLoading(false)
          return
        }
        
        // Fetch claims from the API
        const claimsResponse = await fetch('http://localhost:8000/api/claims/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        // Fetch policies from the API
        const policiesResponse = await fetch('http://localhost:8000/api/policies/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        // Fetch medical history from the API
        const medicalHistoryResponse = await fetch('http://localhost:8000/api/medical-history/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        // Initialize data arrays
        let claimsData = []
        let policiesData = []
        let medicalHistoryData = []
        
        // Process claims response
        if (claimsResponse.ok) {
          claimsData = await claimsResponse.json()
        } else {
          console.error(`API error fetching claims: ${claimsResponse.status}`)
        }
        
        // Process policies response
        if (policiesResponse.ok) {
          policiesData = await policiesResponse.json()
        } else {
          console.error(`API error fetching policies: ${policiesResponse.status}`)
        }
        
        // Process medical history response
        if (medicalHistoryResponse.ok) {
          medicalHistoryData = await medicalHistoryResponse.json()
        } else {
          console.error(`API error fetching medical history: ${medicalHistoryResponse.status}`)
        }
        
        const userData = {
          policies: policiesData,
          medicalHistory: medicalHistoryData,
          claims: claimsData
        }
        
        setUserData(userData)
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchUserData()
  }, [])

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
          <p className="text-gray-600">Manage your insurance information</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link to="/new-claim" className="btn btn-primary flex items-center">
            <FaPlus className="mr-2" />
            New Claim
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <FaSpinner className="animate-spin text-primary-600 text-2xl" />
          <span className="ml-2">Loading your information...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Policy Information */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <FaShieldAlt className="text-primary-600 text-xl mr-2" />
                <h2 className="text-xl font-semibold">Your Policy</h2>
              </div>
              
              {userData.policies.map(policy => (
                <div key={policy.id} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Policy Number:</span>
                    <span className="font-medium">{policy.policy_number}</span>
                  </div>
                  <div>
                    <h3 className="text-gray-600 mb-2">Coverage Details:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {policy.coverage_details && typeof policy.coverage_details === 'object' ? (
                        Object.entries(policy.coverage_details).map(([key, value], index) => (
                          <li key={index} className="text-gray-800">{key}: {value}</li>
                        ))
                      ) : (
                        <li className="text-gray-800">No coverage details available</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-gray-600 mb-2">Exclusions:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {policy.exclusions && typeof policy.exclusions === 'object' ? (
                        Object.entries(policy.exclusions).map(([key, value], index) => (
                          <li key={index} className="text-gray-800">
                            {key}: {Array.isArray(value) ? value.join(', ') : value}
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-800">No exclusions available</li>
                      )}
                    </ul>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-600">Start Date:</span>
                      <span className="ml-2">{new Date(policy.start_date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">End Date:</span>
                      <span className="ml-2">{new Date(policy.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <FaHistory className="text-primary-600 text-xl mr-2" />
                <h2 className="text-xl font-semibold">Medical History</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Condition
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Diagnosis Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Treatment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userData.medicalHistory.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.condition}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{record.diagnosis_date ? new Date(record.diagnosis_date).toLocaleDateString() : 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{record.treatment}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Claims */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <FaFileMedical className="text-primary-600 text-xl mr-2" />
                <h2 className="text-xl font-semibold">Recent Claims</h2>
              </div>
          
              {userData.claims.length === 0 ? (
                <div className="text-center py-8">
                  <FaFileAlt className="mx-auto text-gray-400 text-4xl mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No claims yet</h3>
                  <p className="text-gray-600 mb-4">
                    You haven't submitted any insurance claims yet.
                  </p>
                  <Link to="/new-claim" className="btn btn-primary">
                    Create Your First Claim
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Treatment
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cause
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userData.claims.map((claim) => (
                        <tr key={claim.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{claim.treatment}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{new Date(claim.treatment_date).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{claim.cause}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(claim.status)}
                              <span className="ml-2 text-sm text-gray-700">{getStatusText(claim.status)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link to={`/claims/${claim.id}`} className="text-primary-600 hover:text-primary-900">
                              View Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
      // </div>
    // </div>
  )
}

export default Dashboard