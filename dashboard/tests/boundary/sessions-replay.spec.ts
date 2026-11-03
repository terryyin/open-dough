// The Sessions replay: a measurement, not a check, run only when asked with
// `DOUGH_SESSIONS_REPLAY=1` (../../AGENT-LAUNCH-OBSERVATION.md, "Measuring
// the Sessions answer"). It starts a boundary server on machine state shaped
// like production's on 2026-11-03 at the same scale: 1,000 done and five
// open sessions, 1,034 attempts, and a 1,191-entry Claude listing
// (../support/sessionsReplaySeed.ts), with a fake Codex app server
// answering its Codex threads, and six projects whose checkouts hold 44
// linked worktrees (../support/sessionsReplayProjects.ts). It prints, as a
// table, what the story's targets measure: startup, the first full answer
// cold, the regular answer's size, unchanged polls (held revision, each
// past the production one-second reuse window) by wall and event-loop time,
// one native state change, and the latency of a trivial request during
// polls and without them (../support/sessionsReplayMeasures.ts,
// ../support/sessionsReplayTable.ts). It asserts
// only what makes the numbers meaningful: every record observed, the polls
// answered unchanged.

import { mkdtempSync, rmSync } from "node:fs";
import { loadavg, tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { startDashboardServer } from "../support/dashboardServer.ts";
import { installFakeCodex } from "../support/fakeCodex.ts";
import {
  replayProjectIds,
  seedReplayProjects,
} from "../support/sessionsReplayProjects.ts";
import { seedReplaySessions } from "../support/sessionsReplaySeed.ts";
import {
  askSessions,
  loopTimes,
  pause,
  replayWatchEnvironment,
  revisionOf,
  trivialTraffic,
  type Asked,
} from "../support/sessionsReplayMeasures.ts";
import { replayTable } from "../support/sessionsReplayTable.ts";

const polls = 5;
// Past the production reuse window, so each poll observes afresh.
const reuseMs = 1_000;
const beyondReuseMs = reuseMs + 200;

// With `DOUGH_SESSIONS_REPLAY_PROFILE=<directory>`, every Node process the
// server starts, itself included, writes its CPU profile there on exit.
const profileDirectory = process.env["DOUGH_SESSIONS_REPLAY_PROFILE"];
const profiling =
  profileDirectory === undefined
    ? {}
    : { NODE_OPTIONS: `--cpu-prof --cpu-prof-dir=${profileDirectory}` };

type Entry = { readonly session: { readonly sessionId: string } };
const recordsOf = (body: string) =>
  (JSON.parse(body) as { records: readonly Entry[] }).records;

test.skip(
  process.env["DOUGH_SESSIONS_REPLAY"] !== "1",
  "A measurement run only when asked: DOUGH_SESSIONS_REPLAY=1",
);

test("the Sessions replay reports the baseline the story's targets measure", async () => {
  test.setTimeout(240_000);
  const machine = mkdtempSync(path.join(tmpdir(), "dough-sessions-replay-"));
  const codex = await installFakeCodex(
    machine,
    process.env["PATH"] ?? "",
    true,
  );
  const seeding = performance.now();
  seedReplayProjects(path.join(machine, "home"));
  const seed = seedReplaySessions(machine, codex);
  const seedingMs = performance.now() - seeding;
  const loadAverage = loadavg();
  const starting = performance.now();
  const server = await startDashboardServer({
    mode: "boundary",
    machine,
    projectFolders: replayProjectIds,
    codexProtocol: codex,
    sessionsReuseMs: reuseMs,
    extraEnv: { ...replayWatchEnvironment, ...profiling },
  });
  const startupMs = performance.now() - starting;
  try {
    const cold = await askSessions(server);
    const recorded = recordsOf(cold.body);
    expect(recorded).toHaveLength(seed.records.length);
    const { workspaces } = JSON.parse(cold.body) as {
      workspaces: readonly unknown[];
    };
    const held = revisionOf(cold.body);
    await pause(beyondReuseMs);
    const regular = await askSessions(server);

    // Quiet polls: wall and event-loop time, nothing else running.
    const quiet: Asked[] = [];
    for (let poll = 0; poll < polls; poll += 1) {
      await pause(beyondReuseMs);
      quiet.push(await askSessions(server, held));
    }
    for (const asked of quiet)
      expect(JSON.parse(asked.body)).toEqual({
        revision: held,
        unchanged: true,
      });
    // Quiet seconds without polls: the measure's floor on this machine.
    const idle: { from: number; until: number }[] = [];
    for (let span = 0; span < 3; span += 1) {
      await pause(beyondReuseMs);
      const from = Date.now();
      await pause(1_000);
      idle.push({ from, until: Date.now() });
    }

    // Polls with trivial requests beside them, and the same without polls.
    const trivialDuringPolls: number[] = [];
    for (let poll = 0; poll < polls; poll += 1) {
      await pause(beyondReuseMs);
      const stop = await trivialTraffic(server);
      await askSessions(server, held);
      trivialDuringPolls.push(...(await stop()));
    }
    const meanPollMs =
      quiet.reduce((total, asked) => total + asked.wallMs, 0) / polls;
    const trivialIdle: number[] = [];
    for (let span = 0; span < polls; span += 1) {
      await pause(beyondReuseMs);
      const stop = await trivialTraffic(server);
      await pause(meanPollMs);
      trivialIdle.push(...(await stop()));
    }

    // One native state change: an open session becomes blocked.
    const [changedSession] = seed.openSessions;
    if (changedSession === undefined) throw new Error("No open session");
    server.claudeSessionBecomes(changedSession, "blocked");
    await pause(beyondReuseMs);
    const change = await askSessions(server, held);
    const before = new Map(
      recorded.map((entry) => [entry.session.sessionId, JSON.stringify(entry)]),
    );
    const differing = recordsOf(change.body)
      .filter(
        (entry) =>
          before.get(entry.session.sessionId) !== JSON.stringify(entry),
      )
      .map((entry) =>
        entry.session.sessionId === changedSession
          ? "the changed session"
          : entry.session.sessionId,
      );
    // The answer's other fields, apart from its records and revision.
    const fieldsOf = (body: string) =>
      Object.entries(JSON.parse(body) as Record<string, unknown>).filter(
        ([key]) => key !== "records" && key !== "revision",
      );
    const coldFields = new Map(
      fieldsOf(cold.body).map(([key, value]) => [key, JSON.stringify(value)]),
    );
    const changedFields = fieldsOf(change.body)
      .filter(([key, value]) => coldFields.get(key) !== JSON.stringify(value))
      .map(([key]) => key);

    const [changeLoop, ...spans] = await loopTimes(machine, [
      change,
      ...quiet,
      ...idle,
    ]);
    const codexRecords = seed.records.filter(
      ({ session }) => session.host === "codex",
    ).length;
    console.log(
      `\nSessions replay\n${replayTable({
        scale: `${String(seed.records.length)} records (${String(seed.openSessions.length)} open, ${String(codexRecords)} Codex), ${String(seed.attempts.length)} attempts, ${String(seed.listed.length)} listed; seeded in ${String(Math.round(seedingMs))} ms`,
        loadAverage,
        startupMs,
        cold,
        workspaces: workspaces.length,
        regular,
        unchangedWallMs: quiet.map((asked) => asked.wallMs),
        unchangedLoop: spans.slice(0, polls),
        unchangedBytes: quiet[0]?.bytes ?? NaN,
        idleLoop: spans.slice(polls),
        changeWallMs: change.wallMs,
        changeLoop: changeLoop ?? { loopMs: NaN, coveredMs: NaN },
        changeRevisionChanged: revisionOf(change.body) !== held,
        changeRecordsDiffering: differing,
        changeFieldsDiffering: changedFields,
        trivialDuringPolls,
        trivialIdle,
      })}\n`,
    );
  } finally {
    await server.close();
    await codex.close();
    rmSync(machine, { recursive: true, force: true });
  }
});
