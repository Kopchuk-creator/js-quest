/* =========================================================
   map3d.js — тривимірна (ізометрична воксельна) карта світу
   в дусі Minecraft. Чистий canvas, без бібліотек.

   • рельєф будується з блоків: трав'яний верх, земляні боки,
     вода, пісок, скелі, сніг; камеру можна обертати на 90°
   • статичний шар (блоки, дерева, орієнтири) малюється один раз
     і перемальовується лише при зміні прогресу чи повороті
   • живий шар малюється щокадру: хмари з тінями, птахи, човни,
     відблиски води, мешканці на стежках, герой, ефекти локацій
     (дим, іскри, бульбашки, блискавки, феєрверки) і туман
     над закритими локаціями

   Світ описує себе в Art.registerWorld(id, { voxel: {...} }).
   ========================================================= */
(function () {
  "use strict";

  const { makeCanvas, painter, hash } = Art.kit;

  const TW = 8;   // ширина ромба плитки
  const TH = 4;   // висота ромба плитки
  const BH = 3;   // висота одного блока в пікселях
  const TOP_MARGIN = 34;

  // Кольори блоків: верх і два боки (лівий світліший — світло падає зліва).
  const BLOCKS = {
    grass:  { top: ["#5aa843", "#67b64b", "#4f9a3a"], lip: "#4a9a3c", left: "#8a5c34", right: "#6e4728" },
    forest: { top: ["#3f8530", "#4a9038", "#377a2b"], lip: "#3a7a2e", left: "#7a5230", right: "#5e3e22" },
    field:  { top: ["#d9b44a", "#e2c25a", "#c99f38"], lip: "#c99f38", left: "#8a5c34", right: "#6e4728" },
    sand:   { top: ["#e2cf8e", "#ead9a0", "#d6c27e"], left: "#cdb874", right: "#b49f5c" },
    rock:   { top: ["#9aa1a9", "#a9b0b8", "#8a9099"], left: "#7c838c", right: "#636a73" },
    snow:   { top: ["#f2f5f7", "#ffffff", "#e3e8ee"], lip: "#e3e8ee", left: "#9aa1a9", right: "#7c838c" },
    swamp:  { top: ["#4a5a2e", "#56683a", "#3d4f2c"], left: "#4a3a24", right: "#3a2c1a" },
    water:  { top: ["#3fb3d9", "#4cbde2", "#38a6cc"], left: "#2a86b8", right: "#2170b0" },
    deep:   { top: ["#2a85c4", "#3090cc", "#2478b5"], left: "#2170b0", right: "#1c5f99" },
    plaza:  { top: ["#b5bbc2", "#a9b0b8", "#c1c6cc"], left: "#8a9099", right: "#6d737c" },
    wood:   { top: ["#c08a52", "#b07a44", "#c99a62"], left: "#8a5a2e", right: "#6e4728" },
  };

  function rotateCoord(i, j, rot, cols, rows) {
    switch (rot) {
      case 1: return [rows - 1 - j, i];
      case 2: return [cols - 1 - i, rows - 1 - j];
      case 3: return [j, cols - 1 - i];
      default: return [i, j];
    }
  }

  function create(opts) {
    const worldId = opts.worldId;
    const wa = Art.world(worldId);
    const vx = wa.voxel;
    const canvas = opts.canvas;
    const ctx = canvas.getContext("2d");
    // У «м'якому» режимі (система просить зменшити рух) прибираємо спалахи й вибухи.
    const gentle = () => UI.motion() === "gentle";

    let rot = 0;
    let states = {};
    let currentLoc = null;
    let staticLayer = null;
    let raf = 0;
    let lastTick = 0;
    let t = 0;

    /* ---------- сітка ---------- */

    const cols = vx.cols, rows = vx.rows, cell = vx.cell;
    const grid = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) grid.push(vx.tile(i, j));
    }
    const at = (i, j) => grid[j * cols + i];

    const locTile = {};
    Object.keys(wa.points).forEach((id) => {
      const p = (vx.points && vx.points[id]) || wa.points[id];
      locTile[id] = [Math.min(cols - 1, Math.floor(p[0] / cell)), Math.min(rows - 1, Math.floor(p[1] / cell))];
    });

    // Під орієнтирами — рівний майданчик, щоб будівлі не висіли над схилом.
    Object.keys(locTile).forEach((id) => {
      const [ci, cj] = locTile[id];
      const center = at(ci, cj);
      const h = Math.max(2, center.type === "water" || center.type === "deep" ? 2 : center.h);
      const r = (vx.flatten && vx.flatten[id]) || 2;
      for (let dj = -r; dj <= r; dj++) {
        for (let di = -r; di <= r; di++) {
          const i = ci + di, j = cj + dj;
          if (i < 0 || j < 0 || i >= cols || j >= rows) continue;
          const tl = at(i, j);
          if (vx.keepWater && vx.keepWater.includes(Number(id)) && (tl.type === "water" || tl.type === "deep")) continue;
          tl.h = h;
          tl.flat = true;
          if (tl.type === "water" || tl.type === "deep" || tl.type === "rock" || tl.type === "snow") tl.type = vx.groundType || "grass";
        }
      }
    });

    const maxH = grid.reduce((m, tl) => Math.max(m, tl.h), 0);

    /* ---------- проєкція ---------- */

    function dims() {
      const odd = rot % 2 === 1;
      const U = odd ? rows : cols, V = odd ? cols : rows;
      return { U, V, w: (U + V) * (TW / 2) + 16, h: (U + V) * (TH / 2) + maxH * BH + TOP_MARGIN + 12, ox: V * (TW / 2) + 8, oy: maxH * BH + TOP_MARGIN };
    }

    let D = dims();

    // Екранна точка верху плитки (центр ромба).
    function project(i, j, h) {
      const [u, v] = rotateCoord(i, j, rot, cols, rows);
      return [D.ox + (u - v) * (TW / 2), D.oy + (u + v) * (TH / 2) - h * BH + TH / 2];
    }

    function locScreen(id) {
      const [i, j] = locTile[id];
      const [x, y] = project(i, j, at(i, j).h);
      const lift = (vx.lift && vx.lift[id]) || 0;
      return [x, y - lift];
    }

    /* ---------- статичний шар ---------- */

    function drawColumn(g, i, j, tl) {
      const [u, v] = rotateCoord(i, j, rot, cols, rows);
      const sx = D.ox + (u - v) * (TW / 2);
      const sy = D.oy + (u + v) * (TH / 2) - tl.h * BH;
      const b = BLOCKS[tl.type] || BLOCKS.grass;
      const faceH = tl.h * BH + 2;
      if (tl.h > 0) {
        // Боки: лівий і правий, з «губою» трави зверху (як блок трави в Minecraft).
        for (let x = 0; x < TW / 2; x++) {
          const yTop = sy + (x < TW / 4 ? 3 : 4);
          g.r(sx - TW / 2 + x, yTop, 1, faceH, b.left);
          if (b.lip) g.r(sx - TW / 2 + x, yTop, 1, 1, b.lip);
          const yTopR = sy + (x < TW / 4 ? 4 : 3);
          g.r(sx + x, yTopR, 1, faceH, b.right);
          if (b.lip) g.r(sx + x, yTopR, 1, 1, b.lip);
        }
        // Темні шви між блоками.
        for (let k = 1; k < tl.h; k++) g.r(sx - TW / 2, sy + 3 + k * BH, TW, 1, "rgba(0,0,0,0.08)");
      }
      const top = b.top[Math.floor(hash(i, j, 3) * b.top.length)];
      const rowsW = [TW / 2, TW, TW, TW / 2];
      rowsW.forEach((w, r) => g.r(sx - w / 2, sy + r, w, 1, top));
      if (tl.type === "field" && (i + j) % 2 === 0) g.r(sx - 1, sy + 1, 2, 1, "#c99f38");
    }

    function buildStatic() {
      D = dims();
      const c = makeCanvas(D.w, D.h);
      const g = painter(c);
      // Небо за островом/краєм світу.
      const sky = vx.sky || ["#1b2836", "#2c4a5c"];
      for (let i = 0; i < 8; i++) g.r(0, Math.floor((i * D.h) / 8), D.w, Math.ceil(D.h / 8) + 1, Art.kit.lerpColor(sky[0], sky[1], i / 7));

      // Усі об'єкти сортуємо за глибиною (u + v), малюємо від дальніх до ближніх.
      const items = [];
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const [u, v] = rotateCoord(i, j, rot, cols, rows);
          items.push({ d: u + v, k: 0, i, j });
        }
      }
      (vx.trees || []).forEach((tr, n) => {
        const i = Math.floor(tr[0] / cell), j = Math.floor(tr[1] / cell);
        if (i < 0 || j < 0 || i >= cols || j >= rows) return;
        const tl = at(i, j);
        if (tl.flat || tl.type === "water" || tl.type === "deep" || tl.type === "snow") return;
        const [u, v] = rotateCoord(i, j, rot, cols, rows);
        items.push({ d: u + v + 0.5, k: 1, i, j, n, s: tr[2] });
      });
      Object.keys(locTile).forEach((id) => {
        const [i, j] = locTile[id];
        const [u, v] = rotateCoord(i, j, rot, cols, rows);
        items.push({ d: u + v + 0.6 + ((vx.lift && vx.lift[id]) ? 0.1 : 0), k: 2, id: Number(id) });
      });
      items.sort((a, b) => a.d - b.d || a.k - b.k);

      items.forEach((it) => {
        if (it.k === 0) {
          drawColumn(g, it.i, it.j, at(it.i, it.j));
        } else if (it.k === 1) {
          const spr = it.s || Art.kit.PINE;
          const [x, y] = project(it.i, it.j, at(it.i, it.j).h);
          g.sprite(spr, x - Math.floor(spr.width / 2) + Math.round(hash(it.n, 1, 2) * 2 - 1), y - spr.height + 1);
        } else {
          const st = states[it.id] || { progress: 0, locked: true };
          const spr = Art.landmark(it.id, st.progress, 0, st.locked, worldId);
          const [x, y] = locScreen(it.id);
          g.sprite(spr, x - Math.floor(spr.width / 2), y - spr.height + 2);
        }
      });
      staticLayer = c;
      canvas.width = D.w;
      canvas.height = D.h;
    }

    /* ---------- живий шар ---------- */

    // Точки стежки на екрані (крива Безьє, як у SVG-стежці).
    function trailPoints() {
      return Object.keys(wa.points).map(Number).sort((a, b) => a - b).map((id) => locScreen(id));
    }

    function bezier(points, i, s) {
      const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      const m = 1 - s;
      return [
        m * m * m * p1[0] + 3 * m * m * s * c1[0] + 3 * m * s * s * c2[0] + s * s * s * p2[0],
        m * m * m * p1[1] + 3 * m * m * s * c1[1] + 3 * m * s * s * c2[1] + s * s * s * p2[1],
      ];
    }

    const waterTiles = [];
    grid.forEach((tl, n) => { if ((tl.type === "water" || tl.type === "deep") && hash(n, 7, 7) > 0.82) waterTiles.push(n); });
    const seaTiles = grid.map((tl, n) => (tl.type === "deep" ? n : -1)).filter((n) => n >= 0);

    const VILLAGER_COLORS = [["#e0503c", "#f2c79a"], ["#3f78b5", "#d39a6a"], ["#f7d23a", "#f2c79a"], ["#5ee0a0", "#cf9466"], ["#c08a52", "#f2c79a"], ["#ff8fc0", "#d39a6a"]];

    function drawVillager(g, x, y, color, step) {
      g.r(x - 1, y - 6, 3, 2, color[1]);
      g.r(x - 1, y - 4, 3, 3, color[0]);
      g.r(x - 1 + (step ? 0 : 1), y - 1, 1, 1, "#33271f");
      g.r(x + (step ? 1 : 0), y - 1, 1, 1, "#33271f");
    }

    function drawEffect(g, id, kind, x, y, time, progress) {
      const spr = Art.landmark(id, 0, 0, false, worldId);
      const top = y - spr.height + 4;
      switch (kind) {
        case "smoke":
          for (let k = 0; k < 6; k++) {
            const life = (time * 0.6 + k / 6) % 1;
            const px = x + Math.sin((life + k) * 6) * 3 + 2;
            const py = y - 14 - life * 26;
            g.ctx.globalAlpha = 0.55 * (1 - life);
            g.r(px, py, 2 + Math.round(life * 2), 2 + Math.round(life * 2), "#d8dde2");
          }
          g.ctx.globalAlpha = 1;
          break;
        case "sparkle":
          for (let k = 0; k < 5; k++) {
            const a = time * 2 + k * 1.3;
            if (Math.sin(a * 3) > 0.2) g.r(x + Math.cos(a) * 14, top + 8 + Math.sin(a * 1.7) * 8, 1, 1, k % 2 ? "#62d8ff" : "#ffffff");
          }
          break;
        case "gold":
          for (let k = 0; k < 6; k++) {
            const life = (time * 0.8 + k / 6) % 1;
            g.ctx.globalAlpha = 1 - life;
            g.r(x - 8 + k * 3, y - 6 - life * 18, 1, 1, "#f7d23a");
          }
          g.ctx.globalAlpha = 1;
          break;
        case "leaves":
          for (let k = 0; k < 5; k++) {
            const life = (time * 0.35 + k / 5) % 1;
            g.r(x - 14 + k * 7 + Math.sin(life * 9) * 3, top + life * (spr.height - 4), 1, 1, k % 2 ? "#d9b44a" : "#8fbf4f");
          }
          break;
        case "bubbles":
          for (let k = 0; k < 5; k++) {
            const life = (time * 0.7 + k / 5) % 1;
            g.ctx.globalAlpha = 1 - life;
            g.r(x - 10 + k * 5, y - 4 - life * 10, 1, 1, progress >= 1 ? "#bfe8f2" : "#a4b86a");
          }
          g.ctx.globalAlpha = 1;
          break;
        case "paint":
          // Кольорові бризки фарби над фарбарнею.
          for (let k = 0; k < 7; k++) {
            const life = (time * 0.7 + k / 7) % 1;
            g.ctx.globalAlpha = 1 - life;
            g.r(x - 12 + k * 4 + Math.sin(life * 7 + k) * 2, top + 6 - life * 14, 2, 2, ["#e0503c", "#f7a33a", "#f7d23a", "#5aa843", "#3f78b5", "#ff8fc0", "#62d8ff"][k]);
          }
          g.ctx.globalAlpha = 1;
          break;
        case "lighthouse":
          // Промінь маяка обертається, коли маяк добудовано.
          if (progress < 1) return drawEffect(g, id, "sparkle", x, y, time, progress);
          {
            const a = time * 1.2;
            const len = 120;
            g.ctx.globalAlpha = gentle() ? 0.12 : 0.22;
            g.ctx.fillStyle = "#fff2a8";
            g.ctx.beginPath();
            g.ctx.moveTo(x, top + 2);
            g.ctx.lineTo(x + Math.cos(a - 0.12) * len, top + 2 + Math.sin(a - 0.12) * len * 0.5);
            g.ctx.lineTo(x + Math.cos(a + 0.12) * len, top + 2 + Math.sin(a + 0.12) * len * 0.5);
            g.ctx.closePath();
            g.ctx.fill();
            g.ctx.globalAlpha = 1;
          }
          break;
        case "beam":
          // Промінь святилища — лише коли його активовано; до того руни лише іскрять.
          if (progress < 1) return drawEffect(g, id, "sparkle", x, y, time, progress);
          g.ctx.globalAlpha = 0.18 + Math.sin(time * 3) * 0.08;
          g.r(x - 3, 0, 6, top + 6, "#fff2a8");
          g.ctx.globalAlpha = 1;
          break;
        case "storm":
          if (progress < 1) {
            if (!gentle() && (time * 2.3) % 1 < 0.12) {
              g.r(x + 2, top + 12, 2, 4, "#f7d23a"); g.r(x, top + 16, 2, 3, "#f7d23a"); g.r(x + 1, top + 19, 2, 5, "#f7d23a");
            }
            for (let k = 0; k < 6; k++) g.r(x - 12 + k * 5, top + 14 + ((time * 40 + k * 7) % 14), 1, 2, "#8fb6d9");
          } else {
            for (let k = 0; k < 8; k++) {
              const a = time + (k * Math.PI) / 4;
              g.r(x + Math.cos(a) * 15, top + 10 + Math.sin(a) * 9, 1, 1, "#fff2a8");
            }
          }
          break;
        case "fireworks":
          if (gentle() && progress >= 1) return drawEffect(g, id, "gold", x, y, time, progress);
          if (progress >= 1) {
            for (let b = 0; b < 2; b++) {
              const life = (time * 0.5 + b * 0.5) % 1;
              const cx = x + (b ? 18 : -16), cy = top - 6 - b * 6;
              if (life < 0.35) g.r(cx, cy + (0.35 - life) * 60, 1, 2, "#ffffff");
              else {
                const r = (life - 0.35) * 26;
                g.ctx.globalAlpha = 1 - (life - 0.35) / 0.65;
                for (let k = 0; k < 10; k++) {
                  const a = (k / 10) * Math.PI * 2;
                  g.r(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1, 1, b ? "#f7d23a" : "#ff8a76");
                }
                g.ctx.globalAlpha = 1;
              }
            }
          }
          break;
        default:
          break;
      }
    }

    function drawFog(g, x, y, time, seed) {
      g.ctx.globalAlpha = 0.5;
      for (let k = 0; k < 4; k++) {
        const ox = Math.sin(time * 0.6 + k + seed) * 6;
        g.ellipse(x - 12 + k * 8 + ox, y - 10 - (k % 2) * 6, 9, 4, k % 2 ? "#c9d0d8" : "#aeb6c0");
      }
      g.ctx.globalAlpha = 1;
    }

    function drawCloud(g, x, y, size) {
      // Тінь хмари на землі.
      g.ctx.globalAlpha = 0.12;
      g.ellipse(x + 10, y + 70, size * 1.4, size * 0.5, "#000000");
      g.ctx.globalAlpha = 0.9;
      g.ellipse(x, y, size, size * 0.4, "#ffffff");
      g.ellipse(x - size * 0.4, y + 2, size * 0.6, size * 0.3, "#eef4f8");
      g.ellipse(x + size * 0.5, y + 1, size * 0.5, size * 0.3, "#f6fafc");
      g.ctx.globalAlpha = 1;
    }

    function drawBird(g, x, y, flap) {
      g.r(x - 2, y + (flap ? 0 : 1), 2, 1, "#1d1410");
      g.r(x, y + 1, 1, 1, "#1d1410");
      g.r(x + 1, y + (flap ? 0 : 1), 2, 1, "#1d1410");
    }

    function drawDynamic() {
      if (!staticLayer) return;
      const g = painter(canvas);
      g.ctx.drawImage(staticLayer, 0, 0);
      const time = t;

      // Відблиски води.
      waterTiles.forEach((n, k) => {
        if (Math.sin(time * 2 + k * 1.7) < 0.75) return;
        const i = n % cols, j = Math.floor(n / cols);
        const [x, y] = project(i, j, grid[n].h);
        g.r(x - 1, y - 1, 2, 1, "#dff6ff");
      });

      // Човен ходить морем.
      if (seaTiles.length) {
        const n = seaTiles[Math.floor(((time * 0.02) % 1) * seaTiles.length)];
        const i = n % cols, j = Math.floor(n / cols);
        const [x, y] = project(i, j, 0);
        g.r(x - 4, y - 2, 8, 2, "#5e3a1c");
        g.r(x, y - 9, 1, 7, "#5e3a1c");
        g.tri(x + 3, y - 3, 2, 6, "#f2f5f7", "#d4dbe2");
      }

      const ids = Object.keys(wa.points).map(Number).sort((a, b) => a - b);
      const pts = trailPoints();

      // Мешканці гуляють відновленою частиною стежки.
      const doneCount = ids.filter((id) => states[id] && states[id].status === "done").length;
      const walkable = Math.max(0, Math.min(ids.length - 1, doneCount));
      for (let k = 0; k < Math.min(6, walkable + (walkable ? 1 : 0)); k++) {
        if (!walkable) break;
        const speed = 0.012 + (k % 3) * 0.004;
        const phase = (time * speed * 10 + k * 0.37) % 2;
        const pos = phase < 1 ? phase : 2 - phase;
        const seg = Math.min(walkable - 1, Math.floor(pos * walkable));
        const s = pos * walkable - seg;
        const [x, y] = bezier(pts, seg, Math.min(1, Math.max(0, s)));
        drawVillager(g, Math.round(x + ((k % 2) * 4 - 2)), Math.round(y + 2), VILLAGER_COLORS[k % VILLAGER_COLORS.length], Math.floor(time * 6 + k) % 2);
      }

      // Ефекти локацій і туман над закритими.
      ids.forEach((id) => {
        const st = states[id] || { locked: true, progress: 0 };
        const [x, y] = locScreen(id);
        if (st.locked) drawFog(g, x, y, time, id);
        else if (vx.fx && vx.fx[id] && (st.progress > 0 || st.status === "current")) drawEffect(g, id, vx.fx[id], x, y, time, st.progress);
      });

      // Герой походжає біля поточної локації, крокуючи з боку попередньої.
      if (currentLoc) {
        const idx = ids.indexOf(currentLoc);
        const [cx, cy] = pts[idx];
        let hx = cx - 12, hy = cy + 3;
        const lifted = vx.lift && vx.lift[currentLoc];
        if (lifted) {
          // Піднята локація (вершина вежі): герой стоїть нагорі, а не йде повітрям.
          hx = cx - 4; hy = cy + 2;
        } else if (idx > 0) {
          const walk = (Math.sin(time * 0.7) + 1) / 2; // 0..1
          const [px, py] = bezier(pts, idx - 1, 0.82 + walk * 0.18);
          hx = px - 6; hy = py + 3;
        }
        const hero = Art.hero();
        // Іскри «ти тут».
        for (let k = 0; k < 6; k++) {
          const a = time * 2 + (k * Math.PI) / 3;
          g.r(cx + Math.cos(a) * 9, cy + 1 + Math.sin(a) * 3, 1, 1, "#f7d23a");
        }
        g.sprite(hero, Math.round(hx - hero.width / 2), Math.round(hy - hero.height - (Math.floor(time * 4) % 2)));
      }

      // Хмари й птахи — над усім.
      for (let k = 0; k < 4; k++) {
        const span = D.w + 120;
        const x = ((time * (6 + k * 2) + k * 170) % span) - 60;
        drawCloud(g, x, 14 + k * 26 + (k % 2) * 30, 14 + (k % 3) * 5);
      }
      for (let k = 0; k < 2; k++) {
        const span = D.w + 80;
        const bx = ((time * (22 + k * 6) + k * 260) % span) - 40;
        const by = 40 + k * 70 + Math.sin(time * 1.3 + k) * 6;
        for (let m = 0; m < 3; m++) drawBird(g, bx - m * 6, by + m * 3 * (m % 2 ? 1 : -1), Math.floor(time * 5 + m) % 2);
      }
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - lastTick < 50) return; // ~20 кадрів/с — достатньо для піксель-арту
      // Після неактивної вкладки не «перестрибуємо» анімацію.
      t += Math.min(0.2, (now - lastTick) / 1000);
      lastTick = now;
      drawDynamic();
    }

    /* ---------- API ---------- */

    return {
      update(newStates, current) {
        states = newStates;
        currentLoc = current;
        buildStatic();
        drawDynamic();
      },
      rotate(dir) {
        rot = (rot + dir + 4) % 4;
        buildStatic();
        drawDynamic();
      },
      // Екранна позиція локації у відсотках від розміру canvas (для HTML-підписів).
      locPercent(id) {
        const [x, y] = locScreen(id);
        return [(x / D.w) * 100, (y / D.h) * 100];
      },
      trail() {
        return trailPoints();
      },
      size() {
        return [D.w, D.h];
      },
      start() {
        if (UI.motion() === "off" || raf) return;
        lastTick = performance.now();
        raf = requestAnimationFrame(loop);
      },
      stop() {
        cancelAnimationFrame(raf);
        raf = 0;
      },
    };
  }

  window.Map3D = { create, BLOCKS };
})();
