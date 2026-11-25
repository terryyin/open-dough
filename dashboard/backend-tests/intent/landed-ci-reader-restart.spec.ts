import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
import { updateProjectHistory } from "../../server/landedCiKeepEvidence.ts";

const source = makeMe.aPublishedSource.openDough.please();
const description = makeMe.aRepository
  .withBaseBeforeEveryLaunch()
  .withRevision("retained")
  .please();

test("the wall-time history reader reopens a saved landing from disk", async () => {
  const checkout = await materializeLocalCheckout(undefined, description, {
    gitTemplates: false,
  });
  const repository = checkout.integration;
  const { retained: revision } = checkout.revisions;
  onTestFinished(() => checkout.cleanup());

  const receivedAt = "2026-11-05T10:00:00Z";
  const completedAt = "2026-11-05T10:02:00Z";
  const runId = 62;
  const history = makeMe.aLandedCiHistory
    .measuredLanding({
      receipt: "62000000-0000-4000-8000-000000000001",
      revision,
      receivedAt,
      repository,
      runId,
      startedAt: receivedAt,
      completedAt,
    })
    .inTrunkOrder([revision])
    .please();
  await updateProjectHistory(source.id, () => history, checkout.fixture);

  const retained = await performIntentCiHistoryRead(
    source,
    { kind: "intent-ci-history" },
    { home: checkout.fixture },
  );
  expect(retained).toMatchObject({
    kind: "answered",
    answer: {
      entries: expect.arrayContaining([
        expect.objectContaining({
          kind: "point",
          runId,
          revision,
          startedAt: receivedAt,
          completedAt,
        }),
      ]) as unknown,
    },
  });
});
