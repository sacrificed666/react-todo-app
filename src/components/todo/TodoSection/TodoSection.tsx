import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useId, type ReactNode } from "react";

import type { Todo } from "@/lib/todo";

import TodoItem from "../TodoItem/TodoItem";

import styles from "./TodoSection.module.scss";

interface TodoSectionProps {
  id: string;
  title: string;
  todos: readonly Todo[];
  hideHeader?: boolean;
  action?: ReactNode;
}

const TodoSection = ({ id, title, todos, hideHeader = false, action }: TodoSectionProps) => {
  const headingId = useId();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={hideHeader ? "visually-hidden" : styles.header}>
        <h2 id={headingId} className={styles.title}>
          {title}
          <span className={styles.count}>{todos.length}</span>
        </h2>
        {action}
      </div>
      <SortableContext id={id} items={todos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
        <ul className={styles.list}>
          {todos.map((todo, index) => (
            <TodoItem key={todo.id} todo={todo} neighborId={(todos[index + 1] ?? todos[index - 1])?.id ?? null} />
          ))}
        </ul>
      </SortableContext>
    </section>
  );
};

export default TodoSection;
