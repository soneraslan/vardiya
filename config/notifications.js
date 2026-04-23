/**
 * Vardiya Kayıt Sistemi – Bildirim Ayarları Modülü
 * Bu dosyaya e-posta ve Telegram bilgilerini ekleyin.
 * 
 * TELEGRAM BOT OLUŞTURMA:
 *   1. Telegram'da @BotFather'a /newbot komutunu gönderin
 *   2. Bot token'ınızı alın → TELEGRAM_BOT_TOKEN alanına yapıştırın
 *   3. Bot'u ilgili gruba/kanala ekleyin
 *   4. Chat ID'yi @userinfobot üzerinden öğrenin → alicilar dizisine ekleyin
 * 
 * E-POSTA (Gmail örneği):
 *   Gmail hesabında "Uygulama Şifresi" oluşturun (2FA açık olmalı)
 *   https://myaccount.google.com/apppasswords
 */

const BILDIRIM_AYARLARI = {
  email: {
    aktif: true,           // ← true yapın, SMTP bilgilerini girin
    smtp: {
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      user: "gonderici@gmail.com",         // ← Göndericinin e-posta adresi
      sifre: "xxxx xxxx xxxx xxxx"         // ← Gmail Uygulama Şifresi
    },
    alicilar: [
      { ad: "Müdür", eposta: "soneraslan75@gmail.com" },
      { ad: "Teknik müdür Yardımcısı", eposta: "yetkili2@kurum.gov.tr" }
      // Buraya daha fazla alıcı ekleyebilirsiniz
    ],
    konu_prefix: "[ARIZA BİLDİRİMİ]"
  },

  telegram: {
    aktif: false,           // ← true yapın, bot token'ı ve chat ID'leri girin
    bot_token: "0000000000:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",  // ← BotFather'dan alınan token
    alicilar: [
      { ad: "Yetkili 1", chat_id: "123456789" },
      { ad: "Yetkili 2", chat_id: "987654321" }
      // Buraya daha fazla alıcı ekleyebilirsiniz
    ]
  }
};

module.exports = BILDIRIM_AYARLARI;
