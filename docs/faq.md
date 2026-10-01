# ❓ FAQ

### 💾 Where are my tasks stored?

In your browser's `localStorage`, on your device only. There is no account and no server; the only request to another site loads the language flags from flagcdn.com, without your tasks or even the page address. See [Security](./security.md#️-data-on-the-device).

### 📲 How do I move my tasks to another device or browser?

Open **⋯ → Export tasks** on the old device and **⋯ → Import tasks** on the new one. Importing only adds tasks that are not there yet, so it is safe to import the same file twice.

### 🧯 The app shows “Something went wrong”. Are my tasks gone?

No. The error screen sits on top of your data: **Download a backup** saves the stored tasks as a JSON file, **Reset view settings** clears only the selected list, sort order and theme, and **Reload the app** starts over. If the problem persists, please [open an issue](https://github.com/sacrificed666/react-todo-app/issues/new/choose).

### 🐢 The app feels slow on my computer. What can I do?

Open **Settings → Effects** and choose **Reduced**. It keeps the glass look but stops the moving aurora, the refraction and the pointer light, which are what slows down computers without a strong graphics chip. **Auto** already does this everywhere except recent Macs and iPads. See [Design system](./design.md#-effects-and-performance).

### 🔮 Why do the glass edges bend the background only in some browsers?

The refraction uses an SVG filter inside `backdrop-filter`, which only Chromium-based browsers render, and only with **Full** effects. Safari and Firefox get the same frosted glass without the lens effect. See [Design system](./design.md#-refraction).

### ⚡ Which words does quick add understand?

Dates like `tomorrow`, `next friday`, `in 3 days`, `20.10` and their equivalents in all eight languages (`morgen`, `mañana`, `demain`, `domani`, `jutro`…), and `!` for important — always at the end of the title. The full list is in [Features](./features.md#-quick-add).

### 🔁 How do repeating tasks work?

Open a task's details and pick **Repeat**, or end its title with a phrase like `every friday` or `щотижня`. When you complete it, the finished occurrence moves to **Completed** and the next one appears right away with its new date. See [Features](./features.md#-repeating-tasks).

### ⌨️ Is there a list of keyboard shortcuts?

Yes — in the **⋯** menu, in the command palette (<kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>K</kbd>) and in [Features](./features.md#️-keyboard-shortcuts).

### 🌍 Can I use the app in another language?

Eight are built in: English, Ukrainian, German, Spanish, French, Italian, Dutch and Polish. Adding another one takes a message file and a few lines — see [Localization](./i18n.md#-adding-a-language).

### 🔄 How do I get the latest version?

The app checks for updates in the background. When one is ready, a notification offers **Reload**; nothing changes until you choose it.

### 🗑️ How do I delete everything?

Clear the site data in your browser settings, or select all completed tasks with **Complete all** and then **Clear completed**. Export a backup first if you might need the tasks again.
