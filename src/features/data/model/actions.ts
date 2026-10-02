import { createAction } from "@reduxjs/toolkit";

import type { Project } from "@/features/projects/model/project";
import type { Todo } from "@/features/todos/model/todo";

export interface DataSnapshot {
  todos: readonly Todo[];
  projects: readonly Project[];
}

export const dataReplaced = createAction<DataSnapshot>("data/replaced");
export const dataImported = createAction<DataSnapshot>("data/imported");
