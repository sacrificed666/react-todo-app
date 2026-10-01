import { useSyncExternalStore } from "react";

import { getEffectsLevel, subscribeToEffects } from "../lib/effects";

export const useEffectsLevel = () => useSyncExternalStore(subscribeToEffects, getEffectsLevel, getEffectsLevel);
