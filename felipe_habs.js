/* ============ FELIPE, o arqueiro do vento (aliado, Cap. 3 Parte C2): habilidades, atributos e estados ============
   FICHA_CAP3_FELIPE_BATALHA.md. Carregar DEPOIS de combate.js (usa GOLPES_JUX e ESTADOS). Rápido, crítico alto, pouca vida.
   Elemento Vento nas habilidades; o ataque normal é uma flecha física. feito: false = ainda sem arte (entra na C2b/C2c). */
'use strict';
const HAB_FELIPE = [
  {id: 'f_certeira', nome: 'Flecha Certeira', mp: 5, nivel: 1, alvo: 'um', feito: true, desc: 'Um tiro preciso de vento em um inimigo. Crítico garantido se o alvo estiver Marcado.'},
  {id: 'f_soneca', nome: 'Soneca', mp: 0, nivel: 5, alvo: 'eu', feito: true, desc: 'Cochila 1 turno: recupera 25% do MP e 10% da vida, e o próximo ataque dele é crítico garantido.'},
  {id: 'f_dupla', nome: 'Flecha Dupla', mp: 8, nivel: 10, alvo: 'um', feito: true, desc: 'Duas flechas seguidas (no mesmo inimigo ou em dois).'},
  {id: 'f_falcao', nome: 'Olho de Falcão', mp: 10, nivel: 16, alvo: 'um', feito: true, desc: 'Uma flecha leve que Marca o inimigo por 3 turnos: ele recebe +25% de dano de todo o time.'},
  {id: 'f_rajada', nome: 'Rajada', mp: 14, nivel: 22, alvo: 'todos', feito: true, desc: 'Vento em todos os inimigos e atrasa o próximo turno deles.'},
  {id: 'f_ninar', nome: 'Flecha de Ninar', mp: 16, nivel: 28, alvo: 'um', feito: true, desc: 'O inimigo dorme por 2 turnos (acorda se apanhar).'},
  {id: 'f_corrente', nome: 'Corrente de Ar', mp: 18, nivel: 36, alvo: 'time', feito: true, desc: 'O time inteiro: VEL +30% por 3 turnos.'},
  {id: 'f_chuva', nome: 'Chuva de Flechas', mp: 24, nivel: 44, alvo: 'todos', feito: true, desc: 'Três ondas de flechas caem em todos os inimigos.'},
  {id: 'f_perfurante', nome: 'Flecha Perfurante', mp: 22, nivel: 52, alvo: 'um', feito: true, desc: 'Ignora metade da defesa e enche muito a barra de Quebra.'},
  {id: 'f_brisa', nome: 'Brisa Leve', mp: 26, nivel: 62, alvo: 'time', feito: true, desc: 'Cura leve no time inteiro e tira Lento, Cegueira e Sono.'},
  {id: 'f_furacao', nome: 'Olho do Furacão', mp: 30, nivel: 74, alvo: 'eu', feito: true, especial: true, desc: 'Por 2 turnos desvia de todo golpe e revida cada desvio com uma flecha.'},
  {id: 'f_ceu', nome: 'Flecha do Céu', mp: 40, nivel: 86, alvo: 'um', feito: true, especial: true, desc: 'Uma lança de vento cai do céu em um inimigo: dano colossal.'},
  {id: 'f_tempestade', nome: 'Tempestade do Sul', mp: 60, nivel: 100, alvo: 'todos', feito: true, especial: true, suprema: true, desc: 'Um furacão gigante varre todos os inimigos: dano enorme e apaga os bônus deles.'},
];
// tipo de cada golpe e quanto enche a barra de Quebra (combate.js GOLPES_JUX: mesmo formato). O ataque normal é físico, as habilidades são Vento
if (typeof GOLPES_JUX !== 'undefined') Object.assign(GOLPES_JUX, {
  f_atq: {t: 'f', el: null, q: 1}, f_certeira: {t: 'f', el: 'vento', q: 1.4}, f_dupla: {t: 'f', el: 'vento', q: 1},
  f_rajada: {t: 'f', el: 'vento', q: 1.1}, f_chuva: {t: 'f', el: 'vento', q: 1}, f_perfurante: {t: 'f', el: 'vento', q: 3.2, perfura: .5}, f_falcao: {t: 'f', el: 'vento', q: .8}, f_ninar: {t: 'f', el: 'vento', q: .6},
  f_ceu: {t: 'f', el: 'vento', q: 3.5}, f_tempestade: {t: 'f', el: 'vento', q: 4}, f_contra: {t: 'f', el: 'vento', q: .5},
});
// estados do Felipe (o Sono já existe no combate.js)
if (typeof ESTADOS !== 'undefined') Object.assign(ESTADOS, {
  soneca: {nome: 'Crítico pronto', cor: '#a8f0a0', ruim: false},   // depois da Soneca: o próximo ataque é crítico garantido (some no golpe)
  marcado: {nome: 'Marcado', cor: '#d8ffb0', ruim: true, recebido: 1.25},
  furacao: {nome: 'Olho do Furacão', cor: '#c8ffd8', ruim: false},
  corrente: {nome: 'Corrente de Ar', cor: '#b8ffc8', ruim: false, vel: 1.3},   // Corrente de Ar: barra de turno 30% mais rápida
});
// atributos por nível: pouca vida, a VEL e o crítico mais altos do time, ATQ médio
function statusFelipe(n, semEquip) {
  n = Math.max(1, Math.min(100, n | 0));
  const r = {hp: Math.round(300 + 10.1 * (n - 1)), mp: Math.round(50 + 2.32 * (n - 1)), atk: Math.round(34 + 1.98 * (n - 1)),
    def: Math.round(10 + 1.4 * (n - 1)), atkm: Math.round(12 + 1.1 * (n - 1)), defm: Math.round(12 + 1.5 * (n - 1)), vel: Math.round(16 + .45 * (n - 1)),
    sor: Math.round(14 + .5 * (n - 1)), crit: 15, critd: 170, esq: 8, esp_: {},
    // atributos de base do menu Status: arqueiro = muita VEL e SOR, FOR média, pouco VIG
    for: Math.round(11 + 1.5 * (n - 1)), vig: Math.round(9 + 1.2 * (n - 1)), mag: Math.round(7 + .8 * (n - 1)), esp: Math.round(9 + 1 * (n - 1))};
  r.base = Object.assign({}, r);
  if (!semEquip && typeof JOGO === 'object' && typeof bonusEquipDe === 'function') {
    const e = bonusEquipDe('felipe');
    for (const k of ['hp', 'mp', 'atk', 'def', 'atkm', 'defm', 'vel', 'sor', 'crit', 'esq']) if (e[k]) r[k] += e[k];
    r.eq = e;
    // Eco do Felipe: mesma conta do Jux e do Bino
    if (typeof bonusEcos === 'function') {
      const B = bonusEcos('felipe'), F = B.flat || {};
      for (const k of ['hp', 'mp', 'atk', 'def', 'atkm', 'defm']) if (F[k] || B.pct[k]) r[k] = Math.round((r[k] + (F[k] || 0)) * (1 + (B.pct[k] || 0)));
      for (const k of ['crit', 'esq', 'vel']) if (B.soma[k]) r[k] += B.soma[k];
      r.esp_ = Object.assign({}, r.esp_, B.esp);
    }
  }
  return r;
}
