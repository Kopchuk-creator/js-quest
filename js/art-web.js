/* =========================================================
   art-web.js — світ «Острів будівельників» (HTML і CSS).
   Тропічний острів, на якому з кожною місією з риштування
   виростають будівлі: причал, квартал, ринок, фарбарня,
   кузня, доки, місто-сітка й маяк.
   ========================================================= */
(function () {
  "use strict";

  const { painter, gridSprite, hash, fbm, distToPolyline, C } = Art.kit;

  /* ---------- предмети-трофеї (12×12) ---------- */

  Art.addItems({
    brick: [
      "............",
      "............",
      "kkkkkkkkkkkk",
      "krrrrrrrrrRk",
      "krrwrrrrwrRk",
      "krwrrrrrrwRk",
      "krrwrrrrwrRk",
      "kRRRRRRRRRRk",
      "kkkkkkkkkkkk",
      "............",
      "............",
      "............",
    ],
    sign: [
      "kkkkkkkkkkkk",
      "kttttttttttk",
      "ktqqqqqqqqtk",
      "ktqQQQQQqqtk",
      "ktqqqqqqqqtk",
      "ktqQQQqqqqtk",
      "kttttttttttk",
      "kkkkkTTkkkkk",
      ".....TT.....",
      ".....TT.....",
      "....kTTk....",
      "....kkkk....",
    ],
    quill: [
      "..........kk",
      ".........kwk",
      "........kwgk",
      ".......kwgk.",
      "......kwgk..",
      ".....kwgk...",
      "....kwgk....",
      "...kggk.....",
      "..kGk.......",
      ".kGk..kkkk..",
      "kGk..kBBBBk.",
      "kk...kkkkkk.",
    ],
    brush: [
      "........kkk.",
      ".......kRrk.",
      "......kRrrk.",
      "......krrk..",
      ".....kggk...",
      "....kggk....",
      "...ktTk.....",
      "..ktTk......",
      ".ktTk.......",
      "ktTk........",
      "kTk.........",
      "kk..........",
    ],
    crate: [
      "kkkkkkkkkkkk",
      "kYYYYYYYYYYk",
      "kYkkkkkkkkYk",
      "kYkbbbbbbkYk",
      "kYkbccccbkYk",
      "kYkbccccbkYk",
      "kYkbccccbkYk",
      "kYkbccccbkYk",
      "kYkbbbbbbkYk",
      "kYkkkkkkkkYk",
      "kYYYYYYYYYYk",
      "kkkkkkkkkkkk",
    ],
    anchor: [
      ".....GG.....",
      "....GggG....",
      ".....GG.....",
      "...GGGGGG...",
      ".....GG.....",
      ".....GG.....",
      ".....GG.....",
      "G....GG....G",
      "GG...GG...GG",
      ".GG..GG..GG.",
      "..GGGGGGGG..",
      "....GGGG....",
    ],
    blueprint: [
      "kkkkkkkkkkkk",
      "kbbbcbbbcbbk",
      "kbbbcbbbcbbk",
      "kcccccccccck",
      "kbbbcbbbcbbk",
      "kbbbcbbbcbbk",
      "kcccccccccck",
      "kbbbcbbbcbbk",
      "kbbbcbbbcbbk",
      "kkkkkkkkkkkk",
      "............",
      "............",
    ],
    lens: [
      "....kkkk....",
      "..kkYYYYkk..",
      ".kYyccccyYk.",
      ".kYcwccccYk.",
      "kYcwcccccCYk",
      "kYcccccccCYk",
      "kYccccccCCYk",
      "kYcccccCCCYk",
      ".kYcCCCCCYk.",
      ".kYyCCCCyYk.",
      "..kkYYYYkk..",
      "....kkkk....",
    ],
  });

  /* ---------- малі об'єкти ---------- */

  const PALM = gridSprite(
    [
      "..kk...kk..",
      ".kaak.kaak.",
      "kaabakkbaak",
      ".k.kaaak.k.",
      "...kabak...",
      "..k.ktk.k..",
      ".....tk....",
      ".....kt....",
      ".....tk....",
      "....kt.....",
      "....tk.....",
      "...kkkk....",
    ],
    { k: "#1d4a29", a: "#4aa043", b: "#2f7d3a", t: "#8a5a2e" }
  );
  const SHRUB = gridSprite(
    [".kkk.", "kafak", "kaaak", ".kkk."],
    { k: "#1f4a22", a: "#4aa043", f: "#ff8fc0" }
  );

  // Риштування для недобудованої частини будівлі.
  function scaffold(g, x, y, w, h) {
    const wood = "#b07a44", woodD = "#6e4728";
    for (let i = 0; i <= w; i += 6) g.r(x + i, y, 1, h, wood);
    for (let j = 0; j <= h; j += 6) g.r(x, y + j, w + 1, 1, woodD);
    for (let i = 0; i < Math.min(w, h); i += 2) g.p(x + i, y + h - i - 1, woodD);
  }

  function house(g, x, baseY, w, h, wall, roof, done) {
    g.r(x - 1, baseY - h - 1, w + 2, h + 1, C.k);
    g.r(x, baseY - h, w, h, wall);
    g.r(x, baseY - h, Math.ceil(w / 2), h, Art.kit.lerpColor(wall, "#ffffff", 0.12));
    g.tri(x + w / 2, baseY - h + 1, w / 2 + 2, Math.round(w / 2.2) + 1, C.k, C.k);
    g.tri(x + w / 2, baseY - h, w / 2 + 1, Math.round(w / 2.2), roof, Art.kit.lerpColor(roof, "#000000", 0.25));
    g.r(x + Math.floor(w / 2) - 1, baseY - 5, 3, 5, C.woodD);
    if (done) g.r(x + 1, baseY - h + 2, 2, 2, C.gold);
  }

  /* ---------- орієнтири локацій ---------- */

  const LANDMARKS = {
    // 1. Причал тегів: дошки настилу додаються, з'являються ящики-теги, кран і корабель.
    1: { w: 44, h: 30, draw(g, p, f) {
      g.r(0, 22, 44, 8, "#2a85c4");
      for (let i = 0; i < 6; i++) g.r(3 + i * 7 + (f % 2), 25 + (i % 2), 3, 1, "#7fd0f0");
      const planks = Math.max(1, Math.round(p * 8));
      for (let i = 0; i < 8; i++) {
        const x = 4 + i * 4;
        if (i < planks) { g.r(x, 18, 4, 4, C.k); g.r(x, 18, 3, 3, C.woodL); }
        g.r(x + 1, 22, 1, 6, C.woodD);
      }
      if (p >= 0.25) { g.r(6, 12, 7, 6, C.k); g.r(7, 13, 5, 4, C.wood); g.p(8, 15, "#ffffff"); g.p(10, 14, "#ffffff"); }
      if (p >= 0.5) { g.r(14, 13, 6, 5, C.k); g.r(15, 14, 4, 3, "#e8663d"); }
      if (p >= 0.75) { g.r(30, 2, 2, 16, C.woodD); g.r(22, 2, 10, 2, C.woodD); g.r(23, 4, 1, 6, "#9aa1a9"); g.r(22, 10, 3, 2, "#f7d23a"); }
      else scaffold(g, 28, 6, 8, 12);
      if (p >= 1) {
        g.r(33, 20, 11, 4, C.k); g.r(34, 20, 9, 3, C.woodD);
        g.r(38, 9, 1, 11, C.woodD); g.tri(41, 19, 3, 9, "#f2f5f7", "#d4dbe2");
      }
    } },

    // 2. Квартал семантики: будинки з вивісками виростають по одному.
    2: { w: 44, h: 34, draw(g, p) {
      g.r(0, 30, 44, 4, "#b5bbc2");
      const built = Math.round(p * 3);
      const spots = [[2, 30, 12, 14, "#f2c79a", "#e0503c"], [16, 30, 12, 18, "#e8c97e", "#3f78b5"], [30, 30, 12, 12, "#f3eee2", "#5aa843"]];
      spots.forEach(([x, by, w, h, wall, roof], i) => {
        if (i < built) {
          house(g, x, by, w, h, wall, roof, p >= 1);
          g.r(x + 1, by - h + 4, w - 2, 2, ["#5ee0a0", "#f7d23a", "#7cb7ff"][i]);
        } else scaffold(g, x, by - h, w, h);
      });
    } },

    // 3. Ринок форм: намети з'являються, у фіналі — прапорці.
    3: { w: 44, h: 30, draw(g, p, f) {
      g.r(0, 26, 44, 4, "#d6c27e");
      const stalls = Math.round(p * 3);
      [[2, "#e0503c"], [16, "#3f78b5"], [30, "#f7d23a"]].forEach(([x, color], i) => {
        if (i < stalls) {
          g.r(x, 18, 12, 8, C.k); g.r(x + 1, 19, 10, 7, C.cloth);
          g.r(x - 1, 13, 14, 5, C.k);
          for (let s = 0; s < 12; s += 2) g.r(x + s, 14, 2, 3, s % 4 ? "#ffffff" : color);
          g.r(x + 2, 21, 3, 2, ["#c08a52", "#9aa1a9", "#5aa843"][i]);
        } else scaffold(g, x, 14, 12, 12);
      });
      if (p >= 1) {
        for (let i = 0; i < 6; i++) g.r(3 + i * 7, 8 + ((i + f) % 2), 3, 3, ["#e0503c", "#f7d23a", "#5ee0a0"][i % 3]);
        g.r(0, 9, 44, 1, C.woodD);
      }
    } },

    // 4. Фарбарня: на стіні проступають кольорові смуги, біля входу — бочки фарби.
    4: { w: 40, h: 34, draw(g, p) {
      house(g, 4, 32, 30, 20, "#f3eee2", "#9a6234", p >= 1);
      const stripes = Math.round(p * 5);
      ["#e0503c", "#f7a33a", "#f7d23a", "#5aa843", "#3f78b5"].forEach((c, i) => {
        if (i < stripes) g.r(7 + i * 5, 17, 4, 9, c);
        else g.r(7 + i * 5, 17, 4, 9, "#d8d2c4");
      });
      [[0, "#e0503c"], [34, "#3f78b5"]].forEach(([x, c]) => { g.r(x, 26, 6, 6, C.k); g.r(x + 1, 27, 4, 5, C.wood); g.r(x + 1, 27, 4, 1, c); });
    } },

    // 5. Кузня коробок: вкладені рамки (margin/border/padding) і труба з вогнем.
    5: { w: 40, h: 36, draw(g, p, f) {
      g.r(4, 14, 32, 20, C.k);
      g.r(5, 15, 30, 19, "#6d737c");
      const rings = Math.round(p * 3);
      const colors = ["#f7a33a", "#1b1612", "#62d8ff"];
      for (let i = 0; i < 3; i++) {
        const inset = 3 + i * 3;
        const col = i < rings ? colors[i] : "#575c64";
        g.r(5 + inset, 15 + inset, 30 - inset * 2, 1, col);
        g.r(5 + inset, 33 - inset, 30 - inset * 2, 1, col);
        g.r(5 + inset, 15 + inset, 1, 19 - inset * 2, col);
        g.r(34 - inset, 15 + inset, 1, 19 - inset * 2, col);
      }
      g.r(26, 2, 6, 13, C.k); g.r(27, 3, 4, 12, "#9aa1a9");
      if (p > 0) { g.r(27, 0, 4, 3, f % 2 ? C.fire1 : C.fire2); }
      if (p >= 1) g.r(18, 22, 4, 4, f % 2 ? "#fff6c8" : C.gold);
      g.r(0, 30, 6, 4, "#3a3e48");
    } },

    // 6. Флекс-доки: човни вишиковуються рівним рядом.
    6: { w: 44, h: 26, draw(g, p, f) {
      g.r(0, 14, 44, 12, "#2a85c4");
      g.r(0, 12, 44, 3, C.k); g.r(0, 12, 44, 2, C.woodL);
      const boats = Math.round(p * 4);
      for (let i = 0; i < 4; i++) {
        const x = 2 + i * 11;
        if (i < boats) {
          const bob = (f + i) % 2;
          g.r(x, 18 + bob, 8, 3, C.k); g.r(x + 1, 18 + bob, 6, 2, ["#e0503c", "#f7d23a", "#5ee0a0", "#7cb7ff"][i]);
          g.r(x + 4, 10 + bob, 1, 8, C.woodD);
        } else {
          // Човен, що ще не став у ряд, дрейфує криво.
          g.r(x + (i % 2 ? 2 : -1), 21 + (i % 2), 6, 2, "#6d737c");
        }
      }
      for (let i = 0; i < 5; i++) g.r(1 + i * 10, 24, 3, 1, "#7fd0f0");
    } },

    // 7. Гридбург: сітка 3×3 будинків заповнюється клітинка за клітинкою.
    7: { w: 42, h: 36, draw(g, p) {
      g.r(0, 6, 42, 30, "#b5bbc2");
      const filled = Math.round(p * 9);
      for (let n = 0; n < 9; n++) {
        const cx = 2 + (n % 3) * 13, cy = 34 - Math.floor(n / 3) * 10;
        if (n < filled) house(g, cx, cy, 11, 7, ["#f2c79a", "#e8c97e", "#f3eee2"][n % 3], ["#e0503c", "#3f78b5", "#5aa843"][(n + 1) % 3], p >= 1);
        else { g.r(cx, cy - 2, 11, 2, "#8a9099"); g.p(cx + 5, cy - 3, "#c08a52"); }
      }
    } },

    // 8. Маяк: вежа росте сегментами, у фіналі — світло й промені.
    8: { w: 28, h: 64, draw(g, p, f) {
      g.r(2, 56, 24, 8, C.k); g.r(3, 57, 22, 7, "#6d737c");
      const segments = Math.max(1, Math.round(p * 5));
      for (let s = 0; s < 5; s++) {
        const y = 48 - s * 8;
        if (s < segments) {
          g.r(8, y, 12, 8, C.k);
          g.r(9, y, 10, 8, s % 2 ? "#e0503c" : "#f2f5f7");
        } else scaffold(g, 8, y, 12, 8);
      }
      if (p >= 1) {
        g.r(6, 4, 16, 4, C.k); g.r(7, 5, 14, 2, "#5e3a1c");
        g.r(9, 8, 10, 2, C.k);
        g.r(10, 0, 8, 5, C.k); g.r(11, 1, 6, 3, f % 2 ? "#fff6c8" : C.gold);
      }
    } },
  };

  /* ---------- біоми сцен ---------- */

  const sea = (g, horizon, H, seed) => {
    g.r(0, horizon - 10, 192, 12, "#2a85c4");
    for (let i = 0; i < 16; i++) g.r(hash(i, 8, seed) * 192, horizon - 9 + hash(i, 9, seed) * 9, 4, 1, "#7fd0f0");
  };
  const palms = (g, horizon, H, seed) => {
    [12, 170].forEach((x, i) => g.sprite(PALM, x + hash(i, 2, seed) * 6, horizon - PALM.height + 2));
  };

  const BIOMES = {
    1: { sky: ["#6fc2ee", "#d6f0fb"], far: "#2a85c4", ground: ["#e2cf8e", "#d6c27e"], hills: "sea", drawGround: palms },
    2: { sky: ["#86c8ee", "#e2f2fa"], far: "#5a9a45", ground: ["#b5bbc2", "#a9b0b8"], hills: "hills" },
    3: { sky: ["#7fc3ec", "#f2eecf"], far: "#5aa843", ground: ["#d6c27e", "#e2cf8e"], hills: "hills", drawGround: palms },
    4: { sky: ["#f2b77a", "#fde2a8"], far: "#7a9a5a", ground: ["#5aa843", "#67b64b"], hills: "trees" },
    5: { sky: ["#3a3640", "#6a5a4e"], far: "#2a2830", ground: ["#4a4650", "#5a5662"], hills: "stalactites", noClouds: true },
    6: { sky: ["#6aaee0", "#cfe8f7"], far: "#2a85c4", ground: ["#9a6234", "#c08a52"], hills: "sea" },
    7: { sky: ["#86c8ee", "#e2f2fa"], far: "#8a9099", ground: ["#b5bbc2", "#c1c6cc"], hills: "hills" },
    8: { sky: ["#1f3a5a", "#f2a65a"], far: "#2a85c4", ground: ["#6d737c", "#8a9099"], hills: "sea", drawFar: sea },
  };

  /* ---------- 3D-острів ---------- */

  const MAP_W = 400, MAP_H = 250, CELL = 6.25;

  const POINTS = {
    1: [80, 192], 2: [112, 140], 3: [152, 92], 4: [214, 70],
    5: [206, 140], 6: [262, 188], 7: [292, 124], 8: [340, 62],
  };
  const ROUTE = Object.keys(POINTS).map((k) => POINTS[k]);

  const ell = (x, y, cx, cy, rx, ry) => Math.hypot((x - cx) / rx, (y - cy) / ry);

  function tile(i, j) {
    const x = i * CELL + CELL / 2, y = j * CELL + CELL / 2;
    const n = fbm(x / 34, y / 34, 7);
    const wobble = (n - 0.5) * 0.18;
    let d = Math.min(ell(x, y, 200, 130, 165, 102), ell(x, y, 340, 62, 42, 30)) + wobble;
    if (ell(x, y, 272, 236, 42, 30) < 1) d = Math.max(d, 1.08); // бухта біля доків
    if (d > 1.14) return { type: "deep", h: 0 };
    if (d > 1.0) return { type: "water", h: 0 };
    if (d > 0.92) return { type: "sand", h: 1 };
    // Скелястий мис під маяком.
    if (ell(x, y, 340, 62, 42, 30) < 0.95) return { type: "rock", h: 5 + (n > 0.55 ? 1 : 0) };
    // Пагорби на північному заході.
    const hill = 6.5 - Math.hypot(x - 110, (y - 62) * 1.2) / 9;
    if (hill > 2.6) return { type: hill > 5.2 ? "forest" : "grass", h: Math.round(hill) };
    // Бруківка вздовж маршруту.
    if (distToPolyline(x, y, ROUTE) < 4.5) return { type: "plaza", h: 2 };
    return { type: "grass", h: 2 + (n > 0.62 ? 1 : 0) };
  }

  function trees() {
    const out = [];
    for (let i = 0; i < 260; i++) {
      const x = hash(i, 1, 41) * MAP_W, y = hash(i, 2, 43) * MAP_H;
      const d = ell(x, y, 200, 130, 165, 102);
      if (d > 0.9 || distToPolyline(x, y, ROUTE) < 9) continue;
      if (Object.values(POINTS).some(([px, py]) => Math.hypot(x - px, y - py) < 20)) continue;
      out.push([x, y, hash(i, 3, 41) > 0.35 ? PALM : SHRUB]);
    }
    return out;
  }

  Art.registerWorld("web", {
    mapW: MAP_W,
    mapH: MAP_H,
    points: POINTS,
    landmarks: LANDMARKS,
    biomes: BIOMES,
    buildTerrain() {
      // Пласка карта цьому світу не потрібна (є 3D), але лишаємо заглушку.
      const c = Art.kit.makeCanvas(MAP_W, MAP_H);
      painter(c).r(0, 0, MAP_W, MAP_H, "#2a85c4");
      return c;
    },
    voxel: {
      cols: MAP_W / CELL,
      rows: MAP_H / CELL,
      cell: CELL,
      tile,
      trees: trees(),
      sky: ["#4fb0e6", "#bfeaf9"],
      groundType: "plaza",
      fx: { 1: "sparkle", 2: "gold", 3: "gold", 4: "paint", 5: "smoke", 6: "sparkle", 7: "gold", 8: "lighthouse" },
    },
  });
})();
