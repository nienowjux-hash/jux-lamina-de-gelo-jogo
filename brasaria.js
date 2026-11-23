/* ============ BRASÁRIA, a cidade dos ferreiros (Cap. 3, Parte B — FICHA_CAP3_BRASARIA.md, aprovada 2026-11-22) ============
   Mapa: tools/brasaria_mapa.py -> brasaria_dados.js (chão, frentes, pontos) e brasaria_folhas.js (os 5 moradores e os retratos);
   tools/brasaria_vivo.py -> brasaria_vivo.js (lava dos canais, fogo, fumaça, a rede do telhado). O cenário é IMAGEM (o mapa limpo,
   sem fumaça e sem fogo); este arquivo só anima por cima e cuida da história da cidade. Carrega ANTES do vila_motor.js.
   Ganchos no vila_motor.js (os mesmos do cinzas.js): regiaoInit(), regiaoChega(), regiaoFala(id), vidaPasso(dt),
   vidaDesenha('chao'|'ar'), vidaNpcs() e c.extra(t) nas cenas da cutscene.
   - CIDADE VIVA: a lava escorre nos canais (a textura desliza no sentido do canal), fumaça em todas as chaminés (a da botica
     colorida), fogo nos fornos e nos braseiros, faíscas nas bigornas, lampiões e janelas piscando, martelos batendo ao longe,
     a REDE do telhado balançando com um "z z z" (o Felipe dorme ali; ninguém o vê) — só o que está na tela
   - os 5 MORADORES (folha 3x4: trabalho em loop, o jeito dele de vez em quando, atendendo quando o time chega) com 3 conversas
     cada; Úrsula (Ferraria) e Dona Sálvia (Botica) vendem; o Gorm (taverna) descansa e salva; o MERCADO é o balcão
   - o MURAL DE AVISOS (as 3 missões secundárias, missoes.js), o Sir Bacon no time (bacon_time.js) e os achados dele
   - a cutscene "O porco abriu o portão" na chegada; Casa do Conselho fechada e portão norte trancado ("ordem do rei")
   Estado: JOGO.cap3.bras = {chegou, mural, conv:{ursula:n,...}, conselho, gato}; JOGO.cap3.bacon (o porco no time);
   JOGO.cap3.fase = 'brasaria' (a Parte C começa daqui) */
'use strict';
const BR_F = window.JUX_BRASARIA || {}, BR_V = window.JUX_BRASARIA_VIVO || {};
const brC3 = () => { JOGO.cap3 = JOGO.cap3 || {}; return JOGO.cap3; };
const brB = () => { const C = brC3(); C.bras = C.bras || {}; return C.bras; };
const brRnd = (a, b) => a + Math.random() * (b - a);
const brImg = src => { const i = new Image(); if (src) i.src = src; return i; };
const BR_I = {};
for (const k of ['fogo', 'forja', 'fumaca', 'fumaca_roxa', 'fumaca_verde']) if (BR_V[k]) BR_I[k] = brImg(BR_V[k].atlas);
const brPronta = k => !!(BR_I[k] && BR_I[k].complete && BR_I[k].naturalWidth);
// máscara em PNG cinza (branco = dentro) -> canvas com alfa
function brMascara(src, w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; c.pronta = false; const i = new Image();
  i.onload = () => { const g = c.getContext('2d'); g.drawImage(i, 0, 0, w, h); const id = g.getImageData(0, 0, w, h), d = id.data;
    for (let k = 0; k < d.length; k += 4) { d[k + 3] = d[k]; d[k] = d[k + 1] = d[k + 2] = 255; } g.putImageData(id, 0, 0); c.pronta = true; };
  i.src = src; return c;
}
const BR_LAVA = (BR_V.lava || []).map(p => Object.assign({}, p, { tex: brImg(p.tex), mc: brMascara(p.m, p.w, p.h) }));
const BR_REDE = BR_V.rede ? Object.assign({}, BR_V.rede, { im: brImg(BR_V.rede.img) }) : null;
const brPerto = (x, y, r) => Math.hypot(hero.x - x, hero.y - y) < r;
const brNaTela = (x, y, m) => x > VIS.x0 - m && x < VIS.x1 + m && y > VIS.y0 - m && y < VIS.y1 + m;
const brVol = (x, y, alc) => Math.max(0, 1 - Math.hypot(hero.x - x, hero.y - y) / alc);

// ---------- lugares (coordenadas do mapa 1448x1086) ----------
// fogo vivo: fornos das oficinas e da ferraria (folha da forja) e os 2 braseiros da praça (folha da fogueira): base x, y, largura
const BR_FORNOS = [{ k: 'forja', x: 175, y: 424, l: 46, f: 0 }, { k: 'forja', x: 353, y: 345, l: 40, f: 3 }, { k: 'forja', x: 458, y: 302, l: 22, f: 5 }];
const BR_BRASEIROS = [{ k: 'fogo', x: 543, y: 541, l: 30, f: 2, base: 590 }, { k: 'fogo', x: 958, y: 541, l: 30, f: 6, base: 590 }];
// chaminés: x, y da boca, altura da fumaça, cor ('' cinza; 'cor' = a da botica, roxa e verde)
const BR_CHAMINES = [[35, 202, 46, ''], [133, 198, 46, ''], [130, 82, 44, ''], [335, 48, 40, ''], [440, 74, 44, ''], [1115, 104, 48, ''],
  [1302, 480, 40, ''], [1360, 532, 46, ''], [122, 609, 78, 'cor']];
