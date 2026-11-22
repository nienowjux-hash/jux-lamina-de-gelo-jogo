/* TELA GRUPO (FICHA_GRUPO.md, aprovada 2026-11-21): o campo de batalha com os 4 lugares (2 na FRENTE, 2 ATRAS), como eles
   ficam na luta. ENTER num heroi e ENTER em outro lugar: trocam. Embaixo, a reserva (quem passar de 4).
   Aba nova do menu da vila (ABA_GRUPO = 9). Carregar depois do vila_menu.js e do formacao.js. */
'use strict';
const ABA_GRUPO = 9;
if (!ABAS.includes('Grupo')) ABAS.push('Grupo');
for (const h of HOME) if (h[0] === 'Grupo') h[1] = ABA_GRUPO;
const NOME_G = { jux: 'Jux', bino: 'Bino', felipe: 'Felipe' }, COR_G = { jux: '#8fe9ff', bino: '#ffb27a', felipe: '#9dff8a' };
function vidaG(q) { try { return vidaAtual(q); } catch (e) { return { hp: 0, max: 1 }; } }
function nivelG(q) { return q === 'bino' ? ((JOGO.bino || {}).nivel || 1) : q === 'felipe' ? ((JOGO.felipe || {}).nivel || 1) : (JOGO.nivel || 1); }
function teclaGrupo(k) { const n = 4 + reservaForm().length;
  if (!(UI.sel >= 0 && UI.sel < n)) UI.sel = 0;
  if (k === 'escape' || k === 'backspace') { if (UI.grupoPega != null) { UI.grupoPega = null; som(SOM.ui_mover, .4); return true; } return false; }
  if (UI.sel < 4) {
    if (k === 'arrowleft' || k === 'a' || k === 'arrowright' || k === 'd') { UI.sel = (UI.sel + 2) % 4; som(SOM.ui_mover, .3); return true; }
    if (k === 'arrowup' || k === 'w') { UI.sel = UI.sel % 2 === 1 ? UI.sel - 1 : UI.sel; som(SOM.ui_mover, .3); return true; }
    if (k === 'arrowdown' || k === 's') { if (UI.sel % 2 === 0) UI.sel++; else if (n > 4) UI.sel = 4; som(SOM.ui_mover, .3); return true; }
  } else {
    if (k === 'arrowup' || k === 'w') { UI.sel = 1; som(SOM.ui_mover, .3); return true; }
    if (k === 'arrowleft' || k === 'a') { UI.sel = Math.max(4, UI.sel - 1); return true; }
    if (k === 'arrowright' || k === 'd') { UI.sel = Math.min(n - 1, UI.sel + 1); return true; }
    if (k === 'arrowdown' || k === 's') return true; }
  if (k === 'enter' || k === ' ' || k === 'e') { const F = formacao(), R = reservaForm();
    if (UI.grupoPega == null) { const q = UI.sel < 4 ? F[UI.sel] : R[UI.sel - 4]; if (!q) { aviso('Lugar vazio: escolha primeiro um herói', '#c8d8f0'); return true; }
      UI.grupoPega = UI.sel; som(SOM.ui_vez, .5); aviso('Agora escolha o lugar para o ' + NOME_G[q], '#ffe27a'); return true; }
    const a = UI.grupoPega; UI.grupoPega = null; if (a === UI.sel) { som(SOM.ui_mover, .4); return true; }
    if (a < 4 && UI.sel < 4) trocaLugarForm(a, UI.sel);
    else { const lugar = a < 4 ? a : UI.sel, res = R[(a < 4 ? UI.sel : a) - 4]; F[lugar] = res; JOGO.formacao = F; }
    formacao(); salvaJogo(); som(SOM.ui_vez, .6); aviso('Formação trocada!', '#7dffa8'); return true; }
  return false; }
