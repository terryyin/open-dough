// A follow-up started with Codex over raw HTTP, with the real installed start
// (../../test-support/support/codexStart.ts) and the protocol-only Codex fixture:
// a start retried after the source record is gone rebuilds that input from the
// recorded request, and a pending first input is recovered with its saved text.
// A done story's Codex context is agent-launch-follow-up-story-input.spec.ts.
// Cursor's: agent-launch-follow-up-cursor.spec.ts.

import { rm } from "node:fs/promises";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  attempts,
  continued,
  launch,
} from "../../test-support/agentLaunchBoundary.ts";
import { keptAttempts } from "../../test-support/acceptedAttempts.ts";
import { expect, stored, test } from "../../test-support/support/codexStart.ts";
import type { FakeCodex } from "../../test-support/support/fakeCodex.ts";
import { originMain } from "../../test-support/support/sessionDialog.ts";
import { isolatedSession } from "../../test-support/support/startSessionLanding.ts";
import { keepLaunchRecords } from "../../test-support/support/launchStore.ts";
import {
  answerOf,
  expectFollowUpInput,
  reported,
  reportedContext,
  request,
  publishFollowUpSources,
} from "./followUpBoundaryCases.ts";

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary" });
test.beforeEach(publishFollowUpSources);

const codex = { ...request, host: "codex" };
const isolated = { workspace: "isolated", landing: "review" };

// The text of every input Codex was handed, in order.
const inputsOf = (native: FakeCodex) =>
  native.calls
    .filter((call) => call.method === "turn/start")
    .map((call) => {
      const { input } = call.params as {
        input: { type: string; text?: string }[];
      };
      expect(input.map(({ type }) => type)).toEqual(["text"]);
      return input[0]?.text;
    });

test("Continue after Codex refused and the source record is gone rebuilds the input from the recorded context", async ({
  dashboard,
  origin,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const source = reported(dashboard.home);
  keepLaunchRecords(dashboard, [source]);
  const text = "Continue";
  const trunk = await originMain(origin);
  native.refuseCreation = true;
  const refused = await answerOf(
    launch(dashboard, {
      ...codex,
      instruction: text,
      policy: isolated,
      followUp: makeMe.aFollowUp.ofSession(source).please(),
    }),
  );
  expect(refused.kind, JSON.stringify(refused)).toBe("failed");
  expect(inputsOf(native)).toEqual([]);
  const [failed] = await attempts(dashboard);
  keepLaunchRecords(dashboard, []);

  native.refuseCreation = false;
  const launched = await answerOf(continued(dashboard, failed?.id ?? ""));

  expect(launched.kind, JSON.stringify(launched)).toBe("launched");
  const [input, ...others] = inputsOf(native);
  expect(others).toEqual([]);
  expectFollowUpInput(input, {
    context: reportedContext,
    own: text,
    session: isolatedSession(
      origin.project,
      "continue",
      "review",
      trunk,
      "codex",
    ),
    request: launched.record?.request,
    server: dashboard,
  });
  expect(stored(dashboard.home).at(-1)?.request).toMatchObject({
    followUp: { context: reportedContext },
  });
});

test("repeating a follow-up with only its pending Codex input kept recovers the saved context", async ({
  dashboard,
  codexProtocol,
}) => {
  const native = codexProtocol;
  if (native === undefined) throw new Error("Missing native fixture.");
  const source = reported(dashboard.home);
  keepLaunchRecords(dashboard, [source]);
  const followUp = {
    ...codex,
    instruction: "Check the cache again",
    followUp: makeMe.aFollowUp.ofSession(source).please(),
  };
  native.refuseInput = true;
  expect((await answerOf(launch(dashboard, followUp))).kind).toBe("uncertain");
  const kept = stored(dashboard.home).at(-1);
  if (kept === undefined) throw new Error("Missing saved conversation");
  expect(kept.firstInput).toMatchObject({ state: "awaiting" });
  expect(await attempts(dashboard)).toHaveLength(1);
  keepLaunchRecords(dashboard, [kept]);
  await rm(
    path.join(dashboard.home, ".open-dough/dashboard/launch-attempts.json"),
  );
  expect(keptAttempts(dashboard)).toEqual([]);

  native.refuseInput = false;
  const recovered = await answerOf(launch(dashboard, followUp));
  expect(recovered.kind, JSON.stringify(recovered)).toBe("launched");
  expect(recovered.record?.session).toEqual(kept.session);
  expect(
    native.calls.filter(({ method }) => method === "thread/start"),
  ).toHaveLength(1);
  const [refused, resent, ...others] = inputsOf(native);
  expect(others).toEqual([]);
  expect(resent).toBe(refused);
  expect(resent).toContain(reportedContext);
  const recoveredAttempts = keptAttempts(dashboard);
  expect(recoveredAttempts).toHaveLength(1);
  expect(recoveredAttempts[0]?.request).toMatchObject({
    followUp: {
      ...followUp.followUp,
      context: reportedContext,
      storyIdentity:
        kept.request.workflow === "ad-hoc"
          ? kept.request.storyIdentity
          : undefined,
    },
  });
});