// luzes que piscam: lampiões (rápido) e janelas (devagar): x, y, raio, cor, rapidez
const BR_LUZES = [[580, 222, 30, 'rgba(255,190,90,.34)', 1], [958, 222, 30, 'rgba(255,190,90,.34)', 1], [288, 380, 30, 'rgba(255,190,90,.32)', 1],
  [508, 684, 30, 'rgba(255,190,90,.32)', 1], [572, 704, 26, 'rgba(255,190,90,.30)', 1], [1032, 652, 30, 'rgba(255,190,90,.32)', 1],
  [952, 706, 26, 'rgba(255,190,90,.30)', 1], [1092, 312, 28, 'rgba(255,190,90,.32)', 1], [1257, 266, 26, 'rgba(255,190,90,.30)', 1],
  [536, 802, 34, 'rgba(255,170,70,.34)', 1], [766, 802, 34, 'rgba(255,170,70,.34)', 1], [218, 548, 24, 'rgba(255,190,90,.30)', 1],
  [175, 410, 60, 'rgba(255,120,40,.30)', 2], [353, 332, 50, 'rgba(255,120,40,.28)', 2], [458, 292, 32, 'rgba(255,120,40,.26)', 2],
  [543, 528, 40, 'rgba(255,140,50,.34)', 2], [958, 528, 40, 'rgba(255,140,50,.34)', 2],
  [770, 175, 34, 'rgba(255,200,110,.22)', 0], [575, 118, 18, 'rgba(255,200,110,.2)', 0], [940, 182, 18, 'rgba(255,200,110,.2)', 0],
  [1000, 178, 16, 'rgba(255,200,110,.2)', 0], [866, 852, 22, 'rgba(255,200,110,.24)', 0], [232, 632, 16, 'rgba(255,200,110,.2)', 0],
  [62, 720, 18, 'rgba(255,200,110,.2)', 0], [1205, 630, 18, 'rgba(255,200,110,.2)', 0], [1262, 630, 18, 'rgba(255,200,110,.2)', 0],
  [1410, 640, 18, 'rgba(255,200,110,.2)', 0], [1290, 742, 18, 'rgba(255,200,110,.2)', 0], [1412, 724, 18, 'rgba(255,200,110,.2)', 0],
  [1170, 735, 16, 'rgba(255,200,110,.2)', 0], [1280, 284, 14, 'rgba(255,200,110,.2)', 0], [1410, 322, 14, 'rgba(255,200,110,.2)', 0]];
// bigornas das oficinas (faíscas de vez em quando) e onde se ouve martelo
const BR_BIGORNAS = [[346, 378], [436, 334], [244, 440], [503, 312]];
const BR_GATO = { x: 447, y: 226, px: 472, py: 330 };   // o "!" do gato no telhado da forja; o ponto de subir fica na rua
const BR_TAVERNA = { x: 1180, y: 770 };
// os achados do Sir Bacon (bacon_time.js): só ele acha, uma vez cada
const BR_ACHADOS = [{ id: 'br_botica', x: 300, y: 852, da: { item: 'pao_forno', n: 2 } }, { id: 'br_mercado', x: 1245, y: 482, da: { gil: 150, item: 'eter', n: 1 } },
  { id: 'br_escada', x: 690, y: 262, da: { item: 'fenix', n: 1 } }, { id: 'br_mesas', x: 1060, y: 808, da: { item: 'espeto_brasa', n: 2 } }];

// ---------- os moradores ----------
// loop: quadros da linha 1 (trabalho); jeito: linha 2 (de vez em quando); parado/fala/loja: linha 3 (atendendo).
// atEsq: a linha 3 olha para a ESQUERDA (vira para o lado do Jux espelhando). Úrsula: o quadro 11 saiu de costas (não usar o 10 do atlas)
const BR_CFG = {
  ursula: { nome: 'Úrsula', fps: 4.2, loop: [0, 1, 2, 3], jeito: [4, 5, 6, 7], parado: 8, fala: [9, 9, 11, 9], loja: 11, atEsq: false, cor: '#ff9a6a' },
  salvia: { nome: 'Dona Sálvia', fps: 2.2, loop: [0, 1, 0, 1, 2, 3], jeito: [4, 5, 6, 7], parado: 10, fala: [10, 10, 9, 10], loja: 11, atEsq: true, cor: '#c8e89a' },
  gorm: { nome: 'Gorm', fps: 1.8, loop: [0, 1, 2, 3], jeito: [4, 5, 6, 7], parado: 10, fala: [10, 10, 9, 10], loja: 11, atEsq: true, cor: '#ffd08a' },
  pipo: { nome: 'Pipo', fps: 2.6, loop: [0, 1, 2, 1, 0, 3], jeito: [4, 5, 6, 7], parado: 10, fala: [10, 10, 9, 10], loja: 11, atEsq: true, cor: '#ffe27a' },
  bigode: { nome: 'Capitão Bigode', fps: 1.1, loop: [0, 1, 0, 2, 0, 3], jeito: [4, 5, 6, 7], parado: 10, fala: [10, 10, 9, 10], loja: 11, atEsq: true, cor: '#ff9a7a' },
};
const BR_NPC = {};
for (const k in BR_CFG) { const F = (BR_F.moradores || {})[k]; if (!F) continue;
  BR_NPC[k] = Object.assign({ k, F, img: brImg(F.atlas), est: 'trab', t: 0, prox: brRnd(6, 14), jq: 4, ultQ: -1 }, BR_CFG[k]); }
