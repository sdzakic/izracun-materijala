'use strict';

/* ================= PODACI (okvirne vrijednosti) ================= */

// komM2 – komada po m² zida (uključena fuga), vezivo – kg suhe mješavine po m²
const BLOKOVI = [
  { id: 'p25',     naziv: 'Porotherm 25 N+F',              dim: '37,5 × 25 × 23,8 cm', debljina: 25,   komM2: 10.7, paleta: 60,  vezivo: 30 },
  { id: 'p30',     naziv: 'Porotherm 30 N+F',              dim: '25 × 30 × 23,8 cm',   debljina: 30,   komM2: 16,   paleta: 80,  vezivo: 38 },
  { id: 'p38',     naziv: 'Porotherm 38 N+F',              dim: '25 × 38 × 23,8 cm',   debljina: 38,   komM2: 16,   paleta: 60,  vezivo: 48 },
  { id: 'p12',     naziv: 'Porotherm 12 (pregradni)',      dim: '50 × 11,5 × 23,8 cm', debljina: 11.5, komM2: 8,    paleta: 100, vezivo: 12 },
  { id: 'p8',      naziv: 'Porotherm 8 (pregradni)',       dim: '50 × 8 × 23,8 cm',    debljina: 8,    komM2: 8,    paleta: 144, vezivo: 8 },
  { id: 'ytong20', naziv: 'Plinobeton 20 (Ytong/Siporex)', dim: '62,5 × 20 × 25 cm',   debljina: 20,   komM2: 6.4,  paleta: 48,  vezivo: 4 },
  { id: 'ytong25', naziv: 'Plinobeton 25 (Ytong/Siporex)', dim: '62,5 × 25 × 25 cm',   debljina: 25,   komM2: 6.4,  paleta: 40,  vezivo: 5 },
  { id: 'beton20', naziv: 'Betonski blok 20',              dim: '40 × 20 × 20 cm',     debljina: 20,   komM2: 12,   paleta: 60,  vezivo: 30 },
  { id: 'beton25', naziv: 'Betonski blok 25',              dim: '40 × 25 × 20 cm',     debljina: 25,   komM2: 12,   paleta: 48,  vezivo: 36 },
  { id: 'custom',  naziv: 'Vlastite dimenzije…' },
];

// komM2 – komada po m² krova, letvanje – razmak letava (cm), sljemeKpm – sljemenjaka po m'
const CRIJEP = [
  { id: 'francuski', naziv: 'Glineni utoreni – klasični (npr. Francuski)', komM2: 14,   letvanje: 34, sljemeKpm: 2.5 },
  { id: 'veliki',    naziv: 'Glineni utoreni – veliki format',             komM2: 10.5, letvanje: 40, sljemeKpm: 2.5 },
  { id: 'mediteran', naziv: 'Glineni valoviti (Mediteran)',                komM2: 12.5, letvanje: 36, sljemeKpm: 2.5 },
  { id: 'betonski',  naziv: 'Betonski crijep',                             komM2: 10,   letvanje: 33, sljemeKpm: 2.5 },
  { id: 'biber',     naziv: 'Biber – dvostruko pokrivanje',                komM2: 36,   letvanje: 15, sljemeKpm: 2.5 },
  { id: 'custom',    naziv: 'Vlastiti parametri…' },
];

const PRESJECI = ['8×12', '10×14', '10×16', '12×16', '12×18', '14×14', '14×18', '14×20', '16×16', '16×20'];

const OBLICI = { jednostresni: 'Jednostrešni', dvostresni: 'Dvostrešni', cetverostresni: 'Četverostrešni' };

/* ================= STANJE ================= */

const STORAGE_KEY = 'izracun-materijala-v1';

