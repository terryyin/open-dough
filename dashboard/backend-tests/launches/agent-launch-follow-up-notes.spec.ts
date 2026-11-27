// Launch acceptance distinguishes Attach choices and keeps a retry's first
// input after a note edit. The native host observes the retained request.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  acceptLaunchRequest,
  continueKeptAttempt,
} from "../../server/agentLaunchAccept.ts";
import { admittedLaunchRequest } from "../../server/agentLaunchAdmission.ts";
import { withFollowUpContext } from "../../server/followUpAdmission.ts";
import { recordedRequest } from "../../server/hostLaunch.ts";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import {
  keepAttempt,
  keptAttempts,
  replaceAttempts,
} from "../../server/launchAttemptStore.ts";
import { replaceRecords } from "../../server/launchRecordDocument.ts";
import { pendingInputOf } from "../../server/launchRecordStore.ts";
import {
  appendConfiguredProject,
  mountProjectConfiguration,
  removeConfiguredProject,
} from "../../server/projectConfiguration.ts";
import { StartProgress } from "../../server/startProgress.ts";
import { storyNotes } from "../../server/storyNotes.ts";
import { unattachedInput } from "../../server/unattachedInput.ts";
import type { AgentLaunchRequest } from "../../src/agentLaunch.ts";
import type { DoneStory } from "../../src/doneRecord.ts";
import { storyNoteVersion } from "../../src/storyNote.ts";
import { receivingHost } from "../support/receivingHost.ts";

const story: Pick<DoneStory, "identity" | "title" | "completedAt"> =
  makeMe.aDoneRecord
    .completed({
      identity: "SEED-269#recover-terminal-insert",
      title: "Recover dictation and Paste in the embedded terminal",
      completedAt: "2026-11-08T09:05:00.000Z",
    })
    .please();
const note = makeMe.aStoryNote
  .withText("Paste still drops the last line on iPad.")
  .please();
const revision = "a".repeat(40);
const policy = { workspace: "isolated", landing: "review" } as const;

async function arrangeRefusedFollowUp(instruction: string) {
  const directory = mkdtempSync(path.join(tmpdir(), "kept-follow-up-notes-"));
  const project = makeMe.aConfiguredProject
    .with({
      id: "story-notes-retry",
      label: "Story Notes retry",
      repository: "terryyin/story-notes-retry",
      localPath: directory,
    })
    .please();
  const owner = new LaunchAttemptOwner();
  const unmount = mountProjectConfiguration("development");
  const withoutFixture = <T>(kept: Record<string, T>) =>
    Object.fromEntries(
      Object.entries(kept).filter(([id]) => id !== project.id),
    );
  onTestFinished(async () => {
    owner.close();
    await owner.drain();
    try {
      await replaceAttempts(withoutFixture);
      await replaceRecords(withoutFixture);
      removeConfiguredProject(project.id);
    } finally {
      unmount();
      rmSync(directory, { recursive: true, force: true });
    }
  });
  appendConfiguredProject(project);

  const notesFile = path.join(directory, "story-notes.json");
  const notes = makeMe.aStoredStoryNotesDocument
    .withNotes(project.id, story.identity, [note])
    .please();
  writeFileSync(notesFile, JSON.stringify(notes));
  const followUpInput = {
    notesFile,
    publishedDoneStory: () => Promise.resolve(story),
    followUpStorySessions: () => Promise.resolve([]),
    pendingInputOf,
  };
  const start = (attach: boolean) => {
    const followUp = makeMe.aFollowUp.ofStory(story, revision);
    if (attach) {
      followUp.attachingNotes();
    }
    return admittedLaunchRequest(
      makeMe.aLaunchRequest
        .adHoc({ source: project.id, instruction, followUp: followUp.please() })
        .withPolicy(policy)
        .please(),
    );
  };
  const attach = start(true);
  const admitted = await withFollowUpContext(attach, project, followUpInput);
  const acceptedAt = new Date();
  const refused = makeMe.anAcceptedAttempt
    .requesting(admitted)
    .acceptedAt(acceptedAt.toISOString())
    .ended({
      kind: "failed",
      reason: "refused",
      explanation: "The first input was not accepted.",
      sessionStartKept: true,
    })
    .settledAt(acceptedAt.toISOString())
    .please();
  await keepAttempt(refused);

  const recorded = recordedRequest(admitted, acceptedAt);
  const native = {
    ...makeMe.aLaunchRecord
      .adHoc({ title: recorded.title, source: project.id })
      .inIsolatedWorkspace({ workspace: directory, branch: "follow-up" })
      .withFirstInput({ state: "uncertain" })
      .please(),
    request: recorded,
  };
  await replaceRecords((kept) => ({ ...kept, [project.id]: [native] }));

  const progress = new StartProgress();
  const { run, received } = receivingHost(project.id);
  const launch = async (request: AgentLaunchRequest) => {
    const accepted = await acceptLaunchRequest(
      owner,
      project,
      request,
      run,
      (id) => continueKeptAttempt(owner, project, id, progress, run),
      followUpInput,
    );
    await owner.drain();
    if (accepted.kind !== "accepted") {
      throw new Error(
        `Expected launch acceptance: ${JSON.stringify(accepted)}`,
      );
    }
    return accepted.attempt;
  };
  const attempts = async () =>
    (await keptAttempts())?.filter(
      ({ request }) => request.source === project.id,
    );

  return {
    attach,
    launch,
    notesFile,
    attempts,
    project,
    received,
    refused,
    start,
  };
}

