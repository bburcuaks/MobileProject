# E-Lab System

E-Lab System, immünoloji laboratuvar sonuçlarını dijital ortamda yönetmeyi ve takip etmeyi sağlayan modern bir laboratuvar yönetim sistemidir. React Native ile geliştirilmiş bu mobil uygulama, laboratuvar personeli ve yöneticiler için kapsamlı bir çözüm sunar.

## Temel Özellikler

### Kimlik Doğrulama ve Yetkilendirme
- Güvenli giriş ve kayıt sistemi
- Rol tabanlı yetkilendirme (Admin/Kullanıcı)
- Detaylı profil yönetimi (kayıt, düzenleme, görüntüleme)
- Her rol için özelleştirilmiş arayüzler

### Kullanıcı Özellikleri
- Geçmiş tahlillerin listelenmesi ve görüntülenmesi
- İmmünoglobulin değerlerinin (IgA, IgM, IgG, IgG1-4) takibi
- Sonuçların renkli gösterim ile kategorize edilmesi:
  - Yüksek değerler 
  - Normal değerler 
  - Düşük değerler 
- Hasta profil yönetimi ve geçmiş takibi

### Yönetici (Admin) Özellikleri
- Kılavuz oluşturma ve veri girişi
- Yaşa göre referans değer aralıkları belirleme:
  - IgA, IgM, IgG
  - IgG alt grupları (IgG1, IgG2, IgG3, IgG4)
  -Değer değişimlerinin karşılaştırmalı analizi
- Hasta takip sistemi:
  - Ad-soyad bazlı arama
  - Tarihsel tahlil sonuçları görüntüleme
  - Değer değişimlerinin karşılaştırmalı analizi
- Trend analizi (artış/azalış/değişim yok)

## Teknik Özellikler

### Kullanılan Teknolojiler
- **Frontend:** React Native
- **State Yönetimi:** Context API
- **UI Bileşenleri:** Custom Components
- **Backend:** Node.js & Express
- **Veritabanı:** MongoDB

## Proje Yapısı

```
e-lab-system/
├── src/
│   ├── components/         # UI bileşenleri
│   ├── screens/           # Uygulama ekranları
│   │   ├── auth/         # Giriş/Kayıt ekranları
│   │   ├── admin/        # Yönetici ekranları
│   │   └── user/         # Kullanıcı ekranları
│   ├── services/         # API servisleri
│   ├── context/          # State yönetimi
│   └── utils/            # Yardımcı fonksiyonlar
│
└── server/
    ├── controllers/      # İş mantığı
    ├── models/          # Veri modelleri
    ├── routes/          # API rotaları
    └── middleware/      # Yetkilendirme
```

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. Uygulamayı başlatın:
```bash
npm start
```

## Uygulama Özellikleri

### Kullanıcı Arayüzü
- Sezgisel ve kullanıcı dostu tasarım
- Rol bazlı özelleştirilmiş menüler
- Renkli göstergelerle kolay sonuç takibi
- Responsive tasarım
- Detaylı profil yönetimi
- Kılavuz oluşturma ve veri girişi
- Yetkilendirme (Admin/Kullanıcı)
- Hasta takip sistemi
- Değer değişimlerinin karşılaştırmalı analizi
- Trend analizi (artış/azalış/değişim yok)

### Yönetici Arayüzü
- Sezgisel ve kullanıcı dostu tasarım
- Rol bazlı özelleştirilmiş menüler
- Renkli göstergelerle kolay sonuç takibi
- Responsive tasarım
- Detaylı profil yönetimi
- Kılavuz oluşturma ve veri girişi
- Yetkilendirme (Admin/Kullanıcı)
- Hasta takip sistemi
- Değer değişimlerinin karşılaştırmalı analizi
- Trend analizi (artış/azalış/değişim yok)
