/* ============ Regras de combate (SISTEMA_RPG.md §2-§3) — usadas pela batalha (index.html) ============
   Funções puras: elementos, tipos de inimigo, fórmula de dano, crítico, esquiva e barra de Quebra. */
'use strict';
const ELEMENTOS={gelo:'Gelo',vento:'Vento',terra:'Terra',raio:'Raio',agua:'Água',fogo:'Fogo',luz:'Luz',trevas:'Trevas'};
// roda: cada um é forte contra o próximo; Luz e Trevas fortes um contra o outro
const RODA=['gelo','vento','terra','raio','agua','fogo'];
function forteContra(el){const i=RODA.indexOf(el);if(i>=0)return RODA[(i+1)%RODA.length];return el==='luz'?'trevas':el==='trevas'?'luz':null;}

// o que cada golpe do Jux é: tipo (f = físico, m = mágico, h = híbrido), elemento e quanto enche a barra de Quebra
const GOLPES_JUX={
  attack: {t:'f',el:null,  q:1},
  blade:  {t:'m',el:'gelo',q:1.2},
  storm:  {t:'m',el:'gelo',q:.8},
  danca:  {t:'f',el:'gelo',q:1.4},
  lanca:  {t:'h',el:'gelo',q:1.2},
  nevasca:{t:'m',el:'gelo',q:.6},
  prisao:{t:'m',el:'gelo',q:1.2},
  espelho_reflexo:{t:'m',el:'gelo',q:1.5},
  res3:{t:'m',el:'gelo',q:2},
  estalactites:{t:'m',el:'gelo',q:.6},
  kelvin:{t:'f',el:'gelo',q:2.5,perfura:.5},   // ignora metade da DEF
  final:{t:'m',el:'gelo',q:3},
  res:    {t:'h',el:'gelo',q:1.5},
  zero:   {t:'h',el:'gelo',q:2},
};
// tipos de inimigo: atributos por nível, elemento, reação a cada elemento e a físico/mágico
// reação: 1.5 fraco, .5 resiste, 0 imune, -1 absorve (faltando = 1)
const TIPOS_INIMIGO={
  ignarok:{nome:'Ignarok',el:'fogo',reacao:{gelo:1.5,agua:1.5,fogo:-1},fisico:1,magico:1,quebra:100,
    atk:n=>26+1.7*(n-1),atkm:n=>24+1.7*(n-1),def:n=>14+1.25*(n-1),defm:n=>12+1.2*(n-1),
    // itens que caem (SISTEMA_RPG.md §7): [item, chance, raro]. Raro fica mais fácil com SOR.
    drops:[['pocao',.35],['minerio',.25],['brasa',.20],['eter',.07,1],['cristal',.08,1],['fenix',.02,1]]},
  // ---- primeira região (LORE.md: "Primeiros inimigos"). hp/exp/gil = fração do Ignarok do mesmo nível
  lobo:{nome:'Lobo da Geada',el:'gelo',reacao:{gelo:.5,fogo:1.5},fisico:1,magico:1,quebra:70,hp:.42,exp:.38,gil:.25,vel:1.25,
    atk:n=>22+1.6*(n-1),atkm:n=>18+1.5*(n-1),def:n=>10+1.1*(n-1),defm:n=>11+1.1*(n-1),
    golpes:[{nome:'Mordida',t:'f',poder:30,peso:5},{nome:'Uivo Gélido',t:'m',el:'gelo',poder:24,peso:2,est:['lento',2,.35]},{nome:'Investida da Matilha',t:'f',poder:46,peso:2,est:['atordoado',1,.15]}],
    drops:[['pocao',.25],['pelagem',.45],['minerio',.12],['cristal',.10,1],['colirio',.05,1]]},
  bolota:{nome:'Bolota',el:'gelo',reacao:{gelo:.5,fogo:1.6,raio:1.2},fisico:.6,magico:1.3,quebra:60,hp:.36,exp:.32,gil:.2,vel:.8,
    atk:n=>18+1.4*(n-1),atkm:n=>20+1.5*(n-1),def:n=>14+1.2*(n-1),defm:n=>8+1*(n-1),
    golpes:[{nome:'Pancada Fofa',t:'f',poder:20,peso:4},{nome:'Espirro de Neve',t:'m',el:'gelo',poder:26,peso:3,est:['cego',2,.35]}],
    drops:[['pocao',.3],['geleia',.45],['eter',.05,1],['cristal',.08,1]]},
  // Mini-chefe da Trilha (CHEFE_BOLOTAO.md). Sem fraqueza elemental: o jogador ainda NAO tem Ecos (so o Fenrir, na Garganta); a luta se resolve com Quebra e dano bruto
  bolotao:{nome:'Bolotão, o Rei da Neve',el:'gelo',reacao:{gelo:.5},fisico:1,magico:1,quebra:260,hp:.36,exp:.32,gil:.2,vel:.8,
    atk:n=>20+1.5*(n-1),atkm:n=>20+1.5*(n-1),def:n=>12+1.1*(n-1),defm:n=>8+1*(n-1),
    golpes:[{nome:'Pancada Fofa',t:'f',poder:34,peso:4},{nome:'Espirro de Neve',t:'m',el:'gelo',poder:30,peso:3,est:['cego',2,.35]}],
    drops:[['pocao',.6],['geleia',.8],['eter',.3],['cristal',.4]]},
  // ---- Capitulo 1 (HISTORIA_CAP1.md): a Ordem do Eclipse chega na trilha
  acolito:{nome:'Acólito do Eclipse',el:'trevas',reacao:{luz:1.6,gelo:1.1,trevas:.5},fisico:1.1,magico:.8,quebra:90,hp:.6,exp:.9,gil:.7,vel:1.1,
    atk:n=>20+1.5*(n-1),atkm:n=>30+2*(n-1),def:n=>8+.9*(n-1),defm:n=>16+1.3*(n-1),
    golpes:[{nome:'Esfera de Trevas',t:'m',el:'trevas',poder:34,peso:5,est:['cego',2,.3]},{nome:'Drenar Cristal',t:'m',el:'trevas',poder:46,peso:2,est:['silencio',2,.35]},{nome:'Toque do Vazio',t:'m',el:'trevas',poder:28,peso:2,est:['lento',2,.4]}],
    drops:[['eter',.3],['cristal',.15,1],['hipocao',.08,1]]},
  // ---- Capitulo 2, Parte B (FICHA_CAP2_ATAQUE.md): moradores consumidos pela sombra. Vencer NAO mata: desmaiam e voltam a ser gente.
  // Golpes em comum: Lamento (abaixa o ataque = Medo) e Abraco da Sombra (perde a vez). Cada uma tem o golpe dela (especial no index.html).
  sombra_oskar:{nome:'Sombra do Oskar',el:'trevas',reacao:{luz:1.6,gelo:1.1,trevas:.5},fisico:1,magico:1,quebra:200,hp:.8,exp:1.2,gil:0,vel:1.3,imuneEst:['sono'],
    atk:n=>20+1.6*(n-1),atkm:n=>26+1.8*(n-1),def:n=>10+1*(n-1),defm:n=>12+1.1*(n-1),
    golpes:[{nome:'Lamento',t:'m',el:'trevas',poder:30,peso:4,est:['medo',2,.45]},{nome:'Abraço da Sombra',t:'f',poder:34,peso:2,est:['atordoado',1,.3]}],
    drops:[]},
  sombra_ingrid:{nome:'Sombra da Ingrid',el:'trevas',reacao:{luz:1.6,gelo:1.1,trevas:.5},fisico:1,magico:1,quebra:180,hp:.75,exp:1.2,gil:0,vel:1.3,imuneEst:['sono'],
    atk:n=>18+1.5*(n-1),atkm:n=>28+1.9*(n-1),def:n=>9+.9*(n-1),defm:n=>13+1.2*(n-1),
    golpes:[{nome:'Lamento',t:'m',el:'trevas',poder:30,peso:3,est:['medo',2,.45]},{nome:'Sopa Amarga',t:'m',el:'trevas',poder:30,peso:4,est:['veneno',3,.6]}],
    drops:[]},
  sombra_borin:{nome:'Sombra do Borin',el:'trevas',reacao:{luz:1.6,gelo:1.1,trevas:.5},fisico:1,magico:1.1,quebra:240,hp:1,exp:1.4,gil:0,vel:1.15,imuneEst:['sono','atordoado'],
    atk:n=>24+1.9*(n-1),atkm:n=>20+1.4*(n-1),def:n=>14+1.2*(n-1),defm:n=>9+.9*(n-1),
    golpes:[{nome:'Lamento',t:'m',el:'trevas',poder:28,peso:2,est:['medo',2,.45]},{nome:'Abraço da Sombra',t:'f',poder:38,peso:3,est:['atordoado',1,.3]}],
    drops:[]},
  // ---- Capitulo 3, Parte A (FICHA_CAP3_RIO.md): os bichos do RIO (lutas no barco). Regras especiais no index.html (rioEspecial):
  // a Lontra rouba um ITEM e foge na vez seguinte (vencendo antes, devolve); o Caranguejo fecha a CARAPACA (quase nao leva dano)
  // ate a barra de Quebra encher; quebrado ele leva o dobro.
  agua_viva:{nome:'Água-viva do Degelo',el:'agua',reacao:{terra:1.5,raio:.5,fogo:1.2},fisico:.9,magico:1,quebra:90,hp:.5,exp:.6,gil:.5,vel:1.1,imuneEst:['veneno'],
    atk:n=>14+1.2*(n-1),atkm:n=>22+1.8*(n-1),def:n=>8+.8*(n-1),defm:n=>12+1.1*(n-1),
    golpes:[{nome:'Choque',t:'m',el:'raio',poder:30,peso:4,est:['atordoado',1,.2]},{nome:'Clarão',t:'m',el:'luz',poder:16,peso:3,est:['cego',2,.6]}],
    drops:[['eter',.25],['cristal',.12,1]]},
  piranha:{nome:'Piranha de Geada',el:'gelo',reacao:{gelo:.5,fogo:1.4,raio:1.4,terra:1.3},fisico:1,magico:1,quebra:40,hp:.24,exp:.26,gil:.25,vel:1.55,
    atk:n=>18+1.5*(n-1),atkm:n=>10+.8*(n-1),def:n=>7+.7*(n-1),defm:n=>7+.7*(n-1),
    golpes:[{nome:'Mordida de Gelo',t:'f',el:'gelo',poder:21,peso:1}],
    drops:[['pocao',.18]]},
  lontra:{nome:'Lontra Ladra',el:null,reacao:{gelo:1.4,terra:1.2},fisico:1,magico:1,quebra:60,hp:.42,exp:.5,gil:1.6,vel:1.7,
    atk:n=>16+1.3*(n-1),atkm:n=>10+.8*(n-1),def:n=>8+.8*(n-1),defm:n=>8+.8*(n-1),
    golpes:[{nome:'Furto Molhado',rouba:'item',peso:1}],
    drops:[['pocao',.35],['hipocao',.12,1]]},
  caranguejo:{nome:'Caranguejo-Pedra',el:'terra',reacao:{gelo:.9,raio:1.3,terra:.6},fisico:1,magico:1,quebra:55,hp:.9,exp:.8,gil:.7,vel:.85,imuneEst:['veneno'],
    atk:n=>22+1.8*(n-1),atkm:n=>8+.6*(n-1),def:n=>20+1.6*(n-1),defm:n=>14+1.2*(n-1),
    golpes:[{nome:'Pinçada',t:'f',poder:40,peso:1,est:['atordoado',1,.15]}],
    drops:[['minerio',.4],['cristal',.15,1]]},
  // ---- trecho 3 do rio (aguas quentes): bichos de FOGO e vapor; o gelo do Jux brilha aqui. Regras especiais no index.html (rioEspecial):
  // o Sapo cospe agua fervendo em TODOS a cada 3 vezes; o Caramujo fecha a casca (como o caranguejo); o Morcego rouba MP.
  enguia:{nome:'Enguia de Brasa',el:'fogo',reacao:{gelo:1.6,agua:1.4,fogo:.4},fisico:1,magico:1,quebra:70,hp:.5,exp:.65,gil:.5,vel:1.4,imuneEst:['veneno'],
    atk:n=>22+1.7*(n-1),atkm:n=>16+1.3*(n-1),def:n=>9+.9*(n-1),defm:n=>10+1*(n-1),
    golpes:[{nome:'Chicotada de Brasa',t:'f',el:'fogo',poder:28,peso:1,est:['queimadura',3,.45]}],
    drops:[['brasa',.4],['pocao',.2]]},
  sapo_fervente:{nome:'Sapo-Fervente',el:'fogo',reacao:{gelo:1.6,agua:1.2,fogo:.4},fisico:.9,magico:1,quebra:80,hp:.7,exp:.7,gil:.6,vel:.95,
    atk:n=>16+1.3*(n-1),atkm:n=>22+1.7*(n-1),def:n=>11+1*(n-1),defm:n=>12+1.1*(n-1),
    golpes:[{nome:'Bolha Fervente',t:'m',el:'agua',poder:28,peso:1,est:['queimadura',2,.25]}],
    drops:[['hipocao',.18],['remedio',.12]]},
  caramujo:{nome:'Caramujo de Basalto',el:'terra',reacao:{raio:1.4,gelo:1.3,terra:.6,fogo:.5},fisico:1,magico:1,quebra:55,hp:.9,exp:.8,gil:.7,vel:.8,imuneEst:['veneno'],
    atk:n=>18+1.5*(n-1),atkm:n=>18+1.4*(n-1),def:n=>20+1.6*(n-1),defm:n=>14+1.2*(n-1),
    golpes:[{nome:'Jato de Vapor',t:'m',el:'fogo',poder:26,peso:1,est:['lento',3,.5]}],
    drops:[['minerio',.4],['brasa',.25]]},
  morcego:{nome:'Morcego de Vapor',el:'trevas',reacao:{gelo:1.5,luz:1.5,trevas:.5},fisico:1,magico:1,quebra:50,hp:.36,exp:.5,gil:.5,vel:1.7,
    atk:n=>18+1.4*(n-1),atkm:n=>16+1.3*(n-1),def:n=>8+.8*(n-1),defm:n=>9+.9*(n-1),
    golpes:[{nome:'Rasante',t:'f',poder:24,peso:3},{nome:'Sugar Energia',t:'m',el:'trevas',poder:14,peso:2,sugaMp:true}],
    drops:[['eter',.3]]},
  // ---- Capitulo 3, Parte A: a Serpente do Degelo, chefe do rio (FICHA_CAP3_RIO.md). Fase 1: as placas de gelo resistem ao gelo;
  // abaixo da metade o gelo DERRETE na agua quente (serpente_f2): mais rapida e forte, mas o gelo do Jux passa a doer. Onda (todos) e a troca de fase ficam no index.html.
  serpente:{nome:'Serpente do Degelo',el:'agua',reacao:{gelo:.5,agua:.3,fogo:1.4,terra:1.4},fisico:1,magico:1,quebra:380,hp:2.2,exp:4,gil:2,vel:1.1,imuneEst:['sono','atordoado'],
    atk:n=>29+2*(n-1),atkm:n=>28+2*(n-1),def:n=>18+1.5*(n-1),defm:n=>15+1.3*(n-1),
    golpes:[{nome:'Bote',t:'f',poder:44,peso:5},{nome:'Constrição',t:'f',poder:30,peso:3,est:['atordoado',1,.5]}],
    drops:[['hipocao',1],['eter',.6],['fenix',.3,1]]},
  serpente_f2:{nome:'Serpente do Degelo',el:'agua',reacao:{gelo:1.5,agua:.3,fogo:1.4,terra:1.4},fisico:1.2,magico:1.2,quebra:300,hp:2.2,exp:4,gil:2,vel:1.35,imuneEst:['sono','atordoado'],
    atk:n=>29+2*(n-1),atkm:n=>28+2*(n-1),def:n=>14+1.2*(n-1),defm:n=>12+1*(n-1),
    golpes:[{nome:'Bote',t:'f',poder:46,peso:5},{nome:'Constrição',t:'f',poder:32,peso:3,est:['atordoado',1,.5]}],
    drops:[['hipocao',1],['eter',.6],['fenix',.3,1]]},
  // chefe da area (caverna): o lobo que devora o sol, acorrentado pelo Eclipse
  skoll:{nome:'Skoll, o Alfa',el:'gelo',reacao:{gelo:.5,fogo:1.5,luz:1.4},fisico:1,magico:1,quebra:220,hp:3.2,exp:8,gil:5,vel:1.2,
    atk:n=>34+2.1*(n-1),atkm:n=>30+1.9*(n-1),def:n=>16+1.4*(n-1),defm:n=>16+1.4*(n-1),
    golpes:[{nome:'Mordida Sombria',t:'f',poder:46,peso:4},{nome:'Investida Acorrentada',t:'f',poder:66,peso:2,est:['atordoado',1,.2]},{nome:'Uivo do Eclipse',t:'m',el:'trevas',poder:44,peso:2,est:['silencio',2,.35]}],
    drops:[['pelagem_alfa',1],['hipocao',.5],['cristal',.4,1]]},
  // Prova do Fenrir (trilha): o espirito do lobo testa o heroi. Forte, mas justo: mais HP que um lobo comum
  // ---- Capitulo 2, Parte C (FICHA_CAP2_IGNAROK.md): o Ignarok chefe, todo desenhado. Fase 2 (abaixo de metade) troca o tipo para
  // ignarok_f2: o coracao exposto (mais rapido e forte, mas leva mais dano). Erupcao (todos) e a troca de fase ficam no index.html.
  ignarok_chefe:{nome:'Ignarok',el:'fogo',reacao:{gelo:1.5,agua:1.5,fogo:-1},fisico:1,magico:1,quebra:400,hp:2.2,exp:4,gil:2,vel:1.15,imuneEst:['sono','atordoado'],
    atk:n=>30+2.1*(n-1),atkm:n=>28+2*(n-1),def:n=>18+1.5*(n-1),defm:n=>14+1.3*(n-1),
    golpes:[{nome:'Punho de Magma',t:'f',el:'fogo',poder:48,peso:5},{nome:'Derreter',t:'m',el:'fogo',poder:30,peso:3}],
    drops:[['brasa',1],['hipocao',.6],['fenix',.3,1]]},
  ignarok_f2:{nome:'Ignarok',el:'fogo',reacao:{gelo:1.9,agua:1.8,fogo:-1},fisico:1.25,magico:1.25,quebra:300,hp:2.2,exp:4,gil:2,vel:1.4,imuneEst:['sono','atordoado'],
    atk:n=>30+2.1*(n-1),atkm:n=>28+2*(n-1),def:n=>14+1.2*(n-1),defm:n=>11+1*(n-1),
    golpes:[{nome:'Punho de Magma',t:'f',el:'fogo',poder:50,peso:5},{nome:'Derreter',t:'m',el:'fogo',poder:30,peso:3}],
    drops:[['brasa',1],['hipocao',.6],['fenix',.3,1]]},
  fenrir_prova:{nome:'Espírito do Fenrir',el:'gelo',reacao:{gelo:.4,fogo:1.5,raio:1.2},fisico:1,magico:1,quebra:160,hp:2.4,exp:4,gil:2,vel:1.2,
    atk:n=>40+2.4*(n-1),atkm:n=>34+2.1*(n-1),def:n=>18+1.6*(n-1),defm:n=>18+1.6*(n-1),
    // os MESMOS golpes do Eco da Lamina (ecos.js): Mordida Glacial, Garra Perfurante, Uivo da Lua, Matilha Fantasma e, no fim, Ragnarok
    golpes:[{nome:'Mordida Glacial',t:'f',poder:30,peso:4,fen:'mordida'},{nome:'Garra Perfurante',t:'f',poder:72,peso:3,fen:'garra',est:['atordoado',1,.2]},
      {nome:'Uivo da Lua',t:'eu',poder:0,peso:2,fen:'uivo'},{nome:'Matilha Fantasma',t:'f',el:'gelo',poder:30,peso:2,fen:'matilha'},{nome:'Ragnarök',t:'f',el:'gelo',poder:95,peso:0,fen:'ragnarok'}],
    drops:[['eter',.3],['cristal',.25,1]]},
  goblin:{nome:'Goblin Saqueador',el:null,reacao:{gelo:1.5},fisico:1,magico:1,quebra:60,hp:.4,exp:.42,gil:.6,vel:1.35,
    atk:n=>21+1.6*(n-1),atkm:n=>14+1.2*(n-1),def:n=>9+1*(n-1),defm:n=>9+1*(n-1),
    golpes:[{nome:'Facada Suja',t:'f',poder:26,peso:4,est:['veneno',3,.3]},{nome:'Pedrada',t:'f',poder:22,peso:3},{nome:'Mão Leve',rouba:true,peso:2}],
    drops:[['pocao',.3],['pao_mel',.12],['antidoto',.15],['hipocao',.06,1],['anel_goblin',.03,1]]},
  // MINI-CHEFE do Vale dos Lobos (CHEFE_PRESA_ANCIA.md): lobo anciao livre. Sopro, Uivo, Investida e a fase 2 ficam em presaEspecial() (index.html)
  presa:{nome:'Presa-Antiga, o Lobo Ancião',el:'gelo',reacao:{gelo:.5},fisico:1,magico:1,quebra:280,hp:.46,exp:.5,gil:.5,vel:1.15,
    atk:n=>28+2*(n-1),atkm:n=>20+1.4*(n-1),def:n=>15+1.4*(n-1),defm:n=>12+1.1*(n-1),
    golpes:[{nome:'Mordida Ancestral',t:'f',poder:58,peso:5,est:['lento',2,.35]},{nome:'Patada',t:'f',poder:36,peso:3}],
    drops:[['hipocao',.6],['pelagem',.9],['eter',.3]]},
  // MINI-CHEFE da Garganta Gelada (CHEFE_CAPITAO.md): goblin enorme com a armadura do Halvard. Apito e Couraça ficam em capitaoEspecial() (index.html)
  capitao:{nome:'Capitão Dente-de-Ferro',el:null,reacao:{gelo:1.5},fisico:1,magico:1,quebra:260,hp:.4,exp:.42,gil:.6,vel:1.1,
    atk:n=>26+1.9*(n-1),atkm:n=>14+1.2*(n-1),def:n=>14+1.4*(n-1),defm:n=>10+1*(n-1),
    golpes:[{nome:'Machadada do Halvard',t:'f',poder:60,peso:5,est:['atordoado',1,.25]},{nome:'Saque Sujo',rouba:2.2,cura:.06,peso:3}],
    drops:[['hipocao',.5],['antidoto',.3],['pocao',.6]]},
};
// sorteia os itens de cada inimigo vencido (no máx. 2 por inimigo); sor = SOR do Jux
function sorteiaDrops(tipos,sor){const r={},bonus=1+Math.max(0,(sor||10)-10)/40;
  for(const tp of tipos){const T=TIPOS_INIMIGO[tp];if(!T||!T.drops)continue;let n=0;
    for(const [it,ch,raro] of T.drops){if(n>=2)break;if(Math.random()<ch*(raro?bonus:1)){r[it]=(r[it]||0)+1;n++;}}}
  return Object.entries(r).map(([id,n])=>({id,n,raro:TIPOS_INIMIGO[tipos[0]].drops.some(d=>d[0]===id&&d[2])}));}
