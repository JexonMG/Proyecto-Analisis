document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});

// Function to load the admin page
function initializePage() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || user.role !== 'admin') {
        window.location.href = '/index.html';
        return;
    }

    loadUsers();
}
