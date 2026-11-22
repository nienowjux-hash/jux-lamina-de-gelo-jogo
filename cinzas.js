/* ============ TRILHA DAS CINZAS (Cap. 3, Parte A2 — FICHA_CAP3_CINZAS.md, aprovada 2026-11-21) ============
   Do Porto de Cinzas (o cais, fim do rio) até o portão de Brasária. Mapa: tools/cinzas_mapa.py -> cinzas_dados.js (chão) e
   cinzas_folhas.js (o Tibério, o retrato dele e a máscara da lava). O cenário é IMAGEM; este arquivo só anima por cima e cuida da
   história do mapa. Carrega ANTES do vila_motor.js (como o vida_pico.js); usa as coisas do motor só quando é chamado.
   Ganchos no vila_motor.js: regiaoInit() (fim do motor), regiaoChega() (ao abrir o mapa), regiaoFala(id) (começo do abreFala),
   vidaPasso(dt), vidaDesenha('chao'|'ar'), vidaNpcs() (desenhos na ordem do Jux) e c.extra(t) nas cenas das cutscenes.
   - vida: lava pulsando, brasas subindo das rachaduras, vapor das fontes, fogo dos braseiros do portão e da fogueira (a cinza
     caindo é a "neve" do motor pintada de cinza)
   - GÊISERES (coisa nova): borbulham ~1 s (aviso) e soltam um jato de vapor, desencontrados; quem está no jato é empurrado e
     perde um pouquinho de HP
   - o TIBÉRIO CARVÃO no banquinho (loja + 3 conversas), a fogueira (salvar), a caverna de lava (Mãe-Salamandra, chefes.js)
   - cutscenes "As carroças" (no meio do mapa, depois a luta com os Forjados) e "O portão de Brasária" (fim da Parte A2)
   Estado: JOGO.cap3 = {..., chegou, carrocas, forjados, parteA2, tib (conversa), fase:'cinzas'|'brasaria'} */
'use strict';
const CZ_F = window.JUX_CINZAS || {};
const czC3 = () => { JOGO.cap3 = JOGO.cap3 || {}; return JOGO.cap3; };
const czRnd = (a, b) => a + Math.random() * (b - a);
const czImg = src => { const i = new Image(); if (src) i.src = src; return i; };
const CZ_TIB = czImg(CZ_F.tiberio && CZ_F.tiberio.atlas), CZ_TIBR = czImg(CZ_F.tiberio_ret && CZ_F.tiberio_ret.atlas), CZ_LAVAM = czImg(CZ_F.lava && CZ_F.lava.img);
let czLava = null;   // a lava do mapa recortada pela máscara (feita uma vez, quando o mapa e a máscara chegam)

// ---------- lugares (coordenadas do mapa 1448x1086) ----------
const CZ_TIBERIO = { x: 434, y: 618 };
const CZ_FOGOS = [[346, 624, 1.2], [656, 158, .8], [886, 158, .8]];   // fogueira do acampamento e braseiros do portão: x, y (base da chama), tamanho
const CZ_LUZES = [[346, 618, 70, 'rgba(255,140,40,.40)'], [656, 160, 55, 'rgba(255,150,50,.36)'], [886, 160, 55, 'rgba(255,150,50,.36)'],
  [558, 856, 30, 'rgba(255,190,90,.34)'], [818, 856, 30, 'rgba(255,190,90,.34)'], [408, 512, 22, 'rgba(255,180,80,.30)'],
  [240, 190, 70, 'rgba(255,110,30,.30)'], [1140, 486, 40, 'rgba(255,120,40,.30)'], [1286, 488, 34, 'rgba(255,120,40,.28)']];
const CZ_VAPOR = [[1240, 712, 1], [1150, 790, 1], [1262, 862, 1], [1330, 700, .8], [1060, 742, .6]];   // fontes quentes (só vapor, não é chão)
const CZ_GEISERES = [{ x: 812, y: 736, fase: 'calmo', t: 0, prox: 1.5 }, { x: 906, y: 691, fase: 'calmo', t: 0, prox: 4.2 }, { x: 1031, y: 651, fase: 'calmo', t: 0, prox: 2.8 }];
const CZ_GATILHO = (x, y) => y < 505 && x < 960;   // "As carroças": o time chega no alto do caminho do meio (todo caminho para o portão passa aqui)

// ---------- partículas ----------
const czBrasas = [], czVapor = [], czChamas = [], czPops = [];
let czEmpurra = null, czDorT = 0, czBrasaT = 0, czVaporT = 0;
const czSom = (nome, vol) => { try { if (typeof som === 'function' && typeof arq === 'function') { CZ_SONS[nome] = CZ_SONS[nome] || arq('assets/sfx/novos/' + nome); som(CZ_SONS[nome], vol); } } catch (e) {} };
const CZ_SONS = {};
const czPerto = (x, y, r) => Math.hypot(hero.x - x, hero.y - y) < r;
const czVolDist = (x, y, alc) => Math.max(0, 1 - Math.hypot(hero.x - x, hero.y - y) / alc);

