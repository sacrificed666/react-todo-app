import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { selectTodos } from "@/features/todos/model/selectors";
import { dayFromToday, makeTodo, sampleTodos } from "@/test/factories";
import { itemTitles, renderApp, section } from "@/test/render";

const swipe = (row: Element, distance: number) => {
  fireEvent.pointerDown(row, { pointerId: 1, pointerType: "touch", isPrimary: true, clientX: 200, clientY: 20 });
  fireEvent.pointerMove(row, { pointerId: 1, pointerType: "touch", clientX: 200 + distance / 2, clientY: 22 });
  fireEvent.pointerMove(row, { pointerId: 1, pointerType: "touch", clientX: 200 + distance, clientY: 24 });
  fireEvent.pointerUp(row, { pointerId: 1, pointerType: "touch", clientX: 200 + distance, clientY: 24 });
};

const rowOf = (title: string) => {
  const row = screen.getByRole("checkbox", { name: title }).parentElement;
  if (!row) throw new Error(`Row for ${title} not found`);
  return row;
};

describe("TodoItem keyboard", () => {
  it("moves focus between tasks with the arrow keys", async () => {
    const { user } = renderApp();

    screen.getByRole("checkbox", { name: "Buy milk" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("checkbox", { name: "Call grandma" })).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("checkbox", { name: "Write the quarterly report" })).toHaveFocus();

    await user.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}");
    expect(screen.getByRole("checkbox", { name: "Buy milk" })).toHaveFocus();
  });

  it("stars, edits, opens details and deletes with single keys", async () => {
    const { user, store } = renderApp();

    screen.getByRole("checkbox", { name: "Call grandma" }).focus();
    await user.keyboard("s");
    expect(selectTodos(store.getState()).find((todo) => todo.id === "call")?.important).toBe(true);

    await user.keyboard("e");
    expect(screen.getByRole("textbox", { name: "Task title" })).toHaveFocus();
    await user.keyboard("{Escape}");

    await user.keyboard("i");
    expect(screen.getByRole("dialog", { name: "Task details" })).toBeInTheDocument();
    await user.keyboard("{Escape}");

    screen.getByRole("checkbox", { name: "Call grandma" }).focus();
    await user.keyboard("{Delete}");
    expect(screen.queryByRole("checkbox", { name: "Call grandma" })).not.toBeInTheDocument();
  });

  it("opens the due date picker with D", async () => {
    const { user } = renderApp();

    screen.getByRole("checkbox", { name: "Buy milk" }).focus();
    await user.keyboard("d");

    const trigger = screen.getByRole("button", { name: "Set due date for “Buy milk”" });
    const popover = document.getElementById(trigger.getAttribute("popovertarget") ?? "");
    expect(popover?.style.display).toBe("block");
  });

  it("reorders tasks with Alt and the arrow keys", async () => {
    const { user } = renderApp();

    screen.getByRole("checkbox", { name: "Buy milk" }).focus();
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");

    expect(itemTitles(section(/^To do/))).toEqual(["Call grandma", "Buy milk"]);
    expect(screen.getByRole("checkbox", { name: "Buy milk" })).toHaveFocus();

    await user.keyboard("{Alt>}{ArrowUp}{/Alt}");
    expect(itemTitles(section(/^To do/))).toEqual(["Buy milk", "Call grandma"]);
  });
});

describe("TodoItem content", () => {
  it("shows tags as filters and hints at notes and subtasks", async () => {
    const { user, store } = renderApp([
      makeTodo({ id: "slides", title: "Prepare slides #work #q4", dueDate: dayFromToday(1) }),
      makeTodo({ id: "trip", title: "Trip", notes: "- [x] Tickets\n- [ ] Hotel" }),
      makeTodo({ id: "call", title: "Call the bank", notes: "Ask about fees" }),
    ]);

    expect(screen.getByRole("button", { name: "Edit “Prepare slides #work #q4”" })).toHaveTextContent(
      /^Prepare slides$/,
    );
    expect(screen.getByText("1 of 2 subtasks")).toBeInTheDocument();
    expect(screen.getByText("Has notes")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show tasks tagged #work" }));
    expect(store.getState().view.query).toBe("#work");
    expect(itemTitles(section(/^To do/))).toEqual(["Prepare slides #work #q4"]);
  });

  it("finds tasks by their notes", async () => {
    const { user } = renderApp([makeTodo({ id: "trip", title: "Trip", notes: "Book the hotel" }), ...sampleTodos]);

    await user.keyboard("/");
    await user.type(screen.getByRole("searchbox", { name: "Search tasks" }), "hotel");
    expect(itemTitles(section(/^To do/))).toEqual(["Trip"]);
  });
});

describe("TodoItem swipes", () => {
  it("completes a task when swiped right", () => {
    const { store } = renderApp();

    swipe(rowOf("Buy milk"), 160);

    expect(selectTodos(store.getState()).find((todo) => todo.id === "milk")?.completed).toBe(true);
  });

  it("deletes a task when swiped left", () => {
    const { store } = renderApp();

    swipe(rowOf("Call grandma"), -160);

    expect(selectTodos(store.getState()).map((todo) => todo.id)).toEqual(["milk", "report"]);
    expect(screen.getByRole("status", { name: "Notification" })).toHaveTextContent("Deleted “Call grandma”");
  });

  it("ignores short swipes, vertical scrolls and mouse drags", () => {
    const { store } = renderApp();
    const row = rowOf("Buy milk");

    swipe(row, 40);
    fireEvent.pointerDown(row, { pointerId: 2, pointerType: "touch", isPrimary: true, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(row, { pointerId: 2, pointerType: "touch", clientX: 14, clientY: 80 });
    fireEvent.pointerMove(row, { pointerId: 2, pointerType: "touch", clientX: 200, clientY: 90 });
    fireEvent.pointerUp(row, { pointerId: 2, pointerType: "touch", clientX: 200, clientY: 90 });
    fireEvent.pointerDown(row, { pointerId: 3, pointerType: "mouse", isPrimary: true, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(row, { pointerId: 3, pointerType: "mouse", clientX: 200, clientY: 10 });
    fireEvent.pointerUp(row, { pointerId: 3, pointerType: "mouse", clientX: 200, clientY: 10 });
    fireEvent.pointerDown(row, { pointerId: 4, pointerType: "touch", isPrimary: true, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(row, { pointerId: 4, pointerType: "touch", clientX: 200, clientY: 10 });
    fireEvent.pointerCancel(row, { pointerId: 4, pointerType: "touch" });

    expect(selectTodos(store.getState())).toEqual(sampleTodos);
    expect(row.closest("li")?.dataset.swipe).toBeUndefined();
  });
});
