/* ============ Motor do mapa andável (vila e regiões). Era o script de dentro do vila.html.
   window.REGIAO (definido na página) diz qual mapa é: 'vila' (padrão) ou 'trilha'. ============ */
'use strict';
/* Invernalia andavel (teste). Mapa, terreno e frentes: tools/vila_mapa.py -> vila_dados.js.
   - terreno (R andavel, G neve, B rio): colisao por pixel, pegadas so na neve, brilho correndo so no rio
   - frentes: so os pixels do objeto (casa, barraca, copa da arvore...) redesenhados por cima do heroi quando os pes dele
     estao acima da base do objeto; se ele estiver escondido, aparece a silhueta
   - vida desenhada por cima da imagem: neve, aurora, fogueira e forja com chamas e fagulhas, fumaca nas chamines,
     lanternas, agua correndo, pegadas e neve levantando, pulo na cerca do chiqueiro
   - sons: musica da vila, vento, passos, fogo e rio (volume pela distancia) */
if(typeof fimCarregar==='function')window.addEventListener('load',fimCarregar);else document.getElementById('carregando').remove();   // carrega.js: espera as imagens
const W=960,H=540,cv=document.getElementById('c'),ctx=cv.getContext('2d');
const oc=document.createElement('canvas');oc.width=W;oc.height=H;const octx=oc.getContext('2d');octx.imageSmoothingEnabled=true;octx.imageSmoothingQuality='high';let furo=0;
const hc=document.createElement('canvas');hc.width=W;hc.height=H;const hctx=hc.getContext('2d');hctx.imageSmoothingEnabled=true;hctx.imageSmoothingQuality='high';
const sc=document.createElement('canvas');sc.width=W;sc.height=H;const sctx=sc.getContext('2d');
const V=window.JUX_VILA,AND=window.JUX_ANDAR,K=V.k||1;
const REGIAO=window.REGIAO||'vila',NA_VILA=REGIAO==='vila';   // qual mapa esta página mostra
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const MAPA=new Image();MAPA.src=V.mapa;
// caminhada em 4 direcoes (tools/cut_vila_heroi.py): sem espada no comeco, com espada depois do altar
const ANDAR={};for(const n in AND){const i=new Image();i.src=AND[n].atlas;ANDAR[n]={...AND[n],i};}
// Jux NO VENTO do Pico (vento_heroi.js, tools/cut_vento_heroi.py): andando e parado com cabelo e casaco voando (so com a espada)
// ESCALADA (FICHA_ESCALADA.md, 2026-11-20): subir/descer beirada (pulos tipo 'v') com as folhas de tools/cut_escalar.py
const ESCALAR=window.JUX_ESCALAR?(()=>{const i=new Image();i.src=window.JUX_ESCALAR.atlas;return {...window.JUX_ESCALAR,i};})():null;
const VH=window.JUX_VENTO_HEROI?(()=>{const i=new Image();i.src=window.JUX_VENTO_HEROI.atlas;return {...window.JUX_VENTO_HEROI,i};})():null;
const FR=V.frentes.filter(f=>!f.bandeira).map(f=>{const i=new Image(),o={...f,i,al:null};i.onload=()=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.drawImage(i,0,0);const d=g.getImageData(0,0,i.width,i.height).data,al=new Uint8Array(i.width*i.height);for(let k=0;k<al.length;k++)al[k]=d[k*4+3]>100?1:0;o.al=al;o.aw=i.width;o.ah=i.height;};i.src=f.img;return o;});
// o objeto cobre de verdade o corpo do Jux? (confere alguns pontos do corpo no desenho da frente)
function cobre(f){if(!f.al)return true;let n=0;for(const[dx,dy]of[[0,-6],[0,-14],[0,-22],[0,-30],[0,-38],[-6,-18],[6,-18],[-5,-30],[5,-30]]){const x=Math.floor((hero.x+dx-f.x)*f.aw/f.w),y=Math.floor((hero.y+dy-f.y)*f.ah/f.h);if(x>=0&&y>=0&&x<f.aw&&y<f.ah&&f.al[y*f.aw+x])n++;}return n>=2;}
let TER=null;   // terreno por pixel do mapa: bit 1 andavel, 2 neve, 4 rio
const rioPx=[];
{const m=new Image();m.onload=()=>{const c=document.createElement('canvas');c.width=V.w;c.height=V.h;const g=c.getContext('2d');g.drawImage(m,0,0);
  const d=g.getImageData(0,0,V.w,V.h).data;TER=new Uint8Array(V.w*V.h);
  for(let i=0;i<TER.length;i++){TER[i]=(d[i*4]>127?1:0)|(d[i*4+1]>127?2:0)|(d[i*4+2]>127?4:0);if(TER[i]&4&&i%7===0)rioPx.push(i);}};m.src=V.terreno;}
const ter=(x,y)=>{if(!TER)return 0;x=Math.round(x);y=Math.round(y);return x>=0&&y>=0&&x<V.w&&y<V.h?TER[y*V.w+x]:0;};
// pes do heroi: uma caixinha de 12x6 px toda dentro do chao andavel (cerca fina nao passa entre os pontos)
// LAGO CONGELADO da trilha: o Jux entra e DESLIZA (inercia, atrito baixo, rebate na borda), sem encontros aleatorios la dentro
const GELO={x:765,y:566,rx:215,ry:88};
const naGelo=(x,y)=>REGIAO==='trilha'?((x-GELO.x)/GELO.rx)**2+((y-GELO.y)/GELO.ry)**2<=1:(REGIAO==='garganta'||REGIAO==='vale'||REGIAO==='caverna')?!!(ter(x,y)&4):false;   // garganta: rio congelado marcado no terreno (tools/garganta_mapa.py)
// ENTRADAS do lago: a borda (pedras e arbustos) e parede; nestas passagens o chao fica livre ate o gelo (sul, sudoeste, sudeste, leste e oeste)
const ENTR_GELO=[[730,636,810,692],[648,628,722,684],[832,628,925,692],[972,536,1040,602],[440,540,565,604]];
const naEntrada=(x,y)=>REGIAO==='trilha'&&ENTR_GELO.some(r=>x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3]);
function livre(x,y){if(naGelo(x,y)||naEntrada(x,y))return true;for(let dy=-4;dy<=2;dy+=2)for(let dx=-6;dx<=6;dx+=2)if(!(ter(x+dx,y+dy)&1))return false;return true;}
// cerca que da para pular: devolve o x de pouso do outro lado (ou null)
// cercas que da para pular: [x0,y0,x1,y1,'h'|'v'] -> ponto de pouso do outro lado (ou null)
function pouso(x,y,dx){const z=V.pulos.find(([a,b,c,d,t])=>t!=='v'&&x+dx*12>=a&&x+dx*12<=c&&y>=b&&y<=d);if(!z)return null;const px=dx>0?z[2]+9:z[0]-9;return livre(px,y)?{x:px,y}:null;}
// pouso do pulo/escalada vertical: o primeiro lugar livre depois da faixa (procura ate 30 px: a beirada desenhada e torta)
function pousoV(x,y,dy){const z=V.pulos.find(([a,b,c,d,t])=>t==='v'&&x>=a&&x<=c&&(dy>0?y<b&&y+26>=b:y>d&&y-26<=d));if(!z)return null;const p0=dy>0?z[3]-4:z[1]+4;for(let k=0;k<=40;k+=2){const py=p0+dy*k;if((dy>0?py>z[3]-6:py<z[1]+6)&&livre(x,py))return {x,y:py};}return null;}

// cada troca de pagina pede o arquivo "novo" (?t=hora): o navegador/artefato nunca mostra uma pagina velha guardada (era o que podia fazer a trilha tocar a musica da vila)
const jp=p=>p+(p.includes('?')?'&':'?')+'t='+Date.now();
const BUILD=((document.currentScript&&document.currentScript.src.match(/v=(\d+)/))||[])[1]||'?';   // numero da versao do codigo (aparece no botao de musica, para conferir o que esta rodando)
/* ---------- som */
const ogg=new Audio().canPlayType('audio/ogg; codecs="vorbis"')?'.ogg':'.mp3';
const arq=n=>{const a=new Audio();a.src=n+ogg;a.preload='auto';return a;};
const SOM={ui_mover:arq('assets/sfx/novos/ui_mover'),ui_vez:arq('assets/sfx/novos/ui_vez'),whoosh:arq('assets/sfx/novos/whoosh2')};
const SOM_DESL=[0,1,2,3].map(i=>arq('assets/vila/deslize_'+i));let tDesl=0;   // raspadas de bota no gelo (amostras reais de passos, mais graves e lentas), uma a cada 0,25-0,45 s enquanto desliza
const PASSOS=[0,1,2,3].map(i=>arq('assets/vila/passo_'+i)),PASSOS_NEVE=[0,1,2,3].map(i=>arq('assets/vila/passo_neve_'+i)),PASSOS_MAD=[0,1,2,3].map(i=>arq('assets/vila/passo_madeira_'+i));
const naPonte=(x,y)=>(REGIAO==='trilha'&&x>722&&x<894&&y>340&&y<402)||(REGIAO==='garganta'&&x>588&&x<872&&y>370&&y<436);   // tabuas da ponte: som de madeira
const som=(a,v)=>{try{const c=a.cloneNode();c.volume=clamp(v,0,1);c.play().catch(()=>{});}catch(e){}};
const MUSICAS=[REGIAO==='pico'?['Vento do Pico (sem música)','vento_pico']:REGIAO==='caverna'?['Escuridão','musica_caverna']:REGIAO==='vale'?['Sussurro da Floresta','musica_trilha']:REGIAO==='garganta'?['Catedral na Floresta','musica_garganta']:REGIAO==='trilha'?['Sussurro da Floresta','musica_trilha']:['Manhã Gelada','musica_vila_2']];   // cada regiao tem a sua musica (a trilha NAO usa a da vila)   // musica unica da vila (as outras foram removidas a pedido); o botao so liga/desliga
let musI=0;try{const v=localStorage.getItem('jux_musica_vila3');if(v!==null)musI=+v;}catch(e){}
let MUS=null;function pegaMus(){if(MUS)MUS.pause();MUS=musI<MUSICAS.length?arq('assets/vila/'+MUSICAS[musI][1]):null;if(MUS){MUS.loop=true;MUS.volume=.42;}}pegaMus();
const BIGORNA=[0,1,2].map(i=>arq('assets/vila/bigorna_'+i)),OINC=[0,1,2,3].map(i=>arq('assets/vila/porco_'+i)),GUINCHO=arq('assets/vila/porco_guincho');
const VENTO=arq('assets/vila/vento');VENTO.loop=true;VENTO.volume=.22;

let AC=null,fogoG=null,rioG=null;
// UMA pagina por vez toca: ao abrir outra pagina do jogo (vila/trilha/luta), as outras ainda vivas calam a musica na hora (nada de musica da vila na trilha)
const ID_PAG=Math.random().toString(36).slice(2);
function calaTudo(){window.__morta=true;try{if(MUS)MUS.pause();VENTO.pause();}catch(e){}try{for(const v of Object.values(VOZES))v.pause();}catch(e){}try{if(musAtual)musAtual.pause();for(const v of Object.values(MUS_CINE))v.pause();}catch(e){}try{if(AC&&AC.state==='running')AC.suspend();}catch(e){}}
try{const bc=new BroadcastChannel('jux_pagina');bc.onmessage=e=>{if(e.data&&e.data!==ID_PAG)calaTudo();};bc.postMessage(ID_PAG);}catch(e){}
try{localStorage.setItem('jux_pag_viva',ID_PAG);addEventListener('storage',e=>{if(e.key==='jux_pag_viva'&&e.newValue&&e.newValue!==ID_PAG)calaTudo();});}catch(e){}
// reforco: o site que hospeda o jogo pode nao avisar as outras paginas (sem 'storage'/BroadcastChannel). Entao cada pagina confere sozinha,
// 3x por segundo, se ainda e a pagina da vez; se outra abriu depois (trilha, luta...), esta fica muda de vez.
setInterval(()=>{if(window.__morta)return;try{const v=localStorage.getItem('jux_pag_viva');if(v&&v!==ID_PAG)calaTudo();}catch(e){}},330);
// voltou para esta pagina pelo botao Voltar do navegador (pagina guardada na memoria): ela volta a ser a da vez
addEventListener('pageshow',e=>{if(e.persisted){window.__morta=false;try{localStorage.setItem('jux_pag_viva',ID_PAG);}catch(_){}}});
function ligaAudio(){if(window.__morta)return;   // so depois do primeiro toque/tecla (regra dos navegadores)
  if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();
    // fogo: ruido com estalos; rio: ruido grave filtrado. O volume de cada um segue a distancia do heroi
    const ruido=(seg)=>{const b=AC.createBuffer(1,AC.sampleRate*seg,AC.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=Math.random()*2-1;return b;};
    const fb=AC.createBuffer(1,AC.sampleRate*3,AC.sampleRate),fx=fb.getChannelData(0);
    for(let i=0;i<fx.length;i++)fx[i]=(Math.random()*2-1)*.25+(Math.random()<.0009?(Math.random()*2-1)*6:0);
    const f=AC.createBufferSource();f.buffer=fb;f.loop=true;const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=1800;
    fogoG=AC.createGain();fogoG.gain.value=0;f.connect(fl);fl.connect(fogoG);fogoG.connect(acSaida(AC));f.start();
    const r=AC.createBufferSource();r.buffer=ruido(4);r.loop=true;const rl=AC.createBiquadFilter();rl.type='bandpass';rl.frequency.value=650;rl.Q.value=.6;
    rioG=AC.createGain();rioG.gain.value=0;r.connect(rl);rl.connect(rioG);rioG.connect(acSaida(AC));r.start();
  }catch(e){}
  if(MUS)MUS.play().catch(()=>{});   // o som de vento em loop (assets/vila/vento) foi TIRADO: era a 'musica irritante que nao para' (pedido do usuario 2026-11-19)
}
const bm=document.getElementById('musica');
const marcaMus=()=>{bm.textContent='♫ Música: '+(musI<MUSICAS.length?MUSICAS[musI][0]:'desligada')+'  ·  v'+BUILD.slice(-5);};marcaMus();
bm.onclick=e=>{e.stopPropagation();if(window.__morta){window.__morta=false;try{localStorage.setItem('jux_pag_viva',ID_PAG);}catch(_){}}musI=(musI+1)%(MUSICAS.length+1);try{localStorage.setItem('jux_musica_vila3',musI);}catch(_){}marcaMus();pegaMus();if(MUS&&AC)MUS.play().catch(()=>{});};

/* ---------- falas (o Jux e o cara foda, estrategista, e engracado pela confianca; a Aurora e a espada, sarcastica) */
const FALAS={
  floco:[['Sr. Floco','Oi. Eu sou o Sr. Floco. Antes eu era maior.', 3],['Jux','Você ficou bem simpático assim.'],['Sr. Floco','O gelo daqui é o melhor de todos. Dica: se você correr e soltar, ele te leva sozinho.', 3],['Jux','Eu sei. Eu já testei. Várias vezes. Com certo prejuízo de dignidade.'],['Sr. Floco','Pode patinar. Só não pise na cenoura.', 1]],
  inicio:[['Jux','…'],['Jux','Tá bom. Vamos ver o que tem por aqui.'],['Sir Bacon','Oinc.']],
  pulo:[['Jux','Estrategista não procura porteira. Estrategista pula.']],
  fogueira:[['Jux','Fogo, neve e uma vila inteira esperando o festival. Se isso é o tutorial, o orçamento foi alto.'],['Jux','Anotado: ponto de descanso. Todo estrategista sabe onde fica a fogueira antes de saber onde fica o inimigo.']],
  arvore:[['Jux','Uma árvore com mais lanternas que a minha árvore de Natal. Respeito.'],['Aurora','Essas lanternas são para a Rainha do Inverno, Portador. Tenha modos.'],['Jux','Eu sempre tenho modos. Só escolho quando usar.']],
  barraca_comida:[['Vendedora','Ensopado de raiz-de-neve! Esquenta até a alma!'],['Jux','Sem moeda, sem ensopado. A economia desse mundo me venceu na primeira rodada.'],['Jux','Primeira e última.']],
  barraca_bebida:[['Jux','Hidromel quente.'],['Jux','Volto aqui depois de salvar o mundo. É uma promessa, não uma ameaça.']],
  ferraria:[['Jux','A forja do Borin. Vinte anos tentando tirar uma espada de um altar…'],['Jux','…e as brasas dele são mais organizadas que a minha vida inteira.']],
  ingrid:[['Ingrid','Pão de centeio, pão de mel, pão de batata... e pão de ontem, que serve de arma.'],['Jux','Quanto custa o de ontem?'],['Ingrid','Pra você? Um sorriso. Pro Borin? Uma lágrima. Ele sempre chora quando come.'],['Jux','Negócio fechado.']],
  halvard:[['Halvard','O Tico não me solta nem para dormir. Eu não reclamo.',1],['Jux','Reclamar é para quem não tem filho. Li isso em algum lugar.'],
    ['Halvard','As correntes tinham um sol negro gravado, forasteiro. Eles riam quando o lobo chorava.',0],['Halvard','Se um dia você precisar de um caçador, eu devo a minha vida a você.',2]],
  oskar:[['Oskar','Hm.'],['Jux','Bela lenha.'],['Oskar','Hm.'],['Jux','Muito... cilíndrica.'],['Oskar','...Você é estranho. Gostei.']],
  borin:[['Borin','HA! Um forasteiro! Veio ver o maior ferreiro de Invernália?'],['Jux','Vim ver se o fogo esquenta. Está nevando dentro da minha alma.'],['Borin','...Isso foi bonito.'],['Borin','*funga*'],['Jux','Você vai chorar?'],['Borin','NÃO! É fuligem no olho!']],
  tico:[['Tico','É VOCÊ! O cara que caiu do céu no chiqueiro!'],['Jux','Tecnicamente eu caí no Sir Bacon. Ele amorteceu.'],['Tico','Você é um deus? Um deus de verdade?'],['Jux','Sou estrategista. Deuses não sabem fazer planilha.'],['Tico','O QUE É PLANILHA?!'],['Jux','Uma magia antiga e terrível. Não pergunte mais.']],
  bacon:[['Sir Bacon','Oinc.'],['Jux','Sir Bacon. Testemunha oficial do meu respawn. Nós temos uma história.'],['Sir Bacon','OINC.'],['Jux','Concordo. Ninguém precisa saber.']],
  vovo:[['Vovó Hilda','Hmpf. O forasteiro sem sombra. Caiu do céu no chiqueiro, foi?'],['Jux','Pouso estratégico. O Sir Bacon amorteceu.'],['Vovó Hilda','Um homem sem sombra só pode ser duas coisas: amaldiçoado ou escolhido.'],['Jux','E qual das duas ganha chá?'],['Vovó Hilda','...As duas. Mas o amaldiçoado lava a xícara.'],['Vovó Hilda','Suba até o altar, lá no alto. A espada vai dizer o que você é.']],
  altar:[['Aurora','Mil anos aqui em cima, e o primeiro que me entende chega por um chiqueiro.'],['Jux','Toda lenda começa humilde, Aurora.'],['Jux','A minha só começou mais cheirosa.']],
  // primeira vez no altar, ainda sem espada: ela escolhe o Jux
  altar_escolha:[['Jux','Runas apagadas. Gelo que não derrete há mil anos. Todo mundo tentou na força…'],['Jux','…então não é um teste de força. É uma pergunta.'],['Jux','Eu não vim te tirar daí. Vim te perguntar se quer lutar comigo.']],
  altar_ganha:[['???','…Finalmente.'],['Aurora','Mil anos esperando, e quem me responde é um forasteiro sem sombra.'],['Aurora','Serve. Me chame de Aurora, Portador.'],['Jux','Prazer, Aurora. Primeira regra da parceria: eu faço o plano, você faz o estrago.']],
  portao:[['Jux','A saída da vila.'],['Jux','Ainda não. Herói que sai da primeira vila sem falar com todo mundo perde o melhor loot.']],
  capitao:[['Capitão','Capitão Dente-de-Ferro, Comércio Honesto. Nunca mais roubei. (Quase.)', 0],['Jux','O nabo vai bem?'],['Capitão','Está crescendo torto. Mas é MEU nabo torto.', 1],['Capitão','O bando voltou, sabia? Só que agora eles vendem poção. Ninguém mais passa fome.', 0]],
  saida_garganta:[['Jux','Uma trilha estreita ao lado do cristal, descendo entre paredões de rocha.'],['Bino','…Cheiro de lobo. Muito.'],['Aurora','A Garganta Gelada, Portador. O caminho até a caverna passa por ela.']],
  entrada_trilha:[['Jux','De volta à trilha. O santuário fica logo ali.']],
  caverna_fechada:[['Jux','A entrada daqui está tomada por gelo e pedra. Nem a Aurora corta isso.'],['Aurora','O caminho é pela Garganta, Portador. Ao lado do cristal.']],
  entrada_vale:[['Jux','Uma trilha subindo na névoa, ao lado da torre. Marcas de garra nas pedras dos dois lados.'],['Bino','…Muitos lobos lá em cima.'],['Aurora','O Vale dos Lobos, Portador. Lugar bom para ficar mais forte. E ruim para ficar parado.']],
  saida_vale:[['Jux','De volta para a Garganta.']],
  vale_chega:[['Jux','Um vale aberto, uma toca enorme no meio e ossos para todo lado.'],['Aurora','Território dos lobos, Portador. Eles vêm em bando aqui, e vêm rápido.'],['Jux','Ótimo. Eu precisava mesmo de um lugar para treinar.'],['Bino','…Fica perto de mim.']],
  garganta_chega:[['Jux','A Garganta Gelada. Paredões de rocha, névoa baixa e marcas de garra na pedra.'],['Aurora','Um acampamento de caçador, um rio congelado e… o sol negro riscado no chão, Portador.'],['Jux','A Ordem passou por aqui. E o lobo ainda está atrás daqueles dentes de gelo, lá no fundo.']],
  saida_vila:[['Jux','De volta para Invernália. A Vovó deve estar com chá pronto.'],['Jux','Ou com uma bronca pronta. Geralmente as duas.']],
  prova_pegadas:[['Jux','Pegadas. Do tamanho de uma panela. E a neve em volta ainda brilha.'],['Aurora','Não são do Skoll, Portador. São de alguém bem maior… que veio buscá-lo. E há uma memória nelas.'],
    ['Jux','Uma memória de quê? Eu estava torcendo para ser de um coelho.'],['Aurora','De um caçador antigo. Um Eco. As pegadas atravessam o Vale dos Lobos e sobem até o Pico do Uivo.'],
    ['Aurora','Mas ele não se entrega a quem não prova valor. Sinto um poder enorme lá: abaixo do nível 12, você não tem chance.'],['✦','Nova missão: A prova do lobo.']],
  prova_fenrir:[['Jux','Um círculo de pedras com lobos gravados, um crânio do tamanho de uma casa e a sensação de estar sendo observado por algo que come estrategistas.'],['Aurora','Ele está aqui. Mostre que é digno, Portador.'],
    ['Aurora','Nível recomendado: 12. Se estiver fraco, treine, melhore o equipamento e volte. Ele espera.']],
  pico_cedo:[['✦','Uma trilha estreita sobe a montanha, coberta de neve funda. O vento lá em cima uiva.'],['Aurora','Ainda não, Portador. Nada nos chama para lá… por enquanto.']],
  entrada_pico:[['Jux','As pegadas sobem por aqui. Bem por aqui, onde a trilha some na neve.'],['Aurora','O Pico do Uivo. Dizem que lá em cima a lua fica mais perto.'],['Jux','E o vento, pelo barulho, fica mais perto ainda.']],
  saida_pico:[['Jux','Descendo. Devagar, que o vento quer me levar junto.']],
  pico_chega:[['✦','O vento bate de frente. A neve corre de lado, rente ao chão.'],['Jux','Que ventania! Meu cabelo vai chegar no Vale antes de mim.'],['Aurora','Lá no alto, Portador: um círculo de pedras antigas. As pegadas terminam nele.']],
  mirante_pico:[['✦','Lá embaixo, o Vale dos Lobos inteiro: os pinheiros pequenos, a névoa, o rio fino brilhando sob a lua.'],['Jux','Daqui dá para ver a Garganta. E, se eu forçar a vista, a chaminé da Vovó.'],['Aurora','Daqui também se vê quem sobe, Portador. Ele sempre soube que você vinha.']],
  circulo_pico:[['✦','O círculo de pedras está em silêncio. As runas de lobo brilham fraco, e o vento parece contornar o círculo.'],['Aurora','Um lugar antigo. Ele dormiu aqui por muito tempo.']],
  ordem_ve:[['Jux','Sol negro com um olho no meio. Esse desenho tá me seguindo desde que eu cheguei. Alguém me explica?'],['Aurora','Segure firme a lâmina, Portador. Eu vou te mostrar.',1]],
  ordem_depois:[['Jux','…E eu não tenho sombra.'],['Aurora','Por isso vão te querer, Portador. Você é o único que eles não conseguem esvaziar.',1],
    ['Jux','Imune ao golpe principal do vilão. Isso nunca dá errado nas histórias.'],['Bino','…Eu fico na frente.'],
    ['Jux','Primeiro a gente acha o Halvard. Depois a gente apaga essa Ordem.'],['✦','Diário: A Ordem do Eclipse (menu → Missões).']],
  garganta_chega_cedo:[['Jux','A Garganta Gelada. Paredões de rocha, névoa baixa e marcas de garra na pedra.'],['Aurora','Um acampamento de caçador, um rio congelado e… o sol negro riscado no chão, Portador.'],['Jux','Alguém que gosta de sol negro passou por aqui. E o lobo ainda está atrás daqueles dentes de gelo, lá no fundo.']],
  portao_fechado:[['Jux','Lá fora tem lobo de olho roxo e gente sumindo.'],['Aurora','Antes de sair, Portador, escute a vila. Alguém aqui precisa de você.',1],['✦','Fale com a Vovó Hilda (! em cima da cabeça).']],
  garganta_fechada:[['Aurora','Ainda não, Portador. O que está acontecendo aqui na trilha ainda não acabou.',1],['Jux','Lobos de olho roxo, um acampamento abandonado e um santuário apagando. Tá, entendi o recado.']],
  vovo_depois:[['Vovó Hilda','Hmpf. Ainda vivo, forasteiro sem sombra.'],['Jux','Vivo e com uma espada que fala. Subi de nível.'],['Vovó Hilda','Coma alguma coisa. E não morra perto da minha casa.']],
  borin_espada:[['Borin','HA! O forasteiro que tirou a Aurora do altar! Vinte anos eu puxei aquilo…'],['Jux','Você puxou. Eu perguntei.'],['Borin','…Isso não faz sentido nenhum.'],['Borin','*funga*'],['Jux','Fuligem no olho de novo?'],['Borin','É! Fuligem! Compra alguma coisa e some daqui!']],
  borin_resgate:[['Borin','O HALVARD VOLTOU! Eu chorei tanto que apaguei a forja, sabia?'],['Jux','A Vovó me contou. Duas vezes.'],['Borin','Pra você, forasteiro, a forja acende quando quiser. E o preço… quase justo.'],['Jux','Quase justo já é um avanço histórico.']],
  tico_espada:[['Tico','VOCÊ PEGOU A ESPADA! Eu sabia! Eu SABIA!'],['Jux','Ela que me pegou. Eu só fiz a pergunta certa.'],['Tico','Me ensina a pergunta?'],['Jux','Primeiro você aprende a planilha.'],['Tico','A MAGIA ANTIGA E TERRÍVEL?!']],
  tico_resgate:[['Tico','Moço do céu! Meu pai voltou! Ele disse que você lutou com um lobo do tamanho de uma casa!'],['Jux','Do tamanho de uma casa pequena. Uma casinha.'],['Tico','Quando eu crescer, eu vou ser estrategista igual você.'],['Jux','Então começa hoje: arruma o quarto em três turnos.'],['Tico','…Isso é muito difícil.']],
  derrota_chefe:[['Aurora','Recue, Portador. Respire. Ele ainda está ali.',1],['Jux','Primeira tentativa foi reconhecimento de terreno. Agora eu sei o padrão.'],['✦','HP e MP recuperados. Fale com ele de novo quando estiver pronto.']],
  prova_depois:[['Aurora','Sábio. Volte quando estiver pronto, Portador.'],['Fenrir','…Eu espero.']],
  prova_vence:[['Jux','…Eu ganhei? De um lobo do tamanho de um cavalo?'],['Fenrir','Você luta como quem protege alguém.'],['Fenrir','Mil caçadas, e poucos me fizeram recuar.'],
    ['Fenrir','Sua lâmina é de gelo, como a minha. A minha lealdade é sua, Portador.'],['Aurora','O Eco da Lâmina. O Fenrir caçava ao lado dos heróis antigos. Agora caça ao seu lado.'],
    ['Jux','Bem-vindo à equipe. O salário é em gil e elogios.'],['✦','O Fenrir agora é seu Eco, já equipado! (menu → Ecos)']],
  caverna:[['Jux','Uma caverna de gelo com dentes. Literalmente com dentes.'],['Aurora','Há algo vivo lá dentro, Portador. Algo grande, e muito triste.'],['Aurora','Eu recomendo o nível 7 antes de entrar. Explore a trilha e a Garganta, junte equipamento e volte.'],
    ['Jux','Triste? Eu estava esperando "faminto".'],['Aurora','Também. Mas o triste é pior.'],['✦','Nível recomendado: 7 para entrar, 10 para o que espera no fundo. Se estiver fraco, treine e melhore o equipamento.']],
  acamp_pista:[['Jux','Acampamento goblin. E o dono saiu correndo e deixou o jantar. Literalmente: tem pão pela metade.'],['Goblin','(de longe) NÃO VOLTA AQUI! Tem um olho lá embaixo!'],
    ['Jux','Um mapa rasgado, com um sol negro e um olho no meio. Eles não estavam fugindo de mim.'],['Aurora','Estavam fugindo de quem desenha isso.'],['✦','Pista: o mapa rasgado do sol negro.']],
  acolito_aparece:[['Jux','O cristal do santuário está apagando. E tem alguém de capuz preto bebendo a luz dele.'],['Bino','…Frio. Não é de neve.'],['Jux','Isso foi poesia? Vindo de você?'],['Bino','Não.'],
    ['Acólito','…O Arauto manda lembranças, Portador sem sombra.'],['Bino','…Ele sabe quem você é.'],['Jux','Capuz preto, símbolo de olho, fala misteriosa. Você é o inimigo mais previsível do mundo. Parabéns.'],
    ['Aurora','Cuidado. Ele não sente medo. Isso o torna perigoso, não forte.'],['Bino','Eu fico na frente.'],['Jux','Você sempre fica na frente. Eu só preciso ficar atrás com estilo.'],['✦','O Acólito do Eclipse ergue o cajado!']],
  acolito_vence:[['Jux','Ele não gritou. Nem caiu. Ele esvaziou.'],['Bino','…Não tinha ninguém lá dentro.'],['Aurora','Só o manto ficou. Quem estava ali dentro já tinha ido embora faz tempo.'],['Jux','Isso foi pior do que gritar.'],
    ['Aurora','O cristal ainda brilha, fraco. A Ordem tirava a luz dele para alimentar algo preso na caverna.'],['Jux','Caverna. Lobo triste. Agora faz sentido.'],['Bino','O Halvard. Vamos.'],['✦','Pista: o que a Ordem prendeu está na caverna, ao sul.']],
  caverna_entra:[['Jux','Uma caverna de gelo com dentes. Literalmente com dentes.'],['Aurora','Há algo vivo lá no fundo, Portador. Algo grande, e muito triste.'],['Aurora','Lá dentro não há luz nenhuma. Eu recomendo o nível 10 antes de ir até o fim.'],['Jux','Triste? Eu estava esperando "faminto".'],['Aurora','Também. Mas o triste é pior.']],
  saida_caverna:[['Jux','De volta para a Garganta. Ar fresco. Relativamente.']],
  caverna_chega:[['Jux','Escuro. Bem escuro. Não dá para ver nem a minha mão.'],['Aurora','Enquanto eu estiver na sua mão, Portador, você nunca vai ficar no escuro.',1],['✦','A lâmina da Aurora Gélida fica incandescente e ilumina o caminho.'],['Bino','…Correntes. Muitas.'],['Jux','E garras na parede. Fiquem perto da luz.']],
  tunel_garras:[['✦','Um túnel baixo. Correntes grossas presas em argolas de ferro, e na rocha, quatro riscos fundos de garra, ainda brilhando de gelo.'],['Jux','Essas garras são do tamanho do meu braço. Do braço do Bino.'],['Aurora','Ele tentou cavar para fora, Portador. Muitas vezes. A Ordem só puxou as correntes mais curtas.',1],['Jux','…Agora fiquei com pena de um lobo gigante. Que dia.']],
  camara_ve:[['✦','Uma câmara redonda. Um feixe de luar cai do teto sobre runas roxas. Quatro estacas de ferro. E, no meio, correntes esticadas até algo enorme.'],['Aurora','É ele, Portador. O Skoll. Preso pela Ordem.'],['Jux','Lobo gigante acorrentado no escuro. Ótimo. Exatamente o que eu queria hoje.'],['✦','Nível recomendado: 10. Se estiver fraco, explore a caverna, treine e volte.']],
  caverna_depois:[['Aurora','Sábio. A caverna não vai a lugar nenhum.'],['Jux','Só os dentes dela. Esses ficam.']],
  caverna_livre:[['Jux','Vazia. As correntes quebradas no chão e nenhuma pegada de volta.'],['Aurora','Ele está livre, Portador. O que você fez aqui vai importar.']],
  skoll_vence:[['Jux','Ele não estava bravo. Estava acorrentado.'],['Aurora','A marca do Eclipse se partiu. Por um instante, ele voltou a ser quem era.'],
    ['Skoll','…A matilha ainda precisa de você. E meu pai também.'],['Jux','Pai? Que pai? Aurora, o lobo falou em enigma de novo.'],
    ['Aurora','Depois. Olhe, Portador: ali, no fundo da caverna, entre as pedras. Um gorro de pele de lobo, rasgado.'],['Jux','…Aurora. Isso é do Halvard.'],
    ['✦','Preso por uma corrente com o selo do Eclipse, um caçador de capuz de pele está caído na neve. Ainda respira.'],
    ['Halvard','…mil sóis negros… tinha um lobo… ele chorava…',3],['Jux','Calma. Ninguém aqui vai te prender de novo. Quebrei as correntes.'],
    ['Halvard','Eu tentei soltá-lo… eles me pegaram… faz quantos dias?',0],['Jux','Três. O Tico não para de te esperar. Ele me chama de deus, mas só porque ainda não te viu voltar.'],
    ['Halvard','Meu menino…',3],['Aurora','A Ordem o mantinha vivo para ouvir o lobo. Isso ainda não acabou, Portador.',],
    ['Halvard','Obrigado, forasteiro. Eu devo a vida a você… e ao lobo.',1],['Jux','O lobo aceita agradecimento em carne. Eu aceito um abraço do Tico.'],
    ['✦','A caverna está livre. Lá fora, na boca da caverna, pegadas enormes brilham na neve.']],
  santuario:[['Aurora','Um cristal antigo… ele me reconhece.'],['✦','O cristal pulsa e o frio fica em silêncio. Aqui os monstros não chegam.'],['✦','Jogo salvo.']],
  acampamento:[['Jux','Acampamento goblin. Pão roubado, fogueira apagada e zero organização.'],['Jux','Se eu fosse goblin, pelo menos teria uma planilha de saque.']],
  gelo:[['Jux','…Gelo. Liso. Perfeito.'],['Jux','Mil anos de histórias heroicas e ninguém nunca perguntou: e se o herói patinasse?'],
    ['Aurora','Portador. Há lobos de olhos roxos lá fora e você está se divertindo num lago.'],['Jux','Estou fazendo reconhecimento de terreno. Do tipo que dá piruetas.'],
    ['Aurora','…Eu vou fingir que não te conheço.'],['Jux','Pose heroica agora. Alguém anota isso para a lenda.']],
  trilha_chega:[['Jux','A Trilha dos Pinheiros. Neve, silêncio e alguma coisa me olhando do mato.'],['Aurora','Lobos, Portador. E goblins. E… uma bola de neve com raiva.'],['Jux','Encontros aleatórios. Finalmente um RPG de respeito.']],
  portao_sai:[['Jux','A estrada para fora de Invernália. Com a Aurora nas costas, agora sim.'],['Aurora','Se você morrer no primeiro lobo, eu volto pro altar.']],
  derrota:[['Vovó Hilda','Te acharam desmaiado lá fora, forasteiro. Arrastaram até aqui.'],['Jux','Recuo estratégico.'],['Vovó Hilda','Recuo de bunda na neve, isso sim. Vá se equipar direito.']],
  poco:[['Jux','Um poço congelado. Jogo uma moeda e faço um pedido?'],['Jux','…Sem moeda. Pedido negado. Esse mundo é consistente, pelo menos.']],
};
const NOMES={camara_alfa:'Câmara do Alfa',saida_caverna:'Saída da caverna',tunel_garras:'Túnel das correntes',caverna:'Caverna de gelo (entrada)',entrada_vale:'Trilha para o Vale dos Lobos',saida_vale:'Descida para a Garganta',floco:'Sr. Floco',capitao:'Capitão Dente-de-Ferro (mercador)',saida_garganta:'Caminho para a Garganta Gelada',entrada_trilha:'Arco de volta à trilha',caverna_fechada:'Caverna de gelo (bloqueada)',prova_pegadas:'Pegadas enormes',prova_fenrir:'Círculo de pedras',circulo_pico:'Círculo de pedras',entrada_pico:'Trilha do Pico do Uivo',saida_pico:'Descida para o Vale',mirante_pico:'Mirante',saida_vila:'Caminho de volta para a vila',caverna:'Caverna de gelo',santuario:'Santuário do cristal',acampamento:'Acampamento goblin',fogueira:'Fogueira',arvore:'Árvore das lanternas',barraca_comida:'Barraca de comida',barraca_bebida:'Barraca de bebida',
  ferraria:'Ferraria',bacon:'Sir Bacon',tico:'Tico',borin:'Borin',ingrid:'Ingrid, a padeira',oskar:'Oskar, o lenhador',halvard:'Halvard, o caçador',vovo:'Vovó Hilda',altar:'Altar da espada',portao:'Portão',poco:'Poço'};
