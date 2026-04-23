/**
 * JWT Authentication Middleware
 */
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../utils/logger');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Erişim token\'ı gerekli' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warning('Token doğrulama hatası', { error: err.message });
      return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token' });
    }
    req.user = user;
    next();
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.warning('Yetkisiz erişim denemesi', { 
        user: req.user.username, 
        required: roles 
      });
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };