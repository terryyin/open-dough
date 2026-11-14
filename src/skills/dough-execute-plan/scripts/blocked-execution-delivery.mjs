import { randomUUID } from "node:crypto";
import { join } from "node:path";
import {
  checkCondition,
  digestFile,
  verifyExecution,
  writeHold,
  holdCommand,
} from "./blocked-execution-store.mjs";

function continuationText(record, directory, checked, marker) {
  return [
    `Open Dough held execution ${record.input.execution.identity}; delivery ${marker}.`,
    `New evidence: ${checked.judgment.evidence}`,
    `Reassess this exact retained condition: ${record.input.condition.description}`,
    `Retained execution record: ${join(directory, "hold.json")}`,
    "Continue only the same owner's already-authorized work when the current evidence proves the condition.",
    "Publication or supplier completion alone does not satisfy a prose agreement.",
    "If evidence is insufficient, retain the same execution and rearm this hold with its current observation.",
    "Keep existing proof, CI receipt and recovery requirements. This input grants no scope, model, capacity-purchase or proof-waiver authority.",
  ].join("\n");
}

// Returns true only when another observation is already required. Submission
// intent reaches durable state before native input; uncertainty never resends it.
export async function deliverHeldExecution(context) {
  const {
    directory,
    record,
    native,
    snapshot,
    completed,
    terminal,
    finish,
    stopReason,
  } = context;
  const save = () => writeHold(directory, record);
  const stopped = () => {
    const reason = stopReason();
    if (!reason) return false;
    finish(reason);
    return true;
  };
  const checked = await checkCondition(record.input);
  if (stopped()) return false;
  if (!checked.stable) return true;
  record.lastEvidence = checked.judgment;
  if (!checked.judgment.satisfied) {
    record.observed = checked.observation;
    save();
    return false;
  }
  await verifyExecution(record.input);
  if (!(await native.ready(snapshot))) {
    save();
    return false;
  }
  if (digestFile(record.input.condition.signalFile) !== checked.observation)
    return true;
  if (stopped()) return false;
  const marker = randomUUID();
  const text = continuationText(record, directory, checked, marker);
  record.pending = { marker, text, observation: checked.observation };
  record.phase = "submitting";
  save();
  try {
    const accepted = await native.submit(text);
    record.accepted = accepted;
    record.phase = "accepted";
    save();
    if (completed.has(accepted.id)) terminal(completed.get(accepted.id));
  } catch (error) {
    record.phase = "uncertain";
    record.attention = {
      reason: String(error),
      owner: record.input.nextObservation.owner,
      recovery:
        "Run the retained recoveryCommand to reconcile native acceptance; do not resend uncertain input.",
      recoveryCommand: holdCommand("reconcile", directory),
      proof: record.input.execution.outstandingProof,
    };
    finish();
  }
  return false;
}
