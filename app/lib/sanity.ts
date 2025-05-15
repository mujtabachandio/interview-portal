import { createClient, SanityDocumentStub } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../../sanity/env';

if (!projectId) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID');
}

if (!dataset) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SANITY_DATASET');
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

export async function uploadFileToSanity(file: File) {
  try {
    console.log('Uploading file:', file.name);
    console.log('Using Sanity config:', {
      projectId,
      dataset,
      hasToken: !!process.env.SANITY_API_WRITE_TOKEN
    });

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `https://${projectId}.api.sanity.io/v2021-06-07/assets/files/${dataset}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SANITY_API_WRITE_TOKEN}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sanity API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to upload file to Sanity: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('File uploaded successfully:', data);
    return {
      _type: 'file',
      asset: {
        _type: 'reference',
        _ref: data.document._id,
      },
    };
  } catch (error) {
    console.error('Error uploading file to Sanity:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

export async function createApplicationInSanity(applicationData: SanityDocumentStub<Record<string, unknown>>) {
  try {
    console.log('Creating application with data:', applicationData);
    console.log('Using Sanity client config:', {
      projectId,
      dataset,
      apiVersion,
      hasToken: !!process.env.SANITY_API_WRITE_TOKEN
    });
    const result = await client.create({
      ...applicationData,
      _type: 'application', // Moved after spread to avoid being overwritten
      submittedAt: new Date().toISOString(),
    });

    console.log('Application created successfully:', result);
    return result;
  } catch (error) {
    console.error('Error creating application in Sanity:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

export async function getApplications() {
  try {
    const query = `*[_type == "application"] | order(submittedAt desc) {
      _id,
      userId,
      email,
      experienceOverview,
      teachingMotivation,
      trainingBackground,
      complexConcepts,
      maneuverChallenges,
      studentAnxiety,
      regulatoryKnowledge,
      physicalReadiness,
      examWillingness,
      studentProgress,
      driversLicense,
      medicalCard,
      driversAbstract,
      instructorCertifications,
      status,
      submittedAt
    }`;

    return await client.fetch(query);
  } catch (error) {
    console.error('Error fetching applications from Sanity:', error);
    throw error;
  }
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  try {
    const result = await client
      .patch(applicationId)
      .set({ status })
      .commit();

    return result;
  } catch (error) {
    console.error('Error updating application status in Sanity:', error);
    throw error;
  }
} 