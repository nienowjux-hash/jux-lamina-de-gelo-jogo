/* ============ MISSÕES (SISTEMA_RPG.md §7) — objetivo da história (★) e missões secundárias (!) dos moradores ============
   Estado salvo em JOGO.missoes[id] = {st:'ativa'|'feita', v0}. As coisas para pegar (frutas, ervas, cachecol, cristais)
   só aparecem no mapa enquanto a missão está ativa. Usado pelo vila.html (abreFala) e pelo vila_menu.js (Diário e Mapa). */
'use strict';
const MISSOES={
  // MISSAO PRINCIPAL do Capitulo 1 (HISTORIA_CAP1.md): a Vovo pede, os passos aparecem no diario
  olhos_roxos:{nome:'Olhos Roxos',quem:'vovo',quemNome:'Vovó Hilda',req:{espada:true},principal:true,
    desc:'Os caçadores de Invernália estão sumindo na trilha e os lobos atacam de olhos roxos. O Halvard, pai do Tico, foi pegar lenha e não voltou. O festival é em três dias. Traga o homem para casa.',
    pede:{passos:true},rec:{gil:200,itens:{hipocao:2,fenix:1}},
    passos:[
      {txt:'Vencer 3 lobos de olhos roxos na trilha',ok:()=>((JOGO.cap1||{}).lobos||0)>=3,prog:()=>Math.min(3,(JOGO.cap1||{}).lobos||0)+'/3'},
      {txt:'Investigar o acampamento goblin',ok:()=>!!(JOGO.cap1||{}).acamp},
      {txt:'Enfrentar o Acólito no santuário do cristal',ok:()=>(JOGO.provas||{}).acolito==='feita'},
      {txt:'Libertar o Skoll e resgatar o Halvard',ok:()=>(JOGO.provas||{}).skoll==='feita'},
      {txt:'Voltar e contar à Vovó Hilda',ok:()=>estadoMissao('olhos_roxos')==='feita'}],
    oferta:[['Vovó Hilda','Forasteiro. Os caçadores não voltaram. Três já, só esta semana.'],['Jux','Lobos?'],
      ['Vovó Hilda','Com olhos roxos. Lobo normal foge de homem. Estes atacam como quem recebeu ordem.'],['Jux','Ordem? Lobo não recebe ordem. Alguém está mandando neles.'],
      ['Vovó Hilda','O Halvard, pai do Tico, foi pegar lenha e não voltou. O menino não para de chorar… nem de te chamar de deus.'],
      ['Jux','Eu acho ele. E de graça: o Borin me ensinou que chorar sai caro.'],['Vovó Hilda','O festival é em três dias. Traga o homem para casa antes disso. E não morra perto da minha casa.']],
    lembra:[['Vovó Hilda','Lobos de olhos roxos, goblins assustados e o Halvard ainda lá fora. Eu não dormi.'],['Jux','Prometo dormir por você. Depois.']],
    entrega:[['Jux','Achei o Halvard. Preso na caverna do lobo, vivo e com muita vontade de abraçar o Tico.'],['Vovó Hilda','…Vivo. Eu rezei tanto que esqueci como se agradece.'],
      ['Jux','O Tico?'],['Vovó Hilda','Não largou o pai desde o amanhecer. O Borin chorou tanto que apagou a forja. Dois choros, uma casa e um menino que finalmente dormiu.'],
      ['Jux','Isso foi um elogio?'],['Vovó Hilda','Foi um desabafo. Tome gil e poções. E ouça, forasteiro: olhos roxos não aparecem à toa. O festival é amanhã. Tenho um pressentimento.'],
      ['Jux','Pressentimento de avó é o sistema de alarme mais confiável de qualquer RPG.']]},
  tico_cachecol:{nome:'O cachecol do Tico',quem:'tico',quemNome:'Tico',req:{espada:true},
    desc:'O Tico perdeu o cachecol vermelho brincando de esconde-esconde. Ele jura que foi "perto do rio, ou da árvore, ou do universo".',
    pede:{item:'cachecol',n:1},rec:{gil:60,itens:{pocao:2}},
    oferta:[['Tico','Moço do céu! Emergência! EMERGÊNCIA!'],['Jux','Fala, recruta. Qual é a crise?'],['Tico','Perdi meu cachecol vermelho! Se a minha mãe descobrir, eu viro picolé de castigo.'],
      ['Jux','Missão de resgate de cachecol. Aceito. Estrategista não deixa nenhum acessório para trás.'],['Tico','Acho que foi perto do rio... ou da árvore grande... ou do universo.']],
    lembra:[['Tico','Achou? Achou? Ele é vermelho, quentinho e tem cheiro de Sir Bacon.'],['Jux','Essa última informação ajudou mais do que devia.']],
    entrega:[['Jux','Um cachecol vermelho, levemente perfumado de porco. Confere?'],['Tico','MEU CACHECOL! Você é o melhor deus-estrategista do mundo!'],
      ['Tico','Toma, são as moedas do meu cofrinho e umas poções que a mamãe esconde. Eu sei onde ela esconde.'],['Jux','Informante de qualidade. Vou te contratar para a inteligência da equipe.']]},
  ingrid_frutas:{nome:'Frutas para a torta',quem:'ingrid',quemNome:'Ingrid',req:{espada:true,apos:'tico_cachecol'},
    desc:'A Ingrid quer fazer a Torta de Frutas Silvestres do festival, mas faltam 3 frutas. Elas crescem nos cantos da vila.',
    pede:{item:'fruta',n:3},rec:{gil:50,itens:{torta:2}},
    oferta:[['Ingrid','Você aí, de óculos! Sabe o que é uma fruta silvestre?'],['Jux','Uma fruta que não paga aluguel.'],
      ['Ingrid','...Exato. Preciso de 3 para a torta do festival. Elas ficam escondidas pelos cantos da vila.'],['Jux','Coleta de recursos. A parte do RPG que eu finjo que não gosto.']],
    lembra:[['Ingrid','Três frutas, querido. A torta não se recheia sozinha.']],
    entrega:[['Jux','Três frutas silvestres, colhidas com precisão cirúrgica.'],['Ingrid','Que lindas! O festival vai ter torta!'],['Ingrid','Leva duas tortas, uma pra você e uma pra você de novo.'],['Jux','Você entende de logística. Respeito.']]},
  vovo_ervas:{nome:'Ervas da Vovó',quem:'vovo',quemNome:'Vovó Hilda',req:{espada:true,apos:'ingrid_frutas'},
    desc:'A Vovó Hilda precisa de 3 Ervas-de-Neve para fazer remédios. Elas brotam perto da água e das pedras.',
    pede:{item:'erva',n:3},rec:{itens:{fenix:1,antidoto:2}},
    oferta:[['Vovó Hilda','Forasteiro. Seus joelhos são mais novos que os meus.'],['Jux','Isso foi um elogio ou um pedido?'],
      ['Vovó Hilda','Um pedido. Traga 3 Ervas-de-Neve. Brotam perto da água e das pedras.'],['Jux','E se eu achar quatro?'],['Vovó Hilda','Aí você é útil. Não se acostume.']],
    lembra:[['Vovó Hilda','Três ervas. Não duas. Não "quase três". Três.']],
    entrega:[['Jux','Três Ervas-de-Neve. Nenhuma a mais, nenhuma a menos.'],['Vovó Hilda','Hmpf. Bom trabalho.'],['Vovó Hilda','Tome uma Pena de Fênix e uns antídotos. E se morrer, não morra perto da minha casa.'],['Jux','Anotado. Morrer longe.']]},
  borin_cristais:{nome:'Cristais para a forja',quem:'borin',quemNome:'Borin',req:{espada:true,apos:'vovo_ervas'},
    desc:'O Borin quer forjar uma lâmina para o festival e precisa de 3 Cristais de Gelo. Alguns brilham pela vila.',
    pede:{item:'cristal',n:3},rec:{gil:100,itens:{minerio:2}},
    oferta:[['Borin','Forasteiro! Vou forjar a lâmina do festival, a mais bonita em vinte anos!'],['Borin','Mas preciso de 3 Cristais de Gelo, e minhas costas não se dobram desde o inverno passado.'],
      ['Jux','Eu trago. Mas o crédito na plaquinha da espada é dividido.'],['Borin','HA! Fechado! Procure brilhos azuis pela vila.']],
    lembra:[['Borin','Três Cristais de Gelo! A forja está com fome!']],
    entrega:[['Jux','Três Cristais de Gelo. A forja pode jantar.'],['Borin','Olha esse brilho... *funga*'],['Jux','Você vai chorar de novo?'],['Borin','É FULIGEM! Toma, gil e minério. E SAI DAQUI antes que a fuligem piore!']]},
  oskar_forca:{nome:'A força do lenhador',quem:'oskar',quemNome:'Oskar',req:{espada:true,apos:'borin_cristais'},
    desc:'O Oskar quer ver se você aguenta o tranco: vença 3 batalhas (botão "Voltar ao jogo").',
    pede:{vitorias:3},rec:{gil:80,itens:{hipocao:1}},
    oferta:[['Oskar','Hm.'],['Jux','Hm?'],['Oskar','Espada bonita. Braço fino.'],['Jux','Braço estratégico. Ele trabalha com eficiência.'],
      ['Oskar','Vença 3 lutas. Aí eu te mostro uma coisa.'],['Jux','Um desafio de lenhador. Isso é quase uma side quest de anime.']],
    lembra:[['Oskar','Hm. Ainda não.']],
    entrega:[['Oskar','...Hm. Você venceu.'],['Oskar','Meu avô dizia: quem aguenta o tranco aguenta qualquer coisa. Ele partia montanhas com o punho. Eu só parto lenha.'],
      ['Jux','Pesada é bom. Pesada quebra coisas.'],['Oskar','Hm. Toma uma Hi-Poção. Pra não quebrar você.']]},
};
// a Prova do Lobo nao tem morador: nasce das pegadas na trilha (provaFenrirEstado, vila_motor.js)
MISSOES.prova_fenrir={nome:'A prova do lobo',quem:null,quemNome:'as pegadas enormes',
  desc:'Pegadas enormes, brilhando na neve, saem da caverna do lobo, atravessam o Vale dos Lobos e sobem até o Pico do Uivo. Um Eco antigo, um lobo caçador, só se entrega a quem provar valor: lute contra o espírito dele. Ele é forte: nível recomendado 12. Se estiver fraco, treine e melhore o equipamento.',
  pede:{prova:'fenrir'},rec:{eco:'lamina'}};
