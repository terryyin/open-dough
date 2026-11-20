// A Default main launch that declared its worktree, whose installed publisher
// received a landing context, and the typed landing handler it reports to.
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
import {
  acceptBranchLandingAnswer,
  branchLandingContext,
} from "../../server/branchLandingContext.ts";
import type { LandingSubmission } from "../../server/launchLandingAdmission.ts";
import {
  handleLanding,
  type LandingStores,
} from "../../server/launchLandingReporting.ts";
import { changeSessionRecord } from "../../server/launchRecordStore.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";
import { composedLandingStores } from "./composedLandingStores.ts";
import { aDeclaredBranch, type DeclaringLaunch } from "./declaredBranchCase.ts";
import {
  aCheckoutWithCanonicalWorktree,
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

// The checkout with an origin and its worktree on `branch`, declared by a
// kept Default main launch (blank unless `launch` says it reports) whose
// installed publisher holds a context. Landing stores are composed; record
// deletion stays on the machine record store.
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
  const directory = mkdtempSync(path.join(tmpdir(), "dough-branch-landing-"));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  const answered = await branchLandingContext(directory, record, {
    origin: dashboardOrigin,
    source,
  });
  if (answered === undefined) throw new Error("Missing the landing context.");
  // Machine store keeps the answered record for deleteRecord pin cleanup.
  await changeSessionRecord(source, record.session, (current) =>
    acceptBranchLandingAnswer(current, answered.record),
  );
  const others = launch.others?.(checkout) ?? [];
  const stores = composedLandingStores({
    records: { [source]: [answered.record, ...others] },
  });
  return {
    checkout,
    workspace,
    record: answered.record,
    entry,
    context: answered.file,
    stores,
  };
}

// The launch reference the landing context at `file` reports for.
export const contextReference = (file: string) =>
  (JSON.parse(readFileSync(file, "utf8")) as { reference: string }).reference;

export const recordLanding = (
  submission: LandingSubmission,
  stores: LandingStores,
) => handleLanding(submission, dashboardOrigin, "record", stores);
