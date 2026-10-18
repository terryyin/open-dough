// Stale-card race crosses the UI and actual source-installed start command.
// Synthetic Claude observes native launch; it supplies no start refusal.
import { expect } from "./dashboardTest.ts";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { expectSettledPage, parts } from "./dashboardPage.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import {
  consumer,
  reason,
  condition,
  test,
  twoDependencies,
} from "./storyDependencyFixture.ts";
import {
  openUntilRead,
  untilPageRequestsAnswered,
} from "./pageRequestNotes.ts";
import { nextAcceptedAttemptId } from "./acceptedAttemptPage.ts";
import { settledOutcome } from "./acceptedAttempts.ts";

test.setTimeout(120_000);

test("a blocker published after the card rendered refuses real startup before claim or native launch", async ({
  page,
  origin,
  dashboard,
}) => {
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  await publishCommittedOrigin(page, {
    repoDir: origin.project,
    revision,
    repository: "terryyin/open-dough",
    follows: true,
  });
  await openUntilRead(page);
  await expectSettledPage(page);
  const card = parts(page).backlog.getByRole("article", {
    name: consumer.title,
    exact: true,
  });
  const start = card.getByRole("button", { name: "Start execution" });
  await expect(start).toBeEnabled();
  await expect(
    card.getByText("Ready for execution", { exact: true }),
  ).toBeVisible();
  await twoDependencies(origin);
  // Deliberately retain the rendered revision: the installed start fetches
  // origin and must enforce the newly published agreement itself.
  await expect(card.locator(".story-dependencies")).toHaveCount(0);
  const acceptance = nextAcceptedAttemptId(page);
  await start.click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Start", exact: true })
    .click();
  const attemptId = await acceptance;
  await settledOutcome(dashboard, attemptId);
  await untilPageRequestsAnswered(page);
  await expect(card).toContainText("execution is blocked by SEED-B#b");
  await expect(card).toContainText(reason);
  await expect(card).toContainText(condition);
  await expect(card).toContainText("Nothing was launched.");
  expect(await origin.takenProfiles()).toEqual([]);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await recordsOf(dashboard, "open-dough")).toEqual([]);
});
