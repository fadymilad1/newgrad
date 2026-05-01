from django.db import models
from .user import User
import uuid


class WebsiteSetup(models.Model):
    """Main website configuration for each user"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='website_setup')

    # Hospital features
    review_system = models.BooleanField(default=False)
    ai_chatbot = models.BooleanField(default=False)
    ambulance_ordering = models.BooleanField(default=False)
    patient_portal = models.BooleanField(default=False)
    prescription_refill = models.BooleanField(default=False)

    # Pharmacy template
    template_id = models.IntegerField(null=True, blank=True)

    # Payment status
    is_paid = models.BooleanField(default=False)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    subdomain = models.CharField(max_length=255, unique=True, null=True, blank=False)

    def __str__(self):
        return f"Website Setup for {self.user.name}"

    class Meta:
        db_table = 'website_setups'
