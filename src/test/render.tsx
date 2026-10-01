import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { Provider } from "react-redux";
import { vi } from "vitest";

import App from "@/app/App";
import { setupStore, type AppStore, type RootState } from "@/app/store";
import type { ListId } from "@/features/lists/model/lists";
import type { Todo } from "@/features/todos/model/todo";

import { makeState, sampleTodos } from "./factories";

interface RenderWithStoreOptions {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

export type User = ReturnType<typeof userEvent.setup>;

export const renderWithStore = (
  ui: ReactElement,
  { preloadedState, store = setupStore(preloadedState) }: RenderWithStoreOptions = {},
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
  return { store, user: userEvent.setup(), ...render(ui, { wrapper: Wrapper }) };
};

export const renderApp = (todos: readonly Todo[] = sampleTodos, list: ListId = "all") =>
  renderWithStore(<App />, { preloadedState: makeState(todos, list) });

export const openPopover = async (user: User, trigger: HTMLElement) => {
  await user.click(trigger);
  const popover = document.getElementById(trigger.getAttribute("popovertarget") ?? "");
  if (!popover) throw new Error("Popover not found");
  return within(popover);
};

export const section = (name: RegExp) => screen.getByRole("region", { name });

export const itemTitles = (region: HTMLElement) =>
  within(region)
    .queryAllByRole("checkbox")
    .map((checkbox) => checkbox.getAttribute("aria-label"));

export const mockMediaQueries = (matching: readonly string[]) =>
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query) =>
      ({
        matches: matching.includes(query) || query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent: () => false,
      }) satisfies MediaQueryList,
  );
