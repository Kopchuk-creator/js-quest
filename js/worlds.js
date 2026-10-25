/* =========================================================
   worlds.js — реєстр світів (як виміри в Minecraft).
   Кожен світ — окрема технологія зі своєю картою, рівнями,
   прогресом і трофеями. У світ-хабі до кожного веде портал.

   status:
     "open" — світ готовий (портал відчиняється, коли пройдено requires)
     "soon" — світ ще будується (портал у риштуванні)
   Дані рівнів світ додає сам: WORLD_DATA[id] = { locations, levels, projects }.
   ========================================================= */
window.WORLD_DATA = window.WORLD_DATA || {};

window.WORLDS = [
  { id: "js",    name: "Зелене королівство", tech: "JavaScript",             color: "#5ee0a0", status: "open", requires: [],             blurb: "Змінні, функції, масиви, DOM, асинхронність — фундамент усього вебу." },
  { id: "web",   name: "Острів будівельників", tech: "HTML і CSS",           color: "#f7a33a", status: "open", requires: [],             blurb: "Розмітка, семантика, форми, Flexbox, Grid і адаптивні сторінки." },
  { id: "git",   name: "Дерево часу",        tech: "Git і термінал",         color: "#c08a52", status: "soon", requires: [],             blurb: "Коміти, гілки, злиття й робота з GitHub." },
  { id: "deep",  name: "Глибини",            tech: "JavaScript поглиблено",  color: "#3fb3d9", status: "soon", requires: ["js"],         blurb: "Замикання, прототипи, event loop, модулі й патерни." },
  { id: "ts",    name: "Кришталеві гори",    tech: "TypeScript",             color: "#62d8ff", status: "soon", requires: ["js"],         blurb: "Типи, інтерфейси й generics — код, що ловить помилки заздалегідь." },
  { id: "test",  name: "Арена випробувань",  tech: "Тестування",             color: "#ff8a76", status: "soon", requires: ["js"],         blurb: "Unit-тести, TDD і впевненість у власному коді." },
  { id: "react", name: "Механічне місто",    tech: "React",                  color: "#7cb7ff", status: "soon", requires: ["js", "web"],  blurb: "Компоненти, стан, хуки, форми й маршрутизація." },
  { id: "sql",   name: "Шахти даних",        tech: "SQL і бази даних",       color: "#d9b44a", status: "soon", requires: [],             blurb: "SELECT, JOIN, індекси, нормалізація й транзакції." },
  { id: "node",  name: "Пекельні кузні",     tech: "Node.js і Express",      color: "#e0503c", status: "soon", requires: ["js", "sql"],  blurb: "HTTP, REST API, middleware, авторизація." },
  { id: "ops",   name: "Небесна фортеця",    tech: "Безпека і деплой",       color: "#f2f5f7", status: "soon", requires: ["node"],       blurb: "HTTP, CORS, XSS, Docker, CI/CD — фінальний бос." },
  { id: "py",    name: "Зміїна гавань",      tech: "Python",                 color: "#4a86c8", status: "soon", requires: [],             blurb: "Синтаксис, структури даних, функції, ООП і бекенд на Python." },
];
