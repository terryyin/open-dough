import { readFileSync } from "node:fs";
import { expect, test } from "./support/pageTest.ts";
import { projectAddMachine } from "./support/projectAddMachine.ts";
import { addProjectOnPage } from "./support/projectAddPage.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { startSessionDialog } from "./launchCardPage.ts";
import { processRunning } from "./support/processGroup.ts";
import { settings, back } from "./support/systemSettingsPage.ts";
import { expectFrameIconControl } from "./frameIconControl.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());
const remove = async (page: import("@playwright/test").Page, label: string) => {
  await page
    .getByRole("button", { name: `Remove project ${label}`, exact: true })
    .click();
  await page
    .getByRole("dialog", { name: `Remove ${label}?`, exact: true })
    .getByRole("button", { name: "Remove", exact: true })
    .click();
};

test("global settings has narrow local facts, returns to roster with focus, and browser back/forward keeps project selection", async ({
  page,
}) => {
  const server = await fixture.start("preview");
  await page.goto(`${server.baseURL}/?project=doughnut&view=roster`);
  await expect(
    page.getByRole("heading", { name: "Agent roster", exact: true }),
  ).toBeVisible();
  await expectFrameIconControl(settings(page), "System settings");
  await settings(page).click();
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeFocused();
  const saved = JSON.parse(
    readFileSync(fixture.configurationFile("preview"), "utf8"),
  ) as { id: string; label: string; localPath: string; repository: string }[];
  for (const project of saved) {
    const row = page.getByRole("listitem").filter({
      has: page.getByRole("heading", { name: project.label, exact: true }),
    });
    await expect(row).toContainText(project.repository);
    await expect(row).toContainText(project.localPath);
  }
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowLeft");
  await back(page).click();
  await expect(
    page.getByRole("radio", { name: "Doughnut", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("heading", { name: "Agent roster", exact: true }),
  ).toBeVisible();
  await expect(settings(page)).toBeFocused();
  await page.goForward();
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(settings(page)).toBeFocused();
  await expect(
    page.getByRole("radio", { name: "Doughnut", exact: true }),
  ).toBeChecked();
  const facts = await rawRequest({
    url: `${server.baseURL}/__project-configuration/settings`,
    headers: { Origin: server.origin },
  });
  expect(facts.status).toBe(200);
  expect(facts.headers["cache-control"]).toBe("no-store");
  expect(JSON.parse(facts.body)).toEqual(
    saved.map(({ id, localPath }) => ({ id, localPath })),
  );
  const sources = await rawRequest({
    url: `${server.baseURL}/__project-configuration`,
    headers: { Origin: server.origin },
  });
  expect(sources.body).not.toContain("localPath");
  expect(
    (
      await rawRequest({
        url: `${server.baseURL}/__project-configuration/settings`,
        headers: { Origin: "https://example.com" },
      })
    ).status,
  ).toBe(403);
  expect(
    (
      await rawRequest({
        url: `${server.baseURL}/__project-configuration/settings`,
        method: "POST",
        headers: { Origin: server.origin },
      })
    ).status,
  ).toBe(405);
});

test("direct settings reload knows the selected project; unselected removal preserves it and selected removal chooses the next neighbor", async ({
  page,
}) => {
  const server = await fixture.start("preview");
  await page.goto(`${server.baseURL}/?project=pygardon&view=settings`);
  await remove(page, "Doughnut");
  await back(page).click();
  await expect(
    page.getByRole("radio", { name: "Pygardon", exact: true }),
  ).toBeChecked();
  await settings(page).click();
  await page.reload();
  await remove(page, "Pygardon");
  await back(page).click();
  await expect(
    page.getByRole("radio", { name: "Terry Talks", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("radio", { name: "Pygardon", exact: true }),
  ).toHaveCount(0);
  await reloadUntilRead(page);
  await expect(
    page.getByRole("radio", { name: "Terry Talks", exact: true }),
  ).toBeChecked();
});

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
  const terminal = page.getByRole("region", { name: "Terminal", exact: true });
  const rows = terminal.locator(".xterm-rows");
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
  expect(server.claudeAttaches()).toHaveLength(1);
  expect(processRunning(attach.pid)).toBe(true);
  await page.locator("body").click({ position: { x: 2, y: 2 } });
  expect(
    await page.evaluate(() => document.activeElement === document.body),
  ).toBe(true);
  await page.keyboard.press("Meta+Shift+Escape");
  await page.keyboard.press("Meta+b");
  await back(page).click();
  await expect(terminal).toBeVisible();
  await expect(rows).toContainText("echo before settings");
  await expect(
    page.getByRole("complementary", { name: "Sessions" }),
  ).toBeVisible();
  await terminal.locator(".xterm-helper-textarea").focus();
  await page.keyboard.type("after settings");
  await page.keyboard.press("Enter");
  await expect(rows).toContainText("echo after settings");
  expect(server.claudeAttaches()).toHaveLength(1);
  expect(server.claudeAttaches()[0]?.endedBy).toBeUndefined();
});
