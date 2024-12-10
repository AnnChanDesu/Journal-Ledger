class Authentication {
    constructor() {
        this.users = []; // Store registered users
    }

    register(username, password) {
        // Check if the username already exists
        if (this.users.find(user => user.username === username)) {
            alert("Username already exists.");
            return;
        }

        // Add the new user to the users list
        this.users.push({ username, password });
        alert("Registration successful! You can now log in.");

        // Switch to login form after successful registration
        this.showLoginForm();
    }

    login(username, password) {
        const user = this.users.find(user => user.username === username && user.password === password);
        if (user) {
            localStorage.setItem("isLoggedIn", "true");
            this.showJournalApp();
        } else {
            alert("Invalid login credentials.");
        }
    }

    logout() {
        localStorage.removeItem("isLoggedIn");
        this.showHomepage();
    }

    showJournalApp() {
        document.getElementById("homepage").classList.add("hidden");
        document.getElementById("journalApp").classList.remove("hidden");
    }

    showHomepage() {
        document.getElementById("journalApp").classList.add("hidden");
        document.getElementById("homepage").classList.remove("hidden");
    }

    showLoginForm() {
        // Hide the registration section and show the login form
        document.getElementById("registerSection").classList.add("hidden");
        document.getElementById("loginSection").classList.remove("hidden");
        // Hide the "Back to Login" button after registration
        document.getElementById("backToLogin").classList.add("hidden");
    }

    showRegisterForm() {
        // Show the registration form and hide the login form
        document.getElementById("loginSection").classList.add("hidden");
        document.getElementById("registerSection").classList.remove("hidden");
        // Show the "Back to Login" button
        document.getElementById("backToLogin").classList.remove("hidden");
    }
}

// Instantiate the Authentication class
const auth = new Authentication();

// Event Listeners for Login and Registration
document.getElementById("registerButton").addEventListener("click", () => {
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    // Ensure that both fields are filled in before registering
    if (username.trim() && password.trim()) {
        auth.register(username, password);
    } else {
        alert("Please enter a username and password.");
    }
});

document.getElementById("loginButton").addEventListener("click", () => {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    // Ensure both fields are filled in before attempting login
    if (username.trim() && password.trim()) {
        auth.login(username, password);
    } else {
        alert("Please enter your username and password.");
    }
});

document.getElementById("logoutButton").addEventListener("click", () => {
    auth.logout();
});

document.getElementById("backToLogin").addEventListener("click", () => {
    auth.showLoginForm(); // Show the login form when clicking the "Back to Login" button
});

// On page load, show the registration form by default
document.addEventListener("DOMContentLoaded", () => {
    auth.showRegisterForm(); // Start with the registration form
});
