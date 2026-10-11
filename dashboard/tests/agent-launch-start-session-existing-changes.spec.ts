// The project row's Start session runs in the project's folder on default
// main, so it follows the default-checkout contract of the story dialogs
// (./agent-launch-default-checkout-warning.spec.ts): with a real bare origin
// (./support/startOrigin.ts) and the synthetic `claude`, a default checkout
// holding staged, changed, deleted, or untracked files shows them in the same
// dialog (paths and count, never content) before anything starts. Back
// returns to the text as typed, Cancel starts nothing, and Continue with
// existing changes starts the session as an unattached start always did: in
// the project folder with the changes untouched, the developer's text and the
// reporting context, no established block, and no story, Take, or assignment.
// A clean default checkout starts at once.

import { execFileSync } from "node:child_process";
import { appendFileSync, realpathSync } from "node:fs";
import path from "node:path";
import type { RecordedLaunchRequest } from "../src/launchRequest.ts";
import {
  accept,
  attempts,
  keptStarts,
  launch,
  recordsOf,
} from "./agentLaunchBoundary.ts";
import {
  startSession,
  startSessionDialog,
  startSessionField,
} from "./launchCardPage.ts";
import {
  changedContent as content,
  changedPaths,
  dirty,
  existingChangesHeading as heading,
  status,
} from "./support/defaultCheckoutChanges.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";
import { expect, test } from "./support/preparationPage.ts";
import { expectAdHocReportingInput } from "./support/reportingInputAssertions.ts";
import { openBacklog, originMain } from "./support/sessionDialog.ts";

const text = "Explain how launch records are stored";

const worktrees = (project: string) =>
  execFileSync("git", ["-C", project, "worktree", "list", "--porcelain"], {
    encoding: "utf8",
  });

type Recorded = { readonly request: RecordedLaunchRequest };

// The one session started as an unattached start always was: in the project
// folder, named by the developer's text, sent with only that text and the
// reporting context. Answers what was sent and the record kept.
async function startedUnattached(dashboard: DashboardServer, project: string) {
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  const [call] = dashboard.claudeLaunchCalls();
  expect(call?.cwd).toBe(realpathSync(project));
  expect(call?.argv.slice(0, 3)).toEqual([
    "--bg",
    "--name",
    `Open Dough · Ad hoc · ${text}`,
  ]);
  expect(call?.argv).toHaveLength(4);
  const sent = call?.argv[3] ?? "";
  await expect.poll(() => recordsOf(dashboard, "open-dough")).toHaveLength(1);
  const [record] = (await recordsOf(dashboard, "open-dough")) as Recorded[];
  expectAdHocReportingInput(sent, text, record?.request, dashboard);
  return { sent, record };
}

test("existing changes warn before a session starts, Back keeps the text, Cancel starts nothing, and Continue starts in the project folder with them untouched", async ({
  page,
  dashboard,
  origin,
}) => {
  await openBacklog(page, origin);
  const before = await originMain(origin);
  dirty(origin.project);
  const changes = status(origin.project);
  const places = worktrees(origin.project);

  const button = startSession(page, "Open Dough");
  const dialog = startSessionDialog(page, "Open Dough");
  await button.click();
  const instruction = startSessionField(dialog);
  await instruction.fill(text);
  const start = dialog.getByRole("button", { name: "Start", exact: true });
  await start.click();

  // The warning replaces the text in the same dialog; nothing started.
  const warning = dialog.getByRole("heading", { name: heading });
  await expect(warning).toBeFocused();
  await expect(dialog).toContainText(
    "Continuing includes these changes in this session's result. When committed, all checkout changes are committed together.",
  );
  await expect(dialog).toContainText("4 changed paths");
  await expect(
    dialog.getByRole("list", { name: "4 changed paths" }).getByRole("listitem"),
  ).toHaveText(changedPaths);
  await expect(dialog).toContainText("Wait for review remains selected.");
  await expect(dialog).not.toContainText(content);
  await expect(dialog.getByRole("checkbox")).toHaveCount(0);
  await expect(instruction).toBeHidden();
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await attempts(dashboard)).toEqual([]);

  // Back returns to the text as typed, at Start.
  await dialog.getByRole("button", { name: "Back" }).click();
  await expect(start).toBeFocused();
  await expect(instruction).toHaveValue(text);
  await expect(warning).toHaveCount(0);

  // Cancel starts nothing, and the next opening starts empty.
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await attempts(dashboard)).toEqual([]);
  expect(await recordsOf(dashboard, "open-dough")).toEqual([]);
  expect(status(origin.project)).toBe(changes);

  await button.click();
  await expect(instruction).toHaveValue("");
  await instruction.fill(text);
  await start.click();
  await expect(warning).toBeFocused();

  // Changes made after the warning was shown are shown again.
  appendFileSync(path.join(origin.project, "notes/untracked.txt"), "more\n");
  const proceed = dialog.getByRole("button", {
    name: "Continue with existing changes",
  });
  await proceed.click();
  await expect(dialog.getByRole("status")).toHaveText(
    "The changes in default main changed after they were shown; review them again.",
  );
  await expect(warning).toBeFocused();
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  const confirmed = status(origin.project);

  // Continue starts the session as an unattached start always did.
  dashboard.claudeScenario("launched");
  await proceed.click();
  await expect(dialog).toBeHidden();
  const { sent, record } = await startedUnattached(dashboard, origin.project);
  expect(sent).not.toContain("Established");
  expect(record?.request).toMatchObject({
    source: "open-dough",
    workflow: "ad-hoc",
    host: "claude",
    title: text,
    instruction: text,
  });
  // Local evidence keeps no confirmation, policy, story, or established place.
  for (const absent of ["existingChanges", "policy", "identity"])
    expect(record?.request).not.toHaveProperty(absent);
  for (const absent of ["start", "preparation"])
    expect(record).not.toHaveProperty(absent);
  for (const attempt of (await attempts(dashboard)) as Recorded[])
    expect(attempt.request).not.toHaveProperty("existingChanges");

  // The existing changes stay as they were; nothing was taken, assigned,
  // established, or published.
  expect(status(origin.project)).toBe(confirmed);
  expect(worktrees(origin.project)).toBe(places);
  expect(await keptStarts(dashboard)).toEqual([]);
  expect(await originMain(origin)).toBe(before);
  expect(await origin.takenProfiles()).toEqual([]);
});

