import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { selectTodos } from "@/features/todos/model/selectors";
import { dayFromToday } from "@/test/factories";
import { renderApp } from "@/test/render";

describe("TodoComposer quick add", () => {
  it("recognises dates, importance and tags while typing", async () => {
    const { user, store } = renderApp([]);
    const input = screen.getByRole("textbox", { name: "New task" });

    await user.type(input, "Call the plumber tomorrow !");

    expect(screen.getByRole("button", { name: "Due date: Tomorrow" })).toHaveAttribute(
      "title",
      "Recognised from the title",
    );
    expect(screen.getByRole("button", { name: "Important" })).toHaveAttribute("aria-pressed", "true");

    await user.keyboard("{Enter}");

    expect(selectTodos(store.getState())[0]).toMatchObject({
      title: "Call the plumber",
      dueDate: dayFromToday(1),
      important: true,
    });
    expect(screen.getByRole("button", { name: "Important" })).toHaveAttribute("aria-pressed", "false");
  });

  it("understands Ukrainian phrases and keeps hashtags", async () => {
    const { user, store } = renderApp([]);

    await user.type(screen.getByRole("textbox", { name: "New task" }), "Купити квіти #дім через 3 дні{Enter}");

    expect(selectTodos(store.getState())[0]).toMatchObject({ title: "Купити квіти #дім", dueDate: dayFromToday(3) });
  });

  it("lets a recognised date override the picker only while it is typed", async () => {
    const { user } = renderApp([], "today");
    const input = screen.getByRole("textbox", { name: "New task" });

    expect(screen.getByRole("button", { name: "Due date: Today" })).toBeInTheDocument();
    await user.type(input, "Report next week");
    expect(screen.getByRole("button", { name: /^Due date: / })).not.toHaveAccessibleName("Due date: Today");

    await user.clear(input);
    expect(screen.getByRole("button", { name: "Due date: Today" })).toBeInTheDocument();
  });
});
