// Gap observations for story readiness: reassessment, plan association
// conflict, failed plan retrieval, and malformed/external/legacy truthfulness.
// Assertions observe what the shared readers project; setup never plants the
// gap labels themselves.

import { expect, type Locator, type Page } from "@playwright/test";
import { contentPathsRead, type CommittedOrigin } from "./committedOrigin";
import { parts } from "./dashboardPage";
import { notFoundAnswer } from "./originAnswers";
import { commitPaths, writePlanning } from "./storyReadinessCli";
import {
  externalPlan,
  legacy,
  malformed,
  openDoughProductBacklog,
  plannedBlocked,
  plannedReady,
  planBlockedPath,
  planReadyPath,
  type ReadinessRepo,
  unrefined,
} from "./storyReadinessFixture";

export async function expectNeedsReassessmentAfterContentChange(
  taken: Locator,
  backlog: Locator,
  source: Locator,
  refresh: Locator,
  openDough: ReadinessRepo,
  origin: CommittedOrigin,
  publishAssessedContentChange: (repo: ReadinessRepo) => string,
) {
  const priorRevision = openDough.revision;
  const nextRevision = publishAssessedContentChange(openDough);
  origin.advanceTo(nextRevision);
  origin.requests.splice(0, origin.requests.length);

  await refresh.click();
  await expect(source).toContainText(nextRevision);
  await expect(source).not.toContainText(priorRevision);

  const readyCard = taken.getByRole("article", { name: plannedReady.title });
  const blockedCard = backlog.getByRole("article", {
    name: plannedBlocked.title,
  });
  await expect(
    readyCard.getByText("Slice planned", { exact: true }),
  ).toBeVisible();
  await expect(
    readyCard.getByText("Needs reassessment", { exact: true }),
  ).toBeVisible();
  await expect(
    readyCard.getByText("Ready for execution", { exact: true }),
  ).toHaveCount(0);
  await expect(
    blockedCard.getByText("Slice planned", { exact: true }),
  ).toBeVisible();
  await expect(
    blockedCard.getByText("Needs reassessment", { exact: true }),
  ).toBeVisible();
  await expect(blockedCard.getByText("Not ready", { exact: true })).toHaveCount(
    0,
  );
  await expect(
    backlog
      .getByRole("article", { name: unrefined.title })
      .getByText("Not refined", { exact: true }),
  ).toBeVisible();
}

export async function expectPlanAssociationConflict(
  page: Page,
  taken: Locator,
  source: Locator,
  refresh: Locator,
  openDough: ReadinessRepo,
  origin: CommittedOrigin,
  publishConflictingPlanAssociation: (repo: ReadinessRepo) => string,
) {
  const nextRevision = publishConflictingPlanAssociation(openDough);
  origin.advanceTo(nextRevision);
  origin.requests.splice(0, origin.requests.length);

  await refresh.click();
  await expect(source).toContainText(nextRevision);

  const readyCard = taken.getByRole("article", { name: plannedReady.title });
  await expect(
    readyCard.getByText("Slice planned", { exact: true }),
  ).toBeVisible();
  await expect(
    readyCard.getByText("Plan association conflict", { exact: true }),
  ).toBeVisible();
  await expect(
    readyCard.getByText("Ready for execution", { exact: true }),
  ).toHaveCount(0);
  await expect(
    readyCard.getByText("Needs reassessment", { exact: true }),
  ).toHaveCount(0);
  await readyCard.getByText("Preparation facts").click();
  await expect(readyCard.getByText("Assessment:")).toContainText("disagree");
  await expect(readyCard.getByText("Assessment:")).toContainText(
    planBlockedPath,
  );

  await readyCard.getByRole("button", { name: "Inspect story" }).click();
  const detail = readyCard.getByRole("region", {
    name: `Detail for ${plannedReady.title}`,
  });
  await expect(detail).toContainText("disagree");
  await expect(detail).toContainText("does not choose between them");
  await expect(detail.getByText("recorded complete")).toHaveCount(0);
  await expect(
    page
      .getByRole("article", { name: unrefined.title })
      .getByText("Not refined", { exact: true }),
  ).toBeVisible();
  await expect(readyCard.getByText("Not refined", { exact: true })).toHaveCount(
    0,
  );
}

