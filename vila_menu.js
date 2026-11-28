/* ============ Vila: menu (Status / Itens / Equipar / Salvar), lojas, tesouros do mapa e save ============
   Usa jogo.js (ITENS, LOJAS, JOGO, statusJux...). Ganchos chamados pelo vila.html:
   uiPasso(dt) · uiMundo() (no mapa) · uiDesenha() (na tela) · uiTecla(k) · uiClique(x,y) · uiFala(id) · uiCarrega() */
'use strict';
// brilhos no chão e baús (posição no mapa; conferidas com livre() — ficam em chão andável)
const TESOUROS=[
  {id:'b_chiq',  tipo:'brilho',x:300,y:820,da:{gil:20}},
  {id:'b_vovo',  tipo:'brilho',x:236,y:604,da:{item:'pocao',n:1}},
  {id:'b_arv',   tipo:'brilho',x:870,y:470,da:{item:'cristal',n:1}},
  {id:'b_rio',   tipo:'brilho',x:1010,y:690,da:{gil:20,item:'minerio',n:1}},
  {id:'b_alto',  tipo:'brilho',x:380,y:282,da:{item:'eter',n:1}},
  {id:'b_forja', tipo:'brilho',x:1300,y:595,da:{item:'minerio',n:2}},
  {id:'bau_alto',tipo:'bau',   x:1100,y:300,da:{gil:60,item:'hipocao',n:1}},
  {id:'bau_feno',tipo:'bau',   x:1100,y:745,da:{item:'gorro_la',n:1}},
  {id:'bau_alt', tipo:'bau',   x:774,y:140,da:{item:'fenix',n:1}},
  // Trilha dos Pinheiros
  {id:'t_camp', regiao:'trilha',tipo:'bau',   x:348,y:488,da:{gil:50,item:'pao_mel',n:2}},
  {id:'t_lago', regiao:'trilha',tipo:'brilho',x:457,y:628,da:{item:'cristal',n:1}},
  {id:'t_ponte',regiao:'trilha',tipo:'brilho',x:930,y:430,da:{item:'eter',n:1}},
  {id:'t_sant', regiao:'trilha',tipo:'brilho',x:1380,y:510,da:{item:'minerio',n:2}},
  {id:'t_cav',  regiao:'trilha',tipo:'bau',   x:960,y:735,da:{item:'botas_neve',n:1,gil:20}},
  {id:'t_gelo', regiao:'trilha',tipo:'bau',   x:765,y:566,da:{item:'cristal',n:3,gil:80}},   // no meio do gelo: so se chega deslizando
  // Garganta Gelada
  {id:'g_camp',  regiao:'garganta',tipo:'bau',   x:330,y:352,da:{gil:80,item:'hipocao',n:1}},
  {id:'g_lenha', regiao:'garganta',tipo:'brilho',x:279,y:388,da:{item:'minerio',n:2}},
  {id:'g_ponte', regiao:'garganta',tipo:'brilho',x:905,y:405,da:{item:'eter',n:1}},
  {id:'g_torre', regiao:'garganta',tipo:'bau',   x:1010,y:430,da:{gil:70,item:'cristal',n:2}},
  {id:'g_ritual',regiao:'garganta',tipo:'bau',   x:1062,y:520,da:{item:'fenix',n:1,gil:60}},
  {id:'g_rit2',  regiao:'garganta',tipo:'brilho',x:1200,y:585,da:{item:'eter',n:2}},
  {id:'g_leste', regiao:'garganta',tipo:'brilho',x:1364,y:450,da:{item:'minerio',n:2}},
  {id:'g_sul',   regiao:'garganta',tipo:'brilho',x:560,y:850,da:{item:'cristal',n:1}},
  {id:'g_tronco',regiao:'garganta',tipo:'bau',   x:620,y:990,da:{item:'botas_neve',n:1,gil:50}},
  {id:'g_cave',  regiao:'garganta',tipo:'bau',   x:1230,y:975,da:{item:'hipocao',n:2,gil:80}},
  // Caverna do lobo (interior)
  {id:'c_acamp', regiao:'caverna',tipo:'bau',   x:440,y:575,da:{gil:80,item:'hipocao',n:2}},
  {id:'c_nicho', regiao:'caverna',tipo:'brilho',x:1262,y:222,da:{item:'eter',n:2,gil:60}},
  {id:'c_lago',  regiao:'caverna',tipo:'brilho',x:1060,y:610,da:{item:'cristal',n:3}},
  {id:'c_tunel', regiao:'caverna',tipo:'brilho',x:260,y:830,da:{item:'fenix',n:1}},
  // Vale dos Lobos
  {id:'v_mirante',regiao:'vale',tipo:'brilho',x:327,y:178,da:{gil:80,item:'hipocao',n:2}},   // ao lado do bau desenhado no mirante
  {id:'v_carroca',regiao:'vale',tipo:'bau',   x:292,y:697,da:{gil:80,item:'eter',n:2}},
  {id:'v_toca',   regiao:'vale',tipo:'brilho',x:690,y:590,da:{item:'cristal',n:2}},
  {id:'v_moinho', regiao:'vale',tipo:'bau',   x:1130,y:330,da:{gil:80,item:'fenix',n:1}},
  {id:'v_lago',   regiao:'vale',tipo:'brilho',x:1200,y:545,da:{item:'eter',n:2}},
  {id:'v_sul',    regiao:'vale',tipo:'brilho',x:1093,y:745,da:{item:'minerio',n:3,gil:40}},
  // PICO DO UIVO (PICO_DO_UIVO.md)
  {id:'p_acamp',  regiao:'pico',tipo:'bau',   x:425,y:592,da:{gil:80,item:'elixir',n:1}},   // na frente do bau desenhado do acampamento
  {id:'p_mirante',regiao:'pico',tipo:'brilho',x:1140,y:520,da:{item:'eter',n:2}},
];
const UI={quem:'jux',menu:false,aba:0,sel:0,loja:null,escolha:null,avisos:[],msgSalvo:0,autoT:0};
const ABAS=['Status','Itens','Equipar','Habilidades','Ecos','Missões','Mapa','Sistema','Bestiário'];
const ABA_HABS=3,ABA_ECOS=4,ABA_MISSOES=5,ABA_MAPA=6,ABA_SALVAR=7,ABA_BESTA=8;
// ---------- GRUPO (MENU_GRUPO.md): quem esta sendo visto em Status / Equipar / Habilidades. Companheiro novo: entra em grupoMenu()
const NOME_GRUPO={jux:'Jux',bino:'Bino',felipe:'Felipe'},COR_GRUPO={jux:'#8fe9ff',bino:'#ffb27a',felipe:'#a8f0a0'};
function grupoMenu(){const g=['jux'];if(typeof JOGO==='object'&&JOGO.bino&&JOGO.bino.ativo&&typeof statusBino==='function')g.push('bino');if(typeof JOGO==='object'&&JOGO.felipe&&JOGO.felipe.ativo&&typeof statusFelipe==='function')g.push('felipe');return g;}
// os companheiros (Status do menu): de onde vem o nivel, os atributos e o texto da funcao
const COMP_MENU={bino:{j:()=>JOGO.bino,st:n=>statusBino(n),funcao:'Bárbaro tanque',l1:'Só dano físico, sem elemento.',l2:'Protege o time e aguenta os golpes.'},
  felipe:{j:()=>JOGO.felipe,st:n=>statusFelipe(n),funcao:'Arqueiro do vento',l1:'Flechas rápidas; habilidades de Vento.',l2:'O mais rápido do time, crítico alto.'}};
function trocaQuem(dir){const g=grupoMenu();if(g.length<2)return;UI.eqLista=null;UI.quem=g[(g.indexOf(UI.quem)+dir+g.length)%g.length];UI.sel=0;som(SOM.ui_mover,.4);}
const ABA_COM_GRUPO=a=>a===0||a===2||a===3||a===4;   // Status, Equipar, Habilidades e Ecos trocam de personagem com Q
function seletorGrupo(cx,cy){const g=grupoMenu();if(!g.includes(UI.quem))UI.quem='jux';
  texto('Personagem:',cx,cy+20,14,'#9fb3d9');
  g.forEach((q,i)=>{const bx=cx+100+i*120,on=q===UI.quem;ctx.fillStyle=on?COR_GRUPO[q]:'rgba(42,58,102,.9)';ctx.beginPath();ctx.roundRect(bx,cy,110,28,7);ctx.fill();
    texto(NOME_GRUPO[q]||q,bx+55,cy+20,16,'#fff','center');ZONAS.push([bx,cy,bx+110,cy+28,()=>{if(UI.quem!==q){UI.quem=q;UI.sel=0;som(SOM.ui_mover,.4);}}]);});
  if(g.length>1)texto('Q: troca de personagem',cx+110+g.length*120,cy+20,12,'#8fa6cc');}
function uiAberto(){return UI.menu||!!UI.loja||!!UI.escolha||!!UI.saves;}
function aviso(txt,cor){UI.avisos.push({txt,cor:cor||'#ffe27a',v:0});}
function pegou(id){return JOGO.pegos.includes(id);}

// ---------- tesouros
function uiCarrega(){
  for(const s of TESOUROS){if(pegou(s.id)||(s.regiao||'vila')!==REGIAO)continue;V.pontos.push({id:'tes_'+s.id,x:s.x,y:s.y,r:26});}
  pontosColeta();if(typeof halvardVila==='function')halvardVila();
  if(typeof colheBestiario==='function')setTimeout(colheBestiario,1200);
  if(typeof pontosChefes==='function'&&!NA_VILA){pontosChefes();setTimeout(()=>{if(typeof colheChefe==='function'&&!fala)colheChefe();},900);}
  if(JOGO.vila){const v=JOGO.vila;if(v.x&&NA_VILA){hero.x=v.x;hero.y=v.y;}if(v.espada&&window.__espada2!==false){hero.espada=true;espadaSobe=99;}}
  if(!NA_VILA&&!(typeof NOVO2!=='undefined'&&NOVO2)&&JOGO[REGIAO]&&JOGO[REGIAO].x){hero.x=JOGO[REGIAO].x;hero.y=JOGO[REGIAO].y;cam.x=hero.x;cam.y=hero.y;}
}
function pegaTesouro(id){
  const s=TESOUROS.find(t=>t.id===id);if(!s||pegou(id))return;JOGO.pegos.push(id);
  const i=V.pontos.findIndex(p=>p.id==='tes_'+id);if(i>=0)V.pontos.splice(i,1);
  const linhas=[];
  if(s.da.gil){JOGO.gil+=s.da.gil;linhas.push(s.da.gil+' gil');}
  if(s.da.item){daItem(s.da.item,s.da.n);linhas.push(ITENS[s.da.item].nome+(s.da.n>1?' x'+s.da.n:''));}
  som(SOM.ui_vez,.7);if(s.tipo==='bau'){s.aberto=true;s.abriu=t;}
  for(let k=0;k<14;k++)poeira.push({x:s.x+rnd(-6,6),y:s.y-rnd(0,10),vx:rnd(-40,40),vy:rnd(-70,-20),v:0});
  fala={linhas:[['✦',(s.tipo==='bau'?'Dentro do baú: ':'Você achou: ')+linhas.join(' e ')+'!']],i:0,letras:0};
  salvaVila();
}
const BAU=window.JUX_BAU||null,BAUI=new Image();if(BAU)BAUI.src=BAU.atlas;
function quadroBau(q,x,y,larg,alpha){const k=larg/BAU.larg;ctx.save();if(alpha!==undefined)ctx.globalAlpha=alpha;
  ctx.drawImage(BAUI,q*BAU.w,0,BAU.w,BAU.h,x-BAU.base[0]*k,y-BAU.base[1]*k,BAU.w*k,BAU.h*k);ctx.restore();}
function uiMundo(){   // desenho no mapa (antes do heroi)
  missoesMundo();if(typeof desenhaChefes==='function')desenhaChefes();
  const temImg=BAU&&BAUI.complete&&BAUI.naturalWidth;
  for(const s of TESOUROS){
    if((s.regiao||'vila')!==REGIAO)continue;
    const aberto=pegou(s.id);
    if(temImg){
      if(s.tipo==='brilho'){if(aberto)continue;const k=.55+.45*Math.sin(t*4+s.x);
        ctx.save();ctx.globalCompositeOperation='lighter';quadroBau(3,s.x,s.y+2,10+6*k,.5+.5*k);ctx.restore();}
      else{const dt_=s.abriu?t-s.abriu:9,q=!aberto?0:dt_<.35?1:2;
        ctx.save();ctx.fillStyle='rgba(10,20,40,.35)';ctx.beginPath();ctx.ellipse(s.x,s.y,9,3,0,0,6.283);ctx.fill();ctx.restore();
        quadroBau(q,s.x,s.y+1,19);
        if(!aberto){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.35+.25*Math.sin(t*3);quadroBau(3,s.x+6,s.y-12,5);ctx.restore();}}
      continue;}
    if(s.tipo==='brilho'){if(aberto)continue;const k=.6+.4*Math.sin(t*4+s.x);
      ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(s.x,s.y-2,0,s.x,s.y-2,7);
      g.addColorStop(0,`rgba(255,240,170,${.75*k})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(s.x-8,s.y-10,16,16);
      ctx.fillStyle=`rgba(255,255,230,${k})`;const r=2+2*k;ctx.fillRect(s.x-r,s.y-2.4,r*2,.8);ctx.fillRect(s.x-.4,s.y-2-r,.8,r*2);ctx.restore();}
    else{   // bau de madeira com ferragens douradas
      const x=s.x-8,y=s.y-11;ctx.save();ctx.fillStyle='rgba(10,20,40,.35)';ctx.beginPath();ctx.ellipse(s.x,s.y,9,3,0,0,6.283);ctx.fill();
      ctx.fillStyle='#6b3f22';ctx.fillRect(x,y+5,16,7);ctx.strokeStyle='#2a1608';ctx.lineWidth=.8;ctx.strokeRect(x,y+5,16,7);
      if(aberto){ctx.fillStyle='#4a2a14';ctx.fillRect(x,y-1,16,5);ctx.fillStyle='#1a0e06';ctx.fillRect(x+1,y+4,14,2);}
      else{ctx.fillStyle='#8a5530';ctx.beginPath();ctx.moveTo(x,y+5);ctx.quadraticCurveTo(s.x,y-2,x+16,y+5);ctx.closePath();ctx.fill();ctx.stroke();}
      ctx.fillStyle='#f0c94c';ctx.fillRect(x+7,y+5,2,3);ctx.fillRect(x,y+8,16,1);
      if(!aberto){ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,230,140,${.25+.2*Math.sin(t*3)})`;ctx.fillRect(x+6,y+3,4,2);}
      ctx.restore();}
  }
}

