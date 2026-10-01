const ITEM = /^(\s*[-*+]\s+\[)([ xX])(\](?:\s+|$))(.*)$/u;

export interface ChecklistItem {
  line: number;
  text: string;
  done: boolean;
}

export const parseChecklist = (notes: string): ChecklistItem[] =>
  notes.split("\n").flatMap((line, index) => {
    const match = ITEM.exec(line);
    const text = match?.[4]?.trim() ?? "";
    return match && text ? [{ line: index, text, done: match[2] !== " " }] : [];
  });

export const checklistProgress = (notes: string) => {
  const items = parseChecklist(notes);
  return { done: items.filter((item) => item.done).length, total: items.length };
};

export const toggleChecklistItem = (notes: string, line: number) =>
  notes
    .split("\n")
    .map((text, index) =>
      index === line
        ? text.replace(ITEM, (_match, start: string, mark: string, end: string, rest: string) =>
            [start, mark === " " ? "x" : " ", end, rest].join(""),
          )
        : text,
    )
    .join("\n");
