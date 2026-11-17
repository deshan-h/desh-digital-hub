/**
 * Cloudflare Worker: desh-banner-uploader
 * Handles image file uploads to Cloudflare R2 bucket with zero egress fees.
 * 
 * Free tier includes: 100,000 requests/day, 10GB R2 storage forever.
 */

export default {
  async fetch(request, env) {
    // 1. Handle CORS Preflight (OPTIONS request)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 2. Handle POST Upload
    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || typeof file === "string") {
          return new Response(
            JSON.stringify({ error: "No image file provided in form-data ('file')" }),
            { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
          );
        }

        // Generate clean unique filename
        const originalName = file.name || "banner.jpg";
        const ext = originalName.split(".").pop() || "jpg";
        const cleanName = `banner-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

        // Save file into Cloudflare R2 Bucket (bound as MY_BUCKET)
        await env.MY_BUCKET.put(cleanName, file.stream(), {
          httpMetadata: {
            contentType: file.type || "image/jpeg",
          },
        });

        // Construct Public CDN URL
        // If env.PUBLIC_URL is set (e.g. https://pub-xxxx.r2.dev or https://cdn.desh.lk), use it.
        const baseUrl = (env.PUBLIC_URL || "").replace(/\/$/, "");
        const fileUrl = baseUrl ? `${baseUrl}/${cleanName}` : cleanName;

        return new Response(
          JSON.stringify({
            success: true,
            url: fileUrl,
            name: cleanName,
            size: file.size,
            type: file.type
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message || "Failed to upload file to R2" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ message: "DESH Cloudflare R2 Upload Worker is Active" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  },
};