// MISSAO SECUNDARIA LIGADA AO MINI-CHEFE DA GARGANTA (CHEFE_CAPITAO.md): o Halvard, ja resgatado, pede o machado e a cota de volta
const PISTAS_CAPITAO = ['d_g_diario', 'd_g_rastro', 'd_g_bandeira'];
const pistasCapitao = () => PISTAS_CAPITAO.filter(id => (JOGO.desc || []).includes(id)).length;
MISSOES.machado_halvard = {nome:'O machado do Halvard', quem:'halvard', quemNome:'Halvard', req:{espada:true, apos:'olhos_roxos'},
  desc:'Quando levaram o Halvard, os goblins da Garganta ficaram com o machado dele e com a cota de malha do pai. Ache as pistas, enfrente o ladrão e traga tudo de volta.',
  pede:{passos:true}, rec:{gil:150, itens:{hipocao:3, machado_halvard:1}},
  passos:[
    {txt:'Achar as 3 pistas do ladrão na Garganta Gelada', ok:() => pistasCapitao() >= 3, prog:() => pistasCapitao() + '/3'},
    {txt:'Enfrentar o Capitão Dente-de-Ferro', ok:() => !!((JOGO.chefes || {}).capitao)},
    {txt:'Devolver as coisas ao Halvard', ok:() => estadoMissao('machado_halvard') === 'feita'}],
  oferta:[['Halvard','Forasteiro. Uma palavra, se tiver tempo.', 0], ['Jux','Tenho. Pouco, mas tenho.'],
    ['Halvard','Quando me levaram, eu tinha ido atrás de lenha seca até o acampamento de caça da Garganta. Meu machado e a cota do meu pai ficaram lá. Estão na família há três gerações.', 0],
    ['Halvard','Os goblins ficaram com tudo. Eu não os culpo: estavam com medo. Mas aquilo não é deles.', 2],
    ['Jux','Eu cuido disso. Alguma pista?'],
    ['Halvard','Eu escrevia um diário no acampamento. Procure lá. E procure o rastro de ferro: só um goblin muito pesado deixa aquilo. E uma bandeirinha de osso, perto da torre.', 0],
    ['Jux','Diário, rastro de ferro, bandeirinha de osso. Anotado.']],
  lembra:[['Halvard','Já achou as minhas coisas? A cota é a que eu mais sinto falta. Era do meu pai.', 0], ['Jux','Estou nisso. Os goblins estão se organizando.']],
  entrega:[['Jux','Aqui. O machado e a cota de malha. O Capitão pediu desculpa… do jeito dele.'],
    ['Halvard','…É o meu machado. É mesmo o meu machado.', 3],
    ['Halvard','A cota é sua quando você for forte o bastante para carregá-la. Cai melhor em quem salvou a minha vida.', 1],
    ['Halvard','O machado fica com o seu amigo bárbaro. Ele não aceita, mas fica.', 1],
    ['Jux','Você acabou de dar um machado para um homem que carrega uma marreta.'], ['Halvard','Ele vai olhar para ele de vez em quando. Acredite.', 0]]};
