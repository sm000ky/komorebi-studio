/**
 * High-Resolution Canvas Export Engine
 * Generates crisp 1080x2400 / 4K wallpapers and Mockup Showcase cards.
 */

export async function renderAndDownloadWallpaper({
  imgElement,
  aspectRatio,
  pan,
  zoom,
  rotation,
  flipH,
  flipV,
  filters,
  activeFilterPreset,
  fitMode = 'cover', // 'cover' | 'contain'
  activeStamp,
  stampPosition = 'bottom-right',
  scanlines,
  filename = 'komorebi_wallpaper.png'
}) {
  if (!imgElement) return;

  const dims = getExportDimensions(aspectRatio);
  const canvas = document.createElement('canvas');
  canvas.width = dims.width;
  canvas.height = dims.height;
  const ctx = canvas.getContext('2d');

  // Fill black base
  ctx.fillStyle = '#090B10';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const imgW = imgElement.naturalWidth || imgElement.width;
  const imgH = imgElement.naturalHeight || imgElement.height;

  // 1. If 'contain' (Full View with Blur Fill): render blurred ambient background first
  if (fitMode === 'contain') {
    ctx.save();
    // Ambient color matched backdrop
    ctx.filter = 'blur(60px) brightness(0.65) saturate(1.5)';
    const bgScale = Math.max(canvas.width / imgW, canvas.height / imgH) * 1.2;
    const bgW = imgW * bgScale;
    const bgH = imgH * bgScale;
    ctx.drawImage(imgElement, (canvas.width - bgW) / 2, (canvas.height - bgH) / 2, bgW, bgH);
    ctx.restore();

    // Subtle dark gradient vignette over blur
    applyCanvasVignette(ctx, canvas.width, canvas.height, 40);
  }

  // 2. Draw Main Image (with active filters & transformation)
  ctx.save();
  ctx.filter = buildCssFilter(filters, activeFilterPreset);

  let scale;
  if (fitMode === 'contain') {
    // Fits entire image completely inside canvas without cutting any border
    scale = Math.min(canvas.width / imgW, canvas.height / imgH) * zoom;
  } else {
    // Cover fills entire canvas
    scale = Math.max(canvas.width / imgW, canvas.height / imgH) * zoom;
  }

  const drawW = imgW * scale;
  const drawH = imgH * scale;

  // Max pan bounds on export canvas (prevents black empty borders)
  const maxExportPanX = fitMode === 'cover' ? Math.max(0, (drawW - canvas.width) / 2) : (canvas.width * 0.4);
  const maxExportPanY = fitMode === 'cover' ? Math.max(0, (drawH - canvas.height) / 2) : (canvas.height * 0.4);

  const exportPanX = Math.max(-maxExportPanX, Math.min(maxExportPanX, pan.x * (canvas.width / 350)));
  const exportPanY = Math.max(-maxExportPanY, Math.min(maxExportPanY, pan.y * (canvas.height / 770)));

  ctx.translate(canvas.width / 2 + exportPanX, canvas.height / 2 + exportPanY);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

  // Draw shadow around full art in contain mode
  if (fitMode === 'contain') {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 40;
  }

  ctx.drawImage(imgElement, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  // Reset filter for overlays
  ctx.filter = 'none';

  // Apply Vignette if enabled
  if (filters.vignette > 0) {
    applyCanvasVignette(ctx, canvas.width, canvas.height, filters.vignette);
  }

  // Apply Scanlines if enabled
  if (scanlines) {
    applyCanvasScanlines(ctx, canvas.width, canvas.height);
  }

  // Apply Anime Stamp if active
  if (activeStamp && activeStamp !== 'none') {
    renderStampOnCanvas(ctx, canvas.width, canvas.height, activeStamp, stampPosition);
  }

  // Download Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      resolve(true);
    }, 'image/png');
  });
}

