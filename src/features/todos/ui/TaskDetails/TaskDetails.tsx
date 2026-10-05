import { useId, useState, type KeyboardEvent } from "react";

import { useAppDispatch } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { queryChanged } from "@/features/lists/model/viewSlice";
import ProjectPicker from "@/features/projects/ui/ProjectPicker/ProjectPicker";
import { useToday } from "@/shared/hooks/useToday";
import { formatDateTime } from "@/shared/lib/date";
import Checkbox from "@/shared/ui/Checkbox/Checkbox";
import Icon from "@/shared/ui/Icon/Icon";
import IconButton from "@/shared/ui/IconButton/IconButton";

import { parseChecklist, toggleChecklistItem } from "../../model/checklist";
import { duplicateTodo, removeTodos, toggleTodo } from "../../model/thunks";
import { extractTags, MAX_NOTES_LENGTH, MAX_TITLE_LENGTH, normalizeTitle, type Todo } from "../../model/todo";
import {
  todoImportanceToggled,
  todoNoted,
  todoProjectChanged,
  todoRenamed,
  todoRepeatChanged,
  todoScheduled,
} from "../../model/todosSlice";
import DuePicker from "../DuePicker/DuePicker";
import RepeatPicker from "../RepeatPicker/RepeatPicker";

import styles from "./TaskDetails.module.scss";

interface TaskDetailsProps {
  todo: Todo;
  onClose: () => void;
}

const TaskDetails = ({ todo, onClose }: TaskDetailsProps) => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const { t, intlLocale } = useI18n();
  const notesId = useId();
  const [title, setTitle] = useState(todo.title);
  const [notes, setNotes] = useState(todo.notes);
  const checklist = parseChecklist(notes);
  const tags = extractTags(todo.title);

  const saveTitle = () => {
    if (normalizeTitle(title)) dispatch(todoRenamed(todo.id, title));
    else setTitle(todo.title);
  };

  const handleTitleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    saveTitle();
  };

  const toggleItem = (line: number) => {
    const next = toggleChecklistItem(notes, line);
    setNotes(next);
    dispatch(todoNoted(todo.id, next));
  };

  const showTag = (tag: string) => {
    onClose();
    dispatch(queryChanged(tag));
  };

  const duplicate = () => {
    onClose();
    dispatch(duplicateTodo(todo.id));
  };

  const remove = () => {
    onClose();
    dispatch(removeTodos([todo.id]));
  };

  const timestamps = [
    { key: "details.created", value: todo.createdAt },
    { key: "details.updated", value: todo.updatedAt === todo.createdAt ? null : todo.updatedAt },
    { key: "details.completedAt", value: todo.completedAt },
  ] as const;

  return (
    <div className={styles.form}>
      <h2 className="visually-hidden">{t("details.title")}</h2>
      <div className={styles.head}>
        <Checkbox
          className={styles.toggle}
          checked={todo.completed}
          aria-label={t("details.completed")}
          onChange={() => dispatch(toggleTodo(todo.id, today))}
        />
        <textarea
          className={styles.title}
          value={title}
          rows={1}
          maxLength={MAX_TITLE_LENGTH}
          aria-label={t("details.titleLabel")}
          enterKeyHint="done"
          data-completed={todo.completed || undefined}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={saveTitle}
          onKeyDown={handleTitleKeyDown}
        />
        <IconButton icon="xmark" label={t("details.close")} variant="ghost" size="small" onClick={onClose} />
      </div>

      <div className={styles.toolbar}>
        <DuePicker
          value={todo.dueDate}
          onChange={(dueDate) => dispatch(todoScheduled(todo.id, dueDate))}
          variant="chip"
          label={t("details.dueDate")}
        />
        <RepeatPicker value={todo.repeat} onChange={(repeat) => dispatch(todoRepeatChanged(todo.id, repeat))} />
        <ProjectPicker
          value={todo.projectId}
          onChange={(projectId) => dispatch(todoProjectChanged(todo.id, projectId))}
        />
        <button
          type="button"
          className={styles.toggleButton}
          aria-pressed={todo.important}
          onClick={() => dispatch(todoImportanceToggled(todo.id))}
        >
          <Icon name="star" filled={todo.important} />
          {t("details.important")}
        </button>
        {tags.map((tag) => (
          <button key={tag} type="button" className={styles.tag} onClick={() => showTag(tag)}>
            <Icon name="hash" />
            {tag.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.notes}>
        <label className={styles.label} htmlFor={notesId}>
          <Icon name="notes" />
          {t("details.notes")}
        </label>
        <textarea
          id={notesId}
          className={styles.textarea}
          value={notes}
          maxLength={MAX_NOTES_LENGTH}
          rows={5}
          placeholder={t("details.notesPlaceholder")}
          onChange={(event) => setNotes(event.target.value)}
          onBlur={() => dispatch(todoNoted(todo.id, notes))}
        />
        <p className={styles.counter} aria-hidden="true">
          {t("details.notesCounter", { count: notes.length, max: MAX_NOTES_LENGTH })}
        </p>
      </div>

      {checklist.length > 0 ? (
        <ul className={styles.checklist}>
          {checklist.map((item) => (
            <li key={item.line}>
              <label className={styles.checkItem} data-done={item.done || undefined}>
                <Checkbox size="small" checked={item.done} onChange={() => toggleItem(item.line)} />
                <span>{item.text}</span>
              </label>
            </li>
          ))}
        </ul>
      ) : null}

      <ul className={styles.timestamps}>
        {timestamps.map(({ key, value }) =>
          value === null ? null : <li key={key}>{t(key, { date: formatDateTime(value, intlLocale) })}</li>,
        )}
      </ul>

      <div className={styles.footer}>
        <button type="button" className={styles.footerButton} onClick={duplicate}>
          <Icon name="copy" />
          {t("details.duplicate")}
        </button>
        <button type="button" className={styles.footerButton} data-tone="danger" onClick={remove}>
          <Icon name="trash" />
          {t("details.delete")}
        </button>
      </div>
    </div>
  );
};

export default TaskDetails;
