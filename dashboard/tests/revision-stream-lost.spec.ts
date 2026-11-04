// A streaming Board whose stream fails, closes, or falls silent shows lost
// freshness with its snapshot kept, reopens no more often than the pace, and
// catches up on the first answer after a reopen. Slots stay free; the server
// pace is lowered. Check-delivery recovery journeys keep proving today's
// failed-check wording under the fixture's pre-held slots.

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, githubFor, test as base } from "./dashboardTest.ts";
import {
  expectMembership,
  expectSettledPage,
  parts,
  shortRevision,
} from "./dashboardPage.ts";
import {
  checksAskedWhilePassing,
  passPageMs,
  recordsAt,
} from "./autoRefreshJourney.ts";
import {
  isRevisionStream,
  openStreamingAtA,
  streamPaceMs,
  streamServerEnv,
  untilMatchingRefsSince,
  untilStreamingAt,
} from "./revisionStreamJourney.ts";
import {
  backlogB,
  revisionA,
  revisionB,
  titlesOfA,
  titlesOfB,
} from "./refreshJourney.ts";
import { openedSettled } from "./branchRefreshJourney.ts";
import { onBranch, revision } from "./branchProgressRecords.ts";
import { checkIntervalMs } from "../src/revisionCheckSchedule.ts";
import { revisionStreamSilenceMs } from "../src/revisionStreamSchedule.ts";
import { rateLimitedAnswer } from "./publishedOrigin.ts";
import { untilReported } from "./support/directedWait.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import type { FakeGitHub } from "./support/fakeGitHub.ts";
import { signal } from "./support/processGroup.ts";

const test = base.extend<{ machine: string }>({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  machine: async ({}, use) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-stream-lost-"));
    await use(machine);
    rmSync(machine, { recursive: true, force: true });
  },
});

test.use({
  preholdRevisionStreamSlots: false,
  extraEnv: streamServerEnv,
});

test.setTimeout(120_000);

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
    prebuilt: builtDashboardDir,
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
    await expect(problem).toContainText("Published work could not be read");
    await expect(problem).toContainText("freshness was lost");
    await expect(problem).toContainText(
      "What is shown is the earlier snapshot, retrieved at",
    );
    await expect(problem.locator("time").nth(1)).toHaveAttribute(
      "datetime",
      retrievedA,
    );
    await expect(problem).toContainText(
      `Automatic checks continue every ${String(checkIntervalMs / 1000)} seconds while this page is visible.`,
    );
    // Failed check: status names no revision; Board membership proves A.
    await expectMembership(page, titlesOfA);
  });

  await test.step("reopen attempts come no more often than the pace", async () => {
    signal(-dashboard.pid, "SIGKILL");
    // Land the reopen scheduled by the silence loss, and let it fail closed.
    await passPageMs(page, checkIntervalMs);
    await page.waitForTimeout(streamPaceMs * 2);
    const gaps: number[] = [];
    for (let i = 0; i < 3; i += 1) {
      const before = await page.evaluate(() => Date.now());
      const opened = page.waitForRequest(
        (request) => isRevisionStream(request.url()),
        { timeout: 5_000 },
      );
      await passPageMs(page, checkIntervalMs);
      await opened;
      gaps.push((await page.evaluate(() => Date.now())) - before);
      await page.waitForTimeout(streamPaceMs);
    }
    for (const gap of gaps) {
      expect(gap).toBeGreaterThanOrEqual(checkIntervalMs - 250);
    }
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

test("a rate-limited stream answer shows today's notice, closes the stream, waits until T, then reopens", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const origin = await openStreamingAtA(page);
  const { problem, retrievedAt } = parts(page);
  const retrievedA = (await retrievedAt.getAttribute("datetime")) ?? "";
  const restoreMain = origin.answerWith(
    "main",
    rateLimitedAnswer(429, { "Retry-After": "2" }),
  );
  const beforeLimit = githubFor(page).calls.length;
  // Next pace tick delivers the limited answer over the open stream (wall).
  await untilMatchingRefsSince(page, beforeLimit, 1);
  const arrivedAt = Date.now();
  await expect(problem).toContainText(
    "GitHub limited the rate of the local GitHub CLI's requests (HTTP 429)",
  );
  await expect(problem).toContainText(
    "GitHub limited the rate of the local GitHub CLI's requests, so this page asks GitHub nothing until",
  );
  await expect(problem).toContainText("Automatic checks resume then.");
  await expect(problem.locator("time").nth(1)).toHaveAttribute(
    "datetime",
    retrievedA,
  );
  await expectMembership(page, titlesOfA);

  const quietFrom = githubFor(page).calls.length;
  const streamOpens: string[] = [];
  page.on("request", (request) => {
    if (isRevisionStream(request.url())) {
      streamOpens.push(request.url());
    }
  });
  // Page time still before T: no check, no stream reopen, no further listing.
  expect(await checksAskedWhilePassing(page, 1_000)).toBe(0);
  expect(streamOpens).toEqual([]);
  await page.waitForTimeout(streamPaceMs * 4);
  expect(
    githubFor(page)
      .calls.slice(quietFrom)
      .filter(({ request }) => request.kind === "matching-refs"),
  ).toEqual([]);

  restoreMain();
  origin.push(revisionB, backlogB, recordsAt("B"));
  await untilReported(arrivedAt, 2);
  const resumed = untilStreamingAt(page, revisionB);
  // Cross T on the page clock; the first answer resumes freshness.
  await passPageMs(page, 2_000);
  await expectSettledPage(page, titlesOfB);
  await expect(problem).toHaveCount(0);
  await resumed;
});
