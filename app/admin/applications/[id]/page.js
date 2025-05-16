'use client';
import { useState, useEffect } from 'react';
import { auth } from '../../../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { getApplicationById, updateApplicationStatus } from '../../../lib/sanity.queries';

const ADMIN_EMAIL = 'mujtabachandio384@gmail.com';

export default function ApplicationDetails({ params }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/signin');
        return;
      }

      try {
        const applicationData = await getApplicationById(params.id);
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
  }, [params.id, router]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateApplicationStatus(application._id, newStatus, reviewerNotes);
      const updatedApplication = await getApplicationById(params.id);
      setApplication(updatedApplication);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error || 'Application not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin')}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Admin Panel
        </button>

        {/* Application Details */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted by {application.user?.name || 'Anonymous'} on {new Date(application.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                application.status === 'approved' ? 'bg-green-100 text-green-800' :
                application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                application.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Update */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
              <div className="space-y-4">
                <select
                  value={application.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="submitted">Submitted</option>
                  <option value="reviewing">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <textarea
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Add reviewer notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>
            </div>

            {/* Application Responses */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Application Responses</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Motivation</h4>
                  <p className="mt-1 text-gray-600">{application.motivation}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Training Background</h4>
                  <p className="mt-1 text-gray-600">{application.trainingBackground}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Simplifying Complex Concepts</h4>
                  <p className="mt-1 text-gray-600">{application.simplifyingConcepts}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Handling Maneuver Challenges</h4>
                  <p className="mt-1 text-gray-600">{application.handlingChallenges}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Managing Student Anxiety</h4>
                  <p className="mt-1 text-gray-600">{application.managingAnxiety}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Regulatory Knowledge</h4>
                  <p className="mt-1 text-gray-600">{application.regulatoryKnowledge}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Physical Readiness</h4>
                  <p className="mt-1 text-gray-600">{application.physicalReadiness}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Exam Willingness</h4>
                  <p className="mt-1 text-gray-600">{application.examWillingness}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Monitoring Progress</h4>
                  <p className="mt-1 text-gray-600">{application.monitoringProgress}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(application.documents).map(([key, url]) => (
                  url && (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h4>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-700"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Document
                      </a>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 