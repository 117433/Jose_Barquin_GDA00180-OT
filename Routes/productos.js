const express = require('express');
const router = express.Router();
const productosController = require('../Controllers/productosController');
const authMiddleware = require('../middlewares/authMiddleware'); // Importamos el middleware

// Rutas para el CRUD de productos
router.get('/', authMiddleware, productosController.getProductos); // Obtener todos los productos
router.get('/:id', authMiddleware, productosController.getProductoById); // Obtener un producto por ID
router.post('/', authMiddleware, productosController.createProducto); // Crear un nuevo producto
router.put('/:id', authMiddleware, productosController.updateProducto); // Actualizar un producto
router.delete('/:id', authMiddleware, productosController.deleteProducto); // Eliminar un producto

module.exports = router;
