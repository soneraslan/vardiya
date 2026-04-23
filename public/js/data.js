/**
 * data.js - Veri kaydetme ve yukleme modulu
 */

const TESIS_KEY = document.body?.dataset?.tesis || 'hasan';
let autoSaveTimer;

const VARDIYA_SIRASI = {
  '00-08': 0,
  '08-16': 1,
  '16-24': 2
};

async function kayitlariGetir() {
  try {
    const res = await fetch(`/api/kayitlar/${TESIS_KEY}`);
    const kayitlar = await res.json();

    if (!Array.isArray(kayitlar)) {
      return [];
    }

    return kayitlar.sort((a, b) => {
      const tarihFarki = new Date(b?.tarih || 0) - new Date(a?.tarih || 0);
      if (tarihFarki !== 0) return tarihFarki;
      return (VARDIYA_SIRASI[b?.vardiya] ?? -1) - (VARDIYA_SIRASI[a?.vardiya] ?? -1);
    });
  } catch (err) {
    console.error('Kayitlar getirilemedi:', err);
    return [];
  }
}

function eventleriNormalizeEt(unite = {}) {
  const hamEvents = Array.isArray(unite.events) && unite.events.length > 0
    ? unite.events
    : [{
        hat: unite.hat,
        devreye_girme: unite.devreye_girme,
        devreden_cikma: unite.devreden_cikma,
        ariza_baslama: unite.ariza_baslama,
        ariza_bitis: unite.ariza_bitis,
        izahat: unite.izahat
      }];

  return hamEvents.map((event, index) => ({
    hat: event?.hat || '',
    devreye_girme: event?.devreye_girme || '',
    devreden_cikma: event?.devreden_cikma || '',
    ariza_baslama: event?.ariza_baslama || '',
    ariza_bitis: event?.ariza_bitis || '',
    calisan_korumalar: event?.calisan_korumalar ?? (index === 0 ? (unite.calisanKorumalar || '') : ''),
    dusen_bayraklar: event?.dusen_bayraklar ?? (index === 0 ? (unite.dusenBayraklar || '') : ''),
    izahat: event?.izahat || ''
  }));
}

function ilkSeansSatirlariniStandartlastir() {
  document.querySelectorAll('.unite-card').forEach(kart => {
    const uniteId = kart.dataset.uniteId;
    const container = document.getElementById(`${uniteId}-events-container`);
    if (!container) return;

    const ilkSatir = container.querySelector('.event-row');
    if (!ilkSatir) {
      yeniSeansEkle(uniteId);
      return;
    }

    if (ilkSatir.querySelector('.u-korumalar') || ilkSatir.querySelector('.u-bayraklar')) {
      return;
    }

    const veri = {
      hat: ilkSatir.querySelector('.hat-btn.active')?.dataset?.hat || '',
      devreye_girme: ilkSatir.querySelector('.u-devreye')?.value || '',
      devreden_cikma: ilkSatir.querySelector('.u-cikma')?.value || '',
      ariza_baslama: ilkSatir.querySelector('.u-ariza-baslama')?.value || '',
      ariza_bitis: ilkSatir.querySelector('.u-ariza-bitis')?.value || '',
      izahat: ilkSatir.querySelector('.u-izahat')?.value || ''
    };

    container.innerHTML = '';
    yeniSeansEkle(uniteId, veri);
  });
}

