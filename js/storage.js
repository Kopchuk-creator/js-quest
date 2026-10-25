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

  /* localStorage може бути недоступний (заборона даних сайтів, переповнення,
     деякі приватні режими). Тоді прогрес живе в пам'яті сторінки, а між
     сторінками гри (карта ↔ місія) переїжджає через window.name — він
     зберігається при переходах у межах вкладки. Після закриття вкладки
     такий прогрес зникне — про це гравця попереджає UI (GameStore.persistent). */
  const NAME_PREFIX = "jsq-state:";
  const memory = {};
  try {
    if (typeof window.name === "string" && window.name.startsWith(NAME_PREFIX)) {
      Object.assign(memory, JSON.parse(window.name.slice(NAME_PREFIX.length)));
    }
  } catch (e) { /* пошкоджений стан — починаємо з порожнього */ }

  let persistent = (function () {
    try {
      window.localStorage.setItem("js-game-probe", "1");
      window.localStorage.removeItem("js-game-probe");
      return true;
    } catch (e) {
      return false;
    }
  })();

  function syncMemory() {
    try { window.name = NAME_PREFIX + JSON.stringify(memory); } catch (e) { /* ignore */ }
  }
  function safeGet(key) {
    if (Object.prototype.hasOwnProperty.call(memory, key)) return memory[key];
    if (!persistent) return null;
    try { return window.localStorage.getItem(key); } catch (e) { persistent = false; return null; }
  }
  function safeSet(key, value) {
    if (persistent) {
      try { window.localStorage.setItem(key, value); return true; } catch (e) { persistent = false; }
    }
    memory[key] = String(value);
    syncMemory();
    return false;
  }
  function safeRemove(key) {
    if (Object.prototype.hasOwnProperty.call(memory, key)) { delete memory[key]; syncMemory(); }
    if (!persistent) return;
    try { window.localStorage.removeItem(key); } catch (e) { persistent = false; }
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
    // false — браузер не дає зберігати дані: прогрес живе лише в цій вкладці.
    get persistent() { return persistent; },
    // Чи вже попереджали гравця в цій вкладці (щоб не повторювати на кожній сторінці).
    storageWarned() { return memory["js-game-storage-warned"] === "1"; },
    markStorageWarned() { memory["js-game-storage-warned"] = "1"; syncMemory(); },
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
