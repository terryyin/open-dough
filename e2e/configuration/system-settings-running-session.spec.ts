// Opening System settings over a running native session hides its terminal
// without ending or re-attaching it: the same attach keeps its context when
// the dashboard returns.
import { expect, test } from "../../dashboard/test-support/support/pageTest.ts";
import { projectAddMachine } from "../../dashboard/test-support/support/projectAddMachine.ts";
import { addProjectOnPage } from "../../dashboard/test-support/support/projectAddPage.ts";
import { startSessionDialog } from "../../dashboard/test-support/launchStoryCardPage.ts";
import { processRunning } from "../../dashboard/test-support/support/processGroup.ts";
import {
  back,
  settings,
} from "../../dashboard/test-support/support/systemSettingsPage.ts";
import {
  terminalPanel,
  terminalScreenParts,
} from "../../dashboard/test-support/terminalScreenPage.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());

test("opening settings preserves one running native session and its attached terminal context", async ({
  page,
}) => {
  // The built dashboard mounts the terminal once. The dev server's React
  // StrictMode mounts it twice, and its first socket may still attach
  // before that mount's cleanup hangs it up, so counting attaches there
  // would count StrictMode rather than settings.
  const server = await fixture.start("preview");
  await page.goto(server.baseURL);
  await addProjectOnPage(page);
  await page
    .getByRole("button", { name: "Start session in Sample App" })
    .click();
  await startSessionDialog(page, "Sample App")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  const terminal = terminalPanel(page);
  const rows = terminalScreenParts(terminal).rows;
  await expect(rows).toContainText("attached");
  await page.keyboard.type("before settings");
  await page.keyboard.press("Enter");
  await expect(rows).toContainText("echo before settings");
  const attach = server.claudeAttaches()[0];
  expect(attach).toBeDefined();
  if (attach === undefined)
    throw new Error("The native terminal did not attach.");
  await page.getByRole("button", { name: "Sessions", exact: true }).click();
  await settings(page).click();
  await expect(terminal).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeVisible();
  // Viewport changes while settings hide the terminal; touch read, rotation,
  // and Back stay owned by
  // ../../dashboard/frontend-tests/configuration/system-settings-look.spec.ts.
  await page.setViewportSize({ width: 390, height: 320 });
  await page.setViewportSize({ width: 844, height: 390 });
  expect(page.viewportSize()).toEqual({ width: 844, height: 390 });
  expect(server.claudeAttaches()).toHaveLength(1);
  expect(processRunning(attach.pid)).toBe(true);
  await page.locator("body").click({ position: { x: 2, y: 2 } });
  expect(
    await page.evaluate(() => document.activeElement === document.body),
  ).toBe(true);
  await page.keyboard.press("Meta+Shift+Escape");
  await page.keyboard.press("Meta+b");
  await back(page).click();
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(terminal).toBeVisible();
  await expect(rows).toContainText("echo before settings");
  await expect(
    page.getByRole("complementary", { name: "Sessions sidebar", exact: true }),
  ).toBeVisible();
  await terminalScreenParts(terminal).input.focus();
  await page.keyboard.type("after settings");
  await page.keyboard.press("Enter");
  await expect(rows).toContainText("echo after settings");
  expect(server.claudeAttaches()).toHaveLength(1);
  expect(server.claudeAttaches()[0]?.endedBy).toBeUndefined();
});
