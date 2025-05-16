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

    const timestamp = new Date().toISOString();

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
      submittedAt: timestamp,
      statusHistory: [{
        _type: 'object',
        status: 'submitted',
        notes: 'Application submitted',
        timestamp
      }]
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
      statusHistory,
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
      statusHistory,
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
      statusHistory,
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
  const timestamp = new Date().toISOString();
  
  // First, get the current application to check if statusHistory exists
  const currentApplication = await client.fetch(
    `*[_type == "application" && _id == $applicationId][0]`,
    { applicationId }
  );

  const statusHistoryEntry = {
    _type: 'object',
    status,
    notes: reviewerNotes,
    timestamp
  };

  // If statusHistory doesn't exist, create it with the new entry
  if (!currentApplication.statusHistory) {
    return client
      .patch(applicationId)
      .set({
        status,
        reviewerNotes,
        reviewedAt: timestamp,
        statusHistory: [statusHistoryEntry]
      })
      .commit();
  }

  // Otherwise, append to existing statusHistory
  return client
    .patch(applicationId)
    .set({
      status,
      reviewerNotes,
      reviewedAt: timestamp
    })
    .insert('after', 'statusHistory[-1]', [statusHistoryEntry])
    .commit();
}

export async function hasExistingApplication(userId) {
  const application = await client.fetch(
    `*[_type == "application" && applicant._ref == $userId][0]`,
    { userId }
  );
  return !!application;
}

export async function deleteStatusUpdate(applicationId, statusIndex) {
  try {
    // First get the current application to verify the status history exists
    const currentApplication = await client.fetch(
      `*[_type == "application" && _id == $applicationId][0]`,
      { applicationId }
    );

    if (!currentApplication || !currentApplication.statusHistory) {
      throw new Error('Application or status history not found');
    }

    // Create a new status history array without the deleted entry
    const updatedStatusHistory = currentApplication.statusHistory.filter((_, index) => index !== statusIndex);

    // If this was the last status update, we need to update the current status
    let currentStatus = currentApplication.status;
    if (statusIndex === currentApplication.statusHistory.length - 1 && updatedStatusHistory.length > 0) {
      // Set the current status to the most recent status in the history
      currentStatus = updatedStatusHistory[updatedStatusHistory.length - 1].status;
    }

    // Update the application with the new status history
    const updatedApplication = await client
      .patch(applicationId)
      .set({
        statusHistory: updatedStatusHistory,
        status: currentStatus
      })
      .commit();

    return updatedApplication;
  } catch (error) {
    console.error('Error in deleteStatusUpdate:', error);
    throw error;
  }
} 