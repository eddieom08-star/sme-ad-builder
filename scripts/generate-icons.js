const fs = require('fs');
const path = require('path');

// Simple SVG-based icon generator
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const generateSVGIcon = (size) => {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="#2563eb" rx="${size * 0.15}"/>

  <!-- Icon Shape - "A" for Ad Builder -->
  <g transform="translate(${size * 0.2}, ${size * 0.25})">
    <path d="M ${size * 0.3} 0 L ${size * 0.6} ${size * 0.5} L ${size * 0.45} ${size * 0.5} L ${size * 0.375} ${size * 0.35} L ${size * 0.225} ${size * 0.35} L ${size * 0.15} ${size * 0.5} L 0 ${size * 0.5} Z"
          fill="white" stroke="white" stroke-width="${size * 0.01}"/>
    <rect x="${size * 0.24}" y="${size * 0.23}" width="${size * 0.12}" height="${size * 0.04}" fill="#2563eb"/>
  </g>
</svg>`;
  return svg;
};

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating PWA icons...\n');

sizes.forEach(size => {
  const svg = generateSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, svg);
  console.log(`✓ Generated ${filename}`);
});

console.log('\n✅ All icons generated successfully!');
console.log('\nNote: These are SVG placeholders. For production, convert to PNG using:');
console.log('  npm install -g svgexport');
console.log('  svgexport icon.svg icon.png');
