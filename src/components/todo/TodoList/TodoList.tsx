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
import type { IconName } from "@/components/ui/Icon/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCounts, selectFilter, selectQuery, selectVisibleTodos } from "@/store/selectors";
import { todoMoved } from "@/store/slices/todosSlice";
import type { Filter } from "@/store/slices/viewSlice";
import { clearCompleted } from "@/store/thunks";

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

interface EmptyContent {
  icon: IconName;
  title: string;
  description: string;
}

const getEmptyContent = (total: number, filter: Filter, query: string): EmptyContent => {
  if (query.trim()) return { icon: "search", title: "No results", description: `No tasks match “${query.trim()}”.` };
  if (total === 0)
    return { icon: "inbox", title: "No tasks yet", description: "Add your first task above to get started." };
  if (filter === "active")
    return { icon: "circleCheck", title: "All done", description: "Every task is completed. Nice work!" };
  return { icon: "list", title: "Nothing completed yet", description: "Tasks you complete will show up here." };
};

const TodoList = () => {
  const dispatch = useAppDispatch();
  const { active, completed } = useAppSelector(selectVisibleTodos);
  const { total } = useAppSelector(selectCounts);
  const filter = useAppSelector(selectFilter);
  const query = useAppSelector(selectQuery);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = ({ active: dragged, over }: DragEndEvent) => {
    if (!hasSortableData(dragged) || !hasSortableData(over) || dragged.id === over.id) return;
    if (dragged.data.current.sortable.containerId !== over.data.current.sortable.containerId) return;
    dispatch(todoMoved({ activeId: String(dragged.id), overId: String(over.id) }));
  };

  const isEmpty = active.length === 0 && completed.length === 0;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      accessibility={{ announcements, screenReaderInstructions }}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.list}>
        {active.length > 0 ? <TodoSection id="active" title="To do" todos={active} hideHeader /> : null}
        {completed.length > 0 ? (
          <TodoSection
            id="completed"
            title="Completed"
            todos={completed}
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
        {isEmpty ? <EmptyState {...getEmptyContent(total, filter, query)} /> : null}
      </div>
    </DndContext>
  );
};

export default TodoList;
