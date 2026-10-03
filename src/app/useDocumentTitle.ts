import { useEffect } from "react";

import { useI18n } from "@/features/i18n/model/useI18n";
import { useViewInfo } from "@/features/lists/model/useViewInfo";

export const useDocumentTitle = () => {
  const { t } = useI18n();
  const view = useViewInfo();
  const name = t("app.name");
  const title = view.kind === "list" && view.list === "all" ? name : `${view.title} · ${name}`;

  useEffect(() => {
    document.title = title;
  }, [title]);
};
