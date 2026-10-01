import { StrictMode } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { loadMessages } from "@/features/i18n/model/catalog";
import { applySettings } from "@/features/settings/model/settings";
import { COMPOSER_INPUT_ID } from "@/features/todos/ui/ids";

import App from "./App";
import ErrorBoundary from "./ErrorBoundary";
import { applyLaunchIntent, readLaunchIntent } from "./launch";
import { loadPersistedState, startPersistence } from "./persistence";
import { startPwa } from "./pwa";
import { setupStore } from "./store";

import "@fontsource-variable/montserrat";

import "@/shared/styles/global.scss";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root is missing from index.html.");

const store = setupStore(loadPersistedState());
applySettings(store.getState().settings);
startPersistence(store);

try {
  await loadMessages(store.getState().settings.locale);
} catch {
  document.documentElement.lang = "en";
}

const intent = readLaunchIntent(globalThis.location.search);
if (intent) {
  applyLaunchIntent(store, intent);
  globalThis.history.replaceState(globalThis.history.state, "", globalThis.location.pathname);
}

const root = createRoot(container);
const app = (
  <StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Provider>
  </StrictMode>
);

if (intent?.compose) {
  flushSync(() => root.render(app));
  document.getElementById(COMPOSER_INPUT_ID)?.focus();
} else {
  root.render(app);
}

startPwa(store);
