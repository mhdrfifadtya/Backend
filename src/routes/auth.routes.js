const router = require('express').Router();
const { register, login, profile } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET  /api/auth/profile  (protected)
router.get('/profile', authenticate, profile);

module.exports = router;
