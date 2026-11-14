#!/usr/bin/env node
import { fork } from "node:child_process";
import {
  readFileSync,
  mkdirSync,
  existsSync,
  writeFileSync,
  rmSync,
  watch,
} from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { randomUUID } from "node:crypto";
import { isDirectCliEntry } from "./ci-direct-entry.mjs";
import {
  readHold,
  writeHold,
  writeJsonFile,
  validateInput,
  verifyExecution,
  verifySameExecution,
  pastHold,
  holdCommand,
} from "./blocked-execution-store.mjs";
import { HeldCodexConnection } from "./blocked-execution-codex.mjs";

const liveWorker = (record) => {
  if (record.worker?.ended || !record.worker?.pid) return false;
  try {
    process.kill(record.worker.pid, 0);
    return true;
  } catch {
    return false;
  }
};

async function rearmLiveWorker(previous, input, directory) {
  verifySameExecution(previous, input);
  if (previous.phase !== "accepted")
    throw new Error("Only the accepted continuation may rearm its live hold.");
  const token = randomUUID();
  return await new Promise((accept, reject) => {
    const inspect = () => {
      const file = join(directory, "rearm-ack.json");
      if (existsSync(file)) {
        const ack = JSON.parse(readFileSync(file, "utf8"));
        if (ack.token === token) {
          watcher.close();
          if (ack.error) reject(new Error(ack.error));
          else accept(ack);
          return;
        }
      }
      if (readHold(directory).worker?.ended) {
        watcher.close();
        reject(
          new Error(
            "The observation owner ended before rearm was confirmed; inspect the retained execution.",
          ),
        );
      }
    };
    const watcher = watch(directory, inspect);
    writeJsonFile(directory, "rearm.json", {
      token,
      generation: previous.generation,
      input,
    });
    inspect();
  });
}

export async function startHeldExecution(input, directory, rearm = false) {
  validateInput(input);
  await verifyExecution(input);
  let previous;
  if (existsSync(join(directory, "hold.json"))) {
    previous = readHold(directory);
    verifySameExecution(previous, input);
    if (!rearm) return { ...previous, directory, alreadyEnrolled: true };
    if (liveWorker(previous))
      return await rearmLiveWorker(previous, input, directory);
    if (previous.phase !== "continued")
      throw new Error(
        "Reconcile unresolved acceptance before rearming this execution.",
      );
  } else if (rearm) throw new Error("No retained execution exists to rearm.");
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const enrollment = join(directory, "enrollment.lock");
  mkdirSync(enrollment);
  try {
    const history = previous
      ? [...(previous.history ?? []), pastHold(previous)]
      : [];
    writeHold(directory, {
      schemaVersion: 1,
      generation: randomUUID(),
      input,
      phase: "held",
      observed: input.condition.observed,
      history,
    });
    rmSync(join(directory, "stop.json"), { force: true });
    const child = fork(
      fileURLToPath(import.meta.url),
      ["watch", "--directory", directory],
      {
        cwd: input.execution.workspace,
        detached: true,
        stdio: ["ignore", "ignore", "ignore", "ipc"],
      },
    );
    return await new Promise((accept, reject) => {
      child.once("message", (message) => {
        child.unref();
        accept(message);
      });
      child.once("error", reject);
      child.once("exit", (code) =>
        reject(new Error(`Hold worker exited before enrollment (${code}).`)),
      );
    });
  } finally {
    rmSync(enrollment, { recursive: true });
  }
}

export async function reconcileHeldExecution(directory) {
  const record = readHold(directory);
  if (liveWorker(record))
    throw new Error(
      "The retained worker still owns observation; inspect status instead of creating a competing owner.",
    );
  if (!record.pending) return record;
  await verifyExecution(record.input);
  const native = new HeldCodexConnection(
    record.input,
    new AbortController().signal,
  );
  try {
    await native.initialize();
    const accepted = await native.accepted(record.pending.text);
    if (accepted) {
      record.accepted = accepted;
      record.phase = accepted.status === "completed" ? "continued" : "accepted";
      delete record.attention;
    } else {
      record.phase = "uncertain";
      record.attention = {
        reason:
          "Native history does not establish this input's acceptance; it was not resent.",
        owner: record.input.nextObservation.owner,
        recovery: record.input.nextObservation.recovery,
        recoveryCommand: holdCommand("reconcile", directory),
      };
    }
    writeHold(directory, record);
    return record;
  } finally {
    native.close();
  }
}

export async function runBlockedExecutionCli(argv) {
  const [command, ...args] = argv;
  const { values } = parseArgs({
    args,
    options: {
      directory: { type: "string" },
      "input-file": { type: "string" },
    },
  });
  if (!values.directory)
    throw new Error("Supply the absolute retained hold --directory.");
  const directory = resolve(values.directory);
  if (command === "watch") {
    const { watchHeldExecution } =
      await import("./blocked-execution-worker.mjs");
    await watchHeldExecution(directory);
    return;
  }
  let result;
  if (command === "start" || command === "rearm") {
    if (!values["input-file"])
      throw new Error(
        "Supply --input-file with this execution's retained context.",
      );
    const input = JSON.parse(readFileSync(values["input-file"], "utf8"));
    result = await startHeldExecution(input, directory, command === "rearm");
  } else if (command === "status") result = readHold(directory);
  else if (command === "reconcile")
    result = await reconcileHeldExecution(directory);
  else if (command === "stop") {
    const record = readHold(directory);
    if (liveWorker(record))
      writeFileSync(join(directory, "stop.json"), "{}\n", { mode: 0o600 });
    result = {
      directory,
      phase: record.phase,
      stopRequested: liveWorker(record),
      worker: record.worker,
    };
  } else throw new Error("Use start, rearm, status, reconcile or stop.");
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

if (isDirectCliEntry(import.meta.url, process.argv[1])) {
  try {
    await runBlockedExecutionCli(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${String(error)}\n`);
    process.exitCode = 1;
  }
}
