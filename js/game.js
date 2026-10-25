/* =========================================================
   game.js — спільна ігрова логіка для всіх екранів і світів:
   статуси рівнів і локацій, XP, рівень героя, трофеї, портали.

   Game.forWorld(id) повертає API конкретного світу;
   сам Game — це API «поточного» світу сторінки (?world=… у URL,
   інакше останній відвіданий, інакше JavaScript) + глобальні функції.
   ========================================================= */
(function () {
  "use strict";

  const TASK_LABELS = {
    "predict-output": "Передбач результат",
    "multiple-choice": "Обери відповідь",
    "fill-blank": "Заповни пропуск",
    "write-function": "Напиши код",
    "fix-code": "Виправ код",
    "write-markup": "Зверстай",
    "fix-markup": "Виправ верстку",
  };

  // XP за рівень залежить від складності: 50 / 75 / 100.
  function xpFor(level) {
    return 25 + 25 * (level.difficulty || 1);
  }

  // SPEC: «кожен рівень — 5-15 хв роботи»; оцінку беремо зі складності.
  function estimate(level) {
    return ["5–7 хв", "7–10 хв", "10–15 хв"][(level.difficulty || 1) - 1];
  }

  // Рівень героя спільний для всіх світів: щоб перейти з рівня N на N+1, треба 100·N XP
  // (як у макеті: «Рівень 3 — 120 / 300 XP»).
  function heroLevel(totalXp) {
    let level = 1;
    let rest = totalXp;
    while (rest >= level * 100) {
      rest -= level * 100;
      level++;
    }
    return { level, current: rest, needed: level * 100 };
  }

  function playableWorlds() {
    return window.WORLDS.filter((w) => w.status === "open" && window.WORLD_DATA[w.id]);
  }

  function totalXpAll() {
    return playableWorlds().reduce((sum, w) => sum + GameStore.load(w.id).xp, 0);
  }

  const cache = {};

  function forWorld(worldId) {
    if (cache[worldId]) return cache[worldId];
    const data = window.WORLD_DATA[worldId];
    if (!data) return null;
    const LEVELS = data.levels;
    const LOCATIONS = data.locations;
    const byId = new Map(LEVELS.map((l) => [l.id, l]));

    // Карта «номер арки → локація» (арки VII–IX ведуть на один Міст DOM тощо).
    const arcToLocation = {};
    LOCATIONS.forEach((loc) => loc.arcs.forEach((arc) => { arcToLocation[arc] = loc; }));
    LOCATIONS.forEach((loc) => {
      loc.levels = LEVELS.filter((l) => arcToLocation[l.arcNumber] === loc).map((l) => l.id);
    });
    LEVELS.forEach((l) => { l.world = worldId; });

    const load = () => GameStore.load(worldId);

    // Послідовне розблокування: рівень N доступний, лише коли пройдено N-1.
    function isUnlocked(progress, id) {
      return id === LEVELS[0].id || progress.completed.includes(id - 1);
    }

    function levelStatus(progress, id) {
      if (progress.completed.includes(id)) return "done";
      return isUnlocked(progress, id) ? "available" : "locked";
    }

    // Поточна місія — перший непройдений рівень (null, якщо світ пройдено).
    function currentLevelId(progress) {
      const done = new Set(progress.completed);
      const next = LEVELS.find((l) => !done.has(l.id));
      return next ? next.id : null;
    }

    function locationOf(levelOrId) {
      const level = typeof levelOrId === "number" ? byId.get(levelOrId) : levelOrId;
      return level ? arcToLocation[level.arcNumber] : null;
    }

    function locationProgress(progress, loc) {
      const done = new Set(progress.completed);
      const count = loc.levels.filter((id) => done.has(id)).length;
      return { done: count, total: loc.levels.length, ratio: count / loc.levels.length };
    }

    function locationStatus(progress, loc) {
      const { done, total } = locationProgress(progress, loc);
      if (done === total) return "done";
      return isUnlocked(progress, loc.levels[0]) ? "current" : "locked";
    }

    function trophies(progress) {
      return LOCATIONS.filter((loc) => locationStatus(progress, loc) === "done");
    }

    /**
     * Зараховує проходження рівня. Повторне проходження вже пройденого рівня
     * XP не дає (щоб не можна було «фармити» досвід), але й нічого не забирає.
     */
    function completeLevel(id, firstTry) {
      const progress = load();
      const level = byId.get(id);
      const before = heroLevel(totalXpAll());
      const result = { alreadyDone: progress.completed.includes(id), xpGained: 0, leveledUp: false, location: null, progress };
      if (result.alreadyDone) return result;

      progress.completed.push(id);
      progress.completed.sort((a, b) => a - b);
      progress.xp += xpFor(level);
      progress.streak = firstTry ? progress.streak + 1 : 0;
      progress.bestStreak = Math.max(progress.bestStreak, progress.streak);
      delete progress.fails[id];

      const loc = locationOf(level);
      if (locationStatus(progress, loc) === "done") result.location = loc;

      GameStore.save(progress, worldId);
      result.xpGained = xpFor(level);
      result.hero = heroLevel(totalXpAll());
      result.leveledUp = result.hero.level > before.level;
      return result;
    }

    // Невдала спроба: без штрафів, лише лічильник (для дружніх підказок наставника).
    function recordFail(id) {
      const progress = load();
      progress.fails[id] = (progress.fails[id] || 0) + 1;
      GameStore.save(progress, worldId);
      return progress.fails[id];
    }

    function completion() {
      const progress = load();
      return { done: progress.completed.length, total: LEVELS.length, ratio: progress.completed.length / LEVELS.length };
    }

    const api = {
      WORLD_ID: worldId,
      meta: window.WORLDS.find((w) => w.id === worldId),
      LEVELS,
      LOCATIONS,
      projects: data.projects || [],
      load,
      getLevel: (id) => byId.get(id),
      isUnlocked,
      levelStatus,
      currentLevelId,
      locationOf,
      locationProgress,
      locationStatus,
      trophies,
      completeLevel,
      recordFail,
      completion,
      totalXp: LEVELS.reduce((sum, l) => sum + xpFor(l), 0),
      // root — шлях до кореня сайту: "" для index.html, "../" для levels/level.html.
      levelUrl: (id, root) => (root || "") + "levels/level.html?world=" + worldId + "&id=" + id,
      mapUrl: (root) => (root || "") + "index.html?world=" + worldId + "#map",
    };
    cache[worldId] = api;
    return api;
  }

  /**
   * Стан порталу у світ-хабі:
   *   soon   — світ ще будується
   *   locked — потрібно спершу пройти світи з requires
   *   open   — можна заходити (done — світ уже пройдено повністю)
   */
  function worldStatus(world) {
    if (world.status !== "open" || !window.WORLD_DATA[world.id]) return "soon";
    const blocked = world.requires.filter((req) => {
      const w = forWorld(req);
      return !w || w.completion().ratio < 1;
    });
    if (blocked.length) return "locked";
    return forWorld(world.id).completion().ratio === 1 ? "done" : "open";
  }

  // Поточний світ сторінки.
  const params = new URLSearchParams(location.search);
  let current = params.get("world");
  if (current && window.WORLD_DATA[current]) {
    GameStore.setLastWorld(current);
  } else {
    current = GameStore.lastWorld();
    if (!current || !window.WORLD_DATA[current]) current = "js";
  }
  GameStore.setWorld(current);

  window.Game = Object.assign({}, forWorld(current), {
    TASK_LABELS,
    xpFor,
    estimate,
    heroLevel,
    forWorld,
    totalXpAll,
    worldStatus,
    playableWorlds,
    hasWorldParam: !!params.get("world"),
  });
})();
