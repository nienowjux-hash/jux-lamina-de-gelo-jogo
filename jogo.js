/* ============ Jux e a Lâmina de Gelo — dados e progresso compartilhados (vila.html e index.html) ============
   ITENS: catálogo (consumíveis, comidas, equipamentos, afiações da Aurora)
   LOJAS: o que cada morador vende
   JOGO: o save (localStorage 'jux_save'): nível, EXP, gil, inventário, equipamento, buffs de comida,
         itens do mapa já pegos, posição na vila, espada, abertura vista
   statusJux(): atributos do nível + equipamento + afiação + comida */
'use strict';
const ITENS={
  // --- poções (Vovó Hilda)
  elixir:  {nome:'Elixir',          tipo:'consumivel',preco:0,venda:150,cor:'#ffd36a',desc:'Recupera todo o HP, todo o MP e cura os estados ruins.',cura:99999,mp:9999,curaEst:'todos'},
  repelente:{nome:'Repelente',tipo:'consumivel',preco:60,cor:'#c8b0ff',desc:'Fora da vila: nada de lutas por 120 passos.',repele:120},
  pocao:   {nome:'Poção',          tipo:'consumivel',preco:50, cor:'#7dffa8',desc:'Recupera 150 HP de um aliado.',cura:150},
  hipocao: {nome:'Hi-Poção',       tipo:'consumivel',preco:150,cor:'#3fe08a',desc:'Recupera 400 HP de um aliado.',cura:400},
  eter:    {nome:'Éter',           tipo:'consumivel',preco:120,cor:'#7fc8ff',desc:'Recupera 40 MP de um aliado.',mp:40},
  antidoto:{nome:'Antídoto',       tipo:'consumivel',preco:30, cor:'#b07cff',desc:'Cura Veneno.',curaEst:['veneno']},
  colirio: {nome:'Colírio',        tipo:'consumivel',preco:30, cor:'#9fe8ff',desc:'Cura Cegueira.',curaEst:['cego']},
  ecoervas:{nome:'Eco-Ervas',      tipo:'consumivel',preco:40, cor:'#7fbf7a',desc:'Cura Silêncio.',curaEst:['silencio']},
  remedio: {nome:'Remédio',        tipo:'consumivel',preco:120,cor:'#ffd36a',desc:'Cura todos os estados ruins.',curaEst:'todos'},
  fenix:   {nome:'Pena de Fênix',  tipo:'consumivel',preco:300,cor:'#ff9a4a',desc:'Revive um aliado caído com 25% do HP.',revive:.25},
  // --- comidas (Ingrid): efeito por algumas batalhas
  pao_mel: {nome:'Pão de Mel',          tipo:'comida',preco:40, cor:'#f2c45a',desc:'+10% de ATQ por 3 batalhas.',buff:{atk:.10},lutas:3},
  ensopado:{nome:'Ensopado de Raiz-de-Neve',tipo:'comida',preco:70,cor:'#c98a4a',desc:'+15% de HP máximo por 3 batalhas.',buff:{hp:.15},lutas:3},
  torta:   {nome:'Torta de Frutas Silvestres',tipo:'comida',preco:90,cor:'#c2457a',desc:'+15% de ATQ.M e +10% de MP máximo por 3 batalhas.',buff:{atkm:.15,mp:.10},lutas:3},
  cha:     {nome:'Chá de Pinheiro',     tipo:'comida',preco:30, cor:'#7fbf7a',desc:'+10% de DEF e DEF.M por 3 batalhas.',buff:{def:.10,defm:.10},lutas:3},
  // --- armas (Borin): so mudam os status, o Jux continua com a Aurora na mao. A Aurora e a arma de base (ATQ 24, ATQ.M 20)
  esp_ferro:   {nome:'Espada de Ferro', tipo:'arma',preco:390, req:{nivel:5}, cor:'#a9b4c4',desc:'ATQ +6.',bonus:{atk:6}},
  esp_runica:  {nome:'Espada Rúnica',   tipo:'arma',preco:910, req:{nivel:9}, cor:'#b49aff',desc:'ATQ +4, ATQ.M +10, MP +6.',bonus:{atk:4,atkm:10,mp:6}},
  esp_aco:     {nome:'Espada de Aço',   tipo:'arma',preco:1430,req:{nivel:12}, cor:'#c8d4e4',desc:'ATQ +14, Crítico +1%.',bonus:{atk:14,crit:1}},
  esp_boreal:  {nome:'Espada Boreal',   tipo:'arma',preco:3640,req:{nivel:20}, cor:'#8fe9ff',desc:'ATQ +28, ATQ.M +10.',bonus:{atk:28,atkm:10}},
  // --- marretas do Bino (Borin): so o Bino usa (para:'bino'); a Marreta de Pedra dele e a arma de base (como a Aurora do Jux)
  mar_ferro:   {nome:'Marreta de Ferro', tipo:'arma',para:'bino',preco:420, req:{nivel:5}, cor:'#a9b4c4',desc:'Só o Bino. ATQ +7.',bonus:{atk:7}},
  mar_runica:  {nome:'Marreta Rúnica',   tipo:'arma',para:'bino',preco:960, req:{nivel:9}, cor:'#b49aff',desc:'Só o Bino. ATQ +9, DEF +4, HP +20.',bonus:{atk:9,def:4,hp:20}},
  mar_aco:     {nome:'Marreta de Aço',   tipo:'arma',para:'bino',preco:1500,req:{nivel:12}, cor:'#c8d4e4',desc:'Só o Bino. ATQ +16, Crítico +1%.',bonus:{atk:16,crit:1}},
  mar_glaciar: {nome:'Marreta Glaciar',  tipo:'arma',para:'bino',preco:3770,req:{nivel:20}, cor:'#8fe9ff',desc:'Só o Bino. ATQ +30, DEF +7.',bonus:{atk:30,def:7}},
  // --- equipamentos (Borin): servem em qualquer membro do grupo (um de cada vez)
  gorro_la:   {nome:'Gorro de Lã',         tipo:'elmo',preco:100, cor:'#5f86d6',desc:'DEF +2, DEF.M +1.',bonus:{def:2,defm:1}},
  elmo_ferro: {nome:'Elmo de Ferro',       tipo:'elmo',preco:340,req:{nivel:6}, cor:'#a9b4c4',desc:'DEF +5, DEF.M +3, HP +12.',bonus:{def:5,defm:3,hp:12}},
  casaco_pele:{nome:'Casaco Forrado',      tipo:'armadura',preco:200, cor:'#8a6a4a',desc:'DEF +4, DEF.M +2, HP +20.',bonus:{def:4,defm:2,hp:20}},
  cota_malha: {nome:'Cota de Malha',       tipo:'armadura',preco:550,req:{nivel:10,espada:true}, cor:'#9aa7b8',desc:'DEF +10, VEL -1.',bonus:{def:10,vel:-1}},
  luvas_ferr: {nome:'Luvas de Ferreiro',   tipo:'luvas',preco:260,req:{nivel:6}, cor:'#c48a3a',desc:'ATQ +3, Crítico +1%.',bonus:{atk:3,crit:1}},
  anel_gelo:  {nome:'Anel de Gelo',        tipo:'acessorio',preco:310,req:{espada:true}, cor:'#9fe8ff',desc:'ATQ.M +5, MP +6.',bonus:{atkm:5,mp:6}},
  botas_neve: {nome:'Botas de Neve',       tipo:'botas',preco:230, cor:'#d8e6f2',desc:'VEL +1, Esquiva +1%.',bonus:{vel:1,esq:1}},
  anel_goblin:{nome:'Anel do Goblin',      tipo:'acessorio',preco:0,venda:60, cor:'#9adf5a',desc:'Roubado de alguém. VEL +1, Esquiva +2%, SOR +2.',bonus:{vel:1,esq:2,sor:2}},
  presa_anciao:{nome:'Presa do Ancião',   tipo:'acessorio',preco:0,venda:120, cor:'#cfe6ff',desc:'Um dente do Lobo Ancião, dado por respeito. ATQ +5, Crítico +2%.',bonus:{atk:5,crit:2}},
  amuleto_vida:{nome:'Amuleto da Vida',    tipo:'acessorio',preco:420,req:{nivel:8}, cor:'#ff7a8a',desc:'HP +40.',bonus:{hp:40}},
  // --- coisas de missão (missoes.js): não vendem, somem ao entregar
  fruta:   {nome:'Fruta Silvestre',tipo:'missao',preco:0,cor:'#d8406a',desc:'Fruta vermelha e azedinha. A Ingrid quer para a torta.'},
  erva:    {nome:'Erva-de-Neve',  tipo:'missao',preco:0,cor:'#7fe0b0',desc:'Folha gelada que a Vovó Hilda usa nos remédios.'},
  bau_capitao:{nome:'Baú do Capitão',tipo:'missao',preco:0,cor:'#c9a060',desc:'Pesado, trancado e cheirando a nabo. As economias "honestas" do Capitão.'},
  cachecol:{nome:'Cachecol do Tico',tipo:'missao',preco:0,cor:'#e0453a',desc:'Vermelho, quentinho e com cheiro de Sir Bacon.'},
  // --- materiais (achados no mapa e, depois, em batalhas)
  fragmento_eco:{nome:'Fragmento de Eco',tipo:'material',preco:0,cor:'#bfe8ff',desc:'Uma lasca de cristal com uma criatura lendária dormindo dentro. Ainda não acordou.'},
  pelagem_alfa:{nome:'Pelagem do Alfa',tipo:'material',preco:0,venda:100,cor:'#8a7aa8',desc:'Pelo cinza-chumbo do Skoll, ainda com um fio roxo do Eclipse. O Borin compra.'},
  pelagem: {nome:'Pelagem de Lobo',tipo:'material',preco:0,venda:18,cor:'#e8f4ff',desc:'Pelo branco e gelado de um Lobo da Geada. O Borin compra.'},
  geleia:  {nome:'Geleia de Neve',tipo:'material',preco:0,venda:12,cor:'#bfe8ff',desc:'O que sobra de uma Bolota. Tem gosto de picolé triste.'},
  brasa:   {nome:'Brasa de Ignarok',tipo:'material',preco:0,venda:35,cor:'#ff8a3c',desc:'Uma brasa que nunca apaga, arrancada de um Ignarok. O Borin compra.'},
  minerio: {nome:'Minério de Ferro',tipo:'material',preco:0,venda:20,cor:'#9aa7b8',desc:'Material de forja. O Borin compra.'},
  // --- achados (não se compram)
  machado_halvard:{nome:'Machado do Halvard',tipo:'material',preco:0,venda:0,cor:'#c8d0dc',desc:'O machado da família do caçador Halvard, de volta. O Bino não larga a marreta, mas olha para ele de vez em quando.'},
  cristal: {nome:'Cristal de Gelo',  tipo:'material',preco:0,venda:25,cor:'#9ff0ff',desc:'Cristal que guarda frio antigo. O Borin compra.'},
};
// um espaco por tipo (pedido 2026-11-19: 'nao da para por duas botas'); so os ACESSORIOS (aneis, amuletos, colares) tem dois espacos
const SLOTS_EQ=[['arma','Arma'],['elmo','Elmo'],['armadura','Armadura'],['luvas','Luvas'],['botas','Botas'],['acessorio','Acessório 1'],['acessorio2','Acessório 2']];
const tipoDoSlot=s=>s.startsWith('acessorio')?'acessorio':s;
const EQUIPAVEL=['arma','elmo','armadura','luvas','botas','acessorio'];
// em qual espaço o item entra: acessório vai para o 1º vazio (senão troca o Acessório 1)
function slotPara(it,q){const E=equipDe(q||donoItem(it));if(it.tipo!=='acessorio')return it.tipo;return !E.acessorio?'acessorio':!E.acessorio2?'acessorio2':'acessorio';}
// ---------- GRUPO (MENU_GRUPO.md): cada personagem tem o seu equipamento. Jux: JOGO.equip; companheiros: JOGO.equipDe[id]
// arma e de cada um (it.para: espadas = Jux, marretas = Bino); elmo, armadura e acessorios servem em qualquer um, mas um de cada vez
const EQ_VAZIO=()=>({arma:null,elmo:null,armadura:null,luvas:null,botas:null,acessorio:null,acessorio2:null});
function equipDe(q){if(!q||q==='jux')return JOGO.equip;JOGO.equipDe=JOGO.equipDe||{};const E=JOGO.equipDe[q]=JOGO.equipDe[q]||{};for(const k in EQ_VAZIO())if(!(k in E))E[k]=null;return E;}   // sempre o MESMO objeto (mexer nele salva)
const donoItem=it=>(it&&it.tipo==='arma')?(it.para||'jux'):'jux';
const serveEm=(it,q)=>!!it&&(it.tipo!=='arma'||(it.para||'jux')===(q||'jux'));
function equipadoEmAlguem(id){if(Object.values(JOGO.equip).includes(id))return true;for(const k in (JOGO.equipDe||{}))if(Object.values(JOGO.equipDe[k]).includes(id))return true;return false;}
function bonusEquipDe(q){const eq={},E=equipDe(q);for(const [s] of SLOTS_EQ){const it=ITENS[E[s]];if(it&&it.bonus)for(const k in it.bonus)eq[k]=(eq[k]||0)+it.bonus[k];}return eq;}
const ARMA_BASE={jux:'Aurora Gélida',bino:'Marreta de Pedra'};
function nomeArmaDe(q){const a=ITENS[equipDe(q).arma];return a?a.nome:(ARMA_BASE[q||'jux']||'Nenhuma arma');}
const LOJAS={
  vovo:  {nome:'Remédios da Vovó Hilda',quem:'Vovó Hilda',itens:['pocao','hipocao','eter','antidoto','colirio','ecoervas','remedio','repelente','fenix'],ola:'Poções feitas com ervas da montanha. Paga e não reclama.'},
  borin: {nome:'Forja do Borin',quem:'Borin',itens:['esp_ferro','esp_runica','esp_aco','esp_boreal','mar_ferro','mar_runica','mar_aco','mar_glaciar','gorro_la','casaco_pele','luvas_ferr','botas_neve','anel_gelo','elmo_ferro','amuleto_vida','cota_malha'],ola:'HA! Ferro bom, preço justo! ...Quase justo!',compra:true},
  capitao:{nome:'Comércio Honesto do Capitão',quem:'Capitão',itens:['pocao','hipocao','eter','antidoto','colirio','pao_mel','botas_neve','amuleto_vida'],ola:'Capitão Dente-de-Ferro, Comércio Honesto. Nunca mais roubei. (Quase.)'},
  ingrid:{nome:'Padaria da Ingrid',quem:'Ingrid',itens:['cha','pao_mel','ensopado','torta'],ola:'Pão quentinho dá força pra aventura! Literalmente!'},
};
const NIVEL_MAX_J=100;
const expProx=n=>Math.round(100*Math.pow(n,1.5));      // EXP para passar do nível n para o n+1 (igual à batalha)

