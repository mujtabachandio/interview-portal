export default {
  name: 'application',
  title: 'Instructor Application',
  type: 'document',
  fields: [
    {
      name: 'applicant',
      title: 'Applicant',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: Rule => Rule.required()
    },
    {
      name: 'status',
      title: 'Application Status',
      type: 'string',
      options: {
        list: [
          { title: 'Submitted', value: 'submitted' },
          { title: 'Under Review', value: 'reviewing' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' }
        ],
        layout: 'radio'
      },
      initialValue: 'submitted'
    },
    {
      name: 'motivation',
      title: 'Motivation for Becoming an Instructor',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required()
    },
    {
      name: 'trainingBackground',
      title: 'Training & Mentoring Background',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required()
    },
    {
      name: 'simplifyingConcepts',
      title: 'Simplifying Complex Concepts',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required()
    },
    {
      name: 'handlingChallenges',
      title: 'Handling Maneuver Challenges',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required()
    },
    {
      name: 'managingAnxiety',
      title: 'Managing Student Anxiety',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required()
    },
    {
      name: 'regulatoryKnowledge',
      title: 'Regulatory Knowledge',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required()
    },
    {
      name: 'physicalReadiness',
      title: 'Physical Readiness',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required()
    },
    {
      name: 'examWillingness',
      title: 'Exam Willingness',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required()
    },
    {
      name: 'monitoringProgress',
      title: 'Monitoring Student Progress',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.required()
    },
    {
      name: 'documents',
      title: 'Required Documents',
      type: 'object',
      fields: [
        {
          name: 'driversLicense',
          title: 'Driver\'s License or CDL',
          type: 'file',
          validation: Rule => Rule.required()
        },
        {
          name: 'medicalCard',
          title: 'Medical Card',
          type: 'file',
          validation: Rule => Rule.required()
        },
        {
          name: 'driverAbstract',
          title: 'Driver\'s Abstract',
          type: 'file',
          validation: Rule => Rule.required()
        },
        {
          name: 'instructorCertifications',
          title: 'Instructor Certifications',
          type: 'file'
        }
      ]
    },
    {
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    },
    {
      name: 'reviewedAt',
      title: 'Reviewed At',
      type: 'datetime'
    },
    {
      name: 'reviewerNotes',
      title: 'Reviewer Notes',
      type: 'text',
      rows: 4
    }
  ],
  preview: {
    select: {
      title: 'applicant.email',
      status: 'status',
      submittedAt: 'submittedAt'
    },
    prepare({ title, status, submittedAt }) {
      return {
        title: title || 'New Application',
        subtitle: `${status} - ${new Date(submittedAt).toLocaleDateString()}`
      }
    }
  }
} 