// MISSAO DO MINI-CHEFE DA TRILHA (CHEFE_BOLOTAO.md): o Sr. Floco, o boneco de neve do Tico, virou o Bolotao
const PISTAS_FLOCO = ['d_t_chapeu', 'd_t_rastro', 'd_t_cenoura'];
const pistasFloco = () => PISTAS_FLOCO.filter(id => (JOGO.desc || []).includes(id)).length;
const PISTA_FLOCO_PT = {d_t_chapeu: [360, 700], d_t_rastro: [620, 705], d_t_cenoura: [800, 560]};
MISSOES.amigo_floco = {nome:'O amigo de neve do Tico', quem:'tico', quemNome:'Tico', req:{espada:true, apos:'tico_cachecol'},
  desc:'O Sr. Floco, o boneco de neve que o Tico construiu, sumiu do quintal. Siga as pistas pela Trilha dos Pinheiros e descubra o que aconteceu.',
  pede:{passos:true}, rec:{gil:100, itens:{eter:2}},
  passos:[
    {txt:'Achar as 3 pistas do Sr. Floco na Trilha', ok:() => pistasFloco() >= 3, prog:() => pistasFloco() + '/3'},
    {txt:'Enfrentar o que está no lago congelado', ok:() => !!((JOGO.chefes || {}).bolotao)},
    {txt:'Contar ao Tico', ok:() => estadoMissao('amigo_floco') === 'feita'}],
  oferta:[['Tico','Moço do céu! De novo! OUTRA emergência! O Sr. Floco SUMIU!'], ['Jux','O Sr. Floco é… um parente?'],
    ['Tico','É o meu boneco de neve! Tinha chapéu de balde, nariz de cenoura e tudo! Eu fiz sozinho!'],
    ['Jux','Um boneco de neve que some. Faz sentido, em Invernália.'],
    ['Tico','Acho que foi para a trilha. Ele sempre ficava olhando para lá.'],
    ['Jux','Missão de busca. Procuro um chapéu, uma cenoura e um boneco. Anotado.']],
  lembra:[['Tico','Achou o Sr. Floco? Ele é grandão, branco e tem um balde na cabeça!'], ['Jux','Ainda procurando. Vi o seu quintal. Boa construção.']],
  entrega:[['Jux','Achei o Sr. Floco. Ele estava no lago, bem maior e bem mais bravo. Agora está pequeno de novo.'],
    ['Tico','O SR. FLOCO! Ele está vivo! Ele está pequeno! Ele está… falando?!'],
    ['Jux','Ele voltou ao tamanho original. Só ficou mais simpático.'],
    ['Tico','Você é o melhor deus-estrategista do mundo dos bonecos de neve! Toma o resto do cofrinho. A mamãe já mudou as poções de lugar.'],
    ['Jux','Informante e escultor. Você vai longe.']]};
