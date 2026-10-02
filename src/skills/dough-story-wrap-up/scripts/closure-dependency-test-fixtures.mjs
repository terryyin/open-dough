// Completion consuming operation observes accepted integration, including a
// candidate replaced by retry. It does not simulate an agent's judgment.
import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { run } from "../../../../tests/support/product-backlog-fixture.mjs";
import {
  dependency,
  readDependencies,
  updateDependency,
} from "../../../../tests/support/story-dependencies-fixture.mjs";
import { git, revParse } from "./closure-git-fixtures.mjs";
const supplier = { identity: "CLOSED-SUPPLIER", link: "supplier.md" };
const consumer = { identity: "LIVE-CONSUMER", link: "dependent.md" };
export async function prepareClosureDependencies(fixture) {
  const project = {
    directory: fixture.execution,
    inputDirectory: fixture.fixture,
  };
  mkdirSync(join(fixture.execution, ".planning"), { recursive: true });
  writeFileSync(
    join(fixture.execution, ".planning/supplier.md"),
    "# Completed supplier\n**Identity:** CLOSED-SUPPLIER\n## Ordered slices\n### 1. Endpoint\nType: Behavior\nStatus: done\nAccepted: Endpoint outcome proved.\n",
  );
  writeFileSync(
    join(fixture.execution, ".planning/dependent.md"),
    "# Dependent correction\n**Identity:** LIVE-CONSUMER\n",
  );
  const authored = await updateDependency(
    project,
    consumer,
    dependency(supplier),
  );
  assert.equal(authored.code, 0, authored.stderr);
  await git(fixture.execution, "add", ".planning");
  await git(
    fixture.execution,
    "commit",
    "-m",
    "preserve completed supplier evidence",
  );
  const evidence = await revParse(fixture.execution, "HEAD");
  rmSync(join(fixture.execution, ".planning/supplier.md"));
  return { project, evidence };
}
export async function observeClosureDependency(
  fixture,
  retained,
  receipt,
  remote,
  branch,
) {
  const current = await readDependencies(retained.project, consumer);
  const input = join(fixture.execution, "../closure-dependency.json");
  writeFileSync(
    input,
    JSON.stringify(
      dependency(supplier, {
        state: "satisfied",
        resolution: {
          revision: retained.evidence,
          path: ".planning/supplier.md",
          summary:
            "Completed endpoint directly satisfies this consumer's condition.",
        },
      }),
    ),
  );
  const result = await run(retained.project, [
    "resolve-dependency",
    "--identity",
    consumer.identity,
    "--link",
    consumer.link,
    "--dependency-file",
    input,
    "--expect-dependencies",
    current.basis,
    "--plan",
    supplier.link,
    "--remote",
    remote,
    "--target",
    branch,
    "--accepted-revision",
    receipt.sha,
  ]);
  assert.equal(result.code, 0, result.stderr);
  const resolved = await readDependencies(retained.project, consumer);
  assert.equal(resolved.blocking.length, 0);
  assert.equal(resolved.dependencies[0].resolution.revision, retained.evidence);
  assert.match(
    resolved.dependencies[0].resolution.summary,
    new RegExp(receipt.sha),
  );
  assert.match(
    (
      await git(
        fixture.execution,
        "show",
        `${retained.evidence}:.planning/supplier.md`,
      )
    ).stdout,
    /CLOSED-SUPPLIER/,
  );
  return resolved;
}
