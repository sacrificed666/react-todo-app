import styles from "./Backdrop.module.scss";

const ORBS = ["violet", "rose", "amber", "teal", "blue"] as const;

const Backdrop = () => (
  <div className={styles.backdrop} aria-hidden="true">
    <div className={styles.aurora}>
      {ORBS.map((tone) => (
        <span key={tone} className={styles.orb} data-tone={tone} />
      ))}
    </div>
    <div className={styles.waves} />
    <div className={styles.grain} />
  </div>
);

export default Backdrop;
