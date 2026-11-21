/* O RIO (Capitulo 3, Parte A: FICHA_CAP3_RIO.md). O Jux pilota o barco Halvard rio abaixo.
   Tudo o que aparece e IMAGEM (regra do usuario); o codigo so anima e da a fisica:
   - barco: folha de balanco (parado) e de remada (andando), 4 direcoes; esteira atras, respingo a cada remada
   - correnteza: puxa rio abaixo, mais forte no meio do rio (segue a linha do meio, tools/cut_rio.py)
   - troncos e placas de gelo BOIAM e descem com a correnteza; o barco EMPURRA (troncos giram); o gelo grande e parede
   - peixes pulando, brilhos na agua, a raposa da margem (anda, para e olha, foge) e passarinhos
   Dados: rio_dados.js (mapa, mascara da agua, folhas recortadas). Sons: assets/sfx/rio_*.  */
const W = 960, H = 540, cv = document.getElementById('c'), ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
const R = window.JUX_RIO, Z = .85;   // camera mais longe (2026-11-21: 'da para afastar um pouco, nao da para ver o mapa')
const rnd = (a, b) => a + Math.random() * (b - a);
const cl = (v, a, b) => Math.max(a, Math.min(b, v));
const img = s => { const i = new Image(); i.src = s; return i; };
const MAPAS = R.trechos.map(tr => img(tr.mapa)), F = {};
let TR = 0;   // trecho atual do rio (0 = o rio de gelo, 1 = o degelo, 2 = as aguas quentes)
for (const k in R.folhas) F[k] = Object.assign({ i: img(R.folhas[k].atlas) }, R.folhas[k]);

// ---------- mascara da agua (onde o barco anda) ----------
let AGUA = null; const AGUAS = [];
R.trechos.forEach((tr, n) => { const m = img(tr.agua); m.onload = () => { const c = document.createElement('canvas'); c.width = R.w; c.height = R.h; const g = c.getContext('2d'); g.drawImage(m, 0, 0);
  const d = g.getImageData(0, 0, R.w, R.h).data, A = new Uint8Array(R.w * R.h); for (let i = 0; i < A.length; i++) A[i] = d[i * 4] > 127 ? 1 : 0; AGUAS[n] = A; if (n === TR) AGUA = A; }; });
const agua = (x, y) => { if (!AGUA) return false; x = Math.round(x); y = Math.round(y); return x >= 0 && y >= 0 && x < R.w && y < R.h && AGUA[y * R.w + x] === 1; };
// o casco: uma elipse de pontos que precisa estar toda na agua
// o casco muda com a direcao: de lado o barco e comprido; de frente/de costas ele e estreito (passa nos canais apertados)
const casco = (rx, ry) => { const c = []; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; c.push([Math.cos(a) * rx, Math.sin(a) * ry + 4]); } return c; };
const CASCO = { lado: casco(52, 20), frente: casco(30, 26) };
const forma = d => (d === 'esquerda' || d === 'direita') ? 'lado' : 'frente';
// o gelo GRANDE (que nao se mexe) conta como parede para o casco (assim o barco desliza nele como na margem)
let FIXOS = [];
const livreB = (x, y) => agua(x, y) && !FIXOS.some(o => ((x - o.x) / o.r) ** 2 + ((y - o.y) / (o.r * .62)) ** 2 < 1);
const barcoCabe = (x, y, d) => CASCO[forma(d || barco.dir)].every(([dx, dy]) => livreB(x + dx, y + dy));

// ---------- correnteza: rio abaixo, seguindo o meio do rio; forte no meio, fraca na beira ----------
function corrente(x, y) {
  const L = R.trechos[TR].linha, i = cl(Math.round(y / R.passo), 1, L.length - 2), mid = L[i];
  let tx = (L[i + 1] - L[i - 1]) / (2 * R.passo), ty = 1; const n = Math.hypot(tx, ty); tx /= n; ty /= n;
  const f = 14 + 34 * Math.max(0, 1 - Math.abs(x - mid) / 300);
  return [tx * f, ty * f];
}

// ---------- sons (livres: assets/musica/CREDITOS.txt) ----------
const SOM = {};
function som(nome, vol, varia) { try { let a = SOM[nome]; if (!a) { a = SOM[nome] = new Audio('assets/sfx/' + nome + '.mp3'); a.onerror = () => { a.morto = true; }; }
  if (a.morto) return; const b = a.cloneNode(); b.volume = cl(vol == null ? .7 : vol, 0, 1); if (varia) b.playbackRate = rnd(.9, 1.12); b.play().catch(() => {}); } catch (e) {} }
const AMB = new Audio('assets/sfx/rio_ambiente.mp3'); AMB.loop = true; AMB.volume = .45;
const MUS = new Audio('assets/musica/musica_rio.mp3'); MUS.loop = true; MUS.volume = .55;
let musLigada = localStorage.getItem('jux_mus_rio') !== '0', comecou = false;
function liga() { if (comecou) return; comecou = true; AMB.play().catch(() => {}); if (musLigada) MUS.play().catch(() => {}); }
const btMus = document.getElementById('musica');
const marcaMus = () => { btMus.textContent = '♫ Música: ' + (musLigada ? 'ligada' : 'desligada'); };
btMus.onclick = e => { e.stopPropagation(); musLigada = !musLigada; localStorage.setItem('jux_mus_rio', musLigada ? '1' : '0'); if (musLigada && comecou) MUS.play().catch(() => {}); else MUS.pause(); marcaMus(); btMus.blur(); };
marcaMus();
document.getElementById('voltar').onclick = () => { location.href = 'vila.html'; };

// ---------- o barco ----------
const DIR = { baixo: 0, esquerda: 1, direita: 2, cima: 3 };
const barco = { x: 640, y: 372, vx: 0, vy: 0, dir: 'baixo', rema: 0, remaQ: -1, balanco: 0 };
const ACEL = 260, VMAX = 155, ATRITO = 1.6;
const teclas = {};
addEventListener('keydown', e => { const k = e.key.toLowerCase(); teclas[k] = true; liga(); if (k === 'enter' || k === 'e' || k === ' ') usa(); if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault(); });
addEventListener('keyup', e => { teclas[e.key.toLowerCase()] = false; });
addEventListener('pointerdown', () => liga());

