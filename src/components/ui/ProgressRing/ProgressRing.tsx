import { useRef } from "react";

import { useLiquidGlass } from "@/hooks/useLiquidGlass";

import styles from "./ProgressRing.module.scss";

interface ProgressRingProps {
  value: number;
  max: number;
  label: string;
}

const ProgressRing = ({ value, max, label }: ProgressRingProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const progress = max > 0 ? Math.min(value / max, 1) : 0;

  useLiquidGlass(ref, { bezel: 16, scale: 34 });

  return (
    <div ref={ref} className={styles.badge} data-complete={progress === 1 || undefined} data-glass-light="">
      <span className="visually-hidden">{label}</span>
      <svg className={styles.ring} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle className={styles.track} cx="12" cy="12" r="9" />
        <circle
          className={styles.value}
          cx="12"
          cy="12"
          r="9"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 - progress * 100}
        />
      </svg>
      <span className={styles.text} aria-hidden="true">
        {value}/{max}
      </span>
    </div>
  );
};

export default ProgressRing;
