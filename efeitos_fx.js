/* ---------- KIT DE EFEITOS EXAGERADOS (estilo Final Fantasy) ----------
   Tudo por codigo, por cima das folhas de efeito: luz somada ('lighter'), raios girando, aneis de choque,
   pilares de luz, cortes de luz, zoom da camera, faixas de cinema, linhas de velocidade e o "quadro de impacto".
   FX.mundo = coisas no campo (coordenadas do mundo, dentro da camera); FX.tela = coisas na tela inteira.
   Usa globais do index.html (parts, CAM, W, H, rnd, clamp, tween, flash, shake) so na hora de rodar. */
const FX = {mundo: [], tela: [], cinza: 0, barras: 0, barrasAlvo: 0, vinheta: 0, vinhetaCor: '120,220,255'};

// Efeitos mais contidos para o Jux (dava para nao enxergar a animacao por baixo): tamanho, quantidade e brilho menores. O Bino mantem a escala cheia (os dele sao proprios).
// zoom de camera mais discreto para o Jux (so 30% do exagero); o Bino mantem o dele
const camK = z => (typeof hero !== 'undefined' && hero && hero.quem === 'bino') ? z : 1;   // Jux: camera parada (sem zoom em golpe nenhum)
const fxEsc = () => (typeof hero !== 'undefined' && hero && hero.quem === 'bino') ? {t: 1, q: 1, a: 1} : {t: .5, q: .3, a: .4, limpo: true};   // Jux: visual LIMPO (sem raios, pilares, estrelas, clarao de tela nem quadro de impacto); ficam so os efeitos desenhados + cortes e brilho discretos
function fxAdd(lista, ms, fn) { lista.push({t: 0, ms, fn}); }
const fxEase = k => 1 - Math.pow(1 - k, 3);

// brilho redondo e suave (luz somada)
function fxBrilho(x, y, o) {
  o = o || {}; const E = fxEsc(), r = (o.raio || 160) * E.t, cor = o.cor || '150,230,255'; o = Object.assign({}, o, {a: (o.a || .9) * E.a});
  fxAdd(FX.mundo, o.ms || 500, (c, k) => {
    const a = (o.a || .9) * (1 - k), rr = r * (o.cresce ? .4 + k * .9 : 1);
    const g = c.createRadialGradient(x, y, 0, x, y, rr);
    g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(.25, `rgba(${cor},${a * .8})`); g.addColorStop(1, `rgba(${cor},0)`);
    c.fillStyle = g; c.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  });
}

// raios de luz saindo de um ponto, girando
function fxRaios(x, y, o) {
  if (fxEsc().limpo) return;
  o = o || {}; const E = fxEsc(), n = Math.max(4, Math.round((o.n || 14) * E.q)), R = (o.raio || 520) * E.t, cor = o.cor || '170,235,255'; o = Object.assign({}, o, {a: (o.a || .55) * E.a}); const gira = o.gira ?? .6, base = rnd(0, 6.28);
  const larg = Array.from({length: n}, () => rnd(.04, .11)), comp = Array.from({length: n}, () => rnd(.6, 1));
  fxAdd(FX.mundo, o.ms || 700, (c, k) => {
    const a = (o.a || .55) * Math.sin(Math.PI * Math.min(1, k * 1.4 + .05)), rot = base + k * gira;
    c.save(); c.translate(x, y); c.scale(1, o.achata || 1);
    for (let i = 0; i < n; i++) {
      const ang = rot + i / n * 6.283, w = larg[i], L = R * comp[i] * (.5 + fxEase(k) * .6);
      const g = c.createLinearGradient(0, 0, Math.cos(ang) * L, Math.sin(ang) * L);
      g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(.3, `rgba(${cor},${a * .6})`); g.addColorStop(1, `rgba(${cor},0)`);
      c.fillStyle = g; c.beginPath(); c.moveTo(0, 0);
      c.lineTo(Math.cos(ang - w) * L, Math.sin(ang - w) * L); c.lineTo(Math.cos(ang + w) * L, Math.sin(ang + w) * L); c.fill();
    }
    c.restore();
  });
}

