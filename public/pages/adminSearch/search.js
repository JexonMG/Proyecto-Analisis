document.addEventListener('DOMContentLoaded', function() {
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
    
    // Función mejorada para manejar la entrada de búsqueda
    const handleSearchInput = debounce(async (searchTerm) => {
        if (searchTerm === '') {
            suggestionsContainer.style.display = 'none';
            resultsContainer.innerHTML = '';
            return;
        }
        
        loadingIndicator.style.display = 'block';
        suggestionsContainer.style.display = 'none';
        
        try {
            const response = await fetch(`http://localhost:3000/api/users/search?username=${encodeURIComponent(searchTerm)}&limit=5`);
            
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
        if (searchInput.value.trim() !== '') {
            handleSearchInput(searchInput.value.trim());
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target)) {
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
    
    document.querySelector('.add-btn').addEventListener('click', () => {
        if (selectedUser) {
            alert(`Usuario ${selectedUser.username} añadido`);
            userPopup.style.display = 'none';
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
        
        suggestionItem.addEventListener('click', () => {
            searchInput.value = user.username;
            showUserPopup(user);
            suggestionsContainer.style.display = 'none';
        });
        
        return suggestionItem;
    }
    
    // Función para mostrar el popup con los detalles del usuario
    function showUserPopup(user) {
        selectedUser = user;
        const profileImage = user.profileImage || 'https://via.placeholder.com/100';
        
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
            </div>
        `;
        
        userPopup.style.display = 'flex';
    }
    
    // Funciones auxiliares
    function showError(message) {
        resultsContainer.innerHTML = `
            <div class="no-results error">
                ${message}
            </div>
        `;
    }
    
    function showNoResults() {
        resultsContainer.innerHTML = `
            <div class="no-results">
                No se encontraron usuarios con ese username.
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