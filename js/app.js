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
    UI.refreshSidebarHero($("#sidebar"), "");
  }

  /* =========================================================
     Світ-хаб: зала порталів
     ========================================================= */

  const HUB_STATUS_TEXT = { open: "портал відчинено", done: "світ пройдено", locked: "портал запечатано", soon: "світ будується" };

  function portalStates() {
    return WORLDS.map((w) => {
      const status = Game.worldStatus(w);
      const api = status === "soon" ? null : Game.forWorld(w.id);
      return { world: w, status, api, completion: api ? api.completion() : null };
    });
  }

  function requirementText(world) {
    return world.requires.map((id) => "«" + WORLDS.find((w) => w.id === id).name + "»").join(" і ");
  }

  const isOpen = (s) => s.status === "open" || s.status === "done";

  // Вибраний портал: спершу — світ, у якому гравець був востаннє.
  let selectedWorld = Game.WORLD_ID;

  function renderHub() {
    const states = portalStates();
    if (!states.some((s) => s.world.id === selectedWorld)) selectedWorld = states[0].world.id;
    const open = states.filter(isOpen).length;
    const soon = states.length - open;
    $("#hub-count").textContent = open + " " + plural(open, "світ доступний", "світи доступні", "світів доступно") + " · " + soon + " незабаром";

    const art = window.HUB_ART;
    const W = art.w, H = art.h;
    $("#hub-labels").innerHTML = states.map((s) => {
      const p = art.portals[s.world.id];
      if (!p) return "";
      const [x, y] = p.label;
      const LABEL_HALF_W = 104, LABEL_HALF_H = 28;
      const style = "left:" + ((x - LABEL_HALF_W) / W) * 100 + "%;width:" + ((LABEL_HALF_W * 2) / W) * 100 + "%;top:" + (p.top / H) * 100 +
        "%;height:" + ((y + LABEL_HALF_H - p.top) / H) * 100 + "%";
      const selected = s.world.id === selectedWorld;
      const badge = s.status === "done" ? '<span class="portal-badge is-done">' + UI.icon("check") + "</span>" : "";
      return '<button type="button" class="portal-spot is-' + s.status + (selected ? " is-selected" : "") + '" style="' + style + '" data-portal="' + s.world.id +
        '" aria-pressed="' + selected + '" aria-label="' + UI.esc(s.world.name + " (" + s.world.tech + "): " + HUB_STATUS_TEXT[s.status]) + '">' +
        '<span class="portal-label">' + badge + '<strong>' + UI.esc(s.world.name) + "</strong><small>" + UI.esc(s.world.tech) + "</small></span></button>";
    }).join("");

    renderWorldPanel(states.find((s) => s.world.id === selectedWorld));

    // На вузькому екрані сцена гортається вбік — показуємо вибраний портал.
    const scene = $(".hub-scene");
    const spot = $('#hub-labels [data-portal="' + selectedWorld + '"]');
    if (spot && scene.scrollWidth > scene.clientWidth) {
      scene.scrollLeft = spot.offsetLeft + spot.offsetWidth / 2 - scene.clientWidth / 2;
    }
  }

  // Права панель: опис вибраного світу, прогрес і наступний крок.
  function renderWorldPanel(s) {
    const w = s.world;
    let html = '<p class="eyebrow">' + UI.esc(w.tech) + '</p><h2 class="wp-title">' + UI.esc(w.name) + '</h2><p class="wp-blurb">' + UI.esc(w.blurb) + "</p>";
    if (!isOpen(s)) {
      const note = s.status === "locked"
        ? "Портал відчиниться, коли пройдеш " + UI.esc(requirementText(w)) + "."
        : "Цей світ ще будується — портал відчиниться згодом." + (w.requires.length ? " Щоб увійти, знадобиться пройти " + UI.esc(requirementText(w)) + "." : "");
      html += '<p class="wp-note">' + UI.icon(s.status === "locked" ? "lock" : "hammer") + "<span>" + note + "</span></p>";
      $("#world-panel").innerHTML = html;
      return;
    }
    const api = s.api;
    const c = s.completion;
    const pct = Math.round(c.ratio * 100);
    const progress = api.load();
    const nextId = api.currentLevelId(progress);
    const nextLoc = nextId ? api.locationOf(nextId) : null;
    const thumb = nextLoc && (window.LOCATION_ART || {})[w.id] && window.LOCATION_ART[w.id][nextLoc.id];
    html +=
      '<div class="wp-stats">' +
      '<div class="wp-stat"><span class="wp-ic">' + UI.icon("flag") + "</span>" + c.total + " " + plural(c.total, "місія", "місії", "місій") + "</div>" +
      '<div class="wp-stat"><span class="wp-ic">' + UI.icon("pin") + "</span>" + api.LOCATIONS.length + " " + plural(api.LOCATIONS.length, "локація", "локації", "локацій") + "</div>" +
      "</div>" +
      '<div class="wp-progress"><div class="wp-progress-head"><span>Пройдено ' + c.done + " із " + c.total + "</span><span>" + pct + "%</span></div>" +
      '<div class="xp-bar is-mint" role="progressbar" aria-label="Пройдено місій" aria-valuemin="0" aria-valuemax="' + c.total + '" aria-valuenow="' + c.done +
      '"><span style="width:' + Math.max(pct, c.done ? 2 : 0) + '%"></span></div></div>';
    if (nextLoc) {
      html +=
        '<h3 class="wp-subtitle">Твій наступний крок</h3>' +
        '<a class="next-step" href="index.html?world=' + w.id + "#loc-" + nextLoc.id + '">' +
        (thumb ? '<img src="' + thumb.src + '" alt="" loading="lazy">' : '<span class="next-step-ph">' + UI.icon("compass") + "</span>") +
        "<span>" + UI.esc(nextLoc.name) + "</span>" + UI.icon("chevronRight") + "</a>" +
        '<a class="btn btn-primary btn-block" data-action="continue" data-world="' + w.id + '" data-level="' + nextId + '" href="' + api.levelUrl(nextId) + '">' +
        (c.done ? "Продовжити пригоду" : "Почати пригоду") + UI.icon("arrowRight") + "</a>" +
        UI.actionSlot("continue", { world: w.id, level: nextId, place: "hub" });
    } else {
      html += '<p class="wp-note is-done">' + UI.icon("check") + "<span>Світ повністю відновлено — можна повертатися до будь-якої місії.</span></p>" +
        '<a class="btn btn-primary btn-block" href="index.html?world=' + w.id + '#map">До карти світу' + UI.icon("arrowRight") + "</a>";
    }
    html += '<a class="wp-link" href="index.html?world=' + w.id + '#map">' + UI.icon("map") + "Відкрити карту світу</a>";
    $("#world-panel").innerHTML = html;
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
  // "flat" — пласка піксельна (для світу без ілюстрації).
  const mapArt = (window.MAP_ART || {})[Game.WORLD_ID] || null;
  const mapMode = mapArt ? "art" : "flat";

  // Геометрія карти: розмір полотна й екранні точки локацій.
  function geom() {
    if (mapMode === "art") {
      return { w: mapArt.w, h: mapArt.h, point: (id) => mapArt.points[id], labelPos: {}, trail: [] };
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
    if (mapMode !== "flat") return states; // ілюстрація статична
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
      $("#map-canvas").setAttribute("aria-label", "Піксельна карта світу «" + Game.meta.name + "»");
    }
    const states = drawMap();
    let current = LOCATIONS.find((loc) => states[loc.id].status === "current") || LOCATIONS[LOCATIONS.length - 1];
    if (isArt) {
      // Герой уже намальований на ілюстрації; поточну локацію показує підпис «Ти тут».
      $("#map-hero").hidden = true;
    } else {
      $("#map-hero").hidden = false;
      current = placeHero(states);
    }
    const G = geom();
    $("#map-stage").style.aspectRatio = G.w + " / " + G.h;
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

  // На невеликій карті підписи стискаються до значків, щоб не налазити один на одного;
  // повна назва — у поточної локації та при наведенні/фокусі.
  function watchCompact() {
    const stage = $("#map-stage");
    const update = () => stage.classList.toggle("is-compact", mapMode !== "flat" && stage.clientWidth < 1100);
    if (window.ResizeObserver) new ResizeObserver(update).observe(stage);
    update();
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

  // Сцена картки: ілюстрація локації з Мандрівником (як на екрані місії),
  // а для локації без ілюстрації — піксельна сценка.
  function cardScene(loc, levelId, before) {
    const art = (window.LOCATION_ART || {})[Game.WORLD_ID] && LOCATION_ART[Game.WORLD_ID][loc.id];
    const frameEl = $("#card-scene-frame");
    if (art) {
      const index = levelId ? loc.levels.indexOf(levelId) : loc.levels.length - 1;
      frameEl.classList.add("has-art");
      frameEl.innerHTML = Scene.html({
        art, loc, levelId, completed: progress.completed, root: "",
        label: "Сцена локації " + loc.name + (levelId ? ", місія " + (index + 1) + " з " + loc.levels.length : ""),
      });
      Scene.watch(frameEl.querySelector(".scene-art"), art, () => index);
      return;
    }
    frameEl.innerHTML = '<canvas class="pixel scene-canvas" id="card-scene" role="img" aria-label="Сцена локації ' + UI.esc(loc.name) + '"></canvas>';
    const draw = () => Art.renderScene($("#card-scene"), loc.id, before, { frame, world: Game.WORLD_ID });
    draw();
    sceneTimer = setInterval(draw, 450);
  }

  function renderMissionCard() {
    const card = $("#mission-card");
    const currentId = Game.currentLevelId(progress);
    clearInterval(sceneTimer);
    if (!currentId) {
      const last = LOCATIONS[LOCATIONS.length - 1];
      card.innerHTML =
        '<p class="eyebrow">Усі ' + LEVELS.length + ' місій пройдено</p><h2 id="mission-title">Світ відновлено!</h2>' +
        '<p class="mission-story">' + UI.esc(last.event) + ". Можеш повертатися до будь-якої місії або вирушати порталом в інший світ.</p>" +
        '<div class="scene-frame" id="card-scene-frame"></div>' +
        '<a class="btn btn-primary btn-lg" href="index.html#hub">' + UI.icon("portal") + "До порталів</a>";
      cardScene(last, null, 1);
      return;
    }
    const level = Game.getLevel(currentId);
    const loc = Game.locationOf(level);
    const index = loc.levels.indexOf(currentId);
    card.innerHTML =
      '<p class="eyebrow">' + UI.esc(loc.name) + " · Місія " + (index + 1) + " з " + loc.levels.length + "</p>" +
      '<h2 id="mission-title">' + UI.esc(level.title) + "</h2>" +
      '<p class="mission-story">' + UI.md(level.missionStory) + "</p>" +
      '<div class="scene-frame" id="card-scene-frame"></div>' +
      '<dl class="mission-meta">' +
      '<div><dt class="visually-hidden">Час</dt><dd>' + UI.icon("clock") + Game.estimate(level) + "</dd></div>" +
      '<div><dt class="visually-hidden">Нагорода</dt><dd class="xp-reward">' + UI.icon("star") + "+" + Game.xpFor(level) + " XP</dd></div>" +
      '<div><dt class="visually-hidden">Тип</dt><dd class="task-type">' + Game.TASK_LABELS[level.taskType] + "</dd></div>" +
      "</dl>" +
      '<a class="btn btn-primary btn-lg" data-action="continue" data-world="' + Game.WORLD_ID + '" data-level="' + currentId + '" href="' + levelUrl(currentId) + '">' + UI.icon("play") + "Почати місію</a>" +
      UI.actionSlot("continue", { world: Game.WORLD_ID, level: currentId, place: "map" });
    cardScene(loc, currentId, index / loc.levels.length);
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
    list.querySelectorAll("[data-item]").forEach((slot) => Art.mountTrophy(slot, slot.dataset.item));
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
    if (trophyEl) Art.mountTrophy(trophyEl, loc.trophy.icon, { title: loc.trophy.name });

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
    document.title = "Кодомандри — " + loc.name;
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

  // Картка трофея: назва, за що (світова подія), локація й навички її місій;
  // для закритого — умова отримання й поточний поступ. Усе — з даних світу.
  function trophyCard(api, p, loc) {
    const has = api.locationStatus(p, loc) === "done";
    const lp = api.locationProgress(p, loc);
    const skills = Array.from(new Set(loc.levels.map((id) => api.getLevel(id).arc).filter(Boolean)));
    const facts =
      '<dl class="trophy-facts">' +
      "<div><dt>Локація</dt><dd>" + UI.esc(loc.name) + "</dd></div>" +
      (skills.length ? "<div><dt>" + (skills.length > 1 ? "Навички" : "Навичка") + "</dt><dd>" + UI.esc(skills.join(", ")) + "</dd></div>" : "") +
      "</dl>";
    const body = has
      ? '<p class="trophy-why">' + UI.icon("check") + "<span><strong>За що:</strong> " + UI.esc(loc.event) + ".</span></p>"
      : '<p class="trophy-why">' + UI.icon("lock") + "<span><strong>Як отримати:</strong> пройди всі " + lp.total + " " + plural(lp.total, "місію", "місії", "місій") +
        " локації «" + UI.esc(loc.name) + "».</span></p>" +
        '<div class="trophy-progress"><div class="xp-bar is-mint" role="progressbar" aria-label="Поступ до трофея «' + UI.esc(loc.trophy.name) + '»" aria-valuemin="0" aria-valuemax="' + lp.total +
        '" aria-valuenow="' + lp.done + '"><span style="width:' + Math.round((lp.done / lp.total) * 100) + '%"></span></div><span>' + lp.done + " з " + lp.total + "</span></div>";
    return '<li class="card trophy' + (has ? " is-owned" : "") + '"><div class="trophy-art" data-item="' + loc.trophy.icon + '"></div>' +
      '<div class="trophy-info"><h3>' + UI.esc(loc.trophy.name) + ' <span class="trophy-badge">' + (has ? "Отримано" : "Закрито") + "</span></h3>" +
      facts + body + "</div></li>";
  }

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
          api.LOCATIONS.map((loc) => trophyCard(api, p, loc)).join("") + "</ul>";
      }).join("") +
      // Резервні копії прогресу: розділ з'являється, щойно модуль збереження додасть дії в гніздо.
      '<section class="card save-panel" aria-labelledby="save-title"><div><h2 id="save-title">Збереження прогресу</h2>' +
      "<p>Резервна копія прогресу, досвіду й рішень усіх світів.</p></div>" + UI.actionSlot("backup", { place: "profile" }) + "</section>" +
      '<div class="danger-zone"><button type="button" class="btn btn-ghost" id="reset-progress">' + UI.icon("reset") + "Почати пригоду спочатку</button></div>";
    Art.mount($("#profile-avatar"), Art.hero(), "Аватар героя");
    document.querySelectorAll(".trophy-art").forEach((el) => {
      const c = Art.mountTrophy(el, el.dataset.item);
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
        if (slot) Art.mountTrophy(slot, loc.trophy.icon);
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
    if (view !== "location") cancelAnimationFrame(locFxTimer);
    UI.setActiveNav($("#sidebar"), view === "location" ? "map" : view);
    if (view === "location") renderLocation(hashLocation());
    if (view === "hub") renderHub();
    if (view === "projects") renderProjects();
    if (view === "handbook") Handbook.render($("#handbook"), { root: "", world: Game.WORLD_ID });
    if (view === "trophies") renderProfile();
    if (view === "map") renderMap();
    if (view !== "location") document.title = "Кодомандри — " + TITLES[view];
  }

  function renderAll() {
    renderXp();
    renderInventory();
    renderMissionCard();
    showView();
  }

  /* ---------- старт ---------- */

  UI.renderSidebar($("#sidebar"), currentView(), "");
  UI.warnStorage();
  watchCompact();
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
    const id = btn.dataset.portal;
    // Повторний клік по вже вибраному відчиненому порталу — одразу на карту світу.
    const world = WORLDS.find((w) => w.id === id);
    const status = Game.worldStatus(world);
    if (id === selectedWorld && (status === "open" || status === "done")) {
      location.href = "index.html?world=" + id + "#map";
      return;
    }
    selectedWorld = id;
    renderHub();
    const again = document.querySelector('#hub-labels [data-portal="' + id + '"]');
    if (again) again.focus({ preventScroll: true });
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

  // Легка анімація світу: вогнища, блискавка (~3 кадри/с).
  setInterval(() => {
    frame++;
    if (!$("#view-map").hidden) drawMap();
  }, 350);
})();
