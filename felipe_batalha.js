/* ============ FELIPE NA BATALHA (aliado, arqueiro do vento; FICHA_CAP3_FELIPE_BATALHA.md) ============
   Carregado ANTES do script principal do index.html (só funções e constantes), DEPOIS do bino_batalha.js.
   Mesmo esquema do Bino: `hero` aponta para quem age ou apanha agora; no turno do Felipe, hero = FELIPE.
   Ele NÃO corre até o inimigo: atira de onde está (a flecha voa: efeito felipe_flecha, tools/cut_felipe.py). */
'use strict';
const FELIPE_D = window.JUX_FELIPE || null, ATLAS_FELIPE = new Image(); if (FELIPE_D) ATLAS_FELIPE.src = FELIPE_D.atlas;
const FELIPE = {quem: 'felipe', x: 870, y: 300, hp: 300, max: 300, mp: 50, mmax: 50, atb: .3, pots: 0, guard: false, escudo: 0, ang: .12, lunge: 0, ly: 0, rise: 0,
  charge: 0, flash: 0, dead: false, anim: 'parado', at: 0, back: false, hold: false, est: {}, critCerto: false};
const temFelipe = () => !!FELIPE_D && (TESTE ? !!G.labFelipe : !!(JOGO.felipe && JOGO.felipe.ativo));
const nvFelipe = () => (TESTE ? prog.nivel : Math.max(1, (JOGO.felipe && JOGO.felipe.nivel) | 0 || 1));
// atributos na luta: com a Soneca (ou um alvo Marcado na Flecha Certeira) o crítico fica garantido
function statsFelipe(semEquip) { const s = statusFelipe(nvFelipe(), semEquip); if (!semEquip && FELIPE.critCerto) s.crit = 100; return s; }

function iniciaFelipe() {
  const s = statusFelipe(nvFelipe());
  Object.assign(FELIPE, {hp: s.hp, max: s.hp, mp: s.mp, mmax: s.mp, atb: .3, est: {}, tickFeito: false, guard: false, escudo: 0, critCerto: false,
    lunge: 0, ly: 0, rise: 0, charge: 0, flash: 0, dead: false, anim: 'parado', at: 0, back: false, hold: false, pots: JUX.pots});
  if (!TESTE && typeof vidaAtual === 'function' && JOGO.vida && JOGO.vida.felipe) { const v = vidaAtual('felipe'); FELIPE.hp = Math.max(1, v.hp); FELIPE.mp = v.mp; }
}
function ganhaExpFelipe(x) {
  if (TESTE) return {exp: x, de: nvFelipe(), para: nvFelipe(), novas: []};
  const F = JOGO.felipe = JOGO.felipe || {ativo: true, nivel: prog.nivel, exp: 0};
  const r = {exp: x, de: F.nivel, novas: []};
  F.exp = (F.exp || 0) + x;
  while (F.nivel < 100 && F.exp >= expPara(F.nivel)) { F.exp -= expPara(F.nivel); F.nivel++; for (const h of HAB_FELIPE) if (h.nivel === F.nivel && h.feito) r.novas.push(h); }
  if (F.nivel >= 100) F.exp = 0;
  r.para = F.nivel; salvaJogo(); return r;
}

