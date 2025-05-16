import { client } from './sanity';

export async function createUser(userData) {
  const { email, name, firebaseUid } = userData;
  
  return client.create({
    _type: 'user',
    email,
    name,
    firebaseUid,
    role: 'applicant'
  });
}

export async function getUserByFirebaseUid(firebaseUid) {
  return client.fetch(
    `*[_type == "user" && firebaseUid == $firebaseUid][0]`,
    { firebaseUid }
  );
}

export async function createApplication(applicationData) {
  const { documents, userId, ...rest } = applicationData;
  
  // Upload files to Sanity
  const uploadedDocuments = {};
  for (const [key, file] of Object.entries(documents)) {
    if (file) {
      const asset = await client.assets.upload('file', file);
      uploadedDocuments[key] = {
        _type: 'file',
        asset: {
          _type: 'reference',
          _ref: asset._id
        }
      };
    }
  }

  return client.create({
    _type: 'application',
    ...rest,
    documents: uploadedDocuments,
    user: {
      _type: 'reference',
      _ref: userId
    },
    status: 'submitted',
    submittedAt: new Date().toISOString()
  });
}

export async function getApplicationByUserId(userId) {
  return client.fetch(`
    *[_type == "application" && user._ref == $userId][0] {
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
      "user": user->{
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
      "user": user->{
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
      "user": user->{
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