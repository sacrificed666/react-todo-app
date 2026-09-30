const EDITABLE_SELECTOR =
  "textarea, select, [contenteditable]:not([contenteditable='false']), input:not([type=checkbox], [type=radio], [type=button], [type=submit], [type=reset], [type=range], [type=color], [type=file])";

export type KeyMatcher = (event: KeyboardEvent) => boolean;

export const isEditableTarget = (target: EventTarget | null) =>
  target instanceof Element && target.matches(EDITABLE_SELECTOR);

export const isPlainKey =
  (key: string): KeyMatcher =>
  (event) =>
    event.key.toLowerCase() === key && !event.metaKey && !event.ctrlKey && !event.altKey;

export const isUndoKey: KeyMatcher = (event) =>
  (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "z";

export const isApplePlatform = () => /Mac|iPhone|iPad|iPod/.test(globalThis.navigator.userAgent);