// ---------- save
function salvaVila(){if(NA_VILA)JOGO.vila={x:Math.round(hero.x),y:Math.round(hero.y),espada:!!hero.espada,abertura:true};
  else{JOGO[REGIAO]={x:Math.round(hero.x),y:Math.round(hero.y)};JOGO.vila=Object.assign(JOGO.vila||{},{espada:!!hero.espada});if(typeof NOVO2!=='undefined'&&NOVO2&&typeof comecou!=='undefined'&&comecou)JOGO.vila.abertura=true;}JOGO.local=REGIAO;salvaJogo();}
function uiPasso(dt){
  for(const a of UI.avisos)a.v+=dt;UI.avisos=UI.avisos.filter(a=>a.v<2.4);
  if(UI.msgSalvo>0)UI.msgSalvo-=dt;
  UI.autoT+=dt;if(UI.autoT>15&&!fala&&!ab.on){UI.autoT=0;salvaVila();}
}

// ---------- conversa com quem vende: escolher Comprar / Conversar
function uiFala(id){
  if(!LOJAS[id]||uiAberto())return false;
  if(id==='vovo'&&typeof diaFestival==='function'&&(diaFestival()||emFestival()||(emManha()&&JOGO.cap2.fase==='manha')))return false;   // na festa ela vai direto ao brinde   // Capitulo 2: na volta/preparativos a Vovo fala direto da historia
  const mk=marcaMissao(id);
  UI.escolha={id,ops:[...(mk?[mk==='!'?'❗ Missão':mk==='✔'?'✔ Entregar':'Missão']:[]),'Comprar','Conversar','Sair'],sel:0};som(SOM.ui_vez,.5);return true;
}
function escolhe(i){const e=UI.escolha;UI.escolha=null;
  if(e.acao){e.acao(i);return;}   // escolha com acao propria (mural e taverna de Brasaria)
  if(e.id==='rio_cap3'){if(i===0&&typeof desceRio==='function')desceRio();else if(i===1){JOGO.trilha=null;vaiPara('trilha.html');}return;}
  if(e.id==='cura_luta'){if(i===0){curaParaLuta();setTimeout(()=>iniciaProva(e.prova,true),900);}
    else if(i===1){UI.menu=true;UI.home=false;UI.aba=1;UI.sel=0;UI.depoisBolsa=e.prova;som(SOM.ui_vez,.5);}
    else iniciaProva(e.prova,true);return;}
  if(e.id==='brinde'){if(i===0&&typeof comecaAtaque==='function')comecaAtaque();else aviso('Aproveite a festa. A Vovó espera.','#c8d8f0');return;}
  if(e.id==='prova'){const q=e.prova||'fenrir';if(i===0&&q==='skoll'&&typeof tocaFilme==='function'&&typeof CENAS_SKOLL!=='undefined'){tocaFilme(CENAS_SKOLL,IMG_SKOLL,()=>iniciaProva('skoll'));return;}if(i===0&&q==='fenrir'&&typeof tocaFilme==='function'&&typeof CENAS_FENRIR!=='undefined'&&REGIAO==='pico'){tocaFilme(CENAS_FENRIR,IMG_FENRIR,()=>iniciaProva('fenrir'));return;}if(i===0)iniciaProva(q);else if(q.startsWith('chefe_'))aviso('Volte quando estiver pronto.','#c8d8f0');else abreFala(q==='skoll'?'caverna_depois':'prova_depois');return;}   // prova de um Eco: lutar agora ou voltar depois
  if(e.ops[i]==='Comprar'){UI.loja={id:e.id,sel:0,modo:'comprar'};som(SOM.ui_vez,.5);}
  else if(e.ops[i]==='Conversar'){UI.pulaLoja=true;UI.soConversa=true;abreFala(e.id);UI.pulaLoja=false;UI.soConversa=false;
    if(e.id==='vovo'&&JOGO.vida&&Object.keys(JOGO.vida).length){encheVida();salvaJogo();setTimeout(()=>aviso('A Vovó enfiou uma sopa quente em todo mundo: HP e MP cheios!','#7dffa8'),400);}}
  else if(e.ops[i]!=='Sair'){UI.pulaLoja=true;abreFala(e.id);UI.pulaLoja=false;}
  else som(SOM.ui_mover,.4);}

// ---------- loja
function itensLoja(){const L=LOJAS[UI.loja.id];
  if(UI.loja.modo==='vender')return Object.keys(JOGO.inv).filter(k=>ITENS[k]&&ITENS[k].venda);
  return L.itens;}
function bloqueado(it){const q=it.req;if(!q)return '';if(q.espada&&!hero.espada)return 'depois da espada';if(q.nivel&&JOGO.nivel<q.nivel)return 'Nv '+q.nivel;return '';}
// pedido 2026-11-19: comprar QUANTOS quiser (so depende do gil), inclusive equipamento repetido; escolhe a quantidade antes (estilo FF)
function podeComprar(id){const it=ITENS[id];if(bloqueado(it))return false;return JOGO.gil>=it.preco;}
const MAX_QTD=99;
function maxQtd(id){const it=ITENS[id];return UI.loja.modo==='vender'?Math.min(MAX_QTD,qtd(id)):Math.min(MAX_QTD,Math.floor(JOGO.gil/Math.max(1,it.preco)));}
function compra(id){   // escolheu o item: abre a caixa de quantidade
  const it=ITENS[id];
  if(UI.loja.modo!=='vender'&&!podeComprar(id)){som(SOM.ui_mover,.5);aviso(bloqueado(it)?'Ainda não: '+bloqueado(it):'Gil insuficiente','#ff9a9a');return;}
  if(UI.loja.modo==='vender'&&(!qtd(id)||!it.venda))return;
  UI.loja.qtd={id,n:1};som(SOM.ui_mover,.4);}
function mudaQtd(d){const q=UI.loja.qtd,mx=Math.max(1,maxQtd(q.id));q.n=Math.max(1,Math.min(mx,q.n+d));som(SOM.ui_mover,.3);}
function confirmaQtd(){const q=UI.loja.qtd,id=q.id,it=ITENS[id],n=Math.max(1,Math.min(q.n,maxQtd(id)));UI.loja.qtd=null;if(!n||!maxQtd(id))return;
  if(UI.loja.modo==='vender'){JOGO.gil+=it.venda*n;tiraItem(id,n);som(SOM.ui_vez,.6);aviso('+'+it.venda*n+' gil');salvaJogo();return;}
  JOGO.gil-=it.preco*n;let resto=n;
  if(EQUIPAVEL.includes(it.tipo)){const q2=donoItem(it),E=equipDe(q2),sl=slotPara(it,q2);
    if(!E[sl]){E[sl]=id;resto--;aviso(it.nome+' equipado'+(q2!=='jux'?' no '+NOME_GRUPO[q2]:'')+(resto?' (+'+resto+' na bolsa)':'')+'!','#bff4ff');}
    else aviso(it.nome+' ×'+n+' guardado na bolsa');}
  else aviso(it.nome+' ×'+n+'  (−'+it.preco*n+' gil)');
  if(resto)daItem(id,resto);
  som(SOM.ui_vez,.6);salvaJogo();
}

// prévia: como ficam os atributos do Jux com este item (equipado / afiado / comido)
const NOMES_ST=[['hp','HP'],['mp','MP'],['atk','ATQ'],['def','DEF'],['atkm','ATQ.M'],['defm','DEF.M'],['vel','VEL'],['crit','Crít%'],['esq','Esq%']];
const statusDe=q=>COMP_MENU[q]?COMP_MENU[q].st(COMP_MENU[q].j().nivel):statusJux();
function quemPrevia(it){if(it.tipo==='arma')return donoItem(it);return grupoMenu().includes(UI.quem)?UI.quem:'jux';}
function previa(id,q){const it=ITENS[id];if(!it)return null;q=q||quemPrevia(it);
  const E=equipDe(q),antes=statusDe(q),sv={eq:{...E},bf:JOGO.buff};
  if(EQUIPAVEL.includes(it.tipo))E[slotPara(it,q)]=id;
  else if(it.tipo==='comida'&&q==='jux')JOGO.buff={id,lutas:it.lutas};
  else return null;
  const depois=statusDe(q);Object.assign(E,sv.eq);JOGO.buff=sv.bf;
  return NOMES_ST.map(([k,n])=>[n,antes[k],depois[k]]).filter(r=>r[1]!==r[2]);}
function desenhaPrevia(id,x,y,w){const it=ITENS[id],q=it?quemPrevia(it):'jux',p=previa(id,q);if(!p)return false;
  if(!p.length){texto('Sem mudança (você já tem algo igual ou melhor).',x,y,15,'#c8d8f0');return true;}
  let xx=x;if(grupoMenu().length>1){texto(NOME_GRUPO[q]+':',xx,y,15,COR_GRUPO[q]);xx+=52;}for(const [n,a,d] of p){const dif=d-a,cor=dif>0?'#7dffa8':'#ff9a9a';
    ctx.font='bold 15px "Trebuchet MS"';const wn=ctx.measureText(n).width+8;texto(n,xx,y,15,'#9fe8ff');texto(a+' → ',xx+wn,y,15,'#fff');ctx.font='bold 15px "Trebuchet MS"';const w1=ctx.measureText(a+' → ').width;
    texto(String(d),xx+wn+w1,y,15,cor);const w2=ctx.measureText(String(d)).width;texto((dif>0?' (+':' (')+dif+')',xx+wn+w1+w2,y,13,cor);
    xx+=wn+w1+w2+ctx.measureText(' (+'+dif+')').width+22;}
  return true;}
// ---------- menu
function itensBolsa(){return Object.keys(JOGO.inv).filter(k=>ITENS[k]);}
// 'Curar com pocoes' antes da luta: Pena de Fenix em quem caiu, depois Pocao / Hi-Pocao ate encher (gasta o minimo)
function curaParaLuta(){const gasto={};const usa=id=>{tiraItem(id);gasto[id]=(gasto[id]||0)+1;};
  for(const q of grupoMenu()){let v=vidaAtual(q),hp=v.hp;
    if(hp<=0){if(qtd('fenix')>0){usa('fenix');hp=Math.round(v.max*ITENS.fenix.revive);}else continue;}
    for(let n=0;n<60&&hp<v.max;n++){const falta=v.max-hp,id=falta>ITENS.pocao.cura&&qtd('hipocao')>0?'hipocao':qtd('pocao')>0?'pocao':qtd('hipocao')>0?'hipocao':null;
      if(!id)break;usa(id);hp=Math.min(v.max,hp+ITENS[id].cura);}
    if(hp!==v.hp)guardaVida(q,hp,v.mp);}
  const l=Object.keys(gasto).map(id=>gasto[id]+'x '+ITENS[id].nome);
  if(l.length){salvaJogo();som(SOM.ui_vez,.6);aviso('Curados! Gastou: '+l.join(', ')+'.','#7dffa8');}
  else aviso('Sem poções na bolsa: vão assim mesmo.','#ff9a9a');}
// fechou a bolsa aberta pelo aviso de cura: a luta continua (pergunta de novo se ainda estiver ferido)
setInterval(()=>{if(UI.depoisBolsa&&!uiAberto()){const n=UI.depoisBolsa;UI.depoisBolsa=null;if(typeof iniciaProva==='function')iniciaProva(n);}},250);
function usaItem(id){const it=ITENS[id];
  if(it.repele){JOGO.repelente=it.repele;tiraItem(id);som(SOM.ui_vez,.6);aviso('Repelente ativo: '+it.repele+' passos sem lutas fora da vila.','#c8b0ff');salvaJogo();return;}
  if(it.tipo==='comida'){JOGO.buff={id,lutas:it.lutas};tiraItem(id);som(SOM.ui_vez,.6);aviso(it.nome+': '+it.desc,'#7dffa8');salvaJogo();return;}
  if(EQUIPAVEL.includes(it.tipo)){const q=quemPrevia(it),E=equipDe(q),sl=slotPara(it,q),old=E[sl];E[sl]=id;tiraItem(id);if(old)daItem(old);som(SOM.ui_vez,.6);aviso(it.nome+' equipado'+(grupoMenu().length>1?' em '+NOME_GRUPO[q]:'')+'!','#bff4ff');salvaJogo();return;}
  if(it.tipo==='consumivel'&&(it.cura||it.mp||it.revive)){   // fora da luta: vai para quem mais precisa (HP ou MP)
    const quem=grupoMenu(),V=quem.map(q=>[q,vidaAtual(q)]),falta=([q,v])=>it.revive?(v.hp<=1?1:0):it.cura&&it.mp?(1-v.hp/v.max)+(1-v.mp/v.mmax):it.mp?1-v.mp/v.mmax:1-v.hp/v.max;
    const alvo=V.filter(a=>falta(a)>0).sort((a,b)=>falta(b)-falta(a))[0];
    if(!alvo){som(SOM.ui_mover,.5);aviso(it.revive?'Ninguém caído.':'Todos já estão cheios.','#c8d8f0');return;}
    const [q,v]=alvo;let hp=v.hp,mp=v.mp;if(it.revive)hp=Math.max(hp,Math.round(v.max*it.revive));if(it.cura)hp=Math.min(v.max,hp+it.cura);if(it.mp)mp=Math.min(v.mmax,mp+it.mp);
    guardaVida(q,hp,mp);tiraItem(id);som(SOM.ui_vez,.6);aviso(NOME_GRUPO[q]+': '+(hp>v.hp?'+'+(hp-v.hp)+' HP ':'')+(mp>v.mp?'+'+(mp-v.mp)+' MP':''),'#7dffa8');salvaJogo();return;}
  som(SOM.ui_mover,.5);aviso(it.tipo==='consumivel'?'Use na batalha.':'Não dá para usar agora.','#ff9a9a');}
