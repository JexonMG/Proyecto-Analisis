document.addEventListener('DOMContentLoaded', async function () {
    // Verificar si el usuario está autenticado
    const userData = JSON.parse(localStorage.getItem('user'));

    if (!userData || !userData.id) {
        window.location.href = '/pages/index/index.html';
        return;
    }

    // Elementos del DOM
    const profilePhoto = document.getElementById('profilePhoto');
    const btnEdit = document.getElementById('btnEdit');
    const btnLogout = document.getElementById('btnLogout');
    const viewProfile = document.getElementById('viewProfile');
    const editProfile = document.getElementById('editProfile');
    const editProfilePhoto = document.getElementById('editProfilePhoto');
    const profileImageContainer = document.getElementById('profileImageContainer');
    const photoInput = document.getElementById('photoInput');
    const editProfileForm = document.getElementById('editProfileForm');
    const btnCancel = document.getElementById('btnCancel');
    const statusMessage = document.getElementById('statusMessage');

    // Campos del formulario
    const nameInput = document.getElementById('name');
    const carnetNumberInput = document.getElementById('carnetNumber');
    const careerInput = document.getElementById('career');
    const scheduleInput = document.getElementById('scheduleInput');
    const fieldAreaInput = document.getElementById('fieldArea');
    const hoursInput = document.getElementById('hours');
    const passwordInput = document.getElementById('password');

    // Variable para almacenar la imagen en base64
    let profileImageBase64 = null;

    // Función para obtener los datos actualizados del usuario desde la API
    async function fetchUserData() {
        try {
            const response = await fetch(`http://localhost:3000/api/users/${userData.id}`);
            
            if (!response.ok) {
                throw new Error('Error al obtener los datos del usuario');
            }
            
            const updatedUserData = await response.json();
            
            // Actualizar los datos en localStorage
            localStorage.setItem('user', JSON.stringify({
                ...userData,
                ...updatedUserData
            }));
            
            return updatedUserData;
        } catch (error) {
            console.error('Error:', error);
            showStatusMessage('Error al cargar los datos del usuario', 'error');
            return userData; // Retornar los datos viejos como fallback
        }
    }

    // Cargar datos del usuario desde la API
    const currentUserData = await fetchUserData();
    
    // Cargar datos del usuario en el perfil
    loadUserProfileData(currentUserData);

    // Mostrar el formulario de edición cuando se hace clic en "Editar"
    btnEdit.addEventListener('click', function () {
        viewProfile.style.display = 'none';
        editProfile.style.display = 'block';
        if (profilePhoto && editProfilePhoto) {
            editProfilePhoto.src = profilePhoto.src;
        }
        // Cargar datos del usuario en el formulario
        loadUserFormData(currentUserData);
    });

    // Cambiar imagen al hacer clic
    if (profileImageContainer) {
        profileImageContainer.addEventListener('click', function () {
            photoInput.click();
        });
    }

    // Cargar nueva imagen
    if (photoInput) {
        photoInput.addEventListener('change', function (event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    editProfilePhoto.src = e.target.result;
                    profileImageBase64 = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Cancelar edición
    if (btnCancel) {
        btnCancel.addEventListener('click', function () {
            window.location.href = 'profile.html';
        });
    }

    // Cerrar sesión
    if (btnLogout) {
        btnLogout.addEventListener('click', function () {
            localStorage.removeItem('user');
            window.location.href = '/pages/index/index.html';
        });
    }

    // Guardar cambios
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function (event) {
            event.preventDefault();
            updateUserProfile();
        });
    }

    // Cargar datos al perfil (vista)
    function loadUserProfileData(user) {
        const userNameElement = document.getElementById('userName');
        const userCarnetElement = document.getElementById('userCarnet');
        const userCareerElement = document.getElementById('userCareer');
        const userScheduleElement = document.getElementById('userSchedule');
        const userFieldAreaElement = document.getElementById('userFieldArea');
        const userHoursElement = document.getElementById('userHours');
        const userRoleElement = document.getElementById('userRole');
        const userTutorElement = document.getElementById('userTutor');
        const userLastLoginElement = document.getElementById('userLastLogin');
        
        if (userNameElement) userNameElement.textContent = user.username || 'Usuario';
        if (userCarnetElement) userCarnetElement.textContent = user.carnetNumber || 'No disponible';
        if (userCareerElement) userCareerElement.textContent = user.career || 'No disponible';
        if (userScheduleElement) userScheduleElement.textContent = user.schedule || 'No disponible';
        if (userFieldAreaElement) userFieldAreaElement.textContent = user.areaTrabajo || 'No disponible';
        if (userHoursElement) userHoursElement.textContent = user.hours || '0';
        if (userRoleElement) userRoleElement.textContent = user.role || 'Voluntario';
        if (userTutorElement) userTutorElement.textContent = user.tutor || 'No asignado';
        
        if (userLastLoginElement) {
            const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca';
            userLastLoginElement.textContent = lastLogin;
        }

        if (profilePhoto && user.profileImage) {
            profilePhoto.src = user.profileImage;
        }
        
        console.log('Datos de usuario cargados:', user);
    }

    // Cargar datos al formulario (edición)
    function loadUserFormData(user) {
        if (nameInput) nameInput.value = user.username || '';
        if (carnetNumberInput) carnetNumberInput.value = user.carnetNumber || '';
        if (careerInput) careerInput.value = user.career || '';
        if (scheduleInput) scheduleInput.value = user.schedule || '';
        if (fieldAreaInput) fieldAreaInput.value = user.areaTrabajo || '';
        if (hoursInput) hoursInput.value = user.hours || '0';

        if (editProfilePhoto) {
            editProfilePhoto.src = user.profileImage || 'https://cdn-icons-png.flaticon.com/512/6522/6522581.png';
            profileImageBase64 = user.profileImage;
        }
        
        console.log('Datos cargados en formulario:', {
            username: nameInput?.value,
            carnetNumber: carnetNumberInput?.value,
            career: careerInput?.value,
            schedule: scheduleInput?.value,
            areaTrabajo: fieldAreaInput?.value,
            hours: hoursInput?.value
        });
    }

    // Actualizar perfil
    function updateUserProfile() {
        const updatedData = {
            carnetNumber: carnetNumberInput.value.trim(),
            career: careerInput.value.trim(),
            schedule: scheduleInput.value.trim(),
            areaTrabajo: fieldAreaInput.value.trim()
        };

        if (nameInput) {
            updatedData.username = nameInput.value.trim();
        }

        if (hoursInput) {
            updatedData.hours = parseInt(hoursInput.value.trim()) || 0;
        }

        if (passwordInput && passwordInput.value.trim() !== '') {
            updatedData.password = passwordInput.value;
        }

        if (profileImageBase64) {
            updatedData.profileImage = profileImageBase64;
        }

        console.log('Datos enviados:', updatedData);
        console.log('URL:', `http://localhost:3000/api/users/${userData.id}`);

        fetch(`http://localhost:3000/api/users/${userData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.message || 'Error al actualizar el perfil');
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Respuesta del servidor:', data);
                
                const updatedUser = {
                    ...userData,
                    ...data.user
                };

                localStorage.setItem('user', JSON.stringify(updatedUser));

                showStatusMessage('Perfil actualizado correctamente', 'success');

                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1500);
            })
            .catch(error => {
                console.error('Error:', error);
                showStatusMessage(error.message, 'error');
            });
    }

    // Mostrar mensajes de estado
    function showStatusMessage(message, type) {
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.className = `status-message ${type}`;
            statusMessage.style.display = 'block';

            setTimeout(() => {
                statusMessage.style.display = 'none';
            }, 3000);
        }
    }
});