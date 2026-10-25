/* =========================================================
   levels-web.js — світ «Острів будівельників»: HTML і CSS.
   12 локацій, 53 рівні — за планом поглиблення HTML/CSS
   (основи вже відомі, тож рівні ближчі до реальної роботи).

   Типи завдань:
     write-markup — зверстати (index.html і/або style.css)
     fix-markup   — виправити верстку
   starterHtml / starterCss — стартові файли (null — файлу немає)
   solution: { html, css } — еталон для tests/run.html
   testCases[].check(ctx) — перевірка на справжньому рендері сторінки:
     ctx.$ / ctx.$$ / ctx.text / ctx.attr — DOM
     ctx.style(el, "prop", pseudo) — обчислений стиль, ctx.rect(el) — розміри
     ctx.color("gold") — колір у форматі getComputedStyle
     ctx.rules(/…/) — CSS-правила, ctx.atRules("CSSFontFaceRule"), ctx.keyframes(name)
     ctx.transform(el) — кут, масштаб і зсув transform
     ctx.contrast(el) — контраст тексту з фоном (WCAG)
     ctx.lint() — попередження про незакриті теги
   testCases[].width — ширина вікна для тесту (за замовчуванням 800, висота 600)
   Кожен тест рендерить сторінку заново, тож зміни DOM у тесті не впливають на інші.
   codeChecks[].in — "html" або "css" (за замовчуванням обидва файли)
   ========================================================= */