const brFalando = n => !!(fala && fala.linhas && fala.linhas[fala.i] && fala.linhas[fala.i][0] === n.nome);
function brNpcPasso(n, dt) {
  n.t += dt; const perto = brPerto(n.F.x, n.F.y, 90);
  const atende = brFalando(n) || (UI.escolha && UI.escolha.id === n.k) || (UI.loja && UI.loja.id === n.k) || (n.k === 'gorm' && UI.escolha && UI.escolha.id === 'taverna');
  if (atende) { if (n.est !== 'atende') { n.est = 'atende'; n.t = 0; } return; }
  if (perto && n.est !== 'acena') { n.est = 'acena'; n.t = 0; return; }
  if (!perto && (n.est === 'acena' || n.est === 'atende')) { n.est = 'trab'; n.t = 0; return; }
  if (n.est === 'trab') { n.prox -= dt; if (n.prox <= 0) { n.est = 'jeito'; n.t = 0;
      // o Pipo olha para cima procurando o gato (quadro 8) enquanto o Brasinha estiver no telhado
      n.jq = (n.k === 'pipo' && estadoMissao('gato_pipo') === 'ativa' && !brB().gato && Math.random() < .6) ? 7 : n.jeito[(Math.random() * n.jeito.length) | 0]; } }
  else if (n.est === 'jeito' && n.t > 2.4) { n.est = 'trab'; n.t = 0; n.prox = brRnd(8, 15); }
}
function brNpcQuadro(n) {
  if (n.est === 'atende') { if (UI.loja && UI.loja.id === n.k) return n.loja; if (n.k === 'gorm' && UI.escolha) return n.loja; return n.fala[Math.floor(n.t * 1.1) % n.fala.length]; }
  if (n.est === 'acena') return n.t < .5 ? 8 : n.t < 1.7 ? 9 : n.parado;
  if (n.est === 'jeito') return n.jq;
  return n.loop[Math.floor(t * n.fps + n.F.x * .01) % n.loop.length];
}
function brNpcDesenha(n) {
  const F = n.F; if (!n.img.complete || !n.img.naturalWidth) return;
  const q = brNpcQuadro(n), X = F.x, Y = F.y, linha3 = q >= 8;
  // trabalho: a folha olha para a direita (vira = trabalho para a esquerda). Atendendo: vira para o lado do Jux
  const espelha = linha3 ? (n.atEsq ? hero.x > X : hero.x < X) : F.vira;
  // Úrsula: a martelada (quadro 3 do loop) solta faíscas na bigorna e faz barulho
  if (n.k === 'ursula' && q === 2 && n.ultQ !== 2) { brFaiscas(X + (F.vira ? -20 : 20), Y - 8, 10); const v = brVol(X, Y, 420); if (v > 0 && typeof BIGORNA !== 'undefined') som(BIGORNA[(Math.random() * BIGORNA.length) | 0], .45 * v); }
  n.ultQ = q;
  const pe = F.pe ? F.pe[q] : F.fh - 2;
  npcAtrasDasFrentes([X - F.fw / 2 - 2, Y - pe - 2, X + F.fw / 2 + 2, Y + 6], Y, g => {
    g.save(); g.fillStyle = 'rgba(10,5,10,.35)'; g.beginPath(); g.ellipse(X, Y - 1, 13, 4, 0, 0, 6.283); g.fill();
    g.translate(X, Y); if (espelha) g.scale(-1, 1);
    g.drawImage(n.img, (q % 4) * F.fw, Math.floor(q / 4) * F.fh, F.fw, F.fh, -F.fw / 2, -pe + 1, F.fw, F.fh); g.restore();
  });
  if (brPerto(X, Y, 110) && !fala) { ctx.save(); ctx.font = 'bold 11px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.85)';
    const nm = n.nome + (LOJAS[n.k] ? ' (loja)' : n.k === 'gorm' ? ' (taverna)' : ''); ctx.strokeText(nm, X, Y - F.fh - 6); ctx.fillStyle = n.cor; ctx.fillText(nm, X, Y - F.fh - 6); ctx.restore(); }
}

// ---------- partículas ----------
const brFaisca = [], brZs = [];
let brFaiscaT = brRnd(2, 4), brMartT = brRnd(1, 3), brZT = 0;
function brFaiscas(x, y, n) { if (!brNaTela(x, y, 40)) return; for (let k = 0; k < n; k++) brFaisca.push({ x, y, vx: brRnd(-70, 70), vy: brRnd(-110, -30), v: 0, d: brRnd(.35, .8), s: brRnd(.8, 1.8) }); }

function vidaPasso(dt) {
  if (REGIAO !== 'brasaria') return;
  for (const k in BR_NPC) brNpcPasso(BR_NPC[k], dt);
  // faíscas nas bigornas das oficinas, de tempos em tempos (só as que estão na tela)
  brFaiscaT -= dt;
  if (brFaiscaT <= 0) { brFaiscaT = brRnd(1.6, 4); const b = BR_BIGORNAS.filter(([x, y]) => brNaTela(x, y, 20)); if (b.length) { const [x, y] = b[(Math.random() * b.length) | 0]; brFaiscas(x, y, (10 + Math.random() * 8) | 0); } }
  for (const p of brFaisca) { p.v += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; }
  for (let i = brFaisca.length - 1; i >= 0; i--) if (brFaisca[i].v > brFaisca[i].d) brFaisca.splice(i, 1);
  // martelos batendo ao longe (a cidade inteira trabalha)
  brMartT -= dt;
  if (brMartT <= 0) { brMartT = brRnd(1.2, 3.4); const [x, y] = BR_BIGORNAS[(Math.random() * BR_BIGORNAS.length) | 0], v = brVol(x, y, 700);
    if (v > .05 && typeof BIGORNA !== 'undefined' && !ab.on) som(BIGORNA[(Math.random() * BIGORNA.length) | 0], .22 * v); }
  // o "z z z" do telhado (sobe da rede)
  brZT -= dt; if (brZT <= 0) { brZT = brRnd(1, 1.6); brZs.push({ x: 322 + brRnd(-4, 4), y: 118, v: 0 }); }
  for (const z of brZs) { z.v += dt; z.y -= 9 * dt; z.x += Math.sin(z.v * 2.4) * 6 * dt + 3 * dt; }
  while (brZs.length && brZs[0].v > 3.2) brZs.shift();
  // na taverna (perto do Gorm) a música abaixa
  if (MUS && !ab.on) { const d = Math.hypot(hero.x - BR_TAVERNA.x, hero.y - BR_TAVERNA.y), k = d < 90 ? .45 : d < 220 ? .45 + .55 * (d - 90) / 130 : 1, alvo = .42 * k;
    const v = MUS.volume; if (Math.abs(v - alvo) > .005) MUS.volume = v + (alvo - v) * Math.min(1, dt * 2); }
  if (typeof baconTimePasso === 'function') baconTimePasso(dt);
  brHistoriaPasso(dt);
}

