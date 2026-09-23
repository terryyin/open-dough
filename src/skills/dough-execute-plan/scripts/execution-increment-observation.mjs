// Establish or reuse matching CI observation for managed delivery: live
// mailbox match, host-bridge readiness, start, and coordinator binding.
import { bindHostObserver, verifyHostBridge } from "./ci-host-bridge.mjs";
import { receiptPrefix, startExecutionMailbox } from "./ci-mailbox.mjs";
import { findLiveMatchingMailbox } from "./ci-mailbox-match.mjs";

function coverageGap(reason) {
  return {
    state: "unobserved",
    pendingCi: "unobserved",
    reason,
  };
}

function observationAttached(directory, { reused = false } = {}) {
  return {
    state: reused ? "reused" : "attached",
    directory,
    reused,
  };
}

export async function establishObservation({
  repo,
  branch,
  host,
  session,
  workspace,
  runtime,
  maxDurationMs,
  env,
  root,
  storage,
  codexBridgeAvailable,
}) {
  const existing = findLiveMatchingMailbox({
    repo,
    branch,
    root,
    storage,
  });
  if (existing) {
    return {
      observation: observationAttached(existing, { reused: true }),
      startReceipt: null,
    };
  }

  const bridge = await verifyHostBridge({
    host,
    session,
    workspace,
    hookPath: runtime.hookEntrypoint,
    env,
    root,
    storage,
    codexBridgeAvailable,
  });
  if (!bridge.ready) {
    return {
      observation: coverageGap(bridge.reason ?? "host bridge unavailable"),
      startReceipt: null,
    };
  }

  const directory = await startExecutionMailbox(
    {
      mode: "execution",
      repo,
      branch,
      maxDurationMs,
    },
    { root, storage, env },
  );
  const startReceipt = `${receiptPrefix}${JSON.stringify({ directory })}\n`;
  const binding = await bindHostObserver({
    host,
    session,
    receipt: startReceipt,
    workspace,
    hookPath: runtime.hookEntrypoint,
    env,
  });
  if (!binding.attached) {
    return {
      observation: coverageGap(
        binding.context || "host bridge did not attach the observer",
      ),
      directory,
      startReceipt,
    };
  }
  return {
    observation: observationAttached(directory),
    startReceipt,
  };
}
