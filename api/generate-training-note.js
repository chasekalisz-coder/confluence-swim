// Vercel serverless function: generate a training session note
// POST /api/generate-training-note
//
// Request body:
// {
//   athleteId: "ath_jon",
//   category: "active_rest",        // aerobic | threshold | active_rest | recovery | quality | power
//   stroke: "backstroke",           // free | back | breast | fly | im | mixed
//   poolType: "SCY",                // SCY | LCM — REQUIRED, no default
//   sessionNumber: 3,               // optional, internal reference only
//   durationMinutes: 75,
//   photoBase64: "iVBORw0KG...",    // base64 encoded JPG/PNG
//   photoMediaType: "image/jpeg",
//   coachIntent: "optional — what I was going for",
//   coachObservation: "optional — what I saw on deck",
//
//   correctedData: {                // OPTIONAL — when user has edited data & wants regenerate
//     mainSet: { name, zone, interval, reps: [...] },
//     hiLo: { hi, lo, drop } | null
//   }
// }
//
// Response:
// {
//   note: { section_01, section_02, section_03, section_04, section_05 },
//   mainSet: { name, reps: [{rep, distance, time, hr, splits}] },
//   charts: ["opening_50_drift", "rep_internal_splits"],
//   warnings: ["Could not read HR on rep 4"],
//   rawModelOutput: "..."           // for correction panel and audit
// }

import { buildTrainingPrompt } from './lib/training-prompt.js';
import { buildAthleteContext } from './lib/athlete-context.js';

// Model choice — swap in one place
const MODEL = 'claude-sonnet-4-6';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      athleteId,
      category,
      stroke,
      poolType,
      sessionNumber,
      durationMinutes,
      photoBase64,
      photoMediaType,
      coachIntent,
      coachObservation,
      correctedData,  // NEW — present on regeneration
    } = req.body;

    // HARD GUARDRAILS
    if (!athleteId) return res.status(400).json({ error: 'athleteId is required' });
    if (poolType !== 'SCY' && poolType !== 'LCM') {
      return res.status(400).json({
        error: 'poolType must be explicitly "SCY" or "LCM". No default is permitted. The coach must click.',
      });
    }
    if (!category) return res.status(400).json({ error: 'category is required' });
    if (!photoBase64 || !photoMediaType) {
      return res.status(400).json({ error: 'photoBase64 and photoMediaType are required' });
    }

    // Build athlete context — filtered by poolType, no cross-pool data.
    const athleteContext = await buildAthleteContext({
      athleteId,
      poolType,
    });

    // Build the system prompt
    const systemPrompt = buildTrainingPrompt({
      athlete: athleteContext,
      category,
      stroke,
      poolType,
      sessionNumber,
      durationMinutes,
      coachIntent,
      coachObservation,
    });

    // Build user message content array.
    // Always include the photo. If correctedData is present, include it as
    // AUTHORITATIVE and instruct the AI to use it instead of re-extracting.
    const content = [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: photoMediaType,
          data: photoBase64,
        },
      },
    ];

    if (correctedData) {
      content.push({
        type: 'text',
        text: `The coach has reviewed your previous extraction of this session's data and CORRECTED the numbers below. These corrected numbers are AUTHORITATIVE. Use them exactly as given. Do NOT re-extract from the photo. Do NOT change them.

CORRECTED DATA:
${JSON.stringify(correctedData, null, 2)}

Generate the full training note using these corrected numbers. Include the same mainSet and hiLo exactly as given — do not alter any values. Your job is to update the prose analysis to reflect these corrected numbers.

Return valid JSON only, no preamble, matching the schema from the system prompt.`,
      });
    } else {
      content.push({
        type: 'text',
        text: `Generate the training note for this session. Follow the output format exactly. Return valid JSON only, no preamble.`,
      });
    }

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
      wasRegenerated: !!correctedData,
    });
  } catch (err) {
    console.error('generate-training-note error:', err);
    return res.status(500).json({ error: 'Internal error', detail: String(err) });
  }
}
