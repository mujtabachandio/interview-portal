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
  useCdn: true, // Set to false if statically generating pages, using ISR or tag-based revalidation
  token, // Add your Sanity API token here
  ignoreBrowserTokenWarning: true, // Ignore token warning in development
  perspective: 'published', // Use 'published' for production, 'previewDrafts' for draft content
  stega: {
    enabled: false, // Disable stega for better performance
  },
})

// Create a preview client for draft content
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Always fetch fresh data
  token,
  perspective: 'previewDrafts',
  stega: {
    enabled: false,
  },
})

// Helper function to get the appropriate client
export const getClient = (preview = false) => (preview ? previewClient : client)

const builder = imageUrlBuilder(client);

export const urlFor = (source) => builder.image(source); 