// ---------- coisas que boiam (troncos e gelo); o gelo GRANDE nao sai do lugar ----------
// tipo: [linha da folha 'flut', raio (colisao), massa (0 = fixo)]
const TIPO = { tronco: [0, 0, 1], gelo_p: [2, 34, 1.6], gelo_m: [3, 48, 2.6], gelo_g: [4, 66, 0] };
// cada trecho: o que boia, os baus, o cais, se tem a raposa, quais peixes pulam, de onde volta a boiar o que desceu
const TRECHOS = [
  { boia: [['tronco', 575, 425, 0], ['tronco', 1030, 690, .1], ['gelo_m', 680, 330], ['gelo_g', 1052, 560], ['gelo_p', 735, 605], ['gelo_g', 515, 860], ['gelo_p', 385, 782], ['gelo_p', 758, 1010]],
    baus: [{ id: 'rio_bau1', x: 876, y: 468, itens: { hipocao: 2 }, txt: '2 Hi-Poções' }, { id: 'rio_bau2', x: 640, y: 690, itens: { eter: 2 }, gil: 150, txt: '2 Éteres e 150 gil' }],
    cais: { x: 560, y: 345, tipo: 'vila' }, raposa: true, peixes: [0, 1], volta: [560, 900, 300, 360], inicio: [640, 372] },
  { boia: [],   // trecho 2 limpo, sem troncos nem gelo (pedido do usuario: 'deixa mais limpo, preenche com visual')
    baus: [{ id: 'rio_bau3', x: 858, y: 640, itens: { pocao: 3 }, gil: 200, txt: '3 Poções e 200 gil' }],
    cais: { x: 575, y: 585, tipo: 'meio' }, raposa: false, peixes: [0], volta: [680, 840, 30, 90], inicio: [760, 90] },
];
// LUTAS ALEATORIAS no barco (FICHA_CAP3_RIO.md): os bichos do rio aparecem depois de uns 1400 a 2600 px navegados
// (uns 15 a 30 s remando); perto do cais e logo depois de chegar/lutar nao tem luta. Repelente vale (1 passo = 16 px).
const ENC_RIO = [
  { nv: [13, 15], grupos: [[['piranha', 'piranha', 'piranha'], 4], [['agua_viva'], 3], [['lontra'], 2], [['piranha', 'agua_viva'], 2], [['agua_viva', 'agua_viva'], 1], [['lontra', 'piranha'], 1]] },
  { nv: [14, 16], grupos: [[['caranguejo'], 3], [['caranguejo', 'piranha'], 2], [['lontra', 'agua_viva'], 2], [['agua_viva', 'agua_viva'], 2], [['piranha', 'piranha', 'piranha'], 2], [['caranguejo', 'lontra'], 1]] },
];
let encDist = 0, encAlvo = 1800, encPasso16 = 0, lutando = null;
const sorteiaEnc = () => 1400 + Math.random() * 1200;
function contaEncontro(andou) {
  if (lutando || troca) return;
  const E = ENC_RIO[TR]; if (!E) return;
  encPasso16 += andou; while (encPasso16 >= 16) { encPasso16 -= 16; if ((JOGO.repelente || 0) > 0) { JOGO.repelente--; if (!JOGO.repelente) avisa('O Repelente acabou.', 3); } }
  if ((JOGO.repelente || 0) > 0) return;
  if (CAIS && Math.hypot(barco.x - CAIS.x, barco.y - CAIS.y) < 230) return;   // perto do cais e seguro
  encDist += andou; if (encDist < encAlvo) return;
  encDist = 0; encAlvo = sorteiaEnc();
  let r = Math.random() * E.grupos.reduce((a, g) => a + g[1], 0), tipos = E.grupos[0][0]; for (const g of E.grupos) { r -= g[1]; if (r <= 0) { tipos = g[0]; break; } }
  const nv = Math.round(E.nv[0] + Math.random() * (E.nv[1] - E.nv[0]));
  guardaRio(); lutando = { t: 0 }; som('rio_splash_grande', .8); MUS.pause();
  try { localStorage.setItem('jux_encontro', JSON.stringify({ regiao: 'rio', tipos, nv, volta: 'rio.html' })); } catch (e) {}
  setTimeout(() => { AMB.pause(); location.href = 'batalha.html'; }, 1100);
}
let BOIA = [], BAUS = [], CAIS = null, CONF = TRECHOS[0];
function montaTrecho(n) {
  TR = n; CONF = TRECHOS[n]; AGUA = AGUAS[n] || null;
  BOIA = CONF.boia.map(([t, x, y, a]) => ({ t, x, y, x0: x, y0: y, vx: 0, vy: 0, ang: a || 0, va: 0, fase: rnd(0, 4), r: TIPO[t][1], m: TIPO[t][2] }));
  FIXOS = BOIA.filter(o => !o.m); BAUS = CONF.baus; CAIS = CONF.cais; PEIXE.length = 0; FX.length = 0;
}
const TRONCO_L = 66, TRONCO_R = 20;   // meio-comprimento e raio do tronco (capsula)
function pontaTronco(o) { const c = Math.cos(o.ang), s = Math.sin(o.ang); return [o.x - c * TRONCO_L, o.y - s * TRONCO_L, o.x + c * TRONCO_L, o.y + s * TRONCO_L]; }
function maisPerto(o, px, py) {   // ponto do objeto mais perto de (px,py) e o raio ali
  if (o.t !== 'tronco') return [o.x, o.y, o.r];
  const [ax, ay, bx, by] = pontaTronco(o), dx = bx - ax, dy = by - ay, t = cl(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1);
  return [ax + dx * t, ay + dy * t, TRONCO_R];
}
const cabeObj = (o, x, y) => { if (o.t !== 'tronco') { for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283; if (!agua(x + Math.cos(a) * o.r * .75, y + Math.sin(a) * o.r * .45 + 4)) return false; } return true; }
  const c = Math.cos(o.ang), s = Math.sin(o.ang);   // o tronco inteiro (ao longo dele e dos lados) tem que estar na agua
  for (const f of [-1, -.6, -.3, 0, .3, .6, 1]) for (const l of [-1, 1]) if (!agua(x + c * TRONCO_L * f - s * TRONCO_R * l, y + s * TRONCO_L * f + c * TRONCO_R * l + 4)) return false; return true; };

// ---------- efeitos ----------
const FX = [];   // {lin, x, y, t, dur, esc, ang, al}
const fx = (lin, x, y, dur, esc, ang, al) => FX.push({ lin, x, y, t: 0, dur, esc: esc || 1, ang: ang || 0, al: al == null ? 1 : al });
const BRILHO = []; for (let k = 0; k < 7; k++) BRILHO.push({ x: 0, y: 0, t: rnd(0, 1), dur: rnd(.8, 1.3) });
const PEIXE = []; let peixeT = 2;
const AVES = []; let avesT = 6;
const raposa = { x: 120, y: 842, dir: 1, est: 'anda', t: 0, q: 0, sumida: 0, a: 40, b: 330 };

