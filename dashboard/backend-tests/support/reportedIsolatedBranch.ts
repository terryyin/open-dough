// An isolated launch that established its worktree with landing reporting:
// the composed attempt and record the publisher bridge hands the landing
// adapter, and the landing context its installed publisher reads.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { onTestFinished } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { writeLandingContext } from "../../server/launchReportingFiles.ts";
import { composedLandingStores } from "./composedLandingStores.ts";
import {
  aCheckoutWithCanonicalWorktree,
  anIsolatedLaunch,
  canonicalGitDirectory,
  minutesAgo,
  source,
} from "./doneCaptureCase.ts";
import { dashboardOrigin } from "./publisherDashboardOrigin.ts";

const reference = "11111111-0000-4000-8000-000000000613";

export async function aReportedIsolatedBranch(
  branch: string,
  files: Readonly<Record<string, string>> = {},
) {
  const { checkout, workspace } = await aCheckoutWithCanonicalWorktree(
    branch,
    files,
  );
  const authority = makeMe.aLandingAuthority
    .ofRepository(canonicalGitDirectory(checkout))
    .inWorktree({ workspace, branch })
    .please();
  const sessionId = `isolated-${branch}`;
  const directory = mkdtempSync(path.join(tmpdir(), "dough-reporting-"));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  const landingContext = await writeLandingContext(
    directory,
    { origin: dashboardOrigin, source, host: "claude", reference },
    authority,
  );
  const reporting = {
    origin: dashboardOrigin,
    reference,
    command: "report",
    landingContext,
  };
  const record = anIsolatedLaunch(checkout, { workspace, branch, sessionId })
    .reportingThrough(reporting)
    .please();
  const attempt = makeMe.anAcceptedAttempt
    .withId(reference)
    .adHoc()
    .acceptedAt(minutesAgo(60))
    .reportingTo(dashboardOrigin)
    .launched({ host: "claude", sessionId })
    .capturingLanding({ reporting, landingRepository: authority })
    .please();
  const stores = composedLandingStores({
    attempts: { [source]: [attempt] },
    records: { [source]: [record] },
  });
  return { checkout, workspace, record, reference, landingContext, stores };
}
