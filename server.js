/**
 * 🚀 VARDIYA KAYIT SİSTEMİ v2.0
 * HES Dijital Operasyon Paneli - Dr. Soner ASLAN
 * 
 * Güvenlik: Helmet, Rate Limit, JWT Auth, CORS
 * Veritabanı: SQLite (better-sqlite3)
 * Loglama: Winston
 */

// ═══════════════════════════════════════
// 1. GEREKLİ MODÜLLER
// ═══════════════════════════════════════
require('dotenv').config(); // .env yüklemesi EN ÜSTTE

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Yerel modüller
const db = require('./config/database');
const logger = require('./utils/logger');
const { authenticateToken } = require('./middleware/auth');

// Route'lar
const authRoutes = require('./routes/auth');
// const vardiyaRoutes = require('./routes/vardiya'); // İleride eklenecek

// ═══════════════════════════════════════
// 2. EXPRESS UYGULAMASI
// ═══════════════════════════════════════
const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════
// 3. MIDDLEWARE'LER (SIRALI ÖNEMLİ!)
// ═══════════════════════════════════════

// 📦 Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🔐 Güvenlik Header'ları
app.use(helmet({
  contentSecurityPolicy: false, // Geliştirme modunda inline script'e izin ver
  crossOriginEmbedderPolicy: false
}));

// 🌐 CORS Ayarları
app.use(cors({
  origin: process.env.BASE_URL?.split(',')[0] || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ⚡ Rate Limiting (API için)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Her IP için max 100 istek
  message: { error: 'Çok fazla istek, lütfen 15 dakika bekleyin' },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', apiLimiter);

// 📁 Statik dosyalar (Frontend)
app.use(express.static(path.join(__dirname, 'public')));

// 📝 Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`, {
      ip: req.ip,
      user: req.user?.username || 'anonim',
      ua: req.get('user-agent')?.substring(0, 50)
    });
  });
  next();
});

// ═══════════════════════════════════════
// 4. ROUTE TANIMLARI
// ═══════════════════════════════════════

// 🔓 Public: Auth endpoint'leri
app.use('/api/auth', authRoutes);

// 🔐 Protected: Vardiya işlemleri (JWT gerektirir)
app.use('/api/kaydet/:tesis', authenticateToken);
app.use('/api/temizle/:tesis', authenticateToken);
app.use('/api/sil/:tesis', authenticateToken);

// ═══════════════════════════════════════
// 5. MEVCUT API ENDPOINT'LERİ (KORUNMUŞ)
// ═══════════════════════════════════════

// 📥 KAYDET - Hasan Uğurlu HES
app.post('/api/kaydet/hasan', (req, res) => {
  try {
    const data = req.body;
    const filePath = path.join(__dirname, 'data', 'hasan_ugurlu.json');
    
    // Data klasörü yoksa oluştur
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    
    // Mevcut veriyi oku veya yeni array oluştur
    let existingData = [];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.trim()) existingData = JSON.parse(content);
    }
    
    // Yeni kaydı ekle (tarih+vardiya unique kontrolü)
    const exists = existingData.some(d => 
      d.tarih === data.tarih && d.vardiya === data.vardiya
    );
    
    if (exists) {
      // Güncelle: mevcut kaydı bul ve replace et
      const index = existingData.findIndex(d => 
        d.tarih === data.tarih && d.vardiya === data.vardiya
      );
      existingData[index] = { ...data, updatedAt: new Date().toISOString() };
    } else {
      // Yeni kayıt ekle
      existingData.push({ ...data, createdAt: new Date().toISOString() });
    }
    
    // Dosyaya yaz
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
    
    // 📧 Bildirim gönder (async, hata kesici değil)
    sendNotifications(data, 'hasan').catch(err => 
      logger.error('Bildirim hatası:', err.message)
    );
    
    logger.success('Hasan Uğurlu kaydı başarılı', { 
      tarih: data.tarih, 
      vardiya: data.vardiya,
      user: req.user?.username 
    });
    
    res.json({ success: true, message: '✅ Kayıt başarılı' });
    
  } catch (err) {
    logger.error('Kayıt hatası (hasan):', err.message);
    res.status(500).json({ success: false, error: 'Sunucu hatası: ' + err.message });
  }
});

