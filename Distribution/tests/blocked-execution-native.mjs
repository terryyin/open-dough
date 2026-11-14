// Opt-in native command journey. Origin: SEED-324's preserved consumer waiting
// on a paused supplier; synthetic invoice evidence keeps that decision small.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  watch,
  existsSync,
  renameSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { readHostStreamText } from "./support/native-host-stream.mjs";
import {
  prepareHeldNativeProject,
  heldNativeInput,
} from "./support/blocked-execution-native-project.mjs";
import {
  execute,
  digestFile,
  readHold,
} from "../src/skills/dough-execute-plan/scripts/blocked-execution-store.mjs";
import { CodexConnection } from "../src/skills/dough-execute-plan/scripts/codex-rpc.mjs";

if (process.argv[2] !== "--native" || !process.argv[3]) {
  throw new Error(
    "Explicit paid journey: node Distribution/tests/blocked-execution-native.mjs --native RESULTS_DIRECTORY",
  );
}
const root = resolve(process.argv[3]);
mkdirSync(root, { recursive: true });
const save = (name, value) =>
  writeFileSync(join(root, name), `${JSON.stringify(value, null, 2)}\n`);
const { workspace, installed, revision } = await prepareHeldNativeProject(
  root,
  save,
);
const prompt =
  "Finish this consumer's invoice report in this directory. Use the subtotal and currency in consumer-work.json and the tax rate from supplier-evidence.json. The tax evidence is usable only when its status is ready and checked is true. Put subtotal, tax amount, total, currency and the supplier evidence reference in final-report.json. The existing verify-local.mjs checks accepted local work. If evidence is insufficient, preserve the current work and explain the exact missing evidence for this assignment. Work only in this disposable directory; do not commit or publish.";
save("initial-input.json", { text: prompt });
const child = spawn("codex", ["exec", "--json", "-C", workspace, prompt], {
  cwd: workspace,
  stdio: ["ignore", "pipe", "pipe"],
});
let stream = "";
child.stdout.on("data", (chunk) => {
  stream += chunk;
  writeFileSync(join(root, "initial-events.jsonl"), stream);
});
child.stderr.on("data", (chunk) => {
  writeFileSync(join(root, "initial-stderr.txt"), chunk, { flag: "a" });
});
const [code] = await once(child, "exit");
assert.equal(code, 0, "native initial assignment must end normally");
const initial = readHostStreamText("codex", stream);
save("initial-reader.json", initial);
assert.equal(initial.status, "complete");
assert.equal(existsSync(join(workspace, "final-report.json")), false);
const threadId = stream
  .split("\n")
  .filter(Boolean)
  .map((line) => JSON.parse(line))
  .find((event) => event.type === "thread.started").thread_id;
const daemon = JSON.parse(
  (await execute("codex", ["app-server", "daemon", "version"])).stdout,
);
const directory = join(root, "held-execution");
const input = heldNativeInput(
  workspace,
  revision,
  threadId,
  `unix://${daemon.socketPath}`,
);
save("hold-input.json", input);
const cli = async (command, args = []) =>
  JSON.parse(
    (
      await execute(
        process.execPath,
        [
          join(installed, "blocked-execution.mjs"),
          command,
          "--directory",
          directory,
          ...args,
        ],
        { cwd: workspace },
      )
    ).stdout,
  );
const until = (predicate) =>
  new Promise((accept, reject) => {
    const inspect = () => {
      const record = readHold(directory);
      if (predicate(record)) {
        observer.close();
        accept(record);
      } else if (record.worker?.ended) {
        observer.close();
        reject(new Error(JSON.stringify(record)));
      }
    };
    const observer = watch(directory, inspect);
    inspect();
  });
let observer;
try {
  save(
    "enrollment.json",
    await cli("start", ["--input-file", join(root, "hold-input.json")]),
  );
  assert.equal(readHold(directory).phase, "held");
  observer = new CodexConnection(
    input.continuation.endpoint,
    new AbortController().signal,
  );
  observer.on("notification", (message) => {
    if (message.params?.threadId === threadId)
      writeFileSync(
        join(root, "native-events.jsonl"),
        `${JSON.stringify(message)}\n`,
        { flag: "a" },
      );
  });
  await observer.initialize();
  const before = await observer.request("thread/resume", { threadId });
  save("native-before.json", before);
  const signal = (value) => {
    const next = join(workspace, "supplier-next.json");
    writeFileSync(next, JSON.stringify(value));
    renameSync(next, input.condition.signalFile);
    return digestFile(input.condition.signalFile);
  };
  const unchanged = signal({
    status: "paused",
    checked: false,
    notice: "supplier still paused",
  });
  await until((record) => record.observed === unchanged);
  assert.equal(
    (await observer.request("thread/read", { threadId, includeTurns: true }))
      .thread.turns.length,
    1,
  );
  const ready = {
    status: "ready",
    checked: true,
    taxRate: 0.08,
    evidence: "synthetic approved tax rule R8",
  };
  signal(ready);
  const accepted = await until((record) => record.phase === "accepted");
  save("native-accepted.json", accepted);
  signal({ ...ready, notice: "same outcome delivered again" });
  const replay = await until(
    (record) => record.signalEvents > accepted.signalEvents,
  );
  assert.equal(replay.accepted.id, accepted.accepted.id);
  const completed = await until(
    (record) => record.phase === "continued" && record.worker.ended,
  );
  save("native-completed.json", completed);
  const history = await observer.request("thread/read", {
    threadId,
    includeTurns: true,
  });
  const after = await observer.request("thread/resume", { threadId });
  save("native-history.json", history);
  save("native-after.json", after);
  assert.equal(history.thread.turns.length, 2);
  for (const key of Object.keys(completed.native.settings))
    assert.deepEqual(after[key], before[key]);
  const report = JSON.parse(readFileSync(join(workspace, "final-report.json")));
  assert.equal(report.subtotal, 125);
  assert.equal(report.taxAmount, 10);
  assert.equal(report.total, 135);
  assert.equal(report.currency, "SGD");
  await execute(process.execPath, ["verify-local.mjs"], { cwd: workspace });
  const proof = JSON.parse(
    readFileSync(join(root, "accepted-local-proof.json")),
  );
  assert.equal(
    digestFile(join(workspace, "consumer-work.json")),
    proof.consumerHash,
  );
  assert.equal(
    digestFile(join(workspace, "verify-local.mjs")),
    proof.verifierHash,
  );
  assert.equal(
    (await cli("start", ["--input-file", join(root, "hold-input.json")]))
      .alreadyEnrolled,
    true,
  );
  save("result.json", {
    result: "pass",
    threadId,
    acceptedTurn: completed.accepted.id,
    nativeTurns: history.thread.turns.map((turn) => turn.id),
    report,
    unchangedModelTurns: 0,
    continuationTurns: 1,
    developerRescues: 0,
    boundary:
      "installed command-level path; full skill workflow comparison remains separate",
  });
  process.stdout.write(
    `${JSON.stringify({ result: "pass", root, threadId, acceptedTurn: completed.accepted.id })}\n`,
  );
} catch (error) {
  save("result.json", {
    result: "incomplete",
    threadId,
    error: String(error),
    held: existsSync(join(directory, "hold.json"))
      ? readHold(directory)
      : undefined,
  });
  if (
    existsSync(join(directory, "hold.json")) &&
    !readHold(directory).worker?.ended
  )
    await cli("stop");
  throw error;
} finally {
  observer?.close();
}
