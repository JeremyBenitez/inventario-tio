const express = require('express');
const path = require('path');
const session = require('express-session');
const inventarioRoutes = require('./routes/inventario');
const usuariosRoutes = require('./routes/usuarios');
const indexRouter = require('./routes/index');

const app = express();

// Configurar el motor de vistas como EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para archivos estáticos
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());

// Configuración de sesión
app.use(session({
  secret: '123', // Cambia esto por una clave secreta
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Cambia a true si usas HTTPS
}));

// Middleware para parsear el cuerpo de las solicitudes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para verificar autenticación
function ensureAuthenticated(req, res, next) {
  if (req.session.user) {
    // Configurar encabezados para evitar caché
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return next();
  }
  // Si no está autenticado, redirigir a la página de inicio de sesión
  res.redirect('/usuarios/login');
}

// Usar las rutas con el middleware de autenticación
app.use('/inventario', inventarioRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/', indexRouter);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo salió mal!');
});

// Exportar el middleware para usarlo en otros archivos
module.exports = {
  ensureAuthenticated
};

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});