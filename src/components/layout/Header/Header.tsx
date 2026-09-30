import TodoMenu from "@/components/todo/TodoMenu/TodoMenu";
import TodoProgress from "@/components/todo/TodoProgress/TodoProgress";
import { useToday } from "@/hooks/useToday";
import { toDateKey } from "@/lib/date";

import styles from "./Header.module.scss";

const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" });

const Header = () => {
  const today = new Date(useToday());

  return (
    <header className={styles.header}>
      <p className={styles.date}>
        <time dateTime={toDateKey(today)}>{dateFormatter.format(today)}</time>
      </p>
      <h1 className={styles.title}>ToDo</h1>
      <div className={styles.actions}>
        <TodoProgress />
        <TodoMenu />
      </div>
    </header>
  );
};

export default Header;
