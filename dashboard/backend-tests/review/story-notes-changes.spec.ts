// Real boundary server and durable store, with no parallel note representation.
import { readFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  storyNotesAnswerSchema,
  storyNotesEndpoint,
} from "../../src/storyNote.ts";
import { expect, test } from "../../tests/dashboardTest.ts";
test.use({ serverMode: "boundary", projectFolders: ["open-dough"] });
const identity = "SEED-348#collect-notes-for-story-follow-ups";
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
  const file = path.join(
    dashboard.home,
    ".open-dough/dashboard/story-notes.json",
  );
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
