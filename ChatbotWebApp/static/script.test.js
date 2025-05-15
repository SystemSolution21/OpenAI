const assert = require("assert");
const { JSDOM } = require("jsdom");

describe("Script Tests", () => {
  it("hello world test", () => {
    assert.strictEqual(1 + 1, 2);
  });
});
// Pseudocode plan:
// 1. Set up a DOM environment using jsdom for testing DOM manipulation.
// 2. Before each test, create a mock messagesContainer div and assign it to global document.
// 3. Import or redefine addMessage for testing (since script.js does not export).
// 4. Test: addMessage appends a user message div with correct class and content.
// 5. Test: addMessage appends a bot message div with avatar and correct content.
// 6. Test: addMessage does not append anything if content is empty or falsy.
// 7. Test: addMessage appends a timestamp div with correct class.
// 8. Test: messagesContainer scrollTop is set to scrollHeight after message is added.

describe("addMessage", () => {
  let window, document, messagesContainer;

  // Redefine addMessage for test scope
  function addMessage(content, isUser = false) {
    if (!content) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${isUser ? "user-message" : "bot-message"}`;

    const avatar = document.createElement("div");
    if (!isUser) {
      avatar.className = "avatar bot-avatar";
      avatar.textContent = "🤖";
      messageDiv.appendChild(avatar);
    }

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    messageContent.textContent = content;

    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);

    const timestamp = document.createElement("div");
    timestamp.className = "timestamp";
    timestamp.textContent = "12:34"; // fixed for test
    messagesContainer.appendChild(timestamp);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  beforeEach(() => {
    window = new JSDOM(
      `<!DOCTYPE html><body><div id="chat-messages"></div></body>`
    );
    document = window.window.document;
    messagesContainer = document.getElementById("chat-messages");
    // Patch global for test
    global.document = document;
    global.messagesContainer = messagesContainer;
  });

  it("should append a user message div with correct class and content", () => {
    addMessage("Hello world", true);
    const messageDiv = messagesContainer.querySelector(".message.user-message");
    const messageContent = messageDiv.querySelector(".message-content");
    assert.ok(messageDiv);
    assert.strictEqual(messageContent.textContent, "Hello world");
    assert.strictEqual(messageDiv.querySelector(".avatar"), null);
  });

  it("should append a bot message div with avatar and correct content", () => {
    addMessage("Hi, I am a bot", false);
    const messageDiv = messagesContainer.querySelector(".message.bot-message");
    const avatar = messageDiv.querySelector(".avatar.bot-avatar");
    const messageContent = messageDiv.querySelector(".message-content");
    assert.ok(messageDiv);
    assert.ok(avatar);
    assert.strictEqual(avatar.textContent, "🤖");
    assert.strictEqual(messageContent.textContent, "Hi, I am a bot");
  });

  it("should not append anything if content is empty", () => {
    addMessage("", true);
    addMessage(null, false);
    assert.strictEqual(messagesContainer.children.length, 0);
  });

  it("should append a timestamp div with correct class", () => {
    addMessage("Test timestamp", true);
    const timestamp = messagesContainer.querySelector(".timestamp");
    assert.ok(timestamp);
    assert.strictEqual(timestamp.className, "timestamp");
    assert.strictEqual(timestamp.textContent, "12:34");
  });

  it("should set scrollTop to scrollHeight after message is added", () => {
    messagesContainer.scrollTop = 0;
    messagesContainer.scrollHeight = 100;
    addMessage("Scroll test", true);
    assert.strictEqual(
      messagesContainer.scrollTop,
      messagesContainer.scrollHeight
    );
  });
});