function defaultState() {
  const b = BLOKOVI[0], c = CRIJEP[0];
  return {
    projekt: '',
    tema: 'dark',
    prikaziCijene: true,
    blok: {
      ispis: true,
      tip: b.id,
      nacin: 'objekt',
      objekt: { duljina: 10, sirina: 8, visina: 2.8 },
      custom: { duljina: 50, visina: 25, debljina: 25, fuga: 10 },
      zidovi: [{ naziv: 'Zid 1', duljina: 10, visina: 2.8 }],
      otvori: [{ naziv: 'Prozor', sirina: 1.2, visina: 1.4, kom: 2 }],
      otpad: 5,
      komM2: b.komM2, debljina: b.debljina, paleta: b.paleta, vezivo: b.vezivo, vreca: 25,
      cijenaBlok: 0, cijenaVezivo: 0,
    },
    krov: {
      ispis: true,
      oblik: 'dvostresni',
      duljina: 10, sirina: 8, nagib: 30, prepustStreha: 50, prepustZabat: 30,
      crijep: c.id, komM2: c.komM2, letvanje: c.letvanje, sljemeKpm: c.sljemeKpm,
      otpad: 5,
      grede: false, razmak: 80, presjekRog: '10×16', presjekGreda: '14×18', otpadDrvo: 10,
      cijenaCrijep: 0, cijenaSljeme: 0, cijenaDrvo: 0, cijenaLetve: 0, cijenaFolija: 0,
    },
  };
}

function merge(base, saved) {
  if (!saved || typeof saved !== 'object') return base;
  for (const k of Object.keys(base)) {
    if (!(k in saved)) continue;
    const bv = base[k], sv = saved[k];
    if (Array.isArray(bv)) base[k] = Array.isArray(sv) ? sv : bv;
    else if (bv && typeof bv === 'object') merge(bv, sv);
    else if (typeof sv === typeof bv) base[k] = sv;
  }
  return base;
}

function load() {
  try { return merge(defaultState(), JSON.parse(localStorage.getItem(STORAGE_KEY))); }
  catch { return defaultState(); }
}

let saveTimer;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* nema pohrane */ }
  }, 200);
}

const state = load();

/* ================= POMOĆNE ================= */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const num = v => (Number.isFinite(+v) ? +v : 0);

const getPath = p => p.split('.').reduce((o, k) => o?.[k], state);
function setPath(p, v) {
  const keys = p.split('.'), last = keys.pop();
  keys.reduce((o, k) => o[k], state)[last] = v;
}

const nf = new Map();
function fmt(n, dec = 0) {
  if (!nf.has(dec)) nf.set(dec, new Intl.NumberFormat('hr-HR', { minimumFractionDigits: dec, maximumFractionDigits: dec }));
  return nf.get(dec).format(n);
}
const eur = n => new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' }).format(n);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const presjek = s => s.split('×').map(x => num(x) / 100);

/* ================= IZRAČUN: BLOKOVI ================= */

function izracunBlok() {
  const b = state.blok;
  const tip = BLOKOVI.find(t => t.id === b.tip) ?? BLOKOVI[0];
  const poObjektu = b.nacin === 'objekt';
  const opseg = 2 * (num(b.objekt.duljina) + num(b.objekt.sirina));
  const bruto = poObjektu
    ? opseg * num(b.objekt.visina)
    : b.zidovi.reduce((s, z) => s + num(z.duljina) * num(z.visina), 0);
  const otvori = poObjektu ? 0 : b.otvori.reduce((s, o) => s + num(o.sirina) * num(o.visina) * num(o.kom), 0);
  const neto = Math.max(0, bruto - otvori);
  const faktor = 1 + num(b.otpad) / 100;

  const blokova = Math.ceil(neto * num(b.komM2) * faktor);
  const vezivoKg = neto * num(b.vezivo) * faktor;
  const vreca = num(b.vreca) || 25;
  const vreca_kom = Math.ceil(vezivoKg / vreca);
  const palete = num(b.paleta) > 0 ? blokova / num(b.paleta) : 0;
  const volumen = neto * num(b.debljina) / 100;
  const jeLjepilo = b.tip.startsWith('ytong');

  const stavke = [
    { naziv: tip.id === 'custom' ? 'Blok (vlastite dimenzije)' : tip.naziv,
      opis: `${fmt(num(b.komM2), 1)} kom/m² + ${fmt(num(b.otpad))} % otpad`,
      kolicina: blokova, jed: 'kom', dec: 0, cijena: num(b.cijenaBlok) },
    { naziv: jeLjepilo ? 'Ljepilo za plinobeton' : 'Mort za zidanje',
      opis: `≈ ${fmt(vezivoKg)} kg, vreće od ${fmt(vreca)} kg`,
      kolicina: vreca_kom, jed: 'vreća', dec: 0, cijena: num(b.cijenaVezivo) },
  ];

  return {
    tip, poObjektu, opseg, bruto, otvori, neto, volumen, palete, blokova, stavke,
    ukupno: stavke.reduce((s, x) => s + x.kolicina * x.cijena, 0),
  };
}

