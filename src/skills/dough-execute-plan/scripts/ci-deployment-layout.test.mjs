import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);
const source = fileURLToPath(new URL("../", import.meta.url));

function deployRuntime(root, platform = ".agents") {
  const skill = join(root, platform, "skills", "dough-execute-plan");
  mkdirSync(skill, { recursive: true });
  cpSync(join(source, "scripts"), join(skill, "scripts"), {
    recursive: true,
    filter: (path) => !/test|fixture/.test(path.slice(source.length)),
  });
  return skill;
}

function requireSelectedRuntimeEntrypoint(selectedRoot, skill) {
  const selectedCheckout = realpathSync(selectedRoot);
  const entrypoint = join(skill, "scripts", "ci-mailbox.mjs");
  if (!existsSync(entrypoint))
    throw new Error(
      `CI runtime is missing from selected checkout: ${entrypoint}`,
    );
  const runtimeCheckout = realpathSync(
    join(dirname(entrypoint), "../../../.."),
  );
  if (runtimeCheckout !== selectedCheckout)
    throw new Error(
      `CI runtime checkout ${runtimeCheckout} does not match selected checkout ${selectedCheckout}`,
    );
  return entrypoint;
}

async function probeSelectedRuntime(selectedRoot, skill, storage) {
  const entrypoint = requireSelectedRuntimeEntrypoint(selectedRoot, skill);
  return exec(process.execPath, [entrypoint, "probe"], {
    cwd: selectedRoot,
    env: { ...process.env, DOUGH_CI_MAILBOX_ROOT: storage },
  });
}

for (const [host, platform, event] of [
  ["cursor", ".agents", "postToolUse"],
  ["claude", ".claude", "PostToolUse"],
]) {
  test(`${host}: deployed hook fragment finds the relocated runtime in a path with spaces`, async (t) => {
    const root = realpathSync(mkdtempSync(join(tmpdir(), "dough client ")));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const skill = deployRuntime(root, platform);
    const storage = join(root, "mailboxes");
    const env = {
      ...process.env,
      DOUGH_CI_MAILBOX_ROOT: storage,
      CLAUDE_PROJECT_DIR: root,
    };
    const { stdout } = await exec(
      process.execPath,
      [join(skill, "scripts/ci-mailbox.mjs"), "probe"],
      { cwd: root, env },
    );
    const receipt = JSON.parse(stdout.slice("CI_OBSERVER ".length));
    const request = JSON.parse(
      readFileSync(join(receipt.directory, "request.json")),
    );
    assert.equal(request.root.replace(/\/$/, ""), root);
    const { hooks } = JSON.parse(
      readFileSync(join(source, "assets", `${host}-hooks.json`)),
    );
    const command =
      host === "cursor"
        ? hooks[event][0].command
        : hooks[event][0].hooks[0].command;
    const child = exec("sh", ["-c", command], {
      cwd: root,
      env,
      timeout: 5000,
    });
    child.child.stdin.end(
      JSON.stringify({
        session_id: "coordinator",
        conversation_id: "coordinator",
        generation_id: "turn",
        hook_event_name: event,
        tool_name: host === "cursor" ? "Shell" : "Bash",
        tool_output: JSON.stringify({ output: stdout }),
        tool_response: { stdout },
      }),
    );
    const output = JSON.parse((await child).stdout);
    assert.match(
      output.additional_context ?? output.hookSpecificOutput.additionalContext,
      /CI_MONITOR_READY/,
    );
  });
}

test("selected execution checkout supplies both the CI runtime and working directory", async (t) => {
  const fixture = realpathSync(mkdtempSync(join(tmpdir(), "dough checkouts ")));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  const origin = join(fixture, "origin");
  const execution = join(fixture, "execution");
  mkdirSync(origin);
  mkdirSync(execution);
  const originSkill = deployRuntime(origin);
  const executionSkill = deployRuntime(execution);
  const storage = join(fixture, "mailboxes");

  await assert.rejects(
    () => probeSelectedRuntime(execution, originSkill, storage),
    /does not match selected checkout/,
  );
  assert.equal(existsSync(storage), false);

  const { stdout } = await probeSelectedRuntime(
    execution,
    executionSkill,
    storage,
  );
  const receipt = JSON.parse(stdout.slice("CI_OBSERVER ".length));
  const request = JSON.parse(
    readFileSync(join(receipt.directory, "request.json")),
  );

  assert.equal(realpathSync(request.root), realpathSync(execution));
  assert.notEqual(realpathSync(request.root), realpathSync(origin));
});

test("missing selected-checkout runtime refuses setup before creating a mailbox", (t) => {
  const fixture = realpathSync(mkdtempSync(join(tmpdir(), "dough checkout ")));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  const execution = join(fixture, "execution");
  const missingSkill = join(
    execution,
    ".agents",
    "skills",
    "dough-execute-plan",
  );
  const storage = join(fixture, "mailboxes");
  mkdirSync(execution);

  assert.throws(
    () => requireSelectedRuntimeEntrypoint(execution, missingSkill),
    /runtime is missing from selected checkout/,
  );
  assert.equal(existsSync(storage), false);
});
