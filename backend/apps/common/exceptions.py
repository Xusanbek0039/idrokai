import uuid
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    Standardizes all API error responses to match OpenAPI ErrorResponse schema:
    {
        "code": "ERROR_CODE",
        "message": "Human readable message",
        "details": {},
        "request_id": "uuid"
    }
    """
    response = exception_handler(exc, context)
    request_id = str(uuid.uuid4())

    if response is not None:
        data = response.data
        if isinstance(data, dict):
            detail = data.get('detail', None)
            if detail:
                message = str(detail)
                code = getattr(exc, 'default_code', 'API_ERROR').upper()
                details = {k: v for k, v in data.items() if k != 'detail'}
            else:
                message = "Validation or processing error."
                code = "VALIDATION_ERROR"
                details = data
        elif isinstance(data, list):
            message = " ".join([str(item) for item in data])
            code = "VALIDATION_ERROR"
            details = {"errors": data}
        else:
            message = str(data)
            code = "API_ERROR"
            details = {}

        response.data = {
            "code": code,
            "message": message,
            "details": details,
            "request_id": request_id,
        }
    return response
