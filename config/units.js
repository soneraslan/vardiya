/**
 * Vardiya Kayıt Sistemi – Ünite Tanımları Modülü
 * Hasan Uğurlu: 4 ünite
 * Suat Uğurlu:  3 ünite (ileride aktif edilecek)
 */

const UNITELER = {
  HASAN_UGURLU: {
    tesis: "Hasan Uğurlu HES",
    uniteAdedi: 4,
    uniteler: [
      { id: "hu1", kod: "ÜNİTE-1", label: "Ünite 1" },
      { id: "hu2", kod: "ÜNİTE-2", label: "Ünite 2" },
      { id: "hu3", kod: "ÜNİTE-3", label: "Ünite 3" },
      { id: "hu4", kod: "ÜNİTE-4", label: "Ünite 4" }
    ]
  },
  SUAT_UGURLU: {
    tesis: "Suat Uğurlu HES",
    uniteAdedi: 3,
    uniteler: [
      { id: "su1", kod: "ÜNİTE-1", label: "Ünite 1" },
      { id: "su2", kod: "ÜNİTE-2", label: "Ünite 2" },
      { id: "su3", kod: "ÜNİTE-3", label: "Ünite 3" }
    ]
  }
};

module.exports = UNITELER;
