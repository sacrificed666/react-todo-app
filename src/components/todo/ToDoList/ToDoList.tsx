import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import ToDoItem from "../ToDoItem/ToDoItem";
import styles from "./ToDoList.module.scss";

const ToDoList = () => {
  const todos = useSelector((state: RootState) => state.todo);

  return (
    <ul className={styles.list}>
      {todos.map((todo) => (
        <ToDoItem key={todo.id} {...todo} />
      ))}
    </ul>
  );
};

export default ToDoList;
