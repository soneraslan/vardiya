/**
 * Vardiya Kayıt Sistemi – Personel Modülü
 * Bu dosyaya isim, telefon ve e-posta eklemek için aşağıdaki yapıyı kullanın.
 * Her kişi için: { id, ad, soyad, telefon, eposta }
 */

const PERSONEL = {
  A_GRUBU: {
    label: "A Grubu",
    color: "#3b82f6",
    uyeler: [
      { id: "a1", ad: "YAHYA GİRGİN", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "a2", ad: "ŞAHAN AKKAYA", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "a3", ad: "MUSA BAYRAM", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "a4", ad: "Ad Soyad", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "a5", ad: "Ad Soyad", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" }
    ]
  },
  B_GRUBU: {
    label: "B Grubu",
    color: "#10b981",
    uyeler: [
      { id: "b1", ad: "SERKAN ÇELİK", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "b2", ad: "SÜLEYMAN DURAN", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "b3", ad: "İSMET BEYAZOĞLU", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "b4", ad: "Ad Soyad", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "b5", ad: "Ad Soyad", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" }
    ]
  },
  C_GRUBU: {
    label: "C Grubu",
    color: "#f59e0b",
    uyeler: [
      { id: "c1", ad: "MURAT ÖZTÜRK", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "c2", ad: "ŞAKİR CAN AKBAŞ", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "c3", ad: "MAHMUT DELİMEHMET", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "c4", ad: "Ad Soyad", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "c5", ad: "Ad Soyad", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" }
    ]
  },
  D_GRUBU: {
    label: "D Grubu",
    color: "#ef4444",
    uyeler: [
      { id: "d1", ad: "KAMİL ÇEKİÇ", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "d2", ad: "SABRİ TURHAN", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "d3", ad: "YALÇIN KIYAK", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "d4", ad: "Ad Soyad", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" },
      { id: "d5", ad: "Ad Soyad", telefon: "+90 5xx xxx xx xx", eposta: "eposta@kurum.gov.tr" }
    ]
  }
};

module.exports = PERSONEL;