// MISSAO DO MINI-CHEFE DO VALE (CHEFE_PRESA_ANCIA.md): o Capitao (ja mercador) perdeu a carroca para os lobos do vale
const PISTAS_PRESA = ['d_v_carroca', 'd_v_pegadas', 'd_v_corrente'];
const pistasPresa = () => PISTAS_PRESA.filter(id => (JOGO.desc || []).includes(id)).length;
const PISTA_PRESA_PT = {d_v_carroca: [292, 690], d_v_pegadas: [840, 600], d_v_corrente: [650, 585]};
MISSOES.carroca_tombada = {nome:'A carroça tombada', quem:'capitao', quemNome:'Capitão Dente-de-Ferro', req:{espada:true, apos:'machado_halvard'},
  desc:'A carroça de mercadoria do Capitão subiu para o Vale dos Lobos e foi tombada. Tinha um baú com as economias dele. Ache as pistas no Vale e descubra quem ficou com o baú.',
  pede:{passos:true}, rec:{gil:150, itens:{eter:2}},
  passos:[
    {txt:'Achar as 3 pistas no Vale dos Lobos', ok:() => pistasPresa() >= 3, prog:() => pistasPresa() + '/3'},
    {txt:'Enfrentar o dono da toca', ok:() => !!((JOGO.chefes || {}).presa)},
    {txt:'Devolver o baú ao Capitão', ok:() => estadoMissao('carroca_tombada') === 'feita'}],
  oferta:[['Capitão','Ei! Ei, você! Herói! Cliente! Amigo!', 1], ['Jux','Isso foi uma promoção muito rápida.'],
    ['Capitão','Minha carroça de mercadoria subiu para o Vale dos Lobos e os lobos tombaram TUDO!', 2],
    ['Capitão','Tinha um baú com as minhas economias. Honestas. Quase.', 0],
    ['Bino','…Quase.'],
    ['Jux','Eu acho o seu baú. Mas se tiver coisa roubada lá dentro, a gente conversa.'],
    ['Capitão','Só nabo e moeda! Nabo e moeda! …E um garfo. O garfo é meu.', 1]],
  lembra:[['Capitão','E o baú? Achou o meu baú? Ele é pesado e cheira a nabo!', 0], ['Jux','Seguindo as pegadas. Elas são… grandes.']],
  entrega:[['Jux','Seu baú. O dono da toca devolveu.'],
    ['Capitão','O MEU BAÚ! Ainda tem o garfo! Ainda tem o NABO!', 3],
    ['Capitão','Toma, toma: gil e Éter. Comércio Honesto sempre paga as dívidas!', 1],
    ['Jux','Quase sempre.'], ['Capitão','…Quase sempre.', 0]]};
