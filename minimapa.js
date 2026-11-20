/* ============ Minimapa, setas de missao e Mapa do menu ============
   Missao PRINCIPAL: estrela dourada, sempre apontada. Missao SECUNDARIA: losango ciano, so a que o jogador manda RASTREAR
   (menu -> Missoes -> ENTER). Se o alvo esta em outra regiao, o marcador fica na saida (portao da vila / caminho da trilha).
   Fora da tela, uma seta na borda mostra para que lado ir. Estado: JOGO.rastreio = id da secundaria rastreada. */
const ORDEM_REG = ['vila', 'trilha', 'garganta', 'vale', 'pico', 'caverna'];   // saida rumo a regiao do alvo: a proxima na ordem (SAIDAS, em vila_motor.js)
const saidaPara = alvo => {   // a caverna fica DENTRO da Garganta: de fora, o caminho e a boca da caverna; de dentro, a saida de baixo
  if (REGIAO === 'caverna') {const s = (SAIDAS.caverna || {}).back; return s ? {x: s[0], y: s[1], nome: s[2]} : null;}
  if (alvo === 'caverna' && REGIAO === 'garganta') return {x: 1330, y: 905, nome: 'Caverna'};
  if (alvo === 'caverna') alvo = 'garganta';
const i = ORDEM_REG.indexOf(REGIAO), j = ORDEM_REG.indexOf(alvo), s = (SAIDAS[REGIAO] || {})[j > i ? 'fwd' : 'back']; return s ? {x: s[0], y: s[1], nome: s[2]} : null;};
const PASSOS_DEST = {carroca_tombada: [() => {const f = PISTAS_PRESA.filter(id => !(JOGO.desc || []).includes(id)).map(id => PISTA_PRESA_PT[id]); return f[0] || [727, 548];}, [727, 548], null], amigo_floco: [() => {const f = PISTAS_FLOCO.filter(id => !(JOGO.desc || []).includes(id)).map(id => PISTA_FLOCO_PT[id]); let b = f[0] || [470, 655], bd = 1e9; for (const p of f) {const d = Math.hypot(p[0] - hero.x, p[1] - hero.y); if (d < bd) {bd = d; b = p;}} return ['trilha', b[0], b[1]];}, ['trilha', 470, 655]], machado_halvard: [['garganta', 420, 520], ['garganta', 430, 440]], olhos_roxos: [['trilha', 722, 330], ['trilha', 300, 470], ['trilha', 1232, 485], ['caverna', 720, 250]]};
const COR_P = '#ffd84a', COR_S = '#5fe3ff';

