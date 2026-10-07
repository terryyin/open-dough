// At an unchanged revision, eligible unanswered detail recovers on its own
// while successfully shown facts stay useful: temporary and terminal gaps can
// coexist; only eligible questions are asked again; each healed fact clears
// its own gap without reload. The page, local boundary, and `gh` invocation
// are production; only GitHub's answers are supplied. Page time is paused.

import { callsSince, contentReads, headsChecks } from "./autoRefreshJourney.ts";
import { expect, githubFor, pausePageClockAt, test } from "./dashboardTest.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import {
  filesBesideUnreachable,
  opened,
  plannedTitle,
  repository,
  revision,
  titlesBesideUnreachable,
  unreachableGap,
  unreachableSeed,
  unreachableTitle,
  withheldSeed,
  withheldTitle,
} from "./limitedReadingRecords.ts";
import { noConnection, notFoundAnswer } from "./originAnswers.ts";
import { readsBesideChecks } from "./originObservation.ts";
import { untilPageReadsAnswered } from "./pageRequestNotes.ts";
import {
  expectCanonicalFacts,
  expectCardAssignments,
  expectDoneFacts,
} from "./publishedFactsAssertions.ts";
import { heldFactGroups, takenCanonicalPath } from "./publishedFactsArrival.ts";
import { publishes } from "./support/fakeGitHub.ts";

const preparationGap =
  "The canonical record could not be read for preparation facts.";
const detailRecovery = "this page reads it";
const terminalSeed = ".planning/seeds/SEED-264-terminal.md";
const terminalTitle = "A story whose record is missing";

async function expectDetailRecoveryNotice(
  page: Parameters<typeof parts>[0],
): Promise<void> {
  await expect(
    parts(page).problem.locator("p", { hasText: detailRecovery }),
  ).toHaveCount(1);
}

