// Only published files and delayed external reads: the preview page owns the
// route, membership resolution, focus, and reveal.
import type { Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { publishMovingOrigin } from "./publishedOrigin.ts";
import type { DashboardServer } from "./support/dashboardServer.ts";

export const notifiedIdentity = "SEED-777#shared-story";
export const notifiedTitle = "Doughnut's renamed notified story";
export const otherTitle = "Open Dough's different story with the same identity";
export const targetRevision = "ba".repeat(20);

export const storyUrl = (project = "doughnut", story = notifiedIdentity) =>
  `/?${new URLSearchParams({ project, story })}`;

const preceding = [...Array(12).keys()]
  .map(
    (index) =>
      `- [Earlier story ${String(index + 1)}](seeds/SEED-${String(800 + index)}.md#story) — SEED-${String(800 + index)}#story`,
  )
  .join("\n");

export const targetBacklog = (
  column: "Backlog list" | "Taken" = "Backlog list",
) =>
  `# Product backlog\n\n## Taken\n\n${column === "Taken" ? `- [${notifiedTitle}](seeds/SEED-777.md#shared-story) — ${notifiedIdentity}\n` : ""}\n## Backlog list\n\n${preceding}\n${column === "Backlog list" ? `- [${notifiedTitle}](seeds/SEED-777.md#shared-story) — ${notifiedIdentity}\n` : ""}`;

export async function notificationOrigins(page: Page, column?: "Taken") {
  const other = await publishMovingOrigin(page);
  other.push(
    "cd".repeat(20),
    `# Product backlog\n\n## Taken\n\n## Backlog list\n\n- [${otherTitle}](seeds/SEED-777.md#shared-story) — ${notifiedIdentity}\n`,
  );
  const target = await publishMovingOrigin(page, "nerds-odd-e/doughnut");
  target.push(targetRevision, targetBacklog(column));
  return { other, target };
}

export function expectNoHostActions(dashboard: DashboardServer) {
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(dashboard.claudeAttaches()).toEqual([]);
  expect(
    dashboard.claudeCalls().filter(({ argv }) => argv.includes("resume")),
  ).toEqual([]);
  expect(
    dashboard.codex.calls.filter(({ method }) =>
      ["thread/start", "thread/resume", "turn/start"].includes(method),
    ),
  ).toEqual([]);
}