function destinoMissao(k) {   // onde ir agora para avançar a missão k -> {reg,x,y,txt} ou null
  if (k === '_historia') return hero.espada ? null : {reg: 'vila', x: 790, y: 140, txt: 'Suba ao altar e pegue a lâmina'};
  // 2026-11-20 (pedido): depois do Skoll a estrela ja aponta a TRILHA DO FENRIR (o circulo do Pico); as pegadas so mostram o caminho
  if (k === '_pegadas') return {reg: 'pico', x: 655, y: 280, txt: 'Siga as pegadas até o Pico do Uivo'};
  if (k === '_festival') return {reg: 'vila', x: 722, y: 600, txt: 'Volte para Invernália: o festival é esta noite'};
  if (k === '_preparo' && typeof destinoPreparo === 'function' && JOGO.cap2.fase === 'preparo') {const dp = destinoPreparo(); if (dp) return {reg: 'vila', x: dp.x, y: dp.y, txt: dp.txt};}
  if (k === '_preparo') {const p = (typeof POS_NPC === 'function' && NA_VILA) ? POS_NPC().vovo : null; return {reg: 'vila', x: p ? p.x : 300, y: p ? p.y : 588, txt: JOGO.cap2.fase === 'preparo' ? 'Ajude nos preparativos e volte à Vovó Hilda' : 'Fale com a Vovó Hilda: o festival é hoje'};}
  if (k === '_cerimonia') {const p = (typeof POS_NPC === 'function' && NA_VILA) ? POS_NPC().vovo : null; return {reg: 'vila', x: p ? p.x : 722, y: p ? p.y : 600, txt: 'Aproveite a festa e fale com a Vovó Hilda (o brinde)'};}
  const M = MISSOES[k]; if (!M) return null;
  if (k === 'prova_fenrir' && estadoMissao(k) === 'ativa') return {reg: 'pico', x: 655, y: 280, txt: 'Suba ao Pico do Uivo (siga as pegadas)'};
  const st = estadoMissao(k), npc = () => {const p = (typeof POS_NPC === 'function' && NA_VILA) ? POS_NPC()[M.quem] : null; return p ? {reg: 'vila', x: p.x, y: p.y} : {reg: 'vila', x: 722, y: 560};};
  if (st === 'feita') return null;
  if (!st) return Object.assign(npc(), {txt: 'Fale com ' + M.quemNome});
  if (missaoPronta(k)) return Object.assign(npc(), {txt: 'Volte a ' + M.quemNome});
  if (M.passos && PASSOS_DEST[k]) {
    const i = M.passos.findIndex(p => !p.ok()); let d = PASSOS_DEST[k][i]; if (typeof d === 'function') d = d();
    if (d) return {reg: d[0], x: d[1], y: d[2], area: i === 0, txt: (i === 0 && k === 'olhos_roxos') ? 'Vasculhe a trilha: lobos ' + Math.min(3, (JOGO.cap1 || {}).lobos || 0) + '/3' : M.passos[i].txt};
    return Object.assign(npc(), {txt: 'Volte a ' + M.quemNome});
  }
  const cs = COLETAS.filter(c => c.missao === k && !JOGO.pegos.includes(c.id));
  if (cs.length) {
    let b = cs[0], bd = 1e9; for (const c of cs) {const d = Math.hypot(c.x - hero.x, c.y - hero.y); if (d < bd) {bd = d; b = c;}}
    return {reg: 'vila', x: b.x, y: b.y, txt: M.nome + ': ' + progressoMissao(k) + '/' + alvoMissao(k)};
  }
  return Object.assign(npc(), {txt: M.nome});
}
// 2026-11-20 (pedido: 'o jogador as vezes e noob, sempre deixar marcada a direcao da principal'): depois de Olhos Roxos,
// a estrela segue para as pegadas do Fenrir na Garganta e, aceita a prova, para o circulo de pedras no Pico do Uivo
const missaoPrincipalAtual = () => {if (!hero.espada) return '_historia'; if (estadoMissao('olhos_roxos') !== 'feita') return 'olhos_roxos';
  const pf = typeof provaFenrirEstado === 'function' ? provaFenrirEstado() : null;
  if (pf === 'pegadas') return '_pegadas'; if (estadoMissao('prova_fenrir') === 'ativa') return 'prova_fenrir';
  // CAPITULO 2 (FICHA_CAP2_FESTIVAL.md): depois do Fenrir, a estrela leva de volta para a vila e, na festa, ate a Vovo
  if (pf === 'feita' || pf === 'tem') {if (!JOGO.cap2) return '_festival'; if (JOGO.cap2.fase === 'volta' || JOGO.cap2.fase === 'preparo') return '_preparo'; if (JOGO.cap2.fase === 'noite') return '_cerimonia';}
  return null;};
