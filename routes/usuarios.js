const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../controllers/conexion');

const router = express.Router();

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

            res.json({ mensaje: 'Inicio de sesión exitoso' });
        });
    });
});


// // Middleware para verificar el token JWT
// const verificarToken = (req, res, next) => {
//     const token = req.headers['authorization'];
//     if (!token) return res.status(403).json({ error: 'No se proporcionó un token' });

//     jwt.verify(token, 'tu_clave_secreta', (err, decoded) => {
//         if (err) return res.status(403).json({ error: 'Token inválido' });

//         req.usuario = decoded;
//         next();
//     });
// };

module.exports = router;
