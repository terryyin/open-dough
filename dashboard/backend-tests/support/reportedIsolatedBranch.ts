// An isolated launch that established its worktree with landing reporting:
// the kept launch, its matching accepted reporting attempt and the landing
// context its installed publisher reads, all in the private machine stores.
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { onTestFinished } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { replaceAttempts } from "../../server/launchAttemptStore.ts";
import { writeLandingContext } from "../../server/launchReportingFiles.ts";
import { dashboardOrigin } from "./declaredPublisherBranch.ts";
import {
  aCheckoutWithWorktree,
  anIsolatedLaunch,
  keep,
  minutesAgo,
  source,
} from "./doneCaptureCase.ts";

const reference = "11111111-0000-4000-8000-000000000613";

export async function aReportedIsolatedBranch(
  branch: string,
  files: Record<string, string> = {},
) {
  const { checkout, workspace: linked } = await aCheckoutWithWorktree(
    branch,
    files,
  );
  // Git registers worktrees by their canonical path.
  const workspace = realpathSync(linked);
  const authority = makeMe.aLandingAuthority
    .ofRepository(realpathSync(path.join(checkout.integration, ".git")))
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
  keep(record);
  const attempt = makeMe.anAcceptedAttempt
    .withId(reference)
    .adHoc()
    .acceptedAt(minutesAgo(60))
    .reportingTo(dashboardOrigin)
    .launched({ host: "claude", sessionId })
    .capturingLanding({ reporting, landingRepository: authority })
    .please();
  await replaceAttempts(() => ({ [source]: [attempt] }));
  return { checkout, workspace, record, reference, landingContext };
}
