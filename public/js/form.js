/**
 * form.js – Ana form mantığı, toast bildirimleri, saat, toggle
 */

// ─── Saat Göstergesi ──────────────────────────────────────
function saatiGuncelle() {
  const el = document.getElementById('current-time');
  const del = document.getElementById('current-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString('tr-TR');
  if (del) del.textContent = now.toLocaleDateString('tr-TR', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}
setInterval(saatiGuncelle, 1000);
saatiGuncelle();

// ─── Vardiya Seçici ───────────────────────────────────────
document.querySelectorAll('.vardiya-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Eğer zaten seçiliyse bir şey yapma
    if (btn.classList.contains('active')) return;

    document.querySelectorAll('.vardiya-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // ─── Tarih Otomatik Artırma (00-08 seçilince) ───────────
    if (btn.dataset.vardiya === '00-08') {
      const tarihInput = document.getElementById('tarih');
      if (tarihInput && tarihInput.value) {
        const mevcutTarih = new Date(tarihInput.value);
        mevcutTarih.setDate(mevcutTarih.getDate() + 1);
        tarihInput.value = mevcutTarih.toISOString().split('T')[0];
        toast('Tarih Güncellendi', '00-08 vardiyası için tarih 1 gün ileri alındı.', 'info');
      }
    }

    // Yeni vardiyaya geçerken önceki verileri getir
    if (typeof formuOncekiVeriyleDoldur === 'function') {
      formuOncekiVeriyleDoldur();
    }
  });
});

// ─── Hat Seçici ───────────────────────────────────────────
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.hat-btn');
  if (!btn) return;
  
  // Sadece ilgili satırdaki (event-row) hat butonlarını bul ve yönet
  const row = btn.closest('.event-row');
  if (row) {
    row.querySelectorAll('.hat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Değişikliği kaydet
    if (typeof formuKaydet === 'function') {
      formuKaydet(true);
    }
  }
});



// ─── Ünite Durum Toggle ───────────────────────────────────
function toggleUnite(uniteId, calisiyor) {
  const kart = document.querySelector(`.unite-card[data-unite-id="${uniteId}"]`);
  if (!kart) return;
  const txt = kart.querySelector('.unite-durum-text');
  const body = kart.querySelector('.unite-body');

  if (calisiyor) {
    kart.classList.remove('calismiyor');
    if (txt) { txt.textContent = 'Çalışıyor'; txt.className = 'unite-durum-text durum-calisir'; }
    if (body) body.style.opacity = '1';

    // ─── Arıza Sonrası Devreye Alma Otomasyonu (Paşa'mın isteği) ───
    const sonSeans = kart.querySelector('.event-row:last-child');
    if (sonSeans) {
      const devreyeSaat = sonSeans.querySelector('.u-devreye')?.value;
      const arizaBaslama = sonSeans.querySelector('.u-ariza-baslama')?.value;
      const arizaBitis = sonSeans.querySelector('.u-ariza-bitis');
      
      if (devreyeSaat && arizaBaslama && arizaBitis) {
        arizaBitis.value = devreyeSaat;
      }
    }

    const korumalar = document.getElementById(`${uniteId}-korumalar`);
    const bayraklar = document.getElementById(`${uniteId}-bayraklar`);
    const izahat = document.getElementById('izahat');

    if (korumalar) korumalar.value = '';
    if (bayraklar) bayraklar.value = '';
    if (izahat) izahat.value = '';
    
  } else {
    kart.classList.add('calismiyor');
    if (txt) { txt.textContent = 'Duran'; txt.className = 'unite-durum-text durum-duran'; }
    if (body) body.style.opacity = '0.5';
  }
}

document.querySelectorAll('.unite-toggle').forEach(toggle => {
  toggle.addEventListener('change', () => {
    const kart = toggle.closest('.unite-card');
    const uniteId = kart.dataset.uniteId;

    // Reset İşlemi: Sadece manuel butona basıldığında saatleri temizle
    if (!window.isRestoring) {
      const sonSeans = kart.querySelector('.event-row:last-child');
      if (sonSeans) {
        sonSeans.querySelectorAll('input[type="time"]').forEach(input => input.value = '');
      }
    }

    toggleUnite(uniteId, toggle.checked);
  });
});



// ─── Vardiya Saat Kontrolü ────────────────────────────────
function vardiyaSaatKontrol(input) {
  const seciliVardiya = document.querySelector('.vardiya-btn.active')?.dataset?.vardiya;
  if (!seciliVardiya || !input.value) return true;

  let [vBas, vBit] = seciliVardiya.split('-').map(s => s.trim().padStart(2, '0') + ':00');
  const girilenSaat = input.value;

  if (vBit === '24:00') vBit = '23:59';

  if (girilenSaat < vBas || girilenSaat > vBit) {
    toast('Hatalı Saat', `Vardiya (${seciliVardiya}) dışı saat girdiniz: ${girilenSaat}`, 'warning');
    return false;
  }

  // ─── Mantıksal Zaman Kontrolü (Paşa'mın isteği) ───
  const row = input.closest('.event-row');
  if (row) {
    const dGiris = row.querySelector('.u-devreye')?.value;
    const dCikis = row.querySelector('.u-cikma')?.value;

    if (dGiris && dCikis && dCikis < dGiris) {
      toast('Mantık Hatası', 'Devreden çıkış saati, devreye girişten önce olamaz!', 'error');
      input.value = '';
      return false;
    }
    

    // Eğer ikisi de dolduysa ve mantıklıysa: Yeni seans otomatik açılsın ve eskisi kilitlensin
    if (dGiris && dCikis && input.matches('.u-devreye, .u-cikma')) {
      const container = row.parentElement;
      const isLast = row === container.lastElementChild;
      
      if (isLast && typeof yeniSeansEkle === 'function') {
        // Mevcut satırı kilitle (Paşa'mın isteği)
        row.querySelector('.u-devreye').readOnly = true;
        row.querySelector('.u-cikma').readOnly = true;
        
        const uniteId = row.closest('.unite-card').dataset.uniteId;
        yeniSeansEkle(uniteId);
        toast('Seans Tamamlandı', 'Veriler kilitlendi ve yeni seans otomatik açıldı.', 'success');
      }
    }
  }

  return true;
}

