import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import App from "@/App";
import { loadPersistedState, startPersistence } from "@/store/persistence";
import { setupStore } from "@/store/store";

import "@/styles/global.scss";

const container = document.getElementById("root");
if (!container) throw new Error("Root element #root is missing from index.html.");

const store = setupStore(loadPersistedState());
startPersistence(store);

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