// ---------- baus nas ilhotas ----------
const pego = id => typeof JOGO === 'object' && (JOGO.pegos || []).includes(id);
let aviso = null;   // {txt, t}
const avisa = (txt, t) => { aviso = { txt, t: t || 3 }; };
let perto = null;   // o que da para usar agora
function usa() {
  if (!perto) return;
  if (perto.tipo === 'bau') { const b = perto.b; if (pego(b.id)) return; JOGO.pegos = JOGO.pegos || []; JOGO.pegos.push(b.id);
    for (const k in b.itens) daItem(k, b.itens[k]); if (b.gil) JOGO.gil = (JOGO.gil || 0) + b.gil; salvaJogo(); som('novos/ui_vez', .7); avisa('Baú da ilhota: ' + b.txt + '!'); }
  else if (perto.tipo === 'cais' && CAIS.tipo === 'vila') { guardaRio(); location.href = 'vila.html'; }
  else if (perto.tipo === 'cais') { guardaRio(); som('novos/ui_vez', .6); avisa('Vocês descansaram no cais do meio. Jogo salvo! (a pescadora Marta chega em breve)', 4); }
}

// ---------- passo ----------
let t = 0, fimAvisado = false, troca = null;
function guardaRio() { if (typeof JOGO !== 'object') return; JOGO.rio = { trecho: TR, x: Math.round(barco.x), y: Math.round(barco.y) }; salvaJogo(); }
function entraTrecho(n, lado) {   // poe o barco na entrada do trecho n (em cima ou embaixo), no ponto de agua mais perto do meio
  montaTrecho(n); const y = lado === 'cima' ? 70 : R.h - 92;
  let melhor = null; for (let x = 0; x < R.w; x += 6) { const d = Math.abs(x - R.trechos[n].linha[Math.round(y / R.passo)]); if (barcoCabe(x, y, 'baixo') && (!melhor || d < melhor[1])) melhor = [x, d]; }
  barco.x = melhor ? melhor[0] : R.w / 2; barco.y = y; barco.vx = 0; barco.vy = lado === 'cima' ? 40 : -30; barco.dir = lado === 'cima' ? 'baixo' : 'cima';
  cam.x = barco.x; cam.y = barco.y; fimAvisado = false; guardaRio();
}
function passo(dt) {
  t += dt;
  if (lutando) return;
  if (troca) { troca.t += dt; if (troca.t >= .45 && !troca.feito) { troca.feito = true; if (AGUAS[troca.para]) entraTrecho(troca.para, troca.entra); } if (troca.t >= .9) troca = null; else { cam.x += 0; return; } }
  // controle
  let ix = 0, iy = 0;
  if (teclas.arrowleft || teclas.a) ix--; if (teclas.arrowright || teclas.d) ix++;
  if (teclas.arrowup || teclas.w) iy--; if (teclas.arrowdown || teclas.s) iy++;
  const remando = !!(ix || iy);
  if (remando) {
    const n = Math.hypot(ix, iy); ix /= n; iy /= n;
    const nd = Math.abs(ix) > Math.abs(iy) ? (ix < 0 ? 'esquerda' : 'direita') : (iy < 0 ? 'cima' : 'baixo');
    if (nd !== barco.dir && barcoCabe(barco.x, barco.y, nd)) barco.dir = nd;   // so vira se o barco cabe virado ali
    barco.rema += dt / .9;   // uma remada a cada 0,9 s
    const q = Math.floor(barco.rema * 6) % 6, forca = 1 + .22 * Math.sin(barco.rema * Math.PI * 2 - 1);   // empurra o tempo todo, um pouco mais na puxada (sem tranco)
    barco.vx += ix * ACEL * forca * dt; barco.vy += iy * ACEL * forca * dt;
    if (q === 1 && barco.remaQ !== 1) {   // a pa entra na agua: respingo e som
      const P = { baixo: [-34, 30], esquerda: [-6, 34], direita: [6, 34], cima: [36, 22] }[barco.dir];
      fx(1, barco.x + P[0], barco.y + P[1], .55, .55); som(Math.random() < .5 ? 'rio_remo_1' : 'rio_remo_2', .5, true);
    }
    barco.remaQ = q;
  } else { barco.remaQ = -1; }
  const sp = Math.hypot(barco.vx, barco.vy); if (sp > VMAX) { barco.vx *= VMAX / sp; barco.vy *= VMAX / sp; }
  const k = Math.exp(-ATRITO * dt); barco.vx *= k; barco.vy *= k;
  const [cx, cy] = corrente(barco.x, barco.y);
  let nx = barco.x + (barco.vx + cx) * dt, ny = barco.y + (barco.vy + cy) * dt;
  if (!troca && ny > R.h - 62 && TR + 1 < TRECHOS.length && R.trechos[TR + 1]) troca = { t: 0, para: TR + 1, entra: 'cima' };
  else if (!troca && ny < 38 && TR > 0) troca = { t: 0, para: TR - 1, entra: 'baixo' };
  if (!troca && !fimAvisado && ny > R.h - 62 && !R.trechos[TR + 1]) { fimAvisado = true; avisa('Fim do trecho ' + (TR + 1) + '. O próximo trecho do rio vem na próxima parte!', 5); }
  ny = cl(ny, 30, R.h - 50);
  if (barcoCabe(nx, ny)) { barco.x = nx; barco.y = ny; }
  else {   // bateu na margem/pedra: acha o lado da parede (pontos do casco em terra) e DESLIZA ao longo dela, sem travar
    const forte = Math.hypot(barco.vx, barco.vy);
    let wx = 0, wy = 0; for (const [dx, dy] of CASCO[forma(barco.dir)]) if (!livreB(nx + dx, ny + dy)) { wx += dx; wy += dy; }
    const wn = Math.hypot(wx, wy) || 1; wx /= wn; wy /= wn;   // aponta para a parede
    const mx = nx - barco.x, my = ny - barco.y, contra = mx * wx + my * wy;
    const sx = barco.x + mx - wx * Math.max(0, contra) - wx * .6, sy = barco.y + my - wy * Math.max(0, contra) - wy * .6;   // tira o pedaco que entra na parede e afasta um pouquinho
    if (barcoCabe(sx, sy)) { barco.x = sx; barco.y = sy; }
    else if (barcoCabe(barco.x - wx * .8, barco.y - wy * .8)) { barco.x -= wx * .8; barco.y -= wy * .8; }
    const vc = barco.vx * wx + barco.vy * wy; if (vc > 0) { barco.vx -= wx * vc * 1.25; barco.vy -= wy * vc * 1.25; }
    if (forte > 55 && t - (barco.bateu || 0) > .5) { barco.bateu = t; fx(2, nx, ny + 10, .5, .45); som('rio_splash_grande', cl(forte / 220, .15, .7)); }
  }
  { const andou = Math.hypot(barco.x - (barco.ex == null ? barco.x : barco.ex), barco.y - (barco.ey == null ? barco.y : barco.ey)); barco.ex = barco.x; barco.ey = barco.y; if (andou < 40) contaEncontro(andou); }
  // coisas que boiam: descem com a correnteza, deslizam nas margens e nas pedras (nunca encalham de vez)
  for (const o of BOIA) {
    o.fase += dt;
    if (!o.ok) { o.ok = true; if (!cabeObj(o, o.x, o.y)) achaLugar(o); }   // comeca num lugar onde cabe inteiro na agua
    if (!o.m) continue;
    if (o.sub > 0) { o.sub -= dt; if (o.sub <= 0 && encostaBarco(o)) o.sub = .3; }   // embaixo da agua: so volta quando o barco saiu de cima
    const [fx_, fy_] = corrente(o.x, o.y), kk = 1 - Math.exp(-(o.t === 'tronco' ? .9 : .7) * dt);
    o.vx += (fx_ * .85 - o.vx) * kk; o.vy += (fy_ * .85 - o.vy) * kk; o.va *= Math.exp(-1.6 * dt);
    if (o.t === 'tronco') { o.va -= o.ang * .6 * dt; if (Math.abs(o.ang) > .7) { o.ang = Math.sign(o.ang) * .7; o.va *= -.2; } }   // gira so um pouco e volta a deitar
    moveObj(o, o.vx * dt, o.vy * dt, o.va * dt);
    if (o.y > R.h + 40 || o.y > R.h - 40 && !cabeObj(o, o.x, o.y + 20)) volta(o);
    const mv = Math.hypot(o.x - (o.px || o.x), o.y - (o.py || o.y)); o.px = o.x; o.py = o.y; o.par = mv < .05 ? (o.par || 0) + dt : 0;
    if (o.par > 12 && !naTela(o.x, o.y, 90)) volta(o);   // parado ha muito tempo fora da tela: volta a boiar la em cima
  }
  // barco x coisas que boiam: o barco EMPURRA (o objeto anda junto e desliza); se o objeto nao tem para onde ir, ele MERGULHA e o barco passa
  for (const o of BOIA) {
    if (o.sub > 0) continue;
    const [px, py, r] = maisPerto(o, barco.x, barco.y + 4);
    let dx = barco.x - px, dy = (barco.y + 4 - py) / .62;   // a vista e achatada: distancia na "agua"
    const d = Math.hypot(dx, dy), min = (forma(barco.dir) === 'lado' ? 46 : 32) + r;
    if (d >= min || d < .01) { o.preso = 0; continue; }
    dx /= d; dy /= d; const pen = min - d, nyS = dy * .62;
    const rel = (barco.vx - o.vx) * -dx + (barco.vy - o.vy) * -nyS;   // velocidade de choque (barco indo contra o objeto)
    if (!o.m) {   // gelo grande: e parede (no barcoCabe); aqui so o barulho da batida
      if (rel > 55 && t - (o.som || 0) > .6) { o.som = t; som('rio_gelo_' + (1 + (Math.random() * 3 | 0)), cl(rel / 260, .12, .5)); fx(2, px, py, .5, .35); }
      continue;
    }
    // o objeto leva quase todo o empurrao (desliza na margem se precisar); o barco so desacelera um pouco
    const ax = o.x, ay = o.y;
    moveObj(o, -dx * pen * .9, -nyS * pen * .9, 0);
    const andou = Math.hypot(o.x - ax, o.y - ay);
    if (rel > 0) {
      const leve = o.t === 'tronco' ? 1 : o.t === 'gelo_p' ? .75 : .55;
      o.vx -= dx * rel * leve; o.vy -= nyS * rel * leve;   // sai andando para o lado, suave
      barco.vx += dx * rel * (1 - leve) * .7; barco.vy += nyS * rel * (1 - leve) * .7;
      if (o.t === 'tronco') { const off = (px - o.x) * Math.cos(o.ang) + (py - o.y) * Math.sin(o.ang); o.va += cl(-off * (dx * Math.sin(o.ang) - nyS * Math.cos(o.ang)) * rel * .00035, -.9, .9); }
      if (rel > 50 && t - (o.som || 0) > .5) { o.som = t; som(o.t === 'tronco' ? 'rio_madeira' : 'rio_gelo_' + (1 + (Math.random() * 3 | 0)), cl(rel / 240, .1, .5), true); fx(2, (px + barco.x) / 2, (py + barco.y) / 2 + 6, .45, .28); }
      else if (rel > 12 && t - (o.somE || 0) > 1.1) { o.somE = t; som('rio_empurra', .22, true); }
    }
    // nao saiu do lugar e o jogador continua remando contra: preso entre o objeto e a margem -> o objeto mergulha e o barco passa
    o.preso = andou < pen * .3 && remando ? (o.preso || 0) + dt : 0;
    if (o.preso > .45) mergulha(o);
  }
  // coisa x coisa (troncos e gelo se empurram e deslizam um no outro)
  for (let i = 0; i < BOIA.length; i++) for (let j = i + 1; j < BOIA.length; j++) {
    const a = BOIA[i], b = BOIA[j]; if ((!a.m && !b.m) || a.sub > 0 || b.sub > 0) continue;
    const [px, py, ra] = maisPerto(a, b.x, b.y), [qx, qy, rb] = maisPerto(b, px, py);
    let dx = qx - px, dy = (qy - py) / .62; const d = Math.hypot(dx, dy), min = ra + rb; if (d >= min || d < .01) continue;
    dx /= d; dy /= d; const pen = (min - d) * .5;
    if (a.m && b.m) { moveObj(a, -dx * pen, -dy * .62 * pen, 0); moveObj(b, dx * pen, dy * .62 * pen, 0); }
    else if (a.m) moveObj(a, -dx * pen * 2, -dy * .62 * pen * 2, 0); else moveObj(b, dx * pen * 2, dy * .62 * pen * 2, 0);
    const rel = (a.vx - b.vx) * dx + (a.vy - b.vy) * dy * .62; if (rel > 0) { const ma = a.m || 1e9, mb2 = b.m || 1e9, jj = rel / (1 / ma + 1 / mb2);
      a.vx -= dx * jj / ma; a.vy -= dy * .62 * jj / ma; b.vx += dx * jj / mb2; b.vy += dy * .62 * jj / mb2; }
  }
  // esteira: espuma e marolinhas saindo da popa (fica bonita em qualquer direcao)
  { const sp = Math.hypot(barco.vx, barco.vy); barco.espuma = (barco.espuma || 0) + dt;
    if (sp > 28 && barco.espuma > .06) { barco.espuma = 0; const a = Math.atan2(barco.vy, barco.vx), lado_ = forma(barco.dir) === 'lado', atras = lado_ ? 62 : 8;   // de frente/de costas a espuma sai dos lados do casco (atras ela ficaria escondida pela vela)
      const bx = barco.x - Math.cos(a) * atras, by = barco.y + 12 - Math.sin(a) * atras * .62, lx = -Math.sin(a), ly = Math.cos(a) * .62;
      for (const lado of [-1, 1]) { const e = lado_ ? rnd(8, 20) : rnd(30, 40); FX.push({ lin: 3, x: bx + lx * lado * e, y: by + ly * lado * e, t: 0, dur: rnd(.9, 1.3), esc: rnd(.26, .36), ang: 0, al: Math.min(.95, sp / 115), some: true, vx: lx * lado * 14 - Math.cos(a) * 8, vy: ly * lado * 14 - Math.sin(a) * 5 }); } } }
  // esteira, brilhos, peixes, raposa, passaros
  for (const e of FX) { e.t += dt; if (e.vx) { e.x += e.vx * dt; e.y += e.vy * dt; } } for (let i = FX.length - 1; i >= 0; i--) if (FX[i].t >= FX[i].dur) FX.splice(i, 1);
  for (const b of BRILHO) { b.t += dt / b.dur; if (b.t >= 1 || !b.x) { b.t = 0; b.dur = rnd(.8, 1.4); const p = pontoAgua(60); if (p) { b.x = p[0]; b.y = p[1]; } } }
  peixeT -= dt; if (peixeT <= 0) { peixeT = rnd(1.4, 3.6); const p = pontoAgua(130); if (p) PEIXE.push({ x: p[0], y: p[1], t: 0, tipo: CONF.peixes[(Math.random() * CONF.peixes.length) | 0], flip: Math.random() < .5 }); }
  for (let i = PEIXE.length - 1; i >= 0; i--) { const p = PEIXE[i]; const q0 = Math.floor(p.t / .11); p.t += dt; const q = Math.floor(p.t / .11);
    if (q0 < 6 && q >= 6) { fx(3, p.x + (p.flip ? -20 : 20), p.y + 6, .9, .45); const d = Math.hypot(p.x - barco.x, p.y - barco.y); som('rio_splash_peq', cl(.55 - d / 900, .05, .5), true); }
    if (q >= 8) PEIXE.splice(i, 1); }
  if (CONF.raposa) passoRaposa(dt);
  passoEnfeites(dt);
  avesT -= dt; if (avesT <= 0) { avesT = rnd(9, 17); const dir = Math.random() < .5 ? 1 : -1, y0 = cam.y - H / (2 * Z) + rnd(40, 200), x0 = dir > 0 ? cam.x - W / (2 * Z) - 40 : cam.x + W / (2 * Z) + 40;
    for (let k = 0; k < 3; k++) AVES.push({ x: x0 - dir * k * rnd(30, 55), y: y0 + rnd(-25, 25), dir, f: rnd(0, 6), v: rnd(105, 130) }); if (Math.random() < .7) som('rio_passaros', .35); }
  for (let i = AVES.length - 1; i >= 0; i--) { const a = AVES[i]; a.x += a.dir * a.v * dt; a.y += Math.sin(t * 2 + i) * 6 * dt; a.f += dt * 11; if (Math.abs(a.x - cam.x) > W / Z) AVES.splice(i, 1); }
  // o que da para usar (bau, cais)
  perto = null;
  for (const b of BAUS) if (Math.hypot(b.x - barco.x, (b.y - barco.y) / .7) < 175) perto = { tipo: 'bau', b };   // encostar o barco na ilhota
  if (!perto && Math.hypot(CAIS.x - barco.x, CAIS.y - barco.y) < 95) perto = { tipo: 'cais' };
  if (aviso) { aviso.t -= dt; if (aviso.t <= 0) aviso = null; }
  // camera
  cam.x += (barco.x - cam.x) * Math.min(1, dt * 4); cam.y += (barco.y + 30 - cam.y) * Math.min(1, dt * 4);
  cam.x = cl(cam.x, W / (2 * Z), R.w - W / (2 * Z)); cam.y = cl(cam.y, H / (2 * Z), R.h - H / (2 * Z));
}
// move o objeto; se bater na margem, DESLIZA ao longo dela (acha o lado da parede pelos pontos fora da agua)
function moveObj(o, mx, my, ma) {
  const a0 = o.ang; o.ang += ma;
  if (cabeObj(o, o.x + mx, o.y + my)) { o.x += mx; o.y += my; return true; }
  o.ang = a0;
  if (ma && cabeObj(o, o.x + mx, o.y + my)) { o.x += mx; o.y += my; o.va *= -.3; return true; }
  const n = normalParede(o, o.x + mx, o.y + my);
  if (n) { const c = mx * n[0] + my * n[1]; const sx = mx - n[0] * Math.max(0, c) - n[0] * .3, sy = my - n[1] * Math.max(0, c) - n[1] * .3;
    if (cabeObj(o, o.x + sx, o.y + sy)) { o.x += sx; o.y += sy; const vc = o.vx * n[0] + o.vy * n[1]; if (vc > 0) { o.vx -= n[0] * vc * 1.2; o.vy -= n[1] * vc * 1.2; } return true; } }
  if (cabeObj(o, o.x + mx, o.y)) { o.x += mx; o.vy *= .5; return true; }
  if (cabeObj(o, o.x, o.y + my)) { o.y += my; o.vx *= .5; return true; }
  o.vx *= .5; o.vy *= .5; return false;
}
function normalParede(o, x, y) {   // direcao (unitaria) de onde esta a parede em volta do objeto
  let wx = 0, wy = 0; const pts = [];
  if (o.t === 'tronco') { const c = Math.cos(o.ang), s = Math.sin(o.ang); for (const f of [-1, -.5, 0, .5, 1]) for (const l of [-1, 1]) pts.push([c * TRONCO_L * f - s * TRONCO_R * l, s * TRONCO_L * f + c * TRONCO_R * l + 4]); }
  else for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283; pts.push([Math.cos(a) * o.r * .75, Math.sin(a) * o.r * .45 + 4]); }
  for (const [dx, dy] of pts) if (!agua(x + dx, y + dy)) { wx += dx; wy += dy; }
  const n = Math.hypot(wx, wy); return n ? [wx / n, wy / n] : null;
}
function encostaBarco(o) { const [px, py, r] = maisPerto(o, barco.x, barco.y + 4); return Math.hypot(barco.x - px, (barco.y + 4 - py) / .62) < (forma(barco.dir) === 'lado' ? 46 : 32) + r + 6; }
function mergulha(o) { if (o.sub > 0) return; o.sub = 1.6; o.preso = 0; fx(2, o.x, o.y, .5, .4); fx(3, o.x, o.y + 6, .9, .5); som('rio_splash_peq', .45, true); }
function achaLugar(o) { for (let r = 4; r < 160; r += 4) for (let k = 0; k < 16; k++) { const x = o.x + Math.cos(k / 16 * 6.283) * r, y = o.y + Math.sin(k / 16 * 6.283) * r * .7; if (cabeObj(o, x, y)) { o.x = x; o.y = y; return; } } }
const naTela = (x, y, m) => Math.abs(x - cam.x) < W / (2 * Z) + (m || 0) && Math.abs(y - cam.y) < H / (2 * Z) + (m || 0);
function afunda(o) { fx(2, o.x, o.y, .6, .6); fx(3, o.x, o.y + 6, 1, .7); som('rio_splash_grande', .5); o.contato = 0; volta(o); }
function volta(o) {   // desceu o rio todo: volta a boiar la em cima (o rio nunca fica vazio)
  const V = CONF.volta; for (let k = 0; k < 30; k++) { const x = rnd(V[0], V[1]), y = rnd(V[2], V[3]); if (cabeObj(o, x, y) && Math.hypot(x - barco.x, y - barco.y) > 160) { o.x = x; o.y = y; o.vx = o.vy = o.va = 0; o.par = 0; o.ang = 0; return; } }
  o.x = o.x0; o.y = o.y0; o.vx = o.vy = 0;
}
function pontoAgua(longe) {   // um ponto de agua visivel na tela, longe do barco
  for (let k = 0; k < 25; k++) { const x = cam.x + rnd(-W / (2 * Z) + 30, W / (2 * Z) - 30), y = cam.y + rnd(-H / (2 * Z) + 30, H / (2 * Z) - 30);
    if (agua(x, y) && agua(x - 25, y) && agua(x + 25, y) && Math.hypot(x - barco.x, y - barco.y) > longe && !BOIA.some(o => Math.hypot(o.x - x, o.y - y) < 80)) return [x, y]; }
  return null;
}
function passoRaposa(dt) {
  const r = raposa; r.t += dt;
  if (r.est === 'sumida') { if ((r.sumida -= dt) <= 0) { r.est = 'anda'; r.x = r.a; r.dir = 1; r.t = 0; } return; }
  const d = Math.hypot(barco.x - r.x, barco.y - r.y);
  if (r.est !== 'corre' && d < 175) { r.est = 'corre'; r.t = 0; r.dir = barco.x > r.x ? -1 : 1; }
  if (r.est === 'anda') { r.x += r.dir * 34 * dt; if (r.x > r.b) r.dir = -1; if (r.x < r.a) r.dir = 1; if (d < 330) { r.est = 'olha'; r.t = 0; r.dir = barco.x > r.x ? 1 : -1; } }
  else if (r.est === 'olha') { r.dir = barco.x > r.x ? 1 : -1; if (d > 420) { r.est = 'anda'; r.t = 0; } }
  else if (r.est === 'corre') { r.x += r.dir * 150 * dt; if (r.x < -60 || r.x > 420) { r.est = 'sumida'; r.sumida = 18; } }
}

