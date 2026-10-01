// A Backlog card's launch dialog chooses a one-shot session in the default
// checkout, with the real installed start, a real bare origin
// (./support/startOrigin.ts) the page reads as GitHub would
// (./committedOrigin.ts), and the synthetic `claude`. When the default
// checkout holds staged, changed, deleted, or untracked files, Start shows them
// in the same dialog (paths and count, never content) before anything starts:
// no start, no session, nothing published. Back returns to the choices and
// text as they were; Continue with existing changes starts with the landing
// still selected, whichever it is, and a change made after the warning was
// shown asks again. A clean default checkout starts without a warning.

import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  mkdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { keptStarts, recordsOf } from "./agentLaunchBoundary.ts";
import { expect, test } from "./support/preparationPage.ts";
import { openBacklog, originMain, radio } from "./support/sessionDialog.ts";

const heading = "Existing changes in default main";
// In Git status order: tracked changes, then untracked files.
const changedPaths = [
  ".gitignore",
  ".planning/slice-plans/B/PLAN.md",
  "staged.txt",
  "notes/untracked.txt",
];

// What the new files hold, which the dialog never shows.
const content = "private-file-content";

// Leaves the default checkout with a changed, a deleted, a staged, and an
// untracked file.
function dirty(project: string) {
  appendFileSync(path.join(project, ".gitignore"), "tmp/\n");
  rmSync(path.join(project, ".planning/slice-plans/B/PLAN.md"));
  writeFileSync(path.join(project, "staged.txt"), `${content}\n`);
  execFileSync("git", ["-C", project, "add", "staged.txt"]);
  mkdirSync(path.join(project, "notes"));
  writeFileSync(path.join(project, "notes/untracked.txt"), `${content}\n`);
}

const status = (project: string) =>
  execFileSync("git", ["-C", project, "status", "--porcelain"], {
    encoding: "utf8",
  });