export async function renderAndDownloadMockupCard({
  imgElement,
  aspectRatio,
  pan,
  zoom,
  rotation,
  flipH,
  flipV,
  filters,
  activeFilterPreset,
  fitMode = 'cover',
  activeStamp,
  palette,
  hudStyle,
  filename = 'komorebi_showcase_card.png'
}) {
  if (!imgElement) return;

  const cardW = 1200;
  const cardH = 2500;
  const canvas = document.createElement('canvas');
  canvas.width = cardW;
  canvas.height = cardH;
  const ctx = canvas.getContext('2d');

  // Background Gradient (Dark Cyber Studio)
  const bgGrad = ctx.createLinearGradient(0, 0, cardW, cardH);
  bgGrad.addColorStop(0, '#090B12');
  bgGrad.addColorStop(1, '#05070A');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, cardW, cardH);

  // Subtle Header
  ctx.fillStyle = '#00F0FF';
  ctx.font = 'bold 36px "JetBrains Mono", monospace';
  ctx.fillText('KOMOREBI STUDIO // ANIME WALLPAPER LAB', 100, 110);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '24px "JetBrains Mono", monospace';
  ctx.fillText('ULTRA HD 4K PREVIEW • COLOR DOCK VERIFIED', 100, 155);

  // Phone Mockup Dimensions
  const phoneW = 900;
  const phoneH = 1950;
  const phoneX = (cardW - phoneW) / 2;
  const phoneY = 220;
  const radius = 64;

  // Phone Bezel Shadow & Outline
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 30;

  drawRoundedRect(ctx, phoneX, phoneY, phoneW, phoneH, radius);
  ctx.fillStyle = '#000000';
  ctx.fill();
  ctx.restore();

  // Clip inside Phone Frame
  ctx.save();
  drawRoundedRect(ctx, phoneX, phoneY, phoneW, phoneH, radius);
  ctx.clip();

  const imgW = imgElement.naturalWidth || imgElement.width;
  const imgH = imgElement.naturalHeight || imgElement.height;

  // If contain mode: draw blur background inside phone
  if (fitMode === 'contain') {
    ctx.save();
    ctx.filter = 'blur(40px) brightness(0.65) saturate(1.5)';
    const bgScale = Math.max(phoneW / imgW, phoneH / imgH) * 1.2;
    const bgW = imgW * bgScale;
    const bgH = imgH * bgScale;
    ctx.drawImage(imgElement, phoneX + (phoneW - bgW) / 2, phoneY + (phoneH - bgH) / 2, bgW, bgH);
    ctx.restore();
  }

  // Draw wallpaper inside phone
  ctx.save();
  ctx.filter = buildCssFilter(filters, activeFilterPreset);

  let scale;
  if (fitMode === 'contain') {
    scale = Math.min(phoneW / imgW, phoneH / imgH) * zoom;
  } else {
    scale = Math.max(phoneW / imgW, phoneH / imgH) * zoom;
  }

  const drawW = imgW * scale;
  const drawH = imgH * scale;

  // Max pan bounds inside mockup phone
  const maxMockupPanX = fitMode === 'cover' ? Math.max(0, (drawW - phoneW) / 2) : (phoneW * 0.4);
  const maxMockupPanY = fitMode === 'cover' ? Math.max(0, (drawH - phoneH) / 2) : (phoneH * 0.4);

  const mockupPanX = Math.max(-maxMockupPanX, Math.min(maxMockupPanX, pan.x * (phoneW / 350)));
  const mockupPanY = Math.max(-maxMockupPanY, Math.min(maxMockupPanY, pan.y * (phoneH / 770)));

  ctx.translate(phoneX + phoneW / 2 + mockupPanX, phoneY + phoneH / 2 + mockupPanY);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

  ctx.drawImage(imgElement, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  // Phone Top & Bottom Vignettes for HUD Legibility
  const topGrad = ctx.createLinearGradient(0, phoneY, 0, phoneY + 500);
  topGrad.addColorStop(0, 'rgba(0,0,0,0.65)');
  topGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(phoneX, phoneY, phoneW, 500);

  // Phone Lockscreen HUD
  renderPhoneHUD(ctx, phoneX, phoneY, phoneW, phoneH, hudStyle);

  // Phone Inner Border
  ctx.restore();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, phoneX, phoneY, phoneW, phoneH, radius);
  ctx.stroke();

  // Bottom Palette Showcase Card
  const dockW = 1000;
  const dockH = 180;
  const dockX = (cardW - dockW) / 2;
  const dockY = cardH - 260;

  ctx.save();
  drawRoundedRect(ctx, dockX, dockY, dockW, dockH, 32);
  ctx.fillStyle = 'rgba(18, 22, 32, 0.9)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Palette Swatches
  const swatchCount = palette.length;
  const swatchSize = 90;
  const totalW = swatchCount * swatchSize + (swatchCount - 1) * 36;
  const startX = dockX + (dockW - totalW) / 2;

  palette.forEach((color, i) => {
    const sx = startX + i * (swatchSize + 36);
    const sy = dockY + 30;

    drawRoundedRect(ctx, sx, sy, swatchSize, swatchSize, 18);
    ctx.fillStyle = color.hex;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(color.hex, sx + swatchSize / 2, sy + swatchSize + 32);
  });
  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      resolve(true);
    }, 'image/png');
  });
}

function renderStampOnCanvas(ctx, w, h, stamp, position = 'bottom-right') {
  ctx.save();
  ctx.textAlign = position.includes('right') ? 'right' : 'left';

  let x = position.includes('right') ? w - 80 : 80;
  let y = position.includes('bottom') ? h - 140 : 140;

  const stampsData = {
    zerotwo: { title: '零二 // 002', sub: 'PARASITE CODE', color: '#FF3366' },
    neotokyo: { title: '東京 // 2026', sub: 'NEO SHIBUYA', color: '#00F0FF' },
    lofi: { title: '雨 // CHILL', sub: 'KOMOREBI BEATS', color: '#FCD34D' },
    cyber: { title: '電脳 // CYBER', sub: 'NEURAL MATRIX', color: '#10B981' },
    eva: { title: '新世紀 // EVA-01', sub: 'TEST TYPE PROTOCOL', color: '#A855F7' },
    spirit: { title: '神隠し // SPIRIT', sub: 'BATHHOUSE REVERIE', color: '#EC4899' },
    midnight: { title: '深夜 // MIDNIGHT', sub: 'SHUTO EXPRESSWAY', color: '#38BDF8' },
    dream: { title: '夢 // DREAM', sub: 'PASTEL NOSTALGIA', color: '#F472B6' },
    waifu: { title: '終末 // WAIFU', sub: 'ANIME PROTOCOL', color: '#FB7185' },
    komorebi: { title: '光 // KOMOREBI', sub: 'SUNLIGHT FILTER', color: '#34D399' }
  };

  const st = stampsData[stamp] || stampsData.zerotwo;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 16;
  ctx.fillStyle = st.color;
  ctx.font = '900 48px "JetBrains Mono", monospace';
  ctx.fillText(st.title, x, y);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(st.sub, x, y + 36);

  ctx.restore();
}

