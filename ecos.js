/* ============ ECOS (SISTEMA_RPG.md §5) — a versão do jogo dos "Visions" do FF Resonance ============
   Memórias de heróis antigos em fragmentos de cristal que a Aurora ouve. O Jux equipa 1 Eco: ganha bônus de
   atributos e, lutando com ele, ganha PE (pontos de Eco) -> sobe o nível do Eco (1 a 9) -> aprende habilidades.
   Habilidade aprendida fica para sempre; para usar, equipa dentro do limite de AP (cresce com o nível do Jux). */
'use strict';
// níveis do Eco: 1 a 100. PE_NIVEL[i] = PE para chegar no nível i+1. Até o nível 9 é a tabela do Resonance (saves antigos seguem iguais);
// do 10 ao 100 a curva sobe devagar: 4195 + (n-9)*(n+10)*4
const NIVEL_MAX_ECO=100;
const PE_NIVEL=[0,10,35,95,195,395,695,1195,2195,4195];
for(let n=10;n<=NIVEL_MAX_ECO;n++)PE_NIVEL.push(4195+(n-9)*(n+10)*4);
const peParaNivel=n=>PE_NIVEL[Math.max(1,Math.min(NIVEL_MAX_ECO,n))-1];
const nivelEco=pe=>{let n=1;for(let i=1;i<PE_NIVEL.length;i++)if(pe>=PE_NIVEL[i])n=i+1;return Math.min(NIVEL_MAX_ECO,n);};
const limiteAP=nv=>10+Math.floor(nv/2);   // 10 no nível 1, 60 no nível 100 (PLANO_V2.md)
const ECOS={
  lamina:   {nome:'Eco da Lâmina',   papel:'Atacante', cor:'#ff9a6a',desc:'O Fenrir, lobo de gelo que nunca perdeu uma caçada.',bonus:{atk:.08,crit:3},porNivel:{hp:5,atk:1,crit5:1},
             habs:['golpe_duplo','p_atk','perfurante','p_crit','furia','matilha','p_pelagem','p_sede','p_alfa','ragnarok']},
  arcano:   {nome:'Eco Arcano',      papel:'Mago',     cor:'#b49aff',desc:'Uma maga que conversava com os elementos.',bonus:{atkm:.08,mp:.10},porNivel:{mp:2,atkm:1},
             habs:['fogo','p_mag','raio','agua','p_mp']},
  guardiao: {nome:'Eco do Guardião', papel:'Guardião', cor:'#7fb8ff',desc:'A Tartarok, tartaruga gigante de natureza que guarda o rio há mil anos (salva da Serpente do Degelo).',bonus:{hp:.10,def:.08},porNivel:{hp:8,def:1},
             habs:['muralha','p_hp','contra','p_def','vontade']},
  sabio:    {nome:'Eco do Sábio',    papel:'Suporte',  cor:'#7dffa8',desc:'Um curandeiro errante de mãos quentes.',bonus:{defm:.08,mp:.15},porNivel:{mp:2,defm:1},
             habs:['cura','esuna','p_regen','pressa','regen']},
  sombra:   {nome:'Eco da Sombra',   papel:'Sabotador',cor:'#c08cff',desc:'Uma ladra que roubou até o nome da Ordem.',bonus:{vel:2,esq:4},porNivel:{hp:3,atk:1,crit5:1},
             habs:['veneno_h','p_esq','cegar','roubar','p_vel']},
  quebrador:{nome:'Eco do Quebrador',papel:'Quebrador',cor:'#ffd36a',desc:'Um gigante que partia montanhas com o punho.',bonus:{atk:.04,atkm:.04},porNivel:{atk:1,atkm:1},
             habs:['impacto','analise','p_quebra','esmagar','p_atk2']},
};
// habilidades: ativa (aparece em Magia na batalha) ou passiva (sempre ligada se equipada)
// nv = nível do Eco que ensina; ap = custo para equipar
const HABS={
  // Lâmina
  golpe_duplo:{nome:'Mordida Glacial',  nv:1,ap:3,mp:6, alvo:'inim',t:'f',el:null,  poder:[28,28],q:1.2,criatura:'mordida',desc:'O Fenrir salta e morde duas vezes.'},
  p_atk:      {nome:'Presas Afiadas',   nv:5,ap:3,passiva:{atk:.10},desc:'Passiva: ATQ +10%.'},
  perfurante: {nome:'Garra Perfurante', nv:10,ap:4,mp:12,alvo:'inim',t:'f',el:null,  poder:[72],q:1,perfura:.5,criatura:'garra',desc:'O Fenrir crava as garras: ignora metade da DEF.'},
  p_crit:     {nome:'Instinto do Caçador',nv:20,ap:4,passiva:{crit:8},desc:'Passiva: crítico +8%.'},
  matilha:    {nome:'Matilha Fantasma', nv:45,ap:6,mp:22,alvo:'todos',t:'f',el:'gelo',poder:[42,42],q:1.5,criatura:'matilha',desc:'Lobos fantasmas atravessam o campo: 2 mordidas em cada inimigo.'},
  p_pelagem:  {nome:'Pelagem de Lâminas',nv:60,ap:5,passiva:{contra:.20},desc:'Passiva: 20% de chance de revidar golpes físicos.'},
  p_sede:     {nome:'Sede de Caça',     nv:75,ap:5,passiva:{sede:.20},desc:'Passiva: +20% de dano em inimigo com menos da metade do HP.'},
  p_alfa:     {nome:'Fúria do Alfa',    nv:90,ap:6,passiva:{crit:10,vel:3},desc:'Passiva: crítico +10% e VEL +3.'},
  ragnarok:   {nome:'Ragnarök',         nv:100,ap:8,mp:40,alvo:'todos',t:'f',el:'gelo',poder:[230],q:3,criatura:'ragnarok',desc:'Suprema: o Fenrir vira o lobo do fim do mundo e devora o campo.'},
  furia:      {nome:'Uivo da Lua',      nv:30,ap:5,mp:10,alvo:'eu',  est:['bravura',4],criatura:'uivo',desc:'O Fenrir uiva: Bravura, dano +25% por 4 turnos.'},
  // Arcano
  fogo:       {nome:'Fogo',             nv:1,ap:3,mp:8, alvo:'inim',t:'m',el:'fogo',poder:[50],q:1,desc:'Magia de fogo.'},
  p_mag:      {nome:'ATQ.M +10%',       nv:2,ap:3,passiva:{atkm:.10},desc:'Passiva.'},
  raio:       {nome:'Raio',             nv:3,ap:3,mp:8, alvo:'inim',t:'m',el:'raio',poder:[50],q:1,desc:'Magia de raio.'},
  agua:       {nome:'Água',             nv:4,ap:3,mp:8, alvo:'inim',t:'m',el:'agua',poder:[50],q:1,desc:'Magia de água.'},
  p_mp:       {nome:'MP +15%',          nv:6,ap:3,passiva:{mp:.15},desc:'Passiva.'},
  // Guardião
  muralha:    {nome:'Muralha',          nv:1,ap:3,mp:8, alvo:'eu',  est:['muralha',4],desc:'Dano recebido −30% por 4 turnos.'},
  p_hp:       {nome:'HP +10%',          nv:2,ap:3,passiva:{hp:.10},desc:'Passiva.'},
  contra:     {nome:'Contra-ataque',    nv:4,ap:5,passiva:{contra:.25},desc:'Passiva: 25% de chance de revidar golpes físicos.'},
  p_def:      {nome:'DEF +10%',         nv:5,ap:3,passiva:{def:.10,defm:.10},desc:'Passiva: DEF e DEF.M.'},
  vontade:    {nome:'Vontade de Ferro', nv:7,ap:6,passiva:{vontade:1},desc:'Passiva: uma vez por luta, aguenta um golpe mortal com 1 HP.'},
  // Sábio
  cura:       {nome:'Cura',             nv:1,ap:3,mp:10,alvo:'eu',  cura:.35,desc:'Recupera 35% do HP.'},
  esuna:      {nome:'Esuna',            nv:2,ap:2,mp:6, alvo:'eu',  limpa:true,desc:'Cura os estados ruins.'},
  p_regen:    {nome:'Cura +20%',        nv:3,ap:2,passiva:{curaMais:.20},desc:'Passiva: curas mais fortes.'},
  pressa:     {nome:'Pressa',           nv:5,ap:4,mp:12,alvo:'eu',  est:['pressa',4],desc:'Barra de turno 50% mais rápida por 4 turnos.'},
  regen:      {nome:'Regen',            nv:6,ap:4,mp:10,alvo:'eu',  est:['regen',5],desc:'Recupera 6% do HP por turno.'},
  // Sombra
  veneno_h:   {nome:'Lâmina Venenosa',  nv:1,ap:3,mp:6, alvo:'inim',t:'f',el:null,poder:[24],q:1,estInim:['veneno',4,.8],desc:'Corte que envenena (80%).'},
  p_esq:      {nome:'Esquiva +8%',      nv:2,ap:3,passiva:{esq:8},desc:'Passiva.'},
  cegar:      {nome:'Pó Cegante',       nv:3,ap:3,mp:6, alvo:'inim',estInim:['cego',3,.7],desc:'Cega o inimigo (70%).'},
  roubar:     {nome:'Roubar',           nv:5,ap:3,mp:0, alvo:'inim',rouba:true,desc:'Tenta roubar um item ou gil.'},
  p_vel:      {nome:'VEL +3',           nv:6,ap:4,passiva:{vel:3},desc:'Passiva.'},
  // Quebrador
  impacto:    {nome:'Impacto',          nv:1,ap:3,mp:6, alvo:'inim',t:'f',el:null,poder:[26],q:3,desc:'Pouco dano, enche muito a barra de Quebra.'},
  analise:    {nome:'Análise',          nv:2,ap:1,mp:0, alvo:'inim',analise:true,desc:'Mostra as fraquezas do inimigo.'},
  p_quebra:   {nome:'Quebra +30%',      nv:3,ap:4,passiva:{quebra:.30},desc:'Passiva: enche a barra de Quebra mais rápido.'},
  esmagar:    {nome:'Esmagar',          nv:5,ap:5,mp:14,alvo:'inim',t:'f',el:'terra',poder:[60],q:2,desc:'Golpe de terra pesado.'},
  p_atk2:     {nome:'ATQ +5%, ATQ.M +5%',nv:6,ap:3,passiva:{atk:.05,atkm:.05},desc:'Passiva.'},
};
// golpes das habilidades entram na tabela de golpes do combate (tipo, elemento, quebra)
if(typeof GOLPES_JUX==='object')for(const k in HABS){const h=HABS[k];if(h.t)GOLPES_JUX['hab_'+k]={t:h.t,el:h.el,q:h.q||1,perfura:h.perfura||0};}
function estadoEcos(){if(!JOGO.ecos)JOGO.ecos={equip:null,tem:[],pe:{},equipadas:[]};return JOGO.ecos;}   // o jogador comeca SEM Ecos: cada um se conquista vencendo a prova dele   // o Fenrir (lamina) vem da Prova do Lobo na trilha
const peDe=id=>estadoEcos().pe[id]||0;
const nivelDoEco=id=>nivelEco(peDe(id));
function aprendidas(){const E=estadoEcos(),r=[];for(const id of E.tem){const e=ECOS[id],nv=nivelDoEco(id);for(const h of e.habs)if(HABS[h].nv<=nv)r.push(h);}return r;}
// as passivas aprendidas do Eco EQUIPADO ficam sempre ligadas, de graca (sem gastar AP); as dos outros Ecos custam AP
// ECOS EM QUALQUER PERSONAGEM (FICHA_ECOS_GRUPO.md, 2026-11-20): cada personagem tem a sua vaga {equip, equipadas}.
// A do Jux continua sendo o proprio JOGO.ecos (equip/equipadas: saves antigos seguem iguais); a dos companheiros fica em JOGO.ecos.grupo[q].
// O MESMO Eco (e a mesma habilidade de Eco) nao fica em dois personagens ao mesmo tempo.
function vagaEco(q){const E=estadoEcos();if(!q||q==='jux')return E;E.grupo=E.grupo||{};return E.grupo[q]=E.grupo[q]||{equip:null,equipadas:[]};}
const timeEco=()=>['jux',...((typeof JOGO==='object'&&JOGO.bino&&JOGO.bino.ativo)?['bino']:[])];
const nivelQuem=q=>q==='bino'?((JOGO.bino||{}).nivel||1):JOGO.nivel;
const NOME_QUEM={jux:'Jux',bino:'Bino'};
const donoEco=id=>timeEco().find(q=>vagaEco(q).equip===id)||null;
const donoHab=h=>timeEco().find(q=>vagaEco(q).equipadas.includes(h))||null;
const ecoEmCampo=()=>{for(const q of timeEco()){const e=vagaEco(q).equip;if(e)return e;}return null;};
// poe o Eco id no personagem q; se estava com outro, sai dele. Devolve quem perdeu (ou null)
function equipaEco(id,q){q=q||'jux';const de=donoEco(id);if(de&&de!==q)vagaEco(de).equip=null;vagaEco(q).equip=id;return de&&de!==q?de:null;}
const passivaDoEco=(h,q)=>{const S=vagaEco(q),e=ECOS[S.equip];return !!(e&&HABS[h]&&HABS[h].passiva&&e.habs.includes(h)&&HABS[h].nv<=nivelDoEco(S.equip));};
const apUsado=q=>vagaEco(q).equipadas.reduce((s,h)=>s+(HABS[h]&&!passivaDoEco(h,q)?HABS[h].ap:0),0);
function trocaHab(h,q){q=q||'jux';const S=vagaEco(q),i=S.equipadas.indexOf(h);if(passivaDoEco(h,q))return 'auto';
  if(i>=0){S.equipadas.splice(i,1);return 'tirou';}
  if(!aprendidas().includes(h))return 'nao_aprendeu';if(apUsado(q)+HABS[h].ap>limiteAP(nivelQuem(q)))return 'sem_ap';
  const de=donoHab(h);if(de&&de!==q){const o=vagaEco(de).equipadas;o.splice(o.indexOf(h),1);S.equipadas.push(h);trocaHab.de=de;return 'moveu';}
  S.equipadas.push(h);return 'pos';}
