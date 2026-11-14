// Executed project proof from a comparison coordinator or its owned workers.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { codexSessionSettings } from "../../support/native-codex-session.mjs";
import {
  readCodexSession,
  readHostStream,
} from "../../support/native-host-stream.mjs";

// Keep the coordinator's existing proof-command selection shared with archive
// capture. Owned-worker proof below additionally requires literal commands and
// completed turn/workspace ownership.
export function coordinatorProofCalls(calls) {
  return calls.filter((call) =>
    /node( [^;&|]*)? --test|npm (run )?test/.test(call.command ?? ""),
  );
}

const proofCommand = (command) =>
  typeof command === "string" &&
  /^(?:node --test(?: [^;&|\r\n]+)?|npm (?:run )?test(?: [^;&|\r\n]+)?)$/.test(
    command.trim(),
  );

function workerProof(worker, rootTurn, workspace) {
  const saved = readCodexSession(worker.file);
  const ownTurns = new Set(
    saved.ownership
      .filter(
        (owner) =>
          owner.thread === worker.thread && owner.rootTurn === rootTurn,
      )
      .map((owner) => owner.turn),
  );
  const completed = new Set(saved.completedTurns);
  return saved.calls
    .filter(
      (call) =>
        ownTurns.has(call.turn) &&
        ownTurns.has(call.receiptTurn) &&
        completed.has(call.turn) &&
        proofCommand(call.command) &&
        resolve(call.cwd) === resolve(workspace) &&
        resolve(call.workdir) === resolve(workspace),
    )
    .map((call) => ({
      status:
        call.exitCode === null
          ? "unknown"
          : call.exitCode === 0
            ? "passed"
            : "failed",
      at: call.at,
      worker: worker.thread,
      callId: call.id,
      turn: call.turn,
      rootTurn,
      exitCode: call.exitCode,
      command: call.command,
    }));
}

export function ownedWorkerProofObservation(thread, workspace, sessionsRoot) {
  if (!thread || !workspace || !sessionsRoot)
    return { status: "none", calls: [] };
  try {
    const saved = codexSessionSettings(thread, sessionsRoot);
    if (!saved) return { status: "none", calls: [] };
    return ownedProofFromRecords(saved.file, saved.workers, workspace);
  } catch {
    return { status: "unknown", calls: [] };
  }
}

// The same ownership/receipt decision over caller-named retained copies.
export function ownedProofFromRecords(parentFile, workers, workspace, turn) {
  const parent = readCodexSession(parentFile);
  const rootTurn = turn ?? parent.startedTurns.at(-1);
  if (!rootTurn || !parent.completedTurns.includes(rootTurn))
    return { status: "unknown", calls: [] };
  const parents = new Set([parent.thread]);
  const owned = [];
  let remaining = [...workers];
  while (remaining.length) {
    const next = remaining.filter((worker) => {
      const saved = readCodexSession(worker.file);
      if (!parents.has(saved.parentThread)) return true;
      if (saved.thread === worker.thread) {
        parents.add(worker.thread);
        owned.push(worker);
      }
      return false;
    });
    if (next.length === remaining.length) break;
    remaining = next;
  }
  const proof = owned.flatMap((worker) =>
    workerProof(worker, rootTurn, workspace),
  );
  proof.sort((a, b) => a.at.localeCompare(b.at));
  return { status: proof.at(-1)?.status ?? "none", calls: proof, rootTurn };
}

export function ownedWorkerProof(thread, workspace, sessionsRoot) {
  return ownedWorkerProofObservation(thread, workspace, sessionsRoot).status;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--coordinator") {
    const calls = coordinatorProofCalls(
      readHostStream("codex", process.argv[3]).calls,
    );
    const status = calls.length
      ? calls.at(-1).exitCode === 0
        ? "passed"
        : "failed"
      : "none";
    process.stdout.write(`${status}\n`);
  } else {
    process.stdout.write(`${ownedWorkerProof(...process.argv.slice(2))}\n`);
  }
}
