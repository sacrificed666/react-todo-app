import type { KeyboardEvent } from "react";

import Icon from "@/components/ui/Icon/Icon";
import type { IconName } from "@/components/ui/Icon/icons";
import IconButton from "@/components/ui/IconButton/IconButton";
import Popover from "@/components/ui/Popover/Popover";
import { usePopover } from "@/components/ui/Popover/usePopover";
import { useToday } from "@/hooks/useToday";
import { cx } from "@/lib/cx";
import { addDays, describeDueDate, formatWeekdayShort } from "@/lib/date";

import styles from "./DuePicker.module.scss";

interface DuePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  variant: "chip" | "icon";
  label: string;
  className?: string;
}

const QUICK_DATES: readonly { label: string; offset: number; icon: IconName }[] = [
  { label: "Today", offset: 0, icon: "sun" },
  { label: "Tomorrow", offset: 1, icon: "calendar" },
  { label: "Next week", offset: 7, icon: "calendarDays" },
];

const DuePicker = ({ value, onChange, variant, label, className }: DuePickerProps) => {
  const today = useToday();
  const popover = usePopover();
  const due = value ? describeDueDate(value, today) : null;

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
          aria-label={due ? `${label}: ${due.label}` : label}
          {...popover.triggerProps}
        >
          <Icon name="calendar" className={styles.chipIcon} />
          {due ? <span>{due.label}</span> : null}
        </button>
      ) : (
        <IconButton
          icon="calendar"
          label={label}
          variant="ghost"
          size="small"
          className={className}
          {...popover.triggerProps}
        />
      )}
      <Popover
        id={popover.id}
        popoverRef={popover.ref}
        anchorName={popover.anchorName}
        label="Due date"
        className={styles.panel}
      >
        <p className={styles.heading}>Due date</p>
        {QUICK_DATES.map((option) => {
          const date = addDays(today, option.offset);
          return (
            <button
              key={option.label}
              type="button"
              className={styles.option}
              aria-pressed={value === date}
              onClick={() => choose(date)}
            >
              <Icon name={option.icon} className={styles.optionIcon} />
              <span className={styles.optionLabel}>{option.label}</span>
              <span className={styles.hint}>{formatWeekdayShort(date)}</span>
            </button>
          );
        })}
        <label className={styles.custom}>
          <span>Pick a date</span>
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
            <span className={styles.optionLabel}>Remove date</span>
          </button>
        ) : null}
      </Popover>
    </>
  );
};

export default DuePicker;
