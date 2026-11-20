// A Default main launch that declared its worktree, whose installed publisher
// received a landing context, and the typed landing handler it reports to.
import { appendFileSync, copyFileSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { proposeBranchEntry } from "../../server/branchEntryProposal.ts";
import { branchLandingContext } from "../../server/branchLandingContext.ts";
import { handleLanding } from "../../server/launchLandingReporting.ts";
import type { LandingSubmission } from "../../server/launchLandingAdmission.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import {
  aCheckoutWithCanonicalWorktree,
  aDefaultLaunch,
  type Checkout,
  keep,
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

type PublisherLaunch = {
  reporting?: NonNullable<LaunchRecord["request"]["reporting"]>;
  others?: (checkout: Checkout) => LaunchRecord[];
};

// The checkout with an origin and its worktree on `branch`, whose installed
// publisher holds the context of a kept Default main launch (blank unless it
// reports through `reporting`) that entered that worktree. The `others` of the
// checkout are kept beside it.
export async function aDeclaredPublisherBranch(
  branch: string,
  { reporting, others = () => [] }: PublisherLaunch = {},
) {
  const { checkout, workspace } = await aCheckoutWithCanonicalWorktree(branch);
  installPublisher(checkout, workspace);
  const blank = aDefaultLaunch(checkout);
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
  keep(record, ...others(checkout));
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
