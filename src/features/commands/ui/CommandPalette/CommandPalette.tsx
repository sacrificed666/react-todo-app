import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { LOCALE_INFO, LOCALES, type Locale } from "@/features/i18n/model/locales";
import { useI18n } from "@/features/i18n/model/useI18n";
import LocaleFlag from "@/features/i18n/ui/LocaleFlag/LocaleFlag";
import { LIST_ICONS } from "@/features/lists/model/listIcons";
import { LISTS, projectView } from "@/features/lists/model/lists";
import { selectList, selectPaletteOpen, selectSort } from "@/features/lists/model/selectors";
import { SORT_MODES } from "@/features/lists/model/sort";
import {
  detailsOpened,
  listChanged,
  overlayClosed,
  overlayOpened,
  queryChanged,
  sortChanged,
} from "@/features/lists/model/viewSlice";
import { splitProjectName, type Project } from "@/features/projects/model/project";
import { selectProjects } from "@/features/projects/model/selectors";
import ProjectIcon from "@/features/projects/ui/ProjectIcon/ProjectIcon";
import { selectSettings } from "@/features/settings/model/selectors";
import { EFFECTS, resolveEffects } from "@/features/settings/model/settings";
import {
  accentChanged,
  appearanceChanged,
  backdropChanged,
  effectsChanged,
  glassChanged,
} from "@/features/settings/model/settingsSlice";
import { ACCENTS, APPEARANCES, BACKDROPS, GLASS_STYLES } from "@/features/settings/model/theme";
import { changeLocale } from "@/features/settings/model/thunks";
import { selectTodos } from "@/features/todos/model/selectors";
import { COMPOSER_INPUT_ID } from "@/features/todos/ui/ids";
import { useShortcut } from "@/shared/hooks/useShortcut";
import { useToday } from "@/shared/hooks/useToday";
import { describeDueDate } from "@/shared/lib/date";
import { isModKey } from "@/shared/lib/keyboard";
import { fuzzyScore } from "@/shared/lib/text";
import Dialog from "@/shared/ui/Dialog/Dialog";
import Icon from "@/shared/ui/Icon/Icon";
import type { IconName } from "@/shared/ui/Icon/icons";

import { rankCommands } from "../../model/rank";
import { useTaskCommands } from "../../model/useTaskCommands";

import styles from "./CommandPalette.module.scss";

type CommandGroup = "actions" | "lists" | "projects" | "tasks" | "sort" | "appearance" | "language";

const GROUP_ORDER: readonly CommandGroup[] = [
  "actions",
  "lists",
  "projects",
  "tasks",
  "sort",
  "appearance",
  "language",
];
const TASK_LIMIT = 8;
const APPEARANCE_ICONS = { system: "monitor", light: "sun", dark: "moon" } as const satisfies Record<string, IconName>;

interface Command {
  id: string;
  group: CommandGroup;
  label: string;
  keywords?: string;
  icon: IconName;
  flag?: Locale;
  project?: Project;
  hint?: string;
  current?: boolean;
  run: () => void;
}

const optionId = (listboxId: string, commandId: string) => `${listboxId}-${commandId}`;

const PaletteContent = () => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const { t, intlLocale } = useI18n();
  const listboxId = useId();
  const list = useAppSelector(selectList);
  const sort = useAppSelector(selectSort);
  const settings = useAppSelector(selectSettings);
  const todos = useAppSelector(selectTodos);
  const projects = useAppSelector(selectProjects);
  const taskCommands = useTaskCommands();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const trimmed = query.trim();

  const focusComposer = () => {
    if (list === "completed") flushSync(() => dispatch(listChanged("all")));
    document.getElementById(COMPOSER_INPUT_ID)?.focus();
  };

  const actionCommands: Command[] = [
    { id: "new-task", group: "actions", label: t("palette.newTask"), icon: "plus", hint: "N", run: focusComposer },
    {
      id: "new-project",
      group: "actions",
      label: t("palette.newProject"),
      keywords: "list folder",
      icon: "folder",
      run: () => dispatch(overlayOpened({ kind: "project", projectId: null })),
    },
    ...taskCommands
      .filter((command) => !command.disabled)
      .map(({ id, label, icon, hint, keywords, run }): Command => ({
        id,
        group: "actions",
        label,
        icon,
        hint,
        keywords,
        run,
      })),
  ];

  const foundTasks: Command[] = trimmed
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
          hint: todo.dueDate ? describeDueDate(todo.dueDate, today, intlLocale).label : undefined,
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
    ...projects.map((project): Command => ({
      id: `project-${project.id}`,
      group: "projects",
      label: t("palette.goToProject", { name: splitProjectName(project.name).label }),
      keywords: project.name,
      icon: "folder",
      project,
      current: projectView(project.id) === list,
      run: () => dispatch(listChanged(projectView(project.id))),
    })),
    ...foundTasks,
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
    ...BACKDROPS.map((backdrop): Command => ({
      id: `backdrop-${backdrop}`,
      group: "appearance",
      label: t("palette.background", { name: t(`background.${backdrop}`) }),
      keywords: "wallpaper theme",
      icon: "image",
      current: backdrop === settings.backdrop,
      run: () => dispatch(backdropChanged(backdrop)),
    })),
    ...GLASS_STYLES.map((glass): Command => ({
      id: `glass-${glass}`,
      group: "appearance",
      label: t("palette.glass", { mode: t(`glass.${glass}`) }),
      keywords: "transparency contrast",
      icon: "sparkles",
      current: glass === settings.glass,
      run: () => dispatch(glassChanged(glass)),
    })),
    {
      id: "settings",
      group: "appearance",
      label: t("palette.openSettings"),
      keywords: "preferences options",
      icon: "sliders",
      run: () => dispatch(overlayOpened({ kind: "settings" })),
    },
    ...EFFECTS.map((effects): Command => ({
      id: `effects-${effects}`,
      group: "appearance",
      label: t("palette.effects", { mode: t(`effects.${effects}`) }),
      keywords: `performance ${resolveEffects(effects)}`,
      icon: "bolt",
      current: effects === settings.effects,
      run: () => dispatch(effectsChanged(effects)),
    })),
    ...LOCALES.map((code): Command => ({
      id: `locale-${code}`,
      group: "language",
      label: t("palette.locale", { language: LOCALE_INFO[code].name }),
      keywords: `language ${code}`,
      icon: "globe",
      flag: code,
      current: code === settings.locale,
      run: () => void dispatch(changeLocale(code)),
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
    flushSync(() => dispatch(overlayClosed("palette")));
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
      {command.flag ? (
        <LocaleFlag locale={command.flag} className={styles.optionFlag} />
      ) : command.project ? (
        <ProjectIcon name={command.project.name} color={command.project.color} size="small" />
      ) : (
        <Icon name={command.icon} filled={command.icon === "star"} className={styles.optionIcon} />
      )}
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
      dispatch(open ? overlayClosed("palette") : overlayOpened({ kind: "palette" }));
    },
    { allowInEditable: true },
  );

  return (
    <Dialog
      open={open}
      label={t("palette.label")}
      placement="top"
      onClose={() => dispatch(overlayClosed("palette"))}
      className={styles.dialog}
    >
      <PaletteContent />
    </Dialog>
  );
};

export default CommandPalette;
