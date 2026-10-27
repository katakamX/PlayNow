import { Router } from 'express';
const router = Router();
router.get('/', async (_req, res) => {
  if (!process.env.GNEWS_API_KEY) return res.json({ articles: [], message: 'Add GNEWS_API_KEY to backend/.env to enable live sports news.' });
  try {
    const url = new URL('https://gnews.io/api/v4/search');
    url.searchParams.set('q', 'sports');
    url.searchParams.set('lang', 'en');
    url.searchParams.set('max', '10');
    url.searchParams.set('apikey', process.env.GNEWS_API_KEY);
    const response = await fetch(url);
    if (!response.ok) throw new Error('News provider request failed');
    const data = await response.json();
    res.json({ articles: (data.articles || []).map(a => ({ title: a.title, description: a.description, url: a.url, image: a.image, source: a.source?.name, publishedAt: a.publishedAt })) });
  } catch { res.status(502).json({ message: 'Sports news is temporarily unavailable.' }); }
});
export default router;
