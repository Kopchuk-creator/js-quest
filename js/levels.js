/* =========================================================
   levels.js — світ JavaScript: 11 локацій і 96 рівнів.
   Зміст рівнів — за планом «JavaScript: 96 рівнів із ментором»:
   ті самі 14 арок і номери; наскрізний проєкт — навчальний трекер
   («Похідний журнал» мандрівника) із завданнями виду
   { id: 1, title: "Повторити функції", minutes: 30, done: false }.

   Поля рівня:
     prompt       — практичне завдання (початкові дані й потрібна поведінка)
     criteria     — коли рівень зараховано (показується під завданням)
     code         — фрагмент коду для predict-output / multiple-choice
     expectedAnswer — для predict-output: МАСИВ рядків, по одному на кожен console.log
     functionName — функція, яку викликають testCases з input/expectedOutput
     exports      — імена (функції чи змінні), які checker дістає з коду гравця
     html         — розмітка пісочниці для DOM-завдань (показується гравцю)
     codeChecks   — вимоги до самого коду; вони ж — пункти чеклиста
     testCases[]  — перевірки:
        input/expectedOutput — виклик functionName;
        inputs: { name: value } — вхідні дані, які тест підставляє як готові
                 змінні (до рівня 16 гравець ще не пише функцій);
        html / storage / fetch — розмітка, вміст localStorage і відповідь
                 сервера саме для цього тесту;
        check(ctx) — довільна перевірка для DOM / async / localStorage
     solution     — еталонне рішення; tests/run.html проганяє його через checker
   ========================================================= */

/* ---------- помічники для перевірок ---------- */

// Значення імені з коду гравця або undefined (ctx.get кидає помилку для undefined).
function jsqVal(ctx, name) {
  try { return ctx.get(name); } catch (e) { return undefined; }
}
// Порівнює кілька імен з очікуваними значеннями.
function jsqVars(expected) {
  return (ctx) => {
    const actual = {};
    Object.keys(expected).forEach((k) => { actual[k] = jsqVal(ctx, k); });
    return { pass: ctx.equal(actual, expected), actual: ctx.show(actual), expected: ctx.show(expected) };
  };
}
// Порівнює вивід console.log з очікуваними рядками.
function jsqLogs(expected) {
  return (ctx) => ({ pass: ctx.equal(ctx.logs, expected), actual: ctx.show(ctx.logs), expected: ctx.show(expected) });
}
// Текст елемента сторінки.
function jsqText(ctx, sel) {
  const el = ctx.$(sel);
  return el ? el.textContent.trim() : null;
}

window.LOCATIONS = [
  { id: 1,  name: "Табір змінних",       arcs: [1],        event: "Облаштовано табір, отримано перші інструменти", trophy: { name: "Кирка новачка",       icon: "pickaxe" } },
  { id: 2,  name: "Долина умов",         arcs: [2],        event: "Відчинено браму в долину",                       trophy: { name: "Ключ від брами",      icon: "key" } },
  { id: 3,  name: "Ліс функцій",         arcs: [3],        event: "Розчищено стежку через ліс",                     trophy: { name: "Сокира лісника",      icon: "axe" } },
  { id: 4,  name: "Печери масивів",      arcs: [4],        event: "Знайдено скарб у печерах",                       trophy: { name: "Самоцвіт печер",      icon: "gem" } },
  { id: 5,  name: "Святилище об'єктів",  arcs: [5],        event: "Активовано стародавнє святилище",                trophy: { name: "Руна святилища",      icon: "rune" } },
  { id: 6,  name: "Болото багів",        arcs: [6],        event: "Переможено боса-бага болота",                    trophy: { name: "Меч баговбивці",      icon: "sword" } },
  { id: 7,  name: "Міст DOM",            arcs: [7, 8, 9],  event: "Відбудовано міст через прірву",                  trophy: { name: "Молот мостобудівника", icon: "hammer" } },
  { id: 8,  name: "Скарбниця пам'яті",   arcs: [10],       event: "Відкрито скарбницю, що пам'ятає все",            trophy: { name: "Сувій пам'яті",       icon: "scroll" } },
  { id: 9,  name: "Вежа Async",          arcs: [11, 12],   event: "Підкорено вежу, приборкано час",                 trophy: { name: "Пісочний годинник",   icon: "hourglass" } },
  { id: 10, name: "Вершина вежі Async",  arcs: [13],       event: "Знешкоджено шторм помилок на вершині",           trophy: { name: "Щит від шторму",      icon: "shield" } },
  { id: 11, name: "Замок фіналу",        arcs: [14],       event: "Відбудовано замок — королівство врятоване",      trophy: { name: "Корона королівства",  icon: "crown" } },
];

const JSQ_ARCS = {
  1: ["Змінні, типи, оператори", "Табір змінних"],
  2: ["Умовні конструкції", "Долина умов"],
  3: ["Цикли та функції", "Ліс функцій"],
  4: ["Масиви", "Печери масивів"],
  5: ["Об'єкти", "Святилище об'єктів"],
  6: ["Поширені пастки", "Болото багів"],
  7: ["DOM, основи", "Міст DOM"],
  8: ["Події", "Міст DOM"],
  9: ["DOM, динамічний контент", "Міст DOM"],
  10: ["Збереження даних", "Скарбниця пам'яті"],
  11: ["Асинхронність, основи", "Вежа Async"],
  12: ["Promises та async/await", "Вежа Async"],
  13: ["Обробка помилок", "Вершина вежі Async"],
  14: ["Фінал", "Замок фіналу"],
};
// Рівень арки n: назва арки й локації підставляються автоматично.
function jsqLevel(n, data) {
  return Object.assign({ arc: JSQ_ARCS[n][0], arcNumber: n, locationName: JSQ_ARCS[n][1] }, data);
}

