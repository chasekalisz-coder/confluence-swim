// ============================================================
// championship-standards.js
// ============================================================
// Higher-level domestic standards beyond USA Swimming motivational times.
//
// Four national-level standards (no age groups — single cut per event):
//   FUTURES     — first national-level meet (stepping stone below Jr Nats)
//   SECTIONALS  — Speedo Sectionals regional meet (Southern Zone for TX)
//   JR_NATS     — USA Swimming Junior Nationals (Futures Championships level)
//   NATIONALS   — USA Swimming Nationals / US Open
//
// One Texas-specific standard WITH age groups:
//   TX_TAGS     — Texas Age Group State Championships, cuts by age group
//
// ⚠️ ALL TIMES BELOW ARE PLACEHOLDERS.
// See PLACEHOLDERS.md — Chase to supply real cut times from:
//   - Speedo Sectionals Southern Zone time standards
//   - USA Swimming Futures qualification standards
//   - USA Swimming Jr National Championships standards
//   - USA Swimming National Championships / US Open standards
//   - Texas Swimming TAGs meet standards (by age group)
//
// Structure:
//   CHAMPIONSHIP_STANDARDS.FUTURES.M.SCY = { "50 Free": 21.99, ... }
//   TX_TAGS.M["11-12"].SCY = { "50 Free": 25.99, ... }
// ============================================================

// Placeholder values. DO NOT USE IN PRODUCTION without real data.
const PLACEHOLDER = true

/**
 * National-level championship cuts — single cut per event, no age group.
 * Boys (M) SCY numbers are rough ballparks loosely patterned after the
 * real standards' relative difficulty. Girls (F) ratios are adjusted.
 * Every value is a PLACEHOLDER.
 */
