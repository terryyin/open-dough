import {
  readHold,
  writeHold,
  verifyExecution,
  holdCommand,
} from "./blocked-execution-store.mjs";
import { HeldCodexConnection } from "./blocked-execution-codex.mjs";
import { attention } from "./blocked-execution-attention.mjs";
import { recordHeldDelivery } from "./blocked-execution-delivery.mjs";

export const liveHeldWorker = (record) => {
  if (record.worker?.ended || !record.worker?.pid) return false;
  try {
    process.kill(record.worker.pid, 0);
    return true;
  } catch {
    return false;
  }
};

export async function reconcileHeldExecution(directory) {
  const record = readHold(directory);
  if (liveHeldWorker(record))
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
      recordHeldDelivery(record, accepted, accepted.status === "completed");
      if (record.pending.purpose !== "attention") delete record.attention;
    } else {
      attention(
        record,
        "Native history does not establish this input's acceptance; it was not resent.",
        directory,
        {
          delivery: "uncertain",
          recoveryCommand: holdCommand("reconcile", directory),
        },
      );
      record.phase = "uncertain";
    }
    writeHold(directory, record);
    return record;
  } finally {
    native.close();
  }
}