window.LEVELS = [
  /* ───────────── Арка I — Змінні, типи, оператори → Табір змінних ───────────── */
  jsqLevel(1, {
    id: 1,
    title: "let vs const — дані заняття",
    concept: "**Оголошення** створює змінну, **присвоєння** кладе в неї значення, **переприсвоєння** — замінює його новим. `const` забороняє переприсвоєння: значення задається одразу й більше не змінюється. `let` дозволяє переприсвоєння. Правило: пиши `const` за замовчуванням, а `let` — лише для значень, які справді змінюватимуться. Спроба переприсвоїти `const` дає помилку `TypeError: Assignment to constant variable.`",
    example: `const city = "Львів";   // місто не зміниться
let temperature = 12;    // температура зміниться
temperature = 15;        // ✓ переприсвоєння let
// city = "Київ";        // ✗ TypeError: Assignment to constant variable.`,
    missionStory: "Ти прибуваєш на галявину, де колись стояв табір. Перше, що робить мандрівник, — заводить похідний журнал навчання.",
    worldEvent: "У таборі спалахнуло перше вогнище.",
    taskType: "write-function",
    prompt: "Створи три змінні: назва курсу `courseName` — `\"JavaScript з нуля\"`, тривалість заняття `lessonMinutes` — `40`, кількість завершених занять `completedLessons` — `0`. Для кожної сам обери `let` чи `const`. Потім збільш `completedLessons` на 1 (запис `completedLessons = completedLessons + 1`), зміни тривалість на `45` і виведи всі три значення через `console.log`.",
    criteria: "назва лишилась незмінною, тривалість — 45, завершено 1 заняття; `const` стоїть лише там, де значення не переприсвоюється.",
    exports: ["courseName", "lessonMinutes", "completedLessons"],
    fileName: "journal.js",
    starterCode: `// Похідний журнал: дані заняття

`,
    testCases: [
      { name: "Значення після змін", check: jsqVars({ courseName: "JavaScript з нуля", lessonMinutes: 45, completedLessons: 1 }) },
      {
        name: "Усі три значення виведено в консоль",
        check(ctx) {
          const text = ctx.logs.join(" ");
          const pass = text.includes("JavaScript з нуля") && /\b45\b/.test(text) && /\b1\b/.test(text);
          return { pass, actual: ctx.show(ctx.logs), expected: "вивід з назвою курсу, 45 і 1" };
        },
      },
    ],
    codeChecks: [
      { re: /const\s+courseName\b/, label: "Назва курсу — `const` (не переприсвоюється)" },
      { re: /let\s+lessonMinutes\b/, label: "Тривалість — `let` (її змінюємо)" },
      { re: /let\s+completedLessons\b/, label: "Лічильник — `let` (його збільшуємо)" },
      { re: /\bvar\b/, not: true, label: "Без застарілого `var`" },
    ],
    solution: `const courseName = "JavaScript з нуля";
let lessonMinutes = 40;
let completedLessons = 0;

completedLessons = completedLessons + 1;
lessonMinutes = 45;

console.log(courseName);
console.log(lessonMinutes);
console.log(completedLessons);`,
    hint: "Для кожного значення спитай себе: «Чи буде воно переприсвоюватися далі в коді?» Тривалість і лічильник змінюються — отже `let`.",
    difficulty: 1,
  }),
  jsqLevel(1, {
    id: 2,
    title: "Типи даних — картка користувача",
    concept: "Основні типи на старті: **string** — текст у лапках (`\"25\"`), **number** — число (`25`), **boolean** — `true` чи `false`. `null` — значення «навмисно порожньо», яке ми ставимо самі. `undefined` — «значення ще немає», наприклад у змінної, оголошеної без присвоєння. Важливо: `25` і `\"25\"` — різні значення різних типів, так само `false` і `\"false\"`.",
    example: `const city = "Одеса";       // string
const population = 1000000; // number
const isCapital = false;    // boolean
const mayorPhoto = null;    // фото навмисно не задано
let nextTrip;               // undefined — значення ще немає`,
    missionStory: "У журналі з'являється перша сторінка — картка мандрівника. Писар табору просить записати дані точно, бо «25» у лапках і число 25 — різні речі.",
    worldEvent: "Картку мандрівника вписано в журнал.",
    taskType: "write-function",
    prompt: "Опиши картку користувача п'ятьма змінними: ім'я `userName` (будь-яке, рядок), вік `userAge` — число `25`, доступ до курсу `hasCourseAccess` — `true`, аватарка `avatar` — ще не вибрана (`null`), і `nickname` — оголошена без початкового значення.",
    criteria: "вік — саме число, доступ — саме boolean, аватарка — `null`, а `nickname` — `undefined`.",
    exports: ["userName", "userAge", "hasCourseAccess", "avatar"],
    fileName: "profile.js",
    starterCode: `// Картка мандрівника

`,
    testCases: [
      {
        name: "Ім'я — непорожній рядок",
        check(ctx) {
          const v = jsqVal(ctx, "userName");
          return { pass: typeof v === "string" && v.length > 0, actual: ctx.show(v), expected: "непорожній рядок" };
        },
      },
      {
        name: "Вік — число 25, а не рядок \"25\"",
        check(ctx) {
          const v = jsqVal(ctx, "userAge");
          return { pass: v === 25, actual: ctx.show(v) + " (" + typeof v + ")", expected: "25 (number)" };
        },
      },
      {
        name: "Доступ — true, а не рядок \"true\"",
        check(ctx) {
          const v = jsqVal(ctx, "hasCourseAccess");
          return { pass: v === true, actual: ctx.show(v) + " (" + typeof v + ")", expected: "true (boolean)" };
        },
      },
      { name: "Аватарка — null", check: jsqVars({ avatar: null }) },
    ],
    codeChecks: [{ re: /let\s+nickname\s*;/, label: "`nickname` оголошено без значення" }],
    solution: `const userName = "Олена";
const userAge = 25;
const hasCourseAccess = true;
const avatar = null;
let nickname;`,
    hint: "Число пишеться без лапок: `25`. Логічне значення — теж без лапок: `true`. Щоб змінна була `undefined`, просто оголоси її: `let nickname;`.",
    difficulty: 1,
  }),
  jsqLevel(1, {
    id: 3,
    title: "typeof — перевірка припущень",
    concept: "`typeof значення` повертає **рядок** із назвою типу: `\"number\"`, `\"string\"`, `\"boolean\"`, `\"undefined\"`. Історичний виняток: `typeof null` дає `\"object\"`. Це стара помилка мови, яку залишили для сумісності, — `null` від цього не стає звичайним об'єктом. А `NaN` («не число») за типом — `number`.",
    example: `typeof 3.14     // "number"
typeof "привіт" // "string"
typeof false    // "boolean"`,
    missionStory: "Писар перевіряє записи журналу: що з них число, а що лише схоже на число. Спершу передбач — потім звір.",
    worldEvent: "Записи журналу розкладено за типами.",
    taskType: "predict-output",
    prompt: "Передбач, що виведе кожен рядок. Пиши лише назву типу, наприклад `number`.",
    criteria: "усі вісім типів передбачено правильно, включно з `typeof null`.",
    answerHeading: "Що виведе консоль?",
    answerPlaceholder: "назва типу",
    starterCode: null,
    code: `console.log(typeof 42);
console.log(typeof "42");
console.log(typeof true);
console.log(typeof "true");
console.log(typeof undefined);
console.log(typeof null);
console.log(typeof NaN);
console.log(typeof typeof 42);`,
    expectedAnswer: ["number", "string", "boolean", "string", "undefined", "object", "number", "string"],
    hint: "Лапки роблять рядок з будь-чого. Останній рядок: спершу `typeof 42` дає рядок `\"number\"`, а потім `typeof` від цього рядка.",
    difficulty: 1,
  }),
  jsqLevel(1, {
    id: 4,
    title: "Приведення при + — сума чи склеювання",
    concept: "Оператор `+` робить дві різні речі. Якщо обидва значення — числа, він **додає**: `5 + 3` → `8`. Якщо хоча б одне — рядок, він **склеює**: `\"5\" + 3` → `\"53\"`. Дані з полів введення приходять рядками, тож сума легко перетворюється на склеєний текст. `Number(\"150\")` явно перетворює рядок на число `150`.",
    example: `console.log(5 + 3);     // 8
console.log("5" + 3);   // "53"
console.log(Number("5") + 3); // 8
console.log("Ціна: " + 20 + " грн"); // "Ціна: 20 грн"`,
    missionStory: "Скарбник табору рахує, скільки коштує заняття разом із матеріалами, — і в нього вийшло 15050 гривень. Щось тут не так.",
    worldEvent: "Кошторис табору зійшовся до гривні.",
    taskType: "fix-code",
    prompt: "Ціна заняття прийшла з форми рядком. Виправ код, щоб `total` був числом `200`, а `label` — рядком `\"Разом: 200 грн\"`.",
    criteria: "`total` — число 200, а не рядок \"15050\"; напис будується з правильної суми.",
    exports: ["total", "label"],
    fileName: "price.js",
    starterCode: `const lessonPrice = "150"; // прийшло з поля форми
const materialsPrice = 50;

const total = lessonPrice + materialsPrice;
const label = "Разом: " + total + " грн";

console.log(label);`,
    testCases: [
      {
        name: "total — число 200",
        check(ctx) {
          const v = jsqVal(ctx, "total");
          return { pass: v === 200, actual: ctx.show(v) + " (" + typeof v + ")", expected: "200 (number)" };
        },
      },
      { name: "Напис з правильною сумою", check: jsqVars({ label: "Разом: 200 грн" }) },
    ],
    codeChecks: [{ re: /Number\(/, label: "Рядок явно перетворено через `Number()`" }],
    solution: `const lessonPrice = "150"; // прийшло з поля форми
const materialsPrice = 50;

const total = Number(lessonPrice) + materialsPrice;
const label = "Разом: " + total + " грн";

console.log(label);`,
    hint: "Спершу перетвори рядок на число, потім додавай: `Number(lessonPrice) + materialsPrice`.",
    difficulty: 1,
  }),
  jsqLevel(1, {
    id: 5,
    title: "Приведення при -, *, / — арифметика",
    concept: "Оператори `-`, `*`, `/` не вміють склеювати, тому перетворюють рядки на числа: `\"10\" - 2` → `8`, `\"10\" * 2` → `20`. Якщо текст не є числом, результат — `NaN` («Not a Number»): `\"hello\" * 2` → `NaN`. Перевірити це можна через `Number.isNaN(значення)`. Явний `Number(...)` робить намір зрозумілим для читача коду.",
    example: `console.log("10" / 2);           // 5
console.log(Number("3.5") * 2);  // 7
console.log("abc" - 1);          // NaN
console.log(Number.isNaN("abc" - 1)); // true`,
    missionStory: "Учні записують у журнал кількість занять і ціну — але все приходить рядками, а деякі записи й зовсім не числа.",
    worldEvent: "Скарбник табору рахує без помилок.",
    taskType: "write-function",
    prompt: "Змінні `lessonsCount` і `pricePerLesson` уже задано — це **рядки** з форми (перевірка підставляє різні значення, не оголошуй їх). Обчисли `totalCost` — вартість усіх занять числом, і `isValid` — `true`, якщо вийшло справжнє число, і `false`, якщо `NaN`.",
    criteria: "для `\"4\"` × `\"150\"` виходить 600, для дробової ціни — точне число, для тексту — `NaN` і `isValid === false`.",
    exports: ["totalCost", "isValid"],
    fileName: "cost.js",
    starterCode: `// lessonsCount і pricePerLesson задає перевірка (рядки)

const totalCost = 0;
const isValid = true;`,
    testCases: [
      { name: "\"4\" заняття по \"150\" → 600", inputs: { lessonsCount: "4", pricePerLesson: "150" }, check: jsqVars({ totalCost: 600, isValid: true }) },
      { name: "\"3\" заняття по \"99.5\" → 298.5", inputs: { lessonsCount: "3", pricePerLesson: "99.5" }, check: jsqVars({ totalCost: 298.5, isValid: true }) },
      { name: "Текст замість числа → NaN, isValid false", inputs: { lessonsCount: "hello", pricePerLesson: "150" }, check: jsqVars({ totalCost: NaN, isValid: false }) },
    ],
    codeChecks: [{ re: /Number\.isNaN\(/, label: "NaN перевірено через `Number.isNaN()`" }],
    solution: `// lessonsCount і pricePerLesson задає перевірка (рядки)

const totalCost = Number(lessonsCount) * Number(pricePerLesson);
const isValid = !Number.isNaN(totalCost);`,
    hint: "`Number.isNaN(x)` повертає `true`, коли `x` — це `NaN`. Тобі потрібне протилежне — допоможе `!`.",
    difficulty: 2,
  }),
  jsqLevel(1, {
    id: 6,
    title: "Template literals — повідомлення користувачу",
    concept: "Шаблонний рядок пишеться у **зворотних лапках** (клавіша з тильдою `~`) і підставляє значення через `${...}`. Усередині `${}` може бути будь-який вираз: змінна, сума, множення. У звичайних лапках `\"...\"` запис `${name}` — просто текст, нічого не підставляється.",
    example: `const city = "Київ";
const days = 3;
console.log(\`Поїздка до \${city} на \${days} дні\`);
console.log(\`Годин у дорозі: \${days * 8}\`);`,
    missionStory: "Табірний вісник розсилає повідомлення учням, але замість імен усі отримують загадкове «${userName}».",
    worldEvent: "Вісник табору розсилає особисті повідомлення.",
    taskType: "fix-code",
    prompt: "Змінні `userName`, `lessonMinutes` і `days` задає перевірка. Виправ три повідомлення, щоб вони підставляли дані: `greeting` → `Привіт, Оля!`, `lessonInfo` → `Заняття триває 40 хв`, `totalInfo` → `За 5 дн. — 200 хв` (добуток рахується в самому рядку).",
    criteria: "після зміни даних повідомлення оновлюються самі, без ручного переписування.",
    exports: ["greeting", "lessonInfo", "totalInfo"],
    fileName: "messages.js",
    starterCode: `// userName, lessonMinutes і days задає перевірка

const greeting = "Привіт, \${userName}!";
const lessonInfo = "Заняття триває \${lessonMinutes} хв";
const totalInfo = "За \${days} дн. — \${days * lessonMinutes} хв";`,
    testCases: [
      { name: "Оля, 40 хв, 5 днів", inputs: { userName: "Оля", lessonMinutes: 40, days: 5 }, check: jsqVars({ greeting: "Привіт, Оля!", lessonInfo: "Заняття триває 40 хв", totalInfo: "За 5 дн. — 200 хв" }) },
      { name: "Інші дані — інші повідомлення", inputs: { userName: "Макс", lessonMinutes: 30, days: 3 }, check: jsqVars({ greeting: "Привіт, Макс!", lessonInfo: "Заняття триває 30 хв", totalInfo: "За 3 дн. — 90 хв" }) },
    ],
    codeChecks: [{ re: /`[^`]*\$\{/, label: "Використано шаблонний рядок із `${...}`" }],
    solution: `// userName, lessonMinutes і days задає перевірка

const greeting = \`Привіт, \${userName}!\`;
const lessonInfo = \`Заняття триває \${lessonMinutes} хв\`;
const totalInfo = \`За \${days} дн. — \${days * lessonMinutes} хв\`;`,
    hint: "Підстановка `${...}` працює лише у зворотних лапках. Заміни подвійні лапки на зворотні.",
    difficulty: 1,
  }),
  jsqLevel(1, {
    id: 7,
    title: "Truthy / Falsy — логічний контекст",
    concept: "Будь-яке значення в умові поводиться як `true` або `false`. **Falsy** (хибні) лише ці: `false`, `0`, `-0`, `\"\"` (порожній рядок), `null`, `undefined`, `NaN`. Усе інше — **truthy**, зокрема `\"0\"`, `\"false\"`, `\" \"` і `-1`. `Boolean(значення)` показує, яким воно стане в умові. Рядок `\"false\"` — непорожній текст, тому він truthy: JS не читає зміст слова.",
    example: `console.log(Boolean(42));     // true
console.log(Boolean(""));     // false
console.log(Boolean("ні"));   // true — непорожній рядок`,
    missionStory: "Вартовий пропускає до табору лише тих, у кого «справжня» перепустка. Але дехто приносить перепустки з написом «false».",
    worldEvent: "Вартовий навчився відрізняти справжні перепустки.",
    taskType: "predict-output",
    prompt: "Що виведе кожен рядок: `true` чи `false`?",
    criteria: "усі дев'ять відповідей правильні, і ти можеш пояснити, чому `\"false\"` дає `true`.",
    answerHeading: "true чи false?",
    answerPlaceholder: "true або false",
    lineLabels: ["Boolean(0)", "Boolean(1)", "Boolean(-1)", "Boolean(\"\")", "Boolean(\"0\")", "Boolean(\"false\")", "Boolean(null)", "Boolean(undefined)", "Boolean(NaN)"],
    starterCode: null,
    code: `console.log(Boolean(0));
console.log(Boolean(1));
console.log(Boolean(-1));
console.log(Boolean(""));
console.log(Boolean("0"));
console.log(Boolean("false"));
console.log(Boolean(null));
console.log(Boolean(undefined));
console.log(Boolean(NaN));`,
    expectedAnswer: ["false", "true", "true", "false", "true", "true", "false", "false", "false"],
    hint: "Запам'ятай короткий список falsy: `false`, `0`, `\"\"`, `null`, `undefined`, `NaN`. Усе, чого в ньому немає, — truthy.",
    difficulty: 1,
  }),
  jsqLevel(1, {
    id: 8,
    title: "=== vs == — порівняння",
    concept: "`===` (строге порівняння) порівнює і значення, і тип — без перетворень: `5 === \"5\"` → `false`. `==` (нестроге) спершу намагається привести типи: `5 == \"5\"` → `true`, `0 == false` → `true`. Окремий випадок: `null == undefined` дає `true`, а `null === undefined` — `false`. У робочому коді пиши `===`. І не плутай з `=`: один знак — це присвоєння, а не порівняння.",
    example: `console.log(1 === 1);    // true
console.log(1 === "1");  // false — різні типи
console.log(1 == "1");   // true — рядок перетворено на число`,
    missionStory: "Комірник порівнює номери ящиків у журналі з номерами на складі. Частина номерів записана текстом — і порівняння починає брехати.",
    worldEvent: "Номери ящиків нарешті збігаються з журналом.",
    taskType: "predict-output",
    prompt: "Спершу запиши очікування для кожного порівняння, а потім перевір себе.",
    criteria: "усі шість результатів правильні; ти пояснюєш, де відбулося приведення типів.",
    answerHeading: "Що виведе консоль?",
    answerPlaceholder: "true або false",
    starterCode: null,
    code: `console.log(5 === "5");
console.log(5 == "5");
console.log(0 === false);
console.log(0 == false);
console.log(null === undefined);
console.log(null == undefined);`,
    expectedAnswer: ["false", "true", "false", "true", "false", "true"],
    hint: "`===` ніколи не перетворює типи: різні типи — завжди `false`. `==` перетворює, тому `\"5\"` стає `5`, а `false` — `0`.",
    difficulty: 1,
  }),
  jsqLevel(1, {
    id: 9,
    title: "Тернарний оператор — один із двох написів",
    concept: "Тернарний оператор вибирає одне з двох значень: `умова ? значенняЯкщоТак : значенняЯкщоНі`. Це **вираз** — він має результат, який можна покласти в змінну. Зручний для коротких написів. Вкладені тернарні оператори важко читати — їх уникаємо.",
    example: `const temperature = 28;
const advice = temperature > 25 ? "Візьми воду" : "Візьми куртку";
console.log(advice); // "Візьми воду"`,
    missionStory: "Біля кожного запису журналу мандрівник ставить коротку позначку. Писати їх уручну — довго; нехай код вибирає сам.",
    worldEvent: "Записи журналу отримали позначки стану.",
    taskType: "write-function",
    prompt: "Змінні `done`, `hasCourse`, `studiedMinutes` і `dailyGoal` задає перевірка. Через тернарний оператор створи три написи: `taskLabel` — `\"Виконано\"` або `\"У процесі\"`; `courseLabel` — `\"Курс доступний\"` або `\"Курс закрито\"`; `goalLabel` — `\"Ціль досягнута\"`, якщо хвилин **не менше** за ціль, інакше `\"Ще трохи\"`.",
    criteria: "перевірено обидві гілки кожного напису, а рівно на межі цілі вона вважається досягнутою.",
    exports: ["taskLabel", "courseLabel", "goalLabel"],
    fileName: "labels.js",
    starterCode: `// done, hasCourse, studiedMinutes і dailyGoal задає перевірка

const taskLabel = "";
const courseLabel = "";
const goalLabel = "";`,
    testCases: [
      { name: "Усе «так»: виконано, курс є, 45 ≥ 40", inputs: { done: true, hasCourse: true, studiedMinutes: 45, dailyGoal: 40 }, check: jsqVars({ taskLabel: "Виконано", courseLabel: "Курс доступний", goalLabel: "Ціль досягнута" }) },
      { name: "Усе «ні»: не виконано, курсу немає, 20 < 40", inputs: { done: false, hasCourse: false, studiedMinutes: 20, dailyGoal: 40 }, check: jsqVars({ taskLabel: "У процесі", courseLabel: "Курс закрито", goalLabel: "Ще трохи" }) },
      { name: "Рівно на межі: 40 із 40", inputs: { done: false, hasCourse: true, studiedMinutes: 40, dailyGoal: 40 }, check: jsqVars({ taskLabel: "У процесі", courseLabel: "Курс доступний", goalLabel: "Ціль досягнута" }) },
    ],
    codeChecks: [{ re: /\?[^:]+:/, label: "Використано тернарний оператор `? :`" }],
    solution: `// done, hasCourse, studiedMinutes і dailyGoal задає перевірка

const taskLabel = done ? "Виконано" : "У процесі";
const courseLabel = hasCourse ? "Курс доступний" : "Курс закрито";
const goalLabel = studiedMinutes >= dailyGoal ? "Ціль досягнута" : "Ще трохи";`,
    hint: "«Не менше» — це `>=`. Шаблон: `const goalLabel = studiedMinutes >= dailyGoal ? ... : ...;`",
    difficulty: 1,
  }),
  jsqLevel(1, {
    id: 10,
    title: "&&, ||, ! — комбінуємо перевірки",
    concept: "`a && b` — «і»: істина, коли обидва truthy. `a || b` — «або»: істина, коли хоча б один truthy. `!a` — «не»: перевертає значення. Важливо: `&&` і `||` повертають **один з операндів**, а не обов'язково `true`/`false`. Тому `name || \"Гість\"` дає запасне ім'я, коли `name` порожнє. Але пастка: для `0` теж спрацює запасне значення, бо `0` — falsy, навіть якщо нуль — коректне число.",
    example: `const city = "" || "Невідоме місто";   // "Невідоме місто"
const count = 0 || 10;                  // 10 — нуль замінено!
const canDrive = hasLicense && isAdult; // true лише якщо обидва true`,
    missionStory: "Біля виходу з табору — брама з правилами: пройти можна лише активним учням з оплатою, а безіменним мандрівникам дають ім'я «Гість».",
    worldEvent: "Облаштовано табір, отримано перші інструменти!",
    taskType: "write-function",
    prompt: "Змінні `isActive`, `hasPaid`, `userName` і `savedMinutes` задає перевірка. Створи: `canStart` — доступ є, лише якщо користувач активний **і** оплатив; `isLocked` — протилежне до `canStart` (через `!`); `displayName` — ім'я або запасне `\"Гість\"` (через `||`); `minutesShown` — `savedMinutes` або запасне `30` (через `||`).",
    criteria: "доступ правильний для всіх комбінацій прапорців; ти бачиш, що `||` замінює і порожній рядок, і коректний нуль.",
    exports: ["canStart", "isLocked", "displayName", "minutesShown"],
    fileName: "gate.js",
    starterCode: `// isActive, hasPaid, userName і savedMinutes задає перевірка

const canStart = false;
const isLocked = true;
const displayName = "";
const minutesShown = 0;`,
    testCases: [
      { name: "Активний з оплатою, ім'я є, 45 хв", inputs: { isActive: true, hasPaid: true, userName: "Оля", savedMinutes: 45 }, check: jsqVars({ canStart: true, isLocked: false, displayName: "Оля", minutesShown: 45 }) },
      { name: "Активний без оплати → доступу немає", inputs: { isActive: true, hasPaid: false, userName: "Макс", savedMinutes: 20 }, check: jsqVars({ canStart: false, isLocked: true, displayName: "Макс", minutesShown: 20 }) },
      { name: "Порожнє ім'я → «Гість»; нуль хвилин → 30 (пастка ||)", inputs: { isActive: false, hasPaid: true, userName: "", savedMinutes: 0 }, check: jsqVars({ canStart: false, isLocked: true, displayName: "Гість", minutesShown: 30 }) },
    ],
    codeChecks: [
      { re: /&&/, label: "Використано `&&`" },
      { re: /\|\|/, label: "Використано `||`" },
      { re: /!\s*canStart/, label: "`isLocked` побудовано через `!`" },
    ],
    solution: `// isActive, hasPaid, userName і savedMinutes задає перевірка

const canStart = isActive && hasPaid;
const isLocked = !canStart;
const displayName = userName || "Гість";
const minutesShown = savedMinutes || 30;`,
    hint: "`isLocked` — це просто `!canStart`. Для запасних значень шаблон такий: `значення || запасне`.",
    difficulty: 2,
  }),

  /* ───────────── Арка II — Умовні конструкції → Долина умов ───────────── */
  jsqLevel(2, {
    id: 11,
    title: "if / else — досягнення цілі",
    concept: "`if (умова) { ... } else { ... }` виконує **дії** однієї з двох гілок. На відміну від тернарного оператора, у гілках може бути кілька рядків коду. Межі завжди перевіряй окремо: значення нижче, рівно на межі й вище.",
    example: `const fuel = 15;
if (fuel >= 20) {
  console.log("Можна їхати");
} else {
  console.log(\`Долий \${20 - fuel} л\`);
}`,
    missionStory: "Біля брами Долини умов мандрівник щовечора звіряє, скільки навчався, з денною ціллю.",
    worldEvent: "Перша брама долини відчинилась.",
    taskType: "write-function",
    prompt: "Змінні `studiedMinutes` і `dailyGoal` задає перевірка. Через `if / else` виведи в консоль одне повідомлення: якщо ціль досягнута (хвилин не менше за ціль) — `Ціль досягнута!`, інакше — `Бракує N хв`, де N — скільки хвилин не вистачає.",
    criteria: "правильне повідомлення нижче цілі, рівно на межі й вище; виводиться рівно одне повідомлення.",
    fileName: "goal.js",
    starterCode: `// studiedMinutes і dailyGoal задає перевірка
`,
    testCases: [
      { name: "20 із 30 → Бракує 10 хв", inputs: { studiedMinutes: 20, dailyGoal: 30 }, check: jsqLogs(["Бракує 10 хв"]) },
      { name: "Рівно 30 із 30 → Ціль досягнута!", inputs: { studiedMinutes: 30, dailyGoal: 30 }, check: jsqLogs(["Ціль досягнута!"]) },
      { name: "45 із 30 → Ціль досягнута!", inputs: { studiedMinutes: 45, dailyGoal: 30 }, check: jsqLogs(["Ціль досягнута!"]) },
    ],
    codeChecks: [{ re: /\bif\s*\(/, label: "Використано `if`" }, { re: /\belse\b/, label: "Використано `else`" }],
    solution: `// studiedMinutes і dailyGoal задає перевірка
if (studiedMinutes >= dailyGoal) {
  console.log("Ціль досягнута!");
} else {
  console.log(\`Бракує \${dailyGoal - studiedMinutes} хв\`);
}`,
    hint: "Кількість хвилин, яких бракує, — це `dailyGoal - studiedMinutes`.",
    difficulty: 1,
  }),
  jsqLevel(2, {
    id: 12,
    title: "else if — кілька станів прогресу",
    concept: "Ланцюжок `if ... else if ... else` перевіряє умови **по черзі** зверху вниз і виконує **першу** гілку, умова якої істинна. Решту вже не перевіряє. Тому порядок важливий: якщо широка умова стоїть вище за вузьку, вузька ніколи не спрацює. Спершу запиши межі словами, потім — кодом.",
    example: `let size;
if (weight < 1) {
  size = "мала";
} else if (weight < 10) {
  size = "середня";
} else {
  size = "велика";
}`,
    missionStory: "Сторож долини ділить мандрівників на чотири групи за часом навчання — але плутає межі, і всі опиняються в одній групі.",
    worldEvent: "Мандрівників розподілено за прогресом.",
    taskType: "fix-code",
    prompt: "Змінну `minutes` задає перевірка. Межі такі: `0` — `\"Не почав\"`; від 1 до 29 — `\"Коротке заняття\"`; від 30 до 45 включно — `\"Повне заняття\"`; понад 45 — `\"Перевищив план\"`. Виправ порядок перевірок, щоб `status` завжди був правильним.",
    criteria: "перевірено всі межі: 0, 1, 29, 30, 45, 46 — без пропущених чи перекритих діапазонів.",
    exports: ["status"],
    fileName: "progress.js",
    starterCode: `// minutes задає перевірка
let status;

if (minutes <= 45) {
  status = "Повне заняття";
} else if (minutes < 30) {
  status = "Коротке заняття";
} else if (minutes === 0) {
  status = "Не почав";
} else {
  status = "Перевищив план";
}`,
    testCases: [
      { name: "0 → Не почав", inputs: { minutes: 0 }, check: jsqVars({ status: "Не почав" }) },
      { name: "1 → Коротке заняття", inputs: { minutes: 1 }, check: jsqVars({ status: "Коротке заняття" }) },
      { name: "29 → Коротке заняття", inputs: { minutes: 29 }, check: jsqVars({ status: "Коротке заняття" }) },
      { name: "30 → Повне заняття", inputs: { minutes: 30 }, check: jsqVars({ status: "Повне заняття" }) },
      { name: "45 → Повне заняття", inputs: { minutes: 45 }, check: jsqVars({ status: "Повне заняття" }) },
      { name: "46 → Перевищив план", inputs: { minutes: 46 }, check: jsqVars({ status: "Перевищив план" }) },
    ],
    solution: `// minutes задає перевірка
let status;

if (minutes === 0) {
  status = "Не почав";
} else if (minutes < 30) {
  status = "Коротке заняття";
} else if (minutes <= 45) {
  status = "Повне заняття";
} else {
  status = "Перевищив план";
}`,
    hint: "Йди від найвужчої умови до найширшої: спершу точний нуль, потім «менше 30», потім «до 45 включно».",
    difficulty: 2,
  }),
  jsqLevel(2, {
    id: 13,
    title: "Об'єднання умов — правила доступу",
    concept: "Умови комбінують через `&&` і `||`. `&&` виконується раніше за `||`, але дужки роблять задум очевидним: `(a && b) || c`. Ще краще — винести частини в змінні з назвами: `const isPayingStudent = isActive && hasPaid;` — так правило читається як речення.",
    example: `const isWeekend = day === "сб" || day === "нд";
const canRest = isWeekend && !hasDeadline;`,
    missionStory: "Друга брама долини пускає активних учнів з оплаченим курсом — і адміністраторів. Але вартовий не пускає адміністратора, коли той «неактивний».",
    worldEvent: "Брама долини пам'ятає правила доступу.",
    taskType: "fix-code",
    prompt: "Змінні `isActive`, `hasPaid` і `isAdmin` задає перевірка. Правило: доступ є в **активного користувача з оплаченим курсом** або в **адміністратора** (адміністратору активність не потрібна). Виправ `hasAccess`.",
    criteria: "правильний результат для активного без оплати, неактивного з оплатою й адміністратора.",
    exports: ["hasAccess"],
    fileName: "access.js",
    starterCode: `// isActive, hasPaid і isAdmin задає перевірка

const hasAccess = isActive && (hasPaid || isAdmin);`,
    testCases: [
      { name: "Активний з оплатою → є", inputs: { isActive: true, hasPaid: true, isAdmin: false }, check: jsqVars({ hasAccess: true }) },
      { name: "Активний без оплати → немає", inputs: { isActive: true, hasPaid: false, isAdmin: false }, check: jsqVars({ hasAccess: false }) },
      { name: "Неактивний з оплатою → немає", inputs: { isActive: false, hasPaid: true, isAdmin: false }, check: jsqVars({ hasAccess: false }) },
      { name: "Неактивний адміністратор → є", inputs: { isActive: false, hasPaid: false, isAdmin: true }, check: jsqVars({ hasAccess: true }) },
    ],
    solution: `// isActive, hasPaid і isAdmin задає перевірка

const isPayingStudent = isActive && hasPaid;
const hasAccess = isPayingStudent || isAdmin;`,
    hint: "Дужки зараз обіймають не ту частину. Склей «активний і оплатив» в одну групу, а адміністратора додай через `||`.",
    difficulty: 2,
  }),
  jsqLevel(2, {
    id: 14,
    title: "switch / case / break — вибір режиму",
    concept: "`switch (значення)` порівнює значення з кожним `case` **строго** (як `===`) і починає виконання з першого збігу. `break` зупиняє виконання. Без `break` код «провалюється» в наступний `case` і виконує його теж — звідси зайві дії.",
    example: `switch (weather) {
  case "дощ":
    console.log("Парасолька");
    break;
  case "сонце":
    console.log("Окуляри");
    break;
}`,
    missionStory: "Провідник долини дає інструкцію за режимом дня. Але на «learn» він чомусь каже одразу дві речі.",
    worldEvent: "Провідник дає рівно одну інструкцію.",
    taskType: "fix-code",
    prompt: "Змінну `mode` задає перевірка. Для `\"learn\"` має виводитися лише `Читай теорію й приклад`, для `\"practice\"` — `Пиши код сам`, для `\"review\"` — `Повтори вчорашнє`. Знайди, чому один режим друкує зайве, і виправ.",
    criteria: "кожен відомий режим запускає лише свою дію; ти пояснюєш, звідки бралося зайве повідомлення.",
    fileName: "mode.js",
    starterCode: `// mode задає перевірка
switch (mode) {
  case "learn":
    console.log("Читай теорію й приклад");
  case "practice":
    console.log("Пиши код сам");
    break;
  case "review":
    console.log("Повтори вчорашнє");
    break;
}`,
    testCases: [
      { name: "learn → одна інструкція", inputs: { mode: "learn" }, check: jsqLogs(["Читай теорію й приклад"]) },
      { name: "practice → одна інструкція", inputs: { mode: "practice" }, check: jsqLogs(["Пиши код сам"]) },
      { name: "review → одна інструкція", inputs: { mode: "review" }, check: jsqLogs(["Повтори вчорашнє"]) },
    ],
    codeChecks: [{ re: /switch\s*\(/, label: "Використано `switch`" }],
    solution: `// mode задає перевірка
switch (mode) {
  case "learn":
    console.log("Читай теорію й приклад");
    break;
  case "practice":
    console.log("Пиши код сам");
    break;
  case "review":
    console.log("Повтори вчорашнє");
    break;
}`,
    hint: "Подивись, чим `case \"learn\"` відрізняється від інших гілок. Чого там бракує в кінці?",
    difficulty: 1,
  }),
  jsqLevel(2, {
    id: 15,
    title: "default — невідомий режим",
    concept: "`default` у `switch` — запасна гілка: вона виконується, коли жоден `case` не збігся. Її зазвичай пишуть останньою. Для короткого вибору з кількох конкретних значень `switch` читається легше, ніж ланцюжок `if`; для діапазонів (`< 30`, `>= 45`) зручніший `if`.",
    example: `switch (color) {
  case "red":
    console.log("Стоп");
    break;
  default:
    console.log("Невідомий сигнал");
}`,
    missionStory: "Учні вигадують нові режими або роблять одруківки — і провідник мовчить. Навчи його відповідати на невідоме.",
    worldEvent: "Провідник більше не мовчить у відповідь на невідоме.",
    taskType: "fix-code",
    prompt: "Розшир перемикач: для будь-якого невідомого `mode` виводь `Невідомий режим: <значення>`, наприклад `Невідомий режим: lern`. Відомі режими мають працювати як раніше.",
    criteria: "перевірено порожній рядок, одруківку й відомі режими — кожен отримує рівно одне повідомлення.",
    fileName: "mode.js",
    starterCode: `// mode задає перевірка
switch (mode) {
  case "learn":
    console.log("Читай теорію й приклад");
    break;
  case "practice":
    console.log("Пиши код сам");
    break;
  case "review":
    console.log("Повтори вчорашнє");
    break;
}`,
    testCases: [
      { name: "Одруківка «lern»", inputs: { mode: "lern" }, check: jsqLogs(["Невідомий режим: lern"]) },
      { name: "Порожній рядок", inputs: { mode: "" }, check: jsqLogs(["Невідомий режим: "]) },
      { name: "Відомий режим learn", inputs: { mode: "learn" }, check: jsqLogs(["Читай теорію й приклад"]) },
      { name: "Відомий режим practice", inputs: { mode: "practice" }, check: jsqLogs(["Пиши код сам"]) },
      { name: "Відомий режим review", inputs: { mode: "review" }, check: jsqLogs(["Повтори вчорашнє"]) },
    ],
    codeChecks: [{ re: /default\s*:/, label: "Є гілка `default`" }],
    solution: `// mode задає перевірка
switch (mode) {
  case "learn":
    console.log("Читай теорію й приклад");
    break;
  case "practice":
    console.log("Пиши код сам");
    break;
  case "review":
    console.log("Повтори вчорашнє");
    break;
  default:
    console.log(\`Невідомий режим: \${mode}\`);
}`,
    hint: "Додай останньою гілку `default:` з `console.log(...)`. Значення підстав через шаблонний рядок.",
    difficulty: 1,
  }),
  jsqLevel(2, {
    id: 16,
    title: "Ранній return — відсіяти непридатне",
    concept: "**Функція** — іменований блок коду з **параметрами** (вхідними даними). Виклик `getAccessMessage(true, false)` передає їй **аргументи**, а `return значення` повертає результат і **одразу завершує** функцію — рядки після нього не виконуються. Прийом «ранній return»: спершу відсіяти непридатні випадки, а «щасливий шлях» залишити наприкінці. Так зникає вкладеність `if` в `if`. Самі функції писатимемо з нуля на рівні 21.",
    example: `function getTicketMessage(hasTicket, isLate) {
  if (!hasTicket) return "Купи квиток";
  if (isLate) return "Потяг уже пішов";
  return "Гарної поїздки!";
}`,
    missionStory: "Остання брама Долини умов перевіряє мандрівників по черзі: спершу активність профілю, потім курс. Але зараз вона пускає всіх підряд.",
    worldEvent: "Відчинено браму в долину!",
    taskType: "fix-code",
    prompt: "Функція `getAccessMessage(isActive, hasCourse)` уже є. Допиши в неї ранні `return`: неактивний профіль → `\"Профіль неактивний\"`; немає курсу → `\"Спершу обери курс\"`; інакше → `\"Доступ відкрито\"`.",
    criteria: "правильний результат для всіх чотирьох комбінацій; ти показуєш, які рядки не виконаються після раннього `return`.",
    functionName: "getAccessMessage",
    fileName: "access.js",
    starterCode: `function getAccessMessage(isActive, hasCourse) {
  // 1) неактивний профіль → "Профіль неактивний"
  // 2) немає курсу → "Спершу обери курс"
  return "Доступ відкрито";
}`,
    testCases: [
      { input: [false, false], expectedOutput: "Профіль неактивний" },
      { input: [false, true], expectedOutput: "Профіль неактивний" },
      { input: [true, false], expectedOutput: "Спершу обери курс" },
      { input: [true, true], expectedOutput: "Доступ відкрито" },
    ],
    codeChecks: [{ re: /return[\s\S]*return[\s\S]*return/, label: "Три `return`: дві ранні перевірки й успіх" }],
    solution: `function getAccessMessage(isActive, hasCourse) {
  if (!isActive) return "Профіль неактивний";
  if (!hasCourse) return "Спершу обери курс";
  return "Доступ відкрито";
}`,
    hint: "Перший рядок функції: `if (!isActive) return \"Профіль неактивний\";`. Другий — так само для курсу.",
    difficulty: 1,
  }),

  /* ───────────── Арка III — Цикли та функції → Ліс функцій ───────────── */
  jsqLevel(3, {
    id: 17,
    title: "for — повторення з лічильником",
    concept: "`for (let i = 1; i <= n; i++) { ... }` має три частини: **початок** (`let i = 1`), **умова** продовження (`i <= n`) і **крок** (`i++` — збільшити на 1). Тіло повторюється, поки умова істинна. Різниця `<` і `<=` — це рівно одне зайве чи пропущене повторення. Якщо `n` дорівнює 0, тіло не виконається жодного разу.",
    example: `for (let i = 1; i <= 3; i++) {
  console.log(\`Крок \${i}\`);
}
// Крок 1, Крок 2, Крок 3`,
    missionStory: "У Лісі функцій мандрівник планує заняття на тиждень і хоче бачити кожне з них окремо.",
    worldEvent: "Розклад занять висить на першому дереві лісу.",
    taskType: "write-function",
    prompt: "Змінні `lessonsCount` і `minutesPerLesson` задає перевірка. Через `for` виведи `Заняття 1`, `Заняття 2`, … до `Заняття N`. Заодно порахуй у змінній `totalMinutes` сумарний час усіх занять (додаючи в циклі).",
    criteria: "правильна кількість повторень для 0, 1 і 7 занять; ти пояснюєш усі три частини заголовка циклу.",
    exports: ["totalMinutes"],
    fileName: "schedule.js",
    starterCode: `// lessonsCount і minutesPerLesson задає перевірка
let totalMinutes = 0;
`,
    testCases: [
      { name: "7 занять по 40 хв", inputs: { lessonsCount: 7, minutesPerLesson: 40 }, check(ctx) { const exp = ["Заняття 1", "Заняття 2", "Заняття 3", "Заняття 4", "Заняття 5", "Заняття 6", "Заняття 7"]; const t = jsqVal(ctx, "totalMinutes"); return { pass: ctx.equal(ctx.logs, exp) && t === 280, actual: ctx.show(ctx.logs) + ", totalMinutes = " + ctx.show(t), expected: ctx.show(exp) + ", totalMinutes = 280" }; } },
      { name: "1 заняття", inputs: { lessonsCount: 1, minutesPerLesson: 30 }, check(ctx) { const t = jsqVal(ctx, "totalMinutes"); return { pass: ctx.equal(ctx.logs, ["Заняття 1"]) && t === 30, actual: ctx.show(ctx.logs) + ", " + ctx.show(t), expected: "[\"Заняття 1\"], 30" }; } },
      { name: "0 занять — жодного рядка", inputs: { lessonsCount: 0, minutesPerLesson: 30 }, check(ctx) { const t = jsqVal(ctx, "totalMinutes"); return { pass: ctx.logs.length === 0 && t === 0, actual: ctx.show(ctx.logs) + ", " + ctx.show(t), expected: "[], 0" }; } },
    ],
    codeChecks: [{ re: /for\s*\(\s*let/, label: "Використано цикл `for`" }],
    solution: `// lessonsCount і minutesPerLesson задає перевірка
let totalMinutes = 0;

for (let i = 1; i <= lessonsCount; i++) {
  console.log(\`Заняття \${i}\`);
  totalMinutes = totalMinutes + minutesPerLesson;
}`,
    hint: "Лічильник починай з 1, а умову пиши `i <= lessonsCount`. У тілі — вивід і додавання до `totalMinutes`.",
    difficulty: 1,
  }),
  jsqLevel(3, {
    id: 18,
    title: "while — повторення до виконання умови",
    concept: "`while (умова) { ... }` повторює тіло, **поки** умова істинна. Тут немає вбудованого лічильника: стан, від якого залежить умова, має змінюватися в тілі — інакше цикл ніколи не скінчиться. Якщо умова хибна з самого початку, тіло не виконається жодного разу.",
    example: `let water = 0;
while (water < 1000) {
  water = water + 250; // наливаємо склянку
}
console.log(water); // 1000`,
    missionStory: "Лісоруб працює блоками по 10 хвилин, доки не набере денну ціль. Скільки блоків йому знадобиться?",
    worldEvent: "Лісоруб знає, скільки блоків роботи потрібно.",
    taskType: "write-function",
    prompt: "Змінну `goal` (ціль у хвилинах) задає перевірка. Через `while` накопичуй хвилини блоками по 10 у змінній `total`, доки не досягнеш цілі. У `blocks` порахуй кількість блоків.",
    criteria: "перевірено цілі 0, 20 і 25; ти розумієш, чому для 25 сума стає 30.",
    exports: ["total", "blocks"],
    fileName: "blocks.js",
    starterCode: `// goal задає перевірка
let total = 0;
let blocks = 0;
`,
    testCases: [
      { name: "Ціль 20 → 2 блоки, 20 хв", inputs: { goal: 20 }, check: jsqVars({ total: 20, blocks: 2 }) },
      { name: "Ціль 25 → 3 блоки, 30 хв", inputs: { goal: 25 }, check: jsqVars({ total: 30, blocks: 3 }) },
      { name: "Ціль 0 → жодного блоку", inputs: { goal: 0 }, check: jsqVars({ total: 0, blocks: 0 }) },
    ],
    codeChecks: [{ re: /while\s*\(/, label: "Використано цикл `while`" }],
    solution: `// goal задає перевірка
let total = 0;
let blocks = 0;

while (total < goal) {
  total = total + 10;
  blocks = blocks + 1;
}`,
    hint: "Умова циклу — «ще не досягли цілі»: `total < goal`. У тілі змінюються обидві змінні.",
    difficulty: 1,
  }),
  jsqLevel(3, {
    id: 19,
    title: "continue — пропуск окремого кроку",
    concept: "`continue` пропускає **решту поточного повторення** і переходить до наступного. Цикл при цьому не завершується. У `for` лічильник оновиться сам, а у варіанті з `while` збільш лічильник **до** `continue` — інакше він застрягне на тому самому значенні й цикл зависне.",
    example: `for (let n = 1; n <= 5; n++) {
  if (n === 3) continue; // пропускаємо 3
  console.log(n);        // 1, 2, 4, 5
}`,
    missionStory: "Мандрівник складає двотижневий план навчання. Вихідні — для відпочинку, їх у план не вписують.",
    worldEvent: "У плані навчання з'явилися вихідні.",
    taskType: "write-function",
    prompt: "Змінну `daysTotal` задає перевірка. Перебери дні від 1 до `daysTotal`. Вихідні — дні, номер яких при діленні на 7 дає остачу 6 або 0 (`day % 7`). Їх пропускай через `continue`, а для решти виводь `День N` і рахуй їх у `studyDays`.",
    criteria: "пропущено лише вихідні; ти пояснюєш, де оновлюється лічильник.",
    exports: ["studyDays"],
    fileName: "plan.js",
    starterCode: `// daysTotal задає перевірка
let studyDays = 0;
`,
    testCases: [
      { name: "14 днів → 10 навчальних", inputs: { daysTotal: 14 }, check(ctx) { const exp = [1, 2, 3, 4, 5, 8, 9, 10, 11, 12].map((d) => "День " + d); const s = jsqVal(ctx, "studyDays"); return { pass: ctx.equal(ctx.logs, exp) && s === 10, actual: ctx.show(ctx.logs) + ", studyDays = " + ctx.show(s), expected: ctx.show(exp) + ", studyDays = 10" }; } },
      { name: "7 днів → 5 навчальних", inputs: { daysTotal: 7 }, check(ctx) { const s = jsqVal(ctx, "studyDays"); return { pass: ctx.logs.length === 5 && s === 5, actual: ctx.show(ctx.logs) + ", " + ctx.show(s), expected: "5 рядків, 5" }; } },
      { name: "12 днів → останній день теж навчальний", inputs: { daysTotal: 12 }, check(ctx) { const s = jsqVal(ctx, "studyDays"); const last = ctx.logs[ctx.logs.length - 1]; return { pass: s === 10 && last === "День 12", actual: ctx.show(s) + ", останній рядок " + ctx.show(last), expected: "10, останній рядок \"День 12\"" }; } },
    ],
    codeChecks: [{ re: /\bcontinue\b/, label: "Використано `continue`" }],
    solution: `// daysTotal задає перевірка
let studyDays = 0;

for (let day = 1; day <= daysTotal; day++) {
  if (day % 7 === 6 || day % 7 === 0) continue;
  console.log(\`День \${day}\`);
  studyDays = studyDays + 1;
}`,
    hint: "Умова вихідного: `day % 7 === 6 || day % 7 === 0`. Якщо вона істинна — `continue`.",
    difficulty: 2,
  }),
  jsqLevel(3, {
    id: 20,
    title: "Вкладені цикли — розклад",
    concept: "Цикл усередині циклу: для **кожного** кроку зовнішнього циклу внутрішній виконується **повністю заново**. Для 3 днів по 2 блоки це 3 × 2 = 6 повторень тіла. Лічильники мають різні імена (`day`, `block`), інакше внутрішній зіпсує зовнішній.",
    example: `for (let row = 1; row <= 2; row++) {
  for (let seat = 1; seat <= 2; seat++) {
    console.log(\`Ряд \${row}, місце \${seat}\`);
  }
}`,
    missionStory: "Лісничий просить розписати навчальні блоки по днях, щоб нічого не загубилось.",
    worldEvent: "Розклад по днях і блоках прибито до дуба.",
    taskType: "write-function",
    prompt: "Змінні `days`, `blocksPerDay` і `blockMinutes` задає перевірка. Виведи розклад рядками `День D, блок B: M хв` — для кожного дня всі його блоки по черзі.",
    criteria: "для 3 днів по 2 блоки — рівно шість рядків у правильному порядку.",
    fileName: "timetable.js",
    starterCode: `// days, blocksPerDay і blockMinutes задає перевірка
`,
    testCases: [
      { name: "3 дні × 2 блоки", inputs: { days: 3, blocksPerDay: 2, blockMinutes: 25 }, check: jsqLogs(["День 1, блок 1: 25 хв", "День 1, блок 2: 25 хв", "День 2, блок 1: 25 хв", "День 2, блок 2: 25 хв", "День 3, блок 1: 25 хв", "День 3, блок 2: 25 хв"]) },
      { name: "2 дні × 2 блоки — порядок", inputs: { days: 2, blocksPerDay: 2, blockMinutes: 40 }, check: jsqLogs(["День 1, блок 1: 40 хв", "День 1, блок 2: 40 хв", "День 2, блок 1: 40 хв", "День 2, блок 2: 40 хв"]) },
    ],
    codeChecks: [{ re: /for\s*\([\s\S]*for\s*\(/, label: "Цикл усередині циклу" }],
    solution: `// days, blocksPerDay і blockMinutes задає перевірка
for (let day = 1; day <= days; day++) {
  for (let block = 1; block <= blocksPerDay; block++) {
    console.log(\`День \${day}, блок \${block}: \${blockMinutes} хв\`);
  }
}`,
    hint: "Зовнішній цикл — по днях, внутрішній — по блоках. `console.log` стоїть у внутрішньому.",
    difficulty: 2,
  }),
  jsqLevel(3, {
    id: 21,
    title: "function — власна операція",
    concept: "`function name(параметри) { ... return результат; }` оголошує функцію. **Параметри** — імена для вхідних даних, **аргументи** — конкретні значення під час виклику. `return` **повертає** значення тому, хто викликав, — це не те саме, що `console.log`, який лише друкує. Змінні, оголошені всередині функції, **локальні**: зовні їх не видно, і вони не чіпають зовнішніх змінних з тим самим ім'ям.",
    example: `function area(width, height) {
  const result = width * height; // локальна змінна
  return result;
}
const kitchen = area(3, 4); // 12`,
    missionStory: "Лісничий утомився щоразу множити дні на хвилини вручну. Час створити власну операцію.",
    worldEvent: "У лісі з'явилася перша власна операція.",
    taskType: "write-function",
    prompt: "Напиши функцію `calculateStudyTime(days, minutesPerDay)`, яка **повертає** загальну кількість хвилин. Потім використай її результат у двох повідомленнях: `weekMessage` — `\"За тиждень: 210 хв\"` (7 днів по 30) і `monthMessage` — `\"За місяць: 900 хв\"` (30 днів по 30). Зовнішній лічильник `studiedToday` функція не має змінювати.",
    criteria: "функція повертає число, працює для нуля днів і не змінює зовнішній лічильник.",
    exports: ["calculateStudyTime", "weekMessage", "monthMessage", "studiedToday"],
    fileName: "time.js",
    starterCode: `let studiedToday = 0;

// function calculateStudyTime(days, minutesPerDay) { ... }
`,
    testCases: [
      { name: "calculateStudyTime(5, 30) → 150", fn: "calculateStudyTime", input: [5, 30], expectedOutput: 150 },
      { name: "calculateStudyTime(0, 45) → 0", fn: "calculateStudyTime", input: [0, 45], expectedOutput: 0 },
      { name: "Обидва повідомлення використовують результат", check: jsqVars({ weekMessage: "За тиждень: 210 хв", monthMessage: "За місяць: 900 хв" }) },
      { name: "Зовнішній лічильник не змінився", check(ctx) { ctx.get("calculateStudyTime")(3, 40); const v = jsqVal(ctx, "studiedToday"); return { pass: v === 0, actual: ctx.show(v), expected: "0" }; } },
    ],
    codeChecks: [{ re: /function\s+calculateStudyTime\s*\(/, label: "Оголошено функцію `calculateStudyTime`" }, { re: /return\b/, label: "Результат повертається через `return`" }],
    solution: `let studiedToday = 0;

function calculateStudyTime(days, minutesPerDay) {
  const total = days * minutesPerDay;
  return total;
}

const weekMessage = \`За тиждень: \${calculateStudyTime(7, 30)} хв\`;
const monthMessage = \`За місяць: \${calculateStudyTime(30, 30)} хв\`;`,
    hint: "Тіло функції — одне множення і `return`. Повідомлення будуй шаблонним рядком з викликом функції всередині `${...}`.",
    difficulty: 1,
  }),
  jsqLevel(3, {
    id: 22,
    title: "Функція-вираз — функція як значення",
    concept: "Функцію можна покласти в змінну: `const add = function (a, b) { return a + b; };` — це **функція-вираз**. Ім'я без дужок (`add`) — це **сама функція** як значення, її можна передати далі. З дужками (`add(2, 3)`) — **виклик**, результат якого `5`. Функцію-вираз через `const` можна викликати лише **після** рядка, де її оголошено.",
    example: `const greet = function (name) {
  return \`Привіт, \${name}\`;
};
console.log(typeof greet);   // "function"
console.log(greet("Оля"));   // "Привіт, Оля"`,
    missionStory: "Старий друїд показує: операцію можна носити з собою, як інструмент у торбі, — і діставати, коли треба.",
    worldEvent: "Друїд навчив носити операції з собою.",
    taskType: "fix-code",
    prompt: "Перепиши `calculateStudyTime` як **функцію-вираз** у змінній `const`. Потім створи `fnType` — `typeof calculateStudyTime` (сама функція) і `result` — результат виклику `calculateStudyTime(3, 30)`.",
    criteria: "результати ті самі; ти пояснюєш різницю між `calculateStudyTime` і `calculateStudyTime(3, 30)`.",
    exports: ["calculateStudyTime", "fnType", "result"],
    fileName: "time.js",
    starterCode: `function calculateStudyTime(days, minutesPerDay) {
  return days * minutesPerDay;
}
`,
    testCases: [
      { name: "calculateStudyTime(4, 25) → 100", fn: "calculateStudyTime", input: [4, 25], expectedOutput: 100 },
      { name: "fnType — \"function\", result — 90", check: jsqVars({ fnType: "function", result: 90 }) },
    ],
    codeChecks: [{ re: /const\s+calculateStudyTime\s*=\s*function/, label: "Функція-вираз: `const calculateStudyTime = function ...`" }],
    solution: `const calculateStudyTime = function (days, minutesPerDay) {
  return days * minutesPerDay;
};

const fnType = typeof calculateStudyTime;
const result = calculateStudyTime(3, 30);`,
    hint: "Шаблон: `const calculateStudyTime = function (days, minutesPerDay) { ... };`. `fnType` — без дужок, `result` — з дужками й аргументами.",
    difficulty: 1,
  }),
  jsqLevel(3, {
    id: 23,
    title: "Стрілкова функція — короткий запис",
    concept: "Стрілкова функція: `(a, b) => a + b`. Якщо тіло — один вираз **без фігурних дужок**, результат повертається автоматично (неявний `return`). Щойно з'являються `{ }`, тіло стає блоком, і `return` треба писати **явно** — інакше функція поверне `undefined`. Відмінність стрілок у роботі з `this` розберемо на рівні 41.",
    example: `const double = (n) => n * 2;        // неявний return
const describe = (n) => {
  const kind = n > 0 ? "додатне" : "не додатне";
  return \`\${n} — \${kind}\`;           // явний return
};`,
    missionStory: "Лісові стрілки показують дорогу коротше. Але одна стрілка нікуди не веде — її результат десь загубився.",
    worldEvent: "Стрілки лісу знову показують дорогу.",
    taskType: "fix-code",
    prompt: "Обидві функції мають повертати результат: `hoursToMinutes(1.5)` → `90`; `buildMessage(45, 40)` → `\"Ціль досягнута\"`, `buildMessage(25, 40)` → `\"Ще 15 хв\"`. Знайди, чому результат зник, і виправ.",
    criteria: "обидві функції повертають результат; ти пояснюєш, як фігурні дужки змінили поведінку.",
    exports: ["hoursToMinutes", "buildMessage"],
    fileName: "arrows.js",
    starterCode: `const hoursToMinutes = (hours) => { hours * 60 };

const buildMessage = (minutes, goal) => {
  if (minutes >= goal) {
    "Ціль досягнута";
  }
  \`Ще \${goal - minutes} хв\`;
};`,
    testCases: [
      { name: "hoursToMinutes(1.5) → 90", fn: "hoursToMinutes", input: [1.5], expectedOutput: 90 },
      { name: "buildMessage(45, 40) → «Ціль досягнута»", fn: "buildMessage", input: [45, 40], expectedOutput: "Ціль досягнута" },
      { name: "buildMessage(25, 40) → «Ще 15 хв»", fn: "buildMessage", input: [25, 40], expectedOutput: "Ще 15 хв" },
      { name: "buildMessage(40, 40) → «Ціль досягнута» (рівно на межі)", fn: "buildMessage", input: [40, 40], expectedOutput: "Ціль досягнута" },
    ],
    codeChecks: [{ re: /=>/, label: "Стрілкові функції збережено" }],
    solution: `const hoursToMinutes = (hours) => hours * 60;

const buildMessage = (minutes, goal) => {
  if (minutes >= goal) {
    return "Ціль досягнута";
  }
  return \`Ще \${goal - minutes} хв\`;
};`,
    hint: "У першій функції прибери `{ }`, щоб спрацював неявний `return`. У другій — допиши `return` перед кожним результатом.",
    difficulty: 2,
  }),
  jsqLevel(3, {
    id: 24,
    title: "Параметр за замовчуванням — стандартна тривалість",
    concept: "`function f(a, b = 30)` — якщо другий аргумент **пропущено** або передано `undefined`, береться `30`. Для інших falsy-значень, зокрема `0`, стандарт **не** спрацьовує. Старий прийом `b = b || 30` поводиться інакше: він замінить і коректний нуль.",
    example: `function brew(cups = 1) {
  return \`Заварено чашок: \${cups}\`;
}
brew();          // "Заварено чашок: 1"
brew(undefined); // "Заварено чашок: 1"
brew(0);         // "Заварено чашок: 0"`,
    missionStory: "Здебільшого мандрівник вчиться по 30 хвилин. Але бувають дні відпочинку, коли запис — нуль хвилин, і він має лишатися нулем.",
    worldEvent: "Журнал чесно записує навіть дні відпочинку.",
    taskType: "fix-code",
    prompt: "Зараз стандартна тривалість задається через `||`, і нуль хвилин перетворюється на 30. Перепиши функцію з **параметром за замовчуванням** `minutesPerDay = 30`.",
    criteria: "виклики без другого аргументу, з `undefined` і з `0` дають правильні результати; нуль не замінюється стандартом.",
    functionName: "calculateStudyTime",
    fileName: "time.js",
    starterCode: `function calculateStudyTime(days, minutesPerDay) {
  minutesPerDay = minutesPerDay || 30;
  return days * minutesPerDay;
}`,
    testCases: [
      { name: "calculateStudyTime(5) → 150", input: [5], expectedOutput: 150 },
      { name: "calculateStudyTime(5, undefined) → 150", input: [5, undefined], expectedOutput: 150 },
      { name: "calculateStudyTime(5, 0) → 0", input: [5, 0], expectedOutput: 0 },
      { name: "calculateStudyTime(2, 45) → 90", input: [2, 45], expectedOutput: 90 },
    ],
    codeChecks: [{ re: /minutesPerDay\s*=\s*30\s*\)/, label: "Параметр за замовчуванням `minutesPerDay = 30`" }, { re: /\|\|/, not: true, label: "Без запасного значення через `||`" }],
    solution: `function calculateStudyTime(days, minutesPerDay = 30) {
  return days * minutesPerDay;
}`,
    hint: "Стандарт пишеться прямо в дужках параметрів: `(days, minutesPerDay = 30)`. Рядок з `||` тоді не потрібен.",
    difficulty: 1,
  }),
  jsqLevel(3, {
    id: 25,
    title: "return у циклі — знайти й зупинитися",
    concept: "`return` всередині циклу завершує **всю функцію** — цикл теж. `continue` лише пропускає один крок, а `break` виходить тільки з циклу, і функція працює далі. Типовий пошук: перебираємо значення, при першому збігу одразу `return`, а «нічого не знайдено» (`return null`) пишемо **після** циклу.",
    example: `function firstEven(from, to) {
  for (let n = from; n <= to; n++) {
    if (n % 2 === 0) return n; // знайшли — виходимо
  }
  return null; // цикл скінчився без збігу
}`,
    missionStory: "Розчищаючи стежку, лісник шукає перше дерево з позначкою «7» — і не хоче рубати ліс далі, коли вже знайшов.",
    worldEvent: "Розчищено стежку через ліс!",
    taskType: "write-function",
    prompt: "Напиши функцію `findFirstDivisibleBy7(from, to)`, яка повертає перше число з **включного** діапазону від `from` до `to`, що ділиться на 7 без остачі. Якщо такого немає — `null`.",
    criteria: "перевірено збіг на початку, усередині й відсутність збігу; ти пояснюєш, чому фінальний `return` стоїть після циклу.",
    functionName: "findFirstDivisibleBy7",
    fileName: "search.js",
    starterCode: `function findFirstDivisibleBy7(from, to) {

}`,
    testCases: [
      { input: [7, 20], expectedOutput: 7 },
      { input: [8, 20], expectedOutput: 14 },
      { input: [1, 6], expectedOutput: null },
      { input: [15, 20], expectedOutput: null },
      { input: [21, 21], expectedOutput: 21 },
    ],
    codeChecks: [{ re: /for\s*\(/, label: "Пошук циклом" }],
    solution: `function findFirstDivisibleBy7(from, to) {
  for (let n = from; n <= to; n++) {
    if (n % 7 === 0) return n;
  }
  return null;
}`,
    hint: "Якщо `return null` стоятиме всередині циклу, функція завершиться вже на першому числі. Його місце — після закритої дужки циклу.",
    difficulty: 2,
  }),

  /* ───────────── Арка IV — Масиви → Печери масивів ───────────── */
  jsqLevel(4, {
    id: 26,
    title: "Елементи й length — список тем",
    concept: "Масив — впорядкований список: `[\"Змінні\", \"Цикли\"]`. Елементи нумеруються **з нуля**: перший — `topics[0]`, останній — `topics[topics.length - 1]`. `length` — кількість елементів, а не індекс останнього. Звернення за межі масиву дає `undefined`. Порожній масив `[]` — truthy, тому «чи є елементи» перевіряй через `length > 0`.",
    example: `const colors = ["червоний", "зелений", "синій"];
console.log(colors[0]);                 // "червоний"
console.log(colors[colors.length - 1]); // "синій"
console.log(colors[3]);                 // undefined`,
    missionStory: "У Печерах масивів кожна тема навчання — самоцвіт на полиці. Наглядач печер плутає перший і останній камінь.",
    worldEvent: "Самоцвіти тем лежать на полицях по порядку.",
    taskType: "fix-code",
    prompt: "Масив `topics` задає перевірка. Виправ код: `firstTopic` — перша тема, `lastTopic` — остання, `topicsCount` — кількість тем, `hasTopics` — чи є хоч одна тема. Цикл має вивести кожну тему окремим рядком.",
    criteria: "правильно для п'яти тем і для порожнього списку; `length` не плутається з індексом останнього елемента.",
    exports: ["firstTopic", "lastTopic", "topicsCount", "hasTopics"],
    fileName: "topics.js",
    starterCode: `// topics задає перевірка
const firstTopic = topics[1];
const lastTopic = topics[topics.length];
const topicsCount = topics.length;
const hasTopics = Boolean(topics);

for (let i = 0; i <= topics.length; i++) {
  console.log(topics[i]);
}`,
    testCases: [
      {
        name: "П'ять тем",
        inputs: { topics: ["Змінні", "Умови", "Цикли", "Функції", "Масиви"] },
        check(ctx) {
          const vars = jsqVars({ firstTopic: "Змінні", lastTopic: "Масиви", topicsCount: 5, hasTopics: true })(ctx);
          const logsOk = ctx.equal(ctx.logs, ["Змінні", "Умови", "Цикли", "Функції", "Масиви"]);
          return { pass: vars.pass && logsOk, actual: vars.actual + "; вивід " + ctx.show(ctx.logs), expected: vars.expected + "; п'ять рядків з темами" };
        },
      },
      { name: "Одна тема", inputs: { topics: ["DOM"] }, check: jsqVars({ firstTopic: "DOM", lastTopic: "DOM", topicsCount: 1, hasTopics: true }) },
      {
        name: "Порожній список",
        inputs: { topics: [] },
        check(ctx) {
          const vars = jsqVars({ firstTopic: undefined, lastTopic: undefined, topicsCount: 0, hasTopics: false })(ctx);
          return { pass: vars.pass && ctx.logs.length === 0, actual: vars.actual + "; вивід " + ctx.show(ctx.logs), expected: vars.expected + "; без виводу" };
        },
      },
    ],
    solution: `// topics задає перевірка
const firstTopic = topics[0];
const lastTopic = topics[topics.length - 1];
const topicsCount = topics.length;
const hasTopics = topics.length > 0;

for (let i = 0; i < topics.length; i++) {
  console.log(topics[i]);
}`,
    hint: "Індекси йдуть від 0 до `length - 1`. Тому і в циклі умова — `i < topics.length`, а не `<=`.",
    difficulty: 1,
  }),
  jsqLevel(4, {
    id: 27,
    title: "push / pop — кінець списку",
    concept: "`push(x)` додає елемент у **кінець** масиву і повертає **нову довжину** (число!). `pop()` видаляє **останній** елемент і повертає його; для порожнього масиву — `undefined`. Обидва методи **змінюють сам масив**. Тому `list = list.push(x)` — помилка: у змінну потрапить число замість масиву.",
    example: `const stack = ["a"];
const len = stack.push("b"); // 2, stack: ["a", "b"]
const last = stack.pop();    // "b", stack: ["a"]`,
    missionStory: "Наглядач додає нові самоцвіти тем у кінець полиці — і раптом полиця перетворюється на число «5».",
    worldEvent: "Полиця самоцвітів знову стала списком.",
    taskType: "fix-code",
    prompt: "Додай у кінець списку теми `\"Масиви\"` і `\"Об'єкти\"` (результат другого `push` збережи в `newLength`), потім прибери останню тему (збережи її в `removedTopic`). Окремо збережи в `emptyPop` результат `pop()` для порожнього масиву.",
    criteria: "список і результати методів розрізняються: `topics` лишається масивом, `newLength` — числом.",
    exports: ["topics", "newLength", "removedTopic", "emptyPop"],
    fileName: "shelf.js",
    starterCode: `let topics = ["Змінні", "Умови", "Цикли"];

topics = topics.push("Масиви");
const newLength = topics.push("Об'єкти");
const removedTopic = topics.pop();
const emptyPop = [].pop();`,
    testCases: [
      { name: "Стан списку й результати методів", check: jsqVars({ topics: ["Змінні", "Умови", "Цикли", "Масиви"], newLength: 5, removedTopic: "Об'єкти", emptyPop: undefined }) },
    ],
    codeChecks: [{ re: /topics\s*=\s*topics\.push/, not: true, label: "Результат `push` не записано замість масиву" }],
    solution: `const topics = ["Змінні", "Умови", "Цикли"];

topics.push("Масиви");
const newLength = topics.push("Об'єкти");
const removedTopic = topics.pop();
const emptyPop = [].pop();`,
    hint: "`push` змінює масив сам. Присвоювати його результат у `topics` не треба — просто викличи `topics.push(\"Масиви\");`.",
    difficulty: 1,
  }),
  jsqLevel(4, {
    id: 28,
    title: "unshift / shift — черга завдань",
    concept: "`unshift(x)` додає елемент на **початок** масиву, `shift()` забирає **перший** і повертає його. Після цього індекси всіх інших елементів зсуваються. Черга «перший прийшов — перший пішов»: додаємо в кінець (`push`), забираємо з початку (`shift`).",
    example: `const line = ["Оля", "Макс"];
line.unshift("Термінова гостя"); // на початок
const next = line.shift();       // "Термінова гостя"`,
    missionStory: "Біля входу в печери вишикувалась черга справ. Але з'явилося термінове завдання, яке треба зробити першим.",
    worldEvent: "Черга справ у печерах рухається правильно.",
    taskType: "write-function",
    prompt: "Є черга `queue`. Додай на **початок** `\"Термінове: виправити баг\"`, потім забери перше завдання з черги в змінну `current`, і нарешті додай у **кінець** `\"DOM\"`.",
    criteria: "правильний порядок після трьох операцій; ти відрізняєш роботу з початком і кінцем списку.",
    exports: ["queue", "current"],
    fileName: "queue.js",
    starterCode: `const queue = ["Повторити цикли", "Масиви", "Об'єкти"];
`,
    testCases: [
      { name: "Черга після трьох операцій", check: jsqVars({ current: "Термінове: виправити баг", queue: ["Повторити цикли", "Масиви", "Об'єкти", "DOM"] }) },
    ],
    codeChecks: [{ re: /\.unshift\(/, label: "Використано `unshift`" }, { re: /\.shift\(\)/, label: "Використано `shift`" }],
    solution: `const queue = ["Повторити цикли", "Масиви", "Об'єкти"];

queue.unshift("Термінове: виправити баг");
const current = queue.shift();
queue.push("DOM");`,
    hint: "Три рядки: `queue.unshift(...)`, `const current = queue.shift();`, `queue.push(...)`.",
    difficulty: 1,
  }),
  jsqLevel(4, {
    id: 29,
    title: "slice — фрагмент без зміни джерела",
    concept: "`slice(start, end)` повертає **новий масив** з елементами від `start` (включно) до `end` (**не** включно). Джерело не змінюється. Від'ємний індекс рахується з кінця: `slice(-2)` — два останні. `slice()` без аргументів — копія всього масиву.",
    example: `const letters = ["a", "b", "c", "d"];
letters.slice(1, 3); // ["b", "c"]
letters.slice(-1);   // ["d"]
letters;             // ["a", "b", "c", "d"] — без змін`,
    missionStory: "Учень хоче показати друзям лише частину своїх самоцвітів, не знімаючи їх з полиці.",
    worldEvent: "Учень показав частину колекції, не розібравши полицю.",
    taskType: "write-function",
    prompt: "З масиву `topics` отримай через `slice`: `firstThree` — перші три теми, `lastTwo` — дві останні, `copy` — копію всього списку. Сам `topics` не змінюй.",
    criteria: "межі вибрано правильно; джерело після операцій таке саме, а копія — окремий масив.",
    exports: ["topics", "firstThree", "lastTwo", "copy"],
    fileName: "slice.js",
    starterCode: `const topics = ["Змінні", "Умови", "Цикли", "Функції", "Масиви", "Об'єкти"];
`,
    testCases: [
      { name: "Фрагменти", check: jsqVars({ firstThree: ["Змінні", "Умови", "Цикли"], lastTwo: ["Масиви", "Об'єкти"], copy: ["Змінні", "Умови", "Цикли", "Функції", "Масиви", "Об'єкти"] }) },
      { name: "Джерело не змінилось, копія — окремий масив", check(ctx) { const t = ctx.get("topics"), c = ctx.get("copy"); return { pass: t.length === 6 && c !== t, actual: "довжина " + t.length + ", copy " + (c === t ? "=== topics" : "окремий масив"), expected: "довжина 6, copy окремий масив" }; } },
    ],
    codeChecks: [{ re: /\.slice\(/, label: "Використано `slice`" }],
    solution: `const topics = ["Змінні", "Умови", "Цикли", "Функції", "Масиви", "Об'єкти"];

const firstThree = topics.slice(0, 3);
const lastTwo = topics.slice(-2);
const copy = topics.slice();`,
    hint: "Кінцевий індекс не входить у результат: перші три — це `slice(0, 3)`.",
    difficulty: 1,
  }),
  jsqLevel(4, {
    id: 30,
    title: "splice — змінити сам список",
    concept: "`splice(start, deleteCount, ...items)` **змінює сам масив**: з позиції `start` видаляє `deleteCount` елементів і вставляє `items`. Повертає **масив видаленого** (порожній, якщо нічого не видалено). На відміну від `slice`, джерело змінюється.",
    example: `const list = ["a", "b", "c"];
const removed = list.splice(1, 1);  // ["b"], list: ["a", "c"]
list.splice(1, 0, "x");             // вставка, list: ["a", "x", "c"]
list.splice(0, 1, "y");             // заміна, list: ["y", "x", "c"]`,
    missionStory: "Наглядач переставляє самоцвіти прямо на полиці: один прибирає, інший вставляє, третій замінює.",
    worldEvent: "Полицю самоцвітів упорядковано.",
    taskType: "write-function",
    prompt: "Є `topics = [\"Змінні\", \"Умови\", \"Цикли\", \"Функції\", \"Масиви\"]`. Через `splice` по черзі: 1) видали `\"Цикли\"` (індекс 2) — видалене збережи в `removed`; 2) встав `\"Деструктуризація\"` на індекс 1; 3) заміни елемент з індексом 3 на `\"Spread\"` — замінене збережи в `replaced`.",
    criteria: "ти показуєш змінений список і видалені елементи; можеш пояснити різницю зі `slice` без запуску коду.",
    exports: ["topics", "removed", "replaced"],
    fileName: "splice.js",
    starterCode: `const topics = ["Змінні", "Умови", "Цикли", "Функції", "Масиви"];
`,
    testCases: [
      { name: "Список і видалені елементи", check: jsqVars({ topics: ["Змінні", "Деструктуризація", "Умови", "Spread", "Масиви"], removed: ["Цикли"], replaced: ["Функції"] }) },
    ],
    codeChecks: [{ re: /\.splice\(/, label: "Використано `splice`" }],
    solution: `const topics = ["Змінні", "Умови", "Цикли", "Функції", "Масиви"];

const removed = topics.splice(2, 1);
topics.splice(1, 0, "Деструктуризація");
const replaced = topics.splice(3, 1, "Spread");`,
    hint: "Після кожного `splice` індекси зсуваються. Після вставки на індекс 1 «Функції» стоять саме на індексі 3.",
    difficulty: 2,
  }),
  jsqLevel(4, {
    id: 31,
    title: "indexOf / includes — пошук теми",
    concept: "`includes(x)` відповідає «так/ні» (`true`/`false`). `indexOf(x)` повертає **позицію** або `-1`, якщо елемента немає. Пастка: індекс `0` — коректна позиція, але falsy, а `-1` — truthy. Тому `if (list.indexOf(x))` — неправильна перевірка. Порівнюй явно: `indexOf(x) !== -1`, або бери `includes`, коли позиція не потрібна.",
    example: `const tools = ["кирка", "лопата"];
tools.includes("лопата"); // true
tools.indexOf("кирка");   // 0 — знайдено на початку
tools.indexOf("сокира");  // -1 — немає`,
    missionStory: "Пошукач самоцвітів запевняє, що першого каменя на полиці немає, а неіснуючий — є. Його перевірка явно зламана.",
    worldEvent: "Пошукач знаходить самоцвіти без помилок.",
    taskType: "fix-code",
    prompt: "Функція `findTopic(topics, topic)` має повертати `Тема «X» на позиції N`, якщо тема є, і `Теми «X» немає`, якщо немає. Зараз вона помиляється для першого елемента й для відсутньої теми. Виправ перевірку.",
    criteria: "правильно для першого елемента, елемента в середині й відсутньої теми.",
    functionName: "findTopic",
    fileName: "find.js",
    starterCode: `function findTopic(topics, topic) {
  const index = topics.indexOf(topic);
  if (index) {
    return \`Тема «\${topic}» на позиції \${index}\`;
  }
  return \`Теми «\${topic}» немає\`;
}`,
    testCases: [
      { input: [["Змінні", "Цикли", "Масиви"], "Змінні"], expectedOutput: "Тема «Змінні» на позиції 0" },
      { input: [["Змінні", "Цикли", "Масиви"], "Масиви"], expectedOutput: "Тема «Масиви» на позиції 2" },
      { input: [["Змінні", "Цикли", "Масиви"], "DOM"], expectedOutput: "Теми «DOM» немає" },
    ],
    solution: `function findTopic(topics, topic) {
  const index = topics.indexOf(topic);
  if (index !== -1) {
    return \`Тема «\${topic}» на позиції \${index}\`;
  }
  return \`Теми «\${topic}» немає\`;
}`,
    hint: "Що повертає `indexOf` для першого елемента? А для відсутнього? Порівняй результат явно з `-1`.",
    difficulty: 1,
  }),
  jsqLevel(4, {
    id: 32,
    title: "sort — сортування тривалостей",
    concept: "`sort()` без аргументів сортує елементи як **рядки**: `[5, 30, 100].sort()` дає `[100, 30, 5]`, бо `\"1\" < \"3\" < \"5\"`. Для чисел потрібен **компаратор**: `(a, b) => a - b`. Від'ємний результат ставить `a` раніше, додатний — пізніше. `sort()` **змінює** масив, тому щоб зберегти джерело, сортують копію: `list.slice().sort(...)`.",
    example: `const prices = [40, 9, 120];
const cheapFirst = prices.slice().sort((a, b) => a - b); // [9, 40, 120]
prices; // [40, 9, 120] — без змін`,
    missionStory: "Самоцвіти треба розкласти за вагою. Наглядач сортує — і стокаратний камінь чомусь опиняється першим.",
    worldEvent: "Самоцвіти лежать за вагою.",
    taskType: "fix-code",
    prompt: "Створи `ascending` — тривалості за зростанням і `descending` — за спаданням. Масив `durations` має лишитися незмінним.",
    criteria: "правильний порядок в обох списках, джерело збережене; ти пояснюєш знак результату `a - b`.",
    exports: ["durations", "ascending", "descending"],
    fileName: "sort.js",
    starterCode: `const durations = [5, 30, 100, 15];

const ascending = durations.sort();
const descending = durations.sort().reverse();`,
    testCases: [
      { name: "Обидва порядки", check: jsqVars({ ascending: [5, 15, 30, 100], descending: [100, 30, 15, 5] }) },
      { name: "Джерело не змінилось", check: jsqVars({ durations: [5, 30, 100, 15] }) },
    ],
    codeChecks: [{ re: /a\s*-\s*b|b\s*-\s*a/, label: "Числовий компаратор" }],
    solution: `const durations = [5, 30, 100, 15];

const ascending = durations.slice().sort((a, b) => a - b);
const descending = durations.slice().sort((a, b) => b - a);`,
    hint: "Дві проблеми: сортування як тексту і зміна джерела. Компаратор `(a, b) => a - b` лікує першу, `slice()` перед `sort` — другу.",
    difficulty: 2,
  }),
  jsqLevel(4, {
    id: 33,
    title: "forEach — дія для кожного елемента",
    concept: "**Callback** — функція, яку ти передаєш іншому коду, а той викликає її сам. `list.forEach(callback)` викликає callback для кожного елемента, передаючи `(елемент, індекс)`. Передавай саму функцію, а не результат її виклику. `forEach` нічого не повертає (`undefined`) — він лише виконує дію.",
    example: `const names = ["Оля", "Макс"];
names.forEach((name, index) => {
  console.log(\`\${index}: \${name}\`);
});`,
    missionStory: "Наглядач диктує перелік самоцвітів для опису — з номерами, щоб нічого не пропустити.",
    worldEvent: "Опис колекції самоцвітів готовий.",
    taskType: "write-function",
    prompt: "Масив `topics` задає перевірка. Через `forEach` виведи пронумерований список у форматі `1. Змінні`, `2. Умови`, … (нумерація з одиниці).",
    criteria: "правильний вивід для кількох тем і жодного рядка для порожнього списку.",
    fileName: "list.js",
    starterCode: `// topics задає перевірка
`,
    testCases: [
      { name: "Три теми", inputs: { topics: ["Змінні", "Умови", "Цикли"] }, check: jsqLogs(["1. Змінні", "2. Умови", "3. Цикли"]) },
      { name: "Порожній список", inputs: { topics: [] }, check: jsqLogs([]) },
    ],
    codeChecks: [{ re: /\.forEach\(/, label: "Використано `forEach`" }],
    solution: `// topics задає перевірка
topics.forEach((topic, index) => {
  console.log(\`\${index + 1}. \${topic}\`);
});`,
    hint: "Callback отримує два аргументи: `(topic, index)`. Індекс починається з 0, тому номер — `index + 1`.",
    difficulty: 1,
  }),
  jsqLevel(4, {
    id: 34,
    title: "map — новий масив значень",
    concept: "`map(callback)` створює **новий масив**: кожен елемент — те, що **повернув** callback. Довжина зберігається, джерело не змінюється. Якщо callback має фігурні дужки і не має `return`, вийде масив `undefined`. `forEach` — для дії, `map` — коли потрібен перетворений список.",
    example: `const prices = [10, 20];
const withTax = prices.map((p) => p * 1.2); // [12, 24]
const labels = prices.map((p) => {
  return \`\${p} грн\`;
});                                          // ["10 грн", "20 грн"]`,
    missionStory: "Звіт для старости печер треба подати в годинах, а підписи тем — з позначкою. Але писар отримав лише стовпчик «undefined».",
    worldEvent: "Звіт у годинах лежить на столі старости.",
    taskType: "fix-code",
    prompt: "Масиви `minutesList` і `topics` задає перевірка. Виправ код: `hoursList` — хвилини, переведені в години (поділ на 60), `labels` — теми у вигляді `Тема: Змінні`. Для `labels` залиш варіант з явним `return`.",
    criteria: "отримано значення, а не масив `undefined`; ти пояснюєш вибір між `map` і `forEach`.",
    exports: ["hoursList", "labels"],
    fileName: "map.js",
    starterCode: `// minutesList і topics задає перевірка
const hoursList = minutesList.map((minutes) => {
  minutes / 60;
});

const labels = topics.map((topic) => {
  \`Тема: \${topic}\`;
});`,
    testCases: [
      { name: "Години й підписи", inputs: { minutesList: [30, 90, 120], topics: ["Змінні", "Масиви"] }, check: jsqVars({ hoursList: [0.5, 1.5, 2], labels: ["Тема: Змінні", "Тема: Масиви"] }) },
      { name: "Порожні списки", inputs: { minutesList: [], topics: [] }, check: jsqVars({ hoursList: [], labels: [] }) },
    ],
    codeChecks: [{ re: /\.map\(/, label: "Використано `map`" }, { re: /return\s*`Тема:/, label: "Для підписів — явний `return`" }],
    solution: `// minutesList і topics задає перевірка
const hoursList = minutesList.map((minutes) => minutes / 60);

const labels = topics.map((topic) => {
  return \`Тема: \${topic}\`;
});`,
    hint: "Колбек у фігурних дужках нічого не повертає, доки немає `return`. Або прибери дужки, або додай `return`.",
    difficulty: 1,
  }),
  jsqLevel(4, {
    id: 35,
    title: "filter — відбір за правилом",
    concept: "`filter(callback)` повертає **новий масив** з тими елементами, для яких callback повернув truthy. Джерело не змінюється. Якщо нічого не підійшло, результат — порожній масив `[]`, і це нормальна відповідь.",
    example: `const temps = [-3, 5, 12, 0];
const warm = temps.filter((t) => t > 0); // [5, 12]
const hot = temps.filter((t) => t > 30); // []`,
    missionStory: "У журналі записано заняття різної тривалості. Мандрівник хоче бачити лише «повноцінні» — від 30 до 45 хвилин.",
    worldEvent: "У журналі виділено повноцінні заняття.",
    taskType: "write-function",
    prompt: "Масив `durations` задає перевірка. Створи `fitting` — лише тривалості від 30 до 45 хвилин **включно**.",
    criteria: "перевірено обидві межі й значення поза ними; джерело збережене, відсутність збігів дає `[]`.",
    exports: ["fitting"],
    fileName: "filter.js",
    starterCode: `// durations задає перевірка
`,
    testCases: [
      { name: "Межі включно", inputs: { durations: [10, 29, 30, 40, 45, 46, 60] }, check: jsqVars({ fitting: [30, 40, 45] }) },
      { name: "Немає збігів → []", inputs: { durations: [5, 90] }, check: jsqVars({ fitting: [] }) },
      { name: "Одна межа: [30, 50] → [30]", inputs: { durations: [30, 50] }, check(ctx) { const f = ctx.get("fitting"); return { pass: ctx.equal(f, [30]), actual: ctx.show(f), expected: "[30]" }; } },
    ],
    codeChecks: [{ re: /\.filter\(/, label: "Використано `filter`" }],
    solution: `// durations задає перевірка
const fitting = durations.filter((minutes) => minutes >= 30 && minutes <= 45);`,
    hint: "Умова «від 30 до 45 включно»: `minutes >= 30 && minutes <= 45`.",
    difficulty: 1,
  }),
  jsqLevel(4, {
    id: 36,
    title: "reduce — загальний час",
    concept: "`reduce((acc, item) => нове_acc, початкове)` проходить масив і накопичує один результат. `acc` (накопичувач) спочатку дорівнює початковому значенню, а далі — тому, що повернув callback на попередньому кроці. **Завжди передавай початкове значення**: без нього `reduce` на порожньому масиві кидає `TypeError`.",
    example: `const coins = [5, 10, 2];
const sum = coins.reduce((total, coin) => total + coin, 0);
// крок 1: 0 + 5 = 5; крок 2: 5 + 10 = 15; крок 3: 15 + 2 = 17`,
    missionStory: "Старости печер потрібен загальний час навчання за тиждень. Але в тиждень без записів його калькулятор ламається.",
    worldEvent: "Загальний час навчання підраховано навіть для порожнього тижня.",
    taskType: "fix-code",
    prompt: "Масив `durations` задає перевірка. Виправ `totalMinutes`, щоб він давав суму для будь-якого списку, включно з порожнім (сума порожнього — `0`).",
    criteria: "правильно для порожнього масиву, одного й кількох елементів; ти можеш вручну простежити накопичувач.",
    exports: ["totalMinutes"],
    fileName: "total.js",
    starterCode: `// durations задає перевірка
const totalMinutes = durations.reduce((sum, minutes) => sum + minutes);`,
    testCases: [
      { name: "[10, 20, 30] → 60", inputs: { durations: [10, 20, 30] }, check: jsqVars({ totalMinutes: 60 }) },
      { name: "[25] → 25", inputs: { durations: [25] }, check: jsqVars({ totalMinutes: 25 }) },
      { name: "[] → 0", inputs: { durations: [] }, check: jsqVars({ totalMinutes: 0 }) },
    ],
    codeChecks: [{ re: /\.reduce\(/, label: "Використано `reduce`" }],
    solution: `// durations задає перевірка
const totalMinutes = durations.reduce((sum, minutes) => sum + minutes, 0);`,
    hint: "Другий аргумент `reduce` — початкове значення накопичувача. Для суми це `0`.",
    difficulty: 1,
  }),
  jsqLevel(4, {
    id: 37,
    title: "find / some / every — три запитання",
    concept: "`find(cb)` — **перший** елемент, що підходить (або `undefined`). `some(cb)` — чи є **хоча б один** такий (`true`/`false`). `every(cb)` — чи **всі** такі. Для порожнього масиву `some` дає `false` (нікого не знайшлось), а `every` — `true` (порушників немає).",
    example: `const ages = [12, 19, 25];
ages.find((a) => a >= 18);  // 19
ages.some((a) => a < 14);   // true
ages.every((a) => a > 10);  // true`,
    missionStory: "Старости ставить три запитання про журнал: де перше довге заняття, чи були короткі, і чи всі заняття в межах норми.",
    worldEvent: "Староста отримав відповіді на всі три запитання.",
    taskType: "write-function",
    prompt: "Масив `durations` задає перевірка. Предикати вже готові: «довге» — `m >= 60`, «коротке» — `m < 15`, «у межах» — `m >= 5 && m <= 120`. Обери правильний метод для кожного запитання: `firstLong` — перше довге заняття, `hasShort` — чи є коротке, `allInRange` — чи всі в межах.",
    criteria: "метод обрано правильно; ти пояснюєш результати `some` і `every` для порожнього масиву.",
    exports: ["firstLong", "hasShort", "allInRange"],
    fileName: "questions.js",
    starterCode: `// durations задає перевірка
const isLong = (m) => m >= 60;
const isShort = (m) => m < 15;
const isInRange = (m) => m >= 5 && m <= 120;
`,
    testCases: [
      { name: "[30, 90, 10, 75]", inputs: { durations: [30, 90, 10, 75] }, check: jsqVars({ firstLong: 90, hasShort: true, allInRange: true }) },
      { name: "[20, 130]", inputs: { durations: [20, 130] }, check: jsqVars({ firstLong: 130, hasShort: false, allInRange: false }) },
      { name: "Межі: [15, 59, 60, 120]", inputs: { durations: [15, 59, 60, 120] }, check: jsqVars({ firstLong: 60, hasShort: false, allInRange: true }) },
      { name: "Межі: [5, 14]", inputs: { durations: [5, 14] }, check: jsqVars({ firstLong: undefined, hasShort: true, allInRange: true }) },
      { name: "[] — порожній", inputs: { durations: [] }, check: jsqVars({ firstLong: undefined, hasShort: false, allInRange: true }) },
    ],
    codeChecks: [{ re: /\.find\(/, label: "`find`" }, { re: /\.some\(/, label: "`some`" }, { re: /\.every\(/, label: "`every`" }],
    solution: `// durations задає перевірка
const isLong = (m) => m >= 60;
const isShort = (m) => m < 15;
const isInRange = (m) => m >= 5 && m <= 120;

const firstLong = durations.find(isLong);
const hasShort = durations.some(isShort);
const allInRange = durations.every(isInRange);`,
    hint: "Передавай готові предикати без дужок: `durations.find(isLong)`.",
    difficulty: 2,
  }),
  jsqLevel(4, {
    id: 38,
    title: "Ланцюжок методів — короткий звіт",
    concept: "Результат одного методу масиву можна одразу передати наступному: `list.filter(...).map(...).reduce(...)`. Кожен крок отримує результат попереднього. Після `reduce`, що повернув число, масиву вже немає — `.map` далі викликати не можна. Проміжні змінні (`longOnes`, `hours`) допомагають перевірити кожен крок окремо.",
    example: `const prices = [5, 50, 120];
const total = prices
  .filter((p) => p > 10)
  .map((p) => p * 2)
  .reduce((sum, p) => sum + p, 0); // 340`,
    missionStory: "Остання зала печер. Староста просить короткий звіт: скільки годин займають лише повноцінні заняття.",
    worldEvent: "Знайдено скарб у печерах!",
    taskType: "write-function",
    prompt: "Масив `durations` задає перевірка. Відбери заняття від 30 хвилин, переведи хвилини в години й підсумуй. Зроби це двічі: спершу через проміжні змінні `longOnes` і `hours` з результатом `totalHours`, потім одним ланцюжком у `totalHoursChain`.",
    criteria: "обидва варіанти дають однаковий результат; ти обґрунтовуєш, де проміжна змінна допомагає перевірці.",
    exports: ["totalHours", "totalHoursChain"],
    fileName: "report.js",
    starterCode: `// durations задає перевірка
`,
    testCases: [
      { name: "[20, 30, 60, 90] → 3 год", inputs: { durations: [20, 30, 60, 90] }, check: jsqVars({ totalHours: 3, totalHoursChain: 3 }) },
      { name: "Немає довгих → 0", inputs: { durations: [10, 15] }, check: jsqVars({ totalHours: 0, totalHoursChain: 0 }) },
    ],
    codeChecks: [{ re: /\.filter\([\s\S]*\.map\([\s\S]*\.reduce\(/, label: "filter → map → reduce" }],
    solution: `// durations задає перевірка
const longOnes = durations.filter((m) => m >= 30);
const hours = longOnes.map((m) => m / 60);
const totalHours = hours.reduce((sum, h) => sum + h, 0);

const totalHoursChain = durations
  .filter((m) => m >= 30)
  .map((m) => m / 60)
  .reduce((sum, h) => sum + h, 0);`,
    hint: "Порядок важливий: спершу відбір (`filter`), потім перетворення (`map`), і лише наприкінці підсумок (`reduce` з початковим `0`).",
    difficulty: 2,
  }),

  /* ───────────── Арка V — Об'єкти → Святилище об'єктів ───────────── */
  jsqLevel(5, {
    id: 39,
    title: "Створення й доступ — об'єкт завдання",
    concept: "Об'єкт — набір пар «ключ: значення»: `{ title: \"Масиви\", minutes: 30 }`. Читання через крапку: `task.title`. Через квадратні дужки: `task[\"title\"]` — або `task[field]`, коли назва поля лежить у змінній. Відсутня властивість дає `undefined`. Об'єкти порівнюються **за посиланням**: `===` дає `true`, лише якщо це той самий об'єкт, а не просто однаковий за вмістом.",
    example: `const book = { title: "Кобзар", pages: 300 };
const key = "pages";
book.title;  // "Кобзар"
book[key];   // 300
book.author; // undefined
book === { title: "Кобзар", pages: 300 }; // false — інший об'єкт`,
    missionStory: "У Святилищі об'єктів кожне завдання журналу стає окремою реліквією з написами: назва, тривалість, стан.",
    worldEvent: "Перша реліквія-завдання стоїть у святилищі.",
    taskType: "write-function",
    prompt: "Створи об'єкт `task`: `id` — 1, `title` — `\"Повторити функції\"`, `minutes` — 30, `done` — `false`. Прочитай `titleByDot` через крапку, а `minutesByKey` — через дужки зі змінною `field = \"minutes\"`. Збережи в `missing` неіснуючу властивість `task.priority`. Створи `twin` — окремий об'єкт з такими самими полями, і порівняй: `sameRef = task === task`, `sameContent = task === twin`.",
    criteria: "ти відрізняєш `task.field` від `task[field]` і пояснюєш, чому однакові об'єкти не рівні через `===`.",
    exports: ["task", "titleByDot", "minutesByKey", "sameRef", "sameContent"],
    fileName: "task.js",
    starterCode: `const field = "minutes";
`,
    testCases: [
      { name: "Об'єкт завдання", check: jsqVars({ task: { id: 1, title: "Повторити функції", minutes: 30, done: false } }) },
      { name: "Читання двома способами й відсутнє поле", check(ctx) { const r = jsqVars({ titleByDot: "Повторити функції", minutesByKey: 30, missing: undefined })(ctx); return r; } },
      { name: "Порівняння посилань", check: jsqVars({ sameRef: true, sameContent: false }) },
    ],
    codeChecks: [{ re: /task\[\s*field\s*\]/, label: "Динамічний ключ `task[field]`" }],
    solution: `const field = "minutes";

const task = { id: 1, title: "Повторити функції", minutes: 30, done: false };

const titleByDot = task.title;
const minutesByKey = task[field];
const missing = task.priority;

const twin = { id: 1, title: "Повторити функції", minutes: 30, done: false };
const sameRef = task === task;
const sameContent = task === twin;`,
    hint: "`task.field` шукає поле з назвою «field». Щоб узяти назву зі змінної, потрібні дужки: `task[field]`.",
    difficulty: 1,
  }),
  jsqLevel(5, {
    id: 40,
    title: "Зміна, додавання, видалення властивостей",
    concept: "`const` забороняє **переприсвоїти змінну**, але не забороняє змінювати **властивості** об'єкта: `task.done = true` — можна. Нова властивість додається присвоєнням: `task.note = \"...\"`, видаляється через `delete task.note`. Присвоєння `const alias = task` **не копіює** об'єкт: обидві змінні вказують на той самий об'єкт, і зміна через одну видна через іншу.",
    example: `const bag = { apples: 2 };
bag.apples = 3;        // ✓ змінили властивість
bag.pears = 1;         // ✓ додали
delete bag.pears;      // ✓ видалили
// bag = {};           // ✗ TypeError — переприсвоєння const
const sameBag = bag;
sameBag.apples = 5;    // bag.apples теж 5`,
    missionStory: "Жрець святилища хоче позначити реліквію виконаною — і отримує гнів святилища: «Assignment to constant variable».",
    worldEvent: "Реліквію позначено виконаною без гніву святилища.",
    taskType: "fix-code",
    prompt: "Виправ код без переприсвоєння `task`: познач `done` як `true`, додай примітку `note` — `\"Пройти до вечора\"`, а потім видали її. Створи `alias = task` і через `alias` зміни `minutes` на 45 — переконайся, що це видно й у `task`.",
    criteria: "ти пояснюєш, що `alias` — не копія, а друге посилання на той самий об'єкт.",
    exports: ["task", "alias"],
    fileName: "task.js",
    starterCode: `const task = { id: 1, title: "Повторити функції", minutes: 30, done: false };

task = { id: 1, title: "Повторити функції", minutes: 30, done: true };`,
    testCases: [
      { name: "Стан завдання", check(ctx) { const t = ctx.get("task"); const exp = { id: 1, title: "Повторити функції", minutes: 45, done: true }; return { pass: ctx.equal(t, exp), actual: ctx.show(t), expected: ctx.show(exp) }; } },
      { name: "alias і task — той самий об'єкт", check(ctx) { const same = ctx.get("alias") === ctx.get("task"); return { pass: same, actual: same ? "той самий" : "різні", expected: "той самий" }; } },
    ],
    codeChecks: [{ re: /delete\s+task\.note/, label: "Примітку видалено через `delete`" }, { re: /task\.note\s*=/, label: "Примітку спершу додано" }],
    solution: `const task = { id: 1, title: "Повторити функції", minutes: 30, done: false };

task.done = true;
task.note = "Пройти до вечора";
delete task.note;

const alias = task;
alias.minutes = 45;`,
    hint: "Не створюй новий об'єкт — змінюй поля наявного: `task.done = true;`.",
    difficulty: 1,
  }),
  jsqLevel(5, {
    id: 41,
    title: "Методи й this — поведінка завдання",
    concept: "**Метод** — функція у властивості об'єкта. Усередині звичайної функції-методу `this` — це об'єкт, **через який її викликали**: у `task.getSummary()` `this` — це `task`. Стрілкова функція **не має** власного `this`, тому як метод, що читає `this`, вона не підходить.",
    example: `const lamp = {
  name: "Ліхтар",
  describe() {
    return \`Це \${this.name}\`;
  },
};
lamp.describe(); // "Це Ліхтар"`,
    missionStory: "Кожна реліквія вміє сама розповісти про себе. Але дві з них мовчать — їхні закляття написані «стрілками».",
    worldEvent: "Реліквії самі розповідають про себе.",
    taskType: "fix-code",
    prompt: "Обидва завдання мають метод `getSummary()`, що повертає `\"Повторити функції — 30 хв\"` для першого і `\"Масиви — 45 хв\"` для другого. Виправ методи, щоб `this` вказував на свій об'єкт.",
    criteria: "метод читає потрібний об'єкт; ти пояснюєш, чому його не слід механічно замінювати стрілкою.",
    exports: ["task1", "task2"],
    fileName: "summary.js",
    starterCode: `const task1 = {
  title: "Повторити функції",
  minutes: 30,
  getSummary: () => \`\${this.title} — \${this.minutes} хв\`,
};

const task2 = {
  title: "Масиви",
  minutes: 45,
  getSummary: () => \`\${this.title} — \${this.minutes} хв\`,
};`,
    testCases: [
      { name: "task1.getSummary()", check(ctx) { const v = ctx.get("task1").getSummary(); return { pass: v === "Повторити функції — 30 хв", actual: ctx.show(v), expected: "\"Повторити функції — 30 хв\"" }; } },
      { name: "task2.getSummary()", check(ctx) { const v = ctx.get("task2").getSummary(); return { pass: v === "Масиви — 45 хв", actual: ctx.show(v), expected: "\"Масиви — 45 хв\"" }; } },
    ],
    solution: `const task1 = {
  title: "Повторити функції",
  minutes: 30,
  getSummary() {
    return \`\${this.title} — \${this.minutes} хв\`;
  },
};

const task2 = {
  title: "Масиви",
  minutes: 45,
  getSummary() {
    return \`\${this.title} — \${this.minutes} хв\`;
  },
};`,
    hint: "Заміни стрілку на короткий запис методу: `getSummary() { return ...; }`.",
    difficulty: 2,
  }),
  jsqLevel(5, {
    id: 42,
    title: "for...in, Object.keys/values — перегляд властивостей",
    concept: "`for (const key in obj)` перебирає ключі об'єкта — зокрема й **успадковані** перелічувані (від прототипу). `Object.keys(obj)` повертає масив **власних** ключів, `Object.values(obj)` — їхніх значень. Для масивів `for...in` як основний обхід не використовуй — там є `for`, `forEach` і методи масивів.",
    example: `const size = { width: 3, height: 4 };
Object.keys(size);   // ["width", "height"]
Object.values(size); // [3, 4]
for (const key in size) {
  console.log(key, size[key]);
}`,
    missionStory: "Скарбник святилища описує налаштування журналу: які є поля і що в них записано.",
    worldEvent: "Налаштування журналу описано повністю.",
    taskType: "write-function",
    prompt: "Для об'єкта `settings` збери пари `\"назва: значення\"` двома способами: `pairsA` — через `for...in`, `pairsB` — через `Object.keys` і `map`. Окремо збережи `keys` і `values` через `Object.keys` і `Object.values`.",
    criteria: "обидва способи дають однаковий результат; ти розумієш, чим `for...in` відрізняється від `Object.keys`.",
    exports: ["pairsA", "pairsB", "keys", "values"],
    fileName: "settings.js",
    starterCode: `const settings = { theme: "dark", dailyGoal: 40, sound: false };
const pairsA = [];
`,
    testCases: [
      { name: "Ключі й значення", check: jsqVars({ keys: ["theme", "dailyGoal", "sound"], values: ["dark", 40, false] }) },
      { name: "Пари двома способами", check: jsqVars({ pairsA: ["theme: dark", "dailyGoal: 40", "sound: false"], pairsB: ["theme: dark", "dailyGoal: 40", "sound: false"] }) },
    ],
    codeChecks: [{ re: /for\s*\(\s*(const|let)\s+\w+\s+in\b/, label: "Використано `for...in`" }, { re: /Object\.keys\(/, label: "`Object.keys`" }, { re: /Object\.values\(/, label: "`Object.values`" }],
    solution: `const settings = { theme: "dark", dailyGoal: 40, sound: false };
const pairsA = [];

for (const key in settings) {
  pairsA.push(\`\${key}: \${settings[key]}\`);
}

const pairsB = Object.keys(settings).map((key) => \`\${key}: \${settings[key]}\`);
const keys = Object.keys(settings);
const values = Object.values(settings);`,
    hint: "Значення за ключем зі змінної — `settings[key]`. Пару будуй шаблонним рядком.",
    difficulty: 2,
  }),
  jsqLevel(5, {
    id: 43,
    title: "in, hasOwnProperty — наявність властивості",
    concept: "**Наявність** властивості — не те саме, що її **істинність**: у `{ done: false }` поле є, хоч значення falsy. `\"key\" in obj` перевіряє наявність, зокрема й **успадкованих** властивостей (`\"toString\" in {}` → `true`). `Object.hasOwn(obj, \"key\")` (сучасна заміна `obj.hasOwnProperty(\"key\")`) — лише **власні**.",
    example: `const box = { count: 0 };
box.count ? "є" : "немає";       // "немає" — хибно!
"count" in box;                  // true
"toString" in box;               // true — успадковане
Object.hasOwn(box, "toString");  // false`,
    missionStory: "Охоронець святилища каже, що в реліквії «немає» поля `done`, бо там записано `false`. Час навчити його відрізняти «порожньо» від «немає».",
    worldEvent: "Охоронець розрізняє «немає» і «порожньо».",
    taskType: "fix-code",
    prompt: "Функція `describeField(task, key)` повертає: `\"немає\"` — якщо **власної** властивості немає; `\"є, але falsy\"` — якщо вона є, але значення falsy; `\"є\"` — інакше. Зараз вона плутає відсутність з falsy-значенням. Виправ.",
    criteria: "ти розрізняєш «відсутнє», «власне» й «має falsy-значення»; успадкований `toString` не вважається власним полем.",
    functionName: "describeField",
    fileName: "fields.js",
    starterCode: `function describeField(task, key) {
  if (!task[key]) return "немає";
  return "є";
}`,
    testCases: [
      { input: [{ title: "Масиви", done: false }, "title"], expectedOutput: "є" },
      { input: [{ title: "Масиви", done: false }, "done"], expectedOutput: "є, але falsy" },
      { input: [{ title: "Масиви", minutes: 0 }, "minutes"], expectedOutput: "є, але falsy" },
      { input: [{ title: "Масиви", note: undefined }, "note"], expectedOutput: "є, але falsy" },
      { input: [{ title: "Масиви" }, "priority"], expectedOutput: "немає" },
      { input: [{ title: "Масиви" }, "toString"], expectedOutput: "немає" },
    ],
    codeChecks: [{ re: /Object\.hasOwn\(|hasOwnProperty\(/, label: "Перевірка власної властивості" }],
    solution: `function describeField(task, key) {
  if (!Object.hasOwn(task, key)) return "немає";
  if (!task[key]) return "є, але falsy";
  return "є";
}`,
    hint: "Спершу питання «чи є власне поле?» — `Object.hasOwn(task, key)`. І лише потім — «чи truthy значення?».",
    difficulty: 2,
  }),
  jsqLevel(5, {
    id: 44,
    title: "Деструктуризація — потрібні поля у змінні",
    concept: "`const { title, minutes } = task;` створює змінні з полів об'єкта. Перейменування: `{ title: taskTitle }`. Стандартне значення: `{ minutes = 30 }` — спрацьовує, лише коли поле **відсутнє** або `undefined`; `0` лишається нулем. Для масивів — за позицією: `const [first, second] = list;`. Джерело при цьому не змінюється.",
    example: `const point = { x: 3 };
const { x: left, y = 0 } = point; // left = 3, y = 0
const [a, b] = ["перший", "другий"];`,
    missionStory: "Писар святилища переписує з реліквій лише потрібне — і має не загубити нуль хвилин у дні відпочинку.",
    worldEvent: "Писар переписує реліквії без втрат.",
    taskType: "write-function",
    prompt: "Об'єкт `task` і масив `pair` задає перевірка. Через деструктуризацію створи: `taskTitle` (з поля `title`), `minutes` зі стандартним значенням 30. Із `pair` візьми перші два елементи в `first` і `second`.",
    criteria: "джерело не змінюється; ти пояснюєш поведінку для відсутньої властивості та для `0`.",
    exports: ["taskTitle", "minutes", "first", "second"],
    fileName: "destructuring.js",
    starterCode: `// task і pair задає перевірка
`,
    testCases: [
      { name: "Усі поля є", inputs: { task: { title: "Масиви", minutes: 45 }, pair: ["Змінні", "Цикли"] }, check: jsqVars({ taskTitle: "Масиви", minutes: 45, first: "Змінні", second: "Цикли" }) },
      { name: "minutes відсутнє → 30", inputs: { task: { title: "DOM" }, pair: ["a", "b"] }, check: jsqVars({ taskTitle: "DOM", minutes: 30, first: "a", second: "b" }) },
      { name: "minutes = 0 лишається 0", inputs: { task: { title: "Відпочинок", minutes: 0 }, pair: ["x", "y"] }, check: jsqVars({ taskTitle: "Відпочинок", minutes: 0, first: "x", second: "y" }) },
    ],
    codeChecks: [{ re: /\{\s*title\s*:\s*taskTitle/, label: "Перейменування `title: taskTitle`" }, { re: /minutes\s*=\s*30/, label: "Стандарт `minutes = 30`" }, { re: /\[\s*first\s*,\s*second\s*\]/, label: "Деструктуризація масиву" }],
    solution: `// task і pair задає перевірка
const { title: taskTitle, minutes = 30 } = task;
const [first, second] = pair;`,
    hint: "Перейменування і стандарт можна поєднати в одних дужках: `{ title: taskTitle, minutes = 30 }`.",
    difficulty: 2,
  }),
  jsqLevel(5, {
    id: 45,
    title: "Spread — копія з оновленням",
    concept: "Spread `...` розгортає елементи масиву чи властивості об'єкта. `{ ...task, done: true }` — **новий** об'єкт з усіма полями `task`, де `done` перезаписано (пізніші поля перемагають). `[...tasks, newTask]` — новий масив з доданим елементом. Копія **поверхнева**: вкладені об'єкти й масиви не копіюються, обидві копії ділять те саме посилання.",
    example: `const user = { name: "Оля", age: 20 };
const older = { ...user, age: 21 }; // user.age лишився 20
const nums = [1, 2];
const more = [...nums, 3];          // nums лишився [1, 2]`,
    missionStory: "Остання реліквія святилища зберігає історію: старий запис має лишатися незмінним, а новий — бути окремою копією.",
    worldEvent: "Активовано стародавнє святилище!",
    taskType: "write-function",
    prompt: "Об'єкт `task`, масив `tasks` і `newTask` задає перевірка. Створи: `doneTask` — копію `task` з `done: true`; `updatedTasks` — новий масив з усіма `tasks` і `newTask` у кінці. Джерела не змінюй. На вкладеному прикладі `withTags` зроби `tagsCopy = { ...withTags }`, додай у `tagsCopy.tags` тег `\"dom\"` і збережи в `sharedTags`, чи це той самий масив тегів (`tagsCopy.tags === withTags.tags`).",
    criteria: "попередній стан збережений; ти знаєш, чому spread не робить вкладені об'єкти незалежними.",
    exports: ["doneTask", "updatedTasks", "sharedTags"],
    fileName: "spread.js",
    starterCode: `// task, tasks і newTask задає перевірка
const withTags = { title: "Події", tags: ["js"] };
`,
    testCases: [
      {
        name: "Копії з оновленням",
        inputs: { task: { id: 1, title: "Масиви", minutes: 30, done: false }, tasks: [{ id: 1, title: "Масиви", minutes: 30, done: false }], newTask: { id: 2, title: "Об'єкти", minutes: 45, done: false } },
        check: jsqVars({ doneTask: { id: 1, title: "Масиви", minutes: 30, done: true }, updatedTasks: [{ id: 1, title: "Масиви", minutes: 30, done: false }, { id: 2, title: "Об'єкти", minutes: 45, done: false }] }),
      },
      {
        name: "Порожній tasks → один новий запис",
        inputs: { task: { id: 1, title: "Масиви", minutes: 30, done: false }, tasks: [], newTask: { id: 2, title: "Об'єкти", minutes: 45, done: false } },
        check(ctx) { const d = ctx.get("doneTask"); const u = ctx.get("updatedTasks"); return { pass: d.done === true && u.length === 1, actual: "doneTask.done " + d.done + ", updatedTasks.length " + u.length, expected: "doneTask.done true, updatedTasks.length 1" }; },
      },
      {
        name: "Вкладений масив спільний",
        inputs: { task: { id: 1, title: "Масиви", minutes: 30, done: false }, tasks: [], newTask: { id: 2, title: "Об'єкти", minutes: 45, done: false } },
        check: jsqVars({ sharedTags: true }),
      },
    ],
    codeChecks: [{ re: /\.\.\.task\b/, label: "Spread об'єкта `...task`" }, { re: /\.\.\.tasks\b/, label: "Spread масиву `...tasks`" }],
    solution: `// task, tasks і newTask задає перевірка
const withTags = { title: "Події", tags: ["js"] };

const doneTask = { ...task, done: true };
const updatedTasks = [...tasks, newTask];

const tagsCopy = { ...withTags };
tagsCopy.tags.push("dom");
const sharedTags = tagsCopy.tags === withTags.tags;`,
    hint: "Порядок у spread важливий: `{ ...task, done: true }` — спершу всі поля, потім перезапис `done`.",
    difficulty: 2,
  }),

  /* ───────────── Арка VI — Поширені пастки → Болото багів ───────────── */
  jsqLevel(6, {
    id: 46,
    title: "=== проти == — перевірка ідентифікатора",
    concept: "Значення з полів форми чи адреси сторінки приходять **рядками**, а `id` у даних — **числами**. `===` чесно каже, що `\"2\"` і `2` різні. Замінити `===` на `==` — не рішення: так ти ховаєш розбіжність типів, а не виправляєш її. Правильно — **нормалізувати** тип на вході: `Number(id)`.",
    example: `const fromInput = "7";
const wanted = Number(fromInput); // 7 — тепер число
console.log(wanted === 7);        // true`,
    missionStory: "У Болоті багів журнал перестав знаходити завдання за номером — хоча номер точно правильний.",
    worldEvent: "Журнал знову знаходить завдання за номером.",
    taskType: "fix-code",
    prompt: "`findTaskById(tasks, id)` отримує `id` то числом, то рядком із форми (`\"2\"`). Виправ пошук, свідомо перетворивши тип, — без `==`.",
    criteria: "правильний пошук наявного й відсутнього `id`; перетворення типу обґрунтоване, оператор не змінено навмання.",
    functionName: "findTaskById",
    fileName: "find.js",
    starterCode: `function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}`,
    testCases: [
      { name: "id рядком \"2\"", input: [[{ id: 1, title: "Масиви" }, { id: 2, title: "DOM" }], "2"], expectedOutput: { id: 2, title: "DOM" } },
      { name: "id числом 1", input: [[{ id: 1, title: "Масиви" }, { id: 2, title: "DOM" }], 1], expectedOutput: { id: 1, title: "Масиви" } },
      { name: "Відсутній \"7\" → undefined", input: [[{ id: 1, title: "Масиви" }], "7"], expectedOutput: undefined },
    ],
    codeChecks: [{ re: /[^=!]==[^=]/, not: true, label: "Без нестрогого `==`" }, { re: /Number\(/, label: "Тип перетворено через `Number()`" }],
    solution: `function findTaskById(tasks, id) {
  const wantedId = Number(id);
  return tasks.find((task) => task.id === wantedId);
}`,
    hint: "Перетвори `id` на число один раз — до пошуку, і порівнюй строго.",
    difficulty: 1,
  }),
  jsqLevel(6, {
    id: 47,
    title: "Порядок приведення — розкласти вираз",
    concept: "`+` і `-` мають однаковий пріоритет і виконуються **зліва направо**. Тому `1 + 2 + \"3\"` — спершу `1 + 2 = 3` (числа), потім `3 + \"3\" = \"33\"` (склеювання). А `\"1\" + 2 + 3` — склеювання вже на першому кроці. `-` завжди віднімає числа. Дужки змінюють порядок. Але «зліва направо» не перенось на будь-які вирази: `*` і `/` виконуються раніше за `+`.",
    example: `console.log(2 + 3 + "px");   // "5px"
console.log("px" + 2 + 3);   // "px23"
console.log("8" - 3 + "!");  // "5!"`,
    missionStory: "Болотяний бакалавр складає вирази так, що отримує то «33», то «123». Розклади його обчислення по кроках.",
    worldEvent: "Бакалавр болота зрозумів порядок обчислень.",
    taskType: "predict-output",
    prompt: "Передбач вивід кожного рядка. Розбери вираз покроково: значення й тип на кожному кроці.",
    criteria: "на кожному кроці ти вказуєш значення й тип.",
    answerHeading: "Що виведе консоль?",
    answerPlaceholder: "результат",
    starterCode: null,
    code: `console.log(1 + 2 + "3");
console.log("1" + 2 + 3);
console.log("10" - 2 + "1");
console.log("10" + (2 + 1));`,
    expectedAnswer: ["33", "123", "81", "103"],
    hint: "Йди зліва направо. `\"10\" - 2` — віднімання, тож це число 8. А `8 + \"1\"` — уже склеювання.",
    difficulty: 2,
  }),
  jsqLevel(6, {
    id: 48,
    title: "Непорожні рядки — хибний прапорець",
    concept: "`Boolean(\"false\")` — `true`: перетворення не читає зміст слова, воно лише дивиться, чи рядок порожній. `\"0\"` і `\" \"` теж truthy. Тому прапорці з тексту (налаштування, адреса сторінки) розбирають **явно**: `\"true\"` → `true`, `\"false\"` → `false`, а все інше — окремий сигнал некоректного вводу.",
    example: `function parseYesNo(text) {
  if (text === "так") return true;
  if (text === "ні") return false;
  return null; // незрозуміло
}`,
    missionStory: "Болото підкидає налаштування «sound=false» — і журнал радісно вмикає звук. Бо «false» — непорожній рядок.",
    worldEvent: "Налаштування журналу читаються правильно.",
    taskType: "fix-code",
    prompt: "Виправ `parseFlag(value)`: `\"true\"` → `true`, `\"false\"` → `false`, будь-що інше (порожній рядок, `\"yes\"`, `\"0\"`) → `null`.",
    criteria: "перевірено обидва дозволені рядки, порожній і невідомий; довільний непорожній рядок не стає випадковим «так».",
    functionName: "parseFlag",
    fileName: "flags.js",
    starterCode: `function parseFlag(value) {
  return Boolean(value);
}`,
    testCases: [
      { input: ["true"], expectedOutput: true },
      { input: ["false"], expectedOutput: false },
      { input: [""], expectedOutput: null },
      { input: ["yes"], expectedOutput: null },
      { input: ["0"], expectedOutput: null },
    ],
    solution: `function parseFlag(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}`,
    hint: "Порівнюй рядок з конкретними словами через `===`, а для всього іншого поверни `null`.",
    difficulty: 1,
  }),
  jsqLevel(6, {
    id: 49,
    title: "Оголошення функції — знайти помилку",
    concept: "Помилки бувають двох видів. **Синтаксична** (`SyntaxError`) — код зламаний граматично, тож не запускається взагалі: бракує дужки, лапки. **Логічна** — код запускається, але робить не те: забутий `return`, функцію передано замість виклику. Для синтаксичних читай повідомлення й рядок, для логічних — перевіряй результат.",
    example: `function square(n) {
  return n * n;   // без return функція повернула б undefined
}
const area = square(4); // 16 — виклик із дужками`,
    missionStory: "Три закляття-функції Болота багів не працюють: одне зламане граматично, а два мовчки повертають не те.",
    worldEvent: "Три закляття болота знову діють.",
    taskType: "fix-code",
    prompt: "Виправ три функції: `double(4)` → 8, `triple(4)` → 12, `half(8)` → 4. А `result` має містити **результат виклику** `double(5)`, тобто 10.",
    criteria: "кожна функція викликається й повертає потрібне значення; ти називаєш тип кожної проблеми.",
    exports: ["double", "triple", "half", "result"],
    fileName: "spells.js",
    starterCode: `function double(n) {
  n * 2;
}

const triple = function (n) {
  return n * 3;

const half = (n) => { n / 2 };

const result = double;`,
    testCases: [
      { name: "double(4) → 8", fn: "double", input: [4], expectedOutput: 8 },
      { name: "triple(4) → 12", fn: "triple", input: [4], expectedOutput: 12 },
      { name: "half(8) → 4", fn: "half", input: [8], expectedOutput: 4 },
      { name: "result — це 10", check: jsqVars({ result: 10 }) },
    ],
    solution: `function double(n) {
  return n * 2;
}

const triple = function (n) {
  return n * 3;
};

const half = (n) => n / 2;

const result = double(5);`,
    hint: "Почни із синтаксичної помилки — без її виправлення нічого не запуститься. Потім подивись, які функції не повертають значення.",
    difficulty: 2,
  }),
  jsqLevel(6, {
    id: 50,
    title: "Безкінечний цикл — умова завершення",
    concept: "Цикл завершується, лише коли умова стає хибною. Якщо змінна в умові **не змінюється** або змінюється **не в той бік**, цикл ніколи не скінчиться, і сторінка «зависне». Перед запуском простеж вручну 2–3 ітерації: як змінюється лічильник і чи наближається він до межі? (У тренажері зламаний цикл зупиняє захисний ліміт часу.)",
    example: `let fuel = 3;
while (fuel > 0) {
  console.log(fuel);
  fuel = fuel - 1; // без цього рядка — безкінечний цикл
}`,
    missionStory: "Болотяні вогники кружляють по колу без кінця. Знайди, чому лічильники ніколи не доходять до межі.",
    worldEvent: "Вогники болота знайшли дорогу додому.",
    taskType: "fix-code",
    prompt: "Обидва цикли зависають. Виправ лічильники: `total` має бути сумою чисел від 1 до 5 (тобто 15), а `steps` — зворотним відліком `[3, 2, 1]`.",
    criteria: "ти пояснюєш, чому кожен цикл тепер завершиться.",
    exports: ["total", "steps"],
    fileName: "loops.js",
    starterCode: `let i = 1;
let total = 0;
while (i <= 5) {
  total = total + i;
}

let countdown = 3;
const steps = [];
while (countdown > 0) {
  steps.push(countdown);
  countdown = countdown + 1;
}`,
    testCases: [
      { name: "Сума 1..5 і відлік", check: jsqVars({ total: 15, steps: [3, 2, 1] }) },
    ],
    solution: `let i = 1;
let total = 0;
while (i <= 5) {
  total = total + i;
  i = i + 1;
}

let countdown = 3;
const steps = [];
while (countdown > 0) {
  steps.push(countdown);
  countdown = countdown - 1;
}`,
    hint: "Перший цикл: чи змінюється `i` всередині? Другий: `countdown` має наближатися до 0, а не віддалятися.",
    difficulty: 1,
  }),
  jsqLevel(6, {
    id: 51,
    title: "=+ проти += — загублена сума",
    concept: "`x += y` означає `x = x + y` — **додати** до попереднього. А `x =+ y` — це `x = +y`: унарний плюс перед `y` і просте присвоєння, тож попереднє значення **губиться**. У циклі з `=+` наприкінці лишається тільки останнє число.",
    example: `let score = 10;
score += 5;   // 15
score =+ 5;   // 5 — це score = +5`,
    missionStory: "Болотяний рахівник сумує хвилини тижня, але щоразу отримує лише час останнього заняття.",
    worldEvent: "Рахівник болота нарешті рахує суму.",
    taskType: "fix-code",
    prompt: "Функція `sumMinutes(durations)` має повертати суму всіх тривалостей. Знайди, чому вона повертає лише останнє число, і виправ.",
    criteria: "для `[10, 20, 30]` виходить 60; ти пояснюєш, чому зламаний варіант лишав останнє число.",
    functionName: "sumMinutes",
    fileName: "sum.js",
    starterCode: `function sumMinutes(durations) {
  let total = 0;
  for (let i = 0; i < durations.length; i++) {
    total =+ durations[i];
  }
  return total;
}`,
    testCases: [
      { input: [[10, 20, 30]], expectedOutput: 60 },
      { input: [[45]], expectedOutput: 45 },
      { input: [[]], expectedOutput: 0 },
    ],
    codeChecks: [{ re: /=\+/, not: true, label: "Без `=+`" }],
    solution: `function sumMinutes(durations) {
  let total = 0;
  for (let i = 0; i < durations.length; i++) {
    total += durations[i];
  }
  return total;
}`,
    hint: "Поміняй місцями два символи оператора.",
    difficulty: 1,
  }),
  jsqLevel(6, {
    id: 52,
    title: "sort() як текст — ремонт звіту",
    concept: "Компаратор для `sort` має повертати **число**: від'ємне, нуль чи додатне. `(a, b) => a.minutes - b.minutes` — правильно. `(a, b) => a.minutes > b.minutes` повертає `true`/`false` і працює ненадійно. До того ж `sort()` змінює масив — для звіту сортуй копію. Перевіряй дані **до і після** операції.",
    example: `const cities = [{ name: "B", km: 30 }, { name: "A", km: 5 }];
const byKm = cities.slice().sort((a, b) => a.km - b.km);`,
    missionStory: "Бос-баг болота зіпсував звіт: завдання стоять не за тривалістю, оригінальний список перемішано, а сума хвилин неправильна.",
    worldEvent: "Переможено боса-бага болота!",
    taskType: "fix-code",
    prompt: "Виправ звіт: `sortByMinutes(tasks)` повертає **копію**, відсортовану за `minutes` за зростанням, не змінюючи джерела. `totalMinutes(tasks)` повертає суму хвилин. У звіті дві помилки з попередніх рівнів.",
    criteria: "правильний порядок 5, 30, 100; джерело збережене; обидві причини помилок пояснені.",
    exports: ["sortByMinutes", "totalMinutes"],
    fileName: "report.js",
    starterCode: `function sortByMinutes(tasks) {
  return tasks.sort((a, b) => a.minutes > b.minutes);
}

function totalMinutes(tasks) {
  let total = 0;
  for (let i = 0; i < tasks.length; i++) {
    total =+ tasks[i].minutes;
  }
  return total;
}`,
    testCases: [
      { name: "Порядок 5, 30, 100", check(ctx) { const src = [{ title: "Звіт", minutes: 100 }, { title: "Масиви", minutes: 5 }, { title: "DOM", minutes: 30 }]; const r = ctx.get("sortByMinutes")(src).map((t) => t.minutes); return { pass: ctx.equal(r, [5, 30, 100]), actual: ctx.show(r), expected: "[5, 30, 100]" }; } },
      { name: "Джерело не змінилось", check(ctx) { const src = [{ minutes: 100 }, { minutes: 5 }, { minutes: 30 }]; ctx.get("sortByMinutes")(src); const after = src.map((t) => t.minutes); return { pass: ctx.equal(after, [100, 5, 30]), actual: ctx.show(after), expected: "[100, 5, 30]" }; } },
      { name: "Сума хвилин → 135", check(ctx) { const v = ctx.get("totalMinutes")([{ minutes: 100 }, { minutes: 5 }, { minutes: 30 }]); return { pass: v === 135, actual: ctx.show(v), expected: "135" }; } },
    ],
    solution: `function sortByMinutes(tasks) {
  return tasks.slice().sort((a, b) => a.minutes - b.minutes);
}

function totalMinutes(tasks) {
  let total = 0;
  for (let i = 0; i < tasks.length; i++) {
    total += tasks[i].minutes;
  }
  return total;
}`,
    hint: "Перша помилка — компаратор і зміна джерела (рівень 32). Друга — оператор у сумі (рівень 51).",
    difficulty: 2,
  }),

  /* ───────────── Арка VII — DOM, основи → Міст DOM ───────────── */
  jsqLevel(7, {
    id: 53,
    title: "querySelector — знайти один елемент",
    concept: "Браузер перетворює HTML на **DOM** — дерево об'єктів-елементів, з яким працює JavaScript. `document.querySelector(\"селектор\")` повертає **перший** елемент, що підходить під CSS-селектор (`#id`, `.class`, `tag`), або `null`, якщо такого немає. Тому перед дією з елементом перевіряй, що він знайшовся. Скрипт заготовки запускається вже після того, як браузер розібрав розмітку.",
    example: `const heading = document.querySelector("h1");
const menu = document.querySelector("#menu");
const lost = document.querySelector(".no-such-class"); // null
if (lost) {
  lost.textContent = "Знайдено";
}`,
    missionStory: "Над прірвою — Міст DOM. Майстер-мостобудівник просить спершу знайти на сторінці журналу три головні опори: заголовок, кнопку й поле.",
    worldEvent: "Опори мосту знайдено й позначено.",
    taskType: "write-function",
    prompt: "Знайди через `querySelector`: заголовок `#tracker-title` → `titleEl`, кнопку `#add-btn` → `addButton`, поле `#task-title` → `titleInput`. Окремо спробуй селектор з одруківкою `#trackr-title` → `missing`. Створи `missingText`: текст `missing`, якщо елемент знайдено, інакше рядок `\"немає елемента\"`.",
    criteria: "елементи знайдено, а перед дією з `missing` ти перевіряєш, що це не `null`.",
    exports: ["titleEl", "addButton", "titleInput", "missing", "missingText"],
    fileName: "tracker.js",
    html: `<main class="tracker">
  <h1 id="tracker-title">Похідний журнал</h1>
  <form id="task-form">
    <input id="task-title" placeholder="Назва завдання">
    <button id="add-btn" type="submit">Додати</button>
  </form>
  <ul id="task-list"></ul>
</main>`,
    starterCode: `// Знайди елементи сторінки
`,
    testCases: [
      { name: "Знайдено три елементи", check(ctx) { const ok = jsqVal(ctx, "titleEl") === ctx.$("#tracker-title") && jsqVal(ctx, "addButton") === ctx.$("#add-btn") && jsqVal(ctx, "titleInput") === ctx.$("#task-title"); return { pass: ok, actual: ok ? "усі три" : ctx.show([jsqVal(ctx, "titleEl"), jsqVal(ctx, "addButton"), jsqVal(ctx, "titleInput")]), expected: "заголовок, кнопка й поле" }; } },
      { name: "Одруківка в селекторі → null і безпечний текст", check: jsqVars({ missing: null, missingText: "немає елемента" }) },
    ],
    codeChecks: [{ re: /querySelector\(/, label: "Використано `querySelector`" }],
    solution: `const titleEl = document.querySelector("#tracker-title");
const addButton = document.querySelector("#add-btn");
const titleInput = document.querySelector("#task-title");

const missing = document.querySelector("#trackr-title");
const missingText = missing ? missing.textContent : "немає елемента";`,
    hint: "Для `missingText` згодиться тернарний оператор: якщо `missing` truthy — його текст, інакше запасний рядок.",
    difficulty: 1,
  }),
  jsqLevel(7, {
    id: 54,
    title: "querySelectorAll — знайти групу",
    concept: "`document.querySelectorAll(\"селектор\")` повертає `NodeList` — колекцію **всіх** збігів. У неї є `length` і `forEach`, але це не звичайний масив: `map` чи `filter` у неї немає (`Array.from(list)` перетворює на масив). Список **статичний**: якщо потім додати на сторінку нові елементи, вже отриманий список не оновиться сам.",
    example: `const links = document.querySelectorAll("a");
console.log(links.length);
links.forEach((link) => console.log(link.textContent));`,
    missionStory: "Майстер хоче знати, скільки дощок-завдань уже лежить на мосту і що написано на кожній.",
    worldEvent: "Дошки мосту перелічено.",
    taskType: "write-function",
    prompt: "Знайди всі картки `.task-card` у змінну `cards`, кількість збережи в `cardsCount`. Через `forEach` виведи в консоль назву кожної картки — текст її елемента `.task-title`.",
    criteria: "працює для кількох, однієї й жодної картки.",
    exports: ["cardsCount"],
    fileName: "tracker.js",
    html: `<ul id="task-list">
  <li class="task-card"><span class="task-title">Повторити функції</span></li>
  <li class="task-card"><span class="task-title">Масиви</span></li>
  <li class="task-card"><span class="task-title">Об'єкти</span></li>
</ul>`,
    starterCode: `// Знайди всі картки
`,
    testCases: [
      { name: "Три картки", check(ctx) { const c = jsqVal(ctx, "cardsCount"); const exp = ["Повторити функції", "Масиви", "Об'єкти"]; return { pass: c === 3 && ctx.equal(ctx.logs, exp), actual: "cardsCount " + ctx.show(c) + ", вивід " + ctx.show(ctx.logs), expected: "cardsCount 3, вивід " + ctx.show(exp) }; } },
      { name: "Одна картка", html: `<ul id="task-list"><li class="task-card"><span class="task-title">DOM</span></li></ul>`, check(ctx) { const c = jsqVal(ctx, "cardsCount"); return { pass: c === 1 && ctx.equal(ctx.logs, ["DOM"]), actual: ctx.show(c) + ", " + ctx.show(ctx.logs), expected: "1, [\"DOM\"]" }; } },
      { name: "Жодної картки", html: `<ul id="task-list"></ul>`, check(ctx) { const c = jsqVal(ctx, "cardsCount"); return { pass: c === 0 && ctx.logs.length === 0, actual: ctx.show(c) + ", " + ctx.show(ctx.logs), expected: "0, []" }; } },
    ],
    codeChecks: [{ re: /querySelectorAll\(/, label: "Використано `querySelectorAll`" }, { re: /\.forEach\(/, label: "Обхід через `forEach`" }],
    solution: `const cards = document.querySelectorAll(".task-card");
const cardsCount = cards.length;

cards.forEach((card) => {
  console.log(card.querySelector(".task-title").textContent);
});`,
    hint: "У кожної картки можна шукати всередині: `card.querySelector(\".task-title\")`.",
    difficulty: 1,
  }),
  jsqLevel(7, {
    id: 55,
    title: "textContent — дані як текст",
    concept: "`element.textContent` читає й записує **текст** елемента. Під час запису весь попередній вміст, включно з вкладеними елементами, **замінюється** новим текстом. Кутові дужки в тексті не стають тегами: `\"<b>\"` так і буде показано як символи.",
    example: `const status = document.querySelector("#status");
console.log(status.textContent);  // читання
status.textContent = "Готово";    // запис`,
    missionStory: "На вивісці мосту треба написати назву журналу й підсумок виконаних завдань.",
    worldEvent: "На вивісці мосту з'явився підсумок.",
    taskType: "write-function",
    prompt: "Масив `tasks` (об'єкти з полем `done`) задає перевірка. Зміни заголовок `#tracker-title` на `\"Мій навчальний трекер\"`. У `#summary` запиши `Виконано: X з Y`, де X — кількість виконаних завдань, Y — усього. У `#note` запиши рядок `<strong>Не забудь перерву</strong>` через `textContent` і подивись, як він відобразиться.",
    criteria: "дані показано як текст; ти знаєш, які вкладені елементи замінює запис `textContent`.",
    fileName: "tracker.js",
    html: `<h1 id="tracker-title">Похідний журнал</h1>
<p id="summary">Виконано: ?</p>
<p id="note"><em>тут буде примітка</em></p>`,
    starterCode: `// tasks задає перевірка
`,
    testCases: [
      { name: "Заголовок і підсумок 1 з 3", inputs: { tasks: [{ done: true }, { done: false }, { done: false }] }, check(ctx) { const t = jsqText(ctx, "#tracker-title"), s = jsqText(ctx, "#summary"); return { pass: t === "Мій навчальний трекер" && s === "Виконано: 1 з 3", actual: ctx.show([t, s]), expected: "[\"Мій навчальний трекер\", \"Виконано: 1 з 3\"]" }; } },
      { name: "Порожній список → 0 з 0", inputs: { tasks: [] }, check(ctx) { const s = jsqText(ctx, "#summary"); return { pass: s === "Виконано: 0 з 0", actual: ctx.show(s), expected: "\"Виконано: 0 з 0\"" }; } },
      { name: "Теги в примітці лишились текстом", inputs: { tasks: [] }, check(ctx) { const note = ctx.$("#note"); const pass = note.children.length === 0 && note.textContent === "<strong>Не забудь перерву</strong>"; return { pass, actual: note.children.length ? "з'явились елементи" : ctx.show(note.textContent), expected: "текст «<strong>Не забудь перерву</strong>» без елементів" }; } },
    ],
    codeChecks: [{ re: /\.textContent\s*=/, label: "Запис через `textContent`" }],
    solution: `// tasks задає перевірка
const doneCount = tasks.filter((task) => task.done).length;

document.querySelector("#tracker-title").textContent = "Мій навчальний трекер";
document.querySelector("#summary").textContent = \`Виконано: \${doneCount} з \${tasks.length}\`;
document.querySelector("#note").textContent = "<strong>Не забудь перерву</strong>";`,
    hint: "Кількість виконаних — довжина відфільтрованого масиву: `tasks.filter((task) => task.done).length`.",
    difficulty: 1,
  }),
  jsqLevel(7, {
    id: 56,
    title: "innerHTML — рядок стає розміткою",
    concept: "`element.innerHTML = рядок` змушує браузер **розібрати** рядок як HTML і створити елементи: `<strong>` справді стане жирним текстом. `textContent` такого не робить. Важливо для безпеки: **текст користувача** (назви завдань, імена) завжди показуй через `textContent`. Через `innerHTML` чужий рядок може вставити на сторінку будь-яку розмітку.",
    example: `box.textContent = "<em>привіт</em>"; // покаже теги як символи
box.innerHTML = "<em>привіт</em>";   // покаже курсив`,
    missionStory: "Майстер показує два ліхтарі з однаковим написом. В одному напис горить жирним, в іншому видно самі теги. Розберися чому.",
    worldEvent: "Ліхтарі мосту світять правильно.",
    taskType: "write-function",
    prompt: "Запиши фіксований рядок `<strong>Готово</strong>` у `#as-text` через `textContent`, а в `#as-html` — через `innerHTML`. Порівняй, що відобразилось.",
    criteria: "ти пояснюєш різницю й не вставляєш текст користувача через `innerHTML`.",
    fileName: "compare.js",
    html: `<p id="as-text"></p>
<p id="as-html"></p>`,
    starterCode: `const label = "<strong>Готово</strong>";
`,
    testCases: [
      { name: "#as-text показує теги як текст", check(ctx) { const el = ctx.$("#as-text"); const pass = el.children.length === 0 && el.textContent === "<strong>Готово</strong>"; return { pass, actual: el.children.length ? "з'явився елемент" : ctx.show(el.textContent), expected: "текст «<strong>Готово</strong>»" }; } },
      { name: "#as-html містить елемент <strong>", check(ctx) { const s = ctx.$("#as-html strong"); return { pass: !!s && s.textContent === "Готово", actual: s ? "<strong>" + s.textContent + "</strong>" : "немає <strong>", expected: "<strong>Готово</strong>" }; } },
    ],
    codeChecks: [{ re: /\.innerHTML\s*=/, label: "Використано `innerHTML`" }, { re: /\.textContent\s*=/, label: "Використано `textContent`" }],
    solution: `const label = "<strong>Готово</strong>";

document.querySelector("#as-text").textContent = label;
document.querySelector("#as-html").innerHTML = label;`,
    hint: "Два рядки з однаковим значенням, але різними властивостями.",
    difficulty: 1,
  }),
  jsqLevel(7, {
    id: 57,
    title: "element.style — точкова зміна вигляду",
    concept: "`element.style` задає **inline-стиль** конкретного елемента. Назви властивостей пишуться в camelCase: CSS `background-color` → JS `backgroundColor`, `font-size` → `fontSize`. Розміри — рядки з одиницями: `\"20px\"`, а не `20`. Порожній рядок прибирає власне inline-значення: `el.style.color = \"\"`.",
    example: `const badge = document.querySelector(".badge");
badge.style.color = "white";
badge.style.backgroundColor = "tomato";
badge.style.fontSize = "18px";`,
    missionStory: "Ліхтар прогресу на мосту має світити зеленим, коли денну ціль досягнуто, і червоним — коли ще ні.",
    worldEvent: "Ліхтар прогресу світить відповідним кольором.",
    taskType: "write-function",
    prompt: "Прапорець `goalReached` задає перевірка. Для `#progress-msg`: фон завжди `\"#f3eee2\"`; якщо ціль досягнуто — колір `\"seagreen\"` і розмір шрифту `\"20px\"`, інакше колір `\"firebrick\"` і `\"16px\"`.",
    criteria: "властивості змінено для обох станів; ти не плутаєш назву JS-властивості із записом CSS через дефіс.",
    fileName: "progress.js",
    html: `<p id="progress-msg">Прогрес за день</p>`,
    starterCode: `// goalReached задає перевірка
const message = document.querySelector("#progress-msg");
`,
    testCases: [
      { name: "Ціль досягнута", inputs: { goalReached: true }, check(ctx) { const s = ctx.$("#progress-msg").style; const probe = ctx.doc.createElement("p"); probe.style.backgroundColor = "#f3eee2"; const pass = s.color === "seagreen" && s.fontSize === "20px" && s.backgroundColor === probe.style.backgroundColor; return { pass, actual: ctx.show([s.color, s.fontSize, s.backgroundColor]), expected: ctx.show(["seagreen", "20px", probe.style.backgroundColor]) }; } },
      { name: "Ціль ще ні", inputs: { goalReached: false }, check(ctx) { const s = ctx.$("#progress-msg").style; return { pass: s.color === "firebrick" && s.fontSize === "16px", actual: ctx.show([s.color, s.fontSize]), expected: ctx.show(["firebrick", "16px"]) }; } },
    ],
    codeChecks: [{ re: /\.style\.backgroundColor\s*=/, label: "`backgroundColor` у camelCase" }, { re: /\.style\.fontSize\s*=/, label: "`fontSize` у camelCase" }],
    solution: `// goalReached задає перевірка
const message = document.querySelector("#progress-msg");

message.style.backgroundColor = "#f3eee2";
if (goalReached) {
  message.style.color = "seagreen";
  message.style.fontSize = "20px";
} else {
  message.style.color = "firebrick";
  message.style.fontSize = "16px";
}`,
    hint: "`message.style.fontSize = \"20px\";` — з одиницями й у лапках.",
    difficulty: 1,
  }),
  jsqLevel(7, {
    id: 58,
    title: "classList.add / remove — стан через клас",
    concept: "Оформлення краще описувати в CSS-класах, а JavaScript лише вмикає чи вимикає клас. `el.classList.add(\"is-done\")` додає клас, не чіпаючи інших, `el.classList.remove(\"is-done\")` — прибирає. Повторний `add` того самого класу нічого не дублює. `el.className = \"...\"` перезаписав би всі класи — так легко загубити базовий.",
    example: `const tab = document.querySelector(".tab");
tab.classList.add("is-active");
tab.classList.remove("is-active");
tab.classList.contains("tab"); // true`,
    missionStory: "Виконані дошки-завдання мосту фарбують у зелений готовим CSS-класом `is-done`.",
    worldEvent: "Виконані дошки мосту пофарбовано.",
    taskType: "write-function",
    prompt: "Напиши функцію `syncCard(card, done)`: якщо `done` — додає картці клас `is-done`, інакше прибирає його. Базовий клас `task-card` має лишатися.",
    criteria: "правильний вигляд для обох станів; інші класи не губляться, повторний виклик не створює зайвих змін.",
    functionName: "syncCard",
    fileName: "cards.js",
    html: `<li class="task-card" data-id="1">Повторити функції</li>`,
    starterCode: `function syncCard(card, done) {

}`,
    testCases: [
      { name: "done = true → task-card is-done", check(ctx) { const card = ctx.$(".task-card"); ctx.fn(card, true); return { pass: card.className === "task-card is-done", actual: ctx.show(card.className), expected: "\"task-card is-done\"" }; } },
      { name: "Двічі true — клас не дублюється", check(ctx) { const card = ctx.$(".task-card"); ctx.fn(card, true); ctx.fn(card, true); return { pass: card.classList.length === 2 && card.classList.contains("is-done"), actual: ctx.show(card.className), expected: "\"task-card is-done\"" }; } },
      { name: "done = false → лише task-card", check(ctx) { const card = ctx.$(".task-card"); ctx.fn(card, true); ctx.fn(card, false); return { pass: card.className === "task-card", actual: ctx.show(card.className), expected: "\"task-card\"" }; } },
    ],
    codeChecks: [{ re: /classList\.add\(/, label: "`classList.add`" }, { re: /classList\.remove\(/, label: "`classList.remove`" }, { re: /className\s*=/, not: true, label: "Без перезапису `className`" }],
    solution: `function syncCard(card, done) {
  if (done) {
    card.classList.add("is-done");
  } else {
    card.classList.remove("is-done");
  }
}`,
    hint: "`if (done)` — додай клас, інакше прибери.",
    difficulty: 1,
  }),
  jsqLevel(7, {
    id: 59,
    title: "classList.toggle — перемикання",
    concept: "`el.classList.toggle(\"is-open\")` **перемикає** клас: був — прибирає, не було — додає. З другим аргументом `toggle(\"is-done\", умова)` він **встановлює** стан за умовою: `true` — клас буде, `false` — не буде. Різниця важлива: «зроби протилежне» проти «зроби відповідно до даних». Повторний рендер з другим аргументом не перевертає стан випадково.",
    example: `menu.classList.toggle("is-open");         // перемкнути
item.classList.toggle("is-hidden", isEmpty); // встановити за умовою`,
    missionStory: "На мосту є відкидна панель з інструментами, а дошки мають фарбуватися точно за записом у журналі.",
    worldEvent: "Відкидна панель мосту слухається.",
    taskType: "write-function",
    prompt: "Напиши дві функції. `togglePanel()` перемикає клас `is-open` у `#panel`. `syncCard(card, task)` синхронізує клас `is-done` картки з `task.done` через `toggle` з другим аргументом.",
    criteria: "два перемикання повертають панель у початковий стан; повторна синхронізація не перевертає стан картки.",
    exports: ["togglePanel", "syncCard"],
    fileName: "toggle.js",
    html: `<div id="panel">Інструменти</div>
<li class="task-card" data-id="1">Повторити функції</li>`,
    starterCode: `function togglePanel() {

}

function syncCard(card, task) {

}`,
    testCases: [
      { name: "Панель: один клік — відкрита, два — закрита", check(ctx) { const p = ctx.$("#panel"); ctx.get("togglePanel")(); const once = p.classList.contains("is-open"); ctx.get("togglePanel")(); const twice = p.classList.contains("is-open"); return { pass: once && !twice, actual: "після 1: " + once + ", після 2: " + twice, expected: "після 1: true, після 2: false" }; } },
      { name: "Картка: done двічі → клас лишається", check(ctx) { const c = ctx.$(".task-card"); ctx.get("syncCard")(c, { done: true }); ctx.get("syncCard")(c, { done: true }); return { pass: c.classList.contains("is-done") && c.classList.contains("task-card"), actual: ctx.show(c.className), expected: "\"task-card is-done\"" }; } },
      { name: "Картка: done false → класу немає", check(ctx) { const c = ctx.$(".task-card"); ctx.get("syncCard")(c, { done: true }); ctx.get("syncCard")(c, { done: false }); return { pass: c.className === "task-card", actual: ctx.show(c.className), expected: "\"task-card\"" }; } },
    ],
    codeChecks: [{ re: /toggle\(\s*"is-done"\s*,/, label: "`toggle(\"is-done\", умова)` з другим аргументом" }],
    solution: `function togglePanel() {
  document.querySelector("#panel").classList.toggle("is-open");
}

function syncCard(card, task) {
  card.classList.toggle("is-done", task.done);
}`,
    hint: "Для картки — один рядок: `card.classList.toggle(\"is-done\", task.done);`.",
    difficulty: 1,
  }),
  jsqLevel(7, {
    id: 60,
    title: "getAttribute / setAttribute — атрибути",
    concept: "`el.getAttribute(\"title\")` читає атрибут як **рядок** або `null`, якщо його немає. `el.setAttribute(\"data-id\", \"7\")` задає значення. **Булевий** атрибут `disabled` працює за **наявністю**: навіть `disabled=\"false\"` вимикає кнопку! Щоб увімкнути кнопку, атрибут прибирають: `removeAttribute(\"disabled\")`.",
    example: `const link = document.querySelector("a");
link.getAttribute("href");          // "/home"
link.setAttribute("target", "_blank");
button.removeAttribute("disabled"); // увімкнути`,
    missionStory: "Кнопка «Зберегти» на мосту не натискається, хоча в розмітці написано `disabled=\"false\"`. Майстер не розуміє, у чому річ.",
    worldEvent: "Кнопка «Зберегти» знову натискається.",
    taskType: "write-function",
    prompt: "Прочитай атрибут `title` кнопки `#save-btn` у `buttonTitle`, а неіснуючий атрибут `data-role` — у `missingAttr`. Признач першій картці `data-id` зі значенням `\"7\"`. Напиши функцію `setButtonEnabled(button, enabled)`: `true` — кнопка вмикається, `false` — вимикається.",
    criteria: "ти не плутаєш рядковий атрибут із логічним прапорцем і правильно відновлюєш кнопку.",
    exports: ["buttonTitle", "missingAttr", "setButtonEnabled"],
    fileName: "attrs.js",
    html: `<button id="save-btn" title="Зберегти завдання" disabled="false">Зберегти</button>
<ul id="task-list"><li class="task-card">Повторити функції</li></ul>`,
    starterCode: `const saveButton = document.querySelector("#save-btn");
const firstCard = document.querySelector(".task-card");
`,
    testCases: [
      { name: "Читання атрибутів", check: jsqVars({ buttonTitle: "Зберегти завдання", missingAttr: null }) },
      { name: "data-id картки — \"7\"", check(ctx) { const v = ctx.$(".task-card").getAttribute("data-id"); return { pass: v === "7", actual: ctx.show(v), expected: "\"7\"" }; } },
      { name: "Увімкнення прибирає disabled", check(ctx) { const b = ctx.$("#save-btn"); const before = b.disabled; ctx.get("setButtonEnabled")(b, true); return { pass: before === true && !b.hasAttribute("disabled") && b.disabled === false, actual: "до: " + before + ", після: " + b.disabled, expected: "до: true, після: false" }; } },
      { name: "Вимкнення", check(ctx) { const b = ctx.$("#save-btn"); ctx.get("setButtonEnabled")(b, true); ctx.get("setButtonEnabled")(b, false); return { pass: b.disabled === true, actual: ctx.show(b.disabled), expected: "true" }; } },
    ],
    codeChecks: [{ re: /removeAttribute\(\s*"disabled"\s*\)/, label: "Увімкнення через `removeAttribute(\"disabled\")`" }],
    solution: `const saveButton = document.querySelector("#save-btn");
const firstCard = document.querySelector(".task-card");

const buttonTitle = saveButton.getAttribute("title");
const missingAttr = saveButton.getAttribute("data-role");
firstCard.setAttribute("data-id", "7");

function setButtonEnabled(button, enabled) {
  if (enabled) {
    button.removeAttribute("disabled");
  } else {
    button.setAttribute("disabled", "");
  }
}`,
    hint: "`setAttribute(\"disabled\", \"false\")` кнопку не ввімкне — атрибут досі є. Його треба прибрати.",
    difficulty: 2,
  }),
  jsqLevel(7, {
    id: 61,
    title: "Практика — кнопка змінює текст і колір",
    concept: "Інтерфейс відображає **стан**: є дані (`task.done`), і з них виводяться текст кнопки та клас картки. Після кожної дії спершу змінюємо дані, а потім приводимо вигляд у відповідність до них. Готовий `addEventListener` у заготовці викликає твій код при кожному кліку — сам механізм розберемо на рівні 62.",
    example: `const lamp = { on: false };
button.addEventListener("click", () => {
  lamp.on = !lamp.on;
  button.textContent = lamp.on ? "Вимкнути" : "Увімкнути";
  bulb.classList.toggle("is-on", lamp.on);
});`,
    missionStory: "Перша жива дошка мосту: натискаєш «Виконано» — і дошка зеленіє, а напис змінюється на «Скасувати».",
    worldEvent: "Перша жива дошка мосту відповідає на дотик.",
    taskType: "write-function",
    prompt: "У тілі готового обробника кліку перемикай `task.done`, напис кнопки (`\"Скасувати\"`, коли виконано, і `\"Виконано\"`, коли ні) та клас `is-done` картки.",
    criteria: "після кількох кліків дані, текст і клас узгоджені; парна кількість кліків повертає початковий стан.",
    exports: ["task"],
    fileName: "tracker.js",
    html: `<li class="task-card" data-id="1">
  <span class="task-title">Повторити функції</span>
  <button class="done-btn" type="button">Виконано</button>
</li>`,
    starterCode: `const task = { id: 1, title: "Повторити функції", done: false };
const card = document.querySelector(".task-card");
const button = document.querySelector(".done-btn");

button.addEventListener("click", () => {
  // перемкни task.done, напис кнопки й клас картки
});`,
    testCases: [
      { name: "Один клік → виконано", check(ctx) { ctx.fire(ctx.$(".done-btn"), "click"); const t = ctx.get("task"); const b = ctx.$(".done-btn").textContent, c = ctx.$(".task-card").classList.contains("is-done"); return { pass: t.done === true && b === "Скасувати" && c, actual: ctx.show([t.done, b, c]), expected: "[true, \"Скасувати\", true]" }; } },
      { name: "Два кліки → початковий стан", check(ctx) { const btn = ctx.$(".done-btn"); ctx.fire(btn, "click"); ctx.fire(btn, "click"); const t = ctx.get("task"); const b = btn.textContent, c = ctx.$(".task-card").classList.contains("is-done"); return { pass: t.done === false && b === "Виконано" && !c, actual: ctx.show([t.done, b, c]), expected: "[false, \"Виконано\", false]" }; } },
      { name: "Три кліки → знову виконано", check(ctx) { const btn = ctx.$(".done-btn"); ctx.fire(btn, "click"); ctx.fire(btn, "click"); ctx.fire(btn, "click"); const t = ctx.get("task"); return { pass: t.done === true && btn.textContent === "Скасувати", actual: ctx.show([t.done, btn.textContent]), expected: "[true, \"Скасувати\"]" }; } },
    ],
    solution: `const task = { id: 1, title: "Повторити функції", done: false };
const card = document.querySelector(".task-card");
const button = document.querySelector(".done-btn");

button.addEventListener("click", () => {
  task.done = !task.done;
  button.textContent = task.done ? "Скасувати" : "Виконано";
  card.classList.toggle("is-done", task.done);
});`,
    hint: "Спершу дані: `task.done = !task.done;`. Потім вигляд — з `task.done`: тернарний оператор для тексту й `toggle` з другим аргументом для класу.",
    difficulty: 2,
  }),

  /* ───────────── Арка VIII — Події → Міст DOM ───────────── */
  jsqLevel(8, {
    id: 62,
    title: "addEventListener — клік",
    concept: "`element.addEventListener(\"click\", handler)` підписує функцію-**обробник** на подію. Передається **сама функція**, а викличе її браузер — під час кліку. Якщо написати `addEventListener(\"click\", handler())`, функція виконається одразу при завантаженні, а підписано буде її результат. Підписку роблять один раз, не всередині самого обробника.",
    example: `const bell = document.querySelector("#bell");
function ring() {
  console.log("Дзінь!");
}
bell.addEventListener("click", ring); // без дужок!`,
    missionStory: "Майстер просить лічильник кроків мостом: кожен клік — ще один крок.",
    worldEvent: "Лічильник кроків мосту працює.",
    taskType: "write-function",
    prompt: "Самостійно підпиши кнопку `#count-btn` на клік. Кожен клік збільшує лічильник `clicks` на 1 і оновлює текст `#click-count`: `Кліків: N`.",
    criteria: "при завантаженні нічого не змінюється, а кожен клік збільшує лічильник рівно на один.",
    fileName: "counter.js",
    html: `<button id="count-btn" type="button">Крок мостом</button>
<p id="click-count">Кліків: 0</p>`,
    starterCode: `let clicks = 0;
const button = document.querySelector("#count-btn");
const output = document.querySelector("#click-count");
`,
    testCases: [
      { name: "Після завантаження — 0", check(ctx) { const t = jsqText(ctx, "#click-count"); return { pass: t === "Кліків: 0", actual: ctx.show(t), expected: "\"Кліків: 0\"" }; } },
      { name: "Один клік → 1", check(ctx) { ctx.fire(ctx.$("#count-btn"), "click"); const t = jsqText(ctx, "#click-count"); return { pass: t === "Кліків: 1", actual: ctx.show(t), expected: "\"Кліків: 1\"" }; } },
      { name: "Три кліки → 3", check(ctx) { const b = ctx.$("#count-btn"); ctx.fire(b, "click"); ctx.fire(b, "click"); ctx.fire(b, "click"); const t = jsqText(ctx, "#click-count"); return { pass: t === "Кліків: 3", actual: ctx.show(t), expected: "\"Кліків: 3\"" }; } },
    ],
    codeChecks: [{ re: /addEventListener\(\s*"click"/, label: "Підписка `addEventListener(\"click\", ...)`" }],
    solution: `let clicks = 0;
const button = document.querySelector("#count-btn");
const output = document.querySelector("#click-count");

button.addEventListener("click", () => {
  clicks = clicks + 1;
  output.textContent = \`Кліків: \${clicks}\`;
});`,
    hint: "Другий аргумент — стрілкова функція з двома рядками: збільшити `clicks` і оновити текст.",
    difficulty: 1,
  }),
  jsqLevel(8, {
    id: 63,
    title: "Подія input — живий текст",
    concept: "Подія `input` спрацьовує при **кожній** зміні поля: набір, вставлення, видалення символів. Поточний вміст — `input.value`, і це **завжди рядок** (навіть у полі для чисел). Тут використовуємо збережене посилання на поле; `event.target` — на рівні 65.",
    example: `const search = document.querySelector("#search");
search.addEventListener("input", () => {
  console.log(search.value.length);
});`,
    missionStory: "Поки мандрівник пише назву нового завдання, табличка на мосту одразу показує, як вона виглядатиме.",
    worldEvent: "Табличка мосту показує назву ще до збереження.",
    taskType: "write-function",
    prompt: "Підпиши поле `#task-title` на подію `input`. Показуй у `#preview` поточну назву, а коли поле порожнє — `Назва ще порожня`. У `#char-count` пиши `Символів: N`.",
    criteria: "працюють набір, вставлення й видалення тексту; порожнє поле має зрозумілий стан.",
    fileName: "preview.js",
    html: `<input id="task-title" placeholder="Назва завдання">
<p id="preview">Назва ще порожня</p>
<p id="char-count">Символів: 0</p>`,
    starterCode: `const titleInput = document.querySelector("#task-title");
const preview = document.querySelector("#preview");
const charCount = document.querySelector("#char-count");
`,
    testCases: [
      { name: "Набрано «Масиви»", check(ctx) { const i = ctx.$("#task-title"); i.value = "Масиви"; ctx.fire(i, "input"); const p = jsqText(ctx, "#preview"), c = jsqText(ctx, "#char-count"); return { pass: p === "Масиви" && c === "Символів: 6", actual: ctx.show([p, c]), expected: "[\"Масиви\", \"Символів: 6\"]" }; } },
      { name: "Текст стерто → порожній стан", check(ctx) { const i = ctx.$("#task-title"); i.value = "DOM"; ctx.fire(i, "input"); i.value = ""; ctx.fire(i, "input"); const p = jsqText(ctx, "#preview"), c = jsqText(ctx, "#char-count"); return { pass: p === "Назва ще порожня" && c === "Символів: 0", actual: ctx.show([p, c]), expected: "[\"Назва ще порожня\", \"Символів: 0\"]" }; } },
    ],
    codeChecks: [{ re: /addEventListener\(\s*"input"/, label: "Підписка на подію `input`" }],
    solution: `const titleInput = document.querySelector("#task-title");
const preview = document.querySelector("#preview");
const charCount = document.querySelector("#char-count");

titleInput.addEventListener("input", () => {
  const title = titleInput.value;
  preview.textContent = title || "Назва ще порожня";
  charCount.textContent = \`Символів: \${title.length}\`;
});`,
    hint: "Запасний текст для порожнього рядка дає `||` (рівень 10): `title || \"Назва ще порожня\"`.",
    difficulty: 1,
  }),
  jsqLevel(8, {
    id: 64,
    title: "Подія submit — дія всієї форми",
    concept: "Форму слухають через подію `submit` **на самій формі**, а не клік по кнопці: так однаково спрацює і кнопка, і Enter у полі. Стандартна дія відправлення — перезавантажити сторінку. У заготовці її скасовує `event.preventDefault()` (детально — на рівні 66). Дані читаються **в момент відправлення**.",
    example: `const form = document.querySelector("#login");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log(form.querySelector("input").value);
});`,
    missionStory: "Біля мосту стоїть скринька для нових завдань. Кидаєш записку — і на табличці з'являється підтвердження.",
    worldEvent: "Скринька нових завдань приймає записки.",
    taskType: "write-function",
    prompt: "У готовому обробнику відправлення форми прочитай назву (`#task-title`) і тривалість (`#task-minutes`) та покажи в `#summary`: `Додано: Масиви (30 хв)`.",
    criteria: "дані читаються в момент відправлення, а кнопка й Enter дають однакову поведінку.",
    fileName: "form.js",
    html: `<form id="task-form">
  <input id="task-title" placeholder="Назва">
  <input id="task-minutes" type="number" placeholder="Хвилини">
  <button type="submit">Додати</button>
</form>
<p id="summary">Ще нічого не додано</p>`,
    starterCode: `const form = document.querySelector("#task-form");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // скасовує перезавантаження сторінки — детально на рівні 66
  // прочитай назву й тривалість і покажи підсумок у #summary
});`,
    testCases: [
      { name: "Відправлення показує підсумок", check(ctx) { ctx.$("#task-title").value = "Масиви"; ctx.$("#task-minutes").value = "30"; ctx.fire(ctx.$("#task-form"), "submit"); const s = jsqText(ctx, "#summary"); return { pass: s === "Додано: Масиви (30 хв)", actual: ctx.show(s), expected: "\"Додано: Масиви (30 хв)\"" }; } },
      { name: "Сторінка не перезавантажується", check(ctx) { ctx.$("#task-title").value = "Масиви"; ctx.$("#task-minutes").value = "30"; const e = ctx.fire(ctx.$("#task-form"), "submit"); return { pass: e.defaultPrevented, actual: e.defaultPrevented ? "стандартну дію скасовано" : "форма перезавантажила б сторінку", expected: "event.preventDefault() у обробнику" }; } },
      { name: "Дані читаються в момент відправлення", check(ctx) { const f = ctx.$("#task-form"); ctx.$("#task-title").value = "Масиви"; ctx.$("#task-minutes").value = "30"; ctx.fire(f, "submit"); ctx.$("#task-title").value = "DOM"; ctx.$("#task-minutes").value = "45"; ctx.fire(f, "submit"); const s = jsqText(ctx, "#summary"); return { pass: s === "Додано: DOM (45 хв)", actual: ctx.show(s), expected: "\"Додано: DOM (45 хв)\"" }; } },
    ],
    solution: `const form = document.querySelector("#task-form");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // скасовує перезавантаження сторінки — детально на рівні 66
  const title = document.querySelector("#task-title").value;
  const minutes = document.querySelector("#task-minutes").value;
  document.querySelector("#summary").textContent = \`Додано: \${title} (\${minutes} хв)\`;
});`,
    hint: "Читай `.value` обох полів усередині обробника, а не над ним — інакше збережеш порожні значення з моменту завантаження.",
    difficulty: 1,
  }),
  jsqLevel(8, {
    id: 65,
    title: "event.target — походження події",
    concept: "Обробник отримує об'єкт події `event`. `event.target` — елемент, **де подія виникла**, наприклад `<span>` з іконкою всередині кнопки. `event.currentTarget` — елемент, **на якому висить обробник**, тобто сама кнопка. Тож клік по кнопці не завжди «походить» з кнопки. Для поля введення `event.target.value` — його поточний текст.",
    example: `list.addEventListener("click", (event) => {
  console.log(event.target.tagName);        // хто отримав клік
  console.log(event.currentTarget.tagName); // хто слухає
});`,
    missionStory: "На кнопці мосту є іконка «+». Майстер помітив: іноді клік «приходить» від іконки, а не від кнопки. Розберися, хто є хто.",
    worldEvent: "Майстер розібрався, звідки приходять кліки.",
    taskType: "write-function",
    prompt: "1) Підпиши `#task-title` на `input` і показуй текст у `#preview`, читаючи його через `event.target.value`. 2) Підпиши `#add-btn` на `click` і показуй у `#click-info` назви тегів через скісну риску, наприклад `SPAN / BUTTON`: спершу `event.target.tagName`, потім `event.currentTarget.tagName`.",
    criteria: "ти пояснюєш різницю між `target` і `currentTarget` і не припускаєш, що клік завжди походить із самої кнопки.",
    fileName: "target.js",
    html: `<input id="task-title" placeholder="Назва">
<p id="preview"></p>
<button id="add-btn" type="button"><span class="icon">+</span> Додати</button>
<p id="click-info"></p>`,
    starterCode: `// Підпиши поле й кнопку на події
`,
    testCases: [
      { name: "Прев'ю через event.target.value", check(ctx) { const i = ctx.$("#task-title"); i.value = "Події"; ctx.fire(i, "input"); const p = jsqText(ctx, "#preview"); return { pass: p === "Події", actual: ctx.show(p), expected: "\"Події\"" }; } },
      { name: "Клік по іконці: SPAN / BUTTON", check(ctx) { ctx.fire(ctx.$("#add-btn .icon"), "click"); const t = jsqText(ctx, "#click-info"); return { pass: t === "SPAN / BUTTON", actual: ctx.show(t), expected: "\"SPAN / BUTTON\"" }; } },
      { name: "Клік по самій кнопці: BUTTON / BUTTON", check(ctx) { ctx.fire(ctx.$("#add-btn"), "click"); const t = jsqText(ctx, "#click-info"); return { pass: t === "BUTTON / BUTTON", actual: ctx.show(t), expected: "\"BUTTON / BUTTON\"" }; } },
    ],
    codeChecks: [{ re: /\.target\.value/, label: "Текст через `event.target.value`" }, { re: /currentTarget/, label: "Використано `currentTarget`" }],
    solution: `document.querySelector("#task-title").addEventListener("input", (event) => {
  document.querySelector("#preview").textContent = event.target.value;
});

document.querySelector("#add-btn").addEventListener("click", (event) => {
  document.querySelector("#click-info").textContent = \`\${event.target.tagName} / \${event.currentTarget.tagName}\`;
});`,
    hint: "Назва тегу — властивість `tagName` (великими літерами: `\"SPAN\"`, `\"BUTTON\"`).",
    difficulty: 2,
  }),
  jsqLevel(8, {
    id: 66,
    title: "preventDefault() — стандартна дія",
    concept: "У багатьох подій є **стандартна дія** браузера: відправлення форми перезавантажує сторінку, клік по посиланню веде на іншу адресу. Твій обробник — окрема річ: він виконується **на додачу**. `event.preventDefault()` скасовує саме стандартну дію; поширення події (спливання) він не зупиняє.",
    example: `link.addEventListener("click", (event) => {
  event.preventDefault(); // не переходити за посиланням
  console.log("Показуємо підказку замість переходу");
});`,
    missionStory: "Скринька нових завдань щоразу перезапускає весь міст — записка губиться. Пора приборкати її самостійно.",
    worldEvent: "Скринька більше не перезапускає міст.",
    taskType: "write-function",
    prompt: "Самостійно напиши обробник відправлення форми `#task-form`: скасуй стандартну дію й покажи в `#summary` `Додано: <назва>`.",
    criteria: "сторінка не перезавантажується, логіка виконується; ти пояснюєш, яку саме дію скасовано.",
    fileName: "form.js",
    html: `<form id="task-form">
  <input id="task-title" placeholder="Назва">
  <button type="submit">Додати</button>
</form>
<p id="summary">Ще нічого не додано</p>`,
    starterCode: `const form = document.querySelector("#task-form");
`,
    testCases: [
      { name: "Стандартну дію скасовано", check(ctx) { ctx.$("#task-title").value = "Масиви"; const e = ctx.fire(ctx.$("#task-form"), "submit"); return { pass: e.defaultPrevented === true, actual: e.defaultPrevented ? "скасовано" : "не скасовано", expected: "скасовано" }; } },
      { name: "Підсумок показано", check(ctx) { ctx.$("#task-title").value = "Масиви"; ctx.fire(ctx.$("#task-form"), "submit"); const s = jsqText(ctx, "#summary"); return { pass: s === "Додано: Масиви", actual: ctx.show(s), expected: "\"Додано: Масиви\"" }; } },
    ],
    codeChecks: [{ re: /preventDefault\(\)/, label: "Викликано `preventDefault()`" }, { re: /addEventListener\(\s*"submit"/, label: "Підписка на `submit`" }],
    solution: `const form = document.querySelector("#task-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = document.querySelector("#task-title").value;
  document.querySelector("#summary").textContent = \`Додано: \${title}\`;
});`,
    hint: "Обробник отримує `event` першим параметром. Перший рядок у ньому — `event.preventDefault();`.",
    difficulty: 1,
  }),
  jsqLevel(8, {
    id: 67,
    title: "Делегування — один обробник для списку",
    concept: "Події **спливають**: клік по кнопці всередині списку доходить і до самого списку. Тому можна повісити **один** обробник на контейнер. `event.target.closest(\".done-btn\")` знаходить найближчу кнопку вгору від місця кліку (навіть якщо клікнули по іконці всередині) або `null`, якщо клік був повз кнопки. Атрибут `data-id` читається як `button.dataset.id` — рядок.",
    example: `menu.addEventListener("click", (event) => {
  const item = event.target.closest(".menu-item");
  if (!item) return;          // клік повз пункти
  console.log(item.dataset.page);
});`,
    missionStory: "На мосту три дошки-завдання, кожна зі своєю кнопкою «Виконано». Майстер не хоче ставити окремого вартового біля кожної — вистачить одного на весь міст.",
    worldEvent: "Один вартовий доглядає весь міст.",
    taskType: "write-function",
    prompt: "Повісь **один** обробник кліку на `#task-list`. Знайди натиснуту кнопку `.done-btn` через `closest`, візьми її `data-id`, знайди відповідний запис у масиві `tasks` за `id`, познач `done = true` і додай картці клас `is-done`. Клік повз кнопки нічого не має ламати.",
    criteria: "текст і іконка всередині кнопки однаково клікабельні; клік по порожньому місцю безпечний; дані й вигляд узгоджені.",
    exports: ["tasks"],
    fileName: "list.js",
    html: `<ul id="task-list">
  <li class="task-card" data-id="1"><span class="task-title">Функції</span> <button class="done-btn" data-id="1"><span class="icon">✓</span> Виконано</button></li>
  <li class="task-card" data-id="2"><span class="task-title">Масиви</span> <button class="done-btn" data-id="2"><span class="icon">✓</span> Виконано</button></li>
  <li class="task-card" data-id="3"><span class="task-title">Об'єкти</span> <button class="done-btn" data-id="3"><span class="icon">✓</span> Виконано</button></li>
</ul>`,
    starterCode: `const tasks = [
  { id: 1, title: "Функції", done: false },
  { id: 2, title: "Масиви", done: false },
  { id: 3, title: "Об'єкти", done: false },
];
const list = document.querySelector("#task-list");
`,
    testCases: [
      { name: "Клік по іконці другої кнопки", check(ctx) { ctx.fire(ctx.$('.done-btn[data-id="2"] .icon'), "click"); const t = ctx.get("tasks"); const card = ctx.$('.task-card[data-id="2"]'); return { pass: t[1].done === true && t[0].done === false && card.classList.contains("is-done"), actual: "done " + ctx.show(t.map((x) => x.done)) + ", клас " + card.classList.contains("is-done"), expected: "done [false, true, false], клас true" }; } },
      { name: "Клік по самій третій кнопці", check(ctx) { ctx.fire(ctx.$('.done-btn[data-id="3"]'), "click"); const t = ctx.get("tasks"); return { pass: t[2].done === true && ctx.$('.task-card[data-id="3"]').classList.contains("is-done"), actual: ctx.show(t.map((x) => x.done)), expected: "[false, false, true]" }; } },
      { name: "Клік повз кнопки нічого не змінює", check(ctx) { ctx.fire(ctx.$("#task-list"), "click"); ctx.fire(ctx.$(".task-title"), "click"); const t = ctx.get("tasks"); return { pass: t.every((x) => !x.done) && ctx.$$(".is-done").length === 0, actual: ctx.show(t.map((x) => x.done)), expected: "[false, false, false]" }; } },
    ],
    codeChecks: [{ re: /closest\(/, label: "Пошук кнопки через `closest`" }, { re: /dataset\.id/, label: "id з `dataset.id`" }],
    solution: `const tasks = [
  { id: 1, title: "Функції", done: false },
  { id: 2, title: "Масиви", done: false },
  { id: 3, title: "Об'єкти", done: false },
];
const list = document.querySelector("#task-list");

list.addEventListener("click", (event) => {
  const button = event.target.closest(".done-btn");
  if (!button) return;
  const id = Number(button.dataset.id);
  const task = tasks.find((item) => item.id === id);
  task.done = true;
  button.closest(".task-card").classList.add("is-done");
});`,
    hint: "`dataset.id` — рядок, а `id` у масиві — число (пастка з рівня 46). Перетвори через `Number`.",
    difficulty: 2,
  }),
  jsqLevel(8, {
    id: 68,
    title: "Практика — форма без перезавантаження",
    concept: "Повний цикл форми: **відправлення** → читання полів → перетворення тривалості на **число** → новий об'єкт у масиві даних → оновлення підсумку → очищення полів. Для `id` тримаємо окремий лічильник `nextId`, який збільшується після кожного запису. Список на екрані з'явиться на рівні 72, валідація — на 74–75.",
    example: `let nextId = 1;
const notes = [];
function addNote(text) {
  notes.push({ id: nextId, text });
  nextId = nextId + 1;
}`,
    missionStory: "Скринька біля мосту тепер не просто показує записку — вона вписує завдання в журнал.",
    worldEvent: "Скринька вписує завдання в журнал.",
    taskType: "write-function",
    prompt: "Під час відправлення `#task-form` (без перезавантаження) додай у масив `tasks` об'єкт `{ id, title, minutes, done: false }`, де `minutes` — число, а `id` береться з лічильника `nextId`. Покажи назву в `#last-added`, кількість у `#summary` (`Завдань: N`) і очисти обидва поля.",
    criteria: "кнопка й Enter працюють однаково, хвилини — числові, одна відправка додає рівно один запис.",
    exports: ["tasks"],
    fileName: "tracker.js",
    html: `<form id="task-form">
  <input id="task-title" placeholder="Назва">
  <input id="task-minutes" type="number" placeholder="Хвилини">
  <button type="submit">Додати</button>
</form>
<p>Останнє: <span id="last-added">—</span></p>
<p id="summary">Завдань: 0</p>`,
    starterCode: `const tasks = [];
let nextId = 1;

const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const minutesInput = document.querySelector("#task-minutes");
`,
    testCases: [
      { name: "Одна відправка → один запис", check(ctx) { ctx.$("#task-title").value = "Масиви"; ctx.$("#task-minutes").value = "30"; ctx.fire(ctx.$("#task-form"), "submit"); const t = ctx.get("tasks"); const exp = [{ id: 1, title: "Масиви", minutes: 30, done: false }]; return { pass: ctx.equal(t, exp), actual: ctx.show(t), expected: ctx.show(exp) }; } },
      { name: "Дві відправки → id 1 і 2, підсумок", check(ctx) { const f = ctx.$("#task-form"); ctx.$("#task-title").value = "Масиви"; ctx.$("#task-minutes").value = "30"; ctx.fire(f, "submit"); ctx.$("#task-title").value = "DOM"; ctx.$("#task-minutes").value = "45"; ctx.fire(f, "submit"); const t = ctx.get("tasks"); const ok = t.length === 2 && t[1].id === 2 && t[1].minutes === 45 && jsqText(ctx, "#summary") === "Завдань: 2" && jsqText(ctx, "#last-added") === "DOM"; return { pass: ok, actual: ctx.show(t) + "; " + jsqText(ctx, "#summary") + "; " + jsqText(ctx, "#last-added"), expected: "два записи, «Завдань: 2», останнє «DOM»" }; } },
      { name: "Поля очищено, сторінка не перезавантажується", check(ctx) { ctx.$("#task-title").value = "Масиви"; ctx.$("#task-minutes").value = "30"; const e = ctx.fire(ctx.$("#task-form"), "submit"); const ok = e.defaultPrevented && ctx.$("#task-title").value === "" && ctx.$("#task-minutes").value === ""; return { pass: ok, actual: ctx.show([e.defaultPrevented, ctx.$("#task-title").value, ctx.$("#task-minutes").value]), expected: "[true, \"\", \"\"]" }; } },
    ],
    codeChecks: [{ re: /Number\(/, label: "Тривалість перетворено на число" }],
    solution: `const tasks = [];
let nextId = 1;

const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const minutesInput = document.querySelector("#task-minutes");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const task = {
    id: nextId,
    title: titleInput.value,
    minutes: Number(minutesInput.value),
    done: false,
  };
  tasks.push(task);
  nextId = nextId + 1;

  document.querySelector("#last-added").textContent = task.title;
  document.querySelector("#summary").textContent = \`Завдань: \${tasks.length}\`;
  titleInput.value = "";
  minutesInput.value = "";
});`,
    hint: "Порядок: `preventDefault` → створити об'єкт → `push` → збільшити `nextId` → оновити тексти → очистити поля.",
    difficulty: 2,
  }),

  /* ───────────── Арка IX — DOM, динамічний контент → Міст DOM ───────────── */
  jsqLevel(9, {
    id: 69,
    title: "createElement — картка в пам'яті",
    concept: "`document.createElement(\"li\")` створює новий елемент **у пам'яті** — на сторінці його ще немає. Перед вставленням його наповнюють: `textContent`, `classList.add`, `dataset.id = 3` (атрибут `data-id`). Назву, яку ввів користувач, пишемо через `textContent`, тож кутові дужки лишаться текстом.",
    example: `const badge = document.createElement("span");
badge.textContent = "Новинка";
badge.classList.add("badge");
badge.dataset.code = "N1";  // data-code="N1"`,
    missionStory: "Майстер вирізає нові дошки в майстерні, перш ніж нести їх на міст.",
    worldEvent: "У майстерні мосту лежить перша нова дошка.",
    taskType: "write-function",
    prompt: "Напиши `createTaskElement(task)`, яка створює `li` з класом `task-card`, атрибутом `data-id` з `task.id` і текстом `task.title` (через `textContent`) і **повертає** цей вузол, не вставляючи його на сторінку.",
    criteria: "правильні дані й тип результату; кутові дужки в назві лишаються текстом.",
    functionName: "createTaskElement",
    fileName: "cards.js",
    html: `<ul id="task-list"></ul>`,
    starterCode: `function createTaskElement(task) {

}`,
    testCases: [
      { name: "Елемент li з класом і data-id", check(ctx) { const li = ctx.fn({ id: 3, title: "Масиви", minutes: 30, done: false }); const ok = li && li.tagName === "LI" && li.classList.contains("task-card") && li.getAttribute("data-id") === "3" && li.textContent === "Масиви"; return { pass: !!ok, actual: ctx.show(li), expected: "<li class=\"task-card\" data-id=\"3\">Масиви</li>" }; } },
      { name: "Кутові дужки лишаються текстом", check(ctx) { const li = ctx.fn({ id: 4, title: "<b>DOM</b>", minutes: 20, done: false }); const ok = li && li.children.length === 0 && li.textContent === "<b>DOM</b>"; return { pass: !!ok, actual: li ? (li.children.length ? "з'явився елемент <b>" : ctx.show(li.textContent)) : "нічого не повернуто", expected: "текст «<b>DOM</b>»" }; } },
      { name: "На сторінку не вставлено", check(ctx) { ctx.fn({ id: 5, title: "Події", minutes: 20, done: false }); const n = ctx.$$("#task-list li").length; return { pass: n === 0, actual: n + " у списку", expected: "0 у списку" }; } },
    ],
    codeChecks: [{ re: /createElement\(\s*"li"\s*\)/, label: "`createElement(\"li\")`" }],
    solution: `function createTaskElement(task) {
  const card = document.createElement("li");
  card.classList.add("task-card");
  card.dataset.id = task.id;
  card.textContent = task.title;
  return card;
}`,
    hint: "Не забудь `return card;` — інакше функція поверне `undefined`.",
    difficulty: 1,
  }),
  jsqLevel(9, {
    id: 70,
    title: "appendChild — вставлення у сторінку",
    concept: "`parent.appendChild(child)` вставляє вузол у кінець батьківського елемента. Так будують вкладену структуру: кнопки вставляють у картку, а картку — у список. Один вузол може бути лише в одному місці: повторний `appendChild` того самого вузла **переміщує** його, а не копіює. Для двох карток створюють два окремі вузли.",
    example: `const row = document.createElement("li");
const btn = document.createElement("button");
btn.textContent = "Видалити";
row.appendChild(btn);
document.querySelector("ul").appendChild(row);`,
    missionStory: "Нові дошки несуть на міст і прикручують до них дві ручки: «Виконано» і «Видалити».",
    worldEvent: "Нові дошки прикручено до мосту.",
    taskType: "write-function",
    prompt: "Функція `createTaskElement` уже є. Напиши `renderOne(task)`: створи картку через неї, додай у картку дві кнопки — `.done-btn` з текстом `Виконано` і `.delete-btn` з текстом `Видалити` (обидві з `data-id` завдання), встав картку в `#task-list` і поверни її.",
    criteria: "картка стоїть у списку, кнопки — всередині неї; для двох завдань створюються два окремі вузли.",
    functionName: "renderOne",
    fileName: "cards.js",
    html: `<ul id="task-list"></ul>`,
    starterCode: `function createTaskElement(task) {
  const card = document.createElement("li");
  card.classList.add("task-card");
  card.dataset.id = task.id;
  const title = document.createElement("span");
  title.classList.add("task-title");
  title.textContent = task.title;
  card.appendChild(title);
  return card;
}

function renderOne(task) {

}`,
    testCases: [
      { name: "Картка з двома кнопками в списку", check(ctx) { ctx.fn({ id: 1, title: "Масиви" }); const card = ctx.$('#task-list .task-card[data-id="1"]'); const d = card && card.querySelector(".done-btn"), x = card && card.querySelector(".delete-btn"); const ok = d && x && d.textContent === "Виконано" && x.textContent === "Видалити" && d.dataset.id === "1" && x.dataset.id === "1"; return { pass: !!ok, actual: card ? ctx.show(card.outerHTML) : "картки немає", expected: "картка з кнопками «Виконано» і «Видалити», data-id=\"1\"" }; } },
      { name: "Два завдання → дві окремі картки", check(ctx) { const a = ctx.fn({ id: 1, title: "Масиви" }); const b = ctx.fn({ id: 2, title: "DOM" }); const cards = ctx.$$("#task-list .task-card"); return { pass: cards.length === 2 && a !== b && cards[1].querySelectorAll("button").length === 2, actual: cards.length + " картки", expected: "2 картки по 2 кнопки" }; } },
    ],
    codeChecks: [{ re: /appendChild\(/, label: "Використано `appendChild`" }],
    solution: `function createTaskElement(task) {
  const card = document.createElement("li");
  card.classList.add("task-card");
  card.dataset.id = task.id;
  const title = document.createElement("span");
  title.classList.add("task-title");
  title.textContent = task.title;
  card.appendChild(title);
  return card;
}

function renderOne(task) {
  const card = createTaskElement(task);

  const doneButton = document.createElement("button");
  doneButton.classList.add("done-btn");
  doneButton.dataset.id = task.id;
  doneButton.textContent = "Виконано";

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-btn");
  deleteButton.dataset.id = task.id;
  deleteButton.textContent = "Видалити";

  card.appendChild(doneButton);
  card.appendChild(deleteButton);
  document.querySelector("#task-list").appendChild(card);
  return card;
}`,
    hint: "Створи дві кнопки так само, як картку в `createTaskElement`, і встав їх через `card.appendChild(...)`.",
    difficulty: 2,
  }),
  jsqLevel(9, {
    id: 71,
    title: "remove() — картка та дані",
    concept: "`element.remove()` прибирає вузол зі сторінки, але **масив даних не змінює** — його треба оновити окремо. Інакше екран і дані розійдуться: картки вже немає, а запис лишився й повернеться після наступного рендера. Порядок дій: знайти картку (`closest`), прибрати запис із масиву за `id`, видалити вузол.",
    example: `const index = items.findIndex((item) => item.id === id);
items.splice(index, 1); // прибрали з даних
row.remove();           // прибрали з екрана`,
    missionStory: "Деякі дошки-завдання вже не потрібні. Їх знімають із мосту — і викреслюють із журналу, щоб не з'явилися знову.",
    worldEvent: "Зайві дошки знято з мосту й викреслено з журналу.",
    taskType: "write-function",
    prompt: "Повісь обробник кліку на `#task-list`. Для кнопки `.delete-btn` знайди її картку через `closest`, прибери запис із масиву `tasks` за `id`, видали картку й онови `#summary`: `Завдань: N` (N — довжина масиву).",
    criteria: "зникає саме вибраний запис, кількість у даних відповідає екрану, можна видалити й останнє завдання.",
    fileName: "list.js",
    html: `<p id="summary">Завдань: 3</p>
<ul id="task-list">
  <li class="task-card" data-id="1">Функції <button class="delete-btn" data-id="1">Видалити</button></li>
  <li class="task-card" data-id="2">Масиви <button class="delete-btn" data-id="2">Видалити</button></li>
  <li class="task-card" data-id="3">Об'єкти <button class="delete-btn" data-id="3">Видалити</button></li>
</ul>`,
    starterCode: `let tasks = [
  { id: 1, title: "Функції", done: false },
  { id: 2, title: "Масиви", done: false },
  { id: 3, title: "Об'єкти", done: false },
];
const list = document.querySelector("#task-list");
`,
    testCases: [
      { name: "Видалити середнє завдання", check(ctx) { ctx.fire(ctx.$('.delete-btn[data-id="2"]'), "click"); const ids = ctx.$$(".task-card").map((c) => c.dataset.id); const s = jsqText(ctx, "#summary"); return { pass: ctx.equal(ids, ["1", "3"]) && s === "Завдань: 2", actual: ctx.show(ids) + ", " + ctx.show(s), expected: "[\"1\", \"3\"], \"Завдань: 2\"" }; } },
      { name: "Видалити всі по черзі", check(ctx) { ["1", "2", "3"].forEach((id) => ctx.fire(ctx.$('.delete-btn[data-id="' + id + '"]'), "click")); const n = ctx.$$(".task-card").length; const s = jsqText(ctx, "#summary"); return { pass: n === 0 && s === "Завдань: 0", actual: n + " карток, " + ctx.show(s), expected: "0 карток, \"Завдань: 0\"" }; } },
      { name: "Клік повз кнопку нічого не ламає", check(ctx) { ctx.fire(ctx.$("#task-list"), "click"); const n = ctx.$$(".task-card").length; return { pass: n === 3, actual: n + " карток", expected: "3 картки" }; } },
    ],
    codeChecks: [{ re: /\.remove\(\)/, label: "Картку прибрано через `remove()`" }],
    solution: `let tasks = [
  { id: 1, title: "Функції", done: false },
  { id: 2, title: "Масиви", done: false },
  { id: 3, title: "Об'єкти", done: false },
];
const list = document.querySelector("#task-list");

list.addEventListener("click", (event) => {
  const button = event.target.closest(".delete-btn");
  if (!button) return;
  const id = Number(button.dataset.id);
  tasks = tasks.filter((task) => task.id !== id);
  button.closest(".task-card").remove();
  document.querySelector("#summary").textContent = \`Завдань: \${tasks.length}\`;
});`,
    hint: "Прибрати запис зручно через `filter`: залиш усі завдання, у яких `id` не дорівнює видаленому.",
    difficulty: 2,
  }),
  jsqLevel(9, {
    id: 72,
    title: "Генерація списку циклом — рендер із даних",
    concept: "Головне правило динамічного інтерфейсу: **джерело правди — масив**, а список на екрані лише його відображає. Функція рендера щоразу **очищує** контейнер і будує картки заново з поточних даних. Тоді після будь-якої зміни (додали, виконали, видалили) достатньо викликати рендер — і дублікатів не буде.",
    example: `function renderNames(names) {
  const list = document.querySelector("#names");
  list.textContent = "";        // очищуємо
  for (let i = 0; i < names.length; i++) { // будуємо заново
    const li = document.createElement("li");
    li.textContent = names[i];
    list.appendChild(li);
  }
}`,
    missionStory: "Майстер більше не прикручує дошки по одній: міст сам перебудовується за записами журналу.",
    worldEvent: "Міст перебудовується за журналом.",
    taskType: "write-function",
    prompt: "Напиши `renderTasks(tasks)`: очисти `#task-list`, циклом створи картку для кожного завдання (готовою `createTaskElement`) і встав її. У `#summary` запиши `Завдань: N, хвилин: M` (сума хвилин — через `reduce`).",
    criteria: "повторний рендер не дублює картки, порожній список працює, підсумок узгоджений з даними.",
    functionName: "renderTasks",
    fileName: "render.js",
    html: `<p id="summary"></p>
<ul id="task-list"></ul>`,
    starterCode: `function createTaskElement(task) {
  const card = document.createElement("li");
  card.classList.add("task-card");
  card.dataset.id = task.id;
  card.textContent = task.title;
  card.classList.toggle("is-done", task.done);
  return card;
}

function renderTasks(tasks) {

}`,
    testCases: [
      { name: "Два завдання, повторний рендер без дублів", check(ctx) { const tasks = [{ id: 1, title: "Масиви", minutes: 30, done: false }, { id: 2, title: "DOM", minutes: 45, done: true }]; ctx.fn(tasks); ctx.fn(tasks); const titles = ctx.$$("#task-list .task-card").map((c) => c.textContent); const s = jsqText(ctx, "#summary"); return { pass: ctx.equal(titles, ["Масиви", "DOM"]) && s === "Завдань: 2, хвилин: 75", actual: ctx.show(titles) + ", " + ctx.show(s), expected: "[\"Масиви\", \"DOM\"], \"Завдань: 2, хвилин: 75\"" }; } },
      { name: "Порожній список", check(ctx) { ctx.fn([{ id: 1, title: "Масиви", minutes: 30, done: false }]); ctx.fn([]); const n = ctx.$$("#task-list .task-card").length; const s = jsqText(ctx, "#summary"); return { pass: n === 0 && s === "Завдань: 0, хвилин: 0", actual: n + " карток, " + ctx.show(s), expected: "0 карток, \"Завдань: 0, хвилин: 0\"" }; } },
    ],
    codeChecks: [{ re: /\.reduce\(/, label: "Сума хвилин через `reduce`" }],
    solution: `function createTaskElement(task) {
  const card = document.createElement("li");
  card.classList.add("task-card");
  card.dataset.id = task.id;
  card.textContent = task.title;
  card.classList.toggle("is-done", task.done);
  return card;
}

function renderTasks(tasks) {
  const list = document.querySelector("#task-list");
  list.textContent = "";
  for (let i = 0; i < tasks.length; i++) {
    list.appendChild(createTaskElement(tasks[i]));
  }
  const minutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  document.querySelector("#summary").textContent = \`Завдань: \${tasks.length}, хвилин: \${minutes}\`;
}`,
    hint: "Перший рядок рендера — очищення: `list.textContent = \"\";`. Без нього кожен виклик додаватиме картки ще раз.",
    difficulty: 2,
  }),
  jsqLevel(9, {
    id: 73,
    title: "Генерація через map — дані в DOM-вузли",
    concept: "`map` може повертати не лише числа чи рядки, а й **DOM-вузли**: `tasks.map(createTaskElement)` дає масив готових карток. Вставити весь масив за раз допомагає `list.append(...cards)`: spread розгортає масив в окремі аргументи. Два етапи: створити масив вузлів → вставити його елементи.",
    example: `const items = ["a", "b"].map((text) => {
  const li = document.createElement("li");
  li.textContent = text;
  return li;
});
list.append(...items);`,
    missionStory: "Майстер навчився вирізати всі дошки одним рухом і класти їх на міст разом.",
    worldEvent: "Дошки мосту кладуть одним рухом.",
    taskType: "fix-code",
    prompt: "Перепиши лише побудову карток у `renderTasks`: замість циклу — `map` і вставлення через `append(...масив)`. Поведінка має лишитися тією самою.",
    criteria: "поведінка збігається з версією на циклі; ти пояснюєш два етапи: створити масив вузлів і вставити його.",
    functionName: "renderTasks",
    fileName: "render.js",
    html: `<p id="summary"></p>
<ul id="task-list"></ul>`,
    starterCode: `function createTaskElement(task) {
  const card = document.createElement("li");
  card.classList.add("task-card");
  card.dataset.id = task.id;
  card.textContent = task.title;
  card.classList.toggle("is-done", task.done);
  return card;
}

function renderTasks(tasks) {
  const list = document.querySelector("#task-list");
  list.textContent = "";
  for (let i = 0; i < tasks.length; i++) {
    list.appendChild(createTaskElement(tasks[i]));
  }
  const minutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  document.querySelector("#summary").textContent = \`Завдань: \${tasks.length}, хвилин: \${minutes}\`;
}`,
    testCases: [
      { name: "Та сама поведінка", check(ctx) { const tasks = [{ id: 1, title: "Масиви", minutes: 30, done: false }, { id: 2, title: "DOM", minutes: 45, done: true }]; ctx.fn(tasks); ctx.fn(tasks); const titles = ctx.$$("#task-list .task-card").map((c) => c.textContent); return { pass: ctx.equal(titles, ["Масиви", "DOM"]) && jsqText(ctx, "#summary") === "Завдань: 2, хвилин: 75", actual: ctx.show(titles), expected: "[\"Масиви\", \"DOM\"]" }; } },
      { name: "Порожній список", check(ctx) { ctx.fn([]); return { pass: ctx.$$("#task-list .task-card").length === 0, actual: ctx.$$("#task-list .task-card").length + " карток", expected: "0 карток" }; } },
    ],
    codeChecks: [{ re: /\.map\(/, label: "Картки створено через `map`" }, { re: /\.append\(\s*\.\.\./, label: "Вставлено через `append(...)`" }, { re: /for\s*\(/, not: true, label: "Без циклу `for`" }],
    solution: `function createTaskElement(task) {
  const card = document.createElement("li");
  card.classList.add("task-card");
  card.dataset.id = task.id;
  card.textContent = task.title;
  card.classList.toggle("is-done", task.done);
  return card;
}

function renderTasks(tasks) {
  const list = document.querySelector("#task-list");
  list.textContent = "";
  const cards = tasks.map(createTaskElement);
  list.append(...cards);
  const minutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  document.querySelector("#summary").textContent = \`Завдань: \${tasks.length}, хвилин: \${minutes}\`;
}`,
    hint: "Два рядки замість циклу: `const cards = tasks.map(createTaskElement);` і `list.append(...cards);`.",
    difficulty: 2,
  }),
  jsqLevel(9, {
    id: 74,
    title: "Валідація одного поля — назва",
    concept: "Перевірку роблять **до** зміни даних: якщо дані неприйнятні, показуємо повідомлення й виходимо через `return`, нічого не додаючи. `value.trim()` прибирає пробіли на краях, тож рядок з самих пробілів стає порожнім. Помилкова відправка не стирає введене: людина має змогу виправити. Після успіху повідомлення про помилку прибираємо.",
    example: `const name = nameInput.value.trim();
if (!name) {
  error.textContent = "Вкажи ім'я";
  return;
}
error.textContent = "";`,
    missionStory: "У скриньку біля мосту кидають порожні записки й записки з самих пробілів. Їх треба відсіювати.",
    worldEvent: "Порожні записки більше не потрапляють у журнал.",
    taskType: "write-function",
    prompt: "Допиши обробник форми: назва з `#task-title` без пробілів на краях. Якщо вона порожня — показати в `#title-error` `Введи назву завдання` і нічого не додавати (поле не очищувати). Інакше прибрати текст помилки й додати `{ id, title, done: false }` у `tasks`.",
    criteria: "перевірено порожній рядок, пробіли й звичайний текст; помилкова відправка не змінює масив і не стирає введене.",
    exports: ["tasks"],
    fileName: "validate.js",
    html: `<form id="task-form">
  <input id="task-title" placeholder="Назва">
  <p id="title-error" class="error"></p>
  <button type="submit">Додати</button>
</form>`,
    starterCode: `const tasks = [];
let nextId = 1;
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const titleError = document.querySelector("#title-error");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  // перевір назву, покажи помилку або додай завдання
});`,
    testCases: [
      { name: "Порожня назва → помилка, нічого не додано", check(ctx) { ctx.$("#task-title").value = ""; ctx.fire(ctx.$("#task-form"), "submit"); const e = jsqText(ctx, "#title-error"); const n = ctx.get("tasks").length; return { pass: e === "Введи назву завдання" && n === 0, actual: ctx.show(e) + ", записів " + n, expected: "\"Введи назву завдання\", записів 0" }; } },
      { name: "Самі пробіли → помилка, введене не стерто", check(ctx) { ctx.$("#task-title").value = "   "; ctx.fire(ctx.$("#task-form"), "submit"); const e = jsqText(ctx, "#title-error"); const v = ctx.$("#task-title").value; return { pass: e === "Введи назву завдання" && v === "   " && ctx.get("tasks").length === 0, actual: ctx.show([e, v]), expected: "[\"Введи назву завдання\", \"   \"]" }; } },
      { name: "Виправлено → додано, помилку прибрано", check(ctx) { const f = ctx.$("#task-form"); ctx.$("#task-title").value = ""; ctx.fire(f, "submit"); ctx.$("#task-title").value = "  Масиви "; ctx.fire(f, "submit"); const t = ctx.get("tasks"); const e = jsqText(ctx, "#title-error"); return { pass: t.length === 1 && t[0].title === "Масиви" && e === "", actual: ctx.show(t) + ", помилка " + ctx.show(e), expected: "[{ id: 1, title: \"Масиви\", done: false }], помилка \"\"" }; } },
      { name: "Два завдання → id 1 і 2, сторінка не перезавантажується", check(ctx) { const f = ctx.$("#task-form"); ctx.$("#task-title").value = "Масиви"; ctx.fire(f, "submit"); ctx.$("#task-title").value = "DOM"; const e = ctx.fire(f, "submit"); const t = ctx.get("tasks"); const exp = [{ id: 1, title: "Масиви", done: false }, { id: 2, title: "DOM", done: false }]; return { pass: ctx.equal(t, exp) && e.defaultPrevented, actual: ctx.show(t) + (e.defaultPrevented ? "" : ", без preventDefault"), expected: ctx.show(exp) }; } },
    ],
    codeChecks: [{ re: /\.trim\(\)/, label: "Пробіли прибрано через `trim()`" }],
    solution: `const tasks = [];
let nextId = 1;
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const titleError = document.querySelector("#title-error");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) {
    titleError.textContent = "Введи назву завдання";
    return;
  }
  titleError.textContent = "";
  tasks.push({ id: nextId, title, done: false });
  nextId = nextId + 1;
});`,
    hint: "Порожній рядок — falsy, тому перевірка коротка: `if (!title) { ...; return; }`.",
    difficulty: 2,
  }),
  jsqLevel(9, {
    id: 75,
    title: "Валідація кількох полів — назва й час",
    concept: "Коли полів кілька, **усі** перевірки роблять до додавання, і показують усі помилки одразу. Тривалість: спершу перевір, що поле не порожнє, бо `Number(\"\")` дає `0`, і порожнє поле «прослизне» як нуль. Потім `Number.isFinite(n)` — що це скінченне число, а не `NaN` чи нескінченність. І лише потім межі.",
    example: `const raw = ageInput.value.trim();
const age = Number(raw);
if (raw === "") ageError.textContent = "Вкажи вік";
else if (!Number.isFinite(age) || age < 1) ageError.textContent = "Некоректний вік";`,
    missionStory: "Скринька біля мосту приймає лише повноцінні записки: з назвою й розумною тривалістю — від хвилини до трьох годин.",
    worldEvent: "Відбудовано міст через прірву!",
    taskType: "write-function",
    prompt: "Обробник форми перевіряє два поля. Назва обов'язкова: інакше в `#title-error` `Введи назву завдання`. Тривалість обов'язкова: порожнє поле → `Вкажи тривалість` у `#minutes-error`; поза межами 1–180 (або не скінченне число) → `Тривалість — від 1 до 180 хв`. Завдання `{ id, title, minutes, done: false }` додається лише коли обидва поля правильні; тоді помилки очищуються.",
    criteria: "перевірено порожню назву, назву з пробілів, порожню тривалість, -5, 0, 1, 180 і 181; некоректна форма не змінює список; повідомлення конкретні.",
    exports: ["tasks"],
    fileName: "validate.js",
    html: `<form id="task-form">
  <input id="task-title" placeholder="Назва">
  <p id="title-error" class="error"></p>
  <input id="task-minutes" type="number" placeholder="Хвилини">
  <p id="minutes-error" class="error"></p>
  <button type="submit">Додати</button>
</form>`,
    starterCode: `const tasks = [];
let nextId = 1;
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const minutesInput = document.querySelector("#task-minutes");
const titleError = document.querySelector("#title-error");
const minutesError = document.querySelector("#minutes-error");
`,
    testCases: [
      { name: "Обидва поля порожні → дві помилки", check(ctx) { ctx.fire(ctx.$("#task-form"), "submit"); const a = jsqText(ctx, "#title-error"), b = jsqText(ctx, "#minutes-error"); return { pass: a === "Введи назву завдання" && b === "Вкажи тривалість" && ctx.get("tasks").length === 0, actual: ctx.show([a, b]), expected: "[\"Введи назву завдання\", \"Вкажи тривалість\"]" }; } },
      { name: "Назва з самих пробілів → помилка", check(ctx) { ctx.$("#task-title").value = "   "; ctx.$("#task-minutes").value = "30"; ctx.fire(ctx.$("#task-form"), "submit"); const a = jsqText(ctx, "#title-error"), b = jsqText(ctx, "#minutes-error"); return { pass: a === "Введи назву завдання" && b === "" && ctx.get("tasks").length === 0, actual: ctx.show([a, b]) + ", записів " + ctx.get("tasks").length, expected: "[\"Введи назву завдання\", \"\"], записів 0" }; } },
      {
        name: "Некоректна форма не змінює вже заповнений список",
        check(ctx) {
          const f = ctx.$("#task-form");
          ctx.$("#task-title").value = "Масиви"; ctx.$("#task-minutes").value = "30"; ctx.fire(f, "submit");
          const bad = [["", "30"], ["   ", "30"], ["DOM", ""], ["DOM", "-5"], ["DOM", "0"], ["DOM", "181"]];
          bad.forEach(([t, m]) => { ctx.$("#task-title").value = t; ctx.$("#task-minutes").value = m; ctx.fire(f, "submit"); });
          const tasks = ctx.get("tasks");
          const exp = [{ id: 1, title: "Масиви", minutes: 30, done: false }];
          return { pass: ctx.equal(tasks, exp), actual: ctx.show(tasks), expected: ctx.show(exp) };
        },
      },
      {
        name: "0, 181 і -5 — поза межами",
        check(ctx) {
          const f = ctx.$("#task-form");
          const results = ["0", "181", "-5"].map((v) => { ctx.$("#task-title").value = "Масиви"; ctx.$("#task-minutes").value = v; ctx.fire(f, "submit"); return jsqText(ctx, "#minutes-error"); });
          const ok = results.every((r) => r === "Тривалість — від 1 до 180 хв") && ctx.get("tasks").length === 0;
          return { pass: ok, actual: ctx.show(results) + ", записів " + ctx.get("tasks").length, expected: "три повідомлення про межі, записів 0" };
        },
      },
      {
        name: "Межі 1 і 180 приймаються, помилки зникають",
        check(ctx) {
          const f = ctx.$("#task-form");
          ctx.$("#task-title").value = ""; ctx.$("#task-minutes").value = ""; ctx.fire(f, "submit");
          ctx.$("#task-title").value = "Масиви"; ctx.$("#task-minutes").value = "1"; ctx.fire(f, "submit");
          ctx.$("#task-title").value = "DOM"; ctx.$("#task-minutes").value = "180"; const e = ctx.fire(f, "submit");
          const t = ctx.get("tasks");
          const ok = t.length === 2 && t[0].minutes === 1 && t[1].minutes === 180 && t[1].id === 2 && jsqText(ctx, "#title-error") === "" && jsqText(ctx, "#minutes-error") === "" && e.defaultPrevented;
          return { pass: ok, actual: ctx.show(t) + (e.defaultPrevented ? "" : ", без preventDefault"), expected: "два записи з minutes 1 і 180, помилки порожні, сторінка не перезавантажується" };
        },
      },
    ],
    codeChecks: [{ re: /Number\.isFinite\(/, label: "Число перевірено через `Number.isFinite`" }],
    solution: `const tasks = [];
let nextId = 1;
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const minutesInput = document.querySelector("#task-minutes");
const titleError = document.querySelector("#title-error");
const minutesError = document.querySelector("#minutes-error");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const rawMinutes = minutesInput.value.trim();
  const minutes = Number(rawMinutes);

  titleError.textContent = title ? "" : "Введи назву завдання";
  if (rawMinutes === "") {
    minutesError.textContent = "Вкажи тривалість";
  } else if (!Number.isFinite(minutes) || minutes < 1 || minutes > 180) {
    minutesError.textContent = "Тривалість — від 1 до 180 хв";
  } else {
    minutesError.textContent = "";
  }

  if (titleError.textContent || minutesError.textContent) return;

  tasks.push({ id: nextId, title, minutes, done: false });
  nextId = nextId + 1;
});`,
    hint: "Перевір порожнє поле **до** `Number()`: `rawMinutes === \"\"`. Додавай лише тоді, коли обидва повідомлення порожні.",
    difficulty: 3,
  }),

  /* ───────────── Арка X — Збереження даних → Скарбниця пам'яті ───────────── */
  jsqLevel(10, {
    id: 76,
    title: "localStorage.setItem / getItem — простий текст",
    concept: "`localStorage` зберігає дані в браузері для конкретного сайту — вони переживають перезавантаження сторінки. `setItem(\"ключ\", значення)` записує, `getItem(\"ключ\")` читає. Важливо: зберігається й читається **рядок** (число `45` повернеться як `\"45\"`), а для відсутнього ключа `getItem` повертає `null`.",
    example: `localStorage.setItem("city", "Львів");
localStorage.getItem("city");   // "Львів"
localStorage.getItem("absent"); // null
localStorage.setItem("year", 2026);
localStorage.getItem("year");   // "2026" — рядок!`,
    missionStory: "Скарбниця пам'яті впізнає мандрівника на ім'я, навіть якщо той пішов і повернувся.",
    worldEvent: "Скарбниця пам'ятає ім'я мандрівника.",
    taskType: "write-function",
    prompt: "Напиши чотири функції. `saveName(name)` зберігає ім'я під ключем `\"userName\"`. `getGreeting()` повертає `Привіт, <ім'я>!` або, якщо імені немає, `Привіт, мандрівнику!`. `saveDailyGoal(minutes)` зберігає ціль під ключем `\"dailyGoal\"`. `getDailyGoal()` повертає її **числом**, а без запису — `30`.",
    criteria: "ім'я відновлюється, для відсутнього запису є запасний стан, а ціль після читання — число.",
    exports: ["saveName", "getGreeting", "saveDailyGoal", "getDailyGoal"],
    fileName: "memory.js",
    starterCode: `function saveName(name) {

}

function getGreeting() {

}

function saveDailyGoal(minutes) {

}

function getDailyGoal() {

}`,
    testCases: [
      { name: "Без запису — запасне привітання", check(ctx) { const g = ctx.get("getGreeting")(); return { pass: g === "Привіт, мандрівнику!", actual: ctx.show(g), expected: "\"Привіт, мандрівнику!\"" }; } },
      { name: "Збережене ім'я з попереднього візиту", storage: { userName: "Оля" }, check(ctx) { const g = ctx.get("getGreeting")(); return { pass: g === "Привіт, Оля!", actual: ctx.show(g), expected: "\"Привіт, Оля!\"" }; } },
      { name: "saveName → getGreeting", check(ctx) { ctx.get("saveName")("Макс"); const g = ctx.get("getGreeting")(); return { pass: g === "Привіт, Макс!" && ctx.storage.getItem("userName") === "Макс", actual: ctx.show(g), expected: "\"Привіт, Макс!\"" }; } },
      { name: "Ціль — число; без запису — 30", check(ctx) { const before = ctx.get("getDailyGoal")(); ctx.get("saveDailyGoal")(45); const after = ctx.get("getDailyGoal")(); return { pass: before === 30 && after === 45, actual: ctx.show(before) + " → " + ctx.show(after) + " (" + typeof after + ")", expected: "30 → 45 (number)" }; } },
    ],
    codeChecks: [{ re: /setItem\(/, label: "`setItem`" }, { re: /getItem\(/, label: "`getItem`" }],
    solution: `function saveName(name) {
  localStorage.setItem("userName", name);
}

function getGreeting() {
  const name = localStorage.getItem("userName");
  return name ? \`Привіт, \${name}!\` : "Привіт, мандрівнику!";
}

function saveDailyGoal(minutes) {
  localStorage.setItem("dailyGoal", minutes);
}

function getDailyGoal() {
  const saved = localStorage.getItem("dailyGoal");
  return saved === null ? 30 : Number(saved);
}`,
    hint: "`getItem` повертає рядок або `null`. Для цілі: якщо `null` — 30, інакше `Number(saved)`.",
    difficulty: 1,
  }),
  jsqLevel(10, {
    id: 77,
    title: "localStorage.removeItem — точкове скидання",
    concept: "`localStorage.removeItem(\"ключ\")` видаляє **один** запис; після цього `getItem` для нього поверне `null`. Видалення відсутнього ключа помилки не дає. `localStorage.clear()` стер би **все** — і чужі налаштування теж, тому для точкового скидання його не використовують.",
    example: `localStorage.removeItem("draft");
localStorage.getItem("draft"); // null`,
    missionStory: "Мандрівник хоче, щоб скарбниця забула його ім'я, але пам'ятала обрану тему оформлення.",
    worldEvent: "Скарбниця вміє забувати вибірково.",
    taskType: "write-function",
    prompt: "Кнопка `#reset-btn` має видаляти лише ключ `\"userName\"` і одразу оновлювати привітання в `#greeting` (готова функція `renderGreeting`). Інші ключі не чіпай.",
    criteria: "повторне скидання не ламає сторінку, видаляється лише потрібний запис, без `clear()`.",
    fileName: "memory.js",
    html: `<p id="greeting"></p>
<button id="reset-btn" type="button">Забути ім'я</button>`,
    starterCode: `function getGreeting() {
  const name = localStorage.getItem("userName");
  return name ? \`Привіт, \${name}!\` : "Привіт, мандрівнику!";
}

function renderGreeting() {
  document.querySelector("#greeting").textContent = getGreeting();
}

renderGreeting();
`,
    testCases: [
      { name: "Скидання імені", storage: { userName: "Оля", theme: "dark" }, check(ctx) { const before = jsqText(ctx, "#greeting"); ctx.fire(ctx.$("#reset-btn"), "click"); const after = jsqText(ctx, "#greeting"); return { pass: before === "Привіт, Оля!" && after === "Привіт, мандрівнику!" && ctx.storage.getItem("userName") === null, actual: ctx.show([before, after]), expected: "[\"Привіт, Оля!\", \"Привіт, мандрівнику!\"]" }; } },
      { name: "Інший ключ збережено", storage: { userName: "Оля", theme: "dark" }, check(ctx) { ctx.fire(ctx.$("#reset-btn"), "click"); const theme = ctx.storage.getItem("theme"); return { pass: theme === "dark", actual: ctx.show(theme), expected: "\"dark\"" }; } },
      { name: "Повторне скидання не ламає сторінку", storage: { userName: "Оля" }, check(ctx) { const b = ctx.$("#reset-btn"); ctx.fire(b, "click"); ctx.fire(b, "click"); const g = jsqText(ctx, "#greeting"); return { pass: g === "Привіт, мандрівнику!", actual: ctx.show(g), expected: "\"Привіт, мандрівнику!\"" }; } },
    ],
    codeChecks: [{ re: /removeItem\(\s*"userName"\s*\)/, label: "`removeItem(\"userName\")`" }, { re: /\.clear\(\)/, not: true, label: "Без `clear()`" }],
    solution: `function getGreeting() {
  const name = localStorage.getItem("userName");
  return name ? \`Привіт, \${name}!\` : "Привіт, мандрівнику!";
}

function renderGreeting() {
  document.querySelector("#greeting").textContent = getGreeting();
}

renderGreeting();

document.querySelector("#reset-btn").addEventListener("click", () => {
  localStorage.removeItem("userName");
  renderGreeting();
});`,
    hint: "Обробник кліку з двох рядків: `removeItem` і `renderGreeting()`.",
    difficulty: 1,
  }),
  jsqLevel(10, {
    id: 78,
    title: "JSON.stringify / JSON.parse — структура в рядку",
    concept: "`localStorage` зберігає лише рядки, тож масив чи об'єкт спершу перетворюють на текст: `JSON.stringify(data)` — це **серіалізація**. `JSON.parse(text)` відновлює структуру з типами: числа лишаються числами, `true`/`false` — boolean. Але JSON не зберігає методи й деякі значення (`undefined`, функції), а некоректний текст змушує `JSON.parse` кинути `SyntaxError`.",
    example: `const text = JSON.stringify({ city: "Львів", visits: 2 });
// '{"city":"Львів","visits":2}'
const back = JSON.parse(text);
back.visits + 1; // 3 — число`,
    missionStory: "Скарбниця записує цілі сувої-масиви. Писар має згорнути сувій у рядок і розгорнути назад без втрат.",
    worldEvent: "Сувої журналу згортаються й розгортаються без втрат.",
    taskType: "write-function",
    prompt: "Напиши `serializeTasks(tasks)`, що повертає JSON-рядок, і `restoreTasks(text)`, що повертає відновлений масив.",
    criteria: "структура й значення відновлені, `minutes` — число, `done` — boolean; ти знаєш, що некоректний JSON спричиняє помилку.",
    exports: ["serializeTasks", "restoreTasks"],
    fileName: "json.js",
    starterCode: `function serializeTasks(tasks) {

}

function restoreTasks(text) {

}`,
    testCases: [
      { name: "Серіалізація повертає рядок", check(ctx) { const s = ctx.get("serializeTasks")([{ id: 1, title: "Масиви", minutes: 30, done: false }]); return { pass: typeof s === "string" && s.includes("\"minutes\":30"), actual: ctx.show(s), expected: "рядок JSON" }; } },
      { name: "Туди й назад — ті самі дані й типи", check(ctx) { const src = [{ id: 1, title: "Масиви", minutes: 30, done: false }, { id: 2, title: "DOM", minutes: 45, done: true }]; const back = ctx.get("restoreTasks")(ctx.get("serializeTasks")(src)); const ok = ctx.equal(back, src) && typeof back[0].minutes === "number" && typeof back[1].done === "boolean"; return { pass: ok, actual: ctx.show(back), expected: ctx.show(src) }; } },
      { name: "Некоректний JSON → SyntaxError", check(ctx) { let name = "помилки немає"; try { ctx.get("restoreTasks")("{oops"); } catch (e) { name = e.name; } return { pass: name === "SyntaxError", actual: name, expected: "SyntaxError" }; } },
    ],
    codeChecks: [{ re: /JSON\.stringify\(/, label: "`JSON.stringify`" }, { re: /JSON\.parse\(/, label: "`JSON.parse`" }],
    solution: `function serializeTasks(tasks) {
  return JSON.stringify(tasks);
}

function restoreTasks(text) {
  return JSON.parse(text);
}`,
    hint: "Кожна функція — один рядок з `return`.",
    difficulty: 1,
  }),
  jsqLevel(10, {
    id: 79,
    title: "Практика — список після перезавантаження",
    concept: "Трекер, що пам'ятає дані, працює за двома схемами. **Запуск:** прочитати сховище → відновити масив → показати. **Зміна:** оновити масив → **зберегти** → показати. Зберігати треба після **кожної** зміни: додавання, виконання, видалення. І ніколи не записувати порожній стан поверх збереженого до того, як дані завантажено.",
    example: `function saveNotes() {
  localStorage.setItem("notes", JSON.stringify(notes));
}
function addNote(text) {
  notes.push(text);
  saveNotes();   // зберегли
  render();      // показали
}`,
    missionStory: "Хранитель Скарбниці доручає зробити журнал, що не забуває жодного запису, навіть коли сувій згорнули й розгорнули знову.",
    worldEvent: "Відкрито скарбницю, що пам'ятає все!",
    taskType: "write-function",
    prompt: "Читання з захистом від пошкодженого JSON і відновлення лічильника `id` уже готові. Напиши `saveTasks()`, що зберігає масив `tasks` під ключем `\"tasks\"`. Виклич її після кожної зміни в `addTask`, `toggleTask` і `deleteTask`.",
    criteria: "усі зміни переживають перезавантаження; перший запуск і порожній список працюють; нові `id` не повторюються.",
    exports: ["addTask", "toggleTask", "deleteTask"],
    fileName: "tracker.js",
    html: `<p id="summary"></p>
<ul id="task-list"></ul>`,
    starterCode: `const STORAGE_KEY = "tasks";

// Готово: безпечне читання (власний try/catch напишеш на рівні 91)
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

const tasks = loadTasks();
// Готово: після перезавантаження нові id продовжують нумерацію
let nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;

function saveTasks() {

}

function renderTasks() {
  const list = document.querySelector("#task-list");
  list.textContent = "";
  tasks.forEach((task) => {
    const card = document.createElement("li");
    card.classList.add("task-card");
    card.classList.toggle("is-done", task.done);
    card.dataset.id = task.id;
    card.textContent = task.title;
    list.appendChild(card);
  });
  document.querySelector("#summary").textContent = \`Завдань: \${tasks.length}\`;
}

function addTask(title, minutes) {
  tasks.push({ id: nextId, title, minutes, done: false });
  nextId = nextId + 1;
  renderTasks();
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  task.done = !task.done;
  renderTasks();
}

function deleteTask(id) {
  const index = tasks.findIndex((item) => item.id === id);
  tasks.splice(index, 1);
  renderTasks();
}

renderTasks();`,
    testCases: [
      { name: "Перший запуск — порожній список", check(ctx) { return { pass: ctx.$$(".task-card").length === 0 && jsqText(ctx, "#summary") === "Завдань: 0", actual: jsqText(ctx, "#summary"), expected: "Завдань: 0" }; } },
      {
        name: "Додавання, виконання й видалення переживають перезавантаження",
        check(ctx) {
          ctx.get("addTask")("Масиви", 30);
          ctx.get("addTask")("DOM", 45);
          ctx.get("addTask")("Події", 20);
          ctx.get("toggleTask")(1);
          ctx.get("deleteTask")(2);
          ctx.reload();
          const cards = ctx.$$(".task-card").map((c) => c.textContent + (c.classList.contains("is-done") ? " ✓" : ""));
          return { pass: ctx.equal(cards, ["Масиви ✓", "Події"]), actual: ctx.show(cards), expected: "[\"Масиви ✓\", \"Події\"]" };
        },
      },
      {
        name: "Після перезавантаження id не повторюються",
        check(ctx) {
          ctx.get("addTask")("Масиви", 30);
          ctx.get("addTask")("DOM", 45);
          ctx.reload();
          ctx.get("addTask")("Події", 20);
          const ids = ctx.$$(".task-card").map((c) => c.dataset.id);
          return { pass: ctx.equal(ids, ["1", "2", "3"]), actual: ctx.show(ids), expected: "[\"1\", \"2\", \"3\"]" };
        },
      },
      {
        name: "Кожна дія одразу видна на сторінці й одразу збережена",
        check(ctx) {
          const cards = () => ctx.$$(".task-card").map((c) => c.textContent + (c.classList.contains("is-done") ? " ✓" : ""));
          ctx.get("addTask")("Масиви", 30);
          ctx.get("addTask")("DOM", 45);
          ctx.reload();
          ctx.get("toggleTask")(1);
          const toggled = cards();
          ctx.reload();
          const toggledSaved = cards();
          ctx.get("deleteTask")(2);
          const deleted = cards();
          ctx.reload();
          const deletedSaved = cards();
          const got = [toggled, toggledSaved, deleted, deletedSaved];
          const exp = [["Масиви ✓", "DOM"], ["Масиви ✓", "DOM"], ["Масиви ✓"], ["Масиви ✓"]];
          return { pass: ctx.equal(got, exp), actual: ctx.show(got), expected: ctx.show(exp) };
        },
      },
      { name: "Збережені дані не затираються під час запуску", storage: { tasks: "[{\"id\":5,\"title\":\"Старе\",\"minutes\":30,\"done\":false}]" }, check(ctx) { const cards = ctx.$$(".task-card").map((c) => c.textContent); const raw = ctx.storage.getItem("tasks"); return { pass: ctx.equal(cards, ["Старе"]) && raw.includes("Старе"), actual: ctx.show(cards), expected: "[\"Старе\"]" }; } },
    ],
    codeChecks: [{ re: /JSON\.stringify\(\s*tasks\s*\)/, label: "Масив збережено через `JSON.stringify`" }],
    solution: `const STORAGE_KEY = "tasks";

// Готово: безпечне читання (власний try/catch напишеш на рівні 91)
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

const tasks = loadTasks();
// Готово: після перезавантаження нові id продовжують нумерацію
let nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTasks() {
  const list = document.querySelector("#task-list");
  list.textContent = "";
  tasks.forEach((task) => {
    const card = document.createElement("li");
    card.classList.add("task-card");
    card.classList.toggle("is-done", task.done);
    card.dataset.id = task.id;
    card.textContent = task.title;
    list.appendChild(card);
  });
  document.querySelector("#summary").textContent = \`Завдань: \${tasks.length}\`;
}

function addTask(title, minutes) {
  tasks.push({ id: nextId, title, minutes, done: false });
  nextId = nextId + 1;
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  const task = tasks.find((item) => item.id === id);
  task.done = !task.done;
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  const index = tasks.findIndex((item) => item.id === id);
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

renderTasks();`,
    hint: "`saveTasks` — один рядок із `setItem` і `JSON.stringify(tasks)`. Виклич її в кожній функції зміни перед `renderTasks()`.",
    difficulty: 3,
  }),

  /* ───────────── Арка XI — Асинхронність, основи → Вежа Async ───────────── */
  jsqLevel(11, {
    id: 80,
    title: "setTimeout — відкладене повідомлення",
    concept: "`setTimeout(callback, мс)` планує виклик функції **пізніше** й повертає номер таймера. Скрипт при цьому **не зупиняється**: наступні рядки виконуються одразу, а callback — коли мине затримка й звільниться браузер (не раніше, але й не точно в мить). `clearTimeout(номер)` скасовує запланований виклик — так новий показ повідомлення не ховається через старий таймер.",
    example: `console.log("1");
setTimeout(() => console.log("3"), 0);
console.log("2");
// виведе: 1, 2, 3 — навіть із затримкою 0`,
    missionStory: "На першому поверсі Вежі Async з'являється сповіщення «Завдання збережено». Воно має зникати саме, але не тоді, коли поверх нього вже показано нове.",
    worldEvent: "Сповіщення вежі зникають вчасно.",
    taskType: "write-function",
    prompt: "Напиши `showMessage(text)`: показати текст у `#toast` і прибрати його (порожній рядок) через `HIDE_DELAY` мс. Якщо повідомлення показують знову до того, як зникло попереднє, скасуй старий таймер через `clearTimeout`, щоб нове не зникло передчасно.",
    criteria: "повідомлення зникає саме; старий таймер не ховає нове повідомлення раніше часу.",
    functionName: "showMessage",
    fileName: "toast.js",
    html: `<p id="toast"></p>`,
    starterCode: `const HIDE_DELAY = 200; // у справжньому трекері — 3000 мс, тут коротше для перевірки
const toast = document.querySelector("#toast");
let hideTimer = null;

function showMessage(text) {

}`,
    testCases: [
      { name: "Показ і зникнення", async check(ctx) { ctx.fn("Завдання збережено"); const shown = jsqText(ctx, "#toast"); await ctx.sleep(300); const hidden = jsqText(ctx, "#toast"); return { pass: shown === "Завдання збережено" && hidden === "", actual: ctx.show([shown, hidden]), expected: "[\"Завдання збережено\", \"\"]" }; } },
      { name: "Новий показ не ховає нове повідомлення передчасно", async check(ctx) { ctx.fn("Перше"); await ctx.sleep(120); ctx.fn("Друге"); await ctx.sleep(130); const mid = jsqText(ctx, "#toast"); await ctx.sleep(170); const end = jsqText(ctx, "#toast"); return { pass: mid === "Друге" && end === "", actual: ctx.show([mid, end]), expected: "[\"Друге\", \"\"]" }; } },
    ],
    codeChecks: [{ re: /setTimeout\(/, label: "`setTimeout`" }, { re: /clearTimeout\(/, label: "`clearTimeout`" }],
    solution: `const HIDE_DELAY = 200; // у справжньому трекері — 3000 мс, тут коротше для перевірки
const toast = document.querySelector("#toast");
let hideTimer = null;

function showMessage(text) {
  clearTimeout(hideTimer);
  toast.textContent = text;
  hideTimer = setTimeout(() => {
    toast.textContent = "";
  }, HIDE_DELAY);
}`,
    hint: "Збережи номер таймера: `hideTimer = setTimeout(...)`. Перед новим показом — `clearTimeout(hideTimer)`.",
    difficulty: 2,
  }),
  jsqLevel(11, {
    id: 81,
    title: "setInterval — періодичне оновлення",
    concept: "`setInterval(callback, мс)` викликає функцію **повторно** через однакові проміжки, доки її не зупинить `clearInterval(номер)`. Повторний «Старт» без перевірки створить **другий** інтервал паралельно — лічильник прискориться, а «Стоп» зупинить лише один. Тому номер інтервалу зберігають і не запускають новий, поки старий працює. Це не точний годинник: браузер може затримувати виклики.",
    example: `let ticks = 0;
const id = setInterval(() => {
  ticks = ticks + 1;
  if (ticks === 3) clearInterval(id);
}, 1000);`,
    missionStory: "Годинникар вежі вмикає лічильник секунд заняття. Нетерплячі учні тиснуть «Старт» двічі — і час біжить удвічі швидше.",
    worldEvent: "Годинник вежі йде рівно.",
    taskType: "write-function",
    prompt: "Напиши `startTimer()` і `stopTimer()`. Старт запускає інтервал з кроком `TICK`: кожен крок збільшує `seconds` на 1 і показує число в `#seconds`; повторний старт не створює другий інтервал. На межі `LIMIT` лічильник зупиняється сам. Стоп зупиняє інтервал.",
    criteria: "повторний старт не прискорює лічильник, стоп працює, лічильник зупиняється рівно на межі.",
    exports: ["startTimer", "stopTimer"],
    fileName: "timer.js",
    html: `<p id="seconds">0</p>`,
    starterCode: `const TICK = 40;  // у справжньому трекері — 1000 мс (секунда)
const LIMIT = 5;
let seconds = 0;
let intervalId = null;

function startTimer() {

}

function stopTimer() {

}`,
    testCases: [
      {
        name: "Подвійний старт не прискорює; зупинка рівно на 5",
        async check(ctx) {
          ctx.get("startTimer")();
          ctx.get("startTimer")();
          for (let i = 0; i < 40 && jsqText(ctx, "#seconds") !== "5"; i++) await ctx.sleep(25);
          await ctx.sleep(160);
          const v = jsqText(ctx, "#seconds");
          return { pass: v === "5", actual: ctx.show(v), expected: "\"5\" (і більше не росте)" };
        },
      },
      {
        name: "Стоп зупиняє лічильник",
        async check(ctx) {
          ctx.get("startTimer")();
          for (let i = 0; i < 40 && jsqText(ctx, "#seconds") === "0"; i++) await ctx.sleep(10);
          ctx.get("stopTimer")();
          const at = jsqText(ctx, "#seconds");
          await ctx.sleep(160);
          const later = jsqText(ctx, "#seconds");
          return { pass: at !== "0" && at === later && Number(at) < 5, actual: ctx.show([at, later]), expected: "те саме число, менше за 5" };
        },
      },
    ],
    codeChecks: [{ re: /setInterval\(/, label: "`setInterval`" }, { re: /clearInterval\(/, label: "`clearInterval`" }],
    solution: `const TICK = 40;  // у справжньому трекері — 1000 мс (секунда)
const LIMIT = 5;
let seconds = 0;
let intervalId = null;

function startTimer() {
  if (intervalId !== null) return; // уже працює
  intervalId = setInterval(() => {
    seconds = seconds + 1;
    document.querySelector("#seconds").textContent = seconds;
    if (seconds >= LIMIT) stopTimer();
  }, TICK);
}

function stopTimer() {
  clearInterval(intervalId);
  intervalId = null;
}`,
    hint: "На початку `startTimer` — ранній `return`, якщо `intervalId` уже не `null`. У `stopTimer` після `clearInterval` поверни `intervalId = null`.",
    difficulty: 2,
  }),
  jsqLevel(11, {
    id: 82,
    title: "Callback — знайомий механізм",
    concept: "Callback ти вже бачив: `forEach(cb)`, `addEventListener(\"click\", cb)`, `setTimeout(cb)`. Ідея одна — передаєш функцію, а викликає її інший код. Різниця — **коли**: `forEach` викликає колбек одразу (синхронно), подія — коли користувач клікне, таймер — пізніше (асинхронно). Тож не кожен callback асинхронний.",
    example: `function greet(name, done) {
  done(\`Привіт, \${name}\`); // викликаємо переданий колбек
}
greet("Оля", (text) => console.log(text));`,
    missionStory: "Посланці вежі виконують доручення: один відповідає одразу, інший — лише після того, як збігає вниз сходами.",
    worldEvent: "Посланці вежі повертаються з відповідями.",
    taskType: "write-function",
    prompt: "Напиши дві функції. `processTask(task, onDone)` одразу викликає `onDone` з рядком `Опрацьовано: <назва>`. `processLater(task, onDone)` робить те саме, але через `setTimeout` із затримкою `0`.",
    criteria: "ти відрізняєш передачу функції від її виклику й пояснюєш, чому не кожен callback асинхронний.",
    exports: ["processTask", "processLater"],
    fileName: "callbacks.js",
    starterCode: `function processTask(task, onDone) {

}

function processLater(task, onDone) {

}`,
    testCases: [
      { name: "processTask викликає колбек одразу", check(ctx) { const got = []; ctx.get("processTask")({ title: "Масиви" }, (msg) => got.push(msg)); return { pass: ctx.equal(got, ["Опрацьовано: Масиви"]), actual: ctx.show(got), expected: "[\"Опрацьовано: Масиви\"] — одразу після виклику" }; } },
      { name: "processLater викликає колбек пізніше", async check(ctx) { const got = []; ctx.get("processLater")({ title: "DOM" }, (msg) => got.push(msg)); const now = got.length; await ctx.sleep(30); return { pass: now === 0 && ctx.equal(got, ["Опрацьовано: DOM"]), actual: "одразу: " + now + ", потім: " + ctx.show(got), expected: "одразу: 0, потім: [\"Опрацьовано: DOM\"]" }; } },
    ],
    codeChecks: [{ re: /setTimeout\(/, label: "Відкладений виклик через `setTimeout`" }],
    solution: `function processTask(task, onDone) {
  onDone(\`Опрацьовано: \${task.title}\`);
}

function processLater(task, onDone) {
  setTimeout(() => {
    onDone(\`Опрацьовано: \${task.title}\`);
  }, 0);
}`,
    hint: "`onDone` — звичайна функція-параметр. Виклич її з дужками й рядком-аргументом.",
    difficulty: 1,
  }),
  jsqLevel(11, {
    id: 83,
    title: "Callback hell — складність вкладеності",
    concept: "Коли асинхронні кроки залежать один від одного (спершу профіль, потім його завдання, потім звіт), кожен наступний запускають **усередині колбека попереднього**. Запуск «поруч» не дочекається результату. Так виростає піраміда вкладеності — «callback hell»: важко читати, додавати крок і обробляти помилки. Частково рятує винесення колбеків в іменовані функції; повноцінне рішення — проміси (далі).",
    example: `loadUser((user) => {
  loadOrders(user.id, (orders) => {
    render(orders); // третій рівень вкладеності
  });
});`,
    missionStory: "Щоб скласти звіт для мага вежі, треба по черзі сходити за профілем, потім за завданнями, і лише тоді писати звіт.",
    worldEvent: "Звіт для мага складено по черзі.",
    taskType: "write-function",
    prompt: "Імітації сервера вже готові. Напиши `showReport()`: завантаж профіль → потім завдання цього користувача (`loadTasks(profile.id, ...)`) → потім звіт (`buildReport(profile, tasks, ...)`) і покажи його в `#report`. Колбеки винеси в іменовані функції, а не вкладай стрілки одна в одну.",
    criteria: "правильний порядок кроків і зрозумілі назви; ти можеш назвати труднощі додавання кроку й обробки помилки.",
    functionName: "showReport",
    fileName: "report.js",
    html: `<p id="report">Звіт ще не готовий</p>`,
    starterCode: `// Готові імітації сервера — не змінюй
function loadProfile(callback) {
  setTimeout(() => callback({ id: 7, name: "Оля" }), 20);
}
function loadTasks(userId, callback) {
  const tasks = userId === 7 ? [{ title: "Масиви", minutes: 30 }, { title: "DOM", minutes: 45 }] : [];
  setTimeout(() => callback(tasks), 20);
}
function buildReport(profile, tasks, callback) {
  const minutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  setTimeout(() => callback(\`\${profile.name}: \${tasks.length} завд., \${minutes} хв\`), 20);
}

function showReport() {

}`,
    testCases: [
      { name: "Звіт складено по черзі", async check(ctx) { ctx.fn(); await ctx.sleep(150); const t = jsqText(ctx, "#report"); return { pass: t === "Оля: 2 завд., 75 хв", actual: ctx.show(t), expected: "\"Оля: 2 завд., 75 хв\"" }; } },
    ],
    codeChecks: [{ re: /loadProfile\(\s*[A-Za-z_$][\w$]*\s*\)/, label: "Колбек для профілю — іменована функція" }],
    solution: `// Готові імітації сервера — не змінюй
function loadProfile(callback) {
  setTimeout(() => callback({ id: 7, name: "Оля" }), 20);
}
function loadTasks(userId, callback) {
  const tasks = userId === 7 ? [{ title: "Масиви", minutes: 30 }, { title: "DOM", minutes: 45 }] : [];
  setTimeout(() => callback(tasks), 20);
}
function buildReport(profile, tasks, callback) {
  const minutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  setTimeout(() => callback(\`\${profile.name}: \${tasks.length} завд., \${minutes} хв\`), 20);
}

function showReport() {
  loadProfile(handleProfile);
}

function handleProfile(profile) {
  loadTasks(profile.id, (tasks) => buildReport(profile, tasks, showText));
}

function showText(text) {
  document.querySelector("#report").textContent = text;
}`,
    hint: "Почни з вкладених стрілок, переконайся, що працює, а потім винеси перший колбек у `function handleProfile(profile) { ... }` і передай його ім'я: `loadProfile(handleProfile)`.",
    difficulty: 2,
  }),
  jsqLevel(11, {
    id: 84,
    title: "Promise — майбутній результат",
    concept: "**Проміс** — об'єкт-обіцянка майбутнього результату. Стан: `pending` (очікування) → `fulfilled` (успіх, через `resolve(значення)`) або `rejected` (помилка, через `reject(new Error(...))`). Кінцевий стан уже не змінюється: повторний `resolve` ігнорується. Сам проміс не переносить важку роботу в інший потік — він лише впорядковує, **коли** обробиться результат.",
    example: `function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(\`Минуло \${ms} мс\`), ms);
  });
}`,
    missionStory: "Маг вежі обіцяє принести список завдань з архіву. Іноді архів зачинено, і обіцянку доводиться порушити — чесно, з поясненням.",
    worldEvent: "Маг вежі тримає слово — або чесно пояснює відмову.",
    taskType: "write-function",
    prompt: "Напиши `simulateLoad(shouldFail)`, що **повертає проміс**. Через 30 мс він має або виконатися з масивом `SAMPLE_TASKS`, або (якщо `shouldFail`) відхилитися з `new Error(\"Не вдалося завантажити завдання\")`.",
    criteria: "ти передбачаєш стан для успіху й помилки й не очікуєш другого результату від повторного `resolve`.",
    functionName: "simulateLoad",
    fileName: "load.js",
    starterCode: `const SAMPLE_TASKS = [
  { id: 1, title: "Масиви", done: false },
  { id: 2, title: "DOM", done: true },
];

function simulateLoad(shouldFail) {

}`,
    testCases: [
      { name: "Повертає проміс", check(ctx) { const p = ctx.fn(false); const ok = p instanceof Promise; if (ok) p.catch(() => {}); return { pass: ok, actual: ok ? "Promise" : ctx.show(p), expected: "Promise" }; } },
      { name: "Успіх → масив завдань", async check(ctx) { const data = await ctx.fn(false); return { pass: ctx.equal(data, [{ id: 1, title: "Масиви", done: false }, { id: 2, title: "DOM", done: true }]), actual: ctx.show(data), expected: "SAMPLE_TASKS" }; } },
      { name: "Помилка → відхилення з Error", async check(ctx) { let err = null; try { await ctx.fn(true); } catch (e) { err = e; } const ok = err instanceof Error && err.message === "Не вдалося завантажити завдання"; return { pass: ok, actual: err ? err.name + ": " + err.message : "не відхилено", expected: "Error: Не вдалося завантажити завдання" }; } },
    ],
    codeChecks: [{ re: /new Promise\(/, label: "Створено `new Promise`" }],
    solution: `const SAMPLE_TASKS = [
  { id: 1, title: "Масиви", done: false },
  { id: 2, title: "DOM", done: true },
];

function simulateLoad(shouldFail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Не вдалося завантажити завдання"));
      } else {
        resolve(SAMPLE_TASKS);
      }
    }, 30);
  });
}`,
    hint: "Каркас: `return new Promise((resolve, reject) => { setTimeout(() => { ... }, 30); });`.",
    difficulty: 2,
  }),

  /* ───────────── Арка XII — Promises та async/await → Вежа Async ───────────── */
  jsqLevel(12, {
    id: 85,
    title: ".then() — перетворення результату",
    concept: "`.then(callback)` отримує результат проміса й повертає **новий** проміс. Те, що **поверне** callback, піде в наступний `.then`. Якщо callback у фігурних дужках забув `return`, далі піде `undefined`. Ланцюжок `.then().then()` пишемо в один рівень, без вкладеності.",
    example: `fetchNumber()
  .then((n) => n * 2)
  .then((doubled) => {
    return \`Результат: \${doubled}\`;
  });`,
    missionStory: "Розвідник вежі приносить список завдань, а помічник має відібрати невиконані й передати їхні назви далі. Але назви губляться дорогою.",
    worldEvent: "Назви невиконаних завдань доходять до кінця ланцюжка.",
    taskType: "fix-code",
    prompt: "`getPendingTitles()` має повертати проміс з назвами **невиконаних** завдань: `[\"Масиви\", \"Події\"]`. Знайди, де дані губляться в ланцюжку, і виправ.",
    criteria: "дані доходять до кінця; ти знаходиш пропущений `return` і не створюєш зайвої вкладеності.",
    functionName: "getPendingTitles",
    fileName: "pending.js",
    starterCode: `// Готова імітація завантаження
function simulateLoad() {
  return new Promise((resolve) => {
    setTimeout(() => resolve([
      { id: 1, title: "Масиви", done: false },
      { id: 2, title: "DOM", done: true },
      { id: 3, title: "Події", done: false },
    ]), 20);
  });
}

function getPendingTitles() {
  return simulateLoad()
    .then((tasks) => {
      tasks.filter((task) => !task.done);
    })
    .then((pending) => pending.map((task) => task.title));
}`,
    testCases: [
      { name: "Назви невиконаних", async check(ctx) { const v = await ctx.fn(); return { pass: ctx.equal(v, ["Масиви", "Події"]), actual: ctx.show(v), expected: "[\"Масиви\", \"Події\"]" }; } },
    ],
    codeChecks: [{ re: /\.then\(/, label: "Ланцюжок `.then`" }],
    solution: `// Готова імітація завантаження
function simulateLoad() {
  return new Promise((resolve) => {
    setTimeout(() => resolve([
      { id: 1, title: "Масиви", done: false },
      { id: 2, title: "DOM", done: true },
      { id: 3, title: "Події", done: false },
    ]), 20);
  });
}

function getPendingTitles() {
  return simulateLoad()
    .then((tasks) => {
      return tasks.filter((task) => !task.done);
    })
    .then((pending) => pending.map((task) => task.title));
}`,
    hint: "Що повертає перший callback? У фігурних дужках потрібен явний `return`.",
    difficulty: 1,
  }),
  jsqLevel(12, {
    id: 86,
    title: ".catch() — помилка в ланцюжку",
    concept: "`.catch(callback)` перехоплює відхилення проміса — і помилку, кинуту в будь-якому попередньому `.then`. Після обробленої помилки ланцюжок може продовжитися. Помилку не можна маскувати порожнім списком без пояснення: людина має бачити, що сталося, і мати змогу спробувати ще раз.",
    example: `loadData()
  .then((data) => show(data))
  .catch((error) => {
    status.textContent = "Не вдалося завантажити";
  });`,
    missionStory: "Архів вежі часом зачинений. Тоді мандрівник має бачити чесне повідомлення й кнопку «Спробувати ще раз», а не порожню полицю.",
    worldEvent: "Архів вежі чесно повідомляє про збої.",
    taskType: "fix-code",
    prompt: "`load(shouldFail)` показує в `#status` `Завантажено: N` після успіху. Додай обробку помилки: показати `Не вдалося завантажити. Спробуй ще раз.` і зробити видимою кнопку `#retry` (прибрати атрибут `hidden`). Клік по `#retry` викликає `load(false)`.",
    criteria: "стани успіху й помилки показано окремо; помилка не ховається за порожнім списком.",
    exports: ["load"],
    fileName: "archive.js",
    html: `<p id="status">Ще не завантажено</p>
<button id="retry" type="button" hidden>Спробувати ще раз</button>`,
    starterCode: `// Готова імітація завантаження
function simulateLoad(shouldFail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error("Архів зачинено"));
      else resolve([{ title: "Масиви" }, { title: "DOM" }, { title: "Події" }]);
    }, 20);
  });
}

const statusText = document.querySelector("#status");
const retryButton = document.querySelector("#retry");

function load(shouldFail) {
  return simulateLoad(shouldFail)
    .then((tasks) => {
      statusText.textContent = \`Завантажено: \${tasks.length}\`;
    });
}`,
    testCases: [
      { name: "Помилка → повідомлення й кнопка", async check(ctx) { let thrown = false; try { await ctx.get("load")(true); } catch (e) { thrown = true; } const s = jsqText(ctx, "#status"); const visible = !ctx.$("#retry").hidden; return { pass: !thrown && s === "Не вдалося завантажити. Спробуй ще раз." && visible, actual: (thrown ? "помилка вилетіла назовні; " : "") + ctx.show(s) + ", кнопка " + (visible ? "видима" : "схована"), expected: "повідомлення про помилку, кнопка видима" }; } },
      { name: "Повторна спроба успішна", async check(ctx) { try { await ctx.get("load")(true); } catch (e) { /* перевірено вище */ } ctx.fire(ctx.$("#retry"), "click"); await ctx.sleep(60); const s = jsqText(ctx, "#status"); return { pass: s === "Завантажено: 3", actual: ctx.show(s), expected: "\"Завантажено: 3\"" }; } },
      { name: "Успіх одразу", async check(ctx) { await ctx.get("load")(false); const s = jsqText(ctx, "#status"); return { pass: s === "Завантажено: 3", actual: ctx.show(s), expected: "\"Завантажено: 3\"" }; } },
    ],
    codeChecks: [{ re: /\.catch\(/, label: "Помилку оброблено в `.catch`" }],
    solution: `// Готова імітація завантаження
function simulateLoad(shouldFail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error("Архів зачинено"));
      else resolve([{ title: "Масиви" }, { title: "DOM" }, { title: "Події" }]);
    }, 20);
  });
}

const statusText = document.querySelector("#status");
const retryButton = document.querySelector("#retry");

function load(shouldFail) {
  return simulateLoad(shouldFail)
    .then((tasks) => {
      statusText.textContent = \`Завантажено: \${tasks.length}\`;
    })
    .catch(() => {
      statusText.textContent = "Не вдалося завантажити. Спробуй ще раз.";
      retryButton.removeAttribute("hidden");
    });
}

retryButton.addEventListener("click", () => {
  load(false);
});`,
    hint: "Допиши в ланцюжок `.catch(() => { ... })` і окремо — обробник кліку для `#retry`.",
    difficulty: 2,
  }),
  jsqLevel(12, {
    id: 87,
    title: ".finally() — завершення завантаження",
    concept: "`.finally(callback)` виконується **в обох** випадках — після успіху й після помилки. Він не отримує даних і не замінює обробку помилки, зате ідеально підходить для «прибирання»: сховати індикатор завантаження, знову ввімкнути кнопку. Так інтерфейс не «зависає» в стані завантаження після збою.",
    example: `spinner.hidden = false;
loadData()
  .then(show)
  .catch(showError)
  .finally(() => {
    spinner.hidden = true;
  });`,
    missionStory: "Поки архів шукає записи, кнопка «Завантажити» вимкнена, а на табло крутиться пісочний годинник. Але після збою годинник так і крутиться.",
    worldEvent: "Пісочний годинник вежі зупиняється вчасно.",
    taskType: "fix-code",
    prompt: "На старті `load` вимикає кнопку `#load-btn` і показує `#loader`. Додай `.finally`, який після будь-якого результату вмикає кнопку й ховає індикатор.",
    criteria: "усе відновлюється і після успіху, і після помилки, тож можна спробувати знову.",
    exports: ["load"],
    fileName: "archive.js",
    html: `<button id="load-btn" type="button">Завантажити</button>
<p id="loader" hidden>Завантаження…</p>
<p id="status"></p>`,
    starterCode: `// Готова імітація завантаження
function simulateLoad(shouldFail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error("Архів зачинено"));
      else resolve([{ title: "Масиви" }, { title: "DOM" }]);
    }, 30);
  });
}

const button = document.querySelector("#load-btn");
const loader = document.querySelector("#loader");
const statusText = document.querySelector("#status");

function load(shouldFail) {
  button.disabled = true;
  loader.hidden = false;
  return simulateLoad(shouldFail)
    .then((tasks) => {
      statusText.textContent = \`Завантажено: \${tasks.length}\`;
    })
    .catch(() => {
      statusText.textContent = "Не вдалося завантажити";
    });
}`,
    testCases: [
      { name: "Під час завантаження — вимкнено й видно індикатор", async check(ctx) { const p = ctx.get("load")(false); const b = ctx.$("#load-btn").disabled, l = !ctx.$("#loader").hidden; await p; return { pass: b && l, actual: ctx.show([b, l]), expected: "[true, true]" }; } },
      { name: "Після успіху — відновлено", async check(ctx) { await ctx.get("load")(false); const b = ctx.$("#load-btn").disabled, l = ctx.$("#loader").hidden; return { pass: b === false && l === true && jsqText(ctx, "#status") === "Завантажено: 2", actual: ctx.show([b, l, jsqText(ctx, "#status")]), expected: "[false, true, \"Завантажено: 2\"]" }; } },
      { name: "Після помилки — теж відновлено", async check(ctx) { await ctx.get("load")(true); const b = ctx.$("#load-btn").disabled, l = ctx.$("#loader").hidden; return { pass: b === false && l === true && jsqText(ctx, "#status") === "Не вдалося завантажити", actual: ctx.show([b, l, jsqText(ctx, "#status")]), expected: "[false, true, \"Не вдалося завантажити\"]" }; } },
    ],
    codeChecks: [{ re: /\.finally\(/, label: "Прибирання в `.finally`" }],
    solution: `// Готова імітація завантаження
function simulateLoad(shouldFail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error("Архів зачинено"));
      else resolve([{ title: "Масиви" }, { title: "DOM" }]);
    }, 30);
  });
}

const button = document.querySelector("#load-btn");
const loader = document.querySelector("#loader");
const statusText = document.querySelector("#status");

function load(shouldFail) {
  button.disabled = true;
  loader.hidden = false;
  return simulateLoad(shouldFail)
    .then((tasks) => {
      statusText.textContent = \`Завантажено: \${tasks.length}\`;
    })
    .catch(() => {
      statusText.textContent = "Не вдалося завантажити";
    })
    .finally(() => {
      button.disabled = false;
      loader.hidden = true;
    });
}`,
    hint: "Допиши в кінець ланцюжка `.finally(() => { ... })` з двома рядками-протилежностями до початку `load`.",
    difficulty: 1,
  }),
  jsqLevel(12, {
    id: 88,
    title: "async / await — послідовний запис",
    concept: "`async function` завжди повертає **проміс**. Усередині неї `await проміс` чекає результату й дає його як звичайне значення. Чекає лише **ця функція**, сторінка й решта коду не зупиняються. Тому код, що викликав async-функцію без `await`, може продовжити роботу раніше, ніж прийде відповідь. Результат той самий, що з `.then`, але читається згори вниз.",
    example: `async function getDoubled() {
  const n = await fetchNumber();
  return n * 2;
}
getDoubled().then((v) => console.log(v));`,
    missionStory: "Маг вежі просить переписати доручення помічника так, щоб його можна було читати згори вниз, як звичайну історію.",
    worldEvent: "Доручення вежі читаються згори вниз.",
    taskType: "fix-code",
    prompt: "Перепиши `getPendingTitles()` через `async / await`: дочекайся `simulateLoad()`, відбери невиконані завдання і поверни їхні назви. Без `.then`.",
    criteria: "результат збігається з версією на `.then`; ти пояснюєш, що повертає async-функція.",
    functionName: "getPendingTitles",
    fileName: "pending.js",
    starterCode: `// Готова імітація завантаження
function simulateLoad() {
  return new Promise((resolve) => {
    setTimeout(() => resolve([
      { id: 1, title: "Масиви", done: false },
      { id: 2, title: "DOM", done: true },
      { id: 3, title: "Події", done: false },
    ]), 20);
  });
}

function getPendingTitles() {
  return simulateLoad()
    .then((tasks) => tasks.filter((task) => !task.done))
    .then((pending) => pending.map((task) => task.title));
}`,
    testCases: [
      { name: "Назви невиконаних", async check(ctx) { const v = await ctx.fn(); return { pass: ctx.equal(v, ["Масиви", "Події"]), actual: ctx.show(v), expected: "[\"Масиви\", \"Події\"]" }; } },
      { name: "Функція повертає проміс", check(ctx) { const p = ctx.fn(); return { pass: p instanceof Promise, actual: p instanceof Promise ? "Promise" : ctx.show(p), expected: "Promise" }; } },
    ],
    codeChecks: [{ re: /async\s+function\s+getPendingTitles/, label: "`async function`" }, { re: /await\s+simulateLoad\(\)/, label: "`await simulateLoad()`" }, { re: /\.then\(/, not: true, label: "Без `.then`" }],
    solution: `// Готова імітація завантаження
function simulateLoad() {
  return new Promise((resolve) => {
    setTimeout(() => resolve([
      { id: 1, title: "Масиви", done: false },
      { id: 2, title: "DOM", done: true },
      { id: 3, title: "Події", done: false },
    ]), 20);
  });
}

async function getPendingTitles() {
  const tasks = await simulateLoad();
  const pending = tasks.filter((task) => !task.done);
  return pending.map((task) => task.title);
}`,
    hint: "Три рядки в тілі: `const tasks = await simulateLoad();`, потім `filter`, потім `return ... .map(...)`.",
    difficulty: 1,
  }),
  jsqLevel(12, {
    id: 89,
    title: "fetch() — перший HTTP-запит",
    concept: "`fetch(адреса)` надсилає HTTP-запит і повертає проміс з об'єктом `Response`. У нього є `status` (наприклад, 200 чи 404) і `ok` (`true` для статусів 200–299). Важливо: відповідь з помилковим статусом на кшталт 404 **не** відхиляє проміс `fetch` — сервер відповів, просто «не знайдено». Проміс відхиляється лише при мережевому збої (немає зв'язку). Читання тіла відповіді — на наступному рівні.",
    example: `const response = await fetch("/data/users.json");
console.log(response.status); // 200
console.log(response.ok);     // true`,
    missionStory: "З вершини вежі видно навчальний сервер. Надішли сигнал і дізнайся, чи він відповідає.",
    worldEvent: "Навчальний сервер відповів на сигнал вежі.",
    taskType: "write-function",
    prompt: "Напиши async-функцію `getStatus(url)`: зроби `fetch(url)` і поверни рядок `<статус> OK`, якщо `response.ok`, інакше `<статус> помилка`. Наприклад, `\"200 OK\"` для `/data/tasks.json` і `\"404 помилка\"` для відсутнього файлу.",
    criteria: "ти відрізняєш HTTP-відповідь з помилковим статусом від мережевого збою.",
    functionName: "getStatus",
    fileName: "status.js",
    starterCode: `async function getStatus(url) {

}`,
    testCases: [
      { name: "/data/tasks.json → 200 OK", fetch: { data: [], status: 200 }, async check(ctx) { const v = await ctx.fn("/data/tasks.json"); return { pass: v === "200 OK" && ctx.fetchCalls[0] === "/data/tasks.json", actual: ctx.show(v) + ", запит " + ctx.show(ctx.fetchCalls[0]), expected: "\"200 OK\", запит \"/data/tasks.json\"" }; } },
      { name: "Відсутній файл → 404 помилка (без винятку)", fetch: { ok: false, status: 404, data: null }, async check(ctx) { const v = await ctx.fn("/data/missing.json"); return { pass: v === "404 помилка", actual: ctx.show(v), expected: "\"404 помилка\"" }; } },
      { name: "Мережевий збій → проміс відхилено", fetch: { fail: true }, async check(ctx) { let name = "не відхилено"; try { await ctx.fn("/data/tasks.json"); } catch (e) { name = e.name; } return { pass: name === "TypeError", actual: name, expected: "TypeError (Failed to fetch)" }; } },
    ],
    codeChecks: [{ re: /await\s+fetch\(/, label: "`await fetch(...)`" }, { re: /\.ok\b/, label: "Перевірено `response.ok`" }],
    solution: `async function getStatus(url) {
  const response = await fetch(url);
  return \`\${response.status} \${response.ok ? "OK" : "помилка"}\`;
}`,
    hint: "Тіло відповіді тут не потрібне — лише `response.status` і `response.ok`.",
    difficulty: 1,
  }),
  jsqLevel(12, {
    id: 90,
    title: "JSON-відповідь — HTTP-дані у списку",
    concept: "Тіло відповіді читають через `await response.json()`: це теж асинхронна операція, і вона повертає вже готові JS-дані. Це не те саме, що синхронний `JSON.parse` для рядка, який уже є в пам'яті. Отримані приклади показуємо в **окремому** блоці, щоб не перезаписати власний список користувача.",
    example: `const response = await fetch("/data/quotes.json");
const quotes = await response.json(); // масив
quotes.forEach((q) => console.log(q.text));`,
    missionStory: "Вежу Async майже підкорено! Лишилось отримати з сервера приклади завдань і повісити їх на окрему дошку.",
    worldEvent: "Підкорено вежу, приборкано час!",
    taskType: "write-function",
    prompt: "Допиши `loadExamples()`: після готової перевірки статусу прочитай масив через `response.json()` і покажи назви в `#examples` (кожна — `li`). Якщо масив порожній — напиши в `#examples-status` `Прикладів поки немає`. Свій список `#task-list` не чіпай. Повторне завантаження не дублює пункти.",
    criteria: "показано отримані значення, використано очікування читання; власний список не перезаписано; повторне завантаження не дублює пункти; перевірено порожній і непорожній масиви.",
    functionName: "loadExamples",
    fileName: "examples.js",
    html: `<ul id="task-list"><li>Моє: Масиви</li><li>Моє: DOM</li></ul>
<h2>Приклади завдань</h2>
<p id="examples-status"></p>
<ul id="examples"></ul>`,
    starterCode: `async function loadExamples() {
  const response = await fetch("/data/tasks.json");
  // Готово: невдалий статус
  if (!response.ok) {
    document.querySelector("#examples-status").textContent = \`Помилка \${response.status}\`;
    return;
  }

}`,
    testCases: [
      { name: "Два приклади", fetch: { data: [{ id: 1, title: "Повторити цикли" }, { id: 2, title: "Пройти DOM" }] }, async check(ctx) { await ctx.fn(); const items = ctx.$$("#examples li").map((li) => li.textContent); return { pass: ctx.equal(items, ["Повторити цикли", "Пройти DOM"]), actual: ctx.show(items), expected: "[\"Повторити цикли\", \"Пройти DOM\"]" }; } },
      { name: "Порожній масив → повідомлення", fetch: { data: [] }, async check(ctx) { await ctx.fn(); const s = jsqText(ctx, "#examples-status"); return { pass: s === "Прикладів поки немає" && ctx.$$("#examples li").length === 0, actual: ctx.show(s), expected: "\"Прикладів поки немає\"" }; } },
      { name: "Повторне завантаження не дублює пункти", fetch: { data: [{ id: 1, title: "Повторити цикли" }, { id: 2, title: "Пройти DOM" }] }, async check(ctx) { await ctx.fn(); await ctx.fn(); const items = ctx.$$("#examples li").map((li) => li.textContent); return { pass: ctx.equal(items, ["Повторити цикли", "Пройти DOM"]), actual: ctx.show(items), expected: "[\"Повторити цикли\", \"Пройти DOM\"]" }; } },
      { name: "Власний список не змінився", fetch: { data: [{ id: 1, title: "Повторити цикли" }] }, async check(ctx) { await ctx.fn(); const own = ctx.$$("#task-list li").map((li) => li.textContent); return { pass: ctx.equal(own, ["Моє: Масиви", "Моє: DOM"]), actual: ctx.show(own), expected: "[\"Моє: Масиви\", \"Моє: DOM\"]" }; } },
    ],
    codeChecks: [{ re: /await\s+response\.json\(\)/, label: "`await response.json()`" }],
    solution: `async function loadExamples() {
  const response = await fetch("/data/tasks.json");
  // Готово: невдалий статус
  if (!response.ok) {
    document.querySelector("#examples-status").textContent = \`Помилка \${response.status}\`;
    return;
  }

  const examples = await response.json();
  const list = document.querySelector("#examples");
  list.textContent = "";
  if (examples.length === 0) {
    document.querySelector("#examples-status").textContent = "Прикладів поки немає";
    return;
  }
  examples.forEach((example) => {
    const item = document.createElement("li");
    item.textContent = example.title;
    list.appendChild(item);
  });
}`,
    hint: "`const examples = await response.json();` — і далі як звичайний масив: перевірка довжини та `forEach` зі створенням `li`.",
    difficulty: 2,
  }),

  /* ───────────── Арка XIII — Обробка помилок → Вершина вежі Async ───────────── */
  jsqLevel(13, {
    id: 91,
    title: "try / catch — відновлення після помилки",
    concept: "`try { ... } catch (error) { ... }` перехоплює помилку, що виникла в блоці `try`, і передає керування в `catch` — програма не падає. Типовий випадок: `JSON.parse` пошкодженого рядка. Щоб `catch` перехопив відхилений проміс, його треба очікувати через `await` **усередині** `try`. Пошкоджені дані не варто мовчки видаляти: скидання — окрема свідома дія.",
    example: `try {
  const settings = JSON.parse(text);
  apply(settings);
} catch (error) {
  console.log("Налаштування пошкоджено:", error.message);
}`,
    missionStory: "На вершині вежі шторм пошкодив записи журналу. Журнал не має падати — він має відкритися порожнім і чесно попередити.",
    worldEvent: "Журнал витримав шторм пошкоджених записів.",
    taskType: "write-function",
    prompt: "Напиши власну `loadTasks()`: прочитай ключ `\"tasks\"` з `localStorage` і розбери через `JSON.parse` у `try`. Якщо запису немає — поверни `[]`. Якщо JSON пошкоджено — покажи в `#storage-error` `Збережені дані пошкоджено — показуємо порожній список` і поверни `[]`. Пошкоджений запис не видаляй. Перевірка, що дані — масив, уже готова.",
    criteria: "коректні дані відновлюються, пошкоджені не зупиняють запуск і не видаляються автоматично.",
    functionName: "loadTasks",
    fileName: "storage.js",
    html: `<p id="storage-error"></p>`,
    starterCode: `function loadTasks() {
  const raw = localStorage.getItem("tasks");

  // Готово: перевірка структури (докладніше — на рівні 93)
  // return Array.isArray(data) ? data : [];
}`,
    testCases: [
      { name: "Коректні дані відновлено", storage: { tasks: "[{\"id\":1,\"title\":\"Масиви\",\"minutes\":30,\"done\":false}]" }, check(ctx) { const v = ctx.fn(); return { pass: ctx.equal(v, [{ id: 1, title: "Масиви", minutes: 30, done: false }]) && jsqText(ctx, "#storage-error") === "", actual: ctx.show(v), expected: "[{ id: 1, title: \"Масиви\", minutes: 30, done: false }]" }; } },
      { name: "Запису немає → []", check(ctx) { const v = ctx.fn(); return { pass: ctx.equal(v, []) && jsqText(ctx, "#storage-error") === "", actual: ctx.show(v), expected: "[] без повідомлення" }; } },
      { name: "Пошкоджений JSON → [] і попередження", storage: { tasks: "{oops" }, check(ctx) { const v = ctx.fn(); const e = jsqText(ctx, "#storage-error"); const kept = ctx.storage.getItem("tasks"); return { pass: ctx.equal(v, []) && e === "Збережені дані пошкоджено — показуємо порожній список" && kept === "{oops", actual: ctx.show(v) + ", " + ctx.show(e) + ", запис " + ctx.show(kept), expected: "[], повідомлення, запис \"{oops\" збережено" }; } },
    ],
    codeChecks: [{ re: /try\s*\{/, label: "`try`" }, { re: /catch\s*\(/, label: "`catch`" }, { re: /removeItem\(/, not: true, label: "Пошкоджений запис не видаляється" }],
    solution: `function loadTasks() {
  const raw = localStorage.getItem("tasks");
  if (raw === null) return [];

  try {
    const data = JSON.parse(raw);
    // Готово: перевірка структури (докладніше — на рівні 93)
    return Array.isArray(data) ? data : [];
  } catch (error) {
    document.querySelector("#storage-error").textContent = "Збережені дані пошкоджено — показуємо порожній список";
    return [];
  }
}`,
    hint: "Спершу ранній `return []` для `null`. Потім `try { const data = JSON.parse(raw); return ...; } catch (error) { ...; return []; }`.",
    difficulty: 2,
  }),
  jsqLevel(13, {
    id: 92,
    title: "try / catch / finally — цикл запиту",
    concept: "Повний цикл запиту в async-функції: `try` — успішний шлях (запит, читання, показ), `catch` — зрозуміле повідомлення про будь-яку помилку (мережа, пошкоджений JSON), `finally` — завершення завантаження в обох випадках. `return` у `finally` не пишемо: він перекрив би результат з `try` чи `catch`.",
    example: `async function refresh() {
  spinner.hidden = false;
  try {
    const data = await load();
    show(data);
  } catch (error) {
    showError();
  } finally {
    spinner.hidden = true;
  }
}`,
    missionStory: "Табло прикладів на вершині вежі має пережити будь-яку бурю: обрив зв'язку, зіпсовані дані — і завжди повертатися до робочого стану.",
    worldEvent: "Табло прикладів пережило бурю.",
    taskType: "write-function",
    prompt: "Перепиши `loadExamples()` з трьома блоками. На старті кнопка `#load-btn` вимикається, а в `#status` пишеться `Завантаження…`. У `try`: запит `/data/tasks.json` (перевірка статусу готова), читання JSON, показ назв у `#examples` і `#status` = `Готово`. У `catch`: `#status` = `Не вдалося завантажити приклади`. У `finally`: кнопка знову ввімкнена.",
    criteria: "кнопка відновлюється після успіху, мережевої помилки й помилки JSON; повторна спроба працює.",
    functionName: "loadExamples",
    fileName: "examples.js",
    html: `<button id="load-btn" type="button">Завантажити приклади</button>
<p id="status"></p>
<ul id="examples"></ul>`,
    starterCode: `const button = document.querySelector("#load-btn");
const statusText = document.querySelector("#status");
const list = document.querySelector("#examples");

async function loadExamples() {
  button.disabled = true;
  statusText.textContent = "Завантаження…";

  const response = await fetch("/data/tasks.json");
  // Готово: перевірка статусу (власний throw — на рівні 93)
  if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
  const examples = await response.json();
  list.textContent = "";
  examples.forEach((example) => {
    const item = document.createElement("li");
    item.textContent = example.title;
    list.appendChild(item);
  });
  statusText.textContent = "Готово";
}`,
    testCases: [
      { name: "Успіх", fetch: { data: [{ title: "Повторити цикли" }, { title: "Пройти DOM" }] }, async check(ctx) { const p = ctx.fn(); const during = ctx.$("#load-btn").disabled; await p; const items = ctx.$$("#examples li").length; return { pass: during && !ctx.$("#load-btn").disabled && items === 2 && jsqText(ctx, "#status") === "Готово", actual: "під час: " + during + ", після: " + ctx.$("#load-btn").disabled + ", " + items + " li, " + ctx.show(jsqText(ctx, "#status")), expected: "під час: true, після: false, 2 li, \"Готово\"" }; } },
      { name: "Повторне завантаження не дублює пункти", fetch: { data: [{ title: "Повторити цикли" }, { title: "Пройти DOM" }] }, async check(ctx) { await ctx.fn(); await ctx.fn(); const n = ctx.$$("#examples li").length; return { pass: n === 2, actual: n + " li", expected: "2 li" }; } },
      { name: "Мережевий збій", fetch: { fail: true }, async check(ctx) { let thrown = false; try { await ctx.fn(); } catch (e) { thrown = true; } return { pass: !thrown && !ctx.$("#load-btn").disabled && jsqText(ctx, "#status") === "Не вдалося завантажити приклади", actual: (thrown ? "помилка вилетіла назовні; " : "") + ctx.show([ctx.$("#load-btn").disabled, jsqText(ctx, "#status")]), expected: "[false, \"Не вдалося завантажити приклади\"]" }; } },
      { name: "Пошкоджений JSON", fetch: { badJson: true }, async check(ctx) { let thrown = false; try { await ctx.fn(); } catch (e) { thrown = true; } return { pass: !thrown && !ctx.$("#load-btn").disabled && jsqText(ctx, "#status") === "Не вдалося завантажити приклади", actual: ctx.show([ctx.$("#load-btn").disabled, jsqText(ctx, "#status")]), expected: "[false, \"Не вдалося завантажити приклади\"]" }; } },
      { name: "Повторна спроба після помилки (404)", fetch: { ok: false, status: 404, data: null }, async check(ctx) { try { await ctx.fn(); await ctx.fn(); } catch (e) { /* має бути оброблено всередині */ } return { pass: !ctx.$("#load-btn").disabled && jsqText(ctx, "#status") === "Не вдалося завантажити приклади", actual: ctx.show([ctx.$("#load-btn").disabled, jsqText(ctx, "#status")]), expected: "[false, \"Не вдалося завантажити приклади\"]" }; } },
    ],
    codeChecks: [{ re: /try\s*\{/, label: "`try`" }, { re: /catch\s*\(/, label: "`catch`" }, { re: /finally\s*\{/, label: "`finally`" }],
    solution: `const button = document.querySelector("#load-btn");
const statusText = document.querySelector("#status");
const list = document.querySelector("#examples");

async function loadExamples() {
  button.disabled = true;
  statusText.textContent = "Завантаження…";

  try {
    const response = await fetch("/data/tasks.json");
    // Готово: перевірка статусу (власний throw — на рівні 93)
    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
    const examples = await response.json();
    list.textContent = "";
    examples.forEach((example) => {
      const item = document.createElement("li");
      item.textContent = example.title;
      list.appendChild(item);
    });
    statusText.textContent = "Готово";
  } catch (error) {
    statusText.textContent = "Не вдалося завантажити приклади";
  } finally {
    button.disabled = false;
  }
}`,
    hint: "Загорни все від `fetch` до «Готово» в `try`. Ввімкнення кнопки перенеси у `finally`.",
    difficulty: 2,
  }),
  jsqLevel(13, {
    id: 93,
    title: "throw — неприйнятні дані",
    concept: "`throw new Error(\"повідомлення\")` миттєво перериває виконання й передає керування найближчому `catch`. Так позначають неприйнятну ситуацію: сервер відповів 404 або повернув JSON не тієї форми. Успішний статус не гарантує потрібну структуру. Перевірити, що отримано масив, допомагає `Array.isArray(значення)`.",
    example: `function parseAge(text) {
  const age = Number(text);
  if (!Number.isFinite(age)) throw new Error("Вік має бути числом");
  return age;
}`,
    missionStory: "Шторм на вершині вежі підсовує то зламані відповіді, то записи не того виду. Кожен випадок має отримати своє чесне пояснення.",
    worldEvent: "Знешкоджено шторм помилок на вершині!",
    taskType: "write-function",
    prompt: "Допиши перевірки в `loadExamples()`: якщо `response.ok` хибне — `throw new Error(\"Сервер відповів <статус>\")`; якщо JSON — не масив — `throw new Error(\"Очікували список завдань\")`. У `catch` для пошкодженого JSON (`SyntaxError`) покажи `Сервер надіслав некоректні дані`, для решти — `error.message`. Після успіху `#status` порожній, а приклади показано в `#examples`.",
    criteria: "ти розрізняєш 404, пошкоджений JSON і правильний JSON іншої форми.",
    functionName: "loadExamples",
    fileName: "examples.js",
    html: `<p id="status">Ще не завантажено</p>
<ul id="examples"></ul>`,
    starterCode: `const statusText = document.querySelector("#status");
const list = document.querySelector("#examples");

async function loadExamples() {
  try {
    const response = await fetch("/data/tasks.json");
    // перевір статус
    const examples = await response.json();
    // перевір, що це масив
    list.textContent = "";
    examples.forEach((example) => {
      const item = document.createElement("li");
      item.textContent = example.title;
      list.appendChild(item);
    });
    statusText.textContent = "";
  } catch (error) {
    statusText.textContent = "Щось пішло не так";
  }
}`,
    testCases: [
      { name: "404 → «Сервер відповів 404»", fetch: { ok: false, status: 404, data: null }, async check(ctx) { await ctx.fn(); const s = jsqText(ctx, "#status"); return { pass: s === "Сервер відповів 404", actual: ctx.show(s), expected: "\"Сервер відповів 404\"" }; } },
      { name: "Пошкоджений JSON", fetch: { badJson: true }, async check(ctx) { await ctx.fn(); const s = jsqText(ctx, "#status"); return { pass: s === "Сервер надіслав некоректні дані", actual: ctx.show(s), expected: "\"Сервер надіслав некоректні дані\"" }; } },
      { name: "JSON-об'єкт замість масиву", fetch: { data: { title: "Масиви" } }, async check(ctx) { await ctx.fn(); const s = jsqText(ctx, "#status"); return { pass: s === "Очікували список завдань" && ctx.$$("#examples li").length === 0, actual: ctx.show(s), expected: "\"Очікували список завдань\"" }; } },
      { name: "Правильний масив", fetch: { data: [{ title: "Повторити цикли" }] }, async check(ctx) { await ctx.fn(); const s = jsqText(ctx, "#status"); const n = ctx.$$("#examples li").length; return { pass: s === "" && n === 1, actual: ctx.show(s) + ", " + n + " li", expected: "\"\", 1 li" }; } },
      { name: "Повторне завантаження не дублює пункти", fetch: { data: [{ title: "Повторити цикли" }] }, async check(ctx) { await ctx.fn(); await ctx.fn(); const n = ctx.$$("#examples li").length; return { pass: n === 1, actual: n + " li", expected: "1 li" }; } },
    ],
    codeChecks: [{ re: /throw\s+new\s+Error\(/, label: "`throw new Error(...)`" }, { re: /Array\.isArray\(/, label: "Перевірка `Array.isArray`" }],
    solution: `const statusText = document.querySelector("#status");
const list = document.querySelector("#examples");

async function loadExamples() {
  try {
    const response = await fetch("/data/tasks.json");
    if (!response.ok) throw new Error(\`Сервер відповів \${response.status}\`);
    const examples = await response.json();
    if (!Array.isArray(examples)) throw new Error("Очікували список завдань");
    list.textContent = "";
    examples.forEach((example) => {
      const item = document.createElement("li");
      item.textContent = example.title;
      list.appendChild(item);
    });
    statusText.textContent = "";
  } catch (error) {
    statusText.textContent = error instanceof SyntaxError ? "Сервер надіслав некоректні дані" : error.message;
  }
}`,
    hint: "Тип помилки перевіряє `error instanceof SyntaxError`. Для власних помилок досить показати `error.message`.",
    difficulty: 2,
  }),

  /* ───────────── Арка XIV — Фінал → Замок фіналу ───────────── */
  jsqLevel(14, {
    id: 94,
    title: "class, constructor, методи — модель завдання",
    concept: "`class` описує «креслення» однотипних об'єктів. `constructor(...)` заповнює властивості нового **екземпляра**, який створюють через `new`. Методи класу спільні для всіх екземплярів, а дані в кожного свої. Важливо: `JSON.parse(JSON.stringify(екземпляр))` повертає звичайний об'єкт — методів класу в ньому вже немає.",
    example: `class Timer {
  constructor(label) {
    this.label = label;
    this.seconds = 0;
  }
  tick() {
    this.seconds = this.seconds + 1;
  }
}
const t = new Timer("Читання");
t.tick();`,
    missionStory: "Архітектор замку креслить єдину модель для всіх завдань журналу, щоб кожне знало, як себе виконати.",
    worldEvent: "Креслення моделі завдання лежить у залі замку.",
    taskType: "write-function",
    prompt: "Створи клас `Task`: конструктор приймає `title` і `minutes` і задає `done = false`; метод `complete()` встановлює `done = true`. Збережи в `restoredType` результат `typeof` для методу `complete` у копії, відновленій через `JSON.parse(JSON.stringify(...))`.",
    criteria: "зміна одного екземпляра не змінює іншого; ти пояснюєш, чому `JSON.parse` не відновлює методи.",
    exports: ["Task", "restoredType"],
    fileName: "task.js",
    starterCode: `// class Task { ... }
`,
    testCases: [
      { name: "Новий екземпляр", check(ctx) { const Task = ctx.get("Task"); const t = new Task("Масиви", 30); return { pass: t.title === "Масиви" && t.minutes === 30 && t.done === false, actual: ctx.show({ title: t.title, minutes: t.minutes, done: t.done }), expected: "{ title: \"Масиви\", minutes: 30, done: false }" }; } },
      { name: "Екземпляри незалежні", check(ctx) { const Task = ctx.get("Task"); const a = new Task("Масиви", 30), b = new Task("DOM", 45); a.complete(); return { pass: a.done === true && b.done === false, actual: ctx.show([a.done, b.done]), expected: "[true, false]" }; } },
      { name: "JSON-копія без методів", check: jsqVars({ restoredType: "undefined" }) },
    ],
    codeChecks: [{ re: /class\s+Task\b/, label: "`class Task`" }, { re: /constructor\s*\(/, label: "`constructor`" }],
    solution: `class Task {
  constructor(title, minutes) {
    this.title = title;
    this.minutes = minutes;
    this.done = false;
  }

  complete() {
    this.done = true;
  }
}

const sample = new Task("Масиви", 30);
const restored = JSON.parse(JSON.stringify(sample));
const restoredType = typeof restored.complete;`,
    hint: "Для `restoredType` створи екземпляр, проведи його через `JSON.stringify` і `JSON.parse`, а потім візьми `typeof` від `.complete`.",
    difficulty: 2,
  }),
  jsqLevel(14, {
    id: 95,
    title: "export / import — межі частин коду",
    concept: "Модулі ділять код на файли з чіткими обов'язками. `export` робить функцію доступною іншим файлам, `import { name } from \"./file.js\"` підключає її в іншому. Усе неекспортоване лишається приватним. Точка входу підключається через `<script type=\"module\">`, і такі сторінки працюють лише через сервер, а не з файлу на диску.",
    example: `// math.js
export function add(a, b) { return a + b; }

// main.js
import { add } from "./math.js";
console.log(add(2, 3));`,
    missionStory: "Бібліотека замку розкладає закляття по полицях: окремий модуль відповідає лише за збереження журналу.",
    worldEvent: "Бібліотеку замку впорядковано за модулями.",
    taskType: "fix-code",
    prompt: "Файл `main.js` (лише для читання) імпортує `saveTasks` і `loadTasks` з `storage.js`, але `storage.js` нічого не експортує. Додай експорт цих двох функцій. Ключ `STORAGE_KEY` має лишитися приватним. Нової логіки не додавай.",
    criteria: "поведінка збережена, немає помилок шляхів; ти пояснюєш відповідальність кожного модуля.",
    module: true,
    exports: ["saveTasks", "loadTasks"],
    fileName: "storage.js",
    readonlyFiles: [{ name: "main.js", code: `import { saveTasks, loadTasks } from "./storage.js";

const tasks = loadTasks();
tasks.push({ id: tasks.length + 1, title: "Модулі", minutes: 30, done: false });
saveTasks(tasks);` }],
    starterCode: `const STORAGE_KEY = "tasks";

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}`,
    testCases: [
      { name: "Обидві функції експортовано", check(ctx) { const ok = ctx.moduleExports.includes("saveTasks") && ctx.moduleExports.includes("loadTasks"); return { pass: ok, actual: ctx.show(ctx.moduleExports), expected: "[\"saveTasks\", \"loadTasks\"]" }; } },
      { name: "Збереження й читання працюють", check(ctx) { const exported = ctx.moduleExports.includes("saveTasks") && ctx.moduleExports.includes("loadTasks"); if (exported) ctx.get("saveTasks")([{ id: 1, title: "Модулі" }]); const v = exported ? ctx.get("loadTasks")() : null; return { pass: exported && ctx.equal(v, [{ id: 1, title: "Модулі" }]), actual: exported ? ctx.show(v) : "не експортовано", expected: "[{ id: 1, title: \"Модулі\" }]" }; } },
      { name: "STORAGE_KEY лишився приватним", check(ctx) { const leaked = ctx.moduleExports.includes("STORAGE_KEY"); return { pass: !leaked, actual: leaked ? "експортовано" : "приватний", expected: "приватний" }; } },
    ],
    solution: `const STORAGE_KEY = "tasks";

export function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}`,
    hint: "Допиши `export` перед `function saveTasks` і `function loadTasks`. Константу не чіпай.",
    difficulty: 1,
  }),
  jsqLevel(14, {
    id: 96,
    title: "Фінальний проєкт — приймання трекера",
    concept: "Фінал — приймання вже зібраного трекера. Де живе **стан**? У масиві `tasks`, а `localStorage` — його копія між сесіями. Потік додавання: подія `submit` → валідація → новий об'єкт у масиві → `saveTasks()` → `renderTasks()`. Приклади з сервера йдуть в окремий блок і власних записів не чіпають. Добре зібраний код дозволяє змінити вимогу в одному місці.",
    example: `// зміна вимоги в одному місці:
const MAX_MINUTES = 180;
// ...
if (minutes > MAX_MINUTES) { /* помилка з \${MAX_MINUTES} у тексті */ }`,
    missionStory: "Тронна зала Замку фіналу. Король приймає твій навчальний трекер і просить одну зміну: заняття бувають до чотирьох годин.",
    worldEvent: "Відбудовано замок — королівство врятоване!",
    taskType: "fix-code",
    prompt: "Трекер уже зібраний з усіх попередніх частин. Обов'язкова зміна вимоги: максимальна тривалість — **240** хв замість 180 (і в перевірці, і в повідомленні `Тривалість — від 1 до 240 хв`). Після зміни трекер має пройти всі сценарії приймання. Друга зміна — формат підсумку — додаткова: вона в блоці «Зміна умови» після проходження.",
    criteria: "усі сценарії приймання виконано: перший запуск, неправильна форма, додавання двох записів, виконання одного, видалення іншого, перезавантаження, успішне й невдале завантаження прикладів; власні записи не губляться.",
    exports: ["tasks"],
    fileName: "tracker.js",
    html: `<main class="tracker">
  <h1>Навчальний трекер</h1>
  <form id="task-form">
    <input id="task-title" placeholder="Назва">
    <p id="title-error" class="error"></p>
    <input id="task-minutes" type="number" placeholder="Хвилини">
    <p id="minutes-error" class="error"></p>
    <button type="submit">Додати</button>
  </form>
  <p id="summary"></p>
  <ul id="task-list"></ul>
  <section>
    <button id="load-examples" type="button">Завантажити приклади</button>
    <p id="examples-status"></p>
    <ul id="examples"></ul>
  </section>
</main>`,
    starterCode: `const STORAGE_KEY = "tasks";
const MAX_MINUTES = 180;

/* ---------- стан і збереження ---------- */
function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

const tasks = loadTasks();
let nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* ---------- рендер ---------- */
function createTaskElement(task) {
  const card = document.createElement("li");
  card.classList.add("task-card");
  card.classList.toggle("is-done", task.done);
  card.dataset.id = task.id;

  const title = document.createElement("span");
  title.textContent = \`\${task.title} (\${task.minutes} хв)\`;

  const doneButton = document.createElement("button");
  doneButton.classList.add("done-btn");
  doneButton.dataset.id = task.id;
  doneButton.textContent = task.done ? "Скасувати" : "Виконано";

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-btn");
  deleteButton.dataset.id = task.id;
  deleteButton.textContent = "Видалити";

  card.append(title, doneButton, deleteButton);
  return card;
}

function renderTasks() {
  const list = document.querySelector("#task-list");
  list.textContent = "";
  list.append(...tasks.map(createTaskElement));
  const minutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  document.querySelector("#summary").textContent = \`Завдань: \${tasks.length}, хвилин: \${minutes}\`;
}

/* ---------- форма ---------- */
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const minutesInput = document.querySelector("#task-minutes");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const rawMinutes = minutesInput.value.trim();
  const minutes = Number(rawMinutes);

  const titleError = title ? "" : "Введи назву завдання";
  let minutesError = "";
  if (rawMinutes === "") minutesError = "Вкажи тривалість";
  else if (!Number.isFinite(minutes) || minutes < 1 || minutes > 180) minutesError = "Тривалість — від 1 до 180 хв";

  document.querySelector("#title-error").textContent = titleError;
  document.querySelector("#minutes-error").textContent = minutesError;
  if (titleError || minutesError) return;

  tasks.push({ id: nextId, title, minutes, done: false });
  nextId = nextId + 1;
  saveTasks();
  renderTasks();
  form.reset();
});

/* ---------- виконання й видалення (делегування) ---------- */
document.querySelector("#task-list").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const id = Number(button.dataset.id);
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return;
  if (button.classList.contains("done-btn")) tasks[index].done = !tasks[index].done;
  if (button.classList.contains("delete-btn")) tasks.splice(index, 1);
  saveTasks();
  renderTasks();
});

/* ---------- приклади з сервера ---------- */
const loadButton = document.querySelector("#load-examples");
const examplesStatus = document.querySelector("#examples-status");

async function loadExamples() {
  loadButton.disabled = true;
  examplesStatus.textContent = "Завантаження…";
  try {
    const response = await fetch("/data/tasks.json");
    if (!response.ok) throw new Error(\`Сервер відповів \${response.status}\`);
    const examples = await response.json();
    if (!Array.isArray(examples)) throw new Error("Очікували список завдань");
    const list = document.querySelector("#examples");
    list.textContent = "";
    examples.forEach((example) => {
      const item = document.createElement("li");
      item.textContent = example.title;
      list.appendChild(item);
    });
    examplesStatus.textContent = "";
  } catch (error) {
    examplesStatus.textContent = "Не вдалося завантажити приклади. Спробуй ще раз.";
  } finally {
    loadButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadExamples);

renderTasks();`,
    testCases: [
      { name: "Перший запуск без записів", check(ctx) { const n = ctx.$$(".task-card").length, t = ctx.get("tasks").length; return { pass: n === 0 && t === 0, actual: n + " карток, " + t + " записів", expected: "0 карток, 0 записів" }; } },
      {
        name: "Неправильна форма не додає записів",
        check(ctx) {
          const f = ctx.$("#task-form");
          ctx.fire(f, "submit");
          const empty = [jsqText(ctx, "#title-error"), jsqText(ctx, "#minutes-error")];
          ctx.$("#task-title").value = "Масиви"; ctx.$("#task-minutes").value = "241"; ctx.fire(f, "submit");
          const over = jsqText(ctx, "#minutes-error");
          const ok = empty[0] === "Введи назву завдання" && empty[1] === "Вкажи тривалість" && over === "Тривалість — від 1 до 240 хв" && ctx.get("tasks").length === 0;
          return { pass: ok, actual: ctx.show([empty[0], empty[1], over]), expected: "[\"Введи назву завдання\", \"Вкажи тривалість\", \"Тривалість — від 1 до 240 хв\"]" };
        },
      },
      {
        name: "Межі: назва з пробілів, -5 і 0 відхилено; 1 і 240 прийнято й одразу збережено",
        check(ctx) {
          const f = ctx.$("#task-form");
          const send = (t, m) => { ctx.$("#task-title").value = t; ctx.$("#task-minutes").value = m; return ctx.fire(f, "submit"); };
          send("   ", "30"); send("DOM", "-5"); send("DOM", "0");
          const rejected = ctx.get("tasks").length;
          send("Масиви", "1");
          const e = send("DOM", "240");
          const minutes = ctx.get("tasks").map((t) => t.minutes);
          const shown = ctx.$$(".task-card").length;
          const summary = jsqText(ctx, "#summary");
          const summaryOk = /(^|\D)2(\D|$)/.test(summary) && /(^|\D)241(\D|$)/.test(summary);
          ctx.reload();
          const saved = ctx.$$(".task-card").length;
          const ok = rejected === 0 && ctx.equal(minutes, [1, 240]) && shown === 2 && summaryOk && saved === 2 && e.defaultPrevented;
          return { pass: ok, actual: ctx.show({ rejected, minutes, shown, summary, saved, preventDefault: e.defaultPrevented }), expected: "відхилено 0 записів, minutes [1, 240], 2 картки, у підсумку 2 і 241 хв, після перезавантаження 2 картки" };
        },
      },
      {
        name: "Два записи, виконання одного, видалення іншого, перезавантаження",
        check(ctx) {
          const f = ctx.$("#task-form");
          const cards = () => ctx.$$(".task-card").map((c) => c.dataset.id + (c.classList.contains("is-done") ? "✓" : ""));
          ctx.$("#task-title").value = "Масиви"; ctx.$("#task-minutes").value = "200"; ctx.fire(f, "submit");
          ctx.$("#task-title").value = "DOM"; ctx.$("#task-minutes").value = "30"; ctx.fire(f, "submit");
          const afterAdd = ctx.get("tasks").map((t) => t.minutes);
          ctx.fire(ctx.$('.done-btn[data-id="1"]'), "click");
          const afterDone = cards();
          ctx.fire(ctx.$('.delete-btn[data-id="2"]'), "click");
          const afterDelete = cards();
          ctx.reload();
          const afterReload = cards();
          const left = ctx.get("tasks").map((t) => t.title + (t.done ? " ✓" : ""));
          const got = [afterAdd, afterDone, afterDelete, afterReload, left];
          const exp = [[200, 30], ["1✓", "2"], ["1✓"], ["1✓"], ["Масиви ✓"]];
          return { pass: ctx.equal(got, exp), actual: ctx.show(got), expected: ctx.show(exp) };
        },
      },
      {
        name: "Успішне завантаження прикладів не чіпає власних записів",
        fetch: { data: [{ title: "Повторити цикли" }, { title: "Пройти DOM" }] },
        storage: { tasks: "[{\"id\":1,\"title\":\"Моє\",\"minutes\":30,\"done\":false}]" },
        async check(ctx) {
          ctx.fire(ctx.$("#load-examples"), "click");
          await ctx.sleep(80);
          ctx.fire(ctx.$("#load-examples"), "click");
          await ctx.sleep(80);
          const ex = ctx.$$("#examples li").map((li) => li.textContent);
          const own = ctx.$$(".task-card").length;
          const s = jsqText(ctx, "#examples-status");
          return { pass: ctx.equal(ex, ["Повторити цикли", "Пройти DOM"]) && own === 1 && s !== "Завантаження…", actual: ctx.show(ex) + ", власних " + own + ", статус " + ctx.show(s), expected: "два приклади (повторне завантаження не дублює), власних 1, статус «Завантаження…» прибрано" };
        },
      },
      {
        name: "Невдале завантаження: повідомлення й можливість повторити",
        fetch: { fail: true },
        async check(ctx) {
          ctx.fire(ctx.$("#load-examples"), "click");
          await ctx.sleep(80);
          const s = jsqText(ctx, "#examples-status");
          const enabled = !ctx.$("#load-examples").disabled;
          return { pass: s === "Не вдалося завантажити приклади. Спробуй ще раз." && enabled, actual: ctx.show(s) + ", кнопка " + (enabled ? "активна" : "вимкнена"), expected: "повідомлення про помилку, кнопка активна" };
        },
      },
    ],
    codeChecks: [{ re: /MAX_MINUTES\s*=\s*240/, label: "Межа тривалості — 240 хв" }],
    solution: `const STORAGE_KEY = "tasks";
const MAX_MINUTES = 240;

/* ---------- стан і збереження ---------- */
function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

const tasks = loadTasks();
let nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/* ---------- рендер ---------- */
function createTaskElement(task) {
  const card = document.createElement("li");
  card.classList.add("task-card");
  card.classList.toggle("is-done", task.done);
  card.dataset.id = task.id;

  const title = document.createElement("span");
  title.textContent = \`\${task.title} (\${task.minutes} хв)\`;

  const doneButton = document.createElement("button");
  doneButton.classList.add("done-btn");
  doneButton.dataset.id = task.id;
  doneButton.textContent = task.done ? "Скасувати" : "Виконано";

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-btn");
  deleteButton.dataset.id = task.id;
  deleteButton.textContent = "Видалити";

  card.append(title, doneButton, deleteButton);
  return card;
}

function renderTasks() {
  const list = document.querySelector("#task-list");
  list.textContent = "";
  list.append(...tasks.map(createTaskElement));
  const minutes = tasks.reduce((sum, task) => sum + task.minutes, 0);
  document.querySelector("#summary").textContent = \`Завдань: \${tasks.length}, хвилин: \${minutes}\`;
}

/* ---------- форма ---------- */
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const minutesInput = document.querySelector("#task-minutes");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const rawMinutes = minutesInput.value.trim();
  const minutes = Number(rawMinutes);

  const titleError = title ? "" : "Введи назву завдання";
  let minutesError = "";
  if (rawMinutes === "") minutesError = "Вкажи тривалість";
  else if (!Number.isFinite(minutes) || minutes < 1 || minutes > MAX_MINUTES) minutesError = \`Тривалість — від 1 до \${MAX_MINUTES} хв\`;

  document.querySelector("#title-error").textContent = titleError;
  document.querySelector("#minutes-error").textContent = minutesError;
  if (titleError || minutesError) return;

  tasks.push({ id: nextId, title, minutes, done: false });
  nextId = nextId + 1;
  saveTasks();
  renderTasks();
  form.reset();
});

/* ---------- виконання й видалення (делегування) ---------- */
document.querySelector("#task-list").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const id = Number(button.dataset.id);
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) return;
  if (button.classList.contains("done-btn")) tasks[index].done = !tasks[index].done;
  if (button.classList.contains("delete-btn")) tasks.splice(index, 1);
  saveTasks();
  renderTasks();
});

/* ---------- приклади з сервера ---------- */
const loadButton = document.querySelector("#load-examples");
const examplesStatus = document.querySelector("#examples-status");

async function loadExamples() {
  loadButton.disabled = true;
  examplesStatus.textContent = "Завантаження…";
  try {
    const response = await fetch("/data/tasks.json");
    if (!response.ok) throw new Error(\`Сервер відповів \${response.status}\`);
    const examples = await response.json();
    if (!Array.isArray(examples)) throw new Error("Очікували список завдань");
    const list = document.querySelector("#examples");
    list.textContent = "";
    examples.forEach((example) => {
      const item = document.createElement("li");
      item.textContent = example.title;
      list.appendChild(item);
    });
    examplesStatus.textContent = "";
  } catch (error) {
    examplesStatus.textContent = "Не вдалося завантажити приклади. Спробуй ще раз.";
  } finally {
    loadButton.disabled = false;
  }
}

loadButton.addEventListener("click", loadExamples);

renderTasks();`,
    hint: "Межа вже винесена в константу `MAX_MINUTES` — зміни її значення й використай константу і в перевірці, і в тексті повідомлення.",
    difficulty: 3,
  }),
];

// Реєстрація світу JavaScript у загальному реєстрі світів (див. worlds.js).
window.WORLD_DATA = window.WORLD_DATA || {};
window.WORLD_DATA.js = {
  locations: window.LOCATIONS,
  levels: window.LEVELS,
  // Завдання переписано під план «96 рівнів із ментором»: теми й номери ті самі,
  // тож пройдене зберігається, а старі чернетки коду прибираються (див. game.js).
  draftVersion: 2,
  // Великі практичні місії для розділу «Проєкти».
  projects: [61, 68, 75, 79, 96],
};
