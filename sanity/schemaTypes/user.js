export default {
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string'
    },
    {
      name: 'firebaseUid',
      title: 'Firebase UID',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Applicant', value: 'applicant' },
          { title: 'Instructor', value: 'instructor' },
          { title: 'Admin', value: 'admin' }
        ],
        layout: 'radio'
      },
      initialValue: 'applicant'
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
      role: 'role'
    },
    prepare({ title, subtitle, role }) {
      return {
        title: title || 'Unnamed User',
        subtitle: `${subtitle} (${role})`
      }
    }
  }
} 