// Progress is observed through real HTTP and pages while the installed script's
// bare-origin push and the vendor's native creation are held independently.
import type { Page } from "@playwright/test";
import { expect, test } from "../dashboardTest.ts";
import { keptStarts, runningStarts } from "../agentLaunchBoundary.ts";
import { publishCommittedOrigin } from "../committedOrigin.ts";
import { expectStartNote } from "../cardControls.ts";
import { parts } from "../dashboardPage.ts";
import { queuedIdentity, type StartOrigin } from "./startOrigin.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeCodex } from "./fakeCodex.ts";

export async function expectStartProgress(
  {
    page,
    dashboard,
    origin,
    codexProtocol,
  }: {
    page: Page;
    dashboard: DashboardServer;
    origin: StartOrigin;
    codexProtocol: FakeCodex | undefined;
  },
  workflow: "execution" | "refinement",
  host: "claude" | "codex",
): Promise<void> {
  test.setTimeout(120_000);
  const push = origin.holdPushes();
  const native = codexProtocol;
  dashboard.claudeScenario("held");
  if (native !== undefined) native.holdCreation = true;
  const published = await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
  });
  const backlogCard = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  await page.goto("/");
  if (workflow === "execution") {
    await expect(
      backlogCard.getByText("Ready for execution", { exact: true }),
    ).toBeVisible();
    await expect(
      backlogCard.getByText("Changed since readiness review", { exact: true }),
    ).toBeVisible();
    await expect(backlogCard).not.toContainText(
      "Not marked Ready for execution",
    );
    await expect(
      backlogCard.getByRole("button", { name: "Start execution" }),
    ).not.toHaveClass(/start-launch-noted/);
    await backlogCard.getByRole("button", { name: "Inspect story" }).click();
    await expect(
      backlogCard.getByRole("region", { name: "Detail for Story A" }),
    ).toContainText("Changed since readiness review");
    await backlogCard.getByRole("button", { name: "Hide detail" }).click();
  }
  await backlogCard.getByRole("button", { name: `Start ${workflow}` }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Host", { exact: true }).selectOption(host);
  await expect(dialog).toContainText("Start also publishes");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  const observer = await page.context().newPage();
  await observer.goto(dashboard.baseURL);
  const observeCard = observer.getByRole("article", {
    name: "Story A",
    exact: true,
  });
  const running = (phase: "preparing" | "launching") => [
    { workflow, source: "open-dough", identity: queuedIdentity, phase, host },
  ];
  await expect
    .poll(() => runningStarts(dashboard), { timeout: 20_000 })
    .toEqual(running("preparing"));
  expect(await keptStarts(dashboard)).toEqual([]);
  for (const card of [backlogCard, observeCard]) {
    await expect(card).toContainText(`Preparing ${workflow}…`);
    await expect(
      card.getByRole("button", { name: `Start ${workflow}` }),
    ).toBeDisabled();
  }
  await expect(
    parts(observer).taken.getByRole("article", {
      name: "Story A",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect.poll(() => push.isHeld(), { timeout: 20_000 }).toBe(true);
  push.release();
  await expect
    .poll(() => runningStarts(dashboard), { timeout: 30_000 })
    .toEqual(running("launching"));
  const words = `Starting ${workflow} in ${host === "codex" ? "Codex" : "Claude Code"}…`;
  await expect(backlogCard).toContainText(words);
  await expect(observeCard).toContainText(words);
  await observer.reload();
  await expect(observeCard).toContainText(words);
  await expect(observeCard).not.toContainText(`Preparing ${workflow}…`);
  // The actual assignment is now published; phase survives new placement.
  published.advanceTo((await origin.originGit("rev-parse", "main")).trim());
  await page.reload();
  await observer.reload();
  for (const viewed of [page, observer]) {
    if (workflow === "execution") {
      await expect(
        parts(viewed).taken.getByRole("article", {
          name: "Story A",
          exact: true,
        }),
      ).toContainText(words);
      await expect(
        parts(viewed).backlog.getByRole("article", {
          name: "Story A",
          exact: true,
        }),
      ).toHaveCount(0);
    } else {
      await expect(
        viewed.getByRole("article", { name: "Story A", exact: true }),
      ).toContainText(words);
      await expectStartNote(
        viewed.getByRole("article", { name: "Story A", exact: true }),
        "Start refinement",
        "Being prepared",
      );
      await expect(
        parts(viewed).taken.getByRole("article", {
          name: "Story A",
          exact: true,
        }),
      ).toHaveCount(0);
    }
  }
  if (native === undefined) dashboard.releaseHeldClaude();
  else {
    native.holdCreation = false;
    native.release();
  }
  await expect.poll(() => runningStarts(dashboard)).toEqual([]);
  await expect(
    observer
      .getByRole("article", { name: "Story A", exact: true })
      .getByRole("list", { name: "Sessions" }),
  ).toContainText(
    `${workflow === "execution" ? "Execution" : "Refinement"} started in`,
  );
  await expect(observeCard).not.toContainText(`Starting ${workflow}`);
  await observer.close();
}
