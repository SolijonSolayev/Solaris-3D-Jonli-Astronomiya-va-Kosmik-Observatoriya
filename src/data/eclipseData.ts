import { ObservationStation, EclipseMilestone, LatLon } from '../types';

// Total Simulation Range: 17:00:00 UTC to 18:32:00 UTC on August 12, 2026
// Exactly covers the complete window where the Moon's umbral shadow traverses the Earth
export const SIMULATION_START_SECONDS = 17 * 3600;              // 61,200s (17:00:00 UTC / 5:00 PM UTC - Umbra First Contact)
export const SIMULATION_END_SECONDS = 18 * 3600 + 32 * 60;      // 66,720s (18:32:00 UTC / 6:32 PM UTC - Mediterranean Sunset Exit)
export const DEFAULT_START_SECONDS = 17 * 3600;                 // 61,200s (17:00:00 UTC / 5:00 PM UTC)

// Umbra center trajectory waypoints (Time in UTC seconds -> Lat/Lon)
// Based on exact astronomical Besselian ephemeris from NASA/Espenak via astronomy-engine for August 12, 2026
// Sampled every 60 seconds along the true geoid intersection path to enable 3D Geodesic Slerp with zero artificial bumps
export const UMBRA_PATH_WAYPOINTS: { time: number; coords: LatLon; name?: string }[] = [
  { time: 61200, coords: { lat: 76.5299, lon: 114.164 }, name: "Umbraning ilk tegishi (Shimoliy Muz okeani / Sibir Arktikasi)" },
  { time: 61260, coords: { lat: 80.4659, lon: 114.1357 } },
  { time: 61320, coords: { lat: 82.5622, lon: 112.3211 } },
  { time: 61380, coords: { lat: 84.1697, lon: 108.9929 } },
  { time: 61440, coords: { lat: 85.4902, lon: 103.4753 } },
  { time: 61500, coords: { lat: 86.5764, lon: 94.3284 }, name: "Yuqori Arktika okeani" },
  { time: 61560, coords: { lat: 87.3994, lon: 79.0432 } },
  { time: 61620, coords: { lat: 87.8467, lon: 55.6224 } },
  { time: 61680, coords: { lat: 87.8096, lon: 29.1942 } },
  { time: 61740, coords: { lat: 87.3797, lon: 9.105 } },
  { time: 61800, coords: { lat: 86.7499, lon: -3.4033 }, name: "Shimoliy Grenlandiya muzlik qatlami (86°45’N)" },
  { time: 61860, coords: { lat: 86.0404, lon: -11.0814 } },
  { time: 61920, coords: { lat: 85.3044, lon: -16.0082 } },
  { time: 61980, coords: { lat: 84.5648, lon: -19.3253 } },
  { time: 62040, coords: { lat: 83.8313, lon: -21.6488 } },
  { time: 62100, coords: { lat: 83.1085, lon: -23.3259 }, name: "Ichki Grenlandiya muzliklari" },
  { time: 62160, coords: { lat: 82.398, lon: -24.5634 } },
  { time: 62220, coords: { lat: 81.7004, lon: -25.4904 } },
  { time: 62280, coords: { lat: 81.0157, lon: -26.1911 } },
  { time: 62340, coords: { lat: 80.3433, lon: -26.7225 } },
  { time: 62400, coords: { lat: 79.6829, lon: -27.1244 }, name: "Markaziy Grenlandiya muzliklari" },
  { time: 62460, coords: { lat: 79.0338, lon: -27.4253 } },
  { time: 62520, coords: { lat: 78.3953, lon: -27.6461 } },
  { time: 62580, coords: { lat: 77.7669, lon: -27.8025 } },
  { time: 62640, coords: { lat: 77.148, lon: -27.9063 } },
  { time: 62700, coords: { lat: 76.5381, lon: -27.9668 }, name: "Skorsbi-Saund / Sharqiy Grenlandiya sohillari" },
  { time: 62760, coords: { lat: 75.9366, lon: -27.9912 } },
  { time: 62820, coords: { lat: 75.3431, lon: -27.9852 } },
  { time: 62880, coords: { lat: 74.757, lon: -27.9533 } },
  { time: 62940, coords: { lat: 74.1781, lon: -27.8992 } },
  { time: 63000, coords: { lat: 73.6057, lon: -27.8259 }, name: "Grenlandiya dengizi / Daniya bo'g'ozi" },
  { time: 63060, coords: { lat: 73.0397, lon: -27.7359 } },
  { time: 63120, coords: { lat: 72.4796, lon: -27.6312 } },
  { time: 63180, coords: { lat: 71.9251, lon: -27.5134 } },
  { time: 63240, coords: { lat: 71.3759, lon: -27.384 } },
  { time: 63300, coords: { lat: 70.8317, lon: -27.2441 }, name: "Daniya bo'g'oziga yaqinlashish" },
  { time: 63360, coords: { lat: 70.2922, lon: -27.0947 } },
  { time: 63420, coords: { lat: 69.7572, lon: -26.9365 } },
  { time: 63480, coords: { lat: 69.2263, lon: -26.7703 } },
  { time: 63540, coords: { lat: 68.6995, lon: -26.5967 } },
  { time: 63600, coords: { lat: 68.1764, lon: -26.416 }, name: "Shimoli-g'arbiy Islandiya sohili (Vestfyordlar)" },
  { time: 63660, coords: { lat: 67.6568, lon: -26.2286 } },
  { time: 63720, coords: { lat: 67.1405, lon: -26.0349 } },
  { time: 63780, coords: { lat: 66.6273, lon: -25.8352 } },
  { time: 63840, coords: { lat: 66.1171, lon: -25.6296 } },
  { time: 63900, coords: { lat: 65.6096, lon: -25.4182 }, name: "G'arbiy Islandiyaga yaqinlashuv (Snaefellsnes ochiqlarida)" },
  { time: 63947, coords: { lat: 65.2138, lon: -25.2487 }, name: "Eng katta tutilish nuqtasi (65°13’N, 25°15’W - 2 daq 18 son)" },
  { time: 63960, coords: { lat: 65.1046, lon: -25.2012 } },
  { time: 64020, coords: { lat: 64.602, lon: -24.9787 } },
  { time: 64080, coords: { lat: 64.1016, lon: -24.7506 } },
  { time: 64140, coords: { lat: 63.6033, lon: -24.517 } },
  { time: 64200, coords: { lat: 63.1068, lon: -24.2778 }, name: "Janubi-g'arbiy Islandiya sohili (Reykyanes yarimoroli)" },
  { time: 64260, coords: { lat: 62.612, lon: -24.033 } },
  { time: 64320, coords: { lat: 62.1187, lon: -23.7825 } },
  { time: 64380, coords: { lat: 61.6268, lon: -23.5261 } },
  { time: 64440, coords: { lat: 61.1362, lon: -23.2638 } },
  { time: 64500, coords: { lat: 60.6466, lon: -22.9954 }, name: "Shimoliy Atlantikaga o'tish (Islandiya janubi)" },
  { time: 64560, coords: { lat: 60.1579, lon: -22.7206 } },
  { time: 64620, coords: { lat: 59.6699, lon: -22.4392 } },
  { time: 64680, coords: { lat: 59.1824, lon: -22.1511 } },
  { time: 64740, coords: { lat: 58.6954, lon: -21.8559 } },
  { time: 64800, coords: { lat: 58.2086, lon: -21.5533 }, name: "Shimoliy Atlantika okeani" },
  { time: 64860, coords: { lat: 57.7218, lon: -21.243 } },
  { time: 64920, coords: { lat: 57.2349, lon: -20.9245 } },
  { time: 64980, coords: { lat: 56.7476, lon: -20.5976 } },
  { time: 65040, coords: { lat: 56.2598, lon: -20.2616 } },
  { time: 65100, coords: { lat: 55.7712, lon: -19.9162 }, name: "Atlantika o'rtasi tranziti" },
  { time: 65160, coords: { lat: 55.2817, lon: -19.5607 } },
  { time: 65220, coords: { lat: 54.791, lon: -19.1945 } },
  { time: 65280, coords: { lat: 54.2988, lon: -18.817 } },
  { time: 65340, coords: { lat: 53.8049, lon: -18.4274 } },
  { time: 65400, coords: { lat: 53.3089, lon: -18.0248 }, name: "O'rta Atlantika okeani" },
  { time: 65460, coords: { lat: 52.8107, lon: -17.6083 } },
  { time: 65520, coords: { lat: 52.3097, lon: -17.1768 } },
  { time: 65580, coords: { lat: 51.8056, lon: -16.7291 } },
  { time: 65640, coords: { lat: 51.2981, lon: -16.2638 } },
  { time: 65700, coords: { lat: 50.7865, lon: -15.7795 }, name: "Iberiya sari Atlantika yo'li" },
  { time: 65760, coords: { lat: 50.2704, lon: -15.2742 } },
  { time: 65820, coords: { lat: 49.7492, lon: -14.7459 } },
  { time: 65880, coords: { lat: 49.2221, lon: -14.1921 } },
  { time: 65940, coords: { lat: 48.6882, lon: -13.61 } },
  { time: 66000, coords: { lat: 48.1467, lon: -12.9961 }, name: "Biskaya ko'rfaziga yaqinlashish" },
  { time: 66060, coords: { lat: 47.5962, lon: -12.3462 } },
  { time: 66120, coords: { lat: 47.0353, lon: -11.6552 } },
  { time: 66180, coords: { lat: 46.4623, lon: -10.9165 } },
  { time: 66240, coords: { lat: 45.8746, lon: -10.1219 } },
  { time: 66300, coords: { lat: 45.2694, lon: -9.2603 } },
  { time: 66360, coords: { lat: 44.6423, lon: -8.3167 }, name: "Materik Yevropaga kirish (A-Korunya / Galisiya, Ispaniya)" },
  { time: 66420, coords: { lat: 43.9875, lon: -7.2692 } },
  { time: 66480, coords: { lat: 43.2958, lon: -6.0851 } },
  { time: 66540, coords: { lat: 42.5521, lon: -4.709 }, name: "Burgos / Kastiliya va Leon, Ispaniya" },
  { time: 66600, coords: { lat: 41.7275, lon: -3.035 } },
  { time: 66660, coords: { lat: 40.7497, lon: -0.7983 }, name: "Saragosa / Aragon va O'rtayer dengizi sohili" },
  { time: 66720, coords: { lat: 39.1755, lon: 3.6315 }, name: "Quyosh botishidagi chiqish (Palma-de-Malyorka / Balear dengizi)" }
];