export const CHAMPIONSHIP_STANDARDS = {

  // 2026 TYR Futures Championships (18 & Under)
  FUTURES: {
    M: {  // Men
      SCY: {
        "50 Free": 21.29,
        "100 Free": 46.39,
        "200 Free": 101.59,
        "500 Free": 277.09,
        "1000 Free": 574.29,
        "1650 Free": 965.49,
        "50 Back": 23.69,
        "100 Back": 51.49,
        "200 Back": 112.79,
        "50 Breast": 26.29,
        "100 Breast": 57.99,
        "200 Breast": 127.99,
        "50 Fly": 22.89,
        "100 Fly": 50.59,
        "200 Fly": 113.69,
        "200 IM": 113.89,
        "400 IM": 246.99,
      },
      LCM: {
        "50 Free": 24.59,
        "100 Free": 53.59,
        "200 Free": 117.79,
        "400 Free": 249.99,
        "800 Free": 520.69,
        "1500 Free": 998.99,
        "50 Back": 27.89,
        "100 Back": 60.59,
        "200 Back": 131.89,
        "50 Breast": 30.89,
        "100 Breast": 68.19,
        "200 Breast": 149.09,
        "50 Fly": 26.29,
        "100 Fly": 57.99,
        "200 Fly": 130.19,
        "200 IM": 132.79,
        "400 IM": 282.39,
      },
    },
    F: {  // Women
      SCY: {
        "50 Free": 23.89,
        "100 Free": 51.89,
        "200 Free": 112.29,
        "500 Free": 302.59,
        "1000 Free": 620.49,
        "1650 Free": 1034.39,
        "50 Back": 26.29,
        "100 Back": 57.09,
        "200 Back": 124.19,
        "50 Breast": 29.79,
        "100 Breast": 65.49,
        "200 Breast": 142.69,
        "50 Fly": 25.69,
        "100 Fly": 56.59,
        "200 Fly": 125.39,
        "200 IM": 126.39,
        "400 IM": 270.69,
      },
      LCM: {
        "50 Free": 27.39,
        "100 Free": 59.29,
        "200 Free": 127.79,
        "400 Free": 268.79,
        "800 Free": 553.79,
        "1500 Free": 1060.19,
        "50 Back": 30.89,
        "100 Back": 66.79,
        "200 Back": 143.99,
        "50 Breast": 34.79,
        "100 Breast": 75.99,
        "200 Breast": 163.39,
        "50 Fly": 29.49,
        "100 Fly": 64.69,
        "200 Fly": 141.89,
        "200 IM": 146.19,
        "400 IM": 307.29,
      },
    },
  },

  // 2026 Speedo Sectionals (National Maximum Standard)
  SECTIONALS: {
    M: {  // Men
      SCY: {
        "50 Free": 21.69,
        "100 Free": 47.39,
        "200 Free": 103.79,
        "500 Free": 282.79,
        "1000 Free": 582.99,
        "1650 Free": 984.39,
        "50 Back": 24.49,
        "100 Back": 53.39,
        "200 Back": 114.89,
        "50 Breast": 27.19,
        "100 Breast": 59.79,
        "200 Breast": 129.69,
        "50 Fly": 23.69,
        "100 Fly": 52.09,
        "200 Fly": 115.09,
        "200 IM": 117.09,
        "400 IM": 251.19,
      },
      LCM: {
        "50 Free": 25.29,
        "100 Free": 54.79,
        "200 Free": 120.49,
        "400 Free": 255.79,
        "800 Free": 529.99,
        "1500 Free": 1016.49,
        "50 Back": 28.69,
        "100 Back": 61.99,
        "200 Back": 133.79,
        "50 Breast": 31.99,
        "100 Breast": 69.69,
        "200 Breast": 150.89,
        "50 Fly": 27.39,
        "100 Fly": 59.59,
        "200 Fly": 131.79,
        "200 IM": 135.19,
        "400 IM": 287.59,
      },
    },
    F: {  // Women
      SCY: {
        "50 Free": 24.49,
        "100 Free": 53.09,
        "200 Free": 113.79,
        "500 Free": 305.09,
        "1000 Free": 628.79,
        "1650 Free": 1045.69,
        "50 Back": 27.29,
        "100 Back": 58.99,
        "200 Back": 127.19,
        "50 Breast": 30.69,
        "100 Breast": 66.89,
        "200 Breast": 144.69,
        "50 Fly": 26.69,
        "100 Fly": 58.19,
        "200 Fly": 128.89,
        "200 IM": 129.29,
        "400 IM": 273.39,
      },
      LCM: {
        "50 Free": 28.09,
        "100 Free": 60.69,
        "200 Free": 130.99,
        "400 Free": 275.29,
        "800 Free": 567.39,
        "1500 Free": 1086.09,
        "50 Back": 31.49,
        "100 Back": 67.89,
        "200 Back": 146.99,
        "50 Breast": 35.59,
        "100 Breast": 77.19,
        "200 Breast": 166.69,
        "50 Fly": 30.29,
        "100 Fly": 65.79,
        "200 Fly": 145.09,
        "200 IM": 148.49,
        "400 IM": 312.99,
      },
    },
  },

  // 2026 Speedo Junior National Championships (Qualifying)
  JR_NATS: {
    M: {  // Men
      SCY: {
        "50 Free": 20.39,
        "100 Free": 44.39,
        "200 Free": 97.59,
        "500 Free": 265.59,
        "1000 Free": 553.19,
        "1650 Free": 931.39,
        "50 Back": 22.49,
        "100 Back": 48.59,
        "200 Back": 106.49,
        "50 Breast": 25.29,
        "100 Breast": 54.99,
        "200 Breast": 120.39,
        "50 Fly": 21.99,
        "100 Fly": 48.19,
        "200 Fly": 107.89,
        "200 IM": 108.49,
        "400 IM": 232.69,
      },
      LCM: {
        "50 Free": 23.79,
        "100 Free": 51.99,
        "200 Free": 114.09,
        "400 Free": 242.19,
        "800 Free": 503.09,
        "1500 Free": 965.09,
        "50 Back": 26.69,
        "100 Back": 58.19,
        "200 Back": 126.99,
        "50 Breast": 29.59,
        "100 Breast": 65.09,
        "200 Breast": 142.39,
        "50 Fly": 25.39,
        "100 Fly": 55.89,
        "200 Fly": 125.09,
        "200 IM": 127.99,
        "400 IM": 273.09,
      },
    },
    F: {  // Women
      SCY: {
        "50 Free": 22.99,
        "100 Free": 49.99,
        "200 Free": 108.19,
        "500 Free": 289.99,
        "1000 Free": 604.69,
        "1650 Free": 1010.99,
        "50 Back": 25.19,
        "100 Back": 54.39,
        "200 Back": 118.19,
        "50 Breast": 28.79,
        "100 Breast": 62.39,
        "200 Breast": 135.39,
        "50 Fly": 24.69,
        "100 Fly": 54.09,
        "200 Fly": 120.49,
        "200 IM": 121.09,
        "400 IM": 258.79,
      },
      LCM: {
        "50 Free": 26.59,
        "100 Free": 57.69,
        "200 Free": 124.99,
        "400 Free": 263.59,
        "800 Free": 546.79,
        "1500 Free": 1046.79,
        "50 Back": 29.79,
        "100 Back": 64.29,
        "200 Back": 139.29,
        "50 Breast": 33.69,
        "100 Breast": 73.29,
        "200 Breast": 158.59,
        "50 Fly": 28.39,
        "100 Fly": 62.49,
        "200 Fly": 138.39,
        "200 IM": 141.29,
        "400 IM": 300.29,
      },
    },
  },

  // 2026 Toyota National Championships (18 & Under)
  NATIONALS: {
    M: {  // Men
      SCY: {
        "50 Free": 20.09,
        "100 Free": 43.69,
        "200 Free": 96.19,
        "500 Free": 263.99,
        "1000 Free": 547.59,
        "1650 Free": 921.49,
        "50 Back": 22.39,
        "100 Back": 47.89,
        "200 Back": 104.79,
        "50 Breast": 25.19,
        "100 Breast": 53.99,
        "200 Breast": 117.99,
        "50 Fly": 21.89,
        "100 Fly": 47.49,
        "200 Fly": 105.89,
        "200 IM": 106.79,
        "400 IM": 229.79,
      },
      LCM: {
        "50 Free": 23.19,
        "100 Free": 51.09,
        "200 Free": 112.09,
        "400 Free": 238.39,
        "800 Free": 496.99,
        "1500 Free": 952.69,
        "50 Back": 26.39,
        "100 Back": 56.89,
        "200 Back": 123.59,
        "50 Breast": 29.19,
        "100 Breast": 63.29,
        "200 Breast": 138.09,
        "50 Fly": 24.99,
        "100 Fly": 54.69,
        "200 Fly": 122.89,
        "200 IM": 124.69,
        "400 IM": 265.39,
      },
    },
    F: {  // Women
      SCY: {
        "50 Free": 22.79,
        "100 Free": 49.49,
        "200 Free": 107.19,
        "500 Free": 286.29,
        "1000 Free": 595.99,
        "1650 Free": 997.99,
        "50 Back": 25.09,
        "100 Back": 53.69,
        "200 Back": 115.69,
        "50 Breast": 28.69,
        "100 Breast": 61.59,
        "200 Breast": 134.29,
        "50 Fly": 24.29,
        "100 Fly": 53.29,
        "200 Fly": 119.39,
        "200 IM": 118.99,
        "400 IM": 252.69,
      },
      LCM: {
        "50 Free": 26.19,
        "100 Free": 56.69,
        "200 Free": 123.19,
        "400 Free": 259.89,
        "800 Free": 537.89,
        "1500 Free": 1030.79,
        "50 Back": 29.69,
        "100 Back": 63.19,
        "200 Back": 136.69,
        "50 Breast": 33.29,
        "100 Breast": 71.29,
        "200 Breast": 154.19,
        "50 Fly": 28.09,
        "100 Fly": 61.39,
        "200 Fly": 137.59,
        "200 IM": 138.19,
        "400 IM": 292.69,
      },
    },
  },
}

