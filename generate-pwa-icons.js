import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/favicon.svg');
const outputDir = path.resolve('public/icons');

// Create directory if not exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log('Generating PWA icons from', svgPath);
  
  for (const size of sizes) {
    const filename = `icon-${size}x${size}.png`;
    const outputPath = path.join(outputDir, filename);
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated ${filename}`);
  }

  // Generate Maskable Icon (same as 512x512 or with safe margins)
  const maskablePath = path.join(outputDir, 'maskable-icon.png');
  await sharp(svgPath)
    .resize(512, 512)
    .png()
    .toFile(maskablePath);
  console.log('Generated maskable-icon.png');

  // Generate Monochrome Icon
  const monochromePath = path.join(outputDir, 'monochrome-icon.png');
  await sharp(svgPath)
    .resize(512, 512)
    .grayscale()
    .png()
    .toFile(monochromePath);
  console.log('Generated monochrome-icon.png');
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
