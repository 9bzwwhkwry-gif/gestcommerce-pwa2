#!/usr/bin/env node
// Script to generate PWA icons
// Run: node generate-icons.mjs

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  const padding = size * 0.1;
  const radius = size * 0.22;
  
  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, size, size);
  
  // Rounded square
  ctx.beginPath();
  ctx.moveTo(padding + radius, padding);
  ctx.lineTo(size - padding - radius, padding);
  ctx.quadraticCurveTo(size - padding, padding, size - padding, padding + radius);
  ctx.lineTo(size - padding, size - padding - radius);
  ctx.quadraticCurveTo(size - padding, size - padding, size - padding - radius, size - padding);
  ctx.lineTo(padding + radius, size - padding);
  ctx.quadraticCurveTo(padding, size - padding, padding, size - padding - radius);
  ctx.lineTo(padding, padding + radius);
  ctx.quadraticCurveTo(padding, padding, padding + radius, padding);
  ctx.closePath();
  
  // Green gradient background
  const gradient = ctx.createLinearGradient(padding, padding, size - padding, size - padding);
  gradient.addColorStop(0, '#16a34a');
  gradient.addColorStop(1, '#059669');
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Shopping cart icon (simplified)
  const iconSize = size * 0.45;
  const iconX = (size - iconSize) / 2;
  const iconY = (size - iconSize) / 2;
  
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = size * 0.06;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Cart body
  const cartW = iconSize * 0.7;
  const cartH = iconSize * 0.45;
  const cartX = iconX + iconSize * 0.15;
  const cartY = iconY + iconSize * 0.25;
  
  ctx.beginPath();
  ctx.moveTo(iconX, iconY + iconSize * 0.05);
  ctx.lineTo(iconX + iconSize * 0.18, iconY + iconSize * 0.05);
  ctx.lineTo(cartX, cartY + cartH);
  ctx.lineTo(cartX + cartW, cartY + cartH);
  ctx.lineTo(cartX + cartW * 1.1, cartY);
  ctx.lineTo(iconX + iconSize * 0.18, cartY);
  ctx.stroke();
  
  // Wheels
  const wheelRadius = size * 0.045;
  ctx.beginPath();
  ctx.arc(cartX + cartW * 0.25, cartY + cartH + wheelRadius * 1.5, wheelRadius, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(cartX + cartW * 0.8, cartY + cartH + wheelRadius * 1.5, wheelRadius, 0, Math.PI * 2);
  ctx.fill();
  
  return canvas.toBuffer('image/png');
}

try {
  const iconsDir = join(__dirname, 'public', 'icons');
  mkdirSync(iconsDir, { recursive: true });
  
  for (const size of sizes) {
    const buffer = generateIcon(size);
    const filename = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
    writeFileSync(join(iconsDir, filename), buffer);
    console.log(`Generated ${filename}`);
  }
  
  // Also generate apple touch icon
  const appleBuffer = generateIcon(180);
  writeFileSync(join(iconsDir, 'apple-touch-icon.png'), appleBuffer);
  console.log('Generated apple-touch-icon.png');
  
  console.log('\n✅ All icons generated successfully!');
} catch (err) {
  console.error('Error generating icons:', err.message);
  console.log('\nFalling back to SVG-based icons...');
  process.exit(1);
}
