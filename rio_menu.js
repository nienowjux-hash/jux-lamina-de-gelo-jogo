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
// CONVERSAR (2026-11-21: "so aparece uma mensagem azul em cima, achei feio, tem que fazer igual os outros"): a mesma caixa
// de fala da vila, com o retrato de quem fala, o texto digitando e ENTER para seguir. A Marta usa a linha 3 da folha dela.
const COR_FALA = { Jux: '#bff0ff', Bino: '#d8b48a', 'Sir Bacon': '#ffb6c8', Marta: '#ffd88a' };
const RET_RIO = { Jux: 'jux', Bino: 'bino', 'Sir Bacon': 'bacon_laco' };   // no Cap. 3 ele usa o laço azul
const CONVERSAS_MARTA = [
  [['Marta', 'Ora, visita! Pesco neste cais desde que o rio era só gelo.'], ['Marta', 'Agora o gelo derrete e até os peixes andam suando.'],
   ['Jux', 'Peixe suando… essa eu queria ver.'], ['Marta', 'Fica mais um pouco que você vê, menino. Ha!']],
  [['Marta', 'Vão descer até as águas quentes?'], ['Marta', 'Lá embaixo a água ferve, e os bichos de lá queimam de verdade.'],
   ['Marta', 'Leva Remédio. Queimadura não sara sozinha.'], ['Bino', '…Anotado.']],
  [['Marta', 'Dizem que tem uma serpente enorme perto do Porto de Cinzas.'], ['Marta', 'Eu nunca vi. Nunca. Não pergunta.'],
   ['Sir Bacon', 'Oinc…'], ['Marta', 'Até o porco ficou com medo. Esperto, ele.']],
];
const CONVERSA_DEPOIS = [['Marta', 'Vocês venceram a Serpente do Degelo?! O rio está livre de novo!'], ['Marta', 'E uma tartaruga do tamanho de uma ilha agora anda com vocês? Ha! Esse rio nunca mais vai ser o mesmo.'],
  ['Jux', 'Ela que salvou a gente também, no fim das contas.'], ['Marta', 'Peixe de graça pra vocês, então. Brincadeira. Poção é que não sai de graça.']];
let falaRioI = 0, falaUlt = performance.now();
function abreFala(id) { if (id !== 'marta') return;
  const L = serpVencida() && !C3().martaDepois ? (C3().martaDepois = true, CONVERSA_DEPOIS) : CONVERSAS_MARTA[falaRioI++ % CONVERSAS_MARTA.length];
  fala = { linhas: L, i: 0, letras: 0 }; falaUlt = performance.now(); som(SOM.ui_vez, .5); }
function avancaRio() { if (!fala) return; const L = fala.linhas[fala.i][1]; if (fala.letras < L.length) { fala.letras = L.length; return; }
  fala.i++; fala.letras = 0; som(SOM.ui_mover, .45); if (fala.i >= fala.linhas.length) { const f = fala.fim; fala = null; if (f) f(); } }
function expressaoRio(quem, L) { if (/^…|\?!|!\?/.test(L)) return 3; if (/!$/.test(L.trim()) && quem !== 'Jux') return /Ha!/.test(L) ? 1 : 2; if (/Ha|Oinc|Brincadeira/i.test(L)) return 1; return quem === 'Jux' ? 1 : 0; }
function desenhaFalaRio() { if (!fala) return;
  const agora = performance.now(), dt = Math.min(.1, (agora - falaUlt) / 1000); falaUlt = agora; fala.letras += dt * 42 * ((typeof OPC === 'object' && OPC.texto) || 1);
  const [quem, L] = fala.linhas[fala.i], x = 110, y = H - 150, w = W - 220, h = 126;
  ctx.save(); ctx.setTransform(window.HD_TELA || 1, 0, 0, window.HD_TELA || 1, 0, 0); ctx.fillStyle = 'rgba(6,16,40,.9)'; ctx.strokeStyle = '#8fdcff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill(); ctx.stroke();
  let tx = 0; const q = expressaoRio(quem, L);
  if (fala.ret !== fala.i + quem) { fala.ret = fala.i + quem; fala.retT = agora; } const a = Math.min(1, (agora - fala.retT) / 180);
  if (quem === 'Marta' && F.marta_ret && F.marta_ret.i.complete) {   // linha 3 da folha: 0 virando, 1 acenando, 2 maos na cintura, 3 apontando
    const qm = [2, 1, 3, 0][q] || 2, f = F.marta_ret, rh = 160, rw = f.fw * rh / f.fh; ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.roundRect(x, y - 40, rw + 14, h + 40, 10); ctx.clip();
    ctx.imageSmoothingEnabled = false; ctx.drawImage(f.i, qm * f.fw, 0, f.fw, f.fh, x + 6 - (1 - a) * 14, y + h - rh - 2, rw, rh); ctx.restore(); tx = rw + 6; }
  else { const rk = RET_RIO[quem], Rr = rk && RET[rk], RI = rk && RETI[rk];
    if (Rr && RI && RI.complete) { const rh = 160, rw = Rr.w * rh / Rr.h; ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.roundRect(x, y - 40, rw + 14, h + 40, 10); ctx.clip();
      ctx.drawImage(RI, q * Rr.w, 0, Rr.w, Rr.h, x + 6 - (1 - a) * 14, y + h - rh - 2, rw, rh); ctx.restore(); tx = rw + 6; } }
  ctx.font = 'bold 18px "Trebuchet MS"'; const nw = ctx.measureText(quem).width + 36; ctx.fillStyle = 'rgba(6,16,40,.95)'; ctx.beginPath(); ctx.roundRect(x + 18 + tx, y - 18, nw, 32, 8); ctx.fill(); ctx.stroke();
  texto(quem, x + 36 + tx, y + 5, 18, COR_FALA[quem] || '#fff');
  const larg = w - 60 - tx; let tam = 19, linhas;
  for (;;) { ctx.font = tam + 'px "Trebuchet MS"'; linhas = []; let ln = ''; for (const p of L.split(' ')) { const tst = ln ? ln + ' ' + p : p; if (ln && ctx.measureText(tst).width > larg) { linhas.push(ln); ln = p; } else ln = tst; }
    linhas.push(ln); if (linhas.length * tam * 1.47 <= h - 30 || tam <= 13) break; tam--; }
  const passo = Math.round(tam * 1.47), ly0 = y + 30 + Math.round(tam * .95); ctx.fillStyle = '#f2f8ff'; ctx.textAlign = 'left'; let resta = Math.floor(fala.letras);
  linhas.forEach((l, k) => { if (resta <= 0) return; ctx.fillText(l.slice(0, resta), x + 30 + tx, ly0 + k * passo); resta -= l.length + 1; });
  if (fala.letras >= L.length) { ctx.fillStyle = '#8fdcff'; ctx.beginPath(); const ay = y + h - 18 + Math.sin(agora / 160) * 2; ctx.moveTo(x + w - 30, ay); ctx.lineTo(x + w - 18, ay); ctx.lineTo(x + w - 24, ay + 7); ctx.fill(); }
  ctx.restore(); }
addEventListener('keydown', e => { if (!fala || FILME.on) return; const k = e.key.toLowerCase();
  if (k === 'enter' || k === ' ' || k === 'e' || k === 'escape') avancaRio(); e.preventDefault(); e.stopImmediatePropagation(); }, true);
cv.addEventListener('pointerdown', e => { if (fala && !FILME.on) { avancaRio(); e.stopImmediatePropagation(); } }, true);
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