// a lava dos canais: a textura desliza no sentido do canal, em duas fases que se cruzam (não aparece emenda), e o brilho pulsa
function brLava(p) {
  if (!p.mc.pronta || !p.tex.complete || !p.tex.naturalWidth || p.x > VIS.x1 || p.x + p.w < VIS.x0 || p.y > VIS.y1 || p.y + p.h < VIS.y0) return;
  if (!p.tmp) { p.tmp = document.createElement('canvas'); p.tmp.width = p.w; p.tmp.height = p.h; }
  const g = p.tmp.getContext('2d'), L = 12, ph = (t * .42 + p.f) % 1, ph2 = (ph + .5) % 1, wB = 1 - Math.abs(1 - 2 * ph2), dx = p.dir[0], dy = p.dir[1];
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; g.clearRect(0, 0, p.w, p.h);
  g.drawImage(p.tex, dx * (ph * L - L / 2), dy * (ph * L - L / 2));
  g.globalAlpha = wB; g.drawImage(p.tex, dx * (ph2 * L - L / 2), dy * (ph2 * L - L / 2));
  g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in'; g.drawImage(p.mc, 0, 0);
  ctx.drawImage(p.tmp, p.x, p.y);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .1 + .08 * Math.sin(t * 1.7 + p.f * 3); ctx.drawImage(p.tmp, p.x, p.y); ctx.restore();
}
function brFogo(o) {
  const D = BR_V[o.k]; if (!D || !brPronta(o.k) || !brNaTela(o.x, o.y - 20, 60)) return; const s = o.l / D.larg, q = Math.floor(t * (o.k === 'fogo' ? 11 : 10) + o.f) % 8;
  ctx.drawImage(BR_I[o.k], q * D.w, 0, D.w, D.h, o.x - D.base[0] * s, o.y - D.base[1] * s, D.w * s, D.h * s);
}
function brFumaca(k, x, y, h, i, al) {
  const FM = BR_V[k]; if (!FM || !brPronta(k)) return; const s = h / FM.alt, q = Math.floor(t * 5 + i * 2.7) % 8;
  ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); ctx.transform(1, 0, -.22, 1, 0, 0);
  ctx.drawImage(BR_I[k], q * FM.w, 0, FM.w, FM.h, -FM.saida[0] * s, -FM.saida[1] * s, FM.w * s, FM.h * s); ctx.restore();
}
function brMarcaExc(x, y, cor) {   // o "!" pulando (mural com pedidos novos, o gato no telhado)
  if (!brNaTela(x, y, -10)) return;
  const b = Math.sin(t * 4) * 3; ctx.save(); ctx.fillStyle = cor; ctx.strokeStyle = '#3a2a00'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(x, y - 6 + b, 7, 9, 0, 0, 6.283); ctx.fill(); ctx.stroke();
  ctx.font = 'bold 12px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.fillStyle = '#2a1a00'; ctx.fillText('!', x, y - 2 + b); ctx.restore();
}
function vidaDesenha(camada) {
  if (REGIAO !== 'brasaria') return;
  if (camada === 'chao') {
    for (const p of BR_LAVA) brLava(p);
    for (const o of BR_FORNOS) brFogo(o);
    // a rede do telhado balançando (os fios redesenhados linha a linha, mais soltos embaixo)
    if (BR_REDE && BR_REDE.im.complete && BR_REDE.im.naturalWidth && brNaTela(BR_REDE.x + BR_REDE.w / 2, BR_REDE.y, 80)) { const R = BR_REDE, ang = Math.sin(t * 1.25) * 2.6;
      for (let y = 0; y < R.h; y += 2) { const k = Math.max(0, (y - 8) / (R.h - 8)), off = ang * k; ctx.drawImage(R.im, 0, y, R.w, 2, R.x + off, R.y + y + Math.abs(off) * .15, R.w, 2); } }
    // luz que pisca em volta do fogo, dos lampiões e das janelas
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const [x, y, r, cor, rap] of BR_LUZES) { if (!brNaTela(x, y, r)) continue;
      const rr = r + (rap === 2 ? Math.sin(t * 7 + x) * 3 + Math.sin(t * 19 + y) * 1.5 : rap === 1 ? Math.sin(t * 3 + x) * 1.5 + (Math.sin(t * 23 + y) > .93 ? -3 : 0) : Math.sin(t * .9 + x) * 1);
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, cor); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    ctx.restore();
    if (typeof baconTimeBrilhos === 'function') baconTimeBrilhos();
    return;
  }
  // 'ar': fumaça das chaminés, faíscas, o "z z z", o "!" do mural e do gato
  BR_CHAMINES.forEach(([x, y, h, cor], i) => { if (y + 10 < VIS.y0 || x < VIS.x0 - 60 || x > VIS.x1 + 60 || y - h * 2 > VIS.y1) return;
    if (cor) { const k = .5 + .5 * Math.sin(t * .5); brFumaca('fumaca_roxa', x, y, h, i, .35 + .65 * k); brFumaca('fumaca_verde', x, y, h * .9, i + 4, .35 + .65 * (1 - k)); }
    else brFumaca('fumaca', x, y, h, i, .8); });
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const p of brFaisca) { const a = 1 - p.v / p.d; ctx.fillStyle = `rgba(255,${(170 + 60 * a) | 0},80,${a})`; ctx.fillRect(p.x, p.y, p.s, p.s); }
  ctx.restore();
  if (brZs.length && brNaTela(322, 100, 60)) { ctx.save(); ctx.textAlign = 'center'; ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(20,10,30,.7)';
    for (const z of brZs) { const a = Math.min(1, z.v * 2, (3.2 - z.v) * 1.2); ctx.globalAlpha = a; ctx.font = 'bold ' + Math.round(8 + z.v * 2.4) + 'px "Trebuchet MS"';
      ctx.strokeText('z', z.x, z.y); ctx.fillStyle = '#e8eeff'; ctx.fillText('z', z.x, z.y); } ctx.restore(); }
  if (!fala && muralTemNovo()) brMarcaExc(960, 408, '#ffd84a');
  if (estadoMissao('gato_pipo') === 'ativa' && !brB().gato) brMarcaExc(BR_GATO.x, BR_GATO.y, '#ffd84a');
}
// na ordem do Jux: os moradores, os braseiros e o Sir Bacon
function vidaNpcs() {
  if (REGIAO !== 'brasaria') return [];
  const L = [];
  for (const k in BR_NPC) { const n = BR_NPC[k]; if (brNaTela(n.F.x, n.F.y - 30, 60)) L.push([n.F.y, () => brNpcDesenha(n)]); }
  for (const o of BR_BRASEIROS) if (brNaTela(o.x, o.y - 20, 60)) L.push([o.base, () => brFogo(o)]);
  if (typeof baconTimeNpcs === 'function') L.push(...baconTimeNpcs());
  return L;
}

