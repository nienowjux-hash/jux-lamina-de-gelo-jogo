/* ============ EFEITOS DOS GOLPES DOS INIMIGOS (kit de efeitos_fx.js) ============
   EFX_INIM[nome do golpe] = { prep(e,g): ao comecar (rugido, carga), glow: ms da carga (so magia),
                              cast(e,g): magia: viaja ate o heroi e estoura (async), hit(e,g): golpe fisico: ao encostar no heroi }
   Chamado por golpeDoTipo() no index.html. Cores: Eclipse = roxo, gelo = azul claro, goblin = verde. */
'use strict';
const COR_ECL = '200,150,255', COR_ECL2 = '150,80,230', COR_NEVE = '228,244,255', COR_VEN = '170,225,110', COR_GELO = '150,225,255';
const alvoHeroi = () => ({x: hero.x - 20, y: hero.y - 95});
const bocaInim = e => ({x: e.x + 70 + (e.lunge || 0), y: e.y - 70});

// efeito DESENHADO (ref/inimigos_fx/*.png -> fx_inimigos_sprites.js, tools/cut_fx_inimigos.py): 8 quadros tocados em ms, centrados em (x,y)
const FXI = window.JUX_FXI || {}, FXI_IMG = {};
for (const k in FXI) { const im = new Image(); im.src = FXI[k].atlas; FXI_IMG[k] = im; }
function fxiPlay(nome, x, y, ms, o) {
  const I = FXI[nome], im = FXI_IMG[nome]; if (!I || !im) return false; o = o || {}; const esc = o.escala || 1;
  fxAdd(FX.mundo, ms, (c, k) => { if (!im.complete) return; const de = o.de || 0, q = Math.min(I.n - 1, de + Math.floor(k * (I.n - de)));   // de = primeiro quadro (toca so o fim da folha)
    const kv = o.fim ? Math.min(1, k / o.fim) : k;   // fim = parte do tempo gasta viajando; depois fica parado
    c.save(); c.translate(o.x1 != null ? x + (o.x1 - x) * kv : x, o.y1 != null ? y + (o.y1 - y) * kv : y); if (o.rot) c.rotate(o.rot); c.scale((o.flip ? -1 : 1) * esc, esc);
    c.globalAlpha = o.alpha == null ? 1 : o.alpha; c.imageSmoothingEnabled = false;
    if (o.furia) c.filter = 'sepia(.85) saturate(3.2) hue-rotate(-38deg) brightness(1.08)';   // efeito em tons de brasa (Furia Barbara do Bino)
    const fs = fxSrc(I, q);   // HD: I.r (tools/hd_atlas.py)
    c.drawImage(im, ...fs, -I.w / 2, -I.h / 2, I.w, I.h);
    if (o.brilho) { c.globalCompositeOperation = 'lighter'; c.globalAlpha *= .3; c.drawImage(im, ...fs, -I.w / 2, -I.h / 2, I.w, I.h); }
    c.restore(); });
  return true;
}

// projetil: bola de luz com rastro que viaja de (x0,y0) ate (x1,y1)
function fxProj(x0, y0, x1, y1, ms, cor, r, escuro) {
  fxAdd(FX.mundo, ms, (c, k) => {
    const pos = q => ({x: x0 + (x1 - x0) * q, y: y0 + (y1 - y0) * q - Math.sin(q * Math.PI) * 34});
    c.save(); c.globalCompositeOperation = 'lighter';
    for (let i = 7; i >= 0; i--) {
      const q = Math.max(0, k - i * .035), p = pos(q), rr = r * (1 - i * .09), a = (1 - i / 8) * .7;
      const g = c.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr * 2.2);
      g.addColorStop(0, `rgba(${cor},${a})`); g.addColorStop(.45, `rgba(${cor},${a * .8})`); g.addColorStop(1, `rgba(${cor},0)`);
      c.fillStyle = g; c.fillRect(p.x - rr * 2.2, p.y - rr * 2.2, rr * 4.4, rr * 4.4);
    }
    c.restore();
    if (escuro) { const p = pos(k); c.save(); c.fillStyle = 'rgba(18,0,36,.95)'; c.beginPath(); c.arc(p.x, p.y, r * .55, 0, 6.283); c.fill();
      c.strokeStyle = `rgba(${cor},.9)`; c.lineWidth = 3; c.beginPath(); c.arc(p.x, p.y, r * .62, 0, 6.283); c.stroke(); c.restore(); }
  });
}
// fila de efeitos escalonados no tempo
const emFila = (lista) => { for (const [ms, fn] of lista) setTimeout(fn, ms); };

