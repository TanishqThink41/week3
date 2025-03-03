from rest_framework import viewsets, status, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from .models import Item, UserProfile
from .serializers import ItemSerializer, UserSerializer, RegisterSerializer

# Create a viewset for the Item model
class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

# Create a simple API view for testing
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def api_overview(request):
    api_urls = {
        'Register': '/auth/register/',
        'Login': '/auth/login/',
        'Refresh Token': '/auth/token/refresh/',
        'User Profile': '/auth/profile/',
        'Items': '/items/',
    }
    return Response(api_urls)

# Register view
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

# User profile view
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
