/* =========================================================
   art-web.js — світ «Острів будівельників» (HTML і CSS).
   Тропічний острів, на якому з кожною місією з риштування
   виростають будівлі: квартал, фарбарня, доки, місто-сітка,
   маяк, майстерня, ярмарок, сад, вітряк, бібліотека,
   обсерваторія й гранд-готель «Люм'єр».
   ========================================================= */
(function () {
  "use strict";

  const { painter, gridSprite, hash, C } = Art.kit;

  /* ---------- предмети-трофеї (12×12) ---------- */

  Art.addItems({
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
    palette: [
      "...kkkkkk...",
      ".kkqqqqqqkk.",
      "kqqrrqqyyqqk",
      "kqqrrqqyyqqk",
      "kqqqqqqqqqqk",
      "kqmmqqqqbbqk",
      "kqmmqqqqbbqk",
      "kqqqqqkkqqqk",
      ".kqqqk..kqk.",
      "..kqqk..kqk.",
      "...kkk...k..",
      "............",
    ],
    balloon: [
      "...kkkkkk...",
      "..krrrrrwk..",
      ".krrrrrrrwk.",
      ".krrrrrrrrk.",
      ".kRrrrrrrrk.",
      ".kRRrrrrrRk.",
      "..kRRrrrRk..",
      "...kRRRRk...",
      "....k..k....",
      "....k..k....",
      "...kttttk...",
      "...kTTTTk...",
    ],
    flower: [
      "....kkkk....",
      "...krrrrk...",
      "..krrwrrrk..",
      "..krryyrrk..",
      "..krryyrrk..",
      "...krrrrk...",
      "....kkkk....",
      ".....km.....",
      "..kk.km.kk..",
      ".kmmkkmkmmk.",
      "..kkkmmkkk..",
      ".....kk.....",
    ],
    bolt: [
      "......kkkk..",
      ".....kyyyk..",
      "....kyyyk...",
      "...kyyyk....",
      "..kyyyykkk..",
      ".kyyyyyyyk..",
      "..kkkyyyk...",
      "....kyyk....",
      "...kyyk.....",
      "..kyyk......",
      "..kyk.......",
      "..kk........",
    ],
    book: [
      "............",
      ".kkkkkkkkkk.",
      "kbbbbkkbbbbk",
      "kbwwbkkbwwbk",
      "kbbbbkkbbbbk",
      "kbwwbkkbwwbk",
      "kbbbbkkbbbbk",
      "kbbbbkkbbbbk",
      "kBBBBkkBBBBk",
      "kqqqqkkqqqqk",
      ".kkkkkkkkkk.",
      "............",
    ],
    star: [
      ".....kk.....",
      "....kyyk....",
      "....kyyk....",
      "kkkkkyykkkkk",
      "kyyyyyyyyyyk",
      ".kyyywyyyyk.",
      "..kyyyyyyk..",
      "..kyyyyyyk..",
      ".kyyykkyyyk.",
      ".kyyk..kyyk.",
      "kyyk....kyyk",
      "kkk......kkk",
    ],
    bell: [
      ".....kk.....",
      "....kyyk....",
      "...kkkkkk...",
      "..kyyyyyyk..",
      "..kywyyyyk..",
      "..kywyyyyk..",
      ".kyyyyyyyyk.",
      ".kyyyyyyyyk.",
      "kYYYYYYYYYYk",
      "kkkkkkkkkkkk",
      ".....kk.....",
      ".....kk.....",
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
    // 1. Квартал семантики: будинки з вивісками виростають по одному.
    1: { w: 44, h: 34, draw(g, p) {
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

    // 2. Фарбарня селекторів: на стіні проступають кольорові смуги, біля входу — бочки фарби.
    2: { w: 40, h: 34, draw(g, p) {
      house(g, 4, 32, 30, 20, "#f3eee2", "#9a6234", p >= 1);
      const stripes = Math.round(p * 5);
      ["#e0503c", "#f7a33a", "#f7d23a", "#5aa843", "#3f78b5"].forEach((c, i) => {
        g.r(7 + i * 5, 17, 4, 9, i < stripes ? c : "#d8d2c4");
      });
      [[0, "#e0503c"], [34, "#3f78b5"]].forEach(([x, c]) => { g.r(x, 26, 6, 6, C.k); g.r(x + 1, 27, 4, 5, C.wood); g.r(x + 1, 27, 4, 1, c); });
    } },

    // 3. Флекс-доки: човни вишиковуються рівним рядом.
    3: { w: 44, h: 26, draw(g, p, f) {
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

    // 4. Гридбург: сітка 3×3 будинків заповнюється клітинка за клітинкою.
    4: { w: 42, h: 36, draw(g, p) {
      g.r(0, 6, 42, 30, "#b5bbc2");
      const filled = Math.round(p * 9);
      for (let n = 0; n < 9; n++) {
        const cx = 2 + (n % 3) * 13, cy = 34 - Math.floor(n / 3) * 10;
        if (n < filled) house(g, cx, cy, 11, 7, ["#f2c79a", "#e8c97e", "#f3eee2"][n % 3], ["#e0503c", "#3f78b5", "#5aa843"][(n + 1) % 3], p >= 1);
        else { g.r(cx, cy - 2, 11, 2, "#8a9099"); g.p(cx + 5, cy - 3, "#c08a52"); }
      }
    } },

    // 5. Маяк адаптивності: вежа росте сегментами, у фіналі — світло.
    5: { w: 28, h: 64, draw(g, p, f) {
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

    // 6. Палітрова майстерня: на мольберті з'являються мазки, у фіналі — ще й веселка на даху.
    6: { w: 42, h: 34, draw(g, p) {
      house(g, 2, 32, 22, 16, "#f3eee2", "#c4472a", p >= 1);
      g.r(6, 22, 6, 5, C.k); g.r(7, 23, 4, 3, "#9fd3f0");
      g.r(29, 22, 1, 11, C.woodD); g.r(38, 22, 1, 11, C.woodD); g.r(33, 22, 1, 9, C.woodD);
      g.r(27, 10, 14, 13, C.k); g.r(28, 11, 12, 11, "#ffffff");
      const dabs = Math.round(p * 4);
      ["#e0503c", "#f7d23a", "#5aa843", "#3f78b5"].forEach((c, i) => {
        if (i < dabs) g.r(29 + (i % 2) * 6, 12 + Math.floor(i / 2) * 5, 4, 4, c);
      });
      if (p >= 1) ["#e0503c", "#f7a33a", "#f7d23a", "#5aa843", "#3f78b5"].forEach((c, i) => g.r(6 + i * 3, 4 + i, 3, 2, c));
    } },

    // 7. Ярмарок анімацій: намет-карусель, повітряна куля злітає вище з кожною місією.
    7: { w: 44, h: 42, draw(g, p, f) {
      g.r(0, 38, 44, 4, "#d6c27e");
      if (p >= 0.4) {
        g.r(6, 26, 24, 12, C.k); g.r(7, 27, 22, 11, "#ffffff");
        for (let s = 0; s < 22; s += 4) g.r(7 + s, 27, 2, 11, "#e0503c");
        g.r(16, 31, 4, 7, C.k);
        g.tri(18, 27, 14, 10, "#e0503c", "#962a1f");
        g.r(18, 14, 1, 4, C.woodD); g.r(19, 14, 3, 2, C.gold);
      } else scaffold(g, 6, 22, 24, 16);
      if (p > 0) {
        const by = Math.round(26 - p * 22) + (f % 2);
        g.r(33, by, 9, 8, C.k); g.r(34, by + 1, 7, 6, "#e0503c"); g.r(35, by + 1, 2, 4, "#ff8a76");
        g.p(35, by + 8, C.k); g.p(40, by + 8, C.k); g.p(35, by + 9, C.k); g.p(40, by + 9, C.k);
        g.r(35, by + 10, 6, 3, C.k); g.r(36, by + 10, 4, 2, C.wood);
      }
      if (p >= 1) {
        g.r(0, 6, 30, 1, C.woodD);
        for (let i = 0; i < 5; i++) g.r(1 + i * 6, 7 + ((i + f) % 2), 3, 3, ["#e0503c", "#f7d23a", "#5ee0a0", "#7cb7ff", "#ff8fc0"][i]);
      }
    } },

    // 8. Сад доступності: клумби розквітають, у фіналі — пандус і лавка.
    8: { w: 44, h: 28, draw(g, p) {
      g.r(0, 20, 44, 8, "#5aa843");
      g.r(0, 25, 44, 3, "#e2cf8e");
      const blooms = Math.round(p * 4);
      for (let i = 0; i < 4; i++) {
        const x = 2 + i * 10;
        g.r(x, 15, 8, 6, C.k); g.r(x + 1, 16, 6, 4, "#7a5230");
        if (i < blooms) {
          const col = ["#ff8fc0", "#f7d23a", "#ffffff", "#b07cff"][i];
          g.r(x + 2, 12, 1, 4, "#2f7d3a"); g.r(x + 5, 11, 1, 5, "#2f7d3a");
          g.r(x + 1, 10, 3, 3, col); g.r(x + 4, 9, 3, 3, col);
          g.p(x + 2, 11, "#f7d23a"); g.p(x + 5, 10, "#f7d23a");
        } else g.p(x + 3, 15, "#3f8530");
      }
      if (p >= 1) {
        for (let i = 0; i < 6; i++) g.r(30 + i * 2, 23 - i, 2, 1 + i, "#c1c6cc");
        g.r(2, 22, 10, 2, C.woodD); g.r(2, 24, 1, 2, C.woodD); g.r(11, 24, 1, 2, C.woodD);
      }
    } },

    // 9. Вітряки швидкості: вітрила додаються, лопаті крутяться.
    9: { w: 34, h: 48, draw(g, p, f) {
      for (let y = 16; y < 46; y++) {
        const half = 5 + Math.floor((y - 16) / 6);
        g.r(16 - half, y, half * 2 + 2, 1, C.k);
        g.r(17 - half, y, half * 2, 1, (y >> 2) % 2 ? "#f3eee2" : "#e2d8c4");
      }
      g.r(15, 39, 4, 7, C.woodD);
      g.r(10, 10, 14, 7, C.k); g.r(11, 11, 12, 5, C.wood);
      const sails = Math.max(1, Math.round(p * 4));
      const a0 = p > 0 ? f * 0.4 : 0.35;
      for (let k = 0; k < 4; k++) {
        const a = a0 + (k * Math.PI) / 2;
        const nx = Math.cos(a + Math.PI / 2), ny = Math.sin(a + Math.PI / 2);
        for (let r = 2; r < 15; r++) {
          const x = 17 + Math.cos(a) * r, y = 13 + Math.sin(a) * r;
          if (k < sails && r > 4) {
            g.p(Math.round(x + nx), Math.round(y + ny), "#ffffff");
            g.p(Math.round(x + nx * 2), Math.round(y + ny * 2), "#e2d8c4");
          }
          g.p(Math.round(x), Math.round(y), C.woodD);
        }
      }
      g.r(16, 12, 3, 3, C.k);
    } },

    // 10. Бібліотека порядку: полиці між колонами заповнюються книжками.
    10: { w: 44, h: 38, draw(g, p) {
      g.r(2, 32, 40, 6, C.k); g.r(3, 33, 38, 2, "#c1c6cc"); g.r(3, 35, 38, 2, "#b5bbc2");
      g.r(4, 14, 36, 18, C.k); g.r(5, 15, 34, 17, "#f3eee2");
      g.tri(22, 14, 20, 9, "#d8d2c4", "#b5a888");
      const filled = Math.round(p * 4);
      for (let i = 0; i < 5; i++) g.r(5 + i * 8, 15, 2, 17, "#d8d2c4");
      for (let i = 0; i < 4; i++) {
        const x = 8 + i * 8;
        for (let row = 0; row < 3; row++) {
          const y = 17 + row * 5;
          g.r(x, y + 3, 5, 1, C.woodD);
          if (i < filled) for (let b = 0; b < 5; b++) g.r(x + b, y + (b % 2), 1, 3 - (b % 2), ["#e0503c", "#3f78b5", "#5aa843", "#f7d23a", "#9a6234"][(i + b + row) % 5]);
        }
      }
      if (p >= 1) { g.r(19, 8, 6, 4, C.k); g.r(20, 9, 4, 2, C.gold); }
    } },

    // 11. Обсерваторія нового CSS: телескоп висувається, у фіналі — зорі.
    11: { w: 40, h: 40, draw(g, p, f) {
      g.ellipse(20, 24, 13, 12, C.k);
      g.ellipse(20, 24, 12, 11, "#3f5a8c");
      g.r(19, 13, 2, 11, "#1b2a44");
      const len = 3 + Math.round(p * 11);
      for (let t = 0; t < len; t++) g.r(20 + t, 20 - Math.round(t * 0.75), 3, 3, t === len - 1 ? C.k : C.goldD);
      g.r(6, 24, 28, 16, C.k); g.r(7, 25, 26, 15, "#d8d2c4");
      g.r(17, 31, 6, 9, C.k); g.r(18, 32, 4, 8, C.woodD);
      g.r(9, 28, 4, 4, "#1b2a44"); g.r(27, 28, 4, 4, "#1b2a44");
      if (p >= 1) [[3, 4], [10, 1], [33, 2], [37, 12], [2, 14]].forEach(([x, y], i) => { if ((i + f) % 3) g.p(x, y, "#fff6c8"); });
    } },

    // 12. Гранд-готель «Люм'єр»: поверх за поверхом, у фіналі — дах, купол і світло у вікнах.
    12: { w: 48, h: 44, draw(g, p, f) {
      g.r(0, 40, 48, 4, "#e2cf8e");
      const floors = Math.max(1, Math.round(p * 3));
      for (let fl = 0; fl < 3; fl++) {
        const y = 30 - fl * 10;
        if (fl < floors) {
          g.r(4, y, 40, 10, C.k); g.r(5, y + 1, 38, 9, "#f3eee2");
          for (let w = 0; w < 6; w++) g.r(8 + w * 6, y + 3, 3, 4, p >= 1 ? ((w + fl + f) % 5 ? "#ffe061" : "#fff6c8") : "#5a6a7a");
        } else scaffold(g, 4, y, 40, 10);
      }
      g.r(20, 34, 8, 6, C.k); g.r(21, 35, 6, 5, C.woodD); g.r(18, 32, 12, 2, "#c4472a");
      if (p >= 1) {
        g.r(2, 6, 44, 5, C.k); g.r(3, 7, 42, 3, "#3f5a8c");
        g.r(20, 0, 8, 7, C.k); g.r(21, 1, 6, 5, C.gold);
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
    1: { sky: ["#86c8ee", "#e2f2fa"], far: "#5a9a45", ground: ["#b5bbc2", "#a9b0b8"], hills: "hills" },
    2: { sky: ["#f2b77a", "#fde2a8"], far: "#7a9a5a", ground: ["#5aa843", "#67b64b"], hills: "trees" },
    3: { sky: ["#6aaee0", "#cfe8f7"], far: "#2a85c4", ground: ["#9a6234", "#c08a52"], hills: "sea" },
    4: { sky: ["#86c8ee", "#e2f2fa"], far: "#8a9099", ground: ["#b5bbc2", "#c1c6cc"], hills: "hills" },
    5: { sky: ["#1f3a5a", "#f2a65a"], far: "#2a85c4", ground: ["#6d737c", "#8a9099"], hills: "sea", drawFar: sea },
    6: { sky: ["#86c8ee", "#f6e7cf"], far: "#5a9a45", ground: ["#d9a066", "#e2b47c"], hills: "hills" },
    7: { sky: ["#3a2f5a", "#f2a65a"], far: "#6a5a7a", ground: ["#d6c27e", "#e2cf8e"], hills: "trees" },
    8: { sky: ["#7fc3ec", "#e8f7e0"], far: "#5aa843", ground: ["#5aa843", "#67b64b"], hills: "trees" },
    9: { sky: ["#6fc2ee", "#e2f2fa"], far: "#2a85c4", ground: ["#e2cf8e", "#d6b85e"], hills: "sea" },
    10: { sky: ["#86c8ee", "#e2f2fa"], far: "#8a9099", ground: ["#b5bbc2", "#c1c6cc"], hills: "hills" },
    11: { sky: ["#0d1b2a", "#3a4a7a"], far: "#2a2830", ground: ["#6d737c", "#8a9099"], hills: "hills", noClouds: true },
    12: { sky: ["#f2a65a", "#fde2a8"], far: "#2a85c4", ground: ["#e2cf8e", "#d6c27e"], hills: "sea", drawGround: palms },
  };

  /* ---------- карта острова ---------- */

  const MAP_W = 400, MAP_H = 250;

  // Маршрут спіраллю: від кварталу на південному заході, повз доки в бухті
  // й маяк на мисі — до обсерваторії на пагорбі й готелю на сході.
  const POINTS = {
    1: [80, 190], 2: [100, 130], 3: [124, 72], 4: [186, 82],
    5: [250, 52], 6: [318, 80], 7: [332, 140], 8: [262, 128],
    9: [196, 140], 10: [178, 196], 11: [258, 200], 12: [330, 186],
  };

  Art.registerWorld("web", {
    mapW: MAP_W,
    mapH: MAP_H,
    points: POINTS,
    landmarks: LANDMARKS,
    biomes: BIOMES,
    buildTerrain() {
      // Пласка карта цьому світу не потрібна (є намальована), але лишаємо заглушку.
      const c = Art.kit.makeCanvas(MAP_W, MAP_H);
      painter(c).r(0, 0, MAP_W, MAP_H, "#2a85c4");
      return c;
    },
  });
})();
