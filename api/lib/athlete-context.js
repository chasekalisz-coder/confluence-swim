// Build the athlete context for a training note generation.
// CRITICAL: pool type is the filter at this layer. If an athlete has SCY
// and LCM data, only one of those universes is visible to the AI for any
// given note.

import { neon } from '@neondatabase/serverless';

export async function buildAthleteContext({ athleteId, poolType }) {
  if (poolType !== 'SCY' && poolType !== 'LCM') {
    throw new Error('buildAthleteContext: poolType must be SCY or LCM');
  }

  const sql = neon(process.env.DATABASE_URL);

  // Athlete core data
  const athleteRows = await sql`
    SELECT id, data
    FROM athletes
    WHERE id = ${athleteId}
    LIMIT 1
  `;
  if (athleteRows.length === 0) {
    throw new Error(`Athlete not found: ${athleteId}`);
  }
  const athleteData = athleteRows[0].data;

  // Best times — filter by poolType. Expected shape in athlete.data.bestTimes:
  //   [{ event: "50 Free", time: "26.22", poolType: "SCY" }, ...]
  // If event strings have "SCY" or "LCM" suffixes (e.g., "50 Free SCY"),
  // derive poolType from the event name.
  const bestTimes = (athleteData.bestTimes || athleteData.meetTimes || [])
    .map((t) => normalizeTimeEntry(t))
    .filter((t) => t.poolType === poolType);

  // Goal times — separate field, filter by poolType
  const goalTimes = (athleteData.goalTimes || [])
    .map((t) => normalizeTimeEntry(t))
    .filter((t) => t.poolType === poolType);

  // Recent sessions — filter by poolType AND training (not technique)
  // Expected sessions table shape: data JSONB with { poolType, noteType, category, stroke, summary, date }
  const sessionRows = await sql`
    SELECT id, athlete_id, date, category, data, created_at
    FROM sessions
    WHERE athlete_id = ${athleteId}
    ORDER BY created_at DESC
    LIMIT 30
  `;

  const recentSessions = sessionRows
    .map((row) => ({
      date: row.date,
      category: row.category,
      poolType: row.data?.poolType,
      noteType: row.data?.noteType || 'training',
      stroke: row.data?.stroke,
      summary: row.data?.summary || row.data?.shortSummary,
    }))
    .filter(
      (s) => s.poolType === poolType && s.noteType === 'training',
    )
    .slice(0, 8);

  return {
    id: athleteData.id || athleteId,
    firstName: athleteData.first || athleteData.firstName,
    lastName: athleteData.last || athleteData.lastName || '',
    age: athleteData.age,
    pronouns: athleteData.pronouns,
    events: athleteData.events || [],
    bestTimes,
    goalTimes,
    recentSessions,
  };
}

// Normalize a time entry. Handles multiple input formats:
//   { event: "50 Free SCY", time: "26.22" }            -> derives poolType from event name
//   { event: "50 Free", time: "26.22", poolType: "SCY" } -> uses explicit poolType
function normalizeTimeEntry(t) {
  if (t.poolType === 'SCY' || t.poolType === 'LCM') {
    return t;
  }
  const event = t.event || '';
  if (/\bSCY\b/i.test(event)) {
    return {
      ...t,
      event: event.replace(/\s*SCY\s*$/i, '').trim(),
      poolType: 'SCY',
    };
  }
  if (/\bLCM\b/i.test(event)) {
    return {
      ...t,
      event: event.replace(/\s*LCM\s*$/i, '').trim(),
      poolType: 'LCM',
    };
  }
  // If no pool type is determinable, mark as unknown — won't match
  // either filter and will be excluded from context. Safer than guessing.
  return { ...t, poolType: 'UNKNOWN' };
}
