// Case-only fallback for proof delegated to an owned native worker.
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { codexSessionSettings } from "../../support/native-codex-session.mjs";
import { readCodexSession } from "../../support/native-host-stream.mjs";

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
    }));
}

export function ownedWorkerProof(thread, workspace, sessionsRoot) {
  if (!thread || !workspace || !sessionsRoot) return "none";
  try {
    const saved = codexSessionSettings(thread, sessionsRoot);
    if (!saved) return "none";
    const parent = readCodexSession(saved.file);
    const rootTurn = parent.startedTurns.at(-1);
    if (!rootTurn || !parent.completedTurns.includes(rootTurn))
      return "unknown";
    const proof = saved.workers.flatMap((worker) =>
      workerProof(worker, rootTurn, workspace),
    );
    proof.sort((a, b) => a.at.localeCompare(b.at));
    return proof.at(-1)?.status ?? "none";
  } catch {
    return "unknown";
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${ownedWorkerProof(...process.argv.slice(2))}\n`);
}
