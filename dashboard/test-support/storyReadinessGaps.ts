// Gap observations for story readiness: reassessment, plan association
// conflict, and failed plan retrieval.
// Assertions observe what the shared readers project; setup never plants the
// gap labels themselves.

import { expect, type Locator, type Page } from "@playwright/test";
import { passTimeUntilChecked } from "./autoRefreshJourney.ts";
import { planHref } from "./queuedPlanNavigation.ts";
import type { CommittedOrigin } from "./committedOrigin.ts";
import { shortRevision, expectSettledPage, parts } from "./dashboardPage.ts";
import { notFoundAnswer } from "./originAnswers.ts";
import {
  hideDetail,
  inspectedDetail,
  slicePlanLink,
  storyCard,
} from "./storyCardControls.ts";
import { expectBadges } from "./storyCardFacts.ts";
import { commitPaths, writePlanning } from "./storyReadinessCli.ts";
import {
  openDoughProductBacklog,
  plannedBlocked,
  plannedReady,
  planBlockedPath,
  planReadyPath,
  type ReadinessRepo,
  unrefined,
} from "./storyReadinessFixture.ts";

export async function expectChangedReviewAfterContentChange(
  page: Page,
  taken: Locator,
  backlog: Locator,
  openDough: ReadinessRepo,
  origin: CommittedOrigin,
  publishAssessedContentChange: (repo: ReadinessRepo) => string,
) {
  const priorRevision = openDough.revision;
  const nextRevision = publishAssessedContentChange(openDough);
  origin.advanceTo(nextRevision);
  origin.requests.splice(0, origin.requests.length);

  await passTimeUntilChecked(page);
  await expectSettledPage(page);
  await expect(parts(page).readRevision).toContainText(
    shortRevision(nextRevision),
  );
  await expect(parts(page).readRevision).not.toContainText(
    shortRevision(priorRevision),
  );

  const readyCard = storyCard(taken, plannedReady.title);
  const blockedCard = storyCard(backlog, plannedBlocked.title);
  const changed = "Changed since readiness review";
  await expectBadges(readyCard, {
    shown: ["Slice planned", changed, "Ready for execution"],
  });
  await expectBadges(blockedCard, {
    shown: ["Slice planned", changed, "Not ready"],
  });
  for (const [card, judgment] of [
    [readyCard, "Assessment: Ready;"],
    [blockedCard, "Not ready (A blocking decision remains in the plan.)"],
  ] as const) {
    // The badge is the scan view's warning; the judgment it qualifies is
    // explained in the detail.
    await expect(card.getByText("Assessment:")).toHaveCount(0);
    const detail = await inspectedDetail(card);
    await expect(detail.getByText("Assessment:")).toContainText(judgment);
    await expect(detail.getByText("Assessment:")).toContainText(
      "Changed since readiness review",
    );
    if (card === blockedCard) {
      await expect(slicePlanLink(detail)).toHaveAttribute(
        "href",
        planHref("terryyin/open-dough", nextRevision),
      );
    }
    await hideDetail(card);
    await expect(card).toBeFocused();
  }
  await expectBadges(storyCard(backlog, unrefined.title), {
    shown: ["Not refined"],
  });
}

export async function expectPlanAssociationConflict(
  page: Page,
  taken: Locator,
  openDough: ReadinessRepo,
  origin: CommittedOrigin,
  publishConflictingPlanAssociation: (repo: ReadinessRepo) => string,
) {
  const nextRevision = publishConflictingPlanAssociation(openDough);
  origin.advanceTo(nextRevision);
  origin.requests.splice(0, origin.requests.length);

  await passTimeUntilChecked(page);
  await expectSettledPage(page);
  await expect(parts(page).readRevision).toContainText(
    shortRevision(nextRevision),
  );

  const readyCard = storyCard(taken, plannedReady.title);
  await expectBadges(readyCard, {
    shown: ["Slice planned", "Plan association conflict"],
    absent: ["Ready for execution", "Changed since readiness review"],
  });
  const detail = await inspectedDetail(readyCard);
  await expect(detail.getByText("Assessment:")).toContainText("disagree");
  await expect(detail.getByText("Assessment:")).toContainText(planBlockedPath);
  await expect(slicePlanLink(readyCard)).toHaveCount(0);
  await expect(
    detail.getByRole("link", { name: /^Disputed backlog plan / }),
  ).toHaveCount(1);
  await expect(
    detail.getByRole("link", { name: /^Disputed story-state plan / }),
  ).toHaveCount(1);
  await expect(detail).toContainText("does not choose between them");
  await expect(detail.getByText("recorded complete")).toHaveCount(0);
  await expectBadges(storyCard(parts(page).board, unrefined.title), {
    shown: ["Not refined"],
  });
  await expectBadges(readyCard, { absent: ["Not refined"] });
}

export async function expectFailedPlanKeepsSupportedFacts(
  page: Page,
  backlog: Locator,
  openDough: ReadinessRepo,
  origin: CommittedOrigin,
) {
  // A next revision for the page to check while the blocked story's plan
  // cannot be retrieved; the Taken story's plan association still agrees.
  writePlanning(
    openDough.directory,
    "PRODUCT-BACKLOG.md",
    openDoughProductBacklog({ label: "plan", target: planReadyPath }),
  );
  const next = commitPaths(
    openDough.directory,
    [".planning/PRODUCT-BACKLOG.md"],
    "Publish an agreeing plan association before plan failure",
  );
  openDough.advanceTo(next);
  origin.advanceTo(next);

  const failPlan = origin.answerWith(
    `.planning/${planBlockedPath}`,
    notFoundAnswer(),
  );
  origin.requests.splice(0, origin.requests.length);

  await passTimeUntilChecked(page);
  await expectSettledPage(page);
  await expect(parts(page).readRevision).toContainText(shortRevision(next));

  const blockedCard = storyCard(backlog, plannedBlocked.title);
  await expectBadges(blockedCard, {
    shown: ["Slice planned", "Readiness unavailable"],
    absent: ["Not ready", "Not refined"],
  });

  const detail = await inspectedDetail(blockedCard);
  await expect(detail).toContainText("Approach: Slice planned");
  await expect(detail).toContainText("associated plan could not be read");
  await expect(slicePlanLink(detail)).toHaveAttribute(
    "href",
    planHref("terryyin/open-dough", next),
  );
  await expect(detail.getByText("recorded complete")).toHaveCount(0);

  const { taken } = parts(page);
  // The plan failure stays the blocked story's own gap: the Taken story's
  // agreeing association shows no conflict and no change since review.
  await expectBadges(storyCard(taken, plannedReady.title), {
    absent: ["Plan association conflict", "Changed since readiness review"],
  });

  failPlan();
}
