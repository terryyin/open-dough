// After the installed publisher delivers a Done isolated session and its
// branch is retired, the session still opens both its delivered rename and
// its different working-tree comparison, each only through its own pair.
import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { retireAdHocBranch } from "../../test-support/support/adHocBranchRefs.ts";
import { minutesAgo, source } from "../support/doneCaptureCase.ts";
import { fileText, review } from "../support/doneCaptureReview.ts";
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
  const { checkout, workspace, record, reference, landingContext, stores } =
    await aReportedIsolatedBranch(branch, { [renamed.oldPath]: baseline });
  const write = (text: string) => {
    writeFileSync(path.join(workspace, renamed.path), text);
  };
  await git(workspace, "mv", renamed.oldPath, renamed.path);
  write(committed);
  await git(workspace, "add", renamed.path);
  await git(workspace, "commit", "--quiet", "-m", "Rename the draft");
  write(working);
  await stores.markDone(record.session.sessionId, minutesAgo(10));

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
    () =>
      Promise.resolve(
        stores.attempts()[source]?.find((attempt) => attempt.id === reference)
          ?.landingPreparations,
      ),
    stores,
  );
  // The installed publisher prepared exactly the pair it then recorded.
  expect(before.trunk).toBe(checkout.base);
  expect(before.prepared).toMatchObject([
    { base: landing.receipt.base, revision: landing.receipt.revision },
  ]);
  retireAdHocBranch(checkout.integration, workspace, branch);

  const kept = await stores.keptRecords(source);
  const choices = ["delivered", "branch-result"];
  const delivered = await review(record, { keeping: kept });
  const branchResult = await review(record, {
    run: "branch-result",
    keeping: kept,
  });
  const renamedFile = { kind: "renamed", ...renamed };
  expect(delivered).toMatchObject({
    kind: "landed",
    selectedRun: "delivered",
    sessionComparisonKeys: choices,
    baseline: landing.receipt.base,
    tree: landing.receipt.revision,
    files: [renamedFile],
  });
  expect(branchResult).toMatchObject({
    kind: "branch-result",
    selectedRun: "branch-result",
    sessionComparisonKeys: choices,
    baseline: checkout.base,
    files: [renamedFile],
  });
  if (delivered.kind !== "landed" || branchResult.kind !== "branch-result")
    throw new Error("Missing the retained comparisons.");

  const deliveryPair = {
    baseline: delivered.baseline,
    tree: delivered.tree,
    reference,
  };
  const branchPair = {
    baseline: branchResult.baseline,
    tree: branchResult.tree,
  };
  expect(await fileText(record, { ...renamed, ...deliveryPair }, kept)).toEqual(
    {
      kind: "text",
      baseline,
      tree: committed,
    },
  );
  expect(await fileText(record, { ...renamed, ...branchPair }, kept)).toEqual({
    kind: "text",
    baseline,
    tree: working,
  });
  const foreignTree = { ...deliveryPair, tree: branchResult.tree };
  await expect(
    fileText(record, { ...renamed, ...foreignTree }, kept),
  ).rejects.toMatchObject({ status: 409 });
  const wrongOldPath = { ...renamed, oldPath: "other.txt" };
  await expect(
    fileText(record, { ...wrongOldPath, ...branchPair }, kept),
  ).rejects.toMatchObject({ status: 409 });
});
