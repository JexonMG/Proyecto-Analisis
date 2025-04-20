// Variables globales
let selectedUser = null;
let hoursToAdd = 1;

// Elementos DOM
const scanQrBtn = document.getElementById('scanQrBtn');
const qrScannerModal = document.getElementById('qrScannerModal');
const cancelScanBtn = document.getElementById('cancelScan');
const qrVideo = document.getElementById('qr-video');
const userPopup = document.getElementById('userPopup');
const userPopupContent = document.getElementById('userPopupContent');

            // Event listeners
            addUserBtn.addEventListener('click', function() {
                window.location.href = '/pages/adminSearch/search.html'; // Redirección modificada aquí
                // Aquí podrías redirigir a otra página o mostrar un formulario modal
            

            
            confirmSedeBtn.addEventListener('click', function() {
                if (sedeInput.value.trim() === '') {
                    alert('Por favor ingrese una sede');
                    return;
                }
                alert(`Sede "${sedeInput.value}" confirmada`);
                // Aquí podrías guardar la sede o realizar alguna acción
            });
            
            logoutBtn.addEventListener('click', function() {
                if (confirm('¿Está seguro que desea cerrar sesión?')) {
                    // Redirigir al login
                    window.location.href = 'login.html';
                }
            });
        });


        deleteUserBtn.addEventListener('click', async function() {
            // Crear un pequeño popup para confirmar
            const popup = `
                <div class="delete-popup">
                    <h3>Eliminar Usuario</h3>
                    <input type="text" id="carnetToDelete" placeholder="Ingrese el número de carnet">
                    <div class="popup-buttons">
                        <button id="confirmDelete" class="btn-delete">Eliminar</button>
                        <button id="cancelDelete" class="btn-cancel">Cancelar</button>
                    </div>
                </div>
            `;
            
            // Mostrar el popup
            const popupContainer = document.createElement('div');
            popupContainer.className = 'popup-overlay';
            popupContainer.innerHTML = popup;
            document.body.appendChild(popupContainer);
            
            // Event listeners para los botones del popup
            document.getElementById('confirmDelete').addEventListener('click', async function() {
                const carnet = document.getElementById('carnetToDelete').value.trim();
                
                if (!carnet) {
                    alert('Por favor ingrese un número de carnet');
                    return;
                }
                
                if (confirm(`¿Está seguro que desea eliminar al usuario con carnet ${carnet}?`)) {
                    try {
                        const response = await fetch(`http://localhost:3000/api/users/${carnet}`, {
                            method: 'DELETE'
                        });
                        
                        if (response.ok) {
                            alert('Usuario eliminado correctamente');
                        } else {
                            throw new Error('No se pudo eliminar el usuario');
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Error al eliminar usuario: ' + error.message);
                    }
                }
                
                // Cerrar popup
                document.body.removeChild(popupContainer);
            });
            
            document.getElementById('cancelDelete').addEventListener('click', function() {
                document.body.removeChild(popupContainer);
            });
        });

const btnLogout = document.getElementById('btnLogout'); // Ensure btnLogout is properly selected

if (btnLogout) {
    btnLogout.addEventListener('click', function () {
        localStorage.removeItem('user');
        window.location.href = '/pages/index/index.html';
    });
} else {
    console.error('btnLogout element not found in the DOM.');
}

// Asegurarse de que el elemento video existe en el DOM
// Esta parte es crítica para que la cámara funcione correctamente
function initQrScanner() {
    // Verificar si el elemento de video ya existe
    let videoElement = document.getElementById('reader');
    
    // Si no existe, crearlo
    if (!videoElement) {
        videoElement = document.createElement('div');
        videoElement.id = 'reader';
        videoElement.style.width = '100%';
        videoElement.style.maxWidth = '600px';
        videoElement.style.margin = '0 auto';
        
        // Agregar el elemento al contenedor del modal
        const modalContent = qrScannerModal.querySelector('.modal-content') || qrScannerModal;
        modalContent.appendChild(videoElement);
    }
    
    return videoElement;
}

// Función para iniciar el escáner QR usando html5-qrcode
async function startQrScanner() {
    qrScannerModal.style.display = 'flex';
    
    // Inicializar el elemento de video
    const readerElement = initQrScanner();
    
    // Si ya existe una instancia del escáner, destruirla primero
    if (window.html5QrCodeScanner) {
        try {
            await window.html5QrCodeScanner.clear();
        } catch (e) {
            console.warn("Error al limpiar escáner anterior:", e);
        }
    }
    
    // Configuración del escáner
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        // Mostrar botón para seleccionar cámara
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2
    };
    
    try {
        // Usar Html5QrcodeScanner en lugar de Html5Qrcode para una interfaz más completa
        window.html5QrCodeScanner = new Html5QrcodeScanner(
            "reader",
            config,
            /* verbose= */ false);
            
        // Iniciar el escaneo
        window.html5QrCodeScanner.render(onScanSuccess, onScanFailure);
        
        console.log("Escáner QR iniciado correctamente");
    } catch (error) {
        console.error("Error al iniciar el escáner QR:", error);
        handleCameraError(error);
    }
}

// Callback para cuando se escanea un código QR exitosamente
function onScanSuccess(decodedText, decodedResult) {
    console.log('QR escaneado exitosamente:', decodedText);
    
    // Detener el escáner
    stopQrScanner();
    
    // Procesar el carnet escaneado
    fetchUserByCarnet(decodedText);
}

// Callback para errores de escaneo
function onScanFailure(error) {
    // Este callback se llama frecuentemente cuando no se detecta un QR,
    // por lo que solo registramos errores graves
    if (error && error.name !== "QRCodeNotFoundException") {
        console.warn(`Error de escaneo: ${error}`);
    }
}