// ---------- falas ----------
const BR_FALAS = {
  br_chega: [['Jux', 'Brasária. Forjas, lava e um rei que ninguém viu.'], ['Bino', '…Quente.'], ['Sir Bacon', 'Oinc!'],
    ['✦', 'O Sir Bacon agora anda com o time. Siga a ★ até o mural de avisos da praça.']],
  br_mural1: [['✦', 'O mural de avisos da praça. Pedidos dos moradores, pregados com pregos tortos.'],
    ['✦', 'No meio deles, um papel com um selo roxo de eclipse: "POR ORDEM DO REI: AS FORJAS NÃO PARAM. TODA ARMA VAI PARA O CONSELHO."'],
    ['Jux', 'O mesmo sol negro da Ordem… num decreto do rei.'], ['Bino', '…Rei estranho.'],
    ['✦', 'Os pedidos do mural são missões. Escolha uma para começar (ela aparece no menu → Missões).']],
  br_conselho1: [['Guarda', 'Alto! A Casa do Conselho está fechada.'], ['Jux', 'E se a gente quiser falar com o rei?'], ['Guarda', 'Só com ordem do rei.'],
    ['Jux', 'E a ordem do rei, quem dá?'], ['Guarda', '…O rei.']],
  br_conselho: [['Guarda', 'Só com ordem do rei.']],
  br_portao_norte: [['✦', 'O portão norte está trancado com correntes grossas e um cadeado do tamanho de um porco.'],
    ['Guarda', 'A estrada do vulcão está fechada por ordem do rei.']],
  br_mercado: [['✦', 'Um quadro no balcão diz: "Pão de forno quentinho. Espeto na brasa. Repelente para a trilha. Paga primeiro, come depois."'], ['Bino', '…Fome.']],
  br_taverna: [['Gorm', 'Cama quente, sopa quente e um travesseiro que não ronca. HO HO!'], ['✦', 'Vocês descansam no Martelo Quente.']],
  br_gato: [['✦', 'Lá em cima, na chaminé da forja, dois olhos amarelos piscam: "Miau?"'], ['Jux', 'Bino, uma escadinha.'], ['Bino', '…Sobe.'],
    ['✦', 'O Jux sobe pelos caixotes, pelo ombro do Bino e pelo telhado. O Brasinha pula no colo dele.'],
    ['Jux', 'Resgate felino: concluído. Agora é devolver ao Pipo.']],
  br_gato_nada: [['✦', 'Caixotes empilhados até o telhado da forja. Dá para subir, mas não tem nada lá em cima.']],
};
// as 3 conversas de cada morador, em ordem (ficha, seção 3), e o que dizem depois. Todos falam do "rei" que ninguém viu
const BR_CONVERSAS = {
  ursula: [
    [['Úrsula', 'HA! Gente nova! E um porco! O porco eu já conheço: derrubou três guardas hoje.'], ['Jux', 'Ele é nosso. Mais ou menos.'],
      ['Úrsula', 'Então vocês são piores que ele. Gostei!'], ['Úrsula', 'Úrsula Martelo-Rubro. Se é de ferro, eu faço. Se é caro, eu cobro.']],
    [['Úrsula', 'Sabe o que eu forjo dia e noite? Espadas. Escudos. Elmos. Mil por semana.'], ['Jux', 'Para quem?'],
      ['Úrsula', 'Para o rei! As cartas chegam com o selo de eclipse e a gente obedece.'], ['Úrsula', 'Nunca vi o rei. Ninguém viu. Mas o pagamento chega. …Às vezes.']],
    [['Úrsula', 'Vou te contar uma coisa, óculos. Às vezes eu acordo e a minha forja já está acesa.'], ['Úrsula', 'Sozinha. Com as brasas bem sopradas, perfeitinhas.'],
      ['Bino', '…Vento.'], ['Úrsula', 'HA! Vento que sopra forja? Se for, eu contrato!']]],
  salvia: [
    [['Dona Sálvia', '*snif snif* Hum. Você cheira a neve, rapaz. E a encrenca.'], ['Jux', 'Encrenca é o meu perfume.'],
      ['Dona Sálvia', 'Hihi. E o grandão cheira a… pedra molhada. Bom sinal.'], ['Bino', '…Obrigado?']],
    [['Dona Sálvia', 'As cartas do rei chegam toda lua nova. Cheiram a cera roxa e a medo.'], ['Jux', 'A senhora cheirou uma carta do rei?'],
      ['Dona Sálvia', 'Meu bem, eu cheiro TUDO. Até o que não devia.'], ['Dona Sálvia', 'E aquele selo de eclipse… eu já vi em outro lugar. Num pesadelo, acho.']],
    [['Dona Sálvia', 'Cuidado lá em cima, no Conselho. Ninguém entra, ninguém sai.'], ['Dona Sálvia', 'Só as cartas saem. E as carroças de armas, de noite.'],
      ['Jux', 'Carroças puxadas por armaduras vazias?'], ['Dona Sálvia', '…Você também viu. Ai, ai. Vou fazer um chá. Para mim.']]],
  gorm: [
    [['Gorm', 'Bem-vindos ao Martelo Quente! Cerveja quente, cama quente e fofoca fresquinha.'], ['Jux', 'A fofoca é de graça?'], ['Gorm', 'A primeira sempre é. HO HO!'],
      ['✦', 'Fale com o Gorm e escolha "Descansar e salvar" para recuperar HP e MP.']],
    [['Gorm', 'Psst. Quer saber da última? Tem um mago do vento que dorme num telhado aqui da cidade.'], ['Gorm', 'De noite ele sopra as forjas. Fuuuu. E elas acendem sozinhas!'],
      ['Jux', 'E ninguém sobe lá para falar com ele?'], ['Gorm', 'Subir? Ele RONCA, rapaz. Dá medo.']],
    [['Gorm', 'E o rei, hein? Ninguém nunca viu. Nem eu, que vejo tudo daqui!'], ['Gorm', 'Só sei que as cartas do Conselho têm um selo de sol preto com um olho no meio.'],
      ['Jux', 'Um sol negro com um olho…'], ['Bino', '…A Ordem.'], ['Gorm', 'Ordem? Ah, vocês querem pedir? Cerveja quente para todo mundo!']]],
  pipo: [
    [['Pipo', 'Moço! Moço de óculos! Isso é uma espada de GELO? Como ela não derrete? Ela é fria? Ela morde?'], ['Jux', 'Uma pergunta de cada vez, recruta.'],
      ['Pipo', 'Tá! Então… ela morde?'], ['Jux', 'Só quem merece.']],
    [['Pipo', 'Eu sou aprendiz da Úrsula! Já fiz um prego. Ficou torto. Mas é MEU prego.'], ['Pipo', 'A Úrsula diz que um dia eu vou fazer espada para o rei.'],
      ['Pipo', '…Moço, o rei existe? Ninguém nunca viu ele.'], ['Jux', 'Boa pergunta. Anota aí no caderninho.']],
    [['Pipo', 'Sabia que tem um moço dormindo num telhado? Eu vi a rede balançando!'], ['Pipo', 'E um porco correndo dos guardas! Era o seu porco? Ele é muito rápido! Ele morde?'],
      ['Jux', 'Ele não morde. Ele rouba pão.'], ['Pipo', 'Que nem eu! …Esquece que eu falei isso.']]],
  bigode: [
    [['Capitão Bigode', 'ALTO! Quem são vocês? Como entraram? Quem deixou?!'], ['Jux', 'O porco abriu a portinha.'], ['Capitão Bigode', '…O PORCO. Claro. Sempre o porco.'],
      ['Capitão Bigode', 'Capitão Bigode, guarda do portão sul! Comportem-se. E segurem esse porco!']],
    [['Capitão Bigode', 'Ordem do rei: ninguém sobe para o vulcão, ninguém entra no Conselho e ninguém pergunta nada.'], ['Jux', 'E quem já viu o rei?'],
      ['Capitão Bigode', 'Eu… eu recebo as cartas! Lacradas! Com selo roxo! Isso é quase ver!'], ['Bino', '…Não é.']],
    [['Capitão Bigode', 'Sabe o que me tira o sono? As carroças da noite.'], ['Capitão Bigode', 'Saem pelo portão norte sem cocheiro nenhum. E eu tenho que abrir, por ordem do rei.'],
      ['Capitão Bigode', 'Eu fecho os olhos e conto até cem. Ordem é ordem.'], ['Jux', 'Um guarda que fecha os olhos. Isso explica o porco.']]],
};
const BR_DEPOIS = {
  ursula: [['Úrsula', 'Volta quando tiver gil. Ferro bom não espera! HA!']],
  salvia: [['Dona Sálvia', 'Leva um Unguento Frio, que lá fora queima. *snif* Você ainda cheira a encrenca.']],
  gorm: [['Gorm', 'Cansados? É só pedir: cama quente e o jogo salvo. HO HO!']],
  pipo: [['Pipo', 'Mais uma pergunta! …Esqueci qual era. Volta depois!']],
  bigode: [['Capitão Bigode', 'Circulando, circulando! E fiquem LONGE do portão norte.']],
};
function brFala(linhas, fim) { fala = { linhas, i: 0, letras: 0, fim }; hero.alvo = null; hero.pontoAlvo = null; som(SOM.ui_vez, .5); }
function brConversa(k) {
  const B = brB(); B.conv = B.conv || {}; const n = B.conv[k] || 0, C = BR_CONVERSAS[k];
  if (n < C.length) { B.conv[k] = n + 1; brFala(C[n], () => salvaJogo()); } else brFala(BR_DEPOIS[k]);
}
// ---------- o MURAL DE AVISOS (as 3 missões secundárias do missoes.js) ----------
const BR_MURAL = ['gato_pipo', 'carvao_tiberio', 'escamas_salvia'];
const muralTemNovo = () => !brB().mural || BR_MURAL.some(k => !estadoMissao(k));
function brMural() {
  const lista = () => { UI.escolha = { id: 'mural', titulo: ['Mural de avisos de Brasária', 'Pedidos dos moradores'],
    ops: [...BR_MURAL.map(k => { const s = estadoMissao(k); return (s === 'feita' ? '✓ ' : s === 'ativa' ? '… ' : '! ') + MISSOES[k].nome; }), 'Sair'], sel: 0,
    acao: i => { const k = BR_MURAL[i]; if (!k) { som(SOM.ui_mover, .4); return; } brPedido(k); } }; som(SOM.ui_vez, .5); };
  const B = brB(); if (!B.mural) { B.mural = true; salvaJogo(); brFala(BR_FALAS.br_mural1, lista); return; }
  lista();
}
function brPedido(k) {
  const M = MISSOES[k], s = estadoMissao(k);
  if (s === 'feita') { brFala([['✦', 'Pedido cumprido: ' + M.nome + '. Alguém escreveu "OBRIGADO" bem torto embaixo.']]); return; }
  if (s === 'ativa') { brFala([['✦', 'Você já pegou este pedido: ' + M.nome + ' (' + progressoMissao(k) + ' / ' + alvoMissao(k) + '). Veja no menu → Missões.']]); return; }
  brFala(M.oferta, () => { aceitaMissao(k); if (k === 'carvao_tiberio' && !qtd('saco_carvao')) { daItem('saco_carvao', 1); salvaJogo(); } });
}
// ---------- pontos do mapa (o motor chama antes de tudo no abreFala; devolve true quando cuidou) ----------
function regiaoFala(id) {
  if (REGIAO !== 'brasaria') return false;
  const B = brB();
  if (id.startsWith('fo_')) return typeof baconTimePega === 'function' && baconTimePega(id);
  if (id === 'ursula' || id === 'salvia' || id === 'mercado') {   // quem vende: o motor abre Comprar / Conversar / Sair (LOJAS)
    if (UI.soConversa) { if (id === 'mercado') brFala(BR_FALAS.br_mercado); else brConversa(id); return true; }
    return false;   // sem ser 'Conversar' (inclusive '✔ Entregar' da Dona Sálvia): o motor cuida (loja ou missão)
  }
  if (id === 'gorm') {
    if (UI.soConversa) { brConversa('gorm'); return true; }
    UI.escolha = { id: 'taverna', ops: ['Descansar e salvar', 'Conversar', 'Sair'], sel: 0, acao: i => {
      if (i === 0) brFala(BR_FALAS.br_taverna, () => { if (typeof encheVida === 'function') encheVida(); salvaVila(); aviso('HP e MP recuperados · Jogo salvo!', '#7dffa8'); });
      else if (i === 1) brConversa('gorm'); else som(SOM.ui_mover, .4); } };
    som(SOM.ui_vez, .5); return true;
  }
  if (id === 'pipo') {   // a missão do gato primeiro (entregar ou lembrar), depois as conversas
    const mf = typeof missaoFala === 'function' ? missaoFala('pipo') : null, conv = (B.conv || {}).pipo || 0;
    if (mf && (missaoPronta('gato_pipo') || conv >= BR_CONVERSAS.pipo.length)) { brFala(mf.linhas, mf.fim); return true; }
    brConversa('pipo'); return true;
  }
  if (id === 'bigode') { brConversa('bigode'); return true; }
  if (id === 'mural') { brMural(); return true; }
  if (id === 'conselho') { if (!B.conselho) { B.conselho = true; salvaJogo(); brFala(BR_FALAS.br_conselho1); } else brFala(BR_FALAS.br_conselho); return true; }
  if (id === 'portao_norte') { brFala(BR_FALAS.br_portao_norte); return true; }
  if (id === 'gato') {
    if (estadoMissao('gato_pipo') === 'ativa' && !B.gato) brFala(BR_FALAS.br_gato, () => { B.gato = true; pontoGato(); salvaJogo(); aviso('Você pegou o Brasinha! Leve o gato ao Pipo.', '#ffe27a'); });
    else brFala(BR_FALAS.br_gato_nada);
    return true;
  }
  if (id === 'portao_sul') {
    UI.escolha = { id: 'portao_sul', ops: ['Ir para a trilha das cinzas', 'Ficar em Brasária'], sel: 0, acao: i => {
      if (i !== 0) { som(SOM.ui_mover, .4); return; }
      JOGO.cinzas = { x: 776, y: 262 }; aviso('Saindo pela portinhola do portão sul…', '#ffe27a'); vaiPara('cinzas.html'); } };
    som(SOM.ui_vez, .5); return true;
  }
  return false;
}
// o ponto do gato (os caixotes até o telhado da forja) só existe com a missão ativa e o gato lá em cima
function pontoGato() {
  const i = V.pontos.findIndex(p => p.id === 'gato'); if (i >= 0) V.pontos.splice(i, 1);
  if (estadoMissao('gato_pipo') === 'ativa' && !brB().gato) V.pontos.push({ id: 'gato', x: BR_GATO.px, y: BR_GATO.py, r: 40 });
}