function missaoRastreada() {const r = JOGO.rastreio; return (r && MISSOES[r] && !MISSOES[r].principal && estadoMissao(r) === 'ativa') ? r : null;}
function alternaRastreio(k) {
  if (!MISSOES[k] || MISSOES[k].principal || estadoMissao(k) !== 'ativa') return;
  JOGO.rastreio = JOGO.rastreio === k ? null : k;
  som(SOM.ui_vez, .5); aviso(JOGO.rastreio ? 'Rastreando: ' + MISSOES[k].nome : 'Rastreio desligado', JOGO.rastreio ? COR_S : '#c8d8f0'); salvaJogo();
}
// alvos desta tela: [{k,cor,forma,x,y,fora,txt}]
function alvosAgora() {
  const out = [];
  for (const [k, cor, forma] of [[missaoPrincipalAtual(), COR_P, 'estrela'], [missaoRastreada(), COR_S, 'losango']]) {
    if (!k) continue; const d = destinoMissao(k); if (!d) continue;
    if (d.reg === REGIAO) out.push({k, cor, forma, x: d.x, y: d.y, fora: false, txt: d.txt, semMarca: !!d.area});
    else {const s = saidaPara(d.reg); if (s) out.push({k, cor, forma, x: s.x, y: s.y, fora: true, txt: d.txt, via: s.nome});}
  }
  return out;
}
function formaMarca(c, forma, x, y, r, cor, a) {
  c.save(); c.globalAlpha = a == null ? 1 : a; c.fillStyle = cor; c.strokeStyle = '#2a1a00'; c.lineWidth = Math.max(1.2, r * .22); c.beginPath();
  if (forma === 'estrela') for (let i = 0; i < 10; i++) {const q = i % 2 ? r * .45 : r, an = -1.5708 + i * .6283; c.lineTo(x + Math.cos(an) * q, y + Math.sin(an) * q);}
  else {c.moveTo(x, y - r); c.lineTo(x + r * .75, y); c.lineTo(x, y + r); c.lineTo(x - r * .75, y);}
  c.closePath(); c.fill(); c.stroke(); c.restore();
}
// ---------- HUD: minimapa no canto + setas na borda
function miniHud() {
  if (fala || !MAPA.complete || !V.w) return;
  const mw = 112, mh = Math.round(mw * V.h / V.w), mx = W - mw - 10, my = 100, k = mw / V.w, al = alvosAgora();
  ctx.save(); ctx.beginPath(); ctx.roundRect(mx, my, mw, mh, 8); ctx.fillStyle = 'rgba(6,16,40,.45)'; ctx.fill(); ctx.clip();
  ctx.globalAlpha = .55; ctx.drawImage(MAPA, mx, my, mw, mh); ctx.globalAlpha = 1;
  const pul = .75 + .25 * Math.sin(t * 5);
  for (const a of al) {
    if (a.semMarca) continue;
    const x = mx + a.x * k, y = my + a.y * k; ctx.strokeStyle = a.cor; ctx.globalAlpha = .6 * pul; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, 9 + 3 * Math.sin(t * 4), 0, 6.283); ctx.stroke(); ctx.globalAlpha = 1;
    formaMarca(ctx, a.forma, x, y, 5, a.cor);
    if (a.fora) {
      ctx.font = 'bold 9px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,20,.9)';
      const tx = Math.min(mx + mw - 18, Math.max(mx + 18, x)), ty = y > my + mh - 14 ? y - 10 : y + 17;
      ctx.strokeText('→ ' + a.via, tx, ty); ctx.fillStyle = '#fff'; ctx.fillText('→ ' + a.via, tx, ty);
    }
  }
  const hx = mx + hero.x * k, hy = my + hero.y * k; ctx.fillStyle = '#6fe3ff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(hx, hy, 3.6, 0, 6.283); ctx.fill(); ctx.stroke();
  ctx.restore(); ctx.save(); ctx.strokeStyle = 'rgba(143,220,255,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(mx, my, mw, mh, 8); ctx.stroke(); ctx.restore();
  // objetivos escritos
  let ty = my + mh + 15;
  for (const a of al) {
    formaMarca(ctx, a.forma, mx + 7, ty - 4, 5, a.cor); let s = a.txt || ''; ctx.font = 'bold 11px "Trebuchet MS"';
    const o = s; while (s.length > 4 && ctx.measureText(s).width > mw - 24) s = s.slice(0, -2);
    if (s !== o) s += '…'; texto(s, mx + 17, ty, 11, '#e8f6ff'); ty += 16;
  }
  // PREPARATIVOS DO FESTIVAL: a lista das 3 tarefas embaixo dos objetivos
  {const lp = typeof listaPreparo === 'function' ? listaPreparo() : null;
    if (lp) {texto('Preparativos', mx + 4, ty, 11, '#ffe27a'); ty += 14;
      for (const [s0, ok] of lp) {let s = (ok ? '✔ ' : '☐ ') + s0; ctx.font = 'bold 10px "Trebuchet MS"'; while (s.length > 6 && ctx.measureText(s).width > mw - 6) s = s.slice(0, -2);
        texto(s, mx + 4, ty, 10, ok ? '#7dffa8' : '#e8f6ff'); ty += 13;} ty += 4;}}
  if (typeof descRegiao === 'function' && descRegiao(REGIAO).length) {const f = descFeitas(REGIAO), t = descRegiao(REGIAO).length; texto('◈ Descobertas ' + f + '/' + t, mx + 4, ty, 11, f === t ? '#7dffa8' : '#9fe8ff');}
  // setas na borda para os alvos fora da tela
  for (const a of al) {
    if (a.semMarca) continue;
    const sx = W / 2 + (a.x - cam.x) * Z, sy = H / 2 + (a.y - cam.y) * Z, m = 46;
    if (sx > m && sx < W - m && sy > m && sy < H - m) continue;
    const dx = sx - W / 2, dy = sy - H / 2, ang = Math.atan2(dy, dx), ex = W / 2 - m, ey = H / 2 - m;
    const s = Math.min(ex / Math.max(Math.abs(Math.cos(ang)), 1e-6), ey / Math.max(Math.abs(Math.sin(ang)), 1e-6));
    const ax = W / 2 + Math.cos(ang) * s, ay = H / 2 + Math.sin(ang) * s, bob = Math.sin(t * 5) * 3;
    ctx.save(); ctx.translate(ax + Math.cos(ang) * bob, ay + Math.sin(ang) * bob); ctx.globalAlpha = .93;
    ctx.fillStyle = 'rgba(6,16,40,.82)'; ctx.strokeStyle = a.cor; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 17, 0, 6.283); ctx.fill(); ctx.stroke();
    formaMarca(ctx, a.forma, 0, 0, 9, a.cor);
    ctx.rotate(ang); ctx.fillStyle = a.cor; ctx.strokeStyle = '#06101f'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(21, -8); ctx.lineTo(21, 8); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    const d = Math.round(Math.hypot(a.x - hero.x, a.y - hero.y) / 10);
    texto(d + ' m', Math.min(W - 24, Math.max(24, ax)), Math.min(H - 8, Math.max(14, ay + 33 * (Math.sin(ang) > 0 ? -1 : 1))), 11, '#e8f6ff', 'center');
  }
}
// ---------- aba MAPA do menu (estilo menu FF: moldura dupla, objetivos, legenda)
function desenhaMapa(x, y, w, h) {
  const px = x + 14, py = y + 50, pw = w - 28 - 262, ph = h - 64, k = Math.min((pw - 12) / V.w, (ph - 12) / V.h), dw = V.w * k, dh = V.h * k, mx = px + (pw - dw) / 2, my = py + (ph - dh) / 2;
  ctx.save(); ctx.fillStyle = 'rgba(2,8,22,.9)'; ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 10); ctx.fill(); ctx.strokeStyle = '#8fdcff'; ctx.lineWidth = 2; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,226,122,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(px + 5, py + 5, pw - 10, ph - 10, 7); ctx.stroke();
  ctx.beginPath(); ctx.roundRect(mx, my, dw, dh, 5); ctx.clip(); ctx.drawImage(MAPA, mx, my, dw, dh);
  ctx.fillStyle = 'rgba(6,16,40,.18)'; ctx.fillRect(mx, my, dw, dh);
  const vg = ctx.createRadialGradient(mx + dw / 2, my + dh / 2, dh * .35, mx + dw / 2, my + dh / 2, dh * .85); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,6,20,.55)'); ctx.fillStyle = vg; ctx.fillRect(mx, my, dw, dh);
  ctx.restore();
  const P = (a, b) => [mx + a * k, my + b * k], al = alvosAgora();
  for (const s of TESOUROS) {
    if ((s.regiao || 'vila') !== REGIAO) continue; const [a, b] = P(s.x, s.y), ab = pegou(s.id);
    if (s.tipo === 'bau') {ctx.fillStyle = ab ? '#5a6688' : '#ffcf5a'; ctx.fillRect(a - 4, b - 3, 8, 6); ctx.strokeStyle = '#0a1830'; ctx.lineWidth = 1; ctx.strokeRect(a - 4, b - 3, 8, 6);}
    else if (!ab) {ctx.fillStyle = '#fff6c8'; ctx.beginPath(); ctx.arc(a, b, 2, 0, 6.283); ctx.fill();}
  }
  for (const c of COLETAS) if (coletaAtiva(c)) {const [a, b] = P(c.x, c.y); iconeItem(ctx, c.item, a - 6, b - 6, 12);}
  const pos = POS_NPC(), rot = [];
  for (const id in pos) {
    const n = pos[id]; if (!n) continue; const [a, b] = P(n.x, n.y);
    ctx.fillStyle = LOJAS[id] ? '#ffe27a' : '#e8f6ff'; ctx.strokeStyle = '#06101f'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(a, b, 3.6, 0, 6.283); ctx.fill(); ctx.stroke();
    if (!rot.some(([u, v]) => Math.abs(u - a) < 60 && Math.abs(v - b) < 14)) {rot.push([a, b]); texto(NOME_NPC[id] + (LOJAS[id] ? ' $' : ''), a, b + 15, 11, '#e8f6ff', 'center');}
    const mk = marcaMissao(id); if (mk && mk !== '…') texto(mk, a, b - 8, 17, mk === '!' ? '#ffe27a' : '#7dffa8', 'center');
  }
  for (const a of al) {
    if (a.semMarca) continue;
    const [x1, y1] = P(a.x, a.y); ctx.save(); ctx.strokeStyle = a.cor; ctx.globalAlpha = .55; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x1, y1, 14 + 5 * Math.sin(t * 4), 0, 6.283); ctx.stroke(); ctx.restore();
    formaMarca(ctx, a.forma, x1, y1, 10, a.cor); if (a.fora) texto('→ ' + a.via, x1, y1 + 24, 12, '#fff', 'center');
  }
  const [hx, hy] = P(hero.x, hero.y); ctx.fillStyle = '#6fe3ff'; ctx.beginPath(); ctx.arc(hx, hy, 5 + 1.5 * Math.sin(t * 5), 0, 6.283); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke(); texto('Jux', hx, hy - 11, 12, '#bff4ff', 'center');
  // coluna da direita
  const lx = px + pw + 14, lw = 248; let ly = py + 4;
  // nome da regiao certo em cada mapa (2026-11-20: antes todo mapa fora da vila dizia 'Trilha dos Pinheiros')
  const NR = {vila: ['Invernália', 'Vila do Norte'], trilha: ['Trilha dos Pinheiros', 'Lobos, Bolotas e Goblins'], garganta: ['Garganta Gelada', 'Goblins e acampamentos'], vale: ['Vale dos Lobos', 'Lobos e a Presa-Antiga'], caverna: ['Caverna de Gelo', 'Onde a Ordem prendeu o Skoll'], pico: ['Pico do Uivo', 'O círculo de pedras · sem lutas aleatórias']}[REGIAO] || ['', ''];
  const nvR = typeof ENCONTROS !== 'undefined' && ENCONTROS[REGIAO] && !ENCONTROS[REGIAO].semLutas && ENCONTROS[REGIAO].nv;
  texto(NR[0], lx, ly + 16, 20, '#ffe27a'); ly += 22; texto(NR[1] + (nvR ? ' · Nv ' + nvR[0] + '–' + nvR[1] : ''), lx, ly + 12, 12, '#9fb3d9'); ly += 28;
  ctx.fillStyle = 'rgba(127,214,245,.35)'; ctx.fillRect(lx, ly, lw - 6, 1); ly += 14;
  texto('Objetivos', lx, ly + 4, 14, '#9fe8ff'); ly += 20;
  const quebra = (s, xx, yy, ww, tam, cor) => {ctx.font = `bold ${tam}px "Trebuchet MS"`; let lin = ''; for (const p of s.split(' ')) {if (ctx.measureText(lin + p).width > ww) {texto(lin, xx, yy, tam, cor); yy += tam + 4; lin = '';} lin += p + ' ';} if (lin) {texto(lin, xx, yy, tam, cor); yy += tam + 4;} return yy;};
  const kp = missaoPrincipalAtual(), kr = missaoRastreada();
  for (const [kk, cor, forma, rot2] of [[kp, COR_P, 'estrela', 'Principal'], [kr, COR_S, 'losango', 'Rastreada']]) {
    formaMarca(ctx, forma, lx + 8, ly, 7, kk ? cor : '#4a5878'); texto(rot2, lx + 22, ly + 4, 13, kk ? cor : '#5a6688');
    const d = kk && destinoMissao(kk); ly += 18;
    if (kk) {texto(kk === '_historia' ? 'A lâmina no altar' : kk === '_pegadas' ? 'Pegadas enormes' : kk === '_festival' || kk === '_cerimonia' || kk === '_preparo' ? 'O Festival' : MISSOES[kk].nome, lx + 22, ly + 2, 13, '#fff'); ly += 16; ly = quebra(d ? d.txt : '', lx + 22, ly + 2, lw - 40, 12, '#c8d8f0') + 4;}
    else {texto(forma === 'losango' ? 'Nenhuma (Missões → ENTER)' : 'Nenhuma agora', lx + 22, ly + 2, 12, '#5a6688'); ly += 20;}
    ly += 4;
  }
  ctx.fillStyle = 'rgba(127,214,245,.35)'; ctx.fillRect(lx, ly, lw - 6, 1); ly += 16;
  for (const [s, c, d] of [['●', '#6fe3ff', 'Você'], ['!', '#ffe27a', 'Missão nova'], ['✔', '#7dffa8', 'Entregar missão'], ['$', '#ffe27a', 'Loja'], ['■', '#ffcf5a', 'Baú fechado'], ['■', '#5a6688', 'Baú aberto'], ['✦', '#fff6c8', 'Brilho no chão']]) {
    texto(s, lx + 8, ly, 14, c, 'center'); texto(d, lx + 24, ly, 13, '#e8f6ff'); ly += 19;
  }
  const TR = TESOUROS.filter(s => (s.regiao || 'vila') === REGIAO); ly += 6;
  if (!NA_VILA) {texto('Repelente: ' + (JOGO.repelente ? JOGO.repelente + ' passos' : 'não'), lx, ly, 13, '#c8b0ff'); ly += 20;}
  texto('Baús ' + TR.filter(s => s.tipo === 'bau' && pegou(s.id)).length + '/' + TR.filter(s => s.tipo === 'bau').length + '   Brilhos ' + TR.filter(s => s.tipo !== 'bau' && pegou(s.id)).length + '/' + TR.filter(s => s.tipo !== 'bau').length, lx, ly, 13, '#c8d8f0'); ly += 20;
  if (typeof descRegiao === 'function' && descRegiao(REGIAO).length) {texto('Descobertas ' + descFeitas(REGIAO) + '/' + descRegiao(REGIAO).length, lx, ly, 13, '#9fe8ff'); ly += 20;}
  if (typeof chefesRegiao === 'function' && chefesRegiao(REGIAO).length) {texto('Mini-chefes ' + chefesRegiao(REGIAO).filter(c => chefeFeito(c.id)).length + '/' + chefesRegiao(REGIAO).length, lx, ly, 13, '#ff9a8a'); ly += 20;}
  texto('Missões ' + ORDEM_MISSOES.filter(k2 => estadoMissao(k2) === 'feita').length + '/' + ORDEM_MISSOES.length, lx, ly, 13, '#c8d8f0');
}
