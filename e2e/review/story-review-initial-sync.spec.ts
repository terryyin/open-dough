import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import {
  storyReviewEndpoint,
  storyReviewSchema,
  storyReviewWaitMs,
} from "../../dashboard/src/storyReviewContract.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { doneCard } from "../../dashboard/test-support/doneStoryReviewPage.ts";
import {
  beginIntentReviewChanges,
  openIntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import { intentTrunkCompletionOntoTip } from "../../dashboard/test-support/support/intentCompletedHistory.ts";
import { publishIntentTrunk } from "../../dashboard/test-support/support/intentStoryWorktree.ts";
import {
  expect,
  test as base,
} from "../../dashboard/test-support/support/preparationPage.ts";
import {
  fixtureReviewRepository,
  renameExecutionCheckout,
} from "../../dashboard/test-support/support/reviewRepositoryFixture.ts";
import { publishDeclaredTrunk } from "../../dashboard/test-support/support/storyCiComparisonBaseline.ts";

function holdOrigin(machine: string, origin: string) {
  const repository = fixtureReviewRepository(machine);
  const started = path.join(machine, "first-review-transfer.log");
  const release = path.join(machine, "release-review-transfer");
  const gate = path.join(machine, "hold-review-upload-pack");
  writeFileSync(started, "");
  writeFileSync(
    gate,
    `#!/bin/sh
printf 'fetch\\n' >> "${started}"
while [ ! -f "${release}" ]; do sleep 0.02; done
exec git upload-pack "$@"
`,
    { mode: 0o755 },
  );
  mkdirSync(repository, { recursive: true });
  execFileSync("git", ["init", "--bare", "--quiet", repository]);
  execFileSync("git", ["-C", repository, "remote", "add", "origin", origin]);
  execFileSync("git", [
    "-C",
    repository,
    "config",
    "remote.origin.uploadpack",
    gate,
  ]);
  return {
    fetches: () => readFileSync(started, "utf8"),
    release: () => {
      writeFileSync(release, "");
    },
  };
}

const test = base.extend<{
  prepareColdReview: () => Promise<{
    held: ReturnType<typeof holdOrigin>;
    other: Page;
  }>;
}>({
  prepareColdReview: async ({ page, origin }, use) => {
    let held: ReturnType<typeof holdOrigin> | undefined;
    let moved: ReturnType<typeof renameExecutionCheckout> | undefined;
    let other: Page | undefined;
    try {
      await use(async () => {
        held = holdOrigin(origin.machine, origin.origin);
        moved = renameExecutionCheckout(origin);
        other = await page.context().newPage();
        return { held, other };
      });
    } finally {
      held?.release();
      moved?.restore();
      await other?.close();
    }
  },
});

function resumesReviewAt(requestUrl: string, revision: string) {
  const url = new URL(requestUrl);
  return (
    url.pathname === storyReviewEndpoint &&
    url.searchParams.get("initialSync") === revision
  );
}

const firstChanged = "Deleted .planning/agents/yui-chan.json";
const kept = "dashboard/tests/boundary/kept.spec.ts";

test("cold review panes share initial sync and only the remaining pane opens the historical comparison", async ({
  page,
  origin,
  prepareColdReview,
}) => {
  const { completion, "advance after completion": latest } =
    await test.step("Given Story A completes and published trunk advances", () => {
      publishIntentTrunk(origin.project);
      return publishDeclaredTrunk(
        origin,
        intentTrunkCompletionOntoTip({ completedTests: true, advance: true }),
      );
    });
  await test.step("And the dashboard follows the advanced trunk", () =>
    publishCommittedOrigin(page, {
      repoDir: origin.origin,
      repository: "terryyin/open-dough",
      revision: latest,
      follows: true,
    }));
  const { held, other } = await test.step(
    "And the cold Review repository has a held origin and no execution checkout",
    prepareColdReview,
  );
  const departedResumes =
    await test.step("And I track review resumption in the first tab", () => {
      const requests: string[] = [];
      page.on("request", (request) => {
        if (resumesReviewAt(request.url(), latest))
          requests.push(request.url());
      });
      return requests;
    });
  const board = await test.step("When I open the board", async () => {
    await page.goto("/");
    return page.url();
  });
  const card =
    await test.step("And I find Story A in Recently done", async () => {
      await showColumn(page, "Recently done");
      return doneCard(page, "Story A");
    });
  const first = await test.step("And I open Review changes", () =>
    beginIntentReviewChanges(page, card));
  await test.step("Then the first tab shows initial sync and starts one fetch", async () => {
    expect(first.answer.kind).toBe("initial-sync-required");
    await first.expectFeedback("Running initial sync");
    await expect.poll(held.fetches).toBe("fetch\n");
  });

  await test.step("Given I control the time in a second tab", async () => {
    await other.clock.install();
  });
  const otherCard =
    await test.step("When I find Story A in that tab", async () => {
      await other.goto(board);
      await showColumn(other, "Recently done");
      return doneCard(other, "Story A");
    });
  const remaining =
    await test.step("And I open Review changes in that tab", () =>
      beginIntentReviewChanges(other, otherCard));
  await test.step("Then the second tab also shows initial sync", async () => {
    expect(remaining.answer.kind).toBe("initial-sync-required");
    await remaining.expectFeedback("Running initial sync");
  });
  await test.step("When I leave Review changes in the first tab", () =>
    first.returnToDevelopment());
  await test.step("And the review wait elapses in the second tab", () =>
    other.clock.fastForward(storyReviewWaitMs + 1));
  await test.step("Then the second tab still shows initial sync", () =>
    remaining.expectFeedback("Running initial sync"));

  const resumed = await test.step("When origin releases the fetch", () => {
    const response = other.waitForResponse((response) =>
      resumesReviewAt(response.url(), latest),
    );
    held.release();
    return response;
  });
  await test.step("Then the comparison resumes at the published completion", async () => {
    expect(storyReviewSchema.parse(await resumed.json())).toMatchObject({
      kind: "published",
      completion,
    });
    await remaining.expectStory("Story A");
  });
  await test.step("And the first changed file is selected with its diff", async () => {
    await remaining.files.expectSelected(firstChanged);
    await remaining.diffs.expectShows(firstChanged, '-  "agent": "Yui-chan",');
  });
  await test.step("When I choose the unchanged test file", () =>
    remaining.files.choose(kept));
  await test.step("Then its source comes from the published completion", () =>
    remaining.expectHistoricalSource(kept, completion, "kept 11"));
  await test.step("And the tabs shared one fetch and only the second tab resumed", () => {
    expect(held.fetches()).toBe("fetch\n");
    expect(departedResumes).toEqual([]);
  });

  const reopened =
    await test.step("When I reopen Review changes in the first tab", () =>
      openIntentReviewChanges(page, card));
  await test.step("Then the same published comparison opens", () => {
    expect(reopened.answer).toMatchObject({ kind: "published", completion });
  });
});
