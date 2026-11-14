import { randomUUID } from "node:crypto";
import { attention, attentionText } from "./blocked-execution-attention.mjs";
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

// Native submission, completion events and history reconciliation record the
// same delivery lifecycle. The caller establishes whether completion is known.
export function recordHeldDelivery(record, turn, completed = false) {
  const isAttention = record.pending?.purpose === "attention";
  Object.assign(record, {
    accepted: turn,
    phase: completed
      ? isAttention
        ? "attention-delivered"
        : "continued"
      : "accepted",
  });
  if (isAttention) {
    Object.assign(record.attention, {
      delivery: completed ? "completed" : "accepted",
    });
    const handled = record.handledAttention ?? [];
    if (!handled.includes(record.pending.attentionKey))
      handled.push(record.pending.attentionKey);
    Object.assign(record, { handledAttention: handled });
  }
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
  const notice = context.attentionCause;
  if (notice) {
    attention(record, notice.reason, directory, {
      ...notice,
      delivery: "pending",
    });
    record.phase = "held";
    save();
  }
  const checked = notice ? undefined : await checkCondition(record.input);
  if (stopped()) return false;
  if (checked && !checked.stable) return true;
  if (checked) record.lastEvidence = checked.judgment;
  if (checked && !checked.judgment.satisfied) {
    record.observed = checked.observation;
    save();
    return false;
  }
  await verifyExecution(record.input);
  if (!(await native.ready(snapshot))) {
    save();
    return false;
  }
  if (
    checked &&
    digestFile(record.input.condition.signalFile) !== checked.observation
  )
    return true;
  if (stopped()) return false;
  const marker = randomUUID();
  const text = notice
    ? attentionText(record, directory, marker)
    : continuationText(record, directory, checked, marker);
  record.pending = {
    marker,
    text,
    observation: checked?.observation,
    purpose: notice ? "attention" : "continuation",
    attentionKey: notice?.key,
  };
  record.phase = "submitting";
  save();
  try {
    const accepted = await native.submit(text);
    recordHeldDelivery(record, accepted);
    save();
    if (completed.has(accepted.id)) terminal(completed.get(accepted.id));
  } catch (error) {
    attention(
      record,
      notice
        ? `${notice.reason} Native acceptance is uncertain: ${error}`
        : String(error),
      directory,
      {
        delivery: "uncertain",
        recovery:
          "Run the retained recoveryCommand to reconcile native acceptance; do not resend uncertain input.",
        recoveryCommand: holdCommand("reconcile", directory),
      },
    );
    record.phase = "uncertain";
    finish();
  }
  return false;
}
