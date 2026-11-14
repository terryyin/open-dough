import {
  mkdtempSync,
  realpathSync,
  writeFileSync,
  readFileSync,
  existsSync,
  watch,
  renameSync,
} from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { materializeLocalCheckout } from "../../../../tests/support/repository-fixture.mjs";
import {
  installFakeCodex,
  codexEndpoint,
} from "../../../../dashboard/tests/support/fakeCodex.ts";
import { fixtureTeardown } from "./fixture-teardown-test-fixtures.mjs";
import { digestFile, readHold } from "./blocked-execution-store.mjs";

const execute = promisify(execFile);
const entry = fileURLToPath(
  new URL("./blocked-execution.mjs", import.meta.url),
);

export async function heldFixture(t, arrange = (builder) => builder) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "held-execution-")));
  const teardown = fixtureTeardown(root);
  t.after(teardown.cleanup);
  const repo = await materializeLocalCheckout(
    t,
    makeMe.aRepository
      .withRevision("base", {
        files: {
          "partial.txt": "accepted partial work\n",
          "authority.txt": "consumer-agent owns SEED-001#consumer\n",
        },
      })
      .please(),
  );
  const workspace = repo.integration;
  const native = await installFakeCodex(root, process.env.PATH, true);
  teardown.defer(() => native.close());
  native.cwd = workspace;
  native.history = [{ id: "held-turn", status: "completed", items: [] }];
  const signalFile = join(workspace, "supplier.json");
  const checker = join(root, "check-condition.mjs");
  writeFileSync(
    checker,
    `import fs from 'node:fs';
const value=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
process.stdout.write(JSON.stringify({satisfied:value.status==='ready'&&value.checked===true&&
(process.argv[3]!=='require-contract'||value.contract===true),
evidence:value.checked===true?'checked supplier outcome':'supplier outcome still lacks proof'}));\n`,
  );
  writeFileSync(
    signalFile,
    JSON.stringify({ status: "paused", checked: false }),
  );
  const revision = (
    await execute("git", ["rev-parse", "HEAD"], { cwd: workspace })
  ).stdout.trim();
  const builder = makeMe.aHeldExecution
    .identifiedAs("SEED-001#consumer")
    .ownedBy("consumer-agent")
    .inCheckout(workspace, revision)
    .authorizedBy({
      description:
        "The original task authorizes this same consumer; authority.txt records its owner.",
      file: join(workspace, "authority.txt"),
      sha256: digestFile(join(workspace, "authority.txt")),
    })
    .withAcceptedProof({
      revision,
      command: "verify-partial",
      result: "passed",
    })
    .withUnfinishedWork("complete the consumer after supplier evidence")
    .withOutstandingProof("consumer integration and applicable CI receipt")
    .waitingForSupplier({
      description: "supplier outcome ready with checked proof",
      signalFile,
      observed: digestFile(signalFile),
      check: [process.execPath, checker, signalFile],
    })
    .continuingInCodex(native.threadId, codexEndpoint(native))
    .observedBy(
      "consumer-agent",
      "Inspect retained native history and continue this same execution.",
    );
  const input = arrange(builder, {
    root,
    workspace,
    signalFile,
    checker,
    revision,
  }).please();
  const directory = join(root, "hold");
  const inputFile = join(root, "input.json");
  const commandEnvironment = { ...process.env };
  const cli = async (command, extra = []) => {
    const result = await execute(
      process.execPath,
      [entry, command, "--directory", directory, ...extra],
      { cwd: workspace, env: commandEnvironment },
    );
    return JSON.parse(result.stdout);
  };
  const start = async () => {
    writeFileSync(inputFile, JSON.stringify(input));
    const receipt = await cli("start", ["--input-file", inputFile]);
    return receipt;
  };
  const until = (predicate) =>
    new Promise((resolve, reject) => {
      const inspect = () => {
        if (!existsSync(join(directory, "hold.json"))) return;
        const state = readHold(directory);
        if (predicate(state)) {
          watcher.close();
          resolve(state);
        } else if (state.worker?.ended) {
          watcher.close();
          reject(
            new Error(
              `Hold ended before observation: ${JSON.stringify(state)}`,
            ),
          );
        }
      };
      const watcher = watch(existsSync(directory) ? directory : root, inspect);
      inspect();
    });
  const signal = (value) => {
    const next = join(workspace, "supplier-next.json");
    writeFileSync(next, JSON.stringify(value));
    renameSync(next, signalFile);
    return digestFile(signalFile);
  };
  const complete = (id = "native-turn-id") => {
    const turn = native.history.find((item) => item.id === id);
    turn.status = "completed";
    for (const socket of native.sockets)
      socket.send(
        JSON.stringify({
          method: "turn/completed",
          params: { threadId: native.threadId, turn },
        }),
      );
  };
  teardown.defer(async () => {
    if (!existsSync(join(directory, "hold.json"))) return;
    if (!readHold(directory).worker?.ended) {
      await cli("stop");
      await until((state) => state.worker?.ended);
    }
  });
  return {
    root,
    workspace,
    native,
    directory,
    input,
    inputFile,
    commandEnvironment,
    cli,
    start,
    until,
    signal,
    complete,
    read: () => readHold(directory),
    partial: () => readFileSync(join(workspace, "partial.txt"), "utf8"),
    submissions: () =>
      native.calls.filter((call) => call.method === "turn/start"),
  };
}
