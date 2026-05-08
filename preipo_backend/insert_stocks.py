import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'preipo_backend.settings')
django.setup()

from stocks.models import Stock, DailyPrice
from django.utils import timezone

STOCKS = [
    # (full_name, ticker, sector, category, price, high_52w, low_52w)
    ("National Stock Exchange of India Ltd",         "NSE",      "Financial Services", "unlisted",  1985.00,  None,    None),
    ("Metropolitan Stock Exchange of India Ltd",     "MSEI",     "Financial Services", "unlisted",     6.25,  None,    None),
    ("National Commodity & Derivatives Exchange Ltd","NCDEX",    "Financial Services", "unlisted",   384.00,  525.00,  210.00),
    ("Orbis Financial Corporation Ltd",              "ORBIS",    "Financial Services", "unlisted",   408.00,  None,    None),
    ("Onix Renewable Ltd",                           "ONIX",     "Energy",             "unlisted",    66.00,  None,    None),
    ("Parag Parikh Financial Advisory Services Ltd", "PPFAS",    "Financial Services", "unlisted", 17950.00,  None,    None),
    ("Polymatech Electronics Pvt Ltd",               "PLYMTCH",  "Technology",         "unlisted",    62.00,  None,    None),
    ("Studds Accessories Ltd",                       "STUDDS",   "Consumer Goods",     "unlisted",   615.00,  None,    None),
    ("SBI Funds Management Ltd",                     "SBIFM",    "Financial Services", "unlisted",   775.00,  None,    None),
    ("Nayara Energy Ltd",                            "NAYARA",   "Energy",             "unlisted",  1050.00, 1375.00,  750.00),
    ("Sterlite Power Transmission Ltd",              "STERLPWR", "Infrastructure",     "unlisted",   468.00,  650.00,  425.00),
    ("Apollo Green Energy Ltd",                      "APOLLOGE", "Energy",             "unlisted",    58.00,  None,    None),
    ("Oravel Stays Ltd",                             "ORAVEL",   "Consumer Services",  "pre-ipo",     24.00,  None,    None),
    ("GFCL EV Products Ltd",                         "GFCLEV",   "Automobile",         "unlisted",    42.00,   54.00,   42.00),
    ("National E-Repository Ltd",                    "NERL",     "Technology",         "unlisted",    56.00,   69.00,   47.00),
    ("InCred Financial Services Ltd",                "INCRED",   "Financial Services", "unlisted",   150.00,  180.00,  148.00),
    ("Chennai Super Kings Cricket Ltd",              "CSK",      "Entertainment",      "unlisted",   264.00,  None,    None),
    ("Cochin International Airport Ltd",             "CIAL",     "Infrastructure",     "unlisted",   438.00,  495.00,  425.00),
    ("API Holdings Ltd",                             "APIHLD",   "Healthcare",         "pre-ipo",      6.25,    8.50,    5.75),
    ("Hindustan Power Exchange Ltd",                 "HPX",      "Energy",             "unlisted",    28.00,  None,    None),
    ("Goodluck Defence and Aerospace Pvt Ltd",       "GLDA",     "Defence",            "unlisted",   312.00,  395.00,  240.00),
]

today = timezone.now().date()
created_stocks = 0
created_prices = 0

for full_name, ticker, sector, category, price, high_52w, low_52w in STOCKS:
    stock, is_new = Stock.objects.get_or_create(
        ticker=ticker,
        defaults={
            "name": full_name,
            "full_name": full_name,
            "sector": sector,
            "category": category,
        }
    )
    if is_new:
        created_stocks += 1

    DailyPrice.objects.create(
        stock=stock,
        date=today,
        price=price,
        high_52w=high_52w if high_52w else price,
        low_52w=low_52w if low_52w else price,
    )
    created_prices += 1
    print(f"  {'NEW' if is_new else 'UPD'} {ticker:<10} Rs.{price:>10,.2f}  {full_name}")

print(f"\nDone. {created_stocks} stocks created, {created_prices} price entries added.")
