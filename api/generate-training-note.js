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
//   coachObservation: "optional — what I saw on deck"
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
    } = req.body;

    // HARD GUARDRAILS — these exist because violating them produces
    // wrong and potentially harmful coaching output.

    if (!athleteId) {
      return res.status(400).json({ error: 'athleteId is required' });
    }

    // SCY/LCM is the non-skip gate. If the UI didn't enforce it, we do.
    if (poolType !== 'SCY' && poolType !== 'LCM') {
      return res.status(400).json({
        error: 'poolType must be explicitly "SCY" or "LCM". No default is permitted. The coach must click.',
      });
    }

    if (!category) {
      return res.status(400).json({ error: 'category is required' });
    }

    if (!photoBase64 || !photoMediaType) {
      return res.status(400).json({ error: 'photoBase64 and photoMediaType are required' });
    }

    // Build athlete context — filtered by poolType, no cross-pool data.
    const athleteContext = await buildAthleteContext({
      athleteId,
      poolType,          // Filters history and best/goal times to matching pool only
    });

    // Build the system prompt with all framework + guardrails + context.
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

    // The user message is the photo + a request to generate.
    const userMessage = {
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: photoMediaType,
            data: photoBase64,
          },
        },
        {
          type: 'text',
          text: `Generate the training note for this session. Follow the output format exactly. Return valid JSON only, no preamble.`,
        },
      ],
    };

    // Call Anthropic.
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
      return res.status(502).json({
        error: 'AI model call failed',
        detail: errText,
      });
    }

    const apiData = await apiResponse.json();

    // Extract the text output from the response.
    const rawText = apiData.content
      ?.filter((block) => block.type === 'text')
      ?.map((block) => block.text)
      ?.join('\n')
      ?.trim();

    if (!rawText) {
      return res.status(502).json({
        error: 'AI returned empty response',
        detail: apiData,
      });
    }

    // Parse JSON output. Strip markdown fences if the model added them.
    let parsed;
    try {
      const clean = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
      parsed = JSON.parse(clean);
    } catch (err) {
      console.error('Failed to parse model JSON:', rawText);
      return res.status(502).json({
        error: 'AI returned invalid JSON',
        rawText,
      });
    }

    // Return the structured note + raw output for audit/correction panel.
    return res.status(200).json({
      ...parsed,
      rawModelOutput: rawText,
      model: MODEL,
    });
  } catch (err) {
    console.error('generate-training-note error:', err);
    return res.status(500).json({
      error: 'Internal error',
      detail: String(err),
    });
  }
}
