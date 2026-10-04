import type { Locator, Page } from "@playwright/test";

interface SeedTodo {
  title: string;
  due?: number;
  important?: boolean;
  completed?: boolean;
  project?: string;
  notes?: string;
}

interface SeedProject {
  id: string;
  name: string;
  color: string;
}

export const SAMPLE_PROJECTS: SeedProject[] = [
  { id: "work", name: "Work", color: "blue" },
  { id: "home", name: "🏠 Home", color: "green" },
];

export const SAMPLE_TODOS: SeedTodo[] = [
  { title: "Send the invoice", due: -2, important: true, project: "work" },
  { title: "Daily standup", due: 0, project: "work", notes: "- [x] Agenda\n- [ ] Notes" },
  { title: "Water the plants #home", due: 0, project: "home" },
  { title: "Dentist appointment", due: 3 },
  { title: "Book flights for the trip", due: 12, important: true },
  { title: "Read a book" },
  { title: "Buy milk", completed: true, project: "home" },
];

export async function seed(page: Page, todos: SeedTodo[] = SAMPLE_TODOS, projects: SeedProject[] = SAMPLE_PROJECTS) {
  await page.addInitScript(
    ({ todos: entries, projects: groups }) => {
      if (sessionStorage.getItem("e2e-seeded")) return;
      sessionStorage.setItem("e2e-seeded", "1");
      const now = Date.now();
      const data = {
        todos: entries.map((entry, index) => ({
          id: `seed-${index}`,
          title: entry.title,
          completed: entry.completed ?? false,
          important: entry.important ?? false,
          dueDate:
            entry.due === undefined
              ? null
              : new Date(new Date().setDate(new Date().getDate() + entry.due)).toLocaleDateString("sv-SE"),
          projectId: entry.project ?? null,
          notes: entry.notes ?? "",
          createdAt: now - index * 60_000,
          updatedAt: now - index * 60_000,
          completedAt: entry.completed ? now : null,
        })),
        projects: groups.map((group) => ({ ...group, createdAt: now, updatedAt: now })),
      };
      localStorage.setItem("react-todo-app/todos", JSON.stringify(data));
    },
    { todos, projects },
  );
}

export async function preferences(page: Page, values: Record<string, string>) {
  await page.addInitScript((settings) => {
    if (sessionStorage.getItem("e2e-preferences")) return;
    sessionStorage.setItem("e2e-preferences", "1");
    localStorage.setItem("react-todo-app/preferences", JSON.stringify(settings));
  }, values);
}

export async function stubFlags(page: Page) {
  await page.route("https://flagcdn.com/**", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#888"/></svg>',
    }),
  );
}

export async function openPalette(page: Page) {
  await page.keyboard.press("ControlOrMeta+K");
  return page.getByRole("dialog", { name: "Command palette" });
}

export async function runCommand(page: Page, command: string) {
  const palette = await openPalette(page);
  await palette.getByRole("combobox").fill(command);
  await page.keyboard.press("Enter");
}

export function option(page: Page, name: string | RegExp): Locator {
  return page.locator("label").filter({ has: page.getByRole("radio", { name, exact: true }) });
}
