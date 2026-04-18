// Vercel serverless function: generate a technique session note
// POST /api/generate-technique-note
//
// The coach types FREE-FORM observations. No checkboxes. No fault pick-lists.
// The AI uses the fault library embedded in the system prompt as background knowledge.
//
// Request body:
// {
//   athleteId: "ath_jon",
//   poolType: "SCY",
//   sessionType: "freestyle",
//   sessionNumber: 5,               // optional
//   durationMinutes: 60,            // optional
//   coachObserved: "free text",     // what I observed
//   coachWorkedOn: "free text",     // what we worked on
//   coachImproved: "free text",     // what improved
//   coachNeedsWork: "free text",    // what still needs work
//   photoBase64: null,              // optional
//   photoMediaType: null,           // optional
// }

import { buildTechniquePrompt } from './lib/technique-prompt.js';
import { buildAthleteContext } from './lib/athlete-context.js';

const MODEL = 'claude-sonnet-4-6';

const VALID_SESSION_TYPES = [
  'freestyle', 'backstroke', 'breaststroke', 'butterfly',
  'im', 'kick', 'turns', 'starts', 'underwaters',
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      athleteId, poolType, sessionType, sessionNumber, durationMinutes,
      coachObserved, coachWorkedOn, coachImproved, coachNeedsWork,
      photoBase64, photoMediaType,
    } = req.body;

    if (!athleteId) return res.status(400).json({ error: 'athleteId is required' });
    if (poolType !== 'SCY' && poolType !== 'LCM') {
      return res.status(400).json({ error: 'poolType must be SCY or LCM' });
    }
    if (!sessionType || !VALID_SESSION_TYPES.includes(sessionType)) {
      return res.status(400).json({ error: 'sessionType must be one of: ' + VALID_SESSION_TYPES.join(', ') });
    }
    const hasContent = [coachObserved, coachWorkedOn, coachImproved, coachNeedsWork]
      .some(f => f && f.trim().length > 0);
    if (!hasContent && !photoBase64) {
      return res.status(400).json({ error: 'At least one observation field or a photo is required' });
    }

    const athleteContext = await buildAthleteContext({ athleteId, poolType });

    const systemPrompt = buildTechniquePrompt({
      athlete: athleteContext, poolType, sessionType, sessionNumber, durationMinutes,
      coachObserved, coachWorkedOn, coachImproved, coachNeedsWork,
    });

    const content = [];
    if (photoBase64 && photoMediaType) {
      content.push({ type: 'image', source: { type: 'base64', media_type: photoMediaType, data: photoBase64 } });
    }

    const hasPhoto = !!(photoBase64 && photoMediaType);
    const instruction = hasPhoto
      ? 'Generate the technique session note. The coach provided typed observations AND a photo. Typed observations are AUTHORITATIVE. Photo provides supplementary context. Return valid JSON only, no preamble.'
      : 'Generate the technique session note using the coach\'s observations. Return valid JSON only, no preamble.';
    content.push({ type: 'text', text: instruction });

    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL, max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: 'user', content }],
      }),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error('Anthropic API error:', apiResponse.status, errText);
      return res.status(502).json({ error: 'AI model call failed', detail: errText });
    }

    const apiData = await apiResponse.json();
    const rawText = apiData.content
      ?.filter(b => b.type === 'text')?.map(b => b.text)?.join('\n')?.trim();

    if (!rawText) {
      return res.status(502).json({ error: 'AI returned empty response', detail: apiData });
    }

    let parsed;
    try {
      const clean = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      parsed = JSON.parse(clean);
    } catch (err) {
      console.error('Failed to parse model JSON:', rawText);
      return res.status(502).json({ error: 'AI returned invalid JSON', rawText });
    }

    return res.status(200).json({
      ...parsed, rawModelOutput: rawText, model: MODEL, noteType: 'technique',
    });
  } catch (err) {
    console.error('generate-technique-note error:', err);
    return res.status(500).json({ error: 'Internal error', detail: String(err) });
  }
}
