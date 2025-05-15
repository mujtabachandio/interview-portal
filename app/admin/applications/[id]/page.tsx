'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Image from 'next/image';

interface Application {
  _id: string;
  email: string;
  status: string;
  submittedAt: string;
  requiredDocuments: {
    [key: string]: {
      url: string;
      originalFilename: string;
    };
  };
}

interface FileInfo {
  url: string;
  filename: string;
  type: string;
  size: string;
}

interface FileInfoMap {
  [key: string]: FileInfo;
}

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
  const [fileInfoMap, setFileInfoMap] = useState<FileInfoMap>({});

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    // Check if user is admin
    if (!user.email?.includes('admin')) {
      router.push('/');
      return;
    }

    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/admin/applications/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${user.email}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch application');
        }
        const data = await response.json();
        setApplication(data.application);
        setStatus(data.application.status);
      } catch (err) {
        console.error('Error fetching application:', err);
        setError('Failed to load application');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [user, router, params.id]);

  useEffect(() => {
    if (application?.requiredDocuments) {
      const fetchFileInfo = async () => {
        const fileInfo: FileInfoMap = {};
        for (const [key, doc] of Object.entries(application.requiredDocuments)) {
          try {
            const response = await fetch(doc.url);
            const contentType = response.headers.get('content-type') || '';
            const contentLength = response.headers.get('content-length') || '0';
            
            fileInfo[key] = {
              url: doc.url,
              filename: doc.originalFilename,
              type: contentType,
              size: formatFileSize(parseInt(contentLength))
            };
          } catch (err) {
            console.error(`Error fetching file info for ${key}:`, err);
          }
        }
        setFileInfoMap(fileInfo);
      };

      fetchFileInfo();
    }
  }, [application]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${params.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.email}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setStatus(newStatus);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    }
  };

  const handlePreview = (fileInfo: FileInfo) => {
    setPreviewFile(fileInfo);
  };

  const handleDownload = async (fileInfo: FileInfo) => {
    try {
      const response = await fetch(fileInfo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileInfo.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

  const renderFilePreview = () => {
    if (!previewFile) return null;

    const fileType = previewFile.type.split('/')[0];
    const isPdf = previewFile.type === 'application/pdf';
    const isText = previewFile.type.startsWith('text/');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-4 w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{previewFile.filename}</h3>
            <button
              onClick={() => setPreviewFile(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {fileType === 'image' ? (
              <Image
                width={1000}
                height={1000}
                src={previewFile.url}
                alt={previewFile.filename}
                className="max-w-full max-h-full object-contain"
              />
            ) : isPdf ? (
              <iframe
                src={previewFile.url}
                className="w-full h-full"
                title={previewFile.filename}
              />
            ) : isText ? (
              <iframe
                src={previewFile.url}
                className="w-full h-full"
                title={previewFile.filename}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Preview not available for this file type</p>
                <button
                  onClick={() => handleDownload(previewFile)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Download File
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFileCard = (key: string, fileInfo: FileInfo) => {
    const fileType = fileInfo.type.split('/')[0];
    const isPdf = fileInfo.type === 'application/pdf';
    const isText = fileInfo.type.startsWith('text/');

    return (
      <div key={key} className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">{key}</h4>
            <p className="text-sm text-gray-500">{fileInfo.filename}</p>
            <p className="text-xs text-gray-400">
              {fileInfo.type} • {fileInfo.size}
            </p>
          </div>
          <div className="flex space-x-2">
            {(fileType === 'image' || isPdf || isText) && (
              <button
                onClick={() => handlePreview(fileInfo)}
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Preview
              </button>
            )}
            <button
              onClick={() => handleDownload(fileInfo)}
              className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Application not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Application Details
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Submitted on {new Date(application.submittedAt).toLocaleDateString()}
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{application.email}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                  >
                    <option value="new">New</option>
                    <option value="reviewing">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Required Documents
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(application.requiredDocuments).map(([key]) => {
              const fileInfo = fileInfoMap[key];
              return fileInfo ? renderFileCard(key, fileInfo) : null;
            })}
          </div>
        </div>
      </div>
      {renderFilePreview()}
    </div>
  );
} 