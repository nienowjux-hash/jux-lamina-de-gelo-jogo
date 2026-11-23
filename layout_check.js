/* VERIFICADOR DE LAYOUT DAS TELAS (2026-11-21, pedido: "um agente que verifica sempre se as descricoes estao dentro dos
   quadros e se esta organizado"). Abra rio.html?layout (o agente jux-layout-ui faz isso com o Edge sem janela).
   Monta um save de teste (sem gravar), passa por todas as telas do menu e, em cada uma, grava todo texto e todo quadro
   (roundRect/fillRect) desenhado num quadro da tela. Aponta:
   - VAZA: texto que comeca dentro de um quadro e passa da borda dele
   - FORA: texto fora do painel do menu (ou da tela)
   - SOBREPOE: dois textos um em cima do outro
   O resultado vai para <pre id="layout_relatorio"> (JSON) e cada tela vira uma <img data-tela> (para o agente olhar). */
(function () {
  'use strict';
  if (!/[?&]layout\b/.test(location.search)) return;
  window.__importou = true;   // nada e gravado no save
  const P = CanvasRenderingContext2D.prototype, orig = { fillText: P.fillText, strokeText: P.strokeText, roundRect: P.roundRect, fillRect: P.fillRect };
  let grava = false, TX = [], RC = [];
  const mapa = (c, x, y) => { const m = c.getTransform(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; };
  const esc = c => { const m = c.getTransform(); return Math.hypot(m.a, m.b) || 1; };
  function guardaTexto(c, s, x, y) { if (!grava || !s || !String(s).trim()) return; const w = c.measureText(String(s)).width, sz = (parseFloat((c.font.match(/(\d+(\.\d+)?)px/) || [])[1]) || 12);
    const al = c.textAlign, x0 = al === 'center' ? x - w / 2 : (al === 'right' || al === 'end') ? x - w : x, k = esc(c), [ax, ay] = mapa(c, x0, y - sz * .78), [bx, by] = mapa(c, x0 + w, y + sz * .22), [px, py] = mapa(c, x, y - sz * .3);
    if (c.globalAlpha < .05) return; TX.push({ s: String(s), x0: Math.min(ax, bx), y0: Math.min(ay, by), x1: Math.max(ax, bx), y1: Math.max(ay, by), px, py, sz: sz * k }); }
  P.fillText = function (s, x, y, mw) { guardaTexto(this, s, x, y); return orig.fillText.apply(this, arguments); };
  P.strokeText = function (s, x, y, mw) { return orig.strokeText.apply(this, arguments); };   // o contorno e do mesmo texto: conta so o fillText
  P.roundRect = function (x, y, w, h) { if (grava && w > 24 && h > 14) { const [ax, ay] = mapa(this, x, y), [bx, by] = mapa(this, x + w, y + h); RC.push({ x0: Math.min(ax, bx), y0: Math.min(ay, by), x1: Math.max(ax, bx), y1: Math.max(ay, by) }); } return orig.roundRect.apply(this, arguments); };
  const espera = ms => new Promise(r => setTimeout(r, ms)), quadros = n => new Promise(r => { let k = 0; (function f() { if (++k > n) r(); else requestAnimationFrame(f); })(); });
  async function capta(nome) {
    TX = []; RC = []; const des = () => { if (window.__rio && __rio.desenha) __rio.desenha(); };   // desenha direto (sem janela nao ha requestAnimationFrame)
    des(); grava = true; des(); grava = false;
    const cv = document.querySelector('canvas'), W0 = cv.width, H0 = cv.height, prob = [];
    const PAINEL = { x0: 88, y0: 38, x1: W0 - 88, y1: H0 - 48 };
    for (const t of TX) {
      if (t.x0 < -1 || t.x1 > W0 + 1 || t.y0 < -1 || t.y1 > H0 + 1) { prob.push({ tipo: 'FORA DA TELA', texto: t.s, x: Math.round(t.x0), y: Math.round(t.y0) }); continue; }
      // o quadro onde o texto comeca (o menor que contem o ponto de ancora)
      const dono = RC.filter(r => t.px >= r.x0 && t.px <= r.x1 && t.py >= r.y0 && t.py <= r.y1 && (r.x1 - r.x0) < W0 * .98).sort((a, b) => (a.x1 - a.x0) * (a.y1 - a.y0) - (b.x1 - b.x0) * (b.y1 - b.y0))[0];
      if (dono) { const sx = Math.max(0, dono.x0 - t.x0, t.x1 - dono.x1), sy = Math.max(0, dono.y0 - t.y0, t.y1 - dono.y1);
        if (sx > 3 || sy > 4) prob.push({ tipo: 'VAZA DO QUADRO', texto: t.s, passa_px: Math.round(Math.max(sx, sy)), quadro: [dono.x0, dono.y0, dono.x1, dono.y1].map(Math.round) }); }
      // a tela de inicio do menu ocupa a tela toda (sem painel)
      if ((UI.menu && !UI.home) || UI.saves || UI.loja) { if (t.x1 > PAINEL.x1 + 2 || t.x0 < PAINEL.x0 - 2) prob.push({ tipo: 'FORA DO PAINEL', texto: t.s, x0: Math.round(t.x0), x1: Math.round(t.x1) }); }
    }
    for (let i = 0; i < TX.length; i++) for (let j = i + 1; j < TX.length; j++) { const a = TX[i], b = TX[j]; if (a.s === b.s && Math.abs(a.x0 - b.x0) < 2 && Math.abs(a.y0 - b.y0) < 2) continue;
      const ix = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), iy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      if (ix > 4 && iy > Math.min(a.y1 - a.y0, b.y1 - b.y0) * .45) prob.push({ tipo: 'SOBREPOE', texto: a.s.slice(0, 50) + '  X  ' + b.s.slice(0, 50) }); }
    let img = ''; try { img = cv.toDataURL('image/png'); } catch (e) {}
    return { tela: nome, textos: TX.length, problemas: prob, img };
  }
  const k = x => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: x, bubbles: true }));
  async function roda() {
    await espera(4500);
    // save de teste: Cap. 3, Jux e Bino, os 2 Ecos, itens, nada gravado
    Object.assign(JOGO, { nivel: 18, exp: 100, gil: 9999, bino: { ativo: true, nivel: 17, exp: 0 }, felipe: { ativo: true, entrou: true, nivel: 16, exp: 0 }, cap2: { fase: 'fim' }, cap3: { fase: 'rio', barco: true, serpVista: true, tartarok: true },
      provas: { fenrir: 'feita', serpente: 'vencida' }, inv: { pocao: 12, hipocao: 8, eter: 5, fenix: 3, remedio: 4, antidoto: 2, colirio: 2, elixir: 1 },
      ecos: { equip: 'lamina', tem: ['lamina', 'guardiao'], pe: { lamina: 3000, guardiao: 40 }, equipadas: ['golpe_duplo'], grupo: { bino: { equip: 'guardiao', equipadas: ['muralha'] } } },
      tut: Object.assign(JOGO.tut || {}, { ecos_tela: true }), formacao: ['bino', null, 'jux', null] });
    const R = [], cap = async n => R.push(await capta(n));
    k('m'); await espera(300); UI.home = true; UI.sel = 0; await cap('menu: inicio');
    for (let a = 0; a < ABAS.length; a++) { UI.home = false; UI.aba = a; UI.sel = 0; UI.ecoTela = 'lista'; UI.quem = 'jux'; await espera(120); await cap('aba ' + ABAS[a]);
      if (typeof ABA_ECOS !== 'undefined' && a === ABA_ECOS) for (const id of ['lamina', 'guardiao']) for (const q of ['jux', 'bino', 'felipe']) { UI.quem = q; UI.ecoVer = id; UI.ecoTela = 'eco'; UI.sel = 3; await espera(100); await cap('Ecos: ' + id + ' visto pelo ' + q); }
      if (a === 0 || a === 2 || a === 3) { UI.quem = 'bino'; await espera(100); await cap('aba ' + ABAS[a] + ' (Bino)'); UI.quem = 'felipe'; await espera(100); await cap('aba ' + ABAS[a] + ' (Felipe)'); } }
    UI.home = true; UI.menu = false;
    if (typeof abreSaves === 'function') for (const m of ['salvar', 'carregar', 'caps']) { abreSaves(m); await espera(120); await cap('janela ' + m); UI.saves = null; }
    // nos mapas do motor (cinzas.html) a loja so abre sem fala na tela: fecha qualquer fala que tenha ficado aberta
    if (typeof REGIAO !== 'undefined' && (REGIAO === 'cinzas' || REGIAO === 'brasaria')) { console.log('layout: fala aberta antes da loja', fala && JSON.stringify(fala.linhas)); fala = null; }
    if (typeof uiFala === 'function') { uiFala('marta'); await espera(120); await cap('Marta: escolha'); UI.escolha = null; UI.loja = { id: 'marta', sel: 0, modo: 'comprar' }; await espera(120); await cap('Marta: loja'); UI.loja = null; }
    // TRILHA DAS CINZAS (cinzas.html?layout): a loja do Tiberio e a caixa de fala com o retrato dele (as falas mais compridas)
    if (typeof REGIAO !== 'undefined' && REGIAO === 'cinzas' && typeof uiFala === 'function') {
      uiFala('tiberio'); await espera(120); await cap('Tibério: escolha'); UI.escolha = null;
      UI.loja = { id: 'tiberio', sel: 0, modo: 'comprar' }; await espera(120); await cap('Tibério: loja');
      UI.loja.sel = LOJAS.tiberio.itens.indexOf('unguento_frio'); await espera(80); await cap('Tibério: loja (Unguento Frio)'); UI.loja = null;
      const todas = [].concat(...CZ_TIB_CONVERSAS, CZ_TIB_DEPOIS, CZ_TIB_VIU, ...Object.values(CZ_FALAS)), maior = (q) => todas.filter(l => l[0] === q).sort((a, b) => b[1].length - a[1].length)[0];
      for (const q of ['Tibério', 'Jux', '✦']) { const l = maior(q); if (!l) continue; fala = { linhas: [l], i: 0, letras: 9999 }; await espera(250); await cap('fala: ' + q + ' (a mais comprida)'); }
      fala = null; }
    // BRASÁRIA (brasaria.html?layout): as 3 lojas, a taverna, o mural, as missões do mural e as falas mais compridas (com retrato)
    if (typeof REGIAO !== 'undefined' && REGIAO === 'brasaria' && typeof uiFala === 'function') {
      fala = null;
      for (const id of ['ursula', 'salvia', 'mercado']) { uiFala(id); await espera(120); await cap(id + ': escolha'); UI.escolha = null;
        UI.loja = { id, sel: 0, modo: 'comprar' }; await espera(120); await cap(id + ': loja');
        for (let i = 1; i < LOJAS[id].itens.length; i++) { UI.loja.sel = i; await espera(60); await cap(id + ': loja item ' + i); }
        if (LOJAS[id].compra) { UI.loja.modo = 'vender'; UI.loja.sel = 0; JOGO.inv.escama_salamandra = 3; await espera(80); await cap(id + ': vender'); }
        UI.loja = null; }
      abreFala('gorm'); await espera(120); await cap('taverna: escolha'); UI.escolha = null;
      brB().mural = true; abreFala('mural'); await espera(120); await cap('mural'); UI.escolha = null; fala = null;
      for (const k of ['gato_pipo', 'carvao_tiberio', 'escamas_salvia']) JOGO.missoes[k] = { st: 'ativa', v0: 0 };
      UI.menu = true; UI.home = false; UI.aba = ABA_MISSOES;
      for (let i = 0; i < listaDiario().length; i++) { UI.sel = i; await espera(80); await cap('missões: ' + listaDiario()[i]); }
      UI.menu = false;
      const todas = [].concat(...Object.values(BR_CONVERSAS).flat(), ...Object.values(BR_DEPOIS), ...Object.values(BR_FALAS),
        ['gato_pipo', 'carvao_tiberio', 'escamas_salvia'].flatMap(k => [...MISSOES[k].oferta, ...MISSOES[k].entrega, ...MISSOES[k].lembra]));
      const maior = q => todas.filter(l => l[0] === q).sort((a, b) => b[1].length - a[1].length)[0];
      for (const q of ['Úrsula', 'Dona Sálvia', 'Gorm', 'Pipo', 'Capitão Bigode', 'Guarda', 'Jux', 'Bino', '✦']) { const l = maior(q); if (!l) continue;
        fala = { linhas: [l], i: 0, letras: 9999 }; await espera(300); await cap('fala: ' + q + ' (a mais comprida)'); }
      fala = null; }
    const pre = document.createElement('pre'); pre.id = 'layout_relatorio'; pre.textContent = JSON.stringify(R.map(r => ({ tela: r.tela, textos: r.textos, problemas: r.problemas })), null, 1); document.body.appendChild(pre);
    for (const r of R) { const im = document.createElement('img'); im.dataset.tela = r.tela; im.src = r.img; document.body.appendChild(im); }
    document.title = 'LAYOUT PRONTO';
  }
  addEventListener('load', () => { roda().catch(e => { const pre = document.createElement('pre'); pre.id = 'layout_relatorio'; pre.textContent = 'ERRO: ' + e.message + '\n' + e.stack; document.body.appendChild(pre); }); });
})();
