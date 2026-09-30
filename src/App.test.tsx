import { act, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TOAST_DURATION } from "@/components/feedback/Toaster/Toaster";
import { parseTodos, type Todo } from "@/lib/todo";
import { selectTodos } from "@/store/selectors";
import { dayFromToday, makeState, makeTodo, sampleTodos, todayKey } from "@/test/factories";
import { renderWithStore } from "@/test/render";

import App from "./App";

type User = ReturnType<typeof renderWithStore>["user"];

const renderApp = (todos: readonly Todo[] = sampleTodos, list: Parameters<typeof makeState>[1] = "all") =>
  renderWithStore(<App />, { preloadedState: makeState(todos, list) });

const section = (name: RegExp) => screen.getByRole("region", { name });

const itemTitles = (region: HTMLElement) =>
  within(region)
    .queryAllByRole("checkbox")
    .map((checkbox) => checkbox.getAttribute("aria-label"));

const notification = () => screen.getByRole("status", { name: "Notification" });

const openPopover = async (user: User, trigger: HTMLElement) => {
  await user.click(trigger);
  const popover = document.getElementById(trigger.getAttribute("popovertarget") ?? "");
  if (!popover) throw new Error("Popover not found");
  return within(popover);
};

const chooseMenuItem = async (user: User, name: string) => {
  const menu = await openPopover(user, screen.getByRole("button", { name: "More actions" }));
  await user.click(menu.getByRole("button", { name }));
  expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
};

const plannedTodos = [
  makeTodo({ id: "late", title: "Send the invoice", dueDate: dayFromToday(-2), important: true }),
  makeTodo({ id: "now", title: "Daily standup", dueDate: todayKey() }),
  makeTodo({ id: "soon", title: "Dentist appointment", dueDate: dayFromToday(3) }),
  makeTodo({ id: "free", title: "Read a book" }),
];

describe("App shell", () => {
  it("renders the header, lists and footer", () => {
    renderApp(plannedTodos);

    expect(screen.getByRole("banner")).toHaveTextContent("ToDo");
    expect(screen.getByRole("heading", { level: 1, name: "All tasks" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Lists" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Today (2)" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Important (1)" })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toHaveTextContent("1 overdue");
  });

  it("switches lists with the navigation and number keys", async () => {
    const { user } = renderApp(plannedTodos);

    await user.click(screen.getByRole("button", { name: /^Today/ }));
    expect(screen.getByRole("heading", { level: 1, name: "Today" })).toBeInTheDocument();
    expect(itemTitles(section(/^To do/))).toEqual(["Send the invoice", "Daily standup"]);
    expect(screen.getByRole("button", { name: /^Today/ })).toHaveAttribute("aria-current", "page");

    await user.keyboard("3");
    expect(screen.getByRole("heading", { level: 1, name: "Upcoming" })).toBeInTheDocument();
    expect(itemTitles(section(/^To do/))).toEqual(["Dentist appointment"]);

    await user.keyboard("4");
    expect(itemTitles(section(/^To do/))).toEqual(["Send the invoice"]);
  });

  it("shows list-specific empty states", async () => {
    const { user } = renderApp([]);

    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Upcoming/ }));
    expect(screen.getByText("Nothing planned")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Completed/ }));
    expect(screen.getByText("Nothing completed yet")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "New task" })).not.toBeInTheDocument();
  });

  it("changes the appearance and accent", async () => {
    const { user, store } = renderApp();

    const panel = await openPopover(user, screen.getByRole("button", { name: "Appearance" }));
    await user.click(panel.getByRole("radio", { name: "Light" }));
    await user.click(panel.getByRole("radio", { name: "Forest" }));

    expect(store.getState().settings).toEqual({ appearance: "light", accent: "forest" });
    expect(document.documentElement.dataset).toMatchObject({ appearance: "light", accent: "forest" });
  });
});

