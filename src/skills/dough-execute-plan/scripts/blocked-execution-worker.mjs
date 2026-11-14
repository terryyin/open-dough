import { watch, existsSync, mkdirSync, rmSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { HeldCodexConnection } from "./blocked-execution-codex.mjs";
import {
  readHold,
  writeHold,
  digestFile,
  verifyExecution,
  attention,
} from "./blocked-execution-store.mjs";
import { applyLiveRearm } from "./blocked-execution-rearm.mjs";
import { deliverHeldExecution } from "./blocked-execution-delivery.mjs";

export async function watchHeldExecution(directory) {
  const lock = join(directory, "worker.lock");
  mkdirSync(lock);
  const record = readHold(directory);
  record.worker = { pid: process.pid, ended: false };
  writeHold(directory, record);
  const abort = new AbortController();
  const native = new HeldCodexConnection(record.input, abort.signal);
  let watcher;
  let controls;
  let reconciliation;
  let snapshot;
  let active = false;
  let queued = false;
  let queuedCause;
  let ending = false;
  let stopReason;
  let rearming = false;
  let resolveEnd;
  const ended = new Promise((resolve) => {
    resolveEnd = resolve;
  });
  const completed = new Map();
  const save = () => writeHold(directory, record);
  const observeSignal = (input) => {
    const signalWatcher = watch(
      dirname(input.condition.signalFile),
      (...[, name]) => {
        if (
          name === null ||
          name === undefined ||
          name === basename(input.condition.signalFile)
        ) {
          void evaluate("file-event");
        }
      },
    );
    signalWatcher.on("error", (error) => {
      stopReason = String(error);
      void evaluate();
    });
    return signalWatcher;
  };
  const ready = () => {
    process.send?.({
      directory,
      phase: record.phase,
      worker: record.worker,
      attention: record.attention,
    });
    if (process.connected) process.disconnect();
  };
  const finish = (reason) => {
    if (ending) return;
    ending = true;
    if (reason) attention(record, reason, directory);
    save();
    resolveEnd();
  };
  const terminal = (turn) => {
    if (rearming) return;
    if (record.accepted?.id !== turn.id) return;
    record.accepted = turn;
    if (turn.status === "completed") {
      record.phase = "continued";
      finish();
    } else
      finish(
        `The accepted native turn ended ${turn.status}; its owner must inspect the saved execution.`,
      );
  };
  const evaluate = async (cause = "control") => {
    queued = true;
    queuedCause = cause;
    if (active || !snapshot || ending) return;
    active = true;
    try {
      while (queued && !ending) {
        queued = false;
        const observationCause = queuedCause;
        if (stopReason) {
          finish(stopReason);
          break;
        }
        const requestFile = join(directory, "rearm.json");
        if (existsSync(requestFile)) {
          const request = JSON.parse(readFileSync(requestFile, "utf8"));
          rearming = true;
          try {
            snapshot = await applyLiveRearm(request, {
              directory,
              record,
              native,
              snapshot,
              observeSignal,
              replaceWatcher: (next) => {
                watcher.close();
                watcher = next;
              },
            });
          } finally {
            rearming = false;
            const retainedTerminal =
              record.accepted && completed.get(record.accepted.id);
            if (retainedTerminal) terminal(retainedTerminal);
            rmSync(requestFile, { force: true });
          }
        }
        const observation = digestFile(record.input.condition.signalFile);
        if (observation !== record.lastSignal) {
          record.lastSignal = observation;
          record.lastObservationSource = observationCause;
          record.signalEvents = (record.signalEvents ?? 0) + 1;
          save();
        }
        if (record.phase !== "held") continue;
        if (observation === record.observed) continue;
        if (
          await deliverHeldExecution({
            directory,
            record,
            native,
            snapshot,
            completed,
            terminal,
            finish,
            stopReason: () => stopReason,
          })
        )
          queued = true;
      }
    } catch (error) {
      finish(String(error));
    } finally {
      active = false;
    }
  };
  native.on("notification", (message) => {
    if (
      message.method !== "turn/completed" ||
      message.params?.threadId !== record.input.continuation.threadId
    )
      return;
    const turn = message.params.turn;
    completed.set(turn.id, turn);
    terminal(turn);
    void evaluate();
  });
  native.on("disconnect", () => {
    stopReason =
      "Native delivery observation ended; inspect the retained thread and acceptance before recovery.";
    if (record.phase === "accepted") finish(stopReason);
    else void evaluate();
  });
  const stop = () => {
    stopReason = "The hold's observation owner requested a stop.";
    void evaluate();
  };
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
  try {
    await verifyExecution(record.input);
    // Enroll before reading again: changes during snapshot/enrollment stay visible.
    watcher = observeSignal(record.input);
    controls = watch(directory, (...[, name]) => {
      if (
        (name === null || name === undefined || name === "stop.json") &&
        existsSync(join(directory, "stop.json"))
      )
        stop();
      if (
        (name === null || name === undefined || name === "rearm.json") &&
        existsSync(join(directory, "rearm.json"))
      )
        void evaluate();
    });
    // This non-model fallback reconciles a changed file even when the filesystem
    // delivers no usable event. It is an observation interval, never a proof deadline.
    reconciliation = setInterval(() => {
      if (existsSync(join(directory, "stop.json"))) stop();
      void evaluate("reconciliation");
    }, 1000);
    snapshot = await native.snapshot();
    record.native = snapshot;
    save();
    if (existsSync(join(directory, "stop.json"))) stop();
    await evaluate("enrollment");
    ready();
    await ended;
  } catch (error) {
    finish(String(error));
    ready();
  } finally {
    watcher?.close();
    controls?.close();
    clearInterval(reconciliation);
    native.close();
    record.worker.ended = true;
    save();
    rmSync(lock, { recursive: true });
    process.off("SIGTERM", stop);
    process.off("SIGINT", stop);
  }
}
