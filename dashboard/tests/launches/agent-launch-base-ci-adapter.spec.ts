// A project with ciAdapter is judged from its adapter's discover attempts
// run in the project folder: a failing nearest attempt asks before start;
// an adapter exit failure is "could not be read". Same installed-start and
// fake-GitHub history harness as agent-launch-base-ci.spec.ts.

import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { keptStarts } from "../agentLaunchBoundary.ts";
import { expect, test } from "../support/preparationPage.ts";
import { publishLaterHead } from "../support/publishLaterHead.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { parts } from "../dashboardPage.ts";
import { originMain } from "../support/sessionDialog.ts";

const baseCiFailedHeading = "Base CI failed";
const baseCiUnreadHeading = "Base CI could not be read";
const adapterRelative = "scripts/base-ci-fixture-adapter.mjs";

function installAdapter(project: string, body: string): void {
  const adapterPath = path.join(project, adapterRelative);
  mkdirSync(path.dirname(adapterPath), { recursive: true });
  writeFileSync(adapterPath, body);
  chmodSync(adapterPath, 0o700);
  mkdirSync(path.join(project, ".planning"), { recursive: true });
  writeFileSync(
    path.join(project, ".planning", "open-dough.json"),
    `${JSON.stringify({
      ciAdapter: [process.execPath, adapterRelative],
    })}\n`,
  );
}

test("a failing nearest adapter attempt asks; Back starts nothing", async ({
  page,
  dashboard,
  origin,
}) => {
  const before = await originMain(origin);
  const { ancestor, head, published } = await publishLaterHead(
    origin,
    page,
    "planning after adapter failure",
  );
  // Commit history still comes from fake GitHub; Actions answers are unused
  // once ciAdapter is configured on disk in the project folder.
  published.serveActions(() => undefined);
  const runUrl = "https://ci.invalid/adapter-failed";
  installAdapter(
    origin.project,
    `#!${process.execPath}
let input = '';
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
if (request.operation !== 'discover') {
  process.stderr.write('unexpected operation');
  process.exit(1);
}
process.stdout.write(JSON.stringify({
  attempts: [{
    runId: 'adapter-run',
    attemptId: '1',
    sha: ${JSON.stringify(ancestor)},
    outcome: 'failure',
    url: ${JSON.stringify(runUrl)},
    time: '2026-10-01T00:00:00Z',
  }],
}));
`,
  );

  await openUntilRead(page);
  const card = parts(page).backlog.getByRole("article", { name: "Story A" });
  await card.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  const instruction = dialog.getByRole("textbox", {
    name: "Instruction (optional)",
  });
  await instruction.fill("Fix the adapter base.");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  const warning = dialog.getByRole("heading", { name: baseCiFailedHeading });
  await expect(warning).toBeFocused();
  await expect(dialog).toContainText("main");
  await expect(dialog).toContainText(ancestor.slice(0, 7));
  await expect(dialog).toContainText(
    "One later commit has no result of its own.",
  );
  await expect(dialog).toContainText(runUrl);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(await originMain(origin)).toBe(head);
  expect(await origin.takenProfiles()).toEqual([]);

  await dialog.getByRole("button", { name: "Back" }).click();
  await expect(
    dialog.getByRole("button", { name: "Start", exact: true }),
  ).toBeFocused();
  await expect(instruction).toHaveValue("Fix the adapter base.");
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(await origin.takenProfiles()).toEqual([]);
  expect(await originMain(origin)).toBe(head);
  expect(before).not.toBe(head);
});

test("a running adapter attempt shows its nearest completed ancestor", async ({
  page,
  dashboard,
  origin,
}) => {
  const completed = await publishLaterHead(
    origin,
    page,
    "adapter completed base",
  );
  const { head, published } = await publishLaterHead(
    origin,
    page,
    "adapter running base",
  );
  published.serveActions(() => undefined);
  installAdapter(
    origin.project,
    `#!${process.execPath}
let input = '';
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
if (request.operation !== 'discover') process.exit(1);
process.stdout.write(JSON.stringify({ attempts: [
  { runId: 'running', attemptId: '1', sha: ${JSON.stringify(head)}, outcome: 'pending', url: 'https://ci.invalid/adapter-running', time: '2026-10-01T00:02:00Z' },
  { runId: 'completed', attemptId: '1', sha: ${JSON.stringify(completed.head)}, outcome: 'success', url: 'https://ci.invalid/adapter-completed', time: '2026-10-01T00:01:00Z' },
] }));
`,
  );
  await openUntilRead(page);
  await parts(page)
    .backlog.getByRole("article", { name: "Story A" })
    .getByRole("button", { name: "Start execution" })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    dialog.getByRole("heading", { name: "Base CI still running" }),
  ).toBeFocused();
  await expect(dialog).toContainText(
    `Nearest completed ancestor: ${completed.head.slice(0, 7)} (adapter completed base) — passed.`,
  );
  await expect(
    dialog.getByRole("link", {
      name: "https://ci.invalid/adapter-completed",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("link", {
      name: "https://ci.invalid/adapter-running",
      exact: true,
    }),
  ).toBeVisible();
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(await origin.takenProfiles()).toEqual([]);
});

test("an adapter exit failure asks as could not be read", async ({
  page,
  dashboard,
  origin,
}) => {
  const { published } = await publishLaterHead(
    origin,
    page,
    "planning with adapter exit",
  );
  published.serveActions(() => undefined);
  installAdapter(
    origin.project,
    `#!${process.execPath}
process.stderr.write('adapter discover failed');
process.exit(1);
`,
  );

  await openUntilRead(page);
  const card = parts(page).backlog.getByRole("article", { name: "Story A" });
  await card.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await dialog.getByRole("button", { name: "Start", exact: true }).click();

  const warning = dialog.getByRole("heading", { name: baseCiUnreadHeading });
  await expect(warning).toBeFocused();
  await expect(dialog).toContainText("main");
  await expect(dialog).toContainText("could not have its CI read.");
  await expect(dialog).toContainText("Command failed:");
  await expect(
    dialog.getByRole("button", { name: "Continue without CI result" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: baseCiFailedHeading }),
  ).toHaveCount(0);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(await origin.takenProfiles()).toEqual([]);
});
