const sqlite3 = require('sqlite3').verbose();

// Conectar a la base de datos
const db = new sqlite3.Database('./db/inventario_control.db', (err) => {
    if (err) {
        console.error('❌ Error al conectar con la base de datos:', err.message);
    } else {
        console.log('✅ Conexión exitosa a la base de datos SQLite.');
    }
});

module.exports = db;

