// The typed review and file readers read a Done session's rewritten checkout
// work as its kept run.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { aCheckout, minutesAgo, work } from "../support/doneCaptureCase.ts";
import {
  aDoneSession,
  fileText,
  review,
} from "../support/doneCaptureReview.ts";

test("a continued cherry-pick is reviewed with the session's conflict resolution", async () => {
  const checkout = await aCheckout({ withOrigin: true });
  const { baseline } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("baseline", {
      at: minutesAgo(90),
      files: { "notes.txt": "Local notes\n" },
    }),
  );
  const { tree } = await work(
    checkout,
    makeMe.aCheckoutWork.continuingConflictedCherryPick("tree", {
      at: minutesAgo(30),
      file: "notes.txt",
      incoming: "Incoming notes\n",
      resolution: "Reconciled notes\n",
    }),
  );
  const record = aDoneSession(
    checkout,
    [{ base: baseline, revision: tree }],
    baseline,
  );

  expect(await review([record], record)).toMatchObject({
    commitRuns: [{ commits: 1, baseline, tree }],
  });
  expect(
    await fileText([record], record, { baseline, tree, path: "notes.txt" }),
  ).toEqual({
    kind: "text",
    baseline: "Local notes\n",
    tree: "Reconciled notes\n",
  });
});

for (const mode of ["fixup", "squash"] as const) {
  test(`an autosquashed ${mode} is reviewed as one commit with both files`, async () => {
    const checkout = await aCheckout();
    const { target } = await work(
      checkout,
      makeMe.aCheckoutWork.committing("target", { at: minutesAgo(40) }),
    );
    const { tree } = await work(
      checkout,
      makeMe.aCheckoutWork.autosquashing("tree", {
        at: minutesAgo(25),
        target,
        mode,
        file: "added.txt",
        content: "Added file\n",
      }),
    );
    const record = aDoneSession(checkout, [
      { base: checkout.base, revision: tree },
    ]);

    expect(await review([record], record)).toMatchObject({
      commitRuns: [{ commits: 1, baseline: checkout.base, tree }],
      files: [{ path: "added.txt" }, { path: "target.txt" }],
    });
  });
}
