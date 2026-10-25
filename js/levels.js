/* =========================================================
   levels.js — дані гри: 11 локацій і 96 рівнів.

   Схема рівня — як у SPEC.md, плюс кілька службових полів,
   без яких неможливо автоматично перевірити відповідь:
     code         — фрагмент коду для показу в predict-output / multiple-choice
                    (у SPEC.md для них starterCode = null, тож код тримаємо окремо)
     expectedAnswer — для predict-output це МАСИВ рядків: по одному на кожен
                    console.log, щоб гравець вводив вивід построково
     functionName — функція, яку викликають testCases з input/expectedOutput
     exports      — додаткові імена, які checker дістає з коду гравця
     html         — розмітка пісочниці для DOM-завдань (показується гравцю)
     codeChecks   — вимоги до самого коду (наприклад, «використано template literal»);
                    вони ж стають пунктами чеклиста на екрані місії
     testCases[].check(ctx) — довільна перевірка для DOM / async / localStorage
     solution     — еталонне рішення; tests/run.html проганяє його через checker
   ========================================================= */

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

window.LEVELS = [
  /* ───────────── Арка I — Змінні, типи, оператори → Табір змінних ───────────── */
  {
    id: 1,
    arc: "Змінні, типи, оператори",
    arcNumber: 1,
    locationName: "Табір змінних",
    title: "let vs const",
    concept: "`let` оголошує змінну, значення якої можна змінити пізніше. `const` створює змінну, яку не можна переприсвоїти. Правило сучасного JS: пиши `const` за замовчуванням, а `let` — лише тоді, коли значення справді змінюватиметься. Старий `var` у новому коді не потрібен.",
    example: `const heroName = "Аліса"; // ім'я не зміниться
let health = 100;         // здоров'я зміниться
health = health - 10;     // ✓ можна
// heroName = "Боб";      // ✗ TypeError: Assignment to constant variable.`,
    missionStory: "Ти прибуваєш на порожню галявину, де колись стояв табір. Щоб почати відбудову, треба правильно записати запаси в похідний журнал.",
    worldEvent: "У таборі спалахнуло перше вогнище.",
    taskType: "multiple-choice",
    prompt: "Кількість дров у таборі змінюватиметься щовечора, а назва табору «Світанок» не зміниться ніколи. Який варіант оголошення правильний?",
    starterCode: null,
    code: null,
    options: [
      `let woodCount = 10;\nconst campName = "Світанок";`,
      `const woodCount = 10;\nconst campName = "Світанок";`,
      `const woodCount = 10;\nlet campName = "Світанок";`,
      `var woodCount = 10;\nvar campName = "Світанок";`,
    ],
    expectedAnswer: `let woodCount = 10;\nconst campName = "Світанок";`,
    hint: "Запитай себе про кожне значення: чи буде воно змінюватися? Якщо так — `let`, якщо ні — `const`.",
    difficulty: 1,
  },
  {
    id: 2,
    arc: "Змінні, типи, оператори",
    arcNumber: 1,
    locationName: "Табір змінних",
    title: "Типи даних",
    concept: "Кожне значення в JS має тип: `number`, `string`, `boolean`, `undefined`, `null`, `bigint`, `symbol` — це примітиви, а ще є `object` (об'єкти, масиви). Оператор `typeof` повертає назву типу у вигляді рядка. Для функцій він повертає `\"function\"`.",
    example: `typeof 3.14      // "number"
typeof "привіт"  // "string"
typeof [1, 2]    // "object" — масив теж об'єкт
typeof function () {} // "function"`,
    missionStory: "Скриня з припасами перемішалась. Інтендант табору просить розкласти речі за типами — але спершу треба зрозуміти, де що.",
    worldEvent: "Припаси розкладено по ящиках з написами.",
    taskType: "predict-output",
    prompt: "Що виведе кожен рядок `console.log`? Впиши результат для кожного рядка.",
    starterCode: null,
    code: `console.log(typeof 42);
console.log(typeof "42");
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof null);`,
    expectedAnswer: ["number", "string", "boolean", "undefined", "object"],
    hint: "`typeof` завжди повертає рядок з назвою типу. Лапки навколо числа роблять його рядком. А з `null` пов'язана відома історична пастка мови — його тип зовсім не \"null\".",
    difficulty: 1,
  },
  {
    id: 3,
    arc: "Змінні, типи, оператори",
    arcNumber: 1,
    locationName: "Табір змінних",
    title: "typeof",
    concept: "`typeof` — це оператор, а не функція, тому дужки після нього не обов'язкові: `typeof value` і `typeof(value)` працюють однаково. Його часто використовують, щоб перевірити тип перед роботою зі значенням.",
    example: `const gold = 50;
if (typeof gold === "number") {
  console.log("Можна рахувати золото");
}`,
    missionStory: "Скарбник табору підписує кожну знахідку. Йому бракує одного слова в магічній формулі, що визначає тип речі.",
    worldEvent: "На складі з'явились акуратні таблички з типами.",
    taskType: "fill-blank",
    prompt: "Встав пропущений оператор, щоб консоль вивела тип значення змінної `loot` (рядок \"string\").",
    starterCode: `const loot = "золота монета";
console.log(___ loot); // "string"`,
    expectedAnswer: [["typeof"]],
    hint: "Потрібен оператор, який повертає назву типу. Він складається з двох англійських слів, написаних разом: type + of.",
    difficulty: 1,
  },
  {
    id: 4,
    arc: "Змінні, типи, оператори",
    arcNumber: 1,
    locationName: "Табір змінних",
    title: "Приведення типів (+)",
    concept: "Оператор `+` має дві ролі: додає числа і склеює рядки. Якщо хоча б один операнд — рядок, інший перетворюється на рядок, і відбувається склеювання (конкатенація). `true` у числовому контексті дорівнює `1`.",
    example: `10 + 5      // 15
"10" + 5    // "105"
"Рівень " + 3 // "Рівень 3"`,
    missionStory: "Новобранець рахує стріли, але в нього виходять дивні числа. Допоможи зрозуміти, що саме рахує магічний «+».",
    worldEvent: "Біля намету з'явилась стійка з рівно порахованими стрілами.",
    taskType: "predict-output",
    prompt: "Передбач, що виведе кожен рядок. Рядки в консолі виводяться без лапок.",
    starterCode: null,
    code: `console.log("5" + 3);
console.log("a" + 1);
console.log(5 + 3);
console.log("5" + "3");
console.log(true + 1);`,
    expectedAnswer: ["53", "a1", "8", "53", "2"],
    hint: "Якщо поруч із `+` стоїть рядок — відбувається склеювання. Якщо обидва операнди не рядки — звичайне додавання (і `true` стає 1).",
    difficulty: 1,
  },
  {
    id: 5,
    arc: "Змінні, типи, оператори",
    arcNumber: 1,
    locationName: "Табір змінних",
    title: "Приведення типів (-, *, /)",
    concept: "На відміну від `+`, оператори `-`, `*` і `/` працюють лише з числами. Тому рядки автоматично перетворюються на числа. Якщо рядок не схожий на число, результат — `NaN` (Not a Number).",
    example: `"8" - 3    // 5
"4" * "2"  // 8
"сім" * 2  // NaN`,
    missionStory: "Кухар табору ділить казанки каші між загонами, але записи в нього — рядками. Чи порахує магія правильно?",
    worldEvent: "Кожен загін отримав свою порцію каші.",
    taskType: "predict-output",
    prompt: "Що виведе кожен рядок `console.log`?",
    starterCode: null,
    code: `console.log("10" - 2);
console.log("3" * "2");
console.log("20" / "4");
console.log("6" - "x");
console.log("4" * true);`,
    expectedAnswer: ["8", "6", "5", "NaN", "4"],
    hint: "Ці оператори перетворюють обидва операнди на числа. Рядок \"x\" числом стати не може.",
    difficulty: 1,
  },
  {
    id: 6,
    arc: "Змінні, типи, оператори",
    arcNumber: 1,
    locationName: "Табір змінних",
    title: "Template literals",
    concept: "Шаблонні рядки пишуться у зворотних лапках `` ` `` і дозволяють вставляти значення через `${...}`. Це читабельніше за склеювання через `+` і підтримує багаторядковий текст.",
    example: `const name = "Аліса";
const gold = 30;
const msg = \`\${name} має \${gold} монет\`;
// "Аліса має 30 монет"`,
    missionStory: "Глашатай табору вітає кожного мандрівника, але його промова склеєна з клаптиків. Перепиши її єдиним шаблонним рядком.",
    worldEvent: "Над входом у табір з'явилась гарна вивіска з привітанням.",
    taskType: "fix-code",
    prompt: "Функція `greet` працює, але склеює рядок через `+`. Перепиши повернення на template literal, щоб у коді не лишилось склеювання рядків.",
    functionName: "greet",
    starterCode: `function greet(name, level) {
  return "Вітаю, " + name + "! Твій рівень: " + level + ".";
}`,
    testCases: [
      { input: ["Аліса", 3], expectedOutput: "Вітаю, Аліса! Твій рівень: 3." },
      { input: ["Тарас", 10], expectedOutput: "Вітаю, Тарас! Твій рівень: 10." },
    ],
    codeChecks: [
      { re: /`[^`]*\$\{[^}]+\}[^`]*`/, label: "Використано template literal з ${...}" },
      { re: /["'`]\s*\+|\+\s*["'`]/, not: true, label: "Немає склеювання рядків через +" },
    ],
    solution: `function greet(name, level) {
  return \`Вітаю, \${name}! Твій рівень: \${level}.\`;
}`,
    hint: "Візьми весь текст у зворотні лапки `` ` ``, а змінні встав як `${name}` і `${level}`.",
    difficulty: 1,
  },
  {
    id: 7,
    arc: "Змінні, типи, оператори",
    arcNumber: 1,
    locationName: "Табір змінних",
    title: "Truthy / Falsy",
    concept: "В умовах (`if`, `while`, `&&`, `||`) будь-яке значення перетворюється на `true` або `false`. Falsy-значень рівно вісім: `false`, `0`, `-0`, `0n`, `\"\"`, `null`, `undefined`, `NaN`. Усе інше — truthy, навіть `\"0\"`, `\"false\"`, `[]` і `{}`.",
    example: `if ("") { /* не виконається */ }
if ("0") { console.log("рядок \\"0\\" — truthy!"); }
if ([]) { console.log("порожній масив — теж truthy"); }`,
    missionStory: "Вартовий пропускає в табір лише «правдиві» слова. Допоможи йому відсіяти фальшиві.",
    worldEvent: "Біля воріт табору став пильний вартовий.",
    taskType: "multiple-choice",
    prompt: "У якому рядку ВСІ значення falsy?",
    starterCode: null,
    code: null,
    options: [
      `0, "", null, undefined, NaN`,
      `0, "0", null, false`,
      `[], {}, "", 0`,
      `false, "false", undefined`,
    ],
    expectedAnswer: `0, "", null, undefined, NaN`,
    hint: "Будь-який непорожній рядок — truthy (навіть \"0\" чи \"false\"). Порожні масив і об'єкт — теж truthy.",
    difficulty: 1,
  },
  {
    id: 8,
    arc: "Змінні, типи, оператори",
    arcNumber: 1,
    locationName: "Табір змінних",
    title: "=== vs ==",
    concept: "`===` (строга рівність) порівнює і значення, і тип — без перетворень. `==` (нестрога) спочатку намагається привести операнди до спільного типу, через що виникають сюрпризи. У сучасному коді майже завжди використовують `===`.",
    example: `1 === 1     // true
1 === "1"   // false — різні типи
1 == "1"    // true — рядок перетворено на число`,
    missionStory: "Два вартові сперечаються, чи однакові їхні ключі. Один перевіряє суворо, інший — «на око».",
    worldEvent: "Вартові помирились і поставили спільну варту.",
    taskType: "predict-output",
    prompt: "Що виведе кожен рядок?",
    starterCode: null,
    code: `console.log(5 == "5");
console.log(5 === "5");
console.log(0 == false);
console.log(0 === false);
console.log(null == undefined);`,
    expectedAnswer: ["true", "false", "true", "false", "true"],
    hint: "`===` повертає false, щойно типи різні. `==` перетворює типи: `false` стає 0, \"5\" стає 5, а `null` і `undefined` за правилами мови рівні лише одне одному.",
    difficulty: 2,
  },
  {
    id: 9,
    arc: "Змінні, типи, оператори",
    arcNumber: 1,
    locationName: "Табір змінних",
    title: "Тернарний оператор",
    concept: "Тернарний оператор `умова ? значенняЯкщоТак : значенняЯкщоНі` — це короткий `if/else`, який повертає значення. Він ідеальний, коли треба обрати одне з двох значень в один рядок.",
    example: `const hp = 0;
const status = hp > 0 ? "живий" : "переможений";
// "переможений"`,
    missionStory: "Біля тренувальної арени табору стоїть наставник. Він пускає на арену лише тих, кому вже виповнилось 16.",
    worldEvent: "Відкрилась тренувальна арена табору.",
    taskType: "write-function",
    prompt: "Напиши функцію `checkAge(age)`, яка повертає `\"Проходь\"`, якщо `age` більше або дорівнює 16, інакше — `\"Ще зарано\"`. Використай тернарний оператор, без `if`.",
    functionName: "checkAge",
    starterCode: `function checkAge(age) {
  // поверни "Проходь" або "Ще зарано" через ? :
}`,
    testCases: [
      { input: [20], expectedOutput: "Проходь" },
      { input: [16], expectedOutput: "Проходь" },
      { input: [15], expectedOutput: "Ще зарано" },
      { input: [7], expectedOutput: "Ще зарано" },
    ],
    codeChecks: [
      { re: /\?[^:;]+:/, label: "Використано тернарний оператор ? :" },
      { re: /\bif\s*\(/, not: true, label: "Обійшлися без if" },
    ],
    solution: `function checkAge(age) {
  return age >= 16 ? "Проходь" : "Ще зарано";
}`,
    hint: "Шаблон: `return умова ? \"так\" : \"ні\";` Умова тут — `age >= 16`.",
    difficulty: 1,
  },
  {
    id: 10,
    arc: "Змінні, типи, оператори",
    arcNumber: 1,
    locationName: "Табір змінних",
    title: "Логічні оператори",
    concept: "`&&` (І) повертає true, лише якщо обидві частини істинні. `||` (АБО) — якщо істинна хоча б одна. `!` (НЕ) інвертує значення. Дужки допомагають згрупувати умови й зробити їх читабельними.",
    example: `const hasSword = true;
const isTired = false;
const canFight = hasSword && !isTired; // true
const canRest = isTired || !hasSword;  // false`,
    missionStory: "Табір відбудовано, тепер потрібні правила входу. Варта пускає мандрівника з перепусткою, якщо він без зброї. Капітана пускають завжди.",
    worldEvent: "Табір облаштовано, а в скрині знайшлись перші інструменти!",
    taskType: "write-function",
    prompt: "Напиши функцію `canEnterCamp(hasPass, isArmed, isCaptain)`. Вона повертає `true`, якщо (є перепустка І мандрівник НЕ озброєний) АБО він капітан. В інших випадках — `false`.",
    functionName: "canEnterCamp",
    starterCode: `function canEnterCamp(hasPass, isArmed, isCaptain) {
  // використай &&, || та !
}`,
    testCases: [
      { input: [true, false, false], expectedOutput: true },
      { input: [true, true, false], expectedOutput: false },
      { input: [false, false, false], expectedOutput: false },
      { input: [false, true, true], expectedOutput: true },
      { input: [false, false, true], expectedOutput: true },
    ],
    codeChecks: [
      { re: /&&/, label: "Використано &&" },
      { re: /\|\|/, label: "Використано ||" },
      { re: /!\s*[\w(]/, label: "Використано !" },
    ],
    solution: `function canEnterCamp(hasPass, isArmed, isCaptain) {
  return (hasPass && !isArmed) || isCaptain;
}`,
    hint: "Збери умову частинами: `(hasPass && !isArmed)` — це звичайний мандрівник. Потім додай `|| isCaptain`.",
    difficulty: 2,
  },

  /* ───────────── Арка II — Умовні конструкції → Долина умов ───────────── */
  {
    id: 11,
    arc: "Умовні конструкції",
    arcNumber: 2,
    locationName: "Долина умов",
    title: "if / else",
    concept: "`if (умова) { ... } else { ... }` виконує перший блок, якщо умова truthy, інакше — другий. Це основний спосіб навчити програму приймати рішення.",
    example: `const torches = 3;
if (torches > 0) {
  console.log("Йдемо в темряву");
} else {
  console.log("Спершу знайди факел");
}`,
    missionStory: "Біля входу в долину стоїть кам'яний вартовий. Він відчиняє браму лише тим, хто знає пароль «світло».",
    worldEvent: "Кам'яний вартовий схилив голову і пропустив тебе.",
    taskType: "write-function",
    prompt: "Напиши функцію `openGate(password)`. Якщо `password` точно дорівнює `\"світло\"`, поверни `\"Брама відчиняється\"`, інакше — `\"Доступ заборонено\"`.",
    functionName: "openGate",
    starterCode: `function openGate(password) {

}`,
    testCases: [
      { input: ["світло"], expectedOutput: "Брама відчиняється" },
      { input: ["темрява"], expectedOutput: "Доступ заборонено" },
      { input: ["Світло"], expectedOutput: "Доступ заборонено" },
      { input: [""], expectedOutput: "Доступ заборонено" },
    ],
    codeChecks: [
      { re: /\bif\s*\(/, label: "Є умова if" },
      { re: /\belse\b/, label: "Є гілка else" },
    ],
    solution: `function openGate(password) {
  if (password === "світло") {
    return "Брама відчиняється";
  } else {
    return "Доступ заборонено";
  }
}`,
    hint: "Порівнюй строго: `password === \"світло\"`. Регістр літер має значення: \"Світло\" — це інший рядок.",
    difficulty: 1,
  },
  {
    id: 12,
    arc: "Умовні конструкції",
    arcNumber: 2,
    locationName: "Долина умов",
    title: "else if",
    concept: "Коли варіантів більше двох, використовують ланцюжок `if / else if / else`. Умови перевіряються згори донизу, і виконується лише перша гілка, що спрацювала, — тому порядок умов важливий.",
    example: `if (score >= 90) {
  grade = "A";
} else if (score >= 70) {
  grade = "B";
} else {
  grade = "C";
}`,
    missionStory: "Долину перетинає ріка з мінливою глибиною. Провідник має щоразу вирішувати, як переправитись.",
    worldEvent: "Через ріку натягнули мотузку для переправи.",
    taskType: "write-function",
    prompt: "Напиши функцію `crossRiver(depth)`: якщо глибина менша за 30 — поверни `\"Перейти вбрід\"`, якщо менша за 100 — `\"Потрібен пліт\"`, інакше — `\"Шукай міст\"`.",
    functionName: "crossRiver",
    starterCode: `function crossRiver(depth) {

}`,
    testCases: [
      { input: [10], expectedOutput: "Перейти вбрід" },
      { input: [29], expectedOutput: "Перейти вбрід" },
      { input: [30], expectedOutput: "Потрібен пліт" },
      { input: [99], expectedOutput: "Потрібен пліт" },
      { input: [100], expectedOutput: "Шукай міст" },
      { input: [250], expectedOutput: "Шукай міст" },
    ],
    codeChecks: [{ re: /else\s+if\s*\(/, label: "Використано else if" }],
    solution: `function crossRiver(depth) {
  if (depth < 30) {
    return "Перейти вбрід";
  } else if (depth < 100) {
    return "Потрібен пліт";
  } else {
    return "Шукай міст";
  }
}`,
    hint: "Три гілки: `if (depth < 30)`, потім `else if (depth < 100)`, потім `else`. Межові значення 30 і 100 уже не задовольняють «менше».",
    difficulty: 1,
  },
  {
    id: 13,
    arc: "Умовні конструкції",
    arcNumber: 2,
    locationName: "Долина умов",
    title: "Об'єднання умов",
    concept: "Вкладені `if` можна замінити однією умовою: `if (a) { if (b) {...} }` — це те саме, що `if (a && b)`. Кілька окремих `if`, які повертають однаковий результат, об'єднуються через `||`. Код стає коротшим і зрозумілішим.",
    example: `// замість
if (isDay) {
  if (hasMap) { go(); }
}
// пиши
if (isDay && hasMap) { go(); }`,
    missionStory: "Міст через ущелину охороняє плутаний наказ — сторожі гублять гілки умов. Спрости наказ до одного речення.",
    worldEvent: "Сторожа мосту отримала новий, зрозумілий наказ.",
    taskType: "fix-code",
    prompt: "Функція працює правильно, але заплутана. Перепиши її так, щоб лишилась одна умова (максимум один `if` або взагалі жодного) з `&&` та `||`. Логіка має лишитися тією самою.",
    functionName: "canPassBridge",
    starterCode: `function canPassBridge(hasTicket, isGuard, isNight) {
  if (hasTicket) {
    if (!isNight) {
      return true;
    }
  }
  if (isGuard) {
    return true;
  }
  return false;
}`,
    testCases: [
      { input: [true, false, false], expectedOutput: true },
      { input: [true, false, true], expectedOutput: false },
      { input: [false, true, true], expectedOutput: true },
      { input: [false, true, false], expectedOutput: true },
      { input: [false, false, false], expectedOutput: false },
      { input: [true, true, true], expectedOutput: true },
    ],
    codeChecks: [
      { re: /\bif\b[\s\S]*\bif\b/, not: true, label: "Не більше одного if" },
      { re: /&&/, label: "Використано &&" },
      { re: /\|\|/, label: "Використано ||" },
    ],
    solution: `function canPassBridge(hasTicket, isGuard, isNight) {
  return (hasTicket && !isNight) || isGuard;
}`,
    hint: "Перший вкладений блок — це `hasTicket && !isNight`. Другий `if` додається через `||`. Можна одразу повернути результат: `return (...) || isGuard;`",
    difficulty: 2,
  },
  {
    id: 14,
    arc: "Умовні конструкції",
    arcNumber: 2,
    locationName: "Долина умов",
    title: "switch / case / break",
    concept: "`switch` порівнює одне значення з кількома варіантами `case` (через строгу рівність `===`). Без `break` (або `return`) виконання «провалюється» в наступний `case` — це часте джерело помилок.",
    example: `switch (direction) {
  case "north":
    move = "↑";
    break;
  case "south":
    move = "↓";
    break;
}`,
    missionStory: "Мудрець долини навчає стихійним заклинанням. Кожна стихія має своє закляття — допоможи йому скласти довідник.",
    worldEvent: "У долині засвітились камені чотирьох стихій.",
    taskType: "write-function",
    prompt: "Напиши функцію `getSpell(element)` через `switch`: `\"fire\"` → `\"Вогняна куля\"`, `\"water\"` → `\"Хвиля\"`, `\"earth\"` → `\"Кам'яна стіна\"`.",
    functionName: "getSpell",
    starterCode: `function getSpell(element) {
  switch (element) {
    // додай case для fire, water, earth
  }
}`,
    testCases: [
      { input: ["fire"], expectedOutput: "Вогняна куля" },
      { input: ["water"], expectedOutput: "Хвиля" },
      { input: ["earth"], expectedOutput: "Кам'яна стіна" },
    ],
    codeChecks: [
      { re: /switch\s*\(/, label: "Використано switch" },
      { re: /case[\s\S]*case[\s\S]*case/, label: "Є щонайменше три case" },
    ],
    solution: `function getSpell(element) {
  switch (element) {
    case "fire":
      return "Вогняна куля";
    case "water":
      return "Хвиля";
    case "earth":
      return "Кам'яна стіна";
  }
}`,
    hint: "Усередині кожного `case` можна одразу писати `return \"...\";` — тоді `break` не потрібен, бо функція завершується.",
    difficulty: 1,
  },
  {
    id: 15,
    arc: "Умовні конструкції",
    arcNumber: 2,
    locationName: "Долина умов",
    title: "default у switch",
    concept: "Гілка `default` у `switch` виконується, коли жоден `case` не збігся — як `else` у ланцюжку `if`. Без неї функція може повернути `undefined` для непередбачених значень.",
    example: `switch (cmd) {
  case "go": return "Йдемо";
  default:   return "Невідома команда";
}`,
    missionStory: "Мисливець долини веде облік здобичі з монстрів. Але коли трапляється невідомий монстр, у журналі з'являється дивне «undefined».",
    worldEvent: "Журнал мисливця більше не має порожніх записів.",
    taskType: "fix-code",
    prompt: "Для невідомого монстра функція повертає `undefined`. Додай гілку `default`, щоб у такому випадку поверталось `\"нічого\"`.",
    functionName: "getMonsterLoot",
    starterCode: `function getMonsterLoot(monster) {
  let loot;
  switch (monster) {
    case "slime":
      loot = "слиз";
      break;
    case "goblin":
      loot = "монета";
      break;
  }
  return loot;
}`,
    testCases: [
      { input: ["slime"], expectedOutput: "слиз" },
      { input: ["goblin"], expectedOutput: "монета" },
      { input: ["dragon"], expectedOutput: "нічого" },
      { input: [""], expectedOutput: "нічого" },
    ],
    codeChecks: [{ re: /default\s*:/, label: "Додано default" }],
    solution: `function getMonsterLoot(monster) {
  let loot;
  switch (monster) {
    case "slime":
      loot = "слиз";
      break;
    case "goblin":
      loot = "монета";
      break;
    default:
      loot = "нічого";
  }
  return loot;
}`,
    hint: "Після останнього `case` додай `default:` і присвой `loot = \"нічого\";`.",
    difficulty: 1,
  },
  {
    id: 16,
    arc: "Умовні конструкції",
    arcNumber: 2,
    locationName: "Долина умов",
    title: "Ранній return",
    concept: "Ранній `return` (guard clause) негайно завершує функцію, якщо умова не виконана. Так основна логіка не виконується з некоректними даними, а код позбавляється зайвих `else`.",
    example: `function attack(stamina) {
  if (stamina <= 0) {
    return "Немає сил";  // далі не йдемо
  }
  return "Атака!";
}`,
    missionStory: "Торговець зіллям біля брами долини сварить покупців за брак золота — але все одно забирає гроші! Гаманці йдуть у мінус.",
    worldEvent: "Брама в долину відчинена! Торговець тепер чесний.",
    taskType: "fix-code",
    prompt: "Якщо золота замало, функція пише попередження, але все одно віднімає ціну. Виправ її: при нестачі золота треба одразу повернути `gold` без змін.",
    functionName: "buyPotion",
    starterCode: `function buyPotion(gold, price) {
  if (gold < price) {
    console.log("Недостатньо золота!");
  }
  gold = gold - price;
  return gold;
}`,
    testCases: [
      { input: [10, 3], expectedOutput: 7 },
      { input: [2, 5], expectedOutput: 2 },
      { input: [5, 5], expectedOutput: 0 },
      { input: [0, 1], expectedOutput: 0 },
    ],
    solution: `function buyPotion(gold, price) {
  if (gold < price) {
    console.log("Недостатньо золота!");
    return gold;
  }
  gold = gold - price;
  return gold;
}`,
    hint: "Усередині `if` після `console.log` додай `return gold;` — тоді віднімання не виконається.",
    difficulty: 1,
  },

  /* ───────────── Арка III — Цикли та функції → Ліс функцій ───────────── */
  {
    id: 17,
    arc: "Цикли та функції",
    arcNumber: 3,
    locationName: "Ліс функцій",
    title: "for",
    concept: "Цикл `for (старт; умова; крок)` повторює блок коду, поки умова істинна. Класичний випадок — пройти числа від одного значення до іншого.",
    example: `for (let i = 1; i <= 3; i++) {
  console.log("Крок " + i);
}
// Крок 1, Крок 2, Крок 3`,
    missionStory: "Стежка в Ліс функцій позначена пронумерованими каменями. Лісник просить скласти список номерів між двома каменями.",
    worldEvent: "Уздовж стежки засвітились пронумеровані камені.",
    taskType: "write-function",
    prompt: "Напиши функцію `range(from, to)`, яка повертає масив усіх цілих чисел від `from` до `to` включно. Використай цикл `for`. Якщо `from > to`, поверни порожній масив.",
    functionName: "range",
    starterCode: `function range(from, to) {
  const result = [];
  // цикл for
  return result;
}`,
    testCases: [
      { input: [1, 5], expectedOutput: [1, 2, 3, 4, 5] },
      { input: [3, 3], expectedOutput: [3] },
      { input: [-2, 1], expectedOutput: [-2, -1, 0, 1] },
      { input: [5, 4], expectedOutput: [] },
    ],
    codeChecks: [{ re: /for\s*\(/, label: "Використано цикл for" }],
    solution: `function range(from, to) {
  const result = [];
  for (let i = from; i <= to; i++) {
    result.push(i);
  }
  return result;
}`,
    hint: "Почни з `let i = from`, продовжуй, поки `i <= to`, і на кожному кроці додавай `i` в масив через `result.push(i)`.",
    difficulty: 1,
  },
  {
    id: 18,
    arc: "Цикли та функції",
    arcNumber: 3,
    locationName: "Ліс функцій",
    title: "while",
    concept: "Цикл `while (умова)` повторюється, поки умова істинна. Його зручно використовувати, коли кількість повторів наперед невідома. Головне — змінювати змінну всередині циклу, інакше він стане безкінечним.",
    example: `let energy = 3;
while (energy > 0) {
  console.log("Рубаю дерево");
  energy--;
}`,
    missionStory: "Лісові білки збирають горіхи: першого дня 1, другого 2, і так далі. Скільки горіхів буде за n днів?",
    worldEvent: "Білки склали гору горіхів і показали таємну стежку.",
    taskType: "write-function",
    prompt: "Напиши функцію `sumTo(n)`, яка повертає суму чисел від 1 до `n` включно. Використай цикл `while`. Для `n = 0` поверни 0.",
    functionName: "sumTo",
    starterCode: `function sumTo(n) {
  let sum = 0;
  let i = 1;
  // цикл while
  return sum;
}`,
    testCases: [
      { input: [5], expectedOutput: 15 },
      { input: [1], expectedOutput: 1 },
      { input: [0], expectedOutput: 0 },
      { input: [100], expectedOutput: 5050 },
    ],
    codeChecks: [{ re: /while\s*\(/, label: "Використано цикл while" }],
    solution: `function sumTo(n) {
  let sum = 0;
  let i = 1;
  while (i <= n) {
    sum += i;
    i++;
  }
  return sum;
}`,
    hint: "Умова циклу — `i <= n`. Усередині: `sum += i;` і не забудь `i++`, інакше цикл ніколи не скінчиться.",
    difficulty: 1,
  },
  {
    id: 19,
    arc: "Цикли та функції",
    arcNumber: 3,
    locationName: "Ліс функцій",
    title: "continue",
    concept: "`continue` пропускає решту поточної ітерації і переходить до наступної. `break` повністю зупиняє цикл. `continue` зручний, щоб відкинути непотрібні елементи без глибоких вкладених `if`.",
    example: `for (let i = 1; i <= 5; i++) {
  if (i === 3) continue; // пропускаємо 3
  console.log(i);        // 1, 2, 4, 5
}`,
    missionStory: "Травниця збирає трави на зілля, але серед них ростуть отруйні поганки. Їх треба пропустити.",
    worldEvent: "Кошик травниці повний цілющих трав.",
    taskType: "write-function",
    prompt: "Напиши функцію `collectHerbs(plants)`: пройди масив циклом і збери в новий масив усі рослини, крім `\"поганка\"`. Для пропуску використай `continue`.",
    functionName: "collectHerbs",
    starterCode: `function collectHerbs(plants) {
  const basket = [];
  for (let i = 0; i < plants.length; i++) {
    // пропусти поганку через continue
  }
  return basket;
}`,
    testCases: [
      { input: [["м'ята", "поганка", "ромашка"]], expectedOutput: ["м'ята", "ромашка"] },
      { input: [["поганка", "поганка"]], expectedOutput: [] },
      { input: [["шавлія"]], expectedOutput: ["шавлія"] },
      { input: [[]], expectedOutput: [] },
    ],
    codeChecks: [{ re: /\bcontinue\b/, label: "Використано continue" }],
    solution: `function collectHerbs(plants) {
  const basket = [];
  for (let i = 0; i < plants.length; i++) {
    if (plants[i] === "поганка") {
      continue;
    }
    basket.push(plants[i]);
  }
  return basket;
}`,
    hint: "У циклі: `if (plants[i] === \"поганка\") continue;` — а після цього рядка `basket.push(plants[i]);`.",
    difficulty: 1,
  },
  {
    id: 20,
    arc: "Цикли та функції",
    arcNumber: 3,
    locationName: "Ліс функцій",
    title: "Вкладені цикли",
    concept: "Цикл усередині циклу проходить усі комбінації: для кожної ітерації зовнішнього циклу внутрішній виконується повністю. Так будують таблиці, сітки й карти.",
    example: `for (let row = 1; row <= 2; row++) {
  for (let col = 1; col <= 3; col++) {
    console.log(row, col);
  }
}`,
    missionStory: "Старий дуб-мудрець просить висадити саджанці квадратом. Кожна клітинка має знати свій номер — як у таблиці множення.",
    worldEvent: "На галявині виріс рівний квадрат молодих дубків.",
    taskType: "write-function",
    prompt: "Напиши функцію `multiplicationTable(n)`, яка повертає двовимірний масив n×n, де елемент `[i][j]` дорівнює `(i + 1) * (j + 1)`. Використай вкладені цикли `for`.",
    functionName: "multiplicationTable",
    starterCode: `function multiplicationTable(n) {
  const table = [];
  // зовнішній цикл — рядки, внутрішній — стовпці
  return table;
}`,
    testCases: [
      { input: [1], expectedOutput: [[1]] },
      { input: [3], expectedOutput: [[1, 2, 3], [2, 4, 6], [3, 6, 9]] },
      { input: [4], expectedOutput: [[1, 2, 3, 4], [2, 4, 6, 8], [3, 6, 9, 12], [4, 8, 12, 16]] },
    ],
    codeChecks: [{ re: /for\s*\([\s\S]*for\s*\(/, label: "Є вкладений цикл for" }],
    solution: `function multiplicationTable(n) {
  const table = [];
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      row.push((i + 1) * (j + 1));
    }
    table.push(row);
  }
  return table;
}`,
    hint: "У зовнішньому циклі створюй порожній `row`, у внутрішньому заповнюй його `(i + 1) * (j + 1)`, а після внутрішнього циклу додавай `row` у `table`.",
    difficulty: 2,
  },
  {
    id: 21,
    arc: "Цикли та функції",
    arcNumber: 3,
    locationName: "Ліс функцій",
    title: "function declaration",
    concept: "Оголошення функції: ключове слово `function`, ім'я, параметри в круглих дужках і тіло у фігурних. Такі функції «піднімаються» (hoisting): їх можна викликати навіть вище за місце оголошення.",
    example: `function heal(hp, amount) {
  return hp + amount;
}
heal(50, 20); // 70`,
    missionStory: "Лісоруб записав заклинання для сокири, але поспішав і наробив помилок. Тепер сокира не слухається.",
    worldEvent: "Сокира лісоруба знову гостра.",
    taskType: "fix-code",
    prompt: "У коді дві функції з помилками в синтаксисі оголошення. Виправ обидві, щоб `sharpenAxe` повертала гостроту + 10, а `chopTree` — кількість дерев мінус 1.",
    exports: ["sharpenAxe", "chopTree"],
    starterCode: `function sharpenAxe(sharpness {
  return sharpness + 10;
}

function chopTree = (trees) {
  return trees - 1;
}`,
    testCases: [
      { fn: "sharpenAxe", input: [5], expectedOutput: 15 },
      { fn: "sharpenAxe", input: [0], expectedOutput: 10 },
      { fn: "chopTree", input: [10], expectedOutput: 9 },
      { fn: "chopTree", input: [1], expectedOutput: 0 },
    ],
    solution: `function sharpenAxe(sharpness) {
  return sharpness + 10;
}

function chopTree(trees) {
  return trees - 1;
}`,
    hint: "У першій функції не закрито круглу дужку параметрів. У другій змішано два синтаксиси: після `function chopTree` одразу йдуть параметри `(trees)`, без `=`.",
    difficulty: 1,
  },
  {
    id: 22,
    arc: "Цикли та функції",
    arcNumber: 3,
    locationName: "Ліс функцій",
    title: "function expression",
    concept: "Функціональний вираз — це функція, присвоєна змінній: `const name = function (...) { ... };`. На відміну від declaration, вона не піднімається: викликати її можна лише після рядка з оголошенням.",
    example: `const shout = function (text) {
  return text.toUpperCase() + "!";
};
shout("вперед"); // "ВПЕРЕД!"`,
    missionStory: "Лучниця лісу зберігає свої прийоми в сагайдаку-змінній. Навчи її записати прийом як функціональний вираз.",
    worldEvent: "Лучниця поповнила сагайдак і розчистила кущі стрілами.",
    taskType: "write-function",
    prompt: "Перепиши `addArrows` з function declaration на function expression: `const addArrows = function (...) { ... };`. Логіка не змінюється.",
    functionName: "addArrows",
    starterCode: `function addArrows(quiver, count) {
  return quiver + count;
}`,
    testCases: [
      { input: [5, 3], expectedOutput: 8 },
      { input: [0, 12], expectedOutput: 12 },
    ],
    codeChecks: [
      { re: /(const|let)\s+addArrows\s*=\s*function\b/, label: "addArrows — це function expression" },
      { re: /^\s*function\s+addArrows\b/m, not: true, label: "Немає старого function declaration" },
    ],
    solution: `const addArrows = function (quiver, count) {
  return quiver + count;
};`,
    hint: "Почни рядок з `const addArrows = function (quiver, count) {` і не забудь крапку з комою після закритої `}`.",
    difficulty: 1,
  },
  {
    id: 23,
    arc: "Цикли та функції",
    arcNumber: 3,
    locationName: "Ліс функцій",
    title: "Стрілкова функція",
    concept: "Стрілкова функція — коротший запис: `(a, b) => a + b`. Якщо тіло складається з одного виразу, фігурні дужки і `return` можна опустити. Якщо параметр один, дужки навколо нього теж необов'язкові: `n => n * 2`.",
    example: `const square = (n) => n * n;
const hello = name => "Привіт, " + name;
const sum = (a, b) => {
  return a + b; // з фігурними дужками return обов'язковий
};`,
    missionStory: "Лісові руни довгі й незграбні. Друїд просить переписати їх «стрілками» — так вони летять швидше.",
    worldEvent: "Рунічні стріли розчистили густі хащі.",
    taskType: "fix-code",
    prompt: "Перепиши обидві функції у стрілкову форму, щоб у коді не лишилось ключового слова `function`.",
    exports: ["double", "greetTraveler"],
    starterCode: `const double = function (n) {
  return n * 2;
};

const greetTraveler = function (name) {
  return "Привіт, " + name;
};`,
    testCases: [
      { fn: "double", input: [4], expectedOutput: 8 },
      { fn: "double", input: [-3], expectedOutput: -6 },
      { fn: "greetTraveler", input: ["Мавка"], expectedOutput: "Привіт, Мавка" },
    ],
    codeChecks: [
      { re: /double\s*=\s*(\(\s*\w*\s*\)|\w+)\s*=>/, label: "double — стрілкова функція" },
      { re: /greetTraveler\s*=\s*(\(\s*\w*\s*\)|\w+)\s*=>/, label: "greetTraveler — стрілкова функція" },
      { re: /\bfunction\b/, not: true, label: "Немає слова function" },
    ],
    solution: `const double = (n) => n * 2;

const greetTraveler = (name) => "Привіт, " + name;`,
    hint: "Прибери `function`, а між параметрами і тілом постав `=>`. Наприклад: `const double = (n) => n * 2;`.",
    difficulty: 1,
  },
  {
    id: 24,
    arc: "Цикли та функції",
    arcNumber: 3,
    locationName: "Ліс функцій",
    title: "Параметр за замовчуванням",
    concept: "Параметру можна задати значення за замовчуванням: `function f(x = 10)`. Воно використовується, якщо аргумент не передали (або передали `undefined`).",
    example: `function brew(potion = "чай") {
  return "Вариться " + potion;
}
brew();        // "Вариться чай"
brew("зілля"); // "Вариться зілля"`,
    missionStory: "У лісі з'являються нові мандрівники. Ті, хто не назвав свого рівня, мають отримувати перший.",
    worldEvent: "Біля стежки встановили дошку новачків.",
    taskType: "write-function",
    prompt: "Напиши функцію `createHero(name, level)`, що повертає рядок `\"<name> (рівень <level>)\"`. Якщо `level` не передано, він має дорівнювати 1. Використай параметр за замовчуванням.",
    functionName: "createHero",
    starterCode: `function createHero(name, level) {
  return name + " (рівень " + level + ")";
}`,
    testCases: [
      { input: ["Аліса"], expectedOutput: "Аліса (рівень 1)" },
      { input: ["Тарас", 5], expectedOutput: "Тарас (рівень 5)" },
      { input: ["Мавка", undefined], expectedOutput: "Мавка (рівень 1)" },
    ],
    codeChecks: [{ re: /\(\s*\w+\s*,\s*level\s*=\s*1\s*\)/, label: "level має значення за замовчуванням 1" }],
    solution: `function createHero(name, level = 1) {
  return name + " (рівень " + level + ")";
}`,
    hint: "Значення за замовчуванням пишеться просто в дужках параметрів: `level = 1`.",
    difficulty: 1,
  },
  {
    id: 25,
    arc: "Цикли та функції",
    arcNumber: 3,
    locationName: "Ліс функцій",
    title: "return у циклі",
    concept: "`return` усередині циклу одразу завершує і цикл, і всю функцію. Це ідеально для пошуку: знайшли потрібне — повертаємо результат і не перебираємо решту.",
    example: `function findEnemy(list) {
  for (const name of list) {
    if (name.startsWith("Баг")) return name; // далі не шукаємо
  }
  return null;
}`,
    missionStory: "Стежка майже розчищена! Лишилось знайти потрібний дорожній знак серед сотень дерев — і зробити це швидко.",
    worldEvent: "Стежку через ліс розчищено — попереду видно печери.",
    taskType: "write-function",
    prompt: "Напиши функцію `findSign(signs, target)`, яка повертає індекс першого елемента, що дорівнює `target`, або `-1`, якщо його немає. Використай цикл з раннім `return`, без `indexOf`/`findIndex`. Цикл не має перебирати елементи після знахідки.",
    functionName: "findSign",
    starterCode: `function findSign(signs, target) {
  for (let i = 0; i < signs.length; i++) {

  }
  return -1;
}`,
    testCases: [
      { input: [["дуб", "сосна", "клен"], "клен"], expectedOutput: 2 },
      { input: [["дуб", "сосна"], "береза"], expectedOutput: -1 },
      { input: [[], "дуб"], expectedOutput: -1 },
      {
        name: "Пошук зупиняється одразу після знахідки",
        check(ctx) {
          let reads = 0;
          const signs = new Proxy(["дуб", "сосна", "клен", "береза", "липа"], {
            get(target, prop, receiver) {
              if (typeof prop === "string" && /^\d+$/.test(prop)) reads++;
              return Reflect.get(target, prop, receiver);
            },
          });
          const index = ctx.fn(signs, "сосна");
          return {
            pass: index === 1 && reads <= 2,
            actual: "індекс " + index + ", переглянуто елементів: " + reads,
            expected: "індекс 1, переглянуто не більше 2 елементів",
          };
        },
      },
    ],
    codeChecks: [
      { re: /indexOf|findIndex/, not: true, label: "Без indexOf / findIndex" },
      { re: /for\s*\([\s\S]*return/, label: "return усередині циклу" },
    ],
    solution: `function findSign(signs, target) {
  for (let i = 0; i < signs.length; i++) {
    if (signs[i] === target) {
      return i;
    }
  }
  return -1;
}`,
    hint: "Усередині циклу: `if (signs[i] === target) return i;`. А `return -1` після циклу спрацює, лише якщо нічого не знайшли.",
    difficulty: 2,
  },
  /* ───────────── Арка IV — Масиви → Печери масивів ───────────── */
  {
    id: 26,
    arc: "Масиви",
    arcNumber: 4,
    locationName: "Печери масивів",
    title: "Доступ, length",
    concept: "Масив — це впорядкований список. Елементи нумеруються з нуля: перший — `arr[0]`. Властивість `length` показує кількість елементів, тому останній елемент — `arr[arr.length - 1]`. Звернення до неіснуючого індексу повертає `undefined`, а не помилку.",
    example: `const torches = ["червоний", "синій", "зелений"];
torches[0];                  // "червоний"
torches.length;              // 3
torches[torches.length - 1]; // "зелений"`,
    missionStory: "На вході в печери лежить спорядження старого шукача скарбів. Перевір, що де лежить, перш ніж спускатися.",
    worldEvent: "Ти спустився в печери з повним спорядженням.",
    taskType: "predict-output",
    prompt: "Що виведе кожен рядок?",
    starterCode: null,
    code: `const items = ["меч", "щит", "лук", "факел"];
console.log(items[0]);
console.log(items.length);
console.log(items[items.length - 1]);
console.log(items[4]);`,
    expectedAnswer: ["меч", "4", "факел", "undefined"],
    hint: "Нумерація починається з 0, тож у масиві з 4 елементів останній індекс — 3. Індекс 4 уже за межами масиву.",
    difficulty: 1,
  },
  {
    id: 27,
    arc: "Масиви",
    arcNumber: 4,
    locationName: "Печери масивів",
    title: "push / pop",
    concept: "`push(x)` додає елемент у кінець масиву і повертає нову довжину. `pop()` видаляє останній елемент і повертає його. Обидва методи змінюють (мутують) сам масив.",
    example: `const bag = ["хліб"];
bag.push("сир");      // bag: ["хліб", "сир"]
const last = bag.pop(); // last: "сир", bag: ["хліб"]`,
    missionStory: "Рюкзак шукача переповнений. Щоб узяти нову знахідку, треба викласти річ, покладену останньою.",
    worldEvent: "Рюкзак упорядковано, кирка лежить напоготові.",
    taskType: "write-function",
    prompt: "Напиши функцію `swapLastItem(backpack, newItem)`: дістань останню річ з масиву через `pop()`, поклади `newItem` у кінець через `push()` і поверни дістану річ. Масив `backpack` має змінитися.",
    functionName: "swapLastItem",
    starterCode: `function swapLastItem(backpack, newItem) {

}`,
    testCases: [
      {
        name: "swapLastItem([\"мотузка\", \"ліхтар\"], \"кирка\") → \"ліхтар\", рюкзак: [\"мотузка\", \"кирка\"]",
        check(ctx) {
          const bag = ["мотузка", "ліхтар"];
          const removed = ctx.fn(bag, "кирка");
          return {
            pass: removed === "ліхтар" && ctx.equal(bag, ["мотузка", "кирка"]),
            actual: "повернено " + ctx.show(removed) + ", рюкзак " + ctx.show(bag),
            expected: "повернено \"ліхтар\", рюкзак [\"мотузка\", \"кирка\"]",
          };
        },
      },
      {
        name: "Працює з рюкзаком з однієї речі",
        check(ctx) {
          const bag = ["карта"];
          const removed = ctx.fn(bag, "компас");
          return {
            pass: removed === "карта" && ctx.equal(bag, ["компас"]),
            actual: "повернено " + ctx.show(removed) + ", рюкзак " + ctx.show(bag),
            expected: "повернено \"карта\", рюкзак [\"компас\"]",
          };
        },
      },
    ],
    codeChecks: [
      { re: /\.pop\(\)/, label: "Використано pop()" },
      { re: /\.push\(/, label: "Використано push()" },
    ],
    solution: `function swapLastItem(backpack, newItem) {
  const removed = backpack.pop();
  backpack.push(newItem);
  return removed;
}`,
    hint: "Спочатку збережи результат `backpack.pop()` у змінну, потім зроби `backpack.push(newItem)` і поверни збережене.",
    difficulty: 1,
  },
  {
    id: 28,
    arc: "Масиви",
    arcNumber: 4,
    locationName: "Печери масивів",
    title: "unshift / shift",
    concept: "`unshift(x)` додає елемент на початок масиву і повертає нову довжину. `shift()` видаляє перший елемент і повертає його. Разом із `push` вони дозволяють будувати черги: додаємо в кінець, забираємо з початку.",
    example: `const queue = ["Аліса", "Тарас"];
queue.shift();        // "Аліса", queue: ["Тарас"]
queue.unshift("Король"); // 2, queue: ["Король", "Тарас"]`,
    missionStory: "Біля вузького лазу в печеру вишикувалась черга шахтарів. Перший проходить, а гонця з наказом пропускають наперед.",
    worldEvent: "Черга біля лазу рухається злагоджено.",
    taskType: "write-function",
    prompt: "Напиши дві функції: `letInFirst(queue)` — видаляє і повертає першого в черзі (`shift`); `addVip(queue, name)` — ставить `name` на початок черги (`unshift`) і повертає нову довжину черги.",
    exports: ["letInFirst", "addVip"],
    starterCode: `function letInFirst(queue) {

}

function addVip(queue, name) {

}`,
    testCases: [
      {
        name: "letInFirst повертає першого і прибирає його з черги",
        check(ctx) {
          const queue = ["Остап", "Леся", "Марко"];
          const first = ctx.get("letInFirst")(queue);
          return {
            pass: first === "Остап" && ctx.equal(queue, ["Леся", "Марко"]),
            actual: ctx.show(first) + ", черга " + ctx.show(queue),
            expected: "\"Остап\", черга [\"Леся\", \"Марко\"]",
          };
        },
      },
      {
        name: "addVip ставить гонця першим і повертає довжину",
        check(ctx) {
          const queue = ["Леся"];
          const length = ctx.get("addVip")(queue, "Гонець");
          return {
            pass: length === 2 && ctx.equal(queue, ["Гонець", "Леся"]),
            actual: ctx.show(length) + ", черга " + ctx.show(queue),
            expected: "2, черга [\"Гонець\", \"Леся\"]",
          };
        },
      },
    ],
    codeChecks: [
      { re: /\.shift\(\)/, label: "Використано shift()" },
      { re: /\.unshift\(/, label: "Використано unshift()" },
    ],
    solution: `function letInFirst(queue) {
  return queue.shift();
}

function addVip(queue, name) {
  return queue.unshift(name);
}`,
    hint: "Обидва методи вже повертають саме те, що потрібно: `shift()` — видалений елемент, `unshift()` — нову довжину. Просто поверни їхній результат.",
    difficulty: 1,
  },
  {
    id: 29,
    arc: "Масиви",
    arcNumber: 4,
    locationName: "Печери масивів",
    title: "slice",
    concept: "`slice(start, end)` повертає НОВИЙ масив — копію частини від `start` до `end` (не включно). Оригінал не змінюється. Без аргументів `slice()` робить повну копію.",
    example: `const gems = ["рубін", "сапфір", "смарагд", "топаз"];
gems.slice(1, 3); // ["сапфір", "смарагд"]
gems.slice(-1);   // ["топаз"]
// gems не змінився`,
    missionStory: "У печері висить таблиця рекордів шукачів. Гном-архіваріус просить переписати трійку лідерів, не чіпаючи оригінал.",
    worldEvent: "Біля таблиці рекордів з'явилась копія для нових шукачів.",
    taskType: "write-function",
    prompt: "Напиши функцію `getTopThree(scores)`, яка повертає перші три елементи масиву через `slice`. Початковий масив не має змінитися.",
    functionName: "getTopThree",
    starterCode: `function getTopThree(scores) {

}`,
    testCases: [
      { input: [[980, 870, 750, 600, 420]], expectedOutput: [980, 870, 750] },
      { input: [[100, 50]], expectedOutput: [100, 50] },
      {
        name: "Оригінальний масив лишився без змін",
        check(ctx) {
          const scores = [9, 8, 7, 6];
          const top = ctx.fn(scores);
          return {
            pass: ctx.equal(scores, [9, 8, 7, 6]) && top !== scores,
            actual: "оригінал " + ctx.show(scores),
            expected: "оригінал [9, 8, 7, 6] і новий масив",
          };
        },
      },
    ],
    codeChecks: [{ re: /\.slice\(/, label: "Використано slice()" }],
    solution: `function getTopThree(scores) {
  return scores.slice(0, 3);
}`,
    hint: "`scores.slice(0, 3)` — від індексу 0 до 3 (не включно). Якщо елементів менше трьох, `slice` просто поверне всі.",
    difficulty: 1,
  },
  {
    id: 30,
    arc: "Масиви",
    arcNumber: 4,
    locationName: "Печери масивів",
    title: "splice",
    concept: "`splice(start, deleteCount, ...items)` змінює масив на місці: видаляє `deleteCount` елементів, починаючи з `start`, і вставляє нові. Повертає масив видалених елементів.",
    example: `const wall = ["камінь", "тріщина", "камінь"];
const removed = wall.splice(1, 1, "цегла");
// removed: ["тріщина"], wall: ["камінь", "цегла", "камінь"]`,
    missionStory: "На стіні тунелю згасли факели. Треба замінити згаслий факел новим просто посередині ряду.",
    worldEvent: "Тунель знову освітлений рівним рядом факелів.",
    taskType: "write-function",
    prompt: "Напиши функцію `replaceTorch(wall, index, newTorch)`: за допомогою `splice` заміни один елемент на позиції `index` значенням `newTorch` і поверни видалений елемент (саме значення, а не масив).",
    functionName: "replaceTorch",
    starterCode: `function replaceTorch(wall, index, newTorch) {

}`,
    testCases: [
      {
        name: "Заміна посередині",
        check(ctx) {
          const wall = ["вогонь", "згаслий", "вогонь"];
          const removed = ctx.fn(wall, 1, "новий");
          return {
            pass: removed === "згаслий" && ctx.equal(wall, ["вогонь", "новий", "вогонь"]),
            actual: ctx.show(removed) + ", стіна " + ctx.show(wall),
            expected: "\"згаслий\", стіна [\"вогонь\", \"новий\", \"вогонь\"]",
          };
        },
      },
      {
        name: "Заміна першого елемента",
        check(ctx) {
          const wall = ["згаслий", "вогонь"];
          const removed = ctx.fn(wall, 0, "новий");
          return {
            pass: removed === "згаслий" && ctx.equal(wall, ["новий", "вогонь"]),
            actual: ctx.show(removed) + ", стіна " + ctx.show(wall),
            expected: "\"згаслий\", стіна [\"новий\", \"вогонь\"]",
          };
        },
      },
    ],
    codeChecks: [{ re: /\.splice\(/, label: "Використано splice()" }],
    solution: `function replaceTorch(wall, index, newTorch) {
  const removed = wall.splice(index, 1, newTorch);
  return removed[0];
}`,
    hint: "`wall.splice(index, 1, newTorch)` поверне масив з одного видаленого елемента — візьми з нього `[0]`.",
    difficulty: 2,
  },
  {
    id: 31,
    arc: "Масиви",
    arcNumber: 4,
    locationName: "Печери масивів",
    title: "indexOf / includes",
    concept: "`includes(x)` відповідає «так/ні»: чи є елемент у масиві. `indexOf(x)` повертає позицію першого збігу або `-1`, якщо елемента немає. Обидва порівнюють через строгу рівність.",
    example: `const map = ["вхід", "озеро", "скарб"];
map.includes("скарб"); // true
map.indexOf("озеро");  // 1
map.indexOf("дракон"); // -1`,
    missionStory: "Карта печер позначає кристали. Перш ніж копати, треба перевірити, чи є кристал у переліку і де саме.",
    worldEvent: "На карті засвітились позначки знайдених кристалів.",
    taskType: "write-function",
    prompt: "Напиши дві функції: `hasCrystal(cave, crystal)` — повертає `true`/`false` через `includes`; `crystalPosition(cave, crystal)` — повертає індекс через `indexOf` (або `-1`).",
    exports: ["hasCrystal", "crystalPosition"],
    starterCode: `function hasCrystal(cave, crystal) {

}

function crystalPosition(cave, crystal) {

}`,
    testCases: [
      { fn: "hasCrystal", input: [["кварц", "аметист"], "аметист"], expectedOutput: true },
      { fn: "hasCrystal", input: [["кварц"], "опал"], expectedOutput: false },
      { fn: "crystalPosition", input: [["кварц", "аметист", "опал"], "опал"], expectedOutput: 2 },
      { fn: "crystalPosition", input: [["кварц"], "рубін"], expectedOutput: -1 },
    ],
    codeChecks: [
      { re: /\.includes\(/, label: "Використано includes()" },
      { re: /\.indexOf\(/, label: "Використано indexOf()" },
    ],
    solution: `function hasCrystal(cave, crystal) {
  return cave.includes(crystal);
}

function crystalPosition(cave, crystal) {
  return cave.indexOf(crystal);
}`,
    hint: "Кожна функція — один рядок: `return cave.includes(crystal);` і `return cave.indexOf(crystal);`.",
    difficulty: 1,
  },
  {
    id: 32,
    arc: "Масиви",
    arcNumber: 4,
    locationName: "Печери масивів",
    title: "sort (+ пастка)",
    concept: "`sort()` без аргументів перетворює елементи на рядки і сортує їх за алфавітом, тому `[10, 9, 1]` стає `[1, 10, 9]`. Щоб сортувати числа, передай функцію-компаратор: `(a, b) => a - b` — за зростанням.",
    example: `[10, 9, 1].sort();                 // [1, 10, 9] 😱
[10, 9, 1].sort((a, b) => a - b);  // [1, 9, 10] ✓`,
    missionStory: "Гном-ювелір розкладає самоцвіти за вагою, але важкий камінь на 100 карат чомусь опинився між легкими.",
    worldEvent: "Самоцвіти лежать рівним рядом від найлегшого до найважчого.",
    taskType: "fix-code",
    prompt: "Функція має сортувати ваги за зростанням, але `[10, 9, 1, 100, 25]` перетворюється на `[1, 10, 100, 25, 9]`. Виправ сортування.",
    functionName: "sortGems",
    starterCode: `function sortGems(weights) {
  return weights.sort();
}`,
    testCases: [
      { input: [[10, 9, 1, 100, 25]], expectedOutput: [1, 9, 10, 25, 100] },
      { input: [[3, 2, 1]], expectedOutput: [1, 2, 3] },
      { input: [[5, 40, 300, 7]], expectedOutput: [5, 7, 40, 300] },
    ],
    codeChecks: [{ re: /\.sort\(\s*(\(?\s*\w+\s*,\s*\w+\s*\)?\s*=>|function)/, label: "У sort передано функцію-компаратор" }],
    solution: `function sortGems(weights) {
  return weights.sort((a, b) => a - b);
}`,
    hint: "Передай у `sort` компаратор `(a, b) => a - b`. Від'ємний результат означає «a раніше b».",
    difficulty: 2,
  },
  {
    id: 33,
    arc: "Масиви",
    arcNumber: 4,
    locationName: "Печери масивів",
    title: "forEach",
    concept: "`forEach(callback)` викликає функцію для кожного елемента масиву і передає їй елемент та індекс. Він нічого не повертає — його використовують заради дії (вивести, зберегти, змінити щось ззовні).",
    example: `["Аліса", "Тарас"].forEach((name, i) => {
  console.log(i + 1 + ". " + name);
});
// 1. Аліса
// 2. Тарас`,
    missionStory: "У підземному залі зібрались герої. Глашатай печери має назвати кожного вголос.",
    worldEvent: "Відлуння імен героїв котиться печерами.",
    taskType: "write-function",
    prompt: "Напиши функцію `announceAll(heroes)`, яка через `forEach` виводить у консоль для кожного героя рядок `\"Герой: <ім'я>\"`.",
    functionName: "announceAll",
    starterCode: `function announceAll(heroes) {

}`,
    testCases: [
      {
        name: "Виводить кожного героя",
        check(ctx) {
          ctx.logs.length = 0;
          ctx.fn(["Аліса", "Тарас", "Мавка"]);
          return {
            pass: ctx.equal(ctx.logs, ["Герой: Аліса", "Герой: Тарас", "Герой: Мавка"]),
            actual: ctx.show(ctx.logs),
            expected: "[\"Герой: Аліса\", \"Герой: Тарас\", \"Герой: Мавка\"]",
          };
        },
      },
      {
        name: "Порожній список — порожня консоль",
        check(ctx) {
          ctx.logs.length = 0;
          ctx.fn([]);
          return { pass: ctx.logs.length === 0, actual: ctx.show(ctx.logs), expected: "[]" };
        },
      },
    ],
    codeChecks: [{ re: /\.forEach\(/, label: "Використано forEach()" }],
    solution: `function announceAll(heroes) {
  heroes.forEach((hero) => {
    console.log("Герой: " + hero);
  });
}`,
    hint: "`heroes.forEach((hero) => console.log(\"Герой: \" + hero));`",
    difficulty: 1,
  },
  {
    id: 34,
    arc: "Масиви",
    arcNumber: 4,
    locationName: "Печери масивів",
    title: "map",
    concept: "`map(callback)` створює НОВИЙ масив тієї самої довжини, де кожен елемент — результат callback. Оригінал не змінюється. Це головний інструмент для перетворення даних.",
    example: `const prices = [10, 20];
const doubled = prices.map((p) => p * 2); // [20, 40]`,
    missionStory: "Печерний торговець вивішує цінники. У нього є лише голі числа, а покупцям потрібні зрозумілі написи.",
    worldEvent: "Підземний ринок засяяв охайними цінниками.",
    taskType: "write-function",
    prompt: "Напиши функцію `priceTags(prices)`, яка через `map` перетворює масив чисел на масив рядків `\"<число> монет\"`.",
    functionName: "priceTags",
    starterCode: `function priceTags(prices) {

}`,
    testCases: [
      { input: [[5, 12, 100]], expectedOutput: ["5 монет", "12 монет", "100 монет"] },
      { input: [[]], expectedOutput: [] },
    ],
    codeChecks: [{ re: /\.map\(/, label: "Використано map()" }],
    solution: `function priceTags(prices) {
  return prices.map((price) => price + " монет");
}`,
    hint: "`return prices.map((price) => price + \" монет\");` — не забудь `return` перед `prices.map`.",
    difficulty: 1,
  },
  {
    id: 35,
    arc: "Масиви",
    arcNumber: 4,
    locationName: "Печери масивів",
    title: "filter",
    concept: "`filter(callback)` повертає НОВИЙ масив лише з тими елементами, для яких callback повернув truthy-значення. Довжина результату може бути будь-якою, від 0 до довжини оригіналу.",
    example: `const hp = [0, 40, 0, 75];
const alive = hp.filter((h) => h > 0); // [40, 75]`,
    missionStory: "Глибоко в печері тьмяніють кристали. Для ліхтарів годяться лише ті, що світять яскравіше за 50.",
    worldEvent: "Ліхтарі з яскравими кристалами освітили глибокий зал.",
    taskType: "write-function",
    prompt: "Напиши функцію `getBrightCrystals(brightness)`, яка через `filter` повертає лише значення більші за 50.",
    functionName: "getBrightCrystals",
    starterCode: `function getBrightCrystals(brightness) {

}`,
    testCases: [
      { input: [[10, 75, 50, 51, 99]], expectedOutput: [75, 51, 99] },
      { input: [[1, 2, 3]], expectedOutput: [] },
      { input: [[60]], expectedOutput: [60] },
    ],
    codeChecks: [{ re: /\.filter\(/, label: "Використано filter()" }],
    solution: `function getBrightCrystals(brightness) {
  return brightness.filter((value) => value > 50);
}`,
    hint: "Умова для `filter` — `value > 50`. Число 50 не проходить, бо «більше» — строго.",
    difficulty: 1,
  },
  {
    id: 36,
    arc: "Масиви",
    arcNumber: 4,
    locationName: "Печери масивів",
    title: "reduce",
    concept: "`reduce((acc, item) => ..., initial)` «згортає» масив в одне значення: суму, об'єкт, рядок. `acc` — накопичувач, який передається від кроку до кроку. Завжди вказуй початкове значення: без нього `reduce` на порожньому масиві кине помилку.",
    example: `[1, 2, 3].reduce((sum, n) => sum + n, 0); // 6

["a", "b", "a"].reduce((count, x) => {
  count[x] = (count[x] || 0) + 1;
  return count;
}, {}); // { a: 2, b: 1 }`,
    missionStory: "Віз зі здобиччю має обмеження ваги. Ще треба порахувати, скільки самоцвітів кожного виду зібрано.",
    worldEvent: "Віз рушив до виходу — вагу пораховано до грама.",
    taskType: "write-function",
    prompt: "Напиши дві функції через `reduce`: `totalWeight(items)` — сума чисел масиву (для порожнього — 0); `countGems(gems)` — об'єкт, де ключ — назва самоцвіту, а значення — кількість.",
    exports: ["totalWeight", "countGems"],
    starterCode: `function totalWeight(items) {

}

function countGems(gems) {

}`,
    testCases: [
      { fn: "totalWeight", input: [[5, 10, 2]], expectedOutput: 17 },
      { fn: "totalWeight", input: [[]], expectedOutput: 0 },
      { fn: "countGems", input: [["рубін", "опал", "рубін"]], expectedOutput: { "рубін": 2, "опал": 1 } },
      { fn: "countGems", input: [[]], expectedOutput: {} },
    ],
    codeChecks: [{ re: /\.reduce\([\s\S]*\.reduce\(/, label: "reduce() використано в обох функціях" }],
    solution: `function totalWeight(items) {
  return items.reduce((sum, weight) => sum + weight, 0);
}

function countGems(gems) {
  return gems.reduce((count, gem) => {
    count[gem] = (count[gem] || 0) + 1;
    return count;
  }, {});
}`,
    hint: "Для суми початкове значення — `0`, для підрахунку — порожній об'єкт `{}`. У другій функції не забудь `return count;` усередині callback.",
    difficulty: 3,
  },
  {
    id: 37,
    arc: "Масиви",
    arcNumber: 4,
    locationName: "Печери масивів",
    title: "find / some / every",
    concept: "`find(cb)` повертає перший елемент, що задовольняє умову (або `undefined`). `some(cb)` — `true`, якщо умову задовольняє хоча б один елемент. `every(cb)` — `true`, якщо умову задовольняють усі елементи.",
    example: `const hp = [30, 0, 80];
hp.find((h) => h > 50);   // 80
hp.some((h) => h === 0);  // true
hp.every((h) => h > 10);  // false`,
    missionStory: "Біля підземного озера лежить купа каменів. Майстер просить знайти важкий камінь, перевірити дрібні й переконатися, що всі справжні.",
    worldEvent: "Майстер печери схвально кивнув — камені перевірено.",
    taskType: "write-function",
    prompt: "Напиши три функції для масиву ваг каменів: `findHeavy(stones)` — перший камінь важчий за 100 (`find`); `hasTiny(stones)` — чи є камінь легший за 5 (`some`); `allValid(stones)` — чи всі ваги більші за 0 (`every`).",
    exports: ["findHeavy", "hasTiny", "allValid"],
    starterCode: `function findHeavy(stones) {

}

function hasTiny(stones) {

}

function allValid(stones) {

}`,
    testCases: [
      { fn: "findHeavy", input: [[20, 150, 300]], expectedOutput: 150 },
      { fn: "findHeavy", input: [[1, 2]], expectedOutput: undefined },
      { fn: "hasTiny", input: [[10, 3, 40]], expectedOutput: true },
      { fn: "hasTiny", input: [[10, 20]], expectedOutput: false },
      { fn: "allValid", input: [[1, 2, 3]], expectedOutput: true },
      { fn: "allValid", input: [[4, 0, 2]], expectedOutput: false },
    ],
    codeChecks: [
      { re: /\.find\(/, label: "Використано find()" },
      { re: /\.some\(/, label: "Використано some()" },
      { re: /\.every\(/, label: "Використано every()" },
    ],
    solution: `function findHeavy(stones) {
  return stones.find((w) => w > 100);
}

function hasTiny(stones) {
  return stones.some((w) => w < 5);
}

function allValid(stones) {
  return stones.every((w) => w > 0);
}`,
    hint: "Кожна функція — `return stones.метод((w) => умова);` з відповідною умовою: `w > 100`, `w < 5`, `w > 0`.",
    difficulty: 2,
  },
  {
    id: 38,
    arc: "Масиви",
    arcNumber: 4,
    locationName: "Печери масивів",
    title: "Ланцюжок методів",
    concept: "Методи `filter`, `map` і `reduce` повертають значення, тож їх можна з'єднати в ланцюжок: відфільтрувати → перетворити → згорнути. Кожен крок отримує результат попереднього.",
    example: `[1, 2, 3, 4]
  .filter((n) => n % 2 === 0) // [2, 4]
  .map((n) => n * 10)         // [20, 40]
  .reduce((s, n) => s + n, 0); // 60`,
    missionStory: "Ти дістався до головного скарбу печер! Оціни його: відбери важкі самоцвіти, переведи вагу в ціну і порахуй загальну вартість.",
    worldEvent: "Скарб печер знайдено — скриня сяє самоцвітами!",
    taskType: "write-function",
    prompt: "Напиши функцію `treasureValue(gems)`: залиш лише ваги більші за 10, кожну помнож на 3 (ціна) і поверни суму. Зроби це одним ланцюжком `filter → map → reduce`.",
    functionName: "treasureValue",
    starterCode: `function treasureValue(gems) {
  return gems
    // .filter(...)
    // .map(...)
    // .reduce(...)
}`,
    testCases: [
      { input: [[5, 12, 20, 8]], expectedOutput: 96 },
      { input: [[11]], expectedOutput: 33 },
      { input: [[1, 2, 10]], expectedOutput: 0 },
      { input: [[]], expectedOutput: 0 },
    ],
    codeChecks: [
      { re: /\.filter\(/, label: "Є filter()" },
      { re: /\.map\(/, label: "Є map()" },
      { re: /\.reduce\(/, label: "Є reduce()" },
    ],
    solution: `function treasureValue(gems) {
  return gems
    .filter((w) => w > 10)
    .map((w) => w * 3)
    .reduce((sum, price) => sum + price, 0);
}`,
    hint: "Не забудь початкове значення `0` у `reduce` — інакше для порожнього результату фільтра буде помилка.",
    difficulty: 3,
  },
  /* ───────────── Арка V — Об'єкти → Святилище об'єктів ───────────── */
  {
    id: 39,
    arc: "Об'єкти",
    arcNumber: 5,
    locationName: "Святилище об'єктів",
    title: "Створення, доступ",
    concept: "Об'єкт — набір пар «ключ: значення». До властивості звертаються через крапку (`obj.name`) або квадратні дужки (`obj[\"name\"]`). Дужки потрібні, коли ключ лежить у змінній або містить пробіл чи дефіс. Неіснуюча властивість дає `undefined`.",
    example: `const hero = { name: "Аліса", "max hp": 120 };
hero.name;        // "Аліса"
hero["max hp"];   // 120
const key = "name";
hero[key];        // "Аліса"`,
    missionStory: "На вівтарі святилища лежить стародавня реліквія з написами. Прочитай їх правильно — святилище не терпить помилок.",
    worldEvent: "Написи на реліквії засвітились блакитним.",
    taskType: "predict-output",
    prompt: "Що виведе кожен рядок?",
    starterCode: null,
    code: `const relic = { name: "Амулет", power: 7, "magic type": "світло" };
const key = "power";
console.log(relic.name);
console.log(relic[key]);
console.log(relic["magic type"]);
console.log(relic.key);`,
    expectedAnswer: ["Амулет", "7", "світло", "undefined"],
    hint: "`relic[key]` бере ЗНАЧЕННЯ змінної `key` (тобто \"power\"). А `relic.key` шукає властивість з буквальною назвою \"key\".",
    difficulty: 1,
  },
  {
    id: 40,
    arc: "Об'єкти",
    arcNumber: 5,
    locationName: "Святилище об'єктів",
    title: "Зміна, додавання, видалення",
    concept: "Властивості об'єкта можна змінювати й додавати простим присвоєнням (`obj.x = 5`), а видаляти — оператором `delete obj.x`. Навіть якщо об'єкт оголошено через `const`, його вміст змінювати можна: `const` забороняє лише переприсвоєння самої змінної.",
    example: `const chest = { gold: 10, trap: true };
chest.gold = 25;     // змінили
chest.gem = "опал";  // додали
delete chest.trap;   // видалили
// { gold: 25, gem: "опал" }`,
    missionStory: "Реліквія проклята: її сила ослаблена, а власника не вказано. Жрець просить зняти прокляття і записати тебе власником.",
    worldEvent: "Прокляття розвіялось, реліквія знову сильна.",
    taskType: "write-function",
    prompt: "Напиши функцію `updateRelic(relic)`: встанови `power` у 10, додай властивість `owner` зі значенням `\"Герой\"`, видали властивість `curse` і поверни той самий об'єкт.",
    functionName: "updateRelic",
    starterCode: `function updateRelic(relic) {

  return relic;
}`,
    testCases: [
      { input: [{ name: "Амулет", power: 7, curse: true }], expectedOutput: { name: "Амулет", power: 10, owner: "Герой" } },
      { input: [{ name: "Кільце", power: 1, curse: "темне" }], expectedOutput: { name: "Кільце", power: 10, owner: "Герой" } },
      {
        name: "Змінено саме переданий об'єкт",
        check(ctx) {
          const relic = { name: "Чаша", power: 2, curse: true };
          const result = ctx.fn(relic);
          return { pass: result === relic && !("curse" in relic), actual: ctx.show(relic), expected: "той самий об'єкт без curse" };
        },
      },
    ],
    codeChecks: [{ re: /\bdelete\s+/, label: "Використано delete" }],
    solution: `function updateRelic(relic) {
  relic.power = 10;
  relic.owner = "Герой";
  delete relic.curse;
  return relic;
}`,
    hint: "Три рядки: `relic.power = 10;`, `relic.owner = \"Герой\";`, `delete relic.curse;`.",
    difficulty: 1,
  },
  {
    id: 41,
    arc: "Об'єкти",
    arcNumber: 5,
    locationName: "Святилище об'єктів",
    title: "Методи, this",
    concept: "Метод — це функція, що є властивістю об'єкта. Усередині методу `this` вказує на об'єкт, НА ЯКОМУ метод викликали (те, що стоїть перед крапкою). Для методів використовуй звичайні функції або скорочений запис `name() {}`: у стрілкових функцій немає власного `this`.",
    example: `const lamp = {
  oil: 2,
  burn() {
    this.oil--;
    return "Олії лишилось: " + this.oil;
  },
};
lamp.burn(); // "Олії лишилось: 1"`,
    missionStory: "Кам'яний страж святилища спить. Щоб пробудити його, треба навчити його говорити про себе і накопичувати енергію.",
    worldEvent: "Очі кам'яного стража спалахнули — він прокинувся.",
    taskType: "write-function",
    prompt: "Додай в об'єкт `guardian` два методи: `introduce()` повертає `\"Я — <name>, енергія: <energy>\"`, а `charge()` збільшує `energy` на 1 і повертає нове значення. Використовуй `this`, а не ім'я об'єкта.",
    exports: ["guardian"],
    starterCode: `const guardian = {
  name: "Страж",
  energy: 3,
  // додай методи introduce() і charge()
};`,
    testCases: [
      {
        name: "guardian.introduce() → \"Я — Страж, енергія: 3\"",
        check(ctx) {
          const result = ctx.get("guardian").introduce();
          return { pass: result === "Я — Страж, енергія: 3", actual: ctx.show(result), expected: "\"Я — Страж, енергія: 3\"" };
        },
      },
      {
        name: "charge() збільшує енергію і повертає її",
        check(ctx) {
          const g = ctx.get("guardian");
          const first = g.charge();
          const second = g.charge();
          return {
            pass: first === 4 && second === 5 && g.introduce() === "Я — Страж, енергія: 5",
            actual: ctx.show(first) + ", " + ctx.show(second),
            expected: "4, 5",
          };
        },
      },
      {
        name: "Метод працює через this і на іншому об'єкті",
        check(ctx) {
          const shadow = { name: "Тінь", energy: 1, introduce: ctx.get("guardian").introduce };
          const result = shadow.introduce();
          return { pass: result === "Я — Тінь, енергія: 1", actual: ctx.show(result), expected: "\"Я — Тінь, енергія: 1\"" };
        },
      },
    ],
    codeChecks: [{ re: /this\.\w+/, label: "Використано this" }],
    solution: `const guardian = {
  name: "Страж",
  energy: 3,
  introduce() {
    return "Я — " + this.name + ", енергія: " + this.energy;
  },
  charge() {
    this.energy++;
    return this.energy;
  },
};`,
    hint: "Пиши методи скорочено: `introduce() { return \"Я — \" + this.name + ...; }`. Не роби їх стрілковими — у них `this` не працює як очікується.",
    difficulty: 2,
  },
  {
    id: 42,
    arc: "Об'єкти",
    arcNumber: 5,
    locationName: "Святилище об'єктів",
    title: "for...in, Object.keys / values",
    concept: "`for (const key in obj)` перебирає ключі об'єкта. `Object.keys(obj)` повертає масив ключів, `Object.values(obj)` — масив значень, а `Object.entries(obj)` — масив пар `[ключ, значення]`. З масивами далі можна працювати через `map`, `reduce` тощо.",
    example: `const bag = { яблука: 3, груші: 2 };
Object.keys(bag);   // ["яблука", "груші"]
Object.values(bag); // [3, 2]
for (const fruit in bag) {
  console.log(fruit, bag[fruit]);
}`,
    missionStory: "Паломники несуть дари до вівтаря. Жриця просить порахувати їх загалом і скласти список для літопису.",
    worldEvent: "Літопис святилища поповнився новим записом.",
    taskType: "write-function",
    prompt: "Напиши дві функції: `countOfferings(offerings)` — сума всіх значень об'єкта (використай `Object.values`); `listOfferings(offerings)` — масив рядків `\"<ключ>: <значення>\"` (через `for...in` або `Object.keys`).",
    exports: ["countOfferings", "listOfferings"],
    starterCode: `function countOfferings(offerings) {

}

function listOfferings(offerings) {

}`,
    testCases: [
      { fn: "countOfferings", input: [{ "свічки": 3, "квіти": 5, "мед": 1 }], expectedOutput: 9 },
      { fn: "countOfferings", input: [{}], expectedOutput: 0 },
      { fn: "listOfferings", input: [{ "свічки": 3, "квіти": 5 }], expectedOutput: ["свічки: 3", "квіти: 5"] },
      { fn: "listOfferings", input: [{}], expectedOutput: [] },
    ],
    codeChecks: [
      { re: /Object\.values\(/, label: "Використано Object.values()" },
      { re: /Object\.keys\(|Object\.entries\(|for\s*\(\s*(const|let|var)\s+\w+\s+in\b/, label: "Ключі перебрано через for...in / Object.keys" },
    ],
    solution: `function countOfferings(offerings) {
  return Object.values(offerings).reduce((sum, n) => sum + n, 0);
}

function listOfferings(offerings) {
  const list = [];
  for (const name in offerings) {
    list.push(name + ": " + offerings[name]);
  }
  return list;
}`,
    hint: "Для суми: `Object.values(offerings).reduce((s, n) => s + n, 0)`. Для списку: у `for (const name in offerings)` значення бери як `offerings[name]`.",
    difficulty: 2,
  },
  {
    id: 43,
    arc: "Об'єкти",
    arcNumber: 5,
    locationName: "Святилище об'єктів",
    title: "in, hasOwnProperty",
    concept: "Оператор `\"key\" in obj` перевіряє, чи є властивість в об'єкті АБО в його прототипі (наприклад, `toString` є в кожного об'єкта). `obj.hasOwnProperty(\"key\")` (або сучасний `Object.hasOwn(obj, \"key\")`) перевіряє лише власні властивості. Властивість може існувати, навіть якщо її значення — `undefined`.",
    example: `const box = { lid: undefined };
"lid" in box;               // true — властивість є
box.lid !== undefined;      // false — але значення порожнє
box.hasOwnProperty("lid");  // true`,
    missionStory: "Святилище перевіряє, чи несеш ти справжні реліквії, чи лише їхні тіні. Розберись, які перевірки що бачать.",
    worldEvent: "Тіні реліквій розсіялись, лишилися справжні.",
    taskType: "predict-output",
    prompt: "Що виведе кожен рядок?",
    starterCode: null,
    code: `const altar = { flame: true, crystal: undefined };
console.log("flame" in altar);
console.log("crystal" in altar);
console.log(altar.crystal !== undefined);
console.log("toString" in altar);
console.log(altar.hasOwnProperty("toString"));`,
    expectedAnswer: ["true", "true", "false", "true", "false"],
    hint: "Властивість `crystal` існує, хоч її значення — `undefined`. А `toString` об'єкт успадковує від `Object.prototype`, тому він не власний.",
    difficulty: 2,
  },
  {
    id: 44,
    arc: "Об'єкти",
    arcNumber: 5,
    locationName: "Святилище об'єктів",
    title: "Деструктуризація",
    concept: "Деструктуризація витягує властивості в змінні одним рядком: `const { name, level } = hero;`. Її можна писати й прямо в параметрах функції: `function f({ name }) {}`. Можна задати значення за замовчуванням: `const { hp = 100 } = hero;`.",
    example: `const hero = { name: "Аліса", level: 4 };
const { name, level } = hero;
// name = "Аліса", level = 4`,
    missionStory: "Жрець читає сувої героїв повільно, рядок за рядком. Навчи його розгортати сувій одним рухом.",
    worldEvent: "Сувої героїв розгортаються самі собою.",
    taskType: "fix-code",
    prompt: "Перепиши функцію, щоб `name`, `level` і `weapon` діставались з `hero` деструктуризацією (у тілі або в параметрах), а не через `hero.name` тощо.",
    functionName: "describeHero",
    starterCode: `function describeHero(hero) {
  const name = hero.name;
  const level = hero.level;
  const weapon = hero.weapon;
  return name + " (рівень " + level + ") з " + weapon;
}`,
    testCases: [
      { input: [{ name: "Аліса", level: 3, weapon: "луком" }], expectedOutput: "Аліса (рівень 3) з луком" },
      { input: [{ name: "Тарас", level: 7, weapon: "мечем", hp: 90 }], expectedOutput: "Тарас (рівень 7) з мечем" },
    ],
    codeChecks: [
      { re: /(const|let|var)\s*\{[^}]*\}\s*=\s*hero\b|describeHero\s*\(\s*\{/, label: "Використано деструктуризацію" },
      { re: /hero\.\w+/, not: true, label: "Немає звертань через hero.властивість" },
    ],
    solution: `function describeHero(hero) {
  const { name, level, weapon } = hero;
  return name + " (рівень " + level + ") з " + weapon;
}`,
    hint: "Заміни три рядки одним: `const { name, level, weapon } = hero;`.",
    difficulty: 1,
  },
  {
    id: 45,
    arc: "Об'єкти",
    arcNumber: 5,
    locationName: "Святилище об'єктів",
    title: "Spread-оператор",
    concept: "Spread `...` розкладає властивості об'єкта в новий об'єкт: `{ ...obj, x: 1 }` — це копія `obj`, де `x` перезаписано. Оригінал лишається незмінним (іммутабельне оновлення). Увага: копія поверхнева — вкладені об'єкти спільні.",
    example: `const base = { hp: 100, mp: 30 };
const buffed = { ...base, mp: 60 };
// buffed: { hp: 100, mp: 60 }, base не змінився`,
    missionStory: "Святилище готове зачарувати твою броню. Але стародавні правила забороняють псувати оригінал — треба створити посилену копію.",
    worldEvent: "Святилище активовано! Стародавні руни сяють над вівтарем.",
    taskType: "write-function",
    prompt: "Напиши функцію `upgradeArmor(armor, bonus)`, яка повертає НОВИЙ об'єкт: копію `armor`, де `defense` збільшено на `bonus`. Оригінальний об'єкт не має змінитися. Використай spread `...`.",
    functionName: "upgradeArmor",
    starterCode: `function upgradeArmor(armor, bonus) {

}`,
    testCases: [
      { input: [{ name: "Кольчуга", defense: 5 }, 3], expectedOutput: { name: "Кольчуга", defense: 8 } },
      {
        name: "Оригінал не змінився, повернено новий об'єкт",
        check(ctx) {
          const armor = { name: "Щит", defense: 10, weight: 4 };
          const result = ctx.fn(armor, 5);
          return {
            pass: result !== armor && armor.defense === 10 && ctx.equal(result, { name: "Щит", defense: 15, weight: 4 }),
            actual: "оригінал " + ctx.show(armor) + ", результат " + ctx.show(result),
            expected: "оригінал з defense 10, результат з defense 15",
          };
        },
      },
    ],
    codeChecks: [{ re: /\.\.\.\s*armor/, label: "Використано spread ...armor" }],
    solution: `function upgradeArmor(armor, bonus) {
  return { ...armor, defense: armor.defense + bonus };
}`,
    hint: "`return { ...armor, defense: armor.defense + bonus };` — властивість після spread перезаписує скопійовану.",
    difficulty: 2,
  },

  /* ───────────── Арка VI — Поширені пастки → Болото багів ───────────── */
  {
    id: 46,
    arc: "Поширені пастки",
    arcNumber: 6,
    locationName: "Болото багів",
    title: "=== vs ==",
    concept: "Нестрога рівність `==` має складні правила приведення типів, і через них виникають неочевидні результати. `NaN` не дорівнює навіть самому собі (для перевірки є `Number.isNaN`). Висновок болота: використовуй `===`.",
    example: `"1" == 1        // true
"" == 0         // true
NaN === NaN     // false
Number.isNaN(NaN) // true`,
    missionStory: "Болотяні баги шепочуть оманливі порівняння. Хто повірить їм — застрягне в трясовині.",
    worldEvent: "Перша трясовина висохла під твоїми ногами.",
    taskType: "predict-output",
    prompt: "Передбач результат кожного порівняння.",
    starterCode: null,
    code: `console.log(0 == "");
console.log("" == "0");
console.log(null == 0);
console.log(NaN == NaN);
console.log([] == false);`,
    expectedAnswer: ["true", "false", "false", "false", "true"],
    hint: "Два рядки порівнюються як рядки, без перетворень. `null` з `==` дорівнює лише `undefined`. `[]` спершу стає рядком \"\", а потім числом 0.",
    difficulty: 3,
  },
  {
    id: 47,
    arc: "Поширені пастки",
    arcNumber: 6,
    locationName: "Болото багів",
    title: "Порядок приведення типів",
    concept: "Оператори `+` і `-` виконуються зліва направо. Поки обидва операнди числа, `+` додає. Щойно з'являється рядок, `+` починає склеювати. `-` завжди перетворює на числа.",
    example: `1 + 1 + "1"  // "21" — спершу 2, потім "2" + "1"
"1" + 1 + 1  // "111" — одразу склеювання`,
    missionStory: "Баг-бухгалтер підкидає тобі рахунки, де числа й рядки перемішані. Порахуй, перш ніж він тебе обдурить.",
    worldEvent: "Баг-бухгалтер утік, розгубивши свої фальшиві рахунки.",
    taskType: "predict-output",
    prompt: "Що виведе кожен рядок?",
    starterCode: null,
    code: `console.log(1 + 2 + "3");
console.log("1" + 2 + 3);
console.log(1 + "2" - 1);
console.log("5" - 2 + "1");`,
    expectedAnswer: ["33", "123", "11", "31"],
    hint: "Обчислюй крок за кроком зліва направо. Наприклад, `1 + \"2\"` дає \"12\", а потім `\"12\" - 1` дає число.",
    difficulty: 3,
  },
  {
    id: 48,
    arc: "Поширені пастки",
    arcNumber: 6,
    locationName: "Болото багів",
    title: "Truthy для рядків",
    concept: "`Boolean(value)` (або `!!value`) показує, чи значення truthy. Для рядків правило просте: порожній рядок `\"\"` — falsy, а будь-який інший — truthy, навіть `\"false\"`, `\"0\"` чи пробіл.",
    example: `Boolean("")      // false
Boolean("так")   // true
!!"false"        // true 🙃`,
    missionStory: "Болотяний оракул відповідає лише «так» чи «ні» на будь-яке слово. Вгадай його відповіді.",
    worldEvent: "Оракул замовк — його загадки розгадано.",
    taskType: "predict-output",
    prompt: "Що виведе кожен рядок?",
    starterCode: null,
    code: `console.log(Boolean("false"));
console.log(Boolean("no"));
console.log(Boolean(""));
console.log(Boolean(" "));
console.log(Boolean("0"));`,
    expectedAnswer: ["true", "true", "false", "true", "true"],
    hint: "Зміст рядка не важливий — важлива лише довжина. Рядок з пробілу не порожній.",
    difficulty: 2,
  },
  {
    id: 49,
    arc: "Поширені пастки",
    arcNumber: 6,
    locationName: "Болото багів",
    title: "Синтаксис функцій",
    concept: "Найчастіші помилки в оголошенні функцій: одруківка в слові `function`, пропущена дужка `{`, а ще стрілкова функція з фігурними дужками без `return` — вона мовчки повертає `undefined`.",
    example: `const ok1 = (x) => x * 2;            // неявний return
const ok2 = (x) => { return x * 2; }; // явний return
const bug = (x) => { x * 2; };        // повертає undefined!`,
    missionStory: "Баги поїли сувій із закляттями. Тепер три закляття не працюють — віднови їх.",
    worldEvent: "Відновлені закляття відігнали рій багів.",
    taskType: "fix-code",
    prompt: "Знайди й виправ помилки у трьох функціях. Кожна має повернути рядок про бага з переданим ім'ям.",
    exports: ["summonBug", "banishBug", "catchBug"],
    starterCode: `funtion summonBug(name) {
  return "Баг " + name + " з'явився!";
}

const banishBug = (name) => {
  "Баг " + name + " вигнано!";
};

function catchBug(name)
  return "Баг " + name + " спіймано!";
}`,
    testCases: [
      { fn: "summonBug", input: ["Глюк"], expectedOutput: "Баг Глюк з'явився!" },
      { fn: "banishBug", input: ["Глюк"], expectedOutput: "Баг Глюк вигнано!" },
      { fn: "catchBug", input: ["Глюк"], expectedOutput: "Баг Глюк спіймано!" },
    ],
    solution: `function summonBug(name) {
  return "Баг " + name + " з'явився!";
}

const banishBug = (name) => {
  return "Баг " + name + " вигнано!";
};

function catchBug(name) {
  return "Баг " + name + " спіймано!";
}`,
    hint: "1) Перевір написання ключового слова в першому рядку. 2) У стрілковій функції з `{}` потрібен `return`. 3) Після параметрів `catchBug(name)` бракує фігурної дужки.",
    difficulty: 2,
  },
  {
    id: 50,
    arc: "Поширені пастки",
    arcNumber: 6,
    locationName: "Болото багів",
    title: "Безкінечний цикл",
    concept: "Якщо умова циклу ніколи не стає хибною, цикл крутиться вічно і «вішає» сторінку. Найчастіша причина — забутий крок (`i++`) у `while`. Тут тренажер зупинить такий цикл, а справжній браузер — ні.",
    example: `let i = 0;
while (i < 3) {
  console.log(i);
  i++; // без цього рядка — вічна петля
}`,
    missionStory: "Болотяний баг зачарував лічильника: той рахує одну й ту саму купину знову і знову, по колу, без кінця.",
    worldEvent: "Лічильник вирвався з петлі й порахував усіх багів.",
    taskType: "fix-code",
    prompt: "Функція має порахувати, скільки разів у масиві трапляється `\"баг\"`, але потрапляє в безкінечний цикл. Знайди й виправ причину.",
    functionName: "countBugs",
    starterCode: `function countBugs(swamp) {
  let count = 0;
  let i = 0;
  while (i < swamp.length) {
    if (swamp[i] === "баг") {
      count++;
    }
  }
  return count;
}`,
    testCases: [
      { input: [["баг", "мох", "баг"]], expectedOutput: 2 },
      { input: [["мох", "очерет"]], expectedOutput: 0 },
      { input: [[]], expectedOutput: 0 },
    ],
    solution: `function countBugs(swamp) {
  let count = 0;
  let i = 0;
  while (i < swamp.length) {
    if (swamp[i] === "баг") {
      count++;
    }
    i++;
  }
  return count;
}`,
    hint: "Змінна `i` ніколи не збільшується, тож умова `i < swamp.length` завжди істинна. Додай `i++` в кінці тіла циклу — поза `if`.",
    difficulty: 1,
  },
  {
    id: 51,
    arc: "Поширені пастки",
    arcNumber: 6,
    locationName: "Болото багів",
    title: "=+ проти +=",
    concept: "`total += x` означає «додай x до total». А `total =+ x` — це `total = +x`: унарний плюс перетворює `x` на число, і `total` просто ПЕРЕЗАПИСУЄТЬСЯ. Синтаксично це коректний код, тому помилки не буде — лише неправильний результат.",
    example: `let sum = 10;
sum += 5;  // 15
sum =+ 5;  // 5 😱 (sum = +5)`,
    missionStory: "Скарбничий болота збирає монети з мішків, але в кінці щоразу лишається тільки вміст останнього мішка. Хтось підмінив один символ!",
    worldEvent: "Монети скарбничого знову сумуються правильно.",
    taskType: "fix-code",
    prompt: "Функція повинна повертати суму всіх чисел масиву, але повертає лише останнє. Знайди підступну одруківку.",
    functionName: "collectCoins",
    starterCode: `function collectCoins(bags) {
  let total = 0;
  for (let i = 0; i < bags.length; i++) {
    total =+ bags[i];
  }
  return total;
}`,
    testCases: [
      { input: [[5, 10, 3]], expectedOutput: 18 },
      { input: [[7]], expectedOutput: 7 },
      { input: [[]], expectedOutput: 0 },
    ],
    codeChecks: [{ re: /=\+/, not: true, label: "Немає підступного =+" }],
    solution: `function collectCoins(bags) {
  let total = 0;
  for (let i = 0; i < bags.length; i++) {
    total += bags[i];
  }
  return total;
}`,
    hint: "Подивись уважно на порядок символів у рядку з `total`. Оператор додавання з присвоєнням пишеться `+=`.",
    difficulty: 2,
  },
  {
    id: 52,
    arc: "Поширені пастки",
    arcNumber: 6,
    locationName: "Болото багів",
    title: "sort() як текст",
    concept: "`sort()` без компаратора порівнює рядки, тож «100» опиняється перед «40». Для сортування чисел за спаданням використовують `(a, b) => b - a`. Зверни увагу: `.reverse()` після неправильного сортування не рятує.",
    example: `[5, 40, 100].sort();                // [100, 40, 5] — рядки: "1" < "4" < "5"
[5, 40, 100].sort().reverse();      // [5, 40, 100] — зовсім не спадання
[5, 40, 100].sort((a, b) => b - a); // [100, 40, 5] ✓`,
    missionStory: "Бос-баг болота стоїть на чолі рейтингу найнебезпечніших. Але рейтинг перекручено, і він ховається за дрібними багами! Виправ рейтинг, щоб викрити боса.",
    worldEvent: "Боса-бага болота переможено! Трясовина стає твердою землею.",
    taskType: "fix-code",
    prompt: "Функція має сортувати силу багів від найбільшої до найменшої, але `[5, 40, 100, 7]` стає `[7, 5, 40, 100]`. Виправ сортування.",
    functionName: "rankBugs",
    starterCode: `function rankBugs(powers) {
  return powers.sort().reverse();
}`,
    testCases: [
      { input: [[5, 40, 100, 7]], expectedOutput: [100, 40, 7, 5] },
      { input: [[1, 2, 10, 20]], expectedOutput: [20, 10, 2, 1] },
      { input: [[3]], expectedOutput: [3] },
    ],
    codeChecks: [{ re: /\.sort\(\s*(\(?\s*\w+\s*,\s*\w+\s*\)?\s*=>|function)/, label: "У sort передано функцію-компаратор" }],
    solution: `function rankBugs(powers) {
  return powers.sort((a, b) => b - a);
}`,
    hint: "Прибери `.reverse()` і передай у `sort` компаратор для спадання: `(a, b) => b - a`.",
    difficulty: 2,
  },
  /* ───────────── Арка VII — DOM, основи → Міст DOM ───────────── */
  {
    id: 53,
    arc: "DOM, основи",
    arcNumber: 7,
    locationName: "Міст DOM",
    title: "querySelector",
    concept: "`document.querySelector(selector)` повертає ПЕРШИЙ елемент, що відповідає CSS-селектору, або `null`, якщо такого немає. Селектори ті самі, що в CSS: `#id`, `.class`, `tag`, і їх можна комбінувати: `.plank.broken`.",
    example: `const title = document.querySelector("h1");
const btn = document.querySelector("#start");
const active = document.querySelector(".tab.active");`,
    missionStory: "Над прірвою висить старий міст. Майстер-мостобудівник просить знайти зламану дошку, перш ніж ставати на нього.",
    worldEvent: "Зламану дошку позначено червоною стрічкою.",
    taskType: "write-function",
    prompt: "Напиши функцію `findBrokenPlank()`, яка через `document.querySelector` повертає елемент, що має одночасно класи `plank` і `broken`.",
    functionName: "findBrokenPlank",
    fileName: "bridge.js",
    html: `<div class="bridge">
  <div class="plank" id="first-plank">Дошка 1</div>
  <div class="plank broken">Дошка 2</div>
  <div class="plank">Дошка 3</div>
</div>`,
    starterCode: `function findBrokenPlank() {

}`,
    testCases: [
      {
        name: "Повертає саме зламану дошку",
        check(ctx) {
          const el = ctx.fn();
          const expected = ctx.$(".plank.broken");
          return { pass: el === expected, actual: ctx.show(el), expected: ctx.show(expected) };
        },
      },
    ],
    codeChecks: [{ re: /querySelector\(/, label: "Використано querySelector()" }],
    solution: `function findBrokenPlank() {
  return document.querySelector(".plank.broken");
}`,
    hint: "Два класи в селекторі пишуться разом без пробілу: `\".plank.broken\"`. Пробіл означав би «вкладений елемент».",
    difficulty: 1,
  },
  {
    id: 54,
    arc: "DOM, основи",
    arcNumber: 7,
    locationName: "Міст DOM",
    title: "querySelectorAll",
    concept: "`querySelectorAll(selector)` повертає `NodeList` — колекцію ВСІХ знайдених елементів. У неї є `forEach` і `length`, а `Array.from(list)` чи `[...list]` перетворює її на звичайний масив.",
    example: `const items = document.querySelectorAll("li");
items.forEach((li) => console.log(li.textContent));
items.length; // кількість елементів`,
    missionStory: "Майстер хоче знати, скільки дощок у мосту і що на кожній написано, щоб скласти кошторис ремонту.",
    worldEvent: "Кошторис ремонту мосту складено.",
    taskType: "write-function",
    prompt: "Напиши функцію `getPlankLabels()`, яка знаходить усі елементи `.plank` через `querySelectorAll` і повертає масив їхніх текстів (`textContent`).",
    functionName: "getPlankLabels",
    fileName: "bridge.js",
    html: `<div class="bridge">
  <div class="plank">Дошка 1</div>
  <div class="plank broken">Дошка 2</div>
  <div class="plank">Дошка 3</div>
</div>`,
    starterCode: `function getPlankLabels() {
  const labels = [];

  return labels;
}`,
    testCases: [
      {
        name: "Повертає [\"Дошка 1\", \"Дошка 2\", \"Дошка 3\"]",
        check(ctx) {
          const labels = ctx.fn();
          return { pass: ctx.equal(labels, ["Дошка 1", "Дошка 2", "Дошка 3"]), actual: ctx.show(labels), expected: "[\"Дошка 1\", \"Дошка 2\", \"Дошка 3\"]" };
        },
      },
      {
        name: "Працює з іншою кількістю дощок",
        html: `<div class="bridge"><div class="plank">A</div><div class="plank">B</div></div>`,
        check(ctx) {
          const labels = ctx.fn();
          return { pass: ctx.equal(labels, ["A", "B"]), actual: ctx.show(labels), expected: "[\"A\", \"B\"]" };
        },
      },
    ],
    codeChecks: [{ re: /querySelectorAll\(/, label: "Використано querySelectorAll()" }],
    solution: `function getPlankLabels() {
  const labels = [];
  document.querySelectorAll(".plank").forEach((plank) => {
    labels.push(plank.textContent);
  });
  return labels;
}`,
    hint: "`document.querySelectorAll(\".plank\").forEach((plank) => labels.push(plank.textContent));`",
    difficulty: 1,
  },
  {
    id: 55,
    arc: "DOM, основи",
    arcNumber: 7,
    locationName: "Міст DOM",
    title: "textContent",
    concept: "`element.textContent` читає або встановлює текст усередині елемента. Під час запису весь вміст замінюється звичайним текстом, а HTML-теги не інтерпретуються, тому це безпечний спосіб показати дані.",
    example: `const score = document.querySelector("#score");
score.textContent = "Рахунок: 10";
console.log(score.textContent); // "Рахунок: 10"`,
    missionStory: "Табличку на початку мосту вкрив мох — напис не прочитати. Онови його.",
    worldEvent: "Свіжий напис на табличці видно здалеку.",
    taskType: "write-function",
    prompt: "Напиши функцію `renameSign(newText)`, яка змінює текст елемента `#bridge-sign` на `newText` через `textContent`.",
    functionName: "renameSign",
    fileName: "bridge.js",
    html: `<p id="bridge-sign">М..т ..М</p>`,
    starterCode: `function renameSign(newText) {

}`,
    testCases: [
      {
        name: "Табличка показує \"Міст DOM: обережно, ремонт\"",
        check(ctx) {
          ctx.fn("Міст DOM: обережно, ремонт");
          const text = ctx.$("#bridge-sign").textContent;
          return { pass: text === "Міст DOM: обережно, ремонт", actual: ctx.show(text), expected: "\"Міст DOM: обережно, ремонт\"" };
        },
      },
      {
        name: "Повторний виклик замінює текст",
        check(ctx) {
          ctx.fn("A");
          ctx.fn("Відкрито");
          const text = ctx.$("#bridge-sign").textContent;
          return { pass: text === "Відкрито", actual: ctx.show(text), expected: "\"Відкрито\"" };
        },
      },
    ],
    codeChecks: [{ re: /\.textContent\s*=/, label: "Текст змінено через textContent" }],
    solution: `function renameSign(newText) {
  document.querySelector("#bridge-sign").textContent = newText;
}`,
    hint: "Знайди елемент через `document.querySelector(\"#bridge-sign\")` і присвой його `textContent`.",
    difficulty: 1,
  },
  {
    id: 56,
    arc: "DOM, основи",
    arcNumber: 7,
    locationName: "Міст DOM",
    title: "innerHTML",
    concept: "`innerHTML` інтерпретує рядок як HTML-розмітку. Якщо вставити туди дані від користувача, можна отримати XSS-атаку: зловмисник підсуне `<img onerror=...>` зі шкідливим скриптом. Для звичайного тексту завжди використовуй `textContent`.",
    example: `const name = '<img src="x" onerror="alert(1)">';
el.innerHTML = name;   // ✗ браузер створить <img> і запустить код
el.textContent = name; // ✓ покаже текст як є`,
    missionStory: "Мандрівники пишуть свої імена на вітальній дошці мосту. Хитрий баг вписав замість імені зачаровану розмітку!",
    worldEvent: "Дошка мосту захищена від шкідливих чар.",
    taskType: "fix-code",
    prompt: "Функція показує ім'я мандрівника через `innerHTML`, тому HTML з імені стає справжніми елементами. Виправ її, щоб ім'я завжди показувалось як звичайний текст.",
    functionName: "showTravelerName",
    fileName: "greeting.js",
    html: `<p id="greeting"></p>`,
    starterCode: `function showTravelerName(name) {
  const greeting = document.querySelector("#greeting");
  greeting.innerHTML = "Вітаємо, " + name + "!";
}`,
    testCases: [
      {
        name: "Звичайне ім'я показується правильно",
        check(ctx) {
          ctx.fn("Мавка");
          const text = ctx.$("#greeting").textContent;
          return { pass: text === "Вітаємо, Мавка!", actual: ctx.show(text), expected: "\"Вітаємо, Мавка!\"" };
        },
      },
      {
        name: "HTML з імені не перетворюється на елементи",
        check(ctx) {
          const evil = '<img src="x" onerror="alert(1)">Баг';
          ctx.fn(evil);
          const el = ctx.$("#greeting");
          return {
            pass: el.children.length === 0 && el.textContent === "Вітаємо, " + evil + "!",
            actual: el.children.length + " вкладених елементів",
            expected: "0 вкладених елементів, увесь текст як є",
          };
        },
      },
    ],
    codeChecks: [{ re: /innerHTML/, not: true, label: "innerHTML більше не використовується" }],
    solution: `function showTravelerName(name) {
  const greeting = document.querySelector("#greeting");
  greeting.textContent = "Вітаємо, " + name + "!";
}`,
    hint: "Достатньо замінити одну властивість: `innerHTML` → `textContent`.",
    difficulty: 1,
  },
  {
    id: 57,
    arc: "DOM, основи",
    arcNumber: 7,
    locationName: "Міст DOM",
    title: "element.style",
    concept: "Через `element.style` можна змінювати інлайн-стилі елемента. Назви CSS-властивостей пишуться в camelCase: `background-color` → `style.backgroundColor`, `font-size` → `style.fontSize`. Значення — рядки з одиницями виміру: `\"20px\"`.",
    example: `const box = document.querySelector(".box");
box.style.backgroundColor = "gold";
box.style.fontSize = "24px";`,
    missionStory: "Нові дошки мосту світлі й непомітні в тумані. Пофарбуй міст і зроби бортик ширшим, щоб мандрівники бачили дорогу.",
    worldEvent: "Пофарбований міст добре видно навіть у тумані.",
    taskType: "write-function",
    prompt: "Напиши функцію `paintBridge(color)`, яка змінює стилі елемента `#bridge`: `backgroundColor` стає `color`, а `borderWidth` — `\"4px\"`.",
    functionName: "paintBridge",
    fileName: "bridge.js",
    html: `<div id="bridge" style="border: 1px solid black">Міст</div>`,
    starterCode: `function paintBridge(color) {
  const bridge = document.querySelector("#bridge");

}`,
    testCases: [
      {
        name: "Колір фону і ширина бортика змінені",
        check(ctx) {
          ctx.fn("brown");
          const style = ctx.$("#bridge").style;
          return {
            pass: style.backgroundColor === "brown" && style.borderWidth === "4px",
            actual: "backgroundColor: " + ctx.show(style.backgroundColor) + ", borderWidth: " + ctx.show(style.borderWidth),
            expected: "backgroundColor: \"brown\", borderWidth: \"4px\"",
          };
        },
      },
      {
        name: "Колір береться з параметра",
        check(ctx) {
          ctx.fn("teal");
          const color = ctx.$("#bridge").style.backgroundColor;
          return { pass: color === "teal", actual: ctx.show(color), expected: "\"teal\"" };
        },
      },
    ],
    codeChecks: [{ re: /\.style\.backgroundColor\s*=/, label: "Використано style.backgroundColor" }],
    solution: `function paintBridge(color) {
  const bridge = document.querySelector("#bridge");
  bridge.style.backgroundColor = color;
  bridge.style.borderWidth = "4px";
}`,
    hint: "`bridge.style.backgroundColor = color;` і `bridge.style.borderWidth = \"4px\";`. Без одиниці `px` значення не застосується.",
    difficulty: 1,
  },
  {
    id: 58,
    arc: "DOM, основи",
    arcNumber: 7,
    locationName: "Міст DOM",
    title: "classList add / remove",
    concept: "`classList` керує класами елемента: `add(\"x\")` додає клас, `remove(\"x\")` прибирає, `contains(\"x\")` перевіряє наявність. Це кращий спосіб змінювати вигляд, ніж прямі стилі: оформлення лишається в CSS.",
    example: `const door = document.querySelector(".door");
door.classList.add("open");
door.classList.remove("locked");
door.classList.contains("open"); // true`,
    missionStory: "Майстер відремонтував дошку, але в кресленні вона досі позначена як зламана. Онови позначки.",
    worldEvent: "Відремонтована дошка блищить свіжим лаком.",
    taskType: "write-function",
    prompt: "Напиши функцію `repairPlank(id)`: знайди елемент з цим `id`, прибери з нього клас `broken` і додай клас `fixed`.",
    functionName: "repairPlank",
    fileName: "bridge.js",
    html: `<div class="bridge">
  <div class="plank broken" id="p1">Дошка 1</div>
  <div class="plank broken" id="p2">Дошка 2</div>
</div>`,
    starterCode: `function repairPlank(id) {
  const plank = document.querySelector("#" + id);

}`,
    testCases: [
      {
        name: "Дошка p2 стала fixed і не broken",
        check(ctx) {
          ctx.fn("p2");
          const p1 = ctx.$("#p1").classList;
          const p2 = ctx.$("#p2").classList;
          return {
            pass: p2.contains("fixed") && !p2.contains("broken") && p2.contains("plank") && p1.contains("broken"),
            actual: "p2: \"" + ctx.$("#p2").className + "\", p1: \"" + ctx.$("#p1").className + "\"",
            expected: "p2: \"plank fixed\", p1 без змін",
          };
        },
      },
    ],
    codeChecks: [
      { re: /classList\.remove\(/, label: "Використано classList.remove()" },
      { re: /classList\.add\(/, label: "Використано classList.add()" },
    ],
    solution: `function repairPlank(id) {
  const plank = document.querySelector("#" + id);
  plank.classList.remove("broken");
  plank.classList.add("fixed");
}`,
    hint: "`plank.classList.remove(\"broken\");` і `plank.classList.add(\"fixed\");`. Клас `plank` має лишитися.",
    difficulty: 1,
  },
  {
    id: 59,
    arc: "DOM, основи",
    arcNumber: 7,
    locationName: "Міст DOM",
    title: "classList.toggle",
    concept: "`classList.toggle(\"x\")` додає клас, якщо його немає, і прибирає, якщо є. Він повертає `true`, коли клас після виклику присутній. Так роблять перемикачі: показати/сховати, увімкнути/вимкнути.",
    example: `const menu = document.querySelector(".menu");
menu.classList.toggle("hidden"); // сховали (true)
menu.classList.toggle("hidden"); // показали (false)`,
    missionStory: "На мосту стоїть скриня з картою переправи. Мандрівники хочуть відкривати й ховати карту одним рухом.",
    worldEvent: "Карту переправи тепер видно одним дотиком.",
    taskType: "write-function",
    prompt: "Напиши функцію `toggleMap()`, яка перемикає клас `hidden` на елементі `#map-panel` і повертає `true`, якщо панель тепер ВИДИМА (тобто класу `hidden` немає), інакше `false`.",
    functionName: "toggleMap",
    fileName: "map.js",
    html: `<div id="map-panel" class="panel hidden">Карта переправи</div>`,
    starterCode: `function toggleMap() {
  const panel = document.querySelector("#map-panel");

}`,
    testCases: [
      {
        name: "Перший виклик показує карту і повертає true",
        check(ctx) {
          const visible = ctx.fn();
          const hidden = ctx.$("#map-panel").classList.contains("hidden");
          return { pass: visible === true && !hidden, actual: ctx.show(visible) + ", hidden: " + hidden, expected: "true, hidden: false" };
        },
      },
      {
        name: "Другий виклик ховає карту і повертає false",
        check(ctx) {
          ctx.fn();
          const visible = ctx.fn();
          const hidden = ctx.$("#map-panel").classList.contains("hidden");
          return { pass: visible === false && hidden, actual: ctx.show(visible) + ", hidden: " + hidden, expected: "false, hidden: true" };
        },
      },
    ],
    codeChecks: [{ re: /classList\.toggle\(/, label: "Використано classList.toggle()" }],
    solution: `function toggleMap() {
  const panel = document.querySelector("#map-panel");
  const isHidden = panel.classList.toggle("hidden");
  return !isHidden;
}`,
    hint: "`toggle(\"hidden\")` повертає `true`, коли клас `hidden` додано, тобто панель сховано. Тобі потрібно протилежне — поверни `!результат`.",
    difficulty: 2,
  },
  {
    id: 60,
    arc: "DOM, основи",
    arcNumber: 7,
    locationName: "Міст DOM",
    title: "getAttribute / setAttribute",
    concept: "`getAttribute(\"name\")` читає значення атрибута точно так, як воно записане в HTML. `setAttribute(\"name\", value)` встановлює або змінює атрибут. Так змінюють `src`, `alt`, `href`, `data-*`, `aria-*` атрибути.",
    example: `const link = document.querySelector("a");
link.getAttribute("href");          // "/map"
link.setAttribute("href", "/home");
link.setAttribute("aria-label", "На головну");`,
    missionStory: "Біля мосту висить портрет брами. Брама вже відновлена, а портрет досі показує руїни. Онови зображення та підпис.",
    worldEvent: "Портрет біля мосту показує відновлену браму.",
    taskType: "write-function",
    prompt: "Напиши функцію `updateGateImage()`: прочитай атрибут `src` у `#gate`, зміни `src` на `\"gate-fixed.png\"`, а `alt` — на `\"Відновлена брама\"`. Поверни СТАРЕ значення `src`.",
    functionName: "updateGateImage",
    fileName: "gate.js",
    html: `<img id="gate" src="gate-broken.png" alt="Зламана брама">`,
    starterCode: `function updateGateImage() {
  const gate = document.querySelector("#gate");

}`,
    testCases: [
      {
        name: "Повертає старий src \"gate-broken.png\"",
        check(ctx) {
          const old = ctx.fn();
          return { pass: old === "gate-broken.png", actual: ctx.show(old), expected: "\"gate-broken.png\"" };
        },
      },
      {
        name: "Атрибути src і alt оновлено",
        check(ctx) {
          ctx.fn();
          const gate = ctx.$("#gate");
          const src = gate.getAttribute("src");
          const alt = gate.getAttribute("alt");
          return {
            pass: src === "gate-fixed.png" && alt === "Відновлена брама",
            actual: "src=" + ctx.show(src) + ", alt=" + ctx.show(alt),
            expected: "src=\"gate-fixed.png\", alt=\"Відновлена брама\"",
          };
        },
      },
    ],
    codeChecks: [
      { re: /getAttribute\(/, label: "Використано getAttribute()" },
      { re: /setAttribute\(/, label: "Використано setAttribute()" },
    ],
    solution: `function updateGateImage() {
  const gate = document.querySelector("#gate");
  const oldSrc = gate.getAttribute("src");
  gate.setAttribute("src", "gate-fixed.png");
  gate.setAttribute("alt", "Відновлена брама");
  return oldSrc;
}`,
    hint: "Спочатку збережи `gate.getAttribute(\"src\")` у змінну, а вже потім викликай `setAttribute` — інакше прочитаєш нове значення.",
    difficulty: 2,
  },
  {
    id: 61,
    arc: "DOM, основи",
    arcNumber: 7,
    locationName: "Міст DOM",
    title: "Практика: кнопка ремонту",
    concept: "Практика об'єднує все вивчене: знайти елементи, змінити текст і стиль. Найпростіший спосіб відреагувати на клік — присвоїти функцію властивості `onclick` кнопки (детальніше про події — в наступній арці).",
    example: `const btn = document.querySelector("#btn");
function sayHi() {
  document.querySelector("#out").textContent = "Привіт!";
}
btn.onclick = sayHi; // без дужок: передаємо функцію, а не викликаємо її`,
    missionStory: "Перший проліт мосту готовий! Майстер ставить біля нього кнопку: натиснеш — і табличка сповістить усіх, що прохід відкрито.",
    worldEvent: "Перший проліт мосту відкрито для мандрівників.",
    taskType: "write-function",
    prompt: "Напиши функцію `repairBridge()`, яка змінює текст `#status` на `\"Міст відновлено!\"` і його колір (`style.color`) на `\"limegreen\"`. Признач цю функцію кнопці `#repair-btn` через `onclick`.",
    functionName: "repairBridge",
    fileName: "bridge.js",
    html: `<button id="repair-btn">Полагодити</button>
<p id="status">Міст зруйновано</p>`,
    starterCode: `const button = document.querySelector("#repair-btn");
const status = document.querySelector("#status");

function repairBridge() {

}

// признач функцію кнопці`,
    testCases: [
      {
        name: "До кліку нічого не змінюється",
        check(ctx) {
          const text = ctx.$("#status").textContent;
          return { pass: text === "Міст зруйновано", actual: ctx.show(text), expected: "\"Міст зруйновано\"" };
        },
      },
      {
        name: "Після кліку: новий текст і зелений колір",
        check(ctx) {
          ctx.fire(ctx.$("#repair-btn"), "click");
          const status = ctx.$("#status");
          return {
            pass: status.textContent === "Міст відновлено!" && status.style.color === "limegreen",
            actual: ctx.show(status.textContent) + ", колір " + ctx.show(status.style.color),
            expected: "\"Міст відновлено!\", колір \"limegreen\"",
          };
        },
      },
    ],
    codeChecks: [{ re: /\.onclick\s*=\s*repairBridge\b/, label: "Функцію призначено через onclick" }],
    solution: `const button = document.querySelector("#repair-btn");
const status = document.querySelector("#status");

function repairBridge() {
  status.textContent = "Міст відновлено!";
  status.style.color = "limegreen";
}

button.onclick = repairBridge;`,
    hint: "У тілі функції зміни `status.textContent` і `status.style.color`. А в кінці напиши `button.onclick = repairBridge;` — без дужок після імені.",
    difficulty: 2,
  },

  /* ───────────── Арка VIII — Події → Міст DOM ───────────── */
  {
    id: 62,
    arc: "Події",
    arcNumber: 8,
    locationName: "Міст DOM",
    title: "addEventListener (click)",
    concept: "`element.addEventListener(\"click\", handler)` підписує функцію на подію. На відміну від `onclick`, так можна додати кілька обробників на одну подію, а потім зняти їх через `removeEventListener`.",
    example: `const btn = document.querySelector("#jump");
btn.addEventListener("click", () => {
  console.log("Стрибок!");
});`,
    missionStory: "На середині мосту висить дзвін. Вартові домовились: скільки ударів, стільки возів можна пропустити.",
    worldEvent: "Дзвін на мосту лунає над прірвою.",
    taskType: "write-function",
    prompt: "Через `addEventListener` додай кнопці `#ring-bell` обробник кліку: кожен клік збільшує лічильник і показує його в `#bell-count` (перший клік — \"1\", другий — \"2\"...).",
    fileName: "bell.js",
    html: `<button id="ring-bell">Подзвонити</button>
<p id="bell-count">0</p>`,
    starterCode: `const bell = document.querySelector("#ring-bell");
const counter = document.querySelector("#bell-count");
let rings = 0;

// додай обробник кліку`,
    testCases: [
      {
        name: "Три кліки → лічильник \"3\"",
        check(ctx) {
          const btn = ctx.$("#ring-bell");
          ctx.fire(btn, "click");
          ctx.fire(btn, "click");
          ctx.fire(btn, "click");
          const text = ctx.$("#bell-count").textContent;
          return { pass: text === "3", actual: ctx.show(text), expected: "\"3\"" };
        },
      },
      {
        name: "Один клік → \"1\"",
        check(ctx) {
          ctx.fire(ctx.$("#ring-bell"), "click");
          const text = ctx.$("#bell-count").textContent;
          return { pass: text === "1", actual: ctx.show(text), expected: "\"1\"" };
        },
      },
    ],
    codeChecks: [{ re: /addEventListener\(\s*["'`]click["'`]/, label: "Використано addEventListener(\"click\", ...)" }],
    solution: `const bell = document.querySelector("#ring-bell");
const counter = document.querySelector("#bell-count");
let rings = 0;

bell.addEventListener("click", () => {
  rings++;
  counter.textContent = rings;
});`,
    hint: "У обробнику: `rings++;` а потім `counter.textContent = rings;`.",
    difficulty: 1,
  },
  {
    id: 63,
    arc: "Події",
    arcNumber: 8,
    locationName: "Міст DOM",
    title: "Подія input",
    concept: "Подія `input` спрацьовує при кожній зміні значення поля — під час набору кожного символу. Поточне значення лежить у `input.value` (або `event.target.value`). Так роблять «живий» попередній перегляд.",
    example: `const field = document.querySelector("#search");
field.addEventListener("input", (event) => {
  console.log("Шукаємо:", event.target.value);
});`,
    missionStory: "Біля мосту гравер вирізає імена героїв на пам'ятній дошці. Він хоче бачити напис просто під час набору.",
    worldEvent: "На пам'ятній дошці з'явилось твоє ім'я.",
    taskType: "write-function",
    prompt: "Додай полю `#hero-name` обробник події `input`, який під час кожної зміни записує в `#preview` текст `\"Герой: \"` + поточне значення поля.",
    fileName: "preview.js",
    html: `<input id="hero-name" type="text" placeholder="Ім'я героя">
<p id="preview">Герой: </p>`,
    starterCode: `const nameInput = document.querySelector("#hero-name");
const preview = document.querySelector("#preview");

// реагуй на подію input`,
    testCases: [
      {
        name: "Набір \"Аліса\" → \"Герой: Аліса\"",
        check(ctx) {
          const input = ctx.$("#hero-name");
          input.value = "Аліса";
          ctx.fire(input, "input");
          const text = ctx.$("#preview").textContent;
          return { pass: text === "Герой: Аліса", actual: ctx.show(text), expected: "\"Герой: Аліса\"" };
        },
      },
      {
        name: "Попередній перегляд оновлюється при кожній зміні",
        check(ctx) {
          const input = ctx.$("#hero-name");
          input.value = "Т";
          ctx.fire(input, "input");
          input.value = "Тарас";
          ctx.fire(input, "input");
          const text = ctx.$("#preview").textContent;
          return { pass: text === "Герой: Тарас", actual: ctx.show(text), expected: "\"Герой: Тарас\"" };
        },
      },
    ],
    codeChecks: [{ re: /addEventListener\(\s*["'`]input["'`]/, label: "Обробник події input" }],
    solution: `const nameInput = document.querySelector("#hero-name");
const preview = document.querySelector("#preview");

nameInput.addEventListener("input", () => {
  preview.textContent = "Герой: " + nameInput.value;
});`,
    hint: "`nameInput.addEventListener(\"input\", () => { preview.textContent = \"Герой: \" + nameInput.value; });`",
    difficulty: 1,
  },
  {
    id: 64,
    arc: "Події",
    arcNumber: 8,
    locationName: "Міст DOM",
    title: "Подія submit",
    concept: "Подія `submit` спрацьовує на формі, коли її відправляють кнопкою або клавішею Enter. За замовчуванням браузер перезавантажує сторінку, тому в обробнику викликають `event.preventDefault()` і обробляють дані самостійно.",
    example: `form.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log("Дані форми:", input.value);
});`,
    missionStory: "Будівельна гільдія набирає майстрів до загону. Заповни форму запису — і гільдія привітає нового члена.",
    worldEvent: "До будівельного загону приєднались нові майстри.",
    taskType: "write-function",
    prompt: "Додай формі `#join-form` обробник `submit`: скасуй стандартну відправку (`preventDefault`) і запиши в `#message` текст `\"Вітаємо в загоні, <ім'я>!\"`, де ім'я береться з поля `#hero`.",
    fileName: "guild.js",
    html: `<form id="join-form">
  <input id="hero" name="hero">
  <button type="submit">Записатись</button>
</form>
<p id="message"></p>`,
    starterCode: `const form = document.querySelector("#join-form");

// обробник submit`,
    testCases: [
      {
        name: "Після відправки з'являється привітання",
        check(ctx) {
          ctx.$("#hero").value = "Аліса";
          ctx.fire(ctx.$("#join-form"), "submit");
          const text = ctx.$("#message").textContent;
          return { pass: text === "Вітаємо в загоні, Аліса!", actual: ctx.show(text), expected: "\"Вітаємо в загоні, Аліса!\"" };
        },
      },
      {
        name: "Стандартну відправку скасовано",
        check(ctx) {
          ctx.$("#hero").value = "Тарас";
          const event = ctx.fire(ctx.$("#join-form"), "submit");
          return { pass: event.defaultPrevented, actual: "defaultPrevented: " + event.defaultPrevented, expected: "defaultPrevented: true" };
        },
      },
    ],
    codeChecks: [{ re: /addEventListener\(\s*["'`]submit["'`]/, label: "Обробник події submit" }],
    solution: `const form = document.querySelector("#join-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#hero").value;
  document.querySelector("#message").textContent = "Вітаємо в загоні, " + name + "!";
});`,
    hint: "Обробник має приймати параметр `event`. Першим рядком виклич `event.preventDefault();`, далі прочитай `#hero` і онови `#message`.",
    difficulty: 2,
  },
  {
    id: 65,
    arc: "Події",
    arcNumber: 8,
    locationName: "Міст DOM",
    title: "event.target",
    concept: "Обробник отримує об'єкт події, а `event.target` — це елемент, на якому подія відбулася. Завдяки цьому одна функція може обслуговувати кілька елементів і знати, який саме натиснули.",
    example: `function onPick(event) {
  console.log("Натиснуто:", event.target.textContent);
}
buttons.forEach((b) => b.addEventListener("click", onPick));`,
    missionStory: "На мосту три брами різних кольорів, і всі ведуть в одну вартівню. Вартовий має знати, через яку браму ти пройшов.",
    worldEvent: "Вартовий записав твій вибір у книгу мосту.",
    taskType: "write-function",
    prompt: "Допиши функцію `handleChoice(event)`: вона записує в `#choice` текст `\"Обрано: \"` + текст кнопки, на яку натиснули. Використай `event.target`. Код підписки на кліки вже готовий.",
    functionName: "handleChoice",
    fileName: "doors.js",
    html: `<button class="door">Червона брама</button>
<button class="door">Синя брама</button>
<button class="door">Зелена брама</button>
<p id="choice"></p>`,
    starterCode: `function handleChoice(event) {
  // запиши в #choice: "Обрано: " + текст натиснутої кнопки
}

document.querySelectorAll(".door").forEach((door) => {
  door.addEventListener("click", handleChoice);
});`,
    testCases: [
      {
        name: "Клік на «Синя брама»",
        check(ctx) {
          ctx.fire(ctx.$$(".door")[1], "click");
          const text = ctx.$("#choice").textContent;
          return { pass: text === "Обрано: Синя брама", actual: ctx.show(text), expected: "\"Обрано: Синя брама\"" };
        },
      },
      {
        name: "Клік на «Зелена брама»",
        check(ctx) {
          ctx.fire(ctx.$$(".door")[2], "click");
          const text = ctx.$("#choice").textContent;
          return { pass: text === "Обрано: Зелена брама", actual: ctx.show(text), expected: "\"Обрано: Зелена брама\"" };
        },
      },
    ],
    codeChecks: [{ re: /\.target\b/, label: "Використано event.target" }],
    solution: `function handleChoice(event) {
  document.querySelector("#choice").textContent = "Обрано: " + event.target.textContent;
}

document.querySelectorAll(".door").forEach((door) => {
  door.addEventListener("click", handleChoice);
});`,
    hint: "Текст натиснутої кнопки — це `event.target.textContent`.",
    difficulty: 2,
  },
  {
    id: 66,
    arc: "Події",
    arcNumber: 8,
    locationName: "Міст DOM",
    title: "preventDefault",
    concept: "`event.preventDefault()` — це МЕТОД, тож його треба викликати з дужками. Запис `event.preventDefault;` без дужок лише звертається до функції і нічого не робить — помилки немає, але сторінка перезавантажиться.",
    example: `form.addEventListener("submit", (event) => {
  event.preventDefault(); // ✓ дужки обов'язкові
});`,
    missionStory: "Сигнальна вежа мосту надсилає повідомлення, але щоразу все гасне й починається спочатку — «сторінка перезавантажується»!",
    worldEvent: "Сигнальні вогні мосту горять рівно і не гаснуть.",
    taskType: "fix-code",
    prompt: "Після відправки форми сторінка перезавантажується, і повідомлення зникає. Знайди, чому стандартна дія не скасовується, і виправ.",
    fileName: "signal.js",
    html: `<form id="signal-form">
  <input id="signal" value="Все спокійно">
  <button type="submit">Надіслати</button>
</form>
<p id="log"></p>`,
    starterCode: `const form = document.querySelector("#signal-form");

form.addEventListener("submit", function (event) {
  event.preventDefault;
  const signal = document.querySelector("#signal").value;
  document.querySelector("#log").textContent = "Сигнал надіслано: " + signal;
});`,
    testCases: [
      {
        name: "Стандартна відправка скасована",
        check(ctx) {
          const event = ctx.fire(ctx.$("#signal-form"), "submit");
          return { pass: event.defaultPrevented, actual: "defaultPrevented: " + event.defaultPrevented, expected: "defaultPrevented: true" };
        },
      },
      {
        name: "Повідомлення з'являється в журналі",
        check(ctx) {
          ctx.fire(ctx.$("#signal-form"), "submit");
          const text = ctx.$("#log").textContent;
          return { pass: text === "Сигнал надіслано: Все спокійно", actual: ctx.show(text), expected: "\"Сигнал надіслано: Все спокійно\"" };
        },
      },
    ],
    codeChecks: [{ re: /preventDefault\(\s*\)/, label: "preventDefault() викликано з дужками" }],
    solution: `const form = document.querySelector("#signal-form");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const signal = document.querySelector("#signal").value;
  document.querySelector("#log").textContent = "Сигнал надіслано: " + signal;
});`,
    hint: "Подивись на перший рядок обробника. Метод без `()` не виконується.",
    difficulty: 1,
  },
  {
    id: 67,
    arc: "Події",
    arcNumber: 8,
    locationName: "Міст DOM",
    title: "Делегування подій",
    concept: "Події «спливають» від елемента до його батьків. Тому можна повісити ОДИН обробник на батьківський елемент і через `event.target` (або `event.target.closest(\"li\")`) дізнаватись, на якого нащадка клікнули. Перевага: обробник працює навіть для елементів, доданих пізніше.",
    example: `list.addEventListener("click", (event) => {
  const item = event.target.closest("li");
  if (!item) return;
  item.classList.toggle("done");
});`,
    missionStory: "Дощок на мосту сотні, а нові з'являються щодня. Чіпляти слухача на кожну — справжня мука. Майстер шукає розумніший спосіб.",
    worldEvent: "Майстер може лагодити будь-яку дошку одним рухом.",
    taskType: "write-function",
    prompt: "Додай ОДИН обробник кліку на список `#planks`: клік на будь-який `<li>` перемикає на ньому клас `fixed`. Обробник має працювати й для дощок, доданих пізніше.",
    fileName: "planks.js",
    html: `<ul id="planks">
  <li>Дошка 1</li>
  <li>Дошка 2</li>
  <li>Дошка 3</li>
</ul>`,
    starterCode: `const planks = document.querySelector("#planks");

// один обробник на весь список`,
    testCases: [
      {
        name: "Клік на другу дошку позначає лише її",
        check(ctx) {
          const items = ctx.$$("#planks li");
          ctx.fire(items[1], "click");
          const states = items.map((li) => li.classList.contains("fixed"));
          return { pass: ctx.equal(states, [false, true, false]), actual: ctx.show(states), expected: "[false, true, false]" };
        },
      },
      {
        name: "Повторний клік знімає позначку",
        check(ctx) {
          const item = ctx.$$("#planks li")[0];
          ctx.fire(item, "click");
          ctx.fire(item, "click");
          return { pass: !item.classList.contains("fixed"), actual: "fixed: " + item.classList.contains("fixed"), expected: "fixed: false" };
        },
      },
      {
        name: "Працює для нової дошки, доданої після запуску",
        check(ctx) {
          const li = ctx.doc.createElement("li");
          li.textContent = "Дошка 4";
          ctx.$("#planks").appendChild(li);
          ctx.fire(li, "click");
          return { pass: li.classList.contains("fixed"), actual: "fixed: " + li.classList.contains("fixed"), expected: "fixed: true" };
        },
      },
    ],
    codeChecks: [
      { re: /addEventListener[\s\S]*addEventListener/, not: true, label: "Лише один addEventListener" },
      { re: /\.target\b/, label: "Використано event.target" },
    ],
    solution: `const planks = document.querySelector("#planks");

planks.addEventListener("click", (event) => {
  const item = event.target.closest("li");
  if (!item) return;
  item.classList.toggle("fixed");
});`,
    hint: "Обробник вішай на `planks`, а не на кожен `li`. Усередині знайди дошку через `event.target.closest(\"li\")` і виклич `classList.toggle(\"fixed\")`.",
    difficulty: 3,
  },
  {
    id: 68,
    arc: "Події",
    arcNumber: 8,
    locationName: "Міст DOM",
    title: "Практика: форма без перезавантаження",
    concept: "Типова форма в сучасному застосунку: перехопити `submit`, скасувати перезавантаження, прочитати й очистити значення (`trim()`), проігнорувати порожній ввід, додати запис на сторінку та очистити поле.",
    example: `form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  // ...додати text у список
  input.value = "";
});`,
    missionStory: "Другий проліт мосту майже готовий! Склад гільдії приймає замовлення на матеріали через форму. Вона не повинна загубити жодного запису.",
    worldEvent: "Другий проліт мосту завершено, обоз із матеріалами в дорозі.",
    taskType: "write-function",
    prompt: "Зроби форму `#supply-form`: при відправці скасуй перезавантаження, візьми значення з `#supply` без пробілів по краях, і якщо воно не порожнє — додай `<li>` з цим текстом у `#supplies` та очисти поле. Порожній ввід ігноруй.",
    fileName: "supplies.js",
    html: `<form id="supply-form">
  <input id="supply" placeholder="Що потрібно?">
  <button type="submit">Замовити</button>
</form>
<ul id="supplies"></ul>`,
    starterCode: `const form = document.querySelector("#supply-form");
const input = document.querySelector("#supply");
const list = document.querySelector("#supplies");

`,
    testCases: [
      {
        name: "Замовлення \"  Мотузка \" додає <li>Мотузка</li> і очищує поле",
        check(ctx) {
          ctx.$("#supply").value = "  Мотузка ";
          const event = ctx.fire(ctx.$("#supply-form"), "submit");
          const items = ctx.$$("#supplies li").map((li) => li.textContent);
          return {
            pass: event.defaultPrevented && ctx.equal(items, ["Мотузка"]) && ctx.$("#supply").value === "",
            actual: "список " + ctx.show(items) + ", поле " + ctx.show(ctx.$("#supply").value) + ", preventDefault: " + event.defaultPrevented,
            expected: "список [\"Мотузка\"], поле \"\", preventDefault: true",
          };
        },
      },
      {
        name: "Порожній ввід не додає запис",
        check(ctx) {
          ctx.$("#supply").value = "   ";
          const event = ctx.fire(ctx.$("#supply-form"), "submit");
          const count = ctx.$$("#supplies li").length;
          return { pass: count === 0 && event.defaultPrevented, actual: count + " записів", expected: "0 записів" };
        },
      },
      {
        name: "Кілька замовлень поспіль",
        check(ctx) {
          ["Цвяхи", "Дошки"].forEach((item) => {
            ctx.$("#supply").value = item;
            ctx.fire(ctx.$("#supply-form"), "submit");
          });
          const items = ctx.$$("#supplies li").map((li) => li.textContent);
          return { pass: ctx.equal(items, ["Цвяхи", "Дошки"]), actual: ctx.show(items), expected: "[\"Цвяхи\", \"Дошки\"]" };
        },
      },
    ],
    codeChecks: [
      { re: /preventDefault\(\s*\)/, label: "Викликано preventDefault()" },
      { re: /\.trim\(\)/, label: "Використано trim()" },
    ],
    solution: `const form = document.querySelector("#supply-form");
const input = document.querySelector("#supply");
const list = document.querySelector("#supplies");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  const li = document.createElement("li");
  li.textContent = text;
  list.appendChild(li);
  input.value = "";
});`,
    hint: "Створи `<li>` через `document.createElement(\"li\")`, задай йому `textContent` і додай через `list.appendChild(li)`. Перевірку на порожнечу роби після `trim()`.",
    difficulty: 3,
  },

  /* ───────────── Арка IX — DOM, динамічний контент → Міст DOM ───────────── */
  {
    id: 69,
    arc: "DOM, динамічний контент",
    arcNumber: 9,
    locationName: "Міст DOM",
    title: "createElement",
    concept: "`document.createElement(\"tag\")` створює новий елемент у пам'яті. Поки його не додано на сторінку, його не видно. Перед вставкою елементу зазвичай задають текст, класи й атрибути.",
    example: `const badge = document.createElement("span");
badge.className = "badge";
badge.textContent = "Новий!";`,
    missionStory: "Для третього прольоту потрібні нові факели. Коваль кує їх за кресленням — один за одним.",
    worldEvent: "Коваль викував партію нових факелів.",
    taskType: "write-function",
    prompt: "Напиши функцію `createTorch(color)`, яка створює і повертає елемент `<li>` з класом `torch` і текстом `\"Факел (<color>)\"`. На сторінку його додавати не треба.",
    functionName: "createTorch",
    fileName: "forge.js",
    starterCode: `function createTorch(color) {

}`,
    testCases: [
      {
        name: "Створює <li class=\"torch\">Факел (синій)</li>",
        check(ctx) {
          const el = ctx.fn("синій");
          const ok = el && el.tagName === "LI" && el.classList.contains("torch") && el.textContent === "Факел (синій)";
          return { pass: !!ok, actual: ctx.show(el), expected: "<li class=\"torch\">Факел (синій)</li>" };
        },
      },
      {
        name: "Кожен виклик створює новий елемент",
        check(ctx) {
          const a = ctx.fn("червоний");
          const b = ctx.fn("червоний");
          return { pass: a !== b && a.textContent === "Факел (червоний)", actual: a === b ? "один і той самий елемент" : "два різні елементи", expected: "два різні елементи" };
        },
      },
    ],
    codeChecks: [{ re: /createElement\(/, label: "Використано createElement()" }],
    solution: `function createTorch(color) {
  const torch = document.createElement("li");
  torch.classList.add("torch");
  torch.textContent = "Факел (" + color + ")";
  return torch;
}`,
    hint: "`document.createElement(\"li\")`, потім `classList.add(\"torch\")` і `textContent = \"Факел (\" + color + \")\"`. Не забудь повернути елемент.",
    difficulty: 1,
  },
  {
    id: 70,
    arc: "DOM, динамічний контент",
    arcNumber: 9,
    locationName: "Міст DOM",
    title: "appendChild",
    concept: "`parent.appendChild(child)` додає елемент у кінець батьківського — і елемент з'являється на сторінці. Сучасна альтернатива `parent.append(...)` вміє додавати одразу кілька вузлів і рядки.",
    example: `const list = document.querySelector("#log");
const li = document.createElement("li");
li.textContent = "Запис 1";
list.appendChild(li);`,
    missionStory: "Третій проліт мосту будується дошка за дошкою. Кожну нову дошку треба покласти в кінець настилу.",
    worldEvent: "Настил третього прольоту дотягнувся до середини прірви.",
    taskType: "write-function",
    prompt: "Напиши функцію `addPlank(number)`: створи `<div class=\"plank\">` з текстом `\"Дошка <number>\"`, додай його в кінець `#bridge` через `appendChild` і поверни створений елемент.",
    functionName: "addPlank",
    fileName: "bridge.js",
    html: `<div id="bridge"></div>`,
    starterCode: `function addPlank(number) {
  const bridge = document.querySelector("#bridge");

}`,
    testCases: [
      {
        name: "Дві дошки додаються по черзі",
        check(ctx) {
          ctx.fn(1);
          ctx.fn(2);
          const planks = ctx.$$("#bridge .plank").map((p) => p.textContent);
          return { pass: ctx.equal(planks, ["Дошка 1", "Дошка 2"]), actual: ctx.show(planks), expected: "[\"Дошка 1\", \"Дошка 2\"]" };
        },
      },
      {
        name: "Повертає доданий елемент",
        check(ctx) {
          const el = ctx.fn(7);
          return { pass: !!el && el.parentElement === ctx.$("#bridge"), actual: ctx.show(el), expected: "<div class=\"plank\">Дошка 7</div> всередині #bridge" };
        },
      },
    ],
    codeChecks: [{ re: /appendChild\(/, label: "Використано appendChild()" }],
    solution: `function addPlank(number) {
  const bridge = document.querySelector("#bridge");
  const plank = document.createElement("div");
  plank.className = "plank";
  plank.textContent = "Дошка " + number;
  bridge.appendChild(plank);
  return plank;
}`,
    hint: "Створи елемент, задай `className = \"plank\"` і текст, потім `bridge.appendChild(plank);` і `return plank;`.",
    difficulty: 1,
  },
  {
    id: 71,
    arc: "DOM, динамічний контент",
    arcNumber: 9,
    locationName: "Міст DOM",
    title: "remove()",
    concept: "`element.remove()` видаляє елемент зі сторінки. Щоб видалити кілька елементів, знайди їх через `querySelectorAll` і виклич `remove()` для кожного.",
    example: `document.querySelectorAll(".toast").forEach((t) => t.remove());`,
    missionStory: "Гнилі дошки старого мосту заважають новим. Їх треба прибрати, поки ніхто не провалився.",
    worldEvent: "Гнилі дошки полетіли в прірву — міст став міцнішим.",
    taskType: "write-function",
    prompt: "Напиши функцію `removeBrokenPlanks()`, яка видаляє зі сторінки всі елементи `.plank.broken` і повертає, скільки елементів було видалено.",
    functionName: "removeBrokenPlanks",
    fileName: "bridge.js",
    html: `<div id="bridge">
  <div class="plank">Дошка 1</div>
  <div class="plank broken">Дошка 2</div>
  <div class="plank">Дошка 3</div>
  <div class="plank broken">Дошка 4</div>
</div>`,
    starterCode: `function removeBrokenPlanks() {

}`,
    testCases: [
      {
        name: "Видалено 2 гнилі дошки, цілі лишились",
        check(ctx) {
          const removed = ctx.fn();
          const left = ctx.$$("#bridge .plank").map((p) => p.textContent);
          return {
            pass: removed === 2 && ctx.equal(left, ["Дошка 1", "Дошка 3"]),
            actual: "повернено " + ctx.show(removed) + ", лишились " + ctx.show(left),
            expected: "повернено 2, лишились [\"Дошка 1\", \"Дошка 3\"]",
          };
        },
      },
      {
        name: "Якщо гнилих немає — повертає 0",
        html: `<div id="bridge"><div class="plank">A</div></div>`,
        check(ctx) {
          const removed = ctx.fn();
          return { pass: removed === 0 && ctx.$$(".plank").length === 1, actual: ctx.show(removed), expected: "0" };
        },
      },
    ],
    codeChecks: [{ re: /\.remove\(\)/, label: "Використано remove()" }],
    solution: `function removeBrokenPlanks() {
  const broken = document.querySelectorAll(".plank.broken");
  broken.forEach((plank) => plank.remove());
  return broken.length;
}`,
    hint: "`querySelectorAll` повертає статичний список, тож його `length` після видалення не зміниться. Його й поверни.",
    difficulty: 1,
  },
  {
    id: 72,
    arc: "DOM, динамічний контент",
    arcNumber: 9,
    locationName: "Міст DOM",
    title: "Генерація списку (цикл)",
    concept: "Щоб показати масив даних на сторінці, проходять його циклом і для кожного елемента створюють DOM-вузол. Перед повторним рендером список очищують (наприклад, `list.textContent = \"\"`), щоб записи не дублювались.",
    example: `function render(items) {
  list.textContent = "";
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  }
}`,
    missionStory: "Обоз привіз інструменти для мосту. Інтендант хоче бачити на дошці оголошень актуальний перелік — і щоразу свіжий.",
    worldEvent: "На дошці оголошень з'явився перелік інструментів.",
    taskType: "write-function",
    prompt: "Напиши функцію `renderList(items)`: очисти `#inventory` і для кожного елемента масиву додай `<li>` з цим текстом. Використай цикл (`for`, `for...of` або `forEach`).",
    functionName: "renderList",
    fileName: "inventory.js",
    html: `<ul id="inventory"><li>старий запис</li></ul>`,
    starterCode: `function renderList(items) {
  const list = document.querySelector("#inventory");

}`,
    testCases: [
      {
        name: "renderList([\"меч\", \"щит\"]) → 2 пункти",
        check(ctx) {
          ctx.fn(["меч", "щит"]);
          const items = ctx.$$("#inventory li").map((li) => li.textContent);
          return { pass: ctx.equal(items, ["меч", "щит"]), actual: ctx.show(items), expected: "[\"меч\", \"щит\"]" };
        },
      },
      {
        name: "Повторний виклик замінює, а не дописує",
        check(ctx) {
          ctx.fn(["меч", "щит"]);
          ctx.fn(["лук"]);
          const items = ctx.$$("#inventory li").map((li) => li.textContent);
          return { pass: ctx.equal(items, ["лук"]), actual: ctx.show(items), expected: "[\"лук\"]" };
        },
      },
    ],
    codeChecks: [{ re: /for\s*\(|\.forEach\(/, label: "Використано цикл" }],
    solution: `function renderList(items) {
  const list = document.querySelector("#inventory");
  list.textContent = "";
  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  }
}`,
    hint: "Почни з `list.textContent = \"\";`, а потім у циклі створюй `li`, задавай текст і додавай через `appendChild`.",
    difficulty: 2,
  },
  {
    id: 73,
    arc: "DOM, динамічний контент",
    arcNumber: 9,
    locationName: "Міст DOM",
    title: "Генерація списку (map)",
    concept: "Інший підхід — зібрати HTML-рядок: `items.map(x => \"<li>\" + x + \"</li>\").join(\"\")` і присвоїти його `innerHTML`. Це коротко, але безпечно лише для довірених даних. Тексти від користувачів так вставляти не можна (згадай XSS).",
    example: `const html = ["a", "b"].map((x) => \`<li>\${x}</li>\`).join("");
// "<li>a</li><li>b</li>"
list.innerHTML = html;`,
    missionStory: "Писар гільдії переписує перелік інструментів новою магією: ціла сторінка одним заклинанням.",
    worldEvent: "Писар гільдії закінчив перелік одним помахом пера.",
    taskType: "write-function",
    prompt: "Напиши функцію `renderListHTML(items)`, яка через `map` і `join` збирає рядок з `<li>` для кожного елемента і записує його в `innerHTML` елемента `#inventory`. Дані тут довірені (з нашого ж коду).",
    functionName: "renderListHTML",
    fileName: "inventory.js",
    html: `<ul id="inventory"></ul>`,
    starterCode: `function renderListHTML(items) {
  const list = document.querySelector("#inventory");

}`,
    testCases: [
      {
        name: "Три пункти зі списку",
        check(ctx) {
          ctx.fn(["молот", "цвяхи", "пилка"]);
          const items = ctx.$$("#inventory li").map((li) => li.textContent);
          return { pass: ctx.equal(items, ["молот", "цвяхи", "пилка"]), actual: ctx.show(items), expected: "[\"молот\", \"цвяхи\", \"пилка\"]" };
        },
      },
      {
        name: "Між пунктами немає ком",
        check(ctx) {
          ctx.fn(["a", "b"]);
          const html = ctx.$("#inventory").innerHTML;
          return { pass: html === "<li>a</li><li>b</li>", actual: ctx.show(html), expected: "\"<li>a</li><li>b</li>\"" };
        },
      },
    ],
    codeChecks: [
      { re: /\.map\(/, label: "Використано map()" },
      { re: /\.join\(/, label: "Використано join()" },
    ],
    solution: `function renderListHTML(items) {
  const list = document.querySelector("#inventory");
  list.innerHTML = items.map((item) => "<li>" + item + "</li>").join("");
}`,
    hint: "Без `join(\"\")` масив перетвориться на рядок через коми: `<li>a</li>,<li>b</li>`.",
    difficulty: 2,
  },
  {
    id: 74,
    arc: "DOM, динамічний контент",
    arcNumber: 9,
    locationName: "Міст DOM",
    title: "Валідація поля",
    concept: "Замість набридливого `alert` помилку показують прямо біля поля: текстом в окремому елементі і класом, що підсвічує поле червоним. Коли значення стає правильним, повідомлення прибирають.",
    example: `if (value.length < 3) {
  error.textContent = "Закоротко";
  input.classList.add("invalid");
} else {
  error.textContent = "";
  input.classList.remove("invalid");
}`,
    missionStory: "Мостова застава перевіряє позивні мандрівників. Закороткий позивний — підозрілий, але кричати на людей не годиться.",
    worldEvent: "Застава на мосту перевіряє мандрівників ввічливо.",
    taskType: "write-function",
    prompt: "Напиши функцію `validateNickname()`: візьми значення `#nickname` без пробілів по краях. Якщо воно коротше за 3 символи — запиши в `#nickname-error` текст `\"Ім'я має містити щонайменше 3 символи\"`, додай полю клас `invalid` і поверни `false`. Інакше очисти текст помилки, прибери клас і поверни `true`. Без `alert`.",
    functionName: "validateNickname",
    fileName: "validate.js",
    html: `<input id="nickname">
<p id="nickname-error"></p>`,
    starterCode: `function validateNickname() {
  const input = document.querySelector("#nickname");
  const error = document.querySelector("#nickname-error");

}`,
    testCases: [
      {
        name: "\"Al\" — помилка",
        check(ctx) {
          ctx.$("#nickname").value = "Al";
          const ok = ctx.fn();
          const err = ctx.$("#nickname-error").textContent;
          return {
            pass: ok === false && err === "Ім'я має містити щонайменше 3 символи" && ctx.$("#nickname").classList.contains("invalid"),
            actual: ctx.show(ok) + ", " + ctx.show(err),
            expected: "false, \"Ім'я має містити щонайменше 3 символи\" + клас invalid",
          };
        },
      },
      {
        name: "\"  ab  \" — теж помилка (пробіли не рахуються)",
        check(ctx) {
          ctx.$("#nickname").value = "  ab  ";
          const ok = ctx.fn();
          return { pass: ok === false, actual: ctx.show(ok), expected: "false" };
        },
      },
      {
        name: "Після виправлення на \"Аліса\" помилка зникає",
        check(ctx) {
          const input = ctx.$("#nickname");
          input.value = "Al";
          ctx.fn();
          input.value = "Аліса";
          const ok = ctx.fn();
          const err = ctx.$("#nickname-error").textContent;
          return {
            pass: ok === true && err === "" && !input.classList.contains("invalid"),
            actual: ctx.show(ok) + ", помилка " + ctx.show(err) + ", invalid: " + input.classList.contains("invalid"),
            expected: "true, помилка \"\", invalid: false",
          };
        },
      },
    ],
    codeChecks: [{ re: /\balert\s*\(/, not: true, label: "Без alert()" }],
    solution: `function validateNickname() {
  const input = document.querySelector("#nickname");
  const error = document.querySelector("#nickname-error");
  const value = input.value.trim();
  if (value.length < 3) {
    error.textContent = "Ім'я має містити щонайменше 3 символи";
    input.classList.add("invalid");
    return false;
  }
  error.textContent = "";
  input.classList.remove("invalid");
  return true;
}`,
    hint: "Довжину рахуй після `trim()`. Не забудь обидві гілки: показати помилку й повернути `false` або сховати її й повернути `true`.",
    difficulty: 2,
  },
  {
    id: 75,
    arc: "DOM, динамічний контент",
    arcNumber: 9,
    locationName: "Міст DOM",
    title: "Валідація форми",
    concept: "Валідуючи форму з кількома полями, зручно збирати помилки в масив: кожна перевірка додає своє повідомлення. Потім показуєш усі помилки разом, а форма вважається валідною, якщо масив порожній.",
    example: `const errors = [];
if (!email.includes("@")) errors.push("Невірний email");
if (age < 12) errors.push("Замалий вік");
const isValid = errors.length === 0;`,
    missionStory: "Міст майже відбудовано! Лишилось відкрити реєстрацію подорожніх: форма має перевіряти всі поля одразу і чемно пояснювати помилки.",
    worldEvent: "Міст через прірву відбудовано! Мандрівники йдуть нескінченним потоком.",
    taskType: "write-function",
    prompt: "Напиши функцію `validateForm()`: email з `#email` має містити `\"@\"` (інакше помилка `\"Вкажи коректний email\"`), вік з `#age` має бути числом ≥ 12 (інакше `\"Мінімальний вік — 12 років\"`). Покажи кожну помилку окремим `<li>` у `#errors` (спершу очисти список) і поверни масив помилок.",
    functionName: "validateForm",
    fileName: "register.js",
    html: `<form id="register">
  <input id="email" type="email">
  <input id="age" type="number">
</form>
<ul id="errors"></ul>`,
    starterCode: `function validateForm() {
  const email = document.querySelector("#email").value;
  const age = Number(document.querySelector("#age").value);
  const errors = [];

  // перевірки

  // показати помилки в #errors

  return errors;
}`,
    testCases: [
      {
        name: "Обидва поля з помилками",
        check(ctx) {
          ctx.$("#email").value = "alisa.mail";
          ctx.$("#age").value = "9";
          const errors = ctx.fn();
          const shown = ctx.$$("#errors li").map((li) => li.textContent);
          const expected = ["Вкажи коректний email", "Мінімальний вік — 12 років"];
          return { pass: ctx.equal(errors, expected) && ctx.equal(shown, expected), actual: ctx.show(shown), expected: ctx.show(expected) };
        },
      },
      {
        name: "Валідна форма — порожній масив і порожній список",
        check(ctx) {
          ctx.$("#email").value = "alisa@castle.ua";
          ctx.$("#age").value = "12";
          const errors = ctx.fn();
          return { pass: ctx.equal(errors, []) && ctx.$$("#errors li").length === 0, actual: ctx.show(errors), expected: "[]" };
        },
      },
      {
        name: "Після виправлення старі помилки зникають",
        check(ctx) {
          ctx.$("#email").value = "bad";
          ctx.$("#age").value = "30";
          ctx.fn();
          ctx.$("#email").value = "ok@ok.ua";
          ctx.fn();
          const count = ctx.$$("#errors li").length;
          return { pass: count === 0, actual: count + " пунктів", expected: "0 пунктів" };
        },
      },
    ],
    codeChecks: [{ re: /\balert\s*\(/, not: true, label: "Без alert()" }],
    solution: `function validateForm() {
  const email = document.querySelector("#email").value;
  const age = Number(document.querySelector("#age").value);
  const errors = [];

  if (!email.includes("@")) {
    errors.push("Вкажи коректний email");
  }
  if (!(age >= 12)) {
    errors.push("Мінімальний вік — 12 років");
  }

  const list = document.querySelector("#errors");
  list.textContent = "";
  errors.forEach((message) => {
    const li = document.createElement("li");
    li.textContent = message;
    list.appendChild(li);
  });

  return errors;
}`,
    hint: "Дві незалежні перевірки з `errors.push(...)`. Потім `list.textContent = \"\"` і цикл, що створює `<li>` для кожної помилки.",
    difficulty: 3,
  },
  /* ───────────── Арка X — Збереження даних → Скарбниця пам'яті ───────────── */
  {
    id: 76,
    arc: "Збереження даних",
    arcNumber: 10,
    locationName: "Скарбниця пам'яті",
    title: "localStorage set / get",
    concept: "`localStorage` зберігає пари «ключ: рядок» у браузері навіть після перезавантаження сторінки. `setItem(key, value)` записує, `getItem(key)` читає, а для відсутнього ключа повертає `null`. Значення завжди зберігаються як рядки.",
    example: `localStorage.setItem("theme", "dark");
localStorage.getItem("theme");   // "dark"
localStorage.getItem("unknown"); // null`,
    missionStory: "Двері Скарбниці пам'яті впізнають лише тих, кого запам'ятали. Навчи їх пам'ятати ім'я героя між візитами.",
    worldEvent: "Двері Скарбниці вимовили твоє ім'я.",
    taskType: "write-function",
    prompt: "Напиши дві функції: `saveHeroName(name)` зберігає ім'я в `localStorage` під ключем `\"heroName\"`; `loadHeroName()` повертає збережене ім'я або `\"Безіменний\"`, якщо нічого не збережено.",
    exports: ["saveHeroName", "loadHeroName"],
    fileName: "memory.js",
    starterCode: `function saveHeroName(name) {

}

function loadHeroName() {

}`,
    testCases: [
      {
        name: "Без збереження → \"Безіменний\"",
        check(ctx) {
          const name = ctx.get("loadHeroName")();
          return { pass: name === "Безіменний", actual: ctx.show(name), expected: "\"Безіменний\"" };
        },
      },
      {
        name: "Ім'я пам'ятається після перезавантаження сторінки",
        check(ctx) {
          ctx.get("saveHeroName")("Аліса");
          ctx.reload();
          const name = ctx.get("loadHeroName")();
          return {
            pass: name === "Аліса" && ctx.storage.getItem("heroName") === "Аліса",
            actual: ctx.show(name),
            expected: "\"Аліса\"",
          };
        },
      },
    ],
    codeChecks: [
      { re: /localStorage\.setItem\(/, label: "Використано localStorage.setItem()" },
      { re: /localStorage\.getItem\(/, label: "Використано localStorage.getItem()" },
    ],
    solution: `function saveHeroName(name) {
  localStorage.setItem("heroName", name);
}

function loadHeroName() {
  const saved = localStorage.getItem("heroName");
  return saved === null ? "Безіменний" : saved;
}`,
    hint: "`getItem` повертає `null`, якщо ключа немає. Перевір це: `saved === null ? \"Безіменний\" : saved` (або `saved ?? \"Безіменний\"`).",
    difficulty: 1,
  },
  {
    id: 77,
    arc: "Збереження даних",
    arcNumber: 10,
    locationName: "Скарбниця пам'яті",
    title: "localStorage remove",
    concept: "`localStorage.removeItem(key)` видаляє один запис. `localStorage.clear()` стирає ВСЕ сховище сайту — небезпечно, якщо там лежать і інші дані (налаштування, токени). Видаляй лише те, що справді треба.",
    example: `localStorage.removeItem("draft"); // лише чернетка
// localStorage.clear();           // стерло б усе`,
    missionStory: "Герой хоче почати пригоду з чистого аркуша, але Скарбниця має зберегти налаштування світу. Зітри лише потрібне.",
    worldEvent: "Скарбниця забула старого героя, але пам'ятає світ.",
    taskType: "write-function",
    prompt: "Напиши функцію `forgetHero()`, яка видаляє з `localStorage` ключі `\"heroName\"` і `\"heroLevel\"`. Інші ключі (наприклад, `\"settings\"`) мають лишитися. Не використовуй `clear()`.",
    functionName: "forgetHero",
    fileName: "memory.js",
    starterCode: `function forgetHero() {

}`,
    testCases: [
      {
        name: "Видалено heroName і heroLevel, settings лишився",
        storage: { heroName: "Аліса", heroLevel: "7", settings: "{\"sound\":true}" },
        check(ctx) {
          ctx.fn();
          const keys = ctx.storage.keys().sort();
          return { pass: ctx.equal(keys, ["settings"]), actual: "ключі " + ctx.show(keys), expected: "ключі [\"settings\"]" };
        },
      },
    ],
    codeChecks: [
      { re: /removeItem\(/, label: "Використано removeItem()" },
      { re: /\.clear\(\s*\)/, not: true, label: "Не стираєш усе через clear()" },
    ],
    solution: `function forgetHero() {
  localStorage.removeItem("heroName");
  localStorage.removeItem("heroLevel");
}`,
    hint: "Два виклики `localStorage.removeItem(...)` — по одному на ключ.",
    difficulty: 1,
  },
  {
    id: 78,
    arc: "Збереження даних",
    arcNumber: 10,
    locationName: "Скарбниця пам'яті",
    title: "JSON.stringify / parse",
    concept: "`localStorage` зберігає лише рядки: масив `[\"меч\",\"щит\"]` стане `\"меч,щит\"`, а об'єкт — `\"[object Object]\"`. Тому перед записом дані перетворюють на JSON через `JSON.stringify`, а після читання повертають назад через `JSON.parse`.",
    example: `const bag = ["меч", { name: "зілля", count: 3 }];
localStorage.setItem("bag", JSON.stringify(bag));
const restored = JSON.parse(localStorage.getItem("bag"));`,
    missionStory: "Скарбниця зберігає інвентар героя, але після кожного візиту речі злипаються в один дивний рядок. Магія пам'яті зламалась!",
    worldEvent: "Інвентар у Скарбниці зберігається річ до речі.",
    taskType: "fix-code",
    prompt: "Після збереження і перезавантаження `loadInventory()` повертає рядок замість масиву, а об'єкти перетворюються на `[object Object]`. Виправ обидві функції через JSON. Якщо нічого не збережено, `loadInventory()` має повертати `[]`.",
    exports: ["saveInventory", "loadInventory"],
    fileName: "inventory.js",
    starterCode: `function saveInventory(items) {
  localStorage.setItem("inventory", items);
}

function loadInventory() {
  const saved = localStorage.getItem("inventory");
  return saved || [];
}`,
    testCases: [
      {
        name: "Масив рядків відновлюється після перезавантаження",
        check(ctx) {
          ctx.get("saveInventory")(["меч", "щит"]);
          ctx.reload();
          const items = ctx.get("loadInventory")();
          return { pass: ctx.equal(items, ["меч", "щит"]), actual: ctx.show(items), expected: "[\"меч\", \"щит\"]" };
        },
      },
      {
        name: "Об'єкти теж відновлюються",
        check(ctx) {
          ctx.get("saveInventory")([{ name: "зілля", count: 3 }]);
          ctx.reload();
          const items = ctx.get("loadInventory")();
          return { pass: ctx.equal(items, [{ name: "зілля", count: 3 }]), actual: ctx.show(items), expected: "[{ name: \"зілля\", count: 3 }]" };
        },
      },
      {
        name: "Порожнє сховище → []",
        check(ctx) {
          const items = ctx.get("loadInventory")();
          return { pass: ctx.equal(items, []), actual: ctx.show(items), expected: "[]" };
        },
      },
    ],
    codeChecks: [
      { re: /JSON\.stringify\(/, label: "Використано JSON.stringify()" },
      { re: /JSON\.parse\(/, label: "Використано JSON.parse()" },
    ],
    solution: `function saveInventory(items) {
  localStorage.setItem("inventory", JSON.stringify(items));
}

function loadInventory() {
  const saved = localStorage.getItem("inventory");
  return saved ? JSON.parse(saved) : [];
}`,
    hint: "Під час запису: `JSON.stringify(items)`. Під час читання: якщо `saved` не `null`, поверни `JSON.parse(saved)`, інакше `[]`.",
    difficulty: 2,
  },
  {
    id: 79,
    arc: "Збереження даних",
    arcNumber: 10,
    locationName: "Скарбниця пам'яті",
    title: "Практика: список завдань",
    concept: "Застосунок, що пам'ятає дані між перезавантаженнями, будується за схемою: дані живуть у масиві → кожна зміна зберігається в `localStorage` → під час завантаження сторінки дані читаються зі сховища й рендеряться.",
    example: `function load() {
  return JSON.parse(localStorage.getItem("todos")) || [];
}
function save(todos) {
  localStorage.setItem("todos", JSON.stringify(todos));
}`,
    missionStory: "Хранитель Скарбниці просить зачарований сувій справ, який не забуває жодного запису навіть після того, як сувій згорнули й розгорнули знову.",
    worldEvent: "Скарбницю пам'яті відкрито — вона пам'ятає все!",
    taskType: "write-function",
    prompt: "Допиши застосунок: `getTasks()` повертає масив із `localStorage` (ключ `\"tasks\"`, JSON) або `[]`; `addTask(text)` додає завдання, зберігає масив і перемальовує список; `renderTasks()` показує кожне завдання як `<li>` у `#tasks`. Під час завантаження сторінки список має відмальовуватись (виклик `renderTasks()` унизу вже є).",
    exports: ["getTasks", "addTask", "renderTasks"],
    fileName: "todo.js",
    html: `<ul id="tasks"></ul>`,
    starterCode: `function getTasks() {

}

function addTask(text) {

}

function renderTasks() {
  const list = document.querySelector("#tasks");

}

renderTasks();`,
    testCases: [
      {
        name: "Нове завдання з'являється у списку",
        check(ctx) {
          ctx.get("addTask")("Нагодувати дракона");
          const items = ctx.$$("#tasks li").map((li) => li.textContent);
          return { pass: ctx.equal(items, ["Нагодувати дракона"]), actual: ctx.show(items), expected: "[\"Нагодувати дракона\"]" };
        },
      },
      {
        name: "Після перезавантаження сторінки список на місці",
        check(ctx) {
          ctx.get("addTask")("Полагодити міст");
          ctx.get("addTask")("Купити зілля");
          ctx.reload();
          const items = ctx.$$("#tasks li").map((li) => li.textContent);
          return {
            pass: ctx.equal(items, ["Полагодити міст", "Купити зілля"]) && ctx.equal(ctx.get("getTasks")(), ["Полагодити міст", "Купити зілля"]),
            actual: ctx.show(items),
            expected: "[\"Полагодити міст\", \"Купити зілля\"]",
          };
        },
      },
      {
        name: "Список з'являється одразу при відкритті, якщо дані вже збережені",
        storage: { tasks: "[\"Старе завдання\"]" },
        check(ctx) {
          const items = ctx.$$("#tasks li").map((li) => li.textContent);
          return { pass: ctx.equal(items, ["Старе завдання"]), actual: ctx.show(items), expected: "[\"Старе завдання\"]" };
        },
      },
    ],
    codeChecks: [
      { re: /JSON\.stringify\(/, label: "Збереження через JSON.stringify()" },
      { re: /JSON\.parse\(/, label: "Читання через JSON.parse()" },
    ],
    solution: `function getTasks() {
  const saved = localStorage.getItem("tasks");
  return saved ? JSON.parse(saved) : [];
}

function addTask(text) {
  const tasks = getTasks();
  tasks.push(text);
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  const list = document.querySelector("#tasks");
  list.textContent = "";
  getTasks().forEach((task) => {
    const li = document.createElement("li");
    li.textContent = task;
    list.appendChild(li);
  });
}

renderTasks();`,
    hint: "`addTask`: отримай масив через `getTasks()`, додай `text`, збережи `JSON.stringify(tasks)` і виклич `renderTasks()`. А `renderTasks` очищає список і створює `<li>` для кожного елемента з `getTasks()`.",
    difficulty: 3,
  },

  /* ───────────── Арка XI — Асинхронність, основи → Вежа Async ───────────── */
  {
    id: 80,
    arc: "Асинхронність, основи",
    arcNumber: 11,
    locationName: "Вежа Async",
    title: "setTimeout",
    concept: "`setTimeout(callback, ms)` запускає функцію один раз через `ms` мілісекунд. Код після `setTimeout` не чекає, а виконується одразу. Таймер повертає id, яким його можна скасувати через `clearTimeout(id)`.",
    example: `console.log("Запалюю ґніт...");
setTimeout(() => console.log("БУМ!"), 1000);
console.log("Тікаю!");
// Запалюю ґніт... → Тікаю! → (через 1 с) БУМ!`,
    missionStory: "Брама Вежі Async відчиняється не одразу: механізм має провернутися. Навчися відкладати дію на потрібний час.",
    worldEvent: "Механізм брами клацнув — Вежа Async відчинена.",
    taskType: "write-function",
    prompt: "Напиши функцію `openGateLater(callback, delay)`, яка викликає `callback` один раз через `delay` мілісекунд за допомогою `setTimeout`.",
    functionName: "openGateLater",
    fileName: "tower.js",
    starterCode: `function openGateLater(callback, delay) {

}`,
    testCases: [
      {
        name: "Callback не викликається одразу, але викликається після затримки",
        async check(ctx) {
          let calls = 0;
          ctx.fn(() => calls++, 60);
          const immediately = calls;
          await ctx.sleep(150);
          return {
            pass: immediately === 0 && calls === 1,
            actual: "одразу: " + immediately + " викликів, через 150 мс: " + calls,
            expected: "одразу: 0 викликів, через 150 мс: 1",
          };
        },
      },
    ],
    codeChecks: [{ re: /setTimeout\(/, label: "Використано setTimeout()" }],
    solution: `function openGateLater(callback, delay) {
  setTimeout(callback, delay);
}`,
    hint: "Просто передай обидва параметри далі: `setTimeout(callback, delay);`. Не викликай `callback()` сам — передай саму функцію.",
    difficulty: 1,
  },
  {
    id: 81,
    arc: "Асинхронність, основи",
    arcNumber: 11,
    locationName: "Вежа Async",
    title: "setInterval",
    concept: "`setInterval(callback, ms)` викликає функцію знову і знову з інтервалом `ms`, доки її не зупинять через `clearInterval(id)`. Не забувай зупиняти інтервали — інакше вони працюватимуть вічно.",
    example: `let count = 0;
const id = setInterval(() => {
  count++;
  console.log("Тік", count);
  if (count === 3) clearInterval(id);
}, 500);`,
    missionStory: "На першому поверсі вежі висить годинниковий дзвін. Він має вдарити рівно стільки разів, скільки замовлено, і замовкнути.",
    worldEvent: "Годинниковий дзвін вежі знову відбиває точний час.",
    taskType: "write-function",
    prompt: "Напиши функцію `ringBell(times, interval, onRing)`: кожні `interval` мс викликай `onRing(n)`, де `n` — номер удару (1, 2, 3...). Після `times` ударів зупини інтервал через `clearInterval`.",
    functionName: "ringBell",
    fileName: "bell.js",
    starterCode: `function ringBell(times, interval, onRing) {
  let count = 0;

}`,
    testCases: [
      {
        name: "3 удари з номерами 1, 2, 3 — і тиша",
        async check(ctx) {
          const rings = [];
          ctx.fn(3, 20, (n) => rings.push(n));
          await ctx.sleep(220);
          return { pass: ctx.equal(rings, [1, 2, 3]), actual: ctx.show(rings), expected: "[1, 2, 3]" };
        },
      },
      {
        name: "Один удар",
        async check(ctx) {
          const rings = [];
          ctx.fn(1, 20, (n) => rings.push(n));
          await ctx.sleep(120);
          return { pass: ctx.equal(rings, [1]), actual: ctx.show(rings), expected: "[1]" };
        },
      },
    ],
    codeChecks: [
      { re: /setInterval\(/, label: "Використано setInterval()" },
      { re: /clearInterval\(/, label: "Інтервал зупиняється через clearInterval()" },
    ],
    solution: `function ringBell(times, interval, onRing) {
  let count = 0;
  const id = setInterval(() => {
    count++;
    onRing(count);
    if (count === times) {
      clearInterval(id);
    }
  }, interval);
}`,
    hint: "Збережи id: `const id = setInterval(() => {...}, interval);`. Усередині збільшуй `count`, виклич `onRing(count)`, а коли `count === times` — `clearInterval(id)`.",
    difficulty: 2,
  },
  {
    id: 82,
    arc: "Асинхронність, основи",
    arcNumber: 11,
    locationName: "Вежа Async",
    title: "Callback-функція",
    concept: "У JS функції — звичайні значення: їх можна передавати як аргументи. Функцію, яку передали в іншу функцію, щоб та її викликала, називають callback. Саме так працюють `forEach`, `map`, `setTimeout` і обробники подій.",
    example: `function repeat(times, action) {
  for (let i = 0; i < times; i++) action(i);
}
repeat(3, (i) => console.log("Крок", i));`,
    missionStory: "Алхімік вежі перетворює речі за рецептом. Рецепт щоразу інший, тож алхімік приймає його ззовні — як callback.",
    worldEvent: "Алхімічна лабораторія вежі запрацювала.",
    taskType: "write-function",
    prompt: "Напиши функцію `transformAll(items, transform)`, яка повертає новий масив, де кожен елемент — результат виклику `transform(елемент)`. Реалізуй це самостійно циклом, без вбудованого `map`.",
    functionName: "transformAll",
    fileName: "alchemy.js",
    starterCode: `function transformAll(items, transform) {
  const result = [];

  return result;
}`,
    testCases: [
      {
        name: "transformAll([1, 2, 3], n => n * 10) → [10, 20, 30]",
        check(ctx) {
          const result = ctx.fn([1, 2, 3], (n) => n * 10);
          return { pass: ctx.equal(result, [10, 20, 30]), actual: ctx.show(result), expected: "[10, 20, 30]" };
        },
      },
      {
        name: "Працює з будь-яким callback",
        check(ctx) {
          const result = ctx.fn(["олово", "мідь"], (s) => s.toUpperCase());
          return { pass: ctx.equal(result, ["ОЛОВО", "МІДЬ"]), actual: ctx.show(result), expected: "[\"ОЛОВО\", \"МІДЬ\"]" };
        },
      },
      {
        name: "Callback викликається рівно раз для кожного елемента",
        check(ctx) {
          let calls = 0;
          ctx.fn([1, 2, 3, 4], (x) => { calls++; return x; });
          return { pass: calls === 4, actual: calls + " викликів", expected: "4 виклики" };
        },
      },
    ],
    codeChecks: [{ re: /\.map\(/, not: true, label: "Без вбудованого map()" }],
    solution: `function transformAll(items, transform) {
  const result = [];
  for (const item of items) {
    result.push(transform(item));
  }
  return result;
}`,
    hint: "У циклі: `result.push(transform(item));` — тут ти сам викликаєш передану функцію.",
    difficulty: 2,
  },
  {
    id: 83,
    arc: "Асинхронність, основи",
    arcNumber: 11,
    locationName: "Вежа Async",
    title: "Callback hell",
    concept: "Коли асинхронні кроки залежать один від одного, callback'и вкладаються один в одного, і код росте «драбиною» вправо. Це callback hell: важко читати й обробляти помилки. Важливо пам'ятати, що синхронний код завжди виконується раніше за відкладені callback'и, навіть із затримкою 0.",
    example: `step1(() => {
  step2(() => {
    step3(() => {
      // ...і так далі вглиб 😵
    });
  });
});`,
    missionStory: "Сходи вежі закручені спіраллю, і кожен прольот відкривається лише після попереднього. Простеж, у якому порядку звучать кроки.",
    worldEvent: "Ти пройшов заплутані сходи вежі, не збившись з ліку.",
    taskType: "predict-output",
    prompt: "У якому порядку з'являться рядки в консолі? Впиши їх по черзі.",
    starterCode: null,
    code: `console.log("ранок");
setTimeout(() => {
  console.log("вежа");
  setTimeout(() => {
    console.log("вершина");
  }, 0);
  console.log("сходи");
}, 0);
console.log("дорога");`,
    expectedAnswer: ["ранок", "дорога", "вежа", "сходи", "вершина"],
    hint: "Спершу виконується весь синхронний код верхнього рівня. Callback з `setTimeout(..., 0)` запуститься пізніше, і всередині нього так само: синхронні рядки йдуть першими, а вкладений таймер — наостанок.",
    difficulty: 2,
  },
  {
    id: 84,
    arc: "Асинхронність, основи",
    arcNumber: 11,
    locationName: "Вежа Async",
    title: "Promise (огляд)",
    concept: "`Promise` — об'єкт-обіцянка майбутнього результату. Функція-виконавець, передана в `new Promise((resolve, reject) => ...)`, запускається ОДРАЗУ й синхронно. А callback з `.then()` спрацьовує асинхронно — після завершення поточного синхронного коду, навіть якщо проміс уже виконано.",
    example: `const p = new Promise((resolve, reject) => {
  // робота...
  resolve("успіх"); // або reject(new Error("провал"))
});
p.then((result) => console.log(result));`,
    missionStory: "Маг вежі дає обіцянку: «Двері відчиняться». Але коли саме? Розберись, як працює магія обіцянок.",
    worldEvent: "Маг вежі дотримав обіцянки — двері на наступний поверх відчинились.",
    taskType: "predict-output",
    prompt: "У якому порядку з'являться рядки в консолі?",
    starterCode: null,
    code: `console.log("старт");
const promise = new Promise((resolve) => {
  console.log("виконавець");
  resolve("готово");
});
promise.then((value) => console.log(value));
console.log("кінець");`,
    expectedAnswer: ["старт", "виконавець", "кінець", "готово"],
    hint: "Тіло `new Promise(...)` виконується одразу, під час створення. А `.then` завжди чекає, поки скінчиться весь синхронний код.",
    difficulty: 2,
  },

  /* ───────────── Арка XII — Promises та async/await → Вежа Async ───────────── */
  {
    id: 85,
    arc: "Promises та async/await",
    arcNumber: 12,
    locationName: "Вежа Async",
    title: ".then()",
    concept: "`.then(callback)` отримує результат успішного проміса і повертає НОВИЙ проміс із тим значенням, яке поверне callback. Тому `.then` можна з'єднувати в ланцюжки.",
    example: `Promise.resolve(5)
  .then((n) => n * 2)   // 10
  .then((n) => console.log(n));`,
    missionStory: "Розвідник вежі приносить звістки, але не одразу. Навчися правильно приймати добру звістку, коли вона надійде.",
    worldEvent: "Звістки розвідника розходяться вежею.",
    taskType: "write-function",
    prompt: "Напиши функцію `readMap(mapPromise)`, яка повертає новий проміс через `.then()`: коли `mapPromise` виконається зі значенням `place`, результатом має бути рядок `\"Знайдено: <place>\"`.",
    functionName: "readMap",
    fileName: "scout.js",
    starterCode: `function readMap(mapPromise) {

}`,
    testCases: [
      {
        name: "readMap(Promise.resolve(\"корона\")) → \"Знайдено: корона\"",
        async check(ctx) {
          const result = await ctx.fn(Promise.resolve("корона"));
          return { pass: result === "Знайдено: корона", actual: ctx.show(result), expected: "\"Знайдено: корона\"" };
        },
      },
      {
        name: "Працює з відкладеним промісом",
        async check(ctx) {
          const later = new Promise((resolve) => ctx.realTimeout(() => resolve("скриня"), 30));
          const result = await ctx.fn(later);
          return { pass: result === "Знайдено: скриня", actual: ctx.show(result), expected: "\"Знайдено: скриня\"" };
        },
      },
    ],
    codeChecks: [
      { re: /\.then\(/, label: "Використано .then()" },
      { re: /\bawait\b/, not: true, label: "Без await (його вивчимо пізніше)" },
    ],
    solution: `function readMap(mapPromise) {
  return mapPromise.then((place) => "Знайдено: " + place);
}`,
    hint: "Поверни результат ланцюжка: `return mapPromise.then((place) => \"Знайдено: \" + place);`.",
    difficulty: 2,
  },
  {
    id: 86,
    arc: "Promises та async/await",
    arcNumber: 12,
    locationName: "Вежа Async",
    title: ".catch()",
    concept: "Якщо проміс відхилено (`reject` або помилка в `.then`), спрацьовує найближчий `.catch(callback)`. Те, що поверне `catch`, стає новим успішним результатом: так програма «оговтується» після помилки.",
    example: `fetchData()
  .then((data) => show(data))
  .catch((error) => console.log("Помилка:", error.message));`,
    missionStory: "Сходи вежі старі, деякі сходинки ламаються. Альпініст має пережити падіння і повідомити, що сталося.",
    worldEvent: "Альпіністи вежі тепер мають страхувальні мотузки.",
    taskType: "write-function",
    prompt: "Напиши функцію `safeClimb(climbPromise)`, що повертає проміс: при успіху — те саме значення, при помилці — рядок `\"Падіння: <повідомлення помилки>\"`. Використай `.catch()`.",
    functionName: "safeClimb",
    fileName: "climb.js",
    starterCode: `function safeClimb(climbPromise) {

}`,
    testCases: [
      {
        name: "Успіх проходить без змін",
        async check(ctx) {
          const result = await ctx.fn(Promise.resolve("вершина"));
          return { pass: result === "вершина", actual: ctx.show(result), expected: "\"вершина\"" };
        },
      },
      {
        name: "Помилка перетворюється на повідомлення",
        async check(ctx) {
          const result = await ctx.fn(Promise.reject(new Error("сходинка зламалась")));
          return { pass: result === "Падіння: сходинка зламалась", actual: ctx.show(result), expected: "\"Падіння: сходинка зламалась\"" };
        },
      },
    ],
    codeChecks: [{ re: /\.catch\(/, label: "Використано .catch()" }],
    solution: `function safeClimb(climbPromise) {
  return climbPromise.catch((error) => "Падіння: " + error.message);
}`,
    hint: "`return climbPromise.catch((error) => \"Падіння: \" + error.message);` — успішне значення `.catch` пропустить далі саме.",
    difficulty: 2,
  },
  {
    id: 87,
    arc: "Promises та async/await",
    arcNumber: 12,
    locationName: "Вежа Async",
    title: ".finally()",
    concept: "`.finally(callback)` виконується ЗАВЖДИ — і після успіху, і після помилки. Він не отримує результату і не змінює його, а просто пропускає далі. Ідеальне місце, щоб сховати індикатор завантаження чи закрити з'єднання.",
    example: `spinner.show();
loadData()
  .then(render)
  .catch(showError)
  .finally(() => spinner.hide());`,
    missionStory: "Коли маг вежі творить закляття, над вежею горить сигнальний вогонь. Його треба гасити завжди — вдалось закляття чи ні.",
    worldEvent: "Сигнальний вогонь вежі гасне вчасно, щоразу.",
    taskType: "write-function",
    prompt: "Напиши функцію `castWithBeacon(spellPromise, beacon)`: поверни проміс, який після завершення `spellPromise` (успішного чи ні) встановлює `beacon.lit = false`. Результат або помилка мають пройти далі без змін. Використай `.finally()`.",
    functionName: "castWithBeacon",
    fileName: "beacon.js",
    starterCode: `function castWithBeacon(spellPromise, beacon) {
  beacon.lit = true;

}`,
    testCases: [
      {
        name: "Після успіху вогонь згас, результат збережено",
        async check(ctx) {
          const beacon = { lit: false };
          const result = await ctx.fn(Promise.resolve("щит"), beacon);
          return { pass: result === "щит" && beacon.lit === false, actual: ctx.show(result) + ", lit: " + beacon.lit, expected: "\"щит\", lit: false" };
        },
      },
      {
        name: "Після помилки вогонь теж згас, а помилка пройшла далі",
        async check(ctx) {
          const beacon = { lit: false };
          let caught = null;
          try {
            await ctx.fn(Promise.reject(new Error("закляття зірвалось")), beacon);
          } catch (error) {
            caught = error.message;
          }
          return {
            pass: caught === "закляття зірвалось" && beacon.lit === false,
            actual: "помилка " + ctx.show(caught) + ", lit: " + beacon.lit,
            expected: "помилка \"закляття зірвалось\", lit: false",
          };
        },
      },
    ],
    codeChecks: [{ re: /\.finally\(/, label: "Використано .finally()" }],
    solution: `function castWithBeacon(spellPromise, beacon) {
  beacon.lit = true;
  return spellPromise.finally(() => {
    beacon.lit = false;
  });
}`,
    hint: "`return spellPromise.finally(() => { beacon.lit = false; });` — не забудь `return`, щоб результат пішов далі.",
    difficulty: 2,
  },
  {
    id: 88,
    arc: "Promises та async/await",
    arcNumber: 12,
    locationName: "Вежа Async",
    title: "async / await",
    concept: "`async function` завжди повертає проміс. Усередині неї `await` «чекає» на проміс і повертає його результат, тож асинхронний код читається як звичайний послідовний. Помилки ловляться звичайним `try/catch`.",
    example: `async function loadHero() {
  const response = await getHero();
  const hero = await response.json();
  return hero.name;
}`,
    missionStory: "Вартові вежі передають повідомлення ланцюжком `.then`, і воно губиться в сходах. Перепиши наказ мовою async/await — як звичайну розповідь.",
    worldEvent: "Накази вежі тепер читаються легко, як казка.",
    taskType: "fix-code",
    prompt: "Перепиши `getTowerGuard` з ланцюжка `.then()` на `async/await`. Функція отримує `loadGuard` — функцію, що повертає проміс з об'єктом вартового, і має повернути `\"Вартовий: <name>\"`.",
    functionName: "getTowerGuard",
    fileName: "guard.js",
    starterCode: `function getTowerGuard(loadGuard) {
  return loadGuard()
    .then((guard) => guard.name)
    .then((name) => "Вартовий: " + name);
}`,
    testCases: [
      {
        name: "Повертає \"Вартовий: Грім\"",
        async check(ctx) {
          const result = await ctx.fn(() => Promise.resolve({ name: "Грім" }));
          return { pass: result === "Вартовий: Грім", actual: ctx.show(result), expected: "\"Вартовий: Грім\"" };
        },
      },
      {
        name: "Чекає на відкладену відповідь",
        async check(ctx) {
          const slow = () => new Promise((resolve) => ctx.realTimeout(() => resolve({ name: "Тиша" }), 30));
          const result = await ctx.fn(slow);
          return { pass: result === "Вартовий: Тиша", actual: ctx.show(result), expected: "\"Вартовий: Тиша\"" };
        },
      },
    ],
    codeChecks: [
      { re: /async\s+function|async\s*\(|async\s+\w+\s*=>/, label: "Функція оголошена як async" },
      { re: /\bawait\b/, label: "Використано await" },
      { re: /\.then\(/, not: true, label: "Немає .then()" },
    ],
    solution: `async function getTowerGuard(loadGuard) {
  const guard = await loadGuard();
  return "Вартовий: " + guard.name;
}`,
    hint: "Додай `async` перед `function`, потім `const guard = await loadGuard();` і поверни рядок з `guard.name`.",
    difficulty: 2,
  },
  {
    id: 89,
    arc: "Promises та async/await",
    arcNumber: 12,
    locationName: "Вежа Async",
    title: "fetch()",
    concept: "`fetch(url)` надсилає HTTP-запит і повертає проміс з об'єктом `Response`. Тіло відповіді читається ще одним промісом: `response.json()`. GET — метод за замовчуванням. (У тренажері запити до тестового API jsonplaceholder перехоплюються, тож завдання працює навіть офлайн.)",
    example: `const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
const post = await response.json();
console.log(post.title);`,
    missionStory: "З вершини вежі видно далекі землі. Надішли сигнал до віддаленого архіву й дізнайся ім'я першого літописця.",
    worldEvent: "Далекий архів відповів на сигнал вежі.",
    taskType: "write-function",
    prompt: "Напиши async-функцію `getUserName()`, яка робить GET-запит до `https://jsonplaceholder.typicode.com/users/1`, перетворює відповідь на JSON і повертає поле `name`.",
    functionName: "getUserName",
    fileName: "archive.js",
    starterCode: `async function getUserName() {

}`,
    testCases: [
      {
        name: "Повертає ім'я \"Leanne Graham\"",
        fetch: { data: { id: 1, name: "Leanne Graham", username: "Bret", email: "Sincere@april.biz" } },
        async check(ctx) {
          const name = await ctx.fn();
          return { pass: name === "Leanne Graham", actual: ctx.show(name), expected: "\"Leanne Graham\"" };
        },
      },
      {
        name: "Запит іде на правильну адресу",
        fetch: { data: { id: 1, name: "Leanne Graham" } },
        async check(ctx) {
          await ctx.fn();
          const url = ctx.fetchCalls[0];
          return {
            pass: url === "https://jsonplaceholder.typicode.com/users/1",
            actual: ctx.show(url),
            expected: "\"https://jsonplaceholder.typicode.com/users/1\"",
          };
        },
      },
    ],
    codeChecks: [
      { re: /fetch\(/, label: "Використано fetch()" },
      { re: /\.json\(\)/, label: "Відповідь прочитано через .json()" },
    ],
    solution: `async function getUserName() {
  const response = await fetch("https://jsonplaceholder.typicode.com/users/1");
  const user = await response.json();
  return user.name;
}`,
    hint: "Два `await`: перший — на `fetch(...)`, другий — на `response.json()`. Потім `return user.name;`.",
    difficulty: 2,
  },
  {
    id: 90,
    arc: "Promises та async/await",
    arcNumber: 12,
    locationName: "Вежа Async",
    title: "Обробка JSON",
    concept: "API зазвичай повертає масив об'єктів. Після `response.json()` це звичайні JS-дані: їх фільтрують, перетворюють і показують. Варто перевіряти `response.ok`: `fetch` не вважає статус 404 чи 500 помилкою.",
    example: `const response = await fetch(url);
if (!response.ok) throw new Error("HTTP " + response.status);
const todos = await response.json();
const done = todos.filter((t) => t.completed);`,
    missionStory: "Вежу Async майже підкорено! Лишилось отримати від архіву список виконаних доручень і доповісти про них королю.",
    worldEvent: "Вежу Async підкорено — час приборкано!",
    taskType: "write-function",
    prompt: "Напиши async-функцію `getCompletedTitles()`: отримай масив доручень з `https://jsonplaceholder.typicode.com/todos?_limit=5` і поверни масив `title` лише тих, у кого `completed === true`.",
    functionName: "getCompletedTitles",
    fileName: "archive.js",
    starterCode: `async function getCompletedTitles() {

}`,
    testCases: [
      {
        name: "Повертає заголовки виконаних доручень",
        fetch: {
          data: [
            { userId: 1, id: 1, title: "delectus aut autem", completed: false },
            { userId: 1, id: 2, title: "quis ut nam facilis et officia qui", completed: false },
            { userId: 1, id: 3, title: "fugiat veniam minus", completed: false },
            { userId: 1, id: 4, title: "et porro tempora", completed: true },
            { userId: 1, id: 5, title: "laboriosam mollitia et enim quasi adipisci quia provident illum", completed: false },
          ],
        },
        async check(ctx) {
          const titles = await ctx.fn();
          return {
            pass: ctx.equal(titles, ["et porro tempora"]) && ctx.fetchCalls[0] === "https://jsonplaceholder.typicode.com/todos?_limit=5",
            actual: ctx.show(titles),
            expected: "[\"et porro tempora\"]",
          };
        },
      },
      {
        name: "Кілька виконаних доручень",
        fetch: {
          data: [
            { id: 1, title: "Знайти ключ", completed: true },
            { id: 2, title: "Відчинити браму", completed: false },
            { id: 3, title: "Зійти на вежу", completed: true },
          ],
        },
        async check(ctx) {
          const titles = await ctx.fn();
          return { pass: ctx.equal(titles, ["Знайти ключ", "Зійти на вежу"]), actual: ctx.show(titles), expected: "[\"Знайти ключ\", \"Зійти на вежу\"]" };
        },
      },
    ],
    codeChecks: [
      { re: /\.filter\(/, label: "Використано filter()" },
      { re: /\.map\(/, label: "Використано map()" },
    ],
    solution: `async function getCompletedTitles() {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
  const todos = await response.json();
  return todos.filter((todo) => todo.completed).map((todo) => todo.title);
}`,
    hint: "Після `await response.json()` маєш масив. Далі ланцюжок: `.filter((t) => t.completed).map((t) => t.title)`.",
    difficulty: 3,
  },

  /* ───────────── Арка XIII — Обробка помилок → Вершина вежі Async ───────────── */
  {
    id: 91,
    arc: "Обробка помилок",
    arcNumber: 13,
    locationName: "Вершина вежі Async",
    title: "try / catch",
    concept: "`try { ... } catch (error) { ... }` перехоплює помилку, що виникла в блоці `try`, і передає керування в `catch`, тож програма не падає. Об'єкт `error` має `name` і `message`. Класичний приклад — `JSON.parse` некоректного рядка.",
    example: `try {
  JSON.parse("{зламано");
} catch (error) {
  console.log("Не вдалося:", error.name); // SyntaxError
}`,
    missionStory: "На вершині вежі вирує шторм помилок. Блискавка вже пошкодила кілька сувоїв — читання такого сувою валить мага з ніг.",
    worldEvent: "Пошкоджені сувої більше не збивають магів з ніг.",
    taskType: "fix-code",
    prompt: "Функція падає, якщо отримує пошкоджений JSON. Обгорни небезпечний код у `try/catch`: для коректного JSON повертай поле `spell`, а при помилці — рядок `\"Сувій пошкоджено\"`.",
    functionName: "readScroll",
    fileName: "scroll.js",
    starterCode: `function readScroll(json) {
  const data = JSON.parse(json);
  return data.spell;
}`,
    testCases: [
      { input: ["{\"spell\":\"Світло\"}"], expectedOutput: "Світло" },
      { input: ["{зламаний сувій"], expectedOutput: "Сувій пошкоджено" },
      { input: [""], expectedOutput: "Сувій пошкоджено" },
    ],
    codeChecks: [
      { re: /\btry\s*\{/, label: "Є блок try" },
      { re: /\bcatch\b/, label: "Є блок catch" },
    ],
    solution: `function readScroll(json) {
  try {
    const data = JSON.parse(json);
    return data.spell;
  } catch (error) {
    return "Сувій пошкоджено";
  }
}`,
    hint: "Перенеси обидва рядки в `try { ... }`, а в `catch (error) { ... }` поверни `\"Сувій пошкоджено\"`.",
    difficulty: 1,
  },
  {
    id: 92,
    arc: "Обробка помилок",
    arcNumber: 13,
    locationName: "Вершина вежі Async",
    title: "try / catch / finally",
    concept: "Блок `finally` виконується після `try`/`catch` ЗАВЖДИ: була помилка чи ні, і навіть якщо в `try` чи `catch` спрацював `return`. Там звільняють ресурси, пишуть у журнал, ховають індикатори.",
    example: `function work() {
  try {
    return "результат";
  } finally {
    console.log("прибираю"); // виконається перед поверненням
  }
}`,
    missionStory: "Вітрові маги на вершині творять закляття проти шторму. Хоч би що сталося, кожне закляття має бути записане в журнал вежі.",
    worldEvent: "Журнал вершини записує кожне закляття без пропусків.",
    taskType: "write-function",
    prompt: "Напиши функцію `runSpell(spell, journal)`: виклич `spell()` і поверни результат; якщо `spell` кидає помилку — поверни `\"Збій: <message>\"`. У будь-якому разі додай у масив `journal` рядок `\"заклинання завершено\"` (через `finally`).",
    functionName: "runSpell",
    fileName: "storm.js",
    starterCode: `function runSpell(spell, journal) {

}`,
    testCases: [
      {
        name: "Успішне закляття: результат і запис у журналі",
        check(ctx) {
          const journal = [];
          const result = ctx.fn(() => "щит", journal);
          return {
            pass: result === "щит" && ctx.equal(journal, ["заклинання завершено"]),
            actual: ctx.show(result) + ", журнал " + ctx.show(journal),
            expected: "\"щит\", журнал [\"заклинання завершено\"]",
          };
        },
      },
      {
        name: "Зірване закляття: повідомлення і запис у журналі",
        check(ctx) {
          const journal = [];
          const result = ctx.fn(() => { throw new Error("шторм"); }, journal);
          return {
            pass: result === "Збій: шторм" && ctx.equal(journal, ["заклинання завершено"]),
            actual: ctx.show(result) + ", журнал " + ctx.show(journal),
            expected: "\"Збій: шторм\", журнал [\"заклинання завершено\"]",
          };
        },
      },
    ],
    codeChecks: [{ re: /\bfinally\s*\{/, label: "Є блок finally" }],
    solution: `function runSpell(spell, journal) {
  try {
    return spell();
  } catch (error) {
    return "Збій: " + error.message;
  } finally {
    journal.push("заклинання завершено");
  }
}`,
    hint: "`try { return spell(); } catch (error) { return \"Збій: \" + error.message; } finally { journal.push(\"заклинання завершено\"); }`",
    difficulty: 2,
  },
  {
    id: 93,
    arc: "Обробка помилок",
    arcNumber: 13,
    locationName: "Вершина вежі Async",
    title: "throw",
    concept: "`throw` кидає власну помилку і перериває виконання функції. Кидай об'єкти помилок (`new Error(\"...\")`, `new TypeError(\"...\")`, `new RangeError(\"...\")`), а не рядки: вони мають `name`, `message` і стек викликів.",
    example: `function setVolume(level) {
  if (level > 10) {
    throw new RangeError("Гучність до 10");
  }
  return level;
}`,
    missionStory: "Шторм майже вщух! Лишилось захистити запаси цілющого зілля: зіллєвар має гучно протестувати, якщо хтось хоче випити забагато або підсуває не те.",
    worldEvent: "Шторм помилок на вершині знешкоджено!",
    taskType: "write-function",
    prompt: "Напиши функцію `drinkPotion(dose)`: якщо `dose` не число — кинь `TypeError` з повідомленням `\"Доза має бути числом\"`; якщо доза більша за 3 — кинь `RangeError` з повідомленням `\"Забагато зілля!\"`; інакше поверни `\"Випито <dose>\"`.",
    functionName: "drinkPotion",
    fileName: "potion.js",
    starterCode: `function drinkPotion(dose) {

}`,
    testCases: [
      { input: [2], expectedOutput: "Випито 2" },
      { input: [3], expectedOutput: "Випито 3" },
      { input: [5], throws: { name: "RangeError", message: "Забагато зілля!" } },
      { input: ["2"], throws: { name: "TypeError", message: "Доза має бути числом" } },
    ],
    codeChecks: [{ re: /\bthrow\s+new\s+\w*Error\(/, label: "Кидається об'єкт помилки через throw new" }],
    solution: `function drinkPotion(dose) {
  if (typeof dose !== "number") {
    throw new TypeError("Доза має бути числом");
  }
  if (dose > 3) {
    throw new RangeError("Забагато зілля!");
  }
  return "Випито " + dose;
}`,
    hint: "Спершу перевір тип (`typeof dose !== \"number\"`), потім розмір. Пиши `throw new TypeError(\"...\")` і `throw new RangeError(\"...\")`.",
    difficulty: 2,
  },

  /* ───────────── Арка XIV — Фінал → Замок фіналу ───────────── */
  {
    id: 94,
    arc: "Фінал",
    arcNumber: 14,
    locationName: "Замок фіналу",
    title: "Класи",
    concept: "`class` описує шаблон для створення об'єктів. `constructor` викликається під час `new` і задає властивості через `this`, а методи класу спільні для всіх екземплярів. Під капотом класи працюють на прототипах.",
    example: `class Knight {
  constructor(name) {
    this.name = name;
    this.armor = 10;
  }
  salute() {
    return "Слава королівству! — каже " + this.name;
  }
}
const k = new Knight("Тарас");`,
    missionStory: "Біля руїн Замку фіналу збираються захисники. Щоб навчити нових героїв, королівство потребує креслення — класу героя.",
    worldEvent: "Перші герої вишикувались біля стін замку.",
    taskType: "write-function",
    prompt: "Напиши клас `Hero`: конструктор приймає `name` і `hp` (за замовчуванням 100) і зберігає їх у `this`. Метод `takeDamage(amount)` зменшує `hp`, але не нижче 0, і повертає нове `hp`. Метод `isAlive()` повертає `true`, якщо `hp > 0`.",
    exports: ["Hero"],
    fileName: "hero.js",
    starterCode: `class Hero {
  constructor(name, hp) {

  }

  // takeDamage(amount)

  // isAlive()
}`,
    testCases: [
      {
        name: "new Hero(\"Аліса\") має name і hp = 100",
        check(ctx) {
          const Hero = ctx.get("Hero");
          const hero = new Hero("Аліса");
          return { pass: hero.name === "Аліса" && hero.hp === 100, actual: ctx.show({ name: hero.name, hp: hero.hp }), expected: "{ name: \"Аліса\", hp: 100 }" };
        },
      },
      {
        name: "takeDamage зменшує hp, але не нижче 0",
        check(ctx) {
          const Hero = ctx.get("Hero");
          const hero = new Hero("Тарас", 50);
          const a = hero.takeDamage(20);
          const b = hero.takeDamage(100);
          return { pass: a === 30 && b === 0 && hero.hp === 0, actual: ctx.show(a) + ", " + ctx.show(b), expected: "30, 0" };
        },
      },
      {
        name: "isAlive() відображає стан героя",
        check(ctx) {
          const Hero = ctx.get("Hero");
          const hero = new Hero("Мавка", 10);
          const before = hero.isAlive();
          hero.takeDamage(10);
          const after = hero.isAlive();
          return { pass: before === true && after === false, actual: ctx.show(before) + " → " + ctx.show(after), expected: "true → false" };
        },
      },
    ],
    codeChecks: [{ re: /class\s+Hero\b/, label: "Оголошено class Hero" }],
    solution: `class Hero {
  constructor(name, hp = 100) {
    this.name = name;
    this.hp = hp;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    return this.hp;
  }

  isAlive() {
    return this.hp > 0;
  }
}`,
    hint: "У конструкторі: `this.name = name; this.hp = hp;` (і `hp = 100` у параметрах). Для «не нижче 0» стане в пригоді `Math.max(0, this.hp - amount)`.",
    difficulty: 2,
  },
  {
    id: 95,
    arc: "Фінал",
    arcNumber: 14,
    locationName: "Замок фіналу",
    title: "export / import",
    concept: "ES-модулі розбивають код на файли. `export` робить функцію чи змінну доступною іншим файлам, а `import { name } from \"./file.js\"` підключає її. Усе, що не експортовано, лишається приватним для модуля. У браузері модуль підключають через `<script type=\"module\">`.",
    example: `// math.js
export function add(a, b) { return a + b; }

// main.js
import { add } from "./math.js";
add(2, 3); // 5`,
    missionStory: "Бойові закляття замку були зібрані в одному величезному сувої. Архімаг розділив його: `main.js` уже імпортує закляття, але файл `combat.js` досі нічого не віддає назовні.",
    worldEvent: "Бібліотеку замку впорядковано за модулями.",
    taskType: "fix-code",
    prompt: "Файл `main.js` (див. нижче) імпортує `calcDamage` і `calcHeal` з `combat.js`, але `combat.js` нічого не експортує. Додай експорт цих двох функцій. Секретна константа `SECRET_FORMULA` має лишитися приватною.",
    html: null,
    readonlyFiles: [
      {
        name: "main.js",
        code: `import { calcDamage, calcHeal } from "./combat.js";

console.log(calcDamage(10, 2)); // 20
console.log(calcHeal(80));      // 50`,
      },
    ],
    module: true,
    exports: ["calcDamage", "calcHeal", "SECRET_FORMULA"],
    fileName: "combat.js",
    starterCode: `function calcDamage(power, multiplier) {
  return power * multiplier;
}

function calcHeal(amount) {
  return Math.min(amount, 50);
}

const SECRET_FORMULA = 42;`,
    testCases: [
      {
        name: "calcDamage експортовано і працює",
        check(ctx) {
          const exported = ctx.moduleExports.includes("calcDamage");
          const value = exported ? ctx.get("calcDamage")(10, 2) : undefined;
          return { pass: exported && value === 20, actual: exported ? "calcDamage(10, 2) → " + ctx.show(value) : "не експортовано", expected: "calcDamage(10, 2) → 20" };
        },
      },
      {
        name: "calcHeal експортовано і працює",
        check(ctx) {
          const exported = ctx.moduleExports.includes("calcHeal");
          const value = exported ? ctx.get("calcHeal")(80) : undefined;
          return { pass: exported && value === 50, actual: exported ? "calcHeal(80) → " + ctx.show(value) : "не експортовано", expected: "calcHeal(80) → 50" };
        },
      },
      {
        name: "SECRET_FORMULA лишилась приватною",
        check(ctx) {
          const leaked = ctx.moduleExports.includes("SECRET_FORMULA");
          return { pass: !leaked, actual: leaked ? "експортовано" : "приватна", expected: "приватна" };
        },
      },
    ],
    solution: `export function calcDamage(power, multiplier) {
  return power * multiplier;
}

export function calcHeal(amount) {
  return Math.min(amount, 50);
}

const SECRET_FORMULA = 42;`,
    hint: "Допиши слово `export` перед `function calcDamage` і `function calcHeal`. Або одним рядком унизу: `export { calcDamage, calcHeal };`.",
    difficulty: 2,
  },
  {
    id: 96,
    arc: "Фінал",
    arcNumber: 14,
    locationName: "Замок фіналу",
    title: "Фінальний проєкт",
    concept: "Фінальний застосунок об'єднує все: `fetch` + `async/await` для даних, перевірку `response.ok` і `throw`, `try/catch` для збоїв мережі, `localStorage` + JSON для офлайн-кешу, DOM-рендер списку з класами. Так влаштовані справжні вебзастосунки.",
    example: `async function load() {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    save(data);
    render(data);
  } catch (error) {
    render(loadSaved()); // офлайн-режим
  }
}`,
    missionStory: "Останнє випробування! Королю потрібна дошка квестів, що бере доручення з далекого архіву, пам'ятає їх і не ламається, навіть коли гінці не дісталися до замку.",
    worldEvent: "Замок відбудовано — королівство врятоване!",
    taskType: "write-function",
    prompt: "Збери міні-застосунок «Дошка квестів». `saveQuests(quests)` зберігає масив у `localStorage` (ключ `\"quests\"`, JSON). `loadSavedQuests()` повертає збережений масив або `[]`. `renderQuests(quests)` очищає `#quest-list` і додає `<li>` з `title` кожного квесту, а виконаним (`completed`) — ще й клас `done`. `async loadQuests()` завантажує квести з `API_URL`. Якщо `response.ok` хибне — кинь помилку. При успіху збережи, відмалюй, запиши в `#status` текст `\"Завантажено: <кількість>\"` і поверни масив. При будь-якій помилці запиши в `#status` текст `\"Немає зв'язку — показую збережені квести\"`, відмалюй збережені й поверни їх.",
    exports: ["saveQuests", "loadSavedQuests", "renderQuests", "loadQuests"],
    fileName: "quest-board.js",
    html: `<p id="status">Завантаження...</p>
<ul id="quest-list"></ul>`,
    starterCode: `const API_URL = "https://jsonplaceholder.typicode.com/todos?_limit=3";

function saveQuests(quests) {

}

function loadSavedQuests() {

}

function renderQuests(quests) {
  const list = document.querySelector("#quest-list");

}

async function loadQuests() {
  const status = document.querySelector("#status");

}`,
    testCases: [
      {
        name: "Успіх: квести завантажено, збережено й відмальовано",
        fetch: {
          data: [
            { id: 1, title: "Знайти корону", completed: false },
            { id: 2, title: "Відбудувати стіну", completed: true },
            { id: 3, title: "Скликати лицарів", completed: false },
          ],
        },
        async check(ctx) {
          const quests = await ctx.get("loadQuests")();
          const items = ctx.$$("#quest-list li");
          const titles = items.map((li) => li.textContent);
          const saved = JSON.parse(ctx.storage.getItem("quests") || "null");
          const ok =
            Array.isArray(quests) && quests.length === 3 &&
            ctx.equal(titles, ["Знайти корону", "Відбудувати стіну", "Скликати лицарів"]) &&
            items[1].classList.contains("done") && !items[0].classList.contains("done") &&
            Array.isArray(saved) && saved.length === 3 &&
            ctx.$("#status").textContent === "Завантажено: 3" &&
            ctx.fetchCalls[0] === "https://jsonplaceholder.typicode.com/todos?_limit=3";
          return {
            pass: ok,
            actual: "список " + ctx.show(titles) + ", статус " + ctx.show(ctx.$("#status").textContent) + ", у сховищі " + (Array.isArray(saved) ? saved.length : 0),
            expected: "3 квести у списку (2-й з класом done), статус \"Завантажено: 3\", 3 у сховищі",
          };
        },
      },
      {
        name: "Мережа впала: показуються збережені квести",
        fetch: { fail: true },
        storage: { quests: "[{\"id\":7,\"title\":\"Збережений квест\",\"completed\":true}]" },
        async check(ctx) {
          const quests = await ctx.get("loadQuests")();
          const items = ctx.$$("#quest-list li");
          const ok =
            Array.isArray(quests) && quests.length === 1 &&
            items.length === 1 && items[0].textContent === "Збережений квест" && items[0].classList.contains("done") &&
            ctx.$("#status").textContent === "Немає зв'язку — показую збережені квести";
          return {
            pass: ok,
            actual: "статус " + ctx.show(ctx.$("#status").textContent) + ", у списку " + items.length,
            expected: "статус \"Немає зв'язку — показую збережені квести\", у списку 1",
          };
        },
      },
      {
        name: "Сервер відповів 500: це теж помилка",
        fetch: { ok: false, status: 500, data: { error: "Internal Server Error" } },
        async check(ctx) {
          const quests = await ctx.get("loadQuests")();
          const ok = ctx.equal(quests, []) && ctx.$$("#quest-list li").length === 0 &&
            ctx.$("#status").textContent === "Немає зв'язку — показую збережені квести";
          return { pass: ok, actual: "повернено " + ctx.show(quests) + ", статус " + ctx.show(ctx.$("#status").textContent), expected: "повернено [], статус про відсутність зв'язку" };
        },
      },
      {
        name: "Повторний рендер не дублює список",
        check(ctx) {
          const render = ctx.get("renderQuests");
          render([{ title: "A", completed: false }, { title: "B", completed: false }]);
          render([{ title: "C", completed: true }]);
          const titles = ctx.$$("#quest-list li").map((li) => li.textContent);
          return { pass: ctx.equal(titles, ["C"]), actual: ctx.show(titles), expected: "[\"C\"]" };
        },
      },
    ],
    codeChecks: [
      { re: /\bawait\s+fetch\(/, label: "Дані завантажено через await fetch()" },
      { re: /\.ok\b/, label: "Перевірено response.ok" },
      { re: /\btry\s*\{[\s\S]*\bcatch\b/, label: "Помилки ловить try/catch" },
      { re: /localStorage\.setItem\(/, label: "Квести зберігаються в localStorage" },
      { re: /createElement\(/, label: "Список будується через DOM" },
    ],
    solution: `const API_URL = "https://jsonplaceholder.typicode.com/todos?_limit=3";

function saveQuests(quests) {
  localStorage.setItem("quests", JSON.stringify(quests));
}

function loadSavedQuests() {
  const saved = localStorage.getItem("quests");
  return saved ? JSON.parse(saved) : [];
}

function renderQuests(quests) {
  const list = document.querySelector("#quest-list");
  list.textContent = "";
  quests.forEach((quest) => {
    const li = document.createElement("li");
    li.textContent = quest.title;
    if (quest.completed) li.classList.add("done");
    list.appendChild(li);
  });
}

async function loadQuests() {
  const status = document.querySelector("#status");
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }
    const quests = await response.json();
    saveQuests(quests);
    renderQuests(quests);
    status.textContent = "Завантажено: " + quests.length;
    return quests;
  } catch (error) {
    const saved = loadSavedQuests();
    status.textContent = "Немає зв'язку — показую збережені квести";
    renderQuests(saved);
    return saved;
  }
}`,
    hint: "Збери з готових цеглинок попередніх рівнів: тіло `loadQuests` — це `try { fetch → if (!response.ok) throw → json → save → render → status → return } catch { saved → status → render → return }`.",
    difficulty: 3,
  },
];
