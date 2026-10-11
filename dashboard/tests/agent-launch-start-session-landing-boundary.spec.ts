// The launch boundary honors an unattached request's landing, with a real
// bare origin (./support/startOrigin.ts), the installed start recorded as it
// runs (./support/startSessionLanding.ts), and the synthetic `claude`: a
// requested automatic landing runs the start and hands the session its
// "Established session" block, the reporting context, then the developer's
// text; Wait for review, named or not, runs no start, and confirming existing
// changes never selects an automatic landing. The dialog's journeys are in
// ./agent-launch-start-session-landing.spec.ts.

import type { LaunchRecord } from "../src/launchRecord.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { dirty } from "./support/defaultCheckoutChanges.ts";
import { expect, test } from "./support/preparationPage.ts";
import { expectReportingBlock } from "./support/reportingInputAssertions.ts";
import { originMain } from "./support/sessionDialog.ts";
import {
  defaultMainSession,
  recordStarts,
  sessionBlock,
} from "./support/startSessionLanding.ts";

const autoLand = { workspace: "default-checkout", landing: "auto-land" };

test("the boundary honors a requested automatic landing with the developer's text last, and confirming existing changes never selects one", async ({
  dashboard,
  origin,
}) => {
  const starts = recordStarts(origin);
  const before = await originMain(origin);
  const request = { source: "open-dough", workflow: "ad-hoc", host: "claude" };
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
  const session = defaultMainSession(origin.project, "auto-land", before);
  expect(answer.record?.establishedSession).toEqual(session);
  expect(answer.record?.request).toMatchObject({ policy: autoLand });
  const [block, reporting, developer, ...extra] = (
    dashboard.claudeLaunchCalls()[0]?.argv.at(-1) ?? ""
  ).split("\n\n");
  expect(block).toBe(sessionBlock(session));
  expectReportingBlock(reporting, answer.record?.request, dashboard);
  expect([developer, ...extra]).toEqual([text]);
  expect(starts()).toHaveLength(1);

  // Wait for review, named or not, with existing changes confirmed: no
  // start runs, and nothing of an automatic landing reaches the session.
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
  expect(starts()).toHaveLength(1);
  for (const call of dashboard.claudeLaunchCalls().slice(1))
    expect(call.argv.at(-1)).not.toMatch(/auto-land|Established/);
});
