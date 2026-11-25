import {
  expectBorrowedStarts,
  launchStoryIdentity,
} from "../../test-support/support/unattachedLaunchAssertions.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
// The launch boundary honors an unattached request's landing, with a real
// bare origin (../../test-support/support/startOrigin.ts), the installed start recorded as it
// runs (../../test-support/support/startSessionLanding.ts), and the synthetic `claude`: a
// requested automatic landing runs the start and hands the session its
// "Established session" block, reporting context, story and developer text.
// Wait for review also admits the story. Confirming existing changes keeps
// the selected policy. The dialog's journeys are in
// ../../../e2e/launches/agent-launch-start-session-landing.spec.ts.

import type { LaunchRecord } from "../../src/launchRecord.ts";
import { launch } from "../../test-support/agentLaunchBoundary.ts";
import { dirty } from "../../test-support/support/executionCheckoutChanges.ts";
import { expect, test } from "../../test-support/support/preparationPage.ts";
import { expectReportingBlock } from "../../test-support/support/reportingInputAssertions.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import {
  executionCheckoutSession,
  recordStarts,
  sessionBlock,
} from "../../test-support/support/startSessionLanding.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });

const autoLand = { workspace: "default-checkout", landing: "auto-land" };

test("the boundary honors a requested automatic landing with the developer's text last, and confirming existing changes never selects one", async ({
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  const before = await originMain(origin);
  const request = makeMe.aLaunchRequest.adHoc().please();
  const text = "Explain how launch records are stored";
  dashboard.claudeScenario("launched");

  const landed = await launch(dashboard, {
    ...request,
    instruction: text,
    policy: autoLand,
  });
  const answer = JSON.parse(landed.body) as {
    kind: string;
    record?: LaunchRecord;
  };
  expect(answer.kind).toBe("launched");
  const session = executionCheckoutSession(origin.project, "auto-land", before);
  expect(answer.record?.establishedSession).toEqual(session);
  expect(answer.record?.request).toMatchObject({ policy: autoLand });
  const [block, reporting, developer, ...extra] = (
    dashboard.claudeLaunches()[0]?.instruction ?? ""
  ).split("\n\n");
  expect(block).toBe(sessionBlock(session));
  expectReportingBlock(reporting, answer.record?.request, dashboard);
  expect([developer, ...extra]).toEqual([
    `Taken story: ${launchStoryIdentity(answer.record)}`,
    text,
  ]);
  expectBorrowedStarts(
    starts,
    origin.project,
    "auto-land",
    answer.record,
    dashboard.home,
  );

  // With or without an explicit review choice, admission leaves the session
  // waiting for review after the existing changes are confirmed.
  dirty(origin.project);
  const review = [undefined, { ...autoLand, landing: "review" }];
  for (const [index, policy] of review.entries()) {
    const asked = { ...request, instruction: `${text} ${index}`, policy };
    const found = JSON.parse((await launch(dashboard, asked)).body) as {
      kind: string;
      fingerprint: string;
    };
    expect(found.kind).toBe("existing-changes");
    const confirmed = JSON.parse(
      (
        await launch(dashboard, {
          ...asked,
          existingChanges: found.fingerprint,
        })
      ).body,
    ) as { kind: string; record?: LaunchRecord };
    expect(confirmed.kind).toBe("launched");
    expect(confirmed.record?.request).not.toHaveProperty("policy");
    expect(confirmed.record).not.toHaveProperty("establishedSession");
  }
  expect(
    starts()
      .slice(2)
      .map(({ argv }) => argv),
  ).toEqual([
    expect.arrayContaining(["--admit"]),
    expect.arrayContaining(["--admit"]),
  ]);
  for (const call of dashboard.claudeLaunchCalls().slice(1))
    expect(call.argv.at(-1)).not.toMatch(/auto-land|Established/);
});