const JOGO={
  versao:1,
  nivel:1,exp:0,gil:120,
  inv:{pocao:3},
  equip:{arma:null,elmo:null,armadura:null,luvas:null,botas:null,acessorio:null,acessorio2:null},
  buff:null,                 // {id, lutas}
  pegos:[],                  // brilhos e baús já abertos (e coisas de missão pegas)
  missoes:{},                // {id:{st:'ativa'|'feita',v0}} (missoes.js)
  vitorias:0,                // batalhas vencidas
  vila:null,                 // {x,y,espada,abertura}
};
// ---------- VOLUME (menu Sistema): musica, efeitos e vozes, de 0 a 1, salvo em localStorage 'jux_vol'.
// Vale para todo <audio> do jogo sem mexer em cada som: o volume que o codigo pede e multiplicado pelo do tipo do arquivo
// (musica = pastas/arquivos de musica; voz = arquivos voz_*; o resto = efeitos). Os sons sintetizados (WebAudio) passam por acSaida().
const VOL=(()=>{const d={mus:1,sfx:1,voz:1};try{return Object.assign(d,JSON.parse(localStorage.getItem('jux_vol')||'{}'));}catch(e){return d;}})();
function tipoAudio(el){if(el.dataset&&el.dataset.tipo)return el.dataset.tipo;const s=el.currentSrc||el.src||'';return /\/voz[_\/]/.test(s)?'voz':/\/musica[\/_]|cine_|bino_[ab]\.|espada_lenda|espada_heroi|intro_piano|chefe_|batalha\./.test(s)?'mus':'sfx';}
// acerto fino de volume por arquivo (medido em LUFS, 2026-11-19): a musica da vila era ~5 dB mais alta que a dos outros mapas
// e a da batalha comum ~4 dB mais baixa que a dos chefes. Corrige aqui, sem mexer nos arquivos.
const GANHO_ARQ=[[/musica_vila_2\./,.7],[/musica_(trilha|caverna|garganta)\./,1.2],[/\/batalha\.(ogg|mp3)/,1.35]];
function ganhoArq(el){const s=el.currentSrc||el.src||'';for(const [r,g] of GANHO_ARQ)if(r.test(s))return g;return 1;}
const AUDIOS_VIVOS=new Set();
(()=>{const d=Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype,'volume');if(!d||!d.set)return;
  Object.defineProperty(HTMLMediaElement.prototype,'volume',{configurable:true,
    get(){return this._volPedido!==undefined?this._volPedido:d.get.call(this);},
    set(v){this._volPedido=v;AUDIOS_VIVOS.add(this);d.set.call(this,Math.max(0,Math.min(1,v*(VOL[tipoAudio(this)]??1)*ganhoArq(this))));}});
  setInterval(()=>{for(const a of AUDIOS_VIVOS)if(a.paused||a.ended)AUDIOS_VIVOS.delete(a);},8000);})();