/* ================= IZRAČUN: KROV ================= */

function izracunKrov() {
  const k = state.krov;
  let L = num(k.duljina), W = num(k.sirina);
  const a = Math.min(Math.max(num(k.nagib), 1), 80) * Math.PI / 180;
  const cos = Math.cos(a), tan = Math.tan(a);
  const ps = num(k.prepustStreha) / 100, pz = num(k.prepustZabat) / 100;

  let Lo, Wo;
  if (k.oblik === 'cetverostresni') {
    if (W > L) [L, W] = [W, L];
    Lo = L + 2 * ps; Wo = W + 2 * ps;
  } else {
    Lo = L + 2 * pz; Wo = W + 2 * ps;
  }

  // površina svih ploha kod jednakog nagiba = tlocrt s prepustima / cos(nagib)
  const povrsina = (Lo * Wo) / cos;
  const run = k.oblik === 'jednostresni' ? Wo : Wo / 2;       // horizontalni raspon roga
  const rogDuljina = run / cos;
  const visina = (k.oblik === 'jednostresni' ? W : W / 2) * tan;

  let sljeme = 0, sljemeGreda = 0, grebenDuljina = 0;
  if (k.oblik === 'dvostresni') {
    sljeme = sljemeGreda = Lo;
  } else if (k.oblik === 'cetverostresni') {
    grebenDuljina = Math.sqrt(2 * run * run + (run * tan) ** 2);
    sljemeGreda = Math.max(0, Lo - Wo);
    sljeme = sljemeGreda + 4 * grebenDuljina;
  }

  const f = 1 + num(k.otpad) / 100;
  const crijep = Math.ceil(povrsina * num(k.komM2) * f);
  const sljemenjaci = Math.ceil(sljeme * num(k.sljemeKpm) * f);
  const tipC = CRIJEP.find(c => c.id === k.crijep) ?? CRIJEP[0];

  const stavke = [
    { naziv: 'Crijep',
      opis: `${tipC.id === 'custom' ? '' : `${tipC.naziv} · `}${fmt(num(k.komM2), 1)} kom/m² + ${fmt(num(k.otpad))} % otpad`,
      kolicina: crijep, jed: 'kom', dec: 0, cijena: num(k.cijenaCrijep) },
  ];
  if (sljeme > 0) {
    stavke.push({ naziv: 'Sljemenjaci', opis: `${fmt(sljeme, 2)} m' sljemena${grebenDuljina ? ' i grebena' : ''}`,
      kolicina: sljemenjaci, jed: 'kom', dec: 0, cijena: num(k.cijenaSljeme) });
  }

  let rogovi = null;
  if (k.grede) {
    const s = Math.max(num(k.razmak), 30) / 100;
    const fd = 1 + num(k.otpadDrvo) / 100;
    const [rb, rh] = presjek(k.presjekRog);
    const [gb, gh] = presjek(k.presjekGreda);

    let rogKom, rogM;
    if (k.oblik === 'cetverostresni') {
      // ukupna duljina rogova ≈ površina / razmak + 4 grebena roga
      rogM = povrsina / s + 4 * grebenDuljina;
      rogKom = null;
    } else {
      rogKom = (Math.ceil(Lo / s) + 1) * (k.oblik === 'dvostresni' ? 2 : 1);
      rogM = rogKom * rogDuljina;
    }

    const nazidnica = k.oblik === 'cetverostresni' ? 2 * (L + W) : 2 * L;
    const gredeM = nazidnica + sljemeGreda;
    const letveM = povrsina / (Math.max(num(k.letvanje), 1) / 100);
    const cDrvo = num(k.cijenaDrvo), cLetve = num(k.cijenaLetve);

    rogovi = { rogKom, rogDuljina, rogM };
    stavke.push(
      { naziv: `Rogovi ${k.presjekRog} cm`, wood: true,
        opis: rogKom ? `${rogKom} kom × ${fmt(rogDuljina, 2)} m` : `≈ ${fmt(rogM, 1)} m' (uklj. grebene)`,
        kolicina: rogM * rb * rh * fd, jed: 'm³', dec: 2, cijena: cDrvo },
      { naziv: `Grede ${k.presjekGreda} cm`, wood: true,
        opis: `nazidnica ${fmt(nazidnica, 1)} m'${sljemeGreda ? ` + sljeme ${fmt(sljemeGreda, 1)} m'` : ''}`,
        kolicina: gredeM * gb * gh * fd, jed: 'm³', dec: 2, cijena: cDrvo },
      { naziv: 'Letve 3×5 cm', wood: true, opis: `razmak ${fmt(num(k.letvanje), 1)} cm`,
        kolicina: letveM * fd, jed: "m'", dec: 0, cijena: cLetve },
      { naziv: 'Kontraletve 3×5 cm', wood: true, opis: 'po rogovima',
        kolicina: rogM * fd, jed: "m'", dec: 0, cijena: cLetve },
      { naziv: 'Paropropusna krovna folija', wood: true, opis: '+10 % preklop',
        kolicina: povrsina * 1.1, jed: 'm²', dec: 1, cijena: num(k.cijenaFolija) },
    );
  }

  return {
    povrsina, tlocrt: L * W, visina, rogDuljina, sljeme, crijep, rogovi, stavke,
    ukupno: stavke.reduce((s, x) => s + x.kolicina * x.cijena, 0),
  };
}

