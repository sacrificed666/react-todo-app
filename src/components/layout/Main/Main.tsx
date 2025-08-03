import ToDoForm from "../../todo/ToDoForm/ToDoForm";
import ToDoList from "../../todo/ToDoList/ToDoList";
import styles from "./Main.module.scss";

const Main = () => {
  return (
    <main className={styles.main}>
      <ToDoForm />
      <ToDoList />
    </main>
  );
};

export default Main;
