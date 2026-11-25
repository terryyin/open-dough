// The launch boundary joins kept sessions from every project with a single
// Claude Code listing, translated from the synthetic `claude agents` output.
// Reading activity changes no kept record, and an empty store requires no
// native listing.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { ClaudeListingAppearance } from "../../../Distribution/tests/support/claudeListingTestData.mjs";
import type { LaunchRecord } from "../../src/agentLaunch.ts";
import { parsedListing } from "../../server/hosts/claude/listing.ts";
import { claudeObservations } from "../../server/hosts/claude/runtime.ts";
import { withStates, type HostSessions } from "../../server/launchStates.ts";
import { localFolder } from "../../server/localFolder.ts";

const machine = localFolder("/machine");
const startedAt = Date.parse("2026-11-25T09:00:00Z");
const working = {
  kind: "available",
  availability: "loaded",
  activity: "working",
};

function keptSession(sessionId: string, source = "open-dough"): LaunchRecord {
  return makeMe.aLaunchRecord
    .executing({ identity: `SEED-001#${sessionId}`, title: sessionId, source })
    .inClaudeSession({ sessionId })
    .please();
}

function listed(sessionId: string, appearance: ClaudeListingAppearance) {
  return makeMe.aClaudeListingRow
    .background({ sessionId, name: sessionId, startedAt })
    .as(appearance);
}

// Claude Code as the read reaches it: each listing printed as the synthetic
// `claude` prints it, or none when the listing fails, and the folders it
// listed in.
function claudeListing(initial: readonly object[]) {
  let printed: string | undefined = JSON.stringify(initial);
  const listedIn: string[] = [];
  const hostSessions: HostSessions = (host) =>
    host === "claude"
      ? (records, folder) => {
          listedIn.push(folder.path);
          return Promise.resolve(
            claudeObservations(
              records,
              printed === undefined ? undefined : parsedListing(printed),
            ),
          );
        }
      : undefined;
  return {
    listedIn,
    prints(rows: readonly object[] | undefined) {
      printed = rows === undefined ? undefined : JSON.stringify(rows);
    },
    read(records: readonly LaunchRecord[]) {
      return withStates(machine, records, "on-demand", hostSessions);
    },
    async statesOf(records: readonly LaunchRecord[]) {
      return (await this.read(records)).map(({ sessionState }) => sessionState);
    },
  };
}

test("answers no records and lists no sessions while none are kept", async () => {
  const claude = claudeListing([]);

  expect(await claude.statesOf([])).toEqual([]);
  expect(claude.listedIn).toEqual([]);
});

test("answers each session as Claude Code lists it: working busy or idle, blocked with what it waits for when it says, done running or exited, failed, stopped, or no longer listed, keeping none of it", async () => {
  const appearances = [
    ["working", listed("working", "working")],
    ["working-idle", listed("working-idle", "working-idle")],
    ["blocked", listed("blocked", "blocked")],
    [
      "blocked-why",
      listed("blocked-why", "blocked").waitingFor("permission to run npm test"),
    ],
    ["done-live", listed("done-live", "done-live")],
    ["done-exited", listed("done-exited", "done-exited")],
    ["failed", listed("failed", "failed")],
    ["stopped", listed("stopped", "stopped")],
  ] as const;
  const records = [
    ...appearances.map(([sessionId]) => keptSession(sessionId)),
    keptSession("forgotten"),
  ];
  const kept = structuredClone(records);
  const claude = claudeListing(appearances.map(([, row]) => row.please()));

  expect(await claude.statesOf(records)).toEqual([
    working,
    working,
    { kind: "available", availability: "loaded", activity: "waiting" },
    {
      kind: "available",
      availability: "loaded",
      activity: "waiting",
      waitingFor: "permission to run npm test",
    },
    { kind: "available", availability: "loaded", activity: "review" },
    { kind: "available", availability: "retained", activity: "review" },
    { kind: "available", availability: "retained", activity: "failed" },
    { kind: "available", availability: "retained", activity: "interrupted" },
    { kind: "unavailable" },
  ]);
  expect(records).toEqual(kept);
});

test("answers each session as listed while Claude Code also lists an interactive session", async () => {
  const claude = claudeListing([
    listed("listed", "working").please(),
    makeMe.aClaudeListingRow
      .interactive({
        sessionId: "interactive",
        name: "interactive",
        cwd: "/elsewhere",
        startedAt,
      })
      .please(),
  ]);

  expect(await claude.statesOf([keptSession("listed")])).toEqual([working]);
});

test("answers a resumed session without the reason it waited for", async () => {
  const records = [keptSession("resumed")];
  const claude = claudeListing([
    listed("resumed", "blocked").waitingFor("input needed").please(),
  ]);
  expect(await claude.statesOf(records)).toEqual([
    {
      kind: "available",
      availability: "loaded",
      activity: "waiting",
      waitingFor: "input needed",
    },
  ]);

  claude.prints([listed("resumed", "working").please()]);
  expect(await claude.statesOf(records)).toEqual([working]);
});

test("answers every session unknown while the listing fails, and as listed once it answers again", async () => {
  const records = [keptSession("listed"), keptSession("other")];
  const rows = [
    listed("listed", "working").please(),
    listed("other", "working").please(),
  ];
  const claude = claudeListing(rows);

  claude.prints(undefined);
  expect(await claude.statesOf(records)).toEqual([
    { kind: "unknown" },
    { kind: "unknown" },
  ]);

  claude.prints(rows);
  expect(await claude.statesOf(records)).toEqual([working, working]);
});

test("answers every project's records, each naming its project, from one listing", async () => {
  const records = [
    keptSession("open-dough-session"),
    keptSession("pygardon-session", "pygardon"),
  ];
  const claude = claudeListing([
    listed("open-dough-session", "working").please(),
    listed("pygardon-session", "working").please(),
  ]);

  const joined = await claude.read(records);
  expect(
    joined.map(
      ({ request: { source }, session: { sessionId }, sessionState }) => ({
        source,
        sessionId,
        sessionState,
      }),
    ),
  ).toEqual([
    {
      source: "open-dough",
      sessionId: "open-dough-session",
      sessionState: working,
    },
    {
      source: "pygardon",
      sessionId: "pygardon-session",
      sessionState: working,
    },
  ]);
  expect(claude.listedIn).toEqual([machine.path]);
});
