// A page whose revision check was held back, with nothing of its
// snapshot withheld, makes its next check once the wait ends, as it does
// after any failed check, and reads nothing else: a record established as
// missing stays a gap and is not asked again beside check recovery. An
// eligible transient unread detail would schedule project-local recovery
// instead and exclude checks while it stands (./transient-recovery-lifecycle.spec.ts).

import {
  expect,
  githubFor,
  pausePageClockAt,
} from "../../dashboard/test-support/dashboardTest.ts";
import {
  shortRevision,
  expectSettledPage,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import { passTimeUntilChecked } from "../../dashboard/test-support/autoRefreshJourney.ts";
import { limiting } from "../../dashboard/test-support/limitedReadingJourney.ts";
import { readsBesideChecks } from "../../dashboard/test-support/originObservation.ts";
import { notFoundAnswer } from "../../dashboard/test-support/originAnswers.ts";
import { test } from "../../dashboard/test-support/support/ownerClockTest.ts";
import { readUrl } from "../../dashboard/test-support/support/sharedReads.ts";
import {
  filesBesideUnreachable,
  opened,
  plannedSeed,
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
  owner,
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
  answers.limit(
    (request) => request.kind === "commit-list" && request.path === plannedSeed,
  );
  const origin = new URL(page.url()).origin;
  const history = readUrl(
    origin,
    `&revision=${revision}&path=${encodeURIComponent(plannedSeed)}&committed=last`,
  );
  const limited = await page.request.get(history, {
    headers: { Origin: origin },
  });
  expect(limited.status()).toBe(502);
  expect(await limited.json()).toMatchObject({ retryAfterSeconds: 2 });
  await passTimeUntilChecked(page, 502);
  await expect(problem).toContainText("Automatic checks resume then.");
  const asked = github.calls.length;

  owner.advanceOwnerClock(2_000);
  await passTimeUntilChecked(page);
  await expectSettledPage(page, titlesBesideUnreachable);
  await expect(problem).toHaveCount(0);
  await expect(readRevision).toContainText(shortRevision(revision));
  await expect(parts(page).retrievedAt).toHaveAttribute(
    "datetime",
    opened.toISOString(),
  );
  await expect(unreachableCard).toContainText(unreachableGap);
  expect(readsBesideChecks(github.calls.slice(asked))).toEqual([]);
});
