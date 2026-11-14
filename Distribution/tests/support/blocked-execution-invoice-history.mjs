// Exact persisted-session readiness and native history for the invoice execution.
import assert from "node:assert/strict";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { createHash } from "node:crypto";
import { invoiceSessionReady } from "./blocked-execution-workflow-ownership.mjs";
import { codexSessionSettings } from "./native-codex-session.mjs";

export function completedInvoiceAttention(observation, record, threadId) {
  if (
    !observation.ancestry.has(threadId) ||
    record?.input?.continuation?.threadId !== threadId ||
    !record.worker?.ended ||
    !record.attention?.recoveryCommand?.length
  )
    return undefined;
  const receipt = [record, ...(record.history ?? []).toReversed()].find(
    (generation) =>
      generation.pending?.purpose === "attention" && generation.accepted?.id,
  );
  if (!receipt) return undefined;
  const history = observation.histories.get(threadId);
  const turns = [
    ...observation.events
      .filter(
        (event) =>
          event.method === "turn/completed" &&
          event.params?.threadId === threadId,
      )
      .map((event) => event.params.turn),
    ...(history?.id === threadId ? history.turns : []),
  ].filter((turn) => turn.id === receipt.accepted.id);
  if (
    !turns.some((turn) => turn.status === "completed") ||
    turns.some((turn) => ["failed", "interrupted"].includes(turn.status))
  )
    return undefined;
  return {
    ...record,
    observedAttention: {
      generation: receipt.generation,
      threadId,
      turnId: receipt.accepted.id,
      status: "completed",
    },
  };
}

export async function readInvoiceHistory(observation, threadId, name) {
  assert.ok(
    observation.ancestry.has(threadId),
    "Only the exact native execution tree is read",
  );
  if (!observation.threads.has(threadId)) {
    try {
      const metadata = await observation.connection.request("thread/read", {
        threadId,
        includeTurns: false,
      });
      assert.equal(metadata.thread.id, threadId);
      observation.trackRollout(metadata.thread);
    } catch (error) {
      if (
        error.code !== -32603 ||
        !/^failed to read thread: thread-store internal error: failed to read session metadata .* is empty$/.test(
          error.message,
        )
      )
        throw error;
    }
  }
  if (!invoiceSessionReady(observation.threads.get(threadId), threadId)) {
    const reason = "Exact native session metadata is not persisted yet";
    observation.historyLimits.set(threadId, reason);
    return {
      id: threadId,
      cwd: observation.workspace,
      turns: [],
      historyUnavailable: reason,
    };
  }
  let value;
  try {
    value = await observation.connection.request("thread/read", {
      threadId,
      includeTurns: true,
    });
    observation.historyLimits.delete(threadId);
  } catch (error) {
    if (
      error.code !== -32601 ||
      error.message !== "list_turns is not supported yet"
    )
      throw error;
    value = await observation.connection.request("thread/read", {
      threadId,
      includeTurns: false,
    });
    observation.historyLimits.set(threadId, error.message);
    value.thread.historyUnavailable = error.message;
  }
  assert.equal(value.thread.id, threadId);
  assert.equal(value.thread.cwd, observation.workspace);
  observation.histories.set(threadId, value.thread);
  for (const turn of value.thread.turns)
    observation.ownership.observed(threadId, turn);
  observation.trackRollout(value.thread);
  if (name)
    writeFileSync(
      join(observation.root, `${name}.json`),
      `${JSON.stringify(value, null, 2)}\n`,
    );
  return value.thread;
}

// Final-only reuse of the shared saved-session reader. Raw copies stay private.
export function retainFinalInvoiceSessions(observation, threadId, results) {
  const owned = [...observation.ancestry.keys()];
  for (const id of owned) {
    const history = observation.histories.get(id);
    assert.ok(
      history && !history.historyUnavailable,
      `final readable history for ${id}`,
    );
    const turns = [...observation.ownership.turns.values()].filter(
      (turn) => turn.threadId === id,
    );
    assert.ok(
      turns.length &&
        turns.every((turn) =>
          ["completed", "failed", "interrupted"].includes(turn.status),
        ),
      `owned native turns must be terminal before saved-session evidence: ${id}`,
    );
    assert.ok(
      observation.threads.get(id),
      `exact owned rollout path for ${id}`,
    );
  }
  const directory = join(results, "private-native-records");
  mkdirSync(directory, { recursive: true });
  const recordHashes = owned.map((id) => {
    const path = observation.threads.get(id);
    copyFileSync(path, join(directory, basename(path)));
    return {
      threadId: id,
      sha256: createHash("sha256").update(readFileSync(path)).digest("hex"),
    };
  });
  const threads = owned.map((id) => {
    const saved = codexSessionSettings(id, directory);
    assert.ok(saved, `saved native settings for ${id}`);
    return {
      threadId: id,
      version: saved.version,
      originator: saved.originator,
      settings: saved.settings,
      workers: saved.workers.map(({ thread, parent }) => ({ thread, parent })),
    };
  });
  const expected = owned
    .filter((id) => id !== threadId)
    .map((id) => [id, observation.ancestry.get(id)])
    .sort();
  const recorded = threads
    .find((thread) => thread.threadId === threadId)
    .workers.map(({ thread, parent }) => [thread, parent])
    .sort();
  return {
    reader: "native-codex-session.mjs",
    scope: "explicit known owned final records",
    threads,
    recordHashes,
    workerAncestryMatches:
      JSON.stringify(expected) === JSON.stringify(recorded),
  };
}
