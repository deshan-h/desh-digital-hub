/**
 * Cloudflare R2 Upload Service
 * Handles uploading graphic banners/wallpapers to Cloudflare R2 bucket.
 */

const UPLOAD_ENDPOINT = import.meta.env.VITE_CLOUDFLARE_UPLOAD_URL;
const PUBLIC_R2_URL = import.meta.env.VITE_CLOUDFLARE_R2_PUBLIC_URL;

/**
 * Upload an image file to Cloudflare R2 via Cloudflare Worker Gateway
 * @param {File} file - Image file from file input or drag-and-drop
 * @param {Function} [onProgress] - Optional progress callback
 * @returns {Promise<{ url: string, name: string }>}
 */
export async function uploadToCloudflare(file, onProgress) {
  if (!file) {
    throw new Error('Please select an image file to upload.');
  }

  // Basic validation
  if (!file.type.startsWith('image/')) {
    throw new Error('Selected file must be an image (PNG, JPG, WebP, GIF, SVG).');
  }

  // 10MB file limit
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Image size exceeds 10MB limit. Please compress or choose a smaller image.');
  }

  if (!UPLOAD_ENDPOINT) {
    throw new Error(
      'Cloudflare Upload URL is not configured. Please set VITE_CLOUDFLARE_UPLOAD_URL in your .env or paste the image URL directly.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(UPLOAD_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Upload failed (${response.status}): ${errText || response.statusText}`);
    }

    const data = await response.json();
    if (!data.url) {
      throw new Error('Cloudflare did not return an image URL.');
    }

    return {
      url: data.url,
      name: data.name || file.name,
    };
  } catch (error) {
    console.error('Cloudflare R2 upload error:', error);
    throw error;
  }
}

/**
 * Helper to check if Cloudflare worker upload endpoint is configured
 */
export function isCloudflareUploadConfigured() {
  return Boolean(UPLOAD_ENDPOINT && UPLOAD_ENDPOINT.trim().length > 0);
}
