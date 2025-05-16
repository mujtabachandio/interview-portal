'use client';
import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { getUserByFirebaseUid, getAllApplications, updateApplicationStatus } from '../lib/sanity.queries';
import { useAuth } from '../contexts/AuthContext';

const ADMIN_EMAILS = ['mujtabachandio384@gmail.com', 'adeelahmed12335@gmail.com'];

export default function AdminPanel() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !ADMIN_EMAILS.includes(user.email))) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user || !ADMIN_EMAILS.includes(user.email)) {
        router.push('/signin');
        return;
      }

      try {
        const applicationsData = await getAllApplications();
        console.log('Fetched applications:', applicationsData); // Debug log
        setApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      setUpdatingStatus(prev => ({ ...prev, [applicationId]: true }));
      await updateApplicationStatus(applicationId, newStatus);
      // Refresh applications after update
      const updatedApplications = await getAllApplications();
      setApplications(updatedApplications);
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update application status');
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [applicationId]: false }));
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Panel</h1>
        
        {/* Applications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <div key={application._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Application Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.applicant?.email || 'Anonymous'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {application.applicant?.name || 'No name provided'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    application.status === 'approved' ? 'bg-green-100 text-green-800' :
                    application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    application.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Submitted on {new Date(application.submittedAt).toLocaleDateString()}
                </p>
              </div>

              {/* Application Preview */}
              <div className="p-6">
                <p className="text-gray-600 line-clamp-3 mb-4">
                  {application.motivation}
                </p>
                
                {/* Status Update Controls */}
                <div className="mt-4 space-y-2">
                  <select
                    value={application.status}
                    onChange={(e) => handleStatusUpdate(application._id, e.target.value)}
                    disabled={updatingStatus[application._id]}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      updatingStatus[application._id] ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="submitted">Submitted</option>
                    <option value="reviewing">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  {updatingStatus[application._id] && (
                    <div className="text-sm text-blue-600 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Updating status...
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => router.push(`/admin/applications/${application._id}`)}
                  className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-md hover:from-blue-700 hover:to-blue-800 transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 