describe("Composer", () => {
  it("adds tasks", async () => {
    const { user } = renderApp([]);
    const input = screen.getByRole("textbox", { name: "New task" });
    const submit = screen.getByRole("button", { name: "Add task" });

    expect(submit).toBeDisabled();
    await user.type(input, "   ");
    expect(submit).toBeDisabled();

    await user.clear(input);
    await user.type(input, "  Water   the plants {Enter}");
    await user.type(input, "Feed the cat");
    await user.click(submit);

    expect(input).toHaveValue("");
    expect(itemTitles(section(/^To do/))).toEqual(["Feed the cat", "Water the plants"]);
  });

  it("sets a due date and importance for new tasks", async () => {
    const { user, store } = renderApp([]);

    const picker = await openPopover(user, screen.getByRole("button", { name: "Due date" }));
    await user.click(picker.getByRole("button", { name: /Tomorrow/ }));
    await user.click(screen.getByRole("button", { name: "Important", pressed: false }));
    await user.type(screen.getByRole("textbox", { name: "New task" }), "Renew passport{Enter}");

    expect(selectTodos(store.getState())[0]).toMatchObject({
      title: "Renew passport",
      dueDate: dayFromToday(1),
      important: true,
    });
    expect(within(section(/^To do/)).getByText("Tomorrow", { selector: "p > span" })).toBeInTheDocument();
  });

  it("uses the defaults of the selected list", async () => {
    const { user, store } = renderApp([], "today");

    expect(screen.getByRole("button", { name: "Due date: Today" })).toBeInTheDocument();
    await user.type(screen.getByRole("textbox", { name: "New task" }), "Stretch{Enter}");
    expect(selectTodos(store.getState())[0]?.dueDate).toBe(todayKey());

    await user.click(screen.getByRole("button", { name: "Important (0)" }));
    expect(screen.getByRole("button", { name: "Important", pressed: true })).toBeInTheDocument();
  });

  it("focuses the composer with the N shortcut", async () => {
    const { user } = renderApp();
    await user.keyboard("n");
    expect(screen.getByRole("textbox", { name: "New task" })).toHaveFocus();
  });
});

describe("Tasks", () => {
  it("moves completed tasks between sections", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("checkbox", { name: "Buy milk" }));

    expect(itemTitles(section(/^To do/))).toEqual(["Call grandma"]);
    expect(itemTitles(section(/^Completed/))).toEqual(["Buy milk", "Write the quarterly report"]);
    expect(screen.getByRole("checkbox", { name: "Buy milk" })).toHaveFocus();
  });

  it("edits a task inline", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: "Edit “Buy milk”" }));
    const editor = screen.getByRole("textbox", { name: "Task title" });
    expect(editor).toHaveFocus();

    await user.clear(editor);
    await user.type(editor, "Buy oat milk{Enter}");

    expect(screen.getByRole("button", { name: "Edit “Buy oat milk”" })).toHaveFocus();
  });

  it("cancels editing and keeps the title for blank input", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: "Edit “Call grandma”" }));
    await user.type(screen.getByRole("textbox", { name: "Task title" }), " and grandpa{Escape}");
    expect(screen.getByText("Call grandma")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit “Call grandma”" }));
    await user.clear(screen.getByRole("textbox", { name: "Task title" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByText("Call grandma")).toBeInTheDocument();
  });

  it("marks tasks as important and schedules them", async () => {
    const { user, store } = renderApp();

    await user.click(screen.getByRole("button", { name: "Mark “Buy milk” as important" }));
    expect(screen.getByRole("button", { name: "Mark “Buy milk” as important" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Important (1)" })).toBeInTheDocument();

    const picker = await openPopover(user, screen.getByRole("button", { name: "Set due date for “Buy milk”" }));
    await user.click(picker.getByRole("button", { name: /Next week/ }));
    expect(selectTodos(store.getState())[0]?.dueDate).toBe(dayFromToday(7));

    const again = await openPopover(user, screen.getByRole("button", { name: "Set due date for “Buy milk”" }));
    await user.click(again.getByRole("button", { name: "Remove date" }));
    expect(selectTodos(store.getState())[0]?.dueDate).toBeNull();
  });

  it("removes tasks that leave the current list", async () => {
    const { user } = renderApp(plannedTodos, "important");

    await user.click(screen.getByRole("button", { name: "Mark “Send the invoice” as important" }));
    expect(screen.getByText("No important tasks")).toBeInTheDocument();
  });

  it("deletes a task and restores it with undo", async () => {
    const { user, store } = renderApp();

    await user.click(screen.getByRole("button", { name: "Delete “Buy milk”" }));

    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
    expect(notification()).toHaveTextContent("Deleted “Buy milk”");

    await user.click(screen.getByRole("button", { name: "Undo" }));

    expect(selectTodos(store.getState()).map((todo) => todo.id)).toEqual(["milk", "report", "call"]);
    expect(screen.getByRole("checkbox", { name: "Buy milk" })).toHaveFocus();
  });

  it("supports the undo keyboard shortcut", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: "Delete “Call grandma”" }));
    await user.keyboard("{Control>}z{/Control}");

    expect(screen.getByText("Call grandma")).toBeInTheDocument();
  });

  it("dismisses notifications automatically", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: "Delete “Buy milk”" }));
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(TOAST_DURATION);
    });

    expect(screen.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("collapses and clears the completed section", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: /Completed1/ }));
    expect(screen.queryByRole("checkbox", { name: "Write the quarterly report" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Completed1/ }));
    expect(screen.getByRole("checkbox", { name: "Write the quarterly report" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(notification()).toHaveTextContent("Cleared 1 completed task");
    expect(screen.queryByRole("region", { name: /^Completed/ })).not.toBeInTheDocument();
  });
});

