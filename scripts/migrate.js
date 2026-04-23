const db = require('../config/database');

const migrations = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'operator',
    group_id TEXT,
    email TEXT,
    phone TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS vardiya_kayitlari (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tesis TEXT NOT NULL,
    tarih DATE NOT NULL,
    vardiya TEXT NOT NULL,
    operator_id INTEGER,
    uniteler TEXT,
    gol_kotu_giris REAL,
    gol_kotu_cikis REAL,
    genel_not TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tesis, tarih, vardiya)
  );`
];

async function runMigrations() {
  try {
    for (let i = 0; i < migrations.length; i++) {
      await db.prepare(migrations[i]).run();
      console.log(`✅ Migration ${i+1}/${migrations.length} tamamlandı`);
    }
    console.log('🎉 Veritabanı hazır!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Migration hatası:', e.message);
    process.exit(1);
  }
}

runMigrations();
