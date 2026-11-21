import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { readSessionCommits } from "../../server/sessionCommitsCapture.ts";
import { aCheckout, minutesAgo, work } from "../support/doneCaptureCase.ts";

test("capture keeps a continued cherry-pick with the session's conflict resolution", async () => {
  const checkout = await aCheckout({ withOrigin: true });
  const launch = makeMe.aLaunchRecord.startedOnMainOf(checkout).please();
  const { integration } = checkout;
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
  const { runs } = await readSessionCommits(launch, { workspace: integration });
  expect(runs).toEqual([{ base: baseline, revision: tree }]);
  expect((await git(integration, "show", `${baseline}:notes.txt`)).stdout).toBe(
    "Local notes\n",
  );
  expect((await git(integration, "show", `${tree}:notes.txt`)).stdout).toBe(
    "Reconciled notes\n",
  );
});

for (const mode of ["fixup", "squash"] as const) {
  test(`capture keeps the rewritten commit after autosquashing a ${mode}`, async () => {
    const checkout = await aCheckout();
    const launch = makeMe.aLaunchRecord.startedOnMainOf(checkout).please();
    const { base, integration } = checkout;
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
    const { runs } = await readSessionCommits(launch, {
      workspace: integration,
    });
    expect(runs).toEqual([{ base, revision: tree }]);
    expect(
      (await git(integration, "diff", "--name-only", base, tree)).stdout,
    ).toBe("added.txt\ntarget.txt\n");
    expect((await git(integration, "show", `${tree}:added.txt`)).stdout).toBe(
      "Added file\n",
    );
  });
}
