// A streaming Board whose held stream is stopped or whose listing fails over
// the stream: lost freshness with the snapshot kept, reopens at the pace, and
// a replaced server across a new revision catches up; a 504 listing leaves the
// watched branch shown. Slots stay free; the server pace is lowered.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  expect,
  githubFor,
  test as base,
} from "../../dashboard/tests/dashboardTest.ts";
import {
  expectSettledPage,
  parts,
  shortRevision,
} from "../../dashboard/tests/dashboardPage.ts";
import {
  passPageMs,
  recordsAt,
} from "../../dashboard/tests/autoRefreshJourney.ts";
import {
  expectLostFreshnessProblem,
  expectStreamOpenGapsAtLeastPace,
  openStreamingAtA,
  streamPaceMs,
  streamServerEnv,
  untilMatchingRefsSince,
  untilStreamingAt,
} from "../../dashboard/tests/revisionStreamJourney.ts";
import {
  backlogB,
  revisionA,
  revisionB,
  titlesOfA,
  titlesOfB,
} from "../../dashboard/tests/refreshJourney.ts";
import { openedSettled } from "../../dashboard/tests/branchRefreshJourney.ts";
import {
  onBranch,
  revision,
} from "../../dashboard/tests/branchProgressRecords.ts";
import { checkIntervalMs } from "../../dashboard/src/revisionCheckSchedule.ts";
import { revisionStreamSilenceMs } from "../../dashboard/src/revisionStreamSchedule.ts";
import {
  sharedDashboardBuild,
  startDashboardServer,
  type DashboardServer,
} from "../../dashboard/tests/support/dashboardServer.ts";
import type { FakeGitHub } from "../../dashboard/tests/support/fakeGitHub.ts";
import { signal } from "../../dashboard/tests/support/processGroup.ts";

const test = base.extend<{ machine: string }>({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  machine: async ({}, use) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-stream-stopped-"));
    await use(machine);
    rmSync(machine, { recursive: true, force: true });
  },
});

test.use({
  preholdRevisionStreamSlots: false,
  extraEnv: streamServerEnv,
});

async function replaceOnPort(
  dashboard: DashboardServer,
  github: FakeGitHub,
  machine: string,
): Promise<DashboardServer> {
  const port = Number(new URL(dashboard.baseURL).port);
  signal(-dashboard.pid, "SIGKILL");
  await dashboard.close();
  return startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    github,
    machine,
    port,
    extraEnv: streamServerEnv,
  });
}

test("a stopped stream shows lost freshness within 45s with R kept; reopens at the pace; a replaced server across R' catches up", async ({
  page,
  dashboard,
  github,
  machine,
}) => {
  const origin = await openStreamingAtA(page);
  const { problem, retrievedAt, readRevision } = parts(page);
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";
  expect(retrievedA).not.toBe("");
  await expect(readRevision).toContainText(shortRevision(revisionA));

  await test.step("SIGSTOP: 45s of page time shows today's failed-check problem with R kept", async () => {
    signal(-dashboard.pid, "SIGSTOP");
    await passPageMs(page, revisionStreamSilenceMs);
    await expectLostFreshnessProblem(page, retrievedA, titlesOfA);
  });

  await test.step("reopen attempts come no more often than the pace", async () => {
    signal(-dashboard.pid, "SIGKILL");
    // Land the reopen scheduled by the silence loss, and let it fail closed.
    await passPageMs(page, checkIntervalMs);
    await page.waitForTimeout(streamPaceMs * 2);
    await expectStreamOpenGapsAtLeastPace(page);
  });

  let replacement: DashboardServer | undefined;
  try {
    await test.step("replaced server across R': first answer names R', page reads it, problem clears", async () => {
      origin.push(revisionB, backlogB, recordsAt("B"));
      const caughtUp = untilStreamingAt(page, revisionB);
      replacement = await replaceOnPort(dashboard, github, machine);
      await passPageMs(page, checkIntervalMs);
      await expectSettledPage(page, titlesOfB);
      await expect(readRevision).toContainText(shortRevision(revisionB));
      await expect(problem).toHaveCount(0);
      await caughtUp;
    });
  } finally {
    await replacement?.close();
  }
});

test("a 504 listing over the stream leaves the watched branch shown", async ({
  page,
}) => {
  const streaming = untilStreamingAt(page, revision);
  const { origin, progress } = await openedSettled(page);
  await streaming;
  await expect(progress).not.toContainText("no longer published");
  const restore = origin.failListing();
  try {
    await untilMatchingRefsSince(page, githubFor(page).calls.length, 1);
    await page.waitForTimeout(streamPaceMs * 3);
    await expect(progress).not.toContainText("no longer published");
    await expect(page.getByRole("article", { name: onBranch })).toBeVisible();
  } finally {
    restore();
  }
});
