from django.urls import path
from .views import CsrfCookieView, LoginView, LogoutView, CurrentUserView

app_name = 'identity'

urlpatterns = [
    path('csrf', CsrfCookieView.as_view(), name='csrf'),
    path('login', LoginView.as_view(), name='login'),
    path('logout', LogoutView.as_view(), name='logout'),
    path('me', CurrentUserView.as_view(), name='me'),
]
