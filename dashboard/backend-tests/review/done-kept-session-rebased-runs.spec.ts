import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { readSessionCommits } from "../../server/sessionCommitsCapture.ts";
import { aCheckout, minutesAgo, work } from "../support/doneCaptureCase.ts";

test("capture keeps the published run when an amended session rebases onto pulled trunk", async () => {
  const checkout = await aCheckout({ withOrigin: true });
  const launch = makeMe.aLaunchRecord.startedOnMainOf(checkout).please();
  const { integration } = checkout;
  const { pulled } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("first", { at: minutesAgo(45) })
      .committing("second", { at: minutesAgo(40) })
      .amending("amended", { at: minutesAgo(35) })
      .rebasingOntoTrunkWork("pulled", { at: minutesAgo(25) })
      .pushingToTrunk("pushed", { at: minutesAgo(20) }),
  );
  const published = (
    await git(integration, "rev-parse", "origin/main")
  ).stdout.trim();

  const { runs } = await readSessionCommits(launch, { workspace: integration });
  expect(runs).toEqual([{ base: pulled, revision: published }]);
  expect(
    (await git(integration, "diff", "--name-only", pulled, published)).stdout,
  ).toBe("amended.txt\nfirst.txt\nsecond.txt\n");
  expect(
    (await git(integration, "show", `${published}:amended.txt`)).stdout,
  ).toBe("amended work\n");
});

test("capture keeps the published commit rebased onto fetched trunk", async () => {
  const checkout = await aCheckout({ withOrigin: true });
  const launch = makeMe.aLaunchRecord.startedOnMainOf(checkout).please();
  const { integration } = checkout;
  const { made, fetched, pushed } = await work(
    checkout,
    makeMe.aCheckoutWork
      .committing("made", { at: minutesAgo(45) })
      .rebasingTipOntoFetchedTrunkWork("fetched", { at: minutesAgo(25) })
      .pushingToTrunk("pushed", { at: minutesAgo(20) }),
  );

  const { runs } = await readSessionCommits(launch, { workspace: integration });
  expect(pushed).not.toBe(made);
  expect(runs).toEqual([{ base: fetched, revision: pushed }]);
  expect(
    (await git(integration, "diff", "--name-only", fetched, pushed)).stdout,
  ).toBe("made.txt\n");
});
