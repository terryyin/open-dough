// A pending Done has no captured changes of its own. Capture keeps only
// work reachable from the checkout tip resolved for that Done.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { readSessionCommitsAt } from "../../server/sessionCommitsCapture.ts";
import { aDoneCaptureCase } from "../support/doneCaptureCaseBuilder.ts";

test("capture excludes a commit that arrives after Done's tip was read", async () => {
  const {
    checkout,
    work: { second },
    timeline: {
      launch: { launchedAt },
    },
    performWork,
    at,
  } = await aDoneCaptureCase()
    .withWork((at) =>
      makeMe.aCheckoutWork
        .committing("first", { at: at(40) })
        .committing("second", { at: at(20) }),
    )
    .withCheckoutLaunch("launch", { launched: 60 })
    .please();

  await performWork(
    makeMe.aCheckoutWork.committing("after-done", { at: at(5) }),
  );

  const capture = await readSessionCommitsAt({
    checkout: checkout.integration,
    originalRef: "HEAD",
    head: second,
    launchedAt,
  });
  expect(capture.runs).toEqual([{ base: checkout.base, revision: second }]);
});
