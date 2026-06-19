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
    image = models.ImageField(upload_to='doctor_images/', null=True, blank=True)
    image_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hospital_doctors'

    def __str__(self):
        return f"{self.name} ({self.specialty})"

class DoctorSchedule(models.Model):
<<<<<<< HEAD
    """Weekly schedule for a doctor with support for specific dates."""
=======
    """Weekly schedule for a doctor."""
>>>>>>> b0ee34201894c7449dc12cd939e715132a409efb

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
<<<<<<< HEAD
    # 0 = Sunday, 1 = Monday, ..., 6 = Saturday
=======
    # 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
>>>>>>> b0ee34201894c7449dc12cd939e715132a409efb
    day_of_week = models.IntegerField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_duration_minutes = models.IntegerField(default=30)
<<<<<<< HEAD
    # Optional: if set, this schedule only applies to this specific date
    specific_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'hospital_doctor_schedules'
        ordering = ['specific_date', 'day_of_week', 'start_time']

    def __str__(self):
        if self.specific_date:
            return f"{self.doctor.name} - {self.specific_date} ({self.start_time} to {self.end_time})"
=======

    class Meta:
        db_table = 'hospital_doctor_schedules'
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
>>>>>>> b0ee34201894c7449dc12cd939e715132a409efb
        return f"{self.doctor.name} - Day {self.day_of_week} ({self.start_time} to {self.end_time})"
