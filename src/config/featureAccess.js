// ============================================================
// src/config/featureAccess.js
// ============================================================
// Encodes the tier matrix from docs/reference/tier-access-matrix.md
// as runtime-checkable rules.
//
// Two pieces:
//   1. FEATURES — for each gated feature, which tiers can see it
//   2. canSeeFeature(athlete, featureName) — the gate
//
// Anything NOT listed in FEATURES is treated as universal (every tier
// can see it). That keeps Profile-side content (Hero / Chasing Next /
// Times & Goals / Last Race / Upcoming Meets / Scheduling) and the
// universal app surfaces (Sessions / Meets / Resources) outside of
// gating logic — they simply don't show up here.
//
// To change a tier's access to a feature, edit the array. To add a new
// feature, add a new entry. The matrix doc is the design intent; this
// file is the running code.
// ============================================================

import { getTier } from '../lib/tiers.js'

/**
 * Map of feature name → array of tiers that can access that feature.
 *
 * Feature names are stable identifiers used by gating code. Keep them
 * lowercase, snake_case, and tied to a UI section (not a component
 * name). If a section gets renamed or refactored, the gate name should
 * stay the same so the matrix doesn't have to change too.
 *
 * Reference matrix (as of Session 14):
 *   Skills    → Profile only (no Performance Analysis tab at all)
 *   Bronze    → Profile + Race Pace Calculator
 *   Silver    → Profile + Race Pace + Progression + Power Rankings
 *               + Championship Standards + Age-Up Preview
 *   Gold      → Everything
 */
export const FEATURES = {
  // Performance Analysis tab visibility
  performance_analysis_tab: ['bronze', 'silver', 'gold'],

  // Sections inside Performance Analysis
  race_pace:                ['bronze', 'silver', 'gold'],
  progression_chart:        ['silver', 'gold'],
  power_rankings:           ['silver', 'gold'],
  championship_standards:   ['silver', 'gold'],
  age_up_preview:           ['silver', 'gold'],
  range_bloom:              ['silver', 'gold'],

  // Gold-only Performance Analysis sections
  meet_analyzer:            ['gold'],
  aerobic_development:      ['gold'],

  // Profile-side gated section
  training_metrics:         ['gold'],
}

/**
 * Does this athlete's tier have access to this feature?
 *
 * @param {object|null|undefined} athlete - athlete record
 * @param {string} featureName - key from FEATURES
 * @returns {boolean}
 */
export function canSeeFeature(athlete, featureName) {
  // Feature not declared in the matrix → universal access.
  // Better to default-allow than to break a section by typo.
  const allowedTiers = FEATURES[featureName]
  if (!allowedTiers) return true

  const tier = getTier(athlete)
  return allowedTiers.includes(tier)
}

/**
 * Inverse: should this section render in DEMO mode (with Chase's data)
 * because the user's tier doesn't have access to it?
 *
 * Convenience wrapper — equivalent to !canSeeFeature, named for clarity
 * at the call site.
 */
export function isLockedForTier(athlete, featureName) {
  return !canSeeFeature(athlete, featureName)
}
