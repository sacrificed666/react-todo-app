import { useRef, useState, type FormEvent } from "react";

import Icon from "@/components/ui/Icon/Icon";
import IconButton from "@/components/ui/IconButton/IconButton";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { useShortcut } from "@/hooks/useShortcut";
import { useToday } from "@/hooks/useToday";
import { addDays } from "@/lib/date";
import { isPlainKey } from "@/lib/keyboard";
import type { ListId } from "@/lib/lists";
import { MAX_TITLE_LENGTH, normalizeTitle } from "@/lib/todo";
import { useAppDispatch } from "@/store/hooks";
import { addTodo } from "@/store/thunks";

import DuePicker from "../DuePicker/DuePicker";
import { COMPOSER_INPUT_ID } from "../ids";

import styles from "./TodoComposer.module.scss";

interface TodoComposerProps {
  list: ListId;
}

const defaultDueDate = (list: ListId, today: string) => {
  if (list === "today") return today;
  if (list === "upcoming") return addDays(today, 1);
  return null;
};

const TodoComposer = ({ list }: TodoComposerProps) => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(() => defaultDueDate(list, today));
  const [important, setImportant] = useState(list === "important");

  useLiquidGlass(formRef, { bezel: 20, scale: 44 });

  useShortcut(isPlainKey("n"), (event) => {
    event.preventDefault();
    inputRef.current?.focus();
  });

  const canSubmit = normalizeTitle(title) !== "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (dispatch(addTodo({ title, dueDate, important }))) setTitle("");
  };

  return (
    <form ref={formRef} className={styles.composer} onSubmit={handleSubmit} data-glass-light="">
      <Icon name="plus" className={styles.leading} />
      <input
        ref={inputRef}
        id={COMPOSER_INPUT_ID}
        className={styles.input}
        value={title}
        placeholder="Add a task"
        aria-label="New task"
        maxLength={MAX_TITLE_LENGTH}
        autoComplete="off"
        enterKeyHint="done"
        onChange={(event) => setTitle(event.target.value)}
      />
      <div className={styles.options}>
        <DuePicker value={dueDate} onChange={setDueDate} variant="chip" label="Due date" />
        <IconButton
          icon="star"
          iconFilled={important}
          label="Important"
          variant="ghost"
          size="small"
          className={styles.star}
          aria-pressed={important}
          onClick={() => setImportant(!important)}
        />
        <IconButton type="submit" icon="arrowUp" label="Add task" variant="accent" disabled={!canSubmit} />
      </div>
    </form>
  );
};

export default TodoComposer;
