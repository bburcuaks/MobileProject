const Guide = require('../models/Guide');

// Yeni kılavuz oluşturma
const createGuide = async (req, res) => {
    try {
        const { guideName, tests } = req.body;
        const createdBy = req.user.id; // JWT'den gelen kullanıcı ID'si

        console.log('Gelen veriler:', { guideName, tests, createdBy });

        // Kılavuz adının benzersiz olup olmadığını kontrol et
        const existingGuide = await Guide.findOne({ guideName });
        if (existingGuide) {
            return res.status(400).json({ message: 'Bu isimde bir kılavuz zaten mevcut' });
        }

        // Yeni kılavuzu oluştur
        const guide = new Guide({
            guideName,
            tests,
            createdBy
        });

        await guide.save();
        console.log('Kılavuz kaydedildi:', guide);
        res.status(201).json(guide);
    } catch (error) {
        console.error('Kılavuz oluşturma hatası:', error);
        res.status(500).json({ message: 'Kılavuz oluşturulurken bir hata oluştu' });
    }
};

// Test için kılavuz değerlerini kontrol et
const checkGuideValues = async (req, res) => {
    try {
        const { testName, ageInMonths } = req.body;

        // Tüm kılavuzları tara ve bu test adını içerenleri bul
        const guides = await Guide.find({
            'tests.testName': testName
        });

        if (!guides || guides.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bu test için kılavuz bulunamadı'
            });
        }

        // Her kılavuz için uygun değerleri bul
        const matchingGuides = [];

        for (const guide of guides) {
            // Test adına uyan testi bul
            const test = guide.tests.find(t => t.testName === testName);
            if (!test) continue;

            // Yaş aralığına uyan değeri bul
            const ageRange = test.ageRanges.find(range => 
                ageInMonths >= range.minAge && ageInMonths <= range.maxAge
            );

            if (ageRange) {
                matchingGuides.push({
                    guideName: guide.guideName,
                    testName: test.testName,
                    geometricMean: ageRange.geometricMean,
                    geometricSD: ageRange.geometricSD,
                    mean: ageRange.mean,
                    sd: ageRange.sd,
                    minValue: ageRange.minValue,
                    maxValue: ageRange.maxValue,
                    confidenceLow: ageRange.confidenceLow,
                    confidenceHigh: ageRange.confidenceHigh,
                    ageRange: `${ageRange.minAge}-${ageRange.maxAge} ay`
                });
            }
        }

        if (matchingGuides.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Bu yaş aralığı için uygun kılavuz değeri bulunamadı'
            });
        }

        res.status(200).json({
            success: true,
            data: matchingGuides
        });

    } catch (error) {
        console.error('Kılavuz kontrolü hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Kılavuz değerleri kontrol edilirken bir hata oluştu'
        });
    }
};

// Tüm kılavuzları getirme
const getAllGuides = async (req, res) => {
    try {
        const guides = await Guide.find()
            .populate('createdBy', 'firstName lastName')
            .select('-tests.ageRanges'); // Performans için yaş aralıklarını hariç tut
        res.json(guides);
    } catch (error) {
        console.error('Kılavuz listesi getirme hatası:', error);
        res.status(500).json({ message: 'Kılavuzlar getirilirken bir hata oluştu' });
    }
};

// Belirli bir kılavuzu getirme
const getGuideById = async (req, res) => {
    try {
        const guide = await Guide.findById(req.params.id)
            .populate('createdBy', 'firstName lastName');
        
        if (!guide) {
            return res.status(404).json({ message: 'Kılavuz bulunamadı' });
        }

        res.json(guide);
    } catch (error) {
        console.error('Kılavuz getirme hatası:', error);
        res.status(500).json({ message: 'Kılavuz getirilirken bir hata oluştu' });
    }
};

// Kılavuz güncelleme
const updateGuide = async (req, res) => {
    try {
        const { guideName, tests } = req.body;
        const guideId = req.params.id;

        // Kılavuzun var olup olmadığını kontrol et
        const guide = await Guide.findById(guideId);
        if (!guide) {
            return res.status(404).json({ message: 'Kılavuz bulunamadı' });
        }

        // Kullanıcının kılavuzun sahibi olup olmadığını kontrol et
        if (guide.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Bu kılavuzu güncelleme yetkiniz yok' });
        }

        // Yeni isim verilmişse ve başka bir kılavuz bu ismi kullanıyorsa hata ver
        if (guideName && guideName !== guide.guideName) {
            const existingGuide = await Guide.findOne({ guideName });
            if (existingGuide) {
                return res.status(400).json({ message: 'Bu isimde bir kılavuz zaten mevcut' });
            }
        }

        // Kılavuzu güncelle
        guide.guideName = guideName || guide.guideName;
        guide.tests = tests || guide.tests;
        
        await guide.save();
        res.json(guide);
    } catch (error) {
        console.error('Kılavuz güncelleme hatası:', error);
        res.status(500).json({ message: 'Kılavuz güncellenirken bir hata oluştu' });
    }
};

