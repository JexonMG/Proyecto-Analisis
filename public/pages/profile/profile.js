document.addEventListener('DOMContentLoaded', function() {
    // Obtener datos del usuario parseando correctamente desde localStorage
    const userData = JSON.parse(localStorage.getItem('user'));
    
    // Verificar si el usuario está autenticado
    if (!userData) {
        window.location.href = '/pages/index/index.html';
        return;
    }

    // Elementos del DOM
    const profilePhoto = document.getElementById('profilePhoto');
    const userName = document.getElementById('userName');
    const userCarnet = document.getElementById('userCarnet');
    const userCareer = document.getElementById('userCareer');
    const userSchedule = document.getElementById('userSchedule');
    const btnEdit = document.getElementById('btnEdit');
    const btnLogout = document.getElementById('btnLogout');

    // Cargar datos del usuario
    loadUserData(userData);

    // Event listeners para botones
    btnEdit.addEventListener('click', function() {
        window.location.href = `edit-profile.html?id=${userData.id}`; // Asumiendo que el objeto user tiene un id
    });

    btnLogout.addEventListener('click', function() {
        localStorage.removeItem('user');
        window.location.href = '/pages/index/index.html';
    });

    // Función para cargar datos del usuario
    function loadUserData(user) {
        userName.textContent = user.username; // Cambiado de 'username' a 'nombre' para coincidir con datos típicos en español
        userCarnet.textContent = user.carnetNumber;
        userCareer.textContent = user.career;
        userSchedule.textContent = user.schedule;
        
        if (user.profileImage) {
            profilePhoto.src = user.profileImage;
        }
    }
});