// anel de choque que se abre (chao = achatado)
function fxAnel(x, y, o) {
  o = o || {}; const E = fxEsc(), R = (o.raio || 360) * E.t, cor = o.cor || '170,240,255'; o = Object.assign({}, o, {a: (o.a || 1) * E.a, esp: (o.esp || 26) * E.t});
  fxAdd(FX.mundo, o.ms || 550, (c, k) => {
    const r = 20 + R * fxEase(k), a = (o.a || 1) * (1 - k);
    c.save(); c.translate(x, y); c.scale(1, o.achata || 1);
    c.lineWidth = (o.esp || 26) * (1 - k * .8);
    c.strokeStyle = `rgba(${cor},${a * .55})`; c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.stroke();
    c.lineWidth *= .35; c.strokeStyle = `rgba(255,255,255,${a})`; c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.stroke();
    c.restore();
  });
}

// pilar de luz vertical (sobe do chao ate o ceu)
function fxPilar(x, yChao, o) {
  if (fxEsc().limpo) return;
  o = o || {}; const E = fxEsc(), L = (o.larg || 140) * E.t, cor = o.cor || '150,230,255', alto = (o.alto || 1400) * (E.t < 1 ? .6 : 1); o = Object.assign({}, o, {a: (o.a || .85) * E.a});
  fxAdd(FX.mundo, o.ms || 900, (c, k) => {
    const a = (o.a || .85) * (k < .15 ? k / .15 : 1 - (k - .15) / .85), w = L * (k < .15 ? .3 + k / .15 * .7 : 1 - (k - .15) * .6);
    const g = c.createLinearGradient(x - w, 0, x + w, 0);
    g.addColorStop(0, `rgba(${cor},0)`); g.addColorStop(.35, `rgba(${cor},${a * .6})`); g.addColorStop(.5, `rgba(255,255,255,${a})`);
    g.addColorStop(.65, `rgba(${cor},${a * .6})`); g.addColorStop(1, `rgba(${cor},0)`);
    c.fillStyle = g; c.fillRect(x - w, yChao - alto, w * 2, alto);
    const b = c.createRadialGradient(x, yChao, 0, x, yChao, w * 2.2);
    b.addColorStop(0, `rgba(255,255,255,${a * .8})`); b.addColorStop(1, `rgba(${cor},0)`);
    c.save(); c.translate(x, yChao); c.scale(1, .3); c.translate(-x, -yChao); c.fillStyle = b; c.fillRect(x - w * 2.2, yChao - w * 2.2, w * 4.4, w * 4.4); c.restore();
  });
}

// corte de luz: uma linha que risca de A ate B e some afinando
function fxCorte(x1, y1, x2, y2, o) {
  o = o || {}; const esp = (o.esp || 30) * fxEsc().t, cor = o.cor || '140,230,255', risca = o.risca || .25;
  fxAdd(FX.mundo, o.ms || 420, (c, k) => {
    const p = Math.min(1, k / risca), a = k < risca ? 1 : 1 - (k - risca) / (1 - risca), e = esp * (k < risca ? 1 : a);
    const xa = x1 + (x2 - x1) * Math.max(0, p - .9) , ya = y1 + (y2 - y1) * Math.max(0, p - .9), xb = x1 + (x2 - x1) * p, yb = y1 + (y2 - y1) * p;
    c.lineCap = 'round';
    c.strokeStyle = `rgba(${cor},${a * .45})`; c.lineWidth = e * 2.4; c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.stroke();
    c.strokeStyle = `rgba(${cor},${a * .9})`; c.lineWidth = e; c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.stroke();
    c.strokeStyle = `rgba(255,255,255,${a})`; c.lineWidth = e * .35; c.beginPath(); c.moveTo(xa, ya); c.lineTo(xb, yb); c.stroke();
  });
}

// estrela de brilho (cruz de luz) num ponto
function fxEstrela(x, y, o) {
  if (fxEsc().limpo) return;
  o = o || {}; const R = o.raio || 260, cor = o.cor || '170,240,255';
  fxAdd(FX.mundo, o.ms || 380, (c, k) => {
    const a = 1 - k, r = R * (.4 + fxEase(k) * .8);
    c.save(); c.translate(x, y); c.rotate(o.rot || 0);
    for (const [sx, sy] of [[1, .07], [.07, 1], [.55, .04], [.04, .55]]) {
      c.save(); if (sx === .55 || sx === .04) c.rotate(.785); c.scale(sx, sy);
      const g = c.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(.3, `rgba(${cor},${a * .7})`); g.addColorStop(1, `rgba(${cor},0)`);
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 6.283); c.fill(); c.restore();
    }
    c.restore();
  });
}

