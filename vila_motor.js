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
// ---- CAPITULO 2 (FICHA_CAP2_FESTIVAL.md): JOGO.cap2.fase = 'noite' (festival) -> 'ataque' -> ... ----
const emFestival=()=>NA_VILA&&!!(JOGO.cap2&&JOGO.cap2.fase==='noite');
// o festival comeca quando o Jux volta para a vila depois de ter o Fenrir
const diaFestival=()=>NA_VILA&&!!(JOGO.cap2&&(JOGO.cap2.fase==='volta'||JOGO.cap2.fase==='preparo'));
const festivalPronto=()=>!JOGO.cap2&&typeof estProvas==='function'&&estProvas().fenrir==='feita'&&(typeof cap1Completo!=='function'||cap1Completo());
// trava de capitulo: o que ainda falta do Capitulo 1 (aviso da Aurora ao voltar e a Vovo segurando a historia)
const cap1Trava=()=>typeof cap1Completo==='function'&&!cap1Completo()&&!window.__semSalvar&&!window.__modoTeste;   // nos modos de teste a trava nao atrapalha
function falaPendencias(quem){const l=cap1Faltam();fala={linhas:quem==='vovo'?[['Vovó Hilda','Hmpf. O festival espera. Primeiro termine o que deixou pela metade, forasteiro.'],['✦','Falta do Capítulo 1: '+l.join(', ')+'. (A ★ mostra o caminho.)']]
  :[['Aurora','Antes do festival, Portador, ainda tem gente contando com você.',1],['✦','Falta do Capítulo 1: '+l.join(', ')+'.'],['Jux','Herói que se preza não deixa serviço pela metade.'],['✦','A ★ agora leva até cada pendência, uma por vez. Quando tudo estiver feito, a Vovó chama para o festival.']],i:0,letras:0,fim:null};hero.alvo=null;hero.pontoAlvo=null;som(SOM.ui_vez,.5);}
// mapa da noite de festa (ref/vila/mapa_festival.png: o MESMO desenho, so de noite e enfeitado) e as frentes recortadas dele
const MAPA_FEST=new Image();let festAplicado=false;
function aplicaFestival(){if(festAplicado)return;festAplicado=true;
  // musica da festa (assets/vila/musica_festival: 'Medieval: King's Feast', RandomMind, CC0)
  {const tocava=MUS&&!MUS.paused;MUSICAS[0]=['Noite do Festival','musica_festival'];if(musI===0){pegaMus();if(tocava&&MUS)MUS.play().catch(()=>{});}if(typeof marcaMus==='function')marcaMus();}
MAPA_FEST.onload=()=>{MAPA.src=MAPA_FEST.src;
  for(const f of FR){const c=document.createElement('canvas');c.width=f.w;c.height=f.h;const g=c.getContext('2d');
    const faz=()=>{g.clearRect(0,0,f.w,f.h);g.drawImage(f.i0||f.i,0,0,f.w,f.h);g.globalCompositeOperation='source-in';g.drawImage(MAPA_FEST,f.x,f.y,f.w,f.h,0,0,f.w,f.h);g.globalCompositeOperation='source-over';f.i0=f.i0||f.i;f.i=c;};
    if((f.i0||f.i).complete)faz();else (f.i0||f.i).addEventListener('load',faz,{once:true});}};MAPA_FEST.src='assets/vila/mapa_festival.jpg?v=2';}
// VILA EM ATAQUE (FICHA_CAP2_ATAQUE.md, Parte B): o mesmo desenho, tudo por IMAGEM (pedido do usuario): mapa ref/vila/mapa_ataque.png,
// fogo e fumaca roxos animados pelas folhas (tools/cut_ataque.py -> vila_ataque.js). Musica 'Evil Awaits' (bosslevelaudio, CC-BY 3.0).
const emAtaque=()=>NA_VILA&&!!(JOGO.cap2&&JOGO.cap2.fase==='ataque');
const MAPA_ATQ=new Image();let atqAplicado=false;
function aplicaAtaque(){if(atqAplicado)return;atqAplicado=true;festAplicado=true;
  // os postes de bandeira continuam no desenho (festAplicado liga o bloqueio do pe deles)
  {const tocava=MUS&&!MUS.paused;MUSICAS[0]=['Vila em ataque','musica_ataque'];if(musI===0){pegaMus();if(tocava&&MUS)MUS.play().catch(()=>{});}if(typeof marcaMus==='function')marcaMus();}
  MAPA_ATQ.onload=()=>{MAPA.src=MAPA_ATQ.src;
    for(const f of FR){const c=document.createElement('canvas');c.width=f.w;c.height=f.h;const g=c.getContext('2d');
      const faz=()=>{g.clearRect(0,0,f.w,f.h);g.drawImage(f.i0||f.i,0,0,f.w,f.h);g.globalCompositeOperation='source-in';g.drawImage(MAPA_ATQ,f.x,f.y,f.w,f.h,0,0,f.w,f.h);g.globalCompositeOperation='source-over';f.i0=f.i0||f.i;f.i=c;};
      if((f.i0||f.i).complete)faz();else (f.i0||f.i).addEventListener('load',faz,{once:true});}};MAPA_ATQ.src='assets/vila/mapa_ataque.jpg?v=2';}
const ATQ=window.JUX_ATAQUE||null,ATQI={};if(ATQ)for(const k in ATQ){ATQI[k]=new Image();ATQI[k].src=ATQ[k].atlas;}
// fogo nas marcas de queimado do desenho: [x, y (base), tamanho]; nos telhados vai por cima de tudo, no chao entra na ordem do Jux
const ATQ_TETO=[[126,190,.42],[369,202,.4],[1128,209,.4],[1267,258,.38],[83,326,.4],[374,394,.48],[109,422,.5],[1169,448,.46],[1392,472,.36],[134,668,.42],[462,562,.36],[1009,556,.36]];
// a fogueira da praca: o fogo pintado no mapa foi apagado (escurecido) e o fogo roxo animado fica no lugar dele
const ATQ_CHAO=[[745,649,1.05],[240,834,.3],[1035,712,.28],[664,674,.24]];
const ATQ_FUMACA=[[109,400,.9],[369,180,.75],[1128,188,.75],[1169,428,.85],[134,650,.7]];
function atqQuadro(k,x,y,e,fase,fps){const D=ATQ&&ATQ[k],I=ATQI[k];if(!D||!I.complete)return;const q=Math.floor(t*fps+fase)%D.n;
  ctx.drawImage(I,q*D.w,0,D.w,D.h,x-D.ancora[0]*e,y-D.ancora[1]*e,D.w*e,D.h*e);}
function desenhaAtaqueTopo(){if(!emAtaque())return;
  for(const [x,y,e] of ATQ_FUMACA)atqQuadro('fumaca',x,y,e,x*.37,7);
  for(const [x,y,e] of ATQ_TETO)atqQuadro('fogo',x,y,e,x*.13,11);}
// os inimigos de cada luta que falta ficam VISIVEIS no lugar dela (2026-11-20: a estrela apontava para um lugar vazio):
// a Sombra do morador no meio e os acolitos dos lados, desenhados das folhas da batalha (inimigos_sprites.js), parados e respirando
const INIM_V=window.JUX_INIM||{},INIM_VI={};for(const k of ['acolito','sombra_oskar','sombra_borin','sombra_ingrid'])if(INIM_V[k]){INIM_VI[k]=new Image();INIM_VI[k].src=INIM_V[k].atlas;}
const ATQ_GRUPO={atq_1:[['sombra_oskar',0,-6,.58],['acolito',-40,-16,.55],['acolito',40,-16,.55]],atq_2:[['sombra_borin',0,-6,.68],['acolito',44,-14,.55]],atq_3:[['sombra_ingrid',0,-8,.58],['acolito',-40,-18,.55],['acolito',40,-18,.55]]};
function atqInimDesenha(k,x,y,e,fase){const D=INIM_V[k],I=INIM_VI[k];if(!D||!I||!I.complete)return;const q=Math.floor(t*4+fase)%4,esp=hero.x<x;
  ctx.save();ctx.translate(x,y);ctx.scale(esp?-e:e,e);ctx.drawImage(I,q*D.w,0,D.w,D.h,-D.ancora[0],-D.ancora[1],D.w,D.h);ctx.restore();}
const ataqueDesenhos=()=>[...ATQ_CHAO.map(([x,y,e])=>[y,()=>atqQuadro('fogo',x,y,e,x*.11,11)]),
  ...ATQ_LUTAS.filter(l=>!((JOGO.cap2&&JOGO.cap2.lutas)||{})[l.id]).flatMap(l=>(ATQ_GRUPO[l.id]||[]).map(([k,dx,dy,e],i)=>[l.y+dy,()=>atqInimDesenha(k,l.x+dx,l.y+dy,e,i*1.3)]))];
// as tres lutas (a Sombra de um morador + acolitos), uma de cada vez, na ordem
const ATQ_LUTAS=[{id:'atq_1',x:742,y:712,nome:'Praça'},{id:'atq_2',x:1150,y:612,nome:'Forja do Borin'},{id:'atq_3',x:790,y:330,nome:'Escada do altar'}];
const atqFeitas=()=>ATQ_LUTAS.filter(l=>((JOGO.cap2&&JOGO.cap2.lutas)||{})[l.id]).length;
const atqProxima=()=>ATQ_LUTAS.find(l=>!(((JOGO.cap2&&JOGO.cap2.lutas)||{})[l.id]))||null;
// na vila em ataque so estes pontos respondem (os moradores se esconderam)
const ATQ_PODE=new Set(['portao','entrada_trilha','atq_1','atq_2','atq_3','altar']);
// LOJAS NO ATAQUE (2026-11-20, pedido: 'se perder a batalha fica sem poção'): a Vovó fica na porta da casa dela o tempo todo
// (remédios), e cada morador salvo volta para o lugar dele: Oskar (luta 1), Borin com a forja (luta 2), Ingrid com a padaria (luta 3)
const ATQ_SALVO={oskar:'atq_1',borin:'atq_2',ingrid:'atq_3'};
const atqPode=id=>ATQ_PODE.has(id)||id==='vovo'||(ATQ_SALVO[id]&&((JOGO.cap2&&JOGO.cap2.lutas)||{})[ATQ_SALVO[id]]);
const ATQ_CASA={vovo:[300,588],borin:null,ingrid:[330,612],oskar:[1100,740]};
function atqMoradoresPasso(){const L=(JOGO.cap2&&JOGO.cap2.lutas)||{};
  vovo.x=ATQ_CASA.vovo[0];vovo.y=ATQ_CASA.vovo[1];vovo.anda=false;vovo.fila=[];if(VOVO_PONTO){VOVO_PONTO.x=vovo.x;VOVO_PONTO.y=vovo.y-4;VOVO_PONTO.r=48;}
  if(L.atq_2){borin.x=BORIN_BASE.x;borin.y=BORIN_BASE.y;borin.anda=false;borin.fila=[];BORIN_PONTO.x=borin.x;BORIN_PONTO.y=borin.y-4;BORIN_PONTO.r=48;}else BORIN_PONTO.r=0;
  for(const n of ANDARILHOS){const salvo=ATQ_SALVO[n.id]&&L[ATQ_SALVO[n.id]],c=ATQ_CASA[n.id];if(salvo&&c){n.x=c[0];n.y=c[1];n.anda=false;n.ponto.x=n.x;n.ponto.y=n.y-4;n.ponto.r=46;}else n.ponto.r=0;}}
const atqMoradoresDesenhos=()=>{const L=(JOGO.cap2&&JOGO.cap2.lutas)||{},o=[[vovo.y,desenhaVovo]];if(L.atq_2)o.push([borin.y,desenhaBorin]);
  for(const n of ANDARILHOS)if(ATQ_SALVO[n.id]&&L[ATQ_SALVO[n.id]])o.push([n.y,()=>desenhaAndarilho(n)]);return o;};
// PARTE E (FICHA_CAP2_PARTIDA.md, aprovada 2026-11-20): a manha seguinte. Fases 'manha' (as 4 missoes) e 'fim' (o capitulo acabou).
// Mapa ref/vila/mapa_manha.png (o mesmo desenho, de manha, com o memorial do Halvard no lugar da fogueira); musica 'Contemplation' (joth, CC0).
const emManha=()=>NA_VILA&&!!(JOGO.cap2&&(JOGO.cap2.fase==='manha'||JOGO.cap2.fase==='fim'));
const MAPA_MANHA=new Image();let manhaAplicada=false;
function aplicaManha(){if(manhaAplicada)return;manhaAplicada=true;festAplicado=false;atqAplicado=false;
  {const tocava=MUS&&!MUS.paused;MUSICAS[0]=['Manhã em Invernália','musica_manha'];if(musI===0){pegaMus();if(tocava&&MUS)MUS.play().catch(()=>{});}if(typeof marcaMus==='function')marcaMus();}
  MAPA_MANHA.onload=()=>{MAPA.src=MAPA_MANHA.src;
    for(const f of FR){const c=document.createElement('canvas');c.width=f.w;c.height=f.h;const g=c.getContext('2d');
      const faz=()=>{g.clearRect(0,0,f.w,f.h);g.drawImage(f.i0||f.i,0,0,f.w,f.h);g.globalCompositeOperation='source-in';g.drawImage(MAPA_MANHA,f.x,f.y,f.w,f.h,0,0,f.w,f.h);g.globalCompositeOperation='source-over';f.i0=f.i0||f.i;f.i=c;};
      if((f.i0||f.i).complete)faz();else (f.i0||f.i).addEventListener('load',faz,{once:true});}};MAPA_MANHA.src='assets/vila/mapa_manha.jpg?v=2';}