function opcoesSlot(s){const E=equipDe(UI.quem);return [...new Set([null,E[s],...itensBolsa().filter(k=>ITENS[k].tipo===tipoDoSlot(s)&&serveEm(ITENS[k],UI.quem))].filter(x=>x!==undefined))];}
// lista de escolha do Equipar: o que esta equipado primeiro, depois o que serve da bolsa, por ultimo 'tirar'
function listaEq(s){const cur=equipDe(UI.quem)[s]||null,ops=opcoesSlot(s).filter(x=>x&&x!==cur);return [...(cur?[cur]:[]),...ops,...(cur?[null]:[])];}
function abreEqLista(){const s=(SLOTS_EQ[UI.sel]||SLOTS_EQ[0])[0],l=listaEq(s);if(!l.length){som(SOM.ui_mover,.4);aviso('Nada na bolsa para este espaço','#c8d8f0');return;}UI.eqLista={sel:0};som(SOM.ui_vez,.4);}
function equipaEscolha(){const s=SLOTS_EQ[UI.sel][0],E=equipDe(UI.quem),cur=E[s]||null,nx=listaEq(s)[UI.eqLista.sel];UI.eqLista=null;
  if(nx===undefined||nx===cur){som(SOM.ui_mover,.4);return;}if(cur)daItem(cur);if(nx)tiraItem(nx);E[s]=nx;som(SOM.ui_vez,.6);
  aviso(nx?ITENS[nx].nome+' equipado'+(grupoMenu().length>1?' em '+NOME_GRUPO[UI.quem||'jux']:'')+'!':'Removido','#bff4ff');salvaJogo();}
function assisteFilme(k){const f=FILMES[k];if(!f||!filmeVisto(f)){som(SOM.ui_mover,.4);aviso('Você ainda não viu esta cutscene','#ff9a9a');return;}UI.cines=null;fecha();reverFilme(f.id);}
function trocaSlot(s,dir){const E=equipDe(UI.quem),ops=opcoesSlot(s),cur=E[s]||null,i=ops.indexOf(cur),nx=ops[(i+dir+ops.length)%ops.length];
  if(nx===cur)return;if(cur)daItem(cur);if(nx)tiraItem(nx);E[s]=nx;som(SOM.ui_mover,.5);salvaJogo();}
const SALVAR_OPS=['Volume da música','Volume dos efeitos','Volume das vozes','Velocidade do texto','Tremor da tela','Dicas do tutorial','Controles do teclado','Rever cutscenes','Salvar (escolher o espaço)','Carregar um espaço','Capítulos (voltar a um ponto)','Exportar o save (arquivo)','Importar um save (arquivo)','Novo jogo (apaga o progresso)'];
// SAVE EM ARQUIVO (2026-11-19): leva o progresso para outro navegador/computador (o save fica no navegador, separado por site)
function exportaSave(){salvaVila();const d={jogo:'jux-lamina-de-gelo',v:1,quando:new Date().toISOString(),dados:{}};
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('jux_')&&k!=='jux_pag_viva'&&k!=='jux_encontro')d.dados[k]=localStorage.getItem(k);}
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:'application/json'}));
  a.download='jux_save_nv'+JOGO.nivel+'_'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
  som(SOM.ui_vez,.6);aviso('Save exportado (veja a pasta de downloads)','#7dffa8');}
function importaSave(){const inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';
  inp.onchange=()=>{const fl=inp.files&&inp.files[0];if(!fl)return;const rd=new FileReader();rd.onload=()=>importaDados(rd.result);rd.readAsText(fl);};inp.click();}
function importaDados(texto){{try{const d=JSON.parse(texto);
    if(!d||d.jogo!=='jux-lamina-de-gelo'||!d.dados||!d.dados.jux_save){aviso('Esse arquivo não é um save do Jux.','#ff9a9a');som(SOM.ui_mover,.5);return;}
    if(!confirm('Trocar o progresso atual pelo save do arquivo? O progresso atual será perdido.'))return;
    for(const k of Object.keys(localStorage))if(k.startsWith('jux_')&&k!=='jux_pag_viva')localStorage.removeItem(k);
    for(const [k,v] of Object.entries(d.dados))localStorage.setItem(k,v);
    let r='vila';try{const sv=JSON.parse(d.dados.jux_save);if(sv&&sv.local)r=sv.local;}catch(e){}window.__importou=true;location.href=r+'.html?t='+Date.now();
  }catch(e){aviso('Não consegui ler esse arquivo.','#ff9a9a');}}}
const VOL_OPS=['mus','sfx','voz'];
function acaoSalvar(i,dir){
  if(i===3){const k=VEL_TEXTO.findIndex(v=>v[0]===OPC.texto),n=(Math.max(0,k)+(dir===-1?VEL_TEXTO.length-1:1))%VEL_TEXTO.length;OPC.texto=VEL_TEXTO[n][0];salvaOpc();som(SOM.ui_mover,.6);return;}
  if(i===4){OPC.tremor=!OPC.tremor;salvaOpc();som(SOM.ui_mover,.6);return;}
  if(i===5){OPC.dicas=OPC.dicas===false;salvaOpc();som(SOM.ui_mover,.6);aviso(OPC.dicas===false?'Dicas do tutorial desligadas':'Dicas do tutorial ligadas',OPC.dicas===false?'#ffb0b0':'#7dffa8');return;}
  if(i===6){UI.controles=!UI.controles;UI.cines=null;som(SOM.ui_vez,.5);return;}
  if(i===7){UI.cines={sel:0};UI.controles=false;som(SOM.ui_vez,.5);return;}
  if(i>7)i-=5;
  if(i<3){mudaVol(VOL_OPS[i],VOL[VOL_OPS[i]]+.1*(dir||1)>1.001&&!dir?0:VOL[VOL_OPS[i]]+.1*(dir||1));som(SOM.ui_mover,.6);return;}i-=3;if(i===0){if(typeof abreSaves==='function')abreSaves('salvar');else{salvaVila();UI.msgSalvo=2;som(SOM.ui_vez,.6);aviso('Jogo salvo!','#7dffa8');}}
  else if(i===1){if(typeof abreSaves==='function')abreSaves('carregar');}else if(i===2){if(typeof abreSaves==='function')abreSaves('caps');}
  else if(i===3)exportaSave();else if(i===4)importaSave();
  else if(UI.confirmaNovo){novoJogo();location.reload();}else{UI.confirmaNovo=true;aviso('Toque de novo para confirmar','#ff9a9a');som(SOM.ui_mover,.5);}}

// ---------- Ecos
const ECO_ORDEM=['lamina','arcano','guardiao','sabio','sombra','quebrador'];
const ecoLista=()=>ECO_ORDEM;
// de quem e a aba Ecos agora (Q troca): Jux ou Bino
const quemEco=()=>grupoMenu().includes(UI.quem)?UI.quem:'jux';
function ecoVisto(){return UI.ecoVer||vagaEco(quemEco()).equip||estadoEcos().equip||'lamina';}
function acaoEco(i){const E=estadoEcos(),q=quemEco(),S=vagaEco(q);
  if(!UI.ecoCol){const id=ECO_ORDEM[i];UI.ecoVer=id;if(!E.tem.includes(id)){som(SOM.ui_mover,.5);aviso('Eco ainda não encontrado','#ff9a9a');return;}
    if(S.equip!==id){const de0=donoEco(id),atual=S.equip,agora=performance.now();
      if((atual||de0)&&!(UI.ecoConf===id+q&&agora-UI.ecoConfT<6000)){UI.ecoConf=id+q;UI.ecoConfT=agora;som(SOM.ui_vez,.4);
        aviso(de0?ECOS[id].nome+' está com o '+NOME_QUEM[de0]+'. ENTER de novo: passar para o '+NOME_QUEM[q]+' (o '+NOME_QUEM[de0]+' fica sem Eco)'
          :'Trocar '+ECOS[atual].nome+' por '+ECOS[id].nome+' no '+NOME_QUEM[q]+'? ENTER de novo para confirmar','#ffcf7a');return;}
      UI.ecoConf=null;const de=equipaEco(id,q);som(SOM.ui_vez,.6);
      aviso(de?ECOS[id].nome+' passou de '+NOME_QUEM[de]+' para '+NOME_QUEM[q]+' ('+NOME_QUEM[de]+' ficou sem Eco)':ECOS[id].nome+' equipado em '+NOME_QUEM[q]+'!',ECOS[id].cor);salvaJogo();}
    else{UI.ecoCol=1;UI.sel=0;}return;}
  const h=ECOS[ecoVisto()].habs[i],r=trocaHab(h,q);
  if(r==='auto'){som(SOM.ui_mover,.4);aviso('Passiva do Eco equipado: já está sempre ligada','#ffe27a');return;}
  if(r==='moveu'){som(SOM.ui_vez,.5);aviso(HABS[h].nome+' passou de '+NOME_QUEM[trocaHab.de]+' para '+NOME_QUEM[q],'#ffe27a');salvaJogo();return;}
  if(r==='pos'){som(SOM.ui_vez,.5);salvaJogo();}else if(r==='tirou'){som(SOM.ui_mover,.4);salvaJogo();}
  else{som(SOM.ui_mover,.5);aviso(r==='sem_ap'?'AP insuficiente (tire outra habilidade)':'Suba o nível do Eco para aprender','#ff9a9a');}}
// retratos dos Ecos (ecos_retratos.js, tools/cut_retratos.py); sem retrato fica a bolinha de cor
const RETRATO_ECO={};for(const k in (window.JUX_RETRATOS_ECOS||{})){const im=new Image();im.src=JUX_RETRATOS_ECOS[k];RETRATO_ECO[k]=im;}
const retratoOk=id=>RETRATO_ECO[id]&&RETRATO_ECO[id].complete&&RETRATO_ECO[id].naturalWidth;
// ---------- aba HABILIDADES: as do Jux (jux_habs.js); ENTER liga/desliga (desligada some da batalha e do AUTO)
// habilidades do menu: as do Jux e, depois que ele entra no time, as do Bino (ids b_*)
const temBinoMenu=()=>typeof HAB_BINO!=='undefined'&&!!(JOGO.bino&&JOGO.bino.ativo);
const temFelipeMenu=()=>typeof HAB_FELIPE!=='undefined'&&!!(JOGO.felipe&&JOGO.felipe.ativo);
const habsMenu=()=>(UI.quem==='bino'&&temBinoMenu())?HAB_BINO:(UI.quem==='felipe'&&temFelipeMenu())?HAB_FELIPE.filter(h=>h.feito):HAB_JUX;
const nvHab=q=>q.id.startsWith('b_')?((JOGO.bino||{}).nivel||1):q.id.startsWith('f_')?((JOGO.felipe||{}).nivel||1):JOGO.nivel;
function alternaHab(i){const h=habsMenu()[i];if(!h)return;
  if(nvHab(h)<h.nivel){som(SOM.ui_mover,.4);aviso('Aprende no nível '+h.nivel,'#ff9a9a');return;}
  if(!JOGO.habOff)JOGO.habOff={};if(JOGO.habOff[h.id])delete JOGO.habOff[h.id];else JOGO.habOff[h.id]=true;
  som(SOM.ui_vez,.5);aviso(h.nome+(habLigada(h.id)?': ligada':': desligada'),habLigada(h.id)?'#7dffa8':'#ffb0b0');salvaJogo();}
