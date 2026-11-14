import { queuedReadyRepository } from "../../Distribution/tests/support/queued-repository.mjs";
import {
  passTimeUntilChecked,
  pausePageClock,
} from "../../dashboard/tests/autoRefreshJourney.ts";
import { expect } from "../../dashboard/tests/dashboardTest.ts";
import { publishCommittedOrigin } from "../../dashboard/tests/committedOrigin.ts";
import { shortRevision, parts } from "../../dashboard/tests/dashboardPage.ts";
import { expectDependencyAccessibly } from "../../dashboard/tests/storyDependencyAccessible.ts";
import {
  consumer,
  supplierB,
  supplierC,
  test,
  twoDependencies,
  recordDependency,
  publishDependencies,
  secondInSeedB,
  suppliersInOneSeed,
} from "../../dashboard/tests/storyDependencyFixture.ts";
import {
  openUntilRead,
  untilPageRequestsAnswered,
} from "../../dashboard/tests/pageRequestNotes.ts";
import { nextAcceptedAttemptId } from "../../dashboard/tests/acceptedAttemptPage.ts";
import { settledOutcome } from "../../dashboard/tests/acceptedAttempts.ts";
import {
  dependencyDisclosure,
  dependencyList,
  dependencySummary,
  followReference,
  openDependencies,
  storyReference,
} from "../../dashboard/tests/storyReference.ts";
import {
  hideDetail,
  inspectedDetail,
  storyCard,
} from "../../dashboard/tests/storyCardControls.ts";
import {
  blockedByAnyDependency,
  expectBadges,
} from "../../dashboard/tests/storyCardFacts.ts";

// The accessible disclosure check taps the dependencies summary. Story A
// waits on Story B and needs a decision about Story C, and is not ready for
// an unrelated reason.
test.use({
  hasTouch: true,
  originRepository: queuedReadyRepository()
    .withRevision(
      "dependencies",
      twoDependencies({
        assessment: "not-ready",
        reasons: ["Unrelated consumer design decision remains."],
      }),
    )
    .please(),
});