// 📥 KAYDET - Suat Uğurlu HES
app.post('/api/kaydet/suat', (req, res) => {
  try {
    const data = req.body;
    const filePath = path.join(__dirname, 'data', 'suat_ugurlu.json');
    
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    
    let existingData = [];
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.trim()) existingData = JSON.parse(content);
    }
    
    const exists = existingData.some(d => 
      d.tarih === data.tarih && d.vardiya === data.vardiya
    );
    
    if (exists) {
      const index = existingData.findIndex(d => 
        d.tarih === data.tarih && d.vardiya === data.vardiya
      );
      existingData[index] = { ...data, updatedAt: new Date().toISOString() };
    } else {
      existingData.push({ ...data, createdAt: new Date().toISOString() });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
    
    sendNotifications(data, 'suat').catch(err => 
      logger.error('Bildirim hatası:', err.message)
    );
    
    logger.success('Suat Uğurlu kaydı başarılı', { 
      tarih: data.tarih, 
      vardiya: data.vardiya,
      user: req.user?.username 
    });
    
    res.json({ success: true, message: '✅ Kayıt başarılı' });
    
  } catch (err) {
    logger.error('Kayıt hatası (suat):', err.message);
    res.status(500).json({ success: false, error: 'Sunucu hatası: ' + err.message });
  }
});

