// Shared setup for managed-delivery proofs: deployed skill, controlled CI
// adapter, and host session. Tests own observable assertions.
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  chmodSync,
  cpSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { setTimeout as pause } from "node:timers/promises";
import { createCleanTrunkFixture, git } from "./publication-test-fixtures.mjs";

const skillRoot = dirname(dirname(fileURLToPath(import.meta.url)));

export function deploySkill(project, platform = ".agents") {
  const skill = join(project, platform, "skills", "dough-execute-plan");
  mkdirSync(skill, { recursive: true });
  cpSync(skillRoot, skill, {
    recursive: true,
    filter: (path) => !/test|fixture/.test(path.slice(skillRoot.length)),
  });
  return skill;
}

async function importDelivery(skill) {
  return import(
    pathToFileURL(join(skill, "scripts/execution-increment-delivery.mjs")).href
  );
}

async function importCheckoutRuntime(skill) {
  return import(
    pathToFileURL(join(skill, "scripts/ci-checkout-runtime.mjs")).href
  );
}

function writeAdapter(fixture, releasePath, callsPath) {
  const adapter = join(fixture, "adapter.mjs");
  writeFileSync(
    adapter,
    `#!${process.execPath}
import { appendFileSync, existsSync, readFileSync, watch } from 'node:fs';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
appendFileSync(${JSON.stringify(callsPath)}, JSON.stringify(request) + '\\n');
if (request.operation === 'discover') {
  if (!existsSync(${JSON.stringify(releasePath)})) await new Promise(resolve => {
    const watcher = watch(${JSON.stringify(fixture)}, () => {
      if (existsSync(${JSON.stringify(releasePath)})) { watcher.close(); resolve(); }
    });
    if (existsSync(${JSON.stringify(releasePath)})) { watcher.close(); resolve(); }
  });
  const release = JSON.parse(readFileSync(${JSON.stringify(releasePath)}, 'utf8'));
  process.stdout.write(JSON.stringify({ attempts: release.attempts }));
} else {
  process.stdout.write(JSON.stringify({ excerpt: 'controlled semantic failure' }));
}
`,
    { mode: 0o700 },
  );
  chmodSync(adapter, 0o700);
  return adapter;
}

export async function createManagedFixture({
  platforms = [".agents"],
  preferredAlias,
} = {}) {
  const base = await createCleanTrunkFixture();
  const storage = join(base.fixture, "mailboxes");
  const releasePath = join(base.fixture, "release.json");
  const callsPath = join(base.fixture, "calls.jsonl");
  mkdirSync(join(base.execution, ".planning"), { recursive: true });
  const skills = platforms.map((platform) =>
    deploySkill(base.execution, platform),
  );
  const skill = skills[0];
  const adapter = writeAdapter(base.fixture, releasePath, callsPath);
  writeFileSync(
    join(base.execution, ".planning/open-dough.json"),
    JSON.stringify({ ciAdapter: [process.execPath, adapter] }),
  );
  const env = {
    ...process.env,
    DOUGH_CI_MAILBOX_ROOT: storage,
  };
  process.env.DOUGH_CI_MAILBOX_ROOT = storage;
  const { deliverManagedExecutionIncrement } = await importDelivery(skill);
  const { resolveCheckoutRuntime } = await importCheckoutRuntime(skill);
  const session = {
    conversation_id: "managed-coordinator",
    session_id: "managed-coordinator",
    generation_id: "managed-turn",
  };
  const requestBase = {
    host: "cursor",
    session,
    authority: "publish",
    env,
    root: base.execution,
    storage,
    maxDurationMs: 60_000,
  };
  return {
    ...base,
    storage,
    skill,
    env,
    session,
    preferredAlias,
    requestBase,
    deliverManagedExecutionIncrement,
    resolveCheckoutRuntime,
    releaseFailure(sha, branch = "main") {
      writeFileSync(
        releasePath,
        JSON.stringify({
          attempts: [
            {
              runId: "run:opaque/managed",
              attemptId: "attempt:opaque/first",
              sha,
              outcome: "failure",
              url: "https://ci.example.test/run/managed",
            },
          ],
        }),
      );
      return { sha, branch };
    },
    async stopObserver(directory) {
      if (!directory) return;
      const child = spawn(
        process.execPath,
        [join(skill, "scripts/ci-mailbox.mjs"), "stop", directory],
        { cwd: base.execution, env, stdio: "ignore" },
      );
      await once(child, "exit");
    },
  };
}

export async function waitForFailureEvent(directory, timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  const events = join(directory, "events");
  while (Date.now() < deadline) {
    if (existsSync(events)) {
      for (const name of readdirSync(events).sort()) {
        const record = JSON.parse(readFileSync(join(events, name), "utf8"));
        const event = record.event ?? record;
        if (event.type === "CI_FAILURE") return event;
      }
    }
    await pause(20);
  }
  throw new Error("timed out waiting for CI_FAILURE");
}

export { git };