test("published consumer dependencies disclose blockers accessibly and preserve independent readiness", async ({
  page,
  origin,
  dashboard,
}) => {
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await pausePageClock(page);
  await openUntilRead(page);
  const card = storyCard(parts(page).backlog, consumer.title);
  const execution = card.getByRole("button", { name: "Start execution" });
  const summary = dependencySummary(card);
  await expect(summary).toHaveText("Dependencies · 2 blocking");
  await expect(execution).toBeDisabled();
  await expect(execution).toHaveAccessibleDescription(
    /2 blocking dependencies/,
  );
  await expect(
    card.getByRole("button", { name: "Start refinement" }),
  ).toBeEnabled();
  await inspectedDetail(card);
  await hideDetail(card);
  await expect(card).toBeFocused();
  // Start eligibility counts the dependencies beside the assessment.
  await expectBadges(card, {
    shown: ["Slice planned", "Not ready", "Blocked by 2 dependencies"],
    absent: ["Ready for execution"],
  });
  await expect(card.getByText("Priority 1")).toBeVisible();
  await card.getByRole("button", { name: "Start refinement" }).click();
  await expect(
    page.getByRole("dialog", { name: "Start refinement in Claude Code" }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancel" })
    .click();
  await expect(
    page.getByRole("dialog", {
      name: "Start refinement in Claude Code",
      includeHidden: true,
    }),
  ).toHaveCount(0);
  await expect(
    card.getByRole("button", { name: "Start refinement" }),
  ).toBeFocused();
  const supplierCard = storyCard(parts(page).backlog, "Story B");
  await expect(dependencyDisclosure(supplierCard)).toHaveCount(0);
  await expect(
    supplierCard.getByRole("button", { name: "Start execution" }),
  ).toBeEnabled();

  const list = dependencyList(card);
  await expectDependencyAccessibly(page, card, revision);

  recordDependency(origin, {
    supplier: supplierB,
    state: "satisfied",
    resolution: {
      revision,
      path: ".planning/seeds/B.md",
      summary: "Accepted supplier endpoint proof.",
    },
  });
  const one = await publishDependencies(origin);
  await card.focus();
  await passTimeUntilChecked(page);
  await expect(parts(page).readRevision).toContainText(shortRevision(one));
  await expect(card).toBeFocused();
  await expect(summary).toHaveText("Dependencies · 1 blocking");
  await expect(execution).toBeDisabled();
  await expectBadges(card, { shown: ["Blocked by 1 dependency"] });
  // The dependencies the developer opened stay open across the refresh.
  await expect(list).toBeVisible();
  await expect(list).toContainText("Satisfied");
  await expect(list).toContainText("Decision needed");
  await expect(
    list.getByRole("link", { name: `Revision ${revision}` }),
  ).toHaveAttribute(
    "href",
    `https://github.com/terryyin/open-dough/blob/${revision}/.planning/seeds/B.md`,
  );

  recordDependency(origin, {
    supplier: supplierC,
    state: "satisfied",
    resolution: {
      revision,
      path: ".planning/seeds/B.md",
      summary: "Accepted supplier endpoint proof.",
    },
  });
  const both = await publishDependencies(origin);
  await passTimeUntilChecked(page);
  await expect(parts(page).readRevision).toContainText(shortRevision(both));
  await expect(summary).toHaveText("Dependencies · 0 blocking");
  await expect(execution).toBeEnabled();
  await expect(execution).toHaveAccessibleDescription(/Not assessed as ready/);
  // A supplier's resolution leaves the reviewed agreement unchanged.
  await expectBadges(card, {
    shown: ["Not ready"],
    absent: [
      blockedByAnyDependency,
      "Ready for execution",
      "Changed since readiness review",
    ],
  });
  // The readiness reason is secondary detail, read without another source
  // read; the Not ready badge stays in the scan view.
  await expect(card).not.toContainText(
    "Unrelated consumer design decision remains.",
  );
  const readsBeforeDetail = published.requests.length;
  await expect(await inspectedDetail(card)).toContainText(
    "Unrelated consumer design decision remains.",
  );
  expect(published.requests.length).toBe(readsBeforeDetail);
  // Removing the dependency gate restores the existing noted action. The
  // independent readiness judgment still refuses at the real startup command.
  const acceptance = nextAcceptedAttemptId(page);
  await execution.click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  const attemptId = await acceptance;
  await settledOutcome(dashboard, attemptId);
  await untilPageRequestsAnswered(page);
  await expect(card).toContainText("published preparation is not-ready");
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await origin.takenProfiles()).toEqual([]);
  expect(published.requests.length).toBeGreaterThan(0);
});

test("two suppliers sharing one seed display their titles and open their own stories", async ({
  page,
  origin,
}) => {
  await origin.publishRevision(suppliersInOneSeed());
  recordDependency(origin, { supplier: secondInSeedB, state: "waiting" });
  const revision = await publishDependencies(origin);
  await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
  });
  await openUntilRead(page);
  const card = storyCard(parts(page).backlog, "Story A");
  await openDependencies(card);
  await expect(storyReference(card, "Story B")).toHaveAttribute(
    "href",
    `https://github.com/terryyin/open-dough/blob/${revision}/.planning/seeds/B.md#b`,
  );
  await expect(storyReference(card, "Second story in seed B")).toHaveAttribute(
    "href",
    `https://github.com/terryyin/open-dough/blob/${revision}/.planning/seeds/B.md#second`,
  );
  await followReference(card, "Story B");
  await expect(storyCard(parts(page).backlog, "Story B")).toBeFocused();
  await followReference(card, "Second story in seed B");
  await expect(
    storyCard(parts(page).backlog, "Second story in seed B"),
  ).toBeFocused();
});
