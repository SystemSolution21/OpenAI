//
const messagesContainer = document.getElementById("chat-messages");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");

//
function addMessage(content, isUser = false) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${isUser ? "user-message" : "bot-message"}`;

  const avatar = document.createElement("div");
  avatar.className = `avatar ${isUser ? "user-avatar" : "bot-avatar"}`;
  avatar.textContent = isUser ? "You" : "🤖";

  const messageContent = document.createElement("div");
  messageContent.className = "message-content";
  messageContent.textContent = content;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(messageContent);
  messagesContainer.appendChild(messageDiv);

  const timestamp = document.createElement("div");
  timestamp.className = "timestamp";
  timestamp.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  messagesContainer.appendChild(timestamp);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

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

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  // Add user message
  addMessage(message, true);
  messageInput.value = "";

  // Add thinking indicator
  const thinking = addThinkingIndicator();

  try {
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
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

sendButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});
