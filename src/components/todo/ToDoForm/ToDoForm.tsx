import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import { addToDo } from "../../../store/slices/todoSlice";
import styles from "./ToDoForm.module.scss";

const ToDoForm = () => {
  const [value, setValue] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    dispatch(addToDo(value.trim()));
    setValue("");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input type="text" className={styles.input} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Add new ToDo..." />
      <button type="submit" className={`${styles.button} ${styles.add}`} aria-label="Add">
        <img className={styles.icon} src="add.svg" alt="Add" />
      </button>
    </form>
  );
};

export default ToDoForm;
