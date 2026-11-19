/* ============ DESCOBERTAS: explorar rende EXP, historia e recompensa ============
   Cada mapa tem marcos (ruinas, restos de acampamento, vistas, rastros). Chegar perto pela 1a vez abre uma fala (Jux, Bino, Aurora)
   e paga EXP (8% do nivel atual = ~1,5 luta). Achar TODOS os marcos do mapa paga um premio extra. Estado: JOGO.desc = [ids]. */
const DESCOBERTAS = [
  // ---- Trilha dos Pinheiros
  {id:'d_t_lanternas', regiao:'trilha', x:722, y:190, r:60, nome:'Lanternas do portão',
   fala:[['Jux','As lanternas azuis do portão ainda acesas. Alguém as mantém todos os dias.'],['Aurora','Os caçadores de Invernália, Portador. Eles acendem para os que não voltaram.']]},
  {id:'d_t_ponte', regiao:'trilha', x:800, y:395, r:55, nome:'Marcas sob a ponte',
   fala:[['Jux','Garras. Fundas. Na madeira da ponte e na pedra embaixo dela.'],['Bino','…Lobo grande. Passou aqui faz pouco.'],['Jux','Você sabe ler pegadas?'],['Bino','Sei ler fome.']]},
  {id:'d_t_lago', regiao:'trilha', x:560, y:640, r:70, nome:'Margem do lago congelado',
   fala:[['Jux','O gelo do lago é grosso e liso. Dá para patinar.'],['Aurora','Não é uma boa ideia, Portador.'],['Jux','Nunca é. É por isso que eu faço.']]},
  {id:'d_t_tronco', regiao:'trilha', x:300, y:745, r:60, nome:'Tronco do caçador',
   fala:[['Jux','Um tronco com marcas de machado e um nome riscado: HALVARD.'],['Aurora','Ele cortava lenha aqui… e seguiu trilha adentro. A última pista antes de ele sumir.']]},
  {id:'d_t_pedras', regiao:'trilha', x:1120, y:545, r:65, nome:'Pedras do santuário',
   fala:[['Jux','As pedras em volta do cristal têm runas antigas, quase apagadas.'],['Aurora','Palavras de proteção. Alguém as escreveu há muito tempo para manter o mal longe.']]},
  // pistas da missao "O amigo de neve do Tico" (CHEFE_BOLOTAO.md): so existem com a missao ativa e nao entram na contagem nem no premio da regiao
  {id:'d_t_chapeu', regiao:'trilha', extra:true, req:() => estadoMissao('amigo_floco') === 'ativa', x:360, y:700, r:60, nome:'Chapéu de balde',
   fala:[['Jux','Um chapéu de balde enferrujado, amassado, caído de lado perto do tronco.'],['Aurora','Quem usa um balde na cabeça, Portador, não tem cabeça de verdade. É um chapéu de boneco.'],['Jux','O Tico descreveu exatamente esse chapéu. Com orgulho.']]},
  {id:'d_t_rastro', regiao:'trilha', extra:true, req:() => estadoMissao('amigo_floco') === 'ativa', x:620, y:705, r:55, nome:'Rastro redondo',
   fala:[['Jux','Um sulco fundo e redondo na neve, de uma coisa muito grande rolando. Ele desce para o lago.'],['Bino','…Pesado.'],['Jux','Um boneco de neve não deveria deixar um rastro de carroça.']]},
  {id:'d_t_cenoura', regiao:'trilha', extra:true, req:() => estadoMissao('amigo_floco') === 'ativa', x:800, y:560, r:55, nome:'Cenoura no gelo',
   fala:[['Jux','Uma cenoura cravada no meio do gelo. Só dá para chegar aqui patinando.'],['Aurora','Ele deixou o nariz para trás, Portador. Ou o nariz fugiu dele.'],['Jux','Pista três. O dono disso está no lago.']]},
  // ---- Garganta Gelada
  {id:'d_g_arco', regiao:'garganta', x:150, y:640, r:70, nome:'O arco do sol negro',
   fala:[['Jux','Uma bandeira preta com um sol negro, rasgada ao meio. A Ordem passou por aqui.'],['Bino','…Ela já foi tirada daquele poste. Alguém a pendurou de novo.']]},
  {id:'d_g_diario', regiao:'garganta', x:330, y:365, r:60, nome:'Diário do Halvard',
   fala:[['Jux','Um diário de couro cravado numa tora. A letra é torta e firme.'],['Jux','"Dia 4: os lobos não fogem mais. Eles obedecem. Alguém os chama de noite."'],['Bino','…O Halvard escrevia assim. Eu o vi escrevendo.'],['Aurora','Guarde isso, Portador. Prova de que ele sabia do que estava vindo.']]},
  {id:'d_g_rastro', regiao:'garganta', x:420, y:520, r:70, nome:'Rastro de ferro',
   fala:[['Jux','Pegadas largas e fundas, de botas com sola de ferro. Saem do acampamento do caçador e vão para o fundo da garganta.'],['Bino','…Muito peso. Não é um lobo.'],['Aurora','Um goblin, Portador. Um que anda como se fosse dono do lugar.']]},
  {id:'d_g_bandeira', regiao:'garganta', x:900, y:480, r:70, nome:'Bandeirinha de osso',
   fala:[['Jux','Uma bandeirinha de pano e osso, com um dente de ferro pintado no meio.'],['Bino','…Marca de bando.'],['Jux','Um bando de goblins que fugiu de alguém e agora quer ter um nome. Eu entendo.']]},
  {id:'d_g_ponte', regiao:'garganta', x:740, y:420, r:70, nome:'Ponte do rio congelado',
   fala:[['Jux','Uma ponte de pedra e madeira sobre um rio que parou no tempo.'],['Aurora','O rio congelou de uma vez só, Portador. Em uma única noite. Isso não é inverno.']]},
  {id:'d_g_torre', regiao:'garganta', x:985, y:440, r:70, nome:'Torre de vigia em ruínas',
   fala:[['Jux','A torre está meio caída. Do alto, dava para ver a trilha inteira.'],['Bino','…A Ordem vigiava a trilha. Desde o começo.'],['Jux','Então não é perseguição. É um plano.']]},
  {id:'d_g_ritual', regiao:'garganta', x:1062, y:545, r:80, nome:'Círculo do ritual',
   fala:[['Jux','Um sol negro riscado no chão. Correntes soltas. Cristais roxos apagados.'],['Aurora','Eles prendiam algo aqui, Portador. E o drenavam.'],['Bino','…O lobo.'],['Jux','Ele não era só um monstro. Era uma bateria.']]},
  {id:'d_g_caverna', regiao:'garganta', x:1290, y:950, r:80, nome:'Boca da caverna do lobo',
   fala:[['Jux','Dentes de gelo, correntes grossas e uma luz azul fraca lá dentro.'],['Aurora','É aqui, Portador. Mas ainda não. Fique mais forte.']]},
  // ---- Caverna do lobo
  {id:'d_c_garras', regiao:'caverna', x:350, y:760, r:60, nome:'Túnel das correntes',
   fala:[['Jux','Correntes da Ordem presas na rocha e marcas de garras fundas no gelo.'],['Bino','…Ele tentou fugir. Muitas vezes.'],['Aurora','A Ordem não queria um prisioneiro, Portador. Queria uma fonte de poder.']]},
  {id:'d_c_ossos', regiao:'caverna', x:1270, y:225, r:60, nome:'O nicho dos ossos',
   fala:[['Jux','Ossos antigos atrás dos cristais. Grandes. De lobo.'],['Aurora','Outros vieram antes dele, Portador. Nenhum saiu.'],['Jux','Então a gente vai ser o primeiro grupo a sair com estilo.']]},
  {id:'d_c_acamp', regiao:'caverna', x:330, y:470, r:70, nome:'Acampamento da Ordem',
   fala:[['Jux','Um acampamento abandonado: estandarte do sol negro, tocha apagada, fogueira fria.'],['Bino','…Saíram com pressa.'],['Aurora','Os vigias da Ordem. Fugiram quando ouviram a gente chegando.']]},
  // ---- Vale dos Lobos
  {id:'d_v_carroca', regiao:'vale', extra:true, req:() => estadoMissao('carroca_tombada') === 'ativa', x:292, y:690, r:60, nome:'A carroça do Capitão',
   fala:[['Jux','Uma carroça tombada, caixotes abertos e nabo espalhado na neve. É a do Capitão.'],['Bino','…Arrastaram o baú.'],['Jux','Um rastro fundo na neve. Pesado. Indo para o meio do vale.']]},
  {id:'d_v_pegadas', regiao:'vale', extra:true, req:() => estadoMissao('carroca_tombada') === 'ativa', x:840, y:600, r:60, nome:'Pegadas gigantes',
   fala:[['Jux','Pegadas de lobo do tamanho da minha cabeça. Uma das patas arrasta: ele manca.'],['Aurora','Um lobo muito velho, Portador. E muito grande.']]},
  {id:'d_v_corrente', regiao:'vale', extra:true, req:() => estadoMissao('carroca_tombada') === 'ativa', x:650, y:585, r:55, nome:'Elo de corrente roxa',
   fala:[['Jux','Um elo de corrente roxa, mordido ao meio. Marca da Ordem.'],['Aurora','Tentaram acorrentar alguma coisa aqui, Portador. Ela arrebentou a corrente com os dentes.'],['Bino','…Na toca.']]},
  {id:'d_v_toca', regiao:'vale', x:724, y:556, r:80, nome:'A toca dos lobos',
   fala:[['Jux','Uma toca funda, costelas enormes na neve e pegadas do tamanho do meu escudo.'],['Bino','…Alfa.'],['Aurora','Os lobos daqui não têm olhos roxos, Portador. Estes são livres. E famintos.']]},
  {id:'d_p_acamp', regiao:'pico', x:300, y:655, r:80, nome:'O acampamento dos caçadores',
   fala:[['Jux','Barraca rasgada, lanças fincadas, fogueira fria. Ninguém volta aqui faz tempo.'],['Aurora','Caçadores vinham ao Pico atrás do lobo antigo, Portador. Poucos desceram.'],['Jux','Ótimo. Adoro lugares com estatística ruim.']]},
  {id:'d_p_cranio', regiao:'pico', x:560, y:235, r:70, nome:'O crânio gigante',
   fala:[['Jux','Isso é um crânio. De lobo. Do tamanho de uma casa.'],['Aurora','Um lobo de antes dos homens, Portador. O lobo antigo que vive aqui guarda os ossos do próprio ancestral.'],['Jux','Então não é um lugar de luta. É um túmulo. Vou falar baixo.']]},
  {id:'d_v_moinho', regiao:'vale', x:1110, y:330, r:80, nome:'O moinho congelado',
   fala:[['Jux','Um moinho com a roda presa no gelo. Alguém morava aqui e saiu com pressa.'],['Aurora','Os lobos tomaram o vale depois que a Ordem passou, Portador.'],['Jux','Então a Ordem nem precisou expulsar ninguém. Mandou os lobos fazerem isso.']]},
];
const PREMIO_DESC = {trilha:{gil:80, item:'hipocao', n:2, txt:'80 gil e 2 Hi-Poções'}, garganta:{gil:120, item:'fenix', n:1, txt:'120 gil e uma Pena de Fênix'}, vale:{gil:100, item:'eter', n:2, txt:'100 gil e 2 Éteres'}, caverna:{gil:150, item:'hipocao', n:2, txt:'150 gil e 2 Hi-Poções'}, pico:{gil:80, item:'elixir', n:1, txt:'80 gil e um Elixir'}};
const descRegiao = r => DESCOBERTAS.filter(d => d.regiao === r && !d.extra);
const descAtivas = r => DESCOBERTAS.filter(d => d.regiao === r && (!d.req || d.req()));
const descFeitas = r => descRegiao(r).filter(d => (JOGO.desc || []).includes(d.id)).length;
// EXP fora da luta (marcos, missoes): sobe de nivel igual a luta
function ganhaExpMapa(x) {
  x = Math.max(1, Math.round(x)); JOGO.exp = (JOGO.exp || 0) + x; let subiu = false;
  while (JOGO.nivel < NIVEL_MAX_J && JOGO.exp >= expProx(JOGO.nivel)) {JOGO.exp -= expProx(JOGO.nivel); JOGO.nivel++; subiu = true;}
  if (JOGO.nivel >= NIVEL_MAX_J) JOGO.exp = 0;
  return subiu;
}
function passoDescobertas() {
  if (typeof fala !== 'undefined' && fala || typeof uiAberto === 'function' && uiAberto() || typeof ab !== 'undefined' && ab.on || (typeof transicao !== 'undefined' && transicao)) return;
  for (const d of descAtivas(REGIAO)) {
    if ((JOGO.desc || []).includes(d.id) || Math.hypot(hero.x - d.x, hero.y - d.y) > d.r) continue;
    (JOGO.desc = JOGO.desc || []).push(d.id);
    const exp = Math.round(expProx(JOGO.nivel) * .08), subiu = ganhaExpMapa(exp), feitas = descFeitas(REGIAO), tot = descRegiao(REGIAO).length;
    const linhas = d.fala.slice(); linhas.push(['✦', 'Descoberta: ' + d.nome + '  (+' + exp + ' EXP)' + (d.extra ? '' : '  ·  ' + feitas + '/' + tot)]);
    const completo = !d.extra && feitas === tot && PREMIO_DESC[REGIAO];
    fala = {linhas, i: 0, letras: 0, fim: () => {
      if (typeof pontosChefes === 'function') pontosChefes();
      if (subiu) aviso('Subiu para o nível ' + JOGO.nivel + '!', '#7dffa8');
      if (completo) {const p = PREMIO_DESC[REGIAO]; JOGO.gil += p.gil; daItem(p.item, p.n); som(SOM.ui_vez, .9); aviso('Todas as descobertas! ' + p.txt, '#ffe27a');}
      salvaJogo();
    }};
    som(SOM.ui_vez, .6); salvaJogo(); return;
  }
}