const COR={Jux:'#bff0ff',Aurora:'#c9b8ff','Sir Bacon':'#ffb6c8',Vendedora:'#ffd88a',Fenrir:'#9fe8ff',Skoll:'#c9a6ff',Halvard:'#ffd9a6','Bolotão':'#9fd8ff','Sr. Floco':'#cfeaff',Bino:'#d8b48a','Acólito':'#c9a6ff',Goblin:'#a6d96a'};

/* ---------- estado */
// mapa novo (1448 px, objetos maiores): heroi, velocidades e passadas 1,3x
const Z=.8,VEL=70,VELC=125,PULO=.62,PASSO_A=9,PASSO_C=8.5,PASSO_R=10.5,ESC_H=.37;   // andar e correr (px do mapa por segundo), duracao do pulo (s)
const hero={x:V.inicio[0],y:V.inicio[1],dir:1,olha:'baixo',espada:false,dist:0,rastro:[],anda:false,t:0,alvo:null,pontoAlvo:null,pulo:0,passo:0,lado:1};
const cam={x:hero.x,y:hero.y};
let fala=null,perto=null,t=0,puloFalado=false;
const teclas={};
const flocos=[];for(let i=0;i<110;i++)flocos.push({x:rnd(0,W),y:rnd(0,H),v:rnd(18,55),s:rnd(1,2.8),o:rnd(0,6),z:rnd(.5,1.2)});
const NEVE=window.JUX_NEVE||null,NEVEI=new Image();if(NEVE)NEVEI.src=NEVE.atlas;
const trilhasNeve=[];   // neve BATIDA: onde o Jux passa varias vezes a marca fica funda (cada ponto conta as pisadas)
const fumaca=[],pegadas=[],poeira=[],chamas=[],brilhoRio=[];
/* ---------- vida no mapa (tools/vila_agua.py -> vila_agua.js): agua ondulando com reflexos correndo, cachoeiras com
   espuma e nevoa, circulos na agua, bandeiras no vento, estrelinhas nos cristais, gelo brilhante flutuando,
   neve caindo da copa e rajadas de vento */
const AG=window.JUX_AGUA||null;
let agN=0,agUltK='';let agMask=null,agCor=null,agTmp=null,agPad=null,agPat=null,agSuave=null,agTex=null,agTexPat=null;const agPx=[];
if(window.JUX_AGUA&&JUX_AGUA.textura){agTex=new Image();agTex.src=JUX_AGUA.textura;}
const respingos=[],aneis=[],estrelas=[],motes=[],nevoa=[],neveCopa=[];let vento=0;
const LANTERNAS=[[602,490],[637,505],[670,462],[812,490],[851,480],[900,460],[930,476],[735,182],[870,225],[848,140]];
if(AG){const [x0,y0,x1,y1]=AG.caixa,w=x1-x0,h=y1-y0;
  const mk=new Image();mk.onload=()=>{
    agMask=document.createElement('canvas');agMask.width=w;agMask.height=h;const mc=agMask.getContext('2d');mc.drawImage(mk,0,0);
    const id=mc.getImageData(0,0,w,h),md=id.data;for(let i=0;i<w*h;i+=5)if(md[i*4]>127)agPx.push(i);
    for(let i=0;i<w*h;i++){md[i*4+3]=md[i*4];md[i*4]=md[i*4+1]=md[i*4+2]=255;}mc.putImageData(id,0,0);   // branco = agua -> vira transparencia (recorte)
    const prep=()=>{agCor=document.createElement('canvas');agCor.width=w;agCor.height=h;const c=agCor.getContext('2d');
      c.drawImage(MAPA,x0*K,y0*K,w*K,h*K,0,0,w,h);c.globalCompositeOperation='destination-in';c.drawImage(agMask,0,0);};
    if(MAPA.complete&&MAPA.naturalWidth)prep();else MAPA.addEventListener('load',prep);
    agTmp=document.createElement('canvas');agTmp.width=w;agTmp.height=h;
    // mascara com a borda esfumada: a agua nova se mistura com as pedras em vez de ter borda dura
    agSuave=document.createElement('canvas');agSuave.width=w;agSuave.height=h;const sc=agSuave.getContext('2d');sc.filter='blur(1.6px)';sc.drawImage(agMask,0,0);
  };mk.src=AG.mascara;
  // textura dos reflexos: tracos de luz curvinhos que se repetem sem emenda
  const p=document.createElement('canvas');p.width=160;p.height=48;const pc=p.getContext('2d');
  pc.strokeStyle='#e4fbff';pc.lineCap='round';
  for(let i=0;i<30;i++){const x=Math.random()*160,y=2+Math.random()*44,l=5+Math.random()*15;pc.lineWidth=.5+Math.random()*.8;pc.globalAlpha=.3+Math.random()*.7;
    for(const ox of[0,-160]){pc.beginPath();pc.moveTo(x+ox,y);pc.quadraticCurveTo(x+ox+l/2,y-1.6,x+ox+l,y);pc.stroke();}}
  agPad=p;
}
/* ---------- Sir Bacon (tools/cut_bacon.py -> vila_bacon.js): passeia no chiqueiro; quando o Jux pula a cerca, vai atras
   (pula a mesma cerca) e passa a seguir o Jux pelo mesmo caminho que ele fez (trilha), como seguidor de JRPG.
   Parado: respira, fuca, senta, se coca e, se o Jux demora, dorme. */
const BAC=(window.JUX_NPC||{}).bacon||null;
const BACI=new Image();if(BAC)BACI.src=BAC.atlas;
const trilha=[];   // posicoes do Jux: {x,y,p} (p = progresso do pulo 0..1, ou -1 andando)
const bacon={vel:60,mov:false,vx:0,vy:1,trocaT:0,animT:0,paradoVis:1,x:250,y:800,olha:'baixo',dist:0,acao:'respira',at:0,ad:3,parado:0,segue:false,vaiSeguir:0,alvo:null,p:-1,anda:false,pts:[]};
const PORCO_PONTO=V.pontos.find(p=>p.id==='bacon');
function porcoLivre(x,y){for(let dy=-2;dy<=2;dy+=2)for(let dx=-5;dx<=5;dx+=5)if(!(ter(x+dx,y+dy)&1))return false;return true;}
let oincT=rnd(2,5);
function oinc(v){const dh=Math.hypot(hero.x-bacon.x,hero.y-bacon.y);som(OINC[(Math.random()*OINC.length)|0],clamp(1-dh/220,0,1)*(v||.7));}
function baconPasso(dt){
  if(!BAC)return;
  oincT-=dt;if(oincT<=0){oincT=bacon.acao==='dorme'?rnd(6,10):rnd(3,8);oinc(bacon.acao==='dorme'?.25:.6);}
  // trilha do Jux (a cada 3 px, e todo quadro durante o pulo)
  const u=trilha[trilha.length-1];
  if(!u||hero.pulo>0||Math.hypot(hero.x-u.x,hero.y-u.y)>=3){trilha.push({x:hero.x,y:hero.y,p:hero.pulo>0?1-clamp(hero.pulo/(hero.puloD||PULO),0,1):-1});if(trilha.length>700)trilha.shift();}
  if(bacon.vaiSeguir>0){bacon.vaiSeguir-=dt;if(bacon.vaiSeguir<=0){bacon.segue=true;
    // comeca do ponto onde o Jux comecou o pulo para fora do chiqueiro
    let i=trilha.length-1;while(i>0&&trilha[i].p<0)i--;while(i>0&&trilha[i-1].p>=0)i--;bacon.pts=trilha.slice(Math.max(0,i-4));trilha.length=0;
    som(GUINCHO,.5);}}
  let mx=0,my=0;bacon.anda=false;
  if(bacon.segue){
    // os pontos novos da trilha vao para a fila do porco
    if(trilha.length){bacon.pts.push(...trilha);trilha.length=0;if(bacon.pts.length>900)bacon.pts.splice(0,bacon.pts.length-900);}
    let resto=0,ax=bacon.x,ay=bacon.y;for(const q of bacon.pts){resto+=Math.hypot(q.x-ax,q.y-ay);ax=q.x;ay=q.y;}
    const GAP=24;
    // com folga: so comeca a andar quando fica 12 px mais longe e so para ao chegar perto (nada de liga-desliga)
    if(!bacon.mov&&resto>GAP+12)bacon.mov=true;if(bacon.mov&&resto<=GAP)bacon.mov=false;
    const alvoV=resto>110?140:resto>55?95:Math.max(58,(hero.anda?(hero.corre?VELC:VEL):60)*.95);bacon.vel+=(alvoV-bacon.vel)*Math.min(1,dt*3);
    if(bacon.mov){let v=bacon.vel*dt;bacon.anda=true;
      while(v>0&&bacon.pts.length&&resto>GAP){const q=bacon.pts[0],d=Math.hypot(q.x-bacon.x,q.y-bacon.y);
        if(d<=v){mx+=q.x-bacon.x;my+=q.y-bacon.y;bacon.x=q.x;bacon.y=q.y;if(q.p>=0&&bacon.p<0)som(GUINCHO,.55);bacon.p=q.p;bacon.pts.shift();v-=d;resto-=d;}
        else{const k=v/d;mx+=(q.x-bacon.x)*k;my+=(q.y-bacon.y)*k;bacon.x+=(q.x-bacon.x)*k;bacon.y+=(q.y-bacon.y)*k;resto-=v;v=0;}}
      if(bacon.p>=0&&(!bacon.pts.length||bacon.pts[0].p<0))bacon.p=-1;
    }else bacon.p=-1;
  }else{
    // passeando no chiqueiro
    if(!bacon.alvo&&bacon.parado>bacon.ad){for(let k=0;k<20;k++){const x=rnd(160,380),y=rnd(752,822);if(porcoLivre(x,y)&&Math.hypot(x-bacon.x,y-bacon.y)>25){bacon.alvo={x,y};break;}}}
    if(bacon.alvo){const ax=bacon.alvo.x-bacon.x,ay=bacon.alvo.y-bacon.y,d=Math.hypot(ax,ay),v=26*dt;
      if(d<2)bacon.alvo=null;else{const nx=bacon.x+ax/d*v,ny=bacon.y+ay/d*v;
        if(porcoLivre(nx,ny)){mx=nx-bacon.x;my=ny-bacon.y;bacon.x=nx;bacon.y=ny;bacon.anda=true;}else bacon.alvo=null;}}
  }
  if(bacon.anda){const ml=Math.hypot(mx,my);bacon.dist+=ml;bacon.parado=0;bacon.acao=null;bacon.paradoVis=0;
    // direcao suavizada (a trilha tem zigue-zague nas quinas): so troca de lado se a nova direcao durar um instante
    if(ml>.01){const k=Math.min(1,dt*9);bacon.vx+=(mx/ml-bacon.vx)*k;bacon.vy+=(my/ml-bacon.vy)*k;}
    const cand=Math.abs(bacon.vx)>Math.abs(bacon.vy)*1.15?(bacon.vx<0?'esquerda':'direita'):Math.abs(bacon.vy)>Math.abs(bacon.vx)*1.15?(bacon.vy<0?'cima':'baixo'):bacon.olha;
    if(cand!==bacon.olha){bacon.trocaT+=dt;if(bacon.trocaT>.14){bacon.olha=cand;bacon.trocaT=0;}}else bacon.trocaT=0;
    bacon.animT+=dt*clamp(ml/dt/8,4,10);}   // passada: 4 a 10 quadros por segundo conforme a velocidade
  else{bacon.parado+=dt;bacon.at+=dt;bacon.paradoVis+=dt;
    if(!bacon.acao||bacon.at>bacon.ad){bacon.at=0;
      const longe=bacon.segue&&bacon.parado>16;bacon.acao=longe?'dorme':['respira','respira','fuca','senta','coca'][(Math.random()*5)|0];
      bacon.ad=bacon.acao==='dorme'?99:bacon.acao==='senta'?rnd(3,5):rnd(1.6,3);if(!bacon.segue)bacon.ad=Math.min(bacon.ad,3);}}
  if(PORCO_PONTO){PORCO_PONTO.x=bacon.x;PORCO_PONTO.y=bacon.y-4;PORCO_PONTO.r=!bacon.segue?46:bacon.parado>2?34:30;}
}
function baconQuadro(){
  const Q=BAC.quadros;
  if(bacon.anda||bacon.paradoVis<.12){const c=Q[bacon.olha];return c[Math.floor(bacon.animT)%c.length];}
  const a=bacon.acao||'respira',c=Q[a]||Q.respira,fps={respira:1.4,fuca:4,dorme:.9,senta:1,coca:5}[a]||1.5;
  return c[Math.floor(bacon.at*fps)%c.length];
}
function desenhaBacon(){
  if(!BAC||!BACI.complete)return;
  const q=baconQuadro(),s=BAC.escala,pulo=bacon.p>=0?-Math.sin(Math.PI*bacon.p)*11:0;
  const quique=bacon.anda&&bacon.p<0?-Math.abs(Math.sin(bacon.animT*Math.PI))*.8:0;
  ctx.save();ctx.translate(bacon.x,bacon.y+pulo+quique);ctx.scale(s,s);
  ctx.drawImage(BACI,q*BAC.w,0,BAC.w,BAC.h,-BAC.ancora[0],-BAC.ancora[1],BAC.w,BAC.h);ctx.restore();
  // objetos na frente dele (passando atras de casa, cerca, arvore)
  const bb=[bacon.x-10,bacon.y-24,bacon.x+10,bacon.y];
  if(bacon.p<0)for(const f of FR){if(bacon.y>=f.base||bb[2]<f.x||bb[0]>f.x+f.w||bb[3]<f.y||bb[1]>f.y+f.h)continue;ctx.drawImage(f.i,f.x,f.y,f.w,f.h);}
}
/* ---------- Tico (tools/cut_npc.py -> vila_npc_tico.js): corre brincando pela praca; quando ve o Jux vem correndo,
   pula de alegria e fica admirando; de vez em quando faz uma bola de neve e joga nele */
const TIC=(window.JUX_NPC||{}).tico||null;const TICI=new Image();if(TIC)TICI.src=TIC.atlas;
const tico={x:690,y:715,olha:'baixo',dist:0,acao:'respira',at:0,ad:2,anda:false,alvo:null,viu:false,cd:6,corre:false,fila:[]};
const bolas=[];
const TICO_PONTO={id:'tico',x:tico.x,y:tico.y,r:0};if(NA_VILA)V.pontos.push(TICO_PONTO);
function ticoAcoes(lista){tico.fila=lista.slice();ticoProxima();}
function ticoProxima(){const a=tico.fila.shift();if(!a){tico.acao='respira';tico.ad=rnd(1.2,2.6);tico.at=0;return;}
  tico.acao=a[0];tico.ad=a[1];tico.at=0;
  if(a[0]==='joga'){const ox=hero.x<tico.x?-8:8;bolas.push({x0:tico.x+ox,y0:tico.y-16,x1:hero.x+rnd(-6,6),y1:hero.y-rnd(0,4),v:0,d:.55});som(SOM.whoosh,.3);}}
