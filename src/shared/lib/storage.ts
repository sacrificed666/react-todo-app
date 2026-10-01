export const getStorage = (): Storage | null => {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
};

export const readJson = (storage: Storage, key: string): unknown => {
  try {
    const raw = storage.getItem(key);
    return raw === null ? undefined : (JSON.parse(raw) as unknown);
  } catch {
    return undefined;
  }
};

export const writeText = (storage: Storage, key: string, value: string) => {
  try {
    if (storage.getItem(key) !== value) storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

export const removeKey = (storage: Storage, key: string) => {
  try {
    storage.removeItem(key);
  } catch {
    return;
  }
};
