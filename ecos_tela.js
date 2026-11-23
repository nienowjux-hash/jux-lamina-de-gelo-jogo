/* NOVA TELA DOS ECOS (FICHA_ECOS_TELA.md, aprovada 2026-11-21: "esta muito confuso, o jogador vai se bater")
   Substitui o desenho e as teclas da aba Ecos do vila_menu.js (carregar DEPOIS dele).
   Tela 1 'lista': no alto, um quadro por heroi ("Eco do Jux: Fenrir"); embaixo, um cartao por Eco (retrato, papel, nivel, com quem).
   Tela 2 'eco': o Eco escolhido: retrato grande, botao Equipar, "o que ele da", o espaco de habilidades (o AP) e um cartao por
   habilidade com o tipo escrito (GOLPE / SEMPRE ATIVO / Nv X) e se o heroi esta levando ou nao.
   Na primeira vez aparece um cartao de dica. */
'use strict';
const BICHO_ECO_M = { lamina: 'Fenrir', guardiao: 'Tartarok' };
const nomeEcoM = id => BICHO_ECO_M[id] || ECOS[id].nome;
UI.ecoTela = UI.ecoTela || 'lista';
function equipaEcoConf(id, q) {   // equipar, perguntando antes de trocar
  const S = vagaEco(q), de0 = donoEco(id), atual = S.equip, agora = performance.now();
  if (S.equip === id) { aviso(nomeEcoM(id) + ' já está com o ' + NOME_QUEM[q] + '.', '#c8d8f0'); return; }
  if ((atual || (de0 && de0 !== q)) && !(UI.ecoConf === id + q && agora - UI.ecoConfT < 6000)) { UI.ecoConf = id + q; UI.ecoConfT = agora; som(SOM.ui_vez, .4);
    aviso(de0 && de0 !== q ? nomeEcoM(id) + ' está com o ' + NOME_QUEM[de0] + '. ENTER de novo: passar para o ' + NOME_QUEM[q] + ' (o ' + NOME_QUEM[de0] + ' fica sem Eco)'
      : 'Trocar ' + nomeEcoM(atual) + ' por ' + nomeEcoM(id) + ' no ' + NOME_QUEM[q] + '? ENTER de novo para confirmar', '#ffcf7a'); return; }
  UI.ecoConf = null; const de = equipaEco(id, q); som(SOM.ui_vez, .6); salvaJogo();
  aviso(de ? nomeEcoM(id) + ' passou do ' + NOME_QUEM[de] + ' para o ' + NOME_QUEM[q] + ' (o ' + NOME_QUEM[de] + ' ficou sem Eco)' : nomeEcoM(id) + ' agora luta com o ' + NOME_QUEM[q] + '!', ECOS[id].cor); }
function alternaHabEco(h, q) { const r = trocaHab(h, q);
  if (r === 'auto') { som(SOM.ui_mover, .4); aviso('Essa é automática: fica sempre ligada com este Eco equipado', '#ffe27a'); return; }
  if (r === 'moveu') { som(SOM.ui_vez, .5); aviso(HABS[h].nome + ' passou do ' + NOME_QUEM[trocaHab.de] + ' para o ' + NOME_QUEM[q], '#ffe27a'); salvaJogo(); return; }
  if (r === 'pos') { som(SOM.ui_vez, .5); aviso(NOME_QUEM[q] + ' vai levar ' + HABS[h].nome + ' para a batalha', '#7dffa8'); salvaJogo(); }
  else if (r === 'tirou') { som(SOM.ui_mover, .4); aviso(HABS[h].nome + ' ficou de fora', '#c8d8f0'); salvaJogo(); }
  else { som(SOM.ui_mover, .5); aviso(r === 'sem_ap' ? 'Sem espaço: deixe outra habilidade de fora primeiro' : 'O Eco ainda não aprendeu essa (suba o nível dele lutando junto)', '#ff9a9a'); } }
