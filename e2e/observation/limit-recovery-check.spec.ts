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
} from "../../dashboard/tests/dashboardTest.ts";
import {
  shortRevision,
  expectSettledPage,
  parts,
} from "../../dashboard/tests/dashboardPage.ts";
import { passTimeUntilChecked } from "../../dashboard/tests/autoRefreshJourney.ts";
import { limiting } from "../../dashboard/tests/limitedReadingJourney.ts";
import { notFoundAnswer } from "../../dashboard/tests/originAnswers.ts";
import { untilReported } from "../../dashboard/tests/support/directedWait.ts";
import {
  filesBesideUnreachable,
  opened,
  repository,
  revision,
  titlesBesideUnreachable,
  unreachableSeed,
  unreachableGap,
  unreachableTitle,
} from "../../dashboard/tests/limitedReadingRecords.ts";
import { publishes } from "../../dashboard/tests/support/fakeGitHub.ts";
import { storyCard } from "../../dashboard/tests/storyCardControls.ts";

test("after a limited check, with nothing withheld, the page makes its next check once the wait ends and reads nothing else", async ({
  page,
}) => {
  await pausePageClockAt(page, opened);
  const published = publishes({ revision, files: filesBesideUnreachable });
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
  github.serve(repository, answers.answer);
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
