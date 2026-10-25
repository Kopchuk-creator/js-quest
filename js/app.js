/* =========================================================
   app.js — головна сторінка:
     #hub       — світ-хаб із порталами в усі світи
     #map       — карта поточного світу (?world=…)
     #projects  — великі практичні місії й журнал локацій світу
     #handbook  — довідник героя
     #trophies  — профіль героя з прогресом по всіх світах
   Перемикання розділів — через #hash, без перезавантаження.
   ========================================================= */
(function () {
  "use strict";

  const { LEVELS, LOCATIONS } = Game;
  const $ = (sel) => document.querySelector(sel);
  const worldArt = Art.world(Game.WORLD_ID);

  let progress = Game.load();
  let frame = 0;
  let selectedLocation = null;

  /* ---------- допоміжне ---------- */

  function levelUrl(id) {
    return Game.levelUrl(id, "");
  }

  function locStates() {
    const states = {};
    LOCATIONS.forEach((loc) => {
      const status = Game.locationStatus(progress, loc);
      states[loc.id] = { progress: Game.locationProgress(progress, loc).ratio, locked: status === "locked", status };
    });
    return states;
  }

  function toRoman(n) {
    return ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI"][n] || String(n);
  }

  /* ---------- шкала досвіду (спільна для всіх світів) ---------- */

  function renderXp() {
    const hero = Game.heroLevel(Game.totalXpAll());
    const pct = Math.round((hero.current / hero.needed) * 100);
    const html =
      '<div class="xp-head"><strong>Рівень ' + hero.level + '</strong><span>' + hero.current + " / " + hero.needed + " XP</span></div>" +
      '<div class="xp-bar" role="progressbar" aria-label="Досвід до наступного рівня" aria-valuemin="0" aria-valuemax="' + hero.needed +
      '" aria-valuenow="' + hero.current + '"><span style="width:' + pct + '%"></span></div>';
    document.querySelectorAll(".js-xp").forEach((el) => { el.innerHTML = html; });
  }

  /* =========================================================
     Світ-хаб
     ========================================================= */

  const HUB_STATUS_TEXT = { open: "Портал відчинено", done: "Світ пройдено", locked: "Портал запечатано", soon: "Світ будується" };

  function portalStates() {
    return WORLDS.map((w) => {
      const status = Game.worldStatus(w);
      const api = status === "soon" ? null : Game.forWorld(w.id);
      return { world: w, status, completion: api ? api.completion() : null };
    });
  }

  function requirementText(world) {
    return world.requires.map((id) => "«" + WORLDS.find((w) => w.id === id).name + "»").join(" і ");
  }

  function renderHub() {
    const states = portalStates();
    Art.renderHub($("#hub-canvas"), states, frame);
    const W = Art.HUB_W, H = Art.HUB_H;
    $("#hub-labels").innerHTML = states.map((s, i) => {
      const [x, y] = Art.hubPoints(states.length)[i];
      const style = 'style="left:' + (x / W) * 100 + "%;top:" + ((y + 4) / H) * 100 + '%"';
      const inner = '<span class="loc-name">' + (s.status === "done" ? '<span class="loc-icon is-done">' + UI.icon("check") + "</span>" : "") +
        UI.esc(s.world.name) + "</span>" + '<span class="portal-tech">' + UI.esc(s.world.tech) + "</span>";
      if (s.status === "open" || s.status === "done") {
        return '<a class="loc-label portal-label is-' + s.status + '" ' + style + ' href="index.html?world=' + s.world.id + '#map">' + inner + "</a>";
      }
      return '<button type="button" class="loc-label portal-label is-' + s.status + '" ' + style + ' data-portal="' + s.world.id + '" aria-label="' +
        UI.esc(s.world.name + ": " + HUB_STATUS_TEXT[s.status]) + '">' + (s.status === "locked" ? '<span class="loc-lock">' + UI.icon("lock") + "</span>" : "") + inner + "</button>";
    }).join("");

    $("#worlds-grid").innerHTML = states.map((s) => {
      const c = s.completion;
      const pct = c ? Math.round(c.ratio * 100) : 0;
      const action = s.status === "open" || s.status === "done"
        ? '<a class="btn btn-primary" href="index.html?world=' + s.world.id + '#map">' + UI.icon("portal") + (c && c.done ? "Продовжити" : "Увійти") + "</a>"
        : '<span class="world-note">' + UI.icon(s.status === "locked" ? "lock" : "hammer") +
          (s.status === "locked" ? "Спершу пройди " + UI.esc(requirementText(s.world)) : "Світ ще будується — скоро відкриється") + "</span>";
      return (
        '<article class="card world-card is-' + s.status + '" style="--world:' + s.world.color + '">' +
        '<div class="world-portal" data-portal-art="' + s.world.id + '"></div>' +
        '<div class="world-info"><p class="eyebrow">' + UI.esc(s.world.tech) + "</p><h3>" + UI.esc(s.world.name) + "</h3>" +
        "<p>" + UI.esc(s.world.blurb) + "</p>" +
        (c ? '<div class="world-progress"><div class="xp-bar" role="progressbar" aria-label="Пройдено місій" aria-valuemin="0" aria-valuemax="' + c.total +
          '" aria-valuenow="' + c.done + '"><span style="width:' + pct + '%"></span></div><span>' + c.done + " / " + c.total + "</span></div>" : "") +
        action + "</div></article>"
      );
    }).join("");
    document.querySelectorAll("[data-portal-art]").forEach((el) => {
      const s = states.find((st) => st.world.id === el.dataset.portalArt);
      Art.mount(el, Art.portal(s.world.color, s.status, 0));
    });
  }

  function drawHub() {
    Art.renderHub($("#hub-canvas"), portalStates(), frame);
  }

  /* =========================================================
     Карта світу
     ========================================================= */

  function segmentPath(points, i) {
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    return "M" + p1.join(" ") + " C" + c1.join(" ") + " " + c2.join(" ") + " " + p2.join(" ");
  }

  // Режими карти: "art" — намальована ілюстрація світу з підписами локацій,
  // "3d" — воксельна карта (якщо світ її має), "flat" — пласка піксельна.
  // Обраний режим запам'ятовується; за замовчуванням — ілюстрація.
  const mapArt = (window.MAP_ART || {})[Game.WORLD_ID] || null;
  const has3D = !!(worldArt.voxel && window.Map3D);
  const MODE_KEY = "js-game-map-mode";
  let mapMode = (() => {
    let saved = null;
    try { saved = localStorage.getItem(MODE_KEY); } catch (e) { /* ignore */ }
    if (saved === "3d" && has3D) return "3d";
    return mapArt ? "art" : has3D ? "3d" : "flat";
  })();
  let use3D = mapMode === "3d";
  let map3d = null;
  let zoom = 1;

  // Геометрія карти: розмір полотна й екранні точки локацій.
  function geom() {
    if (mapMode === "art") {
      return { w: mapArt.w, h: mapArt.h, point: (id) => mapArt.points[id], labelPos: {}, trail: [] };
    }
    if (use3D) {
      const [w, h] = map3d.size();
      return {
        w, h,
        point: (id) => { const [px, py] = map3d.locPercent(id); return [(px * w) / 100, (py * h) / 100]; },
        labelPos: worldArt.voxel.labelPos || {},
        trail: map3d.trail(),
      };
    }
    return {
      w: worldArt.mapW, h: worldArt.mapH,
      point: (id) => worldArt.points[id],
      labelPos: worldArt.labelPos,
      trail: LOCATIONS.map((loc) => {
        const [x, y] = worldArt.points[loc.id];
        const dy = worldArt.pathDy[loc.id];
        return [x, y + (dy !== undefined ? dy : 1)];
      }),
    };
  }

  function renderPath(states) {
    // Стежка проходить трохи нижче опорних точок — по землі перед орієнтирами.
    const G = geom();
    const points = G.trail;
    let html = "";
    for (let i = 0; i < points.length - 1; i++) {
      const from = states[LOCATIONS[i].id].status;
      const to = states[LOCATIONS[i + 1].id].status;
      const cls = from === "done" && to === "done" ? "is-done" : from === "done" ? "is-next" : "is-locked";
      html += '<path class="trail ' + cls + '" d="' + segmentPath(points, i) + '"/>';
    }
    const svg = $("#map-path");
    svg.setAttribute("viewBox", "0 0 " + G.w + " " + G.h);
    svg.innerHTML = html;
  }

  function renderLabels(states) {
    const G = geom();
    const html = LOCATIONS.map((loc) => {
      const st = states[loc.id];
      const [x, y] = G.point(loc.id);
      const pos = Object.assign({ dx: 0, dy: 6 }, G.labelPos[loc.id]);
      const left = ((x + pos.dx) / G.w) * 100;
      const top = ((y + pos.dy) / G.h) * 100;
      const lp = Game.locationProgress(progress, loc);
      const statusText = st.status === "done" ? "відновлено" : st.status === "current" ? "ти тут, пройдено " + lp.done + " з " + lp.total : "заблоковано";
      const iconHtml = st.status === "done" ? '<span class="loc-icon is-done">' + UI.icon("check") + "</span>"
        : st.status === "current" ? '<span class="loc-icon is-current">' + UI.icon("compass") + "</span>"
        : "";
      return (
        '<button type="button" class="loc-label is-' + st.status + (pos.align === "right" ? " align-right" : "") +
        (selectedLocation === loc.id ? " is-selected" : "") + '" style="left:' + left + "%;top:" + top + '%" data-loc="' + loc.id +
        '" aria-label="' + UI.esc(loc.name + ": " + statusText) + '">' +
        (st.status === "locked" ? '<span class="loc-lock">' + UI.icon("lock") + "</span>" : "") +
        '<span class="loc-name">' + iconHtml + '<span class="loc-text">' + UI.esc(loc.name) + "</span></span>" +
        (st.status === "current" ? '<span class="loc-here">Ти тут</span>' : "") +
        "</button>"
      );
    }).join("");
    $("#map-labels").innerHTML = html;
  }

  function placeHero(states) {
    const current = LOCATIONS.find((loc) => states[loc.id].status === "current") || LOCATIONS[LOCATIONS.length - 1];
    const [x, y] = worldArt.points[current.id];
    const heroEl = $("#map-hero");
    if (!heroEl.firstChild) Art.mount(heroEl, Art.hero());
    const spot = Object.assign({ dx: -24, dy: 2 }, worldArt.heroSpot[current.id]);
    heroEl.style.left = ((x + spot.dx) / worldArt.mapW) * 100 + "%";
    heroEl.style.top = ((y + spot.dy - 22) / worldArt.mapH) * 100 + "%";
    heroEl.style.width = (16 / worldArt.mapW) * 115 + "%";
    return current;
  }

  function drawMap() {
    const states = locStates();
    if (mapMode !== "flat") return states; // ілюстрація статична, 3D-карта анімує себе сама
    Art.renderMap($("#map-canvas"), states, frame, Game.WORLD_ID);
    return states;
  }

  function renderMap() {
    $("#map-title").textContent = Game.meta.name;
    $("#map-subtitle").innerHTML = UI.esc(Game.meta.tech) + ". Виконуй місії.<br>Відновлюй цей світ.";
    const isArt = mapMode === "art";
    const artEl = $("#map-art");
    artEl.hidden = !isArt;
    $("#map-canvas").hidden = isArt;
    $("#map-stage").classList.toggle("is-art", isArt);
    if (isArt) {
      if (artEl.getAttribute("src") !== mapArt.src) artEl.src = mapArt.src;
      artEl.alt = "Ілюстрована карта світу «" + Game.meta.name + "»";
    } else {
      $("#map-canvas").setAttribute("aria-label", (use3D ? "Тривимірна" : "Піксельна") + " карта світу «" + Game.meta.name + "»");
    }
    const states = drawMap();
    let current = LOCATIONS.find((loc) => states[loc.id].status === "current") || LOCATIONS[LOCATIONS.length - 1];
    if (map3d && !use3D) map3d.stop();
    if (use3D) {
      if (!map3d) map3d = Map3D.create({ canvas: $("#map-canvas"), worldId: Game.WORLD_ID });
      map3d.update(states, Game.currentLevelId(progress) ? current.id : null);
      map3d.start();
      $("#map-hero").hidden = true;
    } else if (isArt) {
      // Герой уже намальований на ілюстрації; поточну локацію показує підпис «Ти тут».
      $("#map-hero").hidden = true;
    } else {
      $("#map-hero").hidden = false;
      current = placeHero(states);
    }
    syncMapTools();
    const G = geom();
    $("#map-stage").style.aspectRatio = G.w + " / " + G.h;
    applyZoom();
    renderPath(states);
    renderLabels(states);
    // Якщо карта ширша за екран — показуємо поточну локацію.
    scrollToPoint(G.point(current.id), G);
  }

  function scrollToPoint(point, G) {
    const scroller = $("#map-scroll");
    if (scroller.scrollWidth > scroller.clientWidth) {
      scroller.scrollLeft = (point[0] / G.w) * scroller.scrollWidth - scroller.clientWidth / 2;
    }
    if (scroller.scrollHeight > scroller.clientHeight) {
      scroller.scrollTop = (point[1] / G.h) * scroller.scrollHeight - scroller.clientHeight / 2;
    }
  }

  function applyZoom() {
    $("#map-stage").style.width = zoom * 100 + "%";
    $("#map-scroll").classList.toggle("is-zoomed", zoom > 1);
  }

  // На невеликій карті підписи стискаються до значків, щоб не налазити один на одного;
  // повна назва — у поточної локації, при наведенні/фокусі або коли карту наближено.
  function watchCompact() {
    const stage = $("#map-stage");
    const update = () => stage.classList.toggle("is-compact", mapMode !== "flat" && stage.clientWidth < 1100);
    if (window.ResizeObserver) new ResizeObserver(update).observe(stage);
    update();
  }

  function syncMotionButton() {
    const btn = $('[data-tool="motion"]');
    const off = UI.motion() === "off";
    btn.setAttribute("aria-pressed", String(off));
    btn.setAttribute("aria-label", off ? "Увімкнути анімацію світу" : "Поставити анімацію на паузу");
    btn.innerHTML = off ? "&#9654;" : "&#10074;&#10074;";
  }

  // Які кнопки доступні в поточному режимі: обертання й пауза — лише для 3D,
  // перемикач — коли у світу є і ілюстрація, і 3D.
  function syncMapTools() {
    const tools = $("#map-tools");
    const canSwitch = !!mapArt && has3D;
    tools.hidden = mapMode === "flat" && !canSwitch;
    ["rotate-left", "rotate-right", "motion"].forEach((t) => { tools.querySelector('[data-tool="' + t + '"]').hidden = !use3D; });
    const modeBtn = tools.querySelector('[data-tool="mode"]');
    modeBtn.hidden = !canSwitch;
    if (canSwitch) {
      const toArt = mapMode === "3d";
      modeBtn.innerHTML = toArt ? UI.icon("map") : "3D";
      modeBtn.setAttribute("aria-label", toArt ? "Показати намальовану карту" : "Показати 3D-карту");
      modeBtn.title = toArt ? "Намальована карта" : "3D-карта";
    }
  }

  function setMapMode(mode) {
    mapMode = mode;
    use3D = mode === "3d";
    try { localStorage.setItem(MODE_KEY, mode); } catch (e) { /* ignore */ }
    zoom = 1;
    renderMap();
    $("#map-stage").classList.toggle("is-compact", mapMode !== "flat" && $("#map-stage").clientWidth < 1100);
  }

  function setupMapTools() {
    watchCompact();
    syncMotionButton();
    $("#map-tools").addEventListener("click", (event) => {
      const btn = event.target.closest("[data-tool]");
      if (!btn) return;
      const tool = btn.dataset.tool;
      if (tool === "mode") {
        setMapMode(mapMode === "art" ? "3d" : "art");
        return;
      }
      if (tool !== "zoom-in" && tool !== "zoom-out" && !map3d) return;
      if (tool === "motion") {
        const on = UI.motion() === "off";
        UI.setMotion(on);
        syncMotionButton();
        if (on) map3d.start(); else map3d.stop();
        return;
      }
      if (tool === "rotate-left" || tool === "rotate-right") {
        map3d.rotate(tool === "rotate-left" ? -1 : 1);
        const states = locStates();
        renderPath(states);
        renderLabels(states);
      } else {
        zoom = Math.max(1, Math.min(2.5, zoom + (tool === "zoom-in" ? 0.5 : -0.5)));
        applyZoom();
      }
    });
    // Перетягування карти мишею, коли вона збільшена.
    const scroller = $("#map-scroll");
    let drag = null;
    scroller.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.target.closest("button, a")) return;
      drag = { x: e.clientX, y: e.clientY, left: scroller.scrollLeft, top: scroller.scrollTop };
      scroller.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", (e) => {
      if (!drag) return;
      scroller.scrollLeft = drag.left - (e.clientX - drag.x);
      scroller.scrollTop = drag.top - (e.clientY - drag.y);
    });
    window.addEventListener("pointerup", () => {
      drag = null;
      scroller.classList.remove("is-dragging");
    });
  }

  /* ---------- панель локації (список рівнів) ---------- */

  function levelRow(id, numberLabel) {
    const level = Game.getLevel(id);
    const st = Game.levelStatus(progress, id);
    const badge = st === "done" ? UI.icon("check") : st === "available" ? UI.icon("play") : UI.icon("lock");
    const inner =
      '<span class="lv-badge is-' + st + '">' + badge + "</span>" +
      '<span class="lv-num">' + numberLabel + "</span>" +
      '<span class="lv-title">' + UI.esc(level.title) + "<small>" + Game.TASK_LABELS[level.taskType] + "</small></span>" +
      '<span class="lv-xp">+' + Game.xpFor(level) + " XP</span>";
    return st === "locked"
      ? '<li><span class="lv-row is-locked" aria-disabled="true">' + inner + "</span></li>"
      : '<li><a class="lv-row is-' + st + '" href="' + levelUrl(id) + '">' + inner + "</a></li>";
  }

  function renderLocationPanel(locId) {
    const panel = $("#location-panel");
    if (!locId) {
      panel.hidden = true;
      return;
    }
    const loc = LOCATIONS.find((l) => l.id === locId);
    const status = Game.locationStatus(progress, loc);
    const lp = Game.locationProgress(progress, loc);
    panel.innerHTML =
      '<div class="panel-head"><div><p class="eyebrow">' + (status === "done" ? "Відновлено" : status === "current" ? "Поточна локація" : "Ще за туманом") +
      " · " + lp.done + " / " + lp.total + '</p><h2 id="panel-title">' + UI.esc(loc.name) + "</h2>" +
      '<p class="panel-event">' + (status === "done" ? UI.icon("check") + " " : "") + UI.esc(loc.event) + "</p></div>" +
      '<button type="button" class="icon-btn" data-close-panel aria-label="Закрити список місій">' + UI.icon("close") + "</button></div>" +
      (status === "locked" ? '<p class="panel-note">' + UI.icon("lock") + " Пройди попередню локацію, щоб відкрити шлях сюди.</p>" : "") +
      '<ol class="lv-list">' + loc.levels.map((id, index) => levelRow(id, index + 1)).join("") + "</ol>";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-labelledby", "panel-title");
    panel.hidden = false;
    panel.querySelector("[data-close-panel]").focus();
  }

  function selectLocation(locId) {
    selectedLocation = selectedLocation === locId ? null : locId;
    renderLabels(locStates());
    renderLocationPanel(selectedLocation);
  }

  /* ---------- картка поточної місії ---------- */

  let sceneTimer = null;

  function renderMissionCard() {
    const card = $("#mission-card");
    const currentId = Game.currentLevelId(progress);
    clearInterval(sceneTimer);
    if (!currentId) {
      const last = LOCATIONS[LOCATIONS.length - 1];
      card.innerHTML =
        '<p class="eyebrow">Усі ' + LEVELS.length + ' місій пройдено</p><h2 id="mission-title">Світ відновлено!</h2>' +
        '<p class="mission-story">' + UI.esc(last.event) + ". Можеш повертатися до будь-якої місії або вирушати порталом в інший світ.</p>" +
        '<div class="scene-frame"><canvas class="pixel scene-canvas" id="card-scene"></canvas></div>' +
        '<a class="btn btn-primary btn-lg" href="index.html#hub">' + UI.icon("portal") + "До порталів</a>";
      Art.renderScene($("#card-scene"), last.id, 1, { frame, world: Game.WORLD_ID });
      return;
    }
    const level = Game.getLevel(currentId);
    const loc = Game.locationOf(level);
    const index = loc.levels.indexOf(currentId);
    const before = index / loc.levels.length;
    card.innerHTML =
      '<p class="eyebrow">' + UI.esc(loc.name) + " · Місія " + (index + 1) + " з " + loc.levels.length + "</p>" +
      '<h2 id="mission-title">' + UI.esc(level.title) + "</h2>" +
      '<p class="mission-story">' + UI.md(level.missionStory) + "</p>" +
      '<div class="scene-frame"><canvas class="pixel scene-canvas" id="card-scene" role="img" aria-label="Сцена локації ' + UI.esc(loc.name) + '"></canvas></div>' +
      '<dl class="mission-meta">' +
      '<div><dt class="visually-hidden">Час</dt><dd>' + UI.icon("clock") + Game.estimate(level) + "</dd></div>" +
      '<div><dt class="visually-hidden">Нагорода</dt><dd class="xp-reward">' + UI.icon("star") + "+" + Game.xpFor(level) + " XP</dd></div>" +
      '<div><dt class="visually-hidden">Тип</dt><dd class="task-type">' + Game.TASK_LABELS[level.taskType] + "</dd></div>" +
      "</dl>" +
      '<a class="btn btn-primary btn-lg" href="' + levelUrl(currentId) + '">' + UI.icon("play") + "Почати місію</a>";
    const draw = () => Art.renderScene($("#card-scene"), loc.id, before, { frame, world: Game.WORLD_ID });
    draw();
    sceneTimer = setInterval(draw, 450);
  }

  /* ---------- інвентар ---------- */

  function renderInventory() {
    const html = LOCATIONS.map((loc) => {
      const owned = Game.locationStatus(progress, loc) === "done";
      return owned
        ? '<li class="slot is-filled" title="' + UI.esc(loc.trophy.name + " — " + loc.name) + '" data-item="' + loc.trophy.icon + '"><span class="visually-hidden">' + UI.esc(loc.trophy.name) + "</span></li>"
        : '<li class="slot" aria-label="Порожній слот: трофей локації ' + UI.esc(loc.name) + '"></li>';
    }).join("");
    const list = $("#inventory-slots");
    list.innerHTML = html;
    list.querySelectorAll("[data-item]").forEach((slot) => Art.mount(slot, Art.item(slot.dataset.item)));
  }

  /* =========================================================
     Екран локації: велика ілюстрація, місії на дисках стежки
     ========================================================= */

  const locArt = (window.LOCATION_ART || {})[Game.WORLD_ID] || {};
  let locZoom = 1;
  let locFxTimer = 0;

  // Колір «живих» частинок над ілюстрацією кожної локації.
  const LOC_MOTES = ["#ffd86b", "#ff9a4a", "#c8ff7a", "#7fe3ff", "#ffe9a8", "#b6ff8a", "#ffffff", "#ffcf4a", "#ffffff", "#fff2a8", "#ffd86b"];

  function hasLocationArt(id) {
    return !!locArt[id];
  }

  function renderLocation(id) {
    const loc = LOCATIONS.find((l) => l.id === id);
    const art = locArt[id];
    if (!loc || !art) {
      location.hash = "#map";
      return;
    }
    const status = Game.locationStatus(progress, loc);
    const lp = Game.locationProgress(progress, loc);
    const first = loc.levels[0], last = loc.levels[loc.levels.length - 1];

    $("#loc-back").innerHTML = UI.icon("arrowLeft") + "Карта світу";
    $("#loc-back").setAttribute("href", "#map");
    $("#loc-title").textContent = loc.name;
    $("#loc-range").textContent = first + "–" + last + " · " + loc.levels.length + " " + plural(loc.levels.length, "рівень", "рівні", "рівнів") + " · пройдено " + lp.done;

    // Ілюстрація без вбудованої верхньої смуги: контейнер має пропорції «видимої» частини.
    const visibleH = art.h - art.crop;
    const stage = $("#loc-stage");
    stage.style.aspectRatio = art.w + " / " + visibleH;
    const img = $("#loc-img");
    img.style.top = (-art.crop / visibleH) * 100 + "%";
    img.alt = "Ілюстрація локації «" + loc.name + "»";
    if (img.getAttribute("src") !== art.src) img.src = art.src;
    $("#loc-scroll").parentElement.style.setProperty("--loc-ratio", art.w / visibleH);

    const pos = ([x, y]) => 'left:' + (x / art.w) * 100 + "%;top:" + ((y - art.crop) / visibleH) * 100 + "%";
    const nodes = loc.levels.map((levelId, i) => {
      const level = Game.getLevel(levelId);
      const st = Game.levelStatus(progress, levelId);
      const point = art.nodes[i] || art.nodes[art.nodes.length - 1];
      const label = "Місія " + (i + 1) + ": " + level.title + " — " + (st === "done" ? "пройдено" : st === "available" ? "доступна" : "закрита");
      const inner = '<span class="ln-num">' + (i + 1) + "</span>" +
        (st === "done" ? '<span class="ln-badge">' + UI.icon("check") + "</span>" : st === "locked" ? '<span class="ln-badge is-lock">' + UI.icon("lock") + "</span>" : "") +
        '<span class="ln-tip">' + UI.esc(level.title) + "</span>" +
        (st === "available" ? '<span class="ln-here">Ти тут</span>' : "");
      return st === "locked"
        ? '<button type="button" class="loc-node is-locked" style="' + pos(point) + '" aria-label="' + UI.esc(label) + '" data-locked>' + inner + "</button>"
        : '<a class="loc-node is-' + st + '" style="' + pos(point) + '" href="' + levelUrl(levelId) + '" aria-label="' + UI.esc(label) + '">' + inner + "</a>";
    });
    if (art.trophy) {
      const owned = status === "done";
      nodes.push('<span class="loc-node loc-trophy' + (owned ? " is-owned" : "") + '" style="' + pos(art.trophy) + '" title="' + UI.esc((owned ? "" : "Трофей: ") + loc.trophy.name) + '" data-item="' + loc.trophy.icon + '"></span>');
    }
    $("#loc-nodes").innerHTML = nodes.join("");
    const trophyEl = document.querySelector("#loc-nodes .loc-trophy");
    if (trophyEl) Art.mount(trophyEl, Art.item(loc.trophy.icon), loc.trophy.name);

    // Кнопка «Увійти» веде на поточну місію локації.
    const enter = $("#loc-enter");
    const currentId = loc.levels.find((lid) => Game.levelStatus(progress, lid) === "available");
    if (status === "locked") {
      enter.innerHTML = UI.icon("lock") + "Закрито";
      enter.setAttribute("href", "#map");
      enter.classList.add("is-disabled");
      enter.setAttribute("aria-disabled", "true");
    } else {
      enter.classList.remove("is-disabled");
      enter.removeAttribute("aria-disabled");
      enter.innerHTML = UI.icon("play") + (status === "done" ? "Повторити" : lp.done ? "Продовжити" : "Увійти");
      enter.setAttribute("href", levelUrl(currentId || first));
    }

    $("#loc-event").innerHTML =
      '<p class="eyebrow">' + (status === "done" ? "Світова подія відбулась" : status === "current" ? "Відбудова триває" : "Ще за туманом") + "</p>" +
      "<h2>" + (status === "done" ? UI.icon("check") + " " : "") + UI.esc(loc.event) + "</h2>" +
      '<div class="xp-bar" role="progressbar" aria-label="Пройдено місій локації" aria-valuemin="0" aria-valuemax="' + lp.total + '" aria-valuenow="' + lp.done + '"><span style="width:' + Math.round(lp.ratio * 100) + '%"></span></div>' +
      "<p>" + lp.done + " з " + lp.total + " місій · трофей: «" + UI.esc(loc.trophy.name) + "»</p>";
    $("#loc-list").innerHTML = loc.levels.map((lid, i) => levelRow(lid, i + 1)).join("");

    locZoom = 1;
    applyLocZoom();
    startLocFx(LOC_MOTES[(id - 1) % LOC_MOTES.length]);
    document.title = "JS Quest — " + loc.name;
  }

  function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  function applyLocZoom() {
    $("#loc-stage").style.width = locZoom * 100 + "%";
    $("#loc-scroll").classList.toggle("is-zoomed", locZoom > 1);
  }

  // Живий шар над ілюстрацією: світлячки/іскри повільно здіймаються й мерехтять.
  function startLocFx(color) {
    cancelAnimationFrame(locFxTimer);
    const canvas = $("#loc-fx");
    const ctx = canvas.getContext("2d");
    const motes = Array.from({ length: 34 }, (_, i) => ({ x: Math.random(), y: Math.random(), s: 0.6 + Math.random() * 1.4, v: 0.008 + Math.random() * 0.02, p: Math.random() * 6.28, i }));
    let last = performance.now();
    function frame(now) {
      locFxTimer = requestAnimationFrame(frame);
      if (now - last < 40) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      ctx.clearRect(0, 0, w, h);
      if (UI.motion() === "off") return;
      motes.forEach((m) => {
        m.y -= m.v * dt * 3;
        m.p += dt * 2;
        if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); }
        const glow = 0.35 + 0.65 * Math.abs(Math.sin(m.p));
        const r = m.s * Math.max(1.2, w / 700);
        ctx.globalAlpha = glow * 0.85;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc((m.x + Math.sin(m.p * 0.7) * 0.01) * w, m.y * h, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = glow * 0.18;
        ctx.beginPath();
        ctx.arc((m.x + Math.sin(m.p * 0.7) * 0.01) * w, m.y * h, r * 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    locFxTimer = requestAnimationFrame(frame);
  }

  /* =========================================================
     Проєкти й журнал локацій світу
     ========================================================= */

  function renderProjects() {
    $("#projects-title").textContent = "Проєкти: " + Game.meta.name;
    $("#projects-grid").innerHTML = Game.projects.map((id) => {
      const level = Game.getLevel(id);
      const st = Game.levelStatus(progress, id);
      const loc = Game.locationOf(level);
      const label = st === "done" ? "Виконано" : st === "available" ? "Доступно" : "Заблоковано";
      const body =
        '<span class="project-status is-' + st + '">' + UI.icon(st === "done" ? "check" : st === "available" ? "play" : "lock") + label + "</span>" +
        "<h3>" + UI.esc(level.title) + "</h3>" +
        "<p>" + UI.md(level.missionStory) + "</p>" +
        '<span class="project-meta">' + UI.esc(loc.name) + " · Рівень " + id + " · +" + Game.xpFor(level) + " XP</span>";
      return st === "locked"
        ? '<article class="card project is-locked" aria-disabled="true">' + body + "</article>"
        : '<a class="card project" href="' + levelUrl(id) + '">' + body + "</a>";
    }).join("");

    $("#journal").innerHTML = LOCATIONS.map((loc) => {
      const st = Game.locationStatus(progress, loc);
      const lp = Game.locationProgress(progress, loc);
      return (
        '<details class="card journal-item is-' + st + '"' + (st === "current" ? " open" : "") + ">" +
        "<summary>" +
        '<span class="journal-icon">' + UI.icon(st === "done" ? "check" : st === "current" ? "compass" : "lock") + "</span>" +
        '<span class="journal-name">' + UI.esc(loc.name) + "<small>" + loc.arcs.map((a) => "Арка " + toRoman(a)).join(", ") + " · " + UI.esc(Game.getLevel(loc.levels[0]).arc) + "</small></span>" +
        '<span class="journal-count">' + lp.done + " / " + lp.total + "</span>" +
        UI.icon("chevronDown", "journal-chevron") +
        "</summary>" +
        '<ol class="lv-list">' + loc.levels.map((id) => levelRow(id, id)).join("") + "</ol></details>"
      );
    }).join("");
  }

  /* =========================================================
     Профіль героя (усі світи)
     ========================================================= */

  function renderProfile() {
    const totalXp = Game.totalXpAll();
    const hero = Game.heroLevel(totalXp);
    const pct = Math.round((hero.current / hero.needed) * 100);
    const worlds = Game.playableWorlds().map((w) => Game.forWorld(w.id));
    const stats = worlds.reduce((acc, api) => {
      const p = api.load();
      acc.done += p.completed.length;
      acc.total += api.LEVELS.length;
      acc.bestStreak = Math.max(acc.bestStreak, p.bestStreak);
      acc.trophies += api.trophies(p).length;
      acc.locations += api.LOCATIONS.length;
      return acc;
    }, { done: 0, total: 0, bestStreak: 0, trophies: 0, locations: 0 });

    $("#profile").innerHTML =
      '<section class="card profile-hero" aria-label="Герой">' +
      '<div class="profile-avatar" id="profile-avatar"></div>' +
      '<div class="profile-info"><p class="eyebrow">Мандрівник між світами</p><h2>Рівень ' + hero.level + "</h2>" +
      '<div class="xp-head"><span>До рівня ' + (hero.level + 1) + "</span><span>" + hero.current + " / " + hero.needed + " XP</span></div>" +
      '<div class="xp-bar" role="progressbar" aria-label="Досвід до наступного рівня" aria-valuemin="0" aria-valuemax="' + hero.needed + '" aria-valuenow="' + hero.current + '"><span style="width:' + pct + '%"></span></div>' +
      '<dl class="stats">' +
      "<div><dt>Місій пройдено</dt><dd>" + stats.done + " / " + stats.total + "</dd></div>" +
      "<div><dt>Усього досвіду</dt><dd>" + totalXp + " XP</dd></div>" +
      "<div><dt>Серія в цьому світі</dt><dd>" + UI.icon("flame") + progress.streak + "</dd></div>" +
      "<div><dt>Найкраща серія</dt><dd>" + stats.bestStreak + "</dd></div>" +
      "<div><dt>Земель відновлено</dt><dd>" + stats.trophies + " / " + stats.locations + "</dd></div>" +
      "</dl></div></section>" +
      worlds.map((api) => {
        const p = api.load();
        return '<h2 class="section-title">Трофеї: ' + UI.esc(api.meta.name) + ' <small class="section-sub">' + p.completed.length + " / " + api.LEVELS.length + " місій</small></h2>" +
          '<ul class="trophy-grid">' +
          api.LOCATIONS.map((loc) => {
            const has = api.locationStatus(p, loc) === "done";
            return '<li class="card trophy' + (has ? " is-owned" : "") + '"><div class="trophy-art" data-item="' + loc.trophy.icon + '"></div>' +
              "<div><h3>" + (has ? UI.esc(loc.trophy.name) : "???") + "</h3><p>" + UI.esc(loc.name) + "</p>" +
              '<p class="trophy-event">' + (has ? UI.icon("check") + UI.esc(loc.event) : "Відкриється після проходження локації") + "</p></div></li>";
          }).join("") + "</ul>";
      }).join("") +
      '<div class="danger-zone"><button type="button" class="btn btn-ghost" id="reset-progress">' + UI.icon("reset") + "Почати пригоду спочатку</button></div>";
    Art.mount($("#profile-avatar"), Art.hero(), "Аватар героя");
    document.querySelectorAll(".trophy-art").forEach((el) => {
      const c = Art.mount(el, Art.item(el.dataset.item));
      if (!el.closest(".is-owned")) c.classList.add("is-silhouette");
    });
    $("#reset-progress").addEventListener("click", () => {
      if (window.confirm("Скинути прогрес, досвід, чернетки й трофеї в усіх світах? Цю дію не можна скасувати.")) {
        GameStore.reset(Game.playableWorlds().map((w) => w.id));
        progress = Game.load();
        renderAll();
        UI.toast(UI.icon("reset") + " Пригоду розпочато заново");
      }
    });
  }

  /* ---------- світові події (показуємо один раз) ---------- */

  function celebrateNewTrophies() {
    const fresh = Game.trophies(progress).filter((loc) => !progress.celebrated.includes(loc.id));
    if (!fresh.length) return;
    fresh.forEach((loc, i) => {
      setTimeout(() => {
        UI.toast(
          '<span class="toast-icon" data-item="' + loc.trophy.icon + '"></span><span><strong>Світова подія: ' + UI.esc(loc.event) +
          "</strong><br>Отримано трофей «" + UI.esc(loc.trophy.name) + "»</span>",
          "is-trophy"
        );
        const slot = document.querySelector(".toast:last-child .toast-icon");
        if (slot) Art.mount(slot, Art.item(loc.trophy.icon));
      }, 600 + i * 1200);
    });
    progress.celebrated = progress.celebrated.concat(fresh.map((l) => l.id));
    GameStore.save(progress, Game.WORLD_ID);
  }

  /* ---------- розділи ---------- */

  const VIEWS = ["hub", "map", "location", "projects", "handbook", "trophies"];
  const TITLES = { hub: "світи", map: "карта світу", location: "локація", projects: "проєкти", handbook: "довідник", trophies: "трофеї" };

  // #loc-3 — екран локації з ілюстрацією (якщо вона є для цього світу).
  function hashLocation() {
    const m = location.hash.match(/^#loc-(\d+)$/);
    return m && hasLocationArt(Number(m[1])) ? Number(m[1]) : null;
  }

  function currentView() {
    const name = location.hash.slice(1);
    if (hashLocation()) return "location";
    if (VIEWS.includes(name)) return name;
    // Без хешу: якщо в URL обрано світ — його карта, інакше світ-хаб.
    return Game.hasWorldParam ? "map" : "hub";
  }

  function showView() {
    const view = currentView();
    VIEWS.forEach((v) => { document.getElementById("view-" + v).hidden = v !== view; });
    if (map3d && view !== "map") map3d.stop();
    if (view !== "location") cancelAnimationFrame(locFxTimer);
    UI.setActiveNav($("#sidebar"), view === "location" ? "map" : view);
    if (view === "location") renderLocation(hashLocation());
    if (view === "hub") renderHub();
    if (view === "projects") renderProjects();
    if (view === "handbook") Handbook.render($("#handbook"), { root: "", world: Game.WORLD_ID });
    if (view === "trophies") renderProfile();
    if (view === "map") renderMap();
    if (view !== "location") document.title = "JS Quest — " + TITLES[view];
  }

  function renderAll() {
    renderXp();
    renderInventory();
    renderMissionCard();
    showView();
  }

  /* ---------- старт ---------- */

  UI.renderSidebar($("#sidebar"), currentView(), "");
  setupMapTools();
  renderAll();
  if (currentView() === "map") celebrateNewTrophies();

  window.addEventListener("hashchange", () => {
    showView();
    window.scrollTo(0, 0);
    $("#main").focus({ preventScroll: true });
  });

  $("#map-labels").addEventListener("click", (event) => {
    const btn = event.target.closest(".loc-label");
    if (!btn) return;
    const id = Number(btn.dataset.loc);
    // Є ілюстрація локації — відкриваємо її екран; інакше — панель зі списком місій.
    if (hasLocationArt(id)) location.hash = "#loc-" + id;
    else selectLocation(id);
  });

  $("#view-location").addEventListener("click", (event) => {
    const zoomBtn = event.target.closest("[data-loc-zoom]");
    if (zoomBtn) {
      locZoom = Math.max(1, Math.min(2.5, locZoom + Number(zoomBtn.dataset.locZoom) * 0.5));
      applyLocZoom();
      return;
    }
    if (event.target.closest("[data-locked]")) {
      UI.toast(UI.icon("lock") + " <span>Ця місія відкриється, щойно пройдеш попередню.</span>");
      return;
    }
    const enter = event.target.closest("#loc-enter.is-disabled");
    if (enter) {
      event.preventDefault();
      UI.toast(UI.icon("lock") + " <span>Локація ще за туманом — пройди попередню.</span>");
    }
  });

  $("#hub-labels").addEventListener("click", (event) => {
    const btn = event.target.closest("[data-portal]");
    if (!btn) return;
    const world = WORLDS.find((w) => w.id === btn.dataset.portal);
    const status = Game.worldStatus(world);
    UI.toast(UI.icon(status === "locked" ? "lock" : "hammer") + " <span><strong>" + UI.esc(world.name) + "</strong><br>" +
      (status === "locked" ? "Портал відчиниться, коли пройдеш " + UI.esc(requirementText(world)) + "." : "Цей світ ще будується — портал відчиниться згодом.") + "</span>");
  });

  $("#location-panel").addEventListener("click", (event) => {
    if (event.target.closest("[data-close-panel]")) selectLocation(selectedLocation);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && selectedLocation) {
      const id = selectedLocation;
      selectLocation(id);
      const label = document.querySelector('.loc-label[data-loc="' + id + '"]');
      if (label) label.focus();
    }
  });

  // Повернулися з місії через «назад» (bfcache) — оновлюємо прогрес.
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      progress = Game.load();
      renderAll();
    }
  });

  // Легка анімація світу: вогнища, портали, блискавка (~3 кадри/с).
  // Працює, доки гравець не поставив анімацію на паузу.
  setInterval(() => {
    if (UI.motion() === "off") return;
    frame++;
    if (!$("#view-map").hidden) drawMap();
    if (!$("#view-hub").hidden) drawHub();
  }, 350);
})();