// bônus (Eco equipado + passivas equipadas): % (atk, def...) ou somado (crit, esq, vel) ou especial (contra, vontade...)
function bonusEcos(q){q=q||'jux';const E=vagaEco(q),pct={},soma={},esp={},flat={};
  const add=b=>{for(const k in b){if(['crit','esq','vel'].includes(k))soma[k]=(soma[k]||0)+b[k];else if(['contra','vontade','curaMais','quebra','sede'].includes(k))esp[k]=(esp[k]||0)+b[k];else pct[k]=(pct[k]||0)+b[k];}};
  if(E.equip&&ECOS[E.equip])add(ECOS[E.equip].bonus);
  for(const h of E.equipadas)if(HABS[h]&&HABS[h].passiva&&!passivaDoEco(h,q))add(HABS[h].passiva);
  if(E.equip&&ECOS[E.equip])for(const h of ECOS[E.equip].habs)if(passivaDoEco(h,q))add(HABS[h].passiva);
  // ganho por nivel do Eco equipado: HP/MP/ATQ/DEF... somados (antes da %), +1% de crit a cada 5 niveis; MARCO a cada 10 niveis
  if(E.equip&&ECOS[E.equip]){const L=nivelDoEco(E.equip),pn=ECOS[E.equip].porNivel||{};
    for(const k of ['hp','mp','atk','def','atkm','defm'])if(pn[k])flat[k]=(flat[k]||0)+pn[k]*(L-1);
    if(pn.crit5)soma.crit=(soma.crit||0)+pn.crit5*Math.floor((L-1)/5);
    const m=Math.floor(L/10);if(m){pct.hp=(pct.hp||0)+.02*m;flat.def=(flat.def||0)+2*m;soma.vel=(soma.vel||0)+Math.floor(m/3);}}
  return {pct,soma,esp,flat};}
