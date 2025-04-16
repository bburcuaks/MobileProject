const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createTest,
  getTestsByTcNo,
  getAllTests,
  getPatientByTcNo,
  getUniqueTestNames
} = require('../controllers/testController');

// Test rotaları
router.post('/', protect, createTest);
router.get('/tc/:tcNo', protect, getTestsByTcNo);
router.get('/', protect, getAllTests);

// TC No ile hasta sorgulama
router.get('/patient/:tcNo', protect, getPatientByTcNo);

// TC No'ya ait benzersiz test adlarını getir
router.get('/test-names/:tcNo', protect, getUniqueTestNames);

module.exports = router;
