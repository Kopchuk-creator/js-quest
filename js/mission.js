/* =========================================================
   mission.js — Екран 2: проходження місії (?id=N).
   Ліворуч — легенда, завдання, чеклист, теорія й підказка;
   по центру — редактор/відповідь, кнопки й консоль;
   праворуч — сцена, що реагує на результат.
   ========================================================= */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const main = $("#main");

  const params = new URLSearchParams(location.search);
  const levelId = Number(params.get("id")) || 1;
  const level = Game.getLevel(levelId);
  document.title = level ? "Кодомандри — " + level.title : "Кодомандри — місію не знайдено";

  UI.renderSidebar($("#sidebar"), "practice", "../");
  UI.warnStorage();

  if (!level) {
    main.innerHTML =
      '<section class="card locked-screen"><h1>Такої місії немає</h1><p>У королівстві лише ' + Game.LEVELS.length +
      ' місій. Повернися на карту й обери шлях звідти.</p><a class="btn btn-primary" href="' + Game.mapUrl("../") + '">' + UI.icon("map") + "На карту</a></section>";
    return;
  }

  const loc = Game.locationOf(level);
  const indexInLoc = loc.levels.indexOf(levelId);
  const isCodeTask = level.taskType === "write-function" || level.taskType === "fix-code";
  const isMarkup = level.taskType === "write-markup" || level.taskType === "fix-markup";
  const usesEditor = isCodeTask || isMarkup;
  // Мова фрагментів коду рівня: у світі HTML/CSS — розмітка, інакше JavaScript.
  const lang = level.exampleLang || (isMarkup || Game.WORLD_ID === "web" ? "html" : "js");
  // Файли редактора: для JS — один, для верстки — index.html і/або style.css.
  const FILES = isMarkup
    ? [
        { key: "html", name: "index.html", lang: "html", badge: "HTML", starter: level.starterHtml },
        { key: "css", name: "style.css", lang: "css", badge: "CSS", starter: level.starterCss },
      ].filter((file) => file.starter != null)
    : [{ key: "js", name: fileName(), lang: "js", badge: "JS", starter: level.starterCode }];

  // Послідовне розблокування: до закритої місії по прямому посиланню не потрапити.
  const startProgress = GameStore.load();
  if (!Game.isUnlocked(startProgress, levelId)) {
    const current = Game.currentLevelId(startProgress);
    main.innerHTML =
      '<section class="card locked-screen"><div class="locked-art"></div><h1>Ця місія ще за туманом</h1>' +
      "<p>«" + UI.esc(level.title) + "» відкриється, щойно ти пройдеш попередню місію. Шлях королівства прокладають крок за кроком.</p>" +
      '<div class="locked-actions"><a class="btn btn-primary" href="' + Game.levelUrl(current, "../") + '">' + UI.icon("play") + "До поточної місії</a>" +
      '<a class="btn btn-ghost" href="' + Game.mapUrl("../") + '">' + UI.icon("map") + "На карту</a></div></section>";
    Art.mount($(".locked-art"), Art.landmark(loc.id, 1, 0, true, Game.WORLD_ID), "Затуманена локація");
    return;
  }
  const alreadyDone = startProgress.completed.includes(levelId);
  const requestedStage = params.get("stage") === "variation";
  if (!alreadyDone) Game.setResume(levelId, "mission");

  const state = {
    solved: false,
    running: false,
    // Пройдена місія показує вже відновлену сцену.
    sceneProgress: (indexInLoc + (alreadyDone ? 1 : 0)) / loc.levels.length,
    frame: 0,
    sparkle: null,
  };

  const MENTOR_START = {
    "predict-output": "Простеж кожен рядок і впиши, що побачить консоль.",
    "multiple-choice": "Подумай над кожним варіантом — лише один правильний.",
    "fill-blank": "Бракує одного шматочка коду. Знайдеш його?",
    "write-function": "Код відкриває нові світи!",
    "fix-code": "Тут завівся баг. Знайди його — і світ оживе!",
    "write-markup": "Збудуй сторінку — і на острові виросте нова будівля!",
    "fix-markup": "Верстка поїхала. Полагодь її — і будівельники повернуться до роботи!",
  };

  const MENTOR_FAIL = [
    "Майже! Світ ще не відгукнувся — глянь у консоль, яка перевірка не пройшла.",
    "Баги хитрі, але ти хитріший. Перевір позначки ✗ у консолі й спробуй ще раз.",
    "Жодних штрафів — лише нова спроба. Порівняй «очікувалось» і «отримано».",
    "Спокійно, мандрівнику. Кожна помилка — це підказка. Відкрий «Підказку», якщо треба.",
  ];

  /* ---------- розмітка ---------- */

  function dotsHtml() {
    const progress = GameStore.load();
    const dense = loc.levels.length > 12 ? " is-dense" : "";
    return '<ol class="dots' + dense + '" aria-label="Місії локації">' + loc.levels.map((id, i) => {
      const st = id === levelId ? "is-current" : progress.completed.includes(id) ? "is-done" : "";
      return '<li class="dot ' + st + '"><span class="visually-hidden">Місія ' + (i + 1) + (st === "is-done" ? " — пройдена" : st === "is-current" ? " — поточна" : "") + "</span></li>";
    }).join("") + "</ol>";
  }

  function checklistItems() {
    if (usesEditor) {
      const items = [];
      const names = isMarkup ? [] : level.functionName ? [level.functionName] : level.exports || [];
      if (names.length) items.push({ key: "declared", label: "Оголошено " + names.map((n) => "`" + n + "`").join(", ") });
      (level.codeChecks || []).forEach((c, i) => items.push({ key: "check" + i, label: c.label }));
      items.push({ key: "tests", label: (isMarkup ? "Усі перевірки сторінки пройдено (" : "Усі тести пройдено (") + level.testCases.length + ")" });
      return items;
    }
    if (level.taskType === "predict-output") return [{ key: "filled", label: "Вписано вивід кожного рядка" }, { key: "correct", label: "Вивід збігається з консоллю" }];
    if (level.taskType === "multiple-choice") return [{ key: "filled", label: "Обрано варіант" }, { key: "correct", label: "Варіант правильний" }];
    return [{ key: "filled", label: "Пропуск заповнено" }, { key: "correct", label: "Код працює як треба" }];
  }

  // Якщо в локації є ілюстрований екран — повертаємось на нього, інакше на карту світу.
  function locationUrl() {
    const art = (window.LOCATION_ART || {})[Game.WORLD_ID];
    return art && art[loc.id] ? "../index.html?world=" + Game.WORLD_ID + "#loc-" + loc.id : Game.mapUrl("../");
  }

  function fileName() {
    if (level.fileName) return level.fileName;
    if (level.functionName) return level.functionName + ".js";
    return "quest.js";
  }

  function codeViewHtml(code) {
    const lines = code.split("\n").length;
    return '<div class="editor is-readonly"><div class="gutter" aria-hidden="true">' + Array.from({ length: lines }, (_, i) => i + 1).join("\n") +
      '</div><div class="code-area"><pre class="code-hl"><code>' + UI.highlight(code, lang) + "\n</code></pre></div></div>";
  }

  function centerHtml() {
    const badge = (text, cls) => '<span class="js-badge' + (cls ? " is-" + cls : "") + '">' + text + "</span>";
    let tabs;
    if (usesEditor) {
      tabs = FILES.map((file, i) =>
        '<button type="button" class="tab' + (i === 0 ? " is-active" : "") + '" role="tab" aria-selected="' + (i === 0) + '" data-file="' + i + '">' +
        badge(file.badge, file.lang) + UI.esc(file.name) + "</button>"
      );
      if (isMarkup) tabs.push('<button type="button" class="tab tab-preview" role="tab" aria-selected="false" data-preview>' + UI.icon("eye") + "Перегляд</button>");
    } else {
      tabs = ['<span class="tab is-active">' + badge(lang.toUpperCase(), lang) + UI.esc(level.fileName || (lang === "js" ? fileName() : "index.html")) + "</span>"];
    }
    (level.readonlyFiles || []).forEach((f) => tabs.push('<span class="tab is-readonly" title="Лише для читання">' + badge("JS") + UI.esc(f.name) + "</span>"));
    let body = "";
    let actionLabel = "Перевірити";
    if (usesEditor) {
      if (isCodeTask) actionLabel = "Запустити";
      body =
        '<div class="editor" id="editor"><div class="gutter" id="gutter" aria-hidden="true">1</div>' +
        '<div class="code-area"><pre class="code-hl" aria-hidden="true"><code id="code-hl"></code></pre>' +
        '<textarea id="code" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Редактор коду ' + UI.esc(FILES[0].name) + '" aria-describedby="editor-help"></textarea></div></div>' +
        (isMarkup ? '<div class="preview" id="preview" hidden><iframe id="preview-frame" title="Перегляд сторінки" sandbox="allow-same-origin"></iframe></div>' : "");
    } else if (level.taskType === "predict-output") {
      const labels = level.lineLabels || [];
      const lines = level.expectedAnswer.map((_, i) =>
        '<div class="answer-line" data-line="' + i + '"><label for="out-' + i + '">' + UI.esc(labels[i] || "Рядок " + (i + 1)) + '</label><input class="text-input" id="out-' + i +
        '" autocomplete="off" spellcheck="false" placeholder="' + UI.esc(level.answerPlaceholder || "вивід console.log") + '"><span class="mark" aria-hidden="true"></span></div>'
      ).join("");
      body = codeViewHtml(level.code) + '<div class="answer-zone"><h3>' + UI.esc(level.answerHeading || "Що виведе консоль?") + "</h3>" + lines + "</div>";
    } else if (level.taskType === "multiple-choice") {
      const opts = level.options.map((o, i) =>
        '<label class="option" data-option="' + i + '"><input type="radio" name="choice" value="' + i + '"><pre>' + UI.highlight(o, level.optionsLang || lang) + "</pre></label>"
      ).join("");
      body = (level.code ? codeViewHtml(level.code) : "") +
        '<div class="answer-zone"><fieldset class="options" style="border:0;margin:0;padding:0"><legend class="visually-hidden">' + UI.esc(level.prompt) + "</legend>" + opts + "</fieldset></div>";
    } else {
      const parts = level.starterCode.split("___");
      const lines = level.starterCode.split("\n").length;
      const html = parts.map((p, i) => UI.highlight(p, lang) + (i < parts.length - 1
        ? '<input class="text-input blank-input" data-blank="' + i + '" aria-label="Пропуск ' + (i + 1) + '" autocomplete="off" spellcheck="false">' : "")).join("");
      body = '<div class="editor is-readonly"><div class="gutter" aria-hidden="true">' + Array.from({ length: lines }, (_, i) => i + 1).join("\n") +
        '</div><div class="code-area"><pre class="code-hl is-interactive"><code>' + html + "\n</code></pre></div></div>";
    }
    return (
      '<div class="tabs" role="' + (usesEditor ? "tablist" : "presentation") + '" aria-label="Файли">' + tabs.join("") + "</div>" + body +
      '<div class="editor-actions">' +
      '<button type="button" class="btn btn-primary" id="run">' + UI.icon("play") + actionLabel + "</button>" +
      '<button type="button" class="btn btn-ghost" id="reset">' + UI.icon("reset") + "Скинути</button>" +
      '<span class="kbd-hint" id="editor-help">' + (usesEditor ? "<kbd>Ctrl</kbd>+<kbd>Enter</kbd> — " + (isCodeTask ? "запуск" : "перевірка") + " · <kbd>Esc</kbd>, потім <kbd>Tab</kbd> — вийти з редактора" : "<kbd>Enter</kbd> — перевірити") + "</span>" +
      "</div>"
    );
  }

  function leftHtml() {
    const extra = [];
    if (level.html) {
      extra.push('<details class="disclosure" open><summary>' + UI.icon("code") + "Розмітка сторінки" + UI.icon("chevronRight", "chev") + '</summary><div class="disclosure-body"><pre class="code-block">' + UI.esc(level.html) + "</pre></div></details>");
    }
    (level.readonlyFiles || []).forEach((f) => {
      extra.push('<details class="disclosure" open><summary>' + UI.icon("code") + UI.esc(f.name) + UI.icon("chevronRight", "chev") + '</summary><div class="disclosure-body"><pre class="code-block">' + UI.highlight(f.code) + "</pre></div></details>");
    });
    return (
      '<div class="mentor" id="mentor"><div class="mentor-art"></div><p class="bubble" id="mentor-text" aria-live="polite">' + MENTOR_START[level.taskType] + "</p></div>" +
      "<h2>Твоє завдання</h2>" +
      '<p class="m-story">' + UI.md(level.missionStory) + "</p>" +
      '<p class="m-prompt">' + UI.md(level.prompt) + "</p>" +
      (level.criteria ? '<p class="m-criteria"><strong>Зараховано, якщо:</strong> ' + UI.md(level.criteria) + "</p>" : "") +
      extra.join("") +
      '<ul class="checklist" id="checklist" aria-label="Критерії виконання">' + checklistItems().map((it) =>
        '<li class="check-item" data-key="' + it.key + '"><span class="check-box">' + UI.icon("check") + '</span><span>' + UI.md(it.label) + '</span><span class="visually-hidden check-state">не виконано</span></li>'
      ).join("") + "</ul>" +
      understandingHtml() +
      '<details class="disclosure" id="theory"><summary>' + UI.icon("book") + "Сувій знань" + UI.icon("chevronRight", "chev") + '</summary><div class="disclosure-body"><p>' + UI.md(level.concept) + "</p>" +
      (level.example ? '<pre class="code-block">' + UI.highlight(level.example, level.exampleLang || UI.guessLang(level.example, lang)) + "</pre>" : "") + "</div></details>" +
      '<details class="disclosure" id="hint"><summary>' + UI.icon("bulb") + "Поступова підказка" + UI.icon("chevronRight", "chev") + '</summary><div class="disclosure-body"><p id="hint-stage" aria-live="polite">Спершу запитання, потім ідея з «Сувою знань», далі — короткий приклад.</p><button type="button" class="btn btn-ghost btn-sm" id="hint-next">Показати запитання</button><div id="solution-slot"></div></div></details>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="review-toggle" aria-pressed="' + ((startProgress.review || []).includes(levelId)) + '">' + ((startProgress.review || []).includes(levelId) ? "Прибрати з повторення" : "Позначити для повторення") + '</button>'
    );
  }

  /* Перевірка розуміння: автотести місії, зміна умови (автоперевірка) і
     запитання, яке перевіряє ментор, — три окремі статуси. */
  function understandingHtml() {
    const u = level.understanding;
    if (!u) return "";
    const v = u.variation;
    const status = (key, label, value) =>
      '<li data-u="' + key + '"><span class="u-mark" aria-hidden="true">' + UI.icon("check") + "</span>" + label + ": <strong>" + value + "</strong></li>";
    const answer = v.type === "predict"
      ? codeViewHtml(v.code) + v.expectedAnswer.map((_, i) =>
        '<div class="answer-line" data-vline="' + i + '"><label for="vout-' + i + '">Рядок ' + (i + 1) + '</label><input class="text-input" id="vout-' + i +
        '" autocomplete="off" spellcheck="false" placeholder="вивід console.log"><span class="mark" aria-hidden="true"></span></div>').join("")
      : '<p class="u-note">Зміни свій код у редакторі й натисни «Перевірити зміну» — запустяться лише тести зміни.</p>';
    return (
      '<section class="understand" id="understand" aria-labelledby="understand-title">' +
      '<h3 id="understand-title">Перевірка розуміння</h3>' +
      '<ul class="u-status">' +
      status("tests", "Автотести місії", "ще ні") +
      status("variation", "Зміна умови", "ще ні") +
      status("mentor", "Пояснення", "перевіряє ментор") +
      "</ul>" +
      '<div class="u-block"><h4>Запитання <span class="u-tag">перевіряє ментор</span></h4><p>' + UI.md(u.question) + "</p>" +
      '<p class="u-note">Автоматично не оцінюється: поясни відповідь наставнику своїми словами.</p></div>' +
      '<div class="u-block"><h4>Зміна умови <span class="u-tag is-auto">автоперевірка</span></h4><p>' + UI.md(v.prompt) + "</p>" + answer +
      '<div class="u-actions"><button type="button" class="btn btn-ghost btn-sm" id="u-run">' + UI.icon("play") + "Перевірити зміну</button>" +
      '<span class="u-locked" id="u-locked">Відкриється після проходження автотестів місії.</span></div>' +
      '<p class="u-feedback" id="u-feedback" aria-live="polite"></p></div>' +
      "</section>"
    );
  }

  function syncUnderstanding() {
    const box = $("#understand");
    if (!box) return;
    const progress = GameStore.load();
    const testsDone = state.solved || progress.completed.includes(levelId);
    const variationDone = progress.variations.includes(levelId);
    const set = (key, done, text) => {
      const item = box.querySelector('[data-u="' + key + '"]');
      item.classList.toggle("is-pass", done);
      item.querySelector("strong").textContent = text;
    };
    set("tests", testsDone, testsDone ? "пройдено" : "ще ні");
    set("variation", variationDone, variationDone ? "виконано" : "ще ні");
    $("#u-run").disabled = !testsDone;
    $("#u-locked").hidden = testsDone;
  }

  async function runVariation() {
    Game.setResume(levelId, "variation");
    const u = level.understanding;
    const v = u.variation;
    const btn = $("#u-run");
    if (state.running || btn.disabled) return;
    state.running = true;
    btn.disabled = true;
    let pass = false;
    let detail = "";
    try {
      if (v.type === "predict") {
        const rows = Array.from(document.querySelectorAll("#understand .answer-line"));
        const res = Checker.checkPredict(v, rows.map((row) => row.querySelector("input").value));
        res.lines.forEach((l, i) => {
          rows[i].classList.toggle("is-right", l.pass);
          rows[i].classList.toggle("is-wrong", !l.pass);
          rows[i].querySelector(".mark").innerHTML = l.pass ? UI.icon("check") : UI.icon("close");
        });
        renderConsole([consoleLine("log", "Зміна умови")].concat(res.lines.map((l, i) =>
          consoleLine(l.pass ? "pass" : "fail", "Рядок " + (i + 1) + ": " + (l.filled ? l.given : "(порожньо)"), l.pass ? "" : "очікувалось: " + l.expected + " · отримано: " + (l.filled ? l.given : "(порожньо)")))));
        pass = res.pass;
        const wrong = res.lines.filter((l) => !l.pass).length;
        detail = wrong === 1 ? "Один рядок не збігся." : "Не збіглося рядків: " + wrong + ".";
      } else {
        renderConsole([consoleLine("log", "Перевіряю зміну умови…")]);
        const report = await Checker.runCode(window.jsqVariationLevel(level), values.js);
        renderConsole([consoleLine("log", "Зміна умови")].concat(reportLines(report)));
        pass = report.pass;
        const failedTest = report.results.find((r) => !r.pass);
        const failedCheck = report.codeChecks.find((c) => !c.pass);
        if (report.error) detail = report.error.hint || report.error.title;
        else if (failedTest) detail = "Тест «" + failedTest.name + "» не пройшов.";
        else if (failedCheck) detail = "Бракує вимоги: «" + failedCheck.label + "».";
      }
    } catch (e) {
      renderConsole([consoleLine("fail", "Несподіваний збій перевірки: " + e.message)]);
    } finally {
      state.running = false;
      btn.disabled = false;
    }
    const feedback = $("#u-feedback");
    feedback.className = "u-feedback " + (pass ? "is-pass" : "is-fail");
    if (pass) {
      const progress = GameStore.load();
      if (!progress.variations.includes(levelId)) {
        progress.variations.push(levelId);
      }
      if (progress.resume && progress.resume.levelId === levelId) delete progress.resume;
      GameStore.save(progress);
      feedback.textContent = "Зміну умови виконано. Лишилось пояснення — його перевіряє ментор.";
      setMentor("Зміну умови виконано! А тепер поясни мені своїми словами: " + u.question, "success");
    } else {
      feedback.textContent = "Зміна умови ще не працює. " + detail;
    }
    syncUnderstanding();
  }

  function render() {
    main.innerHTML =
      '<div class="mission">' +
      '<header class="m-head">' +
      '<nav class="crumbs" aria-label="Хлібні крихти"><a href="../index.html#hub">' + UI.icon("portal") + UI.esc(Game.meta.tech) + "</a>" + UI.icon("chevronRight") +
      '<a href="' + locationUrl() + '">' + UI.icon("map") + UI.esc(loc.name) + "</a>" + UI.icon("chevronRight") +
      '<span aria-current="page">' + UI.esc(level.title) + "</span></nav>" +
      "<h1>" + UI.esc(level.title) + "</h1>" +
      '<div class="m-progress"><span>Місія ' + (indexInLoc + 1) + " з " + loc.levels.length + "</span>" + dotsHtml() +
      '<span class="task-chip">' + Game.TASK_LABELS[level.taskType] + "</span>" +
      '<button type="button" class="btn btn-ghost btn-sm" id="open-handbook" aria-haspopup="dialog">' + UI.icon("book") + "Довідник</button></div>" +
      "</header>" +
      '<section class="card m-task" aria-label="Завдання">' + leftHtml() + "</section>" +
      '<section class="card m-editor" aria-label="Робоча зона">' + centerHtml() + "</section>" +
      '<div class="m-side">' +
      '<section class="m-scene" aria-label="Сцена локації">' +
      sceneHtml() +
      '<span class="xp-chip" id="xp-chip"><span class="xp-badge">XP</span>+' + Game.xpFor(level) + " XP</span>" +
      "</section>" +
      '<section class="result" id="result" aria-live="polite"></section>' +
      "</div>" +
      '<section class="card m-console" id="console" aria-label="Консоль">' +
      '<button type="button" class="console-head" id="console-toggle" aria-expanded="true" aria-controls="console-body">' + UI.icon("terminal") + "Консоль" + UI.icon("chevronUp", "chev") + "</button>" +
      '<div class="console-body" id="console-body"><p class="console-empty">Тут з\'являться результати перевірки.</p></div>' +
      "</section>" +
      "</div>";
    Art.mount($(".mentor-art"), Art.mentor(), "Наставник Дужко");
    setResult("idle");
  }

  /* ---------- сцена ----------
     Якщо в локації є ілюстрація — показуємо її, наближену до диска цієї місії
     (Scene у scene.js). Пройдені диски — з галочкою, поточний світиться.
     Інакше — піксельна сцена. */

  const sceneArt = ((window.LOCATION_ART || {})[Game.WORLD_ID] || {})[loc.id] || null;

  function sceneHtml() {
    if (!sceneArt) return '<canvas class="pixel" id="scene" role="img" aria-label="Сцена: ' + UI.esc(loc.name) + '"></canvas>';
    return Scene.html({
      art: sceneArt, loc, levelId, completed: Game.load().completed, root: "../", ids: true,
      label: "Сцена: " + loc.name + ", місія " + (indexInLoc + 1) + " з " + loc.levels.length,
    });
  }

  function focusScene(id) {
    Scene.focus($("#scene-art"), sceneArt, loc.levels.indexOf(id));
  }

  // Місію пройдено: диск стає зеленим, герой радіє, а погляд переходить до наступної місії локації.
  function celebrateScene() {
    const disk = document.querySelector('.scene-disk[data-level="' + levelId + '"]');
    if (disk) {
      disk.classList.remove("is-current");
      disk.classList.add("is-done", "is-just-done");
      disk.innerHTML = UI.icon("check");
    }
    const hero = $("#scene-hero");
    if (hero) {
      hero.classList.remove("is-cheer");
      void hero.offsetWidth;
      hero.classList.add("is-cheer");
    }
    const next = loc.levels[indexInLoc + 1];
    if (next) {
      setTimeout(() => {
        const nd = document.querySelector('.scene-disk[data-level="' + next + '"]');
        if (nd && !nd.classList.contains("is-done")) nd.classList.add("is-next");
        focusScene(next);
      }, 900);
    }
  }

  function drawScene() {
    if (sceneArt) return; // ілюстрована сцена статична — анімації в CSS
    // На вузьких екранах сцена нижча, щоб завдання не ховалося під нею.
    const height = window.innerWidth <= 760 ? 128 : 176;
    Art.renderScene($("#scene"), loc.id, state.sceneProgress, { frame: state.frame, sparkle: state.sparkle, height, world: Game.WORLD_ID });
  }

  function animateSolve(from, to) {
    const start = performance.now();
    const duration = 1600;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      // Орієнтир «відбудовується» сходинками — як у піксельних іграх.
      state.sceneProgress = from + (to - from) * Math.min(1, Math.floor(t * 4 + 1) / 4);
      state.sparkle = t < 1 ? t : null;
      drawScene();
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- редактор ---------- */

  let textarea = null;
  let escapeTab = false;
  let activeFile = 0;
  const values = {}; // поточний текст кожного файлу: { js } або { html, css }

  function syncEditor() {
    const code = textarea.value;
    values[FILES[activeFile].key] = code;
    $("#code-hl").innerHTML = UI.highlight(code, FILES[activeFile].lang) + "\n";
    const lines = code.split("\n").length;
    $("#gutter").textContent = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
  }

  function setTab(index, preview) {
    document.querySelectorAll(".tabs [role=tab]").forEach((tab) => {
      const on = preview ? tab.hasAttribute("data-preview") : Number(tab.dataset.file) === index && !tab.hasAttribute("data-preview");
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", String(on));
    });
    $("#editor").hidden = !!preview;
    if (isMarkup) $("#preview").hidden = !preview;
  }

  function switchFile(index) {
    activeFile = index;
    textarea.value = values[FILES[index].key];
    textarea.setAttribute("aria-label", "Редактор коду " + FILES[index].name);
    syncEditor();
    setTab(index, false);
    textarea.focus();
  }

  // Живий перегляд сторінки гравця (без скриптів; посилання не ведуть геть).
  function refreshPreview() {
    if (!isMarkup || $("#preview").hidden) return;
    const frame = $("#preview-frame");
    frame.onload = () => {
      const doc = frame.contentDocument;
      if (!doc) return;
      doc.addEventListener("click", (e) => { if (e.target.closest("a")) e.preventDefault(); });
      doc.addEventListener("submit", (e) => e.preventDefault());
    };
    frame.srcdoc = Checker.buildDocument(values.html != null ? values.html : "", values.css != null ? values.css : "");
  }

  function currentSources() {
    const out = {};
    FILES.forEach((file) => { out[file.key] = values[file.key]; });
    return out;
  }

  function insertText(text) {
    // execCommand зберігає історію Ctrl+Z; якщо недоступний — вставляємо вручну.
    if (!document.execCommand || !document.execCommand("insertText", false, text)) {
      const { selectionStart: s, selectionEnd: e, value } = textarea;
      textarea.value = value.slice(0, s) + text + value.slice(e);
      textarea.selectionStart = textarea.selectionEnd = s + text.length;
    }
    syncEditor();
    onCodeInput();
  }

  function setupEditor() {
    textarea = $("#code");
    const initial = initialFiles();
    FILES.forEach((file) => { values[file.key] = initial[file.key]; });
    textarea.value = values[FILES[0].key];
    syncEditor();
    document.querySelector(".tabs").addEventListener("click", (e) => {
      const tab = e.target.closest("[role=tab]");
      if (!tab) return;
      if (tab.hasAttribute("data-preview")) {
        setTab(activeFile, true);
        refreshPreview();
      } else switchFile(Number(tab.dataset.file));
    });
    textarea.addEventListener("input", () => { syncEditor(); onCodeInput(); });
    textarea.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        run();
        return;
      }
      if (e.key === "Escape") {
        escapeTab = true;
        return;
      }
      if (e.key === "Tab" && !escapeTab && !e.shiftKey) {
        e.preventDefault();
        insertText("  ");
        return;
      }
      escapeTab = false;
      // «}» на порожньому рядку з відступом — зсуваємо дужку на рівень вище.
      if (e.key === "}" && textarea.selectionStart === textarea.selectionEnd) {
        const { selectionStart, value } = textarea;
        const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
        const before = value.slice(lineStart, selectionStart);
        if (/^ {2,}$/.test(before)) {
          e.preventDefault();
          textarea.selectionStart = selectionStart - 2;
          insertText("}");
          return;
        }
      }
      if (e.key === "Enter" && !e.shiftKey) {
        const { selectionStart, value } = textarea;
        const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
        const line = value.slice(lineStart, selectionStart);
        const indent = (line.match(/^\s*/) || [""])[0];
        // Після «{», «(», «[» і після відкритого HTML-тегу — додатковий відступ.
        const openTag = line.match(/<([a-zA-Z][\w-]*)(\s[^<>]*)?>\s*$/);
        const opensTag = openTag && !/^(br|hr|img|input|meta|link|source|area|col|wbr)$/i.test(openTag[1]) && !new RegExp("</" + openTag[1] + ">", "i").test(line);
        const extra = /[{([]\s*$/.test(line) || opensTag ? "  " : "";
        e.preventDefault();
        insertText("\n" + indent + extra);
      }
    });
  }

  // Чернетка коду зберігається, щоб гравець продовжив з того ж місця після перезавантаження.
  // JS — простий рядок (як і раніше), верстка — JSON { html, css }.
  function starters() {
    const out = {};
    FILES.forEach((file) => { out[file.key] = file.starter; });
    return out;
  }

  function initialFiles() {
    const draft = GameStore.getDraft(levelId);
    if (draft == null) return starters();
    if (!isMarkup) return { js: draft };
    try { return Object.assign(starters(), JSON.parse(draft)); } catch (e) { return starters(); }
  }

  function draftText() {
    return isMarkup ? JSON.stringify(currentSources()) : values.js;
  }

  function saveDraftNow() {
    const isStarter = FILES.every((file) => values[file.key] === file.starter);
    if (isStarter) GameStore.clearDraft(levelId);
    else GameStore.saveDraft(levelId, draftText());
  }

  function answerDraft() {
    return JSON.stringify({
      answers: Array.from(document.querySelectorAll(".answer-line[data-line] input, .blank-input"), (input) => input.value),
      choice: (document.querySelector('input[name="choice"]:checked') || {}).value || "",
      variation: Array.from(document.querySelectorAll("#understand .answer-line input"), (input) => input.value),
    });
  }
  function restoreAnswerDraft() {
    if (usesEditor) return;
    let saved;
    try { saved = JSON.parse(GameStore.getDraft(levelId)); } catch (_) { return; }
    if (!saved || typeof saved !== "object") return;
    document.querySelectorAll(".answer-line[data-line] input, .blank-input").forEach((input, i) => { input.value = saved.answers && saved.answers[i] || ""; });
    if (saved.choice !== "") {
      const choice = document.querySelector('input[name="choice"][value="' + Number(saved.choice) + '"]');
      if (choice) choice.checked = true;
    }
    document.querySelectorAll("#understand .answer-line input").forEach((input, i) => { input.value = saved.variation && saved.variation[i] || ""; });
  }
  function saveAnswerDraft() {
    if (usesEditor) return;
    const data = JSON.parse(answerDraft());
    if (!data.answers.some(Boolean) && !data.choice && !data.variation.some(Boolean)) GameStore.clearDraft(levelId);
    else GameStore.saveDraft(levelId, JSON.stringify(data));
  }

  let draftTimer = null;
  let previewTimer = null;
  function onCodeInput(isReset) {
    clearTimeout(draftTimer);
    if (isReset) {
      GameStore.clearDraft(levelId);
      return;
    }
    draftTimer = setTimeout(saveDraftNow, 400);
    clearTimeout(previewTimer);
    previewTimer = setTimeout(refreshPreview, 300);
  }

  /* ---------- консоль, чеклист, результат ---------- */

  function consoleLine(kind, text, detail) {
    const iconName = kind === "pass" ? "check" : kind === "fail" ? "close" : "chevronRight";
    return { kind, html: '<span class="st">' + UI.icon(iconName) + '</span><span class="msg">' + UI.esc(text) + (detail ? '<span class="detail">' + UI.esc(detail) + "</span>" : "") + "</span>" };
  }

  function renderConsole(lines) {
    const body = $("#console-body");
    body.innerHTML = lines.length
      ? lines.map((l, i) => '<div class="console-line is-' + l.kind + '"><span class="n">' + (i + 1) + "</span>" + l.html + "</div>").join("")
      : '<p class="console-empty">Порожньо.</p>';
    $("#console").classList.remove("is-collapsed");
    $("#console-toggle").setAttribute("aria-expanded", "true");
  }

  function setCheck(key, pass) {
    const item = document.querySelector('.check-item[data-key="' + key + '"]');
    if (!item) return;
    item.classList.toggle("is-pass", pass === true);
    item.classList.toggle("is-fail", pass === false);
    item.querySelector(".check-state").textContent = pass ? "виконано" : "не виконано";
  }

  function setMentor(text, mood) {
    const mentor = $("#mentor");
    mentor.classList.remove("is-error", "is-success");
    if (mood) mentor.classList.add("is-" + mood);
    $("#mentor-text").innerHTML = UI.md(text);
  }

  function nextHref() {
    return levelId < Game.LEVELS.length ? Game.levelUrl(levelId + 1, "../") : "../index.html#hub";
  }

  function setResult(kind, title, text) {
    if (kind === "idle" && alreadyDone && !state.solved) {
      kind = "success";
      title = "Місію вже пройдено";
      text = "Можеш повторити її для практики (досвід повторно не нараховується) або рушати далі.";
    }
    const box = $("#result");
    box.className = "result" + (kind === "success" ? " is-success" : kind === "error" ? " is-error" : "");
    const iconName = kind === "success" ? "check" : kind === "error" ? "close" : "compass";
    box.innerHTML =
      '<span class="result-icon">' + UI.icon(iconName) + "</span>" +
      "<div><h2>" + UI.esc(title || "Світ чекає на тебе") + "</h2><p>" + UI.md(text || "Виконай завдання й натисни «" + (isCodeTask ? "Запустити" : "Перевірити") + "».") + "</p></div>" +
      (kind === "success"
        ? '<a class="btn btn-primary" id="next-btn" href="' + nextHref() + '">' + (levelId < Game.LEVELS.length ? "Наступна місія" : "До порталів") + UI.icon("chevronRight") + "</a>"
        : "");
  }

  /* ---------- перевірка ---------- */

  let failCount = 0;

  async function run() {
    if (state.running) return;
    if (!alreadyDone) Game.setResume(levelId, "mission");
    state.running = true;
    const btn = $("#run");
    btn.disabled = true;
    try {
      if (usesEditor) await runCodeTask();
      else if (level.taskType === "predict-output") runPredict();
      else if (level.taskType === "multiple-choice") runChoice();
      else runBlank();
    } catch (e) {
      // Остання лінія оборони: навіть збій перевірки не ламає сторінку.
      renderConsole([consoleLine("fail", "Несподіваний збій перевірки: " + e.message)]);
    } finally {
      state.running = false;
      btn.disabled = false;
    }
  }

  function reportLines(report) {
    const lines = [];
    report.logs.forEach((l) => lines.push(consoleLine("log", l)));
    if (report.error) lines.push(consoleLine("fail", report.error.title, report.error.hint));
    report.results.forEach((r) => {
      lines.push(r.pass
        ? consoleLine("pass", r.name)
        : consoleLine("fail", r.name, [r.expected !== undefined ? "очікувалось: " + r.expected : "", r.actual !== undefined ? "отримано: " + r.actual : "", r.message || ""].filter(Boolean).join(" · ")));
    });
    report.codeChecks.forEach((c) => lines.push(consoleLine(c.pass ? "pass" : "fail", c.label)));
    return lines;
  }

  async function runCodeTask() {
    renderConsole([consoleLine("log", isMarkup ? "Будую сторінку й перевіряю…" : "Запускаю тести…")]);
    const report = isMarkup ? await Checker.runMarkup(level, currentSources()) : await Checker.runCode(level, values.js);
    renderConsole(reportLines(report));

    setCheck("declared", !!report.declared);
    report.codeChecks.forEach((c, i) => setCheck("check" + i, c.pass));
    setCheck("tests", report.results.every((r) => r.pass));

    if (report.pass) return succeed();
    const failedTest = report.results.find((r) => !r.pass);
    const failedCheck = report.codeChecks.find((c) => !c.pass);
    let detail = "";
    if (report.error) detail = report.error.hint || report.error.title;
    else if (failedTest) detail = "Тест «" + failedTest.name + "» не пройшов" + (failedTest.message ? ": " + failedTest.message : ".");
    else if (failedCheck) detail = "Тести пройдено, але бракує вимоги: «" + failedCheck.label + "».";
    fail(detail);
  }

  function runPredict() {
    const inputs = Array.from(document.querySelectorAll(".answer-line[data-line] input"));
    const res = Checker.checkPredict(level, inputs.map((i) => i.value));
    const lines = res.lines.map((l, i) => {
      const row = document.querySelector('.answer-line[data-line="' + i + '"]');
      row.classList.toggle("is-right", l.pass);
      row.classList.toggle("is-wrong", !l.pass);
      row.querySelector(".mark").innerHTML = l.pass ? UI.icon("check") : UI.icon("close");
      return consoleLine(l.pass ? "pass" : "fail", "Рядок " + (i + 1) + ": " + (l.filled ? l.given : "(порожньо)"), l.pass ? "" : "очікувалось: " + l.expected + " · отримано: " + (l.filled ? l.given : "(порожньо)"));
    });
    renderConsole(lines);
    setCheck("filled", res.lines.every((l) => l.filled));
    setCheck("correct", res.pass);
    if (res.pass) return succeed();
    const wrong = res.lines.filter((l) => !l.pass).length;
    fail(wrong === 1 ? "Один рядок не збігся — перевір його ще раз." : "Не збіглося рядків: " + wrong + ".");
  }

  function runChoice() {
    const checked = document.querySelector('input[name="choice"]:checked');
    document.querySelectorAll(".option").forEach((o) => o.classList.remove("is-right", "is-wrong"));
    if (!checked) {
      setCheck("filled", false);
      renderConsole([consoleLine("fail", "Варіант не обрано")]);
      return fail("Спершу обери один із варіантів.");
    }
    const choice = level.options[Number(checked.value)];
    const res = Checker.checkChoice(level, choice);
    checked.closest(".option").classList.add(res.pass ? "is-right" : "is-wrong");
    setCheck("filled", true);
    setCheck("correct", res.pass);
    renderConsole([consoleLine(res.pass ? "pass" : "fail", res.pass ? "Правильно!" : "Обрано: " + String(res.chosen) + ". Порівняй його властивості з умовою.")]);
    if (res.pass) return succeed();
    fail("Цей варіант не підходить. Перечитай теорію в «Сувої знань».");
  }

  function runBlank() {
    const inputs = Array.from(document.querySelectorAll(".blank-input"));
    const res = Checker.checkBlank(level, inputs.map((i) => i.value));
    res.blanks.forEach((b, i) => {
      inputs[i].classList.toggle("is-right", b.pass);
      inputs[i].classList.toggle("is-wrong", !b.pass);
    });
    renderConsole(res.blanks.map((b, i) => consoleLine(b.pass ? "pass" : "fail", "Пропуск " + (i + 1) + ": " + (b.filled ? b.given.trim() : "(порожньо)"), b.pass ? "" : "отримано: " + (b.filled ? b.given.trim() : "(порожньо)") + " · звір із прикладом у «Сувої знань»")));
    setCheck("filled", res.blanks.every((b) => b.filled));
    setCheck("correct", res.pass);
    if (res.pass) return succeed();
    fail("Цей фрагмент не підходить. Яке слово повертає назву типу?");
  }

  function fail(detail) {
    failCount++;
    const line = MENTOR_FAIL[(failCount - 1) % MENTOR_FAIL.length];
    setMentor(line + (failCount >= 2 ? " Підказка вже чекає внизу ліворуч." : ""), "error");
    setResult("error", "Ще не зовсім", detail || "Спробуй ще раз — спроби не обмежені.");
    afterFail(failCount);
  }

  // Невдача нічого не забирає: лише рахуємо спроби, щоб наставник підказував дедалі конкретніше.
  function afterFail(count) {
    if (!alreadyDone) Game.recordFail(levelId);
    if (count >= 3) offerSolution();
  }

  function offerSolution() {
    const slot = $("#solution-slot");
    if (slot.firstChild) return;
    slot.innerHTML = '<button type="button" class="btn btn-ghost" id="show-solution">' + UI.icon("bulb") + "Показати рішення</button>";
    $("#show-solution").addEventListener("click", () => {
      if (usesEditor) {
        if (isMarkup) Object.assign(values, level.solution);
        else values.js = level.solution;
        textarea.value = values[FILES[activeFile].key];
        syncEditor();
        onCodeInput();
      } else if (level.taskType === "predict-output") {
        document.querySelectorAll(".answer-line[data-line] input").forEach((input, i) => { input.value = level.expectedAnswer[i]; });
      } else if (level.taskType === "multiple-choice") {
        const index = level.options.indexOf(level.expectedAnswer);
        document.querySelectorAll('input[name="choice"]')[index].checked = true;
      } else {
        document.querySelectorAll(".blank-input").forEach((input, i) => { input.value = level.expectedAnswer[i][0]; });
      }
      setMentor("Ось як це можна розв'язати. Розберись у рішенні, а потім натисни «" + (isCodeTask ? "Запустити" : "Перевірити") + "».");
    });
    $("#hint").open = true;
  }

  function succeed() {
    state.solved = true;
    const progressBefore = GameStore.load();
    const firstTry = failCount === 0 && !progressBefore.fails[levelId];
    // Рішення гравця зберігаємо одразу: його показують і повернення до місії, і довідник.
    if (usesEditor) {
      clearTimeout(draftTimer);
      GameStore.saveDraft(levelId, draftText());
    }
    const outcome = Game.completeLevel(levelId, firstTry);
    // Без доступу до сховища місія зарахована лише в цій вкладці — нагадуємо про це.
    UI.warnStorage(true);

    const text = outcome.alreadyDone
      ? "Усі перевірки пройдено. Повторення — мати навчання!"
      : "Усі перевірки пройдено. " + level.worldEvent + (firstTry && outcome.progress.streak > 1 ? " Серія з першої спроби: " + outcome.progress.streak + "!" : "");
    setMentor("Чудово! " + level.worldEvent, "success");
    setResult("success", outcome.alreadyDone ? "Знову вдалося!" : "Місію виконано!",
      text + (level.understanding ? " Далі — «Перевірка розуміння» ліворуч: зміна умови й запитання для ментора." : ""));
    syncUnderstanding();
    if (sceneArt) celebrateScene();
    else {
      const from = state.sceneProgress;
      animateSolve(from, Math.max(from, (indexInLoc + 1) / loc.levels.length));
    }

    if (!outcome.alreadyDone) {
      const chip = $("#xp-chip");
      chip.classList.add("is-earned");
      chip.innerHTML = '<span class="xp-badge">XP</span>+' + outcome.xpGained + " XP отримано";
      document.querySelectorAll(".dot")[indexInLoc].classList.replace("is-current", "is-done");
      UI.renderSidebar($("#sidebar"), "practice", "../");
      if (outcome.leveledUp) {
        setTimeout(() => UI.toast(UI.icon("star") + " <span><strong>Новий рівень героя: " + outcome.hero.level + "!</strong><br>Досвід росте разом із тобою.</span>"), 900);
      }
      if (outcome.location) celebrateLocation(outcome.location);
    }
    const next = $("#next-btn");
    if (next) next.focus({ preventScroll: true });
  }

  // Вся локація пройдена: світова подія + трофей в інвентар.
  function celebrateLocation(location) {
    setTimeout(() => {
      UI.toast(
        '<span class="toast-icon"></span><span><strong>Світова подія: ' + UI.esc(location.event) +
        "</strong><br>Отримано трофей «" + UI.esc(location.trophy.name) + "»</span>",
        "is-trophy"
      );
      const slot = document.querySelector(".toast:last-child .toast-icon");
      if (slot) Art.mountTrophy(slot, location.trophy.icon, { root: "../" });
    }, 1700);
    const progress = GameStore.load();
    if (!progress.celebrated.includes(location.id)) {
      progress.celebrated.push(location.id);
      GameStore.save(progress);
    }
    $("#result p").innerHTML += " <strong>" + UI.esc(location.event) + "!</strong>";
  }

  function reset() {
    if (usesEditor) {
      Object.assign(values, starters());
      textarea.value = values[FILES[activeFile].key];
      syncEditor();
      onCodeInput(true);
      refreshPreview();
      textarea.focus();
    } else {
      document.querySelectorAll(".text-input").forEach((i) => { i.value = ""; i.classList.remove("is-right", "is-wrong"); });
      document.querySelectorAll(".answer-line").forEach((r) => { r.classList.remove("is-right", "is-wrong"); r.querySelector(".mark").innerHTML = ""; });
      document.querySelectorAll('input[name="choice"]').forEach((i) => { i.checked = false; });
      document.querySelectorAll("#understand .answer-line input").forEach((i) => { i.value = ""; i.classList.remove("is-right", "is-wrong"); });
      document.querySelectorAll(".option").forEach((o) => o.classList.remove("is-right", "is-wrong"));
      GameStore.clearDraft(levelId);
    }
    checklistItems().forEach((it) => setCheck(it.key, null));
    renderConsole([]);
  }

  /* ---------- старт ---------- */

  render();
  restoreAnswerDraft();
  if (usesEditor) setupEditor();
  drawScene();
  if (sceneArt) {
    Scene.watch($("#scene-art"), sceneArt, () => (document.querySelector(".scene-disk.is-next") ? indexInLoc + 1 : indexInLoc));
  }

  $("#run").addEventListener("click", run);
  $("#reset").addEventListener("click", reset);
  let hintStep = 0;
  $("#hint-next").addEventListener("click", (event) => {
    hintStep = Math.min(hintStep + 1, 3);
    const output = $("#hint-stage");
    const button = event.currentTarget;
    if (hintStep === 1) {
      const question = String(level.prompt || "").split(/[.!?]/)[0];
      output.textContent = "Навідне запитання: " + (question ? question + "?" : "Які дані отримуєш і який результат мають перевірки?");
    } else if (hintStep === 2) {
      output.innerHTML = UI.md(level.concept || "") + (level.hint ? "<p>Підказка: " + UI.md(level.hint) + "</p>" : "");
    } else {
      const snippet = String(level.example || "").split("\n").map((line) => line.trim()).find((line) => line && !line.startsWith("//"));
      output.innerHTML = snippet
        ? "Невеликий приклад із сувою знань:<pre class=\"code-block\"><code>" + UI.esc(snippet.slice(0, 180)) + "</code></pre>"
        : "Повернись до прикладу в «Сувої знань» і застосуй лише потрібний фрагмент.";
    }
    button.textContent = hintStep >= 3 ? "Підказки показано" : "Наступний рівень підказки";
    button.disabled = hintStep >= 3;
  });
  $("#review-toggle").addEventListener("click", (event) => {
    const marked = Game.toggleReview(levelId);
    event.currentTarget.setAttribute("aria-pressed", String(marked));
    event.currentTarget.textContent = marked ? "Прибрати з повторення" : "Позначити для повторення";
  });
  main.addEventListener("input", (event) => {
    if (!usesEditor && event.target.matches(".answer-line[data-line] input, .blank-input, #understand .answer-line input")) saveAnswerDraft();
  });
  main.addEventListener("change", (event) => {
    if (!usesEditor && event.target.matches('input[name="choice"]')) saveAnswerDraft();
  });
  if (level.understanding) {
    $("#u-run").addEventListener("click", runVariation);
    syncUnderstanding();
  }
  if (requestedStage && level.understanding) {
    const understanding = $("#understand");
    if (understanding) { understanding.scrollIntoView({ block: "center" }); $("#u-run").focus({ preventScroll: true }); }
  }
  // Довідник відкривається на поточній локації — щоб швидко підглянути схожі теми.
  $("#open-handbook").addEventListener("click", () => Handbook.openDrawer({ root: "../", world: Game.WORLD_ID, location: loc.id }));
  $("#console-toggle").addEventListener("click", () => {
    const box = $("#console");
    const collapsed = box.classList.toggle("is-collapsed");
    $("#console-toggle").setAttribute("aria-expanded", String(!collapsed));
  });
  // Enter у полях відповіді — перевірити.
  main.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches(".text-input, input[name='choice']")) {
      e.preventDefault();
      if (e.target.closest("#understand")) runVariation();
      else run();
    }
  });

  {
    setInterval(() => {
      if (state.sparkle !== null) return;
      state.frame++;
      drawScene();
    }, 450);
  }
})();
