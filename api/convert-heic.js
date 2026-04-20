import heicConvert from 'heic-convert';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { base64 } = req.body;
    if (!base64) return res.status(400).json({ error: 'base64 required' });

    const inputBuffer = Buffer.from(base64, 'base64');

    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 0.85,
    });

    const jpegBase64 = Buffer.from(outputBuffer).toString('base64');

    return res.status(200).json({
      ok: true,
      base64: jpegBase64,
      mediaType: 'image/jpeg',
    });
  } catch (err) {
    console.error('HEIC conversion error:', err);
    return res.status(500).json({ error: err.message });
  }
}
