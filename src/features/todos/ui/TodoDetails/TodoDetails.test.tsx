import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { selectTodos } from "@/features/todos/model/selectors";
import { makeTodo, sampleTodos } from "@/test/factories";
import { openPopover, renderApp } from "@/test/render";

const details = () => screen.getByRole("dialog", { name: "Task details" });

describe("TodoDetails", () => {
  it("edits the title and notes and shows checklist progress", async () => {
    const { user, store } = renderApp();

    await user.click(screen.getByRole("button", { name: "Details for “Buy milk”" }));
    const dialog = within(details());
    expect(dialog.getByText(/^Created /)).toBeInTheDocument();

    const title = dialog.getByRole("textbox", { name: "Title" });
    await user.clear(title);
    await user.type(title, "Buy oat milk{Enter}");

    const notes = dialog.getByRole("textbox", { name: "Notes" });
    await user.type(notes, "From the market{Enter}- [[ ] Oat milk{Enter}- [[x] Bread");
    await user.tab();

    expect(selectTodos(store.getState())[0]).toMatchObject({
      title: "Buy oat milk",
      notes: "From the market\n- [ ] Oat milk\n- [x] Bread",
    });

    await user.click(dialog.getByRole("checkbox", { name: "Oat milk" }));
    expect(selectTodos(store.getState())[0]?.notes).toBe("From the market\n- [x] Oat milk\n- [x] Bread");
    expect(dialog.getByText(/^Updated /)).toBeInTheDocument();

    await user.click(dialog.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog", { name: "Task details" })).not.toBeInTheDocument();
    expect(screen.getByText("2 of 2 subtasks")).toBeInTheDocument();
  });

  it("completes, stars and schedules the task", async () => {
    const { user, store } = renderApp();

    await user.click(screen.getByRole("button", { name: "Details for “Call grandma”" }));
    const dialog = within(details());

    await user.click(dialog.getByRole("button", { name: "Important", pressed: false }));
    const picker = await openPopover(user, dialog.getByRole("button", { name: "Due date" }));
    await user.click(picker.getByRole("button", { name: /Tomorrow/ }));
    await user.click(dialog.getByRole("checkbox", { name: "Completed" }));

    expect(selectTodos(store.getState()).find((todo) => todo.id === "call")).toMatchObject({
      important: true,
      completed: true,
    });
    expect(dialog.getByText(/^Completed /)).toBeInTheDocument();
    expect(dialog.getByRole("button", { name: /^Due date: / })).toBeInTheDocument();
  });

  it("duplicates and deletes tasks", async () => {
    const { user, store } = renderApp();

    await user.click(screen.getByRole("button", { name: "Details for “Buy milk”" }));
    await user.click(within(details()).getByRole("button", { name: "Duplicate" }));
    expect(selectTodos(store.getState()).map((todo) => todo.title)).toEqual([
      "Buy milk",
      "Buy milk",
      "Write the quarterly report",
      "Call grandma",
    ]);
    expect(screen.getByRole("status", { name: "Notification" })).toHaveTextContent("Duplicated “Buy milk”");

    await user.click(screen.getByRole("button", { name: "Details for “Call grandma”" }));
    await user.click(within(details()).getByRole("button", { name: "Delete" }));
    expect(screen.queryByText("Call grandma")).not.toBeInTheDocument();
    expect(screen.getByRole("status", { name: "Notification" })).toHaveTextContent("Deleted “Call grandma”");
  });

  it("filters by a tag and closes with Escape", async () => {
    const { user, store } = renderApp([...sampleTodos, makeTodo({ id: "tagged", title: "Prepare slides #work" })]);

    await user.click(screen.getByRole("button", { name: "Details for “Prepare slides #work”" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Task details" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Details for “Prepare slides #work”" }));
    await user.click(within(details()).getByRole("button", { name: "work" }));
    expect(store.getState().view).toMatchObject({ query: "#work", detailsId: null });
  });
});
