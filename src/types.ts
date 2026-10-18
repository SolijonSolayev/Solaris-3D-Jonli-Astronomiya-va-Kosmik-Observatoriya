export interface LatLon {
  lat: number;
  lon: number;
}

export interface EclipseTimeWindow {
  startPartial: string; // UTC HH:MM:SS
  startTotality: string; // UTC HH:MM:SS
  peakTotality: string; // UTC HH:MM:SS
  endTotality: string; // UTC HH:MM:SS
  endPartial: string; // UTC HH:MM:SS
  durationSeconds: number; // Duration of totality in seconds
}

export interface ObservationStation {
  id: string;
  name: string;
  country: 'Uzbekistan' | 'Greenland' | 'Iceland' | 'Spain' | 'Ocean' | 'Custom';
  countryCode: 'UZ' | 'GL' | 'IS' | 'ES' | 'INTL' | 'CUSTOM';
  coords: LatLon;
  elevationMeters?: number;
  description: string;
  weatherProspects: string;
  eclipseTimes: EclipseTimeWindow;
  maxSunAltitude: number; // Degrees at peak
  isCustom?: boolean;
}

export interface EclipseMilestone {
  id: string;
  timeUTC: string; // HH:MM:SS
  timeSeconds: number; // Seconds since midnight UTC
  title: string;
  country: 'Greenland' | 'Iceland' | 'Spain' | 'Global';
  description: string;
  targetCoords?: LatLon;
  stationId?: string;
}

export interface SimulationState {
  currentTimestamp: number; // Seconds since midnight Aug 12, 2026 UTC
  isPlaying: boolean;
  speedMultiplier: number; // 1, 5, 20, 60, 300, 600, 1800
  selectedStationId: string;
  customStation: ObservationStation | null;
  cameraMode: 'free' | 'follow-shadow' | 'focused-station' | 'top-down' | 'spain-fixed';
  showPathLine: boolean;
  showPenumbra: boolean;
  showDayNightTerminator: boolean;
  showCelestialIcons?: boolean;
  showSkyView: boolean;
}

export type AppMode = 'live' | 'simulation';

export interface EclipseCountdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  formatted: string;
}

export interface NextEclipseInfo {
  name: string;
  typeUz: 'Halqasimon' | 'To\'liq' | 'Qisman';
  dateStrUz: string;
  targetDate: Date;
  saros: string;
  regions: string;
  countdown: EclipseCountdown;
}

export interface LiveMoonInfo {
  phaseName: string;
  fraction: number; // 0 to 100%
  phaseAngle: number; // 0 to 360
  emoji: string;
}

export interface LiveSunAzimuth {
  degrees: number;
  formatted: string;
  cardinalUz: string;
}

export interface LiveAstronomyData {
  currentDate: Date;
  dateFormattedUz: string;
  subSolarCoords: LatLon;
  sunAltitudeDegrees: number;
  sunAzimuth: LiveSunAzimuth;
  moonInfo: LiveMoonInfo;
  nextEclipse: NextEclipseInfo;
  nextTotalEclipse: NextEclipseInfo;
  countdownToEclipse: EclipseCountdown;
}

export interface TelemetryReadout {
  obscurationPercentage: number; // 0 to 100
  sunAltitudeDegrees: number;
  currentPhase: 'Tutilish yo\'q' | 'Qisman (Boshlanishi)' | 'Olmos uzuk!' | 'TO\'LIQ TUTILISH!' | 'Qisman (Tugashi)' | 'Tutilishdagi quyosh botishi';
  timeToNextPhase: string;
  distanceToUmbraKm: number;
}

export interface CountryTimeInfo {
  country: string;
  code: string;
  timezoneName: string;
  utcOffsetHours: number;
  localTimeFormatted: string;
  isEclipseActiveNow: boolean;
  isTotalityNow: boolean;
  flagEmoji: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'oracle';
  text: string;
  timestamp: string;
}

export interface ScienceArticle {
  id: string;
  source: string;
  pmid?: string;
  pmcid?: string;
  doi?: string;
  title: string;
  authorString?: string;
  journalTitle?: string;
  pubYear?: string;
  citedByCount?: number;
  isOpenAccess?: string;
  abstractText?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface SearchGroundingResult {
  text: string;
  sources: GroundingSource[];
}
