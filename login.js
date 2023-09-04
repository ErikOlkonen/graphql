import { fetchUserData } from "/static/fetch.js";

export async function loginUser() {

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const credentials = `${username}:${password}`;
    const base64Credentials = btoa(credentials);

    try {
        const response = await fetch("https://01.kood.tech/api/auth/signin", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${base64Credentials}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {

            document.getElementById('error-message').textContent = ' ';

            const data = await response.json();

            // Store JWT token securely (e.g., in a cookie or local storage)
            localStorage.setItem('JWT', data);

            // Add a CSS class to hide the login form
            document.getElementById('login-form').classList.add('hidden');

            // Update the welcome message with the user's name
            const welcomeMessage = document.getElementById('welcome-message');
            const userNameElement = document.getElementById('user-name');
            userNameElement.textContent = username;

            // Display the welcome message
            welcomeMessage.classList.remove('hidden');

            return true; // Indicate successful login

        } else {
            document.getElementById('error-message').textContent = 'Invalid credentials';

            return false; // Indicate failed login
        }
    } catch (error) {
        document.getElementById('error-message').textContent = 'An error occurred';

        return false; // Indicate failed login due to error
    }
}