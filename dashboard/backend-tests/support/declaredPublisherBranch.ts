// A Default main launch that declared its worktree, whose installed publisher
// received a landing context, and the typed landing handler it reports to.
import { copyFileSync, mkdirSync, realpathSync } from "node:fs";
import path from "node:path";
import { branchLandingContext } from "../../server/branchLandingContext.ts";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import type { LandingSubmission } from "../../server/launchLandingAdmission.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import { aLaunchDeclaring } from "./declaredBranch.ts";
import { aCheckoutWithWorktree, source } from "./doneCaptureCase.ts";

// The dashboard the installed publisher reports to.
export const dashboardOrigin = "http://127.0.0.1:4173";

const publisherScripts = [
  "dashboard-completion.mjs",
  "ci-direct-entry.mjs",
  "dashboard-landing.mjs",
  "first-landing-expectation.mjs",
];

// Installs this repository's real publisher scripts into the worktree.
function installPublisher(workspace: string) {
  const relative = path.join(
    ".claude",
    "skills",
    "dough-execute-plan",
    "scripts",
  );
  mkdirSync(path.join(workspace, relative), { recursive: true });
  for (const script of publisherScripts)
    copyFileSync(
      path.join(repoRoot, relative, script),
      path.join(workspace, relative, script),
    );
}

// The checkout with an origin and its worktree on `branch`, declared by a
// kept blank Default main launch whose installed publisher holds a context.
export async function aDeclaredPublisherBranch(branch: string) {
  const { checkout, workspace: linked } = await aCheckoutWithWorktree(branch);
  // Git registers worktrees by their canonical path.
  const workspace = realpathSync(linked);
  installPublisher(workspace);
  const { record, entry } = await aLaunchDeclaring(checkout, {
    workspace,
    branch,
  });
  const context = await branchLandingContext(source, record, dashboardOrigin);
  if (context === undefined) throw new Error("Missing the landing context.");
  return { checkout, workspace, record, entry, context };
}

export const prepareLanding = (submission: LandingSubmission) =>
  handleLanding(submission, dashboardOrigin, "prepare");

export const recordLanding = (submission: LandingSubmission) =>
  handleLanding(submission, dashboardOrigin, "record");