// particulas de luz (brilham e deixam rastro)
function fxFaiscas(x, y, n, o) {
  o = o || {}; const E = fxEsc(); n = Math.max(2, Math.round(n * E.q)); o = Object.assign({}, o, {tam: (o.tam || 1) * (E.t < 1 ? .75 : 1)});
  for (let i = 0; i < n; i++) {
    const a = o.ang != null ? o.ang + rnd(-(o.abre || .6), o.abre || .6) : rnd(0, 6.283), v = rnd(.3, 1) * (o.vel || 900);
    parts.push({type: 'luz', x: x + rnd(-10, 10), y: y + rnd(-10, 10), vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.sobe || 0), g: o.g ?? 500,
      life: rnd(.45, 1) * (o.vida || .9), age: 0, sz: rnd(4, 9) * (o.tam || 1), cor: Math.random() < .35 ? '255,255,255' : (o.cor || '140,225,255')});
  }
}
function fxDrawLuz(c, p) {
  const a = clamp(1 - p.age / p.life, 0, 1), s = p.sz * (.5 + a * .5);
  c.strokeStyle = `rgba(${p.cor},${a * .6})`; c.lineWidth = s; c.lineCap = 'round';
  c.beginPath(); c.moveTo(p.x - p.vx * .035, p.y - p.vy * .035); c.lineTo(p.x, p.y); c.stroke();
  c.fillStyle = `rgba(255,255,255,${a})`; c.fillRect(p.x - s * .4, p.y - s * .4, s * .8, s * .8);
}

// ----- tela -----
// clarao colorido
function fxFlash(cor, a, ms) { if (fxEsc().limpo) return; a *= fxEsc().a; fxAdd(FX.tela, ms || 260, (c, k) => { c.fillStyle = `rgba(${cor},${a * (1 - k)})`; c.fillRect(0, 0, W, H); }); }

// quadro de impacto de anime: a tela escurece e explode em linhas brancas saindo do ponto (em coordenadas de tela)
function fxImpacto(xm, ym, o) {
  if (fxEsc().limpo) return;
  o = o || {}; const E = fxEsc(); const [x, y] = w2s(xm, ym), n = Math.round((o.n || 34) * E.q), ang = Array.from({length: n}, () => [rnd(0, 6.283), rnd(.01, .035), rnd(.15, .45)]);
  fxAdd(FX.tela, o.ms || 170, (c, k) => {
    c.fillStyle = `rgba(4,6,20,${.75 * E.a * .4 * (1 - k)})`; c.fillRect(0, 0, W, H);
    c.fillStyle = `rgba(255,255,255,${(1 - k) * E.a * .6})`;
    for (const [a, w, ini] of ang) {
      const r0 = 900 * ini, r1 = 1300;
      c.beginPath(); c.moveTo(x + Math.cos(a - w) * r0, y + Math.sin(a - w) * r0); c.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
      c.lineTo(x + Math.cos(a + w) * r0, y + Math.sin(a + w) * r0); c.fill();
    }
    const g = c.createRadialGradient(x, y, 0, x, y, 140); g.addColorStop(0, `rgba(255,255,255,${1 - k})`); g.addColorStop(1, 'rgba(160,230,255,0)');
    c.fillStyle = g; c.fillRect(x - 140, y - 140, 280, 280);
  });
}

// linhas de velocidade convergindo para um ponto (carga, foco)
function fxLinhas(xm, ym, ms, o) {
  if (fxEsc().limpo) return;
  o = o || {}; const [x, y] = w2s(xm, ym);
  fxAdd(FX.tela, ms, (c, k) => {
    const a = (o.a || .5) * Math.sin(Math.PI * k);
    c.strokeStyle = `rgba(${o.cor || '220,245,255'},${a})`; c.lineWidth = 2;
    for (let i = 0; i < 40; i++) {
      const ang = Math.random() * 6.283, r0 = rnd(180, 320), r1 = r0 + rnd(120, 380);
      c.beginPath(); c.moveTo(x + Math.cos(ang) * r0, y + Math.sin(ang) * r0); c.lineTo(x + Math.cos(ang) * r1, y + Math.sin(ang) * r1); c.stroke();
    }
  });
}