// Kılavuz silme
const deleteGuide = async (req, res) => {
    try {
        const guide = await Guide.findById(req.params.id);
        
        if (!guide) {
            return res.status(404).json({ message: 'Kılavuz bulunamadı' });
        }

        // Kullanıcının kılavuzun sahibi olup olmadığını kontrol et
        if (guide.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Bu kılavuzu silme yetkiniz yok' });
        }

        await guide.remove();
        res.json({ message: 'Kılavuz başarıyla silindi' });
    } catch (error) {
        console.error('Kılavuz silme hatası:', error);
        res.status(500).json({ message: 'Kılavuz silinirken bir hata oluştu' });
    }
};

// Tüm test isimlerini getir
const getAllTestNames = async (req, res) => {
    try {
        const guides = await Guide.find({}, 'tests.testName');
        
        // Tüm test isimlerini düz bir diziye çevir ve tekrar edenleri kaldır
        const testNames = [...new Set(
            guides.flatMap(guide => 
                guide.tests.map(test => test.testName)
            )
        )].sort();

        res.json(testNames);
    } catch (error) {
        console.error('Test isimleri getirme hatası:', error);
        res.status(500).json({ message: 'Test isimleri alınırken bir hata oluştu' });
    }
};

// Test değerini değerlendir
const evaluateTest = async (req, res) => {
    try {
        const { testName, ageInMonths, testValue } = req.body;

        // Aynı test adına sahip tüm kılavuzları bul
        const guides = await Guide.find({
            'tests.testName': testName
        });

        if (!guides || guides.length === 0) {
            return res.status(404).json({ message: 'Test rehberi bulunamadı' });
        }

        // Her kılavuz için değerlendirme yap
        const guideResults = guides.map(guide => {
            const test = guide.tests.find(t => t.testName === testName);
            const ageRange = test.ageRanges.find(range => 
                ageInMonths >= range.minAge && ageInMonths <= range.maxAge
            );

            if (!ageRange) {
                return {
                    guideName: guide.guideName,
                    error: 'Bu yaş için referans aralığı bulunamadı'
                };
            }

            const results = {
                geometric: null,
                mean: null,
                minMax: null,
                confidence: null
            };

            // Geometrik ortalama kontrolü
            if (ageRange.geometricMean !== undefined && 
                !(ageRange.geometricMean === 0 && ageRange.geometricSD === 0)) {
                const upperLimit = ageRange.geometricMean + (2 * ageRange.geometricSD);
                const lowerLimit = ageRange.geometricMean - (2 * ageRange.geometricSD);
                
                results.geometric = {
                    status: testValue > upperLimit ? 'YUKSEK' : 
                            testValue < lowerLimit ? 'ALCAK' : 'NORMAL',
                    ranges: {
                        mean: ageRange.geometricMean,
                        sd: ageRange.geometricSD,
                        upperLimit,
                        lowerLimit
                    }
                };
            }
            
            // Normal ortalama kontrolü
            if (ageRange.mean !== undefined && 
                !(ageRange.mean === 0 && ageRange.sd === 0)) {
                const upperLimit = ageRange.mean + (2 * ageRange.sd);
                const lowerLimit = ageRange.mean - (2 * ageRange.sd);
                
                results.mean = {
                    status: testValue > upperLimit ? 'YUKSEK' : 
                            testValue < lowerLimit ? 'ALCAK' : 'NORMAL',
                    ranges: {
                        mean: ageRange.mean,
                        sd: ageRange.sd,
                        upperLimit,
                        lowerLimit
                    }
                };
            }

            // Min-Max kontrolü
            if (ageRange.minValue !== undefined && 
                !(ageRange.minValue === 0 && ageRange.maxValue === 0)) {
                results.minMax = {
                    status: testValue > ageRange.maxValue ? 'YUKSEK' : 
                            testValue < ageRange.minValue ? 'ALCAK' : 'NORMAL',
                    ranges: {
                        min: ageRange.minValue,
                        max: ageRange.maxValue
                    }
                };
            }

            // Güven aralığı kontrolü
            if (ageRange.confidenceLow !== undefined && 
                !(ageRange.confidenceLow === 0 && ageRange.confidenceHigh === 0)) {
                results.confidence = {
                    status: testValue > ageRange.confidenceHigh ? 'YUKSEK' : 
                            testValue < ageRange.confidenceLow ? 'ALCAK' : 'NORMAL',
                    ranges: {
                        low: ageRange.confidenceLow,
                        high: ageRange.confidenceHigh
                    }
                };
            }

            return {
                guideName: guide.guideName,
                results
            };
        });

        res.json({
            guideResults,
            testValue
        });
    } catch (error) {
        console.error('Test değerlendirme hatası:', error);
        res.status(500).json({ message: 'Test değerlendirilirken bir hata oluştu' });
    }
};

module.exports = {
    createGuide,
    getAllGuides,
    getGuideById,
    updateGuide,
    deleteGuide,
    getAllTestNames,
    evaluateTest,
    checkGuideValues
};
