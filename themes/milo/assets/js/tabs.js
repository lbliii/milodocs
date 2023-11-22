document.addEventListener("DOMContentLoaded", function(event) {
    if (document.querySelectorAll('[data-component="tabs"]')) {
        var tabs = document.querySelectorAll('[data-component="tabs"]');

        console.log("tabs ", tabs)

        tabs.forEach(function(tab) {
            // get each child step element with the data-wizard-id attribute
            let options = tab.querySelectorAll('[data-tab-id]');
            let optionContent = tab.querySelectorAll('[data-tabcontent]');  // Changed to lowercase 'c'
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

            console.log("activeButtonOptions ", activeButtonOptions)

            activeButtons.forEach((button) => {
                console.log("activeButton ", button)
                activeButtonOptions.push(button.getAttribute('data-tab-option'))  // Changed to data-tab-option
            })

            console.log("activeButtonOptions ", activeButtonOptions)

            let convertedText = activeButtonOptions.join('/').toLowerCase()

            // hide all other answers
            optionContent.forEach((content) => {
                let value = content.getAttribute('data-tabcontent')  
                console.log(`value: ` + value)
                console.log(`convertedText: ` + convertedText)
                if (value !== convertedText) {
                    content.classList.add('hidden')
                } else {
                    content.classList.remove('hidden')
                }
            })
        }
    }
});
