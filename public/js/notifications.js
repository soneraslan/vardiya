/**
 * notifications.js - Bildirim gonderici modulu
 */

async function izahatBildirimiGonder({ tesis, izahat, tarih, vardiya }) {
  if (!izahat || izahat.trim().length < 3) return;

  let uniteMesajlari = '';

  document.querySelectorAll('.unite-card').forEach(kart => {
    const kod = kart.querySelector('[data-kod]')?.dataset?.kod || 'Unite';
    let eventDetails = '';

    kart.querySelectorAll('.event-row').forEach((row, idx) => {
      const baslama = row.querySelector('.u-ariza-baslama')?.value;
      const bitis = row.querySelector('.u-ariza-bitis')?.value;
      const koruma = row.querySelector('.u-korumalar')?.value;
      const bayrak = row.querySelector('.u-bayraklar')?.value;

      const satirDetaylari = [];
      if (baslama || bitis) satirDetaylari.push(`Bs:${baslama || '-'} / Bt:${bitis || '-'}`);
      if (koruma) satirDetaylari.push(`Koruma: ${koruma}`);
      if (bayrak) satirDetaylari.push(`Bayrak: ${bayrak}`);

      if (satirDetaylari.length > 0) {
        eventDetails += `    - S${idx + 1}: ${satirDetaylari.join(' | ')}\n`;
      }
    });

    if (eventDetails) {
      uniteMesajlari += `\n*${kod}*:\n${eventDetails}`;
    }
  });

  const mesaj =
    `Tarih   : ${tarih}\n` +
    `Vardiya : ${vardiya}\n` +
    `Izahatlar:\n${izahat}\n` +
    uniteMesajlari;

  const konu = `Vardiya Ozeti / Izahat - ${tarih}`;

  durumuGuncelle('gonderiliyor', 'Bildirim gonderiliyor...');

  try {
    const res = await fetch('/api/bildirim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mesaj, konu, tesis })
    });

    await res.json();
    durumuGuncelle('gonderildi', 'Bildirim gonderildi');
    toast('Bildirim Gonderildi', 'Izahat ve vardiya ozeti iletildi.', 'success');
  } catch (err) {
    durumuGuncelle('hata', 'Bildirim gonderilemedi!');
    toast('Bildirim Hatasi', err.message, 'error');
  }
}

function durumuGuncelle(durum, metin) {
  const ind = document.getElementById('bildirim-indicator');
  const txt = document.getElementById('bildirim-text');
  if (ind) ind.className = `bildirim-indicator ${durum}`;
  if (txt) txt.textContent = metin;
}

function izahatDinle(tesisBilgisi) {
  document.addEventListener('change', (e) => {
    if (!e.target.classList.contains('u-izahat')) return;

    const izahatlar = [];
    document.querySelectorAll('.u-izahat').forEach(ta => {
      if (ta.value.trim()) izahatlar.push(ta.value.trim());
    });

    if (izahatlar.length === 0) return;

    const birlesikIzahat = izahatlar.join('\n');
    const tarih = document.getElementById('tarih')?.value || '-';
    const vardiya = document.querySelector('.vardiya-btn.active')?.dataset?.vardiya || '-';

    durumuGuncelle('bekliyor', 'Izahat girildi - bildirim bekliyor...');

    clearTimeout(window._izahatTimer);
    window._izahatTimer = setTimeout(() => {
      izahatBildirimiGonder({
        tesis: tesisBilgisi,
        izahat: birlesikIzahat,
        tarih,
        vardiya
      });
    }, 4000);
  });
}
