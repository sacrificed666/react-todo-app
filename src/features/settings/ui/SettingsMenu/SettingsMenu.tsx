import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { LOCALE_NAMES } from "@/features/i18n/model/locales";
import { LOCALES } from "@/features/i18n/model/translate";
import { useI18n } from "@/features/i18n/model/useI18n";
import LocaleFlag from "@/features/i18n/ui/LocaleFlag/LocaleFlag";
import Icon from "@/shared/ui/Icon/Icon";
import IconButton from "@/shared/ui/IconButton/IconButton";
import Popover from "@/shared/ui/Popover/Popover";
import { usePopover } from "@/shared/ui/Popover/usePopover";
import SegmentedControl, { type SegmentedOption } from "@/shared/ui/SegmentedControl/SegmentedControl";

import { selectSettings } from "../../model/selectors";
import { EFFECTS, resolveEffects, type Effects } from "../../model/settings";
import { accentChanged, appearanceChanged, effectsChanged } from "../../model/settingsSlice";
import { ACCENTS, APPEARANCES, type Appearance } from "../../model/theme";
import { changeLocale } from "../../model/thunks";

import styles from "./SettingsMenu.module.scss";

const SettingsMenu = () => {
  const dispatch = useAppDispatch();
  const { appearance, accent, locale, effects } = useAppSelector(selectSettings);
  const { t } = useI18n();
  const popover = usePopover();

  const appearanceOptions: readonly SegmentedOption<Appearance>[] = APPEARANCES.map((value) => ({
    value,
    label: t(`appearance.${value}`),
  }));

  const effectsOptions: readonly SegmentedOption<Effects>[] = EFFECTS.map((value) => ({
    value,
    label: t(`effects.${value}`),
  }));

  return (
    <>
      <IconButton icon="sliders" label={t("settings.open")} {...popover.triggerProps} />
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
        <div role="radiogroup" aria-label={t("settings.language")} className={styles.languages}>
          {LOCALES.map((code) => (
            <label key={code} className={styles.language}>
              <input
                type="radio"
                name="locale"
                className="visually-hidden"
                value={code}
                checked={code === locale}
                onChange={() => void dispatch(changeLocale(code))}
              />
              <LocaleFlag locale={code} />
              <span className={styles.languageName} lang={code}>
                {LOCALE_NAMES[code]}
              </span>
              <Icon name="check" className={styles.languageCheck} />
            </label>
          ))}
        </div>

        <p className={styles.heading}>{t("settings.effects")}</p>
        <SegmentedControl
          label={t("settings.effects")}
          name="effects"
          value={effects}
          options={effectsOptions}
          onChange={(next) => dispatch(effectsChanged(next))}
        />
        {effects === "auto" ? (
          <p className={styles.caption}>
            <Icon name="bolt" className={styles.captionIcon} />
            {t("effects.autoHint", { mode: t(`effects.${resolveEffects(effects)}`) })}
          </p>
        ) : null}
      </Popover>
    </>
  );
};

export default SettingsMenu;
