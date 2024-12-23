const express = require('express');
const router = express.Router();
const usuariosController = require('../Controllers/usuariosController');
const authMiddleware = require('../middlewares/authMiddleware'); 


// Obtener todos los usuarios
router.get('/', authMiddleware,usuariosController.getUsuarios);

// Obtener un usuario por ID
router.get('/:id', authMiddleware,usuariosController.getUsuarioById);

// Crear un nuevo usuario
router.post('/', usuariosController.createUsuario);

// Actualizar un usuario existente
router.put('/:id', authMiddleware,usuariosController.updateUsuario);

// Inactivar un usuario (cambio de estado a inactivo)
router.delete('/:id', authMiddleware,usuariosController.deleteUsuario);

// Para validar el usuario y recibir un token
router.post('/login', usuariosController.loginUsuario); 




module.exports = router;
