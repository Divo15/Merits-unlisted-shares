from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import Stock, DailyPrice
import yfinance as yf
import datetime
import time

_COLORS = ["#E53E3E","#DD6B20","#D69E2E","#38A169","#3182CE","#805AD5","#D53F8C","#00B5D8","#F6AD55","#68D391"]

def _auto_initials(name: str) -> str:
    words = name.split()
    return ("".join(w[0] for w in words if w)[:2]).upper()

def _auto_color(ticker: str) -> str:
    return _COLORS[sum(ord(c) for c in ticker) % len(_COLORS)]

_news_cache = {"data": [], "fetched_at": 0}
_CACHE_TTL = 300  # 5 minutes


def serialize_stock(stock):
    latest = stock.dailyprice_set.order_by('-date').first()
    return {
        'id': str(stock.id),
        'name': stock.name,
        'fullName': stock.full_name,
        'ticker': stock.ticker,
        'sector': stock.sector,
        'category': stock.category,
        'price': float(latest.price) if latest else 0,
        'change': float(latest.change) if latest else 0,
        'changePct': float(latest.change_pct) if latest else 0,
        'high52w': float(latest.high_52w) if latest else 0,
        'low52w': float(latest.low_52w) if latest else 0,
        'initials': _auto_initials(stock.name),
        'color': _auto_color(stock.ticker),
        'description': stock.description or '',
        'fundamentalsUrl': stock.fundamentals_url or '',
        'fundamentalsJson': stock.fundamentals_json or {},
        'logoUrl': stock.logo_url or '',
    }


@api_view(['GET'])
def stock_list(request):
    stocks = Stock.objects.prefetch_related('dailyprice_set').all()
    return Response([serialize_stock(s) for s in stocks])


@api_view(['GET'])
def stock_detail(request, pk):
    try:
        stock = Stock.objects.prefetch_related('dailyprice_set').get(pk=pk)
    except Stock.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(serialize_stock(stock))


@api_view(['GET'])
def news_feed(request):
    global _news_cache
    now = time.time()

    if now - _news_cache["fetched_at"] < _CACHE_TTL and _news_cache["data"]:
        return Response(_news_cache["data"])

    # Search terms relevant to pre-IPO / unlisted equities
    search_queries = ["India IPO", "unlisted shares India", "pre-IPO startup funding India"]
    seen = set()
    articles = []

    for query in search_queries:
        try:
            results = yf.Search(query, news_count=6).news
            for item in results:
                content = item.get("content", {})
                title = content.get("title", "")
                url = content.get("canonicalUrl", {}).get("url", "")
                provider = content.get("provider", {}).get("displayName", "Yahoo Finance")
                pub_date = content.get("pubDate", "")
                if title and title not in seen:
                    seen.add(title)
                    articles.append({
                        "title": title,
                        "url": url,
                        "source": provider,
                        "publishedAt": pub_date,
                    })
        except Exception:
            continue

    # Also pull news for DB stocks that may have Yahoo Finance listings
    try:
        db_tickers = list(Stock.objects.values_list("ticker", flat=True)[:5])
        for ticker in db_tickers:
            try:
                items = yf.Ticker(ticker).news
                for item in (items or [])[:3]:
                    content = item.get("content", {})
                    title = content.get("title", "")
                    url = content.get("canonicalUrl", {}).get("url", "")
                    provider = content.get("provider", {}).get("displayName", "Yahoo Finance")
                    pub_date = content.get("pubDate", "")
                    if title and title not in seen:
                        seen.add(title)
                        articles.append({
                            "title": title,
                            "url": url,
                            "source": provider,
                            "publishedAt": pub_date,
                        })
            except Exception:
                continue
    except Exception:
        pass

    _news_cache = {"data": articles, "fetched_at": now}
    return Response(articles)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def stock_create(request):
    data = request.data
    try:
        stock = Stock.objects.create(
            name=data['name'],
            full_name=data.get('fullName', data['name']),
            ticker=data['ticker'].upper(),
            sector=data.get('sector', ''),
            category=data.get('category', 'Pre-IPO'),
            description=data.get('description', ''),
            fundamentals_url=data.get('fundamentalsUrl', ''),
            fundamentals_json=data.get('fundamentalsJson', {}),
        )
        price = data.get('price')
        if price is not None:
            DailyPrice.objects.create(
                stock=stock,
                date=datetime.date.today(),
                price=price,
                high_52w=data.get('high52w', price),
                low_52w=data.get('low52w', price),
            )
        return Response(serialize_stock(stock), status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminUser])
def stock_update(request, pk):
    try:
        stock = Stock.objects.prefetch_related('dailyprice_set').get(pk=pk)
    except Stock.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    if 'name' in data:        stock.name = data['name']
    if 'fullName' in data:    stock.full_name = data['fullName']
    if 'ticker' in data:      stock.ticker = data['ticker'].upper()
    if 'sector' in data:      stock.sector = data['sector']
    if 'category' in data:    stock.category = data['category']
    if 'description' in data:      stock.description = data['description']
    if 'fundamentalsUrl' in data:   stock.fundamentals_url  = data['fundamentalsUrl']
    if 'fundamentalsJson' in data:  stock.fundamentals_json = data['fundamentalsJson'] or {}
    stock.save()

    if 'price' in data:
        today = datetime.date.today()
        try:
            dp = DailyPrice.objects.get(stock=stock, date=today)
            dp.price = data['price']
            if 'high52w' in data: dp.high_52w = data['high52w']
            if 'low52w' in data:  dp.low_52w  = data['low52w']
            dp.save()
        except DailyPrice.DoesNotExist:
            latest = stock.dailyprice_set.first()
            DailyPrice.objects.create(
                stock=stock,
                date=today,
                price=data['price'],
                high_52w=data.get('high52w', latest.high_52w if latest else data['price']),
                low_52w=data.get('low52w',  latest.low_52w  if latest else data['price']),
            )

    stock.refresh_from_db()
    return Response(serialize_stock(stock))


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def stock_delete(request, pk):
    try:
        Stock.objects.get(pk=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Stock.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
