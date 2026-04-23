/**
 * personnel.js – Client-side personel yükleyici
 * Sunucudan /api/personel endpoint'inden gruplu personel listesini çeker
 * ve <select> elementine optgroup olarak ekler.
 */

async function personelYukle(selectId) {
  const select = document.getElementById(selectId);
  if (!select) {
    console.error(`[PERSONEL] Hata: ${selectId} id'li element bulunamadı.`);
    return;
  }

  console.log('[PERSONEL] Liste yükleniyor...');

  try {
    // Cache buster ekledik ki tarayıcı eski veriyi tutmasın
    const res = await fetch(`/api/personel?t=${Date.now()}`);
    const personel = await res.json();
    
    console.log('[PERSONEL] Veri alındı:', Object.keys(personel).length, 'grup bulundu.');

    // Varsayılan seçenek
    select.innerHTML = '<option value="">-- Personel Seçin --</option>';

    const grupRenkleri = {
      A_GRUBU: '#3b82f6',
      B_GRUBU: '#10b981',
      C_GRUBU: '#f59e0b',
      D_GRUBU: '#ef4444'
    };

    Object.entries(personel).forEach(([grupKey, grup]) => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = `── ${grup.label} ──`;

      grup.uyeler.forEach(uye => {
        const opt = document.createElement('option');
        opt.value = uye.id;
        opt.textContent = uye.ad;
        opt.dataset.grup = grupKey;
        opt.dataset.telefon = uye.telefon;
        opt.dataset.eposta = uye.eposta;
        optgroup.appendChild(opt);
      });

      select.appendChild(optgroup);
    });

    // Seçim değişince grup badge'ini güncelle
    select.addEventListener('change', () => {
      const selected = select.options[select.selectedIndex];
      const grupKey = selected?.dataset?.grup;
      const badge = document.getElementById('personel-grup-badge');
      const grupRenk = grupRenkleri[grupKey] || 'transparent';
      const grupAd = grupKey ? grupKey.replace('_GRUBU', '') : '';
      if (badge) {
        badge.textContent = grupAd;
        badge.style.background = grupRenk;
        badge.style.display = grupAd ? 'inline-block' : 'none';
      }
    });

  } catch (err) {
    console.error('[PERSONEL] Yükleme hatası:', err);
    select.innerHTML = '<option value="">Personel yüklenemedi</option>';
  }
}
