/* =========================================================
   levels-web.js — світ «Острів будівельників»: HTML і CSS.
   8 локацій, 60 рівнів.

   Нові типи завдань:
     write-markup — зверстати сторінку (index.html і/або style.css)
     fix-markup   — виправити верстку
   starterHtml / starterCss — стартові файли (null — файлу в завданні немає)
   solution: { html, css } — еталон для tests/run.html
   testCases[].check(ctx) — перевірка на справжньому рендері сторінки:
     ctx.$ / ctx.$$ / ctx.text / ctx.attr — DOM
     ctx.style(el, "prop") — обчислений стиль, ctx.rect(el) — розміри
     ctx.color("gold") — колір у форматі getComputedStyle
     ctx.rules(":hover") — CSS-правила, ctx.setWidth(px) — ширина вікна
     ctx.lint() — попередження про незакриті теги
   testCases[].width — ширина вікна для тесту (за замовчуванням 800)
   codeChecks[].in — "html" або "css" (за замовчуванням обидва файли)
   ========================================================= */
(function () {
  "use strict";

  // Порівняння з допуском у пікселях (рендер може давати дробові значення).
  const near = (a, b, tol) => Math.abs(a - b) <= (tol === undefined ? 1.5 : tol);
  const eq = (ctx, actual, expected) => ({ pass: actual === expected, actual: ctx.show(actual), expected: ctx.show(expected) });
  const px = (n) => Math.round(n) + "px";

  const LOCATIONS = [
    { id: 1, name: "Причал тегів",        arcs: [1], event: "Причал відбудовано — кораблі з тегами пришвартовуються",        trophy: { name: "Цеглина-тег",       icon: "brick" } },
    { id: 2, name: "Квартал семантики",   arcs: [2], event: "Квартал отримав вивіски — кожен дім знає своє призначення",   trophy: { name: "Вивіска гільдії",   icon: "sign" } },
    { id: 3, name: "Ринок форм",          arcs: [3], event: "Ринок відкрито — торговці приймають замовлення",              trophy: { name: "Перо писаря",       icon: "quill" } },
    { id: 4, name: "Фарбарня селекторів", arcs: [4], event: "Фарбарня розфарбувала острів у яскраві кольори",              trophy: { name: "Чарівний пензель",  icon: "brush" } },
    { id: 5, name: "Кузня коробок",       arcs: [5], event: "Кузня викувала міцні рамки для всіх будинків",                trophy: { name: "Скриня меж",        icon: "crate" } },
    { id: 6, name: "Флекс-доки",          arcs: [6], event: "Доки вишикувано в ідеальну лінію",                            trophy: { name: "Якір флексу",       icon: "anchor" } },
    { id: 7, name: "Гридбург",            arcs: [7], event: "Гридбург розплановано — місто стоїть рівними кварталами",     trophy: { name: "Креслення сітки",   icon: "blueprint" } },
    { id: 8, name: "Маяк адаптивності",   arcs: [8], event: "Маяк засяяв — острів видно з будь-якого екрана",              trophy: { name: "Лінза маяка",       icon: "lens" } },
  ];

  const A1 = { arc: "Основи HTML", arcNumber: 1, locationName: "Причал тегів" };
  const A2 = { arc: "Семантична розмітка", arcNumber: 2, locationName: "Квартал семантики" };
  const A3 = { arc: "Форми", arcNumber: 3, locationName: "Ринок форм" };
  const A4 = { arc: "Основи CSS", arcNumber: 4, locationName: "Фарбарня селекторів" };
  const A5 = { arc: "Блокова модель", arcNumber: 5, locationName: "Кузня коробок" };
  const A6 = { arc: "Flexbox", arcNumber: 6, locationName: "Флекс-доки" };
  const A7 = { arc: "CSS Grid", arcNumber: 7, locationName: "Гридбург" };
  const A8 = { arc: "Адаптивність і фінал", arcNumber: 8, locationName: "Маяк адаптивності" };

  const LEVELS = [
    /* ───────────── Причал тегів — основи HTML ───────────── */
    Object.assign({}, A1, {
      id: 1,
      title: "Структура документа",
      concept: "Кожна HTML-сторінка має скелет: `<!DOCTYPE html>` вмикає сучасний режим браузера, `<html>` — корінь, у `<head>` лежить службова інформація (кодування, `<title>` для вкладки), а в `<body>` — усе, що бачить відвідувач.",
      example: `<!DOCTYPE html>
<html lang="uk">
  <head>
    <meta charset="utf-8">
    <title>Моя сторінка</title>
  </head>
  <body>
    <p>Привіт, світе!</p>
  </body>
</html>`,
      missionStory: "Острів будівельників лежить у руїнах. Майстер причалу дає перше креслення — але лише одне з чотирьох складено правильно.",
      worldEvent: "На причалі встановили першу опору.",
      taskType: "multiple-choice",
      prompt: "Який скелет HTML-документа правильний?",
      optionsLang: "html",
      options: [
        `<!DOCTYPE html>\n<html lang="uk">\n  <head>\n    <title>Причал</title>\n  </head>\n  <body>\n    <h1>Вітаємо!</h1>\n  </body>\n</html>`,
        `<html>\n  <body>\n    <title>Причал</title>\n    <h1>Вітаємо!</h1>\n  </body>\n  <head></head>\n</html>`,
        `<!DOCTYPE html>\n<head>\n  <html>\n    <h1>Вітаємо!</h1>\n  </html>\n</head>`,
        `<!DOCTYPE html>\n<body>\n  <head><title>Причал</title></head>\n  <h1>Вітаємо!</h1>\n</body>`,
      ],
      expectedAnswer: `<!DOCTYPE html>\n<html lang="uk">\n  <head>\n    <title>Причал</title>\n  </head>\n  <body>\n    <h1>Вітаємо!</h1>\n  </body>\n</html>`,
      hint: "`<head>` і `<body>` — сусіди всередині `<html>`, а `<title>` живе в `<head>`.",
      difficulty: 1,
    }),
    Object.assign({}, A1, {
      id: 2,
      title: "Заголовки",
      concept: "Заголовки `<h1>`–`<h6>` будують змістову ієрархію сторінки. `<h1>` — головний заголовок (зазвичай один на сторінку), `<h2>` — розділи, `<h3>` — підрозділи. Обирай рівень за змістом, а не за розміром шрифту.",
      example: `<h1>Острів будівельників</h1>
<h2>Причал</h2>
<h3>Розклад</h3>`,
      missionStory: "Над причалом треба вивісити табличку з назвою, а на складі — вказівники розділів.",
      worldEvent: "Над причалом з'явилась велика вивіска.",
      taskType: "write-markup",
      prompt: "Додай заголовок `<h1>` з текстом «Причал тегів» і під ним два `<h2>`: «Розклад кораблів» та «Склад».",
      starterHtml: `<!-- Додай заголовки тут -->
`,
      starterCss: null,
      testCases: [
        { name: "Є один h1 «Причал тегів»", check: (ctx) => eq(ctx, ctx.$$("h1").map((h) => h.textContent.trim()).join("|"), "Причал тегів") },
        { name: "Два h2 у правильному порядку", check: (ctx) => eq(ctx, ctx.$$("h2").map((h) => h.textContent.trim()).join(" / "), "Розклад кораблів / Склад") },
      ],
      codeChecks: [{ re: /<h1>[\s\S]*<\/h1>/i, label: "Є заголовок h1", in: "html" }],
      solution: { html: `<h1>Причал тегів</h1>
<h2>Розклад кораблів</h2>
<h2>Склад</h2>
` },
      hint: "Кожен заголовок — окремий тег: `<h2>Склад</h2>`. Не забудь закривальні теги.",
      difficulty: 1,
    }),
    Object.assign({}, A1, {
      id: 3,
      title: "Абзаци й перенесення",
      concept: "Текст ділять на абзаци тегом `<p>`. Браузер ігнорує зайві пробіли й перенесення рядків у коді, тож для примусового перенесення всередині абзацу є порожній тег `<br>` (у нього немає закривального).",
      example: `<p>Перший абзац.</p>
<p>Рядок один<br>Рядок два</p>`,
      missionStory: "Капітан диктує запис у журнал причалу. Журнал любить порядок: кожна думка — окремий абзац.",
      worldEvent: "Журнал причалу заповнено охайними записами.",
      taskType: "write-markup",
      prompt: "Додай два абзаци. Перший: «Кораблі прибувають щоранку.» Другий: «Капітан: Остап» і з нового рядка (через `<br>`) «Вантаж: цеглини».",
      starterHtml: `<h1>Журнал причалу</h1>
`,
      starterCss: null,
      testCases: [
        { name: "Є рівно два абзаци", check: (ctx) => eq(ctx, ctx.$$("p").length, 2) },
        { name: "Перший абзац з правильним текстом", check: (ctx) => eq(ctx, ctx.$$("p")[0] ? ctx.text(ctx.$$("p")[0]) : null, "Кораблі прибувають щоранку.") },
        {
          name: "Другий абзац розділено тегом <br>",
          check(ctx) {
            const p = ctx.$$("p")[1];
            const ok = !!p && !!p.querySelector("br") && p.innerHTML.replace(/\s+/g, " ").includes("Капітан: Остап") && p.textContent.includes("Вантаж: цеглини");
            return { pass: ok, actual: p ? ctx.show(p.innerHTML.trim()) : "немає", expected: "\"Капітан: Остап<br>Вантаж: цеглини\"" };
          },
        },
      ],
      solution: { html: `<h1>Журнал причалу</h1>
<p>Кораблі прибувають щоранку.</p>
<p>Капітан: Остап<br>Вантаж: цеглини</p>
` },
      hint: "Другий абзац: `<p>Капітан: Остап<br>Вантаж: цеглини</p>`.",
      difficulty: 1,
    }),
    Object.assign({}, A1, {
      id: 4,
      title: "Списки",
      concept: "`<ul>` — маркований список (порядок не важливий), `<ol>` — нумерований (кроки, рейтинги). Кожен пункт — `<li>`. Списки можна вкладати один в одного: вкладений `<ul>` живе всередині `<li>`.",
      example: `<ul>
  <li>Цеглини</li>
  <li>Дошки</li>
</ul>
<ol>
  <li>Розвантажити</li>
  <li>Перерахувати</li>
</ol>`,
      missionStory: "На склад прибув вантаж, а бригадир хоче інструкцію з розвантаження. Склади два списки.",
      worldEvent: "Вантаж розкладено, інструкція висить на стіні складу.",
      taskType: "write-markup",
      prompt: "Створи маркований список вантажу (`ul`): «Цеглини», «Дошки», «Цвяхи». Під ним — нумерований список кроків (`ol`): «Пришвартуватись», «Розвантажити», «Перерахувати».",
      starterHtml: `<h2>Вантаж</h2>

<h2>Кроки</h2>
`,
      starterCss: null,
      testCases: [
        { name: "ul з трьома пунктами вантажу", check: (ctx) => eq(ctx, ctx.$$("ul > li").map((li) => li.textContent.trim()).join(", "), "Цеглини, Дошки, Цвяхи") },
        { name: "ol з трьома кроками", check: (ctx) => eq(ctx, ctx.$$("ol > li").map((li) => li.textContent.trim()).join(", "), "Пришвартуватись, Розвантажити, Перерахувати") },
      ],
      solution: { html: `<h2>Вантаж</h2>
<ul>
  <li>Цеглини</li>
  <li>Дошки</li>
  <li>Цвяхи</li>
</ul>
<h2>Кроки</h2>
<ol>
  <li>Пришвартуватись</li>
  <li>Розвантажити</li>
  <li>Перерахувати</li>
</ol>
` },
      hint: "Список — це обгортка `<ul>` або `<ol>`, а кожен пункт усередині — `<li>…</li>`.",
      difficulty: 1,
    }),
    Object.assign({}, A1, {
      id: 5,
      title: "Посилання",
      concept: "Посилання `<a href=\"…\">` веде на іншу сторінку, файл або місце на цій самій сторінці (`href=\"#id\"`). Для зовнішніх сайтів у новій вкладці додають `target=\"_blank\"` разом із `rel=\"noopener\"` — так нова вкладка не отримує доступу до твоєї.",
      example: `<a href="https://developer.mozilla.org/uk/" target="_blank" rel="noopener">MDN</a>
<a href="#contacts">До контактів</a>
<section id="contacts">…</section>`,
      missionStory: "Причалу потрібні вказівники: один веде до великої бібліотеки знань за морем, інший — до розкладу на цій же дошці.",
      worldEvent: "На причалі стоять вказівники в усі боки.",
      taskType: "write-markup",
      prompt: "Додай посилання «Довідник MDN» на `https://developer.mozilla.org/uk/`, що відкривається в новій вкладці (`target=\"_blank\"`, `rel=\"noopener\"`). І посилання «До розкладу», що веде на секцію з `id=\"schedule\"` на цій сторінці.",
      starterHtml: `<nav>
  <!-- посилання тут -->
</nav>

<section id="schedule">
  <h2>Розклад кораблів</h2>
</section>
`,
      starterCss: null,
      testCases: [
        {
          name: "Зовнішнє посилання на MDN у новій вкладці",
          check(ctx) {
            const a = ctx.$('a[href="https://developer.mozilla.org/uk/"]');
            const ok = !!a && a.textContent.trim() === "Довідник MDN" && a.getAttribute("target") === "_blank" && /noopener/.test(a.getAttribute("rel") || "");
            return { pass: ok, actual: a ? ctx.show(a.outerHTML) : "посилання не знайдено", expected: '<a href="https://developer.mozilla.org/uk/" target="_blank" rel="noopener">Довідник MDN</a>' };
          },
        },
        {
          name: "Посилання «До розкладу» веде на #schedule",
          check(ctx) {
            const a = ctx.$('a[href="#schedule"]');
            return { pass: !!a && a.textContent.trim() === "До розкладу" && !!ctx.$("#schedule"), actual: a ? ctx.show(a.outerHTML) : "посилання не знайдено", expected: '<a href="#schedule">До розкладу</a>' };
          },
        },
      ],
      solution: { html: `<nav>
  <a href="https://developer.mozilla.org/uk/" target="_blank" rel="noopener">Довідник MDN</a>
  <a href="#schedule">До розкладу</a>
</nav>

<section id="schedule">
  <h2>Розклад кораблів</h2>
</section>
` },
      hint: "Посилання на місце сторінки — це `#` + id: `<a href=\"#schedule\">`.",
      difficulty: 1,
    }),
    Object.assign({}, A1, {
      id: 6,
      title: "Зображення і alt",
      concept: "`<img src=\"…\" alt=\"…\">` вставляє зображення. Атрибут `alt` — текстова заміна для людей із програмами читання екрана й на випадок, якщо картинка не завантажилась. Для суто декоративних картинок пишуть порожній `alt=\"\"` — тоді програма читання їх пропускає.",
      example: `<img src="lighthouse.svg" alt="Маяк на скелі під час заходу сонця">
<img src="divider.png" alt="">`,
      missionStory: "Художник причалу розвісив картини, але не підписав їх — сліпий шкіпер не знає, що на них.",
      worldEvent: "Картини причалу отримали зрозумілі підписи.",
      taskType: "fix-markup",
      prompt: "Додай змістовний `alt` (щонайменше 5 символів) до зображення корабля `ship.svg`. Зображення `wave.svg` — декоративне: дай йому порожній `alt=\"\"`.",
      starterHtml: `<h2>Галерея причалу</h2>
<img src="ship.svg">
<img src="wave.svg">
`,
      starterCss: null,
      testCases: [
        {
          name: "У корабля змістовний alt",
          check(ctx) {
            const alt = ctx.attr('img[src="ship.svg"]', "alt");
            return { pass: !!alt && alt.trim().length >= 5, actual: ctx.show(alt), expected: "опис щонайменше з 5 символів" };
          },
        },
        {
          name: "Декоративна хвиля має порожній alt",
          check: (ctx) => eq(ctx, ctx.attr('img[src="wave.svg"]', "alt"), ""),
        },
      ],
      solution: { html: `<h2>Галерея причалу</h2>
<img src="ship.svg" alt="Вітрильник із цеглинами біля причалу">
<img src="wave.svg" alt="">
` },
      hint: "Порожній alt — це саме `alt=\"\"`, а не відсутній атрибут: без нього програма читання прочитає ім'я файлу.",
      difficulty: 1,
    }),
    Object.assign({}, A1, {
      id: 7,
      title: "Вкладеність тегів",
      concept: "Теги закриваються у зворотному порядку відкриття, як матрьошки: `<p><strong>…</strong></p>`. Браузер мовчки «лагодить» неправильну вкладеність, але результат буває несподіваним. Тег `<li>` теж варто закривати.",
      example: `<p><strong>Увага!</strong> Міст зачинено.</p>
<ul>
  <li>Мотузка</li>
  <li>Цвях</li>
</ul>`,
      missionStory: "Хтось нашвидку збив оголошення на причалі — дошки перехрещуються, і вітер ось-ось їх зірве.",
      worldEvent: "Оголошення на причалі міцно прибите.",
      taskType: "fix-markup",
      prompt: "Виправ розмітку: `<strong>` має закриватися всередині абзацу, а кожен пункт списку — мати закривальний `</li>`. У консолі перевірки з'являться підказки про незакриті теги.",
      starterHtml: `<p><strong>Увага!</p></strong>
<ul>
  <li>Мотузка
  <li>Цвях
</ul>
`,
      starterCss: null,
      testCases: [
        { name: "Немає незакритих чи переплутаних тегів", check: (ctx) => ({ pass: ctx.lint().length === 0, actual: ctx.lint().join(" ") || "все гаразд", expected: "жодного попередження" }) },
        { name: "strong усередині абзацу", check: (ctx) => eq(ctx, ctx.$("p strong") ? ctx.$("p strong").textContent : null, "Увага!") },
        { name: "Два пункти списку", check: (ctx) => eq(ctx, ctx.$$("li").map((li) => li.textContent.trim()).join(", "), "Мотузка, Цвях") },
      ],
      codeChecks: [
        { re: /<strong>[^<]*<\/strong>\s*<\/p>/i, label: "</strong> стоїть перед </p>", in: "html" },
        { re: /<\/li>[\s\S]*<\/li>/i, label: "Обидва пункти мають </li>", in: "html" },
      ],
      solution: { html: `<p><strong>Увага!</strong></p>
<ul>
  <li>Мотузка</li>
  <li>Цвях</li>
</ul>
` },
      hint: "Що відкрилось останнім — закривається першим: `<p><strong>Увага!</strong></p>`.",
      difficulty: 2,
    }),
    Object.assign({}, A1, {
      id: 8,
      title: "Спецсимволи й коментарі",
      concept: "Деякі символи в HTML мають особливе значення, тому їх пишуть як сутності: `&lt;` — це `<`, `&gt;` — `>`, `&amp;` — `&`. Коментарі `<!-- … -->` бачить лише розробник: браузер їх не показує.",
      example: `<p>2 &lt; 3</p>       <!-- покаже: 2 < 3 -->
<p>Ріг &amp; Копито</p> <!-- покаже: Ріг & Копито -->`,
      missionStory: "У трюмі знайшли зашифрований лист. Розшифруй, що побачить мешканець острова, коли прочитає його на дошці оголошень.",
      worldEvent: "Причал відбудовано — кораблі з тегами пришвартовуються!",
      taskType: "predict-output",
      prompt: "Що буде видно на сторінці в кожному абзаці? Коментар браузер не показує.",
      answerHeading: "Що побачить відвідувач?",
      answerPlaceholder: "текст абзацу",
      lineLabels: ["Абзац 1", "Абзац 2", "Абзац 3"],
      starterCode: null,
      code: `<p>5 &lt; 7</p>
<p>Tom &amp; Jerry</p>
<!-- <p>Секретний вантаж</p> -->
<p>10 &gt; 3</p>`,
      expectedAnswer: ["5 < 7", "Tom & Jerry", "10 > 3"],
      hint: "`lt` — less than (менше), `gt` — greater than (більше), `amp` — ampersand (&).",
      difficulty: 1,
    }),

    /* ───────────── Квартал семантики ───────────── */
    Object.assign({}, A2, {
      id: 9,
      title: "header, nav, main, footer",
      concept: "Семантичні теги описують роль частин сторінки: `<header>` — шапка, `<nav>` — навігація, `<main>` — головний вміст (один на сторінку), `<footer>` — підвал. Їх розуміють пошукові системи й програми читання екрана — на відміну від безликих `<div>`.",
      example: `<header>
  <h1>Квартал</h1>
  <nav>…</nav>
</header>
<main>…</main>
<footer>…</footer>`,
      missionStory: "У кварталі семантики кожен будинок має знати своє призначення. Збудуй головну вулицю за правилами гільдії.",
      worldEvent: "Головна вулиця кварталу розмічена.",
      taskType: "write-markup",
      prompt: "Збудуй сторінку: `header` з `h1` «Квартал семантики» і `nav`, у якому список (`ul`) із трьох посилань; далі `main` з абзацом; наприкінці `footer` з абзацом «© 2026 Гільдія».",
      starterHtml: `<!-- шапка, головний вміст і підвал -->
`,
      starterCss: null,
      testCases: [
        { name: "header містить h1 «Квартал семантики»", check: (ctx) => eq(ctx, ctx.$("header h1") ? ctx.text("header h1") : null, "Квартал семантики") },
        { name: "nav зі списком щонайменше з 3 посилань", check: (ctx) => ({ pass: ctx.$$("nav ul li a").length >= 3, actual: ctx.$$("nav ul li a").length + " посилань", expected: "щонайменше 3" }) },
        { name: "Є main з абзацом", check: (ctx) => ({ pass: !!ctx.$("main p"), actual: ctx.$("main p") ? "є" : "немає", expected: "є" }) },
        {
          name: "footer — останній і з текстом «© 2026 Гільдія»",
          check(ctx) {
            const f = ctx.$("footer");
            const blocks = ctx.$$("body > header, body > main, body > footer");
            return { pass: !!f && ctx.text(f).includes("© 2026 Гільдія") && blocks[blocks.length - 1] === f, actual: f ? ctx.show(ctx.text(f)) : "немає footer", expected: "footer після main" };
          },
        },
      ],
      solution: { html: `<header>
  <h1>Квартал семантики</h1>
  <nav>
    <ul>
      <li><a href="#houses">Будинки</a></li>
      <li><a href="#market">Ринок</a></li>
      <li><a href="#guild">Гільдія</a></li>
    </ul>
  </nav>
</header>
<main>
  <p>Тут кожен дім знає своє призначення.</p>
</main>
<footer>
  <p>© 2026 Гільдія</p>
</footer>
` },
      hint: "Символ © можна вставити як є або сутністю `&copy;`. `nav` можна покласти всередину `header`.",
      difficulty: 1,
    }),
    Object.assign({}, A2, {
      id: 10,
      title: "article і section",
      concept: "`<article>` — самостійний, завершений фрагмент (новина, допис, картка товару), який має сенс і поза сторінкою. `<section>` — тематичний розділ сторінки, зазвичай із заголовком.",
      example: `<main>
  <article>
    <h2>Новина дня</h2>
    <p>…</p>
  </article>
  <section>
    <h2>Мешканці</h2>
  </section>
</main>`,
      missionStory: "Газета кварталу виходить сьогодні вперше. Розклади новину й рубрику так, щоб їх розуміли і люди, і пошукові совиці.",
      worldEvent: "Перший випуск газети кварталу розійшовся вулицями.",
      taskType: "write-markup",
      prompt: "Усередині `main` створи `article` з `h2` «Новий міст» і абзацом, а після нього — `section` з `h2` «Мешканці».",
      starterHtml: `<main>

</main>
`,
      starterCss: null,
      testCases: [
        { name: "article з h2 «Новий міст» і абзацом", check: (ctx) => ({ pass: !!ctx.$("main article h2") && ctx.text("main article h2") === "Новий міст" && !!ctx.$("main article p"), actual: ctx.$("main article") ? ctx.show(ctx.$("main article").outerHTML) : "немає article", expected: "article > h2 «Новий міст» + p" }) },
        { name: "section з h2 «Мешканці»", check: (ctx) => eq(ctx, ctx.$("main section h2") ? ctx.text("main section h2") : null, "Мешканці") },
      ],
      solution: { html: `<main>
  <article>
    <h2>Новий міст</h2>
    <p>Будівельники відкрили міст через затоку.</p>
  </article>
  <section>
    <h2>Мешканці</h2>
  </section>
</main>
` },
      hint: "Обидва блоки — сусіди всередині `<main>`.",
      difficulty: 1,
    }),
    Object.assign({}, A2, {
      id: 11,
      title: "aside",
      concept: "`<aside>` — додатковий вміст, пов'язаний з основним лише опосередковано: бічна панель, примітка, реклама, «читайте також». Заміна `<div class=\"sidebar\">` на `<aside>` нічого не змінює візуально, але додає сенсу.",
      example: `<main>…</main>
<aside>
  <h3>Порада</h3>
  <p>…</p>
</aside>`,
      missionStory: "Біля дошки оголошень висить «бічна примітка», збита з безликих дощок. Гільдія вимагає, щоб вона мала власну вивіску.",
      worldEvent: "Примітка гільдії отримала власну нішу.",
      taskType: "fix-markup",
      prompt: "Заміни `<div class=\"sidebar\">` на семантичний `<aside>` (вміст лишається той самий).",
      starterHtml: `<main>
  <h2>Новини</h2>
  <p>Будівництво триває.</p>
</main>
<div class="sidebar">
  <h3>Порада</h3>
  <p>Носіть каски!</p>
</div>
`,
      starterCss: null,
      testCases: [
        { name: "Є aside з порадою", check: (ctx) => eq(ctx, ctx.$("aside h3") ? ctx.text("aside h3") : null, "Порада") },
        { name: "Немає div.sidebar", check: (ctx) => eq(ctx, ctx.$$("div.sidebar").length, 0) },
      ],
      solution: { html: `<main>
  <h2>Новини</h2>
  <p>Будівництво триває.</p>
</main>
<aside>
  <h3>Порада</h3>
  <p>Носіть каски!</p>
</aside>
` },
      hint: "Заміни і відкривальний, і закривальний тег: `<aside>` … `</aside>`.",
      difficulty: 1,
    }),
    Object.assign({}, A2, {
      id: 12,
      title: "figure і figcaption",
      concept: "`<figure>` обгортає ілюстрацію (фото, схему, фрагмент коду), а `<figcaption>` дає їй підпис. Так підпис логічно пов'язаний із зображенням.",
      example: `<figure>
  <img src="plan.svg" alt="План кварталу">
  <figcaption>План кварталу, 2026</figcaption>
</figure>`,
      missionStory: "Архітектор приніс план кварталу. Повісь його в ратуші з підписом, щоб усі знали, що це.",
      worldEvent: "У ратуші висить план кварталу з підписом.",
      taskType: "write-markup",
      prompt: "Створи `figure` із зображенням `plan.svg` (з alt) і підписом `figcaption` «План кварталу».",
      starterHtml: `<h2>Ратуша</h2>
`,
      starterCss: null,
      testCases: [
        { name: "figure містить img з alt", check: (ctx) => ({ pass: !!ctx.$('figure img[src="plan.svg"]') && !!(ctx.attr("figure img", "alt") || "").trim(), actual: ctx.$("figure img") ? ctx.show(ctx.$("figure img").outerHTML) : "немає", expected: '<img src="plan.svg" alt="…">' }) },
        { name: "Підпис «План кварталу»", check: (ctx) => eq(ctx, ctx.$("figure figcaption") ? ctx.text("figure figcaption") : null, "План кварталу") },
      ],
      solution: { html: `<h2>Ратуша</h2>
<figure>
  <img src="plan.svg" alt="Схема вулиць кварталу семантики">
  <figcaption>План кварталу</figcaption>
</figure>
` },
      hint: "`figcaption` — всередині `figure`, поруч із `img`.",
      difficulty: 1,
    }),
    Object.assign({}, A2, {
      id: 13,
      title: "strong і em",
      concept: "`<strong>` позначає важливий текст, `<em>` — смисловий наголос. Вони несуть значення (програма читання змінює інтонацію). `<b>` та `<i>` лише змінюють вигляд без сенсу — для стилізації краще CSS.",
      example: `<p><strong>Обережно:</strong> слизька підлога.</p>
<p>Я <em>дуже</em> просив не бігати.</p>`,
      missionStory: "На мосту треба вивісити попередження, яке не можна пропустити — ні очима, ні вухами.",
      worldEvent: "Попередження на мосту чути навіть з закритими очима.",
      taskType: "multiple-choice",
      prompt: "Попередження «Міст зачинено!» критично важливе. Яка розмітка семантично правильна?",
      optionsLang: "html",
      options: [
        `<p><strong>Міст зачинено!</strong></p>`,
        `<p><b>Міст зачинено!</b></p>`,
        `<p><span style="font-weight: bold">Міст зачинено!</span></p>`,
        `<p><i>Міст зачинено!</i></p>`,
      ],
      expectedAnswer: `<p><strong>Міст зачинено!</strong></p>`,
      hint: "Шукай тег, що означає «важливо», а не просто «жирно».",
      difficulty: 1,
    }),
    Object.assign({}, A2, {
      id: 14,
      title: "button чи a",
      concept: "Правило: `<a>` веде кудись (інша сторінка, якір), `<button>` робить дію на місці (відкрити меню, надіслати форму). Кнопки з `<div>` не працюють із клавіатури й не оголошуються програмами читання.",
      example: `<a href="/shop">До крамниці</a>
<button type="button">Відкрити меню</button>`,
      missionStory: "Крамар просить кнопку «Замовити», що відкриває вікно замовлення просто на цій сторінці.",
      worldEvent: "Крамар радісно дзвенить дзвіночком замовлень.",
      taskType: "multiple-choice",
      prompt: "Кнопка «Замовити» відкриває форму замовлення на цій самій сторінці без переходу. Що використати?",
      optionsLang: "html",
      options: [
        `<button type="button">Замовити</button>`,
        `<a href="#">Замовити</a>`,
        `<div class="btn">Замовити</div>`,
        `<span class="link">Замовити</span>`,
      ],
      expectedAnswer: `<button type="button">Замовити</button>`,
      hint: "Дія на місці, без навігації — це завжди кнопка.",
      difficulty: 1,
    }),
    Object.assign({}, A2, {
      id: 15,
      title: "Ієрархія заголовків",
      concept: "Заголовки мають утворювати чисту ієрархію без пропусків: один `h1`, під ним `h2`, у розділах — `h3`. Стрибок з `h1` одразу на `h4` плутає програми читання екрана, які навігують сторінкою саме за заголовками.",
      example: `<h1>Квартал</h1>
  <h2>Будинки</h2>
    <h3>Ратуша</h3>
  <h2>Вулиці</h2>`,
      missionStory: "Покажчики в кварталі переплутано: два головні входи і сходи, що ведуть одразу на четвертий поверх.",
      worldEvent: "Квартал отримав вивіски — кожен дім знає своє призначення!",
      taskType: "fix-markup",
      prompt: "Виправ рівні заголовків: залиш один `h1` («Квартал семантики»), розділи «Будинки» і «Вулиці» зроби `h2`, а «Ратуша» — `h3`. Без стрибків рівнів.",
      starterHtml: `<h1>Квартал семантики</h1>
<h1>Будинки</h1>
<h4>Ратуша</h4>
<h4>Вулиці</h4>
`,
      starterCss: null,
      testCases: [
        { name: "Рівно один h1", check: (ctx) => eq(ctx, ctx.$$("h1").length, 1) },
        {
          name: "Послідовність h1 → h2 → h3 → h2",
          check: (ctx) => eq(ctx, ctx.$$("h1, h2, h3, h4, h5, h6").map((h) => h.tagName.toLowerCase() + " " + h.textContent.trim()).join(" | "), "h1 Квартал семантики | h2 Будинки | h3 Ратуша | h2 Вулиці"),
        },
      ],
      solution: { html: `<h1>Квартал семантики</h1>
<h2>Будинки</h2>
<h3>Ратуша</h3>
<h2>Вулиці</h2>
` },
      hint: "«Ратуша» — підрозділ «Будинків», тому на рівень глибше: `h3`. «Вулиці» — новий розділ: знову `h2`.",
      difficulty: 1,
    }),

    /* ───────────── Ринок форм ───────────── */
    Object.assign({}, A3, {
      id: 16,
      title: "form, input, label",
      concept: "Форма `<form>` збирає дані. Поле `<input>` потребує мітки `<label>`: атрибут `for` мітки дорівнює `id` поля. Тоді клік по мітці фокусує поле, а програма читання озвучує, що вводити. Атрибут `name` — ім'я поля під час відправки.",
      example: `<form>
  <label for="nick">Ім'я</label>
  <input id="nick" name="nick" type="text">
  <button type="submit">Надіслати</button>
</form>`,
      missionStory: "Ринок відкривається! Перший торговець просить простеньку форму замовлення.",
      worldEvent: "Перший торговець отримав замовлення.",
      taskType: "write-markup",
      prompt: "Створи форму: мітка «Ім'я покупця» пов'язана з текстовим полем `id=\"buyer\"`, `name=\"buyer\"`, і кнопка відправки `type=\"submit\"` з текстом «Замовити».",
      starterHtml: `<form>

</form>
`,
      starterCss: null,
      testCases: [
        { name: "Мітка пов'язана з полем #buyer", check: (ctx) => ({ pass: !!ctx.$("#buyer") && ctx.$("#buyer").labels.length > 0 && ctx.text(ctx.$("#buyer").labels[0]) === "Ім'я покупця", actual: ctx.$("#buyer") && ctx.$("#buyer").labels.length ? ctx.show(ctx.text(ctx.$("#buyer").labels[0])) : "мітки немає", expected: "\"Ім'я покупця\"" }) },
        { name: "Поле текстове з name=\"buyer\"", check: (ctx) => ({ pass: !!ctx.$("#buyer") && ctx.$("#buyer").type === "text" && ctx.attr("#buyer", "name") === "buyer", actual: ctx.$("#buyer") ? ctx.show(ctx.$("#buyer").outerHTML) : "немає", expected: '<input id="buyer" name="buyer" type="text">' }) },
        { name: "Кнопка відправки «Замовити»", check: (ctx) => ({ pass: !!ctx.$('form button[type="submit"]') && ctx.text('form button[type="submit"]') === "Замовити", actual: ctx.$("form button") ? ctx.show(ctx.$("form button").outerHTML) : "немає", expected: '<button type="submit">Замовити</button>' }) },
      ],
      solution: { html: `<form>
  <label for="buyer">Ім'я покупця</label>
  <input id="buyer" name="buyer" type="text">
  <button type="submit">Замовити</button>
</form>
` },
      hint: "`for` у мітці й `id` у полі мають збігатися: `for=\"buyer\"` ↔ `id=\"buyer\"`.",
      difficulty: 1,
    }),
    Object.assign({}, A3, {
      id: 17,
      title: "Типи полів",
      concept: "`type` змінює поведінку поля: `email` перевіряє формат пошти й показує на телефоні клавіатуру з `@`, `number` приймає лише числа (з `min`/`max`), `date` показує календар. Правильний тип — це безкоштовна валідація й зручність.",
      example: `<input type="email" id="mail">
<input type="number" id="age" min="1" max="120">
<input type="date" id="day">`,
      missionStory: "Оптовики хочуть замовляти більше, ніж одну цеглину. Розширимо форму ринку.",
      worldEvent: "На ринку з'явились оптові замовлення.",
      taskType: "write-markup",
      prompt: "Додай у форму три поля з мітками: email `id=\"email\"`, кількість `id=\"qty\"` типу number від 1 до 99 (`min`, `max`), дата доставки `id=\"day\"` типу date.",
      starterHtml: `<form>

</form>
`,
      starterCss: null,
      testCases: [
        { name: "#email має type=\"email\"", check: (ctx) => eq(ctx, ctx.$("#email") ? ctx.$("#email").type : null, "email") },
        { name: "#qty — number з min=1 і max=99", check: (ctx) => eq(ctx, ctx.$("#qty") ? [ctx.$("#qty").type, ctx.attr("#qty", "min"), ctx.attr("#qty", "max")].join(" ") : null, "number 1 99") },
        { name: "#day має type=\"date\"", check: (ctx) => eq(ctx, ctx.$("#day") ? ctx.$("#day").type : null, "date") },
        { name: "Кожне поле має мітку", check: (ctx) => ({ pass: ["#email", "#qty", "#day"].every((s) => ctx.$(s) && ctx.$(s).labels.length > 0), actual: ["#email", "#qty", "#day"].filter((s) => !(ctx.$(s) && ctx.$(s).labels.length)).join(", ") || "усі мають", expected: "усі мають мітки" }) },
      ],
      solution: { html: `<form>
  <label for="email">Пошта</label>
  <input type="email" id="email" name="email">

  <label for="qty">Кількість</label>
  <input type="number" id="qty" name="qty" min="1" max="99">

  <label for="day">Дата доставки</label>
  <input type="date" id="day" name="day">
</form>
` },
      hint: "Межі числа — атрибути самого поля: `min=\"1\" max=\"99\"`.",
      difficulty: 1,
    }),
    Object.assign({}, A3, {
      id: 18,
      title: "select і option",
      concept: "`<select>` — випадний список, `<option>` — його варіанти. Атрибут `value` — те, що надішле форма; текст між тегами — те, що бачить людина. `selected` робить варіант обраним за замовчуванням.",
      example: `<label for="size">Розмір</label>
<select id="size" name="size">
  <option value="s">Малий</option>
  <option value="m" selected>Середній</option>
</select>`,
      missionStory: "Торговець будматеріалами хоче, щоб покупці обирали товар зі списку, а не писали з помилками.",
      worldEvent: "Прилавок будматеріалів працює без плутанини.",
      taskType: "write-markup",
      prompt: "Створи список `select` з `id=\"goods\"` і міткою «Товар». Варіанти: «Цеглина» (`value=\"brick\"`), «Дошка» (`value=\"plank\"`), «Цвяхи» (`value=\"nails\"`).",
      starterHtml: `<form>

</form>
`,
      starterCss: null,
      testCases: [
        { name: "Значення варіантів brick, plank, nails", check: (ctx) => eq(ctx, ctx.$$("#goods option").map((o) => o.value).join(","), "brick,plank,nails") },
        { name: "Тексти варіантів", check: (ctx) => eq(ctx, ctx.$$("#goods option").map((o) => o.textContent.trim()).join(","), "Цеглина,Дошка,Цвяхи") },
        { name: "Є мітка «Товар»", check: (ctx) => ({ pass: !!ctx.$("#goods") && ctx.$("#goods").labels.length > 0 && ctx.text(ctx.$("#goods").labels[0]) === "Товар", actual: ctx.$("#goods") && ctx.$("#goods").labels.length ? ctx.show(ctx.text(ctx.$("#goods").labels[0])) : "немає", expected: "\"Товар\"" }) },
      ],
      solution: { html: `<form>
  <label for="goods">Товар</label>
  <select id="goods" name="goods">
    <option value="brick">Цеглина</option>
    <option value="plank">Дошка</option>
    <option value="nails">Цвяхи</option>
  </select>
</form>
` },
      hint: "Кожен варіант: `<option value=\"brick\">Цеглина</option>`.",
      difficulty: 1,
    }),
    Object.assign({}, A3, {
      id: 19,
      title: "textarea",
      concept: "`<textarea>` — багаторядкове поле для довгого тексту (коментар, адреса). На відміну від `<input>`, воно має закривальний тег, а висоту задають атрибутом `rows`.",
      example: `<label for="note">Коментар</label>
<textarea id="note" rows="4"></textarea>`,
      missionStory: "Покупці хочуть залишати побажання до замовлення — довгі, з кількох рядків.",
      worldEvent: "На ринку з'явилась скринька побажань.",
      taskType: "fill-blank",
      prompt: "Встав назву тегу багаторядкового поля.",
      starterCode: `<label for="note">Побажання</label>
<___ id="note" rows="4"></textarea>`,
      expectedAnswer: [["textarea"]],
      hint: "Подивись на закривальний тег — він уже підказує відповідь.",
      difficulty: 1,
    }),
    Object.assign({}, A3, {
      id: 20,
      title: "checkbox і radio",
      concept: "`type=\"radio\"` — вибір одного з групи: усі перемикачі групи мають однаковий `name`. `type=\"checkbox\"` — незалежна галочка «так/ні». Обидва потребують мітки; часто поле кладуть просто всередину `<label>`.",
      example: `<label><input type="radio" name="size" value="s"> Малий</label>
<label><input type="radio" name="size" value="l"> Великий</label>
<label><input type="checkbox" name="gift"> Подарункова упаковка</label>`,
      missionStory: "Доставка буває двох видів, а ще можна застрахувати вантаж. Покупцям потрібні зручні перемикачі.",
      worldEvent: "Ринок пропонує доставку морем і возом.",
      taskType: "write-markup",
      prompt: "Додай два радіо-перемикачі з `name=\"delivery\"`: «Кораблем» (`value=\"ship\"`) і «Возом» (`value=\"cart\"`), а також галочку «Застрахувати» з `id=\"insure\"`. У кожного — мітка.",
      starterHtml: `<form>

</form>
`,
      starterCss: null,
      testCases: [
        { name: "Два перемикачі в одній групі delivery", check: (ctx) => eq(ctx, ctx.$$('input[type="radio"][name="delivery"]').map((r) => r.value).sort().join(","), "cart,ship") },
        { name: "Галочка #insure", check: (ctx) => eq(ctx, ctx.$("#insure") ? ctx.$("#insure").type : null, "checkbox") },
        { name: "Усі поля мають мітки", check: (ctx) => ({ pass: ctx.$$("input").length >= 3 && ctx.$$("input").every((i) => i.labels.length > 0), actual: ctx.$$("input").filter((i) => !i.labels.length).length + " без мітки", expected: "0 без мітки" }) },
      ],
      solution: { html: `<form>
  <label><input type="radio" name="delivery" value="ship"> Кораблем</label>
  <label><input type="radio" name="delivery" value="cart"> Возом</label>
  <label><input type="checkbox" id="insure" name="insure"> Застрахувати</label>
</form>
` },
      hint: "Однаковий `name` об'єднує перемикачі в групу — тож обрати можна лише один.",
      difficulty: 2,
    }),
    Object.assign({}, A3, {
      id: 21,
      title: "Атрибути валідації",
      concept: "HTML уміє перевіряти форму без жодного JavaScript: `required` — поле обов'язкове, `minlength`/`maxlength` — довжина тексту, `type=\"email\"` — формат пошти, `pattern` — регулярний вираз. Браузер сам не дасть надіслати некоректну форму.",
      example: `<input id="nick" required minlength="3">
<input id="mail" type="email" required>`,
      missionStory: "На ринок приходять порожні замовлення без імені й адреси. Торговці просять захисту від таких «привидів».",
      worldEvent: "Порожні замовлення більше не проходять.",
      taskType: "fix-markup",
      prompt: "Зроби поле `#name` обов'язковим із мінімальною довжиною 3 символи, а `#email` — обов'язковим і з типом email.",
      starterHtml: `<form>
  <label for="name">Ім'я</label>
  <input id="name" name="name" type="text">

  <label for="email">Пошта</label>
  <input id="email" name="email" type="text">

  <button type="submit">Замовити</button>
</form>
`,
      starterCss: null,
      testCases: [
        { name: "#name обов'язкове, minlength=3", check: (ctx) => eq(ctx, ctx.$("#name").required + " " + ctx.$("#name").minLength, "true 3") },
        { name: "#email обов'язкове з типом email", check: (ctx) => eq(ctx, ctx.$("#email").required + " " + ctx.$("#email").type, "true email") },
        {
          name: "Некоректна пошта не проходить перевірку браузера",
          check(ctx) {
            const input = ctx.$("#email");
            input.value = "не-пошта";
            return { pass: input.checkValidity() === false, actual: "checkValidity() → " + input.checkValidity(), expected: "checkValidity() → false" };
          },
        },
      ],
      solution: { html: `<form>
  <label for="name">Ім'я</label>
  <input id="name" name="name" type="text" required minlength="3">

  <label for="email">Пошта</label>
  <input id="email" name="email" type="email" required>

  <button type="submit">Замовити</button>
</form>
` },
      hint: "`required` пишеться без значення: `<input … required minlength=\"3\">`.",
      difficulty: 2,
    }),
    Object.assign({}, A3, {
      id: 22,
      title: "fieldset і legend",
      concept: "`<fieldset>` групує пов'язані поля форми, а `<legend>` дає групі назву. Для групи радіо-перемикачів це особливо важливо: програма читання оголосить питання («Спосіб доставки») перед варіантами.",
      example: `<fieldset>
  <legend>Розмір</legend>
  <label><input type="radio" name="size"> S</label>
  <label><input type="radio" name="size"> M</label>
</fieldset>`,
      missionStory: "Покупці бачать перемикачі «Кораблем» і «Возом», але не розуміють, до чого вони. Допоможи їм.",
      worldEvent: "Форма доставки стала зрозумілою кожному.",
      taskType: "write-markup",
      prompt: "Обгорни обидва перемикачі доставки в `fieldset` з `legend` «Спосіб доставки».",
      starterHtml: `<form>
  <label><input type="radio" name="delivery" value="ship"> Кораблем</label>
  <label><input type="radio" name="delivery" value="cart"> Возом</label>
</form>
`,
      starterCss: null,
      testCases: [
        { name: "legend «Спосіб доставки»", check: (ctx) => eq(ctx, ctx.$("fieldset > legend") ? ctx.text("fieldset > legend") : null, "Спосіб доставки") },
        { name: "Обидва перемикачі всередині fieldset", check: (ctx) => eq(ctx, ctx.$$('fieldset input[type="radio"]').length, 2) },
      ],
      solution: { html: `<form>
  <fieldset>
    <legend>Спосіб доставки</legend>
    <label><input type="radio" name="delivery" value="ship"> Кораблем</label>
    <label><input type="radio" name="delivery" value="cart"> Возом</label>
  </fieldset>
</form>
` },
      hint: "`legend` — перший елемент усередині `fieldset`.",
      difficulty: 1,
    }),
    Object.assign({}, A3, {
      id: 23,
      title: "Доступна форма",
      concept: "Підказка в `placeholder` — не мітка: вона зникає під час введення, а програми читання часто її не озвучують. У доступній формі кожне поле має `<label>`, а дія — справжній `<button>`, до якого можна дійти клавішею Tab.",
      example: `<label for="phone">Телефон</label>
<input id="phone" type="tel" placeholder="+380…">
<button type="submit">Надіслати</button>`,
      missionStory: "До ринку прийшла сліпа майстриня, але форма замовлення для неї німа. Зроби форму, якою може скористатись кожен.",
      worldEvent: "Ринок відкрито — торговці приймають замовлення!",
      taskType: "fix-markup",
      prompt: "Додай мітки до полів `#customer` («Ім'я») і `#address` («Адреса»), а «кнопку» з `div` заміни на справжній `<button type=\"submit\">Надіслати</button>`.",
      starterHtml: `<form>
  <input id="customer" placeholder="Ім'я">
  <input id="address" placeholder="Адреса">
  <div class="btn">Надіслати</div>
</form>
`,
      starterCss: null,
      testCases: [
        { name: "#customer має мітку «Ім'я»", check: (ctx) => eq(ctx, ctx.$("#customer").labels.length ? ctx.text(ctx.$("#customer").labels[0]) : null, "Ім'я") },
        { name: "#address має мітку «Адреса»", check: (ctx) => eq(ctx, ctx.$("#address").labels.length ? ctx.text(ctx.$("#address").labels[0]) : null, "Адреса") },
        { name: "Справжня кнопка відправки, без div.btn", check: (ctx) => ({ pass: !!ctx.$('form button[type="submit"]') && !ctx.$("div.btn"), actual: ctx.$("div.btn") ? "div.btn на місці" : ctx.$("form button") ? "кнопка є" : "кнопки немає", expected: '<button type="submit">' }) },
      ],
      solution: { html: `<form>
  <label for="customer">Ім'я</label>
  <input id="customer" placeholder="Ім'я">
  <label for="address">Адреса</label>
  <input id="address" placeholder="Адреса">
  <button type="submit">Надіслати</button>
</form>
` },
      hint: "Мітка перед полем: `<label for=\"customer\">Ім'я</label>`.",
      difficulty: 2,
    }),
    /* ───────────── Фарбарня селекторів — основи CSS ───────────── */
    Object.assign({}, A4, {
      id: 24,
      title: "Підключення CSS",
      concept: "Стилі зазвичай живуть в окремому файлі й підключаються в `<head>` тегом `<link rel=\"stylesheet\" href=\"style.css\">`. Атрибут `rel` пояснює браузеру, що це саме таблиця стилів. Для дрібниць є ще блок `<style>` прямо в документі.",
      example: `<head>
  <link rel="stylesheet" href="style.css">
</head>`,
      missionStory: "Фарбарня острова отримала цілу бочку фарби — тепер її треба правильно під'єднати до будинків.",
      worldEvent: "До фарбарні під'єднали першу бочку фарби.",
      taskType: "multiple-choice",
      prompt: "Який рядок правильно підключає файл стилів `style.css`?",
      optionsLang: "html",
      options: [
        `<link rel="stylesheet" href="style.css">`,
        `<style src="style.css"></style>`,
        `<link href="style.css">`,
        `<script src="style.css"></script>`,
      ],
      expectedAnswer: `<link rel="stylesheet" href="style.css">`,
      hint: "Потрібен тег `link` з обома атрибутами: що підключаємо (`rel`) і звідки (`href`).",
      difficulty: 1,
    }),
    Object.assign({}, A4, {
      id: 25,
      title: "Селектори тегу, класу, id",
      concept: "Селектор обирає елементи для стилю: `p` — усі абзаци, `.note` — елементи з класом `note`, `#title` — єдиний елемент з `id=\"title\"`. Правило: `селектор { властивість: значення; }`.",
      example: `h1 { color: navy; }
.price { font-weight: bold; }
#logo { width: 120px; }`,
      missionStory: "Фарбар отримав замовлення: пофарбувати вивіску, примітку й усі тексти — кожне по-своєму.",
      worldEvent: "Вивіска фарбарні засяяла новими кольорами.",
      taskType: "write-markup",
      prompt: "У `style.css` зроби: заголовок `#title` кольору `tomato`, елементам класу `.note` — фон `gold`, усім абзацам `p` — розмір шрифту `18px`.",
      starterHtml: `<h1 id="title">Фарбарня</h1>
<p class="note">Фарба свіжа!</p>
<p>Відчинено щодня.</p>
`,
      starterCss: `/* твої стилі */
`,
      testCases: [
        { name: "#title кольору tomato", check: (ctx) => eq(ctx, ctx.style("#title", "color"), ctx.color("tomato")) },
        { name: ".note на тлі gold", check: (ctx) => eq(ctx, ctx.style(".note", "background-color"), ctx.color("gold")) },
        { name: "Усі абзаци — 18px", check: (ctx) => eq(ctx, ctx.$$("p").map((p) => ctx.style(p, "font-size")).join(" "), "18px 18px") },
      ],
      codeChecks: [
        { re: /#title\s*\{/, label: "Використано селектор #title", in: "css" },
        { re: /\.note\s*\{/, label: "Використано селектор .note", in: "css" },
      ],
      solution: {
        html: `<h1 id="title">Фарбарня</h1>
<p class="note">Фарба свіжа!</p>
<p>Відчинено щодня.</p>
`,
        css: `#title {
  color: tomato;
}

.note {
  background-color: gold;
}

p {
  font-size: 18px;
}
`,
      },
      hint: "Клас — з крапкою (`.note`), id — з решіткою (`#title`), тег — просто назва (`p`).",
      difficulty: 1,
    }),
    Object.assign({}, A4, {
      id: 26,
      title: "Формати кольорів",
      concept: "Колір у CSS задають назвою (`tomato`), шістнадцятковим кодом `#rrggbb`, функцією `rgb(червоний, зелений, синій)` з числами 0–255 або `hsl(відтінок, насиченість, світлота)`. Браузер усе зводить до одного — `rgb(...)`.",
      example: `.a { color: #ff8800; }
.b { color: rgb(0, 128, 255); }
.c { color: hsl(120, 60%, 40%); }`,
      missionStory: "Три бочки фарби підписані різними мовами кольорів. Фарбар просить розфарбувати три човни — кожен своїм записом.",
      worldEvent: "Три човни біля фарбарні сяють кольорами.",
      taskType: "write-markup",
      prompt: "Розфарбуй текст човнів: `.boat1` — `#ff8800`, `.boat2` — `rgb(0, 128, 255)`, `.boat3` — `hsl(120, 60%, 40%)`. Використай саме ці три записи.",
      starterHtml: `<p class="boat1">Човен «Іскра»</p>
<p class="boat2">Човен «Хвиля»</p>
<p class="boat3">Човен «Ліс»</p>
`,
      starterCss: `/* розфарбуй човни */
`,
      testCases: [
        { name: ".boat1 — помаранчевий #ff8800", check: (ctx) => eq(ctx, ctx.style(".boat1", "color"), "rgb(255, 136, 0)") },
        { name: ".boat2 — синій rgb(0, 128, 255)", check: (ctx) => eq(ctx, ctx.style(".boat2", "color"), "rgb(0, 128, 255)") },
        { name: ".boat3 — зелений hsl(120, 60%, 40%)", check: (ctx) => eq(ctx, ctx.style(".boat3", "color"), ctx.color("hsl(120, 60%, 40%)")) },
      ],
      codeChecks: [
        { re: /#ff8800/i, label: "Є шістнадцятковий запис #ff8800", in: "css" },
        { re: /rgb\(\s*0\s*,\s*128\s*,\s*255\s*\)/, label: "Є запис rgb(...)", in: "css" },
        { re: /hsl\(/, label: "Є запис hsl(...)", in: "css" },
      ],
      solution: {
        html: `<p class="boat1">Човен «Іскра»</p>
<p class="boat2">Човен «Хвиля»</p>
<p class="boat3">Човен «Ліс»</p>
`,
        css: `.boat1 { color: #ff8800; }
.boat2 { color: rgb(0, 128, 255); }
.boat3 { color: hsl(120, 60%, 40%); }
`,
      },
      hint: "Властивість для кольору тексту — `color`. Значення: `#ff8800`, `rgb(0, 128, 255)`, `hsl(120, 60%, 40%)`.",
      difficulty: 1,
    }),
    Object.assign({}, A4, {
      id: 27,
      title: "Шрифти",
      concept: "`font-family` — гарнітура зі списком запасних варіантів (останній — загальний: `serif`, `sans-serif`). `font-size` — розмір, `font-weight` — насиченість (400 звичайний, 700 жирний), `line-height` — міжрядковий інтервал; число без одиниць множиться на розмір шрифту.",
      example: `body { font-family: Georgia, serif; }
h1 { font-size: 32px; }
p { line-height: 1.5; }`,
      missionStory: "Друкар острова хоче, щоб вивіски читалися легко: гарний шрифт, великий заголовок і просторі рядки.",
      worldEvent: "Друкарня надрукувала афіші гарним шрифтом.",
      taskType: "write-markup",
      prompt: "Задай `body` шрифт `Georgia, serif`; заголовку `h1` — розмір `32px`; класу `.label` — `font-weight: 700`; абзацам `p` — `line-height: 1.5`.",
      starterHtml: `<h1>Афіша</h1>
<p>Сьогодні ярмарок будівельників. <span class="label">Вхід вільний.</span></p>
`,
      starterCss: `/* шрифти */
`,
      testCases: [
        { name: "body — Georgia", check: (ctx) => ({ pass: /Georgia/i.test(ctx.style("body", "font-family")), actual: ctx.show(ctx.style("body", "font-family")), expected: "\"Georgia, serif\"" }) },
        { name: "h1 — 32px", check: (ctx) => eq(ctx, ctx.style("h1", "font-size"), "32px") },
        { name: ".label — 700", check: (ctx) => eq(ctx, ctx.style(".label", "font-weight"), "700") },
        { name: "p — line-height 1.5 (24px при 16px шрифті)", check: (ctx) => eq(ctx, ctx.style("p", "line-height"), "24px") },
      ],
      solution: {
        html: `<h1>Афіша</h1>
<p>Сьогодні ярмарок будівельників. <span class="label">Вхід вільний.</span></p>
`,
        css: `body {
  font-family: Georgia, serif;
}

h1 {
  font-size: 32px;
}

.label {
  font-weight: 700;
}

p {
  line-height: 1.5;
}
`,
      },
      hint: "Чотири окремі правила. `line-height: 1.5` — без одиниць.",
      difficulty: 1,
    }),
    Object.assign({}, A4, {
      id: 28,
      title: "Комбіновані селектори",
      concept: "Селектор нащадка `nav a` обирає `a` будь-де всередині `nav`. Дочірній селектор `.menu > li` — лише прямих дітей `.menu`, без вкладених глибше. Так стиль не «розтікається» туди, де не треба.",
      example: `nav a { color: white; }        /* усі посилання в nav */
.menu > li { border: 1px solid; } /* лише прямі пункти */`,
      missionStory: "Фарбар пофарбував усі посилання острова в один колір — і тепер не видно, де меню, а де підвал. Час на точність.",
      worldEvent: "Меню фарбарні тепер легко відрізнити від підвалу.",
      taskType: "write-markup",
      prompt: "Зроби посилання лише всередині `nav` кольору `crimson` (посилання в `footer` не чіпай). Прямим пунктам `.menu > li` додай нижню рамку `border-bottom: 2px solid black`; вкладені пункти рамки мати не повинні.",
      starterHtml: `<nav>
  <ul class="menu">
    <li><a href="#a">Фарби</a>
      <ul>
        <li><a href="#b">Олійні</a></li>
      </ul>
    </li>
    <li><a href="#c">Пензлі</a></li>
  </ul>
</nav>
<footer><a href="#d">Контакти</a></footer>
`,
      starterCss: `/* точні селектори */
`,
      testCases: [
        { name: "Посилання в nav — crimson", check: (ctx) => eq(ctx, ctx.$$("nav a").map((a) => ctx.style(a, "color")).every((c) => c === ctx.color("crimson")), true) },
        { name: "Посилання в footer не змінилось", check: (ctx) => ({ pass: ctx.style("footer a", "color") !== ctx.color("crimson"), actual: ctx.style("footer a", "color"), expected: "не crimson" }) },
        { name: "Прямі пункти мають рамку 2px", check: (ctx) => eq(ctx, ctx.$$(".menu > li").map((li) => ctx.style(li, "border-bottom-width")).join(" "), "2px 2px") },
        { name: "Вкладений пункт без рамки", check: (ctx) => eq(ctx, ctx.style(".menu li li", "border-bottom-width"), "0px") },
      ],
      codeChecks: [{ re: /\.menu\s*>\s*li/, label: "Використано дочірній селектор .menu > li", in: "css" }],
      solution: {
        html: `<nav>
  <ul class="menu">
    <li><a href="#a">Фарби</a>
      <ul>
        <li><a href="#b">Олійні</a></li>
      </ul>
    </li>
    <li><a href="#c">Пензлі</a></li>
  </ul>
</nav>
<footer><a href="#d">Контакти</a></footer>
`,
        css: `nav a {
  color: crimson;
}

.menu > li {
  border-bottom: 2px solid black;
}
`,
      },
      hint: "Пробіл між селекторами — «десь усередині», знак `>` — «прямий нащадок».",
      difficulty: 2,
    }),
    Object.assign({}, A4, {
      id: 29,
      title: "Псевдокласи",
      concept: "Псевдокласи обирають елементи за станом чи позицією: `:hover` — під курсором, `:focus` — у фокусі, `:first-child` — перший серед братів, `:nth-child(even)` — кожен парний. Пишуться через двокрапку після селектора.",
      example: `a:hover { text-decoration: underline; }
li:first-child { font-weight: 700; }
tr:nth-child(even) { background: #eee; }`,
      missionStory: "Прейскурант фарбарні — довгий список. Покупці губляться в рядках; допоможи їм очима.",
      worldEvent: "Прейскурант фарбарні став «смугастим» і зручним.",
      taskType: "write-markup",
      prompt: "Перший пункт списку `li:first-child` зроби жирним (`font-weight: 700`), кожен парний `li:nth-child(even)` — з фоном `lavender`, а посилання при наведенні `a:hover` — кольору `darkorange`.",
      starterHtml: `<ul>
  <li>Біла — 5 монет</li>
  <li>Червона — 7 монет</li>
  <li>Синя — 7 монет</li>
  <li>Золота — 20 монет</li>
</ul>
<a href="#order">Замовити фарбу</a>
`,
      starterCss: `/* псевдокласи */
`,
      testCases: [
        { name: "Перший пункт жирний, другий — ні", check: (ctx) => eq(ctx, ctx.$$("li").slice(0, 2).map((li) => ctx.style(li, "font-weight")).join(" "), "700 400") },
        { name: "Парні пункти на тлі lavender", check: (ctx) => eq(ctx, ctx.$$("li").map((li) => ctx.style(li, "background-color") === ctx.color("lavender")).join(" "), "false true false true") },
        {
          name: "Правило a:hover змінює колір",
          check(ctx) {
            const rule = ctx.rules(/a:hover/)[0];
            const color = rule ? rule.rule.style.getPropertyValue("color") : "";
            return { pass: !!rule && ctx.color(color) === ctx.color("darkorange"), actual: rule ? "a:hover { color: " + color + " }" : "правила a:hover немає", expected: "a:hover { color: darkorange }" };
          },
        },
      ],
      solution: {
        html: `<ul>
  <li>Біла — 5 монет</li>
  <li>Червона — 7 монет</li>
  <li>Синя — 7 монет</li>
  <li>Золота — 20 монет</li>
</ul>
<a href="#order">Замовити фарбу</a>
`,
        css: `li:first-child {
  font-weight: 700;
}

li:nth-child(even) {
  background-color: lavender;
}

a:hover {
  color: darkorange;
}
`,
      },
      hint: "Псевдоклас пишеться впритул до селектора: `li:first-child`, без пробілу.",
      difficulty: 2,
    }),
    Object.assign({}, A4, {
      id: 30,
      title: "Специфічність",
      concept: "Коли кілька правил змагаються за один елемент, перемагає найспецифічніший селектор: id сильніший за клас, клас — сильніший за тег. `p.note` (тег + клас) сильніший за просто `.note`. При рівній специфічності виграє правило, записане пізніше.",
      example: `p { color: green; }      /* 0-0-1 */
.note { color: blue; }   /* 0-1-0 */
#main { color: red; }    /* 1-0-0 — найсильніший */`,
      missionStory: "Три фарбарі одночасно фарбують ті самі вивіски. Чия фарба ляже зверху?",
      worldEvent: "Фарбарі домовились, чия фарба головна.",
      taskType: "predict-output",
      prompt: "Якого кольору буде текст кожного абзацу? Впиши назву кольору англійською, як у CSS.",
      answerHeading: "Якого кольору текст?",
      answerPlaceholder: "назва кольору",
      lineLabels: ["«Перший»", "«Другий»", "«Третій»"],
      exampleLang: "css",
      starterCode: null,
      code: `<style>
  p { color: green; }
  .note { color: blue; }
  #main { color: red; }
  p.note { color: purple; }
</style>
<p id="main" class="note">Перший</p>
<p class="note">Другий</p>
<p>Третій</p>`,
      expectedAnswer: ["red", "purple", "green"],
      hint: "Порівнюй силу селекторів: id > клас > тег, а `p.note` — це тег і клас разом.",
      difficulty: 2,
    }),
    Object.assign({}, A4, {
      id: 31,
      title: "Каскад і успадкування",
      concept: "Каскад: при однаковій специфічності перемагає пізніше правило. Успадкування: деякі властивості (колір, шрифт) переходять від батька до дітей, а інші (рамки, відступи, фон) — ні.",
      example: `body { color: navy; }   /* діти успадкують колір */
.box { border: 1px solid; } /* рамка не успадковується */`,
      missionStory: "Фарба тече зверху вниз, але не скрізь. Учень фарбаря просить пояснити, що куди потрапить.",
      worldEvent: "Учень фарбаря зрозумів, як тече фарба.",
      taskType: "predict-output",
      prompt: "Дай відповідь на три запитання про результат цього коду.",
      answerHeading: "Що вийде?",
      answerPlaceholder: "відповідь",
      lineLabels: ["Колір <p>", "Колір <span>", "Рамка в <span>? (так/ні)"],
      starterCode: null,
      code: `<style>
  body { color: navy; }
  .box { border: 1px solid black; }
  p { color: teal; }
  p { color: orange; }
</style>
<div class="box">
  <p>Текст</p>
  <span>Підпис</span>
</div>`,
      expectedAnswer: ["orange", "navy", "ні"],
      hint: "Два правила `p` рівні за силою — виграє нижче. `span` колір успадковує від `body`, а рамка не успадковується.",
      difficulty: 2,
    }),
    Object.assign({}, A4, {
      id: 32,
      title: "Одиниці px, rem, %",
      concept: "`px` — абсолютні пікселі. `rem` — множник від розміру шрифту кореневого елемента `html` (зазвичай 16px), тож `2rem` = 32px. `%` — частка від батька. `rem` зручний, бо поважає налаштування розміру шрифту користувача.",
      example: `html { font-size: 16px; }
.title { font-size: 2rem; }  /* 32px */
.half { width: 50%; }        /* половина ширини батька */`,
      missionStory: "Фарбарня готує вивіски різних розмірів, але креслення записані в rem. Порахуй, якою вийде головна вивіска.",
      worldEvent: "Фарбарня розфарбувала острів у яскраві кольори!",
      taskType: "multiple-choice",
      prompt: "Який розмір шрифту отримає `.title`?",
      exampleLang: "css",
      code: `html { font-size: 16px; }
.title { font-size: 2rem; }`,
      options: ["32px", "2px", "18px", "16px"],
      optionsLang: "css",
      expectedAnswer: "32px",
      hint: "`1rem` дорівнює розміру шрифту `html`.",
      difficulty: 1,
    }),

    /* ───────────── Кузня коробок — блокова модель ───────────── */
    Object.assign({}, A5, {
      id: 33,
      title: "margin і padding",
      concept: "Кожен елемент — коробка з шарів: вміст, `padding` (внутрішній відступ до рамки), `border` (рамка) і `margin` (зовнішній відступ до сусідів). Скорочення `padding: 16px` задає відступ з усіх чотирьох боків.",
      example: `.card {
  padding: 16px;  /* усередині */
  margin: 24px;   /* зовні */
}`,
      missionStory: "У кузні коробок скрині стоять впритул, а вміст тисне на стінки. Майстер просить дати їм повітря.",
      worldEvent: "Скрині в кузні стоять рівно, з проміжками.",
      taskType: "write-markup",
      prompt: "Задай `.crate` внутрішній відступ `16px` з усіх боків і зовнішній відступ `24px` з усіх боків.",
      starterHtml: `<div class="crate">Цвяхи</div>
<div class="crate">Гвинти</div>
`,
      starterCss: `.crate {
  background: #c08a52;
}
`,
      testCases: [
        { name: "padding 16px з усіх боків", check: (ctx) => eq(ctx, ["top", "right", "bottom", "left"].map((s) => ctx.style(".crate", "padding-" + s)).join(" "), "16px 16px 16px 16px") },
        { name: "margin 24px з усіх боків", check: (ctx) => eq(ctx, ["top", "right", "bottom", "left"].map((s) => ctx.style(".crate", "margin-" + s)).join(" "), "24px 24px 24px 24px") },
      ],
      solution: {
        html: `<div class="crate">Цвяхи</div>
<div class="crate">Гвинти</div>
`,
        css: `.crate {
  background: #c08a52;
  padding: 16px;
  margin: 24px;
}
`,
      },
      hint: "Додай два рядки в наявне правило `.crate`.",
      difficulty: 1,
    }),
    Object.assign({}, A5, {
      id: 34,
      title: "border і border-radius",
      concept: "`border: товщина стиль колір` малює рамку (`solid`, `dashed`, `dotted`). `border-radius` заокруглює кути: `8px` — м'які кути, `50%` — коло (якщо елемент квадратний).",
      example: `.badge {
  border: 2px dashed #333;
  border-radius: 8px;
}`,
      missionStory: "Скрині ковалів без оковки розсипаються. Додай їм міцні рамки й заокругли гострі кути, щоб ніхто не подряпався.",
      worldEvent: "Скрині отримали оковки й безпечні кути.",
      taskType: "write-markup",
      prompt: "Дай `.crate` рамку `3px solid #5e3a1c` і заокруглення кутів `8px`.",
      starterHtml: `<div class="crate">Інструменти</div>
`,
      starterCss: `.crate {
  padding: 16px;
  background: #c08a52;
}
`,
      testCases: [
        { name: "Рамка 3px solid", check: (ctx) => eq(ctx, ctx.style(".crate", "border-top-width") + " " + ctx.style(".crate", "border-top-style"), "3px solid") },
        { name: "Колір рамки #5e3a1c", check: (ctx) => eq(ctx, ctx.style(".crate", "border-left-color"), "rgb(94, 58, 28)") },
        { name: "Кути заокруглено на 8px", check: (ctx) => eq(ctx, ctx.style(".crate", "border-top-left-radius"), "8px") },
      ],
      solution: {
        html: `<div class="crate">Інструменти</div>
`,
        css: `.crate {
  padding: 16px;
  background: #c08a52;
  border: 3px solid #5e3a1c;
  border-radius: 8px;
}
`,
      },
      hint: "`border: 3px solid #5e3a1c;` — три значення через пробіл.",
      difficulty: 1,
    }),
    Object.assign({}, A5, {
      id: 35,
      title: "box-sizing",
      concept: "За замовчуванням (`content-box`) `width` — це ширина лише вмісту, а `padding` і `border` додаються зверху. З `box-sizing: border-box` ширина включає відступи й рамку — тому розмітку легше рахувати. Багато проєктів вмикають це для всіх елементів.",
      example: `.a { width: 100px; padding: 10px; }  /* займе 120px */
.b { box-sizing: border-box;
     width: 100px; padding: 10px; }  /* займе 100px */`,
      missionStory: "Дві скрині за однаковим кресленням вийшли різної ширини. Коваль б'ється над загадкою.",
      worldEvent: "Коваль розгадав загадку однакових креслень.",
      taskType: "predict-output",
      prompt: "Яку повну ширину на екрані займе кожен блок (вміст + padding + border)? Впиши число в пікселях.",
      answerHeading: "Повна ширина блоку (px)",
      answerPlaceholder: "наприклад 120",
      answerUnit: "px",
      lineLabels: [".a", ".b"],
      exampleLang: "css",
      starterCode: null,
      code: `.a {
  width: 200px;
  padding: 20px;
  border: 5px solid;
}
.b {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid;
}`,
      expectedAnswer: ["250", "200"],
      hint: "Для `.a`: 200 + 2×20 + 2×5. Для `.b` усе вже всередині 200.",
      difficulty: 2,
    }),
    Object.assign({}, A5, {
      id: 36,
      title: "width і max-width",
      concept: "`width: 100%` розтягує блок на всю ширину батька, а `max-width` ставить стелю: на широкому екрані блок не стане ширшим за задане значення, а на вузькому — стиснеться. Це основа гумових макетів.",
      example: `.content {
  width: 100%;
  max-width: 600px;
}`,
      missionStory: "Дошка оголошень кузні на великих стінах розтягується до смішних розмірів, а на вузьких — вилазить за край.",
      worldEvent: "Дошка оголошень пасує до будь-якої стіни.",
      taskType: "write-markup",
      prompt: "Зроби `.board` шириною `100%`, але не більше `400px`.",
      starterHtml: `<div class="board">Оголошення кузні</div>
`,
      starterCss: `.board {
  background: #f2c79a;
  padding: 8px;
  box-sizing: border-box;
}
`,
      testCases: [
        { name: "На широкому екрані — рівно 400px", check: (ctx) => eq(ctx, px(ctx.rect(".board").width), "400px") },
        {
          name: "На вузькому екрані (300px) стискається",
          width: 300,
          check: (ctx) => ({ pass: ctx.rect(".board").width <= 284 + 1 && ctx.rect(".board").width > 200, actual: px(ctx.rect(".board").width), expected: "ширина вікна мінус поля сторінки (284px)" }),
        },
      ],
      codeChecks: [{ re: /max-width\s*:\s*400px/, label: "Є max-width: 400px", in: "css" }],
      solution: {
        html: `<div class="board">Оголошення кузні</div>
`,
        css: `.board {
  background: #f2c79a;
  padding: 8px;
  box-sizing: border-box;
  width: 100%;
  max-width: 400px;
}
`,
      },
      hint: "Дві властивості в `.board`: `width` і `max-width`.",
      difficulty: 2,
    }),
    Object.assign({}, A5, {
      id: 37,
      title: "display: block, inline, inline-block",
      concept: "Блочні елементи (`block`) займають усю ширину й починаються з нового рядка. Рядкові (`inline`) живуть у тексті й ігнорують `width`/`height`. `inline-block` — компроміс: стоїть у рядку, але приймає розміри й вертикальні відступи.",
      example: `.tag { display: inline-block; padding: 4px 8px; }
.row { display: block; }`,
      missionStory: "Бирки на скринях злипаються в кашу, а вказівники розповзаються по одному рядку. Наведи лад.",
      worldEvent: "Бирки й вказівники кузні стоять як слід.",
      taskType: "write-markup",
      prompt: "Зроби `.tag` (це `span`) `inline-block` з відступами `padding: 4px 8px`, а посилання `.row` — блочними (`display: block`), щоб кожне йшло з нового рядка.",
      starterHtml: `<p><span class="tag">цвяхи</span> <span class="tag">болти</span></p>
<a class="row" href="#1">Склад</a>
<a class="row" href="#2">Майстерня</a>
`,
      starterCss: `.tag {
  background: #ffe061;
}
`,
      testCases: [
        { name: ".tag — inline-block з відступом 4px 8px", check: (ctx) => eq(ctx, ctx.style(".tag", "display") + " " + ctx.style(".tag", "padding-top") + " " + ctx.style(".tag", "padding-left"), "inline-block 4px 8px") },
        { name: "Посилання .row — блочні й одне під одним", check: (ctx) => { const [a, b] = ctx.$$(".row"); return { pass: ctx.style(a, "display") === "block" && ctx.rect(b).top > ctx.rect(a).top, actual: ctx.style(a, "display"), expected: "block" }; } },
      ],
      solution: {
        html: `<p><span class="tag">цвяхи</span> <span class="tag">болти</span></p>
<a class="row" href="#1">Склад</a>
<a class="row" href="#2">Майстерня</a>
`,
        css: `.tag {
  background: #ffe061;
  display: inline-block;
  padding: 4px 8px;
}

.row {
  display: block;
}
`,
      },
      hint: "Додай `display` у правило `.tag` і створи нове правило `.row`.",
      difficulty: 1,
    }),
    Object.assign({}, A5, {
      id: 38,
      title: "overflow",
      concept: "Коли вміст більший за блок фіксованої висоти, він «вилазить» назовні. `overflow` керує цим: `hidden` — обрізати, `auto` — показати прокрутку лише за потреби, `scroll` — прокрутка завжди.",
      example: `.chat {
  height: 120px;
  overflow: auto;
}`,
      missionStory: "Журнал замовлень кузні переповнився — записи налазять на сусідню вивіску.",
      worldEvent: "Журнал замовлень отримав акуратну прокрутку.",
      taskType: "fix-markup",
      prompt: "Текст у `.log` вилазить за межі блоку висотою 80px. Додай прокрутку, що з'являється лише за потреби.",
      starterHtml: `<div class="log">
  <p>Замовлення 1: сто цвяхів.</p>
  <p>Замовлення 2: дві підкови.</p>
  <p>Замовлення 3: ковадло.</p>
  <p>Замовлення 4: сокира.</p>
  <p>Замовлення 5: дзвін.</p>
</div>
<p class="sign">Вивіска кузні</p>
`,
      starterCss: `.log {
  height: 80px;
  border: 1px solid #333;
}
`,
      testCases: [
        { name: "overflow: auto у .log", check: (ctx) => eq(ctx, ctx.style(".log", "overflow-y"), "auto") },
        { name: "Вміст прокручується всередині", check: (ctx) => { const el = ctx.$(".log"); return { pass: el.scrollHeight > el.clientHeight && ctx.style(".log", "overflow-y") !== "visible", actual: "scrollHeight " + el.scrollHeight + ", clientHeight " + el.clientHeight, expected: "вміст більший за блок і прокручується" }; } },
      ],
      solution: {
        html: `<div class="log">
  <p>Замовлення 1: сто цвяхів.</p>
  <p>Замовлення 2: дві підкови.</p>
  <p>Замовлення 3: ковадло.</p>
  <p>Замовлення 4: сокира.</p>
  <p>Замовлення 5: дзвін.</p>
</div>
<p class="sign">Вивіска кузні</p>
`,
        css: `.log {
  height: 80px;
  border: 1px solid #333;
  overflow: auto;
}
`,
      },
      hint: "Одне слово в правилі `.log`: `overflow: auto;`.",
      difficulty: 1,
    }),
    Object.assign({}, A5, {
      id: 39,
      title: "Центрування margin: auto",
      concept: "Блочний елемент із заданою шириною можна відцентрувати горизонтально, якщо лівий і правий `margin` дорівнюють `auto`: браузер розділить вільне місце порівну. Скорочення: `margin: 0 auto`.",
      example: `.page {
  width: 600px;
  margin: 0 auto;
}`,
      missionStory: "Нова табличка кузні прибита з лівого краю стіни й виглядає криво. Майстер хоче рівно посередині.",
      worldEvent: "Кузня викувала міцні рамки для всіх будинків!",
      taskType: "fix-markup",
      prompt: "Відцентруй `.card` (ширина 300px) по горизонталі за допомогою `margin`.",
      starterHtml: `<div class="card">Кузня коробок</div>
`,
      starterCss: `.card {
  width: 300px;
  padding: 12px;
  box-sizing: border-box;
  background: #9aa1a9;
}
`,
      testCases: [
        {
          name: "Картка рівно посередині сторінки",
          check(ctx) {
            const r = ctx.rect(".card");
            const body = ctx.rect("body");
            const left = r.left - body.left, right = body.right - r.right;
            return { pass: near(left, right, 1), actual: "зліва " + px(left) + ", справа " + px(right), expected: "однаково зліва й справа" };
          },
        },
      ],
      codeChecks: [{ re: /margin(-left|-right)?\s*:[^;]*auto/, label: "Використано margin з auto", in: "css" }],
      solution: {
        html: `<div class="card">Кузня коробок</div>
`,
        css: `.card {
  width: 300px;
  padding: 12px;
  box-sizing: border-box;
  background: #9aa1a9;
  margin: 0 auto;
}
`,
      },
      hint: "`margin: 0 auto;` — нуль згори-знизу, авто зліва-справа.",
      difficulty: 1,
    }),
    /* ───────────── Флекс-доки — Flexbox ───────────── */
    Object.assign({}, A6, {
      id: 40,
      title: "display: flex",
      concept: "`display: flex` на контейнері вишиковує його прямих дітей в один ряд (головна вісь — горизонталь). Діти стають flex-елементами: їхні розміри й вирівнювання тепер керуються властивостями контейнера.",
      example: `.row {
  display: flex;
}`,
      missionStory: "У флекс-доках човни стоять один під одним, і причал займає пів острова. Вишикуй їх уздовж пірсу.",
      worldEvent: "Човни в доках стали в ряд.",
      taskType: "write-markup",
      prompt: "Зроби `.dock` flex-контейнером, щоб три човни `.boat` стали в один ряд.",
      starterHtml: `<div class="dock">
  <div class="boat">Іскра</div>
  <div class="boat">Хвиля</div>
  <div class="boat">Чайка</div>
</div>
`,
      starterCss: `.boat {
  width: 100px;
  padding: 10px;
  background: #3fb3d9;
}
`,
      testCases: [
        { name: "Усі човни на одній висоті (в ряд)", check: (ctx) => { const tops = ctx.$$(".boat").map((b) => Math.round(ctx.rect(b).top)); return { pass: tops.every((t) => t === tops[0]), actual: "top: " + tops.join(", "), expected: "однакові top" }; } },
        { name: ".dock — display: flex", check: (ctx) => eq(ctx, ctx.style(".dock", "display"), "flex") },
      ],
      solution: {
        html: `<div class="dock">
  <div class="boat">Іскра</div>
  <div class="boat">Хвиля</div>
  <div class="boat">Чайка</div>
</div>
`,
        css: `.dock {
  display: flex;
}

.boat {
  width: 100px;
  padding: 10px;
  background: #3fb3d9;
}
`,
      },
      hint: "Flex вмикається на батькові (`.dock`), а не на човнах.",
      difficulty: 1,
    }),
    Object.assign({}, A6, {
      id: 41,
      title: "justify-content",
      concept: "`justify-content` розподіляє вільне місце вздовж головної осі: `flex-start`, `center`, `flex-end`, `space-between` (крайні — до країв, між рештою рівно), `space-around`, `space-evenly`.",
      example: `.menu {
  display: flex;
  justify-content: space-between;
}`,
      missionStory: "Човни скупчились біля одного краю пірсу. Капітан порту хоче, щоб крайні стояли біля стовпів, а решта — рівномірно між ними.",
      worldEvent: "Човни рівномірно розподілено вздовж пірсу.",
      taskType: "write-markup",
      prompt: "Розстав човни так, щоб перший притискався до лівого краю `.dock`, останній — до правого, а між ними було порівну місця.",
      starterHtml: `<div class="dock">
  <div class="boat">1</div>
  <div class="boat">2</div>
  <div class="boat">3</div>
</div>
`,
      starterCss: `.dock {
  display: flex;
  background: #2a85c4;
}

.boat {
  width: 80px;
  height: 40px;
  background: #f2c79a;
}
`,
      testCases: [
        {
          name: "Крайні човни біля країв доку",
          check(ctx) {
            const dock = ctx.rect(".dock"), boats = ctx.$$(".boat").map((b) => ctx.rect(b));
            return { pass: near(boats[0].left, dock.left) && near(boats[2].right, dock.right), actual: "зліва " + px(boats[0].left - dock.left) + ", справа " + px(dock.right - boats[2].right), expected: "0px і 0px" };
          },
        },
        {
          name: "Проміжки між човнами однакові",
          check(ctx) {
            const b = ctx.$$(".boat").map((el) => ctx.rect(el));
            const g1 = b[1].left - b[0].right, g2 = b[2].left - b[1].right;
            return { pass: near(g1, g2) && g1 > 100, actual: px(g1) + " і " + px(g2), expected: "рівні великі проміжки" };
          },
        },
      ],
      solution: {
        html: `<div class="dock">
  <div class="boat">1</div>
  <div class="boat">2</div>
  <div class="boat">3</div>
</div>
`,
        css: `.dock {
  display: flex;
  justify-content: space-between;
  background: #2a85c4;
}

.boat {
  width: 80px;
  height: 40px;
  background: #f2c79a;
}
`,
      },
      hint: "Потрібне значення, яке ставить крайні до країв і ділить решту порівну: `space-between`.",
      difficulty: 1,
    }),
    Object.assign({}, A6, {
      id: 42,
      title: "align-items",
      concept: "`align-items` вирівнює flex-елементи по поперечній осі (вертикалі для рядка): `stretch` (за замовчуванням тягне на всю висоту), `flex-start`, `center`, `flex-end`, `baseline`.",
      example: `.toolbar {
  display: flex;
  align-items: center;
}`,
      missionStory: "Човни різної висоти гойдаються вздовж пірсу хто як. Швартувальник хоче, щоб їхні середини були на одній лінії.",
      worldEvent: "Човни гойдаються в такт на одній лінії.",
      taskType: "write-markup",
      prompt: "Вирівняй човни різної висоти по центру висоти доку (`.dock` має висоту 160px).",
      starterHtml: `<div class="dock">
  <div class="boat small">Шлюпка</div>
  <div class="boat big">Фрегат</div>
  <div class="boat">Бриг</div>
</div>
`,
      starterCss: `.dock {
  display: flex;
  height: 160px;
  background: #2a85c4;
}

.boat { width: 90px; background: #f2c79a; }
.small { height: 30px; }
.big { height: 100px; }
.boat:not(.small):not(.big) { height: 60px; }
`,
      testCases: [
        {
          name: "Центри всіх човнів на центрі доку",
          check(ctx) {
            const dock = ctx.rect(".dock");
            const mid = dock.top + dock.height / 2;
            const centers = ctx.$$(".boat").map((b) => { const r = ctx.rect(b); return r.top + r.height / 2; });
            return { pass: centers.every((c) => near(c, mid)), actual: centers.map((c) => px(c - dock.top)).join(", "), expected: "80px, 80px, 80px" };
          },
        },
      ],
      solution: {
        html: `<div class="dock">
  <div class="boat small">Шлюпка</div>
  <div class="boat big">Фрегат</div>
  <div class="boat">Бриг</div>
</div>
`,
        css: `.dock {
  display: flex;
  align-items: center;
  height: 160px;
  background: #2a85c4;
}

.boat { width: 90px; background: #f2c79a; }
.small { height: 30px; }
.big { height: 100px; }
.boat:not(.small):not(.big) { height: 60px; }
`,
      },
      hint: "Вертикальне вирівнювання в рядку — `align-items: center` на контейнері.",
      difficulty: 1,
    }),
    Object.assign({}, A6, {
      id: 43,
      title: "flex-direction",
      concept: "`flex-direction` змінює головну вісь: `row` (рядок, за замовчуванням), `column` (стовпчик), а також `row-reverse` і `column-reverse`. Після зміни осі `justify-content` і `align-items» міняються ролями.",
      example: `.sidebar {
  display: flex;
  flex-direction: column;
}`,
      missionStory: "На вузькому пірсі човни не поміщаються в ряд. Портовий наглядач велить ставити їх один за одним уздовж причалу.",
      worldEvent: "Човни вишикувались колоною на вузькому пірсі.",
      taskType: "write-markup",
      prompt: "Не прибираючи `display: flex`, зроби так, щоб човни в `.pier` стали стовпчиком (один під одним).",
      starterHtml: `<div class="pier">
  <div class="boat">Іскра</div>
  <div class="boat">Хвиля</div>
  <div class="boat">Чайка</div>
</div>
`,
      starterCss: `.pier {
  display: flex;
}

.boat {
  width: 120px;
  padding: 8px;
  background: #3fb3d9;
}
`,
      testCases: [
        {
          name: "Човни стоять стовпчиком",
          check(ctx) {
            const r = ctx.$$(".boat").map((b) => ctx.rect(b));
            return { pass: near(r[0].left, r[1].left) && near(r[1].left, r[2].left) && r[1].top > r[0].top && r[2].top > r[1].top, actual: r.map((x) => "(" + px(x.left) + ", " + px(x.top) + ")").join(" "), expected: "однаковий left, зростаючий top" };
          },
        },
        { name: ".pier лишився flex-контейнером", check: (ctx) => eq(ctx, ctx.style(".pier", "display") + " " + ctx.style(".pier", "flex-direction"), "flex column") },
      ],
      solution: {
        html: `<div class="pier">
  <div class="boat">Іскра</div>
  <div class="boat">Хвиля</div>
  <div class="boat">Чайка</div>
</div>
`,
        css: `.pier {
  display: flex;
  flex-direction: column;
}

.boat {
  width: 120px;
  padding: 8px;
  background: #3fb3d9;
}
`,
      },
      hint: "`flex-direction: column;` у правилі `.pier`.",
      difficulty: 1,
    }),
    Object.assign({}, A6, {
      id: 44,
      title: "gap",
      concept: "`gap` задає однаковий проміжок між flex- чи grid-елементами — без зайвих `margin` на крайніх. Одне значення — для обох осей, два — `gap: рядки колонки`.",
      example: `.cards {
  display: flex;
  gap: 16px;
}`,
      missionStory: "Човни стоять впритул і труться бортами. Боцман просить залишити між ними однакові проміжки.",
      worldEvent: "Між човнами з'явились безпечні проміжки.",
      taskType: "write-markup",
      prompt: "Додай у `.dock` проміжок `12px` між човнами (без margin на самих човнах).",
      starterHtml: `<div class="dock">
  <div class="boat">1</div>
  <div class="boat">2</div>
  <div class="boat">3</div>
</div>
`,
      starterCss: `.dock {
  display: flex;
}

.boat {
  width: 60px;
  height: 40px;
  background: #f2c79a;
}
`,
      testCases: [
        { name: "Проміжки рівно по 12px", check: (ctx) => { const b = ctx.$$(".boat").map((el) => ctx.rect(el)); return { pass: near(b[1].left - b[0].right, 12, 0.5) && near(b[2].left - b[1].right, 12, 0.5), actual: px(b[1].left - b[0].right) + ", " + px(b[2].left - b[1].right), expected: "12px, 12px" }; } },
      ],
      codeChecks: [
        { re: /\bgap\s*:\s*12px/, label: "Використано gap: 12px", in: "css" },
        { re: /\.boat[^{]*\{[^}]*margin/, not: true, label: "Без margin на човнах", in: "css" },
      ],
      solution: {
        html: `<div class="dock">
  <div class="boat">1</div>
  <div class="boat">2</div>
  <div class="boat">3</div>
</div>
`,
        css: `.dock {
  display: flex;
  gap: 12px;
}

.boat {
  width: 60px;
  height: 40px;
  background: #f2c79a;
}
`,
      },
      hint: "`gap` пишеться на контейнері `.dock`.",
      difficulty: 1,
    }),
    Object.assign({}, A6, {
      id: 45,
      title: "flex-wrap",
      concept: "За замовчуванням flex-елементи тиснуться в один рядок, навіть якщо не поміщаються (`flex-wrap: nowrap`). `flex-wrap: wrap` дозволяє переносити зайві елементи на новий рядок — як слова в тексті.",
      example: `.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}`,
      missionStory: "У вузькій гавані шість човнів утиснулися в один ряд і зім'яли борти. Нехай зайві стануть у другий ряд.",
      worldEvent: "У гавані з'явився другий ряд причалів.",
      taskType: "fix-markup",
      prompt: "Шість човнів по 100px не поміщаються в док шириною 300px і стискаються. Дозволь їм переноситись на новий рядок.",
      starterHtml: `<div class="dock">
  <div class="boat">1</div>
  <div class="boat">2</div>
  <div class="boat">3</div>
  <div class="boat">4</div>
  <div class="boat">5</div>
  <div class="boat">6</div>
</div>
`,
      starterCss: `.dock {
  display: flex;
  width: 300px;
  background: #2a85c4;
}

.boat {
  width: 100px;
  height: 40px;
  box-sizing: border-box;
  border: 1px solid #5e3a1c;
  background: #f2c79a;
}
`,
      testCases: [
        { name: "Човни зберегли ширину 100px", check: (ctx) => eq(ctx, px(ctx.rect(".boat").width), "100px") },
        { name: "Четвертий човен перенісся на другий рядок", check: (ctx) => { const b = ctx.$$(".boat").map((el) => ctx.rect(el)); return { pass: b[3].top > b[0].top + 30 && near(b[3].left, b[0].left), actual: "4-й човен: top +" + px(b[3].top - b[0].top), expected: "на новому рядку під першим" }; } },
      ],
      solution: {
        html: `<div class="dock">
  <div class="boat">1</div>
  <div class="boat">2</div>
  <div class="boat">3</div>
  <div class="boat">4</div>
  <div class="boat">5</div>
  <div class="boat">6</div>
</div>
`,
        css: `.dock {
  display: flex;
  flex-wrap: wrap;
  width: 300px;
  background: #2a85c4;
}

.boat {
  width: 100px;
  height: 40px;
  box-sizing: border-box;
  border: 1px solid #5e3a1c;
  background: #f2c79a;
}
`,
      },
      hint: "Додай у `.dock` одну властивість: `flex-wrap: wrap;`.",
      difficulty: 1,
    }),
    Object.assign({}, A6, {
      id: 46,
      title: "flex-grow",
      concept: "`flex-grow` каже, яку частку вільного місця забирає елемент. `flex: 1` — розтягнутись і зайняти все, що лишилось. Класичний макет: бокова панель фіксованої ширини + основна частина з `flex: 1`.",
      example: `.layout { display: flex; }
.sidebar { width: 200px; }
.content { flex: 1; }`,
      missionStory: "Будка доглядача стоїть збоку, а пірс поруч має зайняти весь берег, що лишився.",
      worldEvent: "Пірс розтягнувся вздовж усього берега.",
      taskType: "write-markup",
      prompt: "`.booth` має ширину 120px. Зроби так, щоб `.pier` зайняв усю решту ширини `.harbor`.",
      starterHtml: `<div class="harbor">
  <div class="booth">Будка</div>
  <div class="pier">Пірс</div>
</div>
`,
      starterCss: `.harbor {
  display: flex;
  width: 600px;
}

.booth { width: 120px; background: #c08a52; }
.pier { background: #9aa1a9; }
`,
      testCases: [
        { name: "Пірс займає решту: 480px", check: (ctx) => eq(ctx, px(ctx.rect(".pier").width), "480px") },
        { name: "Будка лишилась 120px", check: (ctx) => eq(ctx, px(ctx.rect(".booth").width), "120px") },
      ],
      solution: {
        html: `<div class="harbor">
  <div class="booth">Будка</div>
  <div class="pier">Пірс</div>
</div>
`,
        css: `.harbor {
  display: flex;
  width: 600px;
}

.booth { width: 120px; background: #c08a52; }
.pier { flex: 1; background: #9aa1a9; }
`,
      },
      hint: "Додай `.pier` властивість `flex: 1` (або `flex-grow: 1`).",
      difficulty: 2,
    }),
    Object.assign({}, A6, {
      id: 47,
      title: "Центрування флексом",
      concept: "Найпростіший спосіб відцентрувати будь-що по обох осях: на батькові `display: flex; justify-content: center; align-items: center;`. Батько має мати висоту, інакше вертикально центрувати нема де.",
      example: `.screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}`,
      missionStory: "Прапор доків завжди має майоріти рівно посередині гавані — але хтось прибив його в кутку.",
      worldEvent: "Доки вишикувано в ідеальну лінію!",
      taskType: "fix-markup",
      prompt: "Відцентруй `.flag` (40×40) у `.harbor` (300×200) і по горизонталі, і по вертикалі за допомогою flexbox.",
      starterHtml: `<div class="harbor">
  <div class="flag"></div>
</div>
`,
      starterCss: `.harbor {
  width: 300px;
  height: 200px;
  background: #2a85c4;
}

.flag {
  width: 40px;
  height: 40px;
  background: #f7d23a;
}
`,
      testCases: [
        {
          name: "Прапор рівно в центрі гавані",
          check(ctx) {
            const h = ctx.rect(".harbor"), f = ctx.rect(".flag");
            const dx = f.left + f.width / 2 - (h.left + h.width / 2), dy = f.top + f.height / 2 - (h.top + h.height / 2);
            return { pass: near(dx, 0) && near(dy, 0), actual: "зсув від центру: " + px(dx) + ", " + px(dy), expected: "0px, 0px" };
          },
        },
      ],
      codeChecks: [{ re: /display\s*:\s*flex/, label: "Використано flexbox", in: "css" }],
      solution: {
        html: `<div class="harbor">
  <div class="flag"></div>
</div>
`,
        css: `.harbor {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 300px;
  height: 200px;
  background: #2a85c4;
}

.flag {
  width: 40px;
  height: 40px;
  background: #f7d23a;
}
`,
      },
      hint: "Три рядки на `.harbor`: `display: flex`, `justify-content: center`, `align-items: center`.",
      difficulty: 1,
    }),

    /* ───────────── Гридбург — CSS Grid ───────────── */
    Object.assign({}, A7, {
      id: 48,
      title: "display: grid і колонки",
      concept: "`display: grid` перетворює контейнер на сітку, а `grid-template-columns` задає колонки: `100px 100px 100px` — три колонки по 100px. Елементи заповнюють клітинки по рядках, автоматично переходячи на наступний рядок.",
      example: `.gallery {
  display: grid;
  grid-template-columns: 200px 200px;
}`,
      missionStory: "Гридбург — місто, де кожен будинок стоїть у своїй клітинці. Перший квартал треба розпланувати на три колонки.",
      worldEvent: "Перший квартал Гридбурга розплановано.",
      taskType: "write-markup",
      prompt: "Зроби `.town` сіткою з трьох колонок по `100px`. Шість будинків мають стати двома рядками по три.",
      starterHtml: `<div class="town">
  <div class="house">1</div><div class="house">2</div><div class="house">3</div>
  <div class="house">4</div><div class="house">5</div><div class="house">6</div>
</div>
`,
      starterCss: `.house {
  height: 50px;
  background: #e8663d;
  border: 1px solid #1b1612;
}
`,
      testCases: [
        { name: "Перший ряд — будинки 1–3 поруч по 100px", check: (ctx) => { const h = ctx.$$(".house").map((e) => ctx.rect(e)); return { pass: near(h[1].left - h[0].left, 100) && near(h[2].left - h[1].left, 100) && near(h[0].top, h[2].top), actual: px(h[1].left - h[0].left) + ", " + px(h[2].left - h[1].left), expected: "100px, 100px" }; } },
        { name: "Будинок 4 починає другий ряд", check: (ctx) => { const h = ctx.$$(".house").map((e) => ctx.rect(e)); return { pass: near(h[3].left, h[0].left) && h[3].top > h[0].top + 40, actual: "4-й: left +" + px(h[3].left - h[0].left) + ", top +" + px(h[3].top - h[0].top), expected: "під першим" }; } },
      ],
      solution: {
        html: `<div class="town">
  <div class="house">1</div><div class="house">2</div><div class="house">3</div>
  <div class="house">4</div><div class="house">5</div><div class="house">6</div>
</div>
`,
        css: `.town {
  display: grid;
  grid-template-columns: 100px 100px 100px;
}

.house {
  height: 50px;
  background: #e8663d;
  border: 1px solid #1b1612;
}
`,
      },
      hint: "Правило для `.town`: `display: grid` і `grid-template-columns` з трьома значеннями.",
      difficulty: 1,
    }),
    Object.assign({}, A7, {
      id: 49,
      title: "Одиниця fr",
      concept: "`fr` (fraction) — частка вільного місця сітки. `1fr 2fr` ділить ширину на три частини: перша колонка отримує одну, друга — дві. Гнучко, без підрахунку відсотків.",
      example: `.layout {
  display: grid;
  grid-template-columns: 1fr 3fr;
}`,
      missionStory: "Ринкова площа Гридбурга ділиться між двома гільдіями: друга вдвічі більша й хоче вдвічі більше місця.",
      worldEvent: "Площу поділено чесно — за розміром гільдій.",
      taskType: "write-markup",
      prompt: "Розділи `.square` (300px) на дві колонки у пропорції 1 : 2 за допомогою `fr`.",
      starterHtml: `<div class="square">
  <div class="guild">Ковалі</div>
  <div class="guild">Мулярі</div>
</div>
`,
      starterCss: `.square {
  display: grid;
  width: 300px;
}

.guild { background: #f2c79a; border-right: 1px solid #5e3a1c; }
`,
      testCases: [
        { name: "Ширини колонок 100px і 200px", check: (ctx) => eq(ctx, ctx.$$(".guild").map((g) => px(ctx.rect(g).width)).join(" "), "100px 200px") },
      ],
      codeChecks: [{ re: /grid-template-columns\s*:\s*1fr\s+2fr/, label: "Використано 1fr 2fr", in: "css" }],
      solution: {
        html: `<div class="square">
  <div class="guild">Ковалі</div>
  <div class="guild">Мулярі</div>
</div>
`,
        css: `.square {
  display: grid;
  grid-template-columns: 1fr 2fr;
  width: 300px;
}

.guild { background: #f2c79a; border-right: 1px solid #5e3a1c; }
`,
      },
      hint: "`grid-template-columns: 1fr 2fr;`",
      difficulty: 1,
    }),
    Object.assign({}, A7, {
      id: 50,
      title: "gap у сітці",
      concept: "У сітці `gap` задає «вулиці» між клітинками: `gap: 10px` — однакові проміжки між рядками й колонками; `gap: 20px 10px` — окремо для рядків і колонок (`row-gap`, `column-gap`).",
      example: `.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 10px;
}`,
      missionStory: "Будинки Гридбурга стоять стіна до стіни — між ними не пройти. Проклади вулиці.",
      worldEvent: "Між кварталами Гридбурга пролягли вулиці.",
      taskType: "write-markup",
      prompt: "Додай у сітку `.town` проміжки: `20px` між рядками і `10px` між колонками.",
      starterHtml: `<div class="town">
  <div class="house">1</div><div class="house">2</div>
  <div class="house">3</div><div class="house">4</div>
</div>
`,
      starterCss: `.town {
  display: grid;
  grid-template-columns: 100px 100px;
}

.house { height: 40px; background: #e8663d; }
`,
      testCases: [
        { name: "Між колонками 10px", check: (ctx) => { const h = ctx.$$(".house").map((e) => ctx.rect(e)); return eq(ctx, px(h[1].left - h[0].right), "10px"); } },
        { name: "Між рядками 20px", check: (ctx) => { const h = ctx.$$(".house").map((e) => ctx.rect(e)); return eq(ctx, px(h[2].top - h[0].bottom), "20px"); } },
      ],
      solution: {
        html: `<div class="town">
  <div class="house">1</div><div class="house">2</div>
  <div class="house">3</div><div class="house">4</div>
</div>
`,
        css: `.town {
  display: grid;
  grid-template-columns: 100px 100px;
  gap: 20px 10px;
}

.house { height: 40px; background: #e8663d; }
`,
      },
      hint: "Перше значення `gap` — для рядків, друге — для колонок.",
      difficulty: 1,
    }),
    Object.assign({}, A7, {
      id: 51,
      title: "repeat і minmax",
      concept: "`repeat(auto-fill, minmax(100px, 1fr))` — магічна формула адаптивної сітки: «стільки колонок, скільки поміститься, кожна не вужча за 100px, а залишок поділити порівну». Колонки самі перебудовуються під ширину екрана, без медіазапитів.",
      example: `.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}`,
      missionStory: "Гридбург будує нові квартали на берегах різної ширини. Архітектор хоче одне креслення на всі береги.",
      worldEvent: "Креслення Гридбурга підходить до будь-якого берега.",
      taskType: "write-markup",
      prompt: "Задай `.town` колонки через `repeat(auto-fill, minmax(100px, 1fr))`, щоб у широкому місті вміщалось більше будинків у ряд, а у вузькому — менше.",
      starterHtml: `<div class="town">
  <div class="house">1</div><div class="house">2</div><div class="house">3</div>
  <div class="house">4</div><div class="house">5</div><div class="house">6</div>
</div>
`,
      starterCss: `.town {
  display: grid;
}

.house { height: 40px; background: #e8663d; border: 1px solid #1b1612; }
`,
      testCases: [
        { name: "На ширині 800px — багато колонок (6 в ряд)", check: (ctx) => { const h = ctx.$$(".house").map((e) => ctx.rect(e)); return { pass: near(h[5].top, h[0].top), actual: near(h[5].top, h[0].top) ? "в один ряд" : "у кілька рядів", expected: "6 будинків в один ряд" }; } },
        {
          name: "На ширині 250px — по 2 в ряд",
          width: 250,
          check(ctx) {
            const h = ctx.$$(".house").map((e) => ctx.rect(e));
            const perRow = h.filter((r) => near(r.top, h[0].top)).length;
            return eq(ctx, perRow, 2);
          },
        },
      ],
      codeChecks: [{ re: /repeat\(\s*auto-fill\s*,\s*minmax\(\s*100px\s*,\s*1fr\s*\)\s*\)/, label: "Використано repeat(auto-fill, minmax(100px, 1fr))", in: "css" }],
      solution: {
        html: `<div class="town">
  <div class="house">1</div><div class="house">2</div><div class="house">3</div>
  <div class="house">4</div><div class="house">5</div><div class="house">6</div>
</div>
`,
        css: `.town {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}

.house { height: 40px; background: #e8663d; border: 1px solid #1b1612; }
`,
      },
      hint: "Скопіюй формулу з теорії й заміни 200px на 100px.",
      difficulty: 2,
    }),
    Object.assign({}, A7, {
      id: 52,
      title: "grid-column і span",
      concept: "Елемент сітки може займати кілька клітинок: `grid-column: span 2` — розтягнутись на дві колонки, `grid-column: 1 / -1` — від першої лінії до останньої (на всю ширину).",
      example: `.banner {
  grid-column: 1 / -1;
}
.wide {
  grid-column: span 2;
}`,
      missionStory: "У Гридбурзі будують ратушу — вона вдвічі ширша за звичайний будинок і не влазить в одну клітинку.",
      worldEvent: "Ратуша Гридбурга стоїть на двох ділянках.",
      taskType: "write-markup",
      prompt: "Зроби `.hall` шириною у дві колонки сітки `.town` (колонки по 100px, проміжок 10px).",
      starterHtml: `<div class="town">
  <div class="house hall">Ратуша</div>
  <div class="house">Дім</div>
  <div class="house">Дім</div>
  <div class="house">Дім</div>
</div>
`,
      starterCss: `.town {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  gap: 10px;
}

.house { height: 40px; background: #e8663d; }
.hall { background: #f7d23a; }
`,
      testCases: [
        { name: "Ратуша завширшки 210px (дві колонки + проміжок)", check: (ctx) => eq(ctx, px(ctx.rect(".hall").width), "210px") },
      ],
      codeChecks: [{ re: /grid-column\s*:/, label: "Використано grid-column", in: "css" }],
      solution: {
        html: `<div class="town">
  <div class="house hall">Ратуша</div>
  <div class="house">Дім</div>
  <div class="house">Дім</div>
  <div class="house">Дім</div>
</div>
`,
        css: `.town {
  display: grid;
  grid-template-columns: repeat(3, 100px);
  gap: 10px;
}

.house { height: 40px; background: #e8663d; }
.hall { background: #f7d23a; grid-column: span 2; }
`,
      },
      hint: "`grid-column: span 2;` у правилі `.hall`.",
      difficulty: 2,
    }),
    Object.assign({}, A7, {
      id: 53,
      title: "grid-template-areas",
      concept: "`grid-template-areas` малює макет «картинкою» з назв: кожен рядок у лапках — рядок сітки. Елементам дають ті самі назви через `grid-area`. Повторена назва розтягує область на кілька клітинок.",
      example: `.page {
  display: grid;
  grid-template-columns: 150px 1fr;
  grid-template-areas:
    "head head"
    "side main";
}
header { grid-area: head; }
aside  { grid-area: side; }
main   { grid-area: main; }`,
      missionStory: "Ратуша Гридбурга замовила план головної площі: шапка зверху на всю ширину, бічна алея ліворуч, площа праворуч, а внизу — набережна.",
      worldEvent: "План головної площі Гридбурга затверджено.",
      taskType: "write-markup",
      prompt: "Розклади `.page` областями: перший рядок — `header` на обидві колонки, другий — `aside` (ліва колонка 150px) і `main`, третій — `footer` на обидві колонки. Використай `grid-template-areas` і `grid-area`.",
      starterHtml: `<div class="page">
  <header>Шапка</header>
  <aside>Алея</aside>
  <main>Площа</main>
  <footer>Набережна</footer>
</div>
`,
      starterCss: `.page {
  display: grid;
  grid-template-columns: 150px 1fr;
}

header, aside, main, footer { padding: 8px; border: 1px solid #1b1612; }
`,
      testCases: [
        { name: "Шапка й підвал на всю ширину", check: (ctx) => { const page = ctx.rect(".page"); return { pass: near(ctx.rect("header").width, page.width) && near(ctx.rect("footer").width, page.width), actual: px(ctx.rect("header").width) + " / " + px(ctx.rect("footer").width), expected: px(page.width) + " обидва" }; } },
        { name: "aside ліворуч від main в одному рядку", check: (ctx) => { const a = ctx.rect("aside"), m = ctx.rect("main"); return { pass: near(a.top, m.top) && a.right <= m.left + 1 && near(a.width, 150), actual: "aside " + px(a.width) + ", top " + px(a.top) + " / main top " + px(m.top), expected: "aside 150px поруч із main" }; } },
        { name: "Підвал нижче за main", check: (ctx) => ({ pass: ctx.rect("footer").top >= ctx.rect("main").bottom - 1, actual: px(ctx.rect("footer").top - ctx.rect("main").bottom), expected: "під main" }) },
      ],
      codeChecks: [
        { re: /grid-template-areas\s*:/, label: "Використано grid-template-areas", in: "css" },
        { re: /grid-area\s*:/, label: "Елементам задано grid-area", in: "css" },
      ],
      solution: {
        html: `<div class="page">
  <header>Шапка</header>
  <aside>Алея</aside>
  <main>Площа</main>
  <footer>Набережна</footer>
</div>
`,
        css: `.page {
  display: grid;
  grid-template-columns: 150px 1fr;
  grid-template-areas:
    "head head"
    "side main"
    "foot foot";
}

header { grid-area: head; }
aside { grid-area: side; }
main { grid-area: main; }
footer { grid-area: foot; }

header, aside, main, footer { padding: 8px; border: 1px solid #1b1612; }
`,
      },
      hint: "Три рядки в лапках: `\"head head\"`, `\"side main\"`, `\"foot foot\"`; потім `grid-area` для кожного блоку.",
      difficulty: 3,
    }),
    Object.assign({}, A7, {
      id: 54,
      title: "Макет сторінки",
      concept: "Назви в `grid-template-areas` мають точно збігатися з `grid-area` елементів, а кожен рядок — мати однакову кількість клітинок. Одна одруківка — і браузер ігнорує весь шаблон або кидає елемент у неявну клітинку.",
      example: `/* кожен рядок — по 2 назви */
grid-template-areas:
  "head head"
  "nav  main";`,
      missionStory: "Хтось підправив план Гридбурга нашвидку — і вся площа з'їхала. Знайди помилки в кресленні.",
      worldEvent: "Гридбург розплановано — місто стоїть рівними кварталами!",
      taskType: "fix-markup",
      prompt: "Макет зламано: в одному рядку шаблону бракує клітинки, а назва області в `nav` написана з помилкою. Виправ CSS, щоб `header` був зверху на всю ширину, а `nav` ліворуч від `main`.",
      starterHtml: `<div class="layout">
  <header>Гридбург</header>
  <nav>Вулиці</nav>
  <main>Квартали</main>
</div>
`,
      starterCss: `.layout {
  display: grid;
  grid-template-columns: 120px 1fr;
  grid-template-areas:
    "top"
    "menu content";
}

header { grid-area: top; }
nav { grid-area: manu; }
main { grid-area: content; }

header, nav, main { padding: 8px; border: 1px solid #1b1612; }
`,
      testCases: [
        { name: "header на всю ширину", check: (ctx) => ({ pass: near(ctx.rect("header").width, ctx.rect(".layout").width), actual: px(ctx.rect("header").width), expected: px(ctx.rect(".layout").width) }) },
        { name: "nav ліворуч від main, 120px", check: (ctx) => { const n = ctx.rect("nav"), m = ctx.rect("main"); return { pass: near(n.top, m.top) && near(n.width, 120) && n.right <= m.left + 1, actual: "nav " + px(n.width) + ", top " + px(n.top - m.top) + " від main", expected: "nav 120px у рядку з main" }; } },
      ],
      solution: {
        html: `<div class="layout">
  <header>Гридбург</header>
  <nav>Вулиці</nav>
  <main>Квартали</main>
</div>
`,
        css: `.layout {
  display: grid;
  grid-template-columns: 120px 1fr;
  grid-template-areas:
    "top top"
    "menu content";
}

header { grid-area: top; }
nav { grid-area: menu; }
main { grid-area: content; }

header, nav, main { padding: 8px; border: 1px solid #1b1612; }
`,
      },
      hint: "Рядок `\"top\"` має мати дві назви, як і колонок дві: `\"top top\"`. А `manu` ≠ `menu`.",
      difficulty: 2,
    }),

    /* ───────────── Маяк адаптивності ───────────── */
    Object.assign({}, A8, {
      id: 55,
      title: "meta viewport",
      concept: "Без тегу `<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">` мобільний браузер малює сторінку ніби на широкому екрані (~980px) і зменшує її — текст стає дрібним, а медіазапити не спрацьовують як треба.",
      example: `<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>`,
      missionStory: "Маяк острова видно з кораблів, але на маленьких підзорних трубах світло розсіюється. Налаштуй лінзу для малих екранів.",
      worldEvent: "Лінза маяка налаштована на малі підзорні труби.",
      taskType: "multiple-choice",
      prompt: "Який тег правильно налаштовує сторінку для мобільних екранів?",
      optionsLang: "html",
      options: [
        `<meta name="viewport" content="width=device-width, initial-scale=1">`,
        `<meta name="mobile" content="true">`,
        `<meta viewport="device-width">`,
        `<meta name="viewport" content="width=980">`,
      ],
      expectedAnswer: `<meta name="viewport" content="width=device-width, initial-scale=1">`,
      hint: "Ширина вікна має дорівнювати ширині пристрою, а масштаб — одиниці.",
      difficulty: 1,
    }),
    Object.assign({}, A8, {
      id: 56,
      title: "Медіазапити",
      concept: "Медіазапит `@media (max-width: 600px) { … }` застосовує стилі лише тоді, коли вікно не ширше за 600px. Так одна сторінка має різний макет на телефоні й комп'ютері. Підхід «mobile first» починає з мобільних стилів і додає `min-width` для ширших екранів.",
      example: `.menu { display: flex; }

@media (max-width: 600px) {
  .menu { flex-direction: column; }
}`,
      missionStory: "Меню маяка на великих екранах стоїть рядком, а на телефонах вилазить за край. Нехай на вузьких екранах воно стає стовпчиком.",
      worldEvent: "Меню маяка зручне і на телефоні, і на великому екрані.",
      taskType: "write-markup",
      prompt: "Додай медіазапит: коли вікно не ширше за `600px`, `.menu` має ставати стовпчиком (`flex-direction: column`). На широкому екрані меню лишається рядком.",
      starterHtml: `<nav class="menu">
  <a href="#1">Маяк</a>
  <a href="#2">Розклад</a>
  <a href="#3">Контакти</a>
</nav>
`,
      starterCss: `.menu {
  display: flex;
  gap: 16px;
}
`,
      testCases: [
        { name: "На 800px меню рядком", check: (ctx) => eq(ctx, ctx.style(".menu", "flex-direction"), "row") },
        { name: "На 500px меню стовпчиком", width: 500, check: (ctx) => { const a = ctx.$$(".menu a").map((e) => ctx.rect(e)); return { pass: ctx.style(".menu", "flex-direction") === "column" && a[1].top > a[0].top, actual: ctx.style(".menu", "flex-direction"), expected: "column" }; } },
      ],
      codeChecks: [{ re: /@media\s*\(\s*max-width\s*:\s*600px\s*\)/, label: "Є @media (max-width: 600px)", in: "css" }],
      solution: {
        html: `<nav class="menu">
  <a href="#1">Маяк</a>
  <a href="#2">Розклад</a>
  <a href="#3">Контакти</a>
</nav>
`,
        css: `.menu {
  display: flex;
  gap: 16px;
}

@media (max-width: 600px) {
  .menu {
    flex-direction: column;
  }
}
`,
      },
      hint: "Усередині `@media (max-width: 600px) { … }` пишеш звичайне правило `.menu { flex-direction: column; }`.",
      difficulty: 2,
    }),
    Object.assign({}, A8, {
      id: 57,
      title: "Адаптивні зображення",
      concept: "Велика картинка на вузькому екрані вилазить за межі. Правило `img { max-width: 100%; height: auto; }` дозволяє їй стискатися до ширини батька, зберігаючи пропорції, але не розтягує маленькі картинки.",
      example: `img {
  max-width: 100%;
  height: auto;
}`,
      missionStory: "Панорама маяка шириною 800 пікселів не влазить у вузькі вікна й ламає всю сторінку.",
      worldEvent: "Панорама маяка вміщається в будь-яке вікно.",
      taskType: "write-markup",
      prompt: "Зроби так, щоб зображення ніколи не було ширшим за свого батька `.frame` і зберігало пропорції.",
      starterHtml: `<div class="frame">
  <img src="panorama.svg" width="800" height="400" alt="Панорама маяка на світанку">
</div>
`,
      starterCss: `.frame {
  width: 300px;
  border: 2px solid #1b1612;
}
`,
      testCases: [
        { name: "Зображення не ширше за рамку (300px)", check: (ctx) => ({ pass: ctx.rect("img").width <= 300.5, actual: px(ctx.rect("img").width), expected: "≤ 300px" }) },
        { name: "Пропорції 2:1 збережено", check: (ctx) => { const r = ctx.rect("img"); return { pass: near(r.width / r.height, 2, 0.05), actual: px(r.width) + " × " + px(r.height), expected: "300px × 150px" }; } },
      ],
      solution: {
        html: `<div class="frame">
  <img src="panorama.svg" width="800" height="400" alt="Панорама маяка на світанку">
</div>
`,
        css: `.frame {
  width: 300px;
  border: 2px solid #1b1612;
}

img {
  max-width: 100%;
  height: auto;
}
`,
      },
      hint: "Нове правило `img` з двома властивостями: `max-width` і `height`.",
      difficulty: 1,
    }),
    Object.assign({}, A8, {
      id: 58,
      title: "position: relative і absolute",
      concept: "`position: absolute` виймає елемент із потоку й ставить його за `top`/`right`/`bottom`/`left` відносно найближчого предка з `position: relative` (або іншим, крім `static`). Так роблять бейджі, кнопки закриття, підписи поверх картинок.",
      example: `.card { position: relative; }
.badge {
  position: absolute;
  top: 0;
  right: 0;
}`,
      missionStory: "Вогонь маяка має горіти у верхньому правому куті вежі, а не де завгодно на березі.",
      worldEvent: "Вогонь маяка займає своє місце на вершині.",
      taskType: "write-markup",
      prompt: "Розмісти `.light` у верхньому правому куті `.tower`: зроби вежу точкою відліку (`position: relative`), а вогонь — абсолютно позиціонованим з `top: 0` і `right: 0`.",
      starterHtml: `<div class="tower">
  Вежа маяка
  <span class="light">✦</span>
</div>
`,
      starterCss: `.tower {
  width: 160px;
  height: 200px;
  margin: 20px;
  background: #9aa1a9;
}

.light {
  width: 24px;
  height: 24px;
  background: #f7d23a;
}
`,
      testCases: [
        { name: "Вогонь у верхньому правому куті вежі", check: (ctx) => { const t = ctx.rect(".tower"), l = ctx.rect(".light"); return { pass: near(l.top, t.top) && near(l.right, t.right), actual: "зсув: top " + px(l.top - t.top) + ", right " + px(t.right - l.right), expected: "0px, 0px" }; } },
        { name: "Вежа — position: relative, вогонь — absolute", check: (ctx) => eq(ctx, ctx.style(".tower", "position") + " " + ctx.style(".light", "position"), "relative absolute") },
      ],
      solution: {
        html: `<div class="tower">
  Вежа маяка
  <span class="light">✦</span>
</div>
`,
        css: `.tower {
  position: relative;
  width: 160px;
  height: 200px;
  margin: 20px;
  background: #9aa1a9;
}

.light {
  position: absolute;
  top: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: #f7d23a;
}
`,
      },
      hint: "Без `position: relative` на вежі вогонь рахуватиме координати від усієї сторінки.",
      difficulty: 2,
    }),
    Object.assign({}, A8, {
      id: 59,
      title: "transition і :hover",
      concept: "`transition` плавно анімує зміну властивостей: `transition: background-color 0.3s` — колір фону змінюватиметься за 0,3 секунди. Разом із `:hover` це дає приємні живі кнопки без жодного JavaScript.",
      example: `.btn {
  background: navy;
  transition: background-color 0.3s;
}
.btn:hover {
  background: royalblue;
}`,
      missionStory: "Кнопка «Запалити маяк» мертва — не реагує на наближення руки. Оживи її.",
      worldEvent: "Кнопка маяка м'яко світиться під рукою.",
      taskType: "write-markup",
      prompt: "Додай `.btn` плавний перехід `transition: background-color 0.3s`, а при наведенні (`.btn:hover`) — фон `orange`.",
      starterHtml: `<button class="btn" type="button">Запалити маяк</button>
`,
      starterCss: `.btn {
  padding: 12px 20px;
  border: 0;
  background-color: #2a85c4;
  color: white;
}
`,
      testCases: [
        { name: "Перехід background-color за 0.3s", check: (ctx) => eq(ctx, ctx.style(".btn", "transition-property") + " " + ctx.style(".btn", "transition-duration"), "background-color 0.3s") },
        {
          name: "При наведенні фон orange",
          check(ctx) {
            const rule = ctx.rules(/\.btn:hover/)[0];
            const value = rule ? rule.rule.style.getPropertyValue("background-color") || rule.rule.style.getPropertyValue("background") : "";
            return { pass: !!rule && ctx.color(value) === ctx.color("orange"), actual: rule ? ".btn:hover { " + (value || "без фону") + " }" : "правила .btn:hover немає", expected: ".btn:hover { background-color: orange }" };
          },
        },
      ],
      solution: {
        html: `<button class="btn" type="button">Запалити маяк</button>
`,
        css: `.btn {
  padding: 12px 20px;
  border: 0;
  background-color: #2a85c4;
  color: white;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: orange;
}
`,
      },
      hint: "`transition` — у звичайному правилі `.btn`, а новий колір — в окремому правилі `.btn:hover`.",
      difficulty: 2,
    }),
    Object.assign({}, A8, {
      id: 60,
      title: "Фінальний проєкт: вітрина острова",
      concept: "Фінальна сторінка об'єднує все: семантичний каркас (`header`, `nav`, `main`, `footer`), флекс-меню, адаптивну сітку карток на Grid, медіазапит для телефонів і доступні зображення з `alt`.",
      example: `.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 600px) {
  .cards { grid-template-columns: 1fr; }
}`,
      missionStory: "Острів відбудовано! Лишилась вітрина, яка покаже всім мореплавцям, що тут на них чекає, — на будь-якому екрані.",
      worldEvent: "Маяк засяяв — острів видно з будь-якого екрана!",
      taskType: "write-markup",
      prompt: "Збудуй вітрину: `header` з `h1` і `nav`, у якому посилання стоять рядком (`display: flex`); `main` з `.cards` — сіткою з трьох однакових колонок, у якій три `article.card` з `img` (з `alt`) і `h2`; `footer`. На екранах до `600px` картки мають ставати в одну колонку.",
      starterHtml: `<!-- вітрина острова будівельників -->
`,
      starterCss: `/* стилі вітрини */
`,
      testCases: [
        { name: "Семантичний каркас: header, nav, main, footer", check: (ctx) => ({ pass: ["header", "nav", "main", "footer", "header h1"].every((s) => ctx.$(s)), actual: ["header", "nav", "main", "footer", "header h1"].filter((s) => !ctx.$(s)).join(", ") || "усе на місці", expected: "усе на місці" }) },
        { name: "Меню рядком (flex)", check: (ctx) => { const a = ctx.$$("nav a"); return { pass: a.length >= 2 && ctx.style(ctx.$("nav ul") || ctx.$("nav"), "display") === "flex" && near(ctx.rect(a[0]).top, ctx.rect(a[1]).top), actual: a.length + " посилань, display " + ctx.style(ctx.$("nav ul") || ctx.$("nav"), "display"), expected: "щонайменше 2 посилання, flex" }; } },
        { name: "Три картки з картинками й заголовками", check: (ctx) => { const c = ctx.$$(".cards > article.card"); return { pass: c.length === 3 && c.every((card) => card.querySelector("img") && card.querySelector("h2") && (card.querySelector("img").getAttribute("alt") || "").trim()), actual: c.length + " карток", expected: "3 картки з img (alt) і h2" }; } },
        { name: "На 800px — три колонки", check: (ctx) => { const c = ctx.$$(".card").map((e) => ctx.rect(e)); return { pass: c.length === 3 && near(c[0].top, c[2].top) && near(c[0].width, c[1].width), actual: c.length === 3 && near(c[0].top, c[2].top) ? "в один ряд" : "не в ряд", expected: "три рівні колонки" }; } },
        { name: "На 500px — одна колонка", width: 500, check: (ctx) => { const c = ctx.$$(".card").map((e) => ctx.rect(e)); return { pass: c.length === 3 && c[1].top > c[0].bottom - 1 && near(c[0].left, c[1].left), actual: c.length === 3 && c[1].top > c[0].bottom - 1 ? "стовпчиком" : "не стовпчиком", expected: "картки одна під одною" }; } },
      ],
      codeChecks: [
        { re: /display\s*:\s*grid/, label: "Картки на CSS Grid", in: "css" },
        { re: /@media\s*\(\s*max-width\s*:\s*600px\s*\)/, label: "Є медіазапит до 600px", in: "css" },
        { re: /max-width\s*:\s*100%/, label: "Адаптивні картинки (max-width: 100%)", in: "css" },
      ],
      solution: {
        html: `<header>
  <h1>Острів будівельників</h1>
  <nav>
    <ul>
      <li><a href="#harbor">Причал</a></li>
      <li><a href="#market">Ринок</a></li>
      <li><a href="#lighthouse">Маяк</a></li>
    </ul>
  </nav>
</header>

<main>
  <div class="cards">
    <article class="card">
      <img src="harbor.svg" width="400" height="250" alt="Причал із кораблями">
      <h2>Причал</h2>
    </article>
    <article class="card">
      <img src="market.svg" width="400" height="250" alt="Ринок із яскравими наметами">
      <h2>Ринок</h2>
    </article>
    <article class="card">
      <img src="lighthouse.svg" width="400" height="250" alt="Маяк на скелі">
      <h2>Маяк</h2>
    </article>
  </div>
</main>

<footer>
  <p>© 2026 Острів будівельників</p>
</footer>
`,
        css: `nav ul {
  display: flex;
  gap: 16px;
  list-style: none;
  padding: 0;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.card img {
  max-width: 100%;
  height: auto;
}

@media (max-width: 600px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
`,
      },
      hint: "Збери з готових цеглинок: flex для `nav ul`, `grid-template-columns: repeat(3, 1fr)` для `.cards` і медіазапит, що змінює його на `1fr`.",
      difficulty: 3,
    }),
  ];

  window.WORLD_DATA = window.WORLD_DATA || {};
  window.WORLD_DATA.web = {
    locations: LOCATIONS,
    levels: LEVELS,
    // Великі практичні місії світу.
    projects: [9, 23, 47, 54, 60],
  };
})();
