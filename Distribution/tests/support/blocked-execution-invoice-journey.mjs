// The one invoice supplier-pause journey; native setup and final judgment stay with its caller.
import assert from "node:assert/strict";
import { existsSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  execute,
  digestFile,
} from "../../src/skills/dough-execute-plan/scripts/blocked-execution-store.mjs";
import {
  invoiceEvidence,
  assertPreservedInvoiceWork,
} from "./blocked-execution-workflow-project.mjs";

export async function runInvoiceJourney({
  project,
  observation,
  role,
  threadId,
  initialTurn,
  save,
}) {
  assert.ok(observation.ancestry.has(threadId));
  let ownerRecoveryCommands = 0;
  const checked = (matches) =>
    observation
      .executionItems()
      .some(
        (item) =>
          item.type === "commandExecution" &&
          item.command?.includes("check-supplier.mjs") &&
          matches(item.aggregatedOutput ?? ""),
      );
  const signal = (label, evidence) => {
    const next = join(project.workspace, "supplier-next.json");
    writeFileSync(next, `${JSON.stringify(evidence)}\n`);
    renameSync(next, join(project.workspace, "supplier-evidence.json"));
    const digest = digestFile(
      join(project.workspace, "supplier-evidence.json"),
    );
    save(`event-${label}.json`, {
      evidence,
      digest,
      at: new Date().toISOString(),
    });
    return digest;
  };
  const hold = () => observation.hold(project.directory);
  const inspect = async (label) => {
    const history = await observation.history(threadId, `${label}-history`);
    await observation.discoverWorkers(threadId);
    save(`${label}-accounting.json`, await observation.accounting());
    if (observation.failure) throw observation.failure;
    return history;
  };
  const seen = async (digest) => {
    await observation.until(() => hold()?.observed === digest);
    assert.equal(
      existsSync(join(project.workspace, "final-report.json")),
      false,
    );
  };
  await observation.until(() =>
    checked((output) => /"satisfied"\s*:\s*false/.test(output)),
  );
  save("initial-judgment-history.json", await observation.history(threadId));
  assertPreservedInvoiceWork(project);
  await observation.until(() => observation.completed(threadId, initialTurn));
  await observation.until(() => hold()?.phase === "held");
  const terminal = observation.events.find(
    (event) =>
      event.method === "turn/completed" &&
      event.params?.threadId === threadId &&
      event.params.turn?.id === initialTurn,
  );
  assert.equal(
    terminal.params.turn.status,
    "completed",
    "initial native turn must end normally before supplier events",
  );
  save("initial-yield-boundary.json", {
    terminal,
    recordedAt: new Date().toISOString(),
    held: hold(),
  });
  await inspect("initial-yield");
  await seen(signal("unchanged", invoiceEvidence.unchanged));
  const before = await inspect("unchanged");
  await seen(signal("insufficient", invoiceEvidence.insufficient));
  const insufficient = await inspect("insufficient");
  let turnsBeforeQualifying = insufficient.turns.length;
  assert.equal(
    insufficient.turns.length,
    before.turns.length,
    "insufficient evidence creates no native continuation",
  );
  {
    const retained = hold();
    assert.equal(retained.phase, "held");
    assert.equal(retained.input.execution.workspace, project.workspace);
    assert.equal(retained.input.execution.revision, project.revision);
    assert.ok(
      Array.isArray(retained.input.execution.acceptedProof) &&
        retained.input.execution.acceptedProof.length > 0,
    );
    save("workflow-enrolled.json", retained);
    save("accepted-proof-retention-review.json", {
      status: "pending-semantic-review-before-acceptance",
      originalArtifact: project.acceptedProofArtifact,
      retained: retained.input.execution.acceptedProof,
    });
  }
  if (role === "attention") {
    renameSync(
      join(project.workspace, "supplier-evidence.json"),
      join(project.workspace, "supplier-unavailable.json"),
    );
    const attention = await observation.until(
      () =>
        hold()?.phase === "attention-delivered" &&
        hold()?.worker?.ended &&
        hold(),
    );
    assert.equal(
      attention.accepted.status,
      "completed",
      "native attention must complete successfully",
    );
    save("native-attention.json", attention);
    await inspect("attention");
    assertPreservedInvoiceWork(project);
    assert.equal(
      existsSync(join(project.workspace, "final-report.json")),
      false,
    );
    renameSync(
      join(project.workspace, "supplier-unavailable.json"),
      join(project.workspace, "supplier-evidence.json"),
    );
    const recovery = attention.attention.recoveryCommand;
    assert.ok(Array.isArray(recovery) && recovery.length > 0);
    ownerRecoveryCommands++;
    save("native-recovery.json", {
      command: recovery,
      result: await execute(recovery[0], recovery.slice(1), {
        cwd: project.workspace,
      }),
    });
    await observation.until(() => hold()?.phase === "held");
    turnsBeforeQualifying = (await inspect("recovered")).turns.length;
  }
  signal("qualifying", invoiceEvidence.qualified);
  {
    const accepted = await observation.until(
      () => ["accepted", "continued"].includes(hold()?.phase) && hold(),
    );
    save("native-accepted.json", accepted);
    signal("replay", {
      ...invoiceEvidence.qualified,
      notice: "same qualifying evidence delivered again",
    });
    if (!accepted.worker.ended)
      await observation.until(
        () =>
          hold()?.signalEvents > accepted.signalEvents || hold()?.worker?.ended,
      );
    const completed = await observation.until(
      () => hold()?.phase === "continued" && hold()?.worker?.ended && hold(),
    );
    assert.equal(
      completed.accepted.status,
      "completed",
      "native continuation must complete successfully",
    );
    assert.equal(completed.accepted.id, accepted.accepted.id);
    save("native-completed.json", completed);
  }
  return {
    history: await inspect("final"),
    turnsBeforeQualifying,
    ownerRecoveryCommands,
  };
}
