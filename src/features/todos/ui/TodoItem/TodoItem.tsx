import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  memo,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { flushSync } from "react-dom";

import { useAppDispatch, useAppSelector, useAppStore } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { matchesView, projectView } from "@/features/lists/model/lists";
import { selectDetailsId, selectList, selectSearching } from "@/features/lists/model/selectors";
import { detailsOpened, listChanged, queryChanged } from "@/features/lists/model/viewSlice";
import { splitProjectName } from "@/features/projects/model/project";
import { selectProjectById } from "@/features/projects/model/selectors";
import ProjectIcon from "@/features/projects/ui/ProjectIcon/ProjectIcon";
import { useToday } from "@/shared/hooks/useToday";
import { celebrate } from "@/shared/lib/celebrate";
import { cx } from "@/shared/lib/cx";
import { describeDueDate } from "@/shared/lib/date";
import { tap } from "@/shared/lib/haptics";
import { isEditableTarget } from "@/shared/lib/keyboard";
import { prefersReducedMotion, waitForTransitions } from "@/shared/lib/motion";
import Checkbox from "@/shared/ui/Checkbox/Checkbox";
import type { MenuPoint } from "@/shared/ui/ContextMenu/ContextMenu";
import Icon from "@/shared/ui/Icon/Icon";
import IconButton from "@/shared/ui/IconButton/IconButton";

import { checklistProgress } from "../../model/checklist";
import { duplicateTodo, removeTodos, toggleTodo } from "../../model/thunks";
import { extractTags, MAX_TITLE_LENGTH, stripTags, type Todo } from "../../model/todo";
import {
  todoImportanceToggled,
  todoMoved,
  todoProjectChanged,
  todoRenamed,
  todoScheduled,
} from "../../model/todosSlice";
import DuePicker from "../DuePicker/DuePicker";
import { COMPOSER_INPUT_ID, TOGGLE_SELECTOR, toggleId } from "../ids";
import TaskMenu, { type TaskMenuActions } from "../TaskMenu/TaskMenu";

import styles from "./TodoItem.module.scss";

const TOGGLE_DELAY = 420;
const SWIPE_THRESHOLD = 88;
const SWIPE_LIMIT = 132;
const LONG_PRESS = 480;
const PRESS_TOLERANCE = 8;

interface Swipe {
  pointerId: number;
  startX: number;
  startY: number;
  offset: number;
  engaged: boolean;
  armed: boolean;
}

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

const resist = (distance: number) => {
  const magnitude = Math.abs(distance);
  const eased = magnitude <= SWIPE_LIMIT ? magnitude : SWIPE_LIMIT + (magnitude - SWIPE_LIMIT) * 0.25;
  return Math.sign(distance) * eased;
};

const centerOf = (element: Element | null) => {
  if (!element) return;
  const { left, top, width, height } = element.getBoundingClientRect();
  return { x: left + width / 2, y: top + height / 2 };
};

const anchorOf = (element: Element | null): MenuPoint => {
  if (!element) return { x: 0, y: 0 };
  const { left, bottom } = element.getBoundingClientRect();
  return { x: left, y: bottom + 6 };
};

interface TodoItemProps {
  todo: Todo;
  previousId: string | null;
  nextId: string | null;
  sortable: boolean;
  coarse: boolean;
  viewProjectId: string | null;
  hideDueDate?: boolean;
}

