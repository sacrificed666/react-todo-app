let applyPendingUpdate: (() => void) | null = null;

export const registerUpdateHandler = (handler: () => void) => {
  applyPendingUpdate = handler;
};

export const applyUpdate = () => {
  if (applyPendingUpdate) applyPendingUpdate();
  else globalThis.location.reload();
};
