/* =========================================================
   app.js — Екран 1: карта світу, а також розділи
   «Проєкти» (журнал локацій) і «Трофеї» (профіль героя).
   Перемикання розділів — через #hash, без перезавантаження.
   ========================================================= */
(function () {
  "use strict";

  const { LEVELS, LOCATIONS } = Game;
  const $ = (sel) => document.querySelector(sel);

  // Де стоїть підпис локації відносно опорної точки (у пікселях карти)
  // і з якого боку від точки він вирівнюється.
  const LABEL_POS = {
    1: { dx: 0, dy: 6 }, 2: { dx: 0, dy: 6 }, 3: { dx: 0, dy: 6 }, 4: { dx: 0, dy: 6 },
    5: { dx: 0, dy: 6 }, 6: { dx: 0, dy: 6 }, 7: { dx: 0, dy: 6 }, 8: { dx: 0, dy: 4 },
    9: { dx: 0, dy: 6 }, 10: { dx: -14, dy: 8, align: "right" }, 11: { dx: 0, dy: 6 },
  };

  let progress = GameStore.load();
  let frame = 0;
  let selectedLocation = null;

  /* ---------- допоміжне ---------- */

  function levelUrl(id) {
    return "levels/level.html?id=" + id;
  }

  function locStates() {
    const states = {};
    LOCATIONS.forEach((loc) => {
      const status = Game.locationStatus(progress, loc);
      states[loc.id] = { progress: Game.locationProgress(progress, loc).ratio, locked: status === "locked", status };
    });
    return states;
  }

  /* ---------- шкала досвіду ---------- */

  function renderXp() {
    const hero = Game.heroLevel(progress.xp);
    const pct = Math.round((hero.current / hero.needed) * 100);
    $("#xp-card").innerHTML =
      '<div class="xp-head"><strong>Рівень ' + hero.level + '</strong><span>' + hero.current + " / " + hero.needed + " XP</span></div>" +
      '<div class="xp-bar" role="progressbar" aria-label="Досвід до наступного рівня" aria-valuemin="0" aria-valuemax="' + hero.needed +
      '" aria-valuenow="' + hero.current + '"><span style="width:' + pct + '%"></span></div>';
  }

  /* ---------- карта ---------- */

  function segmentPath(points, i) {
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    return "M" + p1.join(" ") + " C" + c1.join(" ") + " " + c2.join(" ") + " " + p2.join(" ");
  }

  function renderPath(states) {
    // Стежка проходить трохи нижче опорних точок — по землі перед орієнтирами.
    const points = LOCATIONS.map((loc) => {
      const [x, y] = Art.MAP_POINTS[loc.id];
      return [x, loc.id === 10 ? y - 6 : y + 1];
    });
    let html = "";
    for (let i = 0; i < points.length - 1; i++) {
      const from = states[LOCATIONS[i].id].status;
      const to = states[LOCATIONS[i + 1].id].status;
      const cls = from === "done" && to === "done" ? "is-done" : from === "done" ? "is-next" : "is-locked";
      html += '<path class="trail ' + cls + '" d="' + segmentPath(points, i) + '"/>';
    }
    $("#map-path").innerHTML = html;
  }

  function renderLabels(states) {
    const html = LOCATIONS.map((loc) => {
      const st = states[loc.id];
      const [x, y] = Art.MAP_POINTS[loc.id];
      const pos = LABEL_POS[loc.id];
      const left = ((x + pos.dx) / Art.MAP_W) * 100;
      const top = ((y + pos.dy) / Art.MAP_H) * 100;
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
        '<span class="loc-name">' + iconHtml + UI.esc(loc.name) + "</span>" +
        (st.status === "current" ? '<span class="loc-here">Ти тут</span>' : "") +
        "</button>"
      );
    }).join("");
    $("#map-labels").innerHTML = html;
  }

  function placeHero(states) {
    const current = LOCATIONS.find((loc) => states[loc.id].status === "current") || LOCATIONS[LOCATIONS.length - 1];
    const [x, y] = Art.MAP_POINTS[current.id];
    const heroEl = $("#map-hero");
    if (!heroEl.firstChild) Art.mount(heroEl, Art.hero());
    // На «Вершині вежі» герой стоїть прямо на даху вежі.
    const offsetX = current.id === 10 ? -8 : -24;
    const baseY = current.id === 10 ? y + 14 : y + 2;
    heroEl.style.left = ((x + offsetX) / Art.MAP_W) * 100 + "%";
    heroEl.style.top = ((baseY - 22) / Art.MAP_H) * 100 + "%";
    return current;
  }

  function drawMap() {
    const states = locStates();
    Art.renderMap($("#map-canvas"), states, frame);
    return states;
  }

  function renderMap() {
    const states = drawMap();
    renderPath(states);
    renderLabels(states);
    const current = placeHero(states);
    // На вузьких екранах карта прокручується — показуємо поточну локацію.
    const scroller = $("#map-scroll");
    if (scroller.scrollWidth > scroller.clientWidth) {
      const [x] = Art.MAP_POINTS[current.id];
      scroller.scrollLeft = (x / Art.MAP_W) * scroller.scrollWidth - scroller.clientWidth / 2;
    }
  }

  /* ---------- панель локації (список рівнів) ---------- */

  function renderLocationPanel(locId) {
    const panel = $("#location-panel");
    if (!locId) {
      panel.hidden = true;
      return;
    }
    const loc = LOCATIONS.find((l) => l.id === locId);
    const status = Game.locationStatus(progress, loc);
    const lp = Game.locationProgress(progress, loc);
    const rows = loc.levels.map((id, index) => {
      const level = Game.getLevel(id);
      const st = Game.levelStatus(progress, id);
      const badge = st === "done" ? UI.icon("check") : st === "available" ? UI.icon("play") : UI.icon("lock");
      const inner =
        '<span class="lv-badge is-' + st + '">' + badge + "</span>" +
        '<span class="lv-num">' + (index + 1) + "</span>" +
        '<span class="lv-title">' + UI.esc(level.title) + '<small>' + Game.TASK_LABELS[level.taskType] + "</small></span>" +
        '<span class="lv-xp">+' + Game.xpFor(level) + " XP</span>";
      return st === "locked"
        ? '<li><span class="lv-row is-locked" aria-disabled="true">' + inner + "</span></li>"
        : '<li><a class="lv-row is-' + st + '" href="' + levelUrl(id) + '">' + inner + "</a></li>";
    }).join("");
    panel.innerHTML =
      '<div class="panel-head"><div><p class="eyebrow">' + (status === "done" ? "Відновлено" : status === "current" ? "Поточна локація" : "Ще за туманом") +
      " · " + lp.done + " / " + lp.total + '</p><h2 id="panel-title">' + UI.esc(loc.name) + "</h2>" +
      '<p class="panel-event">' + (status === "done" ? UI.icon("check") + " " : "") + UI.esc(loc.event) + "</p></div>" +
      '<button type="button" class="icon-btn" data-close-panel aria-label="Закрити список місій">' + UI.icon("close") + "</button></div>" +
      (status === "locked" ? '<p class="panel-note">' + UI.icon("lock") + " Пройди попередню локацію, щоб відкрити шлях сюди.</p>" : "") +
      '<ol class="lv-list">' + rows + "</ol>";
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
      card.innerHTML =
        '<p class="eyebrow">Усі 96 місій пройдено</p><h2 id="mission-title">Королівство врятоване!</h2>' +
        '<p class="mission-story">Замок відбудовано, баги приборкано. Можеш повертатися до будь-якої місії, щоб повторити теми.</p>' +
        '<div class="scene-frame"><canvas class="pixel scene-canvas" id="card-scene"></canvas></div>' +
        '<a class="btn btn-primary btn-lg" href="index.html#projects">' + UI.icon("book") + "Журнал місій</a>";
      Art.renderScene($("#card-scene"), 11, 1, { frame });
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
    const draw = () => Art.renderScene($("#card-scene"), loc.id, before, { frame });
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

  /* ---------- проєкти й журнал ---------- */

  const PROJECT_IDS = [61, 68, 75, 79, 96];

  function renderProjects() {
    $("#projects-grid").innerHTML = PROJECT_IDS.map((id) => {
      const level = Game.getLevel(id);
      const st = Game.levelStatus(progress, id);
      const loc = Game.locationOf(level);
      const label = st === "done" ? "Виконано" : st === "available" ? "Доступно" : "Заблоковано";
      const body =
        '<span class="project-status is-' + st + '">' + UI.icon(st === "done" ? "check" : st === "available" ? "play" : "lock") + label + "</span>" +
        '<h3>' + UI.esc(level.title) + "</h3>" +
        '<p>' + UI.md(level.missionStory) + "</p>" +
        '<span class="project-meta">' + UI.esc(loc.name) + " · Рівень " + id + " · +" + Game.xpFor(level) + " XP</span>";
      return st === "locked"
        ? '<article class="card project is-locked" aria-disabled="true">' + body + "</article>"
        : '<a class="card project" href="' + levelUrl(id) + '">' + body + "</a>";
    }).join("");

    $("#journal").innerHTML = LOCATIONS.map((loc) => {
      const st = Game.locationStatus(progress, loc);
      const lp = Game.locationProgress(progress, loc);
      const rows = loc.levels.map((id) => {
        const level = Game.getLevel(id);
        const s = Game.levelStatus(progress, id);
        const inner = '<span class="lv-badge is-' + s + '">' + UI.icon(s === "done" ? "check" : s === "available" ? "play" : "lock") + "</span>" +
          '<span class="lv-num">' + id + "</span>" +
          '<span class="lv-title">' + UI.esc(level.title) + "<small>" + Game.TASK_LABELS[level.taskType] + "</small></span>" +
          '<span class="lv-xp">+' + Game.xpFor(level) + " XP</span>";
        return s === "locked" ? '<li><span class="lv-row is-locked" aria-disabled="true">' + inner + "</span></li>" : '<li><a class="lv-row is-' + s + '" href="' + levelUrl(id) + '">' + inner + "</a></li>";
      }).join("");
      return (
        '<details class="card journal-item is-' + st + '"' + (st === "current" ? " open" : "") + ">" +
        "<summary>" +
        '<span class="journal-icon">' + UI.icon(st === "done" ? "check" : st === "current" ? "compass" : "lock") + "</span>" +
        '<span class="journal-name">' + UI.esc(loc.name) + "<small>" + loc.arcs.map((a) => "Арка " + toRoman(a)).join(", ") + " · " + UI.esc(Game.getLevel(loc.levels[0]).arc) + "</small></span>" +
        '<span class="journal-count">' + lp.done + " / " + lp.total + "</span>" +
        UI.icon("chevronDown", "journal-chevron") +
        "</summary>" +
        '<ol class="lv-list">' + rows + "</ol></details>"
      );
    }).join("");
  }

  function toRoman(n) {
    return ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV"][n];
  }

  /* ---------- профіль ---------- */

  function renderProfile() {
    const hero = Game.heroLevel(progress.xp);
    const pct = Math.round((hero.current / hero.needed) * 100);
    const owned = Game.trophies(progress).length;
    $("#profile").innerHTML =
      '<section class="card profile-hero" aria-label="Герой">' +
      '<div class="profile-avatar" id="profile-avatar"></div>' +
      '<div class="profile-info"><p class="eyebrow">Мандрівник королівства</p><h2>Рівень ' + hero.level + "</h2>" +
      '<div class="xp-head"><span>До рівня ' + (hero.level + 1) + "</span><span>" + hero.current + " / " + hero.needed + " XP</span></div>" +
      '<div class="xp-bar" role="progressbar" aria-label="Досвід до наступного рівня" aria-valuemin="0" aria-valuemax="' + hero.needed + '" aria-valuenow="' + hero.current + '"><span style="width:' + pct + '%"></span></div>' +
      '<dl class="stats">' +
      "<div><dt>Місій пройдено</dt><dd>" + progress.completed.length + " / " + LEVELS.length + "</dd></div>" +
      "<div><dt>Усього досвіду</dt><dd>" + progress.xp + " XP</dd></div>" +
      "<div><dt>Серія з першої спроби</dt><dd>" + UI.icon("flame") + progress.streak + "</dd></div>" +
      "<div><dt>Найкраща серія</dt><dd>" + progress.bestStreak + "</dd></div>" +
      "<div><dt>Земель відновлено</dt><dd>" + owned + " / " + LOCATIONS.length + "</dd></div>" +
      "</dl></div></section>" +
      '<h2 class="section-title">Трофеї</h2>' +
      '<ul class="trophy-grid">' +
      LOCATIONS.map((loc) => {
        const has = Game.locationStatus(progress, loc) === "done";
        return '<li class="card trophy' + (has ? " is-owned" : "") + '"><div class="trophy-art" data-item="' + loc.trophy.icon + '"></div>' +
          "<div><h3>" + (has ? UI.esc(loc.trophy.name) : "???") + "</h3><p>" + UI.esc(loc.name) + "</p>" +
          '<p class="trophy-event">' + (has ? UI.icon("check") + UI.esc(loc.event) : "Відкриється після проходження локації") + "</p></div></li>";
      }).join("") +
      "</ul>" +
      '<div class="danger-zone"><button type="button" class="btn btn-ghost" id="reset-progress">' + UI.icon("reset") + "Почати пригоду спочатку</button></div>";
    Art.mount($("#profile-avatar"), Art.hero(), "Аватар героя");
    document.querySelectorAll(".trophy-art").forEach((el) => {
      const c = Art.mount(el, Art.item(el.dataset.item));
      if (!el.closest(".is-owned")) c.classList.add("is-silhouette");
    });
    $("#reset-progress").addEventListener("click", () => {
      if (window.confirm("Скинути весь прогрес, досвід і трофеї? Цю дію не можна скасувати.")) {
        GameStore.reset();
        progress = GameStore.load();
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
    GameStore.save(progress);
  }

  /* ---------- розділи ---------- */

  const VIEWS = ["map", "projects", "trophies"];

  function showView() {
    const name = (location.hash || "#map").slice(1);
    const view = VIEWS.includes(name) ? name : "map";
    VIEWS.forEach((v) => { document.getElementById("view-" + v).hidden = v !== view; });
    UI.setActiveNav($("#sidebar"), view);
    if (view === "projects") renderProjects();
    if (view === "trophies") renderProfile();
    if (view === "map") renderMap();
    document.title = "JS Quest — " + { map: "карта світу", projects: "проєкти", trophies: "трофеї" }[view];
  }

  function renderAll() {
    renderXp();
    renderInventory();
    renderMissionCard();
    showView();
  }

  /* ---------- старт ---------- */

  UI.renderSidebar($("#sidebar"), "map", "");
  renderAll();
  celebrateNewTrophies();

  window.addEventListener("hashchange", () => {
    showView();
    window.scrollTo(0, 0);
    $("#main").focus({ preventScroll: true });
  });

  $("#map-labels").addEventListener("click", (event) => {
    const btn = event.target.closest(".loc-label");
    if (btn) selectLocation(Number(btn.dataset.loc));
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
      progress = GameStore.load();
      renderAll();
    }
  });

  // Легка анімація світу: вогнища, смолоскипи, блискавка (~3 кадри/с).
  // Поважаємо налаштування «зменшити рух».
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    setInterval(() => {
      frame++;
      if (!$("#view-map").hidden) drawMap();
    }, 350);
  }
})();