/* ================= PRIKAZ ================= */

function tablica(stavke, ukupno) {
  const rows = stavke.map(s => `
    <tr>
      <td>${esc(s.naziv)}<span class="sub">${esc(s.opis)}</span></td>
      <td class="n"><strong>${fmt(s.kolicina, s.dec)}</strong> ${s.jed}</td>
      <td class="n price">${s.cijena ? `${fmt(s.cijena, 2)} €` : '—'}</td>
      <td class="n price">${s.cijena ? eur(s.kolicina * s.cijena) : '—'}</td>
    </tr>`).join('');
  return `
    <table class="tbl">
      <thead><tr><th>Stavka</th><th class="n">Količina</th><th class="n price">Jed. cijena</th><th class="n price">Iznos</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot class="price"><tr><td colspan="3">Ukupno</td><td class="n">${eur(ukupno)}</td></tr></tfoot>
    </table>`;
}

const stat = (label, value, unit, main) =>
  `<div class="stat${main ? ' main' : ''}"><div class="label">${label}</div><div class="value">${value}<span class="unit">${unit}</span></div></div>`;

const facts = list => `<dl class="facts">${list.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;

function renderBlok(r) {
  const el = $('#res-blok');
  if (r.neto <= 0) {
    el.innerHTML = `<p class="empty">Unesite dimenzije ${state.blok.nacin === 'objekt' ? 'objekta' : 'zidova'} za izračun.</p>`;
    return;
  }
  el.innerHTML =
    `<div class="stats">
      ${stat('Potrebno blokova', fmt(r.blokova), 'kom', true)}
      ${stat('Neto površina', fmt(r.neto, 2), 'm²')}
      ${stat('Palete', fmt(r.palete, 1), 'kom')}
    </div>` +
    facts([
      r.poObjektu ? ['Opseg objekta', `${fmt(r.opseg, 2)} m`] : ['Bruto površina zidova', `${fmt(r.bruto, 2)} m²`],
      ...(r.poObjektu ? [] : [['Otvori', `− ${fmt(r.otvori, 2)} m²`]]),
      ['Volumen zida', `${fmt(r.volumen, 2)} m³`],
    ]) +
    tablica(r.stavke, r.ukupno);
}

function renderKrov(r) {
  const el = $('#res-krov');
  if (r.povrsina <= 0) {
    el.innerHTML = '<p class="empty">Unesite dimenzije objekta za izračun.</p>';
    return;
  }
  const f = [
    ['Tlocrt objekta', `${fmt(r.tlocrt, 2)} m²`],
    ['Visina krova (do sljemena)', `${fmt(r.visina, 2)} m`],
    ['Duljina roga (s prepustom)', `${fmt(r.rogDuljina, 2)} m`],
  ];
  if (r.sljeme) f.push(['Sljeme i grebeni', `${fmt(r.sljeme, 2)} m'`]);
  el.innerHTML =
    `<div class="stats">
      ${stat('Potrebno crijepa', fmt(r.crijep), 'kom', true)}
      ${stat('Površina krova', fmt(r.povrsina, 2), 'm²')}
      ${stat('Nagib', fmt(num(state.krov.nagib)), '°')}
    </div>` +
    facts(f) +
    tablica(r.stavke, r.ukupno);
}

