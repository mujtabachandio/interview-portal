'use client';
import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { createApplication, getUserByFirebaseUid, createUser } from '../lib/sanity.queries';
import { useRouter } from 'next/navigation';

export default function ApplicationForm() {
  const [formData, setFormData] = useState({
    motivation: '',
    trainingBackground: '',
    simplifyingConcepts: '',
    handlingChallenges: '',
    managingAnxiety: '',
    regulatoryKnowledge: '',
    physicalReadiness: '',
    examWillingness: '',
    monitoringProgress: '',
    documents: {
      driversLicense: null,
      medicalCard: null,
      driverAbstract: null,
      instructorCertifications: null
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const setupUser = async () => {
      const user = auth.currentUser;
      if (user) {
        // Check if user exists in Sanity
        let sanityUser = await getUserByFirebaseUid(user.uid);
        
        // If user doesn't exist, create them
        if (!sanityUser) {
          sanityUser = await createUser({
            email: user.email,
            name: user.displayName || user.email.split('@')[0],
            firebaseUid: user.uid
          });
        }
        
        setUserId(sanityUser._id);
      }
    };

    setupUser();
  }, []);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (file && !allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [name]: 'Please upload a valid file (PDF, DOC, DOCX, or image)'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [name]: file
      }
    }));
    setErrors(prev => ({
      ...prev,
      [name]: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate required fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'documents' && !formData[key]) {
        newErrors[key] = 'This field is required';
      }
    });

    // Validate required documents
    const requiredDocs = ['driversLicense', 'medicalCard', 'driverAbstract'];
    requiredDocs.forEach(doc => {
      if (!formData.documents[doc]) {
        newErrors[doc] = 'This document is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await createApplication({
        ...formData,
        userId
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          router.push('/application-status');
        }, 500);
      }, 2000);
    } catch (err) {
      console.error('Error submitting application:', err);
      setErrors({ submit: 'Failed to submit application. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {showSuccess && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
          <div className={`bg-white rounded-xl p-8 max-w-md w-full mx-4 transform transition-all duration-500 ${isFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Application Submitted!</h3>
              <p className="text-sm text-gray-500">
                Thank you for your application. We will review it and get back to you soon.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {errors.submit}
          </div>
        )}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructor Application Form</h2>

          {/* Motivation Question */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              What motivates you to become a driving instructor, and what excites you about teaching new drivers?
            </label>
            <textarea
              name="motivation"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={formData.motivation}
              onChange={handleTextChange}
            />
            {errors.motivation && <p className="text-red-500 text-sm">{errors.motivation}</p>}
          </div>

          {/* Training Background */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Have you ever trained or mentored others? If so, how did you support their learning and growth?
            </label>
            <textarea
              name="trainingBackground"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={formData.trainingBackground}
              onChange={handleTextChange}
            />
            {errors.trainingBackground && <p className="text-red-500 text-sm">{errors.trainingBackground}</p>}
          </div>

          {/* Simplifying Concepts */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              How would you explain a complex topic—like the air brake system—to someone with no prior truck experience?
            </label>
            <textarea
              name="simplifyingConcepts"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={formData.simplifyingConcepts}
              onChange={handleTextChange}
            />
            {errors.simplifyingConcepts && <p className="text-red-500 text-sm">{errors.simplifyingConcepts}</p>}
          </div>

          {/* Handling Challenges */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              What&apos;s your approach when a student is struggling with maneuvers like alley docking or parallel parking?
            </label>
            <textarea
              name="handlingChallenges"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={formData.handlingChallenges}
              onChange={handleTextChange}
            />
            {errors.handlingChallenges && <p className="text-red-500 text-sm">{errors.handlingChallenges}</p>}
          </div>

          {/* Managing Anxiety */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              How do you help students who become frustrated or anxious during on-the-road training?
            </label>
            <textarea
              name="managingAnxiety"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={formData.managingAnxiety}
              onChange={handleTextChange}
            />
            {errors.managingAnxiety && <p className="text-red-500 text-sm">{errors.managingAnxiety}</p>}
          </div>

          {/* Regulatory Knowledge */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              How familiar are you with DOT regulations, and how do you ensure your students understand and follow them?
            </label>
            <textarea
              name="regulatoryKnowledge"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={formData.regulatoryKnowledge}
              onChange={handleTextChange}
            />
            {errors.regulatoryKnowledge && <p className="text-red-500 text-sm">{errors.regulatoryKnowledge}</p>}
          </div>

          {/* Physical Readiness */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Are you comfortable working outdoors in all weather conditions and climbing in and out of trucks throughout the day?
            </label>
            <textarea
              name="physicalReadiness"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={formData.physicalReadiness}
              onChange={handleTextChange}
            />
            {errors.physicalReadiness && <p className="text-red-500 text-sm">{errors.physicalReadiness}</p>}
          </div>

          {/* Exam Willingness */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Are you willing to take and pass the MVC Instructor Exam if you haven&apos;t already?
            </label>
            <textarea
              name="examWillingness"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={formData.examWillingness}
              onChange={handleTextChange}
            />
            {errors.examWillingness && <p className="text-red-500 text-sm">{errors.examWillingness}</p>}
          </div>

          {/* Monitoring Progress */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              How do you track student progress and provide constructive feedback?
            </label>
            <textarea
              name="monitoringProgress"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={formData.monitoringProgress}
              onChange={handleTextChange}
            />
            {errors.monitoringProgress && <p className="text-red-500 text-sm">{errors.monitoringProgress}</p>}
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <h3 className="text-xl font-semibold text-gray-900">Required Documents</h3>
          
          {/* Driver's License */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Driver&apos;s License or CDL (Required)
            </label>
            <input
              type="file"
              name="driversLicense"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {errors.driversLicense && <p className="text-red-500 text-sm">{errors.driversLicense}</p>}
          </div>

          {/* Medical Card */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Medical Card (Required)
            </label>
            <input
              type="file"
              name="medicalCard"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {errors.medicalCard && <p className="text-red-500 text-sm">{errors.medicalCard}</p>}
          </div>

          {/* Driver's Abstract */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Driver&apos;s Abstract (Required)
            </label>
            <input
              type="file"
              name="driverAbstract"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {errors.driverAbstract && <p className="text-red-500 text-sm">{errors.driverAbstract}</p>}
          </div>

          {/* Instructor Certifications */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Instructor Certifications or Licenses (Optional)
            </label>
            <input
              type="file"
              name="instructorCertifications"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {errors.instructorCertifications && <p className="text-red-500 text-sm">{errors.instructorCertifications}</p>}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
} 