const fatorF=r=>r<.5?.5*r:r<1?r*r:8/(1+Math.exp(1-r))-3;
// multiplicador do nível (mantém o equilíbrio de HP dos inimigos que o jogo já tinha) normalizado pela razão "padrão"
const multNivel=n=>1+2*(n-1)/34;
function reacao(tipo,el,t){const T=TIPOS_INIMIGO[tipo]||{};let m=el?(T.reacao&&T.reacao[el]!==undefined?T.reacao[el]:1):1;
  if(t==='f')m*=T.fisico===undefined?1:T.fisico;else if(t==='m')m*=T.magico===undefined?1:T.magico;else m*=((T.fisico||1)+(T.magico||1))/2;return m;}
// dano do Jux num inimigo. poder = número do golpe (o que já existia); st = statusJux; nv = nível do inimigo
function danoNoInimigo(poder,golpe,st,stBase,tipo,nv,quebrado){
  const T=TIPOS_INIMIGO[tipo]||TIPOS_INIMIGO.ignarok,g=GOLPES_JUX[golpe]||GOLPES_JUX.attack;
  const pf=1-(g.perfura||0),rf=st.atk/(T.def(nv)*pf),rm=st.atkm/(T.defm(nv)*pf),rf0=stBase.atk/T.def(nv),rm0=stBase.atkm/T.defm(nv);
  const ff=fatorF(rf)/fatorF(rf0),fm=fatorF(rm)/fatorF(rm0);
  const mult=g.t==='f'?ff:g.t==='m'?fm:(ff+fm)/2;
  const re=reacao(tipo,g.el,g.t);
  const crit=Math.random()*100<st.crit;
  let n=poder*multNivel(nv)*mult*Math.abs(re)*(crit?st.critd/100:1)*(quebrado?1.5:1);
  // FRAQUEZA so quando o ELEMENTO do golpe e fraco de verdade (>= 1,25); antes qualquer 1,1 (ex.: fisico 1,1 do Acolito) marcava "FRAQUEZA!" em todo golpe
  const rel=g.el&&T.reacao&&T.reacao[g.el]!==undefined?T.reacao[g.el]:1,fraco=rel>=1.25;
  return {n:Math.max(1,Math.round(n)),fraco,resiste:re>0&&re<1,imune:re===0,absorve:re<0,crit,quebra:g.q*(fraco?3:re>0&&re<1?.5:re<=0?0:1)};
}
// dano de um inimigo no Jux: base = número do golpe; tipo do golpe f/m; el = elemento
function danoNoJux(base,t,el,st,stBase,tipo,nv){
  const T=TIPOS_INIMIGO[tipo]||TIPOS_INIMIGO.ignarok;
  const r=t==='m'?T.atkm(nv)/st.defm:T.atk(nv)/st.def,r0=t==='m'?T.atkm(nv)/stBase.defm:T.atk(nv)/stBase.def;
  const esquivou=t==='f'&&Math.random()*100<st.esq;
  return {n:esquivou?0:Math.max(1,Math.round(base*fatorF(r)/fatorF(r0))),esquivou};
}

