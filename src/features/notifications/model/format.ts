import type { Translate } from "@/features/i18n/model/translate";

import type { ToastMessage } from "./toastSlice";

// A toast message as text, with nested messages translated too
export const formatMessage = (t: Translate, message: ToastMessage): string => {
  const params = Object.fromEntries(
    Object.entries(message.params ?? {}).map(([name, value]) => [
      name,
      typeof value === "object" ? formatMessage(t, value) : value,
    ]),
  );
  return t(message.key, params);
};
