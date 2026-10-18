import { LatLon, TelemetryReadout, CountryTimeInfo, ObservationStation, LiveSunAzimuth, NextEclipseInfo, EclipseCountdown } from '../types';
import { UMBRA_PATH_WAYPOINTS, COUNTRY_TIMEZONE_CONFIG, OBSERVATION_STATIONS } from '../data/eclipseData';

/**
 * Format UTC time in seconds since midnight to 12-hour format without seconds (e.g. 5:00PM)
 */
export function formatSecondsToUTC(seconds: number): string {
  const h24 = Math.floor(seconds / 3600) % 24;
  const mins = Math.floor((seconds % 3600) / 60);
  
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 || 12;
  
  return `${h12}:${String(mins).padStart(2, '0')}${ampm}`;
}

export function formatSecondsTo12h(seconds: number): string {
  return formatSecondsToUTC(seconds);
}

/**
 * Get country time info including formatted local time and active status
 */
export function getCountryTimes(currentTimestampSeconds: number): CountryTimeInfo[] {
  // Check active windows based on timestamp
  // Greenland totality window ~16:34 - 16:40 UTC
  const isGreenlandTotality = currentTimestampSeconds >= 59600 && currentTimestampSeconds <= 59950;
  const isGreenlandActive = currentTimestampSeconds >= 56200 && currentTimestampSeconds <= 63380;

  // Iceland totality window ~17:45 - 17:50 UTC
  const isIcelandTotality = currentTimestampSeconds >= 63900 && currentTimestampSeconds <= 64180;
  const isIcelandActive = currentTimestampSeconds >= 60400 && currentTimestampSeconds <= 67600;

  // Spain totality window ~18:25 - 18:33 UTC
  const isSpainTotality = currentTimestampSeconds >= 66400 && currentTimestampSeconds <= 66800;
  const isSpainActive = currentTimestampSeconds >= 63000 && currentTimestampSeconds <= 69000;

  return COUNTRY_TIMEZONE_CONFIG.map((config) => {
    const localSeconds = (currentTimestampSeconds + config.utcOffsetHours * 3600 + 86400) % 86400;
    let isTotality = false;
    let isActive = false;

    if (config.country === 'Greenland') {
      isTotality = isGreenlandTotality;
      isActive = isGreenlandActive;
    } else if (config.country === 'Iceland') {
      isTotality = isIcelandTotality;
      isActive = isIcelandActive;
    } else if (config.country === 'Spain') {
      isTotality = isSpainTotality;
      isActive = isSpainActive;
    }

    return {
      country: config.country,
      code: config.code,
      timezoneName: config.timezoneName,
      utcOffsetHours: config.utcOffsetHours,
      localTimeFormatted: formatSecondsToUTC(localSeconds),
      isEclipseActiveNow: isActive,
      isTotalityNow: isTotality,
      flagEmoji: config.flagEmoji
    };
  });
}

/**
 * Helper: Spherical Linear Interpolation (3D Slerp) for Great-Circle Geodesic trajectory.
 * Interpolates on the 3D unit sphere to eliminate all 2D lat/lon coordinate singularities,
 * inflections, and artificial "bumps" near high latitudes (Greenland/Arctic).
 */
function slerp3D(coord1: LatLon, coord2: LatLon, t: number): LatLon {
  const rad = Math.PI / 180;
  const lat1 = coord1.lat * rad;
  const lon1 = coord1.lon * rad;
  const lat2 = coord2.lat * rad;
  const lon2 = coord2.lon * rad;

  // Convert to 3D Cartesian unit vectors
  const v1 = [
    Math.cos(lat1) * Math.cos(lon1),
    Math.cos(lat1) * Math.sin(lon1),
    Math.sin(lat1)
  ];
  const v2 = [
    Math.cos(lat2) * Math.cos(lon2),
    Math.cos(lat2) * Math.sin(lon2),
    Math.sin(lat2)
  ];

  const dot = Math.max(-1, Math.min(1, v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]));
  const omega = Math.acos(dot);

  let x: number, y: number, z: number;
  if (omega < 1e-6) {
    x = (1 - t) * v1[0] + t * v2[0];
    y = (1 - t) * v1[1] + t * v2[1];
    z = (1 - t) * v1[2] + t * v2[2];
  } else {
    const sinOmega = Math.sin(omega);
    const s1 = Math.sin((1 - t) * omega) / sinOmega;
    const s2 = Math.sin(t * omega) / sinOmega;
    x = s1 * v1[0] + s2 * v2[0];
    y = s1 * v1[1] + s2 * v2[1];
    z = s1 * v1[2] + s2 * v2[2];
  }

  const len = Math.hypot(x, y, z);
  x /= len; y /= len; z /= len;

  const lat = Math.asin(z) * (180 / Math.PI);
  const lon = Math.atan2(y, x) * (180 / Math.PI);
  return { lat, lon };
}