/* ---------- ESTADOS (SISTEMA_RPG.md §4) ----------
   alvo.est = {nome: turnos}. Cada turno do alvo: veneno tira vida, regen cura, e os contadores descem.
   atordoado / sono: perde o turno. cego: 50% de errar golpe físico. silencio: sem magia.
   lento / pressa: barra de turno mais devagar / rápida. medo / bravura / fe: mexem no dano. (Sem estados elementais: congelado, queimadura etc. saíram; o elemento só dá vantagem/fraqueza de dano.) */
const ESTADOS={
  veneno:   {nome:'Veneno',    cor:'#b07cff',ruim:true, tick:-.08},
  atordoado:{nome:'Atordoado', cor:'#ffe27a',ruim:true, perde:true},
  sono:     {nome:'Sono',      cor:'#a9b8ff',ruim:true, perde:true,acordaComDano:true},
  cego:     {nome:'Cego',      cor:'#8a8a8a',ruim:true, erra:.5},
  silencio: {nome:'Silêncio',  cor:'#c0c0ff',ruim:true, semMagia:true},
  lento:    {nome:'Lento',     cor:'#7fa8d6',ruim:true, vel:.5},
  medo:     {nome:'Medo',      cor:'#9a6aa8',ruim:true, dano:.7},
  pressa:   {nome:'Pressa',    cor:'#7dffa8',ruim:false,vel:1.5},
  bravura:  {nome:'Bravura',   cor:'#ff9a9a',ruim:false,dano:1.25},
  aurora:   {nome:'Aurora',    cor:'#7dffc8',ruim:false,dano:1.25},
  regen:    {nome:'Regen',     cor:'#7dffa8',ruim:false,tick:.06},
  muralha:  {nome:'Muralha',   cor:'#7fb8ff',ruim:false,recebido:.7},
  fraqueza: {nome:'Fraqueza',  cor:'#c06aff',ruim:true, recebido:1.3},
  queimadura:{nome:'Queimadura',cor:'#ff8a3c',ruim:true, tick:-.07},   // bichos das aguas quentes (Cap. 3): como o veneno, com chamas   // Tambor do Medo (Sombra do Oskar): recebe +30% de dano
};
// imunidades por tipo de inimigo (chefes costumam ser imunes a atordoar e sono)
function poeEstado(alvo,nome,turnos,chance,tipoInim){
  if(chance!==undefined&&Math.random()>chance)return false;
  const T=tipoInim&&TIPOS_INIMIGO[tipoInim];if(T&&T.imuneEst&&T.imuneEst.includes(nome))return false;
  alvo.est=alvo.est||{};alvo.est[nome]=Math.max(alvo.est[nome]||0,turnos);return true;}
