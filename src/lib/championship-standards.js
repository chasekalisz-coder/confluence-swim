// ============================================================
// championship-standards.js
// ============================================================
// Domestic championship qualifying cuts beyond USA Swimming motivational
// times. All data is real 2026 cuts pulled from official sources.
//
// Four senior-pathway tiers (single cut per event, no age group):
//   FUTURES     — 2026 TYR Futures Championships (18 & Under cuts)
//   SECTIONALS  — 2026 Speedo Sectionals (national maximum standard)
//   JR_NATS     — 2026 Speedo Junior Nationals (qualifying, not bonus)
//   NATIONALS   — 2026 Toyota National Championships (18 & Under cuts)
//
// One age-bucketed Texas tier:
//   TX_TAGS     — 2026 Texas Age Group Swimming Championships.
//                 14 & Under only (10U / 11-12 / 13-14 buckets).
//                 15+ athletes age out and race the senior pathway.
//
// Sources: official USA Swimming 2026 PDFs + Texas Swimming Association
// 2026 TAGS standards (10/7/2025). Transcribed to CHAMPIONSHIP_STAGING.md
// for verification, then into this file.
//
// Structure:
//   CHAMPIONSHIP_STANDARDS.FUTURES.M.SCY["50 Free"] = 21.29
//   TX_TAGS.M["11-12"].SCY["50 Free"] = 25.99
// ============================================================

