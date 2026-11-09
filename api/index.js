const https = require('https');

const TMDB_API_KEY = process.env.TMDB_API_KEY || "b4b4b61babf3ef138fc52a9b26a4d8d2";

const MANIFEST = {
  id: "org.archit.hindi.cinema",
  version: "1.4.1",
  name: "Hindi & South Cinema",
  description: "Curated 100% Hindi cinema: Latest OTT releases, Hindi-dubbed South blockbusters, theatrical premieres, action thrillers, family comedies, and top web series. Family-safe and clean. Powered by TMDB & RPDB.",
  resources: ["catalog"],
  types: ["movie", "series"],
  idPrefixes: ["tt", "tmdb:"],
  catalogs: [
    {
      type: "movie",
      id: "latest_hindi_ott",
      name: "🔥 Latest Hindi OTT Releases"
    },
    {
      type: "movie",
      id: "latest_south_hindi_dubbed",
      name: "⚡ Latest Hindi Dubbed — South Blockbusters"
    },
    {
      type: "movie",
      id: "latest_hindi_cinema_v2",
      name: "🎬 New Theatrical Hindi Cinema"
    },
    {
      type: "movie",
      id: "popular_hindi_ott",
      name: "🌟 All-Time Popular Hindi OTT Hits"
    },
    {
      type: "movie",
      id: "hindi_action_thrillers",
      name: "💥 Hindi Action & Crime Thrillers"
    },
    {
      type: "movie",
      id: "hindi_family_comedy",
      name: "👨‍👩‍👦 Hindi Family & Comedy Favorites"
    },
    {
      type: "series",
      id: "top_hindi_series",
      name: "📺 Top Hindi Web Series & TV"
    }
  ]
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'StremioAddon/1.4' } }, (res) => {
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

function isFamilySafe(item) {
  const name = (item.title || item.name || '').toLowerCase();
  const desc = (item.overview || '').toLowerCase();
  const forbidden = [
    'lust', 'sex', 'erotic', 'kamasutra', 'jism', 'hate story',
    'porn', 'sensual', 'escort', 'dirty', 'ragini mms', 'murder 2', 'murder 3',
    'sapiosexual', 'inside lara roxx', '365 days', 'fifty shades'
  ];
  return !forbidden.some(w => name.includes(w) || desc.includes(w));
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

// Curated verified blockbusters with instant RPDB rating posters
const CURATED_HINDI_OTT = [
  { id: "tt27510174", name: "Stree 2", releaseInfo: "2024", description: "A terrifying headless entity terrorizes Chanderi, abducting modern women. The town unites to defeat the evil force." },
  { id: "tt26932223", name: "Bhool Bhulaiyaa 3", releaseInfo: "2024", description: "Rooh Baba ventures into a haunted mansion in West Bengal, confronting two vengeful spirits claiming to be Manjulika." },
  { id: "tt11976134", name: "Singham Again", releaseInfo: "2024", description: "Bajirao Singham journeys across borders to rescue his kidnapped wife with the iconic heroes of the Cop Universe." },
  { id: "tt27056012", name: "Khel Khel Mein", releaseInfo: "2024", description: "A group of friends at a dinner party play a risky game where all incoming phone calls and messages are made public." },
  { id: "tt21626774", name: "Sector 36", releaseInfo: "2024", description: "A corrupt cop turns relentless investigator after numerous children go missing from a local slum." },
  { id: "tt26548265", name: "Maharaja", releaseInfo: "2024", description: "A quiet barber embarks on an intense mission to recover a cherished possession taken during a home invasion." },
  { id: "tt27470893", name: "Chandu Champion", releaseInfo: "2024", description: "The extraordinary true story of Murlikant Petkar, India's first Paralympic gold medalist and war hero." },
  { id: "tt28259207", name: "Kill", releaseInfo: "2024", description: "An army commando takes on a ruthless gang of 40 armed bandits aboard a speeding train to New Delhi." },
  { id: "tt30970235", name: "Article 370", releaseInfo: "2024", description: "A covert intelligence operation is launched to dismantle terrorism and bring historic constitutional change to Kashmir." },
  { id: "tt27744786", name: "Shaitaan", releaseInfo: "2024", description: "A family vacation becomes a desperate fight for survival when an unwelcome guest casts black magic over their daughter." },
  { id: "tt13818368", name: "Fighter", releaseInfo: "2024", description: "Top Indian Air Force combat pilots form the Air Dragons unit to defend national honor against cross-border threats." },
  { id: "tt27459160", name: "Teri Baaton Mein Aisa Uljha Jiya", releaseInfo: "2024", description: "A robotics engineer falls deeply in love with an intelligent female humanoid robot with hilarious complications." },
  { id: "tt16139258", name: "Yodha", releaseInfo: "2024", description: "A rogue commando must neutralize terrorists and safely land a hijacked passenger aircraft 30,000 feet in the air." },
  { id: "tt10869778", name: "Maidaan", releaseInfo: "2024", description: "The inspirational golden era of Indian football led by visionary national coach Syed Abdul Rahim." },
  { id: "tt21383812", name: "Crew", releaseInfo: "2024", description: "Three diligent air hostesses find themselves trapped in an unexpected gold smuggling ring to save their airline." },
  { id: "tt28075881", name: "Do Patti", releaseInfo: "2024", description: "A gritty small-town police inspector unravels the web of secrets surrounding troubled twin sisters." }
];

const CURATED_SOUTH_HINDI_DUBBED = [
  { id: "tt16539454", name: "Pushpa: The Rule - Part 2", releaseInfo: "2024", description: "Pushpa Raj expands his red sandalwood syndicate while confronting the vengeful SP Bhanwar Singh Shekhawat." },
  { id: "tt12735488", name: "Kalki 2898 AD", releaseInfo: "2024", description: "In the dystopian future city of Kasi, immortal warrior Ashwatthama protects the sacred unborn child from Supreme Yaskin." },
  { id: "tt11821912", name: "Devara Part 1", releaseInfo: "2024", description: "A heroic coastal chieftain defends his sea-faring people and ancient shores from illicit smuggling and treachery." },
  { id: "tt13927994", name: "Salaar: Part 1 - Ceasefire", releaseInfo: "2023", description: "A fierce warrior returns to the fortified city-state of Khansaar to help his childhood friend claim the throne." },
  { id: "tt15433956", name: "Hanu-Man", releaseInfo: "2024", description: "An ordinary young man in the village of Anjanadri gains the celestial superpowers of Lord Hanuman." },
  { id: "tt26548265", name: "Maharaja", releaseInfo: "2024", description: "A determined father weaves through a labyrinth of corruption and deceit to extract ultimate retribution." },
  { id: "tt27613895", name: "GOAT: The Greatest of All Time", releaseInfo: "2024", description: "A former elite field agent and hostage negotiator faces a deadly nemesis linked to his own buried past." },
  { id: "tt27118357", name: "Amaran", releaseInfo: "2024", description: "The decorated true story of Major Mukund Varadarajan and the brave soldiers of the 44 Rashtriya Rifles." },
  { id: "tt27540542", name: "Lucky Baskhar", releaseInfo: "2024", description: "An overlooked middle-class bank cashier orchestrates massive financial scams in the booming 1980s stock market." },
  { id: "tt10698680", name: "K.G.F: Chapter 2", releaseInfo: "2022", description: "Rocky reigns supreme over the Kolar Gold Fields, defending his empire against ferocious adversary Adheera." },
  { id: "tt8178634", name: "RRR", releaseInfo: "2022", description: "A fearless tribal warrior and an ambitious police officer forge a brotherly bond while rebelling against the British Raj." },
  { id: "tt15327088", name: "Kantara", releaseInfo: "2022", description: "A fiery Kambala champion channels ancestral spirit deities to protect his forest village from greedy landlords." },
  { id: "tt11663228", name: "Jailer", releaseInfo: "2023", description: "A retired prison warden springs out of peaceful retirement when an antique idol smuggling cartel abducts his police officer son." },
  { id: "tt15654328", name: "Leo", releaseInfo: "2023", description: "A peaceful cafe owner in Himachal Pradesh is confronted by dangerous cartel bosses convinced he is a legendary hitman." },
  { id: "tt9179430", name: "Vikram", releaseInfo: "2022", description: "A covert black-ops commander leads a fierce assault to wipe out an international narcotics kingpin." }
];

// 1. Latest Hindi OTT Releases
async function getLatestHindiOttMovies() {
  const curatedMetas = CURATED_HINDI_OTT.map(item => ({
    id: item.id,
    type: "movie",
    name: item.name,
    poster: `https://api.ratingposterdb.com/t0-free-rpdb/imdb/poster-default/${item.id}.jpg`,
    description: item.description,
    releaseInfo: item.releaseInfo,
    genres: ["Hindi", "Latest OTT"]
  }));

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const past = new Date(now.getTime() - 270 * 24 * 60 * 60 * 1000);
  const cutoff = past.toISOString().split('T')[0];

  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&include_adult=false&primary_release_date.gte=${cutoff}&primary_release_date.lte=${today}&sort_by=popularity.desc&vote_count.gte=15`;
  const res = await fetchJson(url).catch(() => ({ results: [] }));
  const existingIds = new Set(curatedMetas.map(m => m.id));

  const dynamicItems = (res.results || []).filter(item => item.title && item.poster_path && isFamilySafe(item));
  const dynamicMetas = [];

  for (const item of dynamicItems) {
    if (dynamicMetas.length >= 10) break;
    const imdbId = await getExternalId(item.id);
    if (!imdbId || existingIds.has(imdbId)) continue;
    existingIds.add(imdbId);

    const hasImdb = imdbId.startsWith('tt');
    const poster = hasImdb 
      ? `https://api.ratingposterdb.com/t0-free-rpdb/imdb/poster-default/${imdbId}.jpg`
      : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

    dynamicMetas.push({
      id: imdbId,
      type: "movie",
      name: item.title,
      poster: poster,
      description: item.overview || "Latest Hindi OTT digital streaming release.",
      releaseInfo: item.release_date ? item.release_date.substring(0, 4) : "2024",
      genres: ["Hindi", "Latest OTT"]
    });
  }

  return [...curatedMetas, ...dynamicMetas];
}

// 2. Latest Hindi Dubbed — South Blockbusters
async function getLatestSouthHindiDubbedMovies() {
  const curatedMetas = CURATED_SOUTH_HINDI_DUBBED.map(item => ({
    id: item.id,
    type: "movie",
    name: item.name,
    poster: `https://api.ratingposterdb.com/t0-free-rpdb/imdb/poster-default/${item.id}.jpg`,
    description: item.description,
    releaseInfo: item.releaseInfo,
    genres: ["Hindi Dubbed", "South Blockbuster"]
  }));

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const past = new Date(now.getTime() - 540 * 24 * 60 * 60 * 1000);
  const cutoff = past.toISOString().split('T')[0];
  const existingIds = new Set(curatedMetas.map(m => m.id));

  const languages = ['te', 'ta', 'ml', 'kn'];
  const promises = languages.map(lang => {
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=${lang}&include_adult=false&primary_release_date.gte=${cutoff}&primary_release_date.lte=${today}&sort_by=popularity.desc&vote_count.gte=30`;
    return fetchJson(url).catch(() => ({ results: [] }));
  });

  const resultsList = await Promise.all(promises);
  const dynamicMetas = [];

  for (const res of resultsList) {
    for (const item of (res.results || [])) {
      if (!item.title || !item.poster_path || !isFamilySafe(item)) continue;
      if (dynamicMetas.length >= 10) break;
      const imdbId = await getExternalId(item.id);
      if (!imdbId || existingIds.has(imdbId)) continue;
      existingIds.add(imdbId);

      const hasImdb = imdbId.startsWith('tt');
      const poster = hasImdb 
        ? `https://api.ratingposterdb.com/t0-free-rpdb/imdb/poster-default/${imdbId}.jpg`
        : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

      dynamicMetas.push({
        id: imdbId,
        type: "movie",
        name: item.title,
        poster: poster,
        description: item.overview || "Popular South Indian blockbuster available with Hindi audio.",
        releaseInfo: item.release_date ? item.release_date.substring(0, 4) : "2024",
        genres: ["Hindi Dubbed", "South Blockbuster"]
      });
    }
  }

  return [...curatedMetas, ...dynamicMetas];
}

// 3. New Theatrical Hindi Cinema (Current Theatrical / Fresh 2025-2026)
async function getLatestHindiMovies() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const past = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
  const cutoff = past.toISOString().split('T')[0];

  const discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&include_adult=false&primary_release_date.gte=${cutoff}&primary_release_date.lte=${today}&sort_by=popularity.desc&vote_count.gte=5`;
  const res = await fetchJson(discoverUrl).catch(() => ({ results: [] }));

  const items = (res.results || []).filter(item => item.title && item.poster_path && isFamilySafe(item)).slice(0, 25);

  const metas = await Promise.all(items.map(async (item) => {
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

// 4. All-Time Popular Hindi OTT Hits (Jawan, Animal, 12th Fail, Dunki, Fighter, etc.)
async function getPopularHindiOttMovies() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&include_adult=false&primary_release_date.gte=2023-01-01&primary_release_date.lte=${today}&sort_by=popularity.desc&vote_count.gte=30`;
  const res = await fetchJson(url).catch(() => ({ results: [] }));

  const items = (res.results || []).filter(item => item.title && item.poster_path && isFamilySafe(item)).slice(0, 25);

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

// 5. Hindi Action & Crime Thrillers (Fighter, Jawan, Pathaan, Tiger 3, Drishyam 2, Shaitaan, Kill, etc.)
async function getHindiActionThrillers() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&with_genres=28|53&include_adult=false&primary_release_date.lte=${today}&sort_by=popularity.desc&vote_count.gte=20`;
  const res = await fetchJson(url).catch(() => ({ results: [] }));
  const items = (res.results || []).filter(item => item.title && item.poster_path && isFamilySafe(item)).slice(0, 25);

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
      description: item.overview || "High-Octane Hindi Action & Crime Thriller.",
      releaseInfo: yearStr,
      genres: ["Hindi", "Action", "Thriller"]
    };
  }));

  return metas;
}

// 6. Hindi Family & Comedy Favorites (Clean, timeless family entertainment: 3 Idiots, DDLJ, Dangal, PK, etc.)
async function getHindiFamilyComedyMovies() {
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&with_genres=35&include_adult=false&sort_by=vote_count.desc&vote_average.gte=6.5&vote_count.gte=40`;
  const res = await fetchJson(url).catch(() => ({ results: [] }));

  const items = (res.results || []).filter(item => item.title && item.poster_path && isFamilySafe(item)).slice(0, 25);

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

// 7. Top Hindi Web Series & TV (Panchayat, Gullak, Mirzapur, Family Man, Scam 1992, C.I.D., etc.)
async function getTopHindiSeries() {
  const url = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&with_original_language=hi&include_adult=false&sort_by=popularity.desc&vote_count.gte=10`;
  const res = await fetchJson(url).catch(() => ({ results: [] }));

  const items = (res.results || []).filter(item => item.name && item.poster_path && isFamilySafe(item)).slice(0, 25);

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
  const path = (req.query && req.query.path) || '';
  const catId = (req.query && req.query.id) || '';

  if (url === '/manifest.json' || path === 'manifest') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).json(MANIFEST);
  }

  if (catId === 'latest_hindi_ott' || url.includes('latest_hindi_ott') || path === 'latest_hindi_ott') {
    try {
      const metas = await getLatestHindiOttMovies();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json({ metas });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message, metas: [] });
    }
  }

  if (catId === 'latest_south_hindi_dubbed' || catId === 'south_hindi_dubbed' || url.includes('latest_south_hindi_dubbed') || url.includes('south_hindi_dubbed') || path === 'latest_south_hindi_dubbed' || path === 'south_hindi_dubbed') {
    try {
      const metas = await getLatestSouthHindiDubbedMovies();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json({ metas });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message, metas: [] });
    }
  }

  if (catId === 'popular_hindi_ott' || url.includes('popular_hindi_ott') || path === 'popular_hindi_ott') {
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

  if (catId === 'hindi_action_thrillers' || url.includes('hindi_action_thrillers') || path === 'hindi_action_thrillers') {
    try {
      const metas = await getHindiActionThrillers();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).json({ metas });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message, metas: [] });
    }
  }

  if (catId === 'hindi_family_comedy' || url.includes('hindi_family_comedy') || path === 'hindi_family_comedy') {
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

  if (catId === 'top_hindi_series' || url.includes('top_hindi_series') || path === 'top_hindi_series') {
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

  if (catId === 'latest_hindi_cinema_v2' || url.includes('latest_hindi_cinema_v2') || url.includes('catalog') || path === 'catalog') {
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
        <p>Curated 100% Hindi cinema: Latest OTT releases, Hindi-dubbed South blockbusters, theatrical premieres, action thrillers, family comedies, and top web series.</p>
        <p><a href="stremio://${req.headers.host}/manifest.json" style="background: #655099; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Install in Stremio</a></p>
        <p style="color: #666; font-size: 14px;">Manifest URL: <code>https://${req.headers.host}/manifest.json</code></p>
      </body>
    </html>
  `);
};
