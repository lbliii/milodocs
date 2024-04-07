document.addEventListener('DOMContentLoaded', function() {
    loadChatHistory();

    // Add event listener to the form
    const form = document.getElementById('chat-form');
    if (form) {
        form.addEventListener('submit', submitQuestion);
    }

    const clearAllButton = document.getElementById('clearAll');
    if (clearAllButton) {
        clearAllButton.addEventListener('click', clearConversation);
    }
});
 
 
 // Define a function to handle form submission
 function submitQuestion(event) {
    event.preventDefault();
    const questionInput = document.getElementById('question');
    const questionText = questionInput.value.trim();
    if (!questionText) return;  // Exit if the question is empty
    questionInput.value = '';  // Clear the input field
    addChatBubble(questionText, 'user');
    fetchAnswer(questionText);
}

// Define a function to fetch answer from the API
async function fetchAnswer(question) {
    const response = await fetch(`https://milodocs-lc4762co7a-uc.a.run.app/?query=${encodeURIComponent(question)}`);
    const data = await response.json();
    const answer = data.answer || 'Sorry, I could not fetch the answer.';
    addChatBubble(answer, 'bot');
}

// Define a function to add chat bubble
function addChatBubble(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    let pair = chatMessages.lastElementChild;
    if (!pair || !pair.classList.contains('chat-pair') || sender === 'user') {
        pair = document.createElement('div');
        pair.className = 'chat-pair bg-zinc-100 flex flex-col  my-2 p-2 rounded-lg';
        chatMessages.appendChild(pair);
    }
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender} p-2 rounded-lg text-black ${sender === 'user' ? 'font-brand-bold' : 'font-brand-regular'}`;
    bubble.innerText = text;
    pair.appendChild(bubble);
    if (sender === 'user') {
        bubble.classList.add('animate-pulse');  // Add pulsing animation to user bubble
    } else {
        const userBubble = pair.querySelector('.user');
        if (userBubble) userBubble.classList.remove('animate-pulse');  // Remove pulsing animation when bot responds
        const deleteButtonWrapper = document.createElement('div');
        deleteButtonWrapper.className = 'w-full flex justify-end';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'w-fit p-2 rounded bg-zinc-200 text-xs lowercase hover:bg-red-600 hover:text-white transition duration-300 text-black';
        deleteButton.innerText = 'Delete';
        deleteButton.addEventListener('click', () => {
            chatMessages.removeChild(pair);
            saveChatHistory();
        });

        deleteButtonWrapper.appendChild(deleteButton);
        pair.appendChild(deleteButtonWrapper);
    }
    
    // Scroll to the bottom of the chat container
    chatMessages.scrollTop = chatMessages.scrollHeight;

    saveChatHistory();
}

// Define a function to clear conversation
function clearConversation() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    saveChatHistory();
}

// Define a function to save chat history
function saveChatHistory() {
    const chatMessages = Array.from(document.getElementById('chat-messages').children);
    const chatHistory = chatMessages.map(pair => {
        const bubbles = Array.from(pair.children);
        const texts = bubbles.map(bubble => bubble.innerText);
        return {
            user: texts[0],
            bot: texts[1]
        };
    });
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

// Define a function to load chat history
function loadChatHistory() {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory'));
    if (chatHistory) {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = '';  // Clear any existing messages
        for (const pair of chatHistory) {
            addChatBubble(pair.user, 'user');
            addChatBubble(pair.bot, 'bot');
        }
    }
}

// Load chat history on page load
document.addEventListener('DOMContentLoaded', loadChatHistory);
