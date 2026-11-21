/* FILMES DO RIO (Cap. 3, Parte A — FICHA_CAP3_RIO.md, imagens T3–T8, vozes ROTEIRO_VOZ_RIO_FIM.md)
   Tocador de cutscenes do mapa do rio (o rio.html nao tem o motor da vila): imagem com camera lenta (zoom e pan),
   faixas de cinema, legenda digitando com o nome de quem fala, vozes, sons e musica.
   As falas dos Ecos (a Tartarok) sao TELEPATIA: balao verde em italico + som mistico, sem voz (pedido do usuario).
   ENTER/ESPACO: pula para a proxima cena. Usa ctx, W, H e MUS/AMB do rio_motor.js. */
'use strict';
const FILME = { on: false };
const TELE_RIO = { Tartarok: 'assets/sfx/novos/telepatia_natureza', Fenrir: 'assets/sfx/novos/telepatia_gelo' };
const COR_QUEM = { Jux: '#8fe9ff', Bino: '#ffb27a', Tartarok: '#9dff8a', 'Sir Bacon': '#ffb0c8', '✦': '#ffe27a' };
const audioArq = base => { const a = new Audio(); a.preload = 'auto'; a.src = base + (a.canPlayType('audio/ogg; codecs="vorbis"') ? '.ogg' : '.mp3'); return a; };
function filmeSom(base, vol) { try { const a = audioArq(base); a.volume = Math.max(0, Math.min(1, vol == null ? .8 : vol)); a.play().catch(() => {}); } catch (e) {} }

// cenas: [{img, dur, cam:[cx0,cy0,z0, cx1,cy1,z1], falas:[[t, quem, texto]], vozes:[[t, arquivo]], sons:[[t, caminho, vol]], treme:[t0,t1], cartaz:[t, titulo, sub]}]
function tocaFilmeRio(cenas, musica, fim) {
  const imgs = cenas.map(c => { const i = new Image(); i.src = 'assets/cine_rio/' + c.img + '.jpg'; return i; });
  const vozes = {}; for (const c of cenas) for (const [, v] of c.vozes || []) vozes[v] = audioArq('assets/cine_rio/voz_' + v);
  Object.assign(FILME, { on: true, cenas, imgs, vozes, i: 0, t: 0, fim, feitos: new Set(), sai: 0, tele: null, espera: 0 });
  try { MUS.pause(); } catch (e) {}
  FILME.mus = null; if (musica) { const m = audioArq(musica); m.loop = true; m.volume = 0; m.play().catch(() => {}); FILME.mus = m; }
}
function filmePula() { if (!FILME.on || FILME.sai) return; const c = FILME.cenas[FILME.i]; if (FILME.t < .6) return;
  for (const k in FILME.vozes) { try { FILME.vozes[k].pause(); } catch (e) {} }
  if (FILME.i < FILME.cenas.length - 1) { FILME.i++; FILME.t = 0; FILME.tele = null; } else FILME.t = Math.max(FILME.t, c.dur); }
addEventListener('keydown', e => { if (!FILME.on) return; const k = e.key.toLowerCase();
  if (k === 'enter' || k === ' ' || k === 'escape') filmePula(); e.preventDefault(); e.stopImmediatePropagation(); }, true);
addEventListener('pointerdown', e => { if (FILME.on && e.target && e.target.tagName === 'CANVAS') filmePula(); }, true);

