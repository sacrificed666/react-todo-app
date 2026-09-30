import { useRef, useState, type FormEvent } from "react";

import Icon from "@/components/ui/Icon/Icon";
import IconButton from "@/components/ui/IconButton/IconButton";
import { useLiquidGlass } from "@/hooks/useLiquidGlass";
import { useShortcut } from "@/hooks/useShortcut";
import { isPlainKey } from "@/lib/keyboard";
import { MAX_TITLE_LENGTH, normalizeTitle } from "@/lib/todo";
import { useAppDispatch } from "@/store/hooks";
import { addTodo } from "@/store/thunks";

import { COMPOSER_INPUT_ID } from "../ids";

import styles from "./TodoComposer.module.scss";

const TodoComposer = () => {
  const dispatch = useAppDispatch();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");

  useLiquidGlass(formRef, { bezel: 22, scale: 52 });

  useShortcut(isPlainKey("n"), (event) => {
    event.preventDefault();
    inputRef.current?.focus();
  });

  const canSubmit = normalizeTitle(title) !== "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (dispatch(addTodo(title))) setTitle("");
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
      <IconButton type="submit" icon="arrowUp" label="Add task" variant="accent" disabled={!canSubmit} />
    </form>
  );
};

export default TodoComposer;
