// Admission failures retain one spent request without later attribution.
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import { prepareAdapterRepeatScenario } from "../../tests/support/ciFollowUpAdapterScenario.ts";
import { followUpCards } from "../../tests/support/ciFollowUpScenario.ts";
import {
  ingest,
  retained,
  requestOf,
} from "../../tests/support/ciFollowUpAdapterAssertions.ts";
import type { Answers } from "../../tests/intentCiAdapterFixture.ts";

test.use({ serverMode: "boundary" });
const submissions: readonly [string, Partial<Answers>, string][] = [
  [
    "refused",
    { rebuild: { result: "refused", reason: "CI is not admitting work" } },
    "CI repeat request refused: CI is not admitting work",
  ],
  [
    "already queued",
    { rebuild: { result: "refused", reason: "Revision already queued" } },
    "CI repeat request refused: Revision already queued",
  ],
  [
    "already running",
    { rebuild: { result: "refused", reason: "Revision already running" } },
    "CI repeat request refused: Revision already running",
  ],
  [
    "explicitly uncertain",
    { rebuild: { result: "uncertain", reason: "Admission response was lost" } },
    "Request acceptance is uncertain: Admission response was lost",
  ],
  [
    "nonzero exit",
    { rebuildStderr: "Admission connection failed" },
    "Request acceptance is uncertain",
  ],
  ["timeout", { rebuildHeld: true }, "Request acceptance is uncertain"],
  [
    "oversized output",
    {
      rebuildStdout: JSON.stringify({
        result: "uncertain",
        reason: "x".repeat(65536),
      }),
    },
    "Request acceptance is uncertain",
  ],
  [
    "malformed JSON",
    { rebuildStdout: "{broken" },
    "Request acceptance is uncertain: CI adapter returned invalid JSON",
  ],
  [
    "invalid answer shape",
    { rebuild: { accepted: true } },
    "Request acceptance is uncertain: CI rebuild must return",
  ],
];

for (const [condition, answer, explanation] of submissions) {
  test(`${condition} leaves one spent request and never attributes later CI after restart`, async ({
    origin,
    github,
    startServer,
  }) => {
    const scenario = await prepareAdapterRepeatScenario(origin, github);
    scenario.answerWith(answer);
    const server = await ingest(
      scenario,
      startServer,
      condition === "timeout" ? 1000 : undefined,
    );
    await expect
      .poll(() => followUpCards(server))
      .toMatchObject([
        {
          kind: "unverified",
          explanation: expect.stringContaining(explanation),
        },
      ]);
    expect((await followUpCards(server))[0]?.explanation).toContain(
      "will not be resent",
    );
    expect(requestOf(server)?.submission.kind).toBe(
      condition.startsWith("already") || condition === "refused"
        ? "refused"
        : "uncertain",
    );
    scenario.setRepeat(106);
    await retained(scenario, server, startServer, explanation, true);
  });
}

test("interruption retains intent and never resends or attributes a later attempt", async ({
  origin,
  github,
  startServer,
}) => {
  const scenario = await prepareAdapterRepeatScenario(origin, github);
  scenario.holdRebuild();
  const first = await ingest(scenario, startServer);
  expect(requestOf(first)?.submission.kind).toBe("intent");
  await first.close();
  expect(requestOf(first)?.submission.kind).toBe("intent");
  scenario.setRepeat(106);
  scenario.releaseRebuild();
  const restarted = await startServer();
  await retained(
    scenario,
    restarted,
    startServer,
    "acceptance is unverified and will not be resent",
    true,
  );
});