function czGeiserPasso(g, dt) {
  g.t += dt;
  if (g.fase === 'calmo') { g.prox -= dt; if (g.prox <= 0) { g.fase = 'aviso'; g.t = 0; const v = czVolDist(g.x, g.y, 260); if (v > 0) czSom('sapo_borbulha', .55 * v); } }
  else if (g.fase === 'aviso') {
    if (Math.random() < dt * 30) czVapor.push({ x: g.x + czRnd(-10, 10), y: g.y - 2, vx: czRnd(-6, 6), vy: czRnd(-30, -14), v: 0, d: czRnd(.4, .7), s: czRnd(2, 4), a: .5, bolha: true });
    if (g.t >= 1.05) { g.fase = 'jato'; g.t = 0; const v = czVolDist(g.x, g.y, 300); if (v > 0) czSom('caramujo_vapor', .85 * v); }
  } else if (g.fase === 'jato') {
    for (let k = 0; k < 3; k++) if (Math.random() < dt * 40) czVapor.push({ x: g.x + czRnd(-6, 6), y: g.y - czRnd(0, 6), vx: czRnd(-10, 10), vy: czRnd(-170, -110), v: 0, d: czRnd(.6, 1), s: czRnd(5, 9), a: .75, jato: true });
    // quem está em cima do buraco na hora do jato é empurrado para longe dele e perde um pouquinho de HP
    if (!czEmpurra && czDorT <= 0 && !fala && !ab.on && !transicao && ((hero.x - g.x) / 32) ** 2 + ((hero.y - g.y) / 18) ** 2 <= 1) czQueima(g);
    if (g.t >= 1.4) { g.fase = 'calmo'; g.t = 0; g.prox = czRnd(3.2, 5.6); }
  }
}
function czQueima(g) {
  let dx = hero.x - g.x, dy = hero.y - g.y, d = Math.hypot(dx, dy);
  if (d < 2) { const o = { cima: [0, 1], baixo: [0, -1], esquerda: [1, 0], direita: [-1, 0] }[hero.olha] || [0, 1]; dx = o[0]; dy = o[1]; d = 1; }   // bem no meio: volta para trás
  czEmpurra = { vx: dx / d * 230, vy: dy / d * 230, t: .3 }; czDorT = 1.2; hero.alvo = null; hero.pontoAlvo = null;
  let perdeu = 0;
  if (typeof grupoMenu === 'function' && typeof vidaAtual === 'function') for (const q of grupoMenu()) {
    const v = vidaAtual(q); if (v.hp <= 1) continue; const dano = Math.max(1, Math.round(v.max * .04)); guardaVida(q, Math.max(1, v.hp - dano), v.mp); if (q === 'jux') perdeu = dano; }
  czPops.push({ x: hero.x, y: hero.y - 52, txt: '-' + (perdeu || 1), v: 0 });
  czSom('caramujo_vapor', .7); czSom('whoosh2', .4);
  const C = czC3(); if (!C.geiserVisto) { C.geiserVisto = true; aviso('Gêiser! Espere ele parar de borbulhar para passar.', '#ff9a7a'); }
}

function vidaPasso(dt) {
  if (REGIAO !== 'cinzas') return;
  for (const g of CZ_GEISERES) czGeiserPasso(g, dt);
  if (czDorT > 0) czDorT -= dt;
  if (czEmpurra) { const E = czEmpurra; E.t -= dt; const k = Math.max(0, E.t / .3);
    const nx = hero.x + E.vx * dt * k, ny = hero.y + E.vy * dt * k;
    if (livre(nx, ny)) { hero.x = nx; hero.y = ny; } else if (livre(nx, hero.y)) hero.x = nx; else if (livre(hero.x, ny)) hero.y = ny;
    if (E.t <= 0) czEmpurra = null; }
  // brasas subindo das rachaduras de lava (só perto da tela)
  const pts = CZ_F.lavaPts || [];
  czBrasaT += dt * 28;
  while (czBrasaT >= 1 && pts.length) { czBrasaT--; for (let k = 0; k < 6; k++) { const p = pts[(Math.random() * pts.length) | 0];
      if (p[0] > VIS.x0 - 20 && p[0] < VIS.x1 + 20 && p[1] > VIS.y0 - 20 && p[1] < VIS.y1 + 40) { czBrasas.push({ x: p[0] + czRnd(-3, 3), y: p[1], vx: czRnd(-8, 8), vy: czRnd(-38, -16), v: 0, d: czRnd(1.2, 2.6), s: czRnd(.8, 1.8), f: czRnd(0, 6) }); break; } } }
  for (const b of czBrasas) { b.v += dt; b.x += (b.vx + Math.sin(t * 2 + b.f) * 6) * dt; b.y += b.vy * dt; }
  for (let i = czBrasas.length - 1; i >= 0; i--) if (czBrasas[i].v > czBrasas[i].d) czBrasas.splice(i, 1);
  if (czBrasas.length > 260) czBrasas.splice(0, czBrasas.length - 260);
  // vapor das fontes quentes
  czVaporT += dt * 5;
  while (czVaporT >= 1) { czVaporT--; const [x, y, k] = CZ_VAPOR[(Math.random() * CZ_VAPOR.length) | 0]; if (Math.random() < k) czVapor.push({ x: x + czRnd(-14, 14), y, vx: czRnd(4, 10), vy: czRnd(-22, -12), v: 0, d: czRnd(2.2, 3.4), s: czRnd(5, 9), a: .32 }); }
  for (const p of czVapor) { p.v += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy *= p.jato ? Math.pow(.25, dt) : 1; p.s += dt * (p.jato ? 12 : 4); }
  for (let i = czVapor.length - 1; i >= 0; i--) if (czVapor[i].v > czVapor[i].d) czVapor.splice(i, 1);
  // chamas dos braseiros e da fogueira
  for (const [x, y, e] of CZ_FOGOS) if (Math.random() < dt * 18 * e) czChamas.push({ x: x + czRnd(-7, 7) * e, y: y + czRnd(-2, 2), vx: czRnd(-5, 5), s: czRnd(2.2, 3.6) * e, v: 0, d: czRnd(.45, .8), q: Math.random() < .22 });
  for (const c of czChamas) { c.v += dt; c.y -= dt * (c.q ? 34 : 24); c.x += c.vx * dt; c.s *= 1 - dt * 1.4; }
  for (let i = czChamas.length - 1; i >= 0; i--) if (czChamas[i].v > czChamas[i].d * (czChamas[i].q ? 1.8 : 1)) czChamas.splice(i, 1);
  for (const p of czPops) p.v += dt; while (czPops.length && czPops[0].v > 1.1) czPops.shift();
  czTiberioPasso(dt);
  czHistoriaPasso(dt);
}