// as teclas da aba (vila_menu.js chama antes das teclas gerais); devolve true se usou a tecla
function teclaEcos(k) {
  if (UI.ecoDica) { if (['enter', ' ', 'e', 'escape', 'backspace'].includes(k)) { UI.ecoDica = false; JOGO.tut = Object.assign(JOGO.tut || {}, { ecos_tela: true }); salvaJogo(); som(SOM.ui_mover, .4); } return true; }
  const E = estadoEcos(), q = quemEco();
  if (UI.ecoTela === 'eco') { const e = ECOS[UI.ecoVer], n = e.habs.length + 1;
    if (k === 'escape' || k === 'backspace') { UI.ecoTela = 'lista'; UI.sel = ECO_ORDEM.indexOf(UI.ecoVer); som(SOM.ui_mover, .4); return true; }
    if (k === 'arrowup' || k === 'w') { UI.sel = (UI.sel + n - 1) % n; som(SOM.ui_mover, .3); return true; }
    if (k === 'arrowdown' || k === 's') { UI.sel = (UI.sel + 1) % n; som(SOM.ui_mover, .3); return true; }
    if (k === 'enter' || k === ' ' || k === 'e') { if (UI.sel === 0) equipaEcoConf(UI.ecoVer, q); else alternaHabEco(e.habs[UI.sel - 1], q); return true; }
    if (k === 'arrowleft' || k === 'arrowright' || k === 'a' || k === 'd') return true;
    return false; }
  const n = ECO_ORDEM.length;
  if (k === 'arrowleft' || k === 'a') { UI.sel = (UI.sel + n - 1) % n; som(SOM.ui_mover, .3); return true; }
  if (k === 'arrowright' || k === 'd') { UI.sel = (UI.sel + 1) % n; som(SOM.ui_mover, .3); return true; }
  if (k === 'arrowup' || k === 'w') { UI.sel = (UI.sel + n - 3) % n; som(SOM.ui_mover, .3); return true; }
  if (k === 'arrowdown' || k === 's') { UI.sel = (UI.sel + 3) % n; som(SOM.ui_mover, .3); return true; }
  if (k === 'enter' || k === ' ' || k === 'e') { const id = ECO_ORDEM[UI.sel];
    if (!E.tem.includes(id)) { som(SOM.ui_mover, .5); aviso('Esse Eco ainda dorme em algum lugar do mundo.', '#ff9a9a'); return true; }
    UI.ecoVer = id; UI.ecoTela = 'eco'; UI.sel = 0; som(SOM.ui_vez, .5); return true; }
  return false; }
