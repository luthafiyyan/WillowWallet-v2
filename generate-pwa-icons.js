import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const srcPath = path.resolve('public/logo.png');
const outputDir = path.resolve('public/icons');

// Create directory if not exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  console.log('Generating PWA icons from', srcPath);
  
  for (const size of sizes) {
    const filename = `icon-${size}x${size}.png`;
    const outputPath = path.join(outputDir, filename);
    await sharp(srcPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outputPath);
    console.log(`Generated ${filename}`);
  }

  // Generate Maskable Icon with safe margins
  const maskablePath = path.join(outputDir, 'maskable-icon.png');
  await sharp(srcPath)
    .resize(410, 410, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 18, g: 142, b: 100, alpha: 1 }
    })
    .png()
    .toFile(maskablePath);
  console.log('Generated maskable-icon.png');

  // Generate Monochrome Icon
  const monochromePath = path.join(outputDir, 'monochrome-icon.png');
  await sharp(srcPath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .grayscale()
    .png()
    .toFile(monochromePath);
  console.log('Generated monochrome-icon.png');

  // Generate favicon.svg embedding the logo
  const logoBuffer = fs.readFileSync(srcPath);
  const base64Logo = logoBuffer.toString('base64');
  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 137 136" width="100%" height="100%">
  <image href="data:image/png;base64,${base64Logo}" width="137" height="136" />
</svg>
`;
  fs.writeFileSync(path.resolve('public/favicon.svg'), faviconSvg);
  console.log('Generated favicon.svg');
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
