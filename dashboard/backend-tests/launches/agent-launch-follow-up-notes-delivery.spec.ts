import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { LaunchAttemptOwner } from "../../server/launchAttemptOwner.ts";
import {
  keptAttempts,
  replaceAttempts,
} from "../../server/launchAttemptStore.ts";
import { replaceRecords } from "../../server/launchRecordDocument.ts";
import {
  bindRecord,
  keptSession,
  updateRecord,
} from "../../server/launchRecordStore.ts";
import { installStoryNoteDelivery } from "../../server/storyNoteDelivery.ts";
import { storyNotes } from "../../server/storyNotes.ts";
import {
  storyNoteIsWaiting,
  storyNotesFor,
  storyNoteVersion,
} from "../../src/storyNote.ts";

const story = makeMe.aDoneRecord
  .completed({
    identity: "SEED-269#recover-terminal-insert",
    title: "Recover dictation and Paste in the embedded terminal",
  })
  .please();

function arrangeFollowUp() {
  const directory = mkdtempSync(path.join(tmpdir(), "story-notes-delivery-"));
  const notesFile = path.join(directory, "story-notes.json");
  const project = makeMe.aConfiguredProject
    .with({
      id: "story-notes-delivery",
      label: "Story Notes delivery",
      repository: "terryyin/story-notes-delivery",
      localPath: directory,
    })
    .please();
  const withoutProject = <T>(kept: Record<string, T>) =>
    Object.fromEntries(
      Object.entries(kept).filter(([id]) => id !== project.id),
    );
  onTestFinished(async () => {
    try {
      await replaceRecords(withoutProject);
      await replaceAttempts(withoutProject);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  const note = makeMe.aStoryNote
    .withText("Paste still drops the last line on iPad.")
    .please();
  const version = storyNoteVersion(note);
  const document = makeMe.aStoredStoryNotesDocument
    .withNotes(project.id, story.identity, [note])
    .please();
  writeFileSync(notesFile, JSON.stringify(document));
  installStoryNoteDelivery(notesFile);

  const instruction = `Investigate Paste. ${note.text}`;
  const followUp = makeMe.aFollowUp
    .ofStory(story, "a".repeat(40))
    .attachingNotes()
    .withContext({ message: instruction })
    .withAttachedNotes([{ id: note.id, version }])
    .please();
  const request = makeMe.aLaunchRequest
    .adHoc({ source: project.id, followUp })
    .please();
  const recorded = makeMe.aLaunchRecord
    .adHoc({ title: "Follow up on Paste", source: project.id, followUp })
    .withFirstInput({ state: "confirmed", instruction })
    .please();
  const readNote = async () => {
    const answer = await storyNotes(notesFile, project.id);
    const { notes } = storyNotesFor(answer, story.identity);
    const current = notes.find(({ id }) => id === note.id);
    if (current === undefined) throw new Error(`Missing saved note ${note.id}`);
    return current;
  };
  return {
    directory,
    notesFile,
    project,
    note,
    version,
    request,
    recorded,
    readNote,
  };
}

test("a refused input leaves its note waiting until the kept attempt confirms", async () => {
  const { project, version, request, recorded, readNote } = arrangeFollowUp();
  const owner = new LaunchAttemptOwner();
  onTestFinished(() => {
    owner.close();
  });

  const refused = await owner.accept(request, () =>
    Promise.resolve({
      kind: "failed",
      reason: "refused",
      explanation: "The first input was refused.",
      sessionStartKept: true,
    }),
  );
  if (refused.kind !== "accepted") throw new Error(JSON.stringify(refused));
  await owner.drain();

  const attempt = refused.attempt.id;
  const readOutcome = async () =>
    (await keptAttempts())?.find(({ id }) => id === attempt)?.outcome;
  expect(await readOutcome()).toMatchObject({
    kind: "failed",
    reason: "refused",
  });
  expect((await readNote()).delivered).toBeUndefined();

  const resumed = await owner.continueAttempt(
    project.id,
    attempt,
    () => Promise.resolve(undefined),
    async () => {
      await bindRecord(project.id, recorded);
      return {
        kind: "launched",
        record: {
          ...recorded,
          sessionState: makeMe.aSessionState.loaded("working").please(),
        },
      };
    },
  );
  await owner.drain();

  expect(resumed, JSON.stringify(resumed)).toMatchObject({
    kind: "accepted",
    attempt: { id: attempt },
  });
  expect(await readOutcome()).toMatchObject({
    kind: "launched",
    session: {
      host: recorded.session.host,
      sessionId: recorded.session.sessionId,
    },
  });
  expect((await readNote()).delivered).toBe(version);
});

test("a newer edit stays waiting after the admitted version confirms", async () => {
  const { notesFile, project, note, version, recorded, readNote } =
    arrangeFollowUp();
  await bindRecord(project.id, {
    ...recorded,
    firstInput: { ...recorded.firstInput, state: "uncertain" },
  });
  expect((await readNote()).delivered).toBeUndefined();

  const text = "Edited after the earlier version was admitted.";
  await storyNotes(notesFile, project.id, {
    identity: story.identity,
    action: "edit",
    id: note.id,
    text,
  });
  const edited = await readNote();
  expect(edited.text).toBe(text);
  expect(storyNoteVersion(edited)).not.toBe(version);

  await updateRecord(project.id, recorded);

  expect(await keptSession(project.id, recorded.session)).toMatchObject({
    firstInput: { state: "confirmed" },
  });
  const current = await readNote();
  expect(current.text).toBe(text);
  expect(storyNoteVersion(current)).toBe(storyNoteVersion(edited));
  expect(storyNoteIsWaiting(current)).toBe(true);
});

test("a refused notes write leaves the confirmed record and the waiting note intact", async () => {
  const { directory, notesFile, project, note, version, recorded, readNote } =
    arrangeFollowUp();
  const original = readFileSync(notesFile, "utf8");

  // Atomic replacement needs to write alongside the readable notes file.
  chmodSync(directory, 0o555);
  try {
    await bindRecord(project.id, recorded);
  } finally {
    chmodSync(directory, 0o700);
  }

  expect(await keptSession(project.id, recorded.session)).toMatchObject({
    firstInput: {
      state: "confirmed",
      instruction: recorded.firstInput?.instruction,
    },
    request: { followUp: { notes: [{ id: note.id, version }] } },
  });
  expect(readFileSync(notesFile, "utf8")).toBe(original);
  expect(storyNoteIsWaiting(await readNote())).toBe(true);
});
