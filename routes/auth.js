const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli' });
    }

    console.log('🔍 Login attempt:', { username, passwordLength: password?.length });

    // 🔍 Kullanıcıyı veritabanında ara
    const stmt = db.prepare('SELECT * FROM users WHERE username = ? AND is_active = 1');
    const user = await stmt.get(username);
    
    console.log('🔍 DB Result:', user ? { id: user.id, username: user.username, hasHash: !!user.password_hash } : 'NULL');

    if (!user) {
      logger.warning('Başarısız login denemesi', { username });
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }

    // 🔐 Şifreyi kontrol et - KRİTİK KONTROL
    console.log('🔐 Comparing password. Hash type:', typeof user.password_hash, 'Length:', user.password_hash?.length);
    
    if (!user.password_hash || typeof user.password_hash !== 'string') {
      logger.error('password_hash geçersiz!', { type: typeof user.password_hash, value: user.password_hash });
      return res.status(500).json({ error: 'Sunucu yapılandırma hatası' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    console.log('🔐 Password valid:', validPassword);
    
    if (!validPassword) {
      logger.warning('Yanlış şifre denemesi', { username });
      return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
    }

    // 🎫 JWT token oluştur
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.success('Başarılı login', { username, role: user.role });
    
    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });

  } catch (err) {
    logger.error('Login hatası', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Sunucu hatası: ' + err.message });
  }
});

module.exports = router;
console.log('✅ auth.js yüklendi');
