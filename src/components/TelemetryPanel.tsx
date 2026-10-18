import React from 'react';
import { ObservationStation, TelemetryReadout, LiveAstronomyData } from '../types';
import { OBSERVATION_STATIONS } from '../data/eclipseData';
import { MapPin, Compass, RefreshCw, Sparkles, Moon, Sun, Dna, Clock, Navigation } from 'lucide-react';
import { getLiveTimeForOffset } from '../utils/astronomy';

interface TelemetryPanelProps {
  selectedStation: ObservationStation | null;
  telemetry: TelemetryReadout;
  onSelectStation: (station: ObservationStation) => void;
  onOpenSkyView?: () => void;
  onClearCustomPin?: () => void;
  isAutoTracking?: boolean;
  onToggleAutoTrack?: () => void;
  trackingMode?: 'auto' | 'manual' | 'spain-fixed';
  onSelectTrackingMode?: (mode: 'auto' | 'manual' | 'spain-fixed') => void;
  liveData?: LiveAstronomyData;
  liveDate?: Date;
  onOpenBioscience?: () => void;
  appMode?: string;
  onSwitchToSimulation?: () => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  selectedStation,
  onSelectStation,
  onClearCustomPin,
  isAutoTracking = false,
  onToggleAutoTrack,
  trackingMode = isAutoTracking ? 'auto' : 'manual',
  onSelectTrackingMode,
  liveData,
  liveDate = new Date(),
  onOpenBioscience
}) => {
  if (!selectedStation) {
    return (
      <div className="w-full md:w-88 lg:w-96 xl:w-[410px] bg-[#04060a]/95 backdrop-blur-2xl border border-white/15 rounded p-5 text-slate-400 font-mono text-xs shadow-2xl">
        [ KUZATUV_NUQTASINI_TANLANG ]
      </div>
    );
  }

  const getFlagEmoji = (code: string) => {
    switch (code) {
      case 'UZ': return '🇺🇿';
      case 'GL': return '🇬🇱';
      case 'IS': return '🇮🇸';
      case 'ES': return '🇪🇸';
      case 'CUSTOM': return '📍';
      case 'INTL': return '🌊';
      default: return '🌐';
    }
  };

  const getCountryNameUz = (country: ObservationStation['country']) => {
    switch (country) {
      case 'Uzbekistan': return 'O\'zbekiston';
      case 'Greenland': return 'Grenlandiya';
      case 'Iceland': return 'Islandiya';
      case 'Spain': return 'Ispaniya';
      case 'Ocean': return 'Maxsus koordinata';
      case 'Custom': return 'Shaxsiy nuqta';
      default: return 'Dunyo observatoriyasi';
    }
  };

  const getOffsetForCountryCode = (code: string) => {
    switch (code) {
      case 'UZ': return 5;
      case 'ES': return 2;
      case 'IS': return 0;
      case 'GL': return -1;
      default: return 0;
    }
  };

  const offset = getOffsetForCountryCode(selectedStation.countryCode);
  const localTime = getLiveTimeForOffset(liveDate, offset);
  const sunAltitude = liveData ? liveData.sunAltitudeDegrees : 0;
  const sunAzimuth = liveData ? liveData.sunAzimuth : { degrees: 0, formatted: '0.0°', cardinalUz: 'Shimol (N)' };
  const nextEclipse = liveData?.nextEclipse;
  const nextTotal = liveData?.nextTotalEclipse;

  const getSkyCondition = (alt: number) => {
    if (alt > 15) return { label: "Kunduzgi yorug'lik", color: 'text-amber-400' };
    if (alt > 0) return { label: "Oltin soat (Quyosh botishi/chiqishi)", color: 'text-amber-300' };
    if (alt > -6) return { label: "Fuqarolik shafaqi", color: 'text-orange-400' };
    if (alt > -12) return { label: "Navigatsion shafaq", color: 'text-indigo-400' };
    return { label: "Tungi osmon (Yulduzlar & Oy)", color: 'text-cyan-400' };
  };

  const condition = getSkyCondition(sunAltitude);

  return (
    <div className="w-full md:w-88 lg:w-96 xl:w-[410px] bg-[#050505]/95 backdrop-blur-2xl border border-white/20 rounded p-4 md:p-5 lg:p-6 flex flex-col justify-start text-slate-200 shadow-2xl shrink-0 font-sans select-none">
      <div>
        {/* Header */}
        <div className="border-b border-white/20 pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shadow-[0_0_8px_rgba(244,63,94,0.8)]"
              title="Jonli real vaqt telemetriyasi"
            />
            <h2 className="text-xs lg:text-[13px] font-mono tracking-[0.2em] uppercase text-rose-300 font-bold">
              JONLI TELEMETRIYA
            </h2>
          </div>

          {selectedStation.isCustom && trackingMode !== 'auto' && onClearCustomPin && (
            <button
              onClick={onClearCustomPin}
              className="text-slate-400 hover:text-white text-xs font-mono tracking-wider uppercase underline underline-offset-4"
            >
              Nuqtani tozalash
            </button>
          )}
        </div>

        {/* 2-Mode Tracking Bar */}
        <div className="grid grid-cols-2 gap-1.5 mb-4 bg-black/70 p-1.5 rounded border border-white/15 font-mono text-xs lg:text-[13px] shadow-inner">
          <button
            onClick={() => {
              if (onSelectTrackingMode) onSelectTrackingMode('auto');
              else if (onToggleAutoTrack && !isAutoTracking) onToggleAutoTrack();
            }}
            className={`py-2 px-2 rounded-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              trackingMode === 'auto'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.25)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Avtomatik kuzatuv: Globus markazini Quyosh zenit nuqtasiga qaratish"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${trackingMode === 'auto' ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
            <span className="truncate">AVTO KUZATUV</span>
          </button>

          <button
            onClick={() => {
              if (onSelectTrackingMode) onSelectTrackingMode('manual');
              else if (onToggleAutoTrack && isAutoTracking) onToggleAutoTrack();
            }}
            className={`py-2 px-2 rounded-sm font-bold transition-all flex items-center justify-center gap-1.5 ${
              trackingMode === 'manual'
                ? 'bg-white/15 text-white border border-white/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Qo'lda boshqarish: Globusni erkin aylantirish va kuzatuv nuqtalarini mustaqil tanlash"
          >
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">ERKIN GLOBUS</span>
          </button>
        </div>

        {/* Country & Station Title */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2.5 mb-1">
            <span className="text-2xl lg:text-3xl leading-none">{getFlagEmoji(selectedStation.countryCode)}</span>
            <span className="text-xl lg:text-2xl font-extrabold text-white tracking-tight uppercase">
              {getCountryNameUz(selectedStation.country)}
            </span>
          </div>
          <div className="text-sm lg:text-base font-mono text-cyan-300 font-bold tracking-wide pl-9 lg:pl-10">
            {selectedStation.name}
          </div>
        </div>

        {/* Location Selector Dropdown */}
        <div className="relative mb-4 group">
          <label htmlFor="station-selector" className="sr-only">
            Kuzatuv nuqtasini tanlang
          </label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <MapPin className="w-4 h-4 text-rose-400" />
          </div>
          <select
            id="station-selector"
            value={selectedStation.isCustom ? 'custom' : selectedStation.id}
            onChange={(e) => {
              const val = e.target.value;
              if (val !== 'custom') {
                const found = OBSERVATION_STATIONS.find((s) => s.id === val);
                if (found) onSelectStation(found);
              }
            }}
            className="w-full pl-9 pr-8 py-2.5 bg-black/80 border border-white/20 rounded font-mono text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-rose-400 transition-colors appearance-none cursor-pointer"
          >
            {selectedStation.isCustom && (
              <option value="custom">📍 Maxsus nuqta ({selectedStation.coords.lat.toFixed(2)}°, {selectedStation.coords.lon.toFixed(2)}°)</option>
            )}
            {OBSERVATION_STATIONS.map((station) => (
              <option key={station.id} value={station.id} className="bg-slate-900 text-white font-mono">
                {station.name} ({station.country})
              </option>
            ))}
          </select>
        </div>

        {/* Automatic Next Solar Eclipse Countdown Banner */}
        {nextEclipse && (
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-br from-amber-500/15 via-rose-500/10 to-cyan-500/15 border border-amber-500/40 shadow-lg">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>KEYINGI QUYOSH TUTILISHI:</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {nextEclipse.typeUz.toUpperCase()} ({nextEclipse.saros})
              </span>
            </div>

            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="text-xs font-bold text-white font-mono">
                {nextEclipse.dateStrUz}
              </span>
              <span className="text-[10px] text-slate-300 font-mono truncate max-w-[180px]">
                📍 {nextEclipse.regions}
              </span>
            </div>

            <div className="text-xs sm:text-sm font-mono font-extrabold text-amber-300 tracking-wide bg-black/40 px-2.5 py-1.5 rounded border border-amber-500/20 mt-1">
              ⏳ {nextEclipse.countdown.formatted}
            </div>

            {nextTotal && nextTotal.name !== nextEclipse.name && (
              <div className="mt-2 pt-2 border-t border-white/10 text-[10px] font-mono text-cyan-200/90 flex items-center justify-between">
                <span>✦ Keyingi To'liq tutilish:</span>
                <span className="font-bold text-cyan-300">{nextTotal.dateStrUz} (Luksor, Misr)</span>
              </div>
            )}
          </div>
        )}

        {/* Real-Time Telemetry Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 mt-2 text-xs font-mono border-t border-white/20 pt-4">
          {/* 1. Local Time (Ticking seconds) */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] lg:text-xs tracking-wider text-slate-400 uppercase font-medium">
              Mahalliy vaqt
            </span>
            <span className="text-base lg:text-lg font-bold text-white tracking-wide">
              {localTime.timeStr} <span className="text-xs text-amber-400 font-bold">{localTime.ampm}</span>
            </span>
          </div>

          {/* 2. Sky Condition */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] lg:text-xs tracking-wider text-slate-400 uppercase font-medium">
              Osmon holati
            </span>
            <span className={`text-xs lg:text-sm font-bold tracking-wide truncate ${condition.color}`}>
              {condition.label}
            </span>
          </div>

          {/* 3. Real Sun Altitude */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] lg:text-xs tracking-wider text-slate-400 uppercase font-medium flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Quyosh balandligi</span>
            </span>
            <span className="text-base lg:text-lg font-bold text-amber-300 tracking-wide">
              {sunAltitude >= 0 ? `+${sunAltitude.toFixed(1)}°` : `${sunAltitude.toFixed(1)}°`}
            </span>
          </div>

          {/* 4. Real Sun Azimuth */}
          <div className="flex flex-col gap-1">
            <span className="text-[11px] lg:text-xs tracking-wider text-slate-400 uppercase font-medium flex items-center gap-1">
              <Navigation className="w-3 h-3 text-emerald-400" />
              <span>Quyosh azimuti</span>
            </span>
            <span className="text-sm lg:text-base font-bold text-emerald-300 tracking-wide truncate" title={sunAzimuth.cardinalUz}>
              {sunAzimuth.formatted} <span className="text-[10px] text-slate-300 font-normal">({sunAzimuth.cardinalUz.split(' ')[0]})</span>
            </span>
          </div>

          {/* 5. Moon Phase & Illumination Percentage */}
          {liveData && (
            <div className="flex flex-col gap-1 col-span-2 pt-1 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-wider text-slate-400 uppercase font-medium flex items-center gap-1">
                  <Moon className="w-3 h-3 text-cyan-400" />
                  <span>Oy fazasi & Yoritilganlik</span>
                </span>
                <span className="text-xs font-bold text-cyan-300">
                  {liveData.moonInfo.fraction}% yoritilgan
                </span>
              </div>
              <span className="text-sm font-bold text-white tracking-wide">
                {liveData.moonInfo.emoji} {liveData.moonInfo.phaseName}
              </span>
            </div>
          )}

          {/* 6. Subsolar Zenith Point */}
          {liveData && (
            <div className="flex flex-col gap-1 col-span-2 pt-1 border-t border-white/10">
              <span className="text-[11px] tracking-wider text-slate-400 uppercase font-medium">
                Quyosh Zenit (Subsolyar) Koordinatalari
              </span>
              <span className="text-xs lg:text-sm font-bold text-slate-200 tracking-wide">
                {liveData.subSolarCoords.lat >= 0 ? `${liveData.subSolarCoords.lat.toFixed(2)}° Shimol` : `${Math.abs(liveData.subSolarCoords.lat).toFixed(2)}° Janub`}, {liveData.subSolarCoords.lon >= 0 ? `${liveData.subSolarCoords.lon.toFixed(2)}° Sharq` : `${Math.abs(liveData.subSolarCoords.lon).toFixed(2)}° G'arb`}
              </span>
            </div>
          )}
        </div>

        {/* Bioscience button */}
        {onOpenBioscience && (
          <button
            onClick={onOpenBioscience}
            className="mt-4 w-full py-2.5 px-3 rounded bg-gradient-to-r from-cyan-500/20 via-emerald-500/20 to-amber-500/20 hover:from-cyan-500/30 hover:to-amber-500/30 border border-cyan-500/40 hover:border-cyan-400 text-cyan-200 hover:text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            title="Biologik ta'sirlar, sirkad ritmlar va Google Search orqali jonli ilmiy tahlil"
          >
            <Dna className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Biosfera & Ilmiy Tahlil</span>
          </button>
        )}
      </div>
    </div>
  );
};