/**
 * Get interpolated umbra center coordinates for the current timestamp using 3D Geodesic Slerp
 * based on exact NASA/Espenak Besselian elements via astronomy-engine.
 */
export function getUmbraPosition(timeSeconds: number): LatLon | null {
  const waypoints = UMBRA_PATH_WAYPOINTS;
  const len = waypoints.length;
  if (len === 0 || timeSeconds < waypoints[0].time || timeSeconds > waypoints[len - 1].time) {
    return null;
  }

  for (let i = 0; i < len - 1; i++) {
    const w1 = waypoints[i];
    const w2 = waypoints[i + 1];
    if (timeSeconds >= w1.time && timeSeconds <= w2.time) {
      const duration = w2.time - w1.time;
      const t = duration > 0 ? (timeSeconds - w1.time) / duration : 0;
      return slerp3D(w1.coords, w2.coords, t);
    }
  }

  return waypoints[len - 1].coords;
}

/**
 * Calculate Great-Circle Distance between two LatLon coordinates in kilometers
 */
export function calculateDistanceKm(coord1: LatLon, coord2: LatLon): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lon - coord1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate Sub-Solar Point (where the sun is overhead) for August 12, 2026
 */
export function getSubSolarPoint(timeSeconds: number): LatLon {
  // On Aug 12, Sun declination is approx +14.85 degrees North
  const declination = 14.85;
  // Longitude progresses westward at 15 degrees per hour.
  // At 12:00 UTC (43200s), sub-solar longitude is around 0° (Greenwich meridian equation of time adjustment ~ -5m -> ~ +1.2° E)
  const hoursSinceNoon = (timeSeconds - 43200) / 3600;
  let lon = -1 * (hoursSinceNoon * 15) + 1.2;
  if (lon < -180) lon += 360;
  if (lon > 180) lon -= 360;
  return { lat: declination, lon };
}

/**
 * Calculate Sun Altitude (elevation above horizon in degrees) for August 12, 2026
 * using the standard NOAA Solar Calculator / Jean Meeus Astronomical Algorithms.
 * Computes exact fractional year, equation of time (-5.35 min), daily solar declination (+15.13°),
 * hour angle, and atmospheric refraction correction for precise low-horizon observation.
 */
export function calculateSunAltitude(coords: LatLon, timeSeconds: number): number {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const hours = timeSeconds / 3600;
  // August 12 is Day 224 of the year 2026
  const dayOfYear = 224;
  const fractionalYear = (2 * Math.PI / 365) * (dayOfYear - 1 + (hours - 12) / 24);

  // NOAA Equation of Time in minutes
  const eqtime = 229.18 * (
    0.000075 + 
    0.001868 * Math.cos(fractionalYear) - 
    0.032077 * Math.sin(fractionalYear) - 
    0.014615 * Math.cos(2 * fractionalYear) - 
    0.040849 * Math.sin(2 * fractionalYear)
  );

  // Solar Declination in radians (approx +15.13° on Aug 12, 2026)
  const declRad = 0.006918 - 
    0.399912 * Math.cos(fractionalYear) + 
    0.070257 * Math.sin(fractionalYear) - 
    0.006758 * Math.cos(2 * fractionalYear) + 
    0.000907 * Math.sin(2 * fractionalYear) - 
    0.002697 * Math.cos(3 * fractionalYear) + 
    0.00148 * Math.sin(3 * fractionalYear);

  // Solar Time Offset in minutes: 4 minutes per degree longitude
  const timeOffsetMin = eqtime + 4 * coords.lon;
  const trueSolarTimeMin = (hours * 60 + timeOffsetMin + 1440) % 1440;

  // Hour Angle in radians (-180° to +180°)
  let haDeg = trueSolarTimeMin / 4 - 180;
  if (haDeg < -180) haDeg += 360;
  if (haDeg > 180) haDeg -= 360;
  const haRad = haDeg * rad;

  const latRad = coords.lat * rad;

  // Geometric zenith angle and elevation
  const csz = Math.sin(latRad) * Math.sin(declRad) + Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad);
  const trueAltDeg = Math.asin(Math.max(-1, Math.min(1, csz))) * deg;

  // Atmospheric refraction correction for true visual horizon alignment (Bennett's formula)
  let apparentAlt = trueAltDeg;
  if (trueAltDeg > -1.0) {
    const h = Math.max(-0.5, trueAltDeg);
    const rMinutes = 1.02 / Math.tan((h + 10.3 / (h + 5.11)) * rad);
    apparentAlt = trueAltDeg + rMinutes / 60.0;
  }

  return Math.round(apparentAlt * 10) / 10;
}

