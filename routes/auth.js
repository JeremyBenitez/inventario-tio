const checkAuth = (req, res, next) => {
    console.log('🔍 Sesión actual:', req.session); // Debug

    if (req.session && req.session.user) {
        return next(); // ✅ Usuario autenticado, continuar
    }

    return res.status(401).json({ error: 'No autorizado, inicia sesión' }); // ❌ Usuario no autenticado
};

module.exports = { checkAuth };
