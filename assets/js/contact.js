const form = document.querySelector(".contact-form");

const nameField = document.getElementById("contact-name");
const emailField = document.getElementById("contact-email");
const messageField = document.getElementById("contact-message");

function setError(input, message) {
    const fieldWrapper = input.closest(".contact-field");
    const errorBox = fieldWrapper.querySelector(".field-error");

    if (message) {
    fieldWrapper.classList.add("error");
    errorBox.textContent = message;
    } else {
    fieldWrapper.classList.remove("error");
    errorBox.textContent = "";
    }
}

function validateEmail(value) {
    // simple, standard email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value);
}

form.addEventListener("submit", (e) => {
    e.preventDefault(); // only submit if everything is valid

    let isValid = true;

    // Name: required
    const nameValue = nameField.value.trim();
    if (!nameValue) {
    setError(nameField, "Please enter your name.");
    isValid = false;
    } else {
    setError(nameField, "");
    }

    // Email: required + valid format
    const emailValue = emailField.value.trim();
    if (!emailValue) {
    setError(emailField, "Please enter your email.");
    isValid = false;
    } else if (!validateEmail(emailValue)) {
    setError(emailField, "Please enter a valid email address.");
    isValid = false;
    } else {
    setError(emailField, "");
    }

    // Message: required
    const messageValue = messageField.value.trim();
    if (!messageValue) {
    setError(messageField, "Please enter a message.");
    isValid = false;
    } else {
    setError(messageField, "");
    }

    if (!isValid) {
    e.preventDefault();  // stop submission
    return;
    } else {
    form.submit(); // proceed with form submission
    form.reset(); // reset form after submission
    }
});

// Live validation cleanup as user types
[nameField, emailField, messageField].forEach((input) => {
    input.addEventListener("input", () => {
    // clear error as soon as the field becomes valid
    if (input === emailField) {
        const val = input.value.trim();
        if (val && validateEmail(val)) {
        setError(input, "");
        }
    } else {
        if (input.value.trim()) {
        setError(input, "");
        }
    }
    });
});