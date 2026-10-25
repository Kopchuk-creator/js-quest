/* =========================================================
   art.js — процедурний піксель-арт без зовнішніх картинок.
   Усе малюється на <canvas> у низькій роздільності й
   масштабується CSS-ом з image-rendering: pixelated.

   • спрайти (герой, наставник, предмети) задані рядками-сітками
   • 11 орієнтирів локацій малюються кодом і «відбудовуються»
     залежно від прогресу локації (0…1)
   • карта світу генерується детерміновано (seeded noise)
   ========================================================= */
(function () {
  "use strict";

  /* ---------- базові утиліти ---------- */

  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }

  // Детермінований хеш-шум: карта щоразу однакова.
  function hash(x, y, seed) {
    const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
    return s - Math.floor(s);
  }

  function smoothNoise(x, y, seed) {
    const x0 = Math.floor(x), y0 = Math.floor(y);
    const fx = x - x0, fy = y - y0;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = hash(x0, y0, seed), b = hash(x0 + 1, y0, seed);
    const c = hash(x0, y0 + 1, seed), d = hash(x0 + 1, y0 + 1, seed);
    return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
  }

  function fbm(x, y, seed) {
    return smoothNoise(x, y, seed) * 0.55 + smoothNoise(x * 2, y * 2, seed + 1) * 0.3 + smoothNoise(x * 4, y * 4, seed + 2) * 0.15;
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  // Обгортка над контекстом: цілі координати, без згладжування.
  function painter(canvas) {
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const g = {
      ctx,
      r(x, y, w, h, color) {
        if (w <= 0 || h <= 0) return;
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
      },
      p(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
      },
      // Трикутник «гора/дах» рядок за рядком: ліва половина світліша.
      tri(cx, baseY, halfW, h, light, dark, capColor, capRatio) {
        for (let row = 0; row < h; row++) {
          const y = baseY - h + row;
          const w = Math.max(1, Math.round((halfW * (row + 1)) / h));
          const cap = capColor && row < h * (capRatio || 0.3);
          g.r(cx - w, y, w, 1, cap ? capColor : light);
          g.r(cx, y, w, 1, cap ? capColor : dark);
        }
      },
      // Еліпс (заповнений) — для озер, кущів, хмар.
      ellipse(cx, cy, rx, ry, color) {
        for (let y = -ry; y <= ry; y++) {
          const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
          g.r(cx - w, cy + y, w * 2 + 1, 1, color);
        }
      },
      sprite(spr, x, y, scale) {
        ctx.drawImage(spr, Math.round(x), Math.round(y), spr.width * (scale || 1), spr.height * (scale || 1));
      },
    };
    return g;
  }

  // Спрайт із сітки рядків: кожен символ — ключ палітри, "." — прозоро.
  function gridSprite(rows, palette) {
    const h = rows.length, w = Math.max(...rows.map((r) => r.length));
    const c = makeCanvas(w, h);
    const g = painter(c);
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const color = palette[row[x]];
        if (color) g.p(x, y, color);
      }
    });
    return c;
  }

  // Затемнена копія спрайта для заблокованих локацій.
  function dimmed(sprite, alpha) {
    const c = makeCanvas(sprite.width, sprite.height);
    const ctx = c.getContext("2d");
    ctx.drawImage(sprite, 0, 0);
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "rgba(14, 16, 24, " + (alpha || 0.55) + ")";
    ctx.fillRect(0, 0, c.width, c.height);
    return c;
  }

  /* ---------- персонажі ---------- */

  const HERO_PALETTE = {
    k: "#1d1410", H: "#a5582a", L: "#d98a3d", h: "#6e3519",
    s: "#f2c79a", S: "#cf9466", e: "#22160f",
    y: "#f7d23a", Y: "#c99812",
    b: "#3f78b5", B: "#2b5585",
    p: "#8c5a2e", P: "#5c391b",
    d: "#4a3a2e", D: "#33271f", o: "#2e2018",
  };

  const HERO_ROWS = [
    "....kk.kkk.k....",
    "...kHHkHHHkHk...",
    "..kHLLHHHHHHk...",
    "..kHLHHHHHHHHk..",
    ".kHHHHHHHHHHHk..",
    ".kHhHHhHHHhHhk..",
    "..kHsssssssHk...",
    "..kssesssessk...",
    "..ksssssssssk...",
    "...ksssSsssk....",
    "..kyyyyyyyyyk...",
    "kyyYyyyyyyyYk...",
    "kyykbbyyybbbPk..",
    ".kkbbbbbbbbbPk..",
    "..kbBbbbbbBbPk..",
    "..ksbbbbbbbsPk..",
    "..kkpppppppkkk..",
    "...kddddddddk...",
    "...kdddkddddk...",
    "...kdDdkdDdk....",
    "...kook.kook....",
    "...kkkk.kkkk....",
  ];

  const MENTOR_PALETTE = { k: "#2a2008", y: "#f7d23a", Y: "#d1a90f", e: "#2a2008", o: "#3a2c0a" };
  const MENTOR_ROWS = [
    "...kkkkkkkk...",
    "..kyyyyyyyyk..",
    ".kyyyyyyyyyyk.",
    "kyykyyyyyykyyk",
    "kyykyeyyeykyyk",
    "kykyyeyyeyykyk",
    "kyykyyyyyykyyk",
    "kyykyykkyykyyk",
    "kyyyyyyyyyyyyk",
    "kYyyyyyyyyyyYk",
    ".kYYyyyyyyYYk.",
    "..kkkkkkkkkk..",
    "...kok..kok...",
    "...kk....kk...",
  ];

  /* ---------- предмети інвентаря (12×12) ---------- */

  const ITEM_PALETTE = {
    k: "#1b1612", g: "#c3ccd6", G: "#7c8794", w: "#ffffff",
    t: "#a06a36", T: "#62401f", y: "#f7d23a", Y: "#b98a0f",
    r: "#e0503c", R: "#962a1f", c: "#62d8ff", C: "#2a8bbf",
    m: "#5ee0a0", M: "#2a9a68", s: "#9aa3ad", S: "#626b75",
    q: "#f0dcae", Q: "#c9a86a", b: "#4a86c8", B: "#2d5a8c",
  };

  const ITEMS = {
    pickaxe: [
      "..kkkkkkk...",
      ".kgggggggk..",
      "kgGkkkkkGgk.",
      "kGk..kt.kGk.",
      ".k..ktk..k..",
      "....ktk.....",
      "...ktk......",
      "...ktk......",
      "..ktk.......",
      "..ktk.......",
      ".kTk........",
      ".kk.........",
    ],
    key: [
      "...kkk......",
      "..kyyyk.....",
      ".kyYkYyk....",
      ".kyk.kyk....",
      ".kyYkYyk....",
      "..kyyyk.....",
      "...kyk......",
      "...kyk......",
      "...kyykk....",
      "...kyk......",
      "...kyyk.....",
      "....kk......",
    ],
    axe: [
      "....kkk.....",
      "...kgggk....",
      "..kgwggkk...",
      "..kgggGtk...",
      "..kgggGtk...",
      "...kGGktk...",
      "....kkktk...",
      "......ktk...",
      "......ktk...",
      "......ktk...",
      "......kTk...",
      "......kkk...",
    ],
    gem: [
      "............",
      "...kkkkkk...",
      "..kcwccCck..",
      ".kcwcccCCCk.",
      "kkkkkkkkkkkk",
      ".kcccccCCk..",
      "..kcccCCk...",
      "...kccCk....",
      "....kcCk....",
      ".....kk.....",
      "............",
      "............",
    ],
    rune: [
      "..kkkkkkk...",
      ".kssssssSk..",
      "kssscsssSSk.",
      "ksscccssSSk.",
      "kssscsssSSk.",
      "kssscsssSSk.",
      "ksscscssSSk.",
      "kscsssCsSSk.",
      "ksssssssSSk.",
      "kSSSSSSSSSk.",
      ".kkkkkkkkk..",
      "............",
    ],
    sword: [
      ".........kkk",
      "........kwgk",
      ".......kwgk.",
      "......kwgk..",
      ".....kwgk...",
      "..k.kwgk....",
      "..kkwgk.....",
      "...kgk......",
      "..kykYk.....",
      ".kTk.kyk....",
      "kTk...k.....",
      "kk..........",
    ],
    hammer: [
      ".kkkkkkk....",
      "kgwgggGGk...",
      "kgggggGGk...",
      "kGGGGGGGk...",
      ".kkktkkk....",
      "....ktk.....",
      "....ktk.....",
      "....ktk.....",
      "....ktk.....",
      "....ktk.....",
      "....kTk.....",
      "....kkk.....",
    ],
    scroll: [
      ".kkkkkkkkk..",
      "kQqqqqqqqQk.",
      "kQkkkkkkkQk.",
      ".kqqqqqqqk..",
      ".kqQQQQqqk..",
      ".kqqqqqqqk..",
      ".kqQQQqqqk..",
      ".kqqqqqqqk..",
      ".kqQQQQqqk..",
      "kQkkkkkkkQk.",
      "kQqqqqqqqQk.",
      ".kkkkkkkkk..",
    ],
    hourglass: [
      "kkkkkkkkkk..",
      "kTttttttTk..",
      ".kyyyyyyk...",
      ".kyyyyyyk...",
      "..kyyyyk....",
      "...kyyk.....",
      "...kqyk.....",
      "..kqqyqk....",
      ".kqqyyyqk...",
      ".kyyyyyyk...",
      "kTttttttTk..",
      "kkkkkkkkkk..",
    ],
    shield: [
      "kkkkkkkkkk..",
      "kbbbbyBBBk..",
      "kbwbbyBBBk..",
      "kbbbbyBBBk..",
      "kyyyyyyyyk..",
      "kbbbbyBBBk..",
      "kbbbbyBBBk..",
      ".kbbbyBBk...",
      ".kbbbyBBk...",
      "..kbbyBk....",
      "...kkkk.....",
      "............",
    ],
    crown: [
      "............",
      "k...k...k...",
      "kk.kyk.kk...",
      "kyk.kyk.kyk.",
      "kyykyyykyyk.",
      "kyyyyyyyyyk.",
      "kyryycyyryk.",
      "kyyyyyyyyyk.",
      "kYYYYYYYYYk.",
      "kkkkkkkkkkk.",
      "............",
      "............",
    ],
  };

  const spriteCache = new Map();
  function cached(key, build) {
    if (!spriteCache.has(key)) spriteCache.set(key, build());
    return spriteCache.get(key);
  }

  /* ---------- малі об'єкти карти ---------- */

  const PINE = gridSprite(
    ["...k...", "..kak..", "..kak..", ".kaaak.", ".kabak.", "kaaaaak", "kabbabk", ".kkkkk.", "...t..."],
    { k: "#173a22", a: "#2f7d3a", b: "#215e2c", t: "#5c391b" }
  );
  const PINE_LIGHT = gridSprite(
    ["...k...", "..kak..", "..kak..", ".kaaak.", ".kabak.", "kaaaaak", "kabbabk", ".kkkkk.", "...t..."],
    { k: "#1d4a29", a: "#3f9a45", b: "#2c7535", t: "#5c391b" }
  );
  const BUSH = gridSprite(
    [".kkkk.", "kaabak", "kabaak", ".kkkk."],
    { k: "#1f4a22", a: "#4aa043", b: "#368535" }
  );

  // Велика сосна для орієнтирів і сцен.
  function bigPine(g, x, baseY, h, palette) {
    const pal = palette || { k: "#173a22", a: "#2f7d3a", b: "#215e2c", t: "#5c391b" };
    g.r(x - 1, baseY - 3, 2, 3, pal.t);
    const layers = 3;
    for (let i = 0; i < layers; i++) {
      const layerBase = baseY - 3 - i * Math.round(h / 4);
      const lh = Math.round(h / 2.4);
      const hw = Math.round(h / 3.2) - i;
      g.tri(x, layerBase + 1, hw + 1, lh + 1, pal.k, pal.k);
      g.tri(x, layerBase, hw, lh, pal.a, pal.b);
    }
  }

  /* ---------- орієнтири локацій ----------
     Кожна функція малює орієнтир на власному полотні;
     p — частка пройдених рівнів локації (0…1), f — кадр анімації. */

  const C = {
    k: "#1b1612", stone: "#9aa1a9", stoneD: "#6d737c", stoneL: "#c1c6cc",
    wood: "#9a6234", woodD: "#5e3a1c", woodL: "#c08a52",
    cloth: "#e8c97e", clothD: "#b8954e", fire1: "#f7a33a", fire2: "#f7d23a", fire3: "#e0503c",
    gold: "#f7d23a", goldD: "#b98a0f", cyan: "#62d8ff", cyanD: "#2a8bbf",
    grass: "#4f9a3a", grassD: "#3a7a2e", dark: "#1c1a22", mint: "#5ee0a0",
  };

  function drawFire(g, x, y, f, big) {
    g.r(x - 3, y + 1, 7, 2, C.woodD);
    g.r(x - 2, y, 5, 1, C.wood);
    const flick = f % 2;
    g.r(x - 2, y - 3 - (big ? 1 : 0), 5, 3 + (big ? 1 : 0), C.fire1);
    g.r(x - 1, y - 5 - flick, 3, 3, C.fire2);
    g.p(x - flick, y - 6 - flick, C.fire2);
    g.p(x + 1 - flick, y - 2, "#fff6c8");
  }

  function drawTorch(g, x, y, f) {
    g.r(x, y, 1, 4, C.woodD);
    g.r(x - 1, y - 2, 3, 2, C.fire1);
    g.p(x, y - 3 - (f % 2), C.fire2);
  }

  function drawFlag(g, x, baseY, h, color) {
    g.r(x, baseY - h, 1, h, C.woodD);
    g.r(x + 1, baseY - h, 5, 3, color || C.gold);
    g.r(x + 1, baseY - h + 3, 3, 1, color || C.gold);
  }

  const LANDMARKS = {
    // 1. Табір змінних: намети з'являються, вогнище розгорається.
    1: { w: 44, h: 30, draw(g, p, f) {
      g.ellipse(22, 25, 18, 4, "#a9874f");
      g.ellipse(22, 25, 15, 3, "#bf9c5f");
      if (p < 0.2) {
        g.tri(13, 27, 9, 3, C.clothD, "#8f7036");
      } else {
        g.tri(13, 27, 10, 13, C.k, C.k);
        g.tri(13, 27, 9, 12, C.cloth, C.clothD);
        g.tri(13, 27, 2, 5, "#4a3018", "#3a2410");
      }
      if (p >= 0.5) {
        g.tri(33, 26, 8, 10, C.k, C.k);
        g.tri(33, 26, 7, 9, "#e2a65a", "#b47a35");
        g.tri(33, 26, 2, 4, "#4a3018", "#3a2410");
      }
      if (p > 0) drawFire(g, 24, 24, f, p >= 0.7);
      else { g.r(21, 25, 7, 2, C.woodD); g.r(22, 24, 5, 1, C.wood); }
      if (p >= 0.8) { g.r(4, 22, 5, 4, C.wood); g.r(4, 22, 5, 1, C.woodL); g.r(4, 25, 5, 1, C.woodD); }
      if (p >= 1) {
        drawFlag(g, 40, 27, 18);
        g.r(36, 20, 1, 7, C.woodD);
        g.r(34, 19, 5, 1, C.stoneL);
      }
    } },

    // 2. Долина умов: кам'яна брама; смолоскипи запалюються, у фіналі брама відчиняється.
    2: { w: 44, h: 34, draw(g, p, f) {
      g.ellipse(4, 33, 9, 12, C.grassD);
      g.ellipse(40, 33, 9, 12, C.grassD);
      g.ellipse(5, 33, 7, 10, "#5aa843");
      g.ellipse(39, 33, 7, 10, "#5aa843");
      g.r(11, 9, 22, 25, C.k);
      g.r(12, 10, 5, 24, C.stone);
      g.r(27, 10, 5, 24, C.stoneD);
      g.r(12, 6, 20, 5, C.k);
      g.r(13, 7, 18, 3, C.stoneL);
      for (let y = 13; y < 33; y += 4) { g.r(12, y, 5, 1, C.stoneD); g.r(27, y, 5, 1, "#575c64"); }
      if (p >= 1) {
        g.r(17, 11, 10, 23, "#f9e9a8");
        g.r(19, 14, 6, 20, "#fff6d0");
        g.r(20, 26, 4, 8, "#d9c27a");
        g.r(17, 11, 2, 23, C.woodD);
        g.r(25, 11, 2, 23, C.woodD);
        g.r(15, 7, 14, 3, C.gold);
        g.r(20, 10, 4, 3, C.gold);
      } else {
        g.r(17, 11, 10, 23, C.wood);
        for (let x = 18; x < 27; x += 3) g.r(x, 11, 1, 23, C.woodD);
        g.r(17, 18, 10, 1, C.woodD);
        g.r(17, 27, 10, 1, C.woodD);
        g.r(21, 21, 2, 3, C.goldD);
      }
      if (p >= 0.34) drawTorch(g, 9, 16, f);
      if (p >= 0.67) drawTorch(g, 34, 16, f + 1);
    } },

    // 3. Ліс функцій: стежку поступово розчищають від повалених дерев.
    3: { w: 44, h: 34, draw(g, p, f) {
      g.r(18, 20, 8, 14, "#b08a52");
      g.r(19, 20, 6, 14, "#c9a265");
      bigPine(g, 6, 30, 22);
      bigPine(g, 14, 22, 18);
      bigPine(g, 36, 31, 24);
      bigPine(g, 30, 21, 17);
      bigPine(g, 22, 15, 15);
      const blockers = Math.ceil((1 - p) * 3);
      for (let i = 0; i < blockers; i++) {
        const y = 31 - i * 5;
        g.r(15, y, 14, 3, C.k);
        g.r(16, y + 1, 12, 1, C.wood);
        g.r(26, y, 3, 3, C.woodL);
      }
      if (p >= 1) {
        g.r(30, 24, 1, 9, C.woodD);
        g.r(27, 24, 9, 4, C.k);
        g.r(28, 25, 7, 2, C.woodL);
        g.p(34, 25, C.k);
        drawTorch(g, 13, 27, f);
      }
    } },

    // 4. Печери масивів: кристали загоряються, у фіналі — скриня зі скарбом.
    4: { w: 44, h: 32, draw(g, p, f) {
      for (let row = 0; row < 26; row++) {
        const w = Math.round(8 + row * 0.75);
        const y = 6 + row;
        g.r(22 - w - 1, y, w * 2 + 2, 1, C.k);
        g.r(22 - w, y, w, 1, row < 3 ? C.stoneL : C.stone);
        g.r(22, y, w, 1, C.stoneD);
      }
      g.r(12, 16, 4, 2, C.stoneL);
      g.r(28, 22, 5, 1, "#575c64");
      g.ellipse(22, 27, 6, 6, C.k);
      g.ellipse(22, 27, 5, 5, C.dark);
      g.r(16, 28, 13, 4, C.dark);
      const spots = [[10, 24], [33, 25], [15, 13], [29, 12], [22, 9]];
      const lit = Math.round(p * spots.length);
      spots.forEach(([x, y], i) => {
        const on = i < lit;
        g.r(x, y, 2, 3, on ? C.cyan : "#55606b");
        g.p(x, y, on ? "#e8fbff" : "#6d7883");
        if (on && (f + i) % 3 === 0) g.p(x - 1, y - 1, "#e8fbff");
      });
      if (p >= 1) {
        g.r(18, 25, 9, 6, C.k);
        g.r(19, 26, 7, 4, C.wood);
        g.r(19, 26, 7, 1, C.gold);
        g.r(22, 27, 1, 2, C.gold);
        g.p(20, 24 - (f % 2), C.gold);
        g.p(24, 23, "#fff6c8");
      }
    } },

    // 5. Святилище об'єктів: руни на колонах світяться, у фіналі — промінь світла.
    5: { w: 40, h: 36, draw(g, p, f) {
      if (p >= 1) {
        g.ctx.globalAlpha = 0.35 + (f % 2) * 0.1;
        g.r(17, 0, 6, 20, "#fff2a8");
        g.ctx.globalAlpha = 1;
      }
      g.r(3, 31, 34, 4, C.k);
      g.r(4, 31, 32, 3, C.stone);
      g.r(6, 28, 28, 3, C.stoneL);
      g.tri(20, 14, 18, 9, C.k, C.k);
      g.tri(20, 13, 17, 8, C.stoneL, C.stone);
      g.r(4, 13, 32, 2, C.stoneD);
      const pillars = [7, 14, 22, 29];
      const lit = Math.round(p * pillars.length);
      pillars.forEach((x, i) => {
        g.r(x - 1, 15, 6, 13, C.k);
        g.r(x, 15, 2, 13, C.stoneL);
        g.r(x + 2, 15, 2, 13, C.stone);
        const on = i < lit;
        g.r(x + 1, 19, 2, 1, on ? C.cyan : C.stoneD);
        g.r(x + 1, 21, 1, 2, on ? C.cyan : C.stoneD);
        g.r(x + 2, 24, 1, 1, on ? C.cyan : C.stoneD);
      });
      g.r(18, 24, 4, 4, C.k);
      g.r(19, 24, 2, 3, p >= 1 ? C.gold : C.stoneD);
      if (p >= 1) g.p(20 - (f % 2), 22, "#fffbe0");
    } },

    // 6. Болото багів: бос-баг слабшає (шкала здоров'я), у фіналі — чисте озерце.
    6: { w: 44, h: 28, draw(g, p, f) {
      g.ellipse(22, 20, 20, 7, "#2c3a1c");
      g.ellipse(22, 20, 19, 6, p >= 1 ? "#3f7d8a" : "#4a5a2e");
      for (let i = 0; i < 9; i++) g.p(6 + i * 4, 18 + ((i * 7) % 5), p >= 1 ? "#7ec4d0" : "#6b7a3f");
      [[4, 14], [7, 13], [37, 14], [40, 15]].forEach(([x, y]) => {
        g.r(x, y, 1, 7, "#6b7a35");
        g.r(x, y - 2, 1, 2, C.woodD);
      });
      if (p < 1) {
        const bob = f % 2;
        g.ellipse(22, 14 + bob, 9, 6, C.k);
        g.ellipse(22, 14 + bob, 8, 5, "#7a2b2b");
        g.r(22, 9 + bob, 1, 11, "#4a1515");
        g.r(17, 11 + bob, 3, 2, "#b04545");
        for (let i = 0; i < 3; i++) {
          g.r(12, 13 + i * 2 + bob, 3, 1, C.k);
          g.r(30, 13 + i * 2 + bob, 3, 1, C.k);
        }
        g.ellipse(22, 8 + bob, 4, 2, C.k);
        g.p(20, 8 + bob, C.gold);
        g.p(24, 8 + bob, C.gold);
        g.r(18, 4 + bob, 1, 3, C.k);
        g.r(26, 4 + bob, 1, 3, C.k);
        g.r(12, 0, 20, 3, C.k);
        g.r(13, 1, Math.max(1, Math.round(18 * (1 - p))), 1, "#e0503c");
      } else {
        g.ellipse(14, 19, 3, 1, "#4aa043");
        g.ellipse(28, 21, 3, 1, "#4aa043");
        g.r(28, 19, 2, 2, "#f6f0ff");
        g.p(28, 19, C.gold);
        g.r(20, 10 + (f % 2), 3, 1, C.cyan);
      }
    } },

    // 7. Міст DOM: дошки й мотузки з'являються одна за одною.
    7: { w: 40, h: 26, draw(g, p, f) {
      g.r(0, 9, 7, 17, C.k);
      g.r(1, 10, 5, 16, C.stone);
      g.r(33, 9, 7, 17, C.k);
      g.r(34, 10, 5, 16, C.stoneD);
      g.r(1, 10, 5, 1, C.stoneL);
      const planks = Math.round(p * 7);
      for (let i = 0; i < 7; i++) {
        const x = 7 + i * 4;
        if (i < planks) {
          g.r(x, 12, 4, 4, C.k);
          g.r(x, 12, 3, 3, C.woodL);
          g.r(x, 14, 3, 1, C.wood);
        } else if (i === 0 || i === 6) {
          g.r(x, 13, 2, 2, C.woodD);
        }
      }
      if (p >= 0.5) {
        g.r(2, 4, 1, 6, C.woodD);
        g.r(37, 4, 1, 6, C.woodD);
        g.r(3, 5, 34, 1, "#c9a86a");
        g.r(3, 8, 34, 1, "#a8884e");
      }
      if (p >= 1) { drawTorch(g, 2, 2, f); drawTorch(g, 37, 2, f + 1); }
    } },

    // 8. Скарбниця пам'яті: кільця на круглих дверях спалахують, у фіналі двері відчинено.
    8: { w: 36, h: 30, draw(g, p, f) {
      g.tri(18, 10, 17, 8, C.k, C.k);
      g.tri(18, 9, 16, 7, "#b5653a", "#8a4526");
      g.r(2, 9, 32, 21, C.k);
      g.r(3, 10, 30, 19, C.stone);
      for (let y = 13; y < 29; y += 4) g.r(3, y, 30, 1, C.stoneD);
      for (let x = 7; x < 33; x += 8) g.r(x, 10, 1, 19, C.stoneD);
      g.ellipse(18, 21, 7, 7, C.k);
      if (p >= 1) {
        g.ellipse(18, 21, 6, 6, "#2a1d10");
        g.r(13, 24, 11, 5, C.gold);
        g.r(14, 22, 8, 2, C.goldD);
        g.p(16 + (f % 3), 23, "#fff6c8");
      } else {
        const rings = Math.round(p * 3);
        g.ellipse(18, 21, 6, 6, rings >= 1 ? C.gold : C.stoneD);
        g.ellipse(18, 21, 4, 4, rings >= 2 ? C.goldD : "#575c64");
        g.ellipse(18, 21, 2, 2, rings >= 3 ? C.gold : C.stoneD);
        g.r(12, 28, 13, 2, C.stone);
      }
    } },

    // 9. Вежа Async: вікна поверхів засвічуються, у фіналі — прапор на вершині.
    9: { w: 28, h: 66, draw(g, p, f) {
      g.r(6, 13, 16, 53, C.k);
      g.r(7, 14, 7, 52, C.stoneL);
      g.r(14, 14, 7, 52, C.stone);
      for (let y = 18; y < 64; y += 5) g.r(7, y, 14, 1, C.stoneD);
      g.r(4, 7, 20, 7, C.k);
      g.r(5, 8, 18, 5, C.stone);
      for (let x = 5; x < 23; x += 4) g.r(x, 6, 2, 2, C.k);
      g.r(11, 56, 6, 10, C.k);
      g.r(12, 57, 4, 9, C.woodD);
      const floors = [48, 38, 28, 18];
      const lit = Math.round(p * floors.length);
      floors.forEach((y, i) => {
        g.r(12, y, 4, 5, C.k);
        g.r(13, y + 1, 2, 3, i < lit ? (f % 4 === i ? "#fff6c8" : C.gold) : "#2c3038");
      });
      g.r(16, 8, 4, 4, "#e8ecef");
      g.p(18, 9, C.k); g.p(18, 10, C.k); g.p(19, 10, C.k);
      if (p >= 1) drawFlag(g, 13, 7, 7, C.gold);
    } },

    // 10. Вершина вежі: штормова хмара розсіюється, у фіналі — сонячний маяк.
    10: { w: 44, h: 26, draw(g, p, f) {
      if (p < 1) {
        const shrink = Math.round(p * 6);
        const flash = f % 3 === 0;
        g.ellipse(22, 10, 18 - shrink, 7 - Math.round(shrink / 2), "#2c3038");
        g.ellipse(15, 9, 9 - Math.round(shrink / 2), 6, "#4a4f5c");
        g.ellipse(28, 8, 10 - Math.round(shrink / 2), 6, "#5a606d");
        g.ellipse(22, 6, 7, 4, "#6c7280");
        if (flash) {
          g.r(23, 14, 2, 3, C.gold);
          g.r(21, 17, 3, 2, C.gold);
          g.r(22, 19, 2, 4, C.gold);
        }
        for (let i = 0; i < 6 - shrink; i++) g.r(10 + i * 5, 17 + ((i + f) % 3), 1, 3, "#8fb6d9");
      } else {
        g.ellipse(22, 14, 6, 6, "#fff2a8");
        g.ellipse(22, 14, 4, 4, C.gold);
        const rays = [[22, 3], [22, 24], [11, 14], [33, 14], [14, 6], [30, 6], [14, 22], [30, 22]];
        rays.forEach(([x, y], i) => { if ((i + f) % 2 === 0) g.r(x - 1, y - 1, 2, 2, "#fff2a8"); });
      }
    } },

    // 11. Замок фіналу: руїни → стіни → вежі → прапори й світло у вікнах.
    11: { w: 60, h: 50, draw(g, p, f) {
      const stage = Math.round(p * 3);
      function tower(x, top, w) {
        g.r(x - 1, top - 1, w + 2, 50 - top + 1, C.k);
        g.r(x, top, Math.ceil(w / 2), 50 - top, C.stoneL);
        g.r(x + Math.ceil(w / 2), top, Math.floor(w / 2), 50 - top, C.stone);
        for (let cx = x; cx < x + w; cx += 3) g.r(cx, top - 3, 2, 3, C.k);
        for (let y = top + 4; y < 50; y += 5) g.r(x, y, w, 1, C.stoneD);
      }
      if (stage === 0) {
        g.r(6, 40, 14, 10, C.k); g.r(7, 41, 12, 9, C.stoneD);
        g.r(26, 36, 9, 14, C.k); g.r(27, 37, 7, 13, C.stone);
        g.r(42, 43, 12, 7, C.k); g.r(43, 44, 10, 6, C.stoneD);
        g.r(14, 46, 3, 2, C.stone); g.r(38, 47, 3, 2, C.stone);
        return;
      }
      tower(4, 30, 52);
      g.r(4, 30, 52, 20, C.stone);
      g.r(4, 30, 52, 1, C.stoneL);
      g.r(25, 40, 10, 10, C.k);
      g.r(26, 41, 8, 9, stage >= 3 ? C.woodD : "#3a2a1a");
      if (stage >= 2) {
        tower(2, 18, 10);
        tower(48, 18, 10);
      }
      if (stage >= 3) {
        tower(21, 8, 18);
        g.tri(30, 6, 10, 7, "#d9534f", "#a8322f");
        drawFlag(g, 7, 15, 9, C.gold);
        drawFlag(g, 53, 15, 9, C.gold);
        [[27, 16], [31, 16], [6, 26], [51, 26], [28, 26]].forEach(([x, y], i) => {
          g.r(x, y, 2, 3, (f + i) % 5 === 0 ? "#fff6c8" : C.gold);
        });
      }
    } },
  };

  /* ---------- реєстр світів ----------
     Кожен світ описує власну карту: розмір, рельєф (buildTerrain),
     орієнтири локацій, біоми сцен і де стоять підписи та герой. */

  const WORLD_ART = {};

  function registerWorld(id, cfg) {
    WORLD_ART[id] = Object.assign({ mapW: 400, mapH: 250, labelPos: {}, landmarkDy: {}, heroSpot: {}, pathDy: {} }, cfg);
  }

  function worldArt(id) {
    return WORLD_ART[id] || WORLD_ART.js;
  }

  function landmark(locId, progress, frame, dim, worldId) {
    const def = worldArt(worldId).landmarks[locId];
    const c = makeCanvas(def.w, def.h);
    def.draw(painter(c), Math.max(0, Math.min(1, progress)), frame || 0);
    return dim ? dimmed(c, 0.55) : c;
  }

  /* ---------- карта світу ---------- */

  const MAP_W = 400, MAP_H = 250;

  // Опорні точки локацій (основа орієнтира) у пікселях карти.
  const MAP_POINTS = {
    1: [56, 204], 2: [62, 138], 3: [126, 182], 4: [128, 96], 5: [196, 68], 6: [188, 150],
    7: [246, 184], 8: [298, 214], 9: [318, 164], 10: [318, 92], 11: [352, 72],
  };

  const RIVER = [[236, -5], [230, 40], [238, 90], [233, 130], [246, 180], [250, 215], [262, 255]];

  function distToPolyline(x, y, pts) {
    let best = Infinity;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      const dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
      const px = ax + t * dx - x, py = ay + t * dy - y;
      best = Math.min(best, Math.sqrt(px * px + py * py));
    }
    return best;
  }

  function seaEdge(y) {
    const bay = y > 196 ? (y - 196) * 0.9 : 0;
    return 376 + Math.sin(y / 23) * 7 + smoothNoise(y / 9, 3, 5) * 6 - bay;
  }

  function mountainLine(x) {
    if (x > 222 && x < 252) return -5;
    const base = x < 222 ? 46 : 26;
    return base + smoothNoise(x / 14, 1, 9) * 10;
  }

  function buildTerrain() {
    const c = makeCanvas(MAP_W, MAP_H);
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(MAP_W, MAP_H);
    const col = (hex) => hexToRgb(hex);
    const P = {
      g1: col("#4f9a3a"), g2: col("#5aa843"), g3: col("#67b64b"), g4: col("#43893a"),
      sand: col("#e2cf8e"), sand2: col("#cdb874"),
      sh: col("#3fb3d9"), deep: col("#2a85c4"), deeper: col("#2170b0"), foam: col("#dff6ff"),
      river: col("#3aa6d6"), riverD: col("#2a86b8"), bank: col("#3a6a2c"),
      rock: col("#8a8f96"), rockD: col("#6c7179"),
      swamp: col("#4a5a2e"), swamp2: col("#56683a"), swampW: col("#3d4f2c"),
      field: col("#d9b44a"), field2: col("#c99f38"),
    };
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const n = fbm(x / 38, y / 38, 1);
        const dither = hash(x, y, 2);
        let rgb;
        const sea = x - seaEdge(y);
        const river = distToPolyline(x, y, RIVER) - (3 + n * 2.2);
        const dSwamp = Math.hypot(x - 188, (y - 150) * 1.4) - (24 + n * 8);
        const dField = Math.hypot(x - 28, (y - 92) * 1.6) - (20 + n * 8);
        if (sea > 0) {
          rgb = sea < 1.5 ? P.foam : sea < 7 ? P.sh : sea < 16 ? (dither > 0.85 ? P.sh : P.deep) : (dither > 0.92 ? P.deep : P.deeper);
        } else if (sea > -4) {
          rgb = dither > 0.5 ? P.sand : P.sand2;
        } else if (river < 0) {
          rgb = river < -2 ? (dither > 0.8 ? P.foam : P.river) : P.riverD;
        } else if (river < 1.2) {
          rgb = P.bank;
        } else if (dSwamp < 0) {
          rgb = n > 0.55 ? P.swampW : dither > 0.5 ? P.swamp : P.swamp2;
        } else if (dField < 0) {
          rgb = (y % 3 === 0) ? P.field2 : P.field;
        } else if (y < mountainLine(x) + 9) {
          rgb = dither > 0.55 ? P.rockD : P.rock;
        } else {
          const v = n + (dither - 0.5) * 0.12;
          rgb = v < 0.38 ? P.g4 : v < 0.52 ? P.g1 : v < 0.66 ? P.g2 : P.g3;
        }
        const i = (y * MAP_W + x) * 4;
        img.data[i] = rgb[0]; img.data[i + 1] = rgb[1]; img.data[i + 2] = rgb[2]; img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const g = painter(c);

    // Гори: задній ряд (блідий), передній (насичений), сніжні шапки.
    const rnd = (i) => hash(i, 7, 11);
    for (let i = 0; i < 12; i++) {
      const x = -6 + i * 21 + rnd(i) * 8;
      if (x > 220) continue;
      g.tri(x, mountainLine(x) + 4, 18 + rnd(i + 3) * 6, 34 + rnd(i + 5) * 10, "#a9b3c0", "#8792a3", "#f2f5f7", 0.28);
    }
    for (let i = 0; i < 11; i++) {
      const x = 4 + i * 21 + rnd(i + 20) * 10;
      if (x > 214) continue;
      g.tri(x, mountainLine(x) + 16, 16 + rnd(i + 9) * 6, 28 + rnd(i + 2) * 8, "#9aa1a9", "#6d737c", "#ffffff", 0.24);
    }
    for (let i = 0; i < 5; i++) {
      const x = 262 + i * 22 + rnd(i + 40) * 8;
      g.tri(x, mountainLine(x) + 6, 14, 22 + rnd(i + 41) * 6, "#a9b3c0", "#8792a3", "#f2f5f7", 0.3);
    }

    // Дерева: густіше в лісах, ніколи — на воді, горах і біля локацій.
    const objects = [];
    const pts = Object.values(MAP_POINTS);
    for (let i = 0; i < 1400; i++) {
      const x = Math.floor(hash(i, 1, 31) * MAP_W);
      const y = Math.floor(hash(i, 2, 37) * MAP_H);
      const forestDensity = fbm(x / 30, y / 30, 4) + (Math.hypot(x - 126, y - 175) < 55 ? 0.25 : 0) + (x < 40 ? 0.15 : 0);
      if (forestDensity < 0.55) continue;
      if (x - seaEdge(y) > -6) continue;
      if (distToPolyline(x, y, RIVER) < 7) continue;
      if (y < mountainLine(x) + 22) continue;
      if (Math.hypot(x - 188, (y - 150) * 1.4) < 30) continue;
      if (Math.hypot(x - 28, (y - 92) * 1.6) < 24) continue;
      if (pts.some(([px, py]) => Math.abs(x - px) < 22 && y > py - 34 && y < py + 10)) continue;
      objects.push({ x, y, s: hash(i, 3, 5) > 0.5 ? PINE : PINE_LIGHT });
    }
    for (let i = 0; i < 90; i++) {
      const x = Math.floor(hash(i, 4, 13) * MAP_W);
      const y = Math.floor(hash(i, 5, 17) * MAP_H);
      if (x - seaEdge(y) > -6 || distToPolyline(x, y, RIVER) < 6 || y < mountainLine(x) + 20) continue;
      if (pts.some(([px, py]) => Math.abs(x - px) < 20 && Math.abs(y - py) < 20)) continue;
      objects.push({ x, y, s: BUSH });
    }
    objects.sort((a, b) => a.y - b.y).forEach((o) => g.sprite(o.s, o.x - (o.s.width >> 1), o.y - o.s.height));

    // Декоративні хмари по кутах, як на макеті.
    [[18, 246, 22, 9], [46, 250, 16, 7], [392, 10, 22, 8], [370, 4, 14, 6]].forEach(([x, y, rx, ry]) => {
      g.ellipse(x, y, rx, ry, "#e9f3fb");
      g.ellipse(x - 3, y - 2, rx - 6, ry - 3, "#ffffff");
    });

    // Човен у морі.
    g.r(372, 236, 10, 3, C.k); g.r(373, 236, 8, 2, C.wood);
    g.r(377, 226, 1, 10, C.woodD); g.tri(380, 235, 3, 8, "#f2f5f7", "#d4dbe2");
    return c;
  }

  /**
   * Малює карту. states[locId] = { progress: 0..1, locked: bool }
   */
  function renderMap(canvas, states, frame, worldId) {
    const w = worldArt(worldId);
    canvas.width = w.mapW;
    canvas.height = w.mapH;
    if (!w.terrainCache) w.terrainCache = w.buildTerrain();
    const g = painter(canvas);
    g.ctx.drawImage(w.terrainCache, 0, 0);
    const order = Object.keys(w.points).map(Number).sort((a, b) => w.points[a][1] - w.points[b][1]);
    order.forEach((id) => {
      const st = states[id] || { progress: 0, locked: true };
      const spr = landmark(id, st.progress, frame, st.locked, worldId);
      const [x, y] = w.points[id];
      const dy = w.landmarkDy[id] !== undefined ? w.landmarkDy[id] : 2;
      g.sprite(spr, x - Math.floor(spr.width / 2), y - spr.height + dy);
    });
    if (w.overlay) w.overlay(painter(canvas), states, frame);
  }

  /* ---------- сцени місій ---------- */

  const SCENE_W = 192, SCENE_H = 128;

  const BIOMES = {
    1:  { sky: ["#7fc3ec", "#d6eef9"], far: "#3d7a3a", ground: ["#4f9a3a", "#5aa843"], hills: "trees" },
    2:  { sky: ["#86c8ee", "#e2f2fa"], far: "#5a9a45", ground: ["#4f9a3a", "#67b64b"], hills: "hills" },
    3:  { sky: ["#6fb4dc", "#bfe3f2"], far: "#24592b", ground: ["#3f8530", "#4f9a3a"], hills: "trees" },
    4:  { sky: ["#1e1c24", "#3a3640"], far: "#2a2830", ground: ["#4a4650", "#5a5662"], hills: "stalactites" },
    5:  { sky: ["#f2b77a", "#fbe3bc"], far: "#8a8f99", ground: ["#8a8f96", "#a9adb3"], hills: "mountains" },
    6:  { sky: ["#8fa37e", "#c9d4b2"], far: "#3b4a2e", ground: ["#4a5a2e", "#56683a"], hills: "deadtrees" },
    7:  { sky: ["#7fc3ec", "#d6eef9"], far: "#6d8a9e", ground: ["#4f9a3a", "#5aa843"], hills: "chasm" },
    8:  { sky: ["#2a2018", "#4a3a2a"], far: "#3a2e24", ground: ["#5a4632", "#6b543c"], hills: "vault" },
    9:  { sky: ["#6aaee0", "#cfe8f7"], far: "#2a85c4", ground: ["#4f9a3a", "#5aa843"], hills: "sea" },
    10: {
      sky: ["#3c4250", "#6a7080"], solvedSky: ["#7fc3ec", "#e2f2fa"], cloud: "#4a505e", solvedCloud: "#ffffff",
      far: "#4a5060", ground: ["#8a8f96", "#a9adb3"], hills: "roof", landmarkY: 70,
      // На вершині вежі під хмарою видно дах вежі.
      before(g, dy) {
        g.r(84, 92 + dy, 80, 36, "#6d737c");
        for (let x = 84; x < 164; x += 8) g.r(x, 86 + dy, 5, 6, "#6d737c");
        g.r(84, 92 + dy, 80, 2, "#9aa1a9");
      },
    },
    11: { sky: ["#f2a65a", "#fde2a8"], far: "#7a9a5a", ground: ["#4f9a3a", "#67b64b"], hills: "hills" },
  };

  function lerpColor(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return "rgb(" + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",") + ")";
  }

  function drawBackdrop(g, biome, seedBase, solvedAll, H) {
    const sky = solvedAll && biome.solvedSky ? biome.solvedSky : biome.sky;
    const bands = 8;
    const horizon = H - 36;
    for (let i = 0; i < bands; i++) {
      g.r(0, Math.floor((i * horizon) / bands), SCENE_W, Math.ceil(horizon / bands) + 1, lerpColor(sky[0], sky[1], i / (bands - 1)));
    }
    const seed = seedBase * 13;
    if (biome.drawFar) biome.drawFar(g, horizon, H, seed);
    switch (biome.hills) {
      case "trees":
      case "deadtrees":
        for (let x = -6; x < SCENE_W + 6; x += 9) {
          const h = 20 + hash(x, 1, seed) * 18;
          if (biome.hills === "trees") g.tri(x, horizon + 2, 7, h, biome.far, biome.far);
          else { g.r(x, horizon - h, 2, h, biome.far); g.r(x - 3, horizon - h + 6, 7, 1, biome.far); }
        }
        break;
      case "hills":
        g.ellipse(30, horizon + 12, 50, 26, biome.far);
        g.ellipse(150, horizon + 14, 70, 30, lerpColor(biome.far, "#ffffff", 0.15));
        break;
      case "mountains":
        for (let i = 0; i < 6; i++) g.tri(i * 38 + 10, horizon + 2, 26, 40 + hash(i, 2, seed) * 20, "#a9b3c0", biome.far, "#f7f1e6", 0.25);
        break;
      case "stalactites":
        for (let x = 0; x < SCENE_W; x += 12) {
          const h = 8 + hash(x, 3, seed) * 18;
          for (let r = 0; r < h; r++) g.r(x + Math.floor(r / 3), r, Math.max(1, 8 - Math.floor((r * 8) / h)), 1, "#2a2830");
        }
        for (let i = 0; i < 14; i++) g.p(hash(i, 4, seed) * SCENE_W, 20 + hash(i, 5, seed) * 60, "#62d8ff");
        break;
      case "chasm":
        g.tri(40, horizon + 2, 40, 30, "#8fb0c4", biome.far);
        g.tri(150, horizon + 2, 50, 38, "#8fb0c4", biome.far);
        break;
      case "vault":
        for (let y = 0; y < horizon; y += 8) g.r(0, y, SCENE_W, 1, "#2a2018");
        for (let i = 0; i < 18; i++) g.r(hash(i, 6, seed) * SCENE_W, 60 + hash(i, 7, seed) * 30, 3, 2, "#b98a0f");
        break;
      case "sea":
        g.r(0, horizon - 14, SCENE_W, 16, biome.far);
        for (let i = 0; i < 20; i++) g.r(hash(i, 8, seed) * SCENE_W, horizon - 12 + hash(i, 9, seed) * 12, 4, 1, "#7fd0f0");
        break;
      case "roof":
        break;
      default:
        break;
    }
    // Хмаринки в небі (крім печер і скарбниці).
    if (!["stalactites", "vault"].includes(biome.hills) && !biome.noClouds) {
      const cloud = (solvedAll ? biome.solvedCloud : biome.cloud) || "#ffffff";
      g.ellipse(36, 16, 12, 4, cloud);
      g.ellipse(150, 24, 16, 5, cloud);
    }
    // Земля.
    g.r(0, horizon, SCENE_W, H - horizon, biome.ground[0]);
    for (let i = 0; i < 160; i++) {
      g.p(hash(i, 10, seed) * SCENE_W, horizon + hash(i, 11, seed) * (H - horizon), biome.ground[1]);
    }
    if (biome.drawGround) biome.drawGround(g, horizon, H, seed);
    if (biome.hills === "chasm") {
      g.r(96, horizon, 52, H - horizon, "#1c2430");
      g.r(96, horizon, 2, H - horizon, "#11161e");
      g.r(146, horizon, 2, H - horizon, "#11161e");
    }
    g.r(0, horizon, SCENE_W, 1, lerpColor(biome.ground[0], "#ffffff", 0.2));
  }

  /**
   * Сцена місії. progress — стан орієнтира (0..1), hero — чи малювати героя,
   * sparkle — фаза святкових іскор (0..1) або null.
   */
  function renderScene(canvas, locId, progress, opts) {
    const o = opts || {};
    canvas.width = SCENE_W;
    // Висоту сцени можна збільшити (більше неба) — усе прив'язано до низу.
    const H = Math.max(SCENE_H, Math.round(o.height || SCENE_H));
    const dy = H - SCENE_H;
    canvas.height = H;
    const g = painter(canvas);
    const biome = worldArt(o.world).biomes[locId];
    drawBackdrop(g, biome, locId, progress >= 1, H);
    const lm = landmark(locId, progress, o.frame || 0, false, o.world);
    const scale = Math.max(1, Math.min(3, Math.floor(104 / lm.height), Math.floor(118 / lm.width)));
    const lx = 124 - (lm.width * scale) / 2;
    const ly = (biome.landmarkY || 104) + dy - lm.height * scale;
    if (biome.before) biome.before(g, dy);
    g.sprite(lm, lx, ly, scale);
    if (o.hero !== false) {
      const hero = Art.hero();
      const bob = (o.frame || 0) % 2;
      g.sprite(hero, 26, 112 + dy - hero.height * 2 - bob, 2);
    }
    if (o.sparkle != null) {
      const t = o.sparkle;
      for (let i = 0; i < 26; i++) {
        const a = hash(i, 12, 3) * Math.PI * 2;
        const r = 10 + t * (30 + hash(i, 13, 3) * 40);
        const x = 124 + Math.cos(a) * r;
        const y = 60 + dy + Math.sin(a) * r * 0.7 - t * 10;
        if (hash(i, 14, Math.floor(t * 10)) > 0.3) g.r(x, y, 2, 2, i % 3 ? "#f7d23a" : "#ffffff");
      }
    }
  }

  /* ---------- 3D (воксельний) рельєф JS-світу ----------
     Та сама географія, що й на плоскій карті: море праворуч, річка,
     болото, поле, гори зі снігом на півночі, густий ліс посередині. */

  const JS_CELL = 6.25;

  // Гори — окремі вершини різної висоти вздовж півночі (сніг лише на верхівках).
  const JS_PEAKS = [];
  for (let k = 0; k < 11; k++) {
    JS_PEAKS.push([4 + k * 21 + hash(k, 1, 21) * 10, 10 + hash(k, 2, 21) * 22, 7 + hash(k, 3, 21) * 6]);
  }
  for (let k = 0; k < 5; k++) {
    JS_PEAKS.push([262 + k * 22 + hash(k, 4, 21) * 8, 4 + hash(k, 5, 21) * 8, 5 + hash(k, 6, 21) * 4]);
  }

  function jsMountain(x, y) {
    let best = 0;
    JS_PEAKS.forEach(([px, py, ph]) => {
      best = Math.max(best, ph - Math.hypot(x - px, (y - py) * 1.3) / 5.5);
    });
    return best;
  }

  function jsVoxelTile(i, j) {
    const x = i * JS_CELL + JS_CELL / 2, y = j * JS_CELL + JS_CELL / 2;
    const n = fbm(x / 38, y / 38, 1);
    const sea = x - seaEdge(y);
    if (sea > 7) return { type: "deep", h: 0 };
    if (sea > 0) return { type: "water", h: 0 };
    if (sea > -5) return { type: "sand", h: 1 };
    const river = distToPolyline(x, y, RIVER) - (5 + n * 2);
    if (river < 0) return { type: "water", h: 1 };
    if (Math.hypot(x - 188, (y - 150) * 1.4) - (24 + n * 8) < 0) return { type: "swamp", h: 1 };
    if (Math.hypot(x - 28, (y - 92) * 1.6) - (20 + n * 8) < 0) return { type: "field", h: 2 };
    const m = jsMountain(x, y) + (n - 0.5) * 1.5;
    if (m > 3.2) {
      const h = Math.round(m);
      return { type: h >= 9 ? "snow" : "rock", h };
    }
    const forest = Math.hypot(x - 126, y - 175) < 55;
    return { type: forest ? "forest" : "grass", h: 2 + (n > 0.55 ? 1 : 0) + (n > 0.68 ? 1 : 0) };
  }

  function jsVoxelTrees() {
    const trees = [];
    for (let i = 0; i < 900; i++) {
      const x = Math.floor(hash(i, 1, 31) * MAP_W);
      const y = Math.floor(hash(i, 2, 37) * MAP_H);
      const density = fbm(x / 30, y / 30, 4) + (Math.hypot(x - 126, y - 175) < 55 ? 0.25 : 0) + (x < 40 ? 0.15 : 0);
      if (density < 0.58) continue;
      if (x - seaEdge(y) > -6 || distToPolyline(x, y, RIVER) < 7 || jsMountain(x, y) > 2.6) continue;
      if (Math.hypot(x - 188, (y - 150) * 1.4) < 30 || Math.hypot(x - 28, (y - 92) * 1.6) < 24) continue;
      trees.push([x, y, hash(i, 3, 5) > 0.5 ? PINE : PINE_LIGHT]);
    }
    return trees;
  }

  registerWorld("js", {
    mapW: MAP_W,
    mapH: MAP_H,
    points: MAP_POINTS,
    buildTerrain,
    voxel: {
      cols: MAP_W / JS_CELL,
      rows: MAP_H / JS_CELL,
      cell: JS_CELL,
      tile: jsVoxelTile,
      trees: jsVoxelTrees(),
      sky: ["#6fb6e0", "#c4e8f8"],
      // «Вершина вежі» в 3D — нагорі самої вежі.
      points: { 10: [318, 164] },
      lift: { 10: 64 },
      labelPos: { 10: { dx: -14, dy: -10, align: "right" } },
      // Живі ефекти локацій.
      fx: { 1: "smoke", 2: "sparkle", 3: "leaves", 4: "sparkle", 5: "beam", 6: "bubbles", 7: "sparkle", 8: "gold", 9: "smoke", 10: "storm", 11: "fireworks" },
    },
    landmarks: LANDMARKS,
    biomes: BIOMES,
    // Хмара «Вершини» висить вище, щоб не накривати героя на даху вежі.
    landmarkDy: { 10: -10 },
    labelPos: { 8: { dx: 0, dy: 4 }, 10: { dx: -14, dy: 8, align: "right" } },
    // На «Вершині вежі» герой стоїть прямо на даху вежі.
    heroSpot: { 10: { dx: -8, dy: 14 } },
    pathDy: { 10: -6 },
  });

  /* ---------- публічний API ---------- */

  const Art = {
    hero: () => cached("hero", () => gridSprite(HERO_ROWS, HERO_PALETTE)),
    mentor: () => cached("mentor", () => gridSprite(MENTOR_ROWS, MENTOR_PALETTE)),
    item: (name) => cached("item:" + name, () => gridSprite(ITEMS[name], ITEM_PALETTE)),
    addItems(items) { Object.assign(ITEMS, items); },
    registerWorld,
    world: worldArt,
    landmark,
    renderMap,
    renderScene,
    // Інструменти для файлів з артом інших світів (наприклад, art-web.js).
    kit: {
      makeCanvas, painter, gridSprite, dimmed, hash, smoothNoise, fbm, hexToRgb, lerpColor, distToPolyline,
      C, PINE, PINE_LIGHT, BUSH, bigPine, drawFire, drawTorch, drawFlag, ITEM_PALETTE, SCENE_W, SCENE_H,
    },
    // Вставляє спрайт у звичайний <canvas> елемент сторінки.
    mount(target, sprite, title) {
      const c = makeCanvas(sprite.width, sprite.height);
      c.getContext("2d").drawImage(sprite, 0, 0);
      c.className = "pixel";
      c.setAttribute("role", title ? "img" : "presentation");
      if (title) c.setAttribute("aria-label", title);
      target.appendChild(c);
      return c;
    },
  };

  window.Art = Art;
})();