const ORDEM_MISSOES=Object.keys(MISSOES);
// coisas para pegar no mapa (só aparecem com a missão ativa)
const COLETAS=[
  {id:'m_cachecol',missao:'tico_cachecol',item:'cachecol',x:978,y:705},
  {id:'m_fru1',missao:'ingrid_frutas',item:'fruta',x:470,y:700},
  {id:'m_fru2',missao:'ingrid_frutas',item:'fruta',x:1125,y:625},
  {id:'m_fru3',missao:'ingrid_frutas',item:'fruta',x:330,y:650},
  {id:'m_erv1',missao:'vovo_ervas',item:'erva',x:1060,y:700},
  {id:'m_erv2',missao:'vovo_ervas',item:'erva',x:845,y:675},
  {id:'m_erv3',missao:'vovo_ervas',item:'erva',x:600,y:675},
  {id:'m_cri1',missao:'borin_cristais',item:'cristal',x:1080,y:700},
  {id:'m_cri2',missao:'borin_cristais',item:'cristal',x:745,y:692},
];
function estMissoes(){if(!JOGO.missoes)JOGO.missoes={};return JOGO.missoes;}
const estadoMissao=id=>(estMissoes()[id]||{}).st||null;
const alvoMissao=id=>MISSOES[id].passos?MISSOES[id].passos.length-1:(MISSOES[id].pede.n||MISSOES[id].pede.vitorias||1);   // (a prova conta 0/1)
function progressoMissao(id){const M=MISSOES[id],e=estMissoes()[id];if(!e)return 0;if(e.st==='feita')return alvoMissao(id);
  if(M.passos)return M.passos.slice(0,-1).filter(p=>p.ok()).length;if(M.pede.prova)return 0;if(M.pede.item)return Math.min(qtd(M.pede.item),M.pede.n);return Math.max(0,Math.min((JOGO.vitorias||0)-(e.v0||0),M.pede.vitorias));}
