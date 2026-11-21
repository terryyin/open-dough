// An execution's local session evidence: one per-worktree file at the Git
// path `open-dough/session-record` holding the session UUID, workflow, story
// and the ordered accepted increment pairs. A fresh native claim or admission
// starts a new UUID; a resumed start keeps the file. A Dashboard launch's
// landing-context reference names the session, and a different reference
// replaces an unclosed earlier session's evidence. Only accepted pairs are
// appended, so refused or rewritten candidates never enter.
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { executionSessionWorkflow } from "./session-record.mjs";

function sessionEvidencePath(workspace) {
  const found = execFileSync(
    "git",
    ["rev-parse", "--git-path", "open-dough/session-record"],
    { cwd: workspace, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  return resolve(workspace, found.trim());
}

export function readSessionEvidence(workspace) {
  try {
    return JSON.parse(readFileSync(sessionEvidencePath(workspace), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return undefined;
    throw error;
  }
}

function writeSessionEvidence(workspace, evidence) {
  const file = sessionEvidencePath(workspace);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(evidence, null, 2)}\n`);
  return evidence;
}

function freshSession(sessionId, story) {
  return {
    sessionId,
    workflow: executionSessionWorkflow,
    ...(story ? { story } : {}),
    ranges: [],
  };
}

// A fresh native claim or admission: a new UUID with no ranges yet.
export function beginNativeSession(workspace, { story } = {}) {
  return writeSessionEvidence(workspace, freshSession(randomUUID(), story));
}

/**
 * Appends one accepted increment's exact pair. `reference` is the Dashboard
 * launch's landing-context reference when this publication carried one.
 * @param {string} workspace
 * @param {{ base: string, candidate: string, reference?: string }} accepted
 */
export function recordAcceptedIncrement(
  workspace,
  { base, candidate, reference },
) {
  const kept = readSessionEvidence(workspace);
  const evidence =
    reference && kept?.sessionId !== reference
      ? freshSession(reference, kept?.story)
      : (kept ?? freshSession(randomUUID()));
  const last = evidence.ranges.at(-1);
  if (last?.base !== base || last?.candidate !== candidate)
    evidence.ranges.push({ base, candidate });
  return writeSessionEvidence(workspace, evidence);
}

/**
 * Seals the session at its close: appends the accepted closure pair unless
 * delivery already recorded it, keeps `closing` (what the close already
 * settled, such as its completion receipt), and fixes the close time before
 * the first record publication attempt, so a rerun keeps the original close
 * time and ranges and resumes after what `closing` holds.
 * @param {string} workspace
 * @param {{ base: string, candidate: string }} closure
 * @param {object} closing
 * @param {() => Date} now
 */
export function sealSessionEvidence(
  workspace,
  closure,
  closing,
  now = () => new Date(),
) {
  const kept = readSessionEvidence(workspace);
  if (kept?.closedAt) return kept;
  const held = kept?.ranges.some(
    (range) => range.candidate === closure.candidate,
  );
  const evidence = held ? kept : recordAcceptedIncrement(workspace, closure);
  evidence.closing = closing;
  evidence.closedAt = now().toISOString();
  return writeSessionEvidence(workspace, evidence);
}
