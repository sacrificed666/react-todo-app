import { useAppSelector } from "@/app/hooks";
import { selectList, selectSearching } from "@/features/lists/model/selectors";
import ListHeader from "@/features/lists/ui/ListHeader/ListHeader";
import TodoComposer from "@/features/todos/ui/TodoComposer/TodoComposer";
import TodoList from "@/features/todos/ui/TodoList/TodoList";

import styles from "./Workspace.module.scss";

export const WORKSPACE_ID = "tasks";

const Workspace = () => {
  const list = useAppSelector(selectList);
  const searching = useAppSelector(selectSearching);

  return (
    <main id={WORKSPACE_ID} className={styles.main} tabIndex={-1}>
      <ListHeader />
      {searching || list === "completed" ? null : <TodoComposer key={list} view={list} />}
      <TodoList />
    </main>
  );
};

export default Workspace;