const missaoPronta=id=>estadoMissao(id)==='ativa'&&progressoMissao(id)>=alvoMissao(id);
// MISSOES LIBERADAS EM ORDEM: nada aparece antes de pegar a espada; depois a principal (Olhos Roxos) e uma de cada vez das secundarias:
// Tico -> Ingrid -> Vovo (ervas) -> Borin -> Oskar. req.apos = missao que precisa estar FEITA antes.
const missaoLiberada=id=>{const r=MISSOES[id].req;if(!r)return true;if(r.espada&&!hero.espada)return false;if(r.apos&&estadoMissao(r.apos)!=='feita')return false;return true;};
// a missão "da vez" de um morador (oferecer, lembrar ou entregar)
function missaoDe(npc){const c=ORDEM_MISSOES.filter(k=>MISSOES[k].quem===npc&&estadoMissao(k)!=='feita'&&missaoLiberada(k));
  return c.find(k=>missaoPronta(k))||c.find(k=>!estadoMissao(k))||c[0]||null;}
// marca em cima do morador: '!' oferece, '✔' pode entregar, '…' em andamento
function marcaMissao(npc){const k=missaoDe(npc);if(!k)return '';const st=estadoMissao(k);return !st?'!':missaoPronta(k)?'✔':'…';}
function textoRec(id){const r=MISSOES[id].rec,p=[];
  if(r.eco)p.push(ECOS[r.eco].nome);if(r.gil)p.push(r.gil+' gil');
  if(r.itens)for(const k in r.itens)p.push(ITENS[k].nome+(r.itens[k]>1?' ×'+r.itens[k]:''));if(r.pe)p.push(r.pe+' PE no Eco equipado');return p.join(' + ');}
// falas da missão (ou null: conversa normal)
function missaoFala(npc){const k=missaoDe(npc);if(!k)return null;const M=MISSOES[k],st=estadoMissao(k);
  if(!st)return {linhas:M.oferta,fim:()=>aceitaMissao(k)};
  if(missaoPronta(k))return {linhas:M.entrega,fim:()=>concluiMissao(k)};
  return {linhas:[...M.lembra,['✦','Missão: '+M.nome+' — '+progressoMissao(k)+' / '+alvoMissao(k)]]};}
function aceitaMissao(k){estMissoes()[k]={st:'ativa',v0:JOGO.vitorias||0};if(k==='olhos_roxos'){JOGO.cap1={lobos:0,acamp:false};if(!(JOGO.bino&&JOGO.bino.ativo))setTimeout(entradaBino,500);}if(!MISSOES[k].principal&&!JOGO.rastreio)JOGO.rastreio=k;som(SOM.ui_vez,.7);aviso('Nova missão: '+MISSOES[k].nome+'  (veja no menu → Missões)','#ffe27a');pontosColeta();salvaJogo();}
// o Bino se oferece para ajudar a resgatar o Halvard (calado e bruto, mas protetor com quem ele gosta): entra no time
function entradaBino(){if(typeof fala==='undefined'||fala)return setTimeout(entradaBino,600);
  if(typeof tocaFilme==='function'&&typeof CENAS_BINO!=='undefined'){   // cutscene de apresentacao (ENTER pula e ele entra do mesmo jeito)
    tocaFilme(CENAS_BINO,IMG_BINO,()=>{JOGO.bino={ativo:true,nivel:Math.max(1,JOGO.nivel|0),exp:0};som(SOM.ui_vez,.9);aviso('Bino entrou no time! Ele luta ao seu lado e aprende golpes novos a cada nível.','#ffb27a');salvaJogo();});return;}
  if(typeof SEG!=='undefined')SEG.cena=true;   // ele aparece ao lado do Jux so durante esta cena
  fala={linhas:[['Bino','…Ouvi.'],['Jux','A conversa inteira?'],['Bino','O Halvard me deu pão quando cheguei aqui. Sem perguntar nada.'],
    ['Jux','Então você quer ir buscar o homem do pão.'],['Bino','Eu vou.'],['Jux','Isso era uma pergunta.'],['Bino','Não.'],
    ['Jux','Gostei dele.'],['Aurora','Portador, o rapaz carrega uma pedra do tamanho de um cavalo. Aceite a ajuda.'],['✦','Bino entrou no time! Ele luta ao seu lado e aprende golpes novos a cada nível.']],i:0,letras:0,
    fim:()=>{if(typeof SEG!=='undefined')SEG.cena=false;JOGO.bino={ativo:true,nivel:Math.max(1,JOGO.nivel|0),exp:0};som(SOM.ui_vez,.9);aviso('Bino entrou no time!','#ffb27a');salvaJogo();}};}