/**
 * Texas Age Group State Championships (TAGs) — age-group specific.
 * Keyed by gender and age bucket, then course and event.
 * All values are PLACEHOLDERS.
 */
export const TX_TAGS = {
  M: {
    "11-12": {
      SCY: {
        "50 Free": 26.19, "100 Free": 56.99, "200 Free": 124.99,
        "500 Free": 335.99, "1000 Free": 691.99, "1650 Free": 1149.99,
        "50 Back": 30.29, "100 Back": 64.29, "200 Back": 139.99,
        "50 Breast": 33.99, "100 Breast": 73.99, "200 Breast": 158.99,
        "50 Fly": 28.99, "100 Fly": 62.29, "200 Fly": 139.99,
        "100 IM": 63.99, "200 IM": 136.99, "400 IM": 296.99,
      },
      LCM: {
        "50 Free": 30.29, "100 Free": 65.99, "200 Free": 143.99,
        "400 Free": 300.99, "800 Free": 621.99, "1500 Free": 1182.99,
        "50 Back": 34.49, "100 Back": 74.29, "200 Back": 158.99,
        "50 Breast": 38.99, "100 Breast": 84.99, "200 Breast": 182.99,
        "50 Fly": 32.99, "100 Fly": 72.29, "200 Fly": 158.99,
        "200 IM": 156.99, "400 IM": 335.99,
      },
    },
    "13-14": {
      SCY: {
        "50 Free": 23.49, "100 Free": 51.49, "200 Free": 112.99,
        "500 Free": 302.99, "1000 Free": 624.99, "1650 Free": 1038.99,
        "50 Back": 26.99, "100 Back": 57.99, "200 Back": 125.99,
        "50 Breast": 30.49, "100 Breast": 66.99, "200 Breast": 144.99,
        "50 Fly": 25.49, "100 Fly": 56.29, "200 Fly": 125.99,
        "100 IM": 58.49, "200 IM": 125.99, "400 IM": 267.99,
      },
      LCM: {
        "50 Free": 27.29, "100 Free": 59.99, "200 Free": 129.99,
        "400 Free": 274.99, "800 Free": 559.99, "1500 Free": 1070.99,
        "50 Back": 31.29, "100 Back": 67.99, "200 Back": 145.99,
        "50 Breast": 34.99, "100 Breast": 76.29, "200 Breast": 165.99,
        "50 Fly": 29.99, "100 Fly": 64.99, "200 Fly": 143.99,
        "200 IM": 146.99, "400 IM": 309.99,
      },
    },
    "15-16": {
      SCY: {
        "50 Free": 21.99, "100 Free": 48.29, "200 Free": 106.99,
        "500 Free": 288.99, "1000 Free": 594.99, "1650 Free": 989.99,
        "50 Back": 24.99, "100 Back": 54.29, "200 Back": 118.99,
        "50 Breast": 28.49, "100 Breast": 62.29, "200 Breast": 134.99,
        "50 Fly": 23.99, "100 Fly": 52.99, "200 Fly": 117.99,
        "100 IM": 55.29, "200 IM": 119.99, "400 IM": 256.99,
      },
      LCM: {
        "50 Free": 25.49, "100 Free": 56.29, "200 Free": 121.99,
        "400 Free": 260.99, "800 Free": 534.99, "1500 Free": 1024.99,
        "50 Back": 29.29, "100 Back": 63.99, "200 Back": 139.99,
        "50 Breast": 32.99, "100 Breast": 71.99, "200 Breast": 156.99,
        "50 Fly": 28.29, "100 Fly": 61.49, "200 Fly": 135.99,
        "200 IM": 140.99, "400 IM": 295.99,
      },
    },
    "17-18": {
      SCY: {
        "50 Free": 21.29, "100 Free": 46.99, "200 Free": 103.99,
        "500 Free": 278.99, "1000 Free": 571.99, "1650 Free": 952.99,
        "50 Back": 23.99, "100 Back": 52.49, "200 Back": 114.99,
        "50 Breast": 27.49, "100 Breast": 60.29, "200 Breast": 130.99,
        "50 Fly": 22.99, "100 Fly": 51.29, "200 Fly": 113.99,
        "100 IM": 53.99, "200 IM": 116.99, "400 IM": 249.99,
      },
      LCM: {
        "50 Free": 24.99, "100 Free": 54.99, "200 Free": 118.99,
        "400 Free": 252.99, "800 Free": 520.99, "1500 Free": 993.99,
        "50 Back": 28.29, "100 Back": 61.99, "200 Back": 135.99,
        "50 Breast": 31.99, "100 Breast": 69.99, "200 Breast": 151.99,
        "50 Fly": 27.49, "100 Fly": 59.99, "200 Fly": 131.99,
        "200 IM": 136.99, "400 IM": 287.99,
      },
    },
  },
  F: {
    "11-12": {
      SCY: {
        "50 Free": 27.99, "100 Free": 60.99, "200 Free": 132.99,
        "500 Free": 355.99, "1000 Free": 734.99, "1650 Free": 1217.99,
        "50 Back": 32.29, "100 Back": 68.99, "200 Back": 148.99,
        "50 Breast": 36.49, "100 Breast": 79.99, "200 Breast": 171.99,
        "50 Fly": 30.99, "100 Fly": 66.99, "200 Fly": 148.99,
        "100 IM": 67.99, "200 IM": 144.99, "400 IM": 311.99,
      },
      LCM: {
        "50 Free": 31.99, "100 Free": 69.99, "200 Free": 151.99,
        "400 Free": 317.99, "800 Free": 652.99, "1500 Free": 1242.99,
        "50 Back": 36.49, "100 Back": 78.99, "200 Back": 170.99,
        "50 Breast": 41.29, "100 Breast": 89.99, "200 Breast": 193.99,
        "50 Fly": 34.99, "100 Fly": 75.99, "200 Fly": 168.99,
        "200 IM": 166.99, "400 IM": 352.99,
      },
    },
    "13-14": {
      SCY: {
        "50 Free": 25.29, "100 Free": 55.29, "200 Free": 120.99,
        "500 Free": 324.99, "1000 Free": 667.99, "1650 Free": 1110.99,
        "50 Back": 29.29, "100 Back": 62.49, "200 Back": 134.99,
        "50 Breast": 32.99, "100 Breast": 71.99, "200 Breast": 155.99,
        "50 Fly": 27.99, "100 Fly": 60.49, "200 Fly": 134.99,
        "100 IM": 62.99, "200 IM": 134.99, "400 IM": 285.99,
      },
      LCM: {
        "50 Free": 29.29, "100 Free": 63.99, "200 Free": 139.99,
        "400 Free": 291.99, "800 Free": 599.99, "1500 Free": 1149.99,
        "50 Back": 33.29, "100 Back": 72.49, "200 Back": 156.99,
        "50 Breast": 37.49, "100 Breast": 82.29, "200 Breast": 178.99,
        "50 Fly": 32.29, "100 Fly": 70.29, "200 Fly": 154.99,
        "200 IM": 154.99, "400 IM": 325.99,
      },
    },
    "15-16": {
      SCY: {
        "50 Free": 23.99, "100 Free": 52.49, "200 Free": 115.99,
        "500 Free": 309.99, "1000 Free": 638.99, "1650 Free": 1063.99,
        "50 Back": 27.99, "100 Back": 59.99, "200 Back": 128.99,
        "50 Breast": 31.49, "100 Breast": 68.99, "200 Breast": 148.99,
        "50 Fly": 26.99, "100 Fly": 57.99, "200 Fly": 128.99,
        "100 IM": 60.49, "200 IM": 129.99, "400 IM": 273.99,
      },
      LCM: {
        "50 Free": 27.99, "100 Free": 61.29, "200 Free": 133.99,
        "400 Free": 279.99, "800 Free": 574.99, "1500 Free": 1099.99,
        "50 Back": 31.99, "100 Back": 69.49, "200 Back": 150.99,
        "50 Breast": 35.99, "100 Breast": 78.49, "200 Breast": 170.99,
        "50 Fly": 30.99, "100 Fly": 66.99, "200 Fly": 148.99,
        "200 IM": 150.99, "400 IM": 315.99,
      },
    },
    "17-18": {
      SCY: {
        "50 Free": 23.29, "100 Free": 50.99, "200 Free": 112.99,
        "500 Free": 300.99, "1000 Free": 621.99, "1650 Free": 1037.99,
        "50 Back": 26.99, "100 Back": 58.29, "200 Back": 124.99,
        "50 Breast": 30.49, "100 Breast": 66.99, "200 Breast": 144.99,
        "50 Fly": 25.99, "100 Fly": 56.29, "200 Fly": 124.99,
        "100 IM": 58.99, "200 IM": 125.99, "400 IM": 266.99,
      },
      LCM: {
        "50 Free": 26.99, "100 Free": 59.49, "200 Free": 129.99,
        "400 Free": 271.99, "800 Free": 557.99, "1500 Free": 1065.99,
        "50 Back": 30.99, "100 Back": 67.29, "200 Back": 145.99,
        "50 Breast": 34.99, "100 Breast": 75.99, "200 Breast": 165.99,
        "50 Fly": 29.99, "100 Fly": 64.99, "200 Fly": 144.99,
        "200 IM": 146.99, "400 IM": 306.99,
      },
    },
  },
}