function ticoPasso(dt){
  if(!TIC)return;
  const dh=Math.hypot(hero.x-tico.x,hero.y-tico.y);tico.cd-=dt;
  if(dh>260)tico.viu=false;
  const ocupado=tico.fila.length||(tico.acao!=='respira'&&tico.at<tico.ad);
  if(!tico.alvo&&!ocupado&&!fala){
    if(!tico.viu&&dh<120){const d=Math.max(1,dh),k=(dh-24)/d;tico.alvo={x:tico.x+(hero.x-tico.x)*k,y:tico.y+(hero.y-tico.y)*k,depois:'oi'};tico.corre=true;}
    else if(dh<170&&tico.cd<=0&&!hero.anda){tico.cd=rnd(9,14);ticoAcoes([['bola',.9],['joga',.55],['ri',1.4]]);}
    else if(dh<70&&Math.random()<dt*.6){ticoAcoes([[['admira','acena','ri','pula'][(Math.random()*4)|0],rnd(1,2)]]);}
    else if(tico.at>tico.ad&&Math.random()<dt*1.2){
      for(let i=0;i<20;i++){const a=rnd(0,6.283),r=rnd(40,190),x=745+Math.cos(a)*r*1.3,y=690+Math.sin(a)*r*.45;
        if(livre(x,y)&&Math.hypot((x-740)/80,(y-660)/48)>1&&Math.hypot(x-tico.x,y-tico.y)>40){tico.alvo={x,y};tico.corre=Math.random()<.6;break;}}}
  }
  tico.anda=false;
  if(tico.alvo){const ax=tico.alvo.x-tico.x,ay=tico.alvo.y-tico.y,d=Math.hypot(ax,ay),v=(tico.corre?92:48)*dt;
    if(d<3){const dep=tico.alvo.depois;tico.alvo=null;
      if(dep==='oi'){tico.viu=true;ticoAcoes([['pula',1.1],['admira',1.8],['acena',1.2]]);}else{tico.acao='respira';tico.at=0;tico.ad=rnd(1,3);}}
    else{const nx=tico.x+ax/d*Math.min(v,d),ny=tico.y+ay/d*Math.min(v,d);
      if(livre(nx,ny)){tico.dist+=Math.hypot(nx-tico.x,ny-tico.y);tico.x=nx;tico.y=ny;tico.anda=true;
        tico.olha=Math.abs(ax)>Math.abs(ay)*1.1?(ax<0?'esquerda':'direita'):(ay<0?'cima':'baixo');}
      else tico.alvo=null;}}
  if(!tico.anda){tico.at+=dt;if(tico.fila.length&&tico.at>=tico.ad)ticoProxima();}
  for(const b of bolas){b.v+=dt;if(b.v>=b.d&&!b.caiu){b.caiu=true;poeiraNeve(b.x1,b.y1,12);som(PASSOS[0],.45);}}
  for(let i=bolas.length-1;i>=0;i--)if(bolas[i].v>b_fim)bolas.splice(i,1);
  TICO_PONTO.x=tico.x;TICO_PONTO.y=tico.y-4;TICO_PONTO.r=tico.anda&&tico.corre?34:44;
}
const b_fim=.9;
function desenhaNpc(D,img,x,y,q,espelho,bw,bh){
  const s=D.escala;ctx.save();ctx.translate(x,y);ctx.scale(espelho?-s:s,s);
  ctx.drawImage(img,q*D.w,0,D.w,D.h,-D.ancora[0],-D.ancora[1],D.w,D.h);ctx.restore();
  const bb=[x-bw,y-bh,x+bw,y];   // objetos na frente dele (atras de casa, cerca, arvore)
  for(const f of FR){if(y>=f.base||bb[2]<f.x||bb[0]>f.x+f.w||bb[3]<f.y||bb[1]>f.y+f.h)continue;ctx.drawImage(f.i,f.x,f.y,f.w,f.h);}
}
function desenhaTico(){
  if(!TIC||!TICI.complete)return;const Q=TIC.quadros;let q,oy=0,esp=false;
  if(tico.anda){const c=Q[tico.olha];q=c[Math.floor(tico.dist/(tico.corre?8:6))%c.length];oy=-Math.abs(Math.sin(tico.dist/(tico.corre?8:6)*Math.PI))*1.2;}
  else{const a=tico.acao,c=Q[a]||Q.respira;q=c[Math.floor(tico.at*1.6)%c.length];
    if(a==='pula')oy=-Math.abs(Math.sin(tico.at*Math.PI/.45))*8;
    if(a==='ri')oy=-Math.abs(Math.sin(tico.at*14))*.8;
    if(a==='joga'||a==='bola')esp=hero.x<tico.x;}
  desenhaNpc(TIC,TICI,tico.x,tico.y+oy,q,esp,10,34);
}
function desenhaBolas(){
  for(const b of bolas){if(b.caiu)continue;const q=b.v/b.d,x=b.x0+(b.x1-b.x0)*q,y=b.y0+(b.y1-b.y0)*q-Math.sin(Math.PI*q)*16;
    ctx.fillStyle='rgba(20,40,80,.25)';ctx.beginPath();ctx.ellipse(x,b.y0+(b.y1-b.y0)*q+16*(1-q)*0,2.2,1,0,0,6.283);ctx.fill();
    ctx.fillStyle='#f4fbff';ctx.beginPath();ctx.arc(x,y,2.3,0,6.283);ctx.fill();ctx.fillStyle='#bcd8f0';ctx.fillRect(x-.5,y+.6,1.6,1);}
}
/* ---------- Vovo Hilda (tools/cut_npc.py -> vila_npc_vovo.js): passeia devagar na frente de casa, toma cha, pensa e
   sorri. Se o Jux passa correndo perto, bate a bengala e reclama; se ele insiste em ficar colado, leva bengalada. */
const VOV=(window.JUX_NPC||{}).vovo||null;const VOVI=new Image();if(VOV)VOVI.src=VOV.atlas;
const vovo={x:300,y:588,olha:'baixo',dist:0,acao:'cha',at:0,ad:4,anda:false,alvo:null,fila:[],brava:0};
const VOVO_PONTO=V.pontos.find(p=>p.id==='vovo');
const baloes=[];   // falinhas rapidas em cima da cabeca: {quem, txt, v}
function balao(quem,txt){if(baloes.some(b=>b.quem===quem&&b.v<1.6))return;baloes.push({quem,txt,v:0});}
const BRONCAS=['Devagar, menino!','Não se corre na frente dos mais velhos!','Quer escorregar e quebrar a bacia?','Eu tenho 90 anos e ando mais reto que você!'];
function vovoAcoes(lista){vovo.fila=lista.slice();vovoProxima();}
function vovoProxima(){const a=vovo.fila.shift();if(!a){vovo.acao='respira';vovo.ad=rnd(2,4);vovo.at=0;return;}vovo.acao=a[0];vovo.ad=a[1];vovo.at=0;
  if(a[0]==='bate')som(PASSOS[0],.6);
  if(a[0]==='bengalada'){const dx=hero.x-vovo.x,dy=hero.y-vovo.y,d=Math.max(1,Math.hypot(dx,dy));
    if(d<34&&!fala&&hero.pulo<=0){const nx=hero.x+dx/d*16,ny=hero.y+dy/d*16;if(livre(nx,ny)){hero.x=nx;hero.y=ny;}som(SOM.whoosh,.5);balao(hero,'Ai! Minha canela!');}}}
function vovoPasso(dt){
  if(!VOV)return;
  const dh=Math.hypot(hero.x-vovo.x,hero.y-vovo.y);vovo.brava-=dt;
  const ocupado=vovo.fila.length||vovo.at<vovo.ad;
  if(!fala){
    if(hero.anda&&hero.corre&&dh<75&&vovo.brava<=0&&!vovo.fila.length){vovo.brava=6;vovo.alvo=null;
      balao(vovo,BRONCAS[(Math.random()*BRONCAS.length)|0]);
      vovoAcoes(dh<34?[['bate',.7],['ameaca',.9],['bengalada',.6],['respira',1]]:[['bate',.7],['ameaca',1.3],['respira',1]]);}
    else if(!vovo.alvo&&!ocupado){
      if(dh<55)vovoAcoes([[['sorri','pensa','cha','respira'][(Math.random()*4)|0],rnd(2,4)]]);
      else if(Math.random()<.5)vovoAcoes([[['cha','pensa','respira'][(Math.random()*3)|0],rnd(3,6)]]);
      else for(let i=0;i<20;i++){const x=rnd(250,400),y=rnd(572,618);if(livre(x,y)&&Math.hypot(x-vovo.x,y-vovo.y)>25){vovo.alvo={x,y};break;}}}
  }
  vovo.anda=false;
  if(vovo.alvo&&!vovo.fila.length){const ax=vovo.alvo.x-vovo.x,ay=vovo.alvo.y-vovo.y,d=Math.hypot(ax,ay),v=21*dt;
    if(d<2){vovo.alvo=null;vovo.acao='respira';vovo.at=0;vovo.ad=rnd(1.5,3);}
    else{const nx=vovo.x+ax/d*Math.min(v,d),ny=vovo.y+ay/d*Math.min(v,d);
      if(livre(nx,ny)){vovo.dist+=Math.hypot(nx-vovo.x,ny-vovo.y);vovo.x=nx;vovo.y=ny;vovo.anda=true;
        vovo.olha=Math.abs(ax)>Math.abs(ay)*1.1?(ax<0?'esquerda':'direita'):(ay<0?'cima':'baixo');}else vovo.alvo=null;}}
  if(!vovo.anda){vovo.at+=dt;if(vovo.fila.length&&vovo.at>=vovo.ad)vovoProxima();}
  for(const b of baloes)b.v+=dt;for(let i=baloes.length-1;i>=0;i--)if(baloes[i].v>2.6)baloes.splice(i,1);
  if(VOVO_PONTO){VOVO_PONTO.x=vovo.x;VOVO_PONTO.y=vovo.y-4;VOVO_PONTO.r=vovo.fila.length?40:48;}
}
function desenhaVovo(){
  if(!VOV||!VOVI.complete)return;const Q=VOV.quadros;let q,oy=0,esp=false;
  if(vovo.anda){const c=Q[vovo.olha];q=c[Math.floor(vovo.dist/5)%c.length];oy=-Math.abs(Math.sin(vovo.dist/5*Math.PI))*.5;}
  else{const a=vovo.acao,c=Q[a]||Q.respira;q=c[Math.floor(vovo.at*(a==='respira'?.8:1.2))%c.length];
    if(a==='bate')oy=-Math.abs(Math.sin(vovo.at*18))*.8;
    if(a==='bengalada')esp=hero.x<vovo.x;}   // a bengalada da folha e para a direita
  desenhaNpc(VOV,VOVI,vovo.x,vovo.y+oy,q,esp,10,36);
}
function desenhaBaloes(){   // em coordenadas de tela (letra legivel em qualquer zoom)
  for(const b of baloes){const q=b.v,a=q<.15?q/.15:q>2.2?(2.6-q)/.4:1;
    const x=W/2+(b.quem.x-cam.x)*Z,y=H/2+(b.quem.y-(b.quem===hero?50:42)-cam.y)*Z-Math.min(q,.3)*14;
    ctx.save();ctx.globalAlpha=a;ctx.font='bold 13px "Trebuchet MS"';ctx.textAlign='center';const w=ctx.measureText(b.txt).width+14;
    ctx.fillStyle='rgba(250,252,255,.96)';ctx.strokeStyle='#0a2a4a';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.roundRect(x-w/2,y-16,w,21,7);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(x-5,y+5);ctx.lineTo(x,y+11);ctx.lineTo(x+5,y+5);ctx.closePath();ctx.fill();
    ctx.fillStyle='#1a2a4a';ctx.fillText(b.txt,x,y);ctx.restore();}
}
/* ---------- Borin (tools/cut_npc.py -> vila_npc_borin.js): martela na bigorna da ferraria (o martelo bate na bigorna
   desenhada no mapa), com faiscas e "tim" metalico sintetizado; para quando o Jux chega, fala e, depois da espada, chora */
const BOR=(window.JUX_NPC||{}).borin||null;const BORI=new Image();if(BOR)BORI.src=BOR.atlas;
const BORIN_BASE={x:1247,y:580};    // em pe a direita da bigorna, virado para a esquerda
const borin={x:BORIN_BASE.x,y:BORIN_BASE.y,olha:'esquerda',dist:0,acao:'ombro',at:0,ad:1.5,anda:false,alvo:null,fila:[],golpes:0,viu:false,passeio:rnd(18,30),chorou:false};
const BORIN_PONTO={id:'borin',x:borin.x,y:borin.y,r:0};if(NA_VILA)V.pontos.push(BORIN_PONTO);
const faiscas=[];
function tim(vol){   // batida de martelo na bigorna: parciais inarmonicas com decaimento rapido + estalo
  if(!AC||vol<.01)return;const t0=AC.currentTime,g=AC.createGain();g.gain.value=vol;g.connect(acSaida(AC));
  for(const[f,a,d]of[[1180,.5,.9],[1930,.32,.6],[3010,.22,.4],[4420,.14,.25],[620,.25,.35]]){const o=AC.createOscillator(),e=AC.createGain();
    o.type='sine';o.frequency.value=f*rnd(.985,1.015);e.gain.setValueAtTime(a,t0);e.gain.exponentialRampToValueAtTime(.0008,t0+d);o.connect(e);e.connect(g);o.start(t0);o.stop(t0+d+.05);}
  const n=AC.createBufferSource(),b=AC.createBuffer(1,AC.sampleRate*.04,AC.sampleRate),c=b.getChannelData(0);
  for(let i=0;i<c.length;i++)c[i]=(Math.random()*2-1)*(1-i/c.length);n.buffer=b;const ne=AC.createGain();ne.gain.value=.5;n.connect(ne);ne.connect(g);n.start(t0);}
function borinAcoes(lista){borin.fila=lista.slice();borinProxima();}
function borinProxima(){const a=borin.fila.shift();if(!a){borin.acao='ombro';borin.ad=rnd(1,2);borin.at=0;return;}borin.acao=a[0];borin.ad=a[1];borin.at=0;
  if(a[0]==='bate'){const hx=borin.x-19,hy=borin.y-14,dh=Math.hypot(hero.x-hx,hero.y-hy);som(BIGORNA[Math.random()<.5?0:1],clamp(1-dh/280,0,1)*.85);
    for(let i=0;i<16;i++)faiscas.push({x:hx+rnd(-2,2),y:hy+rnd(-2,1),vx:rnd(-55,30),vy:rnd(-70,-15),v:0,d:rnd(.25,.6)});}
  if(a[0]==='chora')balao(borin,'VINTE ANOS puxando aquela espada... e você nem encostou!');}
function borinPasso(dt){
  if(!BOR)return;
  const dh=Math.hypot(hero.x-borin.x,hero.y-borin.y),livreBorin=!borin.fila.length&&borin.at>=borin.ad&&!borin.alvo;
  if(dh>140)borin.viu=false;
  borin.passeio-=dt;
  if(livreBorin&&!fala){
    if(!borin.viu&&dh<85){borin.viu=true;
      if(hero.espada&&!borin.chorou){borin.chorou=true;borinAcoes([['chora',2.6],['chora',1.6],['ri',1.4]]);}
      else{balao(borin,['Forasteiro! Cuidado com as fagulhas!','Ha! Veio ver o maior ferreiro de Invernália?','Esse casaco preto não aguenta um inverno daqui.'][(Math.random()*3)|0]);borinAcoes([['ombro',1.4],['ri',1.2]]);}}
    else if(dh<60)borinAcoes([['ombro',rnd(1,2)]]);
    else if(borin.passeio<=0&&Math.hypot(borin.x-BORIN_BASE.x,borin.y-BORIN_BASE.y)<2){borin.passeio=rnd(25,40);borin.alvo={x:1124,y:600,depois:'volta'};}
    else if(Math.hypot(borin.x-BORIN_BASE.x,borin.y-BORIN_BASE.y)>2&&!borin.alvo)borin.alvo={x:BORIN_BASE.x,y:BORIN_BASE.y};
    else{const n=(3+Math.random()*3)|0,l=[];for(let i=0;i<n;i++)l.push(['ergue',.28],['alto',.24],['bate',.16],['quica',.26]);
      l.push(Math.random()<.4?['suor',1.3]:['ombro',rnd(.8,1.6)]);borinAcoes(l);}
  }
  borin.anda=false;
  if(borin.alvo){const ax=borin.alvo.x-borin.x,ay=borin.alvo.y-borin.y,d=Math.hypot(ax,ay),v=30*dt;
    if(d<1.5){const dep=borin.alvo.depois;borin.x=borin.alvo.x;borin.y=borin.alvo.y;borin.alvo=null;
      if(dep==='volta')borinAcoes([['suor',1.4],['ombro',1.5]]);else{borin.olha='esquerda';borin.acao='ombro';borin.at=0;borin.ad=.8;}}
    else{borin.dist+=Math.min(v,d);borin.x+=ax/d*Math.min(v,d);borin.y+=ay/d*Math.min(v,d);borin.anda=true;
      borin.olha=Math.abs(ax)>Math.abs(ay)*1.1?(ax<0?'esquerda':'direita'):(ay<0?'cima':'baixo');}}
  if(!borin.anda){borin.at+=dt;if(borin.fila.length&&borin.at>=borin.ad)borinProxima();}
  for(const f of faiscas){f.v+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=160*dt;}
  for(let i=faiscas.length-1;i>=0;i--)if(faiscas[i].v>faiscas[i].d)faiscas.splice(i,1);
  BORIN_PONTO.x=borin.x;BORIN_PONTO.y=borin.y-4;BORIN_PONTO.r=borin.anda?40:48;
}
function desenhaBorin(){
  if(!BOR||!BORI.complete)return;const Q=BOR.quadros;let q,oy=0,esp=false;
  if(borin.anda){const c=Q[borin.olha];q=c[Math.floor(borin.dist/5)%c.length];oy=-Math.abs(Math.sin(borin.dist/5*Math.PI))*.6;}
  else{const a=borin.acao,c=Q[a]||Q.ombro;q=c[0];
    if(a==='ri')oy=-Math.abs(Math.sin(borin.at*16))*.8;
    if(a==='chora')oy=-Math.abs(Math.sin(borin.at*9))*.5;
    // as poses paradas olham para a esquerda: se o Jux estiver a direita (e nao estiver martelando), vira
    if(['ombro','ri','chora','suor'].includes(a)&&hero.x>borin.x+20&&Math.hypot(hero.x-borin.x,hero.y-borin.y)<90)esp=true;}
  desenhaNpc(BOR,BORI,borin.x,borin.y+oy,q,esp,16,62);
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const f of faiscas){const k=1-f.v/f.d;ctx.fillStyle=`rgba(255,${(170+80*k)|0},80,${k})`;ctx.fillRect(f.x,f.y,1.3,1.3);}
  ctx.restore();
}
/* ---------- moradores andarilhos (tools/cut_npc.py -> vila_npc_<nome>.js): vao e voltam por uma rota de pontos
   (cada trecho conferido com livre()), param nas paradas fazendo poses; quando o Jux chega perto viram e cumprimentam */
/* ---------- BINO acompanha o Jux (so depois que entra no time, JOGO.bino.ativo): anda pelo mesmo caminho que o Jux fez ---------- */
// O Bino NAO anda mais atras do Jux o mapa todo (como no Final Fantasy): so aparece do lado dele nas falas importantes (SEG.cena = true), com gestos
const SEG={cena:false,ativo:false,x:0,y:0,olha:'baixo',dist:0,anda:false,trilha:[]},BIN=(window.JUX_NPC||{}).bino||null,BINI=new Image();if(BIN)BINI.src=BIN.atlas;
function seguidorPasso(dt){
  if(!BIN||!SEG.cena){SEG.ativo=false;SEG.vel=null;return;}
  if(!SEG.ativo){SEG.ativo=true;SEG.x=hero.x-26;SEG.y=hero.y+2;SEG.trilha=[];}
  const t=SEG.trilha,u=t[t.length-1];if(!u||Math.hypot(hero.x-u.x,hero.y-u.y)>3)t.push({x:hero.x,y:hero.y});if(t.length>260)t.shift();
  let acc=0,alvo=null;for(let i=t.length-1;i>0;i--){acc+=Math.hypot(t[i].x-t[i-1].x,t[i].y-t[i-1].y);if(acc>=34){alvo=t[i-1];break;}}
  // anda de forma continua: a velocidade acompanha a distancia ate o ponto que ele segue (sem acelerar e parar de novo), e o passo do desenho acompanha o chao
  let v=0,vx=0,vy=0;
  if(alvo){const ax=alvo.x-SEG.x,ay=alvo.y-SEG.y,d=Math.hypot(ax,ay);
    if(d>.8){v=Math.min(d*5,hero.corre?VELC*1.12:VEL*1.15);const m=Math.min(d,v*dt);vx=ax/d*m;vy=ay/d*m;SEG.x+=vx;SEG.y+=vy;SEG.dist+=m;}}
  SEG.vel=SEG.vel==null?v:SEG.vel+(v-SEG.vel)*Math.min(1,dt*9);   // velocidade suavizada: evita piscar entre andar e parado
  SEG.anda=SEG.vel>(SEG.anda?7:14);
  if(SEG.anda&&(vx||vy)){const ax=Math.abs(vx),ay=Math.abs(vy),h=ax>ay*1.35,vv=ay>ax*1.35;   // so troca de lado quando um eixo domina bem (sem tremer nas diagonais)
    if(h)SEG.olha=vx<0?'esquerda':'direita';else if(vv)SEG.olha=vy<0?'cima':'baixo';}
  else if(Math.hypot(hero.x-SEG.x,hero.y-SEG.y)>90){SEG.x=hero.x-26;SEG.y=hero.y+2;}   // ficou para tras (teleporte, troca de mapa)
}
function desenhaSeguidor(){if(!SEG.ativo||!BIN||!BINI.complete)return;
  const fb=fala&&fala.linhas&&fala.linhas[fala.i]&&fala.linhas[fala.i][0]==='Bino',pulo=(SEG.cena&&fb&&!SEG.anda)?-Math.abs(Math.sin(t*7))*3.2:0;   // gesto: quando e a fala dele, ele da um leve pulo/aceno de corpo
  const c=BIN.quadros[SEG.olha],q=SEG.anda?c[Math.floor(SEG.dist/(hero.corre?10:11))%c.length]:BIN.quadros.baixo[0],oy=pulo+(SEG.anda?-Math.abs(Math.sin(SEG.dist/(hero.corre?10:11)*Math.PI))*1.1:0);
  desenhaNpc(BIN,BINI,SEG.x,SEG.y+oy,SEG.anda?q:(SEG.olha==='baixo'?q:c[0]),false,14,54);}
const ANDARILHOS=[];
function criaAndarilho(id,o){const D=(window.JUX_NPC||{})[id];if(!D)return null;const img=new Image();img.src=D.atlas;
  const n={id,D,img,rota:o.rota,paradas:o.paradas,poses:o.poses,oi:o.oi,ola:o.ola,vel:o.vel||30,passo:o.passo||6,larg:o.larg||10,alt:o.alt||42,
    i:o.inicio||0,sentido:1,x:o.rota[o.inicio||0][0],y:o.rota[o.inicio||0][1],olha:'baixo',dist:0,acao:'respira',at:0,ad:2,anda:false,fila:[],viu:false,
    ponto:{id,x:0,y:0,r:0}};
  V.pontos.push(n.ponto);ANDARILHOS.push(n);return n;}
function andProxima(n){const a=n.fila.shift();if(!a){n.acao='respira';n.at=0;n.ad=.01;return;}n.acao=a[0];n.ad=a[1];n.at=0;if(a[2])balao(n,a[2]);}
function andarilhoPasso(n,dt){
  const dh=Math.hypot(hero.x-n.x,hero.y-n.y);if(dh>130)n.viu=false;
  if(!n.fila.length&&!fala&&!n.viu&&dh<60){n.viu=true;n.fila=n.oi.map(a=>a.slice());if(n.ola)n.fila[0][2]=n.ola[(Math.random()*n.ola.length)|0];andProxima(n);}
  n.anda=false;
  if(n.fila.length||n.at<n.ad){n.at+=dt;if(n.at>=n.ad&&n.fila.length)andProxima(n);}
  else if(!fala){
    // proximo ponto da rota (vai e volta)
    let j=n.i+n.sentido;if(j<0||j>=n.rota.length){n.sentido*=-1;j=n.i+n.sentido;}
    const [tx,ty]=n.rota[j],ax=tx-n.x,ay=ty-n.y,d=Math.hypot(ax,ay),v=n.vel*dt;
    if(d<=v){n.x=tx;n.y=ty;n.i=j;n.dist+=d;
      if(n.paradas.includes(j)){const p=n.poses[(Math.random()*n.poses.length)|0];n.fila=[[p,rnd(2,4)],['respira',rnd(1,2.5)]];andProxima(n);}}
    else{const nx=n.x+ax/d*v,ny=n.y+ay/d*v;n.x=nx;n.y=ny;n.dist+=v;n.anda=true;
      n.olha=Math.abs(ax)>Math.abs(ay)*1.1?(ax<0?'esquerda':'direita'):(ay<0?'cima':'baixo');}
  }
  n.ponto.x=n.x;n.ponto.y=n.y-4;n.ponto.r=n.anda?40:46;
}
function desenhaAndarilho(n){
  if(!n.img.complete)return;const Q=n.D.quadros;let q,oy=0;
  if(n.anda){const c=Q[n.olha];q=c[Math.floor(n.dist/n.passo)%c.length];oy=-Math.abs(Math.sin(n.dist/n.passo*Math.PI))*.6;}
  else{const c=Q[n.acao]||Q.respira;q=c[Math.floor(n.at*1.2)%c.length];if(n.acao==='ri')oy=-Math.abs(Math.sin(n.at*14))*.6;}
  desenhaNpc(n.D,n.img,n.x,n.y+oy,q,false,n.larg,n.alt);
}
// Ingrid, a padeira: da casa da Vovo ate a ferraria passando pela barraca de comida, pelo portao e pela de bebidas
// (2026-11-19) rotas sem passar na frente do portao: a Ingrid fica no lado oeste da praca, o Oskar no lado leste
criaAndarilho('ingrid',{rota:[[330,612],[330,690],[470,700],[548,686],[600,675]],
  paradas:[0,2,4],poses:['cheira','frio','tranca','respira'],inicio:2,vel:28,
  oi:[['acena',1.4],['oferece',2.2],['ri',1]],ola:['Bom dia, forasteiro! Pão quentinho?','Ui, que frio! Quer um pãozinho?','Você é o moço do chiqueiro? Hihi!']});
// Oskar, o lenhador: traz lenha da trilha da direita (floresta) ate a casa da Vovo, passando pela praca
criaAndarilho('oskar',{rota:[[1100,740],[1080,700],[1000,700],[942,688],[895,675],[860,672]],
  paradas:[0,5],poses:['senta','costas','sopra','boceja','tira'],inicio:0,vel:24,passo:6.5,larg:12,alt:44,
  oi:[['aceno',1.3],['sopra',1.4]],ola:['Hm.','Frio, hein.','Bom dia. ...Hm.','Lenha não se carrega sozinha, sabe.']});
// Halvard (tools/cut_npc.py -> vila_npc_halvard.js): na CAVERNA (trilha) aparece acorrentado na cena do resgate e vai se erguendo
// conforme as falas; na VILA, depois da missao Olhos Roxos, passeia devagar pela praca perto do Tico
function halvardVila(){if(!NA_VILA||ANDARILHOS.some(n=>n.id==='halvard'))return;if(typeof estadoMissao!=='function'||estadoMissao('olhos_roxos')!=='feita')return;
  criaAndarilho('halvard',{rota:[[520,690],[560,686]],paradas:[0,1],poses:['alivio','respira'],inicio:0,vel:16,passo:7,larg:12,alt:46,
    oi:[['alivio',1.6]],ola:['Foi o Tico que me achou primeiro. Eu só deixei.','Obrigado, forasteiro.','Frio? Isso é verão perto da caverna.']});}
const HAL=(window.JUX_NPC||{}).halvard||null,HALI=new Image();if(HAL)HALI.src=HAL.atlas;
function desenhaHalvardCaverna(){if(REGIAO!=='caverna')return;if(!HAL||!HALI.complete||(JOGO.provas||{}).skoll!=='vencida')return;
  const i=fala?fala.i:0,pose=i<7?'jaz':i<9?'levanta':i<13?'senta':i<14?'respira':'alivio',c=HAL.quadros[pose],q=c[Math.floor(performance.now()/700)%c.length];
  desenhaNpc(HAL,HALI,780,235,q,false,18,40);}
