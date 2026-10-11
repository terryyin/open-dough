// A launch attempt as the boundary answers it once its outcome is kept: the
// outcome is kept in a write of its own after the launch's answer, so a read
// right after that answer can come before it.
import { expect } from "@playwright/test";
import { attempts } from "./agentLaunchBoundary.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";

// Waits until the first attempt matches `expected` and warns of no slow start.
export async function settledAttempt(
  server: DashboardServer,
  expected: Record<string, unknown>,
): Promise<void> {
  await expect(async () => {
    const [settled] = await attempts(server);
    expect(settled).toMatchObject(expected);
    expect(settled?.slowSince).toBeUndefined();
  }).toPass({ timeout: 30_000 });
}