/**
 * Calculate telemetry readout for any location at current timestamp
 */
export function calculateTelemetry(coords: LatLon, timeSeconds: number, stationId?: string): TelemetryReadout {
  const umbraPos = getUmbraPosition(timeSeconds);
  const sunAlt = calculateSunAltitude(coords, timeSeconds);

  // If station is known, use exact station timeline windows for high precision
  const station = OBSERVATION_STATIONS.find((s) => s.id === stationId);
  if (station) {
    const parseTimeToSec = (str: string) => {
      const [h, m, s] = str.split(':').map(Number);
      return h * 3600 + m * 60 + (s || 0);
    };

    const tStart = parseTimeToSec(station.eclipseTimes.startPartial);
    const tTotalityStart = parseTimeToSec(station.eclipseTimes.startTotality);
    const tTotalityEnd = parseTimeToSec(station.eclipseTimes.endTotality);
    const tEnd = parseTimeToSec(station.eclipseTimes.endPartial);
    const tPeak = parseTimeToSec(station.eclipseTimes.peakTotality);

    let obscuration = 0;
    let phase: TelemetryReadout['currentPhase'] = "Tutilish yo'q";
    let timeToNext = "Mavjud emas";

    if (timeSeconds < tStart) {
      obscuration = 0;
      phase = "Tutilish yo'q";
      const diff = tStart - timeSeconds;
      timeToNext = `C1 gacha ${Math.floor(diff / 60)} daq ${diff % 60} son`;
    } else if (timeSeconds >= tStart && timeSeconds < tTotalityStart) {
      // Ingress partial
      const progress = (timeSeconds - tStart) / (tTotalityStart - tStart);
      // Sine easing curve for moon overlapping solar disk
      obscuration = Math.min(99.9, Math.round((Math.sin((progress * Math.PI) / 2) * 99.9) * 10) / 10);
      
      if (tTotalityStart - timeSeconds <= 15) {
        phase = 'Olmos uzuk!';
      } else {
        phase = 'Qisman (Boshlanishi)';
      }
      const diff = tTotalityStart - timeSeconds;
      timeToNext = `To'liq tutilishgacha ${Math.floor(diff / 60)} daq ${diff % 60} son`;
    } else if (timeSeconds >= tTotalityStart && timeSeconds <= tTotalityEnd) {
      obscuration = 100.0;
      phase = "TO'LIQ TUTILISH!";
      const diff = tTotalityEnd - timeSeconds;
      timeToNext = `To'liq tutilish tugashiga ${diff} son`;
    } else if (timeSeconds > tTotalityEnd && timeSeconds <= tEnd) {
      const progress = (timeSeconds - tTotalityEnd) / (tEnd - tTotalityEnd);
      obscuration = Math.max(0, Math.round((Math.cos((progress * Math.PI) / 2) * 99.9) * 10) / 10);
      
      if (timeSeconds - tTotalityEnd <= 15) {
        phase = 'Olmos uzuk!';
      } else {
        phase = 'Qisman (Tugashi)';
      }
      const diff = tEnd - timeSeconds;
      timeToNext = `Tutilish tugashiga ${Math.floor(diff / 60)} daq ${diff % 60} son`;
    } else {
      obscuration = 0;
      phase = "Tutilish yo'q";
      timeToNext = 'Tutilish yakunlandi';
    }

    if (sunAlt <= 0 && phase !== "Tutilish yo'q") {
      phase = 'Tutilishdagi quyosh botishi';
    }

    const distToUmbra = umbraPos ? Math.round(calculateDistanceKm(coords, umbraPos)) : 9999;

    return {
      obscurationPercentage: obscuration,
      sunAltitudeDegrees: sunAlt,
      currentPhase: phase,
      timeToNextPhase: timeToNext,
      distanceToUmbraKm: distToUmbra
    };
  }

  // Generic calculation for custom coordinates based on distance to Umbra
  if (!umbraPos) {
    return {
      obscurationPercentage: 0,
      sunAltitudeDegrees: sunAlt,
      currentPhase: "Tutilish yo'q",
      timeToNextPhase: "Mavjud emas",
      distanceToUmbraKm: 9999
    };
  }

  const distKm = calculateDistanceKm(coords, umbraPos);
  // Umbra core radius ~120 km -> 100% totality
  // Penumbra radius ~3500 km -> partial from 99% down to 0%
  let obscuration = 0;
  let phase: TelemetryReadout['currentPhase'] = "Tutilish yo'q";

  if (distKm <= 120) {
    obscuration = 100.0;
    phase = "TO'LIQ TUTILISH!";
  } else if (distKm <= 150) {
    obscuration = 99.8;
    phase = 'Olmos uzuk!';
  } else if (distKm <= 3500) {
    const norm = 1 - (distKm - 120) / (3500 - 120);
    obscuration = Math.max(0.1, Math.round(norm * 99.5 * 10) / 10);
    phase = 'Qisman (Boshlanishi)';
  }

  if (sunAlt <= 0 && phase !== "Tutilish yo'q") {
    phase = 'Tutilishdagi quyosh botishi';
  }

  return {
    obscurationPercentage: obscuration,
    sunAltitudeDegrees: sunAlt,
    currentPhase: phase,
    timeToNextPhase: 'Dinamik hisoblanmoqda',
    distanceToUmbraKm: Math.round(distKm)
  };
}

