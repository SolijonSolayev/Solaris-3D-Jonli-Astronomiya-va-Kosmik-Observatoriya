import React, { useMemo } from 'react';
import { ObservationStation, TelemetryReadout, AppMode, LiveAstronomyData } from '../types';
import { formatSecondsToUTC } from '../utils/astronomy';
import { Sun, Moon, Sparkles } from 'lucide-react';

interface SkyViewPanelProps {
  selectedStation: ObservationStation | null;
  telemetry: TelemetryReadout;
  currentTimestamp: number;
  appMode?: AppMode;
  liveData?: LiveAstronomyData;
}

export const SkyViewPanel: React.FC<SkyViewPanelProps> = ({
  selectedStation,
  telemetry,
  currentTimestamp,
  appMode = 'simulation',
  liveData
}) => {
  if (!selectedStation) return null;

  const isLive = appMode === 'live' && Boolean(liveData);
  const { obscurationPercentage, currentPhase, sunAltitudeDegrees } = telemetry;
  const isTotality = currentPhase === 'TOTALITY!' || currentPhase === "TO'LIQ TUTILISH!";
  const isDiamondRing = currentPhase === 'Diamond Ring!' || currentPhase === 'Olmos uzuk!';
  const isSunset = (isLive && liveData ? liveData.sunAltitudeDegrees : sunAltitudeDegrees) <= 0;

  // Trajectory calculations for eclipse simulation
  const obscurationRatio = Math.min(100, Math.max(0, obscurationPercentage)) / 100;
  const isEgress = currentPhase === 'Partial (Egress)' || currentPhase === 'Qisman (Tugashi)' || (telemetry.timeToNextPhase?.includes('Tutilish tugashiga') ?? false) || (telemetry.timeToNextPhase?.includes('Eclipse ends') ?? false);
  const trajectoryAngleRad = 1.13;
  const activeAngle = isEgress ? (trajectoryAngleRad + Math.PI) : trajectoryAngleRad;
  const distancePx = isTotality ? 0 : (1.0 - obscurationRatio) * 165;
  const moonX = Math.cos(activeAngle) * distancePx;
  const moonY = Math.sin(activeAngle) * distancePx;

  // Sky background styling for both live and simulation modes
  const skyBackgroundStyle = useMemo(() => {
    if (isLive && liveData) {
      const alt = liveData.sunAltitudeDegrees;
      if (alt > 15) {
        return { background: 'linear-gradient(180deg, #0284c7 0%, #38bdf8 60%, #bae6fd 100%)' };
      } else if (alt > 0) {
        return { background: 'linear-gradient(180deg, #1e3a8a 0%, #f97316 65%, #fde047 100%)' };
      } else if (alt > -6) {
        return { background: 'linear-gradient(180deg, #0f172a 0%, #7c2d12 60%, #ea580c 100%)' };
      } else {
        return { background: 'linear-gradient(180deg, #020617 0%, #070d19 60%, #020617 100%)' };
      }
    }

    if (isSunset) {
      return {
        background: 'linear-gradient(to bottom, #0f0a14 0%, #2a1220 60%, #4a1c1d 100%)'
      };
    }
    if (isTotality) {
      return {
        background: 'radial-gradient(circle at center, #0a0e1a 0%, #030508 60%, #000000 100%)'
      };
    }
    
    const t = obscurationRatio;
    if (t > 0.85) {
      const factor = (t - 0.85) / 0.15;
      const topColor = `rgba(${Math.round(14 - factor * 10)}, ${Math.round(24 - factor * 18)}, ${Math.round(48 - factor * 35)}, 1)`;
      const bottomColor = `rgba(${Math.round(24 - factor * 18)}, ${Math.round(38 - factor * 30)}, ${Math.round(72 - factor * 55)}, 1)`;
      return { background: `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)` };
    } else {
      const factor = t / 0.85;
      const topColor = `rgba(${Math.round(28 - factor * 14)}, ${Math.round(65 - factor * 41)}, ${Math.round(135 - factor * 87)}, 1)`;
      const bottomColor = `rgba(${Math.round(70 - factor * 46)}, ${Math.round(130 - factor * 92)}, ${Math.round(210 - factor * 138)}, 1)`;
      return { background: `linear-gradient(180deg, ${topColor} 0%, ${bottomColor} 100%)` };
    }
  }, [isLive, liveData, obscurationRatio, isTotality, isSunset]);

  const displayAltitude = isLive && liveData ? liveData.sunAltitudeDegrees : sunAltitudeDegrees;

  return (
    <div className="w-full md:w-88 lg:w-96 xl:w-[410px] bg-[#050505]/95 backdrop-blur-2xl border border-white/20 rounded overflow-hidden shadow-2xl flex flex-col shrink-0 font-sans select-none">
      {/* Architectural Header */}
      <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-3.5 border-b border-white/20 bg-black/60">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-rose-500 animate-ping' : 'bg-cyan-400 animate-pulse'} shadow-[0_0_8px_rgba(0,242,254,0.8)]`}
            title={isLive ? "Jonli real vaqt osmon kamerasi" : "Tutilish osmon ko'rinishi kamerasi"}
          />
          <span className="text-xs lg:text-[13px] font-mono tracking-[0.2em] uppercase text-slate-300 font-bold">
            {isLive ? "JONLI OSMON KO'RINISHI" : "YERUSTI OSMON KO'RINISHI"}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs lg:text-[13px] text-slate-400">
          <span>BAL</span>
          <span className="text-white font-bold">{displayAltitude.toFixed(1)}°</span>
        </div>
      </div>

      {/* Central Celestial Stage */}
      <div 
        className="relative w-full h-48 sm:h-56 lg:h-64 flex flex-col items-center justify-center overflow-hidden transition-colors duration-700"
        style={skyBackgroundStyle}
      >
        {/* Subtle Astronomical Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Stars in Deep Darkness (at night in live mode or totality/high obscuration in simulation) */}
        {((isLive && displayAltitude <= 0) || (!isLive && (isTotality || obscurationPercentage > 90))) && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000">
            {/* Twinkling star field */}
            <div className="absolute top-[15%] left-[12%] w-1 h-1 rounded-full bg-white opacity-80 shadow-[0_0_6px_#fff] animate-pulse" />
            <div className="absolute top-[28%] left-[24%] w-1.5 h-1.5 rounded-full bg-cyan-100 opacity-90 shadow-[0_0_8px_#a5f3fc]" title="Venera" />
            <div className="absolute top-[22%] left-[48%] w-1 h-1 rounded-full bg-amber-100 opacity-70" />
            <div className="absolute top-[18%] right-[22%] w-1.5 h-1.5 rounded-full bg-orange-200 opacity-85 shadow-[0_0_8px_#fed7aa]" title="Mars" />
            <div className="absolute top-[42%] right-[14%] w-1 h-1 rounded-full bg-white opacity-60 animate-pulse" />
            <div className="absolute top-[68%] left-[18%] w-1 h-1 rounded-full bg-white opacity-70" />
            <div className="absolute top-[12%] left-[78%] w-1 h-1 rounded-full bg-cyan-200 opacity-80" />
            <div className="absolute bottom-[28%] left-[32%] w-1 h-1 rounded-full bg-white opacity-65" />
            <div className="absolute bottom-[35%] right-[28%] w-1.5 h-1.5 rounded-full bg-amber-100 opacity-90 shadow-[0_0_6px_#fde68a]" title="Yupiter" />
            <div className="absolute top-[52%] left-[82%] w-1 h-1 rounded-full bg-white opacity-75" />
            <div className="absolute bottom-[20%] right-[12%] w-1 h-1 rounded-full bg-white opacity-50" />
          </div>
        )}

        {/* Horizon Sunset Glow Notice */}
        {displayAltitude <= 0 && (
          <div className="absolute bottom-2 px-3 py-1 rounded-sm bg-black/80 border border-rose-500/40 backdrop-blur-md z-30">
            <span className="text-[11px] lg:text-xs font-mono tracking-widest uppercase text-rose-400 font-bold">
              QUYOSH UFQ ORTIDA • {displayAltitude.toFixed(1)}°
            </span>
          </div>
        )}

        {/* Celestial Stage Content */}
        {isLive && liveData ? (
          displayAltitude > 0 ? (
            /* Live Daytime Sun */
            <div className="relative flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40 my-auto">
              <div className="absolute -inset-10 rounded-full bg-amber-300/30 blur-2xl animate-pulse" />
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-white via-amber-100 to-amber-500 shadow-[0_0_70px_rgba(251,191,36,0.9)] flex items-center justify-center">
                <Sun className="w-12 h-12 text-amber-500/60" />
              </div>
            </div>
          ) : (
            /* Live Nighttime Moon with phase shape & illumination fraction */
            <div className="relative flex flex-col items-center justify-center my-auto">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-900 border border-cyan-500/30 shadow-[0_0_35px_rgba(56,189,248,0.25)] relative overflow-hidden flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-amber-100 via-cyan-100 to-white opacity-90 transition-all"
                  style={{
                    clipPath: liveData.moonInfo.fraction > 50
                      ? 'circle(50% at 50% 50%)'
                      : `inset(0 ${100 - liveData.moonInfo.fraction}% 0 0)`
                  }}
                />
                <Moon className="w-10 h-10 text-slate-800 z-10 opacity-70" />
              </div>
              <div className="mt-2 text-xs font-mono font-bold text-cyan-300 tracking-wider">
                {liveData.moonInfo.emoji} {liveData.moonInfo.phaseName} ({liveData.moonInfo.fraction}%)
              </div>
            </div>
          )
        ) : (
          /* Simulation Mode 2026 Solar Eclipse Canvas */
          <div className="relative flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 my-auto">
            {/* 1. Scientific Corona Glow */}
            {isTotality && (
              <div className="absolute -inset-12 flex items-center justify-center pointer-events-none">
                <div className="absolute w-[190%] h-[190%] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.28)_0%,rgba(186,230,253,0.1)_45%,transparent_70%)] blur-md animate-pulse" />
                <div className="absolute w-[150%] h-[150%] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.5)_0%,rgba(224,242,254,0.18)_50%,transparent_75%)] blur-sm" />
                <div className="absolute w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-full border border-white/40 shadow-[0_0_28px_rgba(255,255,255,0.9)]" />
              </div>
            )}

            {/* 2. Diamond Ring & Baily's Beads Effect */}
            {(isDiamondRing || (obscurationPercentage >= 99.2 && !isTotality)) && (
              <div 
                className={`absolute z-30 pointer-events-none flex items-center justify-center ${
                  isEgress ? 'bottom-[12%] right-[16%]' : 'top-[12%] left-[16%]'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_25px_#fff,0_0_45px_#38bdf8,0_0_70px_#f59e0b] animate-pulse" />
                <div className="absolute w-24 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent" />
                <div className="absolute h-24 w-[1.5px] bg-gradient-to-b from-transparent via-white to-transparent" />
                <div className="absolute w-16 h-[1px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent rotate-45" />

                <div className="absolute -inset-6 pointer-events-none">
                  <div 
                    className={`absolute w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#fef08a] animate-ping ${
                      isEgress ? '-top-3 -left-3' : '-bottom-3 -right-3'
                    }`}
                    style={{ animationDuration: '2.5s' }}
                    title="Beyli munchoqlari (Baily's Beads)"
                  />
                  <div 
                    className={`absolute w-1.5 h-1.5 rounded-full bg-amber-200 shadow-[0_0_6px_#fff] ${
                      isEgress ? '-top-5 -left-1' : '-bottom-5 -right-1'
                    }`}
                  />
                  <div 
                    className={`absolute w-1.5 h-1.5 rounded-full bg-cyan-100 shadow-[0_0_6px_#fff] ${
                      isEgress ? '-top-1 -left-5' : '-bottom-1 -right-5'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* 3. The Sun Disc */}
            <div
              className={`w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-full transition-colors duration-500 relative z-10 ${
                isTotality
                  ? 'bg-black shadow-[0_0_18px_rgba(255,255,255,0.6)]'
                  : 'bg-gradient-to-br from-[#fffbeb] via-[#fef08a] to-[#f59e0b] shadow-[0_0_40px_rgba(251,191,36,0.4)]'
              }`}
            />

            {/* 4. The Moon Disc */}
            <div
              className="absolute w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 rounded-full bg-[#050505] z-20 transition-transform duration-100 ease-out"
              style={{
                transform: `translate(${moonX}px, ${moonY}px)`
              }}
            />
          </div>
        )}
      </div>

      {/* Live Readout & Status */}
      <div className="px-4 py-3 lg:px-6 lg:py-3.5 bg-black/80 border-t border-white/20 flex flex-col gap-2.5">
        {isLive && liveData ? (
          <>
            <div className="flex items-center justify-between font-mono text-xs lg:text-sm">
              <span className="text-slate-400 tracking-wider uppercase text-[11px] lg:text-xs font-medium">Holat</span>
              <span className="text-emerald-400 font-bold tracking-widest uppercase">
                {displayAltitude > 15
                  ? "Kunduzgi Quyosh"
                  : displayAltitude > 0
                  ? "Oltin soat / Shafaq"
                  : displayAltitude > -6
                  ? "Fuqarolik shafaqi"
                  : "Tungi osmon • Yulduzlar & Oy"}
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs lg:text-sm">
              <span className="text-slate-400 tracking-wider uppercase text-[11px] lg:text-xs font-medium">Quyosh yo'nalishi</span>
              <span className="text-amber-300 font-extrabold tracking-wider">
                Azimut: {liveData.sunAzimuth?.formatted} ({liveData.sunAzimuth?.cardinalUz?.split(' ')[0]})
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs lg:text-sm">
              <span className="text-slate-400 tracking-wider uppercase text-[11px] lg:text-xs font-medium">Oy fazasi</span>
              <span className="text-cyan-300 font-extrabold tracking-widest">
                {liveData.moonInfo.fraction}% • {liveData.moonInfo.phaseName}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between font-mono text-xs lg:text-sm">
              <span className="text-slate-400 tracking-wider uppercase text-[11px] lg:text-xs font-medium">Faza</span>
              <span className="text-white font-bold tracking-widest uppercase">{currentPhase}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs lg:text-sm">
              <span className="text-slate-400 tracking-wider uppercase text-[11px] lg:text-xs font-medium">Qoplanish</span>
              <span className="text-amber-400 font-extrabold tracking-widest">{obscurationPercentage.toFixed(1)}%</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


