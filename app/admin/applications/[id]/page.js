'use client';
import { useState, useEffect } from 'react';
import { auth } from '../../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter, useParams } from 'next/navigation';
import { getApplicationById, updateApplicationStatus } from '../../../lib/sanity.queries';

const ADMIN_EMAILS = ['mujtabachandio384@gmail.com', 'adeelahmed12335@gmail.com'];

export default function ApplicationDetails({ params }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !ADMIN_EMAILS.includes(user.email)) {
        router.push('/signin');
        return;
      }

      try {
        const applicationData = await getApplicationById(id);
        setApplication(applicationData);
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

  const handleStatusUpdate = async (newStatus) => {
    try {
      setIsSaving(true);
      await updateApplicationStatus(application._id, newStatus, reviewerNotes);
      const updatedApplication = await getApplicationById(id);
      setApplication(updatedApplication);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsSaving(false);
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
              Back to Admin Panel
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Application Header */}
          <div className="bg-gray-50 px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-bold text-gray-900">{application.applicant?.name || 'Applicant'}</h2>
                    <div className="text-sm text-gray-500 flex flex-wrap items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{application.applicant?.email || 'Anonymous'}</span>
                      <span className="mx-2">•</span>
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Submitted {new Date(application.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                  <span className={`h-2 w-2 rounded-full mr-2 ${application.status === 'approved' ? 'bg-emerald-500' : application.status === 'rejected' ? 'bg-rose-500' : application.status === 'reviewing' ? 'bg-amber-500' : 'bg-sky-500'}`}></span>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
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
                      value={application.status}
                      onChange={(e) => handleStatusUpdate(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="reviewing">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
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
                      onClick={() => handleStatusUpdate(application.status)}
                      disabled={isSaving}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </button>
                    {saveSuccess && (
                      <span className="text-green-600 text-sm">
                        <svg className="inline-block h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Saved
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline Section */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h3>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      <TimelineItem 
                        status="submitted" 
                        date={new Date(application.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                        active={true} 
                      />
                      <TimelineItem 
                        status="reviewing" 
                        date={application.status === 'reviewing' || application.status === 'approved' || application.status === 'rejected' ? 
                              "Status updated" : ""} 
                        active={application.status === 'reviewing' || application.status === 'approved' || application.status === 'rejected'} 
                      />
                      <TimelineItem 
                        status="decision" 
                        date={application.status === 'approved' || application.status === 'rejected' ? 
                              application.status.charAt(0).toUpperCase() + application.status.slice(1) : ""} 
                        active={application.status === 'approved' || application.status === 'rejected'} 
                        isLast={true}
                      />
                    </ul>
                  </div>
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

// Timeline Item Component
function TimelineItem({ status, date, active, isLast = false }) {
  return (
    <li>
      <div className="relative pb-8">
        {!isLast && (
          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
        )}
        <div className="relative flex space-x-3">
          <div>
            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${active ? 'bg-indigo-500' : 'bg-gray-200'}`}>
              {status === 'submitted' ? (
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              ) : status === 'reviewing' ? (
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
          </div>
          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
            <div>
              <p className={`text-sm ${active ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                {status === 'submitted' ? 'Application Submitted' : 
                 status === 'reviewing' ? 'Under Review' : 'Final Decision'}
              </p>
            </div>
            <div className="text-right text-sm whitespace-nowrap text-gray-500">
              <time dateTime={date}>{date}</time>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}