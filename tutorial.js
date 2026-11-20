/* ============ TUTORIAL DO COMECO (FICHA_TUTORIAL.md, aprovada 2026-11-20) ============
   Cada dica aparece UMA vez, na primeira vez que a coisa acontece (JOGO.tut[id] = true no save).
   Cartao no meio da tela (HTML por cima do jogo): o jogo pausa (window.__tut) ate fechar com ENTER/Espaco/Esc/toque.
   Se a dica fala de uma aba do menu, ao fechar o menu abre nessa aba com a linha piscando (so no mapa).
   Desliga no menu -> Sistema -> "Dicas do tutorial" (OPC.dicas = false). Usado no mapa (vila_motor.js) e na luta (index.html). */
'use strict';
const TUTS = {
  andar: {t: 'Explorando', l: ['Setas ou WASD: andar · Shift: correr.', 'ENTER (ou toque): falar com as pessoas e examinar o que brilha.', 'M ou Esc: abre o menu (equipamento, missões, mapa e mais).']},
  missao_npc: {t: 'Missões', l: ['O "!" em cima de alguém quer dizer: tem uma missão para você.', 'O "✔" quer dizer: a missão está pronta, volte e entregue.', 'Chegue perto e aperte ENTER para conversar.']},
  habilidade: {t: 'Sua primeira habilidade', l: ['Com a Aurora você aprendeu a Lâmina Glacial: um golpe de gelo que gasta MP.', 'Na luta, ela fica em Magia.', 'No Menu → Habilidades você vê todas e pode ligar ou desligar cada uma.'], aba: 3},
  missao: {t: 'Diário de missões', l: ['Menu → Missões mostra tudo o que você aceitou.', '★ A missão principal aparece sempre no minimapa, com uma seta na beira da tela.', '◆ As outras você escolhe rastrear: selecione a missão e aperte ENTER.'], aba: 5},
  grupo: {t: 'Agora vocês são dois', l: ['O Bino entrou no time e luta do seu lado.', 'No menu, Q troca de personagem (Status, Equipar, Habilidades e Ecos).', 'A arma é de cada um; elmo, armadura, luvas, botas e acessórios servem em qualquer um.'], aba: 0},
  equip: {t: 'Equipamento novo', l: ['Menu → Equipar: escolha o espaço (arma, elmo...) e aperte ENTER.', 'ENTER abre a lista do que serve ali: o painel de baixo mostra agora e com o item escolhido (verde sobe, vermelho desce).', 'O que sai volta para a bolsa. Também dá para equipar pela aba Itens, com ENTER.'], aba: 2},
  hab_nova: {t: 'Habilidade nova', l: ['Subindo de nível, o Jux aprende golpes novos.', 'Veja em Menu → Habilidades. Na luta, eles ficam em Magia.'], aba: 3},
  comida: {t: 'Comida', l: ['Comida dá um bônus que dura algumas lutas.', 'Coma pela aba Itens, com ENTER. Vale uma refeição por vez.'], aba: 1},
  eco: {t: 'Ecos', l: ['Um Eco é a memória de um herói antigo: empresta bônus e golpes (quem ataca é a própria criatura).',
    'Menu → Ecos: qualquer personagem pode usar um Eco (Q troca de personagem), mas o mesmo Eco não fica em dois ao mesmo tempo.',
    'Equipar as habilidades do Eco gasta AP; o limite de AP cresce com o nível de quem usa.', 'O Eco sobe de nível lutando junto e aprende golpes novos.'], aba: 4},
  luta: {t: 'Batalha', l: ['Cada um tem uma barra: quando ela enche, é a vez dele.', 'Atacar, Magia, Itens, Defender ou Fugir: escolha com as setas e ENTER.', 'Q liga o AUTOMÁTICO (o time luta sozinho) · V muda a velocidade.']},
  ressonancia: {t: 'Ressonância', l: ['A barra de Ressonância do Jux encheu!', 'Escolha Ressonância no menu da luta para soltar o golpe especial.']},
};
const tutLigado = () => !(typeof OPC === 'object' && OPC.dicas === false);
const tutVisto = id => !!(typeof JOGO === 'object' && JOGO.tut && JOGO.tut[id]);
let TUT_FILA = [], TUT_EL = null;
window.__tut = false;
// mostra a dica id (se ainda nao viu e as dicas estao ligadas). depois(aba) roda ao fechar
function tutMostra(id, depois) {
  if (!TUTS[id] || tutVisto(id) || !tutLigado() || typeof JOGO !== 'object') return false;
  if (!JOGO.tut) JOGO.tut = {};
  JOGO.tut[id] = true;
  try { if (typeof salvaJogo === 'function') salvaJogo(); } catch (e) {}
  TUT_FILA.push({id, depois});
  if (!TUT_EL) tutAbre();
  return true;
}
function tutAbre() {
  const it = TUT_FILA[0]; if (!it) return;
  const T = TUTS[it.id];
  window.__tut = true;
  const fundo = document.createElement('div');
  fundo.style.cssText = 'position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:rgba(2,6,18,.55);font-family:"Trebuchet MS",sans-serif';
  const c = document.createElement('div');
  c.style.cssText = 'max-width:560px;margin:16px;padding:20px 26px 16px;background:rgba(6,16,40,.97);border:2px solid #8fdcff;border-radius:12px;box-shadow:0 0 30px rgba(127,214,245,.35);color:#e8f6ff';
  const h = document.createElement('div');
  h.textContent = '✦ ' + T.t;
  h.style.cssText = 'font:bold 22px "Trebuchet MS",sans-serif;color:#ffe27a;margin-bottom:12px';
  c.appendChild(h);
  for (const l of T.l) {
    const p = document.createElement('div');
    p.textContent = l;
    p.style.cssText = 'font:bold 16px "Trebuchet MS",sans-serif;line-height:1.45;margin:6px 0;color:#e8f6ff';
    c.appendChild(p);
  }
  const r = document.createElement('div');
  r.textContent = 'ENTER ou toque para continuar';
  r.style.cssText = 'font:bold 13px "Trebuchet MS",sans-serif;color:#8fa6cc;text-align:right;margin-top:12px';
  c.appendChild(r);
  fundo.appendChild(c);
  fundo.addEventListener('click', tutFecha);
  document.body.appendChild(fundo);
  TUT_EL = fundo;
  TUT_EL.t0 = performance.now();
  try { if (typeof som === 'function' && typeof SOM === 'object' && SOM.ui_vez) som(SOM.ui_vez, .5); } catch (e) {}
}
function tutFecha() {
  if (!TUT_EL || performance.now() - TUT_EL.t0 < 350) return;   // evita fechar com a mesma tecla que abriu a cena
  TUT_EL.remove(); TUT_EL = null;
  const it = TUT_FILA.shift();
  if (TUT_FILA.length) { tutAbre(); return; }
  window.__tut = false;
  if (it && it.depois) it.depois(TUTS[it.id].aba);
}
// a tecla vai so para o cartao enquanto ele esta aberto
addEventListener('keydown', e => {
  if (!TUT_EL) return;
  e.stopImmediatePropagation(); e.preventDefault();
  const k = e.key.toLowerCase();
  if (k === 'enter' || k === ' ' || k === 'escape' || k === 'e' || k === 'z') tutFecha();
}, true);
