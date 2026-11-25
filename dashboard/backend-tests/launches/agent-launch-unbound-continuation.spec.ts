import { keptAttempts } from "../../test-support/acceptedAttempts.ts";
import {
  attemptsAttending,
  continueAttempt,
  recordsOf,
} from "../../test-support/agentLaunchBoundary.ts";
import { keepHistoricalClaudeStart } from "../../test-support/historicalClaudeRecovery.ts";
import { keptLaunchRecords } from "../../test-support/support/launchStore.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";

test.use({ serverMode: "boundary" });

test("Continue verifies a historical Claude session in its original checkout without publishing or starting another", async ({
  dashboard,
  origin,
}) => {
  const { attempt, launch, sessionId } = await keepHistoricalClaudeStart(
    dashboard,
    origin.project,
  );
  const trunk = await originMain(origin);
  const originalListing = dashboard.claudeListing();
  dashboard.claudeListingBecomes(
    originalListing.map((row) => ({ ...row, cwd: dashboard.home })),
  );

  expect(await recordsOf(dashboard, "open-dough")).toEqual([]);
  expect(await attemptsAttending(dashboard)).toEqual([
    expect.objectContaining({ id: attempt.id, request: attempt.request }),
  ]);
  const refused = await continueAttempt(dashboard, attempt.id);
  expect(JSON.parse(refused.body)).toMatchObject({
    kind: "uncertain",
    explanation: expect.stringContaining("could not be verified"),
  });
  expect(keptAttempts(dashboard)).toEqual([attempt]);

  dashboard.claudeListingBecomes(originalListing);
  const continued = await continueAttempt(dashboard, attempt.id);
  expect(JSON.parse(continued.body)).toMatchObject({
    kind: "accepted",
    recoveredSession: launch,
    attempt: {
      id: attempt.id,
      request: attempt.request,
      acceptedAt: attempt.acceptedAt,
      publication: { kind: "none" },
      outcome: { kind: "launched", session: { host: "claude", sessionId } },
    },
  });
  expect(keptLaunchRecords(dashboard)).toEqual([launch]);
  expect(await recordsOf(dashboard, "open-dough")).toEqual([]);
  expect(await originMain(origin)).toBe(trunk);
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
});