function concluiMissao(k){const M=MISSOES[k],r=M.rec;
  if(M.pede.item)tiraItem(M.pede.item,M.pede.n);
  if(r.gil)JOGO.gil+=r.gil;if(r.itens)for(const i in r.itens)daItem(i,r.itens[i]);
  if(r.eco){const E=estadoEcos();if(!E.tem.includes(r.eco))E.tem.push(r.eco);}
  if(r.pe)ganhaPE(r.pe);
  estMissoes()[k].st='feita';pontosColeta();som(SOM.ui_vez,.9);salvaJogo();
  if(k==='olhos_roxos'&&typeof halvardVila==='function')setTimeout(halvardVila,300);
  const premio=()=>{fala={linhas:[['✦','Missão concluída: '+M.nome+'!'],['✦','Recompensa: '+textoRec(k)+'.'+(r.eco?' Equipe o Eco no menu → Ecos.':'')]],i:0,letras:0};};
  if(k==='olhos_roxos')setTimeout(()=>{fala={cena:'reencontro',linhas:[['✦','O Halvard volta para casa. E o Tico, enfim, para de esperar.']],i:0,letras:0,fim:premio};},150);   // cena ilustrada do reencontro
  else setTimeout(premio,150);}
// pontos de pegar no mapa: entram/saem conforme a missão
const coletaAtiva=c=>(typeof NA_VILA==='undefined'||NA_VILA)&&estadoMissao(c.missao)==='ativa'&&!JOGO.pegos.includes(c.id);
function pontosColeta(){for(let i=V.pontos.length-1;i>=0;i--)if(V.pontos[i].id.startsWith('col_'))V.pontos.splice(i,1);pontosProva();
  for(const c of COLETAS)if(coletaAtiva(c))V.pontos.push({id:'col_'+c.id,x:c.x,y:c.y,r:24});}
function pegaColeta(id){const c=COLETAS.find(q=>q.id===id);if(!c||!coletaAtiva(c))return;JOGO.pegos.push(id);daItem(c.item,1);pontosColeta();
  som(SOM.ui_vez,.7);for(let k=0;k<12;k++)poeira.push({x:c.x+rnd(-6,6),y:c.y-rnd(0,10),vx:rnd(-40,40),vy:rnd(-70,-20),v:0});
  const M=MISSOES[c.missao];fala={linhas:[['✦','Você achou: '+ITENS[c.item].nome+'!  ('+M.nome+': '+progressoMissao(c.missao)+' / '+alvoMissao(c.missao)+')']],i:0,letras:0};salvaJogo();}
// desenho no mapa: o item flutuando com brilho
function missoesMundo(){provaMundo();for(const c of COLETAS){if(!coletaAtiva(c))continue;const b=Math.sin(t*3+c.x)*1.5,k=.55+.45*Math.sin(t*4+c.y);
  ctx.save();ctx.fillStyle='rgba(10,20,40,.3)';ctx.beginPath();ctx.ellipse(c.x,c.y,5,2,0,0,6.283);ctx.fill();
  ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(c.x,c.y-8+b,0,c.x,c.y-8+b,10);g.addColorStop(0,`rgba(255,240,170,${.5*k})`);g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=g;ctx.fillRect(c.x-10,c.y-18+b,20,20);ctx.restore();iconeItem(ctx,c.item,c.x-5,c.y-13+b,10);}}

