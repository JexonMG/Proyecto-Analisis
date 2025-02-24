document.addEventListener('DOMContentLoaded', () => {
    initializeLogin();
    initializeRegister();
    initializeToggleForms();
});

// Function to initialize the login form
function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            console.log('Username:', username);
            console.log('Password:', password);
            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();
                console.log(data);
                if (response.ok) {
                    localStorage.setItem('user', JSON.stringify(data));
                    console.log('Login form submitted');
                    // Redirect based on role
                    if (data.role === 'admin') {
                        window.location.href = '/admin.html';
                    } else {
                        window.location.href = '/pages/profile/profile.html';
                    }
                } else {
                    document.getElementById('error-message').textContent = data.message;
                }
            } catch (error) {
                document.getElementById('error-message').textContent = 'Error al conectar con el servidor';
            }
        });
    }
}

// Function to initialize the registration form
function initializeRegister() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('newUsername').value;
            const email = document.getElementById('newEmail').value;
            const password = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                document.getElementById('register-error-message').textContent = 'Las contraseñas no coinciden';
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password, role: 'user', name: username, email })
                });

                const data = await response.json();

                if (response.ok) {
                    window.location.href = '/';
                } else {
                    document.getElementById('register-error-message').textContent = data.message;
                }
            } catch (error) {
                document.getElementById('register-error-message').textContent = 'Error al conectar con el servidor';
            }
        });
    }
}

// Function to toggle between login and registration forms
function initializeToggleForms() {
    const toggleButton = document.getElementById('toggleFormButton');
    const toggleButtonBack = document.getElementById('toggleFormButtonBack');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const registerFormContainer = document.getElementById('registerFormContainer');

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            loginFormContainer.style.display = 'none';
            registerFormContainer.style.display = 'block';
        });
    }

    if (toggleButtonBack) {
        toggleButtonBack.addEventListener('click', () => {
            registerFormContainer.style.display = 'none';
            loginFormContainer.style.display = 'block';
        });
    }
}
