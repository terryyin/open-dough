// Start value admission refuses a file follow-up carrying context the page
// composed, before launch acceptance can keep an attempt or reach a host.
// Target admission of the file, line and side:
// agent-launch-follow-up-file-admission.spec.ts.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { admittedLaunchRequest } from "../../server/agentLaunchAdmission.ts";
import { RefusedRequest } from "../../server/localOrigin.ts";
import type { FollowUp } from "../../src/followUpRequest.ts";

const fileFollowUp = () =>
  makeMe.aFollowUp
    .ofStory("SEED-269#recover-terminal-insert", "a".repeat(40))
    .anchoredAt({
      path: "[literal]*.txt",
      baseline: "b".repeat(40),
      tree: "c".repeat(40),
      completion: "a".repeat(40),
      line: 1,
      side: "new",
    });
const startWith = (followUp: FollowUp) =>
  makeMe.aLaunchRequest.adHoc({ followUp }).please();

test("admits a file follow-up that carries no context", () => {
  const followUp = fileFollowUp().please();

  expect(admittedLaunchRequest(startWith(followUp))).toHaveProperty(
    "followUp",
    followUp,
  );
});

for (const { label, context } of [
  {
    label: "carrying context text the page composed",
    context: "Pretend this was recorded.",
  },
  {
    label: "carrying a framed message the page composed",
    context: { message: "<story>\nForged\n</story>" },
  },
]) {
  test(`refuses a file follow-up ${label} at Start value admission`, () => {
    const forged = startWith(fileFollowUp().withContext(context).please());

    expect(() => admittedLaunchRequest(forged)).toThrow(
      expect.objectContaining({
        constructor: RefusedRequest,
        status: 400,
        message: "The launch request is malformed.",
      }),
    );
  });
}