/* ---------- menu do Felipe ---------- */
const MAIN_FELIPE = ['Atacar', 'Habilidades', 'Itens', 'Defender', 'Fugir'];
function habFelipeLista() {
  const nv = nvFelipe(), lib = HAB_FELIPE.filter(h => h.feito && h.nivel <= nv && habLigada(h.id)), prox = HAB_FELIPE.find(h => h.feito && h.nivel > nv);
  const eco = (typeof vagaEco === 'function') ? vagaEco('felipe').equipadas.filter(h => HABS[h] && !HABS[h].passiva)
    .map(h => ({id: 'hab_' + h, hab: h, nome: '✦ ' + HABS[h].nome, mp: HABS[h].mp || 0, nivel: 1, feito: true, eco: true, alvo: HABS[h].alvo === 'inim' ? 'um' : HABS[h].alvo})) : [];
  return [...lib, ...eco, ...(prox ? [prox] : []), {id: 'voltar', nome: 'Voltar'}];
}
const felipeMainEnabled = i => (i === 2 ? itemList().length > 1 : i === 4 ? podeFugir() : true);
const felipeHabEnabled = i => { const h = habFelipeLista()[i]; return !!h && (h.id === 'voltar' || (h.nivel <= nvFelipe() && hero.mp >= h.mp)); };
function chooseFelipe(i) {
  if (menu.level === 'main') {
    if (!felipeMainEnabled(i)) { som('ui_erro', .6); return; }
    som('ui_ok', .6);
    if (i === 0) pedeAlvo('f_atq', 'main', 0);
    else if (i === 1) { menu.level = 'magic'; menu.idx = 0; menu.top = 0; }
    else if (i === 2) { menu.level = 'item'; menu.idx = 0; menu.top = 0; }
    else if (i === 4) fugir();
    else heroTurn('guard');
    return;
  }
  const h = habFelipeLista()[i];
  if (!h) return;
  if (h.id === 'voltar') { menu.level = 'main'; menu.idx = 1; menu.top = 0; som('ui_voltar', .6); return; }
  if (h.nivel > nvFelipe()) { som('ui_erro', .6); banner(h.nome + ' libera no nível ' + h.nivel); return; }
  if (!felipeHabEnabled(i)) { som('ui_erro', .6); return; }
  som('ui_ok', .6);
  if (h.alvo === 'um') pedeAlvo(h.id, 'magic', i); else heroTurn(h.id);
}
function autoEscolheFelipe() {
  const vivos = inimigos(), hp = hero.hp / hero.max, nv = nvFelipe(), lib = HAB_FELIPE.filter(h => h.feito && h.nivel <= nv && habLigada(h.id) && hero.mp >= h.mp);
  const tem = id => lib.some(h => h.id === id), custo = id => HAB_FELIPE.find(h => h.id === id).mp, reserva = hero.mmax * .15;
  const alvo = vivos.slice().sort((a, b) => ((b.quebrado > 0) - (a.quebrado > 0)) || ((b.est && b.est.marcado > 0) - (a.est && a.est.marcado > 0)) || (a.hp - b.hp))[0];
  if (hp < .4 && itemList().some(o => o.id === 'pocao')) return {kind: 'item_pocao'};
  if (tem('f_soneca') && !hero.critCerto && hero.mp < hero.mmax * .25) return {kind: 'f_soneca'};
  {const hl = habFelipeLista(), k = autoEcoGolpe(hl, i => felipeHabEnabled(i), alvo, vivos, reserva); if (k) return k;}
  const pode = id => tem(id) && hero.mp - custo(id) >= reserva, time = aliados().filter(a => a.hp > 0 && !a.dead);
  if (pode('f_brisa') && time.filter(a => a.hp < a.max * .6).length >= 2) return {kind: 'f_brisa'};
  if (pode('f_corrente') && !time.some(a => temEst(a, 'corrente')) && vivos.length > 1) return {kind: 'f_corrente'};
  if (vivos.length >= 3 && pode('f_chuva')) return {kind: 'f_chuva'};
  if (vivos.length >= 2 && pode('f_rajada')) return {kind: 'f_rajada'};
  if (pode('f_falcao') && !(alvo.est && alvo.est.marcado > 0) && alvo.hp > alvo.max * .4) return {kind: 'f_falcao', alvo};
  if (hero.critCerto && pode('f_perfurante')) return {kind: 'f_perfurante', alvo};
  if (!hero.critCerto && tem('f_certeira') && hero.mp - custo('f_certeira') >= reserva && alvo.est && alvo.est.marcado > 0) return {kind: 'f_certeira', alvo};
  if (pode('f_perfurante') && alvo.hp > alvo.max * .5) return {kind: 'f_perfurante', alvo};
  if (pode('f_dupla')) return {kind: 'f_dupla', alvo};
  if (!hero.critCerto && tem('f_certeira') && hero.mp - custo('f_certeira') >= reserva) return {kind: 'f_certeira', alvo};
  return {kind: 'f_atq', alvo};
}

