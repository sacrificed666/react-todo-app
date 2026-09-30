import type { Todo } from "@/lib/todo";
import { todosAdapter } from "@/store/slices/todosSlice";
import type { Filter } from "@/store/slices/viewSlice";
import type { RootState } from "@/store/store";

export const makeTodo = (overrides: Partial<Todo> & Pick<Todo, "id" | "title">): Todo => ({
  completed: false,
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
  completedAt: null,
  ...overrides,
});

export const makeState = (todos: readonly Todo[], filter: Filter = "all", query = ""): Partial<RootState> => ({
  todos: todosAdapter.setAll(todosAdapter.getInitialState(), todos),
  view: { filter, query },
});

export const sampleTodos = [
  makeTodo({ id: "milk", title: "Buy milk" }),
  makeTodo({ id: "report", title: "Write the quarterly report", completed: true, completedAt: 1_700_000_100_000 }),
  makeTodo({ id: "call", title: "Call grandma" }),
];
