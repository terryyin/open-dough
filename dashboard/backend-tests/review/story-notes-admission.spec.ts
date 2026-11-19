// The notes wire alone: method, project admission, body parsing, origin,
// caching and the status of the handler's refusals. The store rules are
// proven in-process (`story-notes.unit.spec.ts`).
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { storyNotesEndpoint } from "../../src/storyNote.ts";
import { expect, test } from "../../test-support/dashboardTest.ts";
import { storyNotesFile } from "../../test-support/support/storyNotesStore.ts";

test.use({ serverMode: "boundary", projectFolders: ["open-dough"] });
const identity = "SEED-348#collect-notes-for-story-follow-ups";
const note = makeMe.aStoryNote.please();
const valid = { identity, action: "add", text: note.text };
const admitted = "?id=open-dough";
const refusedRequests = [
  ["?id=elsewhere", valid, 404],
  ["", valid, 400],
  [admitted, { ...valid, path: "/tmp" }, 400],
  [admitted, { ...valid, extra: true }, 400],
  [admitted, { ...valid, id: "caller-assigned" }, 400],
  [admitted, { ...valid, savedAt: "2020-01-01T00:00:00Z" }, 400],
  [admitted, { ...valid, identity: "" }, 400],
  [admitted, { ...valid, action: "unknown" }, 400],
  [admitted, { ...valid, text: "" }, 400],
  [admitted, { ...valid, text: " \n " }, 400],
  [admitted, { ...valid, text: "x".repeat(4001) }, 400],
  [admitted, { ...valid, context: { path: "src/a.ts" } }, 400],
  [admitted, { action: "delete", identity, id: note.id, text: "x" }, 400],
  [admitted, [valid], 400],
] as const;

test("Given a started dashboard, when notes requests are misdirected, malformed or foreign, then the wire refuses them, keeps no note and maps the store's refusals", async ({
  request,
  dashboard,
}) => {
  const at = (query: string) =>
    `${dashboard.baseURL}${storyNotesEndpoint}${query}`;
  const post = (query: string, data: unknown, origin = dashboard.origin) =>
    request.post(at(query), { headers: { Origin: origin }, data });
  const notesFile = storyNotesFile(dashboard.home);

  await test.step("When misdirected or malformed changes are posted, then each is refused with its status", async () => {
    for (const [query, body, status] of refusedRequests)
      expect(
        (await post(query, body)).status(),
        JSON.stringify([query, body]),
      ).toBe(status);
  });
  await test.step("When a body is not JSON, then it is refused as not JSON", async () => {
    const notJson = await request.post(at(admitted), {
      headers: { Origin: dashboard.origin, "Content-Type": "application/json" },
      data: Buffer.from("{not json"),
    });
    expect(notJson.status()).toBe(400);
    expect(await notJson.json()).toEqual({ error: "The request is not JSON." });
  });
  await test.step("When another method is used, then it is not allowed", async () => {
    const headers = { Origin: dashboard.origin };
    for (const method of ["PUT", "DELETE", "PATCH"]) {
      const response = await request.fetch(at(admitted), {
        method,
        headers,
        data: valid,
      });
      expect(response.status(), method).toBe(405);
    }
  });
  await test.step("When a foreign origin posts a note, then it is forbidden", async () => {
    const foreign = await post(admitted, valid, "http://elsewhere.example");
    expect(foreign.status()).toBe(403);
  });
  await test.step("When an unknown note is edited, then it is not found", async () => {
    const edit = { action: "edit", identity, id: note.id, text: "x" };
    expect((await post(admitted, edit)).status()).toBe(404);
  });
  await test.step("Then no notes file was written", () => {
    expect(existsSync(notesFile)).toBe(false);
  });
  await test.step("And a read answers no notes without caching", async () => {
    const empty = await request.get(at(admitted), {
      headers: { Origin: dashboard.origin },
    });
    expect(empty.headers()["cache-control"]).toBe("no-store");
    expect(await empty.json()).toEqual({ kind: "notes", notes: {} });
  });
  await test.step("Given an unreadable notes file", () => {
    mkdirSync(path.dirname(notesFile), { recursive: true });
    writeFileSync(notesFile, "{not json");
  });
  await test.step("When a note is posted, then it is refused as unavailable naming the file", async () => {
    const unreadable = await post(admitted, valid);
    expect(unreadable.status()).toBe(503);
    expect(await unreadable.json()).toEqual({
      error: `Machine evidence is unreadable; writing is blocked: ${notesFile}`,
    });
  });
});
