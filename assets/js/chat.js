document.addEventListener("DOMContentLoaded", function () {
  loadChatHistory();
  setupEventListeners();
});

function setupEventListeners() {
  const form = document.getElementById("chat-form");
  form?.addEventListener("submit", submitQuestion);

  const clearAllButton = document.getElementById("clearAll");
  clearAllButton?.addEventListener("click", clearConversation);
}

function submitQuestion(event) {
  event.preventDefault();
  const questionInput = document.getElementById("question");
  const questionText = questionInput.value.trim();
  const productFilter = document
    .getElementById("chatContainer")
    .getAttribute("data-productFilter");

  if (questionText) {
    questionInput.value = "";
    const userBubble = createChatBubble(questionText, "user");
    addChatBubble(userBubble, "user");
    fetchAnswer(questionText, productFilter);
  }
}

async function fetchAnswer(question, productFilter) {
  const response = await fetch(
    `https://chat-2-lc4762co7a-uc.a.run.app//?query=${encodeURIComponent(
      question
    )}&productFilter=${encodeURIComponent(productFilter)}`
  );
  const data = await response.json();
  const answer = data.answer || "Sorry, I could not fetch the answer.";
  const botBubble = createChatBubble(answer, "bot");
  addChatBubble(botBubble, "bot");
}

function createChatBubble(text, sender) {
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender} p-2 rounded-lg text-black ${
    sender === "user" ? "font-bold" : "font-regular text-sm"
  }`;
  bubble.innerText = text;
  return bubble;
}

function addChatBubble(bubble, sender) {
  const chatMessages = document.getElementById("chat-messages");
  let pair = chatMessages.lastElementChild;
  if (!pair || !pair.classList.contains("chat-pair") || sender === "user") {
    pair = document.createElement("div");
    pair.className = "chat-pair bg-zinc-100 flex flex-col my-2 p-2 rounded-lg";
    chatMessages.appendChild(pair);
  }
  pair.appendChild(bubble);
  handleAnimationsAndCleanup(bubble, sender, pair, chatMessages);
  saveChatHistory();
}

function handleAnimationsAndCleanup(bubble, sender, pair, chatMessages) {
  if (sender === "user") {
    bubble.classList.add("animate-pulse");
  } else {
    const userBubble = pair.querySelector(".user");
    userBubble?.classList.remove("animate-pulse");
    appendDeleteButton(pair, chatMessages);
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendDeleteButton(pair, chatMessages) {
  const deleteButtonWrapper = document.createElement("div");
  deleteButtonWrapper.className = "w-full flex justify-end";

  const deleteButton = document.createElement("button");
  deleteButton.className =
    "w-fit p-2 rounded bg-zinc-200 text-xs lowercase hover:bg-red-600 hover:text-white transition duration-300 text-black";
  deleteButton.innerText = "Delete";
  deleteButton.addEventListener("click", () => {
    chatMessages.removeChild(pair);
    saveChatHistory();
  });

  deleteButtonWrapper.appendChild(deleteButton);
  pair.appendChild(deleteButtonWrapper);
}

function clearConversation() {
  document.getElementById("chat-messages").innerHTML = "";
  saveChatHistory();
}

function saveChatHistory() {
  const chatMessages = Array.from(
    document.getElementById("chat-messages").children
  );
  const chatHistory = chatMessages.map((pair) => {
    const bubbles = Array.from(pair.children);
    const texts = bubbles.map((bubble) => bubble.innerText);
    return { user: texts[0], bot: texts[1] };
  });
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

function loadChatHistory() {
  const chatHistory = JSON.parse(localStorage.getItem("chatHistory"));
  const chatMessages = document.getElementById("chat-messages");
  chatMessages.innerHTML = "";

  if (!chatHistory || chatHistory.length === 0) {
    // Add initial Q&A if no history exists
    addQAInitialPair(
      "How do I use this chat?",
      "Ask a question about the MiloDocs Hugo Theme. You can also toggle the Robot icon in the navigation bar to switch to a Table of Contents view."
    );
  } else {
    // Load existing chat history
    chatHistory.forEach((pair) => {
      const userBubble = createChatBubble(pair.user, "user");
      addChatBubble(userBubble, "user");
      const botBubble = createChatBubble(pair.bot, "bot");
      addChatBubble(botBubble, "bot");
    });
  }
}

function addQAInitialPair(question, answer) {
  // Manually add question and answer bubbles to simulate a previous conversation
  const userBubble = createChatBubble(question, "user");
  addChatBubble(userBubble, "user");
  const botBubble = createChatBubble(answer, "bot");
  addChatBubble(botBubble, "bot");
}
