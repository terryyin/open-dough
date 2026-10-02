// Shared by the startup recovery specs (./responsive-session-recovery*.spec.ts):
// what a story's frame and Startup recovery show of Story A's execution start
// in need of reconciliation, starting that execution, the workspaces made for
// it, a server restarted on the same machine and port, after the one that
// accepted it closed with its start let through or as it is, and another writer's
// removal of Story A from origin's backlog.

import { execFile } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import type { Locator, Page } from "@playwright/test";
import { expect } from "./dashboardTest.ts";
import { expectProtected } from "./responsiveStart.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import type { FakeGitHub } from "./support/fakeGitHub.ts";
import {
  queuedIdentity,
  type PushHold,
  type StartOrigin,
} from "./support/startOrigin.ts";

const exec = promisify(execFile);

export const needsReconciliation = "Startup needs reconciliation";
export const subject = `Story A (${queuedIdentity})`;
export const continueLabel = `Continue execution start of ${subject}`;

export const recoveryOf = (page: Page) =>
  page.getByRole("region", { name: "Startup recovery" });

// The story's frame is protected and said statically, with nothing moving
// and no answer beside its unavailable actions, which, like the card, are
// described by that status.
export async function expectStaticallyProtected(card: Locator) {
  await expect(card).toContainText(needsReconciliation);
  await expect(card.locator(".card-startup-progressing")).toHaveCount(0);
  const status = card.locator(".card-startup-static").first();
  expect(
    await status.evaluate((element) => [
      getComputedStyle(element).animationName,
      getComputedStyle(element, "::before").content,
    ]),
  ).toEqual(["none", "none"]);
  await expect(card).toHaveAccessibleDescription(
    new RegExp(needsReconciliation),
  );
  await expect(
    card.getByRole("button", { name: "Inspect story" }),
  ).toHaveAccessibleDescription(new RegExp(needsReconciliation));
  await expect(card.locator(".launch-problem")).toHaveCount(0);
  await expectProtected(card);
}

// Startup recovery offers Recheck and Continue for Story A's execution start.
export async function expectRecoveryOffered(page: Page) {
  const recovery = recoveryOf(page);
  await expect(recovery).toContainText(
    `${subject} · execution start in Claude Code`,
  );
  await expect(recovery).toContainText(needsReconciliation);
  await expect(
    recovery.getByRole("button", { name: `Recheck ${subject}` }),
  ).toBeEnabled();
  await expect(
    recovery.getByRole("button", { name: continueLabel }),
  ).toBeEnabled();
}

export const worktrees = (origin: StartOrigin) =>
  readdirSync(path.join(origin.project, ".worktrees"));

// Starts Story A's execution from its card.
export async function startExecution(page: Page, story: Locator) {
  await story.getByRole("button", { name: "Start execution" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Start", exact: true }).click();
  await expect(dialog).toBeHidden();
}

// Closes the server that accepted the start, letting its held push through
// so its start ends with it, and restarts one on the same machine and port.
export async function restartAfterPush(
  dashboard: DashboardServer,
  push: PushHold,
  origin: StartOrigin,
  github: FakeGitHub,
): Promise<DashboardServer> {
  const closing = dashboard.close();
  push.release();
  await closing;
  return restartedOn(dashboard, origin, github);
}

// Closes the server and restarts one on the same machine and port.
export async function restart(
  dashboard: DashboardServer,
  origin: StartOrigin,
  github: FakeGitHub,
): Promise<DashboardServer> {
  await dashboard.close();
  return restartedOn(dashboard, origin, github);
}

// A server started on the closed `dashboard`'s machine and port.
function restartedOn(
  dashboard: DashboardServer,
  origin: StartOrigin,
  github: FakeGitHub,
): Promise<DashboardServer> {
  return startDashboardServer({
    mode: "preview",
    prebuilt: builtDashboardDir,
    github,
    machine: origin.machine,
    projectFolders: ["open-dough"],
    launchTimeoutMs: 60_000,
    port: Number(new URL(dashboard.baseURL).port),
  });
}

// Another writer removes Story A from origin's backlog.
export async function removeQueuedStory(origin: StartOrigin): Promise<void> {
  const clone = path.join(origin.machine, "another-writer");
  const git = (...args: string[]) => exec("git", ["-C", clone, ...args]);
  await exec("git", ["clone", "--quiet", origin.origin, clone]);
  const backlog = path.join(clone, ".planning/PRODUCT-BACKLOG.md");
  writeFileSync(
    backlog,
    readFileSync(backlog, "utf8")
      .split("\n")
      .filter((line) => !line.includes(queuedIdentity))
      .join("\n"),
  );
  await git(
    "-c",
    "user.name=Writer",
    "-c",
    "user.email=w@example.test",
    "commit",
    "--quiet",
    "-am",
    "remove Story A",
  );
  await git("push", "--quiet", "origin", "main");
}