/**
 * Automatically determine the active observation station based on eclipse progression.
 * In Auto mode, we never show a synthetic "Umbra Center" point; instead, we pin to
 * the upcoming/current station, and a short while after the eclipse totality passes that station,
 * we automatically pin to the next city/station along the path.
 */
export function getAutoTrackingStation(currentTimestamp: number): ObservationStation {
  if (currentTimestamp < 63800) {
    // Before 17:43:20 UTC -> Greenland (Scoresby Sund, totality peak at 17:36:53 UTC)
    return OBSERVATION_STATIONS.find((s) => s.id === 'greenland-ittoqqortoormiit') || OBSERVATION_STATIONS[0];
  } else if (currentTimestamp < 65700) {
    // 17:43:20 to 18:15:00 UTC -> Iceland (Reykjavík, totality peak at 17:47:50 UTC)
    return OBSERVATION_STATIONS.find((s) => s.id === 'iceland-reykjavik') || OBSERVATION_STATIONS[1];
  } else if (currentTimestamp < 66540) {
    // 18:15:00 to 18:29:00 UTC -> Spain (Bilbao, totality peak at 18:27:38 UTC)
    return OBSERVATION_STATIONS.find((s) => s.id === 'spain-bilbao') || OBSERVATION_STATIONS[2];
  } else if (currentTimestamp < 66650) {
    // 18:29:00 to 18:30:50 UTC -> Spain (Zaragoza, totality peak at 18:30:30 UTC)
    return OBSERVATION_STATIONS.find((s) => s.id === 'spain-zaragoza') || OBSERVATION_STATIONS[4];
  } else if (currentTimestamp < 66690) {
    // 18:30:50 to 18:31:30 UTC -> Spain (Valencia, totality peak at 18:31:35 UTC)
    return OBSERVATION_STATIONS.find((s) => s.id === 'spain-valencia') || OBSERVATION_STATIONS[5];
  } else {
    // 18:31:30+ UTC -> Spain (Palma de Mallorca, totality peak at 18:31:53 UTC / Sunset)
    return OBSERVATION_STATIONS.find((s) => s.id === 'spain-palma') || OBSERVATION_STATIONS[6] || OBSERVATION_STATIONS[0];
  }
}

/**
 * Format coordinates to clean string: e.g. "64.1466° N, 21.9426° W"
 */
export function formatCoords(coords: LatLon): string {
  const latStr = `${Math.abs(coords.lat).toFixed(4)}° ${coords.lat >= 0 ? 'N' : 'S'}`;
  const lonStr = `${Math.abs(coords.lon).toFixed(4)}° ${coords.lon >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lonStr}`;
}

/**
 * Convert LatLon (degrees) to Three.js 3D Sphere vector (radius R)
 */
