// A streaming Board whose held stream is stopped or whose listing fails over
// the stream: lost freshness with the snapshot kept, reopens at the pace, and
// a replaced server across a new revision catches up; a 504 listing leaves the
// watched branch shown. Slots stay free; the server pace is lowered.

import { mkdtempSync, rmSync } from "node:fs";
import { connect, createServer, type Socket } from "node:net";
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
  isRevisionStream,
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

const test = base.extend<{
  machine: string;
  browserAddress: {
    url: string;
    disconnect(): void;
    forwardTo(dashboard: DashboardServer): void;
  };
}>({
  // Playwright's fixture API requires the empty destructuring pattern.
  // eslint-disable-next-line no-empty-pattern
  machine: async ({}, use) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-stream-stopped-"));
    await use(machine);
    rmSync(machine, { recursive: true, force: true });
  },
  // Hold the page's origin across preview process restarts. The previews
  // each bind a new port and still serve every byte the browser sees.
  browserAddress: async ({ dashboard }, use) => {
    let target: URL | undefined = new URL(dashboard.baseURL);
    const sockets = new Set<Socket>();
    const listener = createServer((client) => {
      if (target === undefined) {
        client.destroy();
        return;
      }
      const upstream = connect(Number(target.port), target.hostname);
      sockets.add(client);
      client.on("close", () => {
        sockets.delete(client);
        upstream.destroy();
      });
      upstream.on("close", () => client.destroy());
      client.on("error", () => upstream.destroy());
      upstream.on("error", () => client.destroy());
      client.pipe(upstream).pipe(client);
    });
    await new Promise<void>((resolve, reject) => {
      listener.once("error", reject);
      listener.listen(0, "127.0.0.1", resolve);
    });
    try {
      const address = listener.address();
      if (address === null || typeof address === "string") {
        throw new Error("The browser listener has no TCP address");
      }
      await use({
        url: `http://127.0.0.1:${String(address.port)}`,
        disconnect: () => {
          target = undefined;
          for (const socket of sockets) socket.destroy();
        },
        forwardTo: (server) => {
          target = new URL(server.baseURL);
        },
      });
    } finally {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve) => {
        listener.close(() => {
          resolve();
        });
      });
    }
  },
  baseURL: async ({ browserAddress }, use) => {
    await use(browserAddress.url);
  },
});

test.use({
  preholdRevisionStreamSlots: false,
  extraEnv: streamServerEnv,
});

async function replacePreview(
  dashboard: DashboardServer,
  github: FakeGitHub,
  machine: string,
): Promise<DashboardServer> {
  await dashboard.close();
  return startDashboardServer({
    mode: "preview",
    prebuilt: sharedDashboardBuild,
    github,
    machine,
    extraEnv: streamServerEnv,
  });
}

test("a stopped stream shows lost freshness within 45s with R kept; reopens at the pace; a replaced server across R' catches up", async ({
  page,
  dashboard,
  github,
  machine,
  browserAddress,
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
    browserAddress.disconnect();
    // Land the reopen scheduled by the silence loss, and let it fail closed.
    const failedReopen = page.waitForEvent("requestfailed", (request) =>
      isRevisionStream(request.url()),
    );
    await passPageMs(page, checkIntervalMs);
    await failedReopen;
    await expectStreamOpenGapsAtLeastPace(page);
  });

  let replacement: DashboardServer | undefined;
  try {
    await test.step("replaced server across R': first answer names R', page reads it, problem clears", async () => {
      origin.push(revisionB, backlogB, recordsAt("B"));
      const caughtUp = untilStreamingAt(page, revisionB);
      replacement = await replacePreview(dashboard, github, machine);
      browserAddress.forwardTo(replacement);
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