/* ---------- peixes pulando no riacho (tools/vila_peixe.py -> vila_peixe.js): de tempos em tempos um peixe pula num
   ponto do riacho onde cabe o respingo, as vezes para um lado, as vezes para o outro, com "splash" */
const PEI=window.JUX_PEIXE||null,PEII=new Image();if(PEI)PEII.src=PEI.atlas;
const peixes=[];let peixeT=rnd(2,5);
function cabeAgua(x,y){if(!agMask)return false;const [x0,y0]=AG.caixa,c=agMask.getContext('2d');
  for(const[dx,dy]of[[0,0],[-11,0],[11,0],[0,-4],[0,4],[-8,3],[8,-3]]){const px=Math.round(x+dx-x0),py=Math.round(y+dy-y0);
    if(px<0||py<0||px>=agMask.width||py>=agMask.height||c.getImageData(px,py,1,1).data[3]<128)return false;}return true;}
function splash(x,y,forte){if(!AC)return;const dh=Math.hypot(hero.x-x,hero.y-y),vol=clamp(1-dh/300,0,1)*(forte?.32:.18);if(vol<.01)return;
  const t0=AC.currentTime,n=AC.createBufferSource(),b=AC.createBuffer(1,AC.sampleRate*.35,AC.sampleRate),c=b.getChannelData(0);
  for(let i=0;i<c.length;i++){const k=i/c.length;c[i]=(Math.random()*2-1)*Math.pow(1-k,2.2)*(1+.6*Math.sin(i*.02));}
  n.buffer=b;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(1800,t0);f.frequency.exponentialRampToValueAtTime(500,t0+.3);f.Q.value=.9;
  const g=AC.createGain();g.gain.value=vol;n.connect(f);f.connect(g);g.connect(acSaida(AC));n.start(t0);}
function peixePasso(dt){
  if(!PEI||!agPx.length)return;peixeT-=dt;
  if(peixeT<=0){peixeT=rnd(3,8);const [x0,y0,x1]=AG.caixa,w=x1-x0;
    for(let k=0;k<25;k++){const i=agPx[(Math.random()*agPx.length)|0],x=x0+i%w,y=y0+((i/w)|0);
      if(cabeAgua(x,y)){peixes.push({x,y,v:0,esp:Math.random()<.5,sp1:false,sp2:false});break;}}}
  for(const f of peixes){f.v+=dt;if(!f.sp1){f.sp1=true;splash(f.x,f.y,false);}if(!f.sp2&&f.v>=.55){f.sp2=true;splash(f.x,f.y,true);}}
  for(let i=peixes.length-1;i>=0;i--)if(peixes[i].v>1.05)peixes.splice(i,1);
}
function desenhaPeixes(){
  if(!PEI||!PEII.complete)return;const s=PEI.escala;
  for(const f of peixes){const q=Math.min(PEI.n-1,Math.floor(f.v/1.05*PEI.n));
    ctx.save();ctx.translate(f.x,f.y);ctx.scale(f.esp?-s:s,s);ctx.drawImage(PEII,q*PEI.w,0,PEI.w,PEI.h,-PEI.ancora[0],-PEI.ancora[1],PEI.w,PEI.h);ctx.restore();}
}
/* ---------- lanternas da arvore balancando (tools/vila_lanterna.py): pendulo pela folha (quadros 0-3 para a direita,
   4-7 para a esquerda), cada uma no seu ritmo; o vento forte aumenta o balanco */
const LAN=window.JUX_LANTERNA||null,LANI=new Image();if(LAN)LANI.src=LAN.atlas;
const BAN=window.JUX_BANDEIRA||null,BANI=new Image();if(BAN)BANI.src=BAN.atlas;
let banFase=0;
function desenhaBandeira(i){   // pano tremulando (folha de 8 quadros), mais rapido na rajada; o pe some atras das estacas
  if(!BAN||!BANI.complete)return;const [x,top,pe,corte]=BAN.lugares[i],s=(pe-top)/BAN.poste;
  const q=Math.floor(banFase+i*2.3)%8;
  ctx.save();ctx.beginPath();ctx.rect(x-60,top-10,120,corte-top+10);ctx.clip();
  ctx.drawImage(BANI,q*BAN.w,0,BAN.w,BAN.h,x-BAN.topo[0]*s,top-BAN.topo[1]*s,BAN.w*s,BAN.h*s);ctx.restore();
}
const FOG=window.JUX_FOGO||null,FOGI=new Image();if(FOG)FOGI.src=FOG.atlas;
const FUM=window.JUX_FUMACA||null,FUMI=new Image();if(FUM)FUMI.src=FUM.atlas;
function desenhaFogo(i){   // chamas da folha (8 quadros, ~11 qps), base na lenha
  if(!FOG||!FOGI.complete)return;const [x,y,l]=FOG.lugares[i],s=l/FOG.larg,q=Math.floor(t*11+i*3)%8;
  ctx.drawImage(FOGI,q*FOG.w,0,FOG.w,FOG.h,x-FOG.base[0]*s,y-FOG.base[1]*s,FOG.w*s,FOG.h*s);
}
const FOR=FOG&&FOG.forja,FORI=new Image();if(FOR)FORI.src=FOR.atlas;
function desenhaForja(){   // brasas e chamas baixas dentro da boca da forja
  if(!FOR||!FORI.complete)return;const [x,y,l]=FOR.lugares[0],s=l/FOR.larg,q=Math.floor(t*10)%8;
  ctx.drawImage(FORI,q*FOR.w,0,FOR.w,FOR.h,x-FOR.base[0]*s,y-FOR.base[1]*s,FOR.w*s,FOR.h*s);
}
const POS=window.JUX_POSTE||null,POSI=new Image();if(POS)POSI.src=POS.atlas;
function desenhaPoste(i){   // cabeca da lanterna de poste com o cristal pulsando, por cima da lanterna do desenho
  if(!POS||!POSI.complete)return;const [x,y,l]=POS.lugares[i],s=l/POS.vidro[2]*1.05,q=Math.floor(t*6+i*1.7)%8;
  // antes a cabeca da lanterna era REDESENHADA por cima da lanterna do mapa (duas lanternas coladas uma na outra); agora so o brilho pulsa em cima da pintada
  const gx=x,gy=y,pulso=.5+.5*Math.sin(t*3+i*1.7);ctx.save();ctx.globalCompositeOperation='lighter';
  const g=ctx.createRadialGradient(gx,gy,0,gx,gy,22*s*.9);g.addColorStop(0,`rgba(120,225,255,${.30+.2*pulso})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(gx-30,gy-30,60,60);ctx.restore();
}
function desenhaFumacas(){   // fumaca das chamines (folha de 8 quadros), inclinada pelo vento
  if(!FUM||!FUMI.complete)return;
  FUM.lugares.forEach(([x,y,h],i)=>{const s=h/FUM.alt,q=Math.floor(t*5+i*2.7)%8;
    ctx.save();ctx.globalAlpha=.88;ctx.translate(x,y);ctx.transform(1,0,(i===0?-.42:-.18)-vento*.35,1,0,0);
    ctx.drawImage(FUMI,q*FUM.w,0,FUM.w,FUM.h,-FUM.saida[0]*s,-FUM.saida[1]*s,FUM.w*s,FUM.h*s);ctx.restore();});
}
const CAS=window.JUX_CASCATA||null,CASI=new Image();if(CAS)CASI.src=CAS.atlas;
function desenhaCascatas(){   // cascatinhas do riacho (folha de 8 quadros, ~12 qps), por cima das do desenho
  if(!CAS||!CASI.complete)return;
  CAS.lugares.forEach(([x,y,h],i)=>{const s=h/CAS.alt,q=Math.floor(t*12+i*4)%8;
    ctx.save();ctx.globalAlpha=.92;ctx.drawImage(CASI,q*CAS.w,0,CAS.w,CAS.h,x-CAS.base[0]*s,y-CAS.base[1]*s,CAS.w*s,CAS.h*s);ctx.restore();});
}
function desenhaLanternas(){
  if(!LAN||!LANI.complete)return;
  LAN.lugares.forEach(([cx,top,bot],i)=>{const s=(bot-top)/LAN.corpo,ax=cx,ay=top-LAN.corrente*s;
    const amp=.45+.55*vento,fase=Math.sin(t*(1.6+(i%3)*.17)+i*1.9)*amp;
    const m=Math.min(3,Math.round(Math.abs(fase)*3.4)),q=fase>=0?m:(m?4+m:0);
    ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(cx+fase*4,top+(bot-top)*.5,0,cx+fase*4,top+(bot-top)*.5,16);
    g.addColorStop(0,'rgba(120,220,255,.28)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(cx-20,top-6,40,40);ctx.restore();
    ctx.drawImage(LANI,q*LAN.w,0,LAN.w,LAN.h,ax-LAN.argola[0]*s,ay-LAN.argola[1]*s,LAN.w*s,LAN.h*s);});
}
function vivoPasso(dt){
  uiPasso(dt);
  if(espadaSobe<99)espadaSobe+=dt;
  banFase+=dt*(6+1.5*vento);   // tremula num ritmo estavel; na rajada so um pouco mais rapido
  vento=Math.pow(Math.max(0,Math.sin(t*.21)),6);           // rajada de vento de tempos em tempos
  if(AG&&agPx.length){const [x0,y0,x1]=AG.caixa,w=x1-x0;
    if(Math.random()<dt*2.2){const k=agPx[(Math.random()*agPx.length)|0];aneis.push({x:x0+k%w,y:y0+((k/w)|0),v:0,d:rnd(1.4,2.2)});}
    for(const q of AG.quedas){if(Math.random()<dt*28)respingos.push({x:rnd(q[0],q[2]),y:q[3]-1,vx:rnd(-9,9),vy:rnd(-26,-10),v:0});
      if(Math.random()<dt*3)nevoa.push({x:rnd(q[0],q[2]),y:q[3]-4,s:rnd(4,8),v:0});}}
  if(AG&&AG.cristais.length&&Math.random()<dt*7){const c=AG.cristais[(Math.random()*AG.cristais.length)|0];estrelas.push({x:c[0],y:c[1],v:0,s:rnd(2.5,4.5)});}
  if(Math.random()<dt*5){const l=LANTERNAS[(Math.random()*LANTERNAS.length)|0];motes.push({x:l[0]+rnd(-8,8),y:l[1]+rnd(-4,6),v:0,o:rnd(0,6),d:rnd(2.5,4.5)});}
  if(Math.random()<dt*.35){const a=rnd(-2.6,-.5),cx=760+Math.cos(a)*rnd(80,230),cy=400+Math.sin(a)*rnd(40,100)+30;
    for(let i=0;i<14;i++)neveCopa.push({x:cx+rnd(-6,6),y:cy+rnd(-3,3),vx:rnd(-6,6),vy:rnd(-4,8),v:0,s:rnd(.6,1.5)});}
  for(const r of aneis)r.v+=dt;for(const r of respingos){r.v+=dt;r.x+=r.vx*dt;r.y+=r.vy*dt;r.vy+=70*dt;}
  for(const n of nevoa){n.v+=dt;n.y-=dt*5;n.x+=dt*3;n.s+=dt*5;}for(const e of estrelas)e.v+=dt;
  for(const m of motes){m.v+=dt;m.y-=dt*7;m.x+=Math.sin(m.v*2+m.o)*dt*6+vento*dt*14;}
  for(const n of neveCopa){n.v+=dt;n.x+=(n.vx+vento*20)*dt;n.y+=n.vy*dt;n.vy+=55*dt;}
  const corta=(a,f)=>{let i=0;for(const x of a)if(!f(x))a[i++]=x;a.length=i;};
  corta(aneis,r=>r.v>r.d);corta(respingos,r=>r.v>.55);corta(nevoa,n=>n.v>2.2);corta(estrelas,e=>e.v>.7);corta(motes,m=>m.v>m.d);corta(neveCopa,n=>n.v>1.6);
}
function desenhaAgua(){
  if(!AG||!agCor)return;const [x0,y0,x1,y1]=AG.caixa,w=x1-x0,h=y1-y0;
  const g=agTmp.getContext('2d');g.globalCompositeOperation='source-over';
  // OTIMIZACAO (2026-11-19): so o pedaco do rio que aparece na tela (antes desenhava o rio inteiro a cada quadro; a vila caia de quadros)
  const hw=W/(2*Z)+8,hh=H/(2*Z)+8,sx=Math.max(0,Math.floor(cam.x-hw-x0)),sy=Math.max(0,Math.floor(cam.y-hh-y0)),ex=Math.min(w,Math.ceil(cam.x+hw-x0)),ey=Math.min(h,Math.ceil(cam.y+hh-y0));
  if(ex<=sx||ey<=sy)return;const sw=ex-sx,sh=ey-sy;
  // OTIMIZACAO 2 (2026-11-19): a textura da agua so e refeita em quadro sim, quadro nao (ou quando a camera mostra outro pedaco);
  // no outro quadro a mesma agua e so carimbada. A correnteza anda devagar, a diferenca nao aparece.
  const agK=sx+','+sy+','+ex+','+ey;agN++;const refaz=agK!==agUltK||!(agN&1);agUltK=agK;
  if(refaz)g.clearRect(sx,sy,sw,sh);
  if(agTex&&agTex.complete&&agTex.naturalWidth){if(refaz){g.save();g.beginPath();g.rect(sx,sy,sw,sh);g.clip();
    // agua de verdade: a textura corre em duas camadas (correnteza para a direita e uma contra-onda mais lenta),
    // com um balanco leve, recortada no formato do riacho e com a borda esfumada
    if(!agTexPat)agTexPat=g.createPattern(agTex,'repeat');const L=agTex.naturalWidth;g.fillStyle=agTexPat;
    g.save();g.globalAlpha=1;g.translate((t*7)%L,Math.sin(t*.5)*2);g.fillRect(-L,-L,w+2*L,h+2*L);g.restore();
    g.save();g.globalAlpha=.42;g.globalCompositeOperation='screen';g.translate(-((t*4.5)%L)+L*.37,(t*2.2)%L+L*.21);g.fillRect(-L,-L,w+2*L,h+2*L);g.restore();
    g.globalCompositeOperation='destination-in';g.drawImage(agSuave,sx,sy,sw,sh,sx,sy,sw,sh);g.globalCompositeOperation='source-over';g.restore();}
    ctx.save();ctx.globalAlpha=.86;ctx.drawImage(agTmp,sx,sy,sw,sh,x0+sx,y0+sy,sw,sh);ctx.restore();
  }else{
    for(let y=sy-sy%2;y<ey;y+=2){const yy=y0+y,dx=Math.sin(yy*.23+t*2.3)*1.1+Math.sin(yy*.061-t*1.2)*.8;ctx.drawImage(agCor,0,y,w,2,x0+dx,yy,w,2);}
  }
  ctx.save();ctx.globalCompositeOperation='lighter';
  // cachoeiras: fios de agua caindo
  if(!CAS)for(const q of AG.quedas){const qw=q[2]-q[0],qh=q[3]-q[1];
    for(let i=0;i<qw;i+=2){const vel=70+((i*37)%23),fase=(t*vel+i*29)%(qh+14)-14;
      ctx.globalAlpha=.35+.25*Math.sin(i*1.7+t*3);ctx.fillStyle='#eafcff';ctx.fillRect(q[0]+i,q[1]+fase,1.2,6+(i%3)*3);}}
  ctx.globalAlpha=1;ctx.restore();
  // circulos na superficie
  ctx.save();ctx.lineWidth=.7;for(const r of aneis){const q=r.v/r.d;ctx.strokeStyle=`rgba(225,250,255,${(1-q)*.55})`;ctx.beginPath();ctx.ellipse(r.x,r.y,1+q*9,(1+q*9)*.38,0,0,6.283);ctx.stroke();}
  // espuma e nevoa das cachoeiras
  for(const s of respingos){ctx.fillStyle=`rgba(240,253,255,${1-s.v/.55})`;ctx.fillRect(s.x,s.y,1.3,1.3);}
  for(const n of nevoa){ctx.fillStyle=`rgba(225,245,255,${.18*(1-n.v/2.2)})`;ctx.beginPath();ctx.arc(n.x,n.y,n.s,0,6.283);ctx.fill();}
  ctx.restore();
}
function desenhaBandeiras(){
  if(!AG)return;AG.bandeiras.forEach((b,i)=>{const bw=b[2]-b[0];
    for(let y=b[1];y<b[3];y+=2){const f=(y-b[1])/(b[3]-b[1]),dx=(Math.sin(t*2.6+y*.13+i*1.9)*1.1+vento*2.2)*f;
      ctx.drawImage(MAPA,b[0]*K,y*K,bw*K,2*K,b[0]+dx,y,bw,2);}});
}
function desenhaBrilhos(){
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const e of estrelas){const q=Math.sin(Math.PI*e.v/.7),s=e.s*q;ctx.fillStyle=`rgba(230,252,255,${.9*q})`;
    ctx.fillRect(e.x-s,e.y-.4,s*2,.8);ctx.fillRect(e.x-.4,e.y-s,.8,s*2);ctx.fillRect(e.x-.8,e.y-.8,1.6,1.6);}
  for(const m of motes){const q=Math.sin(Math.PI*m.v/m.d);const g=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,3);
    g.addColorStop(0,`rgba(170,240,255,${.8*q})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(m.x-3,m.y-3,6,6);}
  ctx.restore();
  for(const n of neveCopa){ctx.fillStyle=`rgba(245,252,255,${.95*(1-n.v/1.6)})`;ctx.fillRect(n.x,n.y,n.s,n.s);}
}

const CHAMINES=[[1328,300,7],[410,128,2.5],[1138,140,2],[185,250,2]];   // x, y, quantos por segundo

const POSE_FALA={inicio:'surpreso',fogueira:'sentado',bacon:'rindo',tico:'rindo',borin:'confiante',ingrid:'acenar',oskar:'confiante',barraca_comida:'acenar',barraca_bebida:'acenar',poco:'examinar',arvore:'examinar',ferraria:'examinar',vovo:'examinar',portao:'confiante',pulo:'confiante',altar_escolha:'examinar',altar_ganha:'confiante',altar:'confiante'};
// passagem entre regioes: a fala so aparece na PRIMEIRA vez (pedido do usuario); depois o Jux ja passa direto
function passa(id,acao){JOGO.passou=JOGO.passou||{};if(JOGO.passou[id]){acao();return;}abreFala(id,()=>{JOGO.passou[id]=true;acao();});}
function abreFala(id,fim){if(id.startsWith('tes_')){pegaTesouro(id.slice(4));return;}
  if(id.startsWith('chefe_')&&!fim){const c=MINICHEFES.find(q=>'chefe_'+q.id===id);if(c&&!chefeFeito(c.id)){fala={linhas:c.pre,i:0,letras:0,fim:()=>{UI.escolha={id:'prova',prova:id,ops:['Lutar','Ainda não'],sel:0};som(SOM.ui_vez,.5);}};}return;}
  if(id==='saida_garganta'&&!fim){if((JOGO.provas||{}).acolito!=='feita'&&!JOGO.gargantaVista){abreFala('garganta_fechada');return;}   // trava: a Garganta abre depois do Acolito
    passa('saida_garganta',()=>{JOGO.garganta={x:150,y:650};vaiPara('garganta.html');});return;}
  if(id==='entrada_vale'&&!fim){passa('entrada_vale',()=>{JOGO.vale={x:735,y:985};vaiPara('vale.html');});return;}
  if(id==='saida_vale'&&!fim){passa('saida_vale',()=>{JOGO.garganta={x:1208,y:362};vaiPara('garganta.html');});return;}
  if(id==='entrada_pico'&&!fim){if(provaFenrirEstado()==='cedo'){abreFala('pico_cedo');return;}passa('entrada_pico',()=>{JOGO.pico={x:650,y:1000};vaiPara('pico.html');});return;}
  if(id==='saida_pico'&&!fim){passa('saida_pico',()=>{JOGO.vale={x:740,y:300};vaiPara('vale.html');});return;}
  if(id==='entrada_trilha'&&!fim){passa('entrada_trilha',()=>{JOGO.trilha={x:1360,y:515};vaiPara('trilha.html');});return;}
  if(id==='caverna_fechada'&&!fim){abreFala('caverna_fechada');return;}
  if(id==='saida_vila'&&!fim){passa('saida_vila',()=>{JOGO.vila=Object.assign(JOGO.vila||{},{x:722,y:710,espada:true});vaiPara('vila.html');});return;}
  if(id==='portao'&&hero.espada&&!fim){const om=typeof estadoMissao==='function'?estadoMissao('olhos_roxos'):'ativa';if(om!=='ativa'&&om!=='feita'){abreFala('portao_fechado');return;}   // trava: so sai com a missao da Vovo aceita (o Bino entra no time nela)
    passa('portao_sai',()=>{JOGO.trilha=null;vaiPara('trilha.html');});return;}
  if(id==='portao_sai'&&!fim)return;
  if(id==='caverna'&&REGIAO==='garganta'&&!fim){passa('caverna_entra',()=>{JOGO.caverna={x:705,y:990};vaiPara('caverna.html');});return;}   // a boca da caverna leva para DENTRO (exploracao); a luta e na camara do Alfa
  if(id==='saida_caverna'&&!fim){passa('saida_caverna',()=>{JOGO.garganta={x:1300,y:1010};vaiPara('garganta.html');});return;}
  if(id==='camara_alfa')id='caverna';
  if(id==='caverna'&&!fim){const st=(JOGO.provas||{}).skoll;
    if(st==='feita'){abreFala('caverna_livre',()=>{});return;}
    if(st==='vencida'){abreFala('skoll_vence',concluiSkoll);return;}
    abreFala('camara_ve',()=>{UI.escolha={id:'prova',prova:'skoll',ops:['Entrar','Ainda não'],sel:0};som(SOM.ui_vez,.5);});return;}
  if(id==='acampamento'&&!fim&&estadoMissao('olhos_roxos')==='ativa'&&JOGO.cap1&&!JOGO.cap1.acamp){abreFala('acamp_pista',()=>{JOGO.cap1.acamp=true;som(SOM.ui_vez,.7);aviso('Pista encontrada: o mapa do sol negro','#ffe27a');salvaJogo();setTimeout(contaOrdem,900);});return;}
  if(id==='santuario'&&!fim&&estadoMissao('olhos_roxos')==='ativa'&&JOGO.ordemSabe&&(JOGO.provas||{}).acolito!=='feita'){   // trava: o Acolito so depois da cena da Ordem
    SEG.cena=!!(JOGO.bino&&JOGO.bino.ativo);   // o Bino fica ao lado do Jux durante a conversa
    if((JOGO.provas||{}).acolito==='vencida')abreFala('acolito_vence',()=>{SEG.cena=false;concluiAcolito();});else abreFala('acolito_aparece',()=>{SEG.cena=false;iniciaProva('acolito');});return;}
  if(id==='acolito_vence'&&!fim)return;
  if(id==='prova_pegadas'&&!fim){abreFala('prova_pegadas',aceitaProvaFenrir);return;}
  // chegou ao circulo seguindo as pegadas sem examinar as da Garganta: a prova comeca aqui mesmo (2026-11-20: antes mandava voltar)
  if(id==='prova_fenrir'&&!fim&&provaFenrirEstado()==='pegadas'){aceitaProvaFenrir();abreFala('prova_fenrir',()=>{UI.escolha={id:'prova',ops:['Lutar agora','Ainda não'],sel:0};som(SOM.ui_vez,.5);});return;}
  if(id==='prova_fenrir'&&!fim){if(provaFenrirEstado()==='vencida')abreFala('prova_vence',concluiProvaFenrir);else abreFala('prova_fenrir',()=>{UI.escolha={id:'prova',ops:['Lutar agora','Ainda não'],sel:0};som(SOM.ui_vez,.5);});return;}
  if(id==='prova_vence'&&!fim)return;
  if(id==='santuario'&&!fim){abreFala('santuario',()=>{if(typeof encheVida==='function')encheVida();salvaVila();aviso('HP e MP recuperados · Jogo salvo!','#7dffa8');});return;}if(id.startsWith('col_')){pegaColeta(id.slice(4));return;}if(!UI.pulaLoja&&uiFala(id))return;
  if(!UI.soConversa&&typeof missaoFala==='function'){const mf=missaoFala(id);if(mf){hero.pose=POSE_FALA[id]||null;hero.parado=0;hero.alvo=null;hero.pontoAlvo=null;fala={linhas:mf.linhas,i:0,letras:0,fim:()=>{if(mf.fim)mf.fim();if(fim)fim();}};som(SOM.ui_vez,.5);return;}}if(id==='bacon')oinc(.85);if(id==='altar'&&!hero.espada){filmeEspada();return;}hero.pose=POSE_FALA[id]||null;hero.parado=0;if(!FALAS[id]){if(fim)fim();return;}   // ponto sem fala escrita: nao trava o jogo (bug do Tunel das correntes)
  fala={linhas:FALAS[falaDaFase(id)],i:0,letras:0,fim};hero.alvo=null;hero.pontoAlvo=null;som(SOM.ui_vez,.5);}
// falas que mudam com a historia (pedido 2026-11-19): antes da espada / depois da espada / depois do resgate do Halvard
function falaDaFase(id){const res=typeof estadoMissao==='function'&&estadoMissao('olhos_roxos')==='feita';
  if(id==='vovo'&&hero.espada&&FALAS.vovo_depois)return 'vovo_depois';
  if((id==='borin'||id==='tico')&&hero.espada){const k=id+(res?'_resgate':'_espada');if(FALAS[k])return k;}
  return id;}
function avanca(){if(!fala)return;const L=fala.linhas[fala.i][1];
  if(fala.letras<L.length){fala.letras=L.length;return;}
  fala.i++;fala.letras=0;som(SOM.ui_mover,.45);if(fala.i>=fala.linhas.length){const f=fala.fim;fala=null;if(f)f();}}
// a espada voa para a mao: clarao, gelo estourando, e dai em diante ele anda com ela nas costas
let clarao=0;function ganhaEspada(){hero.espada=true;clarao=1;som(SOM.ui_vez,.9);for(let i=0;i<40;i++)poeira.push({x:hero.x+rnd(-14,14),y:hero.y-rnd(0,30),vx:rnd(-60,60),vy:rnd(-80,-10),v:0});setTimeout(()=>abreFala('altar_ganha'),700);}
function nomePonto(id){if(NOMES[id])return NOMES[id];if(id.startsWith('tes_')){const q=TESOUROS.find(s=>'tes_'+s.id===id);return q&&q.tipo==='bau'?'Baú':'Algo brilhando';}
  if(id.startsWith('col_')){const c=COLETAS.find(q=>'col_'+q.id===id);return c?ITENS[c.item].nome:'Algo';}return '';}
function pontoPerto(){let m=null,md=1e9;for(const p of V.pontos){const d=Math.hypot(hero.x-p.x,hero.y-p.y);if(d<p.r&&d<md){m=p;md=d;}}return m;}


