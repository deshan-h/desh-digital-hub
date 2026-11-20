# Cloudflare R2 Banner Upload & Workers AI Generator Guide

මෙම Cloudflare Worker එක මඟින් පහත ප්‍රධාන සේවාවන් 3ම නොමිලේ (Free Tier) ක්‍රියාත්මක වේ:
1. **R2 Image Storage**: Banners, Flyers සහ Service Images upload කිරීම (No Egress Fees).
2. **Workers AI (Llama 3.1 8B)**: Banner Copy, Service Category Descriptions සහ Sub-Services සිංහලෙන් හා ඉංග්‍රීසියෙන් AI මඟින් සාදාගැනීම.
3. **Workers AI Images (FLUX.1 Schnell / SDXL)**: සේවා ප්‍රවර්ග සඳහා 3D Isometric Cyber Tech පින්තූර Text-to-Image AI මඟින් සාදා කෙලින්ම R2 Bucket එකට Auto-Save වීම.

---

## 1. Cloudflare R2 Bucket එකක් සාදාගැනීම (1 Minute)
1. [Cloudflare Dashboard](https://dash.cloudflare.com/) වෙත යන්න.
2. වම් පැත්තේ Menu එකෙන් **R2 Object Storage** තෝරන්න.
3. **Create bucket** ක්ලික් කර නමක් දෙන්න: උදා: `desh-hub-banners`
4. Location එක **Automatic** තබා **Create Bucket** ක්ලික් කරන්න.
5. Bucket එකේ **Settings** -> **Public Access** -> **R2.dev Subdomain** වෙත ගොස් **Allow Access** ක්ලික් කර Public URL එක ගන්න (උදා: `https://pub-xxxxxxxxxxxxxx.r2.dev`).

---

## 2. Worker එක Deploy කිරීම (2 Minutes)
1. Cloudflare Dashboard එකේ වම් පැත්තේ **Workers & Pages** -> **Overview** වෙත යන්න.
2. **Create application** -> **Create Worker** ක්ලික් කරන්න.
3. Worker නම දෙන්න (උදා: `desh-banner-uploader`) -> **Deploy** ක්ලික් කරන්න.
4. **Edit code** ක්ලික් කර එහි ඇති කේතය මකා [banner-uploader.js](banner-uploader.js) හි ඇති සම්පූර්ණ කේතය Paste කර **Deploy** ක්ලික් කරන්න.

---

## 3. Worker එකට Bindings සම්බන්ධ කිරීම (ඉතා වැදගත්)
Worker එකේ **Settings** tab එක වෙත ගොස් **Variables and bindings** වෙත යන්න:

### A. Workers AI Binding එකතු කිරීම (Text & Image AI Features සඳහා):
1. **Workers AI** (හෝ **AI Bindings**) යටතේ **Add binding** ක්ලික් කරන්න.
2. Variable name එකට දෙන්න: `AI`
3. Save කරන්න.

### B. R2 Bucket Binding එකතු කිරීම (Image Storage සඳහා):
1. **R2 Bucket Bindings** යටතේ **Add binding** ක්ලික් කරන්න:
   - Variable name: `MY_BUCKET`
   - R2 bucket: `desh-hub-banners` තෝරන්න.

### C. Environment Variable (Public Image CDN URL):
1. **Environment Variables** යටතේ **Add variable** ක්ලික් කරන්න:
   - Variable name: `PUBLIC_URL`
   - Value: ඔබේ R2 bucket එකේ Public URL එක (උදා: `https://pub-xxxxxxxxxxxxxx.r2.dev`)

2. **Save and Deploy** ක්ලික් කරන්න.
3. Worker URL එක පිටපත් කරගන්න (උදා: `https://desh-banner-uploader.yourname.workers.dev`).

---

## 4. අපේ Project එකේ `.env` එකට එක්කිරීම
`.env` file එකට එක්කරන්න:
```env
VITE_CLOUDFLARE_UPLOAD_URL=https://desh-banner-uploader.yourname.workers.dev
VITE_CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxxx.r2.dev
```

*සටහන: Worker එකේ AI binding එක add කරන තෙක් පවා අපේ Web App එක තුළ ඇති Smart Offline AI Engine ක්‍රියාත්මක වන අතර Cloudflare Worker AI සම්බන්ධ වූ වහාම Cloudflare Meta Llama 3.1 සහ FLUX.1 AI මඟින් real-time generate වේ!*
