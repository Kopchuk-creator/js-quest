/* =========================================================
   storage.js — уся робота з localStorage.
   Прогрес лежить під ключем "js-game-progress" (як у SPEC.md),
   чернетки коду — окремо, щоб не роздувати основний запис.
   ========================================================= */
(function () {
  "use strict";

  const PROGRESS_KEY = "js-game-progress";
  const DRAFTS_KEY = "js-game-drafts";

  function emptyProgress() {
    return {
      version: 1,
      completed: [],       // масив id пройдених рівнів
      xp: 0,               // загальний досвід
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

  function load() {
    const raw = safeGet(PROGRESS_KEY);
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

  function save(progress) {
    return safeSet(PROGRESS_KEY, JSON.stringify(progress));
  }

  function loadDrafts() {
    try { return JSON.parse(safeGet(DRAFTS_KEY)) || {}; } catch (e) { return {}; }
  }

  const GameStore = {
    load,
    save,
    reset() {
      safeRemove(PROGRESS_KEY);
      safeRemove(DRAFTS_KEY);
    },
    getDraft(id) {
      const drafts = loadDrafts();
      return typeof drafts[id] === "string" ? drafts[id] : null;
    },
    saveDraft(id, code) {
      const drafts = loadDrafts();
      drafts[id] = code;
      safeSet(DRAFTS_KEY, JSON.stringify(drafts));
    },
    clearDraft(id) {
      const drafts = loadDrafts();
      delete drafts[id];
      safeSet(DRAFTS_KEY, JSON.stringify(drafts));
    },
  };

  window.GameStore = GameStore;
})();
