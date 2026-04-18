// Vercel serverless function: video upload via Vercel Blob.
//
// GET /api/upload-video?filename=clip.mp4
//   → Returns { uploadUrl, blobUrl } for direct browser PUT
//
// The browser PUTs the file body directly to uploadUrl.
// The blobUrl is the permanent public URL to store with the session.

import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // We handle the body ourselves for PUT forwarding
  },
};

export default async function handler(req, res) {
  // GET: Generate a blob URL by doing a server-side put with empty content,
  // then return the URL. Actually — simpler: just accept the file via PUT/POST
  // and proxy to Vercel Blob.

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const filename = req.query.filename || ('video-' + Date.now() + '.mp4');
      const contentType = req.headers['content-type'] || 'video/mp4';
      
      const blob = await put('videos/' + filename, req, {
        access: 'public',
        contentType: contentType,
      });

      return res.status(200).json({ url: blob.url, pathname: blob.pathname });
    } catch (err) {
      console.error('upload-video error:', err);
      return res.status(500).json({ error: 'Upload failed', detail: String(err) });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
