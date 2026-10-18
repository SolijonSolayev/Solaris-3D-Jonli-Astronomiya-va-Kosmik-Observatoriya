import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Database,
  Globe,
  Compass,
  BookOpen,
  Layers,
  Sparkles,
  Sun,
  Moon,
  Clock,
  Navigation,
  Eye,
  Sliders,
  Flame,
  Info,
  ShieldCheck,
  Lock,
  Key,
  Server,
  EyeOff
} from 'lucide-react';

interface AttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalTab = 'overview' | 'optical' | 'guide' | 'algorithms' | 'sources' | 'security';

interface SourceItem {
  name: string;
  organization: string;
  description: string;
  url?: string;
  badge: string;
}

const ASTRONOMY_SOURCES: SourceItem[] = [
  {
    name: 'NASA GSFC Quyosh tutilishi byulletenlari va Besselyan elementlari',
    organization: 'NASA Goddard kosmik parvozlar markazi',
    description:
      'Quyosh tutilishlari uchun rasmiy Besselyan elementlari, umbra soyasining tezlik vektorlari, kontakt vaqtlari (C1–C4), markaziy chiziq davomiyligi va Saros efemerid hisob-kitoblari.',
    url: 'https://eclipse.gsfc.nasa.gov/solar.html',
    badge: 'NASA GSFC',
  },
  {
    name: 'Interaktiv Quyosh tutilishi hisoblari va markaziy chiziq jadvallari',
    organization: 'Xavier M. Jubier / Xalqaro Astronomiya Ittifoqi (IAU)',
    description:
      'Yuqori aniqlikdagi to\'liq tutilish yo\'li koordinatalari, umbra soyasi kengligi, Grenlandiya, Islandiya, Ispaniya va Balear dengizi bo\'ylab mahalliy sharoitlar jadvallari.',
    url: 'http://xjubier.free.fr/en/site_pages/solar_eclipses/TSE_2026_GoogleMapFull.html',
    badge: 'Efemerid',
  },
  {
    name: 'Tutilish bashoratlari va yo\'l geometriyasi',
    organization: 'Fred Espenak (Mr. Eclipse)',
    description:
      'Toposentrik tutilish kattaligi (magnituda), qoplanish formulalari, quyosh balandligi/azimut geometriyasi va to\'liq tutilish fazalari.',
    url: 'https://www.mreclipse.com/',
    badge: 'Prognozlar',
  },
];

const ALGORITHM_SOURCES: SourceItem[] = [
  {
    name: 'Astronomik Algoritmlar (2-nashr)',
    organization: 'Jean Meeus (Willmann-Bell)',
    description:
      'Grinvich o\'rtacha yulduz vaqti (GMST), Quyoshning to\'g\'ri chiqishi (RA) va og\'ishi (Dec), Oy fazalari va yoritilganlik darajasi, atmosfera refraksiyasi hamda sferik segment formulalari.',
    badge: 'Algoritmlar',
  },
  {
    name: 'Yer orientatsiyasi va koordinata tizimlari',
    organization: 'AQSH Dengiz Observatoriyasi (USNO) / IAU SOFA',
    description:
      'Yer o\'qining og\'ish burchagi (23.44°), subsolyar nuqtaning geografik koordinatalari hamda kunduz/tun quyosh terminatori vektor geometriyasining standart hisoblari.',
    url: 'https://www.usno.navy.mil/',
    badge: 'Geodeziya',
  },
];

const CARTOGRAPHY_SOURCES: SourceItem[] = [
  {
    name: 'NASA Visible Earth (Blue Marble & Black Marble)',
    organization: 'NASA Yer Observatoriyasi',
    description:
      'Yuqori aniqlikdagi quruqlik sathi teksturalari, batimetriya, atmosferadagi Reley sochilish modellari hamda tungi shahar chiroqlari ma\'lumotlari.',
    url: 'https://visibleearth.nasa.gov/',
    badge: 'Teksturalar',
  },
  {
    name: 'Natural Earth kartografik ma\'lumotlar to\'plami',
    organization: 'Natural Earth / Ommaviy mulk',
    description:
      'Grenlandiya, Islandiya va Ispaniyadagi kuzatuv stansiyalari uchun global qirg\'oq chiziqlari, davlat chegaralari va hududiy metama\'lumotlar.',
    url: 'https://www.naturalearthdata.com/',
    badge: 'Chegaralar',
  },
  {
    name: 'Three.js WebGL 3D dvigateli',
    organization: 'Three.js mualliflari',
    description:
      'Real vaqtda GPU-tezlatilgan 3D sayyoraviy renderlash, nurlar kesishuvi (raycasting), dinamik yoritish, matritsali transformatsiyalar va atmosfera shaderlari.',
    url: 'https://threejs.org/',
    badge: 'Grafika',
  },
];