function yeniSeansEkle(uniteId, veri = null) {
  const container = document.getElementById(`${uniteId}-events-container`);
  if (!container) return;

  const seansSayisi = container.querySelectorAll('.event-row').length + 1;
  const div = document.createElement('div');
  div.className = 'event-row';

  const isLocked = veri?.devreye_girme && veri?.devreden_cikma;

  div.innerHTML = `
    <div class="event-row-header">
      <span class="event-num-label">Seans ${seansSayisi}</span>
      ${seansSayisi > 1 ? `<button class="remove-event-btn" onclick="seansSil(this)" title="Seansi Sil">X</button>` : ''}
    </div>
    <div class="form-group">
      <label>Hat</label>
      <div class="hat-selector">
        <button class="hat-btn ${veri?.hat === 'kuzey' ? 'active' : ''}" data-hat="kuzey">Kuzey</button>
        <button class="hat-btn ${veri?.hat === 'guney' ? 'active' : ''}" data-hat="guney">Guney</button>
      </div>
    </div>
    <div class="saat-grid">
      <div class="saat-field">
        <label>Devreye Girme</label>
        <input type="time" class="u-devreye" value="${veri?.devreye_girme || ''}" ${isLocked ? 'readonly' : ''} />
      </div>
      <div class="saat-field">
        <label>Devreden Cikma</label>
        <input type="time" class="u-cikma" value="${veri?.devreden_cikma || ''}" ${isLocked ? 'readonly' : ''} />
      </div>
      <div class="saat-field ariza-baslama">
        <label>Ariza Baslama</label>
        <input type="time" class="u-ariza-baslama" value="${veri?.ariza_baslama || ''}" />
      </div>
      <div class="saat-field ariza-bitis">
        <label>Arizanin Bitisi</label>
        <input type="time" class="u-ariza-bitis" value="${veri?.ariza_bitis || ''}" />
      </div>
    </div>
    <div class="form-row" style="margin-top:10px;">
      <div class="form-group koruma-input">
        <label>Calisan Korumalar</label>
        <input type="text" class="u-korumalar" placeholder="Koruma adlari..." value="${veri?.calisan_korumalar || ''}" />
      </div>
      <div class="form-group bayrak-input">
        <label>Dusen Bayraklar</label>
        <input type="text" class="u-bayraklar" placeholder="Bayrak adlari..." value="${veri?.dusen_bayraklar || ''}" />
      </div>
    </div>
    <div class="form-group" style="margin-top:10px;">
      <textarea class="u-izahat" placeholder="Seans/Ariza notu..." rows="1" style="font-size:0.85rem; height:40px;">${veri?.izahat || ''}</textarea>
    </div>
  `;

  container.appendChild(div);
}

function seansSil(btn) {
  const row = btn.closest('.event-row');
  const container = row.parentElement;

  if (container.querySelectorAll('.event-row').length <= 1) {
    toast('Islem Iptal', 'En az bir satir kalmalidir.', 'warning');
    return;
  }

  row.remove();
  container.querySelectorAll('.event-row').forEach((r, index) => {
    const label = r.querySelector('.event-num-label');
    if (label) {
      label.textContent = label.textContent.startsWith('Not') ? `Not ${index + 1}` : `Seans ${index + 1}`;
    }
  });

  formuKaydet(true);
}

function yeniIzahatSatiriEkle(veri = null) {
  const container = document.getElementById('izahat-rows-container');
  if (!container) return;

  const notSayisi = container.querySelectorAll('.event-row').length + 1;
  const div = document.createElement('div');
  div.className = 'event-row';
  div.innerHTML = `
    <div class="event-row-header">
      <span class="event-num-label">Not ${notSayisi}</span>
      <button class="delete-event-btn" onclick="seansSil(this)" title="Notu Sil">X</button>
    </div>
    <div class="form-group">
      <textarea class="u-izahat" placeholder="Vardiya notu..." rows="2">${veri || ''}</textarea>
    </div>
  `;
  container.appendChild(div);
}

function autoSaveBaslat() {
  document.addEventListener('input', (e) => {
    if (!e.target.matches('input, textarea, select')) return;
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => formuKaydet(true), 2000);
  });

  document.addEventListener('click', (e) => {
    const el = e.target.closest('.vardiya-btn, .hat-btn, .unite-toggle');
    if (!el) return;
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => formuKaydet(true), 1000);
  });
}

