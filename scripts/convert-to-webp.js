import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const dirs = [
  path.resolve('public/images'),
  path.resolve('public/images/services')
];

async function convertImages() {
  let totalBefore = 0;
  let totalAfter = 0;

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);

    for (const file of files) {
      if (file.match(/\.(jpg|jpeg|png)$/i) && !file.endsWith('.webp')) {
        const inputPath = path.join(dir, file);
        const ext = path.extname(file);
        const baseName = path.basename(file, ext);
        const outputPath = path.join(dir, `${baseName}.webp`);

        const statBefore = fs.statSync(inputPath);
        totalBefore += statBefore.size;

        await sharp(inputPath)
          .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 82, effort: 4 })
          .toFile(outputPath);

        const statAfter = fs.statSync(outputPath);
        totalAfter += statAfter.size;

        const savings = (((statBefore.size - statAfter.size) / statBefore.size) * 100).toFixed(1);
        console.log(`Converted: ${file} (${(statBefore.size / 1024).toFixed(0)} KB) -> ${baseName}.webp (${(statAfter.size / 1024).toFixed(0)} KB) [-${savings}%]`);
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`Total Before: ${(totalBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total After:  ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Overall Savings: -${(((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1)}%`);
  console.log(`========================================\n`);
}

convertImages().catch(console.error);
