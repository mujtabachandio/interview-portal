'use client';
import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { getUserByFirebaseUid, getApplicationByUserId } from '../lib/sanity.queries';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  PauseCircle, 
  FileText, 
  ChevronRight,
  Loader2
} from 'lucide-react';

const statusConfig = {
  submitted: {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    label: 'Application Submitted',
    icon: <Clock className="w-5 h-5" />,
    gradientFrom: 'from-blue-50',
    gradientTo: 'to-blue-100'
  },
  review: {
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    label: 'Under Review',
    icon: <AlertTriangle className="w-5 h-5" />,
    gradientFrom: 'from-amber-50',
    gradientTo: 'to-amber-100'
  },
  accepted: {
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    label: 'Application Accepted',
    icon: <CheckCircle className="w-5 h-5" />,
    gradientFrom: 'from-emerald-50',
    gradientTo: 'to-emerald-100'
  },
  rejected: {
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    label: 'Application Rejected',
    icon: <XCircle className="w-5 h-5" />,
    gradientFrom: 'from-rose-50',
    gradientTo: 'to-rose-100'
  },
  hold: {
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    label: 'Application On Hold',
    icon: <PauseCircle className="w-5 h-5" />,
    gradientFrom: 'from-orange-50',
    gradientTo: 'to-orange-100'
  }
};

// Default status configuration for unknown statuses
const defaultStatusConfig = {
  color: 'bg-gray-100 text-gray-700 border-gray-200',
  label: 'Unknown Status',
  icon: <AlertTriangle className="w-5 h-5" />,
  gradientFrom: 'from-gray-50',
  gradientTo: 'to-gray-100'
};

// Format date with proper ordinal suffix
const formatDate = (dateString) => {
  const date = new Date(dateString);
  
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('en-US', options);
};

// Format document keys to readable text
const formatDocumentName = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/Id$/i, 'ID')
    .replace(/Pdf$/i, 'PDF');
};

export default function ApplicationStatus() {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchApplicationStatus = async (user) => {
    try {
      const sanityUser = await getUserByFirebaseUid(user.uid);
      if (!sanityUser) {
        setError('User not found');
        setLoading(false);
        return;
      }

      const applicationData = await getApplicationByUserId(sanityUser._id);
      setApplication(applicationData);
    } catch (err) {
      setError('Failed to fetch application status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/signin');
        return;
      }

      await fetchApplicationStatus(user);
    });

    return () => unsubscribe();
  }, [router]);

  // Add polling effect
  useEffect(() => {
    if (!application) return;

    const pollInterval = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        await fetchApplicationStatus(user);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [application]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Loading application data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-red-100">
            <div className="p-6 bg-red-50 border-b border-red-100 flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-red-100 rounded-full">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-red-800">Error Loading Application</h2>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
            <div className="p-6 bg-white">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-8 sm:p-10 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Application Found</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You haven&apos;t submitted an application yet. Complete your application to start the process.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[application.status] || defaultStatusConfig;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with application ID */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Application Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Application ID: <span className="font-medium">{application._id.substring(0, 8).toUpperCase()}</span>
          </p>
        </div>
        
        {/* Status Overview Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-8 relative">
          <div className={`absolute top-0 left-0 w-1 h-full ${currentStatus.color.replace(/bg-([a-z]+-\d+).*/, 'bg-$1')}`}></div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${currentStatus.color} mr-4 flex-shrink-0`}>
                  {currentStatus.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Application Status</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1">
                    <p className="text-gray-600">
                      Submitted on {formatDate(application.submittedAt)}
                    </p>
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${currentStatus.color.replace(/bg-([a-z]+-\d+).*/, 'bg-$1')} mr-2`}></span>
                      <span className={`font-medium ${currentStatus.color.replace(/bg-[a-z]+-\d+ /, '')}`}>
                        {currentStatus.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className={`inline-flex items-center px-4 py-2 rounded-full ${currentStatus.color} border`}>
                  <span className="font-medium">{currentStatus.label}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 h-full">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">Application Timeline</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {application.statusHistory && application.statusHistory.map((status, index) => {
                    const statusInfo = statusConfig[status.status] || defaultStatusConfig;
                    const isLast = index === application.statusHistory.length - 1;
                    
                    return (
                      <div key={index} className="relative">
                        {!isLast && (
                          <div className="absolute top-8 left-4 h-full w-0.5 bg-gray-200" style={{ height: 'calc(100% - 24px)' }}></div>
                        )}
                        <div className="flex items-start">
                          <div className="flex-shrink-0 z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusInfo.color}`}>
                              {statusInfo.icon}
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <div className={`p-4 rounded-lg ${statusInfo.gradientFrom} ${statusInfo.gradientTo} bg-gradient-to-br border ${statusInfo.color.replace(/bg-([a-z]+-\d+).*/, 'border-$1')}`}>
                              <p className="font-medium text-gray-900">
                                {statusInfo.label}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatDate(status.timestamp)}
                              </p>
                              {status.note && (
                                <p className="mt-2 text-sm text-gray-700 bg-white bg-opacity-50 p-2 rounded">
                                  {status.note}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Document Status */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 h-full">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900">Documents</h3>
              </div>
              <div className="p-2">
                {Object.entries(application.documents).map(([key, url], index) => (
                  url && (
                    <div key={key} className={`flex items-center p-4 hover:bg-gray-50 transition-colors duration-150 ${index !== 0 ? 'border-t border-gray-100' : ''}`}>
                      <div className="p-2 bg-blue-50 rounded-lg mr-4">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {formatDocumentName(key)}
                        </p>
                      </div>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors duration-150"
                        aria-label={`View ${formatDocumentName(key)}`}
                      >
                        <ChevronRight className="h-5 w-5" />
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