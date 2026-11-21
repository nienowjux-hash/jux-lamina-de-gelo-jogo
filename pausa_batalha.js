/* PAUSA NA BATALHA (pedido 2026-11-21: "no meio da luta tem que ter uma pausa... um menuzinho para aumentar a musica").
   Tecla P (ou o botao "Pausa" no canto): a luta congela inteira (o quadro do index.html para quando window.__pausa,
   e as animacoes/esperas andam junto com o quadro) e abre o menu: volume da Musica, dos Efeitos e das Vozes, e Continuar.
   A musica continua tocando para dar para ouvir o volume mudando. Setas: escolher e mudar; ENTER/P/Esc: continuar. */
(function () {
  'use strict';
  const OPS = [['mus', 'Música'], ['sfx', 'Efeitos'], ['voz', 'Vozes'], ['ok', 'Continuar a luta']];
  let sel = 0, aberto = false;
  const css = document.createElement('style');
  css.textContent = '#pausaB{position:fixed;inset:0;z-index:30;display:none;align-items:center;justify-content:center;background:rgba(3,6,14,.62);font-family:"Trebuchet MS",sans-serif}'
    + '#pausaB .cx{width:min(440px,90vw);background:rgba(6,16,40,.97);border:2px solid #8fdcff;border-radius:12px;padding:18px 22px;color:#dfe9f7;box-shadow:0 0 30px rgba(0,0,0,.6)}'
    + '#pausaB h2{margin:0 0 14px;text-align:center;color:#ffe27a;font-size:24px;letter-spacing:3px}'
    + '#pausaB .op{display:flex;align-items:center;gap:12px;padding:8px 10px;border-radius:8px;cursor:pointer;font-size:17px}'
    + '#pausaB .op.sel{background:rgba(127,214,245,.18);color:#8fe9ff;font-weight:bold}'
    + '#pausaB .nm{width:90px}#pausaB input{flex:1;accent-color:#7fd6f5;cursor:pointer}#pausaB .pc{width:46px;text-align:right}'
    + '#pausaB .ok{justify-content:center;margin-top:8px}#pausaB .dica{margin-top:12px;text-align:center;font-size:12px;color:#8aa0bf}'
    + '#btPausa{position:fixed;right:10px;bottom:8px;z-index:8;border:0;border-radius:6px;padding:5px 11px;cursor:pointer;background:rgba(127,214,245,.55);color:#0c1a2a;font:bold 14px "Trebuchet MS",sans-serif}';
  document.head.appendChild(css);
  const fundo = document.createElement('div'); fundo.id = 'pausaB';
  fundo.innerHTML = '<div class="cx"><h2>⏸ PAUSA</h2><div id="pausaOps"></div><div class="dica">Setas: escolher e mudar o volume · ENTER, P ou Esc: continuar</div></div>';
  document.body.appendChild(fundo);
  const lista = fundo.querySelector('#pausaOps');
  OPS.forEach(([id, nome], i) => {
    const d = document.createElement('div'); d.className = 'op' + (id === 'ok' ? ' ok' : '');
    if (id === 'ok') d.textContent = '▶ ' + nome;
    else d.innerHTML = '<span class="nm">' + nome + '</span><input type="range" min="0" max="10" step="1"><span class="pc"></span>';
    d.onmouseenter = () => { sel = i; marca(); };
    d.onclick = e => { e.stopPropagation(); if (id === 'ok') fecha(); };
    const r = d.querySelector('input'); if (r) r.oninput = () => { muda(id, r.value / 10); };
    lista.appendChild(d);
  });
  function muda(id, v) { if (typeof mudaVol === 'function') mudaVol(id, v); else VOL[id] = v; marca();
    if (id === 'sfx' && typeof som === 'function') som('ui_mover', .7);   // da para ouvir o volume dos efeitos
    if (id === 'voz' && typeof VOZES === 'object') { const a = VOZES.kooritsuke || Object.values(VOZES)[0]; if (a) { try { a.currentTime = 0; a.volume = 1; a.play().catch(() => {}); } catch (e) {} } } }
  function marca() {
    [...lista.children].forEach((d, i) => { d.classList.toggle('sel', i === sel); const id = OPS[i][0]; if (id === 'ok') return;
      const v = (typeof VOL === 'object' && VOL[id] != null) ? VOL[id] : 1; d.querySelector('input').value = Math.round(v * 10); d.querySelector('.pc').textContent = Math.round(v * 100) + '%'; });
  }
  function abre() { if (aberto || window.__tut) return; aberto = true; window.__pausa = true; sel = 0; marca(); fundo.style.display = 'flex'; if (typeof som === 'function') som('ui_vez', .6); }
  function fecha() { if (!aberto) return; aberto = false; window.__pausa = false; fundo.style.display = 'none'; if (typeof som === 'function') som('ui_voltar', .6); }
  window.pausaBatalha = { abre, fecha, get aberto() { return aberto; } };
  const bt = document.createElement('button'); bt.id = 'btPausa'; bt.textContent = '⏸ Pausa (P)';
  bt.onclick = e => { e.stopPropagation(); aberto ? fecha() : abre(); bt.blur(); };
  document.body.appendChild(bt);
  fundo.addEventListener('pointerdown', e => { if (e.target === fundo) fecha(); e.stopPropagation(); });
  // a tecla P abre; com o menu aberto, NENHUMA tecla chega na luta (captura antes do jogo)
  addEventListener('keydown', e => {
    const k = e.key.toLowerCase();
    if (!aberto) { if (k === 'p' && !e.ctrlKey && !e.altKey && !e.metaKey) { abre(); e.preventDefault(); e.stopImmediatePropagation(); } return; }
    if (k === 'arrowup' || k === 'w') sel = (sel + OPS.length - 1) % OPS.length;
    else if (k === 'arrowdown' || k === 's') sel = (sel + 1) % OPS.length;
    else if ((k === 'arrowleft' || k === 'a' || k === 'arrowright' || k === 'd') && OPS[sel][0] !== 'ok') { const id = OPS[sel][0], v = (VOL[id] != null ? VOL[id] : 1) + (k === 'arrowleft' || k === 'a' ? -.1 : .1); muda(id, Math.max(0, Math.min(1, v))); }
    else if (k === 'enter' || k === ' ' || k === 'p' || k === 'escape') { if (OPS[sel][0] === 'ok' || k !== 'enter' && k !== ' ') fecha(); }
    marca(); e.preventDefault(); e.stopImmediatePropagation();
  }, true);
  // o jogo perdeu o foco (trocou de janela): nao pausa sozinho, a batalha ja tem as regras dela para isso
})();
