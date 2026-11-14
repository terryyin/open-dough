// SEED-324's paused-supplier consumer, reduced to one invoice decision.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";
import {
  execute,
  digestFile,
} from "../../src/skills/dough-execute-plan/scripts/blocked-execution-store.mjs";

export const invoiceEvidence = {
  paused: { status: "paused", checked: false },
  unchanged: { status: "paused", checked: false, notice: "still paused" },
  insufficient: {
    status: "ready",
    checked: false,
    taxRate: 0.08,
    evidence: "synthetic approved tax rule R8",
  },
  qualified: {
    status: "ready",
    checked: true,
    taxRate: 0.08,
    evidence: "synthetic approved tax rule R8",
  },
};

export async function prepareWorkflowProject(
  root,
  source,
  sourceRevision,
  save,
) {
  const payload = join(root, "payload-source");
  const workspace = join(root, "project");
  mkdirSync(payload, { recursive: true });
  mkdirSync(workspace, { recursive: true });
  const archive = execFileSync("git", ["archive", sourceRevision], {
    cwd: source,
    maxBuffer: 128 * 1024 * 1024,
  });
  execFileSync("tar", ["-x", "-C", payload], { input: archive });
  const installation = await execute("bash", [
    join(payload, "install.sh"),
    "--target",
    workspace,
    "--source",
    payload,
    "--platform",
    "codex",
  ]);
  save("installation.json", installation);
  const inventory = (
    await execute("bash", [
      "-c",
      'source "$1"; read_managed_files_declaration "$2"',
      "inventory",
      join(
        payload,
        "Distribution/src/install/open-dough-payload-declaration.sh",
      ),
      join(payload, "install.sh"),
    ])
  ).stdout
    .trim()
    .split("\n");
  const hashes = Object.fromEntries(
    inventory.map((name) => {
      const installed = digestFile(join(workspace, ".agents/skills", name));
      assert.equal(
        installed,
        digestFile(join(payload, "Distribution/src/skills", name)),
      );
      return [name, installed];
    }),
  );
  const files = {
    "consumer-work.json":
      '{"owner":"invoice-consumer","subtotal":125,"currency":"SGD"}\n',
    "supplier-evidence.json": `${JSON.stringify(invoiceEvidence.paused)}\n`,
    "authority.txt":
      "Complete this invoice only; preserve accepted work and proof. Do not modify supplier evidence or verifiers. Do not commit, publish, change model, buy capacity, waive proof or widen scope.\n",
    "check-supplier.mjs":
      'import fs from "node:fs";import{createHash}from"node:crypto";const bytes=fs.readFileSync("supplier-evidence.json"),e=JSON.parse(bytes);console.log(JSON.stringify({satisfied:e.status==="ready"&&e.checked===true&&Number.isFinite(e.taxRate)&&typeof e.evidence==="string"&&e.evidence.length>0,evidence:e.evidence??"supplier lacks a ready checked rate and provenance",signalSha256:createHash("sha256").update(bytes).digest("hex")}));\n',
    "verify-local.mjs":
      'import assert from "node:assert/strict";import fs from "node:fs";const w=JSON.parse(fs.readFileSync("consumer-work.json"));assert.equal(w.subtotal,125);assert.equal(w.currency,"SGD");console.log("accepted partial invoice passes");\n',
    "verify-report.mjs":
      'import assert from "node:assert/strict";import fs from "node:fs";const w=JSON.parse(fs.readFileSync("consumer-work.json")),e=JSON.parse(fs.readFileSync("supplier-evidence.json")),r=JSON.parse(fs.readFileSync("final-report.json"));assert.equal(e.status,"ready");assert.equal(e.checked,true);assert.equal(r.subtotal,w.subtotal);assert.equal(r.taxRate,e.taxRate);assert.equal(r.taxAmount,w.subtotal*e.taxRate);assert.equal(r.total,w.subtotal+r.taxAmount);assert.equal(r.currency,w.currency);assert.equal(r.supplierEvidence,e.evidence);console.log("invoice report and supplier provenance pass");\n',
    "AGENTS.md":
      "# Invoice project\n\nOne Node-only interactive slice; no dependencies, setup, formatter or commit hooks. Local proof: `node verify-local.mjs`. Complete-report proof: `node verify-report.mjs`. Keep the accepted partial work and both verifiers unchanged. Do not modify supplier evidence. Native owner context is supplied by the caller. The caller forbids commit/publication and therefore overrides those one-shot delivery steps. No CI has been published or is required for this disposable local result; do not manufacture a CI receipt. A running command retains its verification owner and meaningful overdue checks.\n",
    ".planning/open-dough.json": '{"skipProcessRetrospective":true}\n',
    ".planning/PRODUCT-BACKLOG.md":
      "# Product backlog\n\n## Taken\n\n## Backlog list\n",
  };
  const repository = await materializeLocalCheckout(
    undefined,
    makeMe.aRepository.withRevision("invoice", { files }).please(),
    { at: workspace },
  );
  const origin = join(root, "origin.git");
  await execute("git", ["init", "--bare", "--quiet", origin]);
  await execute("git", ["remote", "add", "origin", origin], { cwd: workspace });
  await execute("git", ["push", "--quiet", "origin", "main"], {
    cwd: workspace,
  });
  const local = await execute(process.execPath, ["verify-local.mjs"], {
    cwd: workspace,
  });
  const preserved = Object.fromEntries(
    [
      "consumer-work.json",
      "verify-local.mjs",
      "verify-report.mjs",
      "authority.txt",
    ].map((name) => [name, digestFile(join(workspace, name))]),
  );
  const proof = {
    revision: repository.trunkSha,
    command: "node verify-local.mjs",
    result: "passed",
    ...local,
    preserved,
  };
  save("accepted-local-proof.json", proof);
  const acceptedProofArtifact = {
    path: join(root, "accepted-local-proof.json"),
    sha256: digestFile(join(root, "accepted-local-proof.json")),
  };
  save("accepted-proof-origin.json", acceptedProofArtifact);
  save("payload-basis.json", {
    sourceRevision,
    inventory,
    hashes,
    origin: "SEED-324 paused supplier; neutral invoice consumer",
    workflow: "complete installed dough-execute-plan established one-shot",
    environment:
      "Node-only local Git project; live Codex daemon; no model/policy/permission/effort overrides",
  });
  return {
    workspace: repository.integration,
    revision: repository.trunkSha,
    preserved,
    acceptedProofArtifact,
    directory: join(root, "held-execution"),
    installed: join(workspace, ".agents/skills/dough-execute-plan"),
  };
}

