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
const NOME_GRUPO={jux:'Jux',bino:'Bino'},COR_GRUPO={jux:'#8fe9ff',bino:'#ffb27a'};
function grupoMenu(){const g=['jux'];if(typeof JOGO==='object'&&JOGO.bino&&JOGO.bino.ativo&&typeof statusBino==='function')g.push('bino');return g;}
function trocaQuem(dir){const g=grupoMenu();if(g.length<2)return;UI.quem=g[(g.indexOf(UI.quem)+dir+g.length)%g.length];UI.sel=0;som(SOM.ui_mover,.4);}
const ABA_COM_GRUPO=a=>a===0||a===2||a===3;
function seletorGrupo(cx,cy){const g=grupoMenu();if(!g.includes(UI.quem))UI.quem='jux';
  texto('Personagem:',cx,cy+20,14,'#9fb3d9');
  g.forEach((q,i)=>{const bx=cx+100+i*120,on=q===UI.quem;ctx.fillStyle=on?COR_GRUPO[q]:'rgba(42,58,102,.9)';ctx.beginPath();ctx.roundRect(bx,cy,110,28,7);ctx.fill();
    texto(NOME_GRUPO[q]||q,bx+55,cy+20,16,'#fff','center');ZONAS.push([bx,cy,bx+110,cy+28,()=>{if(UI.quem!==q){UI.quem=q;UI.sel=0;som(SOM.ui_mover,.4);}}]);});
  if(g.length>1)texto('Q: troca de personagem',cx+110+g.length*120,cy+20,12,'#8fa6cc');}
function uiAberto(){return UI.menu||!!UI.loja||!!UI.escolha;}
function aviso(txt,cor){UI.avisos.push({txt,cor:cor||'#ffe27a',v:0});}
function pegou(id){return JOGO.pegos.includes(id);}

// ---------- tesouros
function uiCarrega(){
  for(const s of TESOUROS){if(pegou(s.id)||(s.regiao||'vila')!==REGIAO)continue;V.pontos.push({id:'tes_'+s.id,x:s.x,y:s.y,r:26});}
  pontosColeta();if(typeof halvardVila==='function')halvardVila();
  if(typeof colheBestiario==='function')setTimeout(colheBestiario,1200);
  if(typeof pontosChefes==='function'&&!NA_VILA){pontosChefes();setTimeout(()=>{if(typeof colheChefe==='function'&&!fala)colheChefe();},900);}
  if(JOGO.vila){const v=JOGO.vila;if(v.x&&NA_VILA){hero.x=v.x;hero.y=v.y;}if(v.espada){hero.espada=true;espadaSobe=99;}}
  if(!NA_VILA&&JOGO[REGIAO]&&JOGO[REGIAO].x){hero.x=JOGO[REGIAO].x;hero.y=JOGO[REGIAO].y;cam.x=hero.x;cam.y=hero.y;}
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
  else{JOGO[REGIAO]={x:Math.round(hero.x),y:Math.round(hero.y)};JOGO.vila=Object.assign(JOGO.vila||{},{espada:!!hero.espada});}JOGO.local=REGIAO;salvaJogo();}
function uiPasso(dt){
  for(const a of UI.avisos)a.v+=dt;UI.avisos=UI.avisos.filter(a=>a.v<2.4);
  if(UI.msgSalvo>0)UI.msgSalvo-=dt;
  UI.autoT+=dt;if(UI.autoT>15&&!fala&&!ab.on){UI.autoT=0;salvaVila();}
}

// ---------- conversa com quem vende: escolher Comprar / Conversar
function uiFala(id){
  if(!LOJAS[id]||uiAberto())return false;const mk=marcaMissao(id);
  UI.escolha={id,ops:[...(mk?[mk==='!'?'❗ Missão':mk==='✔'?'✔ Entregar':'Missão']:[]),'Comprar','Conversar','Sair'],sel:0};som(SOM.ui_vez,.5);return true;
}
function escolhe(i){const e=UI.escolha;UI.escolha=null;
  if(e.id==='prova'){const q=e.prova||'fenrir';if(i===0&&q==='skoll'&&typeof tocaFilme==='function'&&typeof CENAS_SKOLL!=='undefined'){tocaFilme(CENAS_SKOLL,IMG_SKOLL,()=>iniciaProva('skoll'));return;}if(i===0&&q==='fenrir'&&typeof tocaFilme==='function'&&typeof CENAS_FENRIR!=='undefined'&&REGIAO==='pico'){tocaFilme(CENAS_FENRIR,IMG_FENRIR,()=>iniciaProva('fenrir'));return;}if(i===0)iniciaProva(q);else if(q.startsWith('chefe_'))aviso('Volte quando estiver pronto.','#c8d8f0');else abreFala(q==='skoll'?'caverna_depois':'prova_depois');return;}   // prova de um Eco: lutar agora ou voltar depois
  if(e.ops[i]==='Comprar'){UI.loja={id:e.id,sel:0,modo:'comprar'};som(SOM.ui_vez,.5);}
  else if(e.ops[i]==='Conversar'){UI.pulaLoja=true;UI.soConversa=true;abreFala(e.id);UI.pulaLoja=false;UI.soConversa=false;}
  else if(e.ops[i]!=='Sair'){UI.pulaLoja=true;abreFala(e.id);UI.pulaLoja=false;}
  else som(SOM.ui_mover,.4);}

// ---------- loja
function itensLoja(){const L=LOJAS[UI.loja.id];
  if(UI.loja.modo==='vender')return Object.keys(JOGO.inv).filter(k=>ITENS[k]&&ITENS[k].venda);
  return L.itens;}
