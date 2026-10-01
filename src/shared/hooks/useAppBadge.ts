import { useEffect } from "react";

export const useAppBadge = (count: number) => {
  useEffect(() => {
    if (!("setAppBadge" in navigator)) return;
    const update = count > 0 ? navigator.setAppBadge(count) : navigator.clearAppBadge();
    update.catch(() => {});
  }, [count]);
};
