// Two tabs waiting out one rate limit recover together once it ends. Both
// already show the snapshot beside the withheld detail: the second tab opens
// with the first, before the 429 cooldown can skip its membership read.
// Once the wait ends, each withheld record is read once; nothing already
// read is asked again.

import { remoteBranchHead } from "../../dashboard/server/gitTargetFetch.ts";
import {
  expect,
  githubFor,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  expectSettledPage,
  shortRevision,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  isContent,
  limiting,
} from "../../dashboard/test-support/limitedReadingJourney.ts";
import { readsBesideChecks } from "../../dashboard/test-support/originObservation.ts";
import { untilReported } from "../../dashboard/test-support/support/directedWait.ts";
import { authenticatedReadEndpoint } from "../../dashboard/src/authenticatedReadRules.ts";
import {
  files,
  opened,
  plannedPlan,
  plannedSeed,
  repository,
  titles,
  withheldSeed,
  withheldTitle,
} from "../../dashboard/test-support/limitedReadingRecords.ts";
import { publishes } from "../../dashboard/test-support/support/fakeGitHub.ts";
import { gitHubRepositoryUrl } from "../../dashboard/test-support/support/fixtureOriginRoute.ts";
import {
  inspectedDetail,
  storyCard,
} from "../../dashboard/test-support/storyCardControls.ts";

const settingPath = ".planning/open-dough.json";
const withheldGoal = "Only GitHub's limit keeps this record unread.";

test("two tabs recover together once the wait ends, each question reaching GitHub once", async ({
  page,
  dashboard,
}) => {
  await pausePageClockAt(page, opened);
  const github = githubFor(page);
  const published = publishes({ files: { ...files, [settingPath]: "{}\n" } });
  const { revision } = published;
  const answers = limiting(page, published, 2);
  const { answer } = answers;
  github.serve(repository, answer);
  expect(
    await remoteBranchHead(gitHubRepositoryUrl(repository), "refs/heads/main", {
      cwd: dashboard.home,
      env: { HOME: dashboard.home },
      maxBuffer: 4096,
    }),
  ).toBe(revision);
  // The other records and the project setting reach GitHub before the limit;
  // the plan is asked only after it.
  answers.limit(
    isContent(withheldSeed),
    isContent(plannedSeed),
    isContent(settingPath),
  );
  const other = await page.context().newPage();
  const refusedDetail = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      url.pathname === authenticatedReadEndpoint &&
      url.searchParams.get("path") === withheldSeed &&
      url.searchParams.get("revision") === revision
    );
  });
  await Promise.all([page.goto("/"), other.goto("/")]);
  await expectSettledPage(page, titles);
  await expectSettledPage(other, titles);
  await expect(parts(other).readRevision).toContainText(
    shortRevision(revision),
  );
  expect(await (await refusedDetail).json()).toMatchObject({
    error: `GitHub limited the rate of the local GitHub CLI's requests (HTTP 429) while reading ${withheldSeed} at ${revision}. GitHub asked to wait 2 seconds before asking again.`,
    retryAfterSeconds: 2,
  });
  const limitSeenAt = answers.lift();
  const asked = github.calls.length;
  const tabs = [page, other];

  await test.step("once the wait ends, both tabs settle, the problem clears, and the withheld detail is read", async () => {
    await untilReported(limitSeenAt, 2);
    // Page time is the browser's, shared by both tabs.
    await page.clock.runFor(2_500);
    for (const tab of tabs) {
      await expectSettledPage(tab, titles);
      await expect(parts(tab).problem).toHaveCount(0);
      await expect(parts(tab).readRevision).toContainText(
        shortRevision(revision),
      );
      const card = storyCard(parts(tab).backlog, withheldTitle);
      await inspectedDetail(card);
      await expect(card).toContainText(withheldGoal);
    }
  });

  await test.step("GitHub was asked each withheld record once, and nothing already read", () => {
    expect(
      readsBesideChecks(github.calls.slice(asked))
        .filter((read) => read !== "ref main")
        .sort(),
    ).toEqual(
      [
        `content ${withheldSeed}@${revision}`,
        `content ${plannedPlan}@${revision}`,
      ].sort(),
    );
  });
});
