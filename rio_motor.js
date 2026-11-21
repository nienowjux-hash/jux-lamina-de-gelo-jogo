/* O RIO (Capitulo 3, Parte A: FICHA_CAP3_RIO.md). O Jux pilota o barco Halvard rio abaixo.
   Tudo o que aparece e IMAGEM (regra do usuario); o codigo so anima e da a fisica:
   - barco: folha de balanco (parado) e de remada (andando), 4 direcoes; esteira atras, respingo a cada remada
   - correnteza: puxa rio abaixo, mais forte no meio do rio (segue a linha do meio, tools/cut_rio.py)
   - troncos e placas de gelo BOIAM e descem com a correnteza; o barco EMPURRA (troncos giram); o gelo grande e parede
   - peixes pulando, brilhos na agua, a raposa da margem (anda, para e olha, foge) e passarinhos
   Dados: rio_dados.js (mapa, mascara da agua, folhas recortadas). Sons: assets/sfx/rio_*.  */
const W = 960, H = 540, cv = document.getElementById('c'), ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
const R = window.JUX_RIO, Z = 1.15;
const rnd = (a, b) => a + Math.random() * (b - a);
const cl = (v, a, b) => Math.max(a, Math.min(b, v));
const img = s => { const i = new Image(); i.src = s; return i; };
const MAPA = img(R.mapa), F = {};
for (const k in R.folhas) F[k] = Object.assign({ i: img(R.folhas[k].atlas) }, R.folhas[k]);

// ---------- mascara da agua (onde o barco anda) ----------
let AGUA = null;
{ const m = img(R.agua); m.onload = () => { const c = document.createElement('canvas'); c.width = R.w; c.height = R.h; const g = c.getContext('2d'); g.drawImage(m, 0, 0);
  const d = g.getImageData(0, 0, R.w, R.h).data; AGUA = new Uint8Array(R.w * R.h); for (let i = 0; i < AGUA.length; i++) AGUA[i] = d[i * 4] > 127 ? 1 : 0; }; }
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
  const L = R.linha, i = cl(Math.round(y / R.passo), 1, L.length - 2), mid = L[i];
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
const ACEL = 230, VMAX = 150, ATRITO = 1.25;
const teclas = {};
addEventListener('keydown', e => { const k = e.key.toLowerCase(); teclas[k] = true; liga(); if (k === 'enter' || k === 'e' || k === ' ') usa(); if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault(); });
addEventListener('keyup', e => { teclas[e.key.toLowerCase()] = false; });
addEventListener('pointerdown', () => liga());

// ---------- coisas que boiam (troncos e gelo); o gelo GRANDE nao sai do lugar ----------
// tipo: [linha da folha 'flut', raio (colisao), massa (0 = fixo)]
const TIPO = { tronco: [0, 0, 1], gelo_p: [2, 34, 1.6], gelo_m: [3, 48, 2.6], gelo_g: [4, 66, 0] };
const BOIA = [
  ['tronco', 575, 425, 0], ['tronco', 1030, 690, .1],
  ['gelo_m', 680, 330], ['gelo_g', 1052, 560], ['gelo_p', 735, 605], ['gelo_g', 515, 860], ['gelo_p', 385, 782], ['gelo_p', 758, 1010],
].map(([t, x, y, a]) => ({ t, x, y, x0: x, y0: y, vx: 0, vy: 0, ang: a || 0, va: 0, fase: rnd(0, 4), r: TIPO[t][1], m: TIPO[t][2] }));
FIXOS = BOIA.filter(o => !o.m);
const TRONCO_L = 66, TRONCO_R = 20;   // meio-comprimento e raio do tronco (capsula)
function pontaTronco(o) { const c = Math.cos(o.ang), s = Math.sin(o.ang); return [o.x - c * TRONCO_L, o.y - s * TRONCO_L, o.x + c * TRONCO_L, o.y + s * TRONCO_L]; }
function maisPerto(o, px, py) {   // ponto do objeto mais perto de (px,py) e o raio ali
  if (o.t !== 'tronco') return [o.x, o.y, o.r];
  const [ax, ay, bx, by] = pontaTronco(o), dx = bx - ax, dy = by - ay, t = cl(((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy), 0, 1);
  return [ax + dx * t, ay + dy * t, TRONCO_R];
}
const cabeObj = (o, x, y) => { if (o.t !== 'tronco') return agua(x, y + 6) && agua(x - o.r * .7, y) && agua(x + o.r * .7, y);
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
const BAUS = [{ id: 'rio_bau1', x: 876, y: 468, itens: { hipocao: 2 }, txt: '2 Hi-Poções' }, { id: 'rio_bau2', x: 640, y: 690, itens: { eter: 2 }, gil: 150, txt: '2 Éteres e 150 gil' }];
const CAIS = { x: 560, y: 345 };
const pego = id => typeof JOGO === 'object' && (JOGO.pegos || []).includes(id);
let aviso = null;   // {txt, t}
const avisa = (txt, t) => { aviso = { txt, t: t || 3 }; };
let perto = null;   // o que da para usar agora
function usa() {
  if (!perto) return;
  if (perto.tipo === 'bau') { const b = perto.b; if (pego(b.id)) return; JOGO.pegos = JOGO.pegos || []; JOGO.pegos.push(b.id);
    for (const k in b.itens) daItem(k, b.itens[k]); if (b.gil) JOGO.gil = (JOGO.gil || 0) + b.gil; salvaJogo(); som('novos/ui_vez', .7); avisa('Baú da ilhota: ' + b.txt + '!'); }
  else if (perto.tipo === 'cais') location.href = 'vila.html';
}

// ---------- passo ----------
let t = 0, fimAvisado = false;
function passo(dt) {
  t += dt;
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
    const q = Math.floor(barco.rema * 6) % 6, forca = (q >= 1 && q <= 3) ? 1.55 : .45;   // a puxada (quadros 2 a 4) empurra mais
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
  if (!fimAvisado && ny > R.h - 60) { fimAvisado = true; avisa('Fim do trecho 1. O degelo (trecho 2) vem na próxima parte!', 5); }
  ny = Math.min(ny, R.h - 58);
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
  // coisas que boiam
  for (const o of BOIA) {
    o.fase += dt;
    if (!o.ok) { o.ok = true; if (!cabeObj(o, o.x, o.y)) achaLugar(o); }   // comeca num lugar onde cabe inteiro na agua
    if (!o.m) continue;
    const [fx_, fy_] = corrente(o.x, o.y), kk = 1 - Math.exp(-.7 * dt);
    o.vx += (fx_ * .8 - o.vx) * kk; o.vy += (fy_ * .8 - o.vy) * kk; o.va *= Math.exp(-1.4 * dt);
    if (o.t === 'tronco') { o.va += Math.sin(o.fase * .7) * .02 * dt - o.ang * .5 * dt; if (Math.abs(o.ang) > .75) { o.ang = Math.sign(o.ang) * .75; o.va *= -.3; } }   // gira so um pouco e volta a deitar
    const ox = o.x + o.vx * dt, oy = o.y + o.vy * dt, oa = o.ang + o.va * dt;
    const a0 = o.ang; o.ang = oa;
    if (cabeObj(o, ox, oy)) { o.x = ox; o.y = oy; }
    else { o.ang = a0; if (cabeObj(o, ox, o.y)) o.x = ox; else if (cabeObj(o, o.x, oy)) o.y = oy; o.vx *= -.2; o.vy *= -.2; o.va *= -.3; }
    if (o.y > R.h + 40 || o.y > R.h - 40 && !cabeObj(o, o.x, o.y + 20)) volta(o);
    // parado num canto ha muito tempo e fora da tela: volta a boiar la em cima (o rio nunca entope)
    const mv = Math.hypot(o.x - (o.px || o.x), o.y - (o.py || o.y)); o.px = o.x; o.py = o.y; o.par = mv < .05 ? (o.par || 0) + dt : 0;
    if (o.par > 10 && !naTela(o.x, o.y, 90)) volta(o);
    if (!o.contatoAgora) o.contato = Math.max(0, (o.contato || 0) - dt); o.contatoAgora = false;
  }
  // barco x coisas que boiam
  for (const o of BOIA) {
    const [px, py, r] = maisPerto(o, barco.x, barco.y + 4);
    let dx = barco.x - px, dy = (barco.y + 4 - py) / .62;   // a vista e achatada: distancia na "agua"
    const d = Math.hypot(dx, dy), min = (forma(barco.dir) === 'lado' ? 46 : 32) + r;
    if (d >= min || d < .01) continue;
    dx /= d; dy /= d; const pen = min - d, nyS = dy * .62; o.contatoAgora = true;
    const rel = (barco.vx - o.vx) * -dx + (barco.vy - o.vy) * -nyS;   // velocidade de choque (barco indo contra o objeto)
    if (!o.m) {   // gelo grande: e parede (no barcoCabe); aqui so o barulho e o splash da batida
      if (rel > 45 && t - (o.som || 0) > .5) { o.som = t; som('gelo', cl(rel / 200, .15, .6)); fx(2, px, py, .5, .4); }
      continue;
    }
    const mb = 3, wb = o.m / (mb + o.m), wo = mb / (mb + o.m);
    // separa os dois, mas ninguem entra na margem: se o objeto nao cabe, o barco recua sozinho
    if (cabeObj(o, o.x - dx * pen * wo, o.y - nyS * pen * wo)) { o.x -= dx * pen * wo; o.y -= nyS * pen * wo; if (barcoCabe(barco.x + dx * pen * wb, barco.y + nyS * pen * wb)) { barco.x += dx * pen * wb; barco.y += nyS * pen * wb; } }
    else if (barcoCabe(barco.x + dx * pen, barco.y + nyS * pen)) { barco.x += dx * pen; barco.y += nyS * pen; }
    // o barco empurrando e nada se mexe (preso entre o objeto e a pedra): o objeto AFUNDA e volta la em cima
    o.contato = (o.contato || 0) + (Math.hypot(barco.vx, barco.vy) < 30 ? 1 / 60 : 0); if (o.contato > 2.5) { afunda(o); continue; }
    if (rel > 0) {
      const j = rel * 1.25 / (1 / mb + 1 / o.m);
      barco.vx += dx * j / mb; barco.vy += nyS * j / mb; o.vx -= dx * j / o.m; o.vy -= nyS * j / o.m;
      if (o.t === 'tronco') { const off = (px - o.x) * Math.cos(o.ang) + (py - o.y) * Math.sin(o.ang); o.va += cl(-off * (dx * Math.sin(o.ang) - nyS * Math.cos(o.ang)) * j * .00045, -1.2, 1.2); }
      if (rel > 40 && t - (o.som || 0) > .4) { o.som = t; som(o.t === 'tronco' ? 'rio_madeira' : 'gelo', cl(rel / 180, .15, .7), true); fx(2, (px + barco.x) / 2, (py + barco.y) / 2 + 6, .5, .35); }
    }
  }
  // coisa x coisa (troncos e gelo se empurram)
  for (let i = 0; i < BOIA.length; i++) for (let j = i + 1; j < BOIA.length; j++) {
    const a = BOIA[i], b = BOIA[j]; if (!a.m && !b.m) continue;
    const [px, py, ra] = maisPerto(a, b.x, b.y), [qx, qy, rb] = maisPerto(b, px, py);
    let dx = qx - px, dy = (qy - py) / .62; const d = Math.hypot(dx, dy), min = ra + rb; if (d >= min || d < .01) continue;
    dx /= d; dy /= d; const pen = min - d, ma = a.m || 1e9, mb2 = b.m || 1e9, wa = mb2 / (ma + mb2), wb = ma / (ma + mb2);
    a.x -= dx * pen * wa; a.y -= dy * .62 * pen * wa; b.x += dx * pen * wb; b.y += dy * .62 * pen * wb;
    const rel = (a.vx - b.vx) * dx + (a.vy - b.vy) * dy * .62; if (rel > 0) { const jj = rel / (1 / ma + 1 / mb2); a.vx -= dx * jj / ma; a.vy -= dy * .62 * jj / ma; b.vx += dx * jj / mb2; b.vy += dy * .62 * jj / mb2; }
  }
  // esteira, brilhos, peixes, raposa, passaros
  for (const e of FX) e.t += dt; for (let i = FX.length - 1; i >= 0; i--) if (FX[i].t >= FX[i].dur) FX.splice(i, 1);
  for (const b of BRILHO) { b.t += dt / b.dur; if (b.t >= 1 || !b.x) { b.t = 0; b.dur = rnd(.8, 1.4); const p = pontoAgua(60); if (p) { b.x = p[0]; b.y = p[1]; } } }
  peixeT -= dt; if (peixeT <= 0) { peixeT = rnd(1.4, 3.6); const p = pontoAgua(130); if (p) PEIXE.push({ x: p[0], y: p[1], t: 0, tipo: Math.random() < .55 ? 0 : 1, flip: Math.random() < .5 }); }
  for (let i = PEIXE.length - 1; i >= 0; i--) { const p = PEIXE[i]; const q0 = Math.floor(p.t / .11); p.t += dt; const q = Math.floor(p.t / .11);
    if (q0 < 6 && q >= 6) { fx(3, p.x + (p.flip ? -20 : 20), p.y + 6, .9, .45); const d = Math.hypot(p.x - barco.x, p.y - barco.y); som('rio_splash_peq', cl(.55 - d / 900, .05, .5), true); }
    if (q >= 8) PEIXE.splice(i, 1); }
  passoRaposa(dt);
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
function achaLugar(o) { for (let r = 4; r < 160; r += 4) for (let k = 0; k < 16; k++) { const x = o.x + Math.cos(k / 16 * 6.283) * r, y = o.y + Math.sin(k / 16 * 6.283) * r * .7; if (cabeObj(o, x, y)) { o.x = x; o.y = y; return; } } }
const naTela = (x, y, m) => Math.abs(x - cam.x) < W / (2 * Z) + (m || 0) && Math.abs(y - cam.y) < H / (2 * Z) + (m || 0);
function afunda(o) { fx(2, o.x, o.y, .6, .6); fx(3, o.x, o.y + 6, 1, .7); som('rio_splash_grande', .5); o.contato = 0; volta(o); }
function volta(o) {   // desceu o rio todo: volta a boiar la em cima (o rio nunca fica vazio)
  for (let k = 0; k < 30; k++) { const x = rnd(560, 900), y = rnd(300, 360); if (cabeObj(o, x, y) && Math.hypot(x - barco.x, y - barco.y) > 160) { o.x = x; o.y = y; o.vx = o.vy = o.va = 0; o.par = 0; o.ang = 0; return; } }
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
  if (MAPA.complete) { const [x0, y0] = tela(0, 0); ctx.drawImage(MAPA, x0, y0, R.w * Z, R.h * Z); }
  // brilhos na agua
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const b of BRILHO) if (b.x) quadro(F.fx, 4, Math.min(5, Math.floor(b.t * 6)), b.x, b.y, .5, false, .8);
  ctx.restore();
  // esteira atras do barco
  const sp = Math.hypot(barco.vx, barco.vy);
  if (sp > 22) { const a = Math.atan2(barco.vy, barco.vx), atras = forma(barco.dir) === 'lado' ? 118 : 62, bx = barco.x - Math.cos(a) * atras, by = barco.y + 18 - Math.sin(a) * atras * .75;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; quadro(F.fx, 0, Math.floor(t * 10) % 6, bx, by, 1.15, false, Math.min(.95, sp / 110), a - Math.PI / 2); ctx.restore(); }
  // o que boia + o barco, por profundidade
  const L = BOIA.map(o => [o.y, () => {
    const f = F.flut, bob = Math.sin(o.fase * 2.2) * 1.5, q = Math.floor(o.fase * 3.2) % 4;
    if (o.t === 'tronco') { const D = .42; if (Math.abs(o.ang) < D / 2) quadro(f, 0, q, o.x, o.y + bob, 1, false, null, o.ang);
      else if (o.ang > 0) quadro(f, 1, q, o.x, o.y + bob, 1, false, null, o.ang - D); else quadro(f, 1, q, o.x, o.y + bob, 1, true, null, o.ang + D); }
    else quadro(f, TIPO[o.t][0], q, o.x, o.y + bob, 1);
  }]);
  L.push([barco.y, () => {
    const r = DIR[barco.dir], bob = Math.sin(t * 2.4) * 1.6;
    if (barco.remaQ >= 0) quadro(F.rema, r, barco.remaQ, barco.x, barco.y - 48 + bob, 1);
    else { const q = [0, 1, 2, 1][Math.floor(t * 2.6) % 4]; quadro(F.barco, r, q, barco.x, barco.y - 50 + bob, 1); }
  }]);
  L.sort((a, b) => a[0] - b[0]); for (const [, f] of L) f();
  // efeitos (respingos, splash, marola)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const e of FX) quadro(F.fx, e.lin, Math.min(5, Math.floor(e.t / e.dur * 6)), e.x, e.y, e.esc, false, e.al, e.ang);
  ctx.restore();
  // peixes
  for (const p of PEIXE) quadro(F.peixes, p.tipo, Math.min(7, Math.floor(p.t / .11)), p.x, p.y - 14, 1, p.flip);
  // raposa
  { const r = raposa; if (r.est !== 'sumida') { let lin = 0, q = Math.floor(r.t * 8) % 6;
    if (r.est === 'olha') { lin = 1; q = Math.min(5, Math.floor(r.t * 2.2)); if (q === 5) q = 3 + Math.floor(t * 1.2) % 3; }
    else if (r.est === 'corre') { lin = 2; q = Math.floor(r.t * 14) % 6; }
    quadro(F.bichos, lin, q, r.x, r.y - 20, 1, r.dir < 0); } }
  // passaros
  for (const a of AVES) quadro(F.bichos, 3, Math.floor(a.f) % 6, a.x, a.y, .7, a.dir < 0);
  // textos
  if (perto) { const txt = perto.tipo === 'bau' ? (pego(perto.b.id) ? 'Baú vazio' : 'ENTER: abrir o baú') : 'ENTER: descer do barco (voltar para a vila)';
    const p = perto.tipo === 'bau' ? perto.b : CAIS, [sx, sy] = tela(p.x, p.y - 60); faixa(txt, sx, sy); }
  if (aviso) faixa(aviso.txt, W / 2, H - 46, '#ffe27a');
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
window.__rio = { barco, BOIA, frame, passo, desenha, teclas, agua, cam };
(function espera() { if (AGUA && MAPA.complete && Object.values(F).every(f => f.i.complete)) { document.getElementById('carregando').style.display = 'none'; requestAnimationFrame(frame); } else setTimeout(espera, 80); })();
