// Client-side code for file upload
document.getElementById('profileImageInput').addEventListener('change', async (event) => {
    const fileInput = event.target;
    const file = fileInput.files[0];
    const user = JSON.parse(localStorage.getItem('user'));

    // Reset any previous error states
    fileInput.classList.remove('is-invalid');
    const errorElement = document.getElementById('imageUploadError');
    if (errorElement) errorElement.textContent = '';

    if (!file) return;

    // Client-side validations
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
        fileInput.classList.add('is-invalid');
        if (errorElement) {
            errorElement.textContent = 'Solo se permiten imágenes JPG, PNG, GIF o WebP';
        }
        return;
    }

    if (file.size > maxSize) {
        fileInput.classList.add('is-invalid');
        if (errorElement) {
            errorElement.textContent = 'El archivo es demasiado grande. Máximo 5MB.';
        }
        return;
    }

    // Create form data
    const formData = new FormData();
    formData.append('profileImage', file);
    formData.append('username', user.username);

    try {
        // Disable input during upload
        fileInput.disabled = true;
        const loadingIndicator = document.getElementById('uploadLoading');
        if (loadingIndicator) loadingIndicator.style.display = 'block';

        const response = await fetch('http://localhost:3000/api/upload-profile-image', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (response.ok) {
            // Update profile image in localStorage and UI
            user.profileImage = result.profileImage;
            localStorage.setItem('user', JSON.stringify(user));
            
            const profileImage = document.querySelector('.profile-image');
            if (profileImage) {
                profileImage.src = result.profileImage;
                profileImage.alt = 'Imagen de perfil actualizada';
            }

            // Show success message
            const successElement = document.getElementById('uploadSuccess');
            if (successElement) {
                successElement.textContent = 'Imagen de perfil actualizada';
                successElement.style.display = 'block';
            }
        } else {
            throw new Error(result.message || 'Error desconocido');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        
        // Show error message
        const errorElement = document.getElementById('imageUploadError');
        if (errorElement) {
            errorElement.textContent = 'Error al subir la imagen: ' + error.message;
            errorElement.style.display = 'block';
        }
    } finally {
        // Re-enable input
        fileInput.disabled = false;
        const loadingIndicator = document.getElementById('uploadLoading');
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
});

// Optional: Add a route to serve a default profile image
app.get('localhost:3000/uploads/default.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'uploads', 'default.png'));
});

module.exports = app;