// The story's example 5 at its scale: with 1,000 retained done sessions and
// five open ones, the regular sessions answer holds the open sessions in full
// and each done session only as its listing facts -- the whole entry except
// the launch's reporting handoff, the first input's text, and the landing
// evidence -- while a history ask answers every done session in full
// (../../src/sessionListing.ts,
// ../../server/machineSessionsFragments.ts). The machine state is the
// Sessions replay's (../../tests/support/sessionsReplaySeed.ts).

import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  launchRecordsSchema,
  type LaunchRecord,
} from "../../src/agentLaunch.ts";
import { sessionsHistoryReadSchema } from "../../src/machineSessionsRevision.ts";
import { withRetainedDetail } from "../../src/sessionListing.ts";
import { startDashboardServer } from "../../tests/support/dashboardServer.ts";
import { installFakeCodex } from "../../tests/support/fakeCodex.ts";
import {
  followUpContextOf,
  followUpOf,
  quietSession,
  quietTitle,
} from "../../tests/support/followUpSources.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  replayProjectIds,
  seedReplayProjects,
} from "../../tests/support/sessionsReplayProjects.ts";
import { seedReplaySessions } from "../../tests/support/sessionsReplaySeed.ts";
import {
  type AnsweredEntry,
  withoutRetainedDetail,
} from "../../tests/support/retainedDetail.ts";
import { askSessions } from "../../tests/support/sessionsReplayMeasures.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";

const entriesOf = (body: string) =>
  new Map(
    (JSON.parse(body) as { records: AnsweredEntry[] }).records.map((entry) => [
      entry.session.sessionId,
      entry,
    ]),
  );

// The detail a seeded record holds, as the four parts the overview leaves out.
const detailOf = (record: LaunchRecord | AnsweredEntry) => ({
  reporting: (record.request as { reporting?: unknown }).reporting,
  instruction: (record.firstInput as { instruction?: unknown } | undefined)
    ?.instruction,
  landing: (record as { landing?: unknown }).landing,
  landingReporting: (record as { landingReporting?: unknown }).landingReporting,
});

test("the regular answer lists 1,000 done sessions by their listing facts beside five open ones in full; the history answers them in full", async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-sessions-listing-"));
  const codex = await installFakeCodex(
    machine,
    process.env["PATH"] ?? "",
    true,
  );
  seedReplayProjects(path.join(machine, "home"));
  const seed = seedReplaySessions(machine, codex);
  const server = await startDashboardServer({
    mode: "boundary",
    machine,
    projectFolders: replayProjectIds,
    codexProtocol: codex,
  });
  try {
    const seeded = new Map(
      seed.records.map((record) => [record.session.sessionId, record]),
    );
    const regular = entriesOf((await askSessions(server)).body);
    const history = entriesOf(
      (await askSessions(server, undefined, true)).body,
    );
    const open = [...regular.values()].filter(
      ({ doneAt }) => doneAt === undefined,
    );
    const done = [...regular.values()].filter(
      ({ doneAt }) => doneAt !== undefined,
    );
    expect(open.map(({ session }) => session.sessionId).toSorted()).toEqual(
      seed.openSessions.toSorted(),
    );
    expect(done).toHaveLength(1_000);
    expect(history.size).toBe(1_000);

    // Open sessions in full: their reporting handoff and first input's text.
    for (const entry of open) {
      const record = seeded.get(entry.session.sessionId);
      if (record === undefined) throw new Error("An unseeded open session");
      const detail = detailOf(entry);
      expect(detail.reporting).toEqual(record.request.reporting);
      expect(detail.instruction).toEqual(record.firstInput?.instruction);
    }

    // Done sessions: the history's full entry less exactly those four parts,
    // which the seed gives every done record and the history keeps.
    for (const entry of done) {
      const { sessionId } = entry.session;
      const full = history.get(sessionId);
      const record = seeded.get(sessionId);
      if (full === undefined || record === undefined)
        throw new Error(`No full entry for ${sessionId}`);
      expect(JSON.stringify(entry)).toBe(
        JSON.stringify(withoutRetainedDetail(full)),
      );
      expect(detailOf(entry)).toEqual({
        reporting: undefined,
        instruction: undefined,
        landing: undefined,
        landingReporting: undefined,
      });
      const kept = detailOf(record);
      expect(Object.values(kept).every((part) => part !== undefined)).toBe(
        true,
      );
      expect(detailOf(full)).toEqual(kept);
    }
  } finally {
    await server.close();
    await codex.close();
    rmSync(machine, { recursive: true, force: true });
  }
});

test("lists open and Done follow-ups by source and restores the Done context from history", async () => {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-follow-up-listing-"));
  const server = await startDashboardServer({
    mode: "boundary",
    machine,
    projectFolders: ["open-dough"],
  });
  try {
    const now = new Date();
    const source = quietSession("follow-up-source", now);
    const followUpSource = followUpOf(source);
    const context = followUpContextOf(quietTitle, [
      `- Original request: ${quietTitle}`,
      "- Final report: No final report was submitted.",
    ]);
    const instruction = "Check the changelog again";
    const firstInput = `${context}\n\n${instruction}`;
    const followUp = (sessionId: string) =>
      makeMe.aLaunchRecord
        .adHoc({
          instruction,
          title: "Follow up on the changelog",
          followUp: { ...followUpSource, context },
        })
        .inCodexSession({
          sessionId,
          continuation: { workspace: server.home, endpoint: "unix://unused" },
        })
        .launchedAt(now.toISOString())
        .withFirstInput({ state: "confirmed", instruction: firstInput });
    const open = followUp("open-follow-up").please();
    const done = followUp("done-follow-up")
      .markedDoneAt(now.toISOString())
      .please();
    keepLaunchRecords(server, [source, open, done]);

    const overview = await askSessions(server);
    const listed = launchRecordsSchema.parse(JSON.parse(overview.body)).records;
    expect(listed).toEqual(
      expect.arrayContaining(
        [open, done].map(({ session }) =>
          expect.objectContaining({
            session,
            request: expect.objectContaining({ followUp: followUpSource }),
            firstInput: { state: "confirmed" },
          }),
        ),
      ),
    );
    expect(overview.body).not.toContain("Follow-up context:");

    const retained = await askSessions(server, undefined, true);
    const read = sessionsHistoryReadSchema.parse(JSON.parse(retained.body));
    if ("unchanged" in read) throw new Error("Expected full history");
    const full = read.records.find(
      ({ session }) => session.sessionId === done.session.sessionId,
    );
    expect(full).toMatchObject(done);
    const doneListing = listed.find(
      ({ session }) => session.sessionId === done.session.sessionId,
    );
    if (doneListing === undefined) throw new Error("Missing Done listing");
    const title = "Current listing title";
    expect(
      withRetainedDetail(
        { ...doneListing, request: { ...doneListing.request, title } },
        full,
      ),
    ).toMatchObject({
      request: { title, followUp: { ...followUpSource, context } },
      firstInput: { instruction: firstInput },
    });
  } finally {
    await server.close();
    rmSync(machine, { recursive: true, force: true });
  }
});
