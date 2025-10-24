import styles from "./ToDoItem.module.scss";

const ToDoItem = () => {
  return (
    <li className={styles.item}>
      <button className={`${styles.button} ${styles.toggle}`}>🟢</button>
      <span className={styles.text}>ToDoItem</span>
      <button className={`${styles.button} ${styles.edit}`}>🟡</button>
      <button className={`${styles.button} ${styles.delete}`}>🔴</button>
    </li>
  );
};

export default ToDoItem;