async function formuKaydet(sessiz = false) {
  const veri = formVerisiTopla();
  if (!veri.tarih || !veri.vardiya) return;

  let hatEksik = false;
  veri.uniteler.forEach(u => {
    u.events.forEach(e => {
      if (e.devreye_girme && !e.hat) {
        hatEksik = true;
      }
    });
  });

  if (hatEksik) {
    if (!sessiz) {
      toast('Eksik Bilgi', 'Unite devreye girerken hat secimi yapmalisiniz.', 'error');
    }
    showAutoSaveStatus('error', 'Hat Secilmedi!');
    return;
  }

  if (!sessiz) showAutoSaveStatus('saving', 'Kaydediliyor...');

  try {
    const res = await fetch(`/api/kaydet/${TESIS_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(veri)
    });

    const sonuc = await res.json();
    if (sonuc.basarili) {
      if (!sessiz) toast('Kayit Basarili', 'Veriler guncellendi.', 'success');
      showAutoSaveStatus('saved', 'Otomatik Kaydedildi');
      tabloyuGuncelle();
    }
  } catch (err) {
    console.error('Kayit hatasi:', err);
    showAutoSaveStatus('error', 'Kayit Hatasi!');
  }
}

function showAutoSaveStatus(state, text) {
  const status = document.getElementById('autosave-status');
  const txt = document.getElementById('autosave-text');
  if (!status || !txt) return;

  status.className = `autosave-status visible ${state}`;
  txt.textContent = text;

  if (state === 'saved') {
    setTimeout(() => status.classList.remove('visible'), 3000);
  }
}

async function tabloyuGuncelle() {
  const body = document.getElementById('kayit-tablosu-body');
  if (!body) return;

  try {
    const kayitlar = await kayitlariGetir();
    body.innerHTML = '';

    kayitlar.forEach(k => {
      let maxSeans = k.izahatlar ? k.izahatlar.length : 1;
      k.uniteler.forEach(u => {
        const sCount = Array.isArray(u.events) && u.events.length > 0 ? u.events.length : 1;
        if (sCount > maxSeans) maxSeans = sCount;
      });

      for (let sIdx = 0; sIdx < maxSeans; sIdx++) {
        const tr = document.createElement('tr');

        if (sIdx === 0) {
          const calisanlar = k.uniteler.filter(u => u.durum === 'calisiyor').map(u => u.id.replace('u', '')).join(',');
          const duranlar = k.uniteler.filter(u => u.durum === 'duran').map(u => u.id.replace('u', '')).join(',');

          tr.innerHTML = `
            <td rowspan="${maxSeans}">${new Date(k.tarih).toLocaleDateString('tr-TR')}</td>
            <td rowspan="${maxSeans}" style="font-family:monospace;font-weight:bold;">${k.vardiya}</td>
            <td rowspan="${maxSeans}">${k.personel?.ad || '–'}</td>
            <td rowspan="${maxSeans}" style="color:var(--accent);font-weight:bold;">${k.golKotu || '–'}</td>
            <td rowspan="${maxSeans}" style="color:var(--red);">${duranlar || '–'}</td>
            <td rowspan="${maxSeans}" style="color:var(--green);">${calisanlar || '–'}</td>
          `;
        }

        let uniteHucreleri = '';
        for (let i = 0; i < 4; i++) {
          const u = k.uniteler[i] || { events: [] };
          const events = eventleriNormalizeEt(u);
          const e = events[sIdx] || {};
          const hat = e.hat ? e.hat.charAt(0).toUpperCase() : '–';

          uniteHucreleri += `
            <td style="text-align:center; font-weight:bold; color:var(--blue);">${hat}</td>
            <td>${e.devreye_girme || '–'}</td>
            <td>${e.devreden_cikma || '–'}</td>
            <td style="color:var(--red);">${e.ariza_baslama || '–'}</td>
            <td style="color:var(--yellow);">${e.ariza_bitis || '–'}</td>
          `;
        }
        tr.innerHTML += uniteHucreleri;

        const satirIzahatlari = [];
        for (let i = 0; i < 4; i++) {
          const u = k.uniteler[i] || { events: [] };
          const events = eventleriNormalizeEt(u);
          const e = events[sIdx] || null;
          if (!e) continue;

          const detaylar = [];
          if (e.izahat) detaylar.push(e.izahat);
          if (e.calisan_korumalar) detaylar.push(`Koruma: ${e.calisan_korumalar}`);
          if (e.dusen_bayraklar) detaylar.push(`Bayrak: ${e.dusen_bayraklar}`);

          if (detaylar.length > 0) {
            satirIzahatlari.push(`${k.uniteler[i]?.kod || 'G' + (i + 1)}: ${detaylar.join(' | ')}`);
          }
        }

        const izahatDeger = satirIzahatlari.length > 0 ? satirIzahatlari.join(' | ') : '–';
        tr.innerHTML += `<td style="font-size:0.75rem; white-space: normal; min-width: 200px;">${izahatDeger}</td>`;

        if (sIdx === 0) {
          tr.innerHTML += `
            <td rowspan="${maxSeans}" style="text-align:center;">
              <button class="duzenle-btn" onclick="kayitDuzenle('${k.tarih}', '${k.vardiya}')" title="Bu Kaydi Duzenle">📝</button>
            </td>
          `;
        }

        body.appendChild(tr);
      }
    });
  } catch (err) {
    console.error('Tablo guncellenemedi:', err);
  }
}

async function kayitDuzenle(tarih, vardiya) {
  try {
    const kayitlar = await kayitlariGetir();
    const kayit = kayitlar.find(k => k.tarih === tarih && k.vardiya === vardiya);

    if (kayit) {
      await formuKayitlaDoldur(kayit);
      toast('Duzenleme Modu', `${tarih} - ${vardiya} verileri yuklendi.`, 'info');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } catch (err) {
    console.error('Duzenleme hatasi:', err);
  }
}

async function formuKayitlaDoldur(kayit) {
  if (window.isRestoring) return;
  window.isRestoring = true;

  try {
    document.getElementById('tarih').value = kayit.tarih || '';
    document.querySelectorAll('.vardiya-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.vardiya === kayit.vardiya);
    });

    const personelSel = document.getElementById('personel');
    if (personelSel) {
      personelSel.value = kayit.personel?.id || '';
      personelSel.dispatchEvent(new Event('change'));
    }

    const golKotuInput = document.getElementById('gol-kotu');
    if (golKotuInput) golKotuInput.value = kayit.golKotu || '';

    kayit.uniteler.forEach(u => {
      const container = document.getElementById(`${u.id}-events-container`);
      if (!container) return;

      container.innerHTML = '';
      const events = eventleriNormalizeEt(u);
      events.forEach(e => yeniSeansEkle(u.id, e));

      const kart = document.querySelector(`.unite-card[data-unite-id="${u.id}"]`);
      if (kart) {
        const toggle = kart.querySelector('.unite-toggle');
        if (toggle) {
          toggle.checked = u.durum === 'calisiyor';
          const txt = kart.querySelector('.unite-durum-text');
          const body = kart.querySelector('.unite-body');
          if (u.durum === 'calisiyor') {
            kart.classList.remove('calismiyor');
            if (txt) {
              txt.textContent = 'Calisiyor';
              txt.className = 'unite-durum-text durum-calisir';
            }
            if (body) body.style.opacity = '1';
          } else {
            kart.classList.add('calismiyor');
            if (txt) {
              txt.textContent = 'Duran';
              txt.className = 'unite-durum-text durum-duran';
            }
            if (body) body.style.opacity = '0.5';
          }
        }
      }
    });

    const izahatContainer = document.getElementById('izahat-rows-container');
    if (izahatContainer) {
      izahatContainer.innerHTML = '';
      if (kayit.izahatlar && kayit.izahatlar.length > 0) {
        kayit.izahatlar.forEach(n => yeniIzahatSatiriEkle(n));
      } else {
        yeniIzahatSatiriEkle(kayit.izahat);
      }
    }
  } finally {
    window.isRestoring = false;
  }
}

function formVerisiTopla() {
  const uniteler = [];

  document.querySelectorAll('.unite-card').forEach(kart => {
    const id = kart.dataset.uniteId;
    const durum = kart.querySelector('.unite-toggle')?.checked ? 'calisiyor' : 'duran';
    const events = [];

    kart.querySelectorAll('.event-row').forEach(row => {
      events.push({
        hat: row.querySelector('.hat-btn.active')?.dataset?.hat || '',
        devreye_girme: row.querySelector('.u-devreye')?.value || '',
        devreden_cikma: row.querySelector('.u-cikma')?.value || '',
        ariza_baslama: row.querySelector('.u-ariza-baslama')?.value || '',
        ariza_bitis: row.querySelector('.u-ariza-bitis')?.value || '',
        calisan_korumalar: row.querySelector('.u-korumalar')?.value || '',
        dusen_bayraklar: row.querySelector('.u-bayraklar')?.value || '',
        izahat: row.querySelector('.u-izahat')?.value || ''
      });
    });

    uniteler.push({
      id,
      kod: kart.querySelector('[data-kod]')?.dataset?.kod || id,
      durum,
      events
    });
  });

  const personelSel = document.getElementById('personel');
  const personelOpt = personelSel?.options[personelSel.selectedIndex];

  return {
    tarih: document.getElementById('tarih')?.value || '',
    vardiya: document.querySelector('.vardiya-btn.active')?.dataset?.vardiya || '',
    personel: {
      id: personelOpt?.value || '',
      ad: personelOpt?.textContent || '',
      grup: personelOpt?.dataset?.grup || ''
    },
    golKotu: parseFloat(document.getElementById('gol-kotu')?.value) || null,
    uniteler,
    tesis: TESIS_KEY
  };
}

function formuTemizle() {
  if (!confirm('Tum formu temizlemek istediginize emin misiniz?')) return;

  document.getElementById('tarih').value = new Date().toISOString().split('T')[0];
  document.querySelectorAll('.vardiya-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('personel').value = '';
  document.getElementById('gol-kotu').value = '';

  const izahatContainer = document.getElementById('izahat-rows-container');
  if (izahatContainer) {
    izahatContainer.innerHTML = '';
    yeniIzahatSatiriEkle();
  }

  document.querySelectorAll('.unite-card').forEach(kart => {
    const container = document.getElementById(`${kart.dataset.uniteId}-events-container`);
    if (container) {
      container.innerHTML = '';
      yeniSeansEkle(kart.dataset.uniteId);
    }

    kart.querySelectorAll('input[type="text"]').forEach(i => {
      i.value = '';
    });

    const toggle = kart.querySelector('.unite-toggle');
    if (toggle) {
      toggle.checked = false;
      toggleUnite(kart.dataset.uniteId, false);
    }
  });

  durumuGuncelle('', 'Izahat girilince bildirim otomatik gonderilecek.');
}

async function sonKaydiGetir() {
  try {
    const kayitlar = await kayitlariGetir();
    if (!kayitlar || kayitlar.length === 0) return null;
    return kayitlar[0];
  } catch (err) {
    console.error('Son kayit getirilemedi:', err);
    return null;
  }
}

window.isRestoring = false;

async function formuOncekiVeriyleDoldur(tam_hafiza = false) {
  if (window.isRestoring) return;
  window.isRestoring = true;

  try {
    const kayitlar = await kayitlariGetir();
    if (kayitlar.length === 0) return;

    const seciliTarih = document.getElementById('tarih')?.value;
    const seciliVardiya = document.querySelector('.vardiya-btn.active')?.dataset?.vardiya;

    let referansKayit = null;
    if (tam_hafiza) {
      referansKayit = kayitlar.find(k => k.tarih === seciliTarih && k.vardiya === seciliVardiya) || kayitlar[0];
    } else {
      const seciliIdx = kayitlar.findIndex(k => k.tarih === seciliTarih && k.vardiya === seciliVardiya);
      if (seciliIdx !== -1 && seciliIdx + 1 < kayitlar.length) {
        referansKayit = kayitlar[seciliIdx + 1];
      } else {
        referansKayit = kayitlar[0];
      }
    }

    if (!referansKayit) return;

    if (tam_hafiza) {
      const tarihInput = document.getElementById('tarih');
      if (tarihInput) tarihInput.value = referansKayit.tarih || '';

      document.querySelectorAll('.vardiya-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.vardiya === referansKayit.vardiya);
      });

      const personelSel = document.getElementById('personel');
      if (personelSel) {
        personelSel.value = referansKayit.personel?.id || '';
        personelSel.dispatchEvent(new Event('change'));
      }
    }

    const golKotuInput = document.getElementById('gol-kotu');
    if (golKotuInput) golKotuInput.value = referansKayit.golKotu || '';

    referansKayit.uniteler.forEach(u => {
      const container = document.getElementById(`${u.id}-events-container`);
      if (container) {
        container.innerHTML = '';
        if (tam_hafiza) {
          const events = eventleriNormalizeEt(u);
          events.forEach(e => yeniSeansEkle(u.id, e));
        } else {
          const events = eventleriNormalizeEt(u);
          const sonEvent = events[events.length - 1] || {};
          yeniSeansEkle(u.id, { hat: sonEvent.hat || '' });
        }
      }

      const kart = document.querySelector(`.unite-card[data-unite-id="${u.id}"]`);
      if (kart) {
        const toggle = kart.querySelector('.unite-toggle');
        if (toggle) {
          toggle.checked = u.durum === 'calisiyor';
          const txt = kart.querySelector('.unite-durum-text');
          const body = kart.querySelector('.unite-body');
          if (u.durum === 'calisiyor') {
            kart.classList.remove('calismiyor');
            if (txt) {
              txt.textContent = 'Calisiyor';
              txt.className = 'unite-durum-text durum-calisir';
            }
            if (body) body.style.opacity = '1';
          } else {
            kart.classList.add('calismiyor');
            if (txt) {
              txt.textContent = 'Duran';
              txt.className = 'unite-durum-text durum-duran';
            }
            if (body) body.style.opacity = '0.5';
          }
        }
      }
    });

    const izahatContainer = document.getElementById('izahat-rows-container');
    if (izahatContainer) {
      izahatContainer.innerHTML = '';
      if (tam_hafiza) {
        if (referansKayit.izahatlar && referansKayit.izahatlar.length > 0) {
          referansKayit.izahatlar.forEach(n => yeniIzahatSatiriEkle(n));
        } else {
          yeniIzahatSatiriEkle(referansKayit.izahat);
        }
      } else {
        yeniIzahatSatiriEkle();
      }
    }

    tabloyuGuncelle();
    if (tam_hafiza) toast('Sistem Hazir', 'Veriler basariyla yuklendi.', 'success');
  } catch (err) {
    console.error('Miras alma hatasi:', err);
  } finally {
    window.isRestoring = false;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ilkSeansSatirlariniStandartlastir);
} else {
  ilkSeansSatirlariniStandartlastir();
}
