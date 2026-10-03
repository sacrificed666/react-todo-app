import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { projectIdOf, type ViewId } from "@/features/lists/model/lists";
import { splitProjectName } from "@/features/projects/model/project";
import { selectProjects } from "@/features/projects/model/selectors";
import ProjectPicker from "@/features/projects/ui/ProjectPicker/ProjectPicker";
import { useRefraction } from "@/shared/hooks/useRefraction";
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
  view: ViewId;
}

const defaultDueDate = (view: ViewId, today: string) => {
  if (view === "today") return today;
  if (view === "upcoming") return addDays(today, 1);
  return null;
};

const TodoComposer = ({ view }: TodoComposerProps) => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const { t } = useI18n();
  const projects = useAppSelector(selectProjects);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(() => defaultDueDate(view, today));
  const [important, setImportant] = useState(view === "important");
  const [project, setProject] = useState(() => projectIdOf(view));
  const [engaged, setEngaged] = useState(false);
  const expanded = engaged || title !== "";

  useRefraction(formRef, { bezel: 20, scale: 44 });

  useEffect(() => {
    if (!engaged) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && formRef.current?.contains(event.target)) return;
      setEngaged(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [engaged]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const handleFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node && !form.contains(next)) setEngaged(false);
    };
    form.addEventListener("focusout", handleFocusOut);
    return () => form.removeEventListener("focusout", handleFocusOut);
  }, []);

  useShortcut(isPlainKey("n"), (event) => {
    event.preventDefault();
    inputRef.current?.focus();
  });

  const parsed = parseQuickAdd(
    title,
    today,
    projects.map(({ id, name }) => ({ id, name, label: splitProjectName(name).label })),
  );
  const effectiveDueDate = parsed.dueDate ?? dueDate;
  const effectiveImportant = important || parsed.important;
  const effectiveProject = parsed.projectId ?? project;
  const canSubmit = normalizeTitle(parsed.title) !== "";

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Escape" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    if (title) {
      setTitle("");
      return;
    }
    event.currentTarget.blur();
    setEngaged(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const draft = {
      title: parsed.title,
      dueDate: effectiveDueDate,
      important: effectiveImportant,
      repeat: parsed.repeat,
      projectId: effectiveProject,
    };
    if (dispatch(addTodo(draft))) {
      setTitle("");
    }
  };

  return (
    <form
      ref={formRef}
      className={styles.composer}
      data-engaged={expanded || undefined}
      data-glass-light=""
      onSubmit={handleSubmit}
    >
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
        onFocus={() => setEngaged(true)}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className={styles.options}>
        <DuePicker
          value={effectiveDueDate}
          onChange={setDueDate}
          variant="chip"
          label={t("composer.dueDate")}
          detected={parsed.dueDate !== null}
        />
        {projects.length > 0 ? (
          <ProjectPicker
            value={effectiveProject}
            onChange={setProject}
            detected={parsed.projectId !== null}
            hideEmptyLabel
          />
        ) : null}
        {parsed.repeat ? (
          <span className={styles.repeat} title={t("composer.detected")}>
            <Icon name="repeat" className={styles.repeatIcon} />
            <span>{t(`repeat.${parsed.repeat}`)}</span>
          </span>
        ) : null}
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
      </div>
      <IconButton
        type="submit"
        icon="arrowUp"
        label={t("composer.submit")}
        variant="accent"
        className={styles.submit}
        disabled={!canSubmit}
      />
    </form>
  );
};

export default TodoComposer;
