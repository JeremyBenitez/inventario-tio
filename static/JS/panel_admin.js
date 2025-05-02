function displayLoggedUser() {
    try {
        // 1. Obtener datos de sessionStorage
        const userDataStr = localStorage.getItem('userData');

        if (!userDataStr) {
            throw new Error('No hay datos de usuario');
        }

        // 2. Parsear los datos
        const userData = JSON.parse(userDataStr);

        // 3. Obtener el nombre de usuario (con múltiples opciones)
        const username = userData.username || userData.Usuario || userData.user || 'Invitado';

        // 4. Mostrar en el DOM
        const userSpan = document.querySelector('.user-info span');
        if (userSpan) {
            userSpan.textContent = username;
        }

    } catch (error) {
        console.error('Error al mostrar usuario:', error.message);

        // Mostrar "Invitado" como valor por defecto
        const userSpan = document.querySelector('.user-info span');
        if (userSpan) {
            userSpan.textContent = 'Invitado';
        }
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', displayLoggedUser);