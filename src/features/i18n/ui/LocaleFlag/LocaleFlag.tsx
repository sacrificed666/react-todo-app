import { cx } from "@/shared/lib/cx";

import { flagUrl, type Locale } from "../../model/locales";

import styles from "./LocaleFlag.module.scss";

interface LocaleFlagProps {
  locale: Locale;
  className?: string;
}

// The flag of a language
const LocaleFlag = ({ locale, className }: LocaleFlagProps) => (
  <img
    className={cx(styles.flag, className)}
    src={flagUrl(locale)}
    alt=""
    width={21}
    height={14}
    loading="lazy"
    decoding="async"
    draggable={false}
  />
);

export default LocaleFlag;