function desenhaHabs(cx,cy,w,h,y){const L=habsMenu(),linha=34,vis=Math.floor((y+h-cy-62)/linha),top=Math.max(0,Math.min(UI.sel-Math.floor(vis/2),L.length-vis));
  texto((COMP_MENU[UI.quem]&&grupoMenu().includes(UI.quem)?NOME_GRUPO[UI.quem]+' Nv '+COMP_MENU[UI.quem].j().nivel:'Jux Nv '+JOGO.nivel)+' · '+L.filter(q=>q.nivel<=nvHab(q)).length+' de '+L.length+' habilidades aprendidas',cx,cy-4,13,'#9fe8ff');
  L.slice(top,top+vis).forEach((q,j)=>{const i=top+j,yy=cy+8+j*linha,sabe=q.nivel<=nvHab(q),lig=habLigada(q.id);
    linhaSel(cx,yy,340,linha-3,i===UI.sel);
    const c=sabe?(lig?'#7dffa8':'#ff9a9a'):'#5a6688';ctx.strokeStyle=c;ctx.lineWidth=2;ctx.strokeRect(cx+12,yy+7,14,14);if(sabe&&lig){ctx.fillStyle=c;ctx.fillRect(cx+15,yy+10,8,8);}
    texto((q.ressonancia||q.especial?'★ ':q.id.startsWith('b_')?'▣ ':'✦ ')+q.nome.replace('Ressonância','Ress.'),cx+36,yy+20,14,sabe?(lig?'#fff':'#9a9ab0'):'#5a6688');
    texto(sabe?(q.mp?q.mp+' MP':'barra'):'Nv '+q.nivel,cx+328,yy+20,12,sabe?'#9fe8ff':'#5a6688','right');
    ZONAS.push([cx,yy,cx+340,yy+linha-3,()=>{UI.sel=i;alternaHab(i);}]);});
  if(L.length>vis){texto('▲ ▼ role a lista ('+(UI.sel+1)+'/'+L.length+')',cx+170,y+h-48,11,'#8fa6cc','center');}
  const q=L[UI.sel]||L[0],x2=cx+370,ww=w-410,sabe=q.nivel<=nvHab(q),lig=habLigada(q.id);let yy=cy+14;
  texto(q.nome,x2,yy,19,'#ffe27a');yy+=26;
  texto(sabe?(lig?'✔ Ligada':'✖ Desligada'):'🔒 Aprende no nível '+q.nivel,x2,yy,15,sabe?(lig?'#7dffa8':'#ff9a9a'):'#9a9ab0');yy+=26;
  texto('Tipo: '+(q.id.startsWith('b_')?'Bino · físico (menu Habilidades na batalha)':q.id.startsWith('f_')?'Felipe · flecha (menu Habilidades na batalha)':q.ressonancia?'Ressonância (usa a barra cheia)':'Magia (menu Magia na batalha)'),x2,yy,14,'#c8d8f0');yy+=22;
  texto(q.mp?'Custo: '+q.mp+' MP':'Custo: barra de Ressonância',x2,yy,14,'#9fe8ff');yy+=24;
  // ficha com os numeros (habs_ficha.js): dano em % do ataque normal, alvos, cura, defesa, duracao e efeitos
  const quebraTxt=(txt,x,tam,cor,larg)=>{ctx.font=`bold ${tam}px "Trebuchet MS"`;let lin='';for(const p of String(txt).split(' ')){if(lin&&ctx.measureText(lin+p).width>larg){texto(lin,x,yy,tam,cor);yy+=tam+5;lin='';}lin+=p+' ';}if(lin){texto(lin,x,yy,tam,cor);yy+=tam+5;}};
  const F=(typeof FICHA_HAB!=='undefined')&&FICHA_HAB[q.id];
  if(F){ctx.fillStyle='rgba(40,70,120,.35)';ctx.fillRect(x2-8,yy-16,ww+16,1);yy+=4;
    for(const [rot,val,cor] of F){texto(rot+':',x2,yy,14,'#9fb3d9');const y0=yy;quebraTxt(val,x2+104,14,cor||'#e8f6ff',ww-104);if(yy===y0)yy+=19;}
    yy+=6;ctx.fillStyle='rgba(40,70,120,.35)';ctx.fillRect(x2-8,yy-12,ww+16,1);yy+=8;}
  quebraTxt(q.desc,x2,14,'#c8d8f0',ww);
  if(F){yy+=4;quebraTxt('% = em relação ao ataque normal de '+(NOME_GRUPO[UI.quem]||'Jux')+'; muda com ATQ, defesa, fraqueza e crítico.',x2,11,'#7a8aa8',ww);yy-=2;}   // quebra em 2 linhas: nao passa do painel
  yy+=10;const eq=(typeof vagaEco==='function')?vagaEco(COMP_MENU[UI.quem]?UI.quem:'jux').equipadas.filter(k=>HABS[k]&&!HABS[k].passiva):[];
  texto('Habilidades de Eco equipadas: '+(eq.length?eq.map(k=>HABS[k].nome).join(', '):'nenhuma'),x2,yy,12,'#b8a6e8');texto('(gerencie na aba Ecos)',x2,yy+16,11,'#7a8aa8');
  texto('▲ ▼ escolhe · ENTER: liga ou desliga · Q: personagem · desligada não aparece na batalha nem no AUTOMÁTICO',cx,y+h-20,12,'#c8d8f0');}
function desenhaEcos(cx,cy,w,h,y){const E=estadoEcos(),q=quemEco(),S=vagaEco(q),ap=apUsado(q),lim=limiteAP(nivelQuem(q)),ver=ecoVisto(),apr=aprendidas();
  // AP
  texto('AP de '+NOME_QUEM[q],cx+w-228,cy-6,14,'#9fe8ff','right');ctx.fillStyle='rgba(42,58,102,.9)';ctx.fillRect(cx+w-220,cy-16,150,10);ctx.fillStyle=ap>lim?'#ff9a9a':'#ffe27a';ctx.fillRect(cx+w-220,cy-16,150*Math.min(1,ap/lim),10);
  texto(ap+' / '+lim,cx+w-60,cy-6,14,'#ffe27a','right');
  // coluna dos Ecos
  ECO_ORDEM.forEach((id,i)=>{const e=ECOS[id],tem=E.tem.includes(id),yy=cy+6+i*44,on=!UI.ecoCol&&UI.sel===i;
    linhaSel(cx,yy,250,40,on||(UI.ecoCol&&id===ver));
    if(tem&&retratoOk(id)){ctx.save();ctx.beginPath();ctx.arc(cx+28,yy+20,16,0,6.283);ctx.fillStyle='#0c1a3a';ctx.fill();ctx.clip();ctx.drawImage(RETRATO_ECO[id],cx+12,yy+4,32,32);ctx.restore();
      ctx.beginPath();ctx.arc(cx+28,yy+20,16,0,6.283);ctx.strokeStyle=S.equip===id?'#fff':e.cor;ctx.lineWidth=2;ctx.stroke();}
    else{ctx.fillStyle=tem?e.cor:'#3a4466';ctx.beginPath();ctx.arc(cx+28,yy+20,11,0,6.283);ctx.fill();
    if(S.equip===id){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();}}
    texto(tem?e.nome:'???',cx+46,yy+18,15,tem?'#fff':'#5a6688');
    {const d=tem&&donoEco(id);if(d)texto((d===q?'✔ no ':'no ')+NOME_QUEM[d],cx+244,yy+18,11,d===q?'#7dffa8':(COR_GRUPO[d]||'#ffb27a'),'right');}
    if(tem){const nv=nivelDoEco(id),a=PE_NIVEL[nv-1]||0,b=PE_NIVEL[nv]||PE_NIVEL[NIVEL_MAX_ECO-1];texto(e.papel+' · Nv '+nv,cx+46,yy+34,11,'#9fb3d9');
      ctx.fillStyle='rgba(42,58,102,.9)';ctx.fillRect(cx+160,yy+28,80,5);ctx.fillStyle=e.cor;ctx.fillRect(cx+160,yy+28,nv>=NIVEL_MAX_ECO?80:80*(peDe(id)-a)/(b-a),5);}
    ZONAS.push([cx,yy,cx+250,yy+40,()=>{UI.ecoCol=0;UI.sel=i;UI.ecoVer=id;acaoEco(i);}]);});
  // detalhes do Eco visto + habilidades
  const e=ECOS[ver],x2=cx+270;
  if(!E.tem.includes(ver)){   // Eco que ainda nao foi conquistado: segredo
    texto('???',x2,cy+30,22,'#7a8aa8');texto('Um Eco ainda adormecido.',x2,cy+62,15,'#c8d8f0');texto('Cumpra a missão da história para encontrá-lo e provar o seu valor.',x2,cy+86,14,'#9fb3d9');
    if(!Object.keys(MISSOES).some(k=>MISSOES[k].rec&&MISSOES[k].rec.eco===ver))texto('(Ainda não há pistas sobre ele.)',x2,cy+112,13,'#5a6688');
    return;}
  if(retratoOk(ver)){const rx=cx+w-102,ry=cy+2;ctx.fillStyle='#0c1a3a';ctx.beginPath();ctx.roundRect(rx,ry,74,74,8);ctx.fill();ctx.drawImage(RETRATO_ECO[ver],rx+1,ry+1,72,72);
    ctx.strokeStyle=e.cor;ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(rx,ry,74,74,8);ctx.stroke();}
  texto(e.nome,x2,cy+22,19,e.cor);textoCabe(e.desc,x2,cy+42,13,'#c8d8f0',(cx+w-112)-x2);
  {const nv=nivelDoEco(ver),pe=peDe(ver),A=PE_NIVEL[nv-1]||0,B=PE_NIVEL[nv]||PE_NIVEL[NIVEL_MAX_ECO-1],xr=cx+w-114,bw=170,k=nv>=NIVEL_MAX_ECO?1:Math.max(0,Math.min(1,(pe-A)/(B-A)));   // 2026-11-21: 'como aparece se ele ta upando?' -> PE e quanto falta, bem visivel
    ctx.fillStyle='rgba(42,58,102,.95)';ctx.fillRect(xr-bw,cy+4,bw,7);ctx.fillStyle=e.cor;ctx.fillRect(xr-bw,cy+4,bw*k,7);ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1;ctx.strokeRect(xr-bw+.5,cy+4.5,bw-1,6);
    texto(nv>=NIVEL_MAX_ECO?'Nv máximo':'Nv '+nv+' · faltam '+(B-pe)+' PE p/ o Nv '+(nv+1),xr,cy+24,11,'#e8f6ff','right');}
  texto('Bônus: '+Object.entries(e.bonus).map(([k,v])=>(NOMES_ATRIB[k]||k)+' +'+(v<1?Math.round(v*100)+'%':v)).join(', '),x2,cy+60,13,'#7dffa8');
  {const dn=donoEco(ver),bx=cx+w-112,bw=190,by=cy+47,ok=S.equip===ver,txt=ok?'✔ Equipado no '+NOME_QUEM[q]:dn?'Passar para o '+NOME_QUEM[q]:'Equipar no '+NOME_QUEM[q];
    ctx.fillStyle=ok?'rgba(60,140,90,.55)':'rgba(255,207,122,.22)';ctx.strokeStyle=ok?'#7dffa8':'#ffcf7a';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(bx-bw,by,bw,18,6);ctx.fill();ctx.stroke();
    texto(txt,bx-bw/2,by+14,12,ok?'#d8ffe0':'#ffe9b8','center');if(!ok)ZONAS.push([bx-bw,by,bx,by+18,()=>{UI.ecoCol=0;UI.sel=ECO_ORDEM.indexOf(ver);acaoEco(UI.sel);}]);}
  texto('Nv '+nivelDoEco(ver)+' · por nível: '+textoPorNivel(ver),x2,cy+77,12,'#ffe27a');texto(TEXTO_MARCO,x2,cy+92,11,'#c8b27a');
  const top=cy+100,compacto=e.habs.length>7,passo=Math.min(42,Math.floor((y+h-50-top)/e.habs.length)),alt=Math.min(38,passo-2);   // com 7 habilidades as linhas apertam para nao bater no rodape
  e.habs.forEach((hb,i)=>{const H=HABS[hb],sabe=apr.includes(hb),auto=passivaDoEco(hb,q),eq=auto||S.equipadas.includes(hb),outro=donoHab(hb),yy=top+i*passo,on=UI.ecoCol&&UI.sel===i;
    linhaSel(x2,yy,w-290,alt,on);
    const ce=auto?'#ffe27a':'#7dffa8';ctx.strokeStyle=eq?ce:'#5a6688';ctx.lineWidth=2;const qy=yy+(alt-16)/2;ctx.strokeRect(x2+18,qy,16,16);if(eq){ctx.fillStyle=ce;ctx.fillRect(x2+22,qy+4,8,8);}
    if(compacto){textoCabe((H.passiva?'◆ ':'✦ ')+H.nome,x2+44,yy+alt*.68,14,sabe?'#fff':'#5a6688',170);
      cortaTxt((sabe?'':'Nv '+H.nv+': ')+H.desc.replace(/^Passiva: /,'')+(H.mp&&sabe?'  MP '+H.mp:''),x2+214,yy+alt*.68,11,sabe?'#9fb3d9':'#6a7698',(x2+w-352)-(x2+214));
      texto(auto?'grátis':outro&&outro!==q?'com o '+NOME_QUEM[outro]:'AP '+H.ap,x2+w-306,yy+alt*.68,13,outro&&outro!==q?(COR_GRUPO[outro]||'#ffb27a'):'#ffe27a','right');}
    else{texto((H.passiva?'◆ ':'✦ ')+H.nome,x2+44,yy+16,15,sabe?'#fff':'#5a6688');
    cortaTxt(sabe?H.desc+(H.mp?'  MP '+H.mp:''):'Aprende no Nv '+H.nv+' do Eco: '+H.desc,x2+44,yy+alt-5,11,sabe?'#9fb3d9':'#6a7698',w-400);
    texto(auto?'grátis (Eco equipado)':outro&&outro!==q?'com o '+NOME_QUEM[outro]:'AP '+H.ap,x2+w-306,yy+22,13,outro&&outro!==q?(COR_GRUPO[outro]||'#ffb27a'):'#ffe27a','right');}
    ZONAS.push([x2,yy,x2+w-290,yy+alt,()=>{UI.ecoCol=1;UI.sel=i;acaoEco(i);}]);});
  if(UI.ecoCol&&e.habs[UI.sel]){const H=HABS[e.habs[UI.sel]];textoCabe(H.nome+': '+H.desc+(H.mp?'  (MP '+H.mp+')':'')+(apr.includes(e.habs[UI.sel])?'':'  — aprende no Nv '+H.nv+' do Eco'),cx,y+h-38,13,'#ffe9b8',w-48);}
  textoCabe('◀ ▶ troca de coluna · ENTER: equipar Eco / ligar ou desligar'+(grupoMenu().length>1?' · Q: personagem (cada um usa um Eco diferente)':'')+' · ✦ ativa · ◆ passiva',cx,y+h-20,12,'#c8d8f0',w-48);
}
// ---------- Diário de missões
function listaDiario(){const at=[],fe=[];for(const k of ORDEM_MISSOES){const s=estadoMissao(k);if(s==='ativa')at.push(k);else if(s==='feita')fe.push(k);}return ['_historia',...(JOGO.ordemSabe?['_ordem']:[]),...at,...fe];}
function desenhaDiario(cx,cy,w,h,y){const l=listaDiario(),sel=l[UI.sel]||'_historia';
  // lista com rolagem (2026-11-20): so cabem N missoes na janela; o resto aparece ao descer com ▲▼
  const N=Math.max(3,Math.floor((y+h-34-(cy+6))/40)),top=Math.max(0,Math.min(UI.sel-N+2,l.length-N));
  if(l.length>N){const xs=cx+311,pu=top>0,pd=top+N<l.length;texto('▲',xs,cy+24,16,pu?'#7fd6f5':'#3a4a6a','center');texto('▼',xs,cy+6+N*40-14,16,pd?'#7fd6f5':'#3a4a6a','center');
    ZONAS.push([xs-14,cy+6,xs+14,cy+40,()=>{if(pu)UI.sel=Math.max(0,top-1);}]);ZONAS.push([xs-14,cy+N*40-34,xs+14,cy+6+N*40,()=>{if(pd)UI.sel=Math.min(l.length-1,top+N);}]);}
  l.forEach((k,i)=>{if(i<top||i>=top+N)return;const yy=cy+6+(i-top)*40;linhaSel(cx,yy,300,36,i===UI.sel);
    if(k==='_historia'){texto('★ '+(hero.espada?'Além de Invernália':'A lâmina no altar'),cx+22,yy+23,15,'#ffe27a');}
    else if(k==='_ordem'){texto('◉ A Ordem do Eclipse',cx+22,yy+23,15,'#ff8a8a');}
    else{const st=estadoMissao(k),pr=missaoPronta(k);texto((st==='feita'?'✓ ':pr?'✔ ':'! ')+MISSOES[k].nome,cx+22,yy+23,15,st==='feita'?'#7a8aa8':pr?'#7dffa8':'#fff');if(JOGO.rastreio===k&&st==='ativa')formaMarca(ctx,'losango',cx+276,yy+18,6,COR_S);else if(MISSOES[k].principal&&st==='ativa')formaMarca(ctx,'estrela',cx+276,yy+18,7,COR_P);
      }
    ZONAS.push([cx,yy,cx+300,yy+36,()=>{UI.sel=i;}]);});
  if(l.length===1)['Nenhuma missão ainda.','Converse com os moradores','com ! em cima da cabeça.'].forEach((t,k)=>texto(t,cx+10,cy+76+k*18,13,'#9fb3d9'));   // em linhas: cabe na coluna da lista
  const x2=cx+330,ww=w-370;let yy=cy+24;
  const quebra=(s,tam,cor)=>{ctx.font=`bold ${tam}px "Trebuchet MS"`;let lin='';for(const p of s.split(' ')){if(ctx.measureText(lin+p).width>ww){texto(lin,x2,yy,tam,cor);yy+=tam+7;lin='';}lin+=p+' ';}if(lin)texto(lin,x2,yy,tam,cor);yy+=tam+12;};
  if(sel==='_historia'){texto('Objetivo da história',x2,yy,20,'#ffe27a');yy+=30;
    // trava de capitulo: o quanto do Capitulo 1 ja foi feito e o que falta
    if(typeof cap1Completo==='function'&&hero.espada&&estadoMissao('olhos_roxos')==='feita'){const f=cap1Feitas(),n=CAP1_MISSOES.length;
      texto('Capítulo 1: '+f+'/'+n+' missões feitas',x2,yy,15,f===n?'#7dffa8':'#ffd84a');yy+=22;
      if(f<n){quebra('Falta: '+cap1Faltam().join(', ')+'. O Capítulo 2 só começa com tudo feito.',13,'#c8d8f0');yy+=4;}}
    {const lp=typeof listaPreparo==='function'?listaPreparo():null;if(lp){quebra('O festival da Rainha do Inverno é hoje à noite. A Vovó Hilda pediu ajuda com os preparativos:',15,'#e8f6ff');
      for(const [s0,ok] of lp){texto((ok?'✔ ':'☐ ')+s0,x2,yy,15,ok?'#7dffa8':'#fff');yy+=22;}yy+=6;quebra(lp.every(x=>x[1])?'➤ Tudo pronto! Volte à Vovó Hilda.':'➤ O "!" amarelo mostra quem precisa de ajuda.',15,'#7dffa8');return;}}
    if(!hero.espada){quebra('Mil anos de gelo prendem uma espada no altar, no alto da vila. Todos tentaram na força. Talvez não seja um teste de força.',15,'#e8f6ff');quebra('➤ Suba até o altar (★ no mapa) e fale com ele.',15,'#7dffa8');}
    else{const om=estadoMissao('olhos_roxos');
      if(om==='feita'){quebra('O Halvard voltou para casa. Mas a Ordem do Eclipse continua lá fora, e os cristais de Elyria correm perigo.',15,'#e8f6ff');quebra('➤ Fique mais forte, siga as pegadas enormes e descubra o que a Ordem quer no norte.',15,'#7dffa8');}
      else if(om==='ativa'){quebra('O Halvard sumiu e os lobos têm olhos roxos. Alguém está por trás disso.',15,'#e8f6ff');quebra('➤ Siga a missão Olhos Roxos (★ no mapa).',15,'#7dffa8');}
      else{quebra('A Aurora escolheu você. O festival da Rainha do Inverno se aproxima, e algo se mexe além do portão da vila.',15,'#e8f6ff');quebra('➤ A Vovó Hilda tem um pedido. Fale com ela (! em cima da cabeça) antes de sair da vila.',15,'#7dffa8');}}
    return;}
  if(sel==='_ordem'){texto('A Ordem do Eclipse',x2,yy,20,'#ff8a8a');yy+=30;
    quebra('Uma sociedade secreta, escondida há séculos em templos, guildas e até na corte do rei. Símbolo: um sol negro com um olho no centro.',15,'#e8f6ff');
    quebra('O plano: apagar os sete Cristais Primordiais de Elyria, um por um. Quando o último se apagar, vem o Eclipse Eterno.',15,'#e8f6ff');
    quebra('As Sombras: a Ordem arranca a sombra das pessoas. Quem perde a sombra perde a vontade e vira uma casca que obedece.',15,'#e8f6ff');
    quebra('O Arauto: o líder. Ninguém viu o rosto dele. Ele fala pela boca dos outros.',15,'#e8f6ff');
    quebra('➤ O Jux não tem sombra: é o único que a Ordem não consegue esvaziar.',15,'#7dffa8');return;}
  const M=MISSOES[sel],st=estadoMissao(sel);texto(M.nome,x2,yy,20,'#ffe27a');yy+=24;texto('Pedido por: '+M.quemNome,x2,yy,14,'#9fe8ff');yy+=26;
  quebra(M.desc,15,'#e8f6ff');
  if(M.passos){for(const p of M.passos){const ok=p.ok(),sf=(!ok&&st==='ativa'&&p.prog)?'  ('+p.prog()+')':'';texto((ok?'✔ ':'☐ ')+p.txt+sf,x2,yy,14,ok?'#7dffa8':'#c8d8f0');yy+=20;}yy+=8;}
  if(st==='ativa'){const p=progressoMissao(sel),a=alvoMissao(sel);texto('Progresso: '+p+' / '+a,x2,yy,15,'#fff');yy+=10;
    ctx.fillStyle='rgba(42,58,102,.9)';ctx.fillRect(x2,yy,220,8);ctx.fillStyle='#7dffa8';ctx.fillRect(x2,yy,220*p/a,8);yy+=30;
    if(p>=a){texto('✔ Pronto! Volte e fale com '+M.quemNome+'.',x2,yy,15,'#7dffa8');yy+=28;}}
  else{texto('✓ Concluída',x2,yy,15,'#7dffa8');yy+=28;}
  texto('Recompensa:',x2,yy,15,'#ffe27a');yy+=22;quebra(textoRec(sel),15,'#fff');
  if(st==='ativa'){if(M.principal)texto('★ Missão principal: sempre apontada no minimapa',x2,yy,13,COR_P);else{const on=JOGO.rastreio===sel;texto((on?'◆ Rastreando no minimapa  ·  ENTER: parar':'ENTER: rastrear no minimapa'),x2,yy,14,on?COR_S:'#9fe8ff');}}
}
// ---------- Mapa da região (por enquanto: a vila de Invernália)
const POS_NPC=()=>{if(!NA_VILA)return {};const r={tico,vovo,borin,bacon};for(const a of ANDARILHOS)r[a.id]=a;return r;};
const NOME_NPC={halvard:'Halvard',tico:'Tico',vovo:'Vovó Hilda',borin:'Borin',bacon:'Sir Bacon',ingrid:'Ingrid',oskar:'Oskar'};
// marca de missão em cima da cabeça dos moradores (no mapa do jogo)
const ALT_NPC={tico:34,bacon:24,vovo:46,borin:52,ingrid:48,oskar:52};
// quem da missao FORA da vila (2026-11-20: o Capitao na Garganta nao tinha o '!', e a missao da Presa-Antiga passava batido)
const MARCAS_FORA={garganta:()=>typeof chefeFeito==='function'&&chefeFeito('capitao')?{capitao:{x:430,y:430}}:{}};
const ALT_FORA={capitao:70};
function marcasNoMundo(){if(typeof emAtaque==='function'&&emAtaque())return;const pos=NA_VILA?POS_NPC():(MARCAS_FORA[REGIAO]?MARCAS_FORA[REGIAO]():{});for(const id in pos){const n=pos[id];if(!n)continue;const mk=marcaMissao(id);if(!mk||mk==='…')continue;
  const b=Math.sin(t*4)*3,x=W/2+(n.x-cam.x)*Z,y=H/2+(n.y-(ALT_FORA[id]||ALT_NPC[id]||46)-cam.y)*Z+b;ctx.save();ctx.fillStyle=mk==='!'?'#ffd84a':'#7dffa8';ctx.strokeStyle='#3a2a00';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y-6,9,11,0,0,6.283);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(x-4,y+3);ctx.lineTo(x,y+10);ctx.lineTo(x+4,y+3);ctx.fill();ctx.font='bold 15px "Trebuchet MS"';ctx.textAlign='center';ctx.fillStyle='#2a1a00';ctx.fillText(mk,x,y-1);ctx.restore();}}
