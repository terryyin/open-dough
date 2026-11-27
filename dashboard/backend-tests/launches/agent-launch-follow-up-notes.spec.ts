// Launch acceptance distinguishes Attach choices and keeps a retry's first
// input after a note edit. The native host observes the retained request.
import { expect, test } from "vitest";
import { recordedRequest } from "../../server/hostLaunch.ts";
import { storyNotes } from "../../server/storyNotes.ts";
import { unattachedInput } from "../../server/unattachedInput.ts";
import { storyNoteVersion } from "../../src/storyNote.ts";
import { arrangeRefusedFollowUp, note, story } from "./refusedNotesFollowUp.ts";

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
