// Shared setup for observer-ownership proofs of managed delivery: two
// checkouts of one repository with their own installed runtimes, real
// observers as starting conditions, and each host's installed hook and
// `deliver` as its coordinator invokes them.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { invokeHostHook } from "./ci-host-bridge.mjs";
import { readRevisionCoverage, receiptPrefix } from "./ci-mailbox.mjs";
import { isLiveMatchingMailbox } from "./ci-mailbox-match.mjs";
import {
  createManagedFixture,
  git,
  installManagedDelivery,
} from "./execution-increment-managed-delivery-test-fixtures.mjs";
import {
  claudeHookInput,
  cursorHookInput,
  deliverThroughCli,
} from "./execution-increment-managed-delivery-cli-test-fixtures.mjs";
import { awaitWorkerState } from "./watch-ci-test-fixtures.mjs";

export const trunkTarget = "refs/heads/main";
const observed = { mode: "execution", repo: "owner/project", branch: "main" };

// How each host names a coordinator: its ambient variable, the hook input its
// tool call sends (a Cursor coordinator stays in one generation here), and
// where its hook output carries context.
export const hosts = {
  claude: {
    platform: ".claude",
    variable: "CLAUDE_CODE_SESSION_ID",
    hookInput: (id, stdout = "") =>
      claudeHookInput(id, { tool_response: { stdout } }),
    context: (output) => output.hookSpecificOutput?.additionalContext ?? "",
  },
  cursor: {
    platform: ".agents",
    variable: "CURSOR_CONVERSATION_ID",
    hookInput: (id, stdout = "") => cursorHookInput(id, `${id}-turn`, stdout),
    context: (output) => output.additional_context ?? "",
  },
};

// Two checkouts of one repository, each with its own installed runtime: the
// publisher's execution worktree and a sibling coordinator's checkout.
export async function siblingCheckouts(t, host) {
  const platforms = [hosts[host].platform];
  const fixture = await createManagedFixture({ platforms });
  t.after(fixture.cleanup);
  const sibling = await installManagedDelivery(
    fixture.teardown,
    fixture.fixture,
    fixture.integration,
    platforms,
  );
  const checkouts = {
    publisher: { runtime: fixture, root: fixture.execution },
    sibling: { runtime: sibling, root: fixture.integration },
  };
  // Only the named coordinator's ambient identity, never the test runner's.
  const env = (coordinator) => {
    const result = { ...fixture.env };
    for (const { variable } of Object.values(hosts)) delete result[variable];
    if (coordinator) result[hosts[host].variable] = coordinator;
    return result;
  };
  const options = (root) => ({ root, storage: fixture.storage });
  return {
    fixture,
    env,
    isLive: (directory) =>
      isLiveMatchingMailbox(directory, {
        ...observed,
        ...options(fixture.execution),
      }),
    // A live observer of the shared target, started from `checkout`.
    async startObserver(checkout) {
      const { runtime, root } = checkouts[checkout];
      const directory = await runtime.startExecutionMailbox(
        { ...observed, maxDurationMs: 60_000 },
        { ...options(root), env: fixture.env },
      );
      await awaitWorkerState(
        directory,
        () =>
          isLiveMatchingMailbox(directory, { ...observed, ...options(root) }),
        "it became a live observer",
      );
      return directory;
    },
    // One tool call of `coordinator` at `checkout`'s installed hook, as its
    // host reports it; `stdout` is that call's output. Returns hook context.
    async hook(checkout, coordinator, stdout = "") {
      const { runtime, root } = checkouts[checkout];
      const output = await invokeHostHook(
        host,
        hosts[host].hookInput(coordinator, stdout),
        {
          hookPath: join(runtime.skill, "scripts/ci-host-hook.mjs"),
          cwd: root,
          env: env(coordinator),
        },
      );
      return hosts[host].context(output);
    },
    // The installed `deliver` from the publisher's execution worktree.
    deliver: (base, coordinator, extra = []) =>
      deliverThroughCli(fixture, {
        base,
        host,
        extra,
        env: env(coordinator),
      }),
  };
}

export const startReceipt = (directory) =>
  `${receiptPrefix}${JSON.stringify({ directory })}\n`;

export const coverage = (directory) =>
  readRevisionCoverage(directory)
    .map(({ sha }) => sha)
    .sort();

export const revisions = (...shas) =>
  shas.map((sha) => sha.toLowerCase()).sort();

export const ownerClaim = (directory) =>
  readFileSync(join(directory, "owner"), "utf8");

export async function commitIncrement(fixture, name) {
  writeFileSync(join(fixture.execution, `${name}.txt`), `${name}\n`);
  await git(fixture.execution, "add", `${name}.txt`);
  await git(fixture.execution, "commit", "-m", `${name} increment`);
}