// os passos da Parte E, na ordem: adeus -> lanterna -> cristais -> partida
const PART_PASSOS=['adeus','lanterna','cristais','partida'];
const partFeito=k=>!!((JOGO.cap2&&JOGO.cap2.e)||{})[k];
const partProximo=()=>PART_PASSOS.find(k=>!partFeito(k))||null;
function partMarca(k){JOGO.cap2.e=JOGO.cap2.e||{};JOGO.cap2.e[k]=true;salvaJogo();}
const TICO_ALTAR={id:'tico_altar',x:760,y:175,r:0};
// mapas da festa e do ataque tem as PROPRIAS lanternas e bandeiras desenhadas em outros lugares: as animadas do mapa de dia
// (lanternas da arvore, bandeiras e cabecas de poste) nao vao por cima (2026-11-20: ficavam duas lanternas e duas bandeiras juntas)
const mapaFesta=()=>NA_VILA&&(emFestival()||emAtaque()||emManha());
const POSTES_FEST=[[572,280,598,298],[922,280,948,298]];   // postes de bandeira que so existem no mapa da festa (pe bloqueia)
const FEST_EFEITO={
  ingrid:()=>{if(JOGO.cap2.ingrid)return;JOGO.cap2.ingrid=true;JOGO.buff={id:'ensopado',lutas:(ITENS.ensopado&&ITENS.ensopado.lutas)||5};som(SOM.ui_vez,.6);aviso('Ensopado do Festival: bônus de comida ativo!','#7dffa8');salvaJogo();},
  vovo:()=>brindeVovo(),
};
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
function livre(x,y){if(festAplicado&&POSTES_FEST.some(([a,b,c,d])=>x+6>=a&&x-6<=c&&y+2>=b&&y-4<=d))return false;if(naGelo(x,y)||naEntrada(x,y))return true;for(let dy=-4;dy<=2;dy+=2)for(let dx=-6;dx<=6;dx+=2)if(!(ter(x+dx,y+dy)&1))return false;return true;}
// cerca que da para pular: devolve o x de pouso do outro lado (ou null)
// cercas que da para pular: [x0,y0,x1,y1,'h'|'v'] -> ponto de pouso do outro lado (ou null)
function pouso(x,y,dx){const z=V.pulos.find(([a,b,c,d,t])=>t!=='v'&&x+dx*12>=a&&x+dx*12<=c&&y>=b&&y<=d);if(!z)return null;const px=dx>0?z[2]+9:z[0]-9;return livre(px,y)?{x:px,y}:null;}
// pouso do pulo/escalada vertical: o primeiro lugar livre depois da faixa (procura ate 30 px: a beirada desenhada e torta)
function pousoV(x,y,dy){const z=V.pulos.find(([a,b,c,d,t])=>t==='v'&&x>=a&&x<=c&&(dy>0?y<d&&y+26>=b:y>b&&y-26<=d));
  // dentro da faixa vale qualquer altura (a cerca e torta)
  if(!z)return null;const p0=dy>0?z[3]-4:z[1]+4;
  // procura o pouso reto e, se ali tiver obstaculo (ex.: o cocho do chiqueiro), um pouco para os lados (ate 70 px)
  for(const ox of [0,-6,6,-12,12,-20,-30,-42,-56,-70,-84,-100,-116]){const px=x+ox;for(let k=0;k<=40;k+=2){const py=p0+dy*k;if((dy>0?py>z[3]-6:py<z[1]+6)&&livre(px,py))return {x:px,y:py};}}return null;}

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
  // ---- CAPITULO 2: a VOLTA para a vila (de dia) e os preparativos do festival (ligacao aprovada 2026-11-20) ----
  fest_volta:[['✦','Invernália. Cheiro de pão e de fumaça de forja. Nunca pareceu tanto com casa.'],['Tico','JUX! BINO! VOCÊS VOLTARAM!'],
    ['Tico','E o lobo gigante? Vocês acharam? Ele era do tamanho de uma casa?'],['Jux','Maior. E agora ele mora na minha espada. É complicado.'],
    ['Tico','…ISSO É A COISA MAIS LEGAL QUE EU JÁ OUVI NA VIDA!'],['Halvard','Tico, deixa eles respirarem. …Que bom que voltaram inteiros.'],['Bino','…Inteiros.'],
    ['Tico','A Vovó tá procurando vocês! Ela tá na frente da casa dela, mandando em todo mundo!']],
  dia_vovo:[['Vovó Hilda','Hmpf. Voltaram inteiros. Ótimo.'],['Vovó Hilda','Hoje à noite é o festival da Rainha do Inverno. E eu preciso de braço forte.'],
    ['Jux','Eu tenho um braço forte e um Bino. Os dois vêm no pacote.'],
    ['Vovó Hilda','O Borin está pendurando as bandeirinhas e já caiu duas vezes. O porco roubou um pão da Ingrid. E alguém precisa carregar a lenha da fogueira.'],
    ['Bino','…Eu carrego.'],['Vovó Hilda','Hmpf. Gostei desse.'],['Vovó Hilda','Ajudem com essas três coisas e depois venham falar comigo. A noite cai rápido no inverno.']],
  dia2_vovo:[['Vovó Hilda','Prontos? Então vão se arrumar. Quando o sol cair, a praça acende.'],['Jux','Arrumar? Eu tenho um casaco. Ele É a roupa de festa.'],
    ['Vovó Hilda','Hmpf. Pelo menos tire a neve dele.']],
  dia_borin:[['Borin','FORASTEIRO! Já de volta? A Vovó tá me fazendo pendurar bandeirinha. Eu! O maior ferreiro de Invernália!'],['Jux','O maior ferreiro e o maior pendurador de bandeirinha. Dois títulos.']],
  dia_bacon:[['Sir Bacon','(mastigando alguma coisa)'],['Jux','…O que você tem aí, Sir?'],['Sir Bacon','…Oinc.']],
  dia_tico:[['Tico','Hoje à noite vai ter dança, música e fogos de gelo! O Oskar cortou lenha pra uma fogueira GIGANTE!'],['Tico','Jux, você dança?'],
    ['Jux','Eu sou um estrategista. Eu calculo a dança.'],['Tico','…Isso é um não.']],
  dia_ingrid:[['Ingrid','Aquele porco levou meu melhor pão de mel! Se você achar, devolve? Eu guardo um pedaço pra você.']],
  dia_oskar:[['Oskar','Hm.'],['Oskar','…Lenha da fogueira. Pronta.'],['Jux','Isso dá para aquecer a vila inteira.'],['Oskar','Hm. É a ideia.']],
  // ---- CAPITULO 2, PARTE A: a noite do festival (FICHA_CAP2_FESTIVAL.md) ----
  fest_chega:[['✦','O sol se esconde atrás das montanhas. Uma a uma, as lanternas de Invernália se acendem.'],['✦','É a noite do festival da Rainha do Inverno.'],
    ['Jux','Luzinhas, fogueira e cheiro de pão. Ou é festa, ou é o melhor dia da minha vida em Elyria.'],['Aurora','As duas coisas, Portador. Aproveite. Noites assim são raras.',0]],
  atq_1_fim:[['✦','A fumaça roxa sai do corpo do Oskar. Ele abre os olhos, abraçado ao tambor.'],['Oskar','Eu… ouvi você. Lá de dentro.'],['Jux','Então ouve isso também: corre para a casa da Vovó.'],['✦','O Oskar corre para a casa onde os outros se esconderam.']],
  atq_2_fim:[['✦','A fumaça sai do Borin. Ele tomba de joelhos, ofegando.'],['Borin','Ainda bem que você bate como um ferreiro.'],['Bino','…Ele bate mais.'],['✦','O Borin se levanta e corre para a casa da Vovó.']],
  atq_3_fim:[['✦','A fumaça sai da Ingrid. Ela segura o braço do Jux, tremendo.'],['Ingrid','Eles foram para o altar… estão cavando embaixo da espada!'],['Aurora','O Cristal do Gelo, Portador. Está escondido debaixo do altar.',1],['Jux','Então é para lá que a gente vai.']],
  ign_calor:[['Bino','…Calor. Lá em cima.'],['Jux','A neve da escada está derretendo. Isso não é a Vovó fazendo sopa.']],
  ign_vence:[['✦','O Ignarok desaba dentro da fenda. O magma esfria e vira pedra preta.'],['Jux','…Ninguém derrete nada hoje. Eu avisei.'],['Aurora','O Cristal ainda está lá embaixo, Portador. Mas sinto ele… rachado.',1]],
  manha_chega:[['✦','A neve caiu a noite toda. Cobriu o fogo, as cinzas e as pegadas.'],['Aurora','A dor é o preço de quem se importa, Portador. A Ordem não entende isso. É por isso que vai perder.',1],
    ['Bino','…Ele me deu comida. Sem perguntar.'],['Jux','Eu sei, Bino.'],['✦','A Vovó Hilda espera na praça.']],
  manha_borin:[['Borin','Eu fiz aquele machado pra ele, sabe. Vinte anos atrás.'],['Borin','…Ainda está afiado.']],
  manha_ingrid:[['Ingrid','Eu fiz a sopa que ele gostava. Ninguém comeu.'],['Ingrid','…Leva um pouco, Jux. Pra estrada.']],
  manha_oskar:[['Oskar','O tambor não toca hoje. Amanhã, talvez.'],['Oskar','Ele ia querer que tocasse.']],
  manha_bacon:[['✦','O Sir Bacon está deitado na neve, com o laço azul da festa ainda no pescoço.'],['Sir Bacon','…oinc.']],
  manha_tico:[['Tico','…'],['✦','O Tico não quer falar agora. Ele segura a lanterna com força.']],
  manha_memorial:[['✦','A pedra do Halvard. O machado cravado em cima, a capa vermelha dobrada, as lanternas acesas.'],['Jux','…Eu cuido dele. Prometi.']],
  manha_tico_altar:[['✦','O Tico está sentado sozinho no alto do altar, olhando a rachadura azul.'],['Tico','Eu fiquei com raiva de você. Porque você é forte e não conseguiu…'],
    ['Tico','Mas o papai disse pra você cuidar de mim. Então eu também vou cuidar de você.'],['Tico','Leva a lanterna do papai. Ela ilumina a neve à noite. Pra você não se perder.'],
    ['Jux','Eu volto pra devolver. Prometo. E aí você me ensina a caçar.'],['✦','Você recebeu a Lanterna do Halvard.']],
  manha_portao_cedo:[['Jux','Ainda não. Tem coisa pra resolver aqui antes.']],
  manha_vovo_espera:[['Vovó Hilda','Hmpf. Vá ver o menino, forasteiro. Ele subiu pro altar e não quer descer.']],
  manha_vovo_fim:[['Vovó Hilda','O portão está aberto. E a minha porta também, quando voltarem.']],
  atq_fala_vovo:[['Vovó Hilda','Entra, forasteiro, rápido! A gente está escondido aqui dentro.'],['Vovó Hilda','Leva remédio. E volta inteiro, que eu não tenho tempo de te remendar duas vezes.']],
  atq_fala_borin:[['Borin','Garoto! Ainda sinto o braço tremendo… mas a forja tá quente.'],['Borin','Pega o que precisar. Hoje é de graça! …Não, mentira. Mas é com desconto de herói.']],
  atq_fala_ingrid:[['Ingrid','Leva pão, Jux. De barriga vazia ninguém salva vila nenhuma.']],
  atq_fala_oskar:[['Oskar','…Obrigado.'],['Oskar','Vai. O tambor espera você terminar.']],
  atq_portao:[['Jux','Não vou sair daqui com a vila assim.'],['Bino','…Ninguém sai.']],
  atq_comeca:[['Aurora','As Sombras ainda estão lá dentro, Portador. Derrube sem quebrar.',1],['Jux','Derrubar sem quebrar. Tipo a minha vida amorosa.'],['Bino','…Foco.']],
  atq_1:[['✦','Na praça, a Sombra do Oskar abraça o tambor. Dois acólitos apontam os cajados para você.'],['Oskar','Jux… o tambor… eu não sinto as mãos…'],['Jux','Aguenta, Oskar. Eu vou te tirar daí.']],
  atq_2:[['✦','Na forja, a Sombra do Borin ergue o martelo. Um acólito sussurra atrás dela.'],['Borin','Garoto… sai daqui… eu não mando mais no meu braço!'],['Bino','…Eu seguro.']],
  atq_3:[['✦','Na escada do altar, a Sombra da Ingrid chora. Dois acólitos guardam a subida.'],['Ingrid','Jux… me desculpa…'],['Jux','Não pede desculpa. Quem vai pedir são eles.']],
  fest_vovo:[['Vovó Hilda','Hmpf. Chegou o herói. Tire a neve das botas, que hoje a praça está limpa.'],['Jux','Vovó, a senhora está… sorrindo?'],
    ['Vovó Hilda','É o festival. Uma noite por ano eu sorrio. Não se acostume.'],['Vovó Hilda','Quando todos estiverem aqui, eu faço o brinde à Rainha do Inverno. Fale com o povo antes. Eles gostam de você, forasteiro sem sombra.'],['Vovó Hilda','E então? Faço o brinde agora?']],
  fest_borin:[['Borin','FORASTEIRO! Um brinde! À espada que eu nunca consegui puxar!'],['Jux','À espada que escolheu o cara mais bonito da vila.'],
    ['Borin','HA! …Sabe, eu chorei quando ela voou para a sua mão. Hoje eu choro de novo. De alegria. Ou do hidromel.'],['Bino','…Os dois.'],['✦','Vocês brindaram. O Borin deu um abraço que estalou três costelas. Das boas.']],
  fest_tico:[['Tico','JUX! Meu pai voltou e hoje tem festival! É o melhor dia do MUNDO!'],['Halvard','Ele não para quieto desde o pôr do sol. Obrigado, Jux. De novo.'],
    ['Tico','Vem dançar perto da fogueira! O Bino também!'],['Bino','…Eu não danço.'],['Tico','TODO MUNDO dança no festival!'],
    ['✦','O Bino dança. É como ver uma montanha tentando ser uma folha. O Tico ri até cair na neve.'],['Jux','Bino. Isso foi… lindo. Eu nunca vou esquecer.'],['Bino','…Ninguém viu nada.']],
  fest_ingrid:[['Ingrid','Ensopado do festival! Hoje é de graça para quem trouxe o Halvard de volta!'],['Jux','Eu sabia que heroísmo um dia ia pagar o jantar.'],
    ['✦','Você ganhou um Ensopado do Festival: bônus de comida nas próximas lutas.']],
  fest_oskar:[['Oskar','Hm.'],['Jux','Festa boa, hein, Oskar?'],['Oskar','…Cortei a lenha da fogueira inteira.'],['Jux','Então a festa é sua.'],['Oskar','Hm. (sorriso)']],
  fest_capitao:[['Capitão','Lanternas, música e ninguém vigiando as barracas. Noite perigosa para um ex-pirata.'],['Jux','Ex.'],['Capitão','EX. Comércio Honesto. Quase sempre.']],
  fest_bacon:[['Sir Bacon','Oinc!'],['Jux','Sir Bacon de laço azul. Elegante. A noite é sua.'],['Sir Bacon','OINC.'],['Aurora','Esse porco me olha como se soubesse de alguma coisa.',0]],
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
const NOMES={atq_1:'Sombra do Oskar',atq_2:'Sombra do Borin',atq_3:'Sombra da Ingrid',camara_alfa:'Câmara do Alfa',saida_caverna:'Saída da caverna',tunel_garras:'Túnel das correntes',caverna:'Caverna de gelo (entrada)',entrada_vale:'Trilha para o Vale dos Lobos',saida_vale:'Descida para a Garganta',floco:'Sr. Floco',capitao:'Capitão Dente-de-Ferro (mercador)',saida_garganta:'Caminho para a Garganta Gelada',entrada_trilha:'Arco de volta à trilha',caverna_fechada:'Caverna de gelo (bloqueada)',prova_pegadas:'Pegadas enormes',prova_fenrir:'Círculo de pedras',circulo_pico:'Círculo de pedras',entrada_pico:'Trilha do Pico do Uivo',saida_pico:'Descida para o Vale',mirante_pico:'Mirante',saida_vila:'Caminho de volta para a vila',caverna:'Caverna de gelo',santuario:'Santuário do cristal',acampamento:'Acampamento goblin',fogueira:'Fogueira',arvore:'Árvore das lanternas',barraca_comida:'Barraca de comida',barraca_bebida:'Barraca de bebida',
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
  // (2026-11-21, pedido: 'nao e para o porco ficar me seguindo'): depois do fim do Cap. 2 ele fica no chiqueiro, como antes
  if(bacon.segue&&!bacon.vaiSeguir){bacon.segue=false;bacon.x=250;bacon.y=800;bacon.pts=[];}
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
function desenhaBacon(){if(desenhaFesta(bacon))return;if(desenhaBaconCaca())return;
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
  if(emManha()&&partProximo()==='lanterna'){tico.x=TICO_ALTAR.x;tico.y=TICO_ALTAR.y;tico.anda=false;tico.acao='respira';tico.at+=dt;TICO_PONTO.r=0;TICO_ALTAR.r=46;return;}else TICO_ALTAR.r=0;
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
function desenhaTico(){if(desenhaFesta(tico))return;
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
function desenhaVovo(){if(desenhaFesta(vovo))return;
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
function desenhaBorin(){if(desenhaFesta(borin))return;if(emPreparo()&&prepCena&&prepCena.tipo==='borin')return;
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
  // PREPARATIVOS: o Bino vai andando ate um lugar (a lenha, o canto de pegar o porco) em vez de seguir o Jux
  if(SEG.vaiPara){const [tx,ty]=SEG.vaiPara,ax=tx-SEG.x,ay=ty-SEG.y,d=Math.hypot(ax,ay);SEG.chegou=d<2;
    if(!SEG.chegou){const m=Math.min(d,VEL*1.05*dt);SEG.x+=ax/d*m;SEG.y+=ay/d*m;SEG.dist+=m;SEG.anda=true;SEG.vel=VEL;
      const h=Math.abs(ax)>Math.abs(ay)*1.2;SEG.olha=h?(ax<0?'esquerda':'direita'):(ay<0?'cima':'baixo');}
    else{SEG.anda=false;SEG.vel=0;SEG.olha='baixo';}
    SEG.trilha=[];return;}
  const t=SEG.trilha,u=t[t.length-1];if(!u||Math.hypot(hero.x-u.x,hero.y-u.y)>3)t.push({x:hero.x,y:hero.y});if(t.length>260)t.shift();
  let acc=0,alvo=null;for(let i=t.length-1;i>0;i--){acc+=Math.hypot(t[i].x-t[i-1].x,t[i].y-t[i-1].y);if(acc>=34){alvo=t[i-1];break;}}
  // anda de forma continua: a velocidade acompanha a distancia ate o ponto que ele segue (sem acelerar e parar de novo), e o passo do desenho acompanha o chao
  // PULO DA CERCA: se o proximo passo bate num obstaculo, salta em arco ate o primeiro chao livre do outro lado (como o Jux)
  if(SEG.salto){const S=SEG.salto;S.t+=dt;const u=Math.min(1,S.t/.5);SEG.x=S.x0+(S.x1-S.x0)*u;SEG.y=S.y0+(S.y1-S.y0)*u;SEG.alt=Math.sin(u*Math.PI)*16;SEG.anda=true;SEG.dist+=1;
    if(u>=1){SEG.salto=null;SEG.alt=0;poeiraNeve(SEG.x,SEG.y,6);}return;}
  // o pulo usa a MESMA regra do Jux (faixa de pulo da cerca + pousoV): so pula se o Jux esta do outro lado da cerca,
  // e cai sempre num chao livre (nunca em cima da madeira)
  if(alvo&&NA_VILA&&V.pulos){const dyH=hero.y-SEG.y,dir=dyH>0?1:-1;
    if(Math.abs(dyH)>24){const ax=alvo.x-SEG.x,ay=alvo.y-SEG.y,d=Math.hypot(ax,ay)||1;
      const trava=!livre(SEG.x+ax/d*5,SEG.y+ay/d*5)||!livre(SEG.x,SEG.y+dir*6);
      const p=trava?pousoV(SEG.x,SEG.y,dir):null;
      if(p&&(p.y-SEG.y)*dir>8&&Math.hypot(p.x-SEG.x,p.y-SEG.y)<120){SEG.salto={t:0,x0:SEG.x,y0:SEG.y,x1:p.x,y1:p.y};SEG.olha=dir>0?'baixo':'cima';som(SOM.whoosh,.35);return;}}}
  let v=0,vx=0,vy=0;
  if(alvo){const ax=alvo.x-SEG.x,ay=alvo.y-SEG.y,d=Math.hypot(ax,ay);
    if(d>.8){v=Math.min(d*5,hero.corre?VELC*1.12:VEL*1.15);const m=Math.min(d,v*dt);vx=ax/d*m;vy=ay/d*m;
      // na vila nao atravessa obstaculo: escorrega pelo lado livre ou espera (o pulo acima resolve a cerca)
      if(NA_VILA&&livre(SEG.x,SEG.y)&&!livre(SEG.x+vx,SEG.y+vy)){if(livre(SEG.x+vx,SEG.y))vy=0;else if(livre(SEG.x,SEG.y+vy))vx=0;else{vx=0;vy=0;}}
      SEG.x+=vx;SEG.y+=vy;SEG.dist+=Math.hypot(vx,vy);}}
  SEG.vel=SEG.vel==null?v:SEG.vel+(v-SEG.vel)*Math.min(1,dt*9);   // velocidade suavizada: evita piscar entre andar e parado
  SEG.anda=SEG.vel>(SEG.anda?7:14);
  if(SEG.anda&&(vx||vy)){const ax=Math.abs(vx),ay=Math.abs(vy),h=ax>ay*1.35,vv=ay>ax*1.35;   // so troca de lado quando um eixo domina bem (sem tremer nas diagonais)
    if(h)SEG.olha=vx<0?'esquerda':'direita';else if(vv)SEG.olha=vy<0?'cima':'baixo';}
  // ficou para tras: na vila durante os preparativos ele CORRE ate o Jux (nao some e aparece); fora disso (troca de mapa) ainda pula para perto
  else if(Math.hypot(hero.x-SEG.x,hero.y-SEG.y)>90){if(typeof emPreparo==='function'&&emPreparo()){const ax=hero.x-26-SEG.x,ay=hero.y+2-SEG.y,d=Math.hypot(ax,ay),m=Math.min(d,VELC*1.25*dt);SEG.x+=ax/d*m;SEG.y+=ay/d*m;SEG.dist+=m;SEG.anda=true;SEG.olha=Math.abs(ax)>Math.abs(ay)?(ax<0?'esquerda':'direita'):(ay<0?'cima':'baixo');}
    else{SEG.x=hero.x-26;SEG.y=hero.y+2;}}
}
function desenhaSeguidor(){if(!SEG.ativo||!BIN||!BINI.complete||SEG.oculto)return;
  const fb=fala&&fala.linhas&&fala.linhas[fala.i]&&fala.linhas[fala.i][0]==='Bino',pulo=(SEG.cena&&fb&&!SEG.anda)?-Math.abs(Math.sin(t*7))*3.2:0;   // gesto: quando e a fala dele, ele da um leve pulo/aceno de corpo
  const c=BIN.quadros[SEG.olha],q=SEG.anda?c[Math.floor(SEG.dist/(hero.corre?10:11))%c.length]:BIN.quadros.baixo[0],oy=pulo+(SEG.anda?-Math.abs(Math.sin(SEG.dist/(hero.corre?10:11)*Math.PI))*1.1:0);
  desenhaNpc(BIN,BINI,SEG.x,SEG.y+oy-(SEG.alt||0),SEG.anda?q:(SEG.olha==='baixo'?q:c[0]),false,14,54);}
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
function desenhaAndarilho(n){if(desenhaFesta(n))return;
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
// ===================== A FESTA (FESTA_ANIMACOES.md): na noite do festival cada morador fica num lugar da praca,
// dancando em loop com a folha de festa (tools/cut_festa.py -> vila_festa.js). Perto do Jux, para de dancar e fica de frente.
// Figurantes (bardo e casal) so existem na festa. Por cima: lanternas de papel subindo, fogos de gelo e baloes de festa.
const FESTA_D=window.JUX_FESTA||{},FESTA_I={};for(const k in FESTA_D){const i=new Image();i.src=FESTA_D[k].atlas;FESTA_I[k]=i;}
// lugar de cada um na praca (x,y do pe), velocidade da danca (quadros por segundo) e baloes que ele solta
const FESTA_LUGAR={
  tico:[668,650,7,['Viva o festival!','Pai, olha eu!','Mais rápido!']],halvard:[632,670,6,['Isso, Tico!','Hahaha!']],
  borin:[574,676,5,['SAÚDE!','À Rainha do Inverno!','Mais hidromel!']],vovo:[826,672,4,['Hmpf. Que música boa.','Ainda tenho ritmo!']],
  oskar:[952,678,8,['…','(tum tum tum)']],ingrid:[918,632,5,['Ensopado quentinho!','Pão de mel!']],
  bacon:[780,704,7,['Oinc!','OINC!']],bino:[724,700,5,['…','…Ninguém viu nada.','(dança, sério)']],bardo:[602,638,6,['♪ La la la ♪','♪ Pela Rainha! ♪']],casal:[868,648,6,['Hihi!','Mais uma!']],
};
const FIGURANTES=[];
const festaNpcs=()=>{if(!emFestival())return [];return Object.keys(FESTA_LUGAR).filter(k=>FESTA_D[k]);};
let festaPosto=false;
function festaPoe(){if(festaPosto||!emFestival())return;festaPosto=true;
  const M={tico,vovo,borin,bacon};for(const a of ANDARILHOS)M[a.id]=a;
  for(const k in FESTA_LUGAR){const L=FESTA_LUGAR[k];const o=M[k];
    if(o){o.x=L[0];o.y=L[1];o.festa=k;o.anda=false;o.fila=[];o.alvo=null;if(o.ponto){o.ponto.x=o.x;o.ponto.y=o.y-4;o.ponto.r=44;}
      // na festa o Tico, a Vovo, o Borin e o porco nao andam (os passos deles nao rodam): o ponto de conversa vai junto para o lugar da festa
      const P={tico:TICO_PONTO,vovo:VOVO_PONTO,borin:BORIN_PONTO,bacon:PORCO_PONTO}[k];if(P){P.x=o.x;P.y=o.y-4;P.r=44;}}
    else if(k==='bardo'||k==='casal'||(k==='bino'&&JOGO.bino&&JOGO.bino.ativo)){FIGURANTES.push({id:k,x:L[0],y:L[1],festa:k});}}}
// o desenho de festa de um morador (devolve true se desenhou no lugar do desenho normal)
// LUTO (LUTO_ANIMACOES.md, 2026-11-20): na manha depois da morte do Halvard, cada morador fica parado num loop triste (vila_luto.js)
const LUTO_D=window.JUX_LUTO||{},LUTO_I={};for(const k in LUTO_D){const i=new Image();i.src=LUTO_D[k].atlas;LUTO_I[k]=i;LUTO_D[k].escala*=k==='bacon'?1.5:1.15;}   // um pouco maiores (sentados ficavam pequenos demais)
const lutoAtivo=()=>NA_VILA&&!!(JOGO.cap2&&JOGO.cap2.fase==='manha');
// onde cada um fica: em volta do memorial, o Borin na forja, a Ingrid na barraca, o Oskar perto da outra barraca
const LUTO_LUGAR={tico:[620,650],bacon:[584,654],vovo:[884,672],borin:[1247,580],ingrid:[486,612],oskar:[1000,640]};
function lutoPasso(){TICO_ALTAR.r=partProximo()==='lanterna'?46:0;const M={tico,vovo,borin,bacon};for(const a of ANDARILHOS)M[a.id]=a;
  for(const k in LUTO_LUGAR){const o=M[k];if(!o)continue;let [x,y]=LUTO_LUGAR[k];
    if(k==='tico'&&partProximo()==='lanterna'){x=TICO_ALTAR.x;y=TICO_ALTAR.y;}   // o Tico sozinho no alto do altar
    o.x=x;o.y=y;o.anda=false;o.fila=[];o.alvo=null;o.luto=k;
    const P={tico:TICO_PONTO,vovo:VOVO_PONTO,borin:BORIN_PONTO,bacon:PORCO_PONTO}[k]||o.ponto;
    if(P){P.x=x;P.y=y-4;P.r=(k==='tico'&&partProximo()==='lanterna')?0:44;}}}
function desenhaLuto(o){const k=o.luto,D=LUTO_D[k],I=LUTO_I[k];if(!D||!I||!I.complete)return false;
  const perto=Math.hypot(hero.x-o.x,hero.y-o.y)<46,n=D.quadros.length;
  const q=perto?D.quadros[n-1]:D.quadros[Math.floor((t*2.2+(o.x%5))%(n-1))];   // loop lento; perto do Jux: levanta o rosto (ultimo quadro)
  desenhaNpc(D,I,o.x,o.y,q,false,12,46);return true;}
function desenhaFesta(o){if(o.luto&&lutoAtivo()&&desenhaLuto(o))return true;const k=o.festa;if(!k||!emFestival())return false;const D=FESTA_D[k],I=FESTA_I[k];if(!D||!I.complete)return false;
  const L=FESTA_LUGAR[k],perto=Math.hypot(hero.x-o.x,hero.y-o.y)<46,n=D.quadros.length;
  const q=perto?D.quadros[n-1]:D.quadros[Math.floor((t*L[2]+(o.x%7))%n)];   // perto do Jux: o ultimo quadro (de frente, sorrindo)
  desenhaNpc(D,I,o.x,o.y,q,false,12,46);
  if(!perto&&Math.random()<.0025&&!fala)balao(o,L[3][(Math.random()*L[3].length)|0]);
  return true;}
// efeitos da festa no ceu: lanternas de papel subindo e fogos de gelo
const LANT=[],FOGOS=[];
function festaCeu(dt){if(!emFestival())return;
  if(Math.random()<dt*.9)LANT.push({x:rnd(380,1080),y:rnd(560,700),v:rnd(10,16),f:rnd(0,6),a:0});
  if(Math.random()<dt*.18){const x=rnd(420,1040),y=rnd(110,260);for(let i=0;i<26;i++){const an=i/26*6.283;FOGOS.push({x,y,vx:Math.cos(an)*rnd(30,55),vy:Math.sin(an)*rnd(30,55),v:0,c:Math.random()<.5?'#bff4ff':'#7fd6f5'});}abSom&&Math.random()<.5&&abSom('brilho');}
  for(let i=LANT.length-1;i>=0;i--){const l=LANT[i];l.y-=l.v*dt;l.x+=Math.sin(t+l.f)*6*dt;l.a+=dt;if(l.y<20)LANT.splice(i,1);}
  for(let i=FOGOS.length-1;i>=0;i--){const f=FOGOS[i];f.v+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=18*dt;if(f.v>1.4)FOGOS.splice(i,1);}}
function desenhaFestaCeu(){if(!emFestival())return;ctx.save();
  for(const l of LANT){const a=Math.min(1,l.a/1.2)*Math.min(1,(l.y-20)/120);ctx.globalAlpha=.85*a;
    const g=ctx.createRadialGradient(l.x,l.y,0,l.x,l.y,9);g.addColorStop(0,'rgba(255,200,110,.75)');g.addColorStop(1,'rgba(255,140,40,0)');ctx.fillStyle=g;ctx.fillRect(l.x-9,l.y-9,18,18);
    ctx.fillStyle='#ffcf7a';ctx.fillRect(l.x-2.5,l.y-3.5,5,6);ctx.fillStyle='#ffefc0';ctx.fillRect(l.x-1,l.y-2,2,3);}
  ctx.globalCompositeOperation='lighter';
  for(const f of FOGOS){ctx.globalAlpha=Math.max(0,1-f.v/1.4);ctx.fillStyle=f.c;ctx.fillRect(f.x-1.2,f.y-1.2,2.4,2.4);}
  ctx.restore();}
// ===================== PREPARATIVOS DO FESTIVAL (FICHA_PREPARATIVOS.md, aprovada 2026-11-20) =====================
// Na fase 'preparo' (de dia, depois da Vovo pedir ajuda): 3 tarefas calmas, cada uma com '!' em cima e na lista do canto.
// borin: segurar a escada (cena animada) · pao: encostar 3 vezes no Sir Bacon fujao (o Bino pega no ar) · lenha: acompanhar o Bino ate a fogueira
const PREP_D=window.JUX_PREPARO||{},PREP_I={};for(const k in PREP_D){const i=new Image();i.src=PREP_D[k].atlas;PREP_I[k]=i;}
const PREP_ESCADA=[600,654],PREP_PILHA=[968,690],PREP_FOGO=[816,664],PREP_PRACA=[574,626,916,678],PREP_PEGA=[612,668];
const PREP_NOMES={borin:'Ajudar o Borin com as bandeirinhas',pao:'Recuperar o pão que o Sir Bacon roubou',lenha:'Levar a lenha para a fogueira'};
const emPreparo=()=>NA_VILA&&!!(JOGO.cap2&&JOGO.cap2.fase==='preparo');
const prepT=()=>{JOGO.cap2.tarefas=JOGO.cap2.tarefas||{};return JOGO.cap2.tarefas;};
const prepFeita=k=>!!prepT()[k];
const prepFaltam=()=>['borin','pao','lenha'].filter(k=>!prepFeita(k));
function prepConclui(k){prepT()[k]=true;salvaJogo();som(SOM.ui_vez,.7);const f=prepFaltam().length;
  aviso('✔ '+PREP_NOMES[k]+(f?'  ·  faltam '+f:'  ·  tudo pronto! Volte à Vovó Hilda'),'#7dffa8');}
// lista para o canto da tela e o diario: [[texto, feita], ...]
function listaPreparo(){if(!emPreparo())return null;return ['borin','pao','lenha'].map(k=>[PREP_NOMES[k],prepFeita(k)]);}
// destino da estrela: a proxima tarefa que falta (ou a Vovo)
function destinoPreparo(){const f=prepFaltam();if(!f.length)return null;const k=f[0];
  if(k==='borin')return {x:PREP_ESCADA[0],y:PREP_ESCADA[1],txt:'Preparativos: ajude o Borin na escada'};
  if(k==='pao')return {x:bacon.x,y:bacon.y,txt:'Preparativos: pegue o Sir Bacon (o pão!)'};
  return {x:PREP_PILHA[0],y:PREP_PILHA[1],txt:'Preparativos: a lenha da fogueira'};}
let prepCena=null;
// [quadro, duracao (s), movimento(u 0..1) -> {dx,dy,rot,sx,sy}]
const CENA_BORIN=[[0,.9,u=>({dy:7*(1-u)-Math.abs(Math.sin(u*Math.PI*3))*1.2})],[1,.8,u=>({rot:Math.sin(u*Math.PI*4)*.02})],
  [2,.7,u=>({dy:-Math.abs(Math.sin(u*Math.PI*2))*3})],[3,.75,u=>({rot:Math.sin(u*Math.PI*6)*.07*u,dx:-2*u})],
  [4,.45,u=>({dx:-8*u,dy:-9*Math.sin(u*Math.PI)+6*u,rot:-.3*u})],[5,.85,u=>({sy:1-.14*Math.sin(Math.min(1,u*3)*Math.PI),dy:0})],
  [6,.95,u=>({dy:-Math.abs(Math.sin(u*Math.PI*4))*1.6})],[7,.85,u=>({sy:1+.05*Math.sin(u*Math.PI)})]];
const CENA_PEGA=[[1,.45,u=>({})],[2,.3,u=>({dx:1.5*u})],[3,.7,u=>({dx:Math.sin(u*40)*.9})],
  [4,.75,u=>({dy:-Math.sin(u*Math.PI)*1})],[5,.55,u=>({dy:Math.sin(u*Math.PI)*1.2})],[6,.65,u=>({})],[7,1,u=>({sy:1+.04*Math.sin(u*Math.PI*2)})]];
const cenaDur=C=>C.reduce((a,c)=>a+c[1],0);
function cenaQuadro(C,t){let a=0;for(const c of C){if(t<a+c[1])return {q:c[0],u:(t-a)/c[1],o:c[2]((t-a)/c[1]),ini:a};a+=c[1];}const c=C[C.length-1];return {q:c[0],u:1,o:c[2](1),ini:a-c[1]};}   // cena animada tocando (o Jux fica parado): {tipo, t, ...}
const PONTO_LENHA={id:'prep_lenha',x:PREP_PILHA[0],y:PREP_PILHA[1]-6,r:0};if(NA_VILA)V.pontos.push(PONTO_LENHA);
// caminho do porco em volta da fogueira (cada trecho reto e livre, acima dos postes e fora das pedras do fogo)
const CAMINHO_PORCO=[[596,632],[646,644],[662,682],[702,701],[742,704],[784,701],[824,682],[846,646],[888,640],[906,668]];
// proximo ponto: o vizinho (antes/depois no caminho) mais longe do Jux; num susto corre mais rapido
function porcoEscolhe(susto){const i=caca.i,c=[i-1,i+1].filter(k=>k>=0&&k<CAMINHO_PORCO.length);
  let melhor=c[0],md=-1;for(const k of c){const [x,y]=CAMINHO_PORCO[k],dd=Math.hypot(x-hero.x,y-hero.y);if(dd>md){md=dd;melhor=k;}}
  caca.alvo=melhor;caca.estado='corre';caca.rapido=!!susto;}
function porcoAnda(ax,ay,dd,st){st=Math.min(st,dd);bacon.x+=ax/dd*st;bacon.y+=ay/dd*st;caca.dist+=st;caca.vx=ax/dd;caca.vy=ay/dd;
  if(Math.abs(ax)>.5)caca.dir=ax<0?-1:1;caca.lado=Math.abs(ax)>=Math.abs(ay)*.6;}
const caca={on:false,toques:0,susto:0,provoca:0,vx:0,vy:0,dir:1,pega:null,dist:0,lado:true,fuga:0,final:false};
// onde o porco pode andar: a praca (acima dos postes do portao), a passagem por baixo da fogueira (entre os postes),
// fora do circulo de pedras da fogueira (antes ele entrava nas pedras e ficava preso tremendo) e longe do Bino
const porcoArea=(x,y)=>x>=574&&x<=916&&y>=626&&y<=((x>672&&x<802)?702:678);
const foraDoFogo=(x,y)=>((x-742)/74)**2+((y-648)/45)**2>1;
const porcoOk=(x,y)=>porcoArea(x,y)&&foraDoFogo(x,y)&&livre(x,y)&&Math.hypot(x-PREP_PEGA[0],y-PREP_PEGA[1])>34;
const binoLenha={on:false,x:0,y:0,dist:0,falou:0,olha:'direita'};
// abre a tarefa ao falar (antes da loja e das missoes)
function prepAbre(id){if(!emPreparo()||prepCena)return false;
  if(id==='vovo'){const f=prepFaltam();if(!f.length)return false;
    fala={linhas:[['Vovó Hilda','Ainda '+(f.length===1?'falta uma coisa':'faltam '+f.length+' coisas')+', forasteiro: '+f.map(k=>PREP_NOMES[k].toLowerCase()).join('; ')+'.'],['Vovó Hilda','Hmpf. O festival não se arruma sozinho.']],i:0,letras:0,fim:null};som(SOM.ui_vez,.5);return true;}
  if(id==='borin'&&!prepFeita('borin')){fala={linhas:[['Borin','FORASTEIRO! Segura essa escada pra mim? Não, a outra ponta!'],['Jux','Seguro. Mas eu não me responsabilizo pela gravidade.']],i:0,letras:0,
    fim:()=>{prepCena={tipo:'borin',t:0};}};som(SOM.ui_vez,.5);return true;}
  if(id==='bacon'&&!prepFeita('pao')&&!caca.on){fala={linhas:[['Jux','Sir Bacon. Isso na sua boca é o pão da Ingrid?'],['Sir Bacon','…Oinc.'],['✦','Ele dispara pela praça! Corra (Shift) e encoste no Sir Bacon 3 vezes.']],i:0,letras:0,
    fim:()=>{caca.on=true;caca.toques=0;caca.provoca=0;caca.final=false;caca.fuga=0;caca.cansa=0;caca.rota=null;
      // caminho de ida: se esta no chiqueiro, vai ate a cerca, PULA e atravessa a vila correndo ate a praca
      caca.ida=(bacon.y>730&&bacon.x<420)?[[300,774],[300,706,'pulo'],[430,704],[560,690],[646,644]]:[[646,644]];caca.idaT=0;caca.i=1;caca.estado='parado';caca.corridas=0;
      SEG.vaiPara=[PREP_PEGA[0],PREP_PEGA[1]];SEG.chegou=false;}};som(SOM.ui_vez,.5);return true;}
  if(id==='prep_lenha'&&!prepFeita('lenha')&&!binoLenha.on){fala={linhas:[['Oskar','Hm. A lenha da fogueira. Pesada.'],['Bino','…Eu levo.'],['✦','Acompanhe o Bino até a fogueira.']],i:0,letras:0,
    fim:()=>{binoLenha.indo=true;binoLenha.dist=0;binoLenha.falou=0;SEG.vaiPara=[PREP_PILHA[0]-30,676];SEG.chegou=false;}};som(SOM.ui_vez,.5);return true;}
  return false;}
// passo de cada quadro (so de dia, na fase preparo)
function ignCalorPasso(){if(!emAtaque()||atqFeitas()<3||JOGO.cap2.binoCalor||fala||ab.on)return;if(hero.y<330&&Math.abs(hero.x-790)<80){JOGO.cap2.binoCalor=true;salvaJogo();abreFala('ign_calor');}}
function prepPasso(dt){ignCalorPasso();if(!emPreparo())return;
  SEG.cena=!!(JOGO.bino&&JOGO.bino.ativo);
  // na tarefa do porco, quando o Bino chega no canto, quem aparece e a folha dele esperando (o seguidor some para nao ter dois)
  if((caca.on||(prepCena&&prepCena.tipo==='pega'))&&SEG.vaiPara)SEG.oculto=!!SEG.chegou;
  if(!prepFeita('borin')&&!(prepCena&&prepCena.tipo==='borin')){borin.x=PREP_ESCADA[0]+14;borin.y=PREP_ESCADA[1]+2;borin.olha='baixo';borin.anda=false;borin.alvo=null;}
  BORIN_PONTO.x=borin.x;BORIN_PONTO.y=borin.y-4;BORIN_PONTO.r=48;
  PONTO_LENHA.r=(!prepFeita('lenha')&&!binoLenha.on&&!binoLenha.indo)?44:0;
  if(prepCena){const C=prepCena;C.t+=dt;for(const k in teclas)teclas[k]=false;hero.alvo=null;
    if(C.tipo==='borin'){if(!C.puf&&cenaQuadro(CENA_BORIN,C.t).q>=5){C.puf=true;poeiraNeve(PREP_ESCADA[0]-8,PREP_ESCADA[1],30);abSom('impacto');clarao=Math.max(clarao,.08);}
      if(C.t>=cenaDur(CENA_BORIN)){prepCena=null;fala={linhas:[['Borin','…EU ESTOU BEM! As bandeirinhas também! É isso que importa!'],['Jux','Dez de dez na aterrissagem.']],i:0,letras:0,fim:()=>prepConclui('borin')};}}
    else if(C.tipo==='pega'){
      // o Jux da uns passos para o lado (nao fica colado no Bino) e olha para ele
      {const tx=PREP_PEGA[0]+62,ty=PREP_PEGA[1]+10,u=Math.min(1,C.t/.5);if(Math.hypot(C.jx-PREP_PEGA[0],C.jy-PREP_PEGA[1])<70){hero.x=C.jx+(tx-C.jx)*u;hero.y=C.jy+(ty-C.jy)*u;}hero.olha='esquerda';hero.dir=-1;}
      if(C.t>=cenaDur(CENA_PEGA)){prepCena=null;caca.on=false;
      SEG.x=PREP_PEGA[0];SEG.y=PREP_PEGA[1];SEG.vaiPara=null;SEG.chegou=false;SEG.oculto=false;bacon.x=PREP_PEGA[0]+26;bacon.y=PREP_PEGA[1]+4;
      fala={linhas:[['Bino','…Pão.'],['Jux','Devolve o pão, Sir. Hoje à noite você ganha um laço azul. É uma negociação justa.'],['Ingrid','MEU PÃO! Obrigada! Hoje à noite tem um pedaço guardado pra vocês!']],i:0,letras:0,fim:()=>prepConclui('pao')};}}
    return;}
  // o Sir Bacon foge do Jux pela praca
  if(caca.on&&caca.ida&&caca.ida.length){const pt=caca.ida[0];
    if(pt[2]==='pulo'){if(!caca.pulo){caca.pulo={t:0,x0:bacon.x,y0:bacon.y};abSom('whoosh');balao(bacon,'OINC!');}
      const P=caca.pulo;P.t+=dt;const u=Math.min(1,P.t/.55);bacon.x=P.x0+(pt[0]-P.x0)*u;bacon.y=P.y0+(pt[1]-P.y0)*u;caca.alto=Math.sin(u*Math.PI)*16;
      if(u>=1){caca.pulo=null;caca.alto=0;caca.ida.shift();poeiraNeve(bacon.x,bacon.y,8);}}
    else{const ax=pt[0]-bacon.x,ay=pt[1]-bacon.y,dd=Math.hypot(ax,ay),st=Math.min(dd,110*dt);
      if(dd<2)caca.ida.shift();else{bacon.x+=ax/dd*st;bacon.y+=ay/dd*st;caca.dist+=st;caca.vx=ax/dd;caca.vy=ay/dd;caca.dir=ax<0?-1:1;caca.lado=Math.abs(ax)>=Math.abs(ay)*.6;}}
    if(!caca.ida.length){caca.ida=null;caca.estado='parado';}
    if(PORCO_PONTO){PORCO_PONTO.x=bacon.x;PORCO_PONTO.y=bacon.y;}}
  else if(caca.on){   // PERSEGUICAO (refeita 2026-11-20): o porco corre por um CAMINHO FIXO em volta da fogueira, de ponto em ponto,
    // em linha reta, para o lado mais longe do Jux. Estados: 'parado' (Jux longe), 'corre', 'cansado' (ofegando: hora de pegar)
    const d=Math.hypot(bacon.x-hero.x,bacon.y-hero.y);caca.susto=Math.max(0,caca.susto-dt);
    if(caca.final){   // corrida final: pelo caminho ate o ponto 1 e dali para o lado do Bino
      if(!caca.rota){caca.rota=[];for(let k=caca.i-1;k>=1;k--)caca.rota.push(CAMINHO_PORCO[k]);caca.rota.push([PREP_PEGA[0]+24,PREP_PEGA[1]]);}
      const [tx,ty]=caca.rota[0],ax=tx-bacon.x,ay=ty-bacon.y,dd=Math.hypot(ax,ay);
      if(dd<2){if(caca.rota.length===1&&!SEG.chegou){caca.estado='parado';return;}caca.rota.shift();
        if(!caca.rota.length){caca.rota=null;prepCena={tipo:'pega',t:0,x:PREP_PEGA[0],y:PREP_PEGA[1],jx:hero.x,jy:hero.y};baloes.length=0;}return;}
      porcoAnda(ax,ay,dd,125*dt);return;}
    if(d<16&&caca.susto<=0){caca.toques++;caca.susto=.5;caca.corridas=0;abSom('whoosh');balao(bacon,caca.toques<3?'OINC!':'OINC?!');
      if(caca.toques>=3){caca.final=true;caca.estado='corre';return;}
      porcoEscolhe(true);}   // susto: corre para o lado mais longe (mais rapido)
    if(caca.estado==='cansado'){caca.tt-=dt;if(caca.tt<=0)caca.estado='parado';}
    else if(caca.estado==='parado'){if(d<100)porcoEscolhe(false);}
    else if(caca.estado==='corre'){const [tx,ty]=CAMINHO_PORCO[caca.alvo],ax=tx-bacon.x,ay=ty-bacon.y,dd=Math.hypot(ax,ay),v=caca.rapido?150:108;
      if(dd<=v*dt){bacon.x=tx;bacon.y=ty;caca.dist+=dd;caca.i=caca.alvo;caca.rapido=false;caca.corridas++;
        if(caca.corridas>=4){caca.estado='cansado';caca.tt=1.7;caca.corridas=0;balao(bacon,'(ofegante)');}
        else if(d<100)porcoEscolhe(false);else caca.estado='parado';}
      else porcoAnda(ax,ay,dd,v*dt);}
    if(PORCO_PONTO){PORCO_PONTO.x=bacon.x;PORCO_PONTO.y=bacon.y;}}
  // o Bino leva a lenha (so anda com o Jux perto)
  if(binoLenha.indo&&SEG.chegou){binoLenha.indo=false;binoLenha.on=true;binoLenha.x=SEG.x;binoLenha.y=SEG.y;SEG.oculto=true;abSom('impacto');}   // chegou na pilha: pega a lenha
  if(binoLenha.on){const B=binoLenha,ax=PREP_FOGO[0]-B.x,ay=PREP_FOGO[1]-B.y,d=Math.hypot(ax,ay),perto=Math.hypot(hero.x-B.x,hero.y-B.y)<70;
    if(d<6){B.on=false;SEG.x=B.x;SEG.y=B.y;SEG.vaiPara=null;SEG.chegou=false;SEG.oculto=false;for(let i=0;i<30;i++)poeira.push({x:PREP_FOGO[0]+rnd(-10,10),y:PREP_FOGO[1]-rnd(0,20),vx:rnd(-40,40),vy:rnd(-90,-20),v:0});abSom('impacto');clarao=Math.max(clarao,.25);
      fala={linhas:[['✦','O Bino joga a lenha na fogueira. As chamas sobem alto.'],['Bino','…Pronto.'],['Jux','Você carregou uma floresta e nem suou.'],['Bino','…Suei por dentro.']],i:0,letras:0,fim:()=>prepConclui('lenha')};}
    else if(perto){const v=Math.min(d,30*dt);B.x+=ax/d*v;B.y+=ay/d*v;B.dist+=v;B.olha=Math.abs(ax)>Math.abs(ay)?'lado':'frente';B.dir=ax<0?-1:1;
      if(B.falou===0&&d<170){B.falou=1;balao(hero,'Quer ajuda?');setTimeout(()=>balao(B,'…Não.'),1300);}
      if(B.falou===1&&d<90){B.falou=2;balao(hero,'Você carrega isso e eu carrego a conversa.');setTimeout(()=>balao(B,'…Hm.'),1800);}}
    else if(Math.random()<dt*.25)balao(B,'…');}}
// desenho de um quadro de uma folha dos preparativos
// com movimento: desloca, gira e estica em volta do pe (o que deixa a cena fluida entre um quadro e outro)
function prepQuadroT(k,q,x,y,o){const D=PREP_D[k],I=PREP_I[k];if(!D||!I||!I.complete)return false;o=o||{};const s=D.escala;
  ctx.save();ctx.translate(x+(o.dx||0),y+(o.dy||0));if(o.rot)ctx.rotate(o.rot);ctx.scale((o.esp?-s:s)*(o.sx||1),s*(o.sy||1));
  ctx.drawImage(I,q*D.w,0,D.w,D.h,-D.ancora[0],-D.ancora[1],D.w,D.h);ctx.restore();return true;}
function prepQuadro(k,q,x,y,espelho){const D=PREP_D[k],I=PREP_I[k];if(!D||!I||!I.complete)return false;desenhaNpc(D,I,x,y,q,!!espelho,12,46);return true;}
// marca '!' em cima de quem tem tarefa
function prepMarca(x,y){const by=y+Math.sin(t*5)*1.5;ctx.save();ctx.fillStyle='#ffe27a';ctx.strokeStyle='#2a1a00';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(x,by,5,6,0,0,6.283);ctx.fill();ctx.stroke();
  ctx.fillStyle='#2a1a00';ctx.font='bold 9px "Trebuchet MS"';ctx.textAlign='center';ctx.fillText('!',x,by+3);ctx.restore();}
// o que desenhar no mundo, ordenado pela altura do pe (entra na lista npcs)
function prepDesenhos(){if(!emPreparo())return [];const L=[];
  // a escada (antes da cena) ou o monte de neve (depois)
  if(!prepFeita('borin')&&!(prepCena&&prepCena.tipo==='borin'))L.push([PREP_ESCADA[1]-1,()=>prepQuadro('obj_escada',0,PREP_ESCADA[0],PREP_ESCADA[1])]);
  if(prepFeita('borin'))L.push([PREP_ESCADA[1]-30,()=>prepQuadro('obj_neve',0,PREP_ESCADA[0],PREP_ESCADA[1])]);
  if(prepCena&&prepCena.tipo==='borin'){const c=cenaQuadro(CENA_BORIN,prepCena.t);L.push([PREP_ESCADA[1]+1,()=>prepQuadroT('borin_escada',c.q,PREP_ESCADA[0],PREP_ESCADA[1],c.o)]);}
  // a pilha de lenha (grande antes, pequena depois)
  L.push([PREP_PILHA[1],()=>prepQuadro(prepFeita('lenha')||binoLenha.on?'obj_pilha_peq':'obj_pilha',0,PREP_PILHA[0],PREP_PILHA[1])]);
  if(binoLenha.on){const B=binoLenha,f=B.dist/7,n=Math.floor(f)%4;L.push([B.y,()=>prepQuadroT('bino_lenha',B.olha==='lado'?n:4+n,B.x,B.y,{esp:B.olha==='lado'&&B.dir<0,dy:-Math.abs(Math.sin(f*Math.PI))*1.1,rot:Math.sin(f*Math.PI)*.02})]);}
  if(caca.on&&SEG.chegou&&!(prepCena&&prepCena.tipo==='pega'))L.push([PREP_PEGA[1],()=>prepQuadroT('bino_pega',0,PREP_PEGA[0],PREP_PEGA[1],{sy:1+.015*Math.sin(t*2.2)})]);
  if(prepCena&&prepCena.tipo==='pega'){const C=prepCena,c=cenaQuadro(CENA_PEGA,C.t);L.push([C.y,()=>prepQuadroT('bino_pega',c.q,C.x,C.y,c.o)]);}
  // marcas '!'
  L.push([2000,()=>{if(prepCena)return;
    if(!prepFeita('borin'))prepMarca(borin.x,borin.y-70);
    if(!prepFeita('pao')&&!caca.on)prepMarca(bacon.x,bacon.y-30);
    if(!prepFeita('lenha')&&!binoLenha.on&&!binoLenha.indo)prepMarca(PREP_PILHA[0],PREP_PILHA[1]-52);}]);
  return L;}
// o Sir Bacon fujao (com o pao) no lugar do desenho normal
function desenhaBaconCaca(){if(!emPreparo()||!(caca.on||(prepCena&&prepCena.tipo==='pega')))return false;
  if(prepCena&&prepCena.tipo==='pega')return true;   // na cena ele esta na folha do Bino
  const corre=!!caca.ida||caca.final||caca.estado==='corre',f=caca.dist/9,n=Math.floor(f)%4;
  let q,esp=false,dy=0,sy=1;
  if(caca.pulo){q=7;esp=caca.dir<0;dy=-(caca.alto||0);}
  else if(caca.susto>.25){q=7;esp=caca.dir<0;dy=-4*Math.sin((.5-caca.susto)/.25*Math.PI);}
  else if(corre){dy=-Math.abs(Math.sin(f*Math.PI/2))*1.3;if(caca.lado){q=n;esp=caca.dir<0;}else q=4+(Math.floor(f/2)%2);}
  else{q=6;esp=hero.x>bacon.x;if(caca.estado==='cansado')sy=1+.06*Math.sin(t*9);}   // parado olhando o Jux (provocando); cansado: ofegando
  return prepQuadroT('bacon_pao',q,bacon.x,bacon.y,{esp,dy,sy});}
function halvardVila(){if(!NA_VILA||ANDARILHOS.some(n=>n.id==='halvard'))return;if(JOGO.cap2&&JOGO.cap2.halvardMorreu)return;   // Parte D: o Halvard morreuif(typeof estadoMissao!=='function'||estadoMissao('olhos_roxos')!=='feita')return;
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
  if(!AG)return;if(emFestival()){desenhaVentoFesta();return;}AG.bandeiras.forEach((b,i)=>{const bw=b[2]-b[0];
    for(let y=b[1];y<b[3];y+=2){const f=(y-b[1])/(b[3]-b[1]),dx=(Math.sin(t*2.6+y*.13+i*1.9)*1.1+vento*2.2)*f;
      ctx.drawImage(MAPA,b[0]*K,y*K,bw*K,2*K,b[0]+dx,y,bw,2);}});
}
// VENTO NA FESTA (2026-11-20, pedido: 'as bandeiras e lanternas ficaram paradas'): o mapa da festa tem as proprias bandeiras e lanternas
// desenhadas; aqui elas balancam no vento deslocando as linhas da imagem (o topo fica preso, a ponta balanca mais)
const FEST_BAND=[[572,196,602,258],[918,196,950,258],[532,680,565,745],[906,680,940,745],[527,795,562,868],[910,795,946,868],
  [138,435,175,512],[365,410,402,488],[1113,495,1142,552],[678,120,702,172]];
const FEST_LANT=[[720,362,734,405],[665,415,681,460],[710,452,726,498],[760,452,776,500],[810,410,826,458],[864,360,879,400],[932,420,951,462],[550,450,571,490],
  [586,455,614,510],[626,460,651,515],[801,460,826,515],[839,450,866,505],[916,445,941,503]];
// no mapa do ataque: as bandeiras rasgadas (postes, portao e as fitas da arvore) e as 4 lanternas apagadas da arvore
const ATQ_BAND=[[568,196,602,262],[918,196,952,262],[538,662,576,755],[902,672,942,755],[608,458,656,545],[872,470,904,522],[466,470,498,520],[1068,470,1100,520]];
const ATQ_LANT=[[570,460,601,521],[799,444,829,519],[839,438,869,503],[911,424,943,495]];
// no mapa da manha (o memorial): as bandeiras dos postes e do portao, os varais de bandeirinhas das barracas e as 7 lanternas da arvore
const MANHA_BAND=[[570,193,602,257],[918,193,952,257],[528,688,570,745],[912,688,952,748],[405,520,560,575],[930,520,1095,585]];
const MANHA_LANT=[[589,455,613,512],[627,468,651,522],[659,432,683,485],[803,450,829,514],[844,440,871,504],[891,430,915,482],[921,440,947,497]];
function desenhaVentoFesta(){const BAND=emAtaque()?ATQ_BAND:emManha()?MANHA_BAND:FEST_BAND,LANT=emAtaque()?ATQ_LANT:emManha()?MANHA_LANT:FEST_LANT;
  BAND.forEach((b,i)=>{const bw=b[2]-b[0];
    for(let y=b[1];y<b[3];y+=2){const f=(y-b[1])/(b[3]-b[1]),dx=(Math.sin(t*2.8+y*.12+i*1.9)*2.2+vento*3)*f;
      ctx.drawImage(MAPA,b[0]*K,y*K,bw*K,2*K,b[0]+dx,y,bw,2);}});
  LANT.forEach((b,i)=>{const bw=b[2]-b[0],a=Math.sin(t*1.7+i*1.37)*.06+vento*.03;
    for(let y=b[1];y<b[3];y+=1){const dx=(y-b[1])*a;ctx.drawImage(MAPA,b[0]*K,y*K,bw*K,K,b[0]+dx,y,bw,1);}});}
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

// pose do Jux ao conversar: na vila de luto e no ataque ele fica em pe, serio (as poses alegres, como 'rindo', pareciam ele passando mal)
const poseFala=id=>(lutoAtivo()||emAtaque()||(JOGO.cap2&&JOGO.cap2.fase==='fim'))?null:(POSE_FALA[id]||null);
const POSE_FALA={inicio:'surpreso',fogueira:'sentado',bacon:'rindo',tico:'rindo',borin:'confiante',ingrid:'acenar',oskar:'confiante',barraca_comida:'acenar',barraca_bebida:'acenar',poco:'examinar',arvore:'examinar',ferraria:'examinar',vovo:'examinar',portao:'confiante',pulo:'confiante',altar_escolha:'examinar',altar_ganha:'confiante',altar:'confiante'};
// passagem entre regioes: a fala so aparece na PRIMEIRA vez (pedido do usuario); depois o Jux ja passa direto
function passa(id,acao){JOGO.passou=JOGO.passou||{};if(JOGO.passou[id]){acao();return;}abreFala(id,()=>{JOGO.passou[id]=true;acao();});}
function abreFala(id,fim){if(id.startsWith('tes_')){pegaTesouro(id.slice(4));return;}
  if(emManha()&&!fim){const px=partProximo();
    if(id==='tico_altar'){ticoAltar();return;}
    if(id==='vovo'&&px==='adeus'){tocaFilme(CENAS_ADEUS,IMG_ADEUS,()=>{partMarca('adeus');aviso('O Tico subiu sozinho para o altar…','#c8d8f0');});return;}
    if(id==='vovo'&&px==='lanterna'){id='manha_vovo_espera';}
    else if(id==='vovo'&&px==='cristais'){tocaFilme(CENAS_CRISTAIS,IMG_CRISTAIS,()=>{partMarca('cristais');aviso('Vá até o portão quando estiver pronto.','#ffe27a');});return;}
    else if(id==='vovo'&&!px){id='manha_vovo_fim';}
    if(id==='portao'||id==='entrada_trilha'){if(px==='partida'){tocaFilme(CENAS_PARTIDA,IMG_PARTIDA,()=>{partMarca('partida');fimCapitulo2();});return;}if(px){id='manha_portao_cedo';}}
    if(id==='ingrid'&&FALAS.manha_ingrid){fim=()=>{if(typeof encheVida==='function')encheVida();aviso('A sopa do Halvard: HP e MP cheios','#7dffa8');};}}
  // vila em ataque: o portao nao abre; as lutas comecam depois da fala
  if(emAtaque()&&!fim){if(id==='altar'){if(atqFeitas()>=3)altarIgnarok();else aviso('Primeiro, a vila. As Sombras ainda estão lá embaixo.','#c8d8f0');return;}
    if((id==='portao'||id==='entrada_trilha')&&!(atqFeitas()>=3&&cap1Trava()))id='atq_portao';else if(ATQ_LUTAS.some(l=>l.id===id)){const lid=id;fim=()=>atqLuta(lid);}}
  if(!fim&&prepAbre(id))return;   // preparativos do festival (FICHA_PREPARATIVOS.md)
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
  // depois do fim do Capitulo 2: o portao pergunta se desce ao rio (Capitulo 3) ou vai para a trilha
  if(id==='portao'&&!fim&&REGIAO==='vila'&&JOGO.cap2&&JOGO.cap2.fase==='fim'&&typeof UI==='object'){UI.escolha={id:'rio_cap3',ops:['Descer até o rio (Capítulo 3)','Ir para a trilha','Ficar na vila'],sel:0};som(SOM.ui_vez,.5);return;}
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
  if(id==='prova_fenrir'&&!fim){if(provaFenrirEstado()==='vencida'){tocaFilme(CENAS_FENRIR_V,IMG_FENRIR_V,()=>{concluiProvaFenrir();espiritoFenrir();});return;}else abreFala('prova_fenrir',()=>{UI.escolha={id:'prova',ops:['Lutar agora','Ainda não'],sel:0};som(SOM.ui_vez,.5);});return;}
  if(id==='prova_vence'&&!fim)return;
  if(id==='santuario'&&!fim){abreFala('santuario',()=>{if(typeof encheVida==='function')encheVida();salvaVila();aviso('HP e MP recuperados · Jogo salvo!','#7dffa8');});return;}if(id.startsWith('col_')){pegaColeta(id.slice(4));return;}if(!UI.pulaLoja&&uiFala(id))return;
  if(!UI.soConversa&&typeof missaoFala==='function'){const mf=missaoFala(id);if(mf){hero.pose=poseFala(id);hero.parado=0;hero.alvo=null;hero.pontoAlvo=null;fala={linhas:mf.linhas,i:0,letras:0,fim:()=>{if(mf.fim)mf.fim();if(fim)fim();}};som(SOM.ui_vez,.5);return;}}if(id==='bacon')oinc(.85);if(id==='altar'&&!hero.espada){filmeEspada();return;}hero.pose=poseFala(id);hero.parado=0;if(!FALAS[id]){if(fim)fim();return;}   // ponto sem fala escrita: nao trava o jogo (bug do Tunel das correntes)
  if(!fim&&id==='vovo'&&JOGO.cap2&&['volta','preparo','noite'].includes(JOGO.cap2.fase)&&cap1Trava()){falaPendencias('vovo');return;}   // trava: a historia so anda com o Capitulo 1 completo
  if(!fim&&emFestival()&&FEST_EFEITO[id])fim=FEST_EFEITO[id];
  if(!fim&&id==='vovo'&&diaFestival())fim=JOGO.cap2.fase==='preparo'?anoitecer:()=>{JOGO.cap2.fase='preparo';salvaJogo();aviso('Nova tarefa: Preparativos do festival (veja no canto da tela)','#ffe27a');};
  fala={linhas:FALAS[falaDaFase(id)],i:0,letras:0,fim};hero.alvo=null;hero.pontoAlvo=null;som(SOM.ui_vez,.5);}
// falas que mudam com a historia (pedido 2026-11-19): antes da espada / depois da espada / depois do resgate do Halvard
function falaDaFase(id){if(emAtaque()&&FALAS['atq_fala_'+id])return 'atq_fala_'+id;if(emManha()&&FALAS['manha_'+id])return 'manha_'+id;if(FALAS[id]&&id.startsWith('manha_'))return id;if(emFestival()&&FALAS['fest_'+id])return 'fest_'+id;
  if(diaFestival()){if(id==='vovo')return JOGO.cap2.fase==='preparo'?'dia2_vovo':'dia_vovo';if(FALAS['dia_'+id])return 'dia_'+id;}
  const res=typeof estadoMissao==='function'&&estadoMissao('olhos_roxos')==='feita';
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
// quem tem corpo agora (so quem esta visivel no mapa): elipse nos pes; so bloqueia chegando MAIS perto (nunca prende o Jux)
function corposNpc(){if(!NA_VILA)return [];if(emAtaque()){const L=(JOGO.cap2&&JOGO.cap2.lutas)||{},o=[vovo];if(L.atq_2)o.push(borin);for(const n of ANDARILHOS)if(ATQ_SALVO[n.id]&&L[ATQ_SALVO[n.id]])o.push(n);return o;}
  const o=[tico,vovo,borin,...ANDARILHOS,...FIGURANTES];o.push(bacon);return o.filter(n=>n&&isFinite(n.x));}
function npcBloqueia(x,y,x0,y0){for(const n of corposNpc()){const rx=n===bacon?11:8,ry=5,d=((x-n.x)/rx)**2+((y-n.y)/ry)**2;
  if(d<1&&d<((x0-n.x)/rx)**2+((y0-n.y)/ry)**2)return n;}return null;}
function pontoPerto(){atqPontosPasso();MEMORIAL.r=emManha()?40:0;let m=null,md=1e9;for(const p of V.pontos){if(emAtaque()&&!atqPode(p.id))continue;const d=Math.hypot(hero.x-p.x,hero.y-p.y);if(d<p.r&&d<md){m=p;md=d;}}return m;}


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
const PROVAS={fenrir:{tipos:['fenrir_prova'],nv:12},skoll:{tipos:['skoll'],nv:9},acolito:{tipos:['acolito'],nv:8},
  // Cap. 2, Parte B (FICHA_CAP2_ATAQUE.md): as 3 lutas da vila em ataque (nivel fixo, como as outras provas). Calibrado 2026-11-20 com
  // luta automatica (Jux nv 13 + Bino nv 12, equipamento da forja): menor HP na luta entre ~33% e 60%
  // Ignarok calibrado 2026-11-20 (luta automatica, Jux nv14 + Bino nv13 com equipamento de aco): vence com o Jux a 19% e o Bino caido (padrao do Fenrir: 16%) // 2026-11-21 ('extremamente forte, diminuir um pouquinho'): hp 6->5.5, forca 1.5->1.4; depois ('ainda muito forte') hp 5, forca 1.3
  // 2026-11-20 (usuario: 'muito facil'): mais vida e forca
  ignarok:{tipos:['ignarok_chefe'],nv:16,chefe:{nome:'Ignarok',hp:5,forca:1.3,exp:6}},
  atq_1:{tipos:['sombra_oskar','acolito','acolito'],nv:13,chefe:{nome:'Sombra do Oskar',hp:4.5,forca:1.65,exp:2}},
  atq_2:{tipos:['sombra_borin','acolito'],nv:13,chefe:{nome:'Sombra do Borin',hp:4,forca:1.7,exp:2}},
  atq_3:{tipos:['sombra_ingrid','acolito','acolito'],nv:14,chefe:{nome:'Sombra da Ingrid',hp:4.5,forca:1.7,exp:2.2}}};
// a folha da Sombra do Borin ainda nao chegou como arquivo (ref/inimigos/sombra_borin.png): ate la a luta 2 espera
const BORIN_FOLHA=true;   // lutas fixas: o nivel NAO acompanha o heroi
for(const c of MINICHEFES)PROVAS['chefe_'+c.id]={tipos:[c.tipo],nv:c.nv,chefe:{nome:c.nome,hp:c.hp,forca:c.forca,exp:c.exp}};
// luta da vila em ataque (as folhas das Sombras ainda estao chegando: por enquanto so avisa e nao conta)
function atqLuta(id){if(id==='atq_2'&&!BORIN_FOLHA){aviso('Esta luta chega quando a folha da Sombra do Borin estiver pronta.','#ffe27a');return;}
  try{sessionStorage.setItem('jux_atq_luta',id);}catch(e){}iniciaProva(id);}
// CURA ANTES DA LUTA (ficha aprovada 2026-11-21: 'sair de uma luta mal e entrar noutra quase morto'): antes de uma luta da
// historia, se o Jux ou o Bino estiver abaixo de 70% (ou caido), pergunta: curar com pocoes / abrir a bolsa / lutar assim
function grupoFerido(){if(typeof grupoMenu!=='function'||typeof vidaAtual!=='function')return [];return grupoMenu().map(q=>[q,vidaAtual(q)]).filter(([q,v])=>v.hp<=0||v.hp<v.max*.7);}
function iniciaProva(nome,semPerguntar){if(transicao)return;
  if(!semPerguntar&&typeof UI==='object'&&grupoFerido().length){const linhas=grupoMenu().map(q=>{const v=vidaAtual(q);return NOME_GRUPO[q]+': '+(v.hp<=0?'CAÍDO':v.hp+' / '+v.max+' HP');});
    hero.alvo=null;hero.pontoAlvo=null;for(const k in teclas)teclas[k]=false;
    UI.escolha={id:'cura_luta',prova:nome,titulo:['Vocês estão feridos.','Curar antes de lutar?',...linhas],ops:['Curar com poções','Abrir a bolsa','Lutar assim'],sel:0};som(SOM.ui_vez,.5);return;}transicao=.001;hero.alvo=null;hero.pontoAlvo=null;for(const k in teclas)teclas[k]=false;
  som(SOM.whoosh,.8);if(MUS)MUS.pause();
  try{localStorage.setItem('jux_encontro',JSON.stringify({regiao:REGIAO,tipos:PROVAS[nome].tipos,nv:PROVAS[nome].nv,volta:REGIAO+'.html'+((window.__semSalvar||window.__modoTeste)&&['#ataque','#altar','#invasao'].includes(location.hash.split('?')[0])?location.hash.split('?')[0]:''),prova:nome,chefe:PROVAS[nome].chefe||null}));}catch(e){}
  salvaVila();setTimeout(()=>{paraAudio();location.href=jp('batalha.html');},1100);}
function iniciaEncontro(){if(transicao)return;transicao=.001;hero.alvo=null;hero.pontoAlvo=null;UI.menu=false;UI.loja=null;UI.escolha=null;for(const k in teclas)teclas[k]=false;
  som(SOM.whoosh,.8);if(MUS)MUS.pause();
  const [a,b]=ENC.nv,nv=Math.max(1,Math.round(a+Math.random()*(b-a)));
  const tipos=sorteiaGrupo(),elite=tipos.includes('lobo')&&Math.random()<(ENC.alfa||.08);   // 8%: um LOBO ALFA (mais forte, paga 3x EXP e gil)
  try{localStorage.setItem('jux_encontro',JSON.stringify({regiao:REGIAO,tipos,nv:elite?nv+1:nv,volta:ENC.volta,elite}));}catch(e){}
  salvaVila();setTimeout(()=>{paraAudio();location.href=jp('batalha.html');},1100);}
// tela quebrando em cacos de gelo antes da luta
// "NAQUELA NOITE..." (ligacao do Capitulo 2): a tela escurece, aparece o texto, o mapa vira o da festa e a tela clareia na praca
let noiteFade=null;
function anoitecer(){if(noiteFade)return;noiteFade={t:0,virou:false};if(JOGO.cap2&&!JOGO.cap2.premio){JOGO.cap2.premio=true;daItem('pao_mel',1);JOGO.gil=(JOGO.gil||0)+100;aviso('A Vovó agradece: Pão de Mel e 100 gil','#ffe27a');}hero.alvo=null;hero.pontoAlvo=null;}
function noiteFadePasso(dt){const N=noiteFade;if(!N)return;N.t+=dt/(N.k||1);for(const k in teclas)teclas[k]=false;hero.alvo=null;
  if(!N.virou&&N.t>=1.4&&N.vira){N.virou=true;N.vira();}
  if(N.fim&&N.t>=4.6){const f=N.fim;noiteFade=null;setTimeout(f,300);return;}
  if(!N.virou&&N.t>=1.4){N.virou=true;SEG.cena=false;SEG.vaiPara=null;SEG.oculto=false;JOGO.cap2.fase='noite';salvaJogo();aplicaFestival();festaPoe();hero.x=722;hero.y=716;hero.olha='cima';}
  if(N.t>=4.6){noiteFade=null;setTimeout(()=>abreFala('fest_chega'),300);}}
function desenhaNoiteFade(){const N=noiteFade;if(!N)return;const a=N.t<1.4?N.t/1.4:N.t<3.4?1:Math.max(0,1-(N.t-3.4)/1.2);
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='rgba(2,4,14,'+a+')';ctx.fillRect(0,0,W,H);
  if(N.t>1.6&&N.t<3.6){const b=Math.min(1,(N.t-1.6)/.5,(3.6-N.t)/.5);ctx.globalAlpha=b;texto(N.txt||'Naquela noite…',W/2,H/2,N.txt2?26:30,'#ffe9b8','center');if(N.txt2)texto(N.txt2,W/2,H/2+40,18,'#c8d8f0','center');}
  ctx.restore();}
function desenhaTransicao(){desenhaNoiteFade();if(!transicao)return;transicao=Math.min(1,transicao+.022);const p=transicao;
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
// CUTSCENE DE VITORIA DO FENRIR (CINE_FENRIR_VITORIA.md, aprovada 2026-11-20): ao voltar da prova vencida, no circulo do Pico.
// Substitui a conversa prova_vence. Cena de historia: o Jux e o Bino aparecem. O Fenrir fala em legenda (pensamento).
// Vozes: assets/cine_fenrir_vitoria/voz_fenrir_v_* (ROTEIRO_VOZ_FENRIR_VITORIA.md; silencio cortado e volume igualado a -17 LUFS).
const CENAS_FENRIR_V=[
  {img:'cena_1',mus:'fenrir',cam:[.5,.55,1.12, .52,.5,1.0],dur:7,fx:'neve',vozes:[[2,'fv1']],falas:[[2,'Jux','…Eu ganhei? De um lobo do tamanho de um cavalo?']],sons:[[.3,'rosna']]},
  {img:'cena_2',mus:'fenrir',cam:[.6,.5,1.0, .55,.48,1.1],dur:12.5,fx:'neve',vozes:[[9,'fv2']],falas:[[.8,'Fenrir','Você luta como quem protege alguém.',3],[4.6,'Fenrir','Mil caçadas, e poucos me fizeram recuar.',3],[9,'Bino','…Ele lutou limpo.']],sons:[]},
  {img:'cena_3',mus:'fenrir',cam:[.45,.55,1.0, .42,.6,1.12],dur:8.5,fx:'neve',vozes:[],falas:[[.9,'Fenrir','Sua lâmina é de gelo, como a minha. A minha lealdade é sua, Portador.',3]],sons:[[.3,'brilho']]},
  {img:'cena_4',mus:'fenrir',cam:[.5,.6,1.0, .5,.4,1.14],dur:13,fx:'neve',vozes:[[2.8,'fv4']],falas:[[2.8,'Aurora','O Eco da Lâmina. O Fenrir caçava ao lado dos heróis antigos. Agora caça ao seu lado.',1]],sons:[[.1,'uivo'],[.6,'whoosh2'],[1.4,'gelo']],treme:[.4,1.6],flash:.16},
  {img:'cena_5',mus:'fenrir',cam:[.55,.45,1.1, .6,.42,1.0],dur:9,fx:'neve',vozes:[[.8,'fv5j'],[5.6,'fv5b']],falas:[[.8,'Jux','Bem-vindo à equipe. O salário é em gil e elogios.'],[5.6,'Bino','…Hm.']],sons:[[.2,'brilho']]},
];
for(const [k,f] of [['fv1','1_jux'],['fv2','2_bino'],['fv4','4_aurora'],['fv5j','5_jux'],['fv5b','5_bino']])VOZES[k]=arq('assets/cine_fenrir_vitoria/voz_fenrir_v_'+f);
const IMG_FENRIR_V=imgsFilme(CENAS_FENRIR_V.map(c=>'assets/cine_fenrir_vitoria/'+c.img+'.jpg'));
if(REGIAO==='pico'&&location.hash==='#cine_fenrir_v')setTimeout(()=>tocaFilme(CENAS_FENRIR_V,IMG_FENRIR_V,()=>espiritoFenrir()),1500);   // lab
// CUTSCENE "A AURORA PRETA" (FICHA_CAP2_ATAQUE.md, aprovada 2026-11-20): o brinde da Vovo vira o ataque da Ordem.
// Cena 1 com a musica da festa; da 2 em diante 'The Confrontation' (Umplix, CC0). Vozes: assets/cine_ataque/voz_ataque_* (ROTEIRO_VOZ_ATAQUE.md).
// O Arauto fala em vermelho (tipo 2); a Aurora em azul (tipo 1).
const CENAS_ATAQUE=[
  {img:'cena_1',mus:'festa',cam:[.5,.5,1.0, .5,.42,1.12],dur:12.5,fx:'neve',vozes:[[.8,'at1v'],[8.4,'at1j']],falas:[[.8,'Vovó Hilda','Para a Rainha do Inverno. Que o gelo guarde Invernália por mais um ano.'],[8.4,'Jux','Pela Rainha. E pelo ensopado da Ingrid.']],sons:[[.3,'brilho']]},
  {img:'cena_2',mus:'ataque',cam:[.5,.55,1.0, .45,.3,1.14],dur:9,fx:'neve',vozes:[[1.6,'at2t'],[5,'at2a']],falas:[[1.6,'Tico','Pai… o céu tá apagando.'],[5,'Aurora','Portador. Eles chegaram.',1]],sons:[[.1,'quebra'],[.5,'whoosh2']],treme:[.1,1.1],flash:.05},
  {img:'cena_3',mus:'ataque',cam:[.4,.6,1.12, .62,.4,1.0],dur:8.5,fx:'neve',vozes:[[1.4,'at3b'],[3.2,'at3j']],falas:[[1.4,'Bino','…Ordem.'],[3.2,'Jux','Vocês não estavam na lista de convidados.']],sons:[[.2,'rosna']]},
  {img:'cena_4',mus:'ataque',cam:[.55,.5,1.0, .5,.55,1.12],dur:9.5,fx:'neve',vozes:[[.9,'at4i'],[5.6,'at4v']],falas:[[.9,'Ingrid','Jux… eu não consigo… parar…'],[5.6,'Vovó Hilda','Tico, para dentro! AGORA!']],sons:[[.2,'whoosh2'],[5.4,'impacto']],treme:[5.4,6.4]},
  {img:'cena_5',mus:'ataque',cam:[.62,.45,1.0, .55,.42,1.14],dur:22.5,fx:'escuro',vozes:[[1,'at5a'],[11.6,'at5b'],[19,'at5j']],falas:[[1,'Arauto','O forasteiro sem sombra. Você não pode ser esvaziado… mas eles podem.',2],[11.6,'Arauto','Vamos ver quanto tempo você aguenta vê-los chorar.',2],[19,'Jux','…Tá. Agora você me irritou.']],sons:[[.2,'whoosh'],[18.7,'gelo']],treme:[.2,1]},
];
for(const [k,f] of [['at1v','1_vovo'],['at1j','1_jux'],['at2t','2_tico'],['at2a','2_aurora'],['at3b','3_bino'],['at3j','3_jux'],['at4i','4_ingrid'],['at4v','4_vovo'],['at5a','5_arauto_1'],['at5b','5_arauto_2'],['at5j','5_jux']])VOZES[k]=arq('assets/cine_ataque/voz_ataque_'+f);
const IMG_ATAQUE=imgsFilme(CENAS_ATAQUE.map(c=>'assets/cine_ataque/'+c.img+'.jpg'));
// TESTE (sem salvar): vila.html#ataque abre a vila ja em ataque; vila.html#brinde abre a festa com a Vovo pronta para o brinde
if(REGIAO==='vila'&&location.hash.split('?')[0]==='#invasao'){window.__modoTeste=true;
  if(localStorage.getItem('jux_teste_ativo')==='novo'){localStorage.setItem('jux_teste_ativo','1');JOGO.cap2={fase:'noite'};JOGO.provas=Object.assign(JOGO.provas||{},{fenrir:'feita'});for(const k of ['atq_1','atq_2','atq_3','ignarok'])delete JOGO.provas[k];
    JOGO.bino=Object.assign(JOGO.bino||{},{ativo:true,nivel:Math.max(1,(JOGO.bino||{}).nivel||1)});JOGO.vila=Object.assign(JOGO.vila||{},{espada:true,abertura:true});hero.espada=true;hero.x=722;hero.y=716;
    JOGO.tut=Object.assign(JOGO.tut||{},{andar:true,habilidade:true,missao_npc:true,missao:true,grupo:true,equip:true,hab_nova:true,comida:true,eco:true,luta:true,ressonancia:true});
    if(/[?&]forte/.test(location.hash)){   // #invasao?forte: Jux e Bino no nivel 18 com o melhor equipamento ate ai e a bolsa cheia (so na copia)
      const NV=18;JOGO.nivel=Math.max(JOGO.nivel||1,NV);JOGO.exp=0;JOGO.bino.nivel=Math.max(JOGO.bino.nivel||1,NV);JOGO.bino.exp=0;
      JOGO.equip=Object.assign(EQ_VAZIO(),{arma:'esp_aco',elmo:'elmo_ferro',armadura:'cota_malha',luvas:'luvas_ferr',botas:'botas_neve',acessorio:'amuleto_vida',acessorio2:'presa_anciao'});
      JOGO.equipDe=Object.assign(JOGO.equipDe||{},{bino:Object.assign(EQ_VAZIO(),{arma:'mar_aco',elmo:'elmo_ferro',armadura:'cota_malha',luvas:'luvas_ferr',botas:'botas_neve',acessorio:'amuleto_vida',acessorio2:'anel_gelo'})});
      JOGO.inv=Object.assign(JOGO.inv||{},{hipocao:30,pocao:30,eter:20,fenix:15,elixir:8,remedio:10});JOGO.gil=Math.max(JOGO.gil||0,3000);delete JOGO.vida;JOGO.buff=null;
      // 2026-11-21 ('nao quero fazer as missoes de novo'): todo o Capitulo 1 feito (missoes, provas, o Eco do Fenrir) e ja comeca NA INVASAO
      for(const k in MISSOES)if(!/^(atq|ignarok|cap2)/.test(k))estMissoes()[k]={st:'feita'};
      for(const k in PROVAS)if(!['atq_1','atq_2','atq_3','ignarok'].includes(k))estProvas()[k]='feita';
      {const E=estadoEcos();if(!E.tem.includes('lamina'))E.tem.push('lamina');E.pe.lamina=Math.max(E.pe.lamina||0,2195);if(!donoEco('lamina'))equipaEco('lamina','jux');
        for(const h of ['golpe_duplo','perfurante'])if(!vagaEco('jux').equipadas.includes(h))vagaEco('jux').equipadas.push(h);}
      JOGO.cap2={fase:'ataque',lutas:{}};hero.x=722;hero.y=716;}
    salvaJogo();}
  setTimeout(()=>aviso('TESTE DA INVASÃO: seu personagem, numa cópia. Para voltar ao save de verdade, abra o jogo sem #invasao.','#ffe27a'),1800);}
if(REGIAO==='vila'&&location.hash.split('?')[0]==='#manha'){window.__semSalvar=true;JOGO.missoes=Object.assign(JOGO.missoes||{},{olhos_roxos:{st:'feita'}});JOGO.provas=Object.assign(JOGO.provas||{},{fenrir:'feita'});JOGO.cap2={fase:'manha',e:{},halvardMorreu:true,preco:true,lutas:{atq_1:true,atq_2:true,atq_3:true}};JOGO.bino=Object.assign(JOGO.bino||{},{ativo:true,nivel:Math.max(1,(JOGO.bino||{}).nivel||1)});
  JOGO.vila=Object.assign(JOGO.vila||{},{espada:true,abertura:true});hero.espada=true;hero.x=722;hero.y=716;JOGO.tut=Object.assign(JOGO.tut||{},{andar:true,habilidade:true,missao_npc:true,missao:true,grupo:true,equip:true,hab_nova:true,comida:true,eco:true,luta:true,ressonancia:true});
  setTimeout(()=>{aviso('Modo teste da manhã: nada é salvo','#ffe27a');abreFala('manha_chega');},1800);}
if(REGIAO==='vila'&&location.hash.split('?')[0]==='#altar'){window.__semSalvar=true;JOGO.cap2={fase:'ataque',lutas:{atq_1:true,atq_2:true,atq_3:true},binoCalor:false};JOGO.bino=Object.assign(JOGO.bino||{},{ativo:true,nivel:Math.max(1,(JOGO.bino||{}).nivel||1)});
  JOGO.vila=Object.assign(JOGO.vila||{},{espada:true,abertura:true});hero.espada=true;hero.x=790;hero.y=420;JOGO.tut=Object.assign(JOGO.tut||{},{andar:true,habilidade:true,missao_npc:true,missao:true,grupo:true,equip:true,hab_nova:true,comida:true,eco:true,luta:true,ressonancia:true});
  if(JOGO.provas&&!localStorage.getItem('jux_volta_luta'))delete JOGO.provas.ignarok;setTimeout(()=>aviso('Modo teste do altar: nada é salvo','#ffe27a'),1800);}
if(REGIAO==='vila'&&(location.hash.split('?')[0]==='#ataque'||location.hash.split('?')[0]==='#brinde')){window.__semSalvar=true;JOGO.cap2={fase:location.hash.split('?')[0]==='#ataque'?'ataque':'noite',lutas:{}};if(JOGO.provas&&!localStorage.getItem('jux_volta_luta')){for(const k of ['atq_1','atq_2','atq_3'])delete JOGO.provas[k];try{sessionStorage.removeItem('jux_atq_teste');}catch(e){}}JOGO.bino=Object.assign(JOGO.bino||{},{ativo:true,nivel:Math.max(1,(JOGO.bino||{}).nivel||1)});
  JOGO.vila=Object.assign(JOGO.vila||{},{espada:true,abertura:true});hero.espada=true;hero.x=722;hero.y=716;JOGO.tut=Object.assign(JOGO.tut||{},{andar:true,habilidade:true,missao_npc:true,missao:true,grupo:true,equip:true,hab_nova:true,comida:true,eco:true,luta:true,ressonancia:true});
  setTimeout(()=>aviso('Modo teste: nada é salvo','#ffe27a'),1800);}
if(REGIAO==='vila'&&location.hash==='#cine_ataque')setTimeout(()=>tocaFilme(CENAS_ATAQUE,IMG_ATAQUE,()=>{}),1500);   // lab: so a cutscene
// CUTSCENE "O IGNAROK" (FICHA_CAP2_IGNAROK.md, aprovada 2026-11-20): no altar, depois das 3 lutas. O Ignarok nao tem voz (legenda laranja, tipo 4).
// Musica 'Dramatic Boss Encounter' (cynicmusic, CC0). A cena 1 (os acolitos em circulo) ainda nao chegou como arquivo: por enquanto o filme
// comeca na fenda (cena_2b) com as falas da cena 1; quando ela chegar, entra na frente.
const CENAS_IGNAROK=[
  {img:'cena_2b',mus:'ignarok',cam:[.5,.55,1.0, .5,.5,1.12],dur:9.5,fx:'neve',vozes:[[.8,'ig1j'],[4.6,'ig1a']],falas:[[.8,'Jux','Escavação sem autorização. Isso dá multa.'],[4.6,'Arauto','Tarde demais, sem-sombra.',2]],sons:[[.2,'impacto']]},
  {img:'cena_2',mus:'ignarok',cam:[.55,.6,1.12, .5,.5,1.0],dur:6.2,fx:'neve',vozes:[[1,'ig2a']],falas:[[1,'Aurora','Portador, eles estão abrindo a montanha!',1]],sons:[[.1,'ig_erupcao']],treme:[.1,1.8],flash:.05},
  {img:'cena_3',mus:'ignarok',cam:[.5,.7,1.0, .5,.35,1.14],dur:8,fx:'neve',vozes:[[1.2,'ig3b'],[2.8,'ig3j']],falas:[[1.2,'Bino','…Grande.'],[2.8,'Jux','Grande é elogio. Isso é um prédio.']],sons:[[.1,'ig_rugido']],treme:[.1,1.4]},
  {img:'cena_3b',mus:'ignarok',cam:[.5,.4,1.14, .5,.5,1.0],dur:4.2,fx:'neve',vozes:[],falas:[],sons:[[.1,'ig_rosna'],[1.2,'ig_queda']],treme:[1.2,2.6]},
  {img:'cena_4',mus:'ignarok',cam:[.6,.55,1.0, .45,.5,1.12],dur:12.5,fx:'neve',vozes:[[2.6,'ig4a'],[8.8,'ig4j']],falas:[[.4,'Ignarok','GELO… QUEBRA.',4],[2.6,'Aurora','O Cristal do Gelo está embaixo do altar! Se ele derreter o altar, leva o Cristal!',1],[8.8,'Jux','Então hoje ninguém derrete nada.']],sons:[[.2,'ig_punho'],[8.6,'gelo']],treme:[.2,1.4],flash:.1},
];
for(const [k,f] of [['ig1j','1_jux'],['ig1a','1_arauto'],['ig2a','2_aurora'],['ig3b','3_bino'],['ig3j','3_jux'],['ig4a','4_aurora'],['ig4j','4_jux']])VOZES[k]=arq('assets/cine_ignarok/voz_ignarok_'+f);
const IMG_IGNAROK=imgsFilme(CENAS_IGNAROK.map(c=>'assets/cine_ignarok/'+c.img.replace('cena','cena_').replace('cena__','cena_')+'.jpg'));
if(REGIAO==='vila'&&location.hash.split('?')[0]==='#cine_ignarok')setTimeout(()=>tocaFilme(CENAS_IGNAROK,IMG_IGNAROK,()=>{}),1500);   // lab: so o filme
// CUTSCENE "O PRECO" (FICHA_CAP2_PRECO.md, aprovada 2026-11-20): logo depois da vitoria contra o Ignarok. O Halvard morre protegendo o Tico.
// Cenas 1-3 com a musica do Ignarok; a 4 em silencio (so o impacto); a 5 com 'Bleeding Out' (haeldb, CC0) e a 6 com 'Lament for a Warrior's Soul'
// (RandomMind, CC0), sem tremer. Tempos acertados pelas vozes (2026-11-20).
// Vozes: assets/cine_preco/voz_preco_* (ROTEIRO_VOZ_PRECO.md). Os tempos sao ajustados quando as vozes chegam.
const CENAS_PRECO=[
  {img:'cena_1',mus:'ignarok',cam:[.5,.5,1.12, .5,.4,1.0],dur:5,fx:'neve',vozes:[[1.2,'pr1a']],falas:[[1.2,'Aurora','Portador… ele ainda não acabou!',1]],sons:[[.2,'ig_rosna']],treme:[.2,1.2]},
  {img:'cena_2',mus:'ignarok',cam:[.55,.5,1.0, .55,.42,1.12],dur:7,fx:'neve',vozes:[[.8,'pr2t'],[5,'pr2h']],falas:[[.8,'Tico','Jux! Eu vim ajudar! Eu também sou da vila!'],[5,'Halvard','TICO! Volta aqui!']],sons:[]},
  {img:'cena_3',mus:'ignarok',cam:[.6,.5,1.0, .4,.45,1.12],dur:4.5,fx:'neve',vozes:[[2.2,'pr3j']],falas:[[.4,'Ignarok','…QUEIMA.',4],[2.2,'Jux','NÃO!']],sons:[[.2,'ig_erupcao']],treme:[.2,2]},
  {img:'cena_4',mus:'nada',cam:[.5,.5,1.0, .5,.5,1.1],dur:5,fx:'neve',vozes:[],falas:[],sons:[[.1,'ig_queda'],[1.4,'quebra']],treme:[.1,1.2],flash:.1},
  {img:'cena_5',mus:'preco_morte',cam:[.5,.55,1.0, .48,.52,1.12],dur:29.5,fx:'neve',vozes:[[1.2,'pr5t'],[5,'pr5ha'],[10,'pr5hb'],[17.5,'pr5j'],[21,'pr5hc'],[25.5,'pr5b']],
   falas:[[1.2,'Tico','Pai… pai, levanta…'],[5,'Halvard','Você tá bem? …Que bom. Então valeu a pena.'],[10,'Halvard','Forasteiro… você me trouxe de volta uma vez. Agora cuida dele por mim.'],
     [17.5,'Jux','…Eu cuido. Eu prometo.'],[21,'Halvard','Bino… come. Pergunta depois.'],[25.5,'Bino','…Halvard.']],sons:[]},
  {img:'cena_6',mus:'preco',cam:[.6,.5,1.0, .55,.45,1.1],dur:27,fx:'neve',vozes:[[1.2,'pr6a'],[9.2,'pr6ja'],[15.2,'pr6jb'],[19.6,'pr6jc']],
   falas:[[1.2,'Aurora','O Cristal do Gelo trincou, Portador. A Ordem levou uma parte da luz dele.',1],[9.2,'Jux','Até hoje eu achei que isso era um jogo. Que em algum momento eu ia acordar.'],
     [15.2,'Jux','Não é. E eu não vou acordar.'],[19.6,'Jux','A Ordem vai pagar por cada um. Começando agora.']],sons:[]},
];
for(const [k,f] of [['pr1a','1_aurora'],['pr2t','2_tico'],['pr2h','2_halvard'],['pr3j','3_jux'],['pr5t','5_tico'],['pr5ha','5_halvard_a'],['pr5hb','5_halvard_b'],['pr5j','5_jux'],['pr5hc','5_halvard_c'],['pr5b','5_bino'],
  ['pr6a','6_aurora'],['pr6ja','6_jux_a'],['pr6jb','6_jux_b'],['pr6jc','6_jux_c']])VOZES[k]=arq('assets/cine_preco/voz_preco_'+f);
const IMG_PRECO=imgsFilme(CENAS_PRECO.map(c=>'assets/cine_preco/'+c.img+'.jpg'));
if(REGIAO==='vila'&&location.hash.split('?')[0]==='#cine_preco')setTimeout(()=>tocaFilme(CENAS_PRECO,IMG_PRECO,()=>{}),1500);   // lab: so o filme
// depois do filme: o Halvard morreu (some do jogo para sempre) e a historia segue para a Parte E
function precoFim(){JOGO.cap2.halvardMorreu=true;JOGO.cap2.preco=true;salvaJogo();
  {const i=ANDARILHOS.findIndex(n=>n.id==='halvard');if(i>=0){const n=ANDARILHOS[i];ANDARILHOS.splice(i,1);const k=V.pontos.indexOf(n.ponto);if(k>=0)V.pontos.splice(k,1);}}setTimeout(manhaSeguinte,400);}
// CUTSCENES DA PARTE E: "O adeus" (musica do lamento), "Os sete Cristais" (a lenda) e "A partida" (The Hope, a mesma do Bino)
const CENAS_ADEUS=[
  {img:'adeus1',mus:'preco',cam:[.5,.5,1.0, .5,.45,1.1],dur:9,fx:'neve',vozes:[[.8,'pa1a']],falas:[[.8,'Vovó Hilda','O Halvard caçava pra quem não tinha o que comer. Nunca pediu nada de volta.']],sons:[]},
  {img:'adeus1b',mus:'preco',cam:[.45,.5,1.1, .5,.5,1.0],dur:7.5,fx:'neve',vozes:[[.8,'pa1b']],falas:[[.8,'Vovó Hilda','Ontem ele deu a última coisa que tinha. E deu sorrindo.']],sons:[]},
  {img:'adeus2',mus:'preco',cam:[.45,.55,1.0, .5,.5,1.12],dur:10.5,fx:'neve',vozes:[[1,'pa2t'],[7.2,'pa2b']],falas:[[1,'Tico','Pai… eu vou ser corajoso. Do jeito certo, dessa vez.'],[7.2,'Bino','…Ele foi.']],sons:[[.4,'brilho']]},
];
const CENAS_CRISTAIS=[
  {img:'cristais1',mus:'lenda',cam:[.5,.55,1.0, .5,.6,1.12],dur:13.5,fx:'neve',vozes:[[.8,'pc1a'],[7.6,'pc1b']],falas:[[.8,'Vovó Hilda','O Cristal do Gelo trincou. Se um cristal cai, os outros ficam mais fracos.'],[7.6,'Vovó Hilda','Existem sete. E a Ordem vai atrás de todos.']],sons:[]},
  {img:'ordem1',mus:'lenda',cam:[.5,.5,1.0, .5,.45,1.12],dur:16.5,fx:'neve',vozes:[[.8,'pc2a'],[8,'pc2j'],[10.4,'pc2v']],falas:[[.8,'Aurora','O próximo é o Cristal do Fogo, Portador. No sul, onde a neve acaba.',1],[8,'Jux','Então é pra lá que eu vou.'],[10.4,'Vovó Hilda','Vocês. Ninguém sai daqui sozinho.']],sons:[[.2,'brilho']]},
];
const CENAS_PARTIDA=[
  {img:'partida1',mus:'bino_b',cam:[.45,.5,1.0, .5,.45,1.1],dur:13.5,fx:'neve',vozes:[[.8,'pp1v'],[5.4,'pp1b'],[9.2,'pp1j']],falas:[[.8,'Vovó Hilda','Volte vivo, forasteiro. É uma ordem.'],[5.4,'Borin','E traga histórias! Das boas!'],[9.2,'Jux','Eu volto. Ainda tenho uma lição de caça marcada.']],sons:[]},
  {img:'partida2',mus:'bino_b',cam:[.5,.6,1.0, .55,.4,1.12],dur:8,fx:'neve',vozes:[[1.2,'pp2j'],[4.6,'pp2b']],falas:[[1.2,'Jux','Bino. Obrigado por vir.'],[4.6,'Bino','…Eu sempre vou.']],sons:[]},
  {img:'partida3',mus:'bino_b',cam:[.35,.6,1.12, .5,.5,1.0],dur:11.5,fx:'neve',vozes:[[.8,'pp3a'],[2.6,'pp3b'],[4.2,'pp3c']],falas:[[.8,'Jux','…Estamos sendo seguidos.'],[2.6,'Bino','…Por um porco.'],[4.2,'Jux','Bem-vindo à equipe, Sir Bacon. O salário é em pão.'],[9,'✦','Sir Bacon entrou no time!',1]],sons:[[.2,'oinc'],[8.8,'brilho']]},
];
for(const [k,f] of [['pa1a','a1_vovo_a'],['pa1b','a1_vovo_b'],['pa2t','a2_tico'],['pa2b','a2_bino'],['pc1a','c1_vovo_a'],['pc1b','c1_vovo_b'],['pc2a','c2_aurora'],['pc2j','c2_jux'],['pc2v','c2_vovo'],
  ['pp1v','p1_vovo'],['pp1b','p1_borin'],['pp1j','p1_jux'],['pp2j','p2_jux'],['pp2b','p2_bino'],['pp3a','p3_jux_a'],['pp3b','p3_bino'],['pp3c','p3_jux_b']])VOZES[k]=arq('assets/cine_partida/voz_partida_'+f);
const imgPart=c=>c.img==='ordem1'?'assets/cine_ordem/cena_1.jpg':'assets/cine_partida/'+c.img+'.jpg';
const IMG_ADEUS=imgsFilme(CENAS_ADEUS.map(imgPart)),IMG_CRISTAIS=imgsFilme(CENAS_CRISTAIS.map(imgPart)),IMG_PARTIDA=imgsFilme(CENAS_PARTIDA.map(imgPart));
{const h=location.hash.split('?')[0];if(REGIAO==='vila'&&h==='#cine_partida')setTimeout(()=>tocaFilme(CENAS_PARTIDA,IMG_PARTIDA,()=>{}),1500);if(REGIAO==='vila'&&h==='#cine_adeus')setTimeout(()=>tocaFilme(CENAS_ADEUS,IMG_ADEUS,()=>{}),1500);}
// CAPITULO 3, PARTE A (FICHA_CAP3_RIO.md): "O barco do Borin". Depois do fim do Cap. 2, o portao leva ao cais do rio:
// o Borin construiu um barco de presente (o Halvard) e o time desce o rio (rio.html). Vozes: ROTEIRO_VOZ_BARCO.md
const CENAS_BARCO=[
  {img:'barco1',mus:'bino_b',cam:[.5,.55,1.0, .58,.5,1.1],dur:19.5,fx:'neve',vozes:[[.8,'bb1a'],[4.8,'bb1b'],[10.8,'bb1j'],[15.1,'bb1c']],
    falas:[[.8,'Borin','Eu não dormi. Martelei a noite toda.'],[4.8,'Borin','O Halvard sempre dizia que o rio leva a gente pra onde a estrada não chega.'],[10.8,'Jux','Borin… você fez um barco. Em uma noite.'],[15.1,'Borin','Fiz! E chorei em cada prego!']],sons:[]},
  {img:'barco2',mus:'bino_b',cam:[.5,.45,1.12, .5,.5,1.0],dur:14.5,fx:'neve',vozes:[[.8,'bb2a'],[5,'bb2j'],[8.9,'bb2n'],[10.3,'bb2b']],
    falas:[[.8,'Borin','O nome dele é Halvard. Não aceito outro.'],[5,'Jux','Então o Halvard vai levar a gente até o fogo.'],[8.9,'Bino','…Bom barco.'],[10.3,'Borin','O BINO ELOGIOU! Alguém anota o dia de hoje!']],sons:[]},
  {img:'barco3',mus:'rio',cam:[.4,.5,1.12, .55,.55,1.0],dur:12,fx:'neve',vozes:[[1,'bb3b'],[4.6,'bb3j']],
    falas:[[1,'Borin','Voltem vivos! E tragam histórias!'],[3.8,'Sir Bacon','Oinc!'],[4.6,'Jux','Sir Bacon, você não é o capitão.'],[8.4,'✦','O barco Halvard entrou no time. Desça o rio até o sul.',1]],sons:[[3.8,'oinc'],[8.2,'brilho']]},
];
for(const [k,f] of [['bb1a','1_borin_a'],['bb1b','1_borin_b'],['bb1j','1_jux'],['bb1c','1_borin_c'],['bb2a','2_borin_a'],['bb2j','2_jux'],['bb2n','2_bino'],['bb2b','2_borin_b'],['bb3b','3_borin'],['bb3j','3_jux']])VOZES[k]=arq('assets/cine_barco/voz_barco_'+f);
let IMG_BARCO=null;   // carrega so quando precisa (e a cena 3 so entra quando a imagem existir)
function filmeBarco(depois){const cenas=CENAS_BARCO.slice();const t=new Image();t.onload=()=>go(cenas);t.onerror=()=>go(cenas.slice(0,2));t.src='assets/cine_barco/barco3.jpg';
  function go(c){IMG_BARCO=imgsFilme(c.map(x=>'assets/cine_barco/'+x.img+'.jpg'));tocaFilme(c,IMG_BARCO,depois);}}
function desceRio(){if(JOGO.cap3&&JOGO.cap3.barco){vaiPara('rio.html');return;}
  filmeBarco(()=>{JOGO.cap3=Object.assign(JOGO.cap3||{},{fase:'rio',barco:true});salvaJogo();vaiPara('rio.html');});}
{const h=location.hash.split('?')[0];if(REGIAO==='vila'&&h==='#cine_barco')setTimeout(()=>filmeBarco(()=>{}),1500);}
// "Na manha seguinte…" (depois de O preco) e o fim do capitulo usam a mesma tela que escurece (noiteFade), com outro texto
function manhaSeguinte(){noiteFade={t:0,virou:false,txt:'Na manhã seguinte…',vira:()=>{JOGO.cap2.fase='manha';JOGO.cap2.e={};salvaJogo();aplicaManha();hero.x=722;hero.y=716;hero.olha='cima';},
  fim:()=>abreFala('manha_chega')};hero.alvo=null;hero.pontoAlvo=null;}
function fimCapitulo2(){noiteFade={t:0,virou:false,k:1.8,txt:'Fim do Capítulo 2 — O festival da Rainha do Inverno',txt2:'Capítulo 3: em breve',vira:()=>{JOGO.cap2.fase='fim';if(typeof marcaFimCapitulo==='function')marcaFimCapitulo(2);JOGO.cap2.baconTime=true;salvaJogo();
    hero.x=722;hero.y=700;hero.olha='baixo';},fim:()=>aviso('Obrigado por jogar o Capítulo 2!','#ffe27a')};}
// a lanterna do Tico: no alto do altar, depois do adeus
function ticoAltar(){fala={linhas:FALAS.manha_tico_altar,i:0,letras:0,fim:()=>{daItem('lanterna_halvard',1);partMarca('lanterna');aviso('Você recebeu a Lanterna do Halvard! (acessório)','#9fe8ff');}};hero.alvo=null;hero.pontoAlvo=null;som(SOM.ui_vez,.5);}
// o altar na vila em ataque: com as 3 lutas feitas (e o Capitulo 1 completo), a cutscene e a luta; depois de perder, so a luta
function altarIgnarok(){const C=JOGO.cap2;if(cap1Trava()){falaPendencias('aurora');return;}
  if((JOGO.provas||{}).ignarok==='vencida')return;
  if(!C.ignVisto){tocaFilme(CENAS_IGNAROK,IMG_IGNAROK,()=>{C.ignVisto=true;salvaJogo();iniciaProva('ignarok');});return;}
  fala={linhas:[['✦','O Ignarok espera no altar, o coração de fogo pulsando.'],['Aurora','O gelo é a sua arma, Portador. Ele derrete as defesas: não confie só nelas.',1]],i:0,letras:0,
    fim:()=>{UI.escolha={id:'prova',prova:'ignarok',ops:['Lutar','Ainda não'],sel:0};som(SOM.ui_vez,.5);}};som(SOM.ui_vez,.5);}
// o brinde: a Vovo pergunta e, com 'Fazer o brinde', toca a cutscene e a vila entra em ataque
function brindeVovo(){UI.escolha={id:'brinde',ops:['Fazer o brinde','Ainda não'],sel:0};som(SOM.ui_vez,.5);}
function comecaAtaque(){tocaFilme(CENAS_ATAQUE,IMG_ATAQUE,()=>{JOGO.cap2.fase='ataque';JOGO.cap2.lutas={};if(JOGO.provas)for(const k of ['atq_1','atq_2','atq_3'])delete JOGO.provas[k];salvaJogo();aplicaAtaque();hero.x=722;hero.y=716;hero.olha='cima';setTimeout(()=>abreFala('atq_comeca',()=>aviso('Nova missão: O ataque (veja no canto da tela)','#ff9ae8')),500);});}
// ESPIRITO DO FENRIR (depois da cutscene, no mapa, desenhado por codigo): a cabeca do lobo de luz aparece sobre a runa, uiva,
// vira particulas que giram em espiral e entram no Jux; no fim o Jux brilha e aparece o aviso
let espF=null;
function espiritoFenrir(){espF={t:0,x:hero.x,y:hero.y-96,p:[],fim:false};abSom('uivo');clarao=Math.max(clarao,.7);}
function desenhaEspiritoFenrir(){if(!espF)return;const E=espF,agora=performance.now()/1000,dt=E.u?Math.min(.05,agora-E.u):.016;E.u=agora;E.t+=dt;const t1=1.3,t2=2.9,T=3.6,img=(typeof RETRATO_ECO!=='undefined'&&retratoOk&&retratoOk('lamina'))?RETRATO_ECO.lamina:null;
  const hx=hero.x,hy=hero.y-30;
  // a cabeca de luz: aparece (0..t1), depois encolhe indo para o Jux (t1..t2)
  if(E.t<t2){const a=E.t<t1?Math.min(1,E.t/.5):1-(E.t-t1)/(t2-t1),k=E.t<t1?.7+.3*Math.min(1,E.t/t1):1-(E.t-t1)/(t2-t1)*.7,
      cx=E.t<t1?E.x:E.x+(hx-E.x)*(E.t-t1)/(t2-t1),cy=(E.t<t1?E.y-6*Math.sin(E.t*3):E.y+(hy-E.y)*(E.t-t1)/(t2-t1)),S=70*k;
    ctx.save();ctx.globalCompositeOperation='lighter';
    const g=ctx.createRadialGradient(cx,cy,2,cx,cy,S*1.1);g.addColorStop(0,`rgba(160,230,255,${.55*a})`);g.addColorStop(1,'rgba(40,120,255,0)');ctx.fillStyle=g;ctx.fillRect(cx-S*1.2,cy-S*1.2,S*2.4,S*2.4);
    if(img){ctx.globalAlpha=.85*a;ctx.filter='brightness(1.6) saturate(1.4)';ctx.drawImage(img,cx-S/2,cy-S/2,S,S);ctx.filter='none';}
    ctx.restore();
    // particulas que saem da cabeca e entram no Jux em espiral
    if(E.t>t1*.6&&Math.random()<.9)for(let i=0;i<3;i++)E.p.push({x:cx+rnd(-S/3,S/3),y:cy+rnd(-S/3,S/3),v:0,a0:rnd(0,6.28),r0:rnd(30,60)});}
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=E.p.length-1;i>=0;i--){const q=E.p[i];q.v+=dt*1.4;if(q.v>=1){E.p.splice(i,1);continue;}
    const ang=q.a0+q.v*7,r=q.r0*(1-q.v),px=q.x+(hx-q.x)*q.v+Math.cos(ang)*r,py=q.y+(hy-q.y)*q.v+Math.sin(ang)*r*.5;
    ctx.fillStyle=`rgba(${190+Math.random()*60|0},240,255,${.9*(1-q.v*.5)})`;ctx.fillRect(px-1.5,py-1.5,3,3);}
  // o Jux recebe: anel de luz e brilho
  if(E.t>t2){const u=(E.t-t2)/(T-t2);ctx.strokeStyle=`rgba(170,235,255,${1-u})`;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(hx,hero.y-2,10+u*46,4+u*16,0,0,6.283);ctx.stroke();
    const g2=ctx.createRadialGradient(hx,hy,2,hx,hy,40);g2.addColorStop(0,`rgba(200,245,255,${.6*(1-u)})`);g2.addColorStop(1,'rgba(60,150,255,0)');ctx.fillStyle=g2;ctx.fillRect(hx-44,hy-44,88,88);
    if(!E.fim){E.fim=true;abSom('brilho');for(let i=0;i<26;i++)poeira.push({x:hx+rnd(-12,12),y:hero.y-rnd(0,20),vx:rnd(-50,50),vy:rnd(-70,-10),v:0});}}
  ctx.restore();
  if(E.t>=T&&!E.p.length){espF=null;aviso('O Fenrir agora é seu Eco! (menu → Ecos)','#9fe8ff');}}
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
// TESTE DOS PREPARATIVOS (pedido 2026-11-20: 'rever a animacao'): vila.html#preparativos abre de dia com as 3 tarefas zeradas.
// NADA e salvo nesse modo (o save de verdade fica intacto); ao recarregar sem o #, volta tudo como estava.
if(REGIAO==='vila'&&location.hash==='#preparativos'){window.__semSalvar=true;JOGO.cap2={fase:'preparo',tarefas:{}};JOGO.bino=Object.assign(JOGO.bino||{},{ativo:true,nivel:Math.max(1,(JOGO.bino||{}).nivel||1)});
  JOGO.vila=Object.assign(JOGO.vila||{},{espada:true,abertura:true});hero.espada=true;hero.x=722;hero.y=700;JOGO.tut=Object.assign(JOGO.tut||{},{andar:true,habilidade:true,missao_npc:true,missao:true,grupo:true,equip:true,hab_nova:true,comida:true,eco:true,luta:true,ressonancia:true});
  setTimeout(()=>aviso('Modo teste dos preparativos: nada é salvo','#ffe27a'),1800);}
if(REGIAO==='vila'&&location.hash==='#cine_bino')setTimeout(()=>tocaFilme(CENAS_BINO,IMG_BINO,()=>{}),1500);   // lab: abre a cutscene direto
const ALTV=new Image();if(V.altar_vazio)ALTV.src=V.altar_vazio.img;let espadaSobe=99;
function tocaFilme(cenas,imgs,onFim){const t0=Date.now();(function vai(){if(imgs.some(i=>!i.complete||!i.naturalWidth)&&Date.now()-t0<10000)return setTimeout(vai,100);tocaFilme0(cenas,imgs,onFim);})();}
// REVER CUTSCENES (menu -> Sistema, pedido 2026-11-20): as cutscenes do mapa, na ordem da historia. visto(): saves de antes
// desta lista contam pelo progresso; daqui em diante cada uma fica marcada em JOGO.cines quando toca
const FILMES=[
  {id:'intro',nome:'A abertura',c:()=>CENAS_INTRO,i:()=>IMG_INTRO,visto:()=>!!JOGO.vila},
  {id:'espada',nome:'A lâmina no altar',c:()=>CENAS_ESPADA,i:()=>IMG_ESPADA,visto:()=>!!(hero.espada||(JOGO.vila&&JOGO.vila.espada))},
  {id:'bino',nome:'O Bino entra no time',c:()=>CENAS_BINO,i:()=>IMG_BINO,visto:()=>!!(JOGO.bino&&JOGO.bino.ativo)},
  {id:'ordem',nome:'A Ordem do Eclipse',c:()=>CENAS_ORDEM,i:()=>IMG_ORDEM,visto:()=>!!JOGO.ordemSabe},
  {id:'skoll',nome:'O Skoll acorrentado',c:()=>CENAS_SKOLL,i:()=>IMG_SKOLL,visto:()=>typeof estProvas==='function'&&['vencida','feita'].includes(estProvas().skoll)},
  {id:'fenrir',nome:'O Fenrir aparece',c:()=>CENAS_FENRIR,i:()=>IMG_FENRIR,visto:()=>typeof estProvas==='function'&&(['vencida','feita'].includes(estProvas().fenrir)||estadoEcos().tem.includes('lamina'))},
  {id:'fenrir_v',nome:'O Fenrir se junta ao Jux',c:()=>CENAS_FENRIR_V,i:()=>IMG_FENRIR_V,visto:()=>typeof estProvas==='function'&&(estProvas().fenrir==='feita'||estadoEcos().tem.includes('lamina'))},
  {id:'partida',nome:'A partida',c:()=>CENAS_PARTIDA,i:()=>IMG_PARTIDA,visto:()=>!!(JOGO.cap2&&JOGO.cap2.e&&JOGO.cap2.e.partida)},
  {id:'barco',nome:'O barco do Borin',c:()=>CENAS_BARCO,i:()=>(IMG_BARCO&&IMG_BARCO.length===3)?IMG_BARCO:(IMG_BARCO=imgsFilme(CENAS_BARCO.map(x=>'assets/cine_barco/'+x.img+'.jpg'))),visto:()=>!!(JOGO.cap3&&JOGO.cap3.barco)},
  {id:'cristais',nome:'Os sete Cristais',c:()=>CENAS_CRISTAIS,i:()=>IMG_CRISTAIS,visto:()=>!!(JOGO.cap2&&JOGO.cap2.e&&JOGO.cap2.e.cristais)},
  {id:'adeus',nome:'O adeus',c:()=>CENAS_ADEUS,i:()=>IMG_ADEUS,visto:()=>!!(JOGO.cap2&&JOGO.cap2.e&&JOGO.cap2.e.adeus)},
  {id:'preco',nome:'O preço',c:()=>CENAS_PRECO,i:()=>IMG_PRECO,visto:()=>!!(JOGO.cap2&&JOGO.cap2.preco)},
  {id:'ignarok',nome:'O Ignarok',c:()=>CENAS_IGNAROK,i:()=>IMG_IGNAROK,visto:()=>!!(JOGO.cap2&&JOGO.cap2.ignVisto)},
  {id:'ataque',nome:'A aurora preta',c:()=>CENAS_ATAQUE,i:()=>IMG_ATAQUE,visto:()=>!!(JOGO.cap2&&JOGO.cap2.fase&&!['volta','preparo','noite'].includes(JOGO.cap2.fase))},
];
const filmeVisto=f=>!!((JOGO.cines||{})[f.id])||(()=>{try{return f.visto();}catch(e){return false;}})();
function reverFilme(id){const f=FILMES.find(x=>x.id===id);if(!f||!filmeVisto(f))return;tocaFilme(f.c(),f.i(),()=>{});}
function tocaFilme0(cenas,imgs,onFim){{const f=FILMES.find(x=>{try{return x.c()===cenas;}catch(e){return false;}});if(f){JOGO.cines=JOGO.cines||{};JOGO.cines[f.id]=true;}}CENAS=cenas;CENA_IMG=imgs;ab.onFim=onFim;ab.on=true;ab.neve=[];ab.i=0;ab.t=0;ab.fim=0;ab.segura=false;ab.liberado=false;fala=null;abToca();}
function filmeEspada(){tocaFilme(CENAS_ESPADA,IMG_ESPADA,()=>{hero.espada=true;espadaSobe=-.6;salvaVila();clarao=1;hero.olha='baixo';
  for(let i=0;i<40;i++)poeira.push({x:hero.x+rnd(-14,14),y:hero.y-rnd(0,30),vx:rnd(-60,60),vy:rnd(-80,-10),v:0});});}
const MUS_CINE={bino_b:arq('assets/musica/bino_b'),rio:arq('assets/musica/musica_rio'),preco_morte:arq('assets/musica/cine_preco_morte'),preco:arq('assets/musica/cine_preco'),ignarok:arq('assets/musica/cine_ignarok'),festa:arq('assets/vila/musica_festival'),ataque:arq('assets/musica/cine_ataque'),piano:arq('assets/musica/intro_piano'),epico:arq('assets/musica/cine_4'),lenda:arq('assets/musica/espada_lenda'),heroi:arq('assets/musica/espada_heroi'),bino_a:arq('assets/musica/bino_a'),skoll:arq('assets/musica/chefe_skoll'),fenrir:arq('assets/musica/cine_fenrir'),ordem:arq('assets/musica/cine_ordem'),bino_b:arq('assets/musica/bino_b')};
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
// telepatia dos Ecos (pedido 2026-11-21): eles nao falam em voz alta; quando a fala e de um Eco toca um som mistico
const TELE_SOM={Fenrir:arq('assets/sfx/novos/telepatia_gelo'),Tartarok:arq('assets/sfx/novos/telepatia_natureza')};
const SOM_CINE={ig_rugido:arq('assets/sfx/novos/ignarok_rugido'),ig_rosna:arq('assets/sfx/novos/ignarok_rosna'),ig_punho:arq('assets/sfx/novos/ignarok_punho'),ig_erupcao:arq('assets/sfx/novos/ignarok_erupcao'),ig_queda:arq('assets/sfx/novos/ignarok_queda'),gelo:arq('assets/sfx/novos/magia_gelo'),quebra:arq('assets/sfx/novos/gelo_quebra'),brilho:arq('assets/sfx/novos/magia_brilho'),
  carga:arq('assets/sfx/novos/carga_gelo'),whoosh:arq('assets/sfx/novos/whoosh'),whoosh2:arq('assets/sfx/novos/whoosh2'),impacto:arq('assets/sfx/novos/pedras'),rosna:arq('assets/sfx/novos/lobo_rosna'),uivo:arq('assets/sfx/novos/lobo_uivo'),correntes:arq('assets/sfx/novos/skoll_correntes')};
const ab={on:false,esperando:false,i:0,t:0,fim:0,neve:[]};
let abVista=false;try{abVista=localStorage.getItem('jux_abertura_vista')==='1';}catch(e){}
function abSom(n){if(n==='oinc'){som(OINC[(Math.random()*OINC.length)|0],.8);return;}const a=SOM_CINE[n];if(a)som(a,.7);}
function abComeca(){CENAS=CENAS_INTRO;CENA_IMG=IMG_INTRO;ab.onFim=null;ab.on=true;ab.esperando=true;ab.i=0;ab.t=0;ab.fim=0;ab.segura=false;ab.liberado=false;fala=null;}
function abToca(){ab.esperando=false;ligaAudio();if(MUS)MUS.pause();musNome=null;abMusica(CENAS[0].mus);ab.feitos=new Set();}
function abProxima(){for(const v of Object.values(VOZES))v.pause();ab.i++;ab.t=0;ab.segura=false;ab.liberado=false;ab.feitos=new Set();if(ab.i>=CENAS.length)abTermina();}
// RITMO DAS CUTSCENES (2026-11-21: 'passa tao rapido que nao da tempo de ler; bota continuar, da um enter'): tudo 15% mais lento e
// no fim de cada cena a imagem PARA com 'ENTER > continuar' (na ultima, antes de escurecer). ENTER no meio = vai ao fim da cena.
const VEL_CINE=.85;
const abLimite=c=>ab.i===CENAS.length-1?Math.max(0,c.dur-1.25):c.dur;
function abContinua(){if(!ab.on||ab.esperando)return;const c=CENAS[ab.i];if(!c)return;
  if(ab.segura){ab.segura=false;if(ab.i<CENAS.length-1)abProxima();else{ab.liberado=true;ab.t=abLimite(c)+.01;}som(SOM.ui_mover,.4);return;}
  if(ab.t<.5)return;ab.t=Math.max(ab.t,abLimite(c));}
function abTermina(){if(!ab.on)return;for(const v of Object.values(VOZES))v.pause();ab.on=false;ab.fim=1;
  if(ab.onFim){const f=ab.onFim;ab.onFim=null;if(musNome!=='vila')abMusica('vila');musNome=null;musAtual=null;f();return;}
  try{localStorage.setItem('jux_abertura_vista','1');}catch(e){}abVista=true;
  if(musNome!=='vila'){abMusica('vila');}musNome=null;musAtual=null;
  hero.olha='baixo';comecou=false;}
function abPasso(dt){
  if(ab.fim>0)ab.fim=Math.max(0,ab.fim-dt*.9);   // volta do preto para o mapa devagar
  if(!ab.on||ab.esperando)return;
  const c=CENAS[ab.i];if(!ab.segura){ab.t+=dt*VEL_CINE;if(ab.t>=abLimite(c)&&!ab.liberado){ab.t=abLimite(c);ab.segura=true;}}
  for(const [tt,n] of c.sons){const k=ab.i+':'+tt;if(ab.t>=tt&&!ab.feitos.has(k)){ab.feitos.add(k);abSom(n);}}
  if(c.vozes)for(const [tt,nm] of c.vozes){const k='z'+ab.i+nm;if(ab.t>=tt&&!ab.feitos.has(k)){ab.feitos.add(k);for(const v of Object.values(VOZES))v.pause();const v=VOZES[nm];if(v)try{v.currentTime=0;v.play().catch(()=>{});}catch(e){}}}
  if(c.voz2){const k='w'+ab.i;if(ab.t>=c.voz2[0]&&!ab.feitos.has(k)){ab.feitos.add(k);const v=VOZES[c.voz2[1]];try{v.currentTime=0;v.play().catch(()=>{});}catch(e){}}}
  if(c.voz){const k='v'+ab.i;if(ab.t>=c.voz[0]&&!ab.feitos.has(k)){ab.feitos.add(k);for(const v of Object.values(VOZES))v.pause();
    const v=VOZES[c.voz[1]];try{v.currentTime=0;v.volume=1;v.play().catch(()=>{});}catch(e){}}}
  abMusica(c.mus);
  {const fala_=(c.voz&&!VOZES[c.voz[1]].paused)||(c.voz2&&!VOZES[c.voz2[1]].paused)||(c.vozes&&c.vozes.some(z=>VOZES[z[1]]&&!VOZES[z[1]].paused));if(musAtual&&musAtual.volume>.05){const alvo=(musNome==='vila'?.42:.55)*(fala_?.5:1);musAtual.volume+=(alvo-musAtual.volume)*Math.min(1,dt*4);}}   // musica abaixa quando tem voz
  if(ab.t>=c.dur&&!ab.segura)abProxima();
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
  // transicoes suaves (2026-11-20: 'cortes secos'): fusao de 1,3 s entre as cenas com curva suave, a primeira nasce do preto
  // e a ultima escurece ate o preto no fim (antes cortava seco para o mapa)
  const c=CENAS[ab.i],FUS=1.3,lis=u=>u*u*(3-2*u);
  if(ab.i>0&&ab.t<FUS){abCena(ab.i-1,1,CENAS[ab.i-1].dur+ab.t);abCena(ab.i,lis(ab.t/FUS),ab.t);}
  else abCena(ab.i,ab.i===0?lis(Math.min(1,ab.t/1.6)):1,ab.t);
  // efeitos por cena
  if(c.fx==='geada'||c.fx==='vortice'){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(W/2,H/2,20,W/2,H/2,W*.7);
    g.addColorStop(0,`rgba(80,180,255,${.12+.08*Math.sin(t*6)})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.restore();}
  if(c.fx==='escuro'){ctx.fillStyle=`rgba(120,0,0,${.06+.05*Math.sin(t*2.3)})`;ctx.fillRect(0,0,W,H);}
  if(ab.i===CENAS.length-1&&c.dur-ab.t<1.2){ctx.fillStyle=`rgba(0,0,0,${lis(Math.min(1,1-(c.dur-ab.t)/1.2))})`;ctx.fillRect(0,0,W,H);}
  if(c.flash&&ab.t<c.flash+.5){ctx.fillStyle=`rgba(255,255,255,${Math.max(0,1-(ab.t-c.flash)/.5)})`;ctx.fillRect(0,0,W,H);}
  if(c.fx!=='escuro')for(const f of ab.neve){ctx.fillStyle='rgba(235,250,255,.75)';ctx.fillRect(f.x,f.y,f.s,f.s);}
  // faixas de cinema
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,34);ctx.fillRect(0,H-34,W,34);
  // legenda: a fala atual digitando
  let at=null;for(const fl of c.falas)if(ab.t>=fl[0])at=fl;
  if(at&&ab.tele!==at){ab.tele=at;if(TELE_SOM[at[1]])som(TELE_SOM[at[1]],.5);}
  if(at){const [tt,quem,txt,tipo]=at,n=Math.floor((ab.t-tt)*38);
    ctx.textAlign='center';
    ctx.font=(quem==='Narrador'?'italic ':'')+'bold 21px "Trebuchet MS"';
    const lin=[];{let cur='';for(const w of txt.split(' ')){const t2=cur?cur+' '+w:w;if(ctx.measureText(t2).width>W-90&&cur){lin.push(cur);cur=w;}else cur=t2;}if(cur)lin.push(cur);}   // fala longa quebra em linhas (antes saia da tela)
    const y=H-62-(lin.length-1)*27;
    ctx.font='bold 15px "Trebuchet MS"';ctx.fillStyle=tipo===4?'#ffa040':tipo===3?'#d6f6ff':tipo===2?'#ff8a8a':tipo===1?'#9fe8ff':quem==='Narrador'?'#d8d8e8':'#ffe27a';
    ctx.lineWidth=4;ctx.strokeStyle='rgba(0,0,0,.85)';
    if(quem!=='Narrador'){ctx.strokeText(quem,W/2,y-24);ctx.fillText(quem,W/2,y-24);}
    ctx.font=(quem==='Narrador'?'italic ':'')+'bold 21px "Trebuchet MS"';ctx.fillStyle='#ffffff';let resta=n;lin.forEach((l,k)=>{const sl=l.slice(0,Math.max(0,resta));resta-=l.length+1;ctx.strokeText(sl,W/2,y+k*27);ctx.fillText(sl,W/2,y+k*27);});}
  if(ab.segura){const a=.55+.45*Math.sin(performance.now()/260);ctx.textAlign='right';ctx.font='bold 17px "Trebuchet MS"';ctx.lineWidth=4;ctx.strokeStyle='rgba(0,0,0,.85)';ctx.globalAlpha=a;ctx.strokeText('ENTER ▶ continuar',W-16,H-10);ctx.fillStyle='#ffe27a';ctx.fillText('ENTER ▶ continuar',W-16,H-10);ctx.globalAlpha=1;}
  else{ctx.textAlign='right';ctx.font='12px "Trebuchet MS"';ctx.fillStyle='rgba(255,255,255,.55)';ctx.fillText('ENTER: avançar · ESC: pular tudo',W-12,H-12);}
  ctx.textAlign='left';
}

addEventListener('keydown',e=>{ligaAudio();const k=e.key.toLowerCase();
  if(!ab.on&&!fala&&uiTecla(k)){e.preventDefault();return;}
  if(ab.on){e.preventDefault();if(ab.esperando){if(k==='enter'||k===' ')abToca();}else if(k==='escape')abTermina();else if(k==='enter'||k===' '||k==='e')abContinua();return;}
  teclas[k]=true;
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(k==='enter'||k===' '||k==='e'){if(fala)avanca();else if(perto)abreFala(perto.id);}});
addEventListener('keyup',e=>{teclas[e.key.toLowerCase()]=false;});
// tecla 'presa' (bug 2026-11-19: 'o boneco sai caminhando sozinho'): se a janela perde o foco com uma tecla apertada, o keyup nunca chega
function soltaTudo(){for(const k in teclas)teclas[k]=false;hero.alvo=null;hero.pontoAlvo=null;}
addEventListener('blur',soltaTudo);document.addEventListener('visibilitychange',()=>{if(document.hidden)soltaTudo();});
// roda do mouse: rola as listas do menu e das lojas
cv.addEventListener('wheel',e=>{if(!uiAberto())return;e.preventDefault();uiTecla(e.deltaY>0?'arrowdown':'arrowup');},{passive:false});
cv.addEventListener('pointerdown',e=>{ligaAudio();if(ab.on){if(ab.esperando)abToca();else abContinua();return;}const r=cv.getBoundingClientRect(),sx=(e.clientX-r.left)*W/r.width,sy=(e.clientY-r.top)*H/r.height;
  if(uiClique(sx,sy))return;
  if(fala){avanca();return;}
  const mx=cam.x+(sx-W/2)/Z,my=cam.y+(sy-H/2)/Z;
  const p=V.pontos.map(q=>[q,Math.hypot(mx-q.x,my-q.y)]).filter(([q,d])=>d<Math.max(q.r,30)+22).sort((a,b)=>a[1]-b[1]).map(a=>a[0])[0];
  if(p&&perto===p){abreFala(p.id);return;}
  hero.alvo={x:mx,y:my};hero._ad=1e9;hero._at=0;hero.alvoLonge=Math.hypot(mx-hero.x,my-hero.y)>110;hero.pontoAlvo=p||null;});
document.getElementById('voltar').onclick=()=>{location.href=jp('index.html');};
if(!NA_VILA)document.getElementById('abertura').style.display='none';
if(NA_VILA)V.pontos.push({id:'portao',x:722,y:738,r:40});
if(NA_VILA)V.pontos.push(TICO_ALTAR);
const MEMORIAL={id:'memorial',x:742,y:690,r:0};if(NA_VILA)V.pontos.push(MEMORIAL);
const ATQ_PONTOS=ATQ_LUTAS.map(l=>({id:l.id,x:l.x,y:l.y,r:0}));if(NA_VILA)V.pontos.push(...ATQ_PONTOS);
function atqPontosPasso(){const px=atqProxima();for(const p of ATQ_PONTOS)p.r=(emAtaque()&&px&&px.id===p.id)?46:0;}
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
  }else if(n){const hx0=hero.x,hy0=hero.y;dx/=n;dy/=n;hero.corre=!!(teclas['shift']||(hero.alvo&&hero.alvoLonge));const v=(hero.corre?VELC:VEL)*dt,nx=hero.x+dx*v,ny=hero.y+dy*v;
    const pp=Math.abs(dx)>.5&&!livre(nx,hero.y)?pouso(hero.x,hero.y,dx>0?1:-1):Math.abs(dy)>.5&&!livre(hero.x,ny)?pousoV(hero.x,hero.y,dy>0?1:-1):null;
    if(pp!==null){   // chegou na cerca andando de lado: pula por cima
      hero.pulo=PULO;hero.puloD=PULO;hero.esc=null;hero.escN=0;hero.px0=hero.x;hero.px1=pp.x;hero.py0=hero.y;hero.py1=pp.y;hero.alvo=null;
      if(ESCALAR&&hero.espada&&Math.abs(pp.y-hero.y)>Math.abs(pp.x-hero.x)){hero.esc=pp.y<hero.y?'subir':'descer';hero.puloD=hero.pulo=hero.esc==='subir'?1.05:.8;hero.olha=hero.esc==='subir'?'cima':'baixo';som(SOM.whoosh,.4);}
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
    // os moradores tem CORPO (2026-11-20: 'o Jux atravessa as pessoas'): nao entra no corpo de ninguem; escorrega de lado se der
    // e se bater de frente, CONTORNA a pessoa sozinho (2026-11-20: travava atras do Sir Bacon como parede invisivel)
    if(moveu&&npcBloqueia(hero.x,hero.y,hx0,hy0)){const ax=hero.x,ay=hero.y,n=npcBloqueia(ax,ay,hx0,hy0),st=Math.hypot(ax-hx0,ay-hy0)||1;
      const diag=Math.abs(ay-hy0)>.01&&Math.abs(ax-hx0)>.01;   // na diagonal: tenta seguir so num eixo
      if(diag&&!npcBloqueia(ax,hy0,hx0,hy0))hero.y=hy0;
      else if(diag&&!npcBloqueia(hx0,ay,hx0,hy0))hero.x=hx0;
      else{   // de frente: anda de lado (para o lado mais perto da borda do corpo) mantendo o avanco
        const hor=Math.abs(ax-hx0)>=Math.abs(ay-hy0),sg=hor?(hy0>=n.y?1:-1):(hx0>=n.x?1:-1);
        const sx=hor?hx0:hx0+sg*st,sy=hor?hy0+sg*st:hy0;
        if(livre(sx,sy)&&!npcBloqueia(sx,sy,hx0,hy0)){hero.x=sx;hero.y=sy;}
        else{const tx=hor?hx0:hx0-sg*st,ty=hor?hy0-sg*st:hy0;if(livre(tx,ty)&&!npcBloqueia(tx,ty,hx0,hy0)){hero.x=tx;hero.y=ty;}else{hero.x=hx0;hero.y=hy0;moveu=false;}}}}
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
  if(NA_VILA&&emFestival()){festaPoe();festaCeu(dt);vivoPasso(dt);peixePasso(dt);}
  // vila em ataque: os moradores se esconderam (nao aparecem), entao nao andam nem falam em balao (antes o Halvard 'falava' sozinho)
  else if(NA_VILA&&emAtaque()){baloes.length=0;ignCalorPasso();atqMoradoresPasso();}
  else if(lutoAtivo()){baloes.length=0;lutoPasso();peixePasso(dt);}
  else if(NA_VILA){vivoPasso(dt);peixePasso(dt);if(!(emPreparo()&&caca.on))baconPasso(dt);ticoPasso(dt);vovoPasso(dt);if(!(emPreparo()&&!prepFeita('borin')))borinPasso(dt);prepPasso(dt);for(const n of ANDARILHOS)andarilhoPasso(n,dt);}
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
  // na vila em ataque o desenho ja tem a agua, a forja e as lanternas apagadas (as animacoes azuis/laranja ficariam erradas)
  if(NA_VILA&&!emAtaque()){desenhaAgua();desenhaCascatas();desenhaPeixes();desenhaForja();}
  if(NA_VILA&&(emFestival()||emAtaque()||emManha()))desenhaVentoFesta();   // bandeiras e lanternas do mapa da festa balancando
  // agua do riacho: brilhos correndo
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(const b of brilhoRio){ctx.globalAlpha=Math.sin(Math.PI*b.v/1.4)*.55;ctx.fillStyle='#d8f6ff';ctx.fillRect(b.x,b.y,b.l,.8);}
  ctx.globalAlpha=1;
  // luz da fogueira, da forja e das lanternas
  const luz=(x,y,r,cor)=>{if(x+r<VIS.x0||x-r>VIS.x1||y+r<VIS.y0||y-r>VIS.y1)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,cor);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);};
  if(REGIAO==='trilha'){for(const[lx,ly,r_,k]of[[660,92,30,0],[795,92,30,1]])luz(lx,ly,r_+Math.sin(t*2+k)*2,'rgba(120,220,255,.35)');
    luz(1282,300,70+Math.sin(t*1.5)*8,'rgba(110,210,255,.30)');for(const[lx,ly,k]of[[590,930,0],[830,930,1],[640,940,2]])luz(lx,ly,26+Math.sin(t*1.8+k)*3,'rgba(120,220,255,.28)');}
  // vila em ataque: so a luz roxa do fogo (sem lanternas azuis, sem fogueira laranja, sem janelas acesas)
  if(NA_VILA&&emManha()){luz(1302,515,38+Math.sin(t*7)*3,'rgba(255,130,40,.36)');}
  else if(NA_VILA&&emAtaque()){luz(742,648,70+Math.sin(t*9)*5+Math.sin(t*23)*2,'rgba(190,70,255,.40)');for(const[fx,fy,fe]of[...ATQ_TETO,...ATQ_CHAO])luz(fx,fy-16*fe/.4,40*fe/.4+Math.sin(t*8+fx)*3,'rgba(200,60,255,.30)');}
  else if(NA_VILA){luz(740,645,62+Math.sin(t*9)*4+Math.sin(t*23)*2,'rgba(255,150,50,.42)');
  luz(1302,515,38+Math.sin(t*7)*3,'rgba(255,130,40,.36)');
  if(!mapaFesta())for(const[lx,ly,k]of[[602,490,0],[637,505,1],[670,462,2],[812,490,3],[851,480,4],[900,460,5],[930,476,6],[190,515,7],[330,500,8],[405,745,9],[320,822,10],[615,790,11],[855,790,12],[735,182,13],[870,225,14],[848,140,15]])luz(lx,ly,13,`rgba(120,220,255,${.2+.13*Math.sin(t*2+k*1.7)})`);
  // janelas acesas piscando de leve
  }
  if(NA_VILA&&!emAtaque())for(const[wx,wy,k]of[[95,210,0],[430,225,1],[240,385,2],[160,470,3],[240,475,4],[355,450,5],[1060,230,6],[1135,225,7],[1210,255,8],[1405,540,9],[70,350,10]])luz(wx,wy,10,`rgba(255,200,110,${.16+.08*Math.sin(t*1.3+k*2.1)})`);
  // chamas e fagulhas
  if(!emAtaque()&&!emManha())for(const c of chamas){const a=1-c.v/(c.q?1.3:.75);ctx.fillStyle=c.q?`rgba(255,200,90,${a})`:`rgba(255,${120+((1-a)*80)|0},40,${a*.85})`;ctx.beginPath();ctx.arc(c.x,c.y,Math.max(.4,c.s),0,6.283);ctx.fill();}
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
  if(NA_VILA&&!mapaFesta()&&hero.y>=520)desenhaLanternas();
  uiMundo();
  const npcs=[...(SEG.ativo?[[SEG.y,desenhaSeguidor]]:[]),...(!NA_VILA?[[235,desenhaHalvardCaverna]]:emAtaque()?[...ataqueDesenhos(),...atqMoradoresDesenhos()]:[[bacon.y,desenhaBacon],[tico.y,desenhaTico],[vovo.y,desenhaVovo],[borin.y,desenhaBorin],...ANDARILHOS.map(n=>[n.y,()=>desenhaAndarilho(n)]),...FIGURANTES.map(f=>[f.y,()=>desenhaFesta(f)]),...prepDesenhos(),...(BAN&&!mapaFesta()?BAN.lugares.map((l,i)=>[l[2]-6,()=>desenhaBandeira(i)]):[]),...(FOG&&!emManha()?FOG.lugares.map((l,i)=>[l[1],()=>desenhaFogo(i)]):[]),...(POS&&!mapaFesta()?POS.lugares.map((l,i)=>[l[1]+l[2]*1.6,()=>desenhaPoste(i)]):[])])].sort((a,b)=>a[0]-b[0]);   // quem esta atras do Jux vem antes
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
  desenhaAtaqueTopo();   // fogo roxo nos telhados e colunas de fumaca (vila em ataque)
  desenhaEspiritoFenrir();   // o espirito do Fenrir entrando no Jux (depois da cutscene de vitoria)
  desenhaFestaCeu();   // lanternas de papel e fogos de gelo na noite do festival
  // neve levantando nos passos
  ctx.fillStyle='rgba(235,248,255,.9)';for(const p of poeira){ctx.globalAlpha=1-p.v/.6;ctx.fillRect(p.x,p.y,1.2,1.2);}ctx.globalAlpha=1;
  if(NA_VILA){if(hero.y<520&&!mapaFesta())desenhaLanternas();if(!emAtaque())desenhaFumacas();desenhaBrilhos();}
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
function tutChecaMapa(){if(typeof tutMostra!=='function'||!tutLigado()||fala||ab.on||espF||!comecou||transicao||hero.pulo>0||(typeof uiAberto==='function'&&uiAberto()))return;
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
  if(fala.tele!==fala.i){fala.tele=fala.i;if(TELE_SOM[quem])som(TELE_SOM[quem],.5);}
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
  if(noiteFade)noiteFadePasso(Math.min(.05,Math.max(0,(now-ult)/1000)));   // 'Naquela noite...' (depois do limite de quadros: conta o tempo uma vez so)
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
    // CAPITULO 2: voltando para a vila com o Fenrir, comeca a noite do festival
    if(NA_VILA&&festivalPronto()){JOGO.cap2={fase:'volta'};if(typeof marcaFimCapitulo==='function')marcaFimCapitulo(1);salvaJogo();setTimeout(()=>abreFala('fest_volta'),900);}
    else if(NA_VILA&&!JOGO.cap2&&typeof estProvas==='function'&&estProvas().fenrir==='feita'&&cap1Trava()&&!JOGO.avisoCap1){JOGO.avisoCap1=true;salvaJogo();setTimeout(()=>falaPendencias('aurora'),900);}
    if(emFestival())aplicaFestival();
    if(emAtaque())aplicaAtaque();
    if(emManha())aplicaManha();
    if(emAtaque()){const pv=JOGO.provas||{};JOGO.cap2.lutas=JOGO.cap2.lutas||{};
      if(window.__semSalvar){try{Object.assign(JOGO.cap2.lutas,JSON.parse(sessionStorage.getItem('jux_atq_teste')||'{}'));}catch(e){}}
      for(const l of ATQ_LUTAS)if(pv[l.id]==='vencida'&&!JOGO.cap2.lutas[l.id]){JOGO.cap2.lutas[l.id]=true;salvaJogo();
        if(window.__semSalvar)try{sessionStorage.setItem('jux_atq_teste',JSON.stringify(JOGO.cap2.lutas));}catch(e){}
        const ult=atqFeitas()>=3;setTimeout(()=>abreFala(l.id+'_fim',()=>aviso(ult?'O ataque: 3/3 · Suba ao altar!':'O ataque: '+atqFeitas()+'/3','#ff9ae8')),700);break;}
      // venceu o Ignarok: por enquanto termina aqui (a Parte D vem depois)
      if(pv.ignarok==='vencida'&&!JOGO.cap2.ignVenceu){JOGO.cap2.ignVenceu=true;salvaJogo();setTimeout(()=>tocaFilme(CENAS_PRECO,IMG_PRECO,precoFim),700);}}
    try{const v=JSON.parse(localStorage.getItem('jux_volta_luta')||'null');if(v&&v.res==='lose_chefe'&&Date.now()-v.t<120000&&emAtaque()){localStorage.removeItem('jux_volta_luta');setTimeout(()=>abreFala('derrota_chefe'),600);}}catch(e){}
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
