const express = require('express');
const router = express.Router();
const clientesController = require('../Controllers/clientesController');
const authMiddleware = require('../middlewares/authMiddleware');

// Obtener todos los clientes
router.get('/', authMiddleware,clientesController.getClientes);

// Obtener un cliente por ID
router.get('/:id', authMiddleware,clientesController.getClienteById);

// Crear un nuevo cliente
router.post('/', authMiddleware,clientesController.createCliente);

// Actualizar un cliente existente
router.put('/:id', authMiddleware,clientesController.updateCliente);

// Eliminar un cliente
router.delete('/:id', authMiddleware,clientesController.deleteCliente);

module.exports = router;
