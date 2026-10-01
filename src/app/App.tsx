import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useI18n } from "@/features/i18n/model/useI18n";
import { useListShortcuts } from "@/features/lists/model/useListShortcuts";
import TabBar from "@/features/lists/ui/TabBar/TabBar";
import Toaster from "@/features/notifications/ui/Toaster/Toaster";
import CommandPalette from "@/features/palette/ui/CommandPalette/CommandPalette";
import { useDocumentSync } from "@/features/settings/model/useDocumentSync";
import { selectListCounts } from "@/features/todos/model/selectors";
import { redo, undo } from "@/features/todos/model/thunks";
import TodoDetails from "@/features/todos/ui/TodoDetails/TodoDetails";
import { useAppBadge } from "@/shared/hooks/useAppBadge";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { usePointerLight } from "@/shared/hooks/usePointerLight";
import { useShortcut } from "@/shared/hooks/useShortcut";
import { useToday } from "@/shared/hooks/useToday";
import { isRedoKey, isUndoKey } from "@/shared/lib/keyboard";
import { COMPACT_LAYOUT, WIDE_LAYOUT } from "@/shared/lib/media";
import Backdrop from "@/widgets/Backdrop/Backdrop";
import Footer from "@/widgets/Footer/Footer";
import Header from "@/widgets/Header/Header";
import Inspector from "@/widgets/Inspector/Inspector";
import Sidebar from "@/widgets/Sidebar/Sidebar";
import Workspace, { WORKSPACE_ID } from "@/widgets/Workspace/Workspace";

import styles from "./App.module.scss";

const App = () => {
  const dispatch = useAppDispatch();
  const today = useToday();
  const { t } = useI18n();
  const compact = useMediaQuery(COMPACT_LAYOUT);
  const wide = useMediaQuery(WIDE_LAYOUT);
  const counts = useAppSelector((state) => selectListCounts(state, today));

  usePointerLight();
  useDocumentSync();
  useListShortcuts();
  useAppBadge(counts.today);

  useShortcut(isUndoKey, (event) => {
    event.preventDefault();
    dispatch(undo());
  });

  useShortcut(isRedoKey, (event) => {
    event.preventDefault();
    dispatch(redo());
  });

  return (
    <div className={styles.app}>
      <a className={styles.skip} href={`#${WORKSPACE_ID}`}>
        {t("app.skip")}
      </a>
      <Backdrop />
      <Header />
      <div className={styles.body}>
        <Sidebar />
        <Workspace />
        {wide ? <Inspector /> : null}
      </div>
      <Footer />
      {compact ? <TabBar /> : null}
      {wide ? null : <TodoDetails />}
      <CommandPalette />
      <Toaster />
    </div>
  );
};

export default App;
