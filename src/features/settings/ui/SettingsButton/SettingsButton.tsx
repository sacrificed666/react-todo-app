import { useAppDispatch } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { overlayOpened } from "@/features/lists/model/viewSlice";
import IconButton, { type IconButtonVariant } from "@/shared/ui/IconButton/IconButton";

interface SettingsButtonProps {
  variant?: IconButtonVariant;
}

const SettingsButton = ({ variant = "glass" }: SettingsButtonProps) => {
  const dispatch = useAppDispatch();
  const { t } = useI18n();

  return (
    <IconButton
      icon="sliders"
      label={t("settings.open")}
      variant={variant}
      aria-haspopup="dialog"
      onClick={() => dispatch(overlayOpened({ kind: "settings" }))}
    />
  );
};

export default SettingsButton;
