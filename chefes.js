/* ============ MINI-CHEFES: lutas opcionais escondidas nos mapas ============
   Cada mapa tem um chefe opcional: uma presenca vermelha no chao. Conversar abre a fala e a escolha de lutar. Vencer paga EXP, gil e um
   equipamento exclusivo, e o chefe nao volta. Estado: JOGO.chefes = {id:true}; JOGO.chefePend = id (premio a entregar ao voltar ao mapa). */
const MINICHEFES = [
  {id:'bolotao', regiao:'trilha', nome:'Bolotão, o Rei da Neve', tipo:'bolotao', nv:5, hp:5, forca:1.35, exp:7, x:470, y:655, cor:'#9fd8ff',
   req:() => typeof estadoMissao === 'function' && estadoMissao('amigo_floco') === 'ativa' && typeof pistasFloco === 'function' && pistasFloco() >= 3,
   pre:[['Bolotão','MEU. LAGO.', 0],
     ['Jux','Aquilo é um chapéu de balde?'],
     ['Bino','…Aquilo está olhando para nós.'],
     ['Aurora','Uma Bolota que engoliu um boneco inteiro, Portador. É lenta, mas pesa uma carroça.'],
     ['Bolotão','NINGUÉM. DESLIZA. NO. MEU. GELO.', 0],
     ['Jux','…Eu deslizo, sim.'],
     ['Bolotão','BRUUUUF!', 0]],
   pos:[['Sr. Floco','Eu era… muito maior… e muito mais bravo. Desculpa.', 2],
     ['Jux','Tudo bem. Você só estava cuidando do lago.'],
     ['Sr. Floco','…Posso ficar aqui? Eu gosto do gelo.', 3],
     ['Jux','O lago é seu. Só não me peça para parar de patinar.']],
   rec:{exp:.35, gil:150, item:'amuleto_vida', n:1, txt:'Amuleto da Vida (o coração de gelo), 150 gil e muito EXP'}},
  {id:'capitao', regiao:'garganta', nome:'Capitão Dente-de-Ferro', tipo:'capitao', nv:7, hp:5.5, forca:1.4, exp:8, x:430, y:430, cor:'#c9e89a',
   req:() => typeof estadoMissao === 'function' && estadoMissao('machado_halvard') === 'ativa' && typeof pistasCapitao === 'function' && pistasCapitao() >= 3,
   pre:[['Capitão','ALTO! Este é o território do Capitão Dente-de-Ferro! Tributo, ou apanha!', 0],
     ['Jux','Essa cota de malha tem o nome HALVARD gravado por dentro.'],
     ['Capitão','…Nome é só nome. Eu achei, é meu.', 1],
     ['Bino','…O Halvard está vivo. Ele pediu de volta.'],
     ['Capitão','Vivo?! Então… então eu estou usando roupa de gente viva?! Isso é pior!', 1],
     ['Jux','Última chance: devolve ou a gente leva.'],
     ['Capitão','Bando! Ao ataque! …Bando? …Ótimo, estou sozinho. Tudo bem. EU É QUE SOU O BANDO!', 2]],
   pos:[['Capitão','Pode levar… Eu só queria… ser capitão de alguma coisa.', 3],
     ['Jux','Ei. Você pode ser capitão de outra coisa. Sem a roupa dos outros.'],
     ['Capitão','…Eu sei plantar nabo.', 1], ['Bino','…Nabo é bom.']],
   rec:{exp:.45, gil:240, item:'cota_malha', n:1, txt:'Cota de Malha (a do Halvard), 240 gil e muito EXP'}},
  {id:'presa', regiao:'vale', nome:'Presa-Antiga, o Lobo Ancião', tipo:'presa', nv:8, hp:5.5, forca:1.4, exp:8, x:727, y:548, cor:'#cfe6ff',
   req:() => typeof estadoMissao === 'function' && estadoMissao('carroca_tombada') === 'ativa' && typeof pistasPresa === 'function' && pistasPresa() >= 3,
   pre:[['✦','Dois olhos se acendem no escuro da toca. Um azul. O outro, branco e cego.'],
     ['Presa-Antiga','…Fraco não entra na minha toca.', 2],
     ['Aurora','Ele é livre, Portador. Não é da Ordem. Ele só protege a toca.'],
     ['Jux','Então a gente só precisa provar que não é ameaça.'],
     ['Bino','…Ou que é ameaça grande demais.'],
     ['Presa-Antiga','A corrente deles não me segurou. Vocês também não vão.', 2]],
   pos:[['Presa-Antiga','…Forte. E sem sombra.', 1],
     ['Presa-Antiga','Leve o que é do goblin. E deixe meus filhotes dormirem.', 0],
     ['Jux','Combinado. Ninguém entra na sua toca.'],
     ['✦','O lobo recua para o escuro e empurra um baú pesado para fora da toca. Junto, um dente enorme rola na neve.'],
     ['Bino','…Ele te deu um dente.'], ['Aurora','É respeito, Portador. Entre lobos, não existe presente maior.']],
   rec:{exp:.5, gil:90, item:'presa_anciao', n:1, txt:'Presa do Ancião (acessório: ATQ +8, Crítico +4%), o Baú do Capitão, 90 gil e muito EXP'}},
];
const chefesRegiao = r => MINICHEFES.filter(c => c.regiao === r);
const chefeFeito = id => !!((JOGO.chefes || {})[id]);
function pontosChefes() {for (let i = V.pontos.length - 1; i >= 0; i--) if (V.pontos[i].id.startsWith('chefe_') || V.pontos[i].id === 'floco') V.pontos.splice(i, 1);
  if (REGIAO === 'trilha' && chefeFeito('bolotao')) V.pontos.push({id: 'floco', x: 470, y: 655, r: 40});
  for (const c of chefesRegiao(REGIAO)) {if (c.id === 'capitao' && chefeFeito(c.id)) V.pontos.push({id: 'capitao', x: c.x, y: c.y, r: 46}); else if (!chefeFeito(c.id) && (!c.req || c.req())) V.pontos.push({id: 'chefe_' + c.id, x: c.x, y: c.y, r: 46});}}
