const router = require('express').Router();
const { getAll, getOne, update, remove } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// GET    /api/users             – admin only
router.get('/',     authenticate, authorize('admin'), getAll);

// GET    /api/users/:id         – admin or self
router.get('/:id',  authenticate, getOne);

// PUT    /api/users/:id         – admin or self
router.put('/:id',  authenticate, update);

// DELETE /api/users/:id         – admin only
router.delete('/:id', authenticate, authorize('admin'), remove);

module.exports = router;
