// A story review state request over raw HTTP through the project
// configuration boundary (../../server/projectConfigurationBoundary.ts): one
// naming an unconfigured project, naming no project, carrying a malformed
// change (a path, a missing or non-boolean state, an empty identity, text
// that is not JSON), using another method, or arriving from another site
// keeps no review state on this machine. An unreadable document reads as
// nothing reviewed, and the next save moves it aside. A session's explicit
// mark is kept beside the story's `reviewedAt`, and the story's next change
// clears it.
// Marking itself is in ../../frontend-tests/stories/recently-done-review-state-mount.spec.ts.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, expect, test } from "vitest";
import { machineDashboardPath } from "../../server/machineHome.ts";
import { installProjectConfigurationMiddleware } from "../../server/projectConfigurationBoundary.ts";
import {
  storyReviewStateEndpoint,
  storyReviewStatesAnswerSchema,
} from "../../src/storyReviewState.ts";
import {
  startInProcessBoundaryHttp,
  type InProcessBoundaryHttp,
} from "../../test-support/support/inProcessBoundaryHttp.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";
import {
  privateSettingsMachine,
  type PrivateSettingsMachine,
} from "../support/privateSettingsMachine.ts";

const isoTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const identity = "SEED-331#explain-the-ci-pause";

let machine: PrivateSettingsMachine;
let server: InProcessBoundaryHttp;
beforeEach(async () => {
  machine = privateSettingsMachine();
  server = await startInProcessBoundaryHttp(
    {
      name: "dough-project-configuration",
      install: installProjectConfigurationMiddleware,
    },
    "production",
  );
});
afterEach(async () => {
  try {
    await server.closeBoundary();
    await server.closeHttp();
  } finally {
    machine.close();
  }
});

const statesFile = () => machineDashboardPath("story-review-states.json");
const keptStates = () =>
  existsSync(statesFile())
    ? (JSON.parse(readFileSync(statesFile(), "utf8")) as Record<
        string,
        unknown
      >)
    : undefined;

async function send(
  query: string,
  { method = "POST", body }: { method?: string; body?: string } = {},
) {
  const response = await rawRequest({
    url: `${server.origin}${storyReviewStateEndpoint}${query}`,
    method,
    // A DELETE body without its length is not parsed as HTTP at all.
    headers: {
      Origin: server.origin,
      "Content-Type": "application/json",
      "Content-Length": String(Buffer.byteLength(body ?? "")),
    },
    ...(body === undefined ? {} : { body }),
  });
  return {
    status: response.status,
    cache: response.headers["cache-control"],
    answer: JSON.parse(response.body) as unknown,
  };
}

const post = async (change: object) =>
  storyReviewStatesAnswerSchema.parse(
    (await send("?id=open-dough", { body: JSON.stringify(change) })).answer,
  );

test("a review state request for an unconfigured project, a malformed change, another method or another site keeps no state", async () => {
  const malformed = { error: "The review state request is malformed." };
  const marked = JSON.stringify({ identity, reviewed: true });
  for (const [query, body, status, answer] of [
    ["?id=elsewhere", marked, 404, { error: "The project is not configured." }],
    ["", marked, 400, { error: "The review state request names one project." }],
    [
      "?id=open-dough",
      JSON.stringify({ identity, reviewed: true, path: "/tmp" }),
      400,
      malformed,
    ],
    ["?id=open-dough", JSON.stringify({ identity }), 400, malformed],
    [
      "?id=open-dough",
      JSON.stringify({ identity, reviewed: "yes" }),
      400,
      malformed,
    ],
    [
      "?id=open-dough",
      JSON.stringify({ identity: "", reviewed: true }),
      400,
      malformed,
    ],
    ["?id=open-dough", JSON.stringify([identity]), 400, malformed],
    [
      "?id=open-dough",
      JSON.stringify({ identity, session: "", reviewed: true }),
      400,
      malformed,
    ],
    ["?id=open-dough", "{not json", 400, { error: "The request is not JSON." }],
  ] as const) {
    const response = await send(query, { body });
    expect(response, JSON.stringify([query, body])).toEqual({
      status,
      cache: "no-store",
      answer,
    });
  }
  for (const method of ["PUT", "DELETE", "PATCH"])
    expect(await send("?id=open-dough", { method, body: marked })).toEqual({
      status: 405,
      cache: "no-store",
      answer: { error: "Only GET and POST are accepted." },
    });
  const foreign = await rawRequest({
    url: `${server.origin}${storyReviewStateEndpoint}?id=open-dough`,
    method: "POST",
    headers: {
      Origin: "http://elsewhere.example",
      "Content-Type": "application/json",
    },
    body: marked,
  });
  expect(foreign.status).toBe(403);
  expect(keptStates()).toBeUndefined();

  // The configured project with nothing saved reads as nothing reviewed.
  expect(await send("?id=open-dough", { method: "GET" })).toEqual({
    status: 200,
    cache: "no-store",
    answer: { stories: {} },
  });
});

// An unreadable document reads as nothing reviewed; the next save moves it
// aside as `story-review-states.json.unreadable`, keeping its bytes, and
// starts a new document.
test.each([
  ["not JSON", "{not json"],
  [
    "not the document's shape",
    `${JSON.stringify({ "open-dough": [identity] })}\n`,
  ],
])(
  "an unreadable review state document (%s) reads as nothing reviewed, and the next save keeps its bytes aside",
  async (...[, text]) => {
    mkdirSync(path.dirname(statesFile()), { recursive: true });
    writeFileSync(statesFile(), text);
    expect(await send("?id=open-dough", { method: "GET" })).toEqual({
      status: 200,
      cache: "no-store",
      answer: { stories: {} },
    });
    expect(readFileSync(statesFile(), "utf8")).toBe(text);

    const saved = await send("?id=open-dough", {
      body: JSON.stringify({ identity, reviewed: true }),
    });
    // The saved story entry is its mark time alone; no session entry is
    // needed for the story to read as marked.
    const marked = {
      stories: {
        [identity]: { reviewedAt: expect.stringMatching(isoTime) as unknown },
      },
    };
    expect(saved).toEqual({
      status: 200,
      cache: "no-store",
      answer: marked,
    });
    expect(keptStates()?.["open-dough"]).toEqual(marked.stories);
    expect(readFileSync(`${statesFile()}.unreadable`, "utf8")).toBe(text);
    expect((await send("?id=open-dough", { method: "GET" })).answer).toEqual(
      saved.answer,
    );
  },
);

test("a session's explicit unreview survives the story's covering mark until the story's next change clears it", async () => {
  const covered = await post({ identity, reviewed: true });
  const reviewedAt = covered.stories[identity]?.reviewedAt;
  const session = "claude:first-session";
  const unreviewed = {
    stories: { [identity]: { reviewedAt, sessions: { [session]: false } } },
  };
  expect(await post({ identity, session, reviewed: false })).toEqual(
    unreviewed,
  );
  expect((await send("?id=open-dough", { method: "GET" })).answer).toEqual(
    unreviewed,
  );

  expect(await post({ identity, reviewed: false })).toEqual({ stories: {} });
  expect(keptStates()?.["open-dough"]).toEqual({});
});
