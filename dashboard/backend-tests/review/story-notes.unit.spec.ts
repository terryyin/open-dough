// The typed notes handler in-process, against the machine store under a
// temporary HOME: no server.
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyNotes } from "../../server/storyNotes.ts";
import type { StoryNote } from "../../src/storyNote.ts";
import {
  seedStoryNotes,
  storyNotesFile,
} from "../../test-support/support/storyNotesStore.ts";

const identity = "SEED-348#collect-notes-for-story-follow-ups";
let home: string;
const realHome = process.env.HOME;

beforeEach(() => {
  home = mkdtempSync(path.join(tmpdir(), "story-notes-unit-"));
  process.env.HOME = home;
});
afterEach(() => {
  process.env.HOME = realHome;
  rmSync(home, { recursive: true, force: true });
});

test("adding a note answers it first with an assigned id and time and stores all three", async () => {
  const saved = [
    makeMe.aStoryNote
      .identifiedAs("34830000-0000-4000-8000-000000000002")
      .withText("Second saved")
      .please(),
    makeMe.aStoryNote
      .identifiedAs("34830000-0000-4000-8000-000000000001")
      .withText("First saved")
      .please(),
  ];
  seedStoryNotes(home, { [identity]: saved });

  const answer = await storyNotes("open-dough", {
    action: "add",
    identity,
    text: "Newly added",
  });

  if (answer.kind !== "notes") throw new Error(`Answered ${answer.kind}`);
  const [added, ...rest] = answer.notes[identity] ?? [];
  expect(added?.text).toBe("Newly added");
  expect(added?.id).toMatch(/^[0-9a-f-]{36}$/);
  expect(Number.isNaN(Date.parse(added?.savedAt ?? ""))).toBe(false);
  expect(rest).toEqual(saved);
  const stored = JSON.parse(
    readFileSync(storyNotesFile(home), "utf8"),
  ) as Record<string, Record<string, StoryNote[]>>;
  expect(stored["open-dough"]?.[identity]).toEqual(answer.notes[identity]);
});