function renderTotal(rb, rk) {
  const ukupno = rb.ukupno + rk.ukupno;
  $('#total-bar').innerHTML = `<div><strong>Sveukupno</strong> <span class="muted">(blokovi + krov)</span></div><div class="value">${eur(ukupno)}</div>`;
}

const LABELS = { duljina: 'Duljina', sirina: 'Širina', visina: 'Visina', kom: 'Kom' };

function renderList(name) {
  const items = state.blok[name];
  const fields = name === 'zidovi'
    ? [['naziv', 'text'], ['duljina', 'm'], ['visina', 'm']]
    : [['naziv', 'text'], ['sirina', 'm'], ['visina', 'm'], ['kom', '']];
  $(`#list-${name}`).innerHTML = items.map((it, i) => `
    <div class="list-row list-cols-${fields.length}">
      ${fields.map(([f, u]) => u === 'text'
        ? `<input type="text" data-list="${name}" data-i="${i}" data-f="${f}" value="${esc(it[f] ?? '')}" aria-label="${f}">`
        : `<div class="iu" data-l="${LABELS[f]}"><input type="number" min="0" step="${f === 'kom' ? 1 : 0.01}" inputmode="decimal" data-list="${name}" data-i="${i}" data-f="${f}" value="${it[f] ?? ''}" aria-label="${f}"><em>${u}</em></div>`
      ).join('')}
      <button type="button" class="x" data-del="${name}" data-i="${i}" aria-label="Ukloni">×</button>
    </div>`).join('');
}

function populate() {
  $$('[data-bind]').forEach(el => {
    if (el === document.activeElement && el.type !== 'radio' && el.tagName !== 'SELECT') return;
    const v = getPath(el.dataset.bind);
    if (el.type === 'checkbox') el.checked = !!v;
    else if (el.type === 'radio') el.checked = el.value === v;
    else el.value = v ?? '';
  });
}

function update() {
  document.body.classList.toggle('no-prices', !state.prikaziCijene);
  document.documentElement.dataset.theme = state.tema;
  $('#blok-objekt').hidden = state.blok.nacin !== 'objekt';
  $('#blok-zidovi').hidden = state.blok.nacin === 'objekt';

  const tip = BLOKOVI.find(t => t.id === state.blok.tip);
  $('#blok-custom').hidden = state.blok.tip !== 'custom';
  $('#blok-info').textContent = tip && tip.dim ? `Dimenzije: ${tip.dim} · debljina zida ${fmt(tip.debljina, 1)} cm` : '';
  $('#f-zabat').hidden = state.krov.oblik === 'cetverostresni';
  $('#grede-fields').hidden = !state.krov.grede;
  $$('.field.wood').forEach(el => (el.hidden = !state.krov.grede));

  const rb = izracunBlok(), rk = izracunKrov();
  $('#objekt-info').textContent = rb.poObjektu
    ? `Opseg ${fmt(rb.opseg, 2)} m × visina = ${fmt(rb.bruto, 2)} m² zidova. Otvori se ne oduzimaju — za to odaberite unos po zidovima.`
    : '';
  renderBlok(rb);
  renderKrov(rk);
  renderTotal(rb, rk);
  save();
  return { rb, rk };
}

