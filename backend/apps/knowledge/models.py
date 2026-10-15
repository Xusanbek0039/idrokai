from django.db import models
from apps.common.models import CompanyScopedModel

class Document(CompanyScopedModel):
    title = models.CharField(max_length=255)
    file_type = models.CharField(max_length=32)
    file_size = models.PositiveIntegerField()
    status = models.CharField(max_length=32, default='processed')

    def __str__(self):
        return self.title

class DocumentChunk(CompanyScopedModel):
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='chunks')
    content = models.TextField()
    chunk_index = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.document.title} [Chunk {self.chunk_index}]"
