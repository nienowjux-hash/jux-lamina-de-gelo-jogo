/* ============ BINO NA BATALHA (aliado do Jux) ============
   Carregado ANTES do script principal do index.html: aqui so tem funcoes e constantes (nada roda na carga); tudo usa
   as variaveis do index.html (hero, JUX, BINO, enemy, ENEMIES, G, menu, hitEnemy...) so na hora de chamar.
   COMO FUNCIONA: `hero` e uma referencia (let) para quem esta agindo ou apanhando: o Jux (JUX) ou o Bino (BINO).
   Assim todo o codigo antigo (golpes dos inimigos, hitHero, estados...) funciona com os dois sem ser reescrito.
   No turno do Bino, hero=BINO; quando o inimigo escolhe quem apanha, hero=alvo; no fim do turno, hero=JUX. */
'use strict';
const temBino = () => (TESTE ? !!G.labBino : !!(JOGO.bino && JOGO.bino.ativo));
const nvBino = () => (TESTE ? prog.nivel : Math.max(1, (JOGO.bino && JOGO.bino.nivel) | 0 || 1));
const aliados = () => (temBino() ? [JUX, BINO] : [JUX]);
const statsDe = a => (a && a.quem === 'bino' ? statusBino(nvBino()) : stats(prog.nivel));
const baseDe = a => (a && a.quem === 'bino' ? statusBino(nvBino(), true) : statusBase(prog.nivel));
const nvAtor = () => (hero.quem === 'bino' ? nvBino() : prog.nivel);
const bAn = () => (hero.quem === 'bino' ? BINO_D : BAT);   // folha de animacoes de quem esta em cena
const nomeAliado = a => (a.quem === 'bino' ? 'Bino' : 'Jux');

function iniciaBino() {
  const sb = statusBino(nvBino());
  Object.assign(BINO, {x: 655, y: 490, hp: sb.hp, max: sb.hp, mp: sb.mp, mmax: sb.mp, atb: .15, est: {}, tickFeito: false, guard: false, escudo: 0, muralha: 0,
    lunge: 0, ly: 0, rise: 0, charge: 0, flash: 0, dead: false, anim: 'parado', at: 0, back: false, hold: false, pots: JUX.pots});
  if (!TESTE && typeof vidaAtual === 'function' && JOGO.vida && JOGO.vida.bino) { const v = vidaAtual('bino'); BINO.hp = Math.max(1, v.hp); BINO.mp = v.mp; }   // vida da ultima luta
}
// quem o inimigo ataca: provocar ou muralha ativos = sempre o Bino; senao sorteia entre os vivos
function escolheAlvoAliado() {
  const v = aliados().filter(a => a.hp > 0);
  if (v.length < 2) return v[0] || JUX;
  if (temEst(BINO, 'provocar')) return BINO;
  return Math.random() < .5 ? BINO : JUX;
}
// o alvo atual (hero) chegou a 0 de vida? so e derrota se TODOS cairam
function aliadoCaiu() {
  if (hero.hp > 0) return false;
  if (!hero.dead) {
    hero.dead = true; hero.guard = false;
    if (bAn().anims.derrota) { hero.anim = (hero.quem === 'bino' && temEst(hero, 'furia') && bAn().anims.derrota_furia) ? 'derrota_furia' : 'derrota'; hero.at = 0; hero.hold = false; hero.back = false; }
    pop(hero.x, hero.y - 190, nomeAliado(hero) + ' caiu!', '#ff9a9a');
  }
  return !aliados().some(a => a.hp > 0);
}
// revide do Bino (Armadura de Pedra: golpes fisicos; Furia Barbara: todos)
function contraBino() {
  const h0 = hero, e = enemy, g = G.golpeInim || {t: 'f'};
  if (h0.quem !== 'bino' || h0.hp <= 0 || !e || e.hp <= 0) return;
  if (!(temEst(h0, 'furia') || (temEst(h0, 'pedra') && g.t === 'f'))) return;
  setTimeout(() => {
    if (e.hp <= 0 || h0.hp <= 0) return;
    const h1 = hero, e1 = enemy, a1 = G.acao; hero = h0; enemy = e; G.acao = 'b_contra';
    fxiPlay('bino_golpe_marreta', e.x + 20, e.y - 70, 600, {escala: 1.1}); hitEnemy(dmg(30, .15), false);
    pop(h0.x, h0.y - 240, 'REVIDE!', '#ffb27a');
    hero = h1; enemy = e1; G.acao = a1;
  }, 450);
}
function ganhaExpBino(x) {
  if (TESTE) return {exp: x, de: nvBino(), para: nvBino(), novas: []};
  const B = JOGO.bino = JOGO.bino || {ativo: true, nivel: prog.nivel, exp: 0};
  const r = {exp: x, de: B.nivel, novas: []};
  B.exp += x;
  while (B.nivel < 100 && B.exp >= expPara(B.nivel)) { B.exp -= expPara(B.nivel); B.nivel++; for (const h of HAB_BINO) if (h.nivel === B.nivel) r.novas.push(h); }
  if (B.nivel >= 100) B.exp = 0;
  r.para = B.nivel; salvaJogo(); return r;
}

