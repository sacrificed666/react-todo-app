import styles from "./ToDoItem.module.scss";

const ToDoItem = () => {
  return (
    <li className={styles.item}>
      <button className={styles.button}>🟢</button>
      <span className={styles.text}>ToDoItem</span>
      <button className={styles.button}>🟡</button>
      <button className={styles.button}>🔴</button>
    </li>
  );
};

export default ToDoItem;
