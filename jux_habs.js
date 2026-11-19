/* ============ HABILIDADES DO JUX (compartilhado: batalha index.html e menu da vila/trilha) ============
   id, nome, mp, nivel (em que o Jux aprende), magia (aparece em Magia) ou Ressonancia (barra cheia), el (elemento), desc.
   O jogador pode LIGAR/DESLIGAR cada uma no menu -> Habilidades (JOGO.habOff[id]); desligada nao aparece na batalha nem no AUTO. */
'use strict';
const HAB_JUX = [
  {id: 'blade', nome: 'Lâmina Glacial', mp: 8, nivel: 1, magia: true, feito: true, el: 'Gelo',
   desc: 'Corte de gelo em linha: dano de gelo em um inimigo.'},
  {id: 'storm', nome: 'Tempestade de Gelo', mp: 20, nivel: 5, magia: true, feito: true, el: 'Gelo',
   desc: 'Invoca uma tempestade que despeja estacas de gelo sobre o inimigo.'},
  {id: 'res', nome: 'Ressonância: Rei do Inverno', nivel: 8, feito: true, el: 'Gelo', ressonancia: true,
   desc: 'Com a barra de Ressonância cheia: espada gigante de gelo cai sobre um alvo e o prende numa tumba.'},
  {id: 'danca', nome: 'Dança Glacial', mp: 14, nivel: 12, magia: true, feito: true, el: 'Gelo',
   desc: 'Sequência de cortes rápidos de gelo.'},
  {id: 'escudo', nome: 'Escudo de Cristal', mp: 12, nivel: 16, magia: true, feito: true, el: 'Gelo',
   desc: 'Ergue uma cúpula de cristal: o dano recebido cai pela metade.'},
  {id: 'lanca', nome: 'Lança Boreal', mp: 18, nivel: 20, magia: true, feito: true, el: 'Gelo',
   desc: 'Arremessa uma lança de gelo que atravessa o inimigo.'},
  {id: 'nevasca', nome: 'Nevasca Eterna', mp: 30, nivel: 25, magia: true, feito: true, el: 'Gelo',
   desc: 'Uma nevasca cobre o campo e castiga os inimigos no começo de cada turno deles.'},
  {id: 'zero', nome: 'Ressonância II: Zero Absoluto', nivel: 30, feito: true, el: 'Gelo', ressonancia: true,
   desc: 'Com a barra cheia: o Jux vira gelo branco, prende todos os inimigos em pilares e os quebra de uma vez.'},
  {id: 'prisao', nome: 'Prisão de Gelo', mp: 22, nivel: 36, magia: true, feito: true, el: 'Gelo',
   desc: 'Prende o inimigo numa jaula de gelo: ele perde turnos.'},
  {id: 'espelho', nome: 'Espelho Glacial', mp: 18, nivel: 42, magia: true, feito: true, el: 'Gelo',
   desc: 'Um espelho de gelo reflete a próxima magia do inimigo de volta contra ele.'},
  {id: 'res3', nome: 'Ressonância III: Coroa Boreal', nivel: 50, feito: true, el: 'Gelo', ressonancia: true,
   desc: 'Com a barra cheia: lâminas de aurora caem do céu sobre todos os inimigos.'},
  {id: 'estalactites', nome: 'Chuva de Estalactites', mp: 34, nivel: 58, magia: true, feito: true, el: 'Gelo',
   desc: 'Estacas de gelo despencam do teto sobre todos os inimigos.'},
  {id: 'coracao', nome: 'Coração do Inverno', mp: 40, nivel: 66, magia: true, feito: true, el: 'Gelo',
   desc: 'Cura 40% da vida, regenera por 3 turnos e ergue um domo de proteção.'},
  {id: 'aurora_b', nome: 'Aurora Boreal', mp: 45, nivel: 75, magia: true, feito: true, el: 'Gelo',
   desc: 'Estado Aurora: ATQ e ATQ.M +25% por 4 turnos.'},
  {id: 'kelvin', nome: 'Lâmina Zero Kelvin', mp: 50, nivel: 85, magia: true, feito: true, el: 'Gelo',
   desc: 'Um corte que congela o tempo e ignora metade da defesa do inimigo.'},
  {id: 'final', nome: 'Ressonância Final: Era do Gelo', nivel: 100, feito: true, el: 'Gelo', ressonancia: true,
   desc: 'Com a barra cheia: geleiras brotam sob cada inimigo e o campo inteiro congela.'},
];
// o jogador desliga habilidades no menu (nao aparecem na batalha nem no AUTO)
const habLigada = id => !(typeof JOGO === 'object' && JOGO.habOff && JOGO.habOff[id]);
