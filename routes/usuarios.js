const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const db = require('../controllers/conexion');

const router = express.Router();

// Configuración de la sesión
router.use(session({
    secret: 'tu_clave_secreta', // Cambia esto por una clave secreta más segura
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
}));
    
// Middleware para verificar si el usuario está autenticado
function checkAuth(req, res, next) {
    if (req.session && req.session.userId) {
        return next();  // El usuario está autenticado, continúa con la solicitud
    } else {
        return res.status(401).json({ error: 'No autenticado' });  // Si no está autenticado, redirige o responde con un error
    }
}

// Ruta para registrar un usuario
router.post('/registro', (req, res) => {
    const { Usuario, Password } = req.body;

    if (!Usuario || !Password) {
        return res.status(400).json({ error: 'El usuario y la contraseña son obligatorios' });
    }

    bcrypt.hash(Password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Error al generar el hash de la contraseña' });
        }

        const sql = `INSERT INTO inicio_usuario (Usuario, Password) VALUES (?, ?)`;
        db.run(sql, [Usuario, hashedPassword], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
        });
    });
});

// Ruta para iniciar sesión
router.post('/login', (req, res) => {
    const { Usuario, Password } = req.body;

    if (!Usuario || !Password) {
        return res.status(400).json({ error: 'El usuario y la contraseña son obligatorios' });
    }

    const sql = `SELECT * FROM inicio_usuario WHERE Usuario = ?`;
    db.get(sql, [Usuario], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Usuario no encontrado' });

        // Comparar la contraseña con el hash almacenado
        bcrypt.compare(Password, row.Password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: 'Error al comparar las contraseñas' });
            if (!isMatch) return res.status(400).json({ error: 'Contraseña incorrecta' });

            // Si las credenciales son correctas, se guarda la información de la sesión
            req.session.userId = row.id;  // Guarda el ID del usuario en la sesión
            res.json({ mensaje: 'Inicio de sesión exitoso' });
        });
    });
});

// Ruta para cerrar sesión
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Error al cerrar sesión' });
        }
        res.clearCookie('connect.sid'); // Elimina la cookie de sesión
        res.json({ mensaje: 'Sesión cerrada exitosamente' });
    });
});
module.exports = router;
