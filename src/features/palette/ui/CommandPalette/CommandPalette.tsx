import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { LOCALES } from "@/features/i18n/model/translate";
import { useI18n } from "@/features/i18n/model/useI18n";
import { LIST_ICONS } from "@/features/lists/model/listIcons";
import { LISTS } from "@/features/lists/model/lists";
import { selectList, selectPaletteOpen, selectSort } from "@/features/lists/model/selectors";
import { SORT_MODES } from "@/features/lists/model/sort";
import {
  detailsOpened,
  listChanged,
  paletteToggled,
  queryChanged,
  sortChanged,
} from "@/features/lists/model/viewSlice";
import { formatMessage } from "@/features/notifications/model/format";
import { selectSettings } from "@/features/settings/model/selectors";
import { accentChanged, appearanceChanged, localeChanged } from "@/features/settings/model/settingsSlice";
import { ACCENTS, APPEARANCES } from "@/features/settings/model/theme";
import { selectHistory, selectListCounts, selectTodos } from "@/features/todos/model/selectors";
import { clearCompleted, exportTodos, redo, undo } from "@/features/todos/model/thunks";
import { allTodosMarked } from "@/features/todos/model/todosSlice";
import { COMPOSER_INPUT_ID } from "@/features/todos/ui/ids";
import { useShortcut } from "@/shared/hooks/useShortcut";
import { useToday } from "@/shared/hooks/useToday";
import { describeDueDate } from "@/shared/lib/date";
import { isApplePlatform, isModKey } from "@/shared/lib/keyboard";
import { fuzzyScore } from "@/shared/lib/text";
import Dialog from "@/shared/ui/Dialog/Dialog";
import Icon from "@/shared/ui/Icon/Icon";
import type { IconName } from "@/shared/ui/Icon/icons";

import { rankCommands } from "../../model/rank";

import styles from "./CommandPalette.module.scss";

type CommandGroup = "actions" | "lists" | "tasks" | "sort" | "appearance" | "language";

const GROUP_ORDER: readonly CommandGroup[] = ["actions", "lists", "tasks", "sort", "appearance", "language"];
const TASK_LIMIT = 8;
const APPEARANCE_ICONS = { system: "monitor", light: "sun", dark: "moon" } as const satisfies Record<string, IconName>;

interface Command {
  id: string;
  group: CommandGroup;
  label: string;
  keywords?: string;
  icon: IconName;
  hint?: string;
  current?: boolean;
  run: () => void;
}

const optionId = (listboxId: string, commandId: string) => `${listboxId}-${commandId}`;

