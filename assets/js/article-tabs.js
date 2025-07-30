document.addEventListener("DOMContentLoaded", function(event) {
    var tabs = document.querySelectorAll('[data-component="tabs"]');
    
    if (tabs.length > 0) {
        console.log("tabs ", tabs)

        tabs.forEach(function(tab) {
            // get each child step element with the data-tab-id attribute
            let options = tab.querySelectorAll('[data-tab-id]');
            let optionContent = tab.querySelectorAll('[data-tabcontent]');  // Changed to lowercase 'c'
            
            // Initialize: ensure at least one tab is active if none are
            const activeButtons = tab.querySelectorAll('button.bg-brand');
            if (activeButtons.length === 0) {
                const firstButton = tab.querySelector('button[data-tab-option]');
                if (firstButton) {
                    firstButton.classList.remove('bg-white', 'text-black');
                    firstButton.classList.add('bg-brand', 'text-white');
                }
            }
            
            getAnswers({tab, optionContent}) 
            // listen for click on button elements within each step
            options.forEach((option) => {
                // get all of the buttons within the step
                let buttons = option.querySelectorAll('button')

                // listen for click on each button
                buttons.forEach((button) => {
                    button.addEventListener('click', (e) => {
                        // add green class to the clicked button
                        e.target.classList.remove('bg-white', 'text-black')
                        e.target.classList.add('bg-brand', 'text-white')
                        // remove green class from the other buttons
                        buttons.forEach((button) => {
                            if (button !== e.target) {
                                button.classList.remove('bg-brand', 'text-white')
                                button.classList.add('bg-white', 'text-black')
                            }
                        })

                        getAnswers({tab, optionContent})
                    })
                }) 
            })
        });

        function getAnswers({tab, optionContent}){
            // get all buttons with the green class
            let activeButtons = tab.querySelectorAll('button.bg-brand')

            // get the data-tab-option attribute of all the buttons with the green class
            let activeButtonOptions = [] 

            activeButtons.forEach((button) => {
                const tabOption = button.getAttribute('data-tab-option');
                if (tabOption) {
                    activeButtonOptions.push(tabOption);
                }
            })

            console.log("activeButtonOptions ", activeButtonOptions)

            let convertedText = activeButtonOptions.join('/').toLowerCase()
            console.log("convertedText: ", convertedText)

            // hide all other answers
            optionContent.forEach((content) => {
                let value = content.getAttribute('data-tabcontent')  
                console.log(`Checking content: value="${value}" vs convertedText="${convertedText}"`)
                if (value !== convertedText) {
                    content.classList.add('hidden')
                } else {
                    content.classList.remove('hidden')
                    console.log("Showing content for:", value)
                }
            })
        }
    }
});