function mudaVol(tipo,v){VOL[tipo]=Math.max(0,Math.min(1,Math.round(v*10)/10));try{localStorage.setItem('jux_vol',JSON.stringify(VOL));}catch(e){}
  for(const a of AUDIOS_VIVOS)if(!a.paused)a.volume=a._volPedido;   // reaplica no que esta tocando agora
  for(const ac of (window.__acs||[]))if(ac._saida)ac._saida.gain.value=VOL.sfx;}
function acSaida(ac){if(!ac._saida){ac._saida=ac.createGain();ac._saida.gain.value=VOL.sfx;ac._saida.connect(ac.destination);(window.__acs=window.__acs||[]).push(ac);}return ac._saida;}
// ERROS NA TELA (pedido 2026-11-19: 'da uma crachada'): qualquer erro aparece num cantinho por 20 s, para o usuario mandar print
function mostraErro(e,onde){try{const m=(e&&(e.message||e.reason&&e.reason.message))||String(e);if(/AbortError|NotAllowedError|NotSupportedError|play\(\) request|ResizeObserver/.test(((e&&e.name)||'')+' '+m))return;   // avisos de som/navegador: nao e erro do jogo
  let b=document.getElementById('erro_jux');
  if(!b){b=document.createElement('div');b.id='erro_jux';b.style.cssText='position:fixed;left:8px;bottom:8px;z-index:99;max-width:60vw;background:rgba(80,0,10,.9);color:#fff;font:12px monospace;padding:6px 9px;border-radius:6px;pointer-events:none';document.body.appendChild(b);}
  const st=(e&&e.stack)||'';b.textContent='⚠ erro: '+m+(onde?' ('+onde+')':'')+(st?' | '+st.split(String.fromCharCode(10)).slice(1,3).join(' ').replace(/https?:[^ )]*[/]/g,''):'');b.style.display='block';clearTimeout(b._t);b._t=setTimeout(()=>{b.style.display='none';},20000);console.error(e);}catch(_){}}