(function () {
  "use strict";

  /* ---------- помічники для тестів ---------- */

  // Порівняння з допуском у пікселях (рендер може давати дробові значення).
  const near = (a, b, tol) => Math.abs(a - b) <= (tol === undefined ? 1.5 : tol);
  const eq = (ctx, actual, expected) => ({ pass: actual === expected, actual: ctx.show(actual), expected: ctx.show(expected) });
  const px = (n) => Math.round(n) + "px";
  // Значення властивості з першого CSS-правила, чий селектор підходить під вираз.
  const ruleProp = (ctx, re, prop) => {
    const r = ctx.rules(re)[0];
    return r ? r.rule.style.getPropertyValue(prop).trim() : "";
  };
  // Скільки елементів стоїть у першому рядку.
  const perRow = (ctx, sel) => {
    const r = ctx.$$(sel).map((e) => ctx.rect(e));
    return r.filter((x) => near(x.top, r[0].top)).length;
  };
  const labelOf = (ctx, sel) => {
    const el = ctx.$(sel);
    return el && el.labels && el.labels.length ? ctx.text(el.labels[0]) : null;
  };

  const LOCATIONS = [
    { id: 1,  name: "Квартал семантики",       arcs: [1],  event: "Квартал отримав вивіски — кожен дім знає своє призначення",  trophy: { name: "Вивіска гільдії",     icon: "sign" } },
    { id: 2,  name: "Фарбарня селекторів",     arcs: [2],  event: "Фарбарня розфарбувала острів — кожен стиль лягає куди треба", trophy: { name: "Чарівний пензель",    icon: "brush" } },
    { id: 3,  name: "Флекс-доки",              arcs: [3],  event: "Доки вишикувано в ідеальну лінію",                            trophy: { name: "Якір флексу",         icon: "anchor" } },
    { id: 4,  name: "Гридбург",                arcs: [4],  event: "Гридбург розплановано — місто стоїть рівними кварталами",     trophy: { name: "Креслення сітки",     icon: "blueprint" } },
    { id: 5,  name: "Маяк адаптивності",       arcs: [5],  event: "Маяк засяяв — острів видно з будь-якого екрана",              trophy: { name: "Лінза маяка",         icon: "lens" } },
    { id: 6,  name: "Палітрова майстерня",     arcs: [6],  event: "Майстерня змішала палітру — острів міняє тему одним рухом",   trophy: { name: "Палітра майстра",     icon: "palette" } },
    { id: 7,  name: "Ярмарок анімацій",        arcs: [7],  event: "Ярмарок ожив — каруселі крутяться, кулі злітають",            trophy: { name: "Повітряна куля",      icon: "balloon" } },
    { id: 8,  name: "Сад доступності",         arcs: [8],  event: "Сад відкрито для кожного гостя острова",                       trophy: { name: "Квітка доступності",  icon: "flower" } },
    { id: 9,  name: "Вітряки швидкості",       arcs: [9],  event: "Вітряки розкрутились — острів вантажиться миттєво",           trophy: { name: "Блискавка швидкості", icon: "bolt" } },
    { id: 10, name: "Бібліотека порядку",      arcs: [10], event: "Бібліотеку впорядковано — кожен клас на своїй полиці",         trophy: { name: "Книга порядку",       icon: "book" } },
    { id: 11, name: "Обсерваторія нового CSS", arcs: [11], event: "Обсерваторія відкрила нові зірки сучасного CSS",              trophy: { name: "Зірка обсерваторії",  icon: "star" } },
    { id: 12, name: "Гранд-готель «Люм'єр»",   arcs: [12], event: "Гранд-готель відчинив двері — острів будівельників завершено!", trophy: { name: "Дзвоник рецепції",  icon: "bell" } },
  ];

  const ARC_NAMES = [
    "Семантика та структура", "CSS поглиблено: база", "Flexbox поглиблено", "CSS Grid",
    "Адаптивний дизайн", "CSS-змінні", "Анімації та переходи", "Доступність (a11y)",
    "Продуктивність", "Організація коду", "Сучасний CSS", "Практичні проєкти",
  ];
  // Рівень арки n: назва арки й локації підставляються автоматично.
  const L = (n, data) => Object.assign({ arc: ARC_NAMES[n - 1], arcNumber: n, locationName: LOCATIONS[n - 1].name }, data);

  const LEVELS = [
    /* ───────────── 1. Квартал семантики — семантика та структура ───────────── */
    L(1, {
      id: 1,
      title: "Семантичний каркас",
      concept: "Семантичні теги описують роль частин сторінки: `header` — шапка, `nav` — навігація, `main` — головний вміст (один на сторінку), `article` — самостійний матеріал, `section` — тематичний розділ, `aside` — додаткове, `footer` — підвал. Пошуковики й програми читання екрана розуміють структуру без жодного `div`.",
      example: `<header>
  <h1>Назва</h1>
  <nav>…</nav>
</header>
<main>
  <article>…</article>
  <aside>…</aside>
</main>
<footer>…</footer>`,
      missionStory: "Квартал семантики відбудовують з нуля. Гільдія вимагає, щоб кожна будівля мала вивіску зі своїм призначенням — жодних безликих коробок.",
      worldEvent: "Головна вулиця кварталу отримала вивіски.",
      taskType: "write-markup",
      prompt: "Збудуй сторінку без жодного `div`: `header` з `h1` і `nav`, у якому список щонайменше з 3 посилань; `main`, а в ньому `article` (з `h2` і абзацом) та `aside` з порадою; наприкінці `footer`.",
      starterHtml: `<!-- каркас сторінки кварталу -->
`,
      starterCss: null,
      testCases: [
        { name: "header з h1 і nav-списком із 3+ посилань", check: (ctx) => ({ pass: !!ctx.$("header h1") && ctx.$$("header nav ul li a").length >= 3, actual: (ctx.$("header h1") ? "h1 є" : "h1 немає") + ", посилань: " + ctx.$$("header nav ul li a").length, expected: "h1 є, посилань: ≥3" }) },
        { name: "main містить article (h2 + p) і aside", check: (ctx) => ({ pass: !!ctx.$("main article h2") && !!ctx.$("main article p") && !!ctx.$("main aside"), actual: ["main article h2", "main article p", "main aside"].filter((s) => !ctx.$(s)).join(", ") || "усе на місці", expected: "усе на місці" }) },
        { name: "footer — останній блок сторінки", check: (ctx) => { const blocks = ctx.$$("body > *"); return { pass: blocks.length > 0 && blocks[blocks.length - 1].tagName === "FOOTER", actual: blocks.length ? blocks[blocks.length - 1].tagName.toLowerCase() : "порожньо", expected: "footer" }; } },
        { name: "Жодного div", check: (ctx) => eq(ctx, ctx.$$("div").length, 0) },
      ],
      solution: { html: `<header>
  <h1>Квартал семантики</h1>
  <nav>
    <ul>
      <li><a href="#streets">Вулиці</a></li>
      <li><a href="#guilds">Гільдії</a></li>
      <li><a href="#contacts">Контакти</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h2>Нова вивіска ратуші</h2>
    <p>Майстри повісили вивіску з назвою кожної будівлі.</p>
  </article>
  <aside>
    <p>Порада: заголовки — по порядку, без стрибків.</p>
  </aside>
</main>
<footer>
  <p>© 2026 Гільдія будівельників</p>
</footer>
` },
      hint: "Почни з трьох головних блоків — `header`, `main`, `footer`, а потім наповни їх. `nav` можна покласти в `header`.",
      difficulty: 2,
    }),
    L(1, {
      id: 2,
      title: "Ієрархія заголовків",
      concept: "Заголовки утворюють зміст сторінки: один `h1`, під ним розділи `h2`, у них підрозділи `h3` — без стрибків рівнів. Пошуковики беруть із цього структуру для SEO, а люди з програмами читання екрана стрибають сторінкою саме по заголовках.",
      example: `<h1>Готель</h1>
  <h2>Номери</h2>
    <h3>Люкс</h3>
  <h2>Ресторан</h2>`,
      missionStory: "Покажчики кварталу переплутано: два головні входи, а сходи ведуть одразу на п'ятий поверх. Гості губляться.",
      worldEvent: "Покажчики кварталу ведуть куди треба.",
      taskType: "fix-markup",
      prompt: "Виправ рівні: один `h1` («Квартал семантики»); розділи «Вулиці» й «Мешканці» — `h2`; «Головна вулиця», «Ринкова площа» — `h3` у «Вулицях»; «Ремісники» — `h3` у «Мешканцях». Текст і порядок не змінюй.",
      starterHtml: `<h1>Квартал семантики</h1>
<h1>Вулиці</h1>
<h4>Головна вулиця</h4>
<h4>Ринкова площа</h4>
<h2>Мешканці</h2>
<h5>Ремісники</h5>
`,
      starterCss: null,
      testCases: [
        { name: "Рівно один h1", check: (ctx) => eq(ctx, ctx.$$("h1").length, 1) },
        { name: "Ієрархія без стрибків", check: (ctx) => eq(ctx, ctx.$$("h1, h2, h3, h4, h5, h6").map((h) => h.tagName.toLowerCase()).join(" "), "h1 h2 h3 h3 h2 h3") },
      ],
      solution: { html: `<h1>Квартал семантики</h1>
<h2>Вулиці</h2>
<h3>Головна вулиця</h3>
<h3>Ринкова площа</h3>
<h2>Мешканці</h2>
<h3>Ремісники</h3>
` },
      hint: "Підрозділ завжди на один рівень глибший за свій розділ: `h2` → `h3`.",
      difficulty: 1,
    }),
    L(1, {
      id: 3,
      title: "Типи полів форми",
      concept: "Правильний `type` поля — безкоштовна зручність: `email` перевіряє формат і на телефоні показує клавіатуру з `@`, `tel` — цифрову клавіатуру, `date` — календар, `number` приймає лише числа й поважає `min`/`max`. Кожне поле потребує `label`.",
      example: `<label for="mail">Пошта</label>
<input id="mail" type="email">
<label for="qty">Кількість</label>
<input id="qty" type="number" min="1" max="10">`,
      missionStory: "Гостьовий дім кварталу приймає бронювання по телефону — і плутає цифри. Час на зручну онлайн-форму.",
      worldEvent: "Гостьовий дім прийняв перше онлайн-бронювання.",
      taskType: "write-markup",
      prompt: "Створи форму з чотирма полями й мітками: пошта `#email` (email), телефон `#phone` (tel), дата заїзду `#arrival` (date), кількість гостей `#guests` (number від 1 до 8).",
      starterHtml: `<form>

</form>
`,
      starterCss: null,
      testCases: [
        { name: "Типи полів: email, tel, date, number", check: (ctx) => eq(ctx, ["#email", "#phone", "#arrival", "#guests"].map((s) => (ctx.$(s) ? ctx.$(s).type : "—")).join(" "), "email tel date number") },
        { name: "#guests має min=1 і max=8", check: (ctx) => eq(ctx, ctx.$("#guests") ? ctx.attr("#guests", "min") + "–" + ctx.attr("#guests", "max") : null, "1–8") },
        { name: "Кожне поле має мітку", check: (ctx) => { const miss = ["#email", "#phone", "#arrival", "#guests"].filter((s) => !labelOf(ctx, s)); return { pass: !miss.length, actual: miss.join(", ") || "усі з мітками", expected: "усі з мітками" }; } },
      ],
      solution: { html: `<form>
  <label for="email">Пошта</label>
  <input id="email" name="email" type="email">

  <label for="phone">Телефон</label>
  <input id="phone" name="phone" type="tel">

  <label for="arrival">Дата заїзду</label>
  <input id="arrival" name="arrival" type="date">

  <label for="guests">Гостей</label>
  <input id="guests" name="guests" type="number" min="1" max="8">
</form>
` },
      hint: "`for` мітки = `id` поля. Межі числа — атрибути `min` і `max` самого поля.",
      difficulty: 1,
    }),
    L(1, {
      id: 4,
      title: "Атрибути валідації",
      concept: "Браузер сам перевіряє форму: `required` — обов'язкове поле, `minlength` — мінімальна довжина, `pattern` — регулярний вираз, якому має відповідати все значення (наприклад, `\\+380\\d{9}` для українського номера), `min`/`max` — межі чисел і дат. Некоректну форму надіслати не вийде.",
      example: `<input id="code" pattern="[A-Z]{3}-\\d{3}" required>
<!-- приймає «ABC-123», відхиляє «abc123» -->`,
      missionStory: "У гостьовий дім сиплються бронювання з номерами «123» і порожніми іменами. Захистимо форму від сміття.",
      worldEvent: "Форма гостьового дому відсіює помилкові заявки.",
      taskType: "fix-markup",
      prompt: "Посиль валідацію: `#name` — обов'язкове, щонайменше 2 символи (`minlength`); `#phone` — обов'язкове й відповідає шаблону `+380` і ще 9 цифр (`pattern=\"\\+380\\d{9}\"`); `#promo` — необов'язкове, але якщо заповнене, то 4 великі латинські літери й 2 цифри (`[A-Z]{4}\\d{2}`).",
      starterHtml: `<form>
  <label for="name">Ім'я</label>
  <input id="name" name="name">

  <label for="phone">Телефон</label>
  <input id="phone" name="phone" type="tel">

  <label for="promo">Промокод</label>
  <input id="promo" name="promo">

  <button type="submit">Забронювати</button>
</form>
`,
      starterCss: null,
      testCases: [
        // minlength браузер перевіряє лише після введення з клавіатури, тому атрибут читаємо напряму.
        { name: "Ім'я обов'язкове, мінімум 2 символи", check: (ctx) => { const i = ctx.$("#name"); i.value = ""; const empty = i.checkValidity(); return { pass: !empty && i.minLength === 2, actual: "порожнє → " + (empty ? "приймається" : "відхилено") + ", minlength = " + i.minLength, expected: "порожнє → відхилено, minlength = 2" }; } },
        { name: "Телефон: +380671234567 ✓, 0671234567 ✗, порожній ✗", check: (ctx) => { const i = ctx.$("#phone"); const t = (v) => { i.value = v; return i.checkValidity(); }; const r = [t("+380671234567"), t("0671234567"), t("")]; return { pass: r[0] && !r[1] && !r[2], actual: r.join(", "), expected: "true, false, false" }; } },
        { name: "Промокод: порожній ✓, SALE25 ✓, sale25 ✗", check: (ctx) => { const i = ctx.$("#promo"); const t = (v) => { i.value = v; return i.checkValidity(); }; const r = [t(""), t("SALE25"), t("sale25")]; return { pass: r[0] && r[1] && !r[2], actual: r.join(", "), expected: "true, true, false" }; } },
      ],
      solution: { html: `<form>
  <label for="name">Ім'я</label>
  <input id="name" name="name" required minlength="2">

  <label for="phone">Телефон</label>
  <input id="phone" name="phone" type="tel" required pattern="\\+380\\d{9}">

  <label for="promo">Промокод</label>
  <input id="promo" name="promo" pattern="[A-Z]{4}\\d{2}">

  <button type="submit">Забронювати</button>
</form>
` },
      hint: "`pattern` перевіряє все значення цілком, тож `^` і `$` не потрібні. Порожнє необов'язкове поле завжди валідне.",
      difficulty: 2,
    }),
    L(1, {
      id: 5,
      title: "figure і figcaption",
      concept: "`figure` обгортає самодостатню ілюстрацію — фото, схему, діаграму, фрагмент коду, — а `figcaption` дає їй підпис. Підпис логічно прив'язаний до зображення, а `alt` описує саме картинку.",
      example: `<figure>
  <img src="map.png" alt="Схема вулиць кварталу">
  <figcaption>План кварталу, 2026</figcaption>
</figure>`,
      missionStory: "Архітектор приніс план кварталу. Повісь його в ратуші з підписом, щоб і зрячі, і незрячі гості знали, що це.",
      worldEvent: "У ратуші висить план кварталу з підписом.",
      taskType: "write-markup",
      prompt: "Створи `figure` з зображенням `plan.svg` (з описовим `alt`) і підписом `figcaption` «План кварталу, 2026». Підпис — після зображення.",
      starterHtml: `<h2>Ратуша</h2>
`,
      starterCss: null,
      testCases: [
        { name: "figure містить img plan.svg з alt", check: (ctx) => ({ pass: !!ctx.$('figure img[src="plan.svg"]') && (ctx.attr("figure img", "alt") || "").trim().length >= 5, actual: ctx.$("figure img") ? ctx.show(ctx.$("figure img").outerHTML) : "немає", expected: '<img src="plan.svg" alt="…">' }) },
        { name: "figcaption «План кварталу, 2026» — останній у figure", check: (ctx) => { const f = ctx.$("figure"); const last = f && f.lastElementChild; return { pass: !!last && last.tagName === "FIGCAPTION" && ctx.text(last) === "План кварталу, 2026", actual: last ? last.tagName.toLowerCase() + " " + ctx.show(ctx.text(last)) : "немає", expected: "figcaption \"План кварталу, 2026\"" }; } },
      ],
      solution: { html: `<h2>Ратуша</h2>
<figure>
  <img src="plan.svg" alt="Схема вулиць і будинків кварталу">
  <figcaption>План кварталу, 2026</figcaption>
</figure>
` },
      hint: "Усередині `figure`: спершу `img`, потім `figcaption`.",
      difficulty: 1,
    }),
    L(1, {
      id: 6,
      title: "picture і source",
      concept: "`picture` дає браузеру вибір зображення: кожен `source` має умову (`media=\"(min-width: 700px)\"`) і файл (`srcset`), а `img` усередині — запасний варіант і носій `alt`. Браузер завантажує лише один файл — так телефон не тягне величезну панораму.",
      example: `<picture>
  <source media="(min-width: 900px)" srcset="hero-wide.jpg">
  <img src="hero-small.jpg" alt="Готель на світанку">
</picture>`,
      missionStory: "На вивісці кварталу — панорама. На великих екранах вона чудова, а на телефонах — дрібна й важка. Нехай кожен екран отримає свою картинку.",
      worldEvent: "Квартал отримав вивіски — кожен дім знає своє призначення!",
      taskType: "write-markup",
      prompt: "Створи `picture`: для екранів від 700px — `source` з `media=\"(min-width: 700px)\"` і `srcset=\"panorama.svg\"`; запасне `img` — `harbor.svg` з `alt`. Зображення має займати 100% ширини (CSS уже готовий).",
      starterHtml: `<h2>Вид на квартал</h2>
`,
      starterCss: `img {
  width: 100%;
  height: auto;
  display: block;
}
`,
      testCases: [
        { name: "picture > source(media, srcset) + img з alt", check: (ctx) => { const s = ctx.$("picture > source"); const i = ctx.$("picture > img"); return { pass: !!s && s.getAttribute("media") === "(min-width: 700px)" && s.getAttribute("srcset") === "panorama.svg" && !!i && i.getAttribute("src") === "harbor.svg" && (i.getAttribute("alt") || "").trim().length > 3, actual: s ? ctx.show(s.outerHTML) : "source немає", expected: '<source media="(min-width: 700px)" srcset="panorama.svg"> + <img src="harbor.svg" alt="…">' }; } },
        { name: "На 800px завантажено панораму", check: (ctx) => ({ pass: /panorama\.svg$/.test(ctx.$("picture img") ? ctx.$("picture img").currentSrc : ""), actual: ctx.$("picture img") ? ctx.$("picture img").currentSrc.split("/").pop() : "немає", expected: "panorama.svg" }) },
        { name: "На 500px — запасна картинка", width: 500, check: (ctx) => ({ pass: /harbor\.svg$/.test(ctx.$("picture img") ? ctx.$("picture img").currentSrc : ""), actual: ctx.$("picture img") ? ctx.$("picture img").currentSrc.split("/").pop() : "немає", expected: "harbor.svg" }) },
      ],
      solution: { html: `<h2>Вид на квартал</h2>
<picture>
  <source media="(min-width: 700px)" srcset="panorama.svg">
  <img src="harbor.svg" alt="Причал кварталу з кораблями">
</picture>
`, css: `img {
  width: 100%;
  height: auto;
  display: block;
}
` },
      hint: "`source` іде перед `img`, а `alt` пишеться лише в `img`.",
      difficulty: 2,
    }),

    /* ───────────── 2. Фарбарня селекторів — CSS поглиблено (база) ───────────── */
    L(2, {
      id: 7,
      title: "box-sizing: border-box",
      concept: "За замовчуванням `width` — це лише вміст, а `padding` і `border` додаються зверху: картка з `width: 300px` і відступами займає більше. Тому майже кожен проєкт починається з правила `*, *::before, *::after { box-sizing: border-box; }` — тепер ширина включає відступи й рамку.",
      example: `*, *::before, *::after {
  box-sizing: border-box;
}`,
      missionStory: "Фарбар замовив вивіски по 300 пікселів, а їх привезли ширшими — вони налазять одна на одну.",
      worldEvent: "Вивіски фарбарні нарешті точного розміру.",
      taskType: "write-markup",
      prompt: "Додай на початок `style.css` універсальне правило `border-box` для всіх елементів і псевдоелементів, щоб `.card` займала рівно 300px.",
      starterHtml: `<div class="card">Вивіска 1</div>
<div class="card">Вивіска 2</div>
`,
      starterCss: `.card {
  width: 300px;
  padding: 20px;
  border: 2px solid #5e3a1c;
  margin-bottom: 8px;
}
`,
      testCases: [
        { name: "Картка займає рівно 300px", check: (ctx) => eq(ctx, px(ctx.rect(".card").width), "300px") },
        { name: "border-box для всіх елементів (навіть body)", check: (ctx) => eq(ctx, ctx.style("body", "box-sizing"), "border-box") },
        { name: "…і для псевдоелементів", check: (ctx) => eq(ctx, ctx.style(".card", "box-sizing", "::before"), "border-box") },
      ],
      solution: { html: `<div class="card">Вивіска 1</div>
<div class="card">Вивіска 2</div>
`, css: `*,
*::before,
*::after {
  box-sizing: border-box;
}

.card {
  width: 300px;
  padding: 20px;
  border: 2px solid #5e3a1c;
  margin-bottom: 8px;
}
` },
      hint: "Селектор: `*, *::before, *::after`.",
      difficulty: 1,
    }),
    L(2, {
      id: 8,
      title: "Специфічність",
      concept: "Коли правила сперечаються, перемагає специфічніше: рахуй (id, класи, теги). `#menu a` = (1,0,1), `.nav .link` = (0,2,0), `a.link` = (0,1,1), `nav a` = (0,0,2). Порівнюють зліва направо: один id сильніший за будь-яку кількість класів.",
      example: `#menu a      /* 1-0-1 */
.nav .link   /* 0-2-0 */
a.link       /* 0-1-1 */
nav a        /* 0-0-2 */`,
      missionStory: "Чотири фарбарі одночасно фарбують ті самі посилання. Чия фарба ляже зверху на кожному?",
      worldEvent: "Фарбарі домовились, чия фарба головна.",
      taskType: "predict-output",
      prompt: "Якого кольору буде кожне посилання? Впиши назву кольору англійською, як у CSS.",
      answerHeading: "Якого кольору посилання?",
      answerPlaceholder: "назва кольору",
      lineLabels: ["«Перше»", "«Друге»", "«Третє»"],
      exampleLang: "css",
      starterCode: null,
      code: `<style>
  #menu a { color: red; }
  .nav .link { color: blue; }
  a.link { color: green; }
  nav a { color: orange; }
</style>
<nav id="menu" class="nav"><a class="link">Перше</a></nav>
<nav class="nav"><a class="link">Друге</a></nav>
<nav><a class="link">Третє</a></nav>`,
      expectedAnswer: ["red", "blue", "green"],
      hint: "Для кожного посилання випиши правила, що до нього підходять, і порівняй їхні (id, класи, теги).",
      difficulty: 2,
    }),
    L(2, {
      id: 9,
      title: "Чому стиль не застосовується",
      concept: "Класика: пишеш `.btn { color: white }`, а колір не змінюється — бо десь є `#hero a { color: navy }` зі старшою специфічністю. `!important` — погане рішення: воно ламає каскад. Краще підвищити специфічність правила або звузити загальне правило (наприклад, `:not(.btn)`).",
      example: `/* замість !important */
#hero .btn { color: white; }
/* або звузь загальне правило */
#hero a:not(.btn) { color: navy; }`,
      missionStory: "Кнопка «Забронювати» на вітрині фарбарні вперто лишається темно-синьою, хоч її фарбували в білий.",
      worldEvent: "Кнопка на вітрині нарешті біла.",
      taskType: "fix-markup",
      prompt: "Зроби текст `.btn` білим, не використовуючи `!important` і не змінюючи HTML. Посилання «Каталог» має лишитись темно-синім.",
      starterHtml: `<section id="hero">
  <a class="btn" href="#book">Забронювати</a>
  <a href="#catalog">Каталог</a>
</section>
`,
      starterCss: `#hero a {
  color: navy;
}

.btn {
  color: white;
  background: crimson;
  padding: 10px 16px;
}
`,
      testCases: [
        { name: "Кнопка біла", check: (ctx) => eq(ctx, ctx.style(".btn", "color"), ctx.color("white")) },
        { name: "«Каталог» лишився темно-синім", check: (ctx) => eq(ctx, ctx.style('a[href="#catalog"]', "color"), ctx.color("navy")) },
      ],
      codeChecks: [{ re: /!important/, not: true, label: "Без !important", in: "css" }],
      solution: { html: `<section id="hero">
  <a class="btn" href="#book">Забронювати</a>
  <a href="#catalog">Каталог</a>
</section>
`, css: `#hero a {
  color: navy;
}

#hero .btn {
  color: white;
  background: crimson;
  padding: 10px 16px;
}
` },
      hint: "Порівняй специфічність `#hero a` (1,0,1) і `.btn` (0,1,0). Що станеться, якщо написати `#hero .btn`?",
      difficulty: 2,
    }),
    L(2, {
      id: 10,
      title: "Псевдокласи",
      concept: "`:focus-visible` — фокус із клавіатури (кільце фокуса для Tab, без нього при кліку мишею). `:nth-child(odd)` — кожен непарний серед братів. `:first-of-type` — перший елемент свого типу серед братів: на відміну від `:first-child`, він «перестрибує» інші теги.",
      example: `a:focus-visible { outline: 3px solid gold; }
tr:nth-child(odd) { background: #f5f5f5; }
p:first-of-type { font-weight: 700; }`,
      missionStory: "Прейскурант фарбарні довгий і нудний. Зробимо його зручним для очей і для тих, хто ходить сайтом клавіатурою.",
      worldEvent: "Прейскурант фарбарні став зручним для всіх.",
      taskType: "write-markup",
      prompt: "Додай стилі: посилання й кнопки при фокусі з клавіатури (`:focus-visible`) — рамка `outline: 3px solid gold`; непарні пункти списку (`li:nth-child(odd)`) — фон `#f3eee2`; перший абзац у секції (`p:first-of-type`) — жирний (`700`).",
      starterHtml: `<section>
  <h2>Прейскурант</h2>
  <p>Фарба на будь-який смак.</p>
  <p>Знижки для гільдій.</p>
  <ul>
    <li>Біла — 5 монет</li>
    <li>Червона — 7 монет</li>
    <li>Синя — 7 монет</li>
    <li>Золота — 20 монет</li>
  </ul>
  <a href="#order">Замовити</a>
  <button type="button">Кошик</button>
</section>
`,
      starterCss: `/* псевдокласи */
`,
      testCases: [
        { name: "Перший абзац жирний, другий — ні", check: (ctx) => eq(ctx, ctx.$$("p").map((p) => ctx.style(p, "font-weight")).join(" "), "700 400") },
        { name: "Непарні пункти на тлі #f3eee2", check: (ctx) => eq(ctx, ctx.$$("li").map((li) => ctx.style(li, "background-color") === ctx.color("#f3eee2")).join(" "), "true false true false") },
        { name: ":focus-visible дає рамку 3px gold", check: (ctx) => { const w = ruleProp(ctx, /:focus-visible/, "outline-width"); const c = ruleProp(ctx, /:focus-visible/, "outline-color"); return { pass: w === "3px" && ctx.color(c) === ctx.color("gold"), actual: w ? "outline " + w + " " + c : "правила :focus-visible немає", expected: "outline 3px gold" }; } },
      ],
      solution: { html: `<section>
  <h2>Прейскурант</h2>
  <p>Фарба на будь-який смак.</p>
  <p>Знижки для гільдій.</p>
  <ul>
    <li>Біла — 5 монет</li>
    <li>Червона — 7 монет</li>
    <li>Синя — 7 монет</li>
    <li>Золота — 20 монет</li>
  </ul>
  <a href="#order">Замовити</a>
  <button type="button">Кошик</button>
</section>
`, css: `a:focus-visible,
button:focus-visible {
  outline: 3px solid gold;
}

li:nth-child(odd) {
  background-color: #f3eee2;
}

p:first-of-type {
  font-weight: 700;
}
` },
      hint: "Перший абзац — не перша дитина секції (перед ним `h2`), тому `:first-child` не підійде, а `:first-of-type` — так.",
      difficulty: 2,
    }),
    L(2, {
      id: 11,
      title: "::before і ::after",
      concept: "Псевдоелементи `::before` і `::after` додають декор без зайвого HTML: іконки, лапки, лінії під заголовком. Обов'язкова властивість — `content` (для порожнього декору — `content: \"\"`). Щоб задати розміри, псевдоелементу потрібен `display: block` чи `inline-block`.",
      example: `.title::after {
  content: "";
  display: block;
  width: 40px;
  height: 3px;
  background: tomato;
}`,
      missionStory: "Фарбар хоче прикрасити вивіски зірочками й підкресленнями, але не дає вбивати в стіни зайві цвяхи (HTML).",
      worldEvent: "Фарбарня розфарбувала острів — кожен стиль лягає куди треба!",
      taskType: "write-markup",
      prompt: "Без змін HTML: додай перед `.badge` текст `★ ` (через `::before`, колір `gold`), а під `.title` — декоративну лінію `::after`: блок 40×3px з фоном `tomato`.",
      starterHtml: `<span class="badge">Новинка</span>
<h2 class="title">Наші майстри</h2>
`,
      starterCss: `/* псевдоелементи */
`,
      testCases: [
        { name: ".badge::before — «★ » золотого кольору", check: (ctx) => ({ pass: ctx.style(".badge", "content", "::before") === '"★ "' && ctx.style(".badge", "color", "::before") === ctx.color("gold"), actual: ctx.style(".badge", "content", "::before") + " " + ctx.style(".badge", "color", "::before"), expected: '"★ " ' + ctx.color("gold") }) },
        { name: ".title::after — блок 40×3 tomato", check: (ctx) => { const s = (p) => ctx.style(".title", p, "::after"); return { pass: s("display") === "block" && s("width") === "40px" && s("height") === "3px" && s("background-color") === ctx.color("tomato"), actual: [s("display"), s("width"), s("height")].join(" "), expected: "block 40px 3px" }; } },
      ],
      codeChecks: [{ re: /<span[^>]*>\s*★/, not: true, label: "Зірочка не в HTML", in: "html" }],
      solution: { html: `<span class="badge">Новинка</span>
<h2 class="title">Наші майстри</h2>
`, css: `.badge::before {
  content: "★ ";
  color: gold;
}

.title::after {
  content: "";
  display: block;
  width: 40px;
  height: 3px;
  background: tomato;
}
` },
      hint: "Без `content` псевдоелемент не з'явиться взагалі. Лінії потрібен `display: block`, щоб прийняти ширину й висоту.",
      difficulty: 2,
    }),

    /* ───────────── 3. Флекс-доки — Flexbox поглиблено ───────────── */
    L(3, {
      id: 12,
      title: "Властивості контейнера",
      concept: "На flex-контейнері: `justify-content` розподіляє елементи по головній осі, `align-items` — по поперечній, `gap` задає однакові проміжки між ними. Разом вони вирішують 80% задач розкладки в один рядок.",
      example: `.toolbar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}`,
      missionStory: "На причалі доків стоїть пульт керування з трьома кнопками — вони злиплись у куті. Відцентруй їх.",
      worldEvent: "Пульт доків зручно розкладено.",
      taskType: "write-markup",
      prompt: "Зроби `.toolbar` flex-контейнером: кнопки — по центру горизонтально й вертикально, з проміжком `12px` між ними.",
      starterHtml: `<div class="toolbar">
  <button type="button">Пришвартувати</button>
  <button type="button">Розвантажити</button>
  <button type="button">Відпустити</button>
</div>
`,
      starterCss: `.toolbar {
  width: 600px;
  height: 80px;
  background: #2a85c4;
}
`,
      testCases: [
        { name: "Група кнопок по центру горизонтально", check: (ctx) => { const t = ctx.rect(".toolbar"), b = ctx.$$("button").map((e) => ctx.rect(e)); const l = b[0].left - t.left, r = t.right - b[2].right; return { pass: near(l, r), actual: "зліва " + px(l) + ", справа " + px(r), expected: "однаково" }; } },
        { name: "Кнопки по центру вертикально", check: (ctx) => { const t = ctx.rect(".toolbar"), b = ctx.rect("button"); return { pass: near(b.top + b.height / 2, t.top + t.height / 2), actual: px(b.top + b.height / 2 - t.top), expected: "40px" }; } },
        { name: "Проміжки 12px", check: (ctx) => { const b = ctx.$$("button").map((e) => ctx.rect(e)); return { pass: near(b[1].left - b[0].right, 12, 0.6) && near(b[2].left - b[1].right, 12, 0.6), actual: px(b[1].left - b[0].right) + ", " + px(b[2].left - b[1].right), expected: "12px, 12px" }; } },
      ],
      solution: { html: `<div class="toolbar">
  <button type="button">Пришвартувати</button>
  <button type="button">Розвантажити</button>
  <button type="button">Відпустити</button>
</div>
`, css: `.toolbar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  width: 600px;
  height: 80px;
  background: #2a85c4;
}
` },
      hint: "Чотири рядки на `.toolbar`: `display`, `justify-content`, `align-items`, `gap`.",
      difficulty: 1,
    }),
    L(3, {
      id: 13,
      title: "flex-grow, flex-shrink, flex-basis",
      concept: "Скорочення `flex: grow shrink basis`. `flex: 0 0 200px` — не рости, не стискатися, базова ширина 200px (бокова панель). `flex: 1 1 0` — зайняти все вільне місце. Без `shrink: 0` панель на вузькому екрані стискається, коли вмісту поруч тісно.",
      example: `.sidebar { flex: 0 0 240px; }
.content { flex: 1 1 0; }`,
      missionStory: "Будка доглядача доків то розтягується, то стискається, хоча має бути завжди однакової ширини. А пірс поруч має займати решту берега.",
      worldEvent: "Будка доглядача більше не плющиться.",
      taskType: "write-markup",
      prompt: "`.sidebar` — завжди рівно 200px (не росте й не стискається), `.content` — займає весь залишок. Використай `flex` на елементах.",
      starterHtml: `<div class="layout">
  <aside class="sidebar">Будка</aside>
  <main class="content">
    <div class="wide">Карта пірсу</div>
  </main>
</div>
`,
      starterCss: `.layout {
  display: flex;
  gap: 16px;
}

.sidebar { background: #c08a52; }
.content { background: #9aa1a9; }
.wide { width: 300px; background: #e2cf8e; }
`,
      testCases: [
        { name: "На 800px: будка 200px, пірс — решта (568px)", check: (ctx) => eq(ctx, px(ctx.rect(".sidebar").width) + " " + px(ctx.rect(".content").width), "200px 568px") },
        { name: "На 360px будка лишається 200px", width: 360, check: (ctx) => eq(ctx, px(ctx.rect(".sidebar").width), "200px") },
      ],
      codeChecks: [{ re: /flex\s*:\s*0\s+0\s+200px|flex-shrink\s*:\s*0/, label: "Будка не стискається (flex-shrink: 0)", in: "css" }],
      solution: { html: `<div class="layout">
  <aside class="sidebar">Будка</aside>
  <main class="content">
    <div class="wide">Карта пірсу</div>
  </main>
</div>
`, css: `.layout {
  display: flex;
  gap: 16px;
}

.sidebar { flex: 0 0 200px; background: #c08a52; }
.content { flex: 1 1 0; background: #9aa1a9; }
.wide { width: 300px; background: #e2cf8e; }
` },
      hint: "`.sidebar { flex: 0 0 200px; }` і `.content { flex: 1 1 0; }`.",
      difficulty: 2,
    }),
    L(3, {
      id: 14,
      title: "Патерн: навбар",
      concept: "Класичний навбар — два рівні flex: шапка (`logo` ліворуч, меню праворуч через `justify-content: space-between`, вирівнювання по центру висоти) і сам список посилань (`display: flex` + `gap`). Список скидають: `list-style: none; margin: 0; padding: 0`.",
      example: `.nav { display: flex; justify-content: space-between; align-items: center; }
.nav__links { display: flex; gap: 20px; list-style: none; margin: 0; padding: 0; }`,
      missionStory: "Над доками потрібна вивіска-навігатор: назва ліворуч, напрямки праворуч — як у справжніх сайтах.",
      worldEvent: "Над доками засяяв навігатор.",
      taskType: "write-markup",
      prompt: "Зроби навбар: у `.nav` логотип ліворуч, список `.nav__links` праворуч, усе по центру висоти; посилання в рядок із проміжком `20px` (скинь стилі списку).",
      starterHtml: `<header class="nav">
  <a class="logo" href="#">Флекс-доки</a>
  <ul class="nav__links">
    <li><a href="#ships">Кораблі</a></li>
    <li><a href="#cargo">Вантажі</a></li>
    <li><a href="#contacts">Контакти</a></li>
  </ul>
</header>
`,
      starterCss: `.nav {
  padding: 12px 24px;
  background: #1b1612;
}

.nav a {
  color: #f3f2ee;
}
`,
      testCases: [
        { name: "Логотип ліворуч, останнє посилання праворуч", check: (ctx) => { const n = ctx.rect(".nav"), l = ctx.rect(".logo"), a = ctx.$$(".nav__links li"); const last = ctx.rect(a[a.length - 1]); return { pass: near(l.left - n.left, 24) && near(n.right - last.right, 24), actual: "логотип +" + px(l.left - n.left) + ", меню −" + px(n.right - last.right), expected: "по 24px від країв" }; } },
        { name: "Посилання в рядок з проміжком 20px", check: (ctx) => { const li = ctx.$$(".nav__links li").map((e) => ctx.rect(e)); return { pass: near(li[0].top, li[2].top) && near(li[1].left - li[0].right, 20, 0.6), actual: px(li[1].left - li[0].right), expected: "20px" }; } },
        { name: "Логотип і меню на одній висоті (по центру)", check: (ctx) => { const l = ctx.rect(".logo"), u = ctx.rect(".nav__links"); return { pass: near(l.top + l.height / 2, u.top + u.height / 2, 2), actual: px(l.top + l.height / 2) + " / " + px(u.top + u.height / 2), expected: "однакові центри" }; } },
      ],
      solution: { html: `<header class="nav">
  <a class="logo" href="#">Флекс-доки</a>
  <ul class="nav__links">
    <li><a href="#ships">Кораблі</a></li>
    <li><a href="#cargo">Вантажі</a></li>
    <li><a href="#contacts">Контакти</a></li>
  </ul>
</header>
`, css: `.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #1b1612;
}

.nav a {
  color: #f3f2ee;
}

.nav__links {
  display: flex;
  gap: 20px;
  list-style: none;
  margin: 0;
  padding: 0;
}
` },
      hint: "Два flex-контейнери: `.nav` (space-between, center) і `.nav__links` (gap). Без скидання `margin` у `ul` меню з'їде.",
      difficulty: 2,
    }),
    L(3, {
      id: 15,
      title: "Патерн: картки товарів",
      concept: "Гнучка сітка карток на flexbox: `flex-wrap: wrap` переносить картки, `gap` дає проміжки, а `flex: 1 1 200px` каже кожній картці «починай із 200px, рости й стискайся рівно з сусідами». На широкому екрані — кілька в ряд, на вузькому — по одній.",
      example: `.products { display: flex; flex-wrap: wrap; gap: 16px; }
.card { flex: 1 1 200px; }`,
      missionStory: "Крамниця доків викладає товари на прилавок. На великому прилавку — кілька в ряд, на маленькому — по одному, і завжди рівно.",
      worldEvent: "Прилавок доків став гнучким.",
      taskType: "write-markup",
      prompt: "Зроби `.products` гнучкою сіткою: перенесення рядків, проміжок `16px`, кожна `.card` — `flex: 1 1 200px`.",
      starterHtml: `<div class="products">
  <article class="card">Мотузка</article>
  <article class="card">Якір</article>
  <article class="card">Вітрило</article>
  <article class="card">Ліхтар</article>
</div>
`,
      starterCss: `.card {
  padding: 16px;
  background: #f3eee2;
  border: 1px solid #c9a86a;
}
`,
      testCases: [
        { name: "На 800px — по 3 в ряд, рівної ширини", check: (ctx) => { const c = ctx.$$(".card").map((e) => ctx.rect(e)); return { pass: perRow(ctx, ".card") === 3 && near(c[0].width, c[2].width), actual: perRow(ctx, ".card") + " в ряд", expected: "3 в ряд" }; } },
        { name: "На 400px — по одній на всю ширину", width: 400, check: (ctx) => ({ pass: perRow(ctx, ".card") === 1 && near(ctx.rect(".card").width, 384), actual: perRow(ctx, ".card") + " в ряд, ширина " + px(ctx.rect(".card").width), expected: "1 в ряд, ширина 384px" }) },
        { name: "Проміжки 16px", check: (ctx) => { const c = ctx.$$(".card").map((e) => ctx.rect(e)); return eq(ctx, px(c[1].left - c[0].right), "16px"); } },
      ],
      solution: { html: `<div class="products">
  <article class="card">Мотузка</article>
  <article class="card">Якір</article>
  <article class="card">Вітрило</article>
  <article class="card">Ліхтар</article>
</div>
`, css: `.products {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.card {
  flex: 1 1 200px;
  padding: 16px;
  background: #f3eee2;
  border: 1px solid #c9a86a;
}
` },
      hint: "Три властивості на контейнері (`display`, `flex-wrap`, `gap`) і одна на картці (`flex`).",
      difficulty: 2,
    }),
    L(3, {
      id: 16,
      title: "Патерн: центрування будь-чого",
      concept: "Модальне вікно, заглушка «порожньо», іконка в кнопці — будь-що центрується однаково: на батькові `display: flex; justify-content: center; align-items: center`. Для оверлею на весь екран — `position: fixed; inset: 0`.",
      example: `.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}`,
      missionStory: "Вікно «Корабель прибув!» вискакує в кутку екрана, і капітани його не помічають.",
      worldEvent: "Доки вишикувано в ідеальну лінію!",
      taskType: "fix-markup",
      prompt: "Відцентруй `.modal` (280×160) рівно посередині екрана всередині оверлею `.overlay`, використавши flexbox.",
      starterHtml: `<div class="overlay">
  <div class="modal">Корабель прибув!</div>
</div>
`,
      starterCss: `.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}

.modal {
  width: 280px;
  height: 160px;
  background: #ffffff;
}
`,
      testCases: [
        { name: "Вікно в центрі екрана (800×600)", check: (ctx) => { const m = ctx.rect(".modal"); const dx = m.left + m.width / 2 - 400, dy = m.top + m.height / 2 - 300; return { pass: near(dx, 0) && near(dy, 0), actual: "зсув " + px(dx) + ", " + px(dy), expected: "0px, 0px" }; } },
      ],
      codeChecks: [{ re: /display\s*:\s*flex/, label: "Використано flexbox", in: "css" }],
      solution: { html: `<div class="overlay">
  <div class="modal">Корабель прибув!</div>
</div>
`, css: `.overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
}

.modal {
  width: 280px;
  height: 160px;
  background: #ffffff;
}
` },
      hint: "Додай три рядки в `.overlay` — модальне вікно чіпати не треба.",
      difficulty: 1,
    }),

    /* ───────────── 4. Гридбург — CSS Grid ───────────── */
    L(4, {
      id: 17,
      title: "Колонки й рядки",
      concept: "`grid-template-columns: repeat(3, 1fr)` — три рівні колонки. `grid-template-rows: 100px auto` — перший рядок 100px, другий за вмістом. `fr` — частка вільного місця, `auto` — скільки потрібно вмісту.",
      example: `.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 100px auto;
}`,
      missionStory: "Ратуша Гридбурга планує дошку оголошень: три колонки, а верхній ряд — для великих анонсів фіксованої висоти.",
      worldEvent: "Дошку оголошень Гридбурга розлінійовано.",
      taskType: "write-markup",
      prompt: "Зроби `.board` (600px) сіткою з трьох рівних колонок і двох рядків: перший — `100px`, другий — `auto`.",
      starterHtml: `<div class="board">
  <div class="cell">Анонс 1</div><div class="cell">Анонс 2</div><div class="cell">Анонс 3</div>
  <div class="cell">Новина</div><div class="cell">Новина</div><div class="cell">Новина</div>
</div>
`,
      starterCss: `.board {
  width: 600px;
}

.cell {
  border: 1px solid #1b1612;
  background: #f3eee2;
}
`,
      testCases: [
        { name: "Три колонки по 200px", check: (ctx) => eq(ctx, ctx.$$(".cell").slice(0, 3).map((c) => px(ctx.rect(c).width)).join(" "), "200px 200px 200px") },
        { name: "Перший ряд — 100px заввишки", check: (ctx) => eq(ctx, px(ctx.rect(".cell").height), "100px") },
        { name: "Другий ряд — за вмістом", check: (ctx) => { const h = ctx.rect(ctx.$$(".cell")[3]).height; return { pass: h < 60 && ctx.style(".board", "display") === "grid", actual: px(h), expected: "висота тексту" }; } },
      ],
      solution: { html: `<div class="board">
  <div class="cell">Анонс 1</div><div class="cell">Анонс 2</div><div class="cell">Анонс 3</div>
  <div class="cell">Новина</div><div class="cell">Новина</div><div class="cell">Новина</div>
</div>
`, css: `.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 100px auto;
  width: 600px;
}

.cell {
  border: 1px solid #1b1612;
  background: #f3eee2;
}
` },
      hint: "`grid-template-columns: repeat(3, 1fr);` і `grid-template-rows: 100px auto;`.",
      difficulty: 1,
    }),
    L(4, {
      id: 18,
      title: "grid-template-areas",
      concept: "`grid-template-areas` малює макет «картинкою» з назв: кожен рядок у лапках — рядок сітки, повторена назва розтягує область. Елементи займають області через `grid-area`.",
      example: `.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-areas:
    "head head"
    "side main"
    "foot foot";
}
header { grid-area: head; }`,
      missionStory: "Ратуша затверджує план головної площі: шапка на всю ширину, алея ліворуч, площа праворуч, набережна внизу.",
      worldEvent: "План головної площі затверджено.",
      taskType: "write-markup",
      prompt: "Розклади `.page` областями: `header` на обидві колонки, далі `aside` (150px) і `main`, внизу `footer` на обидві колонки. Використай `grid-template-areas` і `grid-area`.",
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
        { name: "Шапка й підвал на всю ширину", check: (ctx) => { const w = ctx.rect(".page").width; return { pass: near(ctx.rect("header").width, w) && near(ctx.rect("footer").width, w), actual: px(ctx.rect("header").width) + " / " + px(ctx.rect("footer").width), expected: px(w) }; } },
        { name: "aside (150px) ліворуч від main", check: (ctx) => { const a = ctx.rect("aside"), m = ctx.rect("main"); return { pass: near(a.top, m.top) && near(a.width, 150) && a.right <= m.left + 1, actual: "aside " + px(a.width), expected: "aside 150px поруч із main" }; } },
        { name: "Підвал під main", check: (ctx) => ({ pass: ctx.rect("footer").top >= ctx.rect("main").bottom - 1, actual: px(ctx.rect("footer").top - ctx.rect("main").bottom), expected: "≥ 0px" }) },
      ],
      codeChecks: [
        { re: /grid-template-areas\s*:/, label: "Використано grid-template-areas", in: "css" },
        { re: /grid-area\s*:/, label: "Елементам задано grid-area", in: "css" },
      ],
      solution: { html: `<div class="page">
  <header>Шапка</header>
  <aside>Алея</aside>
  <main>Площа</main>
  <footer>Набережна</footer>
</div>
`, css: `.page {
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
` },
      hint: "Три рядки шаблону, у кожному дві назви: `\"head head\"`, `\"side main\"`, `\"foot foot\"`.",
      difficulty: 2,
    }),
    L(4, {
      id: 19,
      title: "Grid чи Flexbox",
      concept: "Flexbox — одновимірний: розкладає елементи в рядок або стовпчик і добре працює, коли розмір задає вміст (меню, тулбар, картка всередині). Grid — двовимірний: керує рядками й колонками одночасно (макет сторінки, галерея, dashboard). На практиці їх поєднують: сітка сторінки на Grid, а всередині блоків — Flexbox.",
      example: `.page { display: grid; grid-template-columns: 240px 1fr; } /* макет */
.page header { display: flex; justify-content: space-between; } /* шапка */`,
      missionStory: "Два архітектори Гридбурга сперечаються, чим будувати місто. Розсуди їх.",
      worldEvent: "Архітектори поділили роботу між Grid і Flexbox.",
      taskType: "multiple-choice",
      prompt: "Яке твердження найточніше?",
      options: [
        "Flexbox — для розкладки в одному вимірі (рядок або стовпчик), Grid — для двовимірних макетів; їх часто поєднують",
        "Grid застарів — сучасні сайти будують лише на Flexbox",
        "Flexbox потрібен лише для центрування, усе інше — тільки на Grid",
        "Grid і Flexbox не можна використовувати на одній сторінці",
      ],
      expectedAnswer: "Flexbox — для розкладки в одному вимірі (рядок або стовпчик), Grid — для двовимірних макетів; їх часто поєднують",
      exampleLang: "css",
      hint: "Подумай, скільки вимірів контролює кожен інструмент.",
      difficulty: 1,
    }),
    L(4, {
      id: 20,
      title: "Практика: галерея",
      concept: "Адаптивна галерея без медіазапитів: `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))`. Картинкам — `width: 100%`, однакові пропорції через `aspect-ratio` і `object-fit: cover`, щоб нічого не розтягувалось. Особливий кадр розтягують на дві колонки: `grid-column: span 2`.",
      example: `.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
}
.gallery img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }`,
      missionStory: "Музей Гридбурга відкриває галерею фото острова. Кадри мають стояти рівно на будь-якому екрані.",
      worldEvent: "Галерея Гридбурга відчинила двері.",
      taskType: "write-markup",
      prompt: "Зроби `.gallery` сіткою `repeat(auto-fill, minmax(160px, 1fr))` з проміжком `8px`; картинки — на всю ширину клітинки, пропорції `4 / 3`, `object-fit: cover`, `display: block`; кадр `.wide` займає 2 колонки.",
      starterHtml: `<div class="gallery">
  <img class="wide" src="panorama.svg" alt="Панорама острова">
  <img src="harbor.svg" alt="Причал">
  <img src="market.svg" alt="Ринок">
  <img src="lighthouse.svg" alt="Маяк">
  <img src="ship.svg" alt="Корабель">
  <img src="plan.svg" alt="План міста">
</div>
`,
      starterCss: `/* галерея */
`,
      testCases: [
        { name: "На 800px — 4 колонки", check: (ctx) => { const imgs = ctx.$$(".gallery img:not(.wide)").map((e) => ctx.rect(e)); const same = new Set(imgs.map((r) => Math.round(r.width))).size === 1; return eq(ctx, same ? Math.round((784 + 8) / (imgs[0].width + 8)) : 0, 4); } },
        { name: "На 400px — 2 колонки", width: 400, check: (ctx) => { const r = ctx.rect(".gallery img:not(.wide)"); return eq(ctx, Math.round((384 + 8) / (r.width + 8)), 2); } },
        { name: ".wide займає 2 колонки", check: (ctx) => { const w = ctx.rect(".wide").width, one = ctx.rect(".gallery img:not(.wide)").width; return { pass: near(w, one * 2 + 8), actual: px(w), expected: px(one * 2 + 8) }; } },
        { name: "Пропорції 4:3", check: (ctx) => { const r = ctx.rect(".gallery img:not(.wide)"); return { pass: near(r.height / r.width, 0.75, 0.02), actual: px(r.width) + " × " + px(r.height), expected: "4 : 3" }; } },
      ],
      solution: { html: `<div class="gallery">
  <img class="wide" src="panorama.svg" alt="Панорама острова">
  <img src="harbor.svg" alt="Причал">
  <img src="market.svg" alt="Ринок">
  <img src="lighthouse.svg" alt="Маяк">
  <img src="ship.svg" alt="Корабель">
  <img src="plan.svg" alt="План міста">
</div>
`, css: `.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
}

.gallery img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.gallery .wide {
  grid-column: span 2;
}
` },
      hint: "Пиши `.gallery .wide` — так правило буде специфічнішим за `.gallery img`. Пропорції — `aspect-ratio: 4 / 3`.",
      difficulty: 2,
    }),
    L(4, {
      id: 21,
      title: "Практика: dashboard-лейаут",
      concept: "Dashboard — ідеальний приклад поєднання: каркас (бокове меню на всю висоту, шапка, блоки графіка й таблиці) — на Grid з областями, а ряд карток статистики всередині — на Flexbox.",
      example: `.dash {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
  grid-template-areas:
    "side top   top"
    "side stats stats"
    "side chart table";
}
.stats { display: flex; gap: 12px; }`,
      missionStory: "Ратуша Гридбурга хоче панель керування містом: меню збоку, показники згори, графік і таблиця внизу.",
      worldEvent: "Гридбург розплановано — місто стоїть рівними кварталами!",
      taskType: "write-markup",
      prompt: "Зверстай `.dash` на Grid: колонки `200px 1fr 1fr`, області — `side` (меню на всю висоту), `top` (шапка), `stats` (показники на дві колонки), `chart` і `table` поруч. Картки `.stat` у `.stats` — у рядок на Flexbox, рівної ширини, з `gap: 12px`.",
      starterHtml: `<div class="dash">
  <aside class="side">Меню</aside>
  <header class="top">Панель міста</header>
  <section class="stats">
    <div class="stat">Мешканців: 1200</div>
    <div class="stat">Будинків: 340</div>
    <div class="stat">Мостів: 12</div>
  </section>
  <section class="chart">Графік</section>
  <section class="table">Таблиця</section>
</div>
`,
      starterCss: `.dash > * {
  padding: 12px;
  border: 1px solid #1b1612;
  background: #f3eee2;
}

.stat {
  padding: 8px;
  background: #ffe061;
}
`,
      testCases: [
        { name: "Меню на всю висоту зліва (200px)", check: (ctx) => { const s = ctx.rect(".side"), t = ctx.rect(".top"), tb = ctx.rect(".table"); return { pass: near(s.width, 200) && near(s.top, t.top) && near(s.bottom, tb.bottom), actual: px(s.width) + ", від " + px(s.top) + " до " + px(s.bottom), expected: "200px, від шапки до низу таблиці" }; } },
        { name: "Шапка й показники на дві колонки", check: (ctx) => { const t = ctx.rect(".top"), st = ctx.rect(".stats"), s = ctx.rect(".side"); return { pass: near(t.width, st.width) && t.left >= s.right - 1 && st.top > t.top, actual: px(t.width) + " / " + px(st.width), expected: "однакова ширина праворуч від меню" }; } },
        { name: "Графік і таблиця поруч", check: (ctx) => { const c = ctx.rect(".chart"), t = ctx.rect(".table"); return { pass: near(c.top, t.top) && c.right <= t.left + 1 && near(c.width, t.width), actual: "top " + px(c.top) + " / " + px(t.top), expected: "в одному ряду, рівні" }; } },
        { name: "Картки статистики в ряд на Flexbox, gap 12px", check: (ctx) => { const s = ctx.$$(".stat").map((e) => ctx.rect(e)); return { pass: ctx.style(".stats", "display") === "flex" && near(s[0].top, s[2].top) && near(s[0].width, s[1].width) && near(s[1].left - s[0].right, 12, 0.6), actual: ctx.style(".stats", "display") + ", проміжок " + px(s[1].left - s[0].right), expected: "flex, проміжок 12px" }; } },
      ],
      codeChecks: [
        { re: /grid-template-areas/, label: "Каркас на grid-template-areas", in: "css" },
        { re: /display\s*:\s*flex/, label: "Картки на Flexbox", in: "css" },
      ],
      solution: { html: `<div class="dash">
  <aside class="side">Меню</aside>
  <header class="top">Панель міста</header>
  <section class="stats">
    <div class="stat">Мешканців: 1200</div>
    <div class="stat">Будинків: 340</div>
    <div class="stat">Мостів: 12</div>
  </section>
  <section class="chart">Графік</section>
  <section class="table">Таблиця</section>
</div>
`, css: `.dash {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;
  grid-template-areas:
    "side top   top"
    "side stats stats"
    "side chart table";
}

.side { grid-area: side; }
.top { grid-area: top; }
.stats { grid-area: stats; display: flex; gap: 12px; }
.chart { grid-area: chart; }
.table { grid-area: table; }

.dash > * {
  padding: 12px;
  border: 1px solid #1b1612;
  background: #f3eee2;
}

.stat {
  flex: 1;
  padding: 8px;
  background: #ffe061;
}
` },
      hint: "Спершу шаблон областей на `.dash`, потім `grid-area` кожному блоку. Рівні картки — `flex: 1` на `.stat`.",
      difficulty: 3,
    }),

    /* ───────────── 5. Маяк адаптивності ───────────── */
    L(5, {
      id: 22,
      title: "Mobile-first",
      concept: "Mobile-first: базові стилі пишуться для телефона (одна колонка), а ширші екрани додаються медіазапитами `@media (min-width: …)`. Так телефон не завантажує й не перекриває зайвих десктопних правил, а CSS читається як «від простого до складного».",
      example: `.cards { display: grid; grid-template-columns: 1fr; }

@media (min-width: 768px) {
  .cards { grid-template-columns: repeat(3, 1fr); }
}`,
      missionStory: "Креслення маяка писали для великих екранів, а потім латали для телефонів. Переписуємо по-сучасному — з телефона.",
      worldEvent: "Креслення маяка переписано з телефона.",
      taskType: "fix-markup",
      prompt: "Перепиши CSS у стилі mobile-first: базово — одна колонка, а від `768px` (`min-width`) — три колонки. Медіазапитів з `max-width` лишатися не повинно.",
      starterHtml: `<div class="cards">
  <article class="card">Промінь</article>
  <article class="card">Лінза</article>
  <article class="card">Сходи</article>
</div>
`,
      starterCss: `.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 767px) {
  .cards {
    grid-template-columns: 1fr;
  }
}

.card { padding: 16px; background: #f3eee2; }
`,
      testCases: [
        { name: "На 400px — одна колонка", width: 400, check: (ctx) => eq(ctx, perRow(ctx, ".card"), 1) },
        { name: "На 900px — три колонки", width: 900, check: (ctx) => eq(ctx, perRow(ctx, ".card"), 3) },
      ],
      codeChecks: [
        { re: /@media\s*\(\s*min-width\s*:\s*768px\s*\)/, label: "Є @media (min-width: 768px)", in: "css" },
        { re: /@media[^{]*max-width/, not: true, label: "Немає медіазапитів з max-width", in: "css" },
      ],
      solution: { html: `<div class="cards">
  <article class="card">Промінь</article>
  <article class="card">Лінза</article>
  <article class="card">Сходи</article>
</div>
`, css: `.cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 768px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

.card { padding: 16px; background: #f3eee2; }
` },
      hint: "Поміняй місцями: «одна колонка» стає базою, а «три колонки» переїжджають у `@media (min-width: 768px)`.",
      difficulty: 2,
    }),
    L(5, {
      id: 23,
      title: "rem, em і %",
      concept: "`rem` — від розміру шрифту `html` (зазвичай 16px): шрифти й відступи масштабуються з налаштуваннями користувача. `em` — від шрифту самого елемента: внутрішні відступи кнопки ростуть разом із її текстом. `%` — частка від батька.",
      example: `.title { font-size: 2rem; }        /* 32px */
.btn { font-size: 20px; padding: 0.5em 1em; } /* 10px 20px */
.half { width: 50%; }`,
      missionStory: "Вивіски маяка однакові на всіх екранах — і на величезних, і в людей, які збільшили шрифт. Час на відносні одиниці.",
      worldEvent: "Вивіски маяка масштабуються разом із читачем.",
      taskType: "write-markup",
      prompt: "Задай: `.title` — `2rem`; `.note` — `0.875rem`; `.btn` (шрифт 20px уже задано) — відступи `0.5em 1em`; `.col` — ширина `50%` від `.row` (600px).",
      starterHtml: `<h2 class="title">Маяк адаптивності</h2>
<p class="note">Світло видно з будь-якого екрана.</p>
<button class="btn" type="button">Запалити</button>
<div class="row"><div class="col">Ліва половина</div></div>
`,
      starterCss: `html { font-size: 16px; }
.btn { font-size: 20px; }
.row { width: 600px; }
.col { background: #ffe061; }
`,
      testCases: [
        { name: ".title 32px, .note 14px", check: (ctx) => eq(ctx, ctx.style(".title", "font-size") + " " + ctx.style(".note", "font-size"), "32px 14px") },
        { name: ".btn відступи 10px 20px", check: (ctx) => eq(ctx, ctx.style(".btn", "padding-top") + " " + ctx.style(".btn", "padding-left"), "10px 20px") },
        { name: ".col — 300px", check: (ctx) => eq(ctx, px(ctx.rect(".col").width), "300px") },
      ],
      codeChecks: [
        { re: /\.title[^{]*\{[^}]*2rem/, label: ".title у rem", in: "css" },
        { re: /0\.5em\s+1em/, label: "Відступи кнопки в em", in: "css" },
      ],
      solution: { html: `<h2 class="title">Маяк адаптивності</h2>
<p class="note">Світло видно з будь-якого екрана.</p>
<button class="btn" type="button">Запалити</button>
<div class="row"><div class="col">Ліва половина</div></div>
`, css: `html { font-size: 16px; }
.title { font-size: 2rem; }
.note { font-size: 0.875rem; }
.btn { font-size: 20px; padding: 0.5em 1em; }
.row { width: 600px; }
.col { width: 50%; background: #ffe061; }
` },
      hint: "0.875 × 16 = 14. Відступи кнопки в `em` рахуються від її власних 20px.",
      difficulty: 2,
    }),
    L(5, {
      id: 24,
      title: "vw, vh і clamp()",
      concept: "`vw`/`vh` — відсотки від ширини/висоти вікна. `clamp(мін, бажане, макс)` обмежує значення з обох боків: `clamp(24px, 5vw, 48px)` — шрифт росте разом з екраном, але не менше 24px і не більше 48px. Жодного медіазапиту.",
      example: `h1 { font-size: clamp(24px, 5vw, 48px); }
.hero { min-height: 60vh; }`,
      missionStory: "Напис на маяку то крихітний на телефоні, то гігантський на моніторі. Нехай росте плавно, але в межах.",
      worldEvent: "Напис на маяку завжди читабельний.",
      taskType: "write-markup",
      prompt: "Задай `h1` розмір `clamp(24px, 5vw, 48px)`, а `.hero` — мінімальну висоту `50vh`.",
      starterHtml: `<section class="hero">
  <h1>Маяк адаптивності</h1>
</section>
`,
      starterCss: `.hero { background: #1f4a5a; color: white; }
`,
      testCases: [
        { name: "На 400px — 24px (нижня межа)", width: 400, check: (ctx) => eq(ctx, ctx.style("h1", "font-size"), "24px") },
        { name: "На 800px — 40px (5vw)", check: (ctx) => eq(ctx, ctx.style("h1", "font-size"), "40px") },
        { name: "На 1200px — 48px (верхня межа)", width: 1200, check: (ctx) => eq(ctx, ctx.style("h1", "font-size"), "48px") },
        { name: ".hero не нижче за половину вікна (300px)", check: (ctx) => ({ pass: ctx.rect(".hero").height >= 299.5, actual: px(ctx.rect(".hero").height), expected: "≥ 300px" }) },
      ],
      codeChecks: [{ re: /clamp\(/, label: "Використано clamp()", in: "css" }],
      solution: { html: `<section class="hero">
  <h1>Маяк адаптивності</h1>
</section>
`, css: `.hero { min-height: 50vh; background: #1f4a5a; color: white; }
h1 { font-size: clamp(24px, 5vw, 48px); }
` },
      hint: "Вікно тесту — 600px заввишки, тож `50vh` = 300px.",
      difficulty: 2,
    }),
    L(5, {
      id: 25,
      title: "Container queries",
      concept: "Медіазапит дивиться на ширину вікна, а компонент може жити і у вузькій колонці, і на всю сторінку. Container queries дивляться на ширину батька: батьку дають `container-type: inline-size`, а стилі пишуть у `@container (min-width: 400px) { … }`. Компонент адаптується сам, де б його не вставили.",
      example: `.slot { container-type: inline-size; }

@container (min-width: 400px) {
  .card { display: flex; gap: 12px; }
}`,
      missionStory: "Ту саму картку маяка вішають і на вузький стовп, і на широку стіну. На широкій вона має ставати горизонтальною — незалежно від екрана.",
      worldEvent: "Картки маяка підлаштовуються під будь-яку стіну.",
      taskType: "write-markup",
      prompt: "Зроби кожен `.slot` контейнером (`container-type: inline-size`). Якщо контейнер має щонайменше `400px`, `.card` стає flex-рядком із `gap: 12px`; у вужчому — лишається блоком.",
      starterHtml: `<div class="slot narrow">
  <article class="card"><img src="ship.svg" alt="Корабель"><p>Вузький стовп</p></article>
</div>
<div class="slot wide">
  <article class="card"><img src="ship.svg" alt="Корабель"><p>Широка стіна</p></article>
</div>
`,
      starterCss: `.narrow { width: 300px; }
.wide { width: 560px; }
.card { background: #f3eee2; padding: 8px; }
.card img { width: 120px; display: block; }
`,
      testCases: [
        { name: "У вузькому контейнері картка — блок", check: (ctx) => eq(ctx, ctx.style(".narrow .card", "display"), "block") },
        { name: "У широкому — flex із gap 12px", check: (ctx) => eq(ctx, ctx.style(".wide .card", "display") + " " + ctx.style(".wide .card", "column-gap"), "flex 12px") },
      ],
      codeChecks: [
        { re: /container-type\s*:\s*inline-size/, label: "Задано container-type", in: "css" },
        { re: /@container\s*\(\s*min-width\s*:\s*400px\s*\)/, label: "Є @container (min-width: 400px)", in: "css" },
      ],
      solution: { html: `<div class="slot narrow">
  <article class="card"><img src="ship.svg" alt="Корабель"><p>Вузький стовп</p></article>
</div>
<div class="slot wide">
  <article class="card"><img src="ship.svg" alt="Корабель"><p>Широка стіна</p></article>
</div>
`, css: `.slot { container-type: inline-size; }
.narrow { width: 300px; }
.wide { width: 560px; }
.card { background: #f3eee2; padding: 8px; }
.card img { width: 120px; display: block; }

@container (min-width: 400px) {
  .card {
    display: flex;
    gap: 12px;
  }
}
` },
      hint: "Контейнер — `.slot`, а стилізуємо `.card` всередині нього.",
      difficulty: 3,
    }),
    L(5, {
      id: 26,
      title: "Тестування на екранах",
      concept: "Режим пристроїв у DevTools швидко показує різні ширини й імітує дотики, але це все одно десктопний браузер на потужному комп'ютері. Справжній телефон покаже реальну швидкість, роботу пальцем, екранну клавіатуру, яка з'їдає пів екрана, і особливості мобільного Safari. Хороша практика — і те, і інше.",
      example: `/* DevTools: Ctrl+Shift+M — режим пристроїв
   + перевірка на реальному телефоні через локальну мережу */`,
      exampleLang: "css",
      missionStory: "Доглядач маяка перевіряє світло лише з вікна своєї вежі. Чи достатньо цього?",
      worldEvent: "Маяк засяяв — острів видно з будь-якого екрана!",
      taskType: "multiple-choice",
      prompt: "Що режим пристроїв у DevTools НЕ покаже надійно?",
      options: [
        "Реальну швидкодію на слабкому телефоні, роботу пальцем і поведінку екранної клавіатури",
        "Як виглядає сторінка на ширині 375px",
        "Чи спрацьовують медіазапити на різних ширинах",
        "Чи не з'являється горизонтальна прокрутка",
      ],
      expectedAnswer: "Реальну швидкодію на слабкому телефоні, роботу пальцем і поведінку екранної клавіатури",
      hint: "DevTools імітує розмір екрана, але не залізо й не справжню взаємодію.",
      difficulty: 1,
    }),

    /* ───────────── 6. Палітрова майстерня — CSS-змінні ───────────── */
    L(6, {
      id: 27,
      title: "Змінні в :root",
      concept: "Custom properties (`--назва: значення`) оголошують у `:root` — тоді вони доступні всій сторінці — і читають через `var(--назва)`. Кольори, відступи, радіуси задаються в одному місці: зміниш значення — зміниться весь сайт.",
      example: `:root {
  --color-primary: #e8663d;
  --radius: 8px;
}
.btn {
  background: var(--color-primary);
  border-radius: var(--radius);
}`,
      missionStory: "Палітрова майстерня відкривається. Перший крок майстра — розкласти фарби по підписаних баночках.",
      worldEvent: "Фарби майстерні розкладено по підписаних баночках.",
      taskType: "write-markup",
      prompt: "Оголоси в `:root` змінні `--color-primary: #e8663d`, `--radius: 8px`, `--space: 12px` і використай їх у `.btn`: фон, заокруглення кутів і внутрішній відступ.",
      starterHtml: `<button class="btn" type="button">Змішати фарбу</button>
`,
      starterCss: `.btn {
  border: 0;
  color: white;
}
`,
      testCases: [
        { name: "Змінні оголошено в :root", check: (ctx) => { const r = ctx.win.getComputedStyle(ctx.doc.documentElement); const v = ["--color-primary", "--radius", "--space"].map((n) => r.getPropertyValue(n).trim()); return eq(ctx, v.join(" "), "#e8663d 8px 12px"); } },
        { name: "Кнопка використовує змінні", check: (ctx) => eq(ctx, [ctx.style(".btn", "background-color"), ctx.style(".btn", "border-top-left-radius"), ctx.style(".btn", "padding-top")].join(" "), "rgb(232, 102, 61) 8px 12px") },
      ],
      codeChecks: [
        { re: /var\(--color-primary\)/, label: "Кнопка читає var(--color-primary)", in: "css" },
        { re: /var\(--space\)/, label: "Відступ із var(--space)", in: "css" },
      ],
      solution: { html: `<button class="btn" type="button">Змішати фарбу</button>
`, css: `:root {
  --color-primary: #e8663d;
  --radius: 8px;
  --space: 12px;
}

.btn {
  background: var(--color-primary);
  border-radius: var(--radius);
  padding: var(--space);
  border: 0;
  color: white;
}
` },
      hint: "Оголошення — `--space: 12px;` у `:root`, використання — `padding: var(--space);`.",
      difficulty: 1,
    }),
    L(6, {
      id: 28,
      title: "Рефакторинг на змінні",
      concept: "Захардкоджений колір, повторений у десяти місцях, — пастка: клієнт попросить інший відтінок, і ти щось пропустиш. Рефакторинг: винеси значення в змінну й заміни всі повтори на `var()`. Перевірка проста — зміни змінну, і весь сайт має перефарбуватися.",
      example: `/* було */
h1 { color: #2a85c4; } a { color: #2a85c4; }
/* стало */
:root { --accent: #2a85c4; }
h1, a { color: var(--accent); }`,
      missionStory: "Клієнт майстерні передумав щодо фірмового кольору. А він вписаний у стіни в чотирьох місцях…",
      worldEvent: "Фірмовий колір майстерні тепер міняється одним рухом.",
      taskType: "fix-markup",
      prompt: "Заміни всі чотири повтори кольору `#2a85c4` змінною `--accent`, оголошеною в `:root`. Код `#2a85c4` має лишитися в CSS лише один раз — в оголошенні змінної.",
      starterHtml: `<h1>Палітрова майстерня</h1>
<a href="#order">Замовити</a>
<button class="btn" type="button">Кошик</button>
<div class="card">Акція тижня</div>
`,
      starterCss: `h1 { color: #2a85c4; }
a { color: #2a85c4; }
.btn { background: #2a85c4; color: white; border: 0; padding: 8px 12px; }
.card { border-top: 4px solid #2a85c4; padding: 12px; background: #f3eee2; }
`,
      testCases: [
        { name: "Зараз усе фірмового кольору", check: (ctx) => { const c = ctx.color("#2a85c4"); return eq(ctx, [ctx.style("h1", "color"), ctx.style("a", "color"), ctx.style(".btn", "background-color"), ctx.style(".card", "border-top-color")].every((v) => v === c), true); } },
        { name: "Зміна --accent перефарбовує всі 4 місця", check: (ctx) => { ctx.doc.documentElement.style.setProperty("--accent", "rgb(255, 0, 0)"); const v = [ctx.style("h1", "color"), ctx.style("a", "color"), ctx.style(".btn", "background-color"), ctx.style(".card", "border-top-color")]; return { pass: v.every((x) => x === "rgb(255, 0, 0)"), actual: v.filter((x) => x === "rgb(255, 0, 0)").length + " з 4", expected: "4 з 4" }; } },
        { name: "Колір записано лише один раз", check: (ctx) => eq(ctx, (ctx.css.replace(/\/\*[\s\S]*?\*\//g, "").match(/#2a85c4/gi) || []).length, 1) },
      ],
      solution: { html: `<h1>Палітрова майстерня</h1>
<a href="#order">Замовити</a>
<button class="btn" type="button">Кошик</button>
<div class="card">Акція тижня</div>
`, css: `:root { --accent: #2a85c4; }

h1 { color: var(--accent); }
a { color: var(--accent); }
.btn { background: var(--accent); color: white; border: 0; padding: 8px 12px; }
.card { border-top: 4px solid var(--accent); padding: 12px; background: #f3eee2; }
` },
      hint: "Додай `:root { --accent: #2a85c4; }`, потім заміни кожен `#2a85c4` нижче на `var(--accent)`.",
      difficulty: 2,
    }),
    L(6, {
      id: 29,
      title: "Перемикач теми",
      concept: "Темна тема на змінних: у `:root` — світлі значення, у `[data-theme=\"dark\"]` — темні. Увесь сайт читає лише змінні, тож скрипту досить поміняти один атрибут на `<html>`: `document.documentElement.dataset.theme = \"dark\"`.",
      example: `:root { --bg: #ffffff; --text: #1b1612; }
[data-theme="dark"] { --bg: #121314; --text: #f3f2ee; }
body { background: var(--bg); color: var(--text); }`,
      missionStory: "Майстерня працює і вдень, і вночі. Нічній зміні потрібна темна тема, що вмикається одним перемикачем.",
      worldEvent: "Майстерня вміє перемикатися між днем і ніччю.",
      taskType: "write-markup",
      prompt: "Скрипт перемикача (`theme.js`, лише для читання) уже готовий: він ставить `data-theme=\"dark\"` на `<html>`. Напиши CSS: у `:root` — `--bg: #ffffff` і `--text: #1b1612`, у `[data-theme=\"dark\"]` — `--bg: #121314` і `--text: #f3f2ee`; `body` бере фон і колір тексту зі змінних.",
      readonlyFiles: [{ name: "theme.js", code: `const toggle = document.querySelector(".theme-toggle");
toggle.addEventListener("click", () => {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
});` }],
      starterHtml: `<header>
  <button class="theme-toggle" type="button" aria-label="Перемкнути тему">◐</button>
</header>
<main>
  <p>Нічна зміна палітрової майстерні.</p>
</main>
`,
      starterCss: `/* змінні теми */
`,
      testCases: [
        { name: "Світла тема за замовчуванням", check: (ctx) => eq(ctx, ctx.style("body", "background-color") + " / " + ctx.style("body", "color"), ctx.color("#ffffff") + " / " + ctx.color("#1b1612")) },
        { name: "data-theme=\"dark\" вмикає темну", check: (ctx) => { ctx.doc.documentElement.dataset.theme = "dark"; return eq(ctx, ctx.style("body", "background-color") + " / " + ctx.style("body", "color"), ctx.color("#121314") + " / " + ctx.color("#f3f2ee")); } },
      ],
      codeChecks: [{ re: /\[data-theme=["']?dark["']?\]/, label: "Є правило [data-theme=\"dark\"]", in: "css" }],
      solution: { html: `<header>
  <button class="theme-toggle" type="button" aria-label="Перемкнути тему">◐</button>
</header>
<main>
  <p>Нічна зміна палітрової майстерні.</p>
</main>
`, css: `:root {
  --bg: #ffffff;
  --text: #1b1612;
}

[data-theme="dark"] {
  --bg: #121314;
  --text: #f3f2ee;
}

body {
  background: var(--bg);
  color: var(--text);
}
` },
      hint: "Темні значення перевизначають ті самі змінні, а не стилі `body`.",
      difficulty: 2,
    }),
    L(6, {
      id: 30,
      title: "Glassmorphism на змінних",
      concept: "Скляний ефект — це напівпрозорий фон (`rgba`), розмиття того, що позаду (`backdrop-filter: blur()`), тонка світла рамка й заокруглення. Параметри зручно винести в змінні, щоб підкручувати «скло» в одному місці для всього дизайну.",
      example: `:root { --glass-bg: rgba(255, 255, 255, 0.18); --glass-blur: 12px; }
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid rgba(255, 255, 255, 0.35);
}`,
      missionStory: "Вітрина майстерні має бути зі скла — крізь неї видно острів, але розмито, як у модних дизайнах.",
      worldEvent: "Майстерня змішала палітру — острів міняє тему одним рухом!",
      taskType: "write-markup",
      prompt: "Оголоси `--glass-bg: rgba(255, 255, 255, 0.18)` і `--glass-blur: 12px` у `:root`. Зроби `.glass`: фон зі змінної, `backdrop-filter: blur(var(--glass-blur))`, рамка `1px solid rgba(255, 255, 255, 0.35)`, заокруглення `16px`.",
      starterHtml: `<section class="scene">
  <div class="glass">Скляна вітрина</div>
</section>
`,
      starterCss: `.scene {
  padding: 40px;
  background: url("panorama.svg") center / cover;
}

.glass {
  padding: 24px;
  color: white;
}
`,
      testCases: [
        { name: "Розмиття позаду 12px", check: (ctx) => eq(ctx, ctx.style(".glass", "backdrop-filter"), "blur(12px)") },
        { name: "Напівпрозорий фон 0.18", check: (ctx) => eq(ctx, ctx.style(".glass", "background-color"), "rgba(255, 255, 255, 0.18)") },
        { name: "Рамка 1px і кути 16px", check: (ctx) => eq(ctx, ctx.style(".glass", "border-top-width") + " " + ctx.style(".glass", "border-top-left-radius"), "1px 16px") },
      ],
      codeChecks: [{ re: /var\(--glass-blur\)/, label: "Розмиття бере змінну --glass-blur", in: "css" }],
      solution: { html: `<section class="scene">
  <div class="glass">Скляна вітрина</div>
</section>
`, css: `:root {
  --glass-bg: rgba(255, 255, 255, 0.18);
  --glass-blur: 12px;
}

.scene {
  padding: 40px;
  background: url("panorama.svg") center / cover;
}

.glass {
  padding: 24px;
  color: white;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 16px;
}
` },
      hint: "Усе потрібне — в одному правилі `.glass` плюс дві змінні в `:root`.",
      difficulty: 2,
    }),

    /* ───────────── 7. Ярмарок анімацій — анімації та переходи ───────────── */
    L(7, {
      id: 31,
      title: "transition",
      concept: "`transition` плавно змінює властивість між двома станами (наприклад, звичайним і `:hover`): `transition: background-color 0.3s ease`. Перелічуй конкретні властивості замість `all` — так браузер не анімує зайвого, а ти контролюєш, що саме рухається.",
      example: `.btn {
  background: tomato;
  transition: background-color 0.3s ease;
}
.btn:hover { background: crimson; }`,
      missionStory: "Ярмаркові ліхтарі перемикаються різко, аж очі болять. Нехай кольори перетікають плавно.",
      worldEvent: "Ліхтарі ярмарку засвітились плавно.",
      taskType: "write-markup",
      prompt: "Додай `.btn` плавний перехід лише кольору фону: `transition: background-color 0.3s ease`. Стан `:hover` уже є. Не використовуй `all`.",
      starterHtml: `<a class="btn" href="#tickets">Квитки на ярмарок</a>
`,
      starterCss: `.btn {
  display: inline-block;
  padding: 10px 18px;
  background: #e8663d;
  color: #ffffff;
}

.btn:hover {
  background: #c4472a;
}
`,
      testCases: [
        { name: "Анімується лише background-color", check: (ctx) => eq(ctx, ctx.style(".btn", "transition-property"), "background-color") },
        { name: "Тривалість 0.3s, ease", check: (ctx) => eq(ctx, ctx.style(".btn", "transition-duration") + " " + ctx.style(".btn", "transition-timing-function"), "0.3s ease") },
      ],
      codeChecks: [{ re: /transition[^;:]*:\s*all/, not: true, label: "Без transition: all", in: "css" }],
      solution: { html: `<a class="btn" href="#tickets">Квитки на ярмарок</a>
`, css: `.btn {
  display: inline-block;
  padding: 10px 18px;
  background: #e8663d;
  color: #ffffff;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background: #c4472a;
}
` },
      hint: "`transition` пишеться на звичайному стані `.btn`, а не на `:hover` — тоді перехід плавний в обидва боки.",
      difficulty: 1,
    }),
    L(7, {
      id: 32,
      title: "transform",
      concept: "`transform` зсуває (`translate`), обертає (`rotate`), масштабує (`scale`) елемент, не чіпаючи розкладку: сусіди не зсуваються. Функції можна поєднувати: `transform: translateY(-10px) rotate(5deg)`. Порядок має значення — вони застосовуються справа наліво.",
      example: `.tilt { transform: rotate(-5deg); }
.grow { transform: scale(1.2); }
.lift { transform: translateY(-10px); }`,
      missionStory: "Вивіски ярмаркових ятер висять рівно й нудно. Нахили одну, збільш іншу, а третю підніми.",
      worldEvent: "Ятки ярмарку отримали веселі вивіски.",
      taskType: "write-markup",
      prompt: "Задай: `.tilt` — поворот на `-5deg`, `.grow` — збільшення в `1.2` раза, `.lift` — підйом на `10px` угору (`translateY`). Сусідні ятки не мають зрушити з місця.",
      starterHtml: `<div class="stalls">
  <div class="stall tilt">Цукрова вата</div>
  <div class="stall grow">Карусель</div>
  <div class="stall lift">Тир</div>
</div>
`,
      starterCss: `.stalls {
  display: flex;
  gap: 24px;
  padding: 24px;
}

.stall {
  padding: 12px;
  background: #ffe061;
}
`,
      testCases: [
        { name: ".tilt повернуто на -5°", check: (ctx) => eq(ctx, ctx.transform(".tilt").angle, -5) },
        { name: ".grow збільшено в 1.2 раза", check: (ctx) => eq(ctx, ctx.transform(".grow").scaleX, 1.2) },
        { name: ".lift піднято на 10px", check: (ctx) => eq(ctx, ctx.transform(".lift").y, -10) },
        { name: "Розкладка не змінилась (лише transform)", check: (ctx) => eq(ctx, ["top", "margin-top", "position"].map((p) => ctx.style(".lift", p)).join(" "), "auto 0px static") },
      ],
      solution: { html: `<div class="stalls">
  <div class="stall tilt">Цукрова вата</div>
  <div class="stall grow">Карусель</div>
  <div class="stall lift">Тир</div>
</div>
`, css: `.stalls {
  display: flex;
  gap: 24px;
  padding: 24px;
}

.stall {
  padding: 12px;
  background: #ffe061;
}

.tilt { transform: rotate(-5deg); }
.grow { transform: scale(1.2); }
.lift { transform: translateY(-10px); }
` },
      hint: "Угору — це від'ємне значення: `translateY(-10px)`.",
      difficulty: 1,
    }),
    L(7, {
      id: 33,
      title: "@keyframes",
      concept: "`@keyframes` описує анімацію покадрово (`0%`, `50%`, `100%` або `from`/`to`), а властивість `animation` запускає її: назва, тривалість, плавність, кількість повторів. `infinite` — безкінечно, `alternate` — туди й назад.",
      example: `@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
.balloon { animation: float 3s ease-in-out infinite; }`,
      missionStory: "Повітряна куля ярмарку стоїть на землі, мов камінь. Нехай погойдується в повітрі.",
      worldEvent: "Над ярмарком погойдується повітряна куля.",
      taskType: "write-markup",
      prompt: "Створи `@keyframes float`: на `0%` і `100%` — `translateY(0)`, на `50%` — `translateY(-20px)`. Запусти на `.balloon`: `3s`, `ease-in-out`, безкінечно.",
      starterHtml: `<div class="sky">
  <div class="balloon">🎈</div>
</div>
`,
      starterCss: `.sky {
  height: 160px;
  padding-top: 40px;
  background: #cfe8f7;
}

.balloon {
  width: 60px;
  font-size: 48px;
}
`,
      testCases: [
        { name: "@keyframes float з кадром 50% → translateY(-20px)", check: (ctx) => { const k = ctx.keyframes("float"); const mid = k && k.findRule("50%"); return { pass: !!mid && mid.style.transform === "translateY(-20px)" && Array.from(k.cssRules).some((r) => /(^|,s*)(0%|from)/.test(r.keyText)), actual: k ? (mid ? "50%: " + mid.style.transform : "немає кадру 50%") : "keyframes float немає", expected: "50%: translateY(-20px)" }; } },
        { name: ".balloon: float 3s ease-in-out infinite", check: (ctx) => eq(ctx, ["animation-name", "animation-duration", "animation-timing-function", "animation-iteration-count"].map((p) => ruleProp(ctx, /^.balloon$/, p)).join(" "), "float 3s ease-in-out infinite") },
      ],
      solution: { html: `<div class="sky">
  <div class="balloon">🎈</div>
</div>
`, css: `.sky {
  height: 160px;
  padding-top: 40px;
  background: #cfe8f7;
}

.balloon {
  width: 60px;
  font-size: 48px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}
` },
      hint: "Кадри 0% і 100% можна записати разом: `0%, 100% { … }`.",
      difficulty: 2,
    }),
    L(7, {
      id: 34,
      title: "Практика: hover-картка",
      concept: "Жива картка товару: при наведенні вона піднімається (`transform: translateY`) і отримує тінь, а фото всередині трохи збільшується (`scale`), не вилазячи за краї завдяки `overflow: hidden`. Анімуємо лише `transform` і `box-shadow` — розкладка сторінки не стрибає.",
      example: `.card { overflow: hidden; transition: transform 0.3s, box-shadow 0.3s; }
.card:hover { transform: translateY(-6px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2); }
.card:hover img { transform: scale(1.1); }`,
      missionStory: "Ятка сувенірів хоче, щоб кожен товар «підстрибував» назустріч покупцю.",
      worldEvent: "Сувеніри ярмарку підстрибують назустріч гостям.",
      taskType: "write-markup",
      prompt: "`.card`: `overflow: hidden`, перехід для `transform` і `box-shadow` (`0.3s`). `.card:hover` — `translateY(-6px)` і тінь `0 12px 24px rgba(0, 0, 0, 0.2)`. `.card:hover img` — `scale(1.1)`; самому `img` теж додай перехід `transform 0.3s`.",
      starterHtml: `<article class="card">
  <img src="market.svg" alt="Сувенірна ятка">
  <h3>Сувенір «Карусель»</h3>
</article>
`,
      starterCss: `.card {
  width: 240px;
  background: #ffffff;
  border: 1px solid #e2cf8e;
}

.card img {
  display: block;
  width: 100%;
}
`,
      testCases: [
        { name: ".card: overflow hidden і перехід transform + box-shadow", check: (ctx) => { const p = ctx.style(".card", "transition-property"); return { pass: ctx.style(".card", "overflow") === "hidden" && /transform/.test(p) && /box-shadow/.test(p), actual: ctx.style(".card", "overflow") + "; " + p, expected: "hidden; transform, box-shadow" }; } },
        { name: ".card:hover піднімає й дає тінь", check: (ctx) => { const t = ruleProp(ctx, /^\.card:hover$/, "transform"), s = ruleProp(ctx, /^\.card:hover$/, "box-shadow"); return { pass: t === "translateY(-6px)" && /12px 24px/.test(s), actual: (t || "—") + "; " + (s || "—"), expected: "translateY(-6px); 0 12px 24px …" }; } },
        { name: "Фото збільшується при наведенні, плавно", check: (ctx) => { const t = ruleProp(ctx, /^\.card:hover img$/, "transform"); return { pass: t === "scale(1.1)" && /transform/.test(ctx.style(".card img", "transition-property")), actual: (t || "—") + "; перехід: " + ctx.style(".card img", "transition-property"), expected: "scale(1.1); перехід: transform" }; } },
      ],
      solution: { html: `<article class="card">
  <img src="market.svg" alt="Сувенірна ятка">
  <h3>Сувенір «Карусель»</h3>
</article>
`, css: `.card {
  width: 240px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid #e2cf8e;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.card img {
  display: block;
  width: 100%;
  transition: transform 0.3s;
}

.card:hover img {
  transform: scale(1.1);
}
` },
      hint: "Перехід — на звичайних станах (`.card`, `.card img`), нові значення — на `:hover`.",
      difficulty: 2,
    }),
    L(7, {
      id: 35,
      title: "Практика: анімована кнопка",
      concept: "Хороша анімована кнопка «відгукується» на натискання (`:active` → `scale(0.95)`), а пульсація привертає увагу. Але частину людей рух нудить чи відволікає: вони вмикають у системі «зменшити рух». Медіазапит `@media (prefers-reduced-motion: reduce)` вимикає для них анімації та переходи.",
      example: `@media (prefers-reduced-motion: reduce) {
  .btn {
    animation: none;
    transition: none;
  }
}`,
      missionStory: "Головна кнопка ярмарку «Купити квиток» має пульсувати й пружинити — але не мучити тих, кому рух шкодить.",
      worldEvent: "Ярмарок ожив — каруселі крутяться, кулі злітають!",
      taskType: "write-markup",
      prompt: "`.btn`: `transition: transform 0.15s`; `.btn:active` — `scale(0.95)`. Створи `@keyframes pulse` (на `50%` — `scale(1.05)`) і запусти на `.btn--pulse`: `pulse 2s infinite`. У `@media (prefers-reduced-motion: reduce)` вимкни для `.btn` і `.btn--pulse` і `animation`, і `transition` (`none`).",
      starterHtml: `<button class="btn btn--pulse" type="button">Купити квиток</button>
`,
      starterCss: `.btn {
  padding: 12px 20px;
  border: 0;
  border-radius: 999px;
  background: #e8663d;
  color: #ffffff;
  font: inherit;
}
`,
      testCases: [
        { name: ":active стискає кнопку до 0.95", check: (ctx) => eq(ctx, ruleProp(ctx, /\.btn:active/, "transform"), "scale(0.95)") },
        { name: ".btn--pulse пульсує: pulse 2s infinite", check: (ctx) => { const k = ctx.keyframes("pulse"); const mid = k && k.findRule("50%"); const a = ["animation-name", "animation-duration", "animation-iteration-count"].map((p) => ruleProp(ctx, /^.btn--pulse$/, p)).join(" "); return { pass: !!mid && mid.style.transform === "scale(1.05)" && a === "pulse 2s infinite", actual: (a.trim() || "анімації немає") + (mid ? "" : ", кадру 50% немає"), expected: "pulse 2s infinite" }; } },
        { name: "prefers-reduced-motion вимикає анімацію й перехід", check: (ctx) => { const inMedia = ctx.rules(/\.btn/).filter((r) => r.media && /prefers-reduced-motion:\s*reduce/.test(r.media)); const anim = inMedia.some((r) => /btn--pulse/.test(r.rule.selectorText) && r.rule.style.getPropertyValue("animation-name") === "none"); const tr = inMedia.some((r) => /\.btn(?![\w-])/.test(r.rule.selectorText) && r.rule.style.getPropertyValue("transition-property") === "none"); return { pass: anim && tr, actual: "анімація: " + (anim ? "вимкнено" : "ні") + ", перехід: " + (tr ? "вимкнено" : "ні"), expected: "анімація: вимкнено, перехід: вимкнено" }; } },
      ],
      solution: { html: `<button class="btn btn--pulse" type="button">Купити квиток</button>
`, css: `.btn {
  padding: 12px 20px;
  border: 0;
  border-radius: 999px;
  background: #e8663d;
  color: #ffffff;
  font: inherit;
  transition: transform 0.15s;
}

.btn:active {
  transform: scale(0.95);
}

.btn--pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  50% {
    transform: scale(1.05);
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn,
  .btn--pulse {
    animation: none;
    transition: none;
  }
}
` },
      hint: "Кадри 0% і 100% можна не писати — браузер візьме звичайний стан. Медіазапит — у самому кінці файлу.",
      difficulty: 3,
    }),

    /* ───────────── 8. Сад доступності — a11y ───────────── */
    L(8, {
      id: 36,
      title: "ARIA-атрибути",
      concept: "Кнопка-іконка «✕» для програми читання екрана — просто «кнопка». `aria-label` дає їй назву («Закрити»). Декоративні іконки біля тексту ховають від озвучення: `aria-hidden=\"true\"`. `aria-current=\"page\"` позначає поточну сторінку в меню, а `aria-label` на `nav` відрізняє кілька навігацій. Головне правило ARIA: спершу правильний HTML-тег, ARIA — лише там, де тегу не вистачає.",
      example: `<button aria-label="Закрити">✕</button>
<a href="/"><span aria-hidden="true">🏠</span> Головна</a>
<a href="/garden" aria-current="page">Сад</a>`,
      missionStory: "Незряча гостя саду чує лише «кнопка, кнопка, квітка, кнопка». Дамо кожному елементу зрозумілий голос.",
      worldEvent: "Сад заговорив зрозумілою мовою.",
      taskType: "fix-markup",
      prompt: "Дай кожній `.icon-btn` назву через `aria-label`; сховай декоративні `.icon` від озвучення (`aria-hidden=\"true\"`); познач поточний пункт меню `.is-active` як `aria-current=\"page\"`; дай `nav` назву `aria-label=\"Головне меню\"`.",
      starterHtml: `<header class="bar">
  <button class="icon-btn" type="button">☰</button>
  <a class="logo" href="#"><span class="icon">🌸</span> Сад доступності</a>
  <button class="icon-btn" type="button">🔍</button>
</header>
<nav>
  <a class="is-active" href="#paths">Стежки</a>
  <a href="#benches">Лавки</a>
</nav>
<div class="notice">
  <p>Сад відкрито щодня.</p>
  <button class="icon-btn" type="button">✕</button>
</div>
`,
      starterCss: null,
      testCases: [
        { name: "Кожна кнопка-іконка має aria-label", check: (ctx) => { const miss = ctx.$$(".icon-btn").filter((b) => (b.getAttribute("aria-label") || "").trim().length < 3); return { pass: !miss.length, actual: miss.length ? "без назви: " + miss.map((b) => b.textContent.trim()).join(" ") : "усі з назвою", expected: "усі з назвою" }; } },
        { name: "Декоративні іконки приховано", check: (ctx) => eq(ctx, ctx.$$(".icon").every((i) => i.getAttribute("aria-hidden") === "true"), true) },
        { name: "Поточний пункт — aria-current=\"page\"", check: (ctx) => eq(ctx, ctx.attr(".is-active", "aria-current"), "page") },
        { name: "nav має aria-label", check: (ctx) => eq(ctx, ctx.attr("nav", "aria-label"), "Головне меню") },
      ],
      solution: { html: `<header class="bar">
  <button class="icon-btn" type="button" aria-label="Відкрити меню">☰</button>
  <a class="logo" href="#"><span class="icon" aria-hidden="true">🌸</span> Сад доступності</a>
  <button class="icon-btn" type="button" aria-label="Пошук">🔍</button>
</header>
<nav aria-label="Головне меню">
  <a class="is-active" href="#paths" aria-current="page">Стежки</a>
  <a href="#benches">Лавки</a>
</nav>
<div class="notice">
  <p>Сад відкрито щодня.</p>
  <button class="icon-btn" type="button" aria-label="Закрити">✕</button>
</div>
` },
      hint: "Назва кнопки має описувати дію: «Відкрити меню», «Пошук», «Закрити».",
      difficulty: 1,
    }),
    L(8, {
      id: 37,
      title: "Контраст кольорів",
      concept: "WCAG вимагає контраст тексту з фоном щонайменше 4.5 : 1 для звичайного тексту (3 : 1 — для великого). Світло-сірий на білому чи білий на жовтому виглядають «стильно», але погано читаються на сонці, на слабкому екрані й людьми зі слабким зором. Перевірити можна в DevTools: інспектор показує контраст поруч із кольором.",
      example: `/* 2.3 : 1 — погано */ color: #aaaaaa;
/* 7.0 : 1 — добре  */ color: #595959;`,
      missionStory: "Таблички в саду вицвіли: сірі літери на білому, білі на жовтому. Гості мружаться й проходять повз.",
      worldEvent: "Таблички саду читаються навіть на сонці.",
      taskType: "fix-markup",
      prompt: "Зміни лише колір тексту (`color`), щоб `.muted`, `.btn` і `.note` мали контраст щонайменше 4.5 з їхнім фоном. Фони не чіпай.",
      starterHtml: `<p class="muted">Вхід вільний для всіх гостей.</p>
<a class="btn" href="#tour">Екскурсія</a>
<div class="dark-card">
  <p class="note">Сад працює з 8:00 до 20:00.</p>
</div>
`,
      starterCss: `.muted { color: #aaaaaa; }

.btn {
  display: inline-block;
  padding: 10px 16px;
  background: #f7b733;
  color: #ffffff;
}

.dark-card {
  padding: 16px;
  background: #2a2f36;
}

.note { color: #555b63; }
`,
      testCases: [
        { name: ".muted ≥ 4.5", check: (ctx) => ({ pass: ctx.contrast(".muted") >= 4.5, actual: ctx.contrast(".muted") + " : 1", expected: "≥ 4.5 : 1" }) },
        { name: ".btn ≥ 4.5", check: (ctx) => ({ pass: ctx.contrast(".btn") >= 4.5, actual: ctx.contrast(".btn") + " : 1", expected: "≥ 4.5 : 1" }) },
        { name: ".note ≥ 4.5", check: (ctx) => ({ pass: ctx.contrast(".note") >= 4.5, actual: ctx.contrast(".note") + " : 1", expected: "≥ 4.5 : 1" }) },
        { name: "Фони не змінено", check: (ctx) => eq(ctx, ctx.style(".btn", "background-color") + " / " + ctx.style(".dark-card", "background-color"), "rgb(247, 183, 51) / rgb(42, 47, 54)") },
      ],
      solution: { html: `<p class="muted">Вхід вільний для всіх гостей.</p>
<a class="btn" href="#tour">Екскурсія</a>
<div class="dark-card">
  <p class="note">Сад працює з 8:00 до 20:00.</p>
</div>
`, css: `.muted { color: #595959; }

.btn {
  display: inline-block;
  padding: 10px 16px;
  background: #f7b733;
  color: #1b1612;
}

.dark-card {
  padding: 16px;
  background: #2a2f36;
}

.note { color: #e6e6e6; }
` },
      hint: "На світлому фоні текст має бути темним, на темному — світлим. На жовтій кнопці білий текст не врятувати — зроби його темним.",
      difficulty: 2,
    }),
    L(8, {
      id: 38,
      title: "Клавіатурна навігація",
      concept: "Сайтом мають користуватися без миші. `div` з обробником кліку не отримує фокус і не натискається Enter — бери `button`. `tabindex` більший за 0 ламає природний порядок Tab — не використовуй його. Skip-link («Перейти до вмісту») — перше посилання сторінки, сховане до фокуса: воно дає перестрибнути меню одразу до `main`.",
      example: `<a class="skip-link" href="#main">Перейти до вмісту</a>
<header>…меню…</header>
<main id="main">…</main>`,
      missionStory: "Гість саду ходить сторінкою лише клавішею Tab — і застрягає: ворота не відчиняються, а фокус стрибає хаотично.",
      worldEvent: "Сад можна обійти без жодної миші.",
      taskType: "fix-markup",
      prompt: "Додай першим елементом сторінки `<a class=\"skip-link\" href=\"#main\">Перейти до вмісту</a>` і дай `main` `id=\"main\"`; заміни `div.btn` на справжній `button` (`type=\"button\"`); прибери `tabindex=\"3\"`. CSS для skip-link уже готовий.",
      starterHtml: `<header>
  <a class="logo" href="#">Сад доступності</a>
  <nav>
    <a href="#paths">Стежки</a>
    <a href="#map" tabindex="3">Мапа</a>
  </nav>
</header>
<main>
  <h1>Ласкаво просимо</h1>
  <div class="btn" data-action="open-gate">Відчинити ворота</div>
</main>
`,
      starterCss: `.skip-link {
  position: absolute;
  top: 8px;
  left: -9999px;
  padding: 8px 12px;
  background: #1b1612;
  color: #ffffff;
}

.skip-link:focus {
  left: 8px;
}

.btn {
  padding: 10px 16px;
  border: 0;
  background: #3f8530;
  color: #ffffff;
  font: inherit;
}
`,
      testCases: [
        { name: "Перший елемент — skip-link на #main", check: (ctx) => { const f = ctx.$("body > :first-child"); return { pass: !!f && f.matches("a.skip-link") && f.getAttribute("href") === "#main", actual: f ? ctx.show(f.outerHTML.slice(0, 60)) : "порожньо", expected: '<a class="skip-link" href="#main">' }; } },
        { name: "main має id=\"main\"", check: (ctx) => eq(ctx, ctx.$("#main") ? ctx.$("#main").tagName.toLowerCase() : null, "main") },
        { name: ".btn — справжня кнопка", check: (ctx) => eq(ctx, ctx.$(".btn") ? ctx.$(".btn").tagName.toLowerCase() + " " + ctx.$(".btn").type : null, "button button") },
        { name: "Немає tabindex > 0", check: (ctx) => eq(ctx, ctx.$$("[tabindex]").filter((e) => Number(e.getAttribute("tabindex")) > 0).length, 0) },
      ],
      solution: { html: `<a class="skip-link" href="#main">Перейти до вмісту</a>
<header>
  <a class="logo" href="#">Сад доступності</a>
  <nav>
    <a href="#paths">Стежки</a>
    <a href="#map">Мапа</a>
  </nav>
</header>
<main id="main">
  <h1>Ласкаво просимо</h1>
  <button class="btn" type="button" data-action="open-gate">Відчинити ворота</button>
</main>
`, css: `.skip-link {
  position: absolute;
  top: 8px;
  left: -9999px;
  padding: 8px 12px;
  background: #1b1612;
  color: #ffffff;
}

.skip-link:focus {
  left: 8px;
}

.btn {
  padding: 10px 16px;
  border: 0;
  background: #3f8530;
  color: #ffffff;
  font: inherit;
}
` },
      hint: "Skip-link — найперший рядок HTML, ще до `header`.",
      difficulty: 2,
    }),
    L(8, {
      id: 39,
      title: "Видимий фокус",
      concept: "`*:focus { outline: none }` — одна з найшкідливіших стрічок CSS: людина з клавіатурою перестає бачити, де вона. Правильно — стилізувати фокус через `:focus-visible`: кільце з'являється при навігації клавіатурою, але не заважає при кліку мишею. `outline-offset` відсуває кільце від краю.",
      example: `:focus-visible {
  outline: 3px solid #1f6feb;
  outline-offset: 2px;
}`,
      missionStory: "Хтось «прибрав некрасиві рамки» в саду — і тепер гості з клавіатурою блукають наосліп.",
      worldEvent: "Сад відкрито для кожного гостя острова!",
      taskType: "fix-markup",
      prompt: "Прибери правило, що ховає фокус, і додай `:focus-visible` з `outline: 3px solid #1f6feb` та `outline-offset: 2px`.",
      starterHtml: `<nav>
  <a href="#roses">Троянди</a>
  <a href="#lilies">Лілії</a>
</nav>
<button class="btn" type="button">Замовити екскурсію</button>
`,
      starterCss: `*:focus {
  outline: none;
}

a,
button {
  color: #1b1612;
}

.btn {
  padding: 10px 16px;
  border: 0;
  background: #ffe061;
  font: inherit;
}
`,
      testCases: [
        { name: "Фокус більше не прихований", check: (ctx) => { const bad = ctx.rules(/:focus(?!-)/).filter((r) => r.rule.style.getPropertyValue("outline-style") === "none" || r.rule.style.getPropertyValue("outline-width") === "0px"); return { pass: !bad.length, actual: bad.length ? bad[0].rule.selectorText + " ховає outline" : "нічого не ховає", expected: "нічого не ховає" }; } },
        { name: ":focus-visible — 3px solid #1f6feb, відступ 2px", check: (ctx) => { const g = (p) => ruleProp(ctx, /:focus-visible/, p); return { pass: g("outline-width") === "3px" && g("outline-style") === "solid" && ctx.color(g("outline-color")) === ctx.color("#1f6feb") && g("outline-offset") === "2px", actual: g("outline-width") ? [g("outline-width"), g("outline-style"), g("outline-color"), "offset " + g("outline-offset")].join(" ") : "правила :focus-visible немає", expected: "3px solid #1f6feb offset 2px" }; } },
      ],
      codeChecks: [{ re: /outline\s*:\s*(none|0)\b/, not: true, label: "Немає outline: none", in: "css" }],
      solution: { html: `<nav>
  <a href="#roses">Троянди</a>
  <a href="#lilies">Лілії</a>
</nav>
<button class="btn" type="button">Замовити екскурсію</button>
`, css: `:focus-visible {
  outline: 3px solid #1f6feb;
  outline-offset: 2px;
}

a,
button {
  color: #1b1612;
}

.btn {
  padding: 10px 16px;
  border: 0;
  background: #ffe061;
  font: inherit;
}
` },
      hint: "Видали правило `*:focus` повністю й напиши нове з `:focus-visible`.",
      difficulty: 1,
    }),

    /* ───────────── 9. Вітряки швидкості — продуктивність ───────────── */
    L(9, {
      id: 40,
      title: "Ліниве завантаження зображень",
      concept: "`loading=\"lazy\"` відкладає завантаження картинок нижче першого екрана, доки користувач до них не догорне. Але першу (видиму одразу) картинку робити лінивою не можна — вона з'явиться пізніше. Атрибути `width` і `height` дають браузеру пропорції наперед, щоб сторінка не «стрибала», коли картинки довантажуються (CLS).",
      example: `<img src="hero.jpg" alt="…" width="1200" height="600">
<img src="photo.jpg" alt="…" width="400" height="300" loading="lazy">`,
      missionStory: "Сторінка вітряків вантажить усі фото одразу й смикається, коли вони з'являються. Мельник нервує.",
      worldEvent: "Сторінка вітряків більше не смикається.",
      taskType: "fix-markup",
      prompt: "Усім картинкам додай `width` і `height` (розміри: `harbor`, `market`, `lighthouse` — 400×250, `ship` — 300×200). Усі, крім першої, зроби лінивими (`loading=\"lazy\"`); першу — ні.",
      starterHtml: `<img src="harbor.svg" alt="Причал біля вітряків">
<h2>Наші вітряки</h2>
<img src="market.svg" alt="Ринок борошна">
<img src="lighthouse.svg" alt="Маяк на мисі">
<img src="ship.svg" alt="Корабель із зерном">
`,
      starterCss: `img {
  display: block;
  max-width: 100%;
  height: auto;
}
`,
      testCases: [
        { name: "Перша картинка завантажується одразу", check: (ctx) => eq(ctx, ctx.$("img").getAttribute("loading") === "lazy", false) },
        { name: "Решта — loading=\"lazy\"", check: (ctx) => eq(ctx, ctx.$$("img").slice(1).map((i) => i.getAttribute("loading") || "—").join(" "), "lazy lazy lazy") },
        { name: "Розміри width і height у всіх", check: (ctx) => eq(ctx, ctx.$$("img").map((i) => (i.getAttribute("width") || "?") + "×" + (i.getAttribute("height") || "?")).join(" "), "400×250 400×250 400×250 300×200") },
      ],
      solution: { html: `<img src="harbor.svg" alt="Причал біля вітряків" width="400" height="250">
<h2>Наші вітряки</h2>
<img src="market.svg" alt="Ринок борошна" width="400" height="250" loading="lazy">
<img src="lighthouse.svg" alt="Маяк на мисі" width="400" height="250" loading="lazy">
<img src="ship.svg" alt="Корабель із зерном" width="300" height="200" loading="lazy">
`, css: `img {
  display: block;
  max-width: 100%;
  height: auto;
}
` },
      hint: "`width` і `height` — числа без `px`. CSS `height: auto` збереже адаптивність.",
      difficulty: 1,
    }),
    L(9, {
      id: 41,
      title: "Шрифти: font-display",
      concept: "Поки вебшрифт вантажиться, браузер може ховати текст (FOIT) — сторінка «порожня». `font-display: swap` у `@font-face` одразу показує текст запасним шрифтом і підміняє його, коли вебшрифт завантажиться. А в `font-family` завжди пиши запасний ланцюжок, що закінчується загальним сімейством (`serif`, `sans-serif`).",
      example: `@font-face {
  font-family: "Mill";
  src: url("mill.woff2") format("woff2");
  font-display: swap;
}
body { font-family: "Mill", Georgia, serif; }`,
      missionStory: "Поки вантажиться фірмовий шрифт вітряків, гості бачать порожні таблички. Нехай текст буде видно одразу.",
      worldEvent: "Таблички вітряків видно ще до завантаження шрифту.",
      taskType: "fix-markup",
      prompt: "Додай у `@font-face` `font-display: swap`, а `body` дай ланцюжок `\"Island\", Georgia, serif`. (`local(\"Georgia\")` у `src` — шрифт, установлений у системі: якщо він є, файл не завантажується.)",
      starterHtml: `<h1>Вітряки швидкості</h1>
<p>Мелемо борошно щодня з шостої ранку.</p>
`,
      starterCss: `@font-face {
  font-family: "Island";
  src: local("Georgia"), url("island.woff2") format("woff2");
}

body {
  font-family: "Island";
}
`,
      testCases: [
        { name: "@font-face «Island» з font-display: swap", check: (ctx) => { const f = ctx.atRules("CSSFontFaceRule").find((r) => /Island/.test(r.style.getPropertyValue("font-family"))); return { pass: !!f && f.style.getPropertyValue("font-display") === "swap", actual: f ? "font-display: " + (f.style.getPropertyValue("font-display") || "—") : "@font-face немає", expected: "font-display: swap" }; } },
        { name: "Запасний ланцюжок шрифтів", check: (ctx) => { const v = ctx.style("body", "font-family"); return { pass: /^"?Island"?,\s*Georgia,\s*serif$/.test(v), actual: v, expected: "\"Island\", Georgia, serif" }; } },
      ],
      solution: { html: `<h1>Вітряки швидкості</h1>
<p>Мелемо борошно щодня з шостої ранку.</p>
`, css: `@font-face {
  font-family: "Island";
  src: local("Georgia"), url("island.woff2") format("woff2");
  font-display: swap;
}

body {
  font-family: "Island", Georgia, serif;
}
` },
      hint: "`font-display` пишеться всередині `@font-face`, а не в `body`.",
      difficulty: 1,
    }),
    L(9, {
      id: 42,
      title: "Легкий CSS: база + модифікатори",
      concept: "Три кнопки, у кожної свій клас, і в кожному — ті самі 6 рядків відступів, рамок і шрифтів. Такий CSS важчий і крихкий: змінив відступ в одній — забув у двох інших. Рішення: базовий клас `.btn` зі спільним, а модифікатори (`.btn--primary`) — лише з відмінностями.",
      example: `.btn { padding: 10px 16px; border-radius: 6px; }
.btn--primary { background: #2a85c4; }
<button class="btn btn--primary">`,
      missionStory: "Кнопки вітряків описано тричі майже однаково. Мельник платить за кожен зайвий байт борошном.",
      worldEvent: "CSS вітряків схуд утричі.",
      taskType: "fix-markup",
      prompt: "Винеси спільне в `.btn` (padding, border, border-radius, font, cursor), а відмінності — у `.btn--primary`, `.btn--danger`, `.btn--ghost`. Кнопкам дай класи `btn btn--…`. `padding` і `border-radius` мають бути записані в CSS лише один раз. Вигляд не змінюється.",
      starterHtml: `<button class="btn-primary" type="button">Запустити</button>
<button class="btn-danger" type="button">Зупинити</button>
<button class="btn-ghost" type="button">Деталі</button>
`,
      starterCss: `.btn-primary {
  padding: 10px 16px;
  border: 2px solid transparent;
  border-radius: 6px;
  font: inherit;
  cursor: pointer;
  background: #2a85c4;
  color: #ffffff;
}

.btn-danger {
  padding: 10px 16px;
  border: 2px solid transparent;
  border-radius: 6px;
  font: inherit;
  cursor: pointer;
  background: #c4472a;
  color: #ffffff;
}

.btn-ghost {
  padding: 10px 16px;
  border: 2px solid #1b1612;
  border-radius: 6px;
  font: inherit;
  cursor: pointer;
  background: transparent;
  color: #1b1612;
}
`,
      testCases: [
        { name: "Кнопки мають базовий клас і модифікатор", check: (ctx) => eq(ctx, ctx.$$("button").map((b) => b.className.trim()).join(" | "), "btn btn--primary | btn btn--danger | btn btn--ghost") },
        { name: "Вигляд не змінився", check: (ctx) => { const b = ctx.$$("button"); const v = b.map((e) => [ctx.style(e, "padding-top"), ctx.style(e, "padding-left"), ctx.style(e, "border-top-left-radius"), ctx.style(e, "background-color"), ctx.style(e, "border-top-color")].join(" ")); return eq(ctx, v.join(" | "), ["10px 16px 6px rgb(42, 133, 196) rgba(0, 0, 0, 0)", "10px 16px 6px rgb(196, 71, 42) rgba(0, 0, 0, 0)", "10px 16px 6px rgba(0, 0, 0, 0) rgb(27, 22, 18)"].join(" | ")); } },
        { name: "padding і border-radius записано один раз", check: (ctx) => { const css = ctx.css.replace(/\/\*[\s\S]*?\*\//g, ""); const n = (re) => (css.match(re) || []).length; return eq(ctx, "padding: " + n(/padding\s*:/g) + ", border-radius: " + n(/border-radius\s*:/g), "padding: 1, border-radius: 1"); } },
      ],
      solution: { html: `<button class="btn btn--primary" type="button">Запустити</button>
<button class="btn btn--danger" type="button">Зупинити</button>
<button class="btn btn--ghost" type="button">Деталі</button>
`, css: `.btn {
  padding: 10px 16px;
  border: 2px solid transparent;
  border-radius: 6px;
  font: inherit;
  cursor: pointer;
}

.btn--primary {
  background: #2a85c4;
  color: #ffffff;
}

.btn--danger {
  background: #c4472a;
  color: #ffffff;
}

.btn--ghost {
  border-color: #1b1612;
  background: transparent;
  color: #1b1612;
}
` },
      hint: "У `.btn--ghost` досить змінити лише `border-color` — решту рамки дасть `.btn`.",
      difficulty: 2,
    }),
    L(9, {
      id: 43,
      title: "Reflow: анімуй transform",
      concept: "Зміна `left`, `top`, `width`, `margin` змушує браузер перераховувати розкладку (reflow) і перемальовувати сторінку в кожному кадрі — анімація смикається. `transform` і `opacity` обробляє відеокарта на етапі композиції, без reflow — це плавні 60 кадрів на секунду.",
      example: `/* повільно */ @keyframes move { to { left: 200px; } }
/* швидко  */ @keyframes move { to { transform: translateX(200px); } }`,
      missionStory: "Лопаті вітряка рухаються ривками, а процесор мельника гріється. Звична причина — анімація властивості, що перебудовує сторінку.",
      worldEvent: "Вітряки розкрутились — острів вантажиться миттєво!",
      taskType: "fix-markup",
      prompt: "Перепиши `@keyframes slide` так, щоб замість `left` рухав `transform: translateX(…)` (від `0` до `200px`). Жодних `left`/`top`/`margin`/`width` у кадрах.",
      starterHtml: `<div class="mill">
  <div class="blade"></div>
</div>
`,
      starterCss: `.mill {
  height: 80px;
  background: #cfe8f7;
}

.blade {
  position: relative;
  width: 40px;
  height: 40px;
  background: #a06a36;
  animation: slide 2s ease-in-out infinite alternate;
}

@keyframes slide {
  from { left: 0; }
  to { left: 200px; }
}
`,
      testCases: [
        { name: "Кінцевий кадр — translateX(200px)", check: (ctx) => { const k = ctx.keyframes("slide"); const end = k && (k.findRule("100%") || k.findRule("to")); return eq(ctx, end ? end.style.transform : null, "translateX(200px)"); } },
        { name: "У кадрах немає властивостей розкладки", check: (ctx) => { const k = ctx.keyframes("slide"); const bad = k ? Array.from(k.cssRules).flatMap((r) => ["left", "top", "right", "bottom", "margin-left", "width"].filter((p) => r.style.getPropertyValue(p))) : ["немає keyframes"]; return { pass: !bad.length, actual: bad.join(", ") || "лише transform", expected: "лише transform" }; } },
      ],
      solution: { html: `<div class="mill">
  <div class="blade"></div>
</div>
`, css: `.mill {
  height: 80px;
  background: #cfe8f7;
}

.blade {
  position: relative;
  width: 40px;
  height: 40px;
  background: #a06a36;
  animation: slide 2s ease-in-out infinite alternate;
}

@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(200px); }
}
` },
      hint: "Заміни `left: 0` на `transform: translateX(0)` і так само для `to`.",
      difficulty: 2,
    }),

    /* ───────────── 10. Бібліотека порядку — організація коду ───────────── */
    L(10, {
      id: 44,
      title: "Основи BEM",
      concept: "BEM — угода про назви класів: Блок (`book-card`) — самостійний компонент, Елемент (`book-card__title`) — його частина через два підкреслення. Кожен селектор — один клас, без вкладення (`.card .title`): специфічність однакова й низька, стилі не «протікають» в інші компоненти, а з HTML одразу видно, до чого належить елемент.",
      example: `.search-form { … }
.search-form__input { … }
.search-form__button { … }`,
      missionStory: "У бібліотеці всі полиці підписано «полиця», а книжки — «книжка». Бібліотекар не знаходить нічого.",
      worldEvent: "Полиці бібліотеки отримали точні підписи.",
      taskType: "fix-markup",
      prompt: "Перейменуй класи за BEM: блок `book-card`, елементи `book-card__title`, `book-card__text`, `book-card__button`. У CSS кожен селектор — один клас, без вкладених `.card .title`. Вигляд не змінюється.",
      starterHtml: `<article class="card">
  <h3 class="title">Кобзар</h3>
  <p class="text">Т. Шевченко, 1840</p>
  <a class="button" href="#take">Взяти</a>
</article>
`,
      starterCss: `.card {
  padding: 16px;
  border: 1px solid #c9a86a;
  background: #f3eee2;
}

.card .title {
  margin: 0 0 8px;
  font-size: 20px;
}

.card .text {
  color: #5e5a52;
}

.card .button {
  display: inline-block;
  padding: 6px 12px;
  background: #1b1612;
  color: #ffffff;
}
`,
      testCases: [
        { name: "BEM-класи на своїх місцях", check: (ctx) => { const need = ["article.book-card", "h3.book-card__title", "p.book-card__text", "a.book-card__button"]; const miss = need.filter((s) => !ctx.$(s)); return { pass: !miss.length, actual: miss.length ? "немає: " + miss.join(", ") : "усі є", expected: "усі є" }; } },
        { name: "Вигляд збережено", check: (ctx) => eq(ctx, [ctx.style(".book-card", "padding-top"), ctx.style(".book-card__title", "font-size"), ctx.style(".book-card__text", "color"), ctx.style(".book-card__button", "background-color")].join(" "), "16px 20px rgb(94, 90, 82) rgb(27, 22, 18)") },
        { name: "Кожен селектор — один клас", check: (ctx) => { const bad = ctx.rules(/./).map((r) => r.rule.selectorText).filter((s) => !/^\.[\w-]+$/.test(s)); return { pass: !bad.length, actual: bad.join(", ") || "усі прості", expected: "усі прості" }; } },
      ],
      solution: { html: `<article class="book-card">
  <h3 class="book-card__title">Кобзар</h3>
  <p class="book-card__text">Т. Шевченко, 1840</p>
  <a class="book-card__button" href="#take">Взяти</a>
</article>
`, css: `.book-card {
  padding: 16px;
  border: 1px solid #c9a86a;
  background: #f3eee2;
}

.book-card__title {
  margin: 0 0 8px;
  font-size: 20px;
}

.book-card__text {
  color: #5e5a52;
}

.book-card__button {
  display: inline-block;
  padding: 6px 12px;
  background: #1b1612;
  color: #ffffff;
}
` },
      hint: "`.card .title` стає просто `.book-card__title`.",
      difficulty: 2,
    }),
    L(10, {
      id: 45,
      title: "Модифікатори BEM",
      concept: "Модифікатор описує варіант блоку чи елемента: `book-card--featured`, `book-card__button--disabled` (через два дефіси). Модифікатор завжди йде разом із базовим класом — `class=\"book-card book-card--featured\"` — і містить лише відмінності, а все спільне бере з бази.",
      example: `<article class="book-card book-card--featured">
.book-card--featured { border-color: gold; }`,
      missionStory: "Бібліотека хоче виділити книгу місяця, а видану книгу позначити недоступною — без копіювання стилів.",
      worldEvent: "Книга місяця сяє на почесній полиці.",
      taskType: "write-markup",
      prompt: "Друга картка — «книга місяця»: модифікатор `book-card--featured` (рамка `gold`, `2px`). У третій картці кнопка неактивна: `book-card__button--disabled` (`opacity: 0.5`). Модифікатори додавай поруч із базовими класами.",
      starterHtml: `<article class="book-card">
  <h3 class="book-card__title">Кобзар</h3>
  <a class="book-card__button" href="#take">Взяти</a>
</article>
<article class="book-card">
  <h3 class="book-card__title">Лісова пісня</h3>
  <a class="book-card__button" href="#take">Взяти</a>
</article>
<article class="book-card">
  <h3 class="book-card__title">Тигролови</h3>
  <a class="book-card__button" href="#take">Видана</a>
</article>
`,
      starterCss: `.book-card {
  margin-bottom: 12px;
  padding: 16px;
  border: 1px solid #c9a86a;
  background: #f3eee2;
}

.book-card__title {
  margin: 0 0 8px;
}

.book-card__button {
  display: inline-block;
  padding: 6px 12px;
  background: #1b1612;
  color: #ffffff;
}
`,
      testCases: [
        { name: "Друга картка — book-card book-card--featured", check: (ctx) => { const c = ctx.$$("article")[1]; return eq(ctx, c.classList.contains("book-card") && c.classList.contains("book-card--featured"), true); } },
        { name: "Книга місяця з рамкою gold 2px, інші — ні", check: (ctx) => { const a = ctx.$$("article"); return eq(ctx, a.map((c) => ctx.style(c, "border-top-color") === ctx.color("gold") && ctx.style(c, "border-top-width") === "2px").join(" "), "false true false"); } },
        { name: "Неактивна кнопка: обидва класи й opacity 0.5", check: (ctx) => { const b = ctx.$$(".book-card__button")[2]; return eq(ctx, b.classList.contains("book-card__button--disabled") + " " + ctx.style(b, "opacity") + " " + ctx.style(b, "padding-top"), "true 0.5 6px"); } },
        { name: "Інші кнопки не зачеплено", check: (ctx) => eq(ctx, ctx.$$(".book-card__button").slice(0, 2).map((b) => ctx.style(b, "opacity")).join(" "), "1 1") },
      ],
      solution: { html: `<article class="book-card">
  <h3 class="book-card__title">Кобзар</h3>
  <a class="book-card__button" href="#take">Взяти</a>
</article>
<article class="book-card book-card--featured">
  <h3 class="book-card__title">Лісова пісня</h3>
  <a class="book-card__button" href="#take">Взяти</a>
</article>
<article class="book-card">
  <h3 class="book-card__title">Тигролови</h3>
  <a class="book-card__button book-card__button--disabled" href="#take">Видана</a>
</article>
`, css: `.book-card {
  margin-bottom: 12px;
  padding: 16px;
  border: 1px solid #c9a86a;
  background: #f3eee2;
}

.book-card--featured {
  border: 2px solid gold;
}

.book-card__title {
  margin: 0 0 8px;
}

.book-card__button {
  display: inline-block;
  padding: 6px 12px;
  background: #1b1612;
  color: #ffffff;
}

.book-card__button--disabled {
  opacity: 0.5;
}
` },
      hint: "Модифікатор у CSS — окремий однокласовий селектор, записаний після базового.",
      difficulty: 2,
    }),
    L(10, {
      id: 46,
      title: "Структура CSS-файлів",
      concept: "Великий проєкт ділять на файли від загального до конкретного: змінні й скидання стилів → базові стилі тегів (типографіка) → розкладка (layout) → компоненти → утиліти. Кожен наступний шар специфічніший і може перекрити попередній, а утиліти (`.hidden`, `.text-center`) стоять останніми, бо мають спрацьовувати завжди.",
      example: `/* main.css */
@import "variables.css";
@import "base.css";
@import "layout.css";
@import "components/card.css";
@import "utilities.css";`,
      exampleLang: "css",
      missionStory: "Бібліотекар розкладає сувої з правилами по полицях. У якому порядку їх читати, щоб нічого не суперечило?",
      worldEvent: "Бібліотеку впорядковано — кожен клас на своїй полиці!",
      taskType: "multiple-choice",
      prompt: "Який порядок підключення CSS найкращий?",
      options: [
        "Змінні й reset → base (теги, типографіка) → layout → компоненти → утиліти",
        "Утиліти → компоненти → layout → base → змінні",
        "Компоненти → змінні → утиліти → base → layout",
        "Порядок не має значення — каскад усе вирішить сам",
      ],
      expectedAnswer: "Змінні й reset → base (теги, типографіка) → layout → компоненти → утиліти",
      hint: "Від загального до конкретного: те, що має перемагати, підключається пізніше.",
      difficulty: 1,
    }),

    /* ───────────── 11. Обсерваторія нового CSS — сучасний CSS ───────────── */
    L(11, {
      id: 47,
      title: "Селектор :has()",
      concept: "`:has()` — «батьківський селектор»: стилізує елемент залежно від того, що всередині. `.card:has(.badge)` — картки з бейджем, `.field:has(input:checked)` — поле з увімкненим прапорцем. Працює динамічно: змінився стан — змінився стиль, без жодного JS.",
      example: `.card:has(img) { padding-top: 0; }
form:has(input:invalid) .submit { opacity: 0.5; }`,
      missionStory: "Обсерваторія хоче підсвічувати картки небесних тіл із позначкою «Нова» і нагадування, які ввімкнено.",
      worldEvent: "Нові комети в каталозі обсерваторії світяться.",
      taskType: "write-markup",
      prompt: "Картки, що містять `.badge`, отримують рамку `gold` (`.card:has(.badge)`). Мітки `.field`, у яких чекбокс увімкнено, — фон `#e8f5e9`.",
      starterHtml: `<article class="card">
  <span class="badge">Нова</span>
  <h3>Комета Галлея</h3>
</article>
<article class="card">
  <h3>Туманність Андромеди</h3>
</article>
<label class="field"><input type="checkbox" checked> Нагадати про затемнення</label>
<label class="field"><input type="checkbox"> Нагадати про метеори</label>
`,
      starterCss: `.card {
  margin-bottom: 8px;
  padding: 12px;
  border: 2px solid #9aa1a9;
}

.field {
  display: block;
  padding: 8px;
}
`,
      testCases: [
        { name: "Рамка gold лише в картки з бейджем", check: (ctx) => eq(ctx, ctx.$$(".card").map((c) => ctx.style(c, "border-top-color") === ctx.color("gold")).join(" "), "true false") },
        { name: "Увімкнене поле підсвічено", check: (ctx) => eq(ctx, ctx.$$(".field").map((f) => ctx.style(f, "background-color") === ctx.color("#e8f5e9")).join(" "), "true false") },
        { name: "Працює динамічно: увімкни другий прапорець", check: (ctx) => { ctx.$$(".field input")[1].checked = true; return eq(ctx, ctx.style(ctx.$$(".field")[1], "background-color"), ctx.color("#e8f5e9")); } },
      ],
      codeChecks: [{ re: /:has\(/, label: "Використано :has()", in: "css" }],
      solution: { html: `<article class="card">
  <span class="badge">Нова</span>
  <h3>Комета Галлея</h3>
</article>
<article class="card">
  <h3>Туманність Андромеди</h3>
</article>
<label class="field"><input type="checkbox" checked> Нагадати про затемнення</label>
<label class="field"><input type="checkbox"> Нагадати про метеори</label>
`, css: `.card {
  margin-bottom: 8px;
  padding: 12px;
  border: 2px solid #9aa1a9;
}

.card:has(.badge) {
  border-color: gold;
}

.field {
  display: block;
  padding: 8px;
}

.field:has(input:checked) {
  background: #e8f5e9;
}
` },
      hint: "У дужках `:has()` пишеш селектор нащадка: `.field:has(input:checked)`.",
      difficulty: 2,
    }),
    L(11, {
      id: 48,
      title: "aspect-ratio",
      concept: "Раніше пропорційні блоки робили хаком `height: 0; padding-top: 56.25%` — відсоток рахується від ширини батька, тож при іншій ширині блоку пропорції ламаються. `aspect-ratio: 16 / 9` задає пропорцію самому блоку: досить ширини, висоту браузер порахує сам.",
      example: `.video { width: 100%; aspect-ratio: 16 / 9; }
.avatar { width: 64px; aspect-ratio: 1; object-fit: cover; }`,
      missionStory: "Екран телескопа замість 16:9 виходить квадратним, а аватари астрономів — сплюснутими.",
      worldEvent: "Екран телескопа показує небо в правильних пропорціях.",
      taskType: "fix-markup",
      prompt: "Прибери хак із `padding-top` у `.video` і задай `aspect-ratio: 16 / 9` (ширина 640px → висота 360px). Аватару `.avatar` прибери фіксовану висоту й задай `aspect-ratio: 1 / 1` (лишається `object-fit: cover`).",
      starterHtml: `<div class="video">
  <div class="video__screen">▶ Пряма трансляція неба</div>
</div>
<img class="avatar" src="ship.svg" alt="Астроном Олена">
`,
      starterCss: `.video {
  position: relative;
  width: 640px;
  height: 0;
  padding-top: 56.25%;
  background: #0d1b2a;
}

.video__screen {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #ffffff;
}

.avatar {
  display: block;
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 50%;
}
`,
      testCases: [
        { name: "Екран 640×360", check: (ctx) => { const r = ctx.rect(".video"); return eq(ctx, px(r.width) + "×" + px(r.height), "640px×360px"); } },
        { name: "Аватар 120×120", check: (ctx) => { const r = ctx.rect(".avatar"); return eq(ctx, px(r.width) + "×" + px(r.height), "120px×120px"); } },
        { name: "Пропорції через aspect-ratio", check: (ctx) => eq(ctx, ctx.style(".video", "aspect-ratio") + " | " + ctx.style(".avatar", "aspect-ratio"), "16 / 9 | 1 / 1") },
      ],
      codeChecks: [{ re: /padding-top\s*:\s*56\.25%/, not: true, label: "Хак з padding-top прибрано", in: "css" }],
      solution: { html: `<div class="video">
  <div class="video__screen">▶ Пряма трансляція неба</div>
</div>
<img class="avatar" src="ship.svg" alt="Астроном Олена">
`, css: `.video {
  position: relative;
  width: 640px;
  aspect-ratio: 16 / 9;
  background: #0d1b2a;
}

.video__screen {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #ffffff;
}

.avatar {
  display: block;
  width: 120px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 50%;
}
` },
      hint: "Видали `height: 0` і `padding-top` з `.video`, а в `.avatar` — `height: 90px`.",
      difficulty: 1,
    }),
    L(11, {
      id: 49,
      title: "clamp(), min(), max()",
      concept: "Математичні функції замість медіазапитів: `min(100% - 32px, 960px)` — «на всю ширину з полями, але не ширше за 960px»; `max(200px, 25%)` — «чверть, але не менше 200px»; `clamp(1.5rem, 4vw, 3rem)` — «росте з екраном у межах». Усередині можна рахувати без `calc()`.",
      example: `.container { width: min(100% - 32px, 1100px); margin-inline: auto; }
.sidebar { width: max(220px, 30%); }`,
      missionStory: "Купол обсерваторії то занадто вузький, то розлазиться на весь екран. Нехай пристосовується сам — без жодного медіазапиту.",
      worldEvent: "Купол обсерваторії підлаштовується під будь-яке небо.",
      taskType: "write-markup",
      prompt: "`.container`: ширина `min(100% - 32px, 960px)`, по центру (`margin-inline: auto`). `.title`: `font-size: clamp(1.5rem, 4vw, 3rem)`. `.sidebar`: ширина `max(200px, 25%)`. Медіазапити не потрібні.",
      starterHtml: `<div class="container">
  <h1 class="title">Обсерваторія</h1>
  <aside class="sidebar">Карта неба</aside>
</div>
`,
      starterCss: `.container {
  background: #0d1b2a;
  color: #ffffff;
}

.sidebar {
  background: #1f4a5a;
}
`,
      testCases: [
        { name: "800px: контейнер 752px по центру, заголовок 32px, панель 200px", check: (ctx) => { const c = ctx.rect(".container"); return eq(ctx, [px(c.width), px(c.left), ctx.style(".title", "font-size"), px(ctx.rect(".sidebar").width)].join(" "), "752px 24px 32px 200px"); } },
        { name: "1200px: контейнер 960px, заголовок 48px, панель 240px", width: 1200, check: (ctx) => eq(ctx, [px(ctx.rect(".container").width), ctx.style(".title", "font-size"), px(ctx.rect(".sidebar").width)].join(" "), "960px 48px 240px") },
        { name: "400px: заголовок не менший за 24px", width: 400, check: (ctx) => eq(ctx, [px(ctx.rect(".container").width), ctx.style(".title", "font-size"), px(ctx.rect(".sidebar").width)].join(" "), "352px 24px 200px") },
      ],
      codeChecks: [{ re: /@media/, not: true, label: "Без медіазапитів", in: "css" }],
      solution: { html: `<div class="container">
  <h1 class="title">Обсерваторія</h1>
  <aside class="sidebar">Карта неба</aside>
</div>
`, css: `.container {
  width: min(100% - 32px, 960px);
  margin-inline: auto;
  background: #0d1b2a;
  color: #ffffff;
}

.title {
  font-size: clamp(1.5rem, 4vw, 3rem);
}

.sidebar {
  width: max(200px, 25%);
  background: #1f4a5a;
}
` },
      hint: "`25%` у `.sidebar` рахується від ширини `.container`.",
      difficulty: 2,
    }),
    L(11, {
      id: 50,
      title: "Нативний CSS nesting",
      concept: "Тепер браузери вкладають правила самі, без Sass: усередині `.menu { … }` пишеш `& a { … }`, а `&:hover` чи `&.is-open` — для станів і класів того самого елемента. На відміну від Sass, склеювання назв (`&--dark`) нативно не працює — для BEM-модифікаторів пиши повний клас.",
      example: `.card {
  padding: 16px;

  & h3 { margin: 0; }
  &:hover { background: #f3eee2; }
  &.is-active { border-color: gold; }
}`,
      missionStory: "Правила зоряного меню обсерваторії розкидано по файлу. Збери їх в одне сузір'я.",
      worldEvent: "Обсерваторія відкрила нові зірки сучасного CSS!",
      taskType: "fix-markup",
      prompt: "Перепиши CSS так, щоб усе було всередині одного правила `.menu`: посилання — `& a`, наведення — `&:hover` усередині правила посилань, компактний варіант — `&.is-compact`. Вигляд не змінюється.",
      starterHtml: `<nav class="menu">
  <a href="#stars">Зорі</a>
  <a href="#planets">Планети</a>
</nav>
<nav class="menu is-compact">
  <a href="#comets">Комети</a>
  <a href="#moons">Супутники</a>
</nav>
`,
      starterCss: `.menu {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: #0d1b2a;
}

.menu a {
  color: #cfe8f7;
  text-decoration: none;
}

.menu a:hover {
  color: #ffe061;
}

.menu.is-compact {
  gap: 8px;
}
`,
      testCases: [
        { name: "Вигляд збережено", check: (ctx) => eq(ctx, [ctx.style(".menu a", "color"), ctx.style(".menu a", "text-decoration-line"), ctx.style(".menu", "column-gap"), ctx.style(".is-compact", "column-gap")].join(" "), "rgb(207, 232, 247) none 16px 8px") },
        { name: "Одне зовнішнє правило .menu", check: (ctx) => eq(ctx, ctx.rules(/./).map((r) => r.rule.selectorText).join(", "), ".menu") },
        { name: "Наведення вкладено в правило посилань", check: (ctx) => { const top = ctx.rules(/^\.menu$/)[0]; const links = top && Array.from(top.rule.cssRules || []).find((r) => /&\s*a$|^a$/.test(r.selectorText || "")); const hover = links && Array.from(links.cssRules || []).find((r) => /:hover/.test(r.selectorText || "")); return { pass: !!hover && ctx.color(hover.style.getPropertyValue("color")) === ctx.color("#ffe061"), actual: links ? (hover ? hover.selectorText : "немає &:hover у & a") : "немає вкладеного & a", expected: "&:hover усередині & a" }; } },
      ],
      codeChecks: [{ re: /&/, label: "Використано &", in: "css" }],
      solution: { html: `<nav class="menu">
  <a href="#stars">Зорі</a>
  <a href="#planets">Планети</a>
</nav>
<nav class="menu is-compact">
  <a href="#comets">Комети</a>
  <a href="#moons">Супутники</a>
</nav>
`, css: `.menu {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: #0d1b2a;

  & a {
    color: #cfe8f7;
    text-decoration: none;

    &:hover {
      color: #ffe061;
    }
  }

  &.is-compact {
    gap: 8px;
  }
}
` },
      hint: "Вкладені правила йдуть після звичайних властивостей батька. `&.is-compact` — без пробілу, бо це той самий елемент.",
      difficulty: 2,
    }),

    /* ───────────── 12. Гранд-готель «Люм'єр» — практичні проєкти ───────────── */
    L(12, {
      id: 51,
      title: "Лендінг «Люм'єр» з нуля",
      concept: "Час зібрати все разом: семантичний каркас, флекс-шапка, mobile-first сітка карток, змінні кольорів. Справжній лендінг починають зі структури HTML, потім додають базові стилі для телефона, а ширші екрани — медіазапитом.",
      example: `:root { --gold: #c99812; }
.rooms { display: grid; gap: 16px; }
@media (min-width: 768px) {
  .rooms { grid-template-columns: repeat(3, 1fr); }
}`,
      missionStory: "Гранд-готель «Люм'єр» відчиняється на найвищому пагорбі острова. Власниця замовила лендінг — і чекає його до відкриття.",
      worldEvent: "Лендінг «Люм'єр» запрошує перших гостей.",
      taskType: "write-markup",
      prompt: "Зверстай лендінг:\n- `header` (flex) з логотипом і `nav`;\n- `main` → секція `.hero` з одним `h1` і посиланням `.cta` на `#booking`;\n- секція `#rooms` з `h2` і трьома картками `.room` (у кожній `img` з `alt`, `h3` і ціна) — на телефоні в колонку, від `768px` — три в ряд (mobile-first);\n- `footer`;\n- кольори — змінні в `:root` (щонайменше `--gold`), використані через `var()`.",
      starterHtml: `<!-- лендінг Гранд-готелю «Люм'єр» -->
`,
      starterCss: `/* стилі лендінгу */
`,
      testCases: [
        { name: "Каркас: header з nav, main, footer", check: (ctx) => { const miss = ["header nav", "main", "footer"].filter((s) => !ctx.$(s)); return { pass: !miss.length && ctx.style("header", "display") === "flex", actual: miss.length ? "немає: " + miss.join(", ") : "header " + ctx.style("header", "display"), expected: "header flex" }; } },
        { name: "Hero: один h1 і кнопка на #booking", check: (ctx) => ({ pass: ctx.$$("h1").length === 1 && !!ctx.$(".hero h1") && !!ctx.$('.hero a.cta[href="#booking"]'), actual: "h1: " + ctx.$$("h1").length + ", cta: " + (ctx.$(".hero .cta") ? ctx.attr(".hero .cta", "href") : "немає"), expected: "h1: 1, cta: #booking" }) },
        { name: "Три номери з фото (alt) і заголовком", check: (ctx) => { const r = ctx.$$("#rooms .room"); return { pass: r.length === 3 && r.every((x) => x.querySelector("img[alt]:not([alt=''])") && x.querySelector("h3")), actual: r.length + " карток", expected: "3 повні картки" }; } },
        { name: "400px — у колонку", width: 400, check: (ctx) => eq(ctx, perRow(ctx, ".room"), 1) },
        { name: "900px — три в ряд", width: 900, check: (ctx) => eq(ctx, perRow(ctx, ".room"), 3) },
        { name: "Змінна --gold оголошена й використана", check: (ctx) => ({ pass: !!ctx.win.getComputedStyle(ctx.doc.documentElement).getPropertyValue("--gold").trim() && /var\(--gold\)/.test(ctx.css), actual: ctx.win.getComputedStyle(ctx.doc.documentElement).getPropertyValue("--gold").trim() || "немає", expected: "колір у --gold і var(--gold)" }) },
      ],
      codeChecks: [{ re: /@media\s*\(\s*min-width/, label: "Mobile-first: @media (min-width)", in: "css" }],
      solution: { html: `<header class="site-header">
  <a class="logo" href="#">Люм'єр</a>
  <nav>
    <a href="#rooms">Номери</a>
    <a href="#booking">Бронювання</a>
  </nav>
</header>
<main>
  <section class="hero">
    <h1>Гранд-готель «Люм'єр»</h1>
    <p>Світанок над морем — просто з вашого балкона.</p>
    <a class="cta" href="#booking">Забронювати</a>
  </section>
  <section id="rooms">
    <h2>Номери</h2>
    <div class="rooms">
      <article class="room">
        <img src="harbor.svg" alt="Номер з видом на причал">
        <h3>Стандарт</h3>
        <p>від 2400 ₴</p>
      </article>
      <article class="room">
        <img src="lighthouse.svg" alt="Люкс з видом на маяк">
        <h3>Люкс</h3>
        <p>від 4200 ₴</p>
      </article>
      <article class="room">
        <img src="panorama.svg" alt="Пентхаус з панорамою острова">
        <h3>Пентхаус</h3>
        <p>від 9000 ₴</p>
      </article>
    </div>
  </section>
</main>
<footer>
  <p>© 2026 Гранд-готель «Люм'єр»</p>
</footer>
`, css: `:root {
  --gold: #c99812;
  --ink: #1b1612;
  --paper: #fbf7ef;
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

header nav {
  display: flex;
  gap: 16px;
}

.hero {
  padding: 48px 16px;
  text-align: center;
}

.cta {
  display: inline-block;
  padding: 12px 20px;
  background: var(--gold);
  color: var(--ink);
}

#rooms {
  padding: 16px;
}

.rooms {
  display: grid;
  gap: 16px;
}

.room img {
  display: block;
  width: 100%;
  height: auto;
}

@media (min-width: 768px) {
  .rooms {
    grid-template-columns: repeat(3, 1fr);
  }
}

footer {
  padding: 16px;
  text-align: center;
}
` },
      hint: "Почни з HTML-каркаса, потім стилі для телефона, а в кінці — один медіазапит на `768px`.",
      difficulty: 3,
    }),
    L(12, {
      id: 52,
      title: "Форма бронювання «Люм'єр»",
      concept: "Форма бронювання поєднує все про форми: правильні типи полів, мітки, валідацію, `select` з порожньою підказкою (`value=\"\"` + `required` — не дасть надіслати без вибору), `fieldset` з `legend` для групи прапорців і розкладку на Grid.",
      example: `<select id="room" required>
  <option value="">Оберіть номер</option>
  <option value="lux">Люкс</option>
</select>
<fieldset>
  <legend>Послуги</legend>
  <input type="checkbox" id="spa"> <label for="spa">Спа</label>
</fieldset>`,
      missionStory: "Лендінг готовий, але гості не можуть забронювати номер. Власниця «Люм'єр» просить форму, яка не пропустить жодної помилки.",
      worldEvent: "Перші бронювання «Люм'єр» уже надходять.",
      taskType: "write-markup",
      prompt: "У `#booking` створи форму з мітками для кожного поля:\n- `#guest-name` — обов'язкове, `minlength=\"2\"`;\n- `#guest-email` — email, обов'язкове;\n- `#checkin` — дата, обов'язкова;\n- `#nights` — число від 1 до 14;\n- `#room` — обов'язковий `select`: перша опція — підказка з `value=\"\"`, далі «Стандарт», «Люкс», «Пентхаус»;\n- `fieldset` з `legend` «Додаткові послуги» і чекбоксами `#breakfast`, `#spa`;\n- кнопка `type=\"submit\"`.\nПоля загорни в `.form-grid`: одна колонка, а від `600px` — дві.",
      starterHtml: `<section id="booking">
  <h2>Бронювання</h2>
  <!-- форма -->
</section>
`,
      starterCss: `/* стилі форми */
`,
      testCases: [
        { name: "Типи полів", check: (ctx) => eq(ctx, ["#guest-name", "#guest-email", "#checkin", "#nights", "#room", "#breakfast", "#spa"].map((s) => (ctx.$(s) ? ctx.$(s).type : "—")).join(" "), "text email date number select-one checkbox checkbox") },
        { name: "#nights від 1 до 14, ім'я minlength 2", check: (ctx) => eq(ctx, ctx.$("#nights") && ctx.$("#guest-name") ? ctx.attr("#nights", "min") + "–" + ctx.attr("#nights", "max") + ", " + ctx.$("#guest-name").minLength : null, "1–14, 2") },
        { name: "Кожне поле має мітку", check: (ctx) => { const miss = ["#guest-name", "#guest-email", "#checkin", "#nights", "#room", "#breakfast", "#spa"].filter((s) => !labelOf(ctx, s)); return { pass: !miss.length, actual: miss.join(", ") || "усі з мітками", expected: "усі з мітками" }; } },
        { name: "Порожня форма не проходить, заповнена — проходить", check: (ctx) => { const f = ctx.$("form"); if (!f) return { pass: false, actual: "form немає", expected: "form" }; const empty = f.checkValidity(); const set = (s, v) => { if (ctx.$(s)) ctx.$(s).value = v; }; set("#guest-name", "Олена"); set("#guest-email", "olena@example.com"); set("#checkin", "2026-12-01"); set("#nights", "3"); const room = ctx.$("#room"); room.selectedIndex = 0; const noRoom = f.checkValidity(); room.selectedIndex = 2; const full = f.checkValidity(); return { pass: !empty && !noRoom && full, actual: "порожня: " + empty + ", без номера: " + noRoom + ", повна: " + full, expected: "порожня: false, без номера: false, повна: true" }; } },
        { name: "fieldset з legend «Додаткові послуги»", check: (ctx) => eq(ctx, ctx.$("fieldset legend") ? ctx.text("fieldset legend") : null, "Додаткові послуги") },
        { name: "Кнопка надсилання", check: (ctx) => eq(ctx, !!ctx.$('form button[type="submit"], form input[type="submit"]'), true) },
        { name: "800px — дві колонки", check: (ctx) => eq(ctx, ctx.$(".form-grid") ? ctx.style(".form-grid", "grid-template-columns").split(" ").length : 0, 2) },
        { name: "400px — одна колонка", width: 400, check: (ctx) => eq(ctx, ctx.$(".form-grid") ? ctx.style(".form-grid", "grid-template-columns").split(" ").length : 0, 1) },
      ],
      solution: { html: `<section id="booking">
  <h2>Бронювання</h2>
  <form>
    <div class="form-grid">
      <div class="field">
        <label for="guest-name">Ім'я</label>
        <input id="guest-name" name="name" required minlength="2">
      </div>
      <div class="field">
        <label for="guest-email">Пошта</label>
        <input id="guest-email" name="email" type="email" required>
      </div>
      <div class="field">
        <label for="checkin">Дата заїзду</label>
        <input id="checkin" name="checkin" type="date" required>
      </div>
      <div class="field">
        <label for="nights">Ночей</label>
        <input id="nights" name="nights" type="number" min="1" max="14">
      </div>
      <div class="field">
        <label for="room">Номер</label>
        <select id="room" name="room" required>
          <option value="">Оберіть номер</option>
          <option value="standard">Стандарт</option>
          <option value="lux">Люкс</option>
          <option value="penthouse">Пентхаус</option>
        </select>
      </div>
    </div>
    <fieldset>
      <legend>Додаткові послуги</legend>
      <input id="breakfast" name="breakfast" type="checkbox">
      <label for="breakfast">Сніданок</label>
      <input id="spa" name="spa" type="checkbox">
      <label for="spa">Спа</label>
    </fieldset>
    <button type="submit">Забронювати</button>
  </form>
</section>
`, css: `.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

fieldset {
  margin: 16px 0;
}

@media (min-width: 600px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}
` },
      hint: "Обов'язковий `select` вважається порожнім, коли вибрано опцію з `value=\"\"`.",
      difficulty: 3,
    }),
    L(12, {
      id: 53,
      title: "Перемикач теми «Люм'єр»",
      concept: "Повноцінна тема: токени кольорів у змінних, ручний вибір через `data-theme` на `<html>` і повага до системних налаштувань — `@media (prefers-color-scheme: dark)` вмикає темну тему, якщо користувач явно не обрав світлу (`:root:not([data-theme=\"light\"])`). Плавна зміна кольорів — через `transition`, яку вимикають для `prefers-reduced-motion`.",
      example: `@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #121314;
  }
}`,
      missionStory: "Гості «Люм'єр» гортають сайт і вдень на пляжі, і вночі в ліжку. Фінальний штрих — тема, що поважає і систему, і вибір гостя.",
      worldEvent: "Гранд-готель відчинив двері — острів будівельників завершено!",
      taskType: "write-markup",
      prompt: "Скрипт `theme.js` (лише для читання) ставить `data-theme` на `<html>`. Зроби:\n- кнопці `.theme-toggle` — `aria-label=\"Перемкнути тему\"`;\n- `:root`: `--bg: #ffffff`, `--text: #1b1612`, `--card: #f3eee2`;\n- `[data-theme=\"dark\"]`: `--bg: #121314`, `--text: #f3f2ee`, `--card: #1f2226`;\n- ті самі темні значення в `@media (prefers-color-scheme: dark)` для `:root:not([data-theme=\"light\"])`;\n- `body` — фон і текст зі змінних, `transition: background-color 0.3s`; `.card` — фон `var(--card)`;\n- у `@media (prefers-reduced-motion: reduce)` — `body { transition: none; }`.",
      readonlyFiles: [{ name: "theme.js", code: `const root = document.documentElement;
const toggle = document.querySelector(".theme-toggle");
const saved = localStorage.getItem("lumiere-theme");
if (saved) root.dataset.theme = saved;

toggle.addEventListener("click", () => {
  const dark = root.dataset.theme === "dark" ||
    (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  root.dataset.theme = dark ? "light" : "dark";
  localStorage.setItem("lumiere-theme", root.dataset.theme);
});` }],
      starterHtml: `<header class="topbar">
  <span class="logo">Люм'єр</span>
  <button class="theme-toggle" type="button">◐</button>
</header>
<main>
  <article class="card">
    <h2>Номер «Світанок»</h2>
    <p>Вид на море, сніданок включено.</p>
  </article>
</main>
`,
      starterCss: `/* тема «Люм'єр» */
`,
      testCases: [
        { name: "Кнопка має aria-label", check: (ctx) => eq(ctx, ctx.attr(".theme-toggle", "aria-label"), "Перемкнути тему") },
        // Системна тема може бути темною, тому світлу перевіряємо з явним вибором користувача.
        { name: "data-theme=\"light\" — світла тема", check: (ctx) => { ctx.doc.documentElement.dataset.theme = "light"; return eq(ctx, [ctx.style("body", "background-color"), ctx.style("body", "color"), ctx.style(".card", "background-color")].join(" / "), [ctx.color("#ffffff"), ctx.color("#1b1612"), ctx.color("#f3eee2")].join(" / ")); } },
        { name: "data-theme=\"dark\" — темна тема", check: (ctx) => { ctx.doc.documentElement.dataset.theme = "dark"; return eq(ctx, [ctx.style("body", "background-color"), ctx.style("body", "color"), ctx.style(".card", "background-color")].join(" / "), [ctx.color("#121314"), ctx.color("#f3f2ee"), ctx.color("#1f2226")].join(" / ")); } },
        { name: "Системна темна тема, якщо не обрано світлу", check: (ctx) => { const r = ctx.rules(/:root:not\(\[data-theme="?light"?\]\)/).find((x) => x.media && /prefers-color-scheme:\s*dark/.test(x.media)); return { pass: !!r && r.rule.style.getPropertyValue("--bg").trim() === "#121314" && r.rule.style.getPropertyValue("--card").trim() === "#1f2226", actual: r ? "--bg: " + r.rule.style.getPropertyValue("--bg").trim() : "правила в @media (prefers-color-scheme: dark) немає", expected: "--bg: #121314" }; } },
        { name: "Плавна зміна й повага до reduced-motion", check: (ctx) => { const off = ctx.rules(/^body$/).some((x) => x.media && /prefers-reduced-motion:\s*reduce/.test(x.media) && x.rule.style.getPropertyValue("transition-property") === "none"); const base = ctx.rules(/^body$/).find((x) => !x.media && x.rule.style.getPropertyValue("transition-property")); const t = base ? base.rule.style.getPropertyValue("transition-property") + " " + base.rule.style.getPropertyValue("transition-duration") : "переходу немає"; return { pass: !!base && /background-color/.test(t) && /0.3s/.test(t) && off, actual: t + (off ? ", reduced-motion: none" : ", reduced-motion не враховано"), expected: "background-color 0.3s, reduced-motion: none" }; } },
      ],
      solution: { html: `<header class="topbar">
  <span class="logo">Люм'єр</span>
  <button class="theme-toggle" type="button" aria-label="Перемкнути тему">◐</button>
</header>
<main>
  <article class="card">
    <h2>Номер «Світанок»</h2>
    <p>Вид на море, сніданок включено.</p>
  </article>
</main>
`, css: `:root {
  --bg: #ffffff;
  --text: #1b1612;
  --card: #f3eee2;
}

[data-theme="dark"] {
  --bg: #121314;
  --text: #f3f2ee;
  --card: #1f2226;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #121314;
    --text: #f3f2ee;
    --card: #1f2226;
  }
}

body {
  background: var(--bg);
  color: var(--text);
  transition: background-color 0.3s;
}

.card {
  padding: 16px;
  background: var(--card);
}

@media (prefers-reduced-motion: reduce) {
  body {
    transition: none;
  }
}
` },
      hint: "Блок `@media (prefers-color-scheme: dark)` містить те саме, що й `[data-theme=\"dark\"]`, лише з іншим селектором.",
      difficulty: 3,
    }),
  ];

  window.WORLD_DATA = window.WORLD_DATA || {};
  window.WORLD_DATA.web = {
    // Версія змісту: при перебудові світу старий прогрес скидається (див. game.js).
    contentVersion: 2,
    locations: LOCATIONS,
    levels: LEVELS,
    // Великі практичні місії світу.
    projects: [14, 21, 51, 52, 53],
  };
})();
