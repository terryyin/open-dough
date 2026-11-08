// Per-host native identity and continuation rules, at both the session and
// durable launch-record boundaries. Native attach, done and recovery journeys
// remain in their host specs.
import { expect, test } from "../../tests/support/pageTest.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import {
  hostSessionSchema,
  launchRecordSchema,
} from "../../src/launchRecord.ts";
import { defaultMainSession } from "../../tests/support/startSessionLanding.ts";

const claude = makeMe.aHostSession
  .claude({ sessionId: "claude-conversation", shortId: "a1b2" })
  .named("Claude conversation")
  .please();
const savedCodex = makeMe.aHostSession
  .codex({
    sessionId: "codex-conversation",
    continuation: {
      workspace: "/project",
      endpoint: "ws://127.0.0.1:4321",
      notice: "Native observation ended.",
    },
  })
  .named("Codex conversation")
  .please();
const { continuation } = savedCodex;
// A predecessor Codex session, kept before its continuation was saved.
const codex = {
  host: "codex" as const,
  sessionId: "codex-conversation",
  name: "Codex conversation",
};
// A story's execution kept by each host, in that host's session.
const story = { identity: "SEED-001#story", title: "A story" };
const keptBy = {
  claude: makeMe.aLaunchRecord
    .executing(story)
    .inClaudeSession(claude)
    .please(),
  codex: makeMe.aLaunchRecord.executing(story).inCodexSession(codex).please(),
};
// The record of the session's own host, holding the session exactly as given.
type GivenSession = {
  readonly host: keyof typeof keptBy;
  readonly [field: string]: unknown;
};
const record = (session: GivenSession) => ({
  ...keptBy[session.host],
  session,
});
const parsedSessions = (session: GivenSession) => [
  hostSessionSchema.parse(session),
  launchRecordSchema.parse(record(session)).session,
];
const refused = (session: GivenSession) => {
  expect(hostSessionSchema.safeParse(session).success).toBe(false);
  expect(launchRecordSchema.safeParse(record(session)).success).toBe(false);
};

test("accepts a Claude session with its native alias", () => {
  for (const session of parsedSessions(claude)) {
    expect(session).toEqual(claude);
  }
});

test("refuses a Claude session without its native alias", () => {
  const withoutAlias: Partial<typeof claude> & GivenSession = { ...claude };
  delete withoutAlias.shortId;
  refused(withoutAlias);
});

test("accepts a Codex continuation with its endpoint and workspace", () => {
  for (const session of parsedSessions(savedCodex)) {
    expect(session).toEqual(savedCodex);
  }
});

test("accepts a predecessor Codex session without a continuation", () => {
  for (const session of parsedSessions(codex)) {
    expect(session).toEqual(codex);
  }
});

test("accepts an older launch record's established session without retaining its unread creation fact", () => {
  const established = defaultMainSession("/project", "auto-land", "revision");
  const kept = makeMe.aLaunchRecord
    .adHoc({ title: "A session" })
    .inCodexSession(codex)
    .inDefaultCheckout({
      workspace: "/project",
      landing: "auto-land",
      revision: "revision",
    })
    .please();
  const parsed = launchRecordSchema.parse({
    ...kept,
    establishedSession: { ...kept.establishedSession, created: false },
  });
  expect(parsed.establishedSession).toEqual(established);
  expect(parsed.establishedSession).not.toHaveProperty("created");
});

test("refuses a Codex continuation without its endpoint", () => {
  const withoutEndpoint: Partial<typeof continuation> = { ...continuation };
  delete withoutEndpoint.endpoint;
  refused({ ...codex, continuation: withoutEndpoint });
});

test("a parsed Claude session carries no Codex continuation", () => {
  for (const session of parsedSessions({ ...claude, continuation })) {
    expect(session).toEqual(claude);
    expect(session).not.toHaveProperty("continuation");
  }
});

test("a parsed Codex session carries no Claude alias", () => {
  for (const session of parsedSessions({ ...codex, shortId: "a1b2" })) {
    expect(session).toEqual(codex);
    expect(session).not.toHaveProperty("shortId");
  }
});
