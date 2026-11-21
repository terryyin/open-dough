// A Default main launch that declared its worktree, whose installed publisher
// received a landing context, and the typed landing handler it reports to.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  appendFileSync,
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { onTestFinished } from "vitest";
import { proposeBranchEntry } from "../../server/branchEntryProposal.ts";
import { branchLandingContext } from "../../server/branchLandingContext.ts";
import type { LandingSubmission } from "../../server/launchLandingAdmission.ts";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import {
  aCheckoutWithCanonicalWorktree,
  keep,
  type Checkout,
  source,
} from "./doneCaptureCase.ts";
import { dashboardOrigin } from "./publisherDashboardOrigin.ts";

export { dashboardOrigin };

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

// The checkout with an origin and its worktree on `branch`, whose installed
// publisher holds the context of a kept Default main launch (blank unless it
// reports through `reporting`) that entered that worktree, kept alone in the
// machine store at `home`.
export async function aDeclaredPublisherBranch(
  branch: string,
  reporting?: NonNullable<LaunchRecord["request"]["reporting"]>,
) {
  const { checkout, workspace } = await aCheckoutWithCanonicalWorktree(branch);
  installPublisher(checkout, workspace);
  const blank = makeMe.aLaunchRecord.startedOnMainOf(checkout);
  const launch =
    reporting === undefined ? blank : blank.reportingThrough(reporting);
  const { entry } = await proposeBranchEntry(
    "refs/heads/main",
    launch.please(),
    {
      workspace,
      branch,
    },
  );
  const record = launch.enteredBranch(entry).please();
  const directory = mkdtempSync(path.join(tmpdir(), "dough-branch-landing-"));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  const answered = await branchLandingContext(directory, record, {
    origin: dashboardOrigin,
    source,
  });
  if (answered === undefined) throw new Error("Missing the landing context.");
  return {
    checkout,
    workspace,
    record: answered.record,
    entry,
    context: answered.file,
    home: keep(answered.record),
  };
}

// The launch reference the landing context at `file` reports for.
export const contextReference = (file: string) =>
  (JSON.parse(readFileSync(file, "utf8")) as { reference: string }).reference;

export const recordLanding = (submission: LandingSubmission) =>
  handleLanding(submission, dashboardOrigin, "record");
