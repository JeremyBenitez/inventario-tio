const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');
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

/// Ruta para iniciar sesión
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

            // ✅ Guardar usuario en sesión correctamente
            req.session.user = { id: row.id, Usuario: row.Usuario };

            req.session.save(err => {  // ⏳ Asegurar que la sesión se guarda antes de responder
                if (err) {
                    console.error('Error al guardar la sesión:', err);
                    return res.status(500).json({ error: 'Error al guardar la sesión' });
                }

                console.log('✅ Sesión guardada correctamente:', req.session);
                res.json({ mensaje: 'Inicio de sesión exitoso' });
            });
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
