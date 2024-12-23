const express = require('express');
const router = express.Router();
const estadosController = require('../Controllers/estadosController');
const authMiddleware = require('../middlewares/authMiddleware');

// Obtener todos los estados
router.get('/', authMiddleware,estadosController.getEstados);

// Obtener un estado por ID
router.get('/:id', authMiddleware,estadosController.getEstadoById);

// Crear un nuevo estado
router.post('/', authMiddleware,estadosController.createEstado);

// Actualizar un estado
router.put('/:id', authMiddleware,estadosController.updateEstado);

// Inactivar un estado (cambio de estado a "Inactivo")
router.delete('/:id', authMiddleware,estadosController.deleteEstado);

module.exports = router;