// ---------- PROVA DO LOBO (Fenrir): pegadas -> clareira -> luta contra o espirito -> lealdade ----------
// JOGO.provas.fenrir: undefined | 'pista' (viu as pegadas) | 'vencida' (ganhou a luta, falta a cena) | 'feita'
const estProvas=()=>{if(!JOGO.provas)JOGO.provas={};return JOGO.provas;};
function provaFenrirEstado(){if(estadoEcos().tem.includes('lamina'))return 'tem';const p=estProvas().fenrir;if(p)return p;
  return (typeof hero!=='undefined'&&hero.espada&&estProvas().skoll==='feita')?'pegadas':'cedo';}   // as pegadas do Fenrir aparecem depois de libertar o Skoll
function concluiSkoll(){estProvas().skoll='feita';som(SOM.ui_vez,.9);clarao=1;pontosColeta();salvaJogo();aviso('A caverna está livre!','#7dffa8');}
// PICO DO UIVO (PICO_DO_UIVO.md, 2026-11-19): depois de libertar o Skoll, as pegadas DESENHADAS do Fenrir (pegadas_fenrir.js)
// saem da boca da caverna na Garganta, atravessam o Vale dos Lobos e sobem ate o Pico; a luta e no circulo de pedras do Pico.
const PEG=window.JUX_PEGADAS||null,PEGI=new Image();if(PEG)PEGI.src=PEG.atlas;
const PROVA_PONTOS={circulo:{x:655,y:280,r:85}};
function pontosProva(){for(let i=V.pontos.length-1;i>=0;i--)if(V.pontos[i].id.startsWith('prova_')||V.pontos[i].id==='circulo_pico')V.pontos.splice(i,1);
  if(typeof REGIAO==='undefined')return;const st=provaFenrirEstado();
  if(REGIAO==='garganta'&&st==='pegadas'&&PEG){const p=PEG.rotas.garganta[1];V.pontos.push({id:'prova_pegadas',x:p[0],y:p[1],r:50});}
  if(REGIAO==='pico'){const C=PROVA_PONTOS.circulo;V.pontos.push({id:(st==='pista'||st==='vencida')?'prova_fenrir':'circulo_pico',x:C.x,y:C.y,r:C.r});}}
function aceitaProvaFenrir(){estProvas().fenrir='pista';estMissoes().prova_fenrir={st:'ativa',v0:0};som(SOM.ui_vez,.7);
  aviso('Nova missão: A prova do lobo  (veja no menu → Missões)','#ffe27a');pontosColeta();salvaJogo();}
function concluiProvaFenrir(){const E=estadoEcos();estProvas().fenrir='feita';if(!E.tem.includes('lamina'))E.tem.push('lamina');E.equip='lamina';
  if(!E.equipadas.includes('golpe_duplo')&&apUsado()+HABS.golpe_duplo.ap<=limiteAP(JOGO.nivel))E.equipadas.push('golpe_duplo');
  if(estMissoes().prova_fenrir)estMissoes().prova_fenrir.st='feita';pontosColeta();som(SOM.ui_vez,.9);clarao=1;salvaJogo();}
// desenho no mapa: as pegadas desenhadas (direcao do passo) com o brilho pulsando por cima, uma depois da outra
function provaMundo(){if(typeof REGIAO==='undefined'||!PEG||!PEGI.complete)return;const st=provaFenrirEstado();
  const rota=REGIAO==='garganta'&&(st==='pegadas'||st==='pista')?PEG.rotas.garganta:REGIAO==='vale'&&(st==='pegadas'||st==='pista')?PEG.rotas.vale:null;if(!rota)return;
  const T=PEG.w,S=46;
  rota.forEach(([x,y,d],i)=>{const k=.5+.5*Math.sin(t*2.4-i*.55);
    ctx.save();ctx.globalAlpha=.9;ctx.drawImage(PEGI,d*T,0,T,T,x-S/2,y-S/2,S,S);
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.55*k;ctx.drawImage(PEGI,d*T,0,T,T,x-S/2,y-S/2,S,S);ctx.restore();});}

// ---------- passos da missao Olhos Roxos ----------
function concluiAcolito(){estProvas().acolito='feita';som(SOM.ui_vez,.9);salvaJogo();aviso('Pista: o que a Ordem prendeu está na caverna','#ffe27a');}
