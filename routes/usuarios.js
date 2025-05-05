const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../controllers/conexion');
require('dotenv').config();
const router = express.Router();
const JWT_SECRET = 'tu_clave_secreta';

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
            res.json({ mensaje: 'Registro exitoso' });
        });
    });
});

router.get('/allUser', (req, res) => {
    db.all("SELECT ID, Usuario, roles FROM inicio_usuario", [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(rows);
    });
});

// Ruta para obtener un usuario específico por ID
router.get('/usuario/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const row = await new Promise((resolve, reject) => {
            db.get("SELECT ID, Usuario, roles FROM inicio_usuario WHERE ID = ?", 
                  [userId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
        
        if (!row) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(row);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

router.post('/login', (req, res) => {
    const { Usuario, Password } = req.body;

    if (!Usuario || !Password) {
        return res.status(400).json({ error: 'El usuario y la contraseña son obligatorios' });
    }

    const sql = `SELECT * FROM inicio_usuario WHERE Usuario = ?`;
    db.get(sql, [Usuario], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Usuario no encontrado' });

        bcrypt.compare(Password, row.Password, (err, isMatch) => {
            if (err) return res.status(500).json({ error: 'Error al comparar las contraseñas' });
            if (!isMatch) return res.status(400).json({ error: 'Contraseña incorrecta' });

            const token = jwt.sign({ id: row.id }, JWT_SECRET, { expiresIn: '1h' });

            // Configurar cookie HTTP-only
            res.cookie('token', token, {
                httpOnly: true,
                httpsOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 3600000, // 1 hora
                sameSite: 'strict'
            });

            res.json({ token });
        });
    });
});


module.exports = router;