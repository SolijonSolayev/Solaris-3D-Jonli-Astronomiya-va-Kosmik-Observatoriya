import React from 'react';
import { formatSecondsToUTC } from '../utils/astronomy';
import { Radio, RefreshCw, Sun, Moon, Compass, Sparkles } from 'lucide-react';
import { LiveAstronomyData } from '../types';

interface TimelineScrubberProps {
  currentTimestamp: number;
  isPlaying: boolean;
  speedMultiplier: number;
  onTimeChange: (newTime: number) => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
  liveDate?: Date;
  liveData?: LiveAstronomyData;
  isLiveLocked?: boolean;
  onLockToLive?: () => void;
}

export const TimelineScrubber: React.FC<TimelineScrubberProps> = ({
  currentTimestamp,
  onTimeChange,
  liveDate = new Date(),
  liveData,
  isLiveLocked = true,
  onLockToLive,
}) => {
  const currentUTCSeconds = liveDate.getUTCHours() * 3600 + liveDate.getUTCMinutes() * 60 + liveDate.getUTCSeconds();
  const displaySeconds = isLiveLocked ? currentUTCSeconds : currentTimestamp;

  const hours = Math.floor(displaySeconds / 3600);
  const minutes = Math.floor((displaySeconds % 3600) / 60);
  const seconds = Math.floor(displaySeconds % 60);
  const timeFormatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} UTC`;

  const progressPercent = (displaySeconds / 86400) * 100;

  return (
    <div className="w-full bg-[#050505]/95 backdrop-blur-2xl border-t border-rose-500/30 px-3 py-2.5 md:px-6 md:py-3.5 flex flex-wrap items-center justify-between gap-3 z-30 text-slate-200 font-sans select-none shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl mx-auto font-mono gap-3">
        {/* Left: Live Status and UTC Clock */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.35)]">
            <span className={`w-2.5 h-2.5 rounded-full ${isLiveLocked ? 'bg-rose-500 animate-ping' : 'bg-slate-400'}`} />
            <span className="text-xs md:text-sm font-bold text-rose-300 tracking-wider uppercase">
              {isLiveLocked ? 'JONLI REAL VAQT' : 'VAQTNI KO\'ZDAN KECHIRISH'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-200 bg-white/5 px-3 py-1 rounded border border-white/10">
            <span className="text-slate-400 font-medium">Joriy vaqt:</span>
            <span className="text-white font-extrabold tracking-wider">{timeFormatted}</span>
          </div>

          {!isLiveLocked && onLockToLive && (
            <button
              onClick={onLockToLive}
              className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md"
              title="Ayni paytdagi jonli real vaqtga qaytish"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Jonli vaqtga qaytish</span>
            </button>
          )}
        </div>

        {/* Center: Live 24-Hour Day Inspector Slider */}
        <div className="flex-1 w-full lg:max-w-xl flex items-center gap-3 px-2">
          <span className="text-[11px] text-slate-400 whitespace-nowrap">00:00</span>
          <div className="relative flex-1 flex items-center h-4 group">
            <input
              type="range"
              min={0}
              max={86400}
              step={10}
              value={displaySeconds}
              onChange={(e) => {
                onTimeChange(Number(e.target.value));
              }}
              style={{
                background: `linear-gradient(to right, #f43f5e ${progressPercent}%, rgba(255, 255, 255, 0.15) ${progressPercent}%)`
              }}
              className="w-full h-1.5 rounded-sm appearance-none cursor-pointer focus:outline-none transition-all accent-rose-500 group-hover:h-2"
              title="Bugungi kun davomida Quyosh va tun harakatini surib ko'rish"
            />
          </div>
          <span className="text-[11px] text-slate-400 whitespace-nowrap">23:59</span>
        </div>

        {/* Right: Live Sun & Moon Telemetry Badges */}
        {liveData && (
          <div className="hidden xl:flex items-center gap-3 text-xs shrink-0">
            {/* Subsolar Point */}
            <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-2.5 py-1 rounded text-slate-300">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Zenit:</span>
              <span className="text-amber-300 font-bold">
                {liveData.subSolarCoords.lat >= 0 ? `${liveData.subSolarCoords.lat.toFixed(1)}°Sh` : `${Math.abs(liveData.subSolarCoords.lat).toFixed(1)}°J`}, {liveData.subSolarCoords.lon >= 0 ? `${liveData.subSolarCoords.lon.toFixed(1)}°Sh` : `${Math.abs(liveData.subSolarCoords.lon).toFixed(1)}°G'`}
              </span>
            </div>

            {/* Moon Phase */}
            <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-2.5 py-1 rounded text-slate-300">
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-cyan-300 font-bold">
                {liveData.moonInfo.emoji} {liveData.moonInfo.fraction}%
              </span>
            </div>

            {/* Next Eclipse Quick Pill */}
            {liveData.nextEclipse && (
              <div className="flex items-center gap-1.5 bg-black/60 border border-amber-500/30 px-2.5 py-1 rounded text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-bold">{liveData.nextEclipse.typeUz} tutilish:</span>
                <span className="text-white font-mono font-bold">
                  {liveData.nextEclipse.countdown.days}k {liveData.nextEclipse.countdown.hours}s {liveData.nextEclipse.countdown.minutes}d
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