const PaletteContent = () => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const { t, locale } = useI18n();
  const listboxId = useId();
  const list = useAppSelector(selectList);
  const sort = useAppSelector(selectSort);
  const settings = useAppSelector(selectSettings);
  const history = useAppSelector(selectHistory);
  const todos = useAppSelector(selectTodos);
  const counts = useAppSelector((state) => selectListCounts(state, today));
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const modifier = isApplePlatform() ? "⌘" : "Ctrl+";
  const trimmed = query.trim();
  const lastChange = history.past.at(-1);
  const nextChange = history.future.at(-1);
  const allCompleted = counts.total > 0 && counts.all === 0;

  const focusComposer = () => {
    if (list === "completed") flushSync(() => dispatch(listChanged("all")));
    document.getElementById(COMPOSER_INPUT_ID)?.focus();
  };

  const actionCommands: Command[] = [
    { id: "new-task", group: "actions", label: t("palette.newTask"), icon: "plus", hint: "N", run: focusComposer },
    ...(lastChange
      ? [
          {
            id: "undo",
            group: "actions",
            label: `${t("actions.undo")}: ${formatMessage(t, lastChange.description)}`,
            icon: "undo",
            hint: `${modifier}Z`,
            run: () => dispatch(undo()),
          } satisfies Command,
        ]
      : []),
    ...(nextChange
      ? [
          {
            id: "redo",
            group: "actions",
            label: `${t("actions.redo")}: ${formatMessage(t, nextChange.description)}`,
            icon: "redo",
            hint: `${modifier}⇧Z`,
            run: () => dispatch(redo()),
          } satisfies Command,
        ]
      : []),
    ...(counts.total > 0
      ? [
          {
            id: "toggle-all",
            group: "actions",
            label: allCompleted ? t("actions.markAllActive") : t("actions.completeAll"),
            icon: allCompleted ? "rotate" : "checkAll",
            run: () => dispatch(allTodosMarked(!allCompleted)),
          } satisfies Command,
          {
            id: "export",
            group: "actions",
            label: t("actions.export"),
            keywords: "json backup",
            icon: "download",
            run: () => dispatch(exportTodos()),
          } satisfies Command,
        ]
      : []),
    ...(counts.completed > 0
      ? [
          {
            id: "clear",
            group: "actions",
            label: t("actions.clearCompleted"),
            icon: "eraser",
            run: () => dispatch(clearCompleted()),
          } satisfies Command,
        ]
      : []),
  ];

  const taskCommands: Command[] = trimmed
    ? todos
        .flatMap((todo) => {
          const score = fuzzyScore(trimmed, todo.title) ?? (todo.notes ? fuzzyScore(trimmed, todo.notes) : null);
          return score === null ? [] : [{ todo, score }];
        })
        .toSorted((a, b) => b.score - a.score)
        .slice(0, TASK_LIMIT)
        .map(({ todo }) => ({
          id: `task-${todo.id}`,
          group: "tasks",
          label: todo.title,
          keywords: todo.notes,
          icon: todo.completed ? "circleCheck" : todo.important ? "star" : "list",
          hint: todo.dueDate ? describeDueDate(todo.dueDate, today, locale).label : undefined,
          run: () => dispatch(detailsOpened(todo.id)),
        }))
    : [];

  const commands: Command[] = [
    ...actionCommands,
    ...LISTS.map((id, index): Command => ({
      id: `list-${id}`,
      group: "lists",
      label: t("palette.goTo", { list: t(`lists.${id}`) }),
      keywords: id,
      icon: LIST_ICONS[id],
      hint: String(index + 1),
      current: id === list,
      run: () => dispatch(listChanged(id)),
    })),
    ...taskCommands,
    ...SORT_MODES.map((mode): Command => ({
      id: `sort-${mode}`,
      group: "sort",
      label: t("palette.sortBy", { mode: t(`sort.${mode}`) }),
      icon: "sort",
      current: mode === sort,
      run: () => dispatch(sortChanged(mode)),
    })),
    ...APPEARANCES.map((appearance): Command => ({
      id: `appearance-${appearance}`,
      group: "appearance",
      label: t("palette.scheme", { mode: t(`appearance.${appearance}`) }),
      keywords: "theme",
      icon: APPEARANCE_ICONS[appearance],
      current: appearance === settings.appearance,
      run: () => dispatch(appearanceChanged(appearance)),
    })),
    ...ACCENTS.map((accent): Command => ({
      id: `accent-${accent}`,
      group: "appearance",
      label: t("palette.accent", { accent: t(`accent.${accent}`) }),
      keywords: "colour color theme",
      icon: "palette",
      current: accent === settings.accent,
      run: () => dispatch(accentChanged(accent)),
    })),
    ...LOCALES.map((code): Command => ({
      id: `locale-${code}`,
      group: "language",
      label: t("palette.locale", { language: t(`locale.${code}`) }),
      keywords: "language мова",
      icon: "globe",
      current: code === settings.locale,
      run: () => dispatch(localeChanged(code)),
    })),
  ];

  const searchCommand: Command | null = trimmed
    ? {
        id: "search",
        group: "actions",
        label: t("palette.searchFor", { query: trimmed }),
        icon: "search",
        hint: "/",
        run: () => dispatch(queryChanged(trimmed)),
      }
    : null;

  const groups = rankCommands(commands, trimmed, GROUP_ORDER);
  const ranked = groups.flatMap(({ items }) => items);
  const flat = searchCommand ? [...ranked, searchCommand] : ranked;
  const active = flat[Math.min(activeIndex, flat.length - 1)];
  const activeId = active ? optionId(listboxId, active.id) : undefined;

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  const run = (command: Command) => {
    flushSync(() => dispatch(paletteToggled(false)));
    command.run();
  };

  const move = (delta: number) => {
    if (flat.length === 0) return;
    const current = active ? flat.indexOf(active) : 0;
    setActiveIndex((current + delta + flat.length) % flat.length);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      move(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter" && active) {
      event.preventDefault();
      run(active);
    }
  };

  const renderOption = (command: Command) => (
    <div
      key={command.id}
      id={optionId(listboxId, command.id)}
      role="option"
      tabIndex={-1}
      aria-selected={command === active}
      aria-current={command.current ? "true" : undefined}
      className={styles.option}
      onPointerMove={() => setActiveIndex(flat.indexOf(command))}
      onClick={() => run(command)}
      onKeyDown={(event) => {
        if (event.key === "Enter") run(command);
      }}
    >
      <Icon name={command.icon} filled={command.icon === "star"} className={styles.optionIcon} />
      <span className={styles.optionLabel}>{command.label}</span>
      {command.current ? <Icon name="check" className={styles.current} /> : null}
      {command.hint ? <kbd className={styles.hint}>{command.hint}</kbd> : null}
    </div>
  );

  return (
    <div className={styles.palette}>
      <div className={styles.field}>
        <Icon name="command" className={styles.fieldIcon} />
        <input
          className={styles.input}
          role="combobox"
          aria-label={t("palette.label")}
          aria-expanded="true"
          aria-controls={listboxId}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder={t("palette.placeholder")}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
        />
        <kbd className={styles.escape}>esc</kbd>
      </div>
      <div id={listboxId} role="listbox" aria-label={t("palette.label")} className={styles.results}>
        {ranked.length === 0 && trimmed ? (
          <p className={styles.empty}>{t("palette.empty", { query: trimmed })}</p>
        ) : null}
        {groups.map(({ group, items }) => (
          <div key={group} role="group" aria-labelledby={`${listboxId}-${group}`} className={styles.group}>
            <p id={`${listboxId}-${group}`} className={styles.groupLabel}>
              {t(`palette.${group}`)}
            </p>
            {items.map(renderOption)}
          </div>
        ))}
        {searchCommand ? (
          <div role="group" aria-labelledby={`${listboxId}-search`} className={styles.group}>
            <p id={`${listboxId}-search`} className={styles.groupLabel}>
              {t("palette.search")}
            </p>
            {renderOption(searchCommand)}
          </div>
        ) : null}
      </div>
      <div className={styles.footer} aria-hidden="true">
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd>
          {t("palette.navigate")}
        </span>
        <span>
          <kbd>↵</kbd>
          {t("palette.run")}
        </span>
        <span>
          <kbd>esc</kbd>
          {t("palette.close")}
        </span>
      </div>
      <output className="visually-hidden" aria-live="polite">
        {t("palette.results", { count: flat.length })}
      </output>
    </div>
  );
};

const CommandPalette = () => {
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const open = useAppSelector(selectPaletteOpen);

  useShortcut(
    isModKey("k"),
    (event) => {
      event.preventDefault();
      dispatch(paletteToggled(!open));
    },
    { allowInEditable: true },
  );

  return (
    <Dialog
      open={open}
      label={t("palette.label")}
      placement="top"
      onClose={() => dispatch(paletteToggled(false))}
      className={styles.dialog}
    >
      <PaletteContent />
    </Dialog>
  );
};

export default CommandPalette;
