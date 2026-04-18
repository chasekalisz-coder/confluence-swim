// Vercel serverless function: generate a meet prep note
// POST /api/generate-meetprep-note
//
// Request body:
// {
//   athleteId: "ath_jon",
//   poolType: "SCY",
//   meetName: "YMCA Champs",
//   meetDate: "2026-04-25",     // optional
//   daysOut: 3,                 // optional
//   eventBlocks: [
//     {
//       eventName: "100 Fly",
//       bestTime: "1:02.91",    // auto-populated from athlete data
//       shortSwimDistance: "25",
//       shortSwimTime: "14.2",
//       shortSwimSplit: null,
//       warmupNotes: "Worked on catch timing and underwater pullout",
//       raceTalkNotes: "Hold stroke rate through the back 50, breathe every 3"
//     }
//   ],
//   photoBase64: null,          // OPTIONAL
//   photoMediaType: null,       // OPTIONAL
// }

import { buildMeetPrepPrompt } from './lib/meetprep-prompt.js';
import { buildAthleteContext } from './lib/athlete-context.js';

const MODEL = 'claude-sonnet-4-6';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      athleteId,
      poolType,
      meetName,
      meetDate,
      daysOut,
      eventBlocks,
      photoBase64,
      photoMediaType,
    } = req.body;

    // Validation
    if (!athleteId) return res.status(400).json({ error: 'athleteId is required' });
    if (poolType !== 'SCY' && poolType !== 'LCM') {
      return res.status(400).json({ error: 'poolType must be SCY or LCM' });
    }
    if (!eventBlocks || !Array.isArray(eventBlocks) || eventBlocks.length === 0) {
      return res.status(400).json({ error: 'At least one event block is required' });
    }
    if (eventBlocks.length > 6) {
      return res.status(400).json({ error: 'Maximum 6 events per meet prep session' });
    }

    // Build athlete context filtered by poolType
    const athleteContext = await buildAthleteContext({ athleteId, poolType });

    // Build system prompt
    const systemPrompt = buildMeetPrepPrompt({
      athlete: athleteContext,
      poolType,
      meetName,
      meetDate,
      daysOut,
      eventBlocks,
    });

    // Build user message
    const content = [];

    // If photo provided, include it
    if (photoBase64 && photoMediaType) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: photoMediaType,
          data: photoBase64,
        },
      });
    }

    // Text instruction
    const hasPhoto = !!(photoBase64 && photoMediaType);
    const hasTypedData = eventBlocks.some(eb => eb.warmupNotes || eb.raceTalkNotes || eb.shortSwimTime);

    let instruction = '';
    if (hasPhoto && hasTypedData) {
      instruction = 'Generate the meet prep note. The coach has provided typed event data AND a photo. Use the typed data as authoritative. The photo provides supplementary context. Return valid JSON only, no preamble.';
    } else if (hasPhoto) {
      instruction = 'Generate the meet prep note. Extract any additional event details, warmup notes, or race strategy notes from the attached photo. Combine with the event blocks provided in the system prompt. Return valid JSON only, no preamble.';
    } else {
      instruction = 'Generate the meet prep note using the event data provided. Return valid JSON only, no preamble.';
    }

    content.push({ type: 'text', text: instruction });

    const userMessage = { role: 'user', content };

    // Call Anthropic
    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        system: systemPrompt,
        messages: [userMessage],
      }),
    });

    if (!apiResponse.ok) {
      const errText = await apiResponse.text();
      console.error('Anthropic API error:', apiResponse.status, errText);
      return res.status(502).json({ error: 'AI model call failed', detail: errText });
    }

    const apiData = await apiResponse.json();

    const rawText = apiData.content
      ?.filter((block) => block.type === 'text')
      ?.map((block) => block.text)
      ?.join('\n')
      ?.trim();

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
      ...parsed,
      rawModelOutput: rawText,
      model: MODEL,
      noteType: 'meetprep',
    });
  } catch (err) {
    console.error('generate-meetprep-note error:', err);
    return res.status(500).json({ error: 'Internal error', detail: String(err) });
  }
}
