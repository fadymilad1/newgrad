from rest_framework import viewsets, permissions

from core.models import WebsiteSetup
from core.serializers import WebsiteSetupSerializer


class WebsiteSetupViewSet(viewsets.ModelViewSet):
    serializer_class = WebsiteSetupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WebsiteSetup.objects.filter(user=self.request.user)

    def get_object(self):
        setup, created = WebsiteSetup.objects.get_or_create(user=self.request.user)
        return setup

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
