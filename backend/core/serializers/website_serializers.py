from rest_framework import serializers
from .user_serializers import UserSerializer
from core.models import WebsiteSetup


class WebsiteSetupSerializer(serializers.ModelSerializer):
    """Serializer for WebsiteSetup model"""
    user = UserSerializer(read_only=True)

    class Meta:
        model = WebsiteSetup
        fields = [
            'id', 'user', 'subdomain', 'review_system', 'ai_chatbot', 'ambulance_ordering',
            'patient_portal', 'prescription_refill', 'template_id', 'is_paid',
            'total_price', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
