from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, Portfolio
from stocks.models import DailyPrice


class Step1Serializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model  = CustomUser
        fields = ['email', 'phone', 'password', 'confirm_password']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        return CustomUser.objects.create_user(
            email=validated_data['email'],
            phone=validated_data['phone'],
            password=validated_data['password'],
            registration_step=1,
        )


class Step2Serializer(serializers.ModelSerializer):
    class Meta:
        model  = CustomUser
        fields = ['account_type']

    def validate_account_type(self, value):
        if value not in ['individual', 'corporate']:
            raise serializers.ValidationError('Must be individual or corporate.')
        return value


class Step3Serializer(serializers.ModelSerializer):
    class Meta:
        model  = CustomUser
        fields = [
            'pan_number', 'pan_name', 'state', 'city', 'address', 'zip_code',
            'bank_account', 'ifsc_code', 'bank_name', 'account_holder_name',
            'pan_card_doc', 'cheque_doc',
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CustomUser
        fields = [
            'id', 'email', 'phone', 'account_type',
            'pan_number', 'pan_name', 'state', 'city', 'address', 'zip_code',
            'bank_account', 'ifsc_code', 'bank_name', 'account_holder_name',
            'registration_step', 'kyc_status',
        ]
        read_only_fields = ['id', 'email', 'registration_step', 'kyc_status']


class PortfolioSerializer(serializers.ModelSerializer):
    stock_name     = serializers.CharField(source='stock.name', read_only=True)
    ticker         = serializers.CharField(source='stock.ticker', read_only=True)
    current_price  = serializers.SerializerMethodField()
    unrealized_pnl = serializers.SerializerMethodField()
    pct_return     = serializers.SerializerMethodField()

    class Meta:
        model  = Portfolio
        fields = [
            'id', 'stock_name', 'ticker',
            'quantity', 'purchase_price', 'purchase_date',
            'current_price', 'unrealized_pnl', 'pct_return',
        ]

    def _latest_price(self, obj):
        if not hasattr(obj, '_cached_dp'):
            obj._cached_dp = DailyPrice.objects.filter(stock=obj.stock).first()
        return obj._cached_dp

    def get_current_price(self, obj):
        dp = self._latest_price(obj)
        return float(dp.price) if dp else None

    def get_unrealized_pnl(self, obj):
        dp = self._latest_price(obj)
        if dp:
            return round(float((dp.price - obj.purchase_price) * obj.quantity), 2)
        return None

    def get_pct_return(self, obj):
        dp = self._latest_price(obj)
        if dp and obj.purchase_price:
            return round(float((dp.price - obj.purchase_price) / obj.purchase_price * 100), 2)
        return None
