// Endpoint failures reach both a browser's existing notice and the local
// diagnostic history. The fixture supplies actual directory/socket faults.
import { chmodSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  ownerSecret,
  refusingOwner,
} from "../../Distribution/tests/skills/dough-execute-plan/github-request-owner-refusal-test-fixtures.mjs";
import { ownerlessRequestRoot } from "../../Distribution/tests/skills/dough-execute-plan/github-request-owner-test-fixtures.mjs";
import {
  passPageMsAnswered,
  pausePageClock,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import { openUntilRead } from "../../dashboard/test-support/pageRequestNotes.ts";
import { checkIntervalMs } from "../../dashboard/src/revisionCheckSchedule.ts";
import { sharedDashboardBuild } from "../../dashboard/test-support/support/dashboardServer.ts";
import {
  endFakeGh,
  fakeGhEnv,
  installFakeGh,
} from "../../dashboard/test-support/support/fakeGh.ts";
import { expect, test } from "../../dashboard/test-support/support/pageTest.ts";
import {
  inspect,
  knownSourceId,
  startDashboardServer,
} from "../../dashboard/test-support/support/readDiagnostics.ts";
import { checkedAt } from "../../dashboard/test-support/support/sharedReads.ts";
import { describedBacklog } from "../../dashboard/test-support/describedRevisions.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { publishes } from "../../dashboard/test-support/support/fakeGitHub.ts";
import { routeServedHomesToPublication } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

// An empty project's backlog, which the Board opens on wherever it reads
// without the endpoint.
const published = publishes({
  backlog: describedBacklog(makeMe.aRepository.please()),
});

for (const [fault, ownerCause, message] of [
  ["privacy", "not-private", "endpoint is open to other users"],
  ["path", "path-too-long", "endpoint path is too long"],
  ["incompatible", "incompatible", "explicitly refused the protocol"],
  ["unauthenticated", "unauthenticated", "explicitly refused this caller"],
  ["unknown", "unknown", "gave no usable answer"],
  ["close", "connection-failed", "its local connection failed"],
] as const) {
  test(`the browser and diagnostic history name observed owner ${fault} with safe endpoint recovery`, async ({
    page,
  }) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-owner-notice-"));
    const gh = installFakeGh(machine, { transport: "cli" });
    const cleanups: (() => Promise<void>)[] = [];
    const root = gh.requestOwnerRoot;
    let requestOwnerRoot = root;
    if (fault === "privacy") chmodSync(root, 0o755);
    else if (fault === "path") requestOwnerRoot = ownerlessRequestRoot(root);
    else
      await refusingOwner(
        {
          env: { ...process.env, ...fakeGhEnv(gh), GH_TOKEN: ownerSecret },
          teardown: {
            defer: (cleanup: () => Promise<void>) => cleanups.push(cleanup),
          },
        },
        fault === "close"
          ? "close"
          : { refused: fault === "unknown" ? ownerSecret : fault },
      );
    const server = await startDashboardServer({
      mode: "preview",
      ghTransport: "cli",
      prebuilt: sharedDashboardBuild,
      requestOwnerRoot,
      extraEnv: { GH_TOKEN: ownerSecret },
    });
    server.github.serve(defaultRepository, published);
    routeServedHomesToPublication(server.github, defaultRepository);
    try {
      const response = await checkedAt(server);
      expect(response.status).toBe(502);
      expect(response.body).toContain(message);
      expect(JSON.parse(response.body)).not.toHaveProperty("recovery");
      const before = await inspect(server);
      expect(before.failures.length).toBeGreaterThan(0);
      for (const failure of before.failures) {
        expect(failure).toMatchObject({
          cause: "owner-unavailable",
          ownerCause,
          category: "revision-check",
          source: knownSourceId,
        });
        expect(failure.status).toBeUndefined();
      }
      // The notice is what the page's first failed read leaves on it: the
      // first revision check after the page opens, or the open itself when
      // it reads through the endpoint.
      await pausePageClock(page);
      await openUntilRead(page, server.baseURL);
      await passPageMsAnswered(page, checkIntervalMs);
      const notice = page.getByText(new RegExp(message)).first();
      await expect(notice).toBeVisible();
      await expect(notice).toContainText(
        "Check the local request-owner endpoint configuration",
      );
      const seen = await inspect(server);
      expect(
        seen.failures.every((entry) => entry.ownerCause === ownerCause),
      ).toBe(true);
      for (const secret of [root, ownerSecret, "gh auth", "gh failed"]) {
        expect(response.body).not.toContain(secret);
        expect(seen.body).not.toContain(secret);
        expect(await notice.textContent()).not.toContain(secret);
      }
      expect(server.ghCalls()).toEqual([]);
    } finally {
      await server.close();
      for (const cleanup of cleanups.reverse()) await cleanup();
      await endFakeGh(gh);
      rmSync(machine, { recursive: true, force: true });
    }
  });
}
