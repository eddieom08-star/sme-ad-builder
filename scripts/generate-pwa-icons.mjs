import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple blue icon with "AB" text (Ad Builder)
const createIconBuffer = async (size) => {
  // Create SVG with the icon design
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
      <text
        x="50%"
        y="50%"
        font-family="Arial, sans-serif"
        font-size="${size * 0.4}"
        font-weight="bold"
        fill="white"
        text-anchor="middle"
        dominant-baseline="central">
        AB
      </text>
    </svg>
  `;

  return Buffer.from(svg);
};

// Create icons directory
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generating PWA icons...\n');

// Generate all icon sizes
for (const size of sizes) {
  try {
    const svgBuffer = await createIconBuffer(size);
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated icon-${size}x${size}.png`);
  } catch (error) {
    console.error(`✗ Failed to generate icon-${size}x${size}.png:`, error.message);
  }
}

console.log('\n✅ All PWA icons generated successfully!');
