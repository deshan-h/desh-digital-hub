import { compressAndConvertToWebP } from '../utils/imageCompressor';

/**
 * Cloudflare R2 Upload Service
 * Handles uploading graphic banners/wallpapers to Cloudflare R2 bucket.
 */

const UPLOAD_ENDPOINT = import.meta.env.VITE_CLOUDFLARE_UPLOAD_URL;

/**
 * Upload an image file to Cloudflare R2 via Cloudflare Worker Gateway.
 * Automatically converts and compresses the image to high-efficiency WebP format.
 * @param {File} file - Image file from file input or drag-and-drop
 * @param {Function} [onProgress] - Optional progress callback
 * @param {Object} [options] - Optional compression options
 * @returns {Promise<{ url: string, name: string }>}
 */
export async function uploadToCloudflare(file, onProgress, options = {}) {
  if (!file) {
    throw new Error('Please select an image file to upload.');
  }

  // Basic validation
  if (!file.type.startsWith('image/')) {
    throw new Error('Selected file must be an image (PNG, JPG, WebP, GIF, SVG).');
  }

  if (!UPLOAD_ENDPOINT) {
    throw new Error(
      'Cloudflare Upload URL is not configured. Please set VITE_CLOUDFLARE_UPLOAD_URL in your .env or paste the image URL directly.'
    );
  }

  // Automatically convert & compress to WebP format before uploading
  let fileToUpload = file;
  try {
    const compressionResult = await compressAndConvertToWebP(file, {
      maxWidth: options.maxWidth || 1600,
      maxHeight: options.maxHeight || 1600,
      quality: options.quality || 0.82
    });
    fileToUpload = compressionResult.file;
    if (import.meta.env.DEV) {
      console.log(
        `[Cloudflare Storage] Compressed & converted to WebP: ${file.name} (${(compressionResult.originalSize / 1024).toFixed(0)} KB) -> ${fileToUpload.name} (${(compressionResult.compressedSize / 1024).toFixed(0)} KB) [Saved ${compressionResult.savingsPercent}]`
      );
    }
  } catch (compErr) {
    console.warn('[Cloudflare Storage] Client compression failed or skipped, uploading original file:', compErr);
    fileToUpload = file;
  }

  // 10MB file limit check on compressed output
  if (fileToUpload.size > 10 * 1024 * 1024) {
    throw new Error('Image size exceeds 10MB limit. Please choose a smaller image.');
  }

  const formData = new FormData();
  formData.append('file', fileToUpload);

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
      name: data.name || fileToUpload.name,
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

export { compressAndConvertToWebP } from '../utils/imageCompressor';
