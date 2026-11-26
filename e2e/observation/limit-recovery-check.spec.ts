// A page whose revision check met GitHub's rate limit, with nothing of its
// snapshot withheld, makes its next check once the wait ends, as it does
// after any failed check, and reads nothing else: a record established as
// missing stays a gap and is not asked again beside check recovery. An
// eligible transient unread detail would schedule project-local recovery
// instead and exclude checks while it stands (./transient-recovery-lifecycle.spec.ts).

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
import { passTimeUntilChecked } from "../../dashboard/test-support/autoRefreshJourney.ts";
import { limiting } from "../../dashboard/test-support/limitedReadingJourney.ts";
import { notFoundAnswer } from "../../dashboard/test-support/originAnswers.ts";
import { untilReported } from "../../dashboard/test-support/support/directedWait.ts";
import {
  filesBesideUnreachable,
  opened,
  repository,
  titlesBesideUnreachable,
  unreachableSeed,
  unreachableGap,
  unreachableTitle,
} from "../../dashboard/test-support/limitedReadingRecords.ts";
import { serveCommitted } from "../../dashboard/test-support/committedFiles.ts";
import { publishes } from "../../dashboard/test-support/support/fakeGitHub.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";

test("after a limited check, with nothing withheld, the page makes its next check once the wait ends and reads nothing else", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const published = publishes({ files: filesBesideUnreachable });
  const { revision } = published;
  const answers = limiting(
    page,
    (call) =>
      call.request.kind === "content" && call.request.path === unreachableSeed
        ? // Terminal missing fact: stays a gap until reload, and must not arm
          // project-local transient recovery that would block revision checks.
          Promise.resolve(notFoundAnswer())
        : published(call),
    2,
  );
  const github = githubFor(page);
  serveCommitted(page, repository, published, answers.answer);
  await page.goto("/");
  await expectSettledPage(page, titlesBesideUnreachable);
  const { backlog, problem, readRevision } = parts(page);
  const unreachableCard = storyCard(backlog, unreachableTitle);
  await expect(unreachableCard).toContainText(unreachableGap);
  answers.limit((request) => request.kind === "matching-refs");
  await passTimeUntilChecked(page, 502);
  const limitSeenAt = answers.lift();
  await expect(problem).toContainText("Automatic checks resume then.");
  const asked = github.calls.length;

  await untilReported(limitSeenAt, 2);
  await passTimeUntilChecked(page);
  await expectSettledPage(page, titlesBesideUnreachable);
  await expect(problem).toHaveCount(0);
  await expect(readRevision).toContainText(shortRevision(revision));
  await expect(parts(page).retrievedAt).toHaveAttribute(
    "datetime",
    opened.toISOString(),
  );
  await expect(unreachableCard).toContainText(unreachableGap);
  expect(github.calls.slice(asked).map(({ request }) => request.kind)).toEqual([
    "matching-refs",
  ]);
});
