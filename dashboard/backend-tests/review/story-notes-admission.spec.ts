// The real HTTP boundary keeps notes in the serving machine's HOME, not a
// repository or a page. No browser; only external host/GitHub boundaries fake.
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
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  storyNotesAnswerSchema,
  storyNotesEndpoint,
  type StoryNotesAnswer,
} from "../../src/storyNote.ts";
import { stopCursorRunner } from "../../server/hosts/cursor/runnerClient.ts";
import { expect, test as base } from "../../test-support/dashboardTest.ts";
import { startDashboardServer } from "../../test-support/support/dashboardServer.ts";

const test = base.extend({
  // Own the machine through closing both servers, so restarting keeps HOME.
  // eslint-disable-next-line no-empty-pattern
  machine: async ({}, use) => {
    const machine = mkdtempSync(path.join(tmpdir(), "dough-story-notes-"));
    try {
      await use(machine);
    } finally {
      await stopCursorRunner(path.join(machine, "home"));
      rmSync(machine, { recursive: true, force: true });
    }
  },
});
test.use({
  serverMode: "boundary",
  projectFolders: ["open-dough", "doughnut"],
});
const restartTest = test.extend({ liveServer: "separate process" });
const identity = "SEED-348#collect-notes-for-story-follow-ups";
const otherIdentity = "SEED-348#attach-story-notes-to-follow-ups";
const notesFile = (home: string) =>
  path.join(home, ".open-dough/dashboard/story-notes.json");

restartTest(
  "notes are assigned ids and times, kept by project and identity, and read after a dashboard restart",
  async ({ request, dashboard, machine }) => {
    const at = (project = "open-dough") =>
      `${dashboard.baseURL}${storyNotesEndpoint}?id=${project}`;
    const headers = { Origin: dashboard.origin };
    const note = makeMe.aStoryNote
      .withText("  Keep this line's meaning.  ")
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
    const add = (text: string, story = identity) =>
      request.post(at(), {
        headers,
        data: { identity: story, action: "add", text },
      });
    const response = await request.post(at(), {
      headers,
      data: { identity, action: "add", text: note.text, context: note.context },
    });
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toBe("no-store");
    const answer = storyNotesAnswerSchema.parse(await response.json());
    if (answer.kind !== "notes") throw new Error("Expected saved notes");
    const saved = answer.notes[identity]?.[0];
    expect(saved).toEqual({
      id: expect.any(String),
      savedAt: expect.any(String),
      text: "Keep this line's meaning.",
      context: note.context,
    });
    expect(saved?.id).not.toBe(note.id);
    expect(Number.isNaN(Date.parse(saved?.savedAt ?? ""))).toBe(false);
    await add("A second observation.");
    await add("Another story's observation.", otherIdentity);
    const otherProject = await request.get(at("doughnut"), { headers });
    expect(await otherProject.json()).toEqual({ kind: "notes", notes: {} });
    const latest = await request.get(at(), { headers });
    const kept = (await latest.json()) as Extract<
      StoryNotesAnswer,
      { kind: "notes" }
    >;
    expect(kept.notes[identity]?.map(({ text }) => text)).toEqual([
      "A second observation.",
      "Keep this line's meaning.",
    ]);
    expect(kept.notes[otherIdentity]?.map(({ text }) => text)).toEqual([
      "Another story's observation.",
    ]);
    expect(JSON.parse(readFileSync(notesFile(dashboard.home), "utf8"))).toEqual(
      {
        "open-dough": kept.notes,
      },
    );

    await dashboard.close();
    const restarted = await startDashboardServer({
      mode: "boundary",
      liveServer: "separate process",
      machine,
      projectFolders: ["open-dough", "doughnut"],
      github: dashboard.github,
    });
    try {
      const reread = await request.get(
        `${restarted.baseURL}${storyNotesEndpoint}?id=open-dough`,
        { headers: { Origin: restarted.origin } },
      );
      expect(await reread.json()).toEqual(kept);
    } finally {
      await restarted.close();
    }
  },
);

