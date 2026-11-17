# Cloudflare R2 Banner Upload Worker Guide

## 1. Cloudflare R2 Bucket එකක් සාදාගැනීම (1 Minute)
1. [Cloudflare Dashboard](https://dash.cloudflare.com/) වෙත යන්න.
2. වම් පැත්තේ Menu එකෙන් **R2 Object Storage** තෝරන්න.
3. **Create bucket** ක්ලික් කර නමක් දෙන්න: උදා: `desh-hub-banners`
4. Location එක **Automatic** තබා **Create Bucket** ක්ලික් කරන්න.

## 2. Public URL Access ලබාදීම
1. සෑදූ bucket එක තුළ **Settings** tab එකට යන්න.
2. **Public Access** කොටසට පහළට scroll කරන්න:
   - **R2.dev Subdomain**: **Allow Access** ක්ලික් කර Allow කරන්න.
   - එවිට ඔබට Public URL එකක් ලැබේ (උදා: `https://pub-xxxxxxxxxxxxxx.r2.dev`).
   - *(විකල්ප: ඔබට Cloudflare හි domain එකක් ඇත්නම් Custom Domain ලෙස `cdn.yourdomain.com` සම්බන්ධ කළ හැකිය).*

## 3. Worker එක Deploy කිරීම (2 Minutes)
1. Cloudflare Dashboard එකේ වම් පැත්තේ **Workers & Pages** -> **Overview** වෙත යන්න.
2. **Create application** -> **Create Worker** ක්ලික් කරන්න.
3. Worker නම දෙන්න (උදා: `desh-banner-uploader`) -> **Deploy** ක්ලික් කරන්න.
4. **Edit code** ක්ලික් කර එහි ඇති කේතය මකා [banner-uploader.js](file:///c:/Users/desha/Documents/SE/My_Projects/desh-digital-hub/cloudflare-worker/banner-uploader.js) හි ඇති සම්පූර්ණ කේතය Paste කර **Deploy** ක්ලික් කරන්න.

### Worker Settings සකස් කිරීම:
1. Worker එකේ **Settings** tab එකට යන්න.
2. **Variables and bindings** වෙත යන්න:
   - **R2 Bucket Bindings** යටතේ **Add binding** ක්ලික් කරන්න:
     - Variable name: `MY_BUCKET`
     - R2 bucket: ඔබ සෑදූ bucket එක (`desh-hub-banners`) තෝරන්න.
   - **Environment Variables** යටතේ **Add variable** ක්ලික් කරන්න:
     - Variable name: `PUBLIC_URL`
     - Value: ඔබේ bucket එකේ Public URL එක (උදා: `https://pub-xxxxxxxxxxxxxx.r2.dev`)
3. **Save and Deploy** ක්ලික් කරන්න.
4. ඔබේ Worker URL එක පිටපත් කරගන්න (උදා: `https://desh-banner-uploader.yourname.workers.dev`).

## 4. අපේ Project එකේ .env එකට එක්කිරීම
`.env` file එකට එක්කරන්න:
```env
VITE_CLOUDFLARE_UPLOAD_URL=https://desh-banner-uploader.yourname.workers.dev
VITE_CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxxxxxxxxxxx.r2.dev
```

*සටහන: Worker එක set up කරන තුරු වුවද Admin Settings හි **"Paste URL"** විකල්පය මඟින් ඕනෑම Image Link එකක් (Cloudflare R2 Dashboard එකට කෙලින්ම upload කර copy කරගත් link එකක් හෝ වෙනත් image URL එකක්) කෙලින්ම Carousel එකට එකතු කළ හැකිය!*
