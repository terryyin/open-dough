// Collection keeps the link and local order even before CI answers.
import { expect, onTestFinished, test, vi } from "vitest";
import { githubApi } from "../../../Distribution/tests/skills/dough-execute-plan/github-actions-api-test-fixtures.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { GitHubAcquisitionFailed } from "../../../Distribution/src/skills/dough-execute-plan/scripts/ci-github-actions.mjs";
import { performIntentCiHistoryRead } from "../../server/intentCiHistoryRead.ts";
import { keptLandedCiHistory } from "../../server/landedCiHistoryStore.ts";
import { collectLandedCiPass } from "../../server/landedCiPass.ts";
import { passRead } from "../../server/landedCiPassRead.ts";

const source = makeMe.aPublishedSource.openDough.please();
const description = makeMe.aRepository
  .withBaseBeforeEveryLaunch()
  .withRevision("revision")
  .please();

async function acceptedLanding() {
  const checkout = await materializeLocalCheckout(undefined, description, {
    gitTemplates: false,
  });
  vi.stubEnv("HOME", checkout.fixture);
  onTestFinished(async () => {
    vi.unstubAllEnvs();
    await checkout.cleanup();
  });
  const landing = makeMe.aLaunchLanding
    .capturedFrom({ repository: checkout.integration })
    .comparing(checkout.revisions)
    .please();
  return { landing, repository: checkout.integration };
}

test("a queued exact attempt is a linked scope gap before any proof is requested", async () => {
  const { landing, repository } = await acceptedLanding();
  const { revision, receivedAt } = landing;
  const runUrl = "https://ci.invalid/runs/51/attempts/2";
  const run = makeMe.aCiRun
    .with({
      headSha: revision,
      id: 51,
      attempt: 2,
      status: "queued",
      url: runUrl,
    })
    .please();
  const gh = githubApi(({ commit }: { commit?: string }) =>
    commit === revision ? [run] : [],
  );
  const stopped = new AbortController();
  const readProof = vi.fn();
  await collectLandedCiPass({
    source,
    receipts: [landing],
    history: await keptLandedCiHistory(source.id),
    repository,
    stopped: stopped.signal,
    read: passRead(source, repository, stopped.signal, {
      providers: { github: gh },
    }),
    readProof,
  });
  stopped.abort();

  const reading = await performIntentCiHistoryRead(source, {
    kind: "intent-ci-history",
    scope: "dashboard/tests",
    revision,
    through: receivedAt,
  });
  expect(reading).toMatchObject({
    kind: "answered",
    answer: {
      path: "dashboard/tests",
      selectedRevision: revision,
      entries: [
        {
          kind: "gap",
          selected: true,
          reason: expect.stringMatching(/pending/i) as unknown,
          landings: [{ revision, selected: true }],
          run: { runId: 51, runAttempt: 2, runUrl },
          readings: [],
        },
      ],
    },
  });
  if (reading.kind !== "answered" || !("entries" in reading.answer))
    throw new Error("Missing scoped history");
  expect(reading.answer.entries[0]).not.toHaveProperty("build");
  expect(readProof).not.toHaveBeenCalled();
});

test("an unread CI landing keeps independent local trunk order in the file store", async () => {
  const { landing, repository } = await acceptedLanding();
  const stopped = new AbortController();
  await collectLandedCiPass({
    source,
    receipts: [landing],
    history: await keptLandedCiHistory(source.id),
    repository,
    stopped: stopped.signal,
    read: passRead(source, repository, stopped.signal, {
      providers: {
        github: (args: readonly string[]) =>
          Promise.reject(
            new GitHubAcquisitionFailed(args[1], { kind: "http", status: 503 }),
          ),
      },
    }),
    readProof: vi.fn(),
  });
  stopped.abort();

  expect(await keptLandedCiHistory(source.id)).toMatchObject({
    landings: {
      [landing.receipt]: { observed: { kind: "pending", waitsFor: "read" } },
    },
    trunkOrder: [landing.revision],
  });
});
