from django.db import models
from apps.common.models import CompanyScopedModel

class Contact(CompanyScopedModel):
    first_name = models.CharField(max_length=128)
    last_name = models.CharField(max_length=128, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    email = models.EmailField(blank=True)
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip()
