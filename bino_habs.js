/* ============ BINO, o barbaro tanque (aliado): habilidades, atributos e estados ============
   Carregar DEPOIS de combate.js (usa GOLPES_JUX e ESTADOS). So dano FISICO, sem elemento. Calado, bruto, protetor.
   Os golpes gastam MP (o "folego" dele) e o ataque normal e de graca. Arte: ref/bino*, PROMPTS_BINO.md, tools/cut_bino.py. */
'use strict';
const HAB_BINO = [
  {id: 'b_marreta', nome: 'Golpe de Marreta', mp: 6, nivel: 1, alvo: 'um', feito: true, desc: 'Pancada pesada de marreta em um inimigo.'},
  {id: 'b_provocar', nome: 'Provocar', mp: 4, nivel: 5, alvo: 'eu', feito: true, desc: 'Bate no peito e ruge: os inimigos miram nele por 3 turnos e ele recebe menos dano.'},
  {id: 'b_quebra', nome: 'Quebra-Crânio', mp: 10, nivel: 10, alvo: 'um', feito: true, desc: 'Salta e esmaga de cima: enche a barra de Quebra e pode atordoar.'},
  {id: 'b_muralha', nome: 'Muralha', mp: 12, nivel: 16, alvo: 'eu', feito: true, desc: 'Ergue um muro de pedra: bloqueia os próximos 2 golpes dos inimigos (em qualquer aliado) e o dano cai para 25%. O muro racha no primeiro e cai no segundo.'},
  {id: 'b_grito', nome: 'Grito de Guerra', mp: 14, nivel: 22, alvo: 'time', feito: true, desc: 'Ruge para o time: ATQ e DEF +25% por 3 turnos.'},
  {id: 'b_onda', nome: 'Onda de Choque', mp: 18, nivel: 28, alvo: 'todos', feito: true, desc: 'Marretada no chão: atinge TODOS os inimigos e pode deixá-los lentos.'},
  {id: 'b_armadura', nome: 'Armadura de Pedra', mp: 16, nivel: 36, alvo: 'eu', feito: true, desc: 'O corpo vira pedra: recebe bem menos dano por 4 turnos e revida golpes físicos.'},
  {id: 'b_giratoria', nome: 'Marreta Giratória', mp: 24, nivel: 44, alvo: 'todos', feito: true, desc: 'Gira com a marreta atingindo todos os inimigos duas vezes.'},
  {id: 'b_ariete', nome: 'Investida de Aríete', mp: 22, nivel: 52, alvo: 'um', feito: true, desc: 'Corre e atropela com o ombro: dano alto e empurra o inimigo.'},
  {id: 'b_sangue', nome: 'Sangue de Pedra', mp: 28, nivel: 62, alvo: 'eu', feito: true, desc: 'Respira fundo: recupera 35% da vida e remove estados ruins.'},
  {id: 'b_furia', nome: 'Fúria Bárbara', mp: 30, nivel: 74, alvo: 'eu', feito: true, especial: true, desc: 'ATQ +50% e DEF -20% por 6 turnos do Bino; revida todo golpe que recebe.'},
  {id: 'b_esmaga', nome: 'Esmaga-Montanhas', mp: 40, nivel: 86, alvo: 'um', feito: true, especial: true, desc: 'Salto altíssimo e golpe colossal em um inimigo; ignora metade da defesa.'},
  {id: 'b_queda', nome: 'Queda da Montanha', mp: 60, nivel: 100, alvo: 'todos', feito: true, especial: true, suprema: true, desc: 'A marreta vira uma montanha de pedra que cai sobre todos: dano enorme e atordoa.'},
];
// que tipo e quanto enche a barra de Quebra (combate.js GOLPES_JUX: mesmo formato)
if (typeof GOLPES_JUX !== 'undefined') Object.assign(GOLPES_JUX, {
  b_atq: {t: 'f', el: null, q: 1.1}, b_marreta: {t: 'f', el: null, q: 1.6}, b_quebra: {t: 'f', el: null, q: 3},
  b_onda: {t: 'f', el: null, q: 1.2}, b_giratoria: {t: 'f', el: null, q: 1.3}, b_ariete: {t: 'f', el: null, q: 2.2},
  b_esmaga: {t: 'f', el: null, q: 3.5, perfura: .5}, b_queda: {t: 'f', el: null, q: 4}, b_contra: {t: 'f', el: null, q: .6},
});
// estados do Bino (turnos contam nos turnos DELE). recebido = multiplica o dano recebido; dano = o que ele causa
if (typeof ESTADOS !== 'undefined') Object.assign(ESTADOS, {
  muro: {nome: 'Muralha', cor: '#c8c0b4', ruim: false},
  provocar: {nome: 'Provocar', cor: '#ffb27a', ruim: false, recebido: .8},
  grito: {nome: 'Grito de Guerra', cor: '#ffd27a', ruim: false, dano: 1.25, recebido: .8},
  pedra: {nome: 'Armadura de Pedra', cor: '#b8b0a8', ruim: false, recebido: .55},
  furia: {nome: 'Fúria Bárbara', cor: '#ff6a5a', ruim: false, dano: 1.5, recebido: 1.25},
});
// atributos por nivel: bem mais HP e DEF que o Jux, ATQ alto, VEL baixa, quase nada de magia
function statusBino(n, semEquip) {   // semEquip: so a base do nivel (o equipamento do menu Grupo soma por cima)
  n = Math.max(1, Math.min(100, n | 0));
  const r = {hp: Math.round(400 + 17 * (n - 1)), mp: Math.round(40 + 1.2 * (n - 1)), atk: Math.round(40 + 2.2 * (n - 1)),
    def: Math.round(14 + 2 * (n - 1)), atkm: 6, defm: Math.round(10 + 1.2 * (n - 1)), vel: Math.round(8 + .3 * (n - 1)),
    sor: 8, crit: 6, critd: 150, esq: 2, esp_: {}};
  r.base = Object.assign({}, r);
  if (!semEquip && typeof JOGO === 'object' && typeof bonusEquipDe === 'function') {
    const e = bonusEquipDe('bino');
    for (const k of ['hp', 'mp', 'atk', 'def', 'atkm', 'defm', 'vel', 'sor', 'crit', 'esq']) if (e[k]) r[k] += e[k];
    r.eq = e;
  }
  return r;
}
