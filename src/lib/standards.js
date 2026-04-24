// USA Swimming Age Group Time Standards — STARTER DATASET
// -------------------------------------------------------
// This is a placeholder. The authoritative standards change per season
// and come directly from USA Swimming. These values are reasonable
// approximations for the 2024-2025 season so the UI can render real
// badges/gaps/age-up-projections immediately.
//
// Times are in seconds (floats). UI is responsible for formatting.
// Only SCY included for this first pass. LCM/SCM come next.
//
// To update: replace the STANDARDS object with real data. The API
// surface (currentStandard, nextStandard, gapToNext) does not change.
//
// Levels (slowest → fastest): B, BB, A, AA, AAA, AAAA

export const STANDARDS = {
  // ---------------------------------------------------------
  // 11-12 BOYS SCY
  // ---------------------------------------------------------
  "11-12_M_SCY": {
    "50 Free":    { B: 31.39, BB: 29.29, A: 28.09, AA: 26.99, AAA: 25.99, AAAA: 24.99 },
    "100 Free":   { B: 68.89, BB: 64.39, A: 61.49, AA: 59.09, AAA: 56.19, AAAA: 53.99 },
    "200 Free":   { B: 150.09, BB: 139.59, A: 133.49, AA: 127.79, AAA: 121.99, AAAA: 116.99 },
    "500 Free":   { B: 397.69, BB: 371.79, A: 354.39, AA: 338.49, AAA: 321.99, AAAA: 307.99 },
    "1000 Free":  { B: 820.00, BB: 770.00, A: 735.00, AA: 700.00, AAA: 665.00, AAAA: 635.00 },
    "1650 Free":  { B: 1355.00, BB: 1275.00, A: 1215.00, AA: 1155.00, AAA: 1095.00, AAAA: 1045.00 },
    "50 Back":    { B: 37.39, BB: 35.09, A: 33.39, AA: 31.99, AAA: 30.59, AAAA: 29.19 },
    "100 Back":   { B: 79.89, BB: 74.99, A: 71.49, AA: 68.39, AAA: 65.29, AAAA: 62.49 },
    "200 Back":   { B: 173.09, BB: 162.59, A: 154.89, AA: 147.99, AAA: 141.09, AAAA: 134.89 },
    "50 Breast":  { B: 41.59, BB: 39.19, A: 37.39, AA: 35.79, AAA: 34.19, AAAA: 32.69 },
    "100 Breast": { B: 89.89, BB: 84.69, A: 80.79, AA: 77.29, AAA: 73.79, AAAA: 70.69 },
    "200 Breast": { B: 197.39, BB: 185.89, A: 177.49, AA: 169.79, AAA: 162.09, AAAA: 154.99 },
    "50 Fly":     { B: 34.59, BB: 32.59, A: 31.09, AA: 29.69, AAA: 28.39, AAAA: 27.09 },
    "100 Fly":    { B: 78.99, BB: 74.19, A: 70.89, AA: 67.89, AAA: 64.89, AAAA: 61.89 },
    "200 Fly":    { B: 172.79, BB: 162.39, A: 155.09, AA: 148.29, AAA: 141.39, AAAA: 134.89 },
    "100 IM":     { B: 79.29, BB: 74.59, A: 71.19, AA: 68.19, AAA: 65.19, AAAA: 62.29 },
    "200 IM":     { B: 169.09, BB: 158.89, A: 151.69, AA: 145.09, AAA: 138.39, AAAA: 132.09 },
    "400 IM":     { B: 358.29, BB: 336.49, A: 321.19, AA: 307.39, AAA: 293.29, AAAA: 279.89 },
  },

  // ---------------------------------------------------------
  // 13-14 BOYS SCY
  // ---------------------------------------------------------
  "13-14_M_SCY": {
    "50 Free":    { B: 27.49, BB: 25.69, A: 24.59, AA: 23.59, AAA: 22.69, AAAA: 21.79 },
    "100 Free":   { B: 60.09, BB: 56.09, A: 53.69, AA: 51.49, AAA: 49.29, AAAA: 47.19 },
    "200 Free":   { B: 131.09, BB: 122.19, A: 116.79, AA: 111.79, AAA: 107.09, AAAA: 102.49 },
    "500 Free":   { B: 346.49, BB: 323.59, A: 309.49, AA: 295.99, AAA: 282.99, AAAA: 270.89 },
    "1000 Free":  { B: 715.00, BB: 670.00, A: 640.00, AA: 610.00, AAA: 585.00, AAAA: 560.00 },
    "1650 Free":  { B: 1190.00, BB: 1115.00, A: 1065.00, AA: 1015.00, AAA: 970.00, AAAA: 930.00 },
    "50 Back":    { B: 32.29, BB: 30.29, A: 28.99, AA: 27.69, AAA: 26.49, AAAA: 25.39 },
    "100 Back":   { B: 69.49, BB: 65.09, A: 62.29, AA: 59.59, AAA: 56.89, AAAA: 54.59 },
    "200 Back":   { B: 149.89, BB: 140.59, A: 134.29, AA: 128.39, AAA: 122.59, AAAA: 117.39 },
    "50 Breast":  { B: 36.09, BB: 33.99, A: 32.49, AA: 31.09, AAA: 29.69, AAAA: 28.49 },
    "100 Breast": { B: 77.89, BB: 73.29, A: 70.09, AA: 66.99, AAA: 63.99, AAAA: 61.29 },
    "200 Breast": { B: 169.69, BB: 159.79, A: 152.59, AA: 145.89, AAA: 139.29, AAAA: 133.29 },
    "50 Fly":     { B: 29.69, BB: 27.89, A: 26.69, AA: 25.59, AAA: 24.39, AAAA: 23.39 },
    "100 Fly":    { B: 66.09, BB: 61.99, A: 59.29, AA: 56.79, AAA: 54.19, AAAA: 51.89 },
    "200 Fly":    { B: 149.09, BB: 140.09, A: 133.79, AA: 128.09, AAA: 122.29, AAAA: 116.99 },
    "100 IM":     { B: 68.49, BB: 64.39, A: 61.59, AA: 58.89, AAA: 56.29, AAAA: 53.89 },
    "200 IM":     { B: 148.29, BB: 139.29, A: 132.99, AA: 127.19, AAA: 121.39, AAAA: 116.19 },
    "400 IM":     { B: 315.29, BB: 296.29, A: 283.09, AA: 270.79, AAA: 258.39, AAAA: 247.29 },
  },

  // ---------------------------------------------------------
  // 11-12 GIRLS SCY
  // ---------------------------------------------------------
  "11-12_F_SCY": {
    "50 Free":    { B: 32.19, BB: 30.29, A: 28.99, AA: 27.89, AAA: 26.89, AAAA: 25.89 },
    "100 Free":   { B: 70.39, BB: 66.09, A: 63.19, AA: 60.79, AAA: 58.09, AAAA: 55.59 },
    "200 Free":   { B: 152.39, BB: 142.79, A: 136.69, AA: 131.09, AAA: 125.29, AAAA: 120.19 },
    "500 Free":   { B: 407.39, BB: 381.89, A: 364.69, AA: 349.29, AAA: 333.49, AAAA: 319.49 },
    "1000 Free":  { B: 830.00, BB: 780.00, A: 745.00, AA: 710.00, AAA: 675.00, AAAA: 645.00 },
    "1650 Free":  { B: 1370.00, BB: 1285.00, A: 1225.00, AA: 1170.00, AAA: 1115.00, AAAA: 1060.00 },
    "50 Back":    { B: 37.99, BB: 35.69, A: 34.09, AA: 32.69, AAA: 31.29, AAAA: 29.89 },
    "100 Back":   { B: 81.29, BB: 76.29, A: 72.89, AA: 69.79, AAA: 66.69, AAAA: 63.79 },
    "200 Back":   { B: 175.39, BB: 164.89, A: 157.49, AA: 150.89, AAA: 143.89, AAAA: 137.39 },
    "50 Breast":  { B: 42.19, BB: 39.69, A: 37.89, AA: 36.29, AAA: 34.69, AAAA: 33.19 },
    "100 Breast": { B: 91.29, BB: 85.99, A: 82.09, AA: 78.59, AAA: 75.09, AAAA: 71.89 },
    "200 Breast": { B: 199.09, BB: 187.49, A: 179.09, AA: 171.39, AAA: 163.69, AAAA: 156.49 },
    "50 Fly":     { B: 35.29, BB: 33.29, A: 31.79, AA: 30.49, AAA: 29.09, AAAA: 27.89 },
    "100 Fly":    { B: 79.59, BB: 74.79, A: 71.49, AA: 68.39, AAA: 65.39, AAAA: 62.49 },
    "200 Fly":    { B: 174.29, BB: 163.89, A: 156.49, AA: 149.79, AAA: 142.89, AAAA: 136.39 },
    "100 IM":     { B: 80.19, BB: 75.49, A: 72.09, AA: 69.09, AAA: 65.99, AAAA: 63.09 },
    "200 IM":     { B: 171.69, BB: 161.39, A: 154.09, AA: 147.59, AAA: 140.79, AAAA: 134.59 },
    "400 IM":     { B: 363.49, BB: 341.49, A: 326.09, AA: 312.19, AAA: 297.99, AAAA: 284.69 },
  },

  // ---------------------------------------------------------
  // 13-14 GIRLS SCY
  // ---------------------------------------------------------
  "13-14_F_SCY": {
    "50 Free":    { B: 29.29, BB: 27.49, A: 26.29, AA: 25.19, AAA: 24.19, AAAA: 23.19 },
    "100 Free":   { B: 63.99, BB: 60.09, A: 57.49, AA: 55.09, AAA: 52.79, AAAA: 50.59 },
    "200 Free":   { B: 138.19, BB: 129.69, A: 123.89, AA: 118.59, AAA: 113.59, AAAA: 108.69 },
    "500 Free":   { B: 367.49, BB: 344.59, A: 329.29, AA: 314.99, AAA: 301.19, AAAA: 288.19 },
    "1000 Free":  { B: 755.00, BB: 705.00, A: 675.00, AA: 645.00, AAA: 615.00, AAAA: 590.00 },
    "1650 Free":  { B: 1250.00, BB: 1175.00, A: 1120.00, AA: 1070.00, AAA: 1020.00, AAAA: 975.00 },
    "50 Back":    { B: 33.89, BB: 31.89, A: 30.49, AA: 29.19, AAA: 27.89, AAAA: 26.69 },
    "100 Back":   { B: 73.29, BB: 68.79, A: 65.79, AA: 62.99, AAA: 60.19, AAAA: 57.69 },
    "200 Back":   { B: 156.79, BB: 147.19, A: 140.59, AA: 134.49, AAA: 128.39, AAAA: 122.69 },
    "50 Breast":  { B: 37.99, BB: 35.79, A: 34.19, AA: 32.69, AAA: 31.29, AAAA: 29.89 },
    "100 Breast": { B: 81.89, BB: 77.09, A: 73.69, AA: 70.49, AAA: 67.29, AAAA: 64.39 },
    "200 Breast": { B: 177.49, BB: 167.19, A: 159.69, AA: 152.69, AAA: 145.79, AAAA: 139.29 },
    "50 Fly":     { B: 31.49, BB: 29.59, A: 28.29, AA: 27.09, AAA: 25.89, AAAA: 24.79 },
    "100 Fly":    { B: 69.49, BB: 65.29, A: 62.49, AA: 59.79, AAA: 57.09, AAAA: 54.69 },
    "200 Fly":    { B: 154.49, BB: 145.19, A: 138.79, AA: 132.79, AAA: 126.79, AAAA: 121.39 },
    "100 IM":     { B: 71.89, BB: 67.59, A: 64.69, AA: 61.89, AAA: 59.19, AAAA: 56.69 },
    "200 IM":     { B: 154.89, BB: 145.59, A: 138.99, AA: 132.99, AAA: 126.89, AAAA: 121.49 },
    "400 IM":     { B: 328.59, BB: 308.89, A: 295.09, AA: 282.39, AAA: 269.39, AAAA: 257.79 },
  },
}

// Order of standards slowest → fastest
export const LEVELS = ["B", "BB", "A", "AA", "AAA", "AAAA"]

// Given an age, return the age group bucket.
//
// USA Swimming publishes motivational standards for 5 age groups:
//   10 & Under ("10U"), 11-12, 13-14, 15-16, 17-18.
// Earlier versions of this file split 10 & Under into "8U" and "9-10",
// which did not match the published standards. Consolidated to "10U".
export function ageBucket(age) {
  if (age <= 10) return "10U"
  if (age <= 12) return "11-12"
  if (age <= 14) return "13-14"
  if (age <= 16) return "15-16"
  return "17-18"
}

// Build the standards lookup key: age bucket + gender + course
export function standardsKey(age, gender, course = "SCY") {
  return `${ageBucket(age)}_${(gender || "M").toUpperCase()}_${course}`
}
