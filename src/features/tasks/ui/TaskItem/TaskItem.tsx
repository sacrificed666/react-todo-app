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

import { subtaskProgress } from "../../model/subtasks";
import { MAX_TITLE_LENGTH, type Task } from "../../model/task";
import {
  taskImportanceToggled,
  taskMoved,
  taskProjectChanged,
  taskRenamed,
  taskScheduled,
} from "../../model/tasksSlice";
import { duplicateTask, removeTasks, toggleTask } from "../../model/thunks";
import DuePicker from "../DuePicker/DuePicker";
import { COMPOSER_INPUT_ID, TOGGLE_SELECTOR, toggleId } from "../ids";
import TaskMenu, { type TaskMenuActions } from "../TaskMenu/TaskMenu";

import styles from "./TaskItem.module.scss";

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

// Focuses the first of the given elements that exists
const focusFirst = (...ids: Array<string | null>) => {
  for (const id of ids) {
    const element = id === null ? null : document.getElementById(id);
    if (element) {
      element.focus();
      return;
    }
  }
};

// Keeps the title editor focused while its buttons are pressed
const keepEditorFocus = (event: MouseEvent<HTMLButtonElement>) => event.preventDefault();

// A swipe that slows down past its limit, like a rubber band
const resist = (distance: number) => {
  const magnitude = Math.abs(distance);
  const eased = magnitude <= SWIPE_LIMIT ? magnitude : SWIPE_LIMIT + (magnitude - SWIPE_LIMIT) * 0.25;
  return Math.sign(distance) * eased;
};

// The middle of an element, for the confetti
const centerOf = (element: Element | null) => {
  if (!element) return;
  const { left, top, width, height } = element.getBoundingClientRect();
  return { x: left + width / 2, y: top + height / 2 };
};

// The point under an element where its menu opens
const anchorOf = (element: Element | null): MenuPoint => {
  if (!element) return { x: 0, y: 0 };
  const { left, bottom } = element.getBoundingClientRect();
  return { x: left, y: bottom + 6 };
};

interface TaskItemProps {
  task: Task;
  previousId: string | null;
  nextId: string | null;
  sortable: boolean;
  coarse: boolean;
  viewProjectId: string | null;
  hideDueDate?: boolean;
}

