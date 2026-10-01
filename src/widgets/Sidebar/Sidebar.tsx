import { useRef } from "react";

import { useAppSelector } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import ListNav from "@/features/lists/ui/ListNav/ListNav";
import TagNav from "@/features/lists/ui/TagNav/TagNav";
import Overview from "@/features/stats/ui/Overview/Overview";
import { selectTagCounts } from "@/features/todos/model/selectors";
import { useLiquidGlass } from "@/shared/hooks/useLiquidGlass";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useToday } from "@/shared/hooks/useToday";
import { COMPACT_LAYOUT, WIDE_LAYOUT } from "@/shared/lib/media";

import styles from "./Sidebar.module.scss";

const Sidebar = () => {
  const { t } = useI18n();
  const today = useToday();
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
      <p className={styles.credits}>
        © {today.slice(0, 4)}{" "}
        <a className={styles.link} href="https://github.com/sacrificed666" target="_blank" rel="noreferrer">
          Illia Movchko
        </a>
        <span aria-hidden="true"> · </span>
        <a
          className={styles.link}
          href="https://github.com/sacrificed666/react-todo-app"
          target="_blank"
          rel="noreferrer"
        >
          {t("credits.source")}
        </a>
      </p>
    </aside>
  );
};

export default Sidebar;
