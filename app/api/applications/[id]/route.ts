import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { apiVersion } from '../../../../sanity/env';

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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;

    // Query Sanity for the user's application
    const query = `*[_type == "application" && userId == $userId][0]`;
    const application = await client.fetch(query, { userId });

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
} 