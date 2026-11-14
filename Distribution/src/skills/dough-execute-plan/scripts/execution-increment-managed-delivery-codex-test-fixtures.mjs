// Codex view of a managed-delivery fixture: the installed stream command a
// coordinator arms with its own `--coordinator`, the documented yielded cell
// run against that stream, and the retained inputs its deliveries pass.
import { spawn } from "node:child_process";
import { join } from "node:path";
import { readDeliveryProgress } from "./ci-mailbox.mjs";
import { isLiveMatchingMailbox } from "./ci-mailbox-match.mjs";
import { createCodexReplay } from "./ci-codex-lifecycle-test-fixtures.mjs";
import {
  processBackedCodexTools,
  runDocumentedCodexHostBinding,
} from "./ci-notify-codex-test-fixtures.mjs";
import { deferChildExit } from "./fixture-teardown-test-fixtures.mjs";
import {
  awaitSignalWhileRunning,
  settledProbe,
} from "./process-lifetime-test-fixtures.mjs";

// What a coordinator's observer note supplies to `deliver --host codex`.
export const retained = (coordinator, directory) => [
  "--coordinator",
  coordinator,
  "--observer-directory",
  directory,
];

export const isLiveStream = (fixture, directory, branch = "main") =>
  isLiveMatchingMailbox(directory, {
    repo: "owner/project",
    branch,
    root: fixture.execution,
    storage: fixture.storage,
  });

// The installed stream command of `skill` a Codex coordinator runs in its
// yielded cell. Without a `coordinator`, the stream is armed as before that
// input existed.
export function installedStream(
  fixture,
  { coordinator, branch = "main", skill = fixture.skill } = {},
) {
  return createCodexReplay(fixture.teardown, fixture.env, {
    command: [
      join(skill, "scripts/ci-mailbox.mjs"),
      "stream",
      "--execution",
      "owner/project",
      branch,
      "60000",
      ...(coordinator ? ["--coordinator", coordinator] : []),
    ],
  });
}

// Arms that stream and returns its receipt.
export async function armStream(fixture, options = {}) {
  const { directory, pid } = await installedStream(fixture, options).setup();
  return { directory, pid, coordinator: options.coordinator };
}

// Runs the documented yielded cell for `coordinator` against the installed
// stream and resolves once its output or late notification reports the mailbox.
// A ready initial output stays at its first yield until `resume()`, modeling
// a coordinator between boundaries. With delayed output, the cell continues
// after that yield so its late notification can establish readiness.
export async function armDocumentedStream(
  fixture,
  coordinator,
  { yieldBeforeOutput = false } = {},
) {
  const { teardown, env, skill } = fixture;
  let resume;
  const boundary = new Promise((resolve) => {
    resume = resolve;
  });
  let stream;
  const host = processBackedCodexTools({
    env,
    skill,
    yieldBeforeOutput,
    placeholders: { "OWNER/REPO": "owner/project", COORDINATOR: coordinator },
    startStream: (nodeArguments) => {
      stream = spawn(process.execPath, nodeArguments, { env });
      return stream;
    },
  });
  const notifications = [];
  const stores = [];
  let initial;
  let watching;
  const watched = new Promise((resolve) => {
    watching = resolve;
  });
  const binding = runDocumentedCodexHostBinding({
    load: () => undefined,
    store: (key, value) => stores.push([key, value]),
    text: (value) => {
      initial = value;
      if (value.status === "watching") watching(value);
    },
    notify: (event) => {
      notifications.push(event);
      if (event.type === "CI_OBSERVER_READY") watching(event);
    },
    yield_control: () => (yieldBeforeOutput ? Promise.resolve() : boundary),
    tools: host.tools,
  });
  // The cell launched its stream before its first wait. Teardown steps run in
  // reverse: release the cell, end its stream, await the cell.
  teardown.defer(() => binding);
  deferChildExit(teardown, stream);
  teardown.defer(resume);
  const { directory, pid } = await Promise.race([
    watched,
    binding.then(() => {
      throw new Error("binding ended before reporting its mailbox");
    }),
  ]);
  const ended = settledProbe(binding);
  return {
    coordinator,
    initial,
    directory,
    pid,
    host,
    binding,
    notifications,
    stores,
    resume,
    // Resolves once the cell acknowledged its records through `sequence`.
    acknowledged: (sequence) =>
      awaitSignalWhileRunning(
        () => readDeliveryProgress(directory).deliveredThrough === sequence,
        ended,
        () =>
          `the cell ended at progress ${JSON.stringify(readDeliveryProgress(directory))} after notifying ${JSON.stringify(notifications)}`,
      ),
  };
}
