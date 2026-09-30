import Icon from "@/components/ui/Icon/Icon";
import IconButton from "@/components/ui/IconButton/IconButton";
import Popover from "@/components/ui/Popover/Popover";
import { usePopover } from "@/components/ui/Popover/usePopover";
import SegmentedControl, { type SegmentedOption } from "@/components/ui/SegmentedControl/SegmentedControl";
import { ACCENTS, type Accent, type Appearance } from "@/lib/theme";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSettings } from "@/store/selectors";
import { accentChanged, appearanceChanged } from "@/store/slices/settingsSlice";

import styles from "./ThemeMenu.module.scss";

const APPEARANCE_OPTIONS: readonly SegmentedOption<Appearance>[] = [
  { value: "system", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const ACCENT_LABELS: Record<Accent, string> = {
  blue: "Ocean blue",
  violet: "Aurora violet",
  sunset: "Sunset",
  forest: "Forest",
  graphite: "Graphite",
};

const ThemeMenu = () => {
  const dispatch = useAppDispatch();
  const { appearance, accent } = useAppSelector(selectSettings);
  const popover = usePopover();

  return (
    <>
      <IconButton icon="palette" label="Appearance" {...popover.triggerProps} />
      <Popover
        id={popover.id}
        popoverRef={popover.ref}
        anchorName={popover.anchorName}
        label="Appearance"
        className={styles.panel}
      >
        <p className={styles.heading}>Appearance</p>
        <SegmentedControl
          label="Colour scheme"
          name="appearance"
          value={appearance}
          options={APPEARANCE_OPTIONS}
          onChange={(next) => dispatch(appearanceChanged(next))}
        />
        <p className={styles.heading}>Accent</p>
        <div role="radiogroup" aria-label="Accent colour" className={styles.swatches}>
          {ACCENTS.map((option) => (
            <label key={option} className={styles.swatch} data-accent={option} title={ACCENT_LABELS[option]}>
              <input
                type="radio"
                name="accent"
                className="visually-hidden"
                value={option}
                checked={option === accent}
                aria-label={ACCENT_LABELS[option]}
                onChange={() => dispatch(accentChanged(option))}
              />
              <span className={styles.dot}>
                <Icon name="check" className={styles.check} />
              </span>
            </label>
          ))}
        </div>
        <p className={styles.caption}>{ACCENT_LABELS[accent]}</p>
      </Popover>
    </>
  );
};

export default ThemeMenu;