// desenho no mapa: uma sombra e um brilho vermelho pulsando (o chefe escondido), com o nome quando o Jux chega perto
function desenhaChefes() {
  for (const c of chefesRegiao(REGIAO)) {
    if (c.id === 'capitao') {desenhaCapitaoMapa(c); continue;}
    if (c.id === 'bolotao' && chefeFeito(c.id)) {desenhaFlocoMapa(c); continue;}
    if (c.id === 'presa') {desenhaOlhosToca(c); continue;}
    if (chefeFeito(c.id) || (c.req && !c.req())) continue;
    const p = .6 + .4 * Math.sin(t * 3), d = Math.hypot(hero.x - c.x, hero.y - c.y);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(c.x, c.y - 10, 0, c.x, c.y - 10, 46); g.addColorStop(0, `rgba(255,70,50,${.45 * p})`); g.addColorStop(1, 'rgba(255,40,30,0)'); ctx.fillStyle = g; ctx.fillRect(c.x - 46, c.y - 56, 92, 92);
    ctx.restore();
    ctx.save(); ctx.fillStyle = 'rgba(8,10,30,.55)'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 2, 16, 5, 0, 0, 6.283); ctx.fill();
    ctx.font = 'bold 20px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(40,0,0,.9)'; ctx.strokeText('☠', c.x, c.y - 10 + Math.sin(t * 3) * 2); ctx.fillStyle = '#ff8a7a'; ctx.fillText('☠', c.x, c.y - 10 + Math.sin(t * 3) * 2);
    if (d < 90) {ctx.font = 'bold 11px "Trebuchet MS"'; ctx.strokeText(c.nome, c.x, c.y - 30); ctx.fillStyle = '#fff'; ctx.fillText(c.nome, c.x, c.y - 30);}
    ctx.restore();
  }
}
// olhos do Lobo Anciao no escuro da toca (por codigo): aparecem quando as 3 pistas foram achadas; piscam devagar.
// O olho esquerdo e branco (cego), o direito azul-gelo. Depois da vitoria, so um bafo frio de vez em quando.
function desenhaOlhosToca(c) {
  if (chefeFeito(c.id) || (c.req && !c.req())) return;
  const ox = 727, oy = 500, pisca = (t % 5.2) < .15, a = .75 + .25 * Math.sin(t * 2);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, 26); g.addColorStop(0, `rgba(140,200,255,${.25 * a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(ox - 26, oy - 26, 52, 52);
  if (!pisca) {ctx.fillStyle = `rgba(235,240,250,${a})`; ctx.fillRect(ox - 7, oy - 1, 4, 2); ctx.fillStyle = `rgba(150,220,255,${a})`; ctx.fillRect(ox + 3, oy - 1, 4, 2);}
  ctx.restore();
  if (Math.hypot(hero.x - c.x, hero.y - c.y) < 90) {ctx.save(); ctx.font = 'bold 11px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,20,.9)'; ctx.strokeText(c.nome, c.x, c.y - 66); ctx.fillStyle = '#cfe6ff'; ctx.fillText(c.nome, c.x, c.y - 66); ctx.restore();}
}
// premio entregue quando se volta ao mapa depois da vitoria
function colheChefe() {
  const id = JOGO.chefePend; if (!id) return; const c = MINICHEFES.find(q => q.id === id); JOGO.chefePend = null; if (!c) return;
  const exp = Math.round(expProx(JOGO.nivel) * c.rec.exp), subiu = typeof ganhaExpMapa === 'function' ? ganhaExpMapa(exp) : false;
  JOGO.gil += c.rec.gil; if (c.rec.item) daItem(c.rec.item, c.rec.n || 1);
  const linhas = c.pos.slice(); linhas.push(['✦', 'Recompensa: ' + c.rec.txt + '  (+' + exp + ' EXP)']);
  fala = {linhas, i: 0, letras: 0, fim: () => {if (subiu) aviso('Subiu para o nível ' + JOGO.nivel + '!', '#7dffa8'); salvaJogo();}};
  salvaJogo();
}

// o Sr. Floco (o Bolotao derrotado) no mapa: a pilha de neve com o chapeu e a cenoura, a beira do lago (tools/cut_floco_mapa.py)
const FLOM = window.JUX_FLOCO || null, FLOMI = new Image(); if (FLOM) FLOMI.src = FLOM.atlas;
function desenhaFlocoMapa(c) {
  if (!FLOM || !FLOMI.complete) return;
  const d = Math.hypot(hero.x - c.x, hero.y - c.y), bob = Math.sin(t * 2) * 1.2;
  ctx.save(); ctx.fillStyle = 'rgba(8,10,30,.4)'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 2, 20, 5, 0, 0, 6.283); ctx.fill();
  ctx.imageSmoothingEnabled = false; ctx.drawImage(FLOMI, 0, 0, FLOM.w, FLOM.h, c.x - FLOM.ancora[0], c.y - FLOM.ancora[1] + bob, FLOM.w, FLOM.h); ctx.restore();
  if (d < 100) {ctx.save(); ctx.font = 'bold 11px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeText('Sr. Floco', c.x, c.y - 48); ctx.fillStyle = '#fff'; ctx.fillText('Sr. Floco', c.x, c.y - 48); ctx.restore();}
}
// o Capitao no mapa (sprite do tools/cut_capitao_mapa.py): no covil quando a missao o revela; depois da luta vira mercador no mesmo lugar
const CAPM = window.JUX_CAPITAO || null, CAPMI = new Image(); if (CAPM) CAPMI.src = CAPM.atlas;
function desenhaCapitaoMapa(c) {
  const feito = chefeFeito(c.id); if (!feito && (c.req && !c.req())) return;
  if (!CAPM || !CAPMI.complete) return;
  const q = Math.floor(t * (feito ? 1.6 : 3)) % CAPM.n, esp = hero.x < c.x ? -1 : 1, d = Math.hypot(hero.x - c.x, hero.y - c.y);
  ctx.save(); ctx.fillStyle = 'rgba(8,10,30,.5)'; ctx.beginPath(); ctx.ellipse(c.x, c.y + 2, 20, 6, 0, 0, 6.283); ctx.fill();
  if (!feito) {ctx.globalCompositeOperation = 'lighter'; const p = .6 + .4 * Math.sin(t * 3), g = ctx.createRadialGradient(c.x, c.y - 24, 0, c.x, c.y - 24, 52); g.addColorStop(0, `rgba(255,70,50,${.28 * p})`); g.addColorStop(1, 'rgba(255,40,30,0)'); ctx.fillStyle = g; ctx.fillRect(c.x - 52, c.y - 76, 104, 104); ctx.globalCompositeOperation = 'source-over';}
  ctx.translate(c.x, c.y); ctx.scale(esp, 1); ctx.imageSmoothingEnabled = false;
  ctx.drawImage(CAPMI, q * CAPM.w, 0, CAPM.w, CAPM.h, -CAPM.ancora[0], -CAPM.ancora[1], CAPM.w, CAPM.h); ctx.restore();
  if (d < 100) {ctx.save(); ctx.font = 'bold 11px "Trebuchet MS"'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,.85)'; const nm = feito ? 'Capitão (mercador)' : c.nome; ctx.strokeText(nm, c.x, c.y - 74); ctx.fillStyle = '#fff'; ctx.fillText(nm, c.x, c.y - 74); ctx.restore();}
}
