// The CI comparison reads a configured project's own execution checkout and
// refuses one whose Git walks up to a parent checkout's history.
import { renameSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { performIntentCiComparisonRead } from "../../server/intentCiComparisonRead.ts";
import { knownSource } from "../../server/sessionAdmission.ts";
import { ordinaryTrunkModeCompletedHistory } from "../../test-support/support/completedStoryHistory.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { configuredFixtureProject } from "../support/fixtureProject.ts";

test("an execution checkout whose Git root is a parent checkout gets no CI comparison", async () => {
  const { repository, project } = await configuredFixtureProject(
    ordinaryTrunkModeCompletedHistory(),
  );
  // Git now walks up from the checkout to its parent's metadata.
  renameSync(
    path.join(repository.integration, ".git"),
    path.join(repository.fixture, ".git"),
  );

  expect(
    await performIntentCiComparisonRead(
      knownSource(project.id),
      { kind: "intent-ci-comparison", identity: queuedIdentity },
      new AbortController().signal,
    ),
  ).toMatchObject({
    answer: {
      kind: "unavailable",
      explanation:
        "The execution checkout no longer points to this project's Git root.",
    },
  });
});
