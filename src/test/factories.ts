import type { RootState } from "@/app/store";
import type { ListId } from "@/features/lists/model/lists";
import { initialViewState } from "@/features/lists/model/viewSlice";
import type { Todo } from "@/features/todos/model/todo";
import { todosAdapter } from "@/features/todos/model/todosSlice";
import { addDays, toDateKey } from "@/shared/lib/date";

export const todayKey = () => toDateKey(new Date());

export const dayFromToday = (offset: number) => addDays(todayKey(), offset);

export const makeTodo = (overrides: Partial<Todo> & Pick<Todo, "id" | "title">): Todo => ({
  completed: false,
  important: false,
  dueDate: null,
  repeat: null,
  notes: "",
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
  completedAt: null,
  ...overrides,
});

export const makeState = (todos: readonly Todo[], list: ListId = "all", query = ""): Partial<RootState> => ({
  todos: todosAdapter.setAll(todosAdapter.getInitialState(), todos),
  view: { ...initialViewState, list, query },
});

export const sampleTodos = [
  makeTodo({ id: "milk", title: "Buy milk" }),
  makeTodo({ id: "report", title: "Write the quarterly report", completed: true, completedAt: 1_700_000_100_000 }),
  makeTodo({ id: "call", title: "Call grandma" }),
];
