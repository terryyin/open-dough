import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { acceptLaunchRequest } from "../../server/agentLaunchAccept.ts";
import * as baseCi from "../../server/baseCiJudgment.ts";
import * as checkoutChanges from "../../server/executionCheckoutChanges.ts";
import {
  followUpStorySessions,
  publishedDoneStory,
  requirePublishedFollowUpSessionStory,
} from "../../server/followUpStory.ts";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import type { AttemptRun } from "../../server/launchAttemptSettlement.ts";
import { replaceAttempts } from "../../server/launchAttemptStore.ts";
import {
  deleteRecord,
  keptSession,
  pendingInputOf,
} from "../../server/launchRecordStore.ts";
import { machineDashboardPath } from "../../server/machineHome.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
} from "../../server/projectConfiguration.ts";
import { machineStoryNotesFile } from "../../server/storyNotes.ts";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";
import {
  keepLaunchStore,
  keepLaunchStoreText,
  launchStoreFile,
} from "../../test-support/support/launchStore.ts";

const source = makeMe.aPublishedSource.openDough.please();
const story = {
  source: source.id,
  identity: "SEED-052#open",
  title: "Open story",
};
const openExecution = () => makeMe.aLaunchRecord.executing(story);

async function admission() {
  const home = mkdtempSync(path.join(tmpdir(), "dough-open-story-"));
  const owner = new LaunchAttemptOwner();
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  const unmount = mountProjectConfiguration("development");
  onTestFinished(async () => {
    owner.close();
    try {
      await owner.drain();
    } finally {
      unmount();
      vi.restoreAllMocks();
      vi.unstubAllEnvs();
      rmSync(home, { recursive: true, force: true });
    }
  });
  appendConfiguredProject(
    makeMe.aConfiguredProject.with({ ...source, localPath: home }).please(),
  );

  vi.spyOn(baseCi, "judgeBranchCi").mockResolvedValue({
    state: "pass",
    revision: "a1".repeat(20),
    subject: "Passing origin",
    laterWithoutResult: 0,
  });
  vi.spyOn(checkoutChanges, "existingChanges").mockResolvedValue(undefined);
  const run = vi.fn<AttemptRun>(() =>
    Promise.resolve({
      kind: "failed",
      reason: "refused",
      explanation: "The test stops the launch after admission.",
    }),
  );
  const accept = (request: AgentLaunchRequest) =>
    acceptLaunchRequest(
      owner,
      source,
      request,
      run,
      () => {
        throw new Error("Unexpected continuation.");
      },
      {
        notesFile: machineStoryNotesFile(),
        publishedDoneStory,
        followUpStorySessions,
        pendingInputOf,
        keptSession,
        requirePublishedFollowUpSessionStory,
      },
    );

  await replaceAttempts(() => ({}));
  const attemptFile = machineDashboardPath("launch-attempts.json");
  const initialAttempts = readFileSync(attemptFile, "utf8");
  const initialRecords = () => readFileSync(launchStoreFile(home), "utf8");
  function expectNoAdmission(keptRecords: string) {
    expect(run).not.toHaveBeenCalled();
    expect(readFileSync(attemptFile, "utf8")).toBe(initialAttempts);
    expect(initialRecords()).toBe(keptRecords);
  }
  return { home, accept, run, expectNoAdmission };
}

test.each([
  {
    name: "execution",
    request: makeMe.aLaunchRequest.executing(story).please(),
  },
  {
    name: "refinement",
    request: makeMe.aLaunchRequest.refining(story).please(),
  },
  {
    name: "one-shot refinement",
    request: makeMe.aLaunchRequest
      .refining(story)
      .withPolicy({
        tracking: "one-shot",
        workspace: "isolated",
        landing: "review",
      })
      .please(),
  },
  {
    name: "execution in the default checkout",
    request: makeMe.aLaunchRequest
      .executing(story)
      .withPolicy({
        tracking: "standard",
        workspace: "default-checkout",
        landing: "review",
      })
      .please(),
  },
])("refuses $name while the story has an open session", async ({ request }) => {
  const boundary = await admission();
  const kept = keepLaunchStore(boundary.home, {
    [source.id]: [openExecution().please()],
  });

  expect(await boundary.accept(request)).toMatchObject({
    kind: "failed",
    reason: "session-open",
  });
  boundary.expectNoAdmission(kept);
});

test.each([
  {
    name: "a different story",
    request: makeMe.aLaunchRequest
      .executing({ ...story, identity: "SEED-053#other", title: "Other story" })
      .please(),
  },
  { name: "an ad hoc launch", request: makeMe.aLaunchRequest.adHoc().please() },
])("an open story still allows $name to start", async ({ request }) => {
  const boundary = await admission();
  keepLaunchStore(boundary.home, { [source.id]: [openExecution().please()] });

  expect(await boundary.accept(request)).toHaveProperty("kind", "accepted");
  expect(boundary.run).toHaveBeenCalledOnce();
  expect(boundary.run.mock.calls[0]?.[0].request).toMatchObject(request);
});

test("a locally Done session and a matching open session in another project allow a start", async () => {
  const boundary = await admission();
  const other = "other-project";
  keepLaunchStore(boundary.home, {
    [source.id]: [openExecution().markedDone().please()],
    [other]: [
      makeMe.aLaunchRecord.executing({ ...story, source: other }).please(),
    ],
  });

  expect(
    await boundary.accept(makeMe.aLaunchRequest.executing(story).please()),
  ).toHaveProperty("kind", "accepted");
  expect(boundary.run).toHaveBeenCalledOnce();
});

test.each([
  {
    record: openExecution()
      .inCodexSession({ sessionId: "open-thread" })
      .please(),
  },
  {
    record: openExecution()
      .inCursorSession({
        sessionId: "cccccccc-0000-4000-8000-000000000003",
        continuation: { workspace: "/tmp" },
      })
      .please(),
  },
])(
  "an open $record.session.host session blocks starts across hosts until deleted",
  async ({ record }) => {
    const boundary = await admission();
    const kept = keepLaunchStore(boundary.home, { [source.id]: [record] });
    const request = makeMe.aLaunchRequest.executing(story).please();
    const matchingHost = makeMe.aLaunchRequest
      .executing({ ...story, host: record.session.host })
      .please();

    for (const start of [request, matchingHost]) {
      expect(await boundary.accept(start)).toMatchObject({
        kind: "failed",
        reason: "session-open",
      });
    }
    boundary.expectNoAdmission(kept);

    expect(await deleteRecord(source.id, record.session)).toBe(true);
    expect(await boundary.accept(request)).toHaveProperty("kind", "accepted");
    expect(boundary.run).toHaveBeenCalledOnce();
  },
);

test("refuses a story start when its launch records are unreadable", async () => {
  const boundary = await admission();
  const badRecords = "{ not launch records";
  keepLaunchStoreText(boundary.home, badRecords);

  expect(
    await boundary.accept(makeMe.aLaunchRequest.executing(story).please()),
  ).toMatchObject({ kind: "failed", reason: "unrecorded" });
  boundary.expectNoAdmission(badRecords);
});

test("unreadable story records leave an ad hoc start available", async () => {
  const boundary = await admission();
  const badRecords = "{ not launch records";
  keepLaunchStoreText(boundary.home, badRecords);

  expect(
    await boundary.accept(makeMe.aLaunchRequest.adHoc().please()),
  ).toHaveProperty("kind", "accepted");
  expect(boundary.run).toHaveBeenCalledOnce();
  expect(readFileSync(launchStoreFile(boundary.home), "utf8")).toBe(badRecords);
});
