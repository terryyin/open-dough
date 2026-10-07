// Two tabs waiting out one rate limit recover together once it ends: the tab
// opened during the wait, showing nothing, reads the project; the tab whose
// detail the limit withheld reads that detail beside its snapshot. Each
// question reaches GitHub once: the ref, while both wait on it, and each
// withheld record; nothing already read is asked again.

import type { Page, Request } from "@playwright/test";
import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import {
  expectProblemAndNoSnapshot,
  expectSettledPage,
  parts,
} from "./dashboardPage.ts";
import { isContent, limiting } from "./limitedReadingJourney.ts";
import { readsBesideChecks } from "./originObservation.ts";
import { untilReported } from "./support/directedWait.ts";
import { holdingAnswer } from "./support/heldGitHubAnswer.ts";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";
import {
  files,
  opened,
  plannedPlan,
  plannedSeed,
  repository,
  revision,
  titles,
  withheldSeed,
  withheldTitle,
} from "./limitedReadingRecords.ts";
import { publishes } from "./support/fakeGitHub.ts";

// A tab's read of which commit Open Dough's ref names.
const isMembership = (request: Request) => {
  const url = new URL(request.url());
  return (
    url.pathname === authenticatedReadEndpoint &&
    url.searchParams.get("source") === "open-dough" &&
    url.searchParams.size === 1
  );
};

// Once each tab's membership read is seen sent, each tab asks the boundary
// for something it refuses without GitHub; once both are answered, both
// reads wait on GitHub's held answer.
async function waitingTogether(
  tabs: readonly Page[],
  sent: Promise<Request>[],
) {
  await Promise.all(sent);
  for (const tab of tabs) {
    const status = await tab.evaluate(
      (url) => fetch(url).then((response) => response.status),
      `${authenticatedReadEndpoint}?source=open-dough&revision=main`,
    );
    expect(status).toBe(400);
  }
}

const settingPath = ".planning/open-dough.json";
const withheldGoal = "Only GitHub's limit keeps this record unread.";

test("two tabs recover together once the wait ends, each question reaching GitHub once", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await pausePageClockAt(page, opened);
  const github = githubFor(page);
  const answers = limiting(
    page,
    publishes({
      revision,
      files: { ...files, [settingPath]: "{}\n" },
    }),
    2,
  );
  github.serve(repository, answers.answer);
  // The other records and the project setting reach GitHub before the limit;
  // the plan is asked only after it.
  answers.limit(
    isContent(withheldSeed),
    isContent(plannedSeed),
    isContent(settingPath),
  );
  await page.goto("/");
  await expectSettledPage(page, titles);
  const limitSeenAt = answers.lift();
  const other = await page.context().newPage();
  await other.goto("/");
  await expectProblemAndNoSnapshot(
    other,
    `main of ${repository} was not asked of GitHub.`,
    repository,
    "This page reads the published work then, or when it is next seen.",
  );
  const asked = github.calls.length;
  const ref = holdingAnswer(answers.answer, ({ kind }) => kind === "ref");
  github.serve(repository, ref.answer);
  const tabs = [page, other];

  await test.step("once the wait ends, both tabs ask which commit the ref names, and GitHub is asked once", async () => {
    await untilReported(limitSeenAt, 2);
    const sent = tabs.map((tab) => tab.waitForRequest(isMembership));
    // Page time is the browser's, shared by both tabs.
    await page.clock.runFor(2_500);
    await waitingTogether(tabs, sent);
    ref.release();
  });

  await test.step("the tab that showed nothing reads the project, the other fills what was withheld, and both notices clear", async () => {
    for (const tab of tabs) {
      await expectSettledPage(tab, titles);
      await expect(parts(tab).problem).toHaveCount(0);
      await expect(parts(tab).source).toContainText(revision);
      const card = parts(tab).backlog.getByRole("article", {
        name: withheldTitle,
      });
      await card.getByRole("button", { name: "Inspect story" }).click();
      await expect(card).toContainText(withheldGoal);
    }
  });

  await test.step("GitHub was asked the ref and each withheld record once, and nothing already read", () => {
    expect(readsBesideChecks(github.calls.slice(asked)).sort()).toEqual(
      [
        "ref main",
        `content ${withheldSeed}@${revision}`,
        `content ${plannedPlan}@${revision}`,
      ].sort(),
    );
  });
});