// ---------- BICHOS DE ENFEITE do trecho 2 (o degelo): patos, cervo, garca, sapo, libelulas e borboletas, a cachoeira ----------
// (pedido do usuario: 'deixa o trecho 2 limpo e enriquece com visual'). Cada um tem um jeito de reagir quando o barco chega perto.
const CACH = new Audio('assets/sfx/novos/cachoeira.mp3'); CACH.loop = true; CACH.volume = 0;
const ENF = { patos: null, cervo: null, garca: null, sapo: null, insetos: [] };
function montaEnfeites() {
  ENF.patos = { cx: 700, cy: 850, rx: 95, ry: 40, a: 0, est: 'nada', t: 0, mae: { x: 0, y: 0, vx: 0 }, filhos: [0, 1, 2].map(i => ({ x: 0, y: 0, vx: 0, foge: 0 })) };
  ENF.cervo = { x: 190, y: 702, x0: 190, dir: 1, est: 'bebe', t: 0 };
  ENF.garca = { x: 1236, y: 560, x0: 1236, y0: 560, est: 'espreita', t: 0, prox: rnd(5, 9) };
  ENF.sapo = { x: 402, y: 708, x0: 402, y0: 708, est: 'parado', t: 0, prox: rnd(4, 8) };
  ENF.insetos = [
    { lin: 0, cx: 560, cy: 470, r: 120, v: .9, f: 0 }, { lin: 0, cx: 840, cy: 300, r: 140, v: .7, f: 2 },
    { lin: 1, cx: 140, cy: 660, r: 50, v: .5, f: 1 }, { lin: 2, cx: 300, cy: 930, r: 45, v: .6, f: 3 },
    { lin: 1, cx: 1330, cy: 880, r: 55, v: .45, f: 4 }, { lin: 2, cx: 1370, cy: 640, r: 40, v: .55, f: 0 },
  ].map(o => Object.assign(o, { a: rnd(0, 6.28), x: o.cx, y: o.cy, vx: 0 }));
}
const pertoB = (x, y) => Math.hypot(barco.x - x, (barco.y - y) / .8);
function passoEnfeites(dt) {
  if (TR !== 1) { CACH.volume = 0; return; }
  if (!ENF.patos) montaEnfeites();
  if (comecou && CACH.paused) CACH.play().catch(() => {});
  CACH.volume = cl(.55 - Math.hypot(barco.x - 1135, barco.y - 420) / 1100, 0, .55);
  // patos: a pata nada em volta e os patinhos atras; o barco perto -> ela voa (quac) e os patinhos se espalham; voltam depois
  { const P = ENF.patos; P.t += dt;
    if (P.est === 'nada') { P.a += dt * .32; const x = P.cx + Math.cos(P.a) * P.rx, y = P.cy + Math.sin(P.a) * P.ry; P.mae.vx = x - P.mae.x; P.mae.x = x; P.mae.y = y;
      P.filhos.forEach((f, i) => { const b = P.a - .42 * (i + 1), fx_ = P.cx + Math.cos(b) * P.rx, fy_ = P.cy + Math.sin(b) * P.ry; f.vx = fx_ - f.x; f.x = fx_; f.y = fy_; });
      if (pertoB(P.mae.x, P.mae.y) < 240) { P.est = 'voa'; P.t = 0; som('novos/pato', .6); } }
    else if (P.est === 'voa') { P.mae.x -= 150 * dt; P.mae.y -= 70 * dt; P.mae.vx = -1;
      P.filhos.forEach((f, i) => { const ang = Math.atan2(f.y - barco.y, f.x - barco.x); if (P.t < 2.5) { f.x += Math.cos(ang) * 70 * dt; f.y += Math.sin(ang) * 40 * dt; f.vx = Math.cos(ang); } });
      if (P.t > 25 && pertoB(P.cx, P.cy) > 420) { P.est = 'nada'; P.t = 0; } } }
  // cervo: bebe na beira; barco perto -> levanta a cabeca e olha; mais perto -> foge para o mato; volta depois
  { const C = ENF.cervo; C.t += dt; const d = pertoB(C.x, C.y);
    if (C.est === 'bebe' && d < 360) { C.est = 'alerta'; C.t = 0; }
    else if (C.est === 'alerta' && d < 230) { C.est = 'corre'; C.t = 0; som('novos/cervo', .55); }
    else if (C.est === 'alerta' && d > 460) { C.est = 'bebe'; C.t = 0; }
    else if (C.est === 'corre') { C.x -= 170 * dt; if (C.x < -120) { C.est = 'sumido'; C.t = 0; } }
    else if (C.est === 'sumido' && C.t > 25 && d > 500) { C.est = 'bebe'; C.t = 0; C.x = C.x0; } }
  // garca: espreita, de vez em quando pesca um peixinho; barco perto -> voa embora; volta depois
  { const G = ENF.garca; G.t += dt; const d = pertoB(G.x, G.y);
    if ((G.est === 'espreita' || G.est === 'pesca') && d < 250) { G.est = 'voa'; G.t = 0; som('novos/garca', .5); }
    else if (G.est === 'espreita' && G.t > G.prox) { G.est = 'pesca'; G.t = 0; }
    else if (G.est === 'pesca' && G.t > 6 / 5) { G.est = 'espreita'; G.t = 0; G.prox = rnd(6, 11); }
    else if (G.est === 'voa') { if (G.t > .5) { G.x += 140 * dt; G.y -= 75 * dt; } if (G.y < -150) { G.est = 'sumida'; G.t = 0; } }
    else if (G.est === 'sumida' && G.t > 30 && d > 520) { G.est = 'espreita'; G.t = 0; G.x = G.x0; G.y = G.y0; }
    if (G.est === 'pesca' && G.t > .2 && !G.pegou) { G.pegou = true; fx(1, G.x + 40, G.y + 6, .5, .3); } if (G.est !== 'pesca') G.pegou = false; }
  // sapo: coaxa (som quando o barco esta por perto), pega mosca; barco perto -> pula na agua; volta depois
  { const S = ENF.sapo; S.t += dt; const d = pertoB(S.x, S.y);
    if ((S.est === 'parado' || S.est === 'mosca') && d < 175) { S.est = 'pula'; S.t = 0; }
    else if (S.est === 'parado' && S.t > S.prox) { S.est = 'mosca'; S.t = 0; }
    else if (S.est === 'mosca' && S.t > 1) { S.est = 'parado'; S.t = 0; S.prox = rnd(5, 9); }
    else if (S.est === 'pula') { S.x += 60 * dt; if (S.t > .75) { S.est = 'sumido'; S.t = 0; fx(3, S.x + 10, S.y + 8, .9, .3); som('rio_splash_peq', .35, true); } }
    else if (S.est === 'sumido' && S.t > 15 && d > 400) { S.est = 'parado'; S.t = 0; S.x = S.x0; }
    if (S.est === 'parado') { const q = Math.floor(S.t * 3) % 6; if (q === 3 && S.ultQ !== 3 && d < 650 && Math.random() < .5) som('novos/sapo', cl(.4 - d / 1800, .05, .35)); S.ultQ = q; } }
  // libelulas e borboletas: voam em volta de um ponto (as libelulas rasantes na agua, as borboletas nas flores)
  for (const o of ENF.insetos) { o.a += dt * o.v; o.f += dt * (o.lin === 0 ? 18 : 8);
    const x = o.cx + Math.cos(o.a) * o.r + Math.sin(o.a * 2.3) * o.r * .3, y = o.cy + Math.sin(o.a * 1.4) * o.r * .45; o.vx = x - o.x; o.x = x; o.y = y; }
}
function desenhosEnfeites() {   // [y, desenha] para ordenar por profundidade com o barco
  if (TR !== 1 || !ENF.patos) return [];
  const L = [], P = ENF.patos;
  L.push([P.mae.y, () => { if (P.est === 'voa') { const q = P.t < .45 ? Math.min(2, Math.floor(P.t / .15)) : 3 + Math.floor(P.t * 9) % 3; quadro(F.patos, 2, q, P.mae.x, P.mae.y - 18, 1, true); }
    else quadro(F.patos, 0, Math.floor(P.t * 5) % 6, P.mae.x, P.mae.y - 14, 1, P.mae.vx < 0); }]);
  P.filhos.forEach((f, i) => L.push([f.y, () => quadro(F.patos, 1, Math.floor(P.t * 7 + i * 2) % 6, f.x, f.y - 10, 1, f.vx < 0)]));
  const C = ENF.cervo;
  if (C.est !== 'sumido') L.push([C.y, () => { let lin = 0, q;
    if (C.est === 'bebe') q = C.t < .75 ? Math.floor(C.t / .25) : 2 + Math.floor((C.t - .75) * 2.5) % 4;
    else if (C.est === 'alerta') { lin = 1; q = Math.min(2, Math.floor(C.t * 4)); }
    else { lin = 2; q = Math.floor(C.t * 11) % 6; }
    quadro(F.cervo, lin, q, C.x, C.y - 60, 1, C.est === 'corre'); }]);
  const G = ENF.garca;
  if (G.est !== 'sumida') L.push([G.y, () => { let lin = 0, q;
    if (G.est === 'espreita') q = Math.floor(G.t * 1.6) % 6;
    else if (G.est === 'pesca') { lin = 1; q = Math.min(5, Math.floor(G.t * 5)); }
    else { lin = 2; q = G.t < .5 ? Math.min(2, Math.floor(G.t / .17)) : 3 + Math.floor(G.t * 8) % 3; }
    quadro(F.garca, lin, q, G.x, G.y - 50, 1); }]);
  const S = ENF.sapo;
  if (S.est !== 'sumido') L.push([S.y, () => { let lin = 0, q;
    if (S.est === 'parado') q = Math.floor(S.t * 3) % 6; else if (S.est === 'mosca') { lin = 1; q = Math.min(5, Math.floor(S.t * 6)); } else { lin = 2; q = Math.min(5, Math.floor(S.t * 8)); }
    quadro(F.sapo, lin, q, S.x, S.y - 16, 1); }]);
  return L;
}
function desenhaCachoeira() {   // a agua animada por cima da cachoeira pintada (espelhada: no mapa o degrau de cima e o da direita)
  if (TR !== 1) return; const i = Math.floor(t * 8) % 6;
  quadro(F.cachoeira, Math.floor(i / 3), i % 3, 1137, 410, 1, true, .92);
}
function desenhaInsetos() { if (TR !== 1 || !ENF.patos) return; for (const o of ENF.insetos) quadro(F.insetos, o.lin, Math.floor(o.f) % 6, o.x, o.y, 1, o.vx < 0); }