addEventListener('error',ev=>mostraErro(ev.error||ev.message,(ev.filename||'').split('/').pop()+':'+ev.lineno));
addEventListener('unhandledrejection',ev=>mostraErro(ev.reason));
// OPCOES (menu Sistema, 2026-11-19): velocidade do texto das falas e tremor da tela. localStorage 'jux_opc'
const OPC=(()=>{const d={texto:1,tremor:true};try{return Object.assign(d,JSON.parse(localStorage.getItem('jux_opc')||'{}'));}catch(e){return d;}})();
const VEL_TEXTO=[[.5,'Lento'],[1,'Normal'],[2,'Rápido'],[99,'Na hora']];
function salvaOpc(){try{localStorage.setItem('jux_opc',JSON.stringify(OPC));}catch(e){}}
const SAVE_J='jux_save';
function carregaJogo(){
  try{const s=JSON.parse(localStorage.getItem(SAVE_J)||'null');
    if(s&&s.versao){Object.assign(JOGO,s);JOGO.inv=s.inv||{};JOGO.equip=Object.assign(EQ_VAZIO(),s.equip||{});if(JOGO.equip.arma==='aurora')JOGO.equip.arma=null;arrumaEquip();return true;}   // a Aurora Gelida NAO e item: e so o visual da espada do heroi (os status base dela ficam em AURORA)
    const v=JSON.parse(localStorage.getItem('jux_progresso')||'null');   // progresso antigo da batalha
    if(v&&v.nivel){JOGO.nivel=v.nivel|0;JOGO.exp=v.exp|0;}
  }catch(e){}
  return false;
}
// VIDA ENTRE LUTAS (pedido 2026-11-19: 'voltar com a mesma vida da ultima batalha'): JOGO.vida = {jux:{hp,mp}, bino:{hp,mp}}
// (sem registro = cheio). Enche so ao subir de nivel, no santuario de cristal, conversando com a Vovo ou perdendo (a Vovo cuida).
function guardaVida(q,hp,mp){JOGO.vida=JOGO.vida||{};JOGO.vida[q]={hp:Math.max(0,Math.round(hp)),mp:Math.max(0,Math.round(mp))};}
function encheVida(q){if(!JOGO.vida)return;if(q)delete JOGO.vida[q];else JOGO.vida={};}
function vidaAtual(q){const s=q==='bino'?(typeof statusBino==='function'&&JOGO.bino?statusBino(JOGO.bino.nivel):{hp:400,mp:40}):statusJux(),v=(JOGO.vida||{})[q];
  return v?{hp:Math.min(v.hp,s.hp),mp:Math.min(v.mp,s.mp),max:s.hp,mmax:s.mp}:{hp:s.hp,mp:s.mp,max:s.hp,mmax:s.mp};}
