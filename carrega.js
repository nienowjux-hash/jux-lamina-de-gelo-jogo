/* ============ TELA DE CARREGAMENTO DE VERDADE (2026-11-19) ============
   No site as imagens viraram arquivos separados (tools/monta_site.py), que chegam DEPOIS do codigo. Este arquivo vem
   PRIMEIRO em cada pagina: conta toda imagem que comeca a carregar e segura a tela "CARREGANDO" (com a barra de progresso)
   ate todas chegarem, ou 20 s no maximo. Enquanto isso o jogo fica parado (window.__carregando), para a luta nao
   comecar escondida atras da tela. As paginas chamam fimCarregar() no lugar de tirar a tela na hora. */
'use strict';
(function () {
  let tot = 0, ok = 0, pronto = false;
  // depois(fn): coisas que NAO precisam segurar a entrada (imagens das cutscenes) so comecam a baixar quando a tela de carregamento sai
  const fila = [];
  window.depois = function (fn) { if (pronto) setTimeout(fn, 0); else fila.push(fn); };
  window.__carregando = true;
  const d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
  if (d && d.set) Object.defineProperty(HTMLImageElement.prototype, 'src', {configurable: true, get() { return d.get.call(this); },
    set(v) {
      if (!pronto && v && !String(v).startsWith('data:') && !this.__contada) {
        this.__contada = true; tot++;
        const f = () => { ok++; this.removeEventListener('load', f); this.removeEventListener('error', f); barra(); };
        this.addEventListener('load', f); this.addEventListener('error', f);
      }
      d.set.call(this, v);
    }});
  function barra() {
    const el = document.getElementById('carregando'); if (!el) return;
    let b = el.querySelector('.barra');
    if (!b) { b = document.createElement('div'); b.className = 'barra'; b.style.cssText = 'width:220px;height:4px;border-radius:2px;background:#16304d;overflow:hidden'; b.innerHTML = '<i></i>'; el.appendChild(b); }
    const i = b.querySelector('i');
    if (tot) { i.style.cssText = 'display:block;height:100%;background:#8fe6ff;animation:none;transition:width .2s;width:' + Math.round(100 * ok / tot) + '%'; }
  }
  function tira() {
    if (pronto) return; pronto = true; window.__carregando = false;
    setTimeout(() => { while (fila.length) { try { fila.shift()(); } catch (e) {} } }, 50);
    const el = document.getElementById('carregando');
    if (el) { el.style.transition = 'opacity .4s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 450); }
  }
  window.fimCarregar = function () {
    const t0 = Date.now();
    (function espera() { barra(); if (ok >= tot || Date.now() - t0 > 20000) tira(); else setTimeout(espera, 100); })();
  };
})();
