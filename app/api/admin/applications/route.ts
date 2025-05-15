import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { isAdmin } from '../../../lib/auth';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-19',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Get the user's email from the request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract email from the auth header
    const email = authHeader.split(' ')[1];
    if (!email || !isAdmin(email)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const applications = await client.fetch(`
      *[_type == "application"] | order(submittedAt desc) {
        _id,
        userId,
        email,
        status,
        submittedAt,
        experienceOverview,
        teachingMotivation,
        trainingBackground
      }
    `);

    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
} 