function salvaJogo(){if(window.LAB_FIXO||window.__importou)return;try{localStorage.setItem(SAVE_J,JSON.stringify(JOGO));localStorage.setItem('jux_progresso',JSON.stringify({nivel:JOGO.nivel,exp:JOGO.exp}));}catch(e){}}
function temSave(){try{return !!localStorage.getItem(SAVE_J);}catch(e){return false;}}
function novoJogo(){try{localStorage.removeItem(SAVE_J);localStorage.removeItem('jux_progresso');localStorage.removeItem('jux_abertura_vista');}catch(e){}}
const qtd=id=>JOGO.inv[id]||0;
// saves antigos: luvas e botas eram acessorios. Sai do espaco de acessorio e vai para o espaco dele (ocupado: volta para a bolsa)
function arrumaEquip(){const lista=[JOGO.equip,...Object.values(JOGO.equipDe||{})];
  for(const E of lista){for(const k in EQ_VAZIO())if(!(k in E))E[k]=null;
    for(const s of ['acessorio','acessorio2']){const id=E[s],it=id&&ITENS[id];if(!it||it.tipo==='acessorio')continue;
      if(EQUIPAVEL.includes(it.tipo)&&!E[it.tipo])E[it.tipo]=id;else JOGO.inv[id]=(JOGO.inv[id]||0)+1;E[s]=null;}}}
