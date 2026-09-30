import { render } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { Provider } from "react-redux";

import { setupStore, type AppStore, type RootState } from "@/store/store";

interface RenderWithStoreOptions {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

export const renderWithStore = (
  ui: ReactElement,
  { preloadedState, store = setupStore(preloadedState) }: RenderWithStoreOptions = {},
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
  return { store, user: userEvent.setup(), ...render(ui, { wrapper: Wrapper }) };
};