// ---------- entrada
function listaAtual(){
  if(UI.escolha)return UI.escolha.ops;
  if(UI.menu&&UI.home)return HOME;
  if(UI.loja)return itensLoja();
  if(UI.aba===1)return itensBolsa();if(UI.aba===2)return SLOTS_EQ;if(UI.aba===ABA_HABS)return habsMenu();if(UI.aba===ABA_ECOS)return UI.ecoCol?ECOS[ecoVisto()].habs:ecoLista();if(UI.aba===ABA_MISSOES)return listaDiario();if(UI.aba===ABA_SALVAR)return SALVAR_OPS;if(UI.aba===ABA_BESTA)return BESTIARIO;return [];}
function ativa(i){
  if(UI.escolha)return escolhe(i);
  if(UI.menu&&UI.home){abreSecao(i);return;}
  if(UI.loja){const l=itensLoja();if(l[i])compra(l[i]);return;}
  if(UI.aba===1){const l=itensBolsa();if(l[i])usaItem(l[i]);}
  else if(UI.aba===2)abreEqLista();
  else if(UI.aba===ABA_HABS)alternaHab(i);
  else if(UI.aba===ABA_ECOS)acaoEco(i);
  else if(UI.aba===ABA_MISSOES){const k=listaDiario()[i];if(k&&k!=='_historia')alternaRastreio(k);}
  else if(UI.aba===ABA_SALVAR)acaoSalvar(i);}