test("a save refused by unwritable records keeps no note and succeeds once they are writable", async ({
  request,
  dashboard,
}) => {
  const at = `${dashboard.baseURL}${storyNotesEndpoint}?id=open-dough`;
  const headers = { Origin: dashboard.origin };
  const data = { identity, action: "add", text: "Saved once writable." };
  const file = notesFile(dashboard.home);
  mkdirSync(path.dirname(file), { recursive: true });
  chmodSync(path.dirname(file), 0o555);
  try {
    expect((await request.post(at, { headers, data })).ok()).toBe(false);
    expect(existsSync(file)).toBe(false);
  } finally {
    chmodSync(path.dirname(file), 0o755);
  }
  const saved = await request.post(at, { headers, data });
  expect(saved.ok()).toBe(true);
  const answer = storyNotesAnswerSchema.parse(await saved.json());
  if (answer.kind !== "notes") throw new Error("Expected saved notes");
  expect(answer.notes[identity]?.map(({ text }) => text)).toEqual([
    "Saved once writable.",
  ]);
});

test("misdirected or malformed notes requests keep no note", async ({
  request,
  dashboard,
}) => {
  const at = (query: string) =>
    `${dashboard.baseURL}${storyNotesEndpoint}${query}`;
  const headers = { Origin: dashboard.origin };
  const text = makeMe.aStoryNote.please().text;
  const valid = { identity, action: "add", text };
  for (const [query, body, status] of [
    ["?id=elsewhere", valid, 404],
    ["", valid, 400],
    ["?id=open-dough", { ...valid, path: "/tmp" }, 400],
    ["?id=open-dough", { ...valid, extra: true }, 400],
    ["?id=open-dough", { ...valid, id: "caller-assigned" }, 400],
    ["?id=open-dough", { ...valid, savedAt: "2020-01-01T00:00:00Z" }, 400],
    ["?id=open-dough", { ...valid, identity: "" }, 400],
    ["?id=open-dough", { ...valid, action: "unknown" }, 400],
    ["?id=open-dough", { ...valid, text: "" }, 400],
    ["?id=open-dough", { ...valid, text: " \n " }, 400],
    ["?id=open-dough", { ...valid, text: "x".repeat(4001) }, 400],
    ["?id=open-dough", { ...valid, context: { path: "src/a.ts" } }, 400],
    ["?id=open-dough", [valid], 400],
  ] as const) {
    const response = await request.post(at(query), { headers, data: body });
    expect(response.status(), JSON.stringify([query, body])).toBe(status);
  }
  const notJson = await request.post(at("?id=open-dough"), {
    headers: { ...headers, "Content-Type": "application/json" },
    data: Buffer.from("{not json"),
  });
  expect(notJson.status()).toBe(400);
  expect(await notJson.json()).toEqual({ error: "The request is not JSON." });
  for (const method of ["PUT", "DELETE", "PATCH"]) {
    const response = await request.fetch(at("?id=open-dough"), {
      method,
      headers,
      data: valid,
    });
    expect(response.status(), method).toBe(405);
  }
  const foreign = await request.post(at("?id=open-dough"), {
    headers: { Origin: "http://elsewhere.example" },
    data: valid,
  });
  expect(foreign.status()).toBe(403);
  expect(existsSync(notesFile(dashboard.home))).toBe(false);
  const empty = await request.get(at("?id=open-dough"), { headers });
  expect(await empty.json()).toEqual({ kind: "notes", notes: {} });
});

for (const [kind, bytes] of [
  ["not JSON", "{not json"],
  ["wrong shape", '{"open-dough": ["lost note"]}\n'],
] as const)
  test(`an unreadable notes file (${kind}) is reported and a save refuses without moving or changing its bytes`, async ({
    request,
    dashboard,
  }) => {
    const file = notesFile(dashboard.home);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, bytes);
    const at = `${dashboard.baseURL}${storyNotesEndpoint}?id=open-dough`;
    const headers = { Origin: dashboard.origin };
    const read = await request.get(at, { headers });
    expect(await read.json()).toEqual({ kind: "unreadable" });
    const save = await request.post(at, {
      headers,
      data: { identity, action: "add", text: makeMe.aStoryNote.please().text },
    });
    expect(save.status()).toBe(503);
    expect(await save.json()).toEqual({
      error: `Machine evidence is unreadable; writing is blocked: ${file}`,
    });
    expect(readFileSync(file, "utf8")).toBe(bytes);
    expect(
      readdirSync(path.dirname(file)).filter((name) =>
        name.startsWith("story-notes.json"),
      ),
    ).toEqual(["story-notes.json"]);
  });
