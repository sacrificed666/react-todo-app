import { expect, test } from "@playwright/test";

import { option, runCommand, stubFlags } from "./helpers";

test.describe("with a Ukrainian browser", () => {
  test.use({ locale: "uk-UA" });

  test("starts in Ukrainian", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("html")).toHaveAttribute("lang", "uk");
    await expect(page.getByRole("heading", { level: 1, name: "Усі завдання" })).toBeVisible();
    await expect(page).toHaveTitle("Завдання");
  });
});

test("switches the language in the settings and remembers it", async ({ page }) => {
  await stubFlags(page);
  await page.goto("./");
  await runCommand(page, "Open settings");
  await option(page, "Polski").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "pl");
  await page.getByRole("dialog", { name: "Ustawienia" }).getByRole("button", { name: "Gotowe" }).click();

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "pl");
  await expect(page.getByRole("textbox", { name: "Nowe zadanie" })).toBeVisible();
});