function filmeQuadro(dt) {   // true enquanto o filme esta na tela (o motor do rio nao anda nem desenha)
  if (!FILME.on) return false;
  const F = FILME, c = F.cenas[F.i], im = F.imgs[F.i];
  if (!im.complete && F.espera < 8) { F.espera += dt; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); return true; }   // espera a imagem carregar
  F.t += dt;
  if (F.mus) F.mus.volume = Math.min(.5, F.mus.volume + dt * .4) * (F.sai ? Math.max(0, 1 - F.sai) : 1);
  // vozes e sons no tempo da cena
  for (const [tt, v] of c.vozes || []) { const id = F.i + ':v:' + v; if (F.t >= tt && !F.feitos.has(id)) { F.feitos.add(id); try { const a = F.vozes[v]; a.currentTime = 0; a.volume = 1; a.play().catch(() => {}); } catch (e) {} } }
  for (const [tt, s, vol] of c.sons || []) { const id = F.i + ':s:' + tt + s; if (F.t >= tt && !F.feitos.has(id)) { F.feitos.add(id); filmeSom(s, vol); } }
  // a imagem com a camera andando devagar
  const k = Math.min(1, F.t / c.dur), e = k * k * (3 - 2 * k), cm = c.cam || [.5, .5, 1, .5, .5, 1.08];
  const cx = cm[0] + (cm[3] - cm[0]) * e, cy = cm[1] + (cm[4] - cm[1]) * e, z = cm[2] + (cm[5] - cm[2]) * e;
  let sh = 0; if (c.treme && F.t >= c.treme[0] && F.t <= c.treme[1]) sh = 6 * (1 - (F.t - c.treme[0]) / (c.treme[1] - c.treme[0]));
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (im.complete && im.naturalWidth) { const s = Math.max(W / im.naturalWidth, H / im.naturalHeight) * z, iw = im.naturalWidth * s, ih = im.naturalHeight * s;
    let x = W / 2 - cx * iw, y = H / 2 - cy * ih; x = Math.min(0, Math.max(W - iw, x)); y = Math.min(0, Math.max(H - ih, y));
    ctx.drawImage(im, x + (Math.random() - .5) * sh, y + (Math.random() - .5) * sh, iw, ih); }
  // entra e sai de cada cena no preto
  const fade = Math.max(0, 1 - F.t / .6, F.i === F.cenas.length - 1 ? 0 : (F.t - (c.dur - .5)) / .5);
  // faixas de cinema
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 38); ctx.fillRect(0, H - 38, W, 38);
  // legenda
  let at = null; for (const fl of c.falas || []) if (F.t >= fl[0]) at = fl;
  if (at && F.tele !== at) { F.tele = at; if (TELE_RIO[at[1]]) filmeSom(TELE_RIO[at[1]], .5); }
  if (at) { const [tt, quem, txt] = at, n = Math.floor((F.t - tt) * 38), mostra = txt.slice(0, n), tele = !!TELE_RIO[quem];
    ctx.save(); ctx.textAlign = 'center'; ctx.font = (tele ? 'italic ' : '') + 'bold 20px "Trebuchet MS",sans-serif';
    const linhas = []; let lin = ''; for (const p of mostra.split(' ')) { const t2 = lin ? lin + ' ' + p : p; if (ctx.measureText(t2).width > W - 220 && lin) { linhas.push(lin); lin = p; } else lin = t2; } if (lin) linhas.push(lin);
    const by = H - 92 - (linhas.length - 1) * 24;
    if (tele) {   // balao de pensamento: a voz dela na cabeca deles
      const bw = Math.min(W - 160, Math.max(...linhas.map(l => ctx.measureText(l).width), 200) + 60), bh = linhas.length * 24 + 44;
      ctx.fillStyle = 'rgba(10,40,20,.78)'; ctx.strokeStyle = 'rgba(160,255,140,.8)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(W / 2 - bw / 2, by - 44, bw, bh, 18); ctx.fill(); ctx.stroke();
      for (const [dx, r] of [[-bw / 2 + 30, 7], [-bw / 2 + 16, 4]]) { ctx.beginPath(); ctx.arc(W / 2 + dx, by - 44 + bh + r + 4, r, 0, 6.3); ctx.fill(); ctx.stroke(); } }
    ctx.font = 'bold 15px "Trebuchet MS",sans-serif'; ctx.fillStyle = COR_QUEM[quem] || '#fff';
    if (quem !== '✦') { const nm = quem + (tele ? ' (telepatia)' : ''); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.9)'; ctx.strokeText(nm, W / 2, by - 24); ctx.fillText(nm, W / 2, by - 24); }
    ctx.font = (tele || quem === '✦' ? 'italic ' : '') + 'bold 20px "Trebuchet MS",sans-serif';
    linhas.forEach((l, j) => { ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeText(l, W / 2, by + j * 24); ctx.fillStyle = tele ? '#d8ffcc' : quem === '✦' ? '#ffe27a' : '#fff'; ctx.fillText(l, W / 2, by + j * 24); });
    ctx.restore(); }
  // cartaz (fim da parte)
  if (c.cartaz && F.t >= c.cartaz[0]) { const a = Math.min(1, (F.t - c.cartaz[0]) / 1.2); ctx.save(); ctx.fillStyle = 'rgba(0,0,0,' + .55 * a + ')'; ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = a; ctx.textAlign = 'center'; ctx.font = 'bold 34px "Trebuchet MS",sans-serif'; ctx.lineWidth = 5; ctx.strokeStyle = '#000'; ctx.strokeText(c.cartaz[1], W / 2, H / 2 - 6); ctx.fillStyle = '#ffe27a'; ctx.fillText(c.cartaz[1], W / 2, H / 2 - 6);
    ctx.font = 'italic bold 19px "Trebuchet MS",sans-serif'; ctx.strokeText(c.cartaz[2] || '', W / 2, H / 2 + 30); ctx.fillStyle = '#bff4ff'; ctx.fillText(c.cartaz[2] || '', W / 2, H / 2 + 30); ctx.restore(); }
  if (fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, fade) + ')'; ctx.fillRect(0, 0, W, H); }
  ctx.save(); ctx.font = '12px "Trebuchet MS",sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.textAlign = 'right'; ctx.fillText('ENTER: pular', W - 14, H - 14); ctx.restore();
  // fim da cena / do filme
  if (F.t >= c.dur) {
    if (F.i < F.cenas.length - 1) { F.i++; F.t = 0; F.tele = null; }
    else { F.sai += dt / 1; ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, F.sai) + ')'; ctx.fillRect(0, 0, W, H);
      if (F.sai >= 1) { F.on = false; if (F.mus) { try { F.mus.pause(); } catch (e) {} } try { if (typeof musLigada === 'undefined' || musLigada) MUS.play().catch(() => {}); } catch (e) {} const f = F.fim; F.fim = null; if (f) f(); } }
  }
  return true;
}

