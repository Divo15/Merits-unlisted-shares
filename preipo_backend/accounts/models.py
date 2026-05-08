from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import CustomUserManager
from django.conf import settings


class CustomUser(AbstractUser):
    objects = CustomUserManager()
    ACCOUNT_TYPE_CHOICES = [('individual', 'Individual'), ('corporate', 'Corporate')]
    KYC_STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('submitted', 'Submitted'),
        ('verified',  'Verified'),
        ('rejected',  'Rejected'),
    ]

    username = None
    email    = models.EmailField(unique=True)
    phone    = models.CharField(max_length=15, unique=True)

    account_type        = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES, null=True, blank=True)

    pan_number          = models.CharField(max_length=10, null=True, blank=True)
    pan_name            = models.CharField(max_length=100, null=True, blank=True)
    state               = models.CharField(max_length=100, null=True, blank=True)
    city                = models.CharField(max_length=100, null=True, blank=True)
    address             = models.TextField(null=True, blank=True)
    zip_code            = models.CharField(max_length=10, null=True, blank=True)

    bank_account        = models.CharField(max_length=18, null=True, blank=True)
    ifsc_code           = models.CharField(max_length=11, null=True, blank=True)
    bank_name           = models.CharField(max_length=100, null=True, blank=True)
    account_holder_name = models.CharField(max_length=100, null=True, blank=True)

    pan_card_doc        = models.FileField(upload_to='docs/pan/',    null=True, blank=True)
    cheque_doc          = models.FileField(upload_to='docs/cheque/', null=True, blank=True)

    registration_step   = models.IntegerField(default=1)
    kyc_status          = models.CharField(max_length=20, choices=KYC_STATUS_CHOICES, default='pending')

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['phone']

    def __str__(self):
        return self.email


class Portfolio(models.Model):
    user           = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='portfolio')
    stock          = models.ForeignKey('stocks.Stock', on_delete=models.CASCADE)
    quantity       = models.DecimalField(max_digits=12, decimal_places=2)
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2)
    purchase_date  = models.DateField()
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-purchase_date']

    def __str__(self):
        return f"{self.user.email} — {self.stock.ticker} x{self.quantity}"
