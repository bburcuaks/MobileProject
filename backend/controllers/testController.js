const Test = require('../models/Test');

// Yeni test kaydı oluştur
const createTest = async (req, res) => {
  try {
    const testData = req.body;
    const test = new Test(testData);
    await test.save();
    res.status(201).json({ success: true, data: test });
  } catch (error) {
    console.error('Test kayıt hatası:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// TC numarasına göre test sonuçlarını getir
const getTestsByTcNo = async (req, res) => {
  try {
    const { tcNo } = req.params;
    const tests = await Test.find({ tcNo }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    console.error('Test sonuçları getirme hatası:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Tüm test sonuçlarını getir
const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tests });
  } catch (error) {
    console.error('Tüm testleri getirme hatası:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// TC No ile hasta sorgulama
const getPatientByTcNo = async (req, res) => {
  try {
    const { tcNo } = req.params;

    // TC No'ya ait tüm test kayıtlarını tarihe göre sırala
    const patientTests = await Test.find({ tcNo }).sort({ createdAt: -1 });

    if (!patientTests || patientTests.length === 0) {
      return res.status(404).json({ success: false, message: 'Hasta bulunamadı' });
    }

    // En son kaydı hasta bilgileri için kullan
    const latestTest = patientTests[0];
    
    // Tüm test kayıtlarını düzenle
    const allTests = patientTests.map(test => ({
      tests: test.tests,
      sampleTime: test.sampleTime,
      createdAt: test.createdAt
    }));

    // Hasta bilgileri ve tüm test kayıtlarını gönder
    res.status(200).json({
      success: true,
      data: {
        patientInfo: {
          tcNo: latestTest.tcNo,
          fullName: latestTest.fullName,
          birthDate: latestTest.birthDate,
          gender: latestTest.gender,
          birthPlace: latestTest.birthPlace
        },
        testHistory: allTests
      }
    });
  } catch (error) {
    console.error('Hasta sorgulama hatası:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// TC No'ya ait benzersiz test adlarını getir
const getUniqueTestNames = async (req, res) => {
  try {
    const { tcNo } = req.params;

    // TC No'ya ait tüm test kayıtlarını bul
    const patientTests = await Test.find({ tcNo });

    if (!patientTests || patientTests.length === 0) {
      return res.status(404).json({ success: false, message: 'Hasta için test kaydı bulunamadı' });
    }

    // Tüm test kayıtlarından benzersiz test adlarını çıkar
    const uniqueTestNames = [...new Set(
      patientTests.flatMap(test => 
        test.tests.map(t => t.testName)
      )
    )].sort();

    res.status(200).json({ success: true, data: { testNames: uniqueTestNames } });
  } catch (error) {
    console.error('Test adları getirme hatası:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  createTest,
  getTestsByTcNo,
  getAllTests,
  getPatientByTcNo,
  getUniqueTestNames
};