function desenhaGrupo(cx, cy, w, h, y) { const F = formacao(), R = reservaForm();
  // o "campo": o chao da batalha visto de lado, os inimigos a esquerda
  const fx = cx, fy = cy - 4, fw = w - 48 - 216, fh = h - (cy - y) - 70;
  ctx.save(); ctx.fillStyle = 'rgba(8,20,46,.9)'; ctx.beginPath(); ctx.roundRect(fx, fy, fw, fh, 12); ctx.fill(); ctx.strokeStyle = 'rgba(143,220,255,.35)'; ctx.lineWidth = 1; ctx.stroke();
  const meio = fx + fw * .5; ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,226,122,.35)'; ctx.beginPath(); ctx.moveTo(meio, fy + 30); ctx.lineTo(meio, fy + fh - 10); ctx.stroke(); ctx.setLineDash([]);
  texto('◀ inimigos', fx + 12, fy + 22, 12, '#ff9a9a'); texto('FRENTE', fx + fw * .27, fy + 22, 13, '#ffe27a', 'center'); texto('ATRÁS', fx + fw * .76, fy + 22, 13, '#8fe9ff', 'center');
  ctx.restore();
  // os 4 lugares (frente a esquerda, tras a direita; de cima e de baixo um pouco em diagonal, como na luta)
  const pos = [[.27, .34], [.2, .74], [.79, .3], [.72, .7]], cw = Math.min(190, fw * .4), ch = 78;
  pos.forEach(([px, py], i) => { const x = fx + fw * px - cw / 2, yy = fy + fh * py - ch / 2, q = F[i], on = UI.sel === i, pega = UI.grupoPega === i;
    ctx.fillStyle = pega ? 'rgba(255,226,122,.25)' : q ? 'rgba(14,32,70,.95)' : 'rgba(14,24,46,.55)'; ctx.strokeStyle = pega ? '#ffe27a' : on ? '#ffe27a' : q ? (COR_G[q] || '#8fe9ff') : 'rgba(143,220,255,.25)'; ctx.lineWidth = on || pega ? 3 : 1.5;
    if (!q) ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.roundRect(x, yy, cw, ch, 10); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
    if (q) { if (typeof retratoHeroi === 'function') retratoHeroi(q, x + 36, yy + ch / 2, 26);
      texto(NOME_G[q] || q, x + 70, yy + 26, 17, COR_G[q] || '#fff'); texto('Nv ' + nivelG(q), x + cw - 10, yy + 26, 12, '#ffe27a', 'right');
      const v = vidaG(q); ctx.fillStyle = 'rgba(42,58,102,.9)'; ctx.fillRect(x + 70, yy + 36, cw - 82, 6); ctx.fillStyle = '#7dffa8'; ctx.fillRect(x + 70, yy + 36, (cw - 82) * Math.max(0, Math.min(1, v.hp / v.max)), 6);
      const eq = typeof vagaEco === 'function' && vagaEco(q).equip; texto(eq ? 'Eco: ' + (typeof nomeEcoM === 'function' ? nomeEcoM(eq) : ECOS[eq].nome) : 'sem Eco', x + 70, yy + 60, 11, eq ? ECOS[eq].cor : '#5a6688'); }
    else texto('vazio', x + cw / 2, yy + ch / 2 + 5, 13, '#5a6688', 'center');
    ZONAS.push([x, yy, x + cw, yy + ch, () => { UI.sel = i; teclaGrupo('enter'); }]); });
  // a reserva
  const ry = fy + fh + 10; texto('Reserva (fora da luta, ganha metade da EXP):', fx, ry + 16, 12, '#9fb3d9');
  if (!R.length) texto('ninguém — o time cabe todo em campo (até 4)', fx + 290, ry + 16, 12, '#5a6688');
  R.forEach((q, i) => { const x = fx + 290 + i * 150, on = UI.sel === 4 + i; ctx.fillStyle = 'rgba(14,32,70,.9)'; ctx.strokeStyle = on || UI.grupoPega === 4 + i ? '#ffe27a' : COR_G[q]; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, ry, 140, 26, 8); ctx.fill(); ctx.stroke();
    texto(NOME_G[q] + ' · Nv ' + nivelG(q), x + 70, ry + 18, 13, '#fff', 'center'); ZONAS.push([x, ry, x + 140, ry + 26, () => { UI.sel = 4 + i; teclaGrupo('enter'); }]); });
  // a legenda (o que muda na luta)
  const lx = fx + fw + 16, lw = w - 48 - fw - 16; ctx.fillStyle = 'rgba(10,24,56,.85)'; ctx.beginPath(); ctx.roundRect(lx, fy, lw, fh, 10); ctx.fill();
  let yy = fy + 24; texto('Na frente', lx + 12, yy, 15, '#ffe27a'); yy += 20;
  for (const l of ['Leva os golpes normais', 'Bate com força total', 'Os inimigos miram mais nele']) { texto('• ' + l, lx + 12, yy, 12, '#e8f6ff'); yy += 17; }
  yy += 10; texto('Atrás', lx + 12, yy, 15, '#8fe9ff'); yy += 20;
  for (const l of ['Leva 25% menos dano físico', 'Golpe físico de perto: -25%', 'Arco e magia: força total', 'Os inimigos miram menos nele']) { texto('• ' + l, lx + 12, yy, 12, '#e8f6ff'); yy += 17; }
  yy += 10; texto('Bom: tanques na frente,', lx + 12, yy, 12, '#9fb3d9'); texto('arqueiros e magos atrás.', lx + 12, yy + 16, 12, '#9fb3d9');
  textoCabe((UI.grupoPega != null ? 'Escolha o lugar novo (ENTER) · ESC: cancelar' : 'Setas: escolher · ENTER: pegar um herói e depois o lugar novo (eles trocam)'), cx, y + h - 20, 12, '#c8d8f0', w - 48); }
