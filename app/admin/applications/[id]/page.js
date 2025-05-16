'use client';
import { useState, useEffect } from 'react';
import { auth } from '../../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, useParams } from 'next/navigation';
import { getApplicationById, updateApplicationStatus, deleteStatusUpdate } from '../../../lib/sanity.queries';
import { useAuth } from '../../../contexts/AuthContext';

const ADMIN_EMAILS = ['mujtabachandio384@gmail.com', 'adeelahmed12335@gmail.com','aqibhanif47@gmail.com'];

const STATUS_OPTIONS = [
  { value: 'submitted', label: 'Submitted', color: 'blue' },
  { value: 'review', label: 'Review', color: 'yellow' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'hold', label: 'Hold', color: 'purple' },
  { value: 'accepted', label: 'Accepted', color: 'green' }
];

export default function ApplicationDetails({ params }) {
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
        console.log('Fetched application data:', applicationData); // Debug log
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
      console.log('Updated application:', updatedApplication);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'reviewing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4 text-lg">Loading application details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg shadow-sm">
            <div className="flex">
              <svg className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">{error || 'Application not found'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Instructor Application</h1>
            <button
              onClick={() => router.push('/admin')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Application List
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Application Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 pb-3 border-b border-gray-200">Application Details</h3>
              <div className="mt-6 space-y-8">
                {/* Application Responses */}
                <div className="space-y-6">
                  <ResponseItem title="Motivation" content={application.motivation} />
                  <ResponseItem title="Training Background" content={application.trainingBackground} />
                  <ResponseItem title="Simplifying Complex Concepts" content={application.simplifyingConcepts} />
                  <ResponseItem title="Handling Maneuver Challenges" content={application.handlingChallenges} />
                  <ResponseItem title="Managing Student Anxiety" content={application.managingAnxiety} />
                  <ResponseItem title="Regulatory Knowledge" content={application.regulatoryKnowledge} />
                  <ResponseItem title="Physical Readiness" content={application.physicalReadiness} />
                  <ResponseItem title="Exam Willingness" content={application.examWillingness} />
                  <ResponseItem title="Monitoring Progress" content={application.monitoringProgress} />
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 pb-3 border-b border-gray-200">Uploaded Documents</h3>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-5">
                {Object.entries(application.documents).map(([key, url]) => (
                  url && (
                    <div key={key} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900">
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </h4>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                            >
                              View Document
                              <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Assessment */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Assessment</h3>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Application Status
                  </label>
                  <select
                    id="status"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Reviewer Notes
                  </label>
                  <div className="mt-1">
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
                
                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={handleStatusUpdate}
                    disabled={!selectedStatus || updating}
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      (!selectedStatus || updating) ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {updating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h3>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {application?.statusHistory?.length > 0 ? (
                      application.statusHistory.map((entry, index) => (
                        <li key={entry.timestamp}>
                          <div className="relative pb-8">
                            {index !== application.statusHistory.length - 1 && (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            )}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  entry.status === 'approved' ? 'bg-green-500' :
                                  entry.status === 'rejected' ? 'bg-red-500' :
                                  entry.status === 'reviewing' ? 'bg-yellow-500' :
                                  'bg-blue-500'
                                }`}>
                                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </span>
                              </div>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Status changed to <span className="font-medium text-gray-900">{entry.status}</span>
                                    {entry.notes && (
                                      <span className="block mt-1 text-gray-500">{entry.notes}</span>
                                    )}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <time className="text-right text-sm whitespace-nowrap text-gray-500" dateTime={entry.timestamp}>
                                    {new Date(entry.timestamp).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: 'numeric',
                                      minute: 'numeric'
                                    })}
                                  </time>
                                  <button
                                    onClick={() => handleDeleteStatus(index)}
                                    disabled={deletingStatus === index}
                                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                                    title="Delete status update"
                                  >
                                    {deletingStatus === index ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                    ) : (
                                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500">No status history available</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Response Item Component
function ResponseItem({ title, content }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-700">{title}</dt>
      <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-4 rounded-md border border-gray-100">{content}</dd>
    </div>
  );
}