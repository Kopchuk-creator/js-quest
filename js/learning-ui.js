/* Інтеграція навчальних дій у гнізда GameUI:
   повторення, поступові підказки, резервні копії та швидкий перехід до списку повторення. */
(function () {
  "use strict";

  const hintStages = new Map();
  const hintKey = (ctx) => ctx.world + ":" + ctx.level;
  const worldApi = (ctx) => Game.forWorld(ctx.world);

  GameUI.addAction("review", {
    id: "review-toggle",
    label: (ctx) => worldApi(ctx).load().review.includes(Number(ctx.level)) ? "У повторенні" : "Повторити тему",
    icon: "flag",
    title: "Позначити тему для повторення",
    pressed: (ctx) => worldApi(ctx).load().review.includes(Number(ctx.level)),
    onClick(ctx) {
      const marked = worldApi(ctx).toggleReview(Number(ctx.level));
      GameUI.refresh("review");
      UI.toast(UI.icon("flag") + " <span>" + (marked ? "Тему додано до повторення" : "Тему прибрано зі списку повторення") + "</span>");
    },
  });

  GameUI.addAction("hint", {
    id: "progressive-hint",
    icon: "bulb",
    label(ctx) {
      return ["Показати запитання", "Пояснити ідею", "Показати короткий приклад"][hintStages.get(hintKey(ctx)) || 0] || "Підказки показано";
    },
    title: "Відкривати підказку поступово, без автоматичної видачі розв’язку",
    isVisible(ctx) { return (hintStages.get(hintKey(ctx)) || 0) < 3; },
    onClick(ctx) {
      const level = worldApi(ctx).getLevel(Number(ctx.level));
      if (!level) return;
      const key = hintKey(ctx);
      const stage = (hintStages.get(key) || 0) + 1;
      hintStages.set(key, stage);
      const output = document.querySelector("#hint-stage");
      if (!output) return;
      if (stage === 1) {
        const question = String(level.prompt || "").split(/[.!?]/)[0];
        output.textContent = "Навідне запитання: " + (question ? question + "?" : "Які дані отримуєш і що мають підтвердити перевірки?");
      } else if (stage === 2) {
        output.innerHTML = UI.md(level.concept || "") + (level.hint ? "<p>Підказка: " + UI.md(level.hint) + "</p>" : "");
      } else {
        const snippet = String(level.example || "").split("\n").map((line) => line.trim()).find((line) => line && !line.startsWith("//"));
        output.innerHTML = snippet
          ? "Короткий фрагмент із прикладу:<pre class=\"code-block\">" + UI.highlight(snippet.slice(0, 180), level.exampleLang || UI.guessLang(snippet)) + "</pre>"
          : "Знайди потрібну ідею в прикладі «Сувою знань» і застосуй її до свого завдання.";
      }
      GameUI.refresh("hint");
    },
  });

  function downloadBackup() {
    const payload = JSON.stringify(GameStore.exportBackup(), null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "kodomantry-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function importInput() {
    let input = document.getElementById("kodomantry-backup-file");
    if (!input) {
      input = document.createElement("input");
      input.id = "kodomantry-backup-file";
      input.type = "file";
      input.accept = "application/json,.json";
      input.hidden = true;
      document.body.appendChild(input);
      input.addEventListener("change", handleBackupFile);
    }
    input.click();
  }

  async function handleBackupFile(event) {
    const input = event.currentTarget;
    const file = input.files && input.files[0];
    if (!file) return;
    try {
      const contents = await file.text();
      const preview = GameStore.previewBackup(contents);
      const details = preview.map((world) => {
        const resume = world.resume
          ? ", продовження з місії " + world.resume.levelId + (world.resume.phase === "variation" ? " (зміна умови)" : "")
          : "";
        return world.name + ": " + world.completed + " місій, " + world.xp + " XP, " + world.variations +
          " змін умов, " + world.drafts + " чернеток, " + world.review + " тем для повторення" + resume;
      }).join("\n");
      if (!await UI.confirmDialog("Відновлення резервної копії", "Файл перевірено. Ці дані буде відновлено й замінено для вказаних світів:\n\n" + details + "\n\nПродовжити?", { confirmLabel: "Відновити" })) return;
      GameStore.restoreBackup(contents);
      window.dispatchEvent(new Event("kodomantry:progress-restored"));
    } catch (error) {
      await UI.messageDialog("Не вдалося відновити копію", "Не вдалося відновити резервну копію: " + error.message + "\nДані гри не змінено.");
    } finally {
      input.value = "";
    }
  }

  GameUI.addAction("backup", {
    id: "backup-export",
    label: "Завантажити копію",
    icon: "copy",
    title: "Завантажити резервну копію прогресу й чернеток",
    onClick: downloadBackup,
  });
  GameUI.addAction("backup", {
    id: "backup-import",
    label: "Відновити з файла",
    icon: "reset",
    title: "Перевірити резервну копію й переглянути її вміст перед відновленням",
    onClick: importInput,
  });

  GameUI.addAction("continue", {
    id: "open-review-list",
    label(ctx) {
      const count = worldApi(ctx).load().review.length;
      return "Теми для повторення (" + count + ")";
    },
    icon: "flag",
    title: "Відкрити список позначених тем",
    isVisible(ctx) { return worldApi(ctx).load().review.length > 0; },
    onClick() { window.location.href = "index.html#trophies"; },
  });
})();
