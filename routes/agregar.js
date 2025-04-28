const express = require('express');
const router = express.Router();
const db = require('../controllers/conexion'); // Importa la conexión SQLite
// Endpoint para agregar productos al inventario
router.post('/agregar', (req, res) => {
    const { 
        nombre, 
        categoria, 
        serial, 
        modelo, 
        marca, 
        deposito, 
        stock, 
        estado, 
        proveedor 
    } = req.body;

    // Validación de campos obligatorios
    if (!nombre || !categoria || !serial || !modelo || !marca || !deposito || !stock || !estado || !proveedor) {
        return res.status(400).json({ 
            success: false,
            error: 'Todos los campos son obligatorios',
            camposFaltantes: {
                nombre: !nombre,
                categoria: !categoria,
                serial: !serial,
                modelo: !modelo,
                marca: !marca,
                deposito: !deposito,
                stock: !stock,
                estado: !estado,
                proveedor: !proveedor
            }
        });
    }

    // Validación adicional del stock (debe ser número positivo)
    if (isNaN(stock) || stock <= 0) {
        return res.status(400).json({ 
            success: false,
            error: 'El stock debe ser un número positivo'
        });
    }

    // Validación de serial único
    const checkSerialQuery = 'SELECT * FROM inventario WHERE Serial = ?';
    db.get(checkSerialQuery, [serial], (err, row) => {
        if (err) {
            return res.status(500).json({ 
                success: false,
                error: 'Error al verificar el serial'
            });
        }

        if (row) {
            return res.status(400).json({ 
                success: false,
                error: 'El serial ya existe en el inventario'
            });
        }

        // Insertar el nuevo producto
        const insertQuery = `
            INSERT INTO inventario 
            (Nombre, Categoria, Serial, Modelo, Marca, Deposito, Stock, Estado, Proveedor) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(insertQuery, 
            [nombre, categoria, serial, modelo, marca, deposito, stock, estado, proveedor], 
            function(err) {
                if (err) {
                    return res.status(500).json({ 
                        success: false,
                        error: 'Error al agregar el producto: ' + err.message
                    });
                }

                // Éxito - devolver el ID del nuevo producto
                res.status(201).json({ 
                    success: true,
                    mensaje: 'Producto agregado exitosamente',
                    id: this.lastID,
                    producto: {
                        id: this.lastID,
                        nombre,
                        categoria,
                        serial,
                        modelo,
                        marca,
                        deposito,
                        stock,
                        estado,
                        proveedor
                    }
                });
            }
        );
    });
});

module.exports = router;
