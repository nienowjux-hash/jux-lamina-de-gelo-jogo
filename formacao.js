/* FORMACAO DO GRUPO (FICHA_GRUPO.md, aprovada 2026-11-21: 4 em campo, 2 na FRENTE e 2 ATRAS)
   JOGO.formacao = [frente-cima, frente-baixo, tras-cima, tras-baixo] (id do heroi ou null). Quem nao cabe fica na reserva.
   Na batalha (index.html): cada heroi fica no lugar dele; ATRAS recebe -25% de dano fisico, o ataque fisico de perto tira
   -25% e os inimigos miram menos nele. Usado pela batalha e pelo menu (grupo_tela.js). */
'use strict';
// lugares na tela da batalha (960x540): os inimigos ficam a esquerda, entao FRENTE = mais para a esquerda
// 2026-11-23: mais espaco entre as fileiras (3 herois + o 4o lugar livre) e os Ecos atras de todos (index.html SPR_ECO.pos)
const LUGARES_FORM = [{ x: 630, y: 325, linha: 'frente' }, { x: 590, y: 490, linha: 'frente' }, { x: 870, y: 300, linha: 'tras' }, { x: 840, y: 470, linha: 'tras' }];
const ORDEM_PADRAO_FORM = { jux: 0, bino: 1, felipe: 2 };   // onde cada heroi entra se ainda nao tiver lugar
function grupoForm() { const g = ['jux']; if ((typeof JOGO === 'object' && JOGO.bino && JOGO.bino.ativo) || (typeof temBino === 'function' && typeof TESTE !== 'undefined' && TESTE && temBino())) g.push('bino'); if ((typeof JOGO === 'object' && JOGO.felipe && JOGO.felipe.ativo) || (typeof temFelipe === 'function' && typeof TESTE !== 'undefined' && TESTE && temFelipe())) g.push('felipe'); return g; }
function formacao() { if (typeof JOGO !== 'object') return ['jux', 'bino', null, null];
  const g = grupoForm(); let F = Array.isArray(JOGO.formacao) ? JOGO.formacao.slice(0, 4) : [null, null, null, null]; while (F.length < 4) F.push(null);
  F = F.map(q => (q && g.includes(q) && F.indexOf(q) === F.lastIndexOf(q)) ? q : null);
  for (const q of g) if (!F.includes(q)) { const p = ORDEM_PADRAO_FORM[q]; const i = p != null && !F[p] ? p : F.indexOf(null); if (i >= 0) F[i] = q; }
  JOGO.formacao = F; return F; }
const reservaForm = () => grupoForm().filter(q => !formacao().includes(q));
const linhaDe = q => { const i = formacao().indexOf(q); return i >= 2 ? 'tras' : 'frente'; };
const lugarDe = q => LUGARES_FORM[Math.max(0, formacao().indexOf(q))];
function trocaLugarForm(a, b) { const F = formacao(); [F[a], F[b]] = [F[b], F[a]]; if (!F.some(q => q === 'jux')) return; JOGO.formacao = F; }
// batalha: poe cada um no lugar dele (chamado no newBattle, depois de montar o Bino)
function aplicaFormacao() { if (typeof JUX === 'undefined') return; const l = lugarDe('jux'); JUX.x = l.x; JUX.y = l.y;
  if (typeof BINO !== 'undefined' && typeof temBino === 'function' && temBino()) { const b = lugarDe('bino'); BINO.x = b.x; BINO.y = b.y; }
  if (typeof FELIPE !== 'undefined' && typeof temFelipe === 'function' && temFelipe()) { const f = lugarDe('felipe'); FELIPE.x = f.x; FELIPE.y = f.y; } }
