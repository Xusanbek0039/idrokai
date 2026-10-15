from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import LoginSerializer, AuthUserSerializer

class CsrfCookieView(APIView):
    """Initializes and returns the CSRF cookie for browser clients."""
    permission_classes = [AllowAny]

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        return Response({"detail": "CSRF cookie set"}, status=status.HTTP_200_OK)

class LoginView(APIView):
    """Authenticates the user and initiates a secure server-side session."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email'].lower()
        password = serializer.validated_data['password']
        
        user = authenticate(request, username=email, password=password)
        if not user:
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {"detail": "This account is inactive."},
                status=status.HTTP_403_FORBIDDEN
            )

        login(request, user)
        return Response(AuthUserSerializer(user).data, status=status.HTTP_200_OK)

class LogoutView(APIView):
    """Terminates the user's session."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)

class CurrentUserView(APIView):
    """Retrieves current authenticated user profile and company memberships."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(AuthUserSerializer(request.user).data, status=status.HTTP_200_OK)
