from django.db import models
from django.conf import settings
from apps.common.models import CompanyScopedModel

class Conversation(CompanyScopedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, default='New Conversation')

    def __str__(self):
        return f"{self.title} ({self.user.email})"

class Message(CompanyScopedModel):
    ROLE_USER = 'user'
    ROLE_ASSISTANT = 'assistant'
    ROLE_CHOICES = [(ROLE_USER, 'User'), (ROLE_ASSISTANT, 'Assistant')]

    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=16, choices=ROLE_CHOICES)
    content = models.TextField()

    def __str__(self):
        return f"[{self.role}] {self.content[:30]}..."
