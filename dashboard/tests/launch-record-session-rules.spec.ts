// Per-host native identity and continuation rules, at both the session and
// durable launch-record boundaries. Native attach, done and recovery journeys
// remain in their host specs.
import { expect, test } from "./support/pageTest.ts";
import { hostSessionSchema, launchRecordSchema } from "../src/launchRecord.ts";

const claude = {
  host: "claude",
  sessionId: "claude-conversation",
  shortId: "a1b2",
  name: "Claude conversation",
};
const continuation = {
  workspace: "/project",
  endpoint: "ws://127.0.0.1:4321",
  args: ["codex", "resume", "codex-conversation"],
  notice: "Native observation ended.",
};
const codex = {
  host: "codex",
  sessionId: "codex-conversation",
  name: "Codex conversation",
};
const record = (session: unknown) => ({
  request: {
    source: "open-dough",
    identity: "SEED-001#story",
    title: "A story",
    workflow: "execution",
    host: "codex",
  },
  session,
  launchedAt: "2026-10-01T00:00:00.000Z",
});
const parsedSessions = (session: unknown) => [
  hostSessionSchema.parse(session),
  launchRecordSchema.parse(record(session)).session,
];
const refused = (session: unknown) => {
  expect(hostSessionSchema.safeParse(session).success).toBe(false);
  expect(launchRecordSchema.safeParse(record(session)).success).toBe(false);
};

test("accepts a Claude session with its native alias", () => {
  for (const session of parsedSessions(claude)) {
    expect(session).toEqual(claude);
  }
});

test("refuses a Claude session without its native alias", () => {
  const withoutAlias: Partial<typeof claude> = { ...claude };
  delete withoutAlias.shortId;
  refused(withoutAlias);
});

test("accepts a Codex continuation with its endpoint and workspace", () => {
  for (const session of parsedSessions({ ...codex, continuation })) {
    expect(session).toEqual({ ...codex, continuation });
  }
});

test("accepts a predecessor Codex session without a continuation", () => {
  for (const session of parsedSessions(codex)) {
    expect(session).toEqual(codex);
  }
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