export function latLonToVector3(lat: number, lon: number, radius: number): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return [x, y, z];
}

/**
 * Format Date to Uzbek textual representation (e.g., "18-OKTABR, 2026")
 */
export function formatUzbekDate(date: Date): string {
  const monthsUz = [
    'YANVAR', 'FEVRAL', 'MART', 'APREL', 'MAY', 'IYUN',
    'IYUL', 'AVGUST', 'SENTABR', 'OKTABR', 'NOYABR', 'DEKABR'
  ];
  const day = date.getDate();
  const month = monthsUz[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}, ${year}`;
}

/**
 * Calculate live sub-solar point for any current Date
 */
export function calculateLiveSubSolarPoint(date: Date): LatLon {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (86400 * 1000)) + 1;
  const fractionalYear = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (utcHours - 12) / 24);

  // NOAA Equation of Time in minutes
  const eqtime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(fractionalYear) -
    0.032077 * Math.sin(fractionalYear) -
    0.014615 * Math.cos(2 * fractionalYear) -
    0.040849 * Math.sin(2 * fractionalYear)
  );

  // Solar Declination
  const declRad = 0.006918 -
    0.399912 * Math.cos(fractionalYear) +
    0.070257 * Math.sin(fractionalYear) -
    0.006758 * Math.cos(2 * fractionalYear) +
    0.000907 * Math.sin(2 * fractionalYear) -
    0.002697 * Math.cos(3 * fractionalYear) +
    0.00148 * Math.sin(3 * fractionalYear);

  const declDeg = declRad * (180 / Math.PI);

  // Greenwich solar time
  const gmtSolarTimeMin = utcHours * 60 + eqtime;
  let lon = -1 * ((gmtSolarTimeMin / 4) - 180);
  while (lon > 180) lon -= 360;
  while (lon < -180) lon += 360;

  return { lat: declDeg, lon };
}

/**
 * Calculate real-time live Sun altitude above horizon for any location and Date
 */
export function calculateLiveSunAltitude(coords: LatLon, date: Date): number {
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (86400 * 1000)) + 1;
  const fractionalYear = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (utcHours - 12) / 24);

  const eqtime = 229.18 * (
    0.000075 +
    0.001868 * Math.cos(fractionalYear) -
    0.032077 * Math.sin(fractionalYear) -
    0.014615 * Math.cos(2 * fractionalYear) -
    0.040849 * Math.sin(2 * fractionalYear)
  );

  const declRad = 0.006918 -
    0.399912 * Math.cos(fractionalYear) +
    0.070257 * Math.sin(fractionalYear) -
    0.006758 * Math.cos(2 * fractionalYear) +
    0.000907 * Math.sin(2 * fractionalYear) -
    0.002697 * Math.cos(3 * fractionalYear) +
    0.00148 * Math.sin(3 * fractionalYear);

  const timeOffsetMin = eqtime + 4 * coords.lon;
  const trueSolarTimeMin = (utcHours * 60 + timeOffsetMin + 1440) % 1440;
  let haDeg = trueSolarTimeMin / 4 - 180;
  if (haDeg < -180) haDeg += 360;
  if (haDeg > 180) haDeg -= 360;
  const haRad = haDeg * (Math.PI / 180);

  const latRad = coords.lat * (Math.PI / 180);
  const csz = Math.sin(latRad) * Math.sin(declRad) + Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad);
  const trueAltDeg = Math.asin(Math.max(-1, Math.min(1, csz))) * (180 / Math.PI);

  let apparentAlt = trueAltDeg;
  if (trueAltDeg > -1.0) {
    const h = Math.max(-0.5, trueAltDeg);
    const rMinutes = 1.02 / Math.tan((h + 10.3 / (h + 5.11)) * (Math.PI / 180));
    apparentAlt = trueAltDeg + rMinutes / 60.0;
  }
  return Math.round(apparentAlt * 10) / 10;
}

/**
 * Calculate live Moon Phase and Illumination Percentage for any Date
 */
export function calculateLiveMoonPhase(date: Date): { phaseName: string; fraction: number; phaseAngle: number; emoji: string } {
  // Reference known new moon: Jan 11, 2024 at 11:57 UTC
  const refNewMoon = new Date('2024-01-11T11:57:00Z').getTime();
  const synodicMonth = 29.530588853 * 86400 * 1000;
  const diff = date.getTime() - refNewMoon;
  const phaseCycle = ((diff % synodicMonth) + synodicMonth) % synodicMonth;
  const phaseAngle = (phaseCycle / synodicMonth) * 360;

  // Illumination fraction (0 to 100%)
  const fraction = Math.round((0.5 * (1 - Math.cos((phaseAngle * Math.PI) / 180))) * 100);

  let phaseName = 'Yangi oy';
  let emoji = '🌑';

  if (phaseAngle >= 337.5 || phaseAngle < 22.5) {
    phaseName = 'Yangi oy';
    emoji = '🌑';
  } else if (phaseAngle >= 22.5 && phaseAngle < 67.5) {
    phaseName = "O'suvchi hilol";
    emoji = '🌒';
  } else if (phaseAngle >= 67.5 && phaseAngle < 112.5) {
    phaseName = 'Birinchi chorak';
    emoji = '🌓';
  } else if (phaseAngle >= 112.5 && phaseAngle < 157.5) {
    phaseName = "O'suvchi to'lin oy";
    emoji = '🌔';
  } else if (phaseAngle >= 157.5 && phaseAngle < 202.5) {
    phaseName = "To'lin oy";
    emoji = '🌕';
  } else if (phaseAngle >= 202.5 && phaseAngle < 247.5) {
    phaseName = 'Kamayuvchi to\'lin oy';
    emoji = '🌖';
  } else if (phaseAngle >= 247.5 && phaseAngle < 292.5) {
    phaseName = 'Oxirgi chorak';
    emoji = '🌗';
  } else {
    phaseName = 'Kamayuvchi hilol';
    emoji = '🌘';
  }

  return { phaseName, fraction, phaseAngle, emoji };
}

/**
 * Calculate live Sun Azimuth (degrees and cardinal compass direction) for any location
 */
export function calculateLiveSunAzimuth(coords: LatLon, date: Date): LiveSunAzimuth {
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (86400 * 1000)) + 1;

  // Approximate Sun Declination
  const deltaDeg = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
  const delta = (deltaDeg * Math.PI) / 180;
  const phi = (coords.lat * Math.PI) / 180;

  // Equation of Time in minutes
  const b = ((2 * Math.PI) / 365) * (dayOfYear - 81);
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

  // UTC decimal hours and Local Solar Time
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const lst = (utcHours + coords.lon / 15 + eot / 60 + 24) % 24;

  // Hour Angle
  const hAngle = (lst - 12) * 15 * (Math.PI / 180);

  // Solar Altitude
  const sinAlt = Math.sin(phi) * Math.sin(delta) + Math.cos(phi) * Math.cos(delta) * Math.cos(hAngle);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));

  // Solar Azimuth
  const cosAz = (Math.sin(delta) - Math.sin(phi) * Math.sin(alt)) / (Math.cos(phi) * Math.cos(alt));
  let azDeg = Math.acos(Math.max(-1, Math.min(1, cosAz))) * (180 / Math.PI);

  if (Math.sin(hAngle) > 0) {
    azDeg = 360 - azDeg;
  }

  // Compass Cardinal
  let cardinalUz = "Shimol (N)";
  if (azDeg >= 337.5 || azDeg < 22.5) cardinalUz = "Shimol (N)";
  else if (azDeg >= 22.5 && azDeg < 67.5) cardinalUz = "Shimoli-Sharq (NE)";
  else if (azDeg >= 67.5 && azDeg < 112.5) cardinalUz = "Sharq (E)";
  else if (azDeg >= 112.5 && azDeg < 157.5) cardinalUz = "Janubi-Sharq (SE)";
  else if (azDeg >= 157.5 && azDeg < 202.5) cardinalUz = "Janub (S)";
  else if (azDeg >= 202.5 && azDeg < 247.5) cardinalUz = "Janubi-G'arb (SW)";
  else if (azDeg >= 247.5 && azDeg < 292.5) cardinalUz = "G'arb (W)";
  else cardinalUz = "Shimoli-G'arb (NW)";

  return {
    degrees: azDeg,
    formatted: `${azDeg.toFixed(1)}°`,
    cardinalUz
  };
}

/**
 * Known Global Solar Eclipses Catalog
 */
const SOLAR_ECLIPSES_CATALOG = [
  {
    name: '2027-yil 6-fevral Halqasimon Quyosh Tutilishi',
    typeUz: 'Halqasimon' as const,
    dateStrUz: '6-fevral, 2027-yil',
    targetDate: new Date('2027-02-06T16:00:00Z'),
    saros: 'Saros 131',
    regions: "Janubiy Amerika (Chili, Argentina) va Antarktida"
  },
  {
    name: '2027-yil 2-avgust To\'liq Quyosh Tutilishi',
    typeUz: 'To\'liq' as const,
    dateStrUz: '2-avgust, 2027-yil',
    targetDate: new Date('2027-08-02T10:07:00Z'),
    saros: 'Saros 136',
    regions: "Gibraltar, Ispaniya, Marokash, Jazoir, Tunis, Liviya, Misr (Luksor 6 daq 23 son!)"
  },
  {
    name: '2028-yil 26-yanvar Halqasimon Quyosh Tutilishi',
    typeUz: 'Halqasimon' as const,
    dateStrUz: '26-yanvar, 2028-yil',
    targetDate: new Date('2028-01-26T15:00:00Z'),
    saros: 'Saros 141',
    regions: "Ekvador, Peru, Braziliya, Portugaliya, Ispaniya"
  },
  {
    name: '2028-yil 22-iyul To\'liq Quyosh Tutilishi',
    typeUz: 'To\'liq' as const,
    dateStrUz: '22-iyul, 2028-yil',
    targetDate: new Date('2028-07-22T02:56:00Z'),
    saros: 'Saros 146',
    regions: "Avstraliya (Sidney), Yangi Zelandiya"
  }
];

export function calculateCountdownForDate(targetDate: Date, currentDate: Date): EclipseCountdown {
  const diff = targetDate.getTime() - currentDate.getTime();

  if (diff <= 0) {
    const elapsed = Math.abs(diff);
    const d = Math.floor(elapsed / (86400 * 1000));
    const h = Math.floor((elapsed % (86400 * 1000)) / (3600 * 1000));
    const m = Math.floor((elapsed % (3600 * 1000)) / (60 * 1000));
    const s = Math.floor((elapsed % (60 * 1000)) / 1000);
    return {
      days: d,
      hours: h,
      minutes: m,
      seconds: s,
      isPast: true,
      formatted: `${d} kun ${h} soat oldin o'tgan`
    };
  }

  const days = Math.floor(diff / (86400 * 1000));
  const hours = Math.floor((diff % (86400 * 1000)) / (3600 * 1000));
  const minutes = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diff % (60 * 1000)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    formatted: `${days} kun ${hours} soat ${minutes} daq ${seconds} son`
  };
}

