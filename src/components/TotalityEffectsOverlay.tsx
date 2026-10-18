import React, { useState, useMemo } from 'react';
import { TelemetryReadout } from '../types';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

interface TotalityEffectsOverlayProps {
  telemetry: TelemetryReadout;
  currentTimestamp: number;
  forcePreview?: boolean;
}

export const TotalityEffectsOverlay: React.FC<TotalityEffectsOverlayProps> = ({
  telemetry,
  currentTimestamp,
  forcePreview = false
}) => {
  const [userEnabled, setUserEnabled] = useState<boolean>(true);
  const [manualPreview, setManualPreview] = useState<boolean>(false);

  const { obscurationPercentage, currentPhase } = telemetry;
  const isTotality = currentPhase === 'TOTALITY!' || currentPhase === "TO'LIQ TUTILISH!";
  const isDiamondRing = currentPhase === 'Diamond Ring!' || currentPhase === 'Olmos uzuk!';
  const isHighObscuration = obscurationPercentage >= 98.0;

  // Active if in totality, diamond ring, high obscuration or user clicked preview
  const isActive = userEnabled && (isTotality || isDiamondRing || isHighObscuration || forcePreview || manualPreview);

  // Intensity factor from 0 to 1 based on phase
  const intensity = useMemo(() => {
    if (manualPreview || forcePreview) return 1.0;
    if (isDiamondRing) return 1.0;
    if (isTotality) return 0.85;
    if (obscurationPercentage >= 98) {
      return (obscurationPercentage - 98) / 2; // 0 to 1
    }
    return 0;
  }, [manualPreview, forcePreview, isDiamondRing, isTotality, obscurationPercentage]);

  if (!isActive || intensity <= 0.02) {
    return (
      <div className="absolute top-16 right-4 z-40 pointer-events-auto hidden md:block">
        <button
          onClick={() => setManualPreview(!manualPreview)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 hover:bg-black/90 border border-white/20 text-[11px] font-mono text-slate-300 hover:text-amber-300 transition-all backdrop-blur-md shadow-lg"
          title="Ekran chetidagi Olmos uzuk va Beyli munchoqlari effektini sinab ko'rish"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Effekt: Olmos uzuk</span>
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden transition-opacity duration-1000 select-none">
      {/* 1. Cinematic 360-Degree Horizon Twilight Vignette along Screen Edges */}
      <div 
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: intensity,
          boxShadow: `
            inset 0 0 100px rgba(0, 0, 0, 0.9),
            inset 0 0 180px rgba(2, 6, 23, 0.85),
            inset 0 -40px 120px rgba(245, 158, 11, 0.35),
            inset 0 -15px 50px rgba(239, 68, 68, 0.3),
            inset 0 40px 100px rgba(15, 23, 42, 0.7)
          `
        }}
      />

      {/* 2. Top-Right Corner Diamond Ring Flare (Olmos Uzuk nurlari) */}
      <div 
        className="absolute -top-16 -right-16 w-80 h-80 sm:w-96 sm:h-96 md:w-[480px] md:h-[480px] pointer-events-none transition-all duration-700"
        style={{ opacity: intensity }}
      >
        {/* Diamond Core Glow */}
        <div className="absolute top-24 right-24 w-12 h-12 rounded-full bg-white shadow-[0_0_60px_#fff,0_0_120px_#67e8f9,0_0_180px_#f59e0b] animate-pulse" />
        
        {/* Prismatic Diamond Ring Lens Halo */}
        <div className="absolute top-14 right-14 w-32 h-32 rounded-full border border-cyan-300/40 shadow-[0_0_50px_rgba(56,189,248,0.5)] blur-[1px]" />
        <div className="absolute top-10 right-10 w-40 h-40 rounded-full border border-amber-300/30 shadow-[0_0_70px_rgba(245,158,11,0.4)] blur-[2px]" />

        {/* Anamorphic horizontal optical flare streak */}
        <div className="absolute top-28 right-0 w-[550px] h-[3px] bg-gradient-to-r from-transparent via-cyan-100 to-transparent blur-[0.5px] -rotate-12 opacity-80" />
        <div className="absolute top-28 right-0 w-[420px] h-[7px] bg-gradient-to-r from-transparent via-amber-200 to-transparent blur-sm -rotate-12 opacity-60" />

        {/* Vertical cross optical flare streak */}
        <div className="absolute top-0 right-28 h-[550px] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent blur-[0.5px] -rotate-12 opacity-80" />
      </div>

      {/* 3. Baily's Beads (Beyli munchoqlari) along top and lateral screen perimeter */}
      <div 
        className="absolute top-0 left-0 right-0 h-28 pointer-events-none overflow-hidden transition-opacity duration-500"
        style={{ opacity: intensity * 0.95 }}
      >
        {/* Subtle luminous lunar limb curve with glistening beads */}
        <svg className="w-full h-full opacity-90" preserveAspectRatio="none" viewBox="0 0 1000 100">
          <defs>
            <radialGradient id="beadGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="35%" stopColor="#fef08a" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="coronaArch" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.45)" />
              <stop offset="85%" stopColor="rgba(251, 191, 36, 0.7)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </linearGradient>
          </defs>

          {/* Glowing Arch */}
          <path
            d="M 50 12 Q 500 -18 950 25"
            fill="none"
            stroke="url(#coronaArch)"
            strokeWidth="2.5"
            className="blur-[1px]"
          />

          {/* Baily's Beads: A string of radiant light beads emerging through lunar valleys */}
          {/* Bead 1 */}
          <circle cx="680" cy="8" r="4.5" fill="url(#beadGlow)" className="animate-ping" style={{ animationDuration: '3s' }} />
          <circle cx="680" cy="8" r="3.2" fill="#ffffff" />

          {/* Bead 2 */}
          <circle cx="725" cy="11" r="5.2" fill="url(#beadGlow)" className="animate-pulse" style={{ animationDuration: '1.8s' }} />
          <circle cx="725" cy="11" r="3.6" fill="#ffffff" />

          {/* Bead 3 */}
          <circle cx="765" cy="14" r="4.0" fill="url(#beadGlow)" />
          <circle cx="765" cy="14" r="2.8" fill="#ffffff" />

          {/* Bead 4 (Dazzling prominent bead) */}
          <circle cx="810" cy="18" r="7.0" fill="url(#beadGlow)" className="animate-pulse" style={{ animationDuration: '1.2s' }} />
          <circle cx="810" cy="18" r="4.5" fill="#ffffff" />

          {/* Bead 5 */}
          <circle cx="848" cy="22" r="5.0" fill="url(#beadGlow)" />
          <circle cx="848" cy="22" r="3.2" fill="#ffffff" />

          {/* Bead 6 */}
          <circle cx="885" cy="26" r="4.2" fill="url(#beadGlow)" />
          <circle cx="885" cy="26" r="2.6" fill="#ffffff" />

          {/* Main Diamond Spark Anchor */}
          <circle cx="920" cy="30" r="10.0" fill="url(#beadGlow)" className="animate-pulse" style={{ animationDuration: '0.9s' }} />
          <circle cx="920" cy="30" r="6.0" fill="#ffffff" />
        </svg>
      </div>

      {/* 4. Bottom Horizon Sunset Radiance (Totality 360-degree Sunset) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-amber-600/30 via-rose-500/15 to-transparent transition-opacity duration-1000"
        style={{ opacity: intensity * 0.85 }}
      />

      {/* 5. Minimalist Scientific Phenomena Overlay Pill */}
      <div className="absolute top-16 right-4 z-40 pointer-events-auto flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-black/85 border border-amber-500/40 text-xs font-mono backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.3)] text-amber-200">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-bold tracking-wider uppercase text-[11px] text-white">
              {isTotality ? "TO'LIQ TUTILISH & TOJ" : isDiamondRing ? "OLMOS UZUK" : "BEYLI MUNCHOQLARI"}
            </span>
          </div>

          <span className="text-white/40 font-mono text-[10px]">|</span>

          <span className="text-[10px] text-amber-300/90 font-medium">
            {isTotality ? "Quyosh toji va 360° shafaq" : "Baily's Beads & Diamond Ring"}
          </span>

          <button
            onClick={() => {
              if (manualPreview) setManualPreview(false);
              else setUserEnabled(!userEnabled);
            }}
            className="ml-1 p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title={manualPreview ? "Sinov rejimini o'chirish" : (userEnabled ? "Effektni yashirish" : "Effektni yoqish")}
          >
            {userEnabled || manualPreview ? <Eye className="w-3.5 h-3.5 text-cyan-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
