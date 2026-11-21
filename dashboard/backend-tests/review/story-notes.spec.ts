// The typed notes handler in-process, against the machine store under a
// temporary HOME: no server.
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { storyNotes, waitingStoryNotes } from "../../server/storyNotes.ts";
import {
  storyNoteChangeSchema,
  type StoryNote,
  type StoryNotesAnswer,
} from "../../src/storyNote.ts";
import { storyNotesFile } from "../../test-support/support/storyNotesStore.ts";

const project = "open-dough";
const identity = "SEED-348#collect-notes-for-story-follow-ups";
const otherIdentity = "SEED-348#attach-story-notes-to-follow-ups";
const lineContext = {
  view: "Review changes",
  path: "src/result.ts",
  oldPath: "src/before.ts",
  comparison: {
    name: "Published completion",
    baseline: "abc123",
    tree: "def456",
  },
  line: { number: 7, side: "new", text: "return result;" },
} as const;
let home: string;
const realHome = process.env.HOME;
const notesFile = () => storyNotesFile(home);

beforeEach(() => {
  home = mkdtempSync(path.join(tmpdir(), "story-notes-"));
  process.env.HOME = home;
});
afterEach(() => {
  vi.useRealTimers();
  process.env.HOME = realHome;
  rmSync(home, { recursive: true, force: true });
});

function writeStore(bytes: string) {
  mkdirSync(path.dirname(notesFile()), { recursive: true });
  writeFileSync(notesFile(), bytes);
}
const storeNotes = (notes: StoryNote[], story = identity) => {
  writeStore(
    `${JSON.stringify(
      makeMe.aStoredStoryNotesDocument
        .withNotes(project, story, notes)
        .please(),
    )}\n`,
  );
};
const storedDocument = () =>
  JSON.parse(readFileSync(notesFile(), "utf8")) as unknown;
// A change as the shared schema admits it from the wire.
const change = (body: unknown) =>
  storyNoteChangeSchema.parse({ identity, ...(body as object) });
function notesOf(answer: StoryNotesAnswer) {
  if (answer.kind !== "notes") throw new Error(`Answered ${answer.kind}`);
  return answer.notes;
}

describe("Given notes already saved for a story", () => {
  const saved = () => [
    makeMe.aStoryNote
      .identifiedAs("34830000-0000-4000-8000-000000000002")
      .withText("Second saved")
      .please(),
    makeMe.aStoryNote
      .identifiedAs("34830000-0000-4000-8000-000000000001")
      .withText("First saved")
      .withContext(lineContext)
      .please(),
  ];
  beforeEach(() => {
    storeNotes(saved());
  });

  test("when a note is added, then it comes first with an assigned id and time, trimmed text and kept line context, and is stored", async () => {
    const notes = notesOf(
      await storyNotes(
        project,
        change({
          action: "add",
          text: "  Keep this line's meaning.  ",
          context: lineContext,
        }),
      ),
    );

    const [added, ...rest] = notes[identity] ?? [];
    expect(added).toEqual({
      id: expect.stringMatching(/^[0-9a-f-]{36}$/) as unknown,
      savedAt: expect.any(String) as unknown,
      text: "Keep this line's meaning.",
      context: lineContext,
    });
    expect(Number.isNaN(Date.parse(added?.savedAt ?? ""))).toBe(false);
    expect(rest).toEqual(saved());
    expect(storedDocument()).toEqual({ [project]: notes });
  });

  test("when notes are added to another story, then each project and identity keeps its own and they are read again from the file", async () => {
    await storyNotes(
      project,
      change({ action: "add", identity: otherIdentity, text: "Other story" }),
    );

    expect(notesOf(await storyNotes("doughnut"))).toEqual({});
    const reread = notesOf(await storyNotes(project));
    expect(reread[identity]).toEqual(saved());
    expect(reread[otherIdentity]?.map(({ text }) => text)).toEqual([
      "Other story",
    ]);
    expect(storedDocument()).toEqual({ [project]: reread });
  });

  test("when a note is edited, then only its text changes and it keeps id, saved time and line context", async () => {
    const [, first] = saved();
    const notes = notesOf(
      await storyNotes(
        project,
        change({ action: "edit", id: first?.id, text: "  Revised  " }),
      ),
    );

    expect(notes[identity]).toEqual([
      saved()[0],
      { ...first, text: "Revised", editedAt: expect.any(String) as unknown },
    ]);
    expect(storedDocument()).toEqual({ [project]: notes });
  });

  test("when an unknown or other-story note is edited or deleted, then the handler refuses it and nothing is written", async () => {
    const [, first] = saved();
    const keptBytes = readFileSync(notesFile(), "utf8");
    for (const body of [
      { action: "edit", id: makeMe.aStoryNote.please().id, text: "Unknown" },
      { action: "delete", id: makeMe.aStoryNote.please().id },
      { action: "edit", identity: otherIdentity, id: first?.id, text: "Wrong" },
      { action: "delete", identity: otherIdentity, id: first?.id },
    ]) {
      const refused = storyNotes(project, change(body));
      await expect(refused, JSON.stringify(body)).rejects.toBeInstanceOf(
        RefusedRequest,
      );
      await expect(refused).rejects.toMatchObject({ status: 404 });
      expect(readFileSync(notesFile(), "utf8")).toBe(keptBytes);
    }
  });

  test("when a note is deleted, then the other entries are kept and stored", async () => {
    const [second, first] = saved();
    const notes = notesOf(
      await storyNotes(project, change({ action: "delete", id: first?.id })),
    );

    expect(notes[identity]).toEqual([second]);
    expect(storedDocument()).toEqual({ [project]: notes });
  });
});

