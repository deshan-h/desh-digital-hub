/**
 * Cloudflare Worker: desh-hub-worker
 * Capabilities:
 * 1. Image file uploads to Cloudflare R2 bucket (MY_BUCKET) with zero egress fees.
 * 2. Banner & Service copy generation powered by Cloudflare Workers AI (@cf/meta/llama-3.1-8b-instruct).
 * 3. Text-to-Image AI generation (@cf/black-forest-labs/flux-1-schnell / SDXL-Lightning) auto-saved to R2.
 * 
 * Free tier includes:
 * - 100,000 requests/day
 * - 10GB R2 storage forever
 * - 10,000 Neurons/day free Workers AI
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export default {
  async fetch(request, env) {
    // 1. Handle CORS Preflight (OPTIONS request)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    const url = new URL(request.url);
    const contentType = request.headers.get("content-type") || "";

    // 2. Handle Text-to-Image AI Generation Endpoint (/ai-image-generate)
    if (
      request.method === "POST" &&
      (url.pathname === "/ai-image-generate" || url.pathname.endsWith("/image-generate"))
    ) {
      try {
        const body = await request.json().catch(() => ({}));
        const prompt = (body.prompt || body.categoryName || "").trim();

        if (!prompt) {
          return new Response(
            JSON.stringify({ error: "Please provide a 'prompt' or 'categoryName' for the image generation." }),
            { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }

        if (!env.AI) {
          return new Response(
            JSON.stringify({
              error: "Workers AI binding 'AI' is not configured on this Cloudflare Worker. Please bind 'AI' under Settings -> Variables & Bindings.",
              isAiBindingMissing: true
            }),
            { status: 501, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }

        const enhancedPrompt = `${prompt}, 3d isometric render, high resolution, futuristic clean tech laboratory, cyan and deep blue studio lighting, octane render, 8k, photorealistic graphic banner`;

        let aiImageResponse;
        try {
          aiImageResponse = await env.AI.run("@cf/black-forest-labs/flux-1-schnell", {
            prompt: enhancedPrompt,
            steps: 4,
          });
        } catch (e) {
          // Fallback to SDXL lightning
          aiImageResponse = await env.AI.run("@cf/bytedance/stable-diffusion-xl-lightning", {
            prompt: enhancedPrompt,
          });
        }

        let imageBuffer;
        if (aiImageResponse instanceof Uint8Array || aiImageResponse instanceof ArrayBuffer) {
          imageBuffer = aiImageResponse;
        } else if (aiImageResponse && typeof aiImageResponse === "object" && aiImageResponse.image) {
          const binaryString = atob(aiImageResponse.image);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          imageBuffer = bytes.buffer;
        } else if (aiImageResponse && typeof aiImageResponse.arrayBuffer === "function") {
          imageBuffer = await aiImageResponse.arrayBuffer();
        } else {
          imageBuffer = aiImageResponse;
        }

        const cleanName = `service-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.png`;

        if (env.MY_BUCKET) {
          await env.MY_BUCKET.put(cleanName, imageBuffer, {
            httpMetadata: { contentType: "image/png" },
          });

          const baseUrl = (env.PUBLIC_URL || "").replace(/\/$/, "");
          const fileUrl = baseUrl ? `${baseUrl}/${cleanName}` : cleanName;

          return new Response(
            JSON.stringify({
              success: true,
              url: fileUrl,
              name: cleanName,
              model: "@cf/black-forest-labs/flux-1-schnell"
            }),
            { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        } else {
          // If R2 is not bound, return data URI
          const uint8 = new Uint8Array(imageBuffer);
          let binary = "";
          for (let i = 0; i < uint8.byteLength; i++) {
            binary += String.fromCharCode(uint8[i]);
          }
          const base64 = btoa(binary);
          return new Response(
            JSON.stringify({
              success: true,
              url: `data:image/png;base64,${base64}`,
              name: cleanName,
              model: "@cf/black-forest-labs/flux-1-schnell"
            }),
            { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message || "Failed to generate AI image" }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
    }

    // 3. Handle Text AI Copy & Service Description Endpoint (/ai-generate)
    if (
      request.method === "POST" &&
      (url.pathname === "/ai-generate" || contentType.includes("application/json"))
    ) {
      try {
        const body = await request.json().catch(() => ({}));
        const prompt = (body.prompt || body.topic || body.title || "").trim();
        const style = body.style || "promotional";
        const badgeHint = body.badge || "";
        const language = (body.language || "sinhala").toLowerCase();
        const contextType = body.context || body.type || "banner"; // 'banner' | 'service'

        if (!prompt) {
          return new Response(
            JSON.stringify({ error: "Please provide a 'prompt' or 'title' for the AI generator." }),
            { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }

        if (!env.AI) {
          return new Response(
            JSON.stringify({
              error: "Workers AI binding 'AI' is not configured on this Cloudflare Worker. Please bind 'AI' under Settings -> Variables & Bindings.",
              isAiBindingMissing: true
            }),
            { status: 501, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }

        let langInstruction = "Write strictly in natural, professional, high-converting Sinhala (සිංහල භාෂාවෙන්) using proper Sinhala script and grammar for Sri Lankan customers. Keep tech brand names (e.g. SSD, NVMe, Windows, RAM, Laptop) as commonly known.";
        if (language === "english") {
          langInstruction = "Write strictly in clear, catchy, professional English.";
        } else if (language === "singlish") {
          langInstruction = "Write in conversational Sri Lankan Singlish (English alphabet with Sinhala words, e.g. 'Laptop Repairs & SSD upgrade walata loku discount').";
        }

        // A. Service Category & Sub-services Generation
        if (contextType === "service") {
          const serviceSystem = `You are an expert tech service coordinator for "DESH Digital Hub" in Sri Lanka.
Based on the service category title "${prompt}", generate:
1. A concise, professional 1-2 sentence overview description in the requested language.
2. A list of 4 to 6 relevant sub-services / service items that a modern tech shop would offer.
Language instruction: ${langInstruction}

Return strictly a valid JSON object matching:
{
  "description": "Short compelling 1-2 sentence overview description",
  "items": [
    "Sub-service 1",
    "Sub-service 2",
    "Sub-service 3",
    "Sub-service 4",
    "Sub-service 5"
  ]
}`;

          const aiResp = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
            messages: [
              { role: "system", content: serviceSystem },
              { role: "user", content: `Generate service description and sub-services for category: "${prompt}". Language: ${language}` }
            ],
            temperature: 0.7,
            max_tokens: 450
          });

          let cleaned = (aiResp?.response || "").trim();
          if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
          }

          let parsed;
          try {
            parsed = JSON.parse(cleaned);
          } catch {
            const match = cleaned.match(/\{[\s\S]*\}/);
            parsed = match ? JSON.parse(match[0]) : {
              description: cleaned.slice(0, 150),
              items: ["Full Diagnosis & Inspection", "Professional Servicing", "Genuine Part Replacement", "Warranty Assurance"]
            };
          }

          return new Response(
            JSON.stringify({
              success: true,
              data: {
                description: parsed.description || "",
                items: Array.isArray(parsed.items) ? parsed.items : []
              },
              model: "@cf/meta/llama-3.1-8b-instruct"
            }),
            { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }

        // B. Banner Copy Generation (Default)
        const bannerSystem = `You are a creative marketing copywriter for "DESH Digital Hub", a premier technology, laptop/PC repair, digital printing, and online services center in Sri Lanka.
Create catchy, high-converting banner copy based on the user's topic.
Style requested: ${style}.
Language instruction: ${langInstruction}
Available badges: PROMOTION, FEATURED, NEW SERVICE, SPECIAL OFFER, EDUCATIONAL.
Keep headline punchy (maximum 50 characters). Keep subtitle clear and enticing (maximum 120 characters).

You MUST respond strictly with a valid JSON object only (no markdown quotes, no explanation, no backticks).
JSON Schema:
{
  "title": "Punchy headline title in requested language",
  "subtitle": "Short enticing promotional subtitle or details in requested language",
  "badge": "PROMOTION",
  "linkText": "Call to action label (e.g. 'දැන්ම විමසන්න' / 'Book Repair' / 'වැඩි විස්තර')",
  "linkUrl": "#services"
}`;

        const aiResponse = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          messages: [
            { role: "system", content: bannerSystem },
            { role: "user", content: `Generate banner copy for: "${prompt}". Language: ${language}. ${badgeHint ? `Preferred badge: ${badgeHint}` : ""}` }
          ],
          temperature: 0.7,
          max_tokens: 350
        });

        let cleaned = (aiResponse?.response || "").trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
        }

        let parsed;
        try {
          parsed = JSON.parse(cleaned);
        } catch {
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            parsed = {
              title: prompt.slice(0, 45),
              subtitle: (aiResponse?.response || "").replace(/\n/g, " ").slice(0, 110),
              badge: "PROMOTION",
              linkText: "Learn More",
              linkUrl: "#services"
            };
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            data: {
              title: parsed.title || prompt,
              subtitle: parsed.subtitle || "",
              badge: parsed.badge || "PROMOTION",
              linkText: parsed.linkText || "Learn More",
              linkUrl: parsed.linkUrl || "#services",
            },
            model: "@cf/meta/llama-3.1-8b-instruct"
          }),
          { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message || "Failed to generate AI copy" }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
    }

    // 4. Handle POST Image Upload to Cloudflare R2
    if (request.method === "POST") {
      try {
        if (!env.MY_BUCKET) {
          return new Response(
            JSON.stringify({ error: "R2 bucket binding 'MY_BUCKET' is not configured on this worker." }),
            { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || typeof file === "string") {
          return new Response(
            JSON.stringify({ error: "No image file provided in form-data ('file')" }),
            { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
          );
        }

        const originalName = file.name || "banner.jpg";
        const ext = originalName.split(".").pop() || "jpg";
        const cleanName = `banner-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

        await env.MY_BUCKET.put(cleanName, file.stream(), {
          httpMetadata: {
            contentType: file.type || "image/jpeg",
          },
        });

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
          { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err.message || "Failed to upload file to R2" }),
          { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }
    }

    // 5. Default GET Info Check
    return new Response(
      JSON.stringify({
        message: "DESH Cloudflare Gateway Worker is Active",
        endpoints: [
          { route: "POST / (multipart/form-data)", desc: "Upload image flyer to R2 storage" },
          { route: "POST /ai-generate (application/json)", desc: "Generate marketing copy or service descriptions" },
          { route: "POST /ai-image-generate (application/json)", desc: "Generate 3D isometric images with FLUX.1 / SDXL" }
        ],
        aiModels: {
          text: "@cf/meta/llama-3.1-8b-instruct",
          image: "@cf/black-forest-labs/flux-1-schnell"
        },
        status: "online"
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  },
};
