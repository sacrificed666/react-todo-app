import ToDoItem from "../ToDoItem/ToDoItem";
import styles from "./ToDoList.module.scss";

const ToDoList = () => {
  return (
    <ul className={styles.list}>
      <ToDoItem />
      <ToDoItem />
      <ToDoItem />
    </ul>
  );
};

export default ToDoList;
