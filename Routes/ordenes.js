const express = require('express');
const router = express.Router();
const ordenesController = require('../Controllers/ordenesController');
const authMiddleware = require('../middlewares/authMiddleware');

// Obtener todas las órdenes 
router.get('/', authMiddleware,ordenesController.getOrdenes);

// Obtener una orden por ID 
router.get('/:id', authMiddleware,ordenesController.getOrdenById);

// Crear una nueva orden con detalles
router.post('/', authMiddleware,ordenesController.createOrden);

// Actualizar información de una orden 
router.put('/:id', authMiddleware,ordenesController.updateOrden);

// Inactivar una orden
router.delete('/:id', authMiddleware,ordenesController.deleteOrden);

module.exports = router;
