const https = require('https');

const TMDB_API_KEY = process.env.TMDB_API_KEY || "b4b4b61babf3ef138fc52a9b26a4d8d2";

const MANIFEST = {
  id: "org.archit.hindi.cinema",
  version: "1.0.1",
  name: "Latest Hindi Cinema",
  description: "Live theatrical & cinema Hindi releases cleanly filtered without old classics. Powered by TMDB & RPDB.",
  resources: ["catalog"],
  types: ["movie"],
  idPrefixes: ["tt", "tmdb:"],
  catalogs: [
    {
      type: "movie",
      id: "latest_hindi_cinema",
      name: "Latest Releases — Hindi Cinema"
    }
  ]
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'StremioAddon/1.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function getExternalId(tmdbId) {
  try {
    const data = await fetchJson(`https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`);
    return data.imdb_id || `tmdb:${tmdbId}`;
  } catch (e) {
    return `tmdb:${tmdbId}`;
  }
}

async function getLatestHindiMovies() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const past = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const cutoff = past.toISOString().split('T')[0];

  const discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&primary_release_date.gte=${cutoff}&primary_release_date.lte=${today}&sort_by=popularity.desc&vote_count.gte=1`;
  const year2026Url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&primary_release_year=2026&sort_by=popularity.desc`;

  const [res1, res2] = await Promise.all([
    fetchJson(discoverUrl).catch(() => ({ results: [] })),
    fetchJson(year2026Url).catch(() => ({ results: [] }))
  ]);

  const itemsMap = new Map();
  const allResults = [...(res1.results || []), ...(res2.results || [])];

  for (const item of allResults) {
    if (!item.title || !item.poster_path) continue;
    
    // Strict date filter: NO movies older than 2025!
    const year = item.release_date ? parseInt(item.release_date.substring(0, 4), 10) : 2026;
    if (year < 2025) continue;

    if (!itemsMap.has(item.id)) {
      itemsMap.set(item.id, item);
    }
  }

  const sorted = Array.from(itemsMap.values()).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  const top25 = sorted.slice(0, 25);

  const metas = await Promise.all(top25.map(async (item) => {
    const imdbId = await getExternalId(item.id);
    const hasImdb = imdbId && imdbId.startsWith('tt');
    const yearStr = item.release_date ? item.release_date.substring(0, 4) : "2026";
    
    // ISO 8601 release timestamp enables Stremio's native IN CINEMA badge
    const releaseDateIso = item.release_date 
      ? new Date(item.release_date).toISOString() 
      : new Date().toISOString();

    // Rating from TMDb / IMDb
    const rating = (item.vote_average && item.vote_average > 0) 
      ? item.vote_average.toFixed(1) 
      : undefined;

    // Use RPDB poster for embedded rating overlay if IMDb ID exists, else fallback to TMDb original
    const poster = hasImdb 
      ? `https://api.ratingposterdb.com/t0-free-rpdb/imdb/poster-default/${imdbId}.jpg`
      : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

    const links = [
      {
        name: "Cinema",
        category: "Genres",
        url: "stremio:///discover/https%3A%2F%2Fstremio-hindi-cinema-archit-gupta-8227s-projects.vercel.app%2Fmanifest.json/movie/latest_hindi_cinema"
      }
    ];

    if (rating && hasImdb) {
      links.push({
        name: rating,
        category: "imdb",
        url: `https://imdb.com/title/${imdbId}`
      });
    }

    return {
      id: imdbId,
      type: "movie",
      name: item.title,
      poster: poster,
      background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined,
      description: item.overview || "Latest Hindi cinema theatrical release.",
      releaseInfo: yearStr,
      released: releaseDateIso,
      imdbRating: rating,
      inCinema: true,
      in_cinema: true,
      genres: ["Hindi", "Cinema"],
      links: links
    };
  }));

  return metas;
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const url = req.url || '';
  const path = req.query.path || '';

  if (url === '/manifest.json' || path === 'manifest') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).json(MANIFEST);
  }

  if (url.includes('catalog') || path === 'catalog') {
    try {
      const metas = await getLatestHindiMovies();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
      return res.status(200).json({ metas });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message, metas: [] });
    }
  }

  // Root landing page
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head><title>Latest Hindi Cinema Addon</title></head>
      <body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; line-height: 1.6; text-align: center;">
        <h1>🎬 Latest Hindi Cinema Addon</h1>
        <p>Custom Stremio addon for brand new Hindi theatrical releases without old classics.</p>
        <p><a href="stremio://${req.headers.host}/manifest.json" style="background: #655099; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Install in Stremio</a></p>
        <p style="color: #666; font-size: 14px;">Manifest URL: <code>https://${req.headers.host}/manifest.json</code></p>
      </body>
    </html>
  `);
};
