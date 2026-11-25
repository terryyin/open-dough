import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  storyReviewEndpoint,
  storyReviewSchema,
  storyReviewWaitMs,
} from "../../dashboard/src/storyReviewContract.ts";
import { showColumn } from "../../dashboard/test-support/boardPage.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import {
  beginIntentReviewChanges,
  openIntentReviewChanges,
} from "../../dashboard/test-support/reviewChangesPage.ts";
import { intentTrunkCompletionOntoTip } from "../../dashboard/test-support/support/intentCompletedHistory.ts";
import { publishIntentTrunk } from "../../dashboard/test-support/support/intentStoryWorktree.ts";
import {
  expect,
  test,
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

test("cold review panes share initial sync and only the remaining pane opens the historical comparison", async ({
  page,
  origin,
}) => {
  publishIntentTrunk(origin.project);
  const { completion, "advance after completion": latest } =
    await publishDeclaredTrunk(
      origin,
      intentTrunkCompletionOntoTip({ completedTests: true, advance: true }),
    );
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    repository: "terryyin/open-dough",
    revision: latest,
    follows: true,
  });
  const held = holdOrigin(origin.machine, origin.origin);
  const moved = renameExecutionCheckout(origin);
  const other = await page.context().newPage();
  const departedResumes: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === storyReviewEndpoint &&
      url.searchParams.get("initialSync") === latest
    )
      departedResumes.push(request.url());
  });
  try {
    await page.goto("/");
    const board = page.url();
    await showColumn(page, "Recently done");
    const card = parts(page).recentlyDone.getByRole("article", {
      name: "Story A",
      exact: true,
    });
    const first = await beginIntentReviewChanges(page, card);
    expect(first.answer.kind).toBe("initial-sync-required");
    await first.expectFeedback("Running initial sync");
    await expect.poll(held.fetches).toBe("fetch\n");

    await other.clock.install();
    await other.goto(board);
    await showColumn(other, "Recently done");
    const otherCard = parts(other).recentlyDone.getByRole("article", {
      name: "Story A",
      exact: true,
    });
    const remaining = await beginIntentReviewChanges(other, otherCard);
    expect(remaining.answer.kind).toBe("initial-sync-required");
    await remaining.expectFeedback("Running initial sync");
    await first.returnToDevelopment();
    await other.clock.fastForward(storyReviewWaitMs + 1);
    await remaining.expectFeedback("Running initial sync");

    const resumed = other.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname === storyReviewEndpoint &&
        url.searchParams.get("initialSync") === latest
      );
    });
    held.release();
    expect(storyReviewSchema.parse(await (await resumed).json())).toMatchObject(
      {
        kind: "published",
        completion,
      },
    );
    await remaining.expectStory("Story A");
    const firstChanged = "Added dashboard/tests/boundary/b.spec.ts";
    await remaining.files.expectSelected(firstChanged);
    await remaining.diffs.expectShows(firstChanged, "+added");
    const kept = "dashboard/tests/boundary/kept.spec.ts";
    await remaining.files.choose(kept);
    await remaining.expectHistoricalSource(kept, completion, "kept 11");
    expect(held.fetches()).toBe("fetch\n");
    expect(departedResumes).toEqual([]);

    const reopened = await openIntentReviewChanges(page, card);
    expect(reopened.answer).toMatchObject({ kind: "published", completion });
  } finally {
    held.release();
    moved.restore();
    await other.close();
  }
});
