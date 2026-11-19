/* ============ EFEITO DE ACERTO DE CADA GOLPE DO JUX ============
   Antes todo acerto brilhava igual (clarao + faiscas). Agora cada golpe deixa a propria marca no inimigo, tudo de gelo/aurora:
   corte, estilhacos, perfuracao, neve, rachadura... Carregado antes do script principal (so funcoes; usa o kit de efeitos_fx.js na hora de rodar). */
'use strict';
const GELO = '150,225,255', GELO2 = '210,245,255', AUR = '140,255,210';
function fxHitJux(e, acao, forte) {
  const x = e.x, y = e.y - 105, f = forte ? 1 : .65;
  const corte = (dx0, dy0, dx1, dy1, o) => fxCorte(x + dx0, y + dy0, x + dx1, y + dy1, Object.assign({ms: 380, esp: 14 * f, cor: GELO, risca: .22}, o));
  switch (acao) {
    case 'attack':   // golpe simples: um corte diagonal limpo e lascas de gelo
      corte(70, -70, -60, 60, {esp: 12}); fxFaiscas(x, y, Math.round(8 * f), {cor: GELO2, vel: 520, g: 700, vida: .6}); break;
    case 'blade':    // Lamina Glacial: corte longo e baixo com rastro de geada
      corte(120, -10, -120, 10, {esp: 18, ms: 460}); corte(110, 20, -100, 30, {esp: 8, ms: 520, cor: GELO2});
      fxFaiscas(x - 40, y, 14, {cor: GELO, ang: Math.PI, abre: .5, vel: 700, g: 200}); break;
    case 'storm':    // Tempestade: estacas de gelo caindo do alto e estilhacando
      fxFaiscas(x, y - 150, 16, {cor: GELO2, ang: Math.PI / 2, abre: .35, vel: 900, g: 900, vida: .8});
      fxAnel(x, y + 100, {raio: 150, achata: .25, ms: 450, esp: 12, cor: GELO}); fxFaiscas(x, y + 90, 12, {cor: GELO, ang: -1.57, abre: 1.2, vel: 600, g: 900}); break;
    case 'danca':    // Danca Glacial: cortes cruzados, rapidos
      corte(60, -60, -60, 60, {esp: 9, ms: 300}); corte(-60, -60, 60, 60, {esp: 9, ms: 300}); fxFaiscas(x, y, 6, {cor: GELO2, vel: 420, g: 400, vida: .5}); break;
    case 'lanca':    // Lanca Boreal: perfura de lado a lado e solta cristais pelas costas
      corte(150, 0, -150, 0, {esp: 7, ms: 340, cor: GELO2}); fxFaiscas(x - 80, y, 16, {cor: GELO, ang: Math.PI, abre: .25, vel: 1100, g: 100}); break;
    case 'nevasca':  // Nevasca: baforada de neve, sem corte
      fxFaiscas(x, y, 14, {cor: '235,248,255', vel: 260, g: 40, vida: 1.2, tam: 1.3}); fxBrilho(x, y, {raio: 110, ms: 600, cor: GELO, a: .5}); break;
    case 'espelho_reflexo':
      fxBrilho(x, y, {raio: 220, ms: 400}); fxAnel(x, y, {raio: 230, ms: 480, cor: GELO2}); break;
    case 'res3':     // Coroa Boreal: luz de aurora esverdeada
      fxPilar(x, e.y + 10, {larg: 70, ms: 600, cor: AUR}); fxBrilho(x, y, {raio: 170, ms: 500, cor: AUR}); fxFaiscas(x, y, 10, {cor: AUR, ang: -1.57, abre: 1, vel: 500, g: -100}); break;
    case 'estalactites':   // estaca de gelo cravando de cima
      corte(0, -230, 0, 20, {esp: 18, ms: 340}); fxFaiscas(x, y + 60, 12, {cor: GELO2, ang: -1.57, abre: 1.3, vel: 650, g: 900}); break;
    case 'kelvin':   // Zero Kelvin: uma linha branca perfeita e o mundo trinca
      corte(0, -170, 0, 170, {esp: 6, ms: 700, cor: '255,255,255', risca: .12}); fxFlash('220,245,255', .25, 220); break;
    case 'final':    // Era do Gelo: onda de geada no chao
      fxAnel(x, e.y + 8, {raio: 360, achata: .22, ms: 700, esp: 22, cor: GELO}); fxPilar(x, e.y + 10, {larg: 90, ms: 700, cor: GELO2}); break;
    // ---- Fenrir (Eco da Lamina): cada habilidade dele tambem tem a propria marca
    case 'hab_golpe_duplo':   // Mordida Glacial: duas arcadas de presas fechando uma contra a outra
      corte(-60, -70, 20, -10, {esp: 11, ms: 300}); corte(-60, 70, 20, 10, {esp: 11, ms: 300}); fxFaiscas(x, y, 10, {cor: GELO2, vel: 560, g: 600, vida: .6}); fxAnel(x, y, {raio: 120, achata: .7, ms: 380, esp: 8, cor: GELO}); break;
    case 'hab_perfurante':    // Garra Perfurante: tres garradas paralelas, fundas
      for (let k = -1; k <= 1; k++) corte(80, -80 + k * 44, -80, 30 + k * 44, {esp: 9, ms: 420, cor: k ? GELO : GELO2});
      fxFaiscas(x, y, 12, {cor: GELO, ang: Math.PI * .8, abre: .5, vel: 800, g: 500}); break;
    case 'hab_matilha':       // Matilha Fantasma: lobos de nevoa atravessando (luz palida, sobe e some)
      fxBrilho(x, y, {raio: 150, ms: 700, cor: '170,200,255', a: .5}); fxFaiscas(x, y + 20, 16, {cor: '200,225,255', ang: -1.57, abre: 1.4, vel: 320, g: -120, vida: 1.2, tam: 1.2}); fxAnel(x, e.y + 8, {raio: 200, achata: .25, ms: 600, esp: 10, cor: '170,200,255'}); break;
    case 'hab_ragnarok':      // Ragnarok: o fim do mundo: onda, pilares e um clarao
      fxFlash('200,235,255', .3, 260); fxAnel(x, e.y + 8, {raio: 480, achata: .24, ms: 800, esp: 26, cor: GELO}); fxPilar(x, e.y + 10, {larg: 110, ms: 800, cor: GELO2}); fxFaiscas(x, y, 22, {cor: GELO2, vel: 1000, g: 200}); break;
    case 'res': case 'zero':   // Ressonancias: tem efeito proprio; aqui so um brilho forte
      fxBrilho(x, y, {raio: 240 * f, ms: 420}); fxFaiscas(x, y, 16, {cor: GELO2, vel: 800, g: 300}); break;
    default:         // habilidades de Eco e o resto: o clarao de antes
      fxBrilho(x + rnd(-20, 20), y + rnd(-30, 30), {raio: 170 * f, ms: 300}); fxFaiscas(x, y, Math.round(8 * f), {vel: 700 * f});
  }
}
