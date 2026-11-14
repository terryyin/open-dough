// Opt-in live-daemon native acceptance: retained resume or attention for one invoice.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, realpathSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execute } from "../src/skills/dough-execute-plan/scripts/blocked-execution-store.mjs";
import {
  prepareWorkflowProject,
  workflowAssignment,
  assertInvoiceResult,
} from "./support/blocked-execution-workflow-project.mjs";
import { InvoiceNativeObservation } from "./support/blocked-execution-workflow-observation.mjs";
import { runInvoiceJourney } from "./support/blocked-execution-invoice-journey.mjs";
import { retainFinalInvoiceSessions } from "./support/blocked-execution-invoice-history.mjs";

const [flag, role, output, sourceRevision] = process.argv.slice(2);
if (
  flag !== "--native" ||
  !["resume", "attention"].includes(role) ||
  !output ||
  !/^[a-f0-9]{40}$/.test(sourceRevision ?? "")
)
  throw new Error(
    "Native acceptance opt-in: node Distribution/tests/blocked-execution-workflow-native.mjs --native resume|attention PRIVATE_RESULTS_DIR PINNED_SHA",
  );
let root = resolve(output);
const source = realpathSync(fileURLToPath(new URL("../..", import.meta.url)));
assert.equal(
  existsSync(root),
  false,
  "Each observation needs a fresh results directory",
);
mkdirSync(root, { recursive: true });
root = realpathSync(root);
assert.ok(
  root !== source && !root.startsWith(`${source}/`),
  "Raw native results must stay outside the Git checkout",
);
const save = (name, value) =>
  writeFileSync(join(root, name), `${JSON.stringify(value, null, 2)}\n`);
const project = await prepareWorkflowProject(
  root,
  source,
  sourceRevision,
  save,
);
const daemon = JSON.parse(
  (await execute("codex", ["app-server", "daemon", "version"])).stdout,
);
assert.equal(daemon.status, "running");
const endpoint = `unix://${daemon.socketPath}`;
const limits =
  role === "attention"
    ? { minutes: 30, tokens: 5_000_000, output: 40_000 }
    : { minutes: 20, tokens: 3_000_000, output: 25_000 };
const observation = new InvoiceNativeObservation(root, endpoint, limits);
observation.workspace = project.workspace;
observation.observePath(root);
let threadId;
let initialTurn;
const hold = () => observation.hold(project.directory);

try {
  await observation.connection.initialize({
    name: "open_dough_invoice_workflow",
    version: "1",
  });
  const started = await observation.connection.request("thread/start", {
    cwd: project.workspace,
  });
  threadId = started.thread.id;
  observation.admitThread(threadId, null);
  save("native-start.json", started);
  assert.equal(started.model, "gpt-6.1-sol");
  assert.equal(started.reasoningEffort, "xhigh");
  assert.equal(started.approvalPolicy, "never");
  assert.equal(started.sandbox.type, "dangerFullAccess");
  observation.trackRollout(started.thread);
  const prompt = workflowAssignment(project, root, { threadId, endpoint });
  save("initial-input.json", { text: prompt });
  save("protocol.json", {
    role,
    sourceRevision,
    daemon,
    limits,
    milestone:
      "actual initial false supplier judgment, then completed initial native turn and workflow-owned held receipt before any producer event",
    events: [
      "unchanged paused",
      "ready unchecked",
      "ready checked",
      "qualified replay",
    ],
    delivery:
      "same retained native execution; no added developer continuation input",
    noSettingsOverrides: true,
  });
  const initialAcceptance = await observation.connection.request("turn/start", {
    threadId,
    input: [{ type: "text", text: prompt }],
  });
  initialTurn = observation.ownership.accepted(
    threadId,
    initialAcceptance.turn,
    "initial assignment",
  );
  save("initial-acceptance.json", initialAcceptance);
  const { history, turnsBeforeQualifying, ownerRecoveryCommands } =
    await runInvoiceJourney({
      project,
      observation,
      role,
      threadId,
      initialTurn,
      save,
    });
  assert.equal(
    history.historyUnavailable,
    undefined,
    "Final native execution history must be observable",
  );
  const settings = await observation.connection.request("thread/resume", {
    threadId,
  });
  save("native-final-settings.json", settings);
  for (const key of [
    "model",
    "modelProvider",
    "approvalPolicy",
    "sandbox",
    "reasoningEffort",
    "serviceTier",
  ])
    assert.deepEqual(settings[key], started[key], `unchanged native ${key}`);
  const report = assertInvoiceResult(project);
  save("proof-results.json", {
    partial: await execute(process.execPath, ["verify-local.mjs"], {
      cwd: project.workspace,
    }),
    report: await execute(process.execPath, ["verify-report.mjs"], {
      cwd: project.workspace,
    }),
  });
  assert.equal(
    (
      await execute("git", ["rev-parse", "HEAD"], { cwd: project.workspace })
    ).stdout.trim(),
    project.revision,
  );
  const result = {
    result: "pass",
    role,
    threadId,
    initialTurn,
    turns: history.turns.map((turn) => ({ id: turn.id, status: turn.status })),
    report,
    ownerRecoveryCommands,
    accounting: await observation.accounting(),
    nativeNotices: Object.fromEntries(observation.noticeCounts),
    publication: "none authorized or performed; HEAD unchanged; no CI receipt",
    proof: "preserved partial proof plus actual complete-report verification",
    preserved: project.preserved,
    acceptedProofReview: {
      status: "pending-semantic-review-before-acceptance",
      originalArtifact: project.acceptedProofArtifact,
      retained: hold()?.input?.execution?.acceptedProof,
    },
    savedSessions: retainFinalInvoiceSessions(observation, threadId, root),
  };
  assert.equal(
    history.turns.length,
    turnsBeforeQualifying + 1,
    "exactly one continuation after qualifying evidence; deliberate attention recovery is separate",
  );
  save("native-session-settings.json", result.savedSessions);
  save("result.json", result);
  process.stdout.write(
    `${JSON.stringify({ result: "pass", role, root, threadId })}\n`,
  );
} catch (error) {
  save("result.json", {
    result: "incomplete",
    role,
    threadId,
    error: String(error),
    retained: hold(),
    accounting: await observation.accounting(),
    nativeNotices: Object.fromEntries(observation.noticeCounts),
    acceptedProofArtifact: project.acceptedProofArtifact,
  });
  if (threadId) {
    await observation
      .discoverWorkers(threadId)
      .catch((failure) =>
        save("cleanup-history-limitation.json", { error: String(failure) }),
      );
    save(
      "native-interruption.json",
      await observation.ownership.interruptKnown(observation.ancestry.keys()),
    );
  }
  if (hold() && !hold().worker?.ended)
    await execute(
      process.execPath,
      [
        join(project.installed, "scripts/blocked-execution.mjs"),
        "stop",
        "--directory",
        project.directory,
      ],
      { cwd: project.workspace },
    );
  throw error;
} finally {
  observation.close();
}
