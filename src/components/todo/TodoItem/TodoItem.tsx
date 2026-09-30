import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent } from "react";
import { flushSync } from "react-dom";

import Icon from "@/components/ui/Icon/Icon";
import IconButton from "@/components/ui/IconButton/IconButton";
import { prefersReducedMotion, waitForTransitions } from "@/lib/motion";
import { MAX_TITLE_LENGTH, type Todo } from "@/lib/todo";
import { useAppDispatch } from "@/store/hooks";
import { todoRenamed, todoToggled } from "@/store/slices/todosSlice";
import { removeTodos } from "@/store/thunks";

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
}

const TodoItem = ({ todo, neighborId }: TodoItemProps) => {
  const dispatch = useAppDispatch();
  const itemRef = useRef<HTMLLIElement>(null);
  const editorRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const toggleTimer = useRef(0);
  const [pendingToggle, setPendingToggle] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
    data: { title: todo.title },
    disabled: editing || leaving,
  });

  const checked = pendingToggle ? !todo.completed : todo.completed;

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
    if (restoreFocus) editButtonRef.current?.focus();
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
            <span className={styles.title} onDoubleClick={startEditing}>
              {todo.title}
            </span>
          )}

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
                  ref={editButtonRef}
                  icon="pencil"
                  label={`Edit “${todo.title}”`}
                  variant="ghost"
                  size="small"
                  className={styles.action}
                  onClick={startEditing}
                />
                <IconButton
                  icon="trash"
                  label={`Delete “${todo.title}”`}
                  variant="danger"
                  size="small"
                  className={styles.action}
                  onClick={handleDelete}
                />
                <button
                  ref={setActivatorNodeRef}
                  type="button"
                  className={styles.handle}
                  aria-label={`Reorder “${todo.title}”`}
                  {...attributes}
                  {...listeners}
                >
                  <Icon name="grip" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </li>
  );
};

export default TodoItem;
