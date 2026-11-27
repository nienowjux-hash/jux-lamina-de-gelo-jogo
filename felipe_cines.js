/* ============ CINEMATICAS DO FELIPE (as 3 especiais: Olho do Furacao, Flecha do Ceu, Tempestade do Sul) ============
   Carregado DEPOIS do script principal do index.html (usa CINES, CIN, CIMG, SONS, VOZES). Cenas em HD: sprites_cine_felipe.js (tools/cut_cine_felipe.py).
   So o Felipe e o vento: nenhum inimigo nas cenas. Formato igual ao bino_cines.js. */
'use strict';
(function () {
  const F = window.JUX_CINE_FELIPE;
  if (!F || typeof CIN === 'undefined') return;
  for (const [n, c] of Object.entries(F.cenas)) { CIN.cenas[n] = c; const i = new Image(); (window.depois || (f => f()))(() => { i.src = c.src; }); CIMG[n] = i; }
  // sons das tomadas (assets/sfx/novos/felipe_*; o som() ignora o que ainda nao existe)
  Object.assign(SONS, {
    f_vento: () => { SONS.vento(); som('felipe_vento_time', .5); }, f_furacao: () => som('felipe_furacao', 1), f_desvia: () => { som('felipe_desvia', .9); setTimeout(() => som('felipe_desvia', .7), 260); },
    f_solta: () => { som('felipe_solta', 1); som('felipe_corda', .7); }, f_sobe: () => som('felipe_ceu_sobe', 1), f_cai: () => { som('felipe_ceu_cai', 1); grave(.6); },
    f_impacto: () => { som('felipe_ceu_impacto', 1); grave(1); }, f_sussurro: () => som('felipe_sussurro', 1), f_tornado: () => { som('felipe_tornado', 1); grave(.8); },
    f_bocejo: () => som('felipe_bocejo', 1),
  });
  // vozes (o usuario grava; enquanto o arquivo nao existir, fica so a legenda)
  for (const n of ['felipe_furacao_1', 'felipe_furacao_2', 'felipe_ceu_1', 'felipe_ceu_2', 'felipe_tempestade_1', 'felipe_tempestade_2', 'felipe_tempestade_3']) {
    const a = new Audio(); a.preload = 'none'; a.src = 'assets/voz/' + n + (a.canPlayType('audio/ogg; codecs="vorbis"') ? '.ogg' : '.mp3');
    a.addEventListener('error', () => { delete VOZES[n]; }); VOZES[n] = a;
  }
  const REDUZ_ZOOM = .5;
  const V = '150,255,190', B = '235,255,245', O = '255,220,150';   // verde do vento, branco das penas, dourado do amanhecer
  const fa = (area, n, vy, cor, o) => Object.assign({t: 'faiscas', area, n, vy, vx: 0, cor, s: [2, 4]}, o || {});
  const folhas = (n, vx, o) => fa([0, 0, 1, 1], n, 20, V, Object.assign({corre: vx, risco: 26}, o || {}));
  // Olho do Furacao (nv 74): a grama ao vento, o silencio, os olhos verdes, as flechas desviando, o revide sem olhar
  CINES.ffuracao = {musica: 'felipe_furacao', barra: 14, nome: 'OLHO DO FURACÃO', sub: 'Felipe', tomadas: [
    {cena: 'ffuracao_1', som: ['f_vento'], d: 2.0, z: [1, 1.12], f: [[.5, .55], [.5, .5]], fx: [folhas(40, -260)]},
    {cena: 'ffuracao_2', voz: 'felipe_furacao_1', legenda: ['風が…止まった。', 'O vento… parou.'], som: [], d: 2.0, z: [1.05, 1.15], f: [[.5, .45], [.5, .42]],
      fx: [fa([0, 0, 1, 1], 10, -4, B, {estrela: true})]},
    {cena: 'ffuracao_3', som: ['f_furacao'], entra: 'chicote', d: 1.5, z: [1, 1.2], f: [[.5, .5], [.5, .5]], clarao: .5, tremor: [.1, .6, 4],
      fx: [{t: 'brilho', pts: [[.42, .44, .08], [.72, .43, .06]], v: 6, cor: 'rgba(150,255,190,.6)'}, {t: 'raios', x: .42, y: .44, n: 12, L: .8, giro: 1.2, a: .1, cor: V}]},
    {cena: 'ffuracao_4', som: ['f_desvia'], d: 1.9, z: [1, 1.1], f: [[.5, .5], [.5, .5]], tremor: [.2, .8, 3],
      fx: [fa([0, .2, 1, .8], 50, 0, B, {corre: -520, risco: 50}), {t: 'anel', x: .47, y: .9, r: .5, per: .6, ach: .25, cor: V}]},
    {cena: 'ffuracao_5', voz: 'felipe_furacao_2', legenda: ['台風の目。', 'Olho do Furacão.'], som: ['f_solta'], entra: 'chicote', d: 2.0, z: [1.2, 1.05], f: [[.5, .45], [.55, .45]], clarao: .7, tremor: [0, .5, 8],
      fx: [fa([.5, .1, 1, .4], 60, 0, V, {corre: 700, risco: 60}), {t: 'raios', x: .88, y: .22, n: 10, L: .9, giro: .6, a: .12, cor: V}]},
  ]};
  // Flecha do Ceu (nv 86): o penhasco, a flecha nas nuvens, o ceu em espiral, a lanca descendo, o impacto
  CINES.fceu = {musica: 'felipe_ceu', barra: 14, nome: 'FLECHA DO CÉU', sub: 'Felipe', tomadas: [
    {cena: 'fceu_1', voz: 'felipe_ceu_1', legenda: ['空よ、ちょっと借りるぞ。', 'Céu, vou pegar emprestado.'], som: ['f_vento'], d: 2.2, z: [1, 1.1], f: [[.5, .6], [.5, .5]], fx: [fa([0, .4, 1, 1], 20, -30, O)]},
    {cena: 'fceu_2', som: ['f_solta', 'f_sobe'], entra: 'chicote', d: 1.5, z: [1.0, 1.2], f: [[.5, .7], [.5, .3]],
      fx: [{t: 'varre', de: [.2, .75], ate: [.8, .05], v: 1.4}, fa([0, 0, 1, 1], 40, -320, V, {risco: 40})]},
    {cena: 'fceu_3', som: ['f_furacao'], d: 2.0, z: [1, 1.18], f: [[.5, .45], [.5, .45]], tremor: [.3, 1, 4],
      fx: [{t: 'raios', x: .52, y: .4, n: 16, L: 1, giro: .8, a: .14, cor: V}, {t: 'brilho', pts: [[.52, .4, .14]], v: 4, cor: 'rgba(235,255,245,.55)'}]},
    {cena: 'fceu_4', voz: 'felipe_ceu_2', legenda: ['天の矢！', 'Flecha do Céu!'], som: ['f_cai'], entra: 'chicote', d: 1.7, z: [1.0, 1.25], f: [[.5, .2], [.5, .6]], clarao: .5, tremor: [.2, 1, 10],
      fx: [{t: 'varre', de: [.55, .05], ate: [.42, .88], v: 1.8}, fa([0, 0, 1, 1], 90, 340, B, {risco: 40})]},
    {cena: 'fceu_5', som: ['f_impacto'], entra: 'chicote', d: 2.5, z: [1.3, 1.05], f: [[.5, .65], [.5, .6]], clarao: 1, tremor: [0, .8, 28], cacos: true,
      fx: [{t: 'anel', x: .62, y: .64, r: 1.1, per: .4, ach: .3, cor: V}, {t: 'raios', x: .62, y: .6, n: 20, L: 1.1, giro: .8, a: .2, cor: V}, fa([.45, .45, .8, .75], 150, 0, B, {radial: 600})]},
  ]};
  // Tempestade do Sul (nv 100, suprema): tudo parado, o sussurro, o furacao nascendo, o furacao varrendo, o bocejo nos destrocos
  CINES.ftempestade = {musica: 'felipe_tempestade', barra: 14, nome: 'TEMPESTADE DO SUL', sub: 'Felipe', tomadas: [
    {cena: 'ftempestade_1', som: [], d: 2.2, z: [1, 1.08], f: [[.5, .55], [.5, .5]], fx: [fa([0, 0, 1, 1], 6, -6, B, {estrela: true})]},
    {cena: 'ftempestade_2', voz: 'felipe_tempestade_1', legenda: ['南の風よ…起きろ。', 'Vento do sul… acorda.'], som: ['f_sussurro'], d: 2.3, z: [1.05, 1.18], f: [[.45, .5], [.42, .5]],
      fx: [fa([.55, .25, .95, .55], 14, -20, V, {corre: 60})]},
    {cena: 'ftempestade_3', som: ['f_furacao'], entra: 'chicote', d: 2.2, z: [1, 1.15], f: [[.5, .5], [.5, .4]], tremor: [.2, 1, 8],
      fx: [{t: 'raios', x: .68, y: .45, n: 14, L: 1, giro: .7, a: .12, cor: V}, folhas(50, -300)]},
    {cena: 'ftempestade_4', voz: 'felipe_tempestade_2', legenda: ['南の嵐！', 'Tempestade do Sul!'], som: ['f_tornado'], entra: 'chicote', d: 2.6, z: [1.15, 1.0], f: [[.5, .5], [.5, .5]], clarao: .8, tremor: [0, 1, 26], cacos: true,
      fx: [folhas(140, -700, {risco: 70}), fa([0, .5, 1, 1], 60, -120, O, {corre: -500}), {t: 'raios', x: .55, y: .4, n: 22, L: 1.2, giro: 1.4, a: .18, cor: V}]},
    {cena: 'ftempestade_5', voz: 'felipe_tempestade_3', legenda: ['…ふぁ〜。眠い。', '…Aaah. Que sono.'], som: ['f_bocejo'], d: 2.6, z: [1.05, 1.0], f: [[.5, .45], [.5, .45]],
      fx: [fa([0, 0, 1, .6], 6, 30, B, {corre: 20})]},
  ]};
  for (const id of ['ffuracao', 'fceu', 'ftempestade']) for (const t of CINES[id].tomadas) if (t.z) t.z = t.z.map(z => +(1 + (z - 1) * REDUZ_ZOOM).toFixed(3));
})();
