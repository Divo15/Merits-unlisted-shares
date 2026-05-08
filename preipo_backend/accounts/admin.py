from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display  = ('email', 'phone', 'account_type', 'registration_step', 'kyc_status', 'is_staff')
    list_filter   = ('kyc_status', 'account_type', 'registration_step', 'is_staff')
    search_fields = ('email', 'phone', 'pan_number')
    ordering      = ('-date_joined',)

    fieldsets = (
        ('Account',      {'fields': ('email', 'phone', 'password')}),
        ('Registration', {'fields': ('registration_step', 'account_type', 'kyc_status')}),
        ('KYC — Identity', {'fields': ('pan_number', 'pan_name')}),
        ('KYC — Address',  {'fields': ('state', 'city', 'address', 'zip_code')}),
        ('KYC — Bank',     {'fields': ('bank_account', 'ifsc_code', 'bank_name', 'account_holder_name')}),
        ('KYC — Docs',     {'fields': ('pan_card_doc', 'cheque_doc')}),
        ('Permissions',    {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates',          {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'phone', 'password1', 'password2'),
        }),
    )