function renderPhoneHUD(ctx, x, y, w, h, style = 'ios') {
  ctx.save();
  ctx.textAlign = 'center';

  // Dynamic Island
  const islandW = 200;
  const islandH = 48;
  const islandX = x + (w - islandW) / 2;
  const islandY = y + 26;
  drawRoundedRect(ctx, islandX, islandY, islandW, islandH, 24);
  ctx.fillStyle = '#000000';
  ctx.fill();

  // Date
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '600 38px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(dateStr, x + w / 2, y + 250);

  // Clock
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '200 170px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(timeStr, x + w / 2, y + 430);

  // Widget Capsule
  const widgetW = 540;
  const widgetH = 64;
  const widgetX = x + (w - widgetW) / 2;
  const widgetY = y + 480;

  drawRoundedRect(ctx, widgetX, widgetY, widgetW, widgetH, 32);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '500 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('26°C Partly Cloudy  •  Komorebi Lo-Fi', x + w / 2, widgetY + 42);

  // Home Bar
  const barW = 280;
  const barH = 8;
  const barX = x + (w - barW) / 2;
  const barY = y + h - 40;
  drawRoundedRect(ctx, barX, barY, barW, barH, 4);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fill();

  ctx.restore();
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function applyCanvasVignette(ctx, w, h, strength = 40) {
  const radius = Math.max(w, h) * 0.75;
  const grad = ctx.createRadialGradient(w / 2, h / 2, radius * 0.4, w / 2, h / 2, radius);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(0,0,0,${strength / 100})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function applyCanvasScanlines(ctx, w, h) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 2);
  }
}

export function buildCssFilter(filters, preset) {
  const parts = [];

  let b = filters.brightness;
  let c = filters.contrast;
  let s = filters.saturation;
  let sepia = filters.sepia;
  let hue = filters.hue;

  // Preset adjustments
  if (preset === 'retro90s') {
    b += 5;
    c += 15;
    s += 20;
    sepia += 15;
  } else if (preset === 'lofi') {
    b += 10;
    c -= 10;
    s -= 15;
    sepia += 25;
  } else if (preset === 'cyberpunk') {
    c += 30;
    s += 45;
    hue += 15;
  } else if (preset === 'tokyo_night') {
    b -= 5;
    c += 20;
    s += 25;
    hue += 190;
  } else if (preset === 'noir') {
    s = -100;
    c += 40;
  } else if (preset === 'sunset') {
    b += 5;
    s += 25;
    sepia += 35;
    hue -= 10;
  } else if (preset === 'vaporwave') {
    b += 8;
    c += 15;
    s += 35;
    hue += 280;
  } else if (preset === 'emerald_ghibli') {
    b += 5;
    c += 10;
    s += 30;
    hue += 75;
  } else if (preset === 'sakura') {
    b += 10;
    c += 10;
    s += 20;
    sepia += 10;
    hue += 325;
  } else if (preset === 'matrix') {
    c += 40;
    s += 60;
    hue += 90;
  } else if (preset === 'oled') {
    b -= 10;
    c += 45;
    s += 15;
  }

  parts.push(`brightness(${Math.max(0, 100 + b)}%)`);
  parts.push(`contrast(${Math.max(0, 100 + c)}%)`);
  parts.push(`saturate(${Math.max(0, 100 + s)}%)`);
  if (sepia > 0) parts.push(`sepia(${Math.min(100, sepia)}%)`);
  if (hue !== 0) parts.push(`hue-rotate(${hue}deg)`);

  return parts.join(' ');
}

export function getExportDimensions(ratio) {
  switch (ratio) {
    case '20:9': // Smartphone Modern
      return { width: 1080, height: 2400 };
    case '19.5:9': // Modern iPhone
      return { width: 1179, height: 2556 };
    case '16:9_portrait':
      return { width: 1080, height: 1920 };
    case '16:9': // Desktop 4K
      return { width: 3840, height: 2160 };
    case '21:9': // Ultrawide
      return { width: 3440, height: 1440 };
    case '4:3': // Tablet
      return { width: 2048, height: 1536 };
    case '1:1': // Square
      return { width: 2048, height: 2048 };
    default:
      return { width: 1080, height: 2400 };
  }
}
