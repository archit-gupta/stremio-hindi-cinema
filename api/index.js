const https = require('https');

const TMDB_API_KEY = process.env.TMDB_API_KEY || "b4b4b61babf3ef138fc52a9b26a4d8d2";

const MANIFEST = {
  id: "org.archit.hindi.cinema",
  version: "1.5.0",
  name: "Hindi & South Cinema",
  description: "Curated 100% Hindi cinema: Latest OTT drops, Hindi-dubbed South blockbusters, IMDb top masterpieces, cult comedy, suspense thrillers, patriotic biopics, and 90s-2000s nostalgia. Clean & family-safe.",
  resources: ["catalog"],
  types: ["movie"],
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
      id: "imdb_top_hindi",
      name: "🏆 IMDb Top-Rated Hindi Masterpieces"
    },
    {
      type: "movie",
      id: "cult_hindi_comedy",
      name: "🎭 Cult Hindi Comedy Classics"
    },
    {
      type: "movie",
      id: "hindi_mystery_thrillers",
      name: "🔍 Hindi Suspense & Mystery Thrillers"
    },
    {
      type: "movie",
      id: "hindi_patriotic_biopics",
      name: "🇮🇳 Inspiring Biopics & Patriotic Stories"
    },
    {
      type: "movie",
      id: "hindi_90s_2000s_nostalgia",
      name: "📼 90s & 2000s Golden Nostalgia Hits"
    },
    {
      type: "movie",
      id: "hindi_action_thrillers",
      name: "💥 Hindi Action & Crime Thrillers"
    },
    {
      type: "movie",
      id: "hindi_family_comedy",
      name: "👨‍👩‍👦 Hindi Family & Evergreen Favorites"
    }
  ]
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'StremioAddon/1.5' } }, (res) => {
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

function makeMetas(items, genreTag) {
  return items.map(item => ({
    id: item.id,
    type: "movie",
    name: item.name,
    poster: `https://images.metahub.space/poster/medium/${item.id}/img`,
    background: `https://images.metahub.space/background/medium/${item.id}/img`,
    description: item.description || `Classic Hindi movie: ${item.name}`,
    releaseInfo: item.releaseInfo || item.year || "",
    posterShape: "poster",
    genres: ["Hindi", genreTag]
  }));
}

// 1. Latest Hindi OTT Drops
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

// 2. Latest South Hindi Dubbed Blockbusters
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

// 5. IMDb Top-Rated Hindi Masterpieces (8.0+ Rating)
const CURATED_IMDB_TOP_HINDI = [
  { id: "tt23849204", name: "12th Fail", releaseInfo: "2023", description: "The real-life story of IPS Officer Manoj Kumar Sharma, who restarted his academic journey to achieve his dream against all odds." },
  { id: "tt1187043", name: "3 Idiots", releaseInfo: "2009", description: "Two friends search for their long-lost college companion while recounting memories of their brilliant friend who inspired them to think differently." },
  { id: "tt5074352", name: "Dangal", releaseInfo: "2016", description: "Former wrestler Mahavir Singh Phogat trains his daughters Geeta and Babita to become world-class wrestlers for India." },
  { id: "tt0986264", name: "Taare Zameen Par", releaseInfo: "2007", description: "An eight-year-old boy struggling with dyslexia finds understanding, warmth, and artistic guidance from an empathetic art teacher." },
  { id: "tt0367110", name: "Swades", releaseInfo: "2004", description: "A bright NASA scientist returns to an Indian village to find his childhood nanny, only to discover his calling to help his homeland." },
  { id: "tt0405508", name: "Rang De Basanti", releaseInfo: "2006", description: "Six young Indians assist an English filmmaker in a documentary on Indian freedom fighters, reawakening their own revolutionary spirit." },
  { id: "tt0073707", name: "Sholay", releaseInfo: "1975", description: "A retired police chief enlists two daring outlaws to capture Gabbar Singh, the ruthless dacoit who slaughtered his family." },
  { id: "tt0871510", name: "Chak De! India", releaseInfo: "2007", description: "Kabir Khan, a disgraced hockey player, coaches the Indian Women's National Hockey Team to glory at the World Cup." },
  { id: "tt0374887", name: "Munna Bhai M.B.B.S.", releaseInfo: "2003", description: "A lovable Mumbai gangster enrolls in medical school to fulfill his father's dream of seeing him as a licensed doctor." },
  { id: "tt0066763", name: "Anand", releaseInfo: "1971", description: "A terminally ill cancer patient radiates joy, optimism, and love to everyone he meets, leaving a profound impact on his pessimistic doctor." },
  { id: "tt1280558", name: "A Wednesday!", releaseInfo: "2008", description: "A retiring police commissioner recounts the most startling case of his career: a common man who held Mumbai hostage over the phone." },
  { id: "tt2356180", name: "Bhaag Milkha Bhaag", releaseInfo: "2013", description: "The extraordinary true journey of 'The Flying Sikh' Milkha Singh, who overcame partition trauma to become a world champion athlete." },
  { id: "tt1562872", name: "Zindagi Na Milegi Dobara", releaseInfo: "2011", description: "Three school friends take a life-changing bachelor road trip across Spain, facing their deepest fears, regrets, and romance." },
  { id: "tt2082197", name: "Barfi!", releaseInfo: "2012", description: "A charming, deaf-mute young man forms a pure bond of love with an autistic heiress in 1970s Darjeeling." },
  { id: "tt4430212", name: "Drishyam", releaseInfo: "2015", description: "A clever cable operator uses his encyclopedic cinema knowledge to construct an airtight alibi and save his family from the police." },
  { id: "tt1954470", name: "Gangs of Wasseypur", releaseInfo: "2012", description: "A bloody, multi-generational coal mafia feud spans decades of ruthless ambition, betrayal, and revenge in rural India." },
  { id: "tt0169102", name: "Lagaan", releaseInfo: "2001", description: "Victorian India: Villagers wager their oppressive tax burden on an all-or-nothing game of cricket against their arrogant British rulers." },
  { id: "tt1639426", name: "Udaan", releaseInfo: "2010", description: "Expelled from boarding school, an aspiring 17-year-old poet returns home to live with an abusive father and forge his own destiny." },
  { id: "tt0200087", name: "Sarfarosh", releaseInfo: "1999", description: "A dedicated medical student joins the Indian Police Service to track down cross-border arms smugglers after terrorists strike his family." }
];

// 6. Cult Hindi Comedy Classics
const CURATED_CULT_HINDI_COMEDY = [
  { id: "tt0242519", name: "Hera Pheri", releaseInfo: "2000", description: "Two bumbling tenants and their eccentric landlord receive a wrong number ransom call, sparking a riotous kidnapping misadventure." },
  { id: "tt0419058", name: "Phir Hera Pheri", releaseInfo: "2006", description: "Raju, Shyam, and Baburao fall prey to a fraudulent double-your-money chit fund scheme, plunging back into chaotic debt and gangsters." },
  { id: "tt0464160", name: "Chup Chup Ke", releaseInfo: "2006", description: "A debt-ridden young man attempts suicide but survives, pretending to be mute and deaf at a wealthy Gujarati mansion." },
  { id: "tt0488798", name: "Welcome", releaseInfo: "2007", description: "A straightforward bachelor falls in love with a charming girl, unaware that her brothers are two notorious underworld gangsters." },
  { id: "tt0845448", name: "Dhamaal", releaseInfo: "2007", description: "Four lazy freeloaders embark on a mad dash to Goa to uncover hidden loot buried under a giant 'W' in St. Sebastian Garden." },
  { id: "tt0495034", name: "Golmaal: Fun Unlimited", releaseInfo: "2006", description: "Four mischievous college runaways take shelter in a bungalow owned by a blind elderly couple, masquerading as their grandson." },
  { id: "tt0805184", name: "Bhagam Bhag", releaseInfo: "2006", description: "A theatre troupe travelling to London for shows gets falsely implicated in a high-profile murder and drug mafia mix-up." },
  { id: "tt0995035", name: "Dhol", releaseInfo: "2007", description: "Four indolent friends try to woo their wealthy new female neighbor, inadvertently getting tangled in a sinister criminal conspiracy." },
  { id: "tt0453671", name: "Garam Masala", releaseInfo: "2005", description: "A flirtatious photographer juggles three gorgeous international air hostesses at his flat simultaneously with hilarious chaos." },
  { id: "tt0437238", name: "Hulchul", releaseInfo: "2004", description: "Two college students fake a love affair to settle an ancestral family score, only to fall genuinely in love amidst furious rivalries." },
  { id: "tt1255951", name: "De Dana Dan", releaseInfo: "2009", description: "Two broke friends plan to kidnap a wealthy woman's pampered dog for ransom, leading to utter bedlam inside a luxury Singapore hotel." },
  { id: "tt1455811", name: "Khatta Meetha", releaseInfo: "2010", description: "A struggling road contractor faces massive bureaucratic bribery, dysfunctional family members, and corrupt municipal politics." },
  { id: "tt0371735", name: "Hungama", releaseInfo: "2003", description: "A case of mistaken identities and hilarious misunderstandings envelops a country girl, a villager, and an insecure millionaire." }
];

// 7. Hindi Suspense & Mystery Thrillers
const CURATED_HINDI_MYSTERY_THRILLERS = [
  { id: "tt4430212", name: "Drishyam", releaseInfo: "2015", description: "A cunning father orchestrates a legendary 2nd & 3rd October alibi to protect his wife and daughters from police prosecution." },
  { id: "tt15501640", name: "Drishyam 2", releaseInfo: "2022", description: "Seven years after the original case, a determined IG re-opens the investigation into Vijay Salgaonkar with startling new evidence." },
  { id: "tt8108198", name: "Andhadhun", releaseInfo: "2018", description: "A pianist feigning blindness accidentally witnesses the murder of an aging film star, spiraling into a deadly black comedy thriller." },
  { id: "tt1821480", name: "Kahaani", releaseInfo: "2012", description: "A heavily pregnant woman arrives in Kolkata during Durga Puja in search of her missing husband, encountering deception at every turn." },
  { id: "tt1787988", name: "Talaash: The Answer Lies Within", releaseInfo: "2012", description: "A grieving police inspector investigates the enigmatic car accident death of an actor, guided by an elusive streetwalker." },
  { id: "tt8130968", name: "Badla", releaseInfo: "2019", description: "A wealthy businesswoman accused of murdering her secret lover confers with a legendary defense attorney to unravel what really happened." },
  { id: "tt2377938", name: "Special 26", releaseInfo: "2013", description: "A crew of polished con artists executes daylight raids posing as CBI officers, targeting corrupt politicians and businesses." },
  { id: "tt1280558", name: "A Wednesday!", releaseInfo: "2008", description: "An anonymous caller places lethal bombs across Mumbai, demanding the release of four dangerous terrorists with an unexpected twist." },
  { id: "tt4934950", name: "Talvar", releaseInfo: "2015", description: "An uncompromising CBI investigator probes the gruesome double murder of a 14-year-old girl and the family's domestic servant." }
];

// 8. Inspiring Biopics & Patriotic Stories
const CURATED_PATRIOTIC_BIOPICS = [
  { id: "tt23849204", name: "12th Fail", releaseInfo: "2023", description: "Manoj Kumar Sharma's inspirational true life struggle from Chambal dacoit territory to becoming a prestigious IPS officer." },
  { id: "tt8291224", name: "Uri: The Surgical Strike", releaseInfo: "2019", description: "Major Vihaan Shergill leads an elite Indian Army covert surgical strike against terrorist launchpads across the Line of Control." },
  { id: "tt10295212", name: "Shershaah", releaseInfo: "2021", description: "The valiant true story of PVC Captain Vikram Batra, who sacrificed his life recapturing Point 4875 during the 1999 Kargil War." },
  { id: "tt10280296", name: "Sardar Udham", releaseInfo: "2021", description: "Revolutionary freedom fighter Udham Singh spends two decades assassinating Michael O'Dwyer in London to avenge the Jallianwala Bagh massacre." },
  { id: "tt2356180", name: "Bhaag Milkha Bhaag", releaseInfo: "2013", description: "From losing his family during partition to breaking world records: Milkha Singh's immortal athletics journey." },
  { id: "tt5074352", name: "Dangal", releaseInfo: "2016", description: "A father defies village patriarchy to train his daughters into Commonwealth gold medal wrestling champions." },
  { id: "tt27470893", name: "Chandu Champion", releaseInfo: "2024", description: "The courageous journey of Murlikant Petkar, sustaining 9 bullet wounds in war before winning India's first Paralympic gold." },
  { id: "tt10786774", name: "Sam Bahadur", releaseInfo: "2023", description: "The legendary military career of Field Marshal Sam Manekshaw, who guided India to victory in the 1971 Indo-Pakistani War." },
  { id: "tt30970235", name: "Article 370", releaseInfo: "2024", description: "An intense, high-stakes political and intelligence thriller detailing the historic abrogation of Article 370 in Kashmir." },
  { id: "tt0871510", name: "Chak De! India", releaseInfo: "2007", description: "A disgraced former national hockey captain restores his pride by coaching sixteen feuding girls into world champions." },
  { id: "tt0118751", name: "Border", releaseInfo: "1997", description: "A band of 120 brave Indian soldiers at the Longewala border post hold off an entire Pakistani tank regiment all night long." },
  { id: "tt9851854", name: "Major", releaseInfo: "2022", description: "The heroic life and supreme sacrifice of Major Sandeep Unnikrishnan during the 26/11 Taj Hotel rescue operations." },
  { id: "tt5286444", name: "Neerja", releaseInfo: "2016", description: "Senior flight attendant Neerja Bhanot courageously shields 359 passengers during the Pan Am Flight 73 hijacking." }
];

// 9. 90s & 2000s Golden Era Nostalgia Hits
const CURATED_90S_2000S_NOSTALGIA = [
  { id: "tt0112870", name: "Dilwale Dulhania Le Jayenge", releaseInfo: "1995", description: "Raj and Simran fall in love on a European holiday, but Raj must win the heart of her strict father in Punjab to marry her." },
  { id: "tt0248126", name: "Kabhi Khushi Kabhie Gham...", releaseInfo: "2001", description: "A wealthy business tycoon disowns his adopted elder son for marrying a girl of lower status; years later, his younger brother sets out to reunite them." },
  { id: "tt0172684", name: "Kuch Kuch Hota Hai", releaseInfo: "1998", description: "An eight-year-old girl fulfills her late mother's diary wish by reuniting her father with his tomboy college best friend." },
  { id: "tt0292490", name: "Dil Chahta Hai", releaseInfo: "2001", description: "Three inseparable college friends navigate romance, adult responsibilities, and emotional rifts across Mumbai, Goa, and Sydney." },
  { id: "tt0347304", name: "Kal Ho Naa Ho", releaseInfo: "2003", description: "An optimistic man helps an introverted Indian-American girl find joy and love in New York, while concealing a heartbreaking secret." },
  { id: "tt0420332", name: "Veer-Zaara", releaseInfo: "2004", description: "An Indian Air Force rescue pilot spends 22 years silently imprisoned in Pakistan to preserve the honor of his Pakistani beloved." },
  { id: "tt0347473", name: "Main Hoon Na", releaseInfo: "2004", description: "An army major goes undercover as a mature college student to protect a general's daughter from a renegade terrorist group." },
  { id: "tt1024943", name: "Om Shanti Om", releaseInfo: "2007", description: "A 1970s junior film artist murdered while trying to save a top heroine is reincarnated as a modern superstar to avenge their deaths." },
  { id: "tt0118751", name: "Border", releaseInfo: "1997", description: "The immortal epic of the 1971 Battle of Longewala, featuring patriotic heroism and eternal camaraderie." },
  { id: "tt1093370", name: "Jab We Met", releaseInfo: "2007", description: "A depressed Mumbai industrialist's life is transformed after meeting a vibrant, talkative Punjabi girl on an overnight train." },
  { id: "tt0110076", name: "Hum Aapke Hain Koun..!", releaseInfo: "1994", description: "Prem and Nisha fall in love during an opulent family wedding, but an unexpected family tragedy forces them to sacrifice their happiness." }
];

// Catalog retrieval functions
async function getLatestHindiOttMovies() {
  const curatedMetas = makeMetas(CURATED_HINDI_OTT, "Latest OTT");
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
      ? `https://images.metahub.space/poster/medium/${imdbId}/img`
      : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

    dynamicMetas.push({
      id: imdbId,
      type: "movie",
      name: item.title,
      poster: poster,
      background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined,
      description: item.overview || "Latest Hindi OTT digital streaming release.",
      releaseInfo: item.release_date ? item.release_date.substring(0, 4) : "2024",
      posterShape: "poster",
      genres: ["Hindi", "Latest OTT"]
    });
  }

  return [...curatedMetas, ...dynamicMetas];
}

