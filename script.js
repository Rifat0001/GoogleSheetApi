async function fetchImages() {
    const url = 'https://docs.google.com/spreadsheets/d/1D-xP6tWfxsX3mYqjd20szmq9CRB1vEOLzZx9RzxMuGI/pubhtml?timestamp=' + new Date().getTime();

    try {
        const response = await fetch(url);
        const text = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const rows = doc.querySelectorAll('table tbody tr');

        const imageContainer = document.getElementById('choice-container');
        const imageUrls = [];

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach(cell => {
                const imgLink = cell.textContent.trim();
                if (imgLink) {
                    const imgElement = document.createElement('img');
                    imgElement.src = imgLink;
                    imgElement.style.maxWidth = '200px';
                    imgElement.style.height = 'auto';
                    imageContainer.appendChild(imgElement);

                    imageUrls.push(imgLink);
                }
            });
        });

        // Create the options array dynamically
        const options = imageUrls.map((imgSrc, index) => ({
            id: `option${index + 1}`,
            name: "Question 1", // Consider using actual question text
            imgSrc: imgSrc,
            label: `Option ${index + 1}`
        }));

        return { imageUrls, options };

    } catch (error) {
        console.error('Error fetching images:', error);
    }
}

fetchImages().then(data => {
    const imageUrls = data.imageUrls;
    const options = data.options;

    // Use imageUrls and options here
    console.log('Image URLs:', imageUrls);
    console.log('Options:', options);
    console.log('Data:', data);
    console.log('hi', options);
    // Function to shuffle an array
    // function shuffle(array) {
    //     for (let i = array.length - 1; i > 0; i--) {
    //         const j = Math.floor(Math.random() * (i + 1));
    //         [array[i], array[j]] = [array[j], array[i]];
    //     }
    // }

    // // Shuffle the options
    // shuffle(options);

    const choiceContainer = document.getElementById("choice-container");

    // Clear the container
    choiceContainer.innerHTML = "";

    // Append the shuffled options
    options.forEach(option => {
        const radioOptionDiv = document.createElement("div");
        radioOptionDiv.classList.add("radio-option");

        const label = document.createElement("label");

        const img = document.createElement("img");
        img.src = option.imgSrc;
        img.alt = option.label;
        img.style.maxWidth = "300px"; // Ensure images fit their container
        img.style.height = "400px";
        img.style.objectFit = true

        const input = document.createElement("input");
        input.type = "radio";
        input.id = option.id;
        input.name = "Question 1";
        input.value = option.label;

        // Append elements to the label
        label.appendChild(img);
        label.appendChild(document.createElement("br")); // Line break between image and radio button
        label.appendChild(input);
        label.appendChild(document.createTextNode(option.label));

        // Append label to the radio option container
        radioOptionDiv.appendChild(label);
        choiceContainer.appendChild(radioOptionDiv);
    });

});
document.addEventListener("DOMContentLoaded", function () {
    // Function to get URL parameters
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Get the participantId from the URL
    const participantId = getUrlParameter('participantId');

    // If participantId exists, fill the ID number field
    if (participantId) {
        const idNumberInput = document.getElementById('id-number');
        if (idNumberInput) {
            idNumberInput.value = participantId;
        }
    }

    const form = document.forms['survey-form'];
    const errorMessage = document.getElementById('error-message');
    const submitButton = document.getElementById('submit');

    // New validation function for show errors before the submission
    function validateForm() {
        errorMessage.textContent = ''; // Clear previous error message

        // Get form values
        const choice = form['Question 1'].value.trim();
        const why = form['Why?'].value.trim();
        const interest = form['Question 3'].value.trim();
        const buy = form['Question 4'].value.trim();
        const idNumber = form['ParticipantID'].value.trim();

        // Validate each field
        if (!choice) {
            errorMessage.textContent = 'Answer Question 01: book you like best';
            return false;
        } else if (!why) {
            errorMessage.textContent = 'Answer Question 02: why you chose this book.';
            return false;
        } else if (!interest) {
            errorMessage.textContent = 'Answer Question 03: your level of interest.';
            return false;
        } else if (!buy) {
            errorMessage.textContent = 'Answer Question 04: whether you buy books on Amazon.';
            return false;
        } else if (!idNumber) {
            errorMessage.textContent = 'Please enter your CloudResearch ID number.';
            return false;
        }

        return true;
    }

    // Modify the form submit event listener to include validation
    form.addEventListener('submit', e => {
        e.preventDefault();

        if (!validateForm()) {
            return; // Stop submission if validation fails
        }

        // Change button text to 'Submitting...' and disable the button
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;

        fetch('https://script.google.com/macros/s/AKfycbw7Ch0SoBS5_r_cOj0W34eVun-kuPyYEDQyREn_FBCjCAI4Xv8KCw0Pm2m3o_sPrPM/exec', {
            method: 'POST',
            body: new FormData(form)
        })
            .then(() => {
                // Redirect to thank you page after successful submission on the spreadsheet
                window.location.href = "thankyou.html";
            })
            .catch(error => {
                console.error('Error!', error.message);
                // Revert button text and re-enable the button if there's an error
                submitButton.textContent = 'Submit';
                submitButton.disabled = false;
            });
    });
});
