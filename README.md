# Vardiya Kayıt Sistemi

**Dr. Soner ASLAN** | HES Tesis Yönetimi

## 🚀 Başlatma

```bash
cd claude
node server.js
```

Tarayıcıda açın: **http://localhost:3000**

## 📁 Dosya Yapısı

```
claude/
├── server.js                  ← Express sunucu (port 3000)
├── config/
│   ├── personnel.js           ← 👥 Personel grupları (A,B,C,D) – buraya isimleri girin
│   ├── units.js               ← ⚡ Ünite tanımları
│   └── notifications.js       ← 📧 E-posta & Telegram ayarları
├── public/
│   ├── index.html             ← Ana sayfa (tesis seçimi)
│   ├── hasan.html             ← Hasan Uğurlu HES formu
│   ├── suat.html              ← Suat Uğurlu HES (yakında)
│   ├── css/style.css
│   └── js/
│       ├── form.js            ← Saat, toggle, vardiya mantığı
│       ├── personnel.js       ← Personel dropdown yükleyici
│       ├── notifications.js   ← Arıza bildirim tetikleyici
│       └── data.js            ← Kaydetme/temizleme
└── data/
    ├── hasan_records.json     ← Kayıtlar burada birikir
    └── suat_records.json
```

## ⚙️ Konfigürasyon

### 1. Personel Ekleme → `config/personnel.js`
```js
{ id: "a1", ad: "Ahmet Yılmaz", telefon: "+90 532 xxx xx xx", eposta: "ahmet@kurum.gov.tr" }
```

### 2. E-posta Bildirimi → `config/notifications.js`
- `aktif: true` yapın
- Gmail `user` ve uygulama şifresini girin
- `alicilar` dizisine e-posta adreslerini ekleyin

### 3. Telegram Bildirimi → `config/notifications.js`
- BotFather'dan bot token alın
- `aktif: true` yapın
- `alicilar` dizisine chat_id ekleyin
