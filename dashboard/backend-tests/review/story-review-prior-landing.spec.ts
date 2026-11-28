// A retired workspace's admitted prior landing stays readable from origin;
// a story with no record explains its missing comparison and completion.
import path from "node:path";
import { expect, test } from "vitest";
import { configuredFixtureProject } from "../support/fixtureProject.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyReview } from "../../server/storyReview.ts";
import { missingAgentTrunkCompletedHistory } from "../../test-support/support/completedStoryHistory.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import { queuedIdentity } from "../../test-support/support/startOrigin.ts";
import { storyALaunchRecord } from "../../test-support/support/storyLaunchRecord.ts";

const signal = new AbortController().signal;

test("a retired workspace preserves a published prior landing", async () => {
  const { repository, home } = await configuredFixtureProject(
    missingAgentTrunkCompletedHistory(),
  );
  const { completion, interleaving: baseline } = repository.revisions;
  if (completion === undefined || baseline === undefined)
    throw new Error("No published completion pair");
  const record = storyALaunchRecord(
    path.join(repository.fixture, "unreadable-workspace"),
  );
  record.landing = makeMe.aLaunchLanding
    .capturedFrom({
      repository: path.join(repository.fixture, "missing-capture"),
      identity: queuedIdentity,
    })
    .comparing({ base: baseline, revision: completion })
    .please();
  keepLaunchRecords(home, [record]);

  const active = await storyReview(
    { read: { subject: { source: "open-dough", identity: queuedIdentity } } },
    signal,
  );
  expect(active).toMatchObject({ kind: "landed", baseline, tree: completion });
  expect(active.selectedRun).toBe(active.runs?.[0]?.key);

  const absent = { source: "open-dough", identity: "SEED-B#b" };
  expect(await storyReview({ read: { subject: absent } }, signal)).toEqual({
    kind: "unavailable",
    explanation: "No published comparison is available for this story.",
  });
  const missingRecord = await storyReview(
    { read: { subject: absent, completed: true } },
    signal,
  );
  expect(missingRecord).toMatchObject({
    kind: "unavailable",
    explanation: expect.stringContaining(
      "No published completion record",
    ) as unknown,
  });
  expect(missingRecord).not.toHaveProperty("files");
});
