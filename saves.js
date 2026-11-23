/* CARREGAR E CAPITULOS (FICHA_CARREGAR.md, aprovada 2026-11-21)
   - 3 ESPACOS de save (jux_slot_1..3): cada um guarda uma copia do jogo (jux_save + jux_progresso) e um resumo
     (capitulo, lugar, nivel, tempo, data). O jogo que voce esta jogando continua sendo o jux_save de sempre (o save automatico).
   - FOTOS dos pontos da historia (jux_foto_<id>): na primeira vez que voce chega num ponto, o jogo guarda uma copia do save
     daquele momento. Em "Capitulos" da para voltar a qualquer ponto ja alcancado, com o time que voce tinha ali.
     Pontos alcancados ANTES deste sistema (sem foto): os do Capitulo 3, a invasao e o comeco sao montados a partir do save
     atual (com o seu time de agora); os outros liberam quando voce passar por eles de novo.
   Usa o menu da vila (vila_menu.js): UI, painel, linhaSel, texto, aviso, som/SOM. Carregar depois do vila_menu.js. */
'use strict';
const SLOTS_SAVE = [1, 2, 3];
const NOME_LUGAR = { vila: 'Invernália', trilha: 'A trilha', vale: 'O Vale dos Lobos', garganta: 'A Garganta', pico: 'O Pico do Uivo', caverna: 'A caverna', rio: 'O rio', cinzas: 'A trilha das cinzas', brasaria: 'Brasária' };
const lerJ = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
function capituloDe(J) {
  if (J.cap3 && J.local === 'brasaria') return 'Cap. 3 — Brasária';
  if (J.cap3 && J.cap3.parteA2) return 'Cap. 3 — O portão de Brasária';
  if (J.cap3 && J.local === 'cinzas') return 'Cap. 3 — A trilha das cinzas';
  if (J.cap3) return J.cap3.parteA ? 'Cap. 3 — O Porto de Cinzas' : J.cap3.fase === 'rio' ? 'Cap. 3 — O rio' : 'Cap. 3';
  if (J.cap2) return J.cap2.fase === 'fim' ? 'Fim do Cap. 2' : 'Cap. 2 — ' + ({ volta: 'A volta', preparo: 'O festival', noite: 'O festival', ataque: 'A invasão', manha: 'A manhã seguinte' }[J.cap2.fase] || 'A vila');
  return 'Cap. 1';
}
function resumoDe(J) { const r = J.rio && J.local === 'rio' ? ' (trecho ' + ((J.rio.trecho || 0) + 1) + ')' : '';
  return { cap: capituloDe(J), lugar: (NOME_LUGAR[J.local || 'vila'] || 'Invernália') + r, nivel: J.nivel || 1, tempo: typeof fmtTempo === 'function' ? fmtTempo(J.tempo || 0) : '', data: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR').slice(0, 5) }; }
function lerSlot(n) { return lerJ('jux_slot_' + n); }
function salvaNoSlot(n) {
  if (typeof salvaVila === 'function') salvaVila(); else salvaJogo();
  localStorage.setItem('jux_slot_' + n, JSON.stringify({ meta: resumoDe(JOGO), jux_save: localStorage.getItem('jux_save'), jux_progresso: localStorage.getItem('jux_progresso') }));
  localStorage.setItem('jux_slot_ativo', String(n)); som(SOM.ui_vez, .6); aviso('Salvo no espaço ' + n + '!', '#7dffa8'); }
function abreJogo(saveTxt, progTxt) {   // troca o jogo atual por outro e abre a pagina de onde ele parou
  window.__importou = true; localStorage.setItem('jux_save', saveTxt); if (progTxt) localStorage.setItem('jux_progresso', progTxt);
  localStorage.removeItem('jux_encontro'); let J = null; try { J = JSON.parse(saveTxt); } catch (e) {}
  const pag = (J && J.local && NOME_LUGAR[J.local]) ? J.local : 'vila'; setTimeout(() => { location.href = pag + '.html?t=' + Date.now(); }, 300); }
function carregaSlot(n) { const s = lerSlot(n); if (!s || !s.jux_save) { aviso('Espaço ' + n + ' vazio.', '#ff9a9a'); return; } localStorage.setItem('jux_slot_ativo', String(n)); aviso('Carregando o espaço ' + n + '…', '#bff4ff'); abreJogo(s.jux_save, s.jux_progresso); }

// ---------- os pontos da historia ----------
const C2 = J => (J.cap2 || {}).fase, PV = J => J.provas || {};
const semEcoGuardiao = J => { const E = J.ecos; if (!E) return; E.tem = (E.tem || []).filter(x => x !== 'guardiao'); if (E.equip === 'guardiao') E.equip = null;
  for (const q in (E.grupo || {})) if (E.grupo[q].equip === 'guardiao') E.grupo[q].equip = null; };
const noRio = (J, tr, x, y) => { J.cap3 = { fase: 'rio', barco: true }; J.rio = { trecho: tr, x, y }; J.local = 'rio'; delete (J.provas || {}).serpente; semEcoGuardiao(J); delete J.vida; };
// trilha das cinzas (Cap. 3, Parte A2): o time a pe, depois do Porto de Cinzas (o rio inteiro ja feito)
const naTrilhaCinzas = (J, x, y) => { J.cap3 = Object.assign(J.cap3 || {}, { fase: 'cinzas', barco: true, serpVista: true, tartarok: true, parteA: true }); J.provas = J.provas || {}; J.provas.serpente = 'feita';
  J.ecos = J.ecos || { equip: null, tem: [], pe: {}, equipadas: [] }; if (!J.ecos.tem.includes('guardiao')) J.ecos.tem.push('guardiao');
  for (const k of ['carrocas', 'forjados', 'parteA2', 'chegou']) delete J.cap3[k]; delete J.provas.forjados; J.cap3.chegou = true; J.local = 'cinzas'; J.cinzas = { x, y }; delete J.vida; };
const PONTOS = [
  { id: 'inicio', cap: 1, nome: 'O começo (o chiqueiro)', ok: () => true, monta: null, novo: true },
  { id: 'espada', cap: 1, nome: 'A espada Aurora', ok: J => !!(J.vila && J.vila.espada) },
  { id: 'trilha', cap: 1, nome: 'A trilha e o Bolotão', ok: J => !!J.trilha },
  { id: 'vale', cap: 1, nome: 'O Vale dos Lobos (a Presa-Antiga)', ok: J => !!J.vale },
  { id: 'garganta', cap: 1, nome: 'A Garganta (o Capitão)', ok: J => !!J.garganta },
  { id: 'pico', cap: 1, nome: 'O Pico do Uivo (a Prova do Fenrir)', ok: J => !!J.pico },
  { id: 'caverna', cap: 1, nome: 'A caverna (o Skoll)', ok: J => !!J.caverna },
  { id: 'volta', cap: 2, nome: 'A volta para a vila', ok: J => !!J.cap2 },
  { id: 'festival', cap: 2, nome: 'O festival', ok: J => ['preparo', 'noite', 'ataque', 'manha', 'fim'].includes(C2(J)) },
  { id: 'invasao', cap: 2, nome: 'A invasão', ok: J => ['ataque', 'manha', 'fim'].includes(C2(J)) || !!J.cap3,
    monta: J => { J.cap2 = { fase: 'ataque', lutas: {} }; for (const k of ['atq_1', 'atq_2', 'atq_3', 'ignarok']) delete (J.provas || {})[k]; delete J.cap3; delete J.rio; semEcoGuardiao(J);
      J.local = 'vila'; J.vila = Object.assign(J.vila || {}, { x: 722, y: 716, espada: true, abertura: true }); delete J.vida; } },
  { id: 'manha', cap: 2, nome: 'A manhã seguinte', ok: J => ['manha', 'fim'].includes(C2(J)) || !!J.cap3 },
  { id: 'barco', cap: 3, nome: 'O barco do Borin', ok: J => C2(J) === 'fim' || !!J.cap3,
    monta: J => { J.cap2 = Object.assign(J.cap2 || {}, { fase: 'fim' }); delete J.cap3; delete J.rio; delete (J.provas || {}).serpente; semEcoGuardiao(J);
      J.local = 'vila'; J.vila = Object.assign(J.vila || {}, { x: 722, y: 716, espada: true, abertura: true }); delete J.vida; } },
  { id: 'trecho1', cap: 3, nome: 'O rio de gelo (trecho 1)', ok: J => !!(J.cap3 && J.cap3.barco), monta: J => noRio(J, 0, 640, 372) },
  { id: 'trecho2', cap: 3, nome: 'O degelo e a Marta (trecho 2)', ok: J => !!(J.rio && J.rio.trecho >= 1) || !!(J.cap3 && J.cap3.serpVista), monta: J => noRio(J, 1, 760, 90) },
  { id: 'trecho3', cap: 3, nome: 'As águas quentes (trecho 3)', ok: J => !!(J.rio && J.rio.trecho >= 2) || !!(J.cap3 && J.cap3.serpVista), monta: J => noRio(J, 2, 760, 70) },
  { id: 'serpente', cap: 3, nome: 'A Serpente do Degelo', ok: J => !!(J.cap3 && J.cap3.serpVista), monta: J => { noRio(J, 2, 740, 520); } },
  { id: 'porto', cap: 3, nome: 'A Tartarok e o Porto de Cinzas', ok: J => !!(J.cap3 && J.cap3.tartarok),
    monta: J => { noRio(J, 2, 725, 700); J.provas = J.provas || {}; J.provas.serpente = 'vencida'; J.cap3.serpVista = true; J.cap3.tartarok = true;
      J.ecos = J.ecos || { equip: null, tem: [], pe: {}, equipadas: [] }; if (!J.ecos.tem.includes('guardiao')) J.ecos.tem.push('guardiao'); } },
  { id: 'cinzas_cais', cap: 3, nome: 'Trilha das cinzas: o cais', ok: J => !!(J.cap3 && J.cap3.parteA && (J.cinzas || J.local === 'cinzas')), monta: J => naTrilhaCinzas(J, 686, 985) },
  { id: 'cinzas_carrocas', cap: 3, nome: 'Depois das carroças', ok: J => !!(J.cap3 && J.cap3.forjados),
    monta: J => { naTrilhaCinzas(J, 482, 470); J.cap3.carrocas = true; J.cap3.forjados = true; J.provas.forjados = 'feita'; } },
  { id: 'cinzas_portao', cap: 3, nome: 'O portão de Brasária', ok: J => !!(J.cap3 && J.cap3.parteA2),
    monta: J => { naTrilhaCinzas(J, 776, 262); Object.assign(J.cap3, { carrocas: true, forjados: true, parteA2: true, fase: 'brasaria' }); J.provas.forjados = 'feita'; delete J.cap3.bras; delete J.cap3.bacon; } },
  // Cap. 3, Parte B: Brasaria (brasaria.js). Depois da cutscene "O porco abriu o portao": o time no meio da praca
  { id: 'brasaria_chegada', cap: 3, nome: 'Brasária: a chegada', ok: J => !!(J.cap3 && J.cap3.bras && J.cap3.bras.chegou),
    monta: J => { naTrilhaCinzas(J, 776, 262); Object.assign(J.cap3, { carrocas: true, forjados: true, parteA2: true, fase: 'brasaria', bacon: true, bras: { chegou: true } }); J.provas.forjados = 'feita';
      J.local = 'brasaria'; J.brasaria = { x: 745, y: 700 }; } },
];
const fotoDe = id => lerJ('jux_foto_' + id);
// tira a foto dos pontos alcancados agora (chamado a cada salvaJogo): so a PRIMEIRA vez de cada ponto
function marcaPontos() { if (window.__importou || window.__semSalvar || window.__modoTeste || typeof JOGO !== 'object') return;
  for (const p of PONTOS) { if (p.novo || localStorage.getItem('jux_foto_' + p.id)) continue; let ok = false; try { ok = p.ok(JOGO); } catch (e) {} if (!ok) continue;
    // o ponto JA passou antes deste sistema? (ex.: abriu o jogo no Cap. 3): so marca como alcancado, sem foto (a foto seria de outro momento)
    const depois = PONTOS.slice(PONTOS.indexOf(p) + 1).some(q => { try { return !q.novo && q.ok(JOGO); } catch (e) { return false; } });
    localStorage.setItem('jux_foto_' + p.id, JSON.stringify(depois ? { semFoto: true } : { dados: JSON.stringify(JOGO), prog: localStorage.getItem('jux_progresso'), data: new Date().toLocaleDateString('pt-BR') })); } }
function estadoPonto(p) { if (p.novo) return 'novo'; const f = fotoDe(p.id); if (f && f.dados) return 'foto'; let ok = false; try { ok = p.ok(JOGO); } catch (e) {}
  if ((f || ok) && p.monta) return 'monta'; if (f || ok) return 'espera'; return 'fechado'; }
function vaiParaPonto(p) { const st = estadoPonto(p);
  if (st === 'novo') { if (typeof novoJogo === 'function') novoJogo(); window.__importou = true; aviso('Novo começo…', '#bff4ff'); setTimeout(() => { location.href = 'vila.html?t=' + Date.now(); }, 300); return; }
  if (st === 'foto') { const f = fotoDe(p.id); aviso('Voltando para: ' + p.nome + '…', '#bff4ff'); abreJogo(f.dados, f.prog); return; }
  if (st === 'monta') { const J = JSON.parse(JSON.stringify(JOGO)); p.monta(J); aviso('Voltando para: ' + p.nome + '…', '#bff4ff'); abreJogo(JSON.stringify(J), localStorage.getItem('jux_progresso')); return; } }

// ---------- a janela (Salvar / Carregar / Capitulos) ----------
// UI.saves = {modo:'salvar'|'carregar'|'caps'|'guardar', sel, conf, ponto}
function abreSaves(modo) { UI.saves = { modo, sel: 0, conf: null }; UI.menu = false; som(SOM.ui_vez, .5); }
const listaSaves = () => { const S = UI.saves; if (S.modo === 'caps') return PONTOS; if (S.modo === 'guardar') return [...SLOTS_SAVE, 'nao']; return SLOTS_SAVE; };
function teclaSaves(k) { const S = UI.saves, L = listaSaves();
  if (k === 'escape' || k === 'backspace' || k === 'm') { if (S.modo === 'guardar') { S.modo = 'caps'; S.sel = PONTOS.indexOf(S.ponto); S.conf = null; } else UI.saves = null; som(SOM.ui_mover, .45); return; }
  if (k === 'arrowup' || k === 'w') { S.sel = (S.sel + L.length - 1) % L.length; S.conf = null; som(SOM.ui_mover, .3); return; }
  if (k === 'arrowdown' || k === 's') { S.sel = (S.sel + 1) % L.length; S.conf = null; som(SOM.ui_mover, .3); return; }
  if (k !== 'enter' && k !== ' ' && k !== 'e') return;
  const it = L[S.sel];
  if (S.modo === 'salvar') { if (lerSlot(it) && S.conf !== it) { S.conf = it; aviso('Já tem um jogo no espaço ' + it + '. ENTER de novo para salvar por cima.', '#ffcf7a'); return; } salvaNoSlot(it); UI.saves = null; return; }
  if (S.modo === 'carregar') { if (!lerSlot(it)) { aviso('Espaço ' + it + ' vazio.', '#ff9a9a'); return; } if (S.conf !== it) { S.conf = it; aviso('O jogo atual será trocado pelo do espaço ' + it + '. ENTER de novo para carregar.', '#ffcf7a'); return; } carregaSlot(it); return; }
  if (S.modo === 'caps') { const st = estadoPonto(it); if (st === 'fechado') { aviso('Você ainda não chegou aí.', '#ff9a9a'); return; }
    if (st === 'espera') { aviso('Esse ponto libera quando você passar por ele de novo.', '#ffcf7a'); return; }
    S.ponto = it; S.modo = 'guardar'; S.sel = 0; S.conf = null; som(SOM.ui_vez, .5); return; }
  if (S.modo === 'guardar') { if (it !== 'nao') { if (lerSlot(it) && S.conf !== it) { S.conf = it; aviso('Já tem um jogo no espaço ' + it + '. ENTER de novo para guardar por cima.', '#ffcf7a'); return; } salvaNoSlot(it); }
    else if (S.conf !== 'nao') { S.conf = 'nao'; aviso('O jogo atual NÃO vai ser guardado. ENTER de novo para continuar.', '#ffcf7a'); return; }
    const p = S.ponto; UI.saves = null; setTimeout(() => vaiParaPonto(p), 400); } }
function cliqueSaves(x, y) { const S = UI.saves; if (!S || !S.zonas) return false; for (const [a, b, c, d, i] of S.zonas) if (x >= a && x <= c && y >= b && y <= d) { if (S.sel === i) teclaSaves('enter'); else { S.sel = i; S.conf = null; } return true; } return false; }
function desenhaSaves() { const S = UI.saves; if (!S) return; S.zonas = [];
  ctx.save(); ctx.setTransform(window.HD_TELA || 1, 0, 0, window.HD_TELA || 1, 0, 0); ctx.fillStyle = 'rgba(2,6,16,.6)'; ctx.fillRect(0, 0, W, H);
  const x = 90, y = 40, w = W - 180, h = H - 80; painel(x, y, w, h);
  const tit = { salvar: 'SALVAR — escolha o espaço', carregar: 'CARREGAR — escolha o espaço', caps: 'CAPÍTULOS — voltar a um ponto da história', guardar: 'Guardar o jogo atual antes?' }[S.modo];
  texto(tit, x + 24, y + 34, 22, '#ffe27a');
  if (S.modo === 'guardar') texto('Você vai para: ' + S.ponto.nome + '. Escolha um espaço para guardar o jogo de agora (ou não guardar).', x + 24, y + 58, 13, '#c8d8f0');
  const L = listaSaves();
  if (S.modo === 'caps') {   // duas colunas: Cap. 1 e 2 a esquerda; Cap. 3 a direita (2026-11-22: com a trilha das cinzas o Cap. 3 nao cabia junto do 2)
    const col = p => p.cap <= 2 ? 0 : 1, lin = [0, 0], lh = 34;
    PONTOS.forEach((p, i) => { const c = col(p), cx = x + 24 + c * (w / 2), yy = y + 62 + lin[c] * lh; lin[c]++;
      const st = estadoPonto(p), on = S.sel === i, cw = w / 2 - 40;
      if (i === 0 || PONTOS[i - 1].cap !== p.cap) { }
      linhaSel(cx, yy - 17, cw, 34, on);
      const cor = st === 'fechado' ? '#5a6688' : st === 'espera' ? '#8a96b8' : on ? '#8fe9ff' : '#e8f6ff';
      texto((on ? '▶ ' : '') + 'Cap. ' + p.cap + ' · ' + (st === 'fechado' ? '???' : p.nome), cx + 6, yy, 14, cor);
      const tag = { foto: 'seu time daquela hora', monta: 'com o seu time de agora', espera: 'libera ao passar de novo', novo: 'jogo novo' }[st];
      if (tag) texto(tag, cx + 22, yy + 13, 11, st === 'foto' ? '#7dffa8' : st === 'monta' ? '#ffcf7a' : '#8a96b8');
      S.zonas.push([cx, yy - 17, cx + cw, yy + 17, i]); });
  } else {
    L.forEach((it, i) => { const yy = y + 78 + i * 84, on = S.sel === i; linhaSel(x + 24, yy - 6, w - 48, 74, on);
      S.zonas.push([x + 24, yy - 6, x + w - 24, yy + 68, i]);
      if (it === 'nao') { texto((on ? '▶ ' : '') + 'Não guardar (o jogo de agora se perde)', x + 44, yy + 38, 18, on ? '#ff9a9a' : '#c8d8f0'); return; }
      const s = lerSlot(it), ativo = localStorage.getItem('jux_slot_ativo') === String(it);
      texto((on ? '▶ ' : '') + 'Espaço ' + it + (ativo ? '  (o último usado)' : ''), x + 44, yy + 22, 19, on ? '#8fe9ff' : '#fff');
      if (s && s.meta) { const m = s.meta; texto(m.cap + ' · ' + m.lugar, x + 44, yy + 48, 15, '#e8f6ff'); texto('Jux Nv ' + m.nivel + (m.tempo ? ' · ' + m.tempo : ''), x + w - 44, yy + 22, 15, '#ffe27a', 'right'); texto('Salvo em ' + m.data, x + w - 44, yy + 48, 12, '#9fb3d9', 'right'); }
      else texto('(vazio)', x + 44, yy + 48, 15, '#5a6688'); });
  }
  texto('▲▼: escolher · ENTER: confirmar · ESC: voltar', x + w / 2, y + h - 14, 12, '#9fb3d9', 'center');
  ctx.restore(); }