/* ================= ISPIS ================= */

function buildPrint() {
  const { rb, rk } = update();
  const b = state.blok, k = state.krov;
  const datum = new Date().toLocaleDateString('hr-HR', { day: 'numeric', month: 'long', year: 'numeric' });
  let html = `
    <div class="pv-head">
      <div><h1>${esc(state.projekt || 'Izračun materijala')}</h1>${state.projekt ? '<div class="meta" style="text-align:left">Izračun materijala</div>' : ''}</div>
      <div class="meta">${datum}</div>
    </div>`;

  if (b.ispis && rb.neto > 0) {
    const tip = rb.tip.id === 'custom'
      ? `vlastiti blok ${fmt(num(b.custom.duljina), 1)} × ${fmt(num(b.custom.visina), 1)} cm`
      : `${rb.tip.naziv} (${rb.tip.dim})`;
    const zidovi = b.zidovi.map(z => `${esc(z.naziv || 'Zid')}: ${fmt(num(z.duljina), 2)} × ${fmt(num(z.visina), 2)} m`).join('; ');
    const otvori = b.otvori.filter(o => num(o.kom) > 0).map(o => `${esc(o.naziv || 'Otvor')}: ${fmt(num(o.kom))} × (${fmt(num(o.sirina), 2)} × ${fmt(num(o.visina), 2)} m)`).join('; ');
    html += `
      <div class="pv-sec">
        <h2>Zidanje blokovima</h2>
        <p class="pv-inputs">
          Blok: ${esc(tip)}<br>
          ${rb.poObjektu
            ? `Objekt: ${fmt(num(b.objekt.duljina), 2)} × ${fmt(num(b.objekt.sirina), 2)} m, visina zidova ${fmt(num(b.objekt.visina), 2)} m (opseg ${fmt(rb.opseg, 2)} m)<br>
               <strong>Površina zidova ${fmt(rb.neto, 2)} m²</strong> (bez odbitka otvora) · palete ≈ ${fmt(rb.palete, 1)}`
            : `Zidovi: ${zidovi}<br>
               ${otvori ? `Otvori: ${otvori}<br>` : ''}
               Površina: bruto ${fmt(rb.bruto, 2)} m², otvori ${fmt(rb.otvori, 2)} m², <strong>neto ${fmt(rb.neto, 2)} m²</strong> · palete ≈ ${fmt(rb.palete, 1)}`}
        </p>
        ${tablica(rb.stavke, rb.ukupno)}
      </div>`;
  }

  if (k.ispis && rk.povrsina > 0) {
    const prepust = k.oblik === 'cetverostresni'
      ? `prepust ${fmt(num(k.prepustStreha))} cm`
      : `prepust strehe ${fmt(num(k.prepustStreha))} cm, zabata ${fmt(num(k.prepustZabat))} cm`;
    html += `
      <div class="pv-sec">
        <h2>Krov – ${OBLICI[k.oblik]}</h2>
        <p class="pv-inputs">
          Objekt ${fmt(num(k.duljina), 2)} × ${fmt(num(k.sirina), 2)} m, nagib ${fmt(num(k.nagib))}°, ${prepust}<br>
          <strong>Površina krova ${fmt(rk.povrsina, 2)} m²</strong> · visina krova ${fmt(rk.visina, 2)} m · duljina roga ${fmt(rk.rogDuljina, 2)} m
          ${k.grede ? `<br>Rogovi ${k.presjekRog} cm na razmaku ${fmt(num(k.razmak))} cm` : ''}
        </p>
        ${tablica(rk.stavke, rk.ukupno)}
      </div>`;
  }

  const ukupno = (b.ispis ? rb.ukupno : 0) + (k.ispis ? rk.ukupno : 0);
  if (state.prikaziCijene && b.ispis && k.ispis && rb.neto > 0 && rk.povrsina > 0) {
    html += `<div class="pv-total price"><span>Sveukupno</span><span>${eur(ukupno)}</span></div>`;
  }
  html += `<p class="pv-note">Izračun je okviran i služi za procjenu. Potrošnja ovisi o proizvođaču materijala; dimenzioniranje konstrukcije krova potvrđuje ovlašteni inženjer.</p>`;

  $('#print-view').innerHTML = html;
}

