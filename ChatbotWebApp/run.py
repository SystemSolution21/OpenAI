# run.py

from typing import Any, Literal
from flask import Flask, Response, request, jsonify, render_template
from flask_cors import CORS
import time
from openai import OpenAI
import openai
from openai.types.chat.chat_completion import ChatCompletion

# Default Model
DEFAULT_MODEL = "gpt-3.5-turbo"

# Initialize App
app = Flask(import_name=__name__, static_folder="static", template_folder="templates")
CORS(app=app)

# Initialize Chat
client = OpenAI()


@app.after_request
def add_security_headers(response: Response) -> Response:
    """Add security headers to all responses."""
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"

    return response


# Route index
@app.route(rule="/")
def index() -> str:
    return render_template(template_name_or_list="index.html")


# Route chat
@app.route(rule="/api/chat", methods=["POST"])
def chat() -> Response | tuple[Response, int]:
    data: Any | None = request.json
    user_message: Any | Literal[""] = data.get("message", "") if data else ""
    api_key: str = data.get("api_key", "") if data else ""
    model: str = data.get("model", DEFAULT_MODEL) if data else DEFAULT_MODEL

    # CSRF: Enforce Content-Type check
    if not request.is_json:
        app.logger.warning(msg="Request Content-Type not application/json")
        return (
            jsonify(
                {
                    "response": "Error: Request must be JSON (Content-Type: application/json).",
                    "timestamp": time.strftime("%H:%M"),
                }
            ),
            415,  # Unsupported Media Type
        )

    if not api_key:
        app.logger.warning(msg="API key missing in request to /api/chat")
        return (
            jsonify(
                {
                    "response": "Error: API key is missing in the request.",
                    "timestamp": time.strftime("%H:%M"),
                }
            ),
            400,  # Bad Request
        )

    try:
        # Initialize client with user-provided API key
        request_client = OpenAI(api_key=api_key)
        completion: ChatCompletion = request_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": user_message},
            ],
        )

        return jsonify(
            {
                "response": completion.choices[0].message.content,
                "timestamp": time.strftime("%H:%M"),
            }
        )
    except openai.AuthenticationError as e:
        # Specifically handles 401 errors from OpenAI
        app.logger.error(
            f"OpenAI Authentication Error: {e.message} (Status: {e.status_code}, Body: {e.body})"
        )
        user_error_message = "Error: Invalid OpenAI API key or insufficient quota."
        # e.status_code is guaranteed and should be 401
        return (
            jsonify(
                {"response": user_error_message, "timestamp": time.strftime("%H:%M")}
            ),
            e.status_code,
        )

    except openai.APIStatusError as e:
        # Handles other OpenAI API errors that come with a status code
        app.logger.error(
            f"OpenAI API Status Error: {e.message} (Status: {e.status_code}, Type: {e.type}, Body: {e.body})"
        )
        # e.message and e.status_code are guaranteed here
        user_error_message = f"OpenAI API Error: {e.message}"
        return (
            jsonify(
                {"response": user_error_message, "timestamp": time.strftime("%H:%M")}
            ),
            e.status_code,
        )

    except openai.APIError as e:
        # Handles other OpenAI API errors (e.g., connection issues, or errors without a status code but likely with a message)
        app.logger.error(
            f"OpenAI API Error: {e.message} (Type: {e.type if hasattr(e, 'type') else 'N/A'})"
        )
        # e.message is guaranteed here
        user_error_message = f"OpenAI API Error: {e.message}"
        # Default to 500 if this specific APIError doesn't have a status_code (less common)
        http_status_code = getattr(e, "status_code", 500)
        return (
            jsonify(
                {"response": user_error_message, "timestamp": time.strftime("%H:%M")}
            ),
            http_status_code,
        )

    except Exception as e:  # General fallback for any other unexpected errors
        app.logger.error(msg=f"Unexpected error during OpenAI API call: {str(e)}")
        user_error_message = (
            "An error occurred while communicating with the AI service."
        )
        # For truly generic exceptions, we don't assume .message or .status_code
        # str(e) is the safest way to get a string representation.
        return (
            jsonify(
                {"response": user_error_message, "timestamp": time.strftime("%H:%M")}
            ),
            500,  # Default to 500 for unexpected errors
        )


if __name__ == "__main__":
    app.run(debug=True)
    # app.run(debug=False, host='0.0.0.0', port=5000)
