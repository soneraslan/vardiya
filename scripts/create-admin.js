const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const username = 'admin';
  const password = 'Vardiya2024!';
  const password_hash = await bcrypt.hash(password, 10);

  try {
    const stmt = db.prepare("INSERT OR REPLACE INTO users (username, password_hash, full_name, role, is_active) VALUES (?, ?, 'Soner ASLAN', 'admin', 1)");
    await stmt.run(username, password_hash);
    
    console.log('✅ Admin kullanıcı oluşturuldu/güncellendi:');
    console.log(`   👤 Kullanıcı: ${username}`);
    console.log(`   🔑 Şifre: ${password}`);
    console.log('   ⚠️ İlk girişte şifreyi mutlaka değiştirin!');
    process.exit(0);
  } catch (e) {
    console.error('❌ Hata:', e.message);
    process.exit(1);
  }
}

createAdmin();
