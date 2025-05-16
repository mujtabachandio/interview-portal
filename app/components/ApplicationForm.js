'use client';
import { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { createApplication, getUserByFirebaseUid, createUser, hasExistingApplication } from '../lib/sanity.queries';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [userSetupError, setUserSetupError] = useState(null);
  const [hasApplication, setHasApplication] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const setupUser = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.error('No authenticated user found');
          setUserSetupError('Please sign in to submit an application');
          return;
        }

        console.log('Setting up user:', { email: user.email, uid: user.uid });
        
        // Check if user exists in Sanity
        let sanityUser = await getUserByFirebaseUid(user.uid);
        console.log('Existing Sanity user:', sanityUser);
        
        // If user doesn't exist, create them
        if (!sanityUser) {
          console.log('Creating new Sanity user');
          try {
            sanityUser = await createUser({
              email: user.email,
              name: user.displayName || user.email.split('@')[0],
              firebaseUid: user.uid
            });
            console.log('Created new Sanity user:', sanityUser);
          } catch (error) {
            console.error('Error creating Sanity user:', error);
            setUserSetupError('Failed to create user account. Please try again.');
            return;
          }
        }
        
        if (!sanityUser || !sanityUser._id) {
          console.error('Invalid Sanity user data:', sanityUser);
          setUserSetupError('Invalid user data. Please try again.');
          return;
        }

        // Check if user already has an application
        const existingApplication = await hasExistingApplication(sanityUser._id);
        if (existingApplication) {
          setHasApplication(true);
          setUserSetupError('You have already submitted an application. Please check your application status.');
          return;
        }

        setUserId(sanityUser._id);
        setUserSetupError(null);
      } catch (error) {
        console.error('Error in user setup:', error);
        setUserSetupError('An error occurred while setting up your account. Please try again.');
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

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      ['motivation', 'trainingBackground', 'simplifyingConcepts'].forEach(field => {
        if (!formData[field]) {
          newErrors[field] = 'This field is required';
        }
      });
    } else if (step === 2) {
      ['handlingChallenges', 'managingAnxiety', 'regulatoryKnowledge'].forEach(field => {
        if (!formData[field]) {
          newErrors[field] = 'This field is required';
        }
      });
    } else if (step === 3) {
      ['physicalReadiness', 'examWillingness', 'monitoringProgress'].forEach(field => {
        if (!formData[field]) {
          newErrors[field] = 'This field is required';
        }
      });
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextClick = () => {
    if (validateStep(currentStep)) {
      nextStep();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (userSetupError) {
      console.error('User setup error:', userSetupError);
      setErrors({ submit: userSetupError });
      return;
    }

    if (!userId) {
      console.error('No user ID available');
      setErrors({ submit: 'Please wait while we set up your account...' });
      return;
    }

    setIsSubmitting(true);
    
    // Validate document uploads
    const newErrors = {};
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
      console.log('Starting application submission process');
      console.log('User ID:', userId);
      console.log('Form data:', {
        ...formData,
        documents: Object.keys(formData.documents).reduce((acc, key) => ({
          ...acc,
          [key]: formData.documents[key] ? 'File present' : 'No file'
        }), {})
      });

      const application = await createApplication({
        ...formData,
        userId
      });
      
      console.log('Application created successfully:', application);
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

  // Function to render progress bar
  const renderProgressBar = () => {
    const steps = [
      { number: 1, name: "Motivation & Background" },
      { number: 2, name: "Teaching Approach" },
      { number: 3, name: "Professional Skills" },
      { number: 4, name: "Documents" },
    ];

    return (
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <div className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                currentStep >= step.number 
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.number}
              </div>
              <span className={`mt-2 text-xs font-medium hidden sm:block ${
                currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
              }`}>{step.name}</span>
            </div>
          ))}
        </div>
        <div className="relative h-2 bg-gray-200 rounded-full">
          <div 
            className="absolute top-0 left-0 h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Function to render a textarea with consistent styling
  const renderTextArea = (name, label, placeholder = "") => {
    return (
      <div className="mb-6">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <textarea
          id={name}
          name={name}
          rows="4"
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg bg-white shadow-sm transition duration-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 ${
            errors[name] ? 'border-red-300' : 'border-gray-300'
          }`}
          value={formData[name]}
          onChange={handleTextChange}
        />
        {errors[name] && (
          <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
        )}
      </div>
    );
  };

  // Function to render file input with consistent styling
  const renderFileInput = (name, label, required = false) => {
    return (
      <div className="mb-6">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className={`border-2 border-dashed rounded-lg py-6 px-4 bg-gray-50 text-center transition-all hover:bg-gray-100 ${
            errors[name] ? 'border-red-300' : 'border-gray-300'
        }`}>
          <input
            id={name}
            type="file"
            name={name}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          />
          <label htmlFor={name} className="cursor-pointer">
            <div className="mb-2">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M24 8v24m-12-12h24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="mt-2 block text-sm font-medium text-blue-600">
              {formData.documents[name] ? formData.documents[name].name : 'Select a file'}
            </span>
            <span className="mt-1 block text-xs text-gray-500">
              PDF, DOC, DOCX, JPG or PNG up to 10MB
            </span>
          </label>
        </div>
        {errors[name] && (
          <p className="mt-1 text-sm text-red-600">{errors[name]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Modal */}
        {showSuccess && (
          <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
            <div className={`bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all duration-500 ${isFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h3>
                <p className="text-md text-gray-600 mb-6">
                  Thank you for your application. We will review it and get back to you soon.
                </p>
                <div className="animate-pulse">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-600 mr-1"></span>
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-600 mr-1"></span>
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-600"></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Instructor Application
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Join our team of professional instructors and help shape the next generation of drivers.
          </p>
        </div>

        {hasApplication ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Already Submitted</h2>
            <p className="text-gray-600 mb-6">
              You have already submitted an application. Please check your application status or contact us if you need to make any changes.
            </p>
            <button
              onClick={() => router.push('/application-status')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
            >
              View Application Status
            </button>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            {renderProgressBar()}

            {/* Form Container */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mx-6 mt-6">
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Step 1: Motivation & Background */}
                {currentStep === 1 && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="flex items-center justify-center bg-blue-600 text-white rounded-full h-8 w-8 mr-3 text-sm">1</span>
                      Motivation & Teaching Background
                    </h2>
                    
                    {renderTextArea(
                      "motivation", 
                      "What motivates you to become a driving instructor, and what excites you about teaching new drivers?",
                      "Share your passion for teaching and driver education..."
                    )}
                    
                    {renderTextArea(
                      "trainingBackground", 
                      "Have you ever trained or mentored others? If so, how did you support their learning and growth?",
                      "Describe your previous experience in teaching or mentoring roles..."
                    )}
                    
                    {renderTextArea(
                      "simplifyingConcepts", 
                      "How would you explain a complex topic—like the air brake system—to someone with no prior truck experience?",
                      "Explain your approach to breaking down technical concepts..."
                    )}

                    <div className="flex justify-end mt-8">
                      <button
                        type="button"
                        onClick={handleNextClick}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md flex items-center"
                      >
                        Continue
                        <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Teaching Approach */}
                {currentStep === 2 && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="flex items-center justify-center bg-blue-600 text-white rounded-full h-8 w-8 mr-3 text-sm">2</span>
                      Teaching Approach
                    </h2>
                    
                    {renderTextArea(
                      "handlingChallenges", 
                      "What's your approach when a student is struggling with maneuvers like alley docking or parallel parking?",
                      "Describe your strategies for helping students overcome difficult maneuvers..."
                    )}
                    
                    {renderTextArea(
                      "managingAnxiety", 
                      "How do you help students who become frustrated or anxious during on-the-road training?",
                      "Share your techniques for managing student stress and anxiety..."
                    )}
                    
                    {renderTextArea(
                      "regulatoryKnowledge", 
                      "How familiar are you with DOT regulations, and how do you ensure your students understand and follow them?",
                      "Explain your knowledge of transportation regulations and how you'd teach them..."
                    )}

                    <div className="flex justify-between mt-8">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center"
                      >
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextClick}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md flex items-center"
                      >
                        Continue
                        <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Professional Skills */}
                {currentStep === 3 && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="flex items-center justify-center bg-blue-600 text-white rounded-full h-8 w-8 mr-3 text-sm">3</span>
                      Professional Skills
                    </h2>
                    
                    {renderTextArea(
                      "physicalReadiness", 
                      "Are you comfortable working outdoors in all weather conditions and climbing in and out of trucks throughout the day?",
                      "Describe your physical readiness for the demands of this role..."
                    )}
                    
                    {renderTextArea(
                      "examWillingness", 
                      "Are you willing to take and pass the MVC Instructor Exam if you haven't already?",
                      "Share your thoughts on certification requirements..."
                    )}
                    
                    {renderTextArea(
                      "monitoringProgress", 
                      "How do you track student progress and provide constructive feedback?",
                      "Explain your approach to assessment and feedback..."
                    )}

                    <div className="flex justify-between mt-8">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center"
                      >
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextClick}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md flex items-center"
                      >
                        Continue
                        <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Document Upload Section */}
                {currentStep === 4 && (
                  <div className="p-6 sm:p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="flex items-center justify-center bg-blue-600 text-white rounded-full h-8 w-8 mr-3 text-sm">4</span>
                      Required Documents
                    </h2>
                    
                    <p className="text-gray-600 mb-6">
                      Please upload the following documents to complete your application. All documents must be in PDF, DOC, DOCX, JPG, or PNG format.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        {renderFileInput("driversLicense", "Driver's License or CDL", true)}
                      </div>
                      <div>
                        {renderFileInput("medicalCard", "Medical Card", true)}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        {renderFileInput("driverAbstract", "Driver's Abstract", true)}
                      </div>
                      <div>
                        {renderFileInput("instructorCertifications", "Instructor Certifications (Optional)")}
                      </div>
                    </div>

                    <div className="flex justify-between mt-8">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 flex items-center"
                      >
                        <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            Submit Application
                            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>All information submitted will be kept confidential and used only for application processing.</p>
          <p className="mt-2">Questions? Contact our recruitment team at <span className="text-blue-600">instructors@drivingschool.com</span></p>
        </div>
      </div>
    </div>
  );
}