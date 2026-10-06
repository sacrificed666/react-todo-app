import { useI18n } from "@/features/i18n/model/useI18n";
import { useOnlineStatus } from "@/shared/hooks/useOnlineStatus";
import Icon from "@/shared/ui/Icon/Icon";

import styles from "./OfflineBadge.module.scss";

// Shows that changes stay on this device while offline
const OfflineBadge = () => {
  const { t } = useI18n();
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <output className={styles.badge} title={t("header.offlineHint")}>
      <Icon name="cloudOff" />
      <span className="visually-hidden">{t("header.offline")}</span>
    </output>
  );
};

export default OfflineBadge;
