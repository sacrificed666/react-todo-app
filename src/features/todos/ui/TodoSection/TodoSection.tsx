import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { startTransition, useEffect, useId, useMemo, useState, type ReactNode } from "react";

import Icon from "@/shared/ui/Icon/Icon";

import type { Todo } from "../../model/todo";
import TodoItem from "../TodoItem/TodoItem";

import styles from "./TodoSection.module.scss";

const FIRST_CHUNK = 120;

interface TodoSectionProps {
  id: string;
  title: string;
  todos: readonly Todo[];
  sortable: boolean;
  coarse: boolean;
  viewProjectId: string | null;
  tone?: "overdue";
  hideHeader?: boolean;
  hideDueDate?: boolean;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  action?: ReactNode;
}

const TodoSection = ({
  id,
  title,
  todos,
  sortable,
  coarse,
  viewProjectId,
  tone,
  hideHeader = false,
  hideDueDate = false,
  collapsed = false,
  onToggleCollapsed,
  action,
}: TodoSectionProps) => {
  const headingId = useId();
  const listId = useId();
  const [limit, setLimit] = useState(FIRST_CHUNK);
  const idsKey = todos.map((todo) => todo.id).join("\n");
  const ids = useMemo(() => (idsKey === "" ? [] : idsKey.split("\n")), [idsKey]);
  const shown = todos.length > limit ? todos.slice(0, limit) : todos;
  const count = <span className={styles.count}>{todos.length}</span>;

  useEffect(() => {
    if (todos.length <= limit) return;
    const timer = setTimeout(() => startTransition(() => setLimit(Number.POSITIVE_INFINITY)));
    return () => clearTimeout(timer);
  }, [todos.length, limit]);

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={hideHeader ? "visually-hidden" : styles.header} data-tone={tone}>
        <h2 id={headingId} className={styles.title}>
          {onToggleCollapsed ? (
            <button
              type="button"
              className={styles.toggle}
              aria-expanded={!collapsed}
              aria-controls={listId}
              onClick={onToggleCollapsed}
            >
              <Icon name="chevronDown" className={styles.chevron} />
              {title}
              {count}
            </button>
          ) : (
            <>
              {title}
              {count}
            </>
          )}
        </h2>
        {action}
      </div>
      <SortableContext id={id} items={ids} strategy={verticalListSortingStrategy}>
        <ul id={listId} className={styles.list} hidden={collapsed}>
          {collapsed
            ? null
            : shown.map((todo, index) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  sortable={sortable}
                  coarse={coarse}
                  viewProjectId={viewProjectId}
                  hideDueDate={hideDueDate}
                  previousId={todos[index - 1]?.id ?? null}
                  nextId={todos[index + 1]?.id ?? null}
                />
              ))}
        </ul>
      </SortableContext>
    </section>
  );
};

export default TodoSection;