function daItem(id,n){JOGO.inv[id]=qtd(id)+(n||1);}
function tiraItem(id,n){JOGO.inv[id]=Math.max(0,qtd(id)-(n||1));if(!JOGO.inv[id])delete JOGO.inv[id];}

// ---------- ATRIBUTOS (SISTEMA_RPG.md §1)
// base que cresce com o nivel: FOR VIG MAG ESP VEL SOR
// batalha: HP MP ATQ DEF ATQ.M DEF.M VEL + Crítico%, Dano crítico%, Esquiva%, Precisão%
const NOMES_ATRIB={hp:'HP',mp:'MP',atk:'ATQ',def:'DEF',atkm:'ATQ.M',defm:'DEF.M',vel:'VEL',crit:'Crítico',critd:'Dano crít.',esq:'Esquiva',
  for:'FOR',vig:'VIG',mag:'MAG',esp:'ESP',sor:'SOR'};
function baseNivel(n){return {for:10+1.6*(n-1),vig:10+1.4*(n-1),mag:10+1.6*(n-1),esp:10+1.4*(n-1),vel:10+.5*(n-1),sor:10+.4*(n-1)};}
// a Aurora (arma fixa da historia): ATQ 24 e ATQ.M 20. Nao ha refino: outras armas e equipamentos so somam status
const AURORA={atk:24,atkm:20};
function statusJux(nivel,semEquip){
  const n=nivel||JOGO.nivel,b=baseNivel(n);
  const eq={hp:0,mp:0,atk:0,def:0,atkm:0,defm:0,vel:0,sor:0,crit:0,esq:0};
  if(!semEquip)for(const [s] of SLOTS_EQ){const id=JOGO.equip[s],it=id&&ITENS[id];if(it&&it.bonus)for(const k in it.bonus)eq[k]=(eq[k]||0)+it.bonus[k];}
  const f=(!semEquip&&JOGO.buff&&ITENS[JOGO.buff.id])?ITENS[JOGO.buff.id].buff:{};
  const B=(!semEquip&&typeof bonusEcos==='function')?bonusEcos():{pct:{},soma:{},esp:{}},F=B.flat||{};
  const m=k=>1+(f[k]||0)+(B.pct[k]||0);
  const r={
    for:Math.round(b.for),vig:Math.round(b.vig),mag:Math.round(b.mag),esp:Math.round(b.esp),sor:Math.round(b.sor+eq.sor),
    hp:Math.round((200+b.vig*10+eq.hp+(F.hp||0))*m('hp')),
    mp:Math.round((30+b.esp*3+eq.mp+(F.mp||0))*m('mp')),
    atk:Math.round((b.for+AURORA.atk+eq.atk+(F.atk||0))*m('atk')),
    def:Math.round((b.vig+eq.def+(F.def||0))*m('def')),
    atkm:Math.round((b.mag+AURORA.atkm+eq.atkm+(F.atkm||0))*m('atkm')),
    defm:Math.round((b.esp+eq.defm+(F.defm||0))*m('defm')),
    vel:Math.round(b.vel+eq.vel+(B.soma.vel||0)),
  };
  r.crit=Math.min(50,Math.round(5+r.sor/4+eq.crit+(B.soma.crit||0)));
  r.critd=150;
  r.esq=Math.min(50,Math.round(r.sor/6+eq.esq+(B.soma.esq||0)));
  r.esp_=B.esp;
  r.base=statusBase(n);r.comida=f;r.eq=eq;
  return r;
}
// o mesmo sem nada equipado (para comparar e para o laboratorio)
function statusBase(n){const b=baseNivel(n);return {hp:Math.round(200+b.vig*10),mp:Math.round(30+b.esp*3),atk:Math.round(b.for+AURORA.atk),def:Math.round(b.vig),
  atkm:Math.round(b.mag+AURORA.atkm),defm:Math.round(b.esp),vel:Math.round(b.vel),crit:Math.round(5+b.sor/4),critd:150,esq:Math.round(b.sor/6)};}
