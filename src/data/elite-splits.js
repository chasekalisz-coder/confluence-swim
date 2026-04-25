// ============================================================
// ELITE SPLIT DATA — Confluence Swim
// ============================================================
// Source: 50+ NCAA and World Championship finals performances.
// Split percentages per event, course, gender.
//
// This is the SINGLE SOURCE OF TRUTH for elite pacing data.
// Used by:
//   - Race Pace Calculator (public/pace.html imports this)
//   - AI training prompt (pacing context for coaching notes)
//   - Meet Analyzer (when built)
//   - Any future feature that needs elite split benchmarks
//
// Format:
//   ELITE_SPLITS[course][gender][event] = {
//     _25s:  [pct, pct]          — for 50s events
//     _50s:  [pct, pct, ...]     — per-50 breakdown
//     _100s: [pct, pct, ...]     — per-100 breakdown
//     _200s: [pct, pct, ...]     — per-200 breakdown
//     _500s: [pct, pct, ...]     — per-500 breakdown (distance)
//   }
//   All percentages sum to 100.
//
// DO NOT edit without updating DATA_SCHEMA.md.
// ============================================================

export const ELITE_SPLITS = {
  scy: {
    men: {
      "50 Free":   {_25s:[48.28,51.72]},
      "100 Free":  {_50s:[47.48,52.52]},
      "100 Fly":   {_50s:[46.53,53.47]},
      "100 Back":  {_50s:[48.15,51.85]},
      "100 Breast":{_50s:[46.73,53.27]},
      "200 Free":  {_50s:[23.06,25.26,25.74,25.94],_100s:[48.32,51.68]},
      "200 Fly":   {_50s:[22.34,25.43,25.90,26.34],_100s:[47.77,52.23]},
      "200 Back":  {_50s:[23.31,25.31,25.65,25.73],_100s:[48.62,51.38]},
      "200 Breast":{_50s:[22.42,25.40,25.85,26.32],_100s:[47.83,52.17]},
      "500 Free":  {_50s:[9.15,10.01,10.16,10.22,10.22,10.21,10.16,10.09,10.03,9.74],_100s:[19.16,20.38,20.43,20.25,19.77],_200s:[39.54,40.69,19.77]},
      "1650 Free": {_500s:[29.91,30.53,30.62,8.94]},
    },
    women: {
      "50 Free":   {_25s:[48.26,51.74]},
      "100 Free":  {_50s:[47.81,52.19]},
      "100 Fly":   {_50s:[46.56,53.44]},
      "100 Back":  {_50s:[48.41,51.59]},
      "100 Breast":{_50s:[46.95,53.05]},
      "200 Free":  {_50s:[23.43,25.43,25.62,25.52],_100s:[48.86,51.14]},
      "200 Fly":   {_50s:[22.26,25.17,25.82,26.75],_100s:[47.43,52.57]},
      "200 Back":  {_50s:[23.37,25.07,25.70,25.86],_100s:[48.44,51.56]},
      "200 Breast":{_50s:[22.62,25.31,25.80,26.26],_100s:[47.94,52.06]},
      "500 Free":  {_50s:[9.23,9.97,10.09,10.16,10.16,10.15,10.16,10.12,10.09,9.88],_100s:[19.20,20.25,20.31,20.28,19.97],_200s:[39.45,40.58,19.97]},
      "1650 Free": {_500s:[30.26,30.38,30.40,8.96]},
    },
  },
  lcm: {
    men: {
      "100 Free":  {_50s:[47.89,52.11]},
      "100 Fly":   {_50s:[46.56,53.44]},
      "100 Back":  {_50s:[48.23,51.77]},
      "100 Breast":{_50s:[46.48,53.52]},
      "200 Free":  {_50s:[23.19,25.30,25.63,25.88],_100s:[48.49,51.51]},
      "200 Fly":   {_50s:[22.14,25.26,25.93,26.67],_100s:[47.40,52.60]},
      "200 Back":  {_50s:[23.34,25.27,25.71,25.68],_100s:[48.62,51.38]},
      "200 Breast":{_50s:[22.51,25.34,25.76,26.39],_100s:[47.85,52.15]},
      "400 Free":  {_50s:[11.46,12.44,12.58,12.75,12.77,12.84,12.73,12.42],_100s:[23.91,25.33,25.61,25.15],_200s:[49.24,50.76]},
      "800 Free":  {_50s:[5.70,6.16,6.21,6.27,6.28,6.31,6.31,6.33,6.32,6.35,6.36,6.36,6.36,6.36,6.31,6.01],_100s:[11.86,12.49,12.59,12.65,12.68,12.72,12.71,12.32],_200s:[24.34,25.23,25.39,25.03],_400s:[49.58,50.42]},
      "1500 Free": {_50s:[3.05,3.30,3.33,3.33,3.34,3.35,3.35,3.35,3.35,3.35,3.35,3.35,3.35,3.34,3.35,3.35,3.35,3.36,3.36,3.36,3.36,3.37,3.36,3.38,3.36,3.37,3.36,3.36,3.33,3.16],_100s:[6.35,6.66,6.69,6.70,6.70,6.69,6.69,6.69,6.70,6.72,6.73,6.74,6.74,6.71,6.49],_200s:[13.01,13.38,13.39,13.39,13.42,13.46,13.45,6.49],_500s:[33.09,33.50,33.41]},
    },
    women: {
      "100 Free":  {_50s:[47.97,52.03]},
      "100 Fly":   {_50s:[46.20,53.80]},
      "100 Back":  {_50s:[48.31,51.69]},
      "100 Breast":{_50s:[46.66,53.34]},
      "200 Free":  {_50s:[23.61,25.41,25.58,25.41],_100s:[49.02,50.98]},
      "200 Fly":   {_50s:[22.40,25.35,25.93,26.33],_100s:[47.74,52.26]},
      "200 Back":  {_50s:[23.51,25.24,25.59,25.67],_100s:[48.75,51.25]},
      "200 Breast":{_50s:[22.69,25.40,25.67,26.23],_100s:[48.09,51.91]},
      "400 Free":  {_50s:[11.53,12.46,12.58,12.72,12.74,12.81,12.70,12.45],_100s:[23.99,25.31,25.55,25.15],_200s:[49.30,50.70]},
      "800 Free":  {_50s:[5.73,6.16,6.22,6.27,6.29,6.31,6.30,6.33,6.32,6.34,6.34,6.34,6.34,6.35,6.30,6.06],_100s:[11.89,12.49,12.60,12.63,12.66,12.68,12.69,12.36],_200s:[24.38,25.23,25.34,25.05],_400s:[49.62,50.38]},
      "1500 Free": {_100s:[6.32,6.63,6.66,6.67,6.69,6.68,6.69,6.71,6.71,6.72,6.73,6.74,6.75,6.74,6.58],_500s:[32.96,33.51,33.53]},
    },
  },
  scm: {
    men: {
      "50 Free":   {_25s:[47.93,52.07]},
      "100 Free":  {_50s:[47.80,52.20]},
      "100 Fly":   {_50s:[46.37,53.63]},
      "100 Back":  {_50s:[48.15,51.85]},
      "100 Breast":{_50s:[46.72,53.28]},
      "200 Free":  {_50s:[23.17,25.35,25.78,25.70],_100s:[48.51,51.49]},
      "200 Fly":   {_50s:[22.38,25.40,25.83,26.39],_100s:[47.78,52.22]},
      "200 Back":  {_50s:[23.48,25.42,25.60,25.50],_100s:[48.91,51.09]},
      "200 Breast":{_50s:[22.56,25.36,25.96,26.12],_100s:[47.92,52.08]},
      "400 Free":  {_50s:[11.43,12.50,12.70,12.76,12.77,12.73,12.73,12.38],_100s:[23.93,25.46,25.50,25.11],_200s:[49.39,50.61]},
      "800 Free":  {_50s:[5.71,6.18,6.24,6.28,6.29,6.31,6.32,6.33,6.32,6.35,6.34,6.34,6.33,6.33,6.30,6.03],_100s:[11.89,12.51,12.60,12.65,12.67,12.68,12.66,12.34],_200s:[24.40,25.25,25.35,25.00],_400s:[49.65,50.35]},
      "1500 Free": {_50s:[3.03,3.27,3.31,3.32,3.33,3.33,3.34,3.34,3.34,3.34,3.33,3.34,3.35,3.34,3.35,3.35,3.35,3.36,3.37,3.36,3.37,3.37,3.38,3.38,3.38,3.38,3.37,3.38,3.35,3.19],_100s:[6.30,6.62,6.66,6.67,6.68,6.67,6.69,6.69,6.71,6.75,6.74,6.76,6.77,6.75,6.54],_200s:[12.92,13.33,13.35,13.38,13.46,13.50,13.52,6.54],_500s:[32.93,33.51,33.56]},
    },
    women: {
      "50 Free":   {_25s:[48.44,51.56]},
      "100 Free":  {_50s:[47.93,52.07]},
      "100 Fly":   {_50s:[46.52,53.48]},
      "100 Back":  {_50s:[48.32,51.68]},
      "100 Breast":{_50s:[46.88,53.12]},
      "200 Free":  {_50s:[23.42,25.28,25.61,25.69],_100s:[48.70,51.30]},
      "200 Fly":   {_50s:[22.50,25.21,25.80,26.49],_100s:[47.71,52.29]},
      "200 Back":  {_50s:[23.52,25.35,25.60,25.53],_100s:[48.87,51.13]},
      "200 Breast":{_50s:[22.69,25.32,25.81,26.18],_100s:[48.00,52.00]},
      "400 Free":  {_50s:[11.55,12.48,12.64,12.68,12.69,12.70,12.73,12.53],_100s:[24.03,25.31,25.39,25.27],_200s:[49.34,50.66]},
      "800 Free":  {_50s:[5.77,6.19,6.24,6.26,6.30,6.31,6.31,6.32,6.30,6.32,6.32,6.32,6.32,6.34,6.26,6.12],_100s:[11.96,12.50,12.61,12.62,12.62,12.64,12.68,12.37],_200s:[24.45,25.23,25.27,25.05],_400s:[49.68,50.32]},
      "1500 Free": {_50s:[3.03,3.27,3.30,3.33,3.31,3.32,3.31,3.32,3.34,3.33,3.32,3.33,3.36,3.34,3.32,3.35,3.33,3.32,3.33,3.38,3.30,3.31,3.36,3.33,3.37,3.30,3.37,3.52,3.50,3.40],_100s:[6.30,6.63,6.63,6.63,6.66,6.64,6.70,6.66,6.65,6.71,6.61,6.69,6.68,6.91,6.90],_200s:[12.93,13.26,13.31,13.36,13.36,13.30,13.58,6.90],_500s:[32.85,33.37,33.78]},
    },
  },
};

