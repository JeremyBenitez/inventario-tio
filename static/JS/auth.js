// Verificar autenticación al cargar páginas protegidas
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    // Verificar si estamos en una página protegida
    if (window.location.pathname !== '/' && !token) {
        window.location.href = '/';
    }

    // Configurar Axios/fetch para enviar el token automáticamente
    if (window.axios) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
});

// Función para hacer fetch autenticado
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    return fetch(url, {
        ...options,
        headers,
        credentials: 'include'
    });
}