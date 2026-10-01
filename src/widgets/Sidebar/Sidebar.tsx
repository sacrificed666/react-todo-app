import { useRef } from "react";

import { useAppSelector } from "@/app/hooks";
import ListNav from "@/features/lists/ui/ListNav/ListNav";
import Overview from "@/features/lists/ui/Overview/Overview";
import TagNav from "@/features/lists/ui/TagNav/TagNav";
import { selectTagCounts } from "@/features/todos/model/selectors";
import { useLiquidGlass } from "@/shared/hooks/useLiquidGlass";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { COMPACT_LAYOUT, WIDE_LAYOUT } from "@/shared/lib/media";

import styles from "./Sidebar.module.scss";

const Sidebar = () => {
  const compact = useMediaQuery(COMPACT_LAYOUT);
  const wide = useMediaQuery(WIDE_LAYOUT);
  const hasTags = useAppSelector((state) => selectTagCounts(state).length > 0);
  const panelRef = useRef<HTMLDivElement>(null);

  useLiquidGlass(panelRef, { bezel: 18, scale: 36 });

  return (
    <aside className={styles.sidebar}>
      {compact && !hasTags ? null : (
        <div ref={panelRef} className={styles.panel} data-glass-light="">
          {compact ? null : <ListNav />}
          <TagNav />
        </div>
      )}
      {wide ? null : <Overview />}
    </aside>
  );
};

export default Sidebar;
