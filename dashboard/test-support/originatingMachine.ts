// The machine published sessions came from, as the published-session journey
// (../../e2e/sessions/recently-done-published-sessions.spec.ts) prepares it:
// its own clone of the bare origin, where each session's branch adds a file
// and trunk later moves on without it.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import {
  landingReceiver,
  noteSharedCheckout,
} from "../../Distribution/tests/skills/dough-execute-plan/dashboard-landing-test-fixtures.mjs";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import type { StartOrigin } from "./support/startOrigin.ts";
import { dashboardDeveloper } from "./support/startOriginPreparation.ts";
import { git } from "./support/storyReviewWorktree.ts";

const workspaceOf = (origin: StartOrigin) =>
  path.join(origin.machine, "originating-machine");

// The originating clone, with the execution checkout's identity, fetched up to
// the origin.
function originatingClone(origin: StartOrigin) {
  const workspace = workspaceOf(origin);
  if (existsSync(workspace)) git(workspace, "fetch", "--quiet", "origin");
  else
    git(
      origin.machine,
      "clone",
      "--quiet",
      "-c",
      `user.name=${dashboardDeveloper.name}`,
      "-c",
      `user.email=${dashboardDeveloper.email}`,
      origin.origin,
      workspace,
    );
  return workspace;
}

// The originating clone on `branch` off the origin's current trunk with `file`
// added; answers the clone and the trunk commit the branch left.
export function addedOnBranch(
  origin: StartOrigin,
  branch: string,
  file: string,
) {
  const workspace = originatingClone(origin);
  const trunk = git(workspace, "rev-parse", "origin/main");
  git(workspace, "switch", "--quiet", "-c", branch, trunk);
  makeMe
    .theWorkspace(workspace)
    .writeAt(file, "published by another machine\n")
    .commitAll("Edit on the originating machine")
    .please();
  return { workspace, trunk };
}

// Trunk moves on from the originating clone with `file` written; answers the
// origin's new trunk commit.
export function trunkAdvancedWith(
  origin: StartOrigin,
  file: string,
  text = "trunk moved on\n",
) {
  return advanceOriginTrunk(origin, (workspace) => {
    makeMe.theWorkspace(workspace).writeAt(file, text).please();
  });
}

export function advanceOriginTrunk(
  origin: StartOrigin,
  write: (workspace: string) => void,
) {
  const workspace = originatingClone(origin);
  git(workspace, "switch", "--quiet", "--detach", "origin/main");
  write(workspace);
  makeMe
    .theWorkspace(workspace)
    .commitAll("Advance trunk after the session")
    .please();
  git(workspace, "push", "--quiet", "origin", "HEAD:refs/heads/main");
  return git(origin.origin, "rev-parse", "main");
}

// The pair trunk publishes as it moves on with `file` added.
export function publishedPairAdding(origin: StartOrigin, file: string) {
  const base = git(originatingClone(origin), "rev-parse", "origin/main");
  return { base, candidate: trunkAdvancedWith(origin, file) };
}

// The originating machine's Dashboard launch of `sessionId`, receiving its
// landing reports on loopback until `page`'s context closes, with that
// Dashboard's shared-checkout note beside its landing context: another
// session was open in its checkout since `since`. Answers the landing
// context's path.
export async function launchSharingCheckout(
  origin: StartOrigin,
  page: Page,
  sessionId: string,
  identity: string,
  since: Date,
) {
  const receiver = await landingReceiver({
    after: (close: () => void) => page.context().on("close", close),
  });
  const reporting = path.join(origin.machine, "reporting", sessionId);
  mkdirSync(reporting, { recursive: true });
  const landingContext = path.join(reporting, "landing-context.json");
  writeFileSync(
    landingContext,
    JSON.stringify(
      makeMe.aLandingContext
        .reportingTo(receiver.origin)
        .referencing(sessionId)
        .namingStory(identity)
        .please(),
    ),
  );
  await noteSharedCheckout(landingContext, since);
  return landingContext;
}