// faixas pretas de cinema e vinheta colorida (para as Ressonancias)
function fxCinema(liga, cor) { const L = fxEsc().limpo; FX.barrasAlvo = liga ? (L ? 0 : 46) : 0; if (cor) FX.vinhetaCor = cor; tween(FX, 'vinheta', liga ? (L ? .15 : .55) : 0, 400); }

// zoom da camera num ponto e volta (soco de camera)
let CAM0 = null;   // posicao normal da camera (lida na primeira vez, o CAM nasce depois deste arquivo)
const cam0 = () => CAM0 || (CAM0 = {zoom: CAM.zoom, cx: CAM.cx, cy: CAM.cy});
async function fxZoom(z, xm, ym, ida, fica, volta) {
  z = camK(z); if (z === 1) return;
  const CAM0 = cam0(), cx = CAM0.cx + (xm - CAM0.cx) * .55, cy = CAM0.cy + (ym - CAM0.cy) * .55;
  tween(CAM, 'cx', cx, ida, easeOut); tween(CAM, 'cy', cy, ida, easeOut); await tween(CAM, 'zoom', CAM0.zoom * z, ida, easeOut);
  if (fica) await wait(fica);
  if (volta !== 0) fxZoomVolta(volta || 320);
}
function fxZoomVolta(ms) { const CAM0 = cam0(); tween(CAM, 'cx', CAM0.cx, ms, easeOut); tween(CAM, 'cy', CAM0.cy, ms, easeOut); return tween(CAM, 'zoom', CAM0.zoom, ms, easeOut); }

// pacote de golpe forte: tudo junto num ponto
function fxGolpe(x, y, forca, cor) {
  forca = forca || 1;
  fxBrilho(x, y, {raio: 220 * forca, cor, ms: 420});
  fxEstrela(x, y, {raio: 300 * forca, cor, ms: 360, rot: rnd(-.3, .3)});
  fxAnel(x, y, {raio: 340 * forca, cor, ms: 520});
  fxFaiscas(x, y, Math.round(16 * forca), {vel: 900 * forca, cor});
  shake = Math.max(shake, 10 * forca);
}

// ----- desenho (chamado pelo drawBattle) -----
function fxPassa(lista, dt) { for (let i = lista.length - 1; i >= 0; i--) { lista[i].t += dt; if (lista[i].t * 1000 > lista[i].ms) lista.splice(i, 1); } }
function fxDesenhaMundo(c, dt) {
  fxPassa(FX.mundo, dt);
  c.save(); c.globalCompositeOperation = 'lighter';
  for (const f of FX.mundo) f.fn(c, Math.min(1, f.t * 1000 / f.ms));
  for (const p of parts) if (p.type === 'luz') fxDrawLuz(c, p);
  c.restore();
}
function fxDesenhaTela(c, dt) {
  fxPassa(FX.tela, dt);
  if (FX.cinza > .01 && !fxEsc().limpo) {   // o tempo parou: a tela perde a cor (mistura 'saturation' com cinza)
    c.save(); c.globalCompositeOperation = 'saturation'; c.fillStyle = `rgba(128,128,128,${FX.cinza})`; c.fillRect(0, 0, W, H); c.restore();
  }
  for (const f of FX.tela) { c.save(); f.fn(c, Math.min(1, f.t * 1000 / f.ms)); c.restore(); }
}
// faixas de cinema e vinheta: desenhadas pelo drawBattle ANTES do HUD (o painel de HP e o titulo do golpe ficam por cima)
function fxBarras(c, dt) {
  if (FX.vinheta > .01) {
    const g = c.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .7);
    g.addColorStop(0, `rgba(${FX.vinhetaCor},0)`); g.addColorStop(1, `rgba(5,10,40,${FX.vinheta})`);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  FX.barras += (FX.barrasAlvo - FX.barras) * Math.min(1, dt * 8);
  if (FX.barras > .5) { c.fillStyle = '#000'; c.fillRect(0, 0, W, FX.barras); c.fillRect(0, H - FX.barras, W, FX.barras); }
}