function nomeArma(){const a=ITENS[JOGO.equip.arma];return a?a.nome:'Nenhuma arma';}
// desenho do ícone de um item (sem imagem: frasco, pão, peça de equipamento, gema)
let ICO_IMG=null;
function iconeItem(c,id,x,y,s){
  const IC=window.JUX_ICONES;if(IC&&!ICO_IMG){ICO_IMG=new Image();ICO_IMG.src=IC.atlas;}
  const k_=IC?IC.ordem.indexOf(id):-1;
  if(k_>=0&&ICO_IMG.complete&&ICO_IMG.naturalWidth){c.drawImage(ICO_IMG,k_*IC.t,0,IC.t,IC.t,x-s*.1,y-s*.1,s*1.2,s*1.2);return;}
  const it=ITENS[id]||{tipo:'tesouro',cor:'#fff'},k=s/16;c.save();c.translate(x,y);c.scale(k,k);c.lineWidth=1.2;c.strokeStyle='#0a1830';
  const cor=it.cor||'#fff';
  if(it.tipo==='consumivel'){c.fillStyle='#d8eef8';c.fillRect(6,1,4,3);c.fillStyle=cor;c.beginPath();c.arc(8,10,5,0,6.283);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.7)';c.fillRect(5,7,2,2);}
  else if(it.tipo==='comida'){c.fillStyle=cor;c.beginPath();c.ellipse(8,10,7,4.5,0,0,6.283);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.5)';c.fillRect(4,8,4,1.5);}
  else if(it.tipo==='elmo'){c.fillStyle=cor;c.beginPath();c.arc(8,10,6,Math.PI,0);c.lineTo(14,12);c.lineTo(2,12);c.closePath();c.fill();c.stroke();}
  else if(it.tipo==='armadura'){c.fillStyle=cor;c.beginPath();c.moveTo(3,3);c.lineTo(13,3);c.lineTo(14,14);c.lineTo(2,14);c.closePath();c.fill();c.stroke();c.fillStyle='rgba(0,0,0,.25)';c.fillRect(7,3,2,11);}
  else if(it.tipo==='luvas'||it.tipo==='botas'){c.fillStyle=cor;c.fillRect(3,5,10,8);c.strokeRect(3,5,10,8);c.fillRect(it.tipo==='botas'?9:3,11,4,4);}
  else if(it.tipo==='acessorio'){c.strokeStyle=cor;c.lineWidth=2.4;c.beginPath();c.arc(8,9,4.5,0,6.283);c.stroke();c.fillStyle='#fff';c.fillRect(7,3,2,2);}
  else if(id==='fruta'){c.fillStyle='#3f8a4a';c.fillRect(7,1,2,4);for(const [a,b] of [[5,9],[11,9],[8,13]]){c.fillStyle=cor;c.beginPath();c.arc(a,b,3.4,0,6.283);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.7)';c.fillRect(a-1.6,b-1.8,1.4,1.4);}}
  else if(id==='erva'){c.fillStyle=cor;for(const r of[-.6,0,.6]){c.save();c.translate(8,14);c.rotate(r);c.beginPath();c.ellipse(0,-6,2.6,6,0,0,6.283);c.fill();c.stroke();c.restore();}c.fillStyle='#e8fbff';c.fillRect(7,3,2,2);}
  else if(id==='cachecol'){c.fillStyle=cor;c.beginPath();c.moveTo(2,4);c.quadraticCurveTo(8,9,14,4);c.lineTo(14,7);c.quadraticCurveTo(8,12,4,8);c.lineTo(5,15);c.lineTo(2,15);c.closePath();c.fill();c.stroke();c.fillStyle='#fff3e0';c.fillRect(2,12,3,1.2);c.fillRect(7,8,1.4,2);}
  else if(it.tipo==='arma'||id==='aurora'){c.fillStyle='#bff4ff';c.beginPath();c.moveTo(13,1);c.lineTo(15,3);c.lineTo(6,12);c.lineTo(4,10);c.closePath();c.fill();c.stroke();c.fillStyle='#8a6a4a';c.fillRect(2,11,4,3);}
  else{c.fillStyle=cor;c.beginPath();c.moveTo(8,1);c.lineTo(14,8);c.lineTo(8,15);c.lineTo(2,8);c.closePath();c.fill();c.stroke();}
  c.restore();
}
carregaJogo();
