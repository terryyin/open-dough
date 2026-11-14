// The launch boundary for the project row's Start session on default main
// with existing changes, over raw HTTP: it takes an unattached policy and the
// changes' confirmation, checks a request naming no policy as Default main,
// refuses a tracking choice, starts nothing unconfirmed, and keeps no
// confirmation in the launch's records. A real bare origin
// (../../tests/support/startOrigin.ts) and the synthetic `claude`. The
// dialog's warning, Back, Cancel and Continue:
// ../../../e2e/launches/agent-launch-start-session-existing-changes.spec.ts.

import { realpathSync } from "node:fs";
import type { RecordedLaunchRequest } from "../../src/launchRequest.ts";
import { accept, attempts, launch } from "../../tests/agentLaunchBoundary.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { dirty } from "../../tests/support/defaultCheckoutChanges.ts";
import { expect, test } from "../../tests/support/preparationPage.ts";

const text = "Explain how launch records are stored";

type Recorded = { readonly request: RecordedLaunchRequest };

test("the boundary takes an unattached policy and confirmation, checks a request naming no policy as Default main, refuses a tracking choice, and keeps no confirmation", async ({
  dashboard,
  origin,
}) => {
  const request = makeMe.aLaunchRequest.adHoc({ instruction: text }).please();
  const defaults = { workspace: "default-checkout", landing: "review" };
  dirty(origin.project);
  dashboard.claudeScenario("launched");

  // A tracking choice is not an unattached session's to make.
  const tracked = await accept(dashboard, {
    ...request,
    policy: { ...defaults, tracking: "one-shot" },
  });
  expect(tracked.status).toBe(400);

  // With or without the default policy named, nothing starts unconfirmed, and
  // a confirmation of something else confirms nothing.
  const found: { kind: string; count: number; fingerprint: string }[] = [];
  for (const asked of [
    request,
    { ...request, policy: defaults },
    { ...request, policy: defaults, existingChanges: "0".repeat(64) },
  ]) {
    const answer = await accept(dashboard, asked);
    expect(answer.status).toBe(200);
    found.push(JSON.parse(answer.body) as (typeof found)[number]);
  }
  expect(new Set(found.map(({ fingerprint }) => fingerprint)).size).toBe(1);
  for (const answer of found)
    expect(answer).toMatchObject({ kind: "existing-changes", count: 4 });
  expect(dashboard.claudeLaunchCalls()).toEqual([]);
  expect(await attempts(dashboard)).toEqual([]);

  const confirmed = await launch(dashboard, {
    ...request,
    policy: defaults,
    existingChanges: found[0]?.fingerprint,
  });
  expect(confirmed.status).toBe(200);
  const answer = JSON.parse(confirmed.body) as {
    kind: string;
    record?: Recorded;
  };
  expect(answer.kind).toBe("launched");
  expect(answer.record?.request).toMatchObject({ instruction: text });
  expect(answer.record?.request).not.toHaveProperty("existingChanges");
  const [call] = dashboard.claudeLaunchCalls();
  expect(call?.cwd).toBe(realpathSync(origin.project));
  expect(call?.argv.at(-1)).not.toContain("Established");
  for (const attempt of (await attempts(dashboard)) as Recorded[])
    expect(attempt.request).not.toHaveProperty("existingChanges");
});
