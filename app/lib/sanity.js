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

// Helper function to handle file uploads with retries
export const uploadFile = async (file, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const asset = await client.assets.upload('file', file, {
        filename: file.name,
        contentType: file.type,
      });
      return asset;
    } catch (error) {
      console.error(`File upload attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source); 