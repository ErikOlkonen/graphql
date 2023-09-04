// Log out function
export function logout() {
    localStorage.removeItem('JWT');
    updateUIForLoggedOut(); // Update UI after logout
}

// Update UI after logout
export function updateUIForLoggedOut() {
    // Hide the welcome message
    const welcomeMessage = document.getElementById('welcome-message');
    welcomeMessage.classList.add('hidden');

    // Show the login form
    const loginForm = document.getElementById('login-form');
    loginForm.classList.remove('hidden');

    const userData = document.getElementById('user-data')
    userData.innerHTML = ''; // Clear the userDataDiv

    // const svg = document.getElementById("graph-container");
    const svg = document.getElementById("graph-container")
    // svg.innerHTML = '';
    svg.style.display = 'none';

    // Clear any other user-related UI elements as needed!
}