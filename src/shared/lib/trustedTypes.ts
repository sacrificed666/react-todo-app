export const installScriptUrlPolicy = (allowedPaths: readonly string[]) => {
  if (typeof trustedTypes === "undefined") return false;

  trustedTypes.createPolicy("default", {
    createScriptURL: (input) => {
      const url = new URL(input, globalThis.location.href);
      if (url.origin === globalThis.location.origin && allowedPaths.includes(url.pathname)) return url.href;
      throw new TypeError(`Blocked script URL ${url.href}`);
    },
  });
  return true;
};
