// System settings → Feedback maintenance: off by default, turned on with a
// launch-dialog host and model, saved privately on this machine and shown
// after a reload, turned off by removing its file, and a malformed file
// reported without being rewritten by a read. Nothing else is written.
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { FeedbackMaintenanceChoice } from "../../dashboard/src/feedbackMaintenanceSetting.ts";
import { untilPublishedWorkRead } from "../../dashboard/tests/pageRequestNotes.ts";
import {
  expectPreservedMachineRecordContents,
  machineRecordNames,
  snapshotMachineRecords,
} from "../../dashboard/tests/support/machineRecordNames.ts";
import { expect, test } from "../../dashboard/tests/support/pageTest.ts";
import { systemSettingsMachine } from "../../dashboard/tests/support/systemSettingsMachine.ts";
import {
  chooseModel,
  problem,
  retryStatus,
  saveChoice,
  section,
  selectedHost,
  selectedModel,
  status,
  turnOff,
  turnOffButton,
  turnOn,
} from "../../dashboard/tests/support/feedbackMaintenanceSettingsPage.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

test("feedback maintenance is off by default, saves a private host and model choice, shows it after reload, and turns off by removing its file", async ({
  page,
}) => {
  const server = await fixture.start("preview");
  const dashboard = path.join(fixture.home, ".open-dough/dashboard");
  const file = path.join(dashboard, "feedback-maintenance.json");
  await page.goto(`${server.baseURL}/?view=settings`);
  await expect(status(page)).toHaveText("Feedback maintenance: Off");
  await expect(section(page)).toContainText(
    "one session per due date, listed in Sessions as Feedback maintenance. A quiet completion marks it done without a notification; a report that needs you notifies once and keeps it listed.",
  );
  await expect(turnOffButton(page)).toHaveCount(0);
  expect(existsSync(file)).toBe(false);
  // The page's published-work read retains its answers under
  // retained-answers/ (../server/retainedAnswers.ts); the snapshot waits for
  // it, so what the setting adds is all that differs afterwards.
  await untilPublishedWorkRead(page);
  const before = snapshotMachineRecords(dashboard);

  await expect(selectedHost(page)).toHaveText("Claude Code");
  await chooseModel(page, "Opus");
  await turnOn(page);
  await expect(status(page)).toHaveText(
    "Feedback maintenance: On, Claude Code, Opus, medium effort",
  );
  expect(readFileSync(file, "utf8")).toBe('{"host":"claude","model":"opus"}\n');
  expect(statSync(file).mode & 0o777).toBe(0o600);
  // Only the setting's own file was added; no project, launch or other
  // machine file changed (the incident record aside), and no session started.
  expect(machineRecordNames(dashboard)).toEqual(
    [...before.keys(), "feedback-maintenance.json"].sort(),
  );
  expectPreservedMachineRecordContents(dashboard, before);
  expect(server.claudeCalls()).toEqual([]);

  await page.reload();
  await expect(status(page)).toHaveText(
    "Feedback maintenance: On, Claude Code, Opus, medium effort",
  );
  await expect(selectedModel(page)).toHaveText("Opus");
  await chooseModel(page, "Default (your Claude Code setting)");
  await saveChoice(page);
  await expect(status(page)).toHaveText(
    "Feedback maintenance: On, Claude Code, default model (your Claude Code setting), medium effort",
  );
  expect(readFileSync(file, "utf8")).toBe('{"host":"claude"}\n');

  await turnOff(page);
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
    await expect(problem(page)).toContainText(report);
    await expect(status(page)).toHaveText(
      "Feedback maintenance: Status unavailable",
    );
    await retryStatus(page);
    await expect(problem(page)).toContainText(report);
    expect(readFileSync(file, "utf8")).toBe(malformed);
  }
  await turnOn(page);
  await expect(status(page)).toContainText("Feedback maintenance: On");
  await expect(problem(page)).toHaveCount(0);
  expect(readFileSync(file, "utf8")).toBe('{"host":"claude"}\n');
  expect(server.claudeCalls()).toEqual([]);
});

for (const { name, choice, expected } of [
  {
    name: "Codex without a saved effort",
    choice: { host: "codex" },
    expected:
      "Feedback maintenance: On, Codex, default model (your Codex setting)",
  },
  {
    name: "Codex with an explicit saved effort",
    choice: { host: "codex", effort: "high" },
    expected:
      "Feedback maintenance: On, Codex, default model (your Codex setting), high effort",
  },
  {
    name: "Cursor without a saved effort",
    choice: { host: "cursor" },
    expected:
      "Feedback maintenance: On, Cursor, default model (your Cursor setting)",
  },
] satisfies readonly {
  name: string;
  choice: FeedbackMaintenanceChoice;
  expected: string;
}[]) {
  test(`the status preserves ${name}`, async ({ page }) => {
    const server = await fixture.start("preview");
    const file = path.join(
      fixture.home,
      ".open-dough/dashboard/feedback-maintenance.json",
    );
    const saved = `${JSON.stringify(makeMe.aFeedbackMaintenanceChoice.with(choice).please())}\n`;
    writeFileSync(file, saved);
    await page.goto(`${server.baseURL}/?view=settings`);
    await expect(status(page)).toHaveText(expected);
    expect(readFileSync(file, "utf8")).toBe(saved);
    expect(server.claudeCalls()).toEqual([]);
  });
}
