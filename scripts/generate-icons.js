const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgTemplate = `<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F5D76E"/>
      <stop offset="100%" style="stop-color:#D4AF37"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="102" fill="#0A0A0A"/>
  <rect x="20" y="20" width="472" height="472" rx="90" fill="url(#gold)"/>
  <path d="M256 100 L320 180 L256 260 L192 180 Z" fill="#0A0A0A"/>
  <path d="M256 280 L320 360 L256 440 L192 360 Z" fill="#0A0A0A"/>
  <circle cx="256" cy="180" r="30" fill="#0A0A0A"/>
  <circle cx="256" cy="360" r="30" fill="#0A0A0A"/>
  <line x1="256" y1="210" x2="256" y2="330" stroke="#0A0A0A" stroke-width="12"/>
  <circle cx="256" cy="256" r="40" fill="#0A0A0A"/>
</svg>`;

const iconsDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
  const svg = svgTemplate.replace(/512/g, size.toString());
  const filename = `icon-${size}x${size}.svg`;
  fs.writeFileSync(path.join(iconsDir, filename), svg);
  console.log(`Created ${filename}`);
});

console.log('SVG icons created. For PNG icons, convert SVGs at: https://cloudconvert.com/svg-to-png');
