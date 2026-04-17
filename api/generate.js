// Vercel serverless function.
// Phase 1: health check only. Phase 3 will add the real Anthropic proxy.
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      phase: 1,
      message: 'Generate endpoint is alive. Real AI calls come in Phase 3.',
      hasAnthropicKey: Boolean(process.env.ANTHROPIC_API_KEY)
    })
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
