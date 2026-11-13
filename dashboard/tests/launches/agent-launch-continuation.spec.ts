// Kept launch attempts that cannot be read (../../server/launchAttemptOwner.ts):
// nothing tells which startup is unresolved, so the machine's sessions and
// Startup recovery on the page say so, the file stays as it is, and starts are
// refused. Continuing an attempt a closed server left unsettled:
// ../../backend-tests/launches/agent-launch-continuation-interrupted.spec.ts.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { AttemptObservation } from "../../src/agentLaunch.ts";
import { accept, launchRequest } from "../agentLaunchBoundary.ts";
import { parts } from "../dashboardPage.ts";
import { untilPublishedWorkRead } from "../pageRequestNotes.ts";
import { machineRecordNames } from "../support/machineRecordNames.ts";
import { rawRequest } from "../support/rawHttp.ts";
import { test, expect } from "../support/codexLaunch.ts";

test.use({ projectFolders: ["open-dough"] });

type Answer = {
  kind: string;
  reason?: string;
  explanation?: string;
  attempt?: AttemptObservation;
};

const answerOf = (response: { body: string }) =>
  JSON.parse(response.body) as Answer;

test("unreadable kept attempts are said on the page and refuse starts, leaving the file as it is", async ({
  page,
  dashboard,
}) => {
  const folder = path.join(dashboard.home, ".open-dough", "dashboard");
  const file = path.join(folder, "launch-attempts.json");
  mkdirSync(folder, { recursive: true });
  writeFileSync(file, "{ not json");

  const sessions = await rawRequest({
    url: `${dashboard.baseURL}/__agent-launch`,
    headers: { Origin: dashboard.origin },
  });
  expect(
    (JSON.parse(sessions.body) as { attemptsReadable: boolean })
      .attemptsReadable,
  ).toBe(false);
  expect(answerOf(await accept(dashboard, launchRequest))).toMatchObject({
    kind: "failed",
    reason: "unrecorded",
    explanation: expect.stringContaining(
      "could not be read, so an earlier start may still need reconciliation",
    ),
  });
  const malformed = await rawRequest({
    url: `${dashboard.baseURL}/__agent-launch/continue`,
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: dashboard.origin },
    body: JSON.stringify({ source: "open-dough", attempt: "not-an-id" }),
  });
  expect(malformed.status).toBe(400);

  await page.goto("/");
  const recovery = page.getByRole("region", { name: "Startup recovery" });
  await expect(recovery).toContainText(
    "This machine's launch evidence (~/.open-dough/dashboard/launch-attempts.json) could not be read",
  );
  await expect(parts(page).project).toBeVisible();
  // The page's published-work reads retain answers under retained-answers/
  // (../server/retainedAnswers.ts); wait for them so the listing is stable.
  await untilPublishedWorkRead(page);
  expect(readFileSync(file, "utf8")).toBe("{ not json");
  // The unreadable attempts file stays. The runner's address and log, the
  // notification sender, retained GitHub answers and the incident record are
  // not a replacement of it.
  expect(machineRecordNames(folder)).toEqual([
    "cursor-runner.json",
    "cursor-runner.log",
    "launch-attempts.json",
    "notifier",
    "projects-production.json",
    "retained-answers",
  ]);
  expect(dashboard.claudeCalls()).toEqual([]);
});
