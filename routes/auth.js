const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

const ensureAuthenticated = (req, res, next) => {
    // Buscar token en cookies
    const token = req.cookies.token; // Asumiendo que el token se almacena en una cookie

    if (!token) {
        if (req.accepts('html')) {
            return res.redirect('/'); // Redirige al login si no hay token
        }
        return res.status(403).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            if (req.accepts('html')) {
                return res.redirect('/'); // Redirige al login si el token es inválido
            }
            return res.status(401).json({ error: 'Token inválido' });
        }
        req.userId = decoded.id; // Almacena el ID del usuario en la solicitud
        next(); // Continúa a la siguiente función de middleware o ruta
    });

    
};



module.exports = ensureAuthenticated;
