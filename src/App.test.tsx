import { act, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TOAST_DURATION } from "@/components/feedback/Toaster/Toaster";
import { parseTodos } from "@/lib/todo";
import { selectTodos } from "@/store/selectors";
import { makeState, sampleTodos } from "@/test/factories";
import { renderWithStore } from "@/test/render";

import App from "./App";

const renderApp = (todos = sampleTodos) => renderWithStore(<App />, { preloadedState: makeState(todos) });

const section = (name: RegExp) => screen.getByRole("region", { name });

const notification = () => screen.getByRole("status", { name: "Notification" });

const chooseMenuItem = async (user: ReturnType<typeof renderApp>["user"], name: string) => {
  await user.click(screen.getByRole("button", { name: "More actions" }));
  await user.click(screen.getByRole("button", { name }));
  expect(screen.queryByRole("button", { name })).not.toBeInTheDocument();
};

const itemTitles = (region: HTMLElement) =>
  within(region)
    .queryAllByRole("checkbox")
    .map((checkbox) => checkbox.getAttribute("aria-label"));

describe("App", () => {
  it("renders the header with progress", () => {
    renderApp();
    expect(screen.getByRole("heading", { level: 1, name: "ToDo" })).toBeInTheDocument();
    expect(screen.getByText("1 of 3 tasks completed")).toBeInTheDocument();
  });

  it("adds tasks from the composer", async () => {
    const { user } = renderApp([]);
    const input = screen.getByRole("textbox", { name: "New task" });
    const submit = screen.getByRole("button", { name: "Add task" });

    expect(screen.getByText("No tasks yet")).toBeInTheDocument();
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

  it("moves completed tasks between sections", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("checkbox", { name: "Buy milk" }));

    expect(itemTitles(section(/^To do/))).toEqual(["Call grandma"]);
    expect(itemTitles(section(/^Completed/))).toEqual(["Buy milk", "Write the quarterly report"]);
    expect(screen.getByRole("checkbox", { name: "Buy milk" })).toHaveFocus();

    await user.click(screen.getByRole("checkbox", { name: "Write the quarterly report" }));
    expect(itemTitles(section(/^To do/))).toEqual(["Write the quarterly report", "Call grandma"]);
  });

  it("edits a task inline", async () => {
    const { user } = renderApp();

    await user.dblClick(screen.getByText("Buy milk"));
    const editor = screen.getByRole("textbox", { name: "Task title" });
    expect(editor).toHaveFocus();

    await user.clear(editor);
    await user.type(editor, "Buy oat milk{Enter}");

    expect(screen.getByText("Buy oat milk")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit “Buy oat milk”" })).toHaveFocus();
  });

  it("cancels editing with Escape and keeps the original title for blank input", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("button", { name: "Edit “Call grandma”" }));
    await user.type(screen.getByRole("textbox", { name: "Task title" }), " and grandpa{Escape}");
    expect(screen.getByText("Call grandma")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Edit “Call grandma”" }));
    await user.clear(screen.getByRole("textbox", { name: "Task title" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(screen.getByText("Call grandma")).toBeInTheDocument();
  });

  it("deletes a task and restores it with undo", async () => {
    const { user, store } = renderApp();

    await user.click(screen.getByRole("button", { name: "Delete “Buy milk”" }));

    expect(screen.queryByText("Buy milk")).not.toBeInTheDocument();
    expect(notification()).toHaveTextContent("Deleted “Buy milk”");

    await user.click(screen.getByRole("button", { name: "Undo" }));

    expect(selectTodos(store.getState()).map((todo) => todo.id)).toEqual(["milk", "report", "call"]);
    expect(screen.getByRole("checkbox", { name: "Buy milk" })).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
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

  it("filters tasks by status", async () => {
    const { user } = renderApp();

    await user.click(screen.getByRole("radio", { name: /Active/ }));
    expect(screen.queryByRole("region", { name: /^Completed/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /Done/ }));
    expect(screen.queryByRole("region", { name: /^To do/ })).not.toBeInTheDocument();
    expect(itemTitles(section(/^Completed/))).toEqual(["Write the quarterly report"]);

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByText("Nothing completed yet")).toBeInTheDocument();
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
    expect(screen.getByRole("button", { name: "Search" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Search" })).toHaveAttribute("aria-expanded", "false");
  });

  it("focuses the composer with the N shortcut", async () => {
    const { user } = renderApp();
    await user.keyboard("n");
    expect(screen.getByRole("textbox", { name: "New task" })).toHaveFocus();
  });

  it("runs bulk actions from the menu", async () => {
    const { user } = renderApp();

    await chooseMenuItem(user, "Complete all");
    expect(screen.queryByRole("region", { name: /^To do/ })).not.toBeInTheDocument();
    expect(screen.getByText("3 of 3 tasks completed")).toBeInTheDocument();

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