export async function expectFailedPlanKeepsSupportedFacts(
  page: Page,
  backlog: Locator,
  source: Locator,
  refresh: Locator,
  openDough: ReadinessRepo,
  origin: CommittedOrigin,
) {
  writePlanning(
    openDough.directory,
    "PRODUCT-BACKLOG.md",
    openDoughProductBacklog(planReadyPath),
  );
  const next = commitPaths(
    openDough.directory,
    [".planning/PRODUCT-BACKLOG.md"],
    "Restore agreeing plan association before plan failure",
  );
  openDough.advanceTo(next);
  origin.advanceTo(next);

  const failPlan = origin.answerWith(
    `.planning/${planBlockedPath}`,
    notFoundAnswer(),
  );
  origin.requests.splice(0, origin.requests.length);

  await refresh.click();
  await expect(source).toContainText(next);

  const blockedCard = backlog.getByRole("article", {
    name: plannedBlocked.title,
  });
  await expect(
    blockedCard.getByText("Slice planned", { exact: true }),
  ).toBeVisible();
  await expect(
    blockedCard.getByText("Readiness unavailable", { exact: true }),
  ).toBeVisible();
  await expect(blockedCard.getByText("Not ready", { exact: true })).toHaveCount(
    0,
  );
  await expect(
    blockedCard.getByText("Not refined", { exact: true }),
  ).toHaveCount(0);

  await blockedCard.getByRole("button", { name: "Inspect story" }).click();
  const detail = blockedCard.getByRole("region", {
    name: `Detail for ${plannedBlocked.title}`,
  });
  await expect(detail).toContainText("Approach: Slice planned");
  await expect(detail).toContainText("associated plan could not be read");
  await expect(detail.getByText("recorded complete")).toHaveCount(0);

  const { taken } = parts(page);
  const readyCard = taken.getByRole("article", { name: plannedReady.title });
  await expect(
    readyCard.getByText("Plan association conflict", { exact: true }),
  ).toHaveCount(0);
  // After content change, ready still needs reassessment when plan agrees.
  await expect(
    readyCard.getByText("Needs reassessment", { exact: true }),
  ).toBeVisible();

  failPlan();
}

export async function expectMalformedExternalAndLegacy(
  backlog: Locator,
  doughnutOrigin: CommittedOrigin,
) {
  const malformedCard = backlog.getByRole("article", {
    name: malformed.title,
  });
  await expect(
    malformedCard.getByText("Not refined", { exact: true }),
  ).toHaveCount(0);
  await expect(
    malformedCard.getByText("Not recorded", { exact: true }),
  ).toHaveCount(0);
  await expect(malformedCard.locator(".preparation-problem")).toContainText(
    "not valid JSON",
  );

  const legacyCard = backlog.getByRole("article", { name: legacy.title });
  await expect(
    legacyCard.getByText("Not recorded", { exact: true }),
  ).toBeVisible();

  const externalCard = backlog.getByRole("article", {
    name: externalPlan.title,
  });
  await expect(
    externalCard.getByText("Refined", { exact: true }),
  ).toBeVisible();
  await externalCard.getByRole("button", { name: "Inspect story" }).click();
  const detail = externalCard.getByRole("region", {
    name: `Detail for ${externalPlan.title}`,
  });
  await expect(detail.getByText("External reference")).toBeVisible();
  await expect(detail.getByRole("link", { name: /Plan/ })).toHaveAttribute(
    "href",
    /example\.com\/plans\/external-only/,
  );

  const doughnutPaths = contentPathsRead(doughnutOrigin);
  expect(doughnutPaths.some((path) => path.includes("example.com"))).toBe(
    false,
  );
}
