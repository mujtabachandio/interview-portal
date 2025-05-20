'use client';
import { useState, useEffect } from 'react';
import { auth } from '../../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, useParams } from 'next/navigation';
import { getApplicationById, updateApplicationStatus, deleteStatusUpdate } from '../../../lib/sanity.queries';
import { useAuth } from '../../../contexts/AuthContext';

const ADMIN_EMAILS = ['mujtabachandio384@gmail.com', 'adeelahmed12335@gmail.com', 'aqibhanif47@gmail.com'];

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'hold', label: 'On Hold', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-100 text-green-800 border-green-200' }
];

export default function ApplicationDetails() {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [deletingStatus, setDeletingStatus] = useState(null);
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !ADMIN_EMAILS.includes(user.email)) {
        router.push('/signin');
        return;
      }

      try {
        const applicationData = await getApplicationById(id);
        setApplication(applicationData);
        setSelectedStatus(applicationData.status || '');
        setReviewerNotes(applicationData.reviewerNotes || '');
      } catch (err) {
        setError('Failed to fetch application details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, id]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;

    try {
      setUpdating(true);
      const updatedApplication = await updateApplicationStatus(
        application._id,
        selectedStatus,
        reviewerNotes
      );
      setApplication(updatedApplication);
      setReviewerNotes('');
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update application status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteStatus = async (statusIndex) => {
    try {
      setDeletingStatus(statusIndex);
      const updatedApplication = await deleteStatusUpdate(application._id, statusIndex);
      setApplication(updatedApplication);
    } catch (err) {
      console.error('Error deleting status:', err);
      setError('Failed to delete status update');
    } finally {
      setDeletingStatus(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusOption = STATUS_OPTIONS.find(option => option.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-indigo-600 font-medium">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-lg border-l-4 border-red-500 p-6 max-w-lg w-full">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Error</h3>
              <p className="text-gray-600 mt-1">{error || 'Application not found'}</p>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => router.push('/admin')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Application List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Application Details</h1>
              <div className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(application.status)}`}>
                {STATUS_OPTIONS.find(option => option.value === application.status)?.label || 'Submitted'}
              </div>
            </div>
            <button
              onClick={() => router.push('/admin')}
              className="mt-2 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Applications
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Personal Information Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-600 to-blue-500">
            <h2 className="text-lg font-medium text-white">Applicant Information</h2>
            <p className="mt-1 max-w-2xl text-sm text-indigo-100">Personal details of the applicant</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
              <InfoItem label="Name" value={application.applicant?.name || 'Not provided'} />
              <InfoItem label="Email" value={application.applicant?.email || 'Not provided'} />
              <InfoItem label="Application ID" value={application._id} />
              <InfoItem 
                label="Submitted On" 
                value={application.submittedAt ? formatDate(application.submittedAt) : 'Unknown'} 
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Application Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Responses Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-teal-500 to-green-500">
                <h2 className="text-lg font-medium text-white">Application Responses</h2>
                <p className="mt-1 max-w-2xl text-sm text-teal-100">Detailed answers provided by the applicant</p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <ResponseItem title="Motivation" content={application.motivation} even={true} />
                  <ResponseItem title="Training Background" content={application.trainingBackground} even={false} />
                  <ResponseItem title="Simplifying Complex Concepts" content={application.simplifyingConcepts} even={true} />
                  <ResponseItem title="Handling Maneuver Challenges" content={application.handlingChallenges} even={false} />
                  <ResponseItem title="Managing Student Anxiety" content={application.managingAnxiety} even={true} />
                  <ResponseItem title="Regulatory Knowledge" content={application.regulatoryKnowledge} even={false} />
                  <ResponseItem title="Physical Readiness" content={application.physicalReadiness} even={true} />
                  <ResponseItem title="Exam Willingness" content={application.examWillingness} even={false} />
                  <ResponseItem title="Monitoring Progress" content={application.monitoringProgress} even={true} />
                </dl>
              </div>
            </div>

            {/* Documents Section */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-purple-500 to-pink-500">
                <h2 className="text-lg font-medium text-white">Uploaded Documents</h2>
                <p className="mt-1 max-w-2xl text-sm text-purple-100">Supporting documents provided by the applicant</p>
              </div>
              <div className="border-t border-gray-200 p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(application.documents || {}).map(([key, url]) => (
                    url && (
                      <div key={key} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
                        <div className="px-4 py-4 flex-1">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-100 rounded-md p-2">
                              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <h4 className="text-sm font-medium text-gray-900">
                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                              </h4>
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3 bg-gray-50 text-right border-t border-gray-200">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
                          >
                            View Document
                            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    )
                  ))}
                  
                  {Object.values(application.documents || {}).filter(Boolean).length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                      <p className="mt-1 text-sm text-gray-500">No documents were uploaded by the applicant.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Assessment */}
          <div className="space-y-6">
            {/* Assessment Form */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-orange-500 to-amber-500">
                <h2 className="text-lg font-medium text-white">Assessment</h2>
                <p className="mt-1 max-w-2xl text-sm text-orange-100">Evaluate the application</p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6 space-y-5">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Application Status
                  </label>
                  <select
                    id="status"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select a status</option>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Reviewer Notes
                  </label>
                  <div>
                    <textarea
                      id="notes"
                      rows="6"
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Add your assessment notes..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={handleStatusUpdate}
                    disabled={!selectedStatus || updating}
                    className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      (!selectedStatus || updating) ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {updating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating Status...
                      </>
                    ) : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-500 to-cyan-500">
                <h2 className="text-lg font-medium text-white">Status Timeline</h2>
                <p className="mt-1 max-w-2xl text-sm text-blue-100">History of status changes</p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                {application?.statusHistory?.length > 0 ? (
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {application.statusHistory.map((entry, index) => (
                        <li key={entry.timestamp}>
                          <div className="relative pb-8">
                            {index !== application.statusHistory.length - 1 && (
                              <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            )}
                            <div className="relative flex items-start space-x-3">
                              <div className="relative">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  entry.status === 'accepted' ? 'bg-green-100' :
                                  entry.status === 'rejected' ? 'bg-red-100' :
                                  entry.status === 'review' ? 'bg-yellow-100' :
                                  entry.status === 'hold' ? 'bg-purple-100' :
                                  'bg-blue-100'
                                }`}>
                                  <svg className={`h-6 w-6 ${
                                    entry.status === 'accepted' ? 'text-green-600' :
                                    entry.status === 'rejected' ? 'text-red-600' :
                                    entry.status === 'review' ? 'text-yellow-600' :
                                    entry.status === 'hold' ? 'text-purple-600' :
                                    'text-blue-600'
                                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm">
                                  <div className="font-medium text-gray-900">
                                    Status changed to <span className="font-semibold capitalize">{entry.status}</span>
                                  </div>
                                  <p className="mt-0.5 text-gray-500">
                                    {formatDate(entry.timestamp)}
                                  </p>
                                </div>
                                {entry.notes && (
                                  <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
                                    {entry.notes}
                                  </div>
                                )}
                              </div>
                              <div className="flex-shrink-0 self-center">
                                <button
                                  onClick={() => handleDeleteStatus(index)}
                                  disabled={deletingStatus === index}
                                  className="bg-white rounded-md text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                  title="Delete status update"
                                >
                                  {deletingStatus === index ? (
                                    <div className="animate-spin h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full"></div>
                                  ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No status history</h3>
                    <p className="mt-1 text-sm text-gray-500">This application has not had any status updates yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function ResponseItem({ title, content, even }) {
  const bgColor = even ? 'bg-gray-50' : 'bg-white';
  
  return (
    <div className={`${bgColor} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
      <dt className="text-sm font-medium text-gray-700">{title}</dt>
      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{content}</dd>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}