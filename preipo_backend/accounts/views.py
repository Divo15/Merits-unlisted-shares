from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import CustomUser, Portfolio
from .serializers import Step1Serializer, Step2Serializer, Step3Serializer, UserProfileSerializer, PortfolioSerializer
from stocks.models import DailyPrice, Stock


def _token_pair(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}


@api_view(['POST'])
@permission_classes([AllowAny])
def register_step1(request):
    serializer = Step1Serializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    user = serializer.save()
    tokens = _token_pair(user)
    return Response({'user_id': user.id, **tokens}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_step2(request):
    serializer = Step2Serializer(request.user, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    user = serializer.save()
    user.registration_step = 2
    user.save(update_fields=['registration_step', 'account_type'])
    return Response({'success': True, 'user': UserProfileSerializer(user).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def register_step3(request):
    serializer = Step3Serializer(request.user, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    user = serializer.save()
    user.registration_step = 3
    user.kyc_status = 'submitted'
    user.save(update_fields=['registration_step', 'kyc_status'])
    return Response({'success': True, 'kyc_status': user.kyc_status})


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email    = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
    if not user.check_password(password):
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
    tokens = _token_pair(user)
    return Response({**tokens, 'user': UserProfileSerializer(user).data})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'error': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        RefreshToken(refresh_token).blacklist()
    except TokenError:
        pass
    return Response({'success': True})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserProfileSerializer(request.user).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio_view(request):
    holdings = Portfolio.objects.filter(user=request.user).select_related('stock')
    return Response(PortfolioSerializer(holdings, many=True).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def kylas_deal_webhook(request):
    data           = request.data
    pan_number     = data.get('panNumber', '').strip().upper()
    ticker         = data.get('ticker', '').strip().upper()
    quantity       = data.get('quantity')
    purchase_price = data.get('purchasePrice')
    purchase_date  = data.get('purchaseDate')

    if not all([pan_number, ticker, quantity, purchase_price, purchase_date]):
        return Response({'error': 'Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = CustomUser.objects.get(pan_number__iexact=pan_number)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    try:
        stock = Stock.objects.get(ticker__iexact=ticker)
    except Stock.DoesNotExist:
        return Response({'error': f'Stock not found: {ticker}'}, status=status.HTTP_404_NOT_FOUND)

    Portfolio.objects.create(
        user=user,
        stock=stock,
        quantity=quantity,
        purchase_price=purchase_price,
        purchase_date=purchase_date,
    )
    return Response({'success': True}, status=status.HTTP_201_CREATED)
