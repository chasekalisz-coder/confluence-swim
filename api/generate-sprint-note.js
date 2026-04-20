import { SPRINT_SYSTEM_PROMPT, SPRINT_DATA_PROMPT } from './lib/sprint-prompt.js';
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { imageBase64, imageMediaType, athlete, meta, feedback } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

  // Build athlete context
  let athleteContext = '';
  if (athlete) {
    athleteContext += `\n\nATHLETE: ${athlete.first} ${athlete.last || ''}, Age ${athlete.age || '?'}`;
    athleteContext += `\nPRIMARY EVENTS: ${(athlete.events || []).join(', ') || 'Not specified'}`;
    if (athlete.goalTimes && athlete.goalTimes.length > 0) {
      athleteContext += `\nGOAL TIMES:\n${athlete.goalTimes.map(g => `  ${g.event}: ${g.time}`).join('\n')}`;
    }
    if (athlete.meetTimes && athlete.meetTimes.length > 0) {
      athleteContext += `\nCURRENT BEST TIMES:\n${athlete.meetTimes.map(t => `  ${t.event}: ${t.time}`).join('\n')}`;
    }
  }

  // Build meta context
  let metaContext = '';
  if (meta) {
    metaContext += `\nDATE: ${meta.date || 'today'}`;
    metaContext += `\nPOOL: ${meta.poolType || 'SCY'}`;
  }

  // Build feedback context
  let feedbackContext = '';
  if (feedback) {
    if (feedback.wentWell) feedbackContext += `\n\nATHLETE FEEDBACK — WHAT WENT WELL:\n${feedback.wentWell}`;
    if (feedback.needsWork) feedbackContext += `\n\nATHLETE FEEDBACK — WHAT NEEDS WORK:\n${feedback.needsWork}`;
    if (feedback.coachNote) feedbackContext += `\n\nATHLETE NOTE TO COACH McEVOY:\n${feedback.coachNote}`;
  }

  // Load past sprint sessions for context (last 30)
  let pastSessionsContext = '';
  if (athlete && athlete.id && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      const rows = await sql`
        SELECT data FROM sessions 
        WHERE athlete_id = ${athlete.id} 
        AND data->>'noteType' = 'sprint'
        ORDER BY created_at DESC 
        LIMIT 30
      `;
      if (rows.length > 0) {
        pastSessionsContext = '\n\nPAST SPRINT SESSIONS (most recent first):\n';
        rows.forEach((row, i) => {
          const d = row.data;
          pastSessionsContext += `\n--- Session ${i + 1} (${d.date || '?'}) ---`;
          if (d.sprintData && d.sprintData.timedEfforts) {
            pastSessionsContext += `\nTimed efforts: ${JSON.stringify(d.sprintData.timedEfforts)}`;
          }
          if (d.note) {
            if (d.note.section_05) pastSessionsContext += `\nPrevious recommendations: ${d.note.section_05.substring(0, 300)}`;
          }
          pastSessionsContext += '\n';
        });
      }
    } catch (e) {
      console.warn('Failed to load past sprint sessions:', e.message);
    }
  }

  try {
    // API Call 1: Generate the note
    const noteResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 5000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: imageMediaType || 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: `Read this sprint/power session sheet and write the Sprint Lab note.${athleteContext}${metaContext}${feedbackContext}${pastSessionsContext}` }
          ]
        }],
        system: SPRINT_SYSTEM_PROMPT,
      }),
    });

    if (!noteResponse.ok) {
      const errData = await noteResponse.json().catch(() => ({}));
      return res.status(noteResponse.status).json({ error: errData.error?.message || 'API error', details: errData });
    }

    const noteData = await noteResponse.json();
    const noteText = noteData.content?.[0]?.text || '';

    // API Call 2: Extract structured data
    const dataResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: imageMediaType || 'image/jpeg', data: imageBase64 } },
            { type: 'text', text: SPRINT_DATA_PROMPT }
          ]
        }],
      }),
    });

    let sprintData = {};
    if (dataResponse.ok) {
      const dataResult = await dataResponse.json();
      const raw = dataResult.content?.[0]?.text || '';
      try {
        const cleaned = raw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        sprintData = JSON.parse(cleaned);
      } catch (e) {
        sprintData = { parseError: e.message, raw };
      }
    }

    // Parse note sections
    const sections = {};
    const sectionMap = {
      'SESSION OVERVIEW': 'section_01',
      'THE SCIENCE': 'section_02',
      'YOUR RESULTS': 'section_03',
      'COACH McEVOY\'S FEEDBACK': 'section_04',
      'COACH MCEVOY\'S FEEDBACK': 'section_04',
      'NEXT STEPS': 'section_05',
      'GOAL TRACKER': 'section_06',
    };
    Object.keys(sectionMap).forEach(header => {
      const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp('\\[' + escaped + '\\]\\s*([\\s\\S]*?)(?=\\[(?:SESSION|THE SCIENCE|YOUR RESULTS|COACH|NEXT STEPS|GOAL TRACKER)|$)', 'i');
      const match = noteText.match(regex);
      if (match) sections[sectionMap[header]] = match[1].trim();
    });

    return res.status(200).json({
      ok: true,
      note: sections,
      rawNoteText: noteText,
      sprintData,
      model: 'claude-sonnet-4-20250514',
      noteType: 'sprint',
    });

  } catch (err) {
    console.error('Sprint Lab error:', err);
    return res.status(500).json({ error: err.message });
  }
}
