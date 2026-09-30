import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from "react";
import { flushSync } from "react-dom";

import Icon from "@/components/ui/Icon/Icon";
import IconButton from "@/components/ui/IconButton/IconButton";
import { useToday } from "@/hooks/useToday";
import { cx } from "@/lib/cx";
import { describeDueDate } from "@/lib/date";
import { matchesList } from "@/lib/lists";
import { prefersReducedMotion, waitForTransitions } from "@/lib/motion";
import { MAX_TITLE_LENGTH, type Todo } from "@/lib/todo";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectList } from "@/store/selectors";
import { todoImportanceToggled, todoRenamed, todoScheduled, todoToggled } from "@/store/slices/todosSlice";
import { removeTodos } from "@/store/thunks";

import DuePicker from "../DuePicker/DuePicker";
import { COMPOSER_INPUT_ID, toggleId } from "../ids";

import styles from "./TodoItem.module.scss";

const TOGGLE_DELAY = 420;

const focusFirst = (...ids: Array<string | null>) => {
  for (const id of ids) {
    const element = id === null ? null : document.getElementById(id);
    if (element) {
      element.focus();
      return;
    }
  }
};

const keepEditorFocus = (event: MouseEvent<HTMLButtonElement>) => event.preventDefault();

interface TodoItemProps {
  todo: Todo;
  neighborId: string | null;
  sortable: boolean;
}

const TodoItem = ({ todo, neighborId, sortable }: TodoItemProps) => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const list = useAppSelector(selectList);
  const itemRef = useRef<HTMLLIElement>(null);
  const editorRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLButtonElement>(null);
  const toggleTimer = useRef(0);
  const [pendingToggle, setPendingToggle] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
    data: { title: todo.title },
    disabled: !sortable || editing || leaving,
  });

  const checked = pendingToggle ? !todo.completed : todo.completed;
  const due = todo.dueDate ? describeDueDate(todo.dueDate, today) : null;

  useEffect(() => () => clearTimeout(toggleTimer.current), []);

  useEffect(() => {
    if (!editing) return;
    editorRef.current?.focus();
    editorRef.current?.select();
  }, [editing]);

  const leave = async (commit: () => void) => {
    const hadFocus = itemRef.current?.contains(document.activeElement) ?? false;

    if (!prefersReducedMotion()) {
      flushSync(() => setLeaving(true));
      await waitForTransitions(itemRef.current);
    }

    flushSync(commit);
    setLeaving(false);
    setPendingToggle(false);

    if (hadFocus) focusFirst(toggleId(todo.id), neighborId === null ? null : toggleId(neighborId), COMPOSER_INPUT_ID);
  };

  const update = (next: Todo, commit: () => void) => {
    if (matchesList(next, list, today)) commit();
    else void leave(commit);
  };

  const commitToggle = () => leave(() => dispatch(todoToggled(todo.id)));

  const handleToggle = () => {
    if (leaving) return;
    clearTimeout(toggleTimer.current);

    if (pendingToggle) {
      setPendingToggle(false);
      return;
    }

    if (prefersReducedMotion()) {
      void commitToggle();
      return;
    }

    setPendingToggle(true);
    toggleTimer.current = window.setTimeout(() => void commitToggle(), TOGGLE_DELAY);
  };

  const toggleImportant = () =>
    update({ ...todo, important: !todo.important }, () => dispatch(todoImportanceToggled(todo.id)));

  const schedule = (dueDate: string | null) =>
    update({ ...todo, dueDate }, () => dispatch(todoScheduled(todo.id, dueDate)));

  const handleDelete = () => {
    if (leaving) return;
    clearTimeout(toggleTimer.current);
    void leave(() => dispatch(removeTodos([todo.id])));
  };

  const startEditing = () => {
    if (leaving) return;
    setDraft(todo.title);
    setEditing(true);
  };

  const finishEditing = (save: boolean, restoreFocus: boolean) => {
    if (save) dispatch(todoRenamed(todo.id, draft));
    flushSync(() => setEditing(false));
    if (restoreFocus) titleRef.current?.focus();
  };

  const handleEditorKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" && event.key !== "Escape") return;
    event.preventDefault();
    finishEditing(event.key === "Enter", true);
  };

  const handleEditorBlur = (event: FocusEvent<HTMLInputElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && itemRef.current?.contains(next)) return;
    finishEditing(true, false);
  };

  return (
    <li ref={itemRef} className={styles.item} data-leaving={leaving || undefined}>
      <div className={styles.collapse}>
        <div
          ref={setNodeRef}
          className={styles.row}
          style={{ transform: CSS.Translate.toString(transform), transition }}
          data-completed={checked || undefined}
          data-dragging={isDragging || undefined}
          data-editing={editing || undefined}
          data-glass-light=""
        >
          <input
            id={toggleId(todo.id)}
            type="checkbox"
            className={styles.checkbox}
            checked={checked}
            onChange={handleToggle}
            aria-label={todo.title}
          />

          {editing ? (
            <input
              ref={editorRef}
              className={styles.editor}
              value={draft}
              maxLength={MAX_TITLE_LENGTH}
              enterKeyHint="done"
              aria-label="Task title"
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleEditorKeyDown}
              onBlur={handleEditorBlur}
            />
          ) : (
            <button
              ref={titleRef}
              type="button"
              className={styles.title}
              aria-label={`Edit “${todo.title}”`}
              onClick={startEditing}
            >
              {todo.title}
            </button>
          )}

          {due && !editing ? (
            <p className={styles.meta}>
              <span className={styles.due} data-tone={todo.completed ? undefined : due.tone}>
                <Icon name="calendar" className={styles.dueIcon} />
                {due.label}
              </span>
            </p>
          ) : null}

          <div className={styles.actions}>
            {editing ? (
              <>
                <IconButton
                  icon="check"
                  label="Save changes"
                  variant="accent"
                  size="small"
                  onMouseDown={keepEditorFocus}
                  onClick={() => finishEditing(true, true)}
                />
                <IconButton
                  icon="xmark"
                  label="Cancel editing"
                  variant="ghost"
                  size="small"
                  onMouseDown={keepEditorFocus}
                  onClick={() => finishEditing(false, true)}
                />
              </>
            ) : (
              <>
                <IconButton
                  icon="star"
                  iconFilled={todo.important}
                  label={`Mark “${todo.title}” as important`}
                  variant="ghost"
                  size="small"
                  className={cx(styles.action, styles.star)}
                  aria-pressed={todo.important}
                  onClick={toggleImportant}
                />
                <DuePicker
                  value={todo.dueDate}
                  onChange={schedule}
                  variant="icon"
                  label={`Set due date for “${todo.title}”`}
                  className={styles.action}
                />
                <IconButton
                  icon="trash"
                  label={`Delete “${todo.title}”`}
                  variant="danger"
                  size="small"
                  className={styles.action}
                  onClick={handleDelete}
                />
                {sortable ? (
                  <button
                    ref={setActivatorNodeRef}
                    type="button"
                    className={cx(styles.action, styles.handle)}
                    aria-label={`Reorder “${todo.title}”`}
                    {...attributes}
                    {...listeners}
                  >
                    <Icon name="grip" />
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default TodoItem;
