/* ============ CAPÍTULO 3, PARTE C: "Um rosto conhecido" — a entrada do FELIPE (FICHA_CAP3_FELIPE.md) ============
   Depois de ler o mural da praça, a estrela leva ao beco embaixo do telhado da rede (as oficinas, em cima à esquerda).
   Chegando lá, toca a cutscene de 7 cenas (assets/cine_felipe/cena_N.jpg, de ref/felipe_entrada via tools/brasaria_mapa.py).
   No fim: JOGO.cap3.felipe = true e JOGO.cap3.fase = 'felipe'; a rede fica vazia (sem o "z z z").
   Vozes (ROTEIRO_VOZ_FELIPE.md): assets/voz/<id>.ogg|.mp3; enquanto não existirem, fica só a legenda.
   Carregar DEPOIS de brasaria.js (usa brC3, brB, brFxCena, brRnd) e ANTES de vila_motor.js. */
'use strict';
const FE_PONTO = { id: 'beco_rede', x: 488, y: 352, r: 46 };   // o chão andável mais perto da escada do telhado da rede
const feEntrou = () => !!(typeof JOGO === 'object' && JOGO.cap3 && JOGO.cap3.felipe);
const FE_VOZ_IDS = ['felipe_1_jux', 'felipe_1_felipe', 'felipe_2_felipe', 'felipe_2_jux', 'felipe_3_jux', 'felipe_3_felipe',
  'felipe_4_felipe_a', 'felipe_4_jux', 'felipe_4_felipe_b', 'felipe_5_felipe_a', 'felipe_5_jux', 'felipe_5_felipe_b',
  'felipe_6_bino', 'felipe_6_felipe_a', 'felipe_6_jux', 'felipe_6_felipe_b', 'felipe_6_aurora',
  'felipe_7_jux_a', 'felipe_7_felipe', 'felipe_7_jux_b', 'felipe_7_bino'];

