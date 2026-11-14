// Account-free proof and usage facts from the existing native readers. Raw
// commands, outputs, account metadata and local paths never leave the attempt.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { readCodexSession, readHostStream } from "./native-host-stream.mjs";
import {
  coordinatorProofCalls,
  ownedProofFromRecords,
} from "../native-comparison/paused-supplier/owned-proof.mjs";

export const parseFields = (text) =>
  new Map(
    text.split("\n").flatMap((line) => {
      const match = /^([a-z0-9-]+): (.*)$/.exec(line);
      return match ? [[match[1], match[2]]] : [];
    }),
  );

export const digest = (value) =>
  createHash("sha256").update(value).digest("hex");
export const identity = (value) => (value ? digest(String(value)) : null);
const outcome = (exit) =>
  exit === null ? "unknown" : exit === 0 ? "passed" : "failed";
const safeCall = (call) => ({
  commandHash: digest(call.command),
  commandKind: "project-test",
  exitCode: call.exitCode,
  status: outcome(call.exitCode),
  ...(call.worker && {
    worker: identity(call.worker),
    turn: identity(call.turn),
    rootTurn: identity(call.rootTurn),
    callId: identity(call.callId),
  }),
});

export function retainedTurns(attempt, observations, record) {
  const turns = [];
  const thread = record.get("thread");
  const saved = join(attempt, "codex-session.jsonl");
  const parent = existsSync(saved) ? readCodexSession(saved) : null;
  const workspace = parent?.contexts[0]?.cwd;
  const rootTurns = parent?.startedTurns ?? [];
  for (const [field, status] of observations) {
    const match = /^turn-(\d+)-status$/.exec(field);
    if (!match) continue;
    const number = Number(match[1]),
      file = join(attempt, `events-turn-${number}.jsonl`);
    const stream = readHostStream("codex", file);
    if (
      status !== "completed" ||
      stream.status !== "complete" ||
      stream.thread !== thread
    )
      throw new Error(
        `turn ${number} is incomplete or its stream is not this session`,
      );
    let proof = coordinatorProofCalls(stream.calls).map(safeCall);
    let proofStatus = proof.at(-1)?.status ?? "none";
    if (
      proofStatus === "none" &&
      parent &&
      workspace &&
      rootTurns[number - 1]
    ) {
      const workers = readdirSync(attempt)
        .filter((name) => /^codex-worker-.+\.jsonl$/.test(name))
        .map((name) => {
          const file = join(attempt, name);
          return { file, thread: readCodexSession(file).thread };
        });
      const owned = ownedProofFromRecords(
        saved,
        workers,
        workspace,
        rootTurns[number - 1],
      );
      proof = owned.calls.map(safeCall);
      proofStatus = owned.status;
    }
    const expected = observations.get(`turn-${number}-agent-proof`);
    if (expected === "passed" && proofStatus !== "passed")
      throw new Error(`turn ${number} lacks decisive owned proof`);
    const independentFile = join(
      attempt,
      "case-evidence",
      `proof-${number}.exit`,
    );
    let independent = null;
    if (existsSync(independentFile)) {
      const receipt = readFileSync(independentFile, "utf8").trim();
      if (!/^\d+$/.test(receipt) || !Number.isSafeInteger(Number(receipt)))
        throw new Error(
          `turn ${number} has a malformed independent proof receipt`,
        );
      const exit = Number(receipt);
      const log = readFileSync(
        independentFile.replace(/\.exit$/, ".log"),
        "utf8",
      );
      const counts = Object.fromEntries(
        [
          ...log.matchAll(
            /^# (tests|pass|fail|cancelled|skipped|todo) (\d+)$/gm,
          ),
        ].map((match) => [match[1], Number(match[2])]),
      );
      if (
        !Number.isSafeInteger(counts.tests) ||
        counts.tests < 1 ||
        !Number.isSafeInteger(counts.pass) ||
        !Number.isSafeInteger(counts.fail)
      )
        throw new Error(
          `turn ${number} has truncated independent proof output`,
        );
      independent = {
        exitCode: exit,
        status: outcome(exit),
        counts,
        outputHash: digest(log),
      };
    }
    if (
      observations.get(`turn-${number}-proof`) === "passed" &&
      independent?.status !== "passed"
    )
      throw new Error(`turn ${number} lacks independent proof support`);
    turns.push({
      number,
      status: "completed",
      thread: identity(thread),
      streamHash: digest(readFileSync(file)),
      proofStatus,
      proof,
      independent,
    });
  }
  if (!turns.length) throw new Error("no completed turns were retained");
  return turns.sort((a, b) => a.number - b.number);
}

export function safeObservations(text) {
  const entries = new Map();
  for (const line of text.split("\n")) {
    const match = /^([a-z0-9-]+): (.*)$/.exec(line);
    if (!match) continue;
    const [, key, value] = match;
    if (
      !/^(case|preparation-seconds|total-seconds|assessment-status|turn-\d+-[a-z0-9-]+)$/.test(
        key,
      ) ||
      /-(stopped|thread)$/.test(key)
    )
      continue;
    // Assessor inputs are scalar enums/counts, never raw prose or paths.
    if (!/^[a-zA-Z0-9_.-]+$/.test(value)) continue;
    if (entries.has(key)) throw new Error(`duplicate observation ${key}`);
    entries.set(key, value);
  }
  return entries;
}

// Recorded test-run facts are decisive inputs to the calibration observer,
// with enum/count fields only. Retain them instead of raw test output/paths.
export function retainedTestRuns(attempt, observations) {
  const runs = [];
  for (const field of observations.keys()) {
    const match = /^turn-(\d+)-proof-runs$/.exec(field);
    if (!match) continue;
    const file = join(
      attempt,
      "case-evidence",
      `test-run-facts-turn-${match[1]}.txt`,
    );
    const lines = readFileSync(file, "utf8").trim().split("\n");
    if (
      !lines.length ||
      lines.some(
        (line) =>
          !/^(pinned|seam|tests-changed|other) (SUCCESS|FAILURE|DESTINATION|absent) \d+ \d+ \d+ (yes|no)$/.test(
            line,
          ),
      )
    )
      throw new Error("recorded test-run proof is missing or malformed");
    runs.push({ turn: Number(match[1]), lines });
  }
  return runs;
}

export function archiveObservationText(archive) {
  const fields = new Map(Object.entries(archive.observations));
  for (const turn of archive.evidence.turns) {
    fields.set(`turn-${turn.number}-thread`, `session-${turn.thread}`);
    if (fields.has(`turn-${turn.number}-agent-proof`))
      fields.set(`turn-${turn.number}-agent-proof`, turn.proofStatus);
    if (fields.has(`turn-${turn.number}-proof`))
      fields.set(
        `turn-${turn.number}-proof`,
        turn.independent?.status ?? "unknown",
      );
  }
  fields.delete("assessment-status");
  return [...fields].map(([key, value]) => `${key}: ${value}\n`).join("");
}
