import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { OBSERVATION_STATIONS } from './data/eclipseData';
import { ObservationStation, LatLon, TelemetryReadout, LiveAstronomyData } from './types';
import {
  calculateTelemetry,
  calculateLiveSubSolarPoint,
  calculateLiveSunAltitude,
  calculateLiveSunAzimuth,
  calculateLiveMoonPhase,
  calculateEclipseCountdown,
  getNextSolarEclipses,
  formatUzbekDate
} from './utils/astronomy';
import { HeaderClocks } from './components/HeaderClocks';
import { Earth3D } from './components/Earth3D';
import { TelemetryPanel } from './components/TelemetryPanel';
import { PathTimelinePanel } from './components/PathTimelinePanel';
import { TimelineScrubber } from './components/TimelineScrubber';
import { SkyViewPanel } from './components/SkyViewPanel';
import { AttributionModal } from './components/AttributionModal';
import { TotalityEffectsOverlay } from './components/TotalityEffectsOverlay';
import { BioscienceModal } from './components/BioscienceModal';

export default function App() {
  // Real-time live date ticking every 1 second
  const [liveDate, setLiveDate] = useState<Date>(() => new Date());
  const [isLiveLocked, setIsLiveLocked] = useState<boolean>(true);
  const [customTimestamp, setCustomTimestamp] = useState<number>(() => {
    const d = new Date();
    return d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds();
  });

  // Modals
  const [isAttributionModalOpen, setIsAttributionModalOpen] = useState<boolean>(false);
  const [isBioscienceModalOpen, setIsBioscienceModalOpen] = useState<boolean>(false);

  // Selection & Camera State: Default to Tashkent (Uzbekistan)
  const [selectedStation, setSelectedStation] = useState<ObservationStation | null>(() => OBSERVATION_STATIONS[0]);
  const [customStation, setCustomStation] = useState<ObservationStation | null>(null);
  const [cameraMode, setCameraMode] = useState<'free' | 'follow-shadow' | 'focused-station' | 'top-down' | 'spain-fixed'>('follow-shadow');
  const [trackingMode, setTrackingMode] = useState<'auto' | 'manual' | 'spain-fixed'>('auto');
  const [cameraResetTrigger, setCameraResetTrigger] = useState<number>(0);

  // Layer Visibility State
  const [showPathLine, setShowPathLine] = useState<boolean>(true);
  const [showPenumbra, setShowPenumbra] = useState<boolean>(true);
  const [showDayNightTerminator, setShowDayNightTerminator] = useState<boolean>(true);

  // Mobile Bottom Drawer State
  const [mobileTab, setMobileTab] = useState<'telemetry' | 'sky' | 'timeline'>('telemetry');
  const [isMobilePanelExpanded, setIsMobilePanelExpanded] = useState<boolean>(true);

  // Continuous 1-second interval ticker for real-time live mode
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLiveDate(now);
      if (isLiveLocked) {
        setCustomTimestamp(now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isLiveLocked]);

  // Compute live telemetry for selected station
  const activeStation = useMemo(() => customStation || selectedStation, [customStation, selectedStation]);

  // Effective Date object based on lock status
  const effectiveDate = useMemo(() => {
    if (isLiveLocked) return liveDate;
    const d = new Date(liveDate);
    const h = Math.floor(customTimestamp / 3600);
    const m = Math.floor((customTimestamp % 3600) / 60);
    const s = Math.floor(customTimestamp % 60);
    d.setUTCHours(h, m, s);
    return d;
  }, [liveDate, isLiveLocked, customTimestamp]);

  const telemetry: TelemetryReadout = useMemo(() => {
    if (!activeStation) {
      return {
        obscurationPercentage: 0,
        sunAltitudeDegrees: 0,
        currentPhase: "Tutilish yo'q",
        timeToNextPhase: "Mavjud emas",
        distanceToUmbraKm: 9999
      };
    }
    return calculateTelemetry(activeStation.coords, customTimestamp, activeStation.isCustom ? undefined : activeStation.id);
  }, [activeStation, customTimestamp]);

  // Compute real-time astronomical live data for today
  const liveData: LiveAstronomyData = useMemo(() => {
    const subSolarCoords = calculateLiveSubSolarPoint(effectiveDate);
    const sunAltitudeDegrees = activeStation
      ? calculateLiveSunAltitude(activeStation.coords, effectiveDate)
      : 0;
    const sunAzimuth = activeStation
      ? calculateLiveSunAzimuth(activeStation.coords, effectiveDate)
      : { degrees: 0, formatted: '0.0°', cardinalUz: 'Shimol (N)' };
    const moonInfo = calculateLiveMoonPhase(effectiveDate);
    const { nextEclipse, nextTotalEclipse } = getNextSolarEclipses(effectiveDate);
    const countdownToEclipse = nextEclipse.countdown;
    const dateFormattedUz = formatUzbekDate(effectiveDate);

    return {
      currentDate: effectiveDate,
      dateFormattedUz,
      subSolarCoords,
      sunAltitudeDegrees,
      sunAzimuth,
      moonInfo,
      nextEclipse,
      nextTotalEclipse,
      countdownToEclipse
    };
  }, [effectiveDate, activeStation]);

  // Handle custom pin drop on 3D Globe
  const handleDropCustomPin = useCallback((coords: LatLon) => {
    setTrackingMode('manual');
    let country: ObservationStation['country'] = 'Custom';
    let countryCode: ObservationStation['countryCode'] = 'CUSTOM';

    const newCustomStation: ObservationStation = {
      id: 'custom-pin',
      name: `Kuzatuv nuqtasi (${coords.lat.toFixed(2)}°, ${coords.lon.toFixed(2)}°)`,
      country,
      countryCode,
      coords,
      elevationMeters: 0,
      description: "Foydalanuvchi tanlagan maxsus koordinata. Quyosh balandligi, azimuti va osmon sferasi real vaqtda hisoblanadi.",
      weatherProspects: "Jonli sun'iy yo'ldosh va astronomik kuzatuv nuqtasi.",
      eclipseTimes: {
        startPartial: '00:00:00',
        startTotality: '00:00:00',
        peakTotality: '00:00:00',
        endTotality: '00:00:00',
        endPartial: '00:00:00',
        durationSeconds: 0
      },
      maxSunAltitude: 45.0,
      isCustom: true
    };

    setCustomStation(newCustomStation);
    setSelectedStation(newCustomStation);
    setCameraMode('focused-station');
  }, []);

  const handleSelectStation = useCallback((station: ObservationStation) => {
    setTrackingMode('manual');
    if (station.isCustom && customStation) {
      setSelectedStation(customStation);
    } else {
      setCustomStation(null);
      setSelectedStation(station);
    }
    setCameraMode('focused-station');
  }, [customStation]);

  const handleUserInteract = useCallback(() => {
    setTrackingMode('manual');
  }, []);

  const handleSelectTrackingMode = useCallback((mode: 'auto' | 'manual' | 'spain-fixed') => {
    setTrackingMode(mode);
    setCameraResetTrigger((prev) => prev + 1);
    if (mode === 'auto') {
      setCameraMode('follow-shadow');
      setCustomStation(null);
    } else if (mode === 'manual') {
      setCameraMode('free');
    } else if (mode === 'spain-fixed') {
      setCameraMode('spain-fixed');
    }
  }, []);

  const handleResetCamera = useCallback(() => {
    setTrackingMode('auto');
    setCameraMode('follow-shadow');
    setCustomStation(null);
    setSelectedStation(OBSERVATION_STATIONS[0]);
    setCameraResetTrigger((prev) => prev + 1);
  }, []);

  // Global Keyboard Shortcut: Space bar to reset camera view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleResetCamera();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleResetCamera]);

  return (
    <div className="flex flex-col w-screen h-screen bg-[#050505] text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Top Header Bar with Live Clocks */}
      <HeaderClocks
        liveDate={effectiveDate}
        onResetCamera={handleResetCamera}
        onOpenInfo={() => setIsAttributionModalOpen(true)}
        onOpenBioscience={() => setIsBioscienceModalOpen(true)}
      />

      {/* 2. Main 3D Space Canvas & UI Panels */}
      <main className="flex-1 relative min-h-0 w-full overflow-hidden">
        {/* 3D Earth Studio Canvas */}
        <div className="absolute inset-0 w-full h-full">
          <Earth3D
            currentTimestamp={customTimestamp}
            selectedStation={activeStation}
            onSelectStation={handleSelectStation}
            cameraMode={cameraMode}
            showPathLine={showPathLine}
            showPenumbra={showPenumbra}
            showDayNightTerminator={showDayNightTerminator}
            onCameraModeChange={(mode) => {
              setCameraMode(mode);
              if (mode === 'free' || mode === 'focused-station' || mode === 'top-down') {
                setTrackingMode('manual');
              } else if (mode === 'follow-shadow') {
                setTrackingMode('auto');
              }
            }}
            onDropCustomPin={handleDropCustomPin}
            onTogglePathLine={() => setShowPathLine(!showPathLine)}
            onTogglePenumbra={() => setShowPenumbra(!showPenumbra)}
            onToggleTerminator={() => setShowDayNightTerminator(!showDayNightTerminator)}
            cameraResetTrigger={cameraResetTrigger}
            onUserInteract={handleUserInteract}
            appMode="live"
            liveDate={effectiveDate}
          />
        </div>

        {/* Totality & Diamond Ring Optical Effects Overlay */}
        <TotalityEffectsOverlay
          telemetry={telemetry}
          currentTimestamp={customTimestamp}
        />

        {/* Floating Overlay Panels */}
        <div className="absolute inset-0 pointer-events-none flex justify-between p-3 sm:p-5 lg:p-6 z-20 overflow-hidden">
          {/* Left Panel: Live Global Observatories */}
          <div className="pointer-events-auto self-start hidden lg:block max-h-[calc(100%-16px)] overflow-y-auto no-scrollbar pr-1">
            <PathTimelinePanel
              onSelectStation={handleSelectStation}
              selectedStation={activeStation}
              liveDate={effectiveDate}
            />
          </div>

          {/* Right Panel: Telemetry & Sky View */}
          <div className="pointer-events-auto self-start hidden md:flex flex-col gap-3.5 lg:gap-4 max-h-[calc(100%-16px)] overflow-y-auto no-scrollbar pl-1 pr-1 pb-4">
            <TelemetryPanel
              selectedStation={activeStation}
              telemetry={telemetry}
              onSelectStation={handleSelectStation}
              onClearCustomPin={() => {
                setCustomStation(null);
                setSelectedStation(OBSERVATION_STATIONS[0]);
              }}
              trackingMode={trackingMode}
              onSelectTrackingMode={handleSelectTrackingMode}
              isAutoTracking={trackingMode === 'auto'}
              onToggleAutoTrack={() => handleSelectTrackingMode(trackingMode === 'auto' ? 'manual' : 'auto')}
              liveData={liveData}
              liveDate={effectiveDate}
              onOpenBioscience={() => setIsBioscienceModalOpen(true)}
            />
            <SkyViewPanel
              selectedStation={activeStation}
              telemetry={telemetry}
              currentTimestamp={customTimestamp}
              appMode="live"
              liveData={liveData}
            />
          </div>
        </div>
      </main>

      {/* Mobile Drawer (Small screens) */}
      <div className="md:hidden bg-[#050505]/95 border-t border-white/20 shrink-0 z-30 flex flex-col shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between border-b border-white/10 px-2 py-1.5 bg-black/90 font-mono text-xs">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                if (mobileTab === 'telemetry' && isMobilePanelExpanded) {
                  setIsMobilePanelExpanded(false);
                } else {
                  setMobileTab('telemetry');
                  setIsMobilePanelExpanded(true);
                }
              }}
              className={`px-2.5 py-1 rounded-sm transition-all font-bold tracking-wider uppercase flex items-center gap-1 whitespace-nowrap text-[11px] ${
                mobileTab === 'telemetry' && isMobilePanelExpanded
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-white/5 border border-transparent'
              }`}
            >
              <span>📊</span>
              <span>Telemetriya</span>
            </button>

            <button
              onClick={() => {
                if (mobileTab === 'sky' && isMobilePanelExpanded) {
                  setIsMobilePanelExpanded(false);
                } else {
                  setMobileTab('sky');
                  setIsMobilePanelExpanded(true);
                }
              }}
              className={`px-2.5 py-1 rounded-sm transition-all font-bold tracking-wider uppercase flex items-center gap-1 whitespace-nowrap text-[11px] ${
                mobileTab === 'sky' && isMobilePanelExpanded
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-white/5 border border-transparent'
              }`}
            >
              <span>🔭</span>
              <span>Osmon</span>
            </button>

            <button
              onClick={() => {
                if (mobileTab === 'timeline' && isMobilePanelExpanded) {
                  setIsMobilePanelExpanded(false);
                } else {
                  setMobileTab('timeline');
                  setIsMobilePanelExpanded(true);
                }
              }}
              className={`px-2.5 py-1 rounded-sm transition-all font-bold tracking-wider uppercase flex items-center gap-1 whitespace-nowrap text-[11px] ${
                mobileTab === 'timeline' && isMobilePanelExpanded
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-white bg-white/5 border border-transparent'
              }`}
            >
              <span>📍</span>
              <span>Shaharlar</span>
            </button>
          </div>

          <button
            onClick={() => setIsMobilePanelExpanded(!isMobilePanelExpanded)}
            className="px-2 py-1 rounded-sm bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/20 ml-1 shrink-0 text-[10px] font-bold font-mono uppercase tracking-wider"
          >
            {isMobilePanelExpanded ? '▼ MIN' : '▲ MAX'}
          </button>
        </div>

        {isMobilePanelExpanded && (
          <div className="p-2 max-h-[36vh] overflow-y-auto no-scrollbar bg-[#04060a]/95">
            {mobileTab === 'telemetry' && (
              <TelemetryPanel
                selectedStation={activeStation}
                telemetry={telemetry}
                onSelectStation={handleSelectStation}
                onClearCustomPin={() => {
                  setCustomStation(null);
                  setSelectedStation(OBSERVATION_STATIONS[0]);
                }}
                trackingMode={trackingMode}
                onSelectTrackingMode={handleSelectTrackingMode}
                liveData={liveData}
                liveDate={effectiveDate}
                onOpenBioscience={() => setIsBioscienceModalOpen(true)}
              />
            )}
            {mobileTab === 'sky' && (
              <SkyViewPanel
                selectedStation={activeStation}
                telemetry={telemetry}
                currentTimestamp={customTimestamp}
                appMode="live"
                liveData={liveData}
              />
            )}
            {mobileTab === 'timeline' && (
              <PathTimelinePanel
                onSelectStation={handleSelectStation}
                selectedStation={activeStation}
                liveDate={effectiveDate}
              />
            )}
          </div>
        )}
      </div>

      {/* 3. Bottom Real-Time Astronomical Control Bar */}
      <TimelineScrubber
        currentTimestamp={customTimestamp}
        isPlaying={false}
        speedMultiplier={1}
        onTimeChange={(val) => {
          setIsLiveLocked(false);
          setCustomTimestamp(val);
        }}
        onTogglePlay={() => {}}
        onSpeedChange={() => {}}
        liveDate={effectiveDate}
        liveData={liveData}
        isLiveLocked={isLiveLocked}
        onLockToLive={() => {
          setIsLiveLocked(true);
          const now = new Date();
          setLiveDate(now);
          setCustomTimestamp(now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds());
        }}
      />

      {/* 4. Data Sources & Information Modal */}
      <AttributionModal
        isOpen={isAttributionModalOpen}
        onClose={() => setIsAttributionModalOpen(false)}
      />

      {/* 5. Bioscience Research Modal */}
      <BioscienceModal
        isOpen={isBioscienceModalOpen}
        onClose={() => setIsBioscienceModalOpen(false)}
        selectedStation={activeStation}
      />
    </div>
  );
}
