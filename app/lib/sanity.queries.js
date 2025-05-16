import { client, uploadFile } from './sanity';

export async function createUser(userData) {
  const { email, name, firebaseUid } = userData;
  
  try {
    // First check if user already exists
    const existingUser = await client.fetch(
      `*[_type == "user" && (email == $email || firebaseUid == $firebaseUid)][0]`,
      { email, firebaseUid }
    );

    if (existingUser) {
      console.log('User already exists:', existingUser);
      return existingUser;
    }

    // Create new user
    const newUser = await client.create({
      _type: 'user',
      email,
      name,
      firebaseUid,
      role: 'applicant',
      createdAt: new Date().toISOString()
    });

    console.log('Created new user:', newUser);
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user account. Please try again.');
  }
}

export async function getUserByFirebaseUid(firebaseUid) {
  return client.fetch(
    `*[_type == "user" && firebaseUid == $firebaseUid][0]`,
    { firebaseUid }
  );
}

export async function createApplication(applicationData) {
  const { documents, userId, ...rest } = applicationData;
  
  try {
    // Verify user exists before creating application
    const user = await client.fetch(
      `*[_type == "user" && _id == $userId][0]`,
      { userId }
    );

    if (!user) {
      throw new Error('User not found. Please try submitting your application again.');
    }

    // Upload files to Sanity with retries
    const uploadedDocuments = {};
    for (const [key, file] of Object.entries(documents)) {
      if (file) {
        try {
          const asset = await uploadFile(file);
          uploadedDocuments[key] = {
            _type: 'file',
            asset: {
              _type: 'reference',
              _ref: asset._id
            }
          };
        } catch (error) {
          console.error(`Failed to upload ${key}:`, error);
          throw new Error(`Failed to upload ${key}. Please try again.`);
        }
      }
    }

    // Create the application
    const application = await client.create({
      _type: 'application',
      ...rest,
      documents: uploadedDocuments,
      applicant: {
        _type: 'reference',
        _ref: userId
      },
      status: 'submitted',
      submittedAt: new Date().toISOString()
    });

    console.log('Created application:', application);
    return application;
  } catch (error) {
    console.error('Error creating application:', error);
    throw new Error('Failed to submit application. Please try again.');
  }
}

export async function getApplicationByUserId(userId) {
  return client.fetch(`
    *[_type == "application" && applicant._ref == $userId][0] {
      _id,
      status,
      submittedAt,
      reviewedAt,
      reviewerNotes,
      motivation,
      trainingBackground,
      simplifyingConcepts,
      handlingChallenges,
      managingAnxiety,
      regulatoryKnowledge,
      physicalReadiness,
      examWillingness,
      monitoringProgress,
      "documents": {
        "driversLicense": documents.driversLicense.asset->url,
        "medicalCard": documents.medicalCard.asset->url,
        "driverAbstract": documents.driverAbstract.asset->url,
        "instructorCertifications": documents.instructorCertifications.asset->url
      },
      "applicant": applicant->{
        _id,
        name,
        email
      }
    }
  `, { userId });
}

export async function getAllApplications() {
  return client.fetch(`
    *[_type == "application"] | order(submittedAt desc) {
      _id,
      status,
      submittedAt,
      reviewedAt,
      reviewerNotes,
      motivation,
      trainingBackground,
      simplifyingConcepts,
      handlingChallenges,
      managingAnxiety,
      regulatoryKnowledge,
      physicalReadiness,
      examWillingness,
      monitoringProgress,
      documents,
      "applicant": applicant->{
        _id,
        name,
        email
      }
    }
  `);
}

export async function getApplicationById(applicationId) {
  return client.fetch(`
    *[_type == "application" && _id == $applicationId][0] {
      _id,
      status,
      submittedAt,
      reviewedAt,
      reviewerNotes,
      motivation,
      trainingBackground,
      simplifyingConcepts,
      handlingChallenges,
      managingAnxiety,
      regulatoryKnowledge,
      physicalReadiness,
      examWillingness,
      monitoringProgress,
      "documents": {
        "driversLicense": documents.driversLicense.asset->url,
        "medicalCard": documents.medicalCard.asset->url,
        "driverAbstract": documents.driverAbstract.asset->url,
        "instructorCertifications": documents.instructorCertifications.asset->url
      },
      "applicant": applicant->{
        _id,
        name,
        email
      }
    }
  `, { applicationId });
}

export async function updateApplicationStatus(applicationId, status, reviewerNotes = '') {
  return client
    .patch(applicationId)
    .set({
      status,
      reviewerNotes,
      reviewedAt: new Date().toISOString()
    })
    .commit();
}

export async function hasExistingApplication(userId) {
  const application = await client.fetch(
    `*[_type == "application" && applicant._ref == $userId][0]`,
    { userId }
  );
  return !!application;
} 