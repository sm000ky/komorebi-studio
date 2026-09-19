/**
 * Ultra-lightweight Palette Extractor
 * Uses downsampled 64x64 Canvas 2D - CPU & RAM safe (<2ms, 0 memory spikes)
 */

export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

export function getLuminance(r, g, b) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function extractPaletteFromImage(imgElement, count = 5) {
  if (!imgElement || !imgElement.complete || imgElement.naturalWidth === 0) {
    return [
      { hex: '#1F2937', rgb: [31, 41, 55], lum: 0.16, role: 'Dark Base' },
      { hex: '#4B5563', rgb: [75, 85, 99], lum: 0.33, role: 'Mid Shadow' },
      { hex: '#00F0FF', rgb: [0, 240, 255], lum: 0.78, role: 'Neon Accent' },
      { hex: '#FF3366', rgb: [255, 51, 102], lum: 0.42, role: 'Vibrant' },
      { hex: '#F3F4F6', rgb: [243, 244, 246], lum: 0.95, role: 'Light Glow' }
    ];
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const sampleSize = 64;
  canvas.width = sampleSize;
  canvas.height = sampleSize;

  ctx.drawImage(imgElement, 0, 0, sampleSize, sampleSize);
  const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

  // Simple Color Quantization with color distance clustering
  const colorBuckets = {};
  const step = 4; // Sample every 4th pixel for speed

  for (let i = 0; i < imgData.length; i += 4 * step) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    const a = imgData[i + 3];

    if (a < 128) continue; // Skip transparent

    // Quantize to 32 steps (8 values per channel)
    const qr = Math.round(r / 24) * 24;
    const qg = Math.round(g / 24) * 24;
    const qb = Math.round(b / 24) * 24;
    const key = `${qr},${qg},${qb}`;

    if (!colorBuckets[key]) {
      colorBuckets[key] = { r: qr, g: qg, b: qb, count: 0 };
    }
    colorBuckets[key].count++;
  }

  const sorted = Object.values(colorBuckets).sort((a, b) => b.count - a.count);
  
  // Pick visually distinct colors
  const distinct = [];
  const minDistanceSq = 1800; // threshold for visual difference

  for (const c of sorted) {
    let isTooClose = false;
    for (const chosen of distinct) {
      const dr = c.r - chosen.r;
      const dg = c.g - chosen.g;
      const db = c.b - chosen.b;
      if (dr * dr + dg * dg + db * db < minDistanceSq) {
        isTooClose = true;
        break;
      }
    }
    if (!isTooClose) {
      distinct.push(c);
    }
    if (distinct.length >= count) break;
  }

  // Fallback if not enough distinct
  while (distinct.length < count && sorted.length > distinct.length) {
    distinct.push(sorted[distinct.length]);
  }

  return distinct.map(c => {
    const lum = getLuminance(c.r, c.g, c.b);
    let role = 'Midtone';
    if (lum > 0.75) role = 'Highlight';
    else if (lum < 0.25) role = 'Shadow Base';
    else if (Math.abs(c.r - c.g) > 40 || Math.abs(c.r - c.b) > 40) role = 'Vibrant Accent';

    return {
      hex: rgbToHex(c.r, c.g, c.b),
      rgb: [c.r, c.g, c.b],
      lum: parseFloat(lum.toFixed(2)),
      role
    };
  });
}

export function formatPaletteExport(palette, format = 'hex') {
  if (format === 'tailwind') {
    const obj = {};
    palette.forEach((p, idx) => {
      const key = ['base', 'surface', 'accent', 'primary', 'highlight', 'glow'][idx] || `color${idx + 1}`;
      obj[key] = p.hex;
    });
    return `// tailwind.config.js\nextend: {\n  colors: {\n    anime: ${JSON.stringify(obj, null, 4).replace(/"/g, "'")}\n  }\n}`;
  }

  if (format === 'material') {
    return JSON.stringify({
      theme: "Anime Material You",
      colors: palette.map(p => ({ role: p.role, hex: p.hex, luminance: p.lum }))
    }, null, 2);
  }

  if (format === 'android') {
    const lines = palette.map((p, i) => `    <color name="anime_color_${i + 1}">${p.hex}</color>`);
    return `<!-- res/values/colors.xml -->\n<resources>\n${lines.join('\n')}\n</resources>`;
  }

  return palette.map(p => p.hex).join(', ');
}