// Función para detener el escáner
function stopQrScanner() {
    if (window.html5QrCodeScanner) {
        try {
            window.html5QrCodeScanner.clear().then(() => {
                console.log("Escáner QR detenido correctamente");
            }).catch(error => {
                console.warn("Error al detener el escáner:", error);
            });
        } catch (e) {
            console.warn("Error al intentar detener el escáner:", e);
        }
    }
    
    qrScannerModal.style.display = 'none';
}

// Manejo mejorado de errores
function handleCameraError(error) {
    console.error('Error de cámara:', error);

    let errorMessage = 'Error al acceder a la cámara: ';
    
    if (error.message && error.message.includes("No cameras detected")) {
        errorMessage += "No se detectaron cámaras en el dispositivo";
    } else if (error.name === "NotAllowedError" || (error.message && error.message.includes("Permission denied"))) {
        errorMessage += "Permiso denegado para usar la cámara. Por favor, permita el acceso a la cámara en la configuración del navegador.";
    } else if (error.name === "NotFoundError") {
        errorMessage += "No se encontró ninguna cámara en el dispositivo";
    } else if (error.name === "NotReadableError" || (error.message && error.message.includes("Could not start video source"))) {
        errorMessage += "La cámara está en uso por otra aplicación o no se puede acceder a ella";
    } else {
        errorMessage += error.message || "Error desconocido";
    }

    // Mostrar el error y ofrecer alternativas
    alert(errorMessage + "\n\nVerifique que:\n1. La cámara no está siendo usada por otra aplicación\n2. Los permisos del navegador están configurados correctamente\n3. Su dispositivo tiene una cámara funcional");
    
    // Ofrecer entrada manual como alternativa
    if (confirm('¿Desea ingresar el carnet manualmente?')) {
        const carnet = prompt("Ingrese el número de carnet:");
        if (carnet && carnet.trim()) {
            fetchUserByCarnet(carnet.trim());
        }
    }
    
    // Cerrar el modal de escaneo
    qrScannerModal.style.display = 'none';
}

// Función para obtener datos del usuario por carnet
async function fetchUserByCarnet(carnet) {
    try {
        const response = await fetch(`http://localhost:3000/api/users/carnet/${encodeURIComponent(carnet)}`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const user = await response.json();
        selectedUser = user;
        hoursToAdd = 1; // Resetear horas a añadir
        showUserPopup(user);
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        alert('No se pudo encontrar el usuario con el carnet proporcionado.');
    }
}

// Función para mostrar el popup con la información del usuario
function showUserPopup(user) {
    const popupContent = `
        <div class="user-popup-header">
            <img src="${user.profileImage || 'https://cdn-icons-png.flaticon.com/512/6522/6522581.png'}" class="user-avatar" onerror="this.src='https://cdn-icons-png.flaticon.com/512/6522/6522581.png'">
            <div class="user-info">
                <h3>${user.username}</h3>
                <span class="user-role">${user.role}</span>
            </div>
        </div>
        <div class="user-details">
            <div class="detail-item">
                <span class="detail-label">Carnet:</span>
                <span class="detail-value">${user.carnetNumber}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Horas:</span>
                <span class="detail-value">${user.hours}</span>
            </div>
            <div class="hours-control">
                <span class="detail-label">Horas a añadir:</span>
                <div class="hours-adjuster">
                    <button class="hours-btn" id="decrementHours">-</button>
                    <span id="hoursDisplay" class="hours-display">${hoursToAdd}</span>
                    <button class="hours-btn" id="incrementHours">+</button>
                </div>
                <button class="btn-admin" id="confirmAddHours">Añadir Horas</button>
            </div>
        </div>
    `;
    
    userPopupContent.innerHTML = popupContent;
    userPopup.style.display = 'flex';
    
    // Agregar event listeners para los botones en el popup
    document.getElementById('closePopup').addEventListener('click', closeUserPopup);
    document.getElementById('decrementHours').addEventListener('click', decrementHours);
    document.getElementById('incrementHours').addEventListener('click', incrementHours);
    document.getElementById('confirmAddHours').addEventListener('click', updateUserHours);
}

// Función para cerrar el popup de usuario
function closeUserPopup() {
    userPopup.style.display = 'none';
    selectedUser = null;
}

// Función para decrementar las horas a añadir
function decrementHours() {
    if (hoursToAdd > 1) {
        hoursToAdd--;
        document.getElementById('hoursDisplay').textContent = hoursToAdd;
    }
}

// Función para incrementar las horas a añadir
function incrementHours() {
    hoursToAdd++;
    document.getElementById('hoursDisplay').textContent = hoursToAdd;
}

// Función para actualizar las horas del usuario
async function updateUserHours() {
    if (!selectedUser) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/users/carnet/${selectedUser.carnetNumber}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hoursToAdd: hoursToAdd
            })
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const updatedUser = await response.json();
        
        // Actualizar el usuario seleccionado con la nueva información
        selectedUser = updatedUser;
        
        // Mostrar mensaje de éxito
        alert(`Se han añadido ${hoursToAdd} horas al usuario ${selectedUser.username}.`);
        
        // Cerrar el popup
        closeUserPopup();
    } catch (error) {
        console.error('Error al actualizar las horas del usuario:', error);
        alert('No se pudieron actualizar las horas del usuario.');
    }
}

// Event listeners
scanQrBtn.addEventListener('click', startQrScanner);
cancelScanBtn.addEventListener('click', stopQrScanner);

// Cerrar el popup al hacer clic fuera de él
window.addEventListener('click', function(event) {
    if (event.target === userPopup) {
        closeUserPopup();
    }
});

// Manejar tecla Escape para cerrar modales
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        stopQrScanner();
        closeUserPopup();
    }
});

