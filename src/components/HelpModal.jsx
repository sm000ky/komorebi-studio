import React from 'react';
import { 
  X, Crop, Sliders, SplitSquareVertical, Sparkles, 
  ShieldAlert, Stamp, Palette, Download, HelpCircle, Terminal, Zap, Layers 
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function HelpModal({ isOpen, onClose, isDark }) {
  if (!isOpen) return null;

  const guides = [
    {
      icon: <Zap className="w-5 h-5 text-[#FFE600]" />,
      title: "Neural Reconstruct 4K",
      desc: "Tombol pintar di atas layar untuk merekonstruksi garis anime, mengunci ketajaman tepi, dan menaikkan kepadatan gambar menjadi 4K secara instan."
    },
    {
      icon: <Layers className="w-5 h-5 text-[#00F0FF]" />,
      title: "Full Art (Blur Fill) vs Crop",
      desc: "Pilih mode Full Art agar gambar landscape tampil 100% utuh tanpa kepotong, dilengkapi pendaran latar blur yang warnanya selaras."
    },
    {
      icon: <Crop className="w-5 h-5 text-[#FF3366]" />,
      title: "Framing & Layar HP",
      desc: "Geser (pan) dan perbesar (zoom) wallpaper agar komposisi karakter pas di layar. Gunakan tombol fokus cepat (Kiri/Tengah/Kanan/Atas)."
    },
    {
      icon: <Sliders className="w-5 h-5 text-emerald-400" />,
      title: "Anime Tone Filters",
      desc: "Pilih 11 tone warna: 90s Cel-Anime, Lo-Fi chill, Cyber Neon, Tokyo Midnight, Sakura, Ghibli Emerald, atau OLED Midnight."
    },
    {
      icon: <SplitSquareVertical className="w-5 h-5 text-amber-400" />,
      title: "Compare Slider (Before/After)",
      desc: "Tarik garis slider di tengah layar untuk membandingkan gambar asli (RAW) dengan hasil filter secara real-time 120 FPS."
    },
    {
      icon: <ShieldAlert className="w-5 h-5 text-rose-500" />,
      title: "Collision Guard (Zona Aman)",
      desc: "Garis batas merah muda pemandu agar mata dan kepala karakter tidak tertutup jam lockscreen & modul kamera."
    },
    {
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
      title: "3D Holo Sway & Gyro",
      desc: "Bingkai wallpaper bergoyang 3D otomatis dengan kilauan hologram pelangi saat disentuh atau saat HP digerakkan."
    },
    {
      icon: <Stamp className="w-5 h-5 text-indigo-400" />,
      title: "Anime Kanji Stamps",
      desc: "Tempelkan cap tipografi kanji studio anime (002, Neo Tokyo, Lo-Fi Rain, EVA) di 4 pilihan sudut wallpaper."
    },
    {
      icon: <Palette className="w-5 h-5 text-pink-400" />,
      title: "Palette Dock & Material You",
      desc: "Ekstrak 5 warna HEX dominan wallpaper. Salin kodenya untuk diterapkan pada widget KWGT atau launcher HP."
    },
    {
      icon: <Download className="w-5 h-5 text-[#FF3366]" />,
      title: "Export 4K & Showcase Card",
      desc: "Unduh wallpaper bersih ultra-HD atau kartu mockup lengkap dengan bezel HP dan kartu palet warna."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-xl max-h-[88vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col ${
        isDark 
          ? 'bg-[#121620] border-slate-700/80 text-slate-100 shadow-black/90' 
          : 'bg-white border-slate-200 text-slate-800 shadow-slate-300'
      }`}>
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/40 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#00F0FF]" />
            <span className="font-mono text-xs font-black tracking-wider text-[#00F0FF] uppercase">
              // KOMOREBI SYSTEM MANUAL [v2.5]
            </span>
          </div>
          <button
            onClick={() => {
              sound.click();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-slate-700/30 text-slate-400 hover:text-slate-200 active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-2.5">
          <p className="text-[11px] text-slate-400 font-mono mb-2">
            Panduan cepat memaksimalkan fitur anime wallpaper lab di layar HP kamu:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {guides.map((g, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-2xl border transition-all ${
                  isDark ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1 rounded-lg bg-slate-800/80 border border-white/10 flex-shrink-0">
                    {g.icon}
                  </div>
                  <div className="font-mono text-[11px] font-bold text-slate-200 truncate">{g.title}</div>
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed">{g.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-700/40 flex items-center justify-between bg-slate-900/30 text-[11px] font-mono text-slate-400">
          <span>TIPS: KLIK DADU (🎲) DI FILTER UNTUK TONE ACAK</span>
          <button
            onClick={() => {
              sound.click();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] font-bold border border-[#00F0FF]/30 hover:bg-[#00F0FF]/25 active:scale-95 transition-all"
          >
            MENGERTI
          </button>
        </div>

      </div>
    </div>
  );
}
