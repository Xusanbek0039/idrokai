import uuid
from django.db import models
from django.conf import settings
from apps.common.models import UUIDModel, TimeStampedModel, CompanyScopedModel

class IdempotencyRecord(UUIDModel, TimeStampedModel):
    """Stores idempotency keys to guarantee at-most-once processing for financial requests."""
    key = models.UUIDField(unique=True, db_index=True)
    company = models.ForeignKey('tenancy.Company', on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    endpoint = models.CharField(max_length=255)
    request_hash = models.CharField(max_length=64)
    response_status = models.IntegerField(null=True, blank=True)
    response_body = models.JSONField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    expires_at = models.DateTimeField(db_index=True)

    def __str__(self):
        return f"Idempotency {self.key} - Completed: {self.is_completed}"

class AuditEvent(CompanyScopedModel):
    """Immutable audit trail of all company and financial events."""
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=128, db_index=True)
    target_type = models.CharField(max_length=128)
    target_id = models.UUIDField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"[{self.action}] on {self.target_type} ({self.target_id})"
