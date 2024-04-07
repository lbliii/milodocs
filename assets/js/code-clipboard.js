document.addEventListener('DOMContentLoaded', function() {
    // Query all copy buttons
    const copyButtons = document.querySelectorAll('.copy-btn');

    // Attach click event listeners to each button
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            copyCodeToClipboard(this);
        });
    });
});

function copyCodeToClipboard(buttonElement) {
    // Assuming your actual code structure matches the button's positioning
    // and that '.previousElementSibling' correctly targets the container holding the code.
    const codeBlock = buttonElement.parentElement.querySelector('code');
    if (!codeBlock) {
        console.error('Code block not found');
        return;
    }

    // Proceed to copy the code to clipboard
    const textArea = document.createElement('textarea');
    textArea.value = codeBlock.textContent;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    // Optional: Provide feedback to the user
    buttonElement.textContent = 'Copied!';
    setTimeout(() => {
        buttonElement.textContent = 'Copy';
    }, 2000);
}