test("the same words with Attach clear start separately, and the same Attach choice resumes the kept attempt", async () => {
  const { attach, launch, attempts, received, refused, start } =
    await arrangeRefusedFollowUp("Same words");

  const separate = await launch(start(false));
  const resumed = await launch(attach);

  expect(separate.id).not.toBe(refused.id);
  expect(resumed.id).toBe(refused.id);
  expect(resumed.acceptedAt).toBe(refused.acceptedAt);
  expect((await attempts())?.map(({ id }) => id)).toEqual([
    refused.id,
    separate.id,
  ]);
  expect(received.map(({ id }) => id)).toEqual([separate.id, refused.id]);
  expect(received[0]?.input).toContain("Same words");
  expect(received[0]?.input).not.toContain(note.text);
  expect(received[0]?.request).not.toHaveProperty("followUp.notes");
  expect(received[1]?.input).toContain(note.text);
});

test("retry sends the original input and admitted version after a note edit", async () => {
  const { attach, launch, notesFile, attempts, project, received, refused } =
    await arrangeRefusedFollowUp("Continue with notes");
  const original = unattachedInput(
    recordedRequest(refused.request, new Date(refused.acceptedAt)),
    undefined,
  );
  const edited = "The edited text must stay out of this attempt.";
  const changed = await storyNotes(notesFile, project.id, {
    action: "edit",
    identity: story.identity,
    id: note.id,
    text: edited,
  });
  expect(changed).toMatchObject({
    kind: "notes",
    notes: { [story.identity]: [{ id: note.id, text: edited }] },
  });

  const resumed = await launch(attach);

  expect(resumed.id).toBe(refused.id);
  expect(resumed.acceptedAt).toBe(refused.acceptedAt);
  expect((await attempts())?.map(({ id }) => id)).toEqual([refused.id]);
  expect(received).toHaveLength(1);
  expect(received[0]?.id).toBe(refused.id);
  expect(received[0]?.input).toContain(note.text);
  expect(received[0]?.input).not.toContain(edited);
  expect(received[0]?.input).toBe(original);
  expect(received[0]?.request).toHaveProperty("followUp.notes", [
    { id: note.id, version: storyNoteVersion(note) },
  ]);
});
