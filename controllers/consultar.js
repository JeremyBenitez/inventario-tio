const express = require('express');
const router = express.Router();
const db = require('../controllers/conexion'); // Conexión a SQLite

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

module.exports = router;
