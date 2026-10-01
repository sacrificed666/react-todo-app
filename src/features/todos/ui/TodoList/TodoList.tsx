import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { hasSortableData, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import type { Translate } from "@/features/i18n/model/translate";
import { useI18n } from "@/features/i18n/model/useI18n";
import { LIST_ICONS } from "@/features/lists/model/listIcons";
import { selectList, selectQuery, selectShowCompleted, selectSort } from "@/features/lists/model/selectors";
import { completedVisibilityToggled } from "@/features/lists/model/viewSlice";
import { useToday } from "@/shared/hooks/useToday";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";

import { selectVisibleTodos } from "../../model/selectors";
import { clearCompleted } from "../../model/thunks";
import { todoMoved } from "../../model/todosSlice";
import TodoSection from "../TodoSection/TodoSection";

import styles from "./TodoList.module.scss";

interface Draggable {
  data: { current?: Record<string, unknown> };
}

const createAnnouncements = (t: Translate): Announcements => {
  const describe = (entry: Draggable | null) => {
    const title = entry?.data.current?.title;
    return typeof title === "string" ? t("dnd.task", { title }) : t("dnd.fallback");
  };

  return {
    onDragStart: ({ active }) => t("dnd.pickedUp", { task: describe(active) }),
    onDragOver: ({ active, over }) =>
      over
        ? t("dnd.over", { task: describe(active), target: describe(over) })
        : t("dnd.outside", { task: describe(active) }),
    onDragEnd: ({ active, over }) =>
      over
        ? t("dnd.dropped", { task: describe(active), target: describe(over) })
        : t("dnd.droppedAlone", { task: describe(active) }),
    onDragCancel: ({ active }) => t("dnd.cancelled", { task: describe(active) }),
  };
};

const TodoList = () => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const { t } = useI18n();
  const { active, completed } = useAppSelector((state) => selectVisibleTodos(state, today));
  const list = useAppSelector(selectList);
  const query = useAppSelector(selectQuery);
  const sortable = useAppSelector(selectSort) === "manual";
  const showCompleted = useAppSelector(selectShowCompleted);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active: dragged, over }: DragEndEvent) => {
    if (!hasSortableData(dragged) || !hasSortableData(over) || dragged.id === over.id) return;
    if (dragged.data.current.sortable.containerId !== over.data.current.sortable.containerId) return;
    dispatch(todoMoved({ activeId: String(dragged.id), overId: String(over.id) }));
  };

  const trimmedQuery = query.trim();
  const isEmpty = active.length === 0 && completed.length === 0;
  const isAllDone = active.length === 0 && completed.length > 0 && list !== "completed" && !trimmedQuery;
  const collapsible = list !== "completed";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      accessibility={{
        announcements: createAnnouncements(t),
        screenReaderInstructions: { draggable: t("dnd.instructions") },
      }}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.list}>
        {active.length > 0 ? (
          <TodoSection id="active" title={t("section.todo")} todos={active} sortable={sortable} hideHeader />
        ) : null}
        {isAllDone ? (
          <EmptyState
            compact
            icon="circleCheck"
            title={t("list.allDoneTitle")}
            description={t("list.allDoneDescription")}
          />
        ) : null}
        {completed.length > 0 ? (
          <TodoSection
            id="completed"
            title={t("section.completed")}
            todos={completed}
            sortable={sortable}
            collapsed={collapsible && !showCompleted}
            onToggleCollapsed={collapsible ? () => dispatch(completedVisibilityToggled()) : undefined}
            action={
              <button
                type="button"
                className={styles.clear}
                data-glass-light=""
                onClick={() => dispatch(clearCompleted())}
              >
                {t("section.clear")}
              </button>
            }
          />
        ) : null}
        {isEmpty && trimmedQuery ? (
          <EmptyState
            icon="search"
            title={t("list.noResultsTitle")}
            description={t("list.noResultsDescription", { query: trimmedQuery })}
          />
        ) : null}
        {isEmpty && !trimmedQuery ? (
          <EmptyState
            icon={LIST_ICONS[list]}
            title={t(`lists.${list}.emptyTitle`)}
            description={t(`lists.${list}.emptyDescription`)}
          />
        ) : null}
      </div>
    </DndContext>
  );
};

export default TodoList;
