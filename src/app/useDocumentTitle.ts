import { useEffect } from "react";

import { useI18n } from "@/features/i18n/model/useI18n";
import { useViewInfo } from "@/features/lists/model/useViewInfo";

const APP_NAME = "ToDo";

export const useDocumentTitle = () => {
  const { t } = useI18n();
  const view = useViewInfo();
  const title = view.kind === "list" && view.list === "all" ? t("app.title") : `${view.title} · ${APP_NAME}`;

  useEffect(() => {
    document.title = title;
  }, [title]);
};
