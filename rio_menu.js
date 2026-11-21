/* MENU NO BARCO (2026-11-21: "aqui no barco nao ta funcionando eu abrir o menu"): o rio usa o mesmo menu da vila
   (vila_menu.js: bolsa, equipamento, habilidades, Ecos, missoes, salvar) e o mesmo sistema de loja (a Marta no cais do meio).
   O vila_menu.js foi feito para o motor da vila; aqui ficam as pecas que ele espera (ab, fala, hero, texto, vaiPara...)
   adaptadas ao rio. Carregar DEPOIS de rio_motor.js, filme_rio.js e vila_menu.js. */
'use strict';
var ab = { on: false }, fala = null, transicao = 0, NA_VILA = false;
var hero = { x: 0, y: 0, espada: true, alvo: null, pontoAlvo: null };
var REGIAO = 'rio';
const RET = window.JUX_RETRATOS || {}, RETI = {}; for (const k in RET) { const i = new Image(); i.src = RET[k].atlas; RETI[k] = i; }   // retratos do Jux e do Bino no menu
function texto(s, x, y, size, cor, al) { ctx.font = `bold ${size}px "Trebuchet MS"`; ctx.textAlign = al || 'left'; ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,20,.85)'; ctx.strokeText(s, x, y); ctx.fillStyle = cor; ctx.fillText(s, x, y); }
function livre() { return true; }
function vaiPara(p) { guardaRio(); setTimeout(() => { location.href = p + (p.includes('?') ? '&' : '?') + 't=' + Date.now(); }, 250); }
// coisas da historia da vila que nao existem no rio
function emAtaque() { return false; } function emFestival() { return false; } function emManha() { return false; } function diaFestival() { return false; }
function halvardVila() { return false; } function listaPreparo() { return []; } function comecaAtaque() {} function desceRio() {} function iniciaProva() {}
function filmeVisto() { return false; }
function tocaFilme(c, i, fim) { if (fim) fim(); }
function reverFilme() { aviso('As cinemáticas dá para rever no menu, lá na vila.', '#c8d8f0'); }
// conversar com quem vende no rio
const FALAS_RIO = {
  marta: ['Pesco neste cais desde que o rio era só gelo. Agora até os peixes suam.', 'Lá embaixo a água ferve. Leva Remédio: queimadura não sara sozinha.', 'Viu uma serpente grande? Eu também não. Nunca. Não pergunta.'],
};
let falaRioI = 0;
function abreFala(id) { const L = FALAS_RIO[id]; if (!L) return; aviso((LOJAS[id] ? LOJAS[id].quem + ': ' : '') + L[falaRioI++ % L.length], '#bff4ff'); }
// salvar pelo menu = salvar a posicao do barco (o salvaVila do menu gravaria a posicao do heroi da vila)
salvaVila = function () { guardaRio(); };
// sons do menu (o vila_menu toca som(SOM.ui_vez)): o som() do rio aceita o audio direto
SOM.ui_vez = new Audio('assets/sfx/novos/ui_vez.mp3'); SOM.ui_mover = new Audio('assets/sfx/novos/ui_mover.mp3'); SOM.whoosh = new Audio('assets/sfx/novos/whoosh2.mp3');
const menuLivre = () => !FILME.on && !escolha && !lutando && !evento && !troca;
// teclas: o menu vem antes do barco (M, I, Tab ou Esc abrem)
addEventListener('keydown', e => {
  if (!menuLivre()) return; const k = e.key.toLowerCase();
  if (uiTecla(k)) { e.preventDefault(); e.stopImmediatePropagation(); for (const t in teclas) teclas[t] = false; }
}, true);
cv.addEventListener('pointerdown', e => { if (!menuLivre()) return; const r = cv.getBoundingClientRect(), sx = (e.clientX - r.left) * W / r.width, sy = (e.clientY - r.top) * H / r.height;
  if (!uiAberto() && sx > W - 120 && sx < W - 8 && sy > 44 && sy < 78) { abreMenu(); return; }   // o botao "Menu (M)"
  uiClique(sx, sy); });
cv.addEventListener('wheel', e => { if (!uiAberto()) return; e.preventDefault(); uiTecla(e.deltaY > 0 ? 'arrowdown' : 'arrowup'); }, { passive: false });
// aba MAPA do menu no rio: o trecho atual do rio, com o barco, os cais, os baus e a Tartarok
function desenhaMapa(x, y, w, h) {
  const M = MAPAS[TR], px = x + 14, py = y + 50, pw = w - 28, ph = h - 64, k = Math.min((pw - 12) / R.w, (ph - 40) / R.h), dw = R.w * k, dh = R.h * k, mx = px + (pw - dw) / 2, my = py + 6;
  ctx.save(); ctx.fillStyle = 'rgba(2,8,22,.9)'; ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 10); ctx.fill(); ctx.strokeStyle = '#8fdcff'; ctx.lineWidth = 2; ctx.stroke();
  if (M.complete) ctx.drawImage(M, mx, my, dw, dh);
  const P = (a, b) => [mx + a * k, my + b * k];
  for (const b of BAUS) { const [a, c] = P(b.x, b.y); ctx.fillStyle = pego(b.id) ? '#5a6688' : '#ffcf5a'; ctx.fillRect(a - 5, c - 4, 10, 8); }
  if (CAIS) { const [a, c] = P(CAIS.x, CAIS.y); ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(a, c, 5, 0, 6.3); ctx.fill();
    texto(CAIS.tipo === 'vila' ? 'Cais da vila' : CAIS.tipo === 'porto' ? 'Porto de Cinzas' : 'Cais da Marta $', a, c + 18, 12, '#ffe27a', 'center'); }
  if (TR === 2 && !C3().tartarok) { const [a, c] = P(TARTA.x, TARTA.y); texto('?', a, c, 16, '#9dff8a', 'center'); }
  { const [a, c] = P(barco.x, barco.y); ctx.fillStyle = '#8fe9ff'; ctx.strokeStyle = '#06101f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(a, c, 6, 0, 6.3); ctx.fill(); ctx.stroke(); texto('Você', a, c - 10, 12, '#8fe9ff', 'center'); }
  texto(['Trecho 1 de 3 — O rio de gelo', 'Trecho 2 de 3 — O degelo', 'Trecho 3 de 3 — As águas quentes'][TR] || '', px + pw / 2, py + ph - 10, 14, '#bff4ff', 'center');
  ctx.restore();
}
