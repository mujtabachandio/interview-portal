export default {
  name: 'application',
  title: 'Job Application',
  type: 'document',
  fields: [
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
      description: 'Firebase Auth User ID'
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule: { required: () => any; }) => Rule.required()
    },
    // Experience and Background
    {
      name: 'experienceOverview',
      title: 'Experience Overview',
      type: 'text',
      description: 'Brief description of truck driving experience',
      validation: (Rule: { required: () => any; }) => Rule.required()
    },
    {
      name: 'teachingMotivation',
      title: 'Teaching Motivation',
      type: 'text',
      description: 'Motivation for becoming a driving instructor',
      validation: (Rule: { required: () => any; }) => Rule.required()
    },
    {
      name: 'trainingBackground',
      title: 'Training Background',
      type: 'text',
      description: 'Experience in training or mentoring others',
      validation: (Rule: { required: () => any; }) => Rule.required()
    },
    // Teaching Approach
    {
      name: 'complexConcepts',
      title: 'Complex Concepts',
      type: 'text',
      description: 'Approach to explaining complex topics',
      validation: (Rule: { required: () => any; }) => Rule.required()
    },
    {
      name: 'maneuverChallenges',
      title: 'Maneuver Challenges',
      type: 'text',
      description: 'Approach to handling difficult maneuvers',
      validation: (Rule: { required: () => any; }) => Rule.required()
    },
    {
      name: 'studentAnxiety',
      title: 'Student Anxiety',
      type: 'text',
      description: 'Approach to managing student anxiety',
      validation: (Rule: { required: () => any; }) => Rule.required()
    },
    // Knowledge and Readiness
    {
      name: 'regulatoryKnowledge',
      title: 'Regulatory Knowledge',
      type: 'text',
      description: 'Familiarity with DOT regulations',
      validation: (Rule: { required: () => any; }) => Rule.required()
    },
    {
      name: 'physicalReadiness',
      title: 'Physical Readiness',
      type: 'text',
      description: 'Comfort with physical demands of the job',
      validation: (Rule: { required: () => any; }) => Rule.required()
    },
    {
      name: 'examWillingness',
      title: 'Exam Willingness',
      type: 'text',
      description: 'Willingness to take MVC Instructor Exam',
      validation: (Rule: { required: () => any; }) => Rule.required()
    },
    {
      name: 'studentProgress',
      title: 'Student Progress',
      type: 'text',
      description: 'Approach to tracking student progress',
      validation: (Rule: { required: () => any; }) => Rule.required()
    },
    // Required Documents
    {
      name: 'driversLicense',
      title: 'Driver\'s License or CDL',
      type: 'file',
      description: 'Valid copy required',
      validation: (Rule: { required: () => any; }) => Rule.required()
    },
    {
      name: 'medicalCard',
      title: 'Medical Card',
      type: 'file',
      description: 'Current and valid medical certification',
      validation: (Rule: { required: () => any; }) => Rule.required()
    },
    {
      name: 'driversAbstract',
      title: 'Driver\'s Abstract',
      type: 'file',
      description: 'Recent motor vehicle report/abstract',
      validation: (Rule: { required: () => any; }) => Rule.required()
    },
    {
      name: 'instructorCertifications',
      title: 'Instructor Certifications or Licenses',
      type: 'file',
      description: 'If currently held – optional if not yet obtained'
    },
    // Application Status
    {
      name: 'status',
      title: 'Application Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Under Review', value: 'review' },
          { title: 'Shortlisted', value: 'shortlisted' },
          { title: 'Interview Scheduled', value: 'interview' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Accepted', value: 'accepted' }
        ]
      },
      initialValue: 'new'
    },
    {
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }
  ]
} 