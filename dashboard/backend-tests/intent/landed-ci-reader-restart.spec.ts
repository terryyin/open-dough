// A reopened retained history answers the saved point without asking the
// provider. Old-address restart composition (new reader origin while another
// listener claims the stopped server's port; zero reader traffic there) lives
// in e2e/intent/landed-ci-reader-restart.spec.ts — a local-file read alone
// cannot own that distinction.
import { expect, onTestFinished, test, vi } from "vitest";
import { githubApi } from "../../../Distribution/tests/skills/dough-execute-plan/github-actions-api-test-fixtures.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
import { updateProjectHistory } from "../../server/landedCiHistoryStore.ts";

const source = makeMe.aPublishedSource.openDough.please();
const description = makeMe.aRepository
  .withBaseBeforeEveryLaunch()
  .withRevision("retained")
  .please();

test("reopened retained history answers the saved point without provider calls", async () => {
  const checkout = await materializeLocalCheckout(undefined, description, {
    gitTemplates: false,
  });
  const repository = checkout.integration;
  const { retained: revision } = checkout.revisions;
  const stopped = new AbortController();
  vi.stubEnv("HOME", checkout.fixture);
  onTestFinished(async () => {
    stopped.abort();
    vi.unstubAllEnvs();
    await checkout.cleanup();
  });

  const receivedAt = "2026-11-05T10:00:00Z";
  const completedAt = "2026-11-05T10:02:00Z";
  const landing = makeMe.aLaunchLanding
    .capturedFrom({ repository })
    .comparing({ base: checkout.revisions.base, revision })
    .deliveredAs({
      delivery: "62000000-0000-4000-8000-000000000001",
      receipt: "62000000-0000-4000-8000-000000000001",
    })
    .receivedAt(receivedAt)
    .please();

  await updateProjectHistory(source.id, () =>
    makeMe.aLandedCiHistory
      .measuredLanding({
        receipt: landing.receipt,
        revision,
        receivedAt,
        repository,
        runId: 62,
        startedAt: receivedAt,
        completedAt,
      })
      .inTrunkOrder([revision])
      .please(),
  );

  const github = vi.fn(
    githubApi(() => {
      throw new Error("Provider must not be asked for a retained history read");
    }),
  );

  const retained = await performIntentCiHistoryRead(source, {
    kind: "intent-ci-history",
  });
  expect(retained).toMatchObject({
    kind: "answered",
    answer: {
      entries: [
        {
          kind: "point",
          runId: 62,
          revision,
          startedAt: receivedAt,
          completedAt,
        },
      ],
    },
  });

  const asked = github.mock.calls.length;
  expect(
    await performIntentCiHistoryRead(source, {
      kind: "intent-ci-history",
    }),
  ).toEqual(retained);
  expect(github).toHaveBeenCalledTimes(asked);
  expect(asked).toBe(0);
});