async function getLatestSouthHindiDubbedMovies() {
  const curatedMetas = makeMetas(CURATED_SOUTH_HINDI_DUBBED, "South Blockbuster");
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
        ? `https://images.metahub.space/poster/medium/${imdbId}/img`
        : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

      dynamicMetas.push({
        id: imdbId,
        type: "movie",
        name: item.title,
        poster: poster,
        background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined,
        description: item.overview || "Popular South Indian blockbuster available with Hindi audio.",
        releaseInfo: item.release_date ? item.release_date.substring(0, 4) : "2024",
        posterShape: "poster",
        genres: ["Hindi Dubbed", "South Blockbuster"]
      });
    }
  }

  return [...curatedMetas, ...dynamicMetas];
}

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
      ? `https://images.metahub.space/poster/medium/${imdbId}/img`
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
      posterShape: "poster",
      genres: ["Hindi", "Cinema"]
    };
  }));

  return metas;
}

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
      ? `https://images.metahub.space/poster/medium/${imdbId}/img`
      : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

    return {
      id: imdbId,
      type: "movie",
      name: item.title,
      poster: poster,
      background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined,
      description: item.overview || "Top streaming Hindi movie on OTT.",
      releaseInfo: yearStr,
      posterShape: "poster",
      genres: ["Hindi", "OTT"]
    };
  }));

  return metas;
}

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
      ? `https://images.metahub.space/poster/medium/${imdbId}/img`
      : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

    return {
      id: imdbId,
      type: "movie",
      name: item.title,
      poster: poster,
      background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined,
      description: item.overview || "High-Octane Hindi Action & Crime Thriller.",
      releaseInfo: yearStr,
      posterShape: "poster",
      genres: ["Hindi", "Action", "Thriller"]
    };
  }));

  return metas;
}