function bloqueado(it){const q=it.req;if(!q)return '';if(q.espada&&!hero.espada)return 'depois da espada';if(q.nivel&&JOGO.nivel<q.nivel)return 'Nv '+q.nivel;return '';}
function podeComprar(id){const it=ITENS[id];if(bloqueado(it))return false;
  if(EQUIPAVEL.includes(it.tipo)&&(qtd(id)>0||equipadoEmAlguem(id)))return false;
  return JOGO.gil>=it.preco;}
function compra(id){
  const it=ITENS[id];
  if(UI.loja.modo==='vender'){JOGO.gil+=it.venda;tiraItem(id);som(SOM.ui_vez,.6);aviso('+'+it.venda+' gil');salvaJogo();return;}
  if(!podeComprar(id)){som(SOM.ui_mover,.5);aviso(JOGO.gil<it.preco?'Gil insuficiente':'Você já tem isso','#ff9a9a');return;}
  JOGO.gil-=it.preco;
  if(EQUIPAVEL.includes(it.tipo)){const q=donoItem(it),E=equipDe(q),sl=slotPara(it,q);
    if(!E[sl]){E[sl]=id;aviso(it.nome+' equipado'+(q!=='jux'?' no '+NOME_GRUPO[q]:'')+'!','#bff4ff');}else{daItem(id);aviso(it.nome+' guardado na bolsa');}}
  else{daItem(id);aviso(it.nome+' +1');}
  som(SOM.ui_vez,.6);salvaJogo();
}

// prévia: como ficam os atributos do Jux com este item (equipado / afiado / comido)
const NOMES_ST=[['hp','HP'],['mp','MP'],['atk','ATQ'],['def','DEF'],['atkm','ATQ.M'],['defm','DEF.M'],['vel','VEL'],['crit','Crít%'],['esq','Esq%']];
const statusDe=q=>q==='bino'?statusBino(JOGO.bino.nivel):statusJux();
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
function usaItem(id){const it=ITENS[id];
  if(it.repele){JOGO.repelente=it.repele;tiraItem(id);som(SOM.ui_vez,.6);aviso('Repelente ativo: '+it.repele+' passos sem lutas fora da vila.','#c8b0ff');salvaJogo();return;}
  if(it.tipo==='comida'){JOGO.buff={id,lutas:it.lutas};tiraItem(id);som(SOM.ui_vez,.6);aviso(it.nome+': '+it.desc,'#7dffa8');salvaJogo();return;}
  if(EQUIPAVEL.includes(it.tipo)){const q=quemPrevia(it),E=equipDe(q),sl=slotPara(it,q),old=E[sl];E[sl]=id;tiraItem(id);if(old)daItem(old);som(SOM.ui_vez,.6);aviso(it.nome+' equipado'+(grupoMenu().length>1?' em '+NOME_GRUPO[q]:'')+'!','#bff4ff');salvaJogo();return;}
  som(SOM.ui_mover,.5);aviso(it.tipo==='consumivel'?'Use na batalha.':'Não dá para usar agora.','#ff9a9a');}
function opcoesSlot(s){const E=equipDe(UI.quem);return [...new Set([null,E[s],...itensBolsa().filter(k=>ITENS[k].tipo===tipoDoSlot(s)&&serveEm(ITENS[k],UI.quem))].filter(x=>x!==undefined))];}
function trocaSlot(s,dir){const E=equipDe(UI.quem),ops=opcoesSlot(s),cur=E[s]||null,i=ops.indexOf(cur),nx=ops[(i+dir+ops.length)%ops.length];
  if(nx===cur)return;if(cur)daItem(cur);if(nx)tiraItem(nx);E[s]=nx;som(SOM.ui_mover,.5);salvaJogo();}
const SALVAR_OPS=['Volume da música','Volume dos efeitos','Volume das vozes','Salvar agora','Novo jogo (apaga o progresso)'];
const VOL_OPS=['mus','sfx','voz'];
function acaoSalvar(i,dir){if(i<3){mudaVol(VOL_OPS[i],VOL[VOL_OPS[i]]+.1*(dir||1)>1.001&&!dir?0:VOL[VOL_OPS[i]]+.1*(dir||1));som(SOM.ui_mover,.6);return;}i-=3;if(i===0){salvaVila();UI.msgSalvo=2;som(SOM.ui_vez,.6);aviso('Jogo salvo!','#7dffa8');}
  else if(UI.confirmaNovo){novoJogo();location.reload();}else{UI.confirmaNovo=true;aviso('Toque de novo para confirmar','#ff9a9a');som(SOM.ui_mover,.5);}}

// ---------- Ecos
const ECO_ORDEM=['lamina','arcano','guardiao','sabio','sombra','quebrador'];
const ecoLista=()=>ECO_ORDEM;
function ecoVisto(){return UI.ecoVer||estadoEcos().equip||'lamina';}
function acaoEco(i){const E=estadoEcos();
  if(!UI.ecoCol){const id=ECO_ORDEM[i];UI.ecoVer=id;if(!E.tem.includes(id)){som(SOM.ui_mover,.5);aviso('Eco ainda não encontrado','#ff9a9a');return;}
    if(E.equip!==id){E.equip=id;som(SOM.ui_vez,.6);aviso(ECOS[id].nome+' equipado!',ECOS[id].cor);salvaJogo();}else{UI.ecoCol=1;UI.sel=0;}return;}
  const h=ECOS[ecoVisto()].habs[i],r=trocaHab(h);
  if(r==='auto'){som(SOM.ui_mover,.4);aviso('Passiva do Eco equipado: já está sempre ligada','#ffe27a');return;}
  if(r==='pos'){som(SOM.ui_vez,.5);salvaJogo();}else if(r==='tirou'){som(SOM.ui_mover,.4);salvaJogo();}
  else{som(SOM.ui_mover,.5);aviso(r==='sem_ap'?'AP insuficiente (tire outra habilidade)':'Suba o nível do Eco para aprender','#ff9a9a');}}
