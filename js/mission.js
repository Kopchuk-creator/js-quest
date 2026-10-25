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

  UI.renderSidebar($("#sidebar"), "practice", "../");

  if (!level) {
    main.innerHTML =
      '<section class="card locked-screen"><h1>Такої місії немає</h1><p>У королівстві лише ' + Game.LEVELS.length +
      ' місій. Повернися на карту й обери шлях звідти.</p><a class="btn btn-primary" href="' + Game.mapUrl("../") + '">' + UI.icon("map") + "На карту</a></section>";
    return;
  }

  const loc = Game.locationOf(level);
  const indexInLoc = loc.levels.indexOf(levelId);
  const isCodeTask = level.taskType === "write-function" || level.taskType === "fix-code";

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
    if (isCodeTask) {
      const items = [];
      const names = level.functionName ? [level.functionName] : level.exports || [];
      if (names.length) items.push({ key: "declared", label: "Оголошено " + names.map((n) => "`" + n + "`").join(", ") });
      (level.codeChecks || []).forEach((c, i) => items.push({ key: "check" + i, label: c.label }));
      items.push({ key: "tests", label: "Усі тести пройдено (" + level.testCases.length + ")" });
      return items;
    }
    if (level.taskType === "predict-output") return [{ key: "filled", label: "Вписано вивід кожного рядка" }, { key: "correct", label: "Вивід збігається з консоллю" }];
    if (level.taskType === "multiple-choice") return [{ key: "filled", label: "Обрано варіант" }, { key: "correct", label: "Варіант правильний" }];
    return [{ key: "filled", label: "Пропуск заповнено" }, { key: "correct", label: "Код працює як треба" }];
  }

  function fileName() {
    if (level.fileName) return level.fileName;
    if (level.functionName) return level.functionName + ".js";
    return "quest.js";
  }

  function codeViewHtml(code) {
    const lines = code.split("\n").length;
    return '<div class="editor is-readonly"><div class="gutter" aria-hidden="true">' + Array.from({ length: lines }, (_, i) => i + 1).join("\n") +
      '</div><div class="code-area"><pre class="code-hl"><code>' + UI.highlight(code) + "\n</code></pre></div></div>";
  }

  function centerHtml() {
    const tabs = ['<span class="tab is-active"><span class="js-badge">JS</span>' + UI.esc(fileName()) + "</span>"];
    (level.readonlyFiles || []).forEach((f) => tabs.push('<span class="tab is-readonly" title="Лише для читання"><span class="js-badge">JS</span>' + UI.esc(f.name) + "</span>"));
    let body = "";
    let actionLabel = "Перевірити";
    if (isCodeTask) {
      actionLabel = "Запустити";
      body =
        '<div class="editor" id="editor"><div class="gutter" id="gutter" aria-hidden="true">1</div>' +
        '<div class="code-area"><pre class="code-hl" aria-hidden="true"><code id="code-hl"></code></pre>' +
        '<textarea id="code" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="Редактор коду ' + UI.esc(fileName()) + '" aria-describedby="editor-help"></textarea></div></div>';
    } else if (level.taskType === "predict-output") {
      const lines = level.expectedAnswer.map((_, i) =>
        '<div class="answer-line" data-line="' + i + '"><label for="out-' + i + '">Рядок ' + (i + 1) + '</label><input class="text-input" id="out-' + i +
        '" autocomplete="off" spellcheck="false" placeholder="вивід console.log"><span class="mark" aria-hidden="true"></span></div>'
      ).join("");
      body = codeViewHtml(level.code) + '<div class="answer-zone"><h3>Що виведе консоль?</h3>' + lines + "</div>";
    } else if (level.taskType === "multiple-choice") {
      const opts = level.options.map((o, i) =>
        '<label class="option" data-option="' + i + '"><input type="radio" name="choice" value="' + i + '"><pre>' + UI.highlight(o) + "</pre></label>"
      ).join("");
      body = (level.code ? codeViewHtml(level.code) : "") +
        '<div class="answer-zone"><fieldset class="options" style="border:0;margin:0;padding:0"><legend class="visually-hidden">' + UI.esc(level.prompt) + "</legend>" + opts + "</fieldset></div>";
    } else {
      const parts = level.starterCode.split("___");
      const lines = level.starterCode.split("\n").length;
      const html = parts.map((p, i) => UI.highlight(p) + (i < parts.length - 1
        ? '<input class="text-input blank-input" data-blank="' + i + '" aria-label="Пропуск ' + (i + 1) + '" autocomplete="off" spellcheck="false">' : "")).join("");
      body = '<div class="editor is-readonly"><div class="gutter" aria-hidden="true">' + Array.from({ length: lines }, (_, i) => i + 1).join("\n") +
        '</div><div class="code-area"><pre class="code-hl is-interactive"><code>' + html + "\n</code></pre></div></div>";
    }
    return (
      '<div class="tabs" role="presentation">' + tabs.join("") + "</div>" + body +
      '<div class="editor-actions">' +
      '<button type="button" class="btn btn-primary" id="run">' + UI.icon("play") + actionLabel + "</button>" +
      '<button type="button" class="btn btn-ghost" id="reset">' + UI.icon("reset") + "Скинути</button>" +
      '<span class="kbd-hint" id="editor-help">' + (isCodeTask ? "<kbd>Ctrl</kbd>+<kbd>Enter</kbd> — запуск · <kbd>Esc</kbd>, потім <kbd>Tab</kbd> — вийти з редактора" : "<kbd>Enter</kbd> — перевірити") + "</span>" +
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
      extra.join("") +
      '<ul class="checklist" id="checklist" aria-label="Критерії виконання">' + checklistItems().map((it) =>
        '<li class="check-item" data-key="' + it.key + '"><span class="check-box">' + UI.icon("check") + '</span><span>' + UI.md(it.label) + '</span><span class="visually-hidden check-state">не виконано</span></li>'
      ).join("") + "</ul>" +
      '<details class="disclosure" id="theory"><summary>' + UI.icon("book") + "Сувій знань" + UI.icon("chevronRight", "chev") + '</summary><div class="disclosure-body"><p>' + UI.md(level.concept) + "</p>" +
      (level.example ? '<pre class="code-block">' + UI.highlight(level.example) + "</pre>" : "") + "</div></details>" +
      '<details class="disclosure" id="hint"><summary>' + UI.icon("bulb") + "Підказка" + UI.icon("chevronRight", "chev") + '</summary><div class="disclosure-body"><p>' + UI.md(level.hint) + '</p><div id="solution-slot"></div></div></details>'
    );
  }

  function render() {
    main.innerHTML =
      '<div class="mission">' +
      '<header class="m-head">' +
      '<nav class="crumbs" aria-label="Хлібні крихти"><a href="../index.html#hub">' + UI.icon("portal") + UI.esc(Game.meta.tech) + "</a>" + UI.icon("chevronRight") +
      '<a href="' + Game.mapUrl("../") + '">' + UI.icon("map") + UI.esc(loc.name) + "</a>" + UI.icon("chevronRight") +
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
      '<canvas class="pixel" id="scene" role="img" aria-label="Сцена: ' + UI.esc(loc.name) + '"></canvas>' +
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

  /* ---------- сцена ---------- */

  function drawScene() {
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

  function syncEditor() {
    const code = textarea.value;
    $("#code-hl").innerHTML = UI.highlight(code) + "\n";
    const lines = code.split("\n").length;
    $("#gutter").textContent = Array.from({ length: lines }, (_, i) => i + 1).join("\n");
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
    textarea.value = initialCode();
    syncEditor();
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
        const extra = /[{([]\s*$/.test(line) ? "  " : "";
        e.preventDefault();
        insertText("\n" + indent + extra);
      }
    });
  }

  // Чернетка коду зберігається, щоб гравець продовжив з того ж місця після перезавантаження.
  function initialCode() {
    return GameStore.getDraft(levelId) ?? level.starterCode;
  }

  let draftTimer = null;
  function onCodeInput(isReset) {
    clearTimeout(draftTimer);
    if (isReset) {
      GameStore.clearDraft(levelId);
      return;
    }
    draftTimer = setTimeout(() => {
      if (textarea.value === level.starterCode) GameStore.clearDraft(levelId);
      else GameStore.saveDraft(levelId, textarea.value);
    }, 400);
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
    state.running = true;
    const btn = $("#run");
    btn.disabled = true;
    try {
      if (isCodeTask) await runCodeTask();
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

  async function runCodeTask() {
    renderConsole([consoleLine("log", "Запускаю тести…")]);
    const report = await Checker.runCode(level, textarea.value);
    const lines = [];
    report.logs.forEach((l) => lines.push(consoleLine("log", l)));
    if (report.error) lines.push(consoleLine("fail", report.error.title, report.error.hint));
    report.results.forEach((r) => {
      lines.push(r.pass
        ? consoleLine("pass", r.name)
        : consoleLine("fail", r.name, [r.expected !== undefined ? "очікувалось: " + r.expected : "", r.actual !== undefined ? "отримано: " + r.actual : "", r.message || ""].filter(Boolean).join(" · ")));
    });
    report.codeChecks.forEach((c) => lines.push(consoleLine(c.pass ? "pass" : "fail", c.label)));
    renderConsole(lines);

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
    const inputs = Array.from(document.querySelectorAll(".answer-line input"));
    const res = Checker.checkPredict(level, inputs.map((i) => i.value));
    const lines = res.lines.map((l, i) => {
      const row = document.querySelector('.answer-line[data-line="' + i + '"]');
      row.classList.toggle("is-right", l.pass);
      row.classList.toggle("is-wrong", !l.pass);
      row.querySelector(".mark").innerHTML = l.pass ? UI.icon("check") : UI.icon("close");
      return consoleLine(l.pass ? "pass" : "fail", "Рядок " + (i + 1) + ": " + (l.filled ? l.given : "(порожньо)"), l.pass ? "" : l.filled ? "консоль виведе інше" : "впиши відповідь");
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
    renderConsole([consoleLine(res.pass ? "pass" : "fail", res.pass ? "Правильно!" : "Цей варіант не підходить")]);
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
    renderConsole(res.blanks.map((b, i) => consoleLine(b.pass ? "pass" : "fail", "Пропуск " + (i + 1) + ": " + (b.filled ? b.given.trim() : "(порожньо)"))));
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
      if (isCodeTask) {
        textarea.value = level.solution;
        syncEditor();
        onCodeInput();
      } else if (level.taskType === "predict-output") {
        document.querySelectorAll(".answer-line input").forEach((input, i) => { input.value = level.expectedAnswer[i]; });
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
    if (isCodeTask) {
      clearTimeout(draftTimer);
      GameStore.saveDraft(levelId, textarea.value);
    }
    const outcome = Game.completeLevel(levelId, firstTry);

    const text = outcome.alreadyDone
      ? "Усі перевірки пройдено. Повторення — мати навчання!"
      : "Усі перевірки пройдено. " + level.worldEvent + (firstTry && outcome.progress.streak > 1 ? " Серія з першої спроби: " + outcome.progress.streak + "!" : "");
    setMentor("Чудово! " + level.worldEvent, "success");
    setResult("success", outcome.alreadyDone ? "Знову вдалося!" : "Місію виконано!", text);
    const from = state.sceneProgress;
    animateSolve(from, Math.max(from, (indexInLoc + 1) / loc.levels.length));

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
      if (slot) Art.mount(slot, Art.item(location.trophy.icon));
    }, 1700);
    const progress = GameStore.load();
    if (!progress.celebrated.includes(location.id)) {
      progress.celebrated.push(location.id);
      GameStore.save(progress);
    }
    $("#result p").innerHTML += " <strong>" + UI.esc(location.event) + "!</strong>";
  }

  function reset() {
    if (isCodeTask) {
      textarea.value = level.starterCode;
      syncEditor();
      onCodeInput(true);
      textarea.focus();
    } else {
      document.querySelectorAll(".text-input").forEach((i) => { i.value = ""; i.classList.remove("is-right", "is-wrong"); });
      document.querySelectorAll(".answer-line").forEach((r) => { r.classList.remove("is-right", "is-wrong"); r.querySelector(".mark").innerHTML = ""; });
      document.querySelectorAll('input[name="choice"]').forEach((i) => { i.checked = false; });
      document.querySelectorAll(".option").forEach((o) => o.classList.remove("is-right", "is-wrong"));
    }
    checklistItems().forEach((it) => setCheck(it.key, null));
    renderConsole([]);
  }

  /* ---------- старт ---------- */

  render();
  if (isCodeTask) setupEditor();
  drawScene();

  $("#run").addEventListener("click", run);
  $("#reset").addEventListener("click", reset);
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
      run();
    }
  });

  {
    setInterval(() => {
      if (state.sparkle !== null || UI.motion() === "off") return;
      state.frame++;
      drawScene();
    }, 450);
  }
})();