export function workflowAssignment(project, root, native) {
  const context = {
    ...native,
    owner: "invoice-consumer",
    identity: "native-invoice-consumer",
    retainedStateDirectory: project.directory,
    acceptedProof: join(root, "accepted-local-proof.json"),
  };
  const contextFile = join(root, "native-context.json");
  writeFileSync(contextFile, `${JSON.stringify(context, null, 2)}\n`);
  return `Use $dough-execute-plan --one-shot for this single interactive invoice task. Read this project's installed .agents/skills/dough-execute-plan/SKILL.md and applicable references. Complete final-report.json from consumer-work.json and supplier-evidence.json. The report must contain subtotal, taxRate, taxAmount, total, currency and supplierEvidence. Supplier evidence is usable only when ready, checked, with a numeric rate and evidence reference. Run node check-supplier.mjs before report work. Preserve the accepted partial work and proof. Supplier is currently paused, with no verification running. Continue within the original authority if its evidence later qualifies; if blocked or delivery is unavailable, retain recoverable context and report the exact condition, owner and recovery. Do not modify supplier evidence or either verifier. Run the applicable local proof before reporting completion. Work only in this disposable project; do not commit or publish. This explicit instruction overrides one-shot commit/publication. Native continuation coordinates and accepted proof are in ${contextFile}; those exact coordinates belong to your own current thread, not another execution.\n\nEstablished start:\n- tracking: one-shot\n- workspace: ${project.workspace}\n- workspace role: isolated\n- branch: main\n- mode: story-branch\n- remote: origin (no publication authorized)\n- target: main\n- landing: review\n- startingRevision: ${project.revision}\n`;
}

export function assertInvoiceResult(project) {
  const report = JSON.parse(
    readFileSync(join(project.workspace, "final-report.json")),
  );
  for (const [key, value] of Object.entries({
    subtotal: 125,
    taxRate: 0.08,
    taxAmount: 10,
    total: 135,
    currency: "SGD",
    supplierEvidence: "synthetic approved tax rule R8",
  }))
    assert.equal(report[key], value, `requested report field ${key}`);
  assertPreservedInvoiceWork(project);
  return report;
}

export function assertPreservedInvoiceWork(project) {
  for (const [name, hash] of Object.entries(project.preserved))
    assert.equal(
      digestFile(join(project.workspace, name)),
      hash,
      `preserved ${name}`,
    );
  assert.equal(
    digestFile(project.acceptedProofArtifact.path),
    project.acceptedProofArtifact.sha256,
    "preserved caller accepted proof artifact",
  );
}
