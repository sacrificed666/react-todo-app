import Icon from "../Icon/Icon";
import type { IconName } from "../Icon/icons";

import styles from "./EmptyState.module.scss";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
}

const EmptyState = ({ icon, title, description }: EmptyStateProps) => (
  <div className={styles.empty}>
    <span className={styles.icon}>
      <Icon name={icon} />
    </span>
    <p className={styles.title}>{title}</p>
    <p className={styles.description}>{description}</p>
  </div>
);

export default EmptyState;