// lava pulsando: a lava do próprio mapa por cima, em modo "luz", subindo e descendo devagar
function czFazLava() {
  if (czLava || !CZ_F.lava || !CZ_LAVAM.complete || !CZ_LAVAM.naturalWidth || !MAPA.complete || !MAPA.naturalWidth) return;
  const L = CZ_F.lava, c = document.createElement('canvas'); c.width = L.w; c.height = L.h; const g = c.getContext('2d');
  g.drawImage(CZ_LAVAM, 0, 0); const id = g.getImageData(0, 0, L.w, L.h), d = id.data;
  for (let i = 0; i < d.length; i += 4) { d[i + 3] = d[i]; d[i] = d[i + 1] = d[i + 2] = 255; } g.putImageData(id, 0, 0);
  g.globalCompositeOperation = 'source-in'; g.drawImage(MAPA, L.x * K, L.y * K, L.w * K, L.h * K, 0, 0, L.w, L.h); czLava = c;
}
function vidaDesenha(camada) {
  if (REGIAO !== 'cinzas') return;
  if (camada === 'chao') {
    czFazLava();
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    if (czLava) { const L = CZ_F.lava, x0 = Math.max(L.x, VIS.x0), y0 = Math.max(L.y, VIS.y0), x1 = Math.min(L.x + L.w, VIS.x1), y1 = Math.min(L.y + L.h, VIS.y1);
      if (x1 > x0 && y1 > y0) { ctx.globalAlpha = .16 + .12 * Math.sin(t * 1.5) + .04 * Math.sin(t * 4.3); ctx.drawImage(czLava, x0 - L.x, y0 - L.y, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); ctx.globalAlpha = 1; } }
    for (const [x, y, r, cor] of CZ_LUZES) { if (x + r < VIS.x0 || x - r > VIS.x1 || y + r < VIS.y0 || y - r > VIS.y1) continue;
      const rr = r + Math.sin(t * 6 + x) * 2 + Math.sin(t * 17 + y) * 1, g = ctx.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, cor); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    // gêiser borbulhando: o buraco acende e treme (o aviso de ~1 s)
    for (const g of CZ_GEISERES) if (g.fase !== 'calmo') { const k = g.fase === 'aviso' ? .35 + .3 * Math.abs(Math.sin(g.t * 18)) : .5, gr = ctx.createRadialGradient(g.x, g.y, 0, g.x, g.y, 26);
      gr.addColorStop(0, `rgba(255,240,220,${k})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.fillRect(g.x - 26, g.y - 26, 52, 52); }
    ctx.restore();
    return;
  }
  // 'ar': vapor, brasas, chamas e o "-HP" do gêiser (por cima de todos)
  ctx.save();
  for (const p of czVapor) { const q = Math.sin(Math.PI * Math.min(1, p.v / p.d)), a = p.a * q;
    if (p.bolha) { ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = .8; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * .6, 0, 6.283); ctx.stroke(); continue; }
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s); g.addColorStop(0, `rgba(235,235,240,${a})`); g.addColorStop(1, 'rgba(235,235,240,0)'); ctx.fillStyle = g; ctx.fillRect(p.x - p.s, p.y - p.s, p.s * 2, p.s * 2); }
  ctx.globalCompositeOperation = 'lighter';
  for (const c of czChamas) { const a = 1 - c.v / (c.d * (c.q ? 1.8 : 1)); ctx.fillStyle = c.q ? `rgba(255,210,110,${a})` : `rgba(255,${(110 + (1 - a) * 90) | 0},40,${a * .9})`; ctx.beginPath(); ctx.arc(c.x, c.y, Math.max(.4, c.s), 0, 6.283); ctx.fill(); }
  for (const b of czBrasas) { const a = Math.sin(Math.PI * b.v / b.d) * (.6 + .4 * Math.sin(t * 13 + b.f)); ctx.fillStyle = `rgba(255,${(150 + 60 * Math.sin(b.f)) | 0},60,${Math.max(0, a)})`; ctx.fillRect(b.x, b.y, b.s, b.s); }
  ctx.restore();
  for (const p of czPops) { ctx.save(); ctx.globalAlpha = Math.min(1, (1.1 - p.v) * 2); ctx.font = 'bold 13px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(40,0,0,.9)';
    ctx.strokeText(p.txt, p.x, p.y - p.v * 18); ctx.fillStyle = '#ff5a4a'; ctx.fillText(p.txt, p.x, p.y - p.v * 18); ctx.restore(); }
}

// ---------- o TIBÉRIO CARVÃO (ref/cinzas/tiberio.png, 3x4, cortado como a Marta) ----------
// linha 1: fumando e mexendo a fogueira (o quadro 3 é o cochilo); linha 2: resmungando; linha 3: atendendo (vira, acena, de pé
// com as mãos na cintura, de pé mostrando o saco de poções). A folha olha para a DIREITA: no banco ele fica virado para a fogueira.
const CZ_TB = { est: 'fuma', t: 0, prox: czRnd(12, 18), cochilo: czRnd(8, 14) };
const czFalaTib = () => !!(fala && fala.linhas && fala.linhas[fala.i] && fala.linhas[fala.i][0] === 'Tibério');
function czTiberioPasso(dt) {
  const B = CZ_TB; B.t += dt; const perto = czPerto(CZ_TIBERIO.x, CZ_TIBERIO.y, 95);
  const atende = czFalaTib() || (UI.escolha && UI.escolha.id === 'tiberio') || (UI.loja && UI.loja.id === 'tiberio');
  if (atende) { if (B.est !== 'atende') { B.est = 'atende'; B.t = 0; } return; }
  if (perto && B.est !== 'acena') { B.est = 'acena'; B.t = 0; return; }
  if (!perto && (B.est === 'acena' || B.est === 'atende')) { B.est = 'fuma'; B.t = 0; return; }
  if (B.est === 'fuma') { B.prox -= dt; B.cochilo -= dt; if (B.prox <= 0) { B.est = 'resmunga'; B.t = 0; } }
  else if (B.est === 'resmunga' && B.t > 3.4) { B.est = 'fuma'; B.t = 0; B.prox = czRnd(14, 22); }
}
function czTiberioDesenha() {
  const T = CZ_F.tiberio; if (!T || !CZ_TIB.complete || !CZ_TIB.naturalWidth) return;
  const B = CZ_TB, X = CZ_TIBERIO.x, Y = CZ_TIBERIO.y, hd = hero.x > X;
  let q, vira;
  if (B.est === 'resmunga') { q = 4 + Math.min(3, Math.floor(B.t / .85)); vira = true; }
  else if (B.est === 'acena') { q = B.t < .5 ? 8 : 9; vira = hd; }
  else if (B.est === 'atende') { q = UI.loja && UI.loja.id === 'tiberio' ? 11 : 10; vira = q === 10 ? hd : !hd; }
  else { const cochila = B.cochilo < 0; if (B.cochilo < -3) B.cochilo = czRnd(10, 16); q = cochila ? 2 : [0, 1, 0, 3][Math.floor(t * 1.3) % 4]; vira = true; }
  ctx.save(); ctx.fillStyle = 'rgba(10,5,10,.35)'; ctx.beginPath(); ctx.ellipse(X, Y - 1, 12, 3.5, 0, 0, 6.283); ctx.fill();
  ctx.translate(X, Y); if (vira) ctx.scale(-1, 1);
  ctx.drawImage(CZ_TIB, (q % 4) * T.fw, Math.floor(q / 4) * T.fh, T.fw, T.fh, -T.fw / 2, -T.fh, T.fw, T.fh); ctx.restore();
  if (czPerto(X, Y, 110) && !fala) { ctx.save(); ctx.font = 'bold 11px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeText('Tibério', X, Y - T.fh - 6); ctx.fillStyle = '#ffd0a0'; ctx.fillText('Tibério', X, Y - T.fh - 6); ctx.restore(); }
}
function vidaNpcs() { return REGIAO === 'cinzas' ? [[CZ_TIBERIO.y, czTiberioDesenha]] : []; }
// a boca da caverna de lava (chefes.js chama): bafo quente e dois olhos amarelos piscando lá no fundo enquanto ela não foi vencida
function cinzasCaverna(c) {
  const feito = typeof chefeFeito === 'function' && chefeFeito(c.id), ox = 240, oy = 182, a = .7 + .3 * Math.sin(t * 1.7);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, 40); g.addColorStop(0, `rgba(255,120,30,${(feito ? .12 : .25) * a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(ox - 40, oy - 40, 80, 80);
  if (!feito && (t % 4.6) > .18) { ctx.fillStyle = `rgba(255,220,80,${a})`; ctx.fillRect(ox - 9, oy - 2, 5, 2); ctx.fillRect(ox + 4, oy - 2, 5, 2); }
  ctx.restore();
  if (Math.hypot(hero.x - c.x, hero.y - c.y) < 100) { ctx.save(); ctx.font = 'bold 11px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.9)';
    const nm = feito ? 'Ninho da Mãe-Salamandra (calmo)' : 'Caverna de lava'; ctx.strokeText(nm, ox, oy - 36); ctx.fillStyle = feito ? '#d8c8b8' : '#ffb07a'; ctx.fillText(nm, ox, oy - 36); ctx.restore(); }
}

// ---------- falas ----------
const CZ_FALAS = {
  cz_chega: [['Jux', 'Porto de Cinzas. E a estrada sobe direto para dentro do vulcão.'], ['Bino', '…Quente.'], ['Sir Bacon', 'Oinc! (cof, cof)'],
    ['✦', 'O barco Halvard fica amarrado no cais. Siga a ★ pela trilha de pedra até Brasária. Cuidado com os gêiseres!']],
  cais_cinzas: [['Jux', 'O Halvard fica amarrado aqui. A gente volta para buscar.'], ['Bino', '…Ele espera.']],
  cz_fogueira: [['✦', 'A fogueira do Tibério estala. Vocês esquentam as mãos e descansam um pouco.']],
  cz_forjados_vem: [['✦', 'Os Forjados largam as carroças e vêm para cima do time!']],
  cz_forjados_bloqueiam: [['✦', 'Os Forjados ainda vigiam a estrada lá em cima, de martelo na mão.'], ['Jux', 'Sem desviar. Bino, de novo.'], ['Bino', '…Vou quebrar.']],
  cz_forjados_fim: [['Bino', '…Quebrou.'], ['Jux', 'Armadura vazia, olhos roxos… a Ordem está metida nisso até o pescoço.'],
    ['✦', 'Daqui em diante os Forjados também andam pela trilha. Siga até o portão de Brasária.']],
  cz_portao_fechado: [['✦', 'O portão de ferro de Brasária continua fechado. Lá dentro, os martelos não param.'],
    ['✦', 'Brasária (a Parte B) chega na próxima atualização. O jogo fica salvo aqui.']],
  cz_portao_cedo: [['Jux', 'O portão… e tem gente lá em cima.'], ['✦', 'Antes, a estrada do meio da trilha.']],
};
// as 3 conversas do Tibério, em ordem (ficha, seção 3): as forjas e o "rei", as carroças de armas, o pássaro de fogo
const CZ_TIB_CONVERSAS = [
  [['Tibério', 'Hmpf. Mais gente subindo para Brasária. Carvão ninguém compra, mas subir todo mundo sobe.'],
    ['Tibério', 'As forjas de lá não apagam nunca. Dia e noite, martelando para "o rei".'],
    ['Jux', 'Que rei?'], ['Tibério', 'Pergunta para eles. Eu só vendo carvão. Vendia.']],
  [['Tibério', 'Se forem dormir aqui, durmam cedo. E de olho fechado.'],
    ['Tibério', 'Toda noite sobem carroças de armas por essa estrada. E quem puxa são armaduras. Vazias. Andando sozinhas.'],
    ['Bino', '…Sozinhas?'], ['Tibério', 'Sozinhas, grandão. E nem dão boa-noite.']],
  [['Tibério', 'E o pior nem é a armadura.'],
    ['Tibério', 'Um pássaro de fogo grita lá no alto do vulcão. Toda santa noite. Não durmo desde o inverno passado.'],
    ['Jux', 'A gente viu esse pássaro lá do rio.'], ['Tibério', 'Então sobe lá e manda ele calar o bico. Hmpf.']],
];
const CZ_TIB_DEPOIS = [['Tibério', 'Já contei tudo. Agora compra alguma coisa ou me deixa cochilar.']];
const CZ_TIB_VIU = [['Tibério', 'Viram as armaduras, é? Eu avisei. Ninguém escuta o velho.'], ['Jux', 'Agora a gente escuta.'], ['Tibério', 'Hmpf. Tarde.']];
function czFala(linhas, fim) { fala = { linhas, i: 0, letras: 0, fim }; hero.alvo = null; hero.pontoAlvo = null; som(SOM.ui_vez, .5); }

// pontos do mapa (o motor chama antes de tudo no abreFala; devolve true quando cuidou)
function regiaoFala(id) {
  if (REGIAO !== 'cinzas') return false;
  const C = czC3();
  if (id === 'tiberio') {
    if (!UI.soConversa) return false;   // sem ser 'Conversar': o motor abre Comprar / Conversar / Sair (LOJAS.tiberio)
    let L;
    if (C.carrocas && !C.tibViu) { C.tibViu = true; L = CZ_TIB_VIU; }
    else if ((C.tib || 0) < CZ_TIB_CONVERSAS.length) { L = CZ_TIB_CONVERSAS[C.tib || 0]; C.tib = (C.tib || 0) + 1; }
    else L = CZ_TIB_DEPOIS;
    czFala(L, () => salvaJogo()); return true;
  }
  if (id === 'fogueira_cinzas') { czFala(CZ_FALAS.cz_fogueira, () => { if (typeof encheVida === 'function') encheVida(); salvaVila(); aviso('HP e MP recuperados · Jogo salvo!', '#7dffa8'); }); return true; }
  if (id === 'cais_cinzas') { czFala(CZ_FALAS.cais_cinzas); return true; }
  if (id === 'portao_brasaria') {
    if (C.parteA2) { czFala(CZ_FALAS.cz_portao_fechado, () => salvaVila()); return true; }
    if (!C.forjados) { czFala(CZ_FALAS.cz_portao_cedo); return true; }
    tocaFilme(CZ_CENAS_PORTAO, CZ_IMG_PORTAO, czFimParteA2); return true;
  }
  return false;
}

// ---------- a história do mapa ----------
let czTravaT = 0;
function czHistoriaPasso(dt) {
  if (czTravaT > 0) { czTravaT -= dt; return; }
  if (fala || ab.on || transicao || noiteFade || uiAberto() || hero.pulo > 0) return;
  const C = czC3();
  if (!CZ_GATILHO(hero.x, hero.y)) return;
  if (!C.carrocas) { czTravaT = 2; for (const k in teclas) teclas[k] = false; hero.alvo = null; hero.pontoAlvo = null;
    tocaFilme(CZ_CENAS_CARROCAS, CZ_IMG_CARROCAS, () => { C.carrocas = true; salvaJogo(); setTimeout(() => czFala(CZ_FALAS.cz_forjados_vem, () => iniciaProva('forjados')), 300); }); return; }
  if (!C.forjados) { czTravaT = 2; for (const k in teclas) teclas[k] = false; czFala(CZ_FALAS.cz_forjados_bloqueiam, () => iniciaProva('forjados')); }
}
function regiaoChega() {
  if (REGIAO !== 'cinzas') return;
  const C = czC3(); if (C.fase !== 'brasaria') C.fase = 'cinzas';
  const pv = JOGO.provas || {};
  if (pv.forjados === 'vencida' && !C.forjados) { C.forjados = true; pv.forjados = 'feita'; salvaJogo(); setTimeout(() => czFala(CZ_FALAS.cz_forjados_fim, () => aviso('A estrada para Brasária está livre.', '#ffe27a')), 700); return; }
  if (/[?&]layout/.test(location.search)) return;   // verificador de layout (layout_check.js): sem fala de chegada por cima das telas
  if (!C.chegou) { C.chegou = true; salvaJogo(); setTimeout(() => czFala(CZ_FALAS.cz_chega), 600); return; }
  // voltou da luta perdida (ou abriu o jogo) com os Forjados ainda na estrada: um passo para trás, fora do gatilho
  if (C.carrocas && !C.forjados && CZ_GATILHO(hero.x, hero.y)) { hero.x = 482; hero.y = 560; cam.x = hero.x; cam.y = hero.y; czTravaT = 1.5; }
}
// fim da Parte A2: a tela escurece com o texto (igual ao fim do Capítulo 2) e o save fica pronto para a Parte B (Brasária)
function czFimParteA2() {
  noiteFade = { t: 0, virou: false, k: 1.8, txt: 'Fim da Parte A2 — A trilha das cinzas', txt2: 'Próximo: Brasária.',
    vira: () => { const C = czC3(); C.parteA2 = true; C.fase = 'brasaria'; hero.x = 776; hero.y = 262; hero.olha = 'cima'; cam.x = hero.x; cam.y = hero.y; salvaVila(); },
    fim: () => aviso('Obrigado por jogar a Parte A2!', '#ffe27a') };
  hero.alvo = null; hero.pontoAlvo = null;
}
// estrela do minimapa (minimapa.js): para onde ir agora
function cinzasDestino() {
  const C = czC3();
  if (C.parteA2) return null;
  if (!C.carrocas) return { reg: 'cinzas', x: 482, y: 470, txt: 'Suba a trilha de pedra rumo a Brasária' };
  if (!C.forjados) return { reg: 'cinzas', x: 482, y: 470, txt: 'Os Forjados bloqueiam a estrada' };
  return { reg: 'cinzas', x: 776, y: 240, txt: 'Chegue ao portão de Brasária' };
}

// ---------- cutscenes (sistema do motor: cada cena segura no fim com 'ENTER ▶ continuar'; ENTER no meio vai ao fim da cena; ESC pula tudo) ----------
// vozes em japonês (ROTEIRO_VOZ_CINZAS.md): assets/voz/<id>.ogg|.mp3; se o arquivo não existir, fica só a legenda
const CZ_VOZ_IDS = ['cinzas_1_jux_a', 'cinzas_1_bino', 'cinzas_1_jux_b', 'cinzas_2_jux', 'cinzas_2_bino', 'cinzas_3_jux', 'cinzas_3_bino', 'cinzas_4_guarda', 'cinzas_5_jux', 'cinzas_5_guarda'];
// efeitos por cima da imagem: cinza caindo, brasas subindo (da lava, embaixo) e, na cena 2, a FLECHA DE VENTO com o rastro verde
const czFx = { cinza: [], brasa: [], ultT: 0, cena: -1 };
function czFxCena(tt, i, flecha) {
  const F = czFx; if (F.cena !== i) { F.cena = i; F.cinza.length = 0; F.brasa.length = 0; F.ultT = tt; }
  const dt = Math.max(0, Math.min(.05, tt - F.ultT)); F.ultT = tt;
  if (Math.random() < .55) F.cinza.push({ x: czRnd(-20, W), y: -6, v: czRnd(14, 34), s: czRnd(1, 2.6), o: czRnd(0, 6) });
  if (Math.random() < .45) F.brasa.push({ x: czRnd(0, W), y: H + 4, v: czRnd(30, 70), s: czRnd(1, 2.2), o: czRnd(0, 6), d: 0 });
  for (const f of F.cinza) { f.y += f.v * dt; f.x += (Math.sin(tt * 1.3 + f.o) * 10 + 8) * dt; }
  for (const b of F.brasa) { b.y -= b.v * dt; b.x += Math.sin(tt * 3 + b.o) * 14 * dt; b.d += dt; }
  F.cinza = F.cinza.filter(f => f.y < H + 6); F.brasa = F.brasa.filter(b => b.d < 4 && b.y > -6);
  ctx.save();
  for (const f of F.cinza) { ctx.fillStyle = 'rgba(175,165,165,.7)'; ctx.fillRect(f.x, f.y, f.s, f.s); }
  ctx.globalCompositeOperation = 'lighter';
  for (const b of F.brasa) { ctx.fillStyle = `rgba(255,${(140 + 60 * Math.sin(b.o)) | 0},50,${.5 + .5 * Math.sin(tt * 11 + b.o)})`; ctx.fillRect(b.x, b.y, b.s, b.s); }
  if (flecha) {   // a flecha vem do alto à direita (do escuro do penhasco) até a corda, deixando um rastro em espiral
    const t0 = .35, t1 = 1.05, x0 = W + 30, y0 = -40, x1 = W * .5, y1 = H * .46;
    if (tt > t0) { const p = Math.min(1, (tt - t0) / (t1 - t0)), some = Math.max(0, 1 - Math.max(0, tt - t1) / 2.2);
      for (let k = 0; k <= 40; k++) { const u = p * k / 40, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u, gira = u * 26 - tt * 8, r = 5 + 3 * Math.sin(u * 9);
        const a = some * (.25 + .75 * u / Math.max(.01, p));
        ctx.fillStyle = `rgba(170,255,190,${a * .55})`; ctx.fillRect(x + Math.cos(gira) * r, y + Math.sin(gira) * r, 3, 3);
        ctx.fillStyle = `rgba(240,255,245,${a * .5})`; ctx.fillRect(x - Math.cos(gira) * r * .6, y - Math.sin(gira) * r * .6, 2, 2); }
      if (p < 1) { const x = x0 + (x1 - x0) * p, y = y0 + (y1 - y0) * p, gr = ctx.createRadialGradient(x, y, 0, x, y, 26); gr.addColorStop(0, 'rgba(220,255,230,.9)'); gr.addColorStop(1, 'rgba(120,255,160,0)'); ctx.fillStyle = gr; ctx.fillRect(x - 26, y - 26, 52, 52); }
      else if (tt < t1 + .35) { const k = 1 - (tt - t1) / .35; ctx.fillStyle = `rgba(200,255,215,${.5 * k})`; ctx.fillRect(0, 0, W, H); }   // o estalo da corda
      // a pena solta levada pelo vento
      if (tt > t1) { const u = tt - t1, px = x1 + u * 38 + Math.sin(u * 2.2) * 26, py = y1 - 30 + u * 16 + Math.sin(u * 3.1) * 8;
        ctx.globalCompositeOperation = 'source-over'; ctx.save(); ctx.translate(px, py); ctx.rotate(Math.sin(u * 2.5) * .6);
        ctx.fillStyle = 'rgba(235,240,225,.95)'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 3, 0, 0, 6.283); ctx.fill(); ctx.strokeStyle = 'rgba(150,170,150,.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke(); ctx.restore(); } }
  }
  ctx.restore();
}
// assobio da flecha (sintetizado, sem arquivo): um apito fino que desce de tom
function czAssobio() { try { if (typeof AC === 'undefined' || !AC) return; const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine';
  o.frequency.setValueAtTime(2600, AC.currentTime); o.frequency.exponentialRampToValueAtTime(1300, AC.currentTime + .75);
  g.gain.setValueAtTime(0, AC.currentTime); g.gain.linearRampToValueAtTime(.12, AC.currentTime + .08); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + .8);
  o.connect(g); g.connect(acSaida(AC)); o.start(); o.stop(AC.currentTime + .85); } catch (e) {} }
const CZ_CENAS_CARROCAS = [
  { mus: 'ordem', cam: [.42, .55, 1.0, .55, .5, 1.12], dur: 12, fx: 'cinzas', extra: (tt, i) => czFxCena(tt, i),
    vozes: [[1, 'cinzas_1_jux_a'], [3.6, 'cinzas_1_bino'], [6, 'cinzas_1_jux_b']],
    falas: [[1, 'Jux', 'Shh… silêncio.'], [3.6, 'Bino', '…Armadura vazia.'], [6, 'Jux', 'Quem fez isso… fez para a Ordem.']], sons: [] },
  { mus: 'ordem', cam: [.55, .45, 1.12, .48, .5, 1.0], dur: 8, fx: 'cinzas', extra: (tt, i) => czFxCena(tt, i, true),
    vozes: [[3.4, 'cinzas_2_jux'], [5.6, 'cinzas_2_bino']],
    falas: [[3.4, 'Jux', '…Quem foi isso?'], [5.6, 'Bino', '…Vento.']], sons: [[.3, 'cz_assobio'], [.4, 'whoosh'], [1.05, 'quebra'], [1.4, 'impacto']], treme: [1.05, 1.9] },
  { mus: 'ordem', cam: [.5, .5, 1.0, .5, .55, 1.14], dur: 7, fx: 'cinzas', extra: (tt, i) => czFxCena(tt, i),
    vozes: [[1, 'cinzas_3_jux'], [4.4, 'cinzas_3_bino']],
    falas: [[1, 'Jux', 'Fomos vistos… Bino, lá vêm eles!'], [4.4, 'Bino', '…Vou quebrar.']], sons: [[.2, 'cz_clank'], [3.8, 'cz_martelo']], treme: [3.8, 4.4] },
];
const CZ_CENAS_PORTAO = [
  { mus: 'lenda', cam: [.5, .42, 1.0, .5, .5, 1.1], dur: 8, fx: 'cinzas', extra: (tt, i) => czFxCena(tt, i),
    vozes: [[1.2, 'cinzas_4_guarda']],
    falas: [[1.2, 'Guarda', 'Alto! Ninguém entra sem encomenda do rei!'], [5.2, 'Sir Bacon', 'Oinc!']], sons: [[5.2, 'oinc']] },
  { mus: 'lenda', cam: [.45, .5, 1.12, .52, .45, 1.0], dur: 6.5, fx: 'cinzas', extra: (tt, i) => czFxCena(tt, i),
    vozes: [[1, 'cinzas_5_jux'], [3, 'cinzas_5_guarda']],
    falas: [[1, 'Jux', '…Que rei?'], [3, 'Guarda', '…C-como é que é?!']], sons: [] },
];
let CZ_IMG_CARROCAS = [], CZ_IMG_PORTAO = [];

// ---------- registra tudo no motor (chamado no fim do vila_motor.js) ----------
function regiaoInit() {
  if (REGIAO !== 'cinzas') return;
  Object.assign(NOMES, { cais_cinzas: 'O barco Halvard', fogueira_cinzas: 'Fogueira (descansar e salvar)', tiberio: 'Tibério Carvão (loja)', portao_brasaria: 'Portão de Brasária', chefe_mae_salamandra: 'Caverna de lava' });
  Object.assign(FALAS, CZ_FALAS);
  Object.assign(COR, { 'Tibério': '#ffc07a', Guarda: '#ff9a7a' });
  // retrato do Tibério na caixa de fala: a linha 3 da folha (expressões 0 normal, 1 feliz, 2 bravo, 3 surpreso)
  if (CZ_F.tiberio_ret) { const R = CZ_F.tiberio_ret, cv = document.createElement('canvas'); cv.width = R.fw * 4; cv.height = R.fh; cv.complete = true;
    const faz = () => { const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); [2, 1, 2, 0].forEach((c, k) => g.drawImage(CZ_TIBR, c * R.fw, 0, R.fw, R.fh, k * R.fw, 0, R.fw, R.fh)); };
    if (CZ_TIBR.complete && CZ_TIBR.naturalWidth) faz(); else CZ_TIBR.addEventListener('load', faz, { once: true });
    RET.tiberio = { atlas: '', w: R.fw, h: R.fh }; RETI.tiberio = cv; RET_DE['Tibério'] = 'tiberio'; }
  // vozes, músicas e sons das cutscenes
  for (const id of CZ_VOZ_IDS) VOZES[id] = arq('assets/voz/' + id);
  SOM_CINE.cz_clank = arq('assets/sfx/novos/capitao_clank'); SOM_CINE.cz_martelo = arq('assets/sfx/novos/forjado_martelo');
  // o assobio da flecha e sintetizado (czAssobio): entra no abSom do motor como um 'som' de mentira
  SOM_CINE.cz_assobio = { cloneNode: () => ({ volume: 1, play: () => { czAssobio(); return Promise.resolve(); } }) };
  CZ_IMG_CARROCAS = imgsFilme(['carrocas1', 'carrocas2', 'carrocas3'].map(n => 'assets/cine_cinzas/' + n + '.jpg'));
  CZ_IMG_PORTAO = imgsFilme(['portao1', 'portao2'].map(n => 'assets/cine_cinzas/' + n + '.jpg'));
  FILMES.push({ id: 'carrocas', nome: 'As carroças', c: () => CZ_CENAS_CARROCAS, i: () => CZ_IMG_CARROCAS, visto: () => !!(JOGO.cap3 && JOGO.cap3.carrocas) },
    { id: 'portao_brasaria', nome: 'O portão de Brasária', c: () => CZ_CENAS_PORTAO, i: () => CZ_IMG_PORTAO, visto: () => !!(JOGO.cap3 && JOGO.cap3.parteA2) });
  // brilhos e baús da trilha (o baú das ruínas tem o equipamento de fogo: as Luvas de Brasa)
  TESOUROS.push(
    { id: 'z_ruina', regiao: 'cinzas', tipo: 'bau', x: 1278, y: 582, da: { item: 'luvas_brasa', n: 1, gil: 80 } },
    { id: 'z_cais', regiao: 'cinzas', tipo: 'brilho', x: 640, y: 905, da: { item: 'pocao', n: 2 } },
    { id: 'z_caverna', regiao: 'cinzas', tipo: 'brilho', x: 335, y: 262, da: { item: 'eter', n: 2 } },
    { id: 'z_geiser', regiao: 'cinzas', tipo: 'brilho', x: 1080, y: 628, da: { item: 'fenix', n: 1 } },
    { id: 'z_ponte', regiao: 'cinzas', tipo: 'brilho', x: 872, y: 452, da: { item: 'unguento_frio', n: 2 } },
    { id: 'z_portao', regiao: 'cinzas', tipo: 'brilho', x: 868, y: 262, da: { gil: 120, item: 'hipocao', n: 2 } });
  // o verificador de layout (layout_check.js) desenha a tela direto (sem janela nao ha requestAnimationFrame)
  window.__rio = window.__rio || { desenha: () => desenha() };
  // laboratório (como os outros mapas): cinzas.html#cine_carrocas e #cine_portao só tocam o filme
  const h = location.hash.split('?')[0];
  if (h === '#cine_carrocas') setTimeout(() => tocaFilme(CZ_CENAS_CARROCAS, CZ_IMG_CARROCAS, () => {}), 1500);
  if (h === '#cine_portao') setTimeout(() => tocaFilme(CZ_CENAS_PORTAO, CZ_IMG_PORTAO, () => {}), 1500);
}
