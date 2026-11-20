/* ============ BESTIARIO: matar inimigos preenche a ficha e paga premios ============
   JOGO.besta = {tipo: abates}; JOGO.bestaMarco = {tipo: marcos ja pagos}. A ficha se revela aos poucos:
   1 abate = nome e elemento; 5 = fraquezas e resistencias; 12 = o que ele deixa cair. Marcos de abates pagam EXP, gil, item e titulo. */
const BESTIARIO = [
  {id:'lobo', nome:'Lobo da Geada', el:'Gelo', fraco:'Fogo', resiste:'Gelo', drops:'Pelagem de Lobo, Poção (raro: Cristal)', cor:'#bfe3ff',
   desc:'Caça em bando e obedece a quem o chama de noite. Os de olhos roxos já não fogem de ninguém.',
   marcos:[[10,{exp:.1,gil:60,txt:'10% de um nível e 60 gil'}],[30,{exp:.2,item:'hipocao',n:1,txt:'20% de um nível e uma Hi-Poção'}],[75,{exp:.4,item:'minerio',n:3,titulo:'Caçador de Lobos',txt:'40% de um nível, 3 Minérios e o título Caçador de Lobos'}]]},
  {id:'bolota', nome:'Bolota', el:'Gelo', fraco:'Fogo e Raio', resiste:'Gelo e golpes físicos', drops:'Geleia de Neve, Poção (raro: Éter)', cor:'#cfeaff',
   desc:'Uma bola de neve com raiva. Ninguém sabe quem a ensinou a ficar com raiva.',
   marcos:[[10,{exp:.1,gil:50,txt:'10% de um nível e 50 gil'}],[30,{exp:.2,item:'eter',n:2,txt:'20% de um nível e 2 Éteres'}],[75,{exp:.4,item:'cristal',n:2,titulo:'Derretedor',txt:'40% de um nível, 2 Cristais e o título Derretedor'}]]},
  {id:'goblin', nome:'Goblin Saqueador', el:'Nenhum', fraco:'Gelo', resiste:'Nada', drops:'Antídoto, Pão de Mel (raro: Anel do Goblin)', cor:'#b8e8a0',
   desc:'Rouba gil com a Mão Leve. Fugiu de alguém e se achou rico.',
   marcos:[[10,{exp:.1,gil:80,txt:'10% de um nível e 80 gil'}],[30,{exp:.2,item:'antidoto',n:3,txt:'20% de um nível e 3 Antídotos'}],[75,{exp:.4,gil:400,titulo:'Cobrador de Goblins',txt:'40% de um nível, 400 gil e o título Cobrador de Goblins'}]]},
  {id:'acolito', nome:'Acólito do Eclipse', el:'Trevas', fraco:'Luz', resiste:'Trevas', drops:'Éter (raro: Cristal, Hi-Poção)', cor:'#c9a6ff',
   desc:'Encapuzado do sol negro. Não sente medo. Quando cai, só o manto fica.',
   marcos:[[5,{exp:.15,gil:150,txt:'15% de um nível e 150 gil'}],[15,{exp:.3,item:'fenix',n:1,txt:'30% de um nível e uma Pena de Fênix'}],[40,{exp:.5,item:'elixir',n:1,titulo:'Quebra-Eclipse',txt:'50% de um nível, um Elixir e o título Quebra-Eclipse'}]]},
  {id:'sombra_oskar', nome:'Sombra do Oskar', el:'Trevas', fraco:'Luz', resiste:'Trevas', drops:'Nenhum', cor:'#d6a6ff',
   desc:'O velho do tambor, consumido pela Ordem. Toca o Tambor do Medo chorando. Vencido, desmaia e volta a ser gente.',marcos:[]},
  {id:'sombra_borin', nome:'Sombra do Borin', el:'Trevas', fraco:'Luz', resiste:'Trevas', drops:'Nenhum', cor:'#d6a6ff',
   desc:'O ferreiro, consumido pela Ordem. O martelo de sombra faz a terra tremer. Vencido, desmaia e volta a ser gente.',marcos:[]},
  {id:'sombra_ingrid', nome:'Sombra da Ingrid', el:'Trevas', fraco:'Luz', resiste:'Trevas', drops:'Nenhum', cor:'#d6a6ff',
   desc:'A cozinheira, consumida pela Ordem. A Sopa Amarga envenena e a Lágrima roxa cura os acólitos. Vencida, desmaia e volta a ser gente.',marcos:[]},
  {id:'capitao', nome:'Capitão Dente-de-Ferro', el:'Nenhum', fraco:'Gelo', resiste:'Nada', drops:'Hi-Poção, Antídoto, Poção', cor:'#c9e89a',
   desc:'Um goblin enorme que se declarou capitão e vestiu as coisas de um homem que achava morto. Tem mais medo da Ordem do que de qualquer herói.',
   marcos:[[1,{exp:.2,gil:300,titulo:'Cobrador do Capitão',txt:'20% de um nível, 300 gil e o título Cobrador do Capitão'}]]},
  {id:'bolotao', nome:'Bolotão, o Rei da Neve', el:'Gelo', fraco:'Barra de Quebra (sem fraqueza elemental)', resiste:'Gelo', drops:'Geleia de Neve, Poção, Éter, Cristal', cor:'#9fd8ff',
   desc:'O Sr. Floco, um boneco de neve do Tico, que uma Bolota engoliu. Defende o lago congelado de quem patina nele. Por baixo da raiva, ainda é um boneco querido.',
   marcos:[[1,{titulo:'Amigo do Floco',txt:'o título Amigo do Floco'}]]},
  {id:'presa', nome:'Presa-Antiga, o Lobo Ancião', el:'Gelo', fraco:'Barra de Quebra (o Bino enche rápido)', resiste:'Gelo', drops:'Pelagem de Lobo, Hi-Poção, Éter', cor:'#cfe6ff',
   desc:'O lobo mais velho do Vale. Cego de um olho, livre de corrente. A Ordem tentou prendê-lo e ele mordeu a corrente até partir. Só protege a toca e os filhotes.',
   marcos:[[1,{titulo:'Respeitado pelo Ancião',txt:'o título Respeitado pelo Ancião'}]]},
  {id:'skoll', nome:'Skoll, o Alfa', el:'Gelo', fraco:'Fogo e Luz', resiste:'Gelo', drops:'Pelagem do Alfa', cor:'#9fe8ff',
   desc:'O lobo preso nas correntes da Ordem. Ele não queria lutar.',
   marcos:[[1,{exp:.3,gil:500,titulo:'Libertador do Alfa',txt:'30% de um nível, 500 gil e o título Libertador do Alfa'}]]},
];
const benta = id => (JOGO.besta || {})[id] || 0;
const bestaVisivel = () => BESTIARIO.filter(b => benta(b.id) > 0);
const titulosBesta = () => Object.values(JOGO.titulos || {});
// paga os marcos que ja foram alcancados (chamado ao abrir o mapa e o menu)
function colheBestiario() {
  JOGO.bestaMarco = JOGO.bestaMarco || {}; JOGO.titulos = JOGO.titulos || {}; let algo = false;
  for (const b of BESTIARIO) {
    const feitos = JOGO.bestaMarco[b.id] || 0;
    for (let i = feitos; i < b.marcos.length; i++) {
      const [n, r] = b.marcos[i]; if (benta(b.id) < n) break;
      JOGO.bestaMarco[b.id] = i + 1; algo = true;
      const exp = typeof ganhaExpMapa === 'function' ? Math.round(expProx(JOGO.nivel) * (r.exp || 0)) : 0;
      if (exp) ganhaExpMapa(exp); if (r.gil) JOGO.gil += r.gil; if (r.item) daItem(r.item, r.n || 1); if (r.titulo) JOGO.titulos[b.id] = r.titulo;
      aviso('Bestiário: ' + b.nome + ' ' + n + (n === 1 ? ' abate' : ' abates') + (r.titulo ? ' · título ' + r.titulo : '') + '!', b.cor);
    }
  }
  if (algo) salvaJogo();
}
function desenhaBestiario(cx, cy, w, h, y) {
  colheBestiario();
  const l = BESTIARIO; if (UI.sel >= l.length) UI.sel = 0;
  const ab = l.filter(b => benta(b.id) > 0).length;
  texto('Bestiário  ' + ab + '/' + l.length + ' descobertos' + (titulosBesta().length ? '  ·  Títulos: ' + titulosBesta().join(', ') : ''), cx, cy - 4, 14, '#9fe8ff');
  // rolagem (2026-11-20): se o bestiario crescer alem da janela, a lista anda com o cursor
  const N = Math.max(3, Math.floor((y + h - 34 - (cy + 10)) / 40)), top = Math.max(0, Math.min(UI.sel - N + 2, l.length - N));
  if (l.length > N) {texto('▲', cx + 294, cy + 28, 15, top > 0 ? '#7fd6f5' : '#3a4a6a', 'center'); texto('▼', cx + 294, cy + 10 + N * 40 - 14, 15, top + N < l.length ? '#7fd6f5' : '#3a4a6a', 'center');}
  l.forEach((b, i) => {
    if (i < top || i >= top + N) return;
    const yy = cy + 10 + (i - top) * 40, k = benta(b.id), on = i === UI.sel;
    linhaSel(cx, yy, 280, 36, on); texto(k ? b.nome : '? ? ?', cx + 22, yy + 24, 15, k ? '#fff' : '#5a6688');
    if (k) texto('×' + k, cx + 270, yy + 24, 13, '#ffe27a', 'right');
    ZONAS.push([cx, yy, cx + 280, yy + 36, () => {UI.sel = i;}]);
  });
  const b = l[UI.sel], k = benta(b.id), x2 = cx + 310, ww = w - 360; let yy = cy + 16;
  if (!k) {texto('? ? ?', x2, yy + 14, 24, '#5a6688'); texto('Derrote este inimigo para registrá-lo no bestiário.', x2, yy + 50, 14, '#9fb3d9'); return;}
  texto(b.nome, x2, yy + 14, 24, b.cor); yy += 34;
  texto('Abates: ' + k, x2, yy, 15, '#ffe27a'); texto('Elemento: ' + b.el, x2 + 150, yy, 15, '#c8d8f0'); yy += 30;
  const quebra = (s, tam, cor) => {ctx.font = `bold ${tam}px "Trebuchet MS"`; let lin = ''; for (const p of s.split(' ')) {if (ctx.measureText(lin + p).width > ww) {texto(lin, x2, yy, tam, cor); yy += tam + 6; lin = '';} lin += p + ' ';} if (lin) {texto(lin, x2, yy, tam, cor); yy += tam + 6;}};
  quebra(b.desc, 14, '#e8f6ff'); yy += 8;
  if (k >= 5) {texto('Fraco a: ' + b.fraco, x2, yy, 15, '#7dffa8'); yy += 22; texto('Resiste a: ' + b.resiste, x2, yy, 15, '#ff9a9a'); yy += 28;} else {texto('Fraquezas: mais ' + (5 - k) + ' abate(s) para revelar', x2, yy, 14, '#5a6688'); yy += 28;}
  if (k >= 12) {texto('Deixa cair: ' + b.drops, x2, yy, 14, '#ffd36a'); yy += 28;} else {texto('Drops: mais ' + (12 - k) + ' abate(s) para revelar', x2, yy, 14, '#5a6688'); yy += 28;}
  texto('Marcos', x2, yy, 15, '#9fe8ff'); yy += 22;
  const pagos = (JOGO.bestaMarco || {})[b.id] || 0;
  b.marcos.forEach(([n, r], i) => {const ok = i < pagos; texto((ok ? '✔ ' : '☐ ') + n + (n === 1 ? ' abate' : ' abates') + ': ' + (ok || i === pagos ? r.txt : '???'), x2, yy, 13, ok ? '#7dffa8' : '#c8d8f0'); yy += 20;});
}
