// Get DOM elements
const messagesContainer = document.getElementById("chat-messages");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const apiKeyInput = document.getElementById("api-key-input");
const toggleApiKeyButton = document.getElementById("toggle-api-key");
const modelSelect = document.getElementById("model-select");
const saveSettingsButton = document.getElementById("save-settings");

// Toggle API key visibility
toggleApiKeyButton.addEventListener("click", function () {
  if (apiKeyInput.type === "password") {
    apiKeyInput.type = "text";
    toggleApiKeyButton.textContent = "🔒";
  } else {
    apiKeyInput.type = "password";
    toggleApiKeyButton.textContent = "👁️";
  }
});

// Initialize settings
document.addEventListener("DOMContentLoaded", function () {
  // Set timestamp
  const initialTimestamp = document.getElementById("initial-timestamp");
  initialTimestamp.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  // Set API key and model
  let apiKey = "";
  let selectedModel = "gpt-3.5-turbo";
});

// Add message to chat
function addMessage(content, isUser = false) {
  if (!content) return;

  // Create message container
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user-message" : "bot-message"}`;

  // Create avatar
  const avatar = document.createElement("div");
  if (!isUser) {
    avatar.className = "avatar bot-avatar";
    avatar.textContent = "🤖";
    messageDiv.appendChild(avatar);
  }

  // Create content and append message
  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.textContent = content;

  messageDiv.appendChild(messageContent);
  messagesContainer.appendChild(messageDiv);

  // Create timestamp
  const timestamp = document.createElement("div");
  timestamp.className = "timestamp";
  timestamp.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  messagesContainer.appendChild(timestamp);

  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add thinking indicator
function addThinkingIndicator() {
  const thinking = document.createElement("div");
  thinking.className = "thinking";
  thinking.innerHTML = `
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
      `;
  messagesContainer.appendChild(thinking);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  return thinking;
}

// Send message
async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  apiKey = apiKeyInput.value.trim();
  selectedModel = modelSelect.value;

  if (!apiKey) {
    addMessage("Please enter your OpenAI API key.", false);
    return;
  }

  // Add user message
  addMessage(message, true);
  messageInput.value = "";

  // Add thinking indicator
  const thinking = addThinkingIndicator();

  // Message to server
  try {
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        api_key: apiKey,
        model: selectedModel,
      }),
    });

    const data = await response.json();

    // Remove thinking indicator
    thinking.remove();

    // Add bot response
    addMessage(data.response);
  } catch (error) {
    thinking.remove();
    addMessage("Sorry, I encountered an error. Please try again.");
  }
}

// Message send event listener
sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});
