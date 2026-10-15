import uuid
from django.db import models

class UUIDModel(models.Model):
    """Abstract base model that uses UUIDv4 primary keys."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True

class TimeStampedModel(models.Model):
    """Abstract base model with automated created_at and updated_at UTC timestamps."""
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class CompanyScopedModel(UUIDModel, TimeStampedModel):
    """Abstract model representing a tenant-scoped resource."""
    company = models.ForeignKey(
        'tenancy.Company',
        on_delete=models.CASCADE,
        related_name='%(class)ss',
        db_index=True,
    )

    class Meta:
        abstract = True
