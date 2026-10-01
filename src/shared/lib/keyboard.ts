const EDITABLE_SELECTOR =
  "textarea, select, [contenteditable]:not([contenteditable='false']), input:not([type=checkbox], [type=radio], [type=button], [type=submit], [type=reset], [type=range], [type=color], [type=file])";

export type KeyMatcher = (event: KeyboardEvent) => boolean;

export const isEditableTarget = (target: EventTarget | null) =>
  target instanceof Element && target.matches(EDITABLE_SELECTOR);

export const isPlainKey =
  (key: string): KeyMatcher =>
  (event) =>
    event.key.toLowerCase() === key && !event.metaKey && !event.ctrlKey && !event.altKey;

export const isModKey =
  (key: string, { shift = false }: { shift?: boolean } = {}): KeyMatcher =>
  (event) =>
    (event.metaKey || event.ctrlKey) && !event.altKey && event.shiftKey === shift && event.key.toLowerCase() === key;

export const isUndoKey = isModKey("z");

export const isRedoKey: KeyMatcher = (event) =>
  isModKey("z", { shift: true })(event) || (event.ctrlKey && !event.metaKey && isModKey("y")(event));

export const isApplePlatform = () => /Mac|iPhone|iPad|iPod/.test(globalThis.navigator.userAgent);
