// From a settled automatic CI repeat's comparison
// (./intent-ci-follow-up.spec.ts), Changed tests navigates the proof of the
// original attempt, which measured the landing, and offers none of the
// repeat's: read from what the machine keeps, by a dashboard that collects
// nothing (../../dashboard/tests/support/ciFollowUpSettledReading.ts).
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  actionsRequests,
  expect,
  keepSettledRepeat,
  test,
} from "../../dashboard/tests/support/ciFollowUpSettledReading.ts";
import {
  expectOriginalProofNavigation,
  gotoCiFollowUp,
  retainedCiFollowUpReading,
} from "../../dashboard/tests/support/ciFollowUpReadingPage.ts";
import { queuedIdentity } from "../../dashboard/tests/support/startOrigin.ts";

test.use({ viewport: { width: 390, height: 844 } });

test("the original attempt's proof is navigable from Changed tests of a settled request's comparison and the repeat's is not offered, without acquiring CI", async ({
  page,
  dashboard,
  origin,
  github,
}) => {
  // Story A's run 71 first passed in 120 s against five prior builds of 100 s
  // each and its repeat in 100 s; the CI proof kept of each attempt counts
  // 2092 passed test cases at dashboard/tests.
  const { completion } = await keepSettledRepeat(page, origin, github, {
    run: 71,
    seconds: 120,
    repeatSeconds: 100,
    averageSeconds: 100,
    proof: [
      makeMe.aCiProofEntry
        .at("dashboard/tests")
        .counting(2092, "case")
        .please(),
    ],
  });
  const before = actionsRequests(github);
  // The comparison's own address; the card that opens it is read in
  // ./intent-ci-follow-up.spec.ts.
  await gotoCiFollowUp(page, dashboard.baseURL, {
    identity: queuedIdentity,
    revision: completion,
  });
  const { comparison } = retainedCiFollowUpReading(page);
  await expect(comparison, "comparison opened").toContainText(
    "File and folder Proof below describes the original selected landing",
  );
  await expectOriginalProofNavigation(page, {
    location: "dashboard/tests",
    file: "dashboard/tests/a.spec.ts",
    originalAttempt: "Run 71 · attempt 1",
    repeatAttempt: "Run 71 · attempt 2",
    originalUrl:
      "https://github.com/terryyin/open-dough/actions/runs/71/attempts/1",
    passedCases: "2092 passed test cases",
    absentFraming: "story branch of",
  });
  await expect(comparison, "back at the comparison").toBeVisible();
  expect(
    actionsRequests(github),
    "no CI request from proof navigation",
  ).toEqual(before);
});