// Gate to show this data alongside USA Swimming standards
// (admin toggles per-athlete via athlete.showChampionshipCuts).
export const CHAMPIONSHIP_TIERS = ['FUTURES', 'SECTIONALS', 'JR_NATS', 'NATIONALS']
export const CHAMPIONSHIP_TIER_LABELS = {
  FUTURES: 'Futures',
  SECTIONALS: 'Sectionals',
  JR_NATS: 'Jr Nats',
  NATIONALS: 'Nationals',
}

/**
 * Look up a championship cut time for a specific tier + gender + course + event.
 * Returns seconds (number) or null if not found.
 */
export function championshipCut({ tier, gender, course, event }) {
  const tierTable = CHAMPIONSHIP_STANDARDS[tier]
  if (!tierTable) return null
  const g = tierTable[gender]
  if (!g) return null
  const c = g[course]
  if (!c) return null
  return c[event] ?? null
}

/**
 * Look up a TX TAGs cut for an athlete's current age bucket.
 * Returns seconds or null.
 */
export function txTagsCut({ gender, ageBucket, course, event }) {
  const g = TX_TAGS[gender]
  if (!g) return null
  const b = g[ageBucket]
  if (!b) return null
  const c = b[course]
  if (!c) return null
  return c[event] ?? null
}