// ─── Göl Kotu Kontrolü ─────────────────────────────────────
async function golKotuKontrol(input) {
  const yeniDeger = parseFloat(input.value);
  if (isNaN(yeniDeger)) return;

  if (yeniDeger < 150 || yeniDeger > 190) {
    toast('Limit Dışı', 'Göl kotu 150 - 190 m arasında olmalıdır!', 'error');
    return;
  }

  // Önceki kaydı getir ve kıyasla
  if (typeof sonKaydiGetir === 'function') {
    const sonKayit = await sonKaydiGetir();
    if (sonKayit && sonKayit.golKotu) {
      const fark = Math.abs(yeniDeger - sonKayit.golKotu);
      if (fark >= 0.3) {
        toast('Önemli Uyarı', `Önceki koda (${sonKayit.golKotu}) göre ${fark.toFixed(2)}m fark var. Lütfen değeri kontrol edin!`, 'warning');
      }
    }
  }
}

// Otomatik Durum Tetikleyicileri ───────────────────────
function tetikleyicileriBaslat() {
  document.addEventListener('change', (e) => {
    const input = e.target;
    
    if (input.matches('.u-devreye, .u-cikma, .u-ariza-baslama, .u-ariza-bitis')) {
      vardiyaSaatKontrol(input);
    }

    if (input.id === 'gol-kotu') {
      golKotuKontrol(input);
    }

    const kart = input.closest('.unite-card');
    if (!kart) return;
    
    const id = kart.dataset.uniteId;
    const toggle = kart.querySelector('.unite-toggle');
    if (!toggle) return;

    if (input.classList.contains('u-devreye') && input.value) {
      toggle.checked = true;
      toggleUnite(id, true);
    }

    if ((input.classList.contains('u-cikma') || input.classList.contains('u-ariza-baslama')) && input.value) {
      toggle.checked = false;
      toggleUnite(id, false);
    }
  });
}

// ─── Vardiyayı Saate Göre Otomatik Seç ────────────────────
function vardiyaOtomatikSec() {
  const now = new Date();
  const hour = now.getHours();
  let hedefVardiya = "";

  // Butonlardaki data-vardiya değerleri: "00-08", "08-16", "16-24"
  if (hour >= 0 && hour < 8) hedefVardiya = "00-08";
  else if (hour >= 8 && hour < 16) hedefVardiya = "08-16";
  else hedefVardiya = "16-24";

  const btn = document.querySelector(`.vardiya-btn[data-vardiya="${hedefVardiya}"]`);
  if (btn) {
    btn.click(); // Veri yüklemeyi tetikle
    console.log(`[SİSTEM] Otomatik vardiya seçildi: ${hedefVardiya}`);
  }
}

// Sayfa yüklendiğinde çalıştır
window.addEventListener('DOMContentLoaded', () => {
  tetikleyicileriBaslat();

  // Gizli Yöntem: 29.01.1975 (Veri Sıfırlama)
  const tarihInput = document.getElementById('tarih');
  if (tarihInput) {
    tarihInput.addEventListener('change', async () => {
      if (tarihInput.value === '1975-01-29') {
        if (confirm('DİKKAT! 29.01.1975 Gizli Tarihi Girildi.\nTüm vardiya kayıtları kalıcı olarak silinsin mi?')) {
          try {
            const res = await fetch(`/api/temizle/${TESIS_KEY}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
              // FORMUN TAMAMINI MANUEL SIFIRLA (Hayalet veri kalmasın)
              document.querySelectorAll('input').forEach(i => i.value = '');
              document.querySelectorAll('select').forEach(s => s.value = '');
              document.querySelectorAll('textarea').forEach(t => t.value = '');
              document.querySelectorAll('.active').forEach(a => a.classList.remove('active'));
              
              alert('Tüm veriler temizlendi. Sistem sıfırdan başlatılıyor.');
              window.location.href = window.location.href; // Temiz reload
            }
          } catch (err) {
            alert('Sıfırlama sırasında bir hata oluştu.');
          }
        } else {
          tarihInput.value = new Date().toISOString().split('T')[0];
        }
      }
    });
  }
  
  // 1. Tam Hafıza: En son kaydı olduğu gibi getir (Tarih dahil)
  if (typeof formuOncekiVeriyleDoldur === 'function') {
    formuOncekiVeriyleDoldur(true).then(() => {
       const activeBtn = document.querySelector('.vardiya-btn.active');
       if (!activeBtn) {
         vardiyaOtomatikSec();
       }
    });
  }
});

// ─── Toast Bildirimleri ──────────────────────────────────
function toast(baslik, mesaj, tip = 'info') {
  const iconMap = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const container = document.getElementById('toast-container');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast ${tip}`;
  el.innerHTML = `
    <span class="toast-icon">${iconMap[tip] || 'ℹ️'}</span>
    <div class="toast-body">
      <div class="toast-title">${baslik}</div>
      <div class="toast-msg">${mesaj}</div>
    </div>`;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('removing');
    setTimeout(() => el.remove(), 250);
  }, 4500);
}
