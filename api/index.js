const https = require('https');

const TMDB_API_KEY = process.env.TMDB_API_KEY || "b4b4b61babf3ef138fc52a9b26a4d8d2";

const MANIFEST = {
  id: "org.archit.hindi.cinema",
  version: "1.2.0",
  name: "Hindi & South Cinema",
  description: "Curated 100% Hindi theatrical releases, South Indian blockbusters in Hindi, family comedy hits, and top Hindi web series. Family-safe and clean. Powered by TMDB & RPDB.",
  resources: ["catalog"],
  types: ["movie", "series"],
  idPrefixes: ["tt", "tmdb:"],
  catalogs: [
    {
      type: "movie",
      id: "latest_hindi_cinema_v2",
      name: "Latest Releases — Hindi Cinema"
    },
    {
      type: "movie",
      id: "south_hindi_dubbed",
      name: "Hindi Dubbed — South Blockbusters"
    },
    {
      type: "movie",
      id: "popular_hindi_ott",
      name: "Popular Hindi Movies on OTT"
    },
    {
      type: "movie",
      id: "hindi_family_comedy",
      name: "Hindi Family & Comedy Favorites"
    },
    {
      type: "series",
      id: "top_hindi_series",
      name: "Top Hindi Web Series"
    }
  ]
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'StremioAddon/1.2' } }, (res) => {
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

async function getTvExternalId(tmdbId) {
  try {
    const data = await fetchJson(`https://api.themoviedb.org/3/tv/${tmdbId}/external_ids?api_key=${TMDB_API_KEY}`);
    return data.imdb_id || `tmdb:${tmdbId}`;
  } catch (e) {
    return `tmdb:${tmdbId}`;
  }
}

// 1. Latest Releases — Hindi Cinema (Current Theatrical / Fresh 2025-2026)
async function getLatestHindiMovies() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const past = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const cutoff = past.toISOString().split('T')[0];

  const discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&include_adult=false&primary_release_date.gte=${cutoff}&primary_release_date.lte=${today}&sort_by=popularity.desc&vote_count.gte=1`;
  const year2026Url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&include_adult=false&primary_release_year=2026&sort_by=popularity.desc`;

  const [res1, res2] = await Promise.all([
    fetchJson(discoverUrl).catch(() => ({ results: [] })),
    fetchJson(year2026Url).catch(() => ({ results: [] }))
  ]);

  const itemsMap = new Map();
  const allResults = [...(res1.results || []), ...(res2.results || [])];

  for (const item of allResults) {
    if (!item.title || !item.poster_path) continue;
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
    const releaseDateIso = item.release_date 
      ? new Date(item.release_date).toISOString() 
      : new Date().toISOString();

    const poster = hasImdb 
      ? `https://api.ratingposterdb.com/t0-free-rpdb/imdb/poster-default/${imdbId}.jpg`
      : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

    return {
      id: imdbId,
      type: "movie",
      name: item.title,
      poster: poster,
      background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined,
      description: item.overview || "Latest Hindi cinema theatrical release.",
      releaseInfo: yearStr,
      released: releaseDateIso,
      inCinema: true,
      in_cinema: true,
      genres: ["Hindi", "Cinema"]
    };
  }));

  return metas;
}

// 2. Hindi Dubbed — South Blockbusters (Telugu, Tamil, Malayalam, Kannada blockbusters)
async function getSouthHindiDubbedMovies() {
  const languages = ['te', 'ta', 'ml', 'kn'];
  const promises = languages.map(lang => {
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=${lang}&include_adult=false&primary_release_date.gte=2023-01-01&sort_by=popularity.desc&vote_count.gte=10`;
    return fetchJson(url).catch(() => ({ results: [] }));
  });

  const resultsList = await Promise.all(promises);
  const itemsMap = new Map();

  for (const res of resultsList) {
    for (const item of (res.results || [])) {
      if (!item.title || !item.poster_path) continue;
      if (!itemsMap.has(item.id)) {
        itemsMap.set(item.id, item);
      }
    }
  }

  const sorted = Array.from(itemsMap.values()).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  const top25 = sorted.slice(0, 25);

  const metas = await Promise.all(top25.map(async (item) => {
    const imdbId = await getExternalId(item.id);
    const hasImdb = imdbId && imdbId.startsWith('tt');
    const yearStr = item.release_date ? item.release_date.substring(0, 4) : "2024";

    const poster = hasImdb 
      ? `https://api.ratingposterdb.com/t0-free-rpdb/imdb/poster-default/${imdbId}.jpg`
      : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

    return {
      id: imdbId,
      type: "movie",
      name: item.title,
      poster: poster,
      background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined,
      description: item.overview || "Popular South Indian blockbuster available with Hindi audio.",
      releaseInfo: yearStr,
      genres: ["Hindi Dubbed", "South Indian"]
    };
  }));

  return metas;
}

