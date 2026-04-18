
// Vercel serverless function: generate a technique session note
// POST /api/generate-technique-note
//
// Accepts the topicBlocks format from the fault-chip UI.
//
// Request body:
// {
//   athleteId: "ath_jon",
//   poolType: "SCY",
//   sessionNumber: 5,
//   durationMinutes: 60,
//   topicBlocks: [
//     {
//       topicId: "freestyle",
//       topicLabel: "Freestyle",
//       categoryId: "catch",
//       categoryLabel: "Catch",
//       faults: ["Dropped elbow on entry", "Hand entering too wide"],
//       whatImproved: "Started getting fingertips down before pulling",
//       whatNeedsWork: "Still losing the elbow when tired"
//     }
//   ],
//   photoBase64: null,
//   photoMediaType: null,
// }

import { buildTechniquePrompt } from './lib/technique-prompt.js';
import { buildAthleteContext } from './lib/athlete-context.js';

const MODEL = 'claude-sonnet-4-6';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      athleteId, poolType, sessionNumber, durationMinutes,
      topicBlocks, photoBase64, photoMediaType,
    } = req.body;

    // Validation
    if (!athleteId) return res.status(400).json({ error: 'athleteId is required' });
    if (poolType !== 'SCY' && poolType !== 'LCM') {
      return res.status(400).json({ error: 'poolType must be SCY or LCM' });
    }
    if (!topicBlocks || !Array.isArray(topicBlocks) || topicBlocks.length === 0) {
      return res.status(400).json({ error: 'At least one technique topic block is required' });
    }
    const totalFaults = topicBlocks.reduce((sum, tb) => sum + (tb.faults?.length || 0), 0);
    if (totalFaults === 0) {
      return res.status(400).json({ error: 'At least one fault must be selected' });
    }

    // Build athlete context (poolType filtered)
    const athleteContext = await buildAthleteContext({ athleteId, poolType });

    // Build system prompt
    const systemPrompt = buildTechniquePrompt({
      athlete: athleteContext,
      poolType,
      sessionNumber,
      durationMinutes,
      topicBlocks,
    });

    // Build user message
    const content = [];

    if (photoBase64 && photoMediaType) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: photoMediaType, data: photoBase64 },
      });
    }

    const hasPhoto = !!(photoBase64 && photoMediaType);
    const instruction = hasPhoto
      ? 'Generate the technique session note. The coach provided structured fault data AND a photo. Structured data is AUTHORITATIVE. Photo provides supplementary context. Return valid JSON only, no preamble.'
      : 'Generate the technique session note using the structured fault and observation data provided. Return valid JSON only, no preamble.';
    content.push({ type: 'text', text: instruction });

    // Call Anthropic
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
