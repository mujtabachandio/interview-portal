import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url';

// Sanity configuration
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-13'
const token = process.env.NEXT_PUBLIC_SANITY_TOKEN

// // Debug environment variables
// console.log('Sanity Config:', {
//   projectId,
//   dataset,
//   apiVersion,
//   hasToken: !!token
// })

// Create a client with authentication
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false for mutations and file uploads
  token,
  ignoreBrowserTokenWarning: true,
  perspective: 'published',
  stega: {
    enabled: false,
  },
})

// Create a preview client for draft content
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token,
  perspective: 'previewDrafts',
  stega: {
    enabled: false,
  },
})

// Helper function to get the appropriate client
export const getClient = (preview = false) => (preview ? previewClient : client)

// Helper function to handle file uploads with optimized retries
export const uploadFile = async (file, retries = 2) => {
  // Validate file size before upload (10MB limit)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds 10MB limit. Please compress or resize the file.`);
  }

  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const asset = await client.assets.upload('file', file, {
        filename: file.name,
        contentType: file.type,
      });
      return asset;
    } catch (error) {
      lastError = error;
      console.error(`File upload attempt ${i + 1} failed:`, error);
      if (i === retries - 1) break;
      // Exponential backoff: 500ms, 1000ms
      await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, i)));
    }
  }
  throw lastError;
};

const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source); 