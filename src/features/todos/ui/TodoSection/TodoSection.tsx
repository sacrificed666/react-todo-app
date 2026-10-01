import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useId, type ReactNode } from "react";

import Icon from "@/shared/ui/Icon/Icon";

import type { Todo } from "../../model/todo";
import TodoItem from "../TodoItem/TodoItem";

import styles from "./TodoSection.module.scss";

interface TodoSectionProps {
  id: string;
  title: string;
  todos: readonly Todo[];
  sortable: boolean;
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
  tone,
  hideHeader = false,
  hideDueDate = false,
  collapsed = false,
  onToggleCollapsed,
  action,
}: TodoSectionProps) => {
  const headingId = useId();
  const listId = useId();
  const count = <span className={styles.count}>{todos.length}</span>;

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
      <SortableContext id={id} items={todos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
        <ul id={listId} className={styles.list} hidden={collapsed}>
          {collapsed
            ? null
            : todos.map((todo, index) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  sortable={sortable}
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
