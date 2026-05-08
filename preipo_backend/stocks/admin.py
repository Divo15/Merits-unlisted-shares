from django.contrib import admin
from .models import Stock, DailyPrice


class DailyPriceInline(admin.TabularInline):
    model = DailyPrice
    extra = 1
    fields = ('date', 'price', 'high_52w', 'low_52w', 'change_pct')
    readonly_fields = ('change_pct',)
    ordering = ('-date',)


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('ticker', 'name', 'sector')
    search_fields = ('ticker', 'name')
    inlines = [DailyPriceInline]


@admin.register(DailyPrice)
class DailyPriceAdmin(admin.ModelAdmin):
    list_display = ('stock', 'date', 'price', 'change_pct')
    readonly_fields = ('change', 'change_pct')
    list_filter = ('date', 'stock')
    search_fields = ('stock__ticker',)
    ordering = ('-date',)
