import ListNav from "@/features/lists/ui/ListNav/ListNav";
import Overview from "@/features/lists/ui/Overview/Overview";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { COMPACT_LAYOUT } from "@/shared/lib/media";

import styles from "./Sidebar.module.scss";

const Sidebar = () => {
  const compact = useMediaQuery(COMPACT_LAYOUT);

  return (
    <aside className={styles.sidebar}>
      {compact ? null : <ListNav />}
      <Overview />
    </aside>
  );
};

export default Sidebar;
