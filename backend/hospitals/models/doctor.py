from django.db import models
from .department import Department
import uuid


class Doctor(models.Model):
    """Hospital doctor model"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='doctors')
    name = models.CharField(max_length=255)
    title = models.CharField(max_length=100)
    specialization = models.CharField(max_length=255)
    email = models.EmailField()
    experience = models.CharField(max_length=100)
    photo = models.ImageField(upload_to='doctors/', null=True, blank=True)
    certificates = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.specialization})"

    class Meta:
        db_table = 'api_doctor'