async function getHindiFamilyComedyMovies() {
  const url = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&with_genres=35&include_adult=false&sort_by=vote_count.desc&vote_average.gte=6.5&vote_count.gte=40`;
  const res = await fetchJson(url).catch(() => ({ results: [] }));

  const items = (res.results || []).filter(item => item.title && item.poster_path && isFamilySafe(item)).slice(0, 25);

  const metas = await Promise.all(items.map(async (item) => {
    const imdbId = await getExternalId(item.id);
    const hasImdb = imdbId && imdbId.startsWith('tt');
    const yearStr = item.release_date ? item.release_date.substring(0, 4) : "";

    const poster = hasImdb 
      ? `https://images.metahub.space/poster/medium/${imdbId}/img`
      : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

    return {
      id: imdbId,
      type: "movie",
      name: item.title,
      poster: poster,
      background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : undefined,
      description: item.overview || "Classic Hindi Comedy & Family Favorite.",
      releaseInfo: yearStr,
      posterShape: "poster",
      genres: ["Hindi", "Comedy", "Family"]
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
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json(MANIFEST);
  }

  // 1. Latest Hindi OTT Drops
  if (catId === 'latest_hindi_ott' || url.includes('latest_hindi_ott') || path === 'latest_hindi_ott') {
    try {
      const metas = await getLatestHindiOttMovies();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).json({ metas });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message, metas: [] });
    }
  }

  // 2. Latest South Hindi Dubbed Blockbusters
  if (catId === 'latest_south_hindi_dubbed' || catId === 'south_hindi_dubbed' || url.includes('latest_south_hindi_dubbed') || url.includes('south_hindi_dubbed') || path === 'latest_south_hindi_dubbed' || path === 'south_hindi_dubbed') {
    try {
      const metas = await getLatestSouthHindiDubbedMovies();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).json({ metas });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message, metas: [] });
    }
  }

  // 3. New Theatrical Hindi Cinema
  if (catId === 'latest_hindi_cinema_v2' || url.includes('latest_hindi_cinema_v2')) {
    try {
      const metas = await getLatestHindiMovies();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).json({ metas });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message, metas: [] });
    }
  }

  // 4. All-Time Popular Hindi OTT Hits
  if (catId === 'popular_hindi_ott' || url.includes('popular_hindi_ott') || path === 'popular_hindi_ott') {
    try {
      const metas = await getPopularHindiOttMovies();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).json({ metas });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message, metas: [] });
    }
  }

  // 5. IMDb Top-Rated Hindi Masterpieces
  if (catId === 'imdb_top_hindi' || url.includes('imdb_top_hindi') || path === 'imdb_top_hindi') {
    const metas = makeMetas(CURATED_IMDB_TOP_HINDI, "IMDb Masterpiece");
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json({ metas });
  }

  // 6. Cult Hindi Comedy Classics
  if (catId === 'cult_hindi_comedy' || url.includes('cult_hindi_comedy') || path === 'cult_hindi_comedy') {
    const metas = makeMetas(CURATED_CULT_HINDI_COMEDY, "Cult Comedy");
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json({ metas });
  }

  // 7. Hindi Suspense & Mystery Thrillers
  if (catId === 'hindi_mystery_thrillers' || url.includes('hindi_mystery_thrillers') || path === 'hindi_mystery_thrillers') {
    const metas = makeMetas(CURATED_HINDI_MYSTERY_THRILLERS, "Mystery & Suspense");
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json({ metas });
  }

  // 8. Inspiring Biopics & Patriotic Stories
  if (catId === 'hindi_patriotic_biopics' || url.includes('hindi_patriotic_biopics') || path === 'hindi_patriotic_biopics') {
    const metas = makeMetas(CURATED_PATRIOTIC_BIOPICS, "Biopic & Patriotic");
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json({ metas });
  }

  // 9. 90s & 2000s Golden Nostalgia Hits
  if (catId === 'hindi_90s_2000s_nostalgia' || url.includes('hindi_90s_2000s_nostalgia') || path === 'hindi_90s_2000s_nostalgia') {
    const metas = makeMetas(CURATED_90S_2000S_NOSTALGIA, "Golden Nostalgia");
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json({ metas });
  }

  // 10. Hindi Action & Crime Thrillers
  if (catId === 'hindi_action_thrillers' || url.includes('hindi_action_thrillers') || path === 'hindi_action_thrillers') {
    try {
      const metas = await getHindiActionThrillers();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(200).json({ metas });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message, metas: [] });
    }
  }

  // 11. Hindi Family & Evergreen Favorites
  if (catId === 'hindi_family_comedy' || url.includes('hindi_family_comedy') || path === 'hindi_family_comedy' || url.includes('catalog') || path === 'catalog') {
    try {
      const metas = await getHindiFamilyComedyMovies();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
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
        <p>Curated 100% Hindi cinema: Latest OTT drops, Hindi-dubbed South blockbusters, IMDb top masterpieces, cult comedy, suspense thrillers, patriotic biopics, and 90s-2000s nostalgia. Clean & family-safe.</p>
        <p><a href="stremio://${req.headers.host}/manifest.json" style="background: #655099; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold;">Install in Stremio</a></p>
        <p style="color: #666; font-size: 14px;">Manifest URL: <code>https://${req.headers.host}/manifest.json</code></p>
      </body>
    </html>
  `);
};