const TodoItem = ({
  todo,
  previousId,
  nextId,
  sortable,
  coarse,
  viewProjectId,
  hideDueDate = false,
}: TodoItemProps) => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const { t, intlLocale } = useI18n();
  const store = useAppStore();
  const selected = useAppSelector((state) => selectDetailsId(state) === todo.id);
  const project = useAppSelector((state) =>
    todo.projectId === null ? undefined : selectProjectById(state, todo.projectId),
  );
  const itemRef = useRef<HTMLLIElement>(null);
  const editorRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLButtonElement>(null);
  const toggleTimer = useRef(0);
  const pendingCommit = useRef<(() => boolean) | null>(null);
  const pressTimer = useRef(0);
  const swipeRef = useRef<Swipe | null>(null);
  const suppressClick = useRef(false);
  const [pendingToggle, setPendingToggle] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.title);
  const [menu, setMenu] = useState<{ point: MenuPoint; touch: boolean } | null>(null);

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
    data: { title: todo.title },
    disabled: !sortable || editing || leaving,
  });

  const checked = pendingToggle ? !todo.completed : todo.completed;
  const due = todo.dueDate && !hideDueDate ? describeDueDate(todo.dueDate, today, intlLocale) : null;
  const tags = extractTags(todo.title);
  const title = stripTags(todo.title) || todo.title;
  const checklist = checklistProgress(todo.notes);
  const neighborId = nextId ?? previousId;
  const showProject = project !== undefined && project.id !== viewProjectId;

  useEffect(() => {
    const flushToggle = () => {
      const toggle = pendingCommit.current;
      pendingCommit.current = null;
      clearTimeout(toggleTimer.current);
      toggle?.();
    };
    window.addEventListener("pagehide", flushToggle);
    return () => {
      window.removeEventListener("pagehide", flushToggle);
      flushToggle();
      clearTimeout(pressTimer.current);
    };
  }, []);

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
    const state = store.getState();
    if (selectSearching(state) || matchesView(next, selectList(state), today)) commit();
    else void leave(commit);
  };

  const commitToggle = () => {
    const origin = centerOf(document.getElementById(toggleId(todo.id)));
    pendingCommit.current = () => dispatch(toggleTodo(todo.id, today));
    return leave(() => {
      const toggle = pendingCommit.current;
      pendingCommit.current = null;
      if (toggle?.()) celebrate(origin);
    });
  };

  const handleToggle = () => {
    if (leaving) return;
    clearTimeout(toggleTimer.current);
    tap();

    if (pendingToggle) {
      pendingCommit.current = null;
      setPendingToggle(false);
      return;
    }

    if (prefersReducedMotion()) {
      void commitToggle();
      return;
    }

    setPendingToggle(true);
    pendingCommit.current = () => dispatch(toggleTodo(todo.id, today));
    toggleTimer.current = window.setTimeout(() => void commitToggle(), TOGGLE_DELAY);
  };

  const toggleImportant = () => {
    if (leaving) return;
    update({ ...todo, important: !todo.important }, () => dispatch(todoImportanceToggled(todo.id)));
  };

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

  const openDetails = () => dispatch(detailsOpened(todo.id));

  const openMenu = (point: MenuPoint, touch = false) => {
    if (editing || leaving) return;
    setMenu({ point, touch });
  };

  const moveToProject = (projectId: string | null) =>
    update({ ...todo, projectId }, () => dispatch(todoProjectChanged(todo.id, projectId)));

  const menuActions: TaskMenuActions = {
    toggle: () => {
      clearTimeout(toggleTimer.current);
      setPendingToggle(false);
      void commitToggle();
    },
    toggleImportant,
    schedule,
    moveToProject,
    rename: startEditing,
    openDetails,
    duplicate: () => dispatch(duplicateTodo(todo.id)),
    remove: handleDelete,
  };

  const openDuePicker = () => itemRef.current?.querySelector<HTMLButtonElement>("[data-due-trigger]")?.click();

  const focusSibling = (direction: 1 | -1) => {
    const toggles = Array.from(document.querySelectorAll<HTMLElement>(TOGGLE_SELECTOR));
    const index = toggles.findIndex((element) => element.id === toggleId(todo.id));
    toggles[index + direction]?.focus();
  };

  const reorder = (targetId: string | null) => {
    if (!sortable || targetId === null) return;
    const focused = document.activeElement;
    flushSync(() => dispatch(todoMoved({ activeId: todo.id, overId: targetId })));
    if (focused instanceof HTMLElement) focused.focus();
  };

  const handleEditorKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" && event.key !== "Escape") return;
    event.preventDefault();
    finishEditing(event.key === "Enter", true);
  };

  const handleEditorBlur = (event: FocusEvent<HTMLInputElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && itemRef.current?.contains(next)) return;
    finishEditing(true, false);
  };

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const { target } = event;
    if (editing || leaving || isDragging || event.defaultPrevented || event.metaKey || event.ctrlKey) return;
    if (!(target instanceof Element) || isEditableTarget(target) || target.closest("[popover]")) return;

    if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
      event.preventDefault();
      openMenu(anchorOf(titleRef.current ?? itemRef.current));
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (event.altKey) reorder(event.key === "ArrowUp" ? previousId : nextId);
      else focusSibling(event.key === "ArrowUp" ? -1 : 1);
      return;
    }

    if (event.altKey || event.shiftKey) return;

    const actions: Record<string, (() => void) | undefined> = {
      s: toggleImportant,
      d: openDuePicker,
      e: startEditing,
      i: openDetails,
      delete: handleDelete,
      backspace: handleDelete,
    };
    const action = actions[event.key.toLowerCase()];
    if (!action) return;
    event.preventDefault();
    action();
  });

  useEffect(() => {
    const item = itemRef.current;
    if (!item) return;
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    item.addEventListener("keydown", listener);
    return () => item.removeEventListener("keydown", listener);
  }, []);

  const resetSwipe = () => {
    const item = itemRef.current;
    if (!item) return;
    delete item.dataset.swipe;
    delete item.dataset.armed;
    item.style.removeProperty("--swipe");
  };

  const cancelPress = () => clearTimeout(pressTimer.current);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    suppressClick.current = false;
    if (event.pointerType !== "touch" || !event.isPrimary || editing || leaving) return;
    if (event.target instanceof Element && event.target.closest("[data-swipe-ignore], [popover]")) return;
    const point = { x: event.clientX, y: event.clientY };
    clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => {
      if (swipeRef.current?.engaged) return;
      swipeRef.current = null;
      suppressClick.current = true;
      tap(12);
      openMenu(point, true);
    }, LONG_PRESS);
    swipeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offset: 0,
      engaged: false,
      armed: false,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const swipe = swipeRef.current;
    const item = itemRef.current;
    if (!swipe || !item || swipe.pointerId !== event.pointerId) return;

    const dx = event.clientX - swipe.startX;
    const dy = event.clientY - swipe.startY;
    if (Math.hypot(dx, dy) > PRESS_TOLERANCE) cancelPress();

    if (!swipe.engaged) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) {
        swipeRef.current = null;
        return;
      }
      if (Math.abs(dx) < 12) return;
      swipe.engaged = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    swipe.offset = resist(dx);
    const armed = Math.abs(swipe.offset) >= SWIPE_THRESHOLD;
    if (armed !== swipe.armed) {
      swipe.armed = armed;
      if (armed) tap(14);
    }

    item.dataset.swipe = swipe.offset > 0 ? "complete" : "delete";
    if (armed) item.dataset.armed = "";
    else delete item.dataset.armed;
    item.style.setProperty("--swipe", `${swipe.offset}px`);
  };

  const handlePointerUp = () => {
    cancelPress();
    const swipe = swipeRef.current;
    swipeRef.current = null;
    if (!swipe?.engaged) return;

    suppressClick.current = true;
    resetSwipe();
    if (swipe.offset >= SWIPE_THRESHOLD) {
      clearTimeout(toggleTimer.current);
      void commitToggle();
    } else if (swipe.offset <= -SWIPE_THRESHOLD) {
      handleDelete();
    }
  };

  const handlePointerCancel = () => {
    cancelPress();
    swipeRef.current = null;
    resetSwipe();
  };

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("input, textarea, [popover]")) return;
    event.preventDefault();
    if (menu) return;
    cancelPress();
    swipeRef.current = null;
    const fromKeyboard = event.clientX === 0 && event.clientY === 0;
    openMenu(fromKeyboard ? anchorOf(titleRef.current) : { x: event.clientX, y: event.clientY });
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <li ref={itemRef} className={styles.item} data-leaving={leaving || undefined}>
      <div className={styles.collapse}>
        <div className={styles.swipe} aria-hidden="true">
          <Icon name={todo.completed ? "rotate" : "check"} className={styles.swipeIcon} />
          <Icon name="trash" className={styles.swipeIcon} />
        </div>
        <div
          ref={setNodeRef}
          className={styles.row}
          style={{ transform: CSS.Translate.toString(transform), transition }}
          data-completed={checked || undefined}
          data-dragging={isDragging || undefined}
          data-editing={editing || undefined}
          data-selected={selected || undefined}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
          onClickCapture={handleClickCapture}
          onContextMenu={handleContextMenu}
        >
          <Checkbox
            id={toggleId(todo.id)}
            className={styles.checkbox}
            checked={checked}
            onChange={handleToggle}
            aria-label={todo.title}
            data-todo-toggle=""
          />

          {editing ? (
            <input
              ref={editorRef}
              className={styles.editor}
              value={draft}
              maxLength={MAX_TITLE_LENGTH}
              enterKeyHint="done"
              aria-label={t("todo.editor")}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleEditorKeyDown}
              onBlur={handleEditorBlur}
            />
          ) : (
            <button
              ref={titleRef}
              type="button"
              className={styles.title}
              aria-label={coarse ? t("todo.details", { title: todo.title }) : t("todo.edit", { title: todo.title })}
              onClick={coarse ? openDetails : startEditing}
            >
              {title}
            </button>
          )}

          {!editing && (due || todo.repeat || tags.length > 0 || todo.notes || showProject) ? (
            <div className={styles.meta}>
              {due ? (
                <span className={styles.chip} data-tone={todo.completed ? undefined : due.tone}>
                  <Icon name="calendar" className={styles.chipIcon} />
                  <time dateTime={todo.dueDate ?? undefined}>{due.label}</time>
                </span>
              ) : null}
              {todo.repeat ? (
                <span className={styles.chip} title={t("repeat.chip", { rule: t(`repeat.${todo.repeat}`) })}>
                  <Icon name="repeat" className={styles.chipIcon} />
                  <span className="visually-hidden">{t("repeat.chip", { rule: t(`repeat.${todo.repeat}`) })}</span>
                </span>
              ) : null}
              {checklist.total > 0 ? (
                <span
                  className={styles.chip}
                  data-tone={checklist.done === checklist.total ? "done" : undefined}
                  title={t("todo.subtasks", checklist)}
                >
                  <Icon name="checkAll" className={styles.chipIcon} />
                  <span aria-hidden="true">
                    {checklist.done}/{checklist.total}
                  </span>
                  <span className="visually-hidden">{t("todo.subtasks", checklist)}</span>
                </span>
              ) : null}
              {todo.notes && checklist.total === 0 ? (
                <span className={styles.chip} title={t("todo.notes")}>
                  <Icon name="notes" className={styles.chipIcon} />
                  <span className="visually-hidden">{t("todo.notes")}</span>
                </span>
              ) : null}
              {showProject ? (
                <button
                  type="button"
                  className={cx(styles.chip, styles.project)}
                  data-project-color={project.color}
                  aria-label={t("project.show", { name: splitProjectName(project.name).label })}
                  onClick={() => dispatch(listChanged(projectView(project.id)))}
                >
                  <ProjectIcon name={project.name} color={project.color} size="small" className={styles.projectIcon} />
                  {splitProjectName(project.name).label}
                </button>
              ) : null}
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={cx(styles.chip, styles.tag)}
                  aria-label={t("todo.tag", { tag })}
                  onClick={() => dispatch(queryChanged(tag))}
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : null}

          <div className={styles.actions}>
            {editing ? (
              <>
                <IconButton
                  icon="check"
                  label={t("todo.save")}
                  variant="accent"
                  size="small"
                  onMouseDown={keepEditorFocus}
                  onClick={() => finishEditing(true, true)}
                />
                <IconButton
                  icon="xmark"
                  label={t("todo.cancel")}
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
                  label={t("todo.star", { title: todo.title })}
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
                  label={t("todo.schedule", { title: todo.title })}
                  className={cx(styles.action, styles.schedule)}
                />
                <IconButton
                  icon="info"
                  label={t("todo.details", { title: todo.title })}
                  variant="ghost"
                  size="small"
                  className={cx(styles.action, styles.info)}
                  onClick={openDetails}
                />
                <IconButton
                  icon="trash"
                  label={t("todo.delete", { title: todo.title })}
                  variant="danger"
                  size="small"
                  className={cx(styles.action, styles.delete)}
                  onClick={handleDelete}
                />
                {sortable ? (
                  <button
                    ref={setActivatorNodeRef}
                    type="button"
                    className={cx(styles.action, styles.handle)}
                    aria-label={t("todo.reorder", { title: todo.title })}
                    data-swipe-ignore=""
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
      {menu ? (
        <TaskMenu
          todo={todo}
          point={menu.point}
          touch={menu.touch}
          actions={menuActions}
          onClose={() => setMenu(null)}
        />
      ) : null}
    </li>
  );
};

export default memo(TodoItem);
