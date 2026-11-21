/**
 * High-Performance Client-Side Image Compressor & WebP Converter
 * Automatically resizes large camera/phone photos, converts to WebP format,
 * and significantly reduces file size before uploading to Cloudflare.
 */

/**
 * Compresses an image file and converts it to WebP format.
 * @param {File|Blob} file - The original image file
 * @param {Object} [options]
 * @param {number} [options.maxWidth=1600] - Max width in pixels
 * @param {number} [options.maxHeight=1600] - Max height in pixels
 * @param {number} [options.quality=0.82] - WebP quality (0.0 to 1.0)
 * @returns {Promise<{ file: File, originalSize: number, compressedSize: number, savingsPercent: string }>}
 */
export async function compressAndConvertToWebP(file, options = {}) {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82
  } = options;

  // If it's an SVG, skip raster compression
  if (file.type === 'image/svg+xml') {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      savingsPercent: '0%'
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file.'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Failed to parse image data.'));

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Draw onto offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas 2D context not available.'));
        }

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Determine target mime type - prefer webp
        const mimeType = 'image/webp';

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Failed to compress image onto canvas.'));
            }

            // Derive new filename with .webp extension
            const originalName = file.name || 'image';
            const baseName = originalName.replace(/\.[^/.]+$/, '');
            const newFileName = `${baseName}.webp`;

            const compressedFile = new File([blob], newFileName, {
              type: mimeType,
              lastModified: Date.now()
            });

            const originalSize = file.size;
            const compressedSize = compressedFile.size;
            const savings = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              savingsPercent: `${savings}%`
            });
          },
          mimeType,
          quality
        );
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}
