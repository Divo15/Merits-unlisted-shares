import { NextRequest, NextResponse } from 'next/server';

const cache = new Map<string, { data: CompanyInfo; ts: number }>();
const TTL = 60 * 60 * 1000; // 1 hour

export interface CompanyInfo {
  slug: string;
  about: string;
  lockinPeriod: string[];
  fundamentals: Record<string, string>;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\bltd\.?\b/g, 'limited')
    .replace(/\bpvt\.?\b/g, 'private')
    .replace(/[^a-z0-9]/g, '')
    + 'unlistedshare';
}

// Stocks where the unlistedzone slug can't be derived from the legal name
// Values are the full slugs (without leading/trailing slashes)
const UZ_SLUG_OVERRIDE: Record<string, string> = {
  'National Stock Exchange of India Ltd': 'nse-india-limited-unlisted-shares',
  'Apollo Green Energy Ltd':              'apollo-green-energy-limited-unlisted-shares',
  'Chennai Super Kings Cricket Ltd':      'csk-share-price-buy-sell-unlisted-shares',
  'Nayara Energy Ltd':                    'buy-sell-share-price-essar-oil-limited-unlisted-shares',
  'Oravel Stays Ltd':                     'oravel-stays-limited-oyo-unlisted-shares',
  'Sterlite Power Transmission Ltd':      'sterlite-electric-limited-formerly-sterlite-power-unlisted-shares',
  'Onix Renewable Ltd':                   'onix-renewable-unlisted-shares-buy-sell-online',
  'API Holdings Ltd':                     'pharmeasy-share-price-buy-sell-online',
  'SBI Funds Management Ltd':             'sbi-mutual-fund-unlisted-shares',
  'National E-Repository Ltd':            'national-e-repository-share-price-buy-sell-online',
  'Parag Parikh Financial Advisory Services Ltd': 'parag-parikh-financial-advisory-services-share-price-buy-sell-online',
  'Metropolitan Stock Exchange of India Ltd':     'msei-share-price-buy-sell-unlisted-shares-of-msei-metropolitan-stock-exchange',
  'National Commodity & Derivatives Exchange Ltd': 'national-commodity-derivatives-exchange-ncdex-limited-unlisted-shares',
};

function toUnlistedZoneSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/\s+pvt\.?\s+ltd\.?/gi, '')
    .replace(/\s+private\s+limited/gi, '')
    .replace(/\s+ltd\.?/gi, '')
    .replace(/\s+limited/gi, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base + '-unlisted-shares';
}

function toUnlistedZoneSlugWithLimited(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/\s+pvt\.?\s+ltd\.?/gi, ' limited')
    .replace(/\s+ltd\.?/gi, ' limited')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base + '-unlisted-shares';
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickSentences(text: string, max: number): string {
  const sentences = text.match(/[^.!?]{15,}[.!?]/g) ?? [];
  if (sentences.length) return sentences.slice(0, max).join(' ').trim();
  return text.substring(0, 400).trim();
}

// ── Known brand aliases (fullName → search query) ────────────────────────
const BRAND_ALIAS: Record<string, string> = {
  'Oravel Stays Ltd':                          'OYO Rooms',
  'API Holdings Ltd':                          'PharmEasy',
  'Polymatech Electronics Pvt Ltd':            'Polymatech Electronics',
  'GFCL EV Products Ltd':                      'GFCL EV',
  'National E-Repository Ltd':                 'National E-Repository India',
  'Hindustan Power Exchange Ltd':              'Hindustan Power Exchange',
  'Goodluck Defence and Aerospace Pvt Ltd':    'Goodluck Defence Aerospace',
  'Metropolitan Stock Exchange of India Ltd':  'Metropolitan Stock Exchange India',
};

