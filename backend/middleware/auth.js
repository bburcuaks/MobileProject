const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Yetkilendirme başarısız: Token bulunamadı' });
        }


        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Token'dan gelen userId'yi req.user'a ata
        req.user = {
            id: decoded.userId // userId olarak değiştirildi
        };
        
        next();
    } catch (error) {
        console.error('Auth middleware hatası:', error);
        res.status(401).json({ message: 'Yetkilendirme başarısız' });
    }
};

module.exports = auth;
