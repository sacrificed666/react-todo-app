import { useState } from "react";

import { cx } from "@/shared/lib/cx";

import styles from "./SegmentedControl.module.scss";

export interface SegmentedOption<Value extends string> {
  value: Value;
  label: string;
}

interface SegmentedControlProps<Value extends string> {
  label: string;
  name: string;
  value: Value;
  options: readonly SegmentedOption<Value>[];
  onChange: (value: Value) => void;
  className?: string;
}

// A native radio group styled as segments
const SegmentedControl = <Value extends string>({
  label,
  name,
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<Value>) => {
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );

  // Slides the indicator towards the chosen segment
  const select = (index: number, next: Value) => {
    setDirection(index >= selectedIndex ? "forward" : "backward");
    onChange(next);
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx(styles.control, className)}
      data-direction={direction}
      style={{ "--count": options.length, "--index": selectedIndex }}
    >
      <span className={styles.indicator} aria-hidden="true" />
      {options.map((option, index) => (
        <label key={option.value} className={styles.option} data-selected={option.value === value || undefined}>
          <input
            type="radio"
            className={styles.input}
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => select(index, option.value)}
          />
          <span className={styles.label}>{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default SegmentedControl;
