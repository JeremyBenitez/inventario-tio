const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../controllers/conexion');
require('dotenv').config();
const router = express.Router();
const JWT_SECRET = 'tu_clave_secreta';

router.post('/registro', (req, res) => {
    const { Usuario, Password, roles } = req.body;

    if (!Usuario || !Password || !roles) {
        return res.status(400).json({ error: 'Usuario, contraseña y rol son obligatorios' });
    }

    bcrypt.hash(Password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ error: 'Error al generar el hash de la contraseña' });
        }

        const sql = `INSERT INTO inicio_usuario (Usuario, Password, roles) VALUES (?, ?, ?)`;
        db.run(sql, [Usuario, hashedPassword, roles], function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ mensaje: 'Registro exitoso' });
        });
    });
});

router.get('/allUser', (req, res) => {
    db.all("SELECT ID, Usuario, roles, Password FROM inicio_usuario", [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }
        res.json(rows);
    });
});

// Ruta GET para obtener un usuario específico
router.get('/Usuario/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        console.log(`Solicitando usuario con ID: ${userId}`);
        
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ error: 'ID no válido' });
        }

        const user = await new Promise((resolve, reject) => {
            db.get("SELECT ID, Usuario, roles, Password FROM inicio_usuario WHERE ID = ?", 
                 [userId], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});


// Ruta PUT para actualizar usuario
router.put('/usuario/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, password, role } = req.body;

        // Validaciones
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ error: 'ID no válido' });
        }
        if (!username || !role) {
            return res.status(400).json({ error: 'Username y role son requeridos' });
        }

        // Verificar si el usuario existe
        const userExists = await new Promise((resolve, reject) => {
            db.get("SELECT ID FROM inicio_usuario WHERE ID = ?", [userId], (err, row) => {
                if (err) return reject(err);
                resolve(!!row);
            });
        });

        if (!userExists) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Actualizar usuario (con o sin contraseña)
        await new Promise((resolve, reject) => {
            const query = `
                UPDATE inicio_usuario 
                SET Usuario = ?, roles = ? 
                ${password ? ', Password = ?' : ''} 
                WHERE ID = ?`;

            const params = [username, role];
            if (password) params.push(password);
            params.push(userId);

            db.run(query, params, function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });

        res.json({ success: true, message: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

// Ruta para eliminar usuario
router.delete('/usuarios/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Validación del ID
        if (!userId || isNaN(userId)) {
            return res.status(400).json({
                success: false,
                error: 'ID de usuario no válido'
            });
        }

        // Verificar si el usuario existe
        const userExists = await new Promise((resolve, reject) => {
            db.get("SELECT ID FROM inicio_usuario WHERE ID = ?", [userId], (err, row) => {
                if (err) return reject(err);
                resolve(!!row);
            });
        });

        if (!userExists) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        // Eliminar usuario
        await new Promise((resolve, reject) => {
            db.run("DELETE FROM inicio_usuario WHERE ID = ?", [userId], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });

        res.json({
            success: true,
            message: 'Usuario eliminado correctamente'
        });

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error en el servidor al eliminar usuario'
        });
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