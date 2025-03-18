//agregar producto

const db = require('../controllers/conexion'); // Importa la conexión a SQLite

//insertar
const agregarProducto = (nombre, categoria, deposito, stock, estado) => {
  const sql = `INSERT INTO inventario (Nombre, Categoria, Deposito, Stock, Estado) VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [nombre, categoria, deposito, stock, estado], function (err) {
    if (err) {
      console.error('❌ Error al insertar producto:', err.message);
    } else {
      console.log('✅ Producto agregado con ID:', this.lastID);
    }
  });
};
// Prueba insertando un nuevo producto
agregarProducto("Laptop Dell", "Electrónica", "Principal", 10, "Disponible");