// 3. Popular Hindi Movies on OTT (Streaming Hits: Jawan, Animal, Stree 2, 12th Fail, etc.)
async function getPopularHindiOttMovies() {
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&include_adult=false&primary_release_date.gte=2023-01-01&sort_by=popularity.desc&vote_count.gte=20`;
  const res = await fetchJson(url).catch(() => ({ results: [] }));

  const items = (res.results || []).filter(item => item.title && item.poster_path).slice(0, 25);

  const metas = await Promise.all(items.map(async (item) => {
    const imdbId = await getExternalId(item.id);
    const hasImdb = imdbId && imdbId.startsWith('tt');
    const yearStr = item.release_date ? item.release_date.substring(0, 4) : "2024";

    const poster = hasImdb 
      ? `https://api.ratingposterdb.com/t0-free-rpdb/imdb/poster-default/${imdbId}.jpg`
      : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

    return {
      id: imdbId,
      type: "movie",
      name: item.title,
      poster: poster,
      background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined,
      description: item.overview || "Top streaming Hindi movie on OTT.",
      releaseInfo: yearStr,
      genres: ["Hindi", "OTT"]
    };
  }));

  return metas;
}

// 4. Hindi Family & Comedy Favorites (Clean, timeless family entertainment)
async function getHindiFamilyComedyMovies() {
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&with_genres=35&include_adult=false&sort_by=vote_count.desc&vote_average.gte=6.5&vote_count.gte=40`;
  const res = await fetchJson(url).catch(() => ({ results: [] }));

  const items = (res.results || []).filter(item => item.title && item.poster_path).slice(0, 25);

  const metas = await Promise.all(items.map(async (item) => {
    const imdbId = await getExternalId(item.id);
    const hasImdb = imdbId && imdbId.startsWith('tt');
    const yearStr = item.release_date ? item.release_date.substring(0, 4) : "";

    const poster = hasImdb 
      ? `https://api.ratingposterdb.com/t0-free-rpdb/imdb/poster-default/${imdbId}.jpg`
      : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

    return {
      id: imdbId,
      type: "movie",
      name: item.title,
      poster: poster,
      background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined,
      description: item.overview || "Classic Hindi Comedy & Family Favorite.",
      releaseInfo: yearStr,
      genres: ["Hindi", "Comedy", "Family"]
    };
  }));

  return metas;
}

// 5. Top Hindi Web Series (Panchayat, Gullak, Mirzapur, Family Man, Scam 1992, etc.)
async function getTopHindiSeries() {
  const url = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=hi&include_adult=false&sort_by=popularity.desc&vote_count.gte=5`;
  const res = await fetchJson(url).catch(() => ({ results: [] }));

  const items = (res.results || []).filter(item => item.name && item.poster_path).slice(0, 25);

  const metas = await Promise.all(items.map(async (item) => {
    const imdbId = await getTvExternalId(item.id);
    const hasImdb = imdbId && imdbId.startsWith('tt');
    const yearStr = item.first_air_date ? item.first_air_date.substring(0, 4) : "2024";

    const poster = hasImdb 
      ? `https://api.ratingposterdb.com/t0-free-rpdb/imdb/poster-default/${imdbId}.jpg`
      : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

    return {
      id: imdbId,
      type: "series",
      name: item.name,
      poster: poster,
      background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined,
      description: item.overview || "Popular Hindi Web Series.",
      releaseInfo: yearStr,
      genres: ["Hindi", "Web Series"]
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

  if (url.includes('south_hindi_dubbed') || path === 'south_hindi_dubbed') {
    try {
      const metas = await getSouthHindiDubbedMovies();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json({ metas });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message, metas: [] });
    }
  }

  if (url.includes('popular_hindi_ott') || path === 'popular_hindi_ott') {
    try {
      const metas = await getPopularHindiOttMovies();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json({ metas });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message, metas: [] });
    }
  }

  if (url.includes('hindi_family_comedy') || path === 'hindi_family_comedy') {
    try {
      const metas = await getHindiFamilyComedyMovies();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json({ metas });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message, metas: [] });
    }
  }

  if (url.includes('top_hindi_series') || path === 'top_hindi_series') {
    try {
      const metas = await getTopHindiSeries();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json({ metas });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message, metas: [] });
    }
  }

  if (url.includes('catalog') || path === 'catalog' || url.includes('latest_hindi_cinema_v2')) {
    try {
      const metas = await getLatestHindiMovies();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=3600');
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
      <head><title>Hindi & South Cinema Addon</title></head>
      <body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; line-height: 1.6; text-align: center;">
        <h1>🎬 Hindi & South Cinema Addon</h1>
        <p>Curated 100% Hindi theatrical releases, South Indian blockbusters in Hindi, family comedy hits, and top Hindi web series.</p>
        <p><a href="stremio://${req.headers.host}/manifest.json" style="background: #655099; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Install in Stremio</a></p>
        <p style="color: #666; font-size: 14px;">Manifest URL: <code>https://${req.headers.host}/manifest.json</code></p>
      </body>
    </html>
  `);
};
