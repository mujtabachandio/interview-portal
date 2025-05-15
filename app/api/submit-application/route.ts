import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { apiVersion } from '../../../sanity/env';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const token = process.env.SANITY_API_WRITE_TOKEN!;

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
});

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log('Received application data:', {
      ...body,
      files: {
        driversLicense: !!body.driversLicense,
        medicalCard: !!body.medicalCard,
        driversAbstract: !!body.driversAbstract,
        instructorCertifications: !!body.instructorCertifications,
      },
    });

    const requiredFields = [
      'userId',
      'email',
      'experienceOverview',
      'teachingMotivation',
      'trainingBackground',
      'complexConcepts',
      'maneuverChallenges',
      'studentAnxiety',
      'regulatoryKnowledge',
      'physicalReadiness',
      'examWillingness',
      'studentProgress',
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const requiredFiles = ['driversLicense', 'medicalCard', 'driversAbstract'];
    const missingFiles = requiredFiles.filter(file => !body[file]);
    if (missingFiles.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required files: ${missingFiles.join(', ')}` },
        { status: 400 }
      );
    }

    const application = await client.create({
      _type: 'application',
      ...body,
      submittedAt: new Date().toISOString(),
      status: 'new',
    });

    return NextResponse.json({ success: true, data: application });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
} 