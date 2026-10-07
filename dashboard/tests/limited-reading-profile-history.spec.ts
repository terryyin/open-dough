// A limited profile history leaves its human unknown in the scan view, while
// its detail and the roster name the limit and its time, never a missing
// addition or an unnamed committer; another profile's credit stays shown, and
// the page asks nothing until the limit's time (./limitedReadingJourney.ts).

import { expect, githubFor, test } from "./dashboardTest.ts";
import { expectSettledPage, parts, rosterParts } from "./dashboardPage.ts";
import { inspectedDetail } from "./cardControls.ts";
import {
  openedBeside,
  waitSeconds,
  whileTheLimitStands,
} from "./limitedReadingJourney.ts";
import { limitedUntil, noticedResumeTime } from "./limitNotice.ts";
import { publishes } from "./support/fakeGitHub.ts";
import type { GhRequest } from "./support/ghRequest.ts";
import {
  committed as clockCommitted,
  files as clockFiles,
  history as clockHistory,
  opened as clockOpened,
  afterTake,
  justTaken,
  profilePath,
  revision as clockRevision,
  takes,
} from "./sliceClockRecords.ts";

test("limiting a profile's history leaves its human unknown in the scan view, names the limit and its time in the detail and the roster, keeps another profile's credit, and asks nothing until then", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const creditedHuman = "Yuri Credited";
  const { answers, other } = await openedBeside(
    page,
    clockOpened,
    publishes({
      revision: clockRevision,
      // The project setting selects the current collection, so the roster
      // lists its agents.
      files: { ...clockFiles, ".planning/open-dough.json": "{}\n" },
      committed: clockCommitted,
      history: {
        ...clockHistory,
        [profilePath("Yuma")]: [{ ...takes.Yuma, committer: creditedHuman }],
      },
    }),
  );
  const akihoHistory = (request: GhRequest) =>
    request.kind === "commit-list" && request.path === profilePath("Akiho");
  // Yuma's addition is read from GitHub before Akiho's history is refused.
  answers.limit(
    akihoHistory,
    (request) => request.kind === "commit" && request.sha === takes.Yuma.sha,
  );
  await page.goto("/");
  await expectSettledPage(page);
  const resumesAt = clockOpened.getTime() + waitSeconds * 1_000;
  const until = await limitedUntil(page, resumesAt);
  const akihoUnknown = `Human developer unknown. GitHub's rate limit withheld the commit that added ${profilePath("Akiho")} at ${clockRevision}. ${until}`;
  const { taken, problem } = parts(page);
  const akihoCard = taken.getByRole("article", { name: afterTake });
  const yumaCard = taken.getByRole("article", { name: justTaken });

  await test.step("the scan view says the human is unknown, the detail names the limit and its time, the Take clock is withheld by the limit, and another profile stays credited", async () => {
    await expect(akihoCard.locator(".card-owner .owner-human-gap")).toHaveText(
      "Human developer unknown",
    );
    await expect(akihoCard).toContainText(
      "Current slice time unavailable: GitHub's rate limit withheld",
    );
    const human = (await inspectedDetail(akihoCard)).locator(".owner-human");
    await expect(human).toHaveText(akihoUnknown);
    await expect(
      (await inspectedDetail(yumaCard)).locator(".owner-human"),
    ).toHaveText(`Human developer: ${creditedHuman}`);
    await expect(page.locator("body")).not.toContainText(
      "no commit adding this agent profile was found",
    );
    await expect(page.locator("body")).not.toContainText(
      "names no usable committer",
    );
    await expect(problem).toHaveCount(1);
    expect(await noticedResumeTime(page)).toBe(resumesAt);
    expect(
      githubFor(page).calls.filter(({ request }) => akihoHistory(request)),
    ).toHaveLength(1);
  });

  await test.step("the roster names the same limit and time for that human, and keeps the other credit", async () => {
    const { member, opener, back } = rosterParts(page);
    await opener("Akiho-chan").click();
    await expect(member("Akiho-chan").locator(".owner-human")).toHaveText(
      akihoUnknown,
    );
    await expect(member("Yuma-chan").locator(".owner-human")).toHaveText(
      `Human developer: ${creditedHuman}`,
    );
    expect(await noticedResumeTime(page)).toBe(resumesAt);
    await back.click();
    await expect(akihoCard).toBeVisible();
  });

  await whileTheLimitStands(page, other, resumesAt, answers.refusedAt());
});
