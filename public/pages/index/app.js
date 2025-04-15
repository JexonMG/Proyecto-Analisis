document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginFormContainer = document.getElementById('loginFormContainer');
    const registerFormContainer = document.getElementById('registerFormContainer');
    const toggleFormButton = document.getElementById('toggleFormButton');
    const toggleFormButtonBack = document.getElementById('toggleFormButtonBack');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const profileImageInput = document.getElementById('profileImage');
    const profileImagePreview = document.getElementById('profileImagePreview');
    const errorMessage = document.getElementById('error-message');
    const registerErrorMessage = document.getElementById('register-error-message');
    
    // Mostrar/ocultar formularios
    toggleFormButton.addEventListener('click', function() {
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'block';
        registerFormContainer.classList.add('active');
    });
    
    toggleFormButtonBack.addEventListener('click', function() {
        registerFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'block';
        registerFormContainer.classList.remove('active');
    });
    
    // Previsualización de imagen
    profileImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validar tipo de archivo
        if (!file.type.match('image.*')) {
            showRegisterError('Por favor, selecciona un archivo de imagen válido (JPEG, PNG)');
            return;
        }
        
        // Validar tamaño (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showRegisterError('La imagen no debe exceder los 2MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            profileImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    });
    
    // Manejo del formulario de registro
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        registerErrorMessage.textContent = '';
        
        // Obtener datos del formulario
        const fullName = document.getElementById('fullName').value;
        const carnetNumber = document.getElementById('carnetNumber').value;
        const career = document.getElementById('career').value;
        const schedule = document.getElementById('schedule').value;
        const password = document.getElementById('passwordRegister').value;
        const profileImage = profileImagePreview.querySelector('img')?.src || '';
        
        // Validación básica
        if (!fullName || !carnetNumber || !password) {
            return showRegisterError('Por favor complete todos los campos requeridos');
        }
        
        try {
            // Crear objeto de usuario con horas inicializadas en 0
            const userData = {
                username: fullName, // Usamos el carnet como username
                password: password,
                carnetNumber: carnetNumber,
                career: career,
                schedule: schedule,
                hours: 0, // Inicializamos horas en 0
                profileImage: profileImage,
                lastLogin: new Date().toISOString()
            };
            
            // Enviar al servidor
            const response = await fetch('http://localhost:3000/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al registrar usuario');
            }
            
            // Registro exitoso
            alert('Usuario registrado exitosamente!');
            
            // Limpiar formulario
            registerForm.reset();
            profileImagePreview.innerHTML = '';
            
            // Cambiar a formulario de login
            registerFormContainer.style.display = 'none';
            loginFormContainer.style.display = 'block';
            
        } catch (error) {
            console.error('Error en registro:', error);
            showRegisterError(error.message || 'Error al registrar usuario');
        }
    });
    
    // Manejo del formulario de login
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        errorMessage.textContent = '';
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const carnet = username
        if (!carnet || !password) {
            return showLoginError('Por favor ingrese su carnet y contraseña');
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ carnetNumber: username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error en el login');
            }
            
            // Login exitoso - guardar datos de usuario
            localStorage.setItem('user', JSON.stringify(data));
            
            // Mensaje de éxito y redirección a la página de perfil
            alert(`Bienvenido ${data.name || data.carnet}!`);
            window.location.href = '/pages/profile/profile.html'; // Redirección modificada aquí
            
        } catch (error) {
            console.error('Error en login:', error);
            showLoginError(error.message || 'Error al iniciar sesión');
        }
    });
    
    // Funciones auxiliares
    function showLoginError(message) {
        errorMessage.textContent = message;
    }
    
    function showRegisterError(message) {
        registerErrorMessage.textContent = message;
    }
    
    // Verificar si hay usuario logueado
    function checkLoggedIn() {
        const user = localStorage.getItem('user');
        if (user) {
            window.location.href = '/pages/profile/profile.html'; // También actualizado aquí
        }
    }
    
    checkLoggedIn();
});