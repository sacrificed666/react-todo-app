import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useState, type ReactNode } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { useToday } from "@/shared/hooks/useToday";
import Icon from "@/shared/ui/Icon/Icon";

import { selectTodoById } from "../../model/selectors";
import { dropTodo } from "../../model/thunks";
import { stripTags } from "../../model/todo";
import { todoMoved } from "../../model/todosSlice";
import { collisions, createAnnouncements, resolveDrop } from "./dnd";

import styles from "./TaskDnd.module.scss";

interface TaskDndProps {
  children: ReactNode;
}

const TaskDnd = ({ children }: TaskDndProps) => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const { t } = useI18n();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = useAppSelector((state) => (activeId === null ? undefined : selectTodoById(state, activeId)));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = ({ active: dragged }: DragStartEvent) => {
    document.documentElement.dataset.dragging = "";
    setActiveId(String(dragged.id));
  };

  const finishDrag = () => {
    delete document.documentElement.dataset.dragging;
    setActiveId(null);
  };

  const handleDragEnd = ({ active: dragged, over }: DragEndEvent) => {
    finishDrag();
    const result = resolveDrop(dragged, over);
    if (result?.type === "target") dispatch(dropTodo(result.id, result.target, today));
    if (result?.type === "reorder") dispatch(todoMoved({ activeId: result.activeId, overId: result.overId }));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisions}
      accessibility={{
        announcements: createAnnouncements(t),
        screenReaderInstructions: { draggable: t("dnd.instructions") },
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={finishDrag}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {active ? (
          <div className={styles.frame}>
            <div className={styles.preview}>
              <span className={styles.title}>{stripTags(active.title) || active.title}</span>
              <Icon name="grip" className={styles.grip} />
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TaskDnd;
