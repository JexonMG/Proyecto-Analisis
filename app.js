document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data));
            
            if (data.role === 'admin') {
                window.location.href = '/admin.html';
            } else {
                window.location.href = '/profile.html';
            }
        } else {
            document.getElementById('error-message').textContent = data.message;
        }
    } catch (error) {
        document.getElementById('error-message').textContent = 'Error al conectar con el servidor';
    }
});

// Función para generar código QR
function generateQRCode() {
    const qrcode = new QRCode(document.getElementById("qrCode"), {
        text: "https://tu-sistema-de-entrada-salida.com",
        width: 128,
        height: 128
    });
}

// Función para manejar la subida de imagen de perfil
async function uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('profileImage', file);
    formData.append('username', JSON.parse(localStorage.getItem('user')).username);

    try {
        const response = await fetch('/api/upload-profile-image', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            document.querySelector('.profile-image').src = data.profileImage;
            const user = JSON.parse(localStorage.getItem('user'));
            user.profileImage = data.profileImage;
            localStorage.setItem('user', JSON.stringify(user));
        }
    } catch (error) {
        console.error('Error al subir la imagen:', error);
    }
}

// Funciones para el panel de administrador
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        const tableBody = document.querySelector('.users-table tbody');
        tableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}</td>
                <td class="action-buttons">
                    <button class="edit-btn" onclick="editUser('${user._id}')">Editar</button>
                    <button class="delete-btn" onclick="deleteUser('${user._id}')">Eliminar</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
    }
}

async function deleteUser(userId) {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadUsers();
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
        }
    }
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

// Inicializar la página según el rol del usuario
function initializePage() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/index.html';
        return;
    }

    if (window.location.pathname === '/admin.html' && user.role !== 'admin') {
        window.location.href = '/profile.html';
    }

    if (window.location.pathname === '/profile.html') {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
        if (user.profileImage) {
            document.querySelector('.profile-image').src = user.profileImage;
        }
        generateQRCode();
    }

    if (window.location.pathname === '/admin.html') {
        loadUsers();
    }
}

// Ejecutar inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializePage);