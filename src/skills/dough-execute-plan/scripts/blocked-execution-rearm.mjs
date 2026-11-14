import { randomUUID } from "node:crypto";
import {
  validateInput,
  verifySameExecution,
  verifyExecution,
  pastHold,
  writeHold,
  writeJsonFile,
} from "./blocked-execution-store.mjs";

// A rearm transfers the accepted turn back to the same worker. The caller keeps
// terminal events while this transition runs and reapplies them after failure.
export async function applyLiveRearm(request, context) {
  const { directory, record, native, snapshot, observeSignal, replaceWatcher } =
    context;
  let retainedSnapshot = snapshot;
  try {
    if (
      request.generation !== record.generation ||
      record.phase !== "accepted"
    ) {
      throw new Error(
        "The accepted hold changed before rearm; inspect its current owner.",
      );
    }
    validateInput(request.input);
    verifySameExecution(record, request.input);
    await verifyExecution(request.input);
    const nextSnapshot = await native.snapshot();
    if (
      JSON.stringify(nextSnapshot.settings) !==
      JSON.stringify(snapshot.settings)
    ) {
      throw new Error("Native settings changed before rearm.");
    }
    const nextWatcher = observeSignal(request.input);
    record.history.push(pastHold(record));
    record.generation = randomUUID();
    record.input = request.input;
    record.observed = request.input.condition.observed;
    record.phase = "held";
    delete record.pending;
    delete record.accepted;
    retainedSnapshot = nextSnapshot;
    record.native = retainedSnapshot;
    replaceWatcher(nextWatcher);
    writeHold(directory, record);
    writeJsonFile(directory, "rearm-ack.json", {
      token: request.token,
      phase: record.phase,
      worker: record.worker,
    });
  } catch (error) {
    writeJsonFile(directory, "rearm-ack.json", {
      token: request.token,
      error: String(error),
    });
  }
  return retainedSnapshot;
}
