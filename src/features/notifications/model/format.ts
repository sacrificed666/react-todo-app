import type { Translate } from "@/features/i18n/model/translate";

import type { ToastMessage } from "./toastSlice";

export const formatMessage = (t: Translate, message: ToastMessage): string => {
  const params = Object.fromEntries(
    Object.entries(message.params ?? {}).map(([name, value]) => [
      name,
      typeof value === "object" ? formatMessage(t, value) : value,
    ]),
  );
  return t(message.key, params);
};