/**
 * National-level championship cuts — single cut per event, no age group.
 * All values are from 2026 USA Swimming published qualifying standards.
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

// 2026 Texas Age Group Swimming (TAGS) Championship qualifying standards
// Source: Texas Swimming Association 2026 TAGS Time Standards (10/7/2025)
//
// TAGS is a 14 & Under meet. 15-16 and 17-18 athletes do not race TAGS —
// they follow the senior championship pathway (Sectionals → Futures →
// Juniors → Nationals). This table therefore only defines cuts for
// 10U / 11-12 / 13-14 age buckets.
//
// Bonus standards excluded — only qualifying (faster) cuts included.
//
// Structure: TX_TAGS[gender][ageBucket][course][event] = seconds
export const TX_TAGS = {
  M: {  // Boys
    "10U": {  // 10 & Under
      SCY: {
        "50 Free": 29.59,
        "100 Free": 65.09,
        "200 Free": 142.69,
        "500 Free": 380.39,
        "50 Back": 34.39,
        "100 Back": 74.39,
        "50 Breast": 39.79,
        "100 Breast": 87.59,
        "50 Fly": 32.89,
        "100 Fly": 76.59,
        "100 IM": 75.09,
        "200 IM": 161.29,
      },
      LCM: {
        "50 Free": 33.69,
        "100 Free": 73.89,
        "200 Free": 161.49,
        "400 Free": 343.29,
        "50 Back": 39.59,
        "100 Back": 85.09,
        "50 Breast": 46.09,
        "100 Breast": 100.09,
        "50 Fly": 36.89,
        "100 Fly": 86.89,
        "200 IM": 184.09,
      },
    },
    "11-12": {  // 11-12
      SCY: {
        "50 Free": 25.99,
        "100 Free": 56.09,
        "200 Free": 122.79,
        "500 Free": 329.69,
        "1000 Free": 620.09,
        "1650 Free": 1040.29,
        "50 Back": 30.09,
        "100 Back": 65.09,
        "200 Back": 138.69,
        "50 Breast": 33.69,
        "100 Breast": 74.09,
        "200 Breast": 161.69,
        "50 Fly": 28.59,
        "100 Fly": 63.59,
        "200 Fly": 143.29,
        "100 IM": 64.59,
        "200 IM": 139.29,
        "400 IM": 264.89,
      },
      LCM: {
        "50 Free": 29.39,
        "100 Free": 64.59,
        "200 Free": 139.99,
        "400 Free": 297.59,
        "800 Free": 560.59,
        "1500 Free": 1086.59,
        "50 Back": 34.69,
        "100 Back": 74.79,
        "200 Back": 160.29,
        "50 Breast": 38.69,
        "100 Breast": 84.49,
        "200 Breast": 181.69,
        "50 Fly": 32.19,
        "100 Fly": 72.09,
        "200 Fly": 167.19,
        "200 IM": 158.19,
        "400 IM": 306.09,
      },
    },
    "13-14": {  // 13-14
      SCY: {
        "50 Free": 23.09,
        "100 Free": 49.99,
        "200 Free": 109.59,
        "500 Free": 295.89,
        "100 Back": 56.29,
        "200 Back": 122.79,
        "100 Breast": 64.29,
        "200 Breast": 137.69,
        "100 Fly": 55.59,
        "200 Fly": 123.29,
        "200 IM": 124.29,
      },
      LCM: {
        "50 Free": 26.49,
        "100 Free": 57.59,
        "200 Free": 125.19,
        "400 Free": 268.19,
        "100 Back": 65.89,
        "200 Back": 142.59,
        "100 Breast": 73.89,
        "200 Breast": 161.09,
        "100 Fly": 63.29,
        "200 Fly": 142.79,
        "200 IM": 140.99,
      },
    },
  },
  F: {  // Girls
    "10U": {  // 10 & Under
      SCY: {
        "50 Free": 29.99,
        "100 Free": 65.79,
        "200 Free": 142.29,
        "500 Free": 379.39,
        "50 Back": 34.69,
        "100 Back": 74.59,
        "50 Breast": 39.49,
        "100 Breast": 86.39,
        "50 Fly": 33.09,
        "100 Fly": 76.39,
        "100 IM": 75.29,
        "200 IM": 161.89,
      },
      LCM: {
        "50 Free": 33.49,
        "100 Free": 73.29,
        "200 Free": 160.09,
        "400 Free": 342.39,
        "50 Back": 39.59,
        "100 Back": 85.29,
        "50 Breast": 45.09,
        "100 Breast": 98.89,
        "50 Fly": 37.09,
        "100 Fly": 87.09,
        "200 IM": 183.29,
      },
    },
    "11-12": {  // 11-12
      SCY: {
        "50 Free": 26.69,
        "100 Free": 57.89,
        "200 Free": 124.69,
        "500 Free": 333.59,
        "1000 Free": 660.09,
        "1650 Free": 1099.49,
        "50 Back": 30.39,
        "100 Back": 64.89,
        "200 Back": 140.39,
        "50 Breast": 34.59,
        "100 Breast": 75.29,
        "200 Breast": 161.89,
        "50 Fly": 28.99,
        "100 Fly": 64.59,
        "200 Fly": 146.89,
        "100 IM": 65.89,
        "200 IM": 140.99,
        "400 IM": 282.09,
      },
      LCM: {
        "50 Free": 30.09,
        "100 Free": 65.79,
        "200 Free": 142.69,
        "400 Free": 301.59,
        "800 Free": 592.39,
        "1500 Free": 1128.49,
        "50 Back": 35.29,
        "100 Back": 75.49,
        "200 Back": 162.49,
        "50 Breast": 39.59,
        "100 Breast": 86.69,
        "200 Breast": 186.99,
        "50 Fly": 32.69,
        "100 Fly": 73.19,
        "200 Fly": 168.49,
        "200 IM": 162.19,
        "400 IM": 325.59,
      },
    },
    "13-14": {  // 13-14
      SCY: {
        "50 Free": 24.99,
        "100 Free": 54.19,
        "200 Free": 117.59,
        "500 Free": 314.59,
        "100 Back": 60.29,
        "200 Back": 129.99,
        "100 Breast": 69.29,
        "200 Breast": 149.59,
        "100 Fly": 59.69,
        "200 Fly": 135.49,
        "200 IM": 132.69,
      },
      LCM: {
        "50 Free": 28.49,
        "100 Free": 61.79,
        "200 Free": 134.29,
        "400 Free": 282.19,
        "100 Back": 70.39,
        "200 Back": 151.39,
        "100 Breast": 80.89,
        "200 Breast": 175.59,
        "100 Fly": 68.09,
        "200 Fly": 155.59,
        "200 IM": 152.89,
      },
    },
  },
}

// Gate to show this data alongside USA Swimming standards
// (admin toggles per-athlete via athlete.showChampionshipCuts).
//
// Order matters — this is the column order in the Championship Standards
// accordion. Order is weakest → strongest tier so families read the ladder
// left-to-right as aspiration grows.
//
// TAGS is ONLY shown for athletes aged 14 and under. The table renderer
// checks the athlete's age bucket and hides the TAGS column for 15+.
export const CHAMPIONSHIP_TIERS = ['SECTIONALS', 'FUTURES', 'JR_NATS', 'NATIONALS']
export const CHAMPIONSHIP_TIER_LABELS = {
  TAGS: 'TAGS',
  SECTIONALS: 'Sectionals',
  FUTURES: 'Futures',
  JR_NATS: 'Jr Nats',
  NATIONALS: 'Nationals',
}

// The age buckets TAGS applies to. 15-16 and 17-18 swimmers age out of
// TAGS — they race the senior championship pathway instead.
export const TAGS_ELIGIBLE_BUCKETS = new Set(['10U', '11-12', '13-14'])

/**
 * Look up a championship cut time for a specific tier + gender + course + event.
 *
 * For FUTURES / SECTIONALS / JR_NATS / NATIONALS: single cut per event,
 * no age group.
 *
 * For TAGS: age-group-specific cuts (10U, 11-12, 13-14 only). Requires
 * `ageBucket` parameter. Returns null if athlete is 15+ (not eligible).
 *
 * Returns seconds (number) or null if not found.
 */
export function championshipCut({ tier, gender, course, event, ageBucket }) {
  // TAGS has its own age-bucketed table
  if (tier === 'TAGS') {
    if (!ageBucket || !TAGS_ELIGIBLE_BUCKETS.has(ageBucket)) return null
    return TX_TAGS[gender]?.[ageBucket]?.[course]?.[event] ?? null
  }
  // Senior tiers use the flat structure
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
