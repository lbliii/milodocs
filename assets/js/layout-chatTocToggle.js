document.addEventListener("DOMContentLoaded", function (event) {
  const chatTocToggle = document.getElementById("chatTocToggle");
  const chatContainer = document.getElementById("chatContainer");
  const tocContainer = document.getElementById("tocContainer");
  const chatRobot = document.getElementById("chatRob");
  const chatToc = document.getElementById("chatToc");

  // Check if chatTocSettings in user's local storage is set; if not set or value is 'chat', toggle hidden on chatContainer; if value is 'toc', toggle the tocContainer
  const chatTocSettings = localStorage.getItem("chatTocSettings");
  if (chatTocSettings === null || chatTocSettings === "chat") {
    chatContainer.classList.remove("hidden");
    tocContainer.classList.add("hidden");
  } else if (chatTocSettings === "toc") {
    chatContainer.classList.add("hidden");
    tocContainer.classList.remove("hidden");
  }

  // Update the button content based on the visibility of chatContainer
  updateButtonContent();

  // Add a click event listener to the chatTocToggle button
  chatTocToggle.addEventListener("click", function () {
    // Toggle both the chatContainer and tocContainer visibility
    chatContainer.classList.toggle("hidden");
    tocContainer.classList.toggle("hidden");

    // Update the preference and button content based on the visibility of chatContainer
    if (!chatContainer.classList.contains("hidden")) {
      localStorage.setItem("chatTocSettings", "chat");
    } else {
      localStorage.setItem("chatTocSettings", "toc");
    }

    // Update the button content after toggling
    updateButtonContent();
  });

  // Function to update the button content based on the visibility of chatContainer
  function updateButtonContent() {
    const isChatVisible = !chatContainer.classList.contains("hidden");

    if (isChatVisible) {
      chatRobot.classList.remove("hidden");
      chatToc.classList.add("hidden");
    } else {
      chatRobot.classList.add("hidden");
      chatToc.classList.remove("hidden");
    }
  }
});
