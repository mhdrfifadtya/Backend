const router = require('express').Router();
const { getAll, getOne, create, update, remove } = require('../controllers/product.controller');
const { authenticate } = require('../middleware/auth.middleware');

// GET    /api/products          – publik, bisa search & paginasi
router.get('/',     getAll);

// GET    /api/products/:id      – publik
router.get('/:id',  getOne);

// POST   /api/products          – harus login
router.post('/',    authenticate, create);

// PUT    /api/products/:id      – harus login (admin atau pemilik)
router.put('/:id',  authenticate, update);

// DELETE /api/products/:id      – harus login (admin atau pemilik)
router.delete('/:id', authenticate, remove);

module.exports = router;
