// After the installed publisher delivers a Done isolated session and its
// branch is retired, both its delivered rename and its working-tree
// comparison still hold their own file contents.
import { mkdtempSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { keepAttempt, keptAttempts } from "../../server/launchAttemptStore.ts";
import {
  keptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { writeLandingContext } from "../../server/launchReportingFiles.ts";
import { retireAdHocBranch } from "../../test-support/support/adHocBranchRefs.ts";
import { keep, source } from "../support/doneCaptureCase.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";
import { publishInstalled } from "../support/installedPublisher.ts";
import { dashboardOrigin } from "../support/publisherDashboardOrigin.ts";

const reference = "11111111-0000-4000-8000-000000000613";
const baseline = [...Array(12).keys()]
  .map((line) => `unchanged ${line}\n`)
  .join("");
const renamed = { path: "review.txt", oldPath: "draft.txt" };
const committed = `${baseline}Delivered draft\n`;
const working = `${baseline}Left for review\n`;

test("the same Done session keeps its delivery and its different branch result after retirement", async () => {
  const branch = "rename-the-draft";
  const sessionId = "isolated-rename-the-draft";
  const directory = mkdtempSync(path.join(tmpdir(), "dough-reporting-"));
  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });
  const { checkout, worktrees, at } = await aDoneCaptureCase()
    .withOrigin()
    .withBaseFiles({ [renamed.oldPath]: baseline })
    .withWorkspace(branch)
    .please();
  const workspace = worktrees[branch];
  const authority = makeMe.aLandingAuthority
    .ofRepository(checkout.gitDirectory)
    .inWorktree({ workspace, branch })
    .please();
  // The installed publisher reads the context the accepted launch reports to.
  const landingContext = await writeLandingContext(
    directory,
    { origin: dashboardOrigin, source, host: "claude", reference },
    authority,
  );
  const record = makeMe.aLaunchRecord
    .isolatedIn(checkout, { workspace, branch })
    .inClaudeSession({ sessionId })
    .launchedAt(at(60))
    .reportingThrough({
      origin: dashboardOrigin,
      reference,
      command: "report",
      landingContext,
    })
    .please();
  keep(record);
  await keepAttempt(
    makeMe.anAcceptedAttempt.reportingFor(record).landingIn(authority).please(),
  );
  const write = (text: string) => {
    writeFileSync(path.join(workspace, renamed.path), text);
  };
  unlinkSync(path.join(workspace, renamed.oldPath));
  write(committed);
  await git(workspace, "add", "-A", "--", renamed.oldPath, renamed.path);
  await git(workspace, "commit", "--quiet", "-m", "Rename the draft");
  write(working);
  await setRecordDoneAt(source, record.session, at(10));

  write(committed);
  const { landing, beforePush: before } = await publishInstalled(
    {
      workspace,
      branch,
      previouslyPublishedBase: checkout.base,
      remote: "origin",
      targetRef: "refs/heads/main",
      landingContext,
    },
    async () =>
      (await keptAttempts())?.find((attempt) => attempt.id === reference)
        ?.landingPreparations,
  );
  // The installed publisher prepared exactly the pair it then recorded.
  expect(before.trunk).toBe(checkout.base);
  expect(before.prepared).toMatchObject([
    { base: landing.receipt.base, revision: landing.receipt.revision },
  ]);
  retireAdHocBranch(checkout.integration, workspace, branch);

  const saved = await keptSession(source, record.session);
  expect(saved?.landing).toMatchObject({
    reference,
    base: landing.receipt.base,
    revision: landing.receipt.revision,
  });
  if (saved?.branchResult === undefined)
    throw new Error("Missing the retained comparisons.");
  expect(saved.branchResult.revision).not.toBe(landing.receipt.revision);
  if (!("origin" in checkout)) throw new Error("Missing the fixture origin.");
  const delivered = await git(
    checkout.origin,
    "show",
    `${landing.receipt.revision}:${renamed.path}`,
  );
  const snapshot = await git(
    checkout.integration,
    "show",
    `${saved.branchResult.revision}:${renamed.path}`,
  );
  expect(delivered.stdout).toBe(committed);
  expect(snapshot.stdout).toBe(working);
});
