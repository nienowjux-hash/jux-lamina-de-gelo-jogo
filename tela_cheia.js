/* Tela cheia (botao embaixo no meio, tecla F): o jogo ocupa a tela toda do monitor; sai com F, Esc ou o botao. */
(function () {
  const b = document.createElement('button');
  b.textContent = '⛶ Tela cheia (F)';
  b.style.cssText = 'position:fixed;left:50%;bottom:8px;transform:translateX(-50%);z-index:8;border:0;border-radius:6px;padding:5px 11px;cursor:pointer;background:rgba(127,214,245,.55);color:#0c1a2a;font:bold 12px "Trebuchet MS",sans-serif';
  const el = document.documentElement;
  const alterna = () => {
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    const f = el.requestFullscreen || el.webkitRequestFullscreen; if (f) f.call(el).catch(() => {});
  };
  b.onclick = e => { e.stopPropagation(); alterna(); b.blur(); };
  addEventListener('keydown', e => { if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) alterna(); });
  document.addEventListener('fullscreenchange', () => { b.style.display = document.fullscreenElement ? 'none' : 'block'; });
  document.body.appendChild(b);
})();
