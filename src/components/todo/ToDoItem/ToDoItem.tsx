import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../store/store";
import { toggleToDo, editToDo, deleteToDo } from "../../../store/slices/todoSlice";
import styles from "./ToDoItem.module.scss";

interface ToDoItemProps {
  id: string;
  text: string;
  isCompleted: boolean;
}

const ToDoItem = ({ id, text, isCompleted }: ToDoItemProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const [newText, setNewText] = useState(text);

  const handleToggle = () => dispatch(toggleToDo(id));

  const handleEdit = () => {
    if (isEditing && newText.trim()) {
      dispatch(editToDo({ id, text: newText.trim() }));
    }
    setIsEditing((prev) => !prev);
  };

  const handleDelete = () => dispatch(deleteToDo(id));

  return (
    <li className={`${styles.item} ${isCompleted ? styles.completed : null}`}>
      <button className={`${styles.button} ${styles.toggle}`} onClick={handleToggle} aria-label="Toggle">
        {isCompleted ? <img className={styles.icon} src="check.svg" alt="Check" /> : null}
      </button>
      {isEditing ? <input className={styles.input} value={newText} onChange={(e) => setNewText(e.target.value)} autoFocus /> : <span className={`${styles.text} ${isCompleted ? styles.completed : null}`}>{text}</span>}
      <button className={`${styles.button} ${styles.edit}`} onClick={handleEdit} aria-label={isEditing ? "Save" : "Edit"}>
        {isEditing ? <img className={styles.icon} src="save.svg" alt="Save" /> : <img className={styles.icon} src="edit.svg" alt="Edit" />}
      </button>
      <button className={`${styles.button} ${styles.delete}`} onClick={handleDelete} aria-label="Delete">
        <img className={styles.icon} src="delete.svg" alt="Delete" />
      </button>
    </li>
  );
};

export default ToDoItem;