/* ---------- golpes do Felipe (hero = FELIPE durante o turno) ---------- */
const fx_ = () => hero.x - hero.lunge, fy_ = () => hero.y + hero.ly;
const C_VENTO = '170,255,150', C_VENTO_CLARO = '225,255,215';
// sons de arco e flecha GRAVADOS (assets/sfx/novos/felipe_*, CC0; CREDITOS.txt): a corda esticando, a flecha saindo e o impacto
function somCorda() { som('felipe_corda', .8); }
function somFlecha(forte) { som('felipe_solta', forte ? 1 : .85); }
function somImpactoVento(forte) { som(forte ? 'felipe_impacto_forte' : 'felipe_impacto', .85); }
// toque de vento em todo acerto do Felipe (chamado por hitEnemy): penas, um estalo verde e um anel curto
function toqueFelipe(e) {
  const x = e.x + 20, y = e.y - 80;
  fxBrilho(x, y, {raio: 110, ms: 240, cor: C_VENTO, a: .45});
  spark(x, y, 6, '#c8ffb8', 480, .6, 3); spark(x, y, 3, '#f4f1e8', 300, .9, 4);
  fxAnel(x, y + 20, {raio: 90, achata: .45, ms: 340, esp: 7, cor: C_VENTO, a: .7});
}
// a flecha: sai do arco (à esquerda dele, na altura do peito) e voa até o inimigo; os 3 primeiros quadros são o voo, depois o impacto
async function atira(e, o) {
  o = o || {}; const x0 = fx_() - 70, y0 = fy_() - 92, x1 = e.x + 40, y1 = e.y - 95, ms = o.ms || 620;
  somFlecha(o.forte); fxiPlay('felipe_flecha', x0, y0, ms, {x1, y1, fim: .38, flip: true, escala: o.escala || 1.1, brilho: !!o.forte});
  if (o.forte) for (let k = 0; k < 3; k++) setTimeout(() => fxAnel(x0 - 40 - k * 60, y0, {raio: 60, achata: 1, ms: 300, esp: 5, cor: C_VENTO_CLARO, a: .6}), k * 60);
  await wait(ms * .38);
}
// quadro escolhido de uma folha do Felipe: as folhas dele tocam a 10 qps, entao o quadro i fica no tempo i/fps (o setFrame do Bino usa folhas de 1 qps)
const fpsF = n => ((FELIPE_D && FELIPE_D.anims[n]) || {}).fps || 1;
function fq(n, i) { setFrame(n, (i + .01) / fpsF(n)); }
async function quadrosF(nome, lista) { for (const [i, ms, fn] of lista) { fq(nome, i); if (fn) fn(); await wait(ms); } }
function usaCritico() { if (hero.critCerto) { hero.critCerto = false; if (hero.est) delete hero.est.soneca; } }

