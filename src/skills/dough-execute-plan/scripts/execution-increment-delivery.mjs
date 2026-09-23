#!/usr/bin/env node
// Managed delivery for an authorized validated execution increment or repair:
// resolve checkout runtime, establish or reuse matching observation, publish,
// and attach the accepted SHA. Local-only authority does not push.
import { resolve } from "node:path";
import { resolveCheckoutRuntime } from "./ci-checkout-runtime.mjs";
import { registerPushedRevision, mailboxRoot } from "./ci-mailbox.mjs";
import { isDirectCliEntry } from "./ci-direct-entry.mjs";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import { establishObservation } from "./execution-increment-observation.mjs";
import { targetBranchName } from "./publication-git.mjs";
import { executionBudgetMs } from "./watch-ci-execution.mjs";

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
    authority = "publish",
    remote = "origin",
    maxDurationMs = executionBudgetMs,
    env = process.env,
    root,
    storage,
    codexBridgeAvailable,
    register,
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

  for (const field of [
    "workspace",
    "branch",
    "previouslyPublishedBase",
    "targetRef",
    "repo",
  ]) {
    if (!request[field]) {
      return {
        ok: false,
        publication: "refused",
        error: `missing ${field}`,
        receipt: null,
        observation: null,
      };
    }
  }

  const runtime = resolveCheckoutRuntime(workspace, { host, preferredAlias });
  const observerRoot = root ?? runtime.checkout;
  const observerStorage = storage ?? mailboxRoot;
  const targetBranch = targetBranchName(targetRef);

  const established = await establishObservation({
    repo,
    branch: targetBranch,
    host,
    session,
    workspace,
    runtime,
    maxDurationMs,
    env,
    root: observerRoot,
    storage: observerStorage,
    codexBridgeAvailable,
  });

  // Observation attaches before the first applicable push when a live owner is
  // established. An unavailable bridge still preserves accepted publication.
  const published = await publishExecutionIncrement({
    workspace,
    branch,
    previouslyPublishedBase,
    targetRef,
    remote,
    register,
  });

  let observation = established.observation;
  if (observation.directory && observation.state !== "unobserved") {
    registerPushedRevision(observation.directory, published.receipt.sha);
  } else if (established.directory && observation.state === "unobserved") {
    // Started but unbound: keep the directory for recovery context without
    // claiming live coverage.
    observation = {
      ...observation,
      directory: established.directory,
    };
  }

  return {
    ok: true,
    publication: "accepted",
    report: "accepted",
    receipt: published.receipt,
    preRebaseSha: published.preRebaseSha,
    observation,
    runtime: {
      alias: runtime.alias,
      skillRoot: runtime.skillRoot,
      entrypoint: runtime.entrypoint,
    },
    startReceipt: established.startReceipt,
  };
}

function argumentsOf(argv) {
  if (argv[0] !== "deliver") {
    throw new Error(
      "usage: execution-increment-delivery.mjs deliver --workspace PATH --branch NAME --previously-published-base SHA --target-ref REF --repo OWNER/REPO [--host cursor|claude|codex] [--preferred-alias .agents|.claude] [--authority publish|local-only] [--session-json JSON] [--max-duration-ms MS] [--codex-bridge-available]",
    );
  }
  const result = { authority: "publish" };
  for (let index = 1; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === "--codex-bridge-available") {
      result.codexBridgeAvailable = true;
      continue;
    }
    if (!flag.startsWith("--") || index + 1 >= argv.length) {
      throw new Error(`invalid argument ${flag}`);
    }
    const key = flag
      .slice(2)
      .replace(/-[a-z]/g, (match) => match[1].toUpperCase());
    result[key] = argv[++index];
  }
  if (result.sessionJson) {
    result.session = JSON.parse(result.sessionJson);
    delete result.sessionJson;
  }
  if (result.maxDurationMs !== undefined) {
    result.maxDurationMs = Number(result.maxDurationMs);
  }
  return result;
}

if (isDirectCliEntry(import.meta.url, process.argv[1])) {
  try {
    const args = argumentsOf(process.argv.slice(2));
    const result = await deliverManagedExecutionIncrement({
      ...args,
      workspace: resolve(args.workspace),
    });
    if (result.startReceipt) process.stdout.write(result.startReceipt);
    process.stdout.write(`${JSON.stringify(result)}\n`);
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}