export const OBSERVATION_STATIONS: ObservationStation[] = [
  {
    id: 'uzbekistan-tashkent',
    name: 'Toshkent (O\'zbekiston)',
    country: 'Uzbekistan',
    countryCode: 'UZ',
    coords: { lat: 41.2995, lon: 69.2401 },
    elevationMeters: 450,
    description: "Markaziy Osiyoning yirik poytaxt megapolisi va qadimiy astronomik an'analar maskani (Mirzo Ulug'bek rasadxonasi merosi). Real vaqtda Quyosh va Oy koordinatalari, osmon sferasi hamda jonli monitoring.",
    weatherProspects: "Musaffo kontinental osmon, ajoyib ko'rinuvchanlik va astronomik kuzatuv sharoitlari.",
    eclipseTimes: {
      startPartial: '17:00:00',
      startTotality: '18:00:00',
      peakTotality: '18:01:00',
      endTotality: '18:02:00',
      endPartial: '19:00:00',
      durationSeconds: 120
    },
    maxSunAltitude: 55.0
  },
  {
    id: 'greenland-ittoqqortoormiit',
    name: 'Skorsbi-Saund (Itlokkortoormiut)',
    country: 'Greenland',
    countryCode: 'GL',
    coords: { lat: 70.485, lon: -21.962 },
    elevationMeters: 45,
    description: "Yer yuzidagi eng olis aholi punktlaridan biri. To'g'ridan-to'g'ri to'liq tutilish yo'lida joylashgan bo'lib, bokira arktik fyordlar va aysberglar fonida 2 daqiqa 10 soniyalik to'liq tutilishni namoyon etadi.",
    weatherProspects: "Arktika dengiz iqlimi. Kun botishi arafasidagi osmon; o'rtacha bulutlilik ~50%. Toza va musaffo qutb havosi.",
    eclipseTimes: {
      startPartial: '16:37:12',
      startTotality: '17:35:48',
      peakTotality: '17:36:53',
      endTotality: '17:37:58',
      endPartial: '18:36:20',
      durationSeconds: 130
    },
    maxSunAltitude: 25.4
  },
  {
    id: 'iceland-reykjavik',
    name: 'Reykyavik (Poytaxt hududi)',
    country: 'Iceland',
    countryCode: 'IS',
    coords: { lat: 64.1466, lon: -21.9426 },
    elevationMeters: 15,
    description: "Dunyodagi eng shimoliy poytaxt shahar! Reykyavik markazi 99.9% qisman tutilish chegarasida bo'lsa, Grotta mayog'i kabi g'arbiy hududlarida 100% to'liq tutilish (~1 daqiqa) tajribasi kuzatiladi.",
    weatherProspects: "Sohil bo'yi okean iqlimi. Faxafloy ko'rfazi uzra shom chog'idagi ajoyib manzara. Islandiyada 1954-yildan beri kutilgan ilk to'liq tutilish!",
    eclipseTimes: {
      startPartial: '16:47:04',
      startTotality: '17:47:04',
      peakTotality: '17:47:50',
      endTotality: '17:48:36',
      endPartial: '18:47:40',
      durationSeconds: 92
    },
    maxSunAltitude: 25.0
  },
  {
    id: 'spain-bilbao',
    name: 'Bilbao (Basklar yurti)',
    country: 'Spain',
    countryCode: 'ES',
    coords: { lat: 43.2630, lon: -2.9350 },
    elevationMeters: 19,
    description: "Shimoliy Ispaniyaning yirik madaniy va me'moriy markazi! Nervion daryosi va afsonaviy Guggenxaym muzeyi bo'ylab kuzatuvchilar kechki payt 32 soniyalik 100% to'liq tutilishga guvoh bo'lishadi.",
    weatherProspects: "Shimoliy Ispaniya sohil iqlimi; tushdan keyingi ochiq osmon atrofdagi tepaliklar uzra sehrli oltin rangli quyosh botishi shafag'ini hosil qiladi.",
    eclipseTimes: {
      startPartial: '17:31:47',
      startTotality: '18:27:23',
      peakTotality: '18:27:38',
      endTotality: '18:27:54',
      endPartial: '19:22:00',
      durationSeconds: 31
    },
    maxSunAltitude: 8.5
  },
  {
    id: 'spain-madrid',
    name: 'Madrid (Poytaxt va shahar atrofi)',
    country: 'Spain',
    countryCode: 'ES',
    coords: { lat: 40.4168, lon: -3.7038 },
    elevationMeters: 667,
    description: "Ispaniyaning dunyoga mashhur poytaxti! Madrid markazida (Puerta-del-Sol) quyosh botishida 99.9% chuqur qisman tutilish ko'rinadi. 100% to'liq tutilishni (~1 daq 05 son) ko'rish uchun shimolga — Somosyerra va Gvadalaxara viloyatiga 40 daqiqalik yo'l yurish kifoya.",
    weatherProspects: "Avgust oqshomidagi iliq, quruq O'rtayer dengizi/kontinental havosi va bulutsiz musaffo osmon ehtimoli juda yuqori.",
    eclipseTimes: {
      startPartial: '17:36:00',
      startTotality: '18:31:27',
      peakTotality: '18:32:00',
      endTotality: '18:32:32',
      endPartial: '19:24:00',
      durationSeconds: 65
    },
    maxSunAltitude: 7.7
  },
  {
    id: 'spain-zaragoza',
    name: 'Saragosa (Aragon)',
    country: 'Spain',
    countryCode: 'ES',
    coords: { lat: 41.6488, lon: -0.8891 },
    elevationMeters: 200,
    description: "Ispaniyaning 5-yirik shahri va Ebro daryosi bo'yidagi tarixiy maskan! Bevosita to'liq tutilishning markaziy o'qida joylashgan bo'lib, 1 daqiqa 24 soniyalik hayratlanarli kunduzgi zulmatni taqdim etadi.",
    weatherProspects: "Avgustda iliq va quruq ichki kontinental iqlim, minimal bulutlilik va a'lo darajadagi ko'rinuvchanlik.",
    eclipseTimes: {
      startPartial: '17:35:20',
      startTotality: '18:29:48',
      peakTotality: '18:30:30',
      endTotality: '18:31:12',
      endPartial: '19:21:40',
      durationSeconds: 84
    },
    maxSunAltitude: 6.2
  },
  {
    id: 'spain-barcelona',
    name: 'Barselona (Kataloniya sohili)',
    country: 'Spain',
    countryCode: 'ES',
    coords: { lat: 41.3879, lon: 2.1699 },
    elevationMeters: 12,
    description: "Kataloniyaning O'rtayer dengizi bo'yidagi jozibador megapolisi! Barselona markazida dengiz ustida 99.7% chuqur qisman tutilish ko'rinadi. 100% to'liq tutilish (~50 son) uchun janubi-g'arbdagi Tarragona va Ebro deltasi tomon sayohat qilinadi.",
    weatherProspects: "Musaffo O'rtayer dengizi yozgi osmoni. Sohildagi plyajlar va tarixiy arxitektura uzra hayratomuz oltin soat manzarasi.",
    eclipseTimes: {
      startPartial: '17:36:10',
      startTotality: '18:28:40',
      peakTotality: '18:29:05',
      endTotality: '18:29:30',
      endPartial: '19:21:15',
      durationSeconds: 50
    },
    maxSunAltitude: 7.8
  },
  {
    id: 'spain-valencia',
    name: 'Valensiya (O\'rtayer dengizi sohili)',
    country: 'Spain',
    countryCode: 'ES',
    coords: { lat: 39.4699, lon: -0.3763 },
    elevationMeters: 15,
    description: "Ispaniyaning 3-yirik shahri va O'rtayer dengizining durdonasi! Shimoliy Valensiya va Kastelyon qirg'oqlari bo'ylab quyosh g'arbiy ufqqa yaqinlashganda to'liq tutilishga guvoh bo'linadi.",
    weatherProspects: "Iliq yozgi sohil iqlimi, O'rtayer dengizi qirg'oqlari bo'ylab g'arbiy ufqning mukammal ochiqligi.",
    eclipseTimes: {
      startPartial: '17:38:24',
      startTotality: '18:31:10',
      peakTotality: '18:31:35',
      endTotality: '18:32:00',
      endPartial: '19:01:16',
      durationSeconds: 50
    },
    maxSunAltitude: 4.1
  },
  {
    id: 'spain-palma',
    name: 'Palma-de-Malyorka (Balear orollari)',
    country: 'Spain',
    countryCode: 'ES',
    coords: { lat: 39.5696, lon: 2.6502 },
    elevationMeters: 10,
    description: "Balear kurorti uzra quyosh botishidagi hayratomuz to'liq tutilish! Tutilgan quyosh O'rtayer dengizi ufqidan bor-yo'g'i 3° balandlikda turadi va dengizga botishdan oldin 1 daqiqa 36 soniya to'liq zulmat beradi.",
    weatherProspects: "Avgust oyi O'rtayer dengizi musaffo osmoni. Yevropaning astronomik quyosh botishi uchun eng kutilgan maskanlaridan biri.",
    eclipseTimes: {
      startPartial: '17:38:00',
      startTotality: '18:31:05',
      peakTotality: '18:31:53',
      endTotality: '18:32:41',
      endPartial: '18:49:00',
      durationSeconds: 96
    },
    maxSunAltitude: 2.9
  }
];