// retratos dos Ecos (ecos_retratos.js, tools/cut_retratos.py); sem retrato fica a bolinha de cor
const RETRATO_ECO={};for(const k in (window.JUX_RETRATOS_ECOS||{})){const im=new Image();im.src=JUX_RETRATOS_ECOS[k];RETRATO_ECO[k]=im;}
const retratoOk=id=>RETRATO_ECO[id]&&RETRATO_ECO[id].complete&&RETRATO_ECO[id].naturalWidth;
// ---------- aba HABILIDADES: as do Jux (jux_habs.js); ENTER liga/desliga (desligada some da batalha e do AUTO)
// habilidades do menu: as do Jux e, depois que ele entra no time, as do Bino (ids b_*)
const temBinoMenu=()=>typeof HAB_BINO!=='undefined'&&!!(JOGO.bino&&JOGO.bino.ativo);
const habsMenu=()=>(UI.quem==='bino'&&temBinoMenu())?HAB_BINO:HAB_JUX;
const nvHab=q=>q.id.startsWith('b_')?((JOGO.bino||{}).nivel||1):JOGO.nivel;
function alternaHab(i){const h=habsMenu()[i];if(!h)return;
  if(nvHab(h)<h.nivel){som(SOM.ui_mover,.4);aviso('Aprende no nível '+h.nivel,'#ff9a9a');return;}
  if(!JOGO.habOff)JOGO.habOff={};if(JOGO.habOff[h.id])delete JOGO.habOff[h.id];else JOGO.habOff[h.id]=true;
  som(SOM.ui_vez,.5);aviso(h.nome+(habLigada(h.id)?': ligada':': desligada'),habLigada(h.id)?'#7dffa8':'#ffb0b0');salvaJogo();}
function desenhaHabs(cx,cy,w,h,y){const L=habsMenu(),linha=34,vis=Math.floor((y+h-cy-62)/linha),top=Math.max(0,Math.min(UI.sel-Math.floor(vis/2),L.length-vis));
  texto((UI.quem==='bino'?'Bino Nv '+JOGO.bino.nivel:'Jux Nv '+JOGO.nivel)+' · '+L.filter(q=>q.nivel<=nvHab(q)).length+' de '+L.length+' habilidades aprendidas',cx,cy-4,13,'#9fe8ff');
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
  texto('Tipo: '+(q.id.startsWith('b_')?'Bino · físico (menu Habilidades na batalha)':q.ressonancia?'Ressonância (usa a barra cheia)':'Magia (menu Magia na batalha)'),x2,yy,14,'#c8d8f0');yy+=22;
  texto(q.mp?'Custo: '+q.mp+' MP':'Custo: barra de Ressonância',x2,yy,14,'#9fe8ff');yy+=24;
  // ficha com os numeros (habs_ficha.js): dano em % do ataque normal, alvos, cura, defesa, duracao e efeitos
  const quebraTxt=(txt,x,tam,cor,larg)=>{ctx.font=`bold ${tam}px "Trebuchet MS"`;let lin='';for(const p of String(txt).split(' ')){if(lin&&ctx.measureText(lin+p).width>larg){texto(lin,x,yy,tam,cor);yy+=tam+5;lin='';}lin+=p+' ';}if(lin){texto(lin,x,yy,tam,cor);yy+=tam+5;}};
  const F=(typeof FICHA_HAB!=='undefined')&&FICHA_HAB[q.id];
  if(F){ctx.fillStyle='rgba(40,70,120,.35)';ctx.fillRect(x2-8,yy-16,ww+16,1);yy+=4;
    for(const [rot,val,cor] of F){texto(rot+':',x2,yy,14,'#9fb3d9');const y0=yy;quebraTxt(val,x2+104,14,cor||'#e8f6ff',ww-104);if(yy===y0)yy+=19;}
    yy+=6;ctx.fillStyle='rgba(40,70,120,.35)';ctx.fillRect(x2-8,yy-12,ww+16,1);yy+=8;}
  quebraTxt(q.desc,x2,14,'#c8d8f0',ww);
  if(F)texto('% = em relação ao ataque normal de '+(UI.quem==='bino'?'Bino':'Jux')+'; muda com ATQ, defesa, fraqueza e crítico.',x2,yy+4,11,'#7a8aa8'),yy+=18;
  yy+=10;const eq=(typeof estadoEcos==='function')?estadoEcos().equipadas.filter(k=>HABS[k]&&!HABS[k].passiva):[];
  if(UI.quem!=='bino')texto('Habilidades de Eco equipadas: '+(eq.length?eq.map(k=>HABS[k].nome).join(', '):'nenhuma'),x2,yy,12,'#b8a6e8');if(UI.quem!=='bino')texto('(gerencie na aba Ecos)',x2,yy+16,11,'#7a8aa8');
  texto('▲ ▼ escolhe · ENTER: liga ou desliga · Q: personagem · desligada não aparece na batalha nem no AUTOMÁTICO',cx,y+h-20,12,'#c8d8f0');}
