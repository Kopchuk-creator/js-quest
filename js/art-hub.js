/* =========================================================
   art-hub.js — світ-хаб: летючий острів серед зоряного неба
   з порталами в усі світи (як портали між вимірами в Minecraft).
   Кожен портал анімований: вир кольору світу, ланцюги
   для запечатаних, риштування для світів, що будуються.
   ========================================================= */
(function () {
  "use strict";

  const { makeCanvas, painter, hash, lerpColor } = Art.kit;

  const HUB_W = 400, HUB_H = 240;
  // Портали стоять двома рядами; кількість у ряду залежить від кількості світів.
  function hubPoints(count) {
    const row = (n, y, from, to) => Array.from({ length: n }, (_, i) => [Math.round(n > 1 ? from + ((to - from) * i) / (n - 1) : (from + to) / 2), y]);
    const top = Math.ceil(count / 2);
    return row(top, 116, 44, 356).concat(row(count - top, 194, 64, 336));
  }

  const PW = 24, PH = 32;

  function lighten(hex, t) {
    return lerpColor(hex, "#ffffff", t);
  }
  function darken(hex, t) {
    return lerpColor(hex, "#000000", t);
  }

  /** Спрайт порталу 24×32. status: open | done | locked | soon */
  function portal(color, status, frame) {
    const c = makeCanvas(PW, PH);
    const g = painter(c);
    const f = frame || 0;
    // Обсидіанова рамка з блоків 4×4.
    const ob = "#1c1729", obL = "#3b3052", obD = "#0f0c17";
    for (let y = 0; y < PH; y += 4) {
      for (let x = 0; x < PW; x += 4) {
        const edge = x === 0 || x === PW - 4 || y === 0 || y === PH - 4;
        if (!edge) continue;
        g.r(x, y, 4, 4, ob);
        g.r(x, y, 4, 1, obL);
        g.r(x, y + 3, 4, 1, obD);
        if (hash(x, y, 9) > 0.6) g.p(x + 1, y + 1, "#5a4a7a");
      }
    }
    const ix = 4, iy = 4, iw = PW - 8, ih = PH - 8;
    if (status === "open" || status === "done") {
      // Вир: смуги кольору світу, що «течуть» по кадрах.
      for (let y = 0; y < ih; y++) {
        for (let x = 0; x < iw; x++) {
          const v = Math.sin((x * 0.9 + y * 0.6 + f * 0.9) * 0.9) + Math.cos((y * 0.8 - x * 0.4 - f * 0.7) * 0.7);
          const col = v > 1 ? lighten(color, 0.55) : v > 0 ? color : v > -1 ? darken(color, 0.25) : darken(color, 0.5);
          g.p(ix + x, iy + y, col);
        }
      }
      for (let i = 0; i < 4; i++) {
        const px = ix + Math.floor(hash(i, f % 7, 3) * iw), py = iy + Math.floor(hash(i, f % 5, 4) * ih);
        g.p(px, py, "#ffffff");
      }
      if (status === "done") {
        g.r(0, 0, PW, 1, "#f7d23a");
        g.r(0, 0, 1, PH, "#f7d23a");
        g.r(PW - 1, 0, 1, PH, "#f7d23a");
      }
    } else {
      g.r(ix, iy, iw, ih, "#0b0a10");
      for (let i = 0; i < 6; i++) g.p(ix + Math.floor(hash(i, 1, 5) * iw), iy + Math.floor(hash(i, 2, 5) * ih), darken(color, 0.6));
      if (status === "locked") {
        // Ланцюги навхрест і замок.
        for (let i = 0; i < iw; i += 2) {
          const y1 = iy + Math.round((i / iw) * ih), y2 = iy + ih - Math.round((i / iw) * ih);
          g.r(ix + i, y1, 2, 1, "#9aa1a9");
          g.r(ix + i, y2, 2, 1, "#9aa1a9");
        }
        g.r(9, 13, 6, 5, "#c99812");
        g.r(10, 11, 4, 2, "#9aa1a9");
        g.r(11, 15, 2, 1, "#2a2008");
      } else {
        // Риштування: світ ще будується.
        const wood = "#a06a36", woodD = "#62401f";
        g.r(ix + 2, iy, 1, ih, wood);
        g.r(ix + iw - 3, iy, 1, ih, wood);
        for (let y = iy + 3; y < iy + ih; y += 6) g.r(ix, y, iw, 1, woodD);
        g.r(ix + 3, iy + 6, 1, 1, wood);
        for (let i = 0; i < 8; i++) g.p(ix + 3 + i, iy + 4 + i, woodD);
      }
    }
    return c;
  }

  let islandCache = null;

  function buildIsland() {
    const c = makeCanvas(HUB_W, HUB_H);
    const g = painter(c);
    // Небо: глибокі сутінки, смугами.
    const bands = 10;
    for (let i = 0; i < bands; i++) {
      g.r(0, Math.floor((i * HUB_H) / bands), HUB_W, Math.ceil(HUB_H / bands) + 1, lerpColor("#0d1b2a", "#1f4a5a", i / (bands - 1)));
    }
    // Далекі летючі острівці.
    [[30, 40, 14], [372, 56, 18], [330, 22, 9], [80, 18, 8]].forEach(([x, y, r]) => {
      g.ellipse(x, y, r, 3, "#2f6b33");
      for (let row = 0; row < r / 2; row++) g.r(x - r + row * 2, y + 2 + row, (r - row * 2) * 2, 1, "#4a3424");
    });
    // Острів: трав'яна поверхня + шари землі й каменю знизу, «бахромою».
    const top = 66, bottom = 214, left = 14, right = 386;
    for (let x = left; x < right; x++) {
      const edge = Math.min(x - left, right - x);
      const lift = edge < 18 ? Math.round((18 - edge) * 0.8) : 0;
      const yTop = top + lift + Math.round(hash(x >> 2, 1, 7) * 2);
      g.r(x, yTop, 1, bottom - yTop, (x >> 2) % 2 ? "#4f9a3a" : "#55a03f");
      g.r(x, yTop, 1, 2, "#6fbf4f");
      const depth = 10 + Math.round(hash(x >> 2, 2, 7) * 18) + Math.max(0, 20 - edge);
      g.r(x, bottom, 1, 4, "#3f8530");
      g.r(x, bottom + 4, 1, depth * 0.5, "#7a5230");
      g.r(x, bottom + 4 + depth * 0.5, 1, depth * 0.5, "#6c7179");
    }
    // Кам'яна площа з плитками під порталами.
    [[92, 142], [170, 220]].forEach(([y0, y1]) => {
      for (let y = y0 - 50; y < y0 - 18; y += 8) {
        for (let x = 30; x < 372; x += 8) {
          g.r(x, y + 32, 8, 8, ((x + y) >> 3) % 2 ? "#9aa1a9" : "#8a9099");
          g.r(x, y + 32, 8, 1, "#b5bbc2");
        }
      }
    });
    // Квіти й кущики.
    for (let i = 0; i < 120; i++) {
      const x = 22 + Math.floor(hash(i, 3, 11) * 356), y = 72 + Math.floor(hash(i, 4, 11) * 136);
      const onPlaza = (y > 74 && y < 108) || (y > 152 && y < 186);
      if (onPlaza) continue;
      g.p(x, y, ["#f7d23a", "#ff8a76", "#ffffff", "#3f8530"][i % 4]);
    }
    return c;
  }

  /**
   * Малює хаб. states — масив { world, status } у порядку WORLDS.
   */
  function renderHub(canvas, states, frame) {
    canvas.width = HUB_W;
    canvas.height = HUB_H;
    if (!islandCache) islandCache = buildIsland();
    const g = painter(canvas);
    g.ctx.drawImage(islandCache, 0, 0);
    // Зорі мерехтять.
    for (let i = 0; i < 40; i++) {
      const x = Math.floor(hash(i, 5, 2) * HUB_W), y = Math.floor(hash(i, 6, 2) * 60);
      if ((i + frame) % 5 !== 0) g.p(x, y, i % 3 ? "#cfe8f7" : "#ffffff");
    }
    states.forEach((s, i) => {
      const [x, y] = hubPoints(states.length)[i];
      const p = portal(s.world.color, s.status, frame + i);
      // Світло від відчиненого порталу на плитах.
      if (s.status === "open" || s.status === "done") {
        g.ctx.globalAlpha = 0.25 + (frame % 2) * 0.08;
        g.ellipse(x, y + 1, 16, 3, s.world.color);
        g.ctx.globalAlpha = 1;
      }
      g.sprite(p, x - PW / 2, y - PH);
    });
    // Герой стоїть на стежці між рядами порталів.
    const hero = Art.hero();
    g.sprite(hero, 228, 162 - hero.height + (frame % 2), 1);
  }

  Object.assign(Art, { HUB_W, HUB_H, hubPoints, renderHub, portal });
})();
