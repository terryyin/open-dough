// Start refinement Attach images: pick two PNGs with no text → Start → fake
// Claude's prompt is the skill line, the established preparation handoff,
// reporting context, then the Attached images list under the test HOME's
// launch-attachments folder. That both story dialogs offer Attach images is
// ../../dashboard/frontend-tests/launches/agent-launch-story-card-dialogs.spec.ts.

import path from "node:path";
import { publishCommittedOrigin } from "../../dashboard/test-support/committedOrigin.ts";
import { parts } from "../../dashboard/test-support/dashboardPage.ts";
import { instructionField } from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  expect,
  test,
} from "../../dashboard/test-support/support/preparationPage.ts";
import { expectReportingBlock } from "../../dashboard/test-support/support/reportingInputAssertions.ts";
import { launchWaitMs } from "../../dashboard/test-support/support/launchWait.ts";
import { queuedIdentity } from "../../dashboard/test-support/support/startOrigin.ts";
import { recordsOf } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import type { LaunchRecord } from "../../dashboard/src/launchRecord.ts";
import {
  expectCopiedAttachmentPath,
  pickImagesInDialog,
  pngA,
  pngB,
  writePickedImages,
} from "../../dashboard/test-support/support/launchAttachmentFixtures.ts";

test("Start refinement with two picked images and no text ends the first input with their copied paths after the handoff", async ({
  page,
  dashboard,
  origin,
}, testInfo) => {
  dashboard.claudeScenario("launched");
  await publishCommittedOrigin(page, {
    repoDir: origin.origin,
    revision: (await origin.originGit("rev-parse", "main")).trim(),
    repository: "terryyin/open-dough",
    follows: true,
  });
  await page.goto("/");
  const card = parts(page).backlog.getByRole("article", {
    name: "Story A",
    exact: true,
  });

  const picked = writePickedImages(testInfo, [
    { name: "mockup-a.png", bytes: pngA },
    { name: "mockup-b.png", bytes: pngB },
  ]);

  await card.getByRole("button", { name: "Start refinement" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start refinement in Claude Code",
  });
  await expect(instructionField(dialog)).toHaveValue("");

  await pickImagesInDialog(page, dialog, picked);
  const list = dialog.getByRole("list", { name: "Attached images" });
  await expect(list.getByText("Image 1 · mockup-a.png")).toBeVisible();
  await expect(list.getByText("Image 2 · mockup-b.png")).toBeVisible();

  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(card.getByRole("list", { name: "Sessions" })).toContainText(
    "Refinement started in Claude Code",
    { timeout: launchWaitMs },
  );

  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  const [call] = dashboard.claudeLaunchCalls();
  const prompt = call?.argv.at(-1) ?? "";
  const [skill, block, reporting, developer, ...extra] = prompt.split("\n\n");
  expect(extra).toEqual([]);
  expect(skill).toBe(`/dough-story-refinement ${queuedIdentity}`);
  expect(block?.startsWith("Established preparation:")).toBe(true);
  const workspace = path.join(origin.project, ".worktrees", "story-a");
  expect(block).toContain(`- workspace: ${workspace}`);
  const [record] = (await recordsOf(dashboard, "open-dough")) as LaunchRecord[];
  expectReportingBlock(reporting, record?.request, dashboard);

  const lines = developer?.split("\n") ?? [];
  expect(lines[0]).toBe("Attached images:");
  expect(lines).toHaveLength(3);
  const path1 = lines[1]?.replace(/^1\. /, "") ?? "";
  const path2 = lines[2]?.replace(/^2\. /, "") ?? "";
  expectCopiedAttachmentPath(path1, dashboard.home, "1-mockup-a.png");
  expectCopiedAttachmentPath(path2, dashboard.home, "2-mockup-b.png");
  expect(record?.request.attachments).toEqual([path1, path2]);
});
