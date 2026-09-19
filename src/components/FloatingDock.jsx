import React, { useState } from 'react';
import { 
  Crop, Sliders, Palette, Smartphone, Image as ImageIcon, 
  RotateCw, FlipHorizontal, RefreshCw, Copy, Check, 
  ShieldAlert, Sparkles, X, Dices, Stamp, Maximize2, Minimize2,
  AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyCenter
} from 'lucide-react';
import { sound } from '../utils/audio';
import { formatPaletteExport } from '../utils/colorExtractor';

export default function FloatingDock({
  isDark,
  aspectRatio,
  setAspectRatio,
  zoom,
  setZoom,
  rotation,
  setRotation,
  flipH,
  setFlipH,
  flipV,
  setFlipV,
  pan,
  setPan,
  onResetFraming,
  fitMode,
  setFitMode,
  filters,
  setFilters,
  activeFilterPreset,
  setActiveFilterPreset,
  palette,
  showHud,
  setShowHud,
  collisionGuard,
  setCollisionGuard,
  tiltEnabled,
  setTiltEnabled,
  activeStamp,
  setActiveStamp,
  stampPosition,
  setStampPosition,
  onRandomVibe,
  presets,
  onSelectPreset,
  onUploadClick
}) {
  const [activeTab, setActiveTab] = useState('framing');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [paletteFormat, setPaletteFormat] = useState('hex');
  const [formatCopied, setFormatCopied] = useState(false);

  // Filter Categories
  const [filterCategory, setFilterCategory] = useState('all');

  // Preset Theme Categories
  const [presetTheme, setPresetTheme] = useState('all');

  const handleTabClick = (tabKey) => {
    sound.tabSwitch();
    setActiveTab(activeTab === tabKey ? null : tabKey);
  };

  const copyHex = (hex, idx) => {
    sound.click();
    navigator.clipboard.writeText(hex);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyFormattedPalette = () => {
    sound.success();
    const text = formatPaletteExport(palette, paletteFormat);
    navigator.clipboard.writeText(text);
    setFormatCopied(true);
    setTimeout(() => setFormatCopied(false), 1500);
  };

  // Universal Aspect Ratios (NO "flagship", NO "Poco")
  const aspectOptions = [
    { id: '20:9', label: '20:9 (Smartphone Modern)', sub: '1080x2400' },
    { id: '19.5:9', label: '19.5:9 (Layar Penuh)', sub: '1179x2556' },
    { id: '16:9_portrait', label: '9:16 (Layar Standar HP)', sub: '1080x1920' },
    { id: '16:9', label: '16:9 (Desktop / PC 4K)', sub: '3840x2160' },
    { id: '21:9', label: '21:9 (Monitor Lebar)', sub: '3440x1440' },
    { id: '4:3', label: '4:3 (Tablet / iPad)', sub: '2048x1536' },
    { id: '1:1', label: '1:1 (Persegi / Avatar)', sub: '2048x2048' },
  ];

  // 11 Unique Anime Tone Filters
  const allFilterPresets = [
    { id: 'none', label: 'Original Clean', cat: 'all', desc: 'Warna murni asli' },
    { id: 'retro90s', label: '90s Cel-Anime', cat: 'vintage', desc: 'Nostalgia hangat + grain' },
    { id: 'lofi', label: 'Lo-Fi Chill', cat: 'atmosphere', desc: 'Soft pastel bloom' },
    { id: 'cyberpunk', label: 'Cyber Neon', cat: 'cyber', desc: 'Vibrant neon electric' },
    { id: 'tokyo_night', label: 'Tokyo Midnight', cat: 'cyber', desc: 'Deep indigo & neon' },
    { id: 'noir', label: 'Manga Ink', cat: 'vintage', desc: 'Hitam putih dramatis' },
    { id: 'sunset', label: 'Golden Hour', cat: 'atmosphere', desc: 'Kilau senja keemasan' },
    { id: 'vaporwave', label: 'Vaporwave 80s', cat: 'cyber', desc: 'Dreamy pink & cyan' },
    { id: 'emerald_ghibli', label: 'Emerald Ghibli', cat: 'atmosphere', desc: 'Hijau alam rimbun' },
    { id: 'sakura', label: 'Sakura Petal', cat: 'atmosphere', desc: 'Nuansa merah muda' },
    { id: 'matrix', label: 'Matrix Terminal', cat: 'cyber', desc: 'Digital phosphor green' },
    { id: 'oled', label: 'OLED Midnight', cat: 'vintage', desc: 'Kontras pekat hemat daya' },
  ];

  const filteredPresetsList = filterCategory === 'all' 
    ? allFilterPresets 
    : allFilterPresets.filter(f => f.cat === filterCategory || f.id === 'none');

  // Filtered Wallpaper Presets by Theme
  const filteredWallpapers = presetTheme === 'all'
    ? presets
    : presets.filter(p => p.theme === presetTheme);

  // 10 Anime Kanji Watermark Stamps
  const animeStamps = [
    { id: 'none', label: 'No Stamp', desc: 'Bersih' },
    { id: 'zerotwo', label: '零二 // 002', desc: 'FranXX Code' },
    { id: 'neotokyo', label: '東京 // 2026', desc: 'Neo Shibuya' },
    { id: 'lofi', label: '雨 // CHILL', desc: 'Ame Rain Beats' },
    { id: 'cyber', label: '電脳 // CYBER', desc: 'Neural Matrix' },
    { id: 'eva', label: '新世紀 // EVA', desc: 'Test Protocol' },
    { id: 'spirit', label: '神隠し // SPIRIT', desc: 'Bathhouse Vibe' },
    { id: 'midnight', label: '深夜 // MIDNIGHT', desc: 'Tokyo Night Drive' },
    { id: 'dream', label: '夢 // DREAM', desc: 'Pastel Dreams' },
    { id: 'waifu', label: '終末 // WAIFU', desc: 'Anime Forge' },
    { id: 'komorebi', label: '光 // KOMOREBI', desc: 'Sunlight Filter' },
  ];

  return (
    <div className="fixed bottom-3 sm:bottom-6 inset-x-0 z-40 flex flex-col items-center pointer-events-none px-3 sm:px-4">
      
      {/* Slide-up Drawer Panel */}
      {activeTab && (
        <div className={`pointer-events-auto mb-2 sm:mb-3 w-full max-w-lg sm:max-w-xl rounded-3xl border p-3.5 sm:p-5 shadow-2xl backdrop-blur-2xl transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] animate-in fade-in zoom-in-95 slide-in-from-bottom-3 ${
          isDark 
            ? 'bg-[#121620]/95 border-slate-700/80 text-slate-200 shadow-black/85' 
            : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300'
        }`}>
          {/* Tactile Drag Handle */}
          <div 
            onClick={() => {
              sound.click();
              setActiveTab(null);
            }} 
            className="w-12 h-1 rounded-full bg-slate-500/40 hover:bg-[#00F0FF] mx-auto mb-2 cursor-pointer active:scale-90 transition-all" 
            title="Tutup Menu"
          />

          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-700/40">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-wider text-[#00F0FF] uppercase flex items-center gap-1.5">
                <span>//</span> {activeTab} MATRIX
              </span>
              {activeTab === 'filters' && (
                <button
                  onClick={() => {
                    sound.click();
                    onRandomVibe();
                  }}
                  className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF3366]/20 to-[#00F0FF]/20 text-[10px] font-mono border border-white/20 text-[#00F0FF] flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Dices className="w-3 h-3 text-[#FF3366]" />
                  <span>RANDOM VIBE</span>
                </button>
              )}
            </div>

            <button
              onClick={() => {
                sound.click();
                setActiveTab(null);
              }}
              className="p-1 rounded-lg hover:bg-slate-700/30 text-slate-400 hover:text-slate-200 active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* TAB 1: FRAMING & FIT MODES (No more cutting off!) */}
          {activeTab === 'framing' && (
            <div className="space-y-3">
              
              {/* Fit Mode Toggle (Preserve full art with blur fill vs cover) */}
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">MODE TAMPILAN GAMBAR</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      sound.click();
                      setFitMode('contain');
                    }}
                    className={`p-2 rounded-xl text-left border text-xs transition-all active:scale-[0.97] flex items-center gap-2 ${
                      fitMode === 'contain'
                        ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold shadow-[0_0_10px_rgba(0,240,255,0.25)]'
                        : isDark ? 'border-slate-800 bg-slate-900/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Minimize2 className="w-4 h-4 text-[#00F0FF] flex-shrink-0" />
                    <div>
                      <div className="font-semibold">FULL ART (BLUR FILL)</div>
                      <div className="text-[9px] opacity-70 font-mono">100% utuh tanpa kepotong</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      sound.click();
                      setFitMode('cover');
                    }}
                    className={`p-2 rounded-xl text-left border text-xs transition-all active:scale-[0.97] flex items-center gap-2 ${
                      fitMode === 'cover'
                        ? 'border-[#FF3366] bg-[#FF3366]/15 text-[#FF3366] font-bold shadow-[0_0_10px_rgba(255,51,102,0.25)]'
                        : isDark ? 'border-slate-800 bg-slate-900/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Maximize2 className="w-4 h-4 text-[#FF3366] flex-shrink-0" />
                    <div>
                      <div className="font-semibold">FILL SCREEN (CROP)</div>
                      <div className="text-[9px] opacity-70 font-mono">Penuhi seluruh layar</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Micro-Nudge & Fine Alignment Controls */}
              <div className="pt-2 border-t border-slate-700/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono text-slate-400">GESER HALUS (MICRO-NUDGE)</label>
                  <span className="text-[10px] font-mono text-[#00F0FF]">
                    X: {Math.round(pan.x)}px | Y: {Math.round(pan.y)}px
                  </span>
                </div>

                {/* D-Pad Micro-Nudge Controls */}
                <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-900/60 border border-slate-800">
                  {/* D-Pad Buttons */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => {
                        sound.click();
                        setPan(prev => ({ ...prev, y: prev.y + 15 }));
                      }}
                      title="Geser Naik (+15px)"
                      className="px-4 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:border-[#00F0FF] text-xs font-mono text-slate-200 active:scale-95 transition-all"
                    >
                      ▲
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          sound.click();
                          setPan(prev => ({ ...prev, x: prev.x + 15 }));
                        }}
                        title="Geser Kiri (+15px)"
                        className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:border-[#00F0FF] text-xs font-mono text-slate-200 active:scale-95 transition-all"
                      >
                        ◄
                      </button>
                      <button
                        onClick={() => {
                          sound.click();
                          setPan({ x: 0, y: 0 });
                        }}
                        title="Kembali ke Tengah"
                        className="px-2.5 py-1 rounded-lg border border-[#00F0FF]/40 bg-[#00F0FF]/15 text-[#00F0FF] text-[10px] font-mono font-bold active:scale-95 transition-all"
                      >
                        RESET
                      </button>
                      <button
                        onClick={() => {
                          sound.click();
                          setPan(prev => ({ ...prev, x: prev.x - 15 }));
                        }}
                        title="Geser Kanan (-15px)"
                        className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:border-[#00F0FF] text-xs font-mono text-slate-200 active:scale-95 transition-all"
                      >
                        ►
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        sound.click();
                        setPan(prev => ({ ...prev, y: prev.y - 15 }));
                      }}
                      title="Geser Turun (-15px)"
                      className="px-4 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:border-[#00F0FF] text-xs font-mono text-slate-200 active:scale-95 transition-all"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Horizontal Fine Slider */}
                  <div className="flex-1 pl-2 space-y-2 border-l border-slate-800">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                        <span>GESER HORIZONTAL</span>
                        <span className="text-[#00F0FF]">{Math.round(pan.x)}px</span>
                      </div>
                      <input
                        type="range"
                        min="-250"
                        max="250"
                        step="1"
                        value={Math.round(pan.x)}
                        onChange={(e) => setPan(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                        className="w-full accent-[#00F0FF] cursor-pointer h-1.5"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                        <span>GESER VERTIKAL</span>
                        <span className="text-[#FF3366]">{Math.round(pan.y)}px</span>
                      </div>
                      <input
                        type="range"
                        min="-250"
                        max="250"
                        step="1"
                        value={Math.round(pan.y)}
                        onChange={(e) => setPan(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                        className="w-full accent-[#FF3366] cursor-pointer h-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Aspect Ratios Grid */}
              <div className="pt-2 border-t border-slate-700/40">
                <label className="text-[11px] font-mono text-slate-400 block mb-1">TARGET SCREEN RATIO</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {aspectOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        sound.click();
                        setAspectRatio(opt.id);
                      }}
                      className={`p-2 rounded-xl text-left border text-xs transition-all active:scale-[0.97] duration-150 ${
                        aspectRatio === opt.id
                          ? 'border-[#FF3366] bg-[#FF3366]/15 text-[#FF3366] font-bold shadow-[0_0_10px_rgba(255,51,102,0.25)]'
                          : isDark
                            ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-300'
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="font-semibold truncate">{opt.label}</div>
                      <div className="text-[10px] opacity-60 font-mono">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Zoom & Quick Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-700/40">
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>ZOOM / SCALE</span>
                    <span className="text-[#00F0FF] font-bold">{(zoom * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-[#FF3366] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => {
                      sound.click();
                      setRotation((prev) => (prev + 90) % 360);
                    }}
                    title="Rotate 90°"
                    className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1 active:scale-95 transition-all ${
                      isDark ? 'border-slate-800 bg-slate-900/80 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-700'
                    }`}
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>90°</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.click();
                      setFlipH(!flipH);
                    }}
                    title="Flip Horizontal"
                    className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1 active:scale-95 transition-all ${
                      flipH 
                        ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF]' 
                        : isDark ? 'border-slate-800 bg-slate-900/80 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-700'
                    }`}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5 text-[#FF3366]" />
                    <span>FLIP</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.click();
                      onResetFraming();
                    }}
                    title="Reset Posisi & Zoom"
                    className="p-2 rounded-xl border border-slate-700 hover:border-[#FF3366] text-xs font-mono flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>RESET</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FILTERS & STAMPS */}
          {activeTab === 'filters' && (
            <div className="space-y-3">
              {/* Category Filter Chips */}
              <div className="flex items-center justify-between gap-1">
                <label className="text-[11px] font-mono text-slate-400">ANIME TONE FILTERS</label>
                <div className="flex gap-1">
                  {[
                    { id: 'all', label: 'ALL' },
                    { id: 'vintage', label: 'RETRO' },
                    { id: 'cyber', label: 'CYBER' },
                    { id: 'atmosphere', label: 'ATMOSPHERE' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        sound.click();
                        setFilterCategory(cat.id);
                      }}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold transition-all active:scale-95 ${
                        filterCategory === cat.id
                          ? 'bg-[#00F0FF] text-black shadow-sm'
                          : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact Filter Carousel Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {filteredPresetsList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      sound.click();
                      setActiveFilterPreset(p.id);
                    }}
                    className={`p-1.5 rounded-xl text-left border transition-all active:scale-[0.97] ${
                      activeFilterPreset === p.id
                        ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] font-bold shadow-[0_0_10px_rgba(0,240,255,0.25)]'
                        : isDark
                          ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-300'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-[11px] font-semibold truncate">{p.label}</div>
                    <div className="text-[9px] opacity-60 font-mono truncate">{p.desc}</div>
                  </button>
                ))}
              </div>

              {/* Compact Anime Stamps Section with Position Toggle */}
              <div className="pt-2 border-t border-slate-700/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <Stamp className="w-3.5 h-3.5 text-[#FF3366]" />
                    ANIME KANJI STAMP
                  </span>
                  
                  {activeStamp !== 'none' && (
                    <div className="flex gap-1">
                      {[
                        { id: 'bottom-right', label: 'BR' },
                        { id: 'bottom-left', label: 'BL' },
                        { id: 'top-right', label: 'TR' },
                        { id: 'top-left', label: 'TL' }
                      ].map(pos => (
                        <button
                          key={pos.id}
                          onClick={() => {
                            sound.click();
                            setStampPosition(pos.id);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                            stampPosition === pos.id 
                              ? 'bg-[#FF3366] text-white' 
                              : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Horizontal Scrollable Compact Stamps */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {animeStamps.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => {
                        sound.click();
                        setActiveStamp(st.id);
                      }}
                      className={`px-2.5 py-1 rounded-xl border flex-shrink-0 text-center transition-all active:scale-95 ${
                        activeStamp === st.id
                          ? 'border-[#FF3366] bg-[#FF3366]/15 text-[#FF3366] font-bold shadow-[0_0_8px_rgba(255,51,102,0.3)]'
                          : isDark ? 'border-slate-800 bg-slate-900/60 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <div className="text-[10px] font-mono font-semibold whitespace-nowrap">{st.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders (Saturation & Vignette) */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700/40 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>SATURATION</span>
                    <span>{filters.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="80"
                    value={filters.saturation}
                    onChange={(e) => setFilters({ ...filters, saturation: parseInt(e.target.value) })}
                    className="w-full accent-[#FF3366] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>VIGNETTE</span>
                    <span>{filters.vignette}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={filters.vignette}
                    onChange={(e) => setFilters({ ...filters, vignette: parseInt(e.target.value) })}
                    className="w-full accent-[#FF3366] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PALETTE */}
          {activeTab === 'palette' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono text-slate-400">EXTRACTED COLOR HARMONY</label>
                <div className="flex gap-1">
                  {['hex', 'tailwind', 'material'].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => {
                        sound.click();
                        setPaletteFormat(fmt);
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono uppercase transition-all active:scale-95 ${
                        paletteFormat === fmt
                          ? 'bg-[#00F0FF] text-black font-bold'
                          : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Swatch Cards */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {palette.map((c, idx) => (
                  <div
                    key={idx}
                    onClick={() => copyHex(c.hex, idx)}
                    className="group cursor-pointer rounded-xl p-1.5 sm:p-2 border border-slate-700/60 bg-slate-900/40 hover:border-[#00F0FF] transition-all flex flex-col items-center text-center active:scale-95"
                  >
                    <div 
                      className="w-full h-8 sm:h-10 rounded-lg shadow-inner mb-1 border border-white/10 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-slate-200">
                      {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400 inline" /> : c.hex}
                    </span>
                    <span className="text-[8px] sm:text-[9px] font-mono text-slate-500 truncate max-w-full">
                      {c.role}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={copyFormattedPalette}
                className="w-full py-2 px-3 rounded-xl border border-slate-700 hover:border-[#00F0FF] bg-slate-800/60 text-xs font-mono flex items-center justify-center gap-2 text-slate-200 transition-colors active:scale-95"
              >
                {formatCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>COPIED TO CLIPBOARD!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>COPY PALETTE AS {paletteFormat.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 4: SAFETY HUD & 3D HOLO TILT */}
          {activeTab === 'hud' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Collision Guard */}
                <div 
                  onClick={() => {
                    sound.click();
                    setCollisionGuard(!collisionGuard);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 active:scale-[0.97] ${
                    collisionGuard
                      ? 'border-[#FF3366] bg-[#FF3366]/15 text-[#FF3366] shadow-[0_0_12px_rgba(255,51,102,0.3)]'
                      : isDark ? 'border-slate-800 bg-slate-900/60 text-slate-300' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#FF3366]" />
                  <div>
                    <div className="font-mono text-xs font-bold">COLLISION GUARD</div>
                    <div className="text-[11px] opacity-70">Garis batas visual agar wajah & mata karakter tidak tertutup jam HP.</div>
                  </div>
                </div>

                {/* 3D Holo Tilt & Auto-Sway */}
                <div 
                  onClick={() => {
                    sound.click();
                    setTiltEnabled(!tiltEnabled);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 active:scale-[0.97] ${
                    tiltEnabled
                      ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                      : isDark ? 'border-slate-800 bg-slate-900/60 text-slate-300' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0 text-[#00F0FF]" />
                  <div>
                    <div className="font-mono text-xs font-bold">3D HOLO SWAY & GYRO</div>
                    <div className="text-[11px] opacity-70">Frame bergoyang 3D otomatis dengan kilauan hologram saat HP digerakkan.</div>
                  </div>
                </div>
              </div>

              {/* Toggle Lockscreen HUD */}
              <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">LOCKSCREEN OVERLAY (JAM & STATUS)</span>
                <button
                  onClick={() => {
                    sound.click();
                    setShowHud(!showHud);
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all active:scale-95 ${
                    showHud
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-slate-700 bg-slate-800 text-slate-400'
                  }`}
                >
                  {showHud ? 'OVERLAY AKTIF' : 'OVERLAY OFF'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PRESETS WITH THEME TABS (NO "ESTETIK", ORGANIZED BY VIBE) */}
          {activeTab === 'presets' && (
            <div className="space-y-2.5">
              
              {/* Theme Category Chips */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'SEMUA' },
                  { id: 'cyber', label: 'CYBER' },
                  { id: 'ghibli', label: 'GHIBLI' },
                  { id: 'lofi', label: 'LO-FI' },
                  { id: 'shonen', label: 'SHONEN' },
                  { id: 'retro', label: 'RETRO' }
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      sound.click();
                      setPresetTheme(th.id);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold whitespace-nowrap transition-all active:scale-95 ${
                      presetTheme === th.id
                        ? 'bg-[#00F0FF] text-black shadow-md'
                        : isDark ? 'bg-slate-800/80 text-slate-400 hover:text-slate-200' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {th.label}
                  </button>
                ))}
              </div>

              {/* Responsive Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2 max-h-60 sm:max-h-72 overflow-y-auto pr-1">
                {filteredWallpapers.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      sound.click();
                      onSelectPreset(p);
                    }}
                    className="group cursor-pointer rounded-xl sm:rounded-2xl overflow-hidden border border-slate-700/70 hover:border-[#00F0FF] transition-all bg-slate-900/50 active:scale-95"
                  >
                    <div className="h-14 sm:h-16 w-full overflow-hidden bg-slate-800">
                      <img 
                        src={p.src} 
                        alt={p.name} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-1 sm:p-1.5 text-center">
                      <div className="font-mono text-[9px] sm:text-[10px] font-bold text-slate-200 truncate">{p.name}</div>
                      <div className="text-[7px] sm:text-[8px] text-slate-400 font-mono truncate">{p.tag}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  sound.click();
                  onUploadClick();
                }}
                className="w-full py-2 rounded-xl border border-dashed border-slate-600 hover:border-[#00F0FF] text-xs font-mono text-slate-300 hover:text-[#00F0FF] transition-colors flex items-center justify-center gap-2 active:scale-95"
              >
                <ImageIcon className="w-4 h-4 text-[#00F0FF]" />
                <span>UPLOAD WALLPAPER SENDIRI (RAW / FANART)</span>
              </button>
            </div>
          )}

        </div>
      )}

      {/* Floating Bottom Navigation Pill */}
      <nav className={`pointer-events-auto flex items-center gap-1 sm:gap-2 p-1.5 rounded-full border shadow-2xl backdrop-blur-2xl transition-all duration-200 ${
        isDark 
          ? 'bg-[#121620]/90 border-slate-800/90 text-slate-300 shadow-black/80' 
          : 'bg-white/90 border-slate-300 text-slate-700 shadow-slate-300'
      }`}>
        <button
          onClick={() => handleTabClick('framing')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono transition-all active:scale-95 duration-150 ${
            activeTab === 'framing'
              ? 'bg-[#FF3366] text-white font-bold shadow-lg shadow-[#FF3366]/40'
              : 'hover:bg-slate-700/20 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Crop className="w-4 h-4" />
          <span className="hidden sm:inline">FRAMING</span>
        </button>

        <button
          onClick={() => handleTabClick('filters')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono transition-all active:scale-95 duration-150 ${
            activeTab === 'filters'
              ? 'bg-[#00F0FF] text-black font-bold shadow-lg shadow-[#00F0FF]/40'
              : 'hover:bg-slate-700/20 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="hidden sm:inline">FILTERS</span>
        </button>

        <button
          onClick={() => handleTabClick('palette')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono transition-all active:scale-95 duration-150 ${
            activeTab === 'palette'
              ? 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/40'
              : 'hover:bg-slate-700/20 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">PALETTE</span>
        </button>

        <button
          onClick={() => handleTabClick('hud')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono transition-all active:scale-95 duration-150 ${
            activeTab === 'hud'
              ? 'bg-emerald-400 text-black font-bold shadow-lg shadow-emerald-400/40'
              : 'hover:bg-slate-700/20 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span className="hidden sm:inline">SAFETY HUD</span>
        </button>

        <button
          onClick={() => handleTabClick('presets')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono transition-all active:scale-95 duration-150 ${
            activeTab === 'presets'
              ? 'bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/40'
              : 'hover:bg-slate-700/20 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span className="hidden sm:inline">PRESETS</span>
        </button>
      </nav>

    </div>
  );
}
