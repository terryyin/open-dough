// Opt-in Sessions measurement: DOUGH_SESSIONS_REPLAY=1; see
// ../AGENT-LAUNCH-OBSERVATION.md#measuring-the-sessions-answer.
// Reports full, unchanged, history and concurrent reads over production-scale
// seeded sessions; asserts record completeness and revision consistency.

import { mkdtempSync, rmSync } from "node:fs";
import { loadavg, tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "../../tests/support/pageTest.ts";
import { startDashboardServer } from "../../tests/support/dashboardServer.ts";
import { installFakeCodex } from "../../tests/support/fakeCodex.ts";
import {
  replayProjectIds,
  seedReplayProjects,
} from "../../tests/support/sessionsReplayProjects.ts";
import { seedReplaySessions } from "../../tests/support/sessionsReplaySeed.ts";
import {
  askSessions,
  loopTimes,
  pause,
  replayWatchEnvironment,
  revisionOf,
  trivialTraffic,
  type Asked,
} from "../../tests/support/sessionsReplayMeasures.ts";
import { replayTable } from "../../tests/support/sessionsReplayTable.ts";

const polls = 5;
// Viewers asking for the full answer at once, and how many changes they see.
const concurrentViewers = 4;
const concurrentRounds = 5;
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
    // The history: its first full answer, then unchanged asks holding it.
    await pause(beyondReuseMs);
    const history = await askSessions(server, undefined, true);
    const heldHistory = revisionOf(history.body);
    expect(heldHistory).toBe(
      (JSON.parse(regular.body) as { historyRevision: string }).historyRevision,
    );
    const quietHistory: Asked[] = [];
    for (let poll = 0; poll < polls; poll += 1) {
      await pause(beyondReuseMs);
      quietHistory.push(await askSessions(server, heldHistory, true));
    }
    for (const asked of quietHistory)
      expect(JSON.parse(asked.body)).toEqual({
        revision: heldHistory,
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

    // Viewers asking at once after each change, with trivial requests
    // beside them: a second open session alternates its state.
    const [, alternating] = seed.openSessions;
    if (alternating === undefined) throw new Error("No second open session");
    const concurrent: Asked[][] = [];
    const trivialDuringConcurrent: number[] = [];
    let previous = revisionOf(change.body);
    for (let round = 0; round < concurrentRounds; round += 1) {
      server.claudeSessionBecomes(
        alternating,
        round % 2 === 0 ? "blocked" : "working",
      );
      await pause(beyondReuseMs);
      const stop = await trivialTraffic(server);
      const viewers = await Promise.all(
        Array.from({ length: concurrentViewers }, () =>
          askSessions(server, previous),
        ),
      );
      trivialDuringConcurrent.push(...(await stop()));
      const [revision, ...others] = viewers.map(({ body }) => revisionOf(body));
      expect(others).toEqual(others.map(() => revision));
      expect(revision).not.toBe(previous);
      previous = revision ?? "";
      concurrent.push(viewers);
    }
    const concurrentSpans = concurrent.map((viewers) => ({
      from: Math.min(...viewers.map(({ from }) => from)),
      until: Math.max(...viewers.map(({ until }) => until)),
    }));

    const [changeLoop, ...spans] = await loopTimes(machine, [
      change,
      ...quiet,
      ...idle,
      ...quietHistory,
      ...concurrentSpans,
    ]);
    const historySpans = spans.slice(polls + idle.length, -concurrentRounds);
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
        idleLoop: spans.slice(polls, polls + idle.length),
        history,
        unchangedHistoryWallMs: quietHistory.map((asked) => asked.wallMs),
        unchangedHistoryLoop: historySpans,
        unchangedHistoryBytes: quietHistory[0]?.bytes ?? NaN,
        change,
        changeLoop: changeLoop ?? { loopMs: NaN, coveredMs: NaN },
        changeRevisionChanged: revisionOf(change.body) !== held,
        changeRecordsDiffering: differing,
        changeFieldsDiffering: changedFields,
        trivialDuringPolls,
        trivialIdle,
        concurrentViewers,
        concurrent,
        concurrentLoop: spans.slice(-concurrentRounds),
        trivialDuringConcurrent,
      })}\n`,
    );
  } finally {
    await server.close();
    await codex.close();
    rmSync(machine, { recursive: true, force: true });
  }
});
