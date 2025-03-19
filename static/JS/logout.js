document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');

    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                const response = await fetch('usuarios/logout', {
                    method: 'POST' // Usa POST en lugar de GET para el cierre de sesión
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data.mensaje); // Verifica en consola que la sesión se cerró
                    window.location.href = '/'; // Redirige al login
                } else {
                    alert('Error al cerrar sesión. Inténtelo nuevamente.');
                }
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                alert('Hubo un problema al cerrar sesión.');
            }
        });
    }
});