function abreMenu(){if(ab.on||fala||(typeof transicao!=='undefined'&&transicao))return;UI.menu=!UI.menu;UI.home=true;UI.aba=0;UI.sel=0;UI.confirmaNovo=false;som(UI.menu?SOM.ui_vez:SOM.ui_mover,.5);}
function fecha(){UI.menu=false;UI.loja=null;UI.escolha=null;som(SOM.ui_mover,.45);}
function uiTecla(k){
  if(UI.saves&&typeof teclaSaves==='function'){teclaSaves(k);return true;}   // Salvar / Carregar / Capitulos (saves.js)
  if(UI.menu&&!UI.home&&UI.aba===ABA_ECOS&&!UI.loja&&!UI.escolha&&typeof teclaEcos==='function'&&teclaEcos(k))return true;
  if(UI.menu&&!UI.home&&typeof ABA_GRUPO!=='undefined'&&UI.aba===ABA_GRUPO&&!UI.loja&&!UI.escolha&&teclaGrupo(k))return true;   // a formacao (grupo_tela.js)   // a nova tela dos Ecos (ecos_tela.js)
  if(typeof transicao!=='undefined'&&transicao)return true;   // luta comecando: ignora teclas (nao abre menu sem querer)
  if(!uiAberto()){if(k==='m'||k==='i'||k==='escape'||k==='tab'){abreMenu();return true;}return false;}
  if(UI.loja&&UI.loja.qtd){if(k==='arrowright'||k==='d')mudaQtd(1);else if(k==='arrowleft'||k==='a')mudaQtd(-1);else if(k==='arrowup'||k==='w')mudaQtd(10);else if(k==='arrowdown'||k==='s')mudaQtd(-10);
    else if(k==='enter'||k===' '||k==='e')confirmaQtd();else if(k==='escape'||k==='backspace'){UI.loja.qtd=null;som(SOM.ui_mover,.4);}return true;}
  // lista de 'Rever cutscenes' aberta (Sistema): as teclas sao dela
  if(UI.menu&&UI.aba===ABA_SALVAR&&UI.cines&&typeof FILMES!=='undefined'){const n=FILMES.length;
    if(k==='arrowdown'||k==='s'){UI.cines.sel=(UI.cines.sel+1)%n;som(SOM.ui_mover,.3);}else if(k==='arrowup'||k==='w'){UI.cines.sel=(UI.cines.sel-1+n)%n;som(SOM.ui_mover,.3);}
    else if(k==='enter'||k===' '||k==='e')assisteFilme(UI.cines.sel);else if(k==='escape'||k==='backspace'||k==='arrowleft'||k==='a'){UI.cines=null;som(SOM.ui_mover,.4);}
    else if(k==='m'||k==='i'){UI.cines=null;fecha();}return true;}
  // lista de escolha do Equipar aberta: as teclas sao dela
  if(UI.menu&&UI.aba===2&&UI.eqLista){const ops=listaEq(SLOTS_EQ[UI.sel][0]),L=UI.eqLista;
    if(k==='arrowdown'||k==='s'){L.sel=(L.sel+1)%ops.length;som(SOM.ui_mover,.3);}else if(k==='arrowup'||k==='w'){L.sel=(L.sel-1+ops.length)%ops.length;som(SOM.ui_mover,.3);}
    else if(k==='enter'||k===' '||k==='e')equipaEscolha();else if(k==='escape'||k==='backspace'||k==='arrowleft'||k==='a'){UI.eqLista=null;som(SOM.ui_mover,.4);}
    else if(k==='m'||k==='i'){UI.eqLista=null;fecha();}return true;}
  const l=listaAtual(),n=Math.max(1,l.length),obj=UI.escolha||UI.loja||UI;
  if(UI.menu&&!UI.home&&!UI.escolha&&!UI.loja&&(k==='escape'||k==='backspace')){UI.home=true;UI.sel=Math.max(0,HOME.findIndex(h=>h[1]===UI.aba));som(SOM.ui_mover,.45);return true;}   // dentro de uma secao: volta ao menu principal
  if(k==='escape'||k==='backspace'||(UI.menu&&(k==='m'||k==='i'))){fecha();return true;}
  if(UI.menu&&UI.home&&(k==='arrowright'||k==='arrowleft'||k==='d'||k==='a'||k==='tab'))return true;
  if(UI.menu&&!UI.home&&!UI.loja&&!UI.escolha&&ABA_COM_GRUPO(UI.aba)&&(k==='q'||k==='pageup'||k==='pagedown')){trocaQuem(k==='pageup'?-1:1);return true;}
  if(k==='arrowdown'||k==='s'){obj.sel=(obj.sel+1)%n;som(SOM.ui_mover,.3);}
  else if(k==='arrowup'||k==='w'){obj.sel=(obj.sel-1+n)%n;som(SOM.ui_mover,.3);}
  else if(UI.menu&&UI.aba===ABA_ECOS&&(k==='arrowright'||k==='d'||k==='arrowleft'||k==='a')){UI.ecoCol=(k==='arrowright'||k==='d')?1:0;UI.sel=UI.ecoCol?0:ecoLista().indexOf(ecoVisto());som(SOM.ui_mover,.3);}
  else if(UI.menu&&UI.aba===ABA_SALVAR&&UI.sel<5&&(k==='arrowright'||k==='d'||k==='arrowleft'||k==='a')){acaoSalvar(UI.sel,(k==='arrowright'||k==='d')?1:-1);}
  else if(UI.menu&&(k==='arrowright'||k==='d'||k==='tab')){if(UI.aba===2&&k!=='tab')trocaSlot(SLOTS_EQ[UI.sel][0],1);else{UI.aba=(UI.aba+1)%ABAS.length;UI.sel=0;UI.confirmaNovo=false;som(SOM.ui_mover,.3);}}
  else if(UI.menu&&(k==='arrowleft'||k==='a')){if(UI.aba===2)trocaSlot(SLOTS_EQ[UI.sel][0],-1);else{UI.aba=(UI.aba+ABAS.length-1)%ABAS.length;UI.sel=0;som(SOM.ui_mover,.3);}}
  else if(UI.loja&&(k==='arrowright'||k==='arrowleft')&&LOJAS[UI.loja.id].compra){UI.loja.modo=UI.loja.modo==='comprar'?'vender':'comprar';UI.loja.sel=0;som(SOM.ui_mover,.3);}
  else if(k==='enter'||k===' '||k==='e')ativa(obj.sel);
  return true;
}
// areas clicaveis montadas no desenho
let ZONAS=[];
function uiClique(x,y){
  if(UI.saves&&typeof cliqueSaves==='function'){cliqueSaves(x,y);return true;}
  if(typeof transicao!=='undefined'&&transicao)return true;
  if(!uiAberto()){if(x>W-118&&x<W-10&&y>46&&y<76){abreMenu();return true;}return false;}
  for(const z of ZONAS)if(x>=z[0]&&x<=z[2]&&y>=z[1]&&y<=z[3]){z[4]();return true;}
  if(UI.escolha){UI.escolha=null;return true;}
  return true;
}

// ---------- desenho
// texto que diminui a letra ate caber na largura (2026-11-20: nada mais sai da janela)
// so os numeros do item na linha do Equipar (a descricao com historia nao cabe; 2026-11-20 ela passava por cima do nome)
function resumoBonus(d){const p=String(d||'').split(/\.\s+/).map(x=>x.replace(/\.$/,'')).filter(x=>/[+-]\s?\d/.test(x));return p.length?p.join('. ')+'.':d;}
function cortaTxt(s,x,y,size,cor,maxw,al){ctx.font=`bold ${size}px "Trebuchet MS"`;if(ctx.measureText(s).width>maxw){while(s.length>3&&ctx.measureText(s+'…').width>maxw)s=s.slice(0,-1);s=s.trimEnd()+'…';}texto(s,x,y,size,cor,al);}   // corta com … o que nao cabe
function textoCabe(s,x,y,size,cor,maxw,al){let t=size;for(;t>9;t--){ctx.font=`bold ${t}px "Trebuchet MS"`;if(ctx.measureText(s).width<=maxw)break;}texto(s,x,y,t,cor,al);}
function painel(x,y,w,h){ctx.fillStyle='rgba(6,16,40,.94)';ctx.strokeStyle='#8fdcff';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,y,w,h,10);ctx.fill();ctx.stroke();}
function linhaSel(x,y,w,h,on){if(on&&UI.pisca&&performance.now()<UI.pisca){const k=.5+.5*Math.sin(performance.now()/120);ctx.save();ctx.strokeStyle=`rgba(255,226,122,${.4+.6*k})`;ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(x-3,y-3,w+6,h+6,8);ctx.stroke();ctx.restore();}
  if(on){ctx.fillStyle='rgba(127,214,245,.22)';ctx.beginPath();ctx.roundRect(x,y,w,h,6);ctx.fill();ctx.fillStyle='#7fd6f5';ctx.beginPath();ctx.moveTo(x+6,y+h/2-5);ctx.lineTo(x+12,y+h/2);ctx.lineTo(x+6,y+h/2+5);ctx.fill();}}
function botaoMenu(){ctx.save();ctx.fillStyle='rgba(6,16,40,.8)';ctx.strokeStyle='#8fdcff';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(W-118,46,108,30,7);ctx.fill();ctx.stroke();
  texto('☰ Menu  (M)',W-110,67,14,'#e8f6ff');texto(JOGO.gil+' gil',W-114,96,13,'#ffe27a');ctx.restore();}
function uiDesenha(){
  ctx.save();ctx.setTransform(window.HD_TELA||1,0,0,window.HD_TELA||1,0,0);ZONAS=[];
  if(!ab.on&&!uiAberto()){botaoMenu();if(typeof miniHud==='function')miniHud();}
  if(UI.escolha)desenhaEscolha();
  if(UI.loja)desenhaLoja();
  if(UI.menu)desenhaMenu();
  if(UI.saves&&typeof desenhaSaves==='function')desenhaSaves();
  // avisos (por cima do menu: as confirmacoes aparecem com o menu aberto)
  UI.avisos.forEach((a,i)=>{const al=a.v<.2?a.v/.2:a.v>2?(2.4-a.v)/.4:1;ctx.globalAlpha=al;ctx.font='bold 15px "Trebuchet MS"';const w=ctx.measureText(a.txt).width+28;
    ctx.fillStyle='rgba(6,16,40,.9)';ctx.beginPath();ctx.roundRect(W/2-w/2,70+i*36-Math.min(a.v,.2)*20,w,28,8);ctx.fill();texto(a.txt,W/2,89+i*36-Math.min(a.v,.2)*20,15,a.cor,'center');ctx.globalAlpha=1;});
  ctx.restore();
}
function desenhaEscolha(){const e=UI.escolha;
  if(e.titulo){const w=380,x=(W-w)/2,ht=e.titulo.length*26+18,h=e.ops.length*36+20,y=H/2-(ht+h)/2;painel(x,y,w,ht);   // janela com titulo (cura antes da luta)
    e.titulo.forEach((t,i)=>texto(t,x+w/2,y+30+i*26,i<2?18:16,i<2?'#ffe27a':(/CAÍDO/.test(t)?'#ff9a9a':'#bff4ff'),'center'));
    const y2=y+ht+8;painel(x,y2,w,h);e.ops.forEach((o,i)=>{const yy=y2+12+i*36;linhaSel(x+8,yy,w-16,32,i===e.sel);texto(o,x+28,yy+22,17,'#fff');ZONAS.push([x,yy,x+w,yy+32,()=>{e.sel=i;escolhe(i);}]);});return;}
  const x=W-250,y=H-290,w=200,h=e.ops.length*36+20;painel(x,y,w,h);
  e.ops.forEach((o,i)=>{const yy=y+12+i*36;linhaSel(x+8,yy,w-16,32,i===e.sel);texto(o,x+28,yy+22,17,'#fff');ZONAS.push([x,yy,x+w,yy+32,()=>{e.sel=i;escolhe(i);}]);});}
function desenhaLoja(){
  const L=LOJAS[UI.loja.id],x=120,y=50,w=W-240,h=H-120,l=itensLoja();painel(x,y,w,h);
  texto(L.nome,x+24,y+34,22,'#ffe27a');texto(JOGO.gil+' gil',x+w-24,y+34,18,'#ffe27a','right');
  if(L.compra){const m=UI.loja.modo;texto(m==='comprar'?'◀ Comprar ▶':'◀ Vender ▶',x+w/2,y+34,15,'#9fe8ff','center');ZONAS.push([x+w/2-70,y+14,x+w/2+70,y+42,()=>{UI.loja.modo=m==='comprar'?'vender':'comprar';UI.loja.sel=0;}]);}
  texto(UI.loja.modo==='vender'?(L.vende||'O Borin compra cristais.'):L.ola,x+24,y+60,14,'#c8d8f0');
  const top=Math.max(0,Math.min(UI.loja.sel-4,l.length-6));
  if(!l.length)texto('Nada para vender.',x+40,y+110,16,'#c8d8f0');
  l.slice(top,top+6).forEach((id,j)=>{const i=top+j,it=ITENS[id],yy=y+76+j*40,pode=UI.loja.modo==='vender'||podeComprar(id);
    linhaSel(x+12,yy,w-24,36,i===UI.loja.sel);iconeItem(ctx,id,x+34,yy+5,26);
    texto(it.nome,x+70,yy+24,17,pode?'#fff':'#7a8aa8');
    const ja=bloqueado(it)?'🔒 '+bloqueado(it):(qtd(id)?'tem '+qtd(id):'')+(EQUIPAVEL.includes(it.tipo)&&equipadoEmAlguem(id)?(qtd(id)?' · ':'')+'equipado':'');
    texto(ja,x+w-150,yy+24,13,'#9fe8ff','right');
    texto(UI.loja.modo==='vender'?it.venda+' gil':it.preco+' gil',x+w-30,yy+24,16,pode?'#ffe27a':'#8a7a4a','right');
    ZONAS.push([x+12,yy,x+w-12,yy+36,()=>{UI.loja.sel=i;compra(id);}]);});
  if(l.length>6){const xs=x+w-8,pu=top>0,pd=top+6<l.length;
    texto('▲',xs,y+94,16,pu?'#7fd6f5':'#3a4a6a','center');texto('▼',xs,y+76+6*40-10,16,pd?'#7fd6f5':'#3a4a6a','center');
    ZONAS.push([xs-14,y+76,xs+14,y+110,()=>{if(top>0)UI.loja.sel=top+3;}]);ZONAS.push([xs-14,y+76+5*40,xs+14,y+76+6*40,()=>{if(top+6<l.length)UI.loja.sel=top+5;}]);
    texto((top+1)+'–'+Math.min(top+6,l.length)+' de '+l.length,x+w-30,y+60,12,'#9fb3d9','right');}
  const sel=l[UI.loja.sel];if(sel){painel(x+12,y+h-76,w-24,64);{const it=ITENS[sel],old=EQUIPAVEL.includes(it.tipo)?equipDe(quemPrevia(it))[slotPara(it,quemPrevia(it))]:null;
      texto(it.desc+(old&&old!==sel?'   ·   comparando com: '+ITENS[old].nome:(EQUIPAVEL.includes(it.tipo)?'   ·   espaço vazio':'')),x+30,y+h-50,15,'#e8f6ff');}
    if(UI.loja.modo!=='vender'&&!desenhaPrevia(sel,x+30,y+h-24,w-60)){}}
  texto('ENTER/toque: '+(UI.loja.modo==='vender'?'vender':'comprar')+' · ESC: sair',x+w-20,y+h+22,13,'rgba(255,255,255,.6)','right');
  ZONAS.push([x+w-40,y+8,x+w-4,y+40,fecha]);
  if(UI.loja.qtd)caixaQtd(x,y,w,h);
}
// caixa de quantidade (estilo FF): ◀ ▶ 1 em 1, ▲ ▼ 10 em 10, total em gil; no toque, botoes -10 -1 +1 +10 e Comprar
function caixaQtd(x,y,w,h){const q=UI.loja.qtd,it=ITENS[q.id],vend=UI.loja.modo==='vender',pr=vend?it.venda:it.preco,mx=Math.max(1,maxQtd(q.id));q.n=Math.min(q.n,mx);
  ZONAS.length=0;ctx.fillStyle='rgba(0,0,10,.55)';ctx.fillRect(0,0,W,H);
  const bw=440,bh=210,bx=x+(w-bw)/2,by=y+(h-bh)/2;painel(bx,by,bw,bh);
  iconeItem(ctx,q.id,bx+24,by+18,30);texto(it.nome,bx+66,by+40,20,'#fff');texto((vend?'tem ':'na bolsa: ')+qtd(q.id),bx+bw-22,by+40,13,'#9fe8ff','right');
  texto('Quantidade',bx+bw/2,by+78,14,'#9fb3d9','center');texto('◀',bx+bw/2-70,by+114,22,q.n>1?'#7fd6f5':'#3a4a6a','center');
  texto('×'+q.n,bx+bw/2,by+116,32,'#ffe27a','center');texto('▶',bx+bw/2+70,by+114,22,q.n<mx?'#7fd6f5':'#3a4a6a','center');
  texto((vend?'Recebe ':'Total ')+pr*q.n+' gil'+(vend?'':'   ·   sobra '+(JOGO.gil-pr*q.n)),bx+bw/2,by+146,15,vend?'#7dffa8':'#ffe27a','center');
  const bts=[['−10',-10],['−1',-1],['+1',1],['+10',10]],bt=60,gap=10,x0=bx+22;
  bts.forEach(([s,d],i)=>{const xx=x0+i*(bt+gap),yy=by+162;ctx.fillStyle='rgba(42,58,102,.9)';ctx.beginPath();ctx.roundRect(xx,yy,bt,32,6);ctx.fill();texto(s,xx+bt/2,yy+22,15,'#e8f6ff','center');ZONAS.push([xx,yy,xx+bt,yy+32,()=>mudaQtd(d)]);});
  const cx=x0+4*(bt+gap)+4,cw=bx+bw-22-cx;ctx.fillStyle='#7fd6f5';ctx.beginPath();ctx.roundRect(cx,by+162,cw,32,6);ctx.fill();texto(vend?'Vender':'Comprar',cx+cw/2,by+184,16,'#0c1a2a','center');
  ZONAS.push([cx,by+162,cx+cw,by+194,confirmaQtd]);
  texto('◀ ▶: 1 · ▲ ▼: 10 · ENTER: '+(vend?'vender':'comprar')+' · ESC: voltar',bx+bw/2,by+bh+20,12,'rgba(255,255,255,.65)','center');
  ZONAS.push([0,0,W,H,()=>{UI.loja.qtd=null;}]);
}
// ---------- MENU PRINCIPAL (estilo Final Fantasy: lista a esquerda, cartoes do grupo a direita)
const HOME=[['Mapa',6],['Missões',5],['Bestiário',8],['Itens',1],['Equipamento',2],['Habilidades',3],['Ecos',4],['Grupo',0],['Sistema',7]];
function abreSecao(i){const h=HOME[i];if(!h)return;UI.home=false;UI.aba=h[1];UI.sel=0;UI.confirmaNovo=false;som(SOM.ui_vez,.5);}
function fundoFF(x,y,w,h){const g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'rgba(18,52,86,.96)');g.addColorStop(1,'rgba(8,24,52,.97)');ctx.fillStyle=g;ctx.fillRect(x,y,w,h);
  ctx.strokeStyle='rgba(190,225,245,.55)';ctx.lineWidth=2;ctx.strokeRect(x+.5,y+.5,w-1,h-1);}