// texto do que o Eco da por nivel e a cada marco (menu e aviso de subida)
function textoPorNivel(id){const pn=(ECOS[id]||{}).porNivel||{},NM={hp:'HP',mp:'MP',atk:'ATQ',def:'DEF',atkm:'ATQ.M',defm:'DEF.M'},r=[];
  for(const k in NM)if(pn[k])r.push('+'+pn[k]+' '+NM[k]);return r.join(', ')+(pn.crit5?' · +'+pn.crit5+'% crítico a cada 5':'');}
const TEXTO_MARCO='MARCO (10, 20, 30…): HP +2%, DEF +2 e, a cada 30, VEL +1';
// o que o Eco ganhou ao subir do nivel a ate o nivel b (a lista para o aviso)
function ganhoDeNiveis(id,a,b){const pn=(ECOS[id]||{}).porNivel||{},n=b-a,NM={hp:'HP',mp:'MP',atk:'ATQ',def:'DEF',atkm:'ATQ.M',defm:'DEF.M'},r=[];
  for(const k in NM)if(pn[k])r.push('+'+pn[k]*n+' '+NM[k]);
  const c=pn.crit5?Math.floor((b-1)/5)-Math.floor((a-1)/5):0;if(c>0)r.push('+'+c+'% crítico');
  const marcos=Math.floor(b/10)-Math.floor(a/10);
  return {txt:r.join(', '),marco:marcos>0?'MARCO '+Math.floor(b/10)*10+': HP +2%, DEF +2'+(Math.floor(b/30)>Math.floor(a/30)?', VEL +1':''):''};}
// PE: cada Eco equipado no time ganha (o do Jux e o do Bino). Devolve o primeiro (tela de vitoria) com os outros em .outros
function ganhaPE(n){const E=estadoEcos(),res=[];
  for(const q of timeEco()){const id=vagaEco(q).equip;if(!id||res.some(r=>r.eco===id))continue;
    const antes=nivelDoEco(id);E.pe[id]=peDe(id)+n;const depois=nivelDoEco(id);
    const novas=depois>antes?ECOS[id].habs.filter(h=>HABS[h].nv>antes&&HABS[h].nv<=depois):[];
    res.push({eco:id,quem:q,pe:n,antes,depois,novas,ganho:depois>antes?ganhoDeNiveis(id,antes,depois):null});}
  if(!res.length)return null;res[0].outros=res.slice(1);return res[0];}
