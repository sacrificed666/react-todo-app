import { useAppSelector } from "@/app/hooks";
import { selectDetailsId } from "@/features/lists/model/selectors";
import Overview from "@/features/stats/ui/Overview/Overview";
import { selectTodoById } from "@/features/todos/model/selectors";
import TaskDetailsPanel from "@/features/todos/ui/TaskDetailsPanel/TaskDetailsPanel";

import styles from "./Inspector.module.scss";

const Inspector = () => {
  const id = useAppSelector(selectDetailsId);
  const todo = useAppSelector((state) => (id === null ? undefined : selectTodoById(state, id)));

  return <div className={styles.inspector}>{todo ? <TaskDetailsPanel key={todo.id} todo={todo} /> : <Overview />}</div>;
};

export default Inspector;
