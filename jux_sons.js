/* ============ SONS NOVOS DO JUX (ataque basico e todas as habilidades da espada de gelo) ============
   Carregado DEPOIS do script principal do index.html (usa SOM, som, swordSfx, golpeSfx, frostSfx, hitSfx, hero, cine).
   Nao mexe no corpo das acoes: enquanto uma acao do Jux roda (actAttack, actBlade, ...), as funcoes de som que ela chama
   sao trocadas pelos arquivos assets/sfx/novos/jux_* no MESMO momento (a ordem das chamadas dentro da acao escolhe o som).
   Fora das acoes do Jux (Bino, Felipe, inimigos, cinematicas) tudo continua igual. Fontes e licencas: assets/sfx/CREDITOS.txt */
'use strict';
(function () {
  if (typeof SOM === 'undefined' || typeof som !== 'function' || typeof swordSfx !== 'function') return;

  // pico (s) = instante do impacto dentro do arquivo, para os sons que sobem antes do golpe (o golpeSfx(k, em) poe o pico daqui a 'em' ms)
  const PICO = {jux_lamina_impacto: .9, jux_tempestade_explosao: 1.2, jux_rei_queda: .6, jux_nevasca_granizo: .6, jux_prisao_rastro: .3};
  const R = (...l) => ({roda: l});   // reveza a cada chamada (ataques repetidos, estalactites)
  // acao -> canal -> sons pela ordem em que a acao chama. null = fica calado (outro som novo ja cobre o momento).
  // canais: sword (swordSfx), golpe (golpeSfx), frost (frostSfx), hit (acerto no inimigo), 'som:<nome>' (som(nome))
  const MAPA = {
    attack: {sword: R('jux_corte_a', 'jux_corte_b', 'jux_corte_c'), hit: R('jux_acerto_1', 'jux_acerto_2', 'jux_acerto_3')},
    blade: {'som:magia_gelo': ['jux_lamina_carga'], golpe: ['jux_lamina_impacto'], sword: ['jux_lamina_corte'], hit: [null]},
    storm: {'som:magia_gelo': ['jux_tempestade_conjura'], frost: ['jux_tempestade_vento'], golpe: ['jux_tempestade_explosao'], hit: R('jux_tempestade_acerto')},
    res: {'som:carga_gelo': ['jux_rei_carga'], frost: [null, 'jux_rei_rachaduras'], golpe: ['jux_rei_queda', 'jux_rei_estilhaca'], hit: R('jux_rei_lascas')},
    danca: {sword: ['jux_danca_1', 'jux_danca_2', 'jux_danca_3', 'jux_danca_4', 'jux_danca_5'], hit: ['jux_danca_acerto', 'jux_danca_acerto', 'jux_danca_acerto', 'jux_danca_x', null]},
    escudo: {sword: ['jux_escudo_ergue'], frost: ['jux_escudo_forma'], golpe: ['jux_escudo_crava'], hit: [null]},
    contra: {sword: ['jux_escudo_espinhos'], hit: ['jux_escudo_espinho_acerto', null], frost: ['jux_escudo_quebra']},
    zero: {'som:carga_gelo': ['jux_zero_carga'], frost: [null, 'jux_zero_congela', 'jux_zero_onda', 'jux_zero_explosao', 'jux_zero_desfaz'],
      sword: ['jux_zero_crava', 'jux_zero_corte'], golpe: ['jux_zero_transforma', 'jux_zero_pilares', 'jux_zero_tempo'], hit: [null]},
    nevasca: {sword: ['jux_nevasca_ergue'], frost: ['jux_nevasca_vento'], golpe: ['jux_nevasca_granizo'], hit: R('jux_nevasca_acerto')},
    prisao: {frost: ['jux_prisao_carga', 'jux_prisao_forma'], sword: ['jux_prisao_corte'], golpe: ['jux_prisao_rastro'], hit: ['jux_prisao_fecha', null]},
    espelho: {sword: ['jux_espelho_runas'], frost: ['jux_espelho_forma'], 'som:magia_brilho': ['jux_espelho_pronto']},
    reflete: {'som:magia_brilho': ['jux_espelho_reflete'], frost: [null], hit: ['jux_espelho_raio', null]},
    espelhoSome: {frost: ['jux_espelho_quebra']},
    res3: {'som:carga_gelo': ['jux_coroa_carga'], frost: [null, 'jux_coroa_vira'], sword: ['jux_coroa_ergue', 'jux_coroa_cai'],
      'som:magia_brilho': ['jux_coroa_forma'], golpe: ['jux_coroa_eco'], hit: ['jux_coroa_impacto', null]},
    estalactites: {sword: ['jux_est_ergue'], frost: ['jux_est_nuvem'], golpe: R('jux_est_crava_1', 'jux_est_crava_2', 'jux_est_crava_3'), hit: [null]},
    coracao: {golpe: ['jux_coracao_crava'], 'som:magia_brilho': ['jux_coracao_pulso', 'jux_coracao_cura'], frost: [null]},
    aurora_b: {'som:magia_brilho': ['jux_aurora_desce', 'jux_aurora_coluna'], sword: ['jux_aurora_ergue'], frost: [null], golpe: ['jux_aurora_runa']},
    kelvin: {frost: ['jux_kelvin_aura', 'jux_kelvin_explode'], 'som:whoosh': ['jux_kelvin_avanco'], sword: ['jux_kelvin_saque'], golpe: ['jux_kelvin_corte'], hit: [null]},
    final: {'som:carga_gelo': ['jux_final_carga'], frost: [null, 'jux_final_transforma', 'jux_final_explosao'], sword: ['jux_final_ergue'],
      'som:magia_brilho': ['jux_final_lua'], 'som:whoosh': ['jux_final_cometa'], golpe: ['jux_final_estilhaco'], hit: [null]},
    lanca: {frost: ['jux_lanca_carga'], sword: ['jux_lanca_arremesso'], golpe: ['jux_lanca_impacto'], hit: [null]},
    guard: {'som:defender': ['jux_defender']},
  };

  // carrega os arquivos (mesmo formato do loader do index.html: ogg se o navegador toca, senao mp3)
  const nomes = new Set();
  for (const m of Object.values(MAPA)) for (const v of Object.values(m)) for (const n of (Array.isArray(v) ? v : v.roda)) if (n) nomes.add(n);
  const ogg = new Audio().canPlayType('audio/ogg; codecs="vorbis"');
  for (const n of nomes) {
    const a = new Audio(); a.preload = 'auto'; SOM[n] = a;
    (window.depois || (f => f()))(() => { a.src = 'assets/sfx/novos/' + n + (ogg ? '.ogg' : '.mp3') + '?v=1'; });
  }

  function toca(n, vol, em, pico) {
    const a = SOM[n]; if (!a) return;
    try {
      const c = a.cloneNode(); c.volume = Math.max(0, Math.min(1, vol ?? .8));
      const off = (pico || 0) - (em || 0) / 1000, go = () => c.play().catch(() => {});
      if (off > 0) { c.currentTime = off; go(); } else if (off < 0) setTimeout(go, -off * 1000); else go();
    } catch (e) {}
  }

  // qual acao do Jux esta tocando agora (null = nenhuma: tudo como antes)
  let ctx = null;
  const roda = {};
  const ehJux = () => typeof hero === 'undefined' || !hero || !hero.quem || hero.quem === 'jux';
  const emCine = () => typeof cine !== 'undefined' && !!cine;
  // devolve undefined (sem troca: toca o som antigo), null (calado) ou o nome do arquivo novo
  function pega(canal) {
    if (!ctx || emCine()) return undefined;
    const m = MAPA[ctx.k], v = m && m[canal];
    if (!v) return undefined;
    if (!Array.isArray(v)) { const k = ctx.k + '|' + canal, i = roda[k] || 0; roda[k] = i + 1; return v.roda[i % v.roda.length]; }
    const i = ctx.c[canal] || 0; ctx.c[canal] = i + 1;
    return v[Math.min(i, v.length - 1)];
  }

  const oSword = swordSfx, oGolpe = golpeSfx, oFrost = frostSfx, oSom = som, oHit = hitSfx;
  window.swordSfx = function () { const n = pega('sword'); if (n === undefined) return oSword.apply(this, arguments); if (n) toca(n, .75); };
  window.golpeSfx = function (k, em, vol) { const n = pega('golpe'); if (n === undefined) return oGolpe.apply(this, arguments); if (n) toca(n, vol || .8, em, PICO[n]); };
  window.frostSfx = function (vol) { const n = pega('frost'); if (n === undefined) return oFrost.apply(this, arguments); if (n) toca(n, vol || .8); };
  window.som = function (nome, vol) {
    const n = ctx ? pega('som:' + nome) : undefined;
    if (n === undefined) return oSom.apply(this, arguments); if (n) toca(n, vol ?? .8);
  };
  // acerto no inimigo: golpes seguidos em menos de 90 ms tocam uma vez so (igual ao hitSfx antigo)
  let ultHit = 0;
  window.hitSfx = function () {
    if (!ctx || emCine() || !ehJux()) return oHit.apply(this, arguments);
    const now = performance.now(); if (now - ultHit < 90) return; ultHit = now;
    const n = pega('hit'); if (n === undefined) return oHit.apply(this, arguments); if (n) toca(n, .75);
  };

  // marca o contexto enquanto a acao roda (async) ou durante a chamada (sync)
  function embrulha(nome, k, async, soJux) {
    const f = window[nome]; if (typeof f !== 'function') return;
    window[nome] = async
      ? async function () { if (soJux && !ehJux()) return f.apply(this, arguments); const ant = ctx; ctx = {k, c: {}}; try { return await f.apply(this, arguments); } finally { ctx = ant; } }
      : function () { const ant = ctx; ctx = {k, c: {}}; try { return f.apply(this, arguments); } finally { ctx = ant; } };
  }
  const ACOES = {attack: 'actAttack', blade: 'actBlade', storm: 'actStorm', res: 'actResonance', danca: 'actDanca', escudo: 'actEscudo', zero: 'actZero',
    nevasca: 'actNevasca', prisao: 'actPrisao', espelho: 'actEspelho', res3: 'actCoroa', estalactites: 'actEstalactites', coracao: 'actCoracao',
    aurora_b: 'actAurora', kelvin: 'actKelvin', final: 'actFinal', lanca: 'actLanca', guard: 'actGuard'};
  for (const [k, f] of Object.entries(ACOES)) embrulha(f, k, true, true);
  embrulha('contraEscudo', 'contra', true, false);   // espinhos do Escudo de Cristal (turno do inimigo)
  embrulha('refleteMagia', 'reflete', false, false); // Espelho Glacial devolvendo a magia
  embrulha('espelhoSome', 'espelhoSome', false, false);
})();
