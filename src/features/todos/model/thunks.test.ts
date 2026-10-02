import { describe, expect, it } from "vitest";

import { setupStore } from "@/app/store";
import { undo } from "@/features/data/model/thunks";
import { createTranslator } from "@/features/i18n/model/translate";
import { queryChanged } from "@/features/lists/model/viewSlice";
import { formatMessage } from "@/features/notifications/model/format";
import { selectToast } from "@/features/notifications/model/selectors";
import { dayFromToday, makeProject, makeState, makeTodo, sampleTodos, todayKey } from "@/test/factories";

import { selectTodos } from "./selectors";
import {
  addTodo,
  clearCompleted,
  dropTodo,
  duplicateTodo,
  homeListOf,
  homeViewOf,
  rescheduleOverdue,
  removeTodos,
  toggleTodo,
  undoRemoval,
} from "./thunks";

type Store = ReturnType<typeof setupStore>;

const titles = (store: Store) => selectTodos(store.getState()).map((todo) => todo.title);

const toastText = (store: Store, locale: "en" | "uk" = "en") => {
  const toast = selectToast(store.getState());
  return toast ? formatMessage(createTranslator(locale), toast.message) : null;
};

describe("addTodo", () => {
  it("adds normalized todos and reports success", () => {
    const store = setupStore();
    expect(store.dispatch(addTodo({ title: "  Plan   the trip ", important: true }))).toBe(true);
    expect(selectTodos(store.getState())[0]).toMatchObject({ title: "Plan the trip", important: true });
  });

  it("rejects blank titles", () => {
    const store = setupStore();
    expect(store.dispatch(addTodo({ title: "   " }))).toBe(false);
    expect(titles(store)).toEqual([]);
  });

  it("stays in the list and offers to show a task added elsewhere", () => {
    const store = setupStore(makeState(sampleTodos, "today", "report"));
    store.dispatch(addTodo({ title: "Buy flowers", dueDate: dayFromToday(3) }));

    expect(store.getState().view).toMatchObject({ list: "today", query: "" });
    expect(selectToast(store.getState())).toMatchObject({
      message: { key: "toast.addedTo", params: { title: "Buy flowers", list: { key: "lists.upcoming" } } },
      action: { type: "show", list: "upcoming" },
    });
    expect(toastText(store)).toBe("Added “Buy flowers” to Upcoming");
  });

  it("picks the list a new task belongs to", () => {
    const today = todayKey();
    expect(homeListOf(makeTodo({ id: "a", title: "a", dueDate: today }), today)).toBe("today");
    expect(homeListOf(makeTodo({ id: "b", title: "b", dueDate: dayFromToday(-2) }), today)).toBe("today");
    expect(homeListOf(makeTodo({ id: "c", title: "c", dueDate: dayFromToday(2) }), today)).toBe("upcoming");
    expect(homeListOf(makeTodo({ id: "d", title: "d", important: true }), today)).toBe("important");
    expect(homeListOf(makeTodo({ id: "e", title: "e" }), today)).toBe("all");
  });

  it("names the project a task was added to", () => {
    const store = setupStore(makeState([], "today", "", [makeProject({ id: "work", name: "💼 Work" })]));
    store.dispatch(addTodo({ title: "Slides", projectId: "work" }));

    expect(selectToast(store.getState())).toMatchObject({
      message: { params: { list: "💼 Work" } },
      action: { type: "show", list: "project:work" },
    });
    expect(toastText(store)).toBe("Added “Slides” to 💼 Work");
  });

  it("prefers the project over a smart list as the home of a task", () => {
    const today = todayKey();
    expect(homeViewOf(makeTodo({ id: "a", title: "a", dueDate: today, projectId: "work" }), today)).toBe(
      "project:work",
    );
    expect(homeViewOf(makeTodo({ id: "b", title: "b", important: true }), today)).toBe("important");
  });

  it("stays in the current list when the new todo belongs there", () => {
    const store = setupStore(makeState([], "upcoming"));
    store.dispatch(queryChanged("flow"));
    store.dispatch(addTodo({ title: "Buy flowers", dueDate: dayFromToday(2) }));
    expect(store.getState().view).toMatchObject({ list: "upcoming", query: "flow" });
  });
});

describe("removal and undo", () => {
  it("removes todos and offers to undo", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(removeTodos(["call", "milk"]));

    expect(titles(store)).toEqual(["Write the quarterly report"]);
    expect(selectToast(store.getState())).toMatchObject({
      message: { key: "toast.deletedMany", params: { count: 2 } },
      tone: "neutral",
      action: { type: "restore" },
    });
    expect(toastText(store)).toBe("Deleted 2 tasks");
    expect(toastText(store, "uk")).toBe("Видалено 2 завдання");

    store.dispatch(undoRemoval());
    expect(titles(store)).toEqual(["Buy milk", "Write the quarterly report", "Call grandma"]);
    expect(selectToast(store.getState())).toBeNull();
  });

  it("names a single deleted todo", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(removeTodos(["milk"]));
    expect(toastText(store)).toBe("Deleted “Buy milk”");
    expect(toastText(store, "uk")).toBe("Видалено «Buy milk»");
  });

  it("ignores unknown ids", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(removeTodos(["missing"]));
    expect(selectToast(store.getState())).toBeNull();
    store.dispatch(undoRemoval());
    expect(titles(store)).toHaveLength(3);
  });

  it("clears completed todos", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(clearCompleted());
    expect(titles(store)).toEqual(["Buy milk", "Call grandma"]);
    expect(toastText(store)).toBe("Cleared 1 completed task");
  });
});

