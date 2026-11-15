// Every Open Dough script that skill guidance or a registered hook runs
// directly as `node <skill>/scripts/<entry>.mjs` behaves the same through a
// symlinked skill directory as through its real path: it performs its command
// or reports a visible refusal, never exiting 0 silently having done nothing.
// A new directly invoked entry point belongs in `entryPoints` below.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";
import { installLinkedSkills } from "./symlinked-skill-test-fixtures.mjs";

const backlogWrite = JSON.stringify({
  tool_name: "Write",
  tool_input: { file_path: ".planning/PRODUCT-BACKLOG.md" },
});

// Each entry point with an invocation that changes nothing: missing or
// invalid arguments, or a project that is not a Git repository. `guarded`
// entry points are also modules other code imports, so importing one must
// run no command.
const entryPoints = [
  { script: "dough-execute-plan/scripts/agent-commit.mjs", guarded: true },
  { script: "dough-execute-plan/scripts/execution-start.mjs", guarded: true },
  { script: "dough-execute-plan/scripts/ci-repair-stash.mjs", guarded: true },
  { script: "dough-execute-plan/scripts/ci-mailbox.mjs", guarded: true },
  {
    script: "dough-execute-plan/scripts/ci-host-hook.mjs",
    args: ["claude"],
    guarded: true,
  },
  {
    script: "dough-execute-plan/scripts/execution-increment-delivery.mjs",
    guarded: true,
  },
  {
    script: "dough-execute-plan/scripts/execution-increment-resume.mjs",
    guarded: true,
  },
  { script: "dough-execute-plan/scripts/watch-ci.mjs", guarded: true },
  {
    script: "dough-story-refinement/scripts/preparation-assignment.mjs",
    guarded: true,
  },
  {
    script: "dough-product-backlog/scripts/product-backlog-guard-hook.mjs",
    projectArg: true,
    input: backlogWrite,
    guarded: true,
  },
  { script: "dough-product-backlog/scripts/product-backlog.mjs" },
  {
    script: "dough-product-backlog/scripts/product-backlog-git-merge.mjs",
    args: ["merge", "--ref", "main"],
  },
  {
    script: "dough-product-backlog/scripts/product-backlog-git-rebase.mjs",
    args: ["rebase", "--ref", "main"],
  },
  {
    script: "dough-product-backlog/scripts/product-backlog-git-cherry-pick.mjs",
    args: ["pick", "--ref", "main"],
  },
];

function run(args, { cwd, input = "", env = process.env }) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd, env });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    // An entry point that refuses its arguments can exit before its input is
    // written; its exit and output are what this test observes.
    child.stdin.on("error", (error) => {
      if (error.code !== "EPIPE") reject(error);
    });
    child.on("close", (code) => resolve({ code, stdout, stderr }));
    child.stdin.end(input);
  });
}

test("every directly invoked Open Dough script behaves through a symlinked skill directory as through its real path, never silently, and importing a guarded one runs nothing", async (t) => {
  const project = mkdtempSync(join(tmpdir(), "symlinked-skill-entry-"));
  t.after(() => rmSync(project, { recursive: true, force: true }));
  const pathsOf = installLinkedSkills(project);
  const observed = await Promise.all(
    entryPoints.map(
      async ({ script, args = [], projectArg, input, guarded }) => {
        const { real, linked } = pathsOf(script);
        const argv = projectArg ? [project, ...args] : args;
        const [throughLink, throughReal] = await Promise.all([
          run([linked, ...argv], { cwd: project, input }),
          run([real, ...argv], { cwd: project, input }),
        ]);
        const imported =
          guarded &&
          (await run(
            [
              "--input-type=module",
              "-e",
              "await import(process.env.ENTRY_URL)",
            ],
            {
              cwd: project,
              env: { ...process.env, ENTRY_URL: pathToFileURL(linked).href },
            },
          ));
        return { script, throughLink, throughReal, imported };
      },
    ),
  );
  const silent = observed.filter(
    ({ throughLink }) =>
      throughLink.code === 0 && !`${throughLink.stdout}${throughLink.stderr}`,
  );
  assert.deepEqual(
    silent.map(({ script }) => script),
    [],
    "exited 0 with no output through the symlinked skill directory",
  );
  for (const { script, throughLink, throughReal, imported } of observed) {
    assert.deepEqual(throughLink, throughReal, script);
    if (imported)
      assert.deepEqual(
        imported,
        { code: 0, stdout: "", stderr: "" },
        `importing ${script}`,
      );
  }
});