// ---------- a história da cidade ----------
let brMissaoAntes = '';
function brHistoriaPasso() {
  // a missão do gato foi pega no mural: o ponto dos caixotes aparece
  const st = estadoMissao('gato_pipo') + (brB().gato ? 'g' : ''); if (st !== brMissaoAntes) { brMissaoAntes = st; pontoGato(); }
}
function regiaoChega() {
  if (REGIAO !== 'brasaria') return;
  const C = brC3(), B = brB(); C.fase = 'brasaria'; C.parteA2 = true;
  pontoGato();
  if (/[?&]layout/.test(location.search)) return;   // verificador de layout (layout_check.js): sem cutscene por cima das telas
  if (!B.chegou) { hero.alvo = null; hero.pontoAlvo = null; for (const k in teclas) teclas[k] = false;
    setTimeout(() => tocaFilme(BR_CENAS_ENTRADA, BR_IMG_ENTRADA, brFimEntrada), 500); }
}
function brFimEntrada() {
  const C = brC3(), B = brB(); B.chegou = true; C.bacon = true; C.fase = 'brasaria';
  hero.x = 745; hero.y = 700; hero.olha = 'cima'; cam.x = hero.x; cam.y = hero.y; if (typeof BT !== 'undefined') BT.posto = false;
  salvaVila(); setTimeout(() => brFala(BR_FALAS.br_chega), 500);
}
// estrela do minimapa (minimapa.js): para onde ir agora. A Parte C começa daqui (JOGO.cap3.fase = 'brasaria')
function brasariaDestino() {
  const B = brB();
  if (!B.mural) return { reg: 'brasaria', x: 962, y: 540, txt: 'Leia o mural de avisos da praça' };
  return null;
}