const temEst=(alvo,n)=>!!(alvo.est&&alvo.est[n]>0);
function multDanoEst(alvo){let m=1;for(const k in alvo.est||{})if(alvo.est[k]>0&&ESTADOS[k]&&ESTADOS[k].dano)m*=ESTADOS[k].dano;return m;}
function multRecebidoEst(alvo){let m=1;for(const k in alvo.est||{})if(alvo.est[k]>0&&ESTADOS[k]&&ESTADOS[k].recebido)m*=ESTADOS[k].recebido;return m;}
function multVelEst(alvo){let m=1;for(const k in alvo.est||{})if(alvo.est[k]>0&&ESTADOS[k]&&ESTADOS[k].vel)m*=ESTADOS[k].vel;return m;}
// começo do turno do alvo: devolve {vida: +/-, perde: nome do estado que faz perder o turno ou null}
function tickEstados(alvo,max){const r={vida:0,perde:null};
  for(const k in alvo.est||{}){if(!(alvo.est[k]>0))continue;const E=ESTADOS[k];if(!E)continue;
    if(E.tick)r.vida+=Math.round(max*E.tick);
    if(E.perde&&!r.perde)r.perde=k;
    alvo.est[k]--;if(alvo.est[k]<=0)delete alvo.est[k];}
  return r;}
function limpaRuins(alvo,lista){for(const k of Object.keys(alvo.est||{}))if(ESTADOS[k]&&ESTADOS[k].ruim&&(!lista||lista.includes(k)))delete alvo.est[k];}
// estados que os golpes do Jux podem causar: [estado, turnos, chance]
const GOLPE_EST={storm:['lento',3,.4],nevasca:['cego',3,.45],danca:['atordoado',1,.25],lanca:['medo',3,.3]};