/* ---------- REGIÕES E ENCONTROS ALEATÓRIOS (SISTEMA_RPG.md §7b) ----------
   Na vila não tem luta. Fora dela, contador de passos (16 px = 1 passo): luta depois de 110-240 passos sorteados (~25-55 s andando), igual FF. Antigo: nos primeiros 20 passos depois de
   chegar (ou de uma luta) nunca; depois a chance sobe aos poucos (+0,6% por passo, até 10%). Repelente: nada de lutas.
   Perto da entrada e do santuário é lugar seguro. A luta é no index.html (localStorage jux_encontro) e volta para cá. */
const ENCONTROS={
  trilha:{nv:[2,4],volta:'trilha.html',seguros:[[722,150,140],[1232,470,120]],
    grupos:[[['lobo'],4],[['bolota'],4],[['goblin'],3],[['lobo','lobo'],3],[['bolota','bolota'],3],[['goblin','bolota'],3],[['lobo','goblin'],2],[['bolota','bolota','bolota'],1],[['lobo','lobo','goblin'],1],[['acolito'],1],[['lobo','acolito'],1]]},
  garganta:{nv:[5,7],volta:'garganta.html',seguros:[[170,650,170],[1330,905,150]],
    grupos:[[['lobo','lobo'],4],[['lobo','goblin'],3],[['goblin','goblin'],3],[['lobo','lobo','lobo'],2],[['bolota','bolota','lobo'],2],[['goblin','goblin','bolota'],2],[['acolito'],1],[['lobo','acolito'],1]]},
  // CAVERNA DO LOBO (interior escuro): lobos marcados pela Ordem e acolitos; perto da entrada e na camara do Alfa e seguro
  caverna:{nv:[6,8],volta:'caverna.html',seguros:[[693,1000,110],[720,250,170]],
    grupos:[[['lobo','lobo'],4],[['lobo','lobo','lobo'],2],[['acolito'],2],[['lobo','acolito'],2],[['goblin','lobo'],1]]},
  // PICO DO UIVO (PICO_DO_UIVO.md): lobos fortes e acolitos que vigiam o circulo; perto da subida e no circulo e seguro
  // 2026-11-20 (pedido): o Pico e so para a luta com o Fenrir, SEM lutas aleatorias
  pico:{semLutas:true,nv:[9,11],volta:'pico.html',seguros:[[650,1000,120],[655,280,200]],
    grupos:[[['lobo','lobo'],4],[['lobo','lobo','lobo'],3],[['acolito','lobo'],2],[['acolito','acolito'],1]]},
  // VALE DOS LOBOS (VALE_DOS_LOBOS.md): lugar de upar antes do Skoll. Lutas mais frequentes (passos), mais lobos, Lobo Alfa 20% (elite) e EXP +30% (index.html win)
  vale:{nv:[5,7],volta:'vale.html',passos:[60,120],alfa:.2,seguros:[[735,1000,120]],
    grupos:[[['lobo','lobo'],5],[['lobo','lobo','lobo'],4],[['lobo','goblin'],2],[['lobo','lobo','bolota'],2],[['goblin','goblin','lobo'],2],[['lobo'],1]]},
};
const ENC=ENCONTROS[REGIAO]||null;let encDist=0,encPassos=0,transicao=0;const sorteiaLimiar=()=>ENC&&ENC.passos?ENC.passos[0]+Math.floor(Math.random()*(ENC.passos[1]-ENC.passos[0]+1)):110+Math.floor(Math.random()*131);let encAlvo=sorteiaLimiar()+30;   // o primeiro vem um pouco mais tarde (da tempo de explorar)
const lobosPendentes=()=>REGIAO!=='vila'&&typeof estadoMissao==='function'&&estadoMissao('olhos_roxos')==='ativa'&&((JOGO.cap1||{}).lobos||0)<3;
const acolitoLiberado=()=>['vencida','feita'].includes((JOGO.provas||{}).acolito);   // o Acolito so aparece nas lutas aleatorias DEPOIS de vencido no santuario
function sorteiaGrupo(){const gs=lobosPendentes()?[[['lobo'],3],[['lobo','lobo'],3],[['lobo','lobo','goblin'],1]]:ENC.grupos.filter(g=>acolitoLiberado()||!g[0].includes('acolito'));let r=Math.random()*gs.reduce((s,g)=>s+g[1],0);for(const g of gs){r-=g[1];if(r<=0)return g[0];}return gs[0][0];}
function passoEncontro(){if(ENC.semLutas)return;
  if((JOGO.repelente||0)>0){JOGO.repelente--;if(!JOGO.repelente)aviso('O Repelente acabou.','#c8b0ff');return;}
  if(ENC.seguros.some(([x,y,r])=>Math.hypot(hero.x-x,hero.y-y)<r))return;
  // estilo Final Fantasy: contador de passos com limiar sorteado. 1 passo = 16 px (andando ~4,4 passos/s): 110 a 240 passos = uns 25 a 55 s andando (14 a 31 s correndo) sem luta nenhuma
  encPassos++;if(encPassos>=(lobosPendentes()?Math.min(encAlvo,48):encAlvo)){   // missao dos lobos: a luta vem em ~11 s andando e so com lobos
    encAlvo=sorteiaLimiar();iniciaEncontro();}}
// luta especial (prova de um Eco): um unico inimigo fixo; ao ganhar, o index.html marca JOGO.provas[nome]='vencida'
const PROVAS={fenrir:{tipos:['fenrir_prova'],nv:12},skoll:{tipos:['skoll'],nv:9},acolito:{tipos:['acolito'],nv:8}};   // lutas fixas: o nivel NAO acompanha o heroi
for(const c of MINICHEFES)PROVAS['chefe_'+c.id]={tipos:[c.tipo],nv:c.nv,chefe:{nome:c.nome,hp:c.hp,forca:c.forca,exp:c.exp}};
function iniciaProva(nome){if(transicao)return;transicao=.001;hero.alvo=null;hero.pontoAlvo=null;for(const k in teclas)teclas[k]=false;
  som(SOM.whoosh,.8);if(MUS)MUS.pause();
  try{localStorage.setItem('jux_encontro',JSON.stringify({regiao:REGIAO,tipos:PROVAS[nome].tipos,nv:PROVAS[nome].nv,volta:REGIAO+'.html',prova:nome,chefe:PROVAS[nome].chefe||null}));}catch(e){}
  salvaVila();setTimeout(()=>{paraAudio();location.href=jp('batalha.html');},1100);}
function iniciaEncontro(){if(transicao)return;transicao=.001;hero.alvo=null;hero.pontoAlvo=null;UI.menu=false;UI.loja=null;UI.escolha=null;for(const k in teclas)teclas[k]=false;
  som(SOM.whoosh,.8);if(MUS)MUS.pause();
  const [a,b]=ENC.nv,nv=Math.max(1,Math.round(a+Math.random()*(b-a)));
  const tipos=sorteiaGrupo(),elite=tipos.includes('lobo')&&Math.random()<(ENC.alfa||.08);   // 8%: um LOBO ALFA (mais forte, paga 3x EXP e gil)
  try{localStorage.setItem('jux_encontro',JSON.stringify({regiao:REGIAO,tipos,nv:elite?nv+1:nv,volta:ENC.volta,elite}));}catch(e){}
  salvaVila();setTimeout(()=>{paraAudio();location.href=jp('batalha.html');},1100);}
// tela quebrando em cacos de gelo antes da luta
function desenhaTransicao(){if(!transicao)return;transicao=Math.min(1,transicao+.022);const p=transicao;
  ctx.save();ctx.setTransform(1,0,0,1,0,0);
  for(let i=0;i<14;i++){const ang=i/14*6.283+p*2,rr=p*700;ctx.fillStyle=i%2?`rgba(191,244,255,${.55*p})`:`rgba(10,24,60,${.9*p})`;
    ctx.beginPath();ctx.moveTo(W/2,H/2);ctx.lineTo(W/2+Math.cos(ang)*rr,H/2+Math.sin(ang)*rr);ctx.lineTo(W/2+Math.cos(ang+.45)*rr,H/2+Math.sin(ang+.45)*rr);ctx.fill();}
  if(p>.5){ctx.fillStyle=`rgba(3,5,12,${(p-.5)*2})`;ctx.fillRect(0,0,W,H);}
  if(p<.35){ctx.fillStyle=`rgba(255,255,255,${(.35-p)*2})`;ctx.fillRect(0,0,W,H);}
  ctx.restore();}
const SAIDAS={vila:{fwd:[722,738,'Trilha']},trilha:{back:[722,70,'Vila'],fwd:[1408,515,'Garganta']},garganta:{back:[95,610,'Trilha'],fwd:[1212,300,'Vale']},vale:{back:[735,1050,'Garganta'],fwd:[740,215,'Pico']},pico:{back:[650,1062,'Vale']},caverna:{back:[712,1060,'Garganta']}};
function paraAudio(){try{if(MUS)MUS.pause();VENTO.pause();for(const v of Object.values(VOZES))v.pause();if(musAtual)musAtual.pause();}catch(e){}}
addEventListener('pagehide',paraAudio);
// aba escondida = sem som: se uma pagina velha do jogo ficou aberta em outra aba/janela (vila enquanto voce joga a trilha), ela nao toca por cima da atual.
// Funciona mesmo quando o navegador isola as paginas (sem localStorage/BroadcastChannel compartilhado). Ao voltar para a aba, retoma so o que estava tocando.
{let tocavam=[];document.addEventListener('visibilitychange',()=>{
  if(document.hidden){tocavam=[MUS,VENTO,musAtual,...Object.values(VOZES)].filter(a=>a&&!a.paused);paraAudio();try{if(AC&&AC.state==='running')AC.suspend();}catch(e){}}
  else if(!window.__morta){try{if(AC&&AC.state==='suspended')AC.resume();}catch(e){}for(const a of tocavam)a.play().catch(()=>{});tocavam=[];}});}
function vaiPara(pagina){salvaVila();paraAudio();setTimeout(()=>{location.href=jp(pagina);},250);}
/* ---------- entrada */
/* ---------- ABERTURA: como o Jux foi parar em Elyria (8 cenas em assets/cine_intro, prompts em PROMPTS_CINE_INTRO.md).
   Toca na primeira visita (ou pelo botao "Abertura"). Cada cena: camera que anda/aproxima, legendas digitando,
   sons e efeitos; troca com fusao. Clique/toque/ESPACO = proxima cena, ENTER/ESC = pular tudo. */
let CENAS=[
  {mus:'piano',cam:[.42,.46,1.0, .38,.42,1.12],dur:9,fx:'neve',voz:[.5,1],falas:[[.5,'Narrador','Todo herói começa em algum lugar.'],[4,'Narrador','O Jux começou num sofá, às três da manhã.']],sons:[]},
  {mus:'piano',cam:[.5,.5,1.12, .52,.48,1.0],dur:5.8,fx:'geada',voz:[.5,2],falas:[[.5,'Narrador','Naquela noite, o jogo resolveu jogar de volta.']],sons:[[.3,'gelo'],[3.2,'quebra']]},
  {mus:'piano',cam:[.42,.42,1.18, .44,.4,1.05],dur:7.5,fx:'neve',voz:[.4,3],voz2:[3.7,8],falas:[[.4,'???','Finalmente… você.',1],[3.7,'Jux','…Isso não estava no tutorial.']],sons:[[.2,'brilho']]},
  {mus:'piano',cam:[.5,.5,1.0, .62,.5,1.22],dur:7.2,fx:'vortice',voz:[.5,4],falas:[[.5,'Jux','Tá. Eu aceito a missão. Mas o café vai junto.']],sons:[[.2,'carga'],[5.4,'whoosh']],treme:[4.8,7.2]},
  {mus:'epico',cam:[.3,.55,1.25, .62,.45,1.0],dur:8.8,fx:'neve',voz:[.5,5],falas:[[.5,'Narrador','Elyria. Sete cristais, um mundo em equilíbrio…'],[5.5,'Narrador','…e uma visita inesperada.']],sons:[[.2,'whoosh2']]},
  {mus:'sombrio',cam:[.6,.4,1.2, .5,.5,1.02],dur:6.2,fx:'escuro',voz:[.6,6],falas:[[.6,'Voz encapuzada','Uma estrela sem sombra caiu no norte.',2],[3.7,'Voz encapuzada','Encontrem-na.',2]],sons:[]},
  {mus:'vila',cam:[.5,.5,1.25, .5,.52,1.05],dur:3.8,fx:'impacto',falas:[],sons:[[.15,'impacto'],[.3,'oinc']],treme:[.1,1.1],flash:.12},
  {mus:'vila',cam:[.48,.5,1.05, .5,.48,1.2],dur:10,fx:'neve',voz:[2,7],falas:[[.7,'Sir Bacon','Oinc.'],[2,'Jux','Respawn no chiqueiro. Começo humilde.'],[6.8,'Jux','Vou gostar dessa história.']],sons:[[.7,'oinc']]},
];
const VOZES={};for(let k=1;k<=8;k++)VOZES[k]=arq('assets/cine_intro/voz_'+k);
// filmes: fora a abertura na vila, as imagens so baixam DEPOIS da tela de carregamento (nao seguram a entrada no mapa); tocaFilme espera chegarem
function imgsFilme(urls){return urls.map(u=>{const im=new Image();(window.depois||(f=>f()))(()=>{im.src=u;});return im;});}
let CENA_IMG=REGIAO==='vila'?CENAS.map((c,i)=>{const im=new Image();im.src='assets/cine_intro/cena_'+(i+1)+'.jpg';return im;}):imgsFilme(CENAS.map((c,i)=>'assets/cine_intro/cena_'+(i+1)+'.jpg'));
const CENAS_INTRO=CENAS,IMG_INTRO=CENA_IMG;
/* ---------- CINEMATICA DA ESPADA (assets/cine_espada, prompts em PROMPTS_CINE_ESPADA.md): toca ao chegar no altar sem a espada */
const CENAS_ESPADA=[
  {mus:'lenda',cam:[.5,.55,1.0, .62,.4,1.15],dur:16.5,fx:'neve',vozes:[[.5,'e1a'],[10.4,'e1b']],falas:[[.5,'Narrador','Mil anos. Reis, cavaleiros e heróis subiram esta escada.'],[5.2,'Narrador','Nenhum desceu com a espada.'],[10.4,'Vovó Hilda','Vamos ver o que o forasteiro sem sombra tem a dizer.']],sons:[]},
  {mus:'lenda',cam:[.5,.6,1.0, .55,.35,1.2],dur:4.6,fx:'geada',vozes:[[1.5,'e2']],falas:[[1.5,'Jux','…Então é você.']],sons:[[.3,'brilho']]},
  {mus:'lenda',cam:[.55,.4,1.15, .5,.5,1.0],dur:8.2,fx:'neve',vozes:[[.4,'e3a'],[4.8,'e3b']],falas:[[.4,'Borin','VINTE ANOS! Vinte anos puxando essa coisa!'],[4.8,'Jux','Talvez o problema seja exatamente esse.']],sons:[],treme:[.2,3]},
  {mus:'lenda',cam:[.35,.45,1.2, .4,.5,1.05],dur:5.8,fx:'neve',vozes:[[.8,'e4']],falas:[[.8,'Jux','Não é um teste de força.'],[2.7,'Jux','…É uma pergunta.']],sons:[]},
  {mus:'lenda',cam:[.5,.5,1.0, .58,.42,1.18],dur:7.5,fx:'geada',vozes:[[.6,'e5']],falas:[[.6,'Jux','Eu não vim te tirar daí.'],[3.3,'Jux','Vim te perguntar se quer lutar comigo.']],sons:[[.2,'carga']]},
  {mus:'heroi',cam:[.6,.5,1.2, .5,.45,1.0],dur:6.4,fx:'vortice',vozes:[[1.2,'e6']],falas:[[1.2,'Aurora','Mil anos… esperando alguém que perguntasse.',1]],sons:[[.1,'quebra'],[.4,'impacto']],treme:[.1,2.2],flash:.08},
  {mus:'heroi',cam:[.45,.45,1.15, .55,.5,1.0],dur:11.4,fx:'geada',vozes:[[.6,'e7a'],[7.4,'e7b']],falas:[[.6,'Aurora','Eu sou Aurora Gélida.',1],[3.6,'Aurora','E a resposta é sim, Portador.',1],[7.4,'Jux','Prazer, Aurora. Hora de trabalhar.']],sons:[[.2,'whoosh'],[.9,'gelo']]},
  // CENA DOS OLHOS (CINE_OLHOS.md): o vinculo com a Aurora deixa a marca do gelo nos olhos do Jux. Imagem propria (img); vozes assets/cine_espada/voz_olhos_*.
  {img:'assets/cine_espada/cena_olhos.jpg',mus:'heroi',cam:[.5,.5,1.0, .5,.46,1.14],dur:26,fx:'geada',vozes:[[.6,'o1'],[5.7,'o2'],[8.9,'o3'],[15.8,'o4'],[17.3,'o5'],[21.3,'o6']],falas:[[.6,'Aurora','O vínculo deixa uma marca, Portador. Olhe.',1],[5.7,'Jux','…Meus olhos eram castanhos.'],[8.9,'Aurora','Eram. Agora você enxerga como eu: através do gelo.',1],[15.8,'Jux','Dá pra devolver?'],[17.3,'Aurora','Quando a espada deixar de te escolher.',1],[21.3,'Jux','Então ficam. Combinam com o casaco.']],sons:[[.3,'brilho'],[1.6,'gelo'],[1.7,'whoosh']],treme:[1.5,2.7],flash:.1},
  {mus:'heroi',cam:[.5,.6,1.0, .5,.35,1.15],dur:9,fx:'neve',vozes:[[1,'e8a'],[4.8,'e8b']],falas:[[1,'Borin','Eu… eu não tô chorando! É neve no olho!'],[4.8,'Jux','Muito bem, Elyria. Vamos começar o jogo.']],sons:[[.2,'brilho']]},
];
for(const k of ['1a','1b','2','3a','3b','4','5','6','7a','7b','8a','8b'])VOZES['e'+k]=arq('assets/cine_espada/voz_'+k);
for(let k=1;k<=6;k++)VOZES['o'+k]=arq('assets/cine_espada/voz_olhos_'+k+['_aurora','_jux','_aurora','_jux','_aurora','_jux'][k-1]);
let _nEsp=0;const IMG_ESPADA=imgsFilme(CENAS_ESPADA.map(c=>c.img||'assets/cine_espada/cena_'+(++_nEsp)+'.jpg'));
// CUTSCENE DE ENTRADA DO BINO (CINE_ENTRADA_BINO.md): ele ouve a Vovo e o Jux, conta de onde veio (2 flashbacks) e entra no time. Vozes em japones gravadas pelo Jux (assets/cine_bino_entrada/voz_*).
// CUTSCENE DE ENTRADA DO SKOLL (CINE_SKOLL.md): toca ao escolher "Entrar" na Camara do Alfa; no fim comeca a luta
const CENAS_SKOLL=[
  {mus:'sombrio',cam:[.5,.62,1.0, .5,.5,1.12],dur:7,fx:'escuro',vozes:[[1.2,'sk1']],falas:[[1.2,'Aurora','Ele está aqui, Portador. Preso há tempo demais.',1]],sons:[[.3,'correntes']],treme:[4.5,5.2]},
  {mus:'sombrio',cam:[.62,.45,1.0, .7,.42,1.18],dur:6.5,fx:'escuro',vozes:[[1.4,'sk2']],falas:[[1.4,'Jux','…Olhos roxos. A Ordem está dentro dele.']],sons:[[.2,'rosna']]},
  {mus:'skoll',cam:[.5,.55,1.12, .5,.45,1.0],dur:7,fx:'escuro',vozes:[[4,'sk3']],falas:[[.8,'Skoll','Fuja… eu não consigo parar.',2],[4,'Bino','…Não vou fugir.']],sons:[[.2,'correntes'],[.5,'impacto'],[3.5,'quebra']],treme:[.2,3.2]},
  {mus:'skoll',cam:[.45,.5,1.0, .55,.4,1.15],dur:7,fx:'escuro',vozes:[[2.2,'sk4']],falas:[[2.2,'Jux','Então a gente quebra as correntes por você.']],sons:[[.1,'uivo'],[1.2,'quebra']],treme:[.1,2.4],flash:.12},
];
for(const [k,f] of [['sk1','skoll_1_aurora'],['sk2','skoll_2_jux'],['sk3','skoll_3_bino'],['sk4','skoll_4_jux']])VOZES[k]=arq('assets/cine_skoll/voz_'+f);
const IMG_SKOLL=imgsFilme(CENAS_SKOLL.map((c,i)=>'assets/cine_skoll/cena_'+(i+1)+'.jpg'));
if(REGIAO==='caverna'&&location.hash==='#cine_skoll')setTimeout(()=>tocaFilme(CENAS_SKOLL,IMG_SKOLL,()=>{}),1500);   // lab
// CUTSCENE DE ENTRADA DO FENRIR (CINE_FENRIR.md, aprovada 2026-11-19): no circulo de pedras do Pico, ao escolher "Lutar agora";
// so o Fenrir nas imagens (regra dos Ecos); a equipe fala em legenda e voz (assets/cine_fenrir/voz_*); o Fenrir fala em legenda (pensamento)
const CENAS_FENRIR=[   // 10 cenas: o Fenrir (cena_1..5) intercalado com a equipe olhando e falando (equipe_a..d, pedido do usuario 2026-11-19)
  {img:'cena_1',mus:'fenrir',cam:[.5,.6,1.0, .5,.5,1.12],dur:7,fx:'neve',vozes:[[1.6,'fe1']],falas:[[1.6,'Aurora','Ele chegou, Portador. O vento se curvou.',1]],sons:[[.2,'whoosh2'],[3.2,'brilho']]},
  {img:'cena_2',mus:'fenrir',cam:[.5,.55,1.14, .5,.45,1.0],dur:4.5,fx:'neve',vozes:[],falas:[],sons:[[.1,'whoosh'],[.8,'rosna']],treme:[.8,1.6]},
  {img:'equipe_a',mus:'fenrir',cam:[.45,.55,1.0, .5,.45,1.1],dur:6.5,fx:'neve',vozes:[[1,'fe2']],falas:[[1,'Jux','…Isso é um lobo ou uma tempestade com dentes?']],sons:[]},
  {img:'cena_3',mus:'fenrir',cam:[.55,.5,1.0, .6,.45,1.1],dur:5,fx:'neve',vozes:[],falas:[[.6,'Fenrir','Vocês libertaram o meu filho. O Skoll.',3]],sons:[]},
  {img:'equipe_b',mus:'fenrir',cam:[.55,.45,1.0, .6,.4,1.1],dur:4,fx:'neve',vozes:[[.8,'fe3']],falas:[[.8,'Bino','…Ele está livre.']],sons:[]},
  {img:'cena_3',mus:'fenrir',cam:[.6,.42,1.12, .55,.48,1.22],dur:5.5,fx:'neve',vozes:[],falas:[[.5,'Fenrir','A gratidão de um lobo não se dá. Se prova.',3]],sons:[]},
  {img:'cena_4',mus:'fenrir',cam:[.4,.55,1.0, .45,.5,1.12],dur:12,fx:'neve',vozes:[[5.6,'fe4a']],falas:[[.8,'Fenrir','Diante dos ossos de quem veio antes de mim… mostrem quem vocês são.',3],[5.6,'Aurora','Ele quer saber se você é digno de levá-lo, Portador.',1]],sons:[]},
  {img:'equipe_c',mus:'fenrir',cam:[.5,.45,1.0, .48,.4,1.1],dur:6.5,fx:'neve',vozes:[[.8,'fe4j']],falas:[[.8,'Jux','Eu tenho um plano. Costuma dar errado, mas é um plano.']],sons:[[.3,'brilho']]},
  {img:'cena_5',mus:'fenrir',cam:[.5,.55,1.12, .5,.45,1.0],dur:6,fx:'neve',vozes:[],falas:[[2.4,'Fenrir','Então venham. Todos vocês.',3]],sons:[[.1,'uivo'],[.4,'whoosh2']],treme:[.1,2.4],flash:.14},
  {img:'equipe_d',mus:'fenrir',cam:[.5,.5,1.1, .5,.5,1.0],dur:6.5,fx:'neve',vozes:[[.6,'fe5b'],[1.8,'fe5j']],falas:[[.6,'Bino','…Juntos.'],[1.8,'Jux','Aurora, Bino… vamos!']],sons:[[.2,'whoosh2'],[1.6,'gelo']],treme:[1.8,2.6]},
];
// pacote (cine_fenrir.js, tools/pack_cine_fenrir.py): o artefato publicado tem limite de 512 arquivos; sem o pacote usa os arquivos soltos
const PKF=window.JUX_CINE_FENRIR||null;
for(const [k,f] of [['fe1','1_aurora'],['fe2','2_jux'],['fe3','3_bino'],['fe4a','4_aurora'],['fe4j','4_jux'],['fe5b','5_bino'],['fe5j','5_jux']]){
  if(PKF&&PKF.voz[f]){const a=new Audio();a.dataset.tipo='voz';a.src=PKF.voz[f][ogg==='.ogg'?'ogg':'mp3'];a.preload='auto';VOZES[k]=a;}else VOZES[k]=arq('assets/cine_fenrir/voz_fenrir_'+f);}
