const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerUser, loginUser, updateProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');

// Kayıt olma ve giriş rotaları
router.post('/register', registerUser);
router.post('/login', loginUser);

// Profil güncelleme rotası (auth middleware ile korunuyor)
router.put('/update-profile', auth, updateProfile);

module.exports = router;