// A story review state request over raw HTTP: one naming an unconfigured
// project, naming no project, carrying a malformed change (a path, a missing
// or non-boolean state, an empty identity, text that is not JSON), or using
// another method keeps no review state on this machine. An unreadable
// document reads as nothing reviewed, and the next save moves it aside. A
// session's explicit mark is kept beside the story's `reviewedAt`, and the
// story's next change clears it.
// Marking itself is in ../../frontend-tests/stories/recently-done-review-state-mount.spec.ts.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  storyReviewStateEndpoint,
  storyReviewStatesAnswerSchema,
} from "../../src/storyReviewState.ts";
import { expect, test } from "../../test-support/dashboardTest.ts";
import {
  keptReviewStates,
  reviewStatesFile,
} from "../../test-support/recentlyDoneReviewState.ts";

const isoTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

// No page: the local boundaries alone answer these requests.
test.use({ serverMode: "boundary", projectFolders: ["open-dough"] });

const identity = "SEED-331#explain-the-ci-pause";

test("a review state request for an unconfigured project, a malformed change, or another method keeps no state", async ({
  request,
  dashboard,
}) => {
  const at = (query: string) =>
    `${dashboard.baseURL}${storyReviewStateEndpoint}${query}`;
  const headers = { Origin: dashboard.origin };
  const malformed = { error: "The review state request is malformed." };
  for (const [query, body, status, answer] of [
    [
      "?id=elsewhere",
      { identity, reviewed: true },
      404,
      { error: "The project is not configured." },
    ],
    [
      "",
      { identity, reviewed: true },
      400,
      { error: "The review state request names one project." },
    ],
    [
      "?id=open-dough",
      { identity, reviewed: true, path: "/tmp" },
      400,
      malformed,
    ],
    ["?id=open-dough", { identity }, 400, malformed],
    ["?id=open-dough", { identity, reviewed: "yes" }, 400, malformed],
    ["?id=open-dough", { identity: "", reviewed: true }, 400, malformed],
    ["?id=open-dough", [identity], 400, malformed],
    [
      "?id=open-dough",
      { identity, session: "", reviewed: true },
      400,
      malformed,
    ],
  ] as const) {
    const response = await request.post(at(query), { headers, data: body });
    expect(response.status(), JSON.stringify([query, body])).toBe(status);
    expect(await response.json()).toEqual(answer);
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
      data: { identity, reviewed: true },
    });
    expect(response.status(), method).toBe(405);
    expect(await response.json()).toEqual({
      error: "Only GET and POST are accepted.",
    });
  }
  const foreign = await request.post(at("?id=open-dough"), {
    headers: { Origin: "http://elsewhere.example" },
    data: { identity, reviewed: true },
  });
  expect(foreign.status()).toBe(403);
  expect(keptReviewStates(dashboard)).toBeUndefined();

  // The configured project with nothing saved reads as nothing reviewed.
  const read = await request.get(at("?id=open-dough"), { headers });
  expect(read.status()).toBe(200);
  expect(read.headers()["cache-control"]).toBe("no-store");
  expect(await read.json()).toEqual({ stories: {} });
});

// An unreadable document reads as nothing reviewed; the next save moves it
// aside as `story-review-states.json.unreadable`, keeping its bytes, and
// starts a new document.
for (const [kind, text] of [
  ["not JSON", "{not json"],
  [
    "not the document's shape",
    `${JSON.stringify({ "open-dough": [identity] })}\n`,
  ],
] as const)
  test(`an unreadable review state document (${kind}) reads as nothing reviewed, and the next save keeps its bytes aside`, async ({
    request,
    dashboard,
  }) => {
    const file = reviewStatesFile(dashboard);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, text);
    const at = `${dashboard.baseURL}${storyReviewStateEndpoint}?id=open-dough`;
    const headers = { Origin: dashboard.origin };
    const read = await request.get(at, { headers });
    expect(read.status()).toBe(200);
    expect(await read.json()).toEqual({ stories: {} });
    expect(readFileSync(file, "utf8")).toBe(text);

    const saved = await request.post(at, {
      headers,
      data: { identity, reviewed: true },
    });
    expect(saved.status()).toBe(200);
    // The saved story entry is its mark time alone; no session entry is
    // needed for the story to read as marked.
    const marked = {
      stories: { [identity]: { reviewedAt: expect.stringMatching(isoTime) } },
    };
    expect(await saved.json()).toEqual(marked);
    expect(keptReviewStates(dashboard)?.["open-dough"]).toEqual(marked.stories);
    expect(readFileSync(`${file}.unreadable`, "utf8")).toBe(text);
    const reread = await request.get(at, { headers });
    expect(await reread.json()).toEqual(await saved.json());
  });

test("a session's explicit unreview survives the story's covering mark until the story's next change clears it", async ({
  request,
  dashboard,
}) => {
  const at = `${dashboard.baseURL}${storyReviewStateEndpoint}?id=open-dough`;
  const headers = { Origin: dashboard.origin };
  const post = async (data: object) =>
    storyReviewStatesAnswerSchema.parse(
      await (await request.post(at, { headers, data })).json(),
    );
  const covered = await post({ identity, reviewed: true });
  const reviewedAt = covered.stories[identity]?.reviewedAt;
  const session = "claude:first-session";
  const unreviewed = {
    stories: { [identity]: { reviewedAt, sessions: { [session]: false } } },
  };
  expect(await post({ identity, session, reviewed: false })).toEqual(
    unreviewed,
  );
  expect(await (await request.get(at, { headers })).json()).toEqual(unreviewed);

  expect(await post({ identity, reviewed: false })).toEqual({ stories: {} });
  expect(keptReviewStates(dashboard)?.["open-dough"]).toEqual({});
});
