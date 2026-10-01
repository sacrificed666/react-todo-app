import { useAppSelector } from "@/app/hooks";
import { selectDetailsId } from "@/features/lists/model/selectors";
import Overview from "@/features/lists/ui/Overview/Overview";
import { selectTodoById } from "@/features/todos/model/selectors";
import DetailsPanel from "@/features/todos/ui/DetailsPanel/DetailsPanel";

import styles from "./Inspector.module.scss";

const Inspector = () => {
  const id = useAppSelector(selectDetailsId);
  const todo = useAppSelector((state) => (id === null ? undefined : selectTodoById(state, id)));

  return <div className={styles.inspector}>{todo ? <DetailsPanel key={todo.id} todo={todo} /> : <Overview />}</div>;
};

export default Inspector;