// One task: check, title, chips, swipe actions, drag and context menu
const TaskItem = ({
  task,
  previousId,
  nextId,
  sortable,
  coarse,
  viewProjectId,
  hideDueDate = false,
}: TaskItemProps) => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const { t, intlLocale } = useI18n();
  const store = useAppStore();
  const selected = useAppSelector((state) => selectDetailsId(state) === task.id);
  const project = useAppSelector((state) =>
    task.projectId === null ? undefined : selectProjectById(state, task.projectId),
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
  const [draft, setDraft] = useState(task.title);
  const [menu, setMenu] = useState<{ point: MenuPoint; touch: boolean } | null>(null);

  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { title: task.title },
    disabled: !sortable || editing || leaving,
  });

  const checked = pendingToggle ? !task.completed : task.completed;
  const due = task.dueDate && !hideDueDate ? describeDueDate(task.dueDate, today, intlLocale) : null;
  const { tags, title } = task;
  const checklist = subtaskProgress(task.subtasks);
  const neighborId = nextId ?? previousId;
  const showProject = project !== undefined && project.id !== viewProjectId;

  // Finishes a pending check when the page or the row goes away
  useEffect(() => {
    // Runs a pending check right away
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

  // Focuses and selects the title when editing starts
  useEffect(() => {
    if (!editing) return;
    editorRef.current?.focus();
    editorRef.current?.select();
  }, [editing]);

  // Animates the row out, applies the change and keeps the focus nearby
  const leave = async (commit: () => void) => {
    const hadFocus = itemRef.current?.contains(document.activeElement) ?? false;

    if (!prefersReducedMotion()) {
      flushSync(() => setLeaving(true));
      await waitForTransitions(itemRef.current);
    }

    flushSync(commit);
    setLeaving(false);
    setPendingToggle(false);

    if (hadFocus) focusFirst(toggleId(task.id), neighborId === null ? null : toggleId(neighborId), COMPOSER_INPUT_ID);
  };

  // Animates the row out when a change moves it to another list
  const update = (next: Task, commit: () => void) => {
    const state = store.getState();
    if (selectSearching(state) || matchesView(next, selectList(state), today)) commit();
    else void leave(commit);
  };

  // Checks the task after the row has left, with confetti
  const commitToggle = () => {
    const origin = centerOf(document.getElementById(toggleId(task.id)));
    pendingCommit.current = () => dispatch(toggleTask(task.id, today));
    return leave(() => {
      const toggle = pendingCommit.current;
      pendingCommit.current = null;
      if (toggle?.()) celebrate(origin);
    });
  };

  // Checks after a short delay so a quick second tap can undo it
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
    pendingCommit.current = () => dispatch(toggleTask(task.id, today));
    toggleTimer.current = window.setTimeout(() => void commitToggle(), TOGGLE_DELAY);
  };

  // Stars or unstars the task
  const toggleImportant = () => {
    if (leaving) return;
    update({ ...task, important: !task.important }, () => dispatch(taskImportanceToggled(task.id)));
  };

  const schedule = (dueDate: string | null) =>
    update({ ...task, dueDate }, () => dispatch(taskScheduled(task.id, dueDate)));

  // Removes the task after the row has left
  const handleDelete = () => {
    if (leaving) return;
    clearTimeout(toggleTimer.current);
    void leave(() => dispatch(removeTasks([task.id])));
  };

  // Edits the title in place
  const startEditing = () => {
    if (leaving) return;
    setDraft(task.title);
    setEditing(true);
  };

  // Saves or drops the new title and returns the focus
  const finishEditing = (save: boolean, restoreFocus: boolean) => {
    if (save) dispatch(taskRenamed(task.id, draft));
    flushSync(() => setEditing(false));
    if (restoreFocus) titleRef.current?.focus();
  };

  // Opens the task details
  const openDetails = () => dispatch(detailsOpened(task.id));

  // Opens the context menu at a point
  const openMenu = (point: MenuPoint, touch = false) => {
    if (editing || leaving) return;
    setMenu({ point, touch });
  };

  const moveToProject = (projectId: string | null) =>
    update({ ...task, projectId }, () => dispatch(taskProjectChanged(task.id, projectId)));

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
    duplicate: () => dispatch(duplicateTask(task.id)),
    remove: handleDelete,
  };

  // Opens the due date options of the row
  const openDuePicker = () => itemRef.current?.querySelector<HTMLButtonElement>("[data-due-trigger]")?.click();

  // Moves the focus to the next or previous task
  const focusSibling = (direction: 1 | -1) => {
    const toggles = Array.from(document.querySelectorAll<HTMLElement>(TOGGLE_SELECTOR));
    const index = toggles.findIndex((element) => element.id === toggleId(task.id));
    toggles[index + direction]?.focus();
  };

  // Moves the task next to a neighbour and keeps the focus
  const reorder = (targetId: string | null) => {
    if (!sortable || targetId === null) return;
    const focused = document.activeElement;
    flushSync(() => dispatch(taskMoved({ activeId: task.id, overId: targetId })));
    if (focused instanceof HTMLElement) focused.focus();
  };

  // Enter saves the title and Escape cancels
  const handleEditorKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter" && event.key !== "Escape") return;
    event.preventDefault();
    finishEditing(event.key === "Enter", true);
  };

  // Saves the title when the focus leaves the row
  const handleEditorBlur = (event: FocusEvent<HTMLInputElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && itemRef.current?.contains(next)) return;
    finishEditing(true, false);
  };

  // Row shortcuts: arrows, S, D, E, I, Delete and the menu key
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

  // Listens for the row shortcuts
  useEffect(() => {
    const item = itemRef.current;
    if (!item) return;
    const listener = (event: KeyboardEvent) => handleKeyDown(event);
    item.addEventListener("keydown", listener);
    return () => item.removeEventListener("keydown", listener);
  }, []);

  // Puts a swiped row back in place
  const resetSwipe = () => {
    const item = itemRef.current;
    if (!item) return;
    delete item.dataset.swipe;
    delete item.dataset.armed;
    item.style.removeProperty("--swipe");
  };

  // Cancels a pending long press
  const cancelPress = () => clearTimeout(pressTimer.current);

  // Starts a swipe or a long press on touch screens
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

  // Follows the finger and arms an action past the threshold
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

  // Runs the armed swipe action, or snaps back
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

  // Snaps back when the browser takes over the gesture
  const handlePointerCancel = () => {
    cancelPress();
    swipeRef.current = null;
    resetSwipe();
  };

  // Opens our menu instead of the browser's
  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("input, textarea, [popover]")) return;
    event.preventDefault();
    if (menu) return;
    cancelPress();
    swipeRef.current = null;
    const fromKeyboard = event.clientX === 0 && event.clientY === 0;
    openMenu(fromKeyboard ? anchorOf(titleRef.current) : { x: event.clientX, y: event.clientY });
  };

  // Swallows the click that ends a swipe or a long press
  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClick.current) return;
    suppressClick.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <li ref={itemRef} className={styles.item} data-leaving={leaving || undefined} data-own-swipe="">
      <div className={styles.collapse}>
        <div className={styles.swipe} aria-hidden="true">
          <Icon name={task.completed ? "rotate" : "check"} className={styles.swipeIcon} />
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
            id={toggleId(task.id)}
            className={styles.checkbox}
            checked={checked}
            onChange={handleToggle}
            aria-label={task.title}
            data-task-toggle=""
          />

          {editing ? (
            <input
              ref={editorRef}
              className={styles.editor}
              value={draft}
              maxLength={MAX_TITLE_LENGTH}
              enterKeyHint="done"
              aria-label={t("task.editor")}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleEditorKeyDown}
              onBlur={handleEditorBlur}
            />
          ) : (
            <button
              ref={titleRef}
              type="button"
              className={styles.title}
              aria-label={coarse ? t("task.details", { title: task.title }) : t("task.edit", { title: task.title })}
              onClick={coarse ? openDetails : startEditing}
            >
              {title}
            </button>
          )}

          {!editing && (due || task.repeat || tags.length > 0 || task.notes || checklist.total > 0 || showProject) ? (
            <div className={styles.meta}>
              {due ? (
                <span className={styles.chip} data-tone={task.completed ? undefined : due.tone}>
                  <Icon name="calendar" className={styles.chipIcon} />
                  <time dateTime={task.dueDate ?? undefined}>{due.label}</time>
                </span>
              ) : null}
              {task.repeat ? (
                <span className={styles.chip} title={t("repeat.chip", { rule: t(`repeat.${task.repeat}`) })}>
                  <Icon name="repeat" className={styles.chipIcon} />
                  <span className="visually-hidden">{t("repeat.chip", { rule: t(`repeat.${task.repeat}`) })}</span>
                </span>
              ) : null}
              {checklist.total > 0 ? (
                <span
                  className={styles.chip}
                  data-tone={checklist.done === checklist.total ? "done" : undefined}
                  title={t("task.subtasks", checklist)}
                >
                  <Icon name="checkAll" className={styles.chipIcon} />
                  <span aria-hidden="true">
                    {checklist.done}/{checklist.total}
                  </span>
                  <span className="visually-hidden">{t("task.subtasks", checklist)}</span>
                </span>
              ) : null}
              {task.notes ? (
                <span className={styles.chip} title={t("task.notes")}>
                  <Icon name="notes" className={styles.chipIcon} />
                  <span className="visually-hidden">{t("task.notes")}</span>
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
                  aria-label={t("task.tag", { tag })}
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
                  label={t("task.save")}
                  variant="accent"
                  size="small"
                  onMouseDown={keepEditorFocus}
                  onClick={() => finishEditing(true, true)}
                />
                <IconButton
                  icon="xmark"
                  label={t("task.cancel")}
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
                  iconFilled={task.important}
                  label={t("task.star", { title: task.title })}
                  variant="ghost"
                  size="small"
                  className={cx(styles.action, styles.star)}
                  aria-pressed={task.important}
                  onClick={toggleImportant}
                />
                <DuePicker
                  value={task.dueDate}
                  onChange={schedule}
                  variant="icon"
                  label={t("task.schedule", { title: task.title })}
                  className={cx(styles.action, styles.schedule)}
                />
                <IconButton
                  icon="info"
                  label={t("task.details", { title: task.title })}
                  variant="ghost"
                  size="small"
                  className={cx(styles.action, styles.info)}
                  onClick={openDetails}
                />
                <IconButton
                  icon="trash"
                  label={t("task.delete", { title: task.title })}
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
                    aria-label={t("task.reorder", { title: task.title })}
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
          task={task}
          point={menu.point}
          touch={menu.touch}
          actions={menuActions}
          onClose={() => setMenu(null)}
        />
      ) : null}
    </li>
  );
};

export default memo(TaskItem);