test("a clean default checkout starts the session at once, exactly as before", async ({
  page,
  dashboard,
  origin,
}) => {
  await openBacklog(page, origin);
  const before = await originMain(origin);
  const dialog = startSessionDialog(page, "Open Dough");
  await startSession(page, "Open Dough").click();
  await startSessionField(dialog).fill(text);
  dashboard.claudeScenario("launched");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: heading })).toHaveCount(0);
  // Accepted: the launch goes on after the dialog closed.
  const { record } = await startedUnattached(dashboard, origin.project);
  expect(record?.request).not.toHaveProperty("policy");
  expect(status(origin.project)).toBe("");
  expect(await originMain(origin)).toBe(before);
  expect(await origin.takenProfiles()).toEqual([]);
});

test("the boundary takes an unattached policy and confirmation, checks a request naming no policy as Default main, refuses a tracking choice, and keeps no confirmation", async ({
  dashboard,
  origin,
}) => {
  const request = {
    source: "open-dough",
    workflow: "ad-hoc",
    host: "claude",
    instruction: text,
  };
  const defaults = { workspace: "default-checkout", landing: "review" };
  dirty(origin.project);
  dashboard.claudeScenario("launched");

  // A tracking choice is not an unattached session's to make.
  const tracked = await accept(dashboard, {
    ...request,
    policy: { ...defaults, tracking: "one-shot" },
  });
  expect(tracked.status).toBe(400);

  // With or without the default policy named, nothing starts unconfirmed, and
  // a confirmation of something else confirms nothing.
  const found: { kind: string; count: number; fingerprint: string }[] = [];
  for (const asked of [
    request,
    { ...request, policy: defaults },
    { ...request, policy: defaults, existingChanges: "0".repeat(64) },
  ]) {
    const answer = await accept(dashboard, asked);
    expect(answer.status).toBe(200);
    found.push(JSON.parse(answer.body) as (typeof found)[number]);
  }
  expect(new Set(found.map(({ fingerprint }) => fingerprint)).size).toBe(1);
  for (const answer of found)
    expect(answer).toMatchObject({ kind: "existing-changes", count: 4 });
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await attempts(dashboard)).toEqual([]);

  const confirmed = await launch(dashboard, {
    ...request,
    policy: defaults,
    existingChanges: found[0]?.fingerprint,
  });
  expect(confirmed.status).toBe(200);
  const answer = JSON.parse(confirmed.body) as {
    kind: string;
    record?: Recorded;
  };
  expect(answer.kind).toBe("launched");
  expect(answer.record?.request).toMatchObject({ instruction: text });
  expect(answer.record?.request).not.toHaveProperty("existingChanges");
  const [call] = dashboard.claudeLaunchCalls();
  expect(call?.cwd).toBe(realpathSync(origin.project));
  expect(call?.argv.at(-1)).not.toContain("Established");
  for (const attempt of (await attempts(dashboard)) as Recorded[])
    expect(attempt.request).not.toHaveProperty("existingChanges");
});
