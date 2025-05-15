import { NextResponse } from 'next/server';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const token = process.env.SANITY_API_WRITE_TOKEN!;

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const uploadRes = await fetch(
      `https://${projectId}.api.sanity.io/v2021-06-07/assets/files/${dataset}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: (() => {
          const uploadForm = new FormData();
          uploadForm.append('file', file);
          return uploadForm;
        })(),
      }
    );

    if (!uploadRes.ok) {
      const error = await uploadRes.text();
      throw new Error(`Sanity file upload failed: ${uploadRes.statusText} - ${error}`);
    }

    const data = await uploadRes.json();

    return NextResponse.json({
      success: true,
      fileRef: {
        _type: 'file',
        asset: {
          _type: 'reference',
          _ref: data.document._id,
        },
      },
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