// ---------- os 3 filmes do fim do rio ----------
const FILMES_RIO = {
  serpente: { mus: 'assets/musica/chefe_serpente', cenas: [
    { img: 'serpente1', dur: 8, cam: [.5, .45, 1.0, .55, .4, 1.12], sons: [[.2, 'assets/sfx/novos/rio_splash_grande', .9], [.4, 'assets/sfx/novos/serpente_rugido', .9]], treme: [.3, 2],
      vozes: [[1.4, 'rio_1_jux'], [5.4, 'rio_1_bino']],
      falas: [[1.4, 'Jux', 'Espera… tem alguma coisa se mexendo embaixo do barco.'], [5.4, 'Bino', '…Segurem firme.']] },
    { img: 'serpente2', dur: 11.5, cam: [.5, .5, 1.15, .5, .5, 1.0], sons: [[.2, 'assets/sfx/novos/serpente_rugido', 1], [.5, 'assets/sfx/novos/serpente_degelo', .5]], treme: [.2, 1.8],
      vozes: [[1.9, 'rio_2_jux_a'], [7.8, 'rio_2_jux_b'], [9.8, 'rio_2_bino']],
      falas: [[1.9, 'Jux', 'Olha, o gelo dela está derretendo. Essa água quente está enfraquecendo ela!'], [7.8, 'Jux', 'Bino, protege o barco!'], [9.8, 'Bino', 'Deixa comigo.']] },
  ] },
  tartarok: { mus: 'assets/musica/espada_lenda', cenas: [
    { img: 'tartarok1', dur: 13, cam: [.6, .45, 1.12, .55, .5, 1.0], sons: [[.3, 'assets/sfx/novos/gelo_quebra', .8], [1.2, 'assets/sfx/novos/gelo_quebra2', .6]],
      vozes: [[1, 'rio_3_jux']], falas: [[1, 'Jux', 'Não é uma ilha… é uma tartaruga! Ela estava presa no gelo da Serpente esse tempo todo.'], [7.2, 'Tartarok', 'Que calor… depois de um inverno tão longo. Quem quebrou o gelo?']] },
    { img: 'tartarok2', dur: 15, cam: [.5, .5, 1.0, .58, .42, 1.12], sons: [[.4, 'assets/sfx/novos/magia_brilho', .7]],
      vozes: [[9.6, 'rio_4_jux']],
      falas: [[.8, 'Tartarok', 'Eu guardo este rio há mil anos. O rio me trouxe até vocês.'], [5.4, 'Tartarok', 'Agora eu vou ser o escudo de vocês.'], [9.6, 'Jux', 'Seja bem-vinda, Tartarok.'],
        [11.8, '✦', 'A Tartarok virou o seu Eco: o Eco do Guardião!']] },
  ] },
  porto: { mus: 'assets/musica/intro_piano', cenas: [
    { img: 'porto1', dur: 8.5, cam: [.4, .5, 1.12, .55, .5, 1.0], sons: [[3.6, 'assets/vila/porco_1', .8]],
      vozes: [[.9, 'rio_5_jux'], [5.6, 'rio_5_bino']],
      falas: [[.9, 'Jux', 'Porto de Cinzas… chegamos.'], [3.6, 'Sir Bacon', 'Oinc! (cof, cof)'], [5.6, 'Bino', '…Que calor.']] },
    { img: 'porto2', dur: 15, cam: [.5, .6, 1.0, .45, .35, 1.15],
      vozes: [[.9, 'rio_6_jux'], [6.2, 'rio_6_bino']],
      falas: [[.9, 'Jux', 'Olha aquele pássaro de fogo… lá no alto do vulcão, esperando a gente.'], [6.2, 'Bino', '…Então é só subir.']],
      cartaz: [9, 'Fim da Parte A — O rio', 'Próximo: a trilha das cinzas'] },
  ] },
};
function filmeRio(nome, fim) { const f = FILMES_RIO[nome]; tocaFilmeRio(f.cenas, f.mus, fim); }