for (const [workflow, landing, landingLine] of [
  [
    "execution",
    "Automatically land",
    "Automatically land remains selected; verified changes may land without another review.",
  ],
  ["refinement", "Wait for review", "Wait for review remains selected."],
] as const) {
  test(`${workflow}: existing changes warn before anything starts, Back keeps the choices, and Continue keeps ${landing}`, async ({
    page,
    dashboard,
    origin,
  }) => {
    const card = await openBacklog(page, origin);
    const before = await originMain(origin);
    dirty(origin.project);
    const changes = status(origin.project);

    await card.getByRole("button", { name: `Start ${workflow}` }).click();
    const dialog = page.getByRole("dialog", {
      name: `Start ${workflow} in Claude Code`,
    });
    const instruction = dialog.getByRole("textbox", {
      name: "Instruction (optional)",
    });
    await instruction.fill("Tidy the notes.");
    await expect(dialog.getByRole("group", { name: "Session" })).toBeVisible();
    // Standard tracking keeps its workflow's own workspace and publication.
    await expect(dialog.getByRole("group", { name: "Workspace" })).toHaveCount(
      0,
    );
    await radio(dialog, "Tracking", "One-shot").check();
    await expect(
      radio(dialog, "Workspace", "Isolated workspace"),
    ).toBeChecked();
    await expect(
      radio(dialog, "After checks", "Wait for review"),
    ).toBeChecked();
    await radio(dialog, "Workspace", "Default main").check();
    await radio(dialog, "After checks", landing).check();
    const start = dialog.getByRole("button", { name: "Start", exact: true });
    await expect(start).toHaveAccessibleDescription(
      `Default main · One-shot · ${landing} No assignment is published; the ${
        workflow === "execution" ? "verified result" : "recorded refinement"
      } ${
        landing === "Automatically land"
          ? "lands on origin without another review. Pressing Start authorizes that push."
          : "waits for review and nothing is pushed."
      }`,
    );
    await expect(
      dialog.getByText(
        "The session runs in this project's folder on default main, with its existing changes.",
      ),
    ).toBeAttached();
    await start.click();

    // The warning replaces the choices in the same dialog; nothing started.
    const warning = dialog.getByRole("heading", { name: heading });
    await expect(warning).toBeFocused();
    await expect(dialog).toContainText(
      "Continuing includes these changes in this session's result. When committed, all checkout changes are committed together.",
    );
    await expect(dialog).toContainText("4 changed paths");
    await expect(
      dialog
        .getByRole("list", { name: "4 changed paths" })
        .getByRole("listitem"),
    ).toHaveText(changedPaths);
    await expect(dialog).toContainText(landingLine);
    await expect(dialog).not.toContainText(content);
    await expect(dialog.getByRole("checkbox")).toHaveCount(0);
    await expect(instruction).toBeHidden();
    expect(dashboard.claudeLaunchCalls()).toEqual([]);
    expect(await keptStarts(dashboard)).toEqual([]);
    expect(await originMain(origin)).toBe(before);
    expect(status(origin.project)).toBe(changes);

    // Back returns to the choices as they were, at Start.
    await dialog.getByRole("button", { name: "Back" }).click();
    await expect(start).toBeFocused();
    await expect(instruction).toHaveValue("Tidy the notes.");
    await expect(radio(dialog, "Tracking", "One-shot")).toBeChecked();
    await expect(radio(dialog, "Workspace", "Default main")).toBeChecked();
    await expect(radio(dialog, "After checks", landing)).toBeChecked();

    // Changes made after the warning was shown are shown again.
    await start.click();
    await expect(warning).toBeFocused();
    appendFileSync(path.join(origin.project, "notes/untracked.txt"), "more\n");
    const proceed = dialog.getByRole("button", {
      name: "Continue with existing changes",
    });
    await proceed.click();
    await expect(dialog.getByRole("status")).toHaveText(
      "The changes in default main changed after they were shown; review them again.",
    );
    await expect(warning).toBeFocused();
    expect(dashboard.claudeLaunchCalls()).toEqual([]);
    await expect(dialog).toContainText(landingLine);

    // Continue starts with the landing still selected, in the checkout as it
    // is.
    dashboard.claudeScenario("launched");
    await proceed.click();
    await expect(dialog).toBeHidden();
    await expect(
      card.getByRole("article", {
        name: `${workflow === "execution" ? "Execution" : "Refinement"} session`,
      }),
    ).toBeVisible();
    const [call] = dashboard.claudeLaunchCalls();
    expect(call?.cwd).toBe(realpathSync(origin.project));
    const sent = call?.argv.at(-1) ?? "";
    const flags = `--one-shot --default-main${landing === "Automatically land" ? " --auto-land" : ""}`;
    expect(sent.split("\n\n")[0]).toBe(
      `/${workflow === "execution" ? "dough-execute-plan" : "dough-story-refinement"} SEED-A#a ${flags}`,
    );
    expect(sent).toContain("- workspace role: default-checkout");
    expect(sent).toContain(
      `- landing: ${landing === "Automatically land" ? "auto-land" : "review"}`,
    );
    expect(sent.split("\n\n").at(-1)).toBe("Tidy the notes.");
    const [record] = (await recordsOf(dashboard, "open-dough")) as {
      request: Record<string, unknown>;
    }[];
    expect(record?.request["policy"]).toEqual({
      tracking: "one-shot",
      workspace: "default-checkout",
      landing: landing === "Automatically land" ? "auto-land" : "review",
    });
    expect(record?.request).not.toHaveProperty("existingChanges");
    // The existing changes stay in the checkout for the session; nothing was
    // published.
    expect(status(origin.project)).toContain("staged.txt");
    expect(await originMain(origin)).toBe(before);
    expect(await origin.takenProfiles()).toEqual([]);
  });
}

test("a clean default checkout starts without a warning", async ({
  page,
  dashboard,
  origin,
}) => {
  const card = await openBacklog(page, origin);
  await card.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start execution in Claude Code",
  });
  await radio(dialog, "Tracking", "One-shot").check();
  await radio(dialog, "Workspace", "Default main").check();
  dashboard.claudeScenario("launched");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("heading", { name: heading })).toHaveCount(0);
  // Accepted: the launch goes on after the dialog closed.
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
  const [call] = dashboard.claudeLaunchCalls();
  expect(call?.cwd).toBe(realpathSync(origin.project));
  expect(call?.argv.at(-1)).toContain("--one-shot --default-main\n");
  expect(await origin.takenProfiles()).toEqual([]);
});
