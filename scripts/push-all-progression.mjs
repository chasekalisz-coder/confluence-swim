#!/usr/bin/env node
// ============================================================
// push-all-progression.mjs
// ============================================================
// Convenience wrapper: runs push-progression.mjs for every athlete in
// a deterministic, smallest-first order so any parser bugs surface on
// athletes with the fewest entries before larger ones.
//
// Run order (smallest → largest):
//   1. ath_farris     2 entries  (canary)
//   2. ath_mason     15
//   3. ath_liam      19
//   4. ath_hannah    73
//   5. ath_grace     78
//   6. ath_pace      85
//   7. ath_kaden     94
//   8. ath_lana     125
//   9. ath_marley   132
//  10. ath_ben      205
//  11. ath_jon      282  (largest, last)
//
// Run:
//   CONFIRM=yes node scripts/push-all-progression.mjs
//
// Refuses to run without CONFIRM=yes. Stops on first failure so a
// broken push doesn't cascade across athletes.
// ============================================================

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const ORDER = [
  'ath_farris',
  'ath_mason',
  'ath_liam',
  'ath_hannah',
  'ath_grace',
  'ath_pace',
  'ath_kaden',
  'ath_lana',
  'ath_marley',
  'ath_ben',
  'ath_jon',
]

if (process.env.CONFIRM !== 'yes') {
  console.error('Refusing to run without CONFIRM=yes.')
  console.error('Re-run with: CONFIRM=yes node scripts/push-all-progression.mjs')
  process.exit(1)
}

for (const athleteId of ORDER) {
  console.log(`\n========================================`)
  console.log(`PUSHING: ${athleteId}`)
  console.log(`========================================`)
  const r = spawnSync(
    'node',
    [path.join(__dirname, 'push-progression.mjs'), `--athlete=${athleteId}`],
    { stdio: 'inherit', env: { ...process.env, CONFIRM: 'yes' } }
  )
  if (r.status !== 0) {
    console.error(`\nSTOPPED: ${athleteId} push exited ${r.status}.`)
    console.error('Fix the issue before re-running. Already-pushed athletes will dedupe on re-run.')
    process.exit(r.status || 1)
  }
}

console.log('\n========================================')
console.log('ALL 11 ATHLETES PUSHED SUCCESSFULLY')
console.log('========================================')
