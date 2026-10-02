import { cx } from "@/shared/lib/cx";

import styles from "./Brand.module.scss";

interface BrandProps {
  label: string;
  compact?: boolean;
  className?: string;
}

const Brand = ({ label, compact = false, className }: BrandProps) => (
  <a className={cx(styles.brand, className)} href={import.meta.env.BASE_URL} aria-label={label}>
    <img className={styles.logo} src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={30} height={30} />
    {compact ? null : <span className={styles.name}>ToDo</span>}
  </a>
);

export default Brand;
