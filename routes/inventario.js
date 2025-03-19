const express = require('express');
const router = express.Router();
const db = require('../controllers/conexion'); // Importa la conexión SQLite

// Agregar un producto
router.post('/agregar', (req, res) => {
    const { nombre, categoria, deposito, stock, estado } = req.body;

    if (!nombre || !categoria || !deposito || !stock || !estado) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const sql = `INSERT INTO inventario (Nombre, Categoria, Deposito, Stock, Estado) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [nombre, categoria, deposito, stock, estado], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ mensaje: 'Producto agregado', id: this.lastID });
    });
});

// Obtener todos los productos o filtrar por depósito
router.get('/consultar', (req, res) => {
    const { deposito } = req.query; // Captura el parámetro opcional

    let sql = `SELECT * FROM inventario`;
    let params = [];

    if (deposito) {
        sql += ` WHERE Deposito = ?`;
        params.push(deposito);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Eliminar un producto por ID
router.delete('/eliminar/:id', (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM inventario WHERE ID = ?`;
    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto eliminado exitosamente' });
    });
});


router.put('/actualizar/:id', (req, res) => {
    console.log("Datos recibidos en la actualización:", req.body); // Agregar este log
    const { id } = req.params;
    const { nombre, categoria, deposito, stock, estado } = req.body;

    if (!nombre || !categoria || !deposito || !stock || !estado) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const sql = `UPDATE inventario SET Nombre = ?, Categoria = ?, Deposito = ?, Stock = ?, Estado = ? WHERE ID = ?`;
    const params = [nombre, categoria, deposito, stock, estado, id];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ mensaje: 'Producto actualizado exitosamente' });
    });
});

router.get('/consultar/:id', (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM inventario WHERE ID = ?`;

    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(row);
    });
});

module.exports = router;
