// auth.js
const checkAuth = (req, res, next) => {
    // Lógica de autenticación
    const isAuthenticated = true; // Cambia esto según tu lógica

    if (isAuthenticated) {
        next(); // Si está autenticado, pasa al siguiente middleware o ruta
    } else {
        res.status(401).send('No autorizado');
    }
};

module.exports = { checkAuth }; // Exporta la función
