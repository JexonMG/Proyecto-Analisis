document.addEventListener('DOMContentLoaded', function() {
    const sedeInput = document.getElementById('sedeInput');
    const confirmSedeBtn = document.getElementById('confirmSede');
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('results');
    const suggestionsContainer = document.getElementById('suggestions');
    const loadingIndicator = document.getElementById('loading');
    const userPopup = document.getElementById('userPopup');
    const popupUserContent = document.getElementById('popupUserContent');
    const closePopup = document.querySelector('.close-popup');
    const cancelBtn = document.querySelector('.cancel-btn');
    
    let searchTimeout;
    let selectedUser = null;
    let currentSede = null;
    let hoursToAdd = 0; // Variable para almacenar las horas a añadir
    
    // Inicialmente deshabilitar la búsqueda de usuarios hasta que se confirme la sede
    searchInput.disabled = true;
    searchInput.placeholder = "Primero ingrese y confirme la sede...";
    
    // Función para confirmar la sede
    confirmSedeBtn.addEventListener('click', function() {
        const sede = sedeInput.value.trim();
        if (sede === '') {
            alert('Por favor, ingrese una sede válida');
            return;
        }
        
        // Guardar la sede actual y habilitar la búsqueda
        currentSede = sede;
        searchInput.disabled = false;
        searchInput.placeholder = "Buscar por nombre...";
        searchInput.focus();
        
        // Cambiar la apariencia visual para indicar que la sede está confirmada
        sedeInput.classList.add('confirmed');
        confirmSedeBtn.classList.add('confirmed');
        
        // Opcional: Mostrar un mensaje de confirmación
        showMessage(`Sede "${sede}" confirmada. Ahora puede buscar usuarios.`);
    });
    
    // Permitir confirmar sede con Enter
    sedeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            confirmSedeBtn.click();
        }
    });
    
    // Función mejorada para manejar la entrada de búsqueda
    const handleSearchInput = debounce(async (searchTerm) => {
        if (searchTerm === '') {
            suggestionsContainer.style.display = 'none';
            resultsContainer.innerHTML = '';
            return;
        }
        
        // Verificar si se ha confirmado la sede
        if (!currentSede) {
            showError('Por favor, primero ingrese y confirme la sede');
            return;
        }
        
        loadingIndicator.style.display = 'block';
        suggestionsContainer.style.display = 'none';
        
        try {
            // Incluir la sede en la búsqueda
            const response = await fetch(`http://localhost:3000/api/users/search?username=${encodeURIComponent(searchTerm)}&sede=${encodeURIComponent(currentSede)}&limit=5`);
            
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            
            const users = await response.json();
            
            loadingIndicator.style.display = 'none';
            displaySuggestions(users);
            
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
            loadingIndicator.style.display = 'none';
            showError('Error al cargar los resultados. Por favor, intenta nuevamente.');
        }
    }, 300);
    
    // Event listeners
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        handleSearchInput(searchTerm);
    });
    
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim() !== '' && currentSede) {
            handleSearchInput(searchInput.value.trim());
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });
    
    // Manejadores para el popup
    closePopup.addEventListener('click', () => {
        userPopup.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
        userPopup.style.display = 'none';
    });
    
    
    // Función para obtener información detallada de un usuario por ID
    async function getUserById(userId) {
        try {
            const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Error al obtener datos del usuario');
            return await response.json();
        } catch (error) {
            console.error('Error al obtener info del usuario por ID:', error);
            throw error;
        }
    }

    // Función para incrementar las horas
    function incrementHours() {
        hoursToAdd++;
        updateHoursDisplay();
    }
    
    // Función para decrementar las horas
    function decrementHours() {
        if (hoursToAdd > 0) {
            hoursToAdd--;
            updateHoursDisplay();
        }
    }
    
    // Función para actualizar el display de horas
    function updateHoursDisplay() {
        const hoursDisplay = document.getElementById('hoursDisplay');
        if (hoursDisplay) {
            hoursDisplay.textContent = hoursToAdd;
            
            // Habilitar o deshabilitar el botón de añadir según las horas
            const addBtn = document.querySelector('.add-btn');
            if (addBtn) {
                addBtn.disabled = hoursToAdd === 0;
                if (hoursToAdd === 0) {
                    addBtn.classList.add('disabled');
                } else {
                    addBtn.classList.remove('disabled');
                }
            }
        }
    }

    // Manejador del botón de añadir horas
