# app.py
from typing import Any, Literal
from flask import Flask, Response, request, jsonify, render_template
from flask_cors import CORS
import time
from openai import OpenAI
from dotenv import load_dotenv
from openai.types.chat.chat_completion import ChatCompletion

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
def chat() -> Response:
    data: Any | None = request.json
    user_message: Any | Literal[""] = data.get("message", "") if data else ""

    # Create Chat Completion
    completion: ChatCompletion = client.chat.completions.create(
        model="gpt-4.1-nano-2025-04-14",
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


if __name__ == "__main__":
    app.run(debug=True)
