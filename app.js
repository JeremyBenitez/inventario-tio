const express = require('express');
const path = require('path');
const session = require('express-session'); // Importar express-session
const inventarioRoutes = require('./routes/inventario');
const usuariosRoutes = require('./routes/usuarios');
const indexRouter = require('./routes/index'); // Importar las rutas
const despachorecepcionRoutes = require('./routes/despachorecepcion');

const app = express();

// Configurar el motor de vistas como EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Asegura la ubicación de las vistas

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json()); // Para leer JSON en las peticiones

// Configurar el middleware de sesión
app.use(session({
    secret: 'tu_secreto_aqui',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Cambia a true si usas HTTPS
}));

// Usar las rutas
app.use('/inventario', inventarioRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/despachorecepcion', despachorecepcionRoutes);
app.use('/', indexRouter);

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