/* ---------- menu do Bino ---------- */
const MAIN_BINO = ['Atacar', 'Habilidades', 'Itens', 'Defender', 'Fugir'];
const mainLista = () => (hero.quem === 'bino' ? MAIN_BINO : MAIN);
function habBinoLista() {
  const lib = HAB_BINO.filter(h => h.nivel <= nvBino() && habLigada(h.id)), prox = HAB_BINO.find(h => h.nivel > nvBino());
  return [...lib, ...(prox ? [prox] : []), {id: 'voltar', nome: 'Voltar'}];
}
const binoMainEnabled = i => (i === 2 ? itemList().length > 1 : i === 4 ? podeFugir() : true);
const binoHabEnabled = i => { const h = habBinoLista()[i]; return !!h && (h.id === 'voltar' || (h.nivel <= nvBino() && hero.mp >= h.mp)); };
function chooseBino(i) {
  if (menu.level === 'main') {
    if (!binoMainEnabled(i)) { som('ui_erro', .6); return; }
    som('ui_ok', .6);
    if (i === 0) pedeAlvo('b_atq', 'main', 0);
    else if (i === 1) { menu.level = 'magic'; menu.idx = 0; menu.top = 0; }
    else if (i === 2) { menu.level = 'item'; menu.idx = 0; menu.top = 0; }
    else if (i === 4) fugir();
    else heroTurn('guard');
    return;
  }
  const h = habBinoLista()[i];
  if (!h) return;
  if (h.id === 'voltar') { menu.level = 'main'; menu.idx = 1; menu.top = 0; som('ui_voltar', .6); return; }
  if (h.nivel > nvBino()) { som('ui_erro', .6); banner(h.nome + ' libera no nível ' + h.nivel); return; }
  if (!binoHabEnabled(i)) { som('ui_erro', .6); return; }
  som('ui_ok', .6);
  if (h.alvo === 'um') pedeAlvo(h.id, 'magic', i); else heroTurn(h.id);
}
function autoEscolheBino() {
  const vivos = inimigos(), hp = hero.hp / hero.max, lib = HAB_BINO.filter(h => h.nivel <= nvBino() && habLigada(h.id) && hero.mp >= h.mp);
  const tem = id => lib.some(h => h.id === id), custo = id => HAB_BINO.find(h => h.id === id).mp, reserva = hero.mmax * .15;
  const alvo = vivos.slice().sort((a, b) => ((b.quebrado > 0) - (a.quebrado > 0)) || (a.hp - b.hp))[0];
  if (hp < .35 && tem('b_sangue')) return {kind: 'b_sangue'};
  if (hp < .4 && itemList().some(o => o.id === 'pocao')) return {kind: 'item_pocao'};
  if (!(hero.muralha > 0) && !temEst(hero, 'provocar') && vivos.length > 1 && tem('b_provocar') && Math.random() < .35) return {kind: 'b_provocar'};
  if (vivos.length > 1) for (const id of ['b_queda', 'b_giratoria', 'b_onda']) if (tem(id) && hero.mp - custo(id) >= reserva) return {kind: id};
  for (const id of ['b_esmaga', 'b_ariete', 'b_quebra', 'b_marreta']) if (tem(id) && hero.mp - custo(id) >= reserva) return {kind: id, alvo};
  return {kind: 'b_atq', alvo};
}

/* ---------- golpes do Bino (hero = BINO durante o turno) ----------
   Cada golpe tem o proprio som (assets/sfx/novos/bino_*, tools/cria_sons_bino.py) e o proprio efeito de terra/pedra por codigo,
   por cima da folha desenhada (fx_bino_sprites.js): poeira, torroes, rachaduras com brasa, aneis no chao; ouro na cura e no grito, vermelho na furia. */