// ---- efeitos por cima das imagens: fiapos de vento verde-claro e penas brancas girando (o vento nunca para em volta dele) ----
const feFx = { vento: [], penas: [], ultT: 0, cena: -1 };
function feVentoCena(tt, i, o) {
  o = o || {}; const F = feFx;
  if (F.cena !== i) { F.cena = i; F.vento.length = 0; F.penas.length = 0; F.ultT = tt; }
  const dt = Math.max(0, Math.min(.05, tt - F.ultT)); F.ultT = tt;
  const cx = (o.cx != null ? o.cx : .5) * W, cy = (o.cy != null ? o.cy : .5) * H, forca = o.forca || 1;
  if (Math.random() < .12 * forca) F.vento.push({ a: brRnd(0, 6.28), r: brRnd(.08, .32) * W, v: 0, d: brRnd(1.2, 2.2), y0: brRnd(-.25, .25) * H, s: brRnd(.6, 1.2) });
  if (o.penas && Math.random() < .03 * forca) F.penas.push({ x: cx + brRnd(-.25, .25) * W, y: cy + brRnd(-.2, .25) * H, v: 0, d: brRnd(3, 5), r: brRnd(0, 6.28), vr: brRnd(-2, 2) });
  for (const f of F.vento) f.v += dt; for (const p of F.penas) { p.v += dt; p.y -= 14 * dt; p.x += Math.sin(tt * 1.4 + p.r) * 26 * dt; p.r += p.vr * dt; }
  F.vento = F.vento.filter(f => f.v < f.d); F.penas = F.penas.filter(p => p.v < p.d);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
  for (const f of F.vento) {   // um arco de vento que gira em volta do centro e some
    const k = f.v / f.d, al = Math.sin(k * Math.PI) * .45, a0 = f.a + k * 2.4 * f.s;
    ctx.strokeStyle = `rgba(170,255,150,${al})`; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.ellipse(cx, cy + f.y0, f.r, f.r * .32, 0, a0, a0 + .9); ctx.stroke();
    ctx.strokeStyle = `rgba(235,255,225,${al * .7})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(cx, cy + f.y0 - 2, f.r * .97, f.r * .3, 0, a0 + .1, a0 + .7); ctx.stroke(); }
  ctx.globalCompositeOperation = 'source-over';
  for (const p of F.penas) {   // pena branca: um fiapo com a haste
    const al = Math.min(1, p.v * 2, (p.d - p.v) * 1.5);
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = al;
    ctx.fillStyle = '#f4f1e8'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 3, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#b9ad95'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke(); ctx.restore(); }
  ctx.restore();
}
// flashback: vinheta clara nas bordas (as imagens já vêm lavadas)
function feFlash() {
  ctx.save(); const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .35, W / 2, H / 2, Math.max(W, H) * .7);
  g.addColorStop(0, 'rgba(255,250,240,0)'); g.addColorStop(1, 'rgba(255,250,240,.28)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}
// ---- as 7 cenas (sistema do motor: cada cena segura no fim com 'ENTER ▶ continuar'; ESC pula) ----
const FE_CENAS = [
  { mus: 'vila', cam: [.55, .6, 1.0, .58, .62, 1.1], dur: 7.8, fx: 'cinzas', extra: (tt, i) => { brFxCena(tt, i); feVentoCena(tt, i, { cx: .65, cy: .85, forca: .6 }); },
    vozes: [[1.5, 'felipe_1_jux'], [4.2, 'felipe_1_felipe']],
    falas: [[1.5, 'Jux', 'Ei! Quase virou espetinho!'], [4.2, '???', '…Ele roubou o meu pão.']],
    sons: [[.1, 'fe_assobio'], [.5, 'fe_impacto'], [.7, 'oinc'], [2.9, 'oinc']], treme: [.6, .9] },
  { mus: 'vila', cam: [.5, .62, 1.12, .5, .45, 1.0], dur: 8, fx: 'cinzas', extra: (tt, i) => { brFxCena(tt, i); feVentoCena(tt, i, { cx: .6, cy: .55, penas: true }); },
    vozes: [[1.2, 'felipe_2_felipe'], [6.3, 'felipe_2_jux']],
    falas: [[1.2, '???', 'Um mês sem ninguém me acordar. Um mês.'], [6.3, 'Jux', 'Essa voz…']], sons: [[.4, 'fe_whoosh']] },
  { mus: 'vila', cam: [.35, .65, 1.1, .62, .4, 1.04], dur: 7, fx: 'cinzas', extra: (tt, i) => { brFxCena(tt, i); feVentoCena(tt, i, { cx: .78, cy: .3, forca: .7 }); },
    vozes: [[1.0, 'felipe_3_jux'], [2.2, 'felipe_3_felipe']],
    falas: [[1.0, 'Jux', '…FELIPE?!'], [2.2, 'Felipe', '…Jux? Você também caiu no jogo?']], sons: [[5.6, 'oinc']] },
  { mus: 'piano', cam: [.4, .5, 1.0, .45, .55, 1.12], dur: 11.5, extra: (tt, i) => { feVentoCena(tt, i, { cx: .38, cy: .72, penas: true, forca: 1.3 }); feFlash(); },
    vozes: [[1.0, 'felipe_4_felipe_a'], [5.3, 'felipe_4_jux'], [7.9, 'felipe_4_felipe_b']],
    falas: [[1.0, 'Felipe', 'Cochilei no sofá. Acordei caindo do céu.'], [5.3, 'Jux', 'Eu acordei num chiqueiro.'], [7.9, 'Felipe', '…Então eu tive upgrade.']],
    sons: [[.5, 'fe_whoosh']] },
  { mus: 'ordem', cam: [.3, .5, 1.08, .62, .55, 1.0], dur: 17, fx: 'cinzas', extra: (tt, i) => { brFxCena(tt, i); feFlash(); },
    vozes: [[1.0, 'felipe_5_felipe_a'], [9.0, 'felipe_5_jux'], [12.2, 'felipe_5_felipe_b']],
    falas: [[1.0, 'Felipe', 'Faz um mês que eu vejo essas carroças sair. Armadura vazia andando sozinha. Não é pro rei.'],
      [9.0, 'Jux', 'A flecha na trilha… foi você.'], [12.2, 'Felipe', 'Vocês iam morrer. Daria trabalho enterrar.']], sons: [] },
  { mus: 'bino_a', cam: [.62, .3, 1.12, .5, .55, 1.0], dur: 17, fx: 'cinzas', extra: (tt, i) => { brFxCena(tt, i); feVentoCena(tt, i, { cx: .63, cy: .6, penas: true, forca: 1.4 }); },
    vozes: [[.9, 'felipe_6_bino'], [2.0, 'felipe_6_felipe_a'], [4.2, 'felipe_6_jux'], [7.4, 'felipe_6_felipe_b'], [11.0, 'felipe_6_aurora']],
    falas: [[.9, 'Bino', '…Vento.'], [2.0, 'Felipe', 'Oi, grandão.'], [4.2, 'Jux', 'Felipe… você não tem sombra.'],
      [7.4, 'Felipe', 'Percebi. Economiza protetor solar.'], [11.0, 'Aurora', 'Dois sem sombra, Portador. Isso não é acaso.']],
    sons: [[.2, 'fe_whoosh'], [10.8, 'brilho']] },
  { mus: 'bino_a', cam: [.5, .55, 1.12, .5, .45, 1.0], dur: 11, fx: 'cinzas', extra: (tt, i) => { brFxCena(tt, i); feVentoCena(tt, i, { cx: .5, cy: .55, penas: true }); },
    vozes: [[1.0, 'felipe_7_jux_a'], [2.6, 'felipe_7_felipe'], [6.1, 'felipe_7_jux_b'], [7.3, 'felipe_7_bino']],
    falas: [[1.0, 'Jux', 'Entra no time?'], [2.6, 'Felipe', 'Entro. Mas depois do almoço eu durmo.'], [6.1, 'Jux', 'Justo.'], [7.3, 'Bino', '…Justo.'],
      [8.8, '✦', 'Felipe entrou no time!']], sons: [[8.8, 'brilho'], [9.6, 'oinc']] },
];
let FE_IMG = [];

// ---- a história: a estrela leva ao beco, e chegando lá a cutscene toca ----
function fePontoAtivo() { return typeof JOGO === 'object' && brB().mural && !feEntrou(); }
function fePasso() {
  if (REGIAO !== 'brasaria' || typeof V !== 'object') return;
  const i = V.pontos.findIndex(p => p.id === FE_PONTO.id), quer = fePontoAtivo();
  if (quer && i < 0) V.pontos.push(Object.assign({}, FE_PONTO)); else if (!quer && i >= 0) V.pontos.splice(i, 1);
  if (!quer || ab.on || fala || (typeof UI === 'object' && UI.menu)) return;
  if (Math.hypot(hero.x - FE_PONTO.x, hero.y - FE_PONTO.y) < FE_PONTO.r) feComeca();
}
function feComeca() {
  hero.alvo = null; hero.pontoAlvo = null; for (const k in teclas) teclas[k] = false;
  tocaFilme(FE_CENAS, FE_IMG, feFim);
}
function feFim() {
  const C = brC3(); C.felipe = true; C.fase = 'felipe';
  JOGO.felipe = Object.assign({ entrou: true, nivel: Math.max(1, JOGO.nivel | 0), exp: 0 }, JOGO.felipe || {}, { ativo: true });   // ativo: luta junto (felipe_batalha.js)
  hero.x = FE_PONTO.x; hero.y = FE_PONTO.y + 10; hero.olha = 'baixo'; cam.x = hero.x; cam.y = hero.y; if (typeof BT !== 'undefined') BT.posto = false;
  if (typeof som === 'function' && typeof SOM === 'object') som(SOM.ui_vez, .9);
  if (typeof aviso === 'function') aviso('Felipe entrou no time! Ele luta junto e aprende golpes novos a cada nível.', '#a8f0a0');
  salvaVila();
  // a luta de estreia: dois Forjados fugiram de uma forja e invadem a praça
  setTimeout(() => brFala(FE_FALAS.estreia, () => iniciaProva('felipe_estreia', true)), 900);
}
const FE_FALAS = {
  estreia: [['✦', 'Um estrondo de ferro vem da praça: dois Forjados escaparam de uma forja!'], ['Felipe', '…Eu ia dormir agora.'],
    ['Jux', 'Primeira luta do time de três. Felipe, de longe. Bino, na frente.'], ['Bino', '…Na frente.']],
  denovo: [['✦', 'Os Forjados ainda estão na praça.'], ['Felipe', '…Eles não cansam? Eu canso.']],
  fim: [['Felipe', '…Pronto. Posso voltar pra rede?'], ['Jux', 'Pode. Mas a rede agora vem com a gente.'],
    ['Bino', '…Eu carrego.'], ['✦', 'O Felipe agora está no menu Grupo: Status, Equipar, Habilidades, Ecos e a Formação.']],
};
// voltou da luta de estreia: venceu = fala do fim; perdeu = os Forjados continuam lá (luta de novo)
function fePosLuta() {
  if (!feEntrou()) return false;
  const pv = JOGO.provas || {};
  if (pv.felipe_estreia === 'vencida') { pv.felipe_estreia = 'feita'; salvaJogo(); setTimeout(() => brFala(FE_FALAS.fim), 700); return true; }
  if (pv.felipe_estreia !== 'feita') { setTimeout(() => brFala(FE_FALAS.denovo, () => iniciaProva('felipe_estreia', true)), 700); return true; }
  return false;
}
// estrela do minimapa depois do mural
function feDestino() { return fePontoAtivo() ? { reg: 'brasaria', x: FE_PONTO.x, y: FE_PONTO.y, txt: 'Siga o Sir Bacon até o beco da rede' } : null; }

// ---- registra no motor (chamado pelo regiaoInit do brasaria.js) ----
function feInit() {
  NOMES[FE_PONTO.id] = 'Beco da rede';
  if (typeof PROVAS === 'object') PROVAS.felipe_estreia = { tipos: ['forjado', 'forjado'], nv: 19, extra: { fundo: 'cinzas' } };
  COR.Felipe = '#a8f0a0'; RET_DE.Felipe = 'felipe';
  for (const id of FE_VOZ_IDS) VOZES[id] = arq('assets/voz/' + id);
  SOM_CINE.fe_whoosh = arq('assets/sfx/whoosh');
  SOM_CINE.fe_assobio = arq('assets/sfx/novos/felipe_solta');   // a flecha de verdade (CREDITOS.txt), no lugar do assobio sintetizado
  SOM_CINE.fe_impacto = arq('assets/sfx/novos/felipe_impacto');
  FE_IMG = imgsFilme([1, 2, 3, 4, 5, 6, 7].map(n => 'assets/cine_felipe/cena_' + n + '.jpg'));
  FILMES.push({ id: 'felipe', nome: 'Um rosto conhecido', c: () => FE_CENAS, i: () => FE_IMG, visto: feEntrou });
  // laboratório: brasaria.html#cine_felipe só toca o filme
  if (location.hash.split('?')[0] === '#cine_felipe') setTimeout(() => tocaFilme(FE_CENAS, FE_IMG, () => {}), 1500);
}