/**
 * Automatically determine the next upcoming solar eclipse and the next total eclipse
 */
export function getNextSolarEclipses(currentDate: Date): { nextEclipse: NextEclipseInfo; nextTotalEclipse: NextEclipseInfo } {
  const nowMs = currentDate.getTime();

  // Find next upcoming solar eclipse
  let next = SOLAR_ECLIPSES_CATALOG.find((e) => e.targetDate.getTime() > nowMs);
  if (!next) {
    next = SOLAR_ECLIPSES_CATALOG[0];
  }

  // Find next upcoming total solar eclipse
  let nextTotal = SOLAR_ECLIPSES_CATALOG.find((e) => e.typeUz === "To'liq" && e.targetDate.getTime() > nowMs);
  if (!nextTotal) {
    nextTotal = SOLAR_ECLIPSES_CATALOG[1];
  }

  return {
    nextEclipse: {
      ...next,
      countdown: calculateCountdownForDate(next.targetDate, currentDate)
    },
    nextTotalEclipse: {
      ...nextTotal,
      countdown: calculateCountdownForDate(nextTotal.targetDate, currentDate)
    }
  };
}

/**
 * Calculate countdown to the next solar eclipse
 */
export function calculateEclipseCountdown(currentDate: Date): EclipseCountdown {
  const { nextEclipse } = getNextSolarEclipses(currentDate);
  return nextEclipse.countdown;
}

/**
 * Get formatted local time for a country offset from a Date object
 */
export function getLiveTimeForOffset(date: Date, offsetHours: number): { timeStr: string; ampm: string; seconds: number } {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const targetDate = new Date(utcMs + offsetHours * 3600000);

  const hours = targetDate.getHours();
  const mins = targetDate.getMinutes();
  const secs = targetDate.getSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;

  return {
    timeStr: `${h12}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
    ampm,
    seconds: hours * 3600 + mins * 60 + secs
  };
}