const savedAt = "2026-11-17T00:10:00.000Z";
const editTime = "2026-11-17T00:11:00.000Z";
test.each([
  [savedAt, editTime, "2026-11-17T00:11:00.001Z"],
  [
    "9999-12-31T23:59:59.9999Z",
    "9999-12-31T23:59:59.99991Z",
    "9999-12-31T23:59:59.999911Z",
  ],
])(
  "Given a note delivered at %s, when it is edited twice, then each edit gets a new waiting version",
  async (delivered, firstVersion, secondVersion) => {
    const note = makeMe.aStoryNote
      .savedAt(savedAt)
      .deliveredAs(delivered)
      .please();
    storeNotes([note]);
    const edited = { ...note, text: "Revised" };
    const edit = change({ action: "edit", id: note.id, text: edited.text });
    vi.useFakeTimers({ now: new Date(editTime), toFake: ["Date"] });
    const [afterChange] =
      notesOf(await storyNotes(project, edit))[identity] ?? [];
    const [afterSame] =
      notesOf(await storyNotes(project, edit))[identity] ?? [];
    expect(afterChange).toEqual({ ...edited, editedAt: firstVersion });
    expect(afterSame).toEqual({ ...edited, editedAt: secondVersion });
    expect(await waitingStoryNotes(project, identity)).toEqual([afterSame]);
  },
);

for (const [kind, bytes] of [
  ["not JSON", "{not json"],
  ["wrong shape", '{"open-dough": ["lost note"]}\n'],
] as const)
  test(`Given an unreadable notes file (${kind}), when read and then added to, then it answers unreadable, refuses the add and keeps its bytes in place`, async () => {
    writeStore(bytes);

    expect(await storyNotes(project)).toEqual({ kind: "unreadable" });
    await expect(
      storyNotes(project, change({ action: "add", text: "Refused" })),
    ).rejects.toThrow(
      `Machine evidence is unreadable; writing is blocked: ${notesFile()}`,
    );
    expect(readFileSync(notesFile(), "utf8")).toBe(bytes);
    expect(
      readdirSync(path.dirname(notesFile())).filter((name) =>
        name.startsWith("story-notes.json"),
      ),
    ).toEqual(["story-notes.json"]);
  });

test("Given an unwritable store, when a note is added, then it is refused without a note and accepted once the store is writable", async () => {
  const add = change({ action: "add", text: "Saved once writable." });
  mkdirSync(path.dirname(notesFile()), { recursive: true });
  chmodSync(path.dirname(notesFile()), 0o555);
  try {
    await expect(storyNotes(project, add)).rejects.toThrow();
    expect(existsSync(notesFile())).toBe(false);
  } finally {
    chmodSync(path.dirname(notesFile()), 0o755);
  }

  const notes = notesOf(await storyNotes(project, add));
  expect(notes[identity]?.map(({ text }) => text)).toEqual([
    "Saved once writable.",
  ]);
});
