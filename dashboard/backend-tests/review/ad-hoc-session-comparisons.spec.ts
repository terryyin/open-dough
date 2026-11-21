// After the installed publisher delivers a Done isolated session and its
// branch is retired, both its delivered rename and its working-tree
// comparison still hold their own file contents.
import { unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { keptAttempts } from "../../server/launchAttemptStore.ts";
import { machineLandingStores } from "../../server/launchLandingReporting.ts";
import {
  keptSession,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { retireAdHocBranch } from "../../test-support/support/adHocBranchRefs.ts";
import { minutesAgo, source } from "../support/doneCaptureCase.ts";
import { fileText } from "../support/doneCaptureReview.ts";
import { publishInstalled } from "../support/installedPublisher.ts";
import { aReportedIsolatedBranch } from "../support/reportedIsolatedBranch.ts";

const baseline = [...Array(12).keys()]
  .map((line) => `unchanged ${line}\n`)
  .join("");
const renamed = { path: "review.txt", oldPath: "draft.txt" };
const committed = `${baseline}Delivered draft\n`;
const working = `${baseline}Left for review\n`;

test("the same Done session opens its delivery and keeps its different branch result after retirement", async () => {
  const branch = "rename-the-draft";
  const { checkout, workspace, record, reference, landingContext } =
    await aReportedIsolatedBranch(branch, { [renamed.oldPath]: baseline });
  const write = (text: string) => {
    writeFileSync(path.join(workspace, renamed.path), text);
  };
  unlinkSync(path.join(workspace, renamed.oldPath));
  write(committed);
  await git(workspace, "add", "-A", "--", renamed.oldPath, renamed.path);
  await git(workspace, "commit", "--quiet", "-m", "Rename the draft");
  write(working);
  await setRecordDoneAt(source, record.session, minutesAgo(10));

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
    machineLandingStores,
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
  const deliveryPair = {
    baseline: landing.receipt.base,
    tree: landing.receipt.revision,
    reference,
  };
  const branchPair = {
    baseline: saved.branchResult.base,
    tree: saved.branchResult.revision,
  };
  expect(
    await fileText([saved], saved, { ...renamed, ...deliveryPair }),
  ).toEqual({
    kind: "text",
    baseline,
    tree: committed,
  });
  expect(await fileText([saved], saved, { ...renamed, ...branchPair })).toEqual(
    {
      kind: "text",
      baseline,
      tree: working,
    },
  );
});
