// En routes/logout.js
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {  // Cambiado de '/logout' a '/'
  res.clearCookie('token', {
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  res.json({
    mensaje: 'Sesión cerrada exitosamente',
    clearLocalStorage: true
  });
});

module.exports = router;