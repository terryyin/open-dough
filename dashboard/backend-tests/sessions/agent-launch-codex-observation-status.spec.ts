// Native provenance and isolation through the recorded-target read.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { codexHost } from "../../server/codexHost.ts";
import { codexSessions } from "../../server/hosts/codex/sessions.ts";
import { parsedListing } from "../../server/hosts/claude/listing.ts";
import { claudeObservations } from "../../server/hosts/claude/runtime.ts";
import {
  keptRecords,
  machineRecordStore,
} from "../../server/launchRecordStore.ts";
import { withStates, type HostSessions } from "../../server/launchStates.ts";
import { machineFolder } from "../../server/localFolder.ts";
import {
  codexEndpoint,
  type FakeCodexObservation,
} from "../../test-support/support/fakeCodex.ts";
import { expectPassiveCodexReads } from "../../test-support/support/codexPassiveProtocol.ts";
import {
  codexRecord,
  startNativeCodexEndpoint,
  privateHome,
  source,
  story,
} from "../support/codexObservationFixture.ts";

const retainedReview = {
  kind: "available",
  availability: "retained",
  activity: "review",
};
const loadedWorking = {
  kind: "available",
  availability: "loaded",
  activity: "working",
};
const unknown = { kind: "unknown" };

test("read variants preserve native provenance and require exact missing-target evidence", async () => {
  const native = await startNativeCodexEndpoint(privateHome());
  const idle = { status: { type: "idle" }, turns: [] };
  const replies: Record<string, FakeCodexObservation> = {
    "system-error": { status: { type: "systemError" }, turns: [] },
    "in-progress": {
      ...idle,
      turns: [{ id: "working", status: "inProgress" }],
    },
    "future-turn": {
      ...idle,
      turns: [{ id: "future", status: "futureTurnStatus" }],
    },
    "future-flag": {
      status: { type: "active", activeFlags: ["futureFlag"] },
      turns: [],
    },
    "absent-flags": { status: { type: "active" }, turns: [] },
    "wrong-code": {
      ...idle,
      metadataError: { code: -32000, message: "thread not loaded: wrong-code" },
    },
    "wrong-target": {
      ...idle,
      metadataError: { code: -32600, message: "thread not loaded: another-id" },
    },
    missing: {
      ...idle,
      metadataError: { code: -32600, message: "thread not loaded: missing" },
    },
  };
  for (const [id, reply] of Object.entries(replies)) {
    native.observations.set(id, reply);
  }
  const records = [...native.observations.keys()].map((id) =>
    codexRecord(id, codexEndpoint(native)),
  );
  const observed = await codexSessions(records, new AbortController().signal);

  expect(observed.map(({ sessionState }) => sessionState)).toEqual([
    { kind: "available", availability: "loaded", activity: "failed" },
    loadedWorking,
    {
      kind: "available",
      availability: "loaded",
      activity: "unknown",
      description: "Codex reported native turn status: futureTurnStatus",
      unknownReason: "unrecognized",
    },
    {
      kind: "available",
      availability: "loaded",
      activity: "unknown",
      description: "Codex reported an unrecognized active status",
      unknownReason: "unrecognized",
    },
    {
      kind: "available",
      availability: "loaded",
      activity: "unknown",
      description: "Codex did not report active status flags",
      unknownReason: "incomplete",
    },
    unknown,
    unknown,
    { kind: "unavailable" },
  ]);
  expectPassiveCodexReads(native.calls, expect);
});

test("endpoint and read failures preserve healthy hosts and every kept session", async () => {
  const home = privateHome();
  const native = await startNativeCodexEndpoint(home);
  const endpoint = codexEndpoint(native);
  const review = {
    status: { type: "notLoaded" },
    turns: [{ id: "completed-turn", status: "completed" }],
  };
  native.observations.set("healthy", review);
  native.observations.set("bad-endpoint", review);
  native.observations.set("refused", {
    status: { type: "idle" },
    turns: [],
    metadataError: { code: -32600, message: "Native read refused" },
  });
  const claude = makeMe.aLaunchRecord
    .refining(story)
    .inClaudeSession({ sessionId: "claude-session" })
    .please();
  await machineRecordStore.replaceRecords(() => ({
    [source]: [
      claude,
      codexRecord("healthy", endpoint),
      codexRecord("refused", endpoint),
      codexRecord("bad-endpoint", `unix://${home}/absent.sock`),
      codexRecord("legacy-no-endpoint"),
    ],
  }));
  const kept = await keptRecords(source);
  expect(kept).toHaveLength(5);
  const listing = parsedListing(
    JSON.stringify([
      makeMe.aClaudeListingRow
        .background({
          sessionId: claude.session.sessionId,
          name: story.title,
          startedAt: 0,
        })
        .as("working")
        .please(),
    ]),
  );
  const hosts: HostSessions = (host) =>
    host === "codex"
      ? codexHost.sessions
      : (targets) => Promise.resolve(claudeObservations(targets, listing));

  const observed = await withStates(machineFolder(), kept, "on-demand", hosts);

  expect(
    observed.map(({ session, sessionState }) => [
      session.sessionId,
      sessionState,
    ]),
  ).toEqual([
    ["claude-session", loadedWorking],
    ["healthy", retainedReview],
    ["refused", unknown],
    ["bad-endpoint", unknown],
    ["legacy-no-endpoint", unknown],
  ]);
  expect(await keptRecords(source)).toEqual(kept);
  expectPassiveCodexReads(native.calls, expect);
});
