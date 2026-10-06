import { nanoid } from "@reduxjs/toolkit";

import { isEntityId, isRecord } from "@/shared/lib/guards";
import { normalizeLine } from "@/shared/lib/text";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export const MAX_SUBTASKS = 50;
export const MAX_SUBTASK_LENGTH = 200;

const CHECKLIST_ITEM = /^\s*[-*+]\s+\[([ xX])\](?:\s+|$)(.*)$/u;

// A subtask title on one line within the length limit
export const normalizeSubtaskTitle = (value: string) => normalizeLine(value, MAX_SUBTASK_LENGTH);

// A new open subtask
export const createSubtask = (title: string, id: string = nanoid()): Subtask => ({
  id,
  title: normalizeSubtaskTitle(title),
  completed: false,
});

// Valid subtasks from stored or imported data, with unique ids
export const parseSubtasks = (list: readonly unknown[]): Subtask[] => {
  const seen = new Set<string>();
  return list
    .flatMap((entry) => {
      if (!isRecord(entry) || typeof entry.title !== "string") return [];
      const title = normalizeSubtaskTitle(entry.title);
      if (!title) return [];
      const id = typeof entry.id === "string" && isEntityId(entry.id) && !seen.has(entry.id) ? entry.id : nanoid();
      seen.add(id);
      return [{ id, title, completed: entry.completed === true }];
    })
    .slice(0, MAX_SUBTASKS);
};

// Turns the "- [ ] item" lines that older versions kept in notes into subtasks
export const extractChecklist = (notes: string) => {
  const subtasks: Subtask[] = [];
  const rest: string[] = [];
  for (const line of notes.split("\n")) {
    const match = CHECKLIST_ITEM.exec(line);
    const title = normalizeSubtaskTitle(match?.[2] ?? "");
    if (match && title && subtasks.length < MAX_SUBTASKS) {
      subtasks.push({ id: nanoid(), title, completed: match[1] !== " " });
    } else {
      rest.push(line);
    }
  }
  return {
    subtasks,
    notes: rest
      .join("\n")
      .replaceAll(/\n{3,}/gu, "\n\n")
      .trim(),
  };
};

// Done and total subtasks
export const subtaskProgress = (subtasks: readonly Subtask[]) => ({
  done: subtasks.filter((subtask) => subtask.completed).length,
  total: subtasks.length,
});
