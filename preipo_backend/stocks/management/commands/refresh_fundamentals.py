import re
import html
import time
import logging
import requests
from django.core.management.base import BaseCommand
from stocks.models import Stock

logger = logging.getLogger(__name__)

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml',
}

FUND_LABEL_MAP = {
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
    'ISIN':              'ISIN',
    'Face Value':        'Face Value',
}

UZ_SLUG_OVERRIDE = {
    'National Stock Exchange of India Ltd':               'nse-india-limited-unlisted-shares',
    'Apollo Green Energy Ltd':                            'apollo-green-energy-limited-unlisted-shares',
    'Chennai Super Kings Cricket Ltd':                    'csk-share-price-buy-sell-unlisted-shares',
    'Nayara Energy Ltd':                                  'buy-sell-share-price-essar-oil-limited-unlisted-shares',
    'Oravel Stays Ltd':                                   'oravel-stays-limited-oyo-unlisted-shares',
    'Sterlite Power Transmission Ltd':                    'sterlite-electric-limited-formerly-sterlite-power-unlisted-shares',
    'Onix Renewable Ltd':                                 'onix-renewable-unlisted-shares-buy-sell-online',
    'API Holdings Ltd':                                   'pharmeasy-share-price-buy-sell-online',
    'SBI Funds Management Ltd':                           'sbi-mutual-fund-unlisted-shares',
    'National E-Repository Ltd':                          'national-e-repository-share-price-buy-sell-online',
    'Parag Parikh Financial Advisory Services Ltd':       'parag-parikh-financial-advisory-services-share-price-buy-sell-online',
    'Metropolitan Stock Exchange of India Ltd':           'msei-share-price-buy-sell-unlisted-shares-of-msei-metropolitan-stock-exchange',
    'National Commodity & Derivatives Exchange Ltd':      'national-commodity-derivatives-exchange-ncdex-limited-unlisted-shares',
}


def to_uz_slug(name):
    s = re.sub(r'\s+pvt\.?\s+ltd\.?', '', name, flags=re.IGNORECASE)
    s = re.sub(r'\s+private\s+limited', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\s+ltd\.?', '', s, flags=re.IGNORECASE)
    s = re.sub(r'\s+limited', '', s, flags=re.IGNORECASE)
    s = s.strip().lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = re.sub(r'-+', '-', s).strip('-')
    return s + '-unlisted-shares'


def to_uz_slug_with_limited(name):
    s = re.sub(r'\s+pvt\.?\s+ltd\.?', ' limited', name, flags=re.IGNORECASE)
    s = re.sub(r'\s+ltd\.?', ' limited', s, flags=re.IGNORECASE)
    s = s.strip().lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = re.sub(r'-+', '-', s).strip('-')
    return s + '-unlisted-shares'


def normalize_uz_url(url):
    m = re.match(r'^https?://(?:www\.)?unlistedzone\.com/(?!shares/)([^/?#]+)/?$', url)
    if m:
        return f'https://unlistedzone.com/shares/{m.group(1)}/'
    return url


def fetch_fundamentals(url):
    if not url:
        return {}
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        if not res.ok:
            return {}
        content = res.text
        result = {}

        kv_pattern = re.compile(
            r'<div[^>]*text-muted[^>]*>\s*([^<]+?)\s*</div>\s*<div[^>]*fw-extrabold[^>]*>\s*([^<]+?)\s*</div>',
            re.IGNORECASE
        )
        for m in kv_pattern.finditer(content):
            raw_key = html.unescape(m.group(1).strip())
            raw_val = html.unescape(m.group(2).strip())
            display_key = FUND_LABEL_MAP.get(raw_key)
            if display_key and raw_val:
                result[display_key] = raw_val

        # Also try JSON-LD schema
        ld_pattern = re.compile(
            r'<script[^>]*type="application/ld\+json"[^>]*>([\s\S]*?)</script>',
            re.IGNORECASE
        )
        import json
        for block in ld_pattern.finditer(content):
            try:
                raw = json.loads(block.group(1))
                schemas = raw if isinstance(raw, list) else [raw]
                for schema in schemas:
                    for prop in schema.get('additionalProperty', []):
                        display_key = FUND_LABEL_MAP.get(prop.get('name', ''))
                        if display_key and prop.get('value') is not None and display_key not in result:
                            result[display_key] = str(prop['value'])
            except Exception:
                pass

        return result
    except Exception as e:
        logger.warning(f'fetch_fundamentals({url}): {e}')
        return {}


def scrape_stock(stock):
    override_slug = UZ_SLUG_OVERRIDE.get(stock.full_name)

    # Try stored fundamentalsUrl first (normalize old format)
    if stock.fundamentals_url:
        f = fetch_fundamentals(normalize_uz_url(stock.fundamentals_url))
        if f:
            return f

    # Auto-detect from slug
    if override_slug:
        f = fetch_fundamentals(f'https://unlistedzone.com/shares/{override_slug}/')
        if f:
            return f
    else:
        f = fetch_fundamentals(f'https://unlistedzone.com/shares/{to_uz_slug(stock.full_name)}/')
        if f:
            return f
        f = fetch_fundamentals(f'https://unlistedzone.com/shares/{to_uz_slug_with_limited(stock.full_name)}/')
        if f:
            return f

    return {}


class Command(BaseCommand):
    help = 'Scrape fundamentals for all stocks from unlistedzone and save to DB'

    def handle(self, *args, **options):
        stocks = list(Stock.objects.all())
        self.stdout.write(f'Refreshing fundamentals for {len(stocks)} stocks...')

        updated = 0
        failed = 0

        for stock in stocks:
            try:
                funds = scrape_stock(stock)
                if funds:
                    stock.fundamentals_json = funds
                    stock.save(update_fields=['fundamentals_json'])
                    self.stdout.write(self.style.SUCCESS(f'  OK  {stock.ticker} — {len(funds)} fields'))
                    updated += 1
                else:
                    self.stdout.write(self.style.WARNING(f'  --  {stock.ticker} — no data found'))
                    failed += 1
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'  ERR {stock.ticker} — {e}'))
                failed += 1

            time.sleep(1)  # be polite to unlistedzone

        self.stdout.write(f'\nDone: {updated} updated, {failed} no data')
