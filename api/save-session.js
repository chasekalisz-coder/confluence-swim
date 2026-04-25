

// Vercel serverless function: save a training session to the database
// POST /api/save-session
//
// Response: { id: "sess_...", saved: true }
//
// SCHEMA ENFORCEMENT (as of 2026-04-25):
// Every rep in mainSet.reps must have: hr, time, distance, zone.
// If any are missing we add them to warnings and normalize to null
// rather than undefined — so downstream readers always get a consistent
// shape. We never block a save over missing rep data (the note is more
// important than the structured data) but we do warn so the prompt
// can be improved.

import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      athleteId,
      date,
      category,
      poolType,
      stroke,
      sessionNumber,
      durationMinutes,
      coachIntent,
      coachObservation,
      mainSet,
      hiLo,
      note,
      charts,
      warnings: incomingWarnings,
      rawModelOutput,
      correctedData,
      wasRegenerated,
      model,
      noteType,
      videoReferences,
    } = req.body;

    // Hard validations — these block the save
    if (!athleteId) return res.status(400).json({ error: 'athleteId is required' });
    if (!poolType || (poolType !== 'SCY' && poolType !== 'LCM')) {
      return res.status(400).json({ error: 'poolType must be SCY or LCM' });
    }
    if (!category) return res.status(400).json({ error: 'category is required' });
    if (!note) return res.status(400).json({ error: 'note is required' });

    // Schema enforcement on reps — normalize shape, collect warnings
    const schemaWarnings = [];
    const normalizedMainSet = enforceRepSchema(mainSet, schemaWarnings);

    const sql = neon(process.env.DATABASE_URL);

    const id = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    const sessionDate = date || new Date().toISOString().split('T')[0];

    const data = {
      poolType,
      noteType: noteType || 'training',
      stroke: stroke || null,
      sessionNumber: sessionNumber || null,
      durationMinutes: durationMinutes || null,
      coachIntent: coachIntent || null,
      coachObservation: coachObservation || null,
      mainSet: normalizedMainSet,
      hiLo: hiLo || null,
      note: note || null,
      charts: charts || [],
      warnings: [...(incomingWarnings || []), ...schemaWarnings],
      rawModelOutput: rawModelOutput || null,
      correctedData: correctedData || null,
      wasRegenerated: !!wasRegenerated,
      model: model || null,
      videoReferences: videoReferences || [],
      summary: buildShortSummary(normalizedMainSet, category, stroke),
      schemaVersion: 2, // bump when rep schema changes
    };

    await sql`
      INSERT INTO sessions (id, athlete_id, date, category, data, created_at)
      VALUES (
        ${id},
        ${athleteId},
        ${sessionDate},
        ${category},
        ${JSON.stringify(data)},
        now()
      )
    `;

    return res.status(200).json({ id, saved: true, schemaWarnings });
  } catch (err) {
    console.error('save-session error:', err);
    return res.status(500).json({
      error: 'Internal error',
      detail: String(err),
    });
  }
}

// Normalize every rep to the canonical shape:
//   { rep, distance, time, hr, zone, splits }
// Missing fields become null (not undefined) so readers always get
// a consistent shape. Warnings are added for any missing hr values
// so we can track prompt compliance over time.
function enforceRepSchema(mainSet, warnings) {
  if (!mainSet) return null;
  const reps = mainSet.reps || [];
  let missingHR = 0;
  let missingTime = 0;

  const normalizedReps = reps.map((r, i) => {
    const rep = {
      rep:      r.rep      ?? i + 1,
      distance: r.distance ?? null,
      time:     r.time     ?? null,
      hr:       r.hr       ?? null,
      zone:     r.zone     ?? mainSet.zone ?? null,
      splits:   Array.isArray(r.splits) ? r.splits : [],
    };
    if (rep.hr === null)   missingHR++;
    if (rep.time === null) missingTime++;
    return rep;
  });

  if (missingHR > 0) {
    warnings.push(`Schema: ${missingHR} of ${reps.length} reps missing HR count — check training prompt HR extraction`);
  }
  if (missingTime > 0) {
    warnings.push(`Schema: ${missingTime} of ${reps.length} reps missing time`);
  }

  return {
    ...mainSet,
    zone: mainSet.zone ?? null,
    reps: normalizedReps,
  };
}

function buildShortSummary(mainSet, category, stroke) {
  const parts = [];
  if (mainSet?.name) parts.push(mainSet.name);
  else {
    if (stroke && stroke !== 'mixed') parts.push(stroke);
    parts.push(category);
  }
  return parts.join(' · ').slice(0, 140);
}
