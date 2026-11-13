// Shared lifecycle assertions for real custom follow-up receipt journeys.
import { expect } from "./landedCiHistoryTest.ts";
import type { prepareAdapterRepeatScenario } from "./ciFollowUpAdapterScenario.ts";
import { followUpCards, readFollowUpLedger } from "./ciFollowUpScenario.ts";
import type { DashboardServer } from "./dashboardServer.ts";
export type Scenario = Awaited<ReturnType<typeof prepareAdapterRepeatScenario>>;
type StartServer = (facts?: {
  adapterTimeoutMs?: number;
}) => Promise<DashboardServer>;
export const requestOf = (server: DashboardServer) =>
  Object.values(readFollowUpLedger(server).landings).find((l) => l.request)
    ?.request;
export async function ingest(
  scenario: Scenario,
  startServer: StartServer,
  adapterTimeoutMs?: number,
) {
  const server = await startServer(
    adapterTimeoutMs === undefined ? {} : { adapterTimeoutMs },
  );
  await scenario.collectPriors(server);
  await scenario.ingest(server);
  await expect.poll(() => scenario.adapter.rebuildRequests()).toHaveLength(1);
  return server;
}

// Real completed collection calls on either side of restart prove the allowance
// remains spent; merely reading the card would not reach submission.
export async function retained(
  scenario: Scenario,
  first: DashboardServer,
  startServer: () => Promise<DashboardServer>,
  explanation: string,
  unattributed = false,
) {
  const check = async (server: DashboardServer) => {
    let observedCards: Awaited<ReturnType<typeof followUpCards>> | undefined;
    await expect
      .poll(async () => {
        observedCards = await followUpCards(server);
        return observedCards;
      })
      .toMatchObject([
        {
          kind: "unverified",
          explanation: expect.stringContaining(explanation),
        },
      ]);
    if (unattributed) {
      expect(observedCards?.[0]?.repeatMs).toBeUndefined();
      expect(requestOf(server)?.outcome.observed).toBeUndefined();
      expect(requestOf(server)?.outcome.repeat).toBeUndefined();
    }
    expect(scenario.adapter.rebuildRequests()).toHaveLength(1);
  };
  await check(first);
  await first.close();
  await scenario.collectFollowUps(first);
  expect(scenario.adapter.rebuildRequests()).toHaveLength(1);
  const restarted = await startServer();
  await check(restarted);
  await restarted.close();
  await scenario.collectFollowUps(restarted);
  expect(scenario.adapter.rebuildRequests()).toHaveLength(1);
  expect(scenario.repeatCalls).toEqual([]);
}