const EFX_INIM = {
  // ---------------- Bolotao, o Rei da Neve (mini-chefe da Trilha): os 4 efeitos especiais sao chamados por bolotaoEspecial() em index.html ----------------
  // ---------------- Presa-Antiga, o Lobo Anciao (mini-chefe do Vale) ----------------
  'Mordida Ancestral': {
    prep(e) {som('presa_rosna', .8);},
    hit(e, g) {const a = alvoHeroi(); som('presa_mordida', .95);
      if (fxiPlay('presa_mordida', a.x - 6, a.y - 30, 900, {escala: 1.9})) {fxFaiscas(a.x, a.y - 20, 14, {cor: '170,225,255', vel: 650}); shake = Math.max(shake, 11); return;}
      fxCorte(a.x + 70, a.y - 70, a.x - 20, a.y + 30, {ms: 300, esp: 18, cor: '170,225,255'});}},
  'Patada': {
    hit(e, g) {const a = alvoHeroi(); som('presa_investida', .6); fxCorte(a.x + 60, a.y - 80, a.x - 30, a.y + 20, {ms: 280, esp: 14, cor: '210,235,255'}); shake = Math.max(shake, 6);}},
  // ---------------- Capitão Dente-de-Ferro (mini-chefe da Garganta) ----------------
  'Machadada do Halvard': {
    prep(e) {som('whoosh', .8); som('capitao_rosna', .7);},
    hit(e, g) {const a = alvoHeroi(); som('capitao_machado', .95);
      if (fxiPlay('capitao_machadada', a.x - 10, a.y - 10, 760, {escala: 2.1})) {fxFaiscas(a.x, a.y + 30, 12, {cor: '255,215,120', vel: 600}); shake = Math.max(shake, 10); return;}
      fxCorte(a.x + 80, a.y - 90, a.x - 30, a.y + 40, {ms: 320, esp: 22, cor: '200,210,230'}); shake = Math.max(shake, 10);}},
  'Saque Sujo': {
    hit(e, g) {const a = alvoHeroi(); som('capitao_risada', .8); som('goblin_moedas', .6);
      if (!fxiPlay('capitao_saque', a.x, a.y - 30, 900, {escala: 1.5})) fxFaiscas(a.x, a.y, 10, {cor: '255,215,120', vel: 500});}},
  // ---------------- Lobo da Geada (marcado pelo Eclipse) ----------------
  'Mordida': {
    hit() { const a = alvoHeroi(); som('lobo_mordida', .7);
      if (fxiPlay('mordida', a.x, a.y - 5, 650, {escala: 1.7})) { fxFaiscas(a.x, a.y, 8, {cor: COR_ECL, vel: 500}); shake = Math.max(shake, 8); return; }
      fxCorte(a.x + 70, a.y - 70, a.x - 20, a.y + 30, {ms: 300, esp: 16, cor: COR_ECL}); fxCorte(a.x + 40, a.y - 80, a.x - 50, a.y + 20, {ms: 300, esp: 13, cor: COR_ECL});
      fxGolpe(a.x, a.y, .8, COR_ECL); }},
  'Uivo Gélido': {
    glow: 650,
    prep(e) { som('lobo_uivo', .8); const b = bocaInim(e); fxAnel(b.x, b.y, {raio: 220, ms: 700, esp: 12, cor: COR_GELO, a: .8}); },
    async cast(e) { const b = bocaInim(e), a = alvoHeroi();
      if (fxiPlay('uivo_gelido', b.x + 40, b.y + 10, 700, {escala: 1.35, x1: a.x + 30, y1: a.y + 10})) {   // onda desenhada viajando e se estilhacando no heroi
        await wait(430); frostSfx(.6, 700); fxFaiscas(a.x, a.y, 10, {cor: COR_GELO, vel: 500, g: 100}); shake = Math.max(shake, 6); await wait(60); return; }
      for (let k = 0; k < 3; k++) setTimeout(() => fxAnel(b.x + (a.x - b.x) * (.25 + k * .25), b.y + (a.y - b.y) * (.25 + k * .25), {raio: 150 + k * 40, ms: 420, esp: 14, cor: COR_GELO, a: .8}), k * 140);
      fxProj(b.x, b.y, a.x, a.y, 480, COR_GELO, 20); await wait(480);
      frostSfx(.6, 700); fxGolpe(a.x, a.y, 1, COR_GELO); fxFaiscas(a.x, a.y, 14, {cor: COR_GELO, vel: 600, g: 100}); }},
  'Investida da Matilha': {
    prep() { som('lobo_ataque', .8); },
    hit() { const a = alvoHeroi(); som('lobo_mordida', .8);
      if (fxiPlay('investida', a.x - 10, a.y + 25, 780, {escala: 1.9})) { fxFaiscas(a.x, a.y, 10, {cor: COR_ECL, vel: 600}); shake = Math.max(shake, 12); return; }
      fxLinhas(a.x, a.y, 320, {a: .4, cor: COR_ECL});
      fxAnel(hero.x, hero.y + 8, {raio: 300, achata: .26, ms: 520, esp: 18, cor: COR_ECL}); fxGolpe(a.x, a.y, 1.25, COR_ECL);
      fxCorte(a.x + 90, a.y - 40, a.x - 70, a.y + 40, {ms: 340, esp: 22, cor: COR_ECL}); }},

  // ---------------- Bolota ----------------
  'Pancada Fofa': {
    hit(e) { const a = alvoHeroi(); som(e && e.tipo === 'bolotao' ? 'bolotao_pancada' : 'neve_pancada', .9);   // o Bolotao tem som proprio
      if (fxiPlay('pancada_fofa', a.x, a.y + 10, 760, {escala: 1.7})) { shake = Math.max(shake, 5); return; }
      fxEstrela(a.x, a.y, {raio: 160, ms: 300, cor: COR_NEVE}); fxAnel(a.x, a.y, {raio: 160, ms: 360, esp: 14, cor: COR_NEVE});
      fxFaiscas(a.x, a.y, 16, {cor: COR_NEVE, vel: 420, g: 260, tam: .9}); shake = Math.max(shake, 6); }},
  'Espirro de Neve': {
    glow: 700,
    prep() { som('whoosh', .3); },
    async cast(e) { const b = {x: e.x + 55, y: e.y - 40}, a = alvoHeroi();
      if (fxiPlay('espirro_neve', b.x + 70, b.y - 5, 780, {escala: 1.45, x1: a.x - 50, y1: a.y - 5})) {   // rajada desenhada saindo do nariz e batendo no heroi
        som(e.tipo === 'bolotao' ? 'bolotao_espirro' : 'bolota_espirro', .9); await wait(170); som('whoosh2', .5); await wait(480); som('neve_pancada', .7); fxFaiscas(a.x, a.y, 8, {cor: COR_NEVE, vel: 400, g: 200}); shake = Math.max(shake, 5); await wait(80); return; }
      som('whoosh2', .7); som('magia_gelo', .5);
      for (let i = 0; i < 12; i++) setTimeout(() => { const q = i / 11; fxFaiscas(b.x + (a.x - b.x) * q, b.y + (a.y - b.y) * q, 8, {ang: Math.atan2(a.y - b.y, a.x - b.x), abre: .5, vel: 500, g: 120, cor: COR_NEVE, tam: 1.2});
        fxBrilho(b.x + (a.x - b.x) * q, b.y + (a.y - b.y) * q, {raio: 60, ms: 260, cor: COR_NEVE, a: .6}); }, i * 40);
      await wait(520); fxGolpe(a.x, a.y, .9, COR_NEVE); fxBrilho(a.x, a.y, {raio: 200, ms: 600, cor: COR_NEVE}); fxFaiscas(a.x, a.y, 24, {cor: COR_NEVE, vel: 500, g: 200}); }},

  // ---------------- Goblin Saqueador ----------------
  'Facada Suja': {
    hit() { const a = alvoHeroi(); som('goblin_facada', .9);
      if (fxiPlay('facada_suja', a.x, a.y - 5, 700, {escala: 1.6})) { fxFaiscas(a.x, a.y, 6, {cor: COR_VEN, vel: 400, g: 500, tam: .8}); shake = Math.max(shake, 6); return; }
      fxCorte(a.x + 60, a.y - 60, a.x - 30, a.y + 30, {ms: 280, esp: 14, cor: '230,240,200'});
      fxFaiscas(a.x, a.y, 14, {cor: COR_VEN, vel: 500, g: 400, tam: .9}); fxGolpe(a.x, a.y, .8, COR_VEN); }},
  'Pedrada': {
    hit() { const a = alvoHeroi(); som('goblin_pedrada', .9);
      if (fxiPlay('pedrada', a.x - 20, a.y, 760, {escala: 1.6})) { shake = Math.max(shake, 8); return; }
      fxEstrela(a.x, a.y, {raio: 180, ms: 280, cor: '230,210,170'}); fxFaiscas(a.x, a.y, 18, {cor: '190,170,140', vel: 520, g: 700, tam: 1.1});
      fxAnel(a.x, a.y, {raio: 170, ms: 320, esp: 14, cor: '230,210,170'}); shake = Math.max(shake, 9); }},
  'Mão Leve': {   // rouba gil: moedinhas voando para o goblin
    hit() { const a = alvoHeroi(); som('goblin_moedas', .8);
      if (fxiPlay('mao_leve', a.x + 20, a.y - 5, 850, {escala: 1.6, x1: a.x - 90, y1: a.y - 15})) return;
      for (let i = 0; i < 8; i++) setTimeout(() => fxFaiscas(a.x + (enemy.x - a.x) * i / 8, a.y + (enemy.y - 60 - a.y) * i / 8, 4, {cor: '255,225,110', vel: 120, g: 0, vida: .5}), i * 45);
      fxEstrela(a.x, a.y, {raio: 130, ms: 320, cor: '255,225,110'}); }},

  // ---------------- Bichos do rio (Cap. 3, FICHA_CAP3_RIO.md): efeitos desenhados (ref/inimigos_fx/*.png) e sons CC0 ----------------
  'Choque': {
    glow: 650,
    prep(e) { som('aguaviva_pulso', .7); fxBrilho(e.x + 30, e.y - 90, {raio: 120, ms: 650, cor: '140,220,255', cresce: true}); },
    async cast(e) { const a = alvoHeroi(); som('aguaviva_choque', .9); fxiPlay('aguaviva_choque', a.x, a.y - 10, 900, {escala: 1.5}); await wait(320);
      fxFlash('150,220,255', .22, 260); shake = Math.max(shake, 8); await wait(250); }},
  'Clarão': {
    glow: 700,
    prep(e) { som('aguaviva_pulso', .6); fxBrilho(e.x + 30, e.y - 90, {raio: 140, ms: 700, cor: '220,240,255', cresce: true}); },
    async cast(e) { const a = alvoHeroi(); som('aguaviva_clarao', .85); fxiPlay('aguaviva_clarao', a.x, a.y - 20, 1100, {escala: 1.6}); await wait(300);
      fxFlash('235,245,255', .55, 420); await wait(350); }},
  'Mordida de Gelo': {
    hit() { const a = alvoHeroi(); som('piranha_mordida', .9); fxiPlay('piranha_mordida', a.x, a.y, 650, {escala: 1.4}); shake = Math.max(shake, 6); }},
  'Furto Molhado': {   // a lontra rouba um ITEM (index.html, golpeDoTipo)
    hit() { const a = alvoHeroi(); som('lontra_roubo', .9); fxiPlay('lontra_roubo', a.x, a.y - 10, 900, {escala: 1.5}); }},
  'Pinçada': {
    prep(e) { som('caranguejo_pinca', .5); },
    hit() { const a = alvoHeroi(); som('caranguejo_pinca', 1); fxiPlay('caranguejo_pinca', a.x, a.y, 800, {escala: 1.6}); shake = Math.max(shake, 11); }},

  // ---------------- Bichos das aguas quentes (trecho 3 do rio) ----------------
  'Chicotada de Brasa': {
    prep(e) { som('enguia_sibilo', .6); },
    hit() { const a = alvoHeroi(); som('enguia_chicote', 1); som('enguia_fogo', .6); fxiPlay('enguia_chicote', a.x, a.y - 10, 850, {escala: 1.6}); fxFlash('255,120,30', .15, 220); shake = Math.max(shake, 9); }},
  'Bolha Fervente': {
    glow: 600,
    prep(e) { som('sapo_incha', .8); fxBrilho(e.x + 40, e.y - 70, {raio: 110, ms: 600, cor: '255,170,90', cresce: true}); },
    async cast(e) { const a = alvoHeroi(); som('sapo_cuspe', .9); fxiPlay('sapo_cuspe', a.x, a.y - 30, 1000, {escala: 1.2}); await wait(450); som('sapo_borbulha', .5); shake = Math.max(shake, 5); await wait(200); }},
  'Jato de Vapor': {
    glow: 600,
    prep(e) { som('caramujo_gosma', .7); fxBrilho(e.x + 40, e.y - 60, {raio: 110, ms: 600, cor: '255,150,80', cresce: true}); },
    async cast(e) { const a = alvoHeroi(); som('caramujo_vapor', .9); fxiPlay('caramujo_vapor', a.x, a.y - 20, 1100, {escala: 1.5}); await wait(450); shake = Math.max(shake, 5); await wait(200); }},
  'Rasante': {
    prep(e) { som('morcego_guincho', .7); },
    hit() { const a = alvoHeroi(); som('morcego_asas', .9); fxiPlay('morcego_rasante', a.x, a.y - 20, 800, {escala: 1.5}); shake = Math.max(shake, 6); }},
  'Sugar Energia': {   // rouba MP do heroi (index.html, golpeDoTipo: g.sugaMp)
    glow: 650,
    prep(e) { som('morcego_guincho', .6); fxBrilho(e.x + 30, e.y - 80, {raio: 110, ms: 650, cor: '255,110,70', cresce: true}); },
    async cast(e) { const a = alvoHeroi(); som('morcego_suga', .9); const esc = Math.max(1.3, (a.x - e.x) / 360); fxiPlay('morcego_suga', (a.x + e.x) / 2, a.y - 20, 1100, {escala: esc}); await wait(700); }},

  // ---------------- Trilha das cinzas (Cap. 3, Parte A2, FICHA_CAP3_CINZAS.md) ----------------
  'Cuspe de Brasa': {   // Salamandra: enche o peito, cospe a brasa (voa ate o heroi e explode) e depois se esconde no vapor (index.html)
    glow: 650,
    prep(e) { som('salamandra_sibilo', .6); fxBrilho(e.x + 90, e.y - 50, {raio: 90, ms: 650, cor: '255,140,40', cresce: true}); },
    async cast(e) { const a = alvoHeroi(); som('salamandra_cuspe', .95); fxiPlay('salamandra_brasa', e.x + 140, e.y - 60, 1300, {escala: 1.3, x1: a.x - 10, y1: a.y, fim: .5});
      await wait(620); som('salamandra_brasa', .9); fxFlash('255,120,30', .14, 220); shake = Math.max(shake, 8); await wait(150);
      setTimeout(() => { if (e.hp > 0 && !e.dead && !e.morrendo && typeof salamandraVapor === 'function') salamandraVapor(e); }, 700); }},
  'Mordida Quente': {
    prep(e) { som('salamandra_sibilo', .7); },
    hit() { const a = alvoHeroi(); som('salamandra_dor', .35); som('salamandra_brasa', .6); fxiPlay('salamandra_brasa', a.x, a.y + 10, 700, {escala: .9, de: 3}); shake = Math.max(shake, 7); }},
  'Espirro de Fumaça': {   // Fuligem: enche as bochechas e espirra uma nuvem de fuligem (Cego)
    glow: 600,
    prep(e) { som('fuligem_risinho', .7); },
    async cast(e) { const a = alvoHeroi(); som('fuligem_espirro', 1); fxiPlay('fuligem_fumaca', e.x + 90, e.y - 60, 1300, {escala: 1.2, x1: a.x - 10, y1: a.y - 10, fim: .5});
      await wait(650); shake = Math.max(shake, 4); await wait(150); }},
  'Cabeçada Fofa': {
    prep(e) { som('fuligem_risinho', .6); },
    hit() { const a = alvoHeroi(); som('fuligem_dor', .5); som('neve_pancada', .5); fxiPlay('fuligem_fumaca', a.x, a.y, 700, {escala: .7, de: 5}); shake = Math.max(shake, 5); }},
  'Martelada': {   // Forjado: ergue o martelo e esmaga o chao
    prep(e) { som('forjado_ergue', .9); fxBrilho(e.x + 20, e.y - 200, {raio: 100, ms: 500, cor: '200,120,255', cresce: true}); },
    hit() { const a = alvoHeroi(); som('forjado_martelo', 1); fxiPlay('forjado_martelada', a.x - 20, a.y - 25, 1000, {escala: 1.6}); fxFlash('255,150,60', .16, 240); shake = Math.max(shake, 14); }},
  'Mordida de Brasa': {   // Mae-Salamandra
    prep(e) { som('mae_rugido', .5); },
    hit() { const a = alvoHeroi(); som('mae_dor', .3); som('salamandra_brasa', 1); fxiPlay('salamandra_brasa', a.x, a.y, 900, {escala: 1.5, de: 3}); fxFlash('255,120,30', .18, 240); shake = Math.max(shake, 12); }},
  'Cuspe da Mãe': {
    glow: 700,
    prep(e) { som('mae_acende', .8); fxBrilho(e.x + 160, e.y - 90, {raio: 140, ms: 700, cor: '255,140,40', cresce: true}); },
    async cast(e) { const a = alvoHeroi(); som('salamandra_cuspe', 1); som('mae_onda', .4); fxiPlay('salamandra_brasa', e.x + 230, e.y - 110, 1300, {escala: 2, x1: a.x - 10, y1: a.y, fim: .5});
      await wait(620); som('salamandra_brasa', 1); fxFlash('255,120,30', .2, 260); shake = Math.max(shake, 11); await wait(150); }},

  // ---------------- Ignarok (Cap. 2, Parte C): efeitos desenhados (ref/inimigos_fx/ignarok_*.png) ----------------
  'Punho de Magma': {
    prep(e) { som('ignarok_rosna', .8); fxBrilho(e.x + 80, e.y - 160, {raio: 150, ms: 500, cor: '255,140,40', cresce: true}); },
    hit(e) { const a = alvoHeroi(); som('ignarok_punho', .95); fxiPlay('ignarok_punho', a.x, a.y, 900, {escala: 1.7}); fxFlash('255,110,20', .25, 300); shake = Math.max(shake, 14); }},
  'Derreter': {
    glow: 700,
    prep(e) { som('ignarok_rosna', .6); fxBrilho(e.x + 60, e.y - 150, {raio: 170, ms: 700, cor: '255,120,30', cresce: true}); },
    async cast(e) { const a = alvoHeroi(); som('ignarok_derreter', .9);
      fxiPlay('ignarok_derreter', a.x, a.y, 1100, {escala: 1.6}); await wait(500);
      // o calor derrete as defesas do alvo: Escudo de Cristal, Muralha e Regen
      let tirou = false; if (hero.escudo > 0) {hero.escudo = 0; tirou = true;}
      for (const k of ['muralha', 'regen']) if (hero.est && hero.est[k] > 0) {hero.est[k] = 0; tirou = true;}
      if (tirou) setTimeout(() => pop(hero.x, hero.y - 250, 'DEFESAS DERRETIDAS', '#ffb060'), 100);
      fxFlash('255,120,30', .2, 320); shake = Math.max(shake, 6); await wait(250); }},

  // ---------------- Sombras (Cap. 2, Parte B): o golpe ja vem desenhado no quadro 5 da folha; aqui so o impacto ----------------
  // cada Sombra tem o proprio som (2026-11-20: 'todos estao iguais'): Oskar = gemido de velho e tambor, Borin = rosnado e bigorna,
  // Ingrid = lamento com eco, sopa borbulhando e gota
  'Lamento': {
    glow: 750,
    prep(e) { som(e.tipo === 'sombra_borin' ? 'som_borin_lamento' : e.tipo === 'sombra_ingrid' ? 'som_ingrid_lamento' : 'som_oskar_lamento', .85); fxAnel(e.x + 10, e.y - 90, {raio: 200, ms: 750, esp: 14, cor: COR_ECL2}); },
    async cast(e) { const a = alvoHeroi(); for (let i = 0; i < 3; i++) setTimeout(() => fxAnel(e.x + 60 + i * 60, e.y - 90, {raio: 160 + i * 40, ms: 520, esp: 12, cor: COR_ECL}), i * 120);
      await wait(380); fxFlash('60,0,90', .22, 380); fxBrilho(a.x, a.y, {raio: 180, ms: 500, cor: COR_ECL}); shake = Math.max(shake, 5); await wait(200); }},
  'Abraço da Sombra': {
    hit(e) { som(e.tipo === 'sombra_borin' ? 'som_borin_abraco' : 'som_oskar_abraco', .9); fxFlash('40,0,70', .25, 360); const a = alvoHeroi(); fxFaiscas(a.x, a.y, 22, {cor: COR_ECL2, vel: 300, g: -60, vida: .9}); shake = Math.max(shake, 7); }},
  'Sopa Amarga': {
    glow: 650,
    prep(e) { som('som_ingrid_sopa', .85); fxBrilho(e.x + 40, e.y - 120, {raio: 110, ms: 650, cor: COR_ECL, cresce: true}); },
    async cast(e) { const b = {x: e.x + 90, y: e.y - 90}, a = alvoHeroi(); fxProj(b.x, b.y, a.x, a.y, 420, COR_ECL, 22, true); await wait(420);
      fxFlash('90,0,120', .2, 300); fxFaiscas(a.x, a.y, 26, {cor: COR_ECL, vel: 420, g: 500, vida: .8}); shake = Math.max(shake, 5); }},
  'Tambor do Medo': {
    glow: 700,
    prep(e) { som('som_oskar_tambor', .95); fxBrilho(e.x + 40, e.y - 70, {raio: 120, ms: 700, cor: COR_ECL, cresce: true}); },
    async cast(e) { for (let i = 0; i < 4; i++) setTimeout(() => { fxAnel(e.x + 80, e.y - 70, {raio: 260 + i * 70, ms: 600, esp: 16, cor: i % 2 ? COR_ECL : COR_ECL2}); }, i * 150);
      await wait(600); fxFlash('70,0,110', .2, 400); shake = Math.max(shake, 8); }},
  'Martelada de Sombra': {
    hit(e) { som('som_borin_martelada', 1); fxFlash('60,0,90', .3, 380); shake = Math.max(shake, 14); }},

  // ---------------- Acolito do Eclipse ----------------
  'Esfera de Trevas': {
    glow: 700,
    prep(e) { som('magia_brilho', .35); sfx(110, .9, 'sawtooth', .03, .5); fxBrilho(e.x + 75, e.y - 150, {raio: 130, ms: 700, cor: COR_ECL, cresce: true}); },
    async cast(e) { const b = {x: e.x + 80, y: e.y - 135}, a = alvoHeroi();
      if (fxiPlay('esfera_trevas', b.x + 40, b.y, 1000, {escala: 1.9, x1: a.x - 30, y1: a.y, fim: .38})) {   // esfera desenhada: viaja e explode no heroi
        som('acolito_esfera', .8); await wait(400); som('acolito_explode', .9); fxFlash('70,10,130', .22, 300); shake = Math.max(shake, 10); await wait(330); return; }
      som('magia_raio', .4);
      fxProj(b.x, b.y, a.x, a.y, 520, COR_ECL, 30, true); fxFaiscas(b.x, b.y, 10, {cor: COR_ECL, vel: 400, g: 0}); await wait(520);
      fxFlash('70,10,130', .3, 320); fxGolpe(a.x, a.y, 1.15, COR_ECL); fxAnel(a.x, a.y, {raio: 260, ms: 520, esp: 20, cor: COR_ECL2});
      fxFaiscas(a.x, a.y, 18, {cor: COR_ECL, vel: 700, g: 120}); }},
  'Drenar Cristal': {
    glow: 800,
    prep(e) { som('magia_brilho', .4); fxBrilho(e.x + 75, e.y - 150, {raio: 150, ms: 800, cor: COR_ECL, cresce: true}); },
    async cast(e) { const b = {x: e.x + 80, y: e.y - 135}, a = alvoHeroi();
      {   // efeito desenhado: o circulo de runas nos pes do acolito e o raio indo ate o heroi; a escala acompanha a distancia
        const esc = Math.max(1.6, (a.x - e.x - 40) / (.77 * 256)), cx = e.x + 30 + .32 * 256 * esc, cy = e.y - .18 * 256 * esc + 20;
        if (fxiPlay('drenar_cristal', cx, cy, 1150, {escala: esc})) { som('acolito_drenar', .9); await wait(560); fxFlash('70,10,130', .22, 380); fxBrilho(a.x, a.y, {raio: 200, ms: 560, cor: COR_ECL}); shake = Math.max(shake, 6); await wait(450); return; } }
      som('magia_raio', .5); sfx(98, 1.1, 'sawtooth', .035, .5);
      for (let i = 0; i < 3; i++) setTimeout(() => fxCorte(b.x, b.y, a.x, a.y, {ms: 420, esp: 18 - i * 4, cor: i ? COR_ECL : COR_ECL2, risca: .35}), i * 110);
      // a energia sobe do heroi para o acolito
      for (let i = 0; i < 10; i++) setTimeout(() => { const q = i / 9; fxFaiscas(a.x + (b.x - a.x) * q, a.y + (b.y - a.y) * q - Math.sin(q * 3.14) * 20, 5, {cor: '230,200,255', vel: 90, g: 0, vida: .6}); }, 200 + i * 55);
      await wait(520); fxFlash('70,10,130', .28, 420); fxBrilho(a.x, a.y, {raio: 220, ms: 560, cor: COR_ECL}); fxAnel(a.x, a.y, {raio: 220, ms: 520, esp: 14, cor: COR_ECL}); }},
  'Toque do Vazio': {
    glow: 650,
    prep(e) { som('magia_brilho', .3); fxAnel(e.x + 20, e.y - 10, {raio: 180, achata: .28, ms: 650, esp: 12, cor: COR_ECL2}); },
    async cast() { const a = alvoHeroi();
      if (fxiPlay('toque_vazio', a.x, hero.y + 12 - .3 * 256 * 2.3, 1100, {escala: 2.3})) {   // coluna de trevas desenhada nos pes do heroi
        som('acolito_vazio', .9); await wait(420); fxFlash('50,0,100', .25, 450); shake = Math.max(shake, 9); await wait(560); return; }
      som('magia_raio', .35); sfx(82, 1, 'sine', .05, .4);
      fxAnel(a.x, a.y + 90, {raio: 260, achata: .26, ms: 600, esp: 18, cor: COR_ECL2}); await wait(300);
      fxPilar(a.x, a.y + 100, {larg: 120, ms: 700, cor: COR_ECL2}); fxFlash('50,0,100', .3, 400); fxFaiscas(a.x, a.y, 20, {cor: COR_ECL, ang: -1.57, abre: .8, vel: 700, g: -40}); await wait(260); }},

  // ---------------- Serpente do Degelo (chefe do rio) ----------------
  'Bote': {
    prep(e) { som('serpente_sibilo', .8); },
    hit() { const a = alvoHeroi(); som('serpente_rugido', .6); som('rio_splash_grande', .7);
      fxImpacto(a.x, a.y); fxCorte(a.x + 100, a.y - 130, a.x - 40, a.y + 30, {ms: 340, esp: 26, cor: '150,225,255'}); fxCorte(a.x + 70, a.y - 140, a.x - 70, a.y + 20, {ms: 340, esp: 20, cor: '220,245,255'});
      fxFaiscas(a.x, a.y - 20, 18, {cor: '170,230,255', vel: 480, g: 300}); fxGolpe(a.x, a.y, 1.4, '150,225,255'); shake = Math.max(shake, 14); }},
  'Constrição': {
    prep(e) { som('serpente_sibilo', .7); },
    hit() { const a = alvoHeroi(); som('serpente_aperta', 1); fxiPlay('serpente_aperta', a.x, a.y - 40, 1200, {escala: 1.7}); fxFlash('120,200,255', .15, 300); shake = Math.max(shake, 10); }},

  // ---------------- Skoll, o Alfa ----------------
  'Mordida Sombria': {
    prep() { som('skoll_rosna', .9); },
    hit() { const a = alvoHeroi(); som('skoll_mordida', 1);
      if (fxiPlay('mordida_sombria', a.x, a.y - 10, 850, {escala: 2.1})) { fxFlash('60,10,110', .22, 280); shake = Math.max(shake, 14); return; }
      fxImpacto(a.x, a.y);
      fxCorte(a.x + 90, a.y - 120, a.x - 30, a.y + 40, {ms: 360, esp: 26, cor: COR_ECL2}); fxCorte(a.x + 60, a.y - 130, a.x - 60, a.y + 30, {ms: 360, esp: 22, cor: COR_ECL2});
      fxGolpe(a.x, a.y, 1.5, COR_ECL2); fxFlash('60,10,110', .25, 280); shake = Math.max(shake, 14); }},
  'Investida Acorrentada': {
    prep() { som('skoll_ataque', 1); },
    hit() { const a = alvoHeroi(); som('skoll_correntes', 1); som('skoll_mordida', .5);
      if (fxiPlay('investida_acorrentada', a.x, a.y - 5, 850, {escala: 2.1})) { fxAnel(hero.x, hero.y + 8, {raio: 380, achata: .26, ms: 600, esp: 22, cor: COR_ECL2}); shake = Math.max(shake, 16); return; }
      fxLinhas(a.x, a.y, 380, {a: .5, cor: COR_ECL});
      for (let i = 0; i < 3; i++) setTimeout(() => fxCorte(a.x + 130, a.y - 90 + i * 55, a.x - 90, a.y - 70 + i * 55, {ms: 340, esp: 14, cor: '120,120,140', risca: .3}), i * 70);   // as correntes chicoteando
      fxAnel(hero.x, hero.y + 8, {raio: 380, achata: .26, ms: 600, esp: 22, cor: COR_ECL2}); fxGolpe(a.x, a.y, 1.6, COR_ECL2); shake = Math.max(shake, 16); }},
  'Uivo do Eclipse': {
    glow: 900,
    prep(e) { som('skoll_uivo', 1); tween(G, 'dim', .45, 400); const b = {x: e.x + 90, y: e.y - 150};
      for (let k = 0; k < 3; k++) setTimeout(() => fxAnel(b.x, b.y, {raio: 330, ms: 800, esp: 14, cor: COR_ECL, a: .8}), k * 230); fxBrilho(b.x, b.y, {raio: 220, ms: 900, cor: COR_ECL2, cresce: true}); },
    async cast(e) { const b = {x: e.x + 90, y: e.y - 150}, a = alvoHeroi();
      {   // eclipse desenhado: nasce na boca, as meias-luas de som viajam (quadros 1-4) e a coluna de trevas cai no heroi (5-8)
        const esc = 1.9, yFim = hero.y + 12 - .3 * 256 * esc;
        if (fxiPlay('uivo_eclipse', b.x + 60, b.y, 1500, {escala: esc, x1: a.x, y1: yFim, fim: .5})) {
          await wait(720); som('acolito_explode', 1); fxFlash('70,10,130', .35, 500); tween(G, 'dim', 0, 500); shake = Math.max(shake, 16); await wait(780); return; } }
      for (let k = 0; k < 4; k++) setTimeout(() => fxAnel(b.x + (a.x - b.x) * (k + 1) / 4, b.y + (a.y - b.y) * (k + 1) / 4, {raio: 190 + k * 50, ms: 450, esp: 16, cor: COR_ECL, a: .8}), k * 130);
      await wait(560); tween(G, 'dim', 0, 500); fxFlash('70,10,130', .4, 500);
      fxPilar(a.x, a.y + 100, {larg: 190, ms: 900, cor: COR_ECL2}); fxGolpe(a.x, a.y, 1.5, COR_ECL2); fxRaios(a.x, a.y, {raio: 700, ms: 900, n: 14, a: .35, cor: COR_ECL}); shake = Math.max(shake, 16); }},
};
