import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { readSessionCommits } from "../../server/sessionCommitsCapture.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

test("capture keeps the published run when an amended session rebases onto pulled trunk", async () => {
  const {
    checkout,
    records: { launch },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withDefaultMainLaunch("launch", { launched: 60 })
    .please();
  const { integration } = checkout;
  const { pulled } = await performWork(
    makeMe.aCheckoutWork
      .committing("first", { at: at(45) })
      .committing("second", { at: at(40) })
      .amending("amended", { at: at(35) })
      .rebasingOntoTrunkWork("pulled", { at: at(25) })
      .pushingToTrunk("pushed", { at: at(20) }),
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
  const {
    checkout,
    records: { launch },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withDefaultMainLaunch("launch", { launched: 60 })
    .please();
  const { integration } = checkout;
  const { made, fetched, pushed } = await performWork(
    makeMe.aCheckoutWork
      .committing("made", { at: at(45) })
      .rebasingTipOntoFetchedTrunkWork("fetched", { at: at(25) })
      .pushingToTrunk("pushed", { at: at(20) }),
  );

  const { runs } = await readSessionCommits(launch, { workspace: integration });
  expect(pushed).not.toBe(made);
  expect(runs).toEqual([{ base: fetched, revision: pushed }]);
  expect(
    (await git(integration, "diff", "--name-only", fetched, pushed)).stdout,
  ).toBe("made.txt\n");
});
