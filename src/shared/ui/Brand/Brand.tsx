import { cx } from "@/shared/lib/cx";

import styles from "./Brand.module.scss";

interface BrandProps {
  label: string;
  name?: string;
  className?: string;
}

const Brand = ({ label, name, className }: BrandProps) => (
  <a className={cx(styles.brand, className)} href={import.meta.env.BASE_URL} aria-label={label}>
    <img className={styles.logo} src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={30} height={30} />
    {name ? <span className={styles.name}>{name}</span> : null}
  </a>
);

export default Brand;
