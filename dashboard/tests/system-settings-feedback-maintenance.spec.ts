// System settings → Feedback maintenance: off by default, turned on with a
// launch-dialog host and model, saved privately on this machine and shown
// after a reload, turned off by removing its file, and a malformed file
// reported without being rewritten by a read. Nothing else is written.
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { expect, test } from "./support/pageTest.ts";
import { systemSettingsMachine } from "./support/systemSettingsMachine.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

const section = (page: Page) =>
  page.getByRole("region", { name: "Feedback maintenance", exact: true });
const status = (page: Page) =>
  section(page)
    .getByRole("status")
    .filter({ hasText: "Feedback maintenance:" });
const host = (page: Page) => section(page).getByLabel("Host", { exact: true });
const model = (page: Page) =>
  section(page).getByLabel("Model", { exact: true });
const button = (page: Page, name: string) =>
  section(page).getByRole("button", { name, exact: true });

test("feedback maintenance is off by default, saves a private host and model choice, shows it after reload, and turns off by removing its file", async ({
  page,
}) => {
  const server = await fixture.start("preview");
  const dashboard = path.join(fixture.home, ".open-dough/dashboard");
  const file = path.join(dashboard, "feedback-maintenance.json");
  await page.goto(`${server.baseURL}/?view=settings`);
  await expect(status(page)).toHaveText("Feedback maintenance: Off");
  await expect(section(page)).toContainText(
    "Nothing starts automatically yet: this dashboard does not check when feedback maintenance is due.",
  );
  await expect(button(page, "Turn off")).toHaveCount(0);
  expect(existsSync(file)).toBe(false);
  const before = new Map(
    readdirSync(dashboard, { withFileTypes: true }).map((entry) => [
      entry.name,
      entry.isFile()
        ? readFileSync(path.join(dashboard, entry.name), "utf8")
        : undefined,
    ]),
  );

  await expect(host(page).locator("option:checked")).toHaveText("Claude Code");
  await model(page).selectOption({ label: "Opus" });
  await button(page, "Turn on").click();
  await expect(status(page)).toHaveText(
    "Feedback maintenance: On, Claude Code, Opus",
  );
  expect(readFileSync(file, "utf8")).toBe('{"host":"claude","model":"opus"}\n');
  expect(statSync(file).mode & 0o777).toBe(0o600);
  // Only the setting's own file was added; no project, launch or other
  // machine file changed, and no session started.
  expect(readdirSync(dashboard).sort()).toEqual(
    [...before.keys(), "feedback-maintenance.json"].sort(),
  );
  for (const [name, text] of before)
    if (text !== undefined)
      expect(readFileSync(path.join(dashboard, name), "utf8")).toBe(text);
  expect(server.claudeCalls()).toEqual([]);

  await page.reload();
  await expect(status(page)).toHaveText(
    "Feedback maintenance: On, Claude Code, Opus",
  );
  await expect(model(page).locator("option:checked")).toHaveText("Opus");
  await model(page).selectOption({
    label: "Default (your Claude Code setting)",
  });
  await button(page, "Save feedback maintenance").click();
  await expect(status(page)).toHaveText(
    "Feedback maintenance: On, Claude Code, default model (your Claude Code setting)",
  );
  expect(readFileSync(file, "utf8")).toBe('{"host":"claude"}\n');

  await button(page, "Turn off").click();
  await expect(status(page)).toHaveText("Feedback maintenance: Off");
  expect(existsSync(file)).toBe(false);
  await page.reload();
  await expect(status(page)).toHaveText("Feedback maintenance: Off");
  expect(server.claudeCalls()).toEqual([]);
});

test("a malformed feedback maintenance file is reported and left untouched by reads; an explicit Turn on replaces it", async ({
  page,
}) => {
  const server = await fixture.start("preview");
  const file = path.join(
    fixture.home,
    ".open-dough/dashboard/feedback-maintenance.json",
  );
  for (const [malformed, report] of [
    ["{not json\n", "could not be read"],
    ['{"host":"elsewhere"}\n', "is not one this dashboard knows"],
  ] as const) {
    writeFileSync(file, malformed);
    await page.goto(`${server.baseURL}/?view=settings`);
    await expect(section(page).getByRole("alert")).toContainText(report);
    await expect(status(page)).toHaveText(
      "Feedback maintenance: Status unavailable",
    );
    await button(page, "Retry status").click();
    await expect(section(page).getByRole("alert")).toContainText(report);
    expect(readFileSync(file, "utf8")).toBe(malformed);
  }
  await button(page, "Turn on").click();
  await expect(status(page)).toHaveText(
    "Feedback maintenance: On, Claude Code, default model (your Claude Code setting)",
  );
  await expect(section(page).getByRole("alert")).toHaveCount(0);
  expect(readFileSync(file, "utf8")).toBe('{"host":"claude"}\n');
  expect(server.claudeCalls()).toEqual([]);
});
