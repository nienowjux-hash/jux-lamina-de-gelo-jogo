/* ============ SIR BACON NO TIME (Cap. 3, Parte B, FICHA_CAP3_BRASARIA.md seção 6) ============
   Depois do portão de Brasária (JOGO.cap3.bacon) o Sir Bacon anda atrás do Jux no mapa, com um pequeno atraso (segue o rastro
   dos passos dele). De vez em quando FAREJA (linha 5 da folha), levanta a cabeça com um "!" e corre até um ACHADO: cava e
   deixa um "brilho de focinho" no chão (um item escondido que só ele acha; cada um uma vez só). Ele não luta.
   Folha: ref/brasaria/bacon_time.png (5 linhas x 4: frente, esquerda, direita, costas, farejar) -> bacon_time_folha.js
   (tools/brasaria_mapa.py). Usado por brasaria.js e cinzas.js: baconTimePasso(dt) no vidaPasso e baconTimeNpcs() no vidaNpcs.
   Os achados de cada mapa: baconTimeAchados(lista) [{id, x, y, da:{item, n, gil}}]; pegos ficam em JOGO.pegos ('fo_'+id). */
'use strict';
const BT_F = window.JUX_BACON_TIME || null, BT_I = new Image(); if (BT_F) BT_I.src = BT_F.atlas;
const BT = { x: 0, y: 0, olha: 'baixo', anda: false, animT: 0, est: 'segue', t: 0, rastro: [], posto: false, achado: null, farejaT: 0, terra: [] };
let BT_ACHADOS = [];
const btRnd = (a, b) => a + Math.random() * (b - a);
BT.farejaT = btRnd(14, 22);
function baconTimeAtivo() { return !!BT_F && typeof JOGO === 'object' && !!(JOGO.cap3 && JOGO.cap3.bacon); }
// os achados deste mapa (o brilho só aparece depois que ele cava; pegos ficam em JOGO.pegos)
function baconTimeAchados(lista) { BT_ACHADOS = lista.map(a => Object.assign({ cavado: false }, a)); }
const btPegou = a => (JOGO.pegos || []).includes('fo_' + a.id);
function btOinc(v) { try { if (typeof OINC !== 'undefined' && typeof som === 'function') som(OINC[(Math.random() * OINC.length) | 0], v); } catch (e) {} }
// atrás do Jux: o ponto do rastro que fica a ~30 px de caminho dele
function btAlvoRastro() {
  const R = BT.rastro; let d = 0, px = hero.x, py = hero.y;
  for (let i = R.length - 1; i >= 0; i--) { d += Math.hypot(R[i][0] - px, R[i][1] - py); px = R[i][0]; py = R[i][1]; if (d >= 30) return [px, py]; }
  return null;
}
function btOlha(dx, dy) { if (Math.abs(dx) < .01 && Math.abs(dy) < .01) return; BT.olha = Math.abs(dx) > Math.abs(dy) * .8 ? (dx > 0 ? 'direita' : 'esquerda') : (dy > 0 ? 'baixo' : 'cima'); }
function btAnda(tx, ty, vel, dt) {
  const dx = tx - BT.x, dy = ty - BT.y, d = Math.hypot(dx, dy);
  if (d < 1) { BT.anda = false; return true; }
  const st = Math.min(d, vel * dt); BT.x += dx / d * st; BT.y += dy / d * st; BT.anda = true; BT.animT += dt * (vel > 90 ? 11 : 7.5); btOlha(dx, dy);
  return d - st < 1;
}
function baconTimePasso(dt) {
  if (!baconTimeAtivo()) return;
  if (!BT.posto) { BT.posto = true; BT.x = hero.x - 18; BT.y = hero.y + 8; BT.rastro = []; }
  // o rastro dos pés do Jux (um ponto a cada 3 px andados)
  const R = BT.rastro, u = R[R.length - 1];
  if (u && Math.hypot(u[0] - hero.x, u[1] - hero.y) > 60) R.length = 0;   // o Jux pulou de lugar: o rastro recomeça
  if (!u || Math.hypot(u[0] - hero.x, u[1] - hero.y) >= 3) { R.push([hero.x, hero.y]); if (R.length > 80) R.shift(); }
  for (const p of BT.terra) { p.v += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 160 * dt; }
  BT.terra = BT.terra.filter(p => p.v < .6);
  BT.t += dt;
  const longe = Math.hypot(hero.x - BT.x, hero.y - BT.y);
  if (longe > 260 && BT.est !== 'segue') { BT.est = 'segue'; BT.achado = null; }
  if (longe > 340) { BT.x = hero.x - 18; BT.y = hero.y + 6; BT.rastro = [[hero.x, hero.y]]; BT.est = 'segue'; BT.achado = null; }   // ficou muito para trás (pulo de mapa): aparece atrás
  const parado = typeof fala !== 'undefined' && (fala || (typeof ab !== 'undefined' && ab.on));
  if (BT.est === 'segue') {
    const a = btAlvoRastro();
    if (a && Math.hypot(a[0] - BT.x, a[1] - BT.y) > 2) btAnda(a[0], a[1], Math.max(70, Math.min(180, longe * 2.2)), dt); else BT.anda = false;
    // de vez em quando fareja: só se tiver um achado escondido por perto (na tela) e o Jux não estiver conversando
    if (!parado) BT.farejaT -= dt;
    if (BT.farejaT <= 0) { BT.farejaT = btRnd(16, 26);
      const alvo = BT_ACHADOS.filter(q => !q.cavado && !btPegou(q) && Math.hypot(q.x - BT.x, q.y - BT.y) < 380).sort((p, q) => Math.hypot(p.x - BT.x, p.y - BT.y) - Math.hypot(q.x - BT.x, q.y - BT.y))[0];
      if (alvo) { BT.est = 'fareja'; BT.t = 0; BT.achado = alvo; BT.anda = false; btOinc(.5); }
      else if (Math.random() < .5) { BT.est = 'cheira'; BT.t = 0; BT.anda = false; } }   // só cheira o chão e volta
  } else if (BT.est === 'cheira') { BT.anda = false; if (BT.t > 1.6) { BT.est = 'segue'; BT.t = 0; } }
  else if (BT.est === 'fareja') { BT.anda = false; BT.olha = BT.achado && BT.achado.x < BT.x ? 'esquerda' : 'direita';
    if (BT.t > 2.6) { BT.est = 'corre'; BT.t = 0; btOinc(.8); } }
  else if (BT.est === 'corre') { const A = BT.achado; if (!A) { BT.est = 'segue'; return; }
    if (btAnda(A.x - 6, A.y + 2, 120, dt)) { BT.est = 'cava'; BT.t = 0; } }
  else if (BT.est === 'cava') { BT.anda = false; const A = BT.achado; BT.olha = 'direita';
    if (Math.random() < dt * 22) BT.terra.push({ x: BT.x + 8, y: BT.y - 3, vx: btRnd(10, 60), vy: btRnd(-80, -30), v: 0 });
    if (BT.t > 1.6) { if (A) { A.cavado = true; if (typeof aviso === 'function') aviso('O Sir Bacon cavou alguma coisa! (brilho de focinho)', '#ffb0c8');
        if (typeof V === 'object' && V.pontos && !V.pontos.some(p => p.id === 'fo_' + A.id)) V.pontos.push({ id: 'fo_' + A.id, x: A.x, y: A.y, r: 26 }); }
      BT.est = 'segue'; BT.t = 0; BT.achado = null; btOinc(.7); } }
}
// pegou o brilho de focinho (o mapa chama no regiaoFala: id 'fo_<id>')
function baconTimePega(id) {
  const A = BT_ACHADOS.find(a => 'fo_' + a.id === id); if (!A || btPegou(A)) return false;
  JOGO.pegos = JOGO.pegos || []; JOGO.pegos.push('fo_' + A.id);
  const i = V.pontos.findIndex(p => p.id === id); if (i >= 0) V.pontos.splice(i, 1);
  const L = []; if (A.da.gil) { JOGO.gil += A.da.gil; L.push(A.da.gil + ' gil'); }
  if (A.da.item) { daItem(A.da.item, A.da.n || 1); L.push(ITENS[A.da.item].nome + ((A.da.n || 1) > 1 ? ' x' + A.da.n : '')); }
  fala = { linhas: [['Sir Bacon', 'Oinc! Oinc!'], ['✦', 'O Sir Bacon achou: ' + L.join(' e ') + '!']], i: 0, letras: 0 };
  btOinc(.9); if (typeof som === 'function' && typeof SOM === 'object') som(SOM.ui_vez, .7); if (typeof salvaVila === 'function') salvaVila();
  return true;
}
// o brilho cor-de-rosa no chão onde ele cavou (só depois de cavar, até pegar)
function baconTimeBrilhos() {
  if (!baconTimeAtivo()) return;
  for (const A of BT_ACHADOS) { if (!A.cavado || btPegou(A)) continue; const k = .55 + .45 * Math.sin(t * 4 + A.x);
    ctx.save(); ctx.fillStyle = 'rgba(70,40,20,.45)'; ctx.beginPath(); ctx.ellipse(A.x, A.y, 7, 3, 0, 0, 6.283); ctx.fill();
    ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(A.x, A.y - 3, 0, A.x, A.y - 3, 9);
    g.addColorStop(0, `rgba(255,190,220,${.8 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(A.x - 10, A.y - 13, 20, 20);
    ctx.fillStyle = `rgba(255,240,250,${k})`; const r = 2 + 2 * k; ctx.fillRect(A.x - r, A.y - 3.4, r * 2, .8); ctx.fillRect(A.x - .4, A.y - 3 - r, .8, r * 2); ctx.restore(); }
}
const BT_LIN = { baixo: 0, esquerda: 1, direita: 2, cima: 3 };
function baconTimeQuadro() {
  if (BT.est === 'fareja') return BT.t < 1.9 ? 16 + (Math.floor(BT.t * 3) % 2) : 18;
  if (BT.est === 'cheira') return 16 + (Math.floor(BT.t * 3) % 2);
  if (BT.est === 'cava') return 19;
  const l = BT_LIN[BT.olha] || 0; return l * 4 + (BT.anda ? Math.floor(BT.animT) % 4 : 0);
}
function baconTimeDesenha() {
  if (!BT_F || !BT_I.complete || !BT_I.naturalWidth) return;
  const F = BT_F, q = baconTimeQuadro(), sx = (q % 4) * F.fw, sy = Math.floor(q / 4) * F.fh;
  const vira = (BT.est === 'fareja' || BT.est === 'cheira' || BT.est === 'cava') && BT.olha === 'esquerda';   // a linha 5 olha para a direita
  const pulo = BT.anda ? -Math.abs(Math.sin(BT.animT * Math.PI)) * 1.2 : 0;
  ctx.save(); ctx.fillStyle = 'rgba(10,5,10,.3)'; ctx.beginPath(); ctx.ellipse(BT.x, BT.y, 10, 3, 0, 0, 6.283); ctx.fill();
  ctx.translate(BT.x, BT.y + pulo); if (vira) ctx.scale(-1, 1);
  ctx.drawImage(BT_I, sx, sy, F.fw, F.fh, -F.fw / 2, -F.fh + 2, F.fw, F.fh); ctx.restore();
  for (const p of BT.terra) { ctx.fillStyle = `rgba(90,60,40,${1 - p.v / .6})`; ctx.fillRect(p.x, p.y, 2, 2); }
  // o que está na frente dele (poste, estátua...) por cima, como no Jux
  if (typeof FR !== 'undefined') { const bb = [BT.x - 12, BT.y - 30, BT.x + 12, BT.y];
    for (const f of FR) { if (BT.y >= f.base || bb[2] < f.x || bb[0] > f.x + f.w || bb[3] < f.y || bb[1] > f.y + f.h) continue; ctx.drawImage(f.i, f.x, f.y, f.w, f.h); } }
}
function baconTimeNpcs() { return baconTimeAtivo() && BT.posto ? [[BT.y, baconTimeDesenha]] : []; }
