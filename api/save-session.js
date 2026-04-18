

// Vercel serverless function: save a training session to the database
// POST /api/save-session
//
// Request body: full session data including generated note + any corrections
//
// Response: { id: "sess_...", saved: true }

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
      warnings,
      rawModelOutput,
      correctedData,
      wasRegenerated,
      model,
      noteType,
      videoReferences,
    } = req.body;

    // Validation
    if (!athleteId) return res.status(400).json({ error: 'athleteId is required' });
    if (!poolType || (poolType !== 'SCY' && poolType !== 'LCM')) {
      return res.status(400).json({ error: 'poolType must be SCY or LCM' });
    }
    if (!category) return res.status(400).json({ error: 'category is required' });
    if (!note) return res.status(400).json({ error: 'note is required' });

    const sql = neon(process.env.DATABASE_URL);

    // Generate a simple unique ID
    const id = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    const sessionDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const data = {
      poolType,
      noteType: noteType || 'training',
      stroke: stroke || null,
      sessionNumber: sessionNumber || null,
      durationMinutes: durationMinutes || null,
      coachIntent: coachIntent || null,
      coachObservation: coachObservation || null,
      mainSet: mainSet || null,
      hiLo: hiLo || null,
      note: note || null,
      charts: charts || [],
      warnings: warnings || [],
      rawModelOutput: rawModelOutput || null,
      correctedData: correctedData || null,
      wasRegenerated: !!wasRegenerated,
      model: model || null,
      videoReferences: videoReferences || [],
      summary: buildShortSummary(mainSet, category, stroke),
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

    return res.status(200).json({ id, saved: true });
  } catch (err) {
    console.error('save-session error:', err);
    return res.status(500).json({
      error: 'Internal error',
      detail: String(err),
    });
  }
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
