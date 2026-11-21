/* Tela cheia (botao embaixo no meio, tecla F): o jogo ocupa a tela toda do monitor; sai com F, o botao ou segurando Esc. */
(function () {
  const b = document.createElement('button');
  b.textContent = '⛶ Tela cheia (F)';
  b.style.cssText = 'position:fixed;left:50%;bottom:8px;transform:translateX(-50%);z-index:8;border:0;border-radius:6px;padding:5px 11px;cursor:pointer;background:rgba(127,214,245,.55);color:#0c1a2a;font:bold 12px "Trebuchet MS",sans-serif';
  // dentro da moldura do site (index.html com JUX_MOLDURA): a tela cheia e da MOLDURA, entao continua ao trocar de pagina
  const topo = (() => { try { return window.top !== window && window.top.JUX_MOLDURA ? window.top : null; } catch (e) { return null; } })();
  const doc = topo ? topo.document : document, el = doc.documentElement;
  const alterna = () => {
    if (doc.fullscreenElement) { doc.exitFullscreen(); return; }
    const f = el.requestFullscreen || el.webkitRequestFullscreen; if (!f) return;
    // se a moldura recusar, cai na tela cheia so desta pagina (o jeito antigo)
    Promise.resolve(f.call(el)).catch(() => { if (topo) { const g = document.documentElement; (g.requestFullscreen || g.webkitRequestFullscreen).call(g).catch(() => {}); } });
  };
  b.onclick = e => { e.stopPropagation(); alterna(); b.blur(); };
  addEventListener('keydown', e => { if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) alterna(); });
  // ESC NAO SAI da tela cheia (2026-11-20, pedido: 'atrapalha muito', o jogo usa ESC nos menus): trava a tecla Esc para o jogo
  // (Keyboard Lock do Chrome/Edge). Para sair: F, o botao, ou SEGURAR o Esc por 2 segundos.
  const trava = () => { try { const nav = (topo || window).navigator; if (doc.fullscreenElement && nav.keyboard && nav.keyboard.lock) nav.keyboard.lock(['Escape']).catch(() => {}); } catch (e) {} };
  const mostra = () => { b.style.display = doc.fullscreenElement ? 'none' : 'block'; trava(); };
  doc.addEventListener('fullscreenchange', mostra); mostra();
  document.body.appendChild(b);
})();
