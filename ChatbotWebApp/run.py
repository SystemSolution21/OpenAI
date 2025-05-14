# app.py
from typing import Any, Literal
from flask import Flask, Response, request, jsonify, render_template
from flask_cors import CORS
import time
from openai import OpenAI
from dotenv import load_dotenv
from openai.types.chat.chat_completion import ChatCompletion

# Constants
DEFAULT_MODEL = "gpt-4.1-nano-2025-04-14"

# Initialize App
app = Flask(import_name=__name__, static_folder="static", template_folder="templates")
CORS(app=app)

# Load Environment Variables for API KEY
load_dotenv()

# Initialize Chat
client = OpenAI()


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

    # Use the provided API key
    client = OpenAI(api_key=api_key)

    try:
        # Create Chat Completion with the selected model
        completion: ChatCompletion = client.chat.completions.create(
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
    except Exception as e:
        return (
            jsonify(
                {
                    "response": f"Error: {str(object=e)}",
                    "timestamp": time.strftime("%H:%M"),
                }
            ),
            500,
        )


if __name__ == "__main__":
    app.run(debug=True)
