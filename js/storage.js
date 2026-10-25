/* =========================================================
   storage.js — уся робота з localStorage.
   Прогрес кожного світу зберігається окремо. Для першого світу
   (JavaScript) лишається ключ "js-game-progress" зі SPEC.md —
   так старий прогрес гравців не губиться; інші світи отримують
   ключі на кшталт "js-game-progress:web".
   ========================================================= */
(function () {
  "use strict";

  const PROGRESS_KEY = "js-game-progress";
  const DRAFTS_KEY = "js-game-drafts";
  const LAST_WORLD_KEY = "js-game-last-world";

  let currentWorld = "js";

  function suffix(world) {
    const w = world || currentWorld;
    return w === "js" ? "" : ":" + w;
  }

  function emptyProgress() {
    return {
      version: 1,
      completed: [],       // масив id пройдених рівнів
      xp: 0,               // досвід, здобутий у цьому світі
      streak: 0,           // скільки рівнів поспіль пройдено з першої спроби
      bestStreak: 0,
      fails: {},           // { [id]: кількість невдалих спроб } — лише для статистики, без штрафів
      celebrated: [],      // id локацій, для яких уже показали анімацію трофея
    };
  }

  // localStorage може бути недоступний (приватний режим, заборона cookie) —
  // тоді гра працює, просто без збереження між сесіями.
  function safeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { window.localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }
  function safeRemove(key) {
    try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  function load(world) {
    const raw = safeGet(PROGRESS_KEY + suffix(world));
    if (!raw) return emptyProgress();
    try {
      const data = JSON.parse(raw);
      // Підтримка найпростішого формату зі SPEC.md: просто масив id.
      if (Array.isArray(data)) return Object.assign(emptyProgress(), { completed: data });
      const merged = Object.assign(emptyProgress(), data);
      merged.completed = Array.isArray(merged.completed)
        ? merged.completed.filter((n) => Number.isInteger(n))
        : [];
      return merged;
    } catch (e) {
      return emptyProgress();
    }
  }

  function save(progress, world) {
    return safeSet(PROGRESS_KEY + suffix(world), JSON.stringify(progress));
  }

  function loadDrafts(world) {
    try { return JSON.parse(safeGet(DRAFTS_KEY + suffix(world))) || {}; } catch (e) { return {}; }
  }

  const GameStore = {
    setWorld(world) { currentWorld = world; },
    load,
    save,
    // Скидає прогрес усіх світів.
    reset(worldIds) {
      (worldIds || ["js"]).forEach((w) => {
        safeRemove(PROGRESS_KEY + suffix(w));
        safeRemove(DRAFTS_KEY + suffix(w));
      });
      safeRemove(LAST_WORLD_KEY);
    },
    // Скидає прогрес і чернетки одного світу.
    resetWorld(world) {
      safeRemove(PROGRESS_KEY + suffix(world));
      safeRemove(DRAFTS_KEY + suffix(world));
    },
    // Чернетки — довільний рядок (для HTML/CSS-світу там JSON з кількома файлами).
    getDraft(id, world) {
      const drafts = loadDrafts(world);
      return typeof drafts[id] === "string" ? drafts[id] : null;
    },
    saveDraft(id, code, world) {
      const drafts = loadDrafts(world);
      drafts[id] = code;
      safeSet(DRAFTS_KEY + suffix(world), JSON.stringify(drafts));
    },
    clearDraft(id, world) {
      const drafts = loadDrafts(world);
      delete drafts[id];
      safeSet(DRAFTS_KEY + suffix(world), JSON.stringify(drafts));
    },
    lastWorld() { return safeGet(LAST_WORLD_KEY); },
    setLastWorld(world) { safeSet(LAST_WORLD_KEY, world); },
  };

  window.GameStore = GameStore;
})();
