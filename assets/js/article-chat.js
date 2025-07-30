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
  // Create loading bubble
  const loadingBubble = createLoadingBubble();
  addChatBubble(loadingBubble, "bot");
  
  try {
    const response = await fetch(
      `https://chat-2-lc4762co7a-uc.a.run.app//?query=${encodeURIComponent(
        question
      )}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(30000)
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.answer || "Sorry, I could not fetch the answer.";
    
    // Remove loading bubble
    loadingBubble.remove();
    
    // Add actual response with typing animation
    const botBubble = createChatBubble(answer, "bot");
    addChatBubble(botBubble, "bot");
    animateTyping(botBubble);
    
    // Announce to screen readers
    if (window.announceToScreenReader) {
      window.announceToScreenReader(`AI response: ${answer.substring(0, 100)}...`);
    }
    
  } catch (error) {
    console.error('Chat error:', error);
    loadingBubble.remove();
    
    let errorMessage = "Sorry, I'm having trouble connecting. Please try again later.";
    if (error.name === 'TimeoutError') {
      errorMessage = "Request timed out. Please try again with a shorter question.";
    } else if (!navigator.onLine) {
      errorMessage = "You appear to be offline. Please check your connection.";
    }
    
    const errorBubble = createChatBubble(errorMessage, "bot", "error");
    addChatBubble(errorBubble, "bot");
    
    // Show retry button
    addRetryButton(question, productFilter);
  }
}

function createLoadingBubble() {
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble bot p-2 rounded-lg text-black font-regular text-sm";
  bubble.innerHTML = `
    <div class="flex items-center space-x-2">
      <div class="animate-spin h-4 w-4 border-2 border-brand border-t-transparent rounded-full"></div>
      <span>Thinking...</span>
    </div>
  `;
  return bubble;
}

function animateTyping(bubble) {
  const text = bubble.innerText;
  bubble.innerText = '';
  let i = 0;
  
  const typeInterval = setInterval(() => {
    bubble.innerText += text.charAt(i);
    i++;
    if (i >= text.length) {
      clearInterval(typeInterval);
    }
  }, 20);
}

function addRetryButton(question, productFilter) {
  const chatMessages = document.getElementById("chat-messages");
  const retryContainer = document.createElement("div");
  retryContainer.className = "flex justify-center my-2";
  
  const retryButton = document.createElement("button");
  retryButton.className = "px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-1 transition duration-300";
  retryButton.innerText = "Retry";
  retryButton.addEventListener("click", () => {
    retryContainer.remove();
    fetchAnswer(question, productFilter);
  });
  
  retryContainer.appendChild(retryButton);
  chatMessages.appendChild(retryContainer);
}

function createChatBubble(text, sender, type = "normal") {
  const bubble = document.createElement("div");
  let baseClasses = `chat-bubble ${sender} p-2 rounded-lg ${
    sender === "user" ? "font-bold text-md" : "font-regular text-sm"
  }`;
  
  // Add appropriate styling based on type and sender
  if (type === "error") {
    baseClasses += " bg-red-100 border border-red-300 text-red-700";
  } else if (sender === "user") {
    baseClasses += " bg-brand text-white ml-auto max-w-xs md:max-w-md";
  } else {
    baseClasses += " bg-zinc-100 text-black mr-auto max-w-xs md:max-w-md";
  }
  
  bubble.className = baseClasses;
  bubble.innerText = text;
  
  // Add accessibility attributes
  bubble.setAttribute('role', sender === 'bot' ? 'log' : 'status');
  bubble.setAttribute('aria-live', 'polite');
  
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
