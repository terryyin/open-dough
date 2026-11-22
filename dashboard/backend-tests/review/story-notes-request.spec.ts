// The notes request's admission in-process: its method, its project among
// the configured ones and its change body. The store rules are the handler's
// (./story-notes.spec.ts).
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { RefusedRequest } from "../../server/localOrigin.ts";
import { admittedStoryNotesRequest } from "../../server/storyNotes.ts";
import { storyNotesEndpoint } from "../../src/storyNote.ts";

const identity = "SEED-348#collect-notes-for-story-follow-ups";
const note = makeMe.aStoryNote.please();
const valid = { identity, action: "add", text: note.text };
const admittedQuery = "?id=open-dough";

const admit = (method: string, query: string, body?: unknown) =>
  admittedStoryNotesRequest(
    {
      method,
      url: new URL(`http://local${storyNotesEndpoint}${query}`),
      body: () => Promise.resolve(body),
    },
    (project) => project === "open-dough",
  );

test("Given a configured project, when its notes are read, then the read names only the project", async () => {
  expect(await admit("GET", admittedQuery)).toEqual({ project: "open-dough" });
});

test("Given a configured project, when a note is posted, then the change is admitted for the project", async () => {
  expect(await admit("POST", admittedQuery, valid)).toEqual({
    project: "open-dough",
    change: valid,
  });
});

const refusedRequests = [
  ["POST", "?id=elsewhere", valid, 404],
  ["POST", "", valid, 400],
  ["PUT", admittedQuery, valid, 405],
  ["DELETE", admittedQuery, valid, 405],
  ["PATCH", admittedQuery, valid, 405],
  ["POST", admittedQuery, { ...valid, path: "/tmp" }, 400],
  ["POST", admittedQuery, { ...valid, extra: true }, 400],
  ["POST", admittedQuery, { ...valid, id: "caller-assigned" }, 400],
  ["POST", admittedQuery, { ...valid, savedAt: "2020-01-01T00:00:00Z" }, 400],
  ["POST", admittedQuery, { ...valid, identity: "" }, 400],
  ["POST", admittedQuery, { ...valid, action: "unknown" }, 400],
  ["POST", admittedQuery, { ...valid, text: "" }, 400],
  ["POST", admittedQuery, { ...valid, text: " \n " }, 400],
  ["POST", admittedQuery, { ...valid, text: "x".repeat(4001) }, 400],
  ["POST", admittedQuery, { ...valid, context: { path: "src/a.ts" } }, 400],
  [
    "POST",
    admittedQuery,
    { action: "delete", identity, id: note.id, text: "x" },
    400,
  ],
  ["POST", admittedQuery, [valid], 400],
] as const;

for (const [method, query, body, status] of refusedRequests)
  test(`Given a ${method} to "${query}" with ${JSON.stringify(body).slice(0, 80)}, when it is admitted, then it is refused with ${status}`, async () => {
    const refused = admit(method, query, body);

    await expect(refused).rejects.toBeInstanceOf(RefusedRequest);
    await expect(refused).rejects.toMatchObject({ status });
  });
