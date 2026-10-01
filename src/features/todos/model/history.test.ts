import { describe, expect, it } from "vitest";

import { setupStore } from "@/app/store";
import { listChanged } from "@/features/lists/model/viewSlice";
import { makeState, makeTodo, sampleTodos } from "@/test/factories";

import { describeChange, HISTORY_LIMIT, redone, undone } from "./history";
import { selectTodos } from "./selectors";
import {
  allTodosMarked,
  todoAdded,
  todoDuplicated,
  todoImportanceToggled,
  todoMoved,
  todoNoted,
  todoRenamed,
  todoScheduled,
  todosImported,
  todosRemoved,
  todosReplaced,
  todosRestored,
  todoToggled,
} from "./todosSlice";

const titles = (store: ReturnType<typeof setupStore>) => selectTodos(store.getState()).map((todo) => todo.title);

describe("withHistory", () => {
  it("records only actions that change the todos", () => {
    const store = setupStore(makeState(sampleTodos));

    store.dispatch(listChanged("today"));
    store.dispatch(todoRenamed("milk", "Buy milk"));
    expect(store.getState().history.past).toHaveLength(0);

    store.dispatch(todoRenamed("milk", "Buy oat milk"));
    expect(store.getState().history.past).toEqual([
      { todos: expect.objectContaining({ ids: ["milk", "report", "call"] }), description: expect.any(Object) },
    ]);
  });

  it("undoes and redoes, and a new change clears the redo stack", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(todoRenamed("milk", "Buy oat milk"));
    store.dispatch(todoRenamed("call", "Call grandpa"));

    store.dispatch(undone());
    store.dispatch(undone());
    expect(titles(store)).toEqual(["Buy milk", "Write the quarterly report", "Call grandma"]);
    store.dispatch(undone());
    expect(store.getState().history.future).toHaveLength(2);

    store.dispatch(redone());
    expect(titles(store)).toEqual(["Buy oat milk", "Write the quarterly report", "Call grandma"]);

    store.dispatch(todoImportanceToggled("call"));
    expect(store.getState().history.future).toEqual([]);
    store.dispatch(redone());
    expect(titles(store)[2]).toBe("Call grandma");
  });

  it("keeps a limited number of steps", () => {
    const store = setupStore(makeState(sampleTodos));
    for (let index = 0; index < HISTORY_LIMIT + 5; index += 1) store.dispatch(todoRenamed("milk", `Milk ${index}`));
    expect(store.getState().history.past).toHaveLength(HISTORY_LIMIT);
  });

  it("forgets the history when another tab replaces the todos", () => {
    const store = setupStore(makeState(sampleTodos));
    store.dispatch(todoRenamed("milk", "Buy oat milk"));
    store.dispatch(todosReplaced([makeTodo({ id: "remote", title: "Remote" })]));

    expect(store.getState().history).toEqual({ past: [], future: [] });
    store.dispatch(undone());
    expect(titles(store)).toEqual(["Remote"]);
  });
});

describe("describeChange", () => {
  const before = setupStore(makeState(sampleTodos)).getState().todos;
  const report = sampleTodos[1];

  it("names the task for single-task actions", () => {
    expect(describeChange(todoAdded({ title: "New" }), before)).toMatchObject({
      key: "history.added",
      params: { title: "New" },
    });
    expect(describeChange(todoDuplicated("milk"), before).key).toBe("history.duplicated");
    expect(describeChange(todoToggled("milk"), before).key).toBe("history.completed");
    expect(describeChange(todoToggled("report"), before)).toEqual({
      key: "history.reopened",
      params: { title: report?.title },
    });
    expect(describeChange(todoRenamed("milk", "x"), before).key).toBe("history.renamed");
    expect(describeChange(todoImportanceToggled("milk"), before).key).toBe("history.starred");
    expect(describeChange(todoScheduled("milk", null), before).key).toBe("history.scheduled");
    expect(describeChange(todoNoted("milk", "x"), before).key).toBe("history.noted");
  });

  it("describes bulk actions", () => {
    expect(describeChange(todoMoved({ activeId: "milk", overId: "call" }), before).key).toBe("history.moved");
    expect(describeChange(allTodosMarked(true), before).key).toBe("history.markedAll");
    expect(describeChange(todosRemoved(["milk", "call"]), before)).toEqual({
      key: "history.removed",
      params: { count: 2 },
    });
    expect(describeChange(todosRestored([]), before).key).toBe("history.restored");
    expect(describeChange(todosImported([]), before).key).toBe("history.imported");
    expect(describeChange(listChanged("today"), before).key).toBe("history.changed");
  });
});
