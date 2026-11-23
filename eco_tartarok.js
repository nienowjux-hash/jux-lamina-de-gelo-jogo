/* ============ TARTAROK EM CAMPO (FICHA_ECO_TARTAROK.md, aprovada 2026-11-21) ============
   O Eco do Guardiao: a tartaruga gigante fica atras do heroi dela (normalmente o Bino) e faz os golpes SOZINHA (regra do usuario:
   golpe de Eco so com a criatura). Ela nao fala alto: telepatia (balao verde + som de natureza, ecoPensa).
   Folhas: ecos_tartarok.js (tools/cut_eco_tartarok.py) -> tartarok_campo/casco/abraco/tremor/floresta/ilha (8 quadros cada, ecoQ escolhe).
   Efeitos (fundo preto, fxiPlay): tarta_escudo, tarta_cura, tarta_tremor, tarta_raizes. Sons: tartarok_* (tools/cria_sons_tartarok.py).
   Carregar depois do index.html (usa ECO, ecoQ, posEco, aliados, acertaTodos do bino_batalha.js). */
'use strict';
const VERDE_T = '150,255,140', VERDE_T2 = '200,255,170';
// efeito com o CHAO no lugar certo (a ancora do fxiPlay e o meio do quadro; 'pe' = meio ate o chao)
function fxTarta(nome, x, chao, ms, esc, o) {
  const I = (typeof FXI !== 'undefined') && FXI[nome]; if (!I) return;
  fxiPlay(nome, x, chao - (I.pe || I.h / 2) * esc, ms, Object.assign({escala: esc}, o || {}));
}
const vivosT = () => aliados().filter(a => a.hp > 0 && !a.dead);
const quadroT = async (A, lista) => { for (const [i, ms, fn] of lista) { ecoQ(A, i); if (fn) fn(); await wait(ms); } };

// Casco Ancestral (Nv 1): ela da um passo, firma as patas e o casco brilha; um escudo de casco e folhas cobre cada heroi (-30% de dano, 4 turnos)
async function ecoCasco(H) {
  const A = 'tartarok_casco', p = posEco();
  ecoPensa('Fiquem atrás de mim, pequenos.', 2000);
  await quadroT(A, [
    [0, 380, () => som('tartarok_rosna', .6)],
    [1, 300, () => { tween(ECO, 'dx', -34, 280, easeOut); som('tartarok_casco', .7); shake = Math.max(shake, 5); }],
    [2, 260, () => { fxAnel(p.x - 34, p.y + 4, {raio: 260, achata: .24, ms: 500, esp: 14, cor: VERDE_T}); }],
    [3, 260],
    [4, 420, () => { som('tartarok_casco', 1); som('tartarok_folhas', .8); shake = Math.max(shake, 9);
      fxBrilho(p.x - 34, p.y - 110, {raio: 260, ms: 700, cresce: true, cor: VERDE_T});
      for (const a of vivosT()) { fxTarta('tarta_escudo', a.x - a.lunge, a.y + 10, 1300, 1.05, {alpha: .8}); poeEstado(a, 'casco', 4);
        setTimeout(() => pop(a.x, a.y - 215, 'CASCO −30%', '#9dff8a'), 350); } }],
    [5, 420],
    [6, 300, () => tween(ECO, 'dx', 0, 300, easeOut)],
    [7, 380],
  ]);
  ecoVolta();
}

// Abraco da Floresta (Nv 10): o salgueiro do casco floresce; uma coluna de luz com petalas cai em cada heroi: +30% do HP e Regen 3 turnos
async function ecoAbraco(H) {
  const A = 'tartarok_abraco', p = posEco(), esp = (statsDe(hero).esp_ || {});
  ecoPensa('Descansem. A floresta cuida de vocês.', 2200);
  await quadroT(A, [
    [0, 360], [1, 320, () => som('tartarok_folhas', .9)],
    [2, 320, () => fxBrilho(p.x, p.y - 190, {raio: 200, ms: 900, cresce: true, cor: VERDE_T2})],
    [3, 320],
    [4, 360, () => { som('tartarok_cura', 1); for (const a of vivosT()) fxTarta('tarta_cura', a.x - a.lunge, a.y + 10, 1500, 1.25); }],
    [5, 600, () => { for (const a of vivosT()) { const n = Math.min(Math.round(a.max * .30 * (1 + (esp.curaMais || 0))), a.max - a.hp); a.hp += n; poeEstado(a, 'regen', 3);
      pop(a.x, a.y - 190, '+' + n, '#7dffa8'); setTimeout(() => pop(a.x, a.y - 225, 'REGEN', '#7dffa8'), 300); } }],
    [6, 360], [7, 360],
  ]);
  ecoVolta();
}

// Tremor do Casco (Nv 20): empina e bate as patas no chao; a terra racha embaixo de cada inimigo (dano de terra, 30% atordoar)
async function ecoTremor(H) {
  const A = 'tartarok_tremor', p = posEco();
  ecoPensa('A terra me ouve.', 1800);
  await quadroT(A, [
    [0, 300, () => som('tartarok_rosna', .8)],
    [1, 240],
    [2, 300, () => { som('tartarok_rosna', 1); tween(G, 'dim', .35, 300); }],
    [3, 280],
    [4, 120],
    [5, 520, () => { som('tartarok_casco', 1); som('tartarok_tremor', 1); shake = Math.max(shake, 22); flash = .25;
      fxAnel(p.x - 80, p.y + 6, {raio: 700, achata: .2, ms: 800, esp: 26, cor: '214,190,150'});
      for (const e of inimigos()) fxTarta('tarta_tremor', e.x, e.y + 12, 1100, 1.15);
      setTimeout(() => acertaTodos(H.poder[0], ['atordoado', 1, .3]), 280); }],
    [6, 380],
    [7, 300, () => tween(G, 'dim', 0, 400)],
  ]);
  ecoVolta();
}

