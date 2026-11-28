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
  passTimeUntilChecked,
  pausePageClock,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  expectPublishedRevision,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import { preholdRevisionStreamSlots } from "../../dashboard/test-support/support/revisionStreamSlots.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";
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
import { describedBacklog } from "../../dashboard/test-support/describedRevisions.ts";
import { defaultRepository } from "../../dashboard/test-support/publishedOriginBasics.ts";
import { publishes } from "../../dashboard/test-support/support/fakeGitHub.ts";
import { routeServedHomesToPublication } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";

// Git supplies Board membership while the reachable story's preparation
// still needs a pinned REST read through the local request owner.
const story = makeMe.aBacklogEntry
  .with({
    identity: "SEED-021#published-detail",
    href: "seeds/SEED-021-progress.md#published-detail",
    title: "Read a published story",
  })
  .please();
const recordPath = ".planning/seeds/SEED-021-progress.md";
const published = publishes({
  backlog: describedBacklog(
    makeMe.aRepository
      .withRevision("A", {
        backlog: { queued: [story] },
      })
      .please(),
  ),
  files: { [recordPath]: "# Published detail" },
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
      await preholdRevisionStreamSlots(page);
      await pausePageClock(page);
      const detail = page.waitForResponse((response) => {
        const { searchParams } = new URL(response.url());
        return (
          searchParams.get("revision") === published.revision &&
          searchParams.get("path") === recordPath
        );
      });
      await page.goto(server.baseURL);
      const response = await detail;
      const body = await response.text();
      expect(response.status()).toBe(502);
      expect(body).toContain(message);
      const endpointAdvice =
        "Check the local request-owner endpoint configuration";
      expect(body).toContain(endpointAdvice);
      expect(JSON.parse(body)).not.toHaveProperty("recovery");

      await expectPublishedRevision(page, published.revision);
      const { backlog, problem } = parts(page);
      const card = storyCard(backlog, story.title);
      await expect(card).toContainText(
        "The canonical record could not be read for preparation facts.",
      );

      const seen = await inspect(server);
      const contentFailures = seen.failures.filter(
        ({ category }) => category === "content",
      );
      expect(contentFailures).toHaveLength(1);
      expect(contentFailures[0]).toMatchObject({
        cause: "owner-unavailable",
        ownerCause,
        category: "content",
        pin: published.revision,
        source: knownSourceId,
        dispatched: false,
      });
      expect(contentFailures[0]?.status).toBeUndefined();
      // This notice belongs to the current fallback check, independently
      // of the pinned detail's generic preparation gap.
      await passTimeUntilChecked(page, 502);
      await expect(problem).toContainText(message);
      await expect(problem).toContainText(endpointAdvice);
      for (const secret of [root, ownerSecret, "gh auth", "gh failed"]) {
        expect(body).not.toContain(secret);
        expect(seen.body).not.toContain(secret);
        await expect(card).not.toContainText(secret);
        await expect(problem).not.toContainText(secret);
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
