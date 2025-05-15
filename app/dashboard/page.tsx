'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Application {
  _id: string;
  status: string;
  submittedAt: string;
  experienceOverview: string;
  teachingMotivation: string;
  trainingBackground: string;
  complexConcepts: string;
  maneuverChallenges: string;
  studentAnxiety: string;
  regulatoryKnowledge: string;
  physicalReadiness: string;
  examWillingness: string;
  studentProgress: string;
  driversLicense: {
    _type: 'file';
    asset: {
      _type: 'reference';
      _ref: string;
    };
  };
  medicalCard: {
    _type: 'file';
    asset: {
      _type: 'reference';
      _ref: string;
    };
  };
  driversAbstract: {
    _type: 'file';
    asset: {
      _type: 'reference';
      _ref: string;
    };
  };
  instructorCertifications?: {
    _type: 'file';
    asset: {
      _type: 'reference';
      _ref: string;
    };
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/signin');
      return;
    }

    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/applications/${user.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch application');
        }
        const data = await response.json();
        setApplication(data.application);
      } catch (err) {
        console.error('Error fetching application:', err);
        setError('Failed to load application');
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your application...</p>
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
            onClick={() => router.push('/apply')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Submit Application
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Application Found</h2>
          <p className="text-gray-600 mb-4">You havent submitted an application yet.</p>
          <button
            onClick={() => router.push('/apply')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Submit Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Your Application
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                application.status === 'new' ? 'bg-yellow-100 text-yellow-800' :
                application.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Experience and Background</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Experience Overview</label>
                    <p className="mt-1 text-sm text-gray-900">{application.experienceOverview}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teaching Motivation</label>
                    <p className="mt-1 text-sm text-gray-900">{application.teachingMotivation}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Training Background</label>
                    <p className="mt-1 text-sm text-gray-900">{application.trainingBackground}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Teaching Approach</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Complex Concepts</label>
                    <p className="mt-1 text-sm text-gray-900">{application.complexConcepts}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Maneuver Challenges</label>
                    <p className="mt-1 text-sm text-gray-900">{application.maneuverChallenges}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student Anxiety</label>
                    <p className="mt-1 text-sm text-gray-900">{application.studentAnxiety}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Knowledge and Readiness</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Regulatory Knowledge</label>
                    <p className="mt-1 text-sm text-gray-900">{application.regulatoryKnowledge}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Physical Readiness</label>
                    <p className="mt-1 text-sm text-gray-900">{application.physicalReadiness}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Exam Willingness</label>
                    <p className="mt-1 text-sm text-gray-900">{application.examWillingness}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Student Progress</label>
                    <p className="mt-1 text-sm text-gray-900">{application.studentProgress}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-2">Submitted Documents</h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Drivers License</p>
                  <p className="text-sm text-gray-600">Medical Card</p>
                  <p className="text-sm text-gray-600">Drivers Abstract</p>
                  {application.instructorCertifications && (
                    <p className="text-sm text-gray-600">Instructor Certifications</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Submitted on {new Date(application.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 