// Race intelligence notes per event — used by Race Pace Calculator
// and available to AI for coaching context.
export const RACE_INSIGHTS = {
  "50 Free":    "Pure speed. The second 25 is always slower — reaction time and dive momentum make the first 25 disproportionately fast.",
  "100 Free":   "Freestyle is the second most evenly-split 100. The back half is about holding speed, not building it.",
  "100 Fly":    "Butterfly has the largest front-to-back drop of any 100. The first 50 accounts for less than 47% of the total — the second 50 is where the race is survived.",
  "100 Back":   "Backstroke is the most evenly-split 100. The difference between the first and second 50 is smaller than any other stroke.",
  "100 Breast": "Breaststroke has the second-largest front-to-back drop. The wall and pullout on the second 50 can't overcome the momentum lost in the stroke cycle.",
  "200 Free":   "The 200 free rewards patience. The first 50 is always the fastest, but the difference between splits 2-4 is minimal — the race is about holding, not surging.",
  "200 Fly":    "The 200 fly has the largest deceleration of any 200. The 3rd 50 is where the race separates — everyone slows, but how much determines the finish.",
  "200 Back":   "The most evenly-paced 200. Positions barely change from the halfway point. Where you are at 100 is where you'll finish.",
  "200 Breast": "Breaststroke has a significant build through the race — each 50 is progressively slower. The last 50 carries the largest percentage of any 200 event.",
  "500 Free":   "The 500 follows a U-curve: go out, settle into the middle, close the last 100. The fastest and slowest 50s are the first and last.",
  "400 Free":   "The 400 free punishes overextension. The first 50 is fast off the start, then the middle 300 should be controlled and steady. Save the close for the last 100.",
  "800 Free":   "The 800 is about rhythm. After the opening 100, the middle 600 should be remarkably consistent — within tenths per 100.",
  "1500 Free":  "The mile is three distinct phases: establish pace in the first 500, hold through the second 500, and close the third 500.",
  "1650 Free":  "The mile is three distinct phases: establish pace in the first 500, hold through the second 500, and close the final 500 + 150. Rhythm and consistency win this race.",
};

// Events where a specific split is a known danger point
export const DANGER_SPLITS = {
  "200 Fly": 3,
};
