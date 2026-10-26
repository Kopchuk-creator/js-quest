/* =========================================================
   levels-checks.js — перевірка розуміння для 96 місій світу JavaScript.
   Підключається після levels.js і додає кожному рівню
     level.understanding = { question, variation }

   question  — коротке запитання на розуміння. Автоматично НЕ оцінюється:
               відповідь пояснюють наставнику (позначка «перевіряє ментор»).
   variation — невелика зміна умови, яку перевіряють автоматично:
     • для завдань з кодом: prompt + testCases (+ за потреби functionName,
       addExports, html, codeChecks). Еталон зміни будується з level.solution:
       patch — пари [що, на що] (замінюються всі входження), append — код у
       кінець, solution — повний текст, якщо зміна перебудовує функцію;
     • для predict-output: { type: "predict", prompt, code, expectedAnswer }.

   tests/run.html перевіряє, що еталон зміни проходить її тести, а еталон
   самого рівня — ні (тобто зміна справді щось вимагає), і що відповіді
   predict-зміни збігаються з реальним виконанням коду.
   ========================================================= */
(function () {
  "use strict";

  // Тест «вхідні дані → значення змінних».
  const vars = (name, inputs, expected) => ({ name, inputs, check: jsqVars(expected) });
  // Тест «вхідні дані → рядки консолі».
  const logs = (name, inputs, expected) => ({ name, inputs, check: jsqLogs(expected) });
  // Тест «текст елемента сторінки».
  const textIs = (ctx, sel, expected) => {
    const t = jsqText(ctx, sel);
    return { pass: t === expected, actual: ctx.show(t), expected: ctx.show(expected) };
  };

  const CHECKS = {
    /* ───────── Арка I — змінні, типи, оператори ───────── */
    1: {
      question: "Чому `courseName` оголошено через `const`, а `completedLessons` — через `let`? Що станеться, якщо оголосити `completedLessons` через `const`, а потім збільшити?",
      variation: {
        prompt: "Додай ціль курсу `lessonsGoal` — `10` (вона не змінюється) і `lessonsLeft` — скільки занять лишилось (`lessonsGoal - completedLessons`). Виведи `lessonsLeft` останнім рядком консолі.",
        addExports: ["lessonsGoal", "lessonsLeft"],
        codeChecks: [{ re: /const\s+lessonsGoal\b/, label: "`lessonsGoal` — через `const`" }],
        testCases: [
          { name: "Ціль 10, лишилось 9", check: jsqVars({ lessonsGoal: 10, lessonsLeft: 9 }) },
          { name: "lessonsLeft — останній рядок консолі", check(ctx) { const last = ctx.logs[ctx.logs.length - 1]; return { pass: last === "9", actual: ctx.show(last), expected: "\"9\"" }; } },
        ],
        append: "const lessonsGoal = 10;\nconst lessonsLeft = lessonsGoal - completedLessons;\nconsole.log(lessonsLeft);",
      },
    },
    2: {
      question: "Чим `null` в `avatar` відрізняється від `undefined` у `nickname`? Хто «ставить» кожне з цих значень — ти чи JavaScript?",
      variation: {
        prompt: "Додай рейтинг `rating` — число `4.5`, останній вхід `lastLogin` — свідомо порожній (користувач ще не входив) і `ratingType` — результат `typeof rating`.",
        addExports: ["rating", "lastLogin", "ratingType"],
        testCases: [{ name: "rating, lastLogin і ratingType", check: jsqVars({ rating: 4.5, lastLogin: null, ratingType: "number" }) }],
        append: "const rating = 4.5;\nconst lastLogin = null;\nconst ratingType = typeof rating;",
      },
    },
    3: {
      question: "Чому `typeof null` дає `object`, а `typeof NaN` — `number`? Як тоді надійно перевірити, що значення — саме `null`?",
      variation: {
        type: "predict",
        prompt: "Ті самі правила — інші значення. Що виведе кожен рядок?",
        code: "console.log(typeof 0);\nconsole.log(typeof \"\");\nconsole.log(typeof [1, 2]);\nconsole.log(typeof function () {});",
        expectedAnswer: ["number", "string", "object", "function"],
      },
    },
    4: {
      question: "Чому `\"150\" + 50` дає `\"15050\"`, а `\"150\" - 50` — число `100`?",
      variation: {
        prompt: "З форми прийшла ще й знижка рядком: `discount = \"20\"`. Обчисли `finalTotal` — суму зі знижкою числом (`180`) і `finalLabel` — `\"Разом зі знижкою: 180 грн\"`.",
        addExports: ["finalTotal", "finalLabel"],
        testCases: [{ name: "Знижка 20 грн", check: jsqVars({ finalTotal: 180, finalLabel: "Разом зі знижкою: 180 грн" }) }],
        append: "const discount = \"20\"; // теж з поля форми\nconst finalTotal = total - Number(discount);\nconst finalLabel = \"Разом зі знижкою: \" + finalTotal + \" грн\";",
      },
    },
    5: {
      question: "Чому `\"4\" * \"150\"` дає число, а `\"4\" + \"150\"` — ні? І чому `NaN === NaN` — `false`?",
      variation: {
        prompt: "Нуль занять — теж непридатне замовлення. Тепер `isValid` — `true` лише для справжнього числа, **більшого за нуль**.",
        testCases: [
          vars("\"0\" занять → isValid false", { lessonsCount: "0", pricePerLesson: "150" }, { totalCost: 0, isValid: false }),
          vars("\"4\" по \"150\" → true", { lessonsCount: "4", pricePerLesson: "150" }, { totalCost: 600, isValid: true }),
          vars("Текст → false", { lessonsCount: "abc", pricePerLesson: "150" }, { isValid: false }),
        ],
        patch: [["const isValid = !Number.isNaN(totalCost);", "const isValid = !Number.isNaN(totalCost) && totalCost > 0;"]],
      },
    },
    6: {
      question: "Чим шаблонний рядок `` `...${x}...` `` зручніший за склеювання через `+`? Що потрапить у рядок, якщо в `${}` написати вираз?",
      variation: {
        prompt: "Додай `weekInfo` — `Тиждень: N хв`, де N — тижневий час (7 днів по `lessonMinutes`), порахований просто в рядку.",
        addExports: ["weekInfo"],
        testCases: [
          vars("40 хв на день → 280", { userName: "Оля", lessonMinutes: 40, days: 5 }, { weekInfo: "Тиждень: 280 хв" }),
          vars("25 хв на день → 175", { userName: "Петро", lessonMinutes: 25, days: 3 }, { weekInfo: "Тиждень: 175 хв" }),
        ],
        append: "const weekInfo = `Тиждень: ${7 * lessonMinutes} хв`;",
      },
    },
    7: {
      question: "Чому рядок `\"0\"` — truthy, а число `0` — falsy? Назви всі falsy-значення, які ти бачив у цьому рівні.",
      variation: {
        type: "predict",
        prompt: "Інші значення в логічному контексті. Що виведе кожен рядок?",
        code: "console.log(Boolean(\" \"));\nconsole.log(Boolean([]));\nconsole.log(Boolean({}));\nconsole.log(Boolean(0.0));",
        expectedAnswer: ["true", "true", "true", "false"],
      },
    },
    8: {
      question: "Чому в робочому коді радять писати `===`? Наведи приклад, де `==` приховає помилку в даних.",
      variation: {
        type: "predict",
        prompt: "Ще чотири порівняння. Що виведе кожен рядок?",
        code: "console.log(\"\" == 0);\nconsole.log(\"\" === 0);\nconsole.log(null == 0);\nconsole.log(undefined == null);",
        expectedAnswer: ["true", "false", "false", "true"],
      },
    },

    /* ───────── Арка II — умови ───────── */
    9: {
      question: "Коли тернарний оператор кращий за `if / else`, а коли краще лишити `if / else`?",
      variation: {
        prompt: "Додай `minutesLabel` через тернарний оператор: для 0 хвилин — `\"Ще не починав\"`, інакше — `\"Позаймався N хв\"`.",
        addExports: ["minutesLabel"],
        testCases: [
          vars("0 хв", { done: false, hasCourse: true, studiedMinutes: 0, dailyGoal: 40 }, { minutesLabel: "Ще не починав" }),
          vars("25 хв", { done: false, hasCourse: true, studiedMinutes: 25, dailyGoal: 40 }, { minutesLabel: "Позаймався 25 хв" }),
        ],
        append: "const minutesLabel = studiedMinutes === 0 ? \"Ще не починав\" : `Позаймався ${studiedMinutes} хв`;",
      },
    },
    10: {
      question: "Чому `savedMinutes || 30` перетворює `0` на `30`? Для яких значень спрацьовує запасний варіант після `||`?",
      variation: {
        prompt: "Нуль хвилин — свідомий вибір, а не «даних немає». Зроби `minutesShown` через оператор `??`: він підставляє запасне `30` лише для `null` і `undefined`, тож `0` лишається `0`.",
        codeChecks: [{ re: /savedMinutes\s*\?\?\s*30/, label: "`minutesShown` — через `??`" }],
        testCases: [
          vars("0 хв лишається 0", { isActive: true, hasPaid: true, userName: "Оля", savedMinutes: 0 }, { minutesShown: 0 }),
          vars("null → 30", { isActive: true, hasPaid: true, userName: "Оля", savedMinutes: null }, { minutesShown: 30 }),
          vars("45 → 45", { isActive: true, hasPaid: true, userName: "Оля", savedMinutes: 45 }, { minutesShown: 45 }),
        ],
        patch: [["savedMinutes || 30", "savedMinutes ?? 30"]],
      },
    },
    11: {
      question: "Чому умова — `studiedMinutes >= dailyGoal`, а не `>`? Що побачить користувач рівно на межі, якщо помилитися?",
      variation: {
        prompt: "Зроби повідомлення про нестачу інформативнішим: `Бракує N хв до цілі M хв`. Повідомлення про досягнуту ціль не змінюється.",
        testCases: [
          logs("20 із 30", { studiedMinutes: 20, dailyGoal: 30 }, ["Бракує 10 хв до цілі 30 хв"]),
          logs("30 із 30", { studiedMinutes: 30, dailyGoal: 30 }, ["Ціль досягнута!"]),
        ],
        patch: [["Бракує ${dailyGoal - studiedMinutes} хв`", "Бракує ${dailyGoal - studiedMinutes} хв до цілі ${dailyGoal} хв`"]],
      },
    },
    12: {
      question: "Чому порядок перевірок у ланцюжку `else if` важливий? Що зламається, якщо першою поставити `minutes < 30`?",
      variation: {
        prompt: "Додай стан `\"Марафон\"` для занять понад 120 хв. `\"Перевищив план\"` лишається для 46–120 хв.",
        testCases: [
          vars("46 → Перевищив план", { minutes: 46 }, { status: "Перевищив план" }),
          vars("120 → Перевищив план", { minutes: 120 }, { status: "Перевищив план" }),
          vars("121 → Марафон", { minutes: 121 }, { status: "Марафон" }),
          vars("0 → Не почав", { minutes: 0 }, { status: "Не почав" }),
        ],
        patch: [["} else {\n  status = \"Перевищив план\";\n}", "} else if (minutes <= 120) {\n  status = \"Перевищив план\";\n} else {\n  status = \"Марафон\";\n}"]],
      },
    },
    13: {
      question: "Чим відрізняються `isActive && hasPaid || isAdmin` і `isActive && (hasPaid || isAdmin)`? Для кого з них результат буде різним?",
      variation: {
        prompt: "Заблокований користувач (`isBlocked`) не має доступу взагалі — навіть адміністратор. Решта правил не змінюється.",
        testCases: [
          vars("Активний з оплатою, але заблокований → немає", { isActive: true, hasPaid: true, isAdmin: false, isBlocked: true }, { hasAccess: false }),
          vars("Заблокований адміністратор → немає", { isActive: false, hasPaid: false, isAdmin: true, isBlocked: true }, { hasAccess: false }),
          vars("Активний з оплатою → є", { isActive: true, hasPaid: true, isAdmin: false, isBlocked: false }, { hasAccess: true }),
          vars("Адміністратор → є", { isActive: false, hasPaid: false, isAdmin: true, isBlocked: false }, { hasAccess: true }),
        ],
        patch: [["const hasAccess = isPayingStudent || isAdmin;", "const hasAccess = (isPayingStudent || isAdmin) && !isBlocked;"]],
      },
    },
    14: {
      question: "Що станеться, якщо в `case \"learn\"` забути `break`? Чому JavaScript так поводиться?",
      variation: {
        prompt: "Додай режим `\"rest\"` — виводить лише `Відпочинь сьогодні`.",
        testCases: [
          logs("rest → одна інструкція", { mode: "rest" }, ["Відпочинь сьогодні"]),
          logs("review — як і раніше", { mode: "review" }, ["Повтори вчорашнє"]),
        ],
        patch: [["    console.log(\"Повтори вчорашнє\");\n    break;\n", "    console.log(\"Повтори вчорашнє\");\n    break;\n  case \"rest\":\n    console.log(\"Відпочинь сьогодні\");\n    break;\n"]],
      },
    },
    15: {
      question: "Навіщо `default`, якщо всі відомі режими вже описано? Що бачив би користувач з одруківкою без нього?",
      variation: {
        prompt: "`\"repeat\"` — синонім `\"review\"`: обидва виводять `Повтори вчорашнє`. Зроби це двома `case` поспіль, без копіювання `console.log`.",
        codeChecks: [{ re: /case\s+"repeat"\s*:\s*case\s+"review"\s*:|case\s+"review"\s*:\s*case\s+"repeat"\s*:/, label: "Два `case` поспіль" }],
        testCases: [
          logs("repeat", { mode: "repeat" }, ["Повтори вчорашнє"]),
          logs("review", { mode: "review" }, ["Повтори вчорашнє"]),
          logs("Невідомий режим", { mode: "lern" }, ["Невідомий режим: lern"]),
        ],
        patch: [["case \"review\":", "case \"repeat\":\n  case \"review\":"]],
      },
    },
    16: {
      question: "Чому з ранніми `return` не потрібні вкладені `if / else`? Що відбувається з рештою функції після `return`?",
      variation: {
        prompt: "Додай третій параметр `isBlocked`: заблокованим — `\"Профіль заблоковано\"`, і ця перевірка — найперша.",
        testCases: [
          { input: [true, true, true], expectedOutput: "Профіль заблоковано" },
          { input: [false, false, true], expectedOutput: "Профіль заблоковано" },
          { input: [true, true, false], expectedOutput: "Доступ відкрито" },
          { input: [false, true, false], expectedOutput: "Профіль неактивний" },
        ],
        patch: [["function getAccessMessage(isActive, hasCourse) {", "function getAccessMessage(isActive, hasCourse, isBlocked) {\n  if (isBlocked) return \"Профіль заблоковано\";"]],
      },
    },

    /* ───────── Арка III — цикли й функції ───────── */
    17: {
      question: "Скільки разів виконається тіло циклу, якщо `lessonsCount` дорівнює `0`? Чому?",
      variation: {
        prompt: "Виводь заняття у зворотному порядку — від `Заняття N` до `Заняття 1`. Сумарний час рахуй як раніше.",
        testCases: [
          { name: "3 заняття по 40 хв", inputs: { lessonsCount: 3, minutesPerLesson: 40 }, check(ctx) { const exp = ["Заняття 3", "Заняття 2", "Заняття 1"]; const t = jsqVal(ctx, "totalMinutes"); return { pass: ctx.equal(ctx.logs, exp) && t === 120, actual: ctx.show(ctx.logs) + ", totalMinutes " + ctx.show(t), expected: ctx.show(exp) + ", totalMinutes 120" }; } },
          vars("0 занять", { lessonsCount: 0, minutesPerLesson: 40 }, { totalMinutes: 0 }),
        ],
        patch: [["for (let i = 1; i <= lessonsCount; i++) {", "for (let i = lessonsCount; i >= 1; i--) {"]],
      },
    },
    18: {
      question: "Чим `while` тут зручніший за `for`? Що станеться, якщо забути збільшувати `total` у тілі циклу?",
      variation: {
        prompt: "Блоки тепер по 15 хв, а не по 10.",
        testCases: [
          vars("Ціль 30 → 2 блоки", { goal: 30 }, { total: 30, blocks: 2 }),
          vars("Ціль 31 → 3 блоки", { goal: 31 }, { total: 45, blocks: 3 }),
          vars("Ціль 0 → жодного", { goal: 0 }, { total: 0, blocks: 0 }),
        ],
        patch: [["total = total + 10;", "total = total + 15;"]],
      },
    },
    19: {
      question: "Чим `continue` відрізняється від `break`? Що вивів би цикл, якби замість `continue` стояв `break`?",
      variation: {
        prompt: "Вихідний тепер лише неділя — день з остачею `0` при діленні на 7.",
        testCases: [
          vars("14 днів → 12 навчальних", { daysTotal: 14 }, { studyDays: 12 }),
          logs("7 днів → дні 1–6", { daysTotal: 7 }, ["День 1", "День 2", "День 3", "День 4", "День 5", "День 6"]),
        ],
        patch: [["if (day % 7 === 6 || day % 7 === 0) continue;", "if (day % 7 === 0) continue;"]],
      },
    },
    20: {
      question: "Скільки разів виконується внутрішній цикл для 3 днів по 2 блоки? Чому лічильник `block` щодня починається з 1?",
      variation: {
        prompt: "Після всіх блоків кожного дня виводь підсумок дня: `День D: разом M хв`.",
        testCases: [
          logs("2 дні × 2 блоки по 30", { days: 2, blocksPerDay: 2, blockMinutes: 30 }, ["День 1, блок 1: 30 хв", "День 1, блок 2: 30 хв", "День 1: разом 60 хв", "День 2, блок 1: 30 хв", "День 2, блок 2: 30 хв", "День 2: разом 60 хв"]),
        ],
        patch: [["  }\n}", "  }\n  console.log(`День ${day}: разом ${blocksPerDay * blockMinutes} хв`);\n}"]],
      },
    },
    21: {
      question: "Чим `return` відрізняється від `console.log` усередині функції? Що отримає змінна, якщо функція нічого не повертає?",
      variation: {
        prompt: "Додай `weekendMessage` — `\"За вихідні: 90 хв\"` (2 дні по 45), теж через результат `calculateStudyTime`.",
        addExports: ["weekendMessage"],
        codeChecks: [{ re: /calculateStudyTime\(\s*2\s*,\s*45\s*\)/, label: "Використано `calculateStudyTime(2, 45)`" }],
        testCases: [{ name: "Повідомлення про вихідні", check: jsqVars({ weekendMessage: "За вихідні: 90 хв" }) }],
        append: "const weekendMessage = `За вихідні: ${calculateStudyTime(2, 45)} хв`;",
      },
    },
    22: {
      question: "Чому функцію-вираз не можна викликати до рядка, де її оголошено, а звичайне оголошення `function` — можна?",
      variation: {
        prompt: "Додай ще одну функцію-вираз `minutesToHours` (`90` → `1.5`) і `hoursResult` — години для `calculateStudyTime(3, 30)`.",
        addExports: ["minutesToHours", "hoursResult"],
        codeChecks: [{ re: /const\s+minutesToHours\s*=\s*function/, label: "`minutesToHours` — функція-вираз" }],
        testCases: [
          { fn: "minutesToHours", input: [90], expectedOutput: 1.5 },
          { name: "hoursResult — 1.5", check: jsqVars({ hoursResult: 1.5 }) },
        ],
        append: "const minutesToHours = function (minutes) {\n  return minutes / 60;\n};\n\nconst hoursResult = minutesToHours(calculateStudyTime(3, 30));",
      },
    },
    23: {
      question: "Коли стрілковій функції потрібне слово `return`, а коли ні? Що повертає стрілка з фігурними дужками без `return`?",
      variation: {
        prompt: "Зміни `buildMessage`: якщо ціль перевиконано — `Понад ціль на N хв`; рівно на межі — як і раніше `Ціль досягнута`.",
        testCases: [
          { fn: "buildMessage", input: [45, 40], expectedOutput: "Понад ціль на 5 хв" },
          { fn: "buildMessage", input: [40, 40], expectedOutput: "Ціль досягнута" },
          { fn: "buildMessage", input: [25, 40], expectedOutput: "Ще 15 хв" },
        ],
        patch: [["  if (minutes >= goal) {\n    return \"Ціль досягнута\";\n  }", "  if (minutes > goal) {\n    return `Понад ціль на ${minutes - goal} хв`;\n  }\n  if (minutes === goal) {\n    return \"Ціль досягнута\";\n  }"]],
      },
    },
    24: {
      question: "Чим параметр за замовчуванням відрізняється від `minutesPerDay || 30`, коли передали `0`? А коли передали `undefined`?",
      variation: {
        prompt: "Стандартна кількість днів теж є: `days = 7`. Виклик без аргументів дає 210.",
        testCases: [
          { input: [], expectedOutput: 210 },
          { input: [5], expectedOutput: 150 },
          { input: [undefined, 45], expectedOutput: 315 },
          { input: [2, 0], expectedOutput: 0 },
        ],
        patch: [["function calculateStudyTime(days, minutesPerDay = 30) {", "function calculateStudyTime(days = 7, minutesPerDay = 30) {"]],
      },
    },
    25: {
      question: "Навіщо `return null` після циклу? Що повернула б функція без нього, якщо число не знайдено?",
      variation: {
        prompt: "Узагальни функцію: `findFirstDivisibleBy(divisor, from, to)` шукає перше число, що ділиться на `divisor`.",
        functionName: "findFirstDivisibleBy",
        testCases: [
          { input: [5, 1, 20], expectedOutput: 5 },
          { input: [7, 8, 20], expectedOutput: 14 },
          { input: [10, 11, 19], expectedOutput: null },
        ],
        solution: "function findFirstDivisibleBy(divisor, from, to) {\n  for (let n = from; n <= to; n++) {\n    if (n % divisor === 0) return n;\n  }\n  return null;\n}",
      },
    },

    /* ───────── Арка IV — масиви ───────── */
    26: {
      question: "Чому остання тема — `topics[topics.length - 1]`, а не `topics[topics.length]`? Що повертає звертання за неіснуючим індексом?",
      variation: {
        prompt: "Додай `secondLast` — передостанню тему (або `undefined`, якщо тем менше двох).",
        addExports: ["secondLast"],
        testCases: [
          vars("П'ять тем", { topics: ["Змінні", "Умови", "Цикли", "Функції", "Масиви"] }, { secondLast: "Функції" }),
          vars("Дві теми", { topics: ["DOM", "Події"] }, { secondLast: "DOM" }),
          vars("Одна тема", { topics: ["DOM"] }, { secondLast: undefined }),
        ],
        append: "const secondLast = topics[topics.length - 2];",
      },
    },
    27: {
      question: "Що повертають `push` і `pop`? Чому `[].pop()` дає `undefined`, а не помилку?",
      variation: {
        prompt: "Наприкінці додай у кінець `\"DOM\"` і збережи в `lastTopic` останній елемент, **не видаляючи** його.",
        addExports: ["lastTopic"],
        testCases: [{ name: "Список і остання тема", check: jsqVars({ topics: ["Змінні", "Умови", "Цикли", "Масиви", "DOM"], lastTopic: "DOM" }) }],
        append: "topics.push(\"DOM\");\nconst lastTopic = topics[topics.length - 1];",
      },
    },
    28: {
      question: "Чим черга (`push` + `shift`) відрізняється від стосу (`push` + `pop`)? Яке завдання з черги беруть першим?",
      variation: {
        prompt: "Після всіх операцій з'явилося ще одне термінове завдання: додай `\"Термінове: відповісти ментору\"` на **початок** черги.",
        testCases: [{ name: "Черга після чотирьох операцій", check: jsqVars({ queue: ["Термінове: відповісти ментору", "Повторити цикли", "Масиви", "Об'єкти", "DOM"], current: "Термінове: виправити баг" }) }],
        append: "queue.unshift(\"Термінове: відповісти ментору\");",
      },
    },
    29: {
      question: "Чому другий аргумент `slice` не входить у результат? Як отримати останні дві теми, не знаючи довжини масиву?",
      variation: {
        prompt: "Додай `middle` — теми з індексами 2 і 3 (`\"Цикли\"`, `\"Функції\"`) через `slice`. `topics` не змінюй.",
        addExports: ["middle"],
        testCases: [{ name: "Середина списку", check: jsqVars({ middle: ["Цикли", "Функції"], topics: ["Змінні", "Умови", "Цикли", "Функції", "Масиви", "Об'єкти"] }) }],
        append: "const middle = topics.slice(2, 4);",
      },
    },
    30: {
      question: "Чим `splice` відрізняється від `slice`? Що саме повертає `splice`?",
      variation: {
        prompt: "Наприкінці видали дві останні теми **одним** викликом `splice` і збережи видалене в `lastTwoRemoved`.",
        addExports: ["lastTwoRemoved"],
        testCases: [{ name: "Список і видалене", check: jsqVars({ topics: ["Змінні", "Деструктуризація", "Умови"], lastTwoRemoved: ["Spread", "Масиви"] }) }],
        append: "const lastTwoRemoved = topics.splice(-2);",
      },
    },
    31: {
      question: "Чому `if (topics.indexOf(topic))` помиляється для першого елемента? Коли зручніший `includes`, а коли `indexOf`?",
      variation: {
        prompt: "Людям зручніша нумерація з одиниці: повертай `Тема «X» — №N` (перша тема — №1). Відповідь для відсутньої теми не змінюється.",
        testCases: [
          { input: [["Змінні", "Цикли", "Масиви"], "Змінні"], expectedOutput: "Тема «Змінні» — №1" },
          { input: [["Змінні", "Цикли", "Масиви"], "Масиви"], expectedOutput: "Тема «Масиви» — №3" },
          { input: [["Змінні", "Цикли", "Масиви"], "DOM"], expectedOutput: "Теми «DOM» немає" },
        ],
        patch: [["`Тема «${topic}» на позиції ${index}`", "`Тема «${topic}» — №${index + 1}`"]],
      },
    },
    32: {
      question: "Чому `[5, 30, 100, 15].sort()` без функції дає `[100, 15, 30, 5]`? Навіщо `slice()` перед `sort`?",
      variation: {
        prompt: "Додай `top2` — дві найбільші тривалості, від більшої до меншої. `durations` не змінюй.",
        addExports: ["top2"],
        testCases: [{ name: "Дві найдовші", check: jsqVars({ top2: [100, 30], durations: [5, 30, 100, 15] }) }],
        append: "const top2 = descending.slice(0, 2);",
      },
    },
    33: {
      question: "Що повертає `forEach`? Чому його результат не зберігають у змінну?",
      variation: {
        prompt: "Новий формат рядка: `Тема 1 з 3: Змінні` — з номером і загальною кількістю.",
        testCases: [
          logs("Три теми", { topics: ["Змінні", "Умови", "Цикли"] }, ["Тема 1 з 3: Змінні", "Тема 2 з 3: Умови", "Тема 3 з 3: Цикли"]),
          logs("Порожній список", { topics: [] }, []),
        ],
        patch: [["`${index + 1}. ${topic}`", "`Тема ${index + 1} з ${topics.length}: ${topic}`"]],
      },
    },
    34: {
      question: "Чому стрілка з фігурними дужками без `return` у `map` дає масив з `undefined`? Скільки елементів у результаті `map`?",
      variation: {
        prompt: "Додай `numbered` — теми з номером: `1) Змінні` (`map` передає другим аргументом індекс).",
        addExports: ["numbered"],
        testCases: [
          vars("Дві теми", { minutesList: [30], topics: ["Змінні", "Умови"] }, { numbered: ["1) Змінні", "2) Умови"] }),
          vars("Порожньо", { minutesList: [], topics: [] }, { numbered: [] }),
        ],
        append: "const numbered = topics.map((topic, index) => `${index + 1}) ${topic}`);",
      },
    },
    35: {
      question: "Чому `filter` повертає новий масив, а не змінює `durations`? Що він поверне, якщо жоден елемент не підходить?",
      variation: {
        prompt: "Додай `tooLong` — тривалості понад 45 хв, і `fittingCount` — скільки тривалостей підходить (30–45).",
        addExports: ["tooLong", "fittingCount"],
        testCases: [
          vars("[20, 30, 45, 46, 60]", { durations: [20, 30, 45, 46, 60] }, { fitting: [30, 45], tooLong: [46, 60], fittingCount: 2 }),
          vars("Порожньо", { durations: [] }, { fitting: [], tooLong: [], fittingCount: 0 }),
        ],
        append: "const tooLong = durations.filter((minutes) => minutes > 45);\nconst fittingCount = fitting.length;",
      },
    },
    36: {
      question: "Навіщо другий аргумент `0` у `reduce`? Що станеться з порожнім масивом без нього?",
      variation: {
        prompt: "Додай `averageMinutes` — середню тривалість. Для порожнього списку — `0`, а не `NaN`.",
        addExports: ["averageMinutes"],
        testCases: [
          vars("[10, 20, 30] → 20", { durations: [10, 20, 30] }, { averageMinutes: 20 }),
          vars("[] → 0", { durations: [] }, { averageMinutes: 0 }),
        ],
        append: "const averageMinutes = durations.length > 0 ? totalMinutes / durations.length : 0;",
      },
    },
    37: {
      question: "Що повертають `some` і `every` для порожнього масиву і чому саме так?",
      variation: {
        prompt: "Додай `firstShortIndex` — **позицію** першого короткого заняття (метод `findIndex`), або `-1`, якщо коротких немає.",
        addExports: ["firstShortIndex"],
        testCases: [
          vars("[30, 90, 10, 75] → 2", { durations: [30, 90, 10, 75] }, { firstShortIndex: 2 }),
          vars("[20, 130] → -1", { durations: [20, 130] }, { firstShortIndex: -1 }),
        ],
        append: "const firstShortIndex = durations.findIndex(isShort);",
      },
    },
    38: {
      question: "Чому після `.reduce(...)`, що повернув число, далі не можна написати `.map(...)`? Що отримує кожен крок ланцюжка?",
      variation: {
        prompt: "Поріг «довгого» заняття тепер 45 хв замість 30 — в обох варіантах.",
        testCases: [
          vars("[20, 30, 60, 90] → 2.5 год", { durations: [20, 30, 60, 90] }, { totalHours: 2.5, totalHoursChain: 2.5 }),
          vars("[30, 45] → 0.75 год", { durations: [30, 45] }, { totalHours: 0.75, totalHoursChain: 0.75 }),
        ],
        patch: [["m >= 30", "m >= 45"]],
      },
    },

    /* ───────── Арка V — об'єкти ───────── */
    39: {
      question: "Чому `task === twin` дає `false`, хоча поля однакові? Що насправді порівнює `===` для об'єктів?",
      variation: {
        prompt: "Створи `copyRef = task` (без нового об'єкта) і збережи в `sameAsCopy` результат `copyRef === task`.",
        addExports: ["sameAsCopy"],
        testCases: [{ name: "Те саме посилання", check: jsqVars({ sameAsCopy: true, sameContent: false }) }],
        append: "const copyRef = task;\nconst sameAsCopy = copyRef === task;",
      },
    },
    40: {
      question: "Чому зміна через `alias` видна в `task`? І чому `const task` не заважає змінювати його поля?",
      variation: {
        prompt: "Через `alias` поверни `done` у `false`, а через `task` додай поле `priority` — `\"low\"`.",
        testCases: [
          { name: "Стан завдання", check: jsqVars({ task: { id: 1, title: "Повторити функції", minutes: 45, done: false, priority: "low" } }) },
          { name: "alias і task — той самий об'єкт", check(ctx) { const same = ctx.get("alias") === ctx.get("task"); return { pass: same, actual: String(same), expected: "true" }; } },
        ],
        append: "alias.done = false;\ntask.priority = \"low\";",
      },
    },
    41: {
      question: "Чому в методі, записаному стрілкою, `this` не вказує на об'єкт?",
      variation: {
        prompt: "Додай у `task1` метод `addMinutes(extra)`: він збільшує `this.minutes` на `extra` і повертає нове значення.",
        testCases: [
          { name: "addMinutes(15) → 45", check(ctx) { const t = ctx.get("task1"); const r = typeof t.addMinutes === "function" ? t.addMinutes(15) : "немає методу"; const s = t.getSummary(); return { pass: r === 45 && s === "Повторити функції — 45 хв", actual: ctx.show([r, s]), expected: "[45, \"Повторити функції — 45 хв\"]" }; } },
        ],
        patch: [["    return `${this.title} — ${this.minutes} хв`;\n  },\n};\n\nconst task2", "    return `${this.title} — ${this.minutes} хв`;\n  },\n  addMinutes(extra) {\n    this.minutes = this.minutes + extra;\n    return this.minutes;\n  },\n};\n\nconst task2"]],
      },
    },
    42: {
      question: "Чому в `for...in` значення читають як `settings[key]`, а не `settings.key`?",
      variation: {
        prompt: "Додай `entriesCount` — кількість властивостей `settings`, і `numericKeys` — лише ключі з числовими значеннями (перевір через `typeof`).",
        addExports: ["entriesCount", "numericKeys"],
        testCases: [{ name: "Кількість і числові ключі", check: jsqVars({ entriesCount: 3, numericKeys: ["dailyGoal"] }) }],
        append: "const entriesCount = Object.keys(settings).length;\nconst numericKeys = Object.keys(settings).filter((key) => typeof settings[key] === \"number\");",
      },
    },
    43: {
      question: "Чим `\"toString\" in task` відрізняється від `Object.hasOwn(task, \"toString\")`? Чому тут потрібна саме власна властивість?",
      variation: {
        prompt: "Значення `null` і `undefined` тепер описуй окремо: `\"є, але порожнє\"`. Інші falsy (`false`, `0`, `\"\"`) — як і раніше `\"є, але falsy\"`.",
        testCases: [
          { input: [{ title: "Масиви" }, "priority"], expectedOutput: "немає" },
          { input: [{ title: "Масиви", note: undefined }, "note"], expectedOutput: "є, але порожнє" },
          { input: [{ title: "Масиви", avatar: null }, "avatar"], expectedOutput: "є, але порожнє" },
          { input: [{ title: "Масиви", done: false }, "done"], expectedOutput: "є, але falsy" },
          { input: [{ title: "Масиви", minutes: 0 }, "minutes"], expectedOutput: "є, але falsy" },
          { input: [{ title: "Масиви" }, "title"], expectedOutput: "є" },
        ],
        patch: [["  if (!task[key]) return", "  if (task[key] === null || task[key] === undefined) return \"є, але порожнє\";\n  if (!task[key]) return"]],
      },
    },
    44: {
      question: "Коли спрацьовує стандартне значення в деструктуризації: для `undefined` чи для будь-якого falsy? Що буде з `minutes: 0`?",
      variation: {
        prompt: "Додай у деструктуризацію `done` зі стандартним `false`, а з `pair` — третій елемент `third` зі стандартним `\"—\"`.",
        addExports: ["done", "third"],
        codeChecks: [
          { re: /done\s*=\s*false/, label: "Стандарт `done = false` у деструктуризації" },
          { re: /\[\s*first\s*,\s*second\s*,\s*third\s*=/, label: "Третій елемент зі стандартним значенням" },
        ],
        testCases: [
          vars("Без done і третього елемента", { task: { title: "DOM", minutes: 45 }, pair: ["a", "b"] }, { done: false, third: "—" }),
          vars("Є done і третій елемент", { task: { title: "Події", done: true }, pair: [1, 2, 3] }, { done: true, third: 3, minutes: 30 }),
        ],
        patch: [
          ["const { title: taskTitle, minutes = 30 } = task;", "const { title: taskTitle, minutes = 30, done = false } = task;"],
          ["const [first, second] = pair;", "const [first, second, third = \"—\"] = pair;"],
        ],
      },
    },
    45: {
      question: "Чому зміна `tagsCopy.tags` змінила і `withTags.tags`? Як скопіювати так, щоб масив тегів став окремим?",
      variation: {
        prompt: "Додай `renamedTask` — копію `task` з назвою `\"Spread\"` і `minutes: 20`. Сам `task` не змінюй.",
        addExports: ["renamedTask"],
        testCases: [
          vars("Копія з двома змінами", { task: { id: 1, title: "Масиви", minutes: 30, done: false }, tasks: [], newTask: { id: 2, title: "DOM", minutes: 45, done: false } },
            { renamedTask: { id: 1, title: "Spread", minutes: 20, done: false }, doneTask: { id: 1, title: "Масиви", minutes: 30, done: true } }),
        ],
        append: "const renamedTask = { ...task, title: \"Spread\", minutes: 20 };",
      },
    },

    /* ───────── Арка VI — поширені пастки ───────── */
    46: {
      question: "Чому `\"2\" === 2` — `false`? Чим свідоме `Number(id)` краще за `==`?",
      variation: {
        prompt: "Тепер функція `findTitleById(tasks, id)` повертає не об'єкт, а назву завдання, або `\"Не знайдено\"`. `id` так само буває числом або рядком.",
        functionName: "findTitleById",
        testCases: [
          { input: [[{ id: 1, title: "Масиви" }, { id: 2, title: "DOM" }], "2"], expectedOutput: "DOM" },
          { input: [[{ id: 1, title: "Масиви" }, { id: 2, title: "DOM" }], 1], expectedOutput: "Масиви" },
          { input: [[{ id: 1, title: "Масиви" }, { id: 2, title: "DOM" }], "7"], expectedOutput: "Не знайдено" },
        ],
        solution: "function findTitleById(tasks, id) {\n  const wantedId = Number(id);\n  const task = tasks.find((item) => item.id === wantedId);\n  return task ? task.title : \"Не знайдено\";\n}",
      },
    },
    47: {
      question: "Чому `1 + 2 + \"3\"` дає `\"33\"`, а `\"1\" + 2 + 3` — `\"123\"`? У якому порядку обчислюється вираз?",
      variation: {
        type: "predict",
        prompt: "Ще чотири вирази. Розклади кожен покроково й запиши результат.",
        code: "console.log(\"5\" * \"2\");\nconsole.log(\"5\" + 2 * 2);\nconsole.log(true + 1);\nconsole.log(\"3\" - \"1\" + \"1\");",
        expectedAnswer: ["10", "54", "2", "21"],
      },
    },
    48: {
      question: "Чому `Boolean(\"false\")` дає `true`? Чому прапорець з тексту треба порівнювати з рядком, а не перетворювати на boolean?",
      variation: {
        prompt: "З форми прапорці приходять у різному регістрі й з пробілами: `\" TRUE \"` → `true`, `\"False\"` → `false`. Решта — як і раніше `null`.",
        testCases: [
          { input: [" TRUE "], expectedOutput: true },
          { input: ["False"], expectedOutput: false },
          { input: ["yes"], expectedOutput: null },
          { input: [""], expectedOutput: null },
          { input: ["0"], expectedOutput: null },
        ],
        solution: "function parseFlag(value) {\n  const normalized = value.trim().toLowerCase();\n  if (normalized === \"true\") return true;\n  if (normalized === \"false\") return false;\n  return null;\n}",
      },
    },
    49: {
      question: "Чим `const result = double;` відрізняється від `const result = double(5);`?",
      variation: {
        prompt: "Додай функцію `quadruple(n)`, яка використовує `double`, і `bigResult` — результат виклику `quadruple(5)`.",
        addExports: ["quadruple", "bigResult"],
        codeChecks: [{ re: /double\(/, label: "`quadruple` використовує `double`" }],
        testCases: [
          { fn: "quadruple", input: [3], expectedOutput: 12 },
          { name: "bigResult — 20", check: jsqVars({ bigResult: 20 }) },
        ],
        append: "function quadruple(n) {\n  return double(double(n));\n}\n\nconst bigResult = quadruple(5);",
      },
    },
    50: {
      question: "Що робить цикл безкінечним? Як переконатися, що умова колись стане хибною?",
      variation: {
        prompt: "Додай ще один цикл `while`: `evenTotal` — сума парних чисел від 2 до 10 (має вийти 30).",
        addExports: ["evenTotal"],
        testCases: [{ name: "Сума парних", check: jsqVars({ evenTotal: 30, total: 15 }) }],
        append: "let n = 2;\nlet evenTotal = 0;\nwhile (n <= 10) {\n  evenTotal = evenTotal + n;\n  n = n + 2;\n}",
      },
    },
    51: {
      question: "Чим `total =+ x` відрізняється від `total += x`? Чому перше не дає синтаксичної помилки?",
      variation: {
        prompt: "Тепер функція `sumDoneMinutes(tasks)` рахує хвилини лише **виконаних** завдань (`{ minutes, done }`).",
        functionName: "sumDoneMinutes",
        testCases: [
          { input: [[{ minutes: 10, done: true }, { minutes: 20, done: false }, { minutes: 30, done: true }]], expectedOutput: 40 },
          { input: [[{ minutes: 15, done: false }]], expectedOutput: 0 },
          { input: [[]], expectedOutput: 0 },
        ],
        solution: "function sumDoneMinutes(tasks) {\n  let total = 0;\n  for (let i = 0; i < tasks.length; i++) {\n    if (tasks[i].done) total += tasks[i].minutes;\n  }\n  return total;\n}",
      },
    },
    52: {
      question: "Чому `sort()` без функції порівнює числа як рядки? Що поверне `a - b` і як `sort` це використовує?",
      variation: {
        prompt: "Додай `sortByTitle(tasks)` — копію, відсортовану за назвою (`a.title.localeCompare(b.title)`). Джерело не змінюй.",
        addExports: ["sortByTitle"],
        testCases: [
          { name: "Порядок за назвою, джерело не змінилось", check(ctx) { const src = [{ title: "Умови", minutes: 5 }, { title: "Масиви", minutes: 30 }, { title: "Події", minutes: 100 }]; const out = ctx.get("sortByTitle")(src).map((t) => t.title); const before = src.map((t) => t.title); return { pass: ctx.equal(out, ["Масиви", "Події", "Умови"]) && ctx.equal(before, ["Умови", "Масиви", "Події"]), actual: ctx.show([out, before]), expected: "[[\"Масиви\", \"Події\", \"Умови\"], [\"Умови\", \"Масиви\", \"Події\"]]" }; } },
        ],
        append: "function sortByTitle(tasks) {\n  return tasks.slice().sort((a, b) => a.title.localeCompare(b.title));\n}",
      },
    },

    /* ───────── Арка VII — DOM ───────── */
    53: {
      question: "Що повертає `querySelector`, якщо нічого не знайдено? Чому тоді `missing.textContent` впаде з помилкою?",
      variation: {
        prompt: "Знайди ще список `#task-list` → `taskList` і форму через селектор нащадка `.tracker form` → `trackerForm`.",
        addExports: ["taskList", "trackerForm"],
        codeChecks: [{ re: /querySelector\(\s*["']\.tracker form["']\s*\)/, label: "Форму знайдено селектором `.tracker form`" }],
        testCases: [
          { name: "Список і форма", check(ctx) { const a = ctx.get("taskList") === ctx.$("#task-list"); const b = ctx.get("trackerForm") === ctx.$("#task-form"); return { pass: a && b, actual: ctx.show([a, b]), expected: "[true, true]" }; } },
        ],
        append: "const taskList = document.querySelector(\"#task-list\");\nconst trackerForm = document.querySelector(\".tracker form\");",
      },
    },
    54: {
      question: "Що повертає `querySelectorAll`, якщо нічого не знайдено? Чим цей результат відрізняється від справжнього масиву?",
      variation: {
        prompt: "Виводь назви з номером: `1. Повторити функції`, `2. Масиви`, …",
        testCases: [{ name: "Три картки з номерами", check: jsqLogs(["1. Повторити функції", "2. Масиви", "3. Об'єкти"]) }],
        patch: [
          ["cards.forEach((card) => {", "cards.forEach((card, index) => {"],
          ["console.log(card.querySelector(\".task-title\").textContent);", "console.log(`${index + 1}. ${card.querySelector(\".task-title\").textContent}`);"],
        ],
      },
    },
    55: {
      question: "Чому `textContent` безпечний для даних користувача? Що побачив користувач у `#note` і чому?",
      variation: {
        prompt: "У `#summary` додай залишок: `Виконано: X з Y, лишилось Z`.",
        testCases: [
          { name: "1 з 3", inputs: { tasks: [{ done: true }, { done: false }, { done: false }] }, check: (ctx) => textIs(ctx, "#summary", "Виконано: 1 з 3, лишилось 2") },
          { name: "Порожній список", inputs: { tasks: [] }, check: (ctx) => textIs(ctx, "#summary", "Виконано: 0 з 0, лишилось 0") },
        ],
        patch: [["`Виконано: ${doneCount} з ${tasks.length}`", "`Виконано: ${doneCount} з ${tasks.length}, лишилось ${tasks.length - doneCount}`"]],
      },
    },
    56: {
      question: "Чому дані, які ввів користувач, не можна вставляти через `innerHTML`? Що може статися?",
      variation: {
        prompt: "Користувач ввів назву `userTitle = \"<b>Масиви</b>\"`. Покажи її в `#user-title` безпечно — теги мають лишитися текстом.",
        html: "<p id=\"as-text\"></p>\n<p id=\"as-html\"></p>\n<p id=\"user-title\"></p>",
        testCases: [
          { name: "Назва користувача — як текст", check(ctx) { const el = ctx.$("#user-title"); const t = el.textContent; const tags = el.querySelector("b"); return { pass: t === "<b>Масиви</b>" && !tags, actual: ctx.show(t) + (tags ? ", з'явився тег <b>" : ""), expected: "\"<b>Масиви</b>\" як текст" }; } },
        ],
        append: "const userTitle = \"<b>Масиви</b>\";\ndocument.querySelector(\"#user-title\").textContent = userTitle;",
      },
    },
    57: {
      question: "Чому в JavaScript пишуть `style.backgroundColor`, а не `style.background-color`? Коли краще міняти клас, а не стиль?",
      variation: {
        prompt: "Додай третій стан: якщо `goalReached` — `null` (дані ще не завантажено), колір `\"gray\"` і шрифт `\"16px\"`.",
        testCases: [
          { name: "null → сірий", inputs: { goalReached: null }, check(ctx) { const s = ctx.$("#progress-msg").style; return { pass: s.color === "gray" && s.fontSize === "16px", actual: ctx.show([s.color, s.fontSize]), expected: "[\"gray\", \"16px\"]" }; } },
          { name: "true → seagreen", inputs: { goalReached: true }, check(ctx) { const s = ctx.$("#progress-msg").style; return { pass: s.color === "seagreen" && s.fontSize === "20px", actual: ctx.show([s.color, s.fontSize]), expected: "[\"seagreen\", \"20px\"]" }; } },
          { name: "false → firebrick", inputs: { goalReached: false }, check(ctx) { const s = ctx.$("#progress-msg").style; return { pass: s.color === "firebrick", actual: ctx.show(s.color), expected: "\"firebrick\"" }; } },
        ],
        patch: [["} else {\n  message.style.color = \"firebrick\";", "} else if (goalReached === null) {\n  message.style.color = \"gray\";\n  message.style.fontSize = \"16px\";\n} else {\n  message.style.color = \"firebrick\";"]],
      },
    },
    58: {
      question: "Чому `classList.add` краще за `className = \"is-done\"`? Що станеться з класом `task-card` у другому випадку?",
      variation: {
        prompt: "Додай третій параметр `isUrgent`: клас `is-urgent` додається або прибирається так само, як `is-done`.",
        testCases: [
          { name: "Термінове, не виконане", check(ctx) { const card = ctx.$(".task-card"); ctx.fn(card, false, true); return { pass: card.className === "task-card is-urgent", actual: ctx.show(card.className), expected: "\"task-card is-urgent\"" }; } },
          { name: "Виконане, вже не термінове", check(ctx) { const card = ctx.$(".task-card"); ctx.fn(card, false, true); ctx.fn(card, true, false); return { pass: card.className === "task-card is-done", actual: ctx.show(card.className), expected: "\"task-card is-done\"" }; } },
        ],
        patch: [
          ["function syncCard(card, done) {", "function syncCard(card, done, isUrgent) {"],
          ["    card.classList.remove(\"is-done\");\n  }\n}", "    card.classList.remove(\"is-done\");\n  }\n  if (isUrgent) {\n    card.classList.add(\"is-urgent\");\n  } else {\n    card.classList.remove(\"is-urgent\");\n  }\n}"],
        ],
      },
    },
    59: {
      question: "Що робить другий аргумент у `toggle(\"is-done\", task.done)`? Чому він надійніший за простий `toggle`?",
      variation: {
        prompt: "`togglePanel()` тепер ще й повертає новий стан: `true`, якщо панель відкрита, і `false`, якщо закрита.",
        testCases: [
          { name: "Відкрито → true, закрито → false", check(ctx) { const a = ctx.get("togglePanel")(); const b = ctx.get("togglePanel")(); return { pass: a === true && b === false && !ctx.$("#panel").classList.contains("is-open"), actual: ctx.show([a, b]), expected: "[true, false]" }; } },
        ],
        patch: [["  document.querySelector(\"#panel\").classList.toggle(\"is-open\");", "  return document.querySelector(\"#panel\").classList.toggle(\"is-open\");"]],
      },
    },
    60: {
      question: "Чому `disabled=\"false\"` все одно вимикає кнопку? Як тоді її правильно ввімкнути?",
      variation: {
        prompt: "Додай функцію `setCardId(card, id)`: записує `data-id` через `setAttribute` і повертає значення, прочитане через `getAttribute`.",
        addExports: ["setCardId"],
        testCases: [
          { name: "Атрибут завжди рядок", check(ctx) { const card = ctx.$(".task-card"); const v = ctx.get("setCardId")(card, 12); return { pass: v === "12" && card.dataset.id === "12", actual: ctx.show(v), expected: "\"12\" (рядок)" }; } },
        ],
        append: "function setCardId(card, id) {\n  card.setAttribute(\"data-id\", id);\n  return card.getAttribute(\"data-id\");\n}",
      },
    },
    61: {
      question: "Чому стан тримають в об'єкті `task`, а не читають з тексту кнопки?",
      variation: {
        prompt: "Показуй стан ще й у `#status`: `Стан: виконано` або `Стан: не виконано`.",
        html: "<li class=\"task-card\" data-id=\"1\">\n  <span class=\"task-title\">Повторити функції</span>\n  <button class=\"done-btn\" type=\"button\">Виконано</button>\n</li>\n<p id=\"status\">Стан: не виконано</p>",
        testCases: [
          { name: "Один клік → виконано", check(ctx) { ctx.fire(ctx.$(".done-btn"), "click"); return textIs(ctx, "#status", "Стан: виконано"); } },
          { name: "Два кліки → не виконано", check(ctx) { ctx.fire(ctx.$(".done-btn"), "click"); ctx.fire(ctx.$(".done-btn"), "click"); return textIs(ctx, "#status", "Стан: не виконано"); } },
        ],
        patch: [["  card.classList.toggle(\"is-done\", task.done);\n", "  card.classList.toggle(\"is-done\", task.done);\n  document.querySelector(\"#status\").textContent = task.done ? \"Стан: виконано\" : \"Стан: не виконано\";\n"]],
      },
    },

    /* ───────── Арка VIII — події ───────── */
    62: {
      question: "Чому обробник передають без дужок: `addEventListener(\"click\", handler)`, а не `handler()`?",
      variation: {
        prompt: "Після 5 кліків кнопка вимикається, а текст стає `Кліків: 5 (досить!)`.",
        testCases: [
          { name: "5 кліків → досить", check(ctx) { for (let i = 0; i < 5; i++) ctx.fire(ctx.$("#count-btn"), "click"); const t = jsqText(ctx, "#click-count"); const off = ctx.$("#count-btn").disabled; return { pass: t === "Кліків: 5 (досить!)" && off, actual: ctx.show(t) + (off ? ", вимкнено" : ", активна"), expected: "\"Кліків: 5 (досить!)\", вимкнено" }; } },
          { name: "3 кліки → як раніше", check(ctx) { for (let i = 0; i < 3; i++) ctx.fire(ctx.$("#count-btn"), "click"); const t = jsqText(ctx, "#click-count"); return { pass: t === "Кліків: 3" && !ctx.$("#count-btn").disabled, actual: ctx.show(t), expected: "\"Кліків: 3\", кнопка активна" }; } },
        ],
        patch: [["  output.textContent = `Кліків: ${clicks}`;\n", "  output.textContent = `Кліків: ${clicks}`;\n  if (clicks === 5) {\n    output.textContent = \"Кліків: 5 (досить!)\";\n    button.disabled = true;\n  }\n"]],
      },
    },
    63: {
      question: "Чим подія `input` відрізняється від `change`? Коли спрацює кожна з них?",
      variation: {
        prompt: "Назва довша за 30 символів — задовга: у `#char-count` пиши `Символів: N — задовго`.",
        testCases: [
          { name: "31 символ", check(ctx) { const i = ctx.$("#task-title"); i.value = "x".repeat(31); ctx.fire(i, "input"); return textIs(ctx, "#char-count", "Символів: 31 — задовго"); } },
          { name: "«Масиви» — як раніше", check(ctx) { const i = ctx.$("#task-title"); i.value = "Масиви"; ctx.fire(i, "input"); return textIs(ctx, "#char-count", "Символів: 6"); } },
        ],
        patch: [["  charCount.textContent = `Символів: ${title.length}`;", "  charCount.textContent = title.length > 30 ? `Символів: ${title.length} — задовго` : `Символів: ${title.length}`;"]],
      },
    },
    64: {
      question: "Чому слухають `submit` форми, а не `click` кнопки? Що станеться, якщо натиснути Enter у полі?",
      variation: {
        prompt: "Назву показуй без пробілів на краях: для `\"  Масиви \"` — `Додано: Масиви (30 хв)`.",
        testCases: [
          { name: "Пробіли на краях прибрано", check(ctx) { ctx.$("#task-title").value = "  Масиви "; ctx.$("#task-minutes").value = "30"; ctx.fire(ctx.$("#task-form"), "submit"); return textIs(ctx, "#summary", "Додано: Масиви (30 хв)"); } },
        ],
        patch: [["document.querySelector(\"#task-title\").value;", "document.querySelector(\"#task-title\").value.trim();"]],
      },
    },
    65: {
      question: "Коли `event.target` і `event.currentTarget` — різні елементи? Котрий з них використати, щоб завжди отримати саму кнопку?",
      variation: {
        prompt: "У `#click-info` додай третю частину: `той самий`, якщо елементи збігаються, і `різні`, якщо ні. Наприклад, `SPAN / BUTTON / різні`.",
        testCases: [
          { name: "Клік по іконці", check(ctx) { ctx.fire(ctx.$("#add-btn .icon"), "click"); return textIs(ctx, "#click-info", "SPAN / BUTTON / різні"); } },
          { name: "Клік по кнопці", check(ctx) { ctx.fire(ctx.$("#add-btn"), "click"); return textIs(ctx, "#click-info", "BUTTON / BUTTON / той самий"); } },
        ],
        patch: [["`${event.target.tagName} / ${event.currentTarget.tagName}`", "`${event.target.tagName} / ${event.currentTarget.tagName} / ${event.target === event.currentTarget ? \"той самий\" : \"різні\"}`"]],
      },
    },
    66: {
      question: "Що станеться без `preventDefault()` у формі? Чому дані «зникають»?",
      variation: {
        prompt: "Порожню назву (зокрема з самих пробілів) не приймай: покажи `Введи назву`. Стандартну дію скасовуй завжди.",
        testCases: [
          { name: "Порожня назва", check(ctx) { ctx.$("#task-title").value = "   "; const e = ctx.fire(ctx.$("#task-form"), "submit"); const t = jsqText(ctx, "#summary"); return { pass: t === "Введи назву" && e.defaultPrevented, actual: ctx.show(t), expected: "\"Введи назву\", без перезавантаження" }; } },
          { name: "Звичайна назва", check(ctx) { ctx.$("#task-title").value = "Масиви"; ctx.fire(ctx.$("#task-form"), "submit"); return textIs(ctx, "#summary", "Додано: Масиви"); } },
        ],
        patch: [
          ["const title = document.querySelector(\"#task-title\").value;", "const title = document.querySelector(\"#task-title\").value.trim();"],
          ["textContent = `Додано: ${title}`;", "textContent = title ? `Додано: ${title}` : \"Введи назву\";"],
        ],
      },
    },
    67: {
      question: "Навіщо делегування, якщо можна повісити обробник на кожну кнопку? Що буде з картками, доданими пізніше?",
      variation: {
        prompt: "Клік по кнопці тепер **перемикає** виконання: повторний клік скасовує `done` і прибирає клас `is-done`.",
        testCases: [
          { name: "Два кліки по другій кнопці → знову не виконано", check(ctx) { const b = ctx.$('.done-btn[data-id="2"]'); ctx.fire(b, "click"); ctx.fire(b, "click"); const t = ctx.get("tasks")[1].done; const c = ctx.$('.task-card[data-id="2"]').classList.contains("is-done"); return { pass: t === false && !c, actual: ctx.show([t, c]), expected: "[false, false]" }; } },
          { name: "Один клік → виконано", check(ctx) { ctx.fire(ctx.$('.done-btn[data-id="3"] .icon'), "click"); const t = ctx.get("tasks")[2].done; const c = ctx.$('.task-card[data-id="3"]').classList.contains("is-done"); return { pass: t === true && c, actual: ctx.show([t, c]), expected: "[true, true]" }; } },
        ],
        patch: [["  task.done = true;\n  button.closest(\".task-card\").classList.add(\"is-done\");", "  task.done = !task.done;\n  button.closest(\".task-card\").classList.toggle(\"is-done\", task.done);"]],
      },
    },
    68: {
      question: "Навіщо `Number(minutesInput.value)`, якщо поле має `type=\"number\"`? Що лежить у `.value` насправді?",
      variation: {
        prompt: "Назву зберігай без пробілів на краях, а порожню назву не приймай — тоді нічого не додається.",
        testCases: [
          { name: "Пробіли на краях", check(ctx) { ctx.$("#task-title").value = "  Масиви "; ctx.$("#task-minutes").value = "30"; ctx.fire(ctx.$("#task-form"), "submit"); const t = ctx.get("tasks"); const exp = [{ id: 1, title: "Масиви", minutes: 30, done: false }]; return { pass: ctx.equal(t, exp), actual: ctx.show(t), expected: ctx.show(exp) }; } },
          { name: "Самі пробіли → нічого", check(ctx) { ctx.$("#task-title").value = "   "; ctx.$("#task-minutes").value = "10"; ctx.fire(ctx.$("#task-form"), "submit"); const n = ctx.get("tasks").length; return { pass: n === 0 && jsqText(ctx, "#summary") === "Завдань: 0", actual: n + " записів", expected: "0 записів" }; } },
        ],
        patch: [
          ["  event.preventDefault();\n", "  event.preventDefault();\n  if (!titleInput.value.trim()) return;\n"],
          ["title: titleInput.value,", "title: titleInput.value.trim(),"],
        ],
      },
    },

    /* ───────── Арка IX — динамічний DOM ───────── */
    69: {
      question: "Чому створений елемент не видно на сторінці, доки його не вставили? Де він «живе» до того?",
      variation: {
        prompt: "Виконане завдання (`task.done`) отримує ще й клас `is-done`.",
        testCases: [
          { name: "done: true → task-card is-done", check(ctx) { const el = ctx.fn({ id: 2, title: "DOM", done: true }); return { pass: el.className === "task-card is-done", actual: ctx.show(el.className), expected: "\"task-card is-done\"" }; } },
          { name: "done: false → task-card", check(ctx) { const el = ctx.fn({ id: 3, title: "Події", done: false }); return { pass: el.className === "task-card", actual: ctx.show(el.className), expected: "\"task-card\"" }; } },
        ],
        patch: [["  return card;", "  card.classList.toggle(\"is-done\", task.done);\n  return card;"]],
      },
    },
    70: {
      question: "Що станеться, якщо той самий вузол вставити двічі через `appendChild`? Скільки карток буде на сторінці?",
      variation: {
        prompt: "Нові картки вставляй на **початок** списку (метод `prepend`), щоб свіжі завдання були зверху.",
        testCases: [
          { name: "Свіжа картка зверху", check(ctx) { ctx.fn({ id: 1, title: "Масиви" }); ctx.fn({ id: 2, title: "DOM" }); const ids = ctx.$$(".task-card").map((c) => c.dataset.id); return { pass: ctx.equal(ids, ["2", "1"]), actual: ctx.show(ids), expected: "[\"2\", \"1\"]" }; } },
        ],
        patch: [["document.querySelector(\"#task-list\").appendChild(card);", "document.querySelector(\"#task-list\").prepend(card);"]],
      },
    },
    71: {
      question: "Чому видаляти треба і з масиву, і зі сторінки? Що буде, якщо забути одне з двох?",
      variation: {
        prompt: "Коли видалено останнє завдання, `#summary` пише `Список порожній` замість `Завдань: 0`.",
        testCases: [
          { name: "Видалено всі", check(ctx) { ["1", "2", "3"].forEach((id) => ctx.fire(ctx.$('.delete-btn[data-id="' + id + '"]'), "click")); return textIs(ctx, "#summary", "Список порожній"); } },
          { name: "Видалено одне", check(ctx) { ctx.fire(ctx.$('.delete-btn[data-id="2"]'), "click"); return textIs(ctx, "#summary", "Завдань: 2"); } },
        ],
        patch: [["textContent = `Завдань: ${tasks.length}`;", "textContent = tasks.length ? `Завдань: ${tasks.length}` : \"Список порожній\";"]],
      },
    },
    72: {
      question: "Навіщо очищати `#task-list` перед рендером? Що побачить користувач після другого виклику без очищення?",
      variation: {
        prompt: "У `#summary` додай кількість виконаних: `Завдань: N, виконано: D, хвилин: M`.",
        testCases: [
          { name: "Одне з двох виконано", check(ctx) { ctx.fn([{ id: 1, title: "Масиви", minutes: 30, done: true }, { id: 2, title: "DOM", minutes: 15, done: false }]); return textIs(ctx, "#summary", "Завдань: 2, виконано: 1, хвилин: 45"); } },
          { name: "Порожній список", check(ctx) { ctx.fn([]); return textIs(ctx, "#summary", "Завдань: 0, виконано: 0, хвилин: 0"); } },
        ],
        patch: [["`Завдань: ${tasks.length}, хвилин: ${minutes}`", "`Завдань: ${tasks.length}, виконано: ${tasks.filter((task) => task.done).length}, хвилин: ${minutes}`"]],
      },
    },
    73: {
      question: "Чому можна написати `tasks.map(createTaskElement)` без стрілки? Що `map` передає у функцію?",
      variation: {
        prompt: "Картки показуй лише для **невиконаних** завдань, а підсумок рахуй за всіма.",
        testCases: [
          { name: "Виконане сховано, підсумок за всіма", check(ctx) { ctx.fn([{ id: 1, title: "Масиви", minutes: 30, done: true }, { id: 2, title: "DOM", minutes: 15, done: false }]); const cards = ctx.$$(".task-card").map((c) => c.textContent); const s = jsqText(ctx, "#summary"); return { pass: ctx.equal(cards, ["DOM"]) && s === "Завдань: 2, хвилин: 45", actual: ctx.show([cards, s]), expected: "[[\"DOM\"], \"Завдань: 2, хвилин: 45\"]" }; } },
        ],
        patch: [["const cards = tasks.map(createTaskElement);", "const cards = tasks.filter((task) => !task.done).map(createTaskElement);"]],
      },
    },
    74: {
      question: "Навіщо `return` після показу помилки? Що станеться без нього?",
      variation: {
        prompt: "Назва має містити щонайменше 3 символи: коротша → `Назва — щонайменше 3 символи` у `#title-error`, нічого не додається.",
        testCases: [
          { name: "«ab» → помилка", check(ctx) { ctx.$("#task-title").value = "ab"; ctx.fire(ctx.$("#task-form"), "submit"); const e = jsqText(ctx, "#title-error"); const n = ctx.get("tasks").length; return { pass: e === "Назва — щонайменше 3 символи" && n === 0, actual: ctx.show(e) + ", записів " + n, expected: "\"Назва — щонайменше 3 символи\", записів 0" }; } },
          { name: "«DOM» → додано", check(ctx) { ctx.$("#task-title").value = "DOM"; ctx.fire(ctx.$("#task-form"), "submit"); const n = ctx.get("tasks").length; return { pass: n === 1 && jsqText(ctx, "#title-error") === "", actual: n + " записів", expected: "1 запис, помилки немає" }; } },
          { name: "Пробіли → як раніше", check(ctx) { ctx.$("#task-title").value = "   "; ctx.fire(ctx.$("#task-form"), "submit"); return textIs(ctx, "#title-error", "Введи назву завдання"); } },
        ],
        patch: [["  titleError.textContent = \"\";\n  tasks.push", "  if (title.length < 3) {\n    titleError.textContent = \"Назва — щонайменше 3 символи\";\n    return;\n  }\n  titleError.textContent = \"\";\n  tasks.push"]],
      },
    },
    75: {
      question: "Чому порожнє поле тривалості перевіряють до `Number(...)`? Що дає `Number(\"\")`?",
      variation: {
        prompt: "Тривалість має бути цілим числом: `30.5` → `Тривалість — ціле число хвилин`. Решта перевірок не змінюється.",
        testCases: [
          { name: "30.5 → помилка", check(ctx) { ctx.$("#task-title").value = "Масиви"; ctx.$("#task-minutes").value = "30.5"; ctx.fire(ctx.$("#task-form"), "submit"); const e = jsqText(ctx, "#minutes-error"); const n = ctx.get("tasks").length; return { pass: e === "Тривалість — ціле число хвилин" && n === 0, actual: ctx.show(e) + ", записів " + n, expected: "\"Тривалість — ціле число хвилин\", записів 0" }; } },
          { name: "30 → додано", check(ctx) { ctx.$("#task-title").value = "Масиви"; ctx.$("#task-minutes").value = "30"; ctx.fire(ctx.$("#task-form"), "submit"); return { pass: ctx.get("tasks").length === 1, actual: ctx.get("tasks").length + " записів", expected: "1 запис" }; } },
          { name: "0 → межі", check(ctx) { ctx.$("#task-title").value = "Масиви"; ctx.$("#task-minutes").value = "0"; ctx.fire(ctx.$("#task-form"), "submit"); return textIs(ctx, "#minutes-error", "Тривалість — від 1 до 180 хв"); } },
        ],
        patch: [["  } else {\n    minutesError.textContent = \"\";", "  } else if (!Number.isInteger(minutes)) {\n    minutesError.textContent = \"Тривалість — ціле число хвилин\";\n  } else {\n    minutesError.textContent = \"\";"]],
      },
    },

    /* ───────── Арка X — збереження ───────── */
    76: {
      question: "Чому `localStorage` повертає рядок навіть після `setItem(\"dailyGoal\", 40)`? Що поверне `getItem` для ключа, якого немає?",
      variation: {
        prompt: "`getDailyGoal()` має повертати `30` і тоді, коли збережено не число (наприклад, `\"abc\"`).",
        testCases: [
          { name: "«abc» → 30", storage: { dailyGoal: "abc" }, check(ctx) { const v = ctx.get("getDailyGoal")(); return { pass: v === 30, actual: ctx.show(v), expected: "30" }; } },
          { name: "«45» → 45", storage: { dailyGoal: "45" }, check(ctx) { const v = ctx.get("getDailyGoal")(); return { pass: v === 45, actual: ctx.show(v), expected: "45" }; } },
          { name: "Без запису → 30", check(ctx) { const v = ctx.get("getDailyGoal")(); return { pass: v === 30, actual: ctx.show(v), expected: "30" }; } },
        ],
        patch: [["  return saved === null ? 30 : Number(saved);", "  const goal = Number(saved);\n  return saved === null || Number.isNaN(goal) ? 30 : goal;"]],
      },
    },
    77: {
      question: "Чому тут не можна використати `localStorage.clear()`? Що ще зберігає сайт під іншими ключами?",
      variation: {
        prompt: "Кнопка `#reset-all` (вона вже в розмітці) видаляє і `userName`, і `dailyGoal`, оновлює привітання й не чіпає інших ключів (наприклад, `tasks`).",
        html: "<p id=\"greeting\"></p>\n<button id=\"reset-btn\" type=\"button\">Забути ім'я</button>\n<button id=\"reset-all\" type=\"button\">Скинути налаштування</button>",
        testCases: [
          { name: "Скидання налаштувань", storage: { userName: "Оля", dailyGoal: "40", tasks: "[]" }, check(ctx) { ctx.fire(ctx.$("#reset-all"), "click"); const s = ctx.storage; const got = [s.getItem("userName"), s.getItem("dailyGoal"), s.getItem("tasks"), jsqText(ctx, "#greeting")]; const exp = [null, null, "[]", "Привіт, мандрівнику!"]; return { pass: ctx.equal(got, exp), actual: ctx.show(got), expected: ctx.show(exp) }; } },
        ],
        append: "document.querySelector(\"#reset-all\").addEventListener(\"click\", () => {\n  localStorage.removeItem(\"userName\");\n  localStorage.removeItem(\"dailyGoal\");\n  renderGreeting();\n});",
      },
    },
    78: {
      question: "Що втратиться, якщо зберегти через JSON об'єкт з методом або датою?",
      variation: {
        prompt: "Додай `cloneTasks(tasks)` — глибоку копію масиву через JSON: зміни в копії (навіть у вкладених масивах) не зачіпають оригінал.",
        addExports: ["cloneTasks"],
        testCases: [
          { name: "Копія незалежна", check(ctx) { const orig = [{ id: 1, title: "Масиви", tags: ["js"] }]; const copy = ctx.get("cloneTasks")(orig); copy[0].tags.push("dom"); copy[0].title = "Інше"; const ok = copy !== orig && orig[0].tags.length === 1 && orig[0].title === "Масиви"; return { pass: ok, actual: ctx.show(orig), expected: "[{ id: 1, title: \"Масиви\", tags: [\"js\"] }]" }; } },
        ],
        append: "function cloneTasks(tasks) {\n  return restoreTasks(serializeTasks(tasks));\n}",
      },
    },
    79: {
      question: "Чому після кожної зміни треба викликати і `saveTasks()`, і `renderTasks()`? Що бачитиме користувач, якщо забути одне з них?",
      variation: {
        prompt: "Додай `clearDone()` — прибирає всі виконані завдання з масиву, зберігає й перемальовує список.",
        addExports: ["clearDone"],
        testCases: [
          { name: "Виконані прибрано й збережено", check(ctx) { ctx.get("addTask")("Масиви", 30); ctx.get("addTask")("DOM", 45); ctx.get("addTask")("Події", 20); ctx.get("toggleTask")(1); ctx.get("toggleTask")(3); ctx.get("clearDone")(); const now = ctx.$$(".task-card").map((c) => c.textContent); ctx.reload(); const saved = ctx.$$(".task-card").map((c) => c.textContent); const got = [now, saved]; const exp = [["DOM"], ["DOM"]]; return { pass: ctx.equal(got, exp), actual: ctx.show(got), expected: ctx.show(exp) }; } },
        ],
        patch: [["  renderTasks();\n}\n\nrenderTasks();", "  renderTasks();\n}\n\nfunction clearDone() {\n  const pending = tasks.filter((task) => !task.done);\n  tasks.length = 0;\n  tasks.push(...pending);\n  saveTasks();\n  renderTasks();\n}\n\nrenderTasks();"]],
      },
    },

    /* ───────── Арки XI–XII — асинхронність ───────── */
    80: {
      question: "Навіщо `clearTimeout` перед новим `setTimeout`? Що побачить користувач без нього?",
      variation: {
        prompt: "Повідомлення про помилку (`showMessage(text, true)`) отримує клас `is-error`; звичайне — без нього.",
        testCases: [
          { name: "Помилка → is-error, потім звичайне → без класу", check(ctx) { ctx.fn("Збій", true); const a = ctx.$("#toast").classList.contains("is-error"); ctx.fn("Збережено"); const b = ctx.$("#toast").classList.contains("is-error"); return { pass: a && !b, actual: ctx.show([a, b]), expected: "[true, false]" }; } },
        ],
        patch: [
          ["function showMessage(text) {", "function showMessage(text, isError = false) {"],
          ["  toast.textContent = text;\n", "  toast.textContent = text;\n  toast.classList.toggle(\"is-error\", isError);\n"],
        ],
      },
    },
    81: {
      question: "Чому повторний `startTimer()` без перевірки `intervalId` прискорює лічильник?",
      variation: {
        prompt: "Ліміт тепер 3, а після зупинки на ліміті в `#seconds` показується `3 — готово`.",
        testCases: [
          { name: "Зупинка на 3 з позначкою", async check(ctx) { ctx.get("startTimer")(); for (let i = 0; i < 40 && jsqText(ctx, "#seconds") !== "3 — готово"; i++) await ctx.sleep(25); await ctx.sleep(120); return textIs(ctx, "#seconds", "3 — готово"); } },
        ],
        patch: [
          ["const LIMIT = 5;", "const LIMIT = 3;"],
          ["    if (seconds >= LIMIT) stopTimer();", "    if (seconds >= LIMIT) {\n      stopTimer();\n      document.querySelector(\"#seconds\").textContent = `${seconds} — готово`;\n    }"],
        ],
      },
    },
    82: {
      question: "Чому після `processLater(...)` наступний рядок коду виконується раніше за колбек, хоча затримка — `0`?",
      variation: {
        prompt: "Додай `processAll(tasks, onDone)`: викликає `onDone` для кожного завдання по черзі (через `processTask`), а наприкінці — `onDone(\"Готово\")`.",
        addExports: ["processAll"],
        testCases: [
          { name: "Два завдання й «Готово»", check(ctx) { const got = []; ctx.get("processAll")([{ title: "Масиви" }, { title: "DOM" }], (m) => got.push(m)); const exp = ["Опрацьовано: Масиви", "Опрацьовано: DOM", "Готово"]; return { pass: ctx.equal(got, exp), actual: ctx.show(got), expected: ctx.show(exp) }; } },
          { name: "Порожній список → лише «Готово»", check(ctx) { const got = []; ctx.get("processAll")([], (m) => got.push(m)); return { pass: ctx.equal(got, ["Готово"]), actual: ctx.show(got), expected: "[\"Готово\"]" }; } },
        ],
        append: "function processAll(tasks, onDone) {\n  tasks.forEach((task) => processTask(task, onDone));\n  onDone(\"Готово\");\n}",
      },
    },
    83: {
      question: "Чому кожен наступний запит доводиться запускати всередині колбека попереднього? Чим це незручно, коли кроків багато?",
      variation: {
        prompt: "У звіт мають потрапити лише довгі завдання — від 40 хв. Відбери їх між завантаженням завдань і складанням звіту.",
        testCases: [
          { name: "Лише довгі", async check(ctx) { ctx.fn(); await ctx.sleep(150); return textIs(ctx, "#report", "Оля: 1 завд., 45 хв"); } },
        ],
        patch: [["(tasks) => buildReport(profile, tasks, showText)", "(tasks) => buildReport(profile, tasks.filter((task) => task.minutes >= 40), showText)"]],
      },
    },
    84: {
      question: "У якому стані проміс одразу після виклику `simulateLoad()`? Коли він стає виконаним або відхиленим?",
      variation: {
        prompt: "Затримку можна передати другим параметром `delay` (за замовчуванням — 30 мс).",
        testCases: [
          { name: "delay = 200 → не раніше", async check(ctx) { let done = false; ctx.fn(false, 200).then(() => { done = true; }); await ctx.sleep(80); const early = done; await ctx.sleep(220); return { pass: !early && done, actual: early ? "виконався зарано" : done ? "виконався вчасно" : "не виконався", expected: "виконався приблизно через 200 мс" }; } },
          { name: "Без delay — як і раніше", async check(ctx) { const v = await ctx.fn(false); return { pass: Array.isArray(v) && v.length === 2, actual: ctx.show(v), expected: "масив із 2 завдань" }; } },
        ],
        patch: [
          ["function simulateLoad(shouldFail) {", "function simulateLoad(shouldFail, delay = 30) {"],
          ["    }, 30);", "    }, delay);"],
        ],
      },
    },
    85: {
      question: "Що отримає наступний `.then`, якщо попередній нічого не повертає?",
      variation: {
        prompt: "Додай у ланцюжок ще один `.then`: результат — рядок назв через кому, `\"Масиви, Події\"`.",
        testCases: [
          { name: "Рядок назв", async check(ctx) { const v = await ctx.fn(); return { pass: v === "Масиви, Події", actual: ctx.show(v), expected: "\"Масиви, Події\"" }; } },
        ],
        patch: [[".then((pending) => pending.map((task) => task.title));", ".then((pending) => pending.map((task) => task.title))\n    .then((titles) => titles.join(\", \"));"]],
      },
    },
    86: {
      question: "Чому `.catch` наприкінці ланцюжка ловить помилку з будь-якого попереднього кроку?",
      variation: {
        prompt: "Після вдалої повторної спроби кнопку `#retry` знову ховай.",
        testCases: [
          { name: "Помилка → повтор → кнопку сховано", async check(ctx) { await ctx.get("load")(true); ctx.fire(ctx.$("#retry"), "click"); await ctx.sleep(80); const s = jsqText(ctx, "#status"); const hidden = ctx.$("#retry").hidden; return { pass: s === "Завантажено: 3" && hidden, actual: ctx.show(s) + (hidden ? ", кнопку сховано" : ", кнопка видима"), expected: "\"Завантажено: 3\", кнопку сховано" }; } },
        ],
        patch: [["      statusText.textContent = `Завантажено: ${tasks.length}`;\n", "      statusText.textContent = `Завантажено: ${tasks.length}`;\n      retryButton.hidden = true;\n"]],
      },
    },
    87: {
      question: "Чому відновлення кнопки кладуть у `.finally`, а не дублюють у `.then` і `.catch`?",
      variation: {
        prompt: "Під час завантаження текст кнопки — `Завантажую…`, а після будь-якого результату — знову `Завантажити`.",
        testCases: [
          { name: "Успіх", async check(ctx) { const p = ctx.get("load")(false); const during = jsqText(ctx, "#load-btn"); await p; const after = jsqText(ctx, "#load-btn"); return { pass: during === "Завантажую…" && after === "Завантажити", actual: ctx.show([during, after]), expected: "[\"Завантажую…\", \"Завантажити\"]" }; } },
          { name: "Помилка", async check(ctx) { const p = ctx.get("load")(true); const during = jsqText(ctx, "#load-btn"); await p; const after = jsqText(ctx, "#load-btn"); return { pass: during === "Завантажую…" && after === "Завантажити", actual: ctx.show([during, after]), expected: "[\"Завантажую…\", \"Завантажити\"]" }; } },
        ],
        patch: [
          ["  button.disabled = true;\n", "  button.disabled = true;\n  button.textContent = \"Завантажую…\";\n"],
          ["      button.disabled = false;\n", "      button.disabled = false;\n      button.textContent = \"Завантажити\";\n"],
        ],
      },
    },
    88: {
      question: "Що насправді повертає async-функція, навіть якщо всередині написано `return масив`?",
      variation: {
        prompt: "Поверни не масив, а об'єкт `{ count, titles }`: `{ count: 2, titles: [\"Масиви\", \"Події\"] }`.",
        testCases: [
          { name: "Об'єкт з кількістю й назвами", async check(ctx) { const v = await ctx.fn(); const exp = { count: 2, titles: ["Масиви", "Події"] }; return { pass: ctx.equal(v, exp), actual: ctx.show(v), expected: ctx.show(exp) }; } },
        ],
        patch: [["  return pending.map((task) => task.title);", "  return { count: pending.length, titles: pending.map((task) => task.title) };"]],
      },
    },
    89: {
      question: "Чому `fetch` не відхиляє проміс для відповіді 404? Коли саме він відхиляється?",
      variation: {
        prompt: "Для 404 повертай зрозумілий текст `404 Не знайдено`; інші помилки — як і раніше `<статус> помилка`.",
        testCases: [
          { name: "404 → Не знайдено", fetch: { ok: false, status: 404, data: null }, async check(ctx) { const v = await ctx.fn("/data/missing.json"); return { pass: v === "404 Не знайдено", actual: ctx.show(v), expected: "\"404 Не знайдено\"" }; } },
          { name: "500 → помилка", fetch: { ok: false, status: 500, data: null }, async check(ctx) { const v = await ctx.fn("/data/tasks.json"); return { pass: v === "500 помилка", actual: ctx.show(v), expected: "\"500 помилка\"" }; } },
          { name: "200 → OK", fetch: { data: [], status: 200 }, async check(ctx) { const v = await ctx.fn("/data/tasks.json"); return { pass: v === "200 OK", actual: ctx.show(v), expected: "\"200 OK\"" }; } },
        ],
        solution: "async function getStatus(url) {\n  const response = await fetch(url);\n  if (response.ok) return `${response.status} OK`;\n  if (response.status === 404) return \"404 Не знайдено\";\n  return `${response.status} помилка`;\n}",
      },
    },
    90: {
      question: "Чому `response.json()` теж потребує `await`, а `JSON.parse` — ні?",
      variation: {
        prompt: "Показуй у `#examples-status` кількість: `Прикладів: N`. Для порожнього масиву — як і раніше `Прикладів поки немає`.",
        testCases: [
          { name: "Два приклади", fetch: { data: [{ id: 1, title: "Повторити цикли" }, { id: 2, title: "Пройти DOM" }] }, async check(ctx) { await ctx.fn(); return textIs(ctx, "#examples-status", "Прикладів: 2"); } },
          { name: "Порожньо", fetch: { data: [] }, async check(ctx) { await ctx.fn(); return textIs(ctx, "#examples-status", "Прикладів поки немає"); } },
        ],
        patch: [["  examples.forEach((example) => {", "  document.querySelector(\"#examples-status\").textContent = `Прикладів: ${examples.length}`;\n  examples.forEach((example) => {"]],
      },
    },

    /* ───────── Арка XIII — помилки ───────── */
    91: {
      question: "Чому пошкоджений запис не видаляють одразу? Що втратить користувач, якщо його стерти?",
      variation: {
        prompt: "Якщо JSON коректний, але це не масив (наприклад, об'єкт), покажи в `#storage-error` `Збережені дані мають неочікуваний формат` і поверни `[]`.",
        testCases: [
          { name: "Об'єкт замість масиву", storage: { tasks: "{\"title\":\"Масиви\"}" }, check(ctx) { const v = ctx.fn(); const e = jsqText(ctx, "#storage-error"); return { pass: ctx.equal(v, []) && e === "Збережені дані мають неочікуваний формат", actual: ctx.show([v, e]), expected: "[[], \"Збережені дані мають неочікуваний формат\"]" }; } },
          { name: "Коректний масив — без попередження", storage: { tasks: "[{\"id\":1}]" }, check(ctx) { const v = ctx.fn(); const e = jsqText(ctx, "#storage-error"); return { pass: ctx.equal(v, [{ id: 1 }]) && e === "", actual: ctx.show([v, e]), expected: "[[{ id: 1 }], \"\"]" }; } },
          { name: "Пошкоджений JSON — як раніше", storage: { tasks: "{oops" }, check(ctx) { ctx.fn(); return textIs(ctx, "#storage-error", "Збережені дані пошкоджено — показуємо порожній список"); } },
        ],
        patch: [["    return Array.isArray(data) ? data : [];", "    if (!Array.isArray(data)) {\n      document.querySelector(\"#storage-error\").textContent = \"Збережені дані мають неочікуваний формат\";\n      return [];\n    }\n    return data;"]],
      },
    },
    92: {
      question: "Навіщо `finally`, якщо можна ввімкнути кнопку наприкінці `try` і в `catch`?",
      variation: {
        prompt: "Після успіху пиши кількість: `Готово (N)`.",
        testCases: [
          { name: "Два приклади → Готово (2)", fetch: { data: [{ title: "Повторити цикли" }, { title: "Пройти DOM" }] }, async check(ctx) { await ctx.fn(); return textIs(ctx, "#status", "Готово (2)"); } },
        ],
        patch: [["statusText.textContent = \"Готово\";", "statusText.textContent = `Готово (${examples.length})`;"]],
      },
    },
    93: {
      question: "Навіщо власний `throw`, якщо можна одразу написати текст у `#status`?",
      variation: {
        prompt: "Порожній масив — теж неприйнятні дані: `throw new Error(\"Список завдань порожній\")`.",
        testCases: [
          { name: "[] → помилка", fetch: { data: [] }, async check(ctx) { await ctx.fn(); return textIs(ctx, "#status", "Список завдань порожній"); } },
          { name: "Один приклад — як раніше", fetch: { data: [{ title: "Повторити цикли" }] }, async check(ctx) { await ctx.fn(); const s = jsqText(ctx, "#status"); const n = ctx.$$("#examples li").length; return { pass: s === "" && n === 1, actual: ctx.show(s) + ", " + n + " li", expected: "\"\", 1 li" }; } },
        ],
        patch: [["    if (!Array.isArray(examples)) throw new Error(\"Очікували список завдань\");\n", "    if (!Array.isArray(examples)) throw new Error(\"Очікували список завдань\");\n    if (examples.length === 0) throw new Error(\"Список завдань порожній\");\n"]],
      },
    },

    /* ───────── Арка XIV — фінал ───────── */
    94: {
      question: "Чому методи класу зникли в JSON-копії, а дані лишились?",
      variation: {
        prompt: "Додай метод `rename(newTitle)`: змінює назву (без пробілів на краях), а порожню назву ігнорує.",
        testCases: [
          { name: "Перейменування", check(ctx) { const Task = ctx.get("Task"); const t = new Task("Масиви", 30); if (typeof t.rename !== "function") return { pass: false, actual: "методу rename немає", expected: "метод rename" }; t.rename("  DOM "); const a = t.title; t.rename("   "); return { pass: a === "DOM" && t.title === "DOM", actual: ctx.show([a, t.title]), expected: "[\"DOM\", \"DOM\"]" }; } },
        ],
        patch: [["  complete() {\n    this.done = true;\n  }\n", "  complete() {\n    this.done = true;\n  }\n\n  rename(newTitle) {\n    const title = newTitle.trim();\n    if (title) this.title = title;\n  }\n"]],
      },
    },
    95: {
      question: "Чому `STORAGE_KEY` не експортують? Що виграє код, коли ключ змінюється лише в одному місці?",
      variation: {
        prompt: "Додай і експортуй `clearTasks()` — видаляє збережений список (через приватний `STORAGE_KEY`).",
        addExports: ["clearTasks"],
        testCases: [
          { name: "clearTasks експортовано й працює", check(ctx) { if (!ctx.moduleExports.includes("clearTasks")) return { pass: false, actual: ctx.show(ctx.moduleExports), expected: "експорт clearTasks" }; ctx.get("saveTasks")([{ id: 1, title: "Модулі" }]); ctx.get("clearTasks")(); const raw = ctx.storage.getItem("tasks"); const v = ctx.get("loadTasks")(); return { pass: raw === null && ctx.equal(v, []), actual: ctx.show([raw, v]), expected: "[null, []]" }; } },
          { name: "STORAGE_KEY лишився приватним", check(ctx) { const leaked = ctx.moduleExports.includes("STORAGE_KEY"); return { pass: !leaked, actual: leaked ? "експортовано" : "приватний", expected: "приватний" }; } },
        ],
        append: "export function clearTasks() {\n  localStorage.removeItem(STORAGE_KEY);\n}",
      },
    },
    96: {
      question: "Де в трекері живе стан і чому `localStorage` — лише його копія? Опиши шлях даних від `submit` до картки на сторінці.",
      variation: {
        prompt: "Додаткова зміна: новий формат підсумку — `Усього: N завд. · M хв`. Решта сценаріїв приймання не змінюється.",
        testCases: [
          { name: "Перший запуск", check: (ctx) => textIs(ctx, "#summary", "Усього: 0 завд. · 0 хв") },
          { name: "Два записи", check(ctx) { const f = ctx.$("#task-form"); ctx.$("#task-title").value = "Масиви"; ctx.$("#task-minutes").value = "200"; ctx.fire(f, "submit"); ctx.$("#task-title").value = "DOM"; ctx.$("#task-minutes").value = "30"; ctx.fire(f, "submit"); return textIs(ctx, "#summary", "Усього: 2 завд. · 230 хв"); } },
        ],
        patch: [["`Завдань: ${tasks.length}, хвилин: ${minutes}`", "`Усього: ${tasks.length} завд. · ${minutes} хв`"]],
      },
    },
  };

  const levels = window.WORLD_DATA.js.levels;
  levels.forEach((level) => {
    const u = CHECKS[level.id];
    if (!u) return;
    const v = u.variation;
    if (v.type !== "predict") {
      // Еталон зміни будуємо з еталону рівня: так обидва завжди узгоджені.
      let solution = v.solution || level.solution;
      (v.patch || []).forEach(([from, to]) => { solution = solution.split(from).join(to); });
      if (v.append) solution += "\n\n" + v.append;
      v.solution = solution;
      if (v.addExports) v.exports = (level.exports || []).concat(v.addExports);
      delete v.patch;
      delete v.append;
      delete v.addExports;
    }
    level.understanding = u;
  });

  // Рівень для перевірки зміни умови: той самий, але з тестами (і за потреби
  // розміткою, експортами, вимогами до коду) зміни.
  window.jsqVariationLevel = function (level) {
    const v = level.understanding.variation;
    const merged = Object.assign({}, level, { prompt: v.prompt, testCases: v.testCases, solution: v.solution });
    ["exports", "functionName", "html", "codeChecks"].forEach((key) => { if (v[key] !== undefined) merged[key] = v[key]; });
    return merged;
  };
})();