// Floresta Viva (Nv 45): raizes saem do chao e fecham uma gaiola em cada inimigo: dano, Lento 3 turnos; o time recupera 30% do dano feito
async function ecoFloresta(H) {
  const A = 'tartarok_floresta', p = posEco();
  ecoPensa('Raízes antigas… segurem!', 2000);
  await quadroT(A, [
    [0, 340, () => fxBrilho(p.x - 70, p.y - 120, {raio: 120, ms: 500, cresce: true, cor: VERDE_T})],
    [1, 280, () => som('tartarok_rosna', .6)],
    [2, 280, () => som('tartarok_raizes', 1)],
    [3, 260],
    [4, 260, () => { for (const e of inimigos()) fxTarta('tarta_raizes', e.x, e.y + 12, 1700, 1.15); }],
    [5, 520, () => som('tartarok_raizes', .9)],
    [6, 460, () => { const v = inimigos(), antes = v.reduce((s, e) => s + e.hp, 0); acertaTodos(H.poder[0], ['lento', 3, 1]); shake = Math.max(shake, 8);
      const feito = antes - v.reduce((s, e) => s + Math.max(0, e.hp), 0), cura = Math.round(feito * .3 / Math.max(1, vivosT().length));
      if (cura > 0) setTimeout(() => { som('tartarok_cura', .5); for (const a of vivosT()) { const n = Math.min(cura, a.max - a.hp); a.hp += n; pop(a.x, a.y - 190, '+' + n, '#7dffa8'); fxBrilho(a.x, a.y - 90, {raio: 120, ms: 500, cor: VERDE_T}); } }, 500); }],
    [7, 520],
  ]);
  ecoVolta();
}

// Ilha Viva (Nv 100, suprema): ela cresce ate virar a ilha gigante com cachoeiras; o time fica protegido (sem dano, 2 turnos) e cura tudo
async function ecoIlha(H) {
  const A = 'tartarok_ilha', p = posEco();
  // a cutscene toca primeiro (so a tartaruga, FICHA_CINE_ILHA_VIVA.md); depois a ilha em campo
  cineMusica(true); if (CINES.ilha && CIN.cenas.ilha_1) await cinematica('ilha');
  fxCinema(true, '130,255,150'); tween(G, 'dim', .55, 500);
  await quadroT(A, [
    [0, 500, () => som('tartarok_rosna', .9)],
    [1, 400, () => { som('tartarok_tremor', .7); shake = Math.max(shake, 6); }],
    [2, 420, () => { som('tartarok_ilha', 1); tween(ECO, 'esc', 1.12, 900, easeOut); fxBrilho(p.x, p.y - 150, {raio: 340, ms: 1200, cresce: true, cor: VERDE_T}); }],
    [3, 420, () => { shake = Math.max(shake, 14); }],
    [4, 520, () => { fxFlash('200,255,190', .45, 500); som('tartarok_casco', 1);
      for (const a of vivosT()) { fxTarta('tarta_escudo', a.x - a.lunge, a.y + 10, 1500, 1.3, {alpha: .6}); fxTarta('tarta_cura', a.x - a.lunge, a.y + 10, 1500, 1.4); } }],
    [5, 700, () => { som('tartarok_cura', 1); for (const a of vivosT()) { const n = a.max - a.hp; a.hp = a.max; poeEstado(a, 'ilha', 2);
      pop(a.x, a.y - 190, n > 0 ? '+' + n : 'HP CHEIO', '#7dffa8'); setTimeout(() => pop(a.x, a.y - 225, 'ILHA VIVA: SEM DANO', '#9dff8a'), 350); } }],
    [6, 500, () => tween(ECO, 'esc', 1, 700, easeOut)],
    [7, 500],
  ]);
  ecoPensa('Descansem na minha sombra.', 1800);
  tween(G, 'dim', 0, 500); fxCinema(false); ecoVolta(); cineMusica(false); await wait(300);
}
Object.assign(ECO_GOLPES, {casco: ecoCasco, abraco: ecoAbraco, tremor: ecoTremor, floresta: ecoFloresta, ilha: ecoIlha});

// enquanto dura: o escudo de casco (fraco) ou a ilha (forte) brilhando em volta de cada heroi protegido
function drawEstadosTarta(c, t) {
  if (typeof FXI === 'undefined' || !FXI.tarta_escudo || !FXI_IMG.tarta_escudo.complete) return;
  const I = FXI.tarta_escudo, im = FXI_IMG.tarta_escudo;
  for (const a of aliados()) { if (a.hp <= 0) continue; const ilha = temEst(a, 'ilha'); if (!ilha && !temEst(a, 'casco')) continue;
    const sc = ilha ? 1.15 : .95, x = a.x - a.lunge, y = a.y + 10 - I.pe * sc;
    c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = (ilha ? .38 : .2) + .06 * Math.sin(t * 2.4 + (a.quem === 'bino' ? 1 : 0)); c.imageSmoothingEnabled = false;
    c.drawImage(im, ...fxSrc(I, 5), x - I.w * sc / 2, y - I.h * sc / 2, I.w * sc, I.h * sc); c.restore(); }
}
