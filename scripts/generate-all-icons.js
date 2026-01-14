#!/usr/bin/env node

/**
 * Complete Icon Generator Script for Doggy
 * Generates all icon sizes for all platforms from the SVG logo
 * 
 * Usage: node scripts/generate-all-icons.js
 * Requires: sharp, png-to-ico (npm install sharp png-to-ico)
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ICONS_DIR = join(__dirname, '../src-tauri/icons');
const SVG_PATH = join(ICONS_DIR, 'doggy-logo.svg');

// Standard Tauri icons
const STANDARD_ICONS = [
  { size: 32, name: '32x32.png' },
  { size: 64, name: '64x64.png' },
  { size: 128, name: '128x128.png' },
  { size: 256, name: '128x128@2x.png' },
  { size: 512, name: 'icon.png' },
];

// Windows Square logos
const WINDOWS_ICONS = [
  { size: 30, name: 'Square30x30Logo.png' },
  { size: 44, name: 'Square44x44Logo.png' },
  { size: 71, name: 'Square71x71Logo.png' },
  { size: 89, name: 'Square89x89Logo.png' },
  { size: 107, name: 'Square107x107Logo.png' },
  { size: 142, name: 'Square142x142Logo.png' },
  { size: 150, name: 'Square150x150Logo.png' },
  { size: 284, name: 'Square284x284Logo.png' },
  { size: 310, name: 'Square310x310Logo.png' },
  { size: 50, name: 'StoreLogo.png' },
];

// iOS icons
const IOS_ICONS = [
  { size: 20, name: 'AppIcon-20x20@1x.png' },
  { size: 40, name: 'AppIcon-20x20@2x.png' },
  { size: 40, name: 'AppIcon-20x20@2x-1.png' },
  { size: 60, name: 'AppIcon-20x20@3x.png' },
  { size: 29, name: 'AppIcon-29x29@1x.png' },
  { size: 58, name: 'AppIcon-29x29@2x.png' },
  { size: 58, name: 'AppIcon-29x29@2x-1.png' },
  { size: 87, name: 'AppIcon-29x29@3x.png' },
  { size: 40, name: 'AppIcon-40x40@1x.png' },
  { size: 80, name: 'AppIcon-40x40@2x.png' },
  { size: 80, name: 'AppIcon-40x40@2x-1.png' },
  { size: 120, name: 'AppIcon-40x40@3x.png' },
  { size: 120, name: 'AppIcon-60x60@2x.png' },
  { size: 180, name: 'AppIcon-60x60@3x.png' },
  { size: 76, name: 'AppIcon-76x76@1x.png' },
  { size: 152, name: 'AppIcon-76x76@2x.png' },
  { size: 167, name: 'AppIcon-83.5x83.5@2x.png' },
  { size: 1024, name: 'AppIcon-512@2x.png' },
];

// Android icons
const ANDROID_ICONS = [
  { size: 48, dir: 'mipmap-mdpi' },
  { size: 72, dir: 'mipmap-hdpi' },
  { size: 96, dir: 'mipmap-xhdpi' },
  { size: 144, dir: 'mipmap-xxhdpi' },
  { size: 192, dir: 'mipmap-xxxhdpi' },
];

async function generateIcons() {
  console.log('🐕 Generating ALL Doggy icons...\n');
  
  // Read SVG
  const svgBuffer = readFileSync(SVG_PATH);
  console.log(`✓ Read SVG from ${SVG_PATH}\n`);
  
  // Generate standard icons
  console.log('📦 Standard icons:');
  for (const { size, name } of STANDARD_ICONS) {
    const outputPath = join(ICONS_DIR, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  ✓ ${name} (${size}x${size})`);
  }
  
  // Generate Windows Square logos
  console.log('\n🪟 Windows icons:');
  for (const { size, name } of WINDOWS_ICONS) {
    const outputPath = join(ICONS_DIR, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  ✓ ${name} (${size}x${size})`);
  }
  
  // Generate iOS icons
  console.log('\n🍎 iOS icons:');
  const iosDir = join(ICONS_DIR, 'ios');
  if (!existsSync(iosDir)) mkdirSync(iosDir, { recursive: true });
  for (const { size, name } of IOS_ICONS) {
    const outputPath = join(iosDir, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`  ✓ ${name} (${size}x${size})`);
  }
  
  // Generate Android icons
  console.log('\n🤖 Android icons:');
  const androidDir = join(ICONS_DIR, 'android');
  for (const { size, dir } of ANDROID_ICONS) {
    const dirPath = join(androidDir, dir);
    if (!existsSync(dirPath)) mkdirSync(dirPath, { recursive: true });
    
    // ic_launcher.png (full icon)
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(dirPath, 'ic_launcher.png'));
    
    // ic_launcher_round.png (same as launcher for now)
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(dirPath, 'ic_launcher_round.png'));
    
    // ic_launcher_foreground.png (larger for adaptive icon)
    const foregroundSize = Math.round(size * 1.5);
    await sharp(svgBuffer)
      .resize(foregroundSize, foregroundSize)
      .extend({
        top: Math.round((size * 2 - foregroundSize) / 2),
        bottom: Math.round((size * 2 - foregroundSize) / 2),
        left: Math.round((size * 2 - foregroundSize) / 2),
        right: Math.round((size * 2 - foregroundSize) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .resize(size, size)
      .png()
      .toFile(join(dirPath, 'ic_launcher_foreground.png'));
    
    console.log(`  ✓ ${dir}/ (${size}x${size})`);
  }
  
  // Generate ICO for Windows (multi-resolution)
  console.log('\n🔷 Windows ICO:');
  const icoSizes = [16, 24, 32, 48, 64, 128, 256];
  const icoPngs = [];
  
  for (const size of icoSizes) {
    const buffer = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();
    icoPngs.push(buffer);
  }
  
  // Create ICO file manually (simple format)
  const icoBuffer = await createIco(icoPngs, icoSizes);
  writeFileSync(join(ICONS_DIR, 'icon.ico'), icoBuffer);
  console.log(`  ✓ icon.ico (multi-resolution: ${icoSizes.join(', ')})`);
  
  // Generate ICNS for macOS
  console.log('\n🍏 macOS ICNS:');
  // Generate the required sizes for ICNS
  const icnsSizes = [16, 32, 64, 128, 256, 512, 1024];
  const icnsPngs = {};
  
  for (const size of icnsSizes) {
    icnsPngs[size] = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();
  }
  
  const icnsBuffer = createIcns(icnsPngs);
  writeFileSync(join(ICONS_DIR, 'icon.icns'), icnsBuffer);
  console.log(`  ✓ icon.icns (multi-resolution: ${icnsSizes.join(', ')})`);
  
  console.log('\n🎉 All icons generated successfully!');
}

// Create ICO file from PNG buffers
async function createIco(pngBuffers, sizes) {
  const images = [];
  
  for (let i = 0; i < pngBuffers.length; i++) {
    const png = pngBuffers[i];
    const size = sizes[i];
    images.push({
      width: size,
      height: size,
      data: png
    });
  }
  
  // ICO header
  const headerSize = 6;
  const dirEntrySize = 16;
  const numImages = images.length;
  
  // Calculate total size
  let dataOffset = headerSize + (dirEntrySize * numImages);
  const imageOffsets = [];
  
  for (const img of images) {
    imageOffsets.push(dataOffset);
    dataOffset += img.data.length;
  }
  
  // Create buffer
  const buffer = Buffer.alloc(dataOffset);
  
  // Write header
  buffer.writeUInt16LE(0, 0);  // Reserved
  buffer.writeUInt16LE(1, 2);  // ICO type
  buffer.writeUInt16LE(numImages, 4);  // Number of images
  
  // Write directory entries
  let offset = headerSize;
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const width = img.width >= 256 ? 0 : img.width;
    const height = img.height >= 256 ? 0 : img.height;
    
    buffer.writeUInt8(width, offset);      // Width
    buffer.writeUInt8(height, offset + 1); // Height
    buffer.writeUInt8(0, offset + 2);      // Color palette
    buffer.writeUInt8(0, offset + 3);      // Reserved
    buffer.writeUInt16LE(1, offset + 4);   // Color planes
    buffer.writeUInt16LE(32, offset + 6);  // Bits per pixel
    buffer.writeUInt32LE(img.data.length, offset + 8);  // Size
    buffer.writeUInt32LE(imageOffsets[i], offset + 12); // Offset
    
    offset += dirEntrySize;
  }
  
  // Write image data
  for (let i = 0; i < images.length; i++) {
    images[i].data.copy(buffer, imageOffsets[i]);
  }
  
  return buffer;
}

// Create ICNS file from PNG buffers
function createIcns(pngsBySize) {
  // ICNS type codes for different sizes
  const icnsTypes = {
    16: 'icp4',   // 16x16
    32: 'icp5',   // 32x32
    64: 'icp6',   // 64x64
    128: 'ic07',  // 128x128
    256: 'ic08',  // 256x256
    512: 'ic09',  // 512x512
    1024: 'ic10', // 1024x1024
  };
  
  const chunks = [];
  
  for (const [size, typeCode] of Object.entries(icnsTypes)) {
    const png = pngsBySize[parseInt(size)];
    if (png) {
      // Each chunk: 4 byte type + 4 byte length + data
      const chunkSize = 8 + png.length;
      const chunk = Buffer.alloc(chunkSize);
      chunk.write(typeCode, 0, 4, 'ascii');
      chunk.writeUInt32BE(chunkSize, 4);
      png.copy(chunk, 8);
      chunks.push(chunk);
    }
  }
  
  // Calculate total size
  const totalSize = 8 + chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  
  // Create ICNS buffer
  const icns = Buffer.alloc(totalSize);
  icns.write('icns', 0, 4, 'ascii');
  icns.writeUInt32BE(totalSize, 4);
  
  let offset = 8;
  for (const chunk of chunks) {
    chunk.copy(icns, offset);
    offset += chunk.length;
  }
  
  return icns;
}

generateIcons().catch(console.error);
