const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './data/vardiya.db';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error('❌ DB Connect Error:', err.message);
  else console.log('✅ SQLite Connected:', dbPath);
});

db.run('PRAGMA foreign_keys = ON');

// ✅ GARANTİLİ WRAPPER: sqlite3 callback yapısına tam uyumlu
db.prepare = function(sql) {
  return {
    run: (...params) => new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastInsertRowid: this.lastID, changes: this.changes });
      });
    }),
    
    // 🔥 KRİTİK DÜZELTME: get() metodu
    get: (...params) => new Promise((resolve, reject) => {
      // sqlite3.get(sql, [params], callback) şeklinde çalışır
      db.get(sql, params, (err, row) => {
        if (err) {
          console.error('❌ DB Get Error:', err.message, 'SQL:', sql);
          reject(err);
        } else {
          // Debug: Gelen veriyi logla (sadece development)
          if (process.env.NODE_ENV === 'development' && sql.includes('users')) {
            console.log('🔍 DB Debug - Gelen row:', row ? { username: row.username, hasHash: !!row.password_hash } : 'NULL');
          }
          resolve(row);
        }
      });
    }),
    
    all: (...params) => new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
    })
  };
};

db.transaction = (fn) => {
  return async (...args) => new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN', (err) => {
        if (err) return reject(err);
        fn(...args)
          .then(res => db.run('COMMIT', (e) => e ? reject(e) : resolve(res)))
          .catch(err => db.run('ROLLBACK', () => reject(err)));
      });
    });
  });
};

module.exports = db;