const ACOES_FELIPE = {
  // ataque normal (de graça): pega a flecha, mira, solta no quadro 5 (400 ms a 10 qps); devolve um pouco de MP
  async f_atq() {
    setAnim('ataque'); setTimeout(somCorda, 180); await wait(400);
    const e = enemy; await atira(e);
    hitEnemy(dmg(34, .15), false); usaCritico(); somImpactoVento(); hero.mp = Math.min(hero.mmax, hero.mp + 2);
    await wait(420); setAnim('parado');
  },
  // Flecha Certeira: tiro de vento mais forte; crítico garantido se o alvo estiver Marcado
  async f_certeira() {
    setAnim('ataque'); const e = enemy; fxBrilho(fx_() - 40, fy_() - 95, {raio: 70, ms: 400, cor: C_VENTO, a: .5}); setTimeout(somCorda, 180); await wait(400);
    if (temEst(e, 'marcado')) hero.critCerto = true;
    await atira(e, {forte: true, escala: 1.35, ms: 560});
    shake = Math.max(shake, 5); hitEnemy(dmg(48, .1), false); usaCritico(); somImpactoVento(true);
    await wait(420); setAnim('parado');
  },
  // Soneca: senta, dorme (bolha no nariz), acorda num pulo com o olhar afiado: +25% MP, +10% vida e crítico garantido no próximo ataque
  async f_soneca() {
    const x = fx_(), y = fy_(); setAnim('soneca'); setTimeout(() => som('felipe_bocejo', .9), 150);
    setTimeout(() => fxiPlay('felipe_soneca', x - 20, y - 170, 1500, {escala: 1}), 350);
    await wait(1450);
    const st = statsFelipe(true), cura = Math.round(hero.max * .10), mp = Math.round(hero.mmax * .25);
    hero.hp = Math.min(hero.max, hero.hp + cura); hero.mp = Math.min(hero.mmax, hero.mp + mp);
    hero.critCerto = true; poeEstado(hero, 'soneca', 99); som('felipe_acorda', .8);
    pop(x, y - 215, '+' + cura + ' HP  +' + mp + ' MP', '#7dffa8'); setTimeout(() => pop(x, y - 245, 'CRÍTICO PRONTO', '#d8ffb0'), 250);
    fxAnel(x, y - 100, {raio: 120, achata: .6, ms: 500, esp: 10, cor: C_VENTO, a: .8}); void st;
    await wait(350); setAnim('parado');
  },
  // ---------- C2b (nv 10 a 62) ----------
  // Flecha Dupla: duas flechas seguidas; a 2a vai em outro inimigo se houver (usa a folha de ataque duas vezes)
  async f_dupla() {
    const e1 = enemy; setAnim('ataque'); setTimeout(somCorda, 180); await wait(400);
    await atira(e1, {ms: 520}); enemy = e1; hitEnemy(dmg(30, .12), false); usaCritico(); somImpactoVento();
    const vivos = inimigos().filter(x => x.hp > 0), outros = vivos.filter(x => x !== e1), e2 = outros.length ? outros[Math.floor(Math.random() * outros.length)] : vivos[0];
    await quadrosF('ataque', [[2, 90, somCorda], [3, 150]]);
    if (e2) { fq('ataque', 4); await atira(e2, {ms: 480}); enemy = e2; hitEnemy(dmg(30, .12), false); somImpactoVento(); }
    enemy = e1.hp > 0 ? e1 : (inimigos()[0] || e1);
    await quadrosF('ataque', [[5, 160], [6, 160], [7, 160]]); setAnim('parado');
  },
  // Olho de Falcao: a mao em pala, o olho brilha, aponta, a marca do falcao aparece no inimigo; uma flecha leve e o alvo fica Marcado
  async f_falcao() {
    const e = enemy, x = fx_(), y = fy_();
    await quadrosF('falcao', [[0, 100], [1, 260], [2, 260, () => fxBrilho(x - 30, y - 150, {raio: 60, ms: 400, cor: C_VENTO, a: .8})],
      [3, 320, () => { fxiPlay('felipe_falcao', e.x + 10, e.y - 110, 1500, {escala: 1.25}); som('felipe_falcao', .9); }], [4, 200, somCorda], [5, 240]]);
    fq('falcao', 6); await atira(e, {ms: 500}); hitEnemy(dmg(24, .1), false); usaCritico(); somImpactoVento();
    if (e.hp > 0 && poeEstado(e, 'marcado', 3, undefined, e.tipo)) pop(e.x, e.y - 235, 'MARCADO', ESTADOS.marcado.cor);
    await quadrosF('falcao', [[6, 200], [7, 260]]); setAnim('parado');
  },
  // Rajada: gira o arco acima da cabeca e empurra o vento em todos; a barra de turno deles volta
  async f_rajada() {
    const c = centroInimigos(), x = fx_(), y = fy_();
    await quadrosF('rajada', [[0, 90], [1, 140, () => som('bino_whoosh', .6)], [2, 140], [3, 180, () => fxAnel(x, y - 90, {raio: 140, achata: .5, ms: 400, esp: 9, cor: C_VENTO, a: .7})]]);
    fq('rajada', 4); som('felipe_rajada', 1); shake = Math.max(shake, 8);
    fxiPlay('felipe_rajada', c.x + 70, c.y - 90, 1200, {escala: 2.5});
    await wait(420); acertaTodos(36);
    for (const e of inimigos()) if (e.hp > 0) { e.atb = Math.max(0, e.atb - .45); pop(e.x, e.y - 235, 'ATRASADO', '#d8ffb0'); }
    await quadrosF('rajada', [[5, 220], [6, 200], [7, 220]]); setAnim('parado');
  },
  // Flecha de Ninar: tiro com notas e estrelinhas; uma nuvem de sono: Sono por 2 turnos (acorda se apanhar)
  async f_ninar() {
    const e = enemy; setAnim('ataque'); setTimeout(somCorda, 180); await wait(400);
    const x0 = fx_() - 70, y0 = fy_() - 92, ms = 1600; somFlecha(); setTimeout(() => som('felipe_ninar', .9), 380);
    fxiPlay('felipe_ninar', x0, y0, ms, {x1: e.x + 30, y1: e.y - 100, fim: .3, flip: true, escala: 1.3});
    await wait(ms * .3); hitEnemy(dmg(18, .1), true, true); usaCritico();
    if (e.hp > 0) { if (poeEstado(e, 'sono', 2, undefined, e.tipo)) pop(e.x, e.y - 235, 'SONO', ESTADOS.sono.cor); else pop(e.x, e.y - 235, 'IMUNE AO SONO', '#a9a9c8'); }
    await wait(500); setAnim('parado'); await wait(300);
  },
  // Corrente de Ar: finca o arco, chama o vento e manda para os amigos: VEL +30% no time por 3 turnos
  async f_corrente() {
    await quadrosF('corrente', [[0, 90], [1, 200, () => som('felipe_impacto', .5)], [2, 200], [3, 220, () => som('felipe_vento_time', .9)], [4, 220], [5, 240]]);
    fq('corrente', 6);
    for (const a of aliados()) if (a.hp > 0 && !a.dead) { fxiPlay('felipe_corrente', a.x - 10, a.y - 95, 1300, {escala: 1.35, flip: true}); poeEstado(a, 'corrente', 3); }
    await wait(700); for (const a of aliados()) if (a.hp > 0 && !a.dead) pop(a.x, a.y - 215, 'VEL +30%', '#b8ffc8');
    await quadrosF('corrente', [[6, 120], [7, 240]]); setAnim('parado');
  },
  // Chuva de Flechas: duas levas de 3 flechas para o ceu; a chuva cai em todos os inimigos em 3 ondas
  async f_chuva() {
    const c = centroInimigos(), x = fx_(), y = fy_();
    // as 3 flechas saem da ponta do arco (apontado para cima e para a frente, a esquerda) e somem no ceu
    const sobe = () => { somFlecha(true); for (let k = 0; k < 3; k++) { const x1 = x - 230 - k * 55, y1 = y - 720 + k * 30;
      fxCorte(x - 100, y - 190, x1, y1, {ms: 420, esp: 5, cor: C_VENTO_CLARO, risca: .3}); } };
    await quadrosF('chuva', [[0, 90], [1, 160], [2, 160, somCorda], [3, 220], [4, 220, sobe], [5, 160], [6, 220, sobe], [7, 300]]);
    setAnim('parado'); som('felipe_chuva', 1); fxiPlay('felipe_chuva', c.x + 20, c.y - 150, 1700, {escala: 2.9, brilho: true});
    await wait(640); for (let k = 0; k < 3; k++) { acertaTodos(20); shake = Math.max(shake, 6); await wait(260); }
    await wait(500);
  },
  // Flecha Perfurante: firma os pes, puxa ao maximo e solta uma broca de vento: ignora metade da defesa e enche muito a Quebra
  async f_perfurante() {
    const e = enemy, x0 = fx_() - 80, y0 = fy_() - 95;
    await quadrosF('perfurante', [[0, 90], [1, 180], [2, 200, () => fxBrilho(x0 + 20, y0, {raio: 50, ms: 300, cor: C_VENTO, a: .8})], [3, 260, somCorda],
      [4, 360, () => { for (let k = 0; k < 3; k++) setTimeout(() => fxAnel(x0 - 10, y0, {raio: 50 + k * 12, achata: 1, ms: 260, esp: 4, cor: C_VENTO, a: .8}), k * 100); }]]);
    fq('perfurante', 5); som('felipe_perfura', 1); somFlecha(true); hero.lunge = -14; tween(hero, 'lunge', 0, 400, easeOut);
    const ms = 900; fxiPlay('felipe_perfurante', x0, y0, ms, {x1: e.x + 30, y1: e.y - 95, fim: .35, flip: true, escala: 1.6});
    await wait(ms * .35); shake = Math.max(shake, 14); hitEnemy(dmg(70, .1), false); usaCritico(); somImpactoVento(true); e.kx = -60; tween(e, 'kx', 0, 480, easeOut);
    await quadrosF('perfurante', [[6, 260], [7, 240]]); setAnim('parado');
  },
  // Brisa Leve: junta as maos, nasce uma bolinha de vento e ele sopra para o time: cura 18% e tira Lento, Cego e Sono
  async f_brisa() {
    const x = fx_(), y = fy_();
    await quadrosF('brisa', [[0, 90], [1, 200], [2, 260], [3, 300, () => { fxBrilho(x - 10, y - 95, {raio: 60, ms: 500, cor: C_VENTO, a: .8}); som('felipe_brisa', .9); }], [4, 260]]);
    fq('brisa', 5);
    for (const a of aliados()) if (a.hp > 0 && !a.dead) fxiPlay('felipe_brisa', a.x - 10, a.y - 100, 1500, {escala: 1.3});
    await wait(650);
    for (const a of aliados()) if (a.hp > 0 && !a.dead) { const n = Math.min(Math.round(a.max * .18), a.max - a.hp); a.hp += n; limpaRuins(a, ['lento', 'cego', 'sono']); pop(a.x, a.y - 200, '+' + n, '#7dffa8'); }
    await quadrosF('brisa', [[5, 200], [6, 240], [7, 300]]); setAnim('parado');
  },
};
// cada habilidade gasta o MP dela e mostra o nome na faixa de cima (o ataque normal e de graca)
for (const h of HAB_FELIPE) {
  const f = ACOES_FELIPE[h.id];
  if (f) ACOES_FELIPE[h.id] = async function () { hero.mp = Math.max(0, hero.mp - h.mp); banner(h.nome); return f(); };
}
