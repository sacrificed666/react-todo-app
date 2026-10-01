import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { LOCALES, type Locale } from "@/features/i18n/model/translate";
import { useI18n } from "@/features/i18n/model/useI18n";
import Icon from "@/shared/ui/Icon/Icon";
import IconButton from "@/shared/ui/IconButton/IconButton";
import Popover from "@/shared/ui/Popover/Popover";
import { usePopover } from "@/shared/ui/Popover/usePopover";
import SegmentedControl, { type SegmentedOption } from "@/shared/ui/SegmentedControl/SegmentedControl";

import { selectSettings } from "../../model/selectors";
import { accentChanged, appearanceChanged, localeChanged } from "../../model/settingsSlice";
import { ACCENTS, APPEARANCES, type Appearance } from "../../model/theme";

import styles from "./SettingsMenu.module.scss";

const SettingsMenu = () => {
  const dispatch = useAppDispatch();
  const { appearance, accent, locale } = useAppSelector(selectSettings);
  const { t } = useI18n();
  const popover = usePopover();

  const appearanceOptions: readonly SegmentedOption<Appearance>[] = APPEARANCES.map((value) => ({
    value,
    label: t(`appearance.${value}`),
  }));

  const localeOptions: readonly SegmentedOption<Locale>[] = LOCALES.map((value) => ({
    value,
    label: t(`locale.${value}`),
  }));

  return (
    <>
      <IconButton icon="palette" label={t("settings.open")} {...popover.triggerProps} />
      <Popover
        id={popover.id}
        popoverRef={popover.ref}
        anchorName={popover.anchorName}
        label={t("settings.open")}
        className={styles.panel}
      >
        <p className={styles.heading}>{t("settings.appearance")}</p>
        <SegmentedControl
          label={t("settings.scheme")}
          name="appearance"
          value={appearance}
          options={appearanceOptions}
          onChange={(next) => dispatch(appearanceChanged(next))}
        />
        <p className={styles.heading}>{t("settings.accent")}</p>
        <div role="radiogroup" aria-label={t("settings.accentLabel")} className={styles.swatches}>
          {ACCENTS.map((option) => (
            <label key={option} className={styles.swatch} data-accent={option} title={t(`accent.${option}`)}>
              <input
                type="radio"
                name="accent"
                className="visually-hidden"
                value={option}
                checked={option === accent}
                aria-label={t(`accent.${option}`)}
                onChange={() => dispatch(accentChanged(option))}
              />
              <span className={styles.dot}>
                <Icon name="check" className={styles.check} />
              </span>
            </label>
          ))}
        </div>
        <p className={styles.caption}>{t(`accent.${accent}`)}</p>
        <p className={styles.heading}>{t("settings.language")}</p>
        <SegmentedControl
          label={t("settings.language")}
          name="locale"
          value={locale}
          options={localeOptions}
          onChange={(next) => dispatch(localeChanged(next))}
        />
      </Popover>
    </>
  );
};

export default SettingsMenu;
