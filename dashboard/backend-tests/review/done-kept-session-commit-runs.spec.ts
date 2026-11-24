import { expect, test } from "vitest";
import { git } from "../../../Distribution/src/skills/dough-execute-plan/scripts/publication-git.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { readSessionCommits } from "../../server/sessionCommitsCapture.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

test("commits either side of merged trunk work are two runs without the merge or its work", async () => {
  const {
    checkout,
    records: { launch },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withCheckoutLaunch("launch", { launched: 60 })
    .please();
  const { base, integration } = checkout;
  const { first, merge, second } = await performWork(
    makeMe.aCheckoutWork
      .committing("first", { at: at(45) })
      .mergingTrunkWork("merge", { at: at(35) })
      .committing("second", { at: at(25) }),
  );
  const { runs } = await readSessionCommits(launch, { workspace: integration });
  expect(runs).toEqual([
    { base, revision: first },
    { base: merge, revision: second },
  ]);
  expect(
    (await git(integration, "diff", "--name-only", base, first)).stdout,
  ).toBe("first.txt\n");
  expect(
    (await git(integration, "diff", "--name-only", merge, second)).stdout,
  ).toBe("second.txt\n");
});

test("commits either side of an amended merge stay separate without the merge's files", async () => {
  const {
    checkout,
    records: { launch },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withOrigin()
    .withCheckoutLaunch("launch", { launched: 60 })
    .please();
  const { base, integration } = checkout;
  const { first, amended, second } = await performWork(
    makeMe.aCheckoutWork
      .committing("first", { at: at(45) })
      .mergingTrunkWork("merge", { at: at(40) })
      .amending("amended", { at: at(35) })
      .committing("second", { at: at(25) }),
  );
  const { runs } = await readSessionCommits(launch, { workspace: integration });
  expect(runs).toEqual([
    { base, revision: first },
    { base: amended, revision: second },
  ]);
  expect(
    (await git(integration, "diff", "--name-only", base, first)).stdout,
  ).toBe("first.txt\n");
  expect(
    (await git(integration, "diff", "--name-only", amended, second)).stdout,
  ).toBe("second.txt\n");
});