test("eligible preparation recovers beside kept facts, and a terminal missing seed is not asked again", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await pausePageClockAt(page, opened);
  const terminalFiles = {
    ...filesBesideUnreachable,
    [".planning/PRODUCT-BACKLOG.md"]: `${filesBesideUnreachable[".planning/PRODUCT-BACKLOG.md"]}- [${terminalTitle}](seeds/SEED-264-terminal.md#terminal) — SEED-264#terminal
`,
    [terminalSeed]: `# Terminal

<a id="terminal"></a>

### ${terminalTitle}

**Identity:** SEED-264#terminal

**Goal:** Missing at this pin; recovery of another gap must not loop it.
`,
  };
  let withheldFails = true;
  const published = publishes({ revision, files: terminalFiles });
  githubFor(page).serve(repository, (call) => {
    const { request } = call;
    if (request.kind === "content" && request.path === terminalSeed) {
      return Promise.resolve(notFoundAnswer());
    }
    if (
      request.kind === "content" &&
      request.path === withheldSeed &&
      withheldFails
    ) {
      return Promise.resolve(noConnection);
    }
    if (request.kind === "content" && request.path === unreachableSeed) {
      return Promise.resolve(noConnection);
    }
    return published(call);
  });
  await page.goto("/");
  const { backlog, problem, source } = parts(page);
  await expectSettledPage(page, {
    ...titlesBesideUnreachable,
    backlog: [...titlesBesideUnreachable.backlog, terminalTitle],
  });
  const withheldCard = backlog.getByRole("article", { name: withheldTitle });
  const plannedCard = backlog.getByRole("article", { name: plannedTitle });
  const unreachableCard = backlog.getByRole("article", {
    name: unreachableTitle,
  });
  const terminalCard = backlog.getByRole("article", { name: terminalTitle });
  await expect(withheldCard.locator(".card-preparation")).toHaveText(
    unreachableGap,
  );
  await expect(unreachableCard).toContainText(unreachableGap);
  await expect(terminalCard).toContainText(unreachableGap);
  await expect(plannedCard).toBeVisible();
  await expect(plannedCard).not.toContainText("Reading preparation…");
  await expect(source).toContainText(revision);
  await expect(problem).toContainText(detailRecovery);
  await untilPageReadsAnswered(page);
  await expectDetailRecoveryNotice(page);

  const asked = githubFor(page).calls.length;
  await test.step("successful facts stay shown while recovery waits", async () => {
    await expect(plannedCard).toBeVisible();
    await expect(withheldCard).not.toContainText("Reading preparation…");
    await expect(source).toContainText(revision);
  });

  await test.step("due recovery heals the temporary seed, keeps the terminal gap, and does not re-ask the terminal path", async () => {
    withheldFails = false;
    await page.clock.runFor(15_250);
    await untilPageReadsAnswered(page);
    await expect(withheldCard.locator(".card-preparation")).toHaveText(
      "Not recorded",
    );
    await expect(terminalCard).toContainText(unreachableGap);
    await expect(unreachableCard).toContainText(unreachableGap);
    await expect(plannedCard).toBeVisible();
    const recovered = readsBesideChecks(githubFor(page).calls.slice(asked));
    expect(recovered).toContain("ref main");
    expect(recovered).toContain(`content ${withheldSeed}@${revision}`);
    expect(recovered.filter((read) => read.includes(terminalSeed))).toEqual([]);
    // Unreachable remains eligible: recovery notice stays on the next backoff.
    await expectDetailRecoveryNotice(page);
  });

  await test.step("the remaining eligible gap waits the next backoff step before another ask", async () => {
    const before = githubFor(page).calls.length;
    await page.clock.runFor(29_000);
    expect(
      readsBesideChecks(githubFor(page).calls.slice(before)).filter((read) =>
        read.includes(unreachableSeed),
      ),
    ).toEqual([]);
    await page.clock.runFor(1_250);
    await untilPageReadsAnswered(page);
    expect(
      readsBesideChecks(githubFor(page).calls.slice(before)).some((read) =>
        read.includes(unreachableSeed),
      ),
    ).toBe(true);
    await expect(unreachableCard).toContainText(unreachableGap);
    await expect(terminalCard).toContainText(unreachableGap);
  });
});

test("a detail still unread at the wait bound recovers on its own at the same revision while assignments stay shown", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const { branchCard, queuedCard, doneCard, problem, release } =
    await heldFactGroups(page);
  release("profiles");
  release("done");
  await expectCardAssignments(branchCard, queuedCard);
  await expectDoneFacts(doneCard);
  await expect(branchCard).toContainText("Reading preparation…");

  await page.clock.runFor(30_000);
  await expect(problem).toContainText(
    "GitHub did not answer within 30 seconds, so the read was given up.",
  );
  await expect(branchCard.locator(".card-preparation")).toHaveText(
    preparationGap,
  );
  await expectCardAssignments(branchCard, queuedCard);
  await expectDoneFacts(doneCard);
  await expect(problem).toContainText(detailRecovery);
  const from = githubFor(page).calls.length;

  await test.step("unchanged checks do not run while recovery is pending", async () => {
    await page.clock.runFor(14_000);
    expect(headsChecks(callsSince(page, from))).toHaveLength(0);
    expect(contentReads(callsSince(page, from))).toEqual([]);
  });

  await test.step("preparation answers on the due recovery without reload", async () => {
    release("preparation");
    await page.clock.runFor(1_250);
    await untilPageReadsAnswered(page);
    await expect(branchCard).not.toContainText(preparationGap);
    await expectCanonicalFacts(queuedCard);
    await expectCardAssignments(branchCard, queuedCard);
    await expectDoneFacts(doneCard);
    await expect(problem).toHaveCount(0);
    expect(
      contentReads(callsSince(page, from)).some((read) =>
        read.includes(takenCanonicalPath),
      ),
    ).toBe(true);
  });
});