function cartaoGrupo(x,y,w,h,nome,nv,ret,hp,mp,exp,prox,funcao){
  ctx.save();ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x,y+w*.35);ctx.quadraticCurveTo(x,y,x+w*.4,y);ctx.lineTo(x+w*.6,y);ctx.quadraticCurveTo(x+w,y,x+w,y+w*.35);ctx.lineTo(x+w,y+h);ctx.closePath();
  const g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'rgba(70,130,170,.55)');g.addColorStop(1,'rgba(14,44,76,.92)');ctx.fillStyle=g;ctx.fill();ctx.clip();
  const R=RETI[ret],D=RET[ret];if(R&&D&&R.complete){const fw=D.w,fh=D.h,k=Math.min((w-6)/fw,(h*.62)/fh)*1.15;ctx.globalAlpha=.97;ctx.drawImage(R,0,0,fw,fh,x+w/2-fw*k/2,y+10,fw*k,fh*k);ctx.globalAlpha=1;}
  const gb=ctx.createLinearGradient(0,y+h*.5,0,y+h);gb.addColorStop(0,'rgba(8,24,48,0)');gb.addColorStop(.35,'rgba(8,24,48,.85)');gb.addColorStop(1,'rgba(8,24,48,.96)');ctx.fillStyle=gb;ctx.fillRect(x,y+h*.45,w,h*.55);ctx.restore();
  ctx.strokeStyle='rgba(190,225,245,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x,y+w*.35);ctx.quadraticCurveTo(x,y,x+w*.4,y);ctx.lineTo(x+w*.6,y);ctx.quadraticCurveTo(x+w,y,x+w,y+w*.35);ctx.lineTo(x+w,y+h);ctx.stroke();
  const ty=y+h*.57;texto('Nv. '+nv,x+12,ty,15,'#e8f6ff');texto(nome,x+12,ty+24,24,'#ffffff');
  texto('Próx. Nv.:',x+12,ty+50,13,'#b8d4ea');texto(prox+' EXP',x+w-12,ty+66,15,'#e8f6ff','right');
  const barra=(yy,lab,cor,val,max,col2)=>{texto(lab,x+12,yy,15,cor);texto(val+'/'+max,x+w-12,yy,16,'#fff','right');ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(x+12,yy+5,w-24,5);ctx.fillStyle=col2;ctx.fillRect(x+12,yy+5,(w-24)*Math.min(1,val/max),5);};
  const va=vidaAtual(ret);barra(ty+92,'PV','#6fe0a0',va.hp,va.max,'#3fe08a');barra(ty+122,'PM','#7fc8ff',va.mp,va.mmax,'#4aa8e8');
  texto(funcao,x+12,ty+152,13,'#b8d4ea');}