// ---------- desenho ----------
const cam = { x: barco.x, y: barco.y };
const tela = (x, y) => [W / 2 + (x - cam.x) * Z, H / 2 + (y - cam.y) * Z];
function quadro(f, lin, q, x, y, esc, flip, al, ang) {   // desenha o quadro (lin,q) da folha f centrado em (x,y) do mundo
  if (!f.i.complete) return; const [sx, sy] = tela(x, y), w = f.fw * (esc || 1) * Z, h = f.fh * (esc || 1) * Z;
  ctx.save(); ctx.translate(sx, sy); if (ang) ctx.rotate(ang); if (flip) ctx.scale(-1, 1); if (al != null) ctx.globalAlpha = al;
  ctx.drawImage(f.i, q * f.fw, lin * f.fh, f.fw, f.fh, -w / 2, -h / 2, w, h); ctx.restore();
}
function desenha() {
  ctx.fillStyle = '#081224'; ctx.fillRect(0, 0, W, H);
  { const M = MAPAS[TR]; if (M.complete) { const [x0, y0] = tela(0, 0); ctx.drawImage(M, x0, y0, R.w * Z, R.h * Z); } }
  desenhaCachoeira();
  // brilhos na agua
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const b of BRILHO) if (b.x) quadro(F.fx, 4, Math.min(5, Math.floor(b.t * 6)), b.x, b.y, .5, false, .8);
  ctx.restore();
  // a esteira (espuma da popa) vem embaixo do barco
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const e of FX) if (e.some) quadro(F.fx, e.lin, Math.min(5, Math.floor(e.t / e.dur * 6)), e.x, e.y, e.esc, false, e.al * (1 - e.t / e.dur));
  ctx.restore();
  // o que boia + o barco, por profundidade
  const L = BOIA.map(o => [o.y, () => {
    const f = F.flut, bob = Math.sin(o.fase * 1.7) * 1.4 + (o.sub > 0 ? 7 : 0), q = 0, al = o.sub > 0 ? .32 : null, bal = Math.sin(o.fase * 1.3) * .025;
    if (o.t === 'tronco') { const D = .42; if (Math.abs(o.ang) < D / 2) quadro(f, 0, q, o.x, o.y + bob, 1, false, al, o.ang + bal);
      else if (o.ang > 0) quadro(f, 1, q, o.x, o.y + bob, 1, false, al, o.ang - D + bal); else quadro(f, 1, q, o.x, o.y + bob, 1, true, al, o.ang + D + bal); }
    else quadro(f, TIPO[o.t][0], q, o.x, o.y + bob, 1, false, al, o.m ? bal * .6 : 0);
  }]);
  L.push([barco.y, () => {
    const r = DIR[barco.dir], bob = Math.sin(t * 2.4) * 1.6;
    quadro(F.rema, r, barco.remaQ >= 0 ? barco.remaQ : 0, barco.x, barco.y - 48 + bob, 1, false, null, Math.sin(t * 1.9) * .012);
  }]);
  L.push(...desenhosEnfeites());
  L.sort((a, b) => a[0] - b[0]); for (const [, f] of L) f();
  // efeitos (respingos, splash, marola)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const e of FX) if (!e.some) quadro(F.fx, e.lin, Math.min(5, Math.floor(e.t / e.dur * 6)), e.x, e.y, e.esc, false, e.al, e.ang);
  ctx.restore();
  // peixes
  for (const p of PEIXE) quadro(F.peixes, p.tipo, Math.min(7, Math.floor(p.t / .11)), p.x, p.y - 14, 1, p.flip);
  // raposa
  { const r = raposa; if (CONF.raposa && r.est !== 'sumida') { let lin = 0, q = Math.floor(r.t * 8) % 6;
    if (r.est === 'olha') { lin = 1; q = Math.min(5, Math.floor(r.t * 2.2)); if (q === 5) q = 3 + Math.floor(t * 1.2) % 3; }
    else if (r.est === 'corre') { lin = 2; q = Math.floor(r.t * 14) % 6; }
    quadro(F.bichos, lin, q, r.x, r.y - 20, 1, r.dir < 0); } }
  // passaros
  for (const a of AVES) quadro(F.bichos, 3, Math.floor(a.f) % 6, a.x, a.y, .7, a.dir < 0);
  desenhaInsetos();
  // textos
  if (perto) { const txt = perto.tipo === 'bau' ? (pego(perto.b.id) ? 'Baú vazio' : 'ENTER: abrir o baú') : CAIS.tipo === 'vila' ? 'ENTER: descer do barco (voltar para a vila)' : 'ENTER: descansar no cais (salvar o jogo)';
    const p = perto.tipo === 'bau' ? perto.b : CAIS, [sx, sy] = tela(p.x, p.y - 60); faixa(txt, sx, sy); }
  if (aviso) faixa(aviso.txt, W / 2, H - 46, '#ffe27a');
  if (lutando) { lutando.t += 1 / 60; const k = Math.min(1, lutando.t / .9); ctx.fillStyle = 'rgba(190,230,255,' + (k < .3 ? k / .3 * .7 : .7 * (1 - (k - .3) / .7)) + ')'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(3,6,14,' + Math.max(0, (k - .35) / .65) + ')'; ctx.fillRect(0, 0, W, H); faixa('Algo se mexe embaixo do barco!', W / 2, H / 2, '#ffe27a', Math.min(1, k * 3)); }
  if (troca) { ctx.fillStyle = 'rgba(3,6,14,' + Math.min(1, troca.t < .45 ? troca.t / .45 : (.9 - troca.t) / .45) + ')'; ctx.fillRect(0, 0, W, H); }
  if (t < 7) faixa('Setas / WASD: remar · a correnteza leva rio abaixo · encoste nos troncos para abrir caminho', W / 2, 26, '#bff4ff', Math.min(1, (7 - t) / 1.5));
}
function faixa(txt, x, y, cor, al) {
  ctx.save(); ctx.globalAlpha = al == null ? 1 : al; ctx.font = 'bold 15px "Trebuchet MS",sans-serif'; const w = ctx.measureText(txt).width + 24;
  ctx.fillStyle = 'rgba(6,14,30,.82)'; ctx.fillRect(x - w / 2, y - 16, w, 26); ctx.strokeStyle = 'rgba(127,214,245,.6)'; ctx.strokeRect(x - w / 2 + .5, y - 15.5, w - 1, 25);
  ctx.fillStyle = cor || '#fff'; ctx.textAlign = 'center'; ctx.fillText(txt, x, y + 2); ctx.restore();
}

// ---------- laco ----------
let ultimo = performance.now();
function frame(agora) {
  const dt = Math.min(.05, Math.max(0, (agora - ultimo) / 1000)); ultimo = agora;
  if (AGUA) passo(dt);
  desenha();
  requestAnimationFrame(frame);
}
window.__rio = { barco, get BOIA() { return BOIA; }, frame, passo, desenha, teclas, agua, cam, entraTrecho, get TR() { return TR; } };
(function espera() { if (AGUAS.length === R.trechos.length && AGUAS.every(Boolean) && MAPAS.every(m => m.complete) && Object.values(F).every(f => f.i.complete)) {
  { const G = typeof JOGO === 'object' && JOGO.rio; const n = G && R.trechos[G.trecho] ? G.trecho : 0; montaTrecho(n);
    if (G && R.trechos[G.trecho] && barcoCabe(G.x, G.y, 'baixo')) { barco.x = G.x; barco.y = G.y; } else { barco.x = CONF.inicio[0]; barco.y = CONF.inicio[1]; } cam.x = barco.x; cam.y = barco.y; } document.getElementById('carregando').style.display = 'none'; requestAnimationFrame(frame); } else setTimeout(espera, 80); })();