const bx = () => hero.x - hero.lunge, by = () => hero.y + hero.ly;
// em FURIA os efeitos ficam vermelhos (brasa, poeira avermelhada, aneis e brilho vermelhos) para combinar com ele
const emFuria = () => hero.quem === 'bino' && temEst(hero, 'furia');
const fxB = (nome, x, y, ms, o) => {
  o = Object.assign({}, o || {});
  if (emFuria()) { o.furia = true; fxBrilho(x, y, {raio: 150 * (o.escala || 1), ms: Math.min(900, ms), cor: '255,70,40', a: .55}); }
  return fxiPlay('bino_' + nome, x, y, ms, o);
};
const C_POEIRA = '214,190,150', C_BRASA = '255,150,70', C_OURO = '255,214,130', C_VERM = '255,80,60', C_PEDRA = '170,160,150';
const terra = (x, y, n) => {
  if (emFuria()) { spark(x, y, n, '#d9604a', 380, .9, 5); spark(x, y, Math.round(n * .6), '#5a2a20', 520, 1, 6); spark(x, y, Math.round(n * .5), '#ff8a4a', 460, 1.1, 4); return; }
  spark(x, y, n, '#c2ab84', 380, .9, 5); spark(x, y, Math.round(n * .6), '#6e5f50', 520, 1, 6); };   // poeira e torroes
const anelChao = (x, y, raio, ms, cor, esp) => fxAnel(x, y, {raio, achata: .2, ms: ms || 600, esp: esp || 16, cor: emFuria() ? (cor === C_OURO || cor === C_PEDRA ? C_VERM : (cor === C_POEIRA || !cor ? '230,90,60' : cor)) : (cor || C_POEIRA), a: .9});
// toque leve de pedra em todo golpe do Bino: lascas voando, um clarao quente de impacto e um anel curto de poeira (para as pancadas nao ficarem secas)
function toqueBino(e) {
  const x = e.x + 20, y = e.y - 70, f = emFuria();
  fxBrilho(x, y, {raio: 120, ms: 260, cor: f ? '255,90,60' : '255,215,150', a: .5});
  spark(x, y, 7, f ? '#ff8a4a' : '#d8c8a8', 520, .7, 4); spark(x, y + 20, 5, f ? '#7a2a20' : '#6e5f50', 420, .8, 5);
  fxAnel(x, e.y + 6, {raio: 110, achata: .2, ms: 380, esp: 8, cor: f ? '230,90,60' : C_POEIRA, a: .7});
}
function rachaduras(x, y, n, larg) {   // rachaduras no chao saindo do ponto, com brasa dentro
  for (let k = 0; k < n; k++) {
    const t = n > 1 ? k / (n - 1) : .5, dx = (t - .5) * 2 * larg * (.8 + Math.random() * .3), dy = 6 + Math.abs(t - .5) * larg * .22 + rnd(0, 8);
    fxCorte(x, y + 4, x + dx, y + dy, {ms: 950, esp: 6 + rnd(0, 3), cor: C_BRASA, risca: .16});
  }
}
// mostra os quadros de uma folha de pose (fps 1: o quadro e escolhido): lista de [quadro, ms, fn opcional]
async function quadros(nome, lista) { for (const [i, ms, fn] of lista) { setFrame(nome, i); if (fn) fn(); await wait(ms); } }
function acertaTodos(poder, est) {
  const al = enemy, v = inimigos();
  v.forEach((e, i) => {
    enemy = e; hitEnemy(dmg(poder, .12), true, i > 0);
    if (est && e.hp > 0) { const [nm, tu, ch] = est; if (poeEstado(e, nm, tu, ch, e.tipo)) pop(e.x, e.y - 235, ESTADOS[nm].nome.toUpperCase(), ESTADOS[nm].cor); }
  });
  enemy = v.includes(al) ? al : (inimigos()[0] || al);
}
const centroInimigos = () => { const v = inimigos(); return {x: v.reduce((s, e) => s + e.x, 0) / v.length, y: v.reduce((s, e) => s + e.y, 0) / v.length}; };
function atordoa(e, ch) { if (e.hp > 0 && poeEstado(e, 'atordoado', 1, ch, e.tipo)) pop(e.x, e.y - 235, 'ATORDOADO', '#ffe27a'); }
// cinematica de uma habilidade especial (cenas sem inimigo: so o Bino e o cenario); some sozinha se a pagina nao tiver as cenas
async function cineBino(id) { if (typeof CINES === 'undefined' || !CINES[id] || !CIN.cenas[id + '_1']) return; cineMusica(true, 'bino'); await cinematica(id); cineMusica(false); }
// o som do impacto da marreta depende do golpe (chamado por hitSfx do index.html)
function somGolpeBino() {
  const forte = ['b_esmaga', 'b_queda', 'b_ariete', 'b_onda'].includes(G.acao);
  som(forte ? 'bino_golpe_forte' : G.acao === 'b_quebra' ? 'bino_quebra' : 'bino_golpe', forte ? 1 : .9);
}

