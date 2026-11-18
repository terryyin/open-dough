// A real Default main session's Done pins its comparison in Git. Replacing
// or deleting that record releases those refs through the dashboard API.
import { renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { deleteRecord } from "../../tests/agentLaunchBoundary.ts";
import { openTerminal } from "../../tests/agentTerminalBoundary.ts";
import {
  adHocReview,
  keptAdHocRecord,
  launchDefaultMainSession,
  markAdHocDone,
} from "../../tests/support/adHocReview.ts";
import type { DashboardServer } from "../../tests/support/dashboardServer.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";
import { commitInCheckout } from "../../tests/support/sessionCheckoutWork.ts";
import { git } from "../../tests/support/storyReviewWorktree.ts";

test.use({ serverMode: "boundary" });

const committedAt = "2099-01-02T12:05:00Z";

const refs = (repository: string, prefix = "refs/") =>
  git(repository, "for-each-ref", "--format=%(refname) %(objectname)", prefix)
    .split("\n")
    .filter(Boolean);

async function commitAndMarkDone(dashboard: DashboardServer, checkout: string) {
  const record = await launchDefaultMainSession(
    dashboard,
    "Edit session notes",
  );
  const { sessionId } = record.session;
  const base = git(checkout, "rev-parse", "HEAD");
  const revision = await commitInCheckout(checkout, committedAt, "notes.txt");
  const beforeDone = refs(checkout);
  dashboard.claudeSessionBecomes(sessionId, "working-idle");
  const doneAt = await markAdHocDone(dashboard, sessionId);
  if (doneAt === undefined) throw new Error("Expected durable Done");
  const prefix = `refs/open-dough/session-commits/claude/${sessionId}/`;
  const pair = [`${prefix}0/base ${base}`, `${prefix}0/revision ${revision}`];
  return { record, sessionId, doneAt, prefix, pair, beforeDone };
}

async function deleteKeptSession(dashboard: DashboardServer, session: string) {
  dashboard.claudeListingFails(true);
  const response = await deleteRecord(dashboard, {
    source: "open-dough",
    session,
  });
  expect(JSON.parse(response.body)).toEqual({ kind: "deleted" });
}

async function reopenForDone(dashboard: DashboardServer, sessionId: string) {
  const terminal = await openTerminal(dashboard, {
    sessionId,
    shortId: sessionId,
  });
  try {
    await expect
      .poll(async () => (await keptAdHocRecord(dashboard, sessionId))?.doneAt)
      .toBeUndefined();
  } finally {
    terminal.socket.close();
  }
}

test("Done pins only the comparison pair and deleting the record releases it", async ({
  dashboard,
  origin,
}) => {
  const checkout = origin.project;
  const { sessionId, pair, beforeDone } = await commitAndMarkDone(
    dashboard,
    checkout,
  );
  expect(refs(checkout)).toEqual([...beforeDone, ...pair].sort());

  await deleteKeptSession(dashboard, sessionId);

  expect(refs(checkout)).toEqual(beforeDone);
});

test("a later Done with an unreadable log releases the earlier capture", async ({
  dashboard,
  origin,
  request,
}) => {
  const checkout = origin.project;
  const { sessionId, prefix, pair } = await commitAndMarkDone(
    dashboard,
    checkout,
  );
  expect(refs(checkout, prefix)).toEqual(pair);
  await reopenForDone(dashboard, sessionId);
  // Git can still read and mutate refs in this repository.
  rmSync(path.join(checkout, ".git", "logs"), { recursive: true });
  await markAdHocDone(dashboard, sessionId);

  expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
    kind: "landing-unavailable",
    explanation: "This session's changes were not captured.",
  });
  expect(refs(checkout, prefix)).toEqual([]);

  await deleteKeptSession(dashboard, sessionId);
  expect(refs(checkout, prefix)).toEqual([]);
});

test("a later Done keeps its pair when the repository is also reachable through the old path", async ({
  dashboard,
  origin,
}) => {
  const checkout = origin.project;
  const previous = path.join(origin.machine, "original-git-directory");
  const moved = path.join(origin.machine, "moved-git-directory");
  git(checkout, "init", "--separate-git-dir", previous);
  const base = git(checkout, "rev-parse", "HEAD");
  const { sessionId, prefix, pair } = await commitAndMarkDone(
    dashboard,
    checkout,
  );
  expect(refs(previous, prefix)).toEqual(pair);
  await reopenForDone(dashboard, sessionId);

  renameSync(previous, moved);
  symlinkSync(moved, previous);
  writeFileSync(path.join(checkout, ".git"), `gitdir: ${moved}\n`);
  const revision = await commitInCheckout(
    checkout,
    "2099-01-02T12:10:00Z",
    "more-notes.txt",
  );
  await markAdHocDone(dashboard, sessionId);

  expect(refs(moved, prefix)).toEqual([
    `${prefix}0/base ${base}`,
    `${prefix}0/revision ${revision}`,
  ]);
});

test("deleting a record from an older failed capture releases refs its earlier Done created", async ({
  dashboard,
  origin,
  request,
}) => {
  const checkout = origin.project;
  const { record, sessionId, doneAt, prefix, pair } = await commitAndMarkDone(
    dashboard,
    checkout,
  );
  // An older reader left Done without a comparison and kept its Git refs.
  keepLaunchRecords(dashboard, [{ ...record, doneAt }]);
  expect(await adHocReview(request, dashboard, sessionId)).toMatchObject({
    kind: "landing-unavailable",
    explanation: "This session's changes were not captured.",
  });
  expect(refs(checkout, prefix)).toEqual(pair);

  await deleteKeptSession(dashboard, sessionId);

  expect(refs(checkout, prefix)).toEqual([]);
});