// Manejador del botón de añadir horas
document.querySelector('.add-btn').addEventListener('click', async () => {
    if (selectedUser && hoursToAdd > 0) {
        try {
            // Recuperar datos actualizados del usuario seleccionado antes de la actualización
            const updatedUserInfo = await getUserById(selectedUser.id);
            
            // Actualizar las horas del usuario seleccionado
            const updateResponse = await fetch(`http://localhost:3000/api/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    hours: (updatedUserInfo.hours || 0) + hoursToAdd,
                    areaTrabajo: currentSede
                })
            });

            if (!updateResponse.ok) throw new Error('Error al actualizar');
            
            const updatedUser = await updateResponse.json();
            alert(`Se han añadido ${hoursToAdd} horas al usuario ${selectedUser.username}`);
            
            // Reiniciar las horas a añadir
            hoursToAdd = 0;
            updateHoursDisplay();
            
            userPopup.style.display = 'none';
            
        } catch (error) {
            console.error('Error al procesar la acción:', error);
            alert(`Error: ${error.message || 'Error al procesar la solicitud'}`);
        }
    }
});
    
    // Cerrar popup al hacer clic fuera del contenido
    userPopup.addEventListener('click', (e) => {
        if (e.target === userPopup) {
            userPopup.style.display = 'none';
        }
    });
    
    // Función para mostrar sugerencias
    function displaySuggestions(users) {
        if (users.length === 0) {
            showNoResults();
            return;
        }
        
        suggestionsContainer.innerHTML = '';
        
        users.forEach(user => {
            const suggestionItem = createSuggestionItem(user);
            suggestionsContainer.appendChild(suggestionItem);
        });
        
        suggestionsContainer.style.display = 'block';
    }
    
    // Función para crear elementos de sugerencia
    function createSuggestionItem(user) {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        
        const profileImage = user.profileImage || 'https://via.placeholder.com/40';
        
        suggestionItem.innerHTML = `
            <img src="${profileImage}" alt="${user.username}" class="suggestion-image">
            <div class="suggestion-info">
                <span class="suggestion-username">${user.username}</span>
                <span class="suggestion-carnet">${user.carnetNumber}</span>
            </div>
        `;
        
        suggestionItem.addEventListener('click', async () => {
            searchInput.value = user.username;
            
            // Obtener información completa y actualizada del usuario antes de mostrar el popup
            try {
                loadingIndicator.style.display = 'block';
                const fullUserInfo = await getUserById(user.id);
                loadingIndicator.style.display = 'none';
                
                showUserPopup(fullUserInfo);
            } catch (error) {
                console.error('Error al obtener información del usuario:', error);
                loadingIndicator.style.display = 'none';
                alert('Error al cargar la información completa del usuario');
            }
            
            suggestionsContainer.style.display = 'none';
        });
        
        return suggestionItem;
    }
    
    // Función para mostrar el popup con los detalles del usuario
    function showUserPopup(user) {
        selectedUser = user;
        const profileImage = user.profileImage || 'https://via.placeholder.com/100';
        
        // Reiniciar contador de horas al abrir el popup
        hoursToAdd = 0;
        
        popupUserContent.innerHTML = `
            <div class="user-header">
                <img src="${profileImage}" alt="${user.username}" class="user-avatar">
                <div class="user-info">
                    <h3 class="user-username">${user.username}</h3>
                    <span class="user-role">${user.role}</span>
                </div>
            </div>
            <div class="user-details">
                <div class="detail-item">
                    <span class="detail-label">Carnet:</span>
                    <span class="detail-value">${user.carnetNumber}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Sede:</span>
                    <span class="detail-value">${user.areaTrabajo || 'No asignada'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Carrera:</span>
                    <span class="detail-value">${user.career || 'No especificada'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Horas:</span>
                    <span class="detail-value">${user.hours || 0}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Último acceso:</span>
                    <span class="detail-value">${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}</span>
                </div>
                <div class="hours-control">
                    <span class="hours-label">Horas a añadir:</span>
                    <div class="hours-adjuster">
                        <button class="hours-btn decrement-btn" id="decrementHours">-</button>
                        <span id="hoursDisplay" class="hours-display">0</span>
                        <button class="hours-btn increment-btn" id="incrementHours">+</button>
                    </div>
                </div>
            </div>
        `;
        
        userPopup.style.display = 'flex';
        
        // Agregar event listeners para los botones de ajuste de horas
        document.getElementById('incrementHours').addEventListener('click', incrementHours);
        document.getElementById('decrementHours').addEventListener('click', decrementHours);
        
        // Inicializar el estado del botón de añadir
        updateHoursDisplay();
    }
    
    // Funciones auxiliares
    function showError(message) {
        resultsContainer.innerHTML = `
            <div class="no-results error">
                ${message}
            </div>
        `;
    }
    
    function showMessage(message) {
        resultsContainer.innerHTML = `
            <div class="info-message">
                ${message}
            </div>
        `;
    }
    
    function showNoResults() {
        resultsContainer.innerHTML = `
            <div class="no-results">
                No se encontraron usuarios con ese nombre en la sede ${currentSede}.
            </div>
        `;
        suggestionsContainer.style.display = 'none';
    }
    
    // Función debounce mejorada
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
});