// 🗑️ TEMİZLE - Hasan Uğurlu
app.post('/api/temizle/hasan', (req, res) => {
  try {
    const { tarih, vardiya } = req.body;
    const filePath = path.join(__dirname, 'data', 'hasan_ugurlu.json');
    
    if (!fs.existsSync(filePath)) {
      return res.json({ success: true, message: '⚠️ Zaten boş' });
    }
    
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const beforeLength = data.length;
    
    data = data.filter(d => !(d.tarih === tarih && d.vardiya === vardiya));
    
    if (data.length === 0) {
      fs.unlinkSync(filePath);
    } else {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    }
    
    logger.info('Hasan Uğurlu temizlendi', { tarih, vardiya, removed: beforeLength - data.length });
    res.json({ success: true, message: '🧹 Temizlik başarılı' });
    
  } catch (err) {
    logger.error('Temizleme hatası (hasan):', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🗑️ TEMİZLE - Suat Uğurlu
app.post('/api/temizle/suat', (req, res) => {
  try {
    const { tarih, vardiya } = req.body;
    const filePath = path.join(__dirname, 'data', 'suat_ugurlu.json');
    
    if (!fs.existsSync(filePath)) {
      return res.json({ success: true, message: '⚠️ Zaten boş' });
    }
    
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const beforeLength = data.length;
    
    data = data.filter(d => !(d.tarih === tarih && d.vardiya === vardiya));
    
    if (data.length === 0) {
      fs.unlinkSync(filePath);
    } else {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    }
    
    logger.info('Suat Uğurlu temizlendi', { tarih, vardiya, removed: beforeLength - data.length });
    res.json({ success: true, message: '🧹 Temizlik başarılı' });
    
  } catch (err) {
    logger.error('Temizleme hatası (suat):', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ❌ SİL - Hasan Uğurlu
app.post('/api/sil/hasan', (req, res) => {
  try {
    const { tarih, vardiya } = req.body;
    const filePath = path.join(__dirname, 'data', 'hasan_ugurlu.json');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Kayıt bulunamadı' });
    }
    
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const filtered = data.filter(d => !(d.tarih === tarih && d.vardiya === vardiya));
    
    if (filtered.length === data.length) {
      return res.status(404).json({ success: false, error: 'Silinecek kayıt bulunamadı' });
    }
    
    if (filtered.length === 0) {
      fs.unlinkSync(filePath);
    } else {
      fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf8');
    }
    
    logger.warning('Hasan Uğurlu kayıt silindi', { tarih, vardiya, user: req.user?.username });
    res.json({ success: true, message: '🗑️ Silme başarılı' });
    
  } catch (err) {
    logger.error('Silme hatası (hasan):', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ❌ SİL - Suat Uğurlu
app.post('/api/sil/suat', (req, res) => {
  try {
    const { tarih, vardiya } = req.body;
    const filePath = path.join(__dirname, 'data', 'suat_ugurlu.json');
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Kayıt bulunamadı' });
    }
    
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const filtered = data.filter(d => !(d.tarih === tarih && d.vardiya === vardiya));
    
    if (filtered.length === data.length) {
      return res.status(404).json({ success: false, error: 'Silinecek kayıt bulunamadı' });
    }
    
    if (filtered.length === 0) {
      fs.unlinkSync(filePath);
    } else {
      fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2), 'utf8');
    }
    
    logger.warning('Suat Uğurlu kayıt silindi', { tarih, vardiya, user: req.user?.username });
    res.json({ success: true, message: '🗑️ Silme başarılı' });
    
  } catch (err) {
    logger.error('Silme hatası (suat):', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════
// 6. YARDIMCI FONKSİYONLAR
// ═══════════════════════════════════════

// 📧 E-posta & Telegram Bildirim Gönderici
async function sendNotifications(data, tesis) {
  const nodemailer = require('nodemailer');
  const fetch = require('node-fetch');
  
  const aliciEmails = process.env.ALICI_EPOSTALAR?.split(',') || [];
  const telegramIds = process.env.TELEGRAM_CHAT_IDS?.split(',') || [];
  
  // 📧 E-posta
  if (aliciEmails.length > 0 && process.env.EMAIL_USER) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      
      const mailOptions = {
        from: `"Vardiya Sistemi" <${process.env.EMAIL_USER}>`,
        to: aliciEmails.join(','),
        subject: `🔔 Yeni Vardiya Kaydı - ${tesis.toUpperCase()} - ${data.tarih}`,
        text: `Vardiya: ${data.vardiya}\nTesis: ${tesis}\nKayıt zamanı: ${new Date().toLocaleString('tr-TR')}\n\nDetaylar için sisteme giriş yapınız.`
      };
      
      await transporter.sendMail(mailOptions);
      logger.info('📧 E-posta bildirimi gönderildi');
    } catch (err) {
      logger.error('E-posta gönderim hatası:', err.message);
    }
  }
  
  // 📱 Telegram
  if (telegramIds.length > 0 && process.env.TELEGRAM_BOT_TOKEN) {
    try {
      const message = `🔔 *Yeni Vardiya Kaydı*\n🏭 *${tesis.toUpperCase()}*\n📅 ${data.tarih}\n🔄 Vardiya: ${data.vardiya}\n⏰ ${new Date().toLocaleTimeString('tr-TR')}`;
      
      for (const chatId of telegramIds) {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId.trim(),
            text: message,
            parse_mode: 'Markdown'
          })
        });
      }
      logger.info('📱 Telegram bildirimi gönderildi');
    } catch (err) {
      logger.error('Telegram gönderim hatası:', err.message);
    }
  }
}

// ═══════════════════════════════════════
// 7. FRONTEND FALLBACK & 404
// ═══════════════════════════════════════

// API olmayan tüm istekler için frontend'i serve et
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 Handler
app.use((req, res) => {
  logger.warning('404 - Bulunamadı', { path: req.path, method: req.method });
  res.status(404).json({ error: 'Endpoint bulunamadı' });
});

// ═══════════════════════════════════════
// 8. GLOBAL ERROR HANDLER
// ═══════════════════════════════════════
app.use((err, req, res, next) => {
  logger.error('Unhandled Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Sunucu hatası'
  });
});

// ═══════════════════════════════════════
// 9. SUNUCUYU BAŞLAT
// ═══════════════════════════════════════
const server = app.listen(PORT, () => {
  logger.success(`🚀 Vardiya Sistemi v2.0 çalışıyor!`, {
    port: PORT,
    env: process.env.NODE_ENV,
    url: `${process.env.BASE_URL || `http://localhost:${PORT}`}`
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('🛑 Sunucu kapatılıyor...');
  server.close(() => {
    logger.info('✅ Sunucu başarıyla kapatıldı');
    process.exit(0);
  });
});

module.exports = app; // Testler için export