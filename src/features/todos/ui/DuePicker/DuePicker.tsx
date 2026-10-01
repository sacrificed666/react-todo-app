import { useState, type KeyboardEvent } from "react";
import { flushSync } from "react-dom";

import { useI18n } from "@/features/i18n/model/useI18n";
import { useToday } from "@/shared/hooks/useToday";
import { cx } from "@/shared/lib/cx";
import { addDays, describeDueDate, formatWeekdayShort } from "@/shared/lib/date";
import Icon from "@/shared/ui/Icon/Icon";
import type { IconName } from "@/shared/ui/Icon/icons";
import IconButton from "@/shared/ui/IconButton/IconButton";
import Popover from "@/shared/ui/Popover/Popover";
import { usePopover } from "@/shared/ui/Popover/usePopover";

import styles from "./DuePicker.module.scss";

interface DuePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  variant: "chip" | "icon";
  label: string;
  detected?: boolean;
  className?: string;
}

const QUICK_DATES = [
  { key: "due.today", offset: 0, icon: "sun" },
  { key: "due.tomorrow", offset: 1, icon: "calendar" },
  { key: "due.nextWeek", offset: 7, icon: "calendarDays" },
] as const satisfies readonly { key: string; offset: number; icon: IconName }[];

const DuePicker = ({ value, onChange, variant, label, detected = false, className }: DuePickerProps) => {
  const today = useToday();
  const { t, locale } = useI18n();
  const popover = usePopover();
  const [open, setOpen] = useState(false);
  const due = value ? describeDueDate(value, today, locale) : null;

  const handleToggle = (next: boolean) => {
    if (next) flushSync(() => setOpen(true));
    else setOpen(false);
  };

  const choose = (next: string | null) => {
    popover.close();
    onChange(next);
  };

  const handleDateKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    popover.close();
  };

  return (
    <>
      {variant === "chip" ? (
        <button
          type="button"
          className={cx(styles.chip, className)}
          data-tone={due?.tone}
          data-empty={due ? undefined : ""}
          data-detected={detected ? "" : undefined}
          data-due-trigger=""
          aria-label={due ? t("due.chip", { date: due.label }) : label}
          title={detected ? t("composer.detected") : undefined}
          {...popover.triggerProps}
        >
          <Icon name={detected ? "sparkles" : "calendar"} className={styles.chipIcon} />
          {due ? <span className={styles.chipLabel}>{due.label}</span> : null}
        </button>
      ) : (
        <IconButton
          icon="calendar"
          label={label}
          variant="ghost"
          size="small"
          className={className}
          data-due-trigger=""
          {...popover.triggerProps}
        />
      )}
      <Popover
        id={popover.id}
        popoverRef={popover.ref}
        anchorName={popover.anchorName}
        label={t("due.heading")}
        className={styles.panel}
        onToggle={handleToggle}
      >
        {open ? (
          <>
            <p className={styles.heading}>{t("due.heading")}</p>
            {QUICK_DATES.map((option) => {
              const date = addDays(today, option.offset);
              return (
                <button
                  key={option.key}
                  type="button"
                  className={styles.option}
                  aria-pressed={value === date}
                  onClick={() => choose(date)}
                >
                  <Icon name={option.icon} className={styles.optionIcon} />
                  <span className={styles.optionLabel}>{t(option.key)}</span>
                  <span className={styles.hint}>{formatWeekdayShort(date, locale)}</span>
                </button>
              );
            })}
            <label className={styles.custom}>
              <span>{t("due.pick")}</span>
              <input
                type="date"
                className={styles.date}
                value={value ?? ""}
                onChange={(event) => onChange(event.target.value || null)}
                onKeyDown={handleDateKeyDown}
              />
            </label>
            {value ? (
              <button type="button" className={cx(styles.option, styles.remove)} onClick={() => choose(null)}>
                <Icon name="xmark" className={styles.optionIcon} />
                <span className={styles.optionLabel}>{t("due.remove")}</span>
              </button>
            ) : null}
          </>
        ) : null}
      </Popover>
    </>
  );
};

export default DuePicker;
