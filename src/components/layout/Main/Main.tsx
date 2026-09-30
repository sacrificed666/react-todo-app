import ListHeader from "@/components/layout/ListHeader/ListHeader";
import TodoComposer from "@/components/todo/TodoComposer/TodoComposer";
import TodoList from "@/components/todo/TodoList/TodoList";
import { useAppSelector } from "@/store/hooks";
import { selectList } from "@/store/selectors";

import styles from "./Main.module.scss";

const Main = () => {
  const list = useAppSelector(selectList);

  return (
    <main className={styles.main}>
      <ListHeader />
      {list === "completed" ? null : <TodoComposer key={list} list={list} />}
      <TodoList />
    </main>
  );
};

export default Main;
