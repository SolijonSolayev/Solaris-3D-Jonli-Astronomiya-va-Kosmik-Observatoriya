import React, { useState, useEffect } from 'react';
import { RotateCcw, Maximize2, Minimize2, Info, Dna, Radio, ShieldCheck } from 'lucide-react';
import { formatUzbekDate, getLiveTimeForOffset } from '../utils/astronomy';
import { AudioControls } from './AudioControls';

interface HeaderClocksProps {
  currentTimestamp?: number;
  liveDate?: Date;
  onResetCamera?: () => void;
  onOpenInfo?: () => void;
  onOpenBioscience?: () => void;
  appMode?: string;
  onToggleMode?: (mode: any) => void;
}

export const HeaderClocks: React.FC<HeaderClocksProps> = ({
  liveDate = new Date(),
  onResetCamera,
  onOpenInfo,
  onOpenBioscience,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const tashkentTime = getLiveTimeForOffset(liveDate, 5);
  const spainTime = getLiveTimeForOffset(liveDate, 2);
  const icelandTime = getLiveTimeForOffset(liveDate, 0);
  const greenlandTime = getLiveTimeForOffset(liveDate, -1);
  const utcTime = getLiveTimeForOffset(liveDate, 0);
  const displayDateStr = formatUzbekDate(liveDate);

  return (
    <header className="w-full bg-black border-b border-white/15 px-2.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between z-30 text-white font-sans select-none shrink-0 shadow-2xl relative">
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2 pr-3 border-r border-white/15">
          <img
            src="/logo.svg"
            alt="Solaris 3D logo"
            className="h-10 w-auto object-contain drop-shadow-[0_0_18px_rgba(122,185,255,0.7)]"
          />
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.35)] text-[11px] font-mono font-bold tracking-[0.18em] uppercase">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="inline">REAL VAQT</span>
        </div>

        <button
          onClick={onOpenInfo}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-semibold tracking-[0.18em] uppercase transition-all duration-200"
          title="Xavfsizlik & Maxfiylik: 0 ta ochiq API kalit, foydalanuvchi koordinatalari faqat lokal xotirada (RAM)"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>MAXFIY & XAVFSIZ</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center flex-nowrap gap-2.5 sm:gap-5 md:gap-7 lg:gap-9 min-w-0 px-2 overflow-x-auto scrollbar-none">
        <div className="shrink-0 flex items-center gap-1.5 text-[11px] sm:text-xs md:text-sm font-semibold tracking-wider uppercase whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse hidden md:inline-block shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-emerald-300 font-bold font-mono">
            {displayDateStr}
          </span>
        </div>

        <div className="flex items-center shrink-0">
          <span className="text-sm sm:text-lg md:text-xl leading-none select-none drop-shadow-sm mr-1 sm:mr-1.5" role="img" aria-label="O'zbekiston bayrog'i">
            🇺🇿
          </span>
          <span className="text-sm sm:text-base md:text-xl font-bold text-white tracking-tight leading-none tabular-nums font-mono">
            {tashkentTime.timeStr}
          </span>
          <div className="ml-1 flex flex-col justify-center text-left leading-[1.05] shrink-0">
            <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-amber-400 tracking-tight uppercase leading-none">
              {tashkentTime.ampm}
            </span>
            <span className="text-[7px] sm:text-[8px] md:text-[9px] font-semibold text-slate-300 tracking-tight uppercase leading-none mt-0.5">
              UZT
            </span>
          </div>
        </div>

        <div className="flex items-center shrink-0">
          <span className="text-sm sm:text-lg md:text-xl leading-none select-none drop-shadow-sm mr-1 sm:mr-1.5" role="img" aria-label="Ispaniya bayrog'i">
            🇪🇸
          </span>
          <span className="text-sm sm:text-base md:text-xl font-bold text-white tracking-tight leading-none tabular-nums font-mono">
            {spainTime.timeStr}
          </span>
          <div className="ml-1 flex flex-col justify-center text-left leading-[1.05] shrink-0">
            <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-white tracking-tight uppercase leading-none">
              {spainTime.ampm}
            </span>
            <span className="text-[7px] sm:text-[8px] md:text-[9px] font-semibold text-slate-300 tracking-tight uppercase leading-none mt-0.5">
              CEST
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center shrink-0">
          <span className="text-sm sm:text-lg md:text-xl leading-none select-none drop-shadow-sm mr-1 sm:mr-1.5" role="img" aria-label="Islandiya bayrog'i">
            🇮🇸
          </span>
          <span className="text-sm sm:text-base md:text-xl font-bold text-white tracking-tight leading-none tabular-nums font-mono">
            {icelandTime.timeStr}
          </span>
          <div className="ml-1 flex flex-col justify-center text-left leading-[1.05] shrink-0">
            <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-white tracking-tight uppercase leading-none">
              {icelandTime.ampm}
            </span>
            <span className="text-[7px] sm:text-[8px] md:text-[9px] font-semibold text-slate-300 tracking-tight uppercase leading-none mt-0.5">
              GMT
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center shrink-0">
          <span className="text-sm sm:text-lg md:text-xl leading-none select-none drop-shadow-sm mr-1 sm:mr-1.5" role="img" aria-label="Grenlandiya bayrog'i">
            🇬🇱
          </span>
          <span className="text-sm sm:text-base md:text-xl font-bold text-white tracking-tight leading-none tabular-nums font-mono">
            {greenlandTime.timeStr}
          </span>
          <div className="ml-1 flex flex-col justify-center text-left leading-[1.05] shrink-0">
            <span className="text-[8px] sm:text-[9px] md:text-[10px] font-bold text-white tracking-tight uppercase leading-none">
              {greenlandTime.ampm}
            </span>
            <span className="text-[7px] sm:text-[8px] md:text-[9px] font-semibold text-slate-300 tracking-tight uppercase leading-none mt-0.5">
              WGST
            </span>
          </div>
        </div>

        <div className="hidden xl:flex items-center shrink-0 bg-white/5 border border-white/10 px-2.5 py-1 rounded">
          <span className="text-[10px] text-slate-400 font-mono mr-1.5 font-bold">UTC:</span>
          <span className="text-xs font-bold text-cyan-300 font-mono tabular-nums">
            {utcTime.timeStr}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
        <AudioControls />

        {onOpenBioscience && (
          <button
            onClick={onOpenBioscience}
            className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-sm bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-amber-500/20 hover:from-cyan-500/30 hover:to-amber-500/30 text-cyan-100 hover:text-white border border-cyan-500/40 transition-all duration-200"
            title="Biologik ta'sirlar, sirkad ritmlar va Google Search grounding tahlili"
          >
            <Dna className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden sm:inline">Biosfera & Ilm</span>
            <span className="sm:hidden">Ilm</span>
          </button>
        )}

        {onOpenInfo && (
          <button
            onClick={onOpenInfo}
            className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-sm bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-200 hover:text-white border border-cyan-500/40 hover:border-cyan-400/60 transition-all duration-200"
            title="Loyiha tavsifi, real vaqt astronomik parametrlari va manbalar"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="inline">Ma'lumot</span>
          </button>
        )}

        {onResetCamera && (
          <button
            onClick={onResetCamera}
            className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-sm bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/15 hover:border-white/30 transition-all duration-200"
            title="Kamerani va avto-kuzatuvni tiklash"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Tiklash</span>
          </button>
        )}

        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-sm bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/15 hover:border-white/30 transition-all duration-200"
          title={isFullscreen ? "To'liq ekrandan chiqish" : "To'liq ekranga o'tish"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-3 h-3 text-amber-400" />
          ) : (
            <Maximize2 className="w-3 h-3 text-amber-400" />
          )}
          <span className="hidden sm:inline">{isFullscreen ? 'Kichraytirish' : 'To\'liq ekran'}</span>
        </button>
      </div>
    </header>
  );
};
