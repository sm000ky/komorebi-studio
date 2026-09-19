import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import Viewport from './components/Viewport';
import FloatingDock from './components/FloatingDock';
import HelpModal from './components/HelpModal';
import { extractPaletteFromImage } from './utils/colorExtractor';
import { renderAndDownloadWallpaper, renderAndDownloadMockupCard } from './utils/exportEngine';
import { enhanceImageNeural } from './utils/superResolution';
import { sound } from './utils/audio';

const PRESET_WALLPAPERS = [
  // 1. Ghibli & Nature Scenery
  { id: 'totoro', name: 'Totoro Bus Stop', theme: 'ghibli', tag: 'Rainy Night Forest', src: '/samples/preset_totoro.jpg' },
  { id: 'howl_castle', name: 'Howl Moving Castle', theme: 'ghibli', tag: 'Steampunk Fantasy', src: '/samples/preset_howl_castle.jpg' },
  { id: 'castle_sky', name: 'Castle in Sky', theme: 'ghibli', tag: 'Windmill Meadow', src: '/samples/preset_castle_sky.jpg' },
  { id: 'sky_island', name: 'Laputa Citadel', theme: 'ghibli', tag: 'Floating Castle', src: '/samples/preset_sky_island.jpg' },
  { id: 'spirited_bath', name: 'Spirited Bathhouse', theme: 'ghibli', tag: 'Spirited Away', src: '/samples/preset_spirited_bath.jpg' },

  // 2. Cyber & Neo Tokyo
  { id: 'shibuya_lofi', name: 'Shibuya Neon', theme: 'cyber', tag: 'Cyber City Rain', src: '/samples/preset_shibuya_lofi.jpg' },
  { id: 'cyber_highway', name: 'Neon Expressway', theme: 'cyber', tag: 'Tokyo Night Drive', src: '/samples/preset_cyber_highway.jpg' },
  { id: 'cyber_alley', name: 'Neo Alley Lights', theme: 'cyber', tag: 'Shibuya Rain Night', src: '/samples/preset_cyber_alley.jpg' },
  { id: 'cyber_city_night', name: 'Neo Tokyo Highway', theme: 'cyber', tag: 'Cyber Expressway', src: '/samples/preset_cyber_city_night.jpg' },
  { id: 'cyber_station', name: 'Cyber Train Station', theme: 'cyber', tag: 'Sci-Fi Commute', src: '/samples/preset_cyber_station.jpg' },
  { id: 'cyber_terminal', name: 'Lain Glitch Wire', theme: 'cyber', tag: 'Wired Network', src: '/samples/preset_cyber_terminal.jpg' },

  // 3. Lo-Fi & Daily Life
  { id: 'kita_rustic', name: 'Kita Bocchi', theme: 'lofi', tag: 'Garden Afternoon', src: '/samples/sample_kita.jpg' },
  { id: 'after_school_walk', name: 'Sunset Sidewalk', theme: 'lofi', tag: 'Tokyo After School', src: '/samples/preset_after_school_walk.jpg' },
  { id: 'classroom', name: 'Classroom Sunset', theme: 'lofi', tag: 'Tokyo Evening', src: '/samples/preset_classroom.jpg' },
  { id: 'koishi_rose', name: 'Koishi Twilight', theme: 'lofi', tag: 'Rose Garden Calm', src: '/samples/preset_koishi_rose.jpg' },
  { id: 'retro_room', name: 'Cozy Anime Room', theme: 'lofi', tag: 'Lofi Bedroom Night', src: '/samples/preset_retro_room.jpg' },
  { id: 'ramen_shop', name: 'Late Night Ramen', theme: 'lofi', tag: 'Shinjuku Midnight', src: '/samples/preset_ramen_shop.jpg' },
  { id: 'stroll', name: 'School Stroll', theme: 'lofi', tag: 'City Walk Lo-Fi', src: '/samples/preset_stroll.jpg' },

  // 4. Japanese Shrines & Scenery
  { id: 'rainy_shrine', name: 'Rainy Torii Gate', theme: 'scenery', tag: 'Japanese Shrine', src: '/samples/preset_rainy_shrine.jpg' },
  { id: 'kurotani', name: 'Kurotani Lanterns', theme: 'scenery', tag: 'Evening Festival', src: '/samples/preset_kurotani.jpg' },
  { id: 'shinto_wall', name: 'Silent Pathway', theme: 'scenery', tag: 'Bamboo Morning', src: '/samples/preset_shinto_wall.jpg' },

  // 5. Retro & Classic
  { id: 'gankutsuou', name: 'Gankutsuou Starlight', theme: 'retro', tag: 'Avant-Garde Art', src: '/samples/preset_gankutsuou.jpg' },
  { id: 'lain', name: 'Lain Terminal', theme: 'retro', tag: '90s Cyber Vintage', src: '/samples/preset_lain.jpg' },
  { id: 'frieren', name: 'Chibi Frieren', theme: 'retro', tag: 'Fantasy Magic', src: '/samples/preset_frieren.jpg' },
  { id: 'kurumi', name: 'Kurumi Twilight', theme: 'retro', tag: 'Anime Classic', src: '/samples/preset_kurumi.jpg' },
  { id: 'glt_tank', name: 'Girls Last Tour', theme: 'retro', tag: 'Post-Apocalypse', src: '/samples/preset_glt_tank.jpg' },
  { id: 'ancient_mage', name: 'Ancient Magus', theme: 'retro', tag: 'Dark Fantasy', src: '/samples/preset_ancient_mage.jpg' },
  { id: 'planet_pixel', name: 'Pixel Cyber City', theme: 'retro', tag: '16-bit Future', src: '/samples/preset_planet_pixel.jpg' },
  { id: 'pixel_skies', name: 'Pixel Sky City', theme: 'retro', tag: 'Pixel Horizon', src: '/samples/preset_pixel_skies.jpg' },

  // 6. Action
  { id: 'tanjiro', name: 'Tanjiro Nichirin', theme: 'shonen', tag: 'Demon Slayer Blade', src: '/samples/preset_tanjiro.jpg' }
];

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanlines, setScanlines] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('20:9');
  
  // Image & Transformation states
  const [imgSrc, setImgSrc] = useState(PRESET_WALLPAPERS[0].src);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Fit Mode: 'cover' (fill screen) | 'contain' (full art with matching ambient blur fill)
  const [fitMode, setFitMode] = useState('contain');

  // Filters & Anime Stamps
  const [activeFilterPreset, setActiveFilterPreset] = useState('none');
  const [activeStamp, setActiveStamp] = useState('none');
  const [stampPosition, setStampPosition] = useState('bottom-right');
  const [filters, setFilters] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sepia: 0,
    hue: 0,
    vignette: 20
  });

  // Dynamic Palette
  const [palette, setPalette] = useState([]);

  // Safety HUD, Collision Guard, 3D Holo Tilt
  const [showHud, setShowHud] = useState(true);
  const [hudStyle, setHudStyle] = useState('ios');
  const [collisionGuard, setCollisionGuard] = useState(false);
  const [tiltEnabled, setTiltEnabled] = useState(false);

  // Super-Resolution / Neural Enhance State
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Help Modal State
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [isExporting, setIsExporting] = useState(false);

  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  // Sync dark mode class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Extract color palette
  const runColorExtraction = () => {
    if (imgRef.current) {
      const colors = extractPaletteFromImage(imgRef.current, 5);
      setPalette(colors);
    }
  };

  useEffect(() => {
    const timer = setTimeout(runColorExtraction, 300);
    return () => clearTimeout(timer);
  }, [imgSrc, activeFilterPreset]);

  // File Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImgSrc(event.target.result);
      setPan({ x: 0, y: 0 });
      setZoom(1.0);
      setRotation(0);
      sound.success();
    };
    reader.readAsDataURL(file);
  };

  const handleResetFraming = () => {
    setPan({ x: 0, y: 0 });
    setZoom(1.0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  // Neural Reconstruct 4K Action
  const handleNeuralEnhance = async () => {
    if (!imgRef.current || isEnhancing) return;
    setIsEnhancing(true);
    sound.click();

    try {
      // Delay slightly for smooth UI transition
      await new Promise(r => setTimeout(r, 400));
      const enhanced = await enhanceImageNeural(imgRef.current, { scale: 4, lineEnhance: true });
      if (enhanced && enhanced.dataUrl) {
        setImgSrc(enhanced.dataUrl);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#00F0FF', '#FF3366', '#FFE600', '#FFFFFF']
        });
        sound.success();
      }
    } catch (err) {
      console.error('Enhancement error:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Random Vibe Generator
  const handleRandomVibe = () => {
    const presets = [
      'retro90s', 'lofi', 'cyberpunk', 'tokyo_night', 
      'noir', 'sunset', 'vaporwave', 'emerald_ghibli', 'sakura', 'matrix', 'oled', 'none'
    ];
    const randomPreset = presets[Math.floor(Math.random() * presets.length)];
    setActiveFilterPreset(randomPreset);

    const randomVig = Math.floor(Math.random() * 40) + 10;
    const randomSat = Math.floor(Math.random() * 40) - 10;
    setFilters(prev => ({
      ...prev,
      vignette: randomVig,
      saturation: randomSat
    }));

    sound.success();
  };

  // Export 4K Wallpaper
  const handleExportWallpaper = async () => {
    if (!imgRef.current) return;
    setIsExporting(true);
    try {
      await renderAndDownloadWallpaper({
        imgElement: imgRef.current,
        aspectRatio,
        pan,
        zoom,
        rotation,
        flipH,
        flipV,
        filters,
        activeFilterPreset,
        fitMode,
        activeStamp,
        stampPosition,
        scanlines,
        filename: `komorebi_wallpaper_${aspectRatio.replace(':', 'x')}.png`
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#FF3366', '#00F0FF', '#FFE600', '#FFFFFF']
      });
      sound.success();
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Export Showcase Mockup Card
  const handleExportMockup = async () => {
    if (!imgRef.current) return;
    setIsExporting(true);
    try {
      await renderAndDownloadMockupCard({
        imgElement: imgRef.current,
        aspectRatio,
        pan,
        zoom,
        rotation,
        flipH,
        flipV,
        filters,
        activeFilterPreset,
        fitMode,
        activeStamp,
        palette,
        hudStyle,
        filename: 'komorebi_showcase_mockup.png'
      });

      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.8 },
        colors: ['#FF3366', '#00F0FF', '#10B981']
      });
      sound.success();
    } catch (err) {
      console.error('Mockup export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 relative overflow-hidden ${
      isDark ? 'bg-[#090B10] cyber-grid-dark text-slate-100' : 'bg-[#F6F7F9] cyber-grid-light text-slate-800'
    }`}>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* System Manual / Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        isDark={isDark}
      />

      {/* Header Bar */}
      <Header
        isDark={isDark}
        setIsDark={setIsDark}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        scanlines={scanlines}
        setScanlines={setScanlines}
        aspectRatio={aspectRatio}
        onUploadClick={() => fileInputRef.current?.click()}
        onExportWallpaper={handleExportWallpaper}
        onExportMockup={handleExportMockup}
        onOpenHelp={() => setIsHelpOpen(true)}
        isExporting={isExporting}
      />

      {/* Interactive Main Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center relative pb-24 sm:pb-28 pt-2">
        <Viewport
          isDark={isDark}
          imgSrc={imgSrc}
          imgRef={imgRef}
          aspectRatio={aspectRatio}
          pan={pan}
          setPan={setPan}
          zoom={zoom}
          setZoom={setZoom}
          rotation={rotation}
          flipH={flipH}
          flipV={flipV}
          fitMode={fitMode}
          filters={filters}
          activeFilterPreset={activeFilterPreset}
          scanlines={scanlines}
          showHud={showHud}
          hudStyle={hudStyle}
          collisionGuard={collisionGuard}
          tiltEnabled={tiltEnabled}
          activeStamp={activeStamp}
          stampPosition={stampPosition}
          onResetFraming={handleResetFraming}
          onTriggerEnhance={handleNeuralEnhance}
          isEnhancing={isEnhancing}
          primaryColor={palette[0]?.hex || '#00F0FF'}
        />
      </main>

      {/* Bottom Floating Modular Dock */}
      <FloatingDock
        isDark={isDark}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        zoom={zoom}
        setZoom={setZoom}
        rotation={rotation}
        setRotation={setRotation}
        flipH={flipH}
        setFlipH={setFlipH}
        flipV={flipV}
        setFlipV={setFlipV}
        pan={pan}
        setPan={setPan}
        onResetFraming={handleResetFraming}
        fitMode={fitMode}
        setFitMode={setFitMode}
        filters={filters}
        setFilters={setFilters}
        activeFilterPreset={activeFilterPreset}
        setActiveFilterPreset={setActiveFilterPreset}
        palette={palette}
        showHud={showHud}
        setShowHud={setShowHud}
        collisionGuard={collisionGuard}
        setCollisionGuard={setCollisionGuard}
        tiltEnabled={tiltEnabled}
        setTiltEnabled={setTiltEnabled}
        activeStamp={activeStamp}
        setActiveStamp={setActiveStamp}
        stampPosition={stampPosition}
        setStampPosition={setStampPosition}
        onRandomVibe={handleRandomVibe}
        presets={PRESET_WALLPAPERS}
        onSelectPreset={(p) => {
          setImgSrc(p.src);
          setPan({ x: 0, y: 0 });
          setZoom(1.0);
        }}
        onUploadClick={() => fileInputRef.current?.click()}
      />
    </div>
  );
}
