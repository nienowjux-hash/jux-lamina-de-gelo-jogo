/* ============ FICHA DAS HABILIDADES (menu -> Habilidades): os numeros que o jogo usa de verdade ============
   Medido no codigo da batalha (index.html, funcoes act; bino_batalha.js, ACOES_BINO): poder de cada golpe dividido pelo ataque
   normal (Jux 34, Bino 40) = % do ataque. Cada linha da ficha e [rotulo, valor, cor?]. O dano final ainda muda com
   ATQ/ATQ.M, defesa e fraqueza do inimigo, critico e Quebra (x1,5). */
'use strict';
const ATQ_BASE = {jux: 34, bino: 40, felipe: 34};
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
  // ---------------- Felipe (ataque normal = 34, flecha física; as habilidades são Vento) ----------------
  f_certeira:[['Dano', pct(48, 'felipe') + ' (físico, Vento)', C_DANO], ['Alvo', '1 inimigo'], ['Especial', 'crítico garantido se o alvo estiver Marcado', C_EST]],
  f_soneca:  [['Recupera', '25% do MP e 10% da vida', C_CURA], ['Efeito', 'o próximo ataque é crítico garantido (170% de dano)', C_EST], ['Custo', 'grátis, mas gasta a vez']],
  f_dupla:   [['Dano', '2 flechas de ' + pct(30, 'felipe') + ' = ' + pct(60, 'felipe') + ' (físico, Vento)', C_DANO], ['Alvo', 'a 2ª flecha vai em outro inimigo, se houver']],
  f_falcao:  [['Dano', pct(24, 'felipe') + ' (físico, Vento)', C_DANO], ['Efeito', 'Marcado por 3 turnos: recebe +25% de dano de todo o time', C_EST], ['Combo', 'a Flecha Certeira num Marcado é crítico garantido', C_EST]],
  f_rajada:  [['Dano', pct(36, 'felipe') + ' em cada inimigo (físico, Vento)', C_DANO], ['Alvo', 'todos os inimigos'], ['Efeito', 'atrasa a barra de turno deles', C_EST]],
  f_ninar:   [['Dano', pct(18, 'felipe') + ' (físico, Vento)', C_DANO], ['Efeito', 'Sono por 2 turnos (acorda se apanhar)', C_EST], ['Atenção', 'chefes costumam ser imunes', '#ff9a9a']],
  f_corrente:[['Efeito', 'VEL +30% no time inteiro (a barra de turno enche mais rápido)', C_EST], ['Duração', '3 turnos de cada herói']],
  f_chuva:   [['Dano', '3 ondas de ' + pct(20, 'felipe') + ' = ' + pct(60, 'felipe') + ' em cada inimigo (físico, Vento)', C_DANO], ['Alvo', 'todos os inimigos'], ['Quebra', 'alta (muitos acertos)']],
  f_perfurante:[['Dano', pct(70, 'felipe') + ' (físico, Vento)', C_DANO], ['Alvo', '1 inimigo'], ['Especial', 'ignora metade da defesa e enche muito a Quebra', C_DANO]],
  f_brisa:   [['Cura', '18% da vida máxima de cada herói', C_CURA], ['Alvo', 'o time inteiro'], ['Extra', 'tira Lento, Cego e Sono', C_CURA]],
  f_furacao: [['Efeito', 'desvia de TODO golpe por 2 turnos', C_EST], ['Revide', 'cada desvio devolve uma flecha de ' + pct(30, 'felipe'), C_DANO], ['Cinemática', 'sim']],
  f_ceu:     [['Dano', pct(150, 'felipe') + ' (físico, Vento)', C_DANO], ['Alvo', '1 inimigo'], ['Quebra', 'enorme', C_DANO], ['Cinemática', 'sim']],
  f_tempestade:[['Dano', '2 ondas de ' + pct(72, 'felipe') + ' = ' + pct(144, 'felipe') + ' em cada inimigo (físico, Vento)', C_DANO], ['Alvo', 'todos os inimigos'], ['Efeito', 'apaga os bônus deles', C_EST], ['Cinemática', 'sim']],
};
