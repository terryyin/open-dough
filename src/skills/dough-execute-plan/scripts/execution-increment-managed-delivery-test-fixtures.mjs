// Shared setup for managed-delivery proofs: deployed skill, controlled CI
// adapter, and host session. Tests own observable assertions and register
// `cleanup` with `t.after`; every observer the fixture's delivery, resume, or
// mailbox start returns is stopped before the fixture is removed.
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
import { publishJson } from "./ci-mailbox-json-file.mjs";
import { readMailboxEvents } from "./ci-mailbox-store.mjs";
import { fixtureTeardown } from "./fixture-teardown-test-fixtures.mjs";
import { createCleanTrunkFixture, git } from "./publication-test-fixtures.mjs";
import { deferObserverStop, stopObserver } from "./watch-ci-test-fixtures.mjs";

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
  const teardown = fixtureTeardown(base.fixture);
  return {
    ...base,
    preferredAlias,
    cleanup: teardown.cleanup,
    ...(await installManagedDelivery(
      teardown,
      base.fixture,
      base.execution,
      platforms,
    )),
  };
}

// Installs the skill and a controlled CI adapter into an existing execution
// checkout `root`, keeping fixture-owned state under `fixture`. Every observer
// its delivery, resume, or mailbox start returns is stopped through
// `teardown` (the fixture's `fixtureTeardown`) before the fixture is removed.
export async function installManagedDelivery(
  teardown,
  fixture,
  root,
  platforms = [".agents"],
) {
  const storage = join(fixture, "mailboxes");
  const releaseName = "release.json";
  const releasePath = join(fixture, releaseName);
  const callsPath = join(fixture, "calls.jsonl");
  mkdirSync(join(root, ".planning"), { recursive: true });
  const skills = platforms.map((platform) => deploySkill(root, platform));
  const skill = skills[0];
  const adapter = writeAdapter(fixture, releasePath, callsPath);
  writeFileSync(
    join(root, ".planning/open-dough.json"),
    JSON.stringify({ ciAdapter: [process.execPath, adapter] }),
  );
  const env = {
    ...process.env,
    DOUGH_CI_MAILBOX_ROOT: storage,
  };
  process.env.DOUGH_CI_MAILBOX_ROOT = storage;
  const launcher = join(skill, "scripts/ci-mailbox.mjs");
  const observer = (directory) => ({ launcher, directory, cwd: root, env });
  // A reused observer is registered again; its later step finds it dead.
  const deferStop = (directory) => {
    if (directory) deferObserverStop(teardown, observer(directory));
  };
  const delivery = await importDelivery(skill);
  const resume = await importResume(skill);
  const { resolveCheckoutRuntime } = await importCheckoutRuntime(skill);
  const mailbox = await importMailbox(skill);
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
    root,
    storage,
    maxDurationMs: 60_000,
  };
  return {
    storage,
    skill,
    env,
    session,
    requestBase,
    async deliverManagedExecutionIncrement(request) {
      const delivered =
        await delivery.deliverManagedExecutionIncrement(request);
      deferStop(delivered.observation?.directory);
      return delivered;
    },
    async resumeManagedExecutionIncrement(request) {
      const resumed = await resume.resumeManagedExecutionIncrement(request);
      deferStop(resumed.observation?.directory);
      return resumed;
    },
    resolveCheckoutRuntime,
    async startExecutionMailbox(request, options) {
      const directory = await mailbox.startExecutionMailbox(request, options);
      deferStop(directory);
      return directory;
    },
    releaseFailure(sha, branch = "main") {
      // The adapter reads the release as soon as it exists; publish it whole
      // so discovery never parses a created but unwritten file.
      publishJson(fixture, releaseName, {
        attempts: [
          {
            runId: "run:opaque/managed",
            attemptId: "attempt:opaque/first",
            sha,
            outcome: "failure",
            url: "https://ci.example.test/run/managed",
          },
        ],
      });
      return { sha, branch };
    },
    stopObserver: (directory) => stopObserver(observer(directory)),
    stopAtTeardown: deferStop,
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
