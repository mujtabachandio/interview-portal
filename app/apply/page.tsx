'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function ApplyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    experienceOverview: '',
    teachingMotivation: '',
    trainingBackground: '',
    complexConcepts: '',
    maneuverChallenges: '',
    studentAnxiety: '',
    regulatoryKnowledge: '',
    physicalReadiness: '',
    examWillingness: '',
    studentProgress: '',
  });

  // File state
  const [files, setFiles] = useState({
    driversLicense: null as File | null,
    medicalCard: null as File | null,
    driversAbstract: null as File | null,
    instructorCertifications: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0] || null;
    setFiles(prev => ({ ...prev, [name]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit an application');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate required files
      if (!files.driversLicense || !files.medicalCard || !files.driversAbstract) {
        setError('Please upload all required documents');
        return;
      }

      console.log('Starting application submission...');
      console.log('User:', { uid: user.uid, email: user.email });
      console.log('Form data:', formData);

      // Upload files one by one
      const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Failed to upload file');
        }

        const data = await res.json();
        return data.fileRef;
      };

      // Upload all files
      console.log('Uploading files...');
      const [driversLicense, medicalCard, driversAbstract, instructorCertifications] = await Promise.all([
        uploadFile(files.driversLicense!),
        uploadFile(files.medicalCard!),
        uploadFile(files.driversAbstract!),
        files.instructorCertifications ? uploadFile(files.instructorCertifications) : undefined,
      ]);

      console.log('Files uploaded successfully');

      // Create application data
      const applicationData = {
        userId: user.uid,
        email: user.email!,
        ...formData,
        driversLicense,
        medicalCard,
        driversAbstract,
        instructorCertifications,
      };

      // Submit application
      console.log('Submitting application...');
      const response = await fetch('/api/submit-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
      }

      const result = await response.json();
      console.log('Application submitted successfully:', result);

      router.push('/dashboard');
    } catch (err) {
      console.error('Application submission error:', err);
      if (err instanceof Error) {
        console.error('Error details:', {
          message: err.message,
          stack: err.stack
        });
        setError(err.message);
      } else {
        setError('Failed to submit application. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Please sign in to apply
          </h2>
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <button
                onClick={() => router.push('/signin')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Job Application Form
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>Please fill out all required fields and upload the necessary documents.</p>
            </div>
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
              {/* Experience and Background */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Experience and Background</h4>
                <div>
                  <label htmlFor="experienceOverview" className="block text-sm font-medium text-gray-700">
                    Brief description of your truck driving experience
                  </label>
                  <textarea
                    id="experienceOverview"
                    name="experienceOverview"
                    rows={3}
                    required
                    value={formData.experienceOverview}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="teachingMotivation" className="block text-sm font-medium text-gray-700">
                    What motivates you to become a driving instructor?
                  </label>
                  <textarea
                    id="teachingMotivation"
                    name="teachingMotivation"
                    rows={3}
                    required
                    value={formData.teachingMotivation}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="trainingBackground" className="block text-sm font-medium text-gray-700">
                    Describe your experience in training or mentoring others
                  </label>
                  <textarea
                    id="trainingBackground"
                    name="trainingBackground"
                    rows={3}
                    required
                    value={formData.trainingBackground}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Teaching Approach */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Teaching Approach</h4>
                <div>
                  <label htmlFor="complexConcepts" className="block text-sm font-medium text-gray-700">
                    How do you approach explaining complex topics to students?
                  </label>
                  <textarea
                    id="complexConcepts"
                    name="complexConcepts"
                    rows={3}
                    required
                    value={formData.complexConcepts}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="maneuverChallenges" className="block text-sm font-medium text-gray-700">
                    How do you handle difficult maneuvers with students?
                  </label>
                  <textarea
                    id="maneuverChallenges"
                    name="maneuverChallenges"
                    rows={3}
                    required
                    value={formData.maneuverChallenges}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="studentAnxiety" className="block text-sm font-medium text-gray-700">
                    How do you manage student anxiety during training?
                  </label>
                  <textarea
                    id="studentAnxiety"
                    name="studentAnxiety"
                    rows={3}
                    required
                    value={formData.studentAnxiety}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Knowledge and Readiness */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Knowledge and Readiness</h4>
                <div>
                  <label htmlFor="regulatoryKnowledge" className="block text-sm font-medium text-gray-700">
                    How familiar are you with DOT regulations?
                  </label>
                  <textarea
                    id="regulatoryKnowledge"
                    name="regulatoryKnowledge"
                    rows={3}
                    required
                    value={formData.regulatoryKnowledge}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="physicalReadiness" className="block text-sm font-medium text-gray-700">
                    Are you comfortable with the physical demands of the job?
                  </label>
                  <textarea
                    id="physicalReadiness"
                    name="physicalReadiness"
                    rows={3}
                    required
                    value={formData.physicalReadiness}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="examWillingness" className="block text-sm font-medium text-gray-700">
                    Are you willing to take the MVC Instructor Exam?
                  </label>
                  <textarea
                    id="examWillingness"
                    name="examWillingness"
                    rows={3}
                    required
                    value={formData.examWillingness}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="studentProgress" className="block text-sm font-medium text-gray-700">
                    How do you track and evaluate student progress?
                  </label>
                  <textarea
                    id="studentProgress"
                    name="studentProgress"
                    rows={3}
                    required
                    value={formData.studentProgress}
                    onChange={handleInputChange}
                    className="text-black mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Required Documents */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">Required Documents</h4>
                <div>
                  <label htmlFor="driversLicense" className="block text-sm font-medium text-gray-700">
                    Drivers License or CDL (Required)
                  </label>
                  <input
                    type="file"
                    id="driversLicense"
                    name="driversLicense"
                    required
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                </div>
                <div>
                  <label htmlFor="medicalCard" className="block text-sm font-medium text-gray-700">
                    Medical Card (Required)
                  </label>
                  <input
                    type="file"
                    id="medicalCard"
                    name="medicalCard"
                    required
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                </div>
                <div>
                  <label htmlFor="driversAbstract" className="block text-sm font-medium text-gray-700">
                    Drivers Abstract (Required)
                  </label>
                  <input
                    type="file"
                    id="driversAbstract"
                    name="driversAbstract"
                    required
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                </div>
                <div>
                  <label htmlFor="instructorCertifications" className="block text-sm font-medium text-gray-700">
                    Instructor Certifications or Licenses (Optional)
                  </label>
                  <input
                    type="file"
                    id="instructorCertifications"
                    name="instructorCertifications"
                    onChange={handleFileChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100"
                  />
                </div>
              </div>

              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 