/* ============ CINEMATICAS DO JUX NO ESTILO NOVO (FICHA_JUX_CINES_NOVAS.md) ============
   Carregado DEPOIS do script principal do index.html (usa CINES, CIN, CIMG). Cenas em HD: sprites_cine_jux.js (tools/cut_cine_jux.py).
   Cada Ressonancia ganha 5 cenas grandes, no formato das do Felipe; as vozes, legendas, sons e musica continuam os de antes.
   Uma cinematica so e trocada quando as 5 cenas dela existem (as outras seguem as antigas). */
'use strict';
(function () {
  const J = window.JUX_CINE_JUX;
  if (!J || typeof CIN === 'undefined') return;
  for (const [n, c] of Object.entries(J.cenas)) { CIN.cenas[n] = c; const i = new Image(); (window.depois || (f => f()))(() => { i.src = c.src; }); CIMG[n] = i; }
  const tem = id => [1, 2, 3, 4, 5].every(k => J.cenas['j' + id + '_' + k]);
  const REDUZ_ZOOM = .5;
  const G = '140,230,255', B = '235,250,255';
  const fa = (area, n, vy, cor, o) => Object.assign({t: 'faiscas', area, n, vy, vx: 0, cor, s: [2, 4]}, o || {});
  // RESSONANCIA: REI DO INVERNO. Runas e olhos, o salto na lua, a espada gigante ("Fuyu no Ou!"), a queda, a coroa
  if (tem('rei')) CINES.rei = Object.assign({}, CINES.rei, {barra: 14, tomadas: [
    {cena: 'jrei_1', som: ['brilho', 'zumbido'], d: 2.0, z: [1, 1.12], f: [[.5, .55], [.5, .48]], clarao: .6,
      fx: [{t: 'brilho', pts: [[.535, .22, .05]], v: 7, cor: 'rgba(140,230,255,.7)'}, {t: 'anel', x: .5, y: .82, r: .75, per: .55, ach: .25}, fa([.05, .55, .95, 1.05], 40, -110, G), fa([0, 0, 1, .6], 10, 0, B, {estrela: true})]},
    {cena: 'jrei_2', som: ['salto'], entra: 'chicote', d: 1.7, z: [1.1, 1.0], f: [[.5, .6], [.48, .35]],
      fx: [{t: 'varre', de: [.5, .9], ate: [.5, .2], v: 1.6}, fa([.2, .5, .8, 1], 50, -260, G, {risco: 30}), fa([0, 0, 1, .6], 12, 0, B, {estrela: true})]},
    {cena: 'jrei_3', som: ['zumbido', 'brilho'], voz: 'fuyu_no_ou', legenda: ['冬の王！', 'Rei do Inverno!'], entra: 'chicote', d: 2.2, z: [1.15, 1.0], f: [[.4, .5], [.55, .35]], tremor: [.3, .8, 7], clarao: .5,
      fx: [{t: 'raios', x: .62, y: .3, n: 14, L: .9, giro: .6, a: .14}, {t: 'varre', de: [.3, .5], ate: [.95, .05], v: 1.3}, {t: 'brilho', pts: [[.45, .37, .1]], v: 8}, fa([.1, .05, .95, .8], 45, -40, G, {vx: 60})]},
    {cena: 'jrei_4', som: ['queda'], entra: 'chicote', d: 1.6, z: [1.0, 1.25], f: [[.35, .3], [.65, .75]], tremor: [.4, 1, 8],
      fx: [{t: 'varre', de: [.3, .2], ate: [.78, .9], v: 1.6}, fa([.2, .1, .9, .95], 70, 240, G, {vx: 140, risco: 35})]},
    {cena: 'jrei_5', som: ['impacto', 'coroa'], entra: 'racha', d: 2.8, z: [1.12, 1.0], f: [[.4, .45], [.45, .45]], clarao: 1, tremor: [0, .35, 22], cacos: true, neve: true,
      fx: [{t: 'brilho', pts: [[.37, .1, .1]], v: 3, cor: 'rgba(200,240,255,.5)'}, {t: 'anel', x: .75, y: .62, r: 1, per: .45, ach: .3}, fa([0, 0, 1, .9], 14, 0, B, {estrela: true}), fa([.6, .4, .95, .7], 40, -50, G)]},
  ]});
  // RESSONANCIA II: ZERO ABSOLUTO. A mao crava ("Kooritsuke!"), o gelo sobe pelo corpo, os olhos, o tempo parado, o corte ("Zettai Reido!")
  if (tem('zero')) CINES.zero = Object.assign({}, CINES.zero, {barra: 14, musica: 'zero', tomadas: [
    {cena: 'jzero_1', som: ['crava'], voz: 'kooritsuke', legenda: ['凍りつけ！', 'Congele!'], d: 2.0, z: [1.0, 1.15], f: [[.55, .55], [.56, .62]], clarao: .7, tremor: [.1, .45, 8],
      fx: [{t: 'anel', x: .57, y: .85, r: .7, per: .5, ach: .22}, {t: 'brilho', pts: [[.57, .82, .1]], v: 12}, fa([.2, .6, .95, .98], 55, -130, G, {vx: 35})]},
    {cena: 'jzero_2', som: ['vento', 'brilho'], entra: 'chicote', d: 2.0, z: [1.12, 1.0], f: [[.45, .35], [.45, .5]], tremor: [.6, .95, 5],
      fx: [{t: 'brilho', pts: [[.42, .07, .04]], v: 9, cor: 'rgba(140,230,255,.8)'}, {t: 'anel', x: .45, y: .55, r: .55, per: .45, ach: .32}, fa([.1, .1, .9, .95], 45, -50, G, {vx: 70})]},
    {cena: 'jzero_3', som: ['brilho'], d: 1.8, z: [1.0, 1.12], f: [[.5, .45], [.5, .4]],
      fx: [{t: 'brilho', pts: [[.405, .42, .05], [.595, .42, .05]], v: 6, cor: 'rgba(90,205,255,.8)'}, fa([0, 0, 1, 1], 18, 0, B, {estrela: true, para: true})]},
    {cena: 'jzero_4', som: ['whoosh', 'tempo'], entra: 'racha', d: 2.0, z: [1.15, 1.0], f: [[.4, .55], [.55, .55]],
      fx: [{t: 'varre', de: [.05, .55], ate: [.7, .45], v: 2}, fa([0, 0, 1, .75], 26, 0, B, {para: true, s: [3, 5]})]},
    {cena: 'jzero_5', som: ['corte', 'impacto'], voz: 'zettai_reido', legenda: ['絶対零度！', 'Zero Absoluto!'], entra: 'chicote', d: 2.8, z: [1.12, 1.0], f: [[.5, .45], [.45, .45]], clarao: .9, tremor: [0, .4, 14], cacos: true,
      fx: [fa([0, .39, 1, .45], 110, 0, B, {corre: 1300, risco: 60}), {t: 'brilho', pts: [[.6, .42, .14]], v: 14}, fa([0, 0, 1, .9], 16, 0, B, {estrela: true})]},
  ]});
  // RESSONANCIA FINAL: ERA DO GELO. Ferido ("Mada owaranai"), vira o Rei do Inverno ("Mezamero, Aurora!"), a lua de cristal
  // ("Sekai yo, koore"), o cometa, o campo congelado ("Hyouga Jidai!"); a musica propria (musica:'final') continua
  if (tem('final')) CINES.final = Object.assign({}, CINES.final, {barra: 14, tomadas: [
    {cena: 'jfinal_1', som: ['vento'], voz: 'final_1', legenda: ['まだ…終わらない。', 'Ainda… não acabou.'], d: 2.6, z: [1.0, 1.12], f: [[.5, .5], [.55, .45]],
      fx: [{t: 'brilho', pts: [[.66, .75, .08]], v: 5, cor: 'rgba(140,230,255,.7)'}, fa([0, 0, 1, 1], 55, 90, B, {vx: -60}), fa([.55, .8, .75, 1], 12, -60, G, {estrela: true})]},
    {cena: 'jfinal_2', som: ['crava', 'brilho', 'zumbido'], voz: 'final_3', legenda: ['目覚めろ、オーロラ！', 'Desperte, Aurora!'], entra: 'chicote', d: 2.4, z: [1.12, 1.0], f: [[.45, .45], [.42, .3]], clarao: .9, tremor: [.05, .6, 11],
      fx: [{t: 'raios', x: .43, y: .08, n: 16, L: 1, giro: 1.2, a: .14}, {t: 'brilho', pts: [[.43, .1, .1]], v: 14}, {t: 'anel', x: .5, y: .9, r: .9, per: .4, ach: .25}, fa([0, .4, 1, 1], 70, -160, G)]},
    {cena: 'jfinal_3', som: ['zumbido', 'brilho'], voz: 'final_5', legenda: ['世界よ、凍れ。', 'Mundo… congele.'], d: 2.6, z: [1.0, 1.15], f: [[.5, .6], [.5, .35]],
      fx: [{t: 'raios', x: .5, y: .25, n: 18, L: 1, giro: .35, a: .14}, {t: 'brilho', pts: [[.5, .22, .25]], v: 2.5, cor: 'rgba(200,240,255,.4)'}, fa([0, 0, 1, .7], 30, 0, B, {estrela: true})]},
    {cena: 'jfinal_4', som: ['queda', 'whoosh'], entra: 'chicote', d: 1.8, z: [1.0, 1.25], f: [[.4, .35], [.62, .7]], tremor: [.2, 1, 12],
      fx: [{t: 'varre', de: [.2, .15], ate: [.85, .9], v: 2}, fa([0, 0, 1, .9], 110, 330, G, {vx: 220, risco: 45}), {t: 'brilho', pts: [[.85, .9, .12]], v: 18}]},
    {cena: 'jfinal_5', som: ['impacto', 'raio', 'coroa'], voz: 'final_7', legenda: ['氷河時代！', 'Era do Gelo!'], entra: 'racha', d: 3.2, z: [1.15, 1.0], f: [[.45, .5], [.42, .45]], clarao: 1, tremor: [0, .35, 26], cacos: true, neve: true,
      fx: [{t: 'anel', x: .6, y: .62, r: 1.1, per: .35, ach: .3}, {t: 'brilho', pts: [[.73, .12, .14]], v: 3, cor: 'rgba(200,240,255,.45)'}, fa([0, 0, 1, .7], 20, 0, B, {estrela: true})]},
  ]});
  for (const id of ['rei', 'zero', 'final']) if (tem(id)) for (const t of CINES[id].tomadas) if (t.z) t.z = t.z.map(z => +(1 + (z - 1) * REDUZ_ZOOM).toFixed(3));
})();
