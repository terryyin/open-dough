// Observe the public project series beside a scope's retained proof cohort.
import { expect } from "@playwright/test";
import { landedCiHistorySchema } from "../../src/landedCiHistory.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import { landedCiHistory } from "./landedCiHistory.ts";

export async function expectProjectHistoryCohort(
  dashboard: DashboardServer,
  measuredOrder: readonly string[],
  representedOrder: readonly string[],
): Promise<void> {
  const response = await landedCiHistory(dashboard);
  expect(response.status).toBe(200);
  const entries = landedCiHistorySchema.parse(response.body).entries;
  expect(entries.map((entry) => [entry.kind, entry.revision])).toEqual(
    measuredOrder.map((revision) => ["point", revision]),
  );
  expect(
    entries.flatMap((entry) =>
      entry.kind === "point"
        ? entry.landings.map((landing) => landing.revision)
        : [],
    ),
  ).toEqual(representedOrder);
}