const IMG_FENRIR=imgsFilme(CENAS_FENRIR.map(c=>(PKF&&PKF.img[c.img])||('assets/cine_fenrir/'+c.img+'.jpg')));
if(REGIAO==='pico'&&location.hash==='#cine_fenrir')setTimeout(()=>tocaFilme(CENAS_FENRIR,IMG_FENRIR,()=>{}),1500);   // lab
// CUTSCENE "A ORDEM DO ECLIPSE" (LORE_ORDEM_CENA.md, aprovada 2026-11-19): a Aurora mostra ao Jux, pela lamina, quem e o inimigo.
// Toca depois da pista do acampamento goblin (Olhos Roxos); antes, a fala ordem_ve; depois, ordem_depois. Vozes: assets/cine_ordem/voz_ordem_*
const CENAS_ORDEM=[
  {mus:'lenda',cam:[.5,.5,1.0, .5,.45,1.12],dur:9.5,fx:'neve',vozes:[[.8,'or1a'],[6,'or1j']],falas:[[.8,'Aurora','Sete cristais seguram o equilíbrio de Elyria, Portador.',1],[6,'Jux','Sete. Claro que são sete.']],sons:[[.2,'brilho']]},
  {mus:'ordem',cam:[.5,.45,1.12, .5,.5,1.0],dur:7,fx:'escuro',vozes:[[1.2,'or2a']],falas:[[1.2,'Aurora','A Ordem do Eclipse quer apagar todos. Um por um.',1]],sons:[[.2,'quebra'],[3.5,'quebra']],treme:[3.4,4.2]},
  {mus:'ordem',cam:[.4,.55,1.0, .5,.5,1.1],dur:12,fx:'escuro',vozes:[[.8,'or3a'],[10,'or3b']],falas:[[.8,'Aurora','Arrancam a sombra das pessoas. Quem perde a sombra vira uma Sombra: uma casca que obedece.',1],[10,'Bino','…Minha montanha.']],sons:[[.4,'whoosh2']]},
  {mus:'ordem',cam:[.45,.4,1.0, .45,.4,1.15],dur:10,fx:'escuro',vozes:[[1,'or4a']],falas:[[1,'Aurora','Quem manda é o Arauto. Ninguém viu o rosto dele. Ele fala pela boca dos outros.',1]],sons:[[.2,'rosna']]},
  {mus:'ordem',cam:[.5,.35,1.12, .5,.5,1.0],dur:13,fx:'escuro',vozes:[[.8,'or5a'],[6,'or5j']],falas:[[.8,'Aurora','Quando o último se apagar, vem o Eclipse Eterno.',1],[6,'Jux','Clássico. Ambicioso, dramático e péssimo para o turismo.']],sons:[[.1,'impacto']],treme:[.1,1.2],flash:.1},
];
for(const [k,f] of [['or1a','1_aurora'],['or1j','1_jux'],['or2a','2_aurora'],['or3a','3_aurora'],['or3b','3_bino'],['or4a','4_aurora'],['or5a','5_aurora'],['or5j','5_jux']])VOZES[k]=arq('assets/cine_ordem/voz_ordem_'+f);
const IMG_ORDEM=imgsFilme(CENAS_ORDEM.map((c,i)=>'assets/cine_ordem/cena_'+(i+1)+'.jpg'));
function contaOrdem(){if(JOGO.ordemSabe)return;abreFala('ordem_ve',()=>tocaFilme(CENAS_ORDEM,IMG_ORDEM,()=>{JOGO.ordemSabe=true;salvaJogo();setTimeout(()=>abreFala('ordem_depois'),400);}));}
if(REGIAO==='trilha'&&location.hash==='#cine_ordem')setTimeout(()=>tocaFilme(CENAS_ORDEM,IMG_ORDEM,()=>{}),1500);   // lab
const CENAS_BINO=[
  {mus:'bino_a',cam:[.5,.5,1.0, .72,.55,1.2],dur:17,fx:'neve',vozes:[[.6,'b1v'],[10.2,'b1j']],falas:[[.6,'Vovó Hilda','O Halvard tem um filho que não larga a minha saia e uma cama vazia em casa. Traga ele de volta, forasteiro.'],[10.2,'Jux','Eu trago. Só preciso de um plano, de uma espada e de uma sorte razoável.']],sons:[]},
  {mus:'bino_a',cam:[.55,.45,1.0, .62,.5,1.12],dur:5,fx:'neve',vozes:[[.9,'b2']],falas:[[.9,'Bino','…Halvard.',1]],sons:[]},
  {mus:'bino_a',cam:[.55,.5,1.0, .6,.5,1.1],dur:11.5,fx:'neve',vozes:[[.6,'b3a'],[2,'b3ja'],[4.6,'b3b'],[6.1,'b3jb'],[8.7,'b3c']],falas:[[.6,'Bino','…Ouvi.'],[2,'Jux','A conversa inteira?'],[4.6,'Bino','Eu vou.'],[6.1,'Jux','Isso era uma pergunta?'],[8.7,'Bino','Não.']],sons:[[.1,'impacto']],treme:[.1,.9]},
  {mus:'bino_a',cam:[.55,.5,1.1, .5,.5,1.0],dur:11.5,fx:'neve',vozes:[[.6,'b4a'],[4.5,'b4h'],[7,'b4b']],falas:[[.6,'Bino','Cheguei aqui sem nome. Sem comida.'],[4.5,'Halvard','Come. Pergunta depois.'],[7,'Bino','Ele nunca perguntou.']],sons:[]},
  {mus:'bino_a',cam:[.5,.68,1.0, .5,.38,1.14],dur:16.8,fx:'neve',vozes:[[.6,'b5b'],[8,'b5a']],falas:[[.6,'Bino','Minha montanha ficou muda. Uns de capuz preto passaram. Eu desci.'],[8,'Aurora','Ele é de um povo de guardadores de pedra, Portador. Existe uma força nele que eles reconheceriam.',1]],sons:[]},
  {mus:'bino_b',cam:[.45,.5,1.0, .5,.42,1.16],dur:20,fx:'neve',vozes:[[.5,'b6ja'],[6.4,'b6ba'],[7.9,'b6jb'],[11,'b6bb'],[13.1,'b6v']],falas:[[.5,'Jux','Eu sou o Jux. Sou bom em ideias e em cair em porcos.'],[6.4,'Bino','Bino.'],[7.9,'Jux','Prazer. Quer entrar no time?'],[11,'Bino','Já entrei.'],[13.1,'Vovó Hilda','Hmpf. Dois homens, quase um cérebro. Vão.']],sons:[[6.1,'brilho']]},
  {mus:'bino_b',cam:[.5,.5,1.0, .5,.55,1.16],dur:14,fx:'neve',vozes:[[.6,'b7a'],[5.2,'b7j']],falas:[[.6,'Aurora','Dois são mais difíceis de derrubar do que um, Portador.',1],[5.2,'Jux','E mais difíceis de convencer a andar na mesma direção.'],[10.6,'✦','Bino entrou no time!',1]],sons:[]},
];
for(const [k,f] of Object.entries({'b1v': '1_vovo', 'b1j': '1_jux', 'b2': '2_bino', 'b3a': '3_bino_a', 'b3ja': '3_jux_a', 'b3b': '3_bino_b', 'b3jb': '3_jux_b', 'b3c': '3_bino_c', 'b4a': '4_bino_a', 'b4h': '4_halvard', 'b4b': '4_bino_b', 'b5b': '5_bino', 'b5a': '5_aurora', 'b6ja': '6_jux_a', 'b6ba': '6_bino_a', 'b6jb': '6_jux_b', 'b6bb': '6_bino_b', 'b6v': '6_vovo', 'b7a': '7_aurora', 'b7j': '7_jux'}))VOZES[k]=arq('assets/cine_bino_entrada/voz_'+f);
const IMG_BINO=imgsFilme(CENAS_BINO.map((c,i)=>'assets/cine_bino_entrada/cena_'+(i+1)+'.jpg'));
if(REGIAO==='vila'&&location.hash==='#cine_bino')setTimeout(()=>tocaFilme(CENAS_BINO,IMG_BINO,()=>{}),1500);   // lab: abre a cutscene direto
const ALTV=new Image();if(V.altar_vazio)ALTV.src=V.altar_vazio.img;let espadaSobe=99;
function tocaFilme(cenas,imgs,onFim){const t0=Date.now();(function vai(){if(imgs.some(i=>!i.complete||!i.naturalWidth)&&Date.now()-t0<10000)return setTimeout(vai,100);tocaFilme0(cenas,imgs,onFim);})();}
function tocaFilme0(cenas,imgs,onFim){CENAS=cenas;CENA_IMG=imgs;ab.onFim=onFim;ab.on=true;ab.neve=[];ab.i=0;ab.t=0;ab.fim=0;fala=null;abToca();}
function filmeEspada(){tocaFilme(CENAS_ESPADA,IMG_ESPADA,()=>{hero.espada=true;espadaSobe=-.6;salvaVila();clarao=1;hero.olha='baixo';
  for(let i=0;i<40;i++)poeira.push({x:hero.x+rnd(-14,14),y:hero.y-rnd(0,30),vx:rnd(-60,60),vy:rnd(-80,-10),v:0});});}
const MUS_CINE={piano:arq('assets/musica/intro_piano'),epico:arq('assets/musica/cine_4'),lenda:arq('assets/musica/espada_lenda'),heroi:arq('assets/musica/espada_heroi'),bino_a:arq('assets/musica/bino_a'),skoll:arq('assets/musica/chefe_skoll'),fenrir:arq('assets/musica/cine_fenrir'),ordem:arq('assets/musica/cine_ordem'),bino_b:arq('assets/musica/bino_b')};
let musAtual=null,musNome=null,drone=null;
function abMusica(nome){   // troca a musica com fusao de 1 s; 'sombrio' = drone grave sintetizado; 'vila' = musica da vila (continua no jogo)
  if(nome===musNome||window.__morta)return;musNome=nome;
  const velha=musAtual;if(velha){let v=velha.volume;const f=setInterval(()=>{v-=.06;if(v<=0){clearInterval(f);velha.pause();}else velha.volume=v;},60);}
  if(drone){const d=drone;d.g.gain.setTargetAtTime(0,AC.currentTime,.4);setTimeout(()=>{try{d.o1.stop();d.o2.stop();}catch(e){}},2000);drone=null;}
  musAtual=null;
  if(nome==='sombrio'&&AC){const g=AC.createGain();g.gain.value=0;g.connect(acSaida(AC));const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=380;f.connect(g);
    const o1=AC.createOscillator(),o2=AC.createOscillator();o1.type='sawtooth';o2.type='sawtooth';o1.frequency.value=55;o2.frequency.value=55*1.498;o2.detune.value=8;
    o1.connect(f);o2.connect(f);o1.start();o2.start();g.gain.setTargetAtTime(.09,AC.currentTime,.6);drone={g,o1,o2};return;}
  const a=nome==='vila'?MUS:MUS_CINE[nome];if(!a)return;
  try{if(nome!=='vila')a.currentTime=0;a.volume=0;a.play().catch(()=>{});}catch(e){}
  musAtual=a;let v=0;const alvo=nome==='vila'?.42:.55;const f=setInterval(()=>{v+=.05;if(v>=alvo){clearInterval(f);a.volume=alvo;}else a.volume=v;},60);
}
const SOM_CINE={gelo:arq('assets/sfx/novos/magia_gelo'),quebra:arq('assets/sfx/novos/gelo_quebra'),brilho:arq('assets/sfx/novos/magia_brilho'),
  carga:arq('assets/sfx/novos/carga_gelo'),whoosh:arq('assets/sfx/novos/whoosh'),whoosh2:arq('assets/sfx/novos/whoosh2'),impacto:arq('assets/sfx/novos/pedras'),rosna:arq('assets/sfx/novos/lobo_rosna'),uivo:arq('assets/sfx/novos/lobo_uivo'),correntes:arq('assets/sfx/novos/skoll_correntes')};
const ab={on:false,esperando:false,i:0,t:0,fim:0,neve:[]};
let abVista=false;try{abVista=localStorage.getItem('jux_abertura_vista')==='1';}catch(e){}
function abSom(n){if(n==='oinc'){som(OINC[(Math.random()*OINC.length)|0],.8);return;}const a=SOM_CINE[n];if(a)som(a,.7);}
function abComeca(){CENAS=CENAS_INTRO;CENA_IMG=IMG_INTRO;ab.onFim=null;ab.on=true;ab.esperando=true;ab.i=0;ab.t=0;ab.fim=0;fala=null;}
function abToca(){ab.esperando=false;ligaAudio();if(MUS)MUS.pause();musNome=null;abMusica(CENAS[0].mus);ab.feitos=new Set();}
function abProxima(){for(const v of Object.values(VOZES))v.pause();ab.i++;ab.t=0;ab.feitos=new Set();if(ab.i>=CENAS.length)abTermina();}
function abTermina(){if(!ab.on)return;for(const v of Object.values(VOZES))v.pause();ab.on=false;ab.fim=1;
  if(ab.onFim){const f=ab.onFim;ab.onFim=null;if(musNome!=='vila')abMusica('vila');musNome=null;musAtual=null;f();return;}
  try{localStorage.setItem('jux_abertura_vista','1');}catch(e){}abVista=true;
  if(musNome!=='vila'){abMusica('vila');}musNome=null;musAtual=null;
  hero.olha='baixo';comecou=false;}
