// Shared setup for managed-delivery proofs: deployed skill, controlled CI
// adapter, and host session. Tests own observable assertions.
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  chmodSync,
  cpSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { setTimeout as pause } from "node:timers/promises";
import { readMailboxEvents } from "./ci-mailbox-store.mjs";
import { createCleanTrunkFixture, git } from "./publication-test-fixtures.mjs";

const skillRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const backlogSkillRoot = join(dirname(skillRoot), "dough-product-backlog");

export function deploySkill(project, platform = ".agents") {
  const skill = join(project, platform, "skills", "dough-execute-plan");
  mkdirSync(skill, { recursive: true });
  cpSync(skillRoot, skill, {
    recursive: true,
    filter: (path) => !/test|fixture/.test(path.slice(skillRoot.length)),
  });
  // Sibling skill required when reconciled delivery uses the backlog rebase
  // adapter; keep it beside execute-plan as a real install would.
  const backlog = join(project, platform, "skills", "dough-product-backlog");
  mkdirSync(backlog, { recursive: true });
  cpSync(backlogSkillRoot, backlog, {
    recursive: true,
    filter: (path) => !/test|fixture/.test(path.slice(backlogSkillRoot.length)),
  });
  return skill;
}

async function importDelivery(skill) {
  return import(
    pathToFileURL(join(skill, "scripts/execution-increment-delivery.mjs")).href
  );
}

async function importResume(skill) {
  return import(
    pathToFileURL(join(skill, "scripts/execution-increment-resume.mjs")).href
  );
}

async function importCheckoutRuntime(skill) {
  return import(
    pathToFileURL(join(skill, "scripts/ci-checkout-runtime.mjs")).href
  );
}

async function importMailbox(skill) {
  return import(pathToFileURL(join(skill, "scripts/ci-mailbox.mjs")).href);
}

function writeAdapter(fixture, releasePath, callsPath) {
  const adapter = join(fixture, "adapter.mjs");
  writeFileSync(
    adapter,
    `#!${process.execPath}
import { appendFileSync, readFileSync } from 'node:fs';
import { guardFixtureProcess, waitForFixtureRelease } from ${JSON.stringify(new URL("./ci-process-lifetime-test-fixtures.mjs", import.meta.url).href)};
guardFixtureProcess(${JSON.stringify(fixture)});
let input = '';
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
appendFileSync(${JSON.stringify(callsPath)}, JSON.stringify(request) + '\\n');
if (request.operation === 'discover') {
  await waitForFixtureRelease(${JSON.stringify(releasePath)});
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
  const { resumeManagedExecutionIncrement } = await importResume(skill);
  const { resolveCheckoutRuntime } = await importCheckoutRuntime(skill);
  const { startExecutionMailbox } = await importMailbox(skill);
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
    resumeManagedExecutionIncrement,
    resolveCheckoutRuntime,
    startExecutionMailbox,
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
  while (Date.now() < deadline) {
    if (existsSync(join(directory, "events"))) {
      // Read only published records, never an in-flight temporary sibling.
      const failure = readMailboxEvents(directory).find(
        ({ event }) => event.type === "CI_FAILURE",
      );
      if (failure) return failure.event;
    }
    await pause(20);
  }
  throw new Error("timed out waiting for CI_FAILURE");
}

export function watchCount(storage) {
  if (!existsSync(storage)) return 0;
  return readdirSync(storage).filter((name) => /^watch-/.test(name)).length;
}

export async function waitForPidExit(pid, timeoutMs = 5_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      process.kill(pid, 0);
    } catch {
      return true;
    }
    await pause(20);
  }
  return false;
}

export { git };
