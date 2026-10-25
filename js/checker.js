/* =========================================================
   checker.js — перевірка відповідей усіх типів завдань.

   Код гравця (write-function / fix-code) виконується через
   new Function(...) у «пісочниці»:
     • усе виконання загорнуте в try/catch — помилка в завданні
       не ламає сторінку;
     • у циклах стоїть захист від безкінечного виконання;
     • document, localStorage, fetch, таймери, console — підставні,
       тож код гравця не чіпає справжню сторінку і прогрес гри.
   Це навчальна пісочниця, а не захист від зловмисного коду:
   гравець виконує власний код у власному браузері.
   ========================================================= */
(function () {
  "use strict";

  const LOOP_LIMIT_MS = 1500;
  const TEST_TIMEOUT_MS = 3000;

  /* ---------- маскування рядків і коментарів ---------- */

  const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\.|[^`\\])*`?)/g;

  // Замінює вміст рядків і коментарів пробілами (довжина та сама) —
  // так можна шукати ключові слова, не зачіпаючи тексту в лапках.
  function maskCode(code) {
    return code.replace(TOKEN, (m) => m.replace(/[^\n]/g, " "));
  }

  function stripComments(code) {
    return code.replace(TOKEN, (m, comment) => (comment ? comment.replace(/[^\n]/g, " ") : m));
  }

  /* ---------- захист від безкінечних циклів ----------
     Після «{» кожного for / while / do вставляється виклик
     __jsqGuard(), який кидає помилку, якщо код крутиться
     довше за LOOP_LIMIT_MS. */

  function addLoopGuards(code) {
    const masked = maskCode(code);
    const inserts = [];
    const re = /\b(for|while|do)\b/g;
    let m;
    while ((m = re.exec(masked))) {
      if (masked[m.index - 1] === ".") continue;
      let i = m.index + m[1].length;
      if (m[1] !== "do") {
        while (/\s/.test(masked[i] || "")) i++;
        if (masked[i] !== "(") continue;
        let depth = 0;
        for (; i < masked.length; i++) {
          if (masked[i] === "(") depth++;
          else if (masked[i] === ")" && --depth === 0) break;
        }
        i++;
      }
      while (/\s/.test(masked[i] || "")) i++;
      if (masked[i] === "{") inserts.push(i + 1);
    }
    let out = code;
    inserts.sort((a, b) => b - a).forEach((pos) => {
      out = out.slice(0, pos) + "__jsqGuard();" + out.slice(pos);
    });
    return out;
  }

  /* ---------- ES-модулі (рівень export/import) ----------
     new Function не вміє модулів, тож прибираємо export/import
     і запам'ятовуємо, які імена експортовано. */

  function transformModule(code) {
    const exported = [];
    let out = code.replace(/^[ \t]*import\s[^;\n]*;?/gm, "");
    out = out.replace(/^([ \t]*)export\s+default\s+/gm, "$1");
    out = out.replace(/^([ \t]*)export\s+((?:async\s+)?function\*?|class|const|let|var)\s+([\w$]+)/gm, (m, indent, kind, name) => {
      exported.push(name);
      return indent + kind + " " + name;
    });
    out = out.replace(/^[ \t]*export\s*\{([^}]*)\}\s*;?/gm, (m, list) => {
      list.split(",").map((s) => s.trim().split(/\s+as\s+/)[0]).filter(Boolean).forEach((n) => exported.push(n));
      return "";
    });
    return { code: out, exported };
  }

  /* ---------- порівняння і показ значень ---------- */

  function deepEqual(a, b) {
    if (a === b || (a !== a && b !== b)) return true;
    if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && deepEqual(a[k], b[k]));
  }

  function show(value, depth) {
    const d = depth || 0;
    if (typeof value === "string") return JSON.stringify(value);
    if (typeof value === "number") return Object.is(value, -0) ? "0" : String(value);
    if (typeof value === "bigint") return value + "n";
    if (value === undefined || value === null || typeof value === "boolean") return String(value);
    if (typeof value === "symbol") return value.toString();
    if (typeof value === "function") return /^class\b/.test(Function.prototype.toString.call(value)) ? "class " + value.name : "ƒ " + (value.name || "анонімна") + "()";
    if (value instanceof Error) return value.name + ": " + value.message;
    if (typeof value.then === "function") return "Promise {…}";
    if (value.nodeType === 1) {
      const html = value.outerHTML;
      return html.length > 90 ? html.slice(0, 87) + "…" : html;
    }
    if (value.nodeType) return "[" + value.nodeName + "]";
    if (d > 2) return Array.isArray(value) ? "[…]" : "{…}";
    if (Array.isArray(value)) {
      const items = value.slice(0, 12).map((v) => show(v, d + 1));
      if (value.length > 12) items.push("… ще " + (value.length - 12));
      return "[" + items.join(", ") + "]";
    }
    if (typeof value.length === "number" && typeof value.item === "function") return "NodeList(" + value.length + ")";
    const keys = Object.keys(value);
    if (!keys.length) return "{}";
    return "{ " + keys.slice(0, 10).map((k) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)) + ": " + show(value[k], d + 1)).join(", ") + (keys.length > 10 ? ", …" : "") + " }";
  }

  function clone(value) {
    try { return structuredClone(value); } catch (e) { return value; }
  }

  /* ---------- дружні пояснення помилок ---------- */

  function friendlyError(error) {
    const name = (error && error.name) || "Error";
    const msg = (error && error.message) || String(error);
    let hint = "";
    let m;
    if (name === "InfiniteLoopError") hint = "Цикл не зупиняється. Перевір, чи змінюється змінна в умові циклу (наприклад, чи є `i++`).";
    else if (name === "SyntaxError") {
      if (/Unexpected end of input/.test(msg)) hint = "Код обривається раніше, ніж треба: схоже, не закрита фігурна дужка `}`, кругла `)` чи лапка.";
      else if ((m = msg.match(/Identifier '(.+)' has already been declared/))) hint = "Ім'я `" + m[1] + "` оголошене двічі. Залиш одне оголошення.";
      else if (/missing \) after argument list/.test(msg)) hint = "Бракує закривної дужки `)` після аргументів виклику.";
      else if (/Unexpected token '(export|import)'/.test(msg)) hint = "`export` та `import` працюють лише в модулях — у цьому завданні вони не потрібні.";
      else if (/Unexpected identifier/.test(msg)) hint = "Трапилося несподіване слово. Можливо, одруківка в ключовому слові (наприклад, `funtion`) або пропущено оператор чи кому.";
      else if (/Unexpected token/.test(msg)) hint = "Знайдено зайвий або несподіваний символ. Перевір парність дужок і розділові знаки поруч.";
      else if (/Unexpected string/.test(msg)) hint = "Рядок стоїть там, де його не чекали. Можливо, бракує `+`, коми або дужки.";
      else hint = "Синтаксис зламано. Перевір дужки, лапки й ключові слова.";
    } else if (name === "ReferenceError") {
      if ((m = msg.match(/^(.+) is not defined/))) hint = "`" + m[1] + "` не знайдено. Перевір написання імені (регістр важливий!) або оголоси змінну.";
      else if ((m = msg.match(/Cannot access '(.+)' before initialization/))) hint = "`" + m[1] + "` використано до рядка, де її оголошено. Перенеси оголошення вище.";
      else hint = "Звернення до імені, якого не існує.";
    } else if (name === "TypeError") {
      if ((m = msg.match(/Cannot read properties of (undefined|null) \(reading '(.+)'\)/))) hint = "Спроба прочитати `." + m[2] + "` у значення `" + m[1] + "`. Можливо, `querySelector` нічого не знайшов або змінна ще порожня.";
      else if ((m = msg.match(/Cannot set properties of (undefined|null) \(setting '(.+)'\)/))) hint = "Спроба записати `." + m[2] + "` у `" + m[1] + "`. Перевір, чи елемент справді знайдено.";
      else if ((m = msg.match(/(.+) is not a function/))) hint = "`" + m[1] + "` — не функція. Перевір назву методу та дужки.";
      else if (/Assignment to constant variable/.test(msg)) hint = "Значення `const` не можна переприсвоїти. Якщо воно змінюється, оголоси його через `let`.";
      else if (/is not iterable/.test(msg)) hint = "Цикл `for...of` чи spread отримали не масив.";
      else hint = "Значення має не той тип, на який розраховує код.";
    } else if (name === "RangeError" && /call stack/.test(msg)) {
      hint = "Функція викликає сама себе без кінця (нескінченна рекурсія).";
    }
    return { title: name + ": " + msg, hint };
  }

  /* ---------- пісочниця ---------- */

  function makeStorage(init) {
    const data = new Map(Object.entries(init || {}).map(([k, v]) => [k, String(v)]));
    return {
      getItem: (k) => (data.has(String(k)) ? data.get(String(k)) : null),
      setItem: (k, v) => { data.set(String(k), String(v)); },
      removeItem: (k) => { data.delete(String(k)); },
      clear: () => data.clear(),
      key: (i) => Array.from(data.keys())[i] ?? null,
      get length() { return data.size; },
      keys: () => Array.from(data.keys()),
    };
  }

  function makeConsole(logs) {
    const write = (prefix) => (...args) => {
      logs.push(prefix + args.map((a) => (typeof a === "string" ? a : show(a))).join(" "));
    };
    return { log: write(""), info: write(""), debug: write(""), warn: write("⚠ "), error: write("✖ "), table: write("") };
  }

  function makeFetch(config, calls) {
    return function fetch(url) {
      calls.push(String(url));
      const cfg = config || { fail: true };
      return new Promise((resolve, reject) => {
        window.setTimeout(() => {
          if (cfg.fail) {
            reject(new TypeError("Failed to fetch"));
            return;
          }
          const ok = cfg.ok !== false;
          const status = cfg.status || (ok ? 200 : 500);
          resolve({
            ok,
            status,
            statusText: ok ? "OK" : "Error",
            url: String(url),
            headers: { get: () => "application/json" },
            json: () => Promise.resolve(clone(cfg.data)),
            text: () => Promise.resolve(JSON.stringify(cfg.data)),
          });
        }, 10);
      });
    };
  }

  /**
   * Створює пісочницю для одного тесту. Повертає об'єкт із run(),
   * що виконує код гравця й повертає його експортовані імена.
   */
  function createSandbox(level, prepared, testCase) {
    const logs = [];
    const errors = [];
    const fetchCalls = [];
    const alerts = [];
    const timers = new Set();
    const intervals = new Set();
    const storage = makeStorage(testCase.storage);
    const html = testCase.html !== undefined ? testCase.html : level.html || "";
    let loopStart = Date.now();
    let loopTicks = 0;

    function guard() {
      if ((++loopTicks & 1023) === 0 && Date.now() - loopStart > LOOP_LIMIT_MS) {
        const err = new Error("Цикл виконується понад " + LOOP_LIMIT_MS / 1000 + " с — схоже, він безкінечний.");
        err.name = "InfiniteLoopError";
        throw err;
      }
    }

    function safeCall(cb, args) {
      if (typeof cb !== "function") return;
      loopStart = Date.now();
      try { cb(...args); } catch (e) { errors.push(e); logs.push("✖ " + e.name + ": " + e.message); }
    }

    const api = {
      console: makeConsole(logs),
      localStorage: storage,
      sessionStorage: makeStorage(),
      fetch: makeFetch(testCase.fetch || level.fetch, fetchCalls),
      setTimeout(cb, ms, ...args) {
        const id = window.setTimeout(() => { timers.delete(id); safeCall(cb, args); }, ms);
        timers.add(id);
        return id;
      },
      setInterval(cb, ms, ...args) {
        const id = window.setInterval(() => safeCall(cb, args), Math.max(10, ms || 0));
        intervals.add(id);
        return id;
      },
      clearTimeout(id) { timers.delete(id); window.clearTimeout(id); },
      clearInterval(id) { intervals.delete(id); window.clearInterval(id); },
      alert(msg) { alerts.push(String(msg)); logs.push("[alert] " + msg); },
      prompt() { return null; },
      confirm() { return true; },
    };

    function newDocument() {
      const doc = document.implementation.createHTMLDocument("Пісочниця");
      doc.body.innerHTML = html;
      return doc;
    }

    const sandbox = {
      logs, errors, fetchCalls, alerts, storage,
      doc: newDocument(),
      exports: {},
      resetLoopClock() { loopStart = Date.now(); loopTicks = 0; },
      run() {
        const win = Object.assign({}, api, { document: sandbox.doc, addEventListener() {}, removeEventListener() {}, location: { reload() {} } });
        const params = ["console", "document", "window", "localStorage", "sessionStorage", "fetch", "setTimeout", "setInterval", "clearTimeout", "clearInterval", "alert", "prompt", "confirm", "__jsqGuard"];
        const factory = new Function(...params, prepared.body);
        sandbox.resetLoopClock();
        sandbox.exports = factory(api.console, sandbox.doc, win, api.localStorage, api.sessionStorage, api.fetch,
          api.setTimeout, api.setInterval, api.clearTimeout, api.clearInterval, api.alert, api.prompt, api.confirm, guard) || {};
        return sandbox.exports;
      },
      // «Перезавантаження сторінки»: та сама пам'ять, нова розмітка, код виконується знову.
      reload() {
        sandbox.cleanup();
        sandbox.doc = newDocument();
        return sandbox.run();
      },
      cleanup() {
        timers.forEach((id) => window.clearTimeout(id));
        intervals.forEach((id) => window.clearInterval(id));
        timers.clear();
        intervals.clear();
      },
    };
    return sandbox;
  }

  // Готує код до виконання: модулі → звичайний код, захист циклів, повернення імен.
  function prepare(level, code) {
    let source = code;
    let moduleExports = [];
    if (level.module) {
      const t = transformModule(source);
      source = t.code;
      moduleExports = t.exported;
    }
    const names = exportNames(level);
    const ret = names.map((n) => JSON.stringify(n) + ": typeof " + n + ' !== "undefined" ? ' + n + " : undefined").join(", ");
    // "use strict" — як у сучасних модулях: присвоєння неоголошеній змінній дає помилку,
    // а не тихо створює глобальну змінну на справжній сторінці.
    const body = '"use strict";\n' + addLoopGuards(source) + "\n;return {" + ret + "};";
    return { body, moduleExports };
  }

  function exportNames(level) {
    const names = new Set(level.exports || []);
    if (level.functionName) names.add(level.functionName);
    level.testCases.forEach((tc) => { if (tc.fn) names.add(tc.fn); });
    return Array.from(names);
  }

  function withTimeout(promise, ms) {
    let timer;
    return Promise.race([
      promise,
      new Promise((resolve, reject) => {
        timer = window.setTimeout(() => {
          const err = new Error("Тест чекав понад " + ms / 1000 + " с і не дочекався результату. Можливо, проміс ніколи не виконується?");
          err.name = "TimeoutError";
          reject(err);
        }, ms);
      }),
    ]).finally(() => window.clearTimeout(timer));
  }

  function makeContext(level, sandbox, prepared) {
    const ctx = {
      get doc() { return sandbox.doc; },
      get fn() { return sandbox.exports[level.functionName || exportNames(level)[0]]; },
      logs: sandbox.logs,
      storage: sandbox.storage,
      fetchCalls: sandbox.fetchCalls,
      alerts: sandbox.alerts,
      moduleExports: prepared.moduleExports,
      equal: deepEqual,
      show,
      get(name) {
        const value = sandbox.exports[name];
        if (value === undefined) throw new ReferenceError(name + " is not defined");
        return value;
      },
      $: (sel) => sandbox.doc.querySelector(sel),
      $$: (sel) => Array.from(sandbox.doc.querySelectorAll(sel)),
      sleep: (ms) => new Promise((r) => window.setTimeout(r, ms)),
      realTimeout: (cb, ms) => window.setTimeout(cb, ms),
      reload() {
        sandbox.reload();
      },
      // Подія з перехопленням помилок усередині обробників гравця.
      fire(el, type) {
        if (!el) throw new TypeError("Елемент для події «" + type + "» не знайдено на сторінці");
        const Ctor = type === "click" ? MouseEvent : Event;
        const event = new Ctor(type, { bubbles: true, cancelable: true });
        let captured = null;
        const onError = (e) => { captured = e.error || new Error(e.message); e.preventDefault(); };
        window.addEventListener("error", onError);
        try { el.dispatchEvent(event); } finally { window.removeEventListener("error", onError); }
        if (captured) throw captured;
        return event;
      },
    };
    return ctx;
  }

  function describeCall(level, tc) {
    if (tc.name) return tc.name;
    const fnName = tc.fn || level.functionName;
    const args = tc.input.map((a) => show(a)).join(", ");
    if (tc.throws) return fnName + "(" + args + ") кидає " + tc.throws.name;
    return fnName + "(" + args + ") → " + show(tc.expectedOutput);
  }

  async function runTestCase(level, tc, ctx, sandbox) {
    if (typeof tc.check === "function") {
      const r = await tc.check(ctx);
      return typeof r === "boolean" ? { pass: r } : r;
    }
    const fnName = tc.fn || level.functionName;
    const fn = sandbox.exports[fnName];
    if (typeof fn !== "function") {
      return { pass: false, actual: fn === undefined ? "функцію не знайдено" : show(fn), expected: "функція " + fnName, message: "Функцію `" + fnName + "` не знайдено — перевір її назву й оголошення." };
    }
    if (tc.throws) {
      try {
        const value = await fn(...clone(tc.input));
        return { pass: false, actual: "повернено " + show(value), expected: tc.throws.name + ": " + tc.throws.message };
      } catch (e) {
        const pass = e && e.name === tc.throws.name && e.message === tc.throws.message;
        return { pass, actual: e && e.name ? e.name + ": " + e.message : show(e), expected: tc.throws.name + ": " + tc.throws.message };
      }
    }
    const actual = await fn(...clone(tc.input));
    return { pass: deepEqual(actual, tc.expectedOutput), actual: show(actual), expected: show(tc.expectedOutput) };
  }

  /**
   * Перевіряє код для write-function / fix-code.
   * Повертає { pass, results[], codeChecks[], logs[], error, declared }.
   */
  async function runCode(level, code) {
    const clean = stripComments(code);
    const codeChecks = (level.codeChecks || []).map((c) => ({ label: c.label, pass: c.not ? !c.re.test(clean) : c.re.test(clean) }));
    const report = { pass: false, results: [], codeChecks, logs: [], error: null, declared: null };

    let prepared;
    try {
      prepared = prepare(level, code);
      // Пробна компіляція — ловимо синтаксичні помилки до запуску тестів.
      new Function(prepared.body); // eslint-disable-line no-new-func
    } catch (e) {
      report.error = friendlyError(e);
      report.results = level.testCases.map((tc) => ({ name: describeCall(level, tc), pass: false, actual: "код не запустився" }));
      return report;
    }

    // Необроблені відхилення промісів у коді гравця не повинні сипатись у консоль браузера —
    // показуємо їх у консолі гри.
    const rejections = [];
    const onRejection = (e) => { e.preventDefault(); rejections.push(e.reason); };
    window.addEventListener("unhandledrejection", onRejection);

    let firstRunError = null;
    for (let i = 0; i < level.testCases.length; i++) {
      const tc = level.testCases[i];
      const sandbox = createSandbox(level, prepared, tc);
      const result = { name: describeCall(level, tc), pass: false };
      try {
        sandbox.run();
        if (report.declared === null) report.declared = exportNames(level).every((n) => sandbox.exports[n] !== undefined);
        const ctx = makeContext(level, sandbox, prepared);
        sandbox.resetLoopClock();
        const r = await withTimeout(Promise.resolve().then(() => runTestCase(level, tc, ctx, sandbox)), TEST_TIMEOUT_MS);
        Object.assign(result, r);
        if (!result.pass && sandbox.errors.length) {
          const fe = friendlyError(sandbox.errors[0]);
          result.message = fe.title + (fe.hint ? " — " + fe.hint : "");
        }
      } catch (e) {
        const fe = friendlyError(e);
        result.pass = false;
        result.actual = fe.title;
        result.message = fe.hint;
        if (!firstRunError) firstRunError = fe;
      } finally {
        sandbox.cleanup();
      }
      if (i === 0) report.logs = sandbox.logs.slice();
      report.results.push(result);
    }
    // Даємо мікрозадачам завершитися, щоб зловити відхилення з останнього тесту.
    await new Promise((r) => window.setTimeout(r, 0));
    window.removeEventListener("unhandledrejection", onRejection);
    rejections.slice(0, 3).forEach((reason) => {
      report.logs.push("✖ Необроблена помилка проміса: " + (reason && reason.message ? reason.name + ": " + reason.message : show(reason)));
    });
    report.error = firstRunError;
    report.pass = report.results.every((r) => r.pass) && codeChecks.every((c) => c.pass);
    return report;
  }

  /* ---------- predict-output / multiple-choice / fill-blank ---------- */

  // Порівнюємо вивід «по-людськи»: без зайвих пробілів, лапок навколо і регістру.
  function normalizeOutput(text) {
    let s = String(text).trim().replace(/\s+/g, " ");
    if (/^(["'`«]).*(["'`»])$/.test(s) && s.length >= 2) s = s.slice(1, -1).trim();
    return s.toLowerCase();
  }

  function checkPredict(level, answers) {
    const expected = Array.isArray(level.expectedAnswer) ? level.expectedAnswer : [level.expectedAnswer];
    const lines = expected.map((exp, i) => {
      const given = answers[i] || "";
      return { expected: exp, given, filled: given.trim() !== "", pass: normalizeOutput(given) === normalizeOutput(exp) };
    });
    return { pass: lines.every((l) => l.pass), lines };
  }

  function checkChoice(level, choice) {
    return { pass: choice === level.expectedAnswer, chosen: choice };
  }

  function normalizeCode(text) {
    return String(text).replace(/\s+/g, "").replace(/'/g, '"');
  }

  function checkBlank(level, values) {
    const blanks = level.expectedAnswer.map((alternatives, i) => {
      const options = Array.isArray(alternatives) ? alternatives : [alternatives];
      const given = values[i] || "";
      return { given, filled: given.trim() !== "", pass: options.some((o) => normalizeCode(o) === normalizeCode(given)) };
    });
    return { pass: blanks.every((b) => b.pass), blanks };
  }

  window.Checker = {
    runCode,
    checkPredict,
    checkChoice,
    checkBlank,
    friendlyError,
    show,
    deepEqual,
    // Експортуємо для тестової сторінки.
    _internals: { addLoopGuards, transformModule, stripComments, normalizeOutput },
  };
})();
