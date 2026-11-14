import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { holdCommand } from "./blocked-execution-store.mjs";

export const nativeRouteAvailable = (input) =>
  input.continuation.host === "codex" &&
  Boolean(input.continuation.threadId) &&
  input.continuation.endpoint?.startsWith("unix:///");

export function attentionRoute(input) {
  return {
    kind: nativeRouteAvailable(input) ? "same-native-thread" : "manual",
    owner: input.execution.owner,
    availability: nativeRouteAvailable(input) ? "unconfirmed" : "unavailable",
    lifetime:
      "Automatic attention requires the retained worker and same native daemon/thread to remain available.",
    limitation:
      "No spontaneous alert is promised after the delivery route or its processes exit. Inspect retained status and resume manually.",
  };
}

export function attention(record, reason, directory, detail = {}) {
  const { execution, condition, nextObservation } = record.input;
  Object.assign(record, {
    phase: "attention",
    attention: {
      reason,
      owner: nextObservation.owner,
      recovery: nextObservation.recovery,
      recoveryCommand: record.pending
        ? holdCommand("reconcile", directory)
        : (nextObservation.recoveryCommand ??
          holdCommand("recover", directory)),
      inspectCommand: holdCommand("status", directory),
      known: {
        condition,
        observed: record.observed,
        lastEvidence: record.lastEvidence,
      },
      acceptedProof: execution.acceptedProof,
      revision: execution.revision,
      proof: execution.outstandingProof,
      ci: nextObservation.ci,
      delivery: "unavailable",
      ...detail,
    },
  });
  if (record.attentionRoute)
    Object.assign(record.attentionRoute, {
      availability: detail.delivery === "pending" ? "live" : "unavailable",
    });
  return record;
}

// Reads the existing observer's terminal result; never starts, stops, claims or
// acknowledges that observer. Its owner retains the completion boundary.
export function attentionCause(record, now = Date.now()) {
  const { condition, nextObservation } = record.input;
  const { ci, deadline } = nextObservation;
  if (record.signalFailure)
    return {
      key: `signal-lost:${record.signalFailure}`,
      reason: `Required signal observation was lost: ${record.signalFailure}. Supplier success remains unknown.`,
    };
  if (ci) {
    const identity = `${ci.directory}:${ci.repo}:${ci.targetRef}:${ci.acceptedSha}`;
    try {
      const file = join(ci.directory, "result.json");
      if (!existsSync(ci.directory))
        return {
          key: `ci-missing:${identity}`,
          reason:
            "Required CI observation is unavailable; no CI completion receipt is established.",
        };
      if (existsSync(file)) {
        const result = JSON.parse(readFileSync(file, "utf8"));
        return {
          key: `ci-ended:${identity}`,
          reason: `Required CI observation ended (${result.status}); this terminal result does not assess ${ci.acceptedSha}'s success. Preserve accepted local proof and obtain its applicable completion receipt.`,
          ciResult: result,
        };
      }
    } catch (error) {
      return {
        key: `ci-unreadable:${identity}`,
        reason: `CI observation cannot be read: ${error}`,
      };
    }
  }
  if (!condition.signalFile || !existsSync(condition.signalFile))
    return {
      key: `signal-missing:${condition.signalFile ?? condition.kind}`,
      reason:
        condition.kind === "usage"
          ? "Reliable observed usage-reset evidence is unavailable; elapsed time, a model switch or a capacity purchase establishes neither reset nor authority."
          : "The required supplier signal is unavailable; supplier success is unknown.",
    };
  if (deadline && now >= deadline.at)
    return {
      key: `deadline:${deadline.at}:${deadline.reason}`,
      reason: `Meaningful observation deadline reached: ${deadline.reason}. The condition and outstanding proof remain unresolved.`,
    };
}

export function attentionText(record, directory, marker) {
  return [
    `Open Dough held execution ${record.input.execution.identity}; attention ${marker}.`,
    `Retained execution record: ${join(directory, "hold.json")}`,
    JSON.stringify(record.attention),
    "This is actionable attention for the retained owner, not evidence of supplier success, usage reset or successful CI.",
    "At the applicable completion boundary, a known ended CI observer requires the retained owner's execution-completion-recovery.mjs complete path; on Codex arm a fresh yielded stream first. Do not rearm an ended stream or manufacture a completion receipt.",
    "Keep local proof, unfinished work, ownership and original authority. Resume manually or rearm this same hold after resolving its recorded condition; do not resend uncertain input.",
    "No scope, model, purchase, proof waiver or replacement-writer authority is granted.",
  ].join("\n");
}