/* ================= DOGAĐAJI ================= */

function readValue(el) {
  if (el.type === 'checkbox') return el.checked;
  if (el.type === 'number') return el.value === '' ? 0 : num(el.value);
  return el.value;
}

function onInput(e) {
  const el = e.target;

  if (el.dataset.bind) {
    if (el.type === 'radio' && !el.checked) return;
    const path = el.dataset.bind;
    setPath(path, readValue(el));

    if (path === 'blok.tip') {
      const t = BLOKOVI.find(x => x.id === el.value);
      if (t && t.id !== 'custom') Object.assign(state.blok, { komM2: t.komM2, debljina: t.debljina, paleta: t.paleta, vezivo: t.vezivo });
      if (t?.id === 'custom') customBlok();
      populate();
    } else if (path.startsWith('blok.custom.')) {
      customBlok();
      populate();
    } else if (path === 'krov.crijep') {
      const c = CRIJEP.find(x => x.id === el.value);
      if (c && c.id !== 'custom') Object.assign(state.krov, { komM2: c.komM2, letvanje: c.letvanje, sljemeKpm: c.sljemeKpm });
      if (c?.id === 'custom') $('.adv', $('#sec-krov')).open = true;
      populate();
    }
  } else if (el.dataset.list) {
    state.blok[el.dataset.list][+el.dataset.i][el.dataset.f] = readValue(el);
  } else return;

  update();
}

function customBlok() {
  const c = state.blok.custom;
  const d = (num(c.duljina) * 10 + num(c.fuga)) / 1000;
  const v = (num(c.visina) * 10 + num(c.fuga)) / 1000;
  state.blok.komM2 = d > 0 && v > 0 ? Math.round((1 / (d * v)) * 10) / 10 : 0;
  state.blok.debljina = num(c.debljina);
}

document.addEventListener('input', onInput);
document.addEventListener('change', onInput);

document.addEventListener('click', e => {
  const add = e.target.closest('[data-add]');
  const del = e.target.closest('[data-del]');
  if (add) {
    const name = add.dataset.add, list = state.blok[name];
    list.push(name === 'zidovi'
      ? { naziv: `Zid ${list.length + 1}`, duljina: 0, visina: list.at(-1)?.visina ?? 2.8 }
      : { naziv: 'Vrata', sirina: 0.9, visina: 2.1, kom: 1 });
    renderList(name);
    update();
    $$(`#list-${name} .list-row`).at(-1)?.querySelector('input[type="number"]')?.focus();
  } else if (del) {
    state.blok[del.dataset.del].splice(+del.dataset.i, 1);
    renderList(del.dataset.del);
    update();
  }
});

$('#btn-theme').addEventListener('click', () => {
  state.tema = state.tema === 'dark' ? 'light' : 'dark';
  update();
});
$('#btn-print').addEventListener('click', () => { buildPrint(); window.print(); });
window.addEventListener('beforeprint', buildPrint);

/* ================= INIT ================= */

$('#blok-tip').innerHTML = BLOKOVI.map(t => `<option value="${t.id}">${t.naziv}${t.dim ? ` — ${t.dim}` : ''}</option>`).join('');
$('#krov-crijep').innerHTML = CRIJEP.map(c => `<option value="${c.id}">${c.naziv}</option>`).join('');
$$('select.presjek').forEach(s => (s.innerHTML = PRESJECI.map(p => `<option value="${p}">${p} cm</option>`).join('')));

populate();
renderList('zidovi');
renderList('otvori');
update();
