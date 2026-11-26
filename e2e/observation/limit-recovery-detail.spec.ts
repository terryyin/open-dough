// A page whose detail GitHub's rate limit withheld reads it on its own once
// the wait ends, beside the snapshot it keeps showing: hidden across the
// wait, it asks nothing until it is seen again; then it asks GitHub which
// commit the ref names and for the withheld records, never for content
// already read, fills them, and clears the notice. A record that failed for
// another reason keeps its gap.

import {
  expect,
  githubFor,
  pausePageClockAt,
  test,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  shortRevision,
  expectSettledPage,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  inspectedDetail,
  storyCard,
} from "../../dashboard/test-support/storyCardControls.ts";
import { preparationFacts } from "../../dashboard/test-support/storyCardFacts.ts";
import { detailRecovery } from "../../dashboard/test-support/transientRecoveryPage.ts";
import {
  checksAskedWhilePassing,
  setPageVisibility,
} from "../../dashboard/test-support/autoRefreshJourney.ts";
import {
  isContent,
  limiting,
} from "../../dashboard/test-support/limitedReadingJourney.ts";
import { readsBesideChecks } from "../../dashboard/test-support/originObservation.ts";
import { noConnection } from "../../dashboard/test-support/originAnswers.ts";
import { untilReported } from "../../dashboard/test-support/support/directedWait.ts";
import {
  filesBesideUnreachable,
  opened,
  plannedPlan,
  plannedSeed,
  plannedTitle,
  repository,
  titlesBesideUnreachable,
  unreachableSeed,
  unreachableGap,
  unreachableTitle,
  withheldSeed,
  withheldTitle,
} from "../../dashboard/test-support/limitedReadingRecords.ts";
import { serveCommitted } from "../../dashboard/test-support/committedFiles.ts";
import { publishes } from "../../dashboard/test-support/support/fakeGitHub.ts";

test("withheld detail is read on its own once the wait ends on a visible page, beside the snapshot it keeps, while a gap another failure left stays", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const published = publishes({ files: filesBesideUnreachable });
  const { revision } = published;
  const answers = limiting(
    page,
    (call) =>
      isContent(unreachableSeed)(call.request)
        ? Promise.resolve(noConnection)
        : published(call),
    2,
  );
  serveCommitted(page, repository, published, answers.answer);
  // The other records and the project setting reach GitHub before the limit;
  // the plan is asked only after it.
  answers.limit(
    isContent(withheldSeed),
    isContent(plannedSeed),
    isContent(unreachableSeed),
    isContent(".planning/open-dough.json"),
  );
  await page.goto("/");
  await expectSettledPage(page, titlesBesideUnreachable);
  const limitSeenAt = answers.lift();
  const { backlog, problem, readRevision } = parts(page);
  const withheldCard = storyCard(backlog, withheldTitle);
  const plannedCard = storyCard(backlog, plannedTitle);
  const unreachableCard = storyCard(backlog, unreachableTitle);
  await expect(preparationFacts(withheldCard)).toContainText(
    `GitHub's rate limit withheld ${withheldSeed} at ${revision}.`,
  );
  await expect(unreachableCard).toContainText(unreachableGap);
  await expect(problem).toContainText(
    "Detail the limit withheld is labeled where it is shown; this page reads it then, or when it is next seen.",
  );
  const github = githubFor(page);
  const asked = github.calls.length;

  await test.step("hidden across the wait, the page asks nothing as page time passes", async () => {
    await setPageVisibility(page, "hidden");
    await untilReported(limitSeenAt, 2);
    expect(await checksAskedWhilePassing(page, 2_500)).toBe(0);
    expect(github.calls.slice(asked)).toEqual([]);
  });

  await test.step("seen again, it reads what the limit withheld beside the snapshot it shows, and the limit notice clears", async () => {
    await setPageVisibility(page, "visible");
    await page.clock.runFor(1);
    await expectSettledPage(page, titlesBesideUnreachable);
    await expect(readRevision).toContainText(shortRevision(revision));
    await expect(preparationFacts(withheldCard)).toHaveText("Not recorded");
    await expect(await inspectedDetail(plannedCard)).toContainText(
      "First slice",
    );
    await expect(page.locator("body")).not.toContainText(
      "GitHub's rate limit withheld",
    );
    // The unreachable seed stays an eligible gap and schedules its own
    // project-local recovery beside the healed detail.
    await expect(problem).toContainText(detailRecovery);
    await expect(unreachableCard).toContainText(unreachableGap);
  });

  await test.step("GitHub was asked which commit the ref names and for the withheld records, besides the record another failure keeps unread, which stays a gap", async () => {
    expect(readsBesideChecks(github.calls.slice(asked)).sort()).toEqual(
      [
        "ref main",
        `content ${withheldSeed}@${revision}`,
        `content ${plannedPlan}@${revision}`,
        // Any fresh read asks again for what GitHub failed to answer.
        `content ${unreachableSeed}@${revision}`,
      ].sort(),
    );
    await expect(unreachableCard).toContainText(unreachableGap);
  });
});
