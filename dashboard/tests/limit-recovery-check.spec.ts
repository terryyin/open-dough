// A page whose revision check met GitHub's rate limit, with nothing of its
// snapshot withheld, makes its next check once the wait ends, as it does
// after any failed check, and reads nothing else: a record that failed for
// another reason stays a gap until a reload.

import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import { passTimeUntilChecked } from "./autoRefreshJourney.ts";
import { limiting } from "./limitedReadingJourney.ts";
import { notFoundAnswer } from "./originAnswers.ts";
import { untilReported } from "./support/directedWait.ts";
import {
  filesBesideUnreachable,
  opened,
  repository,
  revision,
  titlesBesideUnreachable,
  unreachableSeed,
  unreachableGap,
  unreachableTitle,
} from "./limitedReadingRecords.ts";
import { publishes } from "./support/fakeGitHub.ts";

test("after a limited check, with nothing withheld, the page makes its next check once the wait ends and reads nothing else", async ({
  page,
}) => {
  test.setTimeout(60_000);
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
  const { backlog, problem, source } = parts(page);
  const unreachableCard = backlog.getByRole("article", {
    name: unreachableTitle,
  });
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
  await expect(source).toContainText(revision);
  await expect(source.locator("time")).toHaveAttribute(
    "datetime",
    opened.toISOString(),
  );
  await expect(unreachableCard).toContainText(unreachableGap);
  expect(github.calls.slice(asked).map(({ request }) => request.kind)).toEqual([
    "matching-refs",
  ]);
});
