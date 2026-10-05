import { useDeferredValue } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { groupActiveTodos, type TodoGroup } from "@/features/lists/model/groups";
import { LIST_ICONS } from "@/features/lists/model/listIcons";
import { selectList, selectQuery, selectShowCompleted, selectSort } from "@/features/lists/model/selectors";
import { useViewInfo } from "@/features/lists/model/useViewInfo";
import { completedVisibilityToggled } from "@/features/lists/model/viewSlice";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useToday } from "@/shared/hooks/useToday";
import { describeDueDate, formatMonth } from "@/shared/lib/date";
import { COARSE_POINTER } from "@/shared/lib/media";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";

import { selectVisibleTodos } from "../../model/selectors";
import { clearCompleted, rescheduleOverdue } from "../../model/thunks";
import TodoSection from "../TodoSection/TodoSection";

import styles from "./TodoList.module.scss";

const TodoList = () => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const { t, intlLocale } = useI18n();
  const query = useDeferredValue(useAppSelector(selectQuery));
  const { active, completed } = useAppSelector((state) => selectVisibleTodos(state, today, query));
  const list = useAppSelector(selectList);
  const coarse = useMediaQuery(COARSE_POINTER);
  const view = useViewInfo();
  const viewProjectId = view.kind === "project" ? view.project.id : null;
  const viewKey = query.trim() ? "search" : list;
  const sortable = useAppSelector(selectSort) === "manual";
  const showCompleted = useAppSelector(selectShowCompleted);

  const trimmedQuery = query.trim();
  const groups = groupActiveTodos(active, trimmedQuery ? "all" : list, today);

  const groupTitle = (group: TodoGroup) => {
    if (group.kind === "overdue") return t("section.overdue");
    if (group.kind === "month" && group.date) return formatMonth(group.date, today, intlLocale);
    if (group.kind === "day" && group.date) return describeDueDate(group.date, today, intlLocale).label;
    return t("section.todo");
  };

  const isEmpty = active.length === 0 && completed.length === 0;
  const isAllDone = active.length === 0 && completed.length > 0 && list !== "completed" && !trimmedQuery;
  const collapsible = list !== "completed" || trimmedQuery !== "";

  return (
    <div className={styles.list}>
      {groups.map((group) => (
        <TodoSection
          key={`${viewKey}:${group.id}`}
          id={group.id}
          title={groupTitle(group)}
          tone={group.kind === "overdue" ? "overdue" : undefined}
          todos={group.todos}
          sortable={sortable}
          coarse={coarse}
          viewProjectId={viewProjectId}
          hideHeader={
            group.kind === "all" ||
            (view.kind === "list" && list === "today" && groups.length === 1 && group.kind === "day")
          }
          hideDueDate={group.kind === "day"}
          action={
            group.kind === "overdue" ? (
              <button
                type="button"
                className={styles.clear}
                data-glass-light=""
                onClick={() => dispatch(rescheduleOverdue(today))}
              >
                {t("section.moveToToday")}
              </button>
            ) : undefined
          }
        />
      ))}
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
          key={`${viewKey}:completed`}
          id="completed"
          title={t("section.completed")}
          todos={completed}
          sortable={sortable}
          coarse={coarse}
          viewProjectId={viewProjectId}
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
      {isEmpty && view.kind === "list" ? (
        <EmptyState
          icon={LIST_ICONS[view.list]}
          title={t(`lists.${view.list}.emptyTitle`)}
          description={t(`lists.${view.list}.emptyDescription`)}
        />
      ) : null}
      {isEmpty && view.kind === "project" ? (
        <EmptyState
          icon="folder"
          title={t("project.emptyTitle", { name: view.title })}
          description={t("project.emptyDescription", { name: view.title })}
        />
      ) : null}
    </div>
  );
};

export default TodoList;
