import { cx } from "@/shared/lib/cx";

import { flagUrl } from "../../model/locales";
import type { Locale } from "../../model/translate";

import styles from "./LocaleFlag.module.scss";

interface LocaleFlagProps {
  locale: Locale;
  className?: string;
}

const LocaleFlag = ({ locale, className }: LocaleFlagProps) => (
  <img
    className={cx(styles.flag, className)}
    src={flagUrl(locale)}
    alt=""
    width={20}
    height={15}
    loading="lazy"
    decoding="async"
    referrerPolicy="no-referrer"
    draggable={false}
  />
);

export default LocaleFlag;
