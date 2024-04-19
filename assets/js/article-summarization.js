document.addEventListener("keydown", handleKeyDown, false);

function handleKeyDown(event) {
  if ((event.ctrlKey || event.metaKey) && event.code === "Slash") {
    toggleSummarizationContainer();
  }
}

function toggleSummarizationContainer() {
  const container = document.getElementById("articleSummarizationContainer");
  if (container) {
    container.classList.toggle("hidden");
    fetchAndDisplaySummary();
  } else {
    console.error("Summarization container not found");
  }
}

function fetchAndDisplaySummary() {
  const articleContent = document.getElementById("articleContent");
  if (!articleContent) {
    console.error("Article content element not found");
    return;
  }

  const articleText = articleContent.innerText;
  console.log("Article Text:", articleText);

  fetch("https://summarization-1-lc4762co7a-uc.a.run.app", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ context: articleText }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => updateUIWithSummary(data.summarization))
    .catch((error) => {
      console.error("Error:", error);
      showErrorInUI();
    });
}

function updateUIWithSummary(summaryText) {
  const outputContainer = document.getElementById("articleSummaryOutput");
  if (!outputContainer) {
    console.error("Summary output container not found");
    return;
  }
  outputContainer.innerHTML = ""; // Clear previous summaries
  const summaryParagraph = document.createElement("p");
  summaryParagraph.innerText = summaryText;
  outputContainer.appendChild(summaryParagraph);
  outputContainer.classList.remove("animate-pulse"); // Remove the 'animate-pulse' class
}

function showErrorInUI() {
  const outputContainer = document.getElementById("articleSummaryOutput");
  if (outputContainer) {
    outputContainer.innerHTML =
      "<p>Error generating summary. Please try again later.</p>";
  }
}
