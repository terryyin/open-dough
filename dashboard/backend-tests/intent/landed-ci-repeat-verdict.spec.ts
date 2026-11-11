// Raw conclusion fields are the exact provider input under test, not supplied outcomes.
import { expect, test } from "../../tests/support/landedCiHistoryTest.ts";
import {
  followUpSettings,
  prepareRepeatScenario,
} from "../../tests/support/ciFollowUpScenario.ts";

test.use({ serverMode: "boundary" });

for (const verdict of [
  undefined,
  null,
  "neutral",
  "skipped",
  "provider-future-state",
] as const) {
  test(`completed repeat verdict ${String(verdict)} is never invented as a failure or success`, async ({
    origin,
    github,
    startServer,
  }) => {
    const scenario = await prepareRepeatScenario(origin, github);
    const server = await startServer();
    await followUpSettings(server, true);
    await scenario.ingest(server);
    await expect.poll(() => scenario.repeatCalls.length).toBe(1);
    scenario.providerVerdict(verdict);
    scenario.setRepeat({ seconds: 106 });
    await expect
      .poll(
        async () => (await followUpSettings(server)).body.cards[0]?.explanation,
      )
      .toContain(
        verdict === undefined || verdict === null
          ? "has no provider verdict"
          : `CI reported ${verdict}`,
      );
    const card = (await followUpSettings(server)).body.cards[0];
    expect(card?.kind).toBe("unverified");
    expect(card?.explanation).not.toContain("failed");
    if (verdict === undefined || verdict === null) {
      scenario.providerVerdict("success");
      await expect
        .poll(() => followUpSettings(server))
        .toMatchObject({
          body: { cards: [{ kind: "slow", repeatMs: 106000 }] },
        });
    }
    expect(scenario.repeatCalls).toEqual([71]);
  });
}
