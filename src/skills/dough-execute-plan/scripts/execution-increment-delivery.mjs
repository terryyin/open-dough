#!/usr/bin/env node
// Resolve runtime and observation, publish an authorized increment, and attach
// acceptance. Held proof stops before push; local-only authority never pushes.
import { commitPreparedExecutionIncrement } from "./execution-increment-preparation.mjs";
import { resolveCheckoutRuntime } from "./ci-checkout-runtime.mjs";
import {
  registerPushedRevision,
  recordDeliveryProgress,
  mailboxRoot,
} from "./ci-mailbox.mjs";
import { isDirectCliEntry } from "./ci-direct-entry.mjs";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import { establishObservation } from "./execution-increment-observation.mjs";
export { resumeManagedExecutionIncrement } from "./execution-increment-resume.mjs";
import { targetBranchName } from "./publication-git.mjs";
import { executionBudgetMs } from "./watch-ci-execution.mjs";
import {
  managedIncrementRequestRefusal,
  readIncrementCliRequest,
} from "./execution-increment-request.mjs";

// A fresh attempt is distinct from delivery/resume of an existing candidate.
// Until the publication half is available, this entry grants local-only work.
export async function deliverFreshExecutionIncrement(request) {
  if (request.authority !== "local-only") {
    return {
      ok: false,
      status: "preparation-refused",
      operation: "authority",
      error: "fresh work currently requires explicit local-only authority",
      publication: "pending",
      receipt: null,
      observation: null,
    };
  }
  const commit = await commitPreparedExecutionIncrement(request);
  return {
    ...commit,
    publication: "pending",
    report: commit.ok ? "committed-pending-publication" : commit.status,
    commit: commit.ok ? commit : null,
    receipt: null,
    observation: null,
    ...(!commit.ok && {
      recovery:
        "Repair the named operation, preserve owned edits and index content, and retry fresh preparation; renew only proof invalidated by the repair. Do not deliver an older HEAD after this failed attempt.",
    }),
  };
}

export async function deliverManagedExecutionIncrement(request) {
  const {
    workspace,
    branch,
    previouslyPublishedBase,
    targetRef,
    repo,
    host = "cursor",
    preferredAlias,
    session,
    coordinator,
    observerDirectory,
    authority = "publish",
    remote = "origin",
    maxDurationMs = executionBudgetMs,
    env = process.env,
    root,
    storage,
    register,
    validate,
    validatedCandidate,
    defaultCheckout,
    backlogPath,
    beforeRetryPush,
    beforePush,
    landingContext,
    oneShotIdentity,
  } = request;

  if (authority !== "publish") {
    return {
      ok: true,
      publication: "pending",
      report: "local-only",
      receipt: null,
      observation: null,
    };
  }

  const refusal = managedIncrementRequestRefusal(request);
  if (refusal) {
    return {
      ok: false,
      publication: "refused",
      error: refusal,
      receipt: null,
      observation: null,
    };
  }

  const runtime = resolveCheckoutRuntime(workspace, { host, preferredAlias });
  const { alias, skillRoot, entrypoint } = runtime;
  const runtimeSummary = { alias, skillRoot, entrypoint };
  const observerRoot = root ?? runtime.checkout;
  const observerStorage = storage ?? mailboxRoot;
  const targetBranch = targetBranchName(targetRef);

  const established = await establishObservation({
    repo,
    branch: targetBranch,
    host,
    session,
    coordinator,
    observerDirectory,
    workspace,
    runtime,
    maxDurationMs,
    env,
    root: observerRoot,
    storage: observerStorage,
  });

  // Queued one-shot work stops on a fetched target tip where another owner
  // holds it. Its guard reads backlog and profile records through the
  // product-backlog skill, so it is loaded only then.
  const onFetchedTarget = oneShotIdentity
    ? (await import("./one-shot-ownership.mjs")).queuedOwnershipGuard({
        workspace,
        identity: oneShotIdentity,
        backlogPath,
      })
    : undefined;

  // Observation attaches before the first applicable push when a live owner is
  // established. An unavailable bridge still preserves accepted publication.
  const published = await publishExecutionIncrement({
    workspace,
    branch,
    previouslyPublishedBase,
    targetRef,
    remote,
    register,
    validate,
    validatedCandidate,
    defaultCheckout,
    backlogPath,
    beforeRetryPush,
    beforePush,
    landingContext,
    onFetchedTarget,
  });

  // Started but unbound: keep the directory for recovery context without
  // claiming live coverage.
  const observation =
    established.directory && established.observation.state === "unobserved"
      ? { ...established.observation, directory: established.directory }
      : established.observation;
  if (!published.ok) {
    // Live owner is kept for later validated resume; no SHA registered yet.
    return {
      ok: false,
      publication: published.publication,
      status: published.status,
      report: published.status,
      receipt: null,
      candidate: published.candidate,
      preRebaseSha: published.preRebaseSha,
      remoteTip: published.remoteTip,
      previouslyPublishedBase: published.previouslyPublishedBase,
      suffixBase: published.suffixBase,
      reconciliations: published.reconciliations,
      // A transport-timeout stop names the stalled stage and its bound.
      stage: published.stage,
      pushIssued: published.pushIssued,
      boundMs: published.boundMs,
      remote: published.remote,
      target: published.target,
      replay: published.replay,
      validation: published.validation,
      ownership: published.ownership,
      error: published.error,
      observation,
      runtime: runtimeSummary,
      startReceipt: established.startReceipt,
      maintenance: published.maintenance ?? null,
    };
  }

  if (observation.directory && observation.state !== "unobserved") {
    registerPushedRevision(observation.directory, published.receipt.sha);
    if (host === "claude" && request.mode === "story-branch")
      recordDeliveryProgress(observation.directory, {
        acceptedPublication: {
          sha: published.receipt.sha,
          mode: request.mode,
          targetRef,
        },
      });
  }

  return {
    ok: true,
    publication: "accepted",
    report: "accepted",
    // A retry whose candidate the remote already held pushed nothing.
    ...(published.classification && {
      classification: published.classification,
    }),
    receipt: published.receipt,
    ...(published.landing === undefined ? {} : { landing: published.landing }),
    preRebaseSha: published.preRebaseSha,
    remoteTip: published.remoteTip,
    suffixBase: published.suffixBase,
    reconciliations: published.reconciliations,
    observation,
    runtime: runtimeSummary,
    startReceipt: established.startReceipt,
    // Deferred local refresh is independent of remote acceptance.
    maintenance: published.maintenance ?? null,
  };
}

if (isDirectCliEntry(import.meta.url, process.argv[1])) {
  try {
    const { fresh, request } = await readIncrementCliRequest(
      process.argv.slice(2),
    );
    const operation = fresh
      ? deliverFreshExecutionIncrement
      : deliverManagedExecutionIncrement;
    const result = await operation(request);
    if (result.startReceipt) process.stdout.write(result.startReceipt);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}