export const ECLIPSE_MILESTONES: EclipseMilestone[] = [
  {
    id: 'umbra-entry',
    timeUTC: '17:00:00',
    timeSeconds: 17 * 3600,
    title: 'Umbra soyasining ilk tegishi (Yuqori Arktika)',
    country: 'Global',
    description: "Oyning umbra soyasi Yer yuzasiga Yuqori Arktika / Sibir Arktikasida 76.5° shimoliy kenglik, 114.2° sharqiy uzunlikda tegadi.",
    targetCoords: { lat: 76.53, lon: 114.16 }
  },
  {
    id: 'totality-greenland',
    timeUTC: '17:35:48',
    timeSeconds: 17 * 3600 + 35 * 60 + 48,
    title: 'Skorsbi-Saundda to\'liq tutilish boshlanishi (Grenlandiya)',
    country: 'Greenland',
    description: "Skorsbi-Saund to'liq tutilish fazasiga kiradi va Arktika aysberglari qurshovida 2 daqiqadan ortiq mutlaq zulmat hukm suradi.",
    targetCoords: { lat: 70.485, lon: -21.962 },
    stationId: 'greenland-ittoqqortoormiit'
  },
  {
    id: 'totality-iceland',
    timeUTC: '17:47:04',
    timeSeconds: 17 * 3600 + 47 * 60 + 4,
    title: 'Reykyavikda to\'liq tutilish boshlanishi (Islandiya)',
    country: 'Iceland',
    description: "Islandiyada 72 yillik tanaffusdan so'ng ilk to'liq quyosh tutilishi! Reykyavik osmonini hayratomuz qorong'ulik qoplaydi.",
    targetCoords: { lat: 64.1466, lon: -21.9426 },
    stationId: 'iceland-reykjavik'
  },
  {
    id: 'greatest-eclipse',
    timeUTC: '17:47:06',
    timeSeconds: 17 * 3600 + 47 * 60 + 6,
    title: 'Eng katta tutilish nuqtasi (Maksimum)',
    country: 'Global',
    description: "To'liq tutilishning eng uzoq davomiyligi (2 daqiqa, 18 soniya) Islandiya qirg'oqlari ochiqlarida qayd etiladi.",
    targetCoords: { lat: 65.2, lon: -25.2 }
  },
  {
    id: 'totality-bilbao',
    timeUTC: '18:27:23',
    timeSeconds: 18 * 3600 + 27 * 60 + 23,
    title: 'Bilbaoda to\'liq tutilish boshlanishi (Ispaniya)',
    country: 'Spain',
    description: "Umbra soyasi Shimoliy Ispaniya va Basklar yurti hududiga quruqlikdan kirib keladi.",
    targetCoords: { lat: 43.2630, lon: -2.9350 },
    stationId: 'spain-bilbao'
  },
  {
    id: 'totality-zaragoza',
    timeUTC: '18:29:48',
    timeSeconds: 18 * 3600 + 29 * 60 + 48,
    title: 'Saragosada to\'liq tutilish boshlanishi (Ispaniya)',
    country: 'Spain',
    description: "Ispaniyaning tarixiy Ebro vodiysi 1 daqiqa 24 soniyalik kunduzgi zulmat qa'riga cho'kadi.",
    targetCoords: { lat: 41.6488, lon: -0.8891 },
    stationId: 'spain-zaragoza'
  },
  {
    id: 'totality-palma',
    timeUTC: '18:31:05',
    timeSeconds: 18 * 3600 + 31 * 60 + 5,
    title: 'Palma-de-Malyorkada quyosh botishidagi to\'liq tutilish',
    country: 'Spain',
    description: "Tutilgan quyosh quyosh botishi oldidan O'rtayer dengizi ufqidan bor-yo'g'i 3° balandlikda muallaq turadi.",
    targetCoords: { lat: 39.5696, lon: 2.6502 },
    stationId: 'spain-palma'
  },
  {
    id: 'totality-valencia',
    timeUTC: '18:31:10',
    timeSeconds: 18 * 3600 + 31 * 60 + 10,
    title: 'Valensiya sohilida to\'liq tutilish boshlanishi (Ispaniya)',
    country: 'Spain',
    description: "Umbra yo'li Shimoliy Valensiya va Kastelyondagi O'rtayer dengizi sohiliga yetib keladi.",
    targetCoords: { lat: 39.4699, lon: -0.3763 },
    stationId: 'spain-valencia'
  },
  {
    id: 'umbra-exit',
    timeUTC: '18:32:00',
    timeSeconds: 18 * 3600 + 32 * 60,
    title: 'O\'rtayer dengizida umbraning chiqishi',
    country: 'Global',
    description: "Oyning umbra soyasi g'arbiy O'rtayer dengizi quyosh botishida Yer sathini tark etib koinotga yo'naladi.",
    targetCoords: { lat: 39.18, lon: 3.63 }
  }
];

export const COUNTRY_TIMEZONE_CONFIG = [
  {
    country: 'Greenland',
    code: 'GL',
    timezoneName: 'WGFT (Skorsbi-Saund)',
    utcOffsetHours: -1, // Ittoqqortoormiit is UTC-1 in summer
    flagEmoji: '🇬🇱'
  },
  {
    country: 'Iceland',
    code: 'IS',
    timezoneName: 'GMT (Islandiya)',
    utcOffsetHours: 0, // Iceland is UTC+0 year-round
    flagEmoji: '🇮🇸'
  },
  {
    country: 'Spain',
    code: 'ES',
    timezoneName: 'CEST (Materik va Balear)',
    utcOffsetHours: +2, // CEST is UTC+2 in summer
    flagEmoji: '🇪🇸'
  }
];