async function fetchDuckDuckGo(fullName: string): Promise<string> {
  const stripped = fullName
    .replace(/\s+Pvt\.?\s+Ltd\.?$/i, '')
    .replace(/\s+Private\s+Limited$/i, '')
    .replace(/\s+Ltd\.?$/i, '')
    .replace(/\s+Limited$/i, '')
    .trim();

  const queries = [
    BRAND_ALIAS[fullName],
    stripped,
    fullName,
  ].filter(Boolean) as string[];

  for (const q of queries) {
    try {
      const res = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`,
        { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5000) }
      );
      if (!res.ok) continue;
      const data = await res.json();
      const abstract: string = data.AbstractText || data.Abstract || '';
      if (abstract.length > 60) return pickSentences(abstract, 3);
    } catch { /* try next */ }
  }
  return '';
}

// ── Altius scrape ────────────────────────────────────────────────────────
async function fetchAltius(slug: string): Promise<string> {
  try {
    const res = await fetch(`https://altiusinvestech.com/company/${slug}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return '';
    const text = stripTags(await res.text());

    const match = text.match(
      /About\s+[\w\s&.,()-]{3,80}?(?:Unlisted\s+)?Shares?\s+([\s\S]{40,1200}?)(?=\s*(?:Overview|Insights|Financial Highlights|Balance Sheet|Profit|Shareholding|Ancillary|FAQs|Press|Annual Report|Company Information|Featured Companies|setAncillaryData))/i
    );

    if (!match) return '';
    const content = match[1].replace(/\s+/g, ' ').trim();
    if (content.length < 40) return '';
    return pickSentences(content, 4);
  } catch {
    return '';
  }
}

// ── Planify fundamentals scrape (fallback) ───────────────────────────────
const PLANIFY_LABEL_MAP: Record<string, string> = {
  'ISIN':       'ISIN',
  'Market Cap': 'Market Cap',
  'P/E Ratio':  'P/E Ratio',
  'Face Value': 'Face Value',
};

// Known Planify slug overrides where auto-generation fails
const PLANIFY_SLUG_OVERRIDE: Record<string, string> = {
  'National Stock Exchange of India Ltd': 'national-stock-exchange',
};

function toPlanifySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+pvt\.?\s+ltd\.?/gi, '')
    .replace(/\s+private\s+limited/gi, '')
    .replace(/\s+ltd\.?/gi, '')
    .replace(/\s+limited/gi, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fetchPlanify(name: string): Promise<Record<string, string>> {
  const slug = PLANIFY_SLUG_OVERRIDE[name] ?? toPlanifySlug(name);
  try {
    const res = await fetch(`https://planify.in/research-report/${slug}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return {};
    const html = await res.text();
    const ldMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    if (!ldMatch) return {};
    const result: Record<string, string> = {};
    for (const block of ldMatch) {
      try {
        const inner = block.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
        const raw = JSON.parse(inner);
        const schemas = Array.isArray(raw) ? raw : [raw];
        const props = schemas.flatMap((s: Record<string, unknown>) => (s.additionalProperty as Array<{ name: string; value: unknown }>) ?? []);
        for (const p of props) {
          const displayKey = PLANIFY_LABEL_MAP[p.name as string];
          if (displayKey && p.value != null && !result[displayKey]) {
            result[displayKey] = String(p.value);
          }
        }
      } catch { /* skip bad JSON-LD */ }
    }
    return result;
  } catch {
    return {};
  }
}

// Transform old unlistedzone URLs (JS SPA) to new server-rendered /shares/ format
// Old: https://www.unlistedzone.com/{slug}
// New: https://unlistedzone.com/shares/{slug}/
function normalizeUnlistedZoneUrl(url: string): string {
  const m = url.match(/^https?:\/\/(?:www\.)?unlistedzone\.com\/(?!shares\/)([^/?#]+)\/?$/);
  if (m) return `https://unlistedzone.com/shares/${m[1]}/`;
  return url;
}

// ── Unlistedzone fundamentals scrape ─────────────────────────────────────
// Key labels to extract and their display names in the modal
const FUND_LABEL_MAP: Record<string, string> = {
  // unlistedzone keys
  'Lot Size':          'Lot Size',
  'Depository':        'Depository',
  'PAN Number':        'PAN',
  'ISIN Number':       'ISIN',
  'CIN':               'CIN',
  'RTA':               'RTA',
  'P/E Ratio':         'P/E Ratio',
  'P/B Ratio':         'P/B Ratio',
  'Debt to Equity':    'Debt to Equity',
  'Debt/Equity Ratio': 'Debt to Equity',
  'ROE (%)':           'ROE',
  'Market Cap':        'Market Cap',
  // Planify keys (different from unlistedzone)
  'ISIN':              'ISIN',
  'Face Value':        'Face Value',
};

function decodeHtmlEntities(s: string): string {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
}

async function fetchFundamentals(url: string): Promise<Record<string, string>> {
  if (!url) return {};
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return {};
    const html = await res.text();

    const result: Record<string, string> = {};

    // Primary: extract from Bootstrap col-6 key-value grid used by unlistedzone
    const kvRegex = /<div[^>]*text-muted[^>]*>\s*([^<]+?)\s*<\/div>\s*<div[^>]*fw-extrabold[^>]*>\s*([^<]+?)\s*<\/div>/gi;
    let m: RegExpExecArray | null;
    while ((m = kvRegex.exec(html)) !== null) {
      const rawKey = decodeHtmlEntities(m[1].trim());
      const rawVal = decodeHtmlEntities(m[2].trim());
      const displayKey = FUND_LABEL_MAP[rawKey];
      if (displayKey && rawVal) result[displayKey] = rawVal;
    }

    // Market Cap and other fields from JSON-LD schema (unlistedzone + Planify)
    const ldBlocks = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
    for (const block of ldBlocks) {
      try {
        const raw = JSON.parse(block[1]);
        const schemas = Array.isArray(raw) ? raw : [raw];
        for (const schema of schemas) {
          const props: Array<{ name: string; value: unknown }> = schema.additionalProperty ?? [];
          for (const p of props) {
            const displayKey = FUND_LABEL_MAP[p.name as string];
            if (displayKey && p.value != null && !result[displayKey]) {
              result[displayKey] = String(p.value);
            }
          }
        }
      } catch { /* malformed JSON-LD */ }
    }

    return result;
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name') || '';
  const fundamentalsUrl = req.nextUrl.searchParams.get('fundamentalsUrl') || '';
  const slug = toSlug(name);
  const cacheKey = slug + '|' + fundamentalsUrl;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json(cached.data);
  }

  const overrideSlug = UZ_SLUG_OVERRIDE[name];
  const autoUrl1 = overrideSlug
    ? `https://unlistedzone.com/shares/${overrideSlug}/`
    : `https://unlistedzone.com/shares/${toUnlistedZoneSlug(name)}/`;
  const autoUrl2 = overrideSlug ? '' : `https://unlistedzone.com/shares/${toUnlistedZoneSlugWithLimited(name)}/`;

  const [about, fundamentals] = await Promise.all([
    (async () => {
      let a = await fetchAltius(slug);
      if (!a) a = await fetchDuckDuckGo(name);
      return a;
    })(),
    (async () => {
      if (fundamentalsUrl) {
        const stored = await fetchFundamentals(normalizeUnlistedZoneUrl(fundamentalsUrl));
        if (Object.keys(stored).length > 0) return stored;
        // stored URL returned nothing — fall through to auto-detection
      }
      // Try unlistedzone (most complete data)
      const f1 = await fetchFundamentals(autoUrl1);
      if (Object.keys(f1).length > 0) return f1;
      if (autoUrl2) {
        const f2 = await fetchFundamentals(autoUrl2);
        if (Object.keys(f2).length > 0) return f2;
      }
      // Fallback: Planify (covers more stocks, fewer fields)
      return fetchPlanify(name);
    })(),
  ]);

  const data: CompanyInfo = { slug, about, lockinPeriod: [], fundamentals };
  cache.set(cacheKey, { data, ts: Date.now() });
  return NextResponse.json(data);
}