function acaoEco(i) { teclaEcos('enter'); }
function retratoHeroi(qq, x, y, r) {   // o rosto do heroi num circulo (o 1o quadro do retrato da vila)
  const D = RET[qq], I = RETI[qq]; ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fillStyle = '#0c1a3a'; ctx.fill(); ctx.clip();
  if (D && I && I.complete) { const k = (r * 2.6) / D.h; ctx.drawImage(I, 0, 0, D.w, D.h, x - D.w * k / 2, y - r * .9, D.w * k, D.h * k); }
  ctx.restore(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.strokeStyle = COR_GRUPO[qq] || '#8fe9ff'; ctx.lineWidth = 2; ctx.stroke(); }
function retratoEcoQ(id, x, y, s, cor) { ctx.save(); ctx.fillStyle = '#0c1a3a'; ctx.beginPath(); ctx.roundRect(x, y, s, s, 8); ctx.fill();
  if (retratoOk(id)) ctx.drawImage(RETRATO_ECO[id], x + 2, y + 2, s - 4, s - 4); else { ctx.fillStyle = cor; ctx.beginPath(); ctx.arc(x + s / 2, y + s / 2, s * .28, 0, 6.283); ctx.fill(); }
  ctx.strokeStyle = cor; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(x, y, s, s, 8); ctx.stroke(); ctx.restore(); }
function barraPE(id, x, y, w, cor) { const nv = nivelDoEco(id), a = PE_NIVEL[nv - 1] || 0, b = PE_NIVEL[nv] || PE_NIVEL[NIVEL_MAX_ECO - 1], k = nv >= NIVEL_MAX_ECO ? 1 : Math.max(0, Math.min(1, (peDe(id) - a) / (b - a)));
  ctx.fillStyle = 'rgba(42,58,102,.95)'; ctx.fillRect(x, y, w, 6); ctx.fillStyle = cor; ctx.fillRect(x, y, w * k, 6); return nv >= NIVEL_MAX_ECO ? 0 : b - peDe(id); }
function pilula(txt, x, y, fundo, cor, al) { ctx.font = 'bold 11px "Trebuchet MS"'; const w = ctx.measureText(txt).width + 14, x0 = al === 'right' ? x - w : x;
  ctx.fillStyle = fundo; ctx.beginPath(); ctx.roundRect(x0, y - 12, w, 17, 8); ctx.fill(); texto(txt, x0 + 7, y + 1, 11, cor); return w; }

function desenhaEcos(cx, cy, w, h, y) {
  if (!(JOGO.tut || {}).ecos_tela && UI.ecoDica === undefined) UI.ecoDica = true;
  if (grupoMenu().length > 1) cy -= 28;
  w -= 48;   // a mesma margem das outras abas (cx+w fica 24 px antes da borda do painel)
  if (UI.ecoTela === 'eco' && estadoEcos().tem.includes(UI.ecoVer)) desenhaEcoDetalhe(cx, cy, w, h, y); else { UI.ecoTela = 'lista'; desenhaEcosLista(cx, cy, w, h, y); }
  if (UI.ecoDica) {   // a dica da primeira vez
    ctx.save(); ctx.fillStyle = 'rgba(2,6,16,.7)'; ctx.fillRect(cx - 20, cy - 60, w + 40, h + 40); const bw = 520, bh = 170, bx = cx + w / 2 - bw / 2, by = cy + 40;
    painel(bx, by, bw, bh); texto('O que são os Ecos?', bx + 24, by + 36, 20, '#ffe27a');
    texto('Ecos são espíritos de bichos lendários que lutam ao lado do herói.', bx + 24, by + 68, 14, '#e8f6ff');
    texto('Cada herói leva 1 Eco: ele dá bônus e golpes especiais na batalha.', bx + 24, by + 92, 14, '#e8f6ff');
    texto('O Eco sobe de nível lutando junto e aprende habilidades novas.', bx + 24, by + 116, 14, '#e8f6ff');
    texto('ENTER para continuar', bx + bw / 2, by + bh - 14, 12, '#9fb3d9', 'center'); ctx.restore(); } }

function desenhaEcosLista(cx, cy, w, h, y) { const E = estadoEcos(), q = quemEco(), G = grupoMenu();
  if (!(UI.sel >= 0 && UI.sel < ECO_ORDEM.length)) UI.sel = 0;
  // os herois: "Eco do Jux: Fenrir"
  const sw = (w - 12 * (G.length - 1)) / G.length;
  G.forEach((qq, i) => { const x = cx + i * (sw + 12), yy = cy - 8, on = qq === q, eq = vagaEco(qq).equip;
    ctx.fillStyle = on ? 'rgba(127,214,245,.16)' : 'rgba(6,16,40,.6)'; ctx.strokeStyle = on ? '#8fe9ff' : 'rgba(143,220,255,.35)'; ctx.lineWidth = on ? 2 : 1; ctx.beginPath(); ctx.roundRect(x, yy, sw, 54, 10); ctx.fill(); ctx.stroke();
    retratoHeroi(qq, x + 30, yy + 27, 20); texto('Eco do ' + NOME_QUEM[qq], x + 60, yy + 22, 12, '#9fb3d9');
    texto(eq ? nomeEcoM(eq) : 'nenhum', x + 60, yy + 42, 17, eq ? ECOS[eq].cor : '#5a6688');
    if (eq) retratoEcoQ(eq, x + sw - 50, yy + 7, 40, ECOS[eq].cor);
    if (on && G.length < 3) texto('escolhendo para ele', x + sw - 58, yy + 42, 11, '#8fe9ff', 'right');   // com 3 herois o quadro fica estreito: a borda acesa ja mostra de quem e
    ZONAS.push([x, yy, x + sw, yy + 54, () => { UI.quem = qq; som(SOM.ui_mover, .4); }]); });
  // os cartoes dos Ecos
  const top = cy + 58, cw = (w - 24) / 3, ch = Math.min(150, (y + h - 52 - top) / 2 - 8);
  ECO_ORDEM.forEach((id, i) => { const e = ECOS[id], tem = E.tem.includes(id), x = cx + (i % 3) * (cw + 12), yy = top + Math.floor(i / 3) * (ch + 10), on = UI.sel === i, dono = tem && donoEco(id);
    ctx.save(); ctx.fillStyle = tem ? 'rgba(10,24,56,.92)' : 'rgba(10,18,36,.7)'; ctx.beginPath(); ctx.roundRect(x, yy, cw, ch, 12); ctx.fill();
    if (tem) { ctx.strokeStyle = on ? '#ffe27a' : e.cor; ctx.lineWidth = on ? 3 : 1.5; } else { ctx.setLineDash([6, 5]); ctx.strokeStyle = on ? '#ffe27a' : '#3a4a6a'; ctx.lineWidth = on ? 2 : 1; }
    ctx.stroke(); ctx.restore();
    const rs = Math.min(64, ch - 70);
    if (tem) { retratoEcoQ(id, x + 12, yy + 12, rs, e.cor);
      textoCabe(nomeEcoM(id), x + rs + 22, yy + 32, 17, '#fff', cw - rs - 30); texto(e.papel + ' · Nv ' + nivelDoEco(id), x + rs + 22, yy + 52, 12, '#9fb3d9');
      barraPE(id, x + rs + 22, yy + 62, cw - rs - 36, e.cor);
      texto(dono ? 'com o ' + NOME_QUEM[dono] : 'livre (ninguém está usando)', x + 14, yy + ch - 14, 12, dono ? (COR_GRUPO[dono] || '#7dffa8') : '#9fb3d9'); }
    else { { const lx = x + cw / 2, ly = yy + ch / 2 - 14; ctx.strokeStyle = '#5a6688'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(lx, ly - 4, 8, Math.PI, 0); ctx.stroke(); ctx.fillStyle = '#5a6688'; ctx.fillRect(lx - 11, ly - 4, 22, 16); }   // cadeado
      texto('???', x + cw / 2, yy + ch / 2 + 22, 15, '#5a6688', 'center'); texto('ainda adormecido', x + cw / 2, yy + ch - 14, 11, '#4a5878', 'center'); }
    ZONAS.push([x, yy, x + cw, yy + ch, () => { if (UI.sel === i) teclaEcos('enter'); else UI.sel = i; }]); });
  textoCabe('◀ ▶ ▲ ▼ escolher · ENTER: ver o Eco' + (G.length > 1 ? ' · Q: trocar o herói' : '') + ' · Ecos são espíritos lendários: cada herói leva 1', cx, y + h - 20, 12, '#c8d8f0', w - 48); }

function desenhaEcoDetalhe(cx, cy, w, h, y) { const id = UI.ecoVer, e = ECOS[id], q = quemEco(), S = vagaEco(q), apr = aprendidas(), ap = apUsado(q), lim = limiteAP(nivelQuem(q));
  // coluna da esquerda: retrato, nivel, botao
  const lx = cx, lw = 170; retratoEcoQ(id, lx + 10, cy - 6, 150, e.cor);
  texto(nomeEcoM(id), lx + 10, cy + 168, 20, e.cor); textoCabe(e.nome + ' · ' + e.papel, lx + 10, cy + 186, 12, '#9fb3d9', lw - 10);
  const falta = barraPE(id, lx + 10, cy + 196, 150, e.cor); texto('Nv ' + nivelDoEco(id) + (falta ? ' · faltam ' + falta + ' PE' : ' · máximo'), lx + 10, cy + 218, 12, '#e8f6ff');
  { const ok = S.equip === id, dn = donoEco(id), on = UI.sel === 0, by = cy + 232, txt = ok ? '✔ Com o ' + NOME_QUEM[q] : dn ? 'Passar para o ' + NOME_QUEM[q] : 'Equipar no ' + NOME_QUEM[q];
    ctx.fillStyle = ok ? 'rgba(60,140,90,.55)' : on ? 'rgba(255,207,122,.4)' : 'rgba(255,207,122,.2)'; ctx.strokeStyle = on ? '#ffe27a' : ok ? '#7dffa8' : '#ffcf7a'; ctx.lineWidth = on ? 2.5 : 1.5;
    ctx.beginPath(); ctx.roundRect(lx + 10, by, 150, 30, 8); ctx.fill(); ctx.stroke(); texto(txt, lx + 85, by + 20, 14, ok ? '#d8ffe0' : '#ffe9b8', 'center');
    ZONAS.push([lx + 10, by, lx + 160, by + 30, () => { UI.sel = 0; teclaEcos('enter'); }]);
    if (dn && dn !== q) texto('(agora está com o ' + NOME_QUEM[dn] + ')', lx + 85, by + 46, 11, COR_GRUPO[dn] || '#ffb27a', 'center'); }
  // direita: o que ele da
  const rx = cx + lw + 16, rw = w - lw - 16;
  ctx.fillStyle = 'rgba(10,24,56,.85)'; ctx.beginPath(); ctx.roundRect(rx, cy - 8, rw, 58, 8); ctx.fill();
  texto('O que ' + (BICHO_ECO_M[id] ? (id === 'guardiao' ? 'a ' : 'o ') + BICHO_ECO_M[id] : 'este Eco') + ' dá ao ' + NOME_QUEM[q], rx + 12, cy + 10, 12, '#9fb3d9');
  texto(Object.entries(e.bonus).map(([k, v]) => (NOMES_ATRIB[k] || k) + ' +' + (v < 1 ? Math.round(v * 100) + '%' : v)).join(' · '), rx + 12, cy + 30, 16, '#7dffa8');
  textoCabe('Sobe de nível lutando junto: a cada nível ' + textoPorNivel(id), rx + 12, cy + 45, 11, '#c8d8f0', rw - 24);
  // o espaco de habilidades (o AP)
  texto('Espaço para levar habilidades do ' + NOME_QUEM[q], rx, cy + 70, 12, '#9fb3d9'); texto(ap + ' de ' + lim, rx + rw, cy + 70, 13, ap > lim ? '#ff9a9a' : '#ffe27a', 'right');
  ctx.fillStyle = 'rgba(42,58,102,.9)'; ctx.fillRect(rx, cy + 76, rw, 6); ctx.fillStyle = ap > lim ? '#ff9a9a' : '#ffe27a'; ctx.fillRect(rx, cy + 76, rw * Math.min(1, ap / lim), 6);
  // as habilidades
  const top = cy + 92, n = e.habs.length, passo = Math.min(44, Math.floor((y + h - 44 - top) / n)), alt = passo - 4;
  e.habs.forEach((hb, i) => { const H = HABS[hb], sabe = apr.includes(hb), auto = passivaDoEco(hb, q), leva = auto || S.equipadas.includes(hb), outro = donoHab(hb), yy = top + i * passo, on = UI.sel === i + 1;
    ctx.fillStyle = sabe ? 'rgba(10,24,56,.85)' : 'rgba(10,18,36,.55)'; ctx.strokeStyle = on ? '#ffe27a' : sabe ? 'rgba(143,220,255,.25)' : 'rgba(90,102,136,.3)'; ctx.lineWidth = on ? 2 : 1;
    ctx.beginPath(); ctx.roundRect(rx, yy, rw, alt, 7); ctx.fill(); ctx.stroke();
    const my = yy + alt / 2 + 5;
    const tipo = !sabe ? ['Nv ' + H.nv, 'rgba(90,102,136,.5)', '#c8d0e0'] : H.passiva ? ['SEMPRE ATIVO', 'rgba(60,140,90,.6)', '#d8ffe0'] : ['GOLPE', 'rgba(70,120,220,.6)', '#e0ecff'];
    const tw = pilula(tipo[0], rx + 8, my - (alt > 30 ? 7 : 0), tipo[1], tipo[2]);
    const nx = rx + 16 + Math.max(tw, 86);
    if (alt > 30) { texto(H.nome, nx, yy + 17, 14, sabe ? '#fff' : '#7a86a6'); cortaTxt(H.desc.replace(/^Passiva: /, '') + (H.mp ? '  · ' + H.mp + ' MP' : ''), nx, yy + alt - 6, 11, sabe ? '#9fb3d9' : '#6a7698', rw - (nx - rx) - 120); }
    else { cortaTxt(H.nome + ' — ' + H.desc.replace(/^Passiva: /, ''), nx, my, 12, sabe ? '#e8f6ff' : '#7a86a6', rw - (nx - rx) - 120); }
    // a direita: levando / deixar / automatico
    if (sabe) { if (auto) texto('automático', rx + rw - 10, my, 11, '#9fd8a8', 'right');
      else if (outro && outro !== q) texto('com o ' + NOME_QUEM[outro], rx + rw - 10, my, 11, COR_GRUPO[outro] || '#ffb27a', 'right');
      else { pilula(leva ? 'Levando' : 'Deixar', rx + rw - 10, my - 1, leva ? 'rgba(60,140,90,.7)' : 'rgba(90,102,136,.5)', leva ? '#d8ffe0' : '#c8d0e0', 'right'); texto('ocupa ' + H.ap, rx + rw - 80, my, 11, '#ffe27a', 'right'); } }
    ZONAS.push([rx, yy, rx + rw, yy + alt, () => { if (UI.sel === i + 1) teclaEcos('enter'); else UI.sel = i + 1; }]); });
  // rodape: o que faz a habilidade escolhida, por inteiro
  if (UI.sel > 0) { const H = HABS[e.habs[UI.sel - 1]]; textoCabe(H.nome + ': ' + H.desc + (H.mp ? ' (' + H.mp + ' MP)' : '') + (apr.includes(e.habs[UI.sel - 1]) ? '' : ' — aprende no Nv ' + H.nv + ' do Eco'), cx, y + h - 36, 13, '#ffe9b8', w - 48); }
  textoCabe('▲ ▼ escolher · ENTER: ' + (UI.sel === 0 ? 'equipar' : 'levar ou deixar') + ' · ESC: voltar aos Ecos' + (grupoMenu().length > 1 ? ' · Q: trocar o herói' : ''), cx, y + h - 18, 12, '#c8d8f0', w - 48); }
