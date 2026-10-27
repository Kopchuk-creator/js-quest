/* =========================================================
   scene.js — ілюстрована сцена локації: частина ілюстрації, наближена
   до диска потрібної місії, і наш Мандрівник на передньому плані.
   Використовується на екрані місії та в картці поточної місії на карті.
   ========================================================= */
(function () {
  "use strict";

  const ZOOM = 2.3; // ілюстрація ширша за вікно сцени в стільки разів

  /* Розмітка сцени. art — запис LOCATION_ART, loc — локація, levelId — поточна місія
     (її диск світиться), completed — пройдені місії, root — шлях до кореня сайту. */
  function html({ art, loc, levelId, completed, root, label, ids }) {
    const a = art;
    const visibleH = a.h - a.crop;
    const disks = loc.levels.map((id, i) => {
      const n = a.nodes[i];
      if (!n) return "";
      const st = completed.includes(id) ? "is-done" : id === levelId ? "is-current" : "";
      return '<span class="scene-disk ' + st + '" data-level="' + id + '" style="left:' + (n[0] / a.w) * 100 + "%;top:" + ((n[1] - a.crop) / visibleH) * 100 + '%">' +
        (st === "is-done" ? UI.icon("check") : "") + "</span>";
    }).join("");
    const id = (name) => (ids ? ' id="' + name + '"' : "");
    return '<div class="scene-art"' + id("scene-art") + ' role="img" aria-label="' + UI.esc(label) + '">' +
      '<div class="scene-pan"' + id("scene-pan") + ' style="width:' + ZOOM * 100 + "%;aspect-ratio:" + a.w + " / " + visibleH + '">' +
      '<img class="scene-bg" src="' + root + a.src + '" alt="" style="top:' + (-a.crop / visibleH) * 100 + '%">' + disks + "</div>" +
      '<img class="scene-hero"' + id("scene-hero") + ' src="' + root + 'assets/art/hero-back.png" width="101" height="113" alt="">' +
      "</div>";
  }

  /* Кадр сцени: диск місії з індексом index — у полі зору (ідеально трохи правіше центру, бо зліва стоїть
     Мандрівник). На ілюстраціях уже намальований герой (art.hero), тож кадр підбираємо так,
     щоб той або лишався за межами кадру, або повністю ховався за нашим Мандрівником —
     у сцені завжди видно лише одного героя. */
  function focus(box, a, index) {
    if (!box) return;
    const pan = box.querySelector(".scene-pan"), heroEl = box.querySelector(".scene-hero");
    if (!pan) return;
    const n = a.nodes[index] || a.nodes[0];
    const cw = box.clientWidth, ch = box.clientHeight;
    const pw = pan.offsetWidth, ph = pan.offsetHeight;
    if (!cw || !pw) return;
    const k = pw / a.w; // масштаб ілюстрації в сцені
    const tx = n[0] * k, ty = (n[1] - a.crop) * k;
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    const ideal = [clamp(cw * 0.6 - tx, cw - pw, 0), clamp(ch * 0.42 - ty, ch - ph, 0)];

    // Непрозора частина нашого Мандрівника (без шарфа, що майорить ліворуч);
    // shift — на скільки пікселів Мандрівника зсунуто праворуч від звичного місця.
    if (heroEl) heroEl.style.marginLeft = "0px";
    const base = heroEl && heroEl.offsetWidth ? { l: heroEl.offsetLeft, t: heroEl.offsetTop, w: heroEl.offsetWidth, h: heroEl.offsetHeight } : null;
    const coverAt = (shift) => base && { x0: base.l + shift + base.w * 0.3, x1: base.l + shift + base.w * 0.9, y0: base.t + base.h * 0.12, y1: ch + 40 };
    const painted = a.hero;
    const ok = (left, top, cover) => {
      // Диск місії видно й не закрито Мандрівником.
      const dx = tx + left, dy = ty + top;
      if (dx < cw * 0.08 || dx > cw * 0.94 || dy < ch * 0.08 || dy > ch * 0.9) return false;
      if (cover && dx > cover.x0 - 4 && dx < cover.x1 + 4 && dy > cover.y0 - 3) return false;
      if (!painted) return true;
      // Видима частина намальованого героя: порожня або повністю за Мандрівником.
      const x0 = Math.max(0, painted[0] * k + left), x1 = Math.min(cw, painted[2] * k + left);
      const y0 = Math.max(0, (painted[1] - a.crop) * k + top), y1 = Math.min(ch, (painted[3] - a.crop) * k + top);
      if (x1 <= x0 || y1 <= y0) return true;
      return !!cover && x0 >= cover.x0 && x1 <= cover.x1 && y0 >= cover.y0 && y1 <= cover.y1;
    };

    let best = null;
    if (ok(ideal[0], ideal[1], coverAt(0))) best = [ideal[0], ideal[1], 0];
    else {
      // Перебираємо кадри (і невеликий зсув Мандрівника) й беремо найближчий до ідеального,
      // що проходить перевірку. Зсув Мандрівника «коштує» дорожче, ніж зсув кадру.
      let bestCost = Infinity;
      const step = Math.max(2, Math.round(cw / 140));
      for (const shift of [0, -0.04, -0.08, 0.06, 0.12, 0.18, 0.24].map((f) => Math.round(f * cw))) {
        const cover = coverAt(shift);
        for (let left = 0; left >= cw - pw; left -= step) {
          for (let top = 0; top >= ch - ph; top -= step) {
            const cost = Math.hypot(left - ideal[0], top - ideal[1]) + Math.abs(shift) * 1.5;
            if (cost < bestCost && ok(left, top, cover)) { bestCost = cost; best = [left, top, shift]; }
          }
        }
      }
    }
    const [left, top, shift] = best || [ideal[0], ideal[1], 0];
    pan.style.transform = "translate(" + Math.round(left) + "px," + Math.round(top) + "px)";
    if (heroEl) heroEl.style.marginLeft = shift + "px";
  }


  // Кадрує сцену зараз, після завантаження ілюстрації й при кожній зміні розміру.
  // getIndex — функція, бо диск, на який дивимось, може змінитися (наступна місія).
  function watch(box, art, getIndex) {
    const refocus = () => focus(box, art, getIndex());
    const bg = box.querySelector(".scene-bg");
    if (bg && !bg.complete) bg.addEventListener("load", refocus, { once: true });
    refocus();
    if (window.ResizeObserver) new ResizeObserver(refocus).observe(box);
  }

  window.Scene = { html, focus, watch };
})();
