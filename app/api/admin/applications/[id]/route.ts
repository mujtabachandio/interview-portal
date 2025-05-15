import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-19',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const application = await client.fetch(`
      *[_type == "application" && _id == $id][0] {
        _id,
        userId,
        email,
        status,
        submittedAt,
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
        instructorCertifications
      }
    `, { id: params.id });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const updatedApplication = await client
      .patch(params.id)
      .set({ status })
      .commit();

    return NextResponse.json({ application: updatedApplication });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
} 