// ---------- cutscene "O porco abriu o portão" (sistema do motor: cada cena segura no fim com 'ENTER ▶ continuar'; ESC pula) ----------
// vozes (ROTEIRO_VOZ_BRASARIA.md): assets/voz/<id>.ogg|.mp3; se o arquivo não existir, fica só a legenda
const BR_VOZ_IDS = ['brasaria_1_guarda', 'brasaria_2_jux', 'brasaria_2_bino'];
// efeitos por cima da imagem: cinza caindo e brasas subindo
const brFx = { cinza: [], brasa: [], ultT: 0, cena: -1 };
function brFxCena(tt, i) {
  const F = brFx; if (F.cena !== i) { F.cena = i; F.cinza.length = 0; F.brasa.length = 0; F.ultT = tt; }
  const dt = Math.max(0, Math.min(.05, tt - F.ultT)); F.ultT = tt;
  if (Math.random() < .45) F.cinza.push({ x: brRnd(-20, W), y: -6, v: brRnd(14, 34), s: brRnd(1, 2.6), o: brRnd(0, 6) });
  if (Math.random() < .5) F.brasa.push({ x: brRnd(0, W), y: H + 4, v: brRnd(30, 70), s: brRnd(1, 2.2), o: brRnd(0, 6), d: 0 });
  for (const f of F.cinza) { f.y += f.v * dt; f.x += (Math.sin(tt * 1.3 + f.o) * 10 + 8) * dt; }
  for (const b of F.brasa) { b.y -= b.v * dt; b.x += Math.sin(tt * 3 + b.o) * 14 * dt; b.d += dt; }
  F.cinza = F.cinza.filter(f => f.y < H + 6); F.brasa = F.brasa.filter(b => b.d < 4 && b.y > -6);
  ctx.save();
  for (const f of F.cinza) { ctx.fillStyle = 'rgba(175,165,165,.7)'; ctx.fillRect(f.x, f.y, f.s, f.s); }
  ctx.globalCompositeOperation = 'lighter';
  for (const b of F.brasa) { ctx.fillStyle = `rgba(255,${(140 + 60 * Math.sin(b.o)) | 0},50,${.5 + .5 * Math.sin(tt * 11 + b.o)})`; ctx.fillRect(b.x, b.y, b.s, b.s); }
  ctx.restore();
}
const BR_CENAS_ENTRADA = [
  { mus: 'vila', cam: [.5, .55, 1.0, .46, .5, 1.12], dur: 7, fx: 'cinzas', extra: (tt, i) => brFxCena(tt, i),
    vozes: [[1.6, 'brasaria_1_guarda']],
    falas: [[1.6, 'Guarda', 'O PORCO! Peguem o porco!']], sons: [[.4, 'br_tranca'], [.9, 'oinc'], [4.4, 'oinc']] },
  { mus: 'vila', cam: [.5, .45, 1.12, .52, .5, 1.0], dur: 8, fx: 'cinzas', extra: (tt, i) => brFxCena(tt, i),
    vozes: [[1.4, 'brasaria_2_jux'], [4.4, 'brasaria_2_bino']],
    falas: [[1.4, 'Jux', '…Bom, entramos.'], [4.4, 'Bino', '…Porco esperto.']], sons: [[.6, 'br_martelo'], [6.2, 'oinc']] },
];
let BR_IMG_ENTRADA = [];

