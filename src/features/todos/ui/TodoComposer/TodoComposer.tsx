import { useRef, useState, type FormEvent } from "react";

import { useAppDispatch } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import type { ListId } from "@/features/lists/model/lists";
import { useLiquidGlass } from "@/shared/hooks/useLiquidGlass";
import { useShortcut } from "@/shared/hooks/useShortcut";
import { useToday } from "@/shared/hooks/useToday";
import { addDays } from "@/shared/lib/date";
import { isPlainKey } from "@/shared/lib/keyboard";
import Icon from "@/shared/ui/Icon/Icon";
import IconButton from "@/shared/ui/IconButton/IconButton";

import { parseQuickAdd } from "../../model/quickAdd";
import { addTodo } from "../../model/thunks";
import { MAX_TITLE_LENGTH, normalizeTitle } from "../../model/todo";
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
  const { t } = useI18n();
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

  const parsed = parseQuickAdd(title, today);
  const effectiveDueDate = parsed.dueDate ?? dueDate;
  const effectiveImportant = important || parsed.important;
  const canSubmit = normalizeTitle(parsed.title) !== "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (dispatch(addTodo({ title: parsed.title, dueDate: effectiveDueDate, important: effectiveImportant }))) {
      setTitle("");
    }
  };

  return (
    <form ref={formRef} className={styles.composer} onSubmit={handleSubmit} data-glass-light="">
      <Icon name="plus" className={styles.leading} />
      <input
        ref={inputRef}
        id={COMPOSER_INPUT_ID}
        className={styles.input}
        value={title}
        placeholder={t("composer.placeholder")}
        aria-label={t("composer.label")}
        maxLength={MAX_TITLE_LENGTH + 40}
        autoComplete="off"
        enterKeyHint="done"
        onChange={(event) => setTitle(event.target.value)}
      />
      <div className={styles.options}>
        <DuePicker
          value={effectiveDueDate}
          onChange={setDueDate}
          variant="chip"
          label={t("composer.dueDate")}
          detected={parsed.dueDate !== null}
        />
        <IconButton
          icon="star"
          iconFilled={effectiveImportant}
          label={t("composer.important")}
          variant="ghost"
          size="small"
          className={styles.star}
          aria-pressed={effectiveImportant}
          onClick={() => setImportant(!important)}
        />
        <IconButton type="submit" icon="arrowUp" label={t("composer.submit")} variant="accent" disabled={!canSubmit} />
      </div>
    </form>
  );
};

export default TodoComposer;