export const AttributionModal: React.FC<AttributionModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('overview');

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#080b11] border border-cyan-500/30 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] w-full max-w-4xl max-h-[90vh] flex flex-col text-slate-200 overflow-hidden font-sans select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-mono font-bold tracking-wider text-white uppercase">
                  Loyiha haqida va Ilmiy Ma'lumotlar
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  Saros 126 & Real-Time
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                2026-yilgi To'liq Quyosh Tutilishi, Jonli Astronomiya, Diamond Ring & Baily's Beads
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Yopish (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-white/10 bg-black/40 overflow-x-auto scrollbar-none font-mono text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap font-semibold ${
              activeTab === 'overview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Loyiha & Rejimlar</span>
          </button>

          <button
            onClick={() => setActiveTab('optical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap font-semibold ${
              activeTab === 'optical'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Optik Hodisalar (Diamond Ring)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap font-semibold ${
              activeTab === 'guide'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Qo'llanma & Boshqaruv</span>
          </button>

          <button
            onClick={() => setActiveTab('algorithms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap font-semibold ${
              activeTab === 'algorithms'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Matematika & Efemeridlar</span>
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap font-semibold ${
              activeTab === 'sources'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Rasmiy Manbalar</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap font-semibold ${
              activeTab === 'security'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Xavfsizlik & Maxfiylik</span>
          </button>
        </div>

        {/* Modal Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900/60 to-purple-950/40 border border-cyan-500/30 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
                  <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
                    Jonli Astronomiya va 3D Kosmik Observatoriya
                  </h3>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Ushbu interaktiv ilmiy tizim real vaqt rejimida Yer sharidagi Quyosh va Oyning ayni damdagi holatini,
                  subsolyar zenit nuqtasini, kunduz/tun chegarasini hamda To'liq Quyosh Tutilishi optik effektlarini (Olmos uzuk va Beyli marjonlari)
                  yuqori aniqlikdagi 3D WebGL muhitida modellashtiradi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Feature 1: Real-time Live Mode */}
                <div className="bg-black/50 border border-rose-500/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <h4 className="font-mono font-bold text-rose-300 text-xs uppercase tracking-wider">
                        Jonli Real Vaqt Telemetriyasi
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800/60 text-rose-300">
                      UZLUKSIZ
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Hozirgi sana va real sekundlar bo'yicha Yer sharidagi kunduz/kecha terminatori, Quyoshning ayni damdagi subsolyar nuqtasi (zenit koordinatalari),
                    Oy fazasi (Sinodik davr hisoblari) va uning yoritilish darajasi (illumination %) hamda shahar soatlarini real vaqtda aks ettiradi.
                  </p>
                </div>

                {/* Feature 2: 3D Celestial Geodesy */}
                <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      <h4 className="font-mono font-bold text-cyan-300 text-xs uppercase tracking-wider">
                        3D Sayyoraviy Geodeziya
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60 text-cyan-300">
                      WEBGL 3D
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Three.js GPU dvigateli orqali Yer sathi, Rayleigh atmosfera sochilish nurlanishi, shahar chiroqlari hamda Quyosh va Oy nurlari
                    dinamik tarzda aylanuvchi 3D globusda hisoblab ko'rsatiladi.
                  </p>
                </div>
              </div>

              {/* Core Features Overview */}
              <div className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-3">
                <h4 className="font-mono text-xs uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Dasturdagi Asosiy Imkoniyatlar</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                    <span className="font-bold text-white block mb-1">🌍 3D Yer va Atmosfera</span>
                    <span className="text-slate-400">Rayleigh sochilish shaderi, shahar chiroqlari, umbra va penumbra tutilish konuslari.</span>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                    <span className="font-bold text-white block mb-1">💎 Olmos Uzuk & Marjonlar</span>
                    <span className="text-slate-400">Totality fazasida Diamond Ring, Baily's Beads, Quyosh toji va xromosfera chaqnashi.</span>
                  </div>
                  <div className="p-3 bg-white/[0.02] border border-white/5 rounded">
                    <span className="font-bold text-white block mb-1">🔬 Biosfera & Gemini AI</span>
                    <span className="text-slate-400">Google Search grounding va Gemini AI orqali biologik hamda ekologik ta'sirlarni tahlil qilish.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPTICAL PHENOMENA */}
          {activeTab === 'optical' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-cyan-950/30 border border-amber-500/40 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                  <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
                    To'liq Tutilishning Betakror Optik Hodisalari
                  </h3>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  To'liq Quyosh tutilishi (Totality) davrida Quyosh diskining deyarli 100% yopilishi natijasida insoniyat tarixidagi eng hayratlanarli
                  tabiiy nur va relyef hodisalari yuzaga keladi. Ushbu ilova ushbu effektlarni real vaqt rejimida ekran chetlarida simulyatsiya qiladi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Diamond Ring */}
                <div className="bg-black/60 border border-amber-500/30 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-300 font-mono font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>1. Diamond Ring (Olmos Uzuk)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    To'liq tutilish boshlanishidan (C2 kontakt) taxminan 5–10 soniya oldin va to'liq faza yakunlangach (C3 kontakt),
                    Quyosh toji qorong'u Oy atrofida ingichka yorug' uzuk kabi nurlanadi. Bir nuqtada Quyoshning so'nggi yorug' nurlari to'planib,
                    ko'zni qamashtiruvchi yarqiragan olmos toshdek chaqnaydi.
                  </p>
                  <div className="p-2.5 bg-amber-950/30 border border-amber-800/40 rounded text-[11px] text-amber-200/90 font-mono">
                    ✦ <span className="font-bold">Effekt parametrlari:</span> Yorqin nurlar nurlanishi (anamorphic lens flare), yorug'lik chaqnashi va xromosferaning binafsha-qizil nuri.
                  </div>
                </div>

                {/* 2. Baily's Beads */}
                <div className="bg-black/60 border border-cyan-500/30 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-cyan-300 font-mono font-bold text-xs uppercase tracking-wider">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span>2. Baily's Beads (Beyli Marjonlari)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    1836-yilda ingliz astronomi Frensis Beyli tomonidan ilmiy tavsiflangan. Oy sathi silliq shar emas, balki baland tog' tizmalari,
                    ulkan kraterlar va chuqur vodiylardan iborat. Quyoshning so'nggi qirralari ushbu relyef chuqurliklari orqali sizib o'tganda marjon donalari kabi porlaydi.
                  </p>
                  <div className="p-2.5 bg-cyan-950/30 border border-cyan-800/40 rounded text-[11px] text-cyan-200/90 font-mono">
                    ✦ <span className="font-bold">Effekt parametrlari:</span> Oy diski qirrasi bo'ylab 8 ta alohida pulsatsiyalanuvchi marjonsimon nur nuqtalari.
                  </div>
                </div>

                {/* 3. Solar Corona */}
                <div className="bg-black/60 border border-purple-500/30 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-purple-300 font-mono font-bold text-xs uppercase tracking-wider">
                    <Sun className="w-4 h-4 text-purple-400" />
                    <span>3. Quyosh Toji (Solar Corona)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Quyosh atmosferasining eng tashqi qatlami bo'lib, millionlab daraja haroratdagi ionlashgan plazmadan iborat.
                    Kunduzgi kuchli yorug'lik sabab odatiy vaqtda ko'rinmaydi; faqat 100% to'liq tutilish lahzalarida oq-marvarid nurlar ko'rinishida kosmosga tarqaladi.
                  </p>
                </div>

                {/* 4. Chromosphere & Prominences */}
                <div className="bg-black/60 border border-rose-500/30 rounded-lg p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-300 font-mono font-bold text-xs uppercase tracking-wider">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>4. Xromosfera va Protuberanslar</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Oy diski orqasidan ko'rinadigan qizil-yoqut rangdagi vodorod plazmasi (H-alfa nurlanishi, 656.3 nm).
                    Quyosh magnit maydoni bo'ylab otiluvchi ulkan alangalar va protuberanslar to'liq tutilishning eng jozibali qismidir.
                  </p>
                </div>
              </div>

              {/* How to activate in app */}
              <div className="p-4 bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                    Effektlarni amalda sinab ko'rish
                  </span>
                  <span className="text-xs text-slate-300">
                    Palma de Mallorca stansiyasini tanlab to'liq tutilish lahzasiga o'ting yoki Sky View panelidagi "Effektlarni sinash" tugmasini bosing.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GUIDE & CONTROLS */}
          {activeTab === 'guide' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-slate-900/60 border border-emerald-500/30 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <Navigation className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
                    Ilovani Boshqarish va Foydalanish Qo'llanmasi
                  </h3>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Interfeys kosmik parvozlarni boshqarish markazi (Mission Control) uslubida yaratilgan bo'lib, har bir modul qulay tarzda joylashtirilgan.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-black/50 border border-white/10 rounded-lg p-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 shrink-0 font-mono text-xs font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-mono font-bold text-white text-xs uppercase mb-1">
                      Yuqori Rejim Almashinuvi: "Jonli Vaqt" ⇄ "2026 Tutilish"
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Ekranning yuqori chap burchagidagi tugmalar orqali istalgan vaqtda bugungi real vaqt astronomik holatiga yoki
                      2026-yil 12-avgust tutilish simulyatsiyasiga bir zumda o'tishingiz mumkin.
                    </p>
                  </div>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-lg p-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 font-mono text-xs font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-mono font-bold text-white text-xs uppercase mb-1">
                      3D Globus Kamerasi va Avto-kuzatuv
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Sichqonchaning chap tugmasi bilan globusni aylantiring, o'ng tugma bilan suring, g'ildirakcha bilan yaqinlashtiring.
                      Pastdagi "Soyani kuzatish" (Follow Shadow) kamerasi Oy soyasi orqasidan dinamik ergashadi.
                      Klaviatura <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-cyan-300 font-mono text-[10px]">Space</kbd> tugmasi Ispaniya umumiy rejasini tezkor tiklaydi.
                    </p>
                  </div>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-lg p-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 font-mono text-xs font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-mono font-bold text-white text-xs uppercase mb-1">
                      Vaqt Shkalasi va Tezlikni Boshqarish (Timeline)
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Simulyatsiya rejimida pastki slaydurni surib tutilishning istalgan soniyasiga (15:30 dan 18:30 UTC gacha) o'tishingiz mumkin.
                      Tezlikni 1x dan 300x gacha oshirish imkoni mavjud.
                    </p>
                  </div>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-lg p-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 font-mono text-xs font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-mono font-bold text-white text-xs uppercase mb-1">
                      Sky View (Yerustidan Qarash Paneli)
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      O'ng pastki burchakdagi panel tanlangan stansiyadagi kuzatuvchining ko'zi bilan osmonni ko'rsatadi:
                      Quyosh balandligi, azimuti, kunduzgi moviy osmondan shafaq va qorong'u yulduzli tutilish osmoniga o'tish dinamikasi.
                    </p>
                  </div>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-lg p-3.5 flex items-start gap-3">
                  <div className="w-7 h-7 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 font-mono text-xs font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="font-mono font-bold text-white text-xs uppercase mb-1">
                      Ixtiyoriy Koordinata Qo'yish (Custom Pin)
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Globusning istalgan joyiga sichqoncha bilan bosib, shaxsiy kuzatuv nuqtangizni qo'yishingiz va o'sha yerda tutilish qanday ko'rinishini hisoblab chiqishingiz mumkin.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MATHEMATICAL ALGORITHMS & EPHEMERIS */}
          {activeTab === 'algorithms' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="bg-slate-900/60 border border-purple-500/30 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <Compass className="w-5 h-5 text-purple-400" />
                  <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
                    Astronomik Algoritmlar va Matematik Formulalar
                  </h3>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Dastur barcha astronomik hisob-kitoblarni Jean Meeus va NASA GSFC rasmiy efemerid tenglamalari asosida mijoz qurilmasida to'g'ridan-to'g'ri hisoblaydi.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-black/50 border border-white/10 rounded-lg p-4 space-y-2">
                  <h4 className="font-mono font-bold text-cyan-300 text-xs uppercase">
                    1. Subsolyar Nuqta va Quyosh Deklinatsiyasi
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Yer sharida Quyosh aynan zenitda turgan geografik kenglik va uzunlik:
                  </p>
                  <div className="bg-slate-950 p-3 rounded font-mono text-[11px] text-cyan-200 border border-cyan-500/20">
                    Declination: δ ≈ -23.44° × cos((360° / 365) × (Kun + 10))<br />
                    Longitude: λ = -((UTC_soat + UTC_min/60) × 15° - 180°) + EoT
                  </div>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-lg p-4 space-y-2">
                  <h4 className="font-mono font-bold text-amber-300 text-xs uppercase">
                    2. Oy Fazalari va Sinodik Oy Davri
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Yangi oydan keyingi fazalar 29.53058867 kunlik sinodik davr bo'yicha aniqlanadi:
                  </p>
                  <div className="bg-slate-950 p-3 rounded font-mono text-[11px] text-amber-200 border border-amber-500/20">
                    Phase Angle: θ = (Kunlar_farqi % 29.53058867) / 29.53058867 × 2π<br />
                    Illumination: k = (1 - cos(θ)) / 2 × 100%
                  </div>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-lg p-4 space-y-2">
                  <h4 className="font-mono font-bold text-emerald-300 text-xs uppercase">
                    3. Besselyan Elementlari va Umbra Geometriyasi (NASA GSFC)
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Tutilishning fundamental tekislikdagi koordinatalari (x, y, d, μ, l1, l2):
                    Umbra soyasi diametri 110–300 km, soyasining yer sirtidagi harakat tezligi esa 0.8–2.5 km/sekund (taxminan 3000–9000 km/soat).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL SOURCES & ATTRIBUTION */}
          {activeTab === 'sources' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Section 1: Astronomy Ephemeris */}
              <div>
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-white/10 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Quyosh tutilishi efemeridlari va Besselyan elementlari</span>
                </div>
                <div className="space-y-3">
                  {ASTRONOMY_SOURCES.map((src, i) => (
                    <div
                      key={i}
                      className="bg-black/50 border border-white/10 rounded p-3.5 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <span className="font-semibold text-white text-sm">{src.name}</span>
                          <div className="text-[11px] text-slate-400 font-mono">{src.organization}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-[10px] font-mono font-semibold uppercase tracking-wider">
                            {src.badge}
                          </span>
                          {src.url && (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
                              title="Rasmiy manbani yangi oynada ochish"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{src.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 2: Mathematical Algorithms */}
              <div>
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-white/10 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Matematik modellar va astronomik algoritmlar</span>
                </div>
                <div className="space-y-3">
                  {ALGORITHM_SOURCES.map((src, i) => (
                    <div
                      key={i}
                      className="bg-black/50 border border-white/10 rounded p-3.5 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <span className="font-semibold text-white text-sm">{src.name}</span>
                          <div className="text-[11px] text-slate-400 font-mono">{src.organization}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[10px] font-mono font-semibold uppercase tracking-wider">
                            {src.badge}
                          </span>
                          {src.url && (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-400 hover:text-amber-300 transition-colors"
                              title="Rasmiy manbani yangi oynada ochish"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{src.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Geodesy, Textures & Technology */}
              <div>
                <div className="flex items-center gap-2 pb-2 mb-3 border-b border-white/10 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Kartografiya, teksturalar va 3D WebGL dvigateli</span>
                </div>
                <div className="space-y-3">
                  {CARTOGRAPHY_SOURCES.map((src, i) => (
                    <div
                      key={i}
                      className="bg-black/50 border border-white/10 rounded p-3.5 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <span className="font-semibold text-white text-sm">{src.name}</span>
                          <div className="text-[11px] text-slate-400 font-mono">{src.organization}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-[10px] font-mono font-semibold uppercase tracking-wider">
                            {src.badge}
                          </span>
                          {src.url && (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-slate-400 hover:text-emerald-300 transition-colors"
                              title="Rasmiy manbani yangi oynada ochish"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{src.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SECURITY & PRIVACY */}
          {activeTab === 'security' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Header Card */}
              <div className="bg-gradient-to-r from-rose-950/40 via-slate-900/60 to-cyan-950/40 border border-rose-500/30 rounded-xl p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-2">
                  <ShieldCheck className="w-5 h-5 text-rose-400" />
                  <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
                    Maxfiylik Siyosati va Xavfsizlik Kafolatlari
                  </h3>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Ushbu observatoriya platformasi foydalanuvchilarning shaxsiy ma'lumotlari daxlsizligi va tizim xavfsizligini ta'minlash uchun qat'iy xavfsizlik standartlariga muvofiq ishlab chiqilgan.
                </p>
              </div>

              {/* Security Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Secrets & API Keys Audit */}
                <div className="bg-black/50 border border-white/10 rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="font-mono font-bold text-xs uppercase text-amber-300 flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      <span>Maxfiy Kalitlar Auditi</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase">
                      Auditi: Toza
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Ilovada biron bir ochiq API kaliti, shaxsiy token yoki ma'lumotlar bazasi paroli mavjud emas. Gemini API kaliti faqatgina server orqasida (Node.js/Express) saqlanadi va mijoz (brauzer) kodiga hech qachon chiqmaydi (0 ta mijoz siri).
                  </p>
                  <div className="mt-auto pt-2 text-[11px] font-mono text-slate-400">
                    Himoya: Server-side proxy va <code className="text-amber-300">.env*</code> to'liq gitignore qilingan.
                  </div>
                </div>

                {/* 2. User Location Privacy */}
                <div className="bg-black/50 border border-white/10 rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="font-mono font-bold text-xs uppercase text-cyan-300 flex items-center gap-2">
                      <EyeOff className="w-4 h-4 text-cyan-400" />
                      <span>Lokal Xotira & Joylashuv Maxfiyligi</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold uppercase">
                      100% In-Memory
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Siz tanlagan observatoriya shaharlari yoki 3D globusda belgilangan maxsus koordinatalar (Custom Pin) faqatgina brauzeringiz tezkor xotirasida (RAM) vaqtincha saqlanadi. Ular serverga yoki uchinchi tomonga jo'natilmaydi va saqlanmaydi.
                  </p>
                  <div className="mt-auto pt-2 text-[11px] font-mono text-slate-400">
                    Holat: Sahifa yopilganda barcha koordinatalar xotiradan avtomatik tozalanadi.
                  </div>
                </div>

                {/* 3. Zero-Tracking & Cookie-Free */}
                <div className="bg-black/50 border border-white/10 rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="font-mono font-bold text-xs uppercase text-emerald-300 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-400" />
                      <span>Kuzatuvsiz & Cookie-Free</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase">
                      No Trackers
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Platformada hech qanday foydalanuvchi xatti-harakatlarini kuzatuvchi uchinchi tomon skriptlari (Google Analytics, reklamalar, telemetriya) va marketing cookielari ishlatilmaydi. Hech qanday shaxsiy profil shakllantirilmaydi.
                  </p>
                  <div className="mt-auto pt-2 text-[11px] font-mono text-slate-400">
                    Kafolat: Brauzerda hech qanday shaxsiy kuzatuv fiksatsiyasi yo'q.
                  </div>
                </div>

                {/* 4. Server Hardening & Rate Limiting */}
                <div className="bg-black/50 border border-white/10 rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="font-mono font-bold text-xs uppercase text-rose-300 flex items-center gap-2">
                      <Server className="w-4 h-4 text-rose-400" />
                      <span>Server Himoyasi & Cheklovlar</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold uppercase">
                      Faol Himoya
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Server darajasida xavfsizlik sarlavhalari (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy) o'rnatilgan. So'rovlar soni me'yori (Rate Limiting) va kiritish ma'lumotlarini sanitizatsiya qilish orqali DoS hamda bot hujumlaridan himoyalangan.
                  </p>
                  <div className="mt-auto pt-2 text-[11px] font-mono text-slate-400">
                    Parametr: 64KB qat'iy yuklama chegarasi va daqiqasiga 40 ta so'rov limiti.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-slate-950/80 font-mono text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Solaris 3D • Real Vaqt Jonli Astronomiya & Optik Simulyatsiyasi</span>
            <span className="sm:hidden">Solaris 3D • Jonli Astronomiya</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-medium transition-colors uppercase tracking-wider text-[11px]"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
