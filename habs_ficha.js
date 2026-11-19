/* ============ FICHA DAS HABILIDADES (menu -> Habilidades): os numeros que o jogo usa de verdade ============
   Medido no codigo da batalha (index.html, funcoes act; bino_batalha.js, ACOES_BINO): poder de cada golpe dividido pelo ataque
   normal (Jux 34, Bino 40) = % do ataque. Cada linha da ficha e [rotulo, valor, cor?]. O dano final ainda muda com
   ATQ/ATQ.M, defesa e fraqueza do inimigo, critico e Quebra (x1,5). */
'use strict';
const ATQ_BASE = {jux: 34, bino: 40};
const pct = (poder, quem) => Math.round(poder / ATQ_BASE[quem] * 100) + '%';
const C_DANO = '#ffb38a', C_CURA = '#7dffa8', C_DEF = '#8fd0ff', C_EST = '#d9b8ff';
const FICHA_HAB = {
  // ---------------- Jux ----------------
  blade:   [['Dano', pct(62, 'jux') + ' (mágico, Gelo)', C_DANO], ['Alvo', '1 inimigo'], ['Quebra', 'média']],
  storm:   [['Dano', '3 golpes de ' + pct(52, 'jux') + ' = ' + pct(156, 'jux') + ' (mágico, Gelo)', C_DANO], ['Alvo', '1 inimigo'], ['Efeito', 'Lento por 2 turnos (o inimigo age bem menos)', C_EST]],
  res:     [['Dano', '6 golpes de ' + pct(70, 'jux') + ' = ' + pct(420, 'jux') + ' (mágico, Gelo)', C_DANO], ['Alvo', '1 inimigo'], ['Custo', 'barra de Ressonância cheia'], ['Efeito', 'prende o alvo numa tumba de gelo', C_EST]],
  danca:   [['Dano', '3 cortes de ' + pct(20, 'jux') + ' + golpe final de ' + pct(44, 'jux') + ' = ' + pct(104, 'jux') + ' (físico, Gelo)', C_DANO], ['Alvo', '1 inimigo'], ['Quebra', 'alta (muitos golpes)']],
  escudo:  [['Defesa', 'o dano recebido cai pela METADE (−50%)', C_DEF], ['Duração', 'os próximos 3 golpes recebidos'], ['Extra', 'soma com Defender (−75% juntos)', C_DEF]],
  lanca:   [['Dano', pct(70, 'jux') + ' (físico e mágico, Gelo)', C_DANO], ['Alvo', '1 inimigo'], ['Combo', 'em inimigo CONGELADO quebra o gelo e o dano dobra (' + pct(140, 'jux') + ')', C_DANO]],
  nevasca: [['Dano', pct(30, 'jux') + ' em cada inimigo, no começo do turno deles', C_DANO], ['Alvo', 'todos os inimigos'], ['Duração', '3 turnos (campo de nevasca)'], ['Efeito', 'o frio deixa os inimigos lentos', C_EST]],
  zero:    [['Dano', pct(150, 'jux') + ' em cada inimigo (mágico, Gelo)', C_DANO], ['Alvo', 'todos os inimigos'], ['Custo', 'barra de Ressonância cheia'], ['Efeito', 'congela todos', C_EST]],
  prisao:  [['Dano', pct(30, 'jux') + ' (mágico, Gelo)', C_DANO], ['Alvo', '1 inimigo'], ['Efeito', 'preso na jaula: perde 2 turnos', C_EST]],
  espelho: [['Defesa', 'reflete a PRÓXIMA magia do inimigo de volta contra ele', C_DEF], ['Dano refletido', '150% do golpe dele', C_DANO]],
  res3:    [['Dano', pct(170, 'jux') + ' em cada inimigo (mágico, Gelo)', C_DANO], ['Alvo', 'todos os inimigos'], ['Custo', 'barra de Ressonância cheia'], ['Quebra', 'muito alta']],
  estalactites: [['Dano', pct(48, 'jux') + ' em cada inimigo (mágico, Gelo)', C_DANO], ['Alvo', 'todos os inimigos']],
  coracao: [['Cura', '40% da vida máxima na hora', C_CURA], ['Regen', '+6% da vida por turno, por 3 turnos', C_CURA], ['Defesa', 'domo: −30% de dano recebido por 3 turnos', C_DEF]],
  aurora_b:[['Bônus', 'dano +25% (físico e mágico)', C_EST], ['Duração', '4 turnos'], ['Alvo', 'o Jux']],
  kelvin:  [['Dano', pct(150, 'jux') + ' (físico, Gelo)', C_DANO], ['Alvo', '1 inimigo'], ['Especial', 'ignora METADE da defesa do inimigo', C_DANO]],
  final:   [['Dano', pct(240, 'jux') + ' em cada inimigo (mágico, Gelo)', C_DANO], ['Alvo', 'todos os inimigos'], ['Custo', 'barra de Ressonância cheia'], ['Efeito', 'o campo inteiro congela', C_EST]],
  // ---------------- Bino (ataque normal = 40, só dano físico) ----------------
  b_marreta: [['Dano', pct(52, 'bino') + ' (físico)', C_DANO], ['Alvo', '1 inimigo']],
  b_provocar:[['Efeito', 'os inimigos miram SÓ no Bino', C_EST], ['Defesa', 'o Bino recebe −20% de dano', C_DEF], ['Duração', '3 turnos']],
  b_quebra:  [['Dano', pct(64, 'bino') + ' (físico)', C_DANO], ['Alvo', '1 inimigo'], ['Efeito', '40% de chance de atordoar (perde 1 turno); Quebra muito alta', C_EST]],
  b_muralha: [['Defesa', 'bloqueia os próximos 2 golpes em QUALQUER aliado: o dano cai para 25% (−75%)', C_DEF], ['Alvo', 'o time todo']],
  b_grito:   [['Bônus', 'dano +25% e dano recebido −20%', C_EST], ['Duração', '3 turnos'], ['Alvo', 'o time todo']],
  b_onda:    [['Dano', pct(48, 'bino') + ' em cada inimigo (físico)', C_DANO], ['Alvo', 'todos os inimigos'], ['Efeito', '40% de chance de Lento por 2 turnos', C_EST]],
  b_armadura:[['Defesa', 'dano recebido −45%', C_DEF], ['Duração', '4 turnos'], ['Extra', 'revida golpes físicos', C_DANO]],
  b_giratoria:[['Dano', '2 voltas de ' + pct(42, 'bino') + ' = ' + pct(84, 'bino') + ' em cada inimigo (físico)', C_DANO], ['Alvo', 'todos os inimigos']],
  b_ariete:  [['Dano', pct(88, 'bino') + ' (físico)', C_DANO], ['Alvo', '1 inimigo'], ['Efeito', 'empurra o inimigo', C_EST]],
  b_sangue:  [['Cura', '35% da vida máxima do Bino', C_CURA], ['Extra', 'remove os estados ruins', C_CURA]],
  b_furia:   [['Bônus', 'dano +50%', C_DANO], ['Risco', 'recebe +25% de dano', '#ff9a9a'], ['Duração', '6 turnos do Bino'], ['Extra', 'revida todo golpe que recebe', C_DANO]],
  b_esmaga:  [['Dano', pct(120, 'bino') + ' (físico)', C_DANO], ['Alvo', '1 inimigo'], ['Especial', 'ignora metade da defesa', C_DANO]],
  b_queda:   [['Dano', pct(130, 'bino') + ' em cada inimigo (físico)', C_DANO], ['Alvo', 'todos os inimigos'], ['Efeito', '60% de chance de atordoar (perde 1 turno)', C_EST]],
};
