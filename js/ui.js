/* =========================================================
   ui.js — спільні дрібниці інтерфейсу для обох екранів:
   SVG-іконки, бокове меню, екранування, підсвітка JS-коду.
   ========================================================= */
(function () {
  "use strict";

  // Іконки — інлайн SVG (stroke = currentColor), щоб успадковувати колір тексту.
  const ICONS = {
    map: '<path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z"/><path d="M9 4v13M15 6.5v13"/>',
    code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
    projects: '<rect x="3" y="8" width="18" height="13" rx="1.5"/><path d="M3 12h18M12 8v13M12 8c-1.5-4-6-4-6-1.5S9.5 8 12 8Zm0 0c1.5-4 6-4 6-1.5S14.5 8 12 8Z"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8 20h8M9 20l1-3h4l1 3"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" fill="currentColor" stroke="none"/>',
    play: '<path d="M7 4.5v15l12.5-7.5L7 4.5Z" fill="currentColor" stroke="none"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z"/>',
    chevronRight: '<path d="m9 5 7 7-7 7"/>',
    chevronDown: '<path d="m5 9 7 7 7-7"/>',
    chevronUp: '<path d="m5 15 7-7 7 7"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4.5h4.5"/>',
    terminal: '<rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="m7 9.5 3 2.5-3 2.5M12.5 15H17"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>',
    flame: '<path d="M12 21c-4 0-6.5-2.6-6.5-6.2 0-3.4 2.6-5.4 3.6-8.3.6 1.7 1.7 2.7 2.7 3.1C12 6.9 13 4.6 14.6 3c.4 3 4 5.4 4 10.6 0 4-2.8 7.4-6.6 7.4Z"/>',
    arrowLeft: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>',
    portal: '<rect x="5" y="2.5" width="14" height="19" rx="1.5"/><path d="M9 7.5c2-1.5 6-.5 6 2.5s-4 2.5-5 5 2 3 5 1.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    hammer: '<path d="m14 6 4 4M5 21l9.5-9.5M13 4.5l2.5-2.5L22 8.5 19.5 11Z"/>',
  };

  function icon(name, extraClass) {
    return '<svg class="icon ' + (extraClass || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + "</svg>";
  }

  function esc(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // Мінімальна розмітка для текстів рівнів: `код` → <code>.
  function md(text) {
    return esc(text).replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  /* ---------- підсвітка JavaScript ---------- */

  const DECL = new Set(["const", "let", "var", "function", "class", "extends", "new", "this", "typeof", "instanceof", "in", "of", "delete", "async", "await", "static", "get", "set", "super", "import", "export", "from"]);
  const CONTROL = new Set(["return", "if", "else", "for", "while", "do", "break", "continue", "switch", "case", "default", "try", "catch", "finally", "throw", "yield"]);
  const LITERALS = new Set(["true", "false", "null", "undefined", "NaN", "Infinity"]);

  const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?|`(?:\\.|[^`\\])*`?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$Ѐ-ӿ][\w$Ѐ-ӿ]*)|(\s+)|([\s\S])/g;

  // Мова фрагмента у світі HTML/CSS: теги — HTML, «селектор { властивість: … }» — CSS.
  function guessLang(code, fallback) {
    if (fallback !== "html") return fallback;
    const text = String(code || "").trim();
    if (/^</.test(text) || /<[a-zA-Z!][^>]*>/.test(text)) return "html";
    if (/[^{}]+\{[^}]*:[^}]*\}/.test(text) || /^@media/.test(text)) return "css";
    return "html";
  }

  function highlight(code, lang) {
    if (lang === "html") return highlightHtml(code);
    if (lang === "css") return highlightCss(code);
    return highlightJs(code);
  }

  /* ---------- підсвітка HTML ---------- */

  const HTML_TOKEN = /(<!--[\s\S]*?(?:-->|$))|(<!doctype[^>]*>?)|(<\/?)([A-Za-z][\w-]*)([^>]*?)(\/?>|$)|(&[#\w]+;)|([^<&]+|[<&])/gi;

  function highlightAttrs(text) {
    let out = "";
    const re = /(\s+)|([^\s=]+)(?:(\s*=\s*)("[^"]*"?|'[^']*'?|[^\s]+))?/g;
    let m;
    while ((m = re.exec(text))) {
      if (m[1]) out += m[1];
      else {
        out += '<span class="tk-attr">' + esc(m[2]) + "</span>";
        if (m[3]) out += esc(m[3]) + '<span class="tk-str">' + esc(m[4] || "") + "</span>";
      }
    }
    return out;
  }

  function highlightHtml(code) {
    let out = "";
    let m;
    HTML_TOKEN.lastIndex = 0;
    while ((m = HTML_TOKEN.exec(code))) {
      if (m[0] === "") { HTML_TOKEN.lastIndex++; continue; }
      if (m[1]) out += '<span class="tk-com">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tk-kw">' + esc(m[2]) + "</span>";
      else if (m[4]) out += esc(m[3]) + '<span class="tk-tag">' + esc(m[4]) + "</span>" + highlightAttrs(m[5]) + esc(m[6] || "");
      else if (m[7]) out += '<span class="tk-num">' + esc(m[7]) + "</span>";
      else out += esc(m[8]);
    }
    return out;
  }

  /* ---------- підсвітка CSS ----------
     Простий автомат: поза фігурними дужками — селектори,
     усередині правила — властивість до «:» і значення після. */

  function highlightCss(code) {
    let out = "";
    const stack = [];
    let inValue = false;
    let atPrelude = false;
    const re = /(\/\*[\s\S]*?(?:\*\/|$))|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|(@[\w-]+)|([{}:;])|([^{}:;"'\/@]+|[\/"'@])/g;
    let m;
    while ((m = re.exec(code))) {
      const inRule = stack[stack.length - 1] === "rule";
      if (m[1]) out += '<span class="tk-com">' + esc(m[1]) + "</span>";
      else if (m[2]) out += '<span class="tk-str">' + esc(m[2]) + "</span>";
      else if (m[3]) { out += '<span class="tk-ctl">' + esc(m[3]) + "</span>"; atPrelude = true; }
      else if (m[4]) {
        const p = m[4];
        if (p === "{") { stack.push(atPrelude ? "group" : "rule"); atPrelude = false; inValue = false; }
        else if (p === "}") { stack.pop(); inValue = false; }
        else if (p === ";") inValue = false;
        else if (p === ":" && inRule && !inValue) inValue = true;
        out += esc(p);
      } else {
        const text = m[5];
        if (!inRule) out += atPrelude ? esc(text) : '<span class="tk-fn">' + esc(text) + "</span>";
        else if (!inValue) out += '<span class="tk-kw">' + esc(text) + "</span>";
        else out += esc(text).replace(/(#[0-9a-fA-F]{3,8}\b|-?\d*\.?\d+(?:[a-z]+|%)?)/g, '<span class="tk-num">$1</span>');
      }
    }
    return out;
  }

  function highlightJs(code) {
    let out = "";
    let match;
    TOKEN.lastIndex = 0;
    while ((match = TOKEN.exec(code))) {
      const [token, comment, string, number, word] = match;
      if (comment) out += '<span class="tk-com">' + esc(token) + "</span>";
      else if (string) out += '<span class="tk-str">' + esc(token) + "</span>";
      else if (number) out += '<span class="tk-num">' + esc(token) + "</span>";
      else if (word) {
        const after = code.slice(TOKEN.lastIndex).match(/^\s*\(/);
        if (CONTROL.has(word)) out += '<span class="tk-ctl">' + word + "</span>";
        else if (DECL.has(word)) out += '<span class="tk-kw">' + word + "</span>";
        else if (LITERALS.has(word)) out += '<span class="tk-num">' + word + "</span>";
        else if (after) out += '<span class="tk-fn">' + esc(word) + "</span>";
        else out += esc(word);
      } else out += esc(token);
    }
    return out;
  }

  /* ---------- бокове меню ---------- */

  // root — шлях до кореня сайту ("" для index.html, "../" для levels/level.html).
  function renderSidebar(container, active, root) {
    // Карта, практика й проєкти ведуть у поточний (останній відвіданий) світ.
    const progress = Game.load();
    const current = Game.currentLevelId(progress) || Game.LEVELS.length;
    const worldQuery = "index.html?world=" + Game.WORLD_ID;
    const items = [
      { id: "hub", label: "Світи", icon: "portal", href: root + "index.html#hub" },
      { id: "map", label: "Карта", icon: "map", href: root + worldQuery + "#map" },
      { id: "practice", label: "Практика", icon: "code", href: Game.levelUrl(current, root) },
      { id: "projects", label: "Проєкти", icon: "projects", href: root + worldQuery + "#projects" },
      { id: "handbook", label: "Довідник", icon: "book", href: root + worldQuery + "#handbook" },
      { id: "trophies", label: "Трофеї", icon: "trophy", href: root + "index.html#trophies" },
    ];
    container.innerHTML =
      '<a class="logo" href="' + root + 'index.html#hub" aria-label="JS Quest — до світів">' +
      '<span class="logo-mark" aria-hidden="true">{ }</span><span class="logo-text">JS<br>Quest</span></a>' +
      '<nav class="nav" aria-label="Головне меню"><ul>' +
      items.map((it) =>
        '<li><a class="nav-link' + (it.id === active ? " is-active" : "") + '" data-nav="' + it.id + '" href="' + it.href + '"' +
        (it.id === active ? ' aria-current="page"' : "") + ">" + icon(it.icon) + "<span>" + it.label + "</span></a></li>"
      ).join("") +
      "</ul></nav>" +
      '<div class="sidebar-hero"><p class="bubble">Більше знань чекає попереду!</p><div class="sidebar-hero-art"></div></div>';
    const art = container.querySelector(".sidebar-hero-art");
    Art.mount(art, Art.hero(), "Герой");
  }

  function setActiveNav(container, active) {
    container.querySelectorAll(".nav-link").forEach((a) => {
      const on = a.dataset.nav === active;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  // Короткі повідомлення внизу екрана (світові події, трофеї).
  function toast(html, variant) {
    let host = document.querySelector(".toasts");
    if (!host) {
      host = document.createElement("div");
      host.className = "toasts";
      host.setAttribute("role", "status");
      host.setAttribute("aria-live", "polite");
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = "toast " + (variant || "");
    el.innerHTML = html;
    host.appendChild(el);
    setTimeout(() => el.classList.add("is-leaving"), 4200);
    setTimeout(() => el.remove(), 4700);
  }

  /* ---------- рух і анімації ----------
     "full"   — повна анімація;
     "gentle" — система просить «зменшити рух»: світ живе, але без спалахів і вибухів;
     "off"    — гравець поставив анімацію на паузу кнопкою (вибір запам'ятовується). */
  const MOTION_KEY = "js-game-motion";

  function motion() {
    let paused = false;
    try { paused = window.localStorage.getItem(MOTION_KEY) === "off"; } catch (e) { /* ignore */ }
    if (paused) return "off";
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "gentle" : "full";
  }

  function setMotion(on) {
    try { window.localStorage.setItem(MOTION_KEY, on ? "on" : "off"); } catch (e) { /* ignore */ }
    document.documentElement.classList.toggle("motion-off", !on);
  }

  document.documentElement.classList.toggle("motion-off", motion() === "off");

  window.UI = { icon, esc, md, highlight, guessLang, renderSidebar, setActiveNav, toast, motion, setMotion };
})();
