import { queuedReadyRepository } from "../../../tests/support/queued-repository.mjs";
import { passTimeUntilChecked, pausePageClock } from "../autoRefreshJourney.ts";
import { expect } from "../dashboardTest.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { shortRevision, parts } from "../dashboardPage.ts";
import { expectDependencyAccessibly } from "../storyDependencyAccessible.ts";
import {
  consumer,
  supplierB,
  supplierC,
  test,
  twoDependencies,
  recordDependency,
  publishDependencies,
} from "../storyDependencyFixture.ts";
import {
  openUntilRead,
  untilPageRequestsAnswered,
} from "../pageRequestNotes.ts";
import { nextAcceptedAttemptId } from "../acceptedAttemptPage.ts";
import { settledOutcome } from "../acceptedAttempts.ts";

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
  const card = parts(page).backlog.getByRole("article", {
    name: consumer.title,
    exact: true,
  });
  const execution = card.getByRole("button", { name: "Start execution" });
  const summary = card.locator(".story-dependencies summary");
  await expect(summary).toHaveText("Dependencies · 2 blocking");
  await expect(execution).toBeDisabled();
  await expect(execution).toHaveAccessibleDescription(
    /2 blocking dependencies/,
  );
  await expect(
    card.getByRole("button", { name: "Start refinement" }),
  ).toBeEnabled();
  await card.getByRole("button", { name: "Inspect story" }).click();
  await expect(
    card.getByRole("region", { name: "Detail for Story A" }),
  ).toBeVisible();
  await card.getByRole("button", { name: "Hide detail" }).click();
  await expect(card).toBeFocused();
  await expect(card.getByText("Slice planned", { exact: true })).toBeVisible();
  await expect(card.getByText("Not ready", { exact: true })).toBeVisible();
  // Start eligibility counts the dependencies beside the assessment.
  await expect(
    card.getByText("Blocked by 2 dependencies", { exact: true }),
  ).toBeVisible();
  await expect(card.locator(".badge-ready")).toHaveCount(0);
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
  const supplierCard = parts(page).backlog.getByRole("article", {
    name: "Story B",
    exact: true,
  });
  await expect(supplierCard.locator(".story-dependencies")).toHaveCount(0);
  await expect(
    supplierCard.getByRole("button", { name: "Start execution" }),
  ).toBeEnabled();

  const list = card.getByRole("list", { name: "Story dependencies" });
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
  await expect(
    card.getByText("Blocked by 1 dependency", { exact: true }),
  ).toBeVisible();
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
  await expect(card.getByText("Not ready", { exact: true })).toBeVisible();
  await expect(card.locator(".badge-blocked-by-dependencies")).toHaveCount(0);
  await expect(card.locator(".badge-ready")).toHaveCount(0);
  // A supplier's resolution leaves the reviewed agreement unchanged.
  await expect(
    card.getByText("Changed since readiness review", { exact: true }),
  ).toHaveCount(0);
  // The readiness reason is secondary detail, read without another source
  // read; the Not ready badge stays in the scan view.
  await expect(card).not.toContainText(
    "Unrelated consumer design decision remains.",
  );
  const readsBeforeDetail = published.requests.length;
  await card.getByRole("button", { name: "Inspect story" }).click();
  await expect(
    card.getByRole("region", { name: "Detail for Story A" }),
  ).toContainText("Unrelated consumer design decision remains.");
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