// ---------- registra tudo no motor (chamado no fim do vila_motor.js) ----------
function regiaoInit() {
  if (REGIAO !== 'brasaria') return;
  Object.assign(NOMES, { mural: 'Mural de avisos', conselho: 'Casa do Conselho', portao_sul: 'Portão sul (trilha das cinzas)', portao_norte: 'Portão norte',
    mercado: 'Mercado de Brasária (loja)', ursula: 'Úrsula (ferraria)', salvia: 'Dona Sálvia (botica)', gorm: 'Gorm (taverna: descansar e salvar)', pipo: 'Pipo',
    bigode: 'Capitão Bigode', gato: 'Caixotes até o telhado' });
  for (const a of BR_ACHADOS) NOMES['fo_' + a.id] = 'Brilho de focinho';
  Object.assign(FALAS, BR_FALAS);
  for (const k in BR_CFG) COR[BR_CFG[k].nome] = BR_CFG[k].cor;
  COR.Guarda = '#ff9a7a';
  // retratos na caixa de fala: a linha 3 de cada folha (as 4 expressões: 0 normal, 1 feliz, 2 bravo, 3 surpreso)
  for (const k in (BR_F.retratos || {})) { const R = BR_F.retratos[k], im = brImg(R.atlas), cv = document.createElement('canvas');
    cv.width = R.fw * 4; cv.height = R.fh; cv.complete = true;
    const faz = () => { const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); R.exp.forEach((c, j) => g.drawImage(im, c * R.fw, 0, R.fw, R.fh, j * R.fw, 0, R.fw, R.fh)); };
    if (im.complete && im.naturalWidth) faz(); else im.addEventListener('load', faz, { once: true });
    RET[k] = { atlas: '', w: R.fw, h: R.fh }; RETI[k] = cv; RET_DE[BR_CFG[k].nome] = k; }
  // quem tem "!" ou "✔" de missão em cima da cabeça (vila_menu.js marcasNoMundo)
  if (typeof MARCAS_FORA === 'object') MARCAS_FORA.brasaria = () => { const o = {}; for (const k of ['pipo', 'salvia']) if (BR_NPC[k]) o[k] = { x: BR_NPC[k].F.x, y: BR_NPC[k].F.y }; return o; };
  if (typeof ALT_FORA === 'object') Object.assign(ALT_FORA, { pipo: 62, salvia: 58 });
  // vozes, sons e a cutscene
  for (const id of BR_VOZ_IDS) VOZES[id] = arq('assets/voz/' + id);
  SOM_CINE.br_tranca = arq('assets/sfx/novos/capitao_clank'); SOM_CINE.br_martelo = arq('assets/sfx/novos/forjado_martelo');
  BR_IMG_ENTRADA = imgsFilme(['entrada1', 'entrada2'].map(n => 'assets/cine_brasaria/' + n + '.jpg'));
  FILMES.push({ id: 'brasaria', nome: 'O porco abriu o portão', c: () => BR_CENAS_ENTRADA, i: () => BR_IMG_ENTRADA, visto: () => !!(JOGO.cap3 && JOGO.cap3.bras && JOGO.cap3.bras.chegou) });
  if (typeof baconTimeAchados === 'function') baconTimeAchados(BR_ACHADOS);
  // o verificador de layout (layout_check.js) desenha a tela direto (sem janela não há requestAnimationFrame)
  window.__rio = window.__rio || { desenha: () => desenha() };
  // laboratório: brasaria.html#cine_entrada só toca o filme
  if (location.hash.split('?')[0] === '#cine_entrada') setTimeout(() => tocaFilme(BR_CENAS_ENTRADA, BR_IMG_ENTRADA, () => {}), 1500);
}
