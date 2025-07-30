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
    const codeBlock = buttonElement.parentElement.querySelector('code');
    if (!codeBlock) {
        console.error('Code block not found');
        return;
    }

    const text = codeBlock.textContent;
    
    // Use modern Clipboard API with fallback
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showCopySuccess(buttonElement);
        }).catch(err => {
            console.error('Failed to copy code: ', err);
            showCopyError(buttonElement);
        });
    } else {
        // Fallback for older browsers
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                showCopySuccess(buttonElement);
            } else {
                showCopyError(buttonElement);
            }
        } catch (err) {
            console.error('Fallback copy failed: ', err);
            showCopyError(buttonElement);
        }
    }
}

function showCopySuccess(buttonElement) {
    const originalContent = buttonElement.innerHTML;
    
    // Visual feedback
    buttonElement.innerHTML = '✅ Copied!';
    buttonElement.classList.add('bg-green-600');
    buttonElement.classList.remove('bg-zinc-600');
    
    // Show notification if available
    if (window.MiloUX) {
        window.MiloUX.showNotification('Code copied to clipboard!', 'success', 2000);
    }
    
    // Reset after delay
    setTimeout(() => {
        buttonElement.innerHTML = originalContent;
        buttonElement.classList.remove('bg-green-600');
        buttonElement.classList.add('bg-zinc-600');
    }, 2000);
}

function showCopyError(buttonElement) {
    const originalContent = buttonElement.innerHTML;
    
    // Error feedback
    buttonElement.innerHTML = '❌ Failed';
    buttonElement.classList.add('bg-red-600');
    buttonElement.classList.remove('bg-zinc-600');
    
    // Show notification if available
    if (window.MiloUX) {
        window.MiloUX.showNotification('Failed to copy code', 'error', 3000);
    }
    
    // Reset after delay
    setTimeout(() => {
        buttonElement.innerHTML = originalContent;
        buttonElement.classList.remove('bg-red-600');
        buttonElement.classList.add('bg-zinc-600');
    }, 3000);
}
