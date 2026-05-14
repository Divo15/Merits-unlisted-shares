from django.db import models


class Stock(models.Model):
    name = models.CharField(max_length=100)
    full_name = models.CharField(max_length=255)
    ticker = models.CharField(max_length=20, unique=True)
    sector = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    fundamentals_url = models.URLField(blank=True, default='')
    fundamentals_json = models.JSONField(default=dict, blank=True)
    logo_url = models.CharField(max_length=500, blank=True, default='')

    def __str__(self):
        return self.ticker


class DailyPrice(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    date = models.DateField()
    updated_at = models.DateTimeField(auto_now=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    change = models.DecimalField(max_digits=10, decimal_places=2, default=0, editable=False)
    change_pct = models.DecimalField(max_digits=8, decimal_places=2, default=0, editable=False)
    high_52w = models.DecimalField(max_digits=12, decimal_places=2)
    low_52w = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ['-date', '-updated_at']

    def save(self, *args, **kwargs):
        prev = (
            DailyPrice.objects
            .filter(stock=self.stock, date__lt=self.date)
            .order_by('-date')
            .first()
        )
        if prev and prev.price:
            self.change = self.price - prev.price
            self.change_pct = (self.change / prev.price * 100).quantize(self.change_pct)
        else:
            self.change = 0
            self.change_pct = 0
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.stock.ticker} — {self.date}"