function desenhaHome(){
  ctx.fillStyle='rgba(3,10,24,.82)';ctx.fillRect(0,0,W,H);
  ctx.font='bold 38px Georgia,"Times New Roman",serif';ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText('MENU PRINCIPAL',60,66);ctx.strokeStyle='rgba(190,225,245,.5)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(30,84);ctx.lineTo(W-20,84);ctx.stroke();
  HOME.forEach((h,i)=>{const yy=98+i*47,on=i===UI.sel;
    ctx.fillStyle=on?'rgba(70,170,220,.55)':'rgba(20,60,96,.55)';ctx.fillRect(60,yy,300,39);ctx.strokeStyle=on?'rgba(210,240,255,.95)':'rgba(190,225,245,.45)';ctx.lineWidth=on?2:1;ctx.strokeRect(60.5,yy+.5,299,38);
    if(on){ctx.fillStyle='#bff0ff';ctx.beginPath();ctx.moveTo(36,yy+19);ctx.lineTo(50,yy+11);ctx.lineTo(50,yy+27);ctx.fill();}
    texto(h[0],90,yy+27,21,on?'#fff':'#d8ecf8');ZONAS.push([60,yy,360,yy+39,()=>{UI.sel=i;abreSecao(i);}]);});
  const st=statusJux(JOGO.nivel),prox=expProx(JOGO.nivel)-(JOGO.exp||0);
  const gm=grupoMenu(),cw_=gm.length>2?175:230,cg_=gm.length>2?10:20;
  cartaoGrupo(400,100,cw_,H-150,'Jux',JOGO.nivel,'jux',st.hp,st.mp,JOGO.exp||0,Math.max(0,prox),'Cavaleiro Glacial');
  gm.filter(q=>COMP_MENU[q]).forEach((q,i)=>{const C=COMP_MENU[q],b=C.j(),sb=C.st(b.nivel);cartaoGrupo(400+(i+1)*(cw_+cg_),100,cw_,H-150,NOME_GRUPO[q],b.nivel,q,sb.hp,sb.mp,b.exp||0,Math.max(0,expProx(b.nivel)-(b.exp||0)),C.funcao);});
  texto(JOGO.gil+' gil',W-30,64,20,'#ffe27a','right');
  texto('▲ ▼ escolhe · ENTER abre · ESC fecha',400,H-18,13,'rgba(220,238,250,.75)');ZONAS.push([W-60,10,W-6,60,fecha]);
}
function desenhaMenu(){
  if(UI.home){desenhaHome();return;}
  if(UI.aba!==2||UI.home)UI.eqLista=null;
  if(UI.aba!==ABA_SALVAR||UI.home)UI.cines=null;   // lista de escolha do Equipar so vive na aba Equipar
  const x=90,y=40,w=W-180,h=H-90;painel(x,y,w,h);
  const PIT=Math.min(86,Math.floor((w-58)/ABAS.length)),MEIO=(PIT-4)/2;   // as abas cabem antes do X (com a aba Grupo sao 10)
  ABAS.forEach((a,i)=>{const bx=x+10+i*PIT,on=i===UI.aba,fs=a.length>8?11:PIT<80?13:15;ctx.fillStyle=on?'#7fd6f5':'rgba(42,58,102,.9)';ctx.beginPath();ctx.roundRect(bx,y+14,PIT-4,30,7);ctx.fill();
    if(on){ctx.font='bold '+fs+'px "Trebuchet MS"';ctx.textAlign='center';ctx.fillStyle='#0c1a2a';ctx.fillText(a,bx+MEIO,y+35);ctx.textAlign='left';}else texto(a,bx+MEIO,y+35,fs,'#e8f6ff','center');ZONAS.push([bx,y+14,bx+PIT-4,y+44,()=>{UI.aba=i;UI.sel=0;UI.confirmaNovo=false;}]);});
  texto('✕',x+w-26,y+36,20,'#e8f6ff');ZONAS.push([x+w-44,y+12,x+w-6,y+46,fecha]);
  const cx=x+24;let cy=y+66;
  if(ABA_COM_GRUPO(UI.aba)&&grupoMenu().length>1){if(UI.aba!==ABA_ECOS)seletorGrupo(cx,y+54);cy+=36;}   // nos Ecos os herois ja aparecem nos quadros do alto (ecos_tela.js)
  const ehB=!!COMP_MENU[UI.quem]&&grupoMenu().includes(UI.quem),qC=UI.quem,CM=COMP_MENU[qC];
  if(UI.aba===0&&ehB){   // Status do companheiro (Bino ou Felipe)
    const b=CM.j(),s=CM.st(b.nivel),R=RET&&RET[qC],RI=RETI&&RETI[qC];
    if(R&&RI&&RI.complete)ctx.drawImage(RI,0,0,R.w,R.h,cx,cy,R.w*1.25,R.h*1.25);
    const sx=cx+230;texto(NOME_GRUPO[qC],sx,cy+26,26,COR_GRUPO[qC]);texto('Nível '+b.nivel,sx,cy+56,20,'#ffe27a');
    const prox=b.nivel>=100?0:expProx(b.nivel);
    ctx.fillStyle='rgba(42,58,102,.9)';ctx.fillRect(sx,cy+68,220,10);ctx.fillStyle=COR_GRUPO[qC];ctx.fillRect(sx,cy+68,prox?220*Math.min(1,(b.exp||0)/prox):220,10);
    texto(prox?'EXP '+(b.exp||0)+' / '+prox:'Nível máximo',sx,cy+96,13,'#c8d8f0');
    const vb=vidaAtual(qC);[['hp','HP'],['mp','MP'],['atk','ATQ'],['def','DEF'],['atkm','ATQ.M'],['defm','DEF.M'],['vel','VEL'],['crit','Crítico %'],['esq','Esquiva %']].forEach(([k,n],i)=>{const yy=cy+118+i*24;texto(n,sx,yy,15,'#9fe8ff');texto(k==='hp'?vb.hp+'/'+s.hp:k==='mp'?vb.mp+'/'+s.mp:String(s[k]),sx+140,yy,15,'#fff','right');
      const extra=s[k]-s.base[k];if(extra)texto((extra>0?'+':'')+extra,sx+188,yy,13,extra>0?'#7dffa8':'#ff9a9a','right');});
    // atributos de base (crescem com o nivel), embaixo do retrato igual ao Jux
    [['for','FOR'],['vig','VIG'],['mag','MAG'],['esp','ESP'],['vel','VEL'],['sor','SOR']].forEach(([k,n],i)=>{const bx=cx+8+(i%3)*68,by=cy+218+Math.floor(i/3)*22;
      texto(n,bx,by,12,'#9fb3d9');texto(String(s[k]),bx+60,by,12,'#e8f6ff','right');});
    const ex=sx+260;texto('Função',ex,cy+26,16,'#9fe8ff');texto(CM.funcao,ex,cy+48,15,'#fff');
    texto('Arma',ex,cy+84,15,'#9fe8ff');texto(nomeArmaDe(qC),ex,cy+104,15,'#fff');
    texto(CM.l1,ex,cy+140,13,'#c8d8f0');texto(CM.l2,ex,cy+158,13,'#c8d8f0');
  }else if(UI.aba===0){   // Status
    const s=statusJux(),R=RET&&RET.jux,RI=RETI&&RETI.jux;
    if(R&&RI&&RI.complete)ctx.drawImage(RI,0,0,R.w,R.h,cx,cy,R.w*1.25,R.h*1.25);
    const sx=cx+230;texto('Jux',sx,cy+26,26,'#bff0ff');texto('Nível '+JOGO.nivel,sx,cy+56,20,'#ffe27a');
    const prox=JOGO.nivel>=NIVEL_MAX_J?0:expProx(JOGO.nivel);
    ctx.fillStyle='rgba(42,58,102,.9)';ctx.fillRect(sx,cy+68,220,10);ctx.fillStyle='#7fd6f5';ctx.fillRect(sx,cy+68,prox?220*JOGO.exp/prox:220,10);
    texto(prox?'EXP '+JOGO.exp+' / '+prox:'Nível máximo',sx,cy+96,13,'#c8d8f0');
    const nomes=[['hp','HP'],['mp','MP'],['atk','ATQ'],['def','DEF'],['atkm','ATQ.M'],['defm','DEF.M'],['vel','VEL'],['crit','Crítico %'],['esq','Esquiva %']];
    const vj=vidaAtual('jux');nomes.forEach(([k,n],i)=>{const yy=cy+118+i*24;texto(n,sx,yy,15,'#9fe8ff');texto(k==='hp'?vj.hp+'/'+s.hp:k==='mp'?vj.mp+'/'+s.mp:String(s[k]),sx+140,yy,15,'#fff','right');
      const extra=s[k]-s.base[k];if(extra)texto((extra>0?'+':'')+extra,sx+188,yy,13,extra>0?'#7dffa8':'#ff9a9a','right');});
    // atributos de base (crescem com o nivel)
    [['for','FOR'],['vig','VIG'],['mag','MAG'],['esp','ESP'],['vel','VEL'],['sor','SOR']].forEach(([k,n],i)=>{const bx=cx+8+(i%3)*68,by=cy+218+Math.floor(i/3)*22;
      texto(n,bx,by,12,'#9fb3d9');texto(String(s[k]),bx+60,by,12,'#e8f6ff','right');});
    const ex=sx+260;texto('Gil',ex,cy+26,16,'#9fe8ff');texto(String(JOGO.gil),ex+170,cy+26,16,'#ffe27a','right');
    texto('Arma',ex,cy+60,15,'#9fe8ff');texto(nomeArma(),ex,cy+80,15,'#fff');
    texto('Refeição',ex,cy+116,15,'#9fe8ff');
    if(JOGO.buff&&ITENS[JOGO.buff.id]){texto(ITENS[JOGO.buff.id].nome,ex,cy+136,14,'#fff');texto(ITENS[JOGO.buff.id].desc.split(' por ')[0]+' · faltam '+JOGO.buff.lutas+' lutas',ex,cy+154,12,'#7dffa8');}
    else texto('nenhuma (coma na Ingrid!)',ex,cy+136,14,'#7a8aa8');
  }else if(UI.aba===1){   // Itens
    const l=itensBolsa();if(!l.length)texto('A bolsa está vazia.',cx+10,cy+30,17,'#c8d8f0');
    const top=Math.max(0,Math.min(UI.sel-6,l.length-8));
    l.slice(top,top+8).forEach((id,j)=>{const i=top+j,it=ITENS[id],yy=cy+j*38;linhaSel(cx,yy,w-48,34,i===UI.sel);iconeItem(ctx,id,cx+24,yy+4,26);
      texto(it.nome,cx+60,yy+23,17,'#fff');texto('x'+qtd(id),cx+w-70,yy+23,16,'#ffe27a','right');ZONAS.push([cx,yy,cx+w-48,yy+34,()=>{UI.sel=i;usaItem(id);}]);});
    if(l.length>8){const xs=cx+w-34,pu=top>0,pd=top+8<l.length;   // rolagem: setas clicaveis e quantos itens tem
      texto('▲',xs,cy+18,18,pu?'#7fd6f5':'#3a4a6a','center');texto('▼',xs,cy+8*38-8,18,pd?'#7fd6f5':'#3a4a6a','center');
      texto((top+1)+'–'+Math.min(top+8,l.length)+' de '+l.length,cx+w-56,cy-4,12,'#9fb3d9','right');
      ZONAS.push([xs-16,cy,xs+16,cy+34,()=>{if(top>0)UI.sel=top+5;}]);ZONAS.push([xs-16,cy+7*38,xs+16,cy+8*38,()=>{if(top+8<l.length)UI.sel=top+7;}]);}
    const sel=l[UI.sel];if(sel){texto(ITENS[sel].desc+(ITENS[sel].tipo==='comida'?' (ENTER: comer)':EQUIPAVEL.includes(ITENS[sel].tipo)?' (ENTER: equipar)':''),cx,y+h-46,15,'#e8f6ff');desenhaPrevia(sel,cx,y+h-20,w-48);}
  }else if(UI.aba===ABA_HABS){desenhaHabs(cx,cy,w,h,y);
  }else if(UI.aba===ABA_ECOS){desenhaEcos(cx,cy,w,h,y);
  }else if(UI.aba===ABA_MISSOES){desenhaDiario(cx,cy,w,h,y);
  }else if(typeof ABA_GRUPO!=='undefined'&&UI.aba===ABA_GRUPO){desenhaGrupo(cx,cy,w,h,y);
  }else if(UI.aba===ABA_BESTA){desenhaBestiario(cx,cy,w,h,y);
  }else if(UI.aba===ABA_MAPA){desenhaMapa(x,y,w,h);
  }else if(UI.aba===2){   // Equipar
    // EQUIPAR (refeito 2026-11-20, pedido: 'parecia que a arma equipada era mais fraca'): ENTER no espaco abre a LISTA do que
    // serve nele; para cada opcao o painel de baixo mostra lado a lado 'agora' e 'com esta' (verde sobe, vermelho desce). ENTER equipa.
    const EQ=equipDe(UI.quem),LH=34,LE=UI.eqLista;SLOTS_EQ.forEach(([s,n],i)=>{const yy=cy+i*LH,id=EQ[s];linhaSel(cx,yy,w-48,LH-4,i===UI.sel);texto(n,cx+24,yy+21,15,LE&&i===UI.sel?'#ffe27a':'#9fe8ff');
      if(id){iconeItem(ctx,id,cx+150,yy+3,24);texto(ITENS[id].nome,cx+190,yy+22,16,'#fff');if(ITENS[id]&&!LE){ctx.font='bold 16px "Trebuchet MS"';const fimNome=cx+190+ctx.measureText(ITENS[id].nome).width+18;textoCabe(resumoBonus(ITENS[id].desc),cx+w-90,yy+21,13,'#7dffa8',cx+w-90-fimNome,'right');}}
      else texto(s==='arma'?nomeArmaDe(UI.quem)+' (arma de base)':'— vazio —',cx+190,yy+22,15,'#7a8aa8');
      if(!LE){texto('ENTER',cx+w-56,yy+21,11,'rgba(255,255,255,.4)','right');ZONAS.push([cx,yy,cx+w-48,yy+LH-2,()=>{UI.sel=i;abreEqLista();}]);}});
    const q=UI.quem||'jux',agora=statusDe(q),sl=(SLOTS_EQ[UI.sel]||SLOTS_EQ[0])[0],cur=EQ[sl]||null;
    let nx,dep=null;
    if(LE){   // lista de opcoes por cima da coluna da direita
      const ops=listaEq(sl),lx=cx+360,lw=w-48-360,lh=28,vis=Math.min(ops.length,7),top=Math.max(0,Math.min(LE.sel-3,ops.length-vis));
      ctx.fillStyle='rgba(6,16,40,.97)';ctx.strokeStyle='#ffe27a';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(lx-8,cy-4,lw+8,vis*lh+30,8);ctx.fill();ctx.stroke();
      texto('Escolha para '+(SLOTS_EQ[UI.sel]||[])[1]+':',lx+4,cy+14,13,'#ffe27a');
      ops.slice(top,top+vis).forEach((id,j)=>{const k=top+j,yy=cy+22+j*lh;linhaSel(lx,yy,lw-8,lh-3,k===LE.sel);
        if(id){iconeItem(ctx,id,lx+18,yy+2,20);textoCabe(ITENS[id].nome+(id===cur?'  (equipado)':''),lx+44,yy+18,14,id===cur?'#7dffa8':'#fff',lw-60);}
        else textoCabe(sl==='arma'?'Tirar a arma (fica com a '+(ARMA_BASE[UI.quem||'jux']||'arma de base')+')':'— tirar (deixar vazio) —',lx+44,yy+18,13,'#c8d8f0',lw-60);
        ZONAS.push([lx,yy,lx+lw,yy+lh-3,()=>{if(LE.sel===k)equipaEscolha();else LE.sel=k;}]);});
      if(ops.length>vis)texto((top+1)+'–'+(top+vis)+' de '+ops.length,lx+lw-12,cy+14,11,'#9fb3d9','right');
      nx=ops[LE.sel];if(nx!==cur){const sv=EQ[sl];EQ[sl]=nx;dep=statusDe(q);EQ[sl]=sv;}}
    const by=cy+7*LH+4,bw=w-48,bh=62;ctx.fillStyle='rgba(20,34,70,.7)';ctx.beginPath();ctx.roundRect(cx,by,bw,bh,8);ctx.fill();
    textoCabe('Status '+(NOME_GRUPO&&NOME_GRUPO[q]||'Jux'),cx+12,by+20,14,COR_GRUPO&&COR_GRUPO[q]||'#bff0ff',104);
    texto('agora',cx+12,by+39,12,'#9fb3d9');
    if(LE&&nx!==undefined)textoCabe(nx===cur?'(é o que está)':'com '+(nx?ITENS[nx].nome:'nada'),cx+12,by+56,12,'#ffe27a',104);
    else texto('ENTER: ver e comparar',cx+12,by+56,11,'#7a8aa8');
    const cw=(bw-120)/9;NOMES_ST.forEach(([k,n],j)=>{const xx=cx+120+cw*j+cw/2;texto(n,xx,by+20,12,'#9fe8ff','center');texto(String(agora[k]),xx,by+39,15,'#fff','center');
      if(dep){const d=dep[k]-agora[k];texto(String(dep[k]),xx-(d?8:0),by+57,14,d>0?'#7dffa8':d<0?'#ff9a9a':'#c8d8f0','center');if(d)texto((d>0?'▲':'▼')+Math.abs(d),xx+12,by+57,10,d>0?'#7dffa8':'#ff9a9a','left');}
      else if(LE)texto(String(agora[k]),xx,by+57,14,'#5a6a88','center');});
    textoCabe(LE?'▲▼ escolhe · ENTER: equipar · Esc ou ◀: voltar · verde = fica melhor, vermelho = fica pior':'ENTER ou toque: escolher e comparar · ◀ ▶: troca rápida (o que sai volta para a bolsa)'+(grupoMenu().length>1?' · Q: personagem':''),cx,y+h-14,13,'#c8d8f0',w-48);
  }else{   // Salvar
    const LS=24;   // altura de cada linha do Sistema: 14 opcoes + rodape cabem no painel
    SALVAR_OPS.forEach((o,i)=>{const yy=cy+i*LS;linhaSel(cx,yy,560,LS-3,i===UI.sel);texto(o,cx+30,yy+16,15,i===SALVAR_OPS.length-1?'#ff9a9a':'#fff');
      if(i===3)texto('◀ '+(VEL_TEXTO.find(v=>v[0]===OPC.texto)||VEL_TEXTO[1])[1]+' ▶',cx+330,yy+16,14,'#9fe8ff');
      if(i===4)texto(OPC.tremor?'Ligado':'Desligado',cx+330,yy+16,14,OPC.tremor?'#7dffa8':'#ff9a9a');
      if(i===5)texto(OPC.dicas===false?'Desligado':'Ligado',cx+330,yy+16,14,OPC.dicas===false?'#ff9a9a':'#7dffa8');
      if(i===6)texto(UI.controles?'▲ fechar':'▼ ver',cx+330,yy+16,14,'#9fe8ff');
      if(i===7)texto(UI.cines?'▲ fechar':'▶ ver a lista',cx+330,yy+16,14,'#9fe8ff');
      if(i<3){const v=VOL[VOL_OPS[i]],bx=cx+250,bw=220;ctx.fillStyle='rgba(42,58,102,.9)';ctx.fillRect(bx,yy+6,bw,10);ctx.fillStyle=i===0?'#7fd6f5':i===1?'#ffe27a':'#c9b8ff';ctx.fillRect(bx,yy+6,bw*v,10);
        texto(Math.round(v*100)+'%',bx+bw+14,yy+17,15,'#e8f6ff');texto('◀',bx-24,yy+17,15,'#9fe8ff');texto('▶',bx+bw+62,yy+17,15,'#9fe8ff');
        ZONAS.push([bx-30,yy,bx-4,yy+LS,()=>{UI.sel=i;acaoSalvar(i,-1);}]);ZONAS.push([bx+bw+56,yy,bx+bw+84,yy+LS,()=>{UI.sel=i;acaoSalvar(i,1);}]);
        ZONAS.push([bx,yy,bx+bw,yy+LS,(mx)=>{UI.sel=i;}]);}
      else ZONAS.push([cx,yy,cx+460,yy+LS,()=>{UI.sel=i;acaoSalvar(i);}]);});
    if(!UI.controles)texto('◀ ▶ muda o valor · o jogo também salva sozinho a cada 15 s.',cx,cy+SALVAR_OPS.length*LS+6,13,'#c8d8f0');
    if(!UI.controles&&!UI.cines&&typeof textoTempos==='function')textoCabe('⏱ '+textoTempos(),cx,cy+SALVAR_OPS.length*LS+28,14,'#ffe27a',w-48);
    if(UI.controles){const px=cx+275,py=cy+7*LS-2,pw=300,ph=148;painel(px,py,pw,ph);texto('Controles (teclado)',px+16,py+24,16,'#ffe27a');
      [['Setas / WASD','andar (cercas: pula sozinho)'],['Shift','correr'],['Enter / E / Espaço','falar, examinar, confirmar'],['M / Esc','menu'],['Q','trocar herói / AUTO na luta'],['F','tela cheia']].forEach(([a,b],k)=>{texto(a,px+16,py+46+k*18,13,'#9fe8ff');texto(b,px+128,py+46+k*18,13,'#e8f6ff');});}
    if(UI.cines&&typeof FILMES!=='undefined'){const px=cx+250,pw=w-48-250,lh=30,py=cy+2,ph=FILMES.length*lh+44;painel(px,py,pw,ph);
      texto('Rever cutscenes',px+16,py+24,16,'#ffe27a');texto('ENTER assiste · Esc fecha',px+pw-14,py+24,11,'#9fb3d9','right');
      FILMES.forEach((f,k)=>{const yy=py+34+k*lh,vis=filmeVisto(f);linhaSel(px+8,yy,pw-16,lh-4,k===UI.cines.sel);
        texto((vis?'▶ ':'🔒 ')+(vis?f.nome:'???  (ainda não vista)'),px+30,yy+19,14,vis?'#fff':'#5a6688');
        ZONAS.push([px+8,yy,px+pw-8,yy+lh-4,()=>{if(UI.cines.sel===k)assisteFilme(k);else UI.cines.sel=k;}]);});}
    if(UI.msgSalvo>0)texto('Salvo!',cx+380,cy+8*LS+16,16,'#7dffa8');
  }
  {const dica='M/ESC: fechar · ◀ ▶: abas · ▲▼: escolher · ENTER: usar';ctx.font='bold 13px "Trebuchet MS"';const dw=ctx.measureText(dica).width+20;
    ctx.fillStyle='rgba(6,16,40,.8)';ctx.beginPath();ctx.roundRect(x+w-6-dw,y+h+8,dw,24,6);ctx.fill();texto(dica,x+w-16,y+h+24,13,'rgba(255,255,255,.75)','right');}
}
