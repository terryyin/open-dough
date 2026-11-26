// The terminal theme chosen in System settings is saved on choosing, shared by
// the machine's dev and preview servers and kept across restart; a failed
// save keeps the saved file. Touch reading and the sample's palette under the
// system appearance are
// ../../dashboard/frontend-tests/configuration/system-settings-terminal-theme.spec.ts.
import { chmodSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../../dashboard/test-support/support/pageTest.ts";
import { systemSettingsMachine } from "../../dashboard/test-support/support/systemSettingsMachine.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { expectServedHomesReach } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import {
  expectThemeShown,
  sampleColor,
  terminalThemeFile,
  themeChoice,
} from "../../dashboard/test-support/support/terminalThemeSettingsPage.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

const savedTheme = () =>
  JSON.parse(readFileSync(terminalThemeFile(fixture.home), "utf8")) as unknown;

// The theme file is one per machine, shared by the dev and preview servers'
// environments, so the theme chosen on one shows on the other. One order
// shows that sharing; the reverse order would read the same file through the
// same boundary (../../dashboard/backend-tests/runtime/serving-modes.spec.ts proves both servers mount it).
test("terminal theme is chosen in System settings, saved on choosing, kept across reload, restart and the dev server, and a failed save returns to the saved theme", async ({
  page,
  context,
}) => {
  const server = await fixture.start("preview");
  expectServedHomesReach(
    server.github,
    defaultRepository,
    fixture.publishedRevision,
  );
  await page.goto(`${server.baseURL}/?view=settings`);
  await expect(
    page.getByRole("heading", { name: "Terminal theme", exact: true }),
  ).toBeVisible();
  await expectThemeShown(page, "Default");
  await expect(sampleColor(page, "bright white")).toBeVisible();
  expect(existsSync(terminalThemeFile(fixture.home))).toBe(false);

  await themeChoice(page).focus();
  await themeChoice(page).selectOption({ label: "Solarized Dark" });
  await expectThemeShown(page, "Solarized Dark");
  await expect(themeChoice(page)).toBeEnabled();
  expect(savedTheme()).toEqual({ theme: "solarized-dark" });

  await page.reload();
  await expectThemeShown(page, "Solarized Dark");
  const port = Number(new URL(server.baseURL).port);
  await fixture.stop(server);
  const restarted = await fixture.start("preview", port);
  await page.reload();
  await expectThemeShown(page, "Solarized Dark");
  const second = await fixture.start("dev");
  expectServedHomesReach(
    second.github,
    defaultRepository,
    fixture.publishedRevision,
  );
  const otherPage = await context.newPage();
  await otherPage.goto(`${second.baseURL}/?view=settings`);
  await expectThemeShown(otherPage, "Solarized Dark");

  const folder = path.dirname(terminalThemeFile(fixture.home));
  chmodSync(folder, 0o500);
  try {
    await themeChoice(page).selectOption({ label: "Light" });
    await expect(page.getByRole("alert")).toContainText("could not be saved");
    await expectThemeShown(page, "Solarized Dark");
    expect(savedTheme()).toEqual({ theme: "solarized-dark" });
  } finally {
    chmodSync(folder, 0o700);
  }
  await page
    .getByRole("alert")
    .getByRole("button", { name: "Retry", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expectThemeShown(page, "Light");
  // The choice shows while it is being saved; enabled means the save settled.
  await expect(themeChoice(page)).toBeEnabled();
  expect(savedTheme()).toEqual({ theme: "light" });

  await themeChoice(page).selectOption({ label: "Default" });
  await expectThemeShown(page, "Default");
  await expect(themeChoice(page)).toBeEnabled();
  expect(savedTheme()).toEqual({ theme: "default" });
  await otherPage.reload();
  await expectThemeShown(otherPage, "Default");
  for (const local of [restarted, second])
    expect(local.claudeCalls()).toEqual([]);
});