describe("Sorting and search", () => {
  it("sorts tasks and disables manual reordering", async () => {
    const { user } = renderApp(plannedTodos);

    expect(screen.getAllByRole("button", { name: /^Reorder/ })).toHaveLength(4);

    const menu = await openPopover(user, screen.getByRole("button", { name: "Sort tasks: Manual" }));
    await user.click(menu.getByRole("button", { name: "Title A–Z" }));

    expect(itemTitles(section(/^To do/))).toEqual([
      "Daily standup",
      "Dentist appointment",
      "Read a book",
      "Send the invoice",
    ]);
    expect(screen.queryByRole("button", { name: /^Reorder/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sort tasks: Title A–Z" })).toBeInTheDocument();
  });

  it("searches tasks with the slash shortcut", async () => {
    const { user } = renderApp();

    await user.keyboard("/");
    const search = screen.getByRole("searchbox", { name: "Search tasks" });
    expect(search).toHaveFocus();

    await user.type(search, "GRAND");
    expect(itemTitles(section(/^To do/))).toEqual(["Call grandma"]);

    await user.clear(search);
    await user.type(search, "zebra");
    expect(screen.getByText("No results")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(search).toHaveValue("");

    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Show search" })).toHaveFocus();
  });
});

describe("More actions menu", () => {
  it("runs bulk actions", async () => {
    const { user } = renderApp();

    await chooseMenuItem(user, "Complete all");
    expect(screen.queryByRole("region", { name: /^To do/ })).not.toBeInTheDocument();
    expect(screen.getByText("All done")).toBeInTheDocument();

    await chooseMenuItem(user, "Mark all as active");
    expect(screen.queryByRole("region", { name: /^Completed/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("checkbox", { name: "Buy milk" }));
    await chooseMenuItem(user, "Clear completed");
    expect(notification()).toHaveTextContent("Cleared 1 completed task");
    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
  });

  it("exports tasks as a JSON file", async () => {
    const createObjectURL = vi.fn<(blob: Blob) => string>(() => "blob:todos");
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn<(url: string) => void>() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const { user } = renderApp();

    await chooseMenuItem(user, "Export tasks");

    expect(click).toHaveBeenCalledOnce();
    expect(click.mock.contexts[0]).toHaveProperty("download", expect.stringMatching(/^todos-\d{4}-\d{2}-\d{2}\.json$/));

    const blob = createObjectURL.mock.calls[0]?.[0];
    expect(parseTodos(JSON.parse((await blob?.text()) ?? "null"))).toHaveLength(3);
  });

  it("imports tasks from a JSON file", async () => {
    const { user } = renderApp([]);
    const file = new File([JSON.stringify([{ id: "1", text: "Legacy import", isCompleted: false }])], "todos.json", {
      type: "application/json",
    });

    await user.upload(screen.getByLabelText("Import tasks from a JSON file"), file);

    expect(await screen.findByRole("checkbox", { name: "Legacy import" })).toBeInTheDocument();
    expect(notification()).toHaveTextContent("Imported 1 task");
  });
});
