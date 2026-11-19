/* ============ CINEMATICAS DO BINO (as 3 habilidades especiais) ============
   Carregado DEPOIS do script principal do index.html (usa CINES, CIN, CIMG). Cenas: sprites_cine_bino.js (tools/cut_cine_bino.py).
   Nenhuma cena tem inimigo: o golpe acerta o chao e o ar. Legendas, sons, tremor e clarao saem daqui. Formato igual ao CINES.ragnarok. */
'use strict';
(function () {
  const B = window.JUX_CINE_BINO;
  if (!B || typeof CIN === 'undefined') return;
  for (const [n, c] of Object.entries(B.cenas)) { CIN.cenas[n] = c; const i = new Image(); i.src = c.src; CIMG[n] = i; }
  const REDUZ_ZOOM = .4;   // o zoom das tomadas foi cortando rostos: fica so 40% dele
  const V = '255,80,60', O = '255,170,80', D = '255,214,130';   // vermelho da furia, laranja do por do sol, dourado do amanhecer
  const fa = (area, n, vy, cor, o) => Object.assign({t: 'faiscas', area, n, vy, vx: 0, cor, s: [2, 4]}, o || {});
  // Furia Barbara (nv 74): o campo, o rosto, os olhos vermelhos, o rugido, o urso de fumaca, a corrida, o golpe no chao
  CINES.bfuria = {barra: 14, nome: 'FÚRIA BÁRBARA', sub: 'Bino', tomadas: [
    {cena: 'bfuria_1', som: ['vento'], d: 2.0, z: [1, 1.12], f: [[.5, .6], [.5, .55]], fx: [fa([.1, .6, .9, 1], 30, -50, O)]},
    {cena: 'bfuria_2', som: [], d: 1.5, z: [1.05, 1.2], f: [[.4, .5], [.42, .48]], tremor: [.4, 1, 3], fx: [fa([.5, .5, 1, 1], 20, -40, O)]},
    {cena: 'bfuria_3', som: [], d: 1.4, z: [1, 1.25], f: [[.3, .5], [.3, .5]], clarao: .6, tremor: [0, 1, 5],
      fx: [{t: 'brilho', pts: [[.2, .5, .1], [.62, .5, .1]], v: 7, cor: 'rgba(255,60,40,.7)'}, fa([0, .3, 1, .9], 30, -60, V)]},
    {cena: 'bfuria_4', voz: 'bino_furia_1', legenda: ['誰にも触れさせん！', 'Ninguém encosta neles!'], som: ['bino_rugido'], entra: 'chicote', d: 1.7, z: [1.25, 1.0], f: [[.5, .3], [.5, .45]], clarao: .9, tremor: [0, 1, 14],
      fx: [{t: 'raios', x: .5, y: .15, n: 14, L: .9, giro: .6, a: .16, cor: V}, {t: 'anel', x: .5, y: .88, r: .8, per: .5, ach: .28, cor: V}, fa([.1, .5, .9, 1], 70, -120, V)]},
    {cena: 'bfuria_5', som: ['bino_urso'], d: 1.9, z: [1, 1.15], f: [[.5, .4], [.5, .35]], tremor: [.2, 1, 6],
      fx: [{t: 'raios', x: .75, y: .3, n: 12, L: .8, giro: .4, a: .14, cor: V}, fa([0, .4, 1, 1], 40, -80, V)]},
    {cena: 'bfuria_6', voz: 'bino_furia_2', legenda: ['狂戦士の怒り！', 'Fúria Bárbara!'], som: [], entra: 'chicote', d: 1.4, z: [1, 1.25], f: [[.5, .7], [.5, .6]], tremor: [.2, 1, 8],
      fx: [fa([0, 0, 1, 1], 90, 60, V, {vx: 300, risco: 40}), {t: 'brilho', pts: [[.42, .3, .1]], v: 8, cor: 'rgba(255,80,60,.6)'}]},
    {cena: 'bfuria_7', som: ['bino_golpe'], entra: 'chicote', d: 2.2, z: [1.3, 1.05], f: [[.5, .75], [.5, .6]], clarao: 1, tremor: [0, .8, 26], cacos: true,
      fx: [{t: 'anel', x: .5, y: .85, r: 1, per: .35, ach: .3, cor: V}, {t: 'raios', x: .5, y: .8, n: 18, L: 1, giro: 1, a: .22, cor: V}, fa([.3, .6, .7, .9], 140, 0, V, {radial: 560})]},
  ]};
  // Esmaga-Montanhas (nv 86): o desfiladeiro, as botas afundando, o agachamento, o salto, o sol, a queda, o impacto
  CINES.besmaga = {barra: 14, nome: 'ESMAGA-MONTANHAS', sub: 'Bino', tomadas: [
    {cena: 'besmaga_1', som: ['vento'], d: 2.0, z: [1, 1.1], f: [[.5, .6], [.5, .5]], fx: [fa([0, .3, 1, 1], 24, -30, D)]},
    {cena: 'besmaga_2', som: [], entra: 'chicote', d: 1.3, z: [1.1, 1.0], f: [[.3, .8], [.4, .75]], tremor: [.2, 1, 6], fx: [fa([.1, .7, .8, 1], 40, -90, D)]},
    {cena: 'besmaga_3', som: [], d: 1.3, z: [1.15, 1.0], f: [[.5, .7], [.5, .6]], tremor: [.2, 1, 5], fx: [fa([.2, .6, .9, 1], 40, -80, D)]},
    {cena: 'besmaga_4', voz: 'bino_esmaga_1', legenda: ['山砕き！', 'Esmaga-Montanhas!'], som: [], entra: 'chicote', d: 1.2, z: [1.2, 1.0], f: [[.5, .85], [.5, .35]], tremor: [0, .6, 8],
      fx: [{t: 'anel', x: .5, y: .9, r: .7, per: .5, ach: .25, cor: D}, fa([.2, .6, .8, 1], 60, -160, D)]},
    {cena: 'besmaga_5', som: [], d: 1.7, z: [1, 1.2], f: [[.5, .4], [.5, .35]], fx: [{t: 'brilho', pts: [[.52, .38, .16]], v: 4, cor: 'rgba(255,240,190,.55)'}, fa([0, 0, 1, 1], 20, 20, D, {estrela: true})]},
    {cena: 'besmaga_6', som: [], entra: 'chicote', d: 1.3, z: [1, 1.3], f: [[.5, .2], [.5, .7]], tremor: [.3, 1, 6],
      fx: [{t: 'varre', de: [.5, .1], ate: [.5, .8], v: 1.6}, fa([0, 0, 1, 1], 80, 260, D, {risco: 30})]},
    {cena: 'besmaga_7', som: ['bino_golpe'], entra: 'chicote', d: 2.3, z: [1.3, 1.05], f: [[.5, .7], [.5, .6]], clarao: 1, tremor: [0, .7, 28], cacos: true,
      fx: [{t: 'anel', x: .5, y: .8, r: 1, per: .35, ach: .3, cor: D}, {t: 'raios', x: .5, y: .75, n: 16, L: 1, giro: .8, a: .2, cor: D}, fa([.3, .6, .7, .9], 130, 0, D, {radial: 520})]},
  ]};
  // Queda da Montanha (nv 100, suprema): a planicie, o chao tremendo, as montanhas voando, a marreta crescendo, a marreta-montanha, o rosto, o golpe
  CINES.bqueda = {barra: 14, nome: 'QUEDA DA MONTANHA', sub: 'Bino', tomadas: [
    {cena: 'bqueda_1', som: ['vento'], d: 2.2, z: [1, 1.1], f: [[.5, .6], [.5, .5]], fx: [fa([0, .5, 1, 1], 24, -30, O)]},
    {cena: 'bqueda_2', som: ['bino_rumble'], d: 1.8, z: [1.05, 1.2], f: [[.5, .6], [.5, .5]], tremor: [.2, 1, 7], fx: [fa([.1, .5, .9, 1], 60, -120, O)]},
    {cena: 'bqueda_3', voz: 'bino_queda_1', legenda: ['山よ、力を貸せ。', 'Montanha, empreste sua força.'], som: [], d: 1.9, z: [1, 1.2], f: [[.5, .7], [.5, .55]], tremor: [0, 1, 8], fx: [{t: 'raios', x: .5, y: .7, n: 12, L: .9, giro: .3, a: .1, cor: O}, fa([0, 0, 1, 1], 60, -100, O)]},
    {cena: 'bqueda_4', som: [], entra: 'chicote', d: 1.7, z: [1.15, 1.0], f: [[.4, .5], [.45, .4]], clarao: .6, tremor: [0, 1, 9], fx: [fa([0, 0, 1, 1], 70, -60, O)]},
    {cena: 'bqueda_5', som: [], d: 2.4, z: [1, 1.18], f: [[.5, .8], [.5, .3]], tremor: [0, 1, 6], fx: [{t: 'raios', x: .5, y: .1, n: 14, L: 1, giro: .2, a: .1, cor: O}, fa([.2, .7, .8, 1], 40, -140, O)]},
    {cena: 'bqueda_6', voz: 'bino_queda_2', legenda: ['山落とし！', 'Queda da Montanha!'], som: ['bino_rugido_queda'], entra: 'chicote', d: 1.5, z: [1.0, 1.25], f: [[.4, .5], [.45, .45]], clarao: .5, tremor: [0, 1, 7], fx: [{t: 'brilho', pts: [[.46, .26, .08]], v: 7, cor: 'rgba(255,60,40,.7)'}]},
    {cena: 'bqueda_7', som: ['bino_golpe','bino_pedras'], entra: 'chicote', d: 3.0, z: [1.05, 1.2], f: [[.5, .6], [.5, .62]], clarao: 1, tremor: [0, .8, 34], cacos: true,
      fx: [{t: 'anel', x: .5, y: .8, r: 1.1, per: .4, ach: .3, cor: O}, {t: 'raios', x: .5, y: .75, n: 22, L: 1.2, giro: .8, a: .22, cor: O}, fa([.25, .55, .75, .9], 180, 0, O, {radial: 640})]},
  ]};
  for (const id of ['bfuria', 'besmaga', 'bqueda']) for (const t of CINES[id].tomadas) if (t.z) t.z = t.z.map(z => +(1 + (z - 1) * REDUZ_ZOOM).toFixed(3));
})();