const ACOES_BINO = {
  // ataque normal (de graca): guarda, sobe a marreta, desce; o impacto e o quadro 6 (500 ms a 10 qps)
  async b_atq() {
    await runTo(alc(), 460); setAnim(temEst(hero, 'furia') ? 'ataque_furia' : 'ataque'); som('bino_whoosh', .8); await wait(500);
    const e = enemy; terra(e.x + 30, e.y - 6, 9); anelChao(e.x + 10, e.y + 6, 150, 420); hitEnemy(dmg(40, .2), false); hero.mp = Math.min(hero.mmax, hero.mp + 3);   // o ataque normal devolve um pouco de folego
    await wait(330); await backHome();
  },
  async b_marreta() {
    await runTo(alc(), 440); setAnim(temEst(hero, 'furia') ? 'ataque_furia' : 'ataque'); som('bino_whoosh', .9); await wait(500);
    const e = enemy; fxB('golpe_marreta', e.x + 25, e.y - 75, 700, {escala: 1.5, flip: true}); terra(e.x + 30, e.y - 6, 18); anelChao(e.x + 10, e.y + 6, 260, 560); rachaduras(e.x, e.y, 5, 170); shake = Math.max(shake, 9);
    hitEnemy(dmg(52, .15), false); som('pedras', .5); await wait(360); await backHome();
  },
  async b_provocar() {
    const x = bx(), y = by();
    await quadros('provocar', [[0, 120], [1, 120], [2, 160], [3, 140, () => som('bino_peito', 1)], [4, 220, () => {
      fxB('provocar', x - 60, y - 120, 850, {escala: 1.9, flip: true, x1: x - 260, fim: .8}); som('bino_rugido', 1); shake = Math.max(shake, 10);
      for (let k = 0; k < 3; k++) setTimeout(() => fxAnel(x - 40 - k * 30, y - 90, {raio: 230, achata: .75, ms: 520, esp: 14, cor: C_POEIRA, a: .7}), k * 150);
      terra(x - 20, y - 4, 10); }], [5, 260], [6, 160], [7, 140]]);
    poeEstado(hero, 'provocar', 3); pop(x, y - 215, 'PROVOCAR', '#ffb27a'); setAnim('parado'); await wait(200);
  },
  async b_quebra() {
    await runTo(alc(), 420); const e = enemy;
    await quadros('quebra', [[0, 90], [1, 110], [2, 130, () => som('bino_whoosh', .8)], [3, 150], [4, 110]]);
    setFrame('quebra', 5); fxB('quebra_cranio', e.x + 5, e.y - 60, 800, {escala: 1.8}); rachaduras(e.x, e.y, 8, 250); anelChao(e.x + 10, e.y + 6, 300, 600); terra(e.x + 20, e.y - 6, 26); shake = Math.max(shake, 14);
    hitEnemy(dmg(64, .15), false); atordoa(e, .4); som('bino_pedras', .6);
    await quadros('quebra', [[5, 180], [6, 170], [7, 150]]); await backHome();
  },
  async b_muralha() {
    const x = bx(), y = by(); setAnim('guarda'); som('bino_muralha', 1);
    fxB('muralha', x - 70, y - 85, 1000, {escala: 1.9, flip: true}); fxPilar(x - 70, y + 8, {larg: 110, ms: 800, cor: C_PEDRA}); anelChao(x - 30, y + 6, 240, 600, C_PEDRA); terra(x - 50, y - 4, 16); shake = Math.max(shake, 8); await wait(700);
    hero.muralha = 2; poeEstado(hero, 'muro', 99); pop(x, y - 215, 'MURALHA: 2 bloqueios', '#d8d0c4'); await wait(250);
  },
  async b_grito() {
    const x = bx(), y = by();
    await quadros('grito', [[0, 100], [1, 120], [2, 140], [3, 220, () => {
      fxB('grito_guerra', x - 10, y - 130, 1100, {escala: 2.2}); som('bino_rugido2', 1); shake = Math.max(shake, 8);
      for (let k = 0; k < 3; k++) setTimeout(() => fxAnel(x - 10, y - 100, {raio: 330, achata: .5, ms: 650, esp: 16, cor: C_OURO, a: .8}), k * 170);
      fxFaiscas(x, y - 100, 26, {cor: C_OURO, ang: -1.57, abre: 1.2, vel: 520, g: 200}); fxLinhas(x, y - 100, 700, {cor: C_OURO, a: .35}); }], [4, 260], [5, 160], [6, 160], [7, 140]]);
    for (const a of aliados()) if (a.hp > 0) { poeEstado(a, 'grito', 3); pop(a.x, a.y - 215, 'ATQ e DEF +25%', '#ffd27a'); }
    setAnim('parado'); await wait(200);
  },
  async b_onda() {
    const x = bx(), y = by(), c = centroInimigos();
    await quadros('onda', [[0, 100], [1, 110], [2, 130, () => som('bino_whoosh', .8)], [3, 150], [4, 120]]);
    setFrame('onda', 5); som('bino_golpe_forte', 1); som('bino_rumble', .8); shake = Math.max(shake, 18); anelChao(x - 60, y + 6, 280, 600); terra(x - 60, y - 4, 20);
    fxB('onda_choque', x - 70, y - 70, 900, {escala: 2.3, flip: true, x1: c.x + 40, y1: c.y - 60, fim: .7});
    for (const e of inimigos()) { const dt = Math.max(0, (x - e.x) / 1.1); setTimeout(() => { rachaduras(e.x, e.y, 4, 160); anelChao(e.x, e.y + 6, 200, 500); terra(e.x, e.y - 4, 14); }, dt * .5); }
    await wait(430); acertaTodos(48, ['lento', 2, .4]);
    await quadros('onda', [[6, 200], [7, 160]]); setAnim('parado'); await wait(150);
  },
  async b_armadura() {
    const x = bx(), y = by();
    await quadros('armadura', [[0, 100], [1, 130], [2, 150, () => som('bino_pedra_forma', 1)], [3, 200, () => {
      fxB('armadura_pedra', x, y - 100, 1300, {escala: 2.1}); fxBrilho(x, y - 90, {raio: 150, cor: C_PEDRA, ms: 700}); anelChao(x, y + 6, 200, 600, C_PEDRA); terra(x, y - 4, 18);
      spark(x, y - 100, 24, '#9a8f86', 260, 1, 5); }], [4, 200], [5, 220], [6, 140], [7, 140]]);
    poeEstado(hero, 'pedra', 4); pop(x, y - 215, 'ARMADURA DE PEDRA', '#d8d0c8'); setAnim('parado'); await wait(150);
  },
  async b_giratoria() {
    await runTo(alc(), 420); const x = bx(), y = by();
    const volta = () => { anelChao(x - 40, y + 6, 330, 600); terra(x - 40, y - 6, 16); acertaTodos(42); shake = Math.max(shake, 9); };
    await quadros('giratoria', [[0, 90], [1, 110, () => som('bino_whoosh', .9)], [2, 110, () => fxB('marreta_giratoria', x - 70, y - 85, 1100, {escala: 2.4, flip: true})], [3, 120, volta], [4, 110, () => som('bino_whoosh', .9)], [5, 120, volta], [6, 150], [7, 140]]);
    await backHome();
  },
  async b_ariete() {
    const e = enemy;
    await quadros('ariete', [[0, 80], [1, 100]]);
    setFrame('ariete', 3); som('bino_investida', 1); terra(bx() + 10, by() - 4, 14); await vaiAte(alc(30), 240, easeIn);
    setFrame('ariete', 5); fxB('investida_ariete', e.x + 25, e.y - 75, 800, {escala: 2, flip: true}); terra(e.x + 30, e.y - 6, 26); rachaduras(e.x, e.y, 5, 200); anelChao(e.x + 10, e.y + 6, 280, 560); shake = Math.max(shake, 16);
    hitEnemy(dmg(88, .15), false); e.kx = -80; tween(e, 'kx', 0, 520, easeOut); atordoa(e, .3);
    await quadros('ariete', [[5, 200], [6, 170], [7, 150]]); await backHome();
  },
  async b_sangue() {
    const x = bx(), y = by();
    await quadros('sangue', [[0, 120], [1, 140], [2, 180, () => { fxB('sangue_pedra', x, y - 95, 1300, {escala: 2}); som('bino_cura', .9); fxBrilho(x, y - 80, {raio: 170, cor: C_OURO, ms: 900}); }], [3, 200], [4, 160, () => fxFaiscas(x, y - 30, 22, {cor: C_OURO, ang: -1.57, abre: .8, vel: 240, g: -40, vida: 1.5})], [5, 240]]);
    const n = Math.min(Math.round(hero.max * .35), hero.max - hero.hp); hero.hp += n; limpaRuins(hero);
    pop(x, y - 190, '+' + n, '#7dffa8'); anelChao(x, y + 6, 220, 700, C_OURO, 10);
    await quadros('sangue', [[6, 160], [7, 140]]); setAnim('parado'); await wait(150);
  },
  async b_furia() {
    await cineBino('bfuria'); const x = bx(), y = by();
    await quadros('furia', [[0, 130], [1, 150], [2, 180], [3, 260, () => {
      fxB('furia_barbara', x, y - 110, 1500, {escala: 2.4}); som('bino_rugido_longo', 1); som('bino_urso2', .8); shake = Math.max(shake, 14); fxFlash('255,60,40', .22, 500);
      for (let k = 0; k < 3; k++) setTimeout(() => fxAnel(x, y - 80, {raio: 340, achata: .5, ms: 700, esp: 18, cor: C_VERM, a: .85}), k * 190);
      fxFaiscas(x, y - 60, 40, {cor: C_VERM, ang: -1.57, abre: 1.1, vel: 520, g: -80, vida: 1.4}); anelChao(x, y + 6, 280, 700, C_VERM); }], [4, 160], [5, 150], [6, 150], [7, 150]]);
    poeEstado(hero, 'furia', 6); pop(x, y - 215, 'FÚRIA BÁRBARA', '#ff6a5a'); setAnim('parado'); await wait(200);
  },
  async b_esmaga() {
    await cineBino('besmaga'); await runTo(alc(), 420); const e = enemy;
    await quadros('esmaga', [[0, 100], [1, 120, () => terra(bx(), by() - 4, 12)], [2, 130, () => som('bino_whoosh', 1)], [3, 160], [4, 170], [5, 150]]);
    setFrame('esmaga', 6); som('bino_rumble', 1); fxB('esmaga_montanhas', e.x, e.y - 60, 1000, {escala: 2.8}); shake = Math.max(shake, 26); fxFlash(C_OURO, .35, 450);
    for (let k = 0; k < 3; k++) setTimeout(() => anelChao(e.x, e.y + 6, 420 + k * 120, 700, k ? C_POEIRA : C_BRASA, 20), k * 140);
    rachaduras(e.x, e.y, 10, 380); terra(e.x + 10, e.y - 6, 44); spark(e.x, e.y - 40, 24, '#8a7f74', 640, 1.1, 8);
    hitEnemy(dmg(120, .12), false); await quadros('esmaga', [[6, 220], [7, 180]]); await backHome();
  },
  async b_queda() {
    await cineBino('bqueda'); const c = centroInimigos(), x = bx(), y = by();
    await quadros('queda', [[0, 150], [1, 150, () => { som('bino_rumble', .8); terra(x, y - 4, 10); }], [2, 150], [3, 200], [4, 300], [5, 300, () => som('bino_rugido_queda', .9)], [6, 200]]);
    setFrame('queda', 7); fxB('queda_montanha', c.x, c.y - 80, 1300, {escala: 3.4}); som('bino_golpe_forte', 1); som('bino_rumble', 1); shake = Math.max(shake, 34); fxFlash('255,170,80', .5, 600); await wait(300);
    for (const e of inimigos()) { rachaduras(e.x, e.y, 8, 300); anelChao(e.x, e.y + 6, 380, 750, C_BRASA, 20); terra(e.x, e.y - 6, 30); spark(e.x, e.y - 60, 20, '#8a7f74', 700, 1.1, 8); }
    som('bino_pedras', 1); acertaTodos(130, ['atordoado', 1, .6]); await wait(700); setAnim('parado'); await wait(150);
  },
};
// cada habilidade gasta o MP dela e mostra o nome na faixa de cima (o ataque normal e de graca)
for (const h of HAB_BINO) {
  const f = ACOES_BINO[h.id];
  if (f) ACOES_BINO[h.id] = async function () { hero.mp = Math.max(0, hero.mp - h.mp); banner(h.nome); return f(); };
}
