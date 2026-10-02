// A kept Claude Code conversation whose first input is unconfirmed
// (../server/launchRun.ts): Claude Code writes no first-input evidence and has
// no native recovery, so only legacy or hand-edited launch evidence reaches
// this. A launch matching it starts no other conversation and answers what is
// known and what to check, read as formed under Startup recovery. The
// evidence is forged in this machine's records, as
// ./agent-launch-codex-confirmation.spec.ts forges legacy evidence.

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { LaunchRecord } from "../src/agentLaunch.ts";
import { launch } from "./agentLaunchBoundary.ts";
import { expect, test } from "./dashboardTest.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import { publishLaunchJourney, type LaunchJourney } from "./launchJourney.ts";
import { recoveryOf } from "./responsiveRecovery.ts";

const request = {
  source: "open-dough",
  host: "claude",
  workflow: "ad-hoc",
  instruction: "why is the CI slow on main?",
};
const unconfirmed =
  "This launch's recorded conversation has a first input that is not confirmed, so no other conversation was started. Check the recorded conversation for that input.";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());
test.use({ projectFolders: ["open-dough"] });

test("a launch matching a kept conversation with unconfirmed first input starts nothing and says what to check, as Startup recovery shows it", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  expect(JSON.parse((await launch(dashboard, request)).body)).toMatchObject({
    kind: "launched",
  });
  const file = path.join(
    dashboard.home,
    ".open-dough/dashboard/agent-launches.json",
  );
  const document = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    LaunchRecord[]
  >;
  const [kept] = document["open-dough"] ?? [];
  if (kept === undefined) throw new Error("Missing saved Claude record.");
  document["open-dough"] = [
    {
      ...kept,
      firstInput: { state: "uncertain", instruction: request.instruction },
    },
  ];
  writeFileSync(file, JSON.stringify(document));

  expect(JSON.parse((await launch(dashboard, request)).body)).toEqual({
    kind: "uncertain",
    reason: "unconfirmed",
    explanation: unconfirmed,
  });
  expect(dashboard.claudeLaunchCalls()).toHaveLength(1);

  await openTakenBacklog(page, journey);
  const recovery = recoveryOf(page);
  await expect(recovery).toContainText(`Its last answer: ${unconfirmed}`);
  await expect(recovery).not.toContainText(/start(ing)? again/i);
});
