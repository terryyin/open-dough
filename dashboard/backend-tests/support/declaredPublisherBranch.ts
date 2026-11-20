// A Default main launch that declared its worktree, whose installed publisher
// received a landing context, and the typed landing handler it reports to.
import { appendFileSync, copyFileSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { branchLandingContext } from "../../server/branchLandingContext.ts";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import type { LandingSubmission } from "../../server/launchLandingAdmission.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import { aDeclaredBranch, type DeclaringLaunch } from "./declaredBranchCase.ts";
import {
  aCheckoutWithCanonicalWorktree,
  type Checkout,
  source,
} from "./doneCaptureCase.ts";

// The dashboard the installed publisher reports to.
export const dashboardOrigin = "http://127.0.0.1:4173";

const publisherScripts = [
  "dashboard-completion.mjs",
  "ci-direct-entry.mjs",
  "dashboard-landing.mjs",
  "first-landing-expectation.mjs",
];

// Installs this repository's real publisher scripts into the worktree of
// `checkout`, outside the work its commits stage.
function installPublisher(checkout: Checkout, workspace: string) {
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
  appendFileSync(
    path.join(checkout.integration, ".git", "info", "exclude"),
    "/.claude/\n",
  );
}

// The checkout with an origin and its worktree on `branch`, declared by a
// kept Default main launch (blank unless `launch` says it reports) whose
// installed publisher holds a context.
export async function aDeclaredPublisherBranch(
  branch: string,
  launch: Omit<DeclaringLaunch, "workspace" | "branch"> = {},
) {
  const { checkout, workspace } = await aCheckoutWithCanonicalWorktree(branch);
  installPublisher(checkout, workspace);
  const { record, entry } = await aDeclaredBranch(checkout, {
    ...launch,
    workspace,
    branch,
  });
  const context = await branchLandingContext(source, record, dashboardOrigin);
  if (context === undefined) throw new Error("Missing the landing context.");
  return { checkout, workspace, record, entry, context };
}

// The launch reference the landing context at `file` reports for.
export const contextReference = (file: string) =>
  (JSON.parse(readFileSync(file, "utf8")) as { reference: string }).reference;

export const prepareLanding = (submission: LandingSubmission) =>
  handleLanding(submission, dashboardOrigin, "prepare");

export const recordLanding = (submission: LandingSubmission) =>
  handleLanding(submission, dashboardOrigin, "record");
