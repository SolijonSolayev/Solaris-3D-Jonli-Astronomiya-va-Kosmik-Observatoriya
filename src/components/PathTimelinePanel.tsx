import React from 'react';
import { ObservationStation, LatLon } from '../types';
import { OBSERVATION_STATIONS } from '../data/eclipseData';
import { calculateLiveSunAltitude, getLiveTimeForOffset } from '../utils/astronomy';
import { Radio, Sun, Moon, MapPin, Eye } from 'lucide-react';

interface PathTimelinePanelProps {
  currentTimestamp?: number;
  onSelectStation: (station: ObservationStation) => void;
  selectedStation: ObservationStation | null;
  liveDate?: Date;
  onSelectMilestone?: (timeSeconds: number, stationId?: string) => void;
  appMode?: string;
  onSwitchToSimulation?: () => void;
}

export const PathTimelinePanel: React.FC<PathTimelinePanelProps> = ({
  onSelectStation,
  selectedStation,
  liveDate = new Date(),
}) => {
  const getOffsetForCountryCode = (code: string) => {
    switch (code) {
      case 'UZ': return 5;
      case 'ES': return 2;
      case 'IS': return 0;
      case 'GL': return -1;
      default: return 0;
    }
  };

  const getStationStatus = (station: ObservationStation) => {
    const alt = calculateLiveSunAltitude(station.coords, liveDate);
    if (alt > 0) {
      return { text: `Kunduz (${alt.toFixed(1)}°)`, isDay: true, icon: '☀️' };
    } else if (alt > -6) {
      return { text: `Shafaq (${alt.toFixed(1)}°)`, isDay: false, icon: '🌅' };
    } else {
      return { text: `Tun (${alt.toFixed(1)}°)`, isDay: false, icon: '🌙' };
    }
  };

  return (
    <div className="w-full md:w-84 lg:w-96 xl:w-[410px] bg-[#050505]/95 backdrop-blur-2xl border border-white/20 rounded p-4 md:p-5 lg:p-6 text-slate-200 shadow-2xl flex flex-col shrink-0 font-sans select-none">
      {/* Header */}
      <div className="border-b border-white/20 pb-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
          <h2 className="text-xs lg:text-[13px] font-mono tracking-[0.2em] uppercase text-rose-300 font-bold">
            JONLI OBSERVATORIYALAR
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-medium">
          DUNYO SOATLARI
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-3 font-mono">
        Kuzatuv nuqtasini tanlang — 3D kamera va Yerustidan qarash oynasi ayni paytdagi holatga o'tadi:
      </p>

      {/* Observatories List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[380px] scrollbar-thin">
        {OBSERVATION_STATIONS.map((station) => {
          const isSelected = selectedStation?.id === station.id;
          const offset = getOffsetForCountryCode(station.countryCode);
          const timeInfo = getLiveTimeForOffset(liveDate, offset);
          const status = getStationStatus(station);

          return (
            <div
              key={station.id}
              onClick={() => onSelectStation(station)}
              className={`p-3 rounded-lg border transition-all cursor-pointer font-mono ${
                isSelected
                  ? 'bg-rose-500/15 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.25)]'
                  : 'bg-black/50 border-white/10 hover:border-white/30 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">
                    {station.countryCode === 'UZ' ? '🇺🇿' : station.countryCode === 'ES' ? '🇪🇸' : station.countryCode === 'IS' ? '🇮🇸' : '🇬🇱'}
                  </span>
                  <span className={`text-xs font-bold tracking-wide ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {station.name}
                  </span>
                </div>
                <span className={`text-[11px] font-bold ${status.isDay ? 'text-amber-400' : 'text-cyan-400'}`}>
                  {status.icon} {status.text}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 pt-1.5 border-t border-white/10">
                <span className="flex items-center gap-1 text-slate-300">
                  <span className="text-slate-400">Mahalliy vaqt:</span>
                  <span className="font-bold text-white">{timeInfo.timeStr} {timeInfo.ampm}</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {station.coords.lat.toFixed(1)}°, {station.coords.lon.toFixed(1)}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
