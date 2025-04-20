document.addEventListener('DOMContentLoaded', function () {
    let scanner = null;
    let hoursToAdd = 0;
    let selectedUser = null;

    const qrScannerModal = document.getElementById('qrScannerModal');
    const userPopup = document.getElementById('userPopup');
    const cancelScanBtn = document.getElementById('cancelScan');
    const scanQrBtn = document.getElementById('scanQrBtn');
    const addUserBtn = document.getElementById('addUserBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Obtener usuario por Carnet
    async function getUserByCarnet(carnet) {
        try {
            const response = await fetch(`http://localhost:3000/api/users/carnet/${encodeURIComponent(carnet)}`);
            if (!response.ok) throw new Error('Usuario no encontrado');
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    async function handleScannedQR(carnet) {
        try {
            qrScannerModal.style.display = 'none';
            if (scanner) scanner.stop();

            const user = await getUserByCarnet(carnet);
            showUserPopup(user);
        } catch (error) {
            alert('Usuario no encontrado');
            console.error(error);
        }
    }

    function showUserPopup(user) {
        selectedUser = user;
        hoursToAdd = 0;

        const popupContent = `
            <div class="user-popup-header">
                <img src="${user.profileImage}" class="user-avatar">
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

        document.getElementById('userPopupContent').innerHTML = popupContent;
        userPopup.style.display = 'flex';

        document.getElementById('incrementHours').addEventListener('click', () => {
            hoursToAdd++;
            updateHoursDisplay();
        });

        document.getElementById('decrementHours').addEventListener('click', () => {
            if (hoursToAdd > 0) hoursToAdd--;
            updateHoursDisplay();
        });

        document.getElementById('confirmAddHours').addEventListener('click', async () => {
            if (hoursToAdd > 0 && selectedUser) {
                try {
                    const currentUser = await getUserByCarnet(selectedUser.carnetNumber);
                    const newHours = (currentUser.hours || 0) + hoursToAdd;
                    
                    const updateResponse = await fetch(`http://localhost:3000/api/users/carnet/${selectedUser.carnetNumber}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ hours: newHours })
                    });

                    if (!updateResponse.ok) throw new Error('Error al actualizar');
                    
                    alert(`Se añadieron ${hoursToAdd} horas a ${user.username}`);
                    hoursToAdd = 0;
                    updateHoursDisplay();
                    userPopup.style.display = 'none';
                } catch (error) {
                    console.error('Error:', error);
                    alert(`Error: ${error.message || 'Error al procesar la solicitud'}`);
                }
            }
        });
    }

    function updateHoursDisplay() {
        const display = document.getElementById('hoursDisplay');
        const addBtn = document.getElementById('confirmAddHours');
        
        if (display) display.textContent = hoursToAdd;
        if (addBtn) {
            addBtn.disabled = hoursToAdd === 0;
            addBtn.classList.toggle('disabled', hoursToAdd === 0);
        }
    }

    scanQrBtn.addEventListener('click', async () => {
        try {
            const cameras = await Instascan.Camera.getCameras();
            if (cameras.length > 0) {
                qrScannerModal.style.display = 'flex';
                scanner.start(cameras[0]);
            } else {
                alert('No se encontraron cámaras');
            }
        } catch (error) {
            console.error('Error al iniciar cámara:', error);
        }
    });

    // Resto del código sin cambios...
    addUserBtn.addEventListener('click', () => window.location.href = '/pages/adminSearch/search.html');
    cancelScanBtn.addEventListener('click', () => qrScannerModal.style.display = 'none');
    userPopup.addEventListener('click', (e) => e.target === userPopup ? userPopup.style.display = 'none' : null);
    logoutBtn.addEventListener('click', () => confirm('¿Cerrar sesión?') && (window.location.href = 'login.html'));

    // Inicializar scanner
    scanner = new Instascan.Scanner({ video: document.getElementById('qr-video'), mirror: false });
    scanner.addListener('scan', handleScannedQR);
});