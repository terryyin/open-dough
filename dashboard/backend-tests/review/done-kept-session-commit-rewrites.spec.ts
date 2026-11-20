// Done captures rewritten checkout work from Git's own log and supplies the
// kept run to the typed review and file readers.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  aCheckout,
  aKeptSession,
  anEstablishedSession,
  fileText,
  keep,
  markDone,
  minutesAgo,
  review,
  work,
} from "../support/doneCaptureCase.ts";

test("a continued cherry-pick is kept with the session's conflict resolution", async () => {
  const checkout = await aCheckout({ withOrigin: true });
  const { baseline } = await work(
    checkout,
    makeMe.aCheckoutWork.committing("baseline", {
      at: minutesAgo(90),
      files: { "notes.txt": "Local notes\n" },
    }),
  );
  const record = anEstablishedSession(checkout, {
    revision: baseline,
  }).please();
  keep(record);
  const { tree } = await work(
    checkout,
    makeMe.aCheckoutWork.continuingConflictedCherryPick("tree", {
      at: minutesAgo(30),
      file: "notes.txt",
      incoming: "Incoming notes\n",
      resolution: "Reconciled notes\n",
    }),
  );

  await markDone(record);

  expect(await review(record)).toMatchObject({
    commitRuns: [{ commits: 1, baseline, tree }],
  });
  expect(await fileText(record, { baseline, tree, path: "notes.txt" })).toEqual(
    {
      kind: "text",
      baseline: "Local notes\n",
      tree: "Reconciled notes\n",
    },
  );
});

for (const mode of ["fixup", "squash"] as const) {
  test(`an autosquashed ${mode} is kept as one commit with both files`, async () => {
    const { checkout, record } = await aKeptSession();
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

    await markDone(record);

    expect(await review(record)).toMatchObject({
      commitRuns: [{ commits: 1, baseline: checkout.base, tree }],
      files: [{ path: "added.txt" }, { path: "target.txt" }],
    });
  });
}
