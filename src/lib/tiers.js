// ============================================================
// src/lib/tiers.js
// ============================================================
// Single source of truth for "what tier is this athlete?"
//
// Derives a stable tier key from the existing `programType` display
// string, which is set via the admin Edit Athlete dropdown:
//   "Gold Development"        → "gold"
//   "Silver High Performance" → "silver"
//   "Bronze Competition"      → "bronze"
//   "Skills Package"          → "skills"
//   "Single Lesson"           → "single"
//   ""  / null / unrecognized → "gold" (default — see note below)
//
// The first-word-lowercased pattern matches what FamilyProfile.jsx
// already uses for the program-badge CSS class. Encapsulating it here
// means any future change (renaming a tier, swapping to a separate
// `tier` field on the athlete record, etc.) only touches one function.
//
// Default-to-gold rationale: every existing athlete in the system pre-
// dates the tier feature. Defaulting unset records to gold keeps their
// app experience unchanged until Chase explicitly sets a tier. Once
// every athlete has a tier set, this default becomes irrelevant.
// ============================================================

export const TIERS = ['gold', 'silver', 'bronze', 'skills', 'single']

/**
 * Get an athlete's tier key. Always returns one of TIERS.
 *
 * @param {object|null|undefined} athlete - athlete record
 * @returns {'gold'|'silver'|'bronze'|'skills'|'single'}
 */
export function getTier(athlete) {
  const programType = athlete?.programType || ''
  const firstWord = programType.split(' ')[0].toLowerCase().trim()
  if (TIERS.includes(firstWord)) return firstWord
  return 'gold'
}

/**
 * Compare two tiers. Returns:
 *   negative if a is *lower* than b (b is more premium)
 *   zero    if they're the same tier
 *   positive if a is *higher* than b (a is more premium)
 *
 * Tier ordering high → low: gold > silver > bronze > skills > single
 *
 * Useful for "minimum tier" gates like
 *   compareTiers(getTier(athlete), 'silver') >= 0
 * which reads as "athlete is at least Silver".
 */
export function compareTiers(a, b) {
  // TIERS is ordered most → least premium, so a *lower* index = more premium.
  // Flip the sign so positive means "a is higher tier."
  return TIERS.indexOf(b) - TIERS.indexOf(a)
}
