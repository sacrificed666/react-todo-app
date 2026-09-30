import ProgressRing from "@/components/ui/ProgressRing/ProgressRing";
import { pluralize } from "@/lib/text";
import { useAppSelector } from "@/store/hooks";
import { selectCounts } from "@/store/selectors";

const TodoProgress = () => {
  const { total, completed } = useAppSelector(selectCounts);
  if (total === 0) return null;
  return <ProgressRing value={completed} max={total} label={`${completed} of ${pluralize(total, "task")} completed`} />;
};

export default TodoProgress;