describe("toggleTodo", () => {
  it("celebrates when the last active task of a list is completed", () => {
    const today = todayKey();
    const store = setupStore(
      makeState(
        [
          makeTodo({ id: "a", title: "First", dueDate: today }),
          makeTodo({ id: "b", title: "Second", dueDate: today }),
          makeTodo({ id: "c", title: "Later" }),
        ],
        "today",
      ),
    );

    expect(store.dispatch(toggleTodo("a", today))).toBe(false);
    expect(selectToast(store.getState())).toBeNull();

    expect(store.dispatch(toggleTodo("b", today))).toBe(true);
    expect(selectToast(store.getState())?.tone).toBe("success");
    expect(toastText(store)).toBe("Everything in Today is done!");
    expect(toastText(store, "uk")).toBe("У списку «Сьогодні» усе виконано!");
  });

  it("does not celebrate reopening or the completed list", () => {
    const today = todayKey();
    const store = setupStore(makeState(sampleTodos, "completed"));
    expect(store.dispatch(toggleTodo("report", today))).toBe(false);
    expect(store.dispatch(toggleTodo("report", today))).toBe(false);
    expect(selectToast(store.getState())).toBeNull();
  });
});

describe("duplicateTodo", () => {
  it("inserts an active copy after the original", () => {
    const store = setupStore(makeState(sampleTodos));
    const copyId = store.dispatch(duplicateTodo("report"));

    const todos = selectTodos(store.getState());
    expect(todos.map((todo) => todo.title)).toEqual([
      "Buy milk",
      "Write the quarterly report",
      "Write the quarterly report",
      "Call grandma",
    ]);
    expect(todos[2]).toMatchObject({ id: copyId, completed: false, completedAt: null });
    expect(toastText(store)).toBe("Duplicated “Write the quarterly report”");
  });

  it("ignores unknown ids", () => {
    const store = setupStore(makeState(sampleTodos));
    expect(store.dispatch(duplicateTodo("missing"))).toBeNull();
    expect(titles(store)).toHaveLength(3);
  });
});

describe("rescheduleOverdue", () => {
  it("moves every overdue task to today in one undoable step", () => {
    const today = todayKey();
    const store = setupStore(
      makeState([
        makeTodo({ id: "late", title: "Late", dueDate: dayFromToday(-3) }),
        makeTodo({ id: "later", title: "Later", dueDate: dayFromToday(-1) }),
        makeTodo({ id: "done", title: "Done", dueDate: dayFromToday(-1), completed: true, completedAt: 1 }),
        makeTodo({ id: "future", title: "Future", dueDate: dayFromToday(2) }),
      ]),
    );

    expect(store.dispatch(rescheduleOverdue(today))).toBe(2);
    expect(selectTodos(store.getState()).map((todo) => todo.dueDate)).toEqual([
      today,
      today,
      dayFromToday(-1),
      dayFromToday(2),
    ]);
    expect(toastText(store)).toBe("Moved 2 tasks to today");
    expect(selectToast(store.getState())?.action).toEqual({ type: "undo" });

    store.dispatch(undo());
    expect(selectTodos(store.getState())[0]?.dueDate).toBe(dayFromToday(-3));
    expect(store.dispatch(rescheduleOverdue(dayFromToday(-10)))).toBe(0);
  });
});

describe("dropTodo", () => {
  it("applies the meaning of the list a task was dropped on", () => {
    const today = todayKey();
    const store = setupStore(
      makeState(
        [makeTodo({ id: "a", title: "Slides" }), makeTodo({ id: "b", title: "Later", dueDate: dayFromToday(5) })],
        "all",
        "",
        [makeProject({ id: "work", name: "Work" })],
      ),
    );
    const todo = (id: string) => selectTodos(store.getState()).find((entry) => entry.id === id);

    expect(store.dispatch(dropTodo("a", "today", today))).toBe(true);
    expect(todo("a")?.dueDate).toBe(today);
    expect(toastText(store)).toBe("Moved “Slides” to Today");

    store.dispatch(dropTodo("a", "upcoming", today));
    expect(todo("a")?.dueDate).toBe(dayFromToday(1));
    expect(store.dispatch(dropTodo("b", "upcoming", today))).toBe(false);

    store.dispatch(dropTodo("a", "important", today));
    expect(todo("a")?.important).toBe(true);
    expect(store.dispatch(dropTodo("a", "important", today))).toBe(false);

    store.dispatch(dropTodo("a", "project:work", today));
    expect(todo("a")?.projectId).toBe("work");
    expect(toastText(store)).toBe("Moved “Slides” to Work");

    store.dispatch(dropTodo("a", "completed", today));
    expect(todo("a")?.completed).toBe(true);
    expect(selectToast(store.getState())?.action).toEqual({ type: "undo" });
    expect(store.dispatch(dropTodo("missing", "today", today))).toBe(false);
  });
});
