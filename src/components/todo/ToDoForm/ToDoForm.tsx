import styles from "./ToDoForm.module.scss";

const ToDoForm = () => {
  const handleSubmit = () => {};

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input type="text" className={styles.input} />
      <button type="submit" className={styles.button}>
        ⚪️
      </button>
    </form>
  );
};

export default ToDoForm;
