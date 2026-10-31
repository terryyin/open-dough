// Start refinement Attach images (shared LaunchDialog control): pick two
// PNGs with no text → Start → fake Claude's prompt is the skill line, the
// established preparation handoff, reporting context, then the Attached
// images list under the test HOME's launch-attachments folder. Start
// execution offers the same Attach images control.

import path from "node:path";
import { publishCommittedOrigin } from "./committedOrigin.ts";
import { parts } from "./dashboardPage.ts";
import { instructionField } from "./launchStoryCardPage.ts";
import { expect, test } from "./support/preparationPage.ts";
import { expectReportingBlock } from "./support/reportingInputAssertions.ts";
import { launchWaitMs } from "./support/launchWait.ts";
import { queuedIdentity } from "./support/startOrigin.ts";
import { recordsOf } from "./agentLaunchBoundary.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  expectCopiedAttachmentPath,
  pickImagesInDialog,
  pngA,
  pngB,
  writePickedImages,
} from "./support/launchAttachmentFixtures.ts";

test.setTimeout(120_000);

test("Start execution and Start refinement dialogs offer the same Attach images control", async ({
  page,
  origin,
}) => {
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

  await card.getByRole("button", { name: "Start execution" }).click();
  const execution = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await expect(
    execution.getByRole("button", { name: "Attach images" }),
  ).toBeVisible();
  await execution.getByRole("button", { name: "Cancel" }).click();

  await card.getByRole("button", { name: "Start refinement" }).click();
  const refinement = page.getByRole("dialog", {
    name: "Start refinement in Claude Code",
  });
  await expect(
    refinement.getByRole("button", { name: "Attach images" }),
  ).toBeVisible();
});

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
