import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, Moon, Volume2, VolumeX, Tv, Download, 
  Upload, Sparkles, Terminal, ChevronDown, Check,
  Palette, Image as ImageIcon, Settings2, HelpCircle, X
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function Header({
  isDark,
  setIsDark,
  soundEnabled,
  setSoundEnabled,
  scanlines,
  setScanlines,
  aspectRatio,
  onUploadClick,
  onExportWallpaper,
  onExportMockup,
  onOpenHelp,
  isExporting
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowExportMenu(false);
        setShowSettingsMenu(false);
      }
    };
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, []);

  return (
    <header 
      ref={menuRef}
      className={`w-full border-b transition-colors duration-200 z-50 sticky top-0 ${
        isDark 
          ? 'bg-[#090B10]/90 border-slate-800/80 backdrop-blur-xl text-slate-200 shadow-lg shadow-black/20' 
          : 'bg-white/90 border-slate-200/90 backdrop-blur-xl text-slate-800 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand + Status Beacon */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00F0FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]"></span>
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono font-black tracking-wider text-sm sm:text-lg bg-gradient-to-r from-[#FF3366] via-[#FF5E86] to-[#00F0FF] bg-clip-text text-transparent">
                KOMOREBI
              </span>
              <span className="hidden sm:inline font-mono text-xs opacity-40">//</span>
              <span className="hidden xs:inline-block text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 font-mono tracking-tight font-semibold">
                STUDIO v2.0
              </span>
            </div>
          </div>

          {/* Desktop Telemetry & Lo-fi Equalizer */}
          <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-slate-700/50 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>CORE: <span className="text-emerald-400 font-semibold">GPU_ACCEL</span></span>
            </div>
            <span className="opacity-30">•</span>
            <div className="flex items-center gap-1.5">
              <span>RATIO:</span>
              <span className="px-1.5 py-0.5 rounded bg-[#FF3366]/10 text-[#FF3366] border border-[#FF3366]/30 font-bold">
                {aspectRatio}
              </span>
            </div>
            <span className="opacity-30">•</span>
            {/* Animated Equalizer */}
            <div className="flex items-end gap-0.5 h-3.5 px-1.5 py-0.5 bg-slate-900/60 rounded border border-slate-800" title="Audio Visualizer">
              <div className="w-1 bg-[#00F0FF] rounded-xs eq-bar-1" />
              <div className="w-1 bg-[#FF3366] rounded-xs eq-bar-2" />
              <div className="w-1 bg-amber-400 rounded-xs eq-bar-3" />
              <div className="w-1 bg-emerald-400 rounded-xs eq-bar-4" />
            </div>
          </div>
        </div>

        {/* Right: Actions Group */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Desktop Direct Controls */}
          <div className="hidden sm:flex items-center gap-1.5">
            {/* Help / Guide button */}
            <button
              onClick={() => {
                sound.click();
                onOpenHelp();
              }}
              title="Manual & Guide"
              className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1 transition-all active:scale-95 ${
                isDark 
                  ? 'border-slate-800 bg-slate-900/70 text-slate-300 hover:text-[#00F0FF] hover:border-[#00F0FF]/40' 
                  : 'border-slate-200 bg-slate-100 text-slate-700'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="text-[11px]">GUIDE</span>
            </button>

            {/* CRT Toggle */}
            <button
              onClick={() => {
                sound.click();
                setScanlines(!scanlines);
              }}
              title="Toggle Retro CRT Scanlines"
              className={`p-2 rounded-xl border text-xs font-mono flex items-center gap-1 transition-all active:scale-95 ${
                scanlines
                  ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : isDark
                    ? 'border-slate-800 bg-slate-900/70 text-slate-400 hover:text-slate-200'
                    : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="text-[11px]">CRT</span>
            </button>

            {/* Sound FX Toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                sound.enabled = next;
                setSoundEnabled(next);
                if (next) sound.success();
              }}
              title="Toggle Synth SFX"
              className={`p-2 rounded-xl border text-xs transition-all active:scale-95 ${
                soundEnabled
                  ? 'border-[#FF3366] bg-[#FF3366]/15 text-[#FF3366] shadow-[0_0_12px_rgba(255,51,102,0.3)]'
                  : isDark
                    ? 'border-slate-800 bg-slate-900/70 text-slate-400'
                    : 'border-slate-200 bg-slate-100 text-slate-600'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => {
                sound.click();
                setIsDark(!isDark);
              }}
              title="Toggle Theme"
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                isDark 
                  ? 'border-slate-800 bg-slate-900/70 text-amber-400 hover:bg-slate-800' 
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Mobile Settings Gear Button */}
          <button
            onClick={() => {
              sound.click();
              setShowSettingsMenu(!showSettingsMenu);
              setShowExportMenu(false);
            }}
            className={`sm:hidden p-2 rounded-xl border transition-all active:scale-95 ${
              showSettingsMenu
                ? 'border-[#00F0FF] bg-[#00F0FF]/15 text-[#00F0FF]'
                : isDark ? 'border-slate-800 bg-slate-900/80 text-slate-300' : 'border-slate-200 bg-slate-100'
            }`}
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Upload Button */}
          <button
            onClick={() => {
              sound.click();
              onUploadClick();
            }}
            title="Upload Custom Wallpaper"
            className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all active:scale-95 ${
              isDark
                ? 'border-slate-700/80 bg-slate-800/80 text-slate-200 hover:border-[#00F0FF] hover:text-[#00F0FF]'
                : 'border-slate-300 bg-slate-100 text-slate-700 hover:border-[#0284C7] hover:text-[#0284C7]'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span className="hidden xs:inline">RAW</span>
          </button>

          {/* Master Export Button (Dropdown Trigger) */}
          <div className="relative">
            <button
              onClick={() => {
                sound.click();
                setShowExportMenu(!showExportMenu);
                setShowSettingsMenu(false);
              }}
              disabled={isExporting}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#FF3366] to-[#E11D48] hover:opacity-95 active:scale-95 text-white font-mono text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-lg shadow-[#FF3366]/30 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'SAVING...' : 'EXPORT'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Export Dropdown Menu */}
            {showExportMenu && (
              <div className={`absolute right-0 mt-2 w-56 sm:w-64 rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50 ${
                isDark 
                  ? 'bg-[#121620]/95 border-slate-700/80 text-slate-200' 
                  : 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-300'
              }`}>
                <div className="px-3 py-1.5 text-[10px] font-mono text-slate-400 font-bold border-b border-slate-700/40">
                  // EXPORT RENDER ENGINE
                </div>

                <div className="p-1 space-y-1">
                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      onExportWallpaper();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#FF3366]/15 hover:text-[#FF3366] transition-colors flex items-start gap-2.5 group active:scale-95"
                  >
                    <Download className="w-4 h-4 mt-0.5 text-[#FF3366] group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-xs font-mono font-bold">Ultra-HD Wallpaper</div>
                      <div className="text-[10px] text-slate-400 font-mono">Crisp full-res clean PNG</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      onExportMockup();
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-[#00F0FF]/15 hover:text-[#00F0FF] transition-colors flex items-start gap-2.5 group active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 mt-0.5 text-[#00F0FF] group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-xs font-mono font-bold">Showcase Mockup Card</div>
                      <div className="text-[10px] text-slate-400 font-mono">With phone bezel & color dock</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Settings Dropdown */}
            {showSettingsMenu && (
              <div className={`sm:hidden absolute right-0 mt-2 w-52 rounded-2xl border p-2.5 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-50 ${
                isDark ? 'bg-[#121620]/95 border-slate-700 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'
              }`}>
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 font-bold border-b border-slate-700/40 mb-2">
                  // QUICK TOGGLES
                </div>
                
                <div className="space-y-1 text-xs font-mono">
                  {/* Guide */}
                  <button
                    onClick={() => {
                      sound.click();
                      setShowSettingsMenu(false);
                      onOpenHelp();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 active:scale-95 transition-all text-[#00F0FF]"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Panduan Fitur
                    </span>
                    <span className="font-bold">BUKA</span>
                  </button>

                  {/* CRT Scanline */}
                  <button
                    onClick={() => {
                      sound.click();
                      setScanlines(!scanlines);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 active:scale-95 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Tv className="w-3.5 h-3.5 text-[#00F0FF]" />
                      CRT Scanlines
                    </span>
                    <span className={scanlines ? 'text-[#00F0FF] font-bold' : 'text-slate-500'}>
                      {scanlines ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Sound FX */}
                  <button
                    onClick={() => {
                      const next = !soundEnabled;
                      sound.enabled = next;
                      setSoundEnabled(next);
                      if (next) sound.success();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 active:scale-95 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Volume2 className="w-3.5 h-3.5 text-[#FF3366]" />
                      Synth Audio
                    </span>
                    <span className={soundEnabled ? 'text-[#FF3366] font-bold' : 'text-slate-500'}>
                      {soundEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Theme */}
                  <button
                    onClick={() => {
                      sound.click();
                      setIsDark(!isDark);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-700/30 active:scale-95 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                      Appearance
                    </span>
                    <span className="text-slate-400 font-bold">
                      {isDark ? 'DARK' : 'LIGHT'}
                    </span>
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
