const express = require('express');
const router = express.Router();
const categoriasController = require('../Controllers/categoriasController');
const authMiddleware = require('../middlewares/authMiddleware');

// Obtener todas las categorías de productos
router.get('/', authMiddleware,categoriasController.getCategorias);

// Obtener una categoría por ID
router.get('/:id', authMiddleware,categoriasController.getCategoriaById);

// Crear una nueva categoría
router.post('/', authMiddleware,categoriasController.createCategoria);

// Actualizar una categoría existente
router.put('/:id', authMiddleware,categoriasController.updateCategoria);

// Inactivar una categoría (cambio de estado)
router.delete('/:id', authMiddleware,categoriasController.deleteCategoria);

module.exports = router;
