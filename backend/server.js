const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const guideRoutes = require('./routes/guideRoutes');
const testRoutes = require('./routes/testRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Hata ayıklama için middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    console.log('Request body:', req.body);
    next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/tests', testRoutes);

// MongoDB bağlantısı
console.log('MongoDB bağlantısı başlatılıyor...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB bağlantısı başarılı');
        
        // Mevcut koleksiyonları listele
        mongoose.connection.db.listCollections().toArray()
            .then(collections => {
                console.log('Mevcut koleksiyonlar:', collections.map(c => c.name));
            })
            .catch(err => console.error('Koleksiyon listesi alınamadı:', err));
    })
    .catch((err) => {
        console.error('MongoDB bağlantı hatası:', err);
        process.exit(1); // Bağlantı başarısız olursa uygulamayı sonlandır
    });

// MongoDB bağlantı olaylarını dinle
mongoose.connection.on('error', err => {
    console.error('MongoDB bağlantı hatası:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB bağlantısı kesildi');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});
