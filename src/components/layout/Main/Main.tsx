import TodoComposer from "@/components/todo/TodoComposer/TodoComposer";
import TodoList from "@/components/todo/TodoList/TodoList";
import TodoToolbar from "@/components/todo/TodoToolbar/TodoToolbar";

import styles from "./Main.module.scss";

const Main = () => (
  <main className={styles.main}>
    <div className={styles.controls}>
      <TodoComposer />
      <TodoToolbar />
    </div>
    <TodoList />
  </main>
);

export default Main;
