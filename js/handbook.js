/* =========================================================
   handbook.js — «Довідник героя»: книга знань, яка заповнюється
   в міру проходження місій. Кожна пройдена місія відкриває
   сторінку з теорією, прикладом, підказкою, власним рішенням
   гравця та еталонним рішенням. Непройдені сторінки — «???».

   Працює у двох режимах:
     • page   — окремий розділ на головній (index.html#handbook)
     • drawer — бічна панель на екрані місії (підглянути, не виходячи)
   Для кожного світу — своя книга; світ обирається в панелі.
   ========================================================= */
(function () {
  "use strict";

  const CODE_TYPES = ["write-function", "fix-code", "write-markup", "fix-markup"];
  const isMarkup = (level) => level.taskType === "write-markup" || level.taskType === "fix-markup";

  // Мова прикладів світу: HTML/CSS-світ показує розмітку, решта — JavaScript.
  function exampleLang(level) {
    return level.exampleLang || (isMarkup(level) ? "html" : "js");
  }

  // Рішення як набір файлів: JS — один рядок, верстка — { html, css }.
  function filesOf(value, level) {
    if (!value) return [];
    if (!isMarkup(level)) return [{ name: "", code: value, lang: "js" }];
    const obj = typeof value === "string" ? safeParse(value) : value;
    if (!obj) return [];
    return [
      obj.html != null && level.starterHtml != null ? { name: "index.html", code: obj.html, lang: "html" } : null,
      obj.css != null && level.starterCss != null ? { name: "style.css", code: obj.css, lang: "css" } : null,
    ].filter(Boolean);
  }

  function safeParse(text) {
    try { return JSON.parse(text); } catch (e) { return null; }
  }

  function answerHtml(level) {
    if (level.taskType === "predict-output") {
      return '<pre class="code-block">' + UI.highlight(level.code, exampleLang(level)) + "</pre>" +
        '<p class="hb-label">' + UI.esc(level.answerLabel || "Вивід консолі") + '</p><pre class="code-block hb-output">' + UI.esc(level.expectedAnswer.join("\n")) + "</pre>";
    }
    if (level.taskType === "multiple-choice") {
      return (level.code ? '<pre class="code-block">' + UI.highlight(level.code, exampleLang(level)) + "</pre>" : "") +
        '<p class="hb-label">Правильна відповідь</p><pre class="code-block">' + UI.highlight(level.expectedAnswer, level.optionsLang || exampleLang(level)) + "</pre>";
    }
    if (level.taskType === "fill-blank") {
      let i = 0;
      const filled = level.starterCode.replace(/___/g, () => level.expectedAnswer[i++][0]);
      return '<p class="hb-label">Заповнений код</p><pre class="code-block">' + UI.highlight(filled, exampleLang(level)) + "</pre>";
    }
    return "";
  }

  function entryHtml(level, W, ctx) {
    const isCode = CODE_TYPES.includes(level.taskType);
    const own = isCode ? GameStore.getDraft(level.id, W.WORLD_ID) : null;
    const ownFiles = filesOf(own, level);
    const solFiles = filesOf(level.solution, level);
    const sameAsSolution = ownFiles.length && ownFiles.every((f, i) => solFiles[i] && f.code === solFiles[i].code);
    const showOwn = ownFiles.length && !sameAsSolution && ownFiles.some((f) => f.code.trim());
    const blocks = [
      '<p class="hb-concept">' + UI.md(level.concept) + "</p>",
      level.example ? codeWithCopy("Приклад", level.example, exampleLang(level)) : "",
      '<p class="hb-label">Завдання</p><p>' + UI.md(level.prompt) + "</p>",
      showOwn ? ownFiles.map((f) => codeWithCopy("Твоє рішення" + (f.name ? " · " + f.name : ""), f.code, f.lang)).join("") : "",
      isCode
        ? solFiles.map((f) => codeWithCopy((showOwn ? "Еталонне рішення" : "Рішення") + (f.name ? " · " + f.name : ""), f.code, f.lang)).join("")
        : answerHtml(level),
      '<p class="hb-hint">' + UI.icon("bulb") + "<span>" + UI.md(level.hint) + "</span></p>",
      '<a class="btn btn-ghost hb-replay" href="' + W.levelUrl(level.id, ctx.root) + '">' + UI.icon("reset") + "Повторити місію</a>",
    ];
    return (
      '<details class="hb-entry" data-id="' + level.id + '">' +
      '<summary><span class="hb-num">' + level.id + '</span><span class="hb-title">' + UI.esc(level.title) +
      "<small>" + Game.TASK_LABELS[level.taskType] + "</small></span>" + UI.icon("chevronDown", "hb-chev") + "</summary>" +
      '<div class="hb-body">' + blocks.join("") + "</div></details>"
    );
  }

  function codeWithCopy(label, code, lang) {
    return '<div class="hb-code"><div class="hb-code-head"><p class="hb-label">' + UI.esc(label) + "</p>" +
      '<button type="button" class="hb-copy" data-copy aria-label="Копіювати: ' + UI.esc(label) + '">' + UI.icon("copy") + "<span>Копіювати</span></button></div>" +
      '<pre class="code-block">' + UI.highlight(code, lang) + "</pre></div>";
  }

  function lockedHtml(level) {
    return '<div class="hb-entry is-locked" aria-label="Закрита сторінка ' + level.id + '"><span class="hb-num">' + level.id + "</span>" +
      '<span class="hb-title">???<small>Відкриється після проходження місії</small></span>' + UI.icon("lock", "hb-chev") + "</div>";
  }

  // Текст, за яким шукаємо (лише відкриті сторінки — спойлерів у пошуку немає).
  function searchText(level) {
    const sol = typeof level.solution === "object" && level.solution ? Object.values(level.solution).join(" ") : level.solution;
    return [level.title, level.concept, level.example, level.prompt, level.hint, sol, level.locationName]
      .filter(Boolean).join(" ").toLowerCase();
  }

  /**
   * Малює довідник у контейнер.
   * opts: { root: "" | "../", world, location: id локації для фільтра, openId }
   */
  function render(container, opts) {
    const ctx = Object.assign({ root: "", world: Game.WORLD_ID, location: "all", openId: null }, opts);
    const W = Game.forWorld(ctx.world) || Game;
    const progress = W.load();
    const done = new Set(progress.completed);
    const uid = "hb" + Math.random().toString(36).slice(2, 7);
    const worlds = Game.playableWorlds();

    container.innerHTML =
      '<div class="hb-toolbar">' +
      (worlds.length > 1
        ? '<label class="hb-filter"><span class="visually-hidden">Світ</span><select id="' + uid + '-world">' +
          worlds.map((w) => '<option value="' + w.id + '"' + (w.id === W.WORLD_ID ? " selected" : "") + ">" + UI.esc(w.tech) + "</option>").join("") +
          "</select></label>"
        : "") +
      '<label class="hb-search"><span class="visually-hidden">Пошук у довіднику</span>' + UI.icon("search") +
      '<input type="search" id="' + uid + '-q" placeholder="Пошук: ' + UI.esc(W.WORLD_ID === "web" ? "flex, grid, form…" : "map, if, localStorage…") + '" autocomplete="off"></label>' +
      '<label class="hb-filter"><span class="visually-hidden">Локація</span><select id="' + uid + '-loc">' +
      '<option value="all">Усі локації</option>' +
      W.LOCATIONS.map((l) => '<option value="' + l.id + '">' + UI.esc(l.name) + "</option>").join("") +
      "</select></label>" +
      '<p class="hb-count">Відкрито сторінок: <strong>' + done.size + "</strong> з " + W.LEVELS.length + "</p>" +
      "</div>" +
      '<div class="hb-list" id="' + uid + '-list"></div>';

    const q = container.querySelector("#" + uid + "-q");
    const sel = container.querySelector("#" + uid + "-loc");
    const list = container.querySelector("#" + uid + "-list");
    const worldSel = container.querySelector("#" + uid + "-world");
    sel.value = String(ctx.location);
    if (!sel.value) sel.value = "all";

    function draw() {
      const term = q.value.trim().toLowerCase();
      const locFilter = sel.value;
      const html = W.LOCATIONS.filter((loc) => locFilter === "all" || String(loc.id) === locFilter).map((loc) => {
        const levels = loc.levels.map((id) => W.getLevel(id));
        const opened = levels.filter((l) => done.has(l.id));
        const visible = term ? opened.filter((l) => searchText(l).includes(term)) : levels;
        if (!visible.length) return "";
        return '<section class="hb-group"><h2>' + UI.esc(loc.name) + "<span>" + opened.length + " / " + levels.length + "</span></h2>" +
          visible.map((l) => (done.has(l.id) ? entryHtml(l, W, ctx) : lockedHtml(l))).join("") + "</section>";
      }).join("");
      list.innerHTML = html || '<p class="hb-empty">' + (term ? "Нічого не знайдено серед відкритих сторінок." : "Тут поки порожньо — пройди першу місію, і довідник почне заповнюватися.") + "</p>";
      if (ctx.openId) {
        const el = list.querySelector('.hb-entry[data-id="' + ctx.openId + '"]');
        if (el && el.tagName === "DETAILS") el.open = true;
      }
    }

    q.addEventListener("input", draw);
    sel.addEventListener("change", draw);
    if (worldSel) {
      worldSel.addEventListener("change", () => {
        render(container, Object.assign({}, ctx, { world: worldSel.value, location: "all", openId: null }));
        container.querySelector("select").focus();
      });
    }
    list.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-copy]");
      if (!btn) return;
      const code = btn.closest(".hb-code").querySelector("pre").textContent;
      copyText(code).then(() => {
        btn.querySelector("span").textContent = "Скопійовано";
        setTimeout(() => { btn.querySelector("span").textContent = "Копіювати"; }, 1500);
      });
    });
    draw();
    return { focusSearch: () => q.focus() };
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    fallbackCopy(text);
    return Promise.resolve();
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    ta.remove();
  }

  // Бічна шухляда на екрані місії. Нативний <dialog> сам тримає фокус і закривається Esc.
  function openDrawer(opts) {
    let dialog = document.getElementById("handbook-drawer");
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = "handbook-drawer";
      dialog.className = "drawer";
      dialog.setAttribute("aria-labelledby", "drawer-title");
      dialog.innerHTML =
        '<div class="drawer-head"><h2 id="drawer-title">' + UI.icon("book") + "Довідник героя</h2>" +
        '<button type="button" class="icon-btn" data-close aria-label="Закрити довідник">' + UI.icon("close") + "</button></div>" +
        '<div class="drawer-body"></div>';
      document.body.appendChild(dialog);
      dialog.querySelector("[data-close]").addEventListener("click", () => dialog.close());
      dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
    }
    const api = render(dialog.querySelector(".drawer-body"), opts);
    dialog.showModal();
    api.focusSearch();
  }

  window.Handbook = { render, openDrawer, filesOf };
})();
