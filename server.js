/**
 * Vardiya Kayıt Sistemi – Express Backend
 * Dr. Soner ASLAN
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const BILDIRIM = require('./config/notifications');
const PERSONEL = require('./config/personnel');
const UNITELER = require('./config/units');

const app = express();
const PORT = 3000;
const TESIS_DOSYALARI = {
  hasan: 'hasan_records.json',
  suat: 'suat_records.json'
};

function tesisDosyaYoluGetir(tesis) {
  const key = String(tesis || '').toLowerCase();
  const dosyaAdi = TESIS_DOSYALARI[key];

  if (!dosyaAdi) {
    return null;
  }

  return path.join(__dirname, 'data', dosyaAdi);
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Veri Kaydetme (Upsert Logic) ──────────────────────────
app.post('/api/kaydet/:tesis', (req, res) => {
  const { tesis } = req.params;
  const yeniKayit = { ...req.body, son_guncelleme: new Date().toISOString() };
  const dosyaYolu = tesisDosyaYoluGetir(tesis);

  if (!dosyaYolu) {
    return res.status(400).json({ basarili: false, hata: 'Gecersiz tesis anahtari.' });
  }

  let mevcut = [];
  if (fs.existsSync(dosyaYolu)) {
    try { mevcut = JSON.parse(fs.readFileSync(dosyaYolu, 'utf8')); } catch (e) { mevcut = []; }
  }

  // Aynı tarih ve vardiyaya sahip bir kayıt var mı kontrol et
  const index = mevcut.findIndex(k => k.tarih === yeniKayit.tarih && k.vardiya === yeniKayit.vardiya);

  if (index !== -1) {
    // Mevcut kaydı güncelle
    mevcut[index] = { ...mevcut[index], ...yeniKayit };
  } else {
    // Yeni kayıt ekle
    mevcut.push(yeniKayit);
  }

  fs.writeFileSync(dosyaYolu, JSON.stringify(mevcut, null, 2), 'utf8');
  res.json({ basarili: true, id: index !== -1 ? index : mevcut.length - 1, tip: index !== -1 ? 'guncellendi' : 'yeni' });
});

// ─── Kayıtları Listele ─────────────────────────────────────
app.get('/api/kayitlar/:tesis', (req, res) => {
  const { tesis } = req.params;
  const dosyaYolu = tesisDosyaYoluGetir(tesis);
  if (!dosyaYolu) return res.status(400).json([]);
  if (!fs.existsSync(dosyaYolu)) return res.json([]);
  try {
    const veri = JSON.parse(fs.readFileSync(dosyaYolu, 'utf8'));
    res.json(veri);
  } catch (e) {
    res.json([]);
  }
});

// ─── Personel Listesi (API) ────────────────────────────────
app.get('/api/personel', (req, res) => {
  res.json(PERSONEL);
});

// ─── Bildirim Gönder ───────────────────────────────────────
app.post('/api/bildirim', async (req, res) => {
  const { mesaj, konu, tesis } = req.body;
  const sonuclar = { email: null, telegram: null };

  // E-posta Bildirimi
  if (BILDIRIM.email && BILDIRIM.email.aktif) {
    try {
      if (BILDIRIM.email.smtp.user === "gonderici@gmail.com") {
        throw new Error("Varsayılan e-posta adresi değiştirilmemiş!");
      }

      const transporter = nodemailer.createTransport({
        host: BILDIRIM.email.smtp.host,
        port: BILDIRIM.email.smtp.port,
        secure: BILDIRIM.email.smtp.secure,
        auth: {
          user: BILDIRIM.email.smtp.user,
          pass: BILDIRIM.email.smtp.sifre
        }
      });

      for (const alici of BILDIRIM.email.alicilar) {
        await transporter.sendMail({
          from: `"Vardiya Kayıt Sistemi" <${BILDIRIM.email.smtp.user}>`,
          to: alici.eposta,
          subject: `${BILDIRIM.email.konu_prefix} ${tesis} – ${konu}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#0f172a;color:#f97316;padding:20px;border-radius:8px 8px 0 0;">
                <h2 style="margin:0;">⚡ Vardiya Kayıt Sistemi</h2>
                <p style="margin:5px 0 0;color:#94a3b8;">Dr. Soner ASLAN – ${tesis}</p>
              </div>
              <div style="background:#1e293b;color:#e2e8f0;padding:20px;border-radius:0 0 8px 8px;">
                <pre style="white-space:pre-wrap;font-family:Arial,sans-serif;line-height:1.6;">${mesaj}</pre>
                <hr style="border-color:#334155;"/>
                <p style="color:#64748b;font-size:12px;">Bu mesaj Vardiya Kayıt Sistemi tarafından otomatik olarak gönderilmiştir.<br/>
                ${new Date().toLocaleString('tr-TR')}</p>
              </div>
            </div>
          `
        });
      }
      sonuclar.email = 'gonderildi';
      console.log('[BİLDİRİM] E-posta başarıyla gönderildi.');
    } catch (err) {
      sonuclar.email = `Hata: ${err.message}`;
      console.error('[BİLDİRİM] E-posta hatası:', err.message);
    }
  } else {
    sonuclar.email = 'E-posta bildirimi pasif.';
  }

  // Telegram Bildirimi
  if (BILDIRIM.telegram && BILDIRIM.telegram.aktif) {
    try {
      if (BILDIRIM.telegram.bot_token.includes("0000000000")) {
        throw new Error("Varsayılan Telegram bot token değiştirilmemiş!");
      }

      const telegramMesaj = `🔴 *ARIZA BİLDİRİMİ*\n*Tesis:* ${tesis}\n*Konu:* ${konu}\n\n${mesaj}\n\n_${new Date().toLocaleString('tr-TR')}_`;
      
      for (const alici of BILDIRIM.telegram.alicilar) {
        const url = `https://api.telegram.org/bot${BILDIRIM.telegram.bot_token}/sendMessage`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: alici.chat_id,
            text: telegramMesaj,
            parse_mode: 'Markdown'
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Telegram API hatası: ${errorData.description}`);
        }
        
        console.log(`[BİLDİRİM] Telegram gönderildi → ${alici.ad}`);
      }
      sonuclar.telegram = 'gonderildi';
    } catch (err) {
      sonuclar.telegram = `Hata: ${err.message}`;
      console.error('[BİLDİRİM] Telegram hatası:', err.message);
    }
  } else {
    sonuclar.telegram = 'Telegram bildirimi pasif.';
  }

  res.json({ basarili: true, sonuclar });
});

// Kayıtları Sıfırla (Gizli Yöntem için)
app.post('/api/temizle/:tesis', (req, res) => {
  const { tesis } = req.params;
  const dosyaYolu = tesisDosyaYoluGetir(tesis);

  if (!dosyaYolu) {
    return res.status(400).json({ success: false, error: 'Gecersiz tesis anahtari.' });
  }
  
  try {
    const fs = require('fs');
    fs.writeFileSync(dosyaYolu, JSON.stringify([], null, 2), 'utf8');
    console.log(`[SİSTEM] ${tesis} kayıtları gizli komutla sıfırlandı.`);
    res.json({ success: true, message: 'Tüm kayıtlar sıfırlandı.' });
  } catch (err) {
    res.status(500).json({ error: 'Sıfırlama hatası' });
  }
});

// Belirli Bir Kaydı Sil (Satır Bazlı)
app.post('/api/sil/:tesis', (req, res) => {
  const { tesis } = req.params;
  const { tarih, vardiya } = req.body;
  const dosyaYolu = tesisDosyaYoluGetir(tesis);

  if (!dosyaYolu) {
    return res.status(400).json({ success: false, error: 'Gecersiz tesis anahtari.' });
  }

  try {
    let mevcut = [];
    if (fs.existsSync(dosyaYolu)) {
      mevcut = JSON.parse(fs.readFileSync(dosyaYolu, 'utf8'));
    }

    const yeniListe = mevcut.filter(k => !(k.tarih === tarih && k.vardiya === vardiya));
    fs.writeFileSync(dosyaYolu, JSON.stringify(yeniListe, null, 2), 'utf8');
    
    console.log(`[SİSTEM] ${tarih} - ${vardiya} kaydı manuel silindi.`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Silme hatası' });
  }
});

// ─── Sunucu Başlat ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   Vardiya Kayıt Sistemi – ÇALIŞIYOR   ║');
  console.log('║   Dr. Soner ASLAN                     ║');
  console.log(`║   http://localhost:${PORT}                ║`);
  console.log('╚════════════════════════════════════════╝\n');
});
