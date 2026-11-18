// Real boundary server and durable store, with no parallel note representation.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  storyNotesAnswerSchema,
  storyNotesEndpoint,
} from "../../src/storyNote.ts";
import { expect, test } from "../../test-support/dashboardTest.ts";
test.use({ serverMode: "boundary", projectFolders: ["open-dough"] });
const identity = "SEED-348#collect-notes-for-story-follow-ups";
const notesFile = (home: string) =>
  path.join(home, ".open-dough/dashboard/story-notes.json");
test("edit retains id, saved time and line context; unknown ids refuse without writing; delete keeps other entries", async ({
  request,
  dashboard,
}) => {
  const at = `${dashboard.baseURL}${storyNotesEndpoint}?id=open-dough`;
  const headers = { Origin: dashboard.origin };
  const original = makeMe.aStoryNote
    .withText("Original line observation")
    .withContext({
      view: "Review changes",
      path: "src/result.ts",
      oldPath: "src/before.ts",
      comparison: {
        name: "Published completion",
        baseline: "abc123",
        tree: "def456",
      },
      line: { number: 7, side: "new", text: "return result;" },
    })
    .please();
  const added = await request.post(at, {
    headers,
    data: {
      action: "add",
      identity,
      text: original.text,
      context: original.context,
    },
  });
  const first = storyNotesAnswerSchema.parse(await added.json());
  if (first.kind !== "notes") throw new Error("Expected notes");
  const saved = first.notes[identity]?.[0];
  expect(saved).toBeDefined();
  if (!saved) throw new Error("Expected saved note");
  await request.post(at, {
    headers,
    data: { action: "add", identity, text: "Keep another entry" },
  });
  const edited = await request.post(at, {
    headers,
    data: {
      action: "edit",
      identity,
      id: saved.id,
      text: "  Revised line observation  ",
    },
  });
  expect(edited.status()).toBe(200);
  const answer = storyNotesAnswerSchema.parse(await edited.json());
  if (answer.kind !== "notes") throw new Error("Expected notes");
  expect(answer.notes[identity]?.find(({ id }) => id === saved.id)).toEqual({
    ...saved,
    text: "Revised line observation",
    editedAt: expect.any(String),
  });
  const file = notesFile(dashboard.home);
  const keptBytes = readFileSync(file, "utf8");
  for (const change of [
    { action: "edit", identity, id: original.id, text: "Unknown note" },
    { action: "delete", identity, id: original.id },
    {
      action: "edit",
      identity: "SEED-348#another-story",
      id: saved.id,
      text: "Wrong story",
    },
    { action: "delete", identity: "SEED-348#another-story", id: saved.id },
  ]) {
    const refused = await request.post(at, { headers, data: change });
    expect(refused.status()).toBe(404);
    expect(readFileSync(file, "utf8")).toBe(keptBytes);
  }
  for (const data of [
    {
      action: "edit",
      identity,
      id: saved.id,
      text: "",
      context: original.context,
    },
    {
      action: "edit",
      identity,
      id: saved.id,
      text: "Changed",
      context: original.context,
    },
    { action: "delete", identity, id: saved.id, text: "Unexpected text" },
  ]) {
    expect((await request.post(at, { headers, data })).status()).toBe(400);
    expect(readFileSync(file, "utf8")).toBe(keptBytes);
  }
  const removed = await request.post(at, {
    headers,
    data: { action: "delete", identity, id: saved.id },
  });
  expect(removed.status()).toBe(200);
  const remaining = storyNotesAnswerSchema.parse(await removed.json());
  if (remaining.kind !== "notes") throw new Error("Expected notes");
  expect(remaining.notes[identity]?.map(({ text }) => text)).toEqual([
    "Keep another entry",
  ]);
  expect(
    storyNotesAnswerSchema.parse(
      await (await request.get(at, { headers })).json(),
    ),
  ).toEqual(remaining);
  expect(JSON.parse(readFileSync(file, "utf8"))).toEqual({
    "open-dough": remaining.notes,
  });
});

test("editing a delivered note keeps delivered and assigns a new version, including unchanged text", async ({
  request,
  dashboard,
}) => {
  const at = `${dashboard.baseURL}${storyNotesEndpoint}?id=open-dough`;
  const headers = { Origin: dashboard.origin };
  const delivered = "2026-11-17T00:10:00.000Z";
  const seeded = makeMe.aStoryNote
    .withText("Delivered observation")
    .savedAt(delivered)
    .deliveredAs(delivered)
    .please();
  mkdirSync(path.dirname(notesFile(dashboard.home)), { recursive: true });
  writeFileSync(
    notesFile(dashboard.home),
    `${JSON.stringify({ "open-dough": { [identity]: [seeded] } })}\n`,
  );
  const changed = await request.post(at, {
    headers,
    data: {
      action: "edit",
      identity,
      id: seeded.id,
      text: "Delivered observation revised",
    },
  });
  expect(changed.status()).toBe(200);
  const revised = storyNotesAnswerSchema.parse(await changed.json());
  if (revised.kind !== "notes") throw new Error("Expected notes");
  const afterChange = revised.notes[identity]?.[0];
  expect(afterChange).toEqual({
    ...seeded,
    text: "Delivered observation revised",
    delivered,
    editedAt: expect.any(String),
  });
  expect(afterChange?.editedAt).not.toBe(delivered);
  const unchanged = await request.post(at, {
    headers,
    data: {
      action: "edit",
      identity,
      id: seeded.id,
      text: "Delivered observation revised",
    },
  });
  expect(unchanged.status()).toBe(200);
  const again = storyNotesAnswerSchema.parse(await unchanged.json());
  if (again.kind !== "notes") throw new Error("Expected notes");
  const afterSame = again.notes[identity]?.[0];
  expect(afterSame).toEqual({
    ...afterChange,
    delivered,
    editedAt: expect.any(String),
  });
  expect(afterSame?.editedAt).not.toBe(afterChange?.editedAt);
});
