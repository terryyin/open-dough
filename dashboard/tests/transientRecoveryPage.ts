// Shared page observations for empty-page transient recovery journeys.

import { expect } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { pathsRead, type ObservedRequest } from "./publishedOrigin.ts";

export const transientRecovery = "This page reads the published work at";

export function mainReads(origin: {
  readonly requests: readonly ObservedRequest[];
}): number {
  return pathsRead(origin).filter((path) => path === "main").length;
}

export async function expectRecoversAfter(
  page: Parameters<typeof parts>[0],
  failedMs: number,
  waitSeconds: number,
): Promise<void> {
  const notice = parts(page).problem.locator("p", {
    hasText: transientRecovery,
  });
  await expect(notice).toHaveCount(1);
  expect(
    Date.parse((await notice.locator("time").getAttribute("datetime")) ?? ""),
  ).toBe(failedMs + waitSeconds * 1_000);
}
