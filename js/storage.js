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
      variations: [],      // id рівнів, де пройдено «Зміну умови» з перевірки розуміння
      review: [],          // теми, до яких гравець хоче повернутися
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
      merged.variations = Array.isArray(merged.variations)
        ? merged.variations.filter((n) => Number.isInteger(n))
        : [];
      merged.review = Array.isArray(merged.review) ? merged.review.filter((n) => Number.isInteger(n)) : [];
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

  function knownWorldIds() {
    return (window.WORLDS || []).filter((w) => window.WORLD_DATA && window.WORLD_DATA[w.id]).map((w) => w.id);
  }
  function validId(id, world) {
    return Number.isInteger(id) && (window.WORLD_DATA[world].levels || []).some((l) => l.id === id);
  }
  function validateProgress(value, world) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Некоректний прогрес світу «" + world + "».");
    const p = Object.assign(emptyProgress(), value);
    ["completed", "variations", "review"].forEach((key) => {
      if (p[key] == null && key === "review") p[key] = [];
      if (!Array.isArray(p[key]) || p[key].some((id) => !validId(id, world))) throw new Error("Некоректний список «" + key + "» у світі «" + world + "».");
      p[key] = Array.from(new Set(p[key]));
    });
    p.completed.sort((a, b) => a - b);
    if (p.completed.some((id, index) => id !== window.WORLD_DATA[world].levels[index].id)) throw new Error("Пройдені місії у світі «" + world + "» мають порушений послідовний порядок.");
    if (p.variations.some((id) => !p.completed.includes(id) || !window.WORLD_DATA[world].levels.find((level) => level.id === id).understanding)) {
      throw new Error("Зміна умови має посилатися на пройдену місію з перевіркою розуміння.");
    }
    if (!Number.isFinite(p.xp) || p.xp < 0 || !Number.isInteger(p.xp)) throw new Error("Некоректне значення XP у світі «" + world + "».");
    if (!Number.isInteger(p.streak) || p.streak < 0 || !Number.isInteger(p.bestStreak) || p.bestStreak < p.streak) throw new Error("Некоректна серія у світі «" + world + "».");
    if (!p.fails || typeof p.fails !== "object" || Array.isArray(p.fails)) throw new Error("Некоректна статистика спроб у світі «" + world + "».");
    if (p.resume != null) {
      const resumeLevel = p.resume && window.WORLD_DATA[world].levels.find((level) => level.id === p.resume.levelId);
      const validMission = resumeLevel && p.resume.phase === "mission" && !p.completed.includes(p.resume.levelId);
      const validVariation = resumeLevel && p.resume.phase === "variation" && resumeLevel.understanding && p.completed.includes(p.resume.levelId) && !p.variations.includes(p.resume.levelId);
      if (!validMission && !validVariation) throw new Error("Некоректне місце продовження у світі «" + world + "».");
    }
    return p;
  }
  function validateDrafts(value, world) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Некоректні чернетки світу «" + world + "».");
    const drafts = {};
    Object.keys(value).forEach((id) => {
      if (!validId(Number(id), world) || typeof value[id] !== "string" || value[id].length > 500000) throw new Error("Некоректна чернетка «" + id + "» у світі «" + world + "».");
      drafts[id] = value[id];
    });
    return drafts;
  }
  function parseBackup(input) {
    const backup = typeof input === "string" ? JSON.parse(input) : input;
    if (!backup || backup.format !== "kodomantry-backup" || backup.version !== 1 || !backup.worlds || typeof backup.worlds !== "object" || Array.isArray(backup.worlds)) throw new Error("Файл не є сумісною резервною копією Кодомандр.");
    const allowed = knownWorldIds();
    const ids = Object.keys(backup.worlds);
    if (!ids.length || ids.some((id) => !allowed.includes(id))) throw new Error("Резервна копія містить невідомий або порожній світ.");
    const worlds = {};
    ids.forEach((id) => {
      const item = backup.worlds[id];
      if (!item || typeof item !== "object") throw new Error("Пошкоджені дані світу «" + id + "».");
      worlds[id] = { progress: validateProgress(item.progress, id), drafts: validateDrafts(item.drafts || {}, id) };
    });
    return { format: "kodomantry-backup", version: 1, exportedAt: backup.exportedAt || null, worlds };
  }
  function makeBackup(worldIds) {
    const worlds = {};
    (worldIds || knownWorldIds()).forEach((world) => { worlds[world] = { progress: load(world), drafts: loadDrafts(world) }; });
    return { format: "kodomantry-backup", version: 1, exportedAt: new Date().toISOString(), worlds };
  }
  function backupPreview(input) {
    const backup = parseBackup(input);
    return Object.keys(backup.worlds).map((id) => {
      const item = backup.worlds[id];
      return { id, name: (window.WORLDS.find((w) => w.id === id) || {}).name || id,
        completed: item.progress.completed.length, xp: item.progress.xp, variations: item.progress.variations.length,
        review: item.progress.review.length, drafts: Object.keys(item.drafts).length,
        resume: item.progress.resume ? { levelId: item.progress.resume.levelId, phase: item.progress.resume.phase } : null };
    });
  }
  function restoreBackup(input) {
    const backup = parseBackup(input); // повна перевірка до першого запису
    const keys = [];
    Object.keys(backup.worlds).forEach((id) => keys.push(PROGRESS_KEY + suffix(id), DRAFTS_KEY + suffix(id)));
    const previous = keys.map((key) => safeGet(key));
    const wasPersistent = persistent;
    try {
      Object.keys(backup.worlds).forEach((id) => {
        const progressKey = PROGRESS_KEY + suffix(id);
        const draftsKey = DRAFTS_KEY + suffix(id);
        if (!safeSet(progressKey, JSON.stringify(backup.worlds[id].progress)) && wasPersistent) throw new Error("Не вдалося записати резервну копію в сховище браузера.");
        if (!safeSet(draftsKey, JSON.stringify(backup.worlds[id].drafts)) && wasPersistent) throw new Error("Не вдалося записати чернетки в сховище браузера.");
      });
    } catch (error) {
      keys.forEach((key, i) => {
        if (previous[i] == null) {
          safeRemove(key);
          try { window.localStorage.removeItem(key); } catch (_) { /* приватний режим: відновлюємо доступну копію в пам'яті */ }
        } else {
          safeSet(key, previous[i]);
          try { window.localStorage.setItem(key, previous[i]); } catch (_) { /* початкове значення лишається в пам'яті */ }
        }
      });
      throw error;
    }
    return backupPreview(backup);
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
    // Прибирає лише чернетки коду одного світу.
    clearDrafts(world) { safeRemove(DRAFTS_KEY + suffix(world)); },
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
    exportBackup: makeBackup,
    previewBackup: backupPreview,
    restoreBackup,
    lastWorld() { return safeGet(LAST_WORLD_KEY); },
    setLastWorld(world) { safeSet(LAST_WORLD_KEY, world); },
  };

  window.GameStore = GameStore;
})();
