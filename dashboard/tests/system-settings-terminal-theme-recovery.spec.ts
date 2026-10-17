// The page's recovery from a saved terminal theme it cannot use: the read
// problem is shown in System settings with Retry, the sample keeps the default
// until a usable theme is saved, and choosing a theme replaces the unusable
// file. What the terminal theme boundary refuses, and that no refusal changes
// the saved theme, is ./boundary/terminal-theme-boundary.spec.ts.
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { systemSettingsMachine } from "./support/systemSettingsMachine.ts";
import { rawRequest } from "./support/rawHttp.ts";
import {
  terminalThemeFile,
  themeChoice,
} from "./support/terminalThemeSettingsPage.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

test("an unreadable or unknown saved terminal theme is a read problem shown in System settings with Retry", async ({
  page,
}) => {
  const file = terminalThemeFile(fixture.home);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, '{"theme":"dracula"}\n');
  const server = await fixture.start("preview");
  const read = await rawRequest({
    url: `${server.baseURL}/__terminal-theme`,
    headers: { Origin: server.origin },
  });
  expect(read.status).toBe(503);
  expect(read.body).toContain("not one this dashboard knows");
  await page.goto(`${server.baseURL}/?view=settings`);
  const alert = page.getByRole("alert");
  await expect(alert).toContainText("not one this dashboard knows");
  await expect(themeChoice(page).locator("option:checked")).toHaveText(
    "Default",
  );
  writeFileSync(file, "{");
  await alert.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(alert).toContainText("could not be read");
  writeFileSync(file, '{"theme":"light"}\n');
  await alert.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(themeChoice(page).locator("option:checked")).toHaveText("Light");
  chmodSync(file, 0o000);
  try {
    await page.reload();
    await expect(page.getByRole("alert")).toContainText(
      "Check its file permissions",
    );
  } finally {
    chmodSync(file, 0o600);
  }
  writeFileSync(file, '{"theme":"dracula"}\n');
  await page.reload();
  await expect(page.getByRole("alert")).toContainText(
    "not one this dashboard knows",
  );
  await themeChoice(page).selectOption({ label: "Solarized Dark" });
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(JSON.parse(readFileSync(file, "utf8"))).toEqual({
    theme: "solarized-dark",
  });
});
