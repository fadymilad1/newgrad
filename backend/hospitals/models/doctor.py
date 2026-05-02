from django.db import models
from core.models import WebsiteSetup
from .department import Department
import uuid

class Doctor(models.Model):
    """Hospital doctor."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    website_setup = models.ForeignKey(
        WebsiteSetup,
        on_delete=models.CASCADE,
        related_name='hospital_doctors'
    )
    department = models.ForeignKey(
        Department, 
        on_delete=models.CASCADE, 
        related_name='doctors'
    )
    name = models.CharField(max_length=255)
    specialty = models.CharField(max_length=255)
    bio = models.TextField(blank=True)
    image_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hospital_doctors'

    def __str__(self):
        return f"{self.name} ({self.specialty})"

class DoctorSchedule(models.Model):
    """Weekly schedule for a doctor."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    # 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
    day_of_week = models.IntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_duration_minutes = models.IntegerField(default=30)

    class Meta:
        db_table = 'hospital_doctor_schedules'
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        return f"{self.doctor.name} - Day {self.day_of_week} ({self.start_time} to {self.end_time})"
