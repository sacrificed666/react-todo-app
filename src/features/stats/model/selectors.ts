import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "@/app/store";
import { selectTodos } from "@/features/todos/model/selectors";
import { addDays, toDateKey } from "@/shared/lib/date";

const selectToday = (_state: RootState, today: string) => today;

export const selectActivity = createSelector([selectTodos, selectToday], (todos, today) => {
  const completions = new Map<string, number>();
  for (const todo of todos) {
    if (!todo.completed || todo.completedAt === null) continue;
    const day = toDateKey(new Date(todo.completedAt));
    completions.set(day, (completions.get(day) ?? 0) + 1);
  }

  const days = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(today, index - 6);
    return { day, count: completions.get(day) ?? 0 };
  });

  let streak = 0;
  let cursor = completions.has(today) ? today : addDays(today, -1);
  while ((completions.get(cursor) ?? 0) > 0) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return { days, streak };
});
