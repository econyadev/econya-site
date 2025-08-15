/* actifs/apis.js – wrappers d’APIs publiques (gratuites) */

const API = (() => {
  // ---------- CONF ----------
  const FX_BASE = 'https://api.exchangerate.host';
  const COINGECKO = 'https://api.coingecko.com/api/v3';
  const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';
  const GITHUB_RAW =
    'https://raw.githubusercontent.com/public-apis/public-apis/master/entries.json'; // liste d'APIs utiles

  // Optionnelles (clé à mettre en .env côté front si tu veux)
  const NEWS_API_KEY = (window.NEWS_API_KEY || '').trim(); // https://newsapi.org (clé gratuite)
  const NEWS_API = 'https://newsapi.org/v2';

  // util petits fetch + cache mémoire (durée en ms)
  const mem = new Map();
  async function get(url, { ttl = 5 * 60 * 1000, headers = {} } = {}) {
    const now = Date.now();
    const cached = mem.get(url);
    if (cached && now - cached.t < cached.ttl) return cached.v;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const v = await res.json();
    mem.set(url, { t: now, ttl, v });
    return v;
  }

  // ---------- FX / Devises ----------
  async function getFx(base = 'EUR', symbols = 'USD,GBP,CHF') {
    const url = `${FX_BASE}/latest?base=${encodeURIComponent(
      base
    )}&symbols=${encodeURIComponent(symbols)}`;
    const data = await get(url, { ttl: 60 * 60 * 1000 }); // 1h
    return data; // { base, rates:{}, date }
  }

  // ---------- Crypto (CoinGecko, sans clé) ----------
  async function getCryptoPrices(ids = ['bitcoin', 'ethereum'], vs = 'eur') {
    const url = `${COINGECKO}/simple/price?ids=${ids
      .map(encodeURIComponent)
      .join(',')}&vs_currencies=${encodeURIComponent(vs)}&include_24hr_change=true`;
    return get(url, { ttl: 60 * 1000 }); // 1 min
  }

  // ---------- Météo (Open-Meteo) : pour estimer chauffage/clim ----------
  async function getWeather(lat, lon) {
    const url = `${OPEN_METEO}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&timezone=auto`;
    return get(url, { ttl: 10 * 60 * 1000 });
  }

  // ---------- News finance/économie (NewsAPI, clé optionnelle) ----------
  async function getFinanceNews(q = 'économie OR finances OR épargne', lang = 'fr') {
    if (!NEWS_API_KEY) {
      // fallback : quelques titres via CoinGecko status updates (anglais)
      const data = await get(`${COINGECKO}/status_updates?per_page=10&page=1`, {
        ttl: 10 * 60 * 1000
      });
      return (data.status_updates || []).map((s) => ({
        title: s.project ? `${s.project.name}: ${s.description}` : s.description,
        url: s.article_url || s.project?.website || 'https://www.coingecko.com',
        source: s.user || 'CoinGecko'
      }));
    }
    const url = `${NEWS_API}/everything?q=${encodeURIComponent(
      q
    )}&language=${lang}&pageSize=12&apiKey=${NEWS_API_KEY}`;
    const data = await get(url, { ttl: 10 * 60 * 1000 });
    return (data.articles || []).map((a) => ({
      title: a.title,
      url: a.url,
      source: a.source?.name || 'News'
    }));
  }

  // ---------- Idées d’APIs (catalogue public-apis) ----------
  async function getApiIdeas() {
    const d = await get(GITHUB_RAW, { ttl: 24 * 60 * 60 * 1000 });
    return d.entries?.filter((e) =>
      /finance|bank|econom|open data|government|electric|energy|climate/i.test(
        `${e.Category} ${e.Description}`
      )
    );
  }

  return {
    getFx,
    getCryptoPrices,
    getWeather,
    getFinanceNews,
    getApiIdeas
  };
})();
