// Stale-card race crosses the UI and actual source-installed start command.
// Synthetic Claude observes native launch; it supplies no start refusal.
import { expect } from "../../dashboard/test-support/dashboardTest.ts";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import {
  expectSettledPage,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import { recordsOf } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  consumer,
  reason,
  condition,
  test,
  twoDependencies,
} from "../../dashboard/test-support/storyDependencyFixture.ts";
import {
  openUntilRead,
  untilPageRequestsAnswered,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import { nextAcceptedAttemptId } from "../../dashboard/test-support/acceptedAttemptPage.ts";
import { settledOutcome } from "../../dashboard/test-support/acceptedAttempts.ts";
import { dependencyDisclosure } from "../../dashboard/test-support/storyReference.ts";
import { storyCard } from "../../dashboard/test-support/storyCardControls.ts";

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
  const card = storyCard(parts(page).backlog, consumer.title);
  const start = card.getByRole("button", { name: "Start execution" });
  await expect(start).toBeEnabled();
  await expect(
    card.getByText("Ready for execution", { exact: true }),
  ).toBeVisible();
  await origin.publishRevision(twoDependencies());
  // Deliberately retain the rendered revision: the installed start fetches
  // origin and must enforce the newly published agreement itself.
  await expect(dependencyDisclosure(card)).toHaveCount(0);
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