function desenhaEcos(cx,cy,w,h,y){const E=estadoEcos(),ap=apUsado(),lim=limiteAP(JOGO.nivel),ver=ecoVisto(),apr=aprendidas();
  // AP
  texto('AP',cx+w-250,cy-6,15,'#9fe8ff');ctx.fillStyle='rgba(42,58,102,.9)';ctx.fillRect(cx+w-220,cy-16,150,10);ctx.fillStyle=ap>lim?'#ff9a9a':'#ffe27a';ctx.fillRect(cx+w-220,cy-16,150*Math.min(1,ap/lim),10);
  texto(ap+' / '+lim,cx+w-60,cy-6,14,'#ffe27a','right');
  // coluna dos Ecos
  ECO_ORDEM.forEach((id,i)=>{const e=ECOS[id],tem=E.tem.includes(id),yy=cy+6+i*44,on=!UI.ecoCol&&UI.sel===i;
    linhaSel(cx,yy,250,40,on||(UI.ecoCol&&id===ver));
    if(tem&&retratoOk(id)){ctx.save();ctx.beginPath();ctx.arc(cx+28,yy+20,16,0,6.283);ctx.fillStyle='#0c1a3a';ctx.fill();ctx.clip();ctx.drawImage(RETRATO_ECO[id],cx+12,yy+4,32,32);ctx.restore();
      ctx.beginPath();ctx.arc(cx+28,yy+20,16,0,6.283);ctx.strokeStyle=E.equip===id?'#fff':e.cor;ctx.lineWidth=2;ctx.stroke();}
    else{ctx.fillStyle=tem?e.cor:'#3a4466';ctx.beginPath();ctx.arc(cx+28,yy+20,11,0,6.283);ctx.fill();
    if(E.equip===id){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();}}
    texto(tem?e.nome:'???',cx+46,yy+18,15,tem?'#fff':'#5a6688');
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
  texto(e.nome,x2,cy+22,19,e.cor);texto(e.desc,x2,cy+42,13,'#c8d8f0');
  texto('Bônus: '+Object.entries(e.bonus).map(([k,v])=>(NOMES_ATRIB[k]||k)+' +'+(v<1?Math.round(v*100)+'%':v)).join(', ')+(E.equip===ver?'   (equipado)':'   (ENTER no Eco para equipar)'),x2,cy+60,13,'#7dffa8');
  texto('Nv '+nivelDoEco(ver)+' · por nível: '+textoPorNivel(ver),x2,cy+77,12,'#ffe27a');texto(TEXTO_MARCO,x2,cy+92,11,'#c8b27a');
  const top=cy+100,compacto=e.habs.length>7,passo=Math.min(42,Math.floor((y+h-34-top)/e.habs.length)),alt=Math.min(38,passo-2);   // com 7 habilidades as linhas apertam para nao bater no rodape
  e.habs.forEach((hb,i)=>{const H=HABS[hb],sabe=apr.includes(hb),auto=passivaDoEco(hb),eq=auto||E.equipadas.includes(hb),yy=top+i*passo,on=UI.ecoCol&&UI.sel===i;
    linhaSel(x2,yy,w-290,alt,on);
    const ce=auto?'#ffe27a':'#7dffa8';ctx.strokeStyle=eq?ce:'#5a6688';ctx.lineWidth=2;const qy=yy+(alt-16)/2;ctx.strokeRect(x2+18,qy,16,16);if(eq){ctx.fillStyle=ce;ctx.fillRect(x2+22,qy+4,8,8);}
    if(compacto){texto((H.passiva?'◆ ':'✦ ')+H.nome,x2+44,yy+alt*.68,14,sabe?'#fff':'#5a6688');
      texto(sabe?(H.passiva?'passiva':'ativa'):'Aprende no Nv '+H.nv,x2+w-420,yy+alt*.68,12,sabe?'#9fb3d9':'#5a6688','right');
      texto(auto?'grátis (Eco equipado)':'AP '+H.ap,x2+w-306,yy+alt*.68,13,'#ffe27a','right');}
    else{texto((H.passiva?'◆ ':'✦ ')+H.nome,x2+44,yy+16,15,sabe?'#fff':'#5a6688');
    texto(sabe?H.desc+(H.mp?'  MP '+H.mp:''):'Aprende no Nv '+H.nv+' do Eco',x2+44,yy+alt-5,11,sabe?'#9fb3d9':'#5a6688');
    texto(auto?'grátis (Eco equipado)':'AP '+H.ap,x2+w-306,yy+22,13,'#ffe27a','right');}
    ZONAS.push([x2,yy,x2+w-290,yy+alt,()=>{UI.ecoCol=1;UI.sel=i;acaoEco(i);}]);});
  texto('◀ ▶ troca de coluna · ENTER: equipar Eco / ligar ou desligar · ✦ ativa (Magia) · ◆ passiva (as do Eco equipado ficam sempre ligadas)',cx,y+h-20,12,'#c8d8f0');
}
// ---------- Diário de missões
function listaDiario(){const at=[],fe=[];for(const k of ORDEM_MISSOES){const s=estadoMissao(k);if(s==='ativa')at.push(k);else if(s==='feita')fe.push(k);}return ['_historia',...at,...fe];}
function desenhaDiario(cx,cy,w,h,y){const l=listaDiario(),sel=l[UI.sel]||'_historia';
  l.forEach((k,i)=>{const yy=cy+6+i*40;linhaSel(cx,yy,300,36,i===UI.sel);
    if(k==='_historia'){texto('★ '+(hero.espada?'Além de Invernália':'A lâmina no altar'),cx+22,yy+23,15,'#ffe27a');}
    else{const st=estadoMissao(k),pr=missaoPronta(k);texto((st==='feita'?'✓ ':pr?'✔ ':'! ')+MISSOES[k].nome,cx+22,yy+23,15,st==='feita'?'#7a8aa8':pr?'#7dffa8':'#fff');if(JOGO.rastreio===k&&st==='ativa')formaMarca(ctx,'losango',cx+276,yy+18,6,COR_S);else if(MISSOES[k].principal&&st==='ativa')formaMarca(ctx,'estrela',cx+276,yy+18,7,COR_P);
      }
    ZONAS.push([cx,yy,cx+300,yy+36,()=>{UI.sel=i;}]);});
  if(l.length===1)texto('Nenhuma missão ainda. Converse com os moradores com ! em cima da cabeça.',cx+10,cy+80,13,'#9fb3d9');
  const x2=cx+330,ww=w-370;let yy=cy+24;
  const quebra=(s,tam,cor)=>{ctx.font=`bold ${tam}px "Trebuchet MS"`;let lin='';for(const p of s.split(' ')){if(ctx.measureText(lin+p).width>ww){texto(lin,x2,yy,tam,cor);yy+=tam+7;lin='';}lin+=p+' ';}if(lin)texto(lin,x2,yy,tam,cor);yy+=tam+12;};
  if(sel==='_historia'){texto('Objetivo da história',x2,yy,20,'#ffe27a');yy+=30;
    if(!hero.espada){quebra('Mil anos de gelo prendem uma espada no altar, no alto da vila. Todos tentaram na força. Talvez não seja um teste de força.',15,'#e8f6ff');quebra('➤ Suba até o altar (★ no Mapa) e fale com ele.',15,'#7dffa8');}
    else{quebra('A Aurora escolheu você. O festival da Rainha do Inverno se aproxima, e algo se mexe além do portão da vila.',15,'#e8f6ff');quebra('➤ Ajude os moradores, fique mais forte e prepare-se. A estrada para fora de Invernália abre em breve.',15,'#7dffa8');}
    return;}
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
function marcasNoMundo(){if(!NA_VILA)return;const pos=POS_NPC();for(const id in pos){const n=pos[id];if(!n)continue;const mk=marcaMissao(id);if(!mk||mk==='…')continue;
  const b=Math.sin(t*4)*3,x=W/2+(n.x-cam.x)*Z,y=H/2+(n.y-(ALT_NPC[id]||46)-cam.y)*Z+b;ctx.save();ctx.fillStyle=mk==='!'?'#ffd84a':'#7dffa8';ctx.strokeStyle='#3a2a00';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y-6,9,11,0,0,6.283);ctx.fill();ctx.stroke();
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
  else if(UI.aba===2)trocaSlot(SLOTS_EQ[i][0],1);
  else if(UI.aba===ABA_HABS)alternaHab(i);
  else if(UI.aba===ABA_ECOS)acaoEco(i);
  else if(UI.aba===ABA_MISSOES){const k=listaDiario()[i];if(k&&k!=='_historia')alternaRastreio(k);}
  else if(UI.aba===ABA_SALVAR)acaoSalvar(i);}
function abreMenu(){if(ab.on||fala||(typeof transicao!=='undefined'&&transicao))return;UI.menu=!UI.menu;UI.home=true;UI.aba=0;UI.sel=0;UI.confirmaNovo=false;som(UI.menu?SOM.ui_vez:SOM.ui_mover,.5);}
function fecha(){UI.menu=false;UI.loja=null;UI.escolha=null;som(SOM.ui_mover,.45);}
function uiTecla(k){
  if(typeof transicao!=='undefined'&&transicao)return true;   // luta comecando: ignora teclas (nao abre menu sem querer)
  if(!uiAberto()){if(k==='m'||k==='i'||k==='escape'||k==='tab'){abreMenu();return true;}return false;}
  const l=listaAtual(),n=Math.max(1,l.length),obj=UI.escolha||UI.loja||UI;
  if(UI.menu&&!UI.home&&!UI.escolha&&!UI.loja&&(k==='escape'||k==='backspace')){UI.home=true;UI.sel=Math.max(0,HOME.findIndex(h=>h[1]===UI.aba));som(SOM.ui_mover,.45);return true;}   // dentro de uma secao: volta ao menu principal
  if(k==='escape'||k==='backspace'||(UI.menu&&(k==='m'||k==='i'))){fecha();return true;}
  if(UI.menu&&UI.home&&(k==='arrowright'||k==='arrowleft'||k==='d'||k==='a'||k==='tab'))return true;
  if(UI.menu&&!UI.home&&!UI.loja&&!UI.escolha&&ABA_COM_GRUPO(UI.aba)&&(k==='q'||k==='pageup'||k==='pagedown')){trocaQuem(k==='pageup'?-1:1);return true;}
  if(k==='arrowdown'||k==='s'){obj.sel=(obj.sel+1)%n;som(SOM.ui_mover,.3);}
  else if(k==='arrowup'||k==='w'){obj.sel=(obj.sel-1+n)%n;som(SOM.ui_mover,.3);}
  else if(UI.menu&&UI.aba===ABA_ECOS&&(k==='arrowright'||k==='d'||k==='arrowleft'||k==='a')){UI.ecoCol=(k==='arrowright'||k==='d')?1:0;UI.sel=UI.ecoCol?0:ecoLista().indexOf(ecoVisto());som(SOM.ui_mover,.3);}
  else if(UI.menu&&UI.aba===ABA_SALVAR&&UI.sel<3&&(k==='arrowright'||k==='d'||k==='arrowleft'||k==='a')){acaoSalvar(UI.sel,(k==='arrowright'||k==='d')?1:-1);}
  else if(UI.menu&&(k==='arrowright'||k==='d'||k==='tab')){if(UI.aba===2&&k!=='tab')trocaSlot(SLOTS_EQ[UI.sel][0],1);else{UI.aba=(UI.aba+1)%ABAS.length;UI.sel=0;UI.confirmaNovo=false;som(SOM.ui_mover,.3);}}
  else if(UI.menu&&(k==='arrowleft'||k==='a')){if(UI.aba===2)trocaSlot(SLOTS_EQ[UI.sel][0],-1);else{UI.aba=(UI.aba+ABAS.length-1)%ABAS.length;UI.sel=0;som(SOM.ui_mover,.3);}}
  else if(UI.loja&&(k==='arrowright'||k==='arrowleft')&&LOJAS[UI.loja.id].compra){UI.loja.modo=UI.loja.modo==='comprar'?'vender':'comprar';UI.loja.sel=0;som(SOM.ui_mover,.3);}
  else if(k==='enter'||k===' '||k==='e')ativa(obj.sel);
  return true;
}
// areas clicaveis montadas no desenho
let ZONAS=[];
function uiClique(x,y){
  if(typeof transicao!=='undefined'&&transicao)return true;
  if(!uiAberto()){if(x>W-118&&x<W-10&&y>46&&y<76){abreMenu();return true;}return false;}
  for(const z of ZONAS)if(x>=z[0]&&x<=z[2]&&y>=z[1]&&y<=z[3]){z[4]();return true;}
  if(UI.escolha){UI.escolha=null;return true;}
  return true;
}

// ---------- desenho
function painel(x,y,w,h){ctx.fillStyle='rgba(6,16,40,.94)';ctx.strokeStyle='#8fdcff';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x,y,w,h,10);ctx.fill();ctx.stroke();}
function linhaSel(x,y,w,h,on){if(on){ctx.fillStyle='rgba(127,214,245,.22)';ctx.beginPath();ctx.roundRect(x,y,w,h,6);ctx.fill();ctx.fillStyle='#7fd6f5';ctx.beginPath();ctx.moveTo(x+6,y+h/2-5);ctx.lineTo(x+12,y+h/2);ctx.lineTo(x+6,y+h/2+5);ctx.fill();}}
function botaoMenu(){ctx.save();ctx.fillStyle='rgba(6,16,40,.8)';ctx.strokeStyle='#8fdcff';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(W-118,46,108,30,7);ctx.fill();ctx.stroke();
  texto('☰ Menu  (M)',W-110,67,14,'#e8f6ff');texto(JOGO.gil+' gil',W-114,96,13,'#ffe27a');ctx.restore();}
function uiDesenha(){
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ZONAS=[];
  if(!ab.on&&!uiAberto()){botaoMenu();if(typeof miniHud==='function')miniHud();}
  // avisos
  UI.avisos.forEach((a,i)=>{const al=a.v<.2?a.v/.2:a.v>2?(2.4-a.v)/.4:1;ctx.globalAlpha=al;ctx.font='bold 15px "Trebuchet MS"';const w=ctx.measureText(a.txt).width+28;
    ctx.fillStyle='rgba(6,16,40,.9)';ctx.beginPath();ctx.roundRect(W/2-w/2,70+i*36-Math.min(a.v,.2)*20,w,28,8);ctx.fill();texto(a.txt,W/2,89+i*36-Math.min(a.v,.2)*20,15,a.cor,'center');ctx.globalAlpha=1;});
  if(UI.escolha)desenhaEscolha();
  if(UI.loja)desenhaLoja();
  if(UI.menu)desenhaMenu();
  ctx.restore();
}
function desenhaEscolha(){const e=UI.escolha,x=W-250,y=H-290,w=200,h=e.ops.length*36+20;painel(x,y,w,h);
  e.ops.forEach((o,i)=>{const yy=y+12+i*36;linhaSel(x+8,yy,w-16,32,i===e.sel);texto(o,x+28,yy+22,17,'#fff');ZONAS.push([x,yy,x+w,yy+32,()=>{e.sel=i;escolhe(i);}]);});}
function desenhaLoja(){
  const L=LOJAS[UI.loja.id],x=120,y=50,w=W-240,h=H-120,l=itensLoja();painel(x,y,w,h);
  texto(L.nome,x+24,y+34,22,'#ffe27a');texto(JOGO.gil+' gil',x+w-24,y+34,18,'#ffe27a','right');
  if(L.compra){const m=UI.loja.modo;texto(m==='comprar'?'◀ Comprar ▶':'◀ Vender ▶',x+w/2,y+34,15,'#9fe8ff','center');ZONAS.push([x+w/2-70,y+14,x+w/2+70,y+42,()=>{UI.loja.modo=m==='comprar'?'vender':'comprar';UI.loja.sel=0;}]);}
  texto(UI.loja.modo==='vender'?'O Borin compra cristais.':L.ola,x+24,y+60,14,'#c8d8f0');
  const top=Math.max(0,Math.min(UI.loja.sel-4,l.length-6));
  if(!l.length)texto('Nada para vender.',x+40,y+110,16,'#c8d8f0');
  l.slice(top,top+6).forEach((id,j)=>{const i=top+j,it=ITENS[id],yy=y+76+j*40,pode=UI.loja.modo==='vender'||podeComprar(id);
    linhaSel(x+12,yy,w-24,36,i===UI.loja.sel);iconeItem(ctx,id,x+34,yy+5,26);
    texto(it.nome,x+70,yy+24,17,pode?'#fff':'#7a8aa8');
    const ja=bloqueado(it)?'🔒 '+bloqueado(it):(EQUIPAVEL.includes(it.tipo)&&(qtd(id)||equipadoEmAlguem(id))?'já tem':qtd(id)?'tem '+qtd(id):'');
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
  barra(ty+92,'PV','#6fe0a0',hp,hp,'#3fe08a');barra(ty+122,'PM','#7fc8ff',mp,mp,'#4aa8e8');
  texto(funcao,x+12,ty+152,13,'#b8d4ea');}
function desenhaHome(){
  ctx.fillStyle='rgba(3,10,24,.82)';ctx.fillRect(0,0,W,H);
  ctx.font='bold 38px Georgia,"Times New Roman",serif';ctx.fillStyle='#fff';ctx.textAlign='left';ctx.fillText('MENU PRINCIPAL',60,66);ctx.strokeStyle='rgba(190,225,245,.5)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(30,84);ctx.lineTo(W-20,84);ctx.stroke();
  HOME.forEach((h,i)=>{const yy=98+i*47,on=i===UI.sel;
    ctx.fillStyle=on?'rgba(70,170,220,.55)':'rgba(20,60,96,.55)';ctx.fillRect(60,yy,300,39);ctx.strokeStyle=on?'rgba(210,240,255,.95)':'rgba(190,225,245,.45)';ctx.lineWidth=on?2:1;ctx.strokeRect(60.5,yy+.5,299,38);
    if(on){ctx.fillStyle='#bff0ff';ctx.beginPath();ctx.moveTo(36,yy+19);ctx.lineTo(50,yy+11);ctx.lineTo(50,yy+27);ctx.fill();}
    texto(h[0],90,yy+27,21,on?'#fff':'#d8ecf8');ZONAS.push([60,yy,360,yy+39,()=>{UI.sel=i;abreSecao(i);}]);});
  const st=statusJux(JOGO.nivel),prox=expProx(JOGO.nivel)-(JOGO.exp||0);
  cartaoGrupo(400,100,230,H-150,'Jux',JOGO.nivel,'jux',st.hp,st.mp,JOGO.exp||0,Math.max(0,prox),'Espadachim de gelo');
  if(JOGO.bino&&JOGO.bino.ativo&&typeof statusBino==='function'){const b=JOGO.bino,sb=statusBino(b.nivel);cartaoGrupo(650,100,230,H-150,'Bino',b.nivel,'bino',sb.hp,sb.mp,b.exp||0,Math.max(0,expProx(b.nivel)-(b.exp||0)),'Bárbaro tanque');}
  texto(JOGO.gil+' gil',W-30,64,20,'#ffe27a','right');
  texto('▲ ▼ escolhe · ENTER abre · ESC fecha',400,H-18,13,'rgba(220,238,250,.75)');ZONAS.push([W-60,10,W-6,60,fecha]);
}
function desenhaMenu(){
  if(UI.home){desenhaHome();return;}
  const x=90,y=40,w=W-180,h=H-90;painel(x,y,w,h);
  const PIT=ABAS.length>8?80:86;
  ABAS.forEach((a,i)=>{const bx=x+10+i*PIT,on=i===UI.aba,fs=a.length>8?12:15;ctx.fillStyle=on?'#7fd6f5':'rgba(42,58,102,.9)';ctx.beginPath();ctx.roundRect(bx,y+14,PIT-4,30,7);ctx.fill();
    if(on){ctx.font='bold '+fs+'px "Trebuchet MS"';ctx.textAlign='center';ctx.fillStyle='#0c1a2a';ctx.fillText(a,bx+41,y+35);ctx.textAlign='left';}else texto(a,bx+41,y+35,fs,'#e8f6ff','center');ZONAS.push([bx,y+14,bx+82,y+44,()=>{UI.aba=i;UI.sel=0;UI.confirmaNovo=false;}]);});
  texto('✕',x+w-26,y+36,20,'#e8f6ff');ZONAS.push([x+w-44,y+12,x+w-6,y+46,fecha]);
  const cx=x+24;let cy=y+66;
  if(ABA_COM_GRUPO(UI.aba)&&grupoMenu().length>1){seletorGrupo(cx,y+54);cy+=36;}
  const ehB=UI.quem==='bino'&&grupoMenu().includes('bino');
  if(UI.aba===0&&ehB){   // Status do Bino
    const b=JOGO.bino,s=statusBino(b.nivel),R=RET&&RET.bino,RI=RETI&&RETI.bino;
    if(R&&RI&&RI.complete)ctx.drawImage(RI,0,0,R.w,R.h,cx,cy,R.w*1.25,R.h*1.25);
    const sx=cx+230;texto('Bino',sx,cy+26,26,COR_GRUPO.bino);texto('Nível '+b.nivel,sx,cy+56,20,'#ffe27a');
    const prox=b.nivel>=100?0:expProx(b.nivel);
    ctx.fillStyle='rgba(42,58,102,.9)';ctx.fillRect(sx,cy+68,220,10);ctx.fillStyle='#ffb27a';ctx.fillRect(sx,cy+68,prox?220*Math.min(1,(b.exp||0)/prox):220,10);
    texto(prox?'EXP '+(b.exp||0)+' / '+prox:'Nível máximo',sx,cy+96,13,'#c8d8f0');
    [['hp','HP'],['mp','MP'],['atk','ATQ'],['def','DEF'],['atkm','ATQ.M'],['defm','DEF.M'],['vel','VEL'],['crit','Crítico %'],['esq','Esquiva %']].forEach(([k,n],i)=>{const yy=cy+118+i*24;texto(n,sx,yy,15,'#9fe8ff');texto(String(s[k]),sx+140,yy,15,'#fff','right');
      const extra=s[k]-s.base[k];if(extra)texto((extra>0?'+':'')+extra,sx+188,yy,13,extra>0?'#7dffa8':'#ff9a9a','right');});
    // atributos de base (crescem com o nivel), embaixo do retrato igual ao Jux
    [['for','FOR'],['vig','VIG'],['mag','MAG'],['esp','ESP'],['vel','VEL'],['sor','SOR']].forEach(([k,n],i)=>{const bx=cx+8+(i%3)*68,by=cy+218+Math.floor(i/3)*22;
      texto(n,bx,by,12,'#9fb3d9');texto(String(s[k]),bx+60,by,12,'#e8f6ff','right');});
    const ex=sx+260;texto('Função',ex,cy+26,16,'#9fe8ff');texto('Bárbaro tanque',ex,cy+48,15,'#fff');
    texto('Arma',ex,cy+84,15,'#9fe8ff');texto(nomeArmaDe('bino'),ex,cy+104,15,'#fff');
    texto('Só dano físico, sem elemento.',ex,cy+140,13,'#c8d8f0');texto('Protege o time e aguenta os golpes.',ex,cy+158,13,'#c8d8f0');
  }else if(UI.aba===0){   // Status
    const s=statusJux(),R=RET&&RET.jux,RI=RETI&&RETI.jux;
    if(R&&RI&&RI.complete)ctx.drawImage(RI,0,0,R.w,R.h,cx,cy,R.w*1.25,R.h*1.25);
    const sx=cx+230;texto('Jux',sx,cy+26,26,'#bff0ff');texto('Nível '+JOGO.nivel,sx,cy+56,20,'#ffe27a');
    const prox=JOGO.nivel>=NIVEL_MAX_J?0:expProx(JOGO.nivel);
    ctx.fillStyle='rgba(42,58,102,.9)';ctx.fillRect(sx,cy+68,220,10);ctx.fillStyle='#7fd6f5';ctx.fillRect(sx,cy+68,prox?220*JOGO.exp/prox:220,10);
    texto(prox?'EXP '+JOGO.exp+' / '+prox:'Nível máximo',sx,cy+96,13,'#c8d8f0');
    const nomes=[['hp','HP'],['mp','MP'],['atk','ATQ'],['def','DEF'],['atkm','ATQ.M'],['defm','DEF.M'],['vel','VEL'],['crit','Crítico %'],['esq','Esquiva %']];
    nomes.forEach(([k,n],i)=>{const yy=cy+118+i*24;texto(n,sx,yy,15,'#9fe8ff');texto(String(s[k]),sx+140,yy,15,'#fff','right');
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
  }else if(UI.aba===ABA_BESTA){desenhaBestiario(cx,cy,w,h,y);
  }else if(UI.aba===ABA_MAPA){desenhaMapa(x,y,w,h);
  }else if(UI.aba===2){   // Equipar
    const EQ=equipDe(UI.quem),LH=40;SLOTS_EQ.forEach(([s,n],i)=>{const yy=cy+i*LH,id=EQ[s];linhaSel(cx,yy,w-48,LH-4,i===UI.sel);texto(n,cx+24,yy+24,16,'#9fe8ff');
      if(id){iconeItem(ctx,id,cx+150,yy+5,26);texto(ITENS[id].nome,cx+190,yy+25,17,'#fff');if(ITENS[id])texto(ITENS[id].desc,cx+w-90,yy+25,13,'#7dffa8','right');}
      else texto(s==='arma'?nomeArmaDe(UI.quem)+' (arma de base)':'— vazio —',cx+190,yy+25,16,'#7a8aa8');
      texto('◀ ▶',cx+w-56,yy+24,11,'rgba(255,255,255,.4)','right');
      ZONAS.push([cx,yy,cx+w-48,yy+LH-2,()=>{UI.sel=i;trocaSlot(s,1);}]);});
    texto('◀ ▶ ou toque: trocar o equipamento (o que sai volta para a bolsa)'+(grupoMenu().length>1?' · Q: personagem · armas são de cada um, o resto serve em todos':''),cx,y+h-20,13,'#c8d8f0');
  }else{   // Salvar
    SALVAR_OPS.forEach((o,i)=>{const yy=cy+i*50;linhaSel(cx,yy,560,42,i===UI.sel);texto(o,cx+30,yy+28,18,i===4?'#ff9a9a':'#fff');
      if(i<3){const v=VOL[VOL_OPS[i]],bx=cx+250,bw=220;ctx.fillStyle='rgba(42,58,102,.9)';ctx.fillRect(bx,yy+16,bw,10);ctx.fillStyle=i===0?'#7fd6f5':i===1?'#ffe27a':'#c9b8ff';ctx.fillRect(bx,yy+16,bw*v,10);
        texto(Math.round(v*100)+'%',bx+bw+14,yy+28,16,'#e8f6ff');texto('◀',bx-24,yy+28,16,'#9fe8ff');texto('▶',bx+bw+62,yy+28,16,'#9fe8ff');
        ZONAS.push([bx-30,yy,bx-4,yy+42,()=>{UI.sel=i;acaoSalvar(i,-1);}]);ZONAS.push([bx+bw+56,yy,bx+bw+84,yy+42,()=>{UI.sel=i;acaoSalvar(i,1);}]);
        ZONAS.push([bx,yy,bx+bw,yy+42,(mx)=>{UI.sel=i;}]);}
      else ZONAS.push([cx,yy,cx+360,yy+42,()=>{UI.sel=i;acaoSalvar(i);}]);});
    texto('◀ ▶ muda o volume (vale no mapa e na batalha) · o jogo também salva sozinho a cada 15 s.',cx,cy+262,13,'#c8d8f0');
    if(UI.msgSalvo>0)texto('Salvo!',cx+380,cy+178,18,'#7dffa8');
  }
  texto('M/ESC: fechar · ◀ ▶: abas · ▲▼: escolher · ENTER: usar',x+w-16,y+h+24,13,'rgba(255,255,255,.6)','right');
}
