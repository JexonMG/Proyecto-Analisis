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
