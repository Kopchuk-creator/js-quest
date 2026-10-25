/* =========================================================
   game.js — спільна ігрова логіка для обох екранів:
   статуси рівнів і локацій, XP, рівень героя, трофеї.
   ========================================================= */
(function () {
  "use strict";

  const LEVELS = window.LEVELS;
  const LOCATIONS = window.LOCATIONS;
  const byId = new Map(LEVELS.map((l) => [l.id, l]));

  // Карта «номер арки → локація» (арки VII–IX ведуть на один Міст DOM тощо).
  const arcToLocation = {};
  LOCATIONS.forEach((loc) => loc.arcs.forEach((arc) => { arcToLocation[arc] = loc; }));
  LOCATIONS.forEach((loc) => {
    loc.levels = LEVELS.filter((l) => arcToLocation[l.arcNumber] === loc).map((l) => l.id);
  });

  const TASK_LABELS = {
    "predict-output": "Передбач результат",
    "multiple-choice": "Обери відповідь",
    "fill-blank": "Заповни пропуск",
    "write-function": "Напиши код",
    "fix-code": "Виправ код",
  };

  // XP за рівень залежить від складності: 50 / 75 / 100.
  function xpFor(level) {
    return 25 + 25 * (level.difficulty || 1);
  }

  // SPEC: «кожен рівень — 5-15 хв роботи»; оцінку беремо зі складності.
  function estimate(level) {
    return ["5–7 хв", "7–10 хв", "10–15 хв"][(level.difficulty || 1) - 1];
  }

  // Рівень героя: щоб перейти з рівня N на N+1, треба 100·N XP
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

  function completedSet(progress) {
    return new Set(progress.completed);
  }

  // Послідовне розблокування: рівень N доступний, лише коли пройдено N-1.
  function isUnlocked(progress, id) {
    return id === 1 || progress.completed.includes(id - 1);
  }

  function levelStatus(progress, id) {
    if (progress.completed.includes(id)) return "done";
    return isUnlocked(progress, id) ? "available" : "locked";
  }

  // Поточна місія — перший непройдений рівень (null, якщо гра завершена).
  function currentLevelId(progress) {
    const done = completedSet(progress);
    const next = LEVELS.find((l) => !done.has(l.id));
    return next ? next.id : null;
  }

  function locationOf(levelOrId) {
    const level = typeof levelOrId === "number" ? byId.get(levelOrId) : levelOrId;
    return level ? arcToLocation[level.arcNumber] : null;
  }

  function locationProgress(progress, loc) {
    const done = completedSet(progress);
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
    const progress = GameStore.load();
    const level = byId.get(id);
    const before = heroLevel(progress.xp);
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

    GameStore.save(progress);
    result.xpGained = xpFor(level);
    result.hero = heroLevel(progress.xp);
    result.leveledUp = result.hero.level > before.level;
    return result;
  }

  // Невдала спроба: без штрафів, лише лічильник (для дружніх підказок наставника).
  function recordFail(id) {
    const progress = GameStore.load();
    progress.fails[id] = (progress.fails[id] || 0) + 1;
    GameStore.save(progress);
    return progress.fails[id];
  }

  window.Game = {
    LEVELS,
    LOCATIONS,
    TASK_LABELS,
    getLevel: (id) => byId.get(id),
    xpFor,
    estimate,
    heroLevel,
    isUnlocked,
    levelStatus,
    currentLevelId,
    locationOf,
    locationProgress,
    locationStatus,
    trophies,
    completeLevel,
    recordFail,
    totalXp: LEVELS.reduce((sum, l) => sum + xpFor(l), 0),
  };
})();
