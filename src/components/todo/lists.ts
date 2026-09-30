import type { IconName } from "@/components/ui/Icon/icons";
import type { ListId } from "@/lib/lists";

interface ListMeta {
  label: string;
  icon: IconName;
  emptyTitle: string;
  emptyDescription: string;
}

export const LIST_META: Record<ListId, ListMeta> = {
  all: {
    label: "All tasks",
    icon: "inbox",
    emptyTitle: "No tasks yet",
    emptyDescription: "Add your first task above to get started.",
  },
  today: {
    label: "Today",
    icon: "sun",
    emptyTitle: "Nothing due today",
    emptyDescription: "Tasks due today or overdue show up here.",
  },
  upcoming: {
    label: "Upcoming",
    icon: "calendarDays",
    emptyTitle: "Nothing planned",
    emptyDescription: "Give a task a future date to see it here.",
  },
  important: {
    label: "Important",
    icon: "star",
    emptyTitle: "No important tasks",
    emptyDescription: "Star a task to keep it in focus.",
  },
  completed: {
    label: "Completed",
    icon: "circleCheck",
    emptyTitle: "Nothing completed yet",
    emptyDescription: "Tasks you complete will show up here.",
  },
};
