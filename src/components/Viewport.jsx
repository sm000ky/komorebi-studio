import React, { useRef, useState, useEffect } from 'react';
import { 
  Move, RotateCw, ZoomIn, ZoomOut, AlertTriangle, 
  Sparkles, RefreshCw, SplitSquareVertical,
  Compass, Zap, CheckCircle2
} from 'lucide-react';
import { buildCssFilter } from '../utils/exportEngine';
import { sound } from '../utils/audio';

export default function Viewport({
  isDark,
  imgSrc,
  imgRef,
  aspectRatio,
  pan,
  setPan,
  zoom,
  setZoom,
  rotation,
  flipH,
  flipV,
  filters,
  activeFilterPreset,
  fitMode = 'cover',
  scanlines,
  showHud,
  hudStyle,
  collisionGuard,
  tiltEnabled,
  activeStamp,
  stampPosition = 'bottom-right',
  onResetFraming,
  onTriggerEnhance,
  isEnhancing = false,
  primaryColor = '#00F0FF'
}) {
  const containerRef = useRef(null);
  const splitHandleRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Resolution Tracking
  const [imgRes, setImgRes] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (imgRef.current) {
      const updateRes = () => {
        setImgRes({
          w: imgRef.current.naturalWidth || imgRef.current.width || 0,
          h: imgRef.current.naturalHeight || imgRef.current.height || 0
        });
      };
      if (imgRef.current.complete) {
        updateRes();
      } else {
        imgRef.current.onload = updateRes;
      }
    }
  }, [imgSrc]);

  // Ultra-Smooth 120 FPS Compare Slider
  const [compareMode, setCompareMode] = useState(false);
  const [splitPos, setSplitPos] = useState(50);
  const [isSplitting, setIsSplitting] = useState(false);

  // Dynamic Island Interactive Expansion
  const [islandExpanded, setIslandExpanded] = useState(false);

  // Gyroscope & Auto-Sway Loop
  useEffect(() => {
    if (!tiltEnabled) {
      setTilt({ x: 0, y: 0 });
      return;
    }

    let frameId;
    let autoTime = 0;

    const handleOrientation = (e) => {
      if (e.gamma !== null && e.beta !== null) {
        const tiltY = Math.max(-12, Math.min(12, e.gamma * 0.4));
        const tiltX = Math.max(-12, Math.min(12, (e.beta - 45) * 0.4));
        setTilt({ x: tiltX, y: tiltY });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);

    const autoSway = () => {
      autoTime += 0.03;
      if (!isDragging && !isSplitting) {
        const swayX = Math.sin(autoTime) * 4;
        const swayY = Math.cos(autoTime * 0.8) * 6;
        setTilt(prev => ({
          x: prev.x * 0.85 + swayX * 0.15,
          y: prev.y * 0.85 + swayY * 0.15
        }));
      }
      frameId = requestAnimationFrame(autoSway);
    };
    frameId = requestAnimationFrame(autoSway);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      cancelAnimationFrame(frameId);
    };
  }, [tiltEnabled, isDragging, isSplitting]);

  // Pointer drag for panning
  const handlePointerDown = (e) => {
    if (e.target.closest('.no-drag') || isSplitting) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    });
  };

  // Dimensions & Clamping
  const frameW = containerRef.current?.clientWidth || 340;
  const frameH = containerRef.current?.clientHeight || 755;
  const imgW = imgRes.w || 1920;
  const imgH = imgRes.h || 1080;

  let baseScale;
  if (fitMode === 'contain') {
    baseScale = Math.min(frameW / imgW, frameH / imgH) * zoom;
  } else {
    baseScale = Math.max(frameW / imgW, frameH / imgH) * zoom;
  }

  const renderedW = Math.round(imgW * baseScale);
  const renderedH = Math.round(imgH * baseScale);

  // Maximum pan limit to guarantee image never leaves black empty space
  const maxPanX = fitMode === 'cover' ? Math.max(0, (renderedW - frameW) / 2) : (frameW * 0.45);
  const maxPanY = fitMode === 'cover' ? Math.max(0, (renderedH - frameH) / 2) : (frameH * 0.45);

  const clampedPanX = Math.max(-maxPanX, Math.min(maxPanX, pan.x));
  const clampedPanY = Math.max(-maxPanY, Math.min(maxPanY, pan.y));

  const handlePointerMove = (e) => {
    if (isSplitting && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pos = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPos(Math.min(95, Math.max(5, pos)));
      return;
    }

    if (tiltEnabled && containerRef.current && !isDragging) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - (rect.left + rect.width / 2);
      const mouseY = e.clientY - (rect.top + rect.height / 2);
      const targetTiltX = -(mouseY / (rect.height / 2)) * 10;
      const targetTiltY = (mouseX / (rect.width / 2)) * 10;
      setTilt({ x: targetTiltX, y: targetTiltY });
    }

    if (!isDragging) return;
    const nextX = e.clientX - dragStart.x;
    const nextY = e.clientY - dragStart.y;
    setPan({
      x: Math.max(-maxPanX, Math.min(maxPanX, nextX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, nextY))
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setIsSplitting(false);
  };

  const handleSplitPointerDown = (e) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsSplitting(true);
    sound.click();
  };

  const handleSplitPointerMove = (e) => {
    if (!isSplitting || !containerRef.current) return;
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const pos = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPos(Math.min(95, Math.max(5, pos)));
  };

  const handleSplitPointerUp = (e) => {
    setIsSplitting(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom((prev) => Math.min(3.0, Math.max(0.5, prev + delta)));
  };

  const [currentTime, setCurrentTime] = useState('20:26');
  const [currentDate, setCurrentDate] = useState('Friday, September 18');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
      setCurrentDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const getFrameRatioStyles = () => {
    switch (aspectRatio) {
      case '20:9': // 20:9 Modern Android
        return 'w-[290px] h-[644px] xs:w-[320px] xs:h-[710px] sm:w-[350px] sm:h-[777px] rounded-[48px]';
      case '19.5:9': // Modern iPhone
        return 'w-[290px] h-[628px] xs:w-[320px] xs:h-[693px] sm:w-[350px] sm:h-[758px] rounded-[50px]';
      case '16:9_portrait':
        return 'w-[290px] h-[515px] xs:w-[320px] xs:h-[568px] sm:w-[360px] sm:h-[640px] rounded-[36px]';
      case '16:9': // Desktop 4K
        return 'w-[90vw] max-w-[680px] h-[360px] sm:h-[400px] rounded-[24px]';
      case '21:9': // Ultrawide
        return 'w-[92vw] max-w-[760px] h-[310px] sm:h-[330px] rounded-[20px]';
      case '4:3': // Tablet
        return 'w-[80vw] max-w-[480px] h-[360px] sm:h-[420px] rounded-[32px]';
      case '1:1': // Square
        return 'w-[300px] h-[300px] xs:w-[340px] xs:h-[340px] sm:w-[400px] sm:h-[400px] rounded-[36px]';
      default:
        return 'w-[290px] h-[644px] xs:w-[320px] xs:h-[710px] sm:w-[350px] sm:h-[777px] rounded-[48px]';
    }
  };

  const isPortraitPhone = aspectRatio === '20:9' || aspectRatio === '19.5:9' || aspectRatio === '16:9_portrait';

  const stampDataMap = {
    zerotwo: { kanji: '零二 // 002', sub: 'PARASITE CODE', color: '#FF3366' },
    neotokyo: { kanji: '東京 // 2026', sub: 'NEO SHIBUYA', color: '#00F0FF' },
    lofi: { kanji: '雨 // CHILL', sub: 'KOMOREBI BEATS', color: '#FCD34D' },
    cyber: { kanji: '電脳 // CYBER', sub: 'NEURAL MATRIX', color: '#10B981' },
    eva: { kanji: '新世紀 // EVA-01', sub: 'TEST PROTOCOL', color: '#A855F7' },
    spirit: { kanji: '神隠し // SPIRIT', sub: 'BATHHOUSE REVERIE', color: '#EC4899' },
    midnight: { kanji: '深夜 // MIDNIGHT', sub: 'SHUTO TOKYO', color: '#38BDF8' },
    dream: { kanji: '夢 // DREAM', sub: 'PASTEL NOSTALGIA', color: '#F472B6' },
    waifu: { kanji: '終末 // WAIFU', sub: 'ANIME FORGE', color: '#FB7185' },
    komorebi: { kanji: '光 // KOMOREBI', sub: 'SUNLIGHT FILTER', color: '#34D399' }
  };

  const currentStampObj = activeStamp && activeStamp !== 'none' ? stampDataMap[activeStamp] : null;

  const isLowRes = imgRes.w > 0 && (imgRes.w < 600 || imgRes.h < 600);

  return (
    <div 
      className="relative flex-1 flex flex-col items-center justify-center p-2 sm:p-6 select-none overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Ambient Aurora Orbs */}
      <div 
        className="ambient-orb-1 absolute top-1/4 left-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-[110px] sm:blur-[140px] pointer-events-none opacity-20 -z-10"
        style={{ backgroundColor: primaryColor || '#FF3366' }}
      />
      <div 
        className="ambient-orb-2 absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-[110px] sm:blur-[140px] pointer-events-none opacity-20 -z-10"
        style={{ backgroundColor: '#00F0FF' }}
      />

      {/* Floating Status Bar & Quick Actions */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 z-30 max-w-full px-2">
        
        {/* Navigation telemetry pill */}
        <div className={`px-2.5 sm:px-3 py-1 rounded-full border text-[11px] font-mono flex items-center gap-1.5 sm:gap-2 backdrop-blur-xl transition-all shadow-sm ${
          isDark
            ? 'bg-slate-900/80 border-slate-800 text-slate-300'
            : 'bg-white/80 border-slate-200 text-slate-700'
        }`}>
          <span className="flex items-center gap-1">
            <Move className="w-3 h-3 text-[#00F0FF]" />
            <span className="hidden xs:inline">PAN</span>
          </span>
          <span className="opacity-30">•</span>
          <span>SCALE: <strong className="text-[#FF3366]">{(zoom * 100).toFixed(0)}%</strong></span>
          <button
            onClick={() => {
              sound.click();
              onResetFraming();
            }}
            title="Reset position"
            className="ml-0.5 p-0.5 hover:text-[#00F0FF] transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* Resolution Indicator Pill */}
        {imgRes.w > 0 && (
          <div className={`px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm backdrop-blur-xl ${
            isLowRes
              ? 'border-amber-500/50 bg-amber-500/15 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
              : 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isLowRes ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span>{imgRes.w}x{imgRes.h} {isLowRes ? 'RAW' : '4K'}</span>
          </div>
        )}

        {/* NEURAL RECONSTRUCT 4K BUTTON (Super-Resolution on Demand) */}
        <button
          onClick={onTriggerEnhance}
          disabled={isEnhancing}
          title="Neural Line Reconstruction & 4K Density Enhance"
          className="px-3 py-1 rounded-full bg-gradient-to-r from-[#00F0FF]/25 via-[#00F0FF]/15 to-[#FF3366]/25 border border-[#00F0FF]/60 text-[#00F0FF] hover:text-white text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.25)] hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] active:scale-95 transition-all disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5 text-[#FFE600] animate-bounce" />
          <span>{isEnhancing ? 'RECONSTRUCTING...' : 'NEURAL RECONSTRUCT 4K'}</span>
        </button>

        {/* Split Screen Before/After Toggle */}
        <button
          onClick={() => {
            sound.click();
            setCompareMode(!compareMode);
          }}
          title="Toggle Before / After Split Slider"
          className={`px-3 py-1 rounded-full border text-[11px] font-mono flex items-center gap-1.5 backdrop-blur-xl transition-all active:scale-95 ${
            compareMode
              ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold shadow-[0_0_12px_rgba(0,240,255,0.3)]'
              : isDark
                ? 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
                : 'border-slate-200 bg-white/80 text-slate-600'
          }`}
        >
          <SplitSquareVertical className="w-3.5 h-3.5" />
          <span>{compareMode ? 'COMPARE ON' : 'COMPARE'}</span>
        </button>

        {/* Holo Tilt Indicator */}
        {tiltEnabled && (
          <div className="hidden xs:flex px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono items-center gap-1">
            <Compass className="w-3 h-3 animate-spin" />
            <span>3D HOLO SWAY</span>
          </div>
        )}

      </div>

      {/* Main Frame Container */}
      <div
        ref={containerRef}
        style={{
          transform: tiltEnabled
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1, 1, 1)`
            : 'none',
          transition: isDragging || isSplitting ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className={`relative ${getFrameRatioStyles()} shadow-2xl border-[8px] sm:border-[10px] ${
          isDark 
            ? 'border-slate-800/90 shadow-[0_0_50px_-10px_rgba(0,0,0,0.9)] ring-1 ring-slate-700/60' 
            : 'border-slate-300/90 shadow-slate-400/40 ring-1 ring-slate-400/50'
        } bg-black overflow-hidden cursor-grab active:cursor-grabbing transform-gpu will-change-transform`}
        onPointerDown={handlePointerDown}
        onWheel={handleWheel}
      >
        
        {/* Neon Cyber Edge Glow */}
        <div 
          className="absolute inset-0 pointer-events-none rounded-[38px] z-25 border border-white/10 opacity-70"
          style={{
            boxShadow: `inset 0 0 20px -5px ${primaryColor || '#00F0FF'}33`
          }}
        />

        {/* Ambient Blurred Backdrop (Full View Contain Mode) */}
        {fitMode === 'contain' && (
          <img
            src={imgSrc}
            alt="Ambient Backdrop"
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-70 filter saturate-150 pointer-events-none -z-0"
          />
        )}

        {/* 1. LAYER: FILTERED / STYLED WALLPAPER */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        >
          <img
            ref={imgRef}
            src={imgSrc}
            alt="Wallpaper"
            crossOrigin="anonymous"
            draggable={false}
            style={{
              width: `${renderedW}px`,
              height: `${renderedH}px`,
              maxWidth: 'none',
              maxHeight: 'none',
              filter: buildCssFilter(filters, activeFilterPreset),
              transform: `translate(${clampedPanX}px, ${clampedPanY}px) rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out'
            }}
            className={`pointer-events-none select-none ${fitMode === 'contain' ? 'drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] rounded-lg' : ''}`}
          />
        </div>

        {/* 2. LAYER: ULTRA-SMOOTH RAW COMPARISON */}
        {compareMode && (
          <div 
            className="absolute inset-0 pointer-events-none z-12 overflow-hidden"
            style={{
              clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)`
            }}
          >
            {fitMode === 'contain' && (
              <img
                src={imgSrc}
                alt="Ambient Backdrop Raw"
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-70 filter saturate-150 pointer-events-none -z-0"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <img
                src={imgSrc}
                alt="Raw Original"
                crossOrigin="anonymous"
                draggable={false}
                style={{
                  width: `${renderedW}px`,
                  height: `${renderedH}px`,
                  maxWidth: 'none',
                  maxHeight: 'none',
                  transform: `translate(${clampedPanX}px, ${clampedPanY}px) rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`
                }}
                className={`pointer-events-none select-none ${fitMode === 'contain' ? 'drop-shadow-[0_15px_35px_rgba(0,0,0,0.9)] rounded-lg' : ''}`}
              />
            </div>
            
            {/* RAW Tag on left */}
            <div className="absolute top-12 left-4 z-20 px-2.5 py-1 rounded-lg bg-black/85 border border-white/20 font-mono text-[10px] text-white/90 font-bold shadow-lg backdrop-blur-md">
              RAW ORIGINAL
            </div>
          </div>
        )}

        {/* STYLED Tag on right when compare is on */}
        {compareMode && (
          <div className="absolute top-12 right-4 z-20 px-2.5 py-1 rounded-lg bg-[#00F0FF]/25 border border-[#00F0FF]/50 font-mono text-[10px] text-[#00F0FF] font-bold shadow-lg backdrop-blur-md pointer-events-none">
            STYLED
          </div>
        )}

        {/* 120 FPS Draggable Divider Handle */}
        {compareMode && (
          <div 
            ref={splitHandleRef}
            className="no-drag absolute inset-y-0 z-30 w-8 -ml-4 flex items-center justify-center cursor-ew-resize pointer-events-auto touch-none"
            style={{ left: `${splitPos}%` }}
            onPointerDown={handleSplitPointerDown}
            onPointerMove={handleSplitPointerMove}
            onPointerUp={handleSplitPointerUp}
          >
            <div className="w-1 h-full bg-[#00F0FF] shadow-[0_0_12px_#00F0FF]" />
            <div className="absolute w-8 h-8 rounded-full bg-[#00F0FF] text-black text-[12px] font-black flex items-center justify-center shadow-xl border-2 border-black active:scale-110 transition-transform select-none">
              ⇄
            </div>
          </div>
        )}

        {/* 3. LAYER: ANIME KANJI / WATERMARK STAMP */}
        {currentStampObj && (
          <div className={`absolute z-15 pointer-events-none select-none ${
            stampPosition === 'bottom-left' ? 'bottom-20 left-6 text-left' :
            stampPosition === 'top-right' ? 'top-20 right-6 text-right' :
            stampPosition === 'top-left' ? 'top-20 left-6 text-left' :
            'bottom-20 right-6 text-right'
          }`}>
            <div 
              className="font-mono tracking-widest text-xs sm:text-sm font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] px-2"
              style={{
                color: currentStampObj.color,
                borderRight: stampPosition.includes('right') ? `2px solid ${currentStampObj.color}` : 'none',
                borderLeft: stampPosition.includes('left') ? `2px solid ${currentStampObj.color}` : 'none'
              }}
            >
              <div>{currentStampObj.kanji}</div>
              <div className="text-[9px] opacity-75 font-sans tracking-tight">{currentStampObj.sub}</div>
            </div>
          </div>
        )}

        {/* 4. LAYER: CRT SCANLINES */}
        {scanlines && (
          <div className="absolute inset-0 scanlines pointer-events-none z-14 opacity-60" />
        )}

        {/* 5. LAYER: VIGNETTE */}
        {filters.vignette > 0 && (
          <div 
            className="absolute inset-0 pointer-events-none z-14"
            style={{
              boxShadow: `inset 0 0 110px rgba(0,0,0,${filters.vignette / 100})`
            }}
          />
        )}

        {/* 6. LAYER: 3D HOLOGRAPHIC SHEEN */}
        {tiltEnabled && (
          <div 
            className="absolute inset-0 pointer-events-none z-16 mix-blend-overlay opacity-35 transition-opacity"
            style={{
              background: `linear-gradient(${120 + tilt.y * 3}deg, rgba(255,51,102,0.4), rgba(0,240,255,0.4), rgba(255,230,0,0.4))`
            }}
          />
        )}

        {/* 7. LAYER: COLLISION GUARD */}
        {collisionGuard && isPortraitPhone && (
          <div className="absolute inset-x-0 top-0 h-[44%] pointer-events-none z-22 border-b-2 border-dashed border-[#FF3366] bg-[#FF3366]/20 flex flex-col justify-between p-4 backdrop-blur-[1.5px] animate-pulse">
            <div className="flex items-center justify-between text-[#FF3366] font-mono text-[10px] font-black tracking-wider">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                HUD DANGER ZONE
              </span>
              <span>AVOID FACE HERE</span>
            </div>
            <div className="text-center font-mono text-[9px] text-[#FF3366] bg-black/75 py-1 px-3 rounded-full self-center border border-[#FF3366]/50 shadow-lg">
              CLEAR AREA: CHARACTER EYES MUST SIT BELOW THIS LINE
            </div>
          </div>
        )}

        {/* 8. LAYER: INTERACTIVE PHONE LOCKSCREEN HUD */}
        {showHud && isPortraitPhone && (
          <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-5 sm:p-6">
            
            {/* Top Bar: Status + Dynamic Island */}
            <div>
              <div className="flex items-center justify-between text-white text-xs font-mono px-2 pt-1 font-semibold drop-shadow">
                <span>{currentTime}</span>

                <div 
                  onClick={() => {
                    sound.click();
                    setIslandExpanded(!islandExpanded);
                  }}
                  className={`no-drag pointer-events-auto cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-black rounded-full border border-white/10 flex items-center justify-between px-2.5 shadow-lg active:scale-95 ${
                    islandExpanded ? 'w-52 h-9 -mt-1' : 'w-24 h-6'
                  }`}
                >
                  {islandExpanded ? (
                    <div className="w-full flex items-center justify-between text-[10px] font-sans text-white/90">
                      <div className="flex items-center gap-1.5 truncate pr-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="truncate font-semibold">Racing into the Night</span>
                      </div>
                      <div className="flex items-end gap-0.5 h-3 flex-shrink-0">
                        <div className="w-0.5 bg-[#00F0FF] rounded-xs eq-bar-1" />
                        <div className="w-0.5 bg-[#FF3366] rounded-xs eq-bar-2" />
                        <div className="w-0.5 bg-white rounded-xs eq-bar-3" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-[#111] border border-blue-900/60" />
                      <div className="w-1 h-1 rounded-full bg-[#00F0FF]/60" />
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-[10px]">
                  <span>5G</span>
                  <div className="w-5 h-2.5 border border-white/90 rounded-sm p-0.5 flex items-center">
                    <div className="w-full h-full bg-white rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* Lockscreen Clock & Date */}
              <div className="text-center mt-7 sm:mt-9 drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                <div className="text-white/95 text-xs sm:text-sm font-semibold tracking-tight">
                  {currentDate}
                </div>
                <div className="text-white font-extralight text-7xl sm:text-8xl tracking-tight leading-none my-1 font-sans">
                  {currentTime}
                </div>
                
                {/* Weather & Music Pill */}
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-white text-[11px] font-medium border border-white/25 shadow-sm mt-2">
                  <span>26°C Partly Cloudy</span>
                  <span>•</span>
                  <span>YOASOBI</span>
                </div>
              </div>
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="flex flex-col items-center gap-2 pb-1">
              <div className="w-28 sm:w-32 h-1 bg-white/80 rounded-full shadow-lg" />
            </div>

          </div>
        )}

        {/* 9. RECONSTRUCTION OVERLAY MODAL */}
        {isEnhancing && (
          <div className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="p-5 rounded-3xl border border-[#00F0FF]/50 bg-[#121620] shadow-[0_0_40px_rgba(0,240,255,0.35)] flex flex-col items-center text-center max-w-xs">
              <Zap className="w-8 h-8 text-[#FFE600] animate-bounce mb-3" />
              <div className="font-mono text-xs font-bold text-[#00F0FF] tracking-wider mb-1">
                // NEURAL RECONSTRUCTION
              </div>
              <div className="text-[11px] text-slate-300 mb-3 leading-relaxed">
                Restoring anime lineart, locking edge contrast, and scaling to 4K density...
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00F0FF] via-[#FFE600] to-[#FF3366] animate-pulse w-full" />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
