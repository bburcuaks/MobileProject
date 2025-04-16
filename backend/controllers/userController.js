const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Kullanıcı kaydı
const registerUser = async (req, res) => {
    try {
        console.log('Register isteği alındı controller:', req.body);
        const { tcNo, firstName, lastName, email, password } = req.body;

        if (!tcNo || !firstName || !lastName || !email || !password) {
               return res.status(400).json({ message: 'Tüm alanları doldurun' });
        }

        // TC Kimlik numarası kontrolü
        if (tcNo.length !== 11) {
            return res.status(400).json({ message: 'TC Kimlik numarası 11 haneli olmalıdır' });
        }

        // TC Kimlik numarası kontrolü
        const existingTcNo = await User.findOne({ tcNo });
        if (existingTcNo) {
            return res.status(400).json({ message: 'Bu TC Kimlik numarası zaten kayıtlı' });
        }

        // Email kontrolü
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu email zaten kayıtlı' });
        }

        // Şifreyi hashleme
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı oluşturma
        const user = new User({
            tcNo,
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await user.save();
        
        res.status(201).json({ 
            message: 'Kullanıcı başarıyla oluşturuldu',
            userId: user._id 
        });
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({ 
            message: 'Sunucu hatası',
            error: error.message 
        });
    }
};

// Kullanıcı girişi
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kullanıcıyı bulma
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Şifre kontrolü
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Geçersiz şifre' });
        }

        // JWT token oluşturma
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                tcNo: user.tcNo,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

// Kullanıcı bilgilerini getir
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }
        res.json(user);
    } catch (error) {
        console.error('Profil getirme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
};

// Kullanıcı profilini güncelle
const updateProfile = async (req, res) => {
    try {
        
        const { tcNo, firstName, lastName, email, newPassword } = req.body;
        const userId = req.user.id || req.user._id; // JWT'den gelen kullanıcı ID'si

        // Kullanıcıyı bul
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Bilgileri güncelle
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;

        // Eğer yeni şifre varsa güncelle
        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        // Kullanıcıyı kaydet
        await user.save();

        // Şifreyi çıkararak kullanıcı bilgilerini gönder
        const userResponse = {
            _id: user._id,
            tcNo: user.tcNo,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        };

        res.json(userResponse);
    } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        res.status(500).json({ message: 'Profil güncellenirken bir hata oluştu' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateProfile
};
