/* ============ VENTANIA DO PICO DO UIVO (pedido do usuario 2026-11-19: "como e um pico, vento, ventania") ============
   Efeitos DESENHADOS (ref/trilha/fx_vento_pico.png -> fx_vento.js, grade 3x4): linha 0 rajada no ar, linha 1 neve varrida
   rente ao chao, linha 2 redemoinho. O vento sopra da DIREITA para a ESQUERDA (igual as folhas do Jux no vento).
   Ganchos em vila_motor.js: vidaPasso(dt), vidaDesenha('chao'|'ar'). Sem som de vento em loop (era a "musica fantasma"). */
'use strict';
const VPICO = (() => {
  const VT = window.JUX_VENTO || null, IM = new Image();
  if (VT) IM.src = VT.atlas;
  const fx = [];
  let tAr = .3, tChao = .2, tRed = 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const vis = () => {const hw = W / (2 * Z), hh = H / (2 * Z); return {x0: cam.x - hw, x1: cam.x + hw, y0: cam.y - hh, y1: cam.y + hh};};
  function nasce(linha) {
    const v = vis();
    if (linha === 0) fx.push({l: 0, x: v.x1 + rnd(40, 160), y: rnd(v.y0, v.y1), vx: -rnd(380, 520), vy: rnd(-8, 8), s: rnd(220, 340), v: 0, d: 3.4, f: rnd(7, 10)});
    else if (linha === 1) fx.push({l: 1, x: v.x1 + rnd(20, 120), y: rnd(v.y0 + 40, v.y1), vx: -rnd(260, 360), vy: 0, s: rnd(150, 230), v: 0, d: 4.5, f: rnd(6, 9)});
    else fx.push({l: 2, x: rnd(v.x0 + 80, v.x1 - 40), y: rnd(v.y0 + 80, v.y1 - 20), vx: -rnd(40, 70), vy: 0, s: rnd(150, 210), v: 0, d: 2.6, f: 8});
  }
  function passo(dt) {
    if (!VT) return;
    tAr -= dt; tChao -= dt; tRed -= dt;
    if (tAr <= 0) {nasce(0); tAr = rnd(.15, .4);}
    if (tChao <= 0) {nasce(1); tChao = rnd(.2, .5);}
    if (tRed <= 0) {nasce(2); tRed = rnd(2, 4);}
    for (const e of fx) {e.v += dt; e.x += e.vx * dt; e.y += e.vy * dt;}
    for (let i = fx.length - 1; i >= 0; i--) if (fx[i].v > fx[i].d) fx.splice(i, 1);
  }
  function desenha(linhas) {
    if (!VT || !IM.complete) return;
    const T = VT.w;
    for (const e of fx) {
      if (!linhas.includes(e.l)) continue;
      const q = Math.floor(e.v * e.f) % VT.n, a = Math.min(1, e.v / .35, (e.d - e.v) / .5);
      ctx.save(); ctx.globalAlpha = Math.max(0, a);
      ctx.drawImage(IM, q * T, e.l * T, T, T, e.x - e.s / 2, e.y - e.s * (e.l === 0 ? .5 : .8), e.s, e.s);
      ctx.restore();
    }
  }
  return {passo, chao: () => desenha([1, 2]), ar: () => desenha([0])};
})();
function vidaPasso(dt) {if (REGIAO === 'pico') VPICO.passo(dt);}
function vidaDesenha(camada) {if (REGIAO === 'pico') VPICO[camada]();}
