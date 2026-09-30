import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type ScreenReaderInstructions,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { hasSortableData, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { useToday } from "@/hooks/useToday";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectList, selectQuery, selectShowCompleted, selectSort, selectVisibleTodos } from "@/store/selectors";
import { todoMoved } from "@/store/slices/todosSlice";
import { completedVisibilityToggled } from "@/store/slices/viewSlice";
import { clearCompleted } from "@/store/thunks";

import { LIST_META } from "../lists";
import TodoSection from "../TodoSection/TodoSection";

import styles from "./TodoList.module.scss";

interface Draggable {
  data: { current?: Record<string, unknown> };
}

const describe = (entry: Draggable | null) => {
  const title = entry?.data.current?.title;
  return typeof title === "string" ? `“${title}”` : "the task";
};

const announcements: Announcements = {
  onDragStart: ({ active }) => `Picked up ${describe(active)}.`,
  onDragOver: ({ active, over }) =>
    over ? `${describe(active)} moved next to ${describe(over)}.` : `${describe(active)} is outside the list.`,
  onDragEnd: ({ active, over }) =>
    over ? `${describe(active)} dropped next to ${describe(over)}.` : `${describe(active)} dropped.`,
  onDragCancel: ({ active }) => `Reordering cancelled. ${describe(active)} returned to its place.`,
};

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    "To reorder a task, press Space or Enter to pick it up, use the arrow keys to move it, then press Space or Enter to drop it. Press Escape to cancel.",
};

const TodoList = () => {
  const dispatch = useAppDispatch();
  const today = useToday();
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

  const meta = LIST_META[list];
  const trimmedQuery = query.trim();
  const isEmpty = active.length === 0 && completed.length === 0;
  const isAllDone = active.length === 0 && completed.length > 0 && list !== "completed" && !trimmedQuery;
  const collapsible = list !== "completed";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      accessibility={{ announcements, screenReaderInstructions }}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.list}>
        {active.length > 0 ? (
          <TodoSection id="active" title="To do" todos={active} sortable={sortable} hideHeader />
        ) : null}
        {isAllDone ? (
          <EmptyState compact icon="circleCheck" title="All done" description="Every task in this list is completed." />
        ) : null}
        {completed.length > 0 ? (
          <TodoSection
            id="completed"
            title="Completed"
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
                Clear
              </button>
            }
          />
        ) : null}
        {isEmpty && trimmedQuery ? (
          <EmptyState icon="search" title="No results" description={`No tasks match “${trimmedQuery}”.`} />
        ) : null}
        {isEmpty && !trimmedQuery ? (
          <EmptyState icon={meta.icon} title={meta.emptyTitle} description={meta.emptyDescription} />
        ) : null}
      </div>
    </DndContext>
  );
};

export default TodoList;
