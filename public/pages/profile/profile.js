document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});

// Function to load the user profile page
function initializePage() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        window.location.href = '/index.html';
        return;
    }

    document.getElementById('userName').textContent = user.name;
    document.getElementById('userEmail').textContent = user.email;
    if (user.profileImage) {
        document.querySelector('.profile-image').src = user.profileImage;
    }
    generateQRCode();
}


function setupLogoutButton() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear user data from localStorage
            localStorage.removeItem('user');
            
            // Optionally, you can clear other related localStorage items
            // localStorage.removeItem('token');
            
            // Redirect to login page
            window.location.href = '/index.html';
        });
    }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    setupLogoutButton();
    initializePage();
});