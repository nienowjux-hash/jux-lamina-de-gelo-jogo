/* ============ VIDA DA GARGANTA GELADA (pedido do usuario 2026-11-19: "o mapa esta muito morto") ============
   Tudo por codigo, por cima do desenho (regra: cenario = imagem do usuario; o codigo so anima):
   fogueira acesa no acampamento, cristais azuis e roxos pulsando com estrelinhas, circulo do ritual respirando roxo com fiapos subindo,
   boca da caverna soltando luz e bafo frio, lanterna do arco, nevoa rolando no rio e nos paredoes, rajadas de vento com neve,
   brilhos correndo no gelo e morcegos cruzando perto da torre. Ganchos em vila_motor.js: vidaPasso(dt), vidaDesenha('chao'|'ar'). */
'use strict';
const VG = (() => {
  const CRIST_AZUL = [[215, 440], [545, 530], [500, 620], [630, 340], [1415, 450], [345, 890], [830, 840], [850, 925], [1210, 915], [1365, 945], [575, 545], [470, 640]];
  const CRIST_ROXO = [[940, 525], [1155, 480], [1190, 545]];
  const RITUAL = [1050, 545], CAVERNA = [1335, 860], FOGO = [330, 322], LANTERNA = [40, 575];
  const FOGO_IMG = new Image(); if (window.JUX_FOGO) FOGO_IMG.src = window.JUX_FOGO.atlas;
  const NEVOAS = [[640, 165, 140], [1240, 210, 150], [150, 1050, 210], [760, 560, 170], [1030, 160, 120], [430, 1040, 160]];   // [x, y, raio]
  const st = {chamas: [], fumaca: [], fiapos: [], bafo: [], brilhosGelo: [], estrelas: [], morcegos: [], rajadas: [], tMorc: 4, tRaj: 3};
  const rnd = (a, b) => a + Math.random() * (b - a);
  function passo(dt) {
    // fogueira
    for (let i = 0; i < 3; i++) if (Math.random() < dt * 16) st.chamas.push({x: FOGO[0] + rnd(-9, 9), y: FOGO[1] + 2, v: 0, vx: rnd(-6, 6), s: rnd(1.8, 3.4), q: Math.random() < .3});
    if (Math.random() < dt * 3) st.fumaca.push({x: FOGO[0] + rnd(-3, 3), y: FOGO[1] - 14, v: 0, s: rnd(2.5, 4)});
    for (const c of st.chamas) {c.v += dt; c.y -= dt * (c.q ? 34 : 22); c.x += c.vx * dt; c.s *= 1 - dt * .9;}
    st.chamas = st.chamas.filter(c => c.v < (c.q ? 1.3 : .75));
    for (const f of st.fumaca) {f.v += dt; f.y -= dt * 9; f.x += dt * (6 + Math.sin(f.v * 2) * 4); f.s += dt * 3;}
    st.fumaca = st.fumaca.filter(f => f.v < 3.4);
    // fiapos roxos subindo do ritual
    if (Math.random() < dt * 5) {const a = rnd(0, 6.283), r = rnd(10, 46); st.fiapos.push({x: RITUAL[0] + Math.cos(a) * r, y: RITUAL[1] + Math.sin(a) * r * .45, v: 0, d: rnd(1.6, 2.6)});}
    for (const f of st.fiapos) {f.v += dt; f.y -= dt * 16; f.x += Math.sin(f.v * 3 + f.d) * dt * 6;}
    st.fiapos = st.fiapos.filter(f => f.v < f.d);
    // bafo frio da caverna
    if (false) st.bafo.push({x: CAVERNA[0] + rnd(-22, 10), y: CAVERNA[1] + rnd(-8, 14), v: 0, s: rnd(10, 16)});
    for (const b of st.bafo) {b.v += dt; b.x -= dt * 12; b.y -= dt * 3; b.s += dt * 9;}
    st.bafo = st.bafo.filter(b => b.v < 3.2);
    // brilhos correndo no gelo do rio (pixels de gelo = bit 4 do terreno, ja listados em rioPx)
    if (typeof rioPx !== 'undefined' && rioPx.length) for (let i = 0; i < 2; i++) if (Math.random() < dt * 14) {const k = rioPx[(Math.random() * rioPx.length) | 0]; st.brilhosGelo.push({x: k % V.w, y: (k / V.w) | 0, v: 0, l: rnd(4, 11)});}
    for (const b of st.brilhosGelo) b.v += dt;
    st.brilhosGelo = st.brilhosGelo.filter(b => b.v < 1.4);
    // estrelinhas nos cristais
    if (Math.random() < dt * 2.5) {const roxo = Math.random() < .3, L = roxo ? CRIST_ROXO : CRIST_AZUL, c = L[(Math.random() * L.length) | 0]; st.estrelas.push({x: c[0] + rnd(-8, 8), y: c[1] + rnd(-16, 4), v: 0, roxo});}
    for (const e of st.estrelas) e.v += dt;
    st.estrelas = st.estrelas.filter(e => e.v < .9);
    // morcegos cruzando perto da torre e dos paredoes
    st.tMorc -= dt;
    if (st.tMorc <= 0) {st.tMorc = rnd(7, 15); const n = 2 + ((Math.random() * 3) | 0), dir = Math.random() < .5 ? 1 : -1, y0 = rnd(80, 260);
      for (let i = 0; i < n; i++) st.morcegos.push({x: dir > 0 ? rnd(-120, -20) : rnd(1470, 1570), y: y0 + rnd(-30, 30), vx: dir * rnd(95, 135), f: rnd(0, 6), fy: rnd(.6, 1.4), v: 0});}
    for (const m of st.morcegos) {m.v += dt; m.x += m.vx * dt; m.y += Math.sin(m.v * 2.2 * m.fy + m.f) * dt * 22;}
    st.morcegos = st.morcegos.filter(m => m.x > -200 && m.x < 1650);
    // rajadas de vento: faixas de neve varrendo o chao
    st.tRaj -= dt;
    if (st.tRaj <= 0) {st.tRaj = rnd(4, 9); const y = rnd(250, 1000); for (let i = 0; i < 26; i++) st.rajadas.push({x: rnd(-200, 0), y: y + rnd(-30, 30), vx: rnd(230, 340), v: 0, l: rnd(6, 14)});}
    for (const r of st.rajadas) {r.v += dt; r.x += r.vx * dt; r.y += Math.sin(r.v * 5 + r.l) * dt * 10;}
    st.rajadas = st.rajadas.filter(r => r.x < 1500 && r.v < 6);
  }
  // bandeiras do sol negro tremulando (tools/garganta_bandeira.py -> garganta_bandeira.js; o pano parado foi apagado do mapa)
  const BG = window.JUX_BANDEIRA_G || null, BGI = new Image(); if (BG) BGI.src = BG.atlas;
  function bandeira(i) {const [x, tp, pe] = BG.lugares[i], k = (pe - tp) / BG.poste, q = Math.floor(t * 7 + i * 3.7) % 8;
    ctx.drawImage(BGI, q * BG.w, 0, BG.w, BG.h, x - BG.topo[0] * k, tp - BG.topo[1] * k, BG.w * k, BG.h * k);}
  function bandeiras(atras) {if (!BG || !BGI.complete) return; BG.lugares.forEach((l, i) => {if ((hero.y >= l[2]) === atras) bandeira(i);});}
  // ESCURIDAO DA CAVERNA (pedido do usuario 2026-11-19): perto da boca da caverna fica escuro e a Aurora Gelida ilumina
  // um circulo em volta do Jux (luz azul-gelo que respira). A forca do escuro cresce conforme se aproxima da caverna.
  const ESC_CENTRO = [1330, 905];
  function escuroCaverna() {
    const d = Math.hypot(hero.x - ESC_CENTRO[0], hero.y - ESC_CENTRO[1]), k = Math.max(0, Math.min(1, 1 - (d - 90) / 260));
    VG.escuro = k; if (k <= .01) return;
    // a luz sai da LAMINA (espada incandescente): o centro do claro e a propria espada, tremendo de leve como chama de gelo
    const pos = (typeof desenhaEspadaAcesa === 'function' && hero._esp) ? (() => {const E = hero._esp, L = laminaDe(E.S, E.q); return L ? [E.x + (L.cx - E.S.ancora[0]) * E.s, E.y + (L.cy - E.S.ancora[1]) * E.s * E.estica] : null;})() : null;
    const hx = pos ? pos[0] : hero.x, hy = pos ? pos[1] : hero.y - 30, tr = 1 + .04 * Math.sin(t * 9) + .03 * Math.sin(t * 21);
    const r0 = 40 * tr, r1 = 160 * tr;
    const g = ctx.createRadialGradient(hx, hy, r0, hx, hy, r1);
    g.addColorStop(0, 'rgba(2,6,20,0)'); g.addColorStop(.5, `rgba(2,6,20,${.55 * k})`); g.addColorStop(1, `rgba(2,6,20,${.9 * k})`);
    ctx.fillStyle = g; ctx.fillRect(hx - 2000, hy - 2000, 4000, 4000);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';   // tom azul da lamina no que ela ilumina
    const l = ctx.createRadialGradient(hx, hy, 0, hx, hy, r1 * .8); l.addColorStop(0, `rgba(120,200,255,${.28 * k})`); l.addColorStop(.4, `rgba(90,170,255,${.10 * k})`); l.addColorStop(1, 'rgba(90,170,255,0)');
    ctx.fillStyle = l; ctx.fillRect(hx - r1, hy - r1, r1 * 2, r1 * 2); ctx.restore();
    if (typeof desenhaEspadaAcesa === 'function') desenhaEspadaAcesa(k);   // a lamina brilhando por cima de tudo
  }
  // efeitos desenhados do mapa (tools/cut_fx_mapa.py -> fx_mapa.js): hálito da caverna em ciclo, por cima da boca
  const FXM = window.JUX_FX_MAPA || {}, FXMI = {};
  for (const k in FXM) {FXMI[k] = new Image(); FXMI[k].src = FXM[k].atlas;}
  function fxMapa(nome, x, y, tam, fps, alfa, fase) {const F = FXM[nome], I = FXMI[nome]; if (!F || !I || !I.complete) return false;
    const q = Math.floor(t * fps + (fase || 0)) % F.n; ctx.save(); ctx.globalAlpha = alfa; ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(I, q * F.w, 0, F.w, F.h, x - tam / 2, y - tam / 2, tam, tam); ctx.restore(); return true;}
  function luz(x, y, r, cor) {const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, cor); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);}
  function morcego(m) {   // silhueta de morcego batendo asa
    const a = Math.sin(m.v * 18 + m.f), s = 1;
    ctx.fillStyle = 'rgba(10,8,24,.85)'; ctx.beginPath();
    ctx.moveTo(m.x, m.y); ctx.quadraticCurveTo(m.x - 5 * s, m.y - 4 * a * s, m.x - 9 * s, m.y + 1 - 3 * a * s); ctx.lineTo(m.x - 4 * s, m.y + 1);
    ctx.lineTo(m.x, m.y + 2); ctx.lineTo(m.x + 4 * s, m.y + 1); ctx.lineTo(m.x + 9 * s, m.y + 1 - 3 * a * s); ctx.quadraticCurveTo(m.x + 5 * s, m.y - 4 * a * s, m.x, m.y); ctx.fill();
  }
  function desenha(camada) {
    if (camada === 'chao') {
      bandeiras(true);   // as que ficam atras do Jux
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      // fogueira: luz tremendo, chamas e brasas
      luz(FOGO[0], FOGO[1] - 4, 58 + Math.sin(t * 9) * 4 + Math.sin(t * 23) * 2, 'rgba(255,150,50,.40)');
      // (2026-11-19) as chamas agora sao o FOGO DESENHADO da vila (vila_fogo.js), logo abaixo, fora do modo 'lighter'
      ctx.restore();
      // fogo de verdade (pedido 2026-11-19: 'igual tem na vila, o sprite, nao codigo'): a mesma folha de chamas da fogueira da vila
      {const F = window.JUX_FOGO; if (F && FOGO_IMG.complete && FOGO_IMG.naturalWidth) {const l = 44, sc = l / F.larg, q = Math.floor(t * 11) % 8;
        ctx.drawImage(FOGO_IMG, q * F.w, 0, F.w, F.h, FOGO[0] - F.base[0] * sc, FOGO[1] + 6 - F.base[1] * sc, F.w * sc, F.h * sc);}}
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      // cristais pulsando
      CRIST_AZUL.forEach(([x, y], k) => {const p = .5 + .5 * Math.sin(t * 1.6 + k * 1.3); luz(x, y - 8, 20 + p * 6, `rgba(110,210,255,${.16 + .14 * p})`);});
      CRIST_ROXO.forEach(([x, y], k) => {const p = .5 + .5 * Math.sin(t * 1.9 + k * 2.1); luz(x, y - 8, 22 + p * 7, `rgba(190,110,255,${.18 + .16 * p})`);});
      // circulo do ritual respirando
      const pr = .5 + .5 * Math.sin(t * 1.4);
      ctx.save(); ctx.translate(RITUAL[0], RITUAL[1]); ctx.scale(1, .42);
      const gr = ctx.createRadialGradient(0, 0, 10, 0, 0, 78); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.7, `rgba(170,80,255,${.10 + .14 * pr})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, 78, 0, 6.283); ctx.fill(); ctx.restore();
      for (const f of st.fiapos) {const a = Math.sin(Math.PI * f.v / f.d); ctx.fillStyle = `rgba(200,140,255,${.55 * a})`; ctx.fillRect(f.x, f.y, 1.4, 3.2);}
      // caverna (halito desenhado, duas camadas desencontradas) e lanterna do arco
      luz(LANTERNA[0], LANTERNA[1], 22 + Math.sin(t * 6) * 2 + Math.sin(t * 17), 'rgba(255,190,110,.42)');
      // brilhos no gelo e estrelinhas
      for (const b of st.brilhosGelo) {ctx.globalAlpha = Math.sin(Math.PI * b.v / 1.4) * .6; ctx.fillStyle = '#d8f6ff'; ctx.fillRect(b.x, b.y, b.l, .9);}
      ctx.globalAlpha = 1;
      for (const e of st.estrelas) {const a = Math.sin(Math.PI * e.v / .9), r = 1 + a * 3; ctx.fillStyle = e.roxo ? `rgba(230,190,255,${a})` : `rgba(220,248,255,${a})`;
        ctx.fillRect(e.x - r, e.y - .5, r * 2, 1); ctx.fillRect(e.x - .5, e.y - r, 1, r * 2);}
      ctx.restore();
      // fumaca da fogueira e bafo da caverna (normal, nao somado)
      for (const f of st.fumaca) {ctx.fillStyle = `rgba(190,200,215,${.30 * (1 - f.v / 3.4)})`; ctx.beginPath(); ctx.arc(f.x, f.y, f.s, 0, 6.283); ctx.fill();}
      if (false) for (const b of st.bafo) {ctx.fillStyle = `rgba(200,230,255,${.12 * Math.sin(Math.PI * b.v / 3.2)})`; ctx.beginPath(); ctx.ellipse(b.x, b.y, b.s, b.s * .55, 0, 0, 6.283); ctx.fill();}
    } else {   // 'ar': por cima de tudo no mundo
      // nevoa rolando devagar
      NEVOAS.forEach(([x, y, r], k) => {const dx = Math.sin(t * .13 + k * 1.7) * 40, a = .10 + .06 * Math.sin(t * .4 + k);
        const g = ctx.createRadialGradient(x + dx, y, 0, x + dx, y, r); g.addColorStop(0, `rgba(200,215,240,${a})`); g.addColorStop(1, 'rgba(200,215,240,0)');
        ctx.fillStyle = g; ctx.save(); ctx.translate(x + dx, y); ctx.scale(1.8, .55); ctx.translate(-(x + dx), -y); ctx.fillRect(x + dx - r, y - r, r * 2, r * 2); ctx.restore();});
      // rajadas de vento
      for (const r of st.rajadas) {const a = Math.min(1, r.v * 3) * Math.max(0, 1 - r.v / 6) * .7; ctx.fillStyle = `rgba(240,250,255,${a})`; ctx.fillRect(r.x, r.y, r.l, 1.1);}
      bandeiras(false);   // o Jux atras delas
      escuroCaverna();
      // halito desenhado da caverna DEPOIS do escuro: e luz propria, aparece mesmo na escuridao
      fxMapa('caverna', CAVERNA[0] - 6, CAVERNA[1] + 10, 120, 6, .85, 0); fxMapa('caverna', CAVERNA[0] + 22, CAVERNA[1] + 26, 86, 5, .55, 4);
      for (const m of st.morcegos) morcego(m);
    }
  }
  return {passo, desenha};
})();
// ---------- INTERIOR DA CAVERNA (caverna.html): o mapa e escuro de proposito; a versao CLARA (V.clara, tools/caverna_mapa.py)
// aparece so no circulo de luz da espada incandescente, que segue a lamina.
const CAV = (() => {const I = new Image(); if (window.JUX_VILA && JUX_VILA.clara) I.src = JUX_VILA.clara; let lx = 0, ly = 0;
  const off = document.createElement('canvas'); off.width = off.height = 440; const og = off.getContext('2d');
  function centro() {const E = hero._esp; if (E && typeof laminaDe === 'function' && hero.espada) {const L = laminaDe(E.S, E.q);
      if (L) return [E.x + (L.cx - E.S.ancora[0]) * E.s, E.y + (L.cy - E.S.ancora[1]) * E.s * E.estica];}
    return [hero.x, hero.y - 30];}
  return {chao() {if (!I.complete) return; const [x, y] = centro(); lx = x; ly = y; const tr = 1 + .04 * Math.sin(t * 9) + .03 * Math.sin(t * 21), R = 170 * tr, D = 440;
      og.globalCompositeOperation = 'source-over'; og.clearRect(0, 0, D, D); og.drawImage(I, x - D / 2, y - D / 2, D, D, 0, 0, D, D);
      og.globalCompositeOperation = 'destination-in'; const g = og.createRadialGradient(D / 2, D / 2, 20, D / 2, D / 2, R);
      g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.55, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)'); og.fillStyle = g; og.fillRect(0, 0, D, D);
      ctx.drawImage(off, x - D / 2, y - D / 2);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; const l = ctx.createRadialGradient(x, y, 0, x, y, R * .7);
      l.addColorStop(0, 'rgba(110,190,255,.16)'); l.addColorStop(1, 'rgba(110,190,255,0)'); ctx.fillStyle = l; ctx.fillRect(x - R, y - R, R * 2, R * 2); ctx.restore();},
    ar() {const tr = 1 + .04 * Math.sin(t * 9), r0 = 60 * tr, r1 = 230 * tr;
      const g = ctx.createRadialGradient(lx, ly, r0, lx, ly, r1); g.addColorStop(0, 'rgba(1,3,12,0)'); g.addColorStop(1, 'rgba(1,3,12,.55)');
      ctx.fillStyle = g; ctx.fillRect(lx - 2000, ly - 2000, 4000, 4000);
      if (typeof desenhaEspadaAcesa === 'function') desenhaEspadaAcesa(1);}};})();
function vidaPasso(dt) {if (REGIAO !== 'garganta') return; VG.passo(dt);
  if (VG.escuro > .5 && !JOGO.auroraEscuro && !fala && typeof abreFala === 'function') {JOGO.auroraEscuro = true;   // primeira vez no escuro: a Aurora acende
    fala = {linhas: [['Jux', 'Escuro. Bem escuro.'], ['Aurora', 'Enquanto eu estiver na sua mão, Portador, você nunca vai ficar no escuro.', 1],
      ['✦', 'A lâmina da Aurora Gélida fica incandescente e ilumina o caminho.'], ['Jux', 'Espada, lanterna e conselheira. Melhor compra da minha vida. E foi de graça.']], i: 0, letras: 0, fim: () => {if (typeof salvaJogo === 'function') salvaJogo();}};}}
function vidaDesenha(camada) {if (REGIAO === 'garganta') VG.desenha(camada); else if (REGIAO === 'caverna') CAV[camada]();}