function abPasso(dt){
  if(ab.fim>0)ab.fim=Math.max(0,ab.fim-dt*1.4);
  if(!ab.on||ab.esperando)return;
  const c=CENAS[ab.i];ab.t+=dt;
  for(const [tt,n] of c.sons){const k=ab.i+':'+tt;if(ab.t>=tt&&!ab.feitos.has(k)){ab.feitos.add(k);abSom(n);}}
  if(c.vozes)for(const [tt,nm] of c.vozes){const k='z'+ab.i+nm;if(ab.t>=tt&&!ab.feitos.has(k)){ab.feitos.add(k);for(const v of Object.values(VOZES))v.pause();const v=VOZES[nm];if(v)try{v.currentTime=0;v.play().catch(()=>{});}catch(e){}}}
  if(c.voz2){const k='w'+ab.i;if(ab.t>=c.voz2[0]&&!ab.feitos.has(k)){ab.feitos.add(k);const v=VOZES[c.voz2[1]];try{v.currentTime=0;v.play().catch(()=>{});}catch(e){}}}
  if(c.voz){const k='v'+ab.i;if(ab.t>=c.voz[0]&&!ab.feitos.has(k)){ab.feitos.add(k);for(const v of Object.values(VOZES))v.pause();
    const v=VOZES[c.voz[1]];try{v.currentTime=0;v.volume=1;v.play().catch(()=>{});}catch(e){}}}
  abMusica(c.mus);
  {const fala_=(c.voz&&!VOZES[c.voz[1]].paused)||(c.voz2&&!VOZES[c.voz2[1]].paused)||(c.vozes&&c.vozes.some(z=>VOZES[z[1]]&&!VOZES[z[1]].paused));if(musAtual&&musAtual.volume>.05){const alvo=(musNome==='vila'?.42:.55)*(fala_?.5:1);musAtual.volume+=(alvo-musAtual.volume)*Math.min(1,dt*4);}}   // musica abaixa quando tem voz
  if(ab.t>=c.dur)abProxima();
  if(Math.random()<dt*40)ab.neve.push({x:rnd(-20,W),y:-6,v:rnd(25,70),s:rnd(1,3),o:rnd(0,6)});
  for(const f of ab.neve){f.y+=f.v*dt;f.x+=Math.sin(t+f.o)*12*dt+18*dt;}ab.neve=ab.neve.filter(f=>f.y<H+8);
}
function abCena(i,alpha,tt){
  const c=CENAS[i],im=CENA_IMG[i];if(!im.complete||!im.naturalWidth)return;
  const p=Math.min(1,tt/c.dur),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;
  const [x0,y0,z0,x1,y1,z1]=c.cam,cx=x0+(x1-x0)*e,cy=y0+(y1-y0)*e,z=z0+(z1-z0)*e;
  const base=Math.max(W/im.naturalWidth,H/im.naturalHeight)*z,dw=im.naturalWidth*base,dh=im.naturalHeight*base;
  let ox=W/2-cx*dw,oy=H/2-cy*dh;ox=Math.min(0,Math.max(W-dw,ox));oy=Math.min(0,Math.max(H-dh,oy));
  if(c.treme&&(typeof OPC!=='object'||OPC.tremor)&&tt>=c.treme[0]&&tt<=c.treme[1]){const k=1-(tt-c.treme[0])/(c.treme[1]-c.treme[0]);ox+=rnd(-1,1)*7*k;oy+=rnd(-1,1)*7*k;}
  ctx.globalAlpha=alpha;ctx.drawImage(im,ox,oy,dw,dh);ctx.globalAlpha=1;
}
function abDesenha(){
  if(!ab.esperando&&ab.i>=CENAS.length)return;   // acabou neste quadro
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  if(ab.esperando){
    ctx.fillStyle='#03050c';ctx.fillRect(0,0,W,H);
    for(const f of ab.neve){ctx.fillStyle='rgba(230,248,255,.7)';ctx.fillRect(f.x,f.y,f.s,f.s);}
    if(Math.random()<.6)ab.neve.push({x:rnd(-20,W),y:-6,v:rnd(25,70),s:rnd(1,3),o:rnd(0,6)});for(const f of ab.neve){f.y+=f.v/60;f.x+=.3;}ab.neve=ab.neve.filter(f=>f.y<H+8);
    ctx.textAlign='center';ctx.fillStyle='#bff0ff';ctx.font='bold 34px "Trebuchet MS"';ctx.shadowColor='#2a8fd0';ctx.shadowBlur=18;
    ctx.fillText('JUX E A LÂMINA DE GELO',W/2,H/2-20);ctx.shadowBlur=0;
    ctx.globalAlpha=.6+.4*Math.sin(t*3);ctx.font='bold 17px "Trebuchet MS"';ctx.fillStyle='#e8f6ff';ctx.fillText('Aperte ENTER ou toque para começar',W/2,H/2+30);ctx.globalAlpha=1;
    return;
  }
  const c=CENAS[ab.i],FUS=.7;
  if(ab.i>0&&ab.t<FUS){abCena(ab.i-1,1,CENAS[ab.i-1].dur);abCena(ab.i,ab.t/FUS,ab.t);}
  else abCena(ab.i,ab.i===0?Math.min(1,ab.t/1.2):1,ab.t);
  // efeitos por cena
  if(c.fx==='geada'||c.fx==='vortice'){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(W/2,H/2,20,W/2,H/2,W*.7);
    g.addColorStop(0,`rgba(80,180,255,${.12+.08*Math.sin(t*6)})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore();}
  if(c.fx==='escuro'){ctx.fillStyle=`rgba(120,0,0,${.06+.05*Math.sin(t*2.3)})`;ctx.fillRect(0,0,W,H);}
  if(c.flash&&ab.t<c.flash+.5){ctx.fillStyle=`rgba(255,255,255,${Math.max(0,1-(ab.t-c.flash)/.5)})`;ctx.fillRect(0,0,W,H);}
  if(c.fx!=='escuro')for(const f of ab.neve){ctx.fillStyle='rgba(235,250,255,.75)';ctx.fillRect(f.x,f.y,f.s,f.s);}
  // faixas de cinema
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,34);ctx.fillRect(0,H-34,W,34);
  // legenda: a fala atual digitando
  let at=null;for(const fl of c.falas)if(ab.t>=fl[0])at=fl;
  if(at){const [tt,quem,txt,tipo]=at,n=Math.floor((ab.t-tt)*38);
    ctx.textAlign='center';
    ctx.font=(quem==='Narrador'?'italic ':'')+'bold 21px "Trebuchet MS"';
    const lin=[];{let cur='';for(const w of txt.split(' ')){const t2=cur?cur+' '+w:w;if(ctx.measureText(t2).width>W-90&&cur){lin.push(cur);cur=w;}else cur=t2;}if(cur)lin.push(cur);}   // fala longa quebra em linhas (antes saia da tela)
    const y=H-62-(lin.length-1)*27;
    ctx.font='bold 15px "Trebuchet MS"';ctx.fillStyle=tipo===3?'#d6f6ff':tipo===2?'#ff8a8a':tipo===1?'#9fe8ff':quem==='Narrador'?'#d8d8e8':'#ffe27a';
    ctx.lineWidth=4;ctx.strokeStyle='rgba(0,0,0,.85)';
    if(quem!=='Narrador'){ctx.strokeText(quem,W/2,y-24);ctx.fillText(quem,W/2,y-24);}
    ctx.font=(quem==='Narrador'?'italic ':'')+'bold 21px "Trebuchet MS"';ctx.fillStyle='#ffffff';let resta=n;lin.forEach((l,k)=>{const sl=l.slice(0,Math.max(0,resta));resta-=l.length+1;ctx.strokeText(sl,W/2,y+k*27);ctx.fillText(sl,W/2,y+k*27);});}
  ctx.textAlign='right';ctx.font='12px "Trebuchet MS"';ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillText('toque: próxima cena · ENTER: pular',W-12,H-12);
  ctx.textAlign='left';
}

addEventListener('keydown',e=>{ligaAudio();const k=e.key.toLowerCase();
  if(!ab.on&&!fala&&uiTecla(k)){e.preventDefault();return;}
  if(ab.on){e.preventDefault();if(ab.esperando){if(k==='enter'||k===' ')abToca();}else if(k==='enter'||k==='escape')abTermina();else if(k===' ')abProxima();return;}
  teclas[k]=true;
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(k==='enter'||k===' '||k==='e'){if(fala)avanca();else if(perto)abreFala(perto.id);}});
addEventListener('keyup',e=>{teclas[e.key.toLowerCase()]=false;});
// tecla 'presa' (bug 2026-11-19: 'o boneco sai caminhando sozinho'): se a janela perde o foco com uma tecla apertada, o keyup nunca chega
function soltaTudo(){for(const k in teclas)teclas[k]=false;hero.alvo=null;hero.pontoAlvo=null;}
addEventListener('blur',soltaTudo);document.addEventListener('visibilitychange',()=>{if(document.hidden)soltaTudo();});
// roda do mouse: rola as listas do menu e das lojas
cv.addEventListener('wheel',e=>{if(!uiAberto())return;e.preventDefault();uiTecla(e.deltaY>0?'arrowdown':'arrowup');},{passive:false});
cv.addEventListener('pointerdown',e=>{ligaAudio();if(ab.on){if(ab.esperando)abToca();else abProxima();return;}const r=cv.getBoundingClientRect(),sx=(e.clientX-r.left)*W/r.width,sy=(e.clientY-r.top)*H/r.height;
  if(uiClique(sx,sy))return;
  if(fala){avanca();return;}
  const mx=cam.x+(sx-W/2)/Z,my=cam.y+(sy-H/2)/Z;
  const p=V.pontos.map(q=>[q,Math.hypot(mx-q.x,my-q.y)]).filter(([q,d])=>d<Math.max(q.r,30)+22).sort((a,b)=>a[1]-b[1]).map(a=>a[0])[0];
  if(p&&perto===p){abreFala(p.id);return;}
  hero.alvo={x:mx,y:my};hero._ad=1e9;hero._at=0;hero.alvoLonge=Math.hypot(mx-hero.x,my-hero.y)>110;hero.pontoAlvo=p||null;});
document.getElementById('voltar').onclick=()=>{location.href=jp('index.html');};
if(!NA_VILA)document.getElementById('abertura').style.display='none';
if(NA_VILA)V.pontos.push({id:'portao',x:722,y:738,r:40});
document.getElementById('abertura').onclick=e=>{e.stopPropagation();ab.neve=[];abComeca();};

/* ---------- atualizacao */
function passo(dt){
  t+=dt;
  let dx=0,dy=0;
  if(!fala&&hero.pulo<=0&&!uiAberto()&&!transicao){
    if(teclas['arrowleft']||teclas['a'])dx--;if(teclas['arrowright']||teclas['d'])dx++;
    if(teclas['arrowup']||teclas['w'])dy--;if(teclas['arrowdown']||teclas['s'])dy++;
    if(dx||dy){hero.alvo=null;hero.pontoAlvo=null;}
    else if(hero.alvo){const ax=hero.alvo.x-hero.x,ay=hero.alvo.y-hero.y,d=Math.hypot(ax,ay);if(d<3)hero.alvo=null;else{dx=ax/d;dy=ay/d;}}
  }
  if(hero.alvo){const d=Math.hypot(hero.alvo.x-hero.x,hero.alvo.y-hero.y);   // clicou num lugar que nao se alcanca: desiste em ~1 s (antes andava 'sozinho')
    if(!(d<(hero._ad||1e9)-2)){hero._at=(hero._at||0)+dt;if(hero._at>1.1){hero.alvo=null;hero.pontoAlvo=null;hero._at=0;hero._ad=1e9;}}else{hero._ad=d;hero._at=0;}}
  const n=Math.hypot(dx,dy);let moveu=false;
  let emGelo=false;
  if(hero.pulo<=0&&naGelo(hero.x,hero.y)&&!transicao){emGelo=true;   // ---- DESLIZANDO no gelo
    const g=hero.gv||(hero.gv={x:0,y:0});
    if(n&&!fala&&!uiAberto()){const ac=(teclas['shift']?330:230)*dt;g.x+=dx/n*ac;g.y+=dy/n*ac;}
    g.x*=Math.pow(.42,dt);g.y*=Math.pow(.42,dt);   // atrito baixo: escorrega bastante depois de soltar
    const vm=Math.hypot(g.x,g.y),LIM=190;if(vm>LIM){g.x*=LIM/vm;g.y*=LIM/vm;}
    let nx=hero.x+g.x*dt,ny=hero.y+g.y*dt;
    if(!(naGelo(nx,ny)||livre(nx,ny))){   // bateu na borda: tira o componente que empurra para fora e perde velocidade
      let ex,ey;if(REGIAO==='trilha'){ex=(nx-GELO.x)/(GELO.rx*GELO.rx);ey=(ny-GELO.y)/(GELO.ry*GELO.ry);}else{ex=0;ey=0;for(let k=0;k<12;k++){const a=k*Math.PI/6,px=nx+Math.cos(a)*10,py=ny+Math.sin(a)*10;if(!(naGelo(px,py)||livre(px,py))){ex+=Math.cos(a);ey+=Math.sin(a);}}}   // borda de forma livre: a normal aponta para onde nao da para ir
      const en=Math.hypot(ex,ey)||1,nxn=ex/en,nyn=ey/en,pr=g.x*nxn+g.y*nyn;
      if(pr>0){g.x-=pr*nxn*1.35;g.y-=pr*nyn*1.35;if(pr>60){poeiraNeve(hero.x,hero.y,6);som(PASSOS[1],.5);}}
      nx=hero.x+g.x*dt;ny=hero.y+g.y*dt;if(!(naGelo(nx,ny)||livre(nx,ny))){nx=hero.x;ny=hero.y;}}
    hero.x=nx;hero.y=ny;
    if(vm>14){if(Math.abs(g.x)>Math.abs(g.y)*.8){hero.olha=g.x<0?'esquerda':'direita';hero.dir=g.x<0?-1:1;}else hero.olha=g.y<0?'cima':'baixo';}
    if(vm>20){tDesl-=dt;if(tDesl<=0){tDesl=.42-Math.min(.17,vm/900)+Math.random()*.08;const k=(Math.random()*4)|0;som(SOM_DESL[k],Math.min(.55,.12+vm/330));if(!hero.desliza)som(SOM.whoosh,.28);}}else tDesl=0;
    hero.desliza=vm>14?vm:0;hero.anda=false;if(hero.alvo&&Math.hypot(hero.alvo.x-hero.x,hero.alvo.y-hero.y)<16){hero.alvo=null;hero.pontoAlvo=null;}   // toque/clique tambem empurra no gelo (antes so o teclado)
    if(vm>45&&!JOGO.geloVisto&&!fala){JOGO.geloVisto=true;g.x=g.y=0;setTimeout(()=>abreFala('gelo'),350);}   // 1a vez no gelo: o Jux se acha o patinador
    if(hero.desliza&&Math.random()<dt*26){const ang=Math.atan2(-g.y,-g.x)+rnd(-.5,.5);poeira.push({x:hero.x+rnd(-4,4),y:hero.y-1,vx:Math.cos(ang)*rnd(10,40),vy:Math.sin(ang)*rnd(5,20)-rnd(8,24),v:0});}
    if(hero.desliza){hero.gt=(hero.gt||0)+dt;if(hero.gt>.05){hero.gt=0;(hero.rastroG=hero.rastroG||[]).push({x:hero.x,y:hero.y,v:0});}}
    moveu=false;
  }else if(hero.gv){hero.gv=null;hero.desliza=0;}
  if(emGelo){}else if(hero.pulo>0){   // pulo na cerca: arco rapido, passa por cima
    hero.pulo-=dt;const q=1-clamp(hero.pulo/(hero.puloD||PULO),0,1);let qm=q;
    // escalada: o corpo so sobe do meio da animacao (quadros pendurado/puxando); descendo, fica em cima ate o salto e aterrissa na metade
    if(hero.esc==='subir'){const p=clamp((q-.22)/.56,0,1);qm=p*p*(3-2*p);if(q>.3&&!hero.escN){hero.escN=1;poeiraNeve(hero.px0,hero.py1+6,5);}}
    else if(hero.esc==='descer'){qm=clamp((q-.2)/.32,0,1);}
    hero.x=hero.px0+(hero.px1-hero.px0)*qm;hero.y=hero.py0+(hero.py1-hero.py0)*qm;
    if(hero.esc==='descer'&&q>=.52&&!hero.escN){hero.escN=1;poeiraNeve(hero.x,hero.y,14);som(PASSOS[0],.8);}
    if(hero.pulo<=0){hero.pulo=0;hero.x=hero.px1;hero.y=hero.py1;if(hero.esc==='subir'){hero.olha='cima';som(PASSOS[0],.6);}else if(hero.esc==='descer')hero.olha='baixo';else{poeiraNeve(hero.x,hero.y,10);som(PASSOS[0],.7);}hero.esc=null;hero.puloD=0;}   // pedido do usuario (2026-11-18): o Sir Bacon fica no chiqueiro, nao segue mais o Jux depois do pulo
    moveu=true;
  }else if(n){dx/=n;dy/=n;hero.corre=!!(teclas['shift']||(hero.alvo&&hero.alvoLonge));const v=(hero.corre?VELC:VEL)*dt,nx=hero.x+dx*v,ny=hero.y+dy*v;
    const pp=Math.abs(dx)>.5&&!livre(nx,hero.y)?pouso(hero.x,hero.y,dx>0?1:-1):Math.abs(dy)>.5&&!livre(hero.x,ny)?pousoV(hero.x,hero.y,dy>0?1:-1):null;
    if(pp!==null){   // chegou na cerca andando de lado: pula por cima
      hero.pulo=PULO;hero.puloD=PULO;hero.esc=null;hero.escN=0;hero.px0=hero.x;hero.px1=pp.x;hero.py0=hero.y;hero.py1=pp.y;hero.alvo=null;
      if(pp.x===hero.x&&ESCALAR&&hero.espada){hero.esc=pp.y<hero.y?'subir':'descer';hero.puloD=hero.pulo=hero.esc==='subir'?1.05:.8;hero.olha=hero.esc==='subir'?'cima':'baixo';som(SOM.whoosh,.4);}
      else{if(Math.abs(dx)>.5){hero.dir=dx<0?-1:1;}hero.olha=hero.dir<0?'esquerda':'direita';som(SOM.whoosh,.55);
      if(!puloFalado&&NA_VILA){puloFalado=true;setTimeout(()=>abreFala('pulo'),450);}}
    }else if(livre(nx,ny)){hero.x=nx;hero.y=ny;moveu=true;}
    else if(dx&&livre(nx,hero.y)){hero.x=nx;moveu=true;}
    else if(dy&&livre(hero.x,ny)){hero.y=ny;moveu=true;}
    else{   // quina ou borda torta: procura o lado livre mais perto (ate 14 px) e desliza para la, em vez de travar
      const px=-dy,py=dx;let melhor=null;
      for(let k=1;k<=24&&!melhor;k++)for(const sg of [1,-1]){if(livre(hero.x+px*sg*k+dx*v,hero.y+py*sg*k+dy*v)){melhor=sg;break;}}
      if(melhor!==null){const nx2=hero.x+px*melhor*v,ny2=hero.y+py*melhor*v;
        if(livre(nx2,ny2)){hero.x=nx2;hero.y=ny2;moveu=true;}
        else if(px&&livre(nx2,hero.y)){hero.x=nx2;moveu=true;}else if(py&&livre(hero.x,ny2)){hero.y=ny2;moveu=true;}}
    }
    if(!moveu)hero.alvo=null;
    if(dx)hero.dir=dx<0?-1:1;
    const ax=Math.abs(dx),ay=Math.abs(dy),hz=dx<0?'esquerda':'direita',vt=dy<0?'cima':'baixo';
    if(ax>ay+.3)hero.olha=hz;else if(ay>ax+.3)hero.olha=vt;else if(hero.olha!==hz&&hero.olha!==vt)hero.olha=ax>=ay?hz:vt;   // diagonal: mantem
  }
  hero.anda=moveu&&hero.pulo<=0;
  if(hero.pulo>0){hero.t+=dt;hero.dist+=VEL*dt;}
  const vv=hero.corre?VELC:VEL;
  if(hero.anda){hero.t+=dt;hero.passo+=vv*dt;hero.dist+=vv*dt;hero.pose=null;hero.parado=0;}else if(hero.pulo<=0&&!fala){hero.parado=(hero.parado||0)+dt;if(hero.parado>7&&!hero.pose&&hero.espada&&!VH)hero.pose='confiante';}   // folha nova de poses (acoes3, cores certas)
  if(hero.anda){
    if(hero.passo>passoDist()){hero.passo=0;hero.lado*=-1;
      const neve=ter(hero.x,hero.y)&2;
      const ponte=naPonte(hero.x,hero.y),k=(Math.random()*4)|0;
      if(ponte)som(PASSOS_MAD[k],.75);else if(neve)som(PASSOS_NEVE[k],hero.corre?.6:.5);else som(PASSOS[k],.4);
      if(neve&&!ponte){pegadas.push({x:hero.x+hero.lado*2.6,y:hero.y-.5,d:hero.dir,v:0,o:hero.olha});
        {let tn=null;for(const q of trilhasNeve)if(Math.abs(q.x-hero.x)<9&&Math.abs(q.y-hero.y)<7){tn=q;break;}
         if(tn){tn.n++;tn.v=0;tn.hz=hero.olha==='direita'||hero.olha==='esquerda';}else trilhasNeve.push({x:hero.x,y:hero.y,n:1,v:0,hz:hero.olha==='direita'||hero.olha==='esquerda'});if(trilhasNeve.length>500)trilhasNeve.shift();}poeiraNeve(hero.x,hero.y,hero.corre?7:3);}}}
  if(hero.anda&&hero.corre){hero.rt=(hero.rt||0)+dt;if(hero.rt>.05){hero.rt=0;hero.rastro.push({x:hero.x,y:hero.y,q:quadroHeroi().q});if(hero.rastro.length>4)hero.rastro.shift();}}else hero.rastro.length=0;
  perto=pontoPerto();
  if(hero.pontoAlvo&&hero.alvo){hero.alvo.x=hero.pontoAlvo.x;hero.alvo.y=hero.pontoAlvo.y+4;}   // clicou num morador que anda: o heroi segue ele ate chegar perto
  if(hero.pontoAlvo&&perto===hero.pontoAlvo){abreFala(perto.id);}
  cam.x+=(hero.x-cam.x)*Math.min(1,dt*6);cam.y+=(hero.y-12-cam.y)*Math.min(1,dt*6);
  const hw=W/2/Z,hh=H/2/Z;cam.x=clamp(cam.x,hw,V.w-hw);cam.y=clamp(cam.y,hh,V.h-hh);
  if(fala){const L=fala.linhas[fala.i][1];fala.letras=Math.min(L.length,fala.letras+dt*48*(typeof OPC==='object'?OPC.texto:1));}
  // particulas
  if(NA_VILA&&!FUM)for(const[cx,cy,taxa]of CHAMINES)if(Math.random()<dt*taxa)fumaca.push({x:cx+rnd(-2,2),y:cy,v:0,s:rnd(2.5,4)});
  for(const f of fumaca){f.v+=dt;f.y-=dt*13;f.x+=dt*7+Math.sin(f.v*2)*.2;f.s+=dt*2.6;}
  while(fumaca.length&&fumaca[0].v>3.4)fumaca.shift();
  if(NA_VILA)for(let i=0;i<3;i++)if(Math.random()<dt*14)chamas.push({x:740+rnd(-12,12),y:648,v:0,vx:rnd(-6,6),s:rnd(2,4),q:Math.random()<.25});
  if(NA_VILA&&Math.random()<dt*9)chamas.push({x:1300+rnd(-8,8),y:520,v:0,vx:rnd(-5,5),s:rnd(1.5,3),q:true});
  for(const c of chamas){c.v+=dt;c.y-=dt*(c.q?30:20);c.x+=c.vx*dt;c.s*=1-dt*1.2;}
  for(let i=chamas.length-1;i>=0;i--)if(chamas[i].v>(chamas[i].q?1.3:.75))chamas.splice(i,1);
  for(const p of pegadas)p.v+=dt;while(pegadas.length&&(pegadas[0].v>70||pegadas.length>420))pegadas.shift();
  for(const q of trilhasNeve)q.v+=dt;for(let i=trilhasNeve.length-1;i>=0;i--)if(trilhasNeve[i].v>200)trilhasNeve.splice(i,1);
  for(const p of poeira){p.v+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=40*dt;}while(poeira.length&&poeira[0].v>.6)poeira.shift();
  if(rioPx.length&&!(agTex&&agTex.complete))for(let i=0;i<3;i++)if(Math.random()<dt*20){const k=rioPx[(Math.random()*rioPx.length)|0];brilhoRio.push({x:k%V.w,y:(k/V.w)|0,v:0,l:rnd(3,9)});}
  if(NA_VILA){vivoPasso(dt);peixePasso(dt);baconPasso(dt);ticoPasso(dt);vovoPasso(dt);borinPasso(dt);for(const n of ANDARILHOS)andarilhoPasso(n,dt);}
  seguidorPasso(dt);
  if(!NA_VILA&&typeof passoDescobertas==='function')passoDescobertas();
  if(typeof vidaPasso==='function')vidaPasso(dt);
  if(ENC&&hero.anda&&!transicao){encDist+=vv*dt;while(encDist>=16&&!transicao){encDist-=16;passoEncontro();}}
  for(const b of brilhoRio){b.v+=dt;b.x+=dt*10;b.y-=dt*3;}while(brilhoRio.length&&brilhoRio[0].v>1.4)brilhoRio.shift();
  // sons de ambiente pela distancia
  if(fogoG&&NA_VILA){const d=Math.hypot(hero.x-515,hero.y-484),df=Math.hypot(hero.x-905,hero.y-440);fogoG.gain.value=clamp(1-d/150,0,1)*.35+clamp(1-df/120,0,1)*.25;}
  if(rioG&&NA_VILA){let dm=1e9;for(let i=0;i<rioPx.length;i+=40){const k=rioPx[i],d=Math.hypot(hero.x-k%V.w,hero.y-((k/V.w)|0));if(d<dm)dm=d;}rioG.gain.value=clamp(1-dm/170,0,1)*.22;}
}
function poeiraNeve(x,y,n){for(let i=0;i<n;i++)poeira.push({x:x+rnd(-4,4),y:y-1,vx:rnd(-14,14),vy:rnd(-22,-8),v:0});}

/* ---------- desenho */
// corrida feita por codigo sobre os quadros de caminhada (a folha de corrida tem so 2 poses por lado e "desliza"):
// passada 1,7x mais rapida, corpo inclinado para frente, quique forte a cada passo, casaco esticado (escala), rastro
// azulado atras e neve levantando a cada pisada
// som e pegada a cada pisada: o ciclo tem 2 pisadas
function passoDist(){if(hero.corre&&folhaCorrida())return folhaCorrida().ciclos[hero.olha].length/2*PASSO_R;const S=ANDAR[hero.espada?'espada':'sem'],n=S.ciclos[hero.olha].length;return n/2*(hero.corre?PASSO_C:PASSO_A);}
// corrida desenhada (folha de 8 quadros com a passada inteira, ja inclinada e saltando): usada quando existe para a
// direcao; senao a corrida e feita por codigo em cima da caminhada
function folhaCorrida(){const S=ANDAR[hero.espada?'correr_espada':'correr'];return S&&S.ciclos[hero.olha]?S:null;}
function quadroHeroi(){
  let S,q,corre=false;
  if(hero.pulo>0&&hero.esc&&ESCALAR){S=ESCALAR;const qs=S.anims[hero.esc];q=qs[clamp(Math.floor((1-hero.pulo/hero.puloD)*qs.length),0,qs.length-1)];}
  else if(hero.pulo>0){S=hero.espada&&ANDAR.pulo_espada?ANDAR.pulo_espada:ANDAR.pulo;const qs=S.anims[hero.olha==='esquerda'?'esquerda':'direita'];q=qs[Math.min(qs.length-1,Math.floor((1-hero.pulo/PULO)*qs.length))];}
  else if(VH&&hero.espada&&hero.anda){S=VH;const cs=VH.ciclos[hero.olha];q=cs[Math.floor(hero.dist/(hero.corre?PASSO_C:PASSO_A)*.5)%cs.length];corre=hero.corre?'folha':false;}
  else if(VH&&hero.espada&&!hero.pose){S=VH;const ps=VH.parado[hero.olha];q=ps[Math.floor(t*6)%ps.length];}
  else if(hero.anda&&hero.corre&&folhaCorrida()){S=folhaCorrida();const cs=S.ciclos[hero.olha];q=cs[Math.floor(hero.dist/PASSO_R)%cs.length];corre='folha';}
  else if(hero.anda){S=ANDAR[hero.espada?'espada':'sem'];const cs=S.ciclos[hero.olha];corre=hero.corre;q=cs[Math.floor(hero.dist/(corre?PASSO_C:PASSO_A))%cs.length];}
  else if(hero.pose&&ANDAR.acoes&&hero.espada&&ANDAR.acoes.anims[hero.pose]){S=ANDAR.acoes;q=S.anims[hero.pose][0];}   // poses (acoes3) tem a espada nas costas: sem espada fica em pe
  else{S=ANDAR[hero.espada?'espada':'sem'];q=S.anims[hero.olha][0];}
  return{S,q,corre};
}
function quadroDeslize(){const S=folhaCorrida()||ANDAR[hero.espada?'espada':'sem'];const cs=S.ciclos[hero.olha]||S.ciclos.baixo;return {S,q:cs[Math.min(1,cs.length-1)],corre:'folha'};}
const DESL=window.JUX_DESLIZE||null,DESLI=new Image();if(DESL)DESLI.src=DESL.atlas;
function desenhaHeroi(c,alpha,semRastro){
  const desl=hero.desliza>0;
  if(desl&&DESL&&DESLI.complete&&(hero.olha==='direita'||hero.olha==='esquerda')){   // folha desenhada do deslize (so de lado; de frente/costas usa a pose por codigo)
    const v=hero.desliza,g=DESL[hero.olha],fr=v>95?g[1+(Math.floor(t*3)%2)]:v>45?g[2]:g[3],sc=ESC_H;
    c.save();c.globalAlpha=alpha;c.translate(hero.x,hero.y);c.scale(sc,sc);c.drawImage(DESLI,fr*DESL.w,0,DESL.w,DESL.h,-DESL.ancora[0],-DESL.ancora[1],DESL.w,DESL.h);c.restore();return fr;}
  const {S,q,corre}=desl?quadroDeslize():quadroHeroi(),s=ESC_H,codigo=corre===true;
  const fase=hero.dist/(corre?PASSO_C:PASSO_A)*Math.PI;
  const quique=hero.anda&&corre!=='folha'?-Math.abs(Math.sin(fase))*(codigo?2.6:.7):hero.pose?0:Math.sin(t*2.2)*.25;
  // a folha de pulo sem espada ja tem a altura desenhada (chao = grama da folha); a com espada ainda usa o arco
  const arco=0;   // as duas folhas de pulo ja tem a altura desenhada
  const lado=hero.olha==='direita'?1:hero.olha==='esquerda'?-1:0;
  const incl=codigo?lado*.13:desl?lado*Math.min(.3,hero.desliza/520)+Math.sin(t*3)*.015:0,estica=codigo&&!lado?1+Math.abs(Math.sin(fase))*.05:1;
  // rastro: copias apagadas nas posicoes anteriores
  if(corre&&!semRastro)for(let r=0;r<hero.rastro.length;r++){const p=hero.rastro[r];
    c.save();c.globalAlpha=alpha*.16*(r+1)/hero.rastro.length;c.filter='brightness(1.6) hue-rotate(160deg) saturate(2)';
    c.translate(p.x,p.y);c.rotate(incl);c.scale(s,s);c.drawImage(S.i,p.q*S.w,0,S.w,S.h,-S.ancora[0],-S.ancora[1],S.w,S.h);c.restore();}
  c.save();c.globalAlpha=alpha;c.translate(hero.x,hero.y+quique+arco);c.rotate(incl);c.scale(s,s*estica);
  c.drawImage(S.i,q*S.w,0,S.w,S.h,-S.ancora[0],-S.ancora[1],S.w,S.h);c.restore();
  if(c===ctx)hero._esp={S,q,x:hero.x,y:hero.y+quique+arco,incl,s,estica};   // para a espada incandescente (desenhaEspadaAcesa)
  return q;
}
// ESPADA INCANDESCENTE (pedido do usuario 2026-11-19): no escuro, a lamina da Aurora acende e ilumina o caminho.
// Separa so os pixels da lamina azul de cada quadro da folha (o maior pedaco azul-gelo: os oculos ficam de fora) e
// desenha esse recorte somado e borrado por cima, na mesma posicao do Jux. Devolve o centro da lamina no mapa (para a luz).
function laminaDe(S,q){S._lam=S._lam||{};if(S._lam[q]!==undefined)return S._lam[q];
  if(!S.i.complete){return null;}
  const cv=document.createElement('canvas');cv.width=S.w;cv.height=S.h;const g=cv.getContext('2d');g.drawImage(S.i,q*S.w,0,S.w,S.h,0,0,S.w,S.h);
  const im=g.getImageData(0,0,S.w,S.h),d=im.data,W_=S.w,H_=S.h,m=new Uint8Array(W_*H_);
  for(let i=0;i<W_*H_;i++){const r=d[i*4],gg=d[i*4+1],b=d[i*4+2],a=d[i*4+3];m[i]=(a>100&&b>150&&b-r>45&&gg>100)?1:0;}
  // maior componente (4-vizinhos)
  const lab=new Int32Array(W_*H_);let melhor=0,melhorN=0,id=0;
  for(let i=0;i<W_*H_;i++){if(!m[i]||lab[i])continue;id++;let n=0;const pilha=[i];lab[i]=id;
    while(pilha.length){const k=pilha.pop();n++;const x=k%W_,y=(k/W_)|0;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W_||ny>=H_)continue;const j=ny*W_+nx;if(m[j]&&!lab[j]){lab[j]=id;pilha.push(j);}}}
    if(n>melhorN){melhorN=n;melhor=id;}}
  if(melhorN<12){S._lam[q]=null;return null;}
  let sx=0,sy=0;for(let i=0;i<W_*H_;i++){if(lab[i]===melhor){sx+=i%W_;sy+=(i/W_)|0;d[i*4]=170;d[i*4+1]=235;d[i*4+2]=255;d[i*4+3]=255;}else d[i*4+3]=0;}
  g.putImageData(im,0,0);
  // eixo da lamina (componente principal): angulo do cabo para a ponta (a ponta fica para baixo) e comprimento
  const mx=sx/melhorN,my=sy/melhorN;let cxx=0,cyy=0,cxy=0;for(let i=0;i<W_*H_;i++)if(lab[i]===melhor){const x=i%W_-mx,y=((i/W_)|0)-my;cxx+=x*x;cyy+=y*y;cxy+=x*y;}
  let ang=.5*Math.atan2(2*cxy,cxx-cyy);let ux=Math.cos(ang),uy=Math.sin(ang);if(uy<0){ux=-ux;uy=-uy;}
  let lo=1e9,hi=-1e9;for(let i=0;i<W_*H_;i++)if(lab[i]===melhor){const pr=(i%W_-mx)*ux+(((i/W_)|0)-my)*uy;if(pr<lo)lo=pr;if(pr>hi)hi=pr;}
  return S._lam[q]={cv,cx:mx,cy:my,ang:Math.atan2(uy,ux),len:hi-lo};}
const LAM=window.JUX_LAMINA||null,LAMI=new Image();if(LAM)LAMI.src=LAM.atlas;
function desenhaEspadaAcesa(k){const E=hero._esp;if(!E||!hero.espada||k<=.01)return null;const L=laminaDe(E.S,E.q);if(!L)return null;
  // espada acesa DESENHADA (lamina_acesa.js, PROMPTS_TRILHA.md 11): gira e escala o quadro para cobrir a lamina das costas
  if(LAM&&LAMI.complete){const f=Math.floor(t*8)%LAM.n,F=LAM.q[f],ox=-E.S.ancora[0],oy=-E.S.ancora[1];
    // monta (e guarda) a lamina acesa daquele quadro: o desenho girado no angulo da espada e recortado so na parte da espada
    // que aparece (mais uma borda de luz), para nao cobrir o corpo do Jux quando a espada esta atras dele
    E.S._glow=E.S._glow||{};const kq=E.q+'_'+f;let G=E.S._glow[kq];
    if(!G){G=document.createElement('canvas');G.width=E.S.w;G.height=E.S.h;const g=G.getContext('2d');
      const LEN=L.len>=30?L.len:57,esc=LEN/F.len*1.1;
      g.save();g.translate(L.cx,L.cy);g.rotate(L.ang-Math.PI/2);g.scale(esc,esc);g.drawImage(LAMI,f*LAM.w,0,LAM.w,LAM.h,-F.cx,-F.cy,LAM.w,LAM.h);g.restore();
      const mk=document.createElement('canvas');mk.width=E.S.w;mk.height=E.S.h;const m=mk.getContext('2d');
      m.filter='blur(3px)';for(let r=0;r<4;r++)m.drawImage(L.cv,0,0);m.filter='none';m.drawImage(L.cv,0,0);
      g.globalCompositeOperation='destination-in';g.drawImage(mk,0,0);E.S._glow[kq]=G;}
    ctx.save();ctx.translate(E.x,E.y);ctx.rotate(E.incl);ctx.scale(E.s,E.s*E.estica);ctx.globalAlpha=Math.min(1,k*1.25);
    ctx.drawImage(G,ox,oy);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=k*.6;ctx.drawImage(G,ox,oy);ctx.restore();
    return [E.x+(L.cx+ox)*E.s,E.y+(L.cy+oy)*E.s*E.estica];}
  const p=.85+.15*Math.sin(t*7)+.05*Math.sin(t*23);
  ctx.save();ctx.translate(E.x,E.y);ctx.rotate(E.incl);ctx.scale(E.s,E.s*E.estica);ctx.globalCompositeOperation='lighter';
  const ox=-E.S.ancora[0],oy=-E.S.ancora[1];
  ctx.globalAlpha=k*.7*p;ctx.filter='blur(9px)';ctx.drawImage(L.cv,ox,oy);ctx.drawImage(L.cv,ox,oy);
  ctx.globalAlpha=k*.9*p;ctx.filter='blur(4px)';ctx.drawImage(L.cv,ox,oy);ctx.drawImage(L.cv,ox,oy);
  ctx.filter='blur(1.5px)';ctx.globalAlpha=k*p;ctx.drawImage(L.cv,ox,oy);ctx.filter='none';ctx.globalAlpha=k*.8;ctx.drawImage(L.cv,ox,oy);
  ctx.restore();
  return [E.x+(L.cx+ox)*E.s,E.y+(L.cy+oy)*E.s*E.estica];}
const VIS={x0:0,y0:0,x1:1e9,y1:1e9};   // parte do mapa visivel no quadro (desenha so o que aparece)
function desenha(){
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.fillStyle='#03050c';ctx.fillRect(0,0,W,H);
  ctx.save();ctx.translate(W/2,H/2);ctx.scale(Z,Z);ctx.translate(-Math.round(cam.x*Z)/Z,-Math.round(cam.y*Z)/Z);
  // OTIMIZACAO (2026-11-19): so o pedaco do mapa que aparece na tela (o mapa inteiro em alta qualidade a cada quadro pesava)
  const vx0=Math.max(0,Math.floor(cam.x-W/(2*Z))-4),vy0=Math.max(0,Math.floor(cam.y-H/(2*Z))-4),vx1=Math.min(V.w,Math.ceil(cam.x+W/(2*Z))+4),vy1=Math.min(V.h,Math.ceil(cam.y+H/(2*Z))+4);
  VIS.x0=vx0;VIS.y0=vy0;VIS.x1=vx1;VIS.y1=vy1;
  ctx.drawImage(MAPA,vx0*K,vy0*K,(vx1-vx0)*K,(vy1-vy0)*K,vx0,vy0,vx1-vx0,vy1-vy0);
  // aurora ondulando (so se o alto do mapa estiver na tela)
  if(vy0<112)for(let y=Math.max(0,Math.floor(vy0/1.5)*1.5);y<Math.min(110,vy1);y+=1.5){const off=Math.sin(y*.11+t*1.6)*1.6,ax=Math.max(0,vx0-4),aw=Math.min(V.w,vx1+4)-ax;ctx.drawImage(MAPA,ax*K,y*K,aw*K,1.5*K,ax+off,y,aw,1.5);}
  // depois de pegar a espada: o altar fica vazio; logo apos a cinematica a espada do desenho sobe num feixe de luz e some
  if(hero.espada&&V.altar_vazio&&ALTV.complete){const p=Math.max(0,Math.min(1,espadaSobe/1.6));
    ctx.save();ctx.globalAlpha=Math.min(1,p*1.6);const A=V.altar_vazio,sk=ALTV.naturalHeight/A.h;   // linha a linha, ondulando junto com a aurora
    for(let y=0;y<A.h;y+=1.5){const yy=A.y+y,off=yy<110?Math.sin(yy*.11+t*1.6)*1.6:0;ctx.drawImage(ALTV,0,y*sk,ALTV.naturalWidth,1.5*sk,A.x+off,yy,A.w,1.5);}ctx.restore();
    if(p<1){const dy=-p*p*70;ctx.save();ctx.globalAlpha=1-p;ctx.drawImage(MAPA,777*K,22*K,31*K,60*K,777,22+dy,31,60);
      ctx.globalCompositeOperation='lighter';const g=ctx.createLinearGradient(0,22+dy-60,0,90);g.addColorStop(0,'rgba(120,230,255,0)');g.addColorStop(1,`rgba(150,240,255,${.5*(1-p)})`);
      ctx.fillStyle=g;ctx.fillRect(784,-40,18,130);ctx.restore();}}
  if(NA_VILA){desenhaAgua();desenhaCascatas();desenhaPeixes();desenhaForja();}
  // agua do riacho: brilhos correndo
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const b of brilhoRio){ctx.globalAlpha=Math.sin(Math.PI*b.v/1.4)*.55;ctx.fillStyle='#d8f6ff';ctx.fillRect(b.x,b.y,b.l,.8);}
  ctx.globalAlpha=1;
  // luz da fogueira, da forja e das lanternas
  const luz=(x,y,r,cor)=>{if(x+r<VIS.x0||x-r>VIS.x1||y+r<VIS.y0||y-r>VIS.y1)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,cor);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);};
  if(REGIAO==='trilha'){for(const[lx,ly,r_,k]of[[660,92,30,0],[795,92,30,1]])luz(lx,ly,r_+Math.sin(t*2+k)*2,'rgba(120,220,255,.35)');
    luz(1282,300,70+Math.sin(t*1.5)*8,'rgba(110,210,255,.30)');for(const[lx,ly,k]of[[590,930,0],[830,930,1],[640,940,2]])luz(lx,ly,26+Math.sin(t*1.8+k)*3,'rgba(120,220,255,.28)');}
  if(NA_VILA){luz(740,645,62+Math.sin(t*9)*4+Math.sin(t*23)*2,'rgba(255,150,50,.42)');
  luz(1302,515,38+Math.sin(t*7)*3,'rgba(255,130,40,.36)');
  for(const[lx,ly,k]of[[602,490,0],[637,505,1],[670,462,2],[812,490,3],[851,480,4],[900,460,5],[930,476,6],[190,515,7],[330,500,8],[405,745,9],[320,822,10],[615,790,11],[855,790,12],[735,182,13],[870,225,14],[848,140,15]])luz(lx,ly,13,`rgba(120,220,255,${.2+.13*Math.sin(t*2+k*1.7)})`);
  // janelas acesas piscando de leve
  }
  if(NA_VILA)for(const[wx,wy,k]of[[95,210,0],[430,225,1],[240,385,2],[160,470,3],[240,475,4],[355,450,5],[1060,230,6],[1135,225,7],[1210,255,8],[1405,540,9],[70,350,10]])luz(wx,wy,10,`rgba(255,200,110,${.16+.08*Math.sin(t*1.3+k*2.1)})`);
  // chamas e fagulhas
  for(const c of chamas){const a=1-c.v/(c.q?1.3:.75);ctx.fillStyle=c.q?`rgba(255,200,90,${a})`:`rgba(255,${120+((1-a)*80)|0},40,${a*.85})`;ctx.beginPath();ctx.arc(c.x,c.y,Math.max(.4,c.s),0,6.283);ctx.fill();}
  ctx.restore();
  if(typeof vidaDesenha==='function')vidaDesenha('chao');   // vida da regiao (vida_garganta.js)
  // pegadas na neve (somem devagar)
  // neve pisada: decalques desenhados (ref/trilha/neve_pisada.png). 1 pisada = pegada; 3+ = trilha batida; 7+ = neve revirada
  if(NEVE&&NEVEI.complete){
    for(const q of trilhasNeve){if(q.n<3)continue;const a=clamp(1-q.v/200,0,1)*.9,fr=q.n>=7?7:(q.hz?4:5);
      ctx.globalAlpha=a;ctx.drawImage(NEVEI,fr*NEVE.w,0,NEVE.w,NEVE.h,q.x-NEVE.w/2,q.y-NEVE.h/2,NEVE.w,NEVE.h);}
    for(const p of pegadas){const a=clamp(1-p.v/70,0,1)*Math.min(1,p.v*4+.35),fr=p.o==='direita'?0:p.o==='esquerda'?1:p.o==='cima'?3:2;
      ctx.globalAlpha=a*.95;ctx.drawImage(NEVEI,fr*NEVE.w,0,NEVE.w,NEVE.h,p.x-NEVE.w/2,p.y-NEVE.h/2,NEVE.w,NEVE.h);}
    ctx.globalAlpha=1;
  }else for(const p of pegadas){const a=clamp(1-p.v/70,0,1);ctx.fillStyle=`rgba(45,80,140,${.4*a})`;ctx.beginPath();ctx.ellipse(p.x,p.y,2.7,1.7,0,0,6.283);ctx.fill();}
  // rastro do deslize no gelo: riscos claros que somem rapido
  if(hero.rastroG){for(const r of hero.rastroG)r.v+=1/60;while(hero.rastroG.length&&hero.rastroG[0].v>2.2)hero.rastroG.shift();
    for(let i=1;i<hero.rastroG.length;i++){const a=hero.rastroG[i-1],b=hero.rastroG[i],o=clamp(1-b.v/2.2,0,1)*.55;ctx.strokeStyle=`rgba(235,248,255,${o})`;ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.strokeStyle=`rgba(255,255,255,${o*.6})`;ctx.beginPath();ctx.moveTo(a.x+1.8,a.y-.8);ctx.lineTo(b.x+1.8,b.y-.8);ctx.stroke();}}
  // fumaca
  for(const f of fumaca){ctx.fillStyle=`rgba(190,200,215,${.32*(1-f.v/3.4)})`;ctx.beginPath();ctx.arc(f.x,f.y,f.s,0,6.283);ctx.fill();}
  // heroi (sem sombra: em Elyria o Jux nao tem sombra) e as frentes por cima dele
  if(NA_VILA&&hero.y>=520)desenhaLanternas();
  uiMundo();
  const npcs=[...(SEG.ativo?[[SEG.y,desenhaSeguidor]]:[]),...(!NA_VILA?[[235,desenhaHalvardCaverna]]:[[bacon.y,desenhaBacon],[tico.y,desenhaTico],[vovo.y,desenhaVovo],[borin.y,desenhaBorin],...ANDARILHOS.map(n=>[n.y,()=>desenhaAndarilho(n)]),...(BAN?BAN.lugares.map((l,i)=>[l[2]-6,()=>desenhaBandeira(i)]):[]),...(FOG?FOG.lugares.map((l,i)=>[l[1],()=>desenhaFogo(i)]):[]),...(POS?POS.lugares.map((l,i)=>[l[1]+l[2]*1.6,()=>desenhaPoste(i)]):[])])].sort((a,b)=>a[0]-b[0]);   // quem esta atras do Jux vem antes
  for(const [y,f] of npcs)if(y<=hero.y)f();
  desenhaHeroi(ctx,1);
  const hb=[hero.x-20,hero.y-54,hero.x+20,hero.y];let escondido=false;
  // frentes por cima do heroi: vao para uma camada separada e ganham um "buraco" transparente e suave em volta dele
  // (arvore, casa ou torre ficam meio transparentes so ali: da para ver o Jux inteiro sem perder o objeto)
  const tr=ctx.getTransform();octx.setTransform(1,0,0,1,0,0);octx.clearRect(0,0,W,H);octx.setTransform(tr);
  const hyD=hero.esc?Math.max(hero.py0,hero.py1)+2:hero.y;   // escalando: fica NA FRENTE do paredao
  for(const f of FR){if(hyD>=f.base)continue;
    if(hb[2]<f.x||hb[0]>f.x+f.w||hb[3]<f.y||hb[1]>f.y+f.h){ctx.drawImage(f.i,f.x,f.y,f.w,f.h);continue;}
    if(!cobre(f)){ctx.drawImage(f.i,f.x,f.y,f.w,f.h);continue;}
    octx.drawImage(f.i,f.x,f.y,f.w,f.h);escondido=true;}
  if(escondido){
    furo=Math.min(1,furo+.12);
    octx.save();octx.globalCompositeOperation='destination-out';
    const g=octx.createRadialGradient(hero.x,hero.y-24,8,hero.x,hero.y-24,46);
    g.addColorStop(0,`rgba(0,0,0,${.78*furo})`);g.addColorStop(.6,`rgba(0,0,0,${.6*furo})`);g.addColorStop(1,'rgba(0,0,0,0)');
    octx.fillStyle=g;octx.fillRect(hero.x-50,hero.y-80,100,100);octx.restore();
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(oc,0,0);ctx.restore();
    // "raio-x": contorno azul-gelo claro + o proprio Jux meio transparente por cima do objeto
    // OTIMIZACAO (2026-11-19): o raio-x so mexe numa caixa em volta do Jux (antes eram 6 operacoes de tela inteira por quadro)
    const hx=tr.a*hero.x+tr.e,hy=tr.d*hero.y+tr.f,bx=Math.max(0,Math.floor(hx-90)),by=Math.max(0,Math.floor(hy-140)),bw=Math.min(W,Math.ceil(hx+90))-bx,bh=Math.min(H,Math.ceil(hy+24))-by;
    if(bw>0&&bh>0){
    hctx.setTransform(1,0,0,1,0,0);hctx.clearRect(bx,by,bw,bh);hctx.setTransform(tr);desenhaHeroi(hctx,1,true);
    sctx.setTransform(1,0,0,1,0,0);sctx.clearRect(bx,by,bw,bh);sctx.globalCompositeOperation='source-over';sctx.drawImage(hc,bx,by,bw,bh,bx,by,bw,bh);
    sctx.globalCompositeOperation='source-in';sctx.fillStyle='#bff4ff';sctx.fillRect(bx,by,bw,bh);sctx.globalCompositeOperation='source-over';
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=.95*furo;
    for(const [ox,oy] of [[-2,0],[2,0],[0,-2],[0,2]])ctx.drawImage(sc,bx,by,bw,bh,bx+ox,by+oy,bw,bh);
    ctx.globalAlpha=.85*furo;ctx.drawImage(hc,bx,by,bw,bh,bx,by,bw,bh);ctx.restore();}
  }else furo=Math.max(0,furo-.12);
  for(const [y,f] of npcs)if(y>hero.y)f();
  desenhaBolas();
  // neve levantando nos passos
  ctx.fillStyle='rgba(235,248,255,.9)';for(const p of poeira){ctx.globalAlpha=1-p.v/.6;ctx.fillRect(p.x,p.y,1.2,1.2);}ctx.globalAlpha=1;
  if(NA_VILA){if(hero.y<520)desenhaLanternas();desenhaFumacas();desenhaBrilhos();}
  if(typeof vidaDesenha==='function')vidaDesenha('ar');
  // "!" em cima do heroi perto de algo
  if(perto&&!fala){const bx=hero.x,by=hero.y-58+Math.sin(t*5)*1.5;ctx.fillStyle='#fff';ctx.strokeStyle='#0a2a4a';ctx.lineWidth=1;
    ctx.beginPath();ctx.ellipse(bx,by,5,6,0,0,6.283);ctx.fill();ctx.stroke();ctx.fillStyle='#1a4a8a';ctx.font='bold 9px "Trebuchet MS"';ctx.textAlign='center';ctx.fillText('!',bx,by+3);}
  desenhaDicaBorda();
  ctx.restore();
  desenhaBaloes();if(!ab.on&&typeof marcasNoMundo==='function')marcasNoMundo();
  // neve caindo em camadas (perto cai mais rapido e e maior)
  for(const f of flocos){f.y+=f.v*f.z/60;f.x+=Math.sin(t+f.o)*.25*f.z-.15-vento*2.4*f.z;if(f.y>H){f.y=-4;f.x=rnd(0,W);}if(f.x<0)f.x=W;
    ctx.fillStyle=`rgba(240,250,255,${.45+.4*f.z})`;ctx.fillRect(f.x,f.y,f.s*f.z,f.s*f.z);}
  // vinheta leve
  const vg=ctx.createRadialGradient(W/2,H/2,H*.45,W/2,H/2,H*.95);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,4,16,.32)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  if(perto&&!fala&&!uiAberto())texto(nomePonto(perto.id)+'  ·  ENTER / toque para examinar',W/2,H-24,16,'#e8f6ff','center');
  if(t<6&&!fala)texto('Setas / WASD ou toque para andar',W/2,30,15,`rgba(220,240,255,${clamp(6-t,0,1)})`,'center');
  if(clarao>0){ctx.fillStyle=`rgba(220,245,255,${clarao})`;ctx.fillRect(0,0,W,H);clarao=Math.max(0,clarao-.02);}
  if(fala)caixaFala();
  uiDesenha();
  desenhaTransicao();
}
// AVISO DA BORDA (pedido 2026-11-20: 'senao o jogador acha que esta bugado'): perto de uma borda de subir/descer (pulos 'v'),
// aparece 'Aperte ↑ para subir' / 'Aperte ↓ para descer' em cima do Jux e setas piscando na beirada
function dicaBorda(){if(fala||hero.pulo>0||!V.pulos||(typeof uiAberto==='function'&&uiAberto()))return null;
  for(const z of V.pulos){if(z[4]!=='v'||hero.x<z[0]||hero.x>z[2])continue;
    if(hero.y>z[3]&&hero.y<=z[3]+26&&pousoV(hero.x,hero.y,-1))return {z,dir:-1};
    if(hero.y<z[1]&&hero.y>=z[1]-26&&pousoV(hero.x,hero.y,1))return {z,dir:1};}
  return null;}
function desenhaDicaBorda(){const d=dicaBorda();if(!d)return;const {z,dir}=d,pisca=.6+.4*Math.sin(t*6);
  const pular=REGIAO==='vila'||!ESCALAR||!hero.espada,txt='Aperte '+(dir<0?'↑':'↓')+' para '+(pular?'pular':dir<0?'subir':'descer');
  // setas na beirada, na frente do Jux
  const my=(z[1]+z[3])/2;ctx.save();ctx.globalAlpha=pisca;ctx.fillStyle='#ffe27a';ctx.strokeStyle='#2a1a00';ctx.lineWidth=1.2;
  for(let k=0;k<2;k++){const yy=my+dir*(k*7-4)+dir*Math.sin(t*6)*1.5;ctx.beginPath();ctx.moveTo(hero.x-6,yy);ctx.lineTo(hero.x+6,yy);ctx.lineTo(hero.x,yy+dir*6);ctx.closePath();ctx.fill();ctx.stroke();}
  ctx.restore();
  // balao com o texto em cima da cabeca
  ctx.save();ctx.font='bold 10px "Trebuchet MS"';const w=ctx.measureText(txt).width+12,bx=hero.x-w/2,by=hero.y-(perto?84:70);
  ctx.fillStyle='rgba(6,16,40,.88)';ctx.strokeStyle='#ffe27a';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(bx,by,w,15,4);ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff6c8';ctx.textAlign='center';ctx.fillText(txt,hero.x,by+11);ctx.restore();}
// TUTORIAL (tutorial.js, FICHA_TUTORIAL.md): confere a cada quadro se chegou a hora de alguma dica (cada uma aparece uma vez)
function tutChecaMapa(){if(typeof tutMostra!=='function'||!tutLigado()||fala||ab.on||!comecou||transicao||hero.pulo>0||(typeof uiAberto==='function'&&uiAberto()))return;
  const C=[
    ['andar',()=>true],
    ['habilidade',()=>hero.espada],
    ['missao_npc',()=>NA_VILA&&hero.espada&&typeof POS_NPC==='function'&&typeof marcaMissao==='function'&&Object.entries(POS_NPC()).some(([id,p])=>p&&marcaMissao(id)==='!'&&Math.hypot(p.x-hero.x,p.y-hero.y)<170)],
    ['missao',()=>typeof estMissoes==='function'&&Object.values(estMissoes()).some(m=>m&&m.st)],
    ['grupo',()=>!!(JOGO.bino&&JOGO.bino.ativo)],
    ['equip',()=>Object.keys(JOGO.inv||{}).some(k=>ITENS[k]&&EQUIPAVEL.includes(ITENS[k].tipo)&&qtd(k)>0)],
    ['hab_nova',()=>JOGO.nivel>=5],
    ['comida',()=>Object.keys(JOGO.inv||{}).some(k=>ITENS[k]&&ITENS[k].tipo==='comida'&&qtd(k)>0)],
    ['eco',()=>typeof estadoEcos==='function'&&estadoEcos().tem.length>0],
  ];
  // save de antes do tutorial com o jogo ja andando: o que ele ja viveu conta como visto (sem chuva de dicas)
  if(!JOGO.tut){JOGO.tut={};if(hero.espada){for(const [id,f] of C){try{if(f())JOGO.tut[id]=true;}catch(e){}}JOGO.tut.andar=true;if((JOGO.vitorias||0)>0)JOGO.tut.luta=true;if(JOGO.nivel>=9)JOGO.tut.ressonancia=true;}}
  const abre=aba=>{if(aba==null)return;UI.menu=true;UI.home=false;UI.aba=aba;UI.sel=0;UI.confirmaNovo=false;UI.pisca=performance.now()+3500;};
  for(const [id,f] of C)if(!tutVisto(id)){let ok=false;try{ok=f();}catch(e){}if(ok){tutMostra(id,abre);return;}}}
function texto(s,x,y,size,cor,al){ctx.font=`bold ${size}px "Trebuchet MS"`;ctx.textAlign=al||'left';ctx.lineWidth=4;ctx.strokeStyle='rgba(0,0,20,.85)';ctx.strokeText(s,x,y);ctx.fillStyle=cor;ctx.fillText(s,x,y);}
/* ---------- retratos na caixa de fala (tools/cut_retratos.py -> vila_retratos.js): 4 expressoes por personagem
   0 normal, 1 feliz, 2 bravo/determinado, 3 surpreso. A linha pode trazer a expressao no 3o campo; senao vem do texto */
const RET=window.JUX_RETRATOS||{},RETI={};for(const k in RET){const i=new Image();i.src=RET[k].atlas;RETI[k]=i;}
const RET_DE={'Presa-Antiga':'presa','Bolotão':'bolotao','Sr. Floco':'bolotao','Capitão':'capitao','Jux':'jux','Vovó Hilda':'vovo','Borin':'borin','Tico':'tico','Ingrid':'ingrid','Oskar':'oskar','Sir Bacon':'bacon','Aurora':'aurora','Halvard':'halvard','Bino':'bino','???':'aurora'};
function expressao(quem,L,e){if(e!==undefined)return e;
  if(/^…|\?!|!\?|O QUE|Finalmente/.test(L))return 3;
  if(/!$/.test(L.trim())&&quem!=='Jux')return /HA|Ha!|hihi|Hihi/.test(L)?1:2;
  if(/Ha|hihi|Hihi|Prazer|gostar|Oinc|Negócio|Gostei|bonito/i.test(L))return 1;
  if(quem==='Aurora'||quem==='???')return /Serve|parceria|Portador/.test(L)?1:0;
  if(quem==='Sir Bacon')return /OINC/.test(L)?2:0;
  return quem==='Jux'?1:0;}
// cenas ilustradas em tela cheia dentro de uma fala (fala.cena): zoom lento e a legenda na caixa
const CENAS_FALA={reencontro:Object.assign(new Image(),{src:'assets/cine_halvard/reencontro.jpg'})};
function desenhaCena(){const im=CENAS_FALA[fala.cena];if(!im||!im.complete)return;
  if(fala.cenaT0==null)fala.cenaT0=performance.now();const k=Math.min(1,(performance.now()-fala.cenaT0)/9000),a=Math.min(1,(performance.now()-fala.cenaT0)/500);
  ctx.save();ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.globalAlpha=a;const z=1+.05*k,iw=W*z,ih=iw*im.naturalHeight/im.naturalWidth;
  ctx.drawImage(im,(W-iw)/2,(H-ih)/2-10*k,iw,ih);ctx.restore();}
function caixaFala(){
  if(fala.cena)desenhaCena();
  const [quem,L,ex]=fala.linhas[fala.i],x=110,y=H-150,w=W-220,h=126;
  const rk=RET_DE[quem],R=rk&&RET[rk],RI=rk&&RETI[rk];
  ctx.save();ctx.fillStyle='rgba(6,16,40,.9)';ctx.strokeStyle='#8fdcff';ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(x,y,w,h,10);ctx.fill();ctx.stroke();
  // retrato: sai um pouco por cima da caixa, do lado esquerdo; o texto anda para a direita
  let tx=0;
  if(quem==='Fenrir'&&typeof retratoOk==='function'&&retratoOk('lamina')){const rh=124,rx=x+12,ry=y+h-rh-6;ctx.fillStyle='#0c1a3a';ctx.fillRect(rx,ry,rh,rh);ctx.drawImage(RETRATO_ECO.lamina,rx,ry,rh,rh);ctx.strokeStyle='#9fe8ff';ctx.lineWidth=2;ctx.strokeRect(rx,ry,rh,rh);tx=rh+16;}
  if(R&&RI.complete){const q=expressao(quem,L,ex),rh=160,rw=R.w*rh/R.h,rx=x+6,ry=y+h-rh-2;
    const agora=performance.now()/1000;if(fala.ret!==fala.i+quem){fala.ret=fala.i+quem;fala.retT=agora;}
    const a=Math.min(1,(agora-fala.retT)/.18);ctx.save();ctx.globalAlpha=a;
    ctx.save();ctx.beginPath();ctx.roundRect(x,y-40,rw+14,h+40,10);ctx.clip();
    ctx.drawImage(RI,q*R.w,0,R.w,R.h,rx-(1-a)*14,ry,rw,rh);ctx.restore();ctx.restore();tx=rw+6;}
  ctx.font='bold 18px "Trebuchet MS"';const nw=ctx.measureText(quem).width+36;
  ctx.fillStyle='rgba(6,16,40,.95)';ctx.beginPath();ctx.roundRect(x+18+tx,y-18,nw,32,8);ctx.fill();ctx.stroke();
  texto(quem,x+36+tx,y+5,18,COR[quem]||'#fff');
  // texto sempre dentro da caixa (2026-11-20): quebra a fala INTEIRA (as linhas nao pulam enquanto as letras aparecem);
  // se passar de 3 linhas, diminui a letra ate caber
  const larg=w-60-tx;let tam=19,linhas;
  for(;;){ctx.font=tam+'px "Trebuchet MS"';linhas=[];let linha='';
    for(const p of L.split(' ')){const tst=linha?linha+' '+p:p;if(linha&&ctx.measureText(tst).width>larg){linhas.push(linha);linha=p;}else linha=tst;}
    linhas.push(linha);if(linhas.length*tam*1.47<=h-30||tam<=13)break;tam--;}
  const passo=Math.round(tam*1.47),ly0=y+30+Math.round(tam*.95);
  ctx.fillStyle='#f2f8ff';ctx.textAlign='left';let resta=Math.floor(fala.letras);
  linhas.forEach((ln,k)=>{if(resta<=0)return;ctx.fillText(ln.slice(0,resta),x+30+tx,ly0+k*passo);resta-=ln.length+1;});
  if(fala.letras>=L.length){ctx.fillStyle='#8fdcff';ctx.beginPath();const ay=y+h-18+Math.sin(t*6)*2;ctx.moveTo(x+w-30,ay);ctx.lineTo(x+w-18,ay);ctx.lineTo(x+w-24,ay+7);ctx.fill();}
  ctx.restore();
}

let ult=performance.now(),comecou=false,uiCarregado=false;
// PAGINA ESCONDIDA (o site guarda o jogo/laboratorio antigo vivo numa moldura escondida, sem aviso de 'aba escondida'):
// se a tela parou de ser desenhada (requestAnimationFrame parado) por mais de 1 s, cala tudo; quando volta a desenhar, retoma
let ultRAF=0,semRAF=false,tocavamRAF=[];
setInterval(()=>{if(semRAF||!ultRAF)return;if(performance.now()-ultRAF>1000){semRAF=true;
  tocavamRAF=[MUS,VENTO,musAtual,...Object.values(VOZES),...Object.values(MUS_CINE)].filter(a=>a&&!a.paused);paraAudio();
  try{for(const v of Object.values(MUS_CINE))v.pause();if(AC&&AC.state==='running')AC.suspend();}catch(e){}}},300);
// um erro num quadro nao congela mais o jogo: mostra o erro (jogo.js mostraErro) e segue
function zeraCtx(c){try{for(let i=0;i<40;i++)c.restore();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.filter='none';c.globalCompositeOperation='source-over';}catch(_){}}
function quadro(now){try{quadro0(now);}catch(e){zeraCtx(ctx);if(typeof mostraErro==='function')mostraErro(e);requestAnimationFrame(quadro);}}
function quadro0(now){if(window.__carregando){ult=now;requestAnimationFrame(quadro);return;}
  if(window.__tut){ult=now;for(const k in teclas)teclas[k]=false;requestAnimationFrame(quadro);return;}   // cartao do tutorial aberto: jogo pausado
  // LIMITE DE QUADROS (2026-11-20: 'a Twitch trava com o jogo aberto'): no maximo 60 por segundo (monitor de 144 Hz desenhava 144),
  // e 30 quando a janela do jogo nao esta em foco (o jogador olhando outra coisa): sobra placa de video para o resto do PC
  if(now-ult<(document.hasFocus()?12:28)){requestAnimationFrame(quadro);return;}
  tutChecaMapa();const dt=Math.max(0,Math.min(.05,(now-ult)/1000));ult=now;
  ultRAF=performance.now();if(semRAF){semRAF=false;if(!window.__morta&&!document.hidden){try{if(AC&&AC.state==='suspended')AC.resume();}catch(e){}for(const x of tocavamRAF)x.play().catch(()=>{});}tocavamRAF=[];}
  if(!uiCarregado&&TER&&!NA_VILA){uiCarregado=true;uiCarrega();abVista=true;comecou=true;
    if(lobosPendentes())setTimeout(()=>aviso('Vasculhe a trilha até achar os lobos de olhos roxos: '+((JOGO.cap1||{}).lobos||0)+'/3','#ffe27a'),1800);
    try{const vl=JSON.parse(localStorage.getItem('jux_volta_luta')||'null');if(vl&&vl.res==='lose_chefe'&&Date.now()-vl.t<120000){localStorage.removeItem('jux_volta_luta');setTimeout(()=>abreFala('derrota_chefe'),700);}}catch(e){}
    if(REGIAO==='pico'&&!JOGO.picoVista){JOGO.picoVista=true;setTimeout(()=>abreFala('pico_chega'),600);}
    else if(REGIAO==='vale'&&!JOGO.valeVista){JOGO.valeVista=true;setTimeout(()=>abreFala('vale_chega'),500);}
    else if(REGIAO==='garganta'&&!JOGO.gargantaVista){JOGO.gargantaVista=true;setTimeout(()=>abreFala(JOGO.ordemSabe?'garganta_chega':'garganta_chega_cedo'),500);}
    else if(REGIAO==='trilha'&&!JOGO.trilhaVista){JOGO.trilhaVista=true;setTimeout(()=>abreFala('trilha_chega'),500);}
    else if(REGIAO==='trilha'&&(JOGO.provas||{}).acolito==='vencida')setTimeout(()=>abreFala('santuario'),900);   // voltou do Acolito: cena
    else if(REGIAO==='caverna'&&(JOGO.provas||{}).skoll==='vencida')setTimeout(()=>abreFala('caverna'),900);   // voltou do chefe (camara do Alfa): cena do Halvard
    else if(REGIAO==='caverna'&&!JOGO.cavernaVista){JOGO.cavernaVista=true;JOGO.auroraEscuro=true;setTimeout(()=>abreFala('caverna_chega'),600);}
    else if(provaFenrirEstado()==='vencida')setTimeout(()=>abreFala('prova_fenrir'),900);   // voltou da luta: cena da lealdade
    // quem ja tinha passado do acampamento goblin antes desta cena existir (2026-11-19): ve a explicacao da Ordem uma vez, fora da vila
    if(!NA_VILA&&!JOGO.ordemSabe&&JOGO.cap1&&JOGO.cap1.acamp)setTimeout(()=>{if(!fala&&!ab.on&&!uiAberto())contaOrdem();},2600);
    salvaVila();}
  if(!uiCarregado&&TER){uiCarregado=true;uiCarrega();
    try{const v=JSON.parse(localStorage.getItem('jux_volta_luta')||'null');localStorage.removeItem('jux_volta_luta');if(v&&v.res==='lose'&&Date.now()-v.t<120000)setTimeout(()=>abreFala('derrota'),600);}catch(e){}
    if(JOGO.vila){abVista=true;comecou=true;
      }}
  if(!comecou&&TER&&MAPA.complete&&!ab.on){
    if(!abVista&&!ab.fim){abComeca();}
    else{comecou=true;setTimeout(()=>{abreFala('inicio');salvaVila();},400);}}
  if(ab.on){t+=dt;abPasso(dt);if(ab.on){abDesenha();requestAnimationFrame(quadro);return;}}
  abPasso(dt);passo(dt);desenha();
  if(ab.fim>0){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=`rgba(0,0,0,${ab.fim})`;ctx.fillRect(0,0,W,H);}
  requestAnimationFrame(quadro);}
requestAnimationFrame(quadro);
