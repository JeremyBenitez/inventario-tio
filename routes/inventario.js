const express = require('express');
const router = express.Router();
const db = require('../controllers/conexion'); // Importa la conexión SQLite

// Agregar un producto
router.post('/agregar', (req, res) => {
    const { nombre, categoria, serial, modelo, marca, deposito, stock, estado } = req.body;

    if (!nombre || !categoria || !serial || !modelo || !marca || !deposito || !stock || !estado) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const sql = `INSERT INTO inventario (Nombre, Categoria, Serial, Modelo, Marca, Deposito, Stock, Estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [nombre, categoria, serial, modelo, marca, deposito, stock, estado], function (err) {
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
    const { nombre, categoria, serial, modelo, marca, deposito, stock, estado } = req.body;

    if (!nombre || !categoria || !serial || !modelo || !marca ||!deposito || !stock || !estado) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const sql = `UPDATE inventario SET Nombre = ?, Categoria = ?, Serial = ?, Modelo = ?, Marca = ?, Deposito = ?, Stock = ?, Estado = ? WHERE ID = ?`;
    const params = [nombre, categoria, serial, modelo, marca, deposito, stock, estado, id];

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



// Middleware para validar JSON
router.use(express.json());

// Middleware para manejar errores de JSON
router.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON malformado' });
  }
  next();
});

router.post('/despachos', (req, res) => {
    const { producto_id, cantidad, destinatario, fecha_despacho, deposito_origen } = req.body;
  
    // Validaciones básicas
    if (!producto_id || !cantidad || !destinatario || !fecha_despacho || !deposito_origen) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
  
    db.serialize(() => {
      // 1. Verificar producto y stock
      db.get('SELECT Stock, Nombre FROM inventario WHERE ID = ?', [producto_id], (err, producto) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        if (producto.Stock < cantidad) return res.status(400).json({ error: 'Stock insuficiente' });
  
        // 2. Generar número de despacho
        db.get('SELECT MAX(numero_despacho) as max_num FROM Despachos', (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          const nuevoNumero = (result?.max_num || 0) + 1;
  
          // 3. Insertar despacho
          db.run(
            `INSERT INTO Despachos (
              numero_despacho, fecha_despacho, destinatario, 
              cantidad, deposito_origen, producto_id
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [nuevoNumero, fecha_despacho, destinatario, cantidad, deposito_origen, producto_id],
            function(err) {
              if (err) return res.status(500).json({ error: err.message });
  
              // 4. Actualizar inventario
              db.run(
                'UPDATE inventario SET Stock = Stock - ? WHERE ID = ?',
                [cantidad, producto_id],
                (err) => {
                  if (err) return res.status(500).json({ 
                    warning: 'Despacho creado pero no se actualizó inventario',
                    error: err.message 
                  });
  
                  res.status(201).json({
                    success: true,
                    despacho: {
                      id: this.lastID,
                      numero_despacho: nuevoNumero,
                      producto: producto.Nombre,
                      stock_restante: producto.Stock - cantidad
                    }
                  });
                }
              );
            }
          );
        });
      });
    });
  });

module.exports = router;
