import { mkdirSync, copyFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";
import {
  execute,
  digestFile,
} from "../../src/skills/dough-execute-plan/scripts/blocked-execution-store.mjs";

const source = fileURLToPath(new URL("../..", import.meta.url));

export async function prepareHeldNativeProject(root, save) {
  const files = {
    "consumer-work.json":
      '{"owner":"invoice-consumer","subtotal":125,"currency":"SGD"}\n',
    "supplier-evidence.json": '{"status":"paused","checked":false}\n',
    "authority.txt":
      "The original invoice assignment authorizes this consumer only; no commit or publication.\n",
    "verify-local.mjs":
      'import assert from "node:assert/strict"; import fs from "node:fs"; const work=JSON.parse(fs.readFileSync("consumer-work.json")); assert.equal(work.subtotal,125); assert.equal(work.currency,"SGD");\n',
    "check-supplier.mjs":
      'import fs from "node:fs";const e=JSON.parse(fs.readFileSync("supplier-evidence.json"));process.stdout.write(JSON.stringify({satisfied:e.status==="ready"&&e.checked===true&&Number.isFinite(e.taxRate),evidence:e.evidence??"supplier remains paused or lacks checked rate"}));\n',
  };
  const repo = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository.withRevision("held-consumer", { files }).please(),
    { at: join(root, "project") },
  );
  const workspace = realpathSync(repo.integration);
  const installed = join(
    workspace,
    ".agents",
    "skills",
    "dough-execute-plan",
    "scripts",
  );
  mkdirSync(installed, { recursive: true });
  const runtimeEntry = fileURLToPath(
    new URL(
      "../../src/skills/dough-execute-plan/scripts/blocked-execution.mjs",
      import.meta.url,
    ),
  );
  const closure = (
    await execute(process.execPath, [
      join(source, "tests/support/native-import-closure.mjs"),
      source,
      runtimeEntry,
    ])
  ).stdout
    .trim()
    .split("\n");
  const moduleRoot = "src/skills/dough-execute-plan/scripts/";
  const payload = closure.map((path) => path.slice(moduleRoot.length));
  for (const name of payload)
    copyFileSync(join(source, moduleRoot, name), join(installed, name));
  save("basis.json", {
    origin:
      "SEED-324 paused prerequisite, reconstructed with synthetic invoice evidence",
    workflow: "held execution command enrollment and native continuation",
    host: (await execute("codex", ["--version"])).stdout.trim(),
    sourceRevision: (
      await execute("git", ["rev-parse", "HEAD"], { cwd: source })
    ).stdout.trim(),
    payload: Object.fromEntries(
      payload.map((name) => [name, digestFile(join(installed, name))]),
    ),
    workspace,
    nativeDefaults: "No model, policy, permission or reasoning overrides",
  });
  const localProof = await execute(process.execPath, ["verify-local.mjs"], {
    cwd: workspace,
  });
  save("accepted-local-proof.json", {
    command: "node verify-local.mjs",
    exitCode: 0,
    stdout: localProof.stdout,
    consumerHash: digestFile(join(workspace, "consumer-work.json")),
    verifierHash: digestFile(join(workspace, "verify-local.mjs")),
  });
  return { workspace, installed, revision: repo.trunkSha };
}

export function heldNativeInput(workspace, revision, threadId, endpoint) {
  return makeMe.aHeldExecution
    .identifiedAs("native-invoice-consumer")
    .ownedBy("invoice-consumer")
    .inCheckout(workspace, revision)
    .authorizedBy({
      description:
        "Continue the original invoice assignment only; no commit or publication.",
      file: join(workspace, "authority.txt"),
      sha256: digestFile(join(workspace, "authority.txt")),
    })
    .withAcceptedProof({
      revision,
      command: "node verify-local.mjs",
      result: "passed",
    })
    .withUnfinishedWork("invoice total needs checked supplier rate")
    .withOutstandingProof("verify report against checked supplier outcome")
    .waitingForSupplier({
      description: "Supplier provides a ready, checked tax rate with evidence",
      signalFile: join(workspace, "supplier-evidence.json"),
      observed: digestFile(join(workspace, "supplier-evidence.json")),
      check: [process.execPath, "check-supplier.mjs"],
    })
    .continuingInCodex(threadId, endpoint)
    .observedBy(
      "invoice-consumer",
      "Inspect this exact native thread and retained hold; do not resend uncertain input.",
